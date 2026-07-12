import React, { useState, useEffect } from "react";
import { Flame, Wind, Shield, Users, BookOpen, Clock, CalendarDays, Lightbulb, Star } from "lucide-react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { useKhoiMotion } from "../hooks/useKhoiMotion.js";
import HeroSection from "./khoi/HeroSection.jsx";
import OverviewCards from "./khoi/OverviewCards.jsx";
import HighlightsGrid from "./khoi/HighlightsGrid.jsx";
import CtaSection from "./khoi/CtaSection.jsx";

const OVERVIEW = [
  { icon: Users,        label: "Độ tuổi",    value: "10 – 11 tuổi" },
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

// Ngưỡng breakpoint md của Tailwind — dùng để đồng bộ giữa CSS và JS logic (drag/animation)
const MOBILE_BREAKPOINT = 768;

export default function KhoiThemSuc() {
  const [selectedGift, setSelectedGift] = useState(null);
  const { heroRef, lenis, mc, heroY, fadeUp, vp } = useKhoiMotion();
  const giftSheetY = useMotionValue(0);

  // Theo dõi viewport bằng state thay vì đọc window.innerWidth trực tiếp trong JSX:
  // tránh crash khi SSR và đảm bảo re-render đúng khi resize/xoay màn hình.
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
  }, [selectedGift, giftSheetY]);

  // Đóng modal bằng phím Escape — cải thiện accessibility cho bottom sheet
  useEffect(() => {
    if (!selectedGift) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedGift(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedGift]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-stone-900 dark:bg-[#09090b] dark:text-stone-50 antialiased overflow-x-hidden selection:bg-yellow-500/20 dark:selection:bg-yellow-500/30 transition-colors duration-500">

      <HeroSection
        heroRef={heroRef}
        heroY={heroY}
        fadeUp={fadeUp}
        lenis={lenis}
        sectionBgClass="bg-gradient-to-b from-white via-[#f5f5f7] to-transparent dark:from-stone-900 dark:via-[#09090b]"
        glowClass="bg-yellow-500/5 dark:bg-yellow-500/10"
        eyebrowIcon={Flame}
        eyebrowLabel="Khối Thêm Sức"
        eyebrowClass="bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300 border border-yellow-500/20 dark:border-yellow-500/30 shadow-sm"
        titleLine1="Nhận lãnh ngọn lửa"
        titleLine2="Chúa Thánh Thần"
        titleGradientClass="bg-gradient-to-r from-yellow-500 via-yellow-600 to-amber-700 dark:from-yellow-300 dark:via-yellow-400 dark:to-amber-400"
        description="Bí tích Thêm Sức là dấu ấn trưởng thành trong đức tin — khi Chúa Thánh Thần đổ đầy 7 ơn thiêng liêng để các em trở thành những chứng nhân dũng cảm của Tin Mừng."
        primaryCtaLabel="Xem chương trình học"
        primaryCtaTargetId="bay-on"
        secondaryCtaLabel="Đăng ký Nhập Học"
        secondaryCtaTo="/tuyển-sinh#dang-ky"
        image={{ src: "/images/khoithemsuc.avif", alt: "Khối Thêm Sức" }}
        imageGlowClass="bg-gradient-to-tr from-yellow-500/5 to-amber-500/5"
        floatBadge={{ label: "Lớp 5 – 6", sub: "Ngọn lửa chứng nhân", dotClass: "bg-yellow-500" }}
      />

      <OverviewCards items={OVERVIEW} />

      {/* GIFTS BENTO GRID — đặc thù khối này, giữ nguyên vì phức tạp hơn list thường */}
      <section id="bay-on" className="py-24 max-w-6xl mx-auto px-6 scroll-mt-12 relative z-20">
        <div className="max-w-2xl text-left space-y-3 mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-yellow-600 dark:text-yellow-400">Trọng tâm Đào tạo</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight inline-block px-1 -mx-1">Bảy Ơn Chúa Thánh Thần</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed inline-block px-1 -mx-1">
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
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedGift(gift); }}
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedGift(null)}
                className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-50 pointer-events-auto"
              />

              <div className="fixed inset-0 z-[60] flex flex-col justify-end md:items-center md:justify-center pb-16 md:p-4 pointer-events-none">
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="khoi-gift-title"
                  drag={isMobile ? "y" : false}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0.1, bottom: 0.6 }}
                  onDragEnd={handleGiftDragEnd}
                  style={{ y: giftSheetY }}
                  initial={{ opacity: 0, y: isMobile ? "100%" : 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: isMobile ? "100%" : 20 }}
                  transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.9 }}
                  className="relative w-full md:max-w-xl rounded-t-[2.5rem] md:rounded-[2rem] border border-stone-200/80 dark:border-stone-800/80 shadow-2xl pointer-events-auto max-h-[80vh] md:max-h-[80vh] flex flex-col overflow-hidden bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl text-stone-900 dark:text-stone-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-center pt-3 pb-2 md:hidden touch-none">
                    <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full" />
                  </div>

                  <div className="flex items-start gap-4 p-6 pb-4 touch-none">
                    <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center shadow-inner flex-shrink-0 text-xl select-none">
                      {selectedGift.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 id="khoi-gift-title" className="font-extrabold text-xl tracking-tight text-stone-900 dark:text-white leading-tight">Ơn {selectedGift.name}</h3>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 font-bold mt-1 tracking-wide">Món quà thiêng liêng từ Thiên Chúa</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedGift(null)}
                      aria-label="Đóng"
                      className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center transition-colors hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-90"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="h-px bg-stone-200/60 dark:bg-stone-800/60 mx-6 flex-shrink-0" />

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

      {/* TRỤ CỘT LỘ TRÌNH — đặc thù khối này (2 học kỳ với danh sách chủ đề), giữ dạng section riêng */}
      <section className="py-24 bg-white/40 dark:bg-stone-900/20 border-y border-stone-200/50 dark:border-stone-800/50 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl text-left space-y-2 mb-16">
            <p className="text-[11px] font-bold tracking-widest uppercase text-yellow-600 dark:text-yellow-400">Khung đào tạo</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight inline-block px-1 -mx-1">Hai Trụ Cột Chuẩn Bị Tâm Hồn</h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed inline-block px-1 -mx-1">
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

      <HighlightsGrid
        items={HIGHLIGHTS}
        eyebrowLabel="Phương pháp giáo lý"
        title="Hơn cả một lớp học thông thường"
        accentTextClass="text-yellow-600 dark:text-yellow-400"
        accentIconClass="bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400"
        cardClass="bg-white dark:bg-stone-900"
        sectionClassName="py-24 max-w-6xl mx-auto px-6 relative z-10"
        containerClassName=""
        maskHeading={false}
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
        primaryCtaClass="bg-yellow-600 hover:bg-yellow-500 shadow-yellow-600/10"
        secondaryCtaLabel="Liên hệ Văn phòng Giáo xứ"
        secondaryCtaTo="/liên-hệ"
        mc={mc}
        vp={vp}
        sectionClassName="py-28 max-w-3xl mx-auto px-6 text-center relative z-10"
      />
    </div>
  );
}