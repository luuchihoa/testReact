import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight, Phone, Mail, MapPin, Clock, Copy, Check, MessageCircle, Send, CheckCircle2, Loader2, Plus, Minus } from "lucide-react";
import { submitContactForm } from "../features/admin/dataLayer.js";
import { CONTACT_TOPICS, CONTACT_LIMITS, validateContact, buildContactPayload } from "../features/contact/contactForm.js";
import "./Contact.css";

const PHONE = "0905 143 643";
const EMAIL = "htdcanngai@gmail.com";
const ADDRESS = "Thôn An Ngãi Tây 2, Phường Hoà Khánh, Tp Đà Nẵng";
const MAP_URL = "https://maps.app.goo.gl/FEtKEGn8V4wMXXKY6";
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61558564791118";
const EMPTY_FORM = { hoTen: "", sdt: "", chuDe: "", noiDung: "" };
const HOURS = [
  { day: "Thứ Bảy", time: "08:00 – 11:30", note: "Sinh hoạt nhóm", days: [6] },
  { day: "Chủ Nhật", time: "07:00 – 09:30", note: "Giáo lý & Thánh lễ", days: [0] },
  { day: "Trong tuần", time: "Theo hẹn trước", note: "Liên hệ qua điện thoại hoặc email", days: [1, 2, 3, 4, 5] },
];
const FAQS = [
  { q: "Con tôi muốn học giáo lý, bắt đầu từ đâu?", a: "Phụ huynh có thể xem thông tin tuyển sinh hoặc gửi lời nhắn với chủ đề “Tuyển sinh”. Ban Giáo lý sẽ hướng dẫn lựa chọn lớp phù hợp.", to: "/tuyển-sinh", label: "Tìm hiểu tuyển sinh" },
  { q: "Tôi có thể xem lịch học của các em ở đâu?", a: "Lịch học có trên website. Nếu cần hỏi thêm về lớp hoặc lịch sinh hoạt, bạn có thể chọn chủ đề “Lịch học” trong biểu mẫu.", to: "/lịch-học", label: "Xem lịch học" },
  { q: "Làm sao để tham gia làm giáo lý viên?", a: "Chọn chủ đề “Tham gia giáo lý viên” và để lại số điện thoại cùng lời giới thiệu ngắn. Bạn cũng có thể liên hệ trực tiếp với Trưởng Trang để trao đổi." },
  { q: "Tôi có thể liên hệ ngoài giờ sinh hoạt không?", a: "Bạn có thể để lại lời nhắn hoặc nhắn qua Fanpage bất cứ lúc nào. Nếu muốn gặp trực tiếp ngoài giờ sinh hoạt, vui lòng liên hệ hẹn trước ít nhất 24 giờ." },
  { q: "Sau khi gửi lời nhắn, tôi sẽ nhận phản hồi thế nào?", a: "Ban Giáo lý sẽ liên hệ qua số điện thoại bạn cung cấp khi tiếp nhận và xử lý lời nhắn. Nếu cần trao đổi sớm, bạn có thể gọi điện hoặc nhắn qua Fanpage." },
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
  return <span className="contact-copy-wrap">
    <button type="button" className="contact-copy" onClick={copy} aria-label={`Sao chép ${label}`}>
      {status === "Đã sao chép" ? <Check size={17} /> : <Copy size={17} />}
    </button>
    <span role="status" className="contact-copy-status">{status}</span>
  </span>;
}

function ContactForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [failure, setFailure] = useState("");
  const sending = useRef(false);
  const resultRef = useRef(null);
  const errorRef = useRef(null);

  useEffect(() => { if (done) resultRef.current?.focus(); }, [done]);
  useEffect(() => { if (failure) errorRef.current?.focus(); }, [failure]);

  function change(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
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
      setDone(true);
    } catch {
      setFailure("Chưa thể xác nhận lời nhắn đã được gửi. Nội dung của bạn vẫn được giữ lại; bạn có thể thử lại hoặc liên hệ qua điện thoại, Fanpage.");
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
      "aria-describedby": [errors[name] ? `contact-${name}-error` : "", name === "sdt" ? "contact-phone-hint" : ""].filter(Boolean).join(" ") || undefined,
    };
  }
  function fieldError(name) {
    return errors[name] && <p id={`contact-${name}-error`} className="contact-field-error">{errors[name]}</p>;
  }

  return <section className="contact-form-panel" id="form-lien-he" aria-labelledby="contact-form-title">
    <p className="contact-eyebrow">CHÚNG TÔI SẴN LÒNG LẮNG NGHE</p>
    <h2 id="contact-form-title">Gửi một <em>lời nhắn.</em></h2>
    {done ? <div className="contact-success" ref={resultRef} tabIndex={-1} role="status">
      <CheckCircle2 size={46} />
      <h3>Đã nhận lời nhắn của bạn</h3>
      <p>Cảm ơn bạn đã liên hệ. Ban Giáo lý sẽ phản hồi qua số <strong>{buildContactPayload(form).sdt}</strong> khi tiếp nhận và xử lý lời nhắn.</p>
      <button className="contact-button contact-primary" type="button" onClick={() => {
        setForm(EMPTY_FORM); setErrors({}); setDone(false);
        requestAnimationFrame(() => document.getElementById("contact-hoTen")?.focus());
      }}>Gửi lời nhắn khác <ArrowRight size={17} /></button>
    </div> : <>
      <p className="contact-form-intro">Để lại thông tin để Ban Giáo lý có thể liên hệ với bạn. Tất cả các trường bên dưới đều cần điền.</p>
      <form onSubmit={handleSubmit} noValidate aria-busy={loading}>
        <div className="contact-form-row">
          <div><label htmlFor="contact-hoTen">Họ và tên</label><input {...attributes("hoTen")} type="text" autoComplete="name" maxLength={CONTACT_LIMITS.name} placeholder="Tên của bạn" />{fieldError("hoTen")}</div>
          <div><label htmlFor="contact-sdt">Số điện thoại</label><input {...attributes("sdt")} type="tel" inputMode="tel" autoComplete="tel" maxLength={24} placeholder="VD: 0905 123 456" /><p id="contact-phone-hint" className="contact-field-hint">Số để Ban Giáo lý liên hệ lại với bạn.</p>{fieldError("sdt")}</div>
        </div>
        <div><label htmlFor="contact-chuDe">Bạn cần hỗ trợ về?</label><select {...attributes("chuDe")}><option value="" disabled>Chọn một chủ đề</option>{CONTACT_TOPICS.map((topic) => <option key={topic}>{topic}</option>)}</select>{fieldError("chuDe")}</div>
        <div><label htmlFor="contact-noiDung">Lời nhắn của bạn</label><textarea {...attributes("noiDung")} rows={5} maxLength={CONTACT_LIMITS.message} placeholder="Bạn muốn trao đổi điều gì với Ban Giáo lý?" />{fieldError("noiDung")}<span className="contact-counter">{form.noiDung.length.toLocaleString("vi-VN")} / 2.000 ký tự</span></div>
        {failure && <div className="contact-submit-error" role="alert" tabIndex={-1} ref={errorRef}><p>{failure}</p><a href="tel:0905143643">Gọi {PHONE}</a><a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer">Mở Fanpage ↗</a></div>}
        <p className="contact-privacy">Thông tin bạn cung cấp được dùng để tiếp nhận và phản hồi lời nhắn. <Link to="/bảo-mật">Xem chính sách bảo mật.</Link></p>
        <button type="submit" className="contact-button contact-primary contact-submit" disabled={loading}>{loading ? <><Loader2 className="contact-spinner" size={18} />Đang gửi lời nhắn…</> : <>Gửi lời nhắn <Send size={17} /></>}</button>
      </form>
    </>}
  </section>;
}

