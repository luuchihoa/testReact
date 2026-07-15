import React, { useState, useCallback, useEffect, useRef } from "react";
import { Megaphone, Link2, Send, History, Clock, CheckCircle2, Inbox, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminContext } from "./AdminContext.jsx";
import { sendBroadcastNotification, fetchRecentBroadcasts } from "./dataLayer.js";
import { Spinner } from "../ui/Skeleton.jsx";

// Hằng số Easing chuẩn
const APPLE_EASE = [0.16, 1, 0.3, 1];

const TITLE_MAX = 120;
const MESSAGE_MAX = 1000;

function relativeTime(iso) {
  if (!iso) return "Không xác định";
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "Vừa xong";
  if (min < 60) return `${min} phút trước`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day} ngày trước`;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/* ============================================================
   MODAL XÁC NHẬN (BOTTOM SHEET TRÊN MOBILE)
   ============================================================ */
// Bọc bằng React.memo để tránh re-render khi gõ phím ở form bên ngoài
const ConfirmSheet = React.memo(({ open, title, onCancel, onConfirm, busy }) => {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-stone-900/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={busy ? undefined : onCancel}
          />
          <motion.div
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: APPLE_EASE }}
            className="relative w-full sm:w-[440px] sm:mx-4 bg-white/95 dark:bg-[#1C1917]/95 backdrop-blur-xl rounded-t-[32px] sm:rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-2xl pb-[calc(env(safe-area-inset-bottom)+24px)] sm:pb-6 pt-3 sm:pt-7 px-6"
          >
            <div className="sm:hidden mx-auto mb-5 h-1.5 w-12 rounded-full bg-stone-300 dark:bg-stone-700" />
            <div className="flex flex-col items-center text-center gap-4 pt-2 sm:pt-0">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30">
                <Megaphone className="w-6 h-6 text-amber-700 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="text-[20px] font-extrabold text-amber-950 dark:text-amber-50 font-serif mb-2">Gửi cho toàn bộ hệ thống?</h4>
                <p className="text-[14px] font-medium text-stone-500 dark:text-stone-400 leading-relaxed px-2">
                  Thông báo <span className="font-bold text-amber-900 dark:text-amber-200">"{title}"</span> sẽ hiển thị ngay lập tức trong chuông thông báo của tất cả Học sinh, Giáo viên và Quản trị viên.
                </p>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8">
              <button
                type="button"
                onClick={onCancel}
                disabled={busy}
                className="inline-flex flex-1 items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-black/5 dark:border-white/5 transition-all duration-300 active:scale-[0.98] md:hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-50"
              >
                Huỷ bỏ
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={busy}
                className="inline-flex flex-1 items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-sm transition-all duration-300 active:scale-[0.98] md:hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy && <Spinner className="w-4 h-4" />}
                {busy ? "Đang gửi…" : "Phát thông báo"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

export default function BroadcastTab() {
  const { showToast } = useAdminContext();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  
  // Sửa lỗi State không được sử dụng
  const [justSentId, setJustSentId] = useState(null);

  const messageRef = useRef(null);
  
  // Khắc phục lỗi Responsive bằng State động
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await fetchRecentBroadcasts();
      setHistory(data);
      return data; // Trả về data để dùng ngay lập tức
    } catch (err) {
      console.error("load broadcast history error:", err);
      showToast("Không tải được lịch sử thông báo", "error");
      return [];
    } finally {
      setHistoryLoading(false);
    }
  }, [showToast]);

  useEffect(() => { 
    loadHistory(); 
  }, [loadHistory]);

  // Tự động điều chỉnh chiều cao textarea
  useEffect(() => {
    const el = messageRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [message]);

  // Bọc useCallback để tối ưu bộ nhớ
  const requestSend = useCallback((e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) { 
      showToast("Cần nhập đủ tiêu đề và nội dung", "warning"); 
      return; 
    }
    setConfirmOpen(true);
  }, [title, message, showToast]);

  // Bọc useCallback và bổ sung logic hiển thị hiệu ứng thành công
  const handleConfirmSend = useCallback(async () => {
    setSending(true);
    try {
      await sendBroadcastNotification(title.trim(), message.trim(), link.trim());
      showToast("Đã gửi thông báo chung thành công", "success");
      
      setTitle(""); 
      setMessage(""); 
      setLink("");
      setConfirmOpen(false);
      
      // Load lại lịch sử và lấy ID mới nhất để tạo hiệu ứng
      const newData = await loadHistory();
      if (newData.length > 0) {
        setJustSentId(newData[0].id);
        // Tự động tắt hiệu ứng CheckCircle sau 4 giây
        setTimeout(() => setJustSentId(null), 4000);
      }
      
    } catch (err) {
      console.error("send broadcast error:", err);
      showToast(err?.message || "Gửi thông báo thất bại", "error");
      setConfirmOpen(false);
    } finally {
      setSending(false);
    }
  }, [title, message, link, loadHistory, showToast]);

  const titleLeft = TITLE_MAX - title.length;
  const msgLeft = MESSAGE_MAX - message.length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: APPLE_EASE }}
      className="flex flex-col gap-6 pb-24 sm:pb-0 relative"
    >
      {/* ---------- Form soạn thông báo ---------- */}
      <form
        onSubmit={requestSend}
        className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm p-6 sm:p-7 flex flex-col gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-amber-50 dark:bg-stone-800 border border-amber-900/5 dark:border-amber-100/5 shadow-sm">
            <Megaphone className="w-5 h-5 text-amber-800 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-amber-950 dark:text-amber-50 font-serif leading-tight">Soạn thông báo khẩn</h3>
            <p className="text-[13px] font-medium text-stone-500 dark:text-stone-400 mt-0.5">
              Phát đi toàn hệ thống, ai cũng có thể đọc được.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5 mt-2">
          {/* Tiêu đề */}
          <label className="flex flex-col gap-2">
            <div className="flex items-center justify-between ml-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70">Tiêu đề thông báo</span>
              <span className={`text-[11px] font-bold tabular-nums ${titleLeft < 15 ? "text-red-500" : "text-stone-400"}`}>
                {titleLeft}
              </span>
            </div>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Thông báo nghỉ học tuần này do thời tiết xấu"
              maxLength={TITLE_MAX}
              className="w-full rounded-xl border border-amber-900/10 dark:border-amber-100/10 bg-white/50 dark:bg-stone-900/50 px-4 py-3.5 text-[14px] font-medium text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-600/50 transition-shadow"
            />
          </label>

          {/* Nội dung */}
          <label className="flex flex-col gap-2">
            <div className="flex items-center justify-between ml-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70">Nội dung chi tiết</span>
              <span className={`text-[11px] font-bold tabular-nums ${msgLeft < 80 ? "text-red-500" : "text-stone-400"}`}>
                {msgLeft}
              </span>
            </div>
            <textarea
              ref={messageRef}
              value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="Nội dung rõ ràng, ngắn gọn và đầy đủ ý..."
              rows={4} maxLength={MESSAGE_MAX}
              className="w-full rounded-xl border border-amber-900/10 dark:border-amber-100/10 bg-white/50 dark:bg-stone-900/50 px-4 py-3.5 text-[14px] font-medium leading-relaxed text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 resize-none outline-none focus:ring-2 focus:ring-amber-600/50 transition-shadow min-h-[104px]"
            />
          </label>

          {/* Đường dẫn */}
          <label className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 ml-1">
              <Link2 className="w-3.5 h-3.5" /> Đường dẫn đính kèm <span className="normal-case tracking-normal font-medium text-stone-400 dark:text-stone-500 ml-1">(Tuỳ chọn)</span>
            </div>
            <input
              type="text" value={link} onChange={(e) => setLink(e.target.value)}
              placeholder="VD: /lịch-sinh-hoạt hoặc URL bài viết"
              className="w-full rounded-xl border border-amber-900/10 dark:border-amber-100/10 bg-white/50 dark:bg-stone-900/50 px-4 py-3.5 text-[14px] font-medium text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-600/50 transition-shadow"
            />
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-stone-400 dark:text-stone-500 mt-1 ml-1">
              <AlertCircle className="w-3.5 h-3.5" /> Người đọc có thể bấm vào thông báo để chuyển hướng tới đường dẫn này.
            </div>
          </label>
        </div>

        <button
          type="submit" disabled={sending}
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-[14px] font-bold bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-sm transition-all duration-300 active:scale-[0.98] md:hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed self-start w-full md:w-auto mt-2"
        >
          <Send className="w-4 h-4" />
          Phát thông báo ngay
        </button>
      </form>

      {/* ---------- Lịch sử ---------- */}
      <div className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-amber-900/10 dark:border-amber-100/10 bg-amber-50/50 dark:bg-stone-900/50">
          <History className="w-5 h-5 text-amber-800 dark:text-amber-400" />
          <h3 className="text-[12px] font-bold text-amber-800/70 dark:text-amber-400/70 uppercase tracking-wider">Lịch sử đã gửi</h3>
        </div>

        <div className="max-h-[55vh] overflow-y-auto" data-lenis-prevent>
          <AnimatePresence mode="wait">
            {historyLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center gap-3 py-16 text-amber-900 dark:text-amber-500">
                <Spinner className="w-5 h-5" />
                <span className="text-[14px] font-medium">Đang tải lịch sử…</span>
              </motion.div>
            ) : history.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
                <div className="w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center border border-black/5 dark:border-white/5">
                  <Inbox className="w-6 h-6 text-stone-400 dark:text-stone-500" />
                </div>
                <p className="text-[14px] font-medium text-stone-500 dark:text-stone-400">Hệ thống chưa ghi nhận thông báo chung nào.</p>
              </motion.div>
            ) : (
              <div className="divide-y divide-amber-900/5 dark:divide-amber-100/5">
                {history.map((h, i) => (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 0, y: isMobile ? 16 : 0 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true, margin: isMobile ? "-20px" : "0px" }}
                    transition={{ duration: 0.5, delay: i * 0.05, ease: APPLE_EASE }}
                    className={`px-6 py-5 flex items-start gap-4 transition-colors duration-300 md:hover:bg-amber-50/40 dark:hover:bg-amber-900/10 ${justSentId === h.id ? "bg-emerald-50/30 dark:bg-emerald-900/10" : ""}`}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-white dark:bg-stone-800 border border-amber-900/10 dark:border-amber-100/10 shadow-sm mt-0.5 transition-colors duration-300">
                      {justSentId === h.id ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Megaphone className="w-4.5 h-4.5 text-amber-700 dark:text-amber-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 mb-2">
                        <p className="text-[15px] font-bold text-amber-950 dark:text-amber-50 leading-snug truncate">{h.title}</p>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex-shrink-0 whitespace-nowrap bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 w-fit">
                          <Clock className="w-3.5 h-3.5" /> {relativeTime(h.created_at)}
                        </span>
                      </div>
                      <p className="text-[13.5px] text-stone-600 dark:text-stone-300 font-medium leading-relaxed">{h.message}</p>
                      {h.link && (
                        <p className="text-[12.5px] font-bold mt-2.5 truncate text-amber-700 dark:text-amber-400 flex items-center gap-1">
                          <Link2 className="w-3.5 h-3.5" /> <span className="underline underline-offset-2 opacity-90">{h.link}</span>
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmSheet
        open={confirmOpen}
        title={title.trim()}
        busy={sending}
        onCancel={() => !sending && setConfirmOpen(false)}
        onConfirm={handleConfirmSend}
      />
    </motion.div>
  );
}