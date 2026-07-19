import React from "react";
import { motion } from "framer-motion";
import { usePageMotion } from "../../hooks/usePageMotion.js";

export default function ProgramSyllabus({
  items,
  title = "Hành trình một năm học",
  description = "Chương trình được chia thành 2 học kỳ, mỗi chủ đề kéo dài 2–3 buổi để các em có đủ thời gian thấm nhuần qua nhiều hình thức học tập trực quan.",
  eyebrowLabel = "Chương trình học",
  accentTextClass = "text-amber-600 dark:text-amber-400",
}) {
  const { fadeUp, vp } = usePageMotion();

  // Hiệu ứng cho từng gạch đầu dòng (bullet point)
  const itemVariant = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <section id="chuong-trinh" className="py-20 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-12 relative z-10">
      <div className="max-w-2xl text-left space-y-3 mb-12 sm:mb-16">
        <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} custom={0} className={`text-[11px] font-bold tracking-widest uppercase ml-1 ${accentTextClass}`}>
          {eyebrowLabel}
        </motion.p>
        <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} custom={0.1} className="text-[28px] sm:text-[36px] md:text-[40px] font-extrabold font-serif tracking-tight text-stone-900 dark:text-stone-50 leading-tight">
          {title}
        </motion.h2>
        <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} custom={0.2} className="text-[14px] sm:text-[15.5px] font-medium text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl">
          {description}
        </motion.p>
      </div>

      <motion.div 
        initial="hidden" 
        whileInView="visible" 
        viewport={vp}
        variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        className="grid md:grid-cols-2 gap-5 sm:gap-6"
      >
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i * 0.1 + 0.3}
              whileHover={{ y: -6, scale: 1.01 }}
              className={`rounded-[24px] sm:rounded-[32px] border p-6 sm:p-8 flex flex-col transition-all duration-300 relative shadow-sm hover:shadow-xl ${item.color}`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <h3 className="text-[18px] sm:text-[20px] font-extrabold font-serif text-stone-900 dark:text-stone-50 leading-snug">
                  {item.title}
                </h3>
              </div>

              <motion.ul 
                initial="hidden" 
                whileInView="visible" 
                viewport={vp}
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                className="space-y-4 flex-1"
              >
                {item.topics.map((topic, j) => (
                  <motion.li variants={itemVariant} key={j} className="flex items-start gap-3.5 text-[14.5px] text-stone-600 dark:text-stone-300 font-medium leading-relaxed">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 ${item.dot}`} />
                    <span>{topic}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
