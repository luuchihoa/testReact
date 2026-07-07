import { useState, useRef, useEffect } from "react";
import Backdrop from "./ui/Backdrop.jsx";
import { useToast } from "./ui/ToastContext.jsx";
import { motion, AnimatePresence } from "framer-motion";

const API_URL =
  "https://script.google.com/macros/s/AKfycbxGHSrh9HCFcKxfPqDnmYuMRxRHeoIeztowkZ6km8SKiJikm0AXioNWek97vhUlO6A/exec";

/* ── safe localStorage wrapper ── */
function safeStore(key, value) {
  try { localStorage.setItem(key, value); } catch { /* private mode / quota */ }
}

export default function ModalLogin({ handleClose, setIsLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");   // inline error thay vì toast
  const { showToast }           = useToast();
  const usernameRef             = useRef(null);

  // Focus username khi mở modal
  useEffect(() => {
    const t = setTimeout(() => usernameRef.current?.focus(), 120);
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
      const params = new URLSearchParams({ action: "login", username: u, password: p });
      const res = await fetch(`${API_URL}?${params}`);
      const result = await res.json();

      if (result.success) {
        safeStore("sessionKey", result.sessionKey);
        safeStore("username",   result.username);
        safeStore("role",       result.role);
        setIsLogin(true);
        handleClose();
        showToast("Đăng nhập thành công", "success");

        fetch(`${API_URL}?action=getUser&username=${encodeURIComponent(result.username)}`)
          .then((r) => r.json())
          .then((userData) => {
            safeStore("user",   JSON.stringify(userData));
            if (userData.avatar) safeStore("avatar", userData.avatar);
            window.dispatchEvent(new Event("avatar-updated"));
          })
          .catch(() => {});
      } else {
        setError("Tên đăng nhập hoặc mật khẩu không đúng.");
      }
    } catch {
      setError("Không kết nối được máy chủ. Thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  const inputCls =
    "w-full px-4 py-3 rounded-2xl border bg-[#F2F2F7] text-[16px] text-gray-900 placeholder-gray-400 " +
    "focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:border-[#FF6B35] focus:bg-white " +
    "transition-all duration-200 disabled:opacity-50 border-transparent";

  return (
    <Backdrop handleClose={handleClose}>
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1,    y: 0,  opacity: 1 }}
        exit={{   scale: 0.95, y: 20, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        className="bg-white w-full max-w-sm mx-4 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top accent bar ── */}
        <div className="h-1 w-full bg-gradient-to-r from-[#FF6B35] via-[#FF8C5A] to-[#FF6B35]" />

        <div className="p-6">
          {/* HEADER */}
          <div className="flex justify-between items-start mb-7">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#FFF0E8] flex items-center justify-center text-xl mb-3">
                🔐
              </div>
              <h2 className="text-[20px] font-bold text-gray-900 leading-tight">Đăng nhập</h2>
              <p className="text-[13px] text-gray-400 mt-0.5">Vui lòng nhập thông tin tài khoản</p>
            </div>
            <button
              onClick={handleClose}
              style={{ touchAction: "manipulation" }}
              className="w-8 h-8 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] text-gray-400 text-[13px] flex items-center justify-center transition-colors active:scale-90 mt-0.5"
              aria-label="Đóng"
            >
              ✕
            </button>
          </div>

          {/* FORM */}
          <div className="flex flex-col gap-3">
            {/* Username */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[15px] pointer-events-none select-none">
                👤
              </span>
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
                className={`${inputCls} pl-10`}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[15px] pointer-events-none select-none">
                🔑
              </span>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className={`${inputCls} pl-10 pr-16`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                style={{ touchAction: "manipulation" }}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg text-[12px] font-semibold text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors active:scale-95"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>

            {/* Inline error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0,  height: "auto" }}
                  exit={{   opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-[13px] text-red-500 font-medium px-1 flex items-center gap-1.5"
                  role="alert"
                >
                  <span aria-hidden="true">⚠</span> {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              onClick={handleLogin}
              disabled={loading}
              whileTap={!loading ? { scale: 0.97 } : {}}
              style={{ touchAction: "manipulation" }}
              className="w-full mt-1 py-3.5 rounded-2xl bg-[#FF6B35] hover:bg-[#E85E28] text-white text-[15px] font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(255,107,53,0.30)]"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Đang kiểm tra…
                </>
              ) : (
                "Đăng nhập"
              )}
            </motion.button>
          </div>

          {/* Footer note */}
          <p className="text-center text-[12px] text-gray-400 mt-5 leading-relaxed">
            Quên mật khẩu? Liên hệ{" "}
            <span className="text-[#FF6B35] font-semibold">quản trị viên</span>.
          </p>
        </div>
      </motion.div>
    </Backdrop>
  );
}