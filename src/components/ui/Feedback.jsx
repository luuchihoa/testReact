import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Backdrop from "./Backdrop.jsx";

// Hằng số Easing chuyển động chuẩn hệ thống Apple HIG
const APPLE_EASE = [0.16, 1, 0.3, 1];

const ICONS = {
  bolt: (
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" strokeLinejoin="round" strokeLinecap="round" />
  ),
  alert: (
    <>
      <path d="M12 8.5v4.5" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
      <path d="M10.7 3.9 2.4 18.2c-.6 1 .1 2.3 1.3 2.3h16.6c1.2 0 1.9-1.3 1.3-2.3L13.3 3.9a1.5 1.5 0 0 0-2.6 0Z" strokeLinejoin="round" />
    </>
  ),
  door: (
    <>
      <path d="M14 3.5 6 5v15l8 1.5V3.5Z" strokeLinejoin="round" />
      <path d="M14 4h5.5v16H14" strokeLinejoin="round" />
      <circle cx="11.3" cy="13" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5C4.7 20 4 19.3 4 18.5v-13Z" strokeLinejoin="round" />
      <path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5c.8 0 1.5-.7 1.5-1.5v-13Z" strokeLinejoin="round" />
    </>
  ),
};

function LineIcon({ name, size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {ICONS[name]}
    </svg>
  );
}

function IconBadge({ icon }) {
  return (
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0 ring-1 ring-amber-900/10 dark:ring-amber-100/10 shadow-sm bg-gradient-to-br from-amber-900 via-amber-800 to-amber-700 dark:from-amber-600 dark:to-amber-500">
      <LineIcon name={icon} />
    </div>
  );
}

function StatusPill({ children }) {
  return (
    <span className="inline-block text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400">
      {children}
    </span>
  );
}

function Sheet({ onClose, showClose = true, children }) {
  const handleDragEnd = (_e, info) => {
    if (onClose && (info.offset.y > 80 || info.velocity.y > 400)) onClose();
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      drag="y"
      dragDirectionLock
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.6 }}
      onDragEnd={handleDragEnd}
      initial={{ y: "100%", opacity: 0.5 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ duration: 0.4, ease: APPLE_EASE }}
      // TỐI ƯU MOBILE: rounded-t-[32px] cực mượt trên điện thoại, viền border mờ thích ứng
      className="relative w-full sm:max-w-sm rounded-t-[32px] sm:rounded-[24px] shadow-2xl flex flex-col overflow-hidden max-h-[90dvh] sm:max-h-[85vh] sm:!translate-y-0 bg-white/95 dark:bg-[#1C1917]/95 backdrop-blur-xl border border-amber-900/10 dark:border-amber-100/10"
      style={{ touchAction: "pan-y" }}
      onClick={(e) => e.stopPropagation()}
    >
      {showClose && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          // TỐI ƯU MOBILE: Tăng size vùng chạm nút đóng độc lập (w-9 h-9) để dễ tương tác bằng ngón tay
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* TỐI ƯU MOBILE: Thanh kéo Pull-Tab to hơn một chút giúp định hướng thao tác vuốt cho người dùng */}
      <div className="flex justify-center pt-4 pb-1 sm:hidden flex-shrink-0 touch-none cursor-grab active:cursor-grabbing">
        <div className="w-12 h-1.5 rounded-full bg-stone-300 dark:bg-stone-700" />
      </div>

      {/* TỐI ƯU MOBILE: Thêm overscroll-contain chặn cuộn trang nền ngầm, pb tính thêm tai thỏ/bottom bar */}
      <div
        className="px-6 pt-3 sm:pt-6 overflow-y-auto overscroll-contain flex-1"
        style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
      >
        {children}
      </div>
    </motion.div>
  );
}

const sheetWrapClass = "fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center";

