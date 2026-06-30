import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuizTimer from "./ui/Timer.jsx";
import useSound from "./sound/useSounds.js";
import { GuideBox, ExitButton } from "./ui/Feedback.jsx";

// ====================== UTILITIES =========================
function getRandomItems(arr, n) {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
}

// Subtle confetti burst — no DOM pollution, CSS-only particles via portal
function burstConfetti(x, y) {
  const colors = ["#FF6B35", "#007AFF", "#34C759", "#FFD60A", "#FF375F", "#AF52DE"];
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
    setTimeout(() => el.remove(), 600);
  });
}

// ====================== OPTION BUTTON =========================
function OptionButton({ label, text, state, onClick, onMouseEnter, disabled }) {
  // state: 'idle' | 'correct' | 'wrong' | 'reveal'
  const base =
    "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left text-[15px] font-medium transition-all duration-200 select-none";
  const variants = {
    idle: "bg-white border border-[#E5E5EA] text-gray-800 active:scale-[0.98] active:bg-[#F2F2F7]",
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

  return (
    <motion.button
      className={`${base} ${variants[state]}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      disabled={disabled}
      whileTap={state === "idle" ? { scale: 0.97 } : {}}
      animate={state === "wrong" ? { x: [0, -8, 8, -6, 6, -4, 4, 0] } : {}}
      transition={state === "wrong" ? { duration: 0.35, ease: "easeInOut" } : {}}
    >
      <span
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border ${circleVariants[state]}`}
      >
        {label}
      </span>
      <span className="flex-1 leading-snug">{text}</span>
    </motion.button>
  );
}

// ====================== MCQ COMPONENT =========================
function Mcq({ setMcqScore, mcq, setType, config, setUserAnswers }) {
  const [submitted, setSubmitted] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const scoreRef = useRef(0);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const { play } = useSound();
  const isMobile = useMemo(() => /Android|iPhone|iPad/i.test(navigator.userAgent), []);

  const q = mcq?.[current];
  const totalQ = mcq?.length || 0;
  const progress = ((current) / totalQ) * 100;

  const handleAnswer = useCallback(
    (e, key = "Không trả lời") => {
      if (submitted || !q) return;
      setSelectedKey(key);
      setUserAnswers((prev) => [
        ...prev,
        { question: q.text, selected: key, correct: q.correct },
      ]);

      const isCorrect = key === q.correct;
      const isSkip = key === "Không trả lời";

      if (isSkip) play("select");
      else if (isCorrect) {
        play("correct");
        scoreRef.current += 1;
        const rect = e.currentTarget.getBoundingClientRect();
        burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
      } else {
        play("wrong");
      }

      setSubmitted(true);

      setTimeout(() => {
        setDirection(1);
        setSubmitted(false);
        setSelectedKey(null);
        if (current === mcq.length - 1) {
          setMcqScore(((scoreRef.current * config.mcqPoint) / mcq.length).toFixed(2));
          setType("essay");
        } else {
          setCurrent((prev) => prev + 1);
        }
      }, 900);
    },
    [submitted, q, current, mcq, play, config, setMcqScore, setType, setUserAnswers]
  );

  if (!q) return <p className="text-center text-gray-400">Không có câu hỏi</p>;

  const getOptionState = (k) => {
    if (!submitted) return "idle";
    if (k === q.correct) return "correct";
    if (k === selectedKey) return "wrong";
    return "idle";
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[13px] text-gray-400 font-medium px-0.5">
          <span>Câu {current + 1} / {totalQ}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-[#E5E5EA] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#FF6B35] rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          initial={{ x: direction * 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction * -40, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          className="bg-white rounded-3xl p-5 shadow-sm border border-[#F0F0F0]"
        >
          <h2 className="text-[17px] font-semibold text-gray-900 leading-snug">
            {q.text}
          </h2>
        </motion.div>
      </AnimatePresence>

      {/* Options */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
          }}
          className="flex flex-col gap-2.5"
        >
          {Object.entries(q.choices || {}).map(([k, v]) => (
            <motion.div
              key={k}
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } },
              }}
            >
              <OptionButton
                label={k}
                text={v}
                state={getOptionState(k)}
                onClick={(e) => handleAnswer(e, k)}
                onMouseEnter={() => !isMobile && !submitted && play("hover")}
                disabled={submitted}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Skip button */}
      <motion.button
        onClick={(e) => handleAnswer(e)}
        disabled={submitted}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3.5 rounded-2xl text-[15px] font-semibold text-gray-500 bg-[#F2F2F7] disabled:opacity-40 transition-colors hover:bg-[#E5E5EA] active:bg-[#D1D1D6]"
      >
        Bỏ qua →
      </motion.button>
    </div>
  );
}

