import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, ChevronRight, CheckCircle } from "lucide-react";
import { useMotionConfig } from "../hooks/useMotionConfig.js";

/* ── Dữ liệu ── */
const CONTACTS = [
  {
    id: "facebook",
    label: "Fanpage Facebook",
    value: "HTDC Xứ đoàn Mẹ Mân Côi – Giáo xứ An Ngãi",
    valueMobile: "HTDC Xứ đoàn Mẹ Mân Côi",
    href: "https://www.facebook.com/profile.php?id=61558564791118",
    external: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    id: "email",
    label: "Email liên hệ",
    value: "htdcanngai@gmail.com",
    valueMobile: "htdcanngai@gmail.com",
    href: "mailto:htdcanngai@gmail.com",
    external: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
  {
    id: "phone",
    label: "Điện thoại",
    value: "0905 143 643",
    note: "Trưởng Trang",
    href: "tel:0905143643",
    external: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
];

const TODAY = new Date().getDay();

const HOURS = [
  { day: "Thứ Bảy",    time: "08:00 – 11:30",   note: "Sinh hoạt nhóm",          active: TODAY === 6 },
  { day: "Chủ Nhật",   time: "07:00 – 09:30",   note: "Giáo lý & Thánh Lễ",     active: TODAY === 0 },
  { day: "Trong tuần", time: "Theo hẹn trước",  note: "Qua điện thoại / Email",  active: TODAY >= 1 && TODAY <= 5 },
];

const FAQS = [
  {
    q: "Con tôi muốn học giáo lý, liên hệ thế nào?",
    a: "Nhắn tin qua Fanpage Facebook hoặc gọi điện cho Trưởng Trang để được tư vấn và sắp xếp lớp phù hợp.",
  },
  {
    q: "Tôi muốn đóng góp ý kiến về chương trình học?",
    a: "Gửi email đến htdcanngai@gmail.com — Ban Giáo Lý đọc và phản hồi trong vòng 3 ngày làm việc.",
  },
  {
    q: "Làm sao để trở thành Giáo Lý Viên?",
    a: "Liên hệ qua điện thoại hoặc gặp trực tiếp vào Chủ Nhật sau Thánh Lễ. Ban Giáo Lý có chương trình đào tạo GLV hàng năm.",
  },
];

const FORM_INIT = { hoTen: "", sdt: "", noiDung: "" };

function ContactForm({ mc }) {
  const vp = mc.vp();
  const [form, setForm]       = useState(FORM_INIT);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.hoTen.trim()) e.hoTen = "Vui lòng nhập họ tên.";
    if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(form.sdt.replace(/\s/g, "")))
      e.sdt = "Số điện thoại không hợp lệ.";
    if (!form.noiDung.trim()) e.noiDung = "Vui lòng nhập nội dung.";
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
  };

  const LABEL = "block text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1.5";
  const fieldCls = (err) =>
    `w-full px-4 py-3 rounded-xl text-sm bg-stone-50/60 dark:bg-stone-950/40 border backdrop-blur-sm ${
      err ? "border-red-500/50 dark:border-red-500/40 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
          : "border-stone-200 dark:border-stone-800/80 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 dark:focus:ring-amber-500/5"
    } outline-none transition-all duration-200 text-stone-900 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-600 font-medium`;
  const ERR = "mt-1.5 text-xs font-medium text-red-500 dark:text-red-400 flex items-center gap-1";

  return (
    <motion.section
      initial={{ opacity: 0, y: mc.yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={vp}
      transition={{ type: "spring", stiffness: 90, damping: 15 }}
    >
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-4 select-none">
        Gửi tin nhắn trực tuyến
      </h2>

      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/60 dark:border-stone-800/80 p-5 sm:p-6 shadow-sm dark:shadow-none">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 14 }}
              className="py-6 flex flex-col items-center text-center gap-3.5"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-stone-900 dark:text-white">Đã gửi tin nhắn thành công</p>
                <p className="text-xs text-stone-400 dark:text-stone-500 max-w-xs leading-relaxed font-medium">
                  Cảm ơn bạn đã liên hệ. Ban Giáo Lý sẽ phản hồi qua số điện thoại{" "}
                  <span className="text-stone-800 dark:text-stone-200 font-bold">{form.sdt}</span> trong thời gian sớm nhất.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setForm(FORM_INIT); setDone(false); }}
                className="mt-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:opacity-80 transition-opacity active:scale-95"
              >
                Gửi thêm tin nhắn khác
              </button>
            </motion.div>
          ) : (
            <motion.form key="form"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onSubmit={handleSubmit} noValidate className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Họ và tên</label>
                  <input type="text" value={form.hoTen} onChange={set("hoTen")}
                    placeholder="Nguyễn Văn A" className={fieldCls(errors.hoTen)} disabled={loading} />
                  {errors.hoTen && <p className={ERR}><span>⚠</span> {errors.hoTen}</p>}
                </div>
                <div>
                  <label className={LABEL}>Số điện thoại</label>
                  <input type="tel" inputMode="numeric" value={form.sdt} onChange={set("sdt")}
                    placeholder="0905..." className={fieldCls(errors.sdt)} disabled={loading} />
                  {errors.sdt && <p className={ERR}><span>⚠</span> {errors.sdt}</p>}
                </div>
              </div>
              <div>
                <label className={LABEL}>Nội dung lời nhắn</label>
                <textarea rows={3} value={form.noiDung} onChange={set("noiDung")}
                  placeholder="Nhập nội dung câu hỏi hoặc góp ý của bạn tại đây..."
                  className={`${fieldCls(errors.noiDung)} resize-none`} disabled={loading} />
                {errors.noiDung && <p className={ERR}><span>⚠</span> {errors.noiDung}</p>}
              </div>
              <button
                type="submit" disabled={loading}
                style={{ touchAction: "manipulation" }}
                className="w-full py-3 rounded-xl text-sm font-bold bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Đang thiết lập kết nối…
                  </>
                ) : "Gửi thông tin"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

