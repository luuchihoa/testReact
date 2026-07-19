import React, { useState, useEffect } from "react";
import { Flame, Wind, Shield, Users, BookOpen, Clock, CalendarDays, Lightbulb, Star } from "lucide-react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { useKhoiMotion } from "../hooks/useKhoiMotion.js";
import HeroSection from "../features/khoi/HeroSection.jsx";
import OverviewCards from "../features/khoi/OverviewCards.jsx";
import HighlightsGrid from "../features/khoi/HighlightsGrid.jsx";
import CtaSection from "../features/khoi/CtaSection.jsx";

// Hằng số Easing chuyển động chuẩn hệ thống Apple HIG
const APPLE_EASE = [0.16, 1, 0.3, 1];

const OVERVIEW = [
  { icon: Users,        label: "Độ tuổi",    value: "10 – 11 tuổi" },
  { icon: Clock,        label: "Thời lượng", value: "45 phút / buổi" },
  { icon: CalendarDays, label: "Lịch học",   value: "Chúa Nhật" },
  { icon: Star,         label: "Yêu cầu",    value: "Đã Rước Lễ" },
];

const GIFTS = [
  {
    id: "khon-ngoan",
    name: "Khôn Ngoan",
    icon: "🌿",
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-amber-500/40 dark:md:hover:border-amber-500/40 shadow-sm",
    badge: "text-amber-700 bg-amber-100/80 dark:text-amber-400 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-800/30",
    desc: "Nhìn thấy mọi sự theo nhãn quan của Thiên Chúa — biết đặt Chúa lên trên hết.",
    example: "Một bạn trẻ từ chối gian lận dù cả lớp làm vậy — vì biết điều gì thực sự có giá trị.",
  },
  {
    id: "hieu-biet",
    name: "Hiểu Biết",
    icon: "📖",
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-orange-500/40 dark:md:hover:border-orange-500/40 shadow-sm",
    badge: "text-orange-700 bg-orange-100/80 dark:text-orange-400 dark:bg-orange-900/30 border border-orange-200/50 dark:border-orange-800/30",
    desc: "Thấu hiểu sâu sắc các chân lý đức tin và ý nghĩa của cuộc sống.",
    example: "Đọc một đoạn Kinh Thánh và tự nhiên nhận ra nó đang nói về chính mình hôm nay.",
  },
  {
    id: "lo-lieu",
    name: "Biết Lo Liệu",
    icon: "🧭",
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-yellow-500/40 dark:md:hover:border-yellow-500/40 shadow-sm",
    badge: "text-yellow-700 bg-yellow-100/80 dark:text-yellow-400 dark:bg-yellow-900/30 border border-yellow-200/50 dark:border-yellow-800/30",
    desc: "Phân định điều tốt và hành động đúng đắn trong mỗi tình huống cụ thể.",
    example: "Biết khi nào nên nói, khi nào nên im lặng; khi nào giúp bạn, khi nào cần để bạn tự lớn.",
  },
  {
    id: "dung-cam",
    name: "Dũng Cảm",
    icon: "🦁",
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-red-500/40 dark:md:hover:border-red-500/40 shadow-sm",
    badge: "text-red-700 bg-red-100/80 dark:text-red-400 dark:bg-red-900/30 border border-red-200/50 dark:border-red-800/30",
    desc: "Can đảm sống và loan báo đức tin dù bị phản đối hay chế nhạo.",
    example: "Dám cầu nguyện trước bữa ăn ở canteen trường, dù bạn bè nhìn.",
  },
  {
    id: "thong-minh",
    name: "Thông Minh",
    icon: "💡",
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-lime-500/40 dark:md:hover:border-lime-500/40 shadow-sm",
    badge: "text-lime-700 bg-lime-100/80 dark:text-lime-400 dark:bg-lime-900/30 border border-lime-200/50 dark:border-lime-800/30",
    desc: "Dùng trí tuệ và tài năng Chúa ban để phục vụ vinh quang Ngài.",
    example: "Học giỏi không phải để hơn người, mà để có thể phục vụ xã hội tốt hơn vì Chúa.",
  },
  {
    id: "dao-duc",
    name: "Đạo Đức",
    icon: "🕊️",
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-emerald-500/40 dark:md:hover:border-emerald-500/40 shadow-sm",
    badge: "text-emerald-700 bg-emerald-100/80 dark:text-emerald-400 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-800/30",
    desc: "Kính sợ Chúa và yêu mến điều thiện — tránh xa tội lỗi không phải vì sợ mà vì yêu.",
    example: "Cảm thấy xấu hổ và buồn lòng khi làm điều sai — đó chính là ơn đạo đức đang hoạt động.",
  },
  {
    id: "kinh-so",
    name: "Kính Sợ Chúa",
    icon: "✨",
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-violet-500/40 dark:md:hover:border-violet-500/40 shadow-sm",
    badge: "text-violet-700 bg-violet-100/80 dark:text-violet-400 dark:bg-violet-900/30 border border-violet-200/50 dark:border-violet-800/30",
    desc: "Kinh ngạc trước sự vĩ đại của Thiên Chúa và không muốn làm Ngài buồn lòng.",
    example: "Ngắm hoàng hôn hay bầu trời sao và tự nhiên thốt lên: \"Lạy Chúa, Chúa thật kỳ diệu!\"",
  },
];

