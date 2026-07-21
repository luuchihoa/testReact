import React, { memo } from "react";
import { motion } from "framer-motion";
import { APPLE_EASE } from "../utils/dovuiUtils.js";

const keyMap = { A: "1", B: "2", C: "3", D: "4" };

const OptionBtn = memo(({ letter, text, state, onClick, onHover, disabled }) => {
  const getStyle = () => {
    switch (state) {
      case "correct":
        return {
          btn: "bg-emerald-50/90 dark:bg-emerald-900/30 border-emerald-500/50 text-emerald-800 dark:text-emerald-300 font-bold shadow-md ring-2 ring-emerald-500/20",
          badge: "bg-emerald-500 text-white border-transparent",
        };
      case "wrong":
        return {
          btn: "bg-red-50/90 dark:bg-red-900/30 border-red-500/50 text-red-800 dark:text-red-300 font-bold shadow-md ring-2 ring-red-500/20",
          badge: "bg-red-500 text-white border-transparent",
        };
      case "dim":
        return {
          btn: "bg-stone-100/40 dark:bg-stone-900/20 border-stone-200/50 dark:border-stone-800/50 text-stone-400 dark:text-stone-600 font-normal opacity-50",
          badge: "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600 border-stone-200 dark:border-stone-700",
        };
      default: // idle
        return {
          btn: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-md border-amber-900/10 dark:border-amber-100/10 text-amber-950 dark:text-amber-50 font-medium hover:bg-stone-50 dark:hover:bg-stone-800 shadow-sm hover:border-amber-500/30",
          badge: "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-amber-900/10 dark:border-amber-100/10",
        };
    }
  };

  const s = getStyle();

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onClick(rect);
  };

  return (
    <motion.button
      className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border-[1.5px] text-left text-[15px] transition-all cursor-pointer select-none min-h-[56px] relative group ${s.btn} ${
        disabled ? "pointer-events-none" : ""
      }`}
      onClick={handleClick}
      onMouseEnter={onHover}
      disabled={disabled}
      whileTap={state === "idle" ? { scale: 0.98 } : {}}
      animate={state === "wrong" ? { x: [0, -6, 6, -4, 4, -2, 2, 0] } : {}}
      transition={state === "wrong" ? { duration: 0.35, ease: "easeInOut" } : { duration: 0.2, ease: APPLE_EASE }}
    >
      <span
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold border ${s.badge} transition-colors duration-300`}
      >
        {state === "correct" ? "✓" : state === "wrong" ? "✕" : letter}
      </span>
      <span className="flex-1 leading-snug">{text}</span>

      {/* Desktop Keycap Badge (Phím tắt 1-4 hoặc A-D trên máy tính) */}
      {keyMap[letter] && state === "idle" && (
        <span className="hidden sm:flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-stone-100 dark:bg-stone-800 border border-stone-300/60 dark:border-stone-700/60 text-stone-400 dark:text-stone-500 flex-shrink-0 shadow-xs group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
          Phím {keyMap[letter]}
        </span>
      )}
    </motion.button>
  );
});

export default OptionBtn;
