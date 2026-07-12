import React, { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { pressable } from "./variant.jsx";
import { motion } from "framer-motion";

// ============================================================
//  CONSTANTS (dùng chung giữa ModalUser.jsx và TeacherClassView.jsx)
// ============================================================

export const GENDER_ICON = { "": "👤", "Nam": "👦🏻", "Nữ": "👧🏻" };

export const RANK_COLORS = {
  hoc_luc: {
    "Giỏi":       "text-[#34C759]",
    "Khá":        "text-[#007AFF]",
    "Trung Bình": "text-[#FFD60A]",
    "Yếu":        "text-[#FF9500]",
    "Kém":        "text-[#FF375F]",
  },
  hanh_kiem: {
    "Tốt":        "text-[#34C759]",
    "Khá":        "text-[#007AFF]",
    "Trung Bình": "text-[#FFD60A]",
    "Yếu":        "text-[#FF375F]",
  },
};

export const ATTENDANCE_STATUS = {
  co_mat:           { color: "bg-[#34C759]",                                      label: "Có mặt"          },
  nghi_phep:        { color: "bg-[#FFD60A]",                                      label: "Nghỉ có phép"    },
  nghi_khong_phep:  { color: "bg-[#FF375F]",                                      label: "Nghỉ không phép" },
  nghi_le:          { color: "bg-[#93C5FD]",                                      label: "Ngày nghỉ lễ"   },
  null:             { color: "bg-[#E5E5EA] border border-dashed border-[#C7C7CC]", label: "Chưa cập nhật"  },
};

// ============================================================
//  HELPERS
// ============================================================

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
    username:      raw.username ?? "",
    tenThanh:      raw.ten_thanh ?? "",
    hoTen:         raw.ho_va_ten ?? "",
    ngaySinh:      raw.ngay_sinh ?? "",
    ngayRuaToi:    raw.ngay_rua_toi ?? "",
    ngayRuocLe:    raw.ngay_ruoc_le ?? "",
    ngayThemSuc:   raw.ngay_them_suc ?? "",
    tenCha:        raw.ten_cha ?? "",
    tenMe:         raw.ten_me ?? "",
    sdt:           raw.sdt ?? "",
    giaoXom:       raw.giao_xom ?? "",
    gioiTinh:      raw.gioi_tinh ?? "",
    avatar:        raw.avatar ?? "",
    role:          raw.role ?? "student",
    trangThai:     raw.trang_thai ?? "Đang học",
  };
}

// Chuyển ngược shape UI → shape `users` (Supabase) để UPDATE
export function denormalizeStudent(ui) {
  return {
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
}

// ============================================================
//  SUB-COMPONENTS
// ============================================================

export function Spinner({ className = "h-4 w-4" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path  className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function StatCard({ label, value, colorClass = "text-gray-900 dark:text-stone-100" }) {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#F0F0F0] dark:border-stone-800 shadow-sm p-4">
      <p className={`text-[12px] text-gray-400 dark:text-stone-500 mb-1`}>{label}</p>
      <p className={`text-[20px] font-bold ${colorClass}`}>{value ?? "—"}</p>
    </div>
  );
}

export function ScoreCell({ label, value }) {
  return (
    <div className="bg-[#F9F9F9] dark:bg-stone-800/40 rounded-xl px-3 py-2.5 text-center flex-1 min-w-[64px]">
      <p className="text-[11px] text-gray-400 dark:text-stone-500 mb-0.5">{label}</p>
      <p className="text-[15px] font-semibold text-gray-900 dark:text-stone-150">{value ?? "—"}</p>
    </div>
  );
}

// Dòng hồ sơ có thể bấm để sửa tại chỗ — dùng lại nguyên vẹn cho cả
// trang "Hồ sơ của tôi" (học sinh tự sửa) lẫn trang giáo viên sửa hộ.
export function FieldRow({ icon, label, field, value, displayValue, type = "text", editingField, tempValue, setTempValue, onEdit, onBlur, options }) {
  const isEditing = editingField === field;
  return (
    <div className="flex items-center justify-between bg-[#F9F9F9] dark:bg-stone-850/60 rounded-2xl px-4 py-3.5">
      <div className="flex items-center gap-3.5 min-w-0">
        <span className="text-xl flex-shrink-0">{icon}</span>
        <div className="min-w-0">
          <div className="text-[12px] text-gray-400 dark:text-stone-500 mb-0.5">{label}</div>
          {!isEditing && (
            <div className="text-[15px] font-semibold text-gray-900 dark:text-stone-150 truncate">
              {displayValue ?? value ?? "—"}
            </div>
          )}
          {isEditing && options && (
            <select value={tempValue} onChange={(e) => setTempValue(e.target.value)} onBlur={onBlur} autoFocus
              className="mt-0.5 px-2.5 py-1.5 rounded-lg border border-[#E5E5EA] dark:border-stone-700 text-[15px] dark:text-stone-100 bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]">
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
          {isEditing && !options && (
            <input type={type} value={tempValue} onChange={(e) => setTempValue(e.target.value)} onBlur={onBlur} autoFocus
              className="mt-0.5 px-2.5 py-1.5 rounded-lg border border-[#E5E5EA] dark:border-stone-700 text-[15px] dark:text-stone-100 bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] w-full" />
          )}
        </div>
      </div>
      {!isEditing && (
        <motion.button {...pressable(1.15)} onClick={onEdit}
          className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-[#E5E5EA] dark:hover:bg-stone-800 flex items-center justify-center text-[15px]">
          ✏️
        </motion.button>
      )}
    </div>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = "Xác nhận", danger = false, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      {/* Overlay: Giảm độ mờ để dialog trông "nổi" hơn */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-all animate-in fade-in duration-200" onClick={onCancel} />
      
      {/* Dialog container: Thêm animation zoom nhẹ để có chiều sâu */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-3xl border border-white/20 dark:border-white/5
          bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-xl
          shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.05)]
          p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-200"
      >
        <div className="flex flex-col gap-2">
          {/* Icon: Nhẹ nhàng hơn, bớt thô */}
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            danger ? "bg-red-50 dark:bg-red-900/20 text-red-500"
                   : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          
          <div className="flex-1">
            <h4 className="text-base font-semibold text-stone-900 dark:text-white leading-tight">{title}</h4>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <button type="button" onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-300
              bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700
              active:scale-[0.98] transition-all">
            Hủy
          </button>
          <button type="button" onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white active:scale-[0.98]
              transition-all shadow-sm ${
              danger ? "bg-red-600 hover:bg-red-700 shadow-red-500/20" 
                     : "bg-stone-900 dark:bg-white dark:text-stone-900 hover:bg-stone-800"
            }`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}