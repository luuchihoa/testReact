import { useState, useRef, useCallback, memo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSound from "./sound/useSounds.js";
import { QuizTimerRing } from "./ui/Timer.jsx";
import { GuideBox, ExitButton } from "./ui/Feedback.jsx";

const SKIP_GUIDE_KEY = "skipGuideDoVui";
const QUESTION_DURATION_MS = 30_000;

function getRandomItems(arr, n) {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
}

/* ══════════════════════════════════════════════
   DESIGN TOKENS — tập trung 1 chỗ, dễ đổi theme
══════════════════════════════════════════════ */
const T = {
  brand:       "#FF6B35",
  brandDark:   "#E85E28",
  brandLight:  "#FFF3EE",
  correct:     "#16A34A",
  correctBg:   "#DCFCE7",
  correctBdr:  "#86EFAC",
  wrong:       "#DC2626",
  wrongBg:     "#FEE2E2",
  wrongBdr:    "#FCA5A5",
  surface:     "#FFFFFF",
  page:        "#F5F5F7",
  border:      "#E8E8ED",
  borderFocus: "#D1D1D6",
  textPri:     "#1C1C1E",
  textSec:     "#636366",
  textMuted:   "#AEAEB2",
  radius:      "16px",
  radiusSm:    "12px",
  shadow:      "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd:    "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
};

/* ══════════════════════════════════════════════
   OPTION BUTTON
══════════════════════════════════════════════ */
const OPTION_STYLE = {
  idle:    { bg: T.surface,    border: T.border,      text: T.textPri,  circBg: T.page,      circText: T.textSec,  circBdr: T.border      },
  correct: { bg: T.correctBg,  border: T.correctBdr,  text: T.correct,  circBg: T.correct,   circText: "#fff",     circBdr: "transparent" },
  wrong:   { bg: T.wrongBg,    border: T.wrongBdr,    text: T.wrong,    circBg: T.wrong,     circText: "#fff",     circBdr: "transparent" },
  dim:     { bg: "#FAFAFA",    border: "#F0F0F0",     text: T.textMuted, circBg: "#F5F5F5",  circText: T.textMuted, circBdr: "#EBEBEB"    },
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
        borderRadius: T.radius,
        border: `1.5px solid ${s.border}`,
        background: s.bg,
        color: s.text,
        textAlign: "left",
        fontSize: "15px",
        fontWeight: state === "idle" ? 400 : 600,
        cursor: disabled ? "default" : "pointer",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
        transition: "background 0.15s, border-color 0.15s",
        // Tactile shadow khi idle
        boxShadow: state === "idle" ? T.shadow : "none",
        // Minimum touch target
        minHeight: "52px",
      }}
      onClick={onClick}
      onMouseEnter={onHover}
      disabled={disabled}
      whileTap={state === "idle" ? { scale: 0.985 } : {}}
      animate={state === "wrong" ? { x: [0, -6, 6, -4, 4, -2, 2, 0] } : {}}
      transition={state === "wrong" ? { duration: 0.3, ease: "easeInOut" } : {}}
    >
      {/* Letter circle */}
      <span style={{
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
      }}>
        {state === "correct" ? "✓" : state === "wrong" ? "✕" : letter}
      </span>

      {/* Text */}
      <span style={{ flex: 1, lineHeight: 1.45 }}>{text}</span>
    </motion.button>
  );
});

/* ══════════════════════════════════════════════
   STAT PILL — dùng trong header
══════════════════════════════════════════════ */
function StatPill({ label, value, accent }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: accent ? T.brandLight : T.page,
      borderRadius: "10px",
      padding: "6px 12px",
      minWidth: "52px",
    }}>
      <span style={{ fontSize: "16px", fontWeight: 700, color: accent ? T.brand : T.textPri, lineHeight: 1.2 }}>{value}</span>
      <span style={{ fontSize: "11px", color: T.textMuted, fontWeight: 500, marginTop: "1px" }}>{label}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════
   RESULT SCREEN — toàn màn hình, không phải card
