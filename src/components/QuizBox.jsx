/**
 * QuizBox.jsx
 * Đã gộp toàn bộ logic của QuizContent vào file này.
 * Giao diện được tối ưu hoá theo hướng full-screen (iOS-like),
 * loại bỏ modal/backdrop cũ.
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuizTimer from "./ui/Timer.jsx";
import useSound from "./sound/useSounds.js";
import { GuideBox, ExitButton } from "./ui/Feedback.jsx";

// ====================== UTILITIES =========================
function getRandomItems(arr, n) {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
}

function burstConfetti(x, y) {
  const colors = ["#FF6B35", "#007AFF", "#34C759", "#FFD60A", "#FF375F", "#AF52DE"];
  const els = [];
  Array.from({ length: 14 }).forEach((_, i) => {
    const el = document.createElement("span");
    const angle = (Math.PI * 2 * i) / 14;
    const r = 70 + Math.random() * 40;
    el.style.cssText = `
      position:fixed; left:${x}px; top:${y}px;
      width:7px; height:7px; border-radius:2px;
      background:${colors[i % colors.length]};
      pointer-events:none; z-index:99999;
      transform-origin:center center;
    `;
    document.body.appendChild(el);
    els.push(el);
    el.animate(
      [
        { transform: "translate(-50%,-50%) scale(1)", opacity: 1 },
        {
          transform: `translate(calc(-50% + ${Math.cos(angle) * r}px), calc(-50% + ${Math.sin(angle) * r}px)) scale(0.3) rotate(${Math.random() * 360}deg)`,
          opacity: 0,
        },
      ],
      { duration: 550, easing: "cubic-bezier(0.22,1,0.36,1)", fill: "forwards" }
    );
  });
  
  // Cleanup sau 600ms dù component unmount
  const t = setTimeout(() => els.forEach((el) => el.remove()), 600);
  return () => { 
    clearTimeout(t); 
    els.forEach((el) => el.remove()); 
  };
}

// ====================== OPTION BUTTON =========================
function OptionButton({ label, text, state, onClick, onMouseEnter, disabled }) {
  const variants = {
    idle: "bg-white border border-[#E5E5EA] text-gray-800 active:scale-[0.98]",
    correct: "bg-[#D1FAE5] border border-[#34C759] text-[#065F46] font-semibold",
    wrong: "bg-[#FFE4E6] border border-[#FF375F] text-[#7F1D1D] font-semibold",
    reveal: "bg-[#EFF6FF] border border-[#007AFF] text-[#1D4ED8]",
  };
  
  const circleVariants = {
    idle: "bg-[#F2F2F7] text-gray-500 border border-[#E5E5EA]",
    correct: "bg-[#34C759] text-white border-transparent",
    wrong: "bg-[#FF375F] text-white border-transparent",
    reveal: "bg-[#007AFF] text-white border-transparent",
  };

  const handleClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onClick(rect);
  }, [onClick]);

  return (
    <motion.button
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left text-[15px] font-medium transition-all duration-200 select-none ${variants[state]}`}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      disabled={disabled}
      whileTap={state === "idle" ? { scale: 0.97 } : {}}
      animate={state === "wrong" ? { x: [0, -8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={state === "wrong" ? { duration: 0.35, ease: "easeInOut" } : {}}
    >
      <span className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border ${circleVariants[state]}`}>
        {state === "correct" ? "✓" : state === "wrong" ? "✗" : label}
      </span>
      <span className="flex-1 leading-snug">{text}</span>
    </motion.button>
  );
}

// ====================== MCQ =========================
function Mcq({ setMcqScore, mcq, setType, config, setUserAnswers }) {
  const [submitted, setSubmitted] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const scoreRef = useRef(0);
  const [current, setCurrent] = useState(0);
  const { play } = useSound();
  const timeoutRef = useRef(null);
  const isMobile = useMemo(() => window.matchMedia("(pointer: coarse)").matches, []);

  useEffect(() => { scoreRef.current = 0; }, [mcq]);

  const q = mcq?.[current];
  const totalQ = mcq?.length || 0;
  const progress = (current / totalQ) * 100;

  const handleAnswer = useCallback((rect, key = "Không trả lời") => {
    if (submitted || !q) return;
    setSelectedKey(key);
    setUserAnswers((prev) => [
      ...prev,
      { question: q.text, selected: key, correct: q.correct },
    ]);

    const isCorrect = key === q.correct;
    const isSkip = key === "Không trả lời";

    if (isSkip) {
      play("select");
    } else if (isCorrect) {
      play("correct");
      scoreRef.current += 1;
      if (rect) burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    } else {
      play("wrong");
    }

    setSubmitted(true);

    timeoutRef.current = setTimeout(() => {
      setSubmitted(false);
      setSelectedKey(null);
      if (current === mcq.length - 1) {
        setMcqScore(((scoreRef.current * config.mcqPoint) / mcq.length).toFixed(2));
        setType("essay");
      } else {
        setCurrent((prev) => prev + 1);
      }
    }, 900);
  }, [submitted, q, current, mcq, play, config, setMcqScore, setType, setUserAnswers]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!q) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <span className="text-4xl">📭</span>
      <p className="text-gray-400 font-medium">Không có câu hỏi trắc nghiệm</p>
    </div>
  );

  const getOptionState = (k) => {
    if (!submitted) return "idle";
    if (k === q.correct) return "correct";
    if (k === selectedKey) return "wrong";
    return "idle";
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[13px] text-gray-400 font-medium">
          <span>Câu {current + 1} / {totalQ}</span>
          <span className="tabular-nums">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-[#E5E5EA] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #FF6B35, #FF375F)" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`q-${current}`}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          className="bg-white rounded-3xl p-5 shadow-sm border border-[#F0F0F0]"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] text-[11px] font-bold">
              {current + 1}
            </span>
            <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
              Trắc nghiệm
            </span>
          </div>
          <h2 className="text-[17px] font-semibold text-gray-900 leading-snug">{q.text}</h2>
        </motion.div>
      </AnimatePresence>

      {/* Options */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`opts-${current}`}
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
          }}
          className="flex flex-col gap-2.5"
        >
          {Object.entries(q.choices || {}).map(([k, v]) => (
            <motion.div
              key={k}
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
              }}
            >
              <OptionButton
                label={k}
                text={v}
                state={getOptionState(k)}
                onClick={(rect) => handleAnswer(rect, k)}
                onMouseEnter={() => !isMobile && !submitted && play("hover")}
                disabled={submitted}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Skip */}
      <motion.button
        onClick={() => handleAnswer(null)}
        disabled={submitted}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3.5 rounded-2xl text-[15px] font-semibold text-gray-400 bg-[#F2F2F7] disabled:opacity-40 transition-colors hover:bg-[#E5E5EA] active:bg-[#D1D1D6]"
      >
        Bỏ qua câu này →
      </motion.button>
    </div>
  );
}

