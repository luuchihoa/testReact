import React from "react";
import { motion } from "framer-motion";
import { BookHeart, ShieldCheck, HandHeart, Sparkles } from "lucide-react";
import { usePageMotion } from "../../hooks/usePageMotion.js";

const PARENT_ROLES = [
  {
    icon: BookHeart,
    title: "Lắng nghe Lời Chúa cùng con",
    desc: "Cha mẹ là giáo lý viên đầu tiên của trẻ. Cùng con đọc kinh tối và ôn lại bài học giáo lý giúp con thẩm thấu Đức tin một cách tự nhiên nhất.",
    color: "bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 border-amber-200/50",
    colSpan: "md:col-span-2",
  },
  {
    icon: ShieldCheck,
    title: "Làm gương sáng",
    desc: "Đời sống đạo đức của cha mẹ (xưng tội, tham dự Thánh Lễ) là tấm gương phản chiếu rõ ràng nhất tình yêu của Thiên Chúa cho trẻ.",
    color: "bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border-rose-200/50",
    colSpan: "md:col-span-1",
  },
  {
    icon: HandHeart,
    title: "Đồng hành thực hành",
    desc: "Cha mẹ cùng con tập nghi thức rước lễ tại nhà, giúp con chuẩn bị tâm hồn sốt sắng nhất trước ngày trọng đại.",
    color: "bg-teal-50 dark:bg-teal-900/10 text-teal-600 dark:text-teal-400 border-teal-200/50",
    colSpan: "md:col-span-3",
  },
];

export default function KhoiRuocLeParents() {
  const { fadeUp, vp } = usePageMotion();

  return (
    <section className="py-20 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
      <div className="text-center space-y-3 mb-16">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} custom={0}>
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-stone-800 shadow-sm border border-stone-200/50 dark:border-stone-700/50 text-amber-500 mb-4">
            <Sparkles className="w-6 h-6" />
          </span>
        </motion.div>
        
        <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} custom={0.1} className="text-[11px] font-bold tracking-widest uppercase text-lime-600 dark:text-lime-400 ml-1">
          Góc Phụ Huynh
        </motion.p>
        
        <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} custom={0.2} className="text-[28px] sm:text-[36px] font-extrabold font-serif tracking-tight text-stone-900 dark:text-stone-50 leading-tight">
          Hội Thánh Tại Gia
        </motion.h2>
        
        <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} custom={0.3} className="text-[14px] sm:text-[15.5px] font-medium text-stone-500 dark:text-stone-400 leading-relaxed max-w-2xl mx-auto">
          "Gia đình là trường học đầu tiên về các đức tính xã hội mà mọi hiệp hội đều cần đến." Giai đoạn chuẩn bị Rước lễ lần đầu đòi hỏi sự đồng hành sâu sát từ chính cha mẹ của các em.
        </motion.p>
      </div>

      <motion.div 
        initial="hidden" 
        whileInView="visible" 
        viewport={vp}
        variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        className="grid md:grid-cols-3 gap-5 sm:gap-6"
      >
        {PARENT_ROLES.map((role, i) => {
          const Icon = role.icon;
          return (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i * 0.1 + 0.3}
              whileHover={{ y: -4 }}
              className={`rounded-[24px] sm:rounded-[32px] border p-6 sm:p-8 flex flex-col bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl border-amber-900/5 dark:border-amber-100/5 shadow-sm hover:shadow-lg transition-all duration-300 ${role.colSpan}`}
            >
              <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center mb-5 border ${role.color}`}>
                <Icon className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <h3 className="text-[18px] sm:text-[20px] font-extrabold font-serif text-stone-900 dark:text-stone-50 mb-3">
                {role.title}
              </h3>
              <p className="text-[14.5px] text-stone-600 dark:text-stone-300 font-medium leading-relaxed">
                {role.desc}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