const MODULES = [
  {
    phase: "Học Kỳ 1: Ai là tôi trong Chúa Thánh Thần?",
    weeks: "16 buổi",
    icon: Lightbulb,
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-yellow-500/40 shadow-sm",
    iconBg: "bg-yellow-100/80 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-800/30 shadow-sm",
    badge: "text-yellow-700 bg-yellow-100/80 dark:text-yellow-400 dark:bg-yellow-900/30 border border-yellow-200/50 dark:border-yellow-800/30 shadow-sm",
    dot: "bg-yellow-500",
    topics: ["Chúa Thánh Thần — Ngôi Ba Thiên Chúa", "7 ơn Chúa Thánh Thần và ý nghĩa", "Ôn lại hành trình từ lúc Rửa Tội", "Bí tích Hoà Giải — chuẩn bị tâm hồn"],
  },
  {
    phase: "Học Kỳ 2: Tôi được sai đi",
    weeks: "18 buổi",
    icon: Users,
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-indigo-500/40 shadow-sm",
    iconBg: "bg-indigo-100/80 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/30 shadow-sm",
    badge: "text-indigo-700 bg-indigo-100/80 dark:text-indigo-400 dark:bg-indigo-900/30 border border-indigo-200/50 dark:border-indigo-800/30 shadow-sm",
    dot: "bg-indigo-500",
    topics: ["Sứ mạng ngôn sứ — làm chứng cho Chúa", "Sứ mạng tư tế — cầu nguyện và phụng thờ", "Sứ mạng vương đế — phục vụ và lãnh đạo", "Nghi thức Bí tích Thêm Sức & tập dượt"],
  },
];

const HIGHLIGHTS = [
  { icon: Wind,     title: "Retreat tĩnh tâm",   desc: "Trước ngày lãnh Bí tích, toàn khối tham gia 1 ngày tĩnh tâm để gặp gỡ Chúa Thánh Thần." },
  { icon: Users,    title: "Nhóm đồng hành",     desc: "Mỗi em có 1 người đỡ đầu (Sponsor) đồng hành trong suốt hành trình đức tin." },
  { icon: BookOpen, title: "Nhật ký tâm linh",   desc: "Ghi lại hành trình đức tin qua nhật ký cá nhân — được chia sẻ tự nguyện trong nhóm nhỏ." },
  { icon: Shield,   title: "Dự án phục vụ",      desc: "Mỗi em thực hiện 1 dự án phục vụ cộng đoàn như bằng chứng của đức tin trưởng thành." },
];

