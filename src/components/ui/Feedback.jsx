import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Backdrop from "./Backdrop.jsx";

/**
 * ─────────────────────────────────────────────────────────────────────────
 * DESIGN DIRECTION
 *
 * Audience: students taking a quiz — young, energetic, gamified, not a
 * formal enterprise exam tool. Two intentional choices that move this away
 * from generic "rounded card + pastel icon circle" quiz UI:
 *
 *  1. Color: orange (#FF5C35) paired with electric violet (#7C5CFF) instead
 *     of the safe orange+blue combo. Dark surface is a warm near-black
 *     violet (#15131C), not neutral gray — it reads as "game", not "settings".
 *  2. Signature element: a small rounded-square "badge" (not a circle) that
 *     carries a gradient fill for the lead icon, plus a status pill
 *     ("Hướng dẫn", "Thoát bài thi", etc.) above the title — like a
 *     ticket/pass stub rather than a generic alert icon-in-a-circle.
 *
 * Typography: Lexend (rounded, friendly, reads well at large display sizes)
 * for headings/numbers, Inter for body copy. Both load from Google Fonts;
 * if the host app already self-hosts fonts, swap the <link> for a local
 * import — the className hooks (font-display / font-body) stay the same.
 * ─────────────────────────────────────────────────────────────────────────
 */

const FONT_LINK_ID = "quiz-modals-fonts";
function ensureFonts() {
  if (typeof document === "undefined") return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Lexend:wght@600;800&family=Inter:wght@400;500;600&display=swap";
  document.head.appendChild(link);
}

const FONT_DISPLAY = { fontFamily: "'Lexend', sans-serif" };
const FONT_BODY = { fontFamily: "'Inter', sans-serif" };

/**
 * ─────────────────────────────────────────────────────────────────────────
 * THEME TOKENS — one system, two surfaces. Dark is a distinct identity
 * (warm violet-black), not a glass overlay of the same shapes.
 * ─────────────────────────────────────────────────────────────────────────
 */
const THEME = {
  light: {
    backdrop: "bg-[#15131C]/40 backdrop-blur-[2px]",
    card: "bg-white border border-black/5",
    pullTab: "bg-gray-300",
    closeBtn: "bg-black/5 hover:bg-black/10 active:bg-black/15 text-gray-500",
    title: "text-[#1A1625]",
    body: "text-gray-500",
    bodyStrong: "text-gray-700",
    pillBg: "bg-[#FFEDE6]",
    pillText: "text-[#E0451C]",
    iconRing: "ring-1 ring-black/5",
    spinnerTrack: "#ECE9F3",
    spinnerHead: "#FF5C35",
    primaryBtn:
      "bg-[#FF5C35] hover:bg-[#E84F2A] active:bg-[#D2441F] text-white shadow-lg shadow-orange-500/20",
    dangerBtn: "bg-[#FF3B5C] hover:bg-[#E5304F] text-white",
    neutralBtn: "bg-[#F3F1F8] hover:bg-[#E9E6F2] text-[#4A4458]",
    successBtn: "bg-[#1FC998] hover:bg-[#1AB489] text-white",
    checkbox: "accent-[#FF5C35]",
    iconGradient: ["#FF5C35", "#FF8A5C"],
    ruleNumber: "text-[#C9C3DD]",
  },
  dark: {
    backdrop: "bg-black/65 backdrop-blur-sm",
    card: "bg-[#1B1726] border border-white/8",
    pullTab: "bg-white/25",
    closeBtn: "bg-white/8 hover:bg-white/14 active:bg-white/20 text-white/70",
    title: "text-white",
    body: "text-[#A89FC2]",
    bodyStrong: "text-[#D9D4E8]",
    pillBg: "bg-[#2A2438]",
    pillText: "text-[#FF8A5C]",
    iconRing: "ring-1 ring-white/10",
    spinnerTrack: "rgba(255,255,255,0.12)",
    spinnerHead: "#FF8A5C",
    primaryBtn: "bg-[#FF5C35] hover:bg-[#FF6E4A] active:bg-[#E84F2A] text-white shadow-lg shadow-orange-900/40",
    dangerBtn: "bg-[#FF3B5C] hover:bg-[#FF577A] text-white",
    neutralBtn: "bg-white/8 hover:bg-white/14 text-white",
    successBtn: "bg-[#1FC998] hover:bg-[#2EDBAB] text-[#0B2A22]",
    checkbox: "accent-[#FF8A5C]",
    iconGradient: ["#FF5C35", "#7C5CFF"],
    ruleNumber: "text-[#403A55]",
  },
};

