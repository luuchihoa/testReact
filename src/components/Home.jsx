import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Sparkles, Flame, GraduationCap, ArrowRight, Heart, Star, Globe } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

/* ─────────────────────────────────────────────
   SECTIONS DATA
   Bento 3 cột:
     Hàng 1: [Chiên Con  col-2] [Rước Lễ     col-1]
     Hàng 2: [Thêm Sức col-1] [Phụng Vụ    col-1] [Kinh Thánh col-1]
     Hàng 3: [Vào Đời    col-2] [Tài Liệu    col-1]
───────────────────────────────────────────── */
const Sections = [
  // ── Hàng 1 ──
  {
    path: "/khối-chiên-con",
    title: "Khối Chiên Con",
    desc: "Gieo hạt giống đức tin vào tâm hồn trẻ thơ qua những câu chuyện Kinh Thánh sinh động, bài hát và hoạt động yêu thương.",
    img: "/images/chiencon.avif",
    icon: Heart,
    badge: "Mầm non",
    numeral: "I",
    gridClass: "md:col-span-2",
    isWide: true,
  },
  {
    path: "/khối-rước-lễ",
    title: "Khối Rước Lễ Lần Đầu",
    desc: "Chuẩn bị tâm hồn đón nhận Chúa Giêsu trong Bí tích Thánh Thể lần đầu tiên — hành trình thiêng liêng nhất của tuổi thơ.",
    img: "/images/ruocle.avif",
    icon: Star,
    badge: "Bí tích",
    numeral: "II",
    gridClass: "md:col-span-1",
    isWide: false,
  },
  // ── Hàng 2 ──
  {
    path: "/khối-thêm-sức",
    title: "Khối Thêm Sức",
    desc: "Hành trình trưởng thành trong đức tin, sẵn sàng lãnh nhận ơn thiêng từ Chúa Thánh Thần.",
    img: "/images/themsuc.avif",
    icon: Flame,
    badge: "Trưởng thành",
    numeral: "III",
    gridClass: "md:col-span-1",
    isWide: false,
  },
  {
    path: "/khối-phụng-vụ",
    title: "Khối Phụng Vụ",
    desc: "Tìm hiểu sâu sắc về các nghi thức, bí tích và đời sống tâm linh trong các cử hành Phụng vụ giáo hội.",
    img: "/images/phungvu.avif",
    icon: Sparkles,
    badge: "Tâm linh",
    numeral: "IV",
    gridClass: "md:col-span-1",
    isWide: false,
  },
  {
    path: "/khối-kinh-thánh",
    title: "Khối Kinh Thánh",
    desc: "Khám phá chân lý và tình yêu thương qua từng trang sách Thánh để củng cố nền tảng đức tin.",
    img: "/images/kinhthanh.avif",
    icon: BookOpen,
    badge: "Nền tảng",
    numeral: "V",
    gridClass: "md:col-span-1",
    isWide: false,
  },
  // ── Hàng 3 ──
  {
    path: "/khối-vào-đời",
    title: "Khối Vào Đời",
    desc: "Trang bị hành trang đức tin vững chắc, giúp các bạn trẻ sống chứng nhân giữa lòng xã hội và mang Tin Mừng đến mọi nơi.",
    img: "/images/vaodoi.avif",
    icon: Globe,
    badge: "Vào đời",
    numeral: "VI",
    gridClass: "md:col-span-2",
    isWide: true,
  },
  {
    path: "/tài-liệu",
    title: "Tài Liệu Ôn Tập",
    desc: "Hệ thống hóa toàn bộ kiến thức giáo lý thông qua kho đề thi trực quan và đáp án chi tiết.",
    img: "/images/tailieu.avif",
    icon: GraduationCap,
    badge: "Kho tư liệu",
    numeral: "VII",
    gridClass: "md:col-span-1",
    isWide: false,
  },
];

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

/* ─── Variants ────────────────────────────────────────────────── */
const fadeUp = {
  hidden: (c) => ({ opacity: 0, y: c?.m ? 8 : 32 }),
  visible: (c) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: c?.m ? 0.5 : 0.8,
      ease: [0.16, 1, 0.3, 1],
      delay: c?.m ? (c?.d || 0) * 0.6 : (c?.d || 0),
    },
  }),
};

const stagger = {
  hidden: {},
  visible: (m) => ({
    transition: { staggerChildren: m ? 0.08 : 0.15 },
  }),
};