export default function Contact() {
  const [today, setToday] = useState(() => vietnamDay());
  const [openFaq, setOpenFaq] = useState(null);
  useEffect(() => {
    const timer = setInterval(() => setToday(vietnamDay()), 60000);
    const previous = document.title;
    document.title = "Liên hệ Ban Giáo lý | Xứ đoàn Mẹ Mân Côi";
    return () => { clearInterval(timer); document.title = previous; };
  }, []);

  return <div className="contact-page">
    <header className="contact-hero contact-shell">
      <p className="contact-eyebrow">GIÁO XỨ AN NGÃI · XỨ ĐOÀN MẸ MÂN CÔI</p>
      <h1>Kết nối bằng <em>sự sẻ chia.</em></h1>
      <p>Một câu hỏi, một lời góp ý hay mong muốn đồng hành.{" "}<br />Ban Giáo lý luôn sẵn lòng lắng nghe bạn.</p>
      <a className="contact-link contact-form-shortcut" href="#form-lien-he" onClick={(event) => {
        event.preventDefault();
        const section = document.getElementById("form-lien-he");
        section?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
        document.getElementById("contact-hoTen")?.focus({ preventScroll: true });
      }}>Đi đến biểu mẫu <ArrowRight size={17} /></a>
    </header>

    <div className="contact-main contact-shell">
      <section className="contact-channels" aria-labelledby="contact-channels-title">
        <p className="contact-eyebrow">CHỌN CÁCH THUẬN TIỆN NHẤT</p>
        <h2 id="contact-channels-title">Liên hệ trực tiếp</h2>
        <p className="contact-muted">Trao đổi với chúng tôi qua điện thoại, Fanpage hoặc email.</p>
        <div className="contact-channel contact-phone-card">
          <span className="contact-channel-icon"><Phone size={22} /></span>
          <div><span className="contact-small-label">ĐIỆN THOẠI · TRƯỞNG TRANG</span><a className="contact-phone-number" href="tel:0905143643">{PHONE}</a><p>Vui lòng hẹn trước nếu cần gặp trực tiếp.</p><a className="contact-link" href="tel:0905143643">Gọi điện <ArrowUpRight size={16} /></a></div>
          <CopyButton value="0905143643" label="số điện thoại" />
        </div>
        <div className="contact-channel"><span className="contact-channel-icon"><MessageCircle size={22} /></span><div><span className="contact-small-label">FANPAGE FACEBOOK</span><a className="contact-channel-name" href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer">HTDC Xứ đoàn Mẹ Mân Côi <ArrowUpRight size={16} /></a><p>Giáo xứ An Ngãi · Tin tức và kết nối cộng đoàn</p></div></div>
        <div className="contact-channel"><span className="contact-channel-icon"><Mail size={22} /></span><div><span className="contact-small-label">EMAIL</span><a className="contact-channel-name" href={`mailto:${EMAIL}`}>{EMAIL}</a><p>Gửi câu hỏi hoặc chia sẻ ý kiến của bạn.</p></div><CopyButton value={EMAIL} label="email" /></div>
        <div className="contact-response-note"><Clock size={19} /><p>Bạn có thể để lại lời nhắn bất cứ lúc nào. Ban Giáo lý sẽ phản hồi khi tiếp nhận và xử lý yêu cầu.</p></div>
        <Link to="/tuyển-sinh" className="contact-enrollment"><BookLabel /><span>Muốn đăng ký học cho các em?<strong>Xem thông tin tuyển sinh</strong></span><ArrowRight size={19} /></Link>
      </section>
      <ContactForm />
    </div>

    <section className="contact-visit contact-shell" aria-labelledby="contact-visit-title">
      <div className="contact-section-heading"><div><p className="contact-eyebrow">HẸN GẶP BẠN TẠI GIÁO XỨ</p><h2 id="contact-visit-title">Một địa chỉ, <em>nhiều kết nối.</em></h2></div><p>Vui lòng liên hệ hẹn trước ít nhất 24 giờ<br />nếu bạn cần gặp ngoài giờ sinh hoạt.</p></div>
      <div className="contact-visit-grid">
        <article className="contact-address">
          <img src={`${import.meta.env.BASE_URL}images/gioi-thieu/thanh-duong-640.webp`} alt="Mặt tiền thánh đường An Ngãi với hai tháp chuông" width="640" height="427" loading="lazy" decoding="async" />
          <div><span className="contact-small-label"><MapPin size={15} /> ĐỊA ĐIỂM GẶP GỠ</span><h3>Giáo xứ An Ngãi</h3><address>{ADDRESS}</address><div className="contact-address-actions"><a className="contact-button contact-primary" href={MAP_URL} target="_blank" rel="noopener noreferrer">Mở Google Maps <ArrowUpRight size={17} /></a><CopyButton value={ADDRESS} label="địa chỉ" /></div></div>
        </article>
        <article className="contact-hours"><Clock size={27} /><h3>Khung giờ sinh hoạt</h3><p className="contact-muted">Thời gian sinh hoạt cộng đoàn, không phải lịch trực tư vấn.</p><div>{HOURS.map((hour) => <div key={hour.day} className="contact-hours-row"><div><strong>{hour.day} {hour.days.includes(today) && <span>Hôm nay</span>}</strong><p>{hour.note}</p></div><span>{hour.time}</span></div>)}</div><p className="contact-hours-note">Lịch có thể thay đổi vào các dịp đặc biệt. Theo dõi thông báo mới trước khi đến.</p><Link className="contact-link" to="/lịch-sinh-hoạt">Xem lịch sinh hoạt <ArrowRight size={17} /></Link></article>
      </div>
    </section>

    <section className="contact-faq contact-shell" aria-labelledby="contact-faq-title"><div><p className="contact-eyebrow">CÓ THỂ BẠN ĐANG THẮC MẮC</p><h2 id="contact-faq-title">Một vài<br /><em>giải đáp nhanh.</em></h2><p>Những thông tin hữu ích trước khi liên hệ với Ban Giáo lý.</p></div><div>{FAQS.map((faq, index) => <div className="contact-faq-item" key={faq.q}><h3><button type="button" aria-expanded={openFaq === index} aria-controls={`contact-answer-${index}`} id={`contact-question-${index}`} onClick={() => setOpenFaq(openFaq === index ? null : index)}><span>{faq.q}</span>{openFaq === index ? <Minus size={18} /> : <Plus size={18} />}</button></h3><div id={`contact-answer-${index}`} role="region" aria-labelledby={`contact-question-${index}`} hidden={openFaq !== index}><p>{faq.a}</p>{faq.to && <Link className="contact-link" to={faq.to}>{faq.label} <ArrowRight size={16} /></Link>}</div></div>)}</div></section>
    <div className="contact-closing contact-shell"><MessageCircle size={19} /><p>Cảm ơn bạn đã cùng chúng tôi xây dựng một cộng đoàn gắn kết.</p></div>
  </div>;
}

function BookLabel() { return <span className="contact-enrollment-icon" aria-hidden="true">↗</span>; }
function vietnamDay() {
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
}
