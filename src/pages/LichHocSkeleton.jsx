import React from "react";
import "./LichHoc.css";

export default function LichHocSkeleton() {
  return (
    <div className="sched-page" aria-busy="true" aria-label="Đang tải thời gian biểu...">
      {/* ════ HERO SKELETON ════ */}
      <section className="sched-hero">
        <div className="sched-shell">
          <div className="sched-hero-grid">
            <div className="sched-hero-left">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400/60 animate-pulse" />
                <div className="h-4 w-48 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
              </div>

              <div className="h-10 sm:h-12 w-3/4 bg-stone-300 dark:bg-stone-700 rounded-lg animate-pulse my-2" />
              <div className="h-4 w-full bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />

              <div className="flex gap-3 mt-4">
                <div className="h-12 w-44 bg-stone-300 dark:bg-stone-700 rounded-xl animate-pulse" />
                <div className="h-12 w-48 bg-stone-200 dark:bg-stone-800 rounded-xl animate-pulse" />
              </div>
            </div>

            <div className="sched-hero-right">
              <div className="sched-overview-chips">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="sched-overview-chip">
                    <div className="h-3 w-16 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
                    <div className="h-6 w-20 bg-stone-300 dark:bg-stone-700 rounded animate-pulse my-1" />
                    <div className="h-3 w-28 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ LITURGICAL TIMELINE SKELETON ════ */}
      <section className="sched-timeline-section">
        <div className="sched-shell">
          <div className="h-12 w-full bg-stone-200 dark:bg-stone-800 rounded-xl animate-pulse" />
        </div>
      </section>

      {/* ════ TOOLBAR SKELETON ════ */}
      <div className="sched-toolbar-section">
        <div className="sched-shell">
          <div className="h-11 w-full max-w-md bg-stone-200 dark:bg-stone-800 rounded-full animate-pulse mb-3" />
          <div className="flex gap-2">
            <div className="h-11 flex-1 bg-stone-200 dark:bg-stone-800 rounded-full animate-pulse" />
            <div className="h-11 w-24 bg-stone-200 dark:bg-stone-800 rounded-full animate-pulse" />
          </div>
          <div className="flex gap-2 mt-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-11 w-24 bg-stone-200 dark:bg-stone-800 rounded-full animate-pulse flex-shrink-0" />
            ))}
          </div>
        </div>
      </div>

      {/* ════ CARDS GRID SKELETON ════ */}
      <main className="sched-shell">
        <div className="h-4 w-40 bg-stone-200 dark:bg-stone-800 rounded animate-pulse mb-4" />
        <div className="sched-cards-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="sched-card">
              <div className="flex justify-between items-center">
                <div className="h-6 w-24 bg-stone-200 dark:bg-stone-800 rounded-md animate-pulse" />
                <div className="h-6 w-16 bg-stone-200 dark:bg-stone-800 rounded-full animate-pulse" />
              </div>
              <div className="h-7 w-40 bg-stone-300 dark:bg-stone-700 rounded animate-pulse my-1" />
              <div className="flex gap-2">
                <div className="h-5 w-24 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
                <div className="h-5 w-28 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
              </div>
              <div className="h-16 w-full bg-stone-100 dark:bg-stone-800/60 rounded-xl animate-pulse" />
              <div className="h-10 w-full bg-stone-100 dark:bg-stone-800/60 rounded-r-lg animate-pulse" />
              <div className="flex justify-between items-center pt-2 border-t border-stone-200 dark:border-stone-800">
                <div className="h-4 w-28 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
                <div className="h-5 w-14 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
