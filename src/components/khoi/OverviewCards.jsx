import React from "react";

export default function OverviewCards({ items, className = "" }) {
  return (
    <section
      className={`py-8 bg-white/60 dark:bg-stone-900/40 backdrop-blur-md border-y border-stone-200/50 dark:border-stone-800/50 overflow-hidden relative z-10 ${className}`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex overflow-x-auto md:grid md:grid-cols-4 gap-6 scrollbar-none snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="flex-shrink-0 w-[240px] md:w-auto snap-center bg-stone-50 dark:bg-stone-900/60 md:bg-transparent md:dark:bg-transparent p-4 md:p-0 rounded-2xl border border-stone-200/40 dark:border-stone-800/40 md:border-none flex items-center gap-4 transition-all"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white dark:bg-stone-800 shadow-sm border border-stone-200/40 dark:border-stone-700/40 flex-shrink-0">
                  <Icon className="w-4 h-4 text-stone-700 dark:text-stone-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">{item.label}</p>
                  <p className="text-sm font-bold text-stone-800 dark:text-stone-200 mt-0.5 truncate">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}