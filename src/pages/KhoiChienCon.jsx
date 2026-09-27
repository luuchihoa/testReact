import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  Users, BookOpen, Clock, MapPin,
  Sparkles, ChevronDown,
  Heart, ShieldCheck, ArrowRight,
  Church, CheckCircle2, Quote,
  Calendar, CalendarDays, Music, Palette, Baby
} from "lucide-react";
import { getKhoiChienConData } from "../utils/academicYear.js";
import {
  getKhoiConfig,
  formatTeacherName,
  getRoomLocation,
  formatShiftName,
  getSectorTimeline,
  asset
} from "../features/khoi/khoiConfig.js";
import { getEnrollmentStatus, getSectorEnrollmentCTA } from "../features/enrollment/enrollmentConfig.js";
import { useKhoiMotion } from "../features/khoi/useKhoiMotion.js";
import KhoiOverviewBar from "../features/khoi/KhoiOverviewBar.jsx";
import "./KhoiChienCon.css";

export default function KhoiChienCon() {
  const config = getKhoiConfig("chien-con");
  const data = getKhoiChienConData();
  const {
    academicYear,
    vuonTreBirthYear,
    khaiTam1BirthYear,
    khaiTam2BirthYear,
    classes
  } = data;

  const [openFaq, setOpenFaq] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const { shouldReduceMotion, heroContainerVariants, heroItemVariants, sectionRevealProps } = useKhoiMotion();

  // Thống kê động từ nguồn dữ liệu chuẩn
  const totalClasses = classes.length;
  const totalTeachers = new Set(classes.flatMap((c) => c.teachers)).size;
  const vuonTreClasses = classes.filter((c) => c.group === "Vườn Trẻ");
  const khaiTam1Classes = classes.filter((c) => c.group === "Khai Tâm 1");
  const khaiTam2Classes = classes.filter((c) => c.group === "Khai Tâm 2");

  const FloatingIcon = config?.hero?.floatingBadge?.icon || Heart;

  // Lịch sinh hoạt tập trung (CENTRAL_MASS & CA_HOC)
  const timelineData = getSectorTimeline(config, classes);
  const timelineSteps = timelineData.steps;

  // Trạng thái tuyển sinh thực tế từ module tuyển sinh trung tâm
  const enrollmentStatus = getEnrollmentStatus();
  const enrollmentCTA = getSectorEnrollmentCTA({ status: enrollmentStatus, sectorId: "chien-con" });

  useEffect(() => {
    const prevTitle = document.title;
    document.title = `Khối Khai Tâm (${config?.grades || "Vườn Trẻ & Khai Tâm"}) · Khăn Xanh Lá Trơn · Niên Khóa ${academicYear} | Giáo xứ An Ngãi`;
    return () => {
      document.title = prevTitle;
    };
  }, [academicYear, config]);

  // Cuộn mượt và chuyển focus đến danh sách lớp (tôn trọng reduced motion)
  const handleScrollToClasses = (e) => {
    e.preventDefault();
    const target = document.getElementById("danh-sach-lop");
    if (target) {
      target.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",
        block: "start"
      });
      target.focus({ preventScroll: true });
    }
  };

  // 4 Thẻ Bento trực quan "Học Mà Chơi — Chơi Mà Học" (ngắn gọn, súc tích)
  const bentoCards = [
    {
      icon: Music,
      title: "Hát & Cử Điệu",
      desc: "Học qua giai điệu vui tươi và cử điệu ngộ nghĩnh, giúp bé thêm yêu mến Nhà Chúa mỗi Chúa Nhật.",
      colorClass: "topic-emerald"
    },
    {
      icon: Palette,
      title: "Tô Màu & Thủ Công",
      desc: "Rèn luyện đôi tay khéo léo và trí tưởng tượng qua tranh vẽ Kinh Thánh và làm thiệp dễ thương.",
      colorClass: "topic-sky"
    },
    {
      icon: BookOpen,
      title: "Kể Chuyện Trực Quan",
      desc: "Làm quen với Chúa Giêsu qua búp bê kể chuyện, tranh ảnh màu sắc và những bài học đơn sơ.",
      colorClass: "topic-amber"
    },
    {
      icon: Heart,
      title: "Kinh Nguyện Đơn Sơ",
      desc: "Tập làm Dấu Thánh Giá nghiêm trang, thuộc lòng Kinh Lạy Cha & Kính Mừng để cùng đọc tại gia đình.",
      colorClass: "topic-rose"
    }
  ];

  // 3 Trụ Cột Hành Động Đồng Hành Mầm Non (Cột Trái)
  const familyPillars = [
    {
      title: "Dạy Con Dấu Thánh Giá Đầu Đời",
      badge: "Mỗi Ngày",
      desc: "Cùng bé làm dấu Thánh Giá chậm rãi trước bữa ăn và trước giờ ngủ. Tập cho con quen thuộc với tên Chúa Giêsu, Mẹ Maria và Thiên Thần Bản Mệnh qua những bài hát cử điệu vui tươi.",
      tip: "Cầm tay bé uốn nắn từng cử chỉ làm Dấu Thánh Giá trang nghiêm và dành cho con cái ôm ấm áp sau mỗi lời kinh.",
      icon: Heart
    },
    {
      title: "Nuôi Dưỡng Trái Tim Yêu Thương",
      badge: "Tại Gia",
      desc: "Kể cho bé nghe những mẩu chuyện Kinh Thánh ngắn bằng tranh tô màu sinh động. Dạy bé biết nói lời 'cảm ơn', 'xin lỗi', biết chia sẻ đồ chơi với bạn và vâng lời ông bà cha mẹ.",
      tip: "Dành 5–10 phút mỗi tối cùng bé xem tranh Phúc Âm Thiếu Nhi và hỏi cảm nghĩ giản dị của con về Chúa Giêsu.",
      icon: Sparkles
    },
    {
      title: "Tập Cho Bé Tác Phong Đi Nhà Thờ",
      badge: "Sáng Chúa Nhật",
      desc: "Đưa bé đến nhà thờ đúng giờ, nhắc bé mặc áo trắng tề chỉnh và dạy bé biết cúi đầu chào Chúa trước Nhà Tạm. Giúp bé giữ trật tự và hòa cùng lời ca tiếng hát trong Thánh Lễ.",
      tip: "Nhắc con đi vệ sinh trước giờ lễ và mang theo bình nước cá nhân để bé không bị bỡ ngỡ khi vào lớp học.",
      icon: Church
    }
  ];

  // Sanctuary Box (Lời Chúa & Checklist)
  const sanctuaryData = {
    eyebrow: "Gia Đình Là Cái Nôi Đầu Tiên Của Đức Tin",
    quote: "Cứ để trẻ nhỏ đến với Thầy, đừng ngăn cấm chúng, vì Nước Trời thuộc về những ai giống như chúng.",
    author: "Tin Mừng Theo Thánh Mátthêu (Mt 19, 14)",
    checklistTitle: "3 Việc Nhỏ Ba Mẹ Chuẩn Bị Cho Bé Sáng Chúa Nhật",
    checklist: [
      { label: "Đúng Giờ", text: "Đưa bé đến sảnh Thánh đường trước 07h45 để tập trung cùng các bạn và quý Soeur." },
      { label: "Lễ Phục", text: "Trang phục áo trắng/lễ phục sạch sẽ, mang giày sandal hoặc giày quai hậu gọn gàng." },
      { label: "Đón Bé", text: "Ba mẹ đón bé tại cửa Phòng Giáo lý đúng 10h00 sau khi kết thúc giờ giáo lý sinh hoạt." }
    ],
    supportTitle: "Ba mẹ cần hỗ trợ riêng về tâm lý hoặc sức khỏe của bé?",
    supportDesc: "Quý phụ huynh vui lòng trao đổi trực tiếp cùng Quý Soeur hoặc Giáo lý viên phụ trách lớp.",
    supportBtnText: "Tư Vấn GLV",
    supportBtnLink: "/liên-hệ"
  };

  // Cẩm nang FAQ cho Phụ huynh Khối Khai Tâm
  const faqs = [
    {
      q: `Bé mấy tuổi thì đủ điều kiện đăng ký học Khối Khai Tâm niên khóa ${academicYear}?`,
      a: `Dành cho bé ${config?.ageText || "5 – 7 tuổi"}: Lớp Vườn Trẻ (5 tuổi · Sinh năm ${vuonTreBirthYear}), Lớp Khai Tâm 1 (6 tuổi · Sinh năm ${khaiTam1BirthYear}) và Lớp Khai Tâm 2 (7 tuổi · Sinh năm ${khaiTam2BirthYear}).`
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
      a: "Khối Khai Tâm sinh hoạt vào Ca 2 Chúa Nhật: 07h45 đón bé tại sảnh Nhà Thờ ➔ 08h00 dự Thánh Lễ ➔ 09h15 học Giáo lý ➔ 10h00 phụ huynh đón bé tại cửa Phòng Giáo lý."
    },
    {
      q: "Phụ huynh cần chuẩn bị những gì cho bé trong ba lô khi đi học giáo lý?",
      a: "Ba mẹ chỉ cần chuẩn bị cho bé một bình nước uống cá nhân nhỏ, mang giày dép quai hậu gọn gàng và mặc lễ phục/áo trắng sạch sẽ. Vở tập tô, sáp màu và tài liệu học tập đều được Xứ đoàn trang bị sẵn tại Phòng Giáo lý."
    }
  ];

  return (
    <div className="khoi-page theme-chien-con">
      {/* ══════════════════════════════════════════════════════════════
          HERO SECTION: 2 CỘT VISUAL-FIRST ĐỒNG BỘ CONFIG
      ══════════════════════════════════════════════════════════════ */}
      <section className="khoi-hero">
        <div className="khoi-shell">
          <Motion.div
            className="khoi-hero-grid"
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Cột trái: Nhãn, Tiêu đề lớn, Câu Lời Chúa, Mô tả & Nút CTA */}
            <div className="khoi-hero-left">
              <Motion.div variants={heroItemVariants}>
                <div className="khoi-hero-pill-badge">
                  <span aria-hidden="true">{config?.hero?.pillIcon || "🐑"}</span>
                  <span>{config?.hero?.pillText || `${config?.nganh || "Ngành Ấu"} HTDC · ${config?.name || "Khối Chiên Con"}`}</span>
                </div>
              </Motion.div>

              <Motion.h1 variants={heroItemVariants} className="khoi-hero-title">
                {config?.hero?.titleLine1 || "Gieo Mầm Đức Tin"}<br />
                <em>{config?.hero?.titleLine2 || "Tuổi Thơ Trong Tay Chúa"}</em>
              </Motion.h1>

              <Motion.div variants={heroItemVariants} className="cc-hero-verse">
                <p className="cc-hero-verse-quote">
                  “Cứ để trẻ nhỏ đến với Thầy... vì Nước Trời là của những ai giống như chúng.”
                </p>
                <span className="cc-hero-verse-cite">Tin Mừng Thánh Mátthêu (Mt 19, 14)</span>
              </Motion.div>

              <Motion.p variants={heroItemVariants} className="khoi-hero-desc">
                {config?.hero?.desc || "Bước đầu làm quen với Nhà Chúa qua những khúc hát, cử điệu sinh động và bài học đức tin đơn sơ đầy ắp tình yêu thương."}
              </Motion.p>

              <Motion.div variants={heroItemVariants} className="khoi-hero-actions">
                <a
                  href="#danh-sach-lop"
                  onClick={handleScrollToClasses}
                  className="khoi-btn-primary"
                >
                  <span>Xem {totalClasses} Lớp Học</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </a>
                <Link to={enrollmentCTA.heroLink} className="khoi-btn-secondary">
                  <Sparkles size={17} aria-hidden="true" />
                  <span>{enrollmentCTA.heroText}</span>
                </Link>
              </Motion.div>
            </div>

            {/* Cột phải: Khung ảnh Khối Chiên Con & Floating Badge */}
            <Motion.div variants={heroItemVariants}>
              <div className="khoi-hero-image-card">
                <img
                  src={config?.hero?.image || asset("/images/khoikhaitam-anngai.jpg")}
                  alt={config?.hero?.imageAlt || "Thiếu nhi Khối Khai Tâm Giáo xứ An Ngãi"}
                  className="khoi-hero-img"
                  loading="eager"
                  fetchPriority="high"
                />
                <div className="khoi-floating-badge">
                  <div className="khoi-floating-badge-icon" aria-hidden="true">
                    <FloatingIcon size={20} />
                  </div>
                  <div>
                    <div className="khoi-floating-badge-title">
                      {config?.hero?.floatingBadge?.title || "Mầm Non Đức Tin"}
                    </div>
                    <div className="khoi-floating-badge-sub">
                      {config?.hero?.floatingBadge?.sub || "Xứ đoàn Mẹ Mân Côi · Giáo xứ An Ngãi"}
                    </div>
                  </div>
                </div>
              </div>
            </Motion.div>
          </Motion.div>

          <KhoiOverviewBar
            ariaLabel="Tổng quan Khối Khai Tâm"
            age={config?.tuoi || config?.ageText || "5 – 7 tuổi"}
            ageDetail={`Sinh năm ${khaiTam2BirthYear}–${vuonTreBirthYear}`}
            classCount={totalClasses}
            classDetail={config?.grades || "Vườn Trẻ và Khai Tâm"}
            teacherCount={totalTeachers}
            teamDetail="Quý Soeur và Giáo lý viên"
            timeline={timelineData}
            motionProps={sectionRevealProps}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2: DANH SÁCH LỚP HỌC THỰC TẾ
      ══════════════════════════════════════════════════════════════ */}
      <section
        id="danh-sach-lop"
        tabIndex={-1}
        className="khoi-section"
      >
        <div className="khoi-shell">
          <Motion.div className="khoi-section-header" {...sectionRevealProps}>
            <div className="khoi-eyebrow">
              <span className="khoi-dot" aria-hidden="true" />
              <span>DANH SÁCH LỚP NIÊN KHÓA {academicYear}</span>
            </div>
            <h2 className="khoi-section-title">
              <span>Khối Khai Tâm</span>{" "}
              <em className="block sm:inline whitespace-nowrap">Giáo xứ An Ngãi</em>
            </h2>
            <p className="khoi-section-desc">
              Phòng Giáo lý, quý Soeur và Giáo lý viên phụ trách {totalClasses} lớp học thuộc Khối Khai Tâm (Khăn Xanh Lá Trơn HTDC).
            </p>
          </Motion.div>

          {/* Bộ lọc phân tầng khối học */}
          <div className="khoi-stage-filter-bar khoi-stage-filter-bar--three" role="group" aria-label="Lọc lớp Khối Khai Tâm">
            <button
              type="button"
              className={`khoi-filter-pill ${selectedGroup === "all" ? "active" : ""}`}
              aria-pressed={selectedGroup === "all"}
              onClick={() => setSelectedGroup("all")}
            >
              <span className="khoi-filter-label">Tất cả</span>
              <span className="khoi-filter-meta">{totalClasses} lớp</span>
            </button>
            <button
              type="button"
              className={`khoi-filter-pill ${selectedGroup === "vt" ? "active" : ""}`}
              aria-pressed={selectedGroup === "vt"}
              onClick={() => setSelectedGroup("vt")}
            >
              <span className="khoi-filter-label">Vườn Trẻ</span>
              <span className="khoi-filter-meta">5 tuổi · {vuonTreClasses.length} lớp</span>
            </button>
            <button
              type="button"
              className={`khoi-filter-pill ${selectedGroup === "kt" ? "active" : ""}`}
              aria-pressed={selectedGroup === "kt"}
              onClick={() => setSelectedGroup("kt")}
            >
              <span className="khoi-filter-label">Khai Tâm</span>
              <span className="khoi-filter-meta">6–7 tuổi · {khaiTam1Classes.length + khaiTam2Classes.length} lớp</span>
            </button>
          </div>

          <div role="status" aria-live="polite" className="sr-only">
            {selectedGroup === "all" && `Đang hiển thị tất cả ${totalClasses} lớp học`}
            {selectedGroup === "vt" && `Đang hiển thị lớp Vườn Trẻ`}
            {selectedGroup === "kt" && `Đang hiển thị ${khaiTam1Classes.length + khaiTam2Classes.length} lớp Khai Tâm`}
          </div>

          {/* NHÓM 1: VƯỜN TRẺ (5 TUỔI) */}
          {(selectedGroup === "all" || selectedGroup === "vt") && (
            <Motion.div className="khoi-group-block" {...sectionRevealProps}>
              <div className="khoi-stage-header">
                <div className="khoi-stage-title-wrap">
                  <span className="khoi-stage-num" aria-hidden="true">01</span>
                  <div>
                    <h3 className="khoi-stage-title">Lớp Vườn Trẻ</h3>
                    <p className="khoi-stage-subtitle">
                      Mầm non 5 tuổi · Làm quen Nhà Chúa qua câu chuyện và bài hát
                    </p>
                  </div>
                </div>
                <div className="khoi-stage-pills">
                  <span className="khoi-stage-pill">5 Tuổi</span>
                  <span className="khoi-stage-pill">Sinh năm {vuonTreBirthYear}</span>
                  <span className="khoi-stage-pill">{vuonTreClasses.length} Lớp (Nhà thờ bên nữ)</span>
                </div>
              </div>

              <div className="khoi-vuontre-featured-wrap">
                {vuonTreClasses.map((item) => (
                  <div key={item.id} className="khoi-class-card card-vuontre card-vuontre-featured">
                    {/* TẦNG 1: Head - Badge mã lớp & Vị trí phòng */}
                    <div className="khoi-card-head">
                      <span className="khoi-class-code">
                        VT
                      </span>
                      <span className="khoi-room-badge">
                        <MapPin size={13} aria-hidden="true" />
                        <span>{getRoomLocation(item.room)}</span>
                      </span>
                    </div>

                    <div className="card-vuontre-featured-body">
                      {/* Cột 1: Thông tin lớp, sĩ số, GLV */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="khoi-class-title">{item.name}</h4>
                          <div className="khoi-stats-strip">
                            <span className="khoi-stat-chip">
                              <Users size={13} aria-hidden="true" />
                              <span>Sĩ số: <strong>{item.studentsCount != null ? `${item.studentsCount} em` : "Đang tuyển sinh"}</strong></span>
                            </span>
                            <span className="khoi-stat-chip">
                              <Calendar size={13} aria-hidden="true" />
                              <span>Độ tuổi: <strong>{item.ageText} ({item.birthYear})</strong></span>
                            </span>
                          </div>
                        </div>

                        {/* Đội ngũ GLV Phụ trách */}
                        <div className="khoi-teacher-box">
                          <div className="khoi-teacher-label">
                            <ShieldCheck size={13} aria-hidden="true" />
                            <span>GLV Phụ trách ({item.teachers.length})</span>
                          </div>
                          <div className="khoi-teacher-pills">
                            {item.teachers.map((t) => (
                              <span key={`${item.id}-${t}`} className="khoi-teacher-pill">
                                {formatTeacherName(t)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Cột 2: Trọng tâm huấn giáo, thời gian, đồng hành phụ huynh */}
                      <div className="space-y-3">
                        {/* Trọng tâm huấn giáo mầm non */}
                        <div className="khoi-focus-box">
                          <div className="khoi-focus-badge">{item.levelBadge}</div>
                          <p className="khoi-focus-desc">{item.focus}</p>
                        </div>

                        {/* Thời gian học & Trạng thái */}
                        <div className="khoi-card-foot">
                          <span className="khoi-card-time">
                            <Clock size={13} aria-hidden="true" />
                            <span>{item.time} ({formatShiftName(item.ca)})</span>
                          </span>
                          <span className="khoi-card-status">
                            ● {item.status}
                          </span>
                        </div>

                        <div className="card-vuontre-notice">
                          <Heart size={14} className="shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" aria-hidden="true" />
                          <span>Đặc thù mầm non: Phụ huynh có thể ngồi cùng và đồng hành cùng bé trong các giờ học đầu tiên để bé cảm thấy an tâm và vui vẻ.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Motion.div>
          )}

          {/* NHÓM 2: KHỐI KHAI TÂM (6–7 TUỔI) */}
          {(selectedGroup === "all" || selectedGroup === "kt") && (
            <Motion.div className="khoi-group-block" {...sectionRevealProps}>
              <div className="khoi-stage-header">
                <div className="khoi-stage-title-wrap">
                  <span className="khoi-stage-num" aria-hidden="true">02</span>
                  <div>
                    <h3 className="khoi-stage-title">Khối Khai Tâm</h3>
                    <p className="khoi-stage-subtitle">
                      Khai Tâm 1 &amp; 2 · Đặt nền tảng Kinh nguyện và Lời Chúa
                    </p>
                  </div>
                </div>
                <div className="khoi-stage-pills">
                  <span className="khoi-stage-pill">6 – 7 Tuổi</span>
                  <span className="khoi-stage-pill">Sinh năm {khaiTam2BirthYear} – {khaiTam1BirthYear}</span>
                  <span className="khoi-stage-pill">{khaiTam1Classes.length + khaiTam2Classes.length} Lớp (P1, P2)</span>
                </div>
              </div>

              <div className="khoi-class-grid khoi-class-grid--two">
                {[...khaiTam1Classes, ...khaiTam2Classes].map((item) => (
                  <div key={item.id} className="khoi-class-card">
                    {/* TẦNG 1: Head - Badge mã lớp & Vị trí phòng */}
                    <div className="khoi-card-head">
                      <span className="khoi-class-code">
                        {item.name.replace("Lớp Khai Tâm ", "KT ")}
                      </span>
                      <span className="khoi-room-badge">
                        <MapPin size={13} aria-hidden="true" />
                        <span>{getRoomLocation(item.room)}</span>
                      </span>
                    </div>

                    {/* TẦNG 2: Tiêu đề lớp & Dải chỉ số Sĩ số / Độ tuổi */}
                    <div>
                      <h4 className="khoi-class-title">{item.name}</h4>
                      <div className="khoi-stats-strip">
                        <span className="khoi-stat-chip">
                          <Users size={13} aria-hidden="true" />
                          <span>Sĩ số: <strong>{item.studentsCount != null ? `${item.studentsCount} em` : "Đang tuyển sinh"}</strong></span>
                        </span>
                        <span className="khoi-stat-chip">
                          <Calendar size={13} aria-hidden="true" />
                          <span>Độ tuổi: <strong>{item.ageText} ({item.birthYear})</strong></span>
                        </span>
                      </div>
                    </div>

                    {/* TẦNG 3: Đội ngũ GLV Phụ trách */}
                    <div className="khoi-teacher-box">
                      <div className="khoi-teacher-label">
                        <ShieldCheck size={13} aria-hidden="true" />
                        <span>GLV Phụ trách ({item.teachers.length})</span>
                      </div>
                      <div className="khoi-teacher-pills">
                        {item.teachers.map((t) => (
                          <span key={`${item.id}-${t}`} className="khoi-teacher-pill">
                            {formatTeacherName(t)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* TẦNG 4: Trọng tâm huấn giáo mầm non */}
                    <div className="khoi-focus-box">
                      <div className="khoi-focus-badge">{item.levelBadge}</div>
                      <p className="khoi-focus-desc">{item.focus}</p>
                    </div>

                    {/* TẦNG 5: Footer - Giờ học & Trạng thái nề nếp / Tuyển sinh */}
                    <div className="khoi-card-foot">
                      <span className="khoi-card-time">
                        <Clock size={13} aria-hidden="true" />
                        <span>{item.time} ({formatShiftName(item.ca)})</span>
                      </span>
                      <span className="khoi-card-status">
                        ● {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Motion.div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3: "HỌC MÀ CHƠI — CHƠI MÀ HỌC" (4 BENTO CARDS)
      ══════════════════════════════════════════════════════════════ */}
      <section className="cc-curriculum-section">
        <div className="khoi-shell">
          <Motion.div className="khoi-section-header" {...sectionRevealProps}>
            <div className="khoi-eyebrow">
              <span className="khoi-dot" aria-hidden="true" />
              <span>PHƯƠNG PHÁP GIÁO LÝ MẦM NON</span>
            </div>
            <h2 className="khoi-section-title">
              Học Mà Chơi — <em>Chơi Mà Học</em>
            </h2>
            <p className="khoi-section-desc">
              Khám phá đức tin qua các hoạt động trực quan sinh động, gần gũi với thế giới tuổi thơ.
            </p>
          </Motion.div>

          <Motion.div className="cc-topics-grid" {...sectionRevealProps}>
            {bentoCards.map((card) => {
              const IconComp = card.icon;
              return (
                <div key={card.title} className={`cc-topic-card ${card.colorClass}`}>
                  <div className="cc-topic-icon-wrap" aria-hidden="true">
                    <IconComp size={20} />
                  </div>
                  <h3 className="cc-topic-title">
                    {card.title}
                  </h3>
                  <p className="cc-topic-desc">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </Motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4: TIMELINE 4 BƯỚC NHỊP SỐNG CHÚA NHẬT
      ══════════════════════════════════════════════════════════════ */}
      <section className="khoi-section khoi-timeline-section">
        <div className="khoi-shell">
          <Motion.div className="khoi-section-header" {...sectionRevealProps}>
            <div className="khoi-eyebrow">
              <span className="khoi-dot" aria-hidden="true" />
              <span>THỜI GIAN BIỂU CHÚA NHẬT ({timelineData.shiftName.toUpperCase()})</span>
            </div>
            <h2 className="khoi-section-title">
              Nhịp Sống <em>Chúa Nhật</em>
            </h2>
            <p className="khoi-section-desc">
              Thời gian sinh hoạt sáng Chúa Nhật hàng tuần dành cho toàn bộ các em {config?.name || "Khối Chiên Con"}.
            </p>
          </Motion.div>

          {/* Thanh ray ngang tiến trình Stepper (Desktop >= 768px) */}
          <div className="cc-stepper-track" aria-hidden="true">
            <div className="cc-stepper-line" />
            <div className="cc-stepper-nodes">
              {timelineSteps.map((step, idx) => (
                <div key={`stepper-${step.time}`} className={`cc-stepper-col ${step.highlight ? "highlight" : ""}`}>
                  <div className="cc-stepper-node">{idx + 1}</div>
                  <span className="cc-stepper-time">{step.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lưới thẻ thời gian biểu */}
          <Motion.div className="khoi-compact-timeline" {...sectionRevealProps}>
            {timelineSteps.map((step) => (
              <div key={`card-${step.time}`} className={`khoi-time-card ${step.highlight ? "highlight" : ""}`}>
                <div className="khoi-time-header">
                  <span className="khoi-time-badge">{step.time}</span>
                  {step.tag && (
                    <span className="khoi-time-tag">{step.tag}</span>
                  )}
                </div>
                <div>
                  <h4 className="khoi-time-label">{step.label}</h4>
                  <p className="khoi-time-sub">{step.sub}</p>
                </div>
              </div>
            ))}
          </Motion.div>

          <div className="khoi-timeline-note">
            <ShieldCheck size={18} className="khoi-timeline-note-icon" aria-hidden="true" />
            <span><strong>Lưu ý an toàn:</strong> Phụ huynh đưa đón bé trực tiếp tại sảnh Nhà Thờ và cửa Phòng Giáo lý để bảo đảm an toàn.</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5: GÓC ĐỒNG HÀNH GIA ĐÌNH (BENTO HUB 4 THẺ CHUẨN)
      ══════════════════════════════════════════════════════════════ */}
      <section id="dong-hanh" tabIndex={-1} className="khoi-section">
        <div className="khoi-shell">
          <Motion.div className="khoi-section-header" {...sectionRevealProps}>
            <div className="khoi-eyebrow">
              <span className="khoi-dot" aria-hidden="true" />
              <span>GÓC PHỤ HUYNH &amp; HỘI THÁNH TẠI GIA · LỨA TUỔI MẦM NON</span>
            </div>
            <h2 className="khoi-section-title">
              Đồng Hành Cùng Bé <em>Bập Bẹ Bước Theo Chúa</em>
            </h2>
            <p className="khoi-section-desc">
              Ở lứa tuổi 5–7, gia đình chính là trường học đức tin đầu tiên và quan trọng nhất. Tình yêu thương, lời kinh tối và gương sáng của cha mẹ là hạt giống gieo vào tâm hồn trong trắng của các con.
            </p>
          </Motion.div>

          {/* Bento Family Hub (2 Cột) */}
          <Motion.div className="khoi-family-bento-grid" {...sectionRevealProps}>
            {/* Cột trái: 3 Trụ cột hành động */}
            <div className="khoi-pillars-stack">
              {familyPillars.map((item) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={item.title}
                    className="khoi-pillar-card"
                  >
                    <div className="khoi-pillar-top">
                      <div className="khoi-pillar-header-left">
                        <div className="khoi-pillar-icon-wrap" aria-hidden="true">
                          <IconComp size={22} />
                        </div>
                        <h4 className="khoi-pillar-title">{item.title}</h4>
                      </div>
                      <span className="khoi-pillar-badge">{item.badge}</span>
                    </div>
                    <p className="khoi-pillar-desc">{item.desc}</p>
                    <div className="khoi-pillar-action-tip">
                      <strong>Gợi ý cha mẹ:</strong> {item.tip}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cột phải: Sanctuary Box */}
            <div className="khoi-sanctuary-box">
              <div>
                <div className="khoi-eyebrow khoi-sanctuary-eyebrow">
                  <Sparkles size={14} aria-hidden="true" />
                  <span>{sanctuaryData.eyebrow}</span>
                </div>

                <div className="khoi-sanctuary-quote-wrap">
                  <Quote size={18} className="khoi-sanctuary-quote-icon" aria-hidden="true" />
                  <blockquote className="khoi-sanctuary-quote">
                    "{sanctuaryData.quote}"
                  </blockquote>
                  <span className="khoi-sanctuary-author">{sanctuaryData.author}</span>
                </div>

                <div className="khoi-sanctuary-checklist-title">
                  <CheckCircle2 size={16} className="khoi-sanctuary-checklist-icon" aria-hidden="true" />
                  <span>{sanctuaryData.checklistTitle}</span>
                </div>

                <ul className="khoi-checklist-list">
                  {sanctuaryData.checklist.map((chk) => (
                    <li key={chk.label} className="khoi-checklist-item">
                      <span className="khoi-check-icon" aria-hidden="true">✓</span>
                      <span><strong>{chk.label}:</strong> {chk.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hộp liên hệ hỗ trợ */}
              <div className="khoi-support-card">
                <div className="khoi-support-info">
                  <strong>{sanctuaryData.supportTitle}</strong><br />
                  <span className="khoi-support-desc">{sanctuaryData.supportDesc}</span>
                </div>
                <Link to={sanctuaryData.supportBtnLink} className="khoi-btn-secondary khoi-support-btn">
                  <span>{sanctuaryData.supportBtnText}</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </Motion.div>

          {/* FAQ Accordion Phụ Huynh */}
          <Motion.div className="khoi-faq-wrapper" {...sectionRevealProps}>
            <div className="khoi-faq-header">
              <h3 className="khoi-faq-title">
                Giải Đáp Thắc Mắc Khối Chiên Con (FAQ)
              </h3>
              <p className="khoi-faq-desc">
                Các thông tin cần thiết về độ tuổi, phương pháp giáo dục mầm non Công giáo và giờ giấc đưa đón bé.
              </p>
            </div>

            <div className="khoi-faq-list">
              {faqs.map((item, idx) => {
                const isOpen = openFaq === idx;
                const faqAnsId = `cc-faq-ans-${idx}`;
                const padIdx = String(idx + 1).padStart(2, "0");
                return (
                  <div key={item.q} className={`khoi-faq-item ${isOpen ? "active" : ""}`}>
                    <button
                      type="button"
                      className="khoi-faq-btn"
                      aria-expanded={isOpen}
                      aria-controls={faqAnsId}
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                    >
                      <div className="khoi-faq-question-wrap">
                        <span className="khoi-faq-q-badge">{padIdx}</span>
                        <span>{item.q}</span>
                      </div>
                      <ChevronDown
                        size={18}
                        aria-hidden="true"
                        className="khoi-faq-chevron"
                      />
                    </button>
                    {isOpen && (
                      <div id={faqAnsId} className="khoi-faq-answer">
                        <p>{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Motion.div>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 6: CTA BANNER ĐĂNG KÝ TUYỂN SINH & LIÊN HỆ
          ══════════════════════════════════════════════════════════════ */}
          <Motion.div className="khoi-cta-banner" {...sectionRevealProps}>
            <div className="khoi-cta-badge">
              <Baby size={16} aria-hidden="true" />
              <span>NIÊN KHÓA {academicYear} · GIÁO XỨ AN NGÃI</span>
            </div>

            <h3 className="khoi-cta-title">
              Ươm Mầm Đức Tin &amp; Niềm Vui Tuổi Thơ Cùng Bé Yêu
            </h3>

            <p className="khoi-cta-desc">
              Vườn Trẻ &amp; Khai Tâm là ngôi nhà thứ hai chan hòa tình yêu thương của Chúa Giêsu. Xứ đoàn Mẹ Mân Côi hân hoan chào đón quý phụ huynh gửi gắm các thiên thần nhỏ để cùng bé lớn lên trong ơn nghĩa Chúa.
            </p>

            <div className="khoi-cta-actions">
              {/* Nút chính */}
              <Link to={enrollmentCTA.bannerLink} className="khoi-btn-primary">
                <Sparkles size={18} aria-hidden="true" />
                <span>{enrollmentCTA.bannerText}</span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>

              {/* 2 nút phụ */}
              <div className="khoi-cta-secondary-group">
                <Link to="/lịch-học" className="khoi-btn-secondary">
                  <Clock size={15} aria-hidden="true" />
                  <span>Xem Lịch Sinh Hoạt</span>
                </Link>
                <Link to="/liên-hệ" className="khoi-btn-secondary">
                  <Church size={15} aria-hidden="true" />
                  <span>Tư Vấn &amp; Hỗ Trợ</span>
                </Link>
              </div>
            </div>

            <div className="khoi-cta-note">
              <span>{enrollmentCTA.note}</span>
            </div>
          </Motion.div>
        </div>
      </section>
    </div>
  );
}
