/**
 * DoVui.jsx — UI Apple-style, mobile-first.
 *
 * Thiết kế đồng bộ với QuizContent.jsx: nền xám nhạt #F2F2F7, card trắng
 * bo góc lớn (rounded-3xl), màu hệ thống (cam thương hiệu #FF6B35, xanh lá
 * #34C759 = đúng, đỏ #FF375F = sai/nguy cấp, cam #FF9500 = cảnh báo).
 * Đồng hồ đếm ngược theo câu là 1 vòng tròn tiến trình (kiểu Apple Watch ring),
 * đổi màu theo mức khẩn cấp — gọn, rõ, không chiếm diện tích trên màn hình nhỏ.
 *
 * Nhận props giống QuizBox: config, quizData, handleExit.
 */

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
   OPTION BUTTON — cùng ngôn ngữ thiết kế với QuizContent.OptionButton
══════════════════════════════════════════════ */
const VARIANTS = {
  idle: "bg-white border border-[#E5E5EA] text-gray-800 active:scale-[0.98] active:bg-[#F2F2F7]",
  correct: "bg-[#D1FAE5] border border-[#34C759] text-[#065F46] font-semibold",
  wrong: "bg-[#FFE4E6] border border-[#FF375F] text-[#7F1D1D] font-semibold",
  dim: "bg-[#F9F9F9] border border-[#F0F0F0] text-gray-400",
};
const CIRCLE_VARIANTS = {
  idle: "bg-[#F2F2F7] text-gray-500 border border-[#E5E5EA]",
  correct: "bg-[#34C759] text-white border-transparent",
  wrong: "bg-[#FF375F] text-white border-transparent",
  dim: "bg-[#F2F2F7] text-gray-300 border border-[#E5E5EA]",
};

const OptionBtn = memo(({ letter, text, state, onClick, onHover, disabled }) => (
  <motion.button
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left text-[15px] font-medium transition-all duration-200 select-none ${VARIANTS[state]}`}
    onClick={onClick}
    onMouseEnter={onHover}
    disabled={disabled}
    whileTap={state === "idle" ? { scale: 0.97 } : {}}
    animate={state === "wrong" ? { x: [0, -8, 8, -6, 6, -4, 4, 0] } : {}}
    transition={state === "wrong" ? { duration: 0.35, ease: "easeInOut" } : {}}
  >
    <span
      className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border ${CIRCLE_VARIANTS[state]}`}
    >
      {letter}
    </span>
    <span className="flex-1 leading-snug">{text}</span>
    {state === "correct" && <span className="text-[#34C759] text-lg">✓</span>}
    {state === "wrong" && <span className="text-[#FF375F] text-lg">✕</span>}
  </motion.button>
));

