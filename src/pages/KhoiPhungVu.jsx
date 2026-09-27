import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  Users, Clock, MapPin,
  Sparkles, ChevronDown,
  Heart, ShieldCheck, ArrowRight,
  Church, CheckCircle2, Flame, Droplets, Quote,
  Calendar, CalendarDays, BookOpen, Compass, Bell
} from "lucide-react";
import { getKhoiPhungVuData } from "../utils/academicYear.js";
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
import KhoiPhungVuLiturgical from "../features/khoi/KhoiPhungVuLiturgical.jsx";
import KhoiPhungVuSacraments from "../features/khoi/KhoiPhungVuSacraments.jsx";
import "./KhoiPhungVu.css";

export default function KhoiPhungVu() {
  const config = getKhoiConfig("phung-vu");
  const data = getKhoiPhungVuData();
  const {
    academicYear,
    phungVuBirthYear,
    classes
  } = data;

  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState("seasons"); // "seasons" | "sacraments"
  const { shouldReduceMotion, heroContainerVariants, heroItemVariants, sectionRevealProps } = useKhoiMotion();

  // Thống kê động từ nguồn dữ liệu chuẩn
  const totalClasses = classes.length;
  const totalTeachers = new Set(classes.flatMap((c) => c.teachers)).size;

  const FloatingIcon = config?.hero?.floatingBadge?.icon || Church;

  // Lịch sinh hoạt tập trung (CENTRAL_MASS & CA_HOC)
  const timelineData = getSectorTimeline(config, classes);
  const timelineSteps = timelineData.steps;

  // Trạng thái tuyển sinh thực tế từ module tuyển sinh trung tâm
  const enrollmentStatus = getEnrollmentStatus();
  const enrollmentCTA = getSectorEnrollmentCTA({ status: enrollmentStatus, sectorId: "phung-vu" });

  useEffect(() => {
    const prevTitle = document.title;
    document.title = `Khối Phụng Vụ (${config?.grades || "Lớp 7"}) · Khăn Da Cam Có Viền · Niên Khóa ${academicYear} | Giáo xứ An Ngãi`;
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

  // Keyboard navigation cho Liturgical Tabs
  const tabList = [
    { id: "seasons", label: "Chu Kỳ Năm Phụng Vụ", icon: CalendarDays },
    { id: "sacraments", label: "Bảy Bí Tích Cứu Độ", icon: Church }
  ];

  const handleTabKeyDown = (e) => {
    const currentIndex = tabList.findIndex((t) => t.id === activeTab);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % tabList.length;
      setActiveTab(tabList[nextIndex].id);
      document.getElementById(`pv-tab-${tabList[nextIndex].id}`)?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + tabList.length) % tabList.length;
      setActiveTab(tabList[prevIndex].id);
      document.getElementById(`pv-tab-${tabList[prevIndex].id}`)?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveTab(tabList[0].id);
      document.getElementById(`pv-tab-${tabList[0].id}`)?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveTab(tabList[tabList.length - 1].id);
      document.getElementById(`pv-tab-${tabList[tabList.length - 1].id}`)?.focus();
    }
  };

  // 6 Chặng sư phạm đức tin trực quan Ngành Nhiệt Quang
  const faithJourneySteps = [
    {
      step: "01",
      icon: Church,
      practiceIcon: BookOpen,
      title: "Căn Bản Đời Thờ Phượng",
      sub: "Phụng Vụ Là Gì?",
      badge: "Nền Tảng",
      practiceLabel: "Hiến chế SC 10",
      meaning: "Hiểu rằng Phụng vụ là hành động thánh thiêng của chính Chúa Kitô cùng toàn thể Dân Chúa. Các em biết mở lòng hiệp dâng trọn vẹn mỗi Chúa Nhật.",
      highlight: "Khắc sâu chân lý: Phụng vụ là nguồn mạch tuôn trào và chóp đỉnh của toàn bộ đời sống đức tin Kitô giáo."
    },
    {
      step: "02",
      icon: Compass,
      practiceIcon: Calendar,
      title: "Vòng Tròn Năm Phụng Vụ",
      sub: "Sống Nhịp Sống Giáo Hội",
      badge: "Thời Gian Thánh",
      practiceLabel: "4 Sắc áo phụng vụ",
      meaning: "Khám phá ý nghĩa các mùa trong năm: Mùa Vọng, Giáng Sinh, Mùa Chay, Tam Nhật Vượt Qua, Phục Sinh và Thường Niên qua từng màu sắc phẩm phục.",
      highlight: "Nhận biết ý nghĩa biểu tượng: Trắng (Vui mừng), Đỏ (Hy sinh/Thần Khí), Tím (Sám hối), Xanh (Hy vọng)."
    },
    {
      step: "03",
      icon: Droplets,
      practiceIcon: ShieldCheck,
      title: "Bảy Cánh Cửa Ân Sủng",
      sub: "Bảy Suối Nguồn Cứu Độ",
      badge: "Ân Sủng",
      practiceLabel: "Dấu chỉ & Ơn thánh",
      meaning: "Hiểu sâu 7 Bí tích chia thành 3 nhóm: Khai tâm (Rửa Tội, Thêm Sức, Thánh Thể), Chữa lành (Hòa Giải, Xức Dầu), và Phục vụ cộng đoàn (Truyền Chức, Hôn Phối).",
      highlight: "Cảm nhận sâu sắc dấu chỉ hữu hình mang lại nguồn ân sủng vô hình dưỡng nuôi linh hồn suốt đời."
    },
    {
      step: "04",
      icon: Heart,
      practiceIcon: Clock,
      title: "Cùng Dâng Thánh Lễ Ý Thức",
      sub: "Đỉnh Cao Của Chúa Nhật",
      badge: "Bàn Tiệc Thánh",
      practiceLabel: "Nghi thức thánh thiêng",
      meaning: "Học hiểu từng phần của Thánh Lễ: Nghi thức đầu lễ, Phụng vụ Lời Chúa, Phụng vụ Thánh Thể và Nghi thức kết lễ để tham gia tích cực bằng trọn vẹn tâm trí.",
      highlight: "Cung kính giây phút Truyền Phép và lắng đọng tâm hồn tạ ơn Chúa ngự vào lòng sau khi rước lễ."
    },
    {
      step: "05",
      icon: Bell,
      practiceIcon: CheckCircle2,
      title: "Phụng Sự Nơi Bàn Thờ",
      sub: "Tác Viên Phụng Vụ",
      badge: "Phục Vụ Bàn Thờ",
      practiceLabel: "Tác phong nề nếp",
      meaning: "Tập dượt các tác vụ cụ thể: Giúp lễ (Lễ sinh), đọc Sách Thánh, dâng lễ vật, giữ trật tự và tham gia ca đoàn phục vụ các cử hành phụng vụ của Xứ đoàn.",
      highlight: "Rèn luyện dáng đi, cử chỉ trang nghiêm, tề chỉnh và tâm hồn khiêm nhường trước Bàn Thờ Chúa."
    },
    {
      step: "06",
      icon: Flame,
      practiceIcon: Sparkles,
      title: "Sống Tinh Thần Nhiệt Quang",
      sub: "Khăn Da Cam Có Viền HTDC",
      badge: "Chứng Nhân Giữa Đời",
      practiceLabel: "Châm ngôn hành động",
      meaning: "Khăn cam có viền (Cơ Nhiệt Quang HTDC) nhắc nhở ngọn lửa nhiệt tâm sốt sắng và sự sáng suốt. Phụng vụ được nối dài bằng đời sống yêu thương, bác ái giữa đời.",
      highlight: "Nhiệt tâm phụng sự Bàn Thờ Chúa – Quang dũng làm chứng giữa đời bằng lòng trung thực và bác ái."
    }
  ];

  // 3 Trụ cột Hội Thánh Tại Gia
  const familyPillars = [
    {
      key: "green",
      title: "Hiệp Dâng Thánh Lễ Ý Thức",
      badge: "Sáng Chúa Nhật",
      desc: "Cùng con đến nhà thờ trước 10 phút, nhắc con tác phong tề chỉnh và cùng ngồi tham dự Thánh Lễ sốt sắng thay vì đứng tản mác ngoài sân.",
      tip: "Giúp con chuẩn bị y phục sạch đẹp, tắt chuông điện thoại và giữ thinh lặng trang nghiêm nơi Nhà Chúa.",
      icon: Church
    },
    {
      key: "purple",
      title: "Đưa Nhịp Phụng Vụ Về Nhà",
      badge: "Mỗi Mùa Phụng Vụ",
      desc: "Cùng con hòa nhịp với Năm Phụng Vụ: thắp nến Vòng Hoa Mùa Vọng, làm hang đá Mùa Giáng Sinh, hãm mình Mùa Chay và vui mừng Mùa Phục Sinh.",
      tip: "Hỏi con hôm nay Cha chủ tế mặc áo màu gì và chia sẻ câu Tin Mừng ngắn trong bữa cơm gia đình.",
      icon: Heart
    },
    {
      key: "orange",
      title: "Khích Lệ Tác Vụ Phục Vụ",
      badge: "Tông Đồ Tuổi 12",
      desc: "Ủng hộ và tạo điều kiện nếu con có nguyện vọng tham gia Ban Lễ Sinh (giúp lễ), đọc Sách Thánh, hát lễ hoặc công tác thiện nguyện của Xứ đoàn.",
      tip: "Phục vụ Bàn Thờ Chúa là vinh dự lớn lao giúp các em rèn luyện tính kỷ luật, khiêm nhường và trách nhiệm.",
      icon: Sparkles
    }
  ];

  // Sanctuary Box
  const sanctuaryData = {
    eyebrow: "Hội Thánh Tại Gia · Tâm Tình Mục Vụ",
    quote: "Phụng vụ của Giáo hội không kết thúc nơi cửa nhà thờ, nhưng được nối dài bằng đời sống yêu thương và lời kinh tạ ơn trong từng mái ấm gia đình.",
    author: "Tông Huấn Familiaris Consortio",
    checklistTitle: "3 Việc Nhỏ Cha Mẹ Đồng Hành Chúa Nhật",
    checklist: [
      { label: "Đúng giờ", text: "Đưa con đến trước 06:45 để kịp điểm danh hàng ngũ Ca 1." },
      { label: "Trang phục", text: "Áo đồng phục trắng sơ-vin, đeo khăn quàng Da Cam có viền ngay ngắn." },
      { label: "Lắng nghe", text: "Hỏi con về bài học Tin Mừng hôm nay trong bữa cơm trưa." }
    ],
    supportTitle: "Cần trao đổi riêng với GLV?",
    supportDesc: "Ban Giáo lý luôn sẵn sàng lắng nghe mọi hoàn cảnh gia đình.",
    supportBtnText: "Nhắn Tin GLV",
    supportBtnLink: "/liên-hệ"
  };

  // FAQ Phụ Huynh
  const faqs = [
    {
      q: "Tại sao các em đã lãnh nhận Bí tích Thêm Sức vẫn cần tiếp tục học Khối Phụng Vụ?",
      a: "Bí tích Thêm Sức là dấu mốc trưởng thành Kitô giáo, không phải điểm kết thúc việc học giáo lý. Khối Phụng Vụ (Lớp 7) giúp các em chuyển từ việc tham dự thụ động sang hiểu biết tường tận và tích cực phụng sự bàn thờ Chúa qua các cử hành thánh thiêng của Giáo Hội."
    },
    {
      q: "Các em học Khối Phụng Vụ có được tham gia Ban Giúp Lễ (Lễ sinh) của Giáo xứ không?",
      a: "Hoàn toàn được và rất được khuyến khích. Các em nam có nguyện vọng sẽ được các anh Huynh Trưởng và Quý Cha hướng dẫn tập dượt nghi thức lễ sinh để phục vụ các Thánh Lễ Chúa Nhật và ngày thường."
    },
    {
      q: "Thời gian học Ca 1 Chúa Nhật có gì khác biệt so với các khối nhỏ?",
      a: "Khối Phụng Vụ thuộc Ca 1 (Ca Sáng 1 dành cho các khối lớn). Các em học giáo lý từ 07:00 đến 07:45 trước khi tham dự Thánh Lễ Toàn Xứ Đoàn lúc 08:00 đến 09:00. Xin quý phụ huynh đưa các em đến nhà thờ trước 06:45 để kịp giờ tập hợp."
    },
    {
      q: "Ý nghĩa của Khăn Quàng Da Cam Có Viền là gì?",
      a: "Khăn Da Cam có viền là màu khăn chính thức của Cơ Nhiệt Quang trong Phong trào Hùng Tâm Dũng Chí. Màu da cam tượng trưng cho ngọn lửa 'Nhiệt tâm' (sốt sắng trong phụng vụ) và ánh sáng 'Quang dũng' (sáng suốt và can đảm làm chứng đức tin giữa đời sống)."
    },
    {
      q: "Giáo trình học của Khối Phụng Vụ gồm những nội dung chính nào?",
      a: "Chương trình dựa trên Hiến chế Phụng Vụ Sacrosanctum Concilium và Giáo lý Hội Thánh Công giáo, tập trung vào: Cấu trúc Thánh Lễ, Mầu nhiệm 7 Bí tích, Chu kỳ Năm Phụng Vụ, Phụng vụ Giờ Kinh và các bài Thánh ca phụng vụ truyền thống."
    }
  ];

  return (
    <div className={`khoi-page ${config?.themeClass || "theme-phung-vu"}`}>
      {/* ══════════════════════════════════════════════════════════════
          SECTION 1: HERO VISUAL-FIRST & STATS
      ══════════════════════════════════════════════════════════════ */}
      <section className="khoi-hero">
        <div className="khoi-shell">
          <Motion.div
            className="khoi-hero-grid"
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Cột trái: Văn bản & CTA */}
            <div className="khoi-hero-left">
              <Motion.div variants={heroItemVariants}>
                <div className="khoi-hero-pill-badge">
                  <span aria-hidden="true">{config?.hero?.pillIcon || "⛪"}</span>
                  <span>{config?.hero?.pillText || "Ngành Nhiệt Quang HTDC · Khối Phụng Vụ"}</span>
                </div>
              </Motion.div>

              <Motion.h1 variants={heroItemVariants} className="khoi-hero-title">
                {config?.hero?.titleLine1 || "Sống Đời Phụng Vụ"} <br />
                <em>{config?.hero?.titleLine2 || "Hiệp Dâng Thánh Lễ"}</em>
              </Motion.h1>

              <Motion.p variants={heroItemVariants} className="khoi-hero-desc">
                {config?.hero?.desc || "Phụng vụ là đỉnh cao và nguồn mạch đời sống Hội Thánh — Khối Phụng Vụ giúp các em 12 tuổi hiểu sâu, yêu mến và tích cực tham dự các cử hành thánh thiêng."}
              </Motion.p>

              <Motion.div variants={heroItemVariants} className="khoi-hero-actions">
                <Link to={enrollmentCTA.heroLink} className="khoi-btn-primary">
                  <span>{enrollmentCTA.heroText}</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <a
                  href="#danh-sach-lop"
                  onClick={handleScrollToClasses}
                  className="khoi-btn-secondary"
                >
                  <Clock size={17} aria-hidden="true" />
                  <span>Xem {totalClasses} Lớp Học</span>
                </a>
              </Motion.div>
            </div>

            {/* Cột phải: Khung ảnh Hero & Floating Badge */}
            <Motion.div variants={heroItemVariants}>
              <div className="khoi-hero-image-card">
                <img
                  src={config?.hero?.image || asset("/images/khoiphungvu-anngai.jpg")}
                  alt={config?.hero?.imageAlt || "Thiếu nhi Khối Phụng Vụ Giáo xứ An Ngãi"}
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
                      {config?.hero?.floatingBadge?.title || "Phụng Sự Bàn Thờ & Đời Sống Phụng Vụ"}
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
            ariaLabel="Tổng quan Khối Phụng Vụ"
            age={config?.tuoi || config?.ageText || "12 tuổi"}
            ageDetail={`Lớp 7 · sinh năm ${phungVuBirthYear}`}
            classCount={totalClasses}
            classDetail="Phụng Vụ 1/1, 1/2 và 1/3"
            teacherCount={totalTeachers}
            teamDetail="Đồng hành và huấn giáo"
            timeline={timelineData}
            motionProps={sectionRevealProps}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2: DANH SÁCH 3 LỚP HỌC & GIÁO LÝ VIÊN
      ══════════════════════════════════════════════════════════════ */}
      <section id="danh-sach-lop" tabIndex={-1} className="khoi-section">
        <div className="khoi-shell">
          <Motion.div className="khoi-section-header" {...sectionRevealProps}>
            <div className="khoi-eyebrow">
              <span className="khoi-dot" aria-hidden="true" />
              <span>DANH SÁCH LỚP NIÊN KHÓA {academicYear}</span>
            </div>
            <h2 className="khoi-section-title">
              <span>Khối Phụng Vụ</span>{" "}
              <em className="block sm:inline whitespace-nowrap">Giáo xứ An Ngãi</em>
            </h2>
            <p className="khoi-section-desc">
              Cơ cấu {totalClasses} lớp học với đội ngũ {totalTeachers} Giáo lý viên tâm huyết đồng hành cùng các em trong giờ học giáo lý và phụng sự bàn thờ.
            </p>
          </Motion.div>

          {/* KHỐI PHỤNG VỤ DUY NHẤT */}
          <div className="khoi-group-block">
            <div className="khoi-stage-header">
              <div className="khoi-stage-title-wrap">
                <span className="khoi-stage-num" aria-hidden="true">01</span>
                <div>
                  <h3 className="khoi-stage-title">Khối Phụng Vụ</h3>
                  <p className="khoi-stage-subtitle">
                    Sống đời phụng vụ, Bí tích và tinh thần phụng sự
                  </p>
                </div>
              </div>
              <div className="khoi-stage-pills">
                <span className="khoi-stage-pill">Lớp 7 · 12 tuổi</span>
                <span className="khoi-stage-pill">Sinh năm {phungVuBirthYear}</span>
                <span className="khoi-stage-pill">{totalClasses} lớp</span>
                <span className="khoi-stage-pill">Ca 1 · 07:00–07:45</span>
              </div>
            </div>

            <div className="khoi-class-grid">
              {classes.map((item) => (
                <div
                  key={item.id}
                  className="khoi-class-card card-pv"
                >
                  {/* TẦNG 1: Head - Mã lớp & Vị trí phòng */}
                  <div className="khoi-card-head">
                    <span className="khoi-class-code">
                      {item.name.replace("Lớp Phụng Vụ ", "PV ")}
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

                  {/* TẦNG 4: Trọng tâm huấn giáo */}
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
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3: LỘ TRÌNH 6 CHẶNG GIÁO LÝ ĐỨC TIN
      ══════════════════════════════════════════════════════════════ */}
      <section className="pv-journey-section">
        <div className="khoi-shell">
          <Motion.div className="khoi-section-header" {...sectionRevealProps}>
            <div className="khoi-eyebrow">
              <span className="khoi-dot" aria-hidden="true" />
              <span>SƯ PHẠM ĐỨC TIN KHỐI PHỤNG VỤ</span>
            </div>
            <h2 className="khoi-section-title">
              6 Bước Trưởng Thành <em>Trong Phụng Vụ</em>
            </h2>
            <p className="khoi-section-desc">
              Hành trình sư phạm đức tin giúp các em 12 tuổi chuyển từ người tham dự thụ động thành người yêu mến và tích cực phụng sự bàn thờ thánh thiêng.
            </p>
          </Motion.div>

          <div className="pv-journey-grid">
            {faithJourneySteps.map((step) => {
              const StepIcon = step.icon;
              const PracticeIcon = step.practiceIcon;
              return (
                <Motion.div
                  key={step.step}
                  className={`pv-journey-card stage-step-${step.step}`}
                  {...sectionRevealProps}
                >
                  <div>
                    <div className="pv-journey-card-top">
                      <div className="pv-journey-left-header">
                        <div className="pv-journey-icon-wrap" aria-hidden="true">
                          <StepIcon size={20} />
                        </div>
                        <span className="pv-journey-step-badge">CHẶNG {step.step}</span>
                      </div>
                      <span className="pv-journey-category-pill">{step.badge}</span>
                    </div>

                    <div className="pv-journey-sub">{step.sub}</div>
                    <h3 className="pv-journey-title">{step.title}</h3>
                    <p className="pv-journey-meaning">{step.meaning}</p>
                  </div>

                  <div className="pv-journey-practice-box">
                    <div className="pv-practice-header">
                      <PracticeIcon size={14} aria-hidden="true" />
                      <span>{step.practiceLabel}</span>
                    </div>
                    <div className="pv-practice-content">{step.highlight}</div>
                  </div>
                </Motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4: KHO TÀNG HỘI THÁNH (TABS PHỤNG VỤ & BÍ TÍCH)
      ══════════════════════════════════════════════════════════════ */}
      <section className="pv-liturgical-section">
        <div className="khoi-shell">
          <Motion.div className="khoi-section-header" {...sectionRevealProps}>
            <div className="khoi-eyebrow">
              <span className="khoi-dot" aria-hidden="true" />
              <span>KHO TÀNG ĐỨC TIN HỘI THÁNH</span>
            </div>
            <h2 className="khoi-section-title">
              Năm Phụng Vụ &amp; <em>Bảy Bí Tích Cứu Độ</em>
            </h2>
            <p className="khoi-section-desc">
              Khám phá nhịp sống thiêng liêng của Giáo Hội qua các mùa phụng vụ sống động và 7 suối nguồn ân sủng nuôi dưỡng linh hồn Kitô hữu.
            </p>
          </Motion.div>

          {/* Accessible Tabs */}
          <div className="pv-liturgical-tabs-wrapper">
            <div
              className="pv-liturgical-tabs"
              role="tablist"
              aria-label="Kho tàng Hội Thánh"
              onKeyDown={handleTabKeyDown}
            >
              {tabList.map((tab) => {
                const TabIcon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`pv-tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-controls={`pv-panel-${tab.id}`}
                    tabIndex={isSelected ? 0 : -1}
                    className={`pv-tab-btn ${isSelected ? "active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <TabIcon size={16} aria-hidden="true" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tabpanel 1: Chu Kỳ Năm Phụng Vụ */}
          <div
            id="pv-panel-seasons"
            role="tabpanel"
            aria-labelledby="pv-tab-seasons"
            hidden={activeTab !== "seasons"}
          >
            {activeTab === "seasons" && <KhoiPhungVuLiturgical />}
          </div>

          {/* Tabpanel 2: Bảy Bí Tích Cứu Độ */}
          <div
            id="pv-panel-sacraments"
            role="tabpanel"
            aria-labelledby="pv-tab-sacraments"
            hidden={activeTab !== "sacraments"}
          >
            {activeTab === "sacraments" && <KhoiPhungVuSacraments />}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5: TIMELINE CHÚA NHẬT (CA 1)
      ══════════════════════════════════════════════════════════════ */}
      <section className="khoi-section khoi-timeline-section">
        <div className="khoi-shell">
          <Motion.div className="khoi-section-header" {...sectionRevealProps}>
            <div className="khoi-eyebrow">
              <span className="khoi-dot" aria-hidden="true" />
              <span>THỜI GIAN BIỂU CHÚA NHẬT ({timelineData.shiftName})</span>
            </div>
            <h2 className="khoi-section-title">
              Nhịp Sống <em>Chúa Nhật</em>
            </h2>
            <p className="khoi-section-desc">
              Lịch trình sinh hoạt sáng Chúa Nhật hàng tuần dành cho đoàn sinh Khối Phụng Vụ Giáo xứ An Ngãi.
            </p>
          </Motion.div>

          {/* Stepper track desktop */}
          <div className="pv-stepper-track" aria-hidden="true">
            <div className="pv-stepper-line" />
            <div className="pv-stepper-nodes">
              {timelineSteps.map((step, idx) => (
                <div key={step.time} className={`pv-stepper-col ${step.highlight ? "highlight" : ""}`}>
                  <div className="pv-stepper-node">{idx + 1}</div>
                  <span className="pv-stepper-time">{step.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline compact grid */}
          <div className="khoi-compact-timeline">
            {timelineSteps.map((step) => (
              <div key={step.time} className={`khoi-time-card ${step.highlight ? "highlight" : ""}`}>
                <div className="khoi-time-header">
                  <span className="khoi-time-badge">{step.time}</span>
                  {step.tag && (
                    <span className="khoi-time-tag">{step.tag}</span>
                  )}
                </div>
                <div>
                  <div className="khoi-time-label">{step.label}</div>
                  <p className="khoi-time-sub">{step.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="khoi-timeline-note">
            <ShieldCheck size={18} aria-hidden="true" className="khoi-timeline-note-icon" />
            <span><strong>Lưu ý nề nếp:</strong> Phụ huynh vui lòng nhắc nhở các em đến đúng giờ (trước 06:45) tại sảnh Nhà Thờ và các phòng học Ca 1 để bảo đảm nề nếp.</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 6: GÓC PHỤ HUYNH & HỘI THÁNH TẠI GIA
      ══════════════════════════════════════════════════════════════ */}
      <section id="dong-hanh" tabIndex={-1} className="khoi-section">
        <div className="khoi-shell">
          <Motion.div className="khoi-section-header" {...sectionRevealProps}>
            <div className="khoi-eyebrow">
              <span className="khoi-dot" aria-hidden="true" />
              <span>GÓC PHỤ HUYNH &amp; HỘI THÁNH TẠI GIA</span>
            </div>
            <h2 className="khoi-section-title">
              Đồng Hành Cùng Con <em>Trong Phụng Vụ</em>
            </h2>
            <p className="khoi-section-desc">
              Tuổi 12 là dấu mốc các em bước vào chiều sâu phụng vụ sau Bí tích Thêm Sức. Mái ấm gia đình chính là nơi nuôi dưỡng ngọn lửa sốt mến để con gắn bó bền chặt với Bàn Thờ Chúa.
            </p>
          </Motion.div>

          <div className="khoi-family-bento-grid">
            {/* Cột trái: 3 Trụ cột hành động */}
            <div className="khoi-pillars-stack">
              {familyPillars.map((item) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={item.key}
                    className="khoi-pillar-card"
                  >
                    <div className="khoi-pillar-top">
                      <div className="khoi-pillar-header-left">
                        <div className="khoi-pillar-icon-wrap" aria-hidden="true">
                          <IconComp size={22} />
                        </div>
                        <h3 className="khoi-pillar-title">{item.title}</h3>
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
          </div>

          {/* FAQ Accordion */}
          <Motion.div className="khoi-faq-wrapper" {...sectionRevealProps}>
            <div className="khoi-faq-header">
              <h3 className="khoi-faq-title">
                Giải Đáp Thắc Mắc Phụ Huynh (FAQ)
              </h3>
              <p className="khoi-faq-desc">
                Các thông tin cần thiết về chương trình giáo lý sau Thêm Sức, sinh hoạt Ngành Nhiệt Quang và tác vụ lễ sinh.
              </p>
            </div>

            <div className="khoi-faq-list">
              {faqs.map((item, idx) => {
                const isOpen = openFaq === idx;
                const faqAnsId = `pv-faq-ans-${idx}`;
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

          {/* CTA BANNER */}
          <Motion.div className="khoi-cta-banner" {...sectionRevealProps}>
            <div className="khoi-cta-badge">
              <span aria-hidden="true">🔥</span>
              <span>NIÊN KHÓA {academicYear} · GIÁO XỨ AN NGÃI</span>
            </div>

            <h3 className="khoi-cta-title">
              Cùng Con Hiểu Sâu &amp; Yêu Mến Thánh Lễ
            </h3>

            <p className="khoi-cta-desc">
              Tuổi 12 là dấu mốc các em bước vào chiều sâu phụng vụ sau Bí tích Thêm Sức. Xứ đoàn Mẹ Mân Côi kính mời quý phụ huynh đồng hành để các em hiểu sâu ý nghĩa Thánh Lễ, nhiệt tâm phụng sự bàn thờ Chúa và hăng say sống đức tin mỗi ngày.
            </p>

            <div className="khoi-cta-actions">
              <Link to={enrollmentCTA.bannerLink} className="khoi-btn-primary">
                <Sparkles size={18} aria-hidden="true" />
                <span>{enrollmentCTA.bannerText}</span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>

              <div className="khoi-cta-secondary-group">
                <Link to="/lịch-học" className="khoi-btn-secondary">
                  <Clock size={15} aria-hidden="true" />
                  <span>Xem Lịch Ca 1</span>
                </Link>
                <Link to="/liên-hệ" className="khoi-btn-secondary">
                  <Church size={15} aria-hidden="true" />
                  <span>Liên Hệ Ban Giáo Lý</span>
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
