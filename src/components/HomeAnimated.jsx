import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

/* ─── Hook phát hiện Mobile ──────────────────────────────────── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    setIsMobile(mql.matches);
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

/* ─── Variants (Đồng bộ với TuyenSinh) ────────────────────────── */
const fadeUp = {
  hidden: (c) => ({ opacity: 0, y: c?.m ? 10 : 32 }),
  visible: (c) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: c?.m ? 0 : (c?.d || 0) },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function HomeAnimated({ Sections }) {
  const isMobile = useIsMobile();
  const heroRef = useRef(null);
  const animConfig = { m: isMobile };

  // 1. Kỹ thuật Parallax: Hero sẽ mờ dần và di chuyển nhẹ khi cuộn
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, -50]);

  return (
    <div className="bg-[#faf8f5] text-stone-900 antialiased overflow-x-hidden">
      {/* Noise overlay - Tăng độ mượt cho đồ họa */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* ================= HERO ================= */}
      <motion.header
        ref={heroRef}
        initial="hidden"
        animate="visible"
        style={{ opacity: heroOpacity, y: heroY, willChange: "transform, opacity" }}
        variants={{ visible: { transition: { staggerChildren: isMobile ? 0.03 : 0.08 } } }}
        className="max-w-5xl mx-auto px-6 pt-20 pb-16 md:pt-32 md:pb-24 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-200/20 blur-[120px] rounded-full -z-10" />
        
        <motion.div variants={fadeUp} custom={{ ...animConfig, d: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stone-200 shadow-sm mb-6"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span className="text-xs font-semibold text-stone-600 tracking-wide uppercase">Ban Giáo Lý An Ngãi</span>
        </motion.div>

        <motion.h1 variants={fadeUp} custom={{ ...animConfig, d: 0.1 }}
          className="text-4xl md:text-7xl font-serif font-black tracking-tight text-stone-900 mb-6 max-w-3xl mx-auto leading-[1.1]"
        >
          Nuôi dưỡng đức tin<br />
          <span className="bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent italic">Khơi nguồn tri thức vững vàng</span>
        </motion.h1>

        <motion.p variants={fadeUp} custom={{ ...animConfig, d: 0.2 }}
          className="max-w-xl mx-auto text-base md:text-lg text-stone-500 italic font-medium leading-relaxed mb-10 border-l-2 border-amber-400/40 px-4"
        >
          "Lời Chúa là ngọn đèn soi cho con bước, là ánh sáng chỉ đường cho con đi."
        </motion.p>

        <motion.div variants={fadeUp} custom={{ ...animConfig, d: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => document.getElementById("main-content")?.scrollIntoView({ behavior: "smooth" })}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full text-sm font-bold bg-stone-900 text-white h-14 px-8 shadow-lg hover:scale-105 transition-transform"
          >
            Bắt đầu học hỏi
          </button>
          <Link to="/giới-thiệu"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full text-sm font-semibold border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 h-14 px-8 transition-all"
          >
            Tìm hiểu thêm
          </Link>
        </motion.div>
      </motion.header>

      {/* ================= BENTO GRID (ANIMATED) ================= */}
      <main id="main-content" className="max-w-5xl mx-auto px-6 pb-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: isMobile ? "-20px" : "-100px" }}
          variants={{ visible: { transition: { staggerChildren: isMobile ? 0.04 : 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {Sections.map((section, idx) => {
            const IconComponent = section.icon;
            return (
              <motion.div
                key={section.path}
                variants={fadeUp}
                custom={{ ...animConfig, d: idx * 0.05 }}
                // Chặn hover trên mobile hoàn toàn
                whileHover={isMobile ? {} : { y: -6, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`${section.gridClass} will-change-transform`}
              >
                <Link to={section.path} className="group block h-full">
                  <div className="relative h-full bg-white border border-stone-200/80 rounded-2xl transition-all duration-300 ease-out hover:shadow-xl hover:shadow-amber-900/[0.04] hover:border-amber-400 overflow-hidden flex flex-col sm:flex-row">
                    <span className="absolute -right-2 -bottom-6 font-serif font-black text-[120px] leading-none text-amber-900/[0.04] select-none pointer-events-none">
                      {section.numeral}
                    </span>
                    <div className="relative w-full sm:w-[65%] flex flex-col justify-between z-10 p-6 md:p-8">
                       <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-800 group-hover:text-white transition-colors duration-300">
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <span className="px-2.5 py-0.5 text-xs font-semibold bg-stone-100 text-stone-600 rounded-full">{section.badge}</span>
                          </div>
                          <h3 className="text-xl font-bold text-stone-900 mb-2">{section.title}</h3>
                          <p className="text-sm text-stone-500 leading-relaxed">{section.desc}</p>
                       </div>
                       <div className="pt-4 flex items-center gap-1 text-xs font-bold text-amber-800">
                          Xem chi tiết <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                       </div>
                    </div>
                    <div className="w-full sm:w-[35%] p-6 pt-0 sm:pt-6 sm:pl-0 flex items-center justify-center z-10">
                      <div className="aspect-square w-full max-w-[140px] bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl p-3 flex items-center justify-center shadow-inner">
                        <img src={section.img} alt={section.title} width="320" height="320" className="object-contain mix-blend-multiply" />
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