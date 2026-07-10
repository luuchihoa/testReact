import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Heart, Music, Palette, Users, BookOpen, Clock, CalendarDays, ArrowRight, ChevronLeft, Star, GraduationCap, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useLenis } from "lenis/react";
import { useMotionConfig } from "../hooks/useMotionConfig.js";

const OVERVIEW = [
  { icon: Users,        label: "Độ tuổi",    value: "Mầm non - Lớp 2" },
  { icon: Clock,        label: "Thời lượng", value: "45 phút / buổi" },
  { icon: CalendarDays, label: "Lịch học",   value: "Chúa Nhật" },
  { icon: GraduationCap,label: "Sĩ số",      value: "20 em / lớp" },
];

const CHUONG_TRINH = [
  {
    icon: Heart,
    title: "Học Kỳ 1: Thiên Chúa yêu con",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-pink-500/50 dark:hover:border-pink-500/50",
    iconBg: "bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400",
    dot: "bg-pink-500",
    topics: [
      "Thiên Chúa yêu thương tôi",
      "Chúa Giêsu — người bạn tốt nhất",
      "Gia đình là quà tặng của Chúa",
      "Cầu nguyện cùng Chúa mỗi ngày",
      "Bài hát Kinh Lạy Cha & Kinh Kính Mừng",
    ],
  },
  {
    icon: Star,
    title: "Học Kỳ 2: Khám phá Lời Chúa",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-amber-500/50 dark:hover:border-amber-500/50",
    iconBg: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    topics: [
      "Thánh Kinh kể chuyện — Ông Nô-ê",
      "Thánh Kinh kể chuyện — Chúa Giêsu Giáng Sinh",
      "Chủ Nhật — Ngày của Chúa",
      "Yêu thương và chia sẻ",
      "Nghi thức Bí tích Rửa Tội (cơ bản)",
    ],
  },
];

const HIGHLIGHTS = [
  {
    icon: Music,
    title: "Học qua bài hát",
    desc: "Mỗi chủ đề gắn với 1–2 bài hát đơn giản, giúp các em nhớ lâu và cảm nhận đức tin qua giai điệu.",
  },
  {
    icon: Palette,
    title: "Hoạt động thủ công",
    desc: "Tô màu tranh Kinh Thánh, xếp giấy, làm thiệp — học qua đôi tay và trí tưởng tượng.",
  },
  {
    icon: BookOpen,
    title: "Kể chuyện Kinh Thánh",
    desc: "Các câu chuyện được kể bằng hình ảnh trực quan, búp bê và tranh minh họa sống động.",
  },
  {
    icon: Heart,
    title: "Môi trường yêu thương",
    desc: "Lớp học nhỏ (≤20 em), giáo lý viên được đào tạo chuyên biệt về tâm lý trẻ mầm non.",
  },
];

const QUOTES = [
  { text: "Cứ để trẻ nhỏ đến với Thầy, đừng ngăn cấm chúng, vì Nước Trời là của những ai giống như chúng.", src: "Mt 19,14" },
  { text: "Tôi là Mục Tử nhân lành, Tôi biết chiên của Tôi và chiên của Tôi biết Tôi.", src: "Ga 10,14" },
  { text: "Hãy để ánh sáng nhỏ của con chiếu soi trước mặt mọi người.", src: "Mt 5,16" },
  { text: "Ai tiếp đón một em nhỏ như em này vì danh Thầy, là tiếp đón chính Thầy.", src: "Mt 18,5" },
  { text: "Chúa chăn dắt tôi, tôi chẳng thiếu thốn gì.", src: "Tv 23,1" },
];

