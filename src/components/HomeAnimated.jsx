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
  hidden: (c) => ({ opacity: 0, y: c?.m ? 8 : 32 }),  // 16 → 8
  visible: (c) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: c?.m ? 0.5 : 0.8,  // mobile nhanh hơn
      ease: [0.16, 1, 0.3, 1],
      delay: c?.m ? (c?.d || 0) * 0.6 : (c?.d || 0),  // delay ngắn hơn trên mobile
    },
  }),
};

const stagger = {
  hidden: {},
  visible: (m) => ({
    transition: { staggerChildren: m ? 0.08 : 0.15 }  // 0.15 → 0.08 trên mobile
  }),
};

export default function HomeAnimated({ Sections }) {
  const isMobile = useIsMobile();
  const heroRef  = useRef(null);
  const [heroHeight, setHeroHeight] = useState(600); // ← thêm state

  // Đo chiều cao hero sau khi mount
  useEffect(() => {
    if (heroRef.current) setHeroHeight(heroRef.current.offsetHeight);
  }, []);

  const { scrollY } = useScroll();
  // Dùng heroHeight dynamic thay vì 400 cứng
  const heroOpacity = useTransform(scrollY, [heroHeight * 0.3, heroHeight * 0.85], [1, 0]);
  const heroY       = useTransform(scrollY, [0, heroHeight * 0.85], [0, -60]);

  return (
    <div className="bg-[#faf8f5] text-stone-900 antialiased overflow-x-hidden">
      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
           style={{ backgroundImage: `url("data:image/svg+xml,...")` }} />

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative pt-24 pb-24 sm:pt-36 sm:pb-36 lg:pt-52 lg:pb-44 overflow-hidden"
      >
        {/* Ambient glow — tinh tế hơn, 2 nguồn sáng */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-amber-100/50 to-transparent rounded-[100%] blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-gradient-to-tl from-orange-100/30 to-transparent blur-[100px] -z-10" />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY, willChange: "transform, opacity" }}
          className="max-w-4xl mx-auto px-5 sm:px-8 text-center relative z-10"
        >
          <motion.div
            variants={stagger}
            custom={isMobile}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-6 sm:gap-8"
          >

            {/* Badge — dùng DM Mono cho cảm giác precision */}
            <motion.div variants={fadeUp} custom={{ d: 0, m: isMobile }}>
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-amber-400/60 shadow-sm hover:border-amber-400/60 transition-colors cursor-default">
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-800 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600" />
                </span>
                <span
                  className="text-[11px] font-medium text-stone-500 tracking-[0.15em] uppercase"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  Ban Giáo Lý · An Ngãi · 2025
                </span>
              </div>
            </motion.div>

            {/* H1 — Cormorant Garamond, cấu trúc 3 dòng có chủ đích */}
            <motion.h1
              variants={fadeUp}
              custom={{ d: 0.1, m: isMobile }}
              className="w-full"
              style={{ fontFamily: "'Cormorant', Georgia, serif" }}
            >
              {/* Dòng 1 — trái, italic mỏng, màu muted */}
              <span
                className="block text-left text-2xl sm:text-3xl lg:text-[2.6rem] font-light italic text-stone-400 leading-snug tracking-wide pl-1 mb-1"
              >
                Ươm mầm
              </span>

              {/* Dòng 2 — center, cực lớn, weight 600, chữ số vàng inline */}
              <span
                className="block text-center leading-[0.92]"
              >
                <span className="text-[4.2rem] sm:text-[6.5rem] lg:text-[9rem] font-semibold text-stone-900 tracking-tight">
                  Đức Tin
                </span>
              </span>

              {/* Dòng 3 — phải, size vừa, italic amber */}
              <span
                className="block text-right text-2xl sm:text-4xl lg:text-[3.2rem] text-amber-800 font-medium italic leading-snug tracking-wide pr-1 mt-2"
                // style={{ color: "#B8842A" }}
              >
                & Tri Thức
              </span>
            </motion.h1>

            {/* Divider tinh tế */}
            <motion.div
              variants={fadeUp}
              custom={{ d: 0.18, m: isMobile }}
              className="flex items-center gap-4 w-full max-w-xs"
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-amber-300/50" />
              <div className="w-1 h-1 rounded-full bg-amber-400/60" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-amber-300/50" />
            </motion.div>

            {/* Quote Kinh Thánh — DM Sans light italic */}
            <motion.blockquote
              variants={fadeUp}
              custom={{ d: 0.22, m: isMobile }}
              className="max-w-lg mx-auto"
            >
              <p
                className="text-lg sm:text-xl font-light italic text-stone-600 leading-relaxed mb-2"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                "Tôi là ánh sáng đến thế gian, để bất cứ ai tin vào tôi
                thì không ở lại trong bóng tối."
              </p>
              <cite
                className="not-italic text-xs tracking-[0.12em] text-stone-400 uppercase"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Ga 12, 46
              </cite>
            </motion.blockquote>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              custom={{ d: 0.3, m: isMobile }}
              className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto pt-2"
            >
              {/* Primary — amber solid, chữ DM Sans bold */}
              <button
                type="button"
                onClick={() =>
                  document.getElementById("main-content")?.scrollIntoView({ behavior: "smooth" })
                }
                className="group relative inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 rounded-full overflow-hidden hover:scale-[1.03] transition-transform duration-300 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #92400e 0%, #78350f 100%)",
                  boxShadow: "0 8px 32px rgba(120,53,15,0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <span className="text-sm font-semibold text-white tracking-wide">
                  Bắt đầu học hỏi
                </span>
                <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform duration-200" />
              </button>

              {/* Secondary — outline tinh tế */}
              <Link
                to="/giới-thiệu"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-sm font-medium text-stone-600 bg-white/70 backdrop-blur-sm border border-stone-200 rounded-full hover:bg-white hover:border-stone-300 hover:text-stone-800 transition-all"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Tìm hiểu thêm
              </Link>
            </motion.div>

          </motion.div>
        </motion.div>
      </section>

      {/* ── BENTO GRID ── */}
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
                custom={{ m: isMobile, d: idx * 0.05 }}
                whileHover={isMobile ? {} : { y: -6, scale: 1.01 }}
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