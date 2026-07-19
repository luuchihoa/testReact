import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, BookOpen, Sparkles, Flame, GraduationCap, ArrowRight, CheckCircle, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useIsMobile } from "../hooks/useMotionConfig";
import { createPortal } from "react-dom";
import { useToast } from "../components/ui/ToastContext.jsx";
import { useLenis } from "lenis/react";
import { supabase } from "../lib/supabase.js";

function Counter({ target, suffix = "" }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);
  
  // Theo dõi xem phần tử đã hiển thị trên màn hình chưa (chỉ kích hoạt 1 lần)
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    // Nếu chưa cuộn tới nơi thì KHÔNG chạy hiệu ứng đếm số
    if (!isInView) return;

    const duration = 1800;
    const startTime = performance.now();
    
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // Cubic ease-out
      
      setCount(Math.floor(eased * target));
      
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setCount(target);
      }
    };
    
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, isInView]); // Thêm isInView vào danh sách phụ thuộc

  return <span ref={ref}>{count}{suffix}</span>;
}

const FAQS = [
  { q: "Con tôi chưa biết đọc có học được không?", a: "Với các bé độ tuổi mầm non hoặc lớp 1 chưa thạo chữ, chúng tôi sử dụng phương pháp trực quan sinh động bằng hình ảnh, bài hát và kể chuyện. Không yêu cầu bé phải biết đọc viết thành thạo." },
  { q: "Lịch học có trùng với giờ lễ không?", a: "Giờ học Giáo Lý (08:00–09:30) được sắp xếp ngay sau Thánh Lễ Thiếu Nhi (07:00–08:00) để thuận tiện cho phụ huynh đưa đón và các em tham dự trọn vẹn." },
  { q: "Phụ huynh ngoài giáo xứ có đăng ký được không?", a: "Chúng tôi luôn chào đón tất cả các gia đình Công giáo có nhu cầu. Vui lòng liên hệ trực tiếp văn phòng giáo xứ để được hỗ trợ thủ tục." },
];

