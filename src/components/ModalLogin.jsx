import React, { useState, useRef, useEffect } from "react";
import Backdrop from "./ui/Backdrop.jsx";
import { useToast } from "./ui/ToastContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, User, KeyRound, AlertCircle, Eye, EyeOff } from "lucide-react";
// 💡 Khởi tạo supabase client của bạn
import { supabase } from "../lib/supabase.js"; 

export default function ModalLogin({ handleClose, setIsLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");   
  const { showToast }           = useToast();
  const usernameRef             = useRef(null);

  // Focus ô nhập liệu sau khi hiệu ứng mở modal hoàn tất
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
      const fakeEmail = `${u.toLowerCase()}@giaoly.local`;

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: p,
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          setError("Tên đăng nhập hoặc mật khẩu không đúng.");
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
    if (e.key === "Enter") handleLogin();
  };

  // Hệ thống Class Input chuẩn thiết kế Apple (iOS Input Styles)
  const inputCls =
    "w-full pl-10 pr-4 py-3 rounded-xl border text-[15px] font-medium transition-all duration-200 disabled:opacity-50 border-transparent " +
    "bg-stone-100 text-stone-900 placeholder-stone-400 focus:bg-white focus:border-stone-300 focus:ring-4 focus:ring-stone-500/5 " +
    "dark:bg-stone-800/70 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:bg-stone-800 dark:focus:border-stone-700 dark:focus:ring-stone-400/5";

  return (
    <Backdrop handleClose={handleClose}>
      <motion.div
        initial={{ scale: 0.94, y: 16, opacity: 0 }}
        animate={{ scale: 1,    y: 0,  opacity: 1 }}
        exit={{   scale: 0.94, y: 16, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} // Lực vật lý đàn hồi nhẹ của Apple
        className="relative bg-white/90 dark:bg-stone-900/95 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800/80 w-full max-w-[360px] mx-4 rounded-[28px] shadow-2xl overflow-hidden flex flex-col transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* HEADER SECTION */}
          <div className="flex justify-between items-start mb-6 select-none">
            <div>
              {/* Biểu tượng ổ khóa tinh tế với tông hổ phách nhẹ */}
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500 flex items-center justify-center mb-3.5 shadow-inner">
                <Lock className="w-4.5 h-4.5 stroke-[2]" />
              </div>
              <h2 className="text-[20px] font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-none">
                Đăng nhập
              </h2>
              <p className="text-[13px] font-medium text-stone-400 dark:text-stone-500 mt-1.5">
                Vui lòng nhập thông tin tài khoản
              </p>
            </div>
            
            {/* Nút Đóng bo tròn tinh xảo */}
            <button
              onClick={handleClose}
              style={{ touchAction: "manipulation" }}
              className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-400 dark:text-stone-500 flex items-center justify-center transition-all active:scale-90 mt-0.5 outline-none"
              aria-label="Đóng"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* FORM FIELDS */}
          <div className="flex flex-col gap-3">
            {/* Username Input */}
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
                placeholder="Tên đăng nhập"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className={inputCls}
              />
            </div>

            {/* Password Input */}
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
              {/* Nút ẩn/hiện mật khẩu sử dụng biểu tượng mắt trực quan */}
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                style={{ touchAction: "manipulation" }}
                className="absolute right-3 p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors active:scale-95 outline-none"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="w-4 h-4 stroke-[2]" /> : <Eye className="w-4 h-4 stroke-[2]" />}
              </button>
            </div>

            {/* Thông báo lỗi động */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0,  height: "auto" }}
                  exit={{   opacity: 0, y: -4, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="text-[12.5px] text-red-500 dark:text-red-400 font-semibold px-0.5 flex items-center gap-1.5"
                  role="alert"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" /> {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Nút Đăng nhập cao cấp chuẩn Apple (Monochrome Button) */}
            <motion.button
              onClick={handleLogin}
              disabled={loading}
              whileTap={!loading ? { scale: 0.98 } : {}}
              style={{ touchAction: "manipulation" }}
              className="w-full mt-2 py-3 rounded-xl font-semibold text-[14px] transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-sm border border-transparent bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 md:hover:opacity-90 cursor-pointer"
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
          </div>

          {/* FOOTER NOTE */}
          <p className="text-center text-[12px] font-medium text-stone-400 dark:text-stone-500 mt-5 leading-relaxed select-none">
            Quên mật khẩu? Liên hệ{" "}
            <span className="text-amber-700 dark:text-amber-500 font-semibold cursor-default">
              quản trị viên
            </span>.
          </p>
        </div>
      </motion.div>
    </Backdrop>
  );
}