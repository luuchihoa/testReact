import React from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { usePageMotion } from "../../hooks/usePageMotion.js";

export default function CtaSection({
  // eslint-disable-next-line no-unused-vars
  icon: Icon,
  iconClass = "text-[#632c02] dark:text-amber-200",
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
        <h2 className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight mb-4 text-amber-950 dark:text-amber-50">{title}</h2>
        
        <p className="text-[#38433a] dark:text-stone-200 text-sm sm:text-base leading-relaxed mb-10 max-w-xl mx-auto font-medium">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to={primaryCtaTo}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[3.5rem] py-3.5 px-8 rounded-xl text-sm sm:text-base font-bold text-white shadow-lg active:scale-[0.98] transition-[opacity,transform,background-color] duration-200 ${primaryCtaClass}`}
          >
            {primaryCtaLabel} <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
          </Link>
          <Link
            to={secondaryCtaTo}
            className="w-full sm:w-auto inline-flex items-center justify-center min-h-[3.5rem] py-3.5 px-8 rounded-xl text-sm sm:text-base font-bold border border-amber-900/10 dark:border-amber-100/10 bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl text-stone-700 dark:text-stone-200 md:hover:bg-stone-100 dark:hover:bg-stone-800 shadow-sm active:scale-[0.98] transition-[opacity,transform,background-color,border-color] duration-200"
          >
            {secondaryCtaLabel}
          </Link>
        </div>
      </motion.div>
    </section>
  );
}