function FaqItem({ item, index, lenis }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: isMobile ? 16 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: isMobile ? "-40px" : "0px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white/60 dark:bg-stone-800/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-amber-900/10 dark:border-amber-100/10 transition-colors shadow-sm"
    >
      <button type="button" onClick={() => { setOpen((v) => !v); setTimeout(() => lenis?.resize(), 360); }} className="w-full flex justify-between items-center p-5 sm:p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-2xl">
        <h3 className="font-bold text-amber-950 dark:text-amber-50 pr-4 leading-snug text-[14.5px] sm:text-base">{item.q}</h3>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100/50 dark:bg-amber-900/30 flex items-center justify-center text-amber-800 dark:text-amber-400 shadow-sm border border-amber-900/5 dark:border-amber-100/5">
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1">
              <div className="border-l-[3px] border-amber-400/50 dark:border-amber-500/30 pl-4 text-stone-600 dark:text-stone-400 text-[13.5px] sm:text-sm leading-relaxed font-medium">
                {item.a}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const PROGRAMS = [
  { icon: BookOpen, title: "Khối Kinh Thánh", desc: "Giai đoạn nền tảng giúp các em làm quen với Lời Chúa, xây dựng đức tin trên Kinh Thánh.", path: "/khối-kinh-thánh", iconBg: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-500/20" },
  { icon: Sparkles, title: "Khối Phụng Vụ", desc: "Tìm hiểu sâu các nghi thức, bí tích và đời sống tâm linh trong các cử hành Phụng vụ.", path: "/khối-phụng-vụ", iconBg: "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-500/20", featured: true },
  { icon: Flame, title: "Khối Thêm Sức", desc: "Hành trình trưởng thành trong đức tin, sẵn sàng lãnh nhận ơn thiêng từ Chúa Thánh Thần.", path: "/khối-thêm-sức", iconBg: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20" },
];

const STATS = [
  { target: 500, suffix: "+", label: "Học viên" },
  { target: 45,  suffix: "", label: "Giáo lý viên" },
  { target: 12,  suffix: "", label: "Lớp học" },
  { target: 100, suffix: "%", label: "Yêu thương" },
];

const KHOI_OPTIONS = ["Chiên Con (Mầm non – Lớp 2)", "Rước Lễ Lần Đầu (Lớp 3 – 4)", "Thêm Sức (Lớp 5 – 6)", "Phụng Vụ (Lớp 7)"];
const LABEL_CLASS = "block text-[11px] font-bold text-amber-800/70 dark:text-amber-400/70 uppercase tracking-wider mb-2 ml-1";
const ERR_CLASS   = "mt-1.5 ml-1 text-[11px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1";
const getInputClass = (err) => `w-full px-4 py-3.5 text-[14px] font-medium rounded-xl transition-all duration-200 outline-none bg-white/60 dark:bg-stone-900/40 text-amber-950 dark:text-amber-50 placeholder-stone-400 dark:placeholder-stone-500 backdrop-blur-sm shadow-sm ${err ? "border border-red-500 focus:ring-4 focus:ring-red-500/20 bg-red-50/50 dark:bg-red-500/10 text-red-900 dark:text-red-100" : "border border-amber-900/20 dark:border-amber-100/10 focus:bg-white dark:focus:bg-[#1C1917] focus:border-amber-600 dark:focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 dark:focus:ring-amber-500/5"}`;

function KhoiDropdown({ value, onChange, error, disabled }) {
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

  const openList = useCallback(() => { measureTrigger(); setOpen(true); focusIdxRef.current = KHOI_OPTIONS.findIndex((k) => k === value); }, [measureTrigger, value]);
  const closeList = useCallback(() => { setOpen(false); focusIdxRef.current = -1; }, []);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => { if (rafRef.current) return; rafRef.current = requestAnimationFrame(() => { measureTrigger(); rafRef.current = null; }); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };
  }, [open, measureTrigger]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (!triggerRef.current?.contains(e.target) && !listRef.current?.contains(e.target)) closeList(); };
    document.addEventListener("mousedown", handler); return () => document.removeEventListener("mousedown", handler);
  }, [open, closeList]);

  const focusItem = useCallback((idx) => { const items = listRef.current?.querySelectorAll("[role=option]"); if (!items) return; const clamped = Math.max(0, Math.min(idx, items.length - 1)); focusIdxRef.current = clamped; items[clamped]?.focus(); }, []);
  const handleTriggerKey = (e) => {
    if (disabled) return;
    if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) { e.preventDefault(); if (!open) { openList(); setTimeout(() => focusItem(Math.max(0, focusIdxRef.current)), 20); } else if (e.key === "ArrowDown") focusItem(focusIdxRef.current + 1); else if (e.key === "ArrowUp") focusItem(focusIdxRef.current - 1); }
    if (e.key === "Escape") closeList();
  };
  const handleOptionKey = (e, idx) => {
    if (e.key === "ArrowDown") { e.preventDefault(); focusItem(idx + 1); }
    if (e.key === "ArrowUp") { e.preventDefault(); focusItem(idx - 1); }
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelect(KHOI_OPTIONS[idx]); }
    if (e.key === "Escape") { closeList(); triggerRef.current?.focus(); }
    if (e.key === "Tab") closeList();
  };
  const handleSelect = (k) => { onChange({ target: { value: k } }); closeList(); triggerRef.current?.focus(); };

  const portalStyle = rect ? { position: "fixed", width: rect.width, left: rect.left, ...(openUp ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }), zIndex: 9999, maxHeight: "240px" } : { display: "none" };

  return (
    <div>
      <label className={LABEL_CLASS}>Khối đăng ký</label>
      <div className="relative">
        <button ref={triggerRef} type="button" onClick={() => !disabled && (open ? closeList() : openList())} onKeyDown={handleTriggerKey} aria-haspopup="listbox" aria-expanded={open} disabled={disabled}
          className={`w-full flex items-center justify-between gap-2 text-left px-4 py-3.5 rounded-xl text-[14px] font-medium transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-sm backdrop-blur-sm
            ${error ? "border border-red-500 focus:ring-4 focus:ring-red-500/20 bg-red-50/50 dark:bg-red-500/10 text-red-900 dark:text-red-100" 
                    : open ? "bg-white dark:bg-[#1C1917] border border-amber-600 dark:border-amber-400 ring-4 ring-amber-500/10 dark:ring-amber-500/5 text-amber-950 dark:text-amber-50" 
                           : "bg-white/60 dark:bg-stone-900/40 border border-amber-900/20 dark:border-amber-100/10"}
          `}
        >
          <span className={value ? "text-amber-950 dark:text-amber-50 font-bold" : "text-stone-400 dark:text-stone-500"}>
            {value || "Chọn khối phù hợp với bé"}
          </span>
          <ChevronDown className={`w-4 h-4 flex-shrink-0 text-amber-800/50 dark:text-amber-400/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>

        {open && rect && createPortal(
          <AnimatePresence>
            <motion.ul ref={listRef} role="listbox" initial={{ opacity: 0, y: openUp ? 6 : -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: openUp ? 6 : -6, scale: 0.98 }} transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }} style={portalStyle}
              className="bg-[#FDFBF7]/95 dark:bg-[#1C1917]/95 backdrop-blur-xl border border-amber-900/10 dark:border-amber-100/10 rounded-xl shadow-2xl overflow-y-auto overscroll-contain p-1.5"
            >
              {KHOI_OPTIONS.map((k, i) => {
                const isSelected = k === value;
                return (
                  <li key={k} role="option" aria-selected={isSelected} tabIndex={0} onClick={() => handleSelect(k)} onKeyDown={(e) => handleOptionKey(e, i)}
                    className={`flex items-center justify-between px-3.5 py-3 my-0.5 rounded-lg text-[14px] cursor-pointer select-none outline-none transition-colors duration-100
                      ${isSelected ? "bg-amber-100/50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 font-bold" 
                                   : "text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 focus:bg-amber-50 dark:focus:bg-amber-900/20 font-medium"}
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

export default function TuyenSinh() {
  const isMobile = useIsMobile();
  const lenis = useLenis();
  const { showToast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (location.hash !== "#dang-ky") return;
    const el = document.getElementById("dang-ky");
    if (!el) return;
    const timeout = setTimeout(() => {
      const navbarHeight = document.querySelector("header")?.offsetHeight ?? 0;
      if (window.lenis) window.lenis.scrollTo(el, { duration: 1.2, offset: -navbarHeight });
      else el.scrollIntoView({ behavior: "smooth" });
    }, 300);
    return () => clearTimeout(timeout);
  }, [location.hash]);

  const year = new Date().getFullYear();
  const fadeUp = { hidden: { opacity: 0, y: isMobile ? 16 : 32 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } };
  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

  return (
    <div className="bg-[#FDFBF7] text-stone-800 dark:bg-[#1C1917] dark:text-stone-200 antialiased overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-950 transition-colors duration-500 relative">
      {/* <div className="absolute inset-0 bg-[linear-gradient(to_right,#92400E08_1px,transparent_1px),linear-gradient(to_bottom,#92400E08_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#FDE68A05_1px,transparent_1px),linear-gradient(to_bottom,#FDE68A05_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" /> */}
      <div className="fixed inset-0 w-full h-screen bg-[linear-gradient(to_right,#92400E08_1px,transparent_1px),linear-gradient(to_bottom,#92400E08_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#FDE68A05_1px,transparent_1px),linear-gradient(to_bottom,#FDE68A05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />


      {/* ══════ HERO ══════ */}
      <section className="relative pt-24 pb-20 sm:pt-36 sm:pb-32 overflow-hidden border-b border-amber-900/10 dark:border-amber-100/10">
        {!isMobile && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-amber-200/40 to-transparent dark:from-amber-900/20 rounded-[100%] blur-[120px] -z-10" />}

        <motion.div className="max-w-5xl mx-auto px-5 sm:px-6 text-center relative z-10">
          <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col items-center gap-6 sm:gap-8">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 dark:bg-stone-800/80 backdrop-blur-md border border-amber-200/60 dark:border-amber-800/50 shadow-sm cursor-default">
              <span className="relative flex h-2 w-2 flex-shrink-0 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="text-[11px] font-bold text-amber-900/80 dark:text-amber-100/80 tracking-widest uppercase">
                Tuyển sinh niên khóa {year} – {year + 1}
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl sm:text-6xl md:text-7xl font-serif font-semibold text-amber-950 dark:text-amber-50 tracking-tight leading-[1.08]">
              Hành trình<br />
              <span className="italic bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-600 bg-clip-text text-transparent">Đức Tin</span> & Tình Yêu
            </motion.h1>

            <motion.p variants={fadeUp} className="text-base sm:text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed font-medium">
              Nơi ươm mầm những tâm hồn trẻ thơ trong ánh sáng Tin Mừng, giúp các em trưởng thành về nhân bản và vững mạnh trong đời sống tâm linh.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-2">
              <button type="button" onClick={() => { const el = document.getElementById("dang-ky"); if (!el) return; const navbarHeight = document.querySelector("header")?.offsetHeight ?? 0; if (window.lenis) window.lenis.scrollTo(el, { duration: 1.2, offset: -navbarHeight }); else el.scrollIntoView({ behavior: "smooth" }); }}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-10 rounded-full text-[14.5px] font-bold bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-sm transition-all duration-300 md:hover:opacity-90 active:scale-[0.98]"
              >
                Đăng ký học ngay <ArrowRight className="w-4 h-4 opacity-80 md:group-hover:translate-x-1 transition-transform" />
              </button>
              <Link to="/tài-liệu"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full text-[14.5px] font-bold border border-amber-900/20 dark:border-amber-100/20 bg-white/60 dark:bg-stone-800/60 text-amber-950 dark:text-amber-50 backdrop-blur-md md:hover:bg-amber-50 dark:md:hover:bg-amber-900/20 shadow-sm transition-all duration-300 active:scale-[0.98]"
              >
                <GraduationCap className="w-4 h-4 opacity-80" /> Xem tài liệu ôn tập
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════ STATS ══════ */}
      <section className="py-8 sm:py-12 bg-[#FDFBF7]/80 dark:bg-[#1C1917]/80 backdrop-blur-xl border-b border-amber-900/10 dark:border-amber-100/10 relative z-10 sticky top-[60px] md:top-[64px]">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          {STATS.map((s) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <p className="text-3xl sm:text-4xl font-serif font-bold text-amber-950 dark:text-amber-50 mb-1.5 tabular-nums">
                <Counter target={s.target} suffix={s.suffix} />
              </p>
              <p className="text-[10px] font-bold text-amber-800/70 dark:text-amber-400/70 uppercase tracking-widest">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════ CHƯƠNG TRÌNH ══════ */}
      <section id="chuong-trinh" className="py-20 sm:py-28 max-w-5xl mx-auto px-5 sm:px-6">
        <motion.div initial={{ opacity: 0, y: isMobile ? 16 : 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: isMobile ? "-40px" : "-80px" }} transition={{ duration: 0.7 }} className="flex flex-col md:flex-row justify-between items-end mb-12 sm:mb-16 gap-6">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold tracking-widest uppercase mb-3 text-amber-700 dark:text-amber-500 ml-1">Chương trình đào tạo</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-amber-950 dark:text-amber-50 leading-tight">Nuôi dưỡng đức tin<br />từ những bước đầu</h2>
          </div>
          <p className="text-stone-600 dark:text-stone-400 max-w-sm text-sm leading-relaxed font-medium pb-2 border-l-[3px] border-amber-400/50 pl-4">Giáo trình chuẩn mực theo chỉ nam của Hội Đồng Giám Mục, kết hợp phương pháp sư phạm hiện đại.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {PROGRAMS.map((prog, i) => {
            const Icon = prog.icon;
            return (
              <motion.div key={prog.title} initial={{ opacity: 0, y: isMobile ? 16 : 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: isMobile ? "-40px" : "-80px" }} transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`group relative p-6 sm:p-8 rounded-3xl flex flex-col h-full overflow-hidden transition-all duration-300 backdrop-blur-sm
                  ${prog.featured ? "bg-amber-900 dark:bg-stone-800 text-amber-50 dark:text-stone-100 shadow-xl" : "bg-white/80 dark:bg-stone-800/40 text-stone-800 dark:text-stone-200 border border-amber-900/10 dark:border-amber-100/10 shadow-sm md:hover:shadow-md dark:shadow-none"}
                `}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${prog.featured ? "bg-amber-800 border-amber-700 text-amber-300 dark:bg-stone-700 dark:border-stone-600 dark:text-amber-400" : `${prog.iconBg} border-current opacity-80`}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif font-bold mb-3">{prog.title}</h3>
                <p className={`text-sm leading-relaxed mb-8 flex-1 font-medium ${prog.featured ? "text-amber-100/80 dark:text-stone-400" : "text-stone-500 dark:text-stone-400"}`}>{prog.desc}</p>
                <Link to={prog.path} className={`inline-flex items-center gap-1.5 text-sm font-bold transition-colors ${prog.featured ? "text-amber-300 hover:text-amber-200" : "text-amber-800 dark:text-amber-400 md:hover:text-amber-600"}`}>
                  Tìm hiểu thêm <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ══════ FAQ ══════ */}
      <section className="py-16 sm:py-24 max-w-3xl mx-auto px-5 sm:px-6 border-t border-amber-900/10 dark:border-amber-100/10">
        <motion.h2 initial={{ opacity: 0, y: isMobile ? 16 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-2xl sm:text-3xl font-serif font-bold text-center text-amber-950 dark:text-amber-50 mb-10">
          Thắc mắc thường gặp
        </motion.h2>
        <div className="space-y-3">
          {FAQS.map((item, i) => (
            <FaqItem key={i} item={item} index={i} lenis={lenis} />
          ))}
        </div>
      </section>

      {/* ══════ ĐĂNG KÝ (Form Style) ══════ */}
      <RegisterSection showToast={showToast} lenis={lenis} />
    </div>
  );
}

/* ─── RegisterSection ───────────────────────────────────────────── */
function RegisterSection({ showToast, lenis }) {
  const isMobile = useIsMobile();
  const INIT = { hoTen: "", namSinh: "", sdt: "", giaoXom: "", khoi: "", ghiChu: "" };
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.hoTen.trim()) e.hoTen = "Vui lòng nhập họ tên.";
    const year = parseInt(form.namSinh);
    const thisYear = new Date().getFullYear();
    if (!form.namSinh || isNaN(year) || year < 1990 || year > thisYear) e.namSinh = `Năm sinh không hợp lệ (1990–${thisYear}).`;
    if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(form.sdt.replace(/\s/g, ""))) e.sdt = "Số điện thoại không hợp lệ.";
    if (!form.giaoXom.trim()) e.giaoXom = "Vui lòng nhập giáo xóm.";
    if (!form.khoi) e.khoi = "Vui lòng chọn khối.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setLoading(true);

    const { error } = await supabase.rpc("submit_dang_ky_hoc", {
      p_ho_ten: form.hoTen.trim(), p_nam_sinh: parseInt(form.namSinh, 10), p_sdt: form.sdt.replace(/\s/g, ""), p_giao_xom: form.giaoXom.trim(), p_khoi_dang_ky: form.khoi, p_ghi_chu: form.ghiChu.trim() || null,
    });
    setLoading(false);

    if (error) { showToast("Có lỗi xảy ra, vui lòng thử lại.", "error", 5000); return; }
    setDone(true); showToast("Đăng ký thành công!", "success", 5000);
    setTimeout(() => lenis?.resize(), 50);
  };

  const handleReset = () => { setForm(INIT); setErrors({}); setDone(false); setTimeout(() => lenis?.resize(), 50); };

  return (
    <section id="dang-ky" className="py-20 sm:py-32 relative bg-amber-50/50 dark:bg-[#151312] border-t border-amber-900/10 dark:border-amber-100/5">
      <div className="max-w-2xl mx-auto px-5 sm:px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: isMobile ? 16 : 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: isMobile ? "-40px" : "-80px" }} transition={{ duration: 0.7 }} className="text-center mb-10 sm:mb-12">
          <div className="w-16 h-16 bg-amber-100/50 dark:bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-200/50 dark:border-amber-800/30 shadow-inner">
            <Heart className="w-7 h-7 text-amber-600 dark:text-amber-500" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-amber-950 dark:text-amber-50 mb-4">Đăng ký trực tuyến</h2>
          <p className="text-stone-600 dark:text-stone-400 font-medium leading-relaxed text-sm sm:text-base max-w-md mx-auto">Hãy để lại thông tin, chúng tôi sẽ liên hệ xếp lớp phù hợp nhất cho bé.</p>
        </motion.div>

        <div className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-10 shadow-xl dark:shadow-none border border-amber-900/10 dark:border-amber-100/10">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }} className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-6 border border-emerald-200/50 dark:border-emerald-500/30">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-amber-950 dark:text-amber-50 mb-3">Đăng ký thành công!</h3>
                <p className="text-stone-500 dark:text-stone-400 text-[14.5px] leading-relaxed mb-8 max-w-sm mx-auto font-medium">Cảm ơn bạn đã đăng ký. Chúng tôi sẽ liên hệ qua số điện thoại <span className="text-amber-900 dark:text-amber-300 font-bold">{form.sdt}</span> để xác nhận.</p>
                <button type="button" onClick={handleReset} className="px-6 py-3.5 rounded-xl text-[14px] font-bold bg-amber-100/50 dark:bg-stone-800 text-amber-900 dark:text-stone-200 hover:bg-amber-100 dark:hover:bg-stone-700 transition-colors">Đăng ký thêm bé khác</button>
              </motion.div>
            ) : (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div><label className={LABEL_CLASS}>Tên Thánh & Tên Gọi</label><input type="text" value={form.hoTen} onChange={set("hoTen")} placeholder="Maria Nguyễn Thị A" className={getInputClass(errors.hoTen)} disabled={loading} />{errors.hoTen && <p className={ERR_CLASS}>⚠ {errors.hoTen}</p>}</div>
                  <div><label className={LABEL_CLASS}>Năm sinh</label><input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4} value={form.namSinh} onChange={set("namSinh")} placeholder="2015" className={getInputClass(errors.namSinh)} disabled={loading} />{errors.namSinh && <p className={ERR_CLASS}>⚠ {errors.namSinh}</p>}</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div><label className={LABEL_CLASS}>SĐT Phụ huynh</label><input type="tel" inputMode="numeric" pattern="[0-9]*" value={form.sdt} onChange={set("sdt")} placeholder="0905..." className={getInputClass(errors.sdt)} disabled={loading} />{errors.sdt && <p className={ERR_CLASS}>⚠ {errors.sdt}</p>}</div>
                  <div><label className={LABEL_CLASS}>Giáo xóm</label><input type="text" value={form.giaoXom} onChange={set("giaoXom")} placeholder="Xóm 1, Xóm 2..." className={getInputClass(errors.giaoXom)} disabled={loading} />{errors.giaoXom && <p className={ERR_CLASS}>⚠ {errors.giaoXom}</p>}</div>
                </div>
                <KhoiDropdown value={form.khoi} onChange={set("khoi")} error={errors.khoi} disabled={loading} />
                <div>
                  <label className={LABEL_CLASS}>Ghi chú <span className="normal-case text-stone-400">(không bắt buộc)</span></label>
                  <textarea rows={3} value={form.ghiChu} onChange={set("ghiChu")} placeholder="Yêu cầu riêng..." className={`${getInputClass(false)} resize-none`} disabled={loading} />
                </div>
                <motion.button type="submit" disabled={loading} whileTap={!loading ? { scale: 0.98 } : {}} className="w-full h-14 flex items-center justify-center gap-2 font-bold text-[14.5px] bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white rounded-xl transition-all shadow-sm mt-2 disabled:opacity-70 disabled:cursor-not-allowed md:hover:opacity-90">
                  {loading ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg> Đang gửi hồ sơ...</> : "Gửi hồ sơ đăng ký"}
                </motion.button>
                <p className="text-center text-[11.5px] font-medium text-stone-500 dark:text-stone-400 mt-4">Thông tin được bảo mật tuyệt đối và chỉ dùng để xếp lớp.</p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}