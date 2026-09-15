import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users, BookOpen, Clock, CalendarDays, MapPin,
  Sparkles, ChevronDown, ArrowRight, Church,
  Music, Palette, Heart,
  ShieldCheck, Calendar, Quote, CheckCircle2
} from "lucide-react";
import { getKhoiChienConData } from "../utils/academicYear.js";
import "./KhoiChienCon.css";

// Helper định dạng danh xưng Giáo Lý Viên
const formatTeacherName = (t) => {
  if (t.startsWith("C.")) return `Chị ${t.slice(2)}`;
  if (t.startsWith("A.")) return `Anh ${t.slice(2)}`;
  if (t.startsWith("Sr.")) return `Sr. ${t.slice(3)}`;
  if (t.startsWith("B.")) return `B. ${t.slice(2)}`;
  return t;
};

// Helper vị trí phòng học
const getRoomLocation = (room) => {
  if (room.includes("P1") || room.includes("P2")) return `${room} · Tầng Trệt`;
  if (room.toLowerCase().includes("hầm")) return "Nhà Hầm Sinh Hoạt";
  if (room.toLowerCase().includes("nhà thờ")) return "Khu Nhà Thờ (Bên Nữ)";
  return room;
};

// Helper theme màu Bento
const getCardTheme = (id) => {
  if (id === "vuon-tre") return "card-vuontre";
  if (id.startsWith("kt-1")) return "card-kt1";
  return "card-kt2";
};

// Helper mã lớp ngắn gọn
const getClassCode = (name) => {
  if (name.includes("Vườn Trẻ")) return "VT";
  return name.replace("Lớp Khai Tâm ", "KT ");
};