/**
 * ─────────────────────────────────────────────────────────────────────────
 * Line icons — small, consistent stroke set instead of emoji. Inherit
 * currentColor so they sit cleanly inside the gradient badge.
 * ─────────────────────────────────────────────────────────────────────────
 */
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

function LineIcon({ name, size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      {ICONS[name]}
    </svg>
  );
}

/**
 * Gradient icon badge — the page's signature element: a soft rounded
 * square (not a circle) carrying a two-stop gradient, used as the lead
 * visual on every modal.
 */
function IconBadge({ theme, icon }) {
  const t = THEME[theme];
  const [from, to] = t.iconGradient;
  return (
    <div
      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0 ${t.iconRing}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <LineIcon name={icon} />
    </div>
  );
}

/** Small status pill shown above a modal's title, e.g. "Hướng dẫn làm bài". */
function StatusPill({ theme, children }) {
  const t = THEME[theme];
  return (
    <span
      className={`inline-block text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${t.pillBg} ${t.pillText}`}
      style={FONT_BODY}
    >
      {children}
    </span>
  );
}

/**
 * ─────────────────────────────────────────────────────────────────────────
 * SHEET — shared bottom-sheet shell.
 * Mobile: docked to bottom, drag-to-dismiss, safe-area aware, internal
 * scroll so content never clips on short screens.
 * Desktop (sm:): centered card.
 * A small notch cut at the top-left corner (visible only ≥sm, where there's
 * room for it to read as intentional rather than cramped) nods to a
 * ticket/pass stub — fitting for "starting a round" or "leaving a round".
 * ─────────────────────────────────────────────────────────────────────────
 */
