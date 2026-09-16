import { MotionConfig, useReducedMotion } from "framer-motion";
import { GuideBox, ExitButton } from "../components/ui/Feedback.jsx";
import useDoVuiLogic from "../features/dovui/hooks/useDoVuiLogic.js";
import DoVuiPlay from "../features/dovui/components/DoVuiPlay.jsx";
import ResultScreen from "../features/dovui/components/ResultScreen.jsx";
import LeaderboardModal from "../features/dovui/components/LeaderboardModal.jsx";
import { SKIP_GUIDE_KEY } from "../features/dovui/utils/dovuiUtils.js";
import "../features/dovui/DoVui.css";

export default function DoVui({ config = {}, quizData = [], handleExit: onExitToRoute }) {
  const game = useDoVuiLogic({ config, quizData, onExitToRoute });
  const reducedMotion = useReducedMotion();
  const {
    phase, showGuide, showExit, showLeaderboard, setShowExit, setShowLeaderboard,
    leaderboardPeriod, changeLeaderboardPeriod, leaderboardData, leaderboardLoading,
    handleGuideConfirm, confirmExit, score, quizQ, totalPoints, maxStreak, history,
    startQuiz, openLeaderboard,
  } = game;

  if (!Array.isArray(quizData) || quizData.length === 0) {
    return (
      <div className="dovui-page">
        <section className="dovui-shell dovui-empty">
          <h1>Bộ câu hỏi trống</h1>
          <p>Chưa có câu hỏi trong bộ đề này. Em hãy chọn bộ đố vui khác hoặc quay lại sau.</p>
          <button type="button" className="dovui-button" onClick={() => onExitToRoute?.()}>Quay lại</button>
        </section>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user" transition={reducedMotion ? { duration: 0 } : undefined}>
      <div className="dovui-page">
        {showGuide && <GuideBox mode="game" isMidQuiz={history.length > 0} onConfirm={handleGuideConfirm} skipStorageKey={SKIP_GUIDE_KEY} />}
        {showExit && <ExitButton handleExit={confirmExit} handleClose={() => setShowExit(false)} />}
        {showLeaderboard && (
          <LeaderboardModal leaderboard={leaderboardData} loading={leaderboardLoading}
            period={leaderboardPeriod} onPeriodChange={changeLeaderboardPeriod}
            onClose={() => setShowLeaderboard(false)} />
        )}
        {phase === "quiz" && <DoVuiPlay title={config.title} game={game} />}
        {phase === "result" && (
          <ResultScreen score={score} total={quizQ.length} totalPoints={totalPoints}
            maxStreak={maxStreak} history={history} onRetry={startQuiz}
            onExit={confirmExit} onOpenLeaderboard={openLeaderboard} />
        )}
      </div>
    </MotionConfig>
  );
}
