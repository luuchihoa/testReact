import React, { useState, useCallback, useEffect, useRef } from "react";
import { Megaphone, Link2, Send, History, Clock, CheckCircle2, Inbox, AlertCircle, Users, Mail, Eye, Bell, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminContext } from "./AdminContext.jsx";
import { sendBroadcastNotification, fetchRecentBroadcasts, sendNewsletter, deleteBroadcast, fetchSubscriberCount } from "./dataLayer.js";
import { Spinner } from "../../components/ui/Skeleton.jsx";

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

// Circular Progress cho đếm ký tự
const CircularProgress = ({ value, max }) => {
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(value / max, 1);
  const strokeDashoffset = circumference - percent * circumference;
  
  const isNearLimit = percent > 0.85;
  const isOverLimit = percent >= 1;

  return (
    <div className="relative flex items-center justify-center w-6 h-6">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 24 24">
        <circle
          cx="12" cy="12" r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-stone-200 dark:text-stone-800"
        />
        <circle
          cx="12" cy="12" r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`transition-all duration-300 ease-out ${isOverLimit ? 'text-red-500' : isNearLimit ? 'text-amber-500' : 'text-amber-600 dark:text-amber-400'}`}
        />
      </svg>
      {isNearLimit && !isOverLimit && (
        <span className="absolute text-[8px] font-bold text-amber-600 dark:text-amber-400">
          {max - value}
        </span>
      )}
      {isOverLimit && (
        <span className="absolute text-[8px] font-bold text-red-500">
          0
        </span>
      )}
    </div>
  );
};

/* ============================================================
   MODAL XÁC NHẬN (BOTTOM SHEET TRÊN MOBILE)
   ============================================================ */