function QuoteSlider({ quotes }) {
  const [cur, setCur] = useState(0);
  const [dir, setDir] = useState(1);
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDir(1);
      setCur((p) => (p + 1) % quotes.length);
    }, 6000);
  }, [quotes.length]);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [resetTimer]);

  const variants = {
    enter: (d) => ({ x: d > 0 ? "20%" : "-20%", opacity: 0, scale: 0.95 }),
    center: { x: "0%", opacity: 1, scale: 1 },
    exit: (d) => ({ x: d > 0 ? "-20%" : "20%", opacity: 0, scale: 0.95 }),
  };

  if (!quotes || quotes.length === 0) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 relative">
      <div className="invisible pointer-events-none select-none aria-hidden relative w-full" style={{ visibility: "hidden" }}>
        <div className="p-8 flex flex-col">
          <p className="text-lg md:text-xl font-medium leading-relaxed italic">"{quotes[0].text}"</p>
          <p className="text-xs font-bold pt-2 mt-2">({quotes[0].src})</p>
        </div>
      </div>
      <div className="absolute inset-0 overflow-hidden px-6">
        <AnimatePresence initial={false} custom={dir} mode="wait">
          <motion.div
            key={cur}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full h-full bg-stone-900 dark:bg-stone-100 rounded-[2rem] shadow-2xl p-8 flex flex-col justify-center text-center touch-pan-y"
          >
            <p className="text-stone-100 dark:text-stone-900 text-lg md:text-xl font-medium leading-relaxed italic select-none">
              "{quotes[cur].text}"
            </p>
            <p className="text-stone-400 dark:text-stone-500 text-xs font-bold tracking-widest uppercase mt-6 select-none">
              — {quotes[cur].src} —
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function KhoiChienCon() {
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const lenis = useLenis();

  const systemConfig = useMotionConfig();
  const mc = systemConfig || {
    yOffset: 30,
    duration: (d) => d || 0.6,
    delay: (d) => d || 0,
    stagger: 0.08,
    isMobile: false,
    reduced: false,
    vp: () => ({ once: true, margin: "-12% 0px" }),
    heroParallax: [0, -60],
  };

  const heroY = useTransform(scrollY, [0, 600], mc.heroParallax || [0, -60]);

  const fadeUp = {
    hidden: { opacity: 0, y: mc.yOffset },
    visible: (d = 0) => ({
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 90, damping: 15, mass: 0.8, delay: mc.delay(d) },
    }),
  };

  const vp = mc.vp();

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-stone-900 dark:bg-[#09090b] dark:text-stone-50 antialiased overflow-x-hidden selection:bg-pink-500/20 dark:selection:bg-pink-500/30 transition-colors duration-500">

      {/* HERO SECTION */}
      <section ref={heroRef} className="relative overflow-hidden pt-12 pb-20 md:pt-32 md:pb-32 bg-gradient-to-b from-white via-[#f5f5f7] to-transparent dark:from-stone-900 dark:via-[#09090b]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <motion.div style={{ y: heroY }} className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="md:col-span-7 space-y-6 text-left">
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-pink-500/10 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300">
                  <Heart className="w-3 h-3 fill-current" /> Khối Chiên Con
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={0.06} className="text-4xl sm:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight leading-[1.08]">
                Hạt giống<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 dark:from-pink-400 dark:via-rose-400 dark:to-red-400">
                  đức tin đầu đời
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={0.12} className="text-base sm:text-lg text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl font-normal">
                Giai đoạn mầm non đến lớp 2 là thời điểm vàng để gieo vào tâm hồn trẻ thơ tình yêu với Thiên Chúa — qua những câu chuyện, bài hát và hoạt động sáng tạo phù hợp lứa tuổi.
              </motion.p>

              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.18} className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => {
                    const target = document.getElementById("chuong-trinh");
                    if (!target) return;
                    lenis ? lenis.scrollTo(target, { duration: 1 }) : target.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full text-xs font-bold text-white shadow-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-white active:scale-[0.98] transition-all duration-200"
                >
                  Xem chương trình <ArrowRight className="w-4 h-4" />
                </button>
                <Link to="/tuyển-sinh#dang-ky"
                  className="inline-flex items-center justify-center h-12 px-6 rounded-full text-xs font-bold border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/60 shadow-sm active:scale-[0.98] transition-all duration-200">
                  Đăng ký cho bé
                </Link>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.24} className="md:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[340px] aspect-square rounded-[2.5rem] bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 p-8 shadow-xl dark:shadow-black/40 flex items-center justify-center group">
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 to-rose-500/5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <img
                  src="/images/khoichiencon.avif"
                  alt="Khối Chiên Con"
                  className="w-full h-full object-contain transform group-hover:scale-[1.02] transition-transform duration-500"
                  loading="eager"
                  fetchpriority="high"
                />
                <div className="absolute -bottom-4 right-6 bg-white/90 dark:bg-stone-800/90 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center gap-3 border border-stone-200/80 dark:border-stone-700/80 shadow-md">
                  <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold tracking-tight">Mầm non – Lớp 2</p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Ươm mầm đức tin</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* OVERVIEW CARDS (Mobile Snap Scroll) */}
      <section className="py-8 bg-white/60 dark:bg-stone-900/40 backdrop-blur-md border-y border-stone-200/50 dark:border-stone-800/50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex overflow-x-auto md:grid md:grid-cols-4 gap-6 scrollbar-none snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0">
            {OVERVIEW.map((item, i) => { const Icon = item.icon; return (
              <div key={i} className="flex-shrink-0 w-[240px] md:w-auto snap-center bg-stone-50 dark:bg-stone-900/60 md:bg-transparent md:dark:bg-transparent p-4 md:p-0 rounded-2xl border border-stone-200/40 dark:border-stone-800/40 md:border-none flex items-center gap-4 transition-all">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white dark:bg-stone-800 shadow-sm border border-stone-200/40 dark:border-stone-700/40 flex-shrink-0">
                  <Icon className="w-4 h-4 text-stone-700 dark:text-stone-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">{item.label}</p>
                  <p className="text-sm font-bold text-stone-800 dark:text-stone-200 mt-0.5 truncate">{item.value}</p>
                </div>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* CHƯƠNG TRÌNH SECTION */}
      <section id="chuong-trinh" className="py-24 max-w-6xl mx-auto px-6 scroll-mt-12">
        <div className="max-w-2xl text-left space-y-3 mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-pink-600 dark:text-pink-400">Chương trình học</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Hành trình một năm học</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
            Chương trình được chia thành 2 học kỳ, mỗi chủ đề kéo dài 2–3 buổi để các em có đủ thời gian thấm nhuần qua nhiều hình thức học tập trực quan.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {CHUONG_TRINH.map((item, i) => { const Icon = item.icon; return (
            <motion.div key={i} initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
              viewport={vp} transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`rounded-[1.75rem] border p-6 flex flex-col transition-all duration-300 ${item.color}`}>

              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-stone-900 dark:text-stone-100">{item.title}</h3>
              </div>

              <ul className="space-y-4 flex-1">
                {item.topics.map((topic, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-stone-600 dark:text-stone-300 font-medium leading-relaxed">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 ${item.dot}`} />
                    {topic}
                  </li>
                ))}
              </ul>
            </motion.div>
          ); })}
        </div>
      </section>

      {/* HIGHLIGHTS / METHODOLOGY */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="max-w-2xl text-left space-y-2 mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-pink-600 dark:text-pink-400">Phương pháp</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Học mà chơi, chơi mà học</h2>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {HIGHLIGHTS.map((item, i) => { const Icon = item.icon; return (
            <motion.div key={i} initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
              viewport={vp} transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/60 dark:border-stone-800/80 p-6 shadow-sm hover:shadow-md transition-all text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-6 bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-2">{item.title}</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">{item.desc}</p>
            </motion.div>
          ); })}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-28 max-w-3xl mx-auto px-6 text-center border-t border-stone-200/50 dark:border-stone-800/50">
        <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }} viewport={vp} transition={{ duration: 0.6 }}>
          <div className="inline-flex w-12 h-12 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md items-center justify-center mb-8">
            <Sparkles className="w-5 h-5 text-pink-500 fill-current" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Sẵn sàng gửi bé yêu?</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base leading-relaxed mb-10 max-w-xl mx-auto font-medium">
            Hãy đăng ký ngay để bé được tham gia môi trường đức tin yêu thương — nơi mỗi Chủ Nhật trở thành một cuộc phiêu lưu lý thú cùng Chúa Giêsu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/tuyển-sinh#dang-ky"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full text-xs font-bold text-white shadow-lg bg-pink-600 hover:bg-pink-500 active:scale-[0.98] transition-all duration-200"
            >
              Đăng ký ngay <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/liên-hệ"
              className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 rounded-full text-xs font-bold border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 shadow-sm active:scale-[0.98] transition-all duration-200">
              Liên hệ hỏi thêm
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}