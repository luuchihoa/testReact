import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Flame, Wind, Shield, Users, BookOpen, Clock, CalendarDays, ArrowRight, Lightbulb, Star } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue } from "framer-motion";
import { useLenis } from "lenis/react";
import { useMotionConfig } from "../hooks/useMotionConfig.js";

const OVERVIEW = [
  { icon: Users,        label: "Độ tuổi",    value: "Lớp 5 – Lớp 6" },
  { icon: Clock,        label: "Thời lượng", value: "45 phút / buổi" },
  { icon: CalendarDays, label: "Lịch học",   value: "Chúa Nhật" },
  { icon: Star,         label: "Yêu cầu",    value: "Đã Rước Lễ Lần Đầu" },
];

const GIFTS = [
  {
    id: "khon-ngoan",
    name: "Khôn Ngoan",
    icon: "🌿",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-amber-500/50 dark:hover:border-amber-500/50",
    badge: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30",
    desc: "Nhìn thấy mọi sự theo nhãn quan của Thiên Chúa — biết đặt Chúa lên trên hết.",
    example: "Một bạn trẻ từ chối gian lận dù cả lớp làm vậy — vì biết điều gì thực sự có giá trị.",
  },
  {
    id: "hieu-biet",
    name: "Hiểu Biết",
    icon: "📖",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-orange-500/50 dark:hover:border-orange-500/50",
    badge: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/30",
    desc: "Thấu hiểu sâu sắc các chân lý đức tin và ý nghĩa của cuộc sống.",
    example: "Đọc một đoạn Kinh Thánh và tự nhiên nhận ra nó đang nói về chính mình hôm nay.",
  },
  {
    id: "lo-lieu",
    name: "Biết Lo Liệu",
    icon: "🧭",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-yellow-500/50 dark:hover:border-yellow-500/50",
    badge: "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/30",
    desc: "Phân định điều tốt và hành động đúng đắn trong mỗi tình huống cụ thể.",
    example: "Biết khi nào nên nói, khi nào nên im lặng; khi nào giúp bạn, khi nào cần để bạn tự lớn.",
  },
  {
    id: "dung-cam",
    name: "Dũng Cảm",
    icon: "🦁",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-red-500/50 dark:hover:border-red-500/50",
    badge: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30",
    desc: "Can đảm sống và loan báo đức tin dù bị phản đối hay chế nhạo.",
    example: "Dám cầu nguyện trước bữa ăn ở canteen trường, dù bạn bè nhìn.",
  },
  {
    id: "thong-minh",
    name: "Thông Minh",
    icon: "💡",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-lime-500/50 dark:hover:border-lime-500/50",
    badge: "text-lime-600 bg-lime-50 dark:text-lime-400 dark:bg-lime-950/30",
    desc: "Dùng trí tuệ và tài năng Chúa ban để phục vụ vinh quang Ngài.",
    example: "Học giỏi không phải để hơn người, mà để có thể phục vụ xã hội tốt hơn vì Chúa.",
  },
  {
    id: "dao-duc",
    name: "Đạo Đức",
    icon: "🕊️",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/50",
    badge: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30",
    desc: "Kính sợ Chúa và yêu mến điều thiện — tránh xa tội lỗi không phải vì sợ mà vì yêu.",
    example: "Cảm thấy xấu hổ và buồn lòng khi làm điều sai — đó chính là ơn đạo đức đang hoạt động.",
  },
  {
    id: "kinh-so",
    name: "Kính Sợ Chúa",
    icon: "✨",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-violet-500/50 dark:hover:border-violet-500/50",
    badge: "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/30",
    desc: "Kinh ngạc trước sự vĩ đại của Thiên Chúa và không muốn làm Ngài buồn lòng.",
    example: "Ngắm hoàng hôn hay bầu trời sao và tự nhiên thốt lên: \"Lạy Chúa, Chúa thật kỳ diệu!\"",
  },
];

