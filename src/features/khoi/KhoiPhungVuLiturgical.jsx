import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { usePageMotion } from "../../hooks/usePageMotion.js";

const APPLE_EASE = [0.16, 1, 0.3, 1];
const MOBILE_BREAKPOINT = 768;

export default function KhoiPhungVuLiturgical({ items }) {
  const [selectedSeason, setSelectedSeason] = useState(null);
  const { fadeUp, vp, lenis } = usePageMotion();
  const seasonSheetY = useMotionValue(0);

  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSeasonDragEnd = (event, info) => {
    if (info.offset.y > 100 || info.velocity.y > 500) setSelectedSeason(null);
    else seasonSheetY.set(0);
  };

  useEffect(() => {
    if (selectedSeason) {
      seasonSheetY.set(0);
      if (isMobile) document.body.style.overflow = "hidden";
      lenis?.stop();
    } else {
      document.body.style.overflow = "";
      lenis?.start();
    }
    return () => { 
      document.body.style.overflow = ""; 
      lenis?.start();
    };
  }, [selectedSeason, isMobile, seasonSheetY, lenis]);

  useEffect(() => {
    if (!selectedSeason) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedSeason(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedSeason]);

  return (
    <>
      <section id="noi-dung" className="py-20 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-12 relative z-20">
      <div className="max-w-2xl text-left space-y-3 mb-12 sm:mb-16">
        <p className="text-[11px] font-bold tracking-widest uppercase text-orange-600 dark:text-orange-400 ml-1">Nội dung</p>
        <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50 leading-tight">Năm Phụng Vụ — Vòng Tròn Thiêng Liêng</h2>
        <p className="text-[14px] sm:text-[15.5px] font-medium text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl">
          Giáo Hội sống theo một nhịp thời gian riêng — mỗi mùa phụng vụ mang màu sắc, ý nghĩa và lời cầu nguyện đặc trưng.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {items.slice(0, 4).map((season, i) => (
          <motion.div
            key={season.id}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            custom={i * 0.05}
            whileHover={{ y: -6, scale: 1.01 }}
            onClick={() => setSelectedSeason(season)}
            className={`group text-left rounded-[24px] sm:rounded-[32px] border p-6 flex flex-col justify-between min-h-[190px] cursor-pointer transition-all duration-300 hover:shadow-xl active:scale-[0.98] ${season.color}`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl select-none">{season.symbol}</span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${season.badge}`}>
                  Chi tiết
                </span>
              </div>
              <h3 className="text-[16px] font-extrabold font-serif text-amber-950 dark:text-amber-50 mb-2">{season.season}</h3>
              <p className="text-[12px] text-stone-500 dark:text-stone-400 leading-relaxed font-medium line-clamp-3">{season.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
        {items.slice(4).map((season, i) => (
          <motion.div
            key={season.id}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            custom={(i + 4) * 0.05}
            whileHover={{ y: -6, scale: 1.01 }}
            onClick={() => setSelectedSeason(season)}
            className={`group text-left rounded-[24px] sm:rounded-[32px] border p-6 flex flex-col justify-between min-h-[190px] cursor-pointer transition-all duration-300 hover:shadow-xl active:scale-[0.98] ${season.color}`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl select-none">{season.symbol}</span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${season.badge}`}>
                  Chi tiết
                </span>
              </div>
              <h3 className="text-[16px] font-extrabold font-serif text-amber-950 dark:text-amber-50 mb-2">{season.season}</h3>
              <p className="text-[12px] text-stone-500 dark:text-stone-400 leading-relaxed font-medium line-clamp-3">{season.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>

      <AnimatePresence>
        {selectedSeason && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: APPLE_EASE }}
              onClick={() => setSelectedSeason(null)}
              className="fixed inset-0 bg-stone-900/40 dark:bg-black/60 backdrop-blur-sm z-50 pointer-events-auto"
            />
            <div data-lenis-prevent className="fixed inset-0 z-[60] flex flex-col justify-end md:items-center md:justify-center p-0 md:p-4 pointer-events-none">
              <motion.div
                role="dialog"
                aria-modal="true"
                drag={isMobile ? "y" : false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.1, bottom: 0.6 }}
                onDragEnd={handleSeasonDragEnd}
                style={{ y: seasonSheetY }}
                initial={{ opacity: 0, y: isMobile ? "100%" : 30, scale: isMobile ? 1 : 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: isMobile ? "100%" : 20, scale: isMobile ? 1 : 0.95 }}
                transition={{ duration: 0.4, ease: APPLE_EASE }}
                className="relative w-full md:max-w-xl pb-[env(safe-area-inset-bottom)] md:pb-0 rounded-t-[32px] md:rounded-[32px] border border-amber-900/10 dark:border-amber-100/10 shadow-2xl pointer-events-auto max-h-[90vh] md:max-h-[85vh] flex flex-col overflow-hidden bg-white/95 dark:bg-[#1C1917]/95 backdrop-blur-xl text-amber-950 dark:text-amber-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-center pt-4 pb-2 md:hidden touch-none active:cursor-grabbing">
                  <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full" />
                </div>

                <div className="flex items-start gap-4 p-6 sm:p-8 pb-4 touch-none border-b border-amber-900/5 dark:border-amber-100/5">
                  <div className="w-14 h-14 rounded-2xl bg-stone-100/80 dark:bg-stone-800/80 flex items-center justify-center shadow-inner flex-shrink-0 text-2xl select-none border border-stone-200/50 dark:border-stone-700/50">
                    {selectedSeason.symbol}
                  </div>
                  <div className="flex-1 min-w-0 mt-1">
                    <h3 className="font-extrabold font-serif text-[22px] tracking-tight leading-tight truncate">{selectedSeason.season}</h3>
                    <p className="text-[12px] text-orange-600 dark:text-orange-400 font-bold tracking-widest uppercase mt-1.5">{selectedSeason.desc}</p>
                  </div>
                </div>

                <div className="flex gap-2 px-6 sm:px-8 pb-4 flex-wrap touch-none mt-2">
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 shadow-sm border border-stone-200/50 dark:border-stone-700/50">
                    ⏱ {selectedSeason.details.duration}
                  </span>
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 shadow-sm border border-stone-200/50 dark:border-stone-700/50">
                    🎨 {selectedSeason.details.color_meaning}
                  </span>
                </div>

                <div className="p-6 sm:p-8 pt-4 space-y-6 overflow-y-auto overscroll-contain flex-1 text-left">
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2.5">Ý nghĩa Phụng vụ</h4>
                    <p className="text-[14.5px] leading-relaxed text-stone-600 dark:text-stone-300 font-medium">{selectedSeason.details.meaning}</p>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-stone-50/50 dark:bg-stone-900/30 p-4 sm:p-5 rounded-2xl border border-amber-900/5 dark:border-amber-100/5">
                      <h4 className="text-[12px] font-bold uppercase tracking-widest text-orange-800 dark:text-orange-400 mb-3.5">Đặc trưng & Hoạt động</h4>
                      <p className="text-[14px] leading-relaxed text-stone-700 dark:text-stone-300 font-medium">{selectedSeason.details.highlight}</p>
                    </div>

                    <div className="text-center text-xl pt-2 tracking-widest select-none opacity-80">
                      {selectedSeason.details.emoji}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