══════════════════════════════════════════════ */
function ResultScreen({ score, total, onRetry }) {
  const display = total ? ((score / total) * 10).toFixed(1) : "0.0";
  const pct     = total ? Math.round((score / total) * 100) : 0;
  const wrong   = total - score;

  const grade =
    pct >= 80 ? { label: "Xuất sắc!", sub: "Bạn thật tuyệt vời",  color: T.correct,  bg: T.correctBg  } :
    pct >= 60 ? { label: "Tốt lắm!",  sub: "Tiếp tục phát huy",   color: "#2563EB",  bg: "#DBEAFE"    } :
    pct >= 40 ? { label: "Khá ổn",    sub: "Ôn thêm nhé bạn",     color: "#D97706",  bg: "#FEF3C7"    } :
               { label: "Cần cố gắng", sub: "Đừng bỏ cuộc nhé",   color: T.wrong,    bg: T.wrongBg    };

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
      }}
    >
      {/* Score ring */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 280, damping: 22 }}
        style={{ position: "relative", width: "144px", height: "144px" }}
      >
        <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke={T.page} strokeWidth="10" />
          <motion.circle
            cx="50" cy="50" r="40"
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
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ fontSize: "28px", fontWeight: 800, color: T.textPri, lineHeight: 1 }}
          >
            {display}
          </motion.span>
          <span style={{ fontSize: "12px", color: T.textMuted, fontWeight: 500 }}>/10 điểm</span>
        </div>
      </motion.div>

      {/* Grade badge */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ textAlign: "center" }}
      >
        <div style={{
          display: "inline-block",
          background: grade.bg,
          color: grade.color,
          borderRadius: "100px",
          padding: "6px 18px",
          fontSize: "14px",
          fontWeight: 700,
          marginBottom: "6px",
        }}>
          {grade.label}
        </div>
        <p style={{ fontSize: "14px", color: T.textSec, margin: 0 }}>{grade.sub}</p>
      </motion.div>

      {/* Stats row */}
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
          { label: "Đúng",     value: score, accent: true  },
          { label: "Sai",      value: wrong, accent: false },
        ].map((item) => (
          <div key={item.label} style={{
            background: T.surface,
            borderRadius: T.radiusSm,
            border: `1px solid ${T.border}`,
            padding: "12px 8px",
            textAlign: "center",
            boxShadow: T.shadow,
          }}>
            <div style={{ fontSize: "22px", fontWeight: 800, color: item.accent ? T.brand : T.textPri }}>{item.value}</div>
            <div style={{ fontSize: "11px", color: T.textMuted, marginTop: "2px", fontWeight: 500 }}>{item.label}</div>
          </div>
        ))}
      </motion.div>

      {/* CTA */}
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
          borderRadius: T.radius,
          background: T.brand,
          color: "#fff",
          fontSize: "16px",
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
          boxShadow: `0 4px 16px ${T.brand}40`,
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

  const [phase,     setPhase]     = useState("quiz");
  const [showGuide, setShowGuide] = useState(false);
  const [showExit,  setShowExit]  = useState(false);
  const [quizQ,     setQuizQ]     = useState([]);
  const [current,   setCurrent]   = useState(0);
  const [score,     setScore]     = useState(0);
  const [timerOn,   setTimerOn]   = useState(false);
  const [optStates, setOptStates] = useState({});

  // Refs cho logic — không trigger re-render
  const lockedRef      = useRef(false);
  const quizQRef       = useRef([]);
  const currentRef     = useRef(0);
  const quizEndedRef   = useRef(false);
  const nextQTimerRef  = useRef(null);
  const hasInitRef     = useRef(false);

  /* ── Start quiz ── */
  const startQuiz = useCallback(() => {
    if (nextQTimerRef.current) { clearTimeout(nextQTimerRef.current); nextQTimerRef.current = null; }
    unlock();
    const pool   = Array.isArray(quizData) ? quizData : [];
    const picked = getRandomItems(pool, Math.min(config.mcqCount || pool.length, pool.length));

    quizQRef.current  = picked;
    currentRef.current = 0;
    lockedRef.current  = false;
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
      lockedRef.current  = false;
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

    const correct    = q.correct;
    const newStates  = {};
    Object.keys(q.choices).forEach((k) => {
      if (k === correct)       newStates[k] = "correct";
      else if (k === selectedKey) newStates[k] = "wrong";
      else                     newStates[k] = "dim";
    });
    setOptStates(newStates);

    if (selectedKey === correct) { play("correct"); setScore((s) => s + 1); }
    else                         { play("wrong"); }

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
  const q      = quizQ[current];
  const totalQ = quizQ.length;
  const answered = Object.keys(optStates).length > 0;

  /* ── Empty state ── */
  if (!Array.isArray(quizData) || quizData.length === 0) {
    return (
      <div style={{
        minHeight: "100dvh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: "16px", background: T.page, padding: "24px", textAlign: "center",
      }}>
        <div style={{ fontSize: "48px" }}>😕</div>
        <p style={{ fontSize: "16px", fontWeight: 600, color: T.textPri, margin: 0 }}>Không có câu hỏi nào</p>
        <button
          onClick={() => onExitToRoute?.()}
          style={{
            padding: "12px 28px", borderRadius: T.radius,
            background: T.brand, color: "#fff",
            fontSize: "15px", fontWeight: 600, border: "none", cursor: "pointer",
          }}
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: T.page }}>
      {showGuide && <GuideBox onConfirm={handleGuideConfirm} skipStorageKey={SKIP_GUIDE_KEY} />}
      {showExit  && <ExitButton handleExit={confirmExit} handleClose={() => setShowExit(false)} />}

      {/* ══════════════ QUIZ PHASE ══════════════ */}
      {phase === "quiz" && q && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100dvh",
          maxWidth: "480px",
          margin: "0 auto",
          padding: "0 16px",
          paddingTop:    "max(env(safe-area-inset-top), 16px)",
          paddingBottom: "max(env(safe-area-inset-bottom), 20px)",
        }}>

          {/* ── Header bar ── */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "14px",
            paddingTop: "4px",
            gap: "12px",
          }}>
            {/* Exit button */}
            <button
              onClick={() => setShowExit(true)}
              aria-label="Thoát"
              style={{
                flexShrink: 0,
                width: "38px", height: "38px",
                borderRadius: "50%",
                background: T.surface,
                border: `1px solid ${T.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px", color: T.textSec,
                cursor: "pointer",
                boxShadow: T.shadow,
                WebkitTapHighlightColor: "transparent",
              }}
            >
              ✕
            </button>

            {/* Title */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                fontSize: "16px", fontWeight: 700,
                color: T.brand, margin: 0,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {config.title}
              </h1>
            </div>

            {/* Stats pills */}
            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              <StatPill label="câu" value={`${current + 1}/${totalQ}`} />
              <StatPill label="điểm" value={score} accent />
            </div>
          </div>

          {/* ── Segmented progress ── */}
          <div style={{
            display: "flex",
            gap: "3px",
            marginBottom: "16px",
          }}>
            {Array.from({ length: totalQ }).map((_, i) => {
              const isDone = i < current;
              return (
                <div key={i} style={{
                  flex: 1,
                  height: "4px",
                  borderRadius: "2px",
                  background: T.border,
                  overflow: "hidden",
                  position: "relative",
                }}>
                  <motion.div
                    style={{
                      position: "absolute", top: 0, left: 0, bottom: 0,
                      background: T.brand,
                      borderRadius: "2px",
                    }}
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
              animate={{ x: 0,  opacity: 1 }}
              exit={{   x: -28, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              style={{
                background: T.surface,
                borderRadius: "20px",
                padding: "18px 18px 16px",
                border: `1px solid ${T.border}`,
                boxShadow: T.shadowMd,
                marginBottom: "14px",
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
              }}
            >
              {/* Question number badge */}
              <span style={{
                flexShrink: 0,
                marginTop: "2px",
                width: "28px", height: "28px",
                borderRadius: "8px",
                background: T.brandLight,
                color: T.brand,
                fontSize: "13px", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {current + 1}
              </span>

              <p style={{
                flex: 1,
                fontSize: "16px",
                fontWeight: 600,
                color: T.textPri,
                lineHeight: 1.5,
                margin: 0,
              }}>
                {q.text}
              </p>

              {/* Timer ring */}
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
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.055, delayChildren: 0.06 } },
              }}
              style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "14px" }}
            >
              {Object.entries(q.choices).map(([letter, text]) => (
                <motion.div
                  key={letter}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show:   { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } },
                  }}
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

            {/* Skip button — ẩn nhẹ khi đã trả lời */}
            <motion.button
              onClick={() => handleAnswer(null)}
              disabled={answered}
              whileTap={{ scale: 0.98 }}
              animate={{ opacity: answered ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: T.radius,
                background: T.surface,
                border: `1px solid ${T.border}`,
                color: T.textSec,
                fontSize: "15px",
                fontWeight: 500,
                cursor: answered ? "default" : "pointer",
                WebkitTapHighlightColor: "transparent",
                minHeight: "50px",
              }}
            >
              Bỏ qua câu này →
            </motion.button>

            {/* Action row */}
            <div style={{ display: "flex", gap: "9px" }}>
              {/* End early */}
              <motion.button
                onClick={handleEarlyEnd}
                whileTap={{ scale: 0.97 }}
                style={{
                  flex: 1,
                  padding: "13px",
                  borderRadius: T.radius,
                  background: T.wrongBg,
                  border: `1px solid ${T.wrongBdr}`,
                  color: T.wrong,
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                  minHeight: "48px",
                }}
              >
                Kết thúc sớm
              </motion.button>

              {/* Help */}
              <motion.button
                onClick={() => { setTimerOn(false); setShowGuide(true); }}
                whileTap={{ scale: 0.95 }}
                aria-label="Hướng dẫn"
                style={{
                  flexShrink: 0,
                  width: "48px", height: "48px",
                  borderRadius: T.radius,
                  background: T.brand,
                  border: "none",
                  color: "#fff",
                  fontSize: "18px",
                  fontWeight: 800,
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                  boxShadow: `0 2px 8px ${T.brand}50`,
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
        <ResultScreen score={score} total={totalQ} onRetry={startQuiz} />
      )}
    </div>
  );
}