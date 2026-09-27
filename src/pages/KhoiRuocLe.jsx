import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  Users, BookOpen, Clock, MapPin,
  Sparkles, ChevronDown,
  Heart, ShieldCheck, ArrowRight,
  Church, CheckCircle2, Cross, Flame, Droplets, Quote,
  Calendar, CalendarDays
} from "lucide-react";
import { getKhoiRuocLeData } from "../utils/academicYear.js";
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
import "./KhoiRuocLe.css";

export default function KhoiRuocLe() {
  const config = getKhoiConfig("ruoc-le");
  const data = getKhoiRuocLeData();
  const {
    academicYear,
    ruocLe1BirthYear,
    ruocLe2BirthYear,
    classes
  } = data;

  const [openFaq, setOpenFaq] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const { shouldReduceMotion, heroContainerVariants, heroItemVariants, sectionRevealProps } = useKhoiMotion();

  // Thống kê động từ nguồn dữ liệu chuẩn
  const totalClasses = classes.length;
  const totalTeachers = new Set(classes.flatMap((c) => c.teachers)).size;
  const rld1Classes = classes.filter((c) => c.group === "Rước Lễ 1");
  const rld2Classes = classes.filter((c) => c.group === "Rước Lễ 2");

  const FloatingIcon = config?.hero?.floatingBadge?.icon || Church;

  // Lịch sinh hoạt tập trung (CENTRAL_MASS & CA_HOC)
  const timelineData = getSectorTimeline(config, classes);
  const timelineSteps = timelineData.steps;

  // Trạng thái tuyển sinh thực tế từ module tuyển sinh trung tâm
  const enrollmentStatus = getEnrollmentStatus();
  const enrollmentCTA = getSectorEnrollmentCTA({ status: enrollmentStatus, sectorId: "ruoc-le" });

  useEffect(() => {
    const prevTitle = document.title;
    document.title = `Khối Rước Lễ Lần Đầu (${config?.grades || "RLLĐ 1 & 2"}) · Khăn Xanh Có Viền · Niên Khóa ${academicYear} | Giáo xứ An Ngãi`;
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

  // 6 Chặng sư phạm đức tin trực quan Ngành Ấu
  const faithJourneySteps = [
    {
      step: "01",
      icon: Droplets,
      practiceIcon: Droplets,
      title: "Con Là Con Thiên Chúa",
      sub: "Căn Tính Kitô Hữu Tuổi Thơ",
      badge: "Khởi Đầu",
      practiceLabel: "Áo trắng tâm hồn",
      meaning: "Nhớ lại hồng ân Bí tích Rửa Tội đã lãnh nhận. Các em nhận biết mình là người con yêu dấu của Cha trên trời, được mời gọi sống đơn sơ, vui tươi và ngoan ngoãn vâng phục.",
      highlight: "Học ý nghĩa biểu tượng Nước Sự Sống, luôn giữ tấm lòng đơn sơ, trong trắng và đức tin sáng ngời."
    },
    {
      step: "02",
      icon: Heart,
      practiceIcon: BookOpen,
      title: "Gặp Gỡ Chúa Giêsu",
      sub: "Người Bạn Lớn Của Tuổi Thơ",
      badge: "Lời Chúa",
      practiceLabel: "Tâm sự cùng Chúa",
      meaning: "Lắng nghe và suy ngẫm các câu chuyện Tin Mừng sống động. Chúa Giêsu không xa xôi, Ngài chính là Người Bạn chân thành nhất luôn đồng hành, che chở và tha thứ cho các em.",
      highlight: "Chiêm ngắm Chúa Mục Tử nhân lành, tập thói quen đọc kinh và tâm sự cùng Chúa trước khi đi ngủ."
    },
    {
      step: "03",
      icon: Cross,
      practiceIcon: ShieldCheck,
      title: "Bí Tích Hòa Giải",
      sub: "Trở Về Trong Lòng Cha",
      badge: "Ơn Chữa Lành",
      practiceLabel: "5 Bước Xưng tội",
      meaning: "Học cách nhận biết lỗi lầm để cảm nhận lòng thương xót vô biên của Chúa, chứ không phải vì sợ hãi. Chuẩn bị tâm hồn bình an đón nhận ơn tha thứ trong Ngày Xưng Tội Lần Đầu.",
      highlight: "Thực hành 5 bước Xưng tội với lòng thành: Xét mình, ăn năn, dốc lòng chừa, xưng tội và đền tội."
    },
    {
      step: "04",
      icon: Sparkles,
      practiceIcon: Church,
      title: "Bí Tích Thánh Thể",
      sub: "Mầu Nhiệm Bánh Hằng Sống",
      badge: "Bàn Tiệc Thánh",
      practiceLabel: "Tôn kính Thánh Thể",
      meaning: "Khám phá trung tâm Phụng vụ. Các em hiểu Bánh Thánh chính là Mình và Máu Thánh Chúa Kitô hiến tế vì yêu thương, trở thành lương thực thiêng liêng nuôi dưỡng tâm hồn tuổi thơ.",
      highlight: "Hiểu ý nghĩa Bữa Tiệc Ly, giữ thái độ trang nghiêm, cung kính tôn thờ mỗi khi bước vào Nhà Tạm."
    },
    {
      step: "05",
      icon: Church,
      practiceIcon: CheckCircle2,
      title: "Ngày Đón Chúa Vào Lòng",
      sub: "Rước Lễ Lần Đầu Tiên",
      badge: "Hồng Ân Trọng Đại",
      practiceLabel: "Nghi thức Rước Lễ",
      meaning: "Dấu mốc thiêng liêng và đáng nhớ nhất của tuổi thơ Kitô hữu. Các em tham dự tuần tĩnh tâm chuyên sâu, tập dượt nghi thức và mặc y phục trắng tinh tuyền tiến lên Bàn Tiệc Thánh.",
      highlight: "Giữ chay 1 giờ, tác phong nghiêm trang, chắp tay cung kính và rước Chúa sốt sắng vào tâm hồn."
    },
    {
      step: "06",
      icon: Flame,
      practiceIcon: Sparkles,
      title: "Sống Tình Yêu Thánh Thể",
      sub: "Hùng Tâm – Dũng Chí Giữa Đời",
      badge: "Chứng Nhân Nhỏ",
      practiceLabel: "Châm ngôn Ngành Ấu",
      meaning: "Rước Lễ Lần Đầu là khởi đầu cho nếp sống mới. Đón nhận Chúa vào lòng, các em được mời gọi đem tình yêu, lòng vị tha và sự tử tế lan tỏa đến gia đình, trường học và bạn bè.",
      highlight: "Sống châm ngôn Ngành Ấu: Vâng lời cha mẹ, chăm học, trung thực và siêng năng dự lễ Chúa Nhật."
    }
  ];

  // 3 Trụ cột Hội Thánh Tại Gia (Bento Family Hub)
  const familyPillars = [
    {
      title: "Tập Cho Con Thói Quen Cầu Nguyện",
      badge: "Mỗi Tối",
      desc: "Dạy con các kinh căn bản: Kinh Lạy Cha, Kính Mừng, Sáng Danh và Kinh Ăn Năn Tội. Cùng con dâng lời nguyện tự phát ngắn tạ ơn Chúa trước bữa ăn và trước khi ngủ.",
      tip: "Khen ngợi và ôm con sau mỗi giờ kinh tối để con cảm nhận việc cầu nguyện luôn tràn ngập niềm vui.",
      icon: Heart
    },
    {
      title: "Dạy Con Xét Mình Trong Yêu Thương",
      badge: "Bí Tích Hòa Giải",
      desc: "Giúp con hiểu Xưng Tội là trở về với vòng tay Cha nhân từ, không phải vì sợ phạt. Hướng dẫn con can đảm nhận lỗi khi làm cha mẹ buồn hoặc cãi nhau với anh chị em.",
      tip: "Cha mẹ cũng biết nói lời 'xin lỗi' và 'cảm ơn' con cái để làm gương sống đức khiêm nhường.",
      icon: Cross
    },
    {
      title: "Tôn Kính Chúa Giêsu Thánh Thể",
      badge: "Sáng Chúa Nhật",
      desc: "Giải thích cho con Bánh Thánh là Mình Thánh Chúa Kitô thật sự. Dạy con giữ chay 1 giờ trước khi rước lễ, chắp tay nghiêm trang và tạ ơn sau khi rước Chúa vào lòng.",
      tip: "Khi đưa con vào nhà thờ, cùng con cúi chào Chúa ngự nơi Nhà Tạm với tất cả lòng tôn kính.",
      icon: Church
    }
  ];

  // Sanctuary Box (Lời Chúa & Checklist)
  const sanctuaryData = {
    eyebrow: "Hội Thánh Tại Gia · Lời Chúa Kim Chỉ Nam",
    quote: "Cứ để trẻ nhỏ đến với Thầy, đừng ngăn cấm chúng, vì Nước Trời thuộc về những ai giống như chúng.",
    author: "Tin Mừng Theo Thánh Mátthêu (Mt 19, 14)",
    checklistTitle: "Chuẩn Bị Cho Ngày Rước Lễ Lần Đầu",
    checklist: [
      { label: "Áo Trắng", text: "Y phục trắng tinh tuyền chuẩn bị sạch đẹp, tươm tất trước ngày đại lễ." },
      { label: "Giữ Chay", text: "Nhắc con không ăn uống (trừ nước lọc) 1 giờ trước khi rước lễ." },
      { label: "Tâm Hồn", text: "Cùng con xét mình và đưa con đi xưng tội lần đầu với tâm trạng bình an, sốt sắng." }
    ],
    supportTitle: "Con hay nhút nhát, sợ xưng tội?",
    supportDesc: "Trao đổi với GLV để có phương pháp đồng hành tâm lý nhẹ nhàng.",
    supportBtnText: "Tư Vấn GLV",
    supportBtnLink: "/liên-hệ"
  };

  // Cẩm nang FAQ cho Phụ huynh Khối Rước Lễ
  const faqs = [
    {
      q: `Điều kiện để các em được theo học Khối Rước Lễ niên khóa ${academicYear} là gì?`,
      a: `Dành cho các em ${config?.ageText || "8 – 9 tuổi"}: Lớp ${rld1Classes[0]?.group || "Rước Lễ 1"} (${rld1Classes[0]?.ageText || "8 tuổi"} · Sinh năm ${ruocLe1BirthYear}) và Lớp ${rld2Classes[0]?.group || "Rước Lễ 2"} (${rld2Classes[0]?.ageText || "9 tuổi"} · Sinh năm ${ruocLe2BirthYear}), đã lãnh nhận Bí tích Rửa Tội và hoàn thành chương trình Khối Chiên Con (hoặc có chứng nhận chuyển xứ tương đương).`
    },
    {
      q: `Lớp ${rld1Classes[0]?.group || "Rước Lễ 1"} và Lớp ${rld2Classes[0]?.group || "Rước Lễ 2"} khác nhau như thế nào trong chương trình đào tạo?`,
      a: `Khối Rước Lễ gồm 2 năm đào tạo bài bản: Năm thứ nhất (${rld1Classes[0]?.group || "RLLĐ 1"}) học về căn tính Kitô hữu, làm quen Lời Chúa, học các lời kinh căn bản và tập xét mình. Năm thứ hai (${rld2Classes[0]?.group || "RLLĐ 2"}) đi sâu vào Bí tích Hòa Giải và Thánh Thể, tham dự kỳ thi giáo lý, tĩnh tâm và chuẩn bị trực tiếp để lãnh nhận Bí tích Rước Lễ Lần Đầu.`
    },
    {
      q: "Trang phục của các em trong Ngày Rước Lễ Lần Đầu quy định như thế nào?",
      a: `Theo truyền thống phụng vụ trang trọng của Giáo xứ An Ngãi: Toàn bộ các em mặc áo thụng trắng (albs) đồng phục có cổ yếm xanh chuối non của ${config?.nganh || "Ngành Ấu"} Hùng Tâm Dũng Chí. Bé gái đội vòng hoa trắng đơn sơ, bé trai mang giày sẫm màu sạch sẽ, đầu tóc gọn gàng.`
    },
    {
      q: "Phụ huynh có cần xưng tội và tĩnh tâm cùng con trước Ngày Rước Lễ Lần Đầu không?",
      a: "Có. Ban Giáo lý và Quý Cha luôn tổ chức buổi tĩnh tâm và giải tội đặc biệt dành cho quý phụ huynh trước ngày lễ trọng đại. Sự đồng hành và chuẩn bị tâm hồn sốt sắng của cha mẹ chính là món quà thiêng liêng vô giá nhất dành cho con cái."
    },
    {
      q: "Nếu con chưa nhớ hết các kinh thì có được rước lễ không?",
      a: "GLV và Ban Giáo lý luôn kiên nhẫn đồng hành và phụ đạo riêng cho các em tiếp thu chậm. Điều quan trọng nhất không chỉ là thuộc lòng mặt chữ mà là tâm hồn con yêu mến Chúa, biết ăn năn khi làm điều sai và khao khát rước Chúa vào lòng."
    }
  ];

  return (
    <div className="khoi-page theme-ruoc-le">
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
            {/* Cột trái: Nhãn, Tiêu đề lớn, Mô tả & Nút CTA */}
            <div className="khoi-hero-left">
              <Motion.div variants={heroItemVariants}>
                <div className="khoi-hero-pill-badge">
                  <span aria-hidden="true">{config?.hero?.pillIcon || "🌿"}</span>
                  <span>{config?.hero?.pillText || `${config?.nganh || "Ngành Ấu"} HTDC · Khối Rước Lễ`}</span>
                </div>
              </Motion.div>

              <Motion.h1 variants={heroItemVariants} className="khoi-hero-title">
                {config?.hero?.titleLine1 || "Đón Chúa Vào Lòng"}<br />
                <em>{config?.hero?.titleLine2 || "Khắc Ghi Tình Cha"}</em>
              </Motion.h1>

              <Motion.p variants={heroItemVariants} className="khoi-hero-desc">
                {config?.hero?.desc || "Chuẩn bị tâm hồn thánh thiện qua Bí tích Hòa Giải và đón nhận Mình Thánh Chúa Kitô lần đầu tiên — dấu ấn đức tin sâu đậm của tuổi thơ Kitô hữu."}
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

            {/* Cột phải: Khung ảnh & Floating Badge */}
            <Motion.div variants={heroItemVariants}>
              <div className="khoi-hero-image-card">
                <img
                  src={config?.hero?.image || asset("/images/khoiruocle-anngai.jpg")}
                  alt={config?.hero?.imageAlt || "Thánh Lễ Rước Lễ Lần Đầu tại Giáo xứ An Ngãi"}
                  className="khoi-hero-img"
                  loading="eager"
                  fetchPriority="high"
                />
                <div className="khoi-floating-badge">
                  <div className="khoi-floating-badge-icon">
                    <FloatingIcon size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <div className="khoi-floating-badge-title">
                      {config?.hero?.floatingBadge?.title || "Thánh Lễ Rước Lễ Lần Đầu"}
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
            ariaLabel="Tổng quan Khối Rước Lễ"
            age={config?.tuoi || config?.ageText || "8 – 9 tuổi"}
            ageDetail={`Sinh năm ${ruocLe2BirthYear}–${ruocLe1BirthYear}`}
            classCount={totalClasses}
            classDetail={config?.grades || "RLLĐ 1 và 2"}
            teacherCount={totalTeachers}
            teamDetail="Quý Soeur và Giáo lý viên"
            timeline={timelineData}
            motionProps={sectionRevealProps}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2: DANH SÁCH 5 LỚP HỌC THỰC TẾ
      ══════════════════════════════════════════════════════════════ */}
      <section id="danh-sach-lop" tabIndex={-1} className="khoi-section">
        <div className="khoi-shell">
          <Motion.div className="khoi-section-header" {...sectionRevealProps}>
            <div className="khoi-eyebrow">
              <span className="khoi-dot" />
              <span>DANH SÁCH LỚP NIÊN KHÓA {academicYear}</span>
            </div>
            <h2 className="khoi-section-title">
              <span>Khối Rước Lễ</span>{" "}
              <em className="block sm:inline whitespace-nowrap">Giáo xứ An Ngãi</em>
            </h2>
            <p className="khoi-section-desc">
              Phòng Giáo lý, quý Soeur và Huynh trưởng phụ trách {totalClasses} lớp học thuộc {config?.nganh || "Ngành Ấu"}.
            </p>
          </Motion.div>

          {/* Thông báo hỗ trợ Screen Reader khi lọc lớp */}
          <div role="status" className="sr-only" aria-live="polite">
            {selectedGroup === "all"
              ? `Đang hiển thị tất cả ${totalClasses} lớp học Khối Rước Lễ.`
              : selectedGroup === "rl1"
                ? `Đang hiển thị ${rld1Classes.length} lớp học Khối ${rld1Classes[0]?.group || "RLLĐ 1"} (${rld1Classes[0]?.ageText || "8 tuổi"}).`
                : `Đang hiển thị ${rld2Classes.length} lớp học Khối ${rld2Classes[0]?.group || "RLLĐ 2"} (${rld2Classes[0]?.ageText || "9 tuổi"}).`}
          </div>

          {/* Bộ lọc phân tầng khối học */}
          <div className="khoi-stage-filter-bar khoi-stage-filter-bar--three" role="group" aria-label="Lọc lớp Khối Rước Lễ">
            <button
              type="button"
              className={`khoi-filter-pill ${selectedGroup === "all" ? "active" : ""}`}
              onClick={() => setSelectedGroup("all")}
              aria-pressed={selectedGroup === "all"}
            >
              <span className="khoi-filter-label">Tất cả</span>
              <span className="khoi-filter-meta">{totalClasses} lớp</span>
            </button>
            <button
              type="button"
              className={`khoi-filter-pill ${selectedGroup === "rl1" ? "active" : ""}`}
              onClick={() => setSelectedGroup("rl1")}
              aria-pressed={selectedGroup === "rl1"}
            >
              <span className="khoi-filter-label">{rld1Classes[0]?.group || "Rước Lễ 1"}</span>
              <span className="khoi-filter-meta">{rld1Classes[0]?.ageText || "8 tuổi"} · {rld1Classes.length} lớp</span>
            </button>
            <button
              type="button"
              className={`khoi-filter-pill ${selectedGroup === "rl2" ? "active" : ""}`}
              onClick={() => setSelectedGroup("rl2")}
              aria-pressed={selectedGroup === "rl2"}
            >
              <span className="khoi-filter-label">{rld2Classes[0]?.group || "Rước Lễ 2"}</span>
              <span className="khoi-filter-meta">{rld2Classes[0]?.ageText || "9 tuổi"} · {rld2Classes.length} lớp</span>
            </button>
          </div>

          {/* NHÓM 1: RƯỚC LỄ 1 */}
          {(selectedGroup === "all" || selectedGroup === "rl1") && (
            <Motion.div className="khoi-group-block" {...sectionRevealProps}>
              <div className="khoi-stage-header">
                <div className="khoi-stage-title-wrap">
                  <span className="khoi-stage-num" aria-hidden="true">01</span>
                  <div>
                    <h3 className="khoi-stage-title">Khối {rld1Classes[0]?.group || "RLLĐ 1"}</h3>
                    <p className="khoi-stage-subtitle">
                      Năm thứ nhất · Khai tâm Lời Chúa &amp; Tập xét mình
                    </p>
                  </div>
                </div>
                <div className="khoi-stage-pills">
                  <span className="khoi-stage-pill">{rld1Classes[0]?.ageText || "8 Tuổi"}</span>
                  <span className="khoi-stage-pill">Sinh năm {ruocLe1BirthYear}</span>
                  <span className="khoi-stage-pill">{rld1Classes.length} Lớp (P3 &amp; P4)</span>
                </div>
              </div>

              <div className="khoi-class-grid">
                {rld1Classes.map((item) => (
                  <div key={item.id} className="khoi-class-card">
                    {/* TẦNG 1: Head - Badge mã lớp & Vị trí phòng */}
                    <div className="khoi-card-head">
                      <span className="khoi-class-code">
                        {item.name.replace("Lớp RLLĐ ", "RL ")}
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
                        {item.studentsCount && (
                          <span className="khoi-stat-chip">
                            <Users size={13} aria-hidden="true" />
                            <span>Sĩ số: <strong>{item.studentsCount} em</strong></span>
                          </span>
                        )}
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

                    {/* TẦNG 4: Trọng tâm huấn giáo bí tích */}
                    <div className="khoi-focus-box">
                      <div className="khoi-focus-badge">{item.levelBadge}</div>
                      <p className="khoi-focus-desc">{item.focus}</p>
                    </div>

                    {/* TẦNG 5: Footer - Giờ học & Trạng thái */}
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

          {/* NHÓM 2: RƯỚC LỄ 2 */}
          {(selectedGroup === "all" || selectedGroup === "rl2") && (
            <Motion.div className="khoi-group-block" {...sectionRevealProps}>
              <div className="khoi-stage-header">
                <div className="khoi-stage-title-wrap">
                  <span className="khoi-stage-num" aria-hidden="true">02</span>
                  <div>
                    <h3 className="khoi-stage-title">Khối {rld2Classes[0]?.group || "RLLĐ 2"}</h3>
                    <p className="khoi-stage-subtitle">
                      Năm thứ hai · Chuẩn bị Bí tích Hòa Giải, tĩnh tâm &amp; Rước Lễ Lần Đầu
                    </p>
                  </div>
                </div>
                <div className="khoi-stage-pills">
                  <span className="khoi-stage-pill">{rld2Classes[0]?.ageText || "9 Tuổi"}</span>
                  <span className="khoi-stage-pill">Sinh năm {ruocLe2BirthYear}</span>
                  <span className="khoi-stage-pill">{rld2Classes.length} Lớp (P5, P7, P8)</span>
                </div>
              </div>

              <div className="khoi-class-grid">
                {rld2Classes.map((item) => (
                  <div key={item.id} className="khoi-class-card">
                    {/* TẦNG 1: Head - Badge mã lớp & Vị trí phòng */}
                    <div className="khoi-card-head">
                      <span className="khoi-class-code">
                        {item.name.replace("Lớp RLLĐ ", "RL ")}
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
                        {item.studentsCount && (
                          <span className="khoi-stat-chip">
                            <Users size={13} aria-hidden="true" />
                            <span>Sĩ số: <strong>{item.studentsCount} em</strong></span>
                          </span>
                        )}
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

                    {/* TẦNG 4: Trọng tâm huấn giáo bí tích */}
                    <div className="khoi-focus-box">
                      <div className="khoi-focus-badge">{item.levelBadge}</div>
                      <p className="khoi-focus-desc">{item.focus}</p>
                    </div>

                    {/* TẦNG 5: Footer - Giờ học & Trạng thái */}
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
          SECTION 3: LỘ TRÌNH 6 CHẶNG GIÁO LÝ ĐỨC TIN
      ══════════════════════════════════════════════════════════════ */}
      <section className="rl-journey-section">
        <div className="khoi-shell">
          <Motion.div className="khoi-section-header" {...sectionRevealProps}>
            <div className="khoi-eyebrow">
              <span className="khoi-dot" />
              <span>SƯ PHẠM ĐỨC TIN KHỐI RƯỚC LỄ</span>
            </div>
            <h2 className="khoi-section-title">
              Hành Trình Khám Phá &amp; <em>Đón Chúa Vào Lòng</em>
            </h2>
            <p className="khoi-section-desc">
              Chương trình đào tạo 6 chặng chuyển hóa từ nhận thức căn bản đến nuôi dưỡng tâm tình nội tâm và sống chứng nhân nhỏ bé.
            </p>
          </Motion.div>

          <Motion.div className="rl-journey-grid" {...sectionRevealProps}>
            {faithJourneySteps.map((card) => {
              const StepIcon = card.icon;
              const PracticeIcon = card.practiceIcon;
              return (
                <div
                  key={card.step}
                  className={`rl-journey-card stage-step-${card.step}`}
                >
                  <div>
                    <div className="rl-journey-card-top">
                      <div className="rl-journey-left-header">
                        <div className="rl-journey-icon-wrap">
                          <StepIcon size={22} aria-hidden="true" />
                        </div>
                        <div>
                          <span className="rl-journey-step-badge">CHẶNG {card.step}</span>
                        </div>
                      </div>
                      <span className="rl-journey-category-pill">{card.badge}</span>
                    </div>

                    <div>
                      <div className="rl-journey-sub">{card.sub}</div>
                      <h3 className="rl-journey-title">{card.title}</h3>
                      <p className="rl-journey-meaning">{card.meaning}</p>
                    </div>
                  </div>

                  <div className="rl-journey-practice-box">
                    <div className="rl-practice-header">
                      <PracticeIcon size={14} aria-hidden="true" />
                      <span>{card.practiceLabel}</span>
                    </div>
                    <div className="rl-practice-content">
                      {card.highlight}
                    </div>
                  </div>
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
              <span className="khoi-dot" />
              <span>THỜI GIAN BIỂU CHÚA NHẬT ({timelineData.shiftName.toUpperCase()})</span>
            </div>
            <h2 className="khoi-section-title">
              Nhịp Sống <em>Chúa Nhật</em>
            </h2>
            <p className="khoi-section-desc">
              Lịch trình sinh hoạt sáng Chúa Nhật hàng tuần dành cho toàn bộ đoàn sinh Khối Rước Lễ Giáo xứ An Ngãi.
            </p>
          </Motion.div>

          {/* Thanh ray ngang tiến trình Stepper (Desktop >= 768px) */}
          <div className="rl-stepper-track" aria-hidden="true">
            <div className="rl-stepper-line" />
            <div className="rl-stepper-nodes">
              {timelineSteps.map((step, idx) => (
                <div key={`stepper-${step.time}`} className={`rl-stepper-col ${step.highlight ? "highlight" : ""}`}>
                  <div className="rl-stepper-node">{idx + 1}</div>
                  <span className="rl-stepper-time">{step.time}</span>
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
            <span><strong>Lưu ý nề nếp:</strong> Phụ huynh vui lòng đưa đón con đúng giờ tại sảnh Nhà Thờ và cửa Phòng Giáo lý để bảo đảm an toàn.</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5: HỘI THÁNH TẠI GIA & FAQ CẨM NANG PHỤ HUYNH
      ══════════════════════════════════════════════════════════════ */}
      <section id="dong-hanh" tabIndex={-1} className="khoi-section">
        <div className="khoi-shell">
          <Motion.div className="khoi-section-header" {...sectionRevealProps}>
            <div className="khoi-eyebrow">
              <span className="khoi-dot" />
              <span>GÓC PHỤ HUYNH &amp; HỘI THÁNH TẠI GIA · {config?.nganh?.toUpperCase() || "NGÀNH ẤU"}</span>
            </div>
            <h2 className="khoi-section-title">
              Đồng Hành Cùng Con <em>Đón Chúa Vào Lòng</em>
            </h2>
            <p className="khoi-section-desc">
              Ngày Xưng Tội và Rước Lễ Lần Đầu là kỷ niệm thiêng liêng theo con suốt cuộc đời. Bằng tình yêu thương và sự kiên nhẫn, cha mẹ hãy gieo vào lòng con niềm vui hạnh phúc được làm bạn với Chúa Giêsu Thánh Thể.
            </p>
          </Motion.div>

          {/* Bento Family Hub (2 Cột) */}
          <Motion.div className="khoi-family-bento-grid" {...sectionRevealProps}>
            {/* Cột trái: 3 Trụ cột hành động */}
            <div className="khoi-pillars-stack">
              {familyPillars.map((item) => {
                const IconComp = item.icon;
                return (
                  <div key={item.title} className="khoi-pillar-card">
                    <div className="khoi-pillar-top">
                      <div className="khoi-pillar-header-left">
                        <div className="khoi-pillar-icon-wrap">
                          <IconComp size={22} aria-hidden="true" />
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
                Giải Đáp Thắc Mắc Khối Rước Lễ (FAQ)
              </h3>
              <p className="khoi-faq-desc">
                Các thông tin cần thiết về điều kiện ghi danh, học tập và nghi thức ngày Rước Lễ Lần Đầu.
              </p>
            </div>

            <div className="khoi-faq-list">
              {faqs.map((item, idx) => {
                const isOpen = openFaq === idx;
                const faqAnsId = `rl-faq-ans-${idx}`;
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
              <span aria-hidden="true">🌿</span>
              <span>NIÊN KHÓA {academicYear} · GIÁO XỨ AN NGÃI</span>
            </div>

            <h3 className="khoi-cta-title">
              Trao Cho Con Dấu Ấn Đức Tin Đẹp Nhất Tuổi Thơ
            </h3>

            <p className="khoi-cta-desc">
              Đón Chúa Giêsu vào lòng là hồng ân trọng đại chỉ có một lần trong đời thơ ấu. Xứ đoàn An Ngãi hân hoan chào đón và cùng gia đình chuẩn bị cho các em một tâm hồn thật thánh thiện.
            </p>

            <div className="khoi-cta-actions">
              <Link to={enrollmentCTA.bannerLink} className="khoi-btn-primary">
                <Sparkles size={18} aria-hidden="true" />
                <span>{enrollmentCTA.bannerText}</span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <div className="khoi-cta-secondary-group">
                <Link to="/lịch-học" className="khoi-btn-secondary">
                  <CalendarDays size={15} aria-hidden="true" />
                  <span>Lịch Học Chúa Nhật</span>
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
