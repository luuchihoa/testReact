/**
 * excelRosterHelper.js
 * Tiện ích đọc, kiểm tra và xuất file Excel danh sách học sinh
 */
import { sortStudentsByTen } from "../gradeUtils.js";

// Hàm loại bỏ dấu tiếng Việt để tạo username không dấu
function removeVietnameseTones(str) {
  if (!str) return "";
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Chuyển đổi định dạng ngày sang YYYY-MM-DD
function parseExcelDate(val) {
  if (!val) return "";

  // 1. Trường hợp là đối tượng Date
  if (val instanceof Date) {
    if (!isNaN(val.getTime())) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, "0");
      const d = String(val.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }
  
  // 2. Trường hợp Excel serial number (ví dụ: 41866)
  if (typeof val === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(excelEpoch.getTime() + val * 86400000);
    if (!isNaN(date.getTime())) {
      const y = date.getUTCFullYear();
      const m = String(date.getUTCMonth() + 1).padStart(2, "0");
      const d = String(date.getUTCDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }

  // 3. Trường hợp chuỗi text DD/MM/YYYY hoặc YYYY-MM-DD
  const str = String(val).trim();
  const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, "0");
    const m = dmyMatch[2].padStart(2, "0");
    const y = dmyMatch[3];
    return `${y}-${m}-${d}`;
  }

  const ymdMatch = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (ymdMatch) {
    const y = ymdMatch[1];
    const m = ymdMatch[2].padStart(2, "0");
    const d = ymdMatch[3].padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return "";
}

// Chuẩn hóa giới tính
function normalizeGender(val) {
  if (!val) return "";
  const s = String(val).trim().toLowerCase();
  if (s === "nam" || s === "m" || s === "male" || s === "trai") return "Nam";
  if (s === "nữ" || s === "nu" || s === "f" || s === "female" || s === "gái") return "Nữ";
  return "";
}

// Tự sinh mã học sinh duy nhất nếu file để trống
function generateAutoUsername(hoTen, ngaySinh, index) {
  const cleanName = removeVietnameseTones(hoTen || "hs")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const yearSuffix = ngaySinh ? ngaySinh.slice(2, 4) : "";
  const randomSuffix = String(Math.floor(100 + Math.random() * 900));
  return `hs_${cleanName.slice(-8)}${yearSuffix}_${index + 1}${randomSuffix.slice(0, 2)}`;
}

/**
 * Đọc file Excel và parse thành danh sách học sinh chuẩn hóa
 */
export async function parseStudentRosterExcel(file) {
  const XLSX = await getXLSX();
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });

  const firstSheetName = wb.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("File Excel không có sheet nào.");
  }

  const worksheet = wb.Sheets[firstSheetName];
  // Chuyển sheet sang mảng đối tượng với header linh hoạt
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  if (!rawRows || rawRows.length === 0) {
    throw new Error("File Excel không có dữ liệu.");
  }

  const normalizedStudents = [];
  const errors = [];
  const existingUsernamesInFile = new Set();

  rawRows.forEach((row, idx) => {
    // Tìm trường dựa trên các biến thể tiêu đề cột phổ biến
    const findField = (keys) => {
      for (const k of Object.keys(row)) {
        const cleanK = removeVietnameseTones(k).toLowerCase().replace(/[^a-z0-9]/g, "");
        for (const target of keys) {
          const cleanTarget = removeVietnameseTones(target).toLowerCase().replace(/[^a-z0-9]/g, "");
          if (cleanK.includes(cleanTarget)) return row[k];
        }
      }
      return "";
    };

    const hoVaTen = String(findField(["ho va ten", "ho ten", "ten hoc sinh", "ho va ten dem", "ho va ten hoc sinh"])).trim();
    const tenThanh = String(findField(["ten thanh", "bon mang", "thanh"])).trim();
    let rawUsername = String(findField(["ma hoc sinh", "ma hs", "username", "ten dang nhap", "tai khoan"])).trim();

    // Nếu không có Họ tên VÀ không có Tên Thánh VÀ không có Mã HS -> dòng trống hoặc định dạng dư ở cuối bảng, bỏ qua
    if (!hoVaTen && !tenThanh && !rawUsername) {
      return;
    }

    const rawNgaySinh = findField(["ngay sinh", "sinh nhat", "ngay thang nam sinh"]);
    const ngaySinh = parseExcelDate(rawNgaySinh);
    
    // Ngày các Bí tích
    const rawNgayRuaToi = findField(["ngay rua toi", "rua toi"]);
    const ngayRuaToi = parseExcelDate(rawNgayRuaToi);

    const rawNgayRuocLe = findField(["ngay ruoc le lan dau", "ngay ruoc le", "ruoc le lan dau", "ruoc le"]);
    const ngayRuocLe = parseExcelDate(rawNgayRuocLe);

    const rawNgayThemSuc = findField(["ngay them suc", "them suc"]);
    const ngayThemSuc = parseExcelDate(rawNgayThemSuc);

    // Vai trò (Mặc định 'student')
    const rawRole = String(findField(["vai tro", "role"])).trim().toLowerCase();
    const role = (rawRole === "teacher" || rawRole === "admin" || rawRole === "user") ? rawRole : "student";

    const gioiTinh = normalizeGender(findField(["gioi tinh", "phai", "sex"]));
    const tenCha = String(findField(["ten cha", "ho ten cha", "cha"])).trim();
    const tenMe = String(findField(["ten me", "ho ten me", "me"])).trim();
    const sdt = String(findField(["so dien thoai", "sdt", "dien thoai", "phone", "sdt phu huynh"])).replace(/[^0-9]/g, "");
    const giaoXom = String(findField(["giao xom", "xom", "khu giao họ", "dia chi"])).trim();

    // Kiểm tra tính hợp lệ
    const rowNum = idx + 2; // Hàng thực tế trong file Excel (bắt đầu từ 2 sau header)
    const rowErrors = [];

    if (!hoVaTen || hoVaTen.length < 2) {
      rowErrors.push(`Hàng ${rowNum}: Thiếu hoặc sai Họ và tên`);
    }

    // Xử lý mã học sinh (username)
    let username = rawUsername ? rawUsername.toLowerCase().replace(/\s+/g, "") : "";
    if (!username) {
      username = generateAutoUsername(hoVaTen, ngaySinh, idx);
    } else {
      // Kiểm tra trùng username trong cùng 1 file
      if (existingUsernamesInFile.has(username.toLowerCase())) {
        rowErrors.push(`Hàng ${rowNum}: Trùng mã học sinh "${username}" trong file`);
      }
    }
    existingUsernamesInFile.add(username.toLowerCase());

    const studentItem = {
      rowIndex: rowNum,
      username,
      ho_va_ten: hoVaTen,
      ten_thanh: tenThanh,
      ngay_sinh: ngaySinh || null,
      raw_ngay_sinh: rawNgaySinh ? String(rawNgaySinh) : "",
      ngay_rua_toi: ngayRuaToi || null,
      ngay_ruoc_le: ngayRuocLe || null,
      ngay_them_suc: ngayThemSuc || null,
      role,
      gioi_tinh: gioiTinh,
      ten_cha: tenCha,
      ten_me: tenMe,
      sdt,
      giao_xom: giaoXom,
      isValid: rowErrors.length === 0,
      errors: rowErrors,
    };

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
    }

    normalizedStudents.push(studentItem);
  });

  const validCount = normalizedStudents.filter((s) => s.isValid).length;
  const invalidCount = normalizedStudents.length - validCount;

  return {
    students: normalizedStudents,
    total: normalizedStudents.length,
    validCount,
    invalidCount,
    errors,
  };
}

