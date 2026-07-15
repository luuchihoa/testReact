import React, { useState, useRef, useCallback, memo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSound from "./sound/useSounds.js";
import { QuizTimerRing } from "./ui/Timer.jsx";
import { GuideBox, ExitButton } from "./ui/Feedback.jsx";

const SKIP_GUIDE_KEY = "skipGuideDoVui";
const QUESTION_DURATION_MS = 30_000;

// Hằng số Easing chuẩn hệ thống
const APPLE_EASE = [0.16, 1, 0.3, 1];

function getRandomItems(arr, n) {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
}

/* ══════════════════════════════════════════════
   THEME TOGGLE — Nút chuyển đổi Dark Mode
══════════════════════════════════════════════ */
const ThemeToggle = memo(() => {
  // Đồng bộ với class .dark trên thẻ <html> của hệ thống
  const [isDark, setIsDark] = useState(
    typeof window !== "undefined" && document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = 'light';
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = 'dark';
    }
  };

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.9 }}
      aria-label={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      className="flex-shrink-0 w-[40px] h-[40px] rounded-full bg-white dark:bg-[#1C1917] border border-amber-900/10 dark:border-amber-100/10 flex items-center justify-center cursor-pointer shadow-sm text-stone-500 dark:text-stone-400 transition-colors"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ duration: 0.25, ease: APPLE_EASE }}
          className="flex"
        >
          {isDark ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" fill="currentColor" />
            </svg>
          ) : (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4.5" fill="currentColor" />
              <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="2" x2="12" y2="4.5" />
                <line x1="12" y1="19.5" x2="12" y2="22" />
                <line x1="2" y1="12" x2="4.5" y2="12" />
                <line x1="19.5" y1="12" x2="22" y2="12" />
                <line x1="4.9" y1="4.9" x2="6.7" y2="6.7" />
                <line x1="17.3" y1="17.3" x2="19.1" y2="19.1" />
                <line x1="4.9" y1="19.1" x2="6.7" y2="17.3" />
                <line x1="17.3" y1="4.9" x2="19.1" y2="6.7" />
              </g>
            </svg>
          )}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
});

/* ══════════════════════════════════════════════
   OPTION BUTTON
══════════════════════════════════════════════ */
const OptionBtn = memo(({ letter, text, state, onClick, onHover, disabled }) => {
  const getStyle = () => {
    switch (state) {
      case "correct":
        return {
          btn: "bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-bold",
          badge: "bg-emerald-500 text-white border-transparent",
        };
      case "wrong":
        return {
          btn: "bg-red-50/80 dark:bg-red-900/20 border-red-500/40 text-red-700 dark:text-red-400 font-bold",
          badge: "bg-red-500 text-white border-transparent",
        };
      case "dim":
        return {
          btn: "bg-stone-50/50 dark:bg-stone-900/30 border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-600 font-medium",
          badge: "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600 border-stone-200 dark:border-stone-700",
        };
      default: // idle
        return {
          btn: "bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-md border-amber-900/10 dark:border-amber-100/10 text-amber-950 dark:text-amber-50 font-medium hover:bg-stone-50 dark:hover:bg-stone-800 shadow-sm",
          badge: "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-amber-900/5 dark:border-amber-100/5",
        };
    }
  };

  const s = getStyle();

  return (
    <motion.button
      className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border-[1.5px] text-left text-[15px] transition-colors cursor-pointer select-none min-h-[56px] ${s.btn} ${disabled ? "pointer-events-none" : ""}`}
      onClick={onClick}
      onMouseEnter={onHover}
      disabled={disabled}
      whileTap={state === "idle" ? { scale: 0.98 } : {}}
      animate={state === "wrong" ? { x: [0, -6, 6, -4, 4, -2, 2, 0] } : {}}
      transition={state === "wrong" ? { duration: 0.35, ease: "easeInOut" } : { duration: 0.2, ease: APPLE_EASE }}
    >
      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold border ${s.badge} transition-colors duration-300`}>
        {state === "correct" ? "✓" : state === "wrong" ? "✕" : letter}
      </span>
      <span className="flex-1 leading-snug">{text}</span>
    </motion.button>
  );
});

