import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Heart, Music, Palette, Users, BookOpen, Clock,
  CalendarDays, Star, GraduationCap, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useKhoiMotion } from "../hooks/useKhoiMotion.js";
import PlusGrid from "./khoi/PlusGrid.jsx";
import HeroSection from "./khoi/HeroSection.jsx";
import OverviewCards from "./khoi/OverviewCards.jsx";
import HighlightsGrid from "./khoi/HighlightsGrid.jsx";
import CtaSection from "./khoi/CtaSection.jsx";

const OVERVIEW = [
  { icon: Users,        label: "Độ tuổi",    value: "Mầm non - Lớp 2" },
  { icon: Clock,        label: "Thời lượng", value: "45 phút / buổi" },
  { icon: CalendarDays, label: "Lịch học",   value: "Chúa Nhật" },
  { icon: GraduationCap,label: "Sĩ số",      value: "20 em / lớp" },
];

// Phần chương trình học giữ dạng list đơn giản — đặc thù cho lứa mầm non,
// không dùng bento+modal như khối lớn hơn (xem KhoiRuocLe).
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

// Component Slider Trích dẫn — đặc thù KhoiChienCon, không tách ra vì chưa khối nào khác dùng lại
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
    enter: (d) => ({ x: d > 0 ? "10%" : "-10%", opacity: 0, scale: 0.98 }),
    center: { x: "0%", opacity: 1, scale: 1 },
    exit: (d) => ({ x: d > 0 ? "-10%" : "10%", opacity: 0, scale: 0.98 }),
  };

  if (!quotes || quotes.length === 0) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 relative z-10">
      {/* Spacer giữ chiều cao cố định bằng quote đầu tiên, ẩn khỏi cả mắt lẫn screen reader */}
      <div aria-hidden="true" className="invisible pointer-events-none select-none relative w-full" style={{ visibility: "hidden" }}>
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
            className="w-full h-full bg-stone-900 dark:bg-stone-100 rounded-[2rem] shadow-2xl p-8 md:p-12 flex flex-col justify-center text-center touch-pan-y border border-stone-800 dark:border-stone-200"
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
  const { heroRef, lenis, mc, heroY, fadeUp, vp } = useKhoiMotion();

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-stone-900 dark:bg-[#09090b] dark:text-stone-50 antialiased overflow-x-hidden selection:bg-pink-500/20 dark:selection:bg-pink-500/30 transition-colors duration-500">

      <HeroSection
        heroRef={heroRef}
        heroY={heroY}
        fadeUp={fadeUp}
        lenis={lenis}
        glowClass="bg-pink-500/5 dark:bg-pink-500/10"
        eyebrowIcon={Heart}
        eyebrowLabel="Khối Chiên Con"
        eyebrowClass="bg-pink-500/10 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300"
        titleLine1="Hạt giống"
        titleLine2="đức tin đầu đời"
        titleGradientClass="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 dark:from-pink-400 dark:via-rose-400 dark:to-red-400"
        description="Giai đoạn mầm non đến lớp 2 là thời điểm vàng để gieo vào tâm hồn trẻ thơ tình yêu với Thiên Chúa — qua những câu chuyện, bài hát và hoạt động sáng tạo phù hợp lứa tuổi."
        primaryCtaLabel="Xem chương trình"
        primaryCtaTargetId="chuong-trinh"
        secondaryCtaLabel="Đăng ký cho bé"
        secondaryCtaTo="/tuyển-sinh#dang-ky"
        image={{ src: "/images/khoichiencon.avif", alt: "Khối Chiên Con" }}
        imageGlowClass="bg-gradient-to-tr from-pink-500/5 to-rose-500/5"
        floatBadge={{ label: "Mầm non – Lớp 2", sub: "Ươm mầm đức tin", dotClass: "bg-pink-500" }}
      />

      {/* MAIN CONTENT WRAPPER WITH PLUS GRID */}
      <div className="relative z-0">
        <PlusGrid />

        <OverviewCards items={OVERVIEW} />

        {/* CHƯƠNG TRÌNH SECTION — đặc thù khối, giữ nguyên dạng list */}
        <section id="chuong-trinh" className="py-24 max-w-6xl mx-auto px-6 scroll-mt-12 relative z-10">
          <div className="max-w-2xl text-left space-y-3 mb-16">
            <p className="text-[11px] font-bold tracking-widest uppercase text-pink-600 dark:text-pink-400">Chương trình học</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-white dark:bg-[#09090b] inline-block px-1 -mx-1">Hành trình một năm học</h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-sm inline-block px-1 -mx-1">
              Chương trình được chia thành 2 học kỳ, mỗi chủ đề kéo dài 2–3 buổi để các em có đủ thời gian thấm nhuần qua nhiều hình thức học tập trực quan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {CHUONG_TRINH.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: mc.yOffset }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={vp}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className={`rounded-[1.75rem] border p-6 flex flex-col transition-all duration-300 relative bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-90 dark:bg-opacity-90 ${item.color}`}
                >
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
              );
            })}
          </div>
        </section>

        <HighlightsGrid
          items={HIGHLIGHTS}
          title="Học mà chơi, chơi mà học"
          accentTextClass="text-pink-600 dark:text-pink-400"
          accentIconClass="bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400"
          mc={mc}
          vp={vp}
        />

        {/* QUOTES SLIDER SECTION */}
        <section className="py-24 relative z-10 overflow-hidden">
          <QuoteSlider quotes={QUOTES} />
        </section>

        <CtaSection
          icon={Sparkles}
          iconClass="text-pink-500"
          title="Sẵn sàng gửi bé yêu?"
          description="Hãy đăng ký ngay để bé được tham gia môi trường đức tin yêu thương — nơi mỗi Chủ Nhật trở thành một cuộc phiêu lưu lý thú cùng Chúa Giêsu."
          primaryCtaLabel="Đăng ký ngay"
          primaryCtaTo="/tuyển-sinh#dang-ky"
          primaryCtaClass="bg-pink-600 hover:bg-pink-500"
          secondaryCtaLabel="Liên hệ hỏi thêm"
          secondaryCtaTo="/liên-hệ"
          mc={mc}
          vp={vp}
          sectionClassName="pt-20 pb-32 max-w-3xl mx-auto px-6 text-center border-t border-stone-200/50 dark:border-stone-800/50 relative z-10"
        />
      </div>
    </div>
  );
}