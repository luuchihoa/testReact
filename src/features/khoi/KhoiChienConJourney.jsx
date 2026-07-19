import React, { useState } from "react";
import { motion } from "framer-motion";
import { usePageMotion } from "../../hooks/usePageMotion.js";

export default function KhoiChienConJourney({ items }) {
  const { fadeUp, vp } = usePageMotion();
  const [flipped, setFlipped] = useState({});

  const toggleFlip = (index) => {
    setFlipped((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <section id="chuong-trinh" className="py-20 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-12 relative z-20">
      <div className="max-w-2xl text-left space-y-3 mb-12 sm:mb-16">
        <p className="text-[12px] font-bold tracking-widest uppercase text-pink-600 dark:text-pink-400 ml-1">Chương trình học</p>
        <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50 leading-tight">
          Hành trình khám phá
        </h2>
        <p className="text-[14px] sm:text-[15.5px] font-medium text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl">
          Nhấn vào từng thẻ để khám phá xem các bé sẽ được học và chơi những gì trong mỗi học kỳ nhé!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 sm:gap-8 perspective-1000">
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
              className="relative w-full h-[320px] sm:h-[350px] cursor-pointer group"
              style={{ perspective: "1000px" }}
              onClick={() => toggleFlip(i)}
            >
              <motion.div
                className="w-full h-full relative preserve-3d transition-all duration-700"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 60, damping: 15 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Mặt trước (Front) */}
                <div
                  className={`absolute inset-0 backface-hidden w-full h-full rounded-[32px] sm:rounded-[40px] border p-8 flex flex-col items-center justify-center text-center shadow-md hover:shadow-xl transition-shadow ${item.color}`}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="absolute top-4 right-5 opacity-40 text-[11px] font-bold uppercase tracking-widest">
                    Chạm để xem
                  </div>
                  <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center mb-6 shadow-sm ${item.iconBg}`}>
                    <Icon className="w-12 h-12 sm:w-14 sm:h-14" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-[22px] sm:text-[26px] font-extrabold font-serif text-amber-950 dark:text-amber-50 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[14px] mt-3 font-medium text-stone-500 dark:text-stone-400">
                    {item.subtitle}
                  </p>
                </div>

                {/* Mặt sau (Back) */}
                <div
                  className={`absolute inset-0 backface-hidden w-full h-full rounded-[32px] sm:rounded-[40px] border p-8 shadow-xl bg-white dark:bg-stone-800 border-stone-200/50 dark:border-stone-700/50`}
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="h-full flex flex-col justify-center">
                    <h4 className="text-[13px] font-bold uppercase tracking-widest text-pink-500 mb-5 text-center">
                      Nội dung chính
                    </h4>
                    <ul className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-thin">
                      {item.topics.map((topic, j) => (
                        <li key={j} className="flex items-start gap-3.5 text-[15px] text-stone-700 dark:text-stone-200 font-medium leading-relaxed">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${item.dot}`} />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