/**
 * Tải file Excel mẫu chuẩn hóa về máy người dùng
 */
export async function downloadSampleExcel(lopName = "KhaiTam", namHoc = "2025-2026") {
  const XLSX = await getXLSX();

  // Dữ liệu mẫu minh họa
  const sampleData = [
    {
      "STT": 1,
      "Mã học sinh": "hs_annguyen",
      "Tên Thánh": "Giuse",
      "Họ và tên": "Nguyễn Văn An",
      "Ngày sinh (DD/MM/YYYY)": "15/08/2015",
      "Giới tính": "Nam",
      "Ngày Rửa Tội (DD/MM/YYYY)": "15/09/2015",
      "Ngày Rước Lễ Lần Đầu (DD/MM/YYYY)": "20/05/2024",
      "Ngày Thêm Sức (DD/MM/YYYY)": "",
      "Tên Cha": "Phêrô Bình",
      "Tên Mẹ": "Maria Hoa",
      "Số điện thoại": "0912345678",
      "Giáo xóm": "Xóm 1",
    },
    {
      "STT": 2,
      "Mã học sinh": "", // Để trống để test tính năng tự sinh mã
      "Tên Thánh": "Maria",
      "Họ và tên": "Trần Thị Mai",
      "Ngày sinh (DD/MM/YYYY)": "20/10/2015",
      "Giới tính": "Nữ",
      "Ngày Rửa Tội (DD/MM/YYYY)": "10/11/2015",
      "Ngày Rước Lễ Lần Đầu (DD/MM/YYYY)": "20/05/2024",
      "Ngày Thêm Sức (DD/MM/YYYY)": "",
      "Tên Cha": "Giuse Cường",
      "Tên Mẹ": "Anna Lan",
      "Số điện thoại": "0987654321",
      "Giáo xóm": "Xóm 3",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);

  // Đặt độ rộng các cột cho đẹp mắt
  ws["!cols"] = [
    { wch: 6 },  // STT
    { wch: 18 }, // Mã học sinh
    { wch: 14 }, // Tên Thánh
    { wch: 24 }, // Họ và tên
    { wch: 22 }, // Ngày sinh
    { wch: 12 }, // Giới tính
    { wch: 24 }, // Ngày Rửa Tội
    { wch: 30 }, // Ngày Rước Lễ Lần Đầu
    { wch: 24 }, // Ngày Thêm Sức
    { wch: 20 }, // Tên Cha
    { wch: 20 }, // Tên Mẹ
    { wch: 16 }, // Số điện thoại
    { wch: 16 }, // Giáo xóm
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DanhSachHocSinh");

  const safeLop = String(lopName).replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `Mau_Danh_Sach_${safeLop}_${namHoc}.xlsx`;
  return await triggerSafeExcelDownload(XLSX, wb, fileName);
}

let _xlsxPromise = null;

/**
 * Tải trước thư viện XLSX vào RAM để khi người dùng bấm nút tải,
 * thao tác download xảy ra tức thì (0ms), không bị mất User Gesture của trình duyệt.
 */
export function preloadXLSX() {
  if (!_xlsxPromise) {
    _xlsxPromise = import("xlsx");
  }
  return _xlsxPromise;
}

export async function getXLSX() {
  if (!_xlsxPromise) {
    _xlsxPromise = import("xlsx");
  }
  return await _xlsxPromise;
}

/**
 * Kích hoạt tải file Excel an toàn, chống bị trình duyệt chặn (User Activation Loss / Revoke Bug):
 * 1. Ưu tiên sử dụng File System Access API (showSaveFilePicker) trên Chrome/Edge để mở hộp thoại lưu file chính chủ của HĐH.
 *    -> Biết chắc chắn 100% khi người dùng đã lưu thành công hoặc bấm Huỷ.
 * 2. Fallback sang Blob URL an toàn cho Safari / Firefox / Mobile, trì hoãn revoke 10s.
 */
export async function triggerSafeExcelDownload(XLSX, wb, fileName) {
  try {
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    // 1. Nếu trình duyệt hỗ trợ Native File System Access API (Chrome, Edge, Cốc Cốc, Brave...)
    if (typeof window !== "undefined" && "showSaveFilePicker" in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: "Tệp bảng tính Excel (*.xlsx)",
              accept: {
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
              },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return { success: true, method: "picker", fileName };
      } catch (err) {
        if (err.name === "AbortError") {
          return { success: false, cancelled: true };
        }
        console.warn("showSaveFilePicker declined or failed, falling back to blob anchor:", err);
      }
    }

    // 2. Hỗ trợ IE/Edge cũ nếu có
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, fileName);
      return { success: true, method: "msSave", fileName };
    }

    // 3. Fallback cho Safari, Firefox hoặc khi API bị từ chối
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = fileName;
    a.rel = "noopener";
    a.target = "_self";
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      try {
        if (a.parentNode) a.parentNode.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    }, 10000);

    return { success: true, method: "anchor", fileName };
  } catch (err) {
    console.error("triggerSafeExcelDownload error, fallback to XLSX.writeFile:", err);
    XLSX.writeFile(wb, fileName);
    return { success: true, method: "fallback", fileName };
  }
}

