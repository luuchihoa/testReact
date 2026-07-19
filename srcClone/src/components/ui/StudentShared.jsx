import React, { useEffect } from "react";
import { AlertTriangle, Edit2 } from "lucide-react";
import { pressable } from "./variant.jsx";
import { motion, AnimatePresence } from "framer-motion";

// Hằng số Easing chuyển động chuẩn hệ thống Apple HIG
const APPLE_EASE = [0.16, 1, 0.3, 1];

// ============================================================
//  CONSTANTS (dùng chung giữa ModalUser.jsx và TeacherClassView.jsx)[cite: 9]
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
  nghi_le:          { color: "bg-[#007AFF]",                                      label: "Ngày nghỉ lễ"    },
  null:             { color: "bg-stone-200 dark:bg-stone-700 border border-dashed border-stone-400 dark:border-stone-500", label: "Chưa cập nhật" },
};

// ============================================================
//  HELPERS[cite: 9]
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

// Chuẩn hoá 1 dòng từ bảng `users` (Supabase) sang shape mà UI cần[cite: 9]
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

// Chuyển ngược shape UI → shape `users` (Supabase) để UPDATE[cite: 9]
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
//  SUB-COMPONENTS[cite: 9]
// ============================================================

export function StatCard({ label, value, colorClass = "text-amber-950 dark:text-amber-50" }) {
  return (
    <div className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[24px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm p-4 sm:p-5 transition-all">
      <p className="text-[11px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-1.5">{label}</p>
      <p className={`text-[22px] sm:text-[24px] font-extrabold font-serif ${colorClass}`}>{value ?? "—"}</p>
    </div>
  );
}

export function ScoreCell({ label, value }) {
  return (
    <div className="bg-white/50 dark:bg-stone-900/40 rounded-[16px] px-3 py-3 text-center flex-1 min-w-[64px] border border-amber-900/5 dark:border-amber-100/5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-1">{label}</p>
      <p className="text-[15px] font-bold text-amber-950 dark:text-amber-50">{value ?? "—"}</p>
    </div>
  );
}

export function FieldRow({ icon, label, field, value, displayValue, type = "text", editingField, tempValue, setTempValue, onEdit, onBlur, options }) {
  const isEditing = editingField === field;
  return (
    <div className="flex items-center justify-between bg-white/60 dark:bg-[#1C1917]/60 border border-amber-900/10 dark:border-amber-100/10 rounded-[20px] px-4 py-4 shadow-sm transition-all">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <span className="text-[22px] flex-shrink-0 drop-shadow-sm">{icon}</span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-1">{label}</div>
          
          {!isEditing && (
            <div className="text-[15px] font-semibold text-amber-950 dark:text-amber-50 truncate">
              {displayValue ?? value ?? "—"}
            </div>
          )}
          
          {isEditing && options && (
            <select 
              value={tempValue} 
              onChange={(e) => setTempValue(e.target.value)} 
              onBlur={onBlur} 
              autoFocus
              className="mt-0.5 w-full px-3 py-2 rounded-xl border border-amber-900/20 dark:border-amber-100/20 text-[14.5px] font-medium text-amber-950 dark:text-amber-50 bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600/50 shadow-inner"
            >
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
          
          {isEditing && !options && (
            <input 
              type={type} 
              value={tempValue} 
              onChange={(e) => setTempValue(e.target.value)} 
              onBlur={onBlur} 
              autoFocus
              className="mt-0.5 w-full px-3 py-2 rounded-xl border border-amber-900/20 dark:border-amber-100/20 text-[14.5px] font-medium text-amber-950 dark:text-amber-50 bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600/50 shadow-inner" 
            />
          )}
        </div>
      </div>
      
      {!isEditing && (
        <motion.button 
          {...pressable(0.9)} 
          onClick={onEdit}
          className="flex-shrink-0 w-9 h-9 ml-3 rounded-full bg-stone-100 dark:bg-stone-800 border border-black/5 dark:border-white/5 hover:bg-amber-100 dark:hover:bg-amber-900/40 flex items-center justify-center text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
        >
          <Edit2 className="w-4 h-4" strokeWidth={2.5} />
        </motion.button>
      )}
    </div>
  );
}

// ============================================================
//  CONFIRM DIALOG (Đồng bộ Framer Motion)
// ============================================================
export function ConfirmDialog({ open, title, message, confirmLabel = "Xác nhận", danger = false, onConfirm, onCancel }) {
  // Lắng nghe phím ESC để đóng[cite: 9]
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-5">
          {/* Lớp Overlay Kính mờ */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: APPLE_EASE }}
            className="absolute inset-0 bg-stone-900/40 dark:bg-black/60 backdrop-blur-sm" 
            onClick={onCancel} 
          />
          
          {/* Hộp thoại xác nhận */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.4, ease: APPLE_EASE }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-[28px] sm:rounded-[24px] border border-amber-900/10 dark:border-amber-100/10 bg-white/95 dark:bg-[#1C1917]/95 backdrop-blur-xl shadow-2xl p-6 sm:p-7 flex flex-col gap-5"
          >
            <div className="flex flex-col gap-3.5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm border ${
                danger ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20"
                       : "bg-amber-100/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/30"
              }`}>
                <AlertTriangle className="w-5.5 h-5.5" strokeWidth={2.5} />
              </div>
              
              <div className="flex-1">
                <h4 className="text-[20px] font-extrabold font-serif text-amber-950 dark:text-amber-50 leading-tight tracking-tight">
                  {title}
                </h4>
                <p className="text-[14px] font-medium text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 mt-2">
              <button 
                type="button" 
                onClick={onCancel}
                className="flex-1 px-4 py-3.5 sm:py-3 rounded-xl text-[14px] font-bold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 border border-black/5 dark:border-white/5 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-[0.98] transition-all duration-300"
              >
                Hủy
              </button>
              <button 
                type="button" 
                onClick={onConfirm}
                className={`flex-1 px-4 py-3.5 sm:py-3 rounded-xl text-[14px] font-bold text-white active:scale-[0.98] transition-all duration-300 shadow-sm ${
                  danger ? "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600" 
                         : "bg-amber-900 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}