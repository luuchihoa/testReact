import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Flame, ArrowRight, ChevronDown, GraduationCap, Heart, CheckCircle, Check } from "lucide-react";
import { useToast } from "./ui/ToastContext.jsx";
import { useLenis } from "lenis/react";

/* ─── Design tokens ── */
const GOLD = "#D4AF37";

/* ─── Framer Motion variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

/* ─── Animated counter ── */
function Counter({ target, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = 16;
    const increment = target / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── FAQ Accordion ── */
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
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors"
    >
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setTimeout(() => lenis?.resize(), 360);
        }}
        className="w-full flex justify-between items-center p-5 sm:p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-2xl"
      >
        <h3 className="font-semibold text-slate-900 pr-4 leading-snug text-sm sm:text-base">{item.q}</h3>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex-shrink-0 text-slate-400"
        >
          <ChevronDown className="w-5 h-5" />
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
            <p className="px-5 pb-5 sm:px-6 sm:pb-6 text-slate-500 text-sm leading-relaxed">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Programs & Stats ── */
const PROGRAMS = [
  {
    icon: BookOpen,
    title: "Khối Kinh Thánh",
    desc: "Giai đoạn nền tảng giúp các em làm quen với Lời Chúa, xây dựng đức tin trên Kinh Thánh.",
    path: "/khối-kinh-thánh",
    bg: "bg-blue-50 group-hover:bg-blue-100",
    iconColor: "text-blue-600",
    linkColor: "hover:text-blue-600",
    featured: false,
  },
  {
    icon: Sparkles,
    title: "Khối Phụng Vụ",
    desc: "Tìm hiểu sâu các nghi thức, bí tích và đời sống tâm linh trong các cử hành Phụng vụ.",
    path: "/khối-phụng-vụ",
    bg: "",
    iconColor: "text-amber-400",
    linkColor: "hover:text-amber-400",
    featured: true,
  },
  {
    icon: Flame,
    title: "Khối Thêm Sức",
    desc: "Hành trình trưởng thành trong đức tin, sẵn sàng lãnh nhận ơn thiêng từ Chúa Thánh Thần.",
    path: "/khối-thêm-sức",
    bg: "bg-rose-50 group-hover:bg-rose-100",
    iconColor: "text-rose-600",
    linkColor: "hover:text-rose-600",
    featured: false,
  },
];

const STATS = [
  { target: 500, suffix: "+", label: "Học viên" },
  { target: 45, suffix: "", label: "Giáo lý viên" },
  { target: 12, suffix: "", label: "Lớp học" },
  { target: 100, suffix: "%", label: "Yêu thương" },
];

/* ─── RegisterSection constants ── */
const KHOI_OPTIONS = [
  "Chiên Con (Mầm non – Lớp 2)",
  "Rước Lễ Lần Đầu (Lớp 3 – 4)",
  "Thiếu Nhi (Lớp 5 – 7)",
  "Thiếu (Lớp 8 – 9)",
  "Nghĩa (Lớp 10 – 12)",
  "Thêm Sức",
];

// Màu khớp hoàn toàn với các input trong RegisterSection (dark theme)
const FIELD_BASE = "w-full bg-slate-800/60 border rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none transition-all";
const fieldClass = (err) =>
  `${FIELD_BASE} ${err
    ? "border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/60"
    : "border-slate-700 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/60"
  }`;

const LABEL_CLASS = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2";
const ERR_CLASS   = "mt-1.5 text-xs text-rose-400 flex items-center gap-1";