// ====================== ESSAY COMPONENT =========================
function Essay({ essay, setType, setEssayScore, config, setUserEssayAns }) {
  const { play } = useSound();
  const ansRefs = useRef({});
  const essayRef = useRef(0);

  const checkEssay = () => {
    play("win");
    essay.forEach((q, i) => {
      const ans = ansRefs.current[`essay${i}`]?.value.toLowerCase() || "Không trả lời";
      setUserEssayAns((prev) => ({ ...prev, [`essay${i}`]: ans }));
      let score = 0;
      (q.keywords || []).forEach((item) => {
        const keyLower = (item.word || []).map((w) => w.toLowerCase());
        if (keyLower.every((w) => ans.includes(w)))
          score += config.essayPoint / (config.essayCount || 1) / (q.keywords.length || 1);
      });
      essayRef.current += score;
    });
    setEssayScore(essayRef.current.toFixed(2));
    setType("result");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col gap-4"
    >
      {essay.map((q, i) => (
        <div key={i} className="bg-white rounded-3xl p-5 border border-[#F0F0F0] shadow-sm">
          <h3 className="text-[16px] font-semibold text-gray-900 leading-snug mb-3">Câu {i + 1}: {q.text}</h3>
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
        className="w-full py-4 rounded-2xl text-[16px] font-bold text-white bg-[#007AFF] shadow-sm hover:bg-[#0071EB] active:bg-[#006ADE] transition-colors"
      >
        Nộp bài
      </motion.button>
    </motion.div>
  );
}

// ====================== RESULT COMPONENT =========================
function Result({ mcq, essay, mcqScore, essayScore, userAnswers, handleReset, userEssayAns }) {
  const total = (parseFloat(essayScore) + parseFloat(mcqScore)).toFixed(2);
  const pct = Math.round((parseFloat(total) / 10) * 100);

  async function sendData(username = "anonymous", value = 0) {
    const API_URL =
      "https://script.google.com/macros/s/AKfycbxi7H5MhkxM478EnIX-shg1NMxg4ljIyCcokmODv55zBnNLyTBtkKTGG-brJcSmf5Q/exec";
    try {
      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ user: username, value }),
      });
    } catch {}
  }

  useEffect(() => {
    try { sendData(localStorage.username, total); } catch {}
  }, []);

  const grade = parseFloat(total) >= 8 ? { label: "Xuất sắc 🎉", color: "text-[#34C759]" }
    : parseFloat(total) >= 6 ? { label: "Tốt 👍", color: "text-[#007AFF]" }
    : parseFloat(total) >= 4 ? { label: "Cần cố gắng 📚", color: "text-[#FF9500]" }
    : { label: "Cần ôn thêm 💪", color: "text-[#FF375F]" };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-5"
    >
      {/* Score card */}
      <div className="bg-white rounded-3xl p-6 border border-[#F0F0F0] shadow-sm text-center">
        <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Kết quả</p>

        {/* Circular score indicator */}
        <div className="relative mx-auto w-28 h-28 mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#F2F2F7" strokeWidth="8" />
            <motion.circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="#FF6B35"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - pct / 100) }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{total}</span>
            <span className="text-xs text-gray-400 font-medium">/10</span>
          </div>
        </div>

        <p className={`text-lg font-bold ${grade.color}`}>{grade.label}</p>

        <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500">
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900">{mcqScore}</p>
            <p className="text-[12px]">Trắc nghiệm</p>
          </div>
          <div className="w-px bg-[#E5E5EA]" />
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900">{essayScore}</p>
            <p className="text-[12px]">Tự luận</p>
          </div>
        </div>
      </div>

      {/* MCQ Review */}
      <Section title="Xem lại trắc nghiệm">
        {(mcq || []).map((q, i) => {
          const ua = userAnswers[i];
          const sel = ua?.selected;
          const isCorrect = sel === q.correct;
          const isSkip = sel === "Không trả lời" || !sel;
          const selText = isSkip ? "Không trả lời" : q.choices[sel];
          const correctText = q.choices[q.correct];
          return (
            <ReviewCard key={i} index={i + 1} question={q.text}>
              <ReviewRow
                label="Bạn chọn"
                value={selText}
                color={isCorrect ? "text-[#34C759]" : isSkip ? "text-gray-400" : "text-[#FF375F]"}
                icon={isCorrect ? "✓" : isSkip ? "–" : "✗"}
              />
              {!isCorrect && (
                <ReviewRow label="Đáp án đúng" value={correctText} color="text-[#34C759]" icon="✓" />
              )}
            </ReviewCard>
          );
        })}
      </Section>

      {/* Essay Review */}
      <Section title="Xem lại tự luận">
        {(essay || []).map((q, i) => {
          const ans = userEssayAns[`essay${i}`];
          return (
            <ReviewCard key={i} index={i + 1} question={q.text}>
              {q.sample && (
                <div className="mb-2">
                  <p className="text-[12px] font-semibold text-[#007AFF] mb-1">Gợi ý:</p>
                  <p className="text-[13px] text-[#34C759] leading-relaxed whitespace-pre-line">{q.sample}</p>
                </div>
              )}
              <div>
                <p className="text-[12px] font-semibold text-gray-400 mb-1">Câu trả lời của bạn:</p>
                <p className="text-[13px] text-gray-700 leading-relaxed">{ans || "—"}</p>
              </div>
            </ReviewCard>
          );
        })}
      </Section>

      <motion.button
        onClick={handleReset}
        whileTap={{ scale: 0.97 }}
        className="w-full py-4 rounded-2xl text-[15px] font-semibold text-gray-600 bg-[#F2F2F7] hover:bg-[#E5E5EA] transition-colors"
      >
        Làm lại từ đầu
      </motion.button>
    </motion.div>
  );
}