function Sheet({ theme = "light", onClose, showClose = true, children }) {
  const t = THEME[theme];
  ensureFonts();

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
      initial={{ y: "100%", opacity: 1 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 1 }}
      transition={{ type: "spring", damping: 30, stiffness: 360 }}
      className={`relative w-full sm:max-w-sm rounded-t-[1.75rem] sm:rounded-[1.5rem] shadow-2xl
        flex flex-col overflow-hidden max-h-[88dvh] sm:max-h-[85vh]
        sm:!translate-y-0 ${t.card}`}
      style={{ touchAction: "pan-y" }}
      onClick={(e) => e.stopPropagation()}
    >
      {showClose && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className={`absolute top-3.5 right-3.5 z-10 w-8 h-8 rounded-full flex items-center
            justify-center transition-colors ${t.closeBtn}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="flex justify-center pt-3.5 pb-1 sm:hidden flex-shrink-0 touch-none cursor-grab active:cursor-grabbing">
        <div className={`w-10 h-1.5 rounded-full ${t.pullTab}`} />
      </div>

      <div
        className="px-6 pt-3 sm:pt-6 overflow-y-auto overscroll-contain flex-1"
        style={{ paddingBottom: "max(1.75rem, env(safe-area-inset-bottom))" }}
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
  transition: { type: "spring", damping: 14, stiffness: 280, delay: 0.08 },
};

// ====================== ERROR =========================
export function ErrorBox({ message, handleClose, onRetry, theme = "light" }) {
  const t = THEME[theme];
  return (
    <Backdrop handleClose={handleClose}>
      <div className={sheetWrapClass} onClick={(e) => e.stopPropagation()}>
        <Sheet theme={theme} onClose={handleClose}>
          <div className="text-center space-y-5 pb-1">
            <motion.div className="flex justify-center" {...iconPop}>
              <IconBadge theme={theme} icon="alert" />
            </motion.div>
            <div className="space-y-1.5">
              <StatusPill theme={theme}>Lỗi hệ thống</StatusPill>
              <h2 className={`text-xl font-bold ${t.title}`} style={FONT_DISPLAY}>
                Có lỗi xảy ra
              </h2>
            </div>
            <p className={`text-sm leading-relaxed ${t.body}`} style={FONT_BODY}>
              {message}
            </p>
            <div className="flex gap-3 pt-1">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  style={FONT_BODY}
                  className={`flex-1 py-3 rounded-2xl text-[15px] font-semibold transition-colors active:scale-[0.98] ${t.successBtn}`}
                >
                  Thử lại
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                style={FONT_BODY}
                className={`flex-1 py-3 rounded-2xl text-[15px] font-semibold transition-colors active:scale-[0.98] ${t.dangerBtn}`}
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
  theme = "light",
  pill = "Thoát bài thi",
  title = "Thoát bài thi?",
  message = "Tiến trình của bạn sẽ không được lưu lại.",
  cancelLabel = "Ở lại",
  confirmLabel = "Thoát",
}) {
  const t = THEME[theme];
  return (
    <Backdrop handleClose={handleClose}>
      <div className={sheetWrapClass} onClick={(e) => e.stopPropagation()}>
        <Sheet theme={theme} onClose={handleClose}>
          <div className="text-center space-y-5 pb-1">
            <motion.div className="flex justify-center" {...iconPop}>
              <IconBadge theme={theme} icon="door" />
            </motion.div>
            <div className="space-y-1.5">
              <StatusPill theme={theme}>{pill}</StatusPill>
              <h3 className={`text-xl font-bold ${t.title}`} style={FONT_DISPLAY}>
                {title}
              </h3>
            </div>
            <p className={`text-sm ${t.body}`} style={FONT_BODY}>
              {message}
            </p>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleClose}
                style={FONT_BODY}
                className={`flex-1 py-3 rounded-2xl text-[15px] font-semibold transition-colors active:scale-[0.98] ${t.neutralBtn}`}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={handleExit}
                style={FONT_BODY}
                className={`flex-1 py-3 rounded-2xl text-[15px] font-semibold transition-colors active:scale-[0.98] ${t.dangerBtn}`}
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

// ====================== LOADING =========================
export function LoadingBox({ theme = "light" }) {
  const t = THEME[theme];
  const isDark = theme === "dark";
  ensureFonts();
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 ${
        isDark ? "bg-[#15131C]" : "bg-[#F6F4FB]"
      }`}
    >
      <div className="relative w-14 h-14">
        <svg className="w-full h-full animate-spin" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="22" stroke={t.spinnerTrack} strokeWidth="5" />
          <path d="M28 6 a22 22 0 0 1 22 22" stroke={t.spinnerHead} strokeWidth="5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="text-center px-6">
        <p className={`text-[16px] font-semibold ${isDark ? "text-white" : "text-[#1A1625]"}`} style={FONT_DISPLAY}>
          Đang tải dữ liệu…
        </p>
        <p className={`text-[13px] mt-1 ${isDark ? "text-[#8A82A6]" : "text-gray-400"}`} style={FONT_BODY}>
          Vui lòng đợi trong giây lát
        </p>
      </div>
    </div>
  );
}

