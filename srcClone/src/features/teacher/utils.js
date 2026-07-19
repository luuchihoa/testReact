import { GRADE_WEIGHTS } from "./constants.js";

export function getCurrentNamHoc(date = new Date()) {
  const year  = date.getFullYear();
  const month = date.getMonth(); // 0-indexed, tháng 9 = 8
  const startYear = month >= 8 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

// Tự tính điểm TB dựa trên các điểm thành phần đã có (bỏ qua ô còn trống).
// Trả về null nếu chưa có điểm thành phần nào để tránh hiện "0" gây hiểu lầm.
export function computeDiemTB(g) {
  const parts = [
    { v: g.diem_mieng,   w: GRADE_WEIGHTS.diem_mieng },
    { v: g.diem_vo,      w: GRADE_WEIGHTS.diem_vo },
    { v: g.diem_15_phut, w: GRADE_WEIGHTS.diem_15_phut },
    { v: g.diem_1_tiet,  w: GRADE_WEIGHTS.diem_1_tiet },
    { v: g.diem_thi,     w: GRADE_WEIGHTS.diem_thi },
  ];
  const valid = parts.filter((p) => p.v !== null && p.v !== undefined && p.v !== "");
  if (valid.length === 0) return null;
  const totalW = valid.reduce((s, p) => s + p.w, 0);
  const sum    = valid.reduce((s, p) => s + Number(p.v) * p.w, 0);
  return Math.round((sum / totalW) * 100) / 100;
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
    const cmp = getTenRieng(a.hoTen).localeCompare(getTenRieng(b.hoTen), "vi");
    if (cmp !== 0) return cmp;
    return (a.hoTen || "").localeCompare(b.hoTen || "", "vi");
  });
}

// Trả về Chủ Nhật gần nhất KHÔNG ở tương lai: nếu hôm nay đã là Chủ Nhật thì trả
// về chính hôm nay; nếu chưa tới Chủ Nhật của tuần này thì lùi về Chủ Nhật tuần trước.
export function mostRecentSunday(base = new Date()) {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

// Sinh danh sách các ngày điểm danh (mỗi buổi cách nhau 7 ngày), bắt đầu từ ngay_bat_dau.
export function buildSundayList(startRaw, tongBuoi) {
  const total = Number(tongBuoi) || 0;
  if (!startRaw || !total) return [];
  const startDate = new Date(startRaw);
  const list = [];
  for (let i = 0; i < total; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i * 7);
    list.push(d);
  }
  return list;
}

export function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

export function formatVNDate(d) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
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