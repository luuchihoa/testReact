import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageMotion } from "../../hooks/usePageMotion.js";

// Hằng số Easing chuyển động chuẩn hệ thống Apple HIG
const APPLE_EASE = [0.16, 1, 0.3, 1];

export default function QuoteSlider({ quotes, accentTextClass = "text-amber-800/60 dark:text-amber-400/60" }) {
  const { fadeUp, vp } = usePageMotion();
  const [cur, setCur] = useState(0);
  const [dir, setDir] = useState(1);
  const timerRef = useRef(null);

  // Hàm tự động chuyển slide sau mỗi 6 giây
  const nextQuote = useCallback(() => {
    setDir(1);
    setCur((p) => (p + 1) % quotes.length);
  }, [quotes.length]);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(nextQuote, 6000);
  }, [nextQuote]);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [resetTimer]);

  const variants = {
    enter: (d) => ({ 
      x: d > 0 ? "12%" : "-12%", 
      opacity: 0, 
      scale: 0.96 
    }),
    center: { 
      x: "0%", 
      opacity: 1, 
      scale: 1 
    },
    exit: (d) => ({ 
      x: d > 0 ? "-12%" : "12%", 
      opacity: 0, 
      scale: 0.96 
    }),
  };

  if (!quotes || quotes.length === 0) return null;

  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} custom={0.2} className="w-full max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
      <div 
        className="overflow-hidden py-4 sm:px-12"
        style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)', maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)' }}
      >
        <AnimatePresence initial={false} custom={dir} mode="wait">
          <motion.div
            key={cur}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: APPLE_EASE }}
            // Đồng bộ Glassmorphism, bo góc chuẩn hệ thống và hỗ trợ vuốt chạm mượt mà
            className="w-full bg-white/90 dark:bg-[#1C1917]/90 border border-amber-900/10 dark:border-amber-100/10 rounded-[28px] sm:rounded-[32px] shadow-sm p-6 sm:p-10 flex flex-col justify-center text-center backdrop-blur-xl touch-pan-y"
          >
            {/* Sử dụng font Serif uy nghi, đồng bộ tone màu Amber/Stone */}
            <p className="text-amber-950 dark:text-amber-50 text-[17px] sm:text-[20px] md:text-[22px] font-medium font-serif leading-relaxed italic select-none">
              "{quotes[cur].text}"
            </p>
            
            {/* Nhãn nguồn trích dẫn dạng in hoa cách điệu */}
            <p className={`text-[10px] sm:text-[11px] font-bold tracking-widest uppercase mt-6 sm:mt-8 select-none ${accentTextClass}`}>
              — {quotes[cur].src} —
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}