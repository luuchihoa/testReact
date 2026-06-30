import { useState } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { createPortal } from "react-dom";
import Backdrop from "./Backdrop.jsx";

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
export function StartBox({ startQuiz, config, theme = "light", isOpen = true, onClose }) {
  // Quản lý tọa độ kéo trên Mobile độc lập với CSS Transform ban đầu
  const y = useMotionValue(0);

  // Hàm xử lý khi hoàn tất hành vi vuốt đóng (Drag-to-dismiss)
  const handleDragEnd = (event, info) => {
    if (info.offset.y > 70 || info.velocity.y > 350) {
      if (onClose) onClose(); // Gọi hàm close từ cha nếu có
    }
  };

  // Hệ thống Style Tokens chuẩn hóa cho cả 2 Theme
  const themes = {
    light: {
      backdrop: "bg-black/20 backdrop-blur-[2px]",
      card: "bg-white text-gray-900 border-gray-100",
      pullTab: "bg-gray-300",
      iconBg: "bg-[#FFF0E8] text-3xl",
      icon: "⚡",
      title: "text-gray-900",
      subtitle: "text-gray-500",
      accent: "text-[#FF6B35]",
      btn: "bg-[#FF6B35] text-white hover:bg-[#E85E28] active:bg-[#D45220] shadow-md shadow-orange-500/10"
    },
    dark: {
      backdrop: "bg-black/60 backdrop-blur-sm",
      card: "bg-[#1C1C1E]/95 text-white border-white/10 backdrop-blur-md",
      pullTab: "bg-white/20",
      iconBg: "bg-white/10 border border-white/10 shadow-lg animate-pulse",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "text-white font-serif",
      subtitle: "text-gray-400",
      accent: "text-green-400 font-semibold",
      btn: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:brightness-110 active:scale-[0.98] shadow-lg shadow-emerald-500/20"
    }
  };

  const t = themes[theme] || themes.light;

  // Cấu hình mượt mà cho Variants, xử lý xung đột kiểu dữ liệu chuỗi (%) trên thiết bị di động
  const sheetVariants = {
    hidden: {
      y: typeof window !== "undefined" && window.innerWidth < 640 ? "100%" : 24,
      opacity: typeof window !== "undefined" && window.innerWidth < 640 ? 1 : 0,
      scale: typeof window !== "undefined" && window.innerWidth < 640 ? 1 : 0.95
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", damping: 32, stiffness: 350 }
    },
    exit: {
      y: typeof window !== "undefined" && window.innerWidth < 640 ? "100%" : 12,
      opacity: typeof window !== "undefined" && window.innerWidth < 640 ? 1 : 0,
      scale: typeof window !== "undefined" && window.innerWidth < 640 ? 1 : 0.95,
      transition: { duration: 0.22, ease: "easeOut" }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (Phông nền) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 z-50 pointer-events-auto ${t.backdrop}`}
          />

          {/* Wrapper layout: Mobile dính đáy (justify-end), Desktop căn giữa (sm:items-center sm:justify-center) */}
          <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4 pointer-events-none">
            
            {/* Thẻ Nội dung chính (Bottom Sheet / Modal) */}
            <motion.div
              variants={sheetVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              
              // Kích hoạt tính năng kéo trượt
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={handleDragEnd}
              style={{ y }}
              
              className={`relative w-full sm:max-w-sm rounded-t-[2.5rem] sm:rounded-3xl border shadow-2xl pointer-events-auto max-h-[85vh] flex flex-col overflow-hidden transition-colors duration-300 ${t.card}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => onClose?.()}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 active:bg-black/15 flex items-center justify-center transition-colors dark:bg-white/10 dark:hover:bg-white/15 text-current"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
              
              {/* 1. Pull Tab: Vùng tay cầm kéo đóng dành riêng cho Mobile */}
              <div className="flex justify-center pt-4 pb-2 sm:hidden touch-none cursor-grab active:cursor-grabbing flex-shrink-0">
                <div className={`w-12 h-1.5 rounded-full ${t.pullTab}`} />
              </div>

              {/* 2. Body: Cuộn mượt cô lập hoàn toàn (overscroll-contain) không ảnh hưởng tới Lenis bên ngoài */}
              <div className="p-6 pt-4 pb-8 sm:pb-6 space-y-6 overflow-y-auto overscroll-contain flex-1 pointer-events-auto custom-scrollbar text-center">
                
                {/* Vùng Icon linh hoạt thay đổi theo Theme */}
                <div className="flex justify-center touch-none">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center select-none flex-shrink-0 ${t.iconBg}`}>
                    {t.icon}
                  </div>
                </div>

                {/* Tiêu đề & Nội dung */}
                <div className="space-y-2 touch-none">
                  <h2 className={`text-2xl sm:text-3xl font-black tracking-tight leading-tight ${t.title}`}>
                    Sẵn Sàng Chưa?
                  </h2>
                  {config?.title && (
                    <p className={`text-xs font-bold uppercase tracking-widest ${t.accent}`}>
                      {config.title}
                    </p>
                  )}
                </div>

                <p className={`text-sm sm:text-base leading-relaxed font-medium ${t.subtitle}`}>
                  {theme === "dark" ? (
                    <>
                      Chào mừng bạn đến với <span className={t.accent}>{config?.title}</span>. Nhấn nút bên dưới để tham gia thử thách!
                    </>
                  ) : (
                    "Chúc bạn làm bài thật tốt! Chinh phục điểm tuyệt đối nào. 💪"
                  )}
                </p>

                {/* Nút hành động chính */}
                <motion.button
                  type="button"
                  onClick={startQuiz}
                  whileTap={{ scale: 0.96 }}
                  className={`w-full py-4 rounded-2xl font-bold text-base tracking-wide transition-all ${t.btn}`}
                >
                  BẮT ĐẦU NGAY
                </motion.button>
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ====================== GUIDE =========================
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