import React from "react";
import { motion } from "framer-motion";
import { pressable } from "../../../components/ui/variant.jsx";

export function Spinner({ className = "h-4 w-4" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function StatCard({ label, value, colorClass = "text-amber-950 dark:text-white", icon = null, delay = 0 }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className="bg-white/80 dark:bg-stone-800/40 backdrop-blur-sm rounded-2xl border border-amber-900/10 dark:border-amber-100/10 shadow-sm p-4 relative overflow-hidden"
    >
      {icon && <span className="absolute top-3 right-3 text-2xl opacity-10">{icon}</span>}
      <p className="text-[12px] font-semibold text-stone-500 dark:text-stone-400 mb-1 flex items-center gap-1.5">
        {icon && <span className="text-sm opacity-80">{icon}</span>}
        {label}
      </p>
      <p className={`text-[20px] font-bold ${colorClass}`}>{value ?? "—"}</p>
    </motion.div>
  );
}

export function ScoreCell({ label, value }) {
  return (
    <div className="bg-amber-900/5 dark:bg-amber-100/5 rounded-xl px-3 py-2.5 text-center flex-1 min-w-[64px] border border-amber-900/10 dark:border-amber-100/10">
      <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-0.5">{label}</p>
      <p className="text-[15px] font-bold text-amber-950 dark:text-amber-50">{value ?? "—"}</p>
    </div>
  );
}

export function LoginRequired({ toggleModal }) {
  return (
    <div className="min-h-[55vh] w-full flex flex-col items-center justify-center gap-4 text-center px-4 py-16">
      <div className="w-16 h-16 rounded-full bg-amber-100/50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 flex items-center justify-center text-3xl shadow-inner border border-amber-900/5 dark:border-amber-100/5">🔒</div>
      <h1 className="text-[20px] font-bold text-amber-950 dark:text-amber-50 font-serif">Vui lòng đăng nhập để xem</h1>
      <p className="text-[14px] text-stone-500 dark:text-stone-400 max-w-sm leading-relaxed">
        Bạn cần đăng nhập tài khoản để xem thông tin cá nhân và kết quả học tập.
      </p>
      <motion.button
        {...pressable()}
        onClick={toggleModal}
        className="px-6 py-3 mt-2 rounded-full bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white text-[14px] font-bold md:hover:opacity-90 transition-colors shadow-sm"
      >
        Đăng nhập ngay
      </motion.button>
    </div>
  );
}

export function TabIndicator({ activeTab, isStaff }) {
  const tabsCount = isStaff ? 2 : 3;
  let index = 0;
  if (isStaff) {
    if (activeTab === "thong-bao") index = 1;
  } else {
    if (activeTab === "thanh-tich") index = 1;
    if (activeTab === "thong-bao") index = 2;
  }

  return (
    <motion.span
      className="absolute top-1 left-1 h-10 rounded-[14px] bg-white dark:bg-amber-400 shadow-sm border border-black/5 dark:border-white/10"
      style={{ width: `calc(${100 / tabsCount}% - ${8 / tabsCount}px)` }}
      animate={{ x: `${index * 100}%` }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    />
  );
}
