import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowUpRight, ArrowRight, Phone, Mail, MapPin, Clock, Copy, Check,
  MessageCircle, Send, CheckCircle2, Loader2, ChevronDown, Sparkles,
  GraduationCap
} from "lucide-react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { submitContactForm } from "../features/admin/dataLayer.js";
import { CONTACT_TOPICS, CONTACT_LIMITS, validateContact, buildContactPayload } from "../features/contact/contactForm.js";
import "./Contact.css";

const PHONE = "0905 143 643";
const EMAIL = "htdcanngai@gmail.com";
const ADDRESS = "Thôn An Ngãi Tây 2, Phường Hoà Khánh, Tp Đà Nẵng";
const MAP_URL = "https://maps.app.goo.gl/FEtKEGn8V4wMXXKY6";
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61558564791118";
const EMPTY_FORM = { hoTen: "", sdt: "", chuDe: "", noiDung: "" };
const DRAFT_KEY = "gl_anngai_contact_draft";

const SUGGESTIONS = [
  { label: "Tuyển sinh Khai Tâm", topic: "Tuyển sinh", text: "Con tôi 6 tuổi muốn đăng ký học lớp Khai Tâm (Chiên Con), xin Ban Giáo lý hướng dẫn thủ tục nhập học." },
  { label: "Lịch học Chiên Con", topic: "Lịch học", text: "Xin cho tôi biết cụ thể lịch học và phòng học của khối Chiên Con vào Chúa Nhật." },
  { label: "Tham gia Giáo lý viên", topic: "Tham gia giáo lý viên", text: "Tôi muốn tìm hiểu và đăng ký tham gia làm Giáo lý viên / Huynh trưởng đồng hành cùng Xứ đoàn." },
  { label: "Xin giấy chuyển xứ", topic: "Khác", text: "Tôi cần xin giấy chứng nhận / chuyển xứ cho con em học giáo lý, xin hướng dẫn thủ tục." },
];

const HOURS = [
  { day: "Thứ Bảy", time: "17:30 – 20:30", note: "Thánh lễ chiều & Họp Huynh trưởng", days: [6] },
  { day: "Chúa Nhật", time: "07:00 – 09:30", note: "Thánh lễ & Giờ học Giáo lý", days: [0] },
  { day: "Trong tuần", time: "Theo hẹn trước", note: "Liên hệ qua điện thoại hoặc email", days: [1, 2, 3, 4, 5] },
];
const FAQS = [
  { cat: "Tuyển sinh", q: "Con tôi muốn học giáo lý, bắt đầu từ đâu?", a: "Phụ huynh có thể xem thông tin tuyển sinh hoặc gửi lời nhắn với chủ đề “Tuyển sinh”. Ban Giáo lý sẽ hướng dẫn lựa chọn lớp phù hợp.", to: "/tuyển-sinh", label: "Tìm hiểu tuyển sinh" },
  { cat: "Lịch học", q: "Tôi có thể xem lịch học của các em ở đâu?", a: "Lịch học có trên website. Nếu cần hỏi thêm về lớp hoặc lịch sinh hoạt, bạn có thể chọn chủ đề “Lịch học” trong biểu mẫu.", to: "/lịch-học", label: "Xem lịch học" },
  { cat: "Ơn gọi GLV", q: "Làm sao để tham gia làm giáo lý viên?", a: "Chọn chủ đề “Tham gia giáo lý viên” và để lại số điện thoại cùng lời giới thiệu ngắn. Bạn cũng có thể liên hệ trực tiếp với Trưởng ban Giáo lý để trao đổi." },
  { cat: "Hẹn gặp", q: "Tôi có thể liên hệ ngoài giờ sinh hoạt không?", a: "Bạn có thể để lại lời nhắn hoặc nhắn qua Fanpage bất cứ lúc nào. Nếu muốn gặp trực tiếp ngoài giờ sinh hoạt, vui lòng liên hệ hẹn trước ít nhất 24 giờ." },
  { cat: "Phản hồi", q: "Sau khi gửi lời nhắn, tôi sẽ nhận phản hồi thế nào?", a: "Ban Giáo lý sẽ liên hệ qua số điện thoại bạn cung cấp khi tiếp nhận và xử lý lời nhắn. Nếu cần trao đổi sớm, bạn có thể gọi điện hoặc nhắn qua Fanpage." },
];

