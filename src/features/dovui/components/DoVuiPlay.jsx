import { useEffect, useRef } from "react";
import DoVuiTimer from "./DoVuiTimer.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import OptionBtn from "./OptionBtn.jsx";

export default function DoVuiPlay({ title, game }) {
  const {
    quizQ, current, totalPoints, streak, optStates, history, timerOn,
    questionDuration, usedFiftyFifty, usedExtraTime,
    showGuide, showExit, showLeaderboard, setShowExit, setShowGuide, setTimerOn,
    handleAnswer, handleTimeUp, handleFinalRush, handleHover,
    handleFiftyFifty, handleAddExtraTime, handleEarlyEnd,
  } = game;
  const q = quizQ[current];
  const answered = Object.values(optStates).some((state) => state === "correct" || state === "wrong");
  const latest = answered ? history[history.length - 1] : null;
  const questionRef = useRef(null);
  const endRef = useRef(null);
  const scrollStyleRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) {
      questionRef.current?.focus({ preventScroll: true });
      questionRef.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
    }
    initializedRef.current = true;
  }, [current]);

  const unlockScroll = () => {
    if (scrollStyleRef.current !== null) {
      document.body.style.overflow = scrollStyleRef.current;
      scrollStyleRef.current = null;
    }
  };
  useEffect(() => () => {
    if (scrollStyleRef.current !== null) document.body.style.overflow = scrollStyleRef.current;
  }, []);

  const promptEnd = () => {
    setTimerOn(false);
    scrollStyleRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    endRef.current?.showModal();
  };
  const closeEnd = () => {
    unlockScroll();
    if (endRef.current?.returnValue !== "finish") setTimerOn(!answered);
  };

  if (!q) return null;

  return (
    <div className="dovui-shell">
      <header className="dovui-header">
        <div>
          <p className="dovui-eyebrow">Cùng học, cùng khám phá</p>
          <h1>{title || "Đố vui giáo lý"}</h1>
        </div>
        <button type="button" className="dovui-icon-button" aria-label="Thoát trò chơi" disabled={answered} onClick={() => setShowExit(true)}>✕</button>
      </header>

      <div className="dovui-tools" aria-label="Tiện ích trò chơi">
        <button type="button" disabled={answered} onClick={() => { setTimerOn(false); setShowGuide(true); }}>Hướng dẫn</button>
        <ThemeToggle />
        <button type="button" className="dovui-end" disabled={answered} onClick={promptEnd}>Kết thúc lượt chơi</button>
      </div>

      <section className="dovui-status" aria-label="Tiến độ và thời gian">
        <div className="dovui-status-row">
          <div className="dovui-status-info">
            <strong>Câu {current + 1}/{quizQ.length}</strong>
            <span>{totalPoints.toLocaleString("vi-VN")} điểm</span>
            {streak >= 2 && <span className="dovui-streak">✓ {streak} câu đúng liên tiếp</span>}
          </div>
          <div className="dovui-time">
            <span>Còn lại</span>
            <DoVuiTimer
              key={current}
              duration={questionDuration}
              running={timerOn && !showGuide && !showExit && !showLeaderboard}
              onTimeUp={handleTimeUp}
              onFinalRush={handleFinalRush}
            />
          </div>
        </div>
        <progress max={quizQ.length} value={current + (answered ? 1 : 0)} aria-label="Số câu đã hoàn thành" />
      </section>

      <section className="dovui-question" aria-labelledby="dovui-question-title">
        <p className="dovui-muted">Chọn một đáp án</p>
        <h2 id="dovui-question-title" ref={questionRef} tabIndex={-1}>{q.text}</h2>
        <div className="dovui-options">
          {Object.entries(q.choices).map(([letter, text]) => (
            <OptionBtn key={letter} letter={letter} text={text}
              state={optStates[letter] ?? "idle"}
              disabled={answered || !!optStates[letter]}
              onClick={(rect) => handleAnswer(letter, rect)} onHover={handleHover} />
          ))}
        </div>
        <div className="dovui-feedback" role="status" aria-live="polite" aria-atomic="true">
          {latest ? (
            <>
              <strong>{latest.isCorrect ? "✓ Chính xác!" : latest.selectedKey == null ? "Đã bỏ qua hoặc hết giờ." : "Chưa chính xác."}</strong>
              {!latest.isCorrect && <span>Đáp án đúng: {latest.correctKey}.</span>}
              <span className="dovui-muted">Đang chuyển sang {current === quizQ.length - 1 ? "kết quả" : "câu tiếp theo"}…</span>
            </>
          ) : <span className="dovui-muted">{usedFiftyFifty && Object.values(optStates).includes("dim") ? "Đã loại hai đáp án. Em hãy chọn trong các đáp án còn lại." : "Đáp án sẽ được ghi nhận ngay khi em chọn."}</span>}
        </div>
      </section>

      <section className="dovui-assistance" aria-label="Trợ giúp">
        <button type="button" disabled={usedFiftyFifty || answered} onClick={handleFiftyFifty}>
          <strong>50:50</strong><span>{usedFiftyFifty ? "Đã dùng" : "Còn 1 lượt"}</span>
        </button>
        <button type="button" disabled={usedExtraTime || answered} onClick={handleAddExtraTime}>
          <strong>+10 giây</strong><span>{usedExtraTime ? "Đã dùng" : "Còn 1 lượt"}</span>
        </button>
      </section>
      <div className="dovui-bottom">
        <button type="button" className="dovui-button dovui-button--secondary" disabled={answered} onClick={() => handleAnswer(null)}>Bỏ qua câu này →</button>
        <p className="dovui-keyboard">Phím 1–4 chọn đáp án · Space bỏ qua</p>
      </div>

      <dialog ref={endRef} className="dovui-end-dialog" aria-labelledby="dovui-end-title" onClose={closeEnd}>
        <h2 id="dovui-end-title">Kết thúc lượt chơi?</h2>
        <p>Em đã hoàn thành {history.length}/{quizQ.length} câu. Các câu chưa làm sẽ không được tính điểm.</p>
        <div className="dovui-dialog-actions">
          <button type="button" className="dovui-button" autoFocus onClick={() => endRef.current?.close()}>Tiếp tục chơi</button>
          <button type="button" className="dovui-button dovui-button--secondary" onClick={() => { endRef.current?.close("finish"); unlockScroll(); handleEarlyEnd(); }}>Kết thúc và xem kết quả</button>
        </div>
      </dialog>
    </div>
  );
}
