import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import QuizTimer from "../ui/Timer.jsx";
import useSound from "../../features/sound/useSounds.js";
import { GuideBox, ExitButton, SubmitConfirmBox } from "../ui/Feedback.jsx";

// Hằng số Easing chuẩn hệ thống
const APPLE_EASE = [0.16, 1, 0.3, 1];

// ====================== UTILITIES =========================
function getRandomItems(arr, n) {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
}

function burstConfetti(x, y) {
  const colors = ["#314e3e", "#927140", "#d4b47d", "#10b981", "#d6b883", "#22c55e"];
  const els = [];
  Array.from({ length: 16 }).forEach((_, i) => {
    const el = document.createElement("span");
    const angle = (Math.PI * 2 * i) / 16;
    const r = 80 + Math.random() * 50;
    el.style.cssText = `
      position:fixed; left:${x}px; top:${y}px;
      width:8px; height:8px; border-radius:3px;
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
          transform: `translate(calc(-50% + ${Math.cos(angle) * r}px), calc(-50% + ${Math.sin(angle) * r}px)) scale(0.2) rotate(${Math.random() * 360}deg)`,
          opacity: 0,
        },
      ],
      { duration: 600, easing: "cubic-bezier(0.16,1,0.3,1)", fill: "forwards" }
    );
  });
  
  const t = setTimeout(() => els.forEach((el) => el.remove()), 650);
  return () => { 
    clearTimeout(t); 
    els.forEach((el) => el.remove()); 
  };
}

// ====================== OPTION BUTTON =========================
function OptionButton({ label, text, state, onClick, onMouseEnter, disabled }) {
  const getStyle = () => {
    switch (state) {
      case "correct":
        return {
          btn: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/50 text-emerald-800 dark:text-emerald-300 font-bold",
          badge: "bg-emerald-600 text-white border-transparent",
        };
      case "wrong":
        return {
          btn: "bg-red-50 dark:bg-red-950/40 border-red-500/50 text-red-800 dark:text-red-300 font-bold",
          badge: "bg-red-600 text-white border-transparent",
        };
      case "reveal":
        return {
          btn: "bg-[#927140]/10 dark:bg-[#d4b47d]/15 border-[#927140]/30 dark:border-[#d4b47d]/30 text-[#7c5c2d] dark:text-[#d4b47d] font-bold",
          badge: "bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] border-transparent",
        };
      default: // idle
        return {
          btn: "bg-[#fffefa] dark:bg-[#1e2821] border-[#dedfd4] dark:border-[#354237] text-[#293d32] dark:text-[#ecece0] font-medium hover:bg-[#faf8f3] dark:hover:bg-[#151c18] shadow-xs",
          badge: "bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] border-[#dedfd4] dark:border-[#354237]",
        };
    }
  };

  const s = getStyle();

  const handleClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onClick(rect);
  }, [onClick]);

  return (
    <Motion.button
      className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-[20px] border-[1.5px] text-left text-[15px] transition-colors select-none min-h-[56px] ${s.btn} ${disabled ? "pointer-events-none" : "cursor-pointer"}`}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      disabled={disabled}
      whileTap={state === "idle" ? { scale: 0.98 } : {}}
      animate={state === "wrong" ? { x: [0, -6, 6, -4, 4, -2, 2, 0] } : {}}
      transition={state === "wrong" ? { duration: 0.35, ease: "easeInOut" } : { duration: 0.2, ease: APPLE_EASE }}
    >
      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold border transition-colors duration-300 ${s.badge}`}>
        {state === "correct" ? "✓" : state === "wrong" ? "✗" : label}
      </span>
      <span className="flex-1 leading-snug">{text}</span>
    </Motion.button>
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
    }, 1000);
  }, [submitted, q, current, mcq, play, config, setMcqScore, setType, setUserAnswers]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!q) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
      <span className="text-[54px] drop-shadow-sm opacity-80">📭</span>
      <p className="text-[16px] font-bold text-[#293d32] dark:text-[#ecece0]">Không có câu hỏi trắc nghiệm</p>
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
      <div className="space-y-2">
        <div className="flex justify-between items-end px-1">
          <span className="text-[11px] font-bold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-widest">
            Câu {current + 1} / {totalQ}
          </span>
          <span className="text-[13px] font-black font-serif text-[#314e3e] dark:text-[#d6b883] tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 bg-[#dedfd4] dark:bg-[#354237] rounded-full overflow-hidden shadow-inner">
          <Motion.div
            className="h-full bg-[#314e3e] dark:bg-[#d6b883] rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: APPLE_EASE }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <Motion.div
          key={`q-${current}`}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: APPLE_EASE }}
          className="bg-[#fffefa] dark:bg-[#1e2821] rounded-[24px] p-5 shadow-xs border border-[#dedfd4] dark:border-[#354237] flex flex-col gap-3.5"
        >
          {/* Đưa span và h2 vào chung một div flex hàng ngang */}
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-7 h-7 shrink-0 rounded-xl bg-[#927140]/10 dark:bg-[#d4b47d]/15 text-[#7c5c2d] dark:text-[#d4b47d] text-[12px] font-bold border border-[#927140]/25 dark:border-[#d4b47d]/30 mt-0.5">
              {current + 1}
            </span>
            <h2 className="text-[16px] font-bold text-[#293d32] dark:text-[#ecece0] leading-relaxed">
              {q.text}
            </h2>
          </div>
        </Motion.div>
      </AnimatePresence>

      {/* Options */}
      <AnimatePresence mode="wait">
        <Motion.div
          key={`opts-${current}`}
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.05 } },
          }}
          className="flex flex-col gap-3"
        >
          {Object.entries(q.choices || {}).map(([k, v]) => (
            <Motion.div
              key={k}
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: APPLE_EASE } },
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
            </Motion.div>
          ))}
        </Motion.div>
      </AnimatePresence>

      {/* Skip */}
      <Motion.button
        onClick={() => handleAnswer(null)}
        disabled={submitted}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-2 py-4 rounded-xl text-[14px] font-bold text-[#575e55] dark:text-[#b0b9ac] bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] disabled:opacity-40 transition-colors md:hover:bg-[#faf8f3] dark:md:hover:bg-[#151c18] shadow-xs cursor-pointer"
      >
        Bỏ qua câu này →
      </Motion.button>
    </div>
  );
}

// ====================== ESSAY =========================
function Essay({ essay, setType, setEssayScore, config, setUserEssayAns, mcq, userAnswers }) {
  const { play } = useSound();
  const ansRefs = useRef({});
  const essayRef = useRef(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitStats, setSubmitStats] = useState(null);

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

  const handlePreSubmit = () => {
    const answeredCount = essay.reduce((acc, _, i) => {
      const val = ansRefs.current[`essay${i}`]?.value?.trim();
      return val ? acc + 1 : acc;
    }, 0);

    setSubmitStats({
      mcqTotal: mcq?.length || config?.mcqCount || 0,
      mcqAnswered: Object.keys(userAnswers || {}).length,
      essayTotal: essay.length,
      essayAnswered: answeredCount,
    });
    setShowConfirm(true);
  };

  if (!essay || essay.length === 0) return null;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: APPLE_EASE }}
      className="flex flex-col gap-5"
    >
      <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-[24px] p-5 border border-[#dedfd4] dark:border-[#354237] shadow-xs flex items-center gap-4">
        <span className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center bg-[#927140]/10 dark:bg-[#d4b47d]/15 text-[20px] border border-[#927140]/25 dark:border-[#d4b47d]/30 shadow-xs">✍️</span>
        <div>
          <p className="text-[16px] font-extrabold font-serif text-[#293d32] dark:text-[#ecece0]">Phần tự luận</p>
          <p className="text-[13px] font-medium text-[#575e55] dark:text-[#b0b9ac] mt-1">{essay.length} câu · Trả lời bằng từ khóa</p>
        </div>
      </div>

      {essay.map((q, i) => (
        <div key={i} className="bg-[#fffefa] dark:bg-[#1e2821] rounded-[24px] p-5 border border-[#dedfd4] dark:border-[#354237] shadow-xs flex flex-col gap-3.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-[#927140]/10 dark:bg-[#d4b47d]/15 text-[#7c5c2d] dark:text-[#d4b47d] text-[12px] font-bold border border-[#927140]/25 dark:border-[#d4b47d]/30">
              {i + 1}
            </span>
            <span className="text-[11px] font-bold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-widest">Tự luận</span>
          </div>
          <h3 className="text-[16px] font-bold text-[#293d32] dark:text-[#ecece0] leading-relaxed mb-1">{q.text}</h3>
          <textarea
            ref={(el) => (ansRefs.current[`essay${i}`] = el)}
            rows={4}
            placeholder="Nhập câu trả lời của bạn…"
            className="w-full resize-none rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] px-4 py-3.5 text-[15px] font-medium text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 transition-shadow shadow-inner"
          />
        </div>
      ))}

      <Motion.button
        onClick={handlePreSubmit}
        whileTap={{ scale: 0.98 }}
        className="w-full min-h-[48px] py-4 mt-2 rounded-xl text-[15px] font-bold text-[#ffffff] shadow-xs transition-all hover:opacity-95 active:scale-95 bg-[#314e3e] dark:bg-[#d6b883] dark:text-[#19251d] cursor-pointer"
      >
        Nộp bài ✓
      </Motion.button>

      {showConfirm && submitStats && (
        <SubmitConfirmBox
          isOpen={showConfirm}
          onCancel={() => setShowConfirm(false)}
          onConfirm={() => {
            setShowConfirm(false);
            checkEssay();
          }}
          mcqTotal={submitStats.mcqTotal}
          mcqAnswered={submitStats.mcqAnswered}
          essayTotal={submitStats.essayTotal}
          essayAnswered={submitStats.essayAnswered}
        />
      )}
    </Motion.div>
  );
}

// ====================== RESULT =========================
function Result({ mcq, essay, mcqScore, essayScore, userAnswers, handleReset, userEssayAns }) {
  const total = (parseFloat(essayScore || 0) + parseFloat(mcqScore || 0)).toFixed(2);
  const pct = Math.round((parseFloat(total) / 10) * 100);

  useEffect(() => {
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
      } catch (err) {
        console.warn("Không thể đồng bộ kết quả:", err);
      }
    }

    sendData();
  }, [total]);

  const grade =
    parseFloat(total) >= 8 ? { label: "Xuất sắc", emoji: "🎉", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200/50 dark:border-emerald-500/20" }
    : parseFloat(total) >= 6 ? { label: "Tốt", emoji: "👍", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-500/20" }
    : parseFloat(total) >= 4 ? { label: "Cần cố gắng", emoji: "📚", color: "text-[#7c5c2d] dark:text-[#d4b47d]", bg: "bg-[#927140]/10 dark:bg-[#d4b47d]/15 border-[#927140]/25 dark:border-[#d4b47d]/30" }
    : { label: "Cần ôn thêm", emoji: "💪", color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20 border-red-200/50 dark:border-red-500/20" };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: APPLE_EASE }}
      className="flex flex-col gap-6"
    >
      {/* Score card */}
      <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-[28px] p-7 border border-[#dedfd4] dark:border-[#354237] shadow-xs text-center">
        <p className="text-[12px] font-bold uppercase tracking-widest text-[#575e55] dark:text-[#b0b9ac] mb-6">Kết quả của bạn</p>

        {/* Circular indicator */}
        <div className="relative mx-auto w-36 h-36 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" className="stroke-[#dedfd4] dark:stroke-[#354237]" strokeWidth="8" />
            <Motion.circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke={pct >= 80 ? "#10b981" : pct >= 60 ? "#3b82f6" : pct >= 40 ? "#d97706" : "#ef4444"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - pct / 100) }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Motion.span
              className="text-[36px] font-extrabold font-serif text-[#293d32] dark:text-[#ecece0] tabular-nums leading-none"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5, ease: APPLE_EASE }}
            >
              {total}
            </Motion.span>
            <span className="text-[13px] font-bold text-[#575e55] dark:text-[#b0b9ac] mt-1">/ 10</span>
          </div>
        </div>

        {/* Grade badge */}
        <div className={`inline-flex items-center gap-2.5 px-5 py-2 rounded-full border shadow-xs mb-7 ${grade.bg}`}>
          <span className="text-[16px]">{grade.emoji}</span>
          <span className={`text-[15px] font-bold ${grade.color}`}>{grade.label}</span>
        </div>

        {/* Score breakdown */}
        <div className="flex justify-center gap-8 bg-[#faf8f3] dark:bg-[#151c18] rounded-[20px] py-4 border border-[#dedfd4] dark:border-[#354237] shadow-inner">
          <div className="text-center w-24">
            <p className="text-[22px] font-extrabold font-serif text-[#293d32] dark:text-[#ecece0] tabular-nums">{mcqScore}</p>
            <p className="text-[10px] text-[#575e55] dark:text-[#b0b9ac] font-bold mt-1 uppercase tracking-widest">Trắc nghiệm</p>
          </div>
          <div className="w-px bg-[#dedfd4] dark:bg-[#354237]" />
          <div className="text-center w-24">
            <p className="text-[22px] font-extrabold font-serif text-[#293d32] dark:text-[#ecece0] tabular-nums">{essayScore}</p>
            <p className="text-[10px] text-[#575e55] dark:text-[#b0b9ac] font-bold mt-1 uppercase tracking-widest">Tự luận</p>
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
                color={isCorrect ? "text-emerald-600 dark:text-emerald-400" : isSkip ? "text-[#575e55] dark:text-[#b0b9ac]" : "text-red-600 dark:text-red-400"}
                icon={isCorrect ? "✓" : isSkip ? "–" : "✗"}
              />
              {!isCorrect && !isSkip && (
                <ReviewRow label="Đáp án đúng" value={q.choices[q.correct]} color="text-emerald-600 dark:text-emerald-400" icon="✓" />
              )}
              {isSkip && (
                <ReviewRow label="Đáp án đúng" value={q.choices[q.correct]} color="text-emerald-600 dark:text-emerald-400" icon="✓" />
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
                <div className="mb-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-500/20 rounded-[16px]">
                  <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mb-2 uppercase tracking-widest">Gợi ý đáp án</p>
                  <p className="text-[14px] text-emerald-800 dark:text-emerald-300 font-medium leading-relaxed whitespace-pre-line">{q.sample}</p>
                </div>
              )}
              <div className="p-4 bg-[#faf8f3] dark:bg-[#151c18] rounded-[16px] shadow-inner border border-[#dedfd4] dark:border-[#354237]">
                <p className="text-[10px] font-bold text-[#575e55] dark:text-[#b0b9ac] mb-2 uppercase tracking-widest">Câu trả lời của bạn</p>
                <p className="text-[14px] text-[#293d32] dark:text-[#ecece0] font-medium leading-relaxed">{ans || "—"}</p>
              </div>
            </ReviewCard>
          );
        })}
      </ReviewSection>

      <Motion.button
        onClick={handleReset}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 mt-2 rounded-xl text-[14px] font-bold text-[#293d32] dark:text-[#ecece0] bg-[#fffefa] dark:bg-[#1e2821] md:hover:bg-[#faf8f3] dark:md:hover:bg-[#151c18] transition-all border border-[#dedfd4] dark:border-[#354237] shadow-xs cursor-pointer"
      >
        Làm lại từ đầu ↺
      </Motion.button>
    </Motion.div>
  );
}

// Helper components
function ReviewSection({ title, icon, children }) {
  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-4 px-2">
        <span className="text-[18px]">{icon}</span>
        <p className="text-[12px] font-bold text-[#7c5c2d] dark:text-[#d4b47d] uppercase tracking-widest">{title}</p>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}
function ReviewCard({ index, question, children }) {
  return (
    <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-[24px] p-5 border border-[#dedfd4] dark:border-[#354237] shadow-xs">
      <p className="text-[15px] font-bold text-[#293d32] dark:text-[#ecece0] mb-4 leading-relaxed">
        <span className="inline-flex items-center justify-center w-6 h-6 mr-2 rounded-full bg-[#927140]/10 dark:bg-[#d4b47d]/15 text-[#7c5c2d] dark:text-[#d4b47d] text-[11px] font-bold border border-[#927140]/25 dark:border-[#d4b47d]/30">{index}</span>
        {question}
      </p>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}
function ReviewRow({ label, value, color, icon }) {
  return (
    <div className="flex items-start gap-3 text-[14px]">
      <span className={`font-black mt-[2px] flex-shrink-0 ${color}`}>{icon}</span>
      <span className="text-[#575e55] dark:text-[#b0b9ac] font-medium flex-shrink-0">{label}:</span>
      <span className={`font-bold ${color} flex-1 leading-relaxed`}>{value}</span>
    </div>
  );
}

// ====================== MAIN QUIZBOX =========================
export default function QuizBox({ handleExit, config, quizData }) {
  const { play } = useSound();
  const [showGuide, setShowGuide] = useState(() => {
    try {
      return localStorage.getItem("skipQuizGuide") !== "true";
    } catch {
      return true;
    }
  });
  const [isMidQuizGuide, setIsMidQuizGuide] = useState(false);
  const [isOpenExit, setIsOpenExit] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const [mcqScore, setMcqScore] = useState(0);
  const [essayScore, setEssayScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [userEssayAns, setUserEssayAns] = useState({});
  const [type, setType] = useState("mcq");

  const handleGuideConfirm = (skipNext) => {
    if (skipNext && !isMidQuizGuide) {
      try {
        localStorage.setItem("skipQuizGuide", "true");
      } catch (err) {
        console.warn("Không thể lưu trạng thái hướng dẫn:", err);
      }
    }
    setShowGuide(false);
    setIsMidQuizGuide(false);
  };

  const autoSubmit = useCallback(() => {
    if (type === "mcq") {
      setMcqScore(0);
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

  const mcq = useMemo(() => {
    if (attempt < 0) return [];
    return getRandomItems(quizData?.mcq || [], config?.mcqCount || 0);
  }, [quizData?.mcq, config?.mcqCount, attempt]);

  const essay = useMemo(() => {
    if (attempt < 0) return [];
    return getRandomItems(quizData?.essay || [], config?.essayCount || 0);
  }, [quizData?.essay, config?.essayCount, attempt]);

  if (!config) return null;

  if (mcq.length === 0 && essay.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 bg-[#faf8f3] dark:bg-[#151c18] text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#927140]/10 text-[#7c5c2d] dark:text-[#d4b47d] flex items-center justify-center text-2xl font-bold shadow-xs border border-[#927140]/25 dark:border-[#d4b47d]/30">
          📝
        </div>
        <h2 className="text-xl font-bold text-[#293d32] dark:text-[#ecece0] font-serif">
          Ngân hàng câu hỏi đang được cập nhật
        </h2>
        <p className="text-sm text-[#575e55] dark:text-[#b0b9ac] max-w-md leading-relaxed">
          Bộ đề này hiện đang trong giai đoạn chuẩn bị nội dung câu hỏi. Bạn vui lòng quay lại sau!
        </p>
        <button
          type="button"
          onClick={handleExit}
          className="mt-2 px-6 py-2.5 rounded-xl bg-[#314e3e] text-[#ffffff] hover:bg-[#273e31] dark:bg-[#d6b883] dark:text-[#19251d] dark:hover:bg-[#cbb07c] text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          Quay lại thư viện
        </button>
      </div>
    );
  }

  const phaseLabel = { mcq: "Trắc Nghiệm", essay: "Tự Luận", result: "Kết Quả" }[type];
  const phaseNum = { mcq: "I", essay: "II", result: null }[type];

  return (
    <div className="min-h-screen bg-[#faf8f3] dark:bg-[#151c18] transition-colors duration-500 relative font-sans">
      <div className="fixed inset-0 w-full h-screen bg-[linear-gradient(to_right,#293D3208_1px,transparent_1px),linear-gradient(to_bottom,#293D3208_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ECECE005_1px,transparent_1px),linear-gradient(to_bottom,#ECECE005_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />
      
      <AnimatePresence>
        {isOpenExit && <ExitButton handleExit={handleExit} handleClose={() => setIsOpenExit(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showGuide && (
          <GuideBox
            mode="quiz"
            isMidQuiz={isMidQuizGuide}
            onConfirm={handleGuideConfirm}
            skipStorageKey="skipQuizGuide"
          />
        )}
      </AnimatePresence>

      <div
        className="flex flex-col min-h-screen max-w-md mx-auto w-full px-4 sm:px-6 relative z-10"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 16px)",
          paddingBottom: "max(env(safe-area-inset-bottom), 24px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6 pt-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] sm:text-[22px] font-extrabold text-[#293d32] dark:text-[#ecece0] tracking-tight truncate leading-tight font-serif">
              {config.title}
            </h1>
            {phaseNum && (
              <p className="text-[11px] font-bold text-[#7c5c2d] dark:text-[#d4b47d] mt-1 tracking-widest uppercase">
                Phần {phaseNum} · {phaseLabel}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {type !== "result" && (
              <div className="flex items-center gap-1.5 bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-[#293d32] dark:text-[#ecece0] rounded-full pl-3 pr-3.5 py-1.5 shadow-xs">
                <span className="text-[13px] opacity-80">⏱</span>
                <QuizTimer
                  duration={config.time}
                  onTimeUp={autoSubmit}
                />
              </div>
            )}
            {type !== "result" && (
              <button
                onClick={() => {
                  setIsMidQuizGuide(true);
                  setShowGuide(true);
                }}
                aria-label="Hướng dẫn"
                className="w-10 h-10 rounded-full bg-[#927140]/10 dark:bg-[#d4b47d]/15 text-[#7c5c2d] dark:text-[#d4b47d] text-[15px] font-bold flex items-center justify-center shadow-xs border border-[#927140]/25 dark:border-[#d4b47d]/30 hover:bg-[#927140]/20 transition-colors active:scale-95 cursor-pointer"
              >
                ?
              </button>
            )}
            <button
              onClick={() => setIsOpenExit(true)}
              aria-label="Thoát"
              className="w-10 h-10 rounded-full bg-[#fffefa] dark:bg-[#1e2821] shadow-xs border border-[#dedfd4] dark:border-[#354237] flex items-center justify-center text-[#575e55] hover:text-red-600 dark:text-[#b0b9ac] dark:hover:text-red-400 active:scale-95 transition-all text-[14px] font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <Motion.div
              key={type}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: APPLE_EASE }}
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
                  mcq={mcq} userAnswers={userAnswers}
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
            </Motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}