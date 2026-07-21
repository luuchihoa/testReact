import React, { memo } from "react";

const StatPill = memo(({ label, value, accent }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl px-3 py-1.5 min-w-[56px] shadow-sm border ${
        accent
          ? "bg-amber-100/80 dark:bg-amber-900/40 border-amber-300/50 dark:border-amber-700/40"
          : "bg-white/80 dark:bg-stone-900/40 border-amber-900/5 dark:border-amber-100/5"
      }`}
    >
      <span
        className={`text-[16px] font-extrabold font-serif leading-tight ${
          accent ? "text-amber-700 dark:text-amber-400" : "text-amber-950 dark:text-amber-50"
        }`}
      >
        {value}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mt-0.5">
        {label}
      </span>
    </div>
  );
});

export default StatPill;
