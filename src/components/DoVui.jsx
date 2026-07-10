import { useState, useRef, useCallback, memo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSound from "./sound/useSounds.js";
import { QuizTimerRing } from "./ui/Timer.jsx";
import { GuideBox, ExitButton } from "./ui/Feedback.jsx";

const SKIP_GUIDE_KEY = "skipGuideDoVui";
const THEME_KEY = "doVuiThemeMode"; // 'light' | 'dark'
const QUESTION_DURATION_MS = 30_000;

function getRandomItems(arr, n) {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
}

function getInitialDark() {
  if (typeof window === "undefined") return false;
  const saved = window.localStorage.getItem(THEME_KEY);
  if (saved === "dark") return true;
  if (saved === "light") return false;
  return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

/* ══════════════════════════════════════════════
   DESIGN SYSTEM — Apple HIG–inspired tokens
   Colors live as CSS custom properties so the whole
   tree cross-fades between light / dark instantly.
══════════════════════════════════════════════ */
const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Arial, sans-serif';

const THEME_CSS = `
  [data-dovui-theme="light"] {
    --brand: #FF6B35;
    --brand-dark: #E85E28;
    --brand-light: #FFF3EE;
    --correct: #34C759;
    --correct-bg: rgba(52,199,89,0.12);
    --correct-bdr: rgba(52,199,89,0.35);
    --wrong: #FF3B30;
    --wrong-bg: rgba(255,59,48,0.12);
    --wrong-bdr: rgba(255,59,48,0.35);
    --info-blue: #007AFF;
    --info-blue-bg: #E8F1FF;
    --amber: #FF9500;
    --amber-bg: #FFF6E5;
    --page-bg: #F2F2F7;
    --surface: #FFFFFF;
    --surface-elevated: rgba(255,255,255,0.78);
    --border: rgba(60,60,67,0.13);
    --text-pri: rgba(0,0,0,0.92);
    --text-sec: rgba(60,60,67,0.6);
    --text-muted: rgba(60,60,67,0.3);
    --shadow: 0 1px 2px rgba(0,0,0,0.04), 0 1px 1px rgba(0,0,0,0.03);
    --shadow-md: 0 10px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
    --dim-bg: #FAFAFA;
    --dim-border: #F0F0F0;
    --dim-circ-bg: #F0F0F2;
    --dim-circ-border: #EBEBEB;
    color-scheme: light;
  }
  [data-dovui-theme="dark"] {
    --brand: #FF8A5C;
    --brand-dark: #FF6B35;
    --brand-light: rgba(255,138,92,0.16);
    --correct: #30D158;
    --correct-bg: rgba(48,209,88,0.16);
    --correct-bdr: rgba(48,209,88,0.4);
    --wrong: #FF453A;
    --wrong-bg: rgba(255,69,58,0.16);
    --wrong-bdr: rgba(255,69,58,0.4);
    --info-blue: #0A84FF;
    --info-blue-bg: rgba(10,132,255,0.16);
    --amber: #FF9F0A;
    --amber-bg: rgba(255,159,10,0.16);
    --page-bg: #000000;
    --surface: #1C1C1E;
    --surface-elevated: rgba(28,28,30,0.78);
    --border: rgba(255,255,255,0.12);
    --text-pri: rgba(255,255,255,0.95);
    --text-sec: rgba(235,235,245,0.6);
    --text-muted: rgba(235,235,245,0.32);
    --shadow: 0 1px 3px rgba(0,0,0,0.4);
    --shadow-md: 0 12px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3);
    --dim-bg: rgba(255,255,255,0.04);
    --dim-border: rgba(255,255,255,0.08);
    --dim-circ-bg: rgba(255,255,255,0.06);
    --dim-circ-border: rgba(255,255,255,0.1);
    color-scheme: dark;
  }
  [data-dovui-theme] * { transition: background-color .25s ease, border-color .25s ease, color .25s ease; }
`;

const RADIUS = "18px";
const RADIUS_SM = "13px";

/* ══════════════════════════════════════════════
   THEME TOGGLE — sun / moon pill switch
══════════════════════════════════════════════ */
const ThemeToggle = memo(({ isDark, onToggle }) => (
  <motion.button
    onClick={onToggle}
    whileTap={{ scale: 0.92 }}
    aria-label={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
    style={{
      flexShrink: 0,
      width: "38px",
      height: "38px",
      borderRadius: "50%",
      background: "var(--surface)",
      border: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      boxShadow: "var(--shadow)",
      WebkitTapHighlightColor: "transparent",
      color: "var(--text-sec)",
    }}
  >
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={isDark ? "moon" : "sun"}
        initial={{ opacity: 0, rotate: -60, scale: 0.5 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        exit={{ opacity: 0, rotate: 60, scale: 0.5 }}
        transition={{ duration: 0.22 }}
        style={{ display: "flex" }}
      >
        {isDark ? (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4.5" fill="currentColor" />
            <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="1.5" x2="12" y2="4" />
              <line x1="12" y1="20" x2="12" y2="22.5" />
              <line x1="1.5" y1="12" x2="4" y2="12" />
              <line x1="20" y1="12" x2="22.5" y2="12" />
              <line x1="4.2" y1="4.2" x2="6" y2="6" />
              <line x1="18" y1="18" x2="19.8" y2="19.8" />
              <line x1="4.2" y1="19.8" x2="6" y2="18" />
              <line x1="18" y1="6" x2="19.8" y2="4.2" />
            </g>
          </svg>
        )}
      </motion.span>
    </AnimatePresence>
  </motion.button>
));

/* ══════════════════════════════════════════════
   OPTION BUTTON
══════════════════════════════════════════════ */
const OPTION_STYLE = {
  idle: {
    bg: "var(--surface)",
    border: "var(--border)",
    text: "var(--text-pri)",
    circBg: "var(--page-bg)",
    circText: "var(--text-sec)",
    circBdr: "var(--border)",
  },
  correct: {
    bg: "var(--correct-bg)",
    border: "var(--correct-bdr)",
    text: "var(--correct)",
    circBg: "var(--correct)",
    circText: "#fff",
    circBdr: "transparent",
  },
  wrong: {
    bg: "var(--wrong-bg)",
    border: "var(--wrong-bdr)",
    text: "var(--wrong)",
    circBg: "var(--wrong)",
    circText: "#fff",
    circBdr: "transparent",
  },
  dim: {
    bg: "var(--dim-bg)",
    border: "var(--dim-border)",
    text: "var(--text-muted)",
    circBg: "var(--dim-circ-bg)",
    circText: "var(--text-muted)",
    circBdr: "var(--dim-circ-border)",
  },
};

const OptionBtn = memo(({ letter, text, state, onClick, onHover, disabled }) => {
  const s = OPTION_STYLE[state] ?? OPTION_STYLE.idle;
  return (
    <motion.button
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 16px",
        borderRadius: RADIUS,
        border: `1.5px solid ${s.border}`,
        background: s.bg,
        color: s.text,
        textAlign: "left",
        fontSize: "15px",
        fontFamily: FONT_STACK,
        fontWeight: state === "idle" ? 400 : 600,
        cursor: disabled ? "default" : "pointer",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
        transition: "background 0.15s, border-color 0.15s",
        boxShadow: state === "idle" ? "var(--shadow)" : "none",
        minHeight: "52px",
      }}
      onClick={onClick}
      onMouseEnter={onHover}
      disabled={disabled}
      whileTap={state === "idle" ? { scale: 0.985 } : {}}
      animate={state === "wrong" ? { x: [0, -6, 6, -4, 4, -2, 2, 0] } : {}}
      transition={state === "wrong" ? { duration: 0.3, ease: "easeInOut" } : { type: "spring", stiffness: 340, damping: 26 }}
    >
      <span
        style={{
          flexShrink: 0,
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          fontWeight: 700,
          background: s.circBg,
          color: s.circText,
          border: `1.5px solid ${s.circBdr}`,
          transition: "all 0.15s",
        }}
      >
        {state === "correct" ? "✓" : state === "wrong" ? "✕" : letter}
      </span>

      <span style={{ flex: 1, lineHeight: 1.45 }}>{text}</span>
    </motion.button>
  );
});

/* ══════════════════════════════════════════════
   STAT PILL — dùng trong header
══════════════════════════════════════════════ */
function StatPill({ label, value, accent }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: accent ? "var(--brand-light)" : "var(--page-bg)",
        borderRadius: "10px",
        padding: "6px 12px",
        minWidth: "52px",
      }}
    >
      <span
        style={{
          fontSize: "16px",
          fontWeight: 700,
          color: accent ? "var(--brand)" : "var(--text-pri)",
          lineHeight: 1.2,
        }}
      >
        {value}
      </span>
      <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, marginTop: "1px" }}>
        {label}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════
   RESULT SCREEN — toàn màn hình, không phải card
