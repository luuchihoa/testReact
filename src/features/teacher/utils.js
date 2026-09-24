import { GRADE_WEIGHTS } from "./constants.js";

export function getCurrentNamHoc(date = new Date()) {
  const year  = date.getFullYear();
  const month = date.getMonth(); // 0-indexed, tháng 9 = 8
  const startYear = month >= 8 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

// Tự tính điểm TB: CHỈ tính khi có ĐỦ CẢ 5 CỘT ĐIỂM (Miệng x1, Vở x1, 15' x1, 1 Tiết x2, Thi x3).
// Nếu thiếu bất kỳ cột nào, trả về null (giao diện hiển thị "—").
export function computeDiemTB(g) {
  if (!g) return null;
  const parts = [
    { v: g.diem_mieng,   w: GRADE_WEIGHTS.diem_mieng },
    { v: g.diem_vo,      w: GRADE_WEIGHTS.diem_vo },
    { v: g.diem_15_phut, w: GRADE_WEIGHTS.diem_15_phut },
    { v: g.diem_1_tiet,  w: GRADE_WEIGHTS.diem_1_tiet },
    { v: g.diem_thi,     w: GRADE_WEIGHTS.diem_thi },
  ];
  const hasAll = parts.every((p) => p.v !== null && p.v !== undefined && p.v !== "" && !isNaN(Number(p.v)));
  if (!hasAll) return null;
  const totalW = parts.reduce((s, p) => s + p.w, 0); // 8
  const sum    = parts.reduce((s, p) => s + Number(p.v) * p.w, 0);
  return Math.round((sum / totalW) * 10) / 10;
}

// Lấy "Tên" riêng (từ cuối cùng) trong Họ và Tên đầy đủ — dùng để xếp danh
// sách lớp theo thói quen VN: xếp theo Tên trước, không theo Họ.
// Vd: "Nguyễn Văn Anh" và "Trần Thị Châu" -> xếp theo "Anh" trước "Châu".
export function getTenRieng(hoTen) {
  const parts = (hoTen || "").trim().split(/\s+/).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : (hoTen || "");
}

export function sortStudentsByTen(students) {
  return [...students].sort((a, b) => {
    const nameA = a.hoTen || a.ho_va_ten || a.username || "";
    const nameB = b.hoTen || b.ho_va_ten || b.username || "";
    const cmp = getTenRieng(nameA).localeCompare(getTenRieng(nameB), "vi");
    if (cmp !== 0) return cmp;
    return nameA.localeCompare(nameB, "vi");
  });
}

// Phân tích chuỗi ngày YYYY-MM-DD an toàn tuyệt đối múi giờ
export function parseISODate(isoStr) {
  if (!isoStr) return new Date();
  if (isoStr instanceof Date) return isoStr;
  const parts = String(isoStr).trim().split("-");
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    return new Date(y, m, d, 12, 0, 0, 0);
  }
  return new Date(isoStr);
}

// Chuyển Date hoặc chuỗi sang định dạng chuẩn YYYY-MM-DD theo giờ địa phương
export function toISODate(d) {
  if (!d) return "";
  if (typeof d === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(d.trim())) return d.trim();
    d = parseISODate(d);
  }
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Trả về Chúa Nhật gần nhất KHÔNG ở tương lai: nếu hôm nay đã là Chúa Nhật thì trả
// về chính hôm nay; nếu chưa tới Chúa Nhật của tuần này thì lùi về Chúa Nhật tuần trước.
export function mostRecentSunday(base = new Date()) {
  const d = new Date(base);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

// Sinh danh sách các ngày điểm danh (mỗi buổi cách nhau 7 ngày), bắt đầu từ ngay_bat_dau.
export function buildSundayList(startRaw, tongBuoi) {
  const total = Number(tongBuoi) || 0;
  if (!startRaw || !total) return [];
  const startDate = parseISODate(startRaw);
  const list = [];
  for (let i = 0; i < total; i++) {
    const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i * 7, 12, 0, 0, 0);
    list.push(d);
  }
  return list;
}

export function formatVNDate(d) {
  if (!d) return "";
  const dateObj = typeof d === "string" ? parseISODate(d) : d;
  return `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${dateObj.getFullYear()}`;
}

// Giới hạn 1 ngày vào trong khoảng lịch điểm danh đã định sẵn (không vượt quá buổi đầu/cuối)
export function clampToSundayRange(target, sundays) {
  if (!sundays.length) return target;
  if (target < sundays[0]) return sundays[0];
  if (target > sundays[sundays.length - 1]) return sundays[sundays.length - 1];
  return target;
}

// Xác định đang ở học kỳ nào dựa trên ngày hiện tại: nếu đã bước vào lịch của
// học kỳ II thì ưu tiên học kỳ II, ngược lại mặc định học kỳ I.
export function resolveActiveHocKy(ranges, todaySunday) {
  const hk2 = ranges.HK2;
  if (hk2 && hk2.sundays.length && todaySunday >= hk2.sundays[0]) return "HK2";
  return "HK1";
}