/* ══════════════════════════════════════════════
   RESULT CARD — vòng tròn điểm số, đồng bộ QuizContent.Result
══════════════════════════════════════════════ */
function ResultCard({ score, total, onRetry }) {
  const display = total ? ((score / total) * 10).toFixed(1) : "0.0";
  const pct = total ? Math.round((score / total) * 100) : 0;
  const grade =
    pct >= 80
      ? { label: "Xuất sắc 🎉", color: "text-[#34C759]" }
      : pct >= 60
      ? { label: "Tốt 👍", color: "text-[#007AFF]" }
      : pct >= 40
      ? { label: "Cần cố gắng 📚", color: "text-[#FF9500]" }
      : { label: "Cần ôn thêm 💪", color: "text-[#FF375F]" };
  const circumference = 2 * Math.PI * 42;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-sm mx-auto bg-white rounded-3xl p-6 border border-[#F0F0F0] shadow-sm text-center"
    >
      <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Kết quả</p>

      <div className="relative mx-auto w-28 h-28 mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#F2F2F7" strokeWidth="8" />
          <motion.circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#FF6B35"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - pct / 100) }}
            transition={{ duration: 1, delay: 0.25, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{display}</span>
          <span className="text-xs text-gray-400 font-medium">/10</span>
        </div>
      </div>

      <p className={`text-lg font-bold ${grade.color}`}>{grade.label}</p>
      <p className="text-[13px] text-gray-400 mt-1">Đúng {score}/{total} câu</p>

      <motion.button
        onClick={onRetry}
        whileTap={{ scale: 0.97 }}
        className="w-full mt-6 py-4 rounded-2xl text-[16px] font-bold text-white bg-[#FF6B35] shadow-sm hover:bg-[#E85E28] transition-colors"
      >
        Làm lại
      </motion.button>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   Props giống QuizBox: config, quizData, handleExit
══════════════════════════════════════════════ */
export default function DoVui({ config, quizData, handleExit: onExitToRoute }) {
  const { play, unlock, stopAll } = useSound();

  // phase: "quiz" | "result"
  const [phase, setPhase] = useState("quiz");
  const [showGuide, setShowGuide] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [quizQ, setQuizQ] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [timerOn, setTimerOn] = useState(false);
  const [optStates, setOptStates] = useState({});

  const quizEndedRef = useRef(false);

  // ── Start quiz ──
  const startQuiz = useCallback(() => {
    unlock();
    const pool = Array.isArray(quizData) ? quizData : [];
    const picked = getRandomItems(pool, Math.min(config.mcqCount || pool.length, pool.length));
    setQuizQ(picked);
    setCurrent(0);
    setScore(0);
    setLocked(false);
    setOptStates({});
    quizEndedRef.current = false;

    if (localStorage.getItem(SKIP_GUIDE_KEY) === "1") {
      setPhase("quiz");
      setTimerOn(true);
    } else {
      setPhase("quiz");
      setShowGuide(true);
      setTimerOn(false);
    }
  }, [quizData, config.mcqCount, unlock]);

  useEffect(() => {
    startQuiz();
  },[]);

  // ── Guide confirm ──
  const handleGuideConfirm = useCallback((skipNext) => {
    if (skipNext) localStorage.setItem(SKIP_GUIDE_KEY, "1");
    setShowGuide(false);
    setTimerOn(true);
  }, []);

  // ── Show results ──
  const showResults = useCallback(() => {
    if (quizEndedRef.current) return;
    quizEndedRef.current = true;
    setTimerOn(false);
    play("win");
    setPhase("result");
  }, [play]);

  // ── Next question ──
  const nextQuestion = useCallback(() => {
    setCurrent((prev) => {
      const next = prev + 1;
      if (next < quizQ.length) {
        setLocked(false);
        setOptStates({});
        setTimerOn(true);
        return next;
      } else {
        showResults();
        return prev;
      }
    });
  }, [quizQ.length, showResults]);

  // ── Handle answer ──
  const handleAnswer = useCallback(
    (selectedKey = null) => {
      if (locked) return;
      setLocked(true);
      setTimerOn(false);

      const q = quizQ[current];
      const correct = q.correct;
      const newStates = {};
      Object.keys(q.choices).forEach((k) => {
        if (k === correct) newStates[k] = "correct";
        else if (k === selectedKey) newStates[k] = "wrong";
        else newStates[k] = "dim";
      });
      setOptStates(newStates);

      if (selectedKey === correct) {
        play("correct");
        setScore((s) => s + 1);
      } else {
        play("wrong");
      }

      setTimeout(() => nextQuestion(), 1200);
    },
    [locked, quizQ, current, play, nextQuestion]
  );

  // ── Timer callbacks ──
  const handleTimeUp = useCallback(() => {
    if (locked) return;
    play("wrong");
    handleAnswer(null);
  }, [locked, play, handleAnswer]);

  const handleFinalRush = useCallback(() => {
    play("tick1", 1.6);
    setTimeout(() => play("tick2", 1.8), 350);
  }, [play]);

  // ── Exit: dừng âm thanh rồi điều hướng ra khỏi route (do TestQuiz cung cấp) ──
  const confirmExit = useCallback(() => {
    setTimerOn(false);
    stopAll();
    quizEndedRef.current = true;
    setShowExit(false);
    onExitToRoute?.();
  }, [stopAll, onExitToRoute]);

  const q = quizQ[current];
  const totalQ = quizQ.length;
  const progress = totalQ ? (current / totalQ) * 100 : 0;

  // Dữ liệu trống/không đủ câu — phòng hờ
  if (!Array.isArray(quizData) || quizData.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F2F2F7] px-4 text-center">
        <p className="text-[16px] font-semibold text-gray-700">Không có câu hỏi nào 😕</p>
        <button
          onClick={() => onExitToRoute?.()}
          className="px-5 py-2.5 rounded-2xl bg-[#FF6B35] text-white text-[15px] font-semibold"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      {showGuide && <GuideBox onConfirm={handleGuideConfirm} skipStorageKey={SKIP_GUIDE_KEY} />}
      {showExit && <ExitButton handleExit={confirmExit} handleClose={() => setShowExit(false)} />}

      {/* ─── QUIZ PHASE ─── */}
      {phase === "quiz" && q && (
        <div
          className="flex flex-col min-h-screen max-w-md mx-auto w-full px-4"
          style={{
            paddingTop: "max(env(safe-area-inset-top), 16px)",
            paddingBottom: "max(env(safe-area-inset-bottom), 16px)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pt-1">
            <div>
              <h1 className="text-[20px] font-extrabold text-[#FF6B35] tracking-tight">{config.title}</h1>
              <p className="text-[13px] font-medium text-gray-400 mt-0.5">
                Câu {current + 1} / {totalQ}
              </p>
            </div>
            <button
              onClick={() => setShowExit(true)}
              aria-label="Thoát"
              className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#F0F0F0] flex items-center justify-center text-gray-400 active:scale-95 transition"
            >
              ✕
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-[#E5E5EA] rounded-full overflow-hidden mb-5">
            <motion.div
              className="h-full bg-[#FF6B35] rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>

          {/* Question card + ring timer */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="bg-white rounded-3xl p-5 shadow-sm border border-[#F0F0F0] mb-5 flex items-start gap-4"
            >
              <p className="flex-1 text-[17px] font-semibold text-gray-900 leading-snug">{q.text}</p>
              <QuizTimerRing
                duration={QUESTION_DURATION_MS}
                running={timerOn && !showGuide}
                resetKey={current}
                onTimeUp={handleTimeUp}
                onFinalRush={handleFinalRush}
              />
            </motion.div>
          </AnimatePresence>

          {/* Options */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } } }}
              className="flex flex-col gap-2.5 mb-5"
            >
              {Object.entries(q.choices).map(([letter, text]) => (
                <motion.div
                  key={letter}
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
                  }}
                >
                  <OptionBtn
                    letter={letter}
                    text={text}
                    state={optStates[letter] ?? "idle"}
                    onClick={() => handleAnswer(letter)}
                    onHover={() => play("hover")}
                    disabled={locked}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Bottom actions */}
          <div className="mt-auto flex flex-col gap-2.5 pt-2">
            <motion.button
              onClick={() => handleAnswer(null)}
              disabled={locked}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 rounded-2xl text-[15px] font-semibold text-gray-500 bg-white border border-[#E5E5EA] disabled:opacity-40 transition-colors hover:bg-[#F2F2F7]"
            >
              Bỏ qua →
            </motion.button>
            <div className="flex gap-2.5">
              <motion.button
                onClick={() => {
                  setTimerOn(false);
                  showResults();
                }}
                disabled={locked}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-3 rounded-2xl text-[14px] font-semibold text-[#FF375F] bg-[#FFE4E6] disabled:opacity-40 transition-colors"
              >
                Kết thúc sớm
              </motion.button>
              <motion.button
                onClick={() => {
                  setTimerOn(false);
                  setShowGuide(true);
                }}
                whileTap={{ scale: 0.95 }}
                aria-label="Hướng dẫn"
                className="w-12 h-12 flex-shrink-0 rounded-2xl bg-[#FF6B35] text-white text-[16px] font-bold shadow-sm hover:bg-[#E85E28] transition-colors"
              >
                ?
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* ─── RESULT PHASE ─── */}
      {phase === "result" && (
        <div className="min-h-screen flex items-center justify-center px-4 py-10">
          <ResultCard score={score} total={totalQ} onRetry={startQuiz} />
        </div>
      )}
    </div>
  );
}