function CopyButton({ value, label }) {
  const [status, setStatus] = useState("");
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("Đã sao chép");
    } catch {
      setStatus("Chưa sao chép được. Bạn có thể chọn và sao chép nội dung.");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(""), 4000);
  }
  return (
    <span className="contact-copy-wrap">
      <button type="button" className="contact-copy" onClick={copy} aria-label={`Sao chép ${label}`}>
        {status === "Đã sao chép" ? <Check size={17} /> : <Copy size={17} />}
      </button>
      <AnimatePresence>
        {status && (
          <Motion.span
            role="status"
            className="contact-copy-status"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {status}
          </Motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function ContactForm() {
  const prefersReduced = useReducedMotion();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return {
            hoTen: typeof parsed.hoTen === "string" ? parsed.hoTen : "",
            sdt: typeof parsed.sdt === "string" ? parsed.sdt : "",
            chuDe: typeof parsed.chuDe === "string" ? parsed.chuDe : "",
            noiDung: typeof parsed.noiDung === "string" ? parsed.noiDung : "",
          };
        }
      }
    } catch {
      // Bỏ qua lỗi truy cập storage (private mode / cookies blocked)
    }
    const paramTopic = searchParams.get("chuDe");
    const validTopic = CONTACT_TOPICS.find((t) => t.toLowerCase() === (paramTopic || "").toLowerCase()) || "";
    return { ...EMPTY_FORM, chuDe: validTopic };
  });

  const [hasRestoredDraft, setHasRestoredDraft] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Boolean(parsed?.hoTen || parsed?.sdt || parsed?.chuDe || parsed?.noiDung);
      }
    } catch {
      return false;
    }
    return false;
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [failure, setFailure] = useState("");
  const sending = useRef(false);
  const resultRef = useRef(null);
  const errorRef = useRef(null);

  // Tự động lưu nháp vào localStorage chống mất dữ liệu khi mạng yếu / reload
  useEffect(() => {
    if (done) return;
    const hasContent = Boolean(form.hoTen || form.sdt || form.chuDe || form.noiDung);
    if (hasContent) {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      } catch (err) {
        void err;
      }
    }
  }, [form, done]);

  useEffect(() => { if (done) resultRef.current?.focus(); }, [done]);
  useEffect(() => { if (failure) errorRef.current?.focus(); }, [failure]);

  function change(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  }

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (err) {
      void err;
    }
    setForm(EMPTY_FORM);
    setErrors({});
    setHasRestoredDraft(false);
  }

  async function handleSubmit(event) {
    if (event?.preventDefault) event.preventDefault();
    if (sending.current) return;
    const nextErrors = validateContact(form);
    setErrors(nextErrors);
    setFailure("");
    if (Object.keys(nextErrors).length) {
      document.getElementById(`contact-${Object.keys(nextErrors)[0]}`)?.focus();
      return;
    }
    sending.current = true;
    setLoading(true);
    try {
      const payload = buildContactPayload(form);
      await submitContactForm(payload.hoTen, payload.sdt, payload.noiDung);
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch (err) {
        void err;
      }
      setHasRestoredDraft(false);
      setDone(true);
    } catch {
      setFailure("Chưa thể xác nhận lời nhắn đã được gửi. Nội dung của bạn vẫn được giữ lại an toàn; bạn có thể thử gửi lại hoặc liên hệ qua điện thoại, Fanpage.");
    } finally {
      sending.current = false;
      setLoading(false);
    }
  }

  function attributes(name) {
    return {
      id: `contact-${name}`, name, value: form[name], onChange: change,
      disabled: loading, required: true,
      "aria-invalid": Boolean(errors[name]),
      "aria-describedby": [errors[name] ? `contact-${name}-error` : "", name === "sdt" ? "contact-phone-hint" : "", name === "hoTen" ? "contact-name-hint" : ""].filter(Boolean).join(" ") || undefined,
    };
  }
  function fieldError(name) {
    return errors[name] && <p id={`contact-${name}-error`} className="contact-field-error">{errors[name]}</p>;
  }

  return (
    <section className="contact-form-panel" id="form-lien-he" aria-labelledby="contact-form-title">
      <p className="contact-eyebrow">CHÚNG TÔI SẴN LÒNG LẮNG NGHE</p>
      <h2 id="contact-form-title">Gửi một <em>lời nhắn.</em></h2>
      <AnimatePresence mode="wait">
        {done ? (
          <Motion.div
            key="success"
            className="contact-success"
            ref={resultRef}
            tabIndex={-1}
            role="status"
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <CheckCircle2 size={46} />
            <h3>Đã nhận lời nhắn của bạn</h3>
            <p>Cảm ơn bạn đã liên hệ. Ban Giáo lý sẽ phản hồi qua số <strong>{buildContactPayload(form).sdt}</strong> khi tiếp nhận và xử lý lời nhắn.</p>
            <button className="contact-button contact-primary" type="button" onClick={() => {
              setForm(EMPTY_FORM); setErrors({}); setDone(false);
              requestAnimationFrame(() => document.getElementById("contact-hoTen")?.focus());
            }}>Gửi lời nhắn khác <ArrowRight size={17} /></button>
          </Motion.div>
        ) : (
          <Motion.div
            key="form"
            className="contact-form-inner"
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <p className="contact-form-intro">Để lại thông tin để Ban Giáo lý có thể liên hệ với bạn. Tất cả các trường bên dưới đều cần điền.</p>

            {hasRestoredDraft && (form.hoTen || form.sdt || form.chuDe || form.noiDung) && (
              <div className="contact-draft-banner" role="status">
                <span>Đã khôi phục lời nhắn lưu nháp của bạn.</span>
                <button type="button" className="contact-draft-clear" onClick={clearDraft}>
                  Xóa nháp & làm mới
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate aria-busy={loading}>
              <div className="contact-form-row">
                <div><label htmlFor="contact-hoTen">Họ và tên</label><input {...attributes("hoTen")} type="text" autoComplete="name" maxLength={CONTACT_LIMITS.name} placeholder="Tên của bạn" /><p id="contact-name-hint" className="contact-field-hint">Họ tên của bạn hoặc phụ huynh.</p>{fieldError("hoTen")}</div>
                <div><label htmlFor="contact-sdt">Số điện thoại</label><input {...attributes("sdt")} type="tel" inputMode="tel" autoComplete="tel" maxLength={24} placeholder="VD: 0905 123 456" /><p id="contact-phone-hint" className="contact-field-hint">Số để Ban Giáo lý liên hệ lại với bạn.</p>{fieldError("sdt")}</div>
              </div>
              <div><label htmlFor="contact-chuDe">Bạn cần hỗ trợ về?</label><select {...attributes("chuDe")}><option value="" disabled>Chọn một chủ đề</option>{CONTACT_TOPICS.map((topic) => <option key={topic}>{topic}</option>)}</select>{fieldError("chuDe")}</div>
              <div>
                <div className="contact-field-header">
                  <label htmlFor="contact-noiDung">Lời nhắn của bạn</label>
                  <div className="contact-suggestions-wrap">
                    <span className="contact-suggestions-label"><Sparkles size={13} /> Gợi ý nhanh 1-chạm:</span>
                    <div className="contact-suggestions-list" role="group" aria-label="Gợi ý nội dung lời nhắn nhanh">
                      {SUGGESTIONS.map((item) => {
                        const isSelected = form.chuDe === item.topic && form.noiDung.includes(item.text);
                        return (
                          <button
                            key={item.label}
                            type="button"
                            className={`contact-suggestion-chip ${isSelected ? "contact-suggestion-chip-active" : ""}`}
                            aria-pressed={isSelected}
                            onClick={() => {
                              setForm((prev) => {
                                const current = prev.noiDung.trim();
                                const isTemplate = SUGGESTIONS.some((s) => s.text === current);
                                const nextMessage = !current || isTemplate ? item.text : `${current}\n\n${item.text}`;
                                return { ...prev, noiDung: nextMessage, chuDe: item.topic };
                              });
                              setErrors((prev) => ({ ...prev, noiDung: undefined, chuDe: undefined }));
                              requestAnimationFrame(() => document.getElementById("contact-noiDung")?.focus());
                            }}
                          >
                            {isSelected ? <Check size={13} aria-hidden="true" /> : <span aria-hidden="true">+</span>}{" "}
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <textarea {...attributes("noiDung")} rows={5} maxLength={CONTACT_LIMITS.message} placeholder="Bạn muốn trao đổi điều gì với Ban Giáo lý?" />
                {fieldError("noiDung")}
                <span className="contact-counter">{form.noiDung.length.toLocaleString("vi-VN")} / 2.000 ký tự</span>
              </div>
              <AnimatePresence>
                {failure && (
                  <Motion.div
                    className="contact-submit-error"
                    role="alert"
                    tabIndex={-1}
                    ref={errorRef}
                    initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p>{failure}</p>
                    <div className="contact-submit-error-actions">
                      <button type="button" className="contact-retry-btn" onClick={handleSubmit} disabled={loading}>
                        Thử lại ngay
                      </button>
                      <a href="tel:0905143643">Gọi {PHONE}</a>
                      <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer">Mở Fanpage ↗</a>
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>
              <p className="contact-privacy">Thông tin bạn cung cấp được dùng để tiếp nhận và phản hồi lời nhắn. <Link to="/bảo-mật">Xem chính sách bảo mật.</Link></p>
              <button type="submit" className="contact-button contact-primary contact-submit" disabled={loading}>{loading ? <><Loader2 className="contact-spinner" size={18} />Đang gửi lời nhắn…</> : <>Gửi lời nhắn <Send size={17} /></>}</button>
            </form>
          </Motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default function Contact() {
  const prefersReduced = useReducedMotion();
  const [today, setToday] = useState(() => vietnamDay());
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setToday(vietnamDay()), 60000);
    const previous = document.title;
    document.title = "Liên hệ Ban Giáo lý | Xứ đoàn Mẹ Mân Côi";
    return () => { clearInterval(timer); document.title = previous; };
  }, []);

  // Motion variants according to AGENTS.md §8:
  // Hero: Fade và dịch dọc 12–16px, 350–450ms, stagger 60ms
  const heroContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReduced ? 0 : 0.06,
        delayChildren: prefersReduced ? 0 : 0.05,
      },
    },
  };

  const heroItem = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReduced ? 0.15 : 0.38, ease: "easeOut" },
    },
  };

  const sectionReveal = {
    initial: { opacity: 0, y: prefersReduced ? 0 : 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px 0px" },
    transition: { duration: prefersReduced ? 0.15 : 0.4, ease: "easeOut" },
  };

  return (
    <div className="contact-page">
      <Motion.header
        className="contact-hero contact-shell"
        variants={heroContainer}
        initial="hidden"
        animate="visible"
      >
        <Motion.p variants={heroItem} className="contact-eyebrow">GIÁO XỨ AN NGÃI · XỨ ĐOÀN MẸ MÂN CÔI</Motion.p>
        <Motion.h1 variants={heroItem}>Kết nối bằng <em>sự sẻ chia.</em></Motion.h1>
        <Motion.p variants={heroItem}>Một câu hỏi, một lời góp ý hay mong muốn đồng hành.{" "}<br className="hidden sm:inline" />Ban Giáo lý luôn sẵn lòng lắng nghe bạn.</Motion.p>
        <Motion.div variants={heroItem} className="contact-hero-actions">
          <a className="contact-hero-pill contact-pill-primary" href="tel:0905143643">
            <Phone size={15} /> <span>Gọi Hotline</span>
          </a>
          <a className="contact-hero-pill" href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={15} /> <span>Nhắn Fanpage</span>
          </a>
          <a className="contact-hero-pill" href="#form-lien-he" onClick={(event) => {
            event.preventDefault();
            const section = document.getElementById("form-lien-he");
            section?.scrollIntoView({ behavior: prefersReduced ? "instant" : "smooth", block: "start" });
            setTimeout(() => document.getElementById("contact-hoTen")?.focus({ preventScroll: true }), 350);
          }}>
            <Send size={15} /> <span>Gửi lời nhắn</span>
          </a>
          <a className="contact-hero-pill" href={MAP_URL} target="_blank" rel="noopener noreferrer">
            <MapPin size={15} /> <span>Chỉ đường</span>
          </a>
        </Motion.div>
      </Motion.header>

      <Motion.div className="contact-main contact-shell" {...sectionReveal}>
        <section className="contact-channels" aria-labelledby="contact-channels-title">
          <p className="contact-eyebrow">CHỌN CÁCH THUẬN TIỆN NHẤT</p>
          <h2 id="contact-channels-title">Liên hệ trực tiếp</h2>
          <p className="contact-muted">Trao đổi với chúng tôi qua điện thoại, Fanpage hoặc email.</p>
          <div className="contact-channel contact-phone-card">
            <span className="contact-channel-icon"><Phone size={22} /></span>
            <div className="contact-channel-body">
              <span className="contact-small-label">ĐIỆN THOẠI · TRƯỞNG BAN GIÁO LÝ</span>
              <a className="contact-phone-number" href="tel:0905143643">{PHONE}</a>
              <p>Vui lòng hẹn trước nếu cần gặp trực tiếp.</p>
              <div className="contact-channel-actions">
                <a className="contact-link" href="tel:0905143643">Gọi điện <ArrowUpRight size={16} /></a>
                <CopyButton value="0905143643" label="số điện thoại" />
              </div>
            </div>
          </div>

          <div className="contact-channel contact-facebook-card">
            <span className="contact-channel-icon"><MessageCircle size={22} /></span>
            <div className="contact-channel-body">
              <span className="contact-small-label">FANPAGE FACEBOOK</span>
              <a className="contact-channel-name" href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer">HTDC Xứ đoàn Mẹ Mân Côi <ArrowUpRight size={16} /></a>
              <p>Giáo xứ An Ngãi · Tin tức và kết nối cộng đoàn</p>
              <div className="contact-channel-actions">
                <a className="contact-link" href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer">Nhắn Fanpage <ArrowUpRight size={16} /></a>
              </div>
            </div>
          </div>

          <div className="contact-channel contact-email-card">
            <span className="contact-channel-icon"><Mail size={22} /></span>
            <div className="contact-channel-body">
              <span className="contact-small-label">EMAIL</span>
              <a className="contact-channel-name" href={`mailto:${EMAIL}`}>{EMAIL}</a>
              <p>Gửi câu hỏi hoặc chia sẻ ý kiến của bạn.</p>
              <div className="contact-channel-actions">
                <a className="contact-link" href={`mailto:${EMAIL}`}>Gửi email <ArrowUpRight size={16} /></a>
                <CopyButton value={EMAIL} label="email" />
              </div>
            </div>
          </div>
          <div className="contact-response-note"><Clock size={19} /><p>Bạn có thể để lại lời nhắn bất cứ lúc nào. Ban Giáo lý sẽ phản hồi khi tiếp nhận và xử lý yêu cầu.</p></div>
          <Link to="/tuyển-sinh" className="contact-enrollment">
            <span className="contact-enrollment-badge" aria-hidden="true">
              <GraduationCap size={22} />
            </span>
            <div className="contact-enrollment-body">
              <span className="contact-enrollment-tag">TUYỂN SINH 2026 – 2027</span>
              <strong className="contact-enrollment-title">Đăng ký học Giáo lý cho các em</strong>
              <p className="contact-enrollment-desc">Xem thông tin tuyển sinh & hồ sơ nhập học</p>
            </div>
            <ArrowRight size={19} className="contact-enrollment-arrow" aria-hidden="true" />
          </Link>
        </section>
        <ContactForm />
      </Motion.div>

      <Motion.section className="contact-visit contact-shell" aria-labelledby="contact-visit-title" {...sectionReveal}>
        <div className="contact-section-heading"><div><p className="contact-eyebrow">HẸN GẶP BẠN TẠI GIÁO XỨ</p><h2 id="contact-visit-title">Một địa chỉ, <em>nhiều kết nối.</em></h2></div><p>Vui lòng liên hệ hẹn trước ít nhất 24 giờ{" "}<br className="hidden sm:inline" />nếu bạn cần gặp ngoài giờ sinh hoạt.</p></div>
        <div className="contact-visit-grid">
          <article className="contact-address">
            <div className="contact-address-media">
              <img src={`${import.meta.env.BASE_URL}images/gioi-thieu/thanh-duong-640.webp`} alt="Mặt tiền thánh đường An Ngãi với hai tháp chuông" width="640" height="427" loading="lazy" decoding="async" />
              <span className="contact-address-tag">Khuôn viên Giáo xứ</span>
            </div>
            <div>
              <span className="contact-small-label"><MapPin size={15} /> ĐỊA ĐIỂM GẶP GỠ</span>
              <h3>Giáo xứ An Ngãi</h3>
              <address>{ADDRESS}</address>
              <div className="contact-address-actions">
                <a className="contact-button contact-primary" href={MAP_URL} target="_blank" rel="noopener noreferrer">Mở Google Maps <ArrowUpRight size={17} /></a>
                <CopyButton value={ADDRESS} label="địa chỉ" />
              </div>
            </div>
          </article>
          <article className="contact-hours">
            <div className="contact-hours-header">
              <Clock size={24} />
              <h3>Khung giờ sinh hoạt</h3>
            </div>
            
            <div className="contact-liturgy-banner" role="status">
              <div className="contact-liturgy-badge">
                <span className="contact-liturgy-dot" aria-hidden="true" />
                {today === 0 ? "Chúa Nhật Hôm Nay" : today === 6 ? "Thứ Bảy Hôm Nay" : "Ngày Thường Trong Tuần"}
              </div>
              <p className="contact-liturgy-desc">
                {today === 0
                  ? "07:00 – 09:30 · Thánh lễ Thiếu nhi & Giờ học Giáo lý các khối"
                  : today === 6
                  ? "17:30 Lễ Chiều & 19:00 Họp Ban Huynh Trưởng"
                  : "Tiếp nhận tin nhắn trực tuyến & liên hệ hẹn gặp trước"}
              </p>
            </div>

            <p className="contact-muted">Thời gian sinh hoạt cộng đoàn, không phải lịch trực tư vấn.</p>
            <div>
              {HOURS.map((hour) => (
                <div key={hour.day} className="contact-hours-row">
                  <div>
                    <strong>{hour.day} {hour.days.includes(today) && <span aria-label="Lịch hôm nay">Hôm nay</span>}</strong>
                    <p>{hour.note}</p>
                  </div>
                  <span>{hour.time}</span>
                </div>
              ))}
            </div>
            <p className="contact-hours-note">Lịch có thể thay đổi vào các dịp đặc biệt. Theo dõi thông báo mới trước khi đến.</p>
            <Link className="contact-link" to="/lịch-sinh-hoạt">Xem lịch sinh hoạt <ArrowRight size={17} /></Link>
          </article>
        </div>
      </Motion.section>

      <Motion.section className="contact-faq contact-shell" aria-labelledby="contact-faq-title" {...sectionReveal}>
        <div><p className="contact-eyebrow">CÓ THỂ BẠN ĐANG THẮC MẮC</p><h2 id="contact-faq-title">Một vài<br /><em>giải đáp nhanh.</em></h2><p>Những thông tin hữu ích trước khi liên hệ với Ban Giáo lý.</p></div>
        <div>
          {FAQS.map((faq, index) => (
            <div className="contact-faq-item" key={faq.q}>
              <h3>
                <button
                  type="button"
                  aria-expanded={openFaq === index}
                  aria-controls={`contact-answer-${index}`}
                  id={`contact-question-${index}`}
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <div className="contact-faq-question-wrap">
                    <span className="contact-faq-cat">{faq.cat}</span>
                    <span className="contact-faq-text">{faq.q}</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`contact-faq-chevron ${openFaq === index ? "contact-faq-chevron-open" : ""}`}
                    aria-hidden="true"
                  />
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {openFaq === index && (
                  <Motion.div
                    id={`contact-answer-${index}`}
                    role="region"
                    aria-labelledby={`contact-question-${index}`}
                    initial={prefersReduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={prefersReduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    transition={{ duration: prefersReduced ? 0.12 : 0.22, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <p>{faq.a}</p>
                    {faq.to && <Link className="contact-link" to={faq.to}>{faq.label} <ArrowRight size={16} /></Link>}
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </Motion.section>

      <div className="contact-closing contact-shell">
        <div className="contact-closing-pill">
          <MessageCircle size={16} aria-hidden="true" />
          <p>Cảm ơn bạn đã cùng chúng tôi xây dựng một cộng đoàn gắn kết.</p>
        </div>
      </div>
    </div>
  );
}
function vietnamDay() {
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
}