// ====================== ESSAY =========================
function Essay({ essay, setType, setEssayScore, config, setUserEssayAns }) {
  const { play } = useSound();
  const ansRefs = useRef({});
  const essayRef = useRef(0);

  useEffect(() => {
    if (!essay || essay.length === 0) {
      setEssayScore("0.00");
      setType("result");
    }
  }, [essay, setEssayScore, setType]);

  const checkEssay = () => {
    play("win");
    essay.forEach((q, i) => {
      const ans = ansRefs.current[`essay${i}`]?.value?.toLowerCase().trim() || "Không trả lời";
      setUserEssayAns((prev) => ({ ...prev, [`essay${i}`]: ans }));
      let score = 0;
      (q.keywords || []).forEach((item) => {
        const keyLower = (item.word || []).map((w) => w.toLowerCase());
        if (keyLower.every((w) => ans.includes(w))) {
          score += config.essayPoint / (config.essayCount || 1) / (q.keywords.length || 1);
        }
      });
      essayRef.current += score;
    });
    setEssayScore(essayRef.current.toFixed(2));
    setType("result");
  };

  if (!essay || essay.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col gap-4"
    >
      <div className="bg-white rounded-2xl px-4 py-3 border border-[#F0F0F0] shadow-sm flex items-center gap-2">
        <span className="text-lg">✍️</span>
        <div>
          <p className="text-[13px] font-bold text-gray-800">Phần tự luận</p>
          <p className="text-[11px] text-gray-400">{essay.length} câu · Trả lời bằng từ khoá</p>
        </div>
      </div>

      {essay.map((q, i) => (
        <div key={i} className="bg-white rounded-3xl p-5 border border-[#F0F0F0] shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#007AFF]/10 text-[#007AFF] text-[11px] font-bold">
              {i + 1}
            </span>
            <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">Tự luận</span>
          </div>
          <h3 className="text-[16px] font-semibold text-gray-900 leading-snug mb-3">{q.text}</h3>
          <textarea
            ref={(el) => (ansRefs.current[`essay${i}`] = el)}
            rows={4}
            placeholder="Nhập câu trả lời của bạn…"
            className="w-full resize-none rounded-2xl border border-[#E5E5EA] bg-[#F9F9F9] px-4 py-3 text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition"
          />
        </div>
      ))}

      <motion.button
        onClick={checkEssay}
        whileTap={{ scale: 0.97 }}
        className="w-full py-4 rounded-2xl text-[16px] font-bold text-white shadow-sm transition-colors"
        style={{ background: "linear-gradient(135deg, #007AFF 0%, #0055D4 100%)" }}
      >
        Nộp bài ✓
      </motion.button>
    </motion.div>
  );
}

