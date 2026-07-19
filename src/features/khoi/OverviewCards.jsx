import React from "react";
import { motion } from "framer-motion";
import { usePageMotion } from "../../hooks/usePageMotion.js";

export default function OverviewCards({ 
  items, 
  className = "",
  accentBgClass = "bg-amber-100/50 dark:bg-stone-800",
  accentTextClass = "text-amber-900 dark:text-amber-500",
  accentBorderClass = "border-amber-900/5 dark:border-amber-700/40"
}) {
  const { fadeUp, vp } = usePageMotion();

  return (
    <section className={`py-6 bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl border-y border-amber-900/10 dark:border-amber-100/10 relative z-10 ${className}`}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={vp}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="flex overflow-x-auto md:grid md:grid-cols-4 gap-6 scrollbar-none snap-x snap-mandatory"
        >
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div variants={fadeUp} custom={i * 0.1} key={i} className="flex-shrink-0 w-[240px] md:w-auto snap-center flex items-center gap-4 p-1 transition-all group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border flex-shrink-0 transition-transform duration-300 md:group-hover:scale-105 ${accentBgClass} ${accentBorderClass}`}>
                  <Icon className={`w-5 h-5 ${accentTextClass}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">{item.label}</p>
                  <p className="text-[14px] font-bold text-amber-950 dark:text-amber-50 mt-0.5 truncate">{item.value}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}