const MODULES = [
  {
    phase: "Học Kỳ 1: Ai là tôi trong Chúa Thánh Thần?",
    weeks: "16 buổi",
    icon: Lightbulb,
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-yellow-500/50 dark:hover:border-yellow-500/50",
    iconBg: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400",
    badge: "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/30",
    dot: "bg-yellow-500",
    topics: ["Chúa Thánh Thần — Ngôi Ba Thiên Chúa", "7 ơn Chúa Thánh Thần và ý nghĩa trong cuộc sống", "Ôn lại hành trình đức tin từ Rửa Tội đến hôm nay", "Bí tích Hoà Giải — chuẩn bị tâm hồn"],
  },
  {
    phase: "Học Kỳ 2: Tôi được sai đi",
    weeks: "18 buổi",
    icon: Users,
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-indigo-500/50 dark:hover:border-indigo-500/50",
    iconBg: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400",
    badge: "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/30",
    dot: "bg-indigo-500",
    topics: ["Sứ mạng ngôn sứ — làm chứng cho Chúa", "Sứ mạng tư tế — cầu nguyện và phụng thờ", "Sứ mạng vương đế — phục vụ và lãnh đạo", "Nghi thức Bí tích Thêm Sức & buổi tập dượt"],
  },
];

const HIGHLIGHTS = [
  { icon: Wind,     title: "Retreat tĩnh tâm",   desc: "Trước ngày lãnh Bí tích, toàn khối tham gia 1 ngày tĩnh tâm để gặp gỡ Chúa Thánh Thần trong thinh lặng." },
  { icon: Users,    title: "Nhóm đồng hành",     desc: "Mỗi em có 1 người đỡ đầu (Sponsor) đồng hành trong suốt năm học và trong hành trình đức tin sau đó." },
  { icon: BookOpen, title: "Nhật ký tâm linh",   desc: "Ghi lại hành trình đức tin qua nhật ký cá nhân — được chia sẻ tự nguyện trong nhóm nhỏ." },
  { icon: Shield,   title: "Dự án phục vụ",      desc: "Mỗi em thực hiện 1 dự án phục vụ cộng đoàn như một bằng chứng sống của đức tin trưởng thành." },
];

