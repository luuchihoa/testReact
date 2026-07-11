import React, { useState, useEffect } from "react";
import { BookOpen, Scroll, Map, Layers, Flame, Users, Clock, CalendarDays } from "lucide-react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { useKhoiMotion } from "../hooks/useKhoiMotion.js";
import HeroSection from "./khoi/HeroSection.jsx";
import OverviewCards from "./khoi/OverviewCards.jsx";
import HighlightsGrid from "./khoi/HighlightsGrid.jsx";
import CtaSection from "./khoi/CtaSection.jsx";

const OVERVIEW = [
  { icon: Users,        label: "Độ tuổi",    value: "Lớp 8 – Lớp 9" },
  { icon: Clock,        label: "Thời lượng", value: "45 phút / buổi" },
  { icon: CalendarDays, label: "Lịch học",   value: "Chủ Nhật sau Thánh Lễ" },
  { icon: BookOpen,     label: "Giáo trình", value: "Kinh Thánh trọn bộ" },
];

// Bento grid + bottom sheet modal — đặc thù khối này (danh mục 73 quyển sách Cựu/Tân Ước),
// giữ nguyên vì phức tạp hơn list thường, tương tự JOURNEY của KhoiRuocLe.
const TESTAMENT = [
  {
    id: "cuu-uoc",
    name: "Cựu Ước",
    icon: "📜",
    count: "46 Quyển",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-red-500/50 dark:hover:border-red-500/50",
    badge: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30",
    iconBg: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400",
    dot: "bg-red-500",
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
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-rose-500/50 dark:hover:border-rose-500/50",
    badge: "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/30",
    iconBg: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500",
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

// Ngưỡng breakpoint md của Tailwind — dùng để đồng bộ giữa CSS và JS logic (drag/animation)
const MOBILE_BREAKPOINT = 768;

export default function KhoiKinhThanh() {
  const [selectedTestament, setSelectedTestament] = useState(null);
  const { heroRef, lenis, mc, heroY, fadeUp, vp } = useKhoiMotion();
  const sheetY = useMotionValue(0);

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

  // Đóng modal bằng phím Escape — cải thiện accessibility cho bottom sheet
  useEffect(() => {
    if (!selectedTestament) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedTestament(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTestament]);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 dark:bg-stone-950 dark:text-stone-50 antialiased overflow-x-hidden selection:bg-red-500/20 dark:selection:bg-red-500/30 transition-colors duration-500">

      <HeroSection
        heroRef={heroRef}
        heroY={heroY}
        fadeUp={fadeUp}
        lenis={lenis}
        sectionBgClass="bg-gradient-to-b from-white via-[#faf8f5] to-transparent dark:from-stone-900 dark:via-stone-950"
        glowClass="bg-red-500/5 dark:bg-red-500/10"
        eyebrowIcon={BookOpen}
        eyebrowLabel="Khối Kinh Thánh"
        eyebrowClass="bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-300 border border-red-500/20 dark:border-red-500/30 shadow-sm"
        titleLine1="Lời Chúa —"
        titleLine2="nền tảng đức tin"
        titleGradientClass="bg-gradient-to-r from-red-600 via-rose-600 to-red-800 dark:from-red-400 dark:via-rose-400 dark:to-red-300"
        description="Kinh Thánh không chỉ là một cuốn sách cổ — đó là thư tình Thiên Chúa gửi cho con người qua mọi thời đại. Khối Kinh Thánh dẫn các em vào hành trình khám phá 73 quyển sách thiêng liêng đầy sống động."
        primaryCtaLabel="Xem chương trình học"
        primaryCtaTargetId="noi-dung"
        secondaryCtaLabel="Đăng ký Nhập Học"
        secondaryCtaTo="/tuyển-sinh#dang-ky"
        image={{ src: "/images/khoikinhthanh.avif", alt: "Khối Kinh Thánh" }}
        imageGlowClass="bg-gradient-to-tr from-red-500/5 to-rose-500/5"
        floatBadge={{ label: "Lớp 8 – 9", sub: "Thấu hiểu Lời Chúa", dotClass: "bg-red-500" }}
      />

      <OverviewCards items={OVERVIEW} />

      {/* TESTAMENT BENTO GRID — đặc thù khối này, giữ nguyên vì phức tạp hơn list thường */}
      <section id="noi-dung" className="py-24 max-w-6xl mx-auto px-6 scroll-mt-12 relative z-20">
        <div className="max-w-2xl text-left space-y-3 mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-red-600 dark:text-red-400">Chương trình</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight inline-block px-1 -mx-1">Hành trình qua 73 quyển sách</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed inline-block px-1 -mx-1">
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
              transition={{ duration: 0.5, delay: i * 0.05 }}
              onClick={() => setSelectedTestament(t)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedTestament(t); }}
              className={`group text-left rounded-[1.75rem] border p-6 flex flex-col justify-between min-h-[190px] cursor-pointer transition-all duration-300 bg-white dark:bg-stone-900 hover:shadow-xl hover:shadow-stone-200/30 dark:hover:shadow-none ${t.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl select-none">{t.icon}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${t.badge}`}>
                    {t.count}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors mb-2">{t.name}</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-3">{t.desc}</p>
              </div>
              <span className={`self-start mt-4 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${t.badge}`}>
                Xem danh mục
              </span>
            </motion.div>
          ))}

          {/* Lời Chúa Quote Card tích hợp Bento — đặc thù khối này */}
          <motion.div
            initial={{ opacity: 0, y: mc.yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-[1.75rem] border p-6 flex flex-col justify-between bg-red-500/5 dark:bg-red-500/10 border-red-500/20 text-left sm:col-span-2"
          >
            <div className="flex items-start gap-4">
              <Flame className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-1 fill-current" />
              <p className="text-sm font-semibold leading-relaxed italic text-stone-800 dark:text-stone-200">
                "Lời Thiên Chúa là ngọn đèn soi cho con bước, là ánh sáng chỉ đường con đi."
              </p>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-red-600/80 dark:text-red-400/80 mt-4 text-right">
              Thánh Vịnh 119,105
            </p>
          </motion.div>
        </div>

        {/* NATIVE IOS-STYLE BOTTOM SHEET MODAL */}
        <AnimatePresence>
          {selectedTestament && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedTestament(null)}
                className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-50 pointer-events-auto"
              />

              <div data-lenis-prevent className="fixed inset-0 z-[60] flex flex-col justify-end md:items-center md:justify-center p-0 md:p-4 pointer-events-none">
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="khoi-testament-title"
                  drag={isMobile ? "y" : false}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0.1, bottom: 0.6 }}
                  onDragEnd={handleDragEnd}
                  style={{ y: sheetY }}
                  initial={{ opacity: 0, y: isMobile ? "100%" : 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: isMobile ? "100%" : 20 }}
                  transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.9 }}
                  className="relative w-full md:max-w-xl pb-16 md:pb-0 rounded-t-[2.5rem] md:rounded-[2rem] border border-stone-200/80 dark:border-stone-800/80 shadow-2xl pointer-events-auto max-h-[88vh] md:max-h-[80vh] flex flex-col overflow-hidden bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl text-stone-900 dark:text-stone-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-center pt-3 pb-2 md:hidden touch-none">
                    <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full" />
                  </div>

                  <div className="flex items-start gap-4 p-6 pb-4 touch-none">
                    <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center shadow-inner flex-shrink-0 text-xl select-none">
                      {selectedTestament.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 id="khoi-testament-title" className="font-extrabold text-xl tracking-tight text-stone-900 dark:text-white leading-tight">{selectedTestament.name}</h3>
                      <p className="text-xs text-red-600 dark:text-red-400 font-bold mt-1 tracking-wide">{selectedTestament.count}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedTestament(null)}
                      aria-label="Đóng"
                      className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center transition-colors hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-90"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <path d="M18 6 6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>

                  <div className="h-px bg-stone-200/60 dark:bg-stone-800/60 mx-6 flex-shrink-0" />

                  <div className="p-6 pt-4 space-y-5 overflow-y-auto overscroll-contain flex-1 text-left">
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2.5">
                        Ý nghĩa cốt lõi
                      </h4>
                      <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300 font-medium">
                        {selectedTestament.desc}
                      </p>
                    </div>

                    <div className="h-px bg-stone-100 dark:bg-stone-800/50" />

                    <div className="space-y-5">
                      {selectedTestament.books.map((group, j) => (
                        <div key={j}>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2.5">
                            {group.group}
                          </h4>
                          <ul className="space-y-1.5">
                            {group.items.map((item, k) => (
                              <li key={k} className="flex items-start gap-2.5 text-sm text-stone-700 dark:text-stone-300 font-medium leading-relaxed">
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 ${selectedTestament.dot}`} />
                                {item}
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
        accentIconClass="bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400"
        cardClass="bg-white dark:bg-stone-900"
        sectionClassName="py-24 bg-white/40 dark:bg-stone-900/20 border-y border-stone-200/50 dark:border-stone-800/50 relative z-10"
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
        primaryCtaClass="bg-red-600 hover:bg-red-500 shadow-red-600/10"
        secondaryCtaLabel="Liên hệ Văn phòng Giáo xứ"
        secondaryCtaTo="/liên-hệ"
        mc={mc}
        vp={vp}
        sectionClassName="py-28 max-w-3xl mx-auto px-6 text-center relative z-10"
      />
    </div>
  );
}