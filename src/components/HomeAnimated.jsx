import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

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
  hidden: (c) => ({ opacity: 0, y: c?.m ? 16 : 32 }),
  visible: (c) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: c?.d || 0 },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function HomeAnimated({ Sections }) {
  const isMobile = useIsMobile();
  const animConfig = { m: isMobile };

  return (
    <>
      {/* ================= HERO (ANIMATED) ================= */}
      <motion.header
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="max-w-5xl mx-auto px-6 pt-16 pb-12 md:pt-28 md:pb-20 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-200/15 blur-[120px] rounded-full -z-10 pointer-events-none" />
        
        <motion.div
          variants={fadeUp} custom={{ ...animConfig, d: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-amber-50 border border-amber-200/60 text-amber-800 rounded-full mb-6 shadow-sm will-change-transform"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Ban Giáo Lý An Ngãi
        </motion.div>

        <motion.h1
          variants={fadeUp} custom={{ ...animConfig, d: 0.1 }}
          className="text-3xl md:text-6xl font-serif font-black tracking-tight text-stone-900 mb-6 max-w-3xl mx-auto leading-[1.15] will-change-transform"
        >
          Nuôi dưỡng đức tin<br />
          <span className="bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">Khơi nguồn tri thức vững vàng</span>
        </motion.h1>

        <motion.p
          variants={fadeUp} custom={{ ...animConfig, d: 0.2 }}
          className="max-w-xl mx-auto text-sm md:text-base text-stone-500 italic font-medium leading-relaxed mb-8 border-l-2 border-amber-400/40 px-4 will-change-transform"
        >
          "Lời Chúa là ngọn đèn soi cho con bước, là ánh sáng chỉ đường cho con đi."
        </motion.p>

        <motion.div variants={fadeUp} custom={{ ...animConfig, d: 0.3 }} className="flex items-center justify-center gap-4">
          <button
            onClick={() => document.getElementById("main-content")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center justify-center rounded-xl text-sm font-semibold bg-amber-800 text-white hover:bg-amber-900 h-11 px-6 shadow-md shadow-amber-900/10 transition-all duration-300 hover:-translate-y-0.5"
          >
            Bắt đầu học hỏi
          </button>
          <Link
            to="/giới-thiệu"
            className="inline-flex items-center justify-center rounded-xl text-sm font-semibold border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 h-11 px-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5"
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
          variants={stagger}
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
    </>
  );
}