/* ─────────────────────────────────────────────
   WIDE CARD (col-span-2) — ảnh cột bên phải
───────────────────────────────────────────── */
function WideCard({ section, isMobile }) {
  const Icon = section.icon;
  return (
    <Link to={section.path} className="group block h-full">
      <div className={`relative h-full bg-white border border-stone-200/80 rounded-2xl transition-all duration-300 ease-out ${!isMobile ? "hover:shadow-xl hover:shadow-amber-900/[0.04] hover:border-amber-400" : ""} overflow-hidden flex flex-col sm:flex-row`}>
        {/* Ghost numeral */}
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
              <div className={`flex items-center justify-center w-9 h-9 rounded-xl bg-amber-50 text-amber-700 transition-colors duration-300 ease-out flex-shrink-0 ${!isMobile ? "group-hover:bg-amber-800 group-hover:text-white" : ""}`}>
                <Icon className="w-4 h-4 stroke-[2]" />
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
          <div className={`p-6 md:p-8 pt-0 flex items-center gap-1 text-xs font-bold text-amber-800 opacity-80 transition-all duration-300 ease-out ${!isMobile ? "group-hover:opacity-100" : ""}`}>
            Xem chi tiết
            <ArrowRight className={`w-3.5 h-3.5 transition-transform duration-300 ease-out ${!isMobile ? "group-hover:translate-x-1" : ""}`} />
          </div>
        </div>
 
        {/* Image block */}
        <div className="relative w-full sm:w-[35%] p-6 pt-0 sm:pt-6 sm:pl-0 flex items-center justify-center flex-shrink-0 z-10">
          <div className="relative flex items-center justify-center aspect-square w-full max-w-[140px] sm:max-w-full rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-100/50 p-3 overflow-hidden shadow-inner">
            <img
              src={section.img}
              alt={section.title}
              className={`max-h-full max-w-full object-contain filter mix-blend-multiply drop-shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-transform duration-500 ease-out ${!isMobile ? "group-hover:scale-105" : ""}`}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
 
/* ─────────────────────────────────────────────
   NARROW CARD (col-span-1) — layout dọc
   Ảnh strip trên cùng, text phía dưới.
   Phù hợp với ~330px width trong grid 3 cột.
───────────────────────────────────────────── */
function NarrowCard({ section, isMobile }) {
  const Icon = section.icon;
  return (
    <Link to={section.path} className="group block h-full">
      <div className={`relative h-full bg-white border border-stone-200/80 rounded-2xl transition-all duration-300 ease-out overflow-hidden flex flex-col ${!isMobile ? "hover:shadow-xl hover:shadow-amber-900/[0.04] hover:border-amber-400" : ""}`}>
        {/* Ghost numeral — nhỏ hơn cho card hẹp */}
        <span
          aria-hidden="true"
          className="absolute -right-1 -bottom-4 font-serif font-black text-[80px] leading-none text-amber-900/[0.04] select-none pointer-events-none"
        >
          {section.numeral}
        </span>
 
        {/* Image strip — chiều cao cố định, ảnh fit cover */}
        <div className="relative w-full h-[120px] bg-gradient-to-br from-amber-50 to-orange-50/50 border-b border-amber-100/40 flex items-center justify-center overflow-hidden flex-shrink-0">
          <img
            src={section.img}
            alt={section.title}
            className={`h-full w-full object-contain p-4 filter mix-blend-multiply drop-shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-transform duration-500 ease-out ${!isMobile ? "group-hover:scale-105" : ""}`}
          />
        </div>
 
        {/* Text block */}
        <div className="relative flex flex-col flex-1 z-10">
          <div className="p-5 flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-xl bg-amber-50 text-amber-700 transition-colors duration-300 ease-out flex-shrink-0 ${!isMobile ? "group-hover:bg-amber-800 group-hover:text-white" : ""}`}>
                <Icon className="w-3.5 h-3.5 stroke-[2]" />
              </div>
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold bg-stone-100 text-stone-600 border border-stone-200/50">
                {section.badge}
              </span>
            </div>
            <h3 className="text-[15px] font-bold text-stone-900 tracking-tight mb-1.5 leading-snug">
              {section.title}
            </h3>
            <p className="text-[13px] text-stone-500 leading-relaxed font-normal line-clamp-3">
              {section.desc}
            </p>
          </div>
          <div className={`px-5 pb-5 flex items-center gap-1 text-[11px] font-bold text-amber-800 opacity-80 transition-all duration-300 ease-out ${!isMobile ? "group-hover:opacity-100" : ""}`}>
            Xem chi tiết
            <ArrowRight className="w-3 h-3 transition-transform duration-300 ease-out group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Component chính ────────────────────────────────────────── */
export default function Home() {
  const isMobile = useIsMobile();
  const heroRef = useRef(null);
  const [heroHeight, setHeroHeight] = useState(600);

  useEffect(() => {
    if (heroRef.current) setHeroHeight(heroRef.current.offsetHeight);
  }, []);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [heroHeight * 0.3, heroHeight * 0.85], [1, 0]);
  const heroY = useTransform(scrollY, [0, heroHeight * 0.85], [0, -60]);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 antialiased selection:bg-amber-700 selection:text-white overflow-x-hidden">
      {/* Noise overlay */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          willChange: "transform",
          contain: "strict",
        }}
      />exit
      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative pt-20 pb-20 sm:pt-32 sm:pb-32 overflow-hidden"
      >
        {/* Ambient glow */}
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
            className="flex flex-col items-center gap-4 sm:gap-6"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} custom={{ d: 0, m: isMobile }}>
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-amber-400/60 shadow-sm transition-colors cursor-default">
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-800 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600" />
                </span>
                <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
                  Ban Giáo Lý · An Ngãi · {new Date().getFullYear()}
                </span>
              </div>
            </motion.div>

            {/* H1 */}
            <motion.h1
              variants={fadeUp}
              custom={{ d: 0.1, m: isMobile }}
              className="w-full"
              style={{ fontFamily: "'Cormorant', Georgia, serif" }}
            >
              <span className="block text-left text-2xl sm:text-3xl lg:text-4xl font-light italic text-stone-400 leading-snug tracking-wide pl-1 mb-1">
                Ươm mầm
              </span>
              <span className="block text-center leading-[0.92]">
                <span className="text-4xl sm:text-6xl lg:text-8xl font-semibold text-stone-900 tracking-tight">
                  Đức Tin
                </span>
              </span>
              <span className="block text-right text-2xl sm:text-4xl lg:text-4xl text-amber-800 font-medium italic leading-snug tracking-wide pr-1 mt-2">
                & Tri Thức
              </span>
            </motion.h1>

            {/* Divider */}
            <motion.div
              variants={fadeUp}
              custom={{ d: 0.18, m: isMobile }}
              className="flex items-center gap-4 w-full max-w-xs"
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-amber-300/50" />
              <div className="w-1 h-1 rounded-full bg-amber-400/60" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-amber-300/50" />
            </motion.div>

            {/* Quote */}
            <motion.blockquote
              variants={fadeUp}
              custom={{ d: 0.22, m: isMobile }}
              className="max-w-lg mx-auto"
            >
              <p
                className="text-lg sm:text-xl font-light italic text-stone-600 leading-relaxed mb-2"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                "Tôi là ánh sáng đến thế gian, để bất cứ ai tin vào tôi thì không ở lại trong bóng
                tối."
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
              <button
                type="button"
                onClick={() =>
                  document.getElementById("main-content")?.scrollIntoView({ behavior: "smooth" })
                }
                className={`group relative inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 rounded-full overflow-hidden ${!isMobile ? "hover:scale-[1.03]" : ""} transition-transform duration-300 cursor-pointer`}
                style={{
                  background: "linear-gradient(135deg, #92400e 0%, #78350f 100%)",
                  boxShadow:
                    "0 8px 32px rgba(120,53,15,0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <span className="text-sm font-semibold text-white tracking-wide">
                  Bắt đầu học hỏi
                </span>
                <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform duration-200" />
              </button>

              <Link
                to="/giới-thiệu"
                className={`inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-sm font-medium text-stone-600 bg-white/70 backdrop-blur-sm border border-stone-200 rounded-full ${!isMobile ? "hover:bg-white hover:border-stone-300 hover:text-stone-800" : ""} transition-all`}
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
          className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
        >
          {Sections.map((section) => (
            <motion.div
              key={section.path}
              variants={fadeUp}
              className={`${section.gridClass} transition-all duration-300 ease-out ${!isMobile ? "hover:-translate-y-1.5 hover:scale-[1.01]" : ""}`}
            >
              {section.isWide
                ? <WideCard section={section} isMobile={isMobile}/>
                : <NarrowCard section={section} isMobile={isMobile}/>
              }
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}