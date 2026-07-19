import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function HeroSection({
  heroRef,
  heroY,
  fadeUp,
  lenis,
  sectionBgClass = "bg-gradient-to-b from-white via-[#FDFBF7] to-[#FDFBF7] dark:from-[#1C1917] dark:via-[#191614] dark:to-[#191614]",
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
  // 🌟 THÊM PROP NÀY: Cho phép tùy biến màu nút, mặc định là Amber
  primaryCtaClass = "bg-amber-900 md:hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500", 
  secondaryCtaLabel,
  secondaryCtaTo,
  image,
  imageGlowClass,
  floatBadge,
  children,
}) {
  const handlePrimaryCta = () => {
    const target = document.getElementById(primaryCtaTargetId);
    if (!target) return;
    lenis ? lenis.scrollTo(target, { duration: 1 }) : target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={heroRef} className={`relative overflow-hidden pt-16 pb-24 md:pt-32 md:pb-32 ${sectionBgClass}`}>
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] ${glowClass} blur-[120px] rounded-full pointer-events-none`} />
      {children}

      <motion.div style={{ y: heroY }} className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="md:col-span-7 space-y-6 text-left">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
              <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest ${eyebrowClass}`}>
                {EyebrowIcon && <EyebrowIcon className="w-3.5 h-3.5" strokeWidth={2.5} />} {eyebrowLabel}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp} initial="hidden" animate="visible" custom={0.06}
              className="text-[40px] sm:text-5xl lg:text-6xl font-extrabold font-serif tracking-tight leading-[1.08] text-amber-950 dark:text-amber-50"
            >
              {titleLine1}<br />
              <span className={`bg-clip-text text-transparent ${titleGradientClass}`}>
                {titleLine2}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp} initial="hidden" animate="visible" custom={0.12}
              className="text-base sm:text-[17px] text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl font-medium"
            >
              {description}
            </motion.p>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.18} className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4">
              {/* 🌟 GẮN PROP VÀO CLASS CỦA NÚT Ở ĐÂY */}
              <button
                type="button"
                onClick={handlePrimaryCta}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl text-[15px] font-bold text-white shadow-lg active:scale-[0.98] transition-all duration-300 ${primaryCtaClass}`}
              >
                {primaryCtaLabel} <ArrowRight className="w-4.5 h-4.5" strokeWidth={2.5} />
              </button>
              
              <Link
                to={secondaryCtaTo}
                className="w-full sm:w-auto inline-flex items-center justify-center h-14 px-6 rounded-xl text-[15px] font-bold border border-amber-900/10 dark:border-amber-100/10 bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl text-stone-600 dark:text-stone-300 md:hover:bg-stone-100 dark:hover:bg-stone-800 shadow-sm active:scale-[0.98] transition-all duration-300"
              >
                {secondaryCtaLabel}
              </Link>
            </motion.div>
          </div>

          {/* ... (Phần ảnh ở phía dưới giữ nguyên như cũ) ... */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.24} className="md:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[340px] aspect-square rounded-[36px] bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border border-amber-900/10 dark:border-amber-100/10 p-8 shadow-xl flex items-center justify-center group">
              {imageGlowClass && (
                <div className={`absolute inset-0 rounded-[36px] opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${imageGlowClass}`} />
              )}
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-contain transform md:group-hover:scale-[1.02] transition-transform duration-500"
                loading="eager"
                fetchPriority="high"
              />
              {floatBadge && (
                <div className="absolute -bottom-4 right-4 sm:right-6 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl rounded-[20px] px-5 py-3.5 flex items-center gap-3.5 border border-amber-900/10 dark:border-amber-100/10 shadow-lg">
                  <div className={`w-2.5 h-2.5 rounded-full animate-pulse shadow-sm ${floatBadge.dotClass}`} />
                  <div>
                    <p className="text-[13px] font-bold text-amber-950 dark:text-amber-50 tracking-tight">{floatBadge.label}</p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium tracking-widest mt-0.5">{floatBadge.sub}</p>
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