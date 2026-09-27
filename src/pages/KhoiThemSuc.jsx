import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  Users, Clock, MapPin,
  Sparkles, ChevronDown,
  Heart, ShieldCheck, ArrowRight,
  Church, CheckCircle2, Flame, Droplets, Quote,
  Calendar, CalendarDays, Wind, Compass
} from "lucide-react";
import { getKhoiThemSucData } from "../utils/academicYear.js";
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
import "./KhoiThemSuc.css";

export default function KhoiThemSuc() {
  const config = getKhoiConfig("them-suc");
  const data = getKhoiThemSucData();
  const {
    academicYear,
    themSuc1BirthYear,
    themSuc2BirthYear,
    classes
  } = data;

  const [openFaq, setOpenFaq] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const { shouldReduceMotion, heroContainerVariants, heroItemVariants, sectionRevealProps } = useKhoiMotion();

  // Thống kê động từ nguồn dữ liệu chuẩn
  const totalClasses = classes.length;
  const totalTeachers = new Set(classes.flatMap((c) => c.teachers)).size;
  const ts1Classes = classes.filter((c) => c.group === "Thêm Sức 1");
  const ts2Classes = classes.filter((c) => c.group === "Thêm Sức 2");

  const FloatingIcon = config?.hero?.floatingBadge?.icon || Flame;

  // Lịch sinh hoạt tập trung (CENTRAL_MASS & CA_HOC)
  const timelineData = getSectorTimeline(config, classes);
  const timelineSteps = timelineData.steps;

  // Trạng thái tuyển sinh thực tế từ module tuyển sinh trung tâm
  const enrollmentStatus = getEnrollmentStatus();
  const enrollmentCTA = getSectorEnrollmentCTA({ status: enrollmentStatus, sectorId: "them-suc" });

  useEffect(() => {
    const prevTitle = document.title;
    document.title = `Khối Thêm Sức (${config?.grades || "TS 1 & 2"}) · Khăn Vàng Có Viền · Niên Khóa ${academicYear} | Giáo xứ An Ngãi`;
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

  // 6 Chặng sư phạm đức tin trực quan Ngành Kim Hoan
  const faithJourneySteps = [
    {
      step: "01",
      icon: Wind,
      practiceIcon: Flame,
      title: "Nhận Biết Đấng Bảo Trợ",
      sub: "Ngôi Ba Thiên Chúa Trong Đời Con",
      badge: "Căn Bản Đức Tin",
      practiceLabel: "Biểu tượng Thần Khí",
      meaning: "Khám phá mầu nhiệm Chúa Thánh Thần — Đấng hằng hiện diện từ Bí tích Rửa Tội, soi sáng tâm trí và uốn nắn các em biết yêu mến sự thiện.",
      highlight: "Nhận biết Lửa, Gió và Bồ Câu trong Kinh Thánh; tập thói quen cầu nguyện xin ơn Chúa Thánh Thần soi sáng."
    },
    {
      step: "02",
      icon: Sparkles,
      practiceIcon: ShieldCheck,
      title: "Đón Nhận Bảy Ơn Thiêng",
      sub: "Món Quà Vô Giá Của Thần Khí",
      badge: "Bảy Ơn Thiêng",
      practiceLabel: "Phân định đức tin",
      meaning: "Hiểu sâu 7 ơn Chúa Thánh Thần: Khôn Ngoan, Hiểu Biết, Biết Lo Liệu, Dũng Cảm, Thông Minh, Đạo Đức và Kính Sợ Chúa để áp dụng vào học đường và cuộc sống.",
      highlight: "Tập phân định điều đúng sai trong cuộc sống, can đảm làm chứng đức tin trước bạn bè và môi trường học đường."
    },
    {
      step: "03",
      icon: Heart,
      practiceIcon: Heart,
      title: "Tĩnh Tâm & Hòa Giải",
      sub: "Lắng Đọng Tâm Hồn Sa Mạc",
      badge: "Ơn Giao Hòa",
      practiceLabel: "Hòa giải yêu thương",
      meaning: "Ngày tĩnh tâm sa mạc chuyên sâu trước ngày đại lễ. Các em hồi tâm xét mình, từ bỏ thói xấu và đón nhận lòng thương xót thứ tha của Cha nhân từ.",
      highlight: "Thực hành xét mình theo Lời Chúa, can đảm xin lỗi và hòa giải cùng bạn bè, cha mẹ trong gia đình thân yêu."
    },
    {
      step: "04",
      icon: Droplets,
      practiceIcon: ShieldCheck,
      title: "Ngày Lãnh Nhận Hồng Ân",
      sub: "Đặt Tay & Xức Dầu Thánh Chrism",
      badge: "Dấu Ấn Vĩnh Cửu",
      practiceLabel: "Nghi thức thánh thiêng",
      meaning: "Đức Giám Mục đại diện Giáo hội đặt tay khẩn cầu Thần Khí và xức Dầu Thánh Chrism lên trán, ghi dấu ấn thiêng liêng không thể phai nhòa trong tâm hồn.",
      highlight: "Tác phong nghiêm trang, tuyên xưng đức tin dõng dạc cùng Người Đỡ Đầu và sốt sắng đón nhận ấn tín ơn Chúa Thánh Thần."
    },
    {
      step: "05",
      icon: Compass,
      practiceIcon: CheckCircle2,
      title: "Ba Sứ Mạng Kitô Hữu",
      sub: "Ngôn Sứ – Tư Tế – Vương Đế",
      badge: "Trưởng Thành Đức Tin",
      practiceLabel: "Sứ mạng đời thường",
      meaning: "Trưởng thành đức tin là được sai đi làm chứng. Các em sống sứ mạng Tư Tế (cầu nguyện), Ngôn Sứ (loan báo sự thật) và Vương Đế (phục vụ tha nhân).",
      highlight: "Dám sống thật thà, không gian lận học đường và biết mở lòng chia sẻ, nâng đỡ những bạn bè yếu thế quanh mình."
    },
    {
      step: "06",
      icon: Flame,
      practiceIcon: Sparkles,
      title: "Sống Tinh Thần Kim Hoan",
      sub: "Kim Tâm Quảng Đại – Hoan Dũng Hy Sinh",
      badge: "Chứng Nhân Giữa Đời",
      practiceLabel: "Châm ngôn hành động",
      meaning: "Khăn vàng có viền (Cơ Kim Hoan HTDC) nhắc nhở ngọn lửa nhiệt huyết. Các em hăng say tham gia sinh hoạt Xứ đoàn, phụng sự bàn thờ và tích cực làm việc bác ái.",
      highlight: "Sống châm ngôn Hùng Tâm Dũng Chí: Vui vẻ, dũng cảm, nhiệt thành phụng sự bàn thờ Chúa và hăng say việc bác ái."
    }
  ];

  // 3 Trụ cột Hội Thánh Tại Gia (Bento Family Hub)
  const familyPillars = [
    {
      title: "Cầu Nguyện Xin Ơn Thánh Thần",
      badge: "Mỗi Tối",
      desc: "Cùng con cầu xin 7 ơn Chúa Thánh Thần soi sáng trí lòng, giúp con biết phân định điều đúng sai và can đảm chọn sự thật trước các cám dỗ học đường.",
      tip: "Dành 3 phút trước giờ ngủ đọc Kinh Cầu Xin Chúa Thánh Thần hoặc Lời kinh tự phát ngắn gọn cùng con.",
      icon: Wind
    },
    {
      title: "Lắng Nghe & Thấu Cảm Tuổi Mới Lớn",
      badge: "Tâm Lý Tuổi 11",
      desc: "Tuổi 11 các em bắt đầu hình thành cái tôi và dễ xao lãng. Cha mẹ hãy là người bạn lớn kiên nhẫn lắng nghe, uốn nắn bằng tình thương thay vì chỉ dùng mệnh lệnh.",
      tip: "Trò chuyện về trường lớp, tôn trọng suy nghĩ của con và hướng con tìm đến Chúa mỗi khi gặp áp lực.",
      icon: Heart
    },
    {
      title: "Đồng Hành Cùng Người Đỡ Đầu",
      badge: "Gương Sống Đức Tin",
      desc: "Cùng gia đình Người Đỡ Đầu gắn kết, nhắc nhở con noi gương đời sống đạo hạnh và tham dự trọn vẹn tuần tĩnh tâm sa mạc trước đại lễ Thêm Sức.",
      tip: "Mời Người Đỡ Đầu cùng dự lễ và động viên tinh thần con trong suốt năm Thêm Sức 2.",
      icon: ShieldCheck
    }
  ];

  // Sanctuary Box (Lời Chúa & Checklist)
  const sanctuaryData = {
    eyebrow: "Hội Thánh Tại Gia · Kim Chỉ Nam",
    quote: "Thánh Thần là Đấng thánh hóa tâm hồn, nhưng chính cha mẹ và gia đình là máng thông chuyển hồng ân của Người đến với con cái bằng đời sống gương mẫu.",
    author: "Giáo Lý Hội Thánh Công Giáo",
    checklistTitle: "Chuẩn Bị Cho Con Trước Đại Lễ Thêm Sức",
    checklist: [
      { label: "Người Đỡ Đầu", text: "Chọn người từ 16 tuổi trở lên, đã Thêm Sức và sống gương mẫu theo Giáo luật." },
      { label: "Tuần Tĩnh Tâm", text: "Động viên con tham dự đầy đủ ngày tĩnh tâm sa mạc và xét mình xưng tội." },
      { label: "Giờ Sinh Hoạt", text: "Đưa con đến trước 07:45 sáng Chúa Nhật (Ca 2) để tham gia sinh hoạt Ngành Kim Hoan." }
    ],
    supportTitle: "Thắc mắc về thủ tục Người Đỡ Đầu?",
    supportDesc: "Liên hệ GLV trưởng khối để được hướng dẫn chi tiết.",
    supportBtnText: "Hỏi GLV",
    supportBtnLink: "/liên-hệ"
  };

  // Cẩm nang FAQ cho Phụ huynh Khối Thêm Sức
  const faqs = [
    {
      q: `Điều kiện để các em được theo học Khối Thêm Sức niên khóa ${academicYear} là gì?`,
      a: `Dành cho các em ${config?.ageText || "10 – 11 tuổi"}: Lớp ${ts1Classes[0]?.group || "Thêm Sức 1"} (${ts1Classes[0]?.ageText || "10 tuổi"} · Sinh năm ${themSuc1BirthYear}) và Lớp ${ts2Classes[0]?.group || "Thêm Sức 2"} (${ts2Classes[0]?.ageText || "11 tuổi"} · Sinh năm ${themSuc2BirthYear}), đã lãnh nhận Bí tích Rửa Tội, đã Rước Lễ Lần Đầu và có tinh thần chuyên cần tham dự Thánh Lễ Chúa Nhật.`
    },
    {
      q: `Lớp ${ts1Classes[0]?.group || "Thêm Sức 1"} và Lớp ${ts2Classes[0]?.group || "Thêm Sức 2"} khác nhau như thế nào trong chương trình đào tạo?`,
      a: `Khối Thêm Sức gồm 2 năm đào tạo bài bản: Năm thứ nhất (${ts1Classes[0]?.group || "Thêm Sức 1"}) tập trung khám phá Ngôi Ba Thiên Chúa, ý nghĩa 7 Ơn Chúa Thánh Thần và rèn luyện căn tính người chiến sĩ Kitô hữu. Năm thứ hai (${ts2Classes[0]?.group || "Thêm Sức 2"}) đi sâu vào các Bí tích Khai Tâm, tĩnh tâm sa mạc, chọn Người Đỡ Đầu và chuẩn bị trực tiếp để lãnh nhận Bí tích Thêm Sức.`
    },
    {
      q: "Tiêu chuẩn chọn Người Đỡ Đầu (Sponsor) cho em lãnh nhận Bí tích Thêm Sức quy định ra sao?",
      a: "Theo Giáo luật và quy định của Giáo phận: Người Đỡ Đầu phải là người Công giáo đã lãnh nhận trọn vẹn 3 Bí tích Khai Tâm (Rửa Tội, Thánh Thể, Thêm Sức), từ 16 tuổi trở lên, có đời sống đức tin gương mẫu, không mắc ngăn trở theo Giáo luật và sẵn sàng đồng hành, nâng đỡ đời sống đạo của em."
    },
    {
      q: "Trang phục của các em trong Ngày Đại Lễ Thêm Sức quy định như thế nào?",
      a: `Theo truyền thống trang nghiêm của Giáo xứ An Ngãi: Các em mặc lễ phục thụng trắng (albs) có viền quàng cổ màu Vàng đặc trưng của ${config?.nganh || "Ngành Kim Hoan"} Hùng Tâm Dũng Chí. Bé gái kẹp tóc gọn gàng, bé trai mang giày sẫm màu lịch sự, tác phong trang nghiêm, sốt sắng.`
    },
    {
      q: "Phụ huynh và Người Đỡ Đầu có cần tham gia tĩnh tâm và xưng tội trước Ngày Lễ không?",
      a: "Có. Ban Giáo lý và Quý Cha luôn tổ chức buổi tĩnh tâm và giải tội đặc biệt dành riêng cho phụ huynh và người đỡ đầu trước ngày đại lễ. Sự hiệp thông sốt sắng của gia đình là điểm tựa thiêng liêng vững chắc nhất cho ngày con trưởng thành trong đức tin."
    }
  ];

  return (
    <div className="khoi-page theme-them-suc">
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
                  <span aria-hidden="true">{config?.hero?.pillIcon || "🔥"}</span>
                  <span>{config?.hero?.pillText || `${config?.nganh || "Ngành Kim Hoan"} HTDC · ${config?.name || "Khối Thêm Sức"}`}</span>
                </div>
              </Motion.div>

              <Motion.h1 variants={heroItemVariants} className="khoi-hero-title">
                {config?.hero?.titleLine1 || "Thần Khí Ban Ơn"}<br />
                <em>{config?.hero?.titleLine2 || "Vững Bước Dấn Thân"}</em>
              </Motion.h1>

              <Motion.p variants={heroItemVariants} className="khoi-hero-desc">
                {config?.hero?.desc || "Lãnh nhận ấn tín ơn Chúa Thánh Thần, can đảm tuyên xưng đức tin và trở nên người Kitô hữu trưởng thành, sẵn sàng phục vụ Giáo xứ và tha nhân."}
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

            {/* Cột phải: Khung ảnh Khối Thêm Sức & Floating Badge */}
            <Motion.div variants={heroItemVariants}>
              <div className="khoi-hero-image-card">
                <img
                  src={config?.hero?.image || asset("/images/khoithemsuc-anngai.jpg")}
                  alt={config?.hero?.imageAlt || "Các em Khối Thêm Sức Giáo xứ An Ngãi"}
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
                      {config?.hero?.floatingBadge?.title || "Hồng Ân 7 Ơn Chúa Thánh Thần"}
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
            ariaLabel="Tổng quan Khối Thêm Sức"
            age={config?.tuoi || config?.ageText || "10 – 11 tuổi"}
            ageDetail={`Sinh năm ${themSuc2BirthYear}–${themSuc1BirthYear}`}
            classCount={totalClasses}
            classDetail={config?.grades || "Thêm Sức 1 và 2"}
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
              <span>Khối Thêm Sức</span>{" "}
              <em className="block sm:inline whitespace-nowrap">Giáo xứ An Ngãi</em>
            </h2>
            <p className="khoi-section-desc">
              Phòng Giáo lý, quý Soeur và Giáo lý viên phụ trách {totalClasses} lớp học thuộc {config?.nganh || "Ngành Kim Hoan"}.
            </p>
          </Motion.div>

          {/* Bộ lọc phân tầng khối học */}
          <div className="khoi-stage-filter-bar khoi-stage-filter-bar--three" role="group" aria-label="Lọc lớp Khối Thêm Sức">
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
              className={`khoi-filter-pill ${selectedGroup === "ts1" ? "active" : ""}`}
              aria-pressed={selectedGroup === "ts1"}
              onClick={() => setSelectedGroup("ts1")}
            >
              <span className="khoi-filter-label">Thêm Sức 1</span>
              <span className="khoi-filter-meta">10 tuổi · {ts1Classes.length} lớp</span>
            </button>
            <button
              type="button"
              className={`khoi-filter-pill ${selectedGroup === "ts2" ? "active" : ""}`}
              aria-pressed={selectedGroup === "ts2"}
              onClick={() => setSelectedGroup("ts2")}
            >
              <span className="khoi-filter-label">Thêm Sức 2</span>
              <span className="khoi-filter-meta">11 tuổi · {ts2Classes.length} lớp</span>
            </button>
          </div>

          <div role="status" aria-live="polite" className="sr-only">
            {selectedGroup === "all" && `Đang hiển thị tất cả ${totalClasses} lớp học`}
            {selectedGroup === "ts1" && `Đang hiển thị ${ts1Classes.length} lớp Thêm Sức 1`}
            {selectedGroup === "ts2" && `Đang hiển thị ${ts2Classes.length} lớp Thêm Sức 2`}
          </div>

          {/* NHÓM 1: THÊM SỨC 1 (10 TUỔI) */}
          {(selectedGroup === "all" || selectedGroup === "ts1") && (
            <Motion.div className="khoi-group-block" {...sectionRevealProps}>
              <div className="khoi-stage-header">
                <div className="khoi-stage-title-wrap">
                  <span className="khoi-stage-num" aria-hidden="true">01</span>
                  <div>
                    <h3 className="khoi-stage-title">Khối Thêm Sức 1</h3>
                    <p className="khoi-stage-subtitle">
                      Năm thứ nhất · Nền tảng căn tính &amp; Ơn Thần Khí
                    </p>
                  </div>
                </div>
                <div className="khoi-stage-pills">
                  <span className="khoi-stage-pill">10 Tuổi</span>
                  <span className="khoi-stage-pill">Sinh năm {themSuc1BirthYear}</span>
                  <span className="khoi-stage-pill">{ts1Classes.length} Lớp (P9, P10, P11)</span>
                </div>
              </div>

              <div className="khoi-class-grid">
                {ts1Classes.map((item) => (
                  <div key={item.id} className="khoi-class-card">
                    {/* TẦNG 1: Head - Badge mã lớp & Vị trí phòng */}
                    <div className="khoi-card-head">
                      <span className="khoi-class-code">
                        {item.name.replace("Lớp Thêm Sức ", "TS ")}
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

                    {/* TẦNG 5: Footer - Giờ học & Trạng thái nề nếp */}
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

          {/* NHÓM 2: THÊM SỨC 2 (11 TUỔI) */}
          {(selectedGroup === "all" || selectedGroup === "ts2") && (
            <Motion.div className="khoi-group-block" {...sectionRevealProps}>
              <div className="khoi-stage-header">
                <div className="khoi-stage-title-wrap">
                  <span className="khoi-stage-num" aria-hidden="true">02</span>
                  <div>
                    <h3 className="khoi-stage-title">Khối Thêm Sức 2</h3>
                    <p className="khoi-stage-subtitle">
                      Năm thứ hai · Tĩnh tâm sa mạc, chọn Người Đỡ Đầu &amp; Lãnh Bí tích Thêm Sức
                    </p>
                  </div>
                </div>
                <div className="khoi-stage-pills">
                  <span className="khoi-stage-pill">11 Tuổi</span>
                  <span className="khoi-stage-pill">Sinh năm {themSuc2BirthYear}</span>
                  <span className="khoi-stage-pill">{ts2Classes.length} Lớp (P5, P6, Nhà họp xứ)</span>
                </div>
              </div>

              <div className="khoi-class-grid">
                {ts2Classes.map((item) => (
                  <div key={item.id} className="khoi-class-card card-ts2">
                    {/* TẦNG 1: Head - Badge mã lớp & Vị trí phòng */}
                    <div className="khoi-card-head">
                      <span className="khoi-class-code">
                        {item.name.replace("Lớp Thêm Sức ", "TS ")}
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

                    {/* TẦNG 5: Footer - Giờ học & Trạng thái nề nếp */}
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
          SECTION 3: LỘ TRÌNH 6 CHẶNG GIÁO LÝ ĐỨC TIN TRỰC QUAN
      ══════════════════════════════════════════════════════════════ */}
      <section className="ts-journey-section">
        <div className="khoi-shell">
          <Motion.div className="khoi-section-header" {...sectionRevealProps}>
            <div className="khoi-eyebrow">
              <span className="khoi-dot" aria-hidden="true" />
              <span>SƯ PHẠM ĐỨC TIN KHỐI THÊM SỨC</span>
            </div>
            <h2 className="khoi-section-title">
              Hành Trình Khám Phá &amp; <em>Lãnh Nhận Thần Khí</em>
            </h2>
            <p className="khoi-section-desc">
              Chương trình đào tạo 6 chặng chuyển hóa từ nhận thức căn bản đến đón nhận 7 ơn thiêng và dấn thân sống ba sứ mạng Kitô hữu.
            </p>
          </Motion.div>

          <Motion.div className="ts-journey-grid" {...sectionRevealProps}>
            {faithJourneySteps.map((card) => {
              const StepIcon = card.icon;
              const PracticeIcon = card.practiceIcon;
              return (
                <div
                  key={card.step}
                  className={`ts-journey-card stage-step-${card.step}`}
                >
                  <div>
                    <div className="ts-journey-card-top">
                      <div className="ts-journey-left-header">
                        <div className="ts-journey-icon-wrap" aria-hidden="true">
                          <StepIcon size={22} />
                        </div>
                        <div>
                          <span className="ts-journey-step-badge">CHẶNG {card.step}</span>
                        </div>
                      </div>
                      <span className="ts-journey-category-pill">{card.badge}</span>
                    </div>

                    <div>
                      <div className="ts-journey-sub">{card.sub}</div>
                      <h3 className="ts-journey-title">{card.title}</h3>
                      <p className="ts-journey-meaning">{card.meaning}</p>
                    </div>
                  </div>

                  <div className="ts-journey-practice-box">
                    <div className="ts-practice-header">
                      <PracticeIcon size={14} aria-hidden="true" />
                      <span>{card.practiceLabel}</span>
                    </div>
                    <div className="ts-practice-content">
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
              <span className="khoi-dot" aria-hidden="true" />
              <span>THỜI GIAN BIỂU CHÚA NHẬT ({timelineData.shiftName.toUpperCase()})</span>
            </div>
            <h2 className="khoi-section-title">
              Nhịp Sống <em>Chúa Nhật</em>
            </h2>
            <p className="khoi-section-desc">
              Lịch trình sinh hoạt sáng Chúa Nhật hàng tuần dành cho toàn bộ đoàn sinh {config?.name || "Khối Thêm Sức"} Giáo xứ An Ngãi.
            </p>
          </Motion.div>

          {/* Thanh ray ngang tiến trình Stepper (Desktop >= 768px) */}
          <div className="ts-stepper-track" aria-hidden="true">
            <div className="ts-stepper-line" />
            <div className="ts-stepper-nodes">
              {timelineSteps.map((step, idx) => (
                <div key={`stepper-${step.time}`} className={`ts-stepper-col ${step.highlight ? "highlight" : ""}`}>
                  <div className="ts-stepper-node">{idx + 1}</div>
                  <span className="ts-stepper-time">{step.time}</span>
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
              <span className="khoi-dot" aria-hidden="true" />
              <span>GÓC PHỤ HUYNH &amp; HỘI THÁNH TẠI GIA · {config?.nganh?.toUpperCase() || "NGÀNH KIM HOAN"}</span>
            </div>
            <h2 className="khoi-section-title">
              Đồng Hành Cùng Con <em>Lãnh Nhận Thần Khí</em>
            </h2>
            <p className="khoi-section-desc">
              Giai đoạn chuẩn bị lãnh nhận Bí tích Thêm Sức gắn liền với tuổi dậy thì nhiều biến chuyển. Cha mẹ và Người Đỡ Đầu chính là điểm tựa vững chắc nhất để con bước vào tuổi trưởng thành đức tin.
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
                Giải Đáp Thắc Mắc Khối Thêm Sức (FAQ)
              </h3>
              <p className="khoi-faq-desc">
                Các thông tin quan trọng về tiêu chuẩn Người Đỡ Đầu, tuổi lãnh nhận Bí tích và học tập Ca 2.
              </p>
            </div>

            <div className="khoi-faq-list">
              {faqs.map((item, idx) => {
                const isOpen = openFaq === idx;
                const faqAnsId = `ts-faq-ans-${idx}`;
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
              <Flame size={16} aria-hidden="true" />
              <span>NIÊN KHÓA {academicYear} · GIÁO XỨ AN NGÃI</span>
            </div>

            <h3 className="khoi-cta-title">
              Trao Cho Con Ngọn Lửa Đức Tin Trưởng Thành
            </h3>

            <p className="khoi-cta-desc">
              Bí tích Thêm Sức là dấu ấn thiêng liêng trao ban sức mạnh để con vững vàng làm chứng nhân giữa đời. Xứ đoàn An Ngãi hân hoan chào đón và cùng gia đình chuẩn bị cho các em một tâm hồn thật thánh thiện.
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
