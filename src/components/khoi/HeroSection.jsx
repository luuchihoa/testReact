import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/**
 * Hero shell dùng chung cho tất cả trang Khối.
 * Hiệu ứng nền glow được chuẩn hoá theo 1 kiểu (giống KhoiChienCon) cho mọi khối,
 * chỉ đổi màu qua `glowClass` để giữ đồng bộ hệ thống thay vì mỗi khối tự vẽ 1 kiểu riêng.
 */
export default function HeroSection({
  heroRef,
  heroY,
  fadeUp,
  lenis,
  sectionBgClass = "bg-gradient-to-b from-white via-[#f5f5f7] to-[#f5f5f7] dark:from-stone-900 dark:via-[#09090b] dark:to-[#09090b]",
  glowClass = "bg-stone-500/5 dark:bg-stone-500/10",
  eyebrowIcon: EyebrowIcon,
  eyebrowLabel,
  eyebrowClass,
  titleLine1,
  titleLine2,
  titleGradientClass,
  description,
  primaryCtaLabel,
  primaryCtaTargetId,
  secondaryCtaLabel,
  secondaryCtaTo,
  image,
  imageGlowClass,
  floatBadge,
}) {
  const handlePrimaryCta = () => {
    const target = document.getElementById(primaryCtaTargetId);
    if (!target) return;
    lenis ? lenis.scrollTo(target, { duration: 1 }) : target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={heroRef} className={`relative overflow-hidden pt-12 pb-20 md:pt-32 md:pb-32 ${sectionBgClass}`}>
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] ${glowClass} blur-[120px] rounded-full pointer-events-none`} />

      <motion.div style={{ y: heroY }} className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="md:col-span-7 space-y-6 text-left">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${eyebrowClass}`}>
                {EyebrowIcon && <EyebrowIcon className="w-3 h-3" />} {eyebrowLabel}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp} initial="hidden" animate="visible" custom={0.06}
              className="text-4xl sm:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight leading-[1.08]"
            >
              {titleLine1}<br />
              <span className={`bg-clip-text text-transparent ${titleGradientClass}`}>
                {titleLine2}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp} initial="hidden" animate="visible" custom={0.12}
              className="text-base sm:text-lg text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl font-normal"
            >
              {description}
            </motion.p>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.18} className="flex flex-wrap gap-4 pt-4">
              <button
                type="button"
                onClick={handlePrimaryCta}
                className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full text-md font-bold text-white shadow-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-white active:scale-[0.98] transition-all duration-200"
              >
                {primaryCtaLabel} <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to={secondaryCtaTo}
                className="inline-flex items-center justify-center h-14 px-6 rounded-full text-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/60 shadow-sm active:scale-[0.98] transition-all duration-200"
              >
                {secondaryCtaLabel}
              </Link>
            </motion.div>
          </div>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.24} className="md:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[340px] aspect-square rounded-[2.5rem] bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 p-8 shadow-xl dark:shadow-black/40 flex items-center justify-center group">
              {imageGlowClass && (
                <div className={`absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${imageGlowClass}`} />
              )}
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-contain transform group-hover:scale-[1.02] transition-transform duration-500"
                loading="eager"
                fetchPriority="high"
              />
              {floatBadge && (
                <div className="absolute -bottom-4 right-6 bg-white/90 dark:bg-stone-800/90 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center gap-3 border border-stone-200/80 dark:border-stone-700/80 shadow-md">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${floatBadge.dotClass}`} />
                  <div>
                    <p className="text-xs font-bold tracking-tight">{floatBadge.label}</p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">{floatBadge.sub}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}