import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { usePageMotion } from "../../hooks/usePageMotion.js";

export default function CtaSection({
  icon: Icon,
  iconClass = "text-amber-500",
  title,
  description,
  primaryCtaLabel,
  primaryCtaTo,
  primaryCtaClass = "bg-amber-900 md:hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500",
  secondaryCtaLabel,
  secondaryCtaTo,
  sectionClassName = "pt-20 pb-32 max-w-3xl mx-auto px-6 text-center relative z-10",
}) {
  const { fadeUp, vp } = usePageMotion();

  return (
    <section className={sectionClassName}>
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} custom={0.2}>
        
        {/* Đồng bộ Icon Box */}
        <div className="inline-flex w-16 h-16 rounded-[20px] bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border border-amber-900/10 dark:border-amber-100/10 shadow-md items-center justify-center mb-8">
          <Icon className={`w-7 h-7 ${iconClass}`} strokeWidth={2.5} />
        </div>

        {/* Đồng bộ Font Serif cho Title */}
        <h2 className="text-[32px] sm:text-4xl font-extrabold font-serif tracking-tight mb-4 text-amber-950 dark:text-amber-50">{title}</h2>
        
        <p className="text-stone-500 dark:text-stone-400 text-[15px] sm:text-base leading-relaxed mb-10 max-w-xl mx-auto font-medium">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to={primaryCtaTo}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl text-[15px] font-bold text-white shadow-lg active:scale-[0.98] transition-all duration-300 ${primaryCtaClass}`}
          >
            {primaryCtaLabel} <ArrowRight className="w-4.5 h-4.5" strokeWidth={2.5} />
          </Link>
          <Link
            to={secondaryCtaTo}
            className="w-full sm:w-auto inline-flex items-center justify-center h-14 px-8 rounded-xl text-[15px] font-bold border border-amber-900/10 dark:border-amber-100/10 bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl text-stone-600 dark:text-stone-300 md:hover:bg-stone-100 dark:hover:bg-stone-800 shadow-sm active:scale-[0.98] transition-all duration-300"
          >
            {secondaryCtaLabel}
          </Link>
        </div>
      </motion.div>
    </section>
  );
}