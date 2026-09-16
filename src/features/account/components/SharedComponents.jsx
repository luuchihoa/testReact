import React from "react";
import { motion as Motion } from "framer-motion";
import { Lock } from "lucide-react";
import { pressable } from "../../../components/ui/variant.jsx";

export function Spinner({ className = "h-4 w-4" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function StatCard({ label, value, colorClass = "text-[#19251d] dark:text-[#ffffff]", icon = null, delay = 0, subLabel = null }) {
  return (
    <Motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay, ease: "easeOut" }}
      className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] shadow-xs p-3.5 sm:p-4 relative overflow-hidden flex flex-col justify-between min-w-0"
    >
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[12px] font-bold text-[#293d32] dark:text-[#ecece0] tracking-wide truncate pr-1">
          {label}
        </p>
        {icon && (
          <div className="w-7 h-7 rounded-lg bg-[#314e3e]/10 dark:bg-[#d4b47d]/15 flex items-center justify-center text-[#314e3e] dark:text-[#d4b47d] shrink-0 border border-[#dedfd4]/60 dark:border-[#354237]/60">
            {icon}
          </div>
        )}
      </div>
      <div>
        <p className={`text-[20px] sm:text-[22px] font-bold tracking-tight truncate ${colorClass}`}>{value ?? "—"}</p>
        {subLabel && <p className="text-[11px] font-medium text-[#575e55] dark:text-[#b0b9ac] mt-0.5 truncate">{subLabel}</p>}
      </div>
    </Motion.div>
  );
}

export function ScoreCell({ label, value, isExam = false }) {
  return (
    <div 
      className={`rounded-xl px-2 sm:px-3 py-2.5 text-center flex-1 min-w-0 border transition-all ${
        isExam
          ? "bg-[#5e4117]/10 dark:bg-[#e0c38c]/10 border-[#5e4117]/40 dark:border-[#e0c38c]/40 shadow-2xs"
          : "bg-[#faf8f3] dark:bg-[#151c18] border-[#616e5f]/30 dark:border-[#677765]/40 shadow-2xs"
      }`}
    >
      <p className={`text-[11px] font-bold block leading-none mb-1 uppercase tracking-wider truncate select-none ${
        isExam ? "text-[#5e4117] dark:text-[#e0c38c]" : "text-[#293d32] dark:text-[#ecece0]"
      }`}>
        {label}
      </p>
      <p className={`text-base sm:text-lg font-bold font-mono truncate ${
        value !== null && value !== undefined && value !== "" && value !== "—"
          ? isExam ? "text-[#5e4117] dark:text-[#e0c38c]" : "text-[#19251d] dark:text-[#ffffff]"
          : "text-[#575e55] dark:text-[#b0b9ac]"
      }`}>
        {value ?? "—"}
      </p>
    </div>
  );
}

export function LoginRequired({ toggleModal }) {
  return (
    <div className="min-h-[55vh] w-full flex flex-col items-center justify-center gap-4 text-center px-4 py-16">
      <div className="w-16 h-16 rounded-2xl bg-[#314e3e]/10 dark:bg-[#d4b47d]/20 text-[#314e3e] dark:text-[#d4b47d] flex items-center justify-center shadow-xs border border-[#dedfd4] dark:border-[#354237]">
        <Lock className="w-8 h-8" strokeWidth={2} />
      </div>
      <h1 className="text-[20px] font-bold text-[#293d32] dark:text-[#ecece0]">Vui lòng đăng nhập để xem</h1>
      <p className="text-[14px] text-[#575e55] dark:text-[#b0b9ac] max-w-sm leading-relaxed">
        Bạn cần đăng nhập tài khoản để xem thông tin cá nhân và kết quả học tập.
      </p>
      <Motion.button
        {...pressable()}
        onClick={toggleModal}
        className="px-6 py-3 mt-2 rounded-full bg-[#314e3e] hover:bg-[#253d30] text-white dark:bg-[#d6b883] dark:hover:bg-[#c4a671] dark:text-[#19251d] text-[14px] font-bold transition-colors shadow-xs"
      >
        Đăng nhập ngay
      </Motion.button>
    </div>
  );
}
