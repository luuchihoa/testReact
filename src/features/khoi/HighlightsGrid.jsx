import React from "react";
import { motion } from "framer-motion";
import { usePageMotion } from "../../hooks/usePageMotion.js";

export default function HighlightsGrid({
  items,
  eyebrowLabel = "Phương pháp",
  title,
  accentTextClass = "text-amber-600 dark:text-amber-400",
  accentIconClass = "bg-amber-100/50 text-amber-900 dark:bg-stone-800 dark:text-amber-500 border-amber-900/5 dark:border-amber-700/40",
  cardClass = "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl",
  sectionClassName = "py-20 relative z-10",
  containerClassName = "max-w-6xl mx-auto px-6",
}) {
  const { fadeUp, vp } = usePageMotion();

  return (
    <section className={sectionClassName}>
      <div className={containerClassName}>
        <div className="max-w-2xl text-left space-y-2 mb-12">
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} custom={0} className={`text-[11px] font-bold tracking-widest uppercase ml-1 ${accentTextClass}`}>{eyebrowLabel}</motion.p>
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} custom={0.1} className="text-[28px] md:text-[40px] font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50">{title}</motion.h2>
        </div>

        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={vp}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
        >
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i * 0.1 + 0.2}
                whileHover={{ y: -4 }}
                className={`rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 p-6 shadow-sm transition-all md:hover:shadow-lg ${cardClass}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${accentIconClass}`}>
                  <Icon className="w-6 h-6" strokeWidth={2} />
                </div>
                <h3 className="text-[15px] font-bold text-amber-950 dark:text-amber-50 mb-2">{item.title}</h3>
                <p className="text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}