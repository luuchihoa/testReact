import React from "react";
import { motion } from "framer-motion";

export default function HighlightsGrid({
  items,
  eyebrowLabel = "Phương pháp",
  title,
  accentTextClass,
  accentIconClass,
  cardClass = "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl", // Tinh chỉnh lớp kính
  sectionClassName = "py-20 relative z-10",
  containerClassName = "max-w-6xl mx-auto px-6",
  mc,
  vp,
}) {
  return (
    <section className={sectionClassName}>
      <div className={containerClassName}>
        <div className="max-w-2xl text-left space-y-2 mb-12">
          <p className={`text-[11px] font-bold tracking-widest uppercase ml-1 ${accentTextClass}`}>{eyebrowLabel}</p>
          <h2 className="text-[28px] md:text-[40px] font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50">{title}</h2>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: mc.yOffset }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={vp}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className={`rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 p-6 shadow-sm transition-all md:hover:shadow-lg ${cardClass}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-amber-900/5 ${accentIconClass}`}>
                  <Icon className="w-6 h-6" strokeWidth={2} />
                </div>
                <h3 className="text-[15px] font-bold text-amber-950 dark:text-amber-50 mb-2">{item.title}</h3>
                <p className="text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}