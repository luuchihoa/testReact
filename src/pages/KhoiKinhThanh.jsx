import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  Users, Clock, MapPin,
  Sparkles, ChevronDown,
  Heart, ShieldCheck, ArrowRight,
  Church, CheckCircle2, Flame, Quote,
  Calendar, BookOpen, Compass, Scroll, Bookmark, Sun
} from "lucide-react";
import { getKhoiKinhThanhData } from "../utils/academicYear.js";
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
import BibleQuickNavigatorModal from "../components/bible/BibleQuickNavigatorModal.jsx";
import KhoiKinhThanhTestament from "../features/khoi/KhoiKinhThanhTestament.jsx";
import "./KhoiKinhThanh.css";

export default function KhoiKinhThanh() {
  const config = getKhoiConfig("kinh-thanh");
  const data = getKhoiKinhThanhData();
  const {
    academicYear,
    kinhThanh1BirthYear,
    kinhThanh2BirthYear,
    birthYearRange,
    classes
  } = data;

  const [openFaq, setOpenFaq] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [activeTab, setActiveTab] = useState("bible"); // "bible" | "lectio"
  const { shouldReduceMotion, heroContainerVariants, heroItemVariants, sectionRevealProps } = useKhoiMotion();

  // Modal tra cứu Kinh Thánh trực tuyến
  const [isNavModalOpen, setIsNavModalOpen] = useState(false);
  const [navModalBookId, setNavModalBookId] = useState(null);
  const [navModalTestament, setNavModalTestament] = useState("all");

  const handleCloseNavModal = useCallback(() => {
    setIsNavModalOpen(false);
  }, []);

  // Thống kê động từ nguồn dữ liệu chuẩn
  const totalClasses = classes.length;
  const totalTeachers = new Set(classes.flatMap((c) => c.teachers)).size;
  const kt1Classes = classes.filter((c) => c.group === "Kinh Thánh 1");
  const kt2Classes = classes.filter((c) => c.group === "Kinh Thánh 2");

  const FloatingIcon = config?.hero?.floatingBadge?.icon || BookOpen;

  // Lịch sinh hoạt tập trung (CENTRAL_MASS & CA_HOC)
  const timelineData = getSectorTimeline(config, classes);
  const timelineSteps = timelineData.steps;

  // Trạng thái tuyển sinh thực tế từ module tuyển sinh trung tâm (hỗ trợ offline CTA hợp lệ)
  const enrollmentStatus = getEnrollmentStatus();
  const enrollmentCTA = getSectorEnrollmentCTA({ status: enrollmentStatus, sectorId: "kinh-thanh" });

  useEffect(() => {
    const prevTitle = document.title;
    document.title = `Khối Kinh Thánh (${config?.grades || "KT 1 & 2"}) · Khăn Đỏ Có Viền · Niên Khóa ${academicYear} | Giáo xứ An Ngãi`;
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

  // Keyboard navigation cho Tabs 73 Sách & Lectio Divina
  const tabList = [
    { id: "bible", label: "73 Cuốn Kinh Thánh", icon: BookOpen },
    { id: "lectio", label: "4 Bước Cầu Nguyện", icon: Sparkles }
  ];

  const handleTabKeyDown = (e) => {
    const currentIndex = tabList.findIndex((t) => t.id === activeTab);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % tabList.length;
      setActiveTab(tabList[nextIndex].id);
      document.getElementById(`kt-tab-${tabList[nextIndex].id}`)?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + tabList.length) % tabList.length;
      setActiveTab(tabList[prevIndex].id);
      document.getElementById(`kt-tab-${tabList[prevIndex].id}`)?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveTab(tabList[0].id);
      document.getElementById(`kt-tab-${tabList[0].id}`)?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveTab(tabList[tabList.length - 1].id);
      document.getElementById(`kt-tab-${tabList[tabList.length - 1].id}`)?.focus();
    }
  };

  // Mở modal tra cứu trực tiếp theo sách hoặc ước
  const handleOpenBookModal = (bookId = null, testament = "all") => {
    setNavModalBookId(bookId);
    setNavModalTestament(testament);
    setIsNavModalOpen(true);
  };

  // 6 Chặng sư phạm đức tin trực quan Ngành Nhiệt Quang (Khối Kinh Thánh)
  const faithJourneySteps = [
    {
      step: "01",
      icon: BookOpen,
      practiceIcon: ShieldCheck,
      title: "Khởi Nguyên Ơn Cứu Độ",
      sub: "Tạo Dựng & Giao Ước (Ngũ Thư)",
      badge: "Ngũ Thư",
      practiceLabel: "Nền tảng đức tin",
      meaning: "Khám phá công trình sáng tạo của Thiên Chúa và Lịch Sử Cứu Độ qua các tổ phụ đức tin Abraham, Isaac, Giacóp cùng người tôi trung giải phóng Môsê.",
      highlight: "Nhận biết Chúa là Đấng Sáng Tạo, biết yêu mến thiên nhiên và giữ lòng trung thành với các lời hứa thánh."
    },
    {
      step: "02",
      icon: Compass,
      practiceIcon: CheckCircle2,
      title: "Dân Chúa Trong Lịch Sử",
      sub: "Xuất Hành, Sa Mạc & Đất Hứa",
      badge: "Sách Lịch Sử",
      practiceLabel: "Bài học trung tín",
      meaning: "Bước đi cùng dân Chúa qua cuộc Xuất Hành giải phóng, 40 năm sa mạc tôi luyện lòng tin và tiến vào Đất Hứa chan hòa tình yêu và ơn lành Thiên Chúa.",
      highlight: "Học bài học tín thác, kiên định vượt qua thử thách học đường và nhận ra bàn tay quan phòng của Chúa."
    },
    {
      step: "03",
      icon: Flame,
      practiceIcon: Sparkles,
      title: "Tiếng Nói Các Ngôn Sứ",
      sub: "Cảnh Tỉnh, Hoán Cải & Trông Đợi",
      badge: "Sách Ngôn Sứ",
      practiceLabel: "Can đảm làm chứng",
      meaning: "Lắng nghe tiếng chuông cảnh tỉnh của các ngôn sứ: can đảm vạch trần bất công, kêu gọi dân Chúa hoán cải, sống công chính và hướng về Đấng Cứu Thế.",
      highlight: "Tập can đảm nói lời sự thật, không gian dối thi cử, xa lánh thói xấu và biết bảo vệ bạn bè yếu thế."
    },
    {
      step: "04",
      icon: Heart,
      practiceIcon: Church,
      title: "Đỉnh Cao Bốn Tin Mừng",
      sub: "Đức Kitô — Ngôi Lời Nhập Thể",
      badge: "Bốn Tin Mừng",
      practiceLabel: "Khuôn mẫu đời sống",
      meaning: "Chiêm ngắm chân dung Chúa Giêsu qua Bốn Tin Mừng: các dụ ngôn Nước Trời, phép lạ yêu thương và đỉnh cao mầu nhiệm Thập Giá — Phục Sinh vinh hiển.",
      highlight: "Chọn Chúa Giêsu làm lý tưởng sống, học gương khiêm hạ và coi Lời Chúa là ngọn đèn dẫn lối tuổi thiếu niên."
    },
    {
      step: "05",
      icon: Scroll,
      practiceIcon: Bookmark,
      title: "Hội Thánh Sống Lời Chúa",
      sub: "Tông Đồ Công Vụ & Các Thư Tín",
      badge: "Tông Đồ & Thư Tín",
      practiceLabel: "Tinh thần hiệp hành",
      meaning: "Sức sống bừng cháy của Hội Thánh sơ khai qua hành trình truyền giáo của Thánh Phaolô và các bức thư mục vụ định hướng đời sống cộng đoàn Kitô hữu.",
      highlight: "Gắn bó với Xứ đoàn, xây dựng tình bạn thánh thiện, biết chia sẻ bác ái và can đảm làm chứng giữa học đường."
    },
    {
      step: "06",
      icon: Sun,
      practiceIcon: Flame,
      title: "Sống Lời Chúa Giữa Đời",
      sub: "Lectio Divina & Tinh Thần Cam",
      badge: "Đời Sống Thiếu Nhi",
      practiceLabel: "Nhiệt tâm quang dũng",
      meaning: "Trưởng thành Khối Kinh Thánh, các em biến Lời Chúa thành của ăn mỗi ngày, thắp sáng lý trí và can đảm sống đức tin trước khi bước lên Khối Vào Đời.",
      highlight: "Tỏa sáng tinh thần Nhiệt Quang: Duy trì thói quen đọc Kinh Thánh, nhiệt tâm phụng sự và quang dũng dấn thân."
    }
  ];

  // 3 Trụ cột Hội Thánh Tại Gia
  const familyPillars = [
    {
      key: "red",
      title: "Mở Trang Kinh Thánh Trong Gia Đình",
      badge: "Gia Đình Cầu Nguyện",
      desc: "Đặt cuốn Kinh Thánh ở nơi trang trọng và dễ thấy trong nhà. Mỗi tuần, cả nhà dành 10 phút trước bữa cơm Chúa Nhật để cùng con đọc một đoạn Tin Mừng ngắn.",
      tip: "Thay vì giáo điều, cha mẹ hãy gợi mở: 'Trong câu chuyện Lời Chúa hôm nay, con ấn tượng nhất chi tiết hay nhân vật nào?'",
      icon: BookOpen
    },
    {
      key: "orange",
      title: "Thấu Cảm Khủng Hoảng Tuổi Dậy Thì",
      badge: "Lắng Nghe Yêu Thương",
      desc: "Lứa tuổi lớp 8–9 bắt đầu khẳng định cái tôi và dễ bị ảnh hưởng bởi mạng xã hội. Cha mẹ hãy là người bạn lớn kiên nhẫn lắng nghe hơn là áp đặt hay chỉ trích gay gắt.",
      tip: "Dành thời gian riêng đi dạo, trò chuyện nhẹ nhàng với con, tôn trọng những băn khoăn về đức tin và luân lý của tuổi thiếu niên.",
      icon: Heart
    },
    {
      key: "purple",
      title: "Tạo Môi Trường Bạn Bè Lành Mạnh",
      badge: "Đồng Hành Cùng Con",
      desc: "Khuyến khích con tích cực tham gia các sinh hoạt Xứ đoàn, ca đoàn và cắm trại ngành để xây dựng tình bạn thánh thiện, tránh xa các cạm bẫy xấu ngoài xã hội.",
      tip: "Quan tâm đến nhóm bạn thân của con, chào đón bạn bè con đến nhà chơi và tạo không khí cởi mở, ấm áp trong gia đình.",
      icon: Sparkles
    }
  ];

  // Sanctuary Box
  const sanctuaryData = {
    eyebrow: "Hội Thánh Tại Gia · Tâm Tình Mục Vụ",
    quote: "Không biết Kinh Thánh là không biết Chúa Kitô. Hãy để Lời Chúa thấm đượm vào từng nếp nghĩ, lời nói và hành vi của người trẻ hôm nay.",
    author: "Thánh Giêrônimô (Tiến Sĩ Hội Thánh)",
    checklistTitle: "3 Việc Nhỏ Cha Mẹ Đồng Hành Chúa Nhật",
    checklist: [
      { label: "Đúng giờ", text: "Đưa con đến trước 06:45 để kịp điểm danh hàng ngũ Ca 1." },
      { label: "Kinh Thánh", text: "Nhắc con mang theo cuốn Tân Ước & sổ tay ghi chép Lời Chúa." },
      { label: "Lắng nghe", text: "Lắng nghe con chia sẻ góc nhìn về bài học Lời Chúa trong tuần." }
    ],
    supportTitle: "Cần trao đổi riêng với GLV?",
    supportDesc: "Ban Giáo lý luôn sẵn sàng lắng nghe mọi hoàn cảnh gia đình.",
    supportBtnText: "Nhắn Tin GLV",
    supportBtnLink: "/liên-hệ"
  };

  // FAQ Phụ Huynh
  const faqs = [
    {
      q: "Khối Kinh Thánh dành cho các em ở độ tuổi nào và học trong bao nhiêu năm?",
      a: "Khối Kinh Thánh (Khăn Đỏ Có Viền HTDC) dành cho thiếu nhi 13–14 tuổi (Lớp 8 và Lớp 9). Chương trình kéo dài 2 năm: Kinh Thánh 1 (Lớp 8) học Cựu Ước & Lịch Sử Cứu Độ; Kinh Thánh 2 (Lớp 9) học Bốn Tin Mừng, Thư Thánh Phaolô và phương pháp Lectio Divina."
    },
    {
      q: "Các em học Khối Kinh Thánh có cần tự trang bị cuốn Kinh Thánh riêng không?",
      a: "Ban Giáo lý khuyến khích mỗi em nên có một cuốn Tân Ước hoặc Kinh Thánh Trọn Bộ (bản dịch CGKPV) để mang theo mỗi Chúa Nhật và đọc tại nhà. Giáo xứ cũng có bản tra cứu điện tử 73 sách tích hợp trực tiếp trên website."
    },
    {
      q: "Phương pháp cầu nguyện Lectio Divina là gì và các em được thực hành thế nào?",
      a: "Lectio Divina (Đọc Lời Chúa trong tâm tình cầu nguyện) là phương pháp truyền thống của Hội Thánh gồm 4 bước: Đọc (Lectio), Suy niệm (Meditatio), Cầu nguyện (Oratio) và Chiêm ngắm/Hành động (Contemplatio). Trong mỗi giờ học, GLV dành 10–15 phút hướng dẫn các em tĩnh lặng và đối thoại riêng với Chúa."
    },
    {
      q: "Thời gian học Ca 1 Chúa Nhật diễn ra như thế nào?",
      a: "Khối Kinh Thánh học Ca 1: Từ 07:00 đến 07:45 học giáo lý tại các phòng học lầu 1 (P3 đến P9), sau đó tham dự Thánh Lễ Toàn Xứ Đoàn từ 08:00 đến 09:00. Xin quý phụ huynh đưa các em đến trước 06:45 để bảo đảm trật tự điểm danh."
    },
    {
      q: "Sau khi hoàn thành Khối Kinh Thánh, các em sẽ học tiếp chương trình gì?",
      a: "Sau khi tốt nghiệp Khối Kinh Thánh (hết lớp 9), các em sẽ chính thức bước lên Khối Vào Đời (Khăn Đỏ Có Viền HTDC · Lớp 10 & 11) để học Học Thuyết Xã Hội Công Giáo (Docat), Youcat và chuẩn bị bước vào ngưỡng cửa đại học, trưởng thành."
    }
  ];

  return (
    <div className={`khoi-page ${config?.themeClass || "theme-kinh-thanh"}`}>
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
                  <span aria-hidden="true">{config?.hero?.pillIcon || "📖"}</span>
                  <span>{config?.hero?.pillText || "Ngành Nhiệt Quang HTDC · Khối Kinh Thánh"}</span>
                </div>
              </Motion.div>

              <Motion.h1 variants={heroItemVariants} className="khoi-hero-title">
                {config?.hero?.titleLine1 || "Đào Sâu Lời Chúa"} <br />
                <em>{config?.hero?.titleLine2 || "Lịch Sử Cứu Độ"}</em>
              </Motion.h1>

              <Motion.p variants={heroItemVariants} className="khoi-hero-desc">
                {config?.hero?.desc || "Khám phá 73 cuốn Sách Thánh Cựu Ước & Tân Ước, suy niệm Lectio Divina và xây dựng nền tảng đức tin vững chắc trên Lời Chúa hằng sống."}
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
                  src={config?.hero?.image || asset("/images/khoikinhthanh-anngai.jpg")}
                  alt={config?.hero?.imageAlt || "Thiếu nhi Khối Kinh Thánh Giáo xứ An Ngãi"}
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
                      {config?.hero?.floatingBadge?.title || "73 Cuốn Sách · Lời Chúa Là Ngọn Đèn Soi"}
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
            ariaLabel="Tổng quan Khối Kinh Thánh"
            age={config?.tuoi || config?.ageText || "13 – 14 tuổi"}
            ageDetail={`Lớp 8 và 9 · sinh năm ${birthYearRange}`}
            classCount={totalClasses}
            classDetail={`${kt1Classes.length} lớp Kinh Thánh 1 · ${kt2Classes.length} lớp Kinh Thánh 2`}
            teacherCount={totalTeachers}
            teamDetail="Đồng hành và huấn giáo"
            timeline={timelineData}
            motionProps={sectionRevealProps}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2: DANH SÁCH 6 LỚP HỌC & GIÁO LÝ VIÊN
      ══════════════════════════════════════════════════════════════ */}
      <section id="danh-sach-lop" tabIndex={-1} className="khoi-section">
        <div className="khoi-shell">
          <Motion.div className="khoi-section-header" {...sectionRevealProps}>
            <div className="khoi-eyebrow">
              <span className="khoi-dot" aria-hidden="true" />
              <span>DANH SÁCH LỚP NIÊN KHÓA {academicYear}</span>
            </div>
            <h2 className="khoi-section-title">
              <span>Khối Kinh Thánh</span>{" "}
              <em className="block sm:inline whitespace-nowrap">Giáo xứ An Ngãi</em>
            </h2>
            <p className="khoi-section-desc">
              Cơ cấu {totalClasses} lớp học (3 lớp Kinh Thánh 1 và 3 lớp Kinh Thánh 2) với đội ngũ {totalTeachers} Giáo lý viên tâm huyết đồng hành và hướng dẫn suy niệm Lời Chúa.
            </p>
          </Motion.div>

          {/* Hỗ trợ Screen Reader */}
          <div role="status" aria-live="polite" className="sr-only">
            {selectedGroup === "all"
              ? `Đang hiển thị tất cả ${totalClasses} lớp học Khối Kinh Thánh.`
              : selectedGroup === "kt1"
                ? `Đang hiển thị ${kt1Classes.length} lớp Kinh Thánh 1.`
                : `Đang hiển thị ${kt2Classes.length} lớp Kinh Thánh 2.`}
          </div>

          {/* Bộ lọc phân tầng lớp học */}
          <div className="khoi-stage-filter-bar khoi-stage-filter-bar--three" role="group" aria-label="Lọc lớp Khối Kinh Thánh">
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
              className={`khoi-filter-pill ${selectedGroup === "kt1" ? "active" : ""}`}
              aria-pressed={selectedGroup === "kt1"}
              onClick={() => setSelectedGroup("kt1")}
            >
              <span className="khoi-filter-label">Kinh Thánh 1</span>
              <span className="khoi-filter-meta">{kt1Classes.length} lớp</span>
            </button>
            <button
              type="button"
              className={`khoi-filter-pill ${selectedGroup === "kt2" ? "active" : ""}`}
              aria-pressed={selectedGroup === "kt2"}
              onClick={() => setSelectedGroup("kt2")}
            >
              <span className="khoi-filter-label">Kinh Thánh 2</span>
              <span className="khoi-filter-meta">{kt2Classes.length} lớp</span>
            </button>
          </div>

          {/* NHÓM 1: KINH THÁNH 1 */}
          {(selectedGroup === "all" || selectedGroup === "kt1") && (
            <div className="khoi-group-block">
              <div className="khoi-stage-header">
                <div className="khoi-stage-title-wrap">
                  <span className="khoi-stage-num" aria-hidden="true">01</span>
                  <div>
                    <h3 className="khoi-stage-title">Khối Kinh Thánh 1</h3>
                    <p className="khoi-stage-subtitle">
                      Cựu Ước, lịch sử cứu độ và các sách khôn ngoan
                    </p>
                  </div>
                </div>
                <div className="khoi-stage-pills">
                  <span className="khoi-stage-pill">Lớp 8 · 13 tuổi</span>
                  <span className="khoi-stage-pill">Sinh năm {kinhThanh1BirthYear}</span>
                  <span className="khoi-stage-pill">{kt1Classes.length} lớp</span>
                  <span className="khoi-stage-pill">Ca 1 · 07:00–07:45</span>
                </div>
              </div>

              <div className="khoi-class-grid">
                {kt1Classes.map((item) => (
                  <div
                    key={item.id}
                    className="khoi-class-card"
                  >
                    {/* TẦNG 1: Head - Mã lớp & Vị trí phòng */}
                    <div className="khoi-card-head">
                      <span className="khoi-class-code">
                        {item.name.replace("Lớp Kinh Thánh ", "KT ")}
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
          )}

          {/* NHÓM 2: KINH THÁNH 2 */}
          {(selectedGroup === "all" || selectedGroup === "kt2") && (
            <div className="khoi-group-block">
              <div className="khoi-stage-header">
                <div className="khoi-stage-title-wrap">
                  <span className="khoi-stage-num" aria-hidden="true">02</span>
                  <div>
                    <h3 className="khoi-stage-title">Khối Kinh Thánh 2</h3>
                    <p className="khoi-stage-subtitle">
                      Tân Ước, Tin Mừng và cầu nguyện với Lời Chúa
                    </p>
                  </div>
                </div>
                <div className="khoi-stage-pills">
                  <span className="khoi-stage-pill">Lớp 9 · 14 tuổi</span>
                  <span className="khoi-stage-pill">Sinh năm {kinhThanh2BirthYear}</span>
                  <span className="khoi-stage-pill">{kt2Classes.length} lớp</span>
                  <span className="khoi-stage-pill">Ca 1 · 07:00–07:45</span>
                </div>
              </div>

              <div className="khoi-class-grid">
                {kt2Classes.map((item) => (
                  <div
                    key={item.id}
                    className="khoi-class-card card-kt2"
                  >
                    {/* TẦNG 1: Head - Mã lớp & Vị trí phòng */}
                    <div className="khoi-card-head">
                      <span className="khoi-class-code">
                        {item.name.replace("Lớp Kinh Thánh ", "KT ")}
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
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3: LỘ TRÌNH 6 CHẶNG GIÁO LÝ ĐỨC TIN
      ══════════════════════════════════════════════════════════════ */}
      <section className="kt-journey-section">
        <div className="khoi-shell">
          <Motion.div className="khoi-section-header" {...sectionRevealProps}>
            <div className="khoi-eyebrow">
              <span className="khoi-dot" aria-hidden="true" />
              <span>SƯ PHẠM ĐỨC TIN KHỐI KINH THÁNH</span>
            </div>
            <h2 className="khoi-section-title">
              6 Bước Đào Sâu <em>Lời Chúa</em>
            </h2>
            <p className="khoi-section-desc">
              Hành trình sư phạm đức tin giúp các em 13–14 tuổi xây dựng nền tảng vững chắc trên Lời Chúa từ công trình Tạo Dựng đến đỉnh cao Phục Sinh và sứ vụ làm chứng giữa đời.
            </p>
          </Motion.div>

          <div className="kt-journey-grid">
            {faithJourneySteps.map((step) => {
              const StepIcon = step.icon;
              const PracticeIcon = step.practiceIcon;
              return (
                <Motion.div
                  key={step.step}
                  className={`kt-journey-card stage-step-${step.step}`}
                  {...sectionRevealProps}
                >
                  <div>
                    <div className="kt-journey-card-top">
                      <div className="kt-journey-left-header">
                        <div className="kt-journey-icon-wrap" aria-hidden="true">
                          <StepIcon size={20} />
                        </div>
                        <span className="kt-journey-step-badge">CHẶNG {step.step}</span>
                      </div>
                      <span className="kt-journey-category-pill">{step.badge}</span>
                    </div>

                    <div className="kt-journey-sub">{step.sub}</div>
                    <h3 className="kt-journey-title">{step.title}</h3>
                    <p className="kt-journey-meaning">{step.meaning}</p>
                  </div>

                  <div className="kt-journey-practice-box">
                    <div className="kt-practice-header">
                      <PracticeIcon size={14} aria-hidden="true" />
                      <span>{step.practiceLabel}</span>
                    </div>
                    <div className="kt-practice-content">{step.highlight}</div>
                  </div>
                </Motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4: KHO TÀNG 73 SÁCH & LECTIO DIVINA TABS
      ══════════════════════════════════════════════════════════════ */}
      <section className="kt-testament-section">
        <div className="khoi-shell">
          <Motion.div className="khoi-section-header" {...sectionRevealProps}>
            <div className="khoi-eyebrow">
              <span className="khoi-dot" aria-hidden="true" />
              <span>KHO TÀNG LỜI CHÚA &amp; PHƯƠNG PHÁP CẦU NGUYỆN</span>
            </div>
            <h2 className="khoi-section-title">
              73 Cuốn Sách Thánh &amp; <em>Lectio Divina</em>
            </h2>
            <p className="khoi-section-desc">
              Khám phá toàn bộ 73 cuốn Kinh Thánh Cựu Ước &amp; Tân Ước cùng 4 bước cầu nguyện Lời Chúa truyền thống giúp thanh thiếu niên kết hiệp mật thiết với Thầy Giêsu.
            </p>
          </Motion.div>

          {/* Accessible Tabs */}
          <div className="kt-tab-nav-wrapper">
            <div
              className="kt-tab-nav"
              role="tablist"
              aria-label="Kho Tàng &amp; Phương Pháp Cầu Nguyện"
              onKeyDown={handleTabKeyDown}
            >
              {tabList.map((tab) => {
                const TabIcon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`kt-tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-controls={`panel-${tab.id}`}
                    tabIndex={isSelected ? 0 : -1}
                    className={`kt-tab-btn ${isSelected ? "active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <TabIcon size={17} aria-hidden="true" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <KhoiKinhThanhTestament
            activeTab={activeTab}
            onOpenBookModal={handleOpenBookModal}
          />
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
              Lịch trình sinh hoạt sáng Chúa Nhật hàng tuần dành cho đoàn sinh Khối Kinh Thánh Giáo xứ An Ngãi.
            </p>
          </Motion.div>

          {/* Stepper track desktop */}
          <div className="kt-stepper-track" aria-hidden="true">
            <div className="kt-stepper-line" />
            <div className="kt-stepper-nodes">
              {timelineSteps.map((step, idx) => (
                <div key={step.time} className={`kt-stepper-col ${step.highlight ? "highlight" : ""}`}>
                  <div className="kt-stepper-node">{idx + 1}</div>
                  <span className="kt-stepper-time">{step.time}</span>
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
              Đồng Hành Cùng Con <em>Tuổi Trưởng Thành Lời Chúa</em>
            </h2>
            <p className="khoi-section-desc">
              Lứa tuổi 13–14 có nhiều biến chuyển tâm lý sâu sắc. Mái ấm gia đình gắn kết với Lời Chúa là nơi nương tựa vững chãi nhất cho hành trình trưởng thành của các em.
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
                Các thông tin cần thiết về chương trình Kinh Thánh 1 &amp; 2, tài liệu học tập và sinh hoạt Ngành Nhiệt Quang.
              </p>
            </div>

            <div className="khoi-faq-list">
              {faqs.map((item, idx) => {
                const isOpen = openFaq === idx;
                const faqAnsId = `kt-faq-ans-${idx}`;
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
              <span aria-hidden="true">📖</span>
              <span>NIÊN KHÓA {academicYear} · GIÁO XỨ AN NGÃI</span>
            </div>

            <h3 className="khoi-cta-title">
              Xây Dựng Đời Sống Trên Nền Tảng Lời Chúa
            </h3>

            <p className="khoi-cta-desc">
              Tuổi 13–14 là giai đoạn định hình thế giới quan và nhân cách Kitô hữu. Xứ đoàn Mẹ Mân Côi kính mời quý phụ huynh đồng hành để các em yêu mến Kinh Thánh, thắp sáng lý trí và can đảm sống chứng tá Tin Mừng mỗi ngày.
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

      {/* Modal Tra Cứu 73 Sách Kinh Thánh Trực Tuyến */}
      <BibleQuickNavigatorModal
        isOpen={isNavModalOpen}
        onClose={handleCloseNavModal}
        initialBookId={navModalBookId}
        initialTestament={navModalTestament}
      />
    </div>
  );
}