export default function KhoiThemSuc() {
  const [selectedGift, setSelectedGift] = useState(null);
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const lenis = useLenis();
  const giftSheetY = useMotionValue(0);

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

  const handleGiftDragEnd = (event, info) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      setSelectedGift(null);
    } else {
      giftSheetY.set(0);
    }
  };

  useEffect(() => {
    if (selectedGift) {
      giftSheetY.set(0);
      if (window.innerWidth < 768) document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [selectedGift, giftSheetY]);

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
    <div className="min-h-screen bg-[#f5f5f7] text-stone-900 dark:bg-[#09090b] dark:text-stone-50 antialiased overflow-x-hidden selection:bg-yellow-500/20 dark:selection:bg-yellow-500/30 transition-colors duration-500">
      
      {/* HERO SECTION */}
      <section ref={heroRef} className="relative overflow-hidden pt-12 pb-20 md:pt-32 md:pb-32 bg-gradient-to-b from-white via-[#f5f5f7] to-transparent dark:from-stone-900 dark:via-[#09090b]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <motion.div style={{ y: heroY }} className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="md:col-span-7 space-y-6 text-left">
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300">
                  <Flame className="w-3 h-3 fill-current" /> Khối Thêm Sức
                </span>
              </motion.div>
              
              <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={0.06} className="text-4xl sm:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight leading-[1.08]">
                Nhận lãnh ngọn lửa<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 via-yellow-600 to-amber-700 dark:from-yellow-300 dark:via-yellow-400 dark:to-amber-400">
                  Chúa Thánh Thần
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={0.12} className="text-base sm:text-lg text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl font-normal">
                Bí tích Thêm Sức là dấu ấn trưởng thành trong đức tin — khi Chúa Thánh Thần đổ đầy 7 ơn thiêng liêng để các em trở thành những chứng nhân dũng cảm của Tin Mừng.
              </motion.p>

              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.18} className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => {
                    const target = document.getElementById("bay-on");
                    if (!target) return;
                    lenis ? lenis.scrollTo(target, { duration: 1 }) : target.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full text-xs font-bold text-white shadow-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-white active:scale-[0.98] transition-all duration-200"
                >
                  Khám phá chương trình <ArrowRight className="w-4 h-4" />
                </button>
                <Link to="/tuyển-sinh#dang-ky"
                  className="inline-flex items-center justify-center h-12 px-6 rounded-full text-xs font-bold border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/60 shadow-sm active:scale-[0.98] transition-all duration-200">
                  Đăng ký Nhập Học
                </Link>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.24} className="md:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[340px] aspect-square rounded-[2.5rem] bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 p-8 shadow-xl dark:shadow-black/40 flex items-center justify-center group">
                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/5 to-amber-500/5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <img src="/images/khoithemsuc.avif" alt="Khối Thêm Sức" className="w-full h-full object-contain transform group-hover:scale-[1.02] transition-transform duration-500" loading="eager" />
                
                <div className="absolute -bottom-4 right-6 bg-white/90 dark:bg-stone-800/90 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center gap-3 border border-stone-200/80 dark:border-stone-700/80 shadow-md">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold tracking-tight">Lớp 5 – 6</p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Ngọn lửa chứng nhân</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* OVERVIEW CARDS */}
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

      {/* GIFTS BENTO GRID */}
      <section id="bay-on" className="py-24 max-w-6xl mx-auto px-6 scroll-mt-12">
        <div className="max-w-2xl text-left space-y-3 mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-yellow-600 dark:text-yellow-400">Trọng tâm Đào tạo</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Bảy Ơn Chúa Thánh Thần</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
            Mỗi ơn ban thiêng liêng được chuyển hóa qua các dụ ngôn Kinh Thánh, liên hệ trực quan giúp các em vững vàng áp dụng vào môi trường học đường và cuộc sống.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {GIFTS.map((gift, i) => (
            <motion.div
              key={gift.id}
              initial={{ opacity: 0, y: mc.yOffset }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={vp}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              onClick={() => setSelectedGift(gift)}
              className={`group text-left rounded-[1.75rem] border p-6 flex flex-col justify-between min-h-[190px] cursor-pointer transition-all duration-300 bg-white dark:bg-stone-900 hover:shadow-xl hover:shadow-stone-200/30 dark:hover:shadow-none ${gift.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl select-none">{gift.icon}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${gift.badge}`}>
                    Chi tiết
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors mb-2">{gift.name}</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-3">{gift.desc}</p>
              </div>
            </motion.div>
          ))}

          {/* Lời Chúa Quote Card tích hợp Bento */}
          <motion.div
            initial={{ opacity: 0, y: mc.yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-[1.75rem] border p-6 flex flex-col justify-between bg-yellow-500/5 dark:bg-yellow-500/10 border-yellow-500/20 text-left col-span-2 sm:col-span-1"
          >
            <div>
              <Flame className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mb-4 fill-current" />
              <p className="text-xs font-semibold leading-relaxed italic text-stone-800 dark:text-stone-200">
                "Tất cả họ đều được tràn đầy ơn Chúa Thánh Thần."
              </p>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-600/80 dark:text-yellow-400/80 mt-4 text-right">
              Công vụ 2,4
            </p>
          </motion.div>
        </div>

        {/* NATIVE IOS-STYLE BOTTOM SHEET MODAL */}
        <AnimatePresence>
          {selectedGift && (
            <>
              {/* Backdrop Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedGift(null)}
                className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-50 pointer-events-auto"
              />

              {/* Sheet Container */}
              <div className="fixed inset-0 z-[60] flex flex-col justify-end md:items-center md:justify-center p-0 md:p-4 pointer-events-none">
                <motion.div
                  drag={window.innerWidth < 768 ? "y" : false}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0.1, bottom: 0.6 }}
                  onDragEnd={handleGiftDragEnd}
                  style={{ y: giftSheetY }}
                  
                  initial={{ opacity: 0, y: window.innerWidth < 768 ? "100%" : 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: window.innerWidth < 768 ? "100%" : 20 }}
                  transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.9 }}
                  
                  className="relative w-full md:max-w-xl rounded-t-[2.5rem] md:rounded-[2rem] border border-stone-200/80 dark:border-stone-800/80 shadow-2xl pointer-events-auto max-h-[88vh] md:max-h-[80vh] flex flex-col overflow-hidden bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl text-stone-900 dark:text-stone-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Pull bar indicator for iOS Swipe */}
                  <div className="flex justify-center pt-3 pb-2 md:hidden touch-none">
                    <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full" />
                  </div>

                  {/* Header */}
                  <div className="flex items-start gap-4 p-6 pb-4 touch-none">
                    <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center shadow-inner flex-shrink-0 text-xl select-none">
                      {selectedGift.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-xl tracking-tight text-stone-900 dark:text-white leading-tight">Ơn {selectedGift.name}</h3>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 font-bold mt-1 tracking-wide">Món quà thiêng liêng từ Thiên Chúa</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedGift(null)}
                      className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center transition-colors hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-90"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <path d="M18 6 6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>

                  <div className="h-px bg-stone-200/60 dark:bg-stone-800/60 mx-6 flex-shrink-0" />

                  {/* Content (Scrollable Area) */}
                  <div className="p-6 pt-4 space-y-5 overflow-y-auto overscroll-contain flex-1 text-left">
                    <div className="space-y-5">
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2.5">
                          Ý nghĩa cốt lõi
                        </h4>
                        <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300 font-medium">
                          {selectedGift.desc}
                        </p>
                      </div>
                      
                      <div className="h-px bg-stone-100 dark:bg-stone-800/50" />
                      
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2.5">
                          Ví dụ thực tế trong đời sống
                        </h4>
                        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/40 border border-stone-200/50 dark:border-stone-800/40">
                          <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300 font-medium italic">
                            "{selectedGift.example}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </section>

      {/* TRỤ CỘT LỘ TRÌNH */}
      <section className="py-24 bg-white/40 dark:bg-stone-900/20 border-y border-stone-200/50 dark:border-stone-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl text-left space-y-2 mb-16">
            <p className="text-[11px] font-bold tracking-widest uppercase text-yellow-600 dark:text-yellow-400">Khung đào tạo</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Hai Trụ Cột Chuẩn Bị Tâm Hồn</h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
              Chương trình một năm được xây dựng quanh hai trụ cột chính, dẫn dắt các em từ nhận biết bản thân trong Chúa Thánh Thần đến sẵn sàng dấn thân sống sứ mạng.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {MODULES.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: mc.yOffset }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={vp}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className={`group rounded-[1.75rem] border p-8 flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-stone-200/30 dark:hover:shadow-none ${mod.color}`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${mod.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${mod.badge}`}>
                      {mod.weeks}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-stone-900 dark:text-stone-100 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors mb-5">
                    {mod.phase}
                  </h3>

                  <ul className="space-y-4 flex-1">
                    {mod.topics.map((topic, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-stone-600 dark:text-stone-300 font-medium leading-relaxed">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 ${mod.dot}`} />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS / METHODOLOGY */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="max-w-2xl text-left space-y-2 mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-yellow-600 dark:text-yellow-400">Phương pháp giáo lý</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Hơn cả một lớp học thông thường</h2>
        </div>
        
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {HIGHLIGHTS.map((item, i) => { const Icon = item.icon; return (
            <motion.div key={i} initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
              viewport={vp} transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/60 dark:border-stone-800/80 p-6 shadow-sm hover:shadow-md transition-all text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-6 bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-2">{item.title}</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">{item.desc}</p>
            </motion.div>
          ); })}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-28 max-w-3xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }} viewport={vp} transition={{ duration: 0.6 }}>
          <div className="inline-flex w-12 h-12 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md items-center justify-center mb-8">
            <Flame className="w-5 h-5 text-yellow-500 fill-current" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Đón Nhận Ngọn Lửa Thiêng</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base leading-relaxed mb-10 max-w-xl mx-auto font-medium">
            Kính mời quý Phụ huynh đăng ký để con em được đào tạo, chuẩn bị chu đáo tâm hồn cho Bí tích Thêm Sức — bước tiến thành nhân kiên định trên hành trình sống đạo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/tuyển-sinh#dang-ky"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full text-xs font-bold text-white shadow-lg shadow-yellow-600/10 bg-yellow-600 hover:bg-yellow-500 active:scale-[0.98] transition-all duration-200"
            >
              Đăng ký trực tuyến <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/liên-hệ"
              className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 rounded-full text-xs font-bold border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 shadow-sm active:scale-[0.98] transition-all duration-200">
              Liên hệ Hỏi thông tin
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}