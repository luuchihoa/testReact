import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Flame, ArrowRight, ChevronDown, GraduationCap, Heart, CheckCircle, Check } from "lucide-react";
import { useToast } from "./ui/ToastContext.jsx";
import { useLenis } from "lenis/react";

const GOLD = "#D4AF37";

/* ─── Hook phát hiện Mobile ──────────────────────────────────── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    setIsMobile(mql.matches);
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

/* ─── Motion Variants ────────────────────────────────────────── */
const fadeUp = {
  hidden: (c) => ({ opacity: 0, y: c?.m ? 16 : 32 }),
  visible: (c) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: c?.d || 0 },
  }),
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─── Counter — rAF ──────────────────────────────────────────── */
function Counter({ target, suffix = "" }) {
  const isMobile = useIsMobile();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: isMobile ? "-40px" : "-80px" });
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      else setCount(target);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── FAQ ─────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: "Con tôi chưa biết đọc có học được không?",
    a: "Với các bé độ tuổi mầm non hoặc lớp 1 chưa thạo chữ, chúng tôi sử dụng phương pháp trực quan sinh động bằng hình ảnh, bài hát và kể chuyện. Không yêu cầu bé phải biết đọc viết thành thạo.",
  },
  {
    q: "Lịch học có trùng với giờ lễ không?",
    a: "Giờ học Giáo Lý (08:00–09:30) được sắp xếp ngay sau Thánh Lễ Thiếu Nhi (07:00–08:00) để thuận tiện cho phụ huynh đưa đón và các em tham dự trọn vẹn.",
  },
  {
    q: "Phụ huynh ngoài giáo xứ có đăng ký được không?",
    a: "Chúng tôi luôn chào đón tất cả các gia đình Công giáo có nhu cầu. Vui lòng liên hệ trực tiếp văn phòng giáo xứ để được hỗ trợ thủ tục.",
  },
];

function FaqItem({ item, index, lenis }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: isMobile ? 16 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: isMobile ? "-40px" : "0px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="bg-stone-50 dark:bg-[#1c1c1e] rounded-2xl overflow-hidden border border-stone-200/50 dark:border-stone-800/50 transition-colors"
    >
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setTimeout(() => lenis?.resize(), 360);
        }}
        className="w-full flex justify-between items-center p-5 sm:p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-2xl"
      >
        <h3 className="font-semibold text-stone-900 dark:text-stone-100 pr-4 leading-snug text-sm sm:text-base">{item.q}</h3>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-stone-800 flex items-center justify-center text-stone-500 dark:text-stone-400 shadow-sm"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 sm:px-6 sm:pb-6 text-stone-500 dark:text-stone-400 text-sm leading-relaxed">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Dữ liệu Chương trình ────────────────────────────────────── */
const PROGRAMS = [
  {
    icon: BookOpen, title: "Khối Kinh Thánh",
    desc: "Giai đoạn nền tảng giúp các em làm quen với Lời Chúa, xây dựng đức tin trên Kinh Thánh.",
    path: "/khối-kinh-thánh",
    iconBg: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
  },
  {
    icon: Sparkles, title: "Khối Phụng Vụ",
    desc: "Tìm hiểu sâu các nghi thức, bí tích và đời sống tâm linh trong các cử hành Phụng vụ.",
    path: "/khối-phụng-vụ",
    iconBg: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
    featured: true,
  },
  {
    icon: Flame, title: "Khối Thêm Sức",
    desc: "Hành trình trưởng thành trong đức tin, sẵn sàng lãnh nhận ơn thiêng từ Chúa Thánh Thần.",
    path: "/khối-thêm-sức",
    iconBg: "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400",
  },
];

const STATS = [
  { target: 500, suffix: "+", label: "Học viên" },
  { target: 45, suffix: "", label: "Giáo lý viên" },
  { target: 12, suffix: "", label: "Lớp học" },
  { target: 100, suffix: "%", label: "Yêu thương" },
];

/* ─── Form constants ────────────────────────────────────────────── */
const KHOI_OPTIONS = [
  "Chiên Con (Mầm non – Lớp 2)",
  "Rước Lễ Lần Đầu (Lớp 3 – 4)",
  "Thêm Sức (Lớp 5 – 6)",
  "Phụng Vụ (Lớp 7)",
];

const LABEL_CLASS = "block text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2";
const ERR_CLASS   = "mt-1.5 text-[11px] font-medium text-rose-500 dark:text-rose-400 flex items-center gap-1";