const ConfirmSheet = React.memo(({ open, title, audience, onCancel, onConfirm, busy }) => {
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
            initial={{ y: "100%", opacity: 0.5, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full sm:w-[440px] sm:mx-4 bg-white/95 dark:bg-[#1C1917]/95 backdrop-blur-xl rounded-t-[32px] sm:rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-2xl pb-[calc(env(safe-area-inset-bottom)+24px)] sm:pb-6 pt-3 sm:pt-7 px-6 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-700" />
            <div className="sm:hidden mx-auto mb-5 h-1.5 w-12 rounded-full bg-stone-300 dark:bg-stone-700" />
            
            <div className="flex flex-col items-center text-center gap-4 pt-2 sm:pt-0">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1, bounce: 0.5 }}
                className="w-16 h-16 rounded-full flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30"
              >
                {audience === "all" ? (
                  <Mail className="w-8 h-8 text-amber-700 dark:text-amber-400" />
                ) : (
                  <Bell className="w-8 h-8 text-amber-700 dark:text-amber-400" />
                )}
              </motion.div>
              <div>
                <h4 className="text-[20px] font-extrabold text-amber-950 dark:text-amber-50 font-serif mb-2">
                  {audience === "all" ? "Gửi Newsletter (Email)?" : "Gửi thông báo Hệ thống?"}
                </h4>
                <p className="text-[14px] font-medium text-stone-500 dark:text-stone-400 leading-relaxed px-2">
                  Thông báo <span className="font-bold text-amber-900 dark:text-amber-200">"{title}"</span> sẽ 
                  {audience === "all" ? " được tự động gửi qua Email tới toàn bộ người đăng ký." : " hiển thị trong chuông thông báo của toàn bộ Giáo lý viên trên Web."}
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
                className="relative overflow-hidden inline-flex flex-1 items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-sm transition-all duration-300 active:scale-[0.98] md:hover:opacity-90 disabled:opacity-80 disabled:cursor-not-allowed group"
              >
                {!busy && (
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
                )}
                {busy && <Spinner className="w-4 h-4" />}
                {busy ? "Đang gửi…" : "Xác nhận gửi"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

const DeleteConfirmSheet = React.memo(({ open, onCancel, onConfirm, busy }) => {
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
            initial={{ y: "100%", opacity: 0.5, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full sm:w-[440px] sm:mx-4 bg-white/95 dark:bg-[#1C1917]/95 backdrop-blur-xl rounded-t-[32px] sm:rounded-[28px] border border-red-900/10 dark:border-red-100/10 shadow-2xl pb-[calc(env(safe-area-inset-bottom)+24px)] sm:pb-6 pt-3 sm:pt-7 px-6 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-700" />
            <div className="sm:hidden mx-auto mb-5 h-1.5 w-12 rounded-full bg-stone-300 dark:bg-stone-700" />
            
            <div className="flex flex-col items-center text-center gap-4 pt-2 sm:pt-0">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1, bounce: 0.5 }}
                className="w-16 h-16 rounded-full flex items-center justify-center bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30"
              >
                <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
              </motion.div>
              <div>
                <h4 className="text-[20px] font-extrabold text-red-950 dark:text-red-50 font-serif mb-2">
                  Xoá thông báo này?
                </h4>
                <p className="text-[14px] font-medium text-stone-500 dark:text-stone-400 leading-relaxed px-2">
                  Thông báo sẽ bị xoá vĩnh viễn khỏi Lịch sử và chuông thông báo của người dùng. Hành động này không thể hoàn tác.
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
                className="relative overflow-hidden inline-flex flex-1 items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold bg-red-600 text-white shadow-sm transition-all duration-300 active:scale-[0.98] md:hover:opacity-90 disabled:opacity-80 disabled:cursor-not-allowed group"
              >
                {!busy && (
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
                )}
                {busy && <Spinner className="w-4 h-4" />}
                {busy ? "Đang xoá…" : "Xác nhận xoá"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});
// Các thẻ input được tách ra để tái sử dụng hiệu ứng Glow
const InputGlow = ({ children }) => (
  <div className="relative group rounded-xl">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-amber-700 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition duration-500"></div>
    <div className="relative">
      {children}
    </div>
  </div>
);

export default function BroadcastTab() {
  const { showToast } = useAdminContext();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [audience, setAudience] = useState("all"); // "all" | "teacher"
  
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [justSentId, setJustSentId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [subscriberCount, setSubscriberCount] = useState(0);

  // Layout Right Column State
  const [activeTab, setActiveTab] = useState("preview"); // "preview" | "history"

  const messageRef = useRef(null);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await fetchRecentBroadcasts();
      setHistory(data);
      return data;
    } catch (err) {
      console.error("load broadcast history error:", err);
      showToast("Không tải được lịch sử thông báo", "error");
      return [];
    } finally {
      setHistoryLoading(false);
    }
  }, [showToast]);

  const loadSubscriberCount = useCallback(async () => {
    try {
      const count = await fetchSubscriberCount();
      setSubscriberCount(count);
    } catch (err) {
      console.error("load subscriber count error:", err);
    }
  }, []);

  useEffect(() => { 
    loadHistory(); 
    loadSubscriberCount();
  }, [loadHistory, loadSubscriberCount]);

  const confirmDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const executeDeleteBroadcast = async () => {
    const id = deleteConfirmId;
    if (!id) return;
    setDeletingId(id);
    try {
      await deleteBroadcast(id);
      showToast("Đã xoá thông báo", "success");
      setHistory(prev => prev.filter(h => h.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("delete broadcast error:", err);
      showToast(err?.message || "Lỗi khi xoá", "error");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const el = messageRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [message]);

  const requestSend = useCallback((e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) { 
      showToast("Cần nhập đủ tiêu đề và nội dung", "warning"); 
      return; 
    }
    setConfirmOpen(true);
  }, [title, message, showToast]);

  const handleConfirmSend = useCallback(async () => {
    setSending(true);
    try {
      if (audience === "all") {
        await sendNewsletter(title.trim(), message.trim(), link.trim());
        showToast("Đã gửi Newsletter thành công", "success");
      } else {
        await sendBroadcastNotification(title.trim(), message.trim(), link.trim());
        showToast("Đã gửi thông báo nội bộ thành công", "success");
      }
      
      setTitle(""); 
      setMessage(""); 
      setLink("");
      setConfirmOpen(false);
      
      const newData = await loadHistory();
      if (newData.length > 0) {
        setJustSentId(newData[0].id);
        setActiveTab("history"); // Tự động nhảy sang tab lịch sử để xem
        setTimeout(() => setJustSentId(null), 4000);
      }
      
    } catch (err) {
      console.error("send broadcast error:", err);
      showToast(err?.message || "Gửi thông báo thất bại", "error");
      setConfirmOpen(false);
    } finally {
      setSending(false);
    }
  }, [audience, title, message, link, loadHistory, showToast]);



  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: APPLE_EASE }}
      className="pb-24 sm:pb-0 h-full flex flex-col"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-amber-50 dark:bg-amber-900/20 border border-amber-900/5 dark:border-amber-100/5 shadow-sm">
          <Megaphone className="w-5 h-5 text-amber-800 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-amber-950 dark:text-amber-50 font-serif leading-tight">Soạn thông báo khẩn</h3>
          <p className="text-[13px] font-medium text-stone-500 dark:text-stone-400 mt-0.5">
            Gửi Newsletter qua Email hoặc thông báo trên Web.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1 min-h-0">
        
        {/* ============================================================
            CỘT TRÁI: FORM SOẠN THẢO
            ============================================================ */}
        <div className="flex-1 max-w-[600px] flex flex-col gap-6 w-full mx-auto lg:mx-0">
          <form
            onSubmit={requestSend}
            className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm p-6 sm:p-7 flex flex-col gap-6"
          >
            {/* Segmented Control */}
            <div className="flex bg-stone-100/80 dark:bg-stone-800/80 p-1.5 rounded-2xl relative shadow-inner">
              <div 
                className="absolute inset-y-1.5 w-[calc(50%-6px)] bg-white dark:bg-stone-700 rounded-xl shadow-sm border border-stone-200/50 dark:border-stone-600/50 transition-all duration-300 ease-spring"
                style={{ left: audience === 'all' ? '6px' : 'calc(50%)' }}
              />
              <button 
                type="button"
                onClick={() => setAudience('all')}
                className={`relative z-10 flex-1 py-3 text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 transition-colors duration-300 ${audience === 'all' ? 'text-amber-900 dark:text-amber-400' : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'}`}
              >
                <Mail className="w-4 h-4" />
                Email ({subscriberCount > 0 ? subscriberCount : 'Tất cả'})
              </button>
              <button 
                type="button"
                onClick={() => setAudience('teacher')}
                className={`relative z-10 flex-1 py-3 text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 transition-colors duration-300 ${audience === 'teacher' ? 'text-amber-900 dark:text-amber-400' : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'}`}
              >
                <Bell className="w-4 h-4" />
                Bảng tin
              </button>
            </div>

            {/* Tiêu đề */}
            <label className="flex flex-col gap-2">
              <div className="flex items-center justify-between ml-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70">Tiêu đề thông báo</span>
                <CircularProgress value={title.length} max={TITLE_MAX} />
              </div>
              <InputGlow>
                <input
                  type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Thông báo nghỉ học tuần này do thời tiết xấu"
                  maxLength={TITLE_MAX}
                  className="w-full rounded-xl border border-amber-900/10 dark:border-amber-100/10 bg-white/50 dark:bg-stone-900/50 px-4 py-3.5 text-[14px] font-medium text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-600/50 transition-all"
                />
              </InputGlow>
            </label>

            {/* Nội dung */}
            <label className="flex flex-col gap-2">
              <div className="flex items-center justify-between ml-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70">Nội dung chi tiết</span>
                <CircularProgress value={message.length} max={MESSAGE_MAX} />
              </div>
              <InputGlow>
                <textarea
                  ref={messageRef}
                  value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nội dung rõ ràng, ngắn gọn và đầy đủ ý..."
                  rows={5} maxLength={MESSAGE_MAX}
                  className="w-full rounded-xl border border-amber-900/10 dark:border-amber-100/10 bg-white/50 dark:bg-stone-900/50 px-4 py-3.5 text-[14px] font-medium leading-relaxed text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 resize-none outline-none focus:ring-2 focus:ring-amber-600/50 transition-all min-h-[120px]"
                />
              </InputGlow>
            </label>

            {/* Đường dẫn */}
            <label className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 ml-1">
                <Link2 className="w-3.5 h-3.5" /> Đường dẫn đính kèm <span className="normal-case tracking-normal font-medium text-stone-400 dark:text-stone-500 ml-1">(Tuỳ chọn)</span>
              </div>
              <InputGlow>
                <input
                  type="text" value={link} onChange={(e) => setLink(e.target.value)}
                  placeholder="VD: https://..."
                  className="w-full rounded-xl border border-amber-900/10 dark:border-amber-100/10 bg-white/50 dark:bg-stone-900/50 px-4 py-3.5 text-[14px] font-medium text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-600/50 transition-all"
                />
              </InputGlow>
            </label>

            <button
              type="submit" disabled={sending}
              className="mt-2 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-[14px] font-bold bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-md shadow-amber-900/20 transition-all duration-300 active:scale-[0.98] md:hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed w-full"
            >
              <Send className="w-4.5 h-4.5" />
              Phát thông báo ngay
            </button>
          </form>
        </div>

        {/* ============================================================
            CỘT PHẢI: PREVIEW & HISTORY
            ============================================================ */}
        <div className="flex-1 flex flex-col min-h-[500px]">
          {/* Header Tabs của Cột Phải */}
          <div className="flex items-center gap-1 bg-stone-200/50 dark:bg-stone-800/50 p-1 rounded-t-2xl w-max self-start ml-2 mb-[-1px] relative z-10">
            <button 
              onClick={() => setActiveTab("preview")}
              className={`px-4 py-2 text-[12px] font-bold rounded-t-xl transition-colors ${activeTab === 'preview' ? 'bg-white dark:bg-[#1C1917] text-amber-900 dark:text-amber-400 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]' : 'text-stone-500 hover:text-stone-700'}`}
            >
              <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5"/> Live Preview</span>
            </button>
            <button 
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 text-[12px] font-bold rounded-t-xl transition-colors ${activeTab === 'history' ? 'bg-white dark:bg-[#1C1917] text-amber-900 dark:text-amber-400 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]' : 'text-stone-500 hover:text-stone-700'}`}
            >
              <span className="flex items-center gap-1.5"><History className="w-3.5 h-3.5"/> Lịch sử gửi</span>
            </button>
          </div>

          {/* Nội dung Cột Phải */}
          <div className="flex-1 bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[28px] rounded-tl-none lg:rounded-tl-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm overflow-hidden flex flex-col relative">
            
            <AnimatePresence mode="wait">
              {/* === TAB: LIVE PREVIEW === */}
              {activeTab === "preview" && (
                <motion.div 
                  key="preview"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex flex-col p-6 sm:p-8 bg-stone-50/50 dark:bg-black/20 overflow-y-auto"
                >
                  <div className="mx-auto w-full max-w-[400px]">
                    <div className="text-center mb-6 text-stone-400 text-[12px] font-medium tracking-wide uppercase">
                      Mô phỏng hiển thị
                    </div>
                    {/* Mockup Card */}
                    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl shadow-black/5 border border-stone-200/50 dark:border-stone-800 overflow-hidden relative">
                      {/* Thẻ Header của Mockup */}
                      <div className={`h-2 ${audience === 'all' ? 'bg-gradient-to-r from-amber-600 to-amber-800' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`} />
                      
                      <div className="p-5 flex flex-col gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${audience === 'all' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-600'}`}>
                            {audience === 'all' ? <Mail className="w-5 h-5"/> : <Bell className="w-5 h-5"/>}
                          </div>
                          <div>
                            <div className="font-bold text-stone-900 dark:text-white text-[15px] leading-tight">Ban Giáo Lý</div>
                            <div className="text-[12px] text-stone-500 mt-0.5">Vừa xong</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-stone-800 dark:text-stone-100 text-[15px] mb-1.5 break-words">
                            {title || "Tiêu đề thông báo sẽ hiển thị ở đây"}
                          </h4>
                          <p className="text-[14px] text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-wrap break-words">
                            {message || "Nội dung chi tiết của thông báo sẽ được hiển thị ở khu vực này, giúp người đọc nắm bắt thông tin nhanh chóng."}
                          </p>
                        </div>

                        {link && (
                          <div className="mt-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                            <div className="inline-flex items-center gap-2 px-3 py-2 bg-stone-100 dark:bg-stone-800 rounded-lg text-[13px] font-medium text-amber-700 dark:text-amber-400 w-fit max-w-full">
                              <Link2 className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{link}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* === TAB: HISTORY === */}
              {activeTab === "history" && (
                <motion.div 
                  key="history"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex flex-col"
                >
                  <div className="flex-1 overflow-y-auto" data-lenis-prevent>
                    {historyLoading ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-16 text-amber-900 dark:text-amber-500 h-full">
                        <Spinner className="w-5 h-5" />
                        <span className="text-[14px] font-medium">Đang tải lịch sử…</span>
                      </div>
                    ) : history.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center h-full">
                        <div className="w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center border border-black/5 dark:border-white/5">
                          <Inbox className="w-6 h-6 text-stone-400 dark:text-stone-500" />
                        </div>
                        <p className="text-[14px] font-medium text-stone-500 dark:text-stone-400">Hệ thống chưa ghi nhận thông báo chung nào.</p>
                      </div>
                    ) : (
                      <div className="relative p-6 sm:p-8">
                        {/* Trục dọc Timeline */}
                        <div className="absolute left-[39px] sm:left-[47px] top-8 bottom-8 w-0.5 bg-stone-200 dark:bg-stone-800" />
                        
                        <div className="flex flex-col gap-6 relative">
                          {history.map((h, i) => (
                            <motion.div
                              key={h.id}
                              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05, ease: APPLE_EASE }}
                              className={`flex items-start gap-4 sm:gap-6 group relative`}
                            >
                              {/* Cục tròn Timeline */}
                              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 bg-white dark:bg-stone-900 shadow-sm relative z-10 transition-colors duration-500 ${justSentId === h.id ? "border-emerald-500 text-emerald-500" : "border-stone-300 dark:border-stone-700 text-stone-400 group-hover:border-amber-500 group-hover:text-amber-600 dark:group-hover:text-amber-400"}`}>
                                {h.type === 'email' ? <Mail className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <Megaphone className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
                              </div>

                              {/* Card Nội dung */}
                              <div className={`flex-1 min-w-0 bg-stone-50/80 dark:bg-stone-800/40 rounded-2xl p-4 sm:p-5 border shadow-sm transition-all duration-300 hover:shadow-md ${justSentId === h.id ? "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-900/10" : "border-stone-200 dark:border-stone-800/50 hover:border-amber-900/20 dark:hover:border-amber-100/20"}`}>
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                  <p className="text-[14px] sm:text-[15px] font-bold text-stone-900 dark:text-stone-100 leading-snug">
                                    {h.type === 'email' ? (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 mr-2 uppercase tracking-wider">
                                        <Mail className="w-2.5 h-2.5" /> Gửi qua Email
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300 mr-2 uppercase tracking-wider">
                                        <Megaphone className="w-2.5 h-2.5" /> Gửi lên Web
                                      </span>
                                    )}
                                    {h.title}
                                  </p>
                                  <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                                      <Clock className="w-3 h-3" /> {relativeTime(h.created_at)}
                                    </span>
                                    <button 
                                      onClick={() => confirmDelete(h.id)}
                                      disabled={deletingId === h.id}
                                      className="text-stone-400 hover:text-red-500 transition-colors p-1.5 -mr-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                                      title="Xoá thông báo"
                                    >
                                      {deletingId === h.id ? <Spinner className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                </div>
                                <p className="text-[13px] sm:text-[14px] text-stone-600 dark:text-stone-300 leading-relaxed">{h.message}</p>
                                {h.link && (
                                  <a href={h.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-[12px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg hover:underline underline-offset-2 max-w-full">
                                    <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span className="truncate">{h.link}</span>
                                  </a>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <ConfirmSheet
        open={confirmOpen}
        title={title}
        audience={audience}
        busy={sending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSend}
      />

      <DeleteConfirmSheet
        open={!!deleteConfirmId}
        busy={!!deletingId}
        onCancel={() => setDeleteConfirmId(null)}
        onConfirm={executeDeleteBroadcast}
      />
    </motion.div>
  );
}