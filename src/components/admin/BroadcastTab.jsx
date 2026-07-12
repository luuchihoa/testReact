import React, { useState, useCallback, useEffect, useRef } from "react";
import { Megaphone, Link2, Loader2, Send, History, X, CheckCircle2, Inbox } from "lucide-react";
import { useAdminContext } from "./AdminContext.jsx";
import { ACCENT } from "./constants.js";
import { sendBroadcastNotification, fetchRecentBroadcasts } from "./dataLayer.js";

const TITLE_MAX = 120;
const MESSAGE_MAX = 1000;

function relativeTime(iso) {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "Vừa xong";
  if (min < 60) return `${min} phút trước`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day} ngày trước`;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/* ---------- Confirm sheet: bottom sheet trên mobile, modal giữa màn hình trên desktop ---------- */
function ConfirmSheet({ open, title, onCancel, onConfirm, busy }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-stone-900/40 dark:bg-black/60 backdrop-blur-[2px] animate-[fadeIn_.18s_ease-out]"
        onClick={busy ? undefined : onCancel}
      />
      <div
        className="relative w-full sm:w-[420px] sm:mx-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl rounded-t-[28px] sm:rounded-[28px]
                   shadow-[0_-8px_40px_rgba(0,0,0,0.12)] sm:shadow-[0_20px_60px_rgba(0,0,0,0.18)]
                   dark:shadow-[0_-8px_40px_rgba(0,0,0,0.5)] dark:sm:shadow-[0_20px_60px_rgba(0,0,0,0.6)]
                   dark:ring-1 dark:ring-stone-800
                   pb-[calc(env(safe-area-inset-bottom)+20px)] sm:pb-6 pt-2.5 sm:pt-6 px-6
                   animate-[slideUp_.22s_cubic-bezier(0.32,0.72,0,1)]"
      >
        <div className="sm:hidden mx-auto mb-4 h-1.5 w-10 rounded-full bg-stone-200 dark:bg-stone-700" />
        <div className="flex flex-col items-center text-center gap-3 sm:gap-2.5 pt-2 sm:pt-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${ACCENT}14` }}
          >
            <Megaphone className="w-5 h-5" style={{ color: ACCENT }} />
          </div>
          <h4 className="text-[16px] font-bold text-stone-900 dark:text-stone-100">Gửi cho tất cả mọi người?</h4>
          <p className="text-[13.5px] text-stone-500 dark:text-stone-400 leading-relaxed px-1">
            Thông báo <span className="font-semibold text-stone-700 dark:text-stone-200">"{title}"</span> sẽ hiển thị ngay cho toàn bộ học sinh, giáo viên và quản trị viên.
          </p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2.5 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 h-12 rounded-2xl text-[14.5px] font-semibold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800
                       hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 h-12 rounded-2xl text-[14.5px] font-bold text-white
                       active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm"
            style={{ backgroundColor: ACCENT }}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {busy ? "Đang gửi…" : "Gửi ngay"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BroadcastTab() {
  const { showToast } = useAdminContext();

  const [title,   setTitle]   = useState("");
  const [message, setMessage] = useState("");
  const [link,    setLink]    = useState("");
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [history,        setHistory]        = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [justSentId, setJustSentId] = useState(null);

  const messageRef = useRef(null);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      setHistory(await fetchRecentBroadcasts());
    } catch (err) {
      console.error("load broadcast history error:", err);
      showToast("Không tải được lịch sử thông báo", "error");
    } finally {
      setHistoryLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  // auto-grow textarea, cảm giác mượt như ghi chú trên iOS
  useEffect(() => {
    const el = messageRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [message]);

  const requestSend = (e) => {
    e.preventDefault();
    const t = title.trim();
    const m = message.trim();
    if (!t || !m) { showToast("Cần nhập đủ tiêu đề và nội dung", "warning"); return; }
    setConfirmOpen(true);
  };

  const handleConfirmSend = async () => {
    setSending(true);
    try {
      await sendBroadcastNotification(title.trim(), message.trim(), link.trim());
      showToast("Đã gửi thông báo chung", "success");
      setTitle(""); setMessage(""); setLink("");
      setConfirmOpen(false);
      await loadHistory();
    } catch (err) {
      console.error("send broadcast error:", err);
      showToast(err?.message || "Gửi thông báo thất bại", "error");
      setConfirmOpen(false);
    } finally {
      setSending(false);
    }
  };

  const titleLeft = TITLE_MAX - title.length;
  const msgLeft = MESSAGE_MAX - message.length;

  return (
    <div className="flex flex-col gap-4 sm:gap-5 pb-24 sm:pb-0">
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(24px); opacity: .6 } to { transform: translateY(0); opacity: 1 } }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[fadeIn_\\.18s_ease-out\\], .animate-\\[slideUp_\\.22s_cubic-bezier\\(0\\.32\\,0\\.72\\,0\\,1\\)\\] { animation: none !important; }
        }
      `}</style>

      {/* ---------- Form soạn thông báo ---------- */}
      <form
        onSubmit={requestSend}
        className="bg-white dark:bg-stone-900 rounded-[28px] border border-stone-100 dark:border-stone-800
                   shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)] p-5 sm:p-6 flex flex-col gap-5"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${ACCENT}14` }}
          >
            <Megaphone className="w-4 h-4" style={{ color: ACCENT }} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-stone-900 dark:text-stone-100 tracking-tight">Soạn thông báo chung</h3>
            <p className="text-[12.5px] text-stone-400 dark:text-stone-500 mt-0.5">
              Hiển thị cho <span className="font-semibold text-stone-500 dark:text-stone-400">tất cả tài khoản</span> ở chuông thông báo
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12.5px] font-semibold text-stone-500 dark:text-stone-400">Tiêu đề</label>
              <span className={`text-[11px] tabular-nums ${titleLeft < 15 ? "text-orange-500 dark:text-orange-400" : "text-stone-300 dark:text-stone-600"}`}>
                {titleLeft}
              </span>
            </div>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Nghỉ học tuần này"
              maxLength={TITLE_MAX}
              className="w-full h-12 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-800/70 px-4 text-[15px]
                         text-stone-900 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-600 outline-none transition-all
                         focus:bg-white dark:focus:bg-stone-800 focus:ring-[3px] focus:border-transparent"
              style={{ "--tw-ring-color": `${ACCENT}33` }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}33`)}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12.5px] font-semibold text-stone-500 dark:text-stone-400">Nội dung</label>
              <span className={`text-[11px] tabular-nums ${msgLeft < 80 ? "text-orange-500 dark:text-orange-400" : "text-stone-300 dark:text-stone-600"}`}>
                {msgLeft}
              </span>
            </div>
            <textarea
              ref={messageRef}
              value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="Nội dung chi tiết của thông báo…"
              rows={4} maxLength={MESSAGE_MAX}
              className="w-full rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-800/70 px-4 py-3 text-[15px] leading-relaxed
                         text-stone-900 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-600 resize-none outline-none transition-all min-h-[104px]
                         focus:bg-white dark:focus:bg-stone-800"
              onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}33`)}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[12.5px] font-semibold text-stone-500 dark:text-stone-400 mb-1.5">
              <Link2 className="w-3.5 h-3.5" /> Đường dẫn <span className="font-normal text-stone-300 dark:text-stone-600">· tuỳ chọn</span>
            </label>
            <input
              type="text" value={link} onChange={(e) => setLink(e.target.value)}
              placeholder="VD: /lịch-sinh-hoạt"
              className="w-full h-12 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-800/70 px-4 text-[15px]
                         text-stone-900 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-600 outline-none transition-all
                         focus:bg-white dark:focus:bg-stone-800"
              onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}33`)}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
            <p className="text-[11.5px] text-stone-400 dark:text-stone-500 mt-1.5">Bấm vào thông báo sẽ điều hướng tới đường dẫn này, nếu có.</p>
          </div>
        </div>

        {/* Nút gửi */}
        <button
          type="submit" disabled={sending}
          className="inline-flex items-center justify-center w-full md:w-auto gap-2 rounded-full px-5 h-11 text-[13.5px]
                     font-bold text-white active:scale-[0.98] transition-all disabled:opacity-60 self-start shadow-sm"
          style={{ backgroundColor: ACCENT }}
        >
          <Send className="w-4 h-4" />
          Gửi thông báo
        </button>
      </form>

      {/* ---------- Lịch sử ---------- */}
      <div className="bg-white dark:bg-stone-900 rounded-[28px] border border-stone-100 dark:border-stone-800
                       shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)] overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 sm:px-6 py-4 border-b border-stone-100 dark:border-stone-800">
          <History className="w-4 h-4 text-stone-400 dark:text-stone-500" />
          <h3 className="text-[13.5px] font-bold text-stone-800 dark:text-stone-100">Đã gửi gần đây</h3>
        </div>

        <div className="max-h-[55vh] overflow-y-auto" data-lenis-prevent>
          {historyLoading && (
            <div className="flex flex-col items-center justify-center gap-2.5 py-14 text-stone-400 dark:text-stone-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-[12.5px]">Đang tải…</span>
            </div>
          )}

          {!historyLoading && history.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-stone-50 dark:bg-stone-800 flex items-center justify-center">
                <Inbox className="w-5 h-5 text-stone-300 dark:text-stone-600" />
              </div>
              <p className="text-[13px] text-stone-400 dark:text-stone-500">Chưa gửi thông báo chung nào.</p>
            </div>
          )}

          {!historyLoading && history.map((h, i) => (
            <div
              key={h.id}
              className={`px-5 sm:px-6 py-4 flex items-start gap-3 ${i !== history.length - 1 ? "border-b border-stone-50 dark:border-stone-800/70" : ""}`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: `${ACCENT}0F` }}
              >
                {justSentId === h.id
                  ? <CheckCircle2 className="w-4 h-4" style={{ color: ACCENT }} />
                  : <Megaphone className="w-3.5 h-3.5" style={{ color: ACCENT }} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13.5px] font-semibold text-stone-800 dark:text-stone-100 leading-snug">{h.title}</p>
                  <span className="text-[11px] text-stone-400 dark:text-stone-500 flex-shrink-0 whitespace-nowrap mt-0.5">
                    {relativeTime(h.created_at)}
                  </span>
                </div>
                <p className="text-[12.5px] text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">{h.message}</p>
                {h.link && (
                  <p className="text-[11.5px] font-medium mt-1.5 truncate" style={{ color: ACCENT }}>
                    ↳ {h.link}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmSheet
        open={confirmOpen}
        title={title.trim()}
        busy={sending}
        onCancel={() => !sending && setConfirmOpen(false)}
        onConfirm={handleConfirmSend}
      />
    </div>
  );
}