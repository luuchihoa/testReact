import { useState } from "react";
import Backdrop from "./ui/Backdrop.jsx";
import { useToast } from "./ui/ToastContext.jsx";
import { motion } from "framer-motion";

const API_URL =
  "https://script.google.com/macros/s/AKfycbxGHSrh9HCFcKxfPqDnmYuMRxRHeoIeztowkZ6km8SKiJikm0AXioNWek97vhUlO6A/exec";

export default function ModalLogin({ handleClose, setIsLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleLogin = async () => {
    if (loading) return;

    if (!username || !password) {
      showToast("Vui lòng nhập đầy đủ thông tin", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}?action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
      );
      const result = await res.json();

      if (result.success) {
        showToast("Đăng nhập thành công", "success");
        localStorage.setItem("sessionKey", result.sessionKey);
        localStorage.setItem("username", result.username);
        localStorage.setItem("role", result.role);
        setIsLogin(true);
        handleClose();
        try {
          const userRes = await fetch(
            `${API_URL}?action=getUser&username=${encodeURIComponent(result.username)}`
          );
          const userData = await userRes.json();
          localStorage.setItem("user", JSON.stringify(userData));
          if (userData.avatar) {
            localStorage.setItem("avatar", userData.avatar);
          }
          window.dispatchEvent(new Event("avatar-updated")); // Header sync avatar
        } catch {
          // Không block login nếu fetch user thất bại
        }
      } else {
        showToast("Sai tài khoản hoặc mật khẩu", "error");
      }
    } catch {
      showToast("Không kết nối được máy chủ", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <Backdrop handleClose={handleClose}>
      <motion.div
        initial={{ scale: 0.94, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.94, y: 16, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        className="bg-white w-full max-w-sm mx-4 rounded-3xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FFF0E8] flex items-center justify-center text-lg">
              🔐
            </div>
            <h2 className="text-[18px] font-bold text-gray-900">Đăng nhập</h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] text-gray-500 text-[14px] font-bold flex items-center justify-center transition-colors active:scale-90"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <div className="flex flex-col gap-3">
          <input
            type="text"
            autoComplete="username"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="w-full px-4 py-3 rounded-2xl border border-[#E5E5EA] bg-[#F9F9F9] text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition disabled:opacity-60"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="w-full px-4 py-3 pr-12 rounded-2xl border border-[#E5E5EA] bg-[#F9F9F9] text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-[13px] font-medium"
            >
              {showPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>

          <motion.button
            onClick={handleLogin}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 rounded-2xl bg-[#FF6B35] text-white text-[15px] font-bold hover:bg-[#E85E28] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
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
      </motion.div>
    </Backdrop>
  );
}