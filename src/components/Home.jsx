import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Sparkles, Flame, GraduationCap, ArrowRight, Heart, Star, Globe } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

/* ─────────────────────────────────────────────
   SECTIONS DATA
───────────────────────────────────────────── */
const Sections = [
  // ── Hàng 1 ──
  {
    path: "/khối-chiên-con",
    title: "Khối Chiên Con",
    desc: "Gieo hạt giống đức tin vào tâm hồn trẻ thơ qua những câu chuyện Kinh Thánh sinh động, bài hát và hoạt động yêu thương.",
    img: "/images/khoichiencon.avif",
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
    img: "/images/khoiruoclelandau.avif",
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
    img: "/images/khoithemsuc.avif",
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
    img: "/images/khoiphungvu.avif",
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
    img: "/images/khoikinhthanh.avif",
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
    img: "/images/khoivaodoi.avif",
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
// Khởi tạo state ngay bằng giá trị matchMedia thực tế (lazy init) thay vì
// luôn bắt đầu bằng `false` rồi sửa lại trong useEffect — tránh việc toàn bộ
// cây component phải re-render/đổi animation config ngay sau khi mount,
// vốn là nguyên nhân chính gây cảm giác giật trên mobile.
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  });

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

/* ─── Variants ────────────────────────────────────────────────── */
// Dùng cho bento grid bên dưới (trigger khi cuộn tới, whileInView)
const fadeUp = {
  hidden: (c) => ({ opacity: 0, y: c?.m ? 12 : 32 }),
  visible: (c) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: c?.m ? 0.5 : 0.8,
      ease: [0.16, 1, 0.3, 1],
      delay: c?.m ? (c?.d || 0) * 0.4 : (c?.d || 0),
    },
  }),
};

// ── Kỹ thuật Fade Up / Reveal của KhoiChienCon áp dụng cho HERO ──
// Khác với `fadeUp` ở trên (tween + parent stagger container), mỗi phần tử
// hero tự "initial → animate" độc lập ngay khi mount, dùng spring vật lý
// thay vì tween cubic-bezier. Spring không cần cả cụm tính toán timeline
// chung như stagger container, nên không còn hiện tượng cả hero "bung ra"
// cùng một lúc trên máy yếu — mỗi phần tử tự rơi vào đúng nhịp của nó.
const heroReveal = {
  hidden: { opacity: 0, y: 24 },
  visible: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 18, mass: 0.7, delay: d },
  }),
};

