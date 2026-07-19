import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG = {
  draft: { 
    label: "Nháp", 
    className: "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-black/5 dark:border-white/5" 
  },
  pending: { 
    label: "Chờ duyệt", 
    className: "bg-amber-100/80 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 border-amber-900/10 dark:border-amber-100/10" 
  },
  published: { 
    label: "Đã đăng", 
    className: "bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 border-emerald-900/10 dark:border-emerald-100/10" 
  },
  rejected: { 
    label: "Bị từ chối", 
    className: "bg-red-100/80 dark:bg-red-900/40 text-red-800 dark:text-red-400 border-red-900/10 dark:border-red-100/10" 
  },
};

// Chấm nhỏ nhấp nháy nhẹ cho trạng thái "Chờ duyệt" — báo hiệu đây là việc
// đang chờ xử lý, không phải trạng thái tĩnh cuối cùng.
function PendingPulse() {
  return (
    <span className="relative flex w-1.5 h-1.5 flex-shrink-0">
      <motion.span
        className="absolute inline-flex h-full w-full rounded-full bg-amber-500"
        animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
      />
      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-600 dark:bg-amber-400" />
    </span>
  );
}

export default function ArticleStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={status}
        initial={{ opacity: 0, y: -4, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={`inline-flex items-center gap-1.5 justify-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border flex-shrink-0 ${cfg.className}`}
      >
        {status === "pending" && <PendingPulse />}
        {cfg.label}
      </motion.span>
    </AnimatePresence>
  );
}