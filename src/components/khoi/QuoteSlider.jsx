import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuoteSlider({ quotes }) {
  const [cur, setCur] = useState(0);
  const [dir, setDir] = useState(1);
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDir(1);
      setCur((p) => (p + 1) % quotes.length);
    }, 6000);
  }, [quotes.length]);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [resetTimer]);

  const variants = {
    enter: (d) => ({ x: d > 0 ? "20%" : "-20%", opacity: 0, scale: 0.95 }),
    center: { x: "0%", opacity: 1, scale: 1 },
    exit: (d) => ({ x: d > 0 ? "-20%" : "20%", opacity: 0, scale: 0.95 }),
  };

  if (!quotes || quotes.length === 0) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 relative">
      {/* Khối ẩn để giữ chiều cao cố định */}
      <div className="invisible pointer-events-none select-none aria-hidden relative w-full" style={{ visibility: 'hidden' }}>
        <div className="p-8 flex flex-col">
          <p className="text-lg md:text-xl font-medium leading-relaxed italic">"{quotes[0].text}"</p>
          <p className="text-xs font-bold pt-2 mt-2">({quotes[0].src})</p>
        </div>
      </div>
      
    <div className="absolute -inset-y-10 inset-x-0 overflow-hidden px-6 py-10">
        <AnimatePresence initial={false} custom={dir} mode="wait">
          <motion.div
            key={cur}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            // SỬA TẠI ĐÂY: Đổi nền thành trắng ở light mode, xám đen ở dark mode và thêm viền nhẹ
            className="w-full h-full bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-[2rem] shadow-xl p-8 flex flex-col justify-center text-center touch-pan-y"
          >
            {/* SỬA TẠI ĐÂY: Đổi màu chữ chính thành màu tối ở light mode, màu sáng ở dark mode */}
            <p className="text-stone-800 dark:text-stone-100 text-lg md:text-xl font-medium leading-relaxed italic select-none">
              "{quotes[cur].text}"
            </p>
            {/* SỬA TẠI ĐÂY: Đổi màu chữ phụ thành màu xám trung tính */}
            <p className="text-stone-500 dark:text-stone-400 text-xs font-bold tracking-widest uppercase mt-6 select-none">
              — {quotes[cur].src} —
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}