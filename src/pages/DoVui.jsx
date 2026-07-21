import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QuizTimerRing } from "../components/ui/Timer.jsx";
import { GuideBox, ExitButton } from "../components/ui/Feedback.jsx";
import useDoVuiLogic from "../features/dovui/hooks/useDoVuiLogic.js";
import ThemeToggle from "../features/dovui/components/ThemeToggle.jsx";
import OptionBtn from "../features/dovui/components/OptionBtn.jsx";
import StatPill from "../features/dovui/components/StatPill.jsx";
import ResultScreen from "../features/dovui/components/ResultScreen.jsx";
import LeaderboardModal from "../features/dovui/components/LeaderboardModal.jsx";
import { SKIP_GUIDE_KEY, APPLE_EASE } from "../features/dovui/utils/dovuiUtils.js";

export default function DoVui({ config = {}, quizData = [], handleExit: onExitToRoute }) {
  const {
    phase,
    showGuide,
    setShowGuide,
    showExit,
    setShowExit,
    showLeaderboard,
    setShowLeaderboard,
    leaderboardPeriod,
    changeLeaderboardPeriod,
    leaderboardData,
    leaderboardLoading,
    openLeaderboard,
    quizQ,
    current,
    score,
    totalPoints,
    streak,
    maxStreak,
    timerOn,
    setTimerOn,
    optStates,
    history,
    usedFiftyFifty,
    usedExtraTime,
    extraTimeCount,
    questionDuration,
    startQuiz,
    handleGuideConfirm,
    handleAnswer,
    handleTimeUp,
    handleFinalRush,
    handleHover,
    handleFiftyFifty,
    handleAddExtraTime,
    confirmExit,
    handleEarlyEnd,
  } = useDoVuiLogic({ config, quizData, onExitToRoute });

  const q = quizQ[current];
  const totalQ = quizQ.length;
  const answered = Object.keys(optStates).length > 0;

  /* ── 1. EMPTY STATE (Trạng thái Rỗng) ── */
  if (!Array.isArray(quizData) || quizData.length === 0) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-[#FDFBF7] dark:bg-[#1C1917]">
        <div className="fixed inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ease: APPLE_EASE, duration: 0.4 }}
          className="max-w-[360px] w-full p-8 rounded-[32px] bg-white/80 dark:bg-stone-900/80 backdrop-blur-2xl border border-amber-900/10 dark:border-amber-100/10 shadow-2xl flex flex-col items-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-4xl mb-4 shadow-inner ring-1 ring-amber-500/20">
            📚
          </div>
          <h3 className="text-[19px] font-black text-amber-950 dark:text-amber-50 m-0">
            Bộ câu hỏi trống
          </h3>
          <p className="text-[13.5px] text-stone-500 dark:text-stone-400 mt-2 mb-6 leading-relaxed">
            Chưa có câu hỏi nào trong bộ đề này. Vui lòng chọn bộ đố vui khác hoặc quay lại sau.
          </p>
          <button
            onClick={() => onExitToRoute?.()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-700 to-amber-900 dark:from-amber-600 dark:to-amber-500 text-white font-bold text-[14.5px] shadow-lg shadow-amber-900/20 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
          >
            Quay lại trang chủ
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] bg-[#FDFBF7] dark:bg-[#1C1917] text-stone-800 dark:text-stone-100 transition-colors duration-300 overflow-x-hidden select-none">
      {/* 🌟 Ambient Glow Backdrop */}
      <div className="fixed -top-32 -left-32 w-[420px] h-[420px] bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed -bottom-32 -right-32 w-[420px] h-[420px] bg-amber-700/10 dark:bg-amber-600/15 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Modals */}
      {showGuide && <GuideBox onConfirm={handleGuideConfirm} skipStorageKey={SKIP_GUIDE_KEY} />}
      {showExit && <ExitButton handleExit={confirmExit} handleClose={() => setShowExit(false)} />}
      <AnimatePresence>
        {showLeaderboard && (
          <LeaderboardModal
            leaderboard={leaderboardData}
            loading={leaderboardLoading}
            period={leaderboardPeriod}
            onPeriodChange={changeLeaderboardPeriod}
            onClose={() => setShowLeaderboard(false)}
          />
        )}
      </AnimatePresence>

      {/* ══════════════ QUIZ PHASE ══════════════ */}
      {phase === "quiz" && q && (
        <div className="relative z-10 flex flex-col min-h-[100dvh] max-w-[480px] mx-auto px-4 pt-[max(env(safe-area-inset-top),12px)] pb-[max(env(safe-area-inset-bottom),16px)]">
          
          {/* ── 1. UNIFIED TOP HEADER BAR (Compact Gaming HUD) ── */}
          <header className="sticky top-0 z-30 mb-3 pt-1 pb-2 bg-[#FDFBF7]/85 dark:bg-[#1C1917]/85 backdrop-blur-xl border-b border-amber-900/10 dark:border-amber-100/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowExit(true)}
                aria-label="Thoát"
                className="w-9 h-9 rounded-xl bg-white/80 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 flex items-center justify-center text-stone-600 dark:text-stone-300 shadow-xs hover:bg-stone-100 dark:hover:bg-stone-700 active:scale-90 transition-all cursor-pointer"
                title="Thoát bài thi"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>

              <button
                onClick={() => openLeaderboard("all")}
                className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs hover:bg-amber-500/20 active:scale-90 transition-all cursor-pointer"
                title="Xem Bảng Xếp Hạng"
              >
                🏆
              </button>
            </div>

            <div className="flex-1 min-w-0 text-center px-1">
              <h1 className="text-[15px] font-black font-serif text-amber-950 dark:text-amber-50 m-0 truncate tracking-tight">
                {config.title || "ĐỐ VUI GIÁO LÝ"}
              </h1>
            </div>

            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <StatPill label="điểm" value={(totalPoints || score * 100).toLocaleString()} accent />
            </div>
          </header>

          {/* ── 2. PROGRESS & POWER-UPS ACTION ROW ── */}
          <div className="space-y-2.5 mb-3.5">
            {/* Progress Segment Bar */}
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-1.5 text-[12px] font-black text-amber-900 dark:text-amber-200 font-mono">
                <span>CÂU {current + 1}</span>
                <span className="opacity-40">/</span>
                <span className="opacity-60">{totalQ}</span>
              </div>

              {/* Streak Combo Indicator */}
              {streak >= 2 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[11px] shadow-sm animate-pulse"
                >
                  🔥 Combo x{streak}!
                </motion.div>
              )}
            </div>

            {/* Segmented Progress Line */}
            <div className="flex gap-1">
              {Array.from({ length: totalQ }).map((_, i) => {
                const isDone = i < current;
                const isCurrent = i === current;
                return (
                  <div key={i} className="flex-1 h-1.5 rounded-full bg-stone-200/80 dark:bg-stone-800/80 overflow-hidden relative">
                    <motion.div
                      className={`absolute inset-0 rounded-full ${
                        isCurrent
                          ? "bg-amber-500 shadow-sm ring-1 ring-amber-300"
                          : isDone
                          ? "bg-amber-700 dark:bg-amber-500"
                          : "bg-transparent"
                      }`}
                      initial={{ width: isDone || isCurrent ? "100%" : "0%" }}
                      animate={{ width: isDone || isCurrent ? "100%" : "0%" }}
                      transition={{ duration: 0.3, ease: APPLE_EASE }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Power-up Assistance Bar */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                {/* 50:50 Powerup */}
                <button
                  onClick={handleFiftyFifty}
                  disabled={usedFiftyFifty || answered}
                  className={`px-3 py-1.5 rounded-xl text-[12px] font-black border flex items-center gap-1.5 transition-all cursor-pointer ${
                    usedFiftyFifty
                      ? "bg-stone-100 dark:bg-stone-800/40 text-stone-400 dark:text-stone-600 border-stone-200 dark:border-stone-800 opacity-50 cursor-not-allowed"
                      : "bg-purple-500/10 dark:bg-purple-900/30 text-purple-900 dark:text-purple-200 border-purple-300/60 dark:border-purple-700/50 hover:bg-purple-500/20 active:scale-95 shadow-xs"
                  }`}
                  title="Loại bỏ 2 đáp án sai"
                >
                  <span>🪄 50:50</span>
                  <span className={`text-[9.5px] px-1.5 py-0.2 rounded-md ${usedFiftyFifty ? "bg-stone-200 dark:bg-stone-800" : "bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100"}`}>
                    {usedFiftyFifty ? "0" : "1"}
                  </span>
                </button>

                {/* +10s Extra Time */}
                <button
                  onClick={handleAddExtraTime}
                  disabled={usedExtraTime || answered}
                  className={`px-3 py-1.5 rounded-xl text-[12px] font-black border flex items-center gap-1.5 transition-all cursor-pointer ${
                    usedExtraTime
                      ? "bg-stone-100 dark:bg-stone-800/40 text-stone-400 dark:text-stone-600 border-stone-200 dark:border-stone-800 opacity-50 cursor-not-allowed"
                      : "bg-blue-500/10 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 border-blue-300/60 dark:border-blue-700/50 hover:bg-blue-500/20 active:scale-95 shadow-xs"
                  }`}
                  title="Cộng thêm 10 giây suy nghĩ"
                >
                  <span>⏱️ +10s</span>
                  <span className={`text-[9.5px] px-1.5 py-0.2 rounded-md ${usedExtraTime ? "bg-stone-200 dark:bg-stone-800" : "bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100"}`}>
                    {usedExtraTime ? "0" : "1"}
                  </span>
                </button>
              </div>

              {/* Desktop Shortcut Indicator */}
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-stone-600 dark:text-stone-400 font-medium">
                <span>Phím</span>
                <kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 font-mono text-[10px] font-bold">1-4</kbd>
              </div>
            </div>
          </div>

          {/* ── 3. QUESTION CARD WITH INTEGRATED TIMER ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: APPLE_EASE }}
              className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-2xl rounded-[28px] p-5 border border-amber-900/10 dark:border-amber-100/10 shadow-xl shadow-amber-950/5 mb-4 relative overflow-hidden"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />

              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 text-[11px] font-black uppercase tracking-wider">
                  Câu hỏi #{current + 1}
                </span>

                {/* Integrated Timer Ring */}
                <div className="flex-shrink-0 -mt-1">
                  <QuizTimerRing
                    duration={questionDuration}
                    running={timerOn && !showGuide}
                    resetKey={`${current}-${extraTimeCount}`}
                    onTimeUp={handleTimeUp}
                    onFinalRush={handleFinalRush}
                  />
                </div>
              </div>

              <p className="text-[17px] font-extrabold text-amber-950 dark:text-amber-50 leading-relaxed m-0 pt-1">
                {q.text}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* ── 4. OPTION BUTTONS ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
              className="flex flex-col gap-2.5 mb-4"
            >
              {Object.entries(q.choices).map(([letter, text]) => (
                <motion.div
                  key={letter}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: APPLE_EASE } },
                  }}
                >
                  <OptionBtn
                    letter={letter}
                    text={text}
                    state={optStates[letter] ?? "idle"}
                    onClick={(rect) => handleAnswer(letter, rect)}
                    onHover={handleHover}
                    disabled={!!optStates[letter]}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* ── 5. BOTTOM UTILITY ACTIONS ── */}
          <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-amber-900/5 dark:border-amber-100/5">
            <button
              onClick={() => handleAnswer(null)}
              disabled={answered}
              className={`flex-1 py-2.5 px-4 rounded-xl bg-white/60 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800/80 text-stone-600 dark:text-stone-300 text-[13px] font-bold transition-all ${
                answered ? "opacity-0 pointer-events-none" : "hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-98 cursor-pointer"
              }`}
            >
              Bỏ qua câu này <span className="text-[11px] opacity-60">(Space)</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleEarlyEnd}
                className="px-3.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-[12.5px] font-bold hover:bg-red-100/70 active:scale-95 transition-all cursor-pointer"
                title="Dừng bài thi sớm"
              >
                Kết thúc
              </button>

              <button
                onClick={() => {
                  setTimerOn(false);
                  setShowGuide(true);
                }}
                className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-800 dark:text-amber-200 font-bold text-[15px] flex items-center justify-center hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer"
                title="Hướng dẫn & Luật chơi"
              >
                ?
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ══════════════ RESULT PHASE ══════════════ */}
      {phase === "result" && (
        <ResultScreen
          score={score}
          total={totalQ}
          totalPoints={totalPoints}
          maxStreak={maxStreak}
          history={history}
          onRetry={startQuiz}
          onExit={confirmExit}
          onOpenLeaderboard={openLeaderboard}
          leaderboardPeriod={leaderboardPeriod}
          onLeaderboardPeriodChange={changeLeaderboardPeriod}
          leaderboardData={leaderboardData}
          leaderboardLoading={leaderboardLoading}
          showLeaderboard={showLeaderboard}
          onCloseLeaderboard={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}