import React from "react";
import { motion } from "framer-motion";

/**
 * `sectionClassName` / `containerClassName` cho phép mỗi Khối tự quyết định
 * có bọc thêm nền/border ngoài (như KhoiRuocLe) hay để trong suốt (như KhoiChienCon).
 * `maskHeading` bật lớp nền che phía sau tiêu đề để không bị PlusGrid xuyên qua chữ.
 */
export default function HighlightsGrid({
  items,
  eyebrowLabel = "Phương pháp",
  title,
  accentTextClass,
  accentIconClass,
  cardClass = "bg-white/90 dark:bg-stone-900/90 backdrop-blur-md",
  sectionClassName = "py-24 relative z-10",
  containerClassName = "max-w-6xl mx-auto px-6",
  maskHeading = true,
  mc,
  vp,
}) {
  const headingMaskClass = maskHeading ? "inline-block px-1 -mx-1" : "";

  return (
    <section className={sectionClassName}>
      <div className={containerClassName}>
        <div className="max-w-2xl text-left space-y-2 mb-16">
          <p className={`text-[11px] font-bold tracking-widest uppercase ${accentTextClass}`}>{eyebrowLabel}</p>
          <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${headingMaskClass}`}>{title}</h2>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: mc.yOffset }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={vp}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`rounded-3xl border border-stone-200/60 dark:border-stone-800/80 p-6 shadow-sm hover:shadow-md transition-all text-left ${cardClass}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 ${accentIconClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-2">{item.title}</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}