import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Globe, Compass, Users, MessageSquare, Lightbulb, Heart, Clock, CalendarDays, ArrowRight, ChevronLeft, ShieldCheck } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useLenis } from "lenis/react";
import { useMotionConfig } from "../hooks/useMotionConfig.js";

const OVERVIEW = [
  { icon: Users,        label: "Độ tuổi",    value: "Từ 16 tuổi trở lên" },
  { icon: Clock,        label: "Thời lượng", value: "45 phút / buổi" },
  { icon: CalendarDays, label: "Lịch học",   value: "Chúa Nhật sau Thánh lễ" },
  { icon: ShieldCheck,  label: "Yêu cầu",    value: "Đã lãnh Bí tích Khai tâm" },
];

const PILLARS = [
  {
    icon: Globe, 
    title: "Đức tin & Văn hoá",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-blue-500/50 dark:hover:border-blue-500/50",
    iconBg: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
    topics: ["Giáo Hội trong thế giới hiện đại (Gaudium et Spes)", "Đức tin trước thách đố khoa học & công nghệ", "Giá trị Kitô giáo trong môi trường đại học & công sở", "Phân định ơn gọi — gia đình và tu trì"],
  },
  {
    icon: Heart, 
    title: "Xã hội & Công bằng",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-rose-500/50 dark:hover:border-rose-500/50",
    iconBg: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500",
    topics: ["Học thuyết xã hội Công giáo — nền tảng và ứng dụng", "Phẩm giá con người & nhân quyền", "Bảo vệ môi trường — tiếng gọi từ Laudato Si'", "Tình liên đới và phục vụ người nghèo"],
  },
  {
    icon: Compass, 
    title: "Sứ mạng & Chứng nhân",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/50",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    topics: ["Loan báo Tin Mừng trong bối cảnh Việt Nam", "Mạng xã hội — không gian truyền giáo mới", "Xây dựng cộng đoàn tươi trẻ và sống động", "Gương sáng — các Thánh tử đạo Việt Nam"],
  },
];

const HIGHLIGHTS = [
  { icon: MessageSquare, title: "Thảo luận mở",        desc: "Không có câu trả lời sẵn — cùng nhau đặt câu hỏi, tìm kiếm và đối thoại trong tinh thần đức tin." },
  { icon: Lightbulb,     title: "Diễn giả khách mời",  desc: "Gặp gỡ chuyên gia, linh mục, tu sĩ hoặc giáo dân gương mẫu chia sẻ hành trình sống đạo." },
  { icon: Heart,         title: "Phục vụ thực tế",     desc: "Tham gia các hoạt động bác ái, tình nguyện xã hội như một phần bắt buộc của chương trình." },
  { icon: Globe,         title: "Tài liệu chuyên sâu", desc: "Tiếp cận các văn kiện Giáo Hội, tác phẩm thần học và tài liệu giáo lý hiện đại." },
];

