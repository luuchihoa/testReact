import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { usePageMotion } from "../../hooks/usePageMotion.js";

const APPLE_EASE = [0.16, 1, 0.3, 1];
const MOBILE_BREAKPOINT = 768;

export default function KhoiPhungVuSacraments({ items }) {
  const [selectedSacrament, setSelectedSacrament] = useState(null);
  const { fadeUp, vp, lenis } = usePageMotion();
  const sacramentSheetY = useMotionValue(0);

  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSacramentDragEnd = (event, info) => {
    if (info.offset.y > 100 || info.velocity.y > 500) setSelectedSacrament(null);
    else sacramentSheetY.set(0);
  };

  useEffect(() => {
    if (selectedSacrament) {
      sacramentSheetY.set(0);
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
  }, [selectedSacrament, isMobile, sacramentSheetY, lenis]);

  useEffect(() => {
    if (!selectedSacrament) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedSacrament(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedSacrament]);

  return (
    <>
      <section className="py-20 sm:py-24 bg-stone-50/50 dark:bg-[#1C1917]/50 border-y border-amber-900/5 dark:border-amber-100/5 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl text-left space-y-3 mb-12 sm:mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-orange-600 dark:text-orange-400 ml-1">Bí tích học</p>
          <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50 leading-tight">Bảy Bí Tích — Bảy Cánh Cửa Ân Sủng</h2>
          <p className="text-[14px] sm:text-[15.5px] font-medium text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl">
            Mỗi Bí tích là một cuộc gặp gỡ thực sự với Chúa Kitô — không phải nghi lễ hình thức mà là hành động thiêng liêng của chính Thiên Chúa qua dấu chỉ hữu hình.
          </p>
        </div>

        <div className="space-y-12 sm:space-y-16">
          {/* Nhóm 1: Khai Tâm */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100/80 dark:bg-amber-900/30 flex items-center justify-center border border-amber-200/50 dark:border-amber-800/30 shadow-sm">
                <span className="text-xl">🌅</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-amber-950 dark:text-amber-50">Các Bí Tích Khai Tâm</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {items.slice(0, 3).map((s, i) => (
                <SacramentCard key={s.id} s={s} i={i} fadeUp={fadeUp} vp={vp} setSelectedSacrament={setSelectedSacrament} />
              ))}
            </div>
          </div>

          {/* Nhóm 2: Chữa Lành */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-100/80 dark:bg-pink-900/30 flex items-center justify-center border border-pink-200/50 dark:border-pink-800/30 shadow-sm">
                <span className="text-xl">🤍</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-amber-950 dark:text-amber-50">Các Bí Tích Chữa Lành</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {items.slice(3, 5).map((s, i) => (
                <SacramentCard key={s.id} s={s} i={i} fadeUp={fadeUp} vp={vp} setSelectedSacrament={setSelectedSacrament} />
              ))}
            </div>
          </div>

          {/* Nhóm 3: Phục Vụ */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100/80 dark:bg-orange-900/30 flex items-center justify-center border border-orange-200/50 dark:border-orange-800/30 shadow-sm">
                <span className="text-xl">🕊️</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-amber-950 dark:text-amber-50">Các Bí Tích Phục Vụ</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {items.slice(5).map((s, i) => (
                <SacramentCard key={s.id} s={s} i={i} fadeUp={fadeUp} vp={vp} setSelectedSacrament={setSelectedSacrament} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

      <AnimatePresence>
        {selectedSacrament && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: APPLE_EASE }}
              onClick={() => setSelectedSacrament(null)}
              className="fixed inset-0 bg-stone-900/40 dark:bg-black/60 backdrop-blur-sm z-50 pointer-events-auto"
            />
            <div data-lenis-prevent className="fixed inset-0 z-[60] flex flex-col justify-end md:items-center md:justify-center p-0 md:p-4 pointer-events-none">
              <motion.div
                role="dialog"
                aria-modal="true"
                drag={isMobile ? "y" : false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.1, bottom: 0.6 }}
                onDragEnd={handleSacramentDragEnd}
                style={{ y: sacramentSheetY }}
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
                    {selectedSacrament.icon}
                  </div>
                  <div className="flex-1 min-w-0 mt-1">
                    <h3 className="font-extrabold font-serif text-[22px] tracking-tight leading-tight truncate">{selectedSacrament.name}</h3>
                    <p className="text-[12px] text-orange-600 dark:text-orange-400 font-bold tracking-widest uppercase mt-1.5">{selectedSacrament.short}</p>
                  </div>
                </div>

                <div className="flex gap-2 px-6 sm:px-8 pb-4 flex-wrap touch-none mt-2">
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 shadow-sm border border-stone-200/50 dark:border-stone-700/50">
                    🏷 {selectedSacrament.details.type}
                  </span>
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 shadow-sm border border-stone-200/50 dark:border-stone-700/50">
                    ✋ {selectedSacrament.details.minister}
                  </span>
                </div>

                <div className="p-6 sm:p-8 pt-4 space-y-6 overflow-y-auto overscroll-contain flex-1 text-left">
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2.5">Ý nghĩa thần học</h4>
                    <p className="text-[14.5px] leading-relaxed text-stone-600 dark:text-stone-300 font-medium">{selectedSacrament.details.meaning}</p>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-stone-50/50 dark:bg-stone-900/30 p-4 sm:p-5 rounded-2xl border border-amber-900/5 dark:border-amber-100/5">
                      <h4 className="text-[12px] font-bold uppercase tracking-widest text-orange-800 dark:text-orange-400 mb-3.5">Nghi thức & Đặc trưng</h4>
                      <p className="text-[14px] leading-relaxed text-stone-700 dark:text-stone-300 font-medium">{selectedSacrament.details.highlight}</p>
                    </div>

                    <div className="text-center text-xl pt-2 tracking-widest select-none opacity-80">
                      {selectedSacrament.details.emoji}
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

function SacramentCard({ s, i, fadeUp, vp, setSelectedSacrament }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={vp}
      custom={i * 0.08}
      whileHover={{ y: -6, scale: 1.01 }}
      onClick={() => setSelectedSacrament(s)}
      className={`group cursor-pointer rounded-[24px] sm:rounded-[32px] border p-6 sm:p-8 flex flex-col transition-all duration-300 hover:shadow-xl active:scale-[0.98] ${s.color}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="w-14 h-14 rounded-2xl bg-orange-100/80 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 text-2xl select-none border border-orange-200/50 dark:border-orange-800/30 shadow-sm">
          {s.icon}
        </div>
        <span className="text-[10px] font-bold px-3 py-1 rounded-full text-orange-700 bg-orange-100/80 dark:text-orange-400 dark:bg-orange-900/30 border border-orange-200/50 dark:border-orange-800/30 shadow-sm uppercase tracking-widest whitespace-nowrap text-center flex-shrink-0">
          Tìm hiểu
        </span>
      </div>
      <h3 className="text-[20px] font-extrabold font-serif text-amber-950 dark:text-amber-50 mb-3">{s.name}</h3>
      <p className="text-[14px] text-stone-500 dark:text-stone-400 leading-relaxed font-medium flex-1">{s.short}</p>
      <span className="mt-5 inline-flex w-fit text-[10px] font-bold px-3 py-1 rounded-full bg-stone-100/80 dark:bg-stone-800/80 text-stone-500 dark:text-stone-400 shadow-sm border border-stone-200/50 dark:border-stone-700/50">
        {s.details.type}
      </span>
    </motion.div>
  );
}
