import React, { useState, useEffect } from "react";
import { Flame } from "lucide-react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { usePageMotion } from "../../hooks/usePageMotion.js";

const APPLE_EASE = [0.16, 1, 0.3, 1];
const MOBILE_BREAKPOINT = 768;

export default function KhoiKinhThanhTestament({ items }) {
  const [selectedTestament, setSelectedTestament] = useState(null);
  const { fadeUp, vp, lenis } = usePageMotion();
  const sheetY = useMotionValue(0);

  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDragEnd = (event, info) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      setSelectedTestament(null);
    } else {
      sheetY.set(0);
    }
  };

  useEffect(() => {
    if (selectedTestament) {
      sheetY.set(0);
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
  }, [selectedTestament, sheetY, lenis]);

  useEffect(() => {
    if (!selectedTestament) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedTestament(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTestament]);

  return (
    <>
      <section id="noi-dung" className="py-20 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-12 relative z-20">
      <div className="max-w-2xl text-left space-y-3 mb-12 sm:mb-16">
        <p className="text-[11px] font-bold tracking-widest uppercase text-red-600 dark:text-red-400 ml-1">Chương trình</p>
        <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50 leading-tight">Hành trình qua 73 quyển sách</h2>
        <p className="text-[14px] sm:text-[15.5px] font-medium text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl">
          Từ "Khởi đầu Thiên Chúa sáng tạo" đến lời kết "Amen" của sách Khải Huyền — một dòng chảy cứu độ trải dài hàng ngàn năm lịch sử, được các em khám phá theo từng quyển sách.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
        {items.map((t, i) => (
          <motion.div
            key={t.id}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            custom={i * 0.05}
            whileHover={{ y: -6, scale: 1.01 }}
            onClick={() => setSelectedTestament(t)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedTestament(t); }}
            className={`group text-left rounded-[24px] sm:rounded-[32px] border p-6 sm:p-8 flex flex-col justify-between min-h-[220px] cursor-pointer transition-all duration-300 hover:shadow-xl active:scale-[0.98] ${t.color}`}
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="text-[28px] select-none filter drop-shadow-sm">{t.icon}</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${t.badge}`}>
                  {t.count}
                </span>
              </div>
              <h3 className="text-[20px] sm:text-[22px] font-extrabold font-serif text-amber-950 dark:text-amber-50 md:group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors mb-2.5">{t.name}</h3>
              <p className="text-[14px] text-stone-500 dark:text-stone-400 leading-relaxed font-medium line-clamp-3">{t.desc}</p>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="w-full bg-stone-100 dark:bg-stone-800/50 rounded-full h-1.5 overflow-hidden flex-shrink-0">
                <div 
                  className={`h-full rounded-full ${t.id === 'cuu-uoc' ? 'bg-red-500 w-[63%]' : 'bg-rose-500 w-[37%]'}`} 
                />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full ${t.badge}`}>
                  Xem danh mục
                </span>
              </div>
            </div>
          </motion.div>
        ))}

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          custom={0.3}
          className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] border border-red-900/10 dark:border-red-100/10 p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-red-50/80 to-white dark:from-red-900/20 dark:to-[#1C1917] text-left sm:col-span-2 shadow-sm"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-400/10 dark:bg-red-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-red-100/80 dark:bg-red-900/40 border border-red-200/50 dark:border-red-800/30 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
              <Flame className="w-5 h-5 text-red-600 dark:text-red-400 fill-current drop-shadow-sm" />
            </div>
            <p className="text-[17px] sm:text-[19px] font-semibold font-serif leading-relaxed italic text-amber-950 dark:text-amber-50 mt-1">
              "Lời Thiên Chúa là ngọn đèn soi cho con bước, là ánh sáng chỉ đường con đi."
            </p>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-red-700/80 dark:text-red-400/80 mt-6 text-right relative z-10">
            — Thánh Vịnh 119,105
          </p>
        </motion.div>
      </div>
    </section>

      <AnimatePresence>
        {selectedTestament && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: APPLE_EASE }}
              onClick={() => setSelectedTestament(null)}
              className="fixed inset-0 bg-stone-900/40 dark:bg-black/60 backdrop-blur-sm z-50 pointer-events-auto"
            />

            <div data-lenis-prevent className="fixed inset-0 z-[60] flex flex-col justify-end md:items-center md:justify-center p-0 md:p-4 pointer-events-none">
              <motion.div
                role="dialog"
                aria-modal="true"
                drag={isMobile ? "y" : false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.1, bottom: 0.6 }}
                onDragEnd={handleDragEnd}
                style={{ y: sheetY }}
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
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl select-none ${selectedTestament.iconBg}`}>
                    {selectedTestament.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold font-serif text-[22px] tracking-tight leading-tight truncate">{selectedTestament.name}</h3>
                    <p className="text-[12px] text-red-600 dark:text-red-400 font-bold uppercase tracking-widest mt-1.5">{selectedTestament.count}</p>
                  </div>
                </div>

                <div className="p-6 sm:p-8 pt-4 space-y-6 overflow-y-auto overscroll-contain flex-1 text-left">
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2.5">
                      Ý nghĩa cốt lõi
                    </h4>
                    <p className="text-[14.5px] leading-relaxed text-stone-600 dark:text-stone-300 font-medium">
                      {selectedTestament.desc}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {selectedTestament.books.map((group, j) => (
                      <div key={j} className="bg-stone-50/50 dark:bg-stone-900/30 p-4 sm:p-5 rounded-2xl border border-amber-900/5 dark:border-amber-100/5">
                        <h4 className="text-[12px] font-bold uppercase tracking-widest text-amber-900 dark:text-amber-500 mb-3.5">
                          {group.group}
                        </h4>
                        <div className="flex flex-wrap gap-2 sm:gap-2.5 mt-3">
                          {group.items.map((item, k) => {
                            const match = item.match(/^(.*?)\s*\((.*?)\)$/);
                            const name = match ? match[1] : item;
                            const abbr = match ? match[2] : "";
                            
                            return (
                              <div key={k} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1C1917] border border-stone-200/50 dark:border-stone-700/50 shadow-sm text-[13px] font-medium text-stone-700 dark:text-stone-300">
                                <span className="truncate">{name}</span>
                                {abbr && (
                                  <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">
                                    {abbr}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
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
