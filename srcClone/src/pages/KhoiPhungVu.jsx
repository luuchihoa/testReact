import React, { useState, useEffect } from "react";
import { BookOpen, Scroll, Map, Layers, Flame, Users, Clock, CalendarDays } from "lucide-react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { useKhoiMotion } from "../hooks/useKhoiMotion.js";
import HeroSection from "../features/khoi/HeroSection.jsx";
import OverviewCards from "../features/khoi/OverviewCards.jsx";
import HighlightsGrid from "../features/khoi/HighlightsGrid.jsx";
import CtaSection from "../features/khoi/CtaSection.jsx";

// Hằng số Easing chuyển động chuẩn hệ thống Apple HIG
const APPLE_EASE = [0.16, 1, 0.3, 1];

const OVERVIEW = [
  { icon: Users,        label: "Độ tuổi",    value: "13 – 14 tuổi" },
  { icon: Clock,        label: "Thời lượng", value: "45 phút / buổi" },
  { icon: CalendarDays, label: "Lịch học",   value: "Chủ Nhật sau Thánh Lễ" },
  { icon: BookOpen,     label: "Giáo trình", value: "Kinh Thánh trọn bộ" },
];

const TESTAMENT = [
  {
    id: "cuu-uoc",
    name: "Cựu Ước",
    icon: "📜",
    count: "46 Quyển",
    // Đồng bộ Glassmorphism & Hover states chuẩn
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-red-500/40 dark:md:hover:border-red-500/40 shadow-sm",
    badge: "text-red-700 bg-red-100/80 dark:text-red-400 dark:bg-red-900/30 border border-red-200/50 dark:border-red-800/30",
    iconBg: "bg-red-100/80 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-800/30",
    dot: "bg-red-500 shadow-sm",
    desc: "Hành trình từ tạo dựng đến lời hứa cứu độ — giao ước giữa Thiên Chúa và dân Người qua các thời đại.",
    books: [
      { group: "Ngũ Thư", items: ["Sáng Thế (St)", "Xuất Hành (Xh)", "Lêvi (Lv)", "Dân Số (Ds)", "Đệ Nhị Luật (Đnl)"] },
      { group: "Lịch Sử", items: [
        "Giôsuê (Gs)", "Thủ Lãnh (Tl)", "Rút (R)", "1 Sa-mu-en (1 Sm)",
        "2 Sa-mu-en (2 Sm)", "1 Các Vua (1 V)", "2 Các Vua (2 V)", "1 Sử Biên Niên (1 Sb)",
        "2 Sử Biên Niên (2 Sb)", "Ét-ra (Er)", "Nơ-khe-mi-a (Nkm)", "Tô-bi-a (Tb)",
        "Giu-đi-tha (Gđt)", "Ét-te (Et)", "1 Ma-ca-bê (1 Mcb)", "2 Ma-ca-bê (2 Mcb)"
      ] },
      { group: "Huấn Ca", items: ["Gióp (G)", "Thánh Vịnh (Tv)", "Châm Ngôn (Cn)", "Giảng Viên (Gv)", "Diễm Ca (Dc)", "Khôn Ngoan (Kn)", "Huấn Ca (Hc)"] },
      { group: "Ngôn Sứ", items: [
        "I-sai-a (Is)", "Giê-rê-mi-a (Gr)", "Ai Ca (Ac)", "Ba-rúc (Ba)",
        "Ê-dê-ki-en (Ed)", "Đa-ni-en (Đn)", "Hô-sê (Hs)", "Giô-en (Ge)",
        "A-mốt (Am)", "Ô-va-đi-a (Ôv)", "Giô-na (Gn)", "Mi-kha (Mk)",
        "Na-khum (Na)", "Kha-ba-cúc (Kb)", "Xô-phô-ni-a (Xp)", "Khác-gai (Kg)",
        "Da-ca-ri-a (Dcr)", "Ma-la-khi (Ml)"
      ] },
    ],
  },
  {
    id: "tan-uoc",
    name: "Tân Ước",
    icon: "✝️",
    count: "27 Quyển",
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-rose-500/40 dark:md:hover:border-rose-500/40 shadow-sm",
    badge: "text-rose-700 bg-rose-100/80 dark:text-rose-400 dark:bg-rose-900/30 border border-rose-200/50 dark:border-rose-800/30",
    iconBg: "bg-rose-100/80 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/30",
    dot: "bg-rose-500 shadow-sm",
    desc: "Tin Mừng Đức Giêsu Kitô — Ngôi Lời nhập thể, chịu chết và phục sinh để cứu chuộc nhân loại.",
    books: [
      { group: "Tin Mừng", items: ["Mát-thêu (Mt)", "Mác-cô (Mc)", "Lu-ca (Lc)", "Gio-an (Ga)"] },
      { group: "Tông Đồ Công Vụ", items: ["Tông Đồ Công Vụ (Cv)"] },
      { group: "Thư Thánh Phao-lô", items: [
        "Rô-ma (Rm)", "1 Cô-rin-tô (1 Cr)", "2 Cô-rin-tô (2 Cr)", "Ga-lát (Gl)",
        "Ê-phê-sô (Ep)", "Phi-líp-phê (Pl)", "Cô-lô-sê (Cl)", "1 Thê-xa-lô-ni-ca (1 Tx)",
        "2 Thê-xa-lô-ni-ca (2 Tx)", "1 Ti-mô-thê (1 Tm)", "2 Ti-mô-thê (2 Tm)", "Ti-tô (Tt)",
        "Phi-lê-môn (Plm)", "Híp-ri (Dt)"
      ] },
      { group: "Thư Chung & Khải Huyền", items: [
        "Gia-cô-bê (Gc)", "1 Phê-rô (1 P)", "2 Phê-rô (2 P)", "1 Gio-an (1 Ga)",
        "2 Gio-an (2 Ga)", "3 Gio-an (3 Ga)", "Giu-đa (Gđ)", "Khải Huyền (Kh)"
      ] },
    ],
  },
];