/* ══════════════════════════════════════════════
   STAT PILL
══════════════════════════════════════════════ */
function StatPill({ label, value, accent }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl px-3 py-1.5 min-w-[56px] shadow-sm border ${
      accent 
        ? "bg-amber-100/80 dark:bg-amber-900/30 border-amber-200/50 dark:border-amber-800/30" 
        : "bg-white/80 dark:bg-stone-900/40 border-amber-900/5 dark:border-amber-100/5"
    }`}>
      <span className={`text-[16px] font-extrabold font-serif leading-tight ${accent ? "text-amber-700 dark:text-amber-400" : "text-amber-950 dark:text-amber-50"}`}>
        {value}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mt-0.5">
        {label}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════
   RESULT SCREEN
══════════════════════════════════════════════ */
function ResultScreen({ score, total, onRetry }) {
  const display = total ? ((score / total) * 10).toFixed(1) : "0.0";
  const pct = total ? Math.round((score / total) * 100) : 0;
  const wrong = total - score;

  const grade =
    pct >= 80
      ? { label: "Xuất sắc!", sub: "Bạn thật tuyệt vời", color: "text-emerald-500", stroke: "#10b981", bg: "bg-emerald-50 dark:bg-emerald-900/20" }
      : pct >= 60
      ? { label: "Tốt lắm!", sub: "Tiếp tục phát huy", color: "text-blue-500", stroke: "#3b82f6", bg: "bg-blue-50 dark:bg-blue-900/20" }
      : pct >= 40
      ? { label: "Khá ổn", sub: "Ôn thêm nhé bạn", color: "text-amber-500", stroke: "#f59e0b", bg: "bg-amber-50 dark:bg-amber-900/20" }
      : { label: "Cần cố gắng", sub: "Đừng bỏ cuộc nhé", color: "text-red-500", stroke: "#ef4444", bg: "bg-red-50 dark:bg-red-900/20" };

  const circumference = 2 * Math.PI * 40;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[100dvh] flex flex-col items-center justify-center p-6 gap-6 relative"
    >
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: APPLE_EASE }}
        className="relative w-[150px] h-[150px]"
      >
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" className="stroke-stone-200 dark:stroke-stone-800" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r="40" fill="none" stroke={grade.stroke} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - pct / 100) }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, ease: APPLE_EASE }}
            className="text-[32px] font-extrabold font-serif text-amber-950 dark:text-amber-50 leading-none"
          >
            {display}
          </motion.span>
          <span className="text-[12px] font-medium text-stone-500 dark:text-stone-400 mt-1">/ 10 điểm</span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, ease: APPLE_EASE }} className="text-center">
        <div className={`inline-block px-5 py-2 rounded-full text-[14px] font-bold mb-2 shadow-sm ${grade.bg} ${grade.color}`}>
          {grade.label}
        </div>
        <p className="text-[14.5px] font-medium text-stone-500 dark:text-stone-400 m-0">{grade.sub}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, ease: APPLE_EASE }} className="grid grid-cols-3 gap-3 w-full max-w-[340px]">
        {[
          { label: "Tổng câu", value: total, accent: false },
          { label: "Đúng", value: score, accent: true },
          { label: "Sai", value: wrong, accent: false },
        ].map((item) => (
          <div key={item.label} className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-md rounded-2xl border border-amber-900/10 dark:border-amber-100/10 p-3 text-center shadow-sm">
            <div className={`text-[22px] font-extrabold font-serif ${item.accent ? "text-amber-600 dark:text-amber-400" : "text-amber-950 dark:text-amber-50"}`}>
              {item.value}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mt-1">
              {item.label}
            </div>
          </div>
        ))}
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, ease: APPLE_EASE }}
        onClick={onRetry} whileTap={{ scale: 0.97 }}
        className="w-full max-w-[340px] p-4 rounded-xl bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white text-[15px] font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all mt-2"
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

  const lockedRef = useRef(false);
  const quizQRef = useRef([]);
  const currentRef = useRef(0);
  const quizEndedRef = useRef(false);
  const nextQTimerRef = useRef(null);
  const hasInitRef = useRef(false);

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

  /* ── Empty state ── */
  if (!Array.isArray(quizData) || quizData.length === 0) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 bg-[#FDFBF7] dark:bg-[#1C1917] p-6 text-center">
        <div className="text-[54px] drop-shadow-sm">😕</div>
        <p className="text-[16px] font-bold text-amber-950 dark:text-amber-50 m-0">Không có câu hỏi nào</p>
        <button
          onClick={() => onExitToRoute?.()}
          className="mt-2 px-7 py-3.5 rounded-xl bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white text-[15px] font-bold shadow-sm active:scale-95 transition-all"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] dark:bg-[#1C1917] transition-colors duration-300">
      {showGuide && <GuideBox onConfirm={handleGuideConfirm} skipStorageKey={SKIP_GUIDE_KEY} />}
      {showExit && <ExitButton handleExit={confirmExit} handleClose={() => setShowExit(false)} />}

      {/* ══════════════ QUIZ PHASE ══════════════ */}
      {phase === "quiz" && q && (
        <div className="flex flex-col min-h-[100dvh] max-w-[480px] mx-auto px-4 pt-[max(env(safe-area-inset-top),16px)] pb-[max(env(safe-area-inset-bottom),20px)]">
          
          {/* ── Header bar — frosted, sticky ── */}
          <div className="sticky top-0 z-10 flex items-center justify-between mb-4 pt-1 pb-3 gap-2 bg-white/70 dark:bg-[#1C1917]/70 backdrop-blur-xl border-b border-amber-900/5 dark:border-amber-100/5">
            <button
              onClick={() => setShowExit(true)}
              aria-label="Thoát"
              className="flex-shrink-0 w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 border border-black/5 dark:border-white/5 flex items-center justify-center text-stone-500 dark:text-stone-400 cursor-pointer shadow-sm active:scale-90 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="flex-1 min-w-0 text-center">
              <h1 className="text-[16px] font-extrabold font-serif text-amber-900 dark:text-amber-500 m-0 truncate px-2">
                {config.title}
              </h1>
            </div>

            <ThemeToggle />

            <div className="flex gap-2 flex-shrink-0">
              <StatPill label="câu" value={`${current + 1}/${totalQ}`} />
              <StatPill label="điểm" value={score} accent />
            </div>
          </div>

          {/* ── Segmented progress ── */}
          <div className="flex gap-1 mb-5">
            {Array.from({ length: totalQ }).map((_, i) => {
              const isDone = i < current;
              return (
                <div key={i} className="flex-1 h-1.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden relative shadow-inner">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-amber-600 dark:bg-amber-500 rounded-full"
                    initial={{ width: isDone ? "100%" : "0%" }}
                    animate={{ width: isDone ? "100%" : "0%" }}
                    transition={{ duration: 0.4, ease: APPLE_EASE }}
                  />
                </div>
              );
            })}
          </div>

          {/* ── Question card ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: APPLE_EASE }}
              className="bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl rounded-[24px] p-5 border border-amber-900/10 dark:border-amber-100/10 shadow-sm mb-5 flex items-start gap-4"
            >
              <span className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-xl bg-amber-100/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[13px] font-bold flex items-center justify-center border border-amber-200/50 dark:border-amber-800/30">
                {current + 1}
              </span>
              <p className="flex-1 text-[16px] font-bold text-amber-950 dark:text-amber-50 leading-relaxed m-0">
                {q.text}
              </p>
              <div className="flex-shrink-0 -mt-1">
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
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
              className="flex flex-col gap-3 mb-5"
            >
              {Object.entries(q.choices).map(([letter, text]) => (
                <motion.div
                  key={letter}
                  variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: APPLE_EASE } } }}
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
          <div className="mt-auto flex flex-col gap-3 pt-2">
            <motion.button
              onClick={() => handleAnswer(null)}
              disabled={answered}
              whileTap={{ scale: 0.98 }}
              animate={{ opacity: answered ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className={`w-full p-4 rounded-xl bg-white/50 dark:bg-stone-900/30 border border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 text-[15px] font-semibold transition-colors ${answered ? "pointer-events-none" : "hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer shadow-sm"}`}
            >
              Bỏ qua câu này →
            </motion.button>

            <div className="flex gap-3">
              <motion.button
                onClick={handleEarlyEnd}
                whileTap={{ scale: 0.97 }}
                className="flex-1 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-[14.5px] font-bold shadow-sm active:scale-95 transition-all"
              >
                Kết thúc sớm
              </motion.button>

              <motion.button
                onClick={() => { setTimerOn(false); setShowGuide(true); }}
                whileTap={{ scale: 0.95 }}
                aria-label="Hướng dẫn"
                className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white text-[18px] font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center"
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