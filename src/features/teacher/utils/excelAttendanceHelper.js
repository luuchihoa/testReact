/**
 * excelAttendanceHelper.js
 * Tiện ích đọc, kiểm tra và xuất file Excel Điểm danh cho Giáo lý viên
 * Ban Giáo lý An Ngãi
 */
import {
  preloadXLSX,
  getXLSX,
  triggerSafeExcelDownload,
} from "../../admin/utils/excelRosterHelper.js";
import {
  toISODate,
  parseISODate,
  formatVNDate,
  sortStudentsByTen,
} from "../utils.js";
import { calculateAutoHanhKiem } from "../../account/utils.js";

// Loại bỏ dấu tiếng Việt để so khớp tên mềm dẻo
function removeVietnameseTones(str) {
  if (!str) return "";
  let s = String(str).toLowerCase();
  s = s.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  s = s.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  s = s.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  s = s.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  s = s.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  s = s.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  s = s.replace(/đ/g, "d");
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

/**
 * Chuẩn hóa ký hiệu điểm danh theo quy ước:
 * - Để trống (hoặc 'x', '1', 'cm', 'có mặt') -> "co_mat"
 * - 'p', 'phép', 'cp' -> "nghi_phep"
 * - 'k', 'kp', 'không phép' -> "nghi_khong_phep"
 * - 'l', 'lễ', 'nghỉ lễ' -> "nghi_le"
 * - '-', '—', 'null' -> null (chưa có dữ liệu / chưa học)
 */
export function normalizeAttendanceStatus(rawVal, isHoliday = false) {
  if (rawVal === undefined || rawVal === null) {
    return isHoliday ? "nghi_le" : "co_mat";
  }

  const str = String(rawVal).trim().toLowerCase();

  // 1. Ký hiệu chưa học / chưa điểm danh
  if (str === "-" || str === "—" || str === "null" || str === "chua co" || str === "chưa có") {
    return null;
  }

  // 2. Ô để trống -> Mặc định Có mặt (hoặc Nghỉ lễ nếu ngày đó là lễ)
  if (str === "") {
    return isHoliday ? "nghi_le" : "co_mat";
  }

  // 3. Nghỉ có phép
  if (
    str === "p" ||
    str === "phep" ||
    str === "phép" ||
    str === "cp" ||
    str === "co phep" ||
    str === "có phép" ||
    str === "vang phep" ||
    str === "vắng phép" ||
    str === "excused"
  ) {
    return "nghi_phep";
  }

  // 4. Nghỉ không phép
  if (
    str === "k" ||
    str === "kp" ||
    str === "ko phep" ||
    str === "k phep" ||
    str === "không phép" ||
    str === "khong phep" ||
    str === "vang kp" ||
    str === "vắng kp" ||
    str === "unexcused"
  ) {
    return "nghi_khong_phep";
  }

  // 5. Nghỉ lễ
  if (
    str === "l" ||
    str === "le" ||
    str === "lễ" ||
    str === "nghi le" ||
    str === "nghỉ lễ" ||
    str === "hol" ||
    str === "holiday" ||
    str === "✝"
  ) {
    return "nghi_le";
  }

  // 6. Có mặt
  if (
    str === "x" ||
    str === "v" ||
    str === "✓" ||
    str === "1" ||
    str === "cm" ||
    str === "co mat" ||
    str === "có mặt" ||
    str === "ok" ||
    str === "true" ||
    str === "present"
  ) {
    return "co_mat";
  }

  // Mặc định fallback
  return isHoliday ? "nghi_le" : "co_mat";
}

/**
 * Xuất file Excel Điểm danh cho 1 NGÀY CỤ THỂ (Single Date Sheet)
 */
export async function exportAttendanceDateExcel({
  lop = "Lop",
  namHoc = "2026-2027",
  hocKy = "HK1",
  date = new Date(),
  students = [],
  statuses = {},
  holiday = null,
}) {
  const XLSX = await preloadXLSX();
  const sortedStudents = sortStudentsByTen(students);
  const formattedDate = formatVNDate(date);
  const isoDate = toISODate(date);

  const presentCount = sortedStudents.filter(
    (s) => (statuses[s.username] ?? (holiday ? "nghi_le" : "co_mat")) === "co_mat"
  ).length;
  const phepCount = sortedStudents.filter(
    (s) => statuses[s.username] === "nghi_phep"
  ).length;
  const kPhepCount = sortedStudents.filter(
    (s) => statuses[s.username] === "nghi_khong_phep"
  ).length;
  const leCount = sortedStudents.filter(
    (s) => (statuses[s.username] ?? (holiday ? "nghi_le" : "co_mat")) === "nghi_le"
  ).length;

  const header = [
    "STT",
    "Mã Giáo lý sinh",
    "Tên Thánh",
    "Họ và Tên",
    "Giới tính",
    "Trạng thái điểm danh",
    "Ký hiệu",
    "Ký tên / Ghi chú",
  ];

  const STATUS_LABEL_MAP = {
    co_mat: "Có mặt",
    nghi_phep: "Nghỉ có phép",
    nghi_khong_phep: "Nghỉ không phép",
    nghi_le: "Nghỉ lễ",
    null: "Chưa điểm danh",
  };

  const STATUS_CODE_MAP = {
    co_mat: "CM",
    nghi_phep: "P",
    nghi_khong_phep: "K",
    nghi_le: "L",
    null: "-",
  };

  const dataRows = sortedStudents.map((s, idx) => {
    const st = statuses[s.username] ?? (holiday ? "nghi_le" : "co_mat");
    return [
      idx + 1,
      s.username || "",
      s.tenThanh || s.ten_thanh || "",
      s.hoTen || s.ho_va_ten || "",
      s.gioiTinh || s.gioi_tinh || "",
      STATUS_LABEL_MAP[st] || "Có mặt",
      STATUS_CODE_MAP[st] || "",
      "",
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([
    ["GIÁO XỨ AN NGÃI - BAN GIÁO LÝ"],
    [`PHIẾU ĐIỂM DANH LỚP: ${String(lop).toUpperCase()} - NIÊN KHÓA ${namHoc}`],
    [
      `Học kỳ: ${hocKy === "HK1" ? "Học kỳ I" : "Học kỳ II"} · Ngày điểm danh: ${formattedDate}${holiday ? ` (⛪ ${holiday.ten_ngay_le})` : ""}`,
    ],
    [
      `Sĩ số: ${sortedStudents.length} em · Có mặt: ${presentCount} · Nghỉ phép: ${phepCount} · Không phép: ${kPhepCount} · Nghỉ lễ: ${leCount}`,
    ],
    ["QUY ƯỚC KÝ HIỆU: Để trống = Có mặt | P = Nghỉ có phép | K = Nghỉ không phép | L = Nghỉ lễ | - = Chưa học"],
    [],
    header,
    ...dataRows,
  ]);

  ws["!cols"] = [
    { wch: 6 },  // STT
    { wch: 18 }, // Mã HS
    { wch: 15 }, // Tên Thánh
    { wch: 24 }, // Họ và Tên
    { wch: 10 }, // Giới tính
    { wch: 22 }, // Trạng thái
    { wch: 10 }, // Ký hiệu
    { wch: 25 }, // Ghi chú
  ];

  const wb = XLSX.utils.book_new();
  const safeSheet = `DiemDanh_${isoDate}`.replace(/[:\\\/\?\*\[\]]/g, "_").slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, safeSheet);

  const safeLop = String(lop || "Lop").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `DiemDanh_${safeLop}_${isoDate}.xlsx`;
  return await triggerSafeExcelDownload(XLSX, wb, fileName);
}

/**
 * Xuất Bảng Ma trận Chuyên cần TOÀN BỘ HỌC KỲ (Full Semester Matrix)
 */
export async function exportAttendanceSemesterMatrixExcel({
  lop = "Lop",
  namHoc = "2026-2027",
  hocKy = "HK1",
  sundays = [],
  students = [],
  attendanceRecords = [], // Mảng các bản ghi { username, ngay, trang_thai }
  holidaysMap = {}, // Map { [isoDate]: holidayObject }
}) {
  const XLSX = await preloadXLSX();
  const sortedStudents = sortStudentsByTen(students);

  // Tạo map tra cứu điểm danh theo username và ngày
  const recordMap = new Map();
  attendanceRecords.forEach((r) => {
    const key = `${r.username}_${toISODate(r.ngay)}`;
    recordMap.set(key, r.trang_thai);
  });

  const todayIso = toISODate(new Date());

  // Xây dựng tiêu đề các cột ngày Chúa Nhật
  const dateColumns = sundays.map((d, idx) => {
    const iso = toISODate(d);
    const holiday = holidaysMap[iso];
    const shortDate = formatVNDate(d).slice(0, 5); // "06/09"
    const label = holiday
      ? `B${idx + 1} (${shortDate} - ${holiday.loai_nghi === 'nghi_tet' ? 'Tết' : 'Lễ'})`
      : `B${idx + 1} (${shortDate})`;
    return {
      date: d,
      isoDate: iso,
      label,
      holiday,
      isPastOrToday: iso <= todayIso,
    };
  });

  const header = [
    "STT",
    "Mã Giáo lý sinh",
    "Tên Thánh",
    "Họ và Tên",
    "Giới tính",
    ...dateColumns.map((c) => c.label),
    "Tổng Có Mặt",
    "Nghỉ Phép",
    "Không Phép",
    "Nghỉ Lễ",
    "Đã Học / ĐD",
    "Tỷ Lệ (%)",
    "Hạnh Kiểm Dự Kiến",
  ];

  const dataRows = sortedStudents.map((s, sIdx) => {
    let coMatCount = 0;
    let phepCount = 0;
    let kPhepCount = 0;
    let leCount = 0;

    const dateCells = dateColumns.map((col) => {
      const key = `${s.username}_${col.isoDate}`;
      const savedStatus = recordMap.get(key);

      let status = "null";
      if (savedStatus) {
        status = savedStatus;
      } else if (col.holiday && col.isPastOrToday) {
        status = "nghi_le";
      } else if (col.isPastOrToday) {
        status = "null";
      }

      // Thống kê
      if (status === "co_mat") coMatCount++;
      else if (status === "nghi_phep") phepCount++;
      else if (status === "nghi_khong_phep") kPhepCount++;
      else if (status === "nghi_le") leCount++;

      // Ký hiệu hiển thị trong ô
      if (status === "co_mat") return "✓";
      if (status === "nghi_phep") return "P";
      if (status === "nghi_khong_phep") return "K";
      if (status === "nghi_le") return "L";
      return "-";
    });

    const tongDaDiemDanh = coMatCount + phepCount + kPhepCount + leCount;
    const rate = tongDaDiemDanh > 0
      ? Math.round(((coMatCount + leCount) / tongDaDiemDanh) * 100)
      : 0;

    const autoHanhKiem = calculateAutoHanhKiem({
      nghi_khong_phep: kPhepCount,
      nghi_phep: phepCount,
      tong_da_diem_danh: tongDaDiemDanh,
    });

    return [
      sIdx + 1,
      s.username || "",
      s.tenThanh || s.ten_thanh || "",
      s.hoTen || s.ho_va_ten || "",
      s.gioiTinh || s.gioi_tinh || "",
      ...dateCells,
      coMatCount,
      phepCount,
      kPhepCount,
      leCount,
      `${tongDaDiemDanh}/${dateColumns.length}`,
      tongDaDiemDanh > 0 ? `${rate}%` : "—",
      autoHanhKiem || "—",
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([
    ["GIÁO XỨ AN NGÃI - BAN GIÁO LÝ"],
    [`BẢNG TỔNG HỢP THEO DÕI CHUYÊN CẦN LỚP ${String(lop).toUpperCase()} - ${namHoc}`],
    [
      `Học kỳ: ${hocKy === "HK1" ? "Học kỳ I" : "Học kỳ II"} · Sĩ số: ${sortedStudents.length} em · Tổng số buổi: ${dateColumns.length} buổi Chúa Nhật`,
    ],
    ["QUY ƯỚC: ✓ = Có mặt | P = Nghỉ có phép | K = Nghỉ không phép | L = Nghỉ lễ | - = Chưa có dữ liệu / Chưa học"],
    [],
    header,
    ...dataRows,
  ]);

  // Thiết lập độ rộng cột
  const cols = [
    { wch: 6 },  // STT
    { wch: 18 }, // Mã HS
    { wch: 14 }, // Tên Thánh
    { wch: 22 }, // Họ tên
    { wch: 10 }, // Phái
    ...dateColumns.map(() => ({ wch: 13 })), // Mỗi cột ngày 13 ký tự
    { wch: 13 }, // Tổng có mặt
    { wch: 12 }, // Phép
    { wch: 13 }, // Không phép
    { wch: 12 }, // Lễ
    { wch: 14 }, // Đã điểm danh
    { wch: 12 }, // Tỷ lệ
    { wch: 18 }, // Hạnh kiểm
  ];
  ws["!cols"] = cols;

  const wb = XLSX.utils.book_new();
  const safeSheet = `MaTran_${hocKy}`.slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, safeSheet);

  const safeLop = String(lop || "Lop").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `BangChuyenCan_${safeLop}_${hocKy}_${namHoc}.xlsx`;
  return await triggerSafeExcelDownload(XLSX, wb, fileName);
}

/**
 * Tải file Excel MẪU ĐIỂM DANH (Sample Template)
 */
export async function downloadAttendanceSampleExcel({
  lop = "Lop",
  namHoc = "2026-2027",
  hocKy = "HK1",
  date = new Date(),
  students = [],
  sundays = [],
  holidaysMap = {},
  mode = "single_date", // "single_date" | "matrix"
}) {
  const XLSX = await preloadXLSX();
  const sortedStudents = sortStudentsByTen(students);

  if (mode === "single_date") {
    const formattedDate = formatVNDate(date);
    const isoDate = toISODate(date);
    const holiday = holidaysMap[isoDate];

    const header = [
      "STT",
      "Mã Giáo lý sinh",
      "Tên Thánh",
      "Họ và Tên",
      "Giới tính",
      `Điểm danh (${formattedDate})`,
      "Ghi chú",
    ];

    const dataRows = sortedStudents.map((s, idx) => [
      idx + 1,
      s.username || "",
      s.tenThanh || s.ten_thanh || "",
      s.hoTen || s.ho_va_ten || "",
      s.gioiTinh || s.gioi_tinh || "",
      holiday ? "L" : "", // Nếu ngày lễ điền sẵn 'L', ngày thường để trống = Có mặt
      "",
    ]);

    const ws = XLSX.utils.aoa_to_sheet([
      ["GIÁO XỨ AN NGÃI - BAN GIÁO LÝ"],
      [`FILE MẪU NHẬP ĐIỂM DANH LỚP ${String(lop).toUpperCase()} - NGÀY ${formattedDate}`],
      [
        `Niên khóa: ${namHoc} · Học kỳ: ${hocKy === "HK1" ? "Học kỳ I" : "Học kỳ II"}${holiday ? ` (⛪ ${holiday.ten_ngay_le})` : ""}`,
      ],
      [
        "HƯỚNG DẪN NHẬP: Để trống hoặc 'x' = Có mặt; 'P' = Nghỉ phép; 'K' = Nghỉ không phép; 'L' = Nghỉ lễ; '-' = Chưa học.",
      ],
      [],
      header,
      ...dataRows,
    ]);

    ws["!cols"] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 14 },
      { wch: 22 },
      { wch: 10 },
      { wch: 24 },
      { wch: 25 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DiemDanh_Mau");
    const safeLop = String(lop || "Lop").replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileName = `MauDiemDanh_${safeLop}_${isoDate}.xlsx`;
    return await triggerSafeExcelDownload(XLSX, wb, fileName);
  }

  // Chế độ Ma trận cả Học kỳ (Matrix Template)
  const todayIso = toISODate(new Date());
  const dateColumns = sundays.map((d, idx) => {
    const iso = toISODate(d);
    const holiday = holidaysMap[iso];
    const shortDate = formatVNDate(d).slice(0, 5);
    const label = holiday
      ? `B${idx + 1} (${shortDate} - ${holiday.loai_nghi === 'nghi_tet' ? 'Tết' : 'Lễ'})`
      : `B${idx + 1} (${shortDate})`;
    return {
      date: d,
      isoDate: iso,
      label,
      holiday,
      isPastOrToday: iso <= todayIso,
    };
  });

  const header = [
    "STT",
    "Mã Giáo lý sinh",
    "Tên Thánh",
    "Họ và Tên",
    "Giới tính",
    ...dateColumns.map((c) => c.label),
    "Ghi chú",
  ];

  const dataRows = sortedStudents.map((s, sIdx) => {
    const dateCells = dateColumns.map((col) => {
      if (col.holiday) return "L"; // Ngày nghỉ lễ điền sẵn 'L'
      if (!col.isPastOrToday) return "-"; // Ngày tương lai để '-'
      return ""; // Ngày thường đã/đang diễn ra để trống = Có mặt
    });
    return [
      sIdx + 1,
      s.username || "",
      s.tenThanh || s.ten_thanh || "",
      s.hoTen || s.ho_va_ten || "",
      s.gioiTinh || s.gioi_tinh || "",
      ...dateCells,
      "",
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([
    ["GIÁO XỨ AN NGÃI - BAN GIÁO LÝ"],
    [`FILE MẪU NHẬP MA TRẬN CHUYÊN CẦN LỚP ${String(lop).toUpperCase()} - HỌC KỲ ${hocKy === "HK1" ? "I" : "II"}`],
    [`Niên khóa: ${namHoc} · Sĩ số: ${sortedStudents.length} em · Tổng số: ${dateColumns.length} buổi Chúa Nhật`],
    ["HƯỚNG DẪN: Để trống hoặc 'x' = Có mặt; 'P' = Nghỉ phép; 'K' = Nghỉ không phép; 'L' = Nghỉ lễ; '-' = Chưa học."],
    [],
    header,
    ...dataRows,
  ]);

  ws["!cols"] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 14 },
    { wch: 22 },
    { wch: 10 },
    ...dateColumns.map(() => ({ wch: 13 })),
    { wch: 25 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "MaTran_Mau");
  const safeLop = String(lop || "Lop").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `MauMaTranDiemDanh_${safeLop}_${hocKy}_${namHoc}.xlsx`;
  return await triggerSafeExcelDownload(XLSX, wb, fileName);
}

/**
 * Đọc và phân tích file Excel điểm danh
 */
export async function parseAttendanceExcel(file, rosterStudents = [], options = {}) {
  const {
    namHoc = "2026-2027",
    hocKy = "HK1",
    hocKyInt = 1,
    currentDate = toISODate(new Date()),
    sundays = [],
    holidaysMap = {},
  } = options;

  const XLSX = await getXLSX();
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });

  const firstSheetName = wb.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("File Excel không có sheet nào.");
  }

  const worksheet = wb.Sheets[firstSheetName];
  // Đọc dữ liệu dạng mảng 2 chiều để phát hiện header chính xác
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

  if (!rows || rows.length === 0) {
    throw new Error("File Excel không có dữ liệu.");
  }

  // Tìm dòng tiêu đề (Header row): dòng phải có >= 3 ô không rỗng và chứa các tiêu đề bảng đặc trưng
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(rows.length, 25); i++) {
    const row = rows[i] || [];
    const nonEmptyCells = row.filter(
      (c) => c !== undefined && c !== null && String(c).trim() !== ""
    );
    if (nonEmptyCells.length < 3) continue;

    const normalizedCells = row.map((c) => removeVietnameseTones(String(c).trim()));

    const hasStt = normalizedCells.some(
      (c) => c === "stt" || c.startsWith("stt ") || c === "so thu tu"
    );
    const hasName = normalizedCells.some(
      (c) =>
        c.includes("ho va ten") ||
        c.includes("ho ten") ||
        c === "ten" ||
        c.includes("ten hoc sinh")
    );
    const hasCode = normalizedCells.some(
      (c) =>
        c.includes("ma giao ly sinh") ||
        c.includes("ma hoc sinh") ||
        c.includes("ma hs") ||
        c.includes("username") ||
        c.includes("tai khoan")
    );
    const hasAttendance = normalizedCells.some(
      (c) =>
        c.includes("diem danh") ||
        c.includes("trang thai") ||
        c.includes("ky hieu") ||
        /^b(?:uoi)?\s*\d+/i.test(c) ||
        /\d{1,2}[\/\-\.]\d{1,2}/.test(c)
    );

    if ((hasStt || hasCode) && (hasName || hasAttendance)) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    throw new Error(
      "Không tìm thấy dòng tiêu đề cột hợp lệ trong file Excel. Vui lòng sử dụng file mẫu chuẩn."
    );
  }

  const rawHeaders = rows[headerRowIndex] || [];

  // Tạo map tìm kiếm học sinh của lớp
  const rosterByUsername = new Map();
  const rosterByName = new Map();
  const rosterByStt = new Map();

  const sortedRoster = sortStudentsByTen(rosterStudents);
  sortedRoster.forEach((s, idx) => {
    if (s.username) {
      rosterByUsername.set(String(s.username).toLowerCase().trim(), s);
    }
    const tenThanh = (s.tenThanh || s.ten_thanh || "").trim();
    const hoTen = (s.hoTen || s.ho_va_ten || "").trim();
    const fullName = `${tenThanh} ${hoTen}`.trim();

    if (fullName) {
      rosterByName.set(removeVietnameseTones(fullName), s);
    }
    if (hoTen) {
      rosterByName.set(removeVietnameseTones(hoTen), s);
    }
    rosterByStt.set(idx + 1, s);
    rosterByStt.set(String(idx + 1), s);
  });

  // Tìm vị trí các cột danh tính
  let usernameColIdx = -1;
  let tenThanhColIdx = -1;
  let hoTenColIdx = -1;
  let sttColIdx = -1;
  let gioiTinhColIdx = -1;
  let ghiChuColIdx = -1;

  rawHeaders.forEach((h, colIdx) => {
    const clean = removeVietnameseTones(String(h).trim());
    if (!clean) return;

    if (clean === "stt" || clean.startsWith("stt ") || clean === "so thu tu") {
      if (sttColIdx === -1) sttColIdx = colIdx;
    } else if (
      clean.includes("ma giao ly sinh") ||
      clean.includes("ma hoc sinh") ||
      clean.includes("ma hs") ||
      clean === "ma" ||
      clean.startsWith("ma ") ||
      clean.includes("username") ||
      clean.includes("tai khoan")
    ) {
      if (usernameColIdx === -1) usernameColIdx = colIdx;
    } else if (
      clean.includes("ten thanh") ||
      clean.includes("bon mang") ||
      clean === "thanh"
    ) {
      if (tenThanhColIdx === -1) tenThanhColIdx = colIdx;
    } else if (
      clean.includes("ho va ten") ||
      clean.includes("ho ten") ||
      clean.includes("ten hoc sinh") ||
      clean.includes("ho & ten") ||
      clean === "ho va ten hoc sinh" ||
      clean === "ho ten" ||
      clean === "ten"
    ) {
      if (hoTenColIdx === -1) hoTenColIdx = colIdx;
    } else if (
      clean.includes("gioi tinh") ||
      clean.includes("phai") ||
      clean === "nam/nu"
    ) {
      if (gioiTinhColIdx === -1) gioiTinhColIdx = colIdx;
    } else if (
      clean.includes("ghi chu") ||
      clean.includes("ky ten")
    ) {
      if (ghiChuColIdx === -1) ghiChuColIdx = colIdx;
    }
  });

  // Phát hiện các cột ngày tháng
  const dateColumns = [];
  rawHeaders.forEach((h, colIdx) => {
    if (
      colIdx === usernameColIdx ||
      colIdx === tenThanhColIdx ||
      colIdx === hoTenColIdx ||
      colIdx === sttColIdx ||
      colIdx === gioiTinhColIdx ||
      colIdx === ghiChuColIdx
    ) {
      return;
    }

    const clean = String(h).trim();
    if (!clean) return;
    const cleanNoTone = removeVietnameseTones(clean);

    if (
      cleanNoTone.includes("ghi chu") ||
      cleanNoTone.includes("ky ten") ||
      cleanNoTone.includes("tong") ||
      cleanNoTone.includes("ty le") ||
      cleanNoTone.includes("hanh kiem") ||
      cleanNoTone.includes("gioi tinh") ||
      cleanNoTone.includes("phai") ||
      cleanNoTone.includes("da hoc") ||
      cleanNoTone.includes("da diem danh")
    ) {
      return;
    }

    // 1. Dạng ngày DD/MM hoặc DD/MM/YYYY trong header (vd: "06/09", "06/09/2026", "B1 (06/09)", "Điểm danh (06/09/2026)")
    const dateMatch = clean.match(/(\d{1,2})[\/\-\.](\d{1,2})(?:[\/\-\.](\d{4}))?/);
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, "0");
      const month = dateMatch[2].padStart(2, "0");
      const year = dateMatch[3] || (Number(month) >= 8 ? String(namHoc).slice(0, 4) : String(namHoc).slice(-4));
      const iso = `${year}-${month}-${day}`;
      dateColumns.push({
        colIdx,
        headerText: clean,
        isoDate: iso,
        isHoliday: Boolean(holidaysMap[iso]),
      });
      return;
    }

    // 2. Dạng "Buổi 1", "Buổi 2", "B1", "B2"... khớp theo mảng sundays
    const buoiMatch = cleanNoTone.match(/^b(?:uoi)?\s*(\d+)/i);
    if (buoiMatch) {
      const bIdx = parseInt(buoiMatch[1], 10) - 1;
      if (bIdx >= 0 && bIdx < sundays.length) {
        const d = sundays[bIdx];
        const iso = toISODate(d);
        dateColumns.push({
          colIdx,
          headerText: clean,
          isoDate: iso,
          isHoliday: Boolean(holidaysMap[iso]),
        });
        return;
      }
    }

    // 3. Cột "Điểm danh" đơn (Single Date), "Trạng thái", "Ký hiệu"
    if (
      cleanNoTone.includes("diem danh") ||
      cleanNoTone.includes("trang thai") ||
      cleanNoTone.includes("ky hieu")
    ) {
      dateColumns.push({
        colIdx,
        headerText: clean,
        isoDate: toISODate(currentDate),
        isHoliday: Boolean(holidaysMap[toISODate(currentDate)]),
      });
    }
  });

  // Nếu không phát hiện được cột ngày nào, mặc định dùng currentDate cho cột trạng thái đầu tiên
  if (dateColumns.length === 0) {
    const fallbackIdx = rawHeaders.findIndex(
      (_, cIdx) =>
        cIdx !== usernameColIdx &&
        cIdx !== tenThanhColIdx &&
        cIdx !== hoTenColIdx &&
        cIdx !== sttColIdx &&
        cIdx !== gioiTinhColIdx &&
        cIdx !== ghiChuColIdx
    );
    const targetIdx = fallbackIdx !== -1 ? fallbackIdx : rawHeaders.length - 1;
    dateColumns.push({
      colIdx: targetIdx,
      headerText: "Điểm danh",
      isoDate: toISODate(currentDate),
      isHoliday: Boolean(holidaysMap[toISODate(currentDate)]),
    });
  }

  // Quét từng dòng học sinh
  const parsedRecords = [];
  const previewRows = [];
  const matchedUsernames = new Set();
  const unmatchedRows = [];

  for (let rIdx = headerRowIndex + 1; rIdx < rows.length; rIdx++) {
    const row = rows[rIdx] || [];
    if (!row || row.length === 0 || row.every((c) => c === "" || c === null || c === undefined)) {
      continue;
    }

    const rawUsername = usernameColIdx !== -1 ? String(row[usernameColIdx] || "").trim() : "";
    const rawTenThanh = tenThanhColIdx !== -1 ? String(row[tenThanhColIdx] || "").trim() : "";
    const rawHoTen = hoTenColIdx !== -1 ? String(row[hoTenColIdx] || "").trim() : "";
    const rawStt = sttColIdx !== -1 ? String(row[sttColIdx] || "").trim() : "";

    if (!rawUsername && !rawHoTen && !rawTenThanh && !rawStt) {
      continue; // Dòng trống hoặc footer
    }

    // Bỏ qua nếu là dòng chú thích/tổng kết ở cuối file
    const combinedRowStr = removeVietnameseTones(row.join(" "));
    if (
      combinedRowStr.includes("tong cong") ||
      combinedRowStr.includes("giao ly vien") ||
      combinedRowStr.includes("nguoi lap bang") ||
      combinedRowStr.includes("quy uoc") ||
      combinedRowStr.includes("huong dan")
    ) {
      continue;
    }

    // Khớp học sinh
    let student = null;
    if (rawUsername && rosterByUsername.has(rawUsername.toLowerCase())) {
      student = rosterByUsername.get(rawUsername.toLowerCase());
    }
    if (!student && (rawHoTen || rawTenThanh)) {
      const combined = `${rawTenThanh} ${rawHoTen}`.trim();
      student =
        rosterByName.get(removeVietnameseTones(combined)) ||
        rosterByName.get(removeVietnameseTones(rawHoTen));
    }
    if (!student && rawStt && rosterByStt.has(rawStt)) {
      student = rosterByStt.get(rawStt);
    }

    if (!student) {
      unmatchedRows.push({
        rowIndex: rIdx + 1,
        rawUsername,
        rawName:
          `${rawTenThanh} ${rawHoTen}`.trim() ||
          (rawStt ? `STT ${rawStt}` : `Hàng ${rIdx + 1}`),
      });
      continue;
    }

    if (matchedUsernames.has(student.username)) {
      continue;
    }
    matchedUsernames.add(student.username);

    const statusesByDate = {};

    dateColumns.forEach((col) => {
      const rawVal = row[col.colIdx];
      const status = normalizeAttendanceStatus(rawVal, col.isHoliday);
      statusesByDate[col.isoDate] = status;

      if (status !== null) {
        parsedRecords.push({
          username: student.username,
          nam_hoc: namHoc,
          hoc_ky: Number(hocKyInt) || 1,
          ngay: col.isoDate,
          trang_thai: status,
        });
      }
    });

    previewRows.push({
      student,
      statusesByDate,
    });
  }

  // Thống kê tổng hợp
  const summaryStats = {
    co_mat: parsedRecords.filter((r) => r.trang_thai === "co_mat").length,
    nghi_phep: parsedRecords.filter((r) => r.trang_thai === "nghi_phep").length,
    nghi_khong_phep: parsedRecords.filter((r) => r.trang_thai === "nghi_khong_phep").length,
    nghi_le: parsedRecords.filter((r) => r.trang_thai === "nghi_le").length,
  };

  const datesDetected = Array.from(new Set(dateColumns.map((c) => c.isoDate))).sort();

  return {
    mode: dateColumns.length > 1 ? "matrix" : "single_date",
    totalRowsInFile: previewRows.length + unmatchedRows.length,
    matchedCount: previewRows.length,
    totalRosterCount: sortedRoster.length,
    unmatchedRows,
    dateColumns,
    datesDetected,
    parsedRecords,
    previewRows,
    summaryStats,
  };
}
