import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { usePageMotion } from "../../hooks/usePageMotion.js";

const APPLE_EASE = [0.16, 1, 0.3, 1];
const MOBILE_BREAKPOINT = 768;

export default function KhoiRuocLeJourney({ items }) {
  const [selectedStep, setSelectedStep] = useState(null);
  const { fadeUp, vp, lenis } = usePageMotion();
  const stepSheetY = useMotionValue(0);

  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleStepDragEnd = (event, info) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      setSelectedStep(null);
    } else {
      stepSheetY.set(0);
    }
  };

  useEffect(() => {
    if (selectedStep) {
      stepSheetY.set(0);
      document.body.style.overflow = "hidden";
      lenis?.stop();
    } else {
      document.body.style.overflow = "";
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [selectedStep, stepSheetY, lenis]);

  useEffect(() => {
    if (!selectedStep) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedStep(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStep]);

  return (
    <>
      <section id="hanh-trinh" className="py-20 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-12 relative z-20">
      <div className="max-w-2xl text-left space-y-3 mb-12 sm:mb-16">
        <p className="text-xs font-bold tracking-widest uppercase text-[#27400e] dark:text-lime-200 ml-1">Lộ trình Đào Tạo</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50 leading-tight">Hành trình Khám phá &amp; Gặp gỡ</h2>
        <p className="text-sm sm:text-base font-medium text-[#38433a] dark:text-stone-200 leading-relaxed max-w-xl">
          Chương trình học gồm 6 chặng cốt lõi, chuyển hóa từ kiến thức căn bản đến thực hành nội tâm và sống chứng tá đời thường.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map((item, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            custom={i * 0.05}
            whileHover={{ y: -6, scale: 1.01 }}
            onClick={() => setSelectedStep(item)}
            role="button"
            tabIndex={0}
            aria-label={`${item.title} - Chạm để xem chi tiết`}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedStep(item); }}
            className={`group text-left rounded-[24px] sm:rounded-[32px] border p-6 sm:p-8 bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl hover:shadow-xl active:scale-[0.98] transition-[transform,box-shadow,border-color] duration-300 cursor-pointer flex flex-col justify-between min-h-[220px] border-amber-900/10 dark:border-amber-100/10 ${
              (i === 2 || i === 4) ? "sm:col-span-2 lg:col-span-2" : "col-span-1"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="text-3xl font-black font-mono tracking-tight text-amber-900/10 dark:text-amber-100/10 md:group-hover:text-lime-500/30 dark:group-hover:text-lime-400/20 transition-colors">{item.step}</span>
                <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm ${item.badge}`}>
                  Chi tiết
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold font-serif text-amber-950 dark:text-amber-50 md:group-hover:text-[#27400e] dark:group-hover:text-lime-200 transition-colors mb-2.5">{item.title}</h3>
              <p className="text-sm text-[#38433a] dark:text-stone-200 leading-relaxed font-medium line-clamp-3">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>

      <AnimatePresence>
        {selectedStep && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: APPLE_EASE }}
              onClick={() => setSelectedStep(null)}
              className="fixed inset-0 bg-stone-900/40 dark:bg-black/60 backdrop-blur-sm z-50 pointer-events-auto"
            />

            <div data-lenis-prevent className="fixed inset-0 z-[60] flex flex-col justify-end md:items-center md:justify-center p-0 md:p-4 pointer-events-none">
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="rl-step-title"
                drag={isMobile ? "y" : false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.1, bottom: 0.6 }}
                onDragEnd={handleStepDragEnd}
                style={{ y: stepSheetY }}
                initial={{ opacity: 0, y: isMobile ? "100%" : 30, scale: isMobile ? 1 : 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: isMobile ? "100%" : 20, scale: isMobile ? 1 : 0.95 }}
                transition={{ duration: 0.4, ease: APPLE_EASE }}
                className="relative w-full md:max-w-xl pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] md:pb-0 rounded-t-[32px] md:rounded-[32px] border border-amber-900/10 dark:border-amber-100/10 shadow-2xl pointer-events-auto max-h-[90vh] md:max-h-[85vh] flex flex-col overflow-hidden bg-white/95 dark:bg-[#1C1917]/95 backdrop-blur-xl text-amber-950 dark:text-amber-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-center pt-4 pb-2 md:hidden touch-none active:cursor-grabbing">
                  <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full" />
                </div>

                <div className="flex items-center justify-between gap-4 p-6 sm:p-8 pb-4 touch-none border-b border-amber-900/5 dark:border-amber-100/5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100/50 dark:bg-stone-800 flex items-center justify-center flex-shrink-0 text-xl font-bold font-mono text-[#632c02] dark:text-amber-200 border border-amber-900/5 dark:border-amber-700/30 select-none">
                      {selectedStep.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 id="rl-step-title" className="font-extrabold font-serif text-xl tracking-tight leading-tight truncate">{selectedStep.title}</h3>
                      <p className="text-xs text-[#27400e] dark:text-lime-200 font-bold uppercase tracking-widest mt-1.5 truncate">{selectedStep.details.subtitle}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedStep(null)}
                    aria-label="Đóng chi tiết chặng"
                    className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-full p-2 text-stone-700 hover:text-stone-900 dark:text-stone-200 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex gap-2 px-6 sm:px-8 py-3 bg-stone-50/50 dark:bg-stone-900/30 flex-wrap touch-none">
                  <span className="text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-amber-900/5 dark:border-amber-100/5 shadow-sm">
                    ⏱ Thời lượng: {selectedStep.details.duration}
                  </span>
                </div>

                <div className="h-px bg-amber-900/5 dark:bg-amber-100/5 mx-6 flex-shrink-0" />

                <div className="p-6 sm:p-8 pt-5 space-y-6 overflow-y-auto overscroll-contain flex-1 text-left">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-stone-700 dark:text-stone-200 mb-2.5">
                        Ý nghĩa mục tiêu
                      </h4>
                      <p className="text-sm sm:text-base leading-relaxed text-stone-700 dark:text-stone-200 font-medium">
                        {selectedStep.details.meaning}
                      </p>
                    </div>

                    <div className="bg-stone-50/50 dark:bg-stone-900/30 p-4 sm:p-5 rounded-2xl border border-amber-900/5 dark:border-amber-100/5">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#27400e] dark:text-lime-200 mb-2.5">
                        Bài học &amp; Thực hành cốt lõi
                      </h4>
                      <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-200 font-medium">
                        {selectedStep.details.highlight}
                      </p>
                    </div>

                    <div className="text-center text-2xl pt-2 tracking-[0.5em] select-none opacity-90 drop-shadow-sm">
                      {selectedStep.details.emoji}
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