export default function KhoiChienCon() {
  // Dữ liệu lớp gắn với niên khóa đã khai báo, không tự chuyển sang năm mới.
  const data = getKhoiChienConData();
  const {
    academicYear,
    academicYearSpaced,
    vuonTreBirthYear,
    khaiTam1BirthYear,
    khaiTam2BirthYear,
    classes
  } = data;

  const teacherCount = new Set(classes.flatMap((item) => item.teachers)).size;

  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = `Khối Chiên Con (Vườn Trẻ & Khai Tâm) · Niên Khóa ${academicYear} | Giáo xứ An Ngãi`;
    return () => {
      document.title = prevTitle;
    };
  }, [academicYear]);

  // Phân nhóm lớp học
  const vuonTreClasses = classes.filter((c) => c.group === "Vườn Trẻ");
  const khaiTamClasses = classes.filter((c) => c.group.startsWith("Khai Tâm"));

  // 4 Thẻ Bento trực quan "Học Mà Chơi — Chơi Mà Học" (ngắn gọn, súc tích)
  const bentoCards = [
    {
      icon: Music,
      title: "Hát & Cử Điệu",
      desc: "Học qua giai điệu vui tươi và cử điệu ngộ nghĩnh, giúp bé thêm yêu mến Nhà Chúa mỗi Chúa Nhật.",
      color: "emerald"
    },
    {
      icon: Palette,
      title: "Tô Màu & Thủ Công",
      desc: "Rèn luyện đôi tay khéo léo và trí tưởng tượng qua tranh vẽ Kinh Thánh và làm thiệp dễ thương.",
      color: "sky"
    },
    {
      icon: BookOpen,
      title: "Kể Chuyện Trực Quan",
      desc: "Làm quen với Chúa Giêsu qua búp bê kể chuyện, tranh ảnh màu sắc và những bài học đơn sơ.",
      color: "amber"
    },
    {
      icon: Heart,
      title: "Kinh Nguyện Đơn Sơ",
      desc: "Tập làm Dấu Thánh Giá nghiêm trang, thuộc lòng Kinh Lạy Cha & Kính Mừng để cùng đọc tại gia đình.",
      color: "rose"
    }
  ];

  // 4 Mốc thời gian gọn gàng của Ca 2 Chúa Nhật
  const timelineSteps = [
    {
      time: "07:45",
      label: "Đón bé tại Nhà Thờ",
      sub: "GLV đón tiếp & hướng dẫn gia đình",
      highlight: false,
      tag: null
    },
    {
      time: "08:00 – 09:00",
      label: "Thánh Lễ Thiếu Nhi Toàn Đoàn",
      sub: "Ngồi cùng phụ huynh / hàng ghế mầm non · Tập làm dấu và đơn sơ cầu nguyện",
      highlight: true,
      tag: "Tâm Điểm Phụng Vụ"
    },
    {
      time: "09:15 – 10:00",
      label: "Lớp Giáo Lý Mầm Non",
      sub: "Kể chuyện Kinh Thánh qua tranh ảnh, tô màu và múa hát cử điệu (P1 – P2)",
      highlight: true,
      tag: "Huấn Giáo Đức Tin"
    },
    {
      time: "10:00",
      label: "Phụ huynh đón bé",
      sub: "Đón an toàn tận tay tại cửa phòng học",
      highlight: false,
      tag: null
    }
  ];

  // Cẩm nang FAQ tinh gọn
  const faqs = [
    {
      q: `Bé mấy tuổi thì đủ điều kiện đăng ký học Khối Chiên Con niên khóa ${academicYear}?`,
      a: `Dành cho bé 5–7 tuổi: Lớp Vườn Trẻ (5 tuổi · Sinh ${vuonTreBirthYear}), Lớp Khai Tâm 1 (6 tuổi · Sinh ${khaiTam1BirthYear}) và Lớp Khai Tâm 2 (7 tuổi · Sinh ${khaiTam2BirthYear}).`
    },
    {
      q: "Bé 5 tuổi vào Lớp Vườn Trẻ có bắt buộc phải biết đọc chữ không?",
      a: "Hoàn toàn không. Lớp học theo phương pháp mầm non Công giáo: học qua bài hát, tranh tô màu, cử điệu và trò chơi để bé làm quen với nhà Chúa."
    },
    {
      q: "Phụ huynh có được vào lớp ngồi cùng bé trong những buổi đầu không?",
      a: "Được phép. Trong 2–3 tuần đầu, ba mẹ có thể ngồi cạnh hoặc đứng gần cửa để bé an tâm làm quen với cô và các bạn."
    },
    {
      q: "Lịch học và thời gian đưa đón bé diễn ra thế nào?",
      a: "Khối Chiên Con sinh hoạt vào Ca 2 Chúa Nhật: 07h45 đón bé tại sảnh Nhà Thờ ➔ 08h00 dự Thánh Lễ ➔ 09h15 học Giáo lý ➔ 10h00 phụ huynh đón bé tại cửa phòng học."
    },
    {
      q: "Phụ huynh cần chuẩn bị những gì cho bé trong ba lô khi đi học giáo lý?",
      a: "Ba mẹ chỉ cần chuẩn bị cho bé một bình nước uống cá nhân nhỏ, mang giày dép quai hậu gọn gàng và mặc lễ phục/áo trắng sạch sẽ. Vở tập tô, sáp màu và tài liệu học tập đều được Xứ đoàn trang bị sẵn tại phòng học."
    }
  ];

  // 3 Trụ Cột Hành Động Đồng Hành Mầm Non (Cột Trái)
  const familyPillars = [
    {
      key: "green",
      title: "Dạy Con Dấu Thánh Giá Đầu Đời",
      badge: "Mỗi Ngày",
      desc: "Cùng bé làm dấu Thánh Giá chậm rãi trước bữa ăn và trước giờ ngủ. Tập cho con quen thuộc với tên Chúa Giêsu, Mẹ Maria và Thiên Thần Bản Mệnh qua những bài hát cử điệu vui tươi.",
      tip: "Cầm tay bé uốn nắn từng cử chỉ làm Dấu Thánh Giá trang nghiêm và dành cho con cái ôm ấm áp sau mỗi lời kinh.",
      icon: Heart
    },
    {
      key: "purple",
      title: "Nuôi Dưỡng Trái Tim Yêu Thương",
      badge: "Tại Gia",
      desc: "Kể cho bé nghe những mẩu chuyện Kinh Thánh ngắn bằng tranh tô màu sinh động. Dạy bé biết nói lời 'cảm ơn', 'xin lỗi', biết chia sẻ đồ chơi với bạn và vâng lời ông bà cha mẹ.",
      tip: "Dành 5–10 phút mỗi tối cùng bé xem tranh Phúc Âm Thiếu Nhi và hỏi cảm nghĩ giản dị của con về Chúa Giêsu.",
      icon: Sparkles
    },
    {
      key: "amber",
      title: "Tập Cho Bé Tác Phong Đi Nhà Thờ",
      badge: "Sáng Chúa Nhật",
      desc: "Đưa bé đến nhà thờ đúng giờ, nhắc bé mặc áo trắng tề chỉnh và dạy bé biết cúi đầu chào Chúa trước Nhà Tạm. Giúp bé giữ trật tự và hòa cùng lời ca tiếng hát trong Thánh Lễ.",
      tip: "Nhắc con đi vệ sinh trước giờ lễ và mang theo bình nước cá nhân để bé không bị bỡ ngỡ khi vào lớp học.",
      icon: Church
    }
  ];

  // Khối Sanctuary Box (Mái Ấm & Checklist Mầm Non - Cột Phải)
  const sanctuaryData = {
    eyebrow: "Gia Đình Là Cái Nôi Đầu Tiên Của Đức Tin",
    quote: "Cứ để trẻ nhỏ đến với Thầy, đừng ngăn cấm chúng, vì Nước Trời thuộc về những ai giống như chúng.",
    author: "Tin Mừng Theo Thánh Mátthêu (Mt 19, 14)",
    checklistTitle: "3 Việc Nhỏ Ba Mẹ Chuẩn Bị Cho Bé Sáng Chúa Nhật",
    checklist: [
      { label: "Đúng Giờ", text: "Đưa bé đến sảnh Thánh đường trước 07h45 để tập trung cùng các bạn và quý Soeur." },
      { label: "Lễ Phục", text: "Trang phục áo trắng/lễ phục sạch sẽ, mang giày sandal hoặc giày quai hậu gọn gàng." },
      { label: "Đón Bé", text: "Ba mẹ đón bé tại cửa phòng học đúng 10h00 sau khi kết thúc giờ giáo lý sinh hoạt." }
    ],
    supportTitle: "Ba mẹ cần hỗ trợ riêng về tâm lý hoặc sức khỏe của bé?",
    supportDesc: "Quý phụ huynh vui lòng trao đổi trực tiếp cùng Quý Soeur hoặc GLV phụ trách lớp.",
    supportBtnText: "Nhắn Tin GLV",
    supportBtnLink: "/liên-hệ"
  };

  return (
    <div className="cc-page">
      {/* ══════════════════════════════════════════════════════════════
          HERO SECTION: 2 CỘT VISUAL-FIRST VỚI ẢNH BÉ TƯƠI SÁNG
      ══════════════════════════════════════════════════════════════ */}
      <section className="cc-hero">
        <div className="cc-shell">
          <div className="cc-hero-grid">
            {/* Cột trái: Nội dung & Nút hành động */}
            <div className="cc-hero-left">
              <div className="cc-hero-pill-badge">
                <span className="cc-hero-pill-icon" aria-hidden="true">🐑</span>
                <span>Ngành Ấu HTDC · Khối Chiên Con</span>
              </div>

              <h1 className="cc-hero-title">
                Vườn Trẻ &amp; Khai Tâm<br />
                <em>Ươm mầm đức tin</em>
              </h1>

              <div className="cc-hero-verse">
                <p className="cc-hero-verse-quote">
                  “Cứ để trẻ nhỏ đến với Thầy... vì Nước Trời là của những ai giống như chúng.”
                </p>
                <span className="cc-hero-verse-cite">Tin Mừng Thánh Mátthêu (Mt 19, 14)</span>
              </div>

              <div className="cc-hero-actions">
                <a href="#danh-sach-lop" className="cc-btn-primary" onClick={(event) => {
                  event.preventDefault();
                  const section = document.getElementById("danh-sach-lop");
                  section?.focus({ preventScroll: true });
                  section?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
                }}>
                  <span>Xem {classes.length} Lớp Học</span>
                  <ArrowRight size={18} aria-hidden="true" className="cc-btn-icon" />
                </a>
                <Link to="/tuyển-sinh#dang-ky" className="cc-btn-secondary">
                  <Sparkles size={17} aria-hidden="true" className="cc-btn-icon" />
                  <span>Đăng Ký Cho Bé</span>
                </Link>
              </div>
            </div>

            {/* Cột phải: Khung ảnh Thiếu Nhi mầm non & Floating Badge */}
            <div className="cc-hero-right">
              <div className="cc-hero-image-card">
                <img
                  src={`${import.meta.env.BASE_URL}images/khoichiencon.avif`}
                  alt="Tranh minh họa Chúa Giêsu cùng các em nhỏ bên dòng suối"
                  className="cc-hero-img"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
                <div className="cc-floating-badge">
                  <div className="cc-floating-badge-icon">
                    <Heart size={20} />
                  </div>
                  <div>
                    <div className="cc-floating-badge-title">
                      150+ Bé Khối Chiên Con
                    </div>
                    <div className="cc-floating-badge-sub">
                      Vườn Trẻ &amp; Khai Tâm · Xứ đoàn Mẹ Mân Côi
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dải tổng quan 4 chỉ số (Overview Bar) Bento Chips */}
          <div className="cc-overview-bar">
            <div className="cc-overview-chip">
              <span className="cc-chip-cat">Độ tuổi</span>
              <span className="cc-chip-value">5 – 7 Tuổi</span>
              <span className="cc-chip-label">Sinh năm {khaiTam2BirthYear} – {vuonTreBirthYear}</span>
            </div>
            <div className="cc-overview-chip">
              <span className="cc-chip-cat">Quy mô</span>
              <span className="cc-chip-value">{classes.length} Lớp Học</span>
              <span className="cc-chip-label">Vườn Trẻ &amp; Khai Tâm 1, 2</span>
            </div>
            <div className="cc-overview-chip">
              <span className="cc-chip-cat">Lịch học</span>
              <span className="cc-chip-value">Ca 2 Chúa Nhật</span>
              <span className="cc-chip-label">Lễ 08:00 · Học 09:15</span>
            </div>
            <div className="cc-overview-chip">
              <span className="cc-chip-cat">Nhân sự</span>
              <span className="cc-chip-value">{teacherCount} GLV</span>
              <span className="cc-chip-label">Quý Soeur &amp; Giáo Lý Viên</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2: DANH SÁCH LỚP HỌC
      ══════════════════════════════════════════════════════════════ */}
      <section id="danh-sach-lop" tabIndex={-1} className="cc-roster-section">
        <div className="cc-shell">
          <div className="cc-section-header" style={{ marginBottom: "28px" }}>
            <div className="cc-eyebrow">
              <span className="cc-dot" />
              <span>DANH SÁCH LỚP HỌC</span>
            </div>
            <h2 className="cc-section-title" style={{ marginBottom: "8px" }}>
              Lớp Học <em>Niên Khóa {academicYear}</em>
            </h2>
            <p className="cc-section-desc">
              {classes.length} lớp · {teacherCount} giáo lý viên đồng hành. Thông tin thuộc niên khóa {academicYear}.
            </p>
          </div>

          {[
            { name: "Lớp Vườn Trẻ", age: "5 tuổi", birth: vuonTreBirthYear, items: vuonTreClasses },
            { name: "Khối Khai Tâm", age: "6–7 tuổi", birth: `${khaiTam2BirthYear}–${khaiTam1BirthYear}`, items: khaiTamClasses },
          ].map((group) => (
            <div className="cc-group-block" key={group.name}>
              <div className="cc-group-title-bar">
                <h3>{group.name} <span>({group.age})</span></h3>
                <span className="cc-group-birth">Sinh năm {group.birth}</span>
              </div>
              <div className="cc-class-grid">
                {group.items.map((item) => <ClassCard key={item.id} item={item} />)}
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3: "HỌC MÀ CHƠI — CHƠI MÀ HỌC" (4 BENTO CARDS)
      ══════════════════════════════════════════════════════════════ */}
      <section className="cc-curriculum-section" style={{ paddingBlock: "48px" }}>
        <div className="cc-shell">
          <div className="cc-section-header" style={{ marginBottom: "28px" }}>
            <div className="cc-eyebrow">
              <span className="cc-dot" />
              <span>PHƯƠNG PHÁP GIÁO LÝ MẦM NON</span>
            </div>
            <h2 className="cc-section-title" style={{ marginBottom: "8px" }}>
              Học Mà Chơi — <em>Chơi Mà Học</em>
            </h2>
            <p className="cc-section-desc">
              Khám phá đức tin qua các hoạt động trực quan sinh động, gần gũi với thế giới tuổi thơ.
            </p>
          </div>

          <div className="cc-topics-grid">
            {bentoCards.map((card, idx) => {
              const IconComp = card.icon;
              return (
                <div key={idx} className="cc-topic-card" style={{ padding: "20px" }}>
                  <div className="cc-topic-icon-wrap" style={{ marginBottom: "12px" }}>
                    <IconComp size={20} />
                  </div>
                  <h4 className="cc-topic-title" style={{ fontSize: "17px", marginBottom: "6px" }}>
                    {card.title}
                  </h4>
                  <p className="cc-topic-desc" style={{ fontSize: "13px", lineHeight: "1.5" }}>
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4: TIMELINE COMPACT 4 BƯỚC NHỊP SỐNG CHÚA NHẬT
      ══════════════════════════════════════════════════════════════ */}
      <section className="cc-timeline-section">
        <div className="cc-shell">
          <div className="cc-section-header" style={{ marginBottom: "24px" }}>
            <div className="cc-eyebrow">
              <span className="cc-dot" />
              <span>THỜI GIAN BIỂU CHÚA NHẬT</span>
            </div>
            <h2 className="cc-section-title" style={{ marginBottom: "8px" }}>
              Nhịp Sống <em>Chúa Nhật</em>
            </h2>
            <p className="cc-section-desc">
              Thời gian sinh hoạt sáng Chúa Nhật hàng tuần dành cho toàn bộ các em Khối Chiên Con.
            </p>
          </div>

          {/* Thanh ray ngang tiến trình Stepper (Desktop >= 768px) */}
          <div className="cc-stepper-track" aria-hidden="true">
            <div className="cc-stepper-line" />
            <div className="cc-stepper-nodes">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className={`cc-stepper-col ${step.highlight ? "highlight" : ""}`}>
                  <div className="cc-stepper-node">{idx + 1}</div>
                  <span className="cc-stepper-time">{step.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lưới thẻ thời gian biểu (Mobile: Trục dọc, Desktop: 4 Cards) */}
          <div className="cc-compact-timeline">
            {timelineSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className={`cc-time-chip ${step.highlight ? "highlight" : ""}`}>
                  <span className="cc-time-node" aria-hidden="true">{idx + 1}</span>
                  <div className="cc-time-card">
                    <div className="cc-time-header">
                      <span className="cc-time-badge">{step.time}</span>
                      {step.tag && (
                        <span className="cc-time-tag">{step.tag}</span>
                      )}
                    </div>
                    <div className="cc-time-content">
                      <span className="cc-time-label">{step.label}</span>
                      <span className="cc-time-sub">{step.sub}</span>
                    </div>
                  </div>
                </div>
                {idx < timelineSteps.length - 1 && (
                  <span className="cc-time-arrow" aria-hidden="true">→</span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="cc-timeline-footer-note">
            <ShieldCheck size={18} style={{ color: "var(--cc-accent-badge)", flexShrink: 0 }} aria-hidden="true" />
            <span><strong>Lưu ý an toàn:</strong> Phụ huynh đưa đón bé trực tiếp tại sảnh Nhà Thờ và cửa phòng học để bảo đảm an toàn.</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5: GÓC ĐỒNG HÀNH GIA ĐÌNH (BENTO HUB 4 THẺ CHUẨN)
      ══════════════════════════════════════════════════════════════ */}
      <section id="dong-hanh" className="cc-family-section">
        <div className="cc-shell">
          <div className="cc-section-header">
            <div className="cc-eyebrow">
              <span className="cc-dot" />
              <span>GÓC PHỤ HUYNH &amp; HỘI THÁNH TẠI GIA · LỨA TUỔI MẦM NON</span>
            </div>
            <h2 className="cc-section-title">
              Đồng Hành Cùng Bé <em>Bập Bẹ Bước Theo Chúa</em>
            </h2>
            <p className="cc-section-desc">
              Ở lứa tuổi 5–7, gia đình chính là trường học đức tin đầu tiên và quan trọng nhất. Tình yêu thương, lời kinh tối và gương sáng của cha mẹ là hạt giống gieo vào tâm hồn trong trắng của các con.
            </p>
          </div>

          {/* Bento Family Hub (2 Cột: 3 Cột Trụ bên trái + Sanctuary Box bên phải) */}
          <div className="cc-family-bento-grid">
            {/* Cột trái: 3 Trụ cột hành động */}
            <div className="cc-pillars-stack">
              {familyPillars.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={idx}
                    className={`cc-pillar-card pillar-${item.key || (idx === 0 ? "green" : idx === 1 ? "purple" : "amber")}`}
                  >
                    <div className="cc-pillar-top">
                      <div className="cc-pillar-header-left">
                        <div className="cc-pillar-icon-wrap">
                          <IconComp size={22} />
                        </div>
                        <h4 className="cc-pillar-title">{item.title}</h4>
                      </div>
                      <span className="cc-pillar-badge">{item.badge}</span>
                    </div>
                    <p className="cc-pillar-desc">{item.desc}</p>
                    <div className="cc-pillar-action-tip">
                      <strong>Gợi ý cha mẹ:</strong> {item.tip}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cột phải: Sanctuary Box (Mái Ấm & Checklist) */}
            <div className="cc-sanctuary-box">
              <div>
                <div className="cc-sanctuary-eyebrow">
                  <Sparkles size={14} aria-hidden="true" />
                  <span>{sanctuaryData.eyebrow}</span>
                </div>

                <div className="cc-sanctuary-quote-card">
                  <div className="cc-sanctuary-quote-header">
                    <Quote size={18} className="cc-sanctuary-quote-icon" aria-hidden="true" />
                    <span className="cc-sanctuary-quote-author">{sanctuaryData.author}</span>
                  </div>
                  <blockquote className="cc-sanctuary-quote-text">
                    {sanctuaryData.quote}
                  </blockquote>
                </div>

                <div className="cc-checklist-section-title">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>{sanctuaryData.checklistTitle}</span>
                </div>

                <ul className="cc-checklist-list">
                  {sanctuaryData.checklist.map((chk, cIdx) => (
                    <li key={cIdx} className="cc-checklist-item">
                      <span className="cc-check-icon">✓</span>
                      <span><strong>{chk.label}:</strong> {chk.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hộp liên hệ hỗ trợ */}
              <div className="cc-support-note-box">
                <div className="cc-support-note-text">
                  <strong>{sanctuaryData.supportTitle}</strong><br />
                  {sanctuaryData.supportDesc}
                </div>
                <Link to={sanctuaryData.supportBtnLink} className="cc-support-note-btn">
                  <span>{sanctuaryData.supportBtnText}</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 6: CẨM NANG PHỤ HUYNH (ACCORDION FAQ TINH GỌN)
      ══════════════════════════════════════════════════════════════ */}
      <section className="cc-faq-section" style={{ paddingBlock: "48px" }}>
        <div className="cc-shell">
          <div className="cc-faq-wrapper">
            <div className="cc-faq-header">
              <h3 className="cc-faq-title">
                Giải Đáp Thắc Mắc Khối Chiên Con (FAQ)
              </h3>
              <p className="cc-faq-desc">
                Các thông tin cần thiết về độ tuổi, phương pháp giáo dục mầm non Công giáo và giờ giấc đưa đón bé.
              </p>
            </div>

            <div className="cc-faq-list">
              {faqs.map((item, idx) => {
                const isOpen = openFaq === idx;
                const faqAnsId = `cc-faq-ans-${idx}`;
                const padIdx = String(idx + 1).padStart(2, "0");
                return (
                  <div key={idx} className={`cc-faq-item ${isOpen ? "active" : ""}`}>
                    <button
                      type="button"
                      className="cc-faq-btn"
                      aria-expanded={isOpen}
                      aria-controls={faqAnsId}
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                    >
                      <div className="cc-faq-question-wrap">
                        <span className="cc-faq-q-badge">{padIdx}</span>
                        <span>{item.q}</span>
                      </div>
                      <ChevronDown
                        size={18}
                        aria-hidden="true"
                        className="cc-faq-chevron"
                      />
                    </button>
                    {isOpen && (
                      <div id={faqAnsId} className="cc-faq-answer">
                        <p>{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 6: CTA BANNER ĐĂNG KÝ TUYỂN SINH & LIÊN HỆ
          ══════════════════════════════════════════════════════════════ */}
          <div className="cc-cta-banner">
            <div className="cc-cta-glow" aria-hidden="true" />

            <div className="cc-cta-badge">
              <span className="cc-cta-badge-icon" aria-hidden="true">🐑</span>
              <span>NIÊN KHÓA {academicYearSpaced} · GIÁO XỨ AN NGÃI</span>
            </div>

            <h3 className="cc-cta-title">
              Ươm Mầm Đức Tin &amp; Niềm Vui Tuổi Thơ Cùng Bé Yêu
            </h3>

            <p className="cc-cta-desc">
              Vườn Trẻ &amp; Khai Tâm là ngôi nhà thứ hai chan hòa tình yêu thương của Chúa Giêsu. Xứ đoàn Mẹ Mân Côi hân hoan chào đón quý phụ huynh gửi gắm các thiên thần nhỏ để cùng bé lớn lên trong ơn nghĩa Chúa.
            </p>

            <div className="cc-cta-actions">
              {/* Nút chính 52px chiếm vị trí nổi bật nhất */}
              <Link to="/tuyển-sinh#dang-ky" className="cc-cta-primary-btn">
                <Sparkles size={18} aria-hidden="true" className="cc-cta-sparkle" />
                <span>Đăng Ký Ghi Danh Cho Bé</span>
                <ArrowRight size={18} aria-hidden="true" className="cc-cta-arrow" />
              </Link>

              {/* 2 nút phụ hỗ trợ thanh lịch, đối xứng */}
              <div className="cc-cta-secondary-group">
                <Link to="/lịch-học" className="cc-cta-secondary-btn">
                  <Clock size={15} aria-hidden="true" />
                  <span>Xem Lịch Ca 2</span>
                </Link>
                <Link to="/liên-hệ" className="cc-cta-secondary-btn">
                  <Church size={15} aria-hidden="true" />
                  <span>Tư Vấn &amp; Hỗ Trợ</span>
                </Link>
              </div>
            </div>

            <div className="cc-cta-note">
              <span>✦ Ghi danh trực tuyến thuận tiện · Ban Giáo lý sẽ liên hệ xác nhận và đón bé ngày khai giảng.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
function ClassCard({ item }) {
  const accepting = item.status === "Đang tuyển sinh";
  return (
    <article className={`cc-class-card ${getCardTheme(item.id)}`}>
      {/* TẦNG 1: Head - Badge mã lớp & Vị trí phòng */}
      <div className="cc-bento-card-head">
        <span className="cc-bento-class-code">
          {getClassCode(item.name)}
        </span>
        <span className="cc-bento-room-badge">
          <MapPin size={13} aria-hidden="true" />
          <span>{getRoomLocation(item.room)}</span>
        </span>
      </div>

      {/* TẦNG 2: Tiêu đề lớp & Dải chỉ số Sĩ số / Độ tuổi */}
      <div>
        <h4 className="cc-bento-class-title">{item.name}</h4>
        <div className="cc-bento-stats-strip">
          <span className="cc-bento-stat-chip">
            <Users size={13} aria-hidden="true" />
            <span>Sĩ số: <strong>{item.studentsCount != null ? `${item.studentsCount} em` : "Đang tuyển sinh"}</strong></span>
          </span>
          <span className="cc-bento-stat-chip">
            <Calendar size={13} aria-hidden="true" />
            <span>Độ tuổi: <strong>{item.ageText} ({item.birthYear})</strong></span>
          </span>
        </div>
      </div>

      {/* TẦNG 3: Đội ngũ GLV Phụ trách */}
      <div className="cc-bento-teacher-box">
        <div className="cc-bento-teacher-label">
          <ShieldCheck size={13} aria-hidden="true" />
          <span>GLV Phụ trách ({item.teachers.length})</span>
        </div>
        <div className="cc-bento-teacher-pills">
          {item.teachers.map((t, idx) => (
            <span key={idx} className="cc-bento-teacher-pill">
              {formatTeacherName(t)}
            </span>
          ))}
        </div>
      </div>

      {/* TẦNG 4: Trọng tâm huấn giáo mầm non */}
      <div className="cc-bento-focus-box">
        <div className="cc-bento-focus-badge">{item.levelBadge}</div>
        <p className="cc-bento-focus-desc">{item.focus}</p>
      </div>

      {/* TẦNG 5: Footer - Giờ học & Trạng thái nề nếp / Tuyển sinh */}
      <div className="cc-bento-card-foot">
        <span className="cc-bento-time">
          <Clock size={13} aria-hidden="true" />
          <span>{item.time} (Ca 2)</span>
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {accepting ? (
            <span className="cc-bento-status-enroll">
              ● Đang tuyển sinh
            </span>
          ) : (
            <span className="cc-bento-status-active">
              ● {item.status}
            </span>
          )}
          <Link
            to={accepting ? "/tuyển-sinh#dang-ky" : "/liên-hệ"}
            className="cc-bento-action-link"
            title={accepting ? `Đăng ký lớp ${item.name}` : `Liên hệ về lớp ${item.name}`}
          >
            <span>{accepting ? "Đăng ký" : "Hỏi lớp"}</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
