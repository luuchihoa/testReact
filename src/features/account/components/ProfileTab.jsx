import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { pressable } from "../../../components/ui/variant.jsx";
import { useToast } from "../../../components/ui/ToastContext.jsx";
import { transferDateForView, isPastOrToday, isValidVNPhone, isDefaultAvatarUrl, getDefaultAvatarByGender, safeParse, safeStore, denormalizeStudent } from "../utils.js";
import { supabase } from "../../../lib/supabase.js";
import { ChangePassword } from "./ChangePassword.jsx";
import { UpdateEmail } from "./UpdateEmail.jsx";
import { FieldRow, ProfileSkeleton } from "./ProfileFields.jsx";

const DATE_FIELDS = ["ngaySinh", "ngayRuaToi", "ngayRuocLe", "ngayThemSuc"];
const GENDER_ICON = { "": "👤", "Nam": "👦🏻", "Nữ": "👧🏻" };

export function ProfileTab({ handleLogout, user, setUser, setIsAnyChange, isAnyChange }) {
  const { showToast } = useToast();
  const [editingField, setEditingField] = useState(null);
  const [tempValue,    setTempValue]    = useState("");
  const [isSaving,     setIsSaving]     = useState(false);
  const [isOpenChangePass, setIsOpenChangePass] = useState(false);
  const [isOpenUpdateEmail, setIsOpenUpdateEmail] = useState(false);

  const editField = (field) => (e) => { e.preventDefault(); setEditingField(field); setTempValue(user[field] ?? ""); };
  const cancelEdit = () => { setEditingField(null); setTempValue(""); };

  const handleSave = async () => {
    if (!user.username) return;
    setIsSaving(true);
    try {
      const payload = denormalizeStudent(user);
      const { error } = await supabase.from("users").update(payload).eq("username", user.username);
      if (error) throw error;
      safeStore("user", JSON.stringify(user));
      setIsAnyChange(false);
      showToast("Đã lưu thông tin!", "success");
    } catch (err) {
      showToast(err.message || "Lỗi khi lưu thông tin", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    const savedData = safeParse("user", null);
    if (savedData) setUser(savedData);
    setIsAnyChange(false);
  };

  const handleBlur = (field) => {
    if (field === "sdt" && !isValidVNPhone(tempValue)) { showToast("Số điện thoại chưa đúng định dạng", "warning"); cancelEdit(); return; }
    if (DATE_FIELDS.includes(field) && !isPastOrToday(tempValue)) { showToast("Ngày không được ở trong tương lai", "warning"); cancelEdit(); return; }
    if (tempValue !== user[field]) setIsAnyChange(true);
    setUser((prev) => {
      const next = { ...prev, [field]: tempValue };
      if (field === "gioiTinh" && isDefaultAvatarUrl(prev.avatar)) next.avatar = getDefaultAvatarByGender(tempValue);
      return next;
    });
    setEditingField(null); setTempValue("");
  };

  const isStaff = user.role === "admin" || user.role === "teacher";

  const basicFields = [
    { icon: GENDER_ICON[user.gioiTinh] ?? "👤", label: "Họ và tên", field: "hoTen" },
    { icon: "✝️", label: "Tên Thánh", field: "tenThanh" },
    { icon: "🎂", label: "Ngày sinh", field: "ngaySinh", type: "date", displayValue: transferDateForView(user.ngaySinh) },
    { icon: "⚧️", label: "Giới tính", field: "gioiTinh", options: ["Nam", "Nữ"] },
  ];

  const sacrementFields = !isStaff ? [
    { icon: "💦", label: "Ngày Rửa Tội", field: "ngayRuaToi", type: "date", displayValue: transferDateForView(user.ngayRuaToi) },
    { icon: "🫓", label: "Ngày Rước Lễ", field: "ngayRuocLe", type: "date", displayValue: transferDateForView(user.ngayRuocLe) },
    { icon: "🕊️", label: "Ngày Thêm Sức", field: "ngayThemSuc",type: "date", displayValue: transferDateForView(user.ngayThemSuc) },
  ] : [];

  const contactFields = [
    { icon: "📞", label: "Số điện thoại", field: "sdt" },
    { icon: "🏠", label: "Giáo Xóm", field: "giaoXom" },
    ...(!isStaff ? [
      { icon: "👨🏻", label: "Họ & Tên Cha", field: "tenCha" },
      { icon: "👩🏻", label: "Họ & Tên Mẹ", field: "tenMe" },
    ] : []),
  ];

  const renderSection = (title, icon, fields) => {
    if (!fields || fields.length === 0) return null;
    return (
      <div className="mb-8">
        <h3 className="text-[14px] font-bold text-amber-950 dark:text-amber-50 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>{icon}</span> {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fields.map((r) => (
            <FieldRow key={r.field} icon={r.icon} label={r.label} field={r.field} value={user[r.field]} displayValue={r.displayValue} type={r.type} options={r.options} editingField={editingField} tempValue={tempValue} setTempValue={setTempValue} onEdit={editField(r.field)} onBlur={() => handleBlur(r.field)} onCancel={cancelEdit} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* 1. THÔNG TIN CƠ BẢN */}
      {renderSection("Thông tin cơ bản", "📋", basicFields)}

      {/* 2. THÔNG TIN BÍ TÍCH */}
      {renderSection("Thông tin Bí tích", "⛪", sacrementFields)}

      {/* 3. GIA ĐÌNH & LIÊN HỆ */}
      {renderSection("Gia đình & Liên hệ", "👨‍👩‍👧‍👦", contactFields)}

      {/* 4. TÀI KHOẢN & BẢO MẬT */}
      <div className="mb-4">
        <h3 className="text-[14px] font-bold text-amber-950 dark:text-amber-50 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>🛡️</span> Tài khoản & Bảo mật
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          {/* Email Khôi Phục */}
          <div className="flex items-center justify-between bg-white/60 dark:bg-stone-800/40 backdrop-blur-sm border border-amber-900/10 dark:border-amber-100/10 rounded-2xl px-4 py-3.5 shadow-sm">
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="text-xl flex-shrink-0 opacity-90">📧</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Email</span>
                  {user.email?.endsWith("@giaoly.local") && (
                    <span className="text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-1.5 py-0.5 rounded shadow-sm">Chưa cập nhật</span>
                  )}
                </div>
                <div className={`text-[14px] font-bold truncate ${user.email?.endsWith("@giaoly.local") ? "text-stone-400 dark:text-stone-500 italic" : "text-amber-950 dark:text-amber-50"}`}>
                  {user.email?.endsWith("@giaoly.local") ? "Chưa có email thực" : user.email}
                </div>
              </div>
            </div>
            <motion.button {...pressable()} onClick={() => setIsOpenUpdateEmail(true)} className="flex-shrink-0 text-[12px] font-bold px-3.5 py-2 rounded-xl bg-amber-900/5 hover:bg-amber-900/10 dark:bg-amber-100/5 dark:hover:bg-amber-100/10 text-amber-800 dark:text-amber-400 transition-colors">
              Cập nhật
            </motion.button>
          </div>

          {/* Đổi mật khẩu */}
          <div className="flex items-center justify-between bg-white/60 dark:bg-stone-800/40 backdrop-blur-sm border border-amber-900/10 dark:border-amber-100/10 rounded-2xl px-4 py-3.5 shadow-sm">
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="text-xl flex-shrink-0 opacity-90">🔒</span>
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-0.5">Mật khẩu</div>
                <div className="text-[15px] font-bold text-amber-950 dark:text-amber-50 truncate">••••••••</div>
              </div>
            </div>
            <motion.button {...pressable()} onClick={() => setIsOpenChangePass(true)} className="flex-shrink-0 text-[12px] font-bold px-3.5 py-2 rounded-xl bg-amber-900/5 hover:bg-amber-900/10 dark:bg-amber-100/5 dark:hover:bg-amber-100/10 text-amber-800 dark:text-amber-400 transition-colors">
              Thay đổi
            </motion.button>
          </div>

          {/* Đăng xuất */}
          <motion.button 
            {...pressable(0.98)} 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 bg-white/60 dark:bg-stone-800/40 hover:bg-red-50 dark:hover:bg-red-500/10 backdrop-blur-sm border border-red-100 dark:border-red-500/10 rounded-2xl px-4 py-4 shadow-sm text-[15px] font-bold text-red-600 dark:text-red-400 transition-colors"
          >
            Đăng xuất
          </motion.button>

        </div>
      </div>

      {/* FLOAT SAVE BUTTON (PILL ACTION BAR) */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isAnyChange && (
            <div className="fixed bottom-[100px] md:bottom-10 left-0 w-full z-[9999] flex justify-center pointer-events-none px-4">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="pointer-events-auto w-auto max-w-[95%] md:max-w-max bg-stone-900/95 dark:bg-stone-800/95 backdrop-blur-xl rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.4)] border border-white/10 dark:border-white/5 flex items-center justify-between pl-4 pr-1.5 py-1.5 md:py-2 gap-3 md:gap-6 md:px-3 md:pl-6"
              >
                <div className="flex items-center gap-2 min-w-0 pr-1 md:pr-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                  <span className="text-[13px] md:text-[14px] font-bold text-stone-100 whitespace-nowrap">
                    Có thay đổi chưa lưu
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <motion.button 
                    {...pressable()} 
                    onClick={handleDiscard}
                    className="px-3.5 py-2 md:px-5 md:py-2.5 rounded-full bg-stone-800/50 hover:bg-stone-700/80 text-stone-300 text-[12px] md:text-[13px] font-bold transition-colors"
                  >
                    Hủy
                  </motion.button>
                  <motion.button 
                    {...pressable()} 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="px-4 py-2 md:px-6 md:py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 text-[12px] md:text-[13px] font-extrabold transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <svg className="h-4 w-4 animate-spin text-stone-900" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                    ) : "Lưu lại"}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <AnimatePresence>
        {isOpenChangePass && <ChangePassword setIsOpenChangePass={setIsOpenChangePass} />}
        {isOpenUpdateEmail && <UpdateEmail setIsOpenUpdateEmail={setIsOpenUpdateEmail} currentEmail={user.email} />}
      </AnimatePresence>
    </div>
  );
}

export { ProfileSkeleton };