// ====================== START =========================
export function StartBox({ startQuiz, config, theme = "light", isOpen = true, onClose }) {
  const t = THEME[theme];
  return (
    <AnimatePresence>
      {isOpen && (
        <Backdrop handleClose={onClose}>
          <div className={sheetWrapClass} onClick={(e) => e.stopPropagation()}>
            <Sheet theme={theme} onClose={onClose}>
              <div className="text-center space-y-5 pb-1">
                <motion.div className="flex justify-center" {...iconPop}>
                  <IconBadge theme={theme} icon="bolt" />
                </motion.div>

                <div className="space-y-1.5">
                  {config?.title && <StatusPill theme={theme}>{config.title}</StatusPill>}
                  <h2 className={`text-2xl font-extrabold tracking-tight leading-tight ${t.title}`} style={FONT_DISPLAY}>
                    Sẵn sàng chưa?
                  </h2>
                </div>

                <p className={`text-sm leading-relaxed ${t.body}`} style={FONT_BODY}>
                  Chúc bạn làm bài thật tốt. Chinh phục điểm tuyệt đối nào.
                </p>

                <motion.button
                  type="button"
                  onClick={startQuiz}
                  whileTap={{ scale: 0.97 }}
                  style={FONT_DISPLAY}
                  className={`w-full py-4 rounded-2xl font-bold text-base tracking-wide transition-all ${t.primaryBtn}`}
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
    // Legacy path: persist the skip flag and hide the guide.
    if (skipGuide) localStorage.setItem(skipStorageKey, "true");
    setShowGuide?.(false);
  };

  // The timeout rule matters more than the others — it changes the
  // outcome of the exam, not just the flow — so it gets a distinct
  // highlighted treatment instead of sitting flush with the rest.
  const rules = [
    <>Bài thi gồm <b>trắc nghiệm</b> và <b>tự luận</b>.</>,
    <>Mỗi lần thi chọn <b>ngẫu nhiên</b> câu hỏi từ thư viện.</>,
    <>Mỗi câu trắc nghiệm chỉ chọn <b>1 đáp án</b>.</>,
    <>Có thể <b>bỏ qua</b> câu và làm tiếp sau.</>,
  ];

  return (
    <Backdrop handleClose={closeGuide}>
      <div className={sheetWrapClass} onClick={(e) => e.stopPropagation()}>
        <Sheet theme={theme} onClose={closeGuide}>
          <div className="space-y-5 pb-1">
            <div className="flex items-center gap-3">
              <motion.div {...iconPop}>
                <IconBadge theme={theme} icon="book" />
              </motion.div>
              <div className="space-y-0.5 text-left">
                <StatusPill theme={theme}>Trước khi bắt đầu</StatusPill>
                <h2 className={`text-lg font-bold ${t.title}`} style={FONT_DISPLAY}>
                  Hướng dẫn làm bài
                </h2>
              </div>
            </div>

            <ul className="flex flex-col gap-3 text-left">
              {rules.map((text, i) => (
                <li key={i} className={`flex items-start gap-3 text-sm leading-snug ${t.bodyStrong}`} style={FONT_BODY}>
                  <span className={`text-xs font-bold tabular-nums mt-0.5 ${t.ruleNumber}`} style={FONT_DISPLAY}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <div
              className={`flex items-start gap-3 text-sm leading-snug rounded-xl px-3.5 py-3 ${t.pillBg} ${t.pillText}`}
              style={FONT_BODY}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" strokeLinecap="round" />
              </svg>
              <span>
                Hết giờ, hệ thống sẽ <b>tự động nộp bài</b> — hãy để ý đồng hồ đếm ngược.
              </span>
            </div>

            {showCheckbox && (
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={skipGuide}
                  onChange={(e) => setSkipGuide(e.target.checked)}
                  className={`w-4 h-4 rounded cursor-pointer ${t.checkbox}`}
                />
                <span className={`text-[13px] ${t.body}`} style={FONT_BODY}>
                  Lần sau không hiển thị
                </span>
              </label>
            )}

            <motion.button
              type="button"
              onClick={closeGuide}
              whileTap={{ scale: 0.97 }}
              style={FONT_DISPLAY}
              className={`w-full py-4 rounded-2xl text-[15px] font-bold transition-colors ${t.primaryBtn}`}
            >
              Đã hiểu, bắt đầu
            </motion.button>
          </div>
        </Sheet>
      </div>
    </Backdrop>
  );
}