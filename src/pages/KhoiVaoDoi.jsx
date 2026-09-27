import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  Users, Clock, MapPin,
  Sparkles, ChevronDown,
  Heart, ShieldCheck, ArrowRight,
  Church, CheckCircle2, Flame, Quote,
  Calendar, Globe, Lightbulb, Award, Compass, BookOpen
} from "lucide-react";
import { getKhoiVaoDoiData } from "../utils/academicYear.js";
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
import DocumentReaderModal from "../components/shared/DocumentReaderModal.jsx";
import { DOCUMENTS_DATA } from "../data/documents/docData.js";
import { getDocumentById } from "../lib/documentsApi.js";
import { downloadDocument } from "../utils/documentDownloadHelper.js";
import { useToast } from "../components/ui/ToastContext.jsx";
import KhoiVaoDoiPillars from "../features/khoi/KhoiVaoDoiPillars.jsx";
import "./KhoiVaoDoi.css";

export default function KhoiVaoDoi() {
  const config = getKhoiConfig("vao-doi");
  const data = getKhoiVaoDoiData();
  const {
    academicYear,
    vaoDoi1BirthYear,
    vaoDoi2BirthYear,
    birthYearRange,
    classes
  } = data;

  const { showToast } = useToast();
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [readingDoc, setReadingDoc] = useState(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const { shouldReduceMotion, heroContainerVariants, heroItemVariants, sectionRevealProps } = useKhoiMotion();

  // Thống kê động từ nguồn dữ liệu chuẩn
  const totalClasses = classes.length;
  const totalTeachers = new Set(classes.flatMap((c) => c.teachers)).size;
  const vd1Classes = classes.filter((c) => c.group === "Vào Đời 1");
  const vd2Classes = classes.filter((c) => c.group === "Vào Đời 2");

  const FloatingIcon = config?.hero?.floatingBadge?.icon || Flame;

  // Lịch sinh hoạt tập trung (CENTRAL_MASS & CA_HOC)
  const timelineData = getSectorTimeline(config, classes);
  const timelineSteps = timelineData.steps;

  // Trạng thái tuyển sinh thực tế từ module tuyển sinh trung tâm (hỗ trợ offline CTA hợp lệ)
  const enrollmentStatus = getEnrollmentStatus();
  const enrollmentCTA = getSectorEnrollmentCTA({ status: enrollmentStatus, sectorId: "vao-doi" });

  const handleOpenReader = async (docId) => {
    // Ưu tiên hiển thị tức thì từ bộ nhớ local (0ms lag)
    const localDoc = DOCUMENTS_DATA[docId];
    if (localDoc) {
      setReadingDoc(localDoc);
      setIsReaderOpen(true);
    }

    // Đồng bộ tiếp tục từ database Supabase nếu có phiên bản mới hơn
    try {
      const freshDoc = await getDocumentById(docId);
      if (freshDoc) {
        setReadingDoc(freshDoc);
        setIsReaderOpen(true);
      } else if (!localDoc) {
        showToast?.("Tài liệu đang được cập nhật số hóa.", "info");
      }
    } catch {
      if (!localDoc) {
        showToast?.("Tài liệu đang được cập nhật số hóa.", "info");
      }
    }
  };

  const handleDownloadDoc = (doc) => {
    downloadDocument(doc, showToast);
  };

  const handleCloseReader = useCallback(() => {
    setIsReaderOpen(false);
  }, []);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = `Khối Vào Đời (${config?.grades || "Lớp 10 & 11"}) · Khăn Đỏ Có Viền · Niên Khóa ${academicYear} | Giáo xứ An Ngãi`;
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

  // 6 Chặng sư phạm đức tin dấn thân Ngành Chinh Chiến HTDC
  const faithJourneySteps = [
    {
      step: "01",
      icon: Compass,
      practiceIcon: ShieldCheck,
      badge: "Căn Tính Đức Tin",
      title: "Căn Tính Người Trẻ Kitô Hữu",
      sub: "Tôi là ai trong mắt Thiên Chúa?",
      meaning: "Định vị bản ngã và xác tín ơn làm con cái Thiên Chúa giữa tuổi dậy thì. Vượt qua những bất an tâm lý, áp lực so sánh mạng xã hội để trân quý vẻ đẹp độc đáo Chúa ban cho mỗi cá vị.",
      practiceLabel: "Rèn Luyện Bản Ngã",
      highlight: "Nhận biết phẩm giá bản thân, xây dựng lòng tự trọng Kitô giáo và sống thật với Chúa cùng tha nhân."
    },
    {
      step: "02",
      icon: Globe,
      practiceIcon: Sparkles,
      badge: "Văn Hóa & Kỷ Nguyên Số",
      title: "Đối Thoại Văn Hóa & Thời Đại AI",
      sub: "Giữ ngọn đèn đức tin trước thời đại số",
      meaning: "Phân định khôn ngoan trước các trào lưu tiêu thụ, lối sống ảo, văn hóa hưởng thụ và thuyết tương đối đạo đức. Học cách dùng mạng xã hội và công nghệ như phương tiện loan báo Tin Mừng.",
      practiceLabel: "Làm Chủ Không Gian Mạng",
      highlight: "Làm chủ công nghệ, bảo vệ tâm hồn trong sạch, ứng xử văn minh và chân thật nơi môi trường số."
    },
    {
      step: "03",
      icon: ShieldCheck,
      practiceIcon: Compass,
      badge: "Phân Định Đạo Đức",
      title: "Lương Tâm & Phân Định Luân Lý",
      sub: "La bàn nội tâm cho mọi ngã rẽ cuộc đời",
      meaning: "Đào sâu huấn lệnh Tin Mừng và luân lý Kitô giáo: học cách lắng nghe tiếng nói của lương tâm ngay chính, can đảm chọn điều thiện, bài trừ gian lận học đường và chối từ cám dỗ tuổi trẻ.",
      practiceLabel: "Tập Thói Quen Phản Tỉnh",
      highlight: "Tập thói quen xét mình cuối ngày, can đảm đứng về phía sự thật và bảo vệ bạn bè yếu thế."
    },
    {
      step: "04",
      icon: Heart,
      practiceIcon: Heart,
      badge: "Tình Yêu & Hôn Nhân",
      title: "Tình Bạn, Tình Yêu & Khiết Tịnh",
      sub: "Xây đắp tương quan trong sáng và bền vững",
      meaning: "Hiểu đúng ý nghĩa thần học thân xác, tình bạn cao đẹp và tình yêu đôi lứa theo thánh ý Thiên Chúa. Tôn trọng sự sống, gìn giữ đức khiết tịnh và chuẩn bị hành trang cho đời sống gia đình Kitô giáo tương lai.",
      practiceLabel: "Tôn Trọng Sự Sống",
      highlight: "Tôn trọng bạn khác giới, xây dựng tình bạn thánh thiện và nhìn nhận tình yêu bằng con mắt đức tin."
    },
    {
      step: "05",
      icon: Lightbulb,
      practiceIcon: CheckCircle2,
      badge: "Học Thuyết Xã Hội",
      title: "Học Thuyết Docat & Bác Ái Dấn Thân",
      sub: "Trái tim chạnh thương trước nỗi đau đồng loại",
      meaning: "Tiếp cận 12 nguyên tắc Học thuyết Xã hội Công giáo: nhân phẩm, công ích, tình liên đới và bổ trợ. Dấn thân cụ thể vào các hoạt động bác ái, phục vụ người nghèo và bảo vệ môi trường theo Laudato Si'.",
      practiceLabel: "Hành Động Bác Ái Cụ Thể",
      highlight: "Biến đức tin thành hành động bác ái cụ thể, sống tinh thần dấn thân phục vụ của người Hiệp Sĩ Kitô."
    },
    {
      step: "06",
      icon: Flame,
      practiceIcon: Award,
      badge: "Sứ Vụ Trưởng Thành",
      title: "Sứ Vụ Chứng Nhân & Tuyên Hứa Trưởng Thành",
      sub: "Men muối giữa giảng đường đại học và xã hội",
      meaning: "Khép lại hành trình giáo lý thiếu nhi, các bạn trẻ cử hành Nghi thức Tuyên Hứa Trưởng Thành Vào Đời, sẵn sàng bước vào ngưỡng cửa đại học hoặc lập nghiệp với tư cách là những tông đồ giáo dân nhiệt thành.",
      practiceLabel: "Tông Đồ Giáo Dân",
      highlight: "Chiến tâm vượt khó, Chinh dũng dấn thân: Tự hào sống đức tin và tích cực tham gia Giới Trẻ Giáo xứ."
    }
  ];

  // 3 Trụ cột hành động đồng hành người trẻ (Youth Hub Cột Trái)
  const youthPillars = [
    {
      key: "red",
      icon: Compass,
      title: "Đồng Hành Phân Định Ơn Gọi",
      badge: "Tương Lai & Ơn Gọi",
      desc: "Ban Huynh Trưởng và Quý Soeur luôn lắng nghe, đồng hành phân định những băn khoăn về chọn trường, chọn ngành nghề, tình bạn tình yêu và ơn gọi dâng hiến.",
      tip: "Đừng ngần ngại trò chuyện riêng cùng GLV hoặc Cha Tuyên Úy khi đứng trước những lựa chọn lớn của cuộc đời."
    },
    {
      key: "emerald",
      icon: Lightbulb,
      title: "Dự Án Bác Ái & Xã Hội (Docat)",
      badge: "Hành Động Bác Ái",
      desc: "Hiện thực hóa Lời Chúa qua các chuyến viếng thăm người nghèo, mái ấm khuyết tật và các chiến dịch xanh bảo vệ môi trường theo tinh thần Laudato Si'.",
      tip: "Mỗi học kỳ, mỗi lớp Vào Đời cùng lên kế hoạch và tự tay thực hiện một dự án phục vụ cộng đoàn cụ thể."
    },
    {
      key: "amber",
      icon: Users,
      title: "Không Gian Giới Trẻ Lành Mạnh",
      badge: "Kết Nối Huynh Đệ",
      desc: "Môi trường kết nối bạn bè cùng đức tin: các buổi cà phê chuyên đề, đêm diễn nguyện, trại hè Chinh Chiến và giải bóng đá giao hữu Giới Trẻ Giáo xứ.",
      tip: "Tham gia tích cực vào các ban Phụng vụ, Ca đoàn và Ban Truyền thông Xứ đoàn để phát huy sở trường bản thân."
    }
  ];

  // Mái ấm & Checklist hành trang vào đời (Youth Hub Cột Phải - Sanctuary Box)
  const youthSanctuaryData = {
    eyebrow: "LỜI NHẮN NHỦ GỬI NGƯỜI TRẺ · THÁNH GIOAN PHAOLÔ II",
    author: "Thánh Giáo Hoàng Gioan Phaolô II",
    quote: "“Đừng sợ! Đừng thỏa hiệp với sự tầm thường. Hãy mở rộng cửa tâm hồn cho Đức Kitô, vì chỉ có Người mới biết rõ điều gì đang ở trong trái tim các con!”",
    checklistTitle: "Checklist 4 Hành Trang Người Trưởng Thành Vào Đời",
    checklist: [
      { label: "Cầu Nguyện Cá Vị", text: "Dành 10 phút tĩnh lặng mỗi tối đọc Lời Chúa và xét mình trước khi ngủ." },
      { label: "Bí Tích Nguồn Mạch", text: "Xưng tội định kỳ hàng tháng và sốt sắng rước Mình Thánh Chúa mỗi Chúa Nhật." },
      { label: "Làm Chủ Bản Thân", text: "Gìn giữ đức khiết tịnh, trung thực trong thi cử và có trách nhiệm nơi môi trường mạng." },
      { label: "Dấn Thân Phục Vụ", text: "Sẵn sàng đón nhận sứ mạng Tông Đồ Giáo Dân, tham gia Giới Trẻ hoặc trở thành Giáo Lý Viên tương lai." }
    ],
    supportTitle: "Cần trao đổi riêng với Huynh Trưởng?",
    supportDesc: "Ban Huynh Trưởng Khối Vào Đời luôn sẵn sàng lắng nghe và đồng hành.",
    supportBtnText: "Nhắn Huynh Trưởng",
    supportBtnLink: "/liên-hệ"
  };

  // 5 Câu hỏi thường gặp (FAQ Accordion)
  const faqs = [
    {
      q: `Điều kiện để các bạn trẻ đăng ký theo học Khối Vào Đời niên khóa ${academicYear} là gì?`,
      a: `Dành cho các bạn trẻ 15 – 16 tuổi: Lớp Vào Đời 1 (15 tuổi · Sinh năm ${vaoDoi1BirthYear}) và Lớp Vào Đời 2 (16 tuổi · Sinh năm ${vaoDoi2BirthYear}), đã lãnh nhận Bí tích Thêm Sức. Giáo lý sinh từ các giáo xứ khác chuyển đến hoặc bị gián đoạn trước đây chỉ cần liên hệ Ban Giáo lý để được hướng dẫn xếp lớp thuận tiện.`
    },
    {
      q: "Nếu em bận lịch học thêm văn hóa hoặc chuẩn bị thi tuyển sinh lớp 10, THPT quốc gia thì sao?",
      a: "Ban Giáo Lý và các Huynh Trưởng luôn thấu hiểu và tạo điều kiện tối đa cho việc học văn hóa của các bạn. Giáo xứ có cơ chế hỗ trợ tài liệu học tập tóm lược, sinh hoạt trực tuyến kết hợp hoặc bài tập phản tỉnh tại nhà để các em không bị gián đoạn tiến trình đức tin."
    },
    {
      q: "Chương trình Khối Vào Đời có những điểm gì khác biệt so với các khối cấp 2?",
      a: "Khối Vào Đời chuyển hoàn toàn sang phương pháp tương tác mở: thảo luận nhóm, giải quyết tình huống thực tế (case studies), tọa đàm cùng diễn giả khách mời, học chuyên sâu hai tài liệu Youcat và Docat, đồng thời bắt buộc tham gia các dự án bác ái thực tế thay vì chỉ học bài lý thuyết trên lớp."
    },
    {
      q: "Sau khi hoàn thành Khối Vào Đời (Lớp Vào Đời 2), các em sẽ tiếp tục sinh hoạt ở đâu?",
      a: "Sau khi hoàn thành chương trình Vào Đời 2, các em sẽ tham dự Nghi thức Tuyên Hứa Trưởng Thành và được chuyển tiếp sinh hoạt tại Giới Trẻ Giáo xứ An Ngãi, hoặc được định hướng đào tạo tham gia Lớp Dự Trưởng / Giáo Lý Viên tương lai của Xứ đoàn."
    },
    {
      q: "Giáo xứ có tổ chức các hoạt động ngoại khóa, dã ngoại hoặc chiến dịch tình nguyện cho khối không?",
      a: "Hằng năm, Khối Vào Đời đều tổ chức các hoạt động đặc thù: Trại dấn thân Chinh Chiến, các chuyến viếng thăm mái ấm tình thương, trung tâm khuyết tật, chiến dịch bảo vệ môi trường tại địa phương và đêm hội diễn nguyện Giới Trẻ."
    }
  ];

  return (
    <div className={`khoi-page ${config?.themeClass || "theme-vao-doi"}`}>
      {/* ══════════════════════════════════════════════════════════════
          SECTION 1: HERO SECTION
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
                  <span aria-hidden="true">{config?.hero?.pillIcon || "🧭"}</span>
                  <span>{config?.hero?.pillText || "Khối Vào Đời (15–16 tuổi) · Khăn Đỏ Có Viền"}</span>
                </div>
              </Motion.div>

              <Motion.h1 variants={heroItemVariants} className="khoi-hero-title">
                {config?.hero?.titleLine1 || "Dấn Thân Vào Đời"} <br />
                <em>{config?.hero?.titleLine2 || "Chinh Phục Tương Lai"}</em>
              </Motion.h1>

              <Motion.p variants={heroItemVariants} className="khoi-hero-desc">
                {config?.hero?.desc || "Trang bị hành trang đức tin, học thuyết xã hội Công giáo (Docat) và kỹ năng Huynh Trưởng, sẵn sàng trở thành muối men giữa dòng đời hôm nay."}
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
                  src={config?.hero?.image || asset("/images/khoivaodoi-anngai.jpg")}
                  alt={config?.hero?.imageAlt || "Đoàn sinh Khối Vào Đời Giáo xứ An Ngãi"}
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
                      {config?.hero?.floatingBadge?.title || "Youcat & Docat · Người Trẻ Tông Đồ"}
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
            ariaLabel="Tổng quan Khối Vào Đời"
            age={config?.tuoi || "15 – 16 tuổi"}
            ageDetail={`Lớp 10 và 11 · sinh năm ${birthYearRange}`}
            classCount={totalClasses}
            classDetail={`${vd1Classes.length} lớp Vào Đời 1 · ${vd2Classes.length} lớp Vào Đời 2`}
            teacherCount={totalTeachers}
            teamDetail="Huynh trưởng và đồng hành"
            timeline={timelineData}
            motionProps={sectionRevealProps}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2: DANH SÁCH 5 LỚP HỌC & GIÁO LÝ VIÊN
      ══════════════════════════════════════════════════════════════ */}
      <section id="danh-sach-lop" tabIndex={-1} className="khoi-section">
        <div className="khoi-shell">
          <Motion.div className="khoi-section-header" {...sectionRevealProps}>
            <div className="khoi-eyebrow">
              <span className="khoi-dot" aria-hidden="true" />
              <span>DANH SÁCH LỚP NIÊN KHÓA {academicYear}</span>
            </div>
            <h2 className="khoi-section-title">
              <span>Khối Vào Đời</span>{" "}
              <em className="block sm:inline whitespace-nowrap">Giáo xứ An Ngãi</em>
            </h2>
            <p className="khoi-section-desc">
              Cơ cấu 5 lớp học (3 lớp Vào Đời 1 và 2 lớp Vào Đời 2) với đội ngũ {totalTeachers} Giáo lý viên / Huynh trưởng tâm huyết đồng hành và định hướng tương lai.
            </p>
          </Motion.div>

          {/* Hỗ trợ Screen Reader */}
          <div role="status" aria-live="polite" className="sr-only">
            {selectedGroup === "all"
              ? `Đang hiển thị tất cả ${totalClasses} lớp học Khối Vào Đời.`
              : selectedGroup === "vd1"
                ? `Đang hiển thị ${vd1Classes.length} lớp Vào Đời 1.`
                : `Đang hiển thị ${vd2Classes.length} lớp Vào Đời 2.`}
          </div>

          {/* Bộ lọc phân tầng lớp học */}
          <div className="khoi-stage-filter-bar khoi-stage-filter-bar--three" role="group" aria-label="Lọc lớp Khối Vào Đời">
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
              className={`khoi-filter-pill ${selectedGroup === "vd1" ? "active" : ""}`}
              aria-pressed={selectedGroup === "vd1"}
              onClick={() => setSelectedGroup("vd1")}
            >
              <span className="khoi-filter-label">Vào Đời 1</span>
              <span className="khoi-filter-meta">{vd1Classes.length} lớp</span>
            </button>
            <button
              type="button"
              className={`khoi-filter-pill ${selectedGroup === "vd2" ? "active" : ""}`}
              aria-pressed={selectedGroup === "vd2"}
              onClick={() => setSelectedGroup("vd2")}
            >
              <span className="khoi-filter-label">Vào Đời 2</span>
              <span className="khoi-filter-meta">{vd2Classes.length} lớp</span>
            </button>
          </div>

          {/* NHÓM 1: VÀO ĐỜI 1 (15 TUỔI) */}
          {(selectedGroup === "all" || selectedGroup === "vd1") && (
            <div className="khoi-group-block">
              <div className="khoi-stage-header">
                <div className="khoi-stage-title-wrap">
                  <span className="khoi-stage-num" aria-hidden="true">01</span>
                  <div>
                    <h3 className="khoi-stage-title">Khối Vào Đời 1</h3>
                    <p className="khoi-stage-subtitle">
                      Youcat, căn tính người trẻ và đời sống đức tin
                    </p>
                  </div>
                </div>
                <div className="khoi-stage-pills">
                  <span className="khoi-stage-pill">Lớp 10 · 15 tuổi</span>
                  <span className="khoi-stage-pill">Sinh năm {vaoDoi1BirthYear}</span>
                  <span className="khoi-stage-pill">{vd1Classes.length} lớp</span>
                  <span className="khoi-stage-pill">Ca 1 · 07:00–07:45</span>
                </div>
              </div>

              <div className="khoi-class-grid">
                {vd1Classes.map((item) => (
                  <div
                    key={item.id}
                    className="khoi-class-card"
                  >
                    {/* TẦNG 1: Head - Mã lớp & Vị trí phòng */}
                    <div className="khoi-card-head">
                      <span className="khoi-class-code">
                        {item.name.replace("Lớp Vào Đời ", "VĐ ")}
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

          {/* NHÓM 2: VÀO ĐỜI 2 (16 TUỔI) */}
          {(selectedGroup === "all" || selectedGroup === "vd2") && (
            <div className="khoi-group-block">
              <div className="khoi-stage-header">
                <div className="khoi-stage-title-wrap">
                  <span className="khoi-stage-num" aria-hidden="true">02</span>
                  <div>
                    <h3 className="khoi-stage-title">Khối Vào Đời 2</h3>
                    <p className="khoi-stage-subtitle">
                      Docat, ơn gọi và định hướng tương lai
                    </p>
                  </div>
                </div>
                <div className="khoi-stage-pills">
                  <span className="khoi-stage-pill">Lớp 11 · 16 tuổi</span>
                  <span className="khoi-stage-pill">Sinh năm {vaoDoi2BirthYear}</span>
                  <span className="khoi-stage-pill">{vd2Classes.length} lớp</span>
                  <span className="khoi-stage-pill">Ca 1 · 07:00–07:45</span>
                </div>
              </div>

              <div className="khoi-class-grid khoi-class-grid--two">
                {vd2Classes.map((item) => (
                  <div
                    key={item.id}
                    className="khoi-class-card card-vd2"
                  >
                    {/* TẦNG 1: Head - Mã lớp & Vị trí phòng */}
                    <div className="khoi-card-head">
                      <span className="khoi-class-code">
                        {item.name.replace("Lớp Vào Đời ", "VĐ ")}
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
      <section className="vd-journey-section">
        <div className="khoi-shell">
          <Motion.div className="khoi-section-header" {...sectionRevealProps}>
            <div className="khoi-eyebrow">
              <span className="khoi-dot" aria-hidden="true" />
              <span>SƯ PHẠM ĐỨC TIN KHỐI VÀO ĐỜI</span>
            </div>
            <h2 className="khoi-section-title">
              6 Bước Dấn Thân <em>Vào Đời</em>
            </h2>
            <p className="khoi-section-desc">
              Hành trình sư phạm đức tin giúp các bạn trẻ 15–16 tuổi định vị bản thân, trang bị la bàn luân lý và sẵn sàng trở thành men muối giữa giảng đường và xã hội hôm nay.
            </p>
          </Motion.div>

          <div className="vd-journey-grid">
            {faithJourneySteps.map((step) => {
              const StepIcon = step.icon;
              const PracticeIcon = step.practiceIcon;
              return (
                <Motion.div
                  key={step.step}
                  className={`vd-journey-card stage-step-${step.step}`}
                  {...sectionRevealProps}
                >
                  <div>
                    <div className="vd-journey-card-top">
                      <div className="vd-journey-left-header">
                        <div className="vd-journey-icon-wrap" aria-hidden="true">
                          <StepIcon size={20} />
                        </div>
                        <span className="vd-journey-step-badge">CHẶNG {step.step}</span>
                      </div>
                      <span className="vd-journey-category-pill">{step.badge}</span>
                    </div>

                    <div className="vd-journey-sub">{step.sub}</div>
                    <h3 className="vd-journey-title">{step.title}</h3>
                    <p className="vd-journey-meaning">{step.meaning}</p>
                  </div>

                  <div className="vd-journey-practice-box">
                    <div className="vd-practice-header">
                      <PracticeIcon size={14} aria-hidden="true" />
                      <span>{step.practiceLabel}</span>
                    </div>
                    <div className="vd-practice-content">{step.highlight}</div>
                  </div>
                </Motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4: 4 TRỤ CỘT HÀNH TRANG VÀO ĐỜI (YOUCAT, DOCAT, CALLING, SKILLS)
      ══════════════════════════════════════════════════════════════ */}
      <section className="vd-pillars-section">
        <div className="khoi-shell">
          <Motion.div className="khoi-section-header" {...sectionRevealProps}>
            <div className="khoi-eyebrow">
              <span className="khoi-dot" aria-hidden="true" />
              <span>HÀNH TRANG TRƯỞNG THÀNH KITÔ HỮU</span>
            </div>
            <h2 className="khoi-section-title">
              Bốn Trụ Cột <em>Hành Trang Vào Đời</em>
            </h2>
            <p className="khoi-section-desc">
              Chương trình chuyên biệt tích hợp Giáo lý Youcat, Học thuyết Docat, định hướng ơn gọi và kỹ năng mềm giúp người trẻ vững bước vào đời.
            </p>
          </Motion.div>

          <KhoiVaoDoiPillars onOpenReader={handleOpenReader} />
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
              Lịch trình sinh hoạt sáng Chúa Nhật hàng tuần dành cho đoàn sinh Khối Vào Đời Giáo xứ An Ngãi.
            </p>
          </Motion.div>

          {/* Stepper track desktop */}
          <div className="vd-stepper-track" aria-hidden="true">
            <div className="vd-stepper-line" />
            <div className="vd-stepper-nodes">
              {timelineSteps.map((step, idx) => (
                <div key={step.time} className={`vd-stepper-col ${step.highlight ? "highlight" : ""}`}>
                  <div className="vd-stepper-node">{idx + 1}</div>
                  <span className="vd-stepper-time">{step.time}</span>
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
            <span><strong>Lưu ý nề nếp:</strong> Phụ huynh và đoàn sinh vui lòng tập trung đúng giờ (trước 06:45) tại sảnh Nhà Thờ và các phòng học Ca 1 để bảo đảm nề nếp.</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 6: GÓC PHỤ HUYNH & HỘI THÁNH TẠI GIA (YOUTH HUB)
      ══════════════════════════════════════════════════════════════ */}
      <section id="dong-hanh" tabIndex={-1} className="khoi-section">
        <div className="khoi-shell">
          <Motion.div className="khoi-section-header" {...sectionRevealProps}>
            <div className="khoi-eyebrow">
              <span className="khoi-dot" aria-hidden="true" />
              <span>GÓC ĐỒNG HÀNH &amp; HỘI THÁNH TẠI GIA</span>
            </div>
            <h2 className="khoi-section-title">
              Đồng Hành Cùng Người Trẻ <em>Trưởng Thành</em>
            </h2>
            <p className="khoi-section-desc">
              Giai đoạn 15–16 tuổi là thời điểm then chốt khi các bạn trẻ đứng trước những ngưỡng cửa quan trọng của cuộc đời. Giáo xứ và gia đình luôn đồng hành và lắng nghe.
            </p>
          </Motion.div>

          <div className="khoi-family-bento-grid">
            {/* Cột trái: 3 Trụ cột hành động */}
            <div className="khoi-pillars-stack">
              {youthPillars.map((item) => {
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
                      <strong>Gợi ý:</strong> {item.tip}
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
                  <span>{youthSanctuaryData.eyebrow}</span>
                </div>

                <div className="khoi-sanctuary-quote-wrap">
                  <Quote size={18} className="khoi-sanctuary-quote-icon" aria-hidden="true" />
                  <blockquote className="khoi-sanctuary-quote">
                    "{youthSanctuaryData.quote}"
                  </blockquote>
                  <span className="khoi-sanctuary-author">{youthSanctuaryData.author}</span>
                </div>

                <div className="khoi-sanctuary-checklist-title">
                  <CheckCircle2 size={16} className="khoi-sanctuary-checklist-icon" aria-hidden="true" />
                  <span>{youthSanctuaryData.checklistTitle}</span>
                </div>

                <ul className="khoi-checklist-list">
                  {youthSanctuaryData.checklist.map((chk) => (
                    <li key={chk.label} className="khoi-checklist-item">
                      <span className="khoi-check-icon" aria-hidden="true">✓</span>
                      <span><strong>{chk.label}:</strong> {chk.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="khoi-support-card">
                <div className="khoi-support-info">
                  <strong>{youthSanctuaryData.supportTitle}</strong><br />
                  <span className="khoi-support-desc">{youthSanctuaryData.supportDesc}</span>
                </div>
                <Link to={youthSanctuaryData.supportBtnLink} className="khoi-btn-secondary khoi-support-btn">
                  <span>{youthSanctuaryData.supportBtnText}</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <Motion.div className="khoi-faq-wrapper" {...sectionRevealProps}>
            <div className="khoi-faq-header">
              <h3 className="khoi-faq-title">
                Giải Đáp Thắc Mắc (FAQ)
              </h3>
              <p className="khoi-faq-desc">
                Các thông tin cần thiết về chương trình Vào Đời 1 &amp; 2, sinh hoạt Khối Vào Đời và chuyển tiếp Giới Trẻ.
              </p>
            </div>

            <div className="khoi-faq-list">
              {faqs.map((item, idx) => {
                const isOpen = openFaq === idx;
                const faqAnsId = `vd-faq-ans-${idx}`;
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
              <span aria-hidden="true">🧭</span>
              <span>NIÊN KHÓA {academicYear} · GIÁO XỨ AN NGÃI</span>
            </div>

            <h3 className="khoi-cta-title">
              Hành Trang Vững Chắc Cho Người Trẻ Vào Đời
            </h3>

            <p className="khoi-cta-desc">
              Tuổi 15–16 là giai đoạn định hình bản lĩnh và lý tưởng dấn thân. Xứ đoàn Mẹ Mân Côi kính mời quý phụ huynh và các bạn trẻ đồng hành để trở thành muối men giữa đời, nhiệt tâm phụng sự và can đảm làm chứng nhân Tin Mừng.
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

      {/* Modal Đọc Tài Liệu Youcat & Docat */}
      <DocumentReaderModal
        doc={readingDoc}
        isOpen={isReaderOpen}
        onClose={handleCloseReader}
        onDownload={handleDownloadDoc}
      />
    </div>
  );
}
