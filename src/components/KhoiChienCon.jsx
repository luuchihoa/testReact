import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, Music, Palette, Users, BookOpen, Clock, CalendarDays, ArrowRight, ChevronLeft, Star, GraduationCap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLenis } from "lenis/react";
import { useMotionConfig } from "../hooks/useMotionConfig";

/* ── Design tokens ── */
const ACCENT   = "#db2777";
const ACCENT_L = "#fdf2f8";

const OVERVIEW = [
  { icon: Users,        label: "Độ tuổi",    value: "Mầm non - Lớp 2" },
  { icon: Clock,        label: "Thời lượng", value: "45 phút / buổi" },
  { icon: CalendarDays, label: "Lịch học",   value: "Chúa Nhật" },
  { icon: GraduationCap,        label: "Sĩ số",      value: "20 em / lớp" },
];

const MODULES = [
  {
    phase: "Học Kỳ 1",
    color: "bg-rose-50 border-rose-100",
    dot:   "bg-rose-400",
    borderAccent: "border-l-rose-400",
    topics: [
      "Thiên Chúa yêu thương tôi",
      "Chúa Giêsu — người bạn tốt nhất",
      "Gia đình là quà tặng của Chúa",
      "Cầu nguyện cùng Chúa mỗi ngày",
      "Bài hát Kinh Lạy Cha & Kinh Kính Mừng",
    ],
  },
  {
    phase: "Học Kỳ 2",
    color: "bg-amber-50 border-amber-100",
    dot:   "bg-amber-400",
    borderAccent: "border-l-amber-400",
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

export default function KhoiChienCon() {
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const mc = useMotionConfig();
  const heroY = useTransform(scrollY, [0, 500], mc.heroParallax);
  const lenis = useLenis();

  const fadeUp = {
    hidden: { opacity: 0, y: mc.yOffset },
    visible: (d = 0) => ({
      opacity: 1, y: 0,
      transition: { duration: mc.duration(0.8), ease: [0.16, 1, 0.3, 1], delay: mc.delay(d) },
    }),
  };
  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: mc.stagger } },
  };
  const vp = mc.vp();

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 antialiased overflow-x-hidden selection:bg-pink-200 selection:text-pink-900">

      {/* ══ HERO ══ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden pt-16 pb-20 md:pt-28 md:pb-32"
        style={{ background: `linear-gradient(160deg, ${ACCENT_L} 0%, #faf8f5 60%)` }}
      >
        {!mc.isMobile && (
          <>
            <div className="absolute top-0 left-0 w-[600px] h-[500px] bg-rose-200/20 blur-[120px] rounded-full -z-10 -translate-x-1/4" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-amber-200/20 blur-[100px] rounded-full -z-10" />
          </>
        )}

        <motion.div style={mc.isMobile ? undefined : { y: heroY }} className="max-w-5xl mx-auto px-5 sm:px-6">

          <motion.div
            initial={{ opacity: 0, x: mc.isMobile ? -8 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: mc.duration(0.5) }}
          >
            <Link to="/"
              className="inline-flex items-center gap-1.5 text-sm text-stone-500 md:hover:text-stone-800 mb-8 transition-colors">
              <ChevronLeft className="w-4 h-4" />Trang chủ
            </Link>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col md:flex-row md:items-end gap-8 md:gap-16"
          >
            {/* Left — text */}
            <div className="flex-1">
              <motion.div variants={fadeUp} custom={0}>
                <span
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
                  style={{ background: `${ACCENT}18`, color: ACCENT }}>
                  <Heart className="w-3.5 h-3.5" />Khối Chiên Con
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={0.05}
                className="text-3xl sm:text-4xl md:text-6xl font-serif font-black tracking-tight text-stone-900 leading-[1.1] mb-5">
                Hạt giống<br />
                <span className="bg-clip-text text-transparent"
                  style={{ backgroundImage: `linear-gradient(135deg, ${ACCENT}, #9d174d)` }}>
                  đức tin
                </span>{" "}đầu đời
              </motion.h1>

              <motion.p variants={fadeUp} custom={0.1}
                className="text-base md:text-lg text-stone-500 leading-relaxed max-w-lg mb-8">
                Giai đoạn mầm non đến lớp 2 là thời điểm vàng để gieo vào tâm hồn trẻ thơ
                tình yêu với Thiên Chúa — qua những câu chuyện, bài hát và hoạt động sáng tạo
                phù hợp lứa tuổi.
              </motion.p>

              <motion.div variants={fadeUp} custom={0.15} className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    const t = document.getElementById("chuong-trinh");
                    if (!t) return;
                    lenis
                      ? lenis.scrollTo(t, { duration: mc.isMobile ? 0.8 : 1.2 })
                      : t.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-300 md:hover:-translate-y-0.5 active:scale-95"
                  style={{ background: ACCENT, boxShadow: `0 4px 16px ${ACCENT}40` }}>
                  Xem chương trình<ArrowRight className="w-4 h-4" />
                </button>
                <Link to="/tuyển-sinh#dang-ky"
                  className="inline-flex items-center justify-center h-11 px-5 rounded-xl text-sm font-semibold border border-stone-200 bg-white text-stone-800 md:hover:bg-stone-50 shadow-sm transition-all duration-300 md:hover:-translate-y-0.5 active:scale-95">
                  Đăng ký cho bé
                </Link>
              </motion.div>
            </div>

            {/* Right — image */}
            <motion.div variants={fadeUp} custom={0.2} className="flex-shrink-0 w-full md:w-[280px]">
              <div
                className="relative rounded-3xl overflow-hidden aspect-square w-full max-w-[260px] md:max-w-full mx-auto shadow-xl"
                style={{ background: `linear-gradient(135deg, ${ACCENT_L}, #fce7f3)` }}>
                <img
                  src="/images/khoichiencon.avif"
                  alt="Khối Chiên Con"
                  className="w-full h-full object-contain p-8 mix-blend-multiply"
                  loading="eager"
                  fetchpriority="high"
                />
                <div className="absolute bottom-3 left-3 right-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm">
                  <Star className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} />
                  <div>
                    <p className="text-[11px] font-bold text-stone-900">Mầm non – Lớp 2</p>
                    <p className="text-[10px] text-stone-500">3 – 8 tuổi</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ══ TỔNG QUAN ══ */}
      <section className="py-14 border-y border-stone-100 bg-white/60">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {OVERVIEW.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: mc.yOffset }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={vp}
                transition={{ duration: mc.duration(0.5), delay: mc.delay(i * 0.08) }}
                className="flex flex-col gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${ACCENT}18` }}>
                  <Icon className="w-4 h-4" style={{ color: ACCENT }} />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">{item.label}</p>
                <p className="text-sm font-semibold text-stone-800 leading-snug">{item.value}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ══ CHƯƠNG TRÌNH ══ */}
      <section id="chuong-trinh" className="py-20 md:py-28 max-w-5xl mx-auto px-5 sm:px-6 scroll-mt-20 md:scroll-mt-16">
        <motion.div
          initial={{ opacity: 0, y: mc.yOffset }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: mc.duration(0.7) }}
          className="mb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ACCENT }}>
            Chương trình học
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-900 leading-tight">
            Hành trình một năm học
          </h2>
          <p className="mt-3 text-stone-500 max-w-lg text-sm leading-relaxed">
            Chương trình được chia thành 2 học kỳ, mỗi chủ đề kéo dài 2–3 buổi để
            các em có đủ thời gian thấm nhuần qua nhiều hình thức học tập.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {MODULES.map((mod, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: mc.yOffset }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={vp}
              transition={{ duration: mc.duration(0.6), delay: mc.delay(i * 0.1) }}
              className={`rounded-2xl border border-l-4 p-4 md:p-6 ${mod.color} ${mod.borderAccent}`} >
              <div className="flex items-center gap-2 mb-5">
                <div className={`w-2 h-2 rounded-full ${mod.dot}`} />
                <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider">{mod.phase}</h3>
              </div>
              <ul className="space-y-3">
                {mod.topics.map((topic, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-stone-700">
                    <span className="w-5 h-5 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[10px] font-bold text-stone-500 flex-shrink-0 mt-0.5">
                      {j + 1}
                    </span>
                    {topic}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ ĐIỂM NỔI BẬT ══ */}
      <section
        className="py-20 md:py-28"
        style={{ background: `linear-gradient(160deg, ${ACCENT_L} 0%, #faf8f5 100%)` }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: mc.yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: mc.duration(0.7) }}
            className="mb-12">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ACCENT }}>
              Phương pháp
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-900">
              Học mà chơi,<br />chơi mà học
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {HIGHLIGHTS.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: mc.yOffset }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={vp}
                  transition={{ duration: mc.duration(0.5), delay: mc.delay(i * 0.1) }}
                  whileHover={mc.isMobile ? undefined : { y: -4, transition: { duration: 0.2 } }}
                  className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm md:hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${ACCENT}15` }}>
                    <Icon className="w-5 h-5" style={{ color: ACCENT }} />
                  </div>
                  <h3 className="text-sm font-bold text-stone-900 mb-1.5">{item.title}</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: mc.yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: mc.duration(0.7) }}>
            <motion.div
              animate={mc.reduced ? {} : {
                scale: [1, 1.12, 1],
                transition: { repeat: Infinity, duration: 2.4, ease: "easeInOut" },
              }}>
              <Heart className="w-10 h-10 mx-auto mb-4" style={{ color: ACCENT }} />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-serif font-black text-stone-900 mb-3">
              Sẵn sàng gửi bé yêu?
            </h2>
            <p className="text-stone-500 text-sm leading-relaxed mb-8 max-w-md mx-auto">
              Hãy đăng ký ngay để bé được tham gia môi trường đức tin yêu thương — nơi mỗi
              Chủ Nhật trở thành một cuộc phiêu lưu cùng Chúa.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/tuyển-sinh#dang-ky"
                className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-300 md:hover:-translate-y-0.5 active:scale-95"
                style={{ background: ACCENT, boxShadow: `0 4px 16px ${ACCENT}40` }}>
                Đăng ký ngay<ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/liên-hệ"
                className="inline-flex items-center justify-center h-11 px-6 rounded-xl text-sm font-semibold border border-stone-200 bg-white text-stone-800 md:hover:bg-stone-50 shadow-sm transition-all duration-300 md:hover:-translate-y-0.5 active:scale-95">
                Liên hệ hỏi thêm
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}