import React, { memo } from "react";
import { motion } from "framer-motion";
import { APPLE_EASE } from "../utils/dovuiUtils.js";

const ReviewModal = memo(({ history, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      data-lenis-prevent
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ ease: APPLE_EASE }}
        className="w-full max-w-[540px] max-h-[85vh] bg-[#FDFBF7] dark:bg-[#1C1917] rounded-3xl border border-amber-900/10 dark:border-amber-100/10 shadow-2xl flex flex-col overflow-hidden"
        data-lenis-prevent
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-900/10 dark:border-amber-100/10 bg-white/60 dark:bg-stone-900/60 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <h3 className="text-[17px] font-bold font-serif text-amber-950 dark:text-amber-50 m-0">
              Chi Tiết Bài Làm ({history.filter((h) => h.isCorrect).length}/{history.length} câu đúng)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Question List */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-5" data-lenis-prevent>
          {history.map((item, idx) => {
            const q = item.question;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border ${
                  item.isCorrect
                    ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/30"
                    : "bg-red-50/40 dark:bg-red-950/20 border-red-500/30"
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className={`flex-shrink-0 w-6 h-6 rounded-full text-[12px] font-bold flex items-center justify-center text-white ${
                      item.isCorrect ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  >
                    {item.isCorrect ? "✓" : "✕"}
                  </span>
                  <p className="flex-1 text-[15px] font-bold text-amber-950 dark:text-amber-50 m-0 leading-relaxed">
                    Câu {idx + 1}: {q.text}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 pl-9">
                  {Object.entries(q.choices).map(([key, text]) => {
                    const isChosen = item.selectedKey === key;
                    const isCorrect = item.correctKey === key;
                    let style = "bg-white/60 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400";
                    if (isCorrect) {
                      style = "bg-emerald-100 dark:bg-emerald-900/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold";
                    } else if (isChosen && !isCorrect) {
                      style = "bg-red-100 dark:bg-red-900/50 border-red-500 text-red-900 dark:text-red-200 font-bold line-through";
                    }

                    return (
                      <div
                        key={key}
                        className={`px-3 py-2 rounded-xl border text-[13.5px] flex items-center justify-between ${style}`}
                      >
                        <span>
                          <strong>{key}.</strong> {text}
                        </span>
                        {isCorrect && <span className="text-[12px] text-emerald-600 dark:text-emerald-400 font-bold">✓ Đáp án đúng</span>}
                        {isChosen && !isCorrect && <span className="text-[12px] text-red-600 dark:text-red-400 font-bold">Bạn chọn</span>}
                      </div>
                    );
                  })}
                </div>

                {(q.explanation || q.reference) && (
                  <div className="mt-3 ml-9 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 text-[13px] text-amber-900 dark:text-amber-300">
                    {q.reference && <div className="font-semibold text-amber-700 dark:text-amber-400 mb-0.5">📌 Trích dẫn: {q.reference}</div>}
                    {q.explanation && <div>💡 {q.explanation}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-amber-900/10 dark:border-amber-100/10 bg-white/60 dark:bg-stone-900/60 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white text-[14px] font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
});

export default ReviewModal;
