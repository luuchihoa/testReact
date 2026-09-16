import React, { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { 
  Bell, GraduationCap, Newspaper, Megaphone, Clock, CheckCheck, Inbox 
} from "lucide-react";
import { supabase } from "../../../lib/supabase.js";
import { useToast } from "../../../components/ui/ToastContext.jsx";
import { pressable } from "../../../components/ui/variant.jsx";
import { Spinner } from "./SharedComponents.jsx";
import { normalizeNotificationLink } from "../utils.js";

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

const FilterButton = ({ active, label, count, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative px-4 py-2 text-[13px] font-bold rounded-full transition-all flex items-center justify-center gap-2 shrink-0 snap-start ${
      active 
        ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-xs" 
        : "bg-[#fffefa] text-[#575e55] hover:text-[#293d32] dark:bg-[#1e2821] dark:text-[#b0b9ac] dark:hover:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237]"
    }`}
  >
    {label}
    {count > 0 && (
      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black tracking-wider ${
        active 
          ? "bg-white/20 text-white dark:bg-black/20 dark:text-[#19251d]" 
          : "bg-stone-500/10 text-[#575e55] dark:bg-stone-400/15 dark:text-[#b0b9ac]"
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
    const targetLink = normalizeNotificationLink(notif.link, notif);
    if (targetLink) {
      navigate(targetLink);
    }
  };

  const getIconInfo = (type) => {
    if (type === "diem" || type?.startsWith("tong_ket")) {
      return {
        icon: <GraduationCap className="w-5 h-5" strokeWidth={2} />,
        bg: "bg-[#314e3e]/10 dark:bg-[#d4b47d]/20 text-[#314e3e] dark:text-[#d4b47d]"
      };
    }
    if (type === "bai_viet") {
      return {
        icon: <Newspaper className="w-5 h-5" strokeWidth={2} />,
        bg: "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
      };
    }
    if (type === "broadcast") {
      return {
        icon: <Megaphone className="w-5 h-5" strokeWidth={2} />,
        bg: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
      };
    }
    return {
      icon: <Bell className="w-5 h-5" strokeWidth={2} />,
      bg: "bg-stone-500/10 dark:bg-stone-400/15 text-[#575e55] dark:text-[#b0b9ac]"
    };
  };

  const iconInfo = getIconInfo(notif.type);

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleClick}
      className={`relative p-4 rounded-2xl cursor-pointer transition-all border ${
        isUnread
          ? "bg-[#fffefa] dark:bg-[#1e2821] border-[#dedfd4] dark:border-[#354237] shadow-xs border-l-[3.5px] border-l-[#314e3e] dark:border-l-[#d4b47d]"
          : "bg-[#faf8f3]/60 dark:bg-[#151c18]/60 border-[#dedfd4]/60 dark:border-[#354237]/60 opacity-85 hover:opacity-100"
      }`}
    >
      <div className="flex gap-3.5 items-start">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconInfo.bg} border border-[#dedfd4]/50 dark:border-[#354237]/50`}>
          {iconInfo.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className={`text-[14.5px] font-bold truncate ${isUnread ? "text-[#293d32] dark:text-[#ecece0]" : "text-[#575e55] dark:text-[#b0b9ac]"}`}>
              {notif.title}
            </h3>
            {isUnread && (
              <span className="w-2 h-2 rounded-full bg-[#314e3e] dark:bg-[#d4b47d] shrink-0" />
            )}
          </div>
          <p className="text-[13.5px] text-[#575e55] dark:text-[#b0b9ac] line-clamp-2 leading-relaxed">
            {notif.message}
          </p>
          <div className="mt-2 text-[11.5px] font-medium text-[#575e55]/70 dark:text-[#b0b9ac]/70 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{getTimeAgo(notif.created_at)}</span>
          </div>
        </div>
      </div>
    </Motion.div>
  );
};

export function NotificationTab({ navigate, user }) {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [filter, setFilter] = useState("all");

  const isStudent = user?.role === "student";

  useEffect(() => {
    let isCancelled = false;

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase.rpc("get_my_notifications", { p_limit: 100 });
        if (isCancelled) return;
        if (error) throw error;
        setNotifications(data || []);
      } catch (err) {
        if (!isCancelled) {
          console.error(err);
          showToast("Không thể tải thông báo", "error");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

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
      isCancelled = true;
      supabase.removeChannel(channel);
    };
  }, [showToast]);

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
    <div className="w-full max-w-2xl mx-auto space-y-5 pb-8">
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[16px] md:text-[17px] font-bold text-[#293d32] dark:text-[#ecece0]">
            Thông báo của bạn
          </h2>
          {unreadCount > 0 && (
            <Motion.button
              {...pressable()}
              onClick={markAllAsRead}
              disabled={marking}
              aria-label="Đánh dấu tất cả là đã đọc"
              className="text-[13px] font-bold text-[#314e3e] dark:text-[#d4b47d] hover:underline px-2 py-1 flex items-center justify-center gap-1.5 shrink-0 transition-opacity disabled:opacity-50"
            >
              {marking ? <Spinner className="w-3.5 h-3.5" /> : <CheckCheck className="w-4 h-4" />}
              <span>Đánh dấu đã đọc</span>
            </Motion.button>
          )}
        </div>

        <div className="relative w-full overflow-hidden">
          <div 
            className="flex overflow-x-auto gap-2 pb-1.5 pt-0.5 px-0.5 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
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
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-stone-500/5 dark:bg-stone-400/5 rounded-2xl animate-pulse border border-[#dedfd4] dark:border-[#354237]" />
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
          <Motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center text-center py-14 px-4 bg-[#fffefa] dark:bg-[#1e2821] rounded-3xl border border-dashed border-[#dedfd4] dark:border-[#354237]"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#314e3e]/10 dark:bg-[#d4b47d]/20 flex items-center justify-center text-[#314e3e] dark:text-[#d4b47d] mb-3 border border-[#dedfd4] dark:border-[#354237]">
              <Inbox className="w-7 h-7" strokeWidth={1.75} />
            </div>
            <h3 className="text-[15px] font-bold text-[#293d32] dark:text-[#ecece0] mb-1">
              Chưa có thông báo nào
            </h3>
            <p className="text-[13px] text-[#575e55] dark:text-[#b0b9ac] max-w-xs">
              {filter !== "all" ? "Không có thông báo phù hợp với bộ lọc." : "Bạn đã xem hết tất cả thông báo."}
            </p>
          </Motion.div>
        )}
      </div>
    </div>
  );
}
