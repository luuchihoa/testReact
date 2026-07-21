import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle.jsx";
import ReviewModal from "./ReviewModal.jsx";
import LeaderboardModal from "./LeaderboardModal.jsx";
import { APPLE_EASE, burstConfetti } from "../utils/dovuiUtils.js";

const ResultScreen = memo(({
  score,
  total,
  totalPoints,
  maxStreak,
  history,
  onRetry,
  onExit,
  onOpenLeaderboard,
  leaderboardPeriod,
  onLeaderboardPeriodChange,
  leaderboardData,
  leaderboardLoading,
  showLeaderboard,
  onCloseLeaderboard,
}) => {
  const [showReview, setShowReview] = useState(false);
  const display = total ? ((score / total) * 10).toFixed(1) : "0.0";
  const pct = total ? Math.round((score / total) * 100) : 0;
  const wrong = total - score;

  useEffect(() => {
    if (pct >= 60) {
      burstConfetti();
    }
  }, [pct]);

  const grade =
    pct >= 80
      ? { label: "Xuất sắc! 🎉", sub: "Bạn thật tuyệt vời, kiến thức Giáo lý rất vững chắc!", color: "text-emerald-500", stroke: "#10b981", bg: "bg-emerald-50 dark:bg-emerald-900/20" }
      : pct >= 60
      ? { label: "Tốt lắm! 👍", sub: "Tiếp tục phát huy nhé bạn!", color: "text-blue-500", stroke: "#3b82f6", bg: "bg-blue-50 dark:bg-blue-900/20" }
      : pct >= 40
      ? { label: "Khá ổn 😊", sub: "Hãy ôn lại một chút kiến thức nhé!", color: "text-amber-500", stroke: "#f59e0b", bg: "bg-amber-50 dark:bg-amber-900/20" }
      : { label: "Cần cố gắng 💪", sub: "Đừng bỏ cuộc, hãy làm lại lần nữa!", color: "text-red-500", stroke: "#ef4444", bg: "bg-red-50 dark:bg-red-900/20" };

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

      <AnimatePresence>
        {showReview && <ReviewModal history={history} onClose={() => setShowReview(false)} />}
        {showLeaderboard && (
          <LeaderboardModal
            leaderboard={leaderboardData}
            loading={leaderboardLoading}
            period={leaderboardPeriod}
            onPeriodChange={onLeaderboardPeriodChange}
            onClose={onCloseLeaderboard}
          />
        )}
      </AnimatePresence>

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
            transition={{ duration: 1.2, delay: 0.3, ease: APPLE_EASE }}
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

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, ease: APPLE_EASE }} className="text-center max-w-[340px]">
        <div className={`inline-block px-5 py-2 rounded-full text-[14px] font-bold mb-2 shadow-sm ${grade.bg} ${grade.color}`}>
          {grade.label}
        </div>
        <p className="text-[14.5px] font-medium text-stone-500 dark:text-stone-400 m-0 leading-relaxed">{grade.sub}</p>
      </motion.div>

      {/* Points & Stats Grid */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, ease: APPLE_EASE }} className="grid grid-cols-3 gap-3 w-full max-w-[360px]">
        {[
          { label: "Tổng điểm", value: `${(totalPoints || score * 100).toLocaleString()} pts`, accent: true },
          { label: "Số câu đúng", value: `${score}/${total}`, accent: false },
          { label: "Streak Max", value: `🔥 ${maxStreak}`, accent: false },
        ].map((item) => (
          <div key={item.label} className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-md rounded-2xl border border-amber-900/10 dark:border-amber-100/10 p-3 text-center shadow-sm">
            <div className={`text-[18px] font-extrabold font-serif ${item.accent ? "text-amber-600 dark:text-amber-400" : "text-amber-950 dark:text-amber-50"}`}>
              {item.value}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mt-1">
              {item.label}
            </div>
          </div>
        ))}
      </motion.div>

      <div className="flex flex-col gap-3 w-full max-w-[360px] mt-2">
        <motion.button
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52, ease: APPLE_EASE }}
          onClick={() => onOpenLeaderboard?.("all")} whileTap={{ scale: 0.97 }}
          className="w-full p-3.5 rounded-xl bg-amber-500 text-white font-bold text-[14.5px] shadow-sm hover:bg-amber-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>🏆</span> Xem Bảng Xếp Hạng
        </motion.button>

        {history.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, ease: APPLE_EASE }}
            onClick={() => setShowReview(true)} whileTap={{ scale: 0.97 }}
            className="w-full p-3.5 rounded-xl bg-amber-100/80 dark:bg-amber-900/30 border border-amber-300/60 dark:border-amber-700/40 text-amber-900 dark:text-amber-200 text-[14.5px] font-bold shadow-sm hover:bg-amber-200/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>📖</span> Xem Chi Tiết Đáp Án
          </motion.button>
        )}

        <motion.button
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, ease: APPLE_EASE }}
          onClick={onRetry} whileTap={{ scale: 0.97 }}
          className="w-full p-4 rounded-xl bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white text-[15px] font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
        >
          Làm lại bài ↺
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, ease: APPLE_EASE }}
          onClick={onExit} whileTap={{ scale: 0.97 }}
          className="w-full p-3.5 rounded-xl bg-stone-200/80 dark:bg-stone-800/80 border border-stone-300/60 dark:border-stone-700/50 text-stone-700 dark:text-stone-300 font-bold text-[14.5px] shadow-xs hover:bg-stone-300 dark:hover:bg-stone-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>🚪</span> Thoát trò chơi
        </motion.button>
      </div>
    </motion.div>
  );
});

export default ResultScreen;
