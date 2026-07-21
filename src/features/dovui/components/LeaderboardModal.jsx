import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { APPLE_EASE } from "../utils/dovuiUtils.js";

// Helper render Emoji Huy chương hoặc Số cho các vị trí còn lại
const RankBadge = ({ rank, isRank1, isRank2, isRank3, isCurrentUser }) => {
  if (isRank1) {
    return (
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 flex items-center justify-center text-[22px] shadow-lg shadow-amber-500/40 ring-2 ring-yellow-200/60 scale-105">
        🥇
      </div>
    );
  }
  if (isRank2) {
    return (
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-200 via-slate-400 to-slate-500 flex items-center justify-center text-[22px] shadow-md shadow-slate-400/30 ring-2 ring-slate-200/50">
        🥈
      </div>
    );
  }
  if (isRank3) {
    return (
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-600 via-orange-600 to-amber-800 flex items-center justify-center text-[22px] shadow-md shadow-orange-600/30 ring-2 ring-orange-300/40">
        🥉
      </div>
    );
  }
  return (
    <div
      className={`w-10 h-10 rounded-2xl text-[15px] font-black flex items-center justify-center shadow-xs ${
        isCurrentUser
          ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-amber-700/40"
          : "bg-stone-200/80 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-mono"
      }`}
    >
      #{rank}
    </div>
  );
};

const LeaderboardCard = memo(({ item, rank, isCurrentUser, isPinned = false }) => {
  const isRank1 = rank === 1;
  const isRank2 = rank === 2;
  const isRank3 = rank === 3;

  const getCardStyle = () => {
    if (isPinned || isCurrentUser) {
      return "bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-amber-500/10 border border-amber-500/60 dark:border-amber-400/60 border-l-4 border-l-amber-500 shadow-xl ring-1 ring-amber-500/30 backdrop-blur-md";
    }
    if (isRank1) {
      return "bg-gradient-to-r from-amber-400/20 via-yellow-300/15 to-transparent border-amber-400/80 dark:border-amber-500/70 shadow-lg shadow-amber-500/15 ring-1 ring-amber-400/40";
    }
    if (isRank2) {
      return "bg-gradient-to-r from-slate-300/30 via-slate-200/15 to-transparent border-slate-300/80 dark:border-slate-500/60 shadow-md shadow-slate-400/10";
    }
    if (isRank3) {
      return "bg-gradient-to-r from-orange-400/20 via-amber-300/10 to-transparent border-orange-400/70 dark:border-orange-500/60 shadow-md shadow-orange-500/10";
    }
    return "bg-white/70 dark:bg-stone-900/50 border-amber-900/5 dark:border-amber-100/5 hover:border-amber-500/20 transition-all";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: APPLE_EASE }}
      className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all ${getCardStyle()}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Rank Badge Huy chương */}
        <div className="relative flex-shrink-0">
          <RankBadge
            rank={rank}
            isRank1={isRank1}
            isRank2={isRank2}
            isRank3={isRank3}
            isCurrentUser={isCurrentUser}
          />
        </div>

        {/* Username & Stats */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-black text-[15.5px] text-amber-950 dark:text-amber-50 truncate">
              {item.username || "Khách"}
            </span>
            {isCurrentUser && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/30 tracking-wider uppercase flex-shrink-0 animate-pulse">
                👤 Bạn
              </span>
            )}
            {item.isGuest && !isCurrentUser && (
              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-extrabold bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400 flex-shrink-0">
                Khách
              </span>
            )}
          </div>
          <div className="text-[11.5px] text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-2">
            <span>{item.playCount || 1} lượt chơi</span>
            {item.maxStreak >= 2 && (
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                • 🔥 x{item.maxStreak}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Total Points Jewel Badge */}
      <div className="flex items-center gap-2 flex-shrink-0 pl-2 text-right">
        <div className="bg-amber-100/90 dark:bg-amber-900/60 px-3.5 py-1.5 rounded-2xl border border-amber-300/60 dark:border-amber-700/50 shadow-xs">
          <div className="text-[16px] font-black font-serif text-amber-900 dark:text-amber-100 leading-none">
            {item.totalPoints?.toLocaleString() ?? 0} pts
          </div>
        </div>
      </div>
    </motion.div>
  );
});