const iconPop = {
  initial: { scale: 0.6, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { type: "spring", damping: 15, stiffness: 260, delay: 0.05 },
};

// ====================== ERROR BOX =========================
export function ErrorBox({ message, handleClose, onRetry }) {
  return (
    <Backdrop handleClose={handleClose}>
      <div className={sheetWrapClass} onClick={(e) => e.stopPropagation()}>
        <Sheet onClose={handleClose}>
          <div className="text-center space-y-5 pb-1">
            <motion.div className="flex justify-center" {...iconPop}>
              <IconBadge icon="alert" />
            </motion.div>
            <div className="space-y-1.5">
              <StatusPill>Lỗi hệ thống</StatusPill>
              <h2 className="text-xl font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50">
                Có lỗi xảy ra
              </h2>
            </div>
            <p className="text-[14px] font-medium leading-relaxed text-stone-500 dark:text-stone-400">
              {message}
            </p>
            {/* TỐI ƯU MOBILE: Trên mobile ưu tiên xếp nút theo chiều dọc (flex-col) để diện tích bấm nút dài rộng và thoải mái nhất */}
            <div className="flex flex-col gap-2.5 pt-2 sm:flex-row sm:gap-3">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="w-full py-3.5 rounded-xl text-[14px] font-bold transition-all duration-300 active:scale-[0.98] bg-emerald-600 text-white hover:bg-emerald-700 dark:hover:bg-emerald-500"
                >
                  Thử lại
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3.5 rounded-xl text-[14px] font-bold transition-all duration-300 active:scale-[0.98] bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600"
              >
                Đóng
              </button>
            </div>
          </div>
        </Sheet>
      </div>
    </Backdrop>
  );
}

// ====================== EXIT CONFIRM =========================
export function ExitButton({
  handleExit,
  handleClose,
  pill = "Thoát bài thi",
  title = "Thoát bài thi?",
  message = "Tiến trình của bạn sẽ không được lưu lại.",
  cancelLabel = "Ở lại",
  confirmLabel = "Thoát",
}) {
  return (
    <Backdrop handleClose={handleClose}>
      <div className={sheetWrapClass} onClick={(e) => e.stopPropagation()}>
        <Sheet onClose={handleClose}>
          <div className="text-center space-y-5 pb-1">
            <motion.div className="flex justify-center" {...iconPop}>
              <IconBadge icon="door" />
            </motion.div>
            <div className="space-y-1.5">
              <StatusPill>{pill}</StatusPill>
              <h3 className="text-xl font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50">
                {title}
              </h3>
            </div>
            <p className="text-[14px] font-medium text-stone-500 dark:text-stone-400">
              {message}
            </p>
            {/* TỐI ƯU MOBILE: Nút hủy ở lại xếp trên, nút xác nhận nguy hiểm xếp dưới cùng */}
            <div className="flex flex-col gap-2.5 pt-2 sm:flex-row sm:gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3.5 rounded-xl text-[14px] font-bold transition-all duration-300 active:scale-[0.98] bg-stone-100 text-stone-600 hover:bg-stone-200 border border-black/5 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 dark:border-white/5"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={handleExit}
                className="w-full py-3.5 rounded-xl text-[14px] font-bold transition-all duration-300 active:scale-[0.98] bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600"
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </Sheet>
      </div>
    </Backdrop>
  );
}

// ====================== LOADING BOX =========================
export function LoadingBox() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-[#FDFBF7] dark:bg-[#1C1917]">
      <div className="relative w-14 h-14">
        <svg className="w-full h-full animate-spin" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="22" stroke="rgba(120, 53, 4, 0.1)" className="stroke-stone-200 dark:stroke-stone-800" strokeWidth="4.5" />
          <path d="M28 6 a22 22 0 0 1 22 22" className="stroke-amber-900 dark:stroke-amber-400" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="text-center px-6">
        <p className="text-[17px] font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50">
          Đang tải dữ liệu…
        </p>
        <p className="text-[13px] font-medium mt-1 text-stone-500 dark:text-stone-400">
          Vui lòng đợi trong giây lát
        </p>
      </div>
    </div>
  );
}

// ====================== START BOX =========================
export function StartBox({ startQuiz, config, isOpen = true, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Backdrop handleClose={onClose}>
          <div className={sheetWrapClass} onClick={(e) => e.stopPropagation()}>
            <Sheet onClose={onClose}>
              <div className="text-center space-y-5 pb-1">
                <motion.div className="flex justify-center" {...iconPop}>
                  <IconBadge icon="bolt" />
                </motion.div>

                <div className="space-y-1.5">
                  {config?.title && <StatusPill>{config.title}</StatusPill>}
                  <h2 className="text-2xl font-extrabold font-serif tracking-tight leading-tight text-amber-950 dark:text-amber-50">
                    Sẵn sàng chưa?
                  </h2>
                </div>

                <p className="text-[14px] font-medium leading-relaxed text-stone-500 dark:text-stone-400">
                  Chúc bạn làm bài thật tốt. Chinh phục điểm tuyệt đối nào.
                </p>

                <motion.button
                  type="button"
                  onClick={startQuiz}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2, ease: APPLE_EASE }}
                  className="w-full py-4 rounded-xl text-[15px] font-bold tracking-wide transition-all duration-300 mt-2 bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-sm hover:opacity-90 dark:hover:bg-amber-500"
                >
                  Bắt đầu ngay
                </motion.button>
              </div>
            </Sheet>
          </div>
        </Backdrop>
      )}
    </AnimatePresence>
  );
}

