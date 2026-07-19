import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../lib/supabase.js";
import { useToast } from "../../../components/ui/ToastContext.jsx";
import { pressable } from "../../../components/ui/variant.jsx";

const FilterButton = ({ active, label, count, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative px-4 py-2 text-sm font-bold rounded-full transition-all flex items-center justify-center gap-2 shrink-0 snap-start ${
      active 
        ? "bg-amber-900 text-white dark:bg-amber-600 shadow-md scale-105" 
        : "bg-white text-stone-500 hover:bg-stone-50 hover:text-stone-700 dark:bg-stone-800/40 dark:text-stone-400 dark:hover:bg-stone-800/80 dark:hover:text-stone-200 border border-stone-200 dark:border-white/5"
    }`}
  >
    {label}
    {count > 0 && (
      <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-black tracking-widest ${
        active ? "bg-white/20 text-white" : "bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300"
      }`}>
        {count > 99 ? "99+" : count}
      </span>
    )}
  </button>
);

const NotificationItem = ({ notif, navigate, markAsRead, loading }) => {
  const isUnread = !notif.read;

  const handleClick = async () => {
    if (loading) return;
    if (isUnread) {
      await markAsRead(notif.id);
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const getIcon = (type) => {
    if (type === "diem" || type?.startsWith("tong_ket")) return "📝";
    if (type === "bai_viet") return "📰";
    if (type === "broadcast") return "📢";
    return "🔔";
  };

  const getTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`relative p-4 rounded-2xl cursor-pointer transition-all border ${
        isUnread
          ? "bg-white dark:bg-stone-800 border-amber-200 dark:border-amber-900/30 shadow-md shadow-amber-900/5"
          : "bg-white/60 dark:bg-stone-800/40 border-stone-100 dark:border-white/5 opacity-80 hover:opacity-100"
      }`}
    >
      {isUnread && (
        <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
      )}
      
      <div className="flex gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${
          isUnread 
            ? "bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-400" 
            : "bg-stone-100 dark:bg-stone-800/80 text-stone-500"
        }`}>
          {getIcon(notif.type)}
        </div>
        
        <div className="flex-1 min-w-0 pr-6">
          <h4 className={`text-[15px] font-bold mb-1 truncate ${isUnread ? "text-stone-900 dark:text-white" : "text-stone-700 dark:text-stone-300"}`}>
            {notif.title}
          </h4>
          <p className="text-[14px] text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
            {notif.message}
          </p>
          <div className="mt-2 text-[12px] font-medium text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
            <span>⏱</span> {getTimeAgo(notif.created_at)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export function NotificationTab({ navigate, user }) {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [filter, setFilter] = useState("all");

  const isStudent = user?.role === "student";

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase.rpc("get_my_notifications", { p_limit: 100 });
      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
      showToast("Không thể tải thông báo", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const channel = supabase.channel("notification_tab_changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, () => {
        fetchNotifications();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "notifications" }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      setMarking(true);
      const { error } = await supabase.rpc("mark_notification_read", { p_notification_id: id });
      if (error) throw error;
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setMarking(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setMarking(true);
      const { error } = await supabase.rpc("mark_all_notifications_read");
      if (error) throw error;
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      showToast("Đã đánh dấu tất cả là đã đọc", "success");
    } catch (err) {
      console.error(err);
      showToast("Có lỗi xảy ra", "error");
    } finally {
      setMarking(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "grades") return n.type === "diem" || n.type?.startsWith("tong_ket");
    if (filter === "system") return n.type === "system" || n.type === "broadcast" || n.type === "bai_viet";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-200">Quản lý Thông báo</h2>
          {unreadCount > 0 && (
            <motion.button
              {...pressable()}
              onClick={markAllAsRead}
              disabled={marking}
              className="text-[13px] font-bold text-amber-600 dark:text-amber-400 hover:underline px-2 py-1 flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>✓✓</span> Đánh dấu đã đọc
            </motion.button>
          )}
        </div>

        <div className="relative w-full overflow-hidden">
          <div 
            className="flex overflow-x-auto gap-2 pb-2 pt-1 px-1 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style dangerouslySetInnerHTML={{__html: `div::-webkit-scrollbar { display: none; }`}} />
            <FilterButton active={filter === "all"} label="Tất cả" onClick={() => setFilter("all")} />
            <FilterButton active={filter === "unread"} label="Chưa đọc" count={unreadCount} onClick={() => setFilter("unread")} />
            {isStudent && (
              <FilterButton active={filter === "grades"} label="Học tập" onClick={() => setFilter("grades")} />
            )}
            <FilterButton active={filter === "system"} label="Hệ thống" onClick={() => setFilter("system")} />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-stone-200/50 dark:bg-stone-800/50 rounded-2xl animate-pulse" />
          ))
        ) : filteredNotifications.length > 0 ? (
          <AnimatePresence>
            {filteredNotifications.map((notif) => (
              <NotificationItem
                key={notif.id}
                notif={notif}
                navigate={navigate}
                markAsRead={markAsRead}
                loading={marking}
              />
            ))}
          </AnimatePresence>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white/40 dark:bg-stone-800/20 rounded-3xl border border-dashed border-stone-300 dark:border-stone-700"
          >
            <div className="text-5xl mb-4 opacity-50">📭</div>
            <h3 className="text-[16px] font-bold text-stone-700 dark:text-stone-300 mb-1">
              Chưa có thông báo nào
            </h3>
            <p className="text-[14px] text-stone-500 dark:text-stone-500">
              {filter !== "all" ? "Không có thông báo phù hợp với bộ lọc." : "Bạn đã xem hết tất cả thông báo."}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
