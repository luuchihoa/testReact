/* ============================================================
   HẰNG SỐ DÙNG CHUNG CHO KHU VỰC /quan-tri
   Tách nguyên vẹn từ AdminView.jsx cũ — KHÔNG đổi logic, chỉ đổi vị trí
   để các tab (DashboardTab, UsersTab, ClassesTab, ...) cùng import được.
   ============================================================ */

export const ACCENT = "#dc2626"; // đỏ — trùng ROLE_ACCENTS.admin trong Header.jsx

export const ROLE_OPTIONS = ["admin", "teacher", "student", "user"];

export const ROLE_LABELS_VI = {
  admin: "Quản trị viên",
  teacher: "Giáo viên",
  student: "Học sinh",
  user: "Thành viên",
};

export const ROLE_BADGE = {
  admin:   "bg-red-50 text-red-600",
  teacher: "bg-blue-50 text-blue-600",
  student: "bg-emerald-50 text-emerald-600",
  user:    "bg-stone-100 text-stone-500",
};

export const AVATAR_FALLBACK = "/images/avatarDefault.avif";

// Đổi role từ teacher/admin sang role thấp hơn cần xác nhận thêm — tránh
// bấm nhầm trên <select> làm mất quyền của người khác hàng loạt.
export const DOWNGRADE_ROLES = new Set(["admin", "teacher"]);

// Fallback khi URL avatar bị lỗi (404, hỏng, domain chặn hotlink...) —
// tránh icon ảnh vỡ, chỉ chạy 1 lần nhờ cờ trên dataset để không loop nếu
// chính fallback cũng lỗi.
export function handleAvatarError(e) {
  if (e.currentTarget.dataset.fallbackApplied) return;
  e.currentTarget.dataset.fallbackApplied = "1";
  e.currentTarget.src = AVATAR_FALLBACK;
}

export function getCurrentNamHoc(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed, tháng 9 = 8
  const startYear = month >= 8 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}