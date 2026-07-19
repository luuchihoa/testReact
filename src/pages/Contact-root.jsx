import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, ChevronRight, CheckCircle, Phone } from "lucide-react";
import { usePageMotion } from "../hooks/usePageMotion.js";
import { submitContactForm } from "../features/admin/dataLayer.js";

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

function ContactForm({ mc, vp, fadeUp }) {
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
    
    try {
      await submitContactForm(form.hoTen, form.sdt, form.noiDung);
      setDone(true);
    } catch (error) {
      console.error("Lỗi khi gửi liên hệ:", error);
      alert("Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const LABEL = "block text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 mb-1.5 ml-1";
  const fieldCls = (err) =>
    `w-full px-4 py-3 rounded-xl text-[14px] font-medium bg-white/60 dark:bg-stone-900/40 border backdrop-blur-sm ${
      err ? "border-red-500/50 dark:border-red-500/40 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 text-red-900 dark:text-red-100"
          : "border-amber-900/20 dark:border-amber-100/10 focus:border-amber-600 dark:focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 dark:focus:ring-amber-500/5 text-amber-950 dark:text-amber-50 placeholder:text-stone-400 dark:placeholder:text-stone-500"
    } outline-none transition-all duration-200`;
  const ERR = "mt-1.5 ml-1 text-[12px] font-medium text-red-600 dark:text-red-400 flex items-center gap-1";

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={vp}
    >
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-amber-800/70 dark:text-amber-400/70 mb-4 select-none">
        Gửi tin nhắn trực tuyến
      </h2>

      <div className="bg-white/80 dark:bg-stone-800/40 backdrop-blur-sm rounded-3xl border border-amber-900/10 dark:border-amber-100/10 p-5 sm:p-7 shadow-sm">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 14 }}
              className="py-8 flex flex-col items-center text-center gap-4"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-[16px] font-bold text-amber-950 dark:text-amber-50 font-serif">Đã gửi tin nhắn thành công</p>
                <p className="text-[13px] text-stone-600 dark:text-stone-400 max-w-xs leading-relaxed font-medium">
                  Cảm ơn bạn đã liên hệ. Ban Giáo Lý sẽ phản hồi qua số điện thoại{" "}
                  <span className="text-amber-900 dark:text-amber-200 font-bold">{form.sdt}</span> trong thời gian sớm nhất.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setForm(FORM_INIT); setDone(false); }}
                className="mt-3 text-[13px] font-bold text-amber-700 dark:text-amber-400 md:hover:opacity-80 transition-opacity active:scale-95 px-4 py-2 bg-amber-100/50 dark:bg-amber-900/30 rounded-xl"
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
                className="w-full mt-2 py-3.5 rounded-xl text-[14px] font-bold bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white md:hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
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