/* ─── KhoiDropdown ─── (dark theme, flip-up, keyboard nav, max-height scroll) */
function KhoiDropdown({ value, onChange, error, disabled }) {
  const [open, setOpen]         = useState(false);
  const [openUp, setOpenUp]     = useState(false); // true = list mở lên trên (flip)
  const rootRef   = useRef(null);
  const listRef   = useRef(null);
  const focusIdxRef = useRef(-1);

  // Tính toán flip: nếu không đủ chỗ phía dưới thì mở lên trên
  const calcFlip = useCallback(() => {
    if (!rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    // list cao tối đa 240px + 8px offset
    setOpenUp(spaceBelow < 260);
  }, []);

  const openList = useCallback(() => {
    calcFlip();
    setOpen(true);
    focusIdxRef.current = KHOI_OPTIONS.findIndex((k) => k === value);
  }, [calcFlip, value]);

  const closeList = useCallback(() => {
    setOpen(false);
    focusIdxRef.current = -1;
  }, []);

  // Đóng khi click ra ngoài
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!rootRef.current?.contains(e.target)) closeList();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, closeList]);

  // Chặn Lenis chiếm sự kiện wheel/touchmove khi listbox đang mở.
  // Phải dùng native addEventListener (không phải React synthetic) với
  // { passive: false } thì mới gọi được stopPropagation/preventDefault.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current;

    const onWheel = (e) => {
      // Luôn chặn Lenis nhận event này
      e.stopPropagation();
      // Chỉ preventDefault ở biên để tránh trang scroll khi list đã hết chỗ cuộn
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atTop    = scrollTop === 0 && e.deltaY < 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;
      if (atTop || atBottom) e.preventDefault();
    };

    const onTouchMove = (e) => {
      // Lenis cũng bắt touchmove — chặn luôn, để browser tự xử lý scroll native
      e.stopPropagation();
    };

    el.addEventListener("wheel",     onWheel,     { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      el.removeEventListener("wheel",     onWheel);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, [open]);

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
    if (e.key === "ArrowDown")  { e.preventDefault(); focusItem(idx + 1); }
    if (e.key === "ArrowUp")    { e.preventDefault(); focusItem(idx - 1); }
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelect(KHOI_OPTIONS[idx]); }
    if (e.key === "Escape")     { closeList(); rootRef.current?.querySelector("button")?.focus(); }
    if (e.key === "Tab")        closeList();
  };

  const handleSelect = (k) => {
    onChange({ target: { value: k } });
    closeList();
    rootRef.current?.querySelector("button")?.focus();
  };

  const selected = KHOI_OPTIONS.find((k) => k === value);

  // List position classes tuỳ flip direction
  const listPositionClass = openUp
    ? "bottom-[calc(100%+6px)] top-auto"
    : "top-[calc(100%+6px)] bottom-auto";

  return (
    <div>
      <label className={LABEL_CLASS}>Khối đăng ký</label>
      <div className="relative" ref={rootRef}>
        {/* Trigger button — màu dark khớp với FIELD_BASE */}
        <button
          type="button"
          onClick={() => !disabled && (open ? closeList() : openList())}
          onKeyDown={handleTriggerKey}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Chọn khối đăng ký"
          disabled={disabled}
          className={[
            "w-full flex items-center justify-between gap-2 text-left",
            "px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "bg-slate-800/60 text-white",
            error
              ? "border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/60"
              : open
              ? "border-amber-400/60 ring-1 ring-amber-400/60"
              : "border-slate-700 hover:border-slate-600",
          ].join(" ")}
        >
          <span className={selected ? "text-white" : "text-slate-500"}>
            {selected ?? "Chọn khối phù hợp với bé"}
          </span>
          <ChevronDown
            className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* Listbox — dark theme, max-height + scroll, flip-up hỗ trợ mobile */}
        <AnimatePresence>
          {open && (
            <motion.ul
              ref={listRef}
              role="listbox"
              aria-label="Khối đăng ký"
              initial={{ opacity: 0, y: openUp ? 6 : -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: openUp ? 6 : -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
              className={[
                "absolute left-0 right-0 z-50",
                "bg-slate-900 border border-slate-700 rounded-xl",
                "shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
                "overflow-y-auto",          // scroll nếu list dài hơn max-height
                "overscroll-contain",
                listPositionClass,
              ].join(" ")}
              style={{ maxHeight: "240px" }}
            >
              {KHOI_OPTIONS.map((k, i) => {
                const isSelected = k === value;
                const isLast = i === KHOI_OPTIONS.length - 1;
                return (
                  <li
                    key={k}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={0}
                    onClick={() => handleSelect(k)}
                    onKeyDown={(e) => handleOptionKey(e, i)}
                    className={[
                      "flex items-center justify-between px-4 py-3",
                      "text-sm cursor-pointer select-none outline-none",
                      "transition-colors duration-100",
                      !isLast ? "border-b border-slate-800" : "",
                      isSelected
                        ? "bg-amber-500/15 text-amber-300"
                        : "text-slate-300 hover:bg-slate-800 focus-visible:bg-slate-800",
                    ].join(" ")}
                  >
                    <span>{k}</span>
                    {isSelected && <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      {error && <p className={ERR_CLASS}>⚠ {error}</p>}
    </div>
  );
}

/* ─── Main page ── */
export default function TuyenSinh() {
  const { scrollY } = useScroll();
  const heroRef = useRef(null);
  const [heroHeight, setHeroHeight] = useState(700);
  const lenis = useLenis();
  const { showToast } = useToast();

  useEffect(() => {
    if (heroRef.current) setHeroHeight(heroRef.current.offsetHeight);
  }, []);

  const heroOpacity = useTransform(scrollY, [heroHeight * 0.3, heroHeight * 0.85], [1, 0]);
  const heroY       = useTransform(scrollY, [0, heroHeight * 0.85], [0, -60]);

  return (
    <div className="bg-[#F8FAFC] text-slate-800 antialiased overflow-x-hidden selection:bg-amber-300 selection:text-slate-900">
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ══════ HERO ══════ */}
      <section ref={heroRef} className="relative pt-20 pb-20 sm:pt-32 sm:pb-32 lg:pt-48 lg:pb-40 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-tr from-amber-100/40 via-blue-50/40 to-transparent rounded-[100%] blur-[100px] -z-10" />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="max-w-5xl mx-auto px-5 sm:px-6 text-center relative z-10"
        >
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-5 sm:gap-6"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm hover:border-amber-300/60 transition-colors cursor-default"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
                Tuyển sinh niên khóa 2025 – 2026
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={0.1}
              className="text-4xl sm:text-6xl lg:text-8xl font-serif font-medium text-slate-900 tracking-tight leading-[1.08]"
            >
              Hành trình<br />
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-600 to-slate-900">
                Đức Tin
              </span>{" "}
              & Tình Yêu
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={0.2}
              className="text-base sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-light"
            >
              Nơi ươm mầm những tâm hồn trẻ thơ trong ánh sáng Tin Mừng, giúp các em trưởng thành
              về nhân bản và vững mạnh trong đời sống tâm linh.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={0.3}
              className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto"
            >
              <button
                type="button"
                onClick={() => lenis?.scrollTo("#dang-ky", { duration: 1.4 })}
                className="group relative inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 text-sm font-bold text-white bg-slate-900 rounded-full overflow-hidden hover:scale-105 transition-transform duration-300 shadow-lg shadow-slate-900/20 cursor-pointer"
              >
                <span>Đăng ký học ngay</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              <Link
                to="/tài-liệu"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <GraduationCap className="w-4 h-4 text-slate-400" />
                Xem tài liệu ôn tập
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════ STATS ══════ */}
      <section className="py-10 sm:py-12 border-y border-slate-100 bg-white/60 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          {STATS.map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mb-1 tabular-nums">
                <Counter target={s.target} suffix={s.suffix} />
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════ CHƯƠNG TRÌNH ══════ */}
      <section id="chuong-trinh" className="py-20 sm:py-32 bg-slate-50/60">
        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row justify-between items-end mb-12 sm:mb-16 gap-6"
          >
            <div className="max-w-xl">
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: GOLD }}>
                Chương trình đào tạo
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-slate-900 leading-tight">
                Nuôi dưỡng đức tin<br />từ những bước đầu
              </h2>
            </div>
            <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
              Giáo trình chuẩn mực theo chỉ nam của Hội Đồng Giám Mục, kết hợp phương pháp
              sư phạm hiện đại và tinh thần truyền giáo.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {PROGRAMS.map((prog, i) => {
              const Icon = prog.icon;
              if (prog.featured) {
                return (
                  <motion.div
                    key={prog.title}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -8 }}
                    className="group relative p-7 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[80px] transition-transform duration-500 group-hover:scale-150" />
                    <div className="relative z-10">
                      <div className="w-14 h-14 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center mb-7 sm:mb-8 group-hover:scale-110 transition-transform duration-300">
                        <Icon className={`w-7 h-7 ${prog.iconColor}`} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 font-serif">{prog.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed mb-6">{prog.desc}</p>
                      <Link
                        to={prog.path}
                        className={`inline-flex items-center gap-1.5 text-sm font-semibold text-white ${prog.linkColor} transition-colors`}
                      >
                        Tìm hiểu thêm
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                );
              }
              return (
                <motion.div
                  key={prog.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -8 }}
                  className="group relative p-7 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 ${prog.bg} rounded-bl-[80px] -z-0 transition-transform duration-500 group-hover:scale-150`} />
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center mb-7 sm:mb-8 group-hover:scale-110 transition-transform duration-300">
                      <Icon className={`w-7 h-7 ${prog.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 font-serif">{prog.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">{prog.desc}</p>
                    <Link
                      to={prog.path}
                      className={`inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 ${prog.linkColor} transition-colors`}
                    >
                      Tìm hiểu thêm
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════ FAQ ══════ */}
      <section className="py-20 sm:py-32 max-w-3xl mx-auto px-5 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl sm:text-3xl font-serif text-center text-slate-900 mb-10 sm:mb-12"
        >
          Thắc mắc thường gặp
        </motion.h2>
        <div className="space-y-3">
          {FAQS.map((item, i) => (
            <FaqItem key={i} item={item} index={i} lenis={lenis} />
          ))}
        </div>
      </section>

      {/* ══════ ĐĂNG KÝ ══════ */}
      <RegisterSection showToast={showToast} lenis={lenis} />
    </div>
  );
}

/* ─── RegisterSection ─── */
function RegisterSection({ showToast, lenis }) {
  const INIT = { hoTen: "", namSinh: "", sdt: "", giaoXom: "", khoi: "" };
  const [form,    setForm]    = useState(INIT);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.hoTen.trim())        e.hoTen   = "Vui lòng nhập họ tên.";
    const year = parseInt(form.namSinh);
    if (!form.namSinh || isNaN(year) || year < 1990 || year > 2024)
      e.namSinh = "Năm sinh không hợp lệ (1990–2024).";
    if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(form.sdt.replace(/\s/g, "")))
      e.sdt     = "Số điện thoại không hợp lệ.";
    if (!form.giaoXom.trim())      e.giaoXom = "Vui lòng nhập giáo xóm.";
    if (!form.khoi)                e.khoi    = "Vui lòng chọn khối đăng ký.";
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
    showToast("✅ Đăng ký thành công! Chúng tôi sẽ liên hệ sớm.", "success", 5000);
    setTimeout(() => lenis?.resize(), 50);
  };

  const handleReset = () => {
    setForm(INIT);
    setErrors({});
    setDone(false);
    setTimeout(() => lenis?.resize(), 50);
  };

  return (
    <section
      id="dang-ky"
      className="py-20 sm:py-32 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.035,
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-500/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-slate-700/40 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-xl mx-auto px-5 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10 sm:mb-12"
        >
          <Heart className="w-10 h-10 mx-auto mb-4" style={{ color: GOLD }} />
          <h2 className="text-3xl sm:text-4xl font-serif text-white mb-4">Đăng ký trực tuyến</h2>
          <p className="text-slate-400 font-light leading-relaxed text-sm sm:text-base">
            Hãy để lại thông tin, chúng tôi sẽ liên hệ xếp lớp phù hợp nhất cho bé.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
                className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ background: `${GOLD}20`, border: `2px solid ${GOLD}` }}
              >
                <CheckCircle className="w-10 h-10" style={{ color: GOLD }} />
              </motion.div>
              <h3 className="text-2xl font-serif text-white mb-3">Đăng ký thành công!</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                Cảm ơn bạn đã đăng ký. Chúng tôi sẽ liên hệ qua số điện thoại{" "}
                <span className="text-white font-semibold">{form.sdt}</span>{" "}
                để xác nhận và xếp lớp phù hợp cho bé.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 rounded-full text-sm font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Đăng ký thêm học viên khác
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4 sm:space-y-5"
            >
              {/*
                FIX #4: grid-cols-1 trên mobile, grid-cols-2 từ sm trở lên
                Tránh 2 cột trên màn 320px quá chật
              */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Tên Thánh & Tên Gọi</label>
                  <input
                    type="text"
                    value={form.hoTen}
                    onChange={set("hoTen")}
                    placeholder="Maria Nguyễn Thị A"
                    className={fieldClass(errors.hoTen)}
                    disabled={loading}
                  />
                  {errors.hoTen && <p className={ERR_CLASS}>⚠ {errors.hoTen}</p>}
                </div>
                <div>
                  <label className={LABEL_CLASS}>Năm sinh</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={form.namSinh}
                    onChange={set("namSinh")}
                    placeholder="2015"
                    className={fieldClass(errors.namSinh)}
                    disabled={loading}
                  />
                  {errors.namSinh && <p className={ERR_CLASS}>⚠ {errors.namSinh}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Số điện thoại phụ huynh</label>
                  <input
                    type="tel"
                    value={form.sdt}
                    onChange={set("sdt")}
                    placeholder="090..."
                    className={fieldClass(errors.sdt)}
                    disabled={loading}
                  />
                  {errors.sdt && <p className={ERR_CLASS}>⚠ {errors.sdt}</p>}
                </div>
                <div>
                  <label className={LABEL_CLASS}>Giáo xóm</label>
                  <input
                    type="text"
                    value={form.giaoXom}
                    onChange={set("giaoXom")}
                    placeholder="Xóm 1, Xóm 2..."
                    className={fieldClass(errors.giaoXom)}
                    disabled={loading}
                  />
                  {errors.giaoXom && <p className={ERR_CLASS}>⚠ {errors.giaoXom}</p>}
                </div>
              </div>

              <KhoiDropdown
                value={form.khoi}
                onChange={set("khoi")}
                error={errors.khoi}
                disabled={loading}
              />

              <div>
                <label className={LABEL_CLASS}>
                  Ghi chú thêm{" "}
                  <span className="normal-case text-slate-600">(không bắt buộc)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Bé có hoàn cảnh đặc biệt, yêu cầu riêng..."
                  className={`${FIELD_BASE} border-slate-700 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/60 resize-none`}
                  disabled={loading}
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="w-full flex items-center justify-center gap-2.5 font-bold text-sm uppercase tracking-wide py-4 rounded-xl transition-all duration-200 shadow-lg mt-1 disabled:opacity-70 cursor-pointer"
                style={{ background: loading ? "#b8940f" : GOLD, color: "#0F172A" }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Đang gửi hồ sơ…
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    Gửi hồ sơ đăng ký
                  </>
                )}
              </motion.button>

              <p className="text-center text-xs text-slate-600 leading-relaxed">
                Thông tin chỉ dùng để xếp lớp, không chia sẻ cho bên thứ ba.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}