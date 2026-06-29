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

// Thứ trong tuần: 0=CN, 6=T7
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

/* ── Form ── */
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

  const LABEL = "block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1.5";
  const fieldCls = (err) =>
    `w-full px-4 py-3 rounded-xl text-sm bg-stone-50 border ${
      err ? "border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400/40"
          : "border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-400/40"
    } outline-none transition-all duration-200 text-stone-800 placeholder:text-stone-300`;
  const ERR = "mt-1 text-xs text-red-500";

  return (
    <motion.section
      initial={{ opacity: 0, y: mc.yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={vp}
      transition={{ duration: mc.duration(0.6) }}
    >
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-4">
        Gửi tin nhắn
      </h2>

      <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="py-6 flex flex-col items-center text-center gap-3"
            >
              <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-amber-700" />
              </div>
              <p className="text-sm font-bold text-stone-900">Đã nhận tin nhắn!</p>
              <p className="text-xs text-stone-400 max-w-xs leading-relaxed">
                Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi qua số{" "}
                <span className="text-stone-700 font-semibold">{form.sdt}</span> sớm nhất có thể.
              </p>
              <button
                type="button"
                onClick={() => { setForm(FORM_INIT); setDone(false); }}
                className="mt-2 text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors"
              >
                Gửi tin nhắn khác
              </button>
            </motion.div>
          ) : (
            <motion.form key="form"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onSubmit={handleSubmit} noValidate className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Họ tên</label>
                  <input type="text" value={form.hoTen} onChange={set("hoTen")}
                    placeholder="Nguyễn Văn A" className={fieldCls(errors.hoTen)} disabled={loading} />
                  {errors.hoTen && <p className={ERR}>⚠ {errors.hoTen}</p>}
                </div>
                <div>
                  <label className={LABEL}>Số điện thoại</label>
                  <input type="tel" inputMode="numeric" value={form.sdt} onChange={set("sdt")}
                    placeholder="090..." className={fieldCls(errors.sdt)} disabled={loading} />
                  {errors.sdt && <p className={ERR}>⚠ {errors.sdt}</p>}
                </div>
              </div>
              <div>
                <label className={LABEL}>Nội dung</label>
                <textarea rows={3} value={form.noiDung} onChange={set("noiDung")}
                  placeholder="Tôi muốn hỏi về..."
                  className={`${fieldCls(errors.noiDung)} resize-none`} disabled={loading} />
                {errors.noiDung && <p className={ERR}>⚠ {errors.noiDung}</p>}
              </div>
              <button
                type="submit" disabled={loading}
                style={{ touchAction: "manipulation" }}
                className="w-full py-3 rounded-xl text-sm font-bold bg-amber-800 text-white hover:bg-amber-900 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Đang gửi…
                  </>
                ) : "Gửi tin nhắn"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

/* ── FAQ Accordion Item ── */
function FaqItem({ faq, index, mc, isOpen, onToggle }) {
  const vp = mc.vp();

  return (
    <motion.div
      key={faq.q}
      initial={{ opacity: 0, y: mc.yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={vp}
      transition={{ duration: mc.duration(0.5), delay: mc.delay(index * 0.06) }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{ touchAction: "manipulation" }}
        className={`w-full flex items-center justify-between gap-4 p-5 rounded-2xl text-left transition-all duration-300 border ${
          isOpen
            ? "bg-amber-50 border-amber-200/80 shadow-[0_2px_12px_rgba(180,120,0,0.08)]"
            : "bg-white border-stone-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-amber-200/60 hover:bg-amber-50/40"
        }`}
      >
        <span className="flex items-center gap-3 min-w-0">
          <span
            className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
              isOpen ? "bg-amber-800 text-white" : "bg-amber-100 text-amber-800"
            }`}
            aria-hidden="true"
          >
            {index + 1}
          </span>
          <span className="text-sm font-bold text-stone-900 leading-snug">{faq.q}</span>
        </span>

        {/* Chevron xoay */}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex-shrink-0"
          aria-hidden="true"
        >
          <ChevronRight
            className={`w-4 h-4 rotate-90 transition-colors duration-300 ${
              isOpen ? "text-amber-700" : "text-stone-300"
            }`}
          />
        </motion.span>
      </button>

      {/* Answer — AnimatePresence để mount/unmount mượt */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2">
              <div className="border-l-2 border-amber-200 pl-4 ml-1 text-sm text-stone-500 leading-relaxed">
                {faq.a}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════ */
export default function Contact() {
  const mc = useMotionConfig();
  const vp = mc.vp();
  const [openFaq, setOpenFaq] = useState(null);

  const fadeUp = {
    hidden: { opacity: 0, y: mc.yOffset },
    visible: (d = 0) => ({
      opacity: 1, y: 0,
      transition: { duration: mc.duration(0.7), ease: [0.16, 1, 0.3, 1], delay: mc.delay(d) },
    }),
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 antialiased overflow-x-hidden selection:bg-amber-200 selection:text-amber-900">

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden pt-16 pb-14 md:pt-24 md:pb-20">
        {!mc.isMobile && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber-200/15 blur-[120px] rounded-full -z-10" />
        )}

        <div className="max-w-4xl mx-auto px-5 sm:px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: mc.stagger } } }}
          >
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-5 bg-amber-100 text-amber-800">
                Ban Giáo Lý An Ngãi
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp} custom={0.05}
              className="text-4xl md:text-5xl font-serif font-black tracking-tight text-stone-900 leading-[1.1] mb-4"
            >
              Liên hệ với<br />
              <span className="bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">
                Ban Giáo Lý
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp} custom={0.1}
              className="text-base md:text-lg text-stone-500 leading-relaxed max-w-lg mb-8"
            >
              Mọi thắc mắc về đăng ký, chương trình học hoặc đóng góp ý kiến —
              chúng tôi luôn sẵn lòng lắng nghe và phản hồi sớm nhất có thể.
            </motion.p>

            {/* CTA */}
            <motion.div variants={fadeUp} custom={0.15} className="flex flex-wrap gap-3">
              <a
                href="tel:0905143643"
                style={{ touchAction: "manipulation" }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-800 text-white text-sm font-bold hover:bg-amber-900 active:scale-[0.98] transition-all duration-200"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Gọi ngay
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
                    window.lenis.scrollTo(el, { duration: 1.2, offset: -offset });
                  } else {
                    const top = el.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: "smooth" });
                  }
                }}
                style={{ touchAction: "manipulation" }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-stone-200 text-stone-700 text-sm font-semibold hover:border-amber-400/60 hover:bg-amber-50 active:scale-[0.98] transition-all duration-200"
              >
                Gửi tin nhắn
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══ NỘI DUNG CHÍNH ══ */}
      <div className="max-w-4xl mx-auto px-5 sm:px-6 pb-20 space-y-12">

        {/* Kênh liên hệ */}
        <motion.section
          initial={{ opacity: 0, y: mc.yOffset }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: mc.duration(0.6) }}
        >
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-4">
            Kênh liên hệ
          </h2>

          <div className="flex flex-col gap-3">
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
                transition={{ duration: mc.duration(0.5), delay: mc.delay(i * 0.08) }}
                whileHover={mc.isMobile ? undefined : { y: -3, transition: { duration: 0.18 } }}
                style={{ touchAction: "manipulation" }}
                className="group flex items-center gap-4 p-5 rounded-2xl bg-white border border-stone-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-amber-400/60 transition-all duration-300 ease-out cursor-pointer select-none active:scale-[0.98]"
              >
                {/* Icon */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-100/70 group-hover:bg-amber-800 group-hover:text-white group-hover:border-amber-800 transition-all duration-300">
                  {c.icon}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-0.5">
                    {c.label}
                  </p>
                  <p className="text-sm font-semibold text-stone-800 group-hover:text-amber-800 transition-colors duration-300">
                    {c.id === "phone" ? (
                      <>
                        {c.value}
                        <span className="ml-1.5 text-xs font-normal text-stone-400">({c.note})</span>
                      </>
                    ) : c.id === "email" ? (
                      /* break-all trên mobile để email không bị cắt */
                      <span className="break-all sm:break-normal">
                        <span className="hidden sm:inline">{c.value}</span>
                        <span className="sm:hidden">{c.valueMobile ?? c.value}</span>
                      </span>
                    ) : (
                      <>
                        <span className="hidden sm:inline">{c.value}</span>
                        <span className="sm:hidden">{c.valueMobile ?? c.value}</span>
                      </>
                    )}
                  </p>
                </div>

                {/* Arrow */}
                <ChevronRight
                  className="w-4 h-4 text-stone-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0"
                  aria-hidden="true"
                />
              </motion.a>
            ))}
          </div>
        </motion.section>

        {/* Địa điểm + Giờ tiếp nhận */}
        <div className="grid md:grid-cols-2 gap-5 items-start">

          {/* Địa điểm */}
          <motion.section
            initial={{ opacity: 0, y: mc.yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: mc.duration(0.6) }}
            className="bg-white rounded-2xl border border-stone-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden"
          >
            {/* Map embed thumbnail */}
            <a
              href="https://maps.app.goo.gl/FEtKEGn8V4wMXXKY6"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Xem bản đồ Giáo xứ An Ngãi trên Google Maps"
              className="block relative h-36 bg-stone-100 overflow-hidden group"
            >
              <iframe
                title="Bản đồ Giáo xứ An Ngãi"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.0!2d108.15!3d16.07!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zR2nDoW8geOG7qyBBbiBOZ8OjaQ!5e0!3m2!1svi!2s!4v1"
                className="w-full h-full border-0 pointer-events-none"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs font-bold text-white bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  Mở Google Maps ↗
                </span>
              </div>
            </a>

            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-amber-800" aria-hidden="true" />
                </div>
                <h2 className="text-sm font-bold text-stone-900">Địa điểm</h2>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">Giáo xứ</p>
                <p className="text-sm font-semibold text-stone-800">Giáo xứ An Ngãi</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">Địa chỉ</p>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Thôn An Ngãi Tây 2,<br />Phường Hoà Khánh, Tp Đà Nẵng
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">Nhà giáo lý</p>
                <p className="text-sm text-stone-600">Khuôn viên Giáo xứ An Ngãi</p>
              </div>
            </div>
          </motion.section>

          {/* Giờ tiếp nhận */}
          <motion.section
            initial={{ opacity: 0, y: mc.yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: mc.duration(0.6), delay: mc.delay(0.08) }}
            className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-800" aria-hidden="true" />
              </div>
              <h2 className="text-sm font-bold text-stone-900">Giờ tiếp nhận</h2>
            </div>

            <div className="space-y-3">
              {HOURS.map((h) => (
                <div
                  key={h.day}
                  className={`flex items-start justify-between gap-3 p-3 rounded-xl transition-colors ${
                    h.active ? "bg-amber-50 border border-amber-100" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-stone-800 flex items-center gap-2">
                      {h.day}
                      {h.active && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                          Hôm nay
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">{h.note}</p>
                  </div>
                  <span className="text-sm font-bold text-amber-700 tabular-nums flex-shrink-0">
                    {h.time}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 p-3.5 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-xs text-amber-800 leading-relaxed">
                <span className="font-bold">Lưu ý:</span> Đối với các việc quan trọng
                (đăng ký, tư vấn lớp), vui lòng liên hệ trước để được sắp xếp thời gian phù hợp.
              </p>
            </div>
          </motion.section>
        </div>

        {/* Form liên hệ */}
        <div id="form-lien-he" className="scroll-mt-20 md:scroll-mt-16">
          <ContactForm mc={mc} />
        </div>

        {/* Câu hỏi thường gặp */}
        <motion.section
          initial={{ opacity: 0, y: mc.yOffset }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: mc.duration(0.6) }}
        >
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-4">
            Câu hỏi thường gặp
          </h2>

          <div className="flex flex-col gap-2">
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
        </motion.section>
      </div>
    </div>
  );
}