import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { QuizTimer, formatTime } from "../ui/Timer.jsx";
import useSound from "../../features/sound/useSounds.js";
import { GuideBox, ExitButton, SubmitConfirmBox } from "../ui/Feedback.jsx";

// Hằng số Easing chuẩn hệ thống
const APPLE_EASE = [0.16, 1, 0.3, 1];

// ====================== UTILITIES =========================
function getRandomItems(arr, n) {
  if (!arr || arr.length === 0) return [];
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
}

function burstConfetti(x, y) {
  const colors = ["#314e3e", "#927140", "#d4b47d", "#10b981", "#d6b883", "#22c55e"];
  const els = [];
  Array.from({ length: 18 }).forEach((_, i) => {
    const el = document.createElement("span");
    const angle = (Math.PI * 2 * i) / 18;
    const r = 80 + Math.random() * 60;
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
      { duration: 700, easing: "cubic-bezier(0.16,1,0.3,1)", fill: "forwards" }
    );
  });

  const t = setTimeout(() => els.forEach((el) => el.remove()), 750);
  return () => {
    clearTimeout(t);
    els.forEach((el) => el.remove());
  };
}

// ====================== OPTION BUTTON =========================
function OptionButton({ label, text, selected, onClick, disabled }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-[20px] border-[1.5px] text-left text-[14.5px] sm:text-[15px] transition-all select-none min-h-[54px] cursor-pointer ${
        selected
          ? "bg-[#314e3e] dark:bg-[#d6b883] text-[#ffffff] dark:text-[#19251d] border-[#314e3e] dark:border-[#d6b883] font-semibold shadow-xs"
          : "bg-[#fffefa] dark:bg-[#1e2821] border-[#dedfd4] dark:border-[#354237] text-[#293d32] dark:text-[#ecece0] font-medium hover:bg-[#faf8f3] dark:hover:bg-[#151c18] shadow-xs active:scale-[0.99]"
      } ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      <span
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold border transition-colors ${
          selected
            ? "bg-white/20 dark:bg-black/15 text-white dark:text-[#19251d] border-transparent"
            : "bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] border-[#dedfd4] dark:border-[#354237]"
        }`}
      >
        {selected ? "✓" : label}
      </span>
      <span className="flex-1 leading-snug">{text}</span>
    </button>
  );
}

// ====================== QUESTION PALETTE =========================
function QuestionPalette({ total, current, answers, flags, onSelect, onSubmitPrompt }) {
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flags).filter(Boolean).length;
  const unansweredCount = total - answeredCount;

  return (
    <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-[24px] p-5 border border-[#dedfd4] dark:border-[#354237] shadow-xs sticky top-6">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#dedfd4] dark:border-[#354237]">
        <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#293d32] dark:text-[#ecece0] flex items-center gap-2">
          <span>📋</span> Bảng câu hỏi
        </h3>
        <span className="text-[12px] font-bold font-serif text-[#7c5c2d] dark:text-[#d4b47d]">
          {total} câu
        </span>
      </div>

      {/* Chú giải trạng thái */}
      <div className="grid grid-cols-2 gap-2 text-[11px] mb-4 pb-3 border-b border-[#dedfd4] dark:border-[#354237]">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] text-[9px] font-bold flex items-center justify-center">
            ✓
          </span>
          <span className="text-[#575e55] dark:text-[#b0b9ac]">Đã làm ({answeredCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237]" />
          <span className="text-[#575e55] dark:text-[#b0b9ac]">Chưa làm ({unansweredCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
            ⚑
          </span>
          <span className="text-[#575e55] dark:text-[#b0b9ac]">Cần xem ({flaggedCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded border-2 border-[#927140] dark:border-[#d4b47d]" />
          <span className="text-[#575e55] dark:text-[#b0b9ac]">Đang xem</span>
        </div>
      </div>

      {/* Lưới câu hỏi */}
      <div className="p-2 -m-1 max-h-[290px] overflow-y-auto rounded-xl">
        <div className="grid grid-cols-5 gap-2.5">
        {Array.from({ length: total }).map((_, idx) => {
          const isCurrent = current === idx;
          const isAnswered = answers[idx] !== undefined && answers[idx] !== null;
          const isFlagged = Boolean(flags[idx]);

          let style = "bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] border-[#dedfd4] dark:border-[#354237]";
          if (isAnswered) {
            style = "bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] border-transparent font-bold";
          }
          if (isFlagged) {
            style = "bg-amber-500 text-white border-amber-600 font-bold";
          }
          if (isCurrent) {
            style += " ring-2 ring-[#927140] dark:ring-[#d4b47d] ring-offset-2 dark:ring-offset-[#1e2821]";
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(idx)}
              aria-label={`Chuyển tới câu ${idx + 1}`}
              className={`relative h-9 rounded-xl border text-[12px] font-semibold flex items-center justify-center transition-all cursor-pointer ${style}`}
            >
              {idx + 1}
              {isFlagged && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#1e2821]" />
              )}
            </button>
          );
        })}
        </div>
      </div>

      {/* Nút Nộp bài nhanh từ thanh bên */}
      <div className="mt-5 pt-4 border-t border-[#dedfd4] dark:border-[#354237]">
        <button
          type="button"
          onClick={onSubmitPrompt}
          className="w-full py-3 px-4 rounded-xl bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] font-bold text-[13px] hover:opacity-95 active:scale-98 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Nộp bài thi</span> →
        </button>
        <p className="text-[11px] text-center text-[#575e55] dark:text-[#b0b9ac] mt-2">
          Có thể nộp bất cứ lúc nào trước khi hết giờ
        </p>
      </div>
    </div>
  );
}

// ====================== MCQ AREA =========================
function McqArea({
  q,
  index,
  total,
  answeredCount,
  selectedKey,
  isFlagged,
  onSelectOption,
  onToggleFlag,
  onPrev,
  onNext,
  onSkip,
  isFirst,
  isLast,
  hasEssay,
}) {
  if (!q) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center bg-[#fffefa] dark:bg-[#1e2821] rounded-[24px] p-6 border border-[#dedfd4] dark:border-[#354237]">
        <span className="text-[44px]">📭</span>
        <p className="text-[15px] font-bold text-[#293d32] dark:text-[#ecece0]">
          Không tìm thấy nội dung câu hỏi
        </p>
      </div>
    );
  }

  const answeredPct = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Progress & Top Meta */}
      <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-[20px] p-3.5 border border-[#dedfd4] dark:border-[#354237] shadow-xs space-y-2">
        <div className="flex justify-between items-center px-1 text-[11.5px] font-bold">
          <span className="text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-wider">
            Câu {index + 1} / {total}
          </span>
          <span className="font-serif text-[#314e3e] dark:text-[#d6b883] tabular-nums text-[13px]">
            Đã làm: {answeredCount}/{total} ({answeredPct}%)
          </span>
        </div>
        <div className="h-1.5 bg-[#dedfd4] dark:bg-[#354237] rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-[#314e3e] dark:bg-[#d6b883] rounded-full transition-all duration-300"
            style={{ width: `${answeredPct}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-[24px] p-5 sm:p-6 border border-[#dedfd4] dark:border-[#354237] shadow-xs flex flex-col gap-5">
        {/* Header câu hỏi: Số câu, điểm, Nút Cờ đánh dấu */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-[#927140]/10 dark:bg-[#d4b47d]/15 text-[#7c5c2d] dark:text-[#d4b47d] text-[12px] font-bold border border-[#927140]/25 dark:border-[#d4b47d]/30">
              {index + 1}
            </span>
            <span className="text-[11px] font-bold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-widest">
              Trắc nghiệm (1 đáp án)
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleFlag}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-all cursor-pointer ${
              isFlagged
                ? "border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold"
                : "border-[#dedfd4] dark:border-[#354237] text-[#575e55] dark:text-[#b0b9ac] hover:border-amber-400 hover:text-amber-600 bg-[#faf8f3] dark:bg-[#151c18]"
            }`}
          >
            <span>⚑</span>
            <span>{isFlagged ? "Đã đánh dấu" : "Đánh dấu xem lại"}</span>
          </button>
        </div>

        {/* Nội dung câu hỏi */}
        <h2 className="text-[16px] sm:text-[17px] font-bold text-[#293d32] dark:text-[#ecece0] leading-relaxed">
          {q.text}
        </h2>

        {/* Các lựa chọn A, B, C, D */}
        <div className="flex flex-col gap-3" role="radiogroup" aria-label={`Đáp án cho câu ${index + 1}`}>
          {Object.entries(q.choices || {}).map(([k, v]) => (
            <OptionButton
              key={k}
              label={k}
              text={v}
              selected={selectedKey === k}
              onClick={() => onSelectOption(k)}
            />
          ))}
        </div>

        {/* Mẹo phím tắt */}
        <div className="pt-3 border-t border-[#dedfd4] dark:border-[#354237] flex flex-wrap items-center justify-between text-[11px] text-[#575e55] dark:text-[#b0b9ac] gap-2">
          <span>Phím tắt: Bấm <strong>1, 2, 3, 4</strong> hoặc <strong>A, B, C, D</strong> để chọn nhanh</span>
          <span className="hidden sm:inline">Phím <strong>← / →</strong> để đổi câu, <strong>F</strong> đặt cờ</span>
        </div>
      </div>

      {/* Điều hướng câu trước / câu sau */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirst}
          className="px-4 py-3 rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] text-[#293d32] dark:text-[#ecece0] hover:bg-[#faf8f3] dark:hover:bg-[#151c18] text-[13px] sm:text-[14px] font-bold flex items-center gap-2 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-xs"
        >
          ← Câu trước
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="px-3.5 py-3 rounded-xl border border-dashed border-[#dedfd4] dark:border-[#354237] text-[#575e55] dark:text-[#b0b9ac] hover:text-[#293d32] dark:hover:text-[#ecece0] bg-[#fffefa] dark:bg-[#1e2821] text-[13px] font-medium transition-all cursor-pointer shadow-xs"
          >
            Để lại làm sau
          </button>

          <button
            type="button"
            onClick={onNext}
            className="px-5 py-3 rounded-xl bg-[#314e3e] dark:bg-[#d6b883] text-[#ffffff] dark:text-[#19251d] hover:opacity-95 active:scale-98 text-[13px] sm:text-[14px] font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            {isLast ? (hasEssay ? "Sang Tự luận →" : "Xem lại & Nộp bài →") : "Câu tiếp theo →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ====================== ESSAY AREA =========================
function EssayArea({ essay, userEssayAns, onChangeEssay, onPrevToMcq, onSubmitPrompt }) {
  if (!essay || essay.length === 0) return null;

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-[24px] p-5 border border-[#dedfd4] dark:border-[#354237] shadow-xs flex items-center gap-4">
        <span className="w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center bg-[#927140]/10 dark:bg-[#d4b47d]/15 text-[22px] border border-[#927140]/25 dark:border-[#d4b47d]/30 shadow-xs">
          ✍️
        </span>
        <div>
          <h2 className="text-[16px] sm:text-[17px] font-extrabold font-serif text-[#293d32] dark:text-[#ecece0]">
            Phần II: Tự Luận Ngắn
          </h2>
          <p className="text-[12.5px] font-medium text-[#575e55] dark:text-[#b0b9ac] mt-0.5">
            {essay.length} câu hỏi · Trả lời ngắn gọn, nêu đúng từ khóa trọng tâm
          </p>
        </div>
      </div>

      {essay.map((q, i) => {
        const val = userEssayAns[i] || "";
        const words = val.trim() ? val.trim().split(/\s+/).length : 0;
        const chars = val.length;

        return (
          <div
            key={i}
            className="bg-[#fffefa] dark:bg-[#1e2821] rounded-[24px] p-5 sm:p-6 border border-[#dedfd4] dark:border-[#354237] shadow-xs flex flex-col gap-3.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-[#927140]/10 dark:bg-[#d4b47d]/15 text-[#7c5c2d] dark:text-[#d4b47d] text-[12px] font-bold border border-[#927140]/25 dark:border-[#d4b47d]/30">
                  {i + 1}
                </span>
                <span className="text-[11px] font-bold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-widest">
                  Câu hỏi tự luận
                </span>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ Tự động lưu nháp
              </span>
            </div>

            <h3 className="text-[15.5px] sm:text-[16px] font-bold text-[#293d32] dark:text-[#ecece0] leading-relaxed">
              {q.text}
            </h3>

            <textarea
              rows={4}
              value={val}
              onChange={(e) => onChangeEssay(i, e.target.value)}
              placeholder="Nhập câu trả lời của em tại đây…"
              className="w-full resize-none rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] px-4 py-3.5 text-[14.5px] font-medium text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 transition-shadow shadow-inner leading-relaxed"
            />

            <div className="flex justify-between items-center text-[11px] text-[#575e55] dark:text-[#b0b9ac]">
              <span>Gợi ý: Trả lời mạch lạc, đúng ý câu hỏi</span>
              <span className="font-mono tabular-nums">{words} từ · {chars} ký tự</span>
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onPrevToMcq}
          className="px-4 py-3.5 rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] text-[#293d32] dark:text-[#ecece0] hover:bg-[#faf8f3] dark:hover:bg-[#151c18] text-[13px] sm:text-[14px] font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          ← Quay lại Trắc nghiệm
        </button>

        <button
          type="button"
          onClick={onSubmitPrompt}
          className="px-6 py-3.5 rounded-xl bg-[#314e3e] dark:bg-[#d6b883] text-[#ffffff] dark:text-[#19251d] hover:opacity-95 active:scale-98 text-[13.5px] sm:text-[14px] font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          Hoàn thành & Nộp bài ✓
        </button>
      </div>
    </div>
  );
}

// ====================== RESULT VIEW =========================
function ResultView({
  mcq,
  essay,
  answers,
  userEssayAns,
  scoreData,
  timeElapsed,
  totalTime,
  isAutoSubmitted,
  handleReset,
  handleExit,
}) {
  const [filter, setFilter] = useState("all");

  const total = parseFloat(scoreData?.totalScore || 0);
  const pct = Math.round((total / 10) * 100);

  const grade =
    total >= 8.5
      ? {
          label: "Xuất sắc",
          emoji: "🎉",
          color: "text-emerald-700 dark:text-emerald-400",
          bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200/50 dark:border-emerald-500/20",
          quote: "Hãy chiến đấu trong cuộc thi đấu cao đẹp của đức tin, hãy đoạt lấy sự sống đời đời. (1 Tm 6,12)",
        }
      : total >= 6.5
      ? {
          label: "Giỏi",
          emoji: "👍",
          color: "text-blue-700 dark:text-blue-400",
          bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-500/20",
          quote: "Ai trung tín trong việc rất nhỏ, thì cũng trung tín trong việc lớn. (Lc 16,10)",
        }
      : total >= 5.0
      ? {
          label: "Đạt yêu cầu",
          emoji: "📚",
          color: "text-[#7c5c2d] dark:text-[#d4b47d]",
          bg: "bg-[#927140]/10 dark:bg-[#d4b47d]/15 border-[#927140]/25 dark:border-[#d4b47d]/30",
          quote: "Thầy ở cùng các con mọi ngày cho đến tận thế. (Mt 28,20) — Em đã rất cố gắng, hãy tiếp tục chăm chỉ nhé!",
        }
      : {
          label: "Cần cố gắng",
          emoji: "💪",
          color: "text-red-700 dark:text-red-400",
          bg: "bg-red-50 dark:bg-red-900/20 border-red-200/50 dark:border-red-500/20",
          quote: "Ơn Thầy đủ cho con, sức mạnh của Thầy biểu lộ trọn vẹn trong sự yếu đuối. (2 Cr 12,9) — Em hãy ôn lại bài và làm lại nhé!",
        };

  const reviewItems = useMemo(() => {
    return (mcq || []).map((q, idx) => {
      const selected = answers[idx];
      const isCorrect = selected === q.correct;
      const isUnanswered = selected === undefined || selected === null;
      return {
        q,
        idx,
        selected,
        isCorrect,
        isUnanswered,
      };
    });
  }, [mcq, answers]);

  const filteredItems = useMemo(() => {
    if (filter === "correct") return reviewItems.filter((item) => item.isCorrect);
    if (filter === "wrong") return reviewItems.filter((item) => !item.isCorrect && !item.isUnanswered);
    if (filter === "unanswered") return reviewItems.filter((item) => item.isUnanswered);
    return reviewItems;
  }, [reviewItems, filter]);

  const correctCount = reviewItems.filter((i) => i.isCorrect).length;
  const wrongCount = reviewItems.filter((i) => !i.isCorrect && !i.isUnanswered).length;
  const unansweredCount = reviewItems.filter((i) => i.isUnanswered).length;

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Thông báo nộp tự động khi hết giờ */}
      {isAutoSubmitted && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 flex items-start gap-3">
          <span className="text-[20px] flex-shrink-0">⏱️</span>
          <div>
            <p className="text-[14px] font-bold text-amber-900 dark:text-amber-200">
              Đã hết giờ làm bài!
            </p>
            <p className="text-[12.5px] text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
              Hệ thống đã tự động thu bài và bảo toàn, chấm điểm chính xác toàn bộ các câu hỏi em đã hoàn thành trước khi hết giờ.
            </p>
          </div>
        </div>
      )}

      {/* Thẻ Điểm Tổng Quan (Score Hero) */}
      <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-[28px] p-6 sm:p-8 border border-[#dedfd4] dark:border-[#354237] shadow-xs text-center relative overflow-hidden">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#575e55] dark:text-[#b0b9ac] mb-5">
          Kết quả đánh giá bài ôn tập
        </p>

        {/* Circular score progress indicator */}
        <div className="relative mx-auto w-36 h-36 mb-5">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              className="stroke-[#dedfd4] dark:stroke-[#354237]"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={pct >= 80 ? "#10b981" : pct >= 65 ? "#3b82f6" : pct >= 50 ? "#d97706" : "#ef4444"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[36px] font-extrabold font-serif text-[#293d32] dark:text-[#ecece0] tabular-nums leading-none">
              {scoreData?.totalScore}
            </span>
            <span className="text-[12px] font-bold text-[#575e55] dark:text-[#b0b9ac] mt-1">/ 10.0</span>
          </div>
        </div>

        {/* Grade badge */}
        <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border shadow-xs mb-4 ${grade.bg}`}>
          <span className="text-[16px]">{grade.emoji}</span>
          <span className={`text-[14.5px] font-bold ${grade.color}`}>{grade.label}</span>
        </div>

        {/* Biblical Quote */}
        <p className="text-[13px] text-[#575e55] dark:text-[#b0b9ac] italic max-w-md mx-auto leading-relaxed mb-6">
          "{grade.quote}"
        </p>

        {/* Breakdown Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#faf8f3] dark:bg-[#151c18] rounded-[20px] p-4 border border-[#dedfd4] dark:border-[#354237] shadow-inner text-left">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">
              Trắc nghiệm
            </span>
            <p className="text-[16px] font-extrabold font-serif text-[#293d32] dark:text-[#ecece0] mt-0.5 tabular-nums">
              {scoreData?.mcqScore} đ
            </p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {correctCount}/{mcq.length} câu đúng
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">
              Tự luận
            </span>
            <p className="text-[16px] font-extrabold font-serif text-[#293d32] dark:text-[#ecece0] mt-0.5 tabular-nums">
              {scoreData?.essayScore} đ
            </p>
            <span className="text-[11px] text-[#575e55] dark:text-[#b0b9ac] font-medium">
              {essay.length} câu hỏi
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">
              Thời gian làm
            </span>
            <p className="text-[16px] font-extrabold font-serif text-[#293d32] dark:text-[#ecece0] mt-0.5 tabular-nums">
              {formatTime(timeElapsed)}
            </p>
            <span className="text-[11px] text-[#575e55] dark:text-[#b0b9ac]">
              Hạn mức {formatTime(totalTime)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">
              Tỷ lệ chính xác
            </span>
            <p className="text-[16px] font-extrabold font-serif text-[#293d32] dark:text-[#ecece0] mt-0.5 tabular-nums">
              {pct}%
            </p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {total >= 5 ? "Đạt chuẩn" : "Cần ôn tập"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 print:hidden">
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2.5 rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] hover:bg-[#faf8f3] dark:hover:bg-[#151c18] text-[13px] font-bold text-[#293d32] dark:text-[#ecece0] transition-all cursor-pointer shadow-xs"
          >
            Làm lại từ đầu ↺
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] hover:bg-[#dedfd4]/50 text-[13px] font-bold text-[#293d32] dark:text-[#ecece0] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>🖨️</span> In phiếu điểm
          </button>

          <button
            type="button"
            onClick={handleExit}
            className="px-5 py-2.5 rounded-xl bg-[#314e3e] dark:bg-[#d6b883] text-[#ffffff] dark:text-[#19251d] hover:opacity-95 text-[13px] font-bold transition-all cursor-pointer shadow-xs"
          >
            Quay lại thư viện →
          </button>
        </div>
      </div>

      {/* Phần Rà Soát Chi Tiết Đáp Án */}
      <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-[28px] p-6 sm:p-7 border border-[#dedfd4] dark:border-[#354237] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#dedfd4] dark:border-[#354237]">
          <div>
            <h3 className="text-[16px] font-bold font-serif text-[#293d32] dark:text-[#ecece0]">
              Chi tiết đáp án & Lời giải
            </h3>
            <p className="text-[12px] text-[#575e55] dark:text-[#b0b9ac] mt-0.5">
              Rà soát từng câu để ghi nhớ kiến thức và củng cố đức tin
            </p>
          </div>

          {/* Bộ lọc xem lại */}
          <div className="flex flex-wrap bg-[#faf8f3] dark:bg-[#151c18] p-1 rounded-xl border border-[#dedfd4] dark:border-[#354237] text-[11.5px] font-bold print:hidden">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-[#314e3e] dark:bg-[#d6b883] text-[#ffffff] dark:text-[#19251d]"
                  : "text-[#575e55] dark:text-[#b0b9ac] hover:text-[#293d32] dark:hover:text-[#ecece0]"
              }`}
            >
              Tất cả ({mcq.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("correct")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filter === "correct"
                  ? "bg-[#314e3e] dark:bg-[#d6b883] text-[#ffffff] dark:text-[#19251d]"
                  : "text-emerald-700 dark:text-emerald-400"
              }`}
            >
              ✓ Đúng ({correctCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("wrong")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filter === "wrong"
                  ? "bg-[#314e3e] dark:bg-[#d6b883] text-[#ffffff] dark:text-[#19251d]"
                  : "text-red-700 dark:text-red-400"
              }`}
            >
              ✗ Sai ({wrongCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unanswered")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filter === "unanswered"
                  ? "bg-[#314e3e] dark:bg-[#d6b883] text-[#ffffff] dark:text-[#19251d]"
                  : "text-[#575e55] dark:text-[#b0b9ac]"
              }`}
            >
              – Chưa làm ({unansweredCount})
            </button>
          </div>
        </div>

        {/* Danh sách các câu MCQ đã lọc */}
        <div className="space-y-4">
          {filteredItems.map(({ q, idx, selected, isCorrect, isUnanswered }) => (
            <div
              key={idx}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isCorrect
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300/50 dark:border-emerald-800/40"
                  : isUnanswered
                  ? "bg-[#faf8f3] dark:bg-[#151c18] border-[#dedfd4] dark:border-[#354237]"
                  : "bg-red-50/40 dark:bg-red-950/20 border-red-300/50 dark:border-red-800/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10.5px] font-extrabold uppercase tracking-wider ${
                    isCorrect
                      ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                      : isUnanswered
                      ? "bg-stone-200 dark:bg-stone-800 text-[#575e55] dark:text-[#b0b9ac]"
                      : "bg-red-500/15 text-red-800 dark:text-red-300"
                  }`}
                >
                  Câu {idx + 1} · {isCorrect ? "✓ Chính xác" : isUnanswered ? "– Chưa trả lời" : "✗ Chưa chính xác"}
                </span>
                <span className="text-[12px] font-serif font-bold text-[#575e55] dark:text-[#b0b9ac]">
                  {isCorrect ? "Đạt điểm" : "0 đ"}
                </span>
              </div>

              <h4 className="text-[14.5px] font-bold text-[#293d32] dark:text-[#ecece0] leading-relaxed mb-3">
                {q.text}
              </h4>

              <div className="space-y-1.5 text-[13px]">
                {/* Lựa chọn của em */}
                <div className="flex items-start gap-2">
                  <span className="text-[#575e55] dark:text-[#b0b9ac] min-w-[90px] flex-shrink-0">
                    Em đã chọn:
                  </span>
                  <span
                    className={`font-semibold ${
                      isCorrect
                        ? "text-emerald-700 dark:text-emerald-400"
                        : isUnanswered
                        ? "text-[#575e55] dark:text-[#b0b9ac] italic"
                        : "text-red-700 dark:text-red-400"
                    }`}
                  >
                    {isUnanswered
                      ? "Không trả lời"
                      : `${selected}. ${q.choices?.[selected] || ""}`}
                  </span>
                </div>

                {/* Đáp án đúng (khi làm sai hoặc bỏ qua) */}
                {!isCorrect && (
                  <div className="flex items-start gap-2">
                    <span className="text-[#575e55] dark:text-[#b0b9ac] min-w-[90px] flex-shrink-0">
                      Đáp án đúng:
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {q.correct}. {q.choices?.[q.correct] || ""}
                    </span>
                  </div>
                )}
              </div>

              {/* Giải thích / Lời giải chi tiết (nếu có trong dữ liệu câu hỏi) */}
              {q.explanation && (
                <div className="mt-3 p-3 rounded-xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-[12px] text-[#575e55] dark:text-[#b0b9ac] leading-relaxed">
                  <strong className="text-[#293d32] dark:text-[#ecece0]">💡 Lời giải chi tiết: </strong>
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Phần Tự Luận Review */}
        {essay && essay.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#dedfd4] dark:border-[#354237] space-y-4">
            <h4 className="text-[14px] font-bold uppercase tracking-wider text-[#7c5c2d] dark:text-[#d4b47d] flex items-center gap-2">
              <span>✍️</span> Xem lại phần Tự Luận
            </h4>

            {essay.map((q, i) => {
              const ans = userEssayAns[i];
              return (
                <div
                  key={i}
                  className="p-4 sm:p-5 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] flex flex-col gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#927140]/10 dark:bg-[#d4b47d]/15 text-[#7c5c2d] dark:text-[#d4b47d] text-[11px] font-bold border border-[#927140]/25 dark:border-[#d4b47d]/30">
                      {i + 1}
                    </span>
                    <h5 className="text-[14px] font-bold text-[#293d32] dark:text-[#ecece0]">
                      {q.text}
                    </h5>
                  </div>

                  {q.sample && (
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40 rounded-xl">
                      <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-widest mb-1">
                        Gợi ý đáp án chuẩn
                      </p>
                      <p className="text-[13px] text-emerald-900 dark:text-emerald-200 font-medium leading-relaxed whitespace-pre-line">
                        {q.sample}
                      </p>
                    </div>
                  )}

                  <div className="p-3.5 bg-[#fffefa] dark:bg-[#1e2821] rounded-xl border border-[#dedfd4] dark:border-[#354237]">
                    <p className="text-[10px] font-bold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-widest mb-1">
                      Câu trả lời của em
                    </p>
                    <p className="text-[13.5px] text-[#293d32] dark:text-[#ecece0] font-medium leading-relaxed">
                      {ans || "— (Chưa nhập câu trả lời)"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ====================== MAIN COMPONENT =========================
export default function QuizBox({ handleExit, config, quizData }) {
  const { play } = useSound();

  // Cấu hình âm thanh & hướng dẫn
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem("quizSound") !== "false";
    } catch {
      return true;
    }
  });

  const [showGuide, setShowGuide] = useState(() => {
    try {
      return localStorage.getItem("skipQuizGuide") !== "true";
    } catch {
      return true;
    }
  });

  const [isMidQuizGuide, setIsMidQuizGuide] = useState(false);
  const [isOpenExit, setIsOpenExit] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Trạng thái giai đoạn làm bài: 'taking' | 'result'
  const [phase, setPhase] = useState("taking");
  // Tab hiện tại trong lúc thi: 'mcq' | 'essay'
  const [activeTab, setActiveTab] = useState("mcq");

  // Dữ liệu câu trả lời
  const [answers, setAnswers] = useState({}); // { [idx]: 'A' | 'B' ... }
  const [flags, setFlags] = useState({}); // { [idx]: true }
  const [currentQ, setCurrentQ] = useState(0);
  const draftKey = `quiz_draft_${config?.id || config?.slug || "general"}`;
  const [userEssayAns, setUserEssayAns] = useState(() => {
    try {
      const saved = localStorage.getItem(`quiz_draft_${config?.id || config?.slug || "general"}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Kết quả & thời gian
  const [scoreData, setScoreData] = useState(null);
  const [isAutoSubmitted, setIsAutoSubmitted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Randomize bộ câu hỏi
  const mcq = useMemo(() => {
    if (attempt < 0) return [];
    return getRandomItems(quizData?.mcq || [], config?.mcqCount || 0);
  }, [quizData?.mcq, config?.mcqCount, attempt]);

  const essay = useMemo(() => {
    if (attempt < 0) return [];
    return getRandomItems(quizData?.essay || [], config?.essayCount || 0);
  }, [quizData?.essay, config?.essayCount, attempt]);

  // Toggle âm thanh
  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("quizSound", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Xác nhận hướng dẫn
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

  // Timer: tạm dừng khi đang mở Modal
  const isTimerRunning =
    phase === "taking" && !showGuide && !isOpenExit && !showConfirmSubmit;

  // Cập nhật thời gian làm bài
  const handleTimerTick = useCallback((_timeLeft, elapsed) => {
    setTimeElapsed(elapsed);
  }, []);

  // Tính điểm số an toàn tuyệt đối
  const calculateScores = useCallback(
    (currentAnswers, currentEssayAns) => {
      // 1. Điểm trắc nghiệm
      let correctCount = 0;
      const totalMcq = mcq.length;
      mcq.forEach((q, idx) => {
        if (currentAnswers[idx] && currentAnswers[idx] === q.correct) {
          correctCount += 1;
        }
      });

      const mcqPointMax = config?.mcqPoint ?? (essay.length > 0 ? 5.0 : 10.0);
      const calculatedMcqScore =
        totalMcq > 0 ? (correctCount * mcqPointMax) / totalMcq : 0;

      // 2. Điểm tự luận
      let totalEssayScore = 0;
      const totalEssay = essay.length;
      const essayPointMax = config?.essayPoint ?? (totalMcq > 0 ? 5.0 : 10.0);

      essay.forEach((q, idx) => {
        const userText = (currentEssayAns[idx] || "").toLowerCase().trim();
        const keywords = q.keywords || [];
        if (keywords.length > 0 && userText) {
          let qScore = 0;
          keywords.forEach((item) => {
            const words = Array.isArray(item.word)
              ? item.word
              : item.word
              ? [item.word]
              : [];
            const wordsLower = words
              .map((w) => String(w).toLowerCase().trim())
              .filter(Boolean);
            if (
              wordsLower.length > 0 &&
              wordsLower.every((w) => userText.includes(w))
            ) {
              qScore += essayPointMax / totalEssay / keywords.length;
            }
          });
          totalEssayScore += qScore;
        }
      });

      const finalTotal = (calculatedMcqScore + totalEssayScore).toFixed(2);

      return {
        mcqScore: calculatedMcqScore.toFixed(2),
        essayScore: totalEssayScore.toFixed(2),
        totalScore: finalTotal,
        correctCount,
        totalMcq,
        totalEssay,
      };
    },
    [mcq, essay, config]
  );

  // Thu bài tự động khi hết giờ (BẢO TOÀN ĐIỂM SỐ, KHÔNG RESET VỀ 0)
  const handleTimeUp = useCallback(() => {
    const scores = calculateScores(answers, userEssayAns);
    setScoreData(scores);
    setIsAutoSubmitted(true);
    setPhase("result");

    if (soundEnabled) {
      if (parseFloat(scores.totalScore) >= 5) {
        play("win");
      } else {
        play("wrong");
      }
    }
  }, [answers, userEssayAns, calculateScores, soundEnabled, play]);

  // Nộp bài thủ công
  const handleConfirmSubmit = () => {
    setShowConfirmSubmit(false);
    const scores = calculateScores(answers, userEssayAns);
    setScoreData(scores);
    setIsAutoSubmitted(false);
    setPhase("result");

    try {
      localStorage.removeItem(draftKey);
    } catch {
      // ignore
    }

    if (soundEnabled) {
      play("win");
    }

    if (parseFloat(scores.totalScore) >= 8) {
      burstConfetti(window.innerWidth / 2, window.innerHeight / 3);
    }
  };

  // Làm lại đề
  const handleReset = () => {
    if (soundEnabled) play("select");
    setAttempt((a) => a + 1);
    setAnswers({});
    setFlags({});
    setCurrentQ(0);
    setUserEssayAns({});
    setPhase("taking");
    setActiveTab("mcq");
    setScoreData(null);
    setIsAutoSubmitted(false);
    setTimeElapsed(0);
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // ignore
    }
  };

  // Chọn đáp án trắc nghiệm
  const handleSelectOption = useCallback((key) => {
    setAnswers((prev) => ({ ...prev, [currentQ]: key }));
    if (soundEnabled) play("select");
  }, [currentQ, soundEnabled, play]);

  // Đổi cờ đánh dấu
  const handleToggleFlag = useCallback(() => {
    setFlags((prev) => ({ ...prev, [currentQ]: !prev[currentQ] }));
    if (soundEnabled) play("select");
  }, [currentQ, soundEnabled, play]);

  // Cập nhật nháp tự luận
  const handleEssayChange = (idx, text) => {
    setUserEssayAns((prev) => {
      const next = { ...prev, [idx]: text };
      try {
        localStorage.setItem(draftKey, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Phím tắt bàn phím
  useEffect(() => {
    if (phase !== "taking" || activeTab !== "mcq") return;

    const handleKeyDown = (e) => {
      if (["input", "textarea"].includes(document.activeElement?.tagName?.toLowerCase())) {
        return;
      }
      const key = e.key.toUpperCase();
      if (["A", "B", "C", "D"].includes(key)) {
        handleSelectOption(key);
      } else if (e.key === "1") handleSelectOption("A");
      else if (e.key === "2") handleSelectOption("B");
      else if (e.key === "3") handleSelectOption("C");
      else if (e.key === "4") handleSelectOption("D");
      else if (e.key === "ArrowLeft" && currentQ > 0) {
        setCurrentQ((q) => q - 1);
      } else if (e.key === "ArrowRight" && currentQ < mcq.length - 1) {
        setCurrentQ((q) => q + 1);
      } else if (e.key === "f" || e.key === "F") {
        handleToggleFlag();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, activeTab, currentQ, mcq.length, handleSelectOption, handleToggleFlag]);

  if (!config) return null;

  // Fallback khi đề chưa có dữ liệu
  if (mcq.length === 0 && essay.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 bg-[#faf8f3] dark:bg-[#151c18] text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#927140]/10 text-[#7c5c2d] dark:text-[#d4b47d] flex items-center justify-center text-2xl font-bold shadow-xs border border-[#927140]/25 dark:border-[#d4b47d]/30">
          📝
        </div>
        <h2 className="text-xl font-bold text-[#293d32] dark:text-[#ecece0] font-serif">
          Ngân hàng câu hỏi đang được biên soạn
        </h2>
        <p className="text-sm text-[#575e55] dark:text-[#b0b9ac] max-w-md leading-relaxed">
          Bộ đề này hiện đang được Ban Giáo Lý cập nhật nội dung câu hỏi chuẩn. Bạn vui lòng quay lại sau!
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

  const answeredEssaysCount = Object.values(userEssayAns).filter((t) => t && t.trim()).length;

  return (
    <div className="min-h-screen bg-[#faf8f3] dark:bg-[#151c18] transition-colors duration-500 relative font-sans">
      {/* Nền pattern lưới mờ trang trọng */}
      <div className="fixed inset-0 w-full h-screen bg-[linear-gradient(to_right,#293D3208_1px,transparent_1px),linear-gradient(to_bottom,#293D3208_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ECECE005_1px,transparent_1px),linear-gradient(to_bottom,#ECECE005_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Các Modal hệ thống */}
      <AnimatePresence>
        {isOpenExit && (
          <ExitButton
            handleExit={handleExit}
            handleClose={() => setIsOpenExit(false)}
          />
        )}
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

      <SubmitConfirmBox
        isOpen={showConfirmSubmit}
        onCancel={() => setShowConfirmSubmit(false)}
        onConfirm={handleConfirmSubmit}
        mcqTotal={mcq.length}
        mcqAnswered={Object.keys(answers).length}
        essayTotal={essay.length}
        essayAnswered={answeredEssaysCount}
      />

      {/* Khung nội dung chính (Mở rộng max-w-5xl cho màn hình lớn) */}
      <div
        className="flex flex-col min-h-screen max-w-5xl mx-auto w-full px-4 sm:px-6 relative z-10"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 16px)",
          paddingBottom: "max(env(safe-area-inset-bottom), 24px)",
        }}
      >
        {/* HEADER BAR */}
        <header className="bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-2xl p-4 sm:p-5 shadow-xs mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">

          {/* ── Tầng 1: CHỈ MOBILE ── Badge phần thi (trái) + Cụm điều khiển (phải) */}
          <div className="flex items-center justify-between gap-2 sm:hidden pb-2.5 border-b border-[#dedfd4]/60 dark:border-[#354237]/60">
            <span className="text-[10.5px] font-extrabold text-[#7c5c2d] dark:text-[#d4b47d] tracking-widest uppercase leading-snug">
              {phase === "result"
                ? "Bảng Kết Quả"
                : activeTab === "mcq"
                ? `Phần I · TN (${mcq.length} câu)`
                : `Phần II · TL (${essay.length} câu)`}
            </span>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {phase === "taking" && (
                <div className="flex items-center gap-1 bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] rounded-full px-2.5 py-1 shadow-xs text-[12px]">
                  <span className="opacity-80">⏱</span>
                  <QuizTimer
                    key={attempt}
                    duration={config.time}
                    onTimeUp={handleTimeUp}
                    running={isTimerRunning}
                    onTick={handleTimerTick}
                  />
                </div>
              )}
              <button
                type="button"
                onClick={handleToggleSound}
                aria-label={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
                title={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
                className="w-9 h-9 rounded-full bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-[#575e55] dark:text-[#b0b9ac] text-[14px] flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                {soundEnabled ? "🔊" : "🔇"}
              </button>
              {phase === "taking" && (
                <button
                  type="button"
                  onClick={() => { setIsMidQuizGuide(true); setShowGuide(true); }}
                  aria-label="Hướng dẫn làm bài"
                  title="Hướng dẫn làm bài"
                  className="w-9 h-9 rounded-full bg-[#927140]/10 dark:bg-[#d4b47d]/15 text-[#7c5c2d] dark:text-[#d4b47d] text-[15px] font-bold flex items-center justify-center shadow-xs border border-[#927140]/25 dark:border-[#d4b47d]/30 active:scale-95 transition-colors cursor-pointer"
                >
                  ?
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpenExit(true)}
                aria-label="Thoát bài thi"
                title="Thoát bài thi"
                className="w-9 h-9 rounded-full bg-[#fffefa] dark:bg-[#1e2821] shadow-xs border border-[#dedfd4] dark:border-[#354237] flex items-center justify-center text-[#575e55] hover:text-red-600 dark:text-[#b0b9ac] dark:hover:text-red-400 active:scale-95 transition-all text-[14px] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* ── Tầng 2 (mobile) / Desktop left: Tiêu đề + phụ đề ── */}
          <div className="min-w-0 flex-1">
            <h1 className="text-[18px] sm:text-[21px] font-extrabold text-[#293d32] dark:text-[#ecece0] tracking-tight leading-snug sm:leading-tight font-serif break-words">
              {config.title}
            </h1>
            {/* Phụ đề: chỉ hiện trên desktop vì mobile đã có badge ở Tầng 1 */}
            <div className="hidden sm:flex items-center gap-2 mt-1">
              <span className="text-[11px] font-bold text-[#7c5c2d] dark:text-[#d4b47d] tracking-widest uppercase">
                {phase === "result"
                  ? "Bảng Kết Quả"
                  : activeTab === "mcq"
                  ? `Phần I · Trắc Nghiệm (${mcq.length} câu)`
                  : `Phần II · Tự Luận (${essay.length} câu)`}
              </span>
            </div>
          </div>

          {/* ── Desktop right: Cụm điều khiển đầy đủ (ẩn trên mobile) ── */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            {phase === "taking" && (
              <div className="flex items-center gap-1.5 bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] rounded-full px-3 py-1.5 shadow-xs">
                <span className="text-[13px] opacity-80">⏱</span>
                <QuizTimer
                  key={attempt}
                  duration={config.time}
                  onTimeUp={handleTimeUp}
                  running={isTimerRunning}
                  onTick={handleTimerTick}
                />
              </div>
            )}

            {/* Sound toggle button */}
            <button
              type="button"
              onClick={handleToggleSound}
              aria-label={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
              title={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
              className="w-10 h-10 rounded-full bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-[#575e55] dark:text-[#b0b9ac] hover:text-[#293d32] dark:hover:text-[#ecece0] text-[14px] flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              {soundEnabled ? "🔊" : "🔇"}
            </button>

            {/* Guide modal button */}
            {phase === "taking" && (
              <button
                type="button"
                onClick={() => {
                  setIsMidQuizGuide(true);
                  setShowGuide(true);
                }}
                aria-label="Hướng dẫn làm bài"
                title="Hướng dẫn làm bài"
                className="w-10 h-10 rounded-full bg-[#927140]/10 dark:bg-[#d4b47d]/15 text-[#7c5c2d] dark:text-[#d4b47d] text-[15px] font-bold flex items-center justify-center shadow-xs border border-[#927140]/25 dark:border-[#d4b47d]/30 hover:bg-[#927140]/20 transition-colors active:scale-95 cursor-pointer"
              >
                ?
              </button>
            )}

            {/* Exit button */}
            <button
              type="button"
              onClick={() => setIsOpenExit(true)}
              aria-label="Thoát bài thi"
              title="Thoát bài thi"
              className="w-10 h-10 rounded-full bg-[#fffefa] dark:bg-[#1e2821] shadow-xs border border-[#dedfd4] dark:border-[#354237] flex items-center justify-center text-[#575e55] hover:text-red-600 dark:text-[#b0b9ac] dark:hover:text-red-400 active:scale-95 transition-all text-[14px] font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        </header>

        {/* TAB SWITCHER (Khi có cả Trắc nghiệm & Tự luận trong lúc làm bài) */}
        {phase === "taking" && essay.length > 0 && (
          <div className="flex items-center gap-2 mb-4 bg-[#faf8f3] dark:bg-[#151c18] p-1.5 rounded-2xl border border-[#dedfd4] dark:border-[#354237] w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("mcq")}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
                activeTab === "mcq"
                  ? "bg-[#314e3e] dark:bg-[#d6b883] text-[#ffffff] dark:text-[#19251d] shadow-xs"
                  : "text-[#575e55] dark:text-[#b0b9ac] hover:text-[#293d32] dark:hover:text-[#ecece0]"
              }`}
            >
              Phần I: Trắc Nghiệm ({mcq.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("essay")}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
                activeTab === "essay"
                  ? "bg-[#314e3e] dark:bg-[#d6b883] text-[#ffffff] dark:text-[#19251d] shadow-xs"
                  : "text-[#575e55] dark:text-[#b0b9ac] hover:text-[#293d32] dark:hover:text-[#ecece0]"
              }`}
            >
              Phần II: Tự Luận ({essay.length})
            </button>
          </div>
        )}

        {/* NỘI DUNG CHÍNH (CONTENT) */}
        <div className="flex-1">
          {phase === "taking" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* KHU VỰC CÂU HỎI (8 CỘT TRÊN DESKTOP) */}
              <div className="lg:col-span-8">
                {activeTab === "mcq" ? (
                  <McqArea
                    q={mcq[currentQ]}
                    index={currentQ}
                    total={mcq.length}
                    answeredCount={Object.keys(answers).length}
                    selectedKey={answers[currentQ]}
                    isFlagged={Boolean(flags[currentQ])}
                    onSelectOption={handleSelectOption}
                    onToggleFlag={handleToggleFlag}
                    onPrev={() => currentQ > 0 && setCurrentQ((c) => c - 1)}
                    onNext={() => {
                      if (currentQ < mcq.length - 1) {
                        setCurrentQ((c) => c + 1);
                      } else if (essay.length > 0) {
                        setActiveTab("essay");
                      } else {
                        setShowConfirmSubmit(true);
                      }
                    }}
                    onSkip={() => {
                      if (currentQ < mcq.length - 1) {
                        setCurrentQ((c) => c + 1);
                      } else if (essay.length > 0) {
                        setActiveTab("essay");
                      }
                    }}
                    isFirst={currentQ === 0}
                    isLast={currentQ === mcq.length - 1}
                    hasEssay={essay.length > 0}
                  />
                ) : (
                  <EssayArea
                    essay={essay}
                    userEssayAns={userEssayAns}
                    onChangeEssay={handleEssayChange}
                    onPrevToMcq={() => setActiveTab("mcq")}
                    onSubmitPrompt={() => setShowConfirmSubmit(true)}
                  />
                )}
              </div>

              {/* BẢNG CÂU HỎI SIDEBAR (4 CỘT TRÊN DESKTOP) */}
              <div className="lg:col-span-4">
                <QuestionPalette
                  total={mcq.length}
                  current={activeTab === "mcq" ? currentQ : -1}
                  answers={answers}
                  flags={flags}
                  onSelect={(idx) => {
                    setActiveTab("mcq");
                    setCurrentQ(idx);
                  }}
                  onSubmitPrompt={() => setShowConfirmSubmit(true)}
                />
              </div>
            </div>
          ) : (
            /* MÀN HÌNH KẾT QUẢ */
            <ResultView
              mcq={mcq}
              essay={essay}
              answers={answers}
              userEssayAns={userEssayAns}
              scoreData={scoreData}
              timeElapsed={timeElapsed}
              totalTime={config.time}
              isAutoSubmitted={isAutoSubmitted}
              handleReset={handleReset}
              handleExit={handleExit}
            />
          )}
        </div>
      </div>
    </div>
  );
}