// Small helper components for Result
function Section({ title, children }) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">{title}</p>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}
function ReviewCard({ index, question, children }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#F0F0F0] shadow-sm">
      <p className="text-[14px] font-semibold text-gray-800 mb-3">
        <span className="text-[#FF6B35] mr-1">{index}.</span>{question}
      </p>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}
function ReviewRow({ label, value, color, icon }) {
  return (
    <div className="flex items-start gap-2 text-[13px]">
      <span className={`font-bold mt-0.5 ${color}`}>{icon}</span>
      <span className="text-gray-400 shrink-0">{label}:</span>
      <span className={`font-medium ${color} flex-1`}>{value}</span>
    </div>
  );
}

// ====================== MAIN QUIZBOX (full-screen, kiểu DoVui) =========================
export default function QuizBox({ handleExit, config, quizData }) {
  const { play } = useSound();
  const [showGuide, setShowGuide] = useState(false);
  const [isOpenExit, setIsOpenExit] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attempt, setAttempt] = useState(0); // tăng mỗi lần "Làm lại" để random lại câu hỏi

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

  const autoSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    play("select");
    setAttempt((a) => a + 1);
    setType("mcq");
    setSubmitted(false);
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

  const showMap = { mcq: Mcq, essay: Essay, result: Result };
  const ShowContent = showMap[type];
  const sectionLabel = { mcq: "Trắc Nghiệm", essay: "Tự Luận" }[type];

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
          paddingBottom: "max(env(safe-area-inset-bottom), 16px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3 pt-1">
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-extrabold text-[#FF6B35] tracking-tight truncate">
              {config.title}
            </h1>
            {sectionLabel && (
              <p className="text-[13px] font-medium text-gray-400 mt-0.5 truncate">
                Phần {type === "mcq" ? "I" : "II"}: {sectionLabel}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {type !== "result" && (
              <div className="flex items-center gap-1 bg-white border border-[#F0F0F0] rounded-full pl-2.5 pr-3 py-1.5 shadow-sm">
                <span className="text-[12px]">⏱</span>
                <QuizTimer
                  duration={config.time}
                  onTimeUp={autoSubmit}
                  className="text-[13px] font-bold text-[#FF375F] tabular-nums tracking-wide"
                />
              </div>
            )}
            {type !== "result" && (
              <button
                onClick={() => setShowGuide(true)}
                aria-label="Hướng dẫn"
                className="w-10 h-10 rounded-full bg-[#FF6B35] text-white text-[15px] font-bold flex items-center justify-center shadow-sm hover:bg-[#E85E28] transition-colors active:scale-95"
              >
                ?
              </button>
            )}
            <button
              onClick={() => setIsOpenExit(true)}
              aria-label="Thoát"
              className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#F0F0F0] flex items-center justify-center text-gray-400 active:scale-95 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <ShowContent
            handleReset={handleReset}
            setType={setType}
            mcq={mcq}
            essay={essay}
            setMcqScore={setMcqScore}
            setEssayScore={setEssayScore}
            mcqScore={mcqScore}
            essayScore={essayScore}
            autoSubmit={autoSubmit}
            submitted={submitted}
            config={config}
            setUserAnswers={setUserAnswers}
            userAnswers={userAnswers}
            setUserEssayAns={setUserEssayAns}
            userEssayAns={userEssayAns}
          />
        </div>

        {/* Designer credit */}
        <p className="text-center text-[11px] text-[#C7C7CC] font-medium tracking-wide py-4">
          Design by Khối Phụng Vụ Gx An Ngãi
        </p>
      </div>
    </div>
  );
}