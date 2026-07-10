import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Scroll, Map, Users, Clock, CalendarDays, ArrowRight, Layers, ChevronDown, Flame } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue } from "framer-motion";
import { useLenis } from "lenis/react";
import { useMotionConfig } from "../hooks/useMotionConfig.js";

const OVERVIEW = [
  { icon: Users,        label: "Độ tuổi",    value: "Lớp 8 – Lớp 9" },
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

export default function KhoiKinhThanh() {
  const [selectedTestament, setSelectedTestament] = useState(null);
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const lenis = useLenis();
  const sheetY = useMotionValue(0);

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
      if (window.innerWidth < 768) document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [selectedTestament, sheetY]);

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
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 dark:bg-stone-950 dark:text-stone-50 antialiased overflow-x-hidden selection:bg-red-500/20 dark:selection:bg-red-500/30 transition-colors duration-500">

      {/* HERO SECTION */}
      <section ref={heroRef} className="relative overflow-hidden pt-12 pb-20 md:pt-32 md:pb-32 bg-gradient-to-b from-white via-[#faf8f5] to-transparent dark:from-stone-900 dark:via-stone-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <motion.div style={{ y: heroY }} className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="md:col-span-7 space-y-6 text-left">
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-300">
                  <BookOpen className="w-3 h-3" /> Khối Kinh Thánh
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={0.06} className="text-4xl sm:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight leading-[1.08]">
                Lời Chúa —<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-rose-600 to-red-800 dark:from-red-400 dark:via-rose-400 dark:to-red-300">
                  nền tảng đức tin
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={0.12} className="text-base sm:text-lg text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl font-normal">
                Kinh Thánh không chỉ là một cuốn sách cổ — đó là thư tình Thiên Chúa gửi cho con người qua mọi thời đại. Khối Kinh Thánh dẫn các em vào hành trình khám phá 73 quyển sách thiêng liêng đầy sống động.
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
                  Xem nội dung <ArrowRight className="w-4 h-4" />
                </button>
                <Link to="/tuyển-sinh#dang-ky"
                  className="inline-flex items-center justify-center h-12 px-6 rounded-full text-xs font-bold border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/60 shadow-sm active:scale-[0.98] transition-all duration-200">
                  Đăng ký Nhập Học
                </Link>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.24} className="md:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[340px] aspect-square rounded-[2.5rem] bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 p-8 shadow-xl dark:shadow-black/40 flex items-center justify-center group">
                <div className="absolute inset-0 bg-gradient-to-tr from-red-500/5 to-rose-500/5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <img src="/images/khoikinhthanh.avif" alt="Khối Kinh Thánh" className="w-full h-full object-contain transform group-hover:scale-[1.02] transition-transform duration-500" loading="eager" />

                <div className="absolute -bottom-4 right-6 bg-white/90 dark:bg-stone-800/90 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center gap-3 border border-stone-200/80 dark:border-stone-700/80 shadow-md">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold tracking-tight">Lớp 8 – 9</p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Thấu hiểu Lời Chúa</p>
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

      {/* TESTAMENT BENTO GRID */}
      <section id="noi-dung" className="py-24 max-w-6xl mx-auto px-6 scroll-mt-12">
        <div className="max-w-2xl text-left space-y-3 mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-red-600 dark:text-red-400">Chương trình</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Hành trình qua 73 quyển sách</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
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

          {/* Lời Chúa Quote Card tích hợp Bento */}
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
                  drag={window.innerWidth < 768 ? "y" : false}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0.1, bottom: 0.6 }}
                  onDragEnd={handleDragEnd}
                  style={{ y: sheetY }}

                  initial={{ opacity: 0, y: window.innerWidth < 768 ? "100%" : 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: window.innerWidth < 768 ? "100%" : 20 }}
                  transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.9 }}

                  className="relative w-full md:max-w-xl rounded-t-[2.5rem] md:rounded-[2rem] border border-stone-200/80 dark:border-stone-800/80 shadow-2xl pointer-events-auto max-h-[88vh] md:max-h-[80vh] flex flex-col overflow-hidden bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl text-stone-900 dark:text-stone-50"
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
                      <h3 className="font-extrabold text-xl tracking-tight text-stone-900 dark:text-white leading-tight">{selectedTestament.name}</h3>
                      <p className="text-xs text-red-600 dark:text-red-400 font-bold mt-1 tracking-wide">{selectedTestament.count}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedTestament(null)}
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

      {/* PEDAGOGICAL METHODS */}
      <section className="py-24 bg-white/40 dark:bg-stone-900/20 border-y border-stone-200/50 dark:border-stone-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl text-left space-y-2 mb-16">
            <p className="text-[11px] font-bold tracking-widest uppercase text-red-600 dark:text-red-400">Phương pháp giáo lý</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Kinh Thánh sống động, không khô khan</h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {METHODS.map((item, i) => { const Icon = item.icon; return (
              <motion.div key={i} initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
                viewport={vp} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/60 dark:border-stone-800/80 p-6 shadow-sm hover:shadow-md transition-all text-left">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-6 bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-2">{item.title}</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ); })}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-28 max-w-3xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }} viewport={vp} transition={{ duration: 0.6 }}>
          <div className="inline-flex w-12 h-12 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md items-center justify-center mb-8">
            <BookOpen className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Mở Trang Kinh Thánh Cùng Con</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base leading-relaxed mb-10 max-w-xl mx-auto font-medium">
            Kính mời quý Phụ huynh đăng ký để con em bước vào hành trình khám phá Lời Chúa — nền tảng vững chắc nhất cho một đời sống đức tin trường tồn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/tuyển-sinh#dang-ky"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full text-xs font-bold text-white shadow-lg shadow-red-600/10 bg-red-600 hover:bg-red-500 active:scale-[0.98] transition-all duration-200"
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