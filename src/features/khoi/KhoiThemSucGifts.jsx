import React, { useState, useEffect } from "react";
import { Flame } from "lucide-react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { usePageMotion } from "../../hooks/usePageMotion.js";

const APPLE_EASE = [0.16, 1, 0.3, 1];
const MOBILE_BREAKPOINT = 768;

export default function KhoiThemSucGifts({ items }) {
  const [selectedGift, setSelectedGift] = useState(null);
  const { fadeUp, vp, lenis } = usePageMotion();
  const giftSheetY = useMotionValue(0);

  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleGiftDragEnd = (event, info) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      setSelectedGift(null);
    } else {
      giftSheetY.set(0);
    }
  };

  useEffect(() => {
    if (selectedGift) {
      giftSheetY.set(0);
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
  }, [selectedGift, giftSheetY, lenis]);

  useEffect(() => {
    if (!selectedGift) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedGift(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedGift]);

  return (
    <>
      <section id="bay-on" className="py-20 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-12 relative z-20">
      <div className="max-w-2xl text-left space-y-3 mb-12 sm:mb-16">
        <p className="text-[11px] font-bold tracking-widest uppercase text-yellow-600 dark:text-yellow-400 ml-1">Trọng tâm Đào tạo</p>
        <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50 leading-tight">Bảy Ơn Chúa Thánh Thần</h2>
        <p className="text-[14px] sm:text-[15.5px] font-medium text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl">
          Mỗi ơn ban thiêng liêng được chuyển hóa qua các dụ ngôn Kinh Thánh, liên hệ trực quan giúp các em vững vàng áp dụng vào môi trường học đường và cuộc sống.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map((gift, i) => (
          <motion.div
            key={gift.id}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            custom={i * 0.05}
            whileHover={{ y: -6, scale: 1.01 }}
            onClick={() => setSelectedGift(gift)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedGift(gift); }}
            className={`group text-left rounded-[24px] sm:rounded-[32px] border p-5 sm:p-6 flex flex-col justify-between min-h-[220px] cursor-pointer transition-all duration-300 hover:shadow-xl active:scale-[0.98] ${gift.color}`}
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="text-[28px] select-none filter drop-shadow-sm">{gift.icon}</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm ${gift.badge}`}>
                  Chi tiết
                </span>
              </div>
              <h3 className="text-[17px] sm:text-[19px] font-extrabold font-serif text-amber-950 dark:text-amber-50 md:group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors mb-2.5">{gift.name}</h3>
              <p className="text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed font-medium line-clamp-3">{gift.desc}</p>
            </div>
          </motion.div>
        ))}

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          custom={0.4}
          className="rounded-[24px] sm:rounded-[32px] border border-amber-900/10 dark:border-amber-100/10 p-6 sm:p-8 flex flex-col justify-between bg-yellow-50/50 dark:bg-yellow-900/10 text-left col-span-2 sm:col-span-1 shadow-sm"
        >
          <div>
            <div className="relative w-10 h-10 rounded-full bg-yellow-100/80 dark:bg-yellow-900/40 border border-yellow-200/50 dark:border-yellow-800/30 flex items-center justify-center flex-shrink-0 shadow-sm mb-4">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-yellow-400/30 dark:bg-yellow-500/30 blur-md animate-pulse" />
              <Flame className="w-5 h-5 text-yellow-600 dark:text-yellow-400 fill-current relative z-10" />
            </div>
            <p className="text-[16px] sm:text-[18px] font-medium font-serif leading-relaxed italic text-amber-950 dark:text-amber-50">
              "Tất cả họ đều được tràn đầy ơn Chúa Thánh Thần."
            </p>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-yellow-700/80 dark:text-yellow-400/80 mt-6 text-right">
            — Công vụ 2,4
          </p>
        </motion.div>
      </div>
    </section>

      <AnimatePresence>
        {selectedGift && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: APPLE_EASE }}
              onClick={() => setSelectedGift(null)}
              className="fixed inset-0 bg-stone-900/40 dark:bg-black/60 backdrop-blur-sm z-50 pointer-events-auto"
            />

            <div data-lenis-prevent className="fixed inset-0 z-[60] flex flex-col justify-end md:items-center md:justify-center p-0 md:p-4 pointer-events-none">
              <motion.div
                role="dialog"
                aria-modal="true"
                drag={isMobile ? "y" : false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.1, bottom: 0.6 }}
                onDragEnd={handleGiftDragEnd}
                style={{ y: giftSheetY }}
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

                <div className="flex items-center gap-4 p-6 sm:p-8 pb-4 touch-none border-b border-amber-900/5 dark:border-amber-100/5">
                  <div className="w-14 h-14 rounded-2xl bg-yellow-100/50 dark:bg-stone-800 flex items-center justify-center flex-shrink-0 text-2xl select-none shadow-sm border border-yellow-900/5 dark:border-stone-700/30">
                    {selectedGift.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold font-serif text-[22px] tracking-tight leading-tight truncate">Ơn {selectedGift.name}</h3>
                    <p className="text-[12px] text-yellow-600 dark:text-yellow-400 font-bold uppercase tracking-widest mt-1.5 truncate">Món quà từ Thiên Chúa</p>
                  </div>
                </div>

                <div className="p-6 sm:p-8 pt-5 space-y-6 overflow-y-auto overscroll-contain flex-1 text-left">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2.5">
                        Ý nghĩa cốt lõi
                      </h4>
                      <p className="text-[14.5px] leading-relaxed text-stone-600 dark:text-stone-300 font-medium">
                        {selectedGift.desc}
                      </p>
                    </div>

                    <div className="bg-stone-50/50 dark:bg-stone-900/30 p-4 sm:p-5 rounded-2xl border border-amber-900/5 dark:border-amber-100/5">
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-yellow-700 dark:text-yellow-500 mb-2.5">
                        Ví dụ thực tế trong đời sống
                      </h4>
                      <p className="text-[14px] leading-relaxed text-stone-700 dark:text-stone-300 font-medium italic">
                        "{selectedGift.example}"
                      </p>
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
