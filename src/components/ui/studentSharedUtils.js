// ============================================================
//  CONSTANTS & UTILS for Student records
// ============================================================

export const GENDER_ICON = { "": "👤", "Nam": "👦🏻", "Nữ": "👧🏻" };

export const RANK_COLORS = {
  hoc_luc: {
    "Giỏi":       "text-emerald-800 dark:text-emerald-300",
    "Khá":        "text-blue-800 dark:text-blue-300",
    "Trung Bình": "text-amber-800 dark:text-amber-300",
    "TB":         "text-amber-800 dark:text-amber-300",
    "Yếu":        "text-rose-800 dark:text-rose-300",
    "Kém":        "text-red-800 dark:text-red-300",
  },
  hanh_kiem: {
    "Tốt":        "text-emerald-800 dark:text-emerald-300",
    "Khá":        "text-blue-800 dark:text-blue-300",
    "Trung Bình": "text-amber-800 dark:text-amber-300",
    "TB":         "text-amber-800 dark:text-amber-300",
    "Yếu":        "text-rose-800 dark:text-rose-300",
  },
};

export const ATTENDANCE_STATUS = {
  co_mat:           { color: "bg-[#34C759]",                                      label: "Có mặt"          },
  nghi_phep:        { color: "bg-[#FFD60A]",                                      label: "Nghỉ có phép"    },
  nghi_khong_phep:  { color: "bg-[#FF375F]",                                      label: "Nghỉ không phép" },
  nghi_le:          { color: "bg-[#007AFF]",                                      label: "Ngày nghỉ lễ"    },
  null:             { color: "bg-stone-200 dark:bg-stone-700 border border-dashed border-stone-400 dark:border-stone-500", label: "Chưa cập nhật" },
};

export function formatRank(val) {
  if (!val) return "—";
  if (val === "Trung Bình") return "TB";
  return val;
}

export const formatHocLuc = formatRank;
export const formatHanhKiem = formatRank;

export function transferDateForView(value) {
  if (!value) return "";
  const dateObj = new Date(value);
  const day   = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year  = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
}

export function safeStore(key, value) {
  try { localStorage.setItem(key, value); } catch { /* quota / private mode */ }
}

// Chuẩn hoá 1 dòng từ bảng `users` (Supabase) sang shape mà UI cần
export function normalizeStudent(raw) {
  if (!raw) return {};
  return {
    username:        raw.username ?? "",
    tenThanh:        raw.ten_thanh ?? "",
    hoTen:           raw.ho_va_ten ?? "",
    ngaySinh:        raw.ngay_sinh ?? "",
    ngayRuaToi:      raw.ngay_rua_toi ?? "",
    ngayRuocLe:      raw.ngay_ruoc_le ?? "",
    ngayThemSuc:     raw.ngay_them_suc ?? "",
    tenCha:          raw.ten_cha ?? "",
    tenMe:           raw.ten_me ?? "",
    sdt:             raw.sdt ?? "",
    giaoXom:         raw.giao_xom ?? "",
    gioiTinh:        raw.gioi_tinh ?? "",
    avatar:          raw.avatar ?? "",
    role:            raw.role ?? "student",
    trangThai:       raw.trang_thai ?? "Đang học",
    isProfileLocked: Boolean(raw.is_profile_locked),
    profileLockedBy: raw.profile_locked_by || null,
    profileLockedAt: raw.profile_locked_at || null,
  };
}

// Chuyển ngược shape UI → shape `users` (Supabase) để UPDATE
export function denormalizeStudent(ui) {
  const result = {
    ten_thanh:     ui.tenThanh    ?? null,
    ho_va_ten:     ui.hoTen       ?? null,
    ngay_sinh:     ui.ngaySinh    || null,
    ngay_rua_toi:  ui.ngayRuaToi  || null,
    ngay_ruoc_le:  ui.ngayRuocLe  || null,
    ngay_them_suc: ui.ngayThemSuc || null,
    ten_cha:       ui.tenCha      ?? null,
    ten_me:        ui.tenMe       ?? null,
    sdt:           ui.sdt         ?? null,
    giao_xom:      ui.giaoXom     ?? null,
    gioi_tinh:     ui.gioiTinh    || null,
  };

  if ("isProfileLocked" in ui) {
    result.is_profile_locked = Boolean(ui.isProfileLocked);
  }
  if ("profileLockedBy" in ui) {
    result.profile_locked_by = ui.profileLockedBy || null;
  }
  if ("profileLockedAt" in ui) {
    result.profile_locked_at = ui.profileLockedAt || null;
  }

  return result;
}
