/* ============================================================
   HẰNG SỐ DÙNG CHUNG CHO KHU VỰC /quản-trị
   ============================================================ */

export const ACCENT = "#314e3e";

export const ROLE_OPTIONS = ["admin", "teacher", "student", "user"];

export const ROLE_LABELS_VI = {
  admin: "Quản trị viên",
  teacher: "Giáo lý viên",
  student: "Giáo lý sinh",
  user: "Thành viên",
};

export const ROLE_BADGE = {
  admin:   "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
  teacher: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
  student: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  user:    "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
};

export const AVATAR_FALLBACK = "/images/avatarDefault.avif";

// Đổi role từ teacher/admin sang role thấp hơn cần xác nhận thêm
export const DOWNGRADE_ROLES = new Set(["admin", "teacher"]);

// Fallback khi URL avatar bị lỗi
export function handleAvatarError(e) {
  if (e.currentTarget.dataset.fallbackApplied) return;
  e.currentTarget.dataset.fallbackApplied = "1";
  e.currentTarget.src = AVATAR_FALLBACK;
}

// ── Đăng ký học Giáo lý (tab "Đăng ký") ──
export const DANG_KY_STATUS_TABS = ["all", "moi", "da_lien_he", "da_xep_lop", "tu_choi"];

export const DANG_KY_LABELS_VI = {
  all:        "Tất cả",
  moi:        "Chờ xử lý (Mới)",
  da_lien_he: "Đã liên hệ",
  da_xep_lop: "Đã xếp lớp",
  tu_choi:    "Từ chối",
};

export const DANG_KY_BADGE = {
  all:        "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300",
  moi:        "bg-amber-100 text-amber-900 border border-amber-300/50 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/50",
  da_lien_he: "bg-blue-100 text-blue-900 border border-blue-300/50 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/50",
  da_xep_lop: "bg-emerald-100 text-emerald-900 border border-emerald-300/50 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/50",
  tu_choi:    "bg-red-100 text-red-900 border border-red-300/50 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/50",
};

// ── Góp ý & Liên hệ (tab "Góp ý") ──
export const LIEN_HE_STATUS_TABS = ["all", "moi", "da_doc", "da_xu_ly"];

export const LIEN_HE_LABELS_VI = {
  all:      "Tất cả",
  moi:      "Chờ phản hồi (Mới)",
  da_doc:   "Đã đọc",
  da_xu_ly: "Đã xử lý",
};

export const LIEN_HE_BADGE = {
  all:      "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300",
  moi:      "bg-amber-100 text-amber-900 border border-amber-300/50 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/50",
  da_doc:   "bg-blue-100 text-blue-900 border border-blue-300/50 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/50",
  da_xu_ly: "bg-emerald-100 text-emerald-900 border border-emerald-300/50 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/50",
};

export function getCurrentNamHoc(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed, tháng 9 = 8
  const startYear = month >= 8 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}