══════════════════════════════════════════════ */
function ResultScreen({ score, total, onRetry, isDark, onToggleTheme }) {
  const display = total ? ((score / total) * 10).toFixed(1) : "0.0";
  const pct = total ? Math.round((score / total) * 100) : 0;
  const wrong = total - score;

  const grade =
    pct >= 80
      ? { label: "Xuất sắc!", sub: "Bạn thật tuyệt vời", color: "var(--correct)", bg: "var(--correct-bg)" }
      : pct >= 60
      ? { label: "Tốt lắm!", sub: "Tiếp tục phát huy", color: "var(--info-blue)", bg: "var(--info-blue-bg)" }
      : pct >= 40
      ? { label: "Khá ổn", sub: "Ôn thêm nhé bạn", color: "var(--amber)", bg: "var(--amber-bg)" }
      : { label: "Cần cố gắng", sub: "Đừng bỏ cuộc nhé", color: "var(--wrong)", bg: "var(--wrong-bg)" };

  const circumference = 2 * Math.PI * 40;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
        paddingTop: "max(env(safe-area-inset-top), 24px)",
        paddingBottom: "max(env(safe-area-inset-bottom), 24px)",
        gap: "20px",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: "max(env(safe-area-inset-top), 16px)", right: "16px" }}>
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </div>

      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 280, damping: 22 }}
        style={{ position: "relative", width: "144px", height: "144px" }}
      >
        <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--page-bg)" strokeWidth="10" />
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={grade.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - pct / 100) }}
            transition={{ duration: 1.1, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-pri)", lineHeight: 1 }}
          >
            {display}
          </motion.span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>/10 điểm</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ textAlign: "center" }}
      >
        <div
          style={{
            display: "inline-block",
            background: grade.bg,
            color: grade.color,
            borderRadius: "100px",
            padding: "6px 18px",
            fontSize: "14px",
            fontWeight: 700,
            marginBottom: "6px",
          }}
        >
          {grade.label}
        </div>
        <p style={{ fontSize: "14px", color: "var(--text-sec)", margin: 0 }}>{grade.sub}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "10px",
          width: "100%",
          maxWidth: "340px",
        }}
      >
        {[
          { label: "Tổng câu", value: total, accent: false },
          { label: "Đúng", value: score, accent: true },
          { label: "Sai", value: wrong, accent: false },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "var(--surface)",
              borderRadius: RADIUS_SM,
              border: "1px solid var(--border)",
              padding: "12px 8px",
              textAlign: "center",
              boxShadow: "var(--shadow)",
            }}
          >
            <div style={{ fontSize: "22px", fontWeight: 800, color: item.accent ? "var(--brand)" : "var(--text-pri)" }}>
              {item.value}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", fontWeight: 500 }}>
              {item.label}
            </div>
          </div>
        ))}
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        onClick={onRetry}
        whileTap={{ scale: 0.97 }}
        style={{
          width: "100%",
          maxWidth: "340px",
          padding: "16px",
          borderRadius: RADIUS,
          background: "var(--brand)",
          color: "#fff",
          fontSize: "16px",
          fontWeight: 700,
          fontFamily: FONT_STACK,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(255,107,53,0.32)",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        Làm lại ↺
      </motion.button>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function DoVui({ config, quizData, handleExit: onExitToRoute }) {
  const { play, unlock, stopAll } = useSound();

  const [phase, setPhase] = useState("quiz");
  const [showGuide, setShowGuide] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [quizQ, setQuizQ] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const [optStates, setOptStates] = useState({});
  const [isDark, setIsDark] = useState(getInitialDark);

  const lockedRef = useRef(false);
  const quizQRef = useRef([]);
  const currentRef = useRef(0);
  const quizEndedRef = useRef(false);
  const nextQTimerRef = useRef(null);
  const hasInitRef = useRef(false);

  /* ── Dark mode: follow system unless the user overrode it ── */
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (!window.localStorage.getItem(THEME_KEY)) setIsDark(e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      window.localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      return next;
    });
  }, []);

  /* ── Start quiz ── */
  const startQuiz = useCallback(() => {
    if (nextQTimerRef.current) { clearTimeout(nextQTimerRef.current); nextQTimerRef.current = null; }
    unlock();
    const pool = Array.isArray(quizData) ? quizData : [];
    const picked = getRandomItems(pool, Math.min(config.mcqCount || pool.length, pool.length));

    quizQRef.current = picked;
    currentRef.current = 0;
    lockedRef.current = false;
    quizEndedRef.current = false;

    setQuizQ(picked);
    setCurrent(0);
    setScore(0);
    setOptStates({});

    if (localStorage.getItem(SKIP_GUIDE_KEY) === "1") {
      setPhase("quiz"); setTimerOn(true);
    } else {
      setPhase("quiz"); setShowGuide(true); setTimerOn(false);
    }
  }, [quizData, config.mcqCount, unlock]);

  useEffect(() => {
    if (hasInitRef.current) return;
    hasInitRef.current = true;
    startQuiz();
  }, [startQuiz]);

  useEffect(() => () => { if (nextQTimerRef.current) clearTimeout(nextQTimerRef.current); }, []);

  /* ── Callbacks ── */
  const handleGuideConfirm = useCallback((skipNext) => {
    if (skipNext) localStorage.setItem(SKIP_GUIDE_KEY, "1");
    setShowGuide(false);
    setTimerOn(true);
  }, []);

  const showResults = useCallback(() => {
    if (quizEndedRef.current) return;
    quizEndedRef.current = true;
    if (nextQTimerRef.current) { clearTimeout(nextQTimerRef.current); nextQTimerRef.current = null; }
    setTimerOn(false);
    play("win");
    setPhase("result");
  }, [play]);

  const nextQuestion = useCallback(() => {
    const next = currentRef.current + 1;
    if (next < quizQRef.current.length) {
      currentRef.current = next;
      lockedRef.current = false;
      setCurrent(next);
      setOptStates({});
      setTimerOn(true);
    } else {
      showResults();
    }
  }, [showResults]);

  const handleAnswer = useCallback((selectedKey = null) => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setTimerOn(false);

    const q = quizQRef.current[currentRef.current];
    if (!q) return;

    const correct = q.correct;
    const newStates = {};
    Object.keys(q.choices).forEach((k) => {
      if (k === correct) newStates[k] = "correct";
      else if (k === selectedKey) newStates[k] = "wrong";
      else newStates[k] = "dim";
    });
    setOptStates(newStates);

    if (selectedKey === correct) { play("correct"); setScore((s) => s + 1); }
    else { play("wrong"); }

    nextQTimerRef.current = setTimeout(() => {
      nextQTimerRef.current = null;
      nextQuestion();
    }, 1200);
  }, [play, nextQuestion]);

  const handleTimeUp = useCallback(() => {
    if (lockedRef.current) return;
    play("wrong");
    handleAnswer(null);
  }, [play, handleAnswer]);

  const handleFinalRush = useCallback(() => {
    play("tick1", 1.6);
    setTimeout(() => play("tick2", 1.8), 350);
  }, [play]);

  const handleHover = useCallback(() => play("hover"), [play]);

  const confirmExit = useCallback(() => {
    if (nextQTimerRef.current) { clearTimeout(nextQTimerRef.current); nextQTimerRef.current = null; }
    setTimerOn(false);
    stopAll();
    lockedRef.current = true;
    quizEndedRef.current = true;
    setShowExit(false);
    onExitToRoute?.();
  }, [stopAll, onExitToRoute]);

  const handleEarlyEnd = useCallback(() => {
    if (nextQTimerRef.current) { clearTimeout(nextQTimerRef.current); nextQTimerRef.current = null; }
    setTimerOn(false);
    showResults();
  }, [showResults]);

  /* ── Derived ── */
  const q = quizQ[current];
  const totalQ = quizQ.length;
  const answered = Object.keys(optStates).length > 0;
  const themeAttr = isDark ? "dark" : "light";

  /* ── Empty state ── */
  if (!Array.isArray(quizData) || quizData.length === 0) {
    return (
      <div data-dovui-theme={themeAttr} style={{ fontFamily: FONT_STACK }}>
        <style>{THEME_CSS}</style>
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            background: "var(--page-bg)",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px" }}>😕</div>
          <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-pri)", margin: 0 }}>
            Không có câu hỏi nào
          </p>
          <button
            onClick={() => onExitToRoute?.()}
            style={{
              padding: "12px 28px",
              borderRadius: RADIUS,
              background: "var(--brand)",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 600,
              fontFamily: FONT_STACK,
              border: "none",
              cursor: "pointer",
            }}
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-dovui-theme={themeAttr} style={{ fontFamily: FONT_STACK }}>
      <style>{THEME_CSS}</style>
      <div style={{ minHeight: "100dvh", background: "var(--page-bg)" }}>
        {showGuide && <GuideBox onConfirm={handleGuideConfirm} skipStorageKey={SKIP_GUIDE_KEY} />}
        {showExit && <ExitButton handleExit={confirmExit} handleClose={() => setShowExit(false)} />}

        {/* ══════════════ QUIZ PHASE ══════════════ */}
        {phase === "quiz" && q && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100dvh",
              maxWidth: "480px",
              margin: "0 auto",
              padding: "0 16px",
              paddingTop: "max(env(safe-area-inset-top), 16px)",
              paddingBottom: "max(env(safe-area-inset-bottom), 20px)",
            }}
          >
            {/* ── Header bar — frosted, sticky ── */}
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
                paddingTop: "4px",
                paddingBottom: "8px",
                gap: "8px",
                background: "var(--surface-elevated)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
              }}
            >
              <button
                onClick={() => setShowExit(true)}
                aria-label="Thoát"
                style={{
                  flexShrink: 0,
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  color: "var(--text-sec)",
                  cursor: "pointer",
                  boxShadow: "var(--shadow)",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                ✕
              </button>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h1
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "var(--brand)",
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {config.title}
                </h1>
              </div>

              <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                <StatPill label="câu" value={`${current + 1}/${totalQ}`} />
                <StatPill label="điểm" value={score} accent />
              </div>
            </div>

            {/* ── Segmented progress ── */}
            <div style={{ display: "flex", gap: "3px", marginBottom: "16px" }}>
              {Array.from({ length: totalQ }).map((_, i) => {
                const isDone = i < current;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: "4px",
                      borderRadius: "2px",
                      background: "var(--border)",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <motion.div
                      style={{ position: "absolute", top: 0, left: 0, bottom: 0, background: "var(--brand)", borderRadius: "2px" }}
                      initial={{ width: isDone ? "100%" : "0%" }}
                      animate={{ width: isDone ? "100%" : "0%" }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </div>
                );
              })}
            </div>

            {/* ── Question card ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ x: 28, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -28, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                style={{
                  background: "var(--surface)",
                  borderRadius: "20px",
                  padding: "18px 18px 16px",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-md)",
                  marginBottom: "14px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    marginTop: "2px",
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: "var(--brand-light)",
                    color: "var(--brand)",
                    fontSize: "13px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {current + 1}
                </span>

                <p style={{ flex: 1, fontSize: "16px", fontWeight: 600, color: "var(--text-pri)", lineHeight: 1.5, margin: 0 }}>
                  {q.text}
                </p>

                <div style={{ flexShrink: 0 }}>
                  <QuizTimerRing
                    duration={QUESTION_DURATION_MS}
                    running={timerOn && !showGuide}
                    resetKey={current}
                    onTimeUp={handleTimeUp}
                    onFinalRush={handleFinalRush}
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* ── Options ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.055, delayChildren: 0.06 } } }}
                style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "14px" }}
              >
                {Object.entries(q.choices).map(([letter, text]) => (
                  <motion.div
                    key={letter}
                    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } } }}
                  >
                    <OptionBtn
                      letter={letter}
                      text={text}
                      state={optStates[letter] ?? "idle"}
                      onClick={() => handleAnswer(letter)}
                      onHover={handleHover}
                      disabled={!!optStates[letter]}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* ── Bottom actions ── */}
            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "9px", paddingTop: "4px" }}>
              <motion.button
                onClick={() => handleAnswer(null)}
                disabled={answered}
                whileTap={{ scale: 0.98 }}
                animate={{ opacity: answered ? 0 : 1 }}
                transition={{ duration: 0.2 }}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: RADIUS,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text-sec)",
                  fontSize: "15px",
                  fontWeight: 500,
                  fontFamily: FONT_STACK,
                  cursor: answered ? "default" : "pointer",
                  WebkitTapHighlightColor: "transparent",
                  minHeight: "50px",
                }}
              >
                Bỏ qua câu này →
              </motion.button>

              <div style={{ display: "flex", gap: "9px" }}>
                <motion.button
                  onClick={handleEarlyEnd}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    flex: 1,
                    padding: "13px",
                    borderRadius: RADIUS,
                    background: "var(--wrong-bg)",
                    border: "1px solid var(--wrong-bdr)",
                    color: "var(--wrong)",
                    fontSize: "14px",
                    fontWeight: 600,
                    fontFamily: FONT_STACK,
                    cursor: "pointer",
                    WebkitTapHighlightColor: "transparent",
                    minHeight: "48px",
                  }}
                >
                  Kết thúc sớm
                </motion.button>

                <motion.button
                  onClick={() => { setTimerOn(false); setShowGuide(true); }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Hướng dẫn"
                  style={{
                    flexShrink: 0,
                    width: "48px",
                    height: "48px",
                    borderRadius: RADIUS,
                    background: "var(--brand)",
                    border: "none",
                    color: "#fff",
                    fontSize: "18px",
                    fontWeight: 800,
                    cursor: "pointer",
                    WebkitTapHighlightColor: "transparent",
                    boxShadow: "0 2px 8px rgba(255,107,53,0.3)",
                  }}
                >
                  ?
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ RESULT PHASE ══════════════ */}
        {phase === "result" && (
          <ResultScreen score={score} total={totalQ} onRetry={startQuiz} isDark={isDark} onToggleTheme={toggleTheme} />
        )}
      </div>
    </div>
  );
}