// Lấy Chúa Nhật đầu tiên của tháng (month: 0-indexed, 8 = Tháng 9, 0 = Tháng 1)
export function getFirstSundayOfMonth(year, month) {
  const d = new Date(year, month, 1, 12, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

// Sinh khung lịch mặc định thông minh cho Niên khóa (16 tuần HK1 từ đầu tháng 9, 16 tuần HK2 từ đầu tháng 1)
export function getDefaultTermRanges(namHoc) {
  let startYear = new Date().getFullYear();
  if (namHoc && typeof namHoc === "string" && namHoc.includes("-")) {
    const parsed = parseInt(namHoc.split("-")[0], 10);
    if (!isNaN(parsed) && parsed >= 2000 && parsed <= 2100) {
      startYear = parsed;
    }
  }

  // HK1: Chúa Nhật đầu tiên tháng 9 của startYear (vd: 06/09/2026), 16 buổi
  const hk1Sunday = getFirstSundayOfMonth(startYear, 8);
  const hk1StartIso = toISODate(hk1Sunday);
  const hk1Sundays = buildSundayList(hk1StartIso, 16);

  // HK2: Chúa Nhật đầu tiên tháng 1 của startYear + 1 (vd: 10/01/2027), 16 buổi
  const hk2Sunday = getFirstSundayOfMonth(startYear + 1, 0);
  const hk2StartIso = toISODate(hk2Sunday);
  const hk2Sundays = buildSundayList(hk2StartIso, 16);

  return {
    HK1: { start: hk1StartIso, sundays: hk1Sundays, isDefault: true },
    HK2: { start: hk2StartIso, sundays: hk2Sundays, isDefault: true },
  };
}

// Màu chữ cho điểm TB, cùng ngôn ngữ màu với RANK_COLORS (Giỏi/Khá/TB/Yếu/Kém)
export function tbColorClass(tb) {
  if (tb === null || tb === undefined || tb === "") return "text-stone-400";
  const n = Number(tb);
  if (n >= 8)   return "text-[#34C759]";
  if (n >= 6.5) return "text-[#007AFF]";
  if (n >= 5)   return "text-[#FFD60A]";
  if (n >= 3.5) return "text-[#FF9500]";
  return "text-[#FF375F]";
}

// Trọng số Hạnh kiểm dùng cho Tiêu chí phụ khi xếp hạng
export const HANH_KIEM_WEIGHT = {
  "Tốt": 4,
  "Khá": 3,
  "Trung Bình": 2,
  "TB": 2,
  "Yếu": 1,
};

/**
 * So sánh thứ hạng giữa 2 học sinh theo chuẩn:
 * 1. Tiêu chí chính: Điểm Trung Bình (ĐTB) cao hơn xếp trên
 * 2. Tiêu chí phụ 1: Hạnh kiểm (Tốt > Khá > Trung Bình > Yếu)
 * 3. Tiêu chí phụ 2: Chuyên cần (Ít vắng không phép hơn -> Ít tổng vắng hơn)
 *
 * Trả về:
 * > 0 nếu A xếp TRÊN B (A tốt hơn B)
 * < 0 nếu B xếp TRÊN A (B tốt hơn A)
 * 0 nếu hoàn toàn bằng nhau (đồng hạng)
 */
export function compareStudentRank(a, b) {
  // 1. Tiêu chí chính: Điểm Trung Bình (ĐTB)
  const dtbA = Number(a?.diemTB);
  const dtbB = Number(b?.diemTB);
  if (dtbA !== dtbB) {
    return dtbA - dtbB; // Dương nếu A > B
  }

  // 2. Tiêu chí phụ 1: Hạnh kiểm
  const hkWeightA = HANH_KIEM_WEIGHT[a?.hanhKiem] || 0;
  const hkWeightB = HANH_KIEM_WEIGHT[b?.hanhKiem] || 0;
  if (hkWeightA !== hkWeightB) {
    return hkWeightA - hkWeightB; // Dương nếu A có hạnh kiểm tốt hơn B
  }

  // 3. Tiêu chí phụ 2: Chuyên cần (ít vắng hơn xếp trên)
  const vkpA = Number(a?.vangKhongPhep) || 0;
  const vkpB = Number(b?.vangKhongPhep) || 0;
  if (vkpA !== vkpB) {
    return vkpB - vkpA; // Dương nếu A ít vắng không phép hơn B
  }

  const tongVangA = (Number(a?.vangCoPhep) || 0) + vkpA;
  const tongVangB = (Number(b?.vangCoPhep) || 0) + vkpB;
  if (tongVangA !== tongVangB) {
    return tongVangB - tongVangA; // Dương nếu A ít tổng vắng hơn B
  }

  return 0; // Bằng nhau hoàn toàn -> Đồng hạng
}

/**
 * Tính thứ hạng chuẩn học đường (Standard Competition Ranking - 1224) kèm tiêu chí phụ
 * Trả về map: { [username]: viThu }
 */
export function computeClassRanks(students) {
  const validStudents = (students || []).filter(
    (s) => s?.diemTB !== null && s?.diemTB !== undefined && !isNaN(Number(s?.diemTB))
  );

  const ranks = {};
  (students || []).forEach((s) => {
    if (s?.diemTB === null || s?.diemTB === undefined || isNaN(Number(s?.diemTB))) {
      ranks[s.username] = null;
    } else {
      // Đếm số học sinh xếp TRÊN học sinh này (compareStudentRank > 0)
      const higherCount = validStudents.filter((other) => compareStudentRank(other, s) > 0).length;
      ranks[s.username] = higherCount + 1;
    }
  });

  return ranks;
}