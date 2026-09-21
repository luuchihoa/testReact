import React, { useState, useRef, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Lock, X, User, KeyRound, AlertCircle, CheckCircle2, Eye, EyeOff, ArrowLeft, Mail } from "lucide-react";
import Backdrop from "./Backdrop.jsx";
import { useToast } from "./ToastContext.jsx";
import { supabase } from "../../lib/supabase.js";

const APPLE_EASE = [0.16, 1, 0.3, 1];

export default function ModalLogin({ handleClose, setIsLogin }) {
  const [view, setView]                 = useState("login"); // "login" | "forgotPassword"
  const [username, setUsername]         = useState("");
  const [password, setPassword]         = useState("");
  const [resetEmail, setResetEmail]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [msg, setMsg]                   = useState("");
  const { showToast }                   = useToast();
  const usernameRef                     = useRef(null);
  const resetEmailRef                   = useRef(null);

  // Focus input khi đổi view hoặc khi mở modal
  useEffect(() => {
    const t = setTimeout(() => {
      if (view === "login") {
        usernameRef.current?.focus();
      } else {
        resetEmailRef.current?.focus();
      }
    }, 150);
    return () => clearTimeout(t);
  }, [view]);

  // Lắng nghe phím Escape để đóng modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) {
        handleClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading, handleClose]);

  // Xử lý Đăng nhập
  const handleLogin = async (e) => {
    e?.preventDefault();
    if (loading) return;
    setError("");

    const u = username.trim();
    const p = password.trim();

    if (!u || !p) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const isEmail = u.includes("@");
      let loginEmail = u;

      if (!isEmail) {
        const { data: realEmail, error: rpcError } = await supabase.rpc("get_user_email", { p_username: u });
        if (!rpcError && realEmail) {
          loginEmail = realEmail;
        } else {
          loginEmail = `${u.toLowerCase()}@giaoly.local`;
        }
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: p,
      });

      if (authError) {
        console.error("Login authError:", authError);
        const errMessage = typeof authError.message === "string" ? authError.message : "";
        if (errMessage.includes("Invalid login credentials") || errMessage === "{}" || !errMessage) {
          setError("Tên đăng nhập, email hoặc mật khẩu không chính xác.");
        } else if (errMessage.includes("Database error") || authError.status === 500) {
          setError("Lỗi máy chủ xác thực (500). Vui lòng thử lại sau.");
        } else {
          setError(errMessage);
        }
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("username, ho_va_ten, avatar, gioi_tinh")
        .eq("auth_id", authData.user.id)
        .single();

      if (!profileError && profile) {
        const defaultAvatar =
          profile.gioi_tinh === "Nam" ? "/images/avatarBoy.avif" :
          profile.gioi_tinh === "Nữ"  ? "/images/avatarGirl.avif" :
          "/images/avatarDefault.avif";

        localStorage.setItem("username", profile.username || "");
        localStorage.setItem("avatar", profile.avatar || defaultAvatar);
        window.dispatchEvent(new Event("avatar-updated"));
      }

      setIsLogin?.(true);
      handleClose?.();
      showToast("Đăng nhập thành công!", "success");

    } catch (err) {
      console.error("Login catch error:", err);
      setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền mạng.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Quên mật khẩu
  const handleResetPassword = async (e) => {
    e?.preventDefault();
    if (loading) return;
    setError("");
    setMsg("");

    const email = resetEmail.trim();
    if (!email) {
      setError("Vui lòng nhập địa chỉ email đã đăng ký.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Địa chỉ email không đúng định dạng.");
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) {
        setError(resetError.message || "Không thể gửi link khôi phục.");
      } else {
        setMsg("Đã gửi link khôi phục mật khẩu. Vui lòng kiểm tra hộp thư đến hoặc mục Thư rác (Spam).");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full pl-10 pr-4 py-2.5 sm:py-3 min-h-[44px] rounded-xl border border-[#dedfd4] dark:border-[#354237] " +
    "bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/50 dark:placeholder-[#b0b9ac]/50 " +
    "text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 " +
    "focus:border-[#314e3e] dark:focus:border-[#d6b883] transition-all disabled:opacity-50 shadow-2xs";

  return (
    <Backdrop handleClose={handleClose}>
      <Motion.div
        initial={{ scale: 0.95, y: 16, opacity: 0 }}
        animate={{ scale: 1,    y: 0,  opacity: 1 }}
        exit={{   scale: 0.95, y: 16, opacity: 0 }}
        transition={{ duration: 0.25, ease: APPLE_EASE }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        className="relative bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] w-full max-w-sm sm:max-w-md mx-3.5 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-200 text-[#293d32] dark:text-[#ecece0]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-7">
          {/* Header */}
          <div className="flex justify-between items-start mb-5 sm:mb-6">
            <div className="flex items-start gap-3 min-w-0 flex-1 pr-2">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] border border-[#dedfd4] dark:border-[#354237] flex items-center justify-center shrink-0 shadow-2xs">
                <Lock className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="login-modal-title" className="text-lg sm:text-xl font-bold text-[#293d32] dark:text-[#ecece0] tracking-tight leading-snug font-serif">
                  {view === "login" ? "Đăng nhập" : "Quên mật khẩu"}
                </h2>
                <p className="text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac] font-medium mt-0.5 leading-relaxed">
                  {view === "login"
                    ? "Nhập tài khoản Giáo lý viên hoặc Giáo lý sinh"
                    : "Nhập email của bạn để nhận link khôi phục mật khẩu"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-stone-500/10 hover:bg-stone-500/20 text-[#575e55] dark:text-[#b0b9ac] flex items-center justify-center transition-colors active:scale-95 cursor-pointer shrink-0"
              aria-label="Đóng cửa sổ đăng nhập"
            >
              <X className="w-4.5 h-4.5" strokeWidth={2.2} />
            </button>
          </div>

          {/* Form Content */}
          <AnimatePresence mode="wait">
            {view === "login" ? (
              <Motion.form
                key="login"
                onSubmit={handleLogin}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.18, ease: APPLE_EASE }}
                className="flex flex-col gap-3.5"
              >
                {/* Tên đăng nhập */}
                <div className="space-y-1">
                  <label htmlFor="login-username-input" className="block text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">
                    Tên đăng nhập / Email
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 text-[#575e55] dark:text-[#b0b9ac] w-4 h-4 pointer-events-none" />
                    <input
                      id="login-username-input"
                      ref={usernameRef}
                      type="text"
                      autoComplete="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      inputMode="text"
                      placeholder="Ví dụ: MariaTran, glv.nguyen, email..."
                      value={username}
                      onChange={(e) => { setUsername(e.target.value); setError(""); }}
                      disabled={loading}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Mật khẩu */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password-input" className="block text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">
                      Mật khẩu
                    </label>
                    <button
                      type="button"
                      onClick={() => { setView("forgotPassword"); setError(""); }}
                      tabIndex={0}
                      className="text-xs font-semibold text-[#314e3e] dark:text-[#d6b883] hover:underline cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <KeyRound className="absolute left-3.5 text-[#575e55] dark:text-[#b0b9ac] w-4 h-4 pointer-events-none" />
                    <input
                      id="login-password-input"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Nhập mật khẩu của bạn"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      disabled={loading}
                      className={`${inputClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-[#575e55] hover:text-[#293d32] dark:text-[#b0b9ac] dark:hover:text-[#ecece0] transition-colors active:scale-95 cursor-pointer"
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                <AnimatePresence mode="wait">
                  {error && (
                    <Motion.div
                      key="error"
                      initial={{ opacity: 0, y: -4, height: 0 }}
                      animate={{ opacity: 1, y: 0,  height: "auto" }}
                      exit={{   opacity: 0, y: -4, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs sm:text-sm font-medium flex items-start gap-2"
                      role="alert"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </Motion.div>
                  )}
                </AnimatePresence>

                {/* Nút Đăng nhập */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1.5 py-3 min-h-[44px] rounded-xl font-bold text-xs sm:text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs bg-[#314e3e] hover:bg-[#263e32] text-white dark:bg-[#d6b883] dark:hover:bg-[#c9a76d] dark:text-[#19251d] active:scale-[0.98] cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white dark:border-[#19251d] border-t-transparent rounded-full animate-spin" />
                      <span>Đang đăng nhập…</span>
                    </>
                  ) : (
                    <span>Đăng nhập</span>
                  )}
                </button>
              </Motion.form>
            ) : (
              <Motion.form
                key="forgotPassword"
                onSubmit={handleResetPassword}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18, ease: APPLE_EASE }}
                className="flex flex-col gap-3.5"
              >
                {/* Email khôi phục */}
                <div className="space-y-1">
                  <label htmlFor="reset-email-input" className="block text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">
                    Địa chỉ Email nhận liên kết
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 text-[#575e55] dark:text-[#b0b9ac] w-4 h-4 pointer-events-none" />
                    <input
                      id="reset-email-input"
                      ref={resetEmailRef}
                      type="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      inputMode="email"
                      placeholder="nhap.email.cua.ban@gmail.com"
                      value={resetEmail}
                      onChange={(e) => { setResetEmail(e.target.value); setError(""); setMsg(""); }}
                      disabled={loading}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Error Banner */}
                <AnimatePresence mode="wait">
                  {error && (
                    <Motion.div
                      key="error"
                      initial={{ opacity: 0, y: -4, height: 0 }}
                      animate={{ opacity: 1, y: 0,  height: "auto" }}
                      exit={{   opacity: 0, y: -4, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs sm:text-sm font-medium flex items-start gap-2"
                      role="alert"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </Motion.div>
                  )}
                  {msg && (
                    <Motion.div
                      key="msg"
                      initial={{ opacity: 0, y: -4, height: 0 }}
                      animate={{ opacity: 1, y: 0,  height: "auto" }}
                      exit={{   opacity: 0, y: -4, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-medium flex items-start gap-2"
                      role="status"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{msg}</span>
                    </Motion.div>
                  )}
                </AnimatePresence>

                {/* Nút Gửi liên kết */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1.5 py-3 min-h-[44px] rounded-xl font-bold text-xs sm:text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs bg-[#314e3e] hover:bg-[#263e32] text-white dark:bg-[#d6b883] dark:hover:bg-[#c9a76d] dark:text-[#19251d] active:scale-[0.98] cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white dark:border-[#19251d] border-t-transparent rounded-full animate-spin" />
                      <span>Đang xử lý…</span>
                    </>
                  ) : (
                    <span>Gửi link khôi phục</span>
                  )}
                </button>

                {/* Nút Quay lại đăng nhập */}
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => { setView("login"); setError(""); setMsg(""); }}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#575e55] hover:text-[#293d32] dark:text-[#b0b9ac] dark:hover:text-[#ecece0] transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay lại đăng nhập</span>
                  </button>
                </div>
              </Motion.form>
            )}
          </AnimatePresence>
        </div>
      </Motion.div>
    </Backdrop>
  );
}