const MOBILE_BREAKPOINT = 768;

export default function KhoiThemSuc() {
  const [selectedGift, setSelectedGift] = useState(null);
  const { heroRef, lenis, mc, heroY, fadeUp, vp } = useKhoiMotion();
  const giftSheetY = useMotionValue(0);

  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      document.body.style.overflow = "hidden";
      lenis?.stop();
    } else {
      document.body.style.overflow = "";
      lenis?.start();
    }
    return () => { 
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [selectedGift, giftSheetY, lenis]);

  useEffect(() => {
    if (!selectedGift) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedGift(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedGift]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 dark:bg-[#1C1917] dark:text-stone-50 antialiased overflow-x-hidden selection:bg-yellow-500/20 dark:selection:bg-yellow-500/30 transition-colors duration-500">

      <HeroSection
        heroRef={heroRef}
        heroY={heroY}
        fadeUp={fadeUp}
        lenis={lenis}
        sectionBgClass="bg-gradient-to-b from-white via-[#FDFBF7] to-[#FDFBF7] dark:from-[#1C1917] dark:via-[#191614] dark:to-[#191614]"
        glowClass="bg-yellow-500/5 dark:bg-yellow-500/10"
        eyebrowIcon={Flame}
        eyebrowLabel="Khối Thêm Sức"
        eyebrowClass="bg-yellow-100/80 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-800/30 shadow-sm"
        titleLine1="Nhận lãnh ngọn lửa"
        titleLine2="Chúa Thánh Thần"
        titleGradientClass="bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-700 dark:from-yellow-400 dark:via-amber-400 dark:to-orange-400"
        description="Bí tích Thêm Sức là dấu ấn trưởng thành trong đức tin — khi Chúa Thánh Thần đổ đầy 7 ơn thiêng liêng để các em trở thành những chứng nhân dũng cảm của Tin Mừng."
        primaryCtaLabel="Xem chương trình học"
        primaryCtaTargetId="bay-on"
        primaryCtaClass="bg-yellow-600 hover:bg-yellow-500 dark:bg-yellow-600 dark:hover:bg-yellow-500 text-amber-950 dark:text-amber-50"
        secondaryCtaLabel="Đăng ký Nhập Học"
        secondaryCtaTo="/tuyển-sinh#dang-ky"
        image={{ src: "/images/khoithemsuc.avif", alt: "Khối Thêm Sức" }}
        imageGlowClass="bg-gradient-to-tr from-yellow-500/5 to-amber-500/5"
        floatBadge={{ label: "Lớp 5 – 6", sub: "Ngọn lửa chứng nhân", dotClass: "bg-yellow-500" }}
      />

      <OverviewCards items={OVERVIEW} />

      {/* GIFTS BENTO GRID */}
      <section id="bay-on" className="py-20 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-12 relative z-20">
        <div className="max-w-2xl text-left space-y-3 mb-12 sm:mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-yellow-600 dark:text-yellow-400 ml-1">Trọng tâm Đào tạo</p>
          <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50 leading-tight">Bảy Ơn Chúa Thánh Thần</h2>
          <p className="text-[14px] sm:text-[15.5px] font-medium text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl">
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
              transition={{ duration: 0.5, delay: i * 0.05, ease: APPLE_EASE }}
              onClick={() => setSelectedGift(gift)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedGift(gift); }}
              className={`group text-left rounded-[24px] sm:rounded-[32px] border p-5 sm:p-6 flex flex-col justify-between min-h-[220px] cursor-pointer transition-all duration-300 md:hover:shadow-lg active:scale-[0.98] ${gift.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[28px] select-none filter drop-shadow-sm">{gift.icon}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm ${gift.badge}`}>
                    Chi tiết
                  </span>
                </div>
                <h3 className="text-[17px] sm:text-[19px] font-extrabold font-serif text-amber-950 dark:text-amber-50 md:group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors mb-2.5">{gift.name}</h3>
                <p className="text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed font-medium line-clamp-3">{gift.desc}</p>
              </div>
            </motion.div>
          ))}

          {/* Lời Chúa Quote Card tích hợp Bento */}
          <motion.div
            initial={{ opacity: 0, y: mc.yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: 0.5, delay: 0.4, ease: APPLE_EASE }}
            className="rounded-[24px] sm:rounded-[32px] border border-amber-900/10 dark:border-amber-100/10 p-6 sm:p-8 flex flex-col justify-between bg-yellow-50/50 dark:bg-yellow-900/10 text-left col-span-2 sm:col-span-1 shadow-sm"
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-yellow-100/80 dark:bg-yellow-900/40 border border-yellow-200/50 dark:border-yellow-800/30 flex items-center justify-center flex-shrink-0 shadow-sm mb-4">
                <Flame className="w-5 h-5 text-yellow-600 dark:text-yellow-400 fill-current" />
              </div>
              <p className="text-[16px] sm:text-[18px] font-medium font-serif leading-relaxed italic text-amber-950 dark:text-amber-50">
                "Tất cả họ đều được tràn đầy ơn Chúa Thánh Thần."
              </p>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-yellow-700/80 dark:text-yellow-400/80 mt-6 text-right">
              — Công vụ 2,4
            </p>
          </motion.div>
        </div>

        {/* NATIVE IOS-STYLE BOTTOM SHEET MODAL */}
        <AnimatePresence>
          {selectedGift && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: APPLE_EASE }}
                onClick={() => setSelectedGift(null)}
                className="fixed inset-0 bg-stone-900/40 dark:bg-black/60 backdrop-blur-sm z-50 pointer-events-auto"
              />

              <div data-lenis-prevent className="fixed inset-0 z-[60] flex flex-col justify-end md:items-center md:justify-center p-0 md:p-4 pointer-events-none">
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  drag={isMobile ? "y" : false}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0.1, bottom: 0.6 }}
                  onDragEnd={handleGiftDragEnd}
                  style={{ y: giftSheetY }}
                  initial={{ opacity: 0, y: isMobile ? "100%" : 30, scale: isMobile ? 1 : 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: isMobile ? "100%" : 20, scale: isMobile ? 1 : 0.95 }}
                  transition={{ duration: 0.4, ease: APPLE_EASE }}
                  className="relative w-full md:max-w-xl pb-[env(safe-area-inset-bottom)] md:pb-0 rounded-t-[32px] md:rounded-[32px] border border-amber-900/10 dark:border-amber-100/10 shadow-2xl pointer-events-auto max-h-[90vh] md:max-h-[85vh] flex flex-col overflow-hidden bg-white/95 dark:bg-[#1C1917]/95 backdrop-blur-xl text-amber-950 dark:text-amber-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-center pt-4 pb-2 md:hidden touch-none active:cursor-grabbing">
                    <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full" />
                  </div>

                  <div className="flex items-center gap-4 p-6 sm:p-8 pb-4 touch-none border-b border-amber-900/5 dark:border-amber-100/5">
                    <div className="w-14 h-14 rounded-2xl bg-yellow-100/50 dark:bg-stone-800 flex items-center justify-center flex-shrink-0 text-2xl select-none shadow-sm border border-yellow-900/5 dark:border-stone-700/30">
                      {selectedGift.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold font-serif text-[22px] tracking-tight leading-tight truncate">Ơn {selectedGift.name}</h3>
                      <p className="text-[12px] text-yellow-600 dark:text-yellow-400 font-bold uppercase tracking-widest mt-1.5 truncate">Món quà từ Thiên Chúa</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedGift(null)}
                      className="flex-shrink-0 w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center transition-colors md:hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-90 text-stone-500"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="p-6 sm:p-8 pt-5 space-y-6 overflow-y-auto overscroll-contain flex-1 text-left">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2.5">
                          Ý nghĩa cốt lõi
                        </h4>
                        <p className="text-[14.5px] leading-relaxed text-stone-600 dark:text-stone-300 font-medium">
                          {selectedGift.desc}
                        </p>
                      </div>

                      <div className="bg-stone-50/50 dark:bg-stone-900/30 p-4 sm:p-5 rounded-2xl border border-amber-900/5 dark:border-amber-100/5">
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-yellow-700 dark:text-yellow-500 mb-2.5">
                          Ví dụ thực tế trong đời sống
                        </h4>
                        <p className="text-[14px] leading-relaxed text-stone-700 dark:text-stone-300 font-medium italic">
                          "{selectedGift.example}"
                        </p>
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
      <section className="py-20 sm:py-24 bg-stone-50/50 dark:bg-[#1C1917]/50 border-y border-amber-900/5 dark:border-amber-100/5 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl text-left space-y-3 mb-12 sm:mb-16">
            <p className="text-[11px] font-bold tracking-widest uppercase text-yellow-600 dark:text-yellow-400 ml-1">Khung đào tạo</p>
            <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50 leading-tight">Hai Trụ Cột Chuẩn Bị Tâm Hồn</h2>
            <p className="text-[14px] sm:text-[15.5px] font-medium text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl">
              Chương trình một năm được xây dựng quanh hai trụ cột chính, dẫn dắt các em từ nhận biết bản thân trong Chúa Thánh Thần đến sẵn sàng dấn thân sống sứ mạng.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {MODULES.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: mc.yOffset }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={vp}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: APPLE_EASE }}
                  className={`group rounded-[24px] sm:rounded-[32px] border p-6 sm:p-8 flex flex-col transition-all duration-300 md:hover:shadow-lg ${mod.color}`}
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${mod.iconBg}`}>
                      <Icon className="w-6 h-6" strokeWidth={2.5} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm ${mod.badge}`}>
                      {mod.weeks}
                    </span>
                  </div>

                  <h3 className="text-[20px] sm:text-[22px] font-extrabold font-serif text-amber-950 dark:text-amber-50 md:group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors mb-6 leading-snug">
                    {mod.phase}
                  </h3>

                  <ul className="space-y-4 flex-1">
                    {mod.topics.map((topic, j) => (
                      <li key={j} className="flex items-start gap-3.5 text-[14.5px] text-stone-600 dark:text-stone-300 font-medium leading-relaxed">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 ${mod.dot} shadow-sm`} />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <HighlightsGrid
        items={HIGHLIGHTS}
        eyebrowLabel="Phương pháp giáo lý"
        title="Hơn cả một lớp học thông thường"
        accentTextClass="text-yellow-600 dark:text-yellow-400"
        accentIconClass="bg-yellow-100/80 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-800/30 shadow-sm"
        cardClass="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10"
        sectionClassName="py-20 relative z-10"
        mc={mc}
        vp={vp}
      />

      <CtaSection
        icon={Flame}
        iconClass="text-yellow-500"
        title="Đón Nhận Ngọn Lửa Thiêng"
        description="Kính mời quý Phụ huynh đăng ký để con em được đào tạo, chuẩn bị chu đáo tâm hồn cho Bí tích Thêm Sức — bước tiến thành nhân kiên định trên hành trình sống đạo."
        primaryCtaLabel="Đăng ký trực tuyến"
        primaryCtaTo="/tuyển-sinh#dang-ky"
        primaryCtaClass="bg-yellow-600 text-amber-950 dark:bg-yellow-500 dark:text-amber-950 hover:bg-yellow-500 shadow-sm"
        secondaryCtaLabel="Liên hệ Văn phòng"
        secondaryCtaTo="/liên-hệ"
        mc={mc}
        vp={vp}
        sectionClassName="pt-20 pb-32 max-w-3xl mx-auto px-4 sm:px-6 text-center border-t border-amber-900/5 dark:border-amber-100/5 relative z-10"
      />
    </div>
  );
}