import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CtaSection({
  icon: Icon,
  iconClass,
  title,
  description,
  primaryCtaLabel,
  primaryCtaTo,
  primaryCtaClass = "bg-stone-900 hover:bg-stone-800",
  secondaryCtaLabel,
  secondaryCtaTo,
  mc,
  vp,
  sectionClassName = "pt-20 pb-32 max-w-3xl mx-auto px-6 text-center relative z-10",
}) {
  return (
    <section className={sectionClassName}>
      <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }} viewport={vp} transition={{ duration: 0.6 }}>
        <div className="inline-flex w-12 h-12 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md items-center justify-center mb-8">
          <Icon className={`w-8 h-8 ${iconClass}`} />
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">{title}</h2>
        <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base leading-relaxed mb-10 max-w-xl mx-auto font-medium">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to={primaryCtaTo}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full text-md font-bold text-white shadow-lg active:scale-[0.98] transition-all duration-200 ${primaryCtaClass}`}
          >
            {primaryCtaLabel} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to={secondaryCtaTo}
            className="w-full sm:w-auto inline-flex items-center justify-center h-14 px-6 rounded-full text-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 shadow-sm active:scale-[0.98] transition-all duration-200"
          >
            {secondaryCtaLabel}
          </Link>
        </div>
      </motion.div>
    </section>
  );
}