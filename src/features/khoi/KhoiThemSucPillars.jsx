import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, Users, MoveRight } from "lucide-react";
import { usePageMotion } from "../../hooks/usePageMotion.js";

const MODULES = [
  {
    phase: "Học Kỳ 1: Ai là tôi trong Chúa Thánh Thần?",
    weeks: "16 buổi",
    icon: Lightbulb,
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-yellow-500/40 shadow-sm",
    iconBg: "bg-yellow-100/80 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-800/30 shadow-sm",
    badge: "text-yellow-700 bg-yellow-100/80 dark:text-yellow-400 dark:bg-yellow-900/30 border border-yellow-200/50 dark:border-yellow-800/30 shadow-sm",
    dot: "bg-yellow-500",
    topics: ["Chúa Thánh Thần — Ngôi Ba Thiên Chúa", "7 ơn Chúa Thánh Thần và ý nghĩa", "Ôn lại hành trình từ lúc Rửa Tội", "Bí tích Hoà Giải — chuẩn bị tâm hồn"],
  },
  {
    phase: "Học Kỳ 2: Tôi được sai đi",
    weeks: "18 buổi",
    icon: Users,
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-orange-500/40 shadow-sm",
    iconBg: "bg-orange-100/80 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/30 shadow-sm",
    badge: "text-orange-700 bg-orange-100/80 dark:text-orange-400 dark:bg-orange-900/30 border border-orange-200/50 dark:border-orange-800/30 shadow-sm",
    dot: "bg-orange-500",
    topics: ["Sứ mạng ngôn sứ — làm chứng cho Chúa", "Sứ mạng tư tế — cầu nguyện và phụng thờ", "Sứ mạng vương đế — phục vụ và lãnh đạo", "Nghi thức Bí tích Thêm Sức & tập dượt"],
  },
];

export default function KhoiThemSucPillars() {
  const { fadeUp, vp } = usePageMotion();

  return (
    <section className="py-20 sm:py-24 bg-stone-50/50 dark:bg-[#1C1917]/50 border-y border-amber-900/5 dark:border-amber-100/5 relative z-10 overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[300px] bg-yellow-400/10 dark:bg-yellow-900/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <div className="max-w-2xl text-left space-y-3 mb-12 sm:mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-yellow-600 dark:text-yellow-400 ml-1">Khung đào tạo</p>
          <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50 leading-tight">Hai Trụ Cột Chuẩn Bị Tâm Hồn</h2>
          <p className="text-[14px] sm:text-[15.5px] font-medium text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl">
            Chương trình một năm được xây dựng quanh hai trụ cột chính, dẫn dắt các em từ nhận biết bản thân trong Chúa Thánh Thần đến sẵn sàng dấn thân sống sứ mạng.
          </p>
        </div>

        <div className="relative">
          {/* Connector Line for Desktop */}
          <div className="hidden md:block absolute top-1/2 left-[calc(50%-20px)] w-[40px] h-10 -translate-y-1/2 z-20 flex items-center justify-center">
            <div className="absolute w-[80px] h-[2px] bg-gradient-to-r from-transparent via-amber-300 dark:via-amber-700 to-transparent" />
            <div className="w-8 h-8 rounded-full bg-white dark:bg-[#1C1917] border border-amber-200 dark:border-amber-800 shadow-sm flex items-center justify-center relative z-10 text-amber-500">
              <MoveRight className="w-4 h-4" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-10">
            {MODULES.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={vp}
                  custom={i * 0.15}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className={`relative group rounded-[24px] sm:rounded-[32px] border p-6 sm:p-8 flex flex-col transition-all duration-300 hover:shadow-xl ${mod.color}`}
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${mod.iconBg}`}>
                      <Icon className="w-6 h-6" strokeWidth={2.5} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm ${mod.badge}`}>
                      {mod.weeks}
                    </span>
                  </div>

                  <h3 className="text-[20px] sm:text-[22px] font-extrabold font-serif text-amber-950 dark:text-amber-50 md:group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors mb-6 leading-snug">
                    {mod.phase}
                  </h3>

                  <ul className="space-y-4 flex-1">
                    {mod.topics.map((topic, j) => (
                      <li key={j} className="flex items-start gap-3.5 text-[14.5px] text-stone-600 dark:text-stone-300 font-medium leading-relaxed">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 ${mod.dot} shadow-sm`} />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
