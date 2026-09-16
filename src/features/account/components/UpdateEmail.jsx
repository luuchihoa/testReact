import React, { useState } from "react";
import { motion as Motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Mail, X, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../../lib/supabase.js";
import Backdrop from "../../../components/ui/Backdrop.jsx";
import { modalVariant, pressable } from "../../../components/ui/variant.jsx";
import { useToast } from "../../../components/ui/ToastContext.jsx";
import { Spinner } from "./SharedComponents.jsx";

export function UpdateEmail({ setIsOpenUpdateEmail }) {
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
    } catch {
      showToast("Lỗi kết nối server", "warning");
    } finally {
      setSaveLoading(false);
    }
  };

  const inputCls = "w-full rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-white dark:bg-[#151c18] px-4 py-3 pr-12 text-[14px] font-medium text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/50 dark:placeholder-[#b0b9ac]/50 focus:outline-none focus:ring-2 focus:ring-[#314e3e]/20 dark:focus:ring-[#d4b47d]/20 transition disabled:opacity-60";

  return createPortal(
    <Backdrop handleClose={saveLoading ? undefined : close}>
      <Motion.div {...modalVariant()} role="dialog" aria-modal="true" aria-label="Cập nhật Email" className="w-full max-w-md mx-4 rounded-3xl bg-[#faf8f3] dark:bg-[#1e2821] p-6 shadow-2xl border border-[#dedfd4] dark:border-[#354237]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#314e3e]/10 dark:bg-[#d4b47d]/20 flex items-center justify-center text-[#314e3e] dark:text-[#d4b47d] border border-[#dedfd4] dark:border-[#354237]">
              <Mail className="w-5 h-5" strokeWidth={2} />
            </div>
            <h2 className="text-[18px] font-bold text-[#293d32] dark:text-[#ecece0]">Cập nhật Email</h2>
          </div>
          <button type="button" onClick={close} disabled={saveLoading} aria-label="Đóng" className="w-8 h-8 rounded-full bg-stone-500/10 hover:bg-stone-500/15 dark:bg-stone-400/10 dark:hover:bg-stone-400/20 text-[#575e55] dark:text-[#b0b9ac] flex items-center justify-center transition-colors active:scale-90 disabled:opacity-40">
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="newEmail" className="text-[12px] font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac] ml-1 mb-1.5 inline-block">Email mới</label>
            <input id="newEmail" type="email" placeholder="Nhập địa chỉ email thật của bạn" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} autoFocus disabled={saveLoading} className={inputCls} />
          </div>
          <div>
            <label htmlFor="currentPassword" className="text-[12px] font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac] ml-1 mb-1.5 inline-block">Xác nhận mật khẩu</label>
            <div className="relative">
              <input id="currentPassword" type={showPassword ? "text" : "password"} placeholder="Nhập mật khẩu hiện tại" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={saveLoading} className={inputCls} />
              <button type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1} aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-[#575e55] dark:text-[#b0b9ac] hover:text-[#314e3e] dark:hover:text-[#d4b47d] transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-7 flex gap-3">
          <Motion.button {...(saveLoading ? {} : pressable())} disabled={saveLoading} onClick={close} className="flex-1 py-3 rounded-xl bg-stone-500/10 dark:bg-stone-400/10 text-[#575e55] dark:text-[#b0b9ac] text-[14px] font-bold hover:bg-stone-500/15 dark:hover:bg-stone-400/15 transition-colors disabled:opacity-40">Hủy</Motion.button>
          <Motion.button {...(saveLoading ? {} : pressable())} disabled={saveLoading} onClick={submit} className="flex-1 py-3 rounded-xl bg-[#314e3e] hover:bg-[#253d30] text-white dark:bg-[#d6b883] dark:hover:bg-[#c4a671] dark:text-[#19251d] text-[14px] font-bold transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-xs">
            {saveLoading && <Spinner />} {saveLoading ? "Đang xử lý…" : "Cập nhật Email"}
          </Motion.button>
        </div>
      </Motion.div>
    </Backdrop>,
    document.body
  );
}
