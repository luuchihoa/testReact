import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle.jsx";
import { burstConfetti } from "../utils/dovuiUtils.js";

export default function ResultScreen({ score, total, totalPoints, maxStreak, history, onRetry, onExit, onOpenLeaderboard }) {
  const titleRef = useRef(null);
  const reviewRef = useRef(null);
  const [showReview, setShowReview] = useState(false);
  const [filter, setFilter] = useState("all");
  const reviewItems = history.filter((item) => filter === "all" || !item.isCorrect);
  const pct = total ? Math.round(score / total * 100) : 0;

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
    titleRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
    if (pct >= 60) burstConfetti();
  }, [pct]);

  useEffect(() => {
    if (showReview) reviewRef.current?.focus();
  }, [showReview]);

  return (
    <div className="dovui-shell dovui-result">
      <header className="dovui-header">
        <h1 ref={titleRef} tabIndex={-1}>Kết quả đố vui</h1>
        <ThemeToggle />
      </header>
      <section className="dovui-result-summary" aria-label="Kết quả lượt chơi">
        <p className="dovui-muted">Điểm trò chơi</p>
        <p className="dovui-result-points">{totalPoints.toLocaleString("vi-VN")}</p>
        <p className="dovui-result-message">{pct >= 80 ? "Rất tốt! Em đã trả lời đúng phần lớn câu hỏi." : "Mỗi câu hỏi là một cơ hội học thêm. Cùng xem lại đáp án nhé!"}</p>
        <dl className="dovui-result-stats">
          <div><dt>Số câu đúng</dt><dd>{score}/{total}</dd></div>
          <div><dt>Chuỗi đúng dài nhất</dt><dd>{maxStreak} câu</dd></div>
        </dl>
        {history.length < total && <p className="dovui-muted">Còn {total - history.length} câu chưa chơi.</p>}
        <div className="dovui-result-actions">
          <button type="button" className="dovui-button" onClick={onRetry}>Chơi lại ↺</button>
          <button type="button" className="dovui-button dovui-button--secondary" disabled={!history.length}
            aria-expanded={showReview} aria-controls="dovui-review" onClick={() => setShowReview(!showReview)}>{showReview ? "Thu gọn đáp án" : "Xem đáp án"}</button>
          <button type="button" className="dovui-button dovui-button--secondary" onClick={() => onOpenLeaderboard?.("all")}>Bảng xếp hạng</button>
        </div>
        <button type="button" className="dovui-text-button" onClick={onExit}>Thoát trò chơi</button>
      </section>
      <section id="dovui-review" hidden={!showReview} className="dovui-review">
        <h2 ref={reviewRef} tabIndex={-1}>Cùng xem lại đáp án</h2>
        <div className="dovui-review-filters">
          <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>Tất cả</button>
          <button type="button" aria-pressed={filter === "wrong"} onClick={() => setFilter("wrong")}>Cần ôn lại</button>
        </div>
        {!reviewItems.length && <p role="status">Không có câu hỏi trong nhóm này.</p>}
        {reviewItems.map((item) => (
          <article key={history.indexOf(item)} className="dovui-review-item">
            <p className="dovui-muted">Câu {history.indexOf(item) + 1} · {item.isCorrect ? "✓ Chính xác" : item.selectedKey == null ? "Chưa trả lời" : "Cần ôn lại"}</p>
            <h3>{item.question.text}</h3>
            <p>Em chọn: {item.selectedKey ? `${item.selectedKey}. ${item.question.choices[item.selectedKey]}` : "Chưa chọn đáp án"}</p>
            <p><strong>Đáp án đúng: {item.correctKey}. {item.question.choices[item.correctKey]}</strong></p>
            {item.question.explanation && <p>{item.question.explanation}</p>}
            {item.question.reference && <p className="dovui-muted">Tham khảo: {item.question.reference}</p>}
          </article>
        ))}
      </section>
    </div>
  );
}