// ====================== RESULT =========================
function Result({ mcq, essay, mcqScore, essayScore, userAnswers, handleReset, userEssayAns }) {
  const total = (parseFloat(essayScore || 0) + parseFloat(mcqScore || 0)).toFixed(2);
  const pct = Math.round((parseFloat(total) / 10) * 100);

  async function sendData() {
    const username = (() => { 
      try { return localStorage.getItem("username") || "anonymous"; } 
      catch { return "anonymous"; } 
    })();
    const API_URL = "https://script.google.com/macros/s/AKfycbxi7H5MhkxM478EnIX-shg1NMxg4ljIyCcokmODv55zBnNLyTBtkKTGG-brJcSmf5Q/exec";
    try {
      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ user: username, value: total }),
      });
    } catch {}
  }

  useEffect(() => { sendData(); }, []);

  const grade =
    parseFloat(total) >= 8 ? { label: "Xuất sắc", emoji: "🎉", color: "text-[#34C759]", bg: "bg-[#D1FAE5]" }
    : parseFloat(total) >= 6 ? { label: "Tốt", emoji: "👍", color: "text-[#007AFF]", bg: "bg-[#EFF6FF]" }
    : parseFloat(total) >= 4 ? { label: "Cần cố gắng", emoji: "📚", color: "text-[#FF9500]", bg: "bg-[#FFF7ED]" }
    : { label: "Cần ôn thêm", emoji: "💪", color: "text-[#FF375F]", bg: "bg-[#FFE4E6]" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-5"
    >
      {/* Score card */}
      <div className="bg-white rounded-3xl p-6 border border-[#F0F0F0] shadow-sm text-center">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Kết quả của bạn</p>

        {/* Circular indicator */}
        <div className="relative mx-auto w-32 h-32 mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#F2F2F7" strokeWidth="7" />
            <motion.circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke={pct >= 80 ? "#34C759" : pct >= 60 ? "#007AFF" : pct >= 40 ? "#FF9500" : "#FF375F"}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - pct / 100) }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-3xl font-extrabold text-gray-900 tabular-nums"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            >
              {total}
            </motion.span>
            <span className="text-xs text-gray-400 font-medium">/10</span>
          </div>
        </div>

        {/* Grade badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${grade.bg} mb-4`}>
          <span>{grade.emoji}</span>
          <span className={`text-sm font-bold ${grade.color}`}>{grade.label}</span>
        </div>

        {/* Score breakdown */}
        <div className="flex justify-center gap-8 mt-2">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{mcqScore}</p>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">Trắc nghiệm</p>
          </div>
          <div className="w-px bg-[#F2F2F7]" />
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{essayScore}</p>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">Tự luận</p>
          </div>
        </div>
      </div>

      {/* MCQ Review */}
      <ReviewSection title="Xem lại trắc nghiệm" icon="📝">
        {(mcq || []).map((q, i) => {
          const ua = userAnswers[i];
          const sel = ua?.selected;
          const isCorrect = sel === q.correct;
          const isSkip = !sel || sel === "Không trả lời";
          return (
            <ReviewCard key={i} index={i + 1} question={q.text}>
              <ReviewRow
                label="Bạn chọn"
                value={isSkip ? "Không trả lời" : q.choices[sel]}
                color={isCorrect ? "text-[#34C759]" : isSkip ? "text-gray-400" : "text-[#FF375F]"}
                icon={isCorrect ? "✓" : isSkip ? "–" : "✗"}
              />
              {!isCorrect && !isSkip && (
                <ReviewRow label="Đáp án đúng" value={q.choices[q.correct]} color="text-[#34C759]" icon="✓" />
              )}
              {isSkip && (
                <ReviewRow label="Đáp án đúng" value={q.choices[q.correct]} color="text-[#34C759]" icon="✓" />
              )}
            </ReviewCard>
          );
        })}
      </ReviewSection>

      {/* Essay Review */}
      <ReviewSection title="Xem lại tự luận" icon="✍️">
        {(essay || []).map((q, i) => {
          const ans = userEssayAns[`essay${i}`];
          return (
            <ReviewCard key={i} index={i + 1} question={q.text}>
              {q.sample && (
                <div className="mb-2 p-2.5 bg-[#F0FDF4] rounded-xl">
                  <p className="text-[11px] font-bold text-[#16A34A] mb-1 uppercase tracking-wide">Gợi ý đáp án</p>
                  <p className="text-[13px] text-[#15803D] leading-relaxed whitespace-pre-line">{q.sample}</p>
                </div>
              )}
              <div className="p-2.5 bg-[#F9F9F9] rounded-xl">
                <p className="text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-wide">Câu trả lời của bạn</p>
                <p className="text-[13px] text-gray-700 leading-relaxed">{ans || "—"}</p>
              </div>
            </ReviewCard>
          );
        })}
      </ReviewSection>

      <motion.button
        onClick={handleReset}
        whileTap={{ scale: 0.97 }}
        className="w-full py-4 rounded-2xl text-[15px] font-semibold text-gray-600 bg-[#F2F2F7] hover:bg-[#E5E5EA] transition-colors"
      >
        Làm lại từ đầu ↺
      </motion.button>
    </motion.div>
  );
}