const getInputClass = (err) => `
  w-full px-4 py-3.5 text-sm rounded-xl transition-all duration-200 outline-none
  bg-[#f5f5f7] dark:bg-[#2c2c2e] text-stone-900 dark:text-white
  placeholder-stone-400 dark:placeholder-stone-500
  ${err 
    ? "border border-rose-500 focus:ring-4 focus:ring-rose-500/20 bg-rose-50/50 dark:bg-rose-500/10" 
    : "border border-transparent focus:bg-white dark:focus:bg-[#1c1c1e] focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/20"}
`;

/* ─── KhoiDropdown — Apple iOS Style Portal ───────────────────── */
function KhoiDropdown({ value, onChange, error, disabled }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const [openUp, setOpenUp] = useState(false);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const rafRef = useRef(null);
  const focusIdxRef = useRef(-1);

  const measureTrigger = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setOpenUp(window.innerHeight - r.bottom < 260);
    setRect(r);
  }, []);

  const openList = useCallback(() => {
    measureTrigger();
    setOpen(true);
    focusIdxRef.current = KHOI_OPTIONS.findIndex((k) => k === value);
  }, [measureTrigger, value]);

  const closeList = useCallback(() => {
    setOpen(false);
    focusIdxRef.current = -1;
  }, []);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        measureTrigger();
        rafRef.current = null;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    };
  }, [open, measureTrigger]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!triggerRef.current?.contains(e.target) && !listRef.current?.contains(e.target))
        closeList();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, closeList]);

  const focusItem = useCallback((idx) => {
    const items = listRef.current?.querySelectorAll("[role=option]");
    if (!items) return;
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    focusIdxRef.current = clamped;
    items[clamped]?.focus();
  }, []);

  const handleTriggerKey = (e) => {
    if (disabled) return;
    if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      if (!open) { openList(); setTimeout(() => focusItem(Math.max(0, focusIdxRef.current)), 20); }
      else if (e.key === "ArrowDown") focusItem(focusIdxRef.current + 1);
      else if (e.key === "ArrowUp")   focusItem(focusIdxRef.current - 1);
    }
    if (e.key === "Escape") closeList();
  };

  const handleOptionKey = (e, idx) => {
    if (e.key === "ArrowDown")               { e.preventDefault(); focusItem(idx + 1); }
    if (e.key === "ArrowUp")                 { e.preventDefault(); focusItem(idx - 1); }
    if (e.key === "Enter" || e.key === " ")  { e.preventDefault(); handleSelect(KHOI_OPTIONS[idx]); }
    if (e.key === "Escape") { closeList(); triggerRef.current?.focus(); }
    if (e.key === "Tab") closeList();
  };

  const handleSelect = (k) => {
    onChange({ target: { value: k } });
    closeList();
    triggerRef.current?.focus();
  };

  const portalStyle = rect ? {
    position: "fixed",
    width: rect.width,
    left: rect.left,
    ...(openUp ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }),
    zIndex: 9999,
    maxHeight: "240px",
  } : { display: "none" };

  return (
    <div>
      <label className={LABEL_CLASS}>Khối đăng ký</label>
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => !disabled && (open ? closeList() : openList())}
          onKeyDown={handleTriggerKey}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          className={`w-full flex items-center justify-between gap-2 text-left px-4 py-3.5 rounded-xl text-sm transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? "border border-rose-500 focus:ring-4 focus:ring-rose-500/20 bg-rose-50/50 dark:bg-rose-500/10" 
                    : open ? "bg-white dark:bg-[#1c1c1e] border border-amber-500/50 ring-4 ring-amber-500/20" 
                           : "bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-transparent"}
          `}
        >
          <span className={value ? "text-stone-900 dark:text-white" : "text-stone-400 dark:text-stone-500"}>
            {value || "Chọn khối phù hợp với bé"}
          </span>
          <ChevronDown className={`w-4 h-4 flex-shrink-0 text-stone-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>

        {open && rect && createPortal(
          <AnimatePresence>
            <motion.ul
              ref={listRef}
              role="listbox"
              initial={{ opacity: 0, y: openUp ? 6 : -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: openUp ? 6 : -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
              style={portalStyle}
              className="bg-white/90 dark:bg-[#2c2c2e]/90 backdrop-blur-xl border border-stone-200/50 dark:border-stone-700/50 rounded-xl shadow-2xl overflow-y-auto overscroll-contain p-1"
            >
              {KHOI_OPTIONS.map((k, i) => {
                const isSelected = k === value;
                return (
                  <li
                    key={k}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={0}
                    onClick={() => handleSelect(k)}
                    onKeyDown={(e) => handleOptionKey(e, i)}
                    className={`flex items-center justify-between px-3 py-2.5 my-0.5 rounded-lg text-sm cursor-pointer select-none outline-none transition-colors duration-100
                      ${isSelected ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-semibold" 
                                   : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 focus:bg-stone-100 dark:focus:bg-stone-800"}
                    `}
                  >
                    <span>{k}</span>
                    {isSelected && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />}
                  </li>
                );
              })}
            </motion.ul>
          </AnimatePresence>,
          document.body
        )}
      </div>
      {error && <p className={ERR_CLASS}>⚠ {error}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function TuyenSinh() {
  const isMobile = useIsMobile();
  const { scrollY } = useScroll();
  const heroRef = useRef(null);
  const lenis = useLenis();
  const { showToast } = useToast();
  const [heroHeight, setHeroHeight] = useState(700);
  const location = useLocation();

  useEffect(() => {
    if (heroRef.current) setHeroHeight(heroRef.current.offsetHeight);
  }, []);

  useEffect(() => {
    if (location.hash !== "#dang-ky") return;
    const el = document.getElementById("dang-ky");
    if (!el) return;

    const timeout = setTimeout(() => {
      const navbarHeight = document.querySelector("header")?.offsetHeight ?? 0;
      if (window.lenis) {
        window.lenis.scrollTo(el, { duration: 1.2, offset: -navbarHeight });
      } else {
        const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [location.hash]);

  const heroOpacity = useTransform(scrollY, [heroHeight * 0.3, heroHeight * 0.85], [1, 0]);
  const heroY = useTransform(scrollY, [0, heroHeight * 0.85], [0, -60]);
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="bg-[#f5f5f7] text-stone-900 dark:bg-[#000000] dark:text-stone-50 antialiased overflow-x-hidden selection:bg-amber-200 selection:text-amber-900 transition-colors duration-500 relative">
      
      {/* Apple Premium Grid Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* ══════ HERO ══════ */}
      <section ref={heroRef} className="relative pt-24 pb-20 sm:pt-36 sm:pb-32 overflow-hidden border-b border-stone-200/50 dark:border-stone-800/50">
        {!isMobile && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-amber-400/10 via-orange-300/5 to-transparent rounded-[100%] blur-[120px] -z-10" />
        )}

        <motion.div
          style={{ opacity: heroOpacity, y: heroY, willChange: "transform, opacity" }}
          className="max-w-5xl mx-auto px-5 sm:px-6 text-center relative z-10"
        >
          <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col items-center gap-6 sm:gap-8">
            
            <motion.div variants={fadeUp} custom={{ d: 0, m: isMobile }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 dark:bg-stone-900/50 backdrop-blur-md border border-stone-200/50 dark:border-stone-800/50 shadow-sm"
            >
              <span className="relative flex h-2 w-2 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300 tracking-wide uppercase">
                Tuyển sinh niên khóa {year} – {(year) + 1}
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} custom={{ d: 0.1, m: isMobile }}
              className="text-4xl sm:text-6xl md:text-7xl font-serif font-medium text-stone-900 dark:text-white tracking-tight leading-[1.08]"
            >
              Hành trình<br />
              <span className="italic" style={{ color: GOLD }}>Đức Tin</span> & Tình Yêu
            </motion.h1>

            <motion.p variants={fadeUp} custom={{ d: 0.2, m: isMobile }}
              className="text-base sm:text-lg text-stone-500 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed font-medium"
            >
              Nơi ươm mầm những tâm hồn trẻ thơ trong ánh sáng Tin Mừng, giúp các em trưởng thành
              về nhân bản và vững mạnh trong đời sống tâm linh.
            </motion.p>

            <motion.div variants={fadeUp} custom={{ d: 0.3, m: isMobile }}
              className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-2"
            >
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("dang-ky");
                  if (!el) return;
                  const navbarHeight = document.querySelector("header")?.offsetHeight ?? 0;
                  if (window.lenis) window.lenis.scrollTo(el, { duration: 1.2, offset: -navbarHeight });
                  else el.scrollIntoView({ behavior: "smooth" });
                }}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 rounded-2xl text-sm font-bold text-stone-900 dark:text-stone-900 bg-amber-400 hover:bg-amber-500 shadow-[0_4px_20px_rgba(251,191,36,0.3)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Đăng ký học ngay
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link
                to="/tài-liệu"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl text-sm font-semibold border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <GraduationCap className="w-4 h-4" /> Xem tài liệu ôn tập
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════ STATS (Glassmorphism Row) ══════ */}
      <section className="py-8 sm:py-12 bg-white/40 dark:bg-black/40 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50 relative z-10 sticky top-[60px] md:top-[72px]">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          {STATS.map((s) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white mb-1 tabular-nums">
                <Counter target={s.target} suffix={s.suffix} />
              </p>
              <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════ CHƯƠNG TRÌNH (Bento Grid) ══════ */}
      <section id="chuong-trinh" className="py-20 sm:py-28 max-w-5xl mx-auto px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 16 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: isMobile ? "-40px" : "-80px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row justify-between items-end mb-12 sm:mb-16 gap-6"
        >
          <div className="max-w-xl">
            <p className="text-[11px] font-bold tracking-widest uppercase mb-3 text-amber-600 dark:text-amber-500">
              Chương trình đào tạo
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-stone-900 dark:text-white leading-tight">
              Nuôi dưỡng đức tin<br />từ những bước đầu
            </h2>
          </div>
          <p className="text-stone-500 dark:text-stone-400 max-w-sm text-sm leading-relaxed font-medium">
            Giáo trình chuẩn mực theo chỉ nam của Hội Đồng Giám Mục, kết hợp phương pháp sư phạm hiện đại.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {PROGRAMS.map((prog, i) => {
            const Icon = prog.icon;
            
            return (
              <motion.div key={prog.title}
                initial={{ opacity: 0, y: isMobile ? 16 : 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: isMobile ? "-40px" : "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={isMobile ? {} : { y: -4, transition: { duration: 0.2 } }}
                className={`group relative p-6 sm:p-8 rounded-3xl flex flex-col h-full overflow-hidden transition-shadow duration-300
                  ${prog.featured 
                    ? "bg-stone-900 dark:bg-stone-800 text-white shadow-xl" 
                    : "bg-white dark:bg-[#1c1c1e] text-stone-900 dark:text-white border border-stone-200/60 dark:border-stone-800/80 shadow-sm hover:shadow-md dark:shadow-none"}
                `}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${prog.iconBg}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif font-bold mb-3">{prog.title}</h3>
                <p className={`text-sm leading-relaxed mb-8 flex-1 ${prog.featured ? "text-stone-400" : "text-stone-500 dark:text-stone-400"}`}>
                  {prog.desc}
                </p>
                <Link to={prog.path}
                  className={`inline-flex items-center gap-1.5 text-sm font-bold transition-colors
                    ${prog.featured ? "text-amber-400 hover:text-amber-300" : "text-stone-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400"}
                  `}
                >
                  Tìm hiểu thêm <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ══════ FAQ ══════ */}
      <section className="py-16 sm:py-24 max-w-3xl mx-auto px-5 sm:px-6 border-t border-stone-200/50 dark:border-stone-800/50">
        <motion.h2
          initial={{ opacity: 0, y: isMobile ? 16 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl font-serif font-medium text-center text-stone-900 dark:text-white mb-10"
        >
          Thắc mắc thường gặp
        </motion.h2>
        <div className="space-y-3">
          {FAQS.map((item, i) => (
            <FaqItem key={i} item={item} index={i} lenis={lenis} />
          ))}
        </div>
      </section>

      {/* ══════ ĐĂNG KÝ (Apple Form Style) ══════ */}
      <RegisterSection showToast={showToast} lenis={lenis} />
    </div>
  );
}

/* ─── RegisterSection ───────────────────────────────────────────── */
function RegisterSection({ showToast, lenis }) {
  const isMobile = useIsMobile();
  const INIT = { hoTen: "", namSinh: "", sdt: "", giaoXom: "", khoi: "" };
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.hoTen.trim()) e.hoTen = "Vui lòng nhập họ tên.";
    const year = parseInt(form.namSinh);
    if (!form.namSinh || isNaN(year) || year < 1990 || year > 2024)
      e.namSinh = "Năm sinh không hợp lệ (1990–2024).";
    if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(form.sdt.replace(/\s/g, "")))
      e.sdt = "Số điện thoại không hợp lệ.";
    if (!form.giaoXom.trim()) e.giaoXom = "Vui lòng nhập giáo xóm.";
    if (!form.khoi) e.khoi = "Vui lòng chọn khối.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setDone(true);
    showToast("Đăng ký thành công! Chúng tôi sẽ liên hệ sớm.", "success", 5000);
    setTimeout(() => lenis?.resize(), 50);
  };

  const handleReset = () => {
    setForm(INIT); setErrors({}); setDone(false);
    setTimeout(() => lenis?.resize(), 50);
  };

  return (
    <section id="dang-ky" className="py-20 sm:py-32 relative bg-stone-100 dark:bg-[#0a0a0a] border-t border-stone-200/50 dark:border-stone-800/50">
      <div className="max-w-2xl mx-auto px-5 sm:px-6 relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 16 : 24 }} 
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: isMobile ? "-40px" : "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10 sm:mb-12"
        >
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-amber-600 dark:text-amber-500" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-stone-900 dark:text-white mb-4">Đăng ký trực tuyến</h2>
          <p className="text-stone-500 dark:text-stone-400 font-medium leading-relaxed text-sm sm:text-base max-w-md mx-auto">
            Hãy để lại thông tin, chúng tôi sẽ liên hệ xếp lớp phù hợp nhất cho bé.
          </p>
        </motion.div>

        <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] p-6 sm:p-10 shadow-xl dark:shadow-none border border-stone-200/60 dark:border-stone-800/80">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-serif font-medium text-stone-900 dark:text-white mb-3">Đăng ký thành công!</h3>
                <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                  Cảm ơn bạn đã đăng ký. Chúng tôi sẽ liên hệ qua số điện thoại{" "}
                  <span className="text-stone-900 dark:text-white font-bold">{form.sdt}</span>{" "}
                  để xác nhận.
                </p>
                <button type="button" onClick={handleReset}
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                >
                  Đăng ký thêm bé khác
                </button>
              </motion.div>
            ) : (
              <motion.form key="form"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                onSubmit={handleSubmit} noValidate className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={LABEL_CLASS}>Tên Thánh & Tên Gọi</label>
                    <input type="text" value={form.hoTen} onChange={set("hoTen")}
                      placeholder="Maria Nguyễn Thị A" className={getInputClass(errors.hoTen)} disabled={loading} />
                    {errors.hoTen && <p className={ERR_CLASS}>⚠ {errors.hoTen}</p>}
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Năm sinh</label>
                    <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4}
                      value={form.namSinh} onChange={set("namSinh")}
                      placeholder="2015" className={getInputClass(errors.namSinh)} disabled={loading} />
                    {errors.namSinh && <p className={ERR_CLASS}>⚠ {errors.namSinh}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={LABEL_CLASS}>Số điện thoại phụ huynh</label>
                    <input type="tel" inputMode="numeric" pattern="[0-9]*" value={form.sdt} onChange={set("sdt")}
                      placeholder="090..." className={getInputClass(errors.sdt)} disabled={loading} />
                    {errors.sdt && <p className={ERR_CLASS}>⚠ {errors.sdt}</p>}
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Giáo xóm</label>
                    <input type="text" value={form.giaoXom} onChange={set("giaoXom")}
                      placeholder="Xóm 1, Xóm 2..." className={getInputClass(errors.giaoXom)} disabled={loading} />
                    {errors.giaoXom && <p className={ERR_CLASS}>⚠ {errors.giaoXom}</p>}
                  </div>
                </div>

                <KhoiDropdown value={form.khoi} onChange={set("khoi")} error={errors.khoi} disabled={loading} />

                <div>
                  <label className={LABEL_CLASS}>Ghi chú thêm <span className="normal-case text-stone-400">(không bắt buộc)</span></label>
                  <textarea rows={3} placeholder="Bé có hoàn cảnh đặc biệt, yêu cầu riêng..."
                    className={`${getInputClass(false)} resize-none`} disabled={loading} />
                </div>

                <motion.button type="submit" disabled={loading}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  className="w-full h-14 flex items-center justify-center gap-2 font-bold text-sm bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-900 rounded-xl transition-all shadow-md mt-2 disabled:opacity-70 disabled:cursor-not-allowed hover:bg-stone-800 dark:hover:bg-amber-400"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Đang gửi hồ sơ...
                    </>
                  ) : (
                    "Gửi hồ sơ đăng ký"
                  )}
                </motion.button>
                <p className="text-center text-[11px] text-stone-500 dark:text-stone-400 mt-4">
                  Thông tin được bảo mật tuyệt đối và chỉ dùng để xếp lớp.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}