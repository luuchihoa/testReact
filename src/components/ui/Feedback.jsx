import { useState } from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import Backdrop from "./Backdrop.jsx";

/**
 * File này MỞ RỘNG bộ overlay cũ để dùng chung cho cả QuizContent (theme="light",
 * mặc định — y hệt giao diện cũ) và DoVui (theme="dark", giao diện kính mờ tối).
 * Mọi prop cũ vẫn hoạt động y nguyên — chỉ thêm prop mới, không xóa/đổi tên prop cũ.
 */

const THEME = {
  light: {
    sheet: "bg-white text-gray-900",
    sub: "text-gray-500",
    sub2: "text-gray-400",
    primaryBtn: "bg-[#FF6B35] hover:bg-[#E85E28] text-white",
    dangerBtn: "bg-[#FF375F] hover:bg-[#E5304F] text-white",
    neutralBtn: "bg-[#F2F2F7] hover:bg-[#E5E5EA] text-gray-700",
    successBtn: "bg-green-500 hover:bg-green-600 text-white",
    accent: "text-[#FF6B35]",
  },
  dark: {
    sheet: "bg-white/15 backdrop-blur-xl text-white border border-white/25",
    sub: "text-white/90",
    sub2: "text-white/70",
    primaryBtn:
      "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-pink-500 hover:to-orange-500 text-white",
    dangerBtn: "bg-red-600 hover:bg-red-700 text-white",
    neutralBtn: "bg-gray-200 hover:bg-gray-300 text-gray-900",
    successBtn:
      "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 text-white",
    accent: "text-yellow-300",
  },
};

// ====================== SHARED =========================
const Sheet = ({ children, onClick, theme = "light" }) => (
  <motion.div
    className={`rounded-3xl shadow-xl p-6 w-full max-w-sm text-center ${THEME[theme].sheet}`}
    initial={{ scale: 0.94, y: 16, opacity: 0 }}
    animate={{ scale: 1, y: 0, opacity: 1 }}
    exit={{ scale: 0.94, y: 16, opacity: 0 }}
    transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
    onClick={onClick}
  >
    {children}
  </motion.div>
);

// ====================== ERROR =========================
// onRetry: TÙY CHỌN MỚI — nếu truyền vào sẽ hiện thêm nút "Thử lại" (DoVui cần,
// QuizContent không truyền thì giao diện y hệt bản cũ).
export function ErrorBox({ message, handleClose, onRetry, theme = "light" }) {
  const t = THEME[theme];
  return (
    <Backdrop handleClose={handleClose}>
      <Sheet onClick={(e) => e.stopPropagation()} theme={theme}>
        <div
          className={`mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center ${
            theme === "dark" ? "bg-orange-100" : "bg-[#FFE4E6]"
          }`}
        >
          <span className="text-2xl">✕</span>
        </div>
        <h2 className="text-[18px] font-bold mb-2">Có lỗi xảy ra</h2>
        <p className={`text-[14px] mb-6 leading-relaxed ${t.sub2}`}>{message}</p>
        <div className="flex gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className={`flex-1 py-3 rounded-2xl text-[15px] font-semibold transition-colors active:scale-[0.98] ${t.successBtn}`}
            >
              🔄 Thử lại
            </button>
          )}
          <button
            type="button"
            onClick={handleClose}
            className={`flex-1 py-3 rounded-2xl text-[15px] font-semibold transition-colors active:scale-[0.98] ${t.dangerBtn}`}
          >
            Đóng
          </button>
        </div>
      </Sheet>
    </Backdrop>
  );
}

// ====================== EXIT CONFIRM =========================
// API giữ nguyên 100%: handleExit, handleClose. Thêm `theme` tùy chọn.
export function ExitButton({ handleExit, handleClose, theme = "light" }) {
  const t = THEME[theme];
  return createPortal(
    <Backdrop handleClose={handleClose}>
      <Sheet onClick={(e) => e.stopPropagation()} theme={theme}>
        <div
          className={`mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
            theme === "dark" ? "bg-white/30" : "bg-[#FFF0F0]"
          }`}
        >
          🚪
        </div>
        <h3 className="text-[18px] font-bold mb-1">Thoát bài thi?</h3>
        <p className={`text-[14px] mb-6 ${t.sub2}`}>Tiến trình sẽ không được lưu.</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className={`flex-1 py-3 rounded-2xl text-[15px] font-semibold transition-colors active:scale-[0.98] ${t.neutralBtn}`}
          >
            Ở lại
          </button>
          <button
            type="button"
            onClick={handleExit}
            className={`flex-1 py-3 rounded-2xl text-[15px] font-semibold transition-colors active:scale-[0.98] ${t.dangerBtn}`}
          >
            Thoát
          </button>
        </div>
      </Sheet>
    </Backdrop>,
    document.getElementById("root")
  );
}

// ====================== LOADING =========================
export function LoadingBox({ theme = "light" }) {
  if (theme === "dark") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 max-w-sm w-[85%] text-center shadow-[0_0_30px_rgba(0,255,255,0.4)]">
          <div className="mx-auto mb-6 w-14 h-14 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin" />
          <p className="text-cyan-200 font-semibold text-xl tracking-wide drop-shadow">
            ĐANG TẢI DỮ LIỆU...
          </p>
          <p className="text-white/70 text-sm mt-2 italic">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-5 bg-[#F2F2F7] z-50">
      <div className="relative w-14 h-14">
        <svg className="w-full h-full animate-spin" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="22" stroke="#E5E5EA" strokeWidth="5" />
          <path d="M28 6 a22 22 0 0 1 22 22" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-[16px] font-semibold text-gray-700">Đang tải dữ liệu…</p>
        <p className="text-[13px] text-gray-400 mt-1">Vui lòng đợi trong giây lát</p>
      </div>
    </div>
  );
}

