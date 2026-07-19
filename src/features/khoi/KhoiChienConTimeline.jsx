import React from "react";
import { motion } from "framer-motion";
import { Sun, Users, Music, BookOpen, Brush } from "lucide-react";
import { usePageMotion } from "../../hooks/usePageMotion.js";

const TIMELINE = [
  {
    time: "07:30",
    title: "Đón bé & Vòng tròn",
    desc: "Cô giáo đón bé, cùng nhau ngồi thành vòng tròn lớn để chào hỏi và chia sẻ niềm vui đầu tuần.",
    icon: Users,
    color: "text-rose-500",
    bg: "bg-rose-100 dark:bg-rose-900/30",
  },
  {
    time: "07:45",
    title: "Cầu nguyện & Hát ca",
    desc: "Tập hát những bài hát thiếu nhi vui nhộn kèm cử điệu, dâng ngày mới lên cho Chúa Giêsu.",
    icon: Music,
    color: "text-amber-500",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
  {
    time: "08:15",
    title: "Nghe kể chuyện",
    desc: "Lắng nghe những câu chuyện Kinh Thánh qua tranh ảnh lớn, búp bê hoặc các mẩu chuyện cổ tích đạo đức.",
    icon: BookOpen,
    color: "text-pink-500",
    bg: "bg-pink-100 dark:bg-pink-900/30",
  },
  {
    time: "08:45",
    title: "Góc sáng tạo",
    desc: "Các bé được tô màu, làm thủ công giấy (như làm thiệp, cắt dán con chiên nhỏ) để ôn lại bài học.",
    icon: Brush,
    color: "text-purple-500",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
];

export default function KhoiChienConTimeline() {
  const { fadeUp, vp } = usePageMotion();

  return (
    <section className="py-20 sm:py-24 bg-rose-50/50 dark:bg-[#1C1917]/50 border-y border-rose-900/5 dark:border-rose-100/5 relative z-10 overflow-hidden">
      {/* Decorative background clouds/blobs */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-pink-200/40 dark:bg-pink-900/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-200/40 dark:bg-amber-900/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
        <div className="text-center space-y-3 mb-16 sm:mb-20">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-stone-800 shadow-sm border border-rose-100 dark:border-rose-900/30 mb-2">
            <Sun className="w-6 h-6 text-amber-500" />
          </div>
          <h2 className="text-[28px] sm:text-[36px] font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50 leading-tight">
            Một buổi sáng của bé
          </h2>
          <p className="text-[14px] sm:text-[15.5px] font-medium text-stone-500 dark:text-stone-400 max-w-lg mx-auto leading-relaxed">
            Môi trường an toàn, vui vẻ và tràn ngập tình yêu thương. Phụ huynh hoàn toàn yên tâm khi gửi gắm các thiên thần nhỏ vào sáng Chủ Nhật.
          </p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[39px] sm:left-1/2 top-0 bottom-0 w-0.5 bg-rose-200/50 dark:bg-rose-800/30 sm:-translate-x-1/2" />

          <div className="space-y-12 sm:space-y-16">
            {TIMELINE.map((item, i) => {
              const Icon = item.icon;
              const isEven = i % 2 === 0;

              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={vp}
                  custom={i * 0.2}
                  className={`relative flex items-start sm:items-center flex-col sm:flex-row gap-6 sm:gap-8 ${
                    isEven ? "sm:flex-row-reverse" : ""
                  }`}
                >
                  {/* Center Node */}
                  <div className="absolute left-[20px] sm:left-1/2 top-0 sm:top-1/2 -translate-y-1/2 sm:-translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-4 border-[#FDFBF7] dark:border-[#1C1917] bg-white shadow-sm flex items-center justify-center z-10">
                    <div className={`w-3 h-3 rounded-full ${item.bg.split(" ")[0].replace("100", "500")}`} />
                  </div>

                  {/* Content Box */}
                  <div className={`w-full sm:w-1/2 pl-20 sm:pl-0 ${isEven ? "sm:pr-12 text-left sm:text-right" : "sm:pl-12 text-left"}`}>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-bold tracking-widest mb-3 border border-stone-200/50 dark:border-stone-700/50 shadow-sm bg-white dark:bg-stone-800 ${item.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {item.time}
                    </div>
                    <h3 className="text-[18px] sm:text-[20px] font-extrabold font-serif text-amber-950 dark:text-amber-50 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-[14px] leading-relaxed font-medium text-stone-600 dark:text-stone-400">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