const METHODS = [
  { icon: Map,      title: "Bản đồ Kinh Thánh",      desc: "Học qua bản đồ địa lý Thánh Kinh — các em nhìn thấy hành trình của dân Chúa bằng mắt." },
  { icon: Scroll,   title: "Kể chuyện sáng tạo",     desc: "Đóng vai, vẽ tranh hoặc viết tiếp câu chuyện Kinh Thánh từ góc nhìn của một nhân vật." },
  { icon: Layers,   title: "Kinh Thánh & cuộc sống", desc: "Mỗi câu chuyện gắn với 1 tình huống thực tế — giúp các em áp dụng Lời Chúa vào đời thường." },
  { icon: BookOpen, title: "Ghi nhớ Lời Chúa",       desc: "Học thuộc lòng một câu Kinh Thánh mỗi buổi — tạo kho tàng Lời Chúa trong trí nhớ suốt đời." },
];

const MOBILE_BREAKPOINT = 768;

export default function KhoiKinhThanh() {
  const [selectedTestament, setSelectedTestament] = useState(null);
  const { heroRef, lenis, mc, heroY, fadeUp, vp } = useKhoiMotion();
  const sheetY = useMotionValue(0);

  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDragEnd = (event, info) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      setSelectedTestament(null);
    } else {
      sheetY.set(0);
    }
  };

  useEffect(() => {
    if (selectedTestament) {
      sheetY.set(0);
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
  }, [selectedTestament, sheetY, lenis]);

  useEffect(() => {
    if (!selectedTestament) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedTestament(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTestament]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 dark:bg-[#1C1917] dark:text-stone-50 antialiased overflow-x-hidden selection:bg-red-500/20 dark:selection:bg-red-500/30 transition-colors duration-500">

      <HeroSection
        heroRef={heroRef}
        heroY={heroY}
        fadeUp={fadeUp}
        lenis={lenis}
        sectionBgClass="bg-gradient-to-b from-white via-[#FDFBF7] to-[#FDFBF7] dark:from-[#1C1917] dark:via-[#191614] dark:to-[#191614]"
        glowClass="bg-red-500/5 dark:bg-red-500/10"
        eyebrowIcon={BookOpen}
        eyebrowLabel="Khối Kinh Thánh"
        eyebrowClass="bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200/50 dark:border-red-800/30 shadow-sm"
        titleLine1="Lời Chúa —"
        titleLine2="nền tảng đức tin"
        titleGradientClass="bg-gradient-to-r from-red-600 via-rose-600 to-red-800 dark:from-red-400 dark:via-rose-400 dark:to-red-300"
        description="Kinh Thánh không chỉ là một cuốn sách cổ — đó là thư tình Thiên Chúa gửi cho con người qua mọi thời đại. Khối Kinh Thánh dẫn các em vào hành trình khám phá 73 quyển sách thiêng liêng đầy sống động."
        primaryCtaLabel="Xem chương trình học"
        primaryCtaTargetId="noi-dung"
        primaryCtaClass="bg-red-600 md:hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400"
        secondaryCtaLabel="Đăng ký Nhập Học"
        secondaryCtaTo="/tuyển-sinh#dang-ky"
        image={{ src: "/images/khoikinhthanh.avif", alt: "Khối Kinh Thánh" }}
        imageGlowClass="bg-gradient-to-tr from-red-500/5 to-rose-500/5"
        floatBadge={{ label: "Lớp 8 – 9", sub: "Thấu hiểu Lời Chúa", dotClass: "bg-red-500" }}
      />

      <OverviewCards items={OVERVIEW} />

      {/* TESTAMENT BENTO GRID */}
      <section id="noi-dung" className="py-20 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-12 relative z-20">
        <div className="max-w-2xl text-left space-y-3 mb-12 sm:mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-red-600 dark:text-red-400 ml-1">Chương trình</p>
          <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50 leading-tight">Hành trình qua 73 quyển sách</h2>
          <p className="text-[14px] sm:text-[15.5px] font-medium text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl">
            Từ "Khởi đầu Thiên Chúa sáng tạo" đến lời kết "Amen" của sách Khải Huyền — một dòng chảy cứu độ trải dài hàng ngàn năm lịch sử, được các em khám phá theo từng quyển sách.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {TESTAMENT.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: mc.yOffset }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={vp}
              transition={{ duration: 0.5, delay: i * 0.05, ease: APPLE_EASE }}
              onClick={() => setSelectedTestament(t)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedTestament(t); }}
              className={`group text-left rounded-[24px] sm:rounded-[32px] border p-6 sm:p-8 flex flex-col justify-between min-h-[220px] cursor-pointer transition-all duration-300 md:hover:shadow-lg active:scale-[0.98] ${t.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[28px] select-none filter drop-shadow-sm">{t.icon}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${t.badge}`}>
                    {t.count}
                  </span>
                </div>
                <h3 className="text-[20px] sm:text-[22px] font-extrabold font-serif text-amber-950 dark:text-amber-50 md:group-hoverhover:text-red-600 dark:group-hover:text-red-400 transition-colors mb-2.5">{t.name}</h3>
                <p className="text-[14px] text-stone-500 dark:text-stone-400 leading-relaxed font-medium line-clamp-3">{t.desc}</p>
              </div>
              
              <div className="mt-5 flex items-center gap-2">
                <span className={`text-[11px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full ${t.badge}`}>
                  Xem danh mục
                </span>
              </div>
            </motion.div>
          ))}

          {/* Lời Chúa Quote Card tích hợp Bento */}
          <motion.div
            initial={{ opacity: 0, y: mc.yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: 0.5, delay: 0.3, ease: APPLE_EASE }}
            className="rounded-[24px] sm:rounded-[32px] border border-amber-900/10 dark:border-amber-100/10 p-6 sm:p-8 flex flex-col justify-between bg-red-50/50 dark:bg-red-900/10 text-left sm:col-span-2 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100/80 dark:bg-red-900/40 border border-red-200/50 dark:border-red-800/30 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                <Flame className="w-5 h-5 text-red-600 dark:text-red-400 fill-current" />
              </div>
              <p className="text-[16px] sm:text-[18px] font-medium font-serif leading-relaxed italic text-amber-950 dark:text-amber-50 mt-1.5">
                "Lời Thiên Chúa là ngọn đèn soi cho con bước, là ánh sáng chỉ đường con đi."
              </p>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-red-700/80 dark:text-red-400/80 mt-6 text-right">
              — Thánh Vịnh 119,105
            </p>
          </motion.div>
        </div>

        {/* NATIVE IOS-STYLE BOTTOM SHEET MODAL */}
        <AnimatePresence>
          {selectedTestament && (
            <>
              {/* Lớp nền mờ */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: APPLE_EASE }}
                onClick={() => setSelectedTestament(null)}
                className="fixed inset-0 bg-stone-900/40 dark:bg-black/60 backdrop-blur-sm z-50 pointer-events-auto"
              />

              <div data-lenis-prevent className="fixed inset-0 z-[60] flex flex-col justify-end md:items-center md:justify-center p-0 md:p-4 pointer-events-none">
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  drag={isMobile ? "y" : false}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0.1, bottom: 0.6 }}
                  onDragEnd={handleDragEnd}
                  style={{ y: sheetY }}
                  initial={{ opacity: 0, y: isMobile ? "100%" : 30, scale: isMobile ? 1 : 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: isMobile ? "100%" : 20, scale: isMobile ? 1 : 0.95 }}
                  transition={{ duration: 0.4, ease: APPLE_EASE }}
                  // Áp dụng Glassmorphism cho Bottom Sheet
                  className="relative w-full md:max-w-xl pb-[env(safe-area-inset-bottom)] md:pb-0 rounded-t-[32px] md:rounded-[32px] border border-amber-900/10 dark:border-amber-100/10 shadow-2xl pointer-events-auto max-h-[90vh] md:max-h-[85vh] flex flex-col overflow-hidden bg-white/95 dark:bg-[#1C1917]/95 backdrop-blur-xl text-amber-950 dark:text-amber-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-center pt-4 pb-2 md:hidden touch-none active:cursor-grabbing">
                    <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full" />
                  </div>

                  <div className="flex items-center gap-4 p-6 sm:p-8 pb-4 touch-none border-b border-amber-900/5 dark:border-amber-100/5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl select-none ${selectedTestament.iconBg}`}>
                      {selectedTestament.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold font-serif text-[22px] tracking-tight leading-tight truncate">{selectedTestament.name}</h3>
                      <p className="text-[12px] text-red-600 dark:text-red-400 font-bold uppercase tracking-widest mt-1.5">{selectedTestament.count}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedTestament(null)}
                      className="flex-shrink-0 w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center transition-colors md:hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-90 text-stone-500"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <path d="M18 6 6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>

                  <div className="p-6 sm:p-8 pt-4 space-y-6 overflow-y-auto overscroll-contain flex-1 text-left">
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2.5">
                        Ý nghĩa cốt lõi
                      </h4>
                      <p className="text-[14.5px] leading-relaxed text-stone-600 dark:text-stone-300 font-medium">
                        {selectedTestament.desc}
                      </p>
                    </div>

                    <div className="space-y-6">
                      {selectedTestament.books.map((group, j) => (
                        <div key={j} className="bg-stone-50/50 dark:bg-stone-900/30 p-4 sm:p-5 rounded-2xl border border-amber-900/5 dark:border-amber-100/5">
                          <h4 className="text-[12px] font-bold uppercase tracking-widest text-red-800 dark:text-red-400 mb-3.5">
                            {group.group}
                          </h4>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4">
                            {group.items.map((item, k) => (
                              <li key={k} className="flex items-center gap-3 text-[14px] text-stone-700 dark:text-stone-300 font-medium">
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${selectedTestament.dot}`} />
                                <span className="truncate">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </section>

      <HighlightsGrid
        items={METHODS}
        eyebrowLabel="Phương pháp giáo lý"
        title="Kinh Thánh sống động, không khô khan"
        accentTextClass="text-red-600 dark:text-red-400"
        accentIconClass="bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200/50 dark:border-red-800/30 shadow-sm"
        cardClass="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10"
        sectionClassName="py-20 relative z-10"
        mc={mc}
        vp={vp}
      />

      <CtaSection
        icon={BookOpen}
        iconClass="text-red-600 dark:text-red-400"
        title="Mở Trang Kinh Thánh Cùng Con"
        description="Kính mời quý Phụ huynh đăng ký để con em bước vào hành trình khám phá Lời Chúa — nền tảng vững chắc nhất cho một đời sống đức tin trường tồn."
        primaryCtaLabel="Đăng ký trực tuyến"
        primaryCtaTo="/tuyển-sinh#dang-ky"
        primaryCtaClass="bg-red-600 text-white md:hover:bg-red-500 shadow-sm"
        secondaryCtaLabel="Liên hệ Văn phòng"
        secondaryCtaTo="/liên-hệ"
        mc={mc}
        vp={vp}
        sectionClassName="pt-20 pb-32 max-w-3xl mx-auto px-4 sm:px-6 text-center border-t border-amber-900/5 dark:border-amber-100/5 relative z-10"
      />
    </div>
  );
}