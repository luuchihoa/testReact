import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Sparkles, Flame, GraduationCap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLenis } from "lenis/react";

const Sections = [
  {
    path: "/khối-kinh-thánh",
    title: "Khối Kinh Thánh",
    desc: "Khám phá chân lý và tình yêu thương qua từng trang sách Thánh để củng cố nền tảng đức tin.",
    img: "https://lh3.googleusercontent.com/d/1uA0OxFQ-wIbl39uEIn6wAybWCqpNqutc",
    icon: BookOpen,
    badge: "Nền tảng",
    numeral: "I",
    gridClass: "md:col-span-2",
  },
  {
    path: "/khối-phụng-vụ",
    title: "Khối Phụng Vụ",
    desc: "Tìm hiểu sâu sắc về các nghi thức, bí tích và đời sống tâm linh trong các cử hành Phụng vụ giáo hội.",
    img: "https://lh3.googleusercontent.com/d/1sVKWUGTiMvhwoml1qsdmahfLYFML-NGV",
    icon: Sparkles,
    badge: "Tâm linh",
    numeral: "II",
    gridClass: "md:col-span-1",
  },
  {
    path: "/khối-thêm-sức",
    title: "Khối Thêm Sức",
    desc: "Hành trình trưởng thành trong đức tin, sẵn sàng lãnh nhận ơn thiêng từ Chúa Thánh Thần.",
    img: "https://lh3.googleusercontent.com/d/1tnxBqhr_su9_FgK6zdSkLa4h-w7CAlKJ",
    icon: Flame,
    badge: "Trưởng thành",
    numeral: "III",
    gridClass: "md:col-span-1",
  },
  {
    path: "/tài-liệu",
    title: "Tài Liệu Ôn Tập",
    desc: "Hệ thống hóa toàn bộ kiến thức giáo lý thông qua kho đề thi trực quan và đáp án chi tiết.",
    img: "https://lh3.googleusercontent.com/d/1HD_Lv9paf30NMvMzcaS9P-82Ih_g-vXp",
    icon: GraduationCap,
    badge: "Kho tư liệu",
    numeral: "IV",
    gridClass: "md:col-span-2",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

export default function Home() {
  const lenis = useLenis();
  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 antialiased selection:bg-amber-700 selection:text-white overflow-x-hidden">
      {/* ================= HERO ================= */}
      <motion.header
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="max-w-5xl mx-auto px-6 pt-16 pb-12 md:pt-28 md:pb-20 text-center relative overflow-hidden"
      >
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-200/20 blur-[120px] rounded-full -z-10" />
        {/* Subtle paper grain — signature texture */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <motion.div
          variants={fadeInUp}
          className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-amber-50 border border-amber-200/60 text-amber-800 rounded-full mb-6 shadow-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Ban Giáo Lý An Ngãi
        </motion.div>

        <motion.h1
          variants={fadeInUp}
          className="text-3xl md:text-6xl font-serif font-black tracking-tight text-stone-900 mb-6 max-w-3xl mx-auto leading-[1.15]"
        >
          Nuôi dưỡng đức tin
          <br />
          <span className="bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">
            Khơi nguồn tri thức vững vàng
          </span>
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="max-w-xl mx-auto text-sm md:text-base text-stone-500 italic font-medium leading-relaxed mb-8 border-l-2 border-amber-400/40 px-4"
        >
          "Lời Chúa là ngọn đèn soi cho con bước, là ánh sáng chỉ đường cho con đi."
        </motion.p>

        <motion.div variants={fadeInUp} className="flex items-center justify-center gap-4">
          <button
            onClick={() => lenis?.scrollTo("#main-content", { duration: 1.2 })}
            className="inline-flex items-center justify-center rounded-xl text-sm font-semibold bg-amber-800 text-white hover:bg-amber-900 h-11 px-6 shadow-md shadow-amber-900/10 transition-all duration-300 hover:-translate-y-0.5 ease-out"
          >
            Bắt đầu học hỏi
          </button>
          <Link
            to="/giới-thiệu"
            className="inline-flex items-center justify-center rounded-xl text-sm font-semibold border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 h-11 px-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 ease-out"
          >
            Tìm hiểu thêm
          </Link>
        </motion.div>
      </motion.header>

      {/* ================= BENTO GRID ================= */}
      <main id="main-content" className="max-w-5xl mx-auto px-6 scroll-mt-12 pb-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {Sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <motion.div
                key={section.path}
                variants={fadeInUp}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={section.gridClass}
              >
                <Link to={section.path} className="group block h-full">
                  <div className="relative h-full bg-white border border-stone-200/80 rounded-2xl transition-all duration-300 ease-out hover:shadow-xl hover:shadow-amber-900/[0.04] hover:border-amber-400 overflow-hidden flex flex-col sm:flex-row">
                    {/* Ghost numeral — signature element, chapter-marker feel */}
                    <span
                      aria-hidden="true"
                      className="absolute -right-2 -bottom-6 font-serif font-black text-[120px] leading-none text-amber-900/[0.04] select-none pointer-events-none"
                    >
                      {section.numeral}
                    </span>

                    {/* Text block */}
                    <div className="relative w-full sm:w-[65%] flex flex-col justify-between z-10">
                      <div className="p-6 md:p-8 pb-3 flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-800 group-hover:text-white transition-colors duration-300 ease-out flex-shrink-0">
                            <IconComponent className="w-4 h-4 stroke-[2]" />
                          </div>
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200/50">
                            {section.badge}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-stone-900 tracking-tight mb-2">
                          {section.title}
                        </h3>
                        <p className="text-sm text-stone-500 leading-relaxed font-normal break-words">
                          {section.desc}
                        </p>
                      </div>

                      <div className="p-6 md:p-8 pt-0 flex items-center gap-1 text-xs font-bold text-amber-800 opacity-80 group-hover:opacity-100 transition-all duration-300 ease-out">
                        Xem chi tiết
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
                      </div>
                    </div>

                    {/* Image block */}
                    <div className="relative w-full sm:w-[35%] p-6 pt-0 sm:pt-6 sm:pl-0 flex items-center justify-center flex-shrink-0 z-10">
                      <div className="relative flex items-center justify-center aspect-square w-full max-w-[140px] sm:max-w-full rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-100/50 p-3 overflow-hidden shadow-inner">
                        <img
                          src={section.img}
                          alt={section.title}
                          width="320"
                          height="320"
                          className="max-h-full max-w-full object-contain filter mix-blend-multiply drop-shadow-[0_4px_12px_rgba(0,0,0,0.06)] group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </main>
    </div>
  );
}