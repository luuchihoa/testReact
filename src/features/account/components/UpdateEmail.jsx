import React, { useState } from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { supabase } from "../../../lib/supabase.js";
import Backdrop from "../../../components/ui/Backdrop.jsx";
import { modalVariant, pressable } from "../../../components/ui/variant.jsx";
import { useToast } from "../../../components/ui/ToastContext.jsx";
import { Spinner } from "./SharedComponents.jsx";

export function UpdateEmail({ setIsOpenUpdateEmail, currentEmail }) {
  const { showToast }   = useToast();
  const [newEmail,        setNewEmail]        = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [saveLoading,     setSaveLoading]     = useState(false);
  const [showPassword,    setShowPassword]    = useState(false);

  const close = () => setIsOpenUpdateEmail(false);

  const submit = async () => {
    if (!newEmail || !currentPassword) return showToast("Vui lòng nhập đầy đủ thông tin", "warning");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) return showToast("Email không hợp lệ", "warning");

    setSaveLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: reAuthError } = await supabase.auth.signInWithPassword({ email: user?.email, password: currentPassword });
      if (reAuthError) { showToast("Mật khẩu hiện tại không đúng", "error"); return; }
      
      const { error: updateError } = await supabase.auth.updateUser({ email: newEmail });
      if (updateError) {
        let msg = updateError.message;
        if (msg.includes("already been registered")) {
          msg = "Email này đã được sử dụng bởi một tài khoản khác.";
        }
        showToast(msg || "Đổi email thất bại", "error"); 
        return; 
      }
      
      showToast("Vui lòng kiểm tra hộp thư của email mới để xác nhận", "success");
      close();
    } catch (err) {
      showToast("Lỗi kết nối server", "warning");
    } finally {
      setSaveLoading(false);
    }
  };

  const inputCls = "w-full rounded-xl border border-amber-900/10 dark:border-amber-100/10 bg-white dark:bg-stone-800/50 px-4 py-3 pr-12 text-[14px] font-medium text-amber-950 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-900/20 dark:focus:ring-amber-500/30 transition disabled:opacity-60";

  return createPortal(
    <Backdrop handleClose={saveLoading ? undefined : close}>
      <motion.div {...modalVariant()} className="w-full max-w-md mx-4 rounded-3xl bg-[#FDFBF7] dark:bg-[#1C1917] p-6 shadow-2xl border border-amber-900/10 dark:border-amber-100/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100/50 dark:bg-amber-500/20 flex items-center justify-center text-amber-800 dark:text-amber-400 border border-amber-900/5 dark:border-amber-100/5">📧</div>
            <h2 className="text-[18px] font-bold text-amber-950 dark:text-amber-50 font-serif">Cập nhật Email</h2>
          </div>
          <button type="button" onClick={close} disabled={saveLoading} aria-label="Đóng" className="w-8 h-8 rounded-full bg-amber-900/5 hover:bg-amber-900/10 dark:bg-amber-100/5 dark:hover:bg-amber-100/10 text-stone-500 flex items-center justify-center transition-colors active:scale-90 disabled:opacity-40">✕</button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="newEmail" className="text-[12px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1 mb-1.5 inline-block">Email mới</label>
            <input id="newEmail" type="email" placeholder="Nhập địa chỉ email thật của bạn" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} autoFocus disabled={saveLoading} className={inputCls} />
          </div>
          <div>
            <label htmlFor="currentPassword" className="text-[12px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1 mb-1.5 inline-block">Xác nhận mật khẩu</label>
            <div className="relative">
              <input id="currentPassword" type={showPassword ? "text" : "password"} placeholder="Nhập mật khẩu hiện tại" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={saveLoading} className={inputCls} />
              <button type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-800 dark:hover:text-amber-400 text-[12px] font-bold">
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-7 flex gap-3">
          <motion.button {...(saveLoading ? {} : pressable())} disabled={saveLoading} onClick={close} className="flex-1 py-3 rounded-xl bg-amber-900/5 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[14px] font-bold hover:bg-amber-900/10 dark:hover:bg-stone-700 transition-colors disabled:opacity-40">Hủy</motion.button>
          <motion.button {...(saveLoading ? {} : pressable())} disabled={saveLoading} onClick={submit} className="flex-1 py-3 rounded-xl bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white text-[14px] font-bold md:hover:opacity-90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm">
            {saveLoading && <Spinner />} {saveLoading ? "Đang xử lý…" : "Cập nhật Email"}
          </motion.button>
        </div>
      </motion.div>
    </Backdrop>,
    document.getElementById("tai-khoan-page")
  );
}
