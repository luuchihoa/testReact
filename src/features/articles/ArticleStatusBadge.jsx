import React from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG = {
  draft: { 
    label: "Nháp", 
    className: "bg-[#dedfd4]/60 dark:bg-[#354237]/60 text-[#575e55] dark:text-[#b0b9ac] border-[#dedfd4] dark:border-[#354237]" 
  },
  pending: { 
    label: "Chờ duyệt", 
    className: "bg-[#d4b47d]/25 dark:bg-[#927140]/30 text-[#7c5c2d] dark:text-[#d4b47d] border-[#927140]/30 dark:border-[#d4b47d]/30" 
  },
  published: { 
    label: "Đã đăng", 
    className: "bg-[#314e3e]/15 dark:bg-[#314e3e]/40 text-[#293d32] dark:text-[#8fd1a9] border-[#314e3e]/30 dark:border-[#314e3e]/50 font-bold" 
  },
  rejected: { 
    label: "Bị từ chối", 
    className: "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200/80 dark:border-red-900/50" 
  },
};

// Chấm nhỏ nhấp nháy nhẹ cho trạng thái "Chờ duyệt" — báo hiệu việc đang chờ xử lý
function PendingPulse() {
  return (
    <span className="relative flex w-1.5 h-1.5 flex-shrink-0" aria-hidden="true">
      <Motion.span
        className="absolute inline-flex h-full w-full rounded-full bg-[#927140] dark:bg-[#d4b47d]"
        animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
      />
      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#7c5c2d] dark:bg-[#d4b47d]" />
    </span>
  );
}

export default function ArticleStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Motion.span
        key={status}
        initial={{ opacity: 0, y: -3, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={`inline-flex items-center gap-1.5 justify-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider border flex-shrink-0 min-h-[24px] ${cfg.className}`}
      >
        {status === "pending" && <PendingPulse />}
        {cfg.label}
      </Motion.span>
    </AnimatePresence>
  );
}