// ====================== START =========================
// API giữ nguyên: startQuiz, config. Thêm `theme` tùy chọn.
export function StartBox({ startQuiz, config, theme = "light" }) {
  const t = THEME[theme];
  if (theme === "dark") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className={`relative p-8 md:p-10 rounded-3xl max-w-md w-[90%] text-center shadow-2xl ${t.sheet}`}>
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center shadow-lg animate-pulse">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h2 className="text-4xl font-extrabold drop-shadow-lg mb-3">Sẵn Sàng Chưa?</h2>
          <p className={`text-lg mb-6 leading-relaxed ${t.sub}`}>
            Chào mừng bạn đến với{" "}
            <span className={`font-semibold ${t.accent}`}>{config?.title}</span>. Nhấn{" "}
            <b className="text-green-400">Bắt đầu</b> để tham gia nào!
          </p>
          <button
            type="button"
            onClick={startQuiz}
            className={`w-full py-3 mt-4 font-bold rounded-xl shadow-xl transition-all active:scale-95 ${t.successBtn}`}
          >
            BẮT ĐẦU NGAY
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center bg-[#F2F2F7] z-40 px-0 sm:px-4">
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
        className="w-full sm:max-w-sm bg-white sm:rounded-3xl rounded-t-3xl shadow-xl px-6 pt-4 pb-10 sm:pb-6 text-center"
      >
        <div className="flex justify-center mb-5 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-[#C7C7CC]" />
        </div>
        <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-[#FFF0E8] flex items-center justify-center text-3xl">
          ⚡
        </div>
        <h2 className="text-[22px] font-extrabold text-gray-900 mb-1">Sẵn sàng chưa?</h2>
        {config?.title && (
          <p className="text-[13px] font-semibold text-[#FF6B35] uppercase tracking-wider mb-1">
            {config.title}
          </p>
        )}
        <p className="text-[14px] text-gray-400 mb-8 leading-relaxed">Chúc bạn làm bài thật tốt! 💪</p>
        <motion.button
          type="button"
          onClick={startQuiz}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-2xl bg-[#FF6B35] text-white text-[16px] font-bold shadow-sm hover:bg-[#E85E28] transition-colors"
        >
          Bắt đầu ngay →
        </motion.button>
      </motion.div>
    </div>
  );
}

// ====================== GUIDE =========================
// API cũ giữ nguyên: setShowGuide (sẽ tự lưu localStorage rồi gọi setShowGuide(true)
// y hệt code cũ — KHÔNG sửa hành vi cũ dù trông như 1 chỗ dễ nhầm, vì có thể có
// component cha đang phụ thuộc vào đúng hành vi này).
// API mới cho DoVui: truyền `onConfirm(skipChecked)` thay vì `setShowGuide`.
export function GuideBox({
  setShowGuide,
  onConfirm,
  skipStorageKey = "skipQuizGuide",
  theme = "light",
  showCheckbox = true,
}) {
  const [skipGuide, setSkipGuide] = useState(false);
  const t = THEME[theme];

  const closeGuide = () => {
    if (onConfirm) {
      onConfirm(skipGuide);
      return;
    }
    // hành vi cũ, giữ nguyên cho tương thích ngược
    if (skipGuide) localStorage.setItem(skipStorageKey, "true");
    setShowGuide?.(true);
  };

  const rules = [
    { icon: "📝", text: <>Bài thi gồm <b>trắc nghiệm</b> và <b>tự luận</b>.</> },
    { icon: "🎲", text: <>Mỗi lần thi chọn <b>ngẫu nhiên</b> câu hỏi từ thư viện.</> },
    { icon: "☑️", text: <>Mỗi câu trắc nghiệm chỉ chọn <b>1 đáp án</b>.</> },
    { icon: "⏭️", text: <>Có thể <b>bỏ qua</b> câu và làm tiếp.</> },
    { icon: "⏱️", text: <>Hết giờ hệ thống sẽ <b>tự động nộp bài</b>.</> },
  ];

  return (
    <Backdrop handleClose={undefined}>
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        className={`w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl shadow-xl px-6 pt-4 pb-10 sm:pb-6 ${
          theme === "dark" ? "bg-green-100/90 backdrop-blur-xl border border-white/30 text-black" : "bg-white"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-[#C7C7CC]" />
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
              theme === "dark" ? "bg-white/30" : "bg-[#EFF6FF]"
            }`}
          >
            📘
          </div>
          <h2 className="text-[18px] font-bold">Hướng dẫn làm bài</h2>
        </div>

        <ul className="flex flex-col gap-3 mb-6">
          {rules.map((r, i) => (
            <li key={i} className="flex items-start gap-3 text-[14px] leading-snug">
              <span className="text-base flex-shrink-0 mt-0.5">{r.icon}</span>
              <span>{r.text}</span>
            </li>
          ))}
        </ul>

        {showCheckbox && (
          <label className="flex items-center gap-2.5 mb-5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={skipGuide}
              onChange={(e) => setSkipGuide(e.target.checked)}
              className="w-4 h-4 rounded accent-[#FF6B35] cursor-pointer"
            />
            <span className="text-[13px]">Lần sau không hiển thị</span>
          </label>
        )}

        <motion.button
          type="button"
          onClick={closeGuide}
          whileTap={{ scale: 0.97 }}
          className={`w-full py-4 rounded-2xl text-[15px] font-bold transition-colors ${t.primaryBtn}`}
        >
          🚀 Đã hiểu, bắt đầu
        </motion.button>
      </motion.div>
    </Backdrop>
  );
}