const QUOTES = [
  { text: "Bất cứ làm việc gì, hãy làm tận tâm như làm cho Chúa, chứ không phải cho người phàm.", src: "Cl 3,23" },
  { text: "Người trẻ thân mến, đừng nhìn cuộc sống từ trên ban công. Hãy dấn thân vào nơi mà các thách đố đang gọi mời.", src: "ĐTC Phanxicô" },
  { text: "Anh em phải khôn ngoan như rắn và đơn sơ như bồ câu.", src: "Mt 10,16" },
  { text: "Các con là 'hiện tại' của Thiên Chúa, chứ không phải chỉ là một tương lai xa vời.", src: "Tông huấn Christus Vivit" },
  { text: "Ai trung tín trong việc rất nhỏ, thì cũng trung tín trong việc lớn.", src: "Lc 16,10" },
  { text: "Đừng để cho sự ác thắng được mình, nhưng hãy lấy thiện mà thắng ác.", src: "Rm 12,21" },
  { text: "Người trẻ ơi, Ta nói với anh: hãy trỗi dậy!", src: "Lc 7,14" },
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
      <div className="invisible pointer-events-none select-none aria-hidden relative w-full" style={{ visibility: 'hidden' }}>
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

export default function KhoiVaoDoi() {
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
    heroParallax: [0, -60]
  };

  const heroY = useTransform(scrollY, [0, 600], mc.heroParallax || [0, -60]);

  const fadeUp = {
    hidden: { opacity: 0, y: mc.yOffset },
    visible: (d = 0) => ({
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 90, damping: 15, mass: 0.8, delay: mc.delay(d) }
    }),
  };

  const vp = mc.vp();

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-stone-900 dark:bg-[#09090b] dark:text-stone-50 antialiased overflow-x-hidden selection:bg-blue-500/20 dark:selection:bg-blue-500/30 transition-colors duration-500">
      
      {/* HERO SECTION */}
      <section ref={heroRef} className="relative overflow-hidden pt-12 pb-20 md:pt-32 md:pb-32 bg-gradient-to-b from-white via-[#f5f5f7] to-transparent dark:from-stone-900 dark:via-[#09090b]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <motion.div style={{ y: heroY }} className="max-w-6xl mx-auto px-6 relative z-10">

          <div className="grid md:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="md:col-span-7 space-y-6 text-left">
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                  <Globe className="w-3 h-3" /> Khối Vào Đời
                </span>
              </motion.div>
              
              <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={0.06} className="text-4xl sm:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight leading-[1.08]">
                Sống đức tin<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
                  giữa lòng đời
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={0.12} className="text-base sm:text-lg text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl font-normal">
                Đồng hành cùng các bạn trẻ bước vào đại học, công sở và xã hội — trang bị hành trang đức tin để trở thành những chứng nhân Tin Mừng trong thế giới hiện đại.
              </motion.p>

              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.18} className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => {
                    const target = document.getElementById("noi-dung");
                    if (!target) return;
                    lenis ? lenis.scrollTo(target, { duration: 1 }) : target.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full text-xs font-bold text-white shadow-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-white active:scale-[0.98] transition-all duration-200"
                >
                  Xem nội dung đào tạo <ArrowRight className="w-4 h-4" />
                </button>
                <Link to="/giới-trẻ-công-giáo"
                  className="inline-flex items-center justify-center h-12 px-6 rounded-full text-xs font-bold border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/60 shadow-sm active:scale-[0.98] transition-all duration-200">
                  Tham gia Giới Trẻ
                </Link>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.24} className="md:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[340px] aspect-square rounded-[2.5rem] bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 p-8 shadow-xl dark:shadow-black/40 flex items-center justify-center group">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <img src="/images/khoivaodoi.avif" alt="Khối Vào Đời" className="w-full h-full object-contain transform group-hover:scale-[1.02] transition-transform duration-500" loading="eager" />
                
                <div className="absolute -bottom-4 left-6 bg-white/90 dark:bg-stone-800/90 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center gap-3 border border-stone-200/80 dark:border-stone-700/80 shadow-md">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold tracking-tight">Lớp 10 – 11</p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Hành trang dấn thân</p>
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

      {/* PILLARS SECTION */}
      <section id="noi-dung" className="py-24 max-w-6xl mx-auto px-6 scroll-mt-12">
        <div className="max-w-2xl text-left space-y-3 mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400">Trọng tâm đào tạo</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Ba trụ cột của người Kitô hữu trưởng thành</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
            Mỗi học kỳ đi sâu vào một trụ cột, xoay vòng qua các năm để đảm bảo sự toàn diện trong hành trình đức tin trưởng thành.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PILLARS.map((pillar, i) => { const Icon = pillar.icon; return (
            <motion.div key={i} initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
              viewport={vp} transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`rounded-[1.75rem] border p-6 flex flex-col transition-all duration-300 ${pillar.color}`}>
              
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${pillar.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-stone-900 dark:text-stone-100">{pillar.title}</h3>
              </div>
              
              <ul className="space-y-4 flex-1">
                {pillar.topics.map((topic, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-stone-600 dark:text-stone-300 font-medium leading-relaxed">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 ${pillar.dot}`} />
                    {topic}
                  </li>
                ))}
              </ul>
            </motion.div>
          ); })}
        </div>
      </section>

      {/* QUOTES WIDGET SECTION */}
      <section className="py-20 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-stone-100/50 dark:bg-stone-800/20 -z-10" />
        <QuoteSlider quotes={QUOTES} />
      </section>

      {/* HIGHLIGHTS / METHODOLOGY */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="max-w-2xl text-left space-y-2 mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400">Phương pháp tiếp cận</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Học để sống, không chỉ để biết</h2>
        </div>
        
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {HIGHLIGHTS.map((item, i) => { const Icon = item.icon; return (
            <motion.div key={i} initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
              viewport={vp} transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/60 dark:border-stone-800/80 p-6 shadow-sm hover:shadow-md transition-all text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-6 bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
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
            <Globe className="w-5 h-5 text-blue-500" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Sẵn sàng bước ra?</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base leading-relaxed mb-10 max-w-xl mx-auto font-medium">
            Gia nhập cộng đoàn thanh niên đức tin — nơi bạn không bước vào đời một mình, mà có Chúa và cả một cộng đoàn cùng đồng hành.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/giới-trẻ-công-giáo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full text-xs font-bold text-white shadow-lg bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all duration-200"
            >
              Tham gia ngay <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/liên-hệ"
              className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 rounded-full text-xs font-bold border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 shadow-sm active:scale-[0.98] transition-all duration-200">
              Liên hệ hỏi thông tin
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}