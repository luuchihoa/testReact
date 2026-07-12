import React from "react";

const STATUS_CONFIG = {
  draft:     { label: "Nháp",         className: "bg-stone-100 text-stone-600 border border-stone-200/40 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700/60" },
  pending:   { label: "Chờ duyệt",    className: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50" },
  published: { label: "Đã đăng",      className: "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/50" },
  rejected:  { label: "Bị từ chối",   className: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50" },
};

export default function ArticleStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}