const LeaderboardModal = memo(({
  leaderboard = [],
  loading = false,
  period = "all",
  onPeriodChange,
  onClose,
}) => {
  const currentUsername = typeof window !== "undefined" ? (localStorage.getItem("username") || "Khách") : "Khách";

  const myIndex = leaderboard.findIndex(
    (item) => item.username && item.username.toLowerCase() === currentUsername.toLowerCase()
  );
  const myRank = myIndex !== -1 ? myIndex + 1 : null;
  const myItem = myIndex !== -1 ? leaderboard[myIndex] : null;

  const top10List = leaderboard.slice(0, 10);
  const isMyRankOutsideTop10 = myRank && myRank > 10;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xl"
      data-lenis-prevent
    >
      <motion.div
        initial={{ scale: 0.92, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 24, opacity: 0 }}
        transition={{ ease: APPLE_EASE, duration: 0.35 }}
        className="w-full max-w-[500px] h-[590px] sm:h-[630px] max-h-[88vh] bg-[#FDFBF7]/95 dark:bg-[#1C1917]/95 backdrop-blur-2xl rounded-[32px] border border-amber-900/10 dark:border-amber-100/10 shadow-2xl flex flex-col overflow-hidden relative"
        data-lenis-prevent
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-900/10 dark:border-amber-100/10 bg-white/50 dark:bg-stone-900/50 backdrop-blur-md flex-shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center text-xl shadow-md shadow-amber-500/25 ring-2 ring-amber-300/40">
              🏆
            </div>
            <div>
              <h3 className="text-[17px] font-black font-serif tracking-tight text-amber-950 dark:text-amber-50 m-0 uppercase leading-none">
                BẢNG XẾP HẠNG
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Apple Spring Segmented Control Tab Filter */}
        <div className="p-3 px-6 bg-stone-100/60 dark:bg-stone-900/40 border-b border-amber-900/5 dark:border-amber-100/5 flex-shrink-0 relative z-10">
          <div className="bg-stone-200/70 dark:bg-stone-800/70 p-1 rounded-2xl flex items-center relative backdrop-blur-md">
            {[
              { id: "all", label: "Tất cả" },
              { id: "week", label: "Tuần" },
              { id: "month", label: "Tháng" },
            ].map((tab) => {
              const active = period === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onPeriodChange?.(tab.id)}
                  className="relative flex-1 py-2 rounded-xl text-[13.5px] font-extrabold transition-colors cursor-pointer text-center select-none"
                >
                  {active && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl shadow-md shadow-amber-900/20"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className={`relative z-10 transition-colors ${active ? "text-white" : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Content List (Top 10) */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-2.5 relative z-10 min-h-[280px]" data-lenis-prevent>
          {loading ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="h-16 rounded-2xl bg-gradient-to-r from-stone-200/40 via-amber-100/30 to-stone-200/40 dark:from-stone-800/40 dark:via-amber-900/20 dark:to-stone-800/40 animate-pulse border border-amber-900/5 dark:border-amber-100/5" />
              ))}
            </div>
          ) : top10List.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, ease: APPLE_EASE }}
              className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 relative"
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-amber-300/10 border border-amber-400/40 text-amber-600 dark:text-amber-300 flex items-center justify-center text-4xl mb-3 shadow-xl shadow-amber-500/10 ring-4 ring-amber-400/10">
                📊
              </div>
              <h4 className="text-[16px] font-bold text-amber-950 dark:text-amber-50 m-0">
                Chưa có lượt chơi nào trong {period === "week" ? "tuần này" : period === "month" ? "tháng này" : "danh sách"}
              </h4>
              <p className="text-[13px] text-stone-500 dark:text-stone-400 mt-1.5 max-w-[280px] leading-relaxed">
                Hãy là người đầu tiên hoàn thành bài đố vui để vinh danh trên Bảng Xếp Hạng Top 10!
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {top10List.map((item, index) => {
                const rank = index + 1;
                const isCurrentUser = Boolean(
                  item.username && item.username.toLowerCase() === currentUsername.toLowerCase()
                );
                return (
                  <LeaderboardCard
                    key={item.username || index}
                    item={item}
                    rank={rank}
                    isCurrentUser={isCurrentUser}
                  />
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Pinned "Your Position" Sticky Card (If Rank > 10) */}
        {isMyRankOutsideTop10 && myItem && (
          <div className="p-3.5 px-5 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/5 backdrop-blur-md border-t border-amber-900/15 dark:border-amber-100/15 flex-shrink-0 relative z-20 shadow-2xl">
            <div className="text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1.5 flex items-center gap-1.5">
              <span>📍 Vị trí của bạn hiện tại:</span>
            </div>
            <LeaderboardCard item={myItem} rank={myRank} isCurrentUser={true} isPinned={true} />
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-amber-900/10 dark:border-amber-100/10 bg-white/60 dark:bg-stone-900/60 flex justify-end flex-shrink-0 relative z-10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white text-[14px] font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
});

export default LeaderboardModal;