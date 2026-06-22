import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Flame, ArrowRight, ChevronDown, GraduationCap, Heart, CheckCircle } from "lucide-react";
import { useToast } from "./ui/ToastContext.jsx";

/* ─── Design tokens (slate/gold — giữ nguyên palette bản gốc) ── */
const GOLD = "#D4AF37";

/* ─── Framer Motion variants ───────────────────────────────────── */
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

/* ─── Animated counter (số đếm khi scroll đến) ─────────────────── */
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

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

/* ─── Accordion FAQ ─────────────────────────────────────────────── */
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

function FaqItem({ item, index }) {
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
        onClick={() => setOpen((v) => !v)}
        className="w-full flex justify-between items-center p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-2xl"
      >
        <h3 className="font-semibold text-slate-900 pr-4 leading-snug">{item.q}</h3>
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
            <p className="px-6 pb-6 text-slate-500 text-sm leading-relaxed">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── 3 Chương trình (lấy từ Home) ─────────────────────────────── */
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
    featured: true, // dark card
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

/* ─── STATS ─────────────────────────────────────────────────────── */
const STATS = [
  { target: 500, suffix: "+", label: "Học viên" },
  { target: 45, suffix: "", label: "Giáo lý viên" },
  { target: 12, suffix: "", label: "Lớp học" },
  { target: 100, suffix: "%", label: "Yêu thương" },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function TuyenSinh() {
  /* Scroll-based header opacity */
  const { scrollY } = useScroll();
  const heroRef = useRef(null);
  // Fade bắt đầu từ 30% chiều cao hero, kết thúc ở 85% — mượt trên mọi màn hình
  const [heroHeight, setHeroHeight] = useState(700);
  useEffect(() => {
    if (heroRef.current) setHeroHeight(heroRef.current.offsetHeight);
  }, []);
  const heroOpacity = useTransform(scrollY, [heroHeight * 0.3, heroHeight * 0.85], [1, 0]);
  const heroY       = useTransform(scrollY, [0, heroHeight * 0.85], [0, -60]);
  const { showToast } = useToast();

  return (
    <div className="bg-[#F8FAFC] text-slate-800 antialiased overflow-x-hidden selection:bg-amber-300 selection:text-slate-900">
      {/* Noise overlay */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ══════ HERO ══════ */}
      <section ref={heroRef} className="relative pt-32 pb-32 lg:pt-48 lg:pb-40 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-tr from-amber-100/40 via-blue-50/40 to-transparent rounded-[100%] blur-[100px] -z-10" />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="max-w-5xl mx-auto px-6 text-center relative z-10"
        >
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-6"
          >
            {/* Pill badge */}
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

            {/* Heading */}
            <motion.h1
              variants={fadeUp}
              custom={0.1}
              className="text-5xl sm:text-7xl lg:text-8xl font-serif font-medium text-slate-900 tracking-tight leading-[1.08]"
            >
              Hành trình<br />
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-600 to-slate-900">
                Đức Tin
              </span>{" "}
              & Tình Yêu
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={fadeUp}
              custom={0.2}
              className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-light"
            >
              Nơi ươm mầm những tâm hồn trẻ thơ trong ánh sáng Tin Mừng, giúp các em trưởng thành
              về nhân bản và vững mạnh trong đời sống tâm linh.
            </motion.p>

            {/* CTA */}
            <motion.div
              variants={fadeUp}
              custom={0.3}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <a
                href="#dang-ky"
                className="group relative inline-flex items-center gap-2.5 px-8 py-4 text-sm font-bold text-white bg-slate-900 rounded-full overflow-hidden hover:scale-105 transition-transform duration-300 shadow-lg shadow-slate-900/20"
              >
                <span>Đăng ký học ngay</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </a>
              <Link
                to="/tài-liệu"
                className="inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <GraduationCap className="w-4 h-4 text-slate-400" />
                Xem tài liệu ôn tập
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════ STATS ══════ */}
      <section className="py-12 border-y border-slate-100 bg-white/60 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-4xl font-serif font-bold text-slate-900 mb-1 tabular-nums">
                <Counter target={s.target} suffix={s.suffix} />
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════ CHƯƠNG TRÌNH ══════ */}
      <section id="chuong-trinh" className="py-32 bg-slate-50/60">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
          >
            <div className="max-w-xl">
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: GOLD }}>
                Chương trình đào tạo
              </p>
              <h2 className="text-4xl md:text-5xl font-serif text-slate-900 leading-tight">
                Nuôi dưỡng đức tin<br />từ những bước đầu
              </h2>
            </div>
            <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
              Giáo trình chuẩn mực theo chỉ nam của Hội Đồng Giám Mục, kết hợp phương pháp
              sư phạm hiện đại và tinh thần truyền giáo.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    className="group relative p-8 rounded-3xl bg-slate-900 text-white shadow-xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[80px] transition-transform duration-500 group-hover:scale-150" />
                    <div className="relative z-10">
                      <div className="w-14 h-14 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
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
                  className="group relative p-8 rounded-3xl bg-white border border-slate-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 ${prog.bg} rounded-bl-[80px] -z-0 transition-transform duration-500 group-hover:scale-150`} />
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
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
      <section className="py-32 max-w-3xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl font-serif text-center text-slate-900 mb-12"
        >
          Thắc mắc thường gặp
        </motion.h2>
        <div className="space-y-3">
          {FAQS.map((item, i) => (
            <FaqItem key={i} item={item} index={i} />
          ))}
        </div>
      </section>

      {/* ══════ ĐĂNG KÝ ══════ */}
      <RegisterSection showToast={showToast} />
    </div>
  );
}

/* ─── RegisterSection tách riêng để quản lý state form độc lập ── */
const KHOI_OPTIONS = [
  "Chiên Con (Mầm non – Lớp 2)",
  "Rước Lễ Lần Đầu (Lớp 3 – 4)",
  "Thiếu Nhi (Lớp 5 – 7)",
  "Thiếu (Lớp 8 – 9)",
  "Nghĩa (Lớp 10 – 12)",
  "Thêm Sức",
];

const FIELD_CLASS = "w-full bg-slate-800/60 border rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none transition-all";
const fieldClass = (err) =>
  `${FIELD_CLASS} ${err ? "border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/60" : "border-slate-700 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/60"}`;

const LABEL_CLASS = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2";
const ERR_CLASS   = "mt-1.5 text-xs text-rose-400 flex items-center gap-1";

function RegisterSection({ showToast }) {
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
    // UI-only — chưa gọi API thật. Thay setTimeout bằng fetch khi có endpoint.
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setDone(true);
    showToast("✅ Đăng ký thành công! Chúng tôi sẽ liên hệ sớm.", "success", 5000);
  };

  const handleReset = () => { setForm(INIT); setErrors({}); setDone(false); };

  return (
    <section id="dang-ky" className="py-32 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}>
      {/* Grain — opacity thấp để chỉ tạo texture tinh tế, không áp đảo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, opacity: 0.035 }}
      />
      {/* Glow trung tâm — đủ mạnh để làm ấm nền tối */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-500/20 blur-[130px] rounded-full pointer-events-none" />
      {/* Accent glow góc trên trái — tạo chiều sâu */}
      <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-slate-700/40 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <Heart className="w-10 h-10 mx-auto mb-4" style={{ color: GOLD }} />
          <h2 className="text-4xl font-serif text-white mb-4">Đăng ký trực tuyến</h2>
          <p className="text-slate-400 font-light leading-relaxed">
            Hãy để lại thông tin, chúng tôi sẽ liên hệ xếp lớp phù hợp nhất cho bé.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {done ? (
            /* ── Success screen ── */
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
                className="px-6 py-3 rounded-full text-sm font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Đăng ký thêm học viên khác
              </button>
            </motion.div>
          ) : (
            /* ── Form ── */
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5"
            >
              {/* Row 1: Họ tên + Năm sinh */}
              <div className="grid grid-cols-2 gap-4">
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

              {/* Row 2: SDT + Giáo xóm */}
              <div className="grid grid-cols-2 gap-4">
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

              {/* Khối đăng ký */}
              <div>
                <label className={LABEL_CLASS}>Khối đăng ký</label>
                <div className="relative">
                  <select
                    value={form.khoi}
                    onChange={set("khoi")}
                    className={`${fieldClass(errors.khoi)} appearance-none pr-10 cursor-pointer`}
                    disabled={loading}
                  >
                    <option value="">-- Chọn khối phù hợp với bé --</option>
                    {KHOI_OPTIONS.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                </div>
                {errors.khoi && <p className={ERR_CLASS}>⚠ {errors.khoi}</p>}
              </div>

              {/* Ghi chú */}
              <div>
                <label className={LABEL_CLASS}>Ghi chú thêm <span className="normal-case text-slate-600">(không bắt buộc)</span></label>
                <textarea
                  rows={3}
                  placeholder="Bé có hoàn cảnh đặc biệt, yêu cầu riêng..."
                  className={`${FIELD_CLASS} border-slate-700 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/60 resize-none`}
                  disabled={loading}
                />
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="w-full flex items-center justify-center gap-2.5 font-bold text-sm uppercase tracking-wide py-4 rounded-xl transition-all duration-200 shadow-lg mt-1 disabled:opacity-70"
                style={{ background: loading ? "#b8940f" : GOLD, color: "#0F172A" }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
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