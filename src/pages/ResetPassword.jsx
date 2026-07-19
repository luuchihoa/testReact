import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { KeyRound, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useToast } from "../components/ui/ToastContext.jsx";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    // Listen for auth state change to capture the password reset event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // We are successfully in the password recovery flow
      }
    });
    return () => subscription?.unsubscribe();
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (password.length < 8) {
      setError("Mật khẩu mới phải từ 8 ký tự trở lên.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      
      showToast("Khôi phục mật khẩu thành công!", "success");
      navigate("/");
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full pl-10 pr-11 py-3 rounded-xl border text-[15px] font-medium transition-all duration-200 disabled:opacity-50 border-amber-900/10 " +
    "bg-white/80 text-amber-950 placeholder-stone-400 focus:bg-white focus:border-amber-900/40 focus:ring-4 focus:ring-amber-900/5 " +
    "dark:bg-stone-900/60 dark:text-stone-100 dark:placeholder-stone-500 dark:border-amber-100/10 dark:focus:bg-stone-900 dark:focus:border-amber-500/40 dark:focus:ring-amber-500/10";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/60 dark:bg-stone-900/40 backdrop-blur-xl border border-amber-900/10 dark:border-amber-100/10 rounded-3xl p-6 md:p-8 shadow-xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-100/50 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center mb-4 shadow-inner border border-amber-900/5 dark:border-amber-100/5">
            <KeyRound className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="text-[24px] font-bold text-amber-950 dark:text-amber-50 tracking-tight font-serif text-center">
            Tạo mật khẩu mới
          </h1>
          <p className="text-[14px] text-stone-500 dark:text-stone-400 mt-2 text-center">
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>

        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 text-stone-400 dark:text-stone-500 w-4 h-4 stroke-[2] pointer-events-none select-none" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu mới (ít nhất 8 ký tự)"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              disabled={loading}
              className={inputCls}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              className="absolute right-3 p-1 rounded-lg text-stone-400 hover:text-amber-800 dark:text-stone-500 dark:hover:text-amber-400 transition-colors active:scale-95 outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4 stroke-[2]" /> : <Eye className="w-4 h-4 stroke-[2]" />}
            </button>
          </div>

          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 text-stone-400 dark:text-stone-500 w-4 h-4 stroke-[2] pointer-events-none select-none" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
              disabled={loading}
              className={inputCls}
            />
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0,  height: "auto" }}
                exit={{   opacity: 0, y: -4, height: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="text-[13px] text-red-600 dark:text-red-400 font-semibold px-1 flex items-center gap-1.5"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" /> {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={!loading ? { scale: 0.98 } : {}}
            className="w-full mt-2 py-3.5 rounded-xl font-bold text-[15px] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm border border-transparent bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white hover:bg-amber-950 dark:hover:bg-amber-500 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin text-current" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Đang xử lý…
              </>
            ) : (
              "Lưu mật khẩu mới"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
