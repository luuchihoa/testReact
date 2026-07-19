import React, { useState, useRef, useEffect } from "react";
import Backdrop from "./Backdrop.jsx";
import { useToast } from "./ToastContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, User, KeyRound, AlertCircle, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../lib/supabase.js"; 

export default function ModalLogin({ handleClose, setIsLogin }) {
  const [view, setView]         = useState("login"); // "login" | "forgotPassword"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");   
  const [msg, setMsg]           = useState("");
  const { showToast }           = useToast();
  const usernameRef             = useRef(null);
  const resetEmailRef           = useRef(null);

  useEffect(() => {
    if (view === "login") {
      const t = setTimeout(() => usernameRef.current?.focus(), 150);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => resetEmailRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [view]);

  useEffect(() => {
    const t = setTimeout(() => usernameRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async () => {
    if (loading) return;
    setError("");

    const u = username.trim();
    const p = password.trim();

    if (!u || !p) {
      setError("Vui lòng nhập đầy đủ thông tin.");
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
        if (authError.message.includes("Invalid login credentials")) {
          setError("Tên đăng nhập, email hoặc mật khẩu không đúng.");
        } else {
          setError(authError.message);
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

      setIsLogin(true);
      handleClose();
      showToast("Đăng nhập thành công", "success");

    } catch (err) {
      setError("Không kết nối được máy chủ. Thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (view === "login") handleLogin();
      else handleResetPassword();
    }
  };

  const handleResetPassword = async () => {
    if (loading) return;
    setError("");
    setMsg("");
    const email = resetEmail.trim();
    if (!email) {
      setError("Vui lòng nhập email.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không hợp lệ.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setError(error.message);
      } else {
        setMsg("Đã gửi link khôi phục. Vui lòng kiểm tra hộp thư của bạn.");
      }
    } catch (err) {
      setError("Không kết nối được máy chủ. Thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full pl-10 pr-4 py-3 rounded-xl border text-[15px] font-medium transition-all duration-200 disabled:opacity-50 border-amber-900/10 " +
    "bg-white/80 text-amber-950 placeholder-stone-400 focus:bg-white focus:border-amber-900/40 focus:ring-4 focus:ring-amber-900/5 " +
    "dark:bg-stone-900/60 dark:text-stone-100 dark:placeholder-stone-500 dark:border-amber-100/10 dark:focus:bg-stone-900 dark:focus:border-amber-500/40 dark:focus:ring-amber-500/10";

  return (
    <Backdrop handleClose={handleClose}>
      <motion.div
        initial={{ scale: 0.94, y: 16, opacity: 0 }}
        animate={{ scale: 1,    y: 0,  opacity: 1 }}
        exit={{   scale: 0.94, y: 16, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} 
        className="relative bg-[#FDFBF7]/95 dark:bg-[#1C1917]/95 backdrop-blur-xl border border-amber-900/10 dark:border-amber-100/10 w-full max-w-[360px] mx-4 rounded-[28px] shadow-2xl overflow-hidden flex flex-col transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6 select-none">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100/50 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center mb-3.5 shadow-inner border border-amber-900/5 dark:border-amber-100/5">
                <Lock className="w-4.5 h-4.5 stroke-[2]" />
              </div>
              <h2 className="text-[20px] font-bold text-amber-950 dark:text-amber-50 tracking-tight leading-none font-serif">
                {view === "login" ? "Đăng nhập" : "Quên mật khẩu"}
              </h2>
              <p className="text-[13px] font-medium text-stone-500 dark:text-stone-400 mt-1.5">
                {view === "login" ? "Vui lòng nhập thông tin tài khoản" : "Nhập email của bạn để nhận link khôi phục"}
              </p>
            </div>
            
            <button
              onClick={handleClose}
              style={{ touchAction: "manipulation" }}
              className="w-7 h-7 rounded-full bg-amber-900/5 hover:bg-amber-900/10 dark:bg-amber-100/5 dark:hover:bg-amber-100/10 text-stone-500 dark:text-stone-400 flex items-center justify-center transition-all active:scale-90 mt-0.5 outline-none"
              aria-label="Đóng"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>


          <AnimatePresence mode="wait">
            {view === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3"
              >
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 text-stone-400 dark:text-stone-500 w-4 h-4 stroke-[2] pointer-events-none select-none" />
                  <input
                    ref={usernameRef}
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="text"
                    placeholder="Tên đăng nhập hoặc Email"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(""); }}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    className={inputCls}
                  />
                </div>

                <div className="relative flex items-center">
                  <KeyRound className="absolute left-3.5 text-stone-400 dark:text-stone-500 w-4 h-4 stroke-[2] pointer-events-none select-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    className={`${inputCls} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    style={{ touchAction: "manipulation" }}
                    className="absolute right-3 p-1 rounded-lg text-stone-400 hover:text-amber-800 dark:text-stone-500 dark:hover:text-amber-400 transition-colors active:scale-95 outline-none"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 stroke-[2]" /> : <Eye className="w-4 h-4 stroke-[2]" />}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {error && (
                    <motion.p
                      key="error"
                      initial={{ opacity: 0, y: -4, height: 0 }}
                      animate={{ opacity: 1, y: 0,  height: "auto" }}
                      exit={{   opacity: 0, y: -4, height: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="text-[12.5px] text-red-600 dark:text-red-400 font-semibold px-0.5 flex items-center gap-1.5"
                      role="alert"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" /> {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button
                  onClick={handleLogin}
                  disabled={loading}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  style={{ touchAction: "manipulation" }}
                  className="w-full mt-2 py-3 rounded-xl font-bold text-[14px] transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-sm border border-transparent bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white md:hover:opacity-90 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin text-current" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Đang đăng nhập…
                    </>
                  ) : (
                    "Đăng nhập"
                  )}
                </motion.button>
                
                <p className="text-center text-[12px] font-medium text-stone-500 dark:text-stone-400 mt-3 leading-relaxed select-none">
                  Quên mật khẩu? <button onClick={() => { setView("forgotPassword"); setError(""); }} className="text-amber-800 dark:text-amber-500 font-semibold transition-colors hover:opacity-80">Khôi phục ngay</button>.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="forgotPassword"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3"
              >
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 text-stone-400 dark:text-stone-500 w-4 h-4 stroke-[2] pointer-events-none select-none" />
                  <input
                    ref={resetEmailRef}
                    type="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="email"
                    placeholder="Nhập email của bạn"
                    value={resetEmail}
                    onChange={(e) => { setResetEmail(e.target.value); setError(""); setMsg(""); }}
                    onKeyDown={handleKeyDown}
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
                      className="text-[12.5px] text-red-600 dark:text-red-400 font-semibold px-0.5 flex items-center gap-1.5"
                      role="alert"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" /> {error}
                    </motion.p>
                  )}
                  {msg && (
                    <motion.p
                      key="msg"
                      initial={{ opacity: 0, y: -4, height: 0 }}
                      animate={{ opacity: 1, y: 0,  height: "auto" }}
                      exit={{   opacity: 0, y: -4, height: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="text-[12.5px] text-emerald-600 dark:text-emerald-400 font-semibold px-0.5 flex items-center gap-1.5"
                      role="status"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" /> {msg}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button
                  onClick={handleResetPassword}
                  disabled={loading}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  style={{ touchAction: "manipulation" }}
                  className="w-full mt-2 py-3 rounded-xl font-bold text-[14px] transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-sm border border-transparent bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white md:hover:opacity-90 cursor-pointer"
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
                    "Gửi link khôi phục"
                  )}
                </motion.button>
                <div className="flex justify-center mt-1">
                  <button
                    type="button"
                    onClick={() => { setView("login"); setError(""); setMsg(""); }}
                    className="text-[12.5px] font-bold text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300 transition-colors"
                  >
                    Quay lại đăng nhập
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </Backdrop>
  );
}