import React from "react";
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

export function StatCard({ label, value, colorClass = "text-gray-900" }) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0F0F0] shadow-sm p-4">
      <p className={`text-[12px] text-gray-400 mb-1`}>{label}</p>
      <p className={`text-[20px] font-bold ${colorClass}`}>{value ?? "—"}</p>
    </div>
  );
}

export function ScoreCell({ label, value }) {
  return (
    <div className="bg-[#F9F9F9] rounded-xl px-3 py-2.5 text-center flex-1 min-w-[64px]">
      <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
      <p className="text-[15px] font-semibold text-gray-900">{value ?? "—"}</p>
    </div>
  );
}

// Dòng hồ sơ có thể bấm để sửa tại chỗ — dùng lại nguyên vẹn cho cả
// trang "Hồ sơ của tôi" (học sinh tự sửa) lẫn trang giáo viên sửa hộ.
export function FieldRow({ icon, label, field, value, displayValue, type = "text", editingField, tempValue, setTempValue, onEdit, onBlur, options }) {
  const isEditing = editingField === field;
  return (
    <div className="flex items-center justify-between bg-[#F9F9F9] rounded-2xl px-4 py-3.5">
      <div className="flex items-center gap-3.5 min-w-0">
        <span className="text-xl flex-shrink-0">{icon}</span>
        <div className="min-w-0">
          <div className="text-[12px] text-gray-400 mb-0.5">{label}</div>
          {!isEditing && (
            <div className="text-[15px] font-semibold text-gray-900 truncate">
              {displayValue ?? value ?? "—"}
            </div>
          )}
          {isEditing && options && (
            <select value={tempValue} onChange={(e) => setTempValue(e.target.value)} onBlur={onBlur} autoFocus
              className="mt-0.5 px-2.5 py-1.5 rounded-lg border border-[#E5E5EA] text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]">
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
          {isEditing && !options && (
            <input type={type} value={tempValue} onChange={(e) => setTempValue(e.target.value)} onBlur={onBlur} autoFocus
              className="mt-0.5 px-2.5 py-1.5 rounded-lg border border-[#E5E5EA] text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35] w-full" />
          )}
        </div>
      </div>
      {!isEditing && (
        <motion.button {...pressable(1.15)} onClick={onEdit}
          className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-[#E5E5EA] flex items-center justify-center text-[15px]">
          ✏️
        </motion.button>
      )}
    </div>
  );
}