// Helper components
function ReviewSection({ title, icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 px-1">
        <span>{icon}</span>
        <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">{title}</p>
      </div>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}
function ReviewCard({ index, question, children }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#F0F0F0] shadow-sm">
      <p className="text-[14px] font-semibold text-gray-800 mb-3 leading-snug">
        <span className="text-[#FF6B35] mr-1.5 font-bold">{index}.</span>{question}
      </p>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}
function ReviewRow({ label, value, color, icon }) {
  return (
    <div className="flex items-start gap-2 text-[13px]">
      <span className={`font-bold mt-0.5 flex-shrink-0 ${color}`}>{icon}</span>
      <span className="text-gray-400 shrink-0 flex-shrink-0">{label}:</span>
      <span className={`font-medium ${color} flex-1 leading-snug`}>{value}</span>
    </div>
  );
}

// ====================== MAIN QUIZBOX =========================
export default function QuizBox({ handleExit, config, quizData }) {
  const { play } = useSound();
  const [showGuide, setShowGuide] = useState(false);
  const [isOpenExit, setIsOpenExit] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const [mcqScore, setMcqScore] = useState(0);
  const [essayScore, setEssayScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [userEssayAns, setUserEssayAns] = useState({});
  const [type, setType] = useState("mcq");

  useEffect(() => {
    if (localStorage.getItem("skipQuizGuide") !== "true") setShowGuide(true);
  }, []);

  const handleGuideConfirm = (skipNext) => {
    if (skipNext) localStorage.setItem("skipQuizGuide", "true");
    setShowGuide(false);
  };

  const autoSubmit = useCallback(() => {
    if (type === "mcq") {
      setMcqScore(0); // chấp nhận 0 điểm MCQ khi hết giờ
      setType("essay");
    } else if (type === "essay") {
      setEssayScore(0);
      setType("result");
    }
  }, [type]);

  const handleReset = () => {
    play("select");
    setAttempt((a) => a + 1);
    setType("mcq");
    setMcqScore(0);
    setEssayScore(0);
    setUserAnswers([]);
    setUserEssayAns({});
  };

  const mcq = useMemo(
    () => getRandomItems(quizData?.mcq || [], config?.mcqCount || 0),
    [quizData?.mcq, config?.mcqCount, attempt]
  );
  const essay = useMemo(
    () => getRandomItems(quizData?.essay || [], config?.essayCount || 0),
    [quizData?.essay, config?.essayCount, attempt]
  );

  if (!config) return null;

  const phaseLabel = { mcq: "Trắc Nghiệm", essay: "Tự Luận", result: "Kết Quả" }[type];
  const phaseNum = { mcq: "I", essay: "II", result: null }[type];

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <AnimatePresence>
        {isOpenExit && <ExitButton handleExit={handleExit} handleClose={() => setIsOpenExit(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showGuide && <GuideBox onConfirm={handleGuideConfirm} skipStorageKey="skipQuizGuide" />}
      </AnimatePresence>

      <div
        className="flex flex-col min-h-screen max-w-md mx-auto w-full px-4"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 16px)",
          paddingBottom: "max(env(safe-area-inset-bottom), 24px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4 pt-1">
          <div className="min-w-0 flex-1">
            <h1 className="text-[19px] font-extrabold text-[#FF6B35] tracking-tight truncate leading-tight">
              {config.title}
            </h1>
            {phaseNum && (
              <p className="text-[12px] font-medium text-gray-400 mt-0.5">
                Phần {phaseNum} · {phaseLabel}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {type !== "result" && (
              <div className="flex items-center gap-1.5 bg-white border border-[#F0F0F0] rounded-full pl-2.5 pr-3 py-1.5 shadow-sm">
                <span className="text-[12px]">⏱</span>
                <QuizTimer
                  duration={config.time}
                  onTimeUp={autoSubmit}
                  className="text-[13px] font-bold text-[#FF375F] tabular-nums"
                />
              </div>
            )}
            {type !== "result" && (
              <button
                onClick={() => setShowGuide(true)}
                aria-label="Hướng dẫn"
                className="w-9 h-9 rounded-full bg-[#FF6B35] text-white text-[14px] font-bold flex items-center justify-center shadow-sm hover:bg-[#E85E28] transition-colors active:scale-95"
              >
                ?
              </button>
            )}
            <button
              onClick={() => setIsOpenExit(true)}
              aria-label="Thoát"
              className="w-9 h-9 rounded-full bg-white shadow-sm border border-[#F0F0F0] flex items-center justify-center text-gray-400 hover:text-gray-600 active:scale-95 transition text-[13px]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {type === "mcq" && (
                <Mcq
                  mcq={mcq} config={config}
                  setMcqScore={setMcqScore} setType={setType}
                  setUserAnswers={setUserAnswers}
                />
              )}
              {type === "essay" && (
                <Essay
                  essay={essay} config={config}
                  setEssayScore={setEssayScore} setType={setType}
                  setUserEssayAns={setUserEssayAns}
                />
              )}
              {type === "result" && (
                <Result
                  mcq={mcq} essay={essay}
                  mcqScore={mcqScore} essayScore={essayScore}
                  userAnswers={userAnswers} userEssayAns={userEssayAns}
                  handleReset={handleReset}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="text-center text-[11px] text-[#C7C7CC] font-medium tracking-wide py-4">
          Design by Khối Phụng Vụ Gx An Ngãi
        </p>
      </div>
    </div>
  );
}