/* ─────────────────────────────────────────────
   WIDE CARD (col-span-2) — Thiết kế chuẩn Apple
───────────────────────────────────────────── */
function WideCard({ section, isMobile }) {
  const Icon = section.icon;
  return (
    <Link to={section.path} className="group block h-full outline-none">
      <div className={`relative h-full bg-white dark:bg-stone-900/95 md:dark:bg-stone-900/60 md:backdrop-blur-xl border border-stone-200/80 dark:border-stone-800 rounded-[28px] transition-all duration-300 ease-out overflow-hidden flex flex-col sm:flex-row active:scale-[0.98] ${!isMobile ? "md:hover:shadow-2xl md:hover:shadow-stone-200/50 dark:md:hover:shadow-black/40 md:hover:border-stone-300 dark:md:hover:border-stone-700" : ""}`}>
        {/* Ghost numeral */}
        <span
          aria-hidden="true"
          className="absolute -right-2 -bottom-6 font-serif font-black text-[120px] leading-none text-stone-900/[0.03] dark:text-white/[0.02] select-none pointer-events-none"
        >
          {section.numeral}
        </span>
 
        {/* Text block */}
        <div className="relative w-full sm:w-[65%] flex flex-col justify-between z-10">
          <div className="p-6 md:p-8 pb-3 flex-1">
            <div className="flex items-center justify-between mb-5">
              <div className={`flex items-center justify-center w-10 h-10 rounded-2xl bg-amber-50/80 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500 transition-colors duration-300 ease-out flex-shrink-0 ${!isMobile ? "md:group-hover:bg-amber-100 dark:md:group-hover:bg-amber-500/20" : ""}`}>
                <Icon className="w-4.5 h-4.5 stroke-[2]" />
              </div>
              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-stone-100/80 text-stone-600 border border-stone-200/50 dark:bg-stone-800/80 dark:text-stone-400 dark:border-stone-700/50">
                {section.badge}
              </span>
            </div>
            <h3 className="text-[22px] font-semibold text-stone-900 dark:text-stone-100 tracking-tight mb-2.5">
              {section.title}
            </h3>
            <p className="text-[14px] text-stone-500 dark:text-stone-400 leading-relaxed font-normal">
              {section.desc}
            </p>
          </div>
          <div className={`p-6 md:p-8 pt-0 flex items-center gap-1.5 text-[13px] font-semibold text-amber-700 dark:text-amber-500 opacity-90 transition-all duration-300 ease-out ${!isMobile ? "md:group-hover:opacity-100" : ""}`}>
            Xem chi tiết
            <ArrowRight className={`w-3.5 h-3.5 transition-transform duration-300 ease-out ${!isMobile ? "md:group-hover:translate-x-1" : ""}`} />
          </div>
        </div>
 
        {/* Image block */}
        <div className="relative w-full sm:w-[35%] p-6 pt-0 sm:pt-6 sm:pl-0 flex items-center justify-center flex-shrink-0 z-10">
          <div className="relative flex items-center justify-center aspect-square w-full max-w-[150px] sm:max-w-full rounded-[20px] bg-gradient-to-br from-stone-50 to-stone-100/50 dark:from-stone-800/40 dark:to-stone-900/40 border border-stone-200/50 dark:border-stone-700/30 p-4 overflow-hidden shadow-inner">
            <img
              src={section.img}
              alt={section.title}
              loading="eager"
              fetchpriority="high"
              className={`max-h-full max-w-full object-contain filter drop-shadow-sm dark:brightness-90 transition-transform duration-500 ease-out ${!isMobile ? "md:group-hover:scale-105" : ""}`}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
 
/* ─────────────────────────────────────────────
   NARROW CARD (col-span-1)
───────────────────────────────────────────── */
function NarrowCard({ section, isMobile }) {
  const Icon = section.icon;
  return (
    <Link to={section.path} className="group block h-full outline-none">
      <div className={`relative h-full bg-white dark:bg-stone-900/95 md:dark:bg-stone-900/60 md:backdrop-blur-xl border border-stone-200/80 dark:border-stone-800 rounded-[28px] transition-all duration-300 ease-out overflow-hidden flex flex-col active:scale-[0.98] ${!isMobile ? "md:hover:shadow-2xl md:hover:shadow-stone-200/50 dark:md:hover:shadow-black/40 md:hover:border-stone-300 dark:md:hover:border-stone-700" : ""}`}>
        {/* Ghost numeral */}
        <span
          aria-hidden="true"
          className="absolute -right-1 -bottom-4 font-serif font-black text-[80px] leading-none text-stone-900/[0.03] dark:text-white/[0.02] select-none pointer-events-none"
        >
          {section.numeral}
        </span>
 
        {/* Image strip */}
        <div className="relative w-full h-[140px] bg-gradient-to-br from-stone-50 to-stone-100/50 dark:from-stone-800/40 dark:to-stone-900/40 border-b border-stone-200/40 dark:border-stone-800/60 flex items-center justify-center overflow-hidden flex-shrink-0">
          <img
            src={section.img}
            alt={section.title}
            loading="lazy"
            decoding="async"
            className={`h-full w-full object-contain p-5 filter drop-shadow-sm dark:brightness-90 transition-transform duration-500 ease-out ${!isMobile ? "md:group-hover:scale-105" : ""}`}
          />
        </div>
 
        {/* Text block */}
        <div className="relative flex flex-col flex-1 z-10">
          <div className="p-6 flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center justify-center w-9 h-9 rounded-[14px] bg-amber-50/80 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500 transition-colors duration-300 ease-out flex-shrink-0 ${!isMobile ? "md:group-hover:bg-amber-100 dark:md:group-hover:bg-amber-500/20" : ""}`}>
                <Icon className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-stone-100/80 text-stone-600 border border-stone-200/50 dark:bg-stone-800/80 dark:text-stone-400 dark:border-stone-700/50">
                {section.badge}
              </span>
            </div>
            <h3 className="text-[17px] font-semibold text-stone-900 dark:text-stone-100 tracking-tight mb-2 leading-snug">
              {section.title}
            </h3>
            <p className="text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed font-normal line-clamp-3">
              {section.desc}
            </p>
          </div>
          <div className={`px-6 pb-6 flex items-center gap-1.5 text-[12px] font-semibold text-amber-700 dark:text-amber-500 opacity-90 transition-all duration-300 ease-out ${!isMobile ? "md:group-hover:opacity-100" : ""}`}>
            Xem chi tiết
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 ease-out md:group-hover:translate-x-1" />
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

  // Đo chiều cao hero TRƯỚC khi trình duyệt paint (useLayoutEffect) thay vì
  // sau khi paint (useEffect), để tránh giá trị mặc định 600 "nhảy" sang giá
  // trị thật ngay trước mắt người dùng — đây là nguồn gây giật ở đầu trang.
  useLayoutEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    setHeroHeight(el.offsetHeight);

    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect?.height;
      if (h) setHeroHeight(h);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [heroHeight * 0.3, heroHeight * 0.85], [1, 0]);
  const heroY = useTransform(scrollY, [0, heroHeight * 0.85], [0, -60]);

  // Trên mobile rút ngắn khoảng cách delay giữa các phần tử hero (nhịp nhanh
  // hơn, tổng thời gian reveal ngắn lại) để giảm số animation chạy song song
  // tại bất kỳ thời điểm nào — máy yếu càng ít việc cùng lúc càng mượt.
  const heroDelay = (d) => (isMobile ? d * 0.6 : d);

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 antialiased selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-amber-100 overflow-x-hidden transition-colors duration-300">
      {/* Noise overlay — bộ lọc feTurbulence rất tốn GPU để rasterize/composite
          lại trên di động, đặc biệt vì layer này "fixed" và luôn nằm trên cùng.
          Chỉ bật ở desktop (md:block), ẩn hoàn toàn trên mobile để cuộn mượt hơn. */}
      <div
        aria-hidden="true"
        className="hidden md:block fixed inset-0 pointer-events-none z-50 opacity-[0.03] dark:opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          willChange: "transform",
          contain: "strict",
        }}
      />
      
      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative pt-24 pb-20 sm:pt-36 sm:pb-32 overflow-hidden"
      >
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-amber-100/50 to-transparent dark:from-amber-900/10 rounded-[100%] blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-gradient-to-tl from-orange-100/30 to-transparent dark:from-orange-900/10 blur-[100px] -z-10 pointer-events-none" />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY, willChange: "transform, opacity" }}
          className="max-w-4xl mx-auto px-5 sm:px-8 text-center relative z-10"
        >
          <div className="flex flex-col items-center gap-5 sm:gap-7">
            {/* Badge */}
            <motion.div
              variants={heroReveal}
              initial="hidden"
              animate="visible"
              custom={heroDelay(0)}
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200 dark:border-stone-800 shadow-sm transition-colors cursor-default">
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 tracking-widest uppercase">
                  Ban Giáo Lý · An Ngãi · {new Date().getFullYear()}
                </span>
              </div>
            </motion.div>

            {/* H1 */}
            <motion.h1
              variants={heroReveal}
              initial="hidden"
              animate="visible"
              custom={heroDelay(0.08)}
              className="w-full"
              style={{ fontFamily: "'Cormorant', Georgia, serif" }}
            >
              <span className="block text-left text-2xl sm:text-3xl lg:text-4xl font-light italic text-stone-400 dark:text-stone-500 leading-snug tracking-wide pl-1 mb-1 sm:mb-2">
                Ươm mầm
              </span>
              <span className="block text-center leading-[0.92]">
                <span className="text-[44px] sm:text-7xl lg:text-[100px] font-semibold text-stone-900 dark:text-stone-100 tracking-tighter">
                  Đức Tin
                </span>
              </span>
              <span className="block text-right text-2xl sm:text-4xl lg:text-4xl text-amber-700 dark:text-amber-500 font-medium italic leading-snug tracking-wide pr-1 mt-2 sm:mt-4">
                & Tri Thức
              </span>
            </motion.h1>

            {/* Divider */}
            <motion.div
              variants={heroReveal}
              initial="hidden"
              animate="visible"
              custom={heroDelay(0.16)}
              className="flex items-center gap-4 w-full max-w-[280px]"
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-stone-300 dark:to-stone-700" />
              <div className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-700" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-stone-300 dark:to-stone-700" />
            </motion.div>

            {/* Quote */}
            <motion.blockquote
              variants={heroReveal}
              initial="hidden"
              animate="visible"
              custom={heroDelay(0.24)}
              className="max-w-lg mx-auto px-4"
            >
              <p
                className="text-[17px] sm:text-xl font-light italic text-stone-600 dark:text-stone-400 leading-relaxed mb-3"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                "Tôi là ánh sáng đến thế gian, để bất cứ ai tin vào tôi thì không ở lại trong bóng
                tối."
              </p>
              <cite
                className="not-italic text-[10px] sm:text-xs font-bold tracking-[0.15em] text-stone-400 dark:text-stone-500 uppercase"
                style={{ fontFamily: "'SF Mono', 'DM Mono', monospace" }}
              >
                Ga 12, 46
              </cite>
            </motion.blockquote>

            {/* CTAs */}
            <motion.div
              variants={heroReveal}
              initial="hidden"
              animate="visible"
              custom={heroDelay(0.32)}
              className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto pt-4 px-6 sm:px-0"
            >
              <button
                type="button"
                onClick={() =>
                  document.getElementById("main-content")?.scrollIntoView({ behavior: "smooth" })
                }
                className={`group relative inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 rounded-full overflow-hidden bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 active:scale-[0.98] ${!isMobile ? "md:hover:bg-stone-800 dark:md:hover:bg-white" : ""} transition-all duration-300 cursor-pointer shadow-sm`}
                style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}
              >
                <span className="text-[14px] font-semibold tracking-wide">
                  Bắt đầu học hỏi
                </span>
                <ArrowRight className="w-4 h-4 opacity-80 md:group-hover:translate-x-1 transition-transform duration-200" />
              </button>

              <Link
                to="/giới-thiệu"
                className={`inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-[14px] font-semibold text-stone-700 dark:text-stone-300 bg-white/70 dark:bg-stone-900/70 backdrop-blur-md border border-stone-200 dark:border-stone-800 rounded-full active:scale-[0.98] ${!isMobile ? "md:hover:bg-white dark:md:hover:bg-stone-800 md:hover:border-stone-300 dark:md:hover:border-stone-700" : ""} transition-all duration-300 shadow-sm`}
                style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}
              >
                Tìm hiểu thêm
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── BENTO GRID ── */}
      <main id="main-content" className="max-w-5xl mx-auto px-5 sm:px-6 md:pb-24 pb-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: isMobile ? "-20px" : "-100px" }}
          variants={{ visible: { transition: { staggerChildren: isMobile ? 0.04 : 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6"
        >
          {Sections.map((section) => (
            <motion.div
              key={section.path}
              variants={fadeUp}
              className={`${section.gridClass}`}
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