// ====================== GUIDE BOX =========================
export function GuideBox({
  setShowGuide,
  onConfirm,
  skipStorageKey = "skipQuizGuide",
  showCheckbox = true,
}) {
  const [skipGuide, setSkipGuide] = useState(false);

  const closeGuide = () => {
    if (onConfirm) {
      onConfirm(skipGuide);
      return;
    }
    if (skipGuide) localStorage.setItem(skipStorageKey, "true");
    setShowGuide?.(false);
  };

  const rules = [
    <>Mỗi câu làm đúng được <b>+100 điểm base</b> (hệ thống điểm x10).</>,
    <>Trả lời đúng liên tiếp nhận <b>🔥 Combo Streak (+20đ/nấc)</b>.</>,
    <>Trả lời thần tốc <b>&lt; 5 giây</b> nhận thêm <b>⚡ +50 điểm bonus</b>.</>,
    <>Được dùng <b>1 lần 🪄 50:50</b> (ẩn 2 câu sai) và <b>1 lần ⏱️ +10s</b> mỗi lượt chơi.</>,
    <>Tích lũy điểm vào <b>🏆 Bảng Xếp Hạng Tuần & Tháng</b>.</>,
  ];

  return (
    <Backdrop handleClose={closeGuide}>
      <div className={sheetWrapClass} onClick={(e) => e.stopPropagation()}>
        <Sheet onClose={closeGuide}>
          <div className="space-y-5 pb-1">
            <div className="flex items-center gap-4">
              <motion.div {...iconPop}>
                <IconBadge icon="book" />
              </motion.div>
              <div className="space-y-1 text-left">
                <StatusPill>Trước khi bắt đầu</StatusPill>
                <h2 className="text-xl font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50">
                  Hướng dẫn làm bài
                </h2>
              </div>
            </div>

            <ul className="flex flex-col gap-3.5 text-left">
              {rules.map((text, i) => (
                <li key={i} className="flex items-start gap-3.5 text-[14px] font-medium leading-snug text-stone-700 dark:text-stone-300">
                  <span className="text-[12px] font-bold tabular-nums mt-0.5 font-serif text-amber-800/40 dark:text-amber-400/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-start gap-3.5 text-[13.5px] font-medium leading-relaxed rounded-2xl px-4 py-3.5 shadow-sm bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" strokeLinecap="round" />
              </svg>
              <span>
                Hết giờ, hệ thống sẽ <b>tự động nộp bài</b> — hãy để ý đồng hồ đếm ngược.
              </span>
            </div>

            {showCheckbox && (
              // TỐI ƯU MOBILE: Tăng padding dọc khu vực label checkbox (py-2) mở rộng tiết diện chạm của ngón tay
              <label className="flex items-center gap-3 cursor-pointer select-none ml-1 py-2">
                <input
                  type="checkbox"
                  checked={skipGuide}
                  onChange={(e) => setSkipGuide(e.target.checked)}
                  // TỐI ƯU MOBILE: Hộp kiểm to hơn một chút (w-5 h-5) dễ tương tác trực tiếp
                  className="w-5 h-5 rounded border-amber-900/20 text-amber-900 dark:border-amber-100/20 cursor-pointer accent-amber-900 dark:accent-amber-400"
                />
                <span className="text-[14px] font-medium text-stone-500 dark:text-stone-400">
                  Lần sau không hiển thị
                </span>
              </label>
            )}

            <motion.button
              type="button"
              onClick={closeGuide}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl text-[15px] font-bold transition-all duration-300 bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-sm hover:opacity-90 dark:hover:bg-amber-500"
            >
              Đã hiểu, bắt đầu
            </motion.button>
          </div>
        </Sheet>
      </div>
    </Backdrop>
  );
}