function FaqItem({ faq, index, mc, isOpen, onToggle }) {
  const vp = mc.vp();

  return (
    <motion.div
      initial={{ opacity: 0, y: mc.yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={vp}
      transition={{ type: "spring", stiffness: 100, damping: 15, delay: mc.delay(index * 0.04) }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{ touchAction: "manipulation" }}
        className={`w-full flex items-center justify-between gap-4 p-4.5 rounded-2xl text-left transition-all duration-300 border ${
          isOpen
            ? "bg-amber-500/5 border-amber-500/20 dark:bg-amber-500/10 dark:border-amber-500/20 shadow-none"
            : "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 shadow-sm dark:shadow-none hover:border-amber-500/30"
        }`}
      >
        <span className="flex items-center gap-3 min-w-0">
          <span
            className={`w-5.5 h-5.5 rounded-full text-[10px] font-black flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
              isOpen 
                ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950" 
                : "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
            }`}
            aria-hidden="true"
          >
            {index + 1}
          </span>
          <span className="text-sm font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-snug">{faq.q}</span>
        </span>

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 18 }}
          className="flex-shrink-0 text-stone-300 dark:text-stone-600"
          aria-hidden="true"
        >
          <ChevronRight className="w-4 h-4 rotate-90" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 18 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2">
              <div className="border-l-2 border-amber-500/40 dark:border-amber-500/30 pl-4 ml-2 text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                {faq.a}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Contact() {
  const systemConfig = useMotionConfig();
  
  // Tránh lỗi runtime, đồng bộ cấu hình animation chuyển động
  const mc = systemConfig || {
    yOffset: 25,
    duration: (d) => d || 0.6,
    delay: (d) => d || 0,
    stagger: 0.05,
    isMobile: false,
    vp: () => ({ once: true, margin: "-10% 0px" })
  };

  const vp = mc.vp();
  const [openFaq, setOpenFaq] = useState(null);

  const fadeUp = {
    hidden: { opacity: 0, y: mc.yOffset },
    visible: (d = 0) => ({
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 90, damping: 15, mass: 0.8, delay: mc.delay(d) },
    }),
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-stone-900 dark:bg-[#000000] dark:text-stone-50 antialiased overflow-x-hidden selection:bg-amber-500/20 dark:selection:bg-amber-500/30 transition-colors duration-500 relative">
      
      {/* Background lưới mờ tinh tế phân lớp không gian cao cấp */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* ══ HERO SECTION ══ */}
      <section className="relative overflow-hidden pt-12 pb-10 md:pt-24 md:pb-16 bg-gradient-to-b from-white via-[#f5f5f7] to-transparent dark:from-stone-900 dark:via-[#000000]">
        <div className="max-w-4xl mx-auto px-5 sm:px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: mc.stagger } } }}
            className="space-y-5"
          >
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 select-none">
                Trung tâm hỗ trợ Ban Giáo Lý
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp} custom={0.05}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-[1.1]"
            >
              Kênh kết nối &<br />
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent dark:from-amber-400 dark:via-orange-400 dark:to-amber-500">
                Giải đáp thắc mắc
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp} custom={0.1}
              className="text-sm sm:text-base text-stone-500 dark:text-stone-400 leading-relaxed max-w-lg font-normal"
            >
              Mọi thắc mắc về quy trình đăng ký học, khung chương trình đào tạo hoặc đóng góp ý kiến xây dựng, xin vui lòng liên hệ với ban điều hành.
            </motion.p>

            {/* Apple Actions Bar */}
            <motion.div variants={fadeUp} custom={0.15} className="flex flex-wrap gap-2.5 pt-1.5">
              <a
                href="tel:0905143643"
                style={{ touchAction: "manipulation" }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 text-xs font-bold hover:opacity-90 active:scale-[0.97] transition-all shadow-sm"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Gọi Tổng đài
              </a>
              <a
                href="#form-lien-he"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById("form-lien-he");
                  if (!el) return;
                  const navbar = document.querySelector("header");
                  const offset = navbar?.offsetHeight ?? 0;
                  if (window.lenis) {
                    window.lenis.scrollTo(el, { duration: 1.0, offset: -offset });
                  } else {
                    const top = el.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: "smooth" });
                  }
                }}
                style={{ touchAction: "manipulation" }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:border-amber-500/40 active:scale-[0.97] transition-all shadow-sm"
              >
                Gửi Form liên hệ
                <ChevronRight className="w-3.5 h-3.5 text-stone-400" aria-hidden="true" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══ NỘI DUNG CHÍNH (Bento Cards Layout) ══ */}
      <div className="max-w-4xl mx-auto px-5 sm:px-6 pb-20 space-y-12 relative z-10">

        {/* Kênh liên hệ chính */}
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-4 select-none">
            Phương thức truyền thông trực tiếp
          </h2>

          <div className="grid gap-3">
            {CONTACTS.map((c, i) => (
              <motion.a
                key={c.id}
                href={c.href}
                aria-label={`${c.label}: ${c.value}`}
                target={c.external ? "_blank" : undefined}
                rel={c.external ? "noreferrer noopener" : undefined}
                initial={{ opacity: 0, y: mc.yOffset }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={vp}
                transition={{ type: "spring", stiffness: 100, damping: 16, delay: mc.delay(i * 0.05) }}
                style={{ touchAction: "manipulation" }}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/80 shadow-sm dark:shadow-none active:scale-[0.995] transition-all text-left"
              >
                {/* Icon Wrapper */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200/40 dark:border-stone-700/50 group-hover:bg-amber-500/10 group-hover:text-amber-600 dark:group-hover:bg-amber-500/20 dark:group-hover:text-amber-400 group-hover:border-transparent transition-all duration-300">
                  {c.icon}
                </div>

                {/* Text Block */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-0.5">
                    {c.label}
                  </p>
                  <p className="text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                    {c.id === "phone" ? (
                      <>
                        <span className="tabular-nums">{c.value}</span>
                        <span className="ml-1.5 text-xs font-medium text-stone-400 dark:text-stone-500">({c.note})</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">{c.value}</span>
                        <span className="sm:hidden">{c.valueMobile ?? c.value}</span>
                      </>
                    )}
                  </p>
                </div>

                {/* Arrow indicator */}
                <ChevronRight
                  className="w-4 h-4 text-stone-300 dark:text-stone-700 group-hover:text-amber-500 dark:group-hover:text-amber-400 transform group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0"
                  aria-hidden="true"
                />
              </motion.a>
            ))}
          </div>
        </section>

        {/* Địa điểm & Giờ tiếp nhận (Grid Layout 2 Cột) */}
        <div className="grid md:grid-cols-2 gap-4 items-start">

          {/* Cột 1: Địa điểm & Bản đồ hình chữ nhật bo góc */}
          <motion.section
            initial={{ opacity: 0, y: mc.yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ type: "spring", stiffness: 90, damping: 15 }}
            className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/60 dark:border-stone-800/80 shadow-sm dark:shadow-none overflow-hidden text-left"
          >
            <a
              href="https://maps.app.goo.gl/FEtKEGn8V4wMXXKY6"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Xem bản đồ Giáo xứ An Ngãi trên Google Maps"
              className="block relative h-32 bg-stone-100 dark:bg-stone-950 overflow-hidden group border-b border-stone-100 dark:border-stone-800"
            >
              <iframe
                title="Bản đồ Giáo xứ An Ngãi"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.0!2d108.15!3d16.07!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zR2nDoW8geOG7qyBBbiBOZ8OjaQ!5e0!3m2!1svi!2s!4v1"
                className="w-full h-full border-0 pointer-events-none dark:opacity-70 dark:invert"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-[11px] font-bold text-white bg-stone-900/80 dark:bg-stone-100 dark:text-stone-950 px-3 py-1.5 rounded-full backdrop-blur-md">
                  Mở ứng dụng Bản đồ ↗
                </span>
              </div>
            </a>

            <div className="p-5 space-y-3.5">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-extrabold text-stone-900 dark:text-white tracking-tight">Địa điểm văn phòng</h3>
              </div>

              <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm font-medium">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-0.5">Giáo xứ quản hạt</p>
                  <p className="text-stone-900 dark:text-stone-200 font-bold">Giáo xứ An Ngãi</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-0.5">Địa chỉ hành chính</p>
                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                    Thôn An Ngãi Tây 2, Phường Hoà Khánh, Quận Liên Chiểu, Tp Đà Nẵng
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Cột 2: Thời gian làm việc điều hành */}
          <motion.section
            initial={{ opacity: 0, y: mc.yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ type: "spring", stiffness: 90, damping: 15, delay: mc.delay(0.06) }}
            className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/60 dark:border-stone-800/80 p-5 shadow-sm dark:shadow-none text-left"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-extrabold text-stone-900 dark:text-white tracking-tight">Khung giờ sinh hoạt</h3>
            </div>

            <div className="space-y-2">
              {HOURS.map((h) => (
                <div
                  key={h.day}
                  className={`flex items-center justify-between gap-3 p-2.5 rounded-xl transition-colors border ${
                    h.active 
                      ? "bg-amber-500/5 border-amber-500/20 dark:bg-amber-500/10 dark:border-amber-500/20" 
                      : "border-transparent"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-200 flex items-center gap-2 truncate">
                      {h.day}
                      {h.active && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-500/10 dark:text-amber-300 dark:bg-amber-500/20 px-1.5 py-0.5 rounded-full flex-shrink-0 select-none">
                          Hiện tại
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 font-medium truncate mt-0.5">{h.note}</p>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums flex-shrink-0">
                    {h.time}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/40 dark:border-stone-800/60">
              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                <span className="font-bold text-stone-700 dark:text-stone-300">Lưu ý hành chính:</span> Nhằm chuẩn bị chu đáo cho công tác tiếp đón, vui lòng liên hệ hẹn trước ít nhất 24 giờ qua Hotline nếu cần làm việc trực tiếp ngoài giờ Thánh Lễ.
              </p>
            </div>
          </motion.section>
        </div>

        {/* Khu vực xử lý form liên hệ nhắn tin */}
        <div id="form-lien-he" className="scroll-mt-6">
          <ContactForm mc={mc} />
        </div>

        {/* Cụm câu hỏi thường gặp FAQ */}
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-4 select-none">
            Giải đáp thắc mắc thường gặp
          </h2>

          <div className="grid gap-2">
            {FAQS.map((faq, i) => (
              <FaqItem
                key={faq.q}
                faq={faq}
                index={i}
                mc={mc}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}