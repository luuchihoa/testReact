/**
 * excelGradesHelper.js
 * Tiện ích đọc, kiểm tra và xuất file Excel Bảng Điểm cho Giáo lý viên
 * Ban Giáo lý An Ngãi
 */
import {
  preloadXLSX,
  getXLSX,
  triggerSafeExcelDownload,
} from "../../admin/utils/excelRosterHelper.js";
import {
  sortStudentsByTen,
  computeDiemTB,
} from "../utils.js";
import { calculateAutoHocLuc } from "../../account/utils.js";

// Loại bỏ dấu tiếng Việt để so khớp tên mềm dẻo
function removeVietnameseTones(str) {
  if (!str) return "";
  let s = String(str).toLowerCase();
  s = s.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  s = s.replace(/è|é|ẹ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  s = s.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  s = s.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  s = s.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  s = s.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  s = s.replace(/đ/g, "d");
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

/**
 * Chuẩn hóa giá trị điểm số:
 * - Để trống, null, undefined, "-", "—" => null
 * - Hỗ trợ dấu phẩy: "7,5" -> 7.5
 * - Hợp lệ từ 0 đến 10, làm tròn 1 chữ số thập phân
 */
export function normalizeGradeScore(rawVal) {
  if (rawVal === undefined || rawVal === null) {
    return { value: null, error: null };
  }

  const str = String(rawVal).trim();
  if (str === "" || str === "-" || str === "—" || str.toLowerCase() === "null") {
    return { value: null, error: null };
  }

  // Thay dấu phẩy bằng dấu chấm
  const cleaned = str.replace(",", ".");
  const num = Number(cleaned);

  if (isNaN(num)) {
    return { value: null, error: `Giá trị không phải số hợp lệ: "${str}"` };
  }

  if (num < 0 || num > 10) {
    return { value: null, error: `Điểm phải từ 0 đến 10 (nhập: ${num})` };
  }

  const rounded = Math.round(num * 10) / 10;
  return { value: rounded, error: null };
}

/**
 * Tải file mẫu Excel nhập điểm cho lớp
 */
export async function downloadGradesSampleExcel({
  lop = "Lop",
  namHoc = "2026-2027",
  hocKy = "HK1",
  students = [],
}) {
  const XLSX = await preloadXLSX();
  const sortedStudents = sortStudentsByTen(students);

  const header = [
    "STT",
    "Mã Giáo lý sinh",
    "Tên Thánh",
    "Họ và Tên",
    "Giới tính",
    "Điểm Miệng",
    "Điểm Vở",
    "Điểm 15 Phút",
    "Điểm 1 Tiết",
    "Điểm Thi HK",
    "Ghi chú",
  ];

  const dataRows = sortedStudents.map((s, idx) => [
    idx + 1,
    s.username || "",
    s.tenThanh || s.ten_thanh || "",
    s.hoTen || s.ho_va_ten || "",
    s.gioiTinh || s.gioi_tinh || "",
    "", // Miệng
    "", // Vở
    "", // 15'
    "", // 1 Tiết
    "", // Thi HK
    "", // Ghi chú
  ]);

  const ws = XLSX.utils.aoa_to_sheet([
    ["GIÁO XỨ AN NGÃI - BAN GIÁO LÝ"],
    [`FILE MẪU NHẬP ĐIỂM LỚP ${String(lop).toUpperCase()} - HỌC KỲ ${hocKy === "HK1" ? "I" : "II"}`],
    [`Niên khóa: ${namHoc} · Sĩ số: ${sortedStudents.length} Giáo lý sinh`],
    ["HƯỚNG DẪN: Nhập điểm từ 0 đến 10 (hỗ trợ số thập phân như 7.5, 8.2). Để trống nếu chưa có điểm."],
    [],
    header,
    ...dataRows,
  ]);

  ws["!cols"] = [
    { wch: 6 },  // STT
    { wch: 18 }, // Mã GLS
    { wch: 15 }, // Tên Thánh
    { wch: 24 }, // Họ và Tên
    { wch: 10 }, // Giới tính
    { wch: 14 }, // Điểm Miệng
    { wch: 14 }, // Điểm Vở
    { wch: 15 }, // Điểm 15'
    { wch: 14 }, // Điểm 1 Tiết
    { wch: 14 }, // Điểm Thi HK
    { wch: 20 }, // Ghi chú
  ];

  const wb = XLSX.utils.book_new();
  const safeSheet = `MauNhapDiem_${hocKy}`.slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, safeSheet);

  const safeLop = String(lop || "Lop").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `MauNhapDiem_${safeLop}_${hocKy}_${namHoc}.xlsx`;
  return await triggerSafeExcelDownload(XLSX, wb, fileName);
}

/**
 * Xuất Bảng điểm Chi tiết Học kỳ (HK1 hoặc HK2)
 */
export async function exportSemesterGradesExcel({
  lop = "Lop",
  namHoc = "2026-2027",
  hocKy = "HK1",
  students = [],
  rows = {}, // Map { [username]: { diem_mieng, diem_vo, diem_15_phut, diem_1_tiet, diem_thi, diem_tb } }
}) {
  const XLSX = await preloadXLSX();
  const sortedStudents = sortStudentsByTen(students);

  // Tính ĐTB chung của lớp
  let totalValidScores = 0;
  let scoreSum = 0;
  sortedStudents.forEach((s) => {
    const g = rows[s.username] || {};
    const tb = g.diem_tb ?? computeDiemTB(g);
    if (tb !== null && tb !== undefined && !isNaN(Number(tb))) {
      scoreSum += Number(tb);
      totalValidScores++;
    }
  });
  const classAvg = totalValidScores > 0 ? (Math.round((scoreSum / totalValidScores) * 10) / 10).toFixed(1) : "—";

  const header = [
    "STT",
    "Mã Giáo lý sinh",
    "Tên Thánh",
    "Họ và Tên",
    "Giới tính",
    "Điểm Miệng (HS1)",
    "Điểm Vở (HS1)",
    "Điểm 15' (HS1)",
    "Điểm 1 Tiết (HS2)",
    "Điểm Thi HK (HS3)",
    "Điểm TB",
    "Xếp Loại Học Lực",
    "Ghi chú",
  ];

  const dataRows = sortedStudents.map((s, idx) => {
    const g = rows[s.username] || {};
    const tb = g.diem_tb ?? computeDiemTB(g);
    const hocLuc = calculateAutoHocLuc(tb);

    return [
      idx + 1,
      s.username || "",
      s.tenThanh || s.ten_thanh || "",
      s.hoTen || s.ho_va_ten || "",
      s.gioiTinh || s.gioi_tinh || "",
      g.diem_mieng ?? "",
      g.diem_vo ?? "",
      g.diem_15_phut ?? "",
      g.diem_1_tiet ?? "",
      g.diem_thi ?? "",
      tb !== null && tb !== undefined ? tb : "—",
      hocLuc || "—",
      "",
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([
    ["GIÁO XỨ AN NGÃI - BAN GIÁO LÝ"],
    [`BẢNG ĐIỂM CHI TIẾT HỌC KỲ ${hocKy === "HK1" ? "I" : "II"} - LỚP ${String(lop).toUpperCase()}`],
    [`Niên khóa: ${namHoc} · Sĩ số: ${sortedStudents.length} Giáo lý sinh · ĐTB Lớp: ${classAvg}`],
    ["CÔNG THỨC ĐTB: (Miệng×1 + Vở×1 + 15'×1 + 1 Tiết×2 + Thi HK×3) / 8"],
    [],
    header,
    ...dataRows,
  ]);

  ws["!cols"] = [
    { wch: 6 },  // STT
    { wch: 18 }, // Mã GLS
    { wch: 15 }, // Tên Thánh
    { wch: 24 }, // Họ và Tên
    { wch: 10 }, // Giới tính
    { wch: 16 }, // Miệng
    { wch: 16 }, // Vở
    { wch: 16 }, // 15'
    { wch: 17 }, // 1 Tiết
    { wch: 17 }, // Thi HK
    { wch: 12 }, // ĐTB
    { wch: 18 }, // Học lực
    { wch: 20 }, // Ghi chú
  ];

  const wb = XLSX.utils.book_new();
  const safeSheet = `BangDiem_${hocKy}`.slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, safeSheet);

  const safeLop = String(lop || "Lop").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `BangDiem_${safeLop}_${hocKy}_${namHoc}.xlsx`;
  return await triggerSafeExcelDownload(XLSX, wb, fileName);
}

/**
 * Xuất Bảng điểm Tổng hợp Cả Năm (HK1, HK2 & Cả Năm)
 */
export async function exportFullYearGradesExcel({
  lop = "Lop",
  namHoc = "2026-2027",
  students = [],
  hk1Rows = {},
  hk2Rows = {},
  yearRows = {},
}) {
  const XLSX = await preloadXLSX();
  const sortedStudents = sortStudentsByTen(students);

  const header = [
    "STT",
    "Mã Giáo lý sinh",
    "Tên Thánh",
    "Họ và Tên",
    "Giới tính",
    "ĐTB Học Kỳ I",
    "ĐTB Học Kỳ II",
    "ĐTB Cả Năm",
    "Xếp Loại Học Lực",
    "Ghi chú",
  ];

  const dataRows = sortedStudents.map((s, idx) => {
    const g1 = hk1Rows[s.username] || {};
    const g2 = hk2Rows[s.username] || {};
    const gy = yearRows[s.username] || {};

    const tb1 = g1.diem_tb ?? computeDiemTB(g1);
    const tb2 = g2.diem_tb ?? computeDiemTB(g2);

    let tbYear = gy.diem_tb;
    if ((tbYear === null || tbYear === undefined) && tb1 !== null && tb2 !== null) {
      // ĐTB Cả Năm = (HK1 + HK2 * 2) / 3
      tbYear = Math.round(((Number(tb1) + Number(tb2) * 2) / 3) * 10) / 10;
    }

    const hocLuc = calculateAutoHocLuc(tbYear ?? tb2 ?? tb1);

    return [
      idx + 1,
      s.username || "",
      s.tenThanh || s.ten_thanh || "",
      s.hoTen || s.ho_va_ten || "",
      s.gioiTinh || s.gioi_tinh || "",
      tb1 !== null && tb1 !== undefined ? tb1 : "—",
      tb2 !== null && tb2 !== undefined ? tb2 : "—",
      tbYear !== null && tbYear !== undefined ? tbYear : "—",
      hocLuc || "—",
      "",
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([
    ["GIÁO XỨ AN NGÃI - BAN GIÁO LÝ"],
    [`BẢNG ĐIỂM TỔNG HỢP CẢ NĂM - LỚP ${String(lop).toUpperCase()}`],
    [`Niên khóa: ${namHoc} · Sĩ số: ${sortedStudents.length} Giáo lý sinh`],
    ["CÔNG THỨC: ĐTB Cả Năm = (ĐTB HK1 + ĐTB HK2×2) / 3"],
    [],
    header,
    ...dataRows,
  ]);

  ws["!cols"] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 15 },
    { wch: 24 },
    { wch: 10 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 20 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "TongHopCaNam");

  const safeLop = String(lop || "Lop").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `BangDiem_TongHopCaNam_${safeLop}_${namHoc}.xlsx`;
  return await triggerSafeExcelDownload(XLSX, wb, fileName);
}

/**
 * Đọc và phân tích file Excel bảng điểm
 */
export async function parseGradesExcel(file, rosterStudents = [], options = {}) {
  const {
    lop = "",
    namHoc = "2026-2027",
    hocKyInt = 1,
  } = options;

  const XLSX = await getXLSX();
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });

  const firstSheetName = wb.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("File Excel không có sheet nào.");
  }

  const worksheet = wb.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

  if (!rows || rows.length === 0) {
    throw new Error("File Excel không có dữ liệu.");
  }

  // Tìm dòng tiêu đề cột
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
        c.includes("ten hoc sinh") ||
        c.includes("ten giao ly sinh")
    );
    const hasCode = normalizedCells.some(
      (c) =>
        c.includes("ma giao ly sinh") ||
        c.includes("ma hoc sinh") ||
        c.includes("ma hs") ||
        c.includes("username") ||
        c.includes("tai khoan")
    );
    const hasScore = normalizedCells.some(
      (c) =>
        c.includes("mieng") ||
        c.includes("vo") ||
        c.includes("15") ||
        c.includes("1 tiet") ||
        c.includes("thi") ||
        c.includes("dtb") ||
        c.includes("trung binh")
    );

    if ((hasStt || hasCode || hasName) && hasScore) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    throw new Error(
      "Không tìm thấy dòng tiêu đề cột điểm hợp lệ trong file Excel. Vui lòng sử dụng file mẫu chuẩn."
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

  // Tìm vị trí các cột
  let usernameColIdx = -1;
  let tenThanhColIdx = -1;
  let hoTenColIdx = -1;
  let sttColIdx = -1;
  let gioiTinhColIdx = -1;

  // Cột điểm
  let miengColIdx = -1;
  let voColIdx = -1;
  let phut15ColIdx = -1;
  let tiet1ColIdx = -1;
  let thiColIdx = -1;

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
      clean.includes("ten giao ly sinh") ||
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
    } else if (clean.includes("mieng")) {
      if (miengColIdx === -1) miengColIdx = colIdx;
    } else if (clean.includes("vo")) {
      if (voColIdx === -1) voColIdx = colIdx;
    } else if (clean.includes("15") || clean.includes("15'") || clean.includes("15 phut")) {
      if (phut15ColIdx === -1) phut15ColIdx = colIdx;
    } else if (clean.includes("1 tiet") || clean.includes("mot tiet") || clean.includes("he so 2")) {
      if (tiet1ColIdx === -1) tiet1ColIdx = colIdx;
    } else if (clean.includes("thi") || clean.includes("thi hk") || clean.includes("thi hoc ky")) {
      if (thiColIdx === -1) thiColIdx = colIdx;
    }
  });

  const matchedStudents = new Set();
  const previewRows = [];
  const unmatchedRows = [];
  const parsedRecords = [];
  let totalScoreErrors = 0;

  for (let r = headerRowIndex + 1; r < rows.length; r++) {
    const row = rows[r] || [];
    const hasData = row.some((c) => c !== undefined && c !== null && String(c).trim() !== "");
    if (!hasData) continue;

    // Xác định học sinh
    let matchedStudent = null;

    if (usernameColIdx !== -1 && row[usernameColIdx]) {
      const uStr = String(row[usernameColIdx]).toLowerCase().trim();
      matchedStudent = rosterByUsername.get(uStr);
    }

    if (!matchedStudent && hoTenColIdx !== -1) {
      const tenThanhStr = tenThanhColIdx !== -1 ? String(row[tenThanhColIdx] || "").trim() : "";
      const hoTenStr = String(row[hoTenColIdx] || "").trim();
      const combined = `${tenThanhStr} ${hoTenStr}`.trim();

      if (combined) {
        matchedStudent = rosterByName.get(removeVietnameseTones(combined));
      }
      if (!matchedStudent && hoTenStr) {
        matchedStudent = rosterByName.get(removeVietnameseTones(hoTenStr));
      }
    }

    if (!matchedStudent && sttColIdx !== -1 && row[sttColIdx]) {
      matchedStudent = rosterByStt.get(String(row[sttColIdx]).trim());
    }

    if (!matchedStudent) {
      const rawName = hoTenColIdx !== -1 ? String(row[hoTenColIdx] || "").trim() : `Dòng ${r + 1}`;
      unmatchedRows.push({
        rowIndex: r + 1,
        rawName: rawName || `Dòng ${r + 1}`,
      });
      continue;
    }

    matchedStudents.add(matchedStudent.username);

    // Đọc điểm thành phần
    const rowErrors = [];
    
    const readField = (colIdx) => {
      if (colIdx === -1) return null;
      const raw = row[colIdx];
      const { value, error } = normalizeGradeScore(raw);
      if (error) {
        rowErrors.push(error);
        totalScoreErrors++;
      }
      return value;
    };

    const diem_mieng = readField(miengColIdx);
    const diem_vo = readField(voColIdx);
    const diem_15_phut = readField(phut15ColIdx);
    const diem_1_tiet = readField(tiet1ColIdx);
    const diem_thi = readField(thiColIdx);

    const scores = {
      diem_mieng,
      diem_vo,
      diem_15_phut,
      diem_1_tiet,
      diem_thi,
    };
    scores.diem_tb = computeDiemTB(scores);

    previewRows.push({
      student: matchedStudent,
      scores,
      errors: rowErrors,
    });

    parsedRecords.push({
      username: matchedStudent.username,
      nam_hoc: namHoc,
      hoc_ky: hocKyInt,
      lop: lop || matchedStudent.lop || "",
      diem_mieng,
      diem_vo,
      diem_15_phut,
      diem_1_tiet,
      diem_thi,
      diem_tb: scores.diem_tb,
    });
  }

  // Thống kê phân loại ĐTB
  let completedCount = 0;
  let excellentCount = 0;
  let goodCount = 0;
  let averageCount = 0;
  let weakCount = 0;
  let scoreSum = 0;
  let validCount = 0;

  previewRows.forEach(({ scores }) => {
    if (scores.diem_tb !== null && scores.diem_tb !== undefined) {
      completedCount++;
      const tb = Number(scores.diem_tb);
      scoreSum += tb;
      validCount++;
      if (tb >= 8.0) excellentCount++;
      else if (tb >= 6.5) goodCount++;
      else if (tb >= 5.0) averageCount++;
      else weakCount++;
    }
  });

  const classAverage = validCount > 0 ? (Math.round((scoreSum / validCount) * 10) / 10).toFixed(1) : "—";

  return {
    matchedCount: matchedStudents.size,
    totalStudents: rosterStudents.length,
    unmatchedRows,
    totalScoreErrors,
    previewRows,
    parsedRecords,
    summaryStats: {
      completedCount,
      excellentCount,
      goodCount,
      averageCount,
      weakCount,
      classAverage,
    },
  };
}