/**
 * Xuất danh sách học sinh của một lớp học cụ thể ra file Excel (.xlsx)
 * Sắp xếp theo Tên (ví dụ: Anh đứng trước Bình) và không bao gồm cột username
 */
export async function exportClassRosterExcel(lopName, namHoc, roster) {
  const XLSX = await getXLSX();

  const formatDateVN = (val) => {
    if (!val) return "";
    const parts = String(val).split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${parts[0]}`;
    }
    return String(val);
  };

  // Sắp xếp theo Tên tiếng Việt (Anh đứng trên Bình)
  const sortedRoster = sortStudentsByTen(roster || []);

  const data = sortedRoster.map((s, idx) => ({
    "STT": idx + 1,
    "Tên Thánh": s.tenThanh || "",
    "Họ và tên": s.hoTen || "",
    "Ngày sinh (DD/MM/YYYY)": formatDateVN(s.ngaySinh),
    "Giới tính": s.gioiTinh || "",
    "Ngày Rửa Tội (DD/MM/YYYY)": formatDateVN(s.ngayRuaToi),
    "Ngày Rước Lễ Lần Đầu (DD/MM/YYYY)": formatDateVN(s.ngayRuocLe),
    "Ngày Thêm Sức (DD/MM/YYYY)": formatDateVN(s.ngayThemSuc),
    "Tên Cha": s.tenCha || "",
    "Tên Mẹ": s.tenMe || "",
    "Số điện thoại": s.sdt || "",
    "Giáo xóm": s.giaoXom || "",
  }));

  const ws = XLSX.utils.json_to_sheet(data);

  ws["!cols"] = [
    { wch: 6 },  // STT
    { wch: 14 }, // Tên Thánh
    { wch: 24 }, // Họ và tên
    { wch: 22 }, // Ngày sinh
    { wch: 12 }, // Giới tính
    { wch: 24 }, // Ngày Rửa Tội
    { wch: 30 }, // Ngày Rước Lễ Lần Đầu
    { wch: 24 }, // Ngày Thêm Sức
    { wch: 20 }, // Tên Cha
    { wch: 20 }, // Tên Mẹ
    { wch: 16 }, // Số điện thoại
    { wch: 16 }, // Giáo xóm
  ];

  const wb = XLSX.utils.book_new();
  const safeSheet = String(lopName || "DanhSachLop").replace(/[:\\\/\?\*\[\]]/g, "_").slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, safeSheet);

  const safeFileLop = String(lopName || "Lop").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `DanhSach_Lop_${safeFileLop}_${namHoc}.xlsx`;
  return await triggerSafeExcelDownload(XLSX, wb, fileName);
}

/**
 * Kích hoạt hộp thoại In / PDF của trình duyệt kèm thông báo Toast và trạng thái đang mở.
 * Dành một khoảng thời gian nhỏ (150ms) để React kịp render Toast thông báo lên màn hình
 * trước khi trình duyệt hiển thị hộp thoại In (vốn chặn tạm thời luồng giao diện JS).
 *
 * Lưu ý kỹ thuật: Theo tiêu chuẩn bảo mật W3C, window.print() không cung cấp trạng thái
 * người dùng bấm "Lưu", "In" hay "Huỷ" (sự kiện afterprint kích hoạt trong cả 2 trường hợp).
 * Do đó, hàm thông báo "Đang mở hộp thoại in / PDF..." và tự động khôi phục nút bấm khi đóng,
 * tránh phát sinh thông báo thành công giả định khi người dùng bấm Huỷ.
 */
export function triggerPrintWithToast({
  showToast,
  setPrinting,
  message = "Đang mở hộp thoại in / PDF...",
}) {
  if (setPrinting) setPrinting(true);
  if (showToast) showToast(message, "info", 2500);

  let hasReset = false;
  const handleCleanup = () => {
    if (hasReset) return;
    hasReset = true;
    window.removeEventListener("afterprint", handleCleanup);
    window.removeEventListener("focus", handleCleanup);
    if (setPrinting) setPrinting(false);
  };

  window.addEventListener("afterprint", handleCleanup);

  // Focus fallback phòng trường hợp một số trình duyệt không kích hoạt afterprint
  const onBlur = () => {
    window.addEventListener("focus", handleCleanup, { once: true });
  };
  window.addEventListener("blur", onBlur, { once: true });

  // Đợi UI render Toast trước khi gọi window.print()
  setTimeout(() => {
    window.print();
  }, 150);
}
