import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from "framer-motion";
import { usePageMotion } from "../../hooks/usePageMotion.js";

export default function KhoiChienConJourney({ items }) {
  const { fadeUp, vp } = usePageMotion();
  const shouldReduceMotion = useReducedMotion();
  const [flipped, setFlipped] = useState({});

  const toggleFlip = (index) => {
    setFlipped((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <section id="chuong-trinh" className="py-20 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-12 relative z-20">
      <div className="max-w-2xl text-left space-y-3 mb-12 sm:mb-16">
        <p className="text-xs font-bold tracking-widest uppercase text-pink-900 dark:text-pink-200 ml-1">Chương trình học</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50 leading-tight">
          Hành trình khám phá
        </h2>
        <p className="text-sm sm:text-base font-medium text-[#38433a] dark:text-stone-200 leading-relaxed max-w-xl">
          Nhấn vào từng thẻ để khám phá xem các bé sẽ được học và chơi những gì trong mỗi học kỳ nhé!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
        {items.map((item, i) => {
          const Icon = item.icon;
          const isFlipped = !!flipped[i];

          return (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={vp}
              custom={i * 0.15}
              role="button"
              tabIndex={0}
              aria-label={`${item.title} - ${isFlipped ? "Đang mở nội dung" : "Chạm để xem nội dung"}`}
              aria-expanded={isFlipped}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleFlip(i);
                }
              }}
              className="relative w-full min-h-[340px] sm:min-h-[380px] cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded-[32px] sm:rounded-[40px] flex flex-col"
              style={shouldReduceMotion ? {} : { perspective: "1000px" }}
              onClick={() => toggleFlip(i)}
            >
              {shouldReduceMotion ? (
                /* Chế độ Reduced Motion: Chuyển đổi nội dung trực tiếp không dùng 3D flip */
                <div
                  className={`w-full min-h-[340px] sm:min-h-[380px] rounded-[32px] sm:rounded-[40px] border p-6 sm:p-8 flex flex-col justify-center transition-[box-shadow,border-color] duration-200 shadow-md hover:shadow-xl ${
                    isFlipped
                      ? "bg-white dark:bg-stone-800 border-stone-200/60 dark:border-stone-700/60"
                      : item.color
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-pink-900 dark:text-pink-200 bg-pink-100 dark:bg-pink-950/70 border border-pink-200/80 dark:border-pink-800/60 px-3 py-1 rounded-full shadow-xs">
                      {isFlipped ? "Đang xem nội dung (chạm để đóng)" : "Chạm để xem chi tiết"}
                    </span>
                  </div>

                  {!isFlipped ? (
                    <div className="flex flex-col items-center justify-center text-center py-4">
                      <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-4 shadow-xs ${item.iconBg}`}>
                        <Icon className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2.5} />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-extrabold font-serif text-amber-950 dark:text-amber-50 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-sm mt-2 font-medium text-stone-700 dark:text-stone-200">
                        {item.subtitle}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col justify-center">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-pink-900 dark:text-pink-200 mb-4 text-center">
                        Nội dung chính — {item.title}
                      </h4>
                      <ul className="space-y-3.5 flex-1 pr-1">
                        {item.topics.map((topic, j) => (
                          <li key={j} className="flex items-start gap-3.5 text-sm sm:text-base text-stone-700 dark:text-stone-200 font-medium leading-relaxed">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${item.dot}`} />
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                /* Chế độ Standard Motion: 3D Flip mượt mà co giãn chiều cao */
                <motion.div
                  className="w-full min-h-[340px] sm:min-h-[380px] relative transition-[box-shadow,border-color] duration-500 flex-1 flex flex-col"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 60, damping: 15 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Mặt trước (Front) */}
                  <div
                    className={`absolute inset-0 backface-hidden w-full h-full rounded-[32px] sm:rounded-[40px] border p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-md hover:shadow-xl transition-shadow ${item.color}`}
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="absolute top-4 right-5">
                      <span className="text-xs font-bold uppercase tracking-widest text-pink-900 dark:text-pink-200 bg-pink-100 dark:bg-pink-950/70 border border-pink-200/80 dark:border-pink-800/60 px-3 py-1 rounded-full shadow-xs">
                        Chạm để xem
                      </span>
                    </div>
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-5 shadow-xs ${item.iconBg}`}>
                      <Icon className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold font-serif text-amber-950 dark:text-amber-50 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-sm mt-2.5 font-medium text-stone-700 dark:text-stone-200">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Mặt sau (Back) */}
                  <div
                    className="absolute inset-0 backface-hidden w-full h-full rounded-[32px] sm:rounded-[40px] border p-6 sm:p-8 shadow-xl bg-white dark:bg-stone-800 border-stone-200/60 dark:border-stone-700/60 flex flex-col justify-center"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <div className="h-full flex flex-col justify-center">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-pink-900 dark:text-pink-200 mb-4 text-center">
                        Nội dung chính — {item.title}
                      </h4>
                      <ul className="space-y-3.5 flex-1 overflow-y-auto pr-2 scrollbar-thin">
                        {item.topics.map((topic, j) => (
                          <li key={j} className="flex items-start gap-3.5 text-sm sm:text-base text-stone-700 dark:text-stone-200 font-medium leading-relaxed">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${item.dot}`} />
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
