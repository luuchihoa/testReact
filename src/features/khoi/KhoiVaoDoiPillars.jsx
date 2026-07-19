import React from "react";
import { motion } from "framer-motion";
import { usePageMotion } from "../../hooks/usePageMotion.js";

export default function KhoiVaoDoiPillars({ items }) {
  const { fadeUp, vp } = usePageMotion();

  return (
    <section id="noi-dung" className="py-20 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-12 relative z-20">
      <div className="max-w-2xl text-left space-y-3 mb-12 sm:mb-16">
        <p className="text-[11px] font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400 ml-1">Trọng tâm đào tạo</p>
        <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50 leading-tight">Ba trụ cột của người Kitô hữu trưởng thành</h2>
        <p className="text-[14px] sm:text-[15.5px] font-medium text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl">
          Mỗi học kỳ đi sâu vào một trụ cột, xoay vòng qua các năm để đảm bảo sự toàn diện trong hành trình đức tin trưởng thành.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
        {items.map((pillar, i) => { 
          const Icon = pillar.icon; 
          return (
            <div key={i} className={i === 1 ? "md:-mt-8 md:mb-8" : ""}>
              <motion.div
                variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={vp}
              custom={i * 0.1}
              whileHover={{ y: -6, scale: 1.01 }}
              className={`rounded-[24px] sm:rounded-[32px] border p-6 sm:p-8 flex flex-col transition-all duration-300 hover:shadow-xl ${pillar.color}`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${pillar.iconBg}`}>
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <h3 className="text-[20px] sm:text-[22px] font-extrabold font-serif text-amber-950 dark:text-amber-50 leading-snug">
                  {pillar.title}
                </h3>
              </div>

              <div className="space-y-3 flex-1 mt-2">
                {pillar.topics.map((topic, j) => (
                  <div key={j} className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-white/40 dark:bg-[#1C1917]/40 border border-amber-900/5 dark:border-amber-100/5 shadow-sm group-hover:bg-white/80 dark:group-hover:bg-[#1C1917]/80 transition-colors">
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${pillar.iconBg.replace('shadow-sm', '')}`}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                    </div>
                    <span className="text-[14px] text-stone-700 dark:text-stone-300 font-medium leading-relaxed">{topic}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            </div>
          ); 
        })}
      </div>
    </section>
  );
}