function FaqItem({ faq, index, isOpen, onToggle, fadeUp, vp }) {

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={vp}
      custom={index * 0.04}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{ touchAction: "manipulation" }}
        className={`w-full flex items-center justify-between gap-4 p-5 rounded-2xl text-left transition-all duration-300 border ${
          isOpen
            ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200/50 dark:border-amber-800/30 shadow-sm"
            : "bg-white/80 dark:bg-stone-800/40 border-amber-900/10 dark:border-amber-100/10 shadow-sm md:hover:border-amber-300 dark:md:hover:border-amber-700 backdrop-blur-sm"
        }`}
      >
        <span className="flex items-center gap-3.5 min-w-0">
          <span
            className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
              isOpen 
                ? "bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white" 
                : "bg-amber-100/50 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-900/5 dark:border-amber-100/5"
            }`}
            aria-hidden="true"
          >
            {index + 1}
          </span>
          <span className="text-[14.5px] font-bold text-amber-950 dark:text-amber-50 tracking-tight leading-snug">{faq.q}</span>
        </span>

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 18 }}
          className="flex-shrink-0 text-stone-400 dark:text-stone-500"
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
            <div className="px-5 pb-5 pt-3">
              <div className="border-l-[3px] border-amber-400/50 dark:border-amber-500/30 pl-4 ml-2.5 text-[13.5px] sm:text-[14px] text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
                {faq.a}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (d = 0) => ({
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 120, damping: 18, mass: 0.5, delay: d },
  }),
};

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 18, mass: 0.5 } },
};

export default function Contact() {
  const { mc, heroReveal, fadeUp, vp } = usePageMotion();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 dark:bg-[#1C1917] dark:text-stone-200 antialiased overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-950 transition-colors duration-500 relative">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#92400E08_1px,transparent_1px),linear-gradient(to_bottom,#92400E08_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#FDE68A05_1px,transparent_1px),linear-gradient(to_bottom,#FDE68A05_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* ══ HERO SECTION ══ */}
      <section className="relative overflow-hidden pt-12 pb-10 md:pt-24 md:pb-16 z-10">
        {!mc.isMobile && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-200/40 dark:bg-amber-900/20 blur-[100px] rounded-full -z-10 pointer-events-none" />
        )}
        <div className="max-w-4xl mx-auto px-5 sm:px-6">
          <div className="space-y-5 text-left">
            <motion.div variants={heroReveal} initial="hidden" animate="visible" custom={0}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100/50 text-amber-800 border border-amber-200/50 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50 select-none">
                Trung tâm hỗ trợ Ban Giáo Lý
              </span>
            </motion.div>

            <motion.h1
              variants={heroReveal} initial="hidden" animate="visible" custom={0.05}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-amber-950 dark:text-amber-50 leading-[1.1] font-serif"
            >
              Kênh kết nối &<br />
              <span className="bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-600 bg-clip-text text-transparent italic font-serif">
                Giải đáp thắc mắc
              </span>
            </motion.h1>

            <motion.p
              variants={heroReveal} initial="hidden" animate="visible" custom={0.1}
              className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed max-w-lg font-medium"
            >
              Mọi thắc mắc về quy trình đăng ký học, khung chương trình đào tạo hoặc đóng góp ý kiến xây dựng, xin vui lòng liên hệ với ban điều hành.
            </motion.p>

            <motion.div variants={heroReveal} initial="hidden" animate="visible" custom={0.15} className="flex flex-wrap gap-3 pt-1.5">
              <a
                href="tel:0905143643"
                style={{ touchAction: "manipulation" }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white text-[14px] font-bold md:hover:opacity-90 active:scale-[0.97] transition-all shadow-sm"
              >
                <Phone size={14} strokeWidth={2.5} aria-hidden="true" />
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
                  if (window.lenis) { window.lenis.scrollTo(el, { duration: 1.0, offset: -offset }); } 
                  else { const top = el.getBoundingClientRect().top + window.scrollY - offset; window.scrollTo({ top, behavior: "smooth" }); }
                }}
                style={{ touchAction: "manipulation" }}
                className="inline-flex items-center gap-1.5 px-6 py-3.5 rounded-full bg-white/60 dark:bg-stone-800/40 backdrop-blur-sm border border-amber-900/20 dark:border-amber-100/10 text-stone-700 dark:text-stone-300 text-[14px] font-bold hover:bg-white dark:hover:bg-stone-800 active:scale-[0.97] transition-all shadow-sm"
              >
                Gửi Form liên hệ
                <ChevronRight className="w-4 h-4 text-stone-400" aria-hidden="true" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ NỘI DUNG CHÍNH ══ */}
      <div className="max-w-4xl mx-auto px-5 sm:px-6 pb-20 space-y-12 relative z-10">

        {/* Kênh liên hệ chính */}
        <section>
          <motion.h2 variants={heroReveal} initial="hidden" animate="visible" custom={0.2}
            className="text-[11px] font-bold uppercase tracking-widest text-amber-800/70 dark:text-amber-400/70 mb-4 select-none ml-1"
          >
            Phương thức truyền thông trực tiếp
          </motion.h2>

          <motion.div className="grid gap-3" variants={listVariants} initial="hidden" animate="visible">
            {CONTACTS.map((c) => (
              <motion.a key={c.id} href={c.href} aria-label={`${c.label}: ${c.value}`} target={c.external ? "_blank" : undefined} rel={c.external ? "noreferrer noopener" : undefined}
                variants={itemVariants} whileTap={{ scale: 0.98 }} style={{ touchAction: "manipulation" }}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-white/80 dark:bg-stone-800/40 backdrop-blur-sm border border-amber-900/10 dark:border-amber-100/10 shadow-sm transition-colors text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-stone-800 text-amber-800 dark:text-amber-400 border border-amber-900/5 dark:border-amber-100/5 group-hover:bg-amber-100/50 dark:group-hover:bg-amber-500/20 transition-all duration-300">
                  {c.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-0.5">{c.label}</p>
                  <p className="text-[14px] font-bold text-amber-950 dark:text-amber-50 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors truncate">
                    {c.id === "phone" ? (<><span className="tabular-nums">{c.value}</span><span className="ml-1.5 text-xs font-medium text-stone-400 dark:text-stone-500">({c.note})</span></>) : (<><span className="hidden sm:inline">{c.value}</span><span className="sm:hidden">{c.valueMobile ?? c.value}</span></>)}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 dark:text-stone-600 group-hover:text-amber-600 dark:group-hover:text-amber-400 transform group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" aria-hidden="true" />
              </motion.a>
            ))}
          </motion.div>
        </section>

        {/* Địa điểm & Giờ tiếp nhận */}
        <div className="grid md:grid-cols-2 gap-4 items-start">
          <motion.div variants={heroReveal} initial="hidden" animate="visible" custom={0.25} className="bg-white/80 dark:bg-stone-800/40 backdrop-blur-sm rounded-3xl border border-amber-900/10 dark:border-amber-100/10 shadow-sm overflow-hidden text-left"
          >
            <a href="https://maps.app.goo.gl/FEtKEGn8V4wMXXKY6" target="_blank" rel="noreferrer noopener" aria-label="Xem bản đồ Giáo xứ An Ngãi trên Google Maps"
              className="block relative h-32 bg-stone-100 dark:bg-stone-900 overflow-hidden group border-b border-amber-900/10 dark:border-amber-100/10"
            >
              <iframe title="Bản đồ Giáo xứ An Ngãi" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.0!2d108.15!3d16.07!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zR2nDoW8geOG7qyBBbiBOZ8OjaQ!5e0!3m2!1svi!2s!4v1" className="w-full h-full border-0 pointer-events-none dark:opacity-70 dark:invert sepia-[20%] hue-rotate-15" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-[11px] font-bold text-amber-50 bg-amber-950/80 px-3 py-1.5 rounded-full backdrop-blur-md">Mở ứng dụng Bản đồ ↗</span>
              </div>
            </a>
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100/50 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center border border-amber-900/5 dark:border-amber-100/5">
                  <MapPin className="w-4.5 h-4.5" aria-hidden="true" />
                </div>
                <h3 className="text-[15px] font-bold text-amber-950 dark:text-amber-50 tracking-tight font-serif">Địa điểm văn phòng</h3>
              </div>
              <div className="grid grid-cols-1 gap-3 text-xs sm:text-sm font-medium">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-0.5">Giáo xứ quản hạt</p>
                  <p className="text-stone-800 dark:text-stone-200 font-bold">Giáo xứ An Ngãi</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-0.5">Địa chỉ hành chính</p>
                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed">Thôn An Ngãi Tây 2, Phường Hoà Khánh, Quận Liên Chiểu, Tp Đà Nẵng</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={heroReveal} initial="hidden" animate="visible" custom={0.3}
            className="bg-white/80 dark:bg-stone-800/40 backdrop-blur-sm rounded-3xl border border-amber-900/10 dark:border-amber-100/10 p-5 sm:p-6 shadow-sm text-left h-full flex flex-col"
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-amber-100/50 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center border border-amber-900/5 dark:border-amber-100/5">
                <Clock className="w-4.5 h-4.5" aria-hidden="true" />
              </div>
              <h3 className="text-[15px] font-bold text-amber-950 dark:text-amber-50 tracking-tight font-serif">Khung giờ sinh hoạt</h3>
            </div>
            <div className="space-y-2 flex-1">
              {HOURS.map((h) => (
                <div key={h.day} className={`flex items-center justify-between gap-3 p-3 rounded-xl transition-colors border ${h.active ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200/50 dark:border-amber-800/30" : "border-transparent"}`}>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2 truncate">
                      {h.day}
                      {h.active && <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-200/50 dark:text-amber-300 dark:bg-amber-500/20 px-1.5 py-0.5 rounded-full flex-shrink-0 select-none">Hiện tại</span>}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium truncate mt-0.5">{h.note}</p>
                  </div>
                  <span className="text-[13px] font-bold text-amber-700 dark:text-amber-400 tabular-nums flex-shrink-0">{h.time}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-stone-50/80 dark:bg-stone-900/50 border border-stone-200/40 dark:border-stone-800/60">
              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                <span className="font-bold text-stone-700 dark:text-stone-300">Lưu ý hành chính:</span> Nhằm chuẩn bị chu đáo, vui lòng liên hệ hẹn trước ít nhất 24h nếu cần làm việc ngoài giờ Thánh Lễ.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Khu vực xử lý form liên hệ nhắn tin */}
        <div id="form-lien-he" className="scroll-mt-6">
                <ContactForm mc={mc} vp={vp} fadeUp={fadeUp} />
        </div>

        {/* Cụm câu hỏi thường gặp FAQ */}
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-amber-800/70 dark:text-amber-400/70 mb-4 select-none ml-1">
            Giải đáp thắc mắc thường gặp
          </h2>
          <div className="grid gap-2">
            {FAQS.map((faq, i) => (
                      <FaqItem 
                        key={i} 
                        faq={faq} 
                        index={i} 
                        isOpen={openFaq === i} 
                        onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                        fadeUp={fadeUp}
                        vp={vp}
                      />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}