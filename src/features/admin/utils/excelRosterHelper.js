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

// Hàm tạo base username: [tên][họ][2 số cuối năm sinh] (ví dụ: annguyen15)
export function generateStudentBaseUsername(hoTen, ngaySinh) {
  if (!hoTen || typeof hoTen !== "string") return "hocsinh";
  const cleanWords = hoTen.trim().split(/\s+/).filter(Boolean);
  if (cleanWords.length === 0) return "hocsinh";
  
  let firstName = "";
  let lastName = "";
  if (cleanWords.length >= 2) {
    firstName = removeVietnameseTones(cleanWords[cleanWords.length - 1]).toLowerCase().replace(/[^a-z0-9]/g, "");
    lastName = removeVietnameseTones(cleanWords[0]).toLowerCase().replace(/[^a-z0-9]/g, "");
  } else {
    firstName = removeVietnameseTones(cleanWords[0]).toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  let yearSuffix = "";
  if (ngaySinh && typeof ngaySinh === "string" && ngaySinh.length >= 4) {
    // ngaySinh chuẩn YYYY-MM-DD
    yearSuffix = ngaySinh.slice(2, 4);
  }

  return `${firstName}${lastName}${yearSuffix}` || "hocsinh";
}

// Tự sinh mã học sinh duy nhất (tự động tăng _2, _3... nếu bị trùng tên và năm sinh trong file)
export function generateAutoUsername(hoTen, ngaySinh, existingSet = new Set()) {
  const base = generateStudentBaseUsername(hoTen, ngaySinh);
  let candidate = base;
  let counter = 2;
  while (existingSet.has(candidate.toLowerCase())) {
    candidate = `${base}_${counter}`;
    counter += 1;
  }
  existingSet.add(candidate.toLowerCase());
  return candidate;
}

/**
 * Đọc file Excel và parse thành danh sách học sinh chuẩn hóa
 */
export async function parseStudentRosterExcel(file) {
  const XLSX = await getXLSX();
  const buffer = await file.arrayBuffer();
  let wb;
  try {
    wb = XLSX.read(buffer, { type: "array" });
  } catch (err) {
    if (file?.name && file.name.toLowerCase().endsWith(".numbers")) {
      throw new Error(
        "Không thể đọc trực tiếp tệp Apple Numbers này (có thể do phiên bản Numbers mới hoặc tệp có mật khẩu). Gợi ý: bạn hãy mở tệp trong ứng dụng Numbers, chọn Tệp (File) > Xuất ra (Export To) > Excel (.xlsx) rồi tải lên lại."
      );
    }
    throw new Error(err.message || "Không thể đọc tệp bảng tính này. Vui lòng kiểm tra lại định dạng.");
  }

  const firstSheetName = wb.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("Tệp bảng tính không có trang tính (sheet) nào.");
  }

  const worksheet = wb.Sheets[firstSheetName];
  // Chuyển sheet sang mảng đối tượng với header linh hoạt
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  if (!rawRows || rawRows.length === 0) {
    if (file?.name && file.name.toLowerCase().endsWith(".numbers")) {
      throw new Error(
        "Tệp Apple Numbers không có dữ liệu học sinh hoặc định dạng chưa được hỗ trợ. Gợi ý: bạn hãy mở tệp trong Numbers, chọn Tệp > Xuất ra > Excel (.xlsx) rồi tải lên lại."
      );
    }
    throw new Error("Tệp bảng tính không có dữ liệu học sinh.");
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

    // Nếu không có Họ tên VÀ không có Tên Thánh -> dòng trống hoặc định dạng dư ở cuối bảng, bỏ qua
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

    // Xử lý mã học sinh (username): Tự động sinh mã chuẩn annguyen15 (hoặc annguyen15_2 nếu trùng trong file)
    let username = rawUsername ? rawUsername.toLowerCase().replace(/\s+/g, "") : "";
    if (!username) {
      username = generateAutoUsername(hoVaTen, ngaySinh, existingUsernamesInFile);
    } else {
      // Kiểm tra trùng username trong cùng 1 file
      if (existingUsernamesInFile.has(username.toLowerCase())) {
        rowErrors.push(`Hàng ${rowNum}: Trùng mã học sinh "${username}" trong file`);
      }
      existingUsernamesInFile.add(username.toLowerCase());
    }

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
 * Tải file Excel mẫu chuẩn hóa về máy người dùng (Không yêu cầu cột Mã học sinh)
 */
export async function downloadSampleExcel(lopName = "KhaiTam", namHoc = "2025-2026") {
  const XLSX = await getXLSX();

  // Dữ liệu mẫu minh họa: Không cần cột Mã học sinh
  const sampleData = [
    {
      "STT": 1,
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
    {
      "STT": 3,
      "Tên Thánh": "Giuse",
      "Họ và tên": "Nguyễn Mệnh Trịnh",
      "Ngày sinh (DD/MM/YYYY)": "15/08/2015",
      "Giới tính": "Nam",
      "Ngày Rửa Tội (DD/MM/YYYY)": "15/09/2015",
      "Ngày Rước Lễ Lần Đầu (DD/MM/YYYY)": "",
      "Ngày Thêm Sức (DD/MM/YYYY)": "",
      "Tên Cha": "Tôma Hùng",
      "Tên Mẹ": "Têrêsa Nga",
      "Số điện thoại": "0905123456",
      "Giáo xóm": "Xóm 2",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);

  // Đặt độ rộng các cột cho đẹp mắt
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
  XLSX.utils.book_append_sheet(wb, ws, "DanhSachHocSinh");

  const safeLop = String(lopName).replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `Mau_Danh_Sach_${safeLop}_${namHoc}.xlsx`;
  return await triggerSafeExcelDownload(XLSX, wb, fileName);
}

/**
 * Tải file Excel mẫu danh sách Người dùng (Giáo lý viên, Quản trị viên, Thành viên, Giáo lý sinh) - 8 cột chuẩn hóa
 */
export async function downloadSampleUsersExcel() {
  const XLSX = await getXLSX();

  const sampleData = [
    {
      "STT": 1,
      "Tên Thánh": "Phêrô",
      "Họ và tên": "Nguyễn Văn An",
      "Ngày sinh (DD/MM/YYYY)": "15/08/1995",
      "Giới tính": "Nam",
      "Vai trò": "Giáo lý viên",
      "Số điện thoại": "0901234567",
      "Giáo xóm": "Xóm 1",
    },
    {
      "STT": 2,
      "Tên Thánh": "Maria",
      "Họ và tên": "Trần Thị Thúy Nhi",
      "Ngày sinh (DD/MM/YYYY)": "20/11/1998",
      "Giới tính": "Nữ",
      "Vai trò": "Giáo lý viên",
      "Số điện thoại": "0912345678",
      "Giáo xóm": "Xóm 2",
    },
    {
      "STT": 3,
      "Tên Thánh": "Giuse",
      "Họ và tên": "Đặng Quang Huy",
      "Ngày sinh (DD/MM/YYYY)": "10/02/1990",
      "Giới tính": "Nam",
      "Vai trò": "Quản trị viên",
      "Số điện thoại": "0933445566",
      "Giáo xóm": "Xóm 3",
    },
    {
      "STT": 4,
      "Tên Thánh": "Anna",
      "Họ và tên": "Phạm Thị Thảo",
      "Ngày sinh (DD/MM/YYYY)": "05/06/1985",
      "Giới tính": "Nữ",
      "Vai trò": "Thành viên",
      "Số điện thoại": "0988776655",
      "Giáo xóm": "Xóm 1",
    },
    {
      "STT": 5,
      "Tên Thánh": "Têrêsa",
      "Họ và tên": "Nguyễn Thị Ngọc",
      "Ngày sinh (DD/MM/YYYY)": "12/04/2014",
      "Giới tính": "Nữ",
      "Vai trò": "Giáo lý sinh",
      "Số điện thoại": "0977112233",
      "Giáo xóm": "Xóm 2",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);

  ws["!cols"] = [
    { wch: 6 },  // STT
    { wch: 14 }, // Tên Thánh
    { wch: 24 }, // Họ và tên
    { wch: 22 }, // Ngày sinh
    { wch: 12 }, // Giới tính
    { wch: 18 }, // Vai trò
    { wch: 16 }, // Số điện thoại
    { wch: 18 }, // Giáo xóm
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DanhSachNguoiDung");

  const fileName = `Mau_Danh_Sach_Nguoi_Dung.xlsx`;
  return await triggerSafeExcelDownload(XLSX, wb, fileName);
}

/**
 * Đọc file Excel và parse thành danh sách người dùng chuẩn hóa cho trang /quản-trị/người-dùng (8 cột cơ bản)
 */
export async function parseUsersExcel(file) {
  const XLSX = await getXLSX();
  const buffer = await file.arrayBuffer();
  let wb;
  try {
    wb = XLSX.read(buffer, { type: "array" });
  } catch (err) {
    if (file?.name && file.name.toLowerCase().endsWith(".numbers")) {
      throw new Error(
        "Không thể đọc trực tiếp tệp Apple Numbers này (có thể do phiên bản Numbers mới hoặc tệp có mật khẩu). Gợi ý: bạn hãy mở tệp trong ứng dụng Numbers, chọn Tệp (File) > Xuất ra (Export To) > Excel (.xlsx) rồi tải lên lại."
      );
    }
    throw new Error(err.message || "Không thể đọc tệp bảng tính này. Vui lòng kiểm tra lại định dạng.");
  }

  const firstSheetName = wb.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("Tệp bảng tính không có trang tính (sheet) nào.");
  }

  const worksheet = wb.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  if (!rawRows || rawRows.length === 0) {
    if (file?.name && file.name.toLowerCase().endsWith(".numbers")) {
      throw new Error(
        "Tệp Apple Numbers không có dữ liệu người dùng hoặc định dạng chưa được hỗ trợ. Gợi ý: bạn hãy mở tệp trong Numbers, chọn Tệp > Xuất ra > Excel (.xlsx) rồi tải lên lại."
      );
    }
    throw new Error("Tệp bảng tính không có dữ liệu người dùng.");
  }

  const normalizedUsers = [];
  const errors = [];
  const existingUsernamesInFile = new Set();

  rawRows.forEach((row, idx) => {
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

    const hoVaTen = String(findField(["ho va ten", "ho ten", "ten nguoi dung", "ten giao vien", "ten hoc sinh", "ho va ten dem"])).trim();
    const tenThanh = String(findField(["ten thanh", "bon mang", "thanh"])).trim();
    let rawUsername = String(findField(["ma tai khoan", "username", "ten dang nhap", "tai khoan", "ma nguoi dung", "ma hs"])).trim();

    if (!hoVaTen && !tenThanh && !rawUsername) {
      return;
    }

    const rawNgaySinh = findField(["ngay sinh", "sinh nhat", "ngay thang nam sinh"]);
    const ngaySinh = parseExcelDate(rawNgaySinh);

    // Chuẩn hóa vai trò
    const rawRole = removeVietnameseTones(String(findField(["vai tro", "role", "chuc vu", "phan quyen"]))).toLowerCase().replace(/[^a-z0-9]/g, "");
    let role = "teacher";
    if (rawRole.includes("student") || rawRole.includes("giaolysinh") || rawRole.includes("hocsinh") || rawRole === "gls") {
      role = "student";
    } else if (rawRole.includes("admin") || rawRole.includes("quantrivien") || rawRole === "qtv") {
      role = "admin";
    } else if (rawRole.includes("user") || rawRole.includes("thanhvien") || rawRole.includes("phuhuynh")) {
      role = "user";
    } else if (rawRole.includes("teacher") || rawRole.includes("giaolyvien") || rawRole === "glv") {
      role = "teacher";
    }

    // Tự động gán trạng thái thông minh theo vai trò
    const rawTrangThai = String(findField(["trang thai", "status"])).trim();
    let trangThai = role === "teacher" ? "Chưa phân công" : (role === "student" ? "Chưa xếp lớp" : "Hoạt động");
    if (rawTrangThai) {
      const cleanTT = removeVietnameseTones(rawTrangThai).toLowerCase();
      if (cleanTT.includes("nghi day")) trangThai = "Nghỉ dạy";
      else if (cleanTT.includes("dang day")) trangThai = "Đang dạy";
      else if (cleanTT.includes("chua phan cong")) trangThai = "Chưa phân công";
      else if (cleanTT.includes("nghi hoc")) trangThai = "Nghỉ học";
      else if (cleanTT.includes("dang hoc")) trangThai = "Đang học";
      else if (cleanTT.includes("chua xep lop")) trangThai = "Chưa xếp lớp";
      else if (cleanTT.includes("hoan thanh")) trangThai = "Hoàn thành";
      else if (cleanTT.includes("hoat dong")) trangThai = "Hoạt động";
    }

    const gioiTinh = normalizeGender(findField(["gioi tinh", "phai", "sex"]));
    const sdt = String(findField(["so dien thoai", "sdt", "dien thoai", "phone", "sdt phu huynh"])).replace(/[^0-9]/g, "");
    const giaoXom = String(findField(["giao xom", "xom", "khu giao họ", "dia chi"])).trim();

    const rowNum = idx + 2;
    const rowErrors = [];

    if (!hoVaTen || hoVaTen.length < 2) {
      rowErrors.push(`Hàng ${rowNum}: Thiếu hoặc sai Họ và tên`);
    }

    let username = rawUsername ? rawUsername.toLowerCase().replace(/\s+/g, "") : "";
    if (!username) {
      username = generateAutoUsername(hoVaTen, ngaySinh, existingUsernamesInFile);
    } else {
      if (existingUsernamesInFile.has(username.toLowerCase())) {
        rowErrors.push(`Hàng ${rowNum}: Trùng mã tài khoản "${username}" trong file`);
      }
      existingUsernamesInFile.add(username.toLowerCase());
    }

    const userItem = {
      rowIndex: rowNum,
      username,
      ho_va_ten: hoVaTen,
      ten_thanh: tenThanh,
      ngay_sinh: ngaySinh || null,
      raw_ngay_sinh: rawNgaySinh ? String(rawNgaySinh) : "",
      role,
      trang_thai: trangThai,
      gioi_tinh: gioiTinh,
      sdt,
      giao_xom: giaoXom,
      isValid: rowErrors.length === 0,
      errors: rowErrors,
    };

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
    }

    normalizedUsers.push(userItem);
  });

  const validCount = normalizedUsers.filter((u) => u.isValid).length;
  const invalidCount = normalizedUsers.length - validCount;

  return {
    users: normalizedUsers,
    total: normalizedUsers.length,
    validCount,
    invalidCount,
    errors,
  };
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
 * Xuất file Excel danh sách đăng ký học giáo lý
 */
export async function exportDangKyExcel(records = [], filterLabel = "Tất cả", namHoc = "2026–2027") {
  const XLSX = await preloadXLSX();

  const header = [
    "STT",
    "Họ và Tên",
    "Năm sinh",
    "Độ tuổi",
    "Số điện thoại",
    "Giáo xóm",
    "Khối đăng ký",
    "Trạng thái",
    "Thời gian nộp",
    "Ghi chú phụ huynh",
    "Ghi chú BQT",
    "Người xử lý",
  ];

  const STATUS_MAP = {
    moi: "Chờ xử lý (Mới)",
    da_lien_he: "Đã liên hệ",
    da_xep_lop: "Đã xếp lớp",
    tu_choi: "Từ chối",
  };

  const currentYear = new Date().getFullYear();

  const dataRows = records.map((r, index) => [
    index + 1,
    r.ho_ten || "",
    r.nam_sinh || "",
    r.nam_sinh ? `${currentYear - r.nam_sinh} tuổi` : "",
    r.sdt || "",
    r.giao_xom || "",
    r.khoi_dang_ky || "",
    STATUS_MAP[r.trang_thai] || r.trang_thai || "",
    r.created_at ? new Date(r.created_at).toLocaleString("vi-VN") : "",
    r.ghi_chu || "",
    r.ghi_chu_admin || "",
    r.xu_ly_boi ? `${r.xu_ly_boi} (${r.xu_ly_luc ? new Date(r.xu_ly_luc).toLocaleDateString("vi-VN") : ""})` : "",
  ]);

  const ws = XLSX.utils.aoa_to_sheet([
    [`DANH SÁCH ĐĂNG KÝ HỌC GIÁO LÝ (${filterLabel.toUpperCase()}) - NIÊN KHÓA ${namHoc}`],
    [`Ngày xuất: ${new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}`],
    [],
    header,
    ...dataRows,
  ]);

  ws["!cols"] = [
    { wch: 6 },  // STT
    { wch: 22 }, // Họ tên
    { wch: 10 }, // Năm sinh
    { wch: 10 }, // Độ tuổi
    { wch: 15 }, // SĐT
    { wch: 14 }, // Giáo xóm
    { wch: 18 }, // Khối
    { wch: 16 }, // Trạng thái
    { wch: 20 }, // Thời gian nộp
    { wch: 28 }, // Ghi chú phụ huynh
    { wch: 28 }, // Ghi chú BQT
    { wch: 22 }, // Người xử lý
  ];

  const wb = XLSX.utils.book_new();
  const safeSheet = `DangKy_${filterLabel}`.replace(/[:\\\/\?\*\[\]]/g, "_").slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, safeSheet);

  const safeFilter = String(filterLabel || "All").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `DangKyGiaoLy_${safeFilter}_${namHoc}.xlsx`;
  return await triggerSafeExcelDownload(XLSX, wb, fileName);
}

/**
 * Xuất file Excel danh sách thư góp ý & liên hệ
 */
export async function exportLienHeExcel(records = [], filterLabel = "Tất cả") {
  const XLSX = await preloadXLSX();

  const header = [
    "STT",
    "Họ và Tên",
    "Số điện thoại",
    "Chủ đề",
    "Nội dung góp ý / liên hệ",
    "Trạng thái",
    "Thời gian gửi",
  ];

  const STATUS_MAP = {
    moi: "Chờ phản hồi (Mới)",
    da_doc: "Đã đọc",
    da_xu_ly: "Đã xử lý",
  };

  function parseTopicAndBody(raw) {
    if (!raw) return { topic: "Khác", content: "" };
    const match = raw.match(/^\[Chủ đề:\s*([^\]]+)\]\s*\n?([\s\S]*)$/i);
    if (match) {
      return { topic: match[1].trim(), content: match[2].trim() };
    }
    return { topic: "Khác", content: raw.trim() };
  }

  const dataRows = records.map((r, index) => {
    const parsed = parseTopicAndBody(r.noi_dung);
    return [
      index + 1,
      r.ho_ten || "",
      r.sdt || "",
      parsed.topic,
      parsed.content,
      STATUS_MAP[r.trang_thai] || r.trang_thai || "",
      r.created_at ? new Date(r.created_at).toLocaleString("vi-VN") : "",
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([
    [`DANH SÁCH HÒM THƯ GÓP Ý & LIÊN HỆ (${filterLabel.toUpperCase()})`],
    [`Ngày xuất: ${new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}`],
    [],
    header,
    ...dataRows,
  ]);

  ws["!cols"] = [
    { wch: 6 },  // STT
    { wch: 22 }, // Họ tên
    { wch: 16 }, // SĐT
    { wch: 20 }, // Chủ đề
    { wch: 50 }, // Nội dung
    { wch: 18 }, // Trạng thái
    { wch: 22 }, // Thời gian gửi
  ];

  const wb = XLSX.utils.book_new();
  const safeSheet = `GopY_${filterLabel}`.replace(/[:\\\/\?\*\[\]]/g, "_").slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, safeSheet);

  const safeFilter = String(filterLabel || "All").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `HomThuGopY_${safeFilter}_${new Date().getFullYear()}.xlsx`;
  return await triggerSafeExcelDownload(XLSX, wb, fileName);
}

/**
 * Xuất file Excel danh sách người dùng & phân quyền xứ đoàn
 */
export async function exportUsersExcel(users = [], filterLabel = "Tất cả", getLopName = () => null) {
  const XLSX = await preloadXLSX();

  const ROLE_VI = {
    admin: "Quản trị viên",
    teacher: "Giáo lý viên",
    student: "Giáo lý sinh",
    user: "Thành viên",
  };

  const header = [
    "STT",
    "Tên Thánh",
    "Họ và Tên",
    "Tên tài khoản (@username)",
    "Vai trò",
    "Lớp phụ trách / Đang học",
    "Trạng thái",
  ];

  const dataRows = users.map((u, index) => {
    const lop = typeof getLopName === "function" ? getLopName(u.username, u) : (u.lopHoc || "");
    let status = u.trangThai || "Hoạt động";
    if (u.role === "teacher") {
      status = (lop && lop !== "—") ? "Đang dạy" : "Chưa phân công";
    } else if (u.role === "student") {
      status = (lop && lop !== "—") ? "Đang học" : (u.trangThai || "Chưa xếp lớp");
    }
    return [
      index + 1,
      u.tenThanh || "",
      u.hoTen || u.username,
      `@${u.username}`,
      ROLE_VI[u.role] || u.role || "",
      lop || "—",
      status,
    ];
  });


  const ws = XLSX.utils.aoa_to_sheet([
    [`DANH SÁCH TÀI KHOẢN & PHÂN QUYỀN XỨ ĐOÀN (${String(filterLabel).toUpperCase()})`],
    [`Ngày xuất: ${new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}`],
    [`Tổng số: ${users.length} tài khoản`],
    [],
    header,
    ...dataRows,
  ]);

  ws["!cols"] = [
    { wch: 6 },  // STT
    { wch: 16 }, // Tên Thánh
    { wch: 24 }, // Họ và Tên
    { wch: 22 }, // Username
    { wch: 18 }, // Vai trò
    { wch: 26 }, // Lớp
    { wch: 16 }, // Trạng thái
  ];

  const wb = XLSX.utils.book_new();
  const safeSheet = `NguoiDung_${filterLabel}`.replace(/[:\\\/\?\*\[\]]/g, "_").slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, safeSheet);

  const safeFilter = String(filterLabel || "All").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `DanhSachTaiKhoan_${safeFilter}_${new Date().getFullYear()}.xlsx`;
  return await triggerSafeExcelDownload(XLSX, wb, fileName);
}

/**
 * Xuất Báo Cáo Tổng Hợp Các Lớp Học & Giáo Lý Viên Phụ Trách - Toàn bộ Niên Khóa
 */
export async function exportAllClassesSummaryExcel(classes = [], namHoc = "2026–2027", teachersByLop = {}, teachers = []) {
  const XLSX = await preloadXLSX();

  const getGlvNames = (lop) => {
    const usernames = teachersByLop[lop] || [];
    if (!usernames.length) return "Chưa phân công";
    return usernames
      .map((u) => {
        const t = teachers.find((tch) => tch.username === u);
        const holy = t?.ten_thanh || t?.tenThanh || "";
        const name = t?.ho_va_ten || t?.hoTen || u;
        return holy ? `${holy} ${name}` : name;
      })
      .join(", ");
  };

  const getKhoiName = (lop) => {
    const lower = (lop || "").toLowerCase();
    if (lower.includes("chiên con") || lower.includes("khai tâm") || lower.includes("vườn trẻ") || lower.includes("cc")) return "Khối Khai Tâm (5–7 tuổi)";
    if (lower.includes("rước lễ") || lower.includes("rl") || lower.includes("rllđ")) return "Khối Rước Lễ Lần Đầu (8–9 tuổi)";
    if (lower.includes("thêm sức") || lower.includes("ts")) return "Khối Thêm Sức (10–11 tuổi)";
    if (lower.includes("phụng vụ") || lower.includes("pv") || lower.includes("bao đồng")) return "Khối Phụng Vụ (12 tuổi)";
    if (lower.includes("kinh thánh") || lower.includes("kt")) return "Khối Kinh Thánh (13–14 tuổi)";
    if (lower.includes("vào đời") || lower.includes("vd")) return "Khối Vào Đời (15–16 tuổi)";
    return "Lớp Giáo Lý";
  };

  const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0);

  const header = [
    "STT",
    "Tên Lớp học",
    "Ngành / Khối Giáo lý",
    "Giáo lý viên phụ trách",
    "Sĩ số Giáo lý sinh",
    "Khóa sổ HK1",
    "Khóa sổ HK2",
  ];

  const dataRows = classes.map((c, idx) => [
    idx + 1,
    c.lop || "",
    getKhoiName(c.lop),
    getGlvNames(c.lop),
    c.studentCount || 0,
    c.locks?.[1] ? "Đã khóa" : "Đang mở",
    c.locks?.[2] ? "Đã khóa" : "Đang mở",
  ]);

  const ws = XLSX.utils.aoa_to_sheet([
    [`BÁO CÁO TỔNG HỢP DANH SÁCH LỚP HỌC & GIÁO LÝ VIÊN PHỤ TRÁCH`],
    [`Niên khóa: ${namHoc} · Ngày xuất: ${new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}`],
    [`Tổng số lớp: ${classes.length} Lớp · Tổng số Giáo lý sinh: ${totalStudents} Em`],
    [],
    header,
    ...dataRows,
  ]);

  ws["!cols"] = [
    { wch: 6 },  // STT
    { wch: 20 }, // Tên Lớp
    { wch: 30 }, // Khối
    { wch: 35 }, // GLV phụ trách
    { wch: 20 }, // Sĩ số
    { wch: 16 }, // Khóa sổ HK1
    { wch: 16 }, // Khóa sổ HK2
  ];

  const wb = XLSX.utils.book_new();
  const safeSheet = `TongHop_LopHoc_${namHoc}`.replace(/[:\\\/\?\*\[\]]/g, "_").slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, safeSheet);

  const safeNamHoc = String(namHoc || "2026-2027").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `BaoCao_TongHop_LopHoc_${safeNamHoc}.xlsx`;
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
