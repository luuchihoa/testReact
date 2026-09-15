import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Flame, Clock, Sparkles, ChevronDown, HelpCircle,
  ShieldCheck, ArrowRight, Church, MapPin, BookOpen,
  Compass, Heart, CheckCircle2, Quote, ExternalLink,
  Scroll, Bookmark, Sun, Users, Cross, Check, Globe, Eye,
  Calendar
} from "lucide-react";
import { getKhoiKinhThanhData } from "../utils/academicYear.js";
import BibleQuickNavigatorModal from "../components/bible/BibleQuickNavigatorModal.jsx";
import "./KhoiKinhThanh.css";

// Helper định dạng chức danh Giáo Lý Viên trang trọng
const formatTeacherName = (t) => {
  if (t.startsWith("C.")) return `Chị ${t.slice(2)}`;
  if (t.startsWith("A.")) return `Anh ${t.slice(2)}`;
  if (t.startsWith("Sr.")) return `Sr. ${t.slice(3)}`;
  return t;
};

// Helper gắn tầng cho phòng học giúp phụ huynh dễ định vị
const getRoomLocation = (room) => {
  if (room.includes("P3") || room.includes("P4") || room.includes("P5")) {
    return `${room} · Tầng Trệt`;
  }
  return `${room} · Lầu 1`;
};

export default function KhoiKinhThanh() {
  // Lấy dữ liệu tự động tính toán niên khóa và năm sinh theo thời gian thực
  const data = getKhoiKinhThanhData();
  const {
    academicYear,
    kinhThanh1BirthYear,
    kinhThanh2BirthYear,
    classes
  } = data;

  const [openFaq, setOpenFaq] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [activeTab, setActiveTab] = useState("bible"); // "bible" | "lectio"

  // Modal tra cứu Kinh Thánh trực tuyến
  const [isNavModalOpen, setIsNavModalOpen] = useState(false);
  const [navModalBookId, setNavModalBookId] = useState(null);
  const [navModalTestament, setNavModalTestament] = useState("all");

  useEffect(() => {
    const prevTitle = document.title;
    document.title = `Khối Kinh Thánh (Lớp 8 & 9) · Ngành Nhiệt Quang HTDC · Niên Khóa ${academicYear} | Giáo xứ An Ngãi`;
    return () => {
      document.title = prevTitle;
    };
  }, [academicYear]);

  // Phân nhóm 2 khối: KT 1 (13 tuổi · Lớp 8) và KT 2 (14 tuổi · Lớp 9)
  const kt1Classes = classes.filter((c) => c.group === "Kinh Thánh 1");
  const kt2Classes = classes.filter((c) => c.group === "Kinh Thánh 2");


  // 6 Chặng sư phạm đức tin trực quan Ngành Nhiệt Quang (Đã cân bằng typography & độ dài dòng)
  const faithJourneySteps = [
    {
      step: "01",
      icon: BookOpen,
      practiceIcon: ShieldCheck,
      accentColor: "#15803d",
      accentBg: "rgba(21, 128, 61, 0.1)",
      accentBorder: "rgba(21, 128, 61, 0.25)",
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
      accentColor: "#b45309",
      accentBg: "rgba(180, 83, 9, 0.1)",
      accentBorder: "rgba(180, 83, 9, 0.25)",
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
      accentColor: "#7e22ce",
      accentBg: "rgba(126, 34, 206, 0.1)",
      accentBorder: "rgba(126, 34, 206, 0.25)",
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
      accentColor: "#dc2626",
      accentBg: "rgba(220, 38, 38, 0.1)",
      accentBorder: "rgba(220, 38, 38, 0.25)",
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
      accentColor: "#0284c7",
      accentBg: "rgba(2, 132, 199, 0.1)",
      accentBorder: "rgba(2, 132, 199, 0.25)",
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
      accentColor: "#ea580c",
      accentBg: "rgba(234, 88, 12, 0.12)",
      accentBorder: "rgba(234, 88, 12, 0.35)",
      title: "Sống Lời Chúa Giữa Đời",
      sub: "Lectio Divina & Tinh Thần Cam",
      badge: "Đời Sống Thiếu Nhi",
      practiceLabel: "Nhiệt tâm quang dũng",
      meaning: "Trưởng thành Khối Kinh Thánh, các em biến Lời Chúa thành của ăn mỗi ngày, thắp sáng lý trí và can đảm sống đức tin trước khi bước lên Khối Vào Đời.",
      highlight: "Tỏa sáng tinh thần Nhiệt Quang: Duy trì thói quen đọc Kinh Thánh, nhiệt tâm phụng sự và quang dũng dấn thân."
    }
  ];

  // 4 Mốc thời gian Ca 1 Chúa Nhật
  const timelineSteps = [
    {
      time: "06:50",
      label: "Tập trung & Điểm danh",
      sub: "GLV đón tiếp tại dãy phòng lầu P3 – P9",
      highlight: false,
      tag: null
    },
    {
      time: "07:00 – 07:45",
      label: "Đào Sâu Lời Chúa & Thảo Luận",
      sub: "Tìm hiểu các sách Cựu Ước - Tân Ước & thực hành cầu nguyện Lectio Divina",
      highlight: true,
      tag: "Huấn Giáo Đức Tin"
    },
    {
      time: "07:45",
      label: "Tiến vào Thánh Đường",
      sub: "Trang nghiêm xếp hàng, lắng đọng tâm hồn và ôn hát cộng đoàn",
      highlight: false,
      tag: null
    },
    {
      time: "08:00 – 09:00",
      label: "Thánh Lễ Thiếu Nhi Toàn Đoàn",
      sub: "Lắng đọng Phụng vụ Lời Chúa · Suy niệm Bài đọc & sốt sắng hiệp thông Thánh Thể",
      highlight: true,
      tag: "Tâm Điểm Phụng Vụ"
    }
  ];

  // 3 Trụ cột Hội Thánh Tại Gia (Bento Family Hub)
  const familyPillars = [
    {
      key: "red",
      title: "Mở Trang Kinh Thánh Trong Gia Đình",
      badge: "Gia Đình Cầu Nguyện",
      desc: "Đặt cuốn Kinh Thánh ở nơi trang trọng và dễ thấy trong nhà. Mỗi tuần, cả nhà dành 10 phút trước bữa cơm Chúa Nhật để cùng con đọc một đoạn Tin Mừng ngắn.",
      tip: "Thay vì giáo điều, cha mẹ hãy gợi mở: 'Trong câu chuyện Lời Chúa hôm nay, con ấn tượng nhất chi tiết hay nhân vật nào?'",
      icon: BookOpen,
      accent: "#dc2626",
      bg: "rgba(220, 38, 38, 0.1)",
      border: "rgba(220, 38, 38, 0.25)"
    },
    {
      key: "orange",
      title: "Thấu Cảm Khủng Hoảng Tuổi Dậy Thì",
      badge: "Lắng Nghe Yêu Thương",
      desc: "Lứa tuổi lớp 8–9 bắt đầu khẳng định cái tôi và dễ bị ảnh hưởng bởi mạng xã hội. Cha mẹ hãy là người bạn lớn kiên nhẫn lắng nghe hơn là áp đặt hay chỉ trích gay gắt.",
      tip: "Dành thời gian riêng đi dạo, trò chuyện nhẹ nhàng với con, tôn trọng những băn khoăn về đức tin và luân lý của tuổi thiếu niên.",
      icon: Heart,
      accent: "#ea580c",
      bg: "rgba(234, 88, 12, 0.1)",
      border: "rgba(234, 88, 12, 0.25)"
    },
    {
      key: "gold",
      title: "Lời Kinh Gia Đình Trước Giờ Ngủ",
      badge: "Bình An Đêm Thánh",
      desc: "Giữ thói quen kinh tối ngắn gọn cùng con. Lời tạ ơn trước khi ngủ giúp các em giải tỏa áp lực thi cử học đường và tìm thấy sự bình an đích thực trong tay Chúa.",
      tip: "Một lời chúc lành hoặc làm dấu Thánh Giá trên trán con trước khi ngủ là nguồn nâng đỡ thiêng liêng vô giá cho tâm hồn con trẻ.",
      icon: Sparkles,
      accent: "#b45309",
      bg: "rgba(180, 83, 9, 0.1)",
      border: "rgba(180, 83, 9, 0.25)"
    }
  ];

  // Khối Sanctuary Box (Lời Huấn Quyền & Checklist Mục Vụ)
  const sanctuaryData = {
    eyebrow: "Hội Thánh Tại Gia · Tâm Tình Mục Vụ",
    quote: "Giáo Hội luôn tôn kính Thánh Kinh như chính Thân Thể Chúa, vì nhất là trong Phụng Vụ Thánh, Giáo Hội không ngừng lấy bánh ban sự sống từ bàn tiệc Lời Chúa và bàn tiệc Mình Chúa để trao ban cho các tín hữu.",
    author: "Hiến Chế Mặc Khải Dei Verbum (Số 21)",
    checklistTitle: "3 Việc Nhỏ Cha Mẹ Đồng Hành Chúa Nhật",
    checklist: [
      { label: "Đúng giờ", text: "Nhắc con dậy sớm, đưa con đến phòng học trước 06:50 để kịp điểm danh hàng ngũ Ca 1." },
      { label: "Trang phục", text: "Áo đồng phục trắng sơ-vin, đeo khăn quàng Da Cam Ngành Nhiệt Quang phẳng phiu ngay ngắn." },
      { label: "Lắng nghe", text: "Gợi mở câu chuyện bài học Kinh Thánh trong bữa cơm trưa để con hào hứng chia sẻ." }
    ],
    supportTitle: "Cần trao đổi riêng với GLV?",
    supportDesc: "Ban Giáo lý luôn sẵn sàng lắng nghe mọi hoàn cảnh gia đình.",
    supportBtnText: "Nhắn Tin GLV",
    supportBtnLink: "/liên-hệ"
  };

  // 5 Câu hỏi thường gặp
  const faqs = [
    {
      q: "Tại sao sau khi đã lãnh nhận Bí tích Thêm Sức, các em vẫn cần tiếp tục học Khối Kinh Thánh?",
      a: "Bí tích Thêm Sức ghi dấu ấn Thần Khí trưởng thành đức tin, không phải điểm kết thúc hành trình học đạo. Khối Kinh Thánh (Lớp 8 & 9) giúp các em trang bị ngọn đèn Lời Chúa để soi sáng lý trí, nhận định luân lý đúng đắn và đứng vững trước những ngã rẽ cuộc đời của tuổi thiếu niên."
    },
    {
      q: "Phương pháp giảng dạy Kinh Thánh cho lứa tuổi 13–14 có bị khô khan hay quá tải không?",
      a: "Chương trình tại Giáo xứ An Ngãi được đổi mới trực quan: học qua bản đồ địa lý Thánh Kinh, kịch hóa tình huống, câu đố giải mật thư Lời Chúa và liên hệ trực tiếp với các vấn đề tâm lý học đường, giúp các em hào hứng tiếp cận Lời Chúa cách sống động."
    },
    {
      q: "Thời gian học Ca 1 Chúa Nhật (07:00 – 07:45) có điểm gì phụ huynh cần đặc biệt lưu ý?",
      a: "Khối Kinh Thánh thuộc Ca 1 (học giáo lý trước Thánh Lễ Toàn Xứ Đoàn lúc 08:00). Kính mong quý phụ huynh nhắc nhở con chuẩn bị bài và đi ngủ sớm tối thứ Bảy, đồng thời đưa con đến nhà thờ trước 06:50 để kịp tập trung hàng ngũ và ổn định nề nếp lớp học."
    },
    {
      q: "Ý nghĩa của Khăn Quàng Da Cam Ngành Nhiệt Quang đối với đoàn sinh Khối Kinh Thánh?",
      a: "Màu da cam là màu khăn chính thức của Ngành Nhiệt Quang (Phong trào Thiếu Nhi Cung Thánh / Hùng Tâm Dũng Chí). Màu da cam tượng trưng cho ngọn lửa 'Nhiệt tâm' (sốt sắng phụng sự Bàn Thờ Chúa) và ánh sáng 'Quang dũng' (sáng suốt và can đảm sống thật thà, làm chứng cho Chúa giữa đời)."
    },
    {
      q: "Gia đình nên chuẩn bị cuốn Kinh Thánh nào phù hợp nhất cho các em học tập?",
      a: "Phụ huynh nên trang bị cho con cuốn Kinh Thánh Trọn Bộ (Cựu Ước & Tân Ước) bản dịch của Nhóm Phiên Dịch Các Giờ Kinh Phụng Vụ (NPD-CGKPV). Ngoài ra, các em có thể tra cứu và nghe audio trực tuyến miễn phí ngay trên website Giáo xứ An Ngãi."
    }
  ];

  return (
    <div className="kt-page">
      {/* ══════════════════════════════════════════════════════════════
          SECTION 1: HERO VISUAL-FIRST & DẢI CHỈ SỐ BENTO
      ══════════════════════════════════════════════════════════════ */}
      <section className="kt-hero">
        <div className="kt-shell">
          <div className="kt-hero-grid">
            {/* Cột trái: Văn bản & CTA */}
            <div className="kt-hero-left">
              <div className="kt-hero-pill-badge">
                <Flame size={14} className="kt-hero-pill-icon" />
                <span>Ngành Nhiệt Quang HTDC · Khối Kinh Thánh</span>
              </div>

              <h1 className="kt-hero-title">
                Lời Chúa — <em>Ngọn Đèn Soi Dẫn</em> Bước Con Đi
              </h1>

              <p className="kt-hero-desc">
                Kinh Thánh không chỉ là trang sách cổ, mà là bức tâm thư sống động Thiên Chúa ngỏ cùng nhân loại. Khối Kinh Thánh dẫn dắt các em 13–14 tuổi khám phá trọn bộ 73 cuốn sách thiêng liêng, lấy Lời Chúa làm la bàn soi sáng lương tâm và vững bước vào đời.
              </p>

              <div className="kt-hero-actions">
                <a href="#danh-sach-lop" className="kt-btn-primary">
                  <span>Xem 6 Lớp Học</span>
                  <ArrowRight size={18} aria-hidden="true" className="kt-btn-icon" />
                </a>
                <Link to="/tuyển-sinh#dang-ky" className="kt-btn-secondary">
                  <Sparkles size={17} aria-hidden="true" className="kt-btn-icon" />
                  <span>Đăng Ký Khóa Mới</span>
                </Link>
              </div>
            </div>

            {/* Cột phải: Khung ảnh 4:3 & Floating Badge uy tín */}
            <div className="kt-hero-right">
              <div className="kt-hero-image-card">
                <img
                  src="/images/khoikinhthanh-anngai.jpg"
                  alt="Thiếu nhi Khối Kinh Thánh (Lớp Mác-cô 1/2) Ngành Nhiệt Quang HTDC - Xứ đoàn Mẹ Mân Côi Giáo xứ An Ngãi"
                  className="kt-hero-img"
                  loading="eager"
                  fetchPriority="high"
                />
                <div className="kt-floating-badge">
                  <div className="kt-floating-badge-icon">
                    <BookOpen size={20} />
                  </div>
                  <div className="kt-floating-badge-content">
                    <div className="kt-floating-badge-title">
                      181 Thiếu Nhi Khối Kinh Thánh
                    </div>
                    <div className="kt-floating-badge-sub">
                      Lớp 8 &amp; 9 · Xứ đoàn Mẹ Mân Côi Giáo xứ An Ngãi
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dải tổng quan 4 chỉ số (Overview Bar) Bento Chips */}
          <div className="kt-overview-bar">
            <div className="kt-overview-chip">
              <span className="kt-chip-cat">Độ tuổi</span>
              <span className="kt-chip-value">13 – 14 Tuổi</span>
              <span className="kt-chip-label">Sinh năm {kinhThanh2BirthYear}–{kinhThanh1BirthYear}</span>
            </div>
            <div className="kt-overview-chip">
              <span className="kt-chip-cat">Quy mô</span>
              <span className="kt-chip-value">6 Lớp Học</span>
              <span className="kt-chip-label">181 Đoàn sinh Lời Chúa</span>
            </div>
            <div className="kt-overview-chip">
              <span className="kt-chip-cat">Lịch học</span>
              <span className="kt-chip-value">Ca 1 Chúa Nhật</span>
              <span className="kt-chip-label">Học 07:00 · Lễ 08:00</span>
            </div>
            <div className="kt-overview-chip">
              <span className="kt-chip-cat">Nhân sự</span>
              <span className="kt-chip-value">14 GLV</span>
              <span className="kt-chip-label">Giáo Lý Viên &amp; Huynh Trưởng</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2: DANH SÁCH 6 LỚP HỌC THỰC TẾ & BỘ LỌC
      ══════════════════════════════════════════════════════════════ */}
      <section id="danh-sach-lop" className="kt-roster-section">
        <div className="kt-shell">
          <div className="kt-section-header">
            <div className="kt-eyebrow">
              <span className="kt-dot" />
              <span>DANH SÁCH LỚP THỰC TẾ NIÊN KHÓA {academicYear}</span>
            </div>
            <h2 className="kt-section-title">
              Các Lớp Khối Kinh Thánh <em>Giáo xứ An Ngãi</em>
            </h2>
            <p className="kt-section-desc">
              Phòng học dãy nhà giáo lý, thời gian học Ca 1 và đội ngũ 14 Huynh trưởng - Giáo lý viên trực tiếp phụ trách 6 lớp học.
            </p>
          </div>

          {/* Bộ lọc phân tầng khối học */}
          <div className="kt-stage-filter-bar">
            <button
              type="button"
              className={`kt-filter-pill ${selectedGroup === "all" ? "active" : ""}`}
              onClick={() => setSelectedGroup("all")}
            >
              Tất Cả<span className="hidden sm:inline"> 6 Lớp</span>
            </button>
            <button
              type="button"
              className={`kt-filter-pill ${selectedGroup === "kt1" ? "active" : ""}`}
              onClick={() => setSelectedGroup("kt1")}
            >
              <span className="hidden sm:inline">Khối </span>Kinh Thánh 1<span className="hidden sm:inline"> (13 Tuổi · 3 Lớp)</span>
            </button>
            <button
              type="button"
              className={`kt-filter-pill ${selectedGroup === "kt2" ? "active" : ""}`}
              onClick={() => setSelectedGroup("kt2")}
            >
              <span className="hidden sm:inline">Khối </span>Kinh Thánh 2<span className="hidden sm:inline"> (14 Tuổi · 3 Lớp)</span>
            </button>
          </div>

          {/* NHÓM 1: KINH THÁNH 1 (13 TUỔI) */}
          {(selectedGroup === "all" || selectedGroup === "kt1") && (
            <div className="kt-group-block">
              <div className="kt-stage-header">
                <div className="kt-stage-title-wrap">
                  <span className="kt-stage-num">01</span>
                  <div>
                    <h3 className="kt-stage-title">Khối Kinh Thánh 1</h3>
                    <p className="kt-stage-subtitle">
                      Năm thứ nhất · Khám phá Cựu Ước, Ngũ Thư &amp; Lịch Sử Cứu Độ
                    </p>
                  </div>
                </div>
                <div className="kt-stage-pills">
                  <span className="kt-stage-pill">13 Tuổi</span>
                  <span className="kt-stage-pill">Sinh năm {kinhThanh1BirthYear}</span>
                  <span className="kt-stage-pill">3 Lớp (P3, P4, P5)</span>
                </div>
              </div>

              <div className="kt-class-grid">
                {kt1Classes.map((item) => (
                  <div key={item.id} className="kt-class-card card-kt1">
                    {/* TẦNG 1: Head - Badge mã lớp & Vị trí phòng */}
                    <div className="kt-bento-card-head">
                      <span className="kt-bento-class-code">
                        {item.name.replace("Lớp Kinh Thánh ", "KT ")}
                      </span>
                      <span className="kt-bento-room-badge">
                        <MapPin size={13} aria-hidden="true" />
                        <span>{getRoomLocation(item.room)}</span>
                      </span>
                    </div>

                    {/* TẦNG 2: Tiêu đề lớp & Dải chỉ số Sĩ số / Độ tuổi */}
                    <div>
                      <h4 className="kt-bento-class-title">{item.name}</h4>
                      <div className="kt-bento-stats-strip">
                        {item.studentsCount && (
                          <span className="kt-bento-stat-chip">
                            <Users size={13} aria-hidden="true" />
                            <span>Sĩ số: <strong>{item.studentsCount} em</strong></span>
                          </span>
                        )}
                        <span className="kt-bento-stat-chip">
                          <Calendar size={13} aria-hidden="true" />
                          <span>Độ tuổi: <strong>{item.ageText} ({item.birthYear})</strong></span>
                        </span>
                      </div>
                    </div>

                    {/* TẦNG 3: Đội ngũ GLV Phụ trách */}
                    <div className="kt-bento-teacher-box">
                      <div className="kt-bento-teacher-label">
                        <ShieldCheck size={13} aria-hidden="true" />
                        <span>GLV Phụ trách ({item.teachers.length})</span>
                      </div>
                      <div className="kt-bento-teacher-pills">
                        {item.teachers.map((t, idx) => (
                          <span key={idx} className="kt-bento-teacher-pill">
                            {formatTeacherName(t)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* TẦNG 4: Trọng tâm huấn giáo & Chuyên đề */}
                    <div className="kt-bento-focus-box">
                      <div className="kt-bento-focus-badge">{item.levelBadge}</div>
                      <p className="kt-bento-focus-desc">{item.focus}</p>
                    </div>

                    {/* TẦNG 5: Footer - Giờ học & Trạng thái nề nếp */}
                    <div className="kt-bento-card-foot">
                      <span className="kt-bento-time">
                        <Clock size={13} aria-hidden="true" />
                        <span>{item.time} (Ca 1)</span>
                      </span>
                      <span className="kt-bento-status">
                        ● {item.status === "Đang học tập" ? "Đang sinh hoạt" : item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NHÓM 2: KINH THÁNH 2 (14 TUỔI) */}
          {(selectedGroup === "all" || selectedGroup === "kt2") && (
            <div className="kt-group-block" style={{ marginBottom: "16px" }}>
              <div className="kt-stage-header kt-stage-highlight">
                <div className="kt-stage-title-wrap">
                  <span className="kt-stage-num">02</span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <h3 className="kt-stage-title">Khối Kinh Thánh 2</h3>
                      <span className="kt-stage-special-badge">⭐ Trưởng Thành Ngành Nhiệt Quang</span>
                    </div>
                    <p className="kt-stage-subtitle">
                      Năm thứ hai · Bốn Sách Tin Mừng, Thư Mục Vụ &amp; Sống Lời Chúa giữa đời
                    </p>
                  </div>
                </div>
                <div className="kt-stage-pills">
                  <span className="kt-stage-pill">14 Tuổi</span>
                  <span className="kt-stage-pill">Sinh năm {kinhThanh2BirthYear}</span>
                  <span className="kt-stage-pill">3 Lớp (P7, P8, P9)</span>
                </div>
              </div>

              <div className="kt-class-grid">
                {kt2Classes.map((item) => (
                  <div key={item.id} className="kt-class-card card-kt2">
                    {/* TẦNG 1: Head - Badge mã lớp & Vị trí phòng */}
                    <div className="kt-bento-card-head">
                      <span className="kt-bento-class-code">
                        {item.name.replace("Lớp Kinh Thánh ", "KT ")}
                      </span>
                      <span className="kt-bento-room-badge">
                        <MapPin size={13} aria-hidden="true" />
                        <span>{getRoomLocation(item.room)}</span>
                      </span>
                    </div>

                    {/* TẦNG 2: Tiêu đề lớp & Dải chỉ số Sĩ số / Độ tuổi */}
                    <div>
                      <h4 className="kt-bento-class-title">{item.name}</h4>
                      <div className="kt-bento-stats-strip">
                        {item.studentsCount && (
                          <span className="kt-bento-stat-chip">
                            <Users size={13} aria-hidden="true" />
                            <span>Sĩ số: <strong>{item.studentsCount} em</strong></span>
                          </span>
                        )}
                        <span className="kt-bento-stat-chip">
                          <Calendar size={13} aria-hidden="true" />
                          <span>Độ tuổi: <strong>{item.ageText} ({item.birthYear})</strong></span>
                        </span>
                      </div>
                    </div>

                    {/* TẦNG 3: Đội ngũ GLV Phụ trách */}
                    <div className="kt-bento-teacher-box">
                      <div className="kt-bento-teacher-label">
                        <ShieldCheck size={13} aria-hidden="true" />
                        <span>GLV Phụ trách ({item.teachers.length})</span>
                      </div>
                      <div className="kt-bento-teacher-pills">
                        {item.teachers.map((t, idx) => (
                          <span key={idx} className="kt-bento-teacher-pill">
                            {formatTeacherName(t)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* TẦNG 4: Trọng tâm huấn giáo & Chuyên đề */}
                    <div className="kt-bento-focus-box">
                      <div className="kt-bento-focus-badge">{item.levelBadge}</div>
                      <p className="kt-bento-focus-desc">{item.focus}</p>
                    </div>

                    {/* TẦNG 5: Footer - Giờ học & Trạng thái nề nếp */}
                    <div className="kt-bento-card-foot">
                      <span className="kt-bento-time">
                        <Clock size={13} aria-hidden="true" />
                        <span>{item.time} (Ca 1)</span>
                      </span>
                      <span className="kt-bento-status">
                        ● {item.status === "Đang học tập" ? "Đang sinh hoạt" : item.status}
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
          SECTION 3: SƯ PHẠM ĐỨC TIN 6 CHẶNG LỜI CHÚA
      ══════════════════════════════════════════════════════════════ */}
      <section className="kt-journey-section">
        <div className="kt-shell">
          <div className="kt-section-header">
            <div className="kt-eyebrow">
              <span className="kt-dot" />
              <span>SƯ PHẠM ĐỨC TIN NGÀNH NHIỆT QUANG</span>
            </div>
            <h2 className="kt-section-title">
              6 Chặng Khám Phá <em>Dòng Chảy Lời Chúa</em>
            </h2>
            <p className="kt-section-desc">
              Lộ trình huấn giáo từ công trình sáng tạo Cựu Ước đến đỉnh cao Bốn Sách Tin Mừng và phương pháp cầu nguyện suy niệm giữa đời sống người thiếu nhi tuổi 14.
            </p>
          </div>

          <div className="kt-journey-grid">
            {faithJourneySteps.map((card, idx) => {
              const StepIcon = card.icon;
              const PracticeIcon = card.practiceIcon;
              return (
                <div
                  key={idx}
                  className={`kt-journey-card stage-step-${card.step}`}
                >
                  <div className="kt-journey-card-main">
                    <div className="kt-journey-card-top">
                      <div className="kt-journey-left-header">
                        <div className="kt-journey-icon-wrap">
                          <StepIcon size={22} aria-hidden="true" />
                        </div>
                        <div>
                          <span className="kt-journey-step-badge">CHẶNG {card.step}</span>
                        </div>
                      </div>
                      <span className="kt-journey-category-pill">{card.badge}</span>
                    </div>

                    <div className="kt-journey-card-body">
                      <div className="kt-journey-sub">{card.sub}</div>
                      <h3 className="kt-journey-title">{card.title}</h3>
                      <p className="kt-journey-meaning">{card.meaning}</p>
                    </div>
                  </div>

                  <div className="kt-journey-practice-box">
                    <div className="kt-practice-header">
                      <PracticeIcon size={14} aria-hidden="true" />
                      <span>{card.practiceLabel}</span>
                    </div>
                    <div className="kt-practice-content">
                      {card.highlight}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4: KHO TÀNG 73 SÁCH KINH THÁNH & LECTIO DIVINA TABS
      ══════════════════════════════════════════════════════════════ */}
      <section className="kt-tabs-section">
        <div className="kt-shell">
          <div className="kt-section-header">
            <div className="kt-eyebrow">
              <span className="kt-dot" />
              <span>Kho Tàng Lời Chúa &amp; Phương Pháp Cầu Nguyện</span>
            </div>
            <h2 className="kt-section-title">
              Hành Trang <em>73 Cuốn Sách Thánh</em>
            </h2>
            <p className="kt-section-desc">
              Khám phá trọn vẹn bộ Kinh Thánh Công giáo qua hệ thống Bento trực quan và thuần thục phương pháp cầu nguyện Lectio Divina 4 bước theo Huấn quyền Hội Thánh.
            </p>
          </div>

          {/* Segmented Control Tab Navigation (Tinh gọn 1 hàng thuần Việt) */}
          <div className="kt-tab-nav-wrapper">
            <div className="kt-tab-nav" role="tablist" aria-label="Kho Tàng &amp; Phương Pháp Cầu Nguyện">
              <button
                type="button"
                role="tab"
                id="tab-btn-bible"
                aria-selected={activeTab === "bible"}
                aria-controls="panel-bible"
                className={`kt-tab-btn ${activeTab === "bible" ? "active" : ""}`}
                onClick={() => setActiveTab("bible")}
              >
                <BookOpen size={17} aria-hidden="true" />
                <span>73 Cuốn Kinh Thánh</span>
              </button>
              <button
                type="button"
                role="tab"
                id="tab-btn-lectio"
                aria-selected={activeTab === "lectio"}
                aria-controls="panel-lectio"
                className={`kt-tab-btn ${activeTab === "lectio" ? "active" : ""}`}
                onClick={() => setActiveTab("lectio")}
              >
                <Sparkles size={17} aria-hidden="true" />
                <span>4 Bước Cầu Nguyện</span>
              </button>
            </div>
          </div>

          {/* Tab 1: 73 Sách */}
          {activeTab === "bible" && (
            <div id="panel-bible" className="kt-bible-two-col" role="tabpanel" aria-labelledby="tab-btn-bible">
              {/* Cựu Ước */}
              <div className="kt-testament-box kt-testament-old">
                <div>
                  <div className="kt-testament-top">
                    <div className="kt-testament-icon-wrap">
                      <Scroll size={24} aria-hidden="true" />
                    </div>
                    <span className="kt-testament-badge">46 QUYỂN SÁCH · CỰU ƯỚC</span>
                  </div>

                  <h3 className="kt-testament-title">Cựu Ước (Vetus Testamentum)</h3>
                  
                  <div className="kt-testament-meta-bar">
                    <span className="kt-meta-chip">
                      <Clock size={14} aria-hidden="true" />
                      <span>Thời gian: <strong>Thế kỷ X – I TCN</strong></span>
                    </span>
                    <span className="kt-meta-chip">
                      <Globe size={14} aria-hidden="true" />
                      <span>Ngôn ngữ: <strong>Hípri &amp; A-ram</strong></span>
                    </span>
                  </div>

                  <p className="kt-testament-desc">
                    Giao ước tình yêu giữa Thiên Chúa và dân tuyển chọn Israel, chuẩn bị con đường cứu độ muôn dân và tiên báo về ngày Đấng Mêsia giáng trần.
                  </p>

                  <div className="kt-testament-groups">
                    {/* Ngũ Thư */}
                    <div className="kt-bento-group-item kt-bento-ngu-thu">
                      <div className="kt-group-item-head">
                        <span className="kt-group-name">
                          <BookOpen size={14} aria-hidden="true" />
                          <span>Ngũ Thư (Torah)</span>
                        </span>
                        <span className="kt-group-count">5 Quyển</span>
                      </div>
                      <div className="kt-group-chips-wrap">
                        <span className="kt-book-pill"><strong>St</strong> Sáng Thế</span>
                        <span className="kt-book-pill"><strong>Xh</strong> Xuất Hành</span>
                        <span className="kt-book-pill"><strong>Lv</strong> Lê-vi</span>
                        <span className="kt-book-pill"><strong>Ds</strong> Dân Số</span>
                        <span className="kt-book-pill"><strong>Đnl</strong> Đệ Nhị Luật</span>
                      </div>
                    </div>

                    {/* Lịch Sử */}
                    <div className="kt-bento-group-item kt-bento-lich-su">
                      <div className="kt-group-item-head">
                        <span className="kt-group-name">
                          <Clock size={14} aria-hidden="true" />
                          <span>Các Sách Lịch Sử</span>
                        </span>
                        <span className="kt-group-count">16 Quyển</span>
                      </div>
                      <div className="kt-group-chips-wrap">
                        <span className="kt-book-pill"><strong>Gs</strong> Giô-suê</span>
                        <span className="kt-book-pill"><strong>Tl</strong> Thủ Lãnh</span>
                        <span className="kt-book-pill"><strong>Rt</strong> Rút</span>
                        <span className="kt-book-pill"><strong>1-2Sm</strong> Sa-mu-en</span>
                        <span className="kt-book-pill"><strong>1-2V</strong> Các Vua</span>
                        <span className="kt-book-pill"><strong>1-2Sb</strong> Sử Biên Niên</span>
                        <span className="kt-book-pill"><strong>Er</strong> Ét-ra</span>
                        <span className="kt-book-pill"><strong>Ne</strong> Nơ-khe-mi-a</span>
                        <span className="kt-book-pill"><strong>Tb</strong> Tô-bi-a</span>
                        <span className="kt-book-pill"><strong>Gđt</strong> Giu-đi-tha</span>
                        <span className="kt-book-pill"><strong>Et</strong> Ét-te</span>
                        <span className="kt-book-pill"><strong>1-2Mcb</strong> Ma-ca-bê</span>
                      </div>
                    </div>

                    {/* Giáo Huấn & Thánh Vịnh */}
                    <div className="kt-bento-group-item kt-bento-giao-huan">
                      <div className="kt-group-item-head">
                        <span className="kt-group-name">
                          <Bookmark size={14} aria-hidden="true" />
                          <span>Giáo Huấn &amp; Thánh Vịnh</span>
                        </span>
                        <span className="kt-group-count">7 Quyển</span>
                      </div>
                      <div className="kt-group-chips-wrap">
                        <span className="kt-book-pill"><strong>G</strong> Gióp</span>
                        <span className="kt-book-pill"><strong>Tv</strong> 150 Thánh Vịnh</span>
                        <span className="kt-book-pill"><strong>Cn</strong> Châm Ngôn</span>
                        <span className="kt-book-pill"><strong>Gv</strong> Giảng Viên</span>
                        <span className="kt-book-pill"><strong>Dc</strong> Diễm Ca</span>
                        <span className="kt-book-pill"><strong>Kn</strong> Khôn Ngoan</span>
                        <span className="kt-book-pill"><strong>Hc</strong> Huấn Ca</span>
                      </div>
                    </div>

                    {/* Các Ngôn Sứ */}
                    <div className="kt-bento-group-item kt-bento-ngon-su">
                      <div className="kt-group-item-head">
                        <span className="kt-group-name">
                          <Compass size={14} aria-hidden="true" />
                          <span>Các Ngôn Sứ (Tiên Tri)</span>
                        </span>
                        <span className="kt-group-count">18 Quyển</span>
                      </div>
                      <div className="kt-group-chips-wrap">
                        <span className="kt-book-pill"><strong>Is</strong> I-sai-a</span>
                        <span className="kt-book-pill"><strong>Gr</strong> Giê-rê-mi-a</span>
                        <span className="kt-book-pill"><strong>Ac</strong> Ai Ca</span>
                        <span className="kt-book-pill"><strong>Br</strong> Ba-rúc</span>
                        <span className="kt-book-pill"><strong>Ez</strong> Ê-dê-ki-en</span>
                        <span className="kt-book-pill"><strong>Đn</strong> Đa-ni-en</span>
                        <span className="kt-book-pill" title="Hô-sê, Gô-en, A-mốt, Ô-va-đia, Giô-na, Mi-kha, Na-khum, Kha-ba-cúc, Xô-phô-ni-a, Khai-gai, Da-ca-ri-a, Mơ-la-khi"><strong>12</strong> Ngôn Sứ Nhỏ</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="kt-bible-lookup-btn"
                  onClick={() => {
                    setNavModalBookId(null);
                    setNavModalTestament("old");
                    setIsNavModalOpen(true);
                  }}
                >
                  <BookOpen size={16} aria-hidden="true" />
                  <span>Tra Cứu 46 Cuốn Cựu Ước Trực Tuyến</span>
                  <ExternalLink size={14} aria-hidden="true" />
                </button>
              </div>

              {/* Tân Ước */}
              <div className="kt-testament-box kt-testament-new">
                <div>
                  <div className="kt-testament-top">
                    <div className="kt-testament-icon-wrap">
                      <Cross size={24} aria-hidden="true" />
                    </div>
                    <span className="kt-testament-badge">27 QUYỂN SÁCH · TÂN ƯỚC</span>
                  </div>

                  <h3 className="kt-testament-title">Tân Ước (Novum Testamentum)</h3>

                  <div className="kt-testament-meta-bar">
                    <span className="kt-meta-chip">
                      <Clock size={14} aria-hidden="true" />
                      <span>Thời gian: <strong>Khoảng 50 – 100 CN</strong></span>
                    </span>
                    <span className="kt-meta-chip">
                      <Globe size={14} aria-hidden="true" />
                      <span>Ngôn ngữ: <strong>Hy Lạp (Koiné)</strong></span>
                    </span>
                  </div>

                  <p className="kt-testament-desc">
                    Tin Mừng Đức Giêsu Kitô — Ngôi Lời Nhập Thể, Đấng đã chết và sống lại vinh hiển, hiện diện sống động trong Hội Thánh qua mọi thời đại.
                  </p>

                  <div className="kt-testament-groups">
                    {/* Bốn Sách Tin Mừng */}
                    <div className="kt-bento-group-item kt-bento-tin-mung">
                      <div className="kt-group-item-head">
                        <span className="kt-group-name">
                          <Sparkles size={14} aria-hidden="true" />
                          <span>Bốn Tin Mừng (Trái Tim Kinh Thánh)</span>
                        </span>
                        <span className="kt-group-count">4 Quyển</span>
                      </div>
                      <div className="kt-group-chips-wrap">
                        <span className="kt-book-pill"><strong>Mt</strong> Mát-thêu</span>
                        <span className="kt-book-pill"><strong>Mc</strong> Mác-cô</span>
                        <span className="kt-book-pill"><strong>Lc</strong> Lu-ca</span>
                        <span className="kt-book-pill"><strong>Ga</strong> Gio-an</span>
                      </div>
                    </div>

                    {/* Lịch Sử Giáo Hội Tiên Khởi */}
                    <div className="kt-bento-group-item kt-bento-cv">
                      <div className="kt-group-item-head">
                        <span className="kt-group-name">
                          <Church size={14} aria-hidden="true" />
                          <span>Lịch Sử Hội Thánh Tiên Khởi</span>
                        </span>
                        <span className="kt-group-count">1 Quyển</span>
                      </div>
                      <div className="kt-group-chips-wrap">
                        <span className="kt-book-pill"><strong>Cv</strong> Tông Đồ Công Vụ</span>
                      </div>
                    </div>

                    {/* Thư Thánh Phaolô */}
                    <div className="kt-bento-group-item kt-bento-phaolo">
                      <div className="kt-group-item-head">
                        <span className="kt-group-name">
                          <Bookmark size={14} aria-hidden="true" />
                          <span>Các Thư Thánh Phaolô</span>
                        </span>
                        <span className="kt-group-count">14 Thư</span>
                      </div>
                      <div className="kt-group-chips-wrap">
                        <span className="kt-book-pill"><strong>Rm</strong> Rô-ma</span>
                        <span className="kt-book-pill"><strong>1-2Cr</strong> Cô-rin-tô</span>
                        <span className="kt-book-pill"><strong>Gl</strong> Ga-lát</span>
                        <span className="kt-book-pill"><strong>Ep</strong> Ê-phê-sô</span>
                        <span className="kt-book-pill"><strong>Pl</strong> Phi-líp-phê</span>
                        <span className="kt-book-pill"><strong>Cl</strong> Cô-lô-sê</span>
                        <span className="kt-book-pill"><strong>1-2Tx</strong> Thê-xa-lô-ni-ca</span>
                        <span className="kt-book-pill"><strong>1-2Tm</strong> Ti-mô-thê</span>
                        <span className="kt-book-pill"><strong>Tt</strong> Ti-tô</span>
                        <span className="kt-book-pill"><strong>Pm</strong> Phi-lê-môn</span>
                        <span className="kt-book-pill"><strong>Dt</strong> Do Thái</span>
                      </div>
                    </div>

                    {/* Thư Chung & Khải Huyền */}
                    <div className="kt-bento-group-item kt-bento-khai-huyen">
                      <div className="kt-group-item-head">
                        <span className="kt-group-name">
                          <Sun size={14} aria-hidden="true" />
                          <span>Thư Tông Đồ Chung &amp; Khải Huyền</span>
                        </span>
                        <span className="kt-group-count">8 Quyển</span>
                      </div>
                      <div className="kt-group-chips-wrap">
                        <span className="kt-book-pill"><strong>Gc</strong> Gia-cô-bê</span>
                        <span className="kt-book-pill"><strong>1-2Pr</strong> Phê-rô</span>
                        <span className="kt-book-pill"><strong>1-2-3Ga</strong> Gio-an</span>
                        <span className="kt-book-pill"><strong>Gđ</strong> Giu-đa</span>
                        <span className="kt-book-pill"><strong>Kh</strong> Khải Huyền</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="kt-bible-lookup-btn"
                  onClick={() => {
                    setNavModalBookId(null);
                    setNavModalTestament("new");
                    setIsNavModalOpen(true);
                  }}
                >
                  <BookOpen size={16} aria-hidden="true" />
                  <span>Tra Cứu 27 Cuốn Tân Ước Trực Tuyến</span>
                  <ExternalLink size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Lectio Divina */}
          {activeTab === "lectio" && (
            <div id="panel-lectio" role="tabpanel" aria-labelledby="tab-btn-lectio">
              <div className="kt-lectio-grid">
                {/* Bước 1: Lectio */}
                <div className="kt-lectio-card kt-lectio-step-1">
                  <div>
                    <div className="kt-lectio-card-top">
                      <div className="kt-lectio-icon-wrap">
                        <Eye size={22} aria-hidden="true" />
                      </div>
                      <span className="kt-lectio-step-num">BƯỚC 01</span>
                    </div>
                    <div className="kt-lectio-latin">Lectio · Lắng Nghe Tiếng Chúa</div>
                    <h4 className="kt-lectio-title">Đọc Lời Chúa</h4>
                    <p className="kt-lectio-desc">
                      Đọc chậm rãi đoạn Kinh Thánh từ 2–3 lần. Lắng đọng tâm hồn, gác lại âu lo để đón nhận từng lời như chính Chúa đang nói riêng với chính bạn.
                    </p>
                  </div>
                  <div>
                    <div className="kt-lectio-question-box">
                      <div className="kt-question-tag">
                        <HelpCircle size={12} aria-hidden="true" />
                        <span>Câu Hỏi Soi Sáng</span>
                      </div>
                      <div className="kt-question-text">
                        "Đoạn Lời Chúa này đang nói điều gì với tôi?"
                      </div>
                    </div>
                    <div className="kt-action-tip">
                      <Check size={14} aria-hidden="true" />
                      <span>Thực hành: Gạch chân 1 câu đánh động tâm hồn nhất.</span>
                    </div>
                  </div>
                </div>

                {/* Bước 2: Meditatio */}
                <div className="kt-lectio-card kt-lectio-step-2">
                  <div>
                    <div className="kt-lectio-card-top">
                      <div className="kt-lectio-icon-wrap">
                        <Compass size={22} aria-hidden="true" />
                      </div>
                      <span className="kt-lectio-step-num">BƯỚC 02</span>
                    </div>
                    <div className="kt-lectio-latin">Meditatio · Ghi Khắc Vào Tim</div>
                    <h4 className="kt-lectio-title">Suy Niệm</h4>
                    <p className="kt-lectio-desc">
                      Để câu Lời Chúa vang vọng trong tâm trí. Đối chiếu Lời ấy với việc học, tình bạn bè, gia đình và những băn khoăn đang diễn ra trong tuần.
                    </p>
                  </div>
                  <div>
                    <div className="kt-lectio-question-box">
                      <div className="kt-question-tag">
                        <HelpCircle size={12} aria-hidden="true" />
                        <span>Câu Hỏi Soi Sáng</span>
                      </div>
                      <div className="kt-question-text">
                        "Lời Chúa soi sáng điều gì trong đời sống tôi?"
                      </div>
                    </div>
                    <div className="kt-action-tip">
                      <Check size={14} aria-hidden="true" />
                      <span>Thực hành: Dành 3 phút thinh lặng để suy ngẫm sâu.</span>
                    </div>
                  </div>
                </div>

                {/* Bước 3: Oratio */}
                <div className="kt-lectio-card kt-lectio-step-3">
                  <div>
                    <div className="kt-lectio-card-top">
                      <div className="kt-lectio-icon-wrap">
                        <Heart size={22} aria-hidden="true" />
                      </div>
                      <span className="kt-lectio-step-num">BƯỚC 03</span>
                    </div>
                    <div className="kt-lectio-latin">Oratio · Thưa Chuyện Cùng Cha</div>
                    <h4 className="kt-lectio-title">Cầu Nguyện</h4>
                    <p className="kt-lectio-desc">
                      Mở lòng tâm sự cùng Thầy Giêsu như người bạn: tạ ơn về niềm vui, xin lỗi về thiếu sót và xin ơn nâng đỡ trước những cám dỗ tuổi trẻ.
                    </p>
                  </div>
                  <div>
                    <div className="kt-lectio-question-box">
                      <div className="kt-question-tag">
                        <HelpCircle size={12} aria-hidden="true" />
                        <span>Câu Hỏi Soi Sáng</span>
                      </div>
                      <div className="kt-question-text">
                        "Tôi muốn dâng lên Chúa lời tâm sự nào hôm nay?"
                      </div>
                    </div>
                    <div className="kt-action-tip">
                      <Check size={14} aria-hidden="true" />
                      <span>Thực hành: Viết 1 lời nguyện ngắn vào cuốn sổ tay.</span>
                    </div>
                  </div>
                </div>

                {/* Bước 4: Contemplatio */}
                <div className="kt-lectio-card kt-lectio-step-4">
                  <div>
                    <div className="kt-lectio-card-top">
                      <div className="kt-lectio-icon-wrap">
                        <Flame size={22} aria-hidden="true" />
                      </div>
                      <span className="kt-lectio-step-num">BƯỚC 04</span>
                    </div>
                    <div className="kt-lectio-latin">Contemplatio · Biến Đổi Đời Sống</div>
                    <h4 className="kt-lectio-title">Chiêm Niệm</h4>
                    <p className="kt-lectio-desc">
                      Nghỉ ngơi bình an trong tình yêu Thiên Chúa. Quyết tâm thực thi một việc tốt cụ thể trong ngày theo tinh thần nhiệt quang và can đảm.
                    </p>
                  </div>
                  <div>
                    <div className="kt-lectio-question-box">
                      <div className="kt-question-tag">
                        <HelpCircle size={12} aria-hidden="true" />
                        <span>Câu Hỏi Soi Sáng</span>
                      </div>
                      <div className="kt-question-text">
                        "Tôi sẽ làm chứng cho Chúa bằng hành động nào?"
                      </div>
                    </div>
                    <div className="kt-action-tip">
                      <Check size={14} aria-hidden="true" />
                      <span>Thực hành: Làm 1 việc tốt âm thầm giúp đỡ tha nhân.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dei Verbum 25 Banner */}
              <div className="kt-dei-verbum-banner">
                <div className="kt-quote-badge">
                  <Quote size={22} aria-hidden="true" />
                </div>
                <div className="kt-dei-verbum-content">
                  <em>"Ước gì các tín hữu sẵn lòng tiếp xúc với chính bản văn Thánh Kinh... Và phải nhớ rằng: kinh nguyện phải đi liền với việc đọc Thánh Kinh, để có được sự đối thoại giữa Thiên Chúa và con người."</em>
                  <span className="kt-dei-verbum-cite">— Hiến chế Mặc khải Dei Verbum (Số 25) · Công đồng Vaticanô II</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5: TIMELINE COMPACT 4 BƯỚC NHỊP SỐNG CHÚA NHẬT (CA 1)
      ══════════════════════════════════════════════════════════════ */}
      <section className="kt-timeline-section">
        <div className="kt-shell">
          <div className="kt-section-header">
            <div className="kt-eyebrow">
              <span className="kt-dot" />
              <span>THỜI GIAN BIỂU CHÚA NHẬT (CA 1)</span>
            </div>
            <h2 className="kt-section-title">
              Nhịp Sống <em>Chúa Nhật Ca 1</em>
            </h2>
            <p className="kt-section-desc">
              Lịch trình sinh hoạt sáng Chúa Nhật hàng tuần dành cho toàn bộ đoàn sinh Khối Kinh Thánh Giáo xứ An Ngãi.
            </p>
          </div>

          {/* Thanh ray ngang tiến trình Stepper (Desktop >= 768px) */}
          <div className="kt-stepper-track" aria-hidden="true">
            <div className="kt-stepper-line" />
            <div className="kt-stepper-nodes">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className={`kt-stepper-col ${step.highlight ? "highlight" : ""}`}>
                  <div className="kt-stepper-node">{idx + 1}</div>
                  <span className="kt-stepper-time">{step.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lưới thẻ thời gian biểu (Mobile: Trục dọc, Desktop: 4 Cards) */}
          <div className="kt-compact-timeline">
            {timelineSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className={`kt-time-chip ${step.highlight ? "highlight" : ""}`}>
                  <span className="kt-time-node" aria-hidden="true">{idx + 1}</span>
                  <div className="kt-time-card">
                    <div className="kt-time-header">
                      <span className="kt-time-badge">{step.time}</span>
                      {step.tag && (
                        <span className="kt-time-tag">{step.tag}</span>
                      )}
                    </div>
                    <div className="kt-time-content">
                      <span className="kt-time-label">{step.label}</span>
                      <span className="kt-time-sub">{step.sub}</span>
                    </div>
                  </div>
                </div>
                {idx < timelineSteps.length - 1 && (
                  <span className="kt-time-arrow" aria-hidden="true">→</span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="kt-timeline-footer-note">
            <ShieldCheck size={18} style={{ color: "var(--kt-accent-badge)", flexShrink: 0 }} aria-hidden="true" />
            <span><strong>Lưu ý nề nếp:</strong> Phụ huynh vui lòng đưa đón con đúng giờ tại sảnh Nhà Thờ và cửa phòng học để bảo đảm an toàn nề nếp.</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 6: HỘI THÁNH TẠI GIA & FAQ CẨM NANG PHỤ HUYNH
      ══════════════════════════════════════════════════════════════ */}
      <section id="dong-hanh" className="kt-family-section">
        <div className="kt-shell">
          <div className="kt-section-header">
            <div className="kt-eyebrow">
              <span className="kt-dot" />
              <span>GÓC PHỤ HUYNH &amp; HỘI THÁNH TẠI GIA · NGÀNH NHIỆT QUANG</span>
            </div>
            <h2 className="kt-section-title">
              Đồng Hành Cùng Con <em>Mở Trang Kinh Thánh</em>
            </h2>
            <p className="kt-section-desc">
              Tuổi 13–14 là giai đoạn dậy thì với nhiều chuyển biến tâm sinh lý sâu sắc. Mái ấm gia đình và ngọn đèn Lời Chúa chính là nơi che chở, uốn nắn và thấu cảm các em tốt nhất.
            </p>
          </div>

          {/* Bento Family Hub (2 Cột: 3 Cột Trụ bên trái + Sanctuary Box bên phải) */}
          <div className="kt-family-bento-grid">
            {/* Cột trái: 3 Trụ cột hành động */}
            <div className="kt-pillars-stack">
              {familyPillars.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={idx}
                    className={`kt-pillar-card pillar-${item.key || (idx === 0 ? "red" : idx === 1 ? "orange" : "gold")}`}
                  >
                    <div className="kt-pillar-top">
                      <div className="kt-pillar-header-left">
                        <div className="kt-pillar-icon-wrap">
                          <IconComp size={22} />
                        </div>
                        <h4 className="kt-pillar-title">{item.title}</h4>
                      </div>
                      <span className="kt-pillar-badge">{item.badge}</span>
                    </div>
                    <p className="kt-pillar-desc">{item.desc}</p>
                    <div className="kt-pillar-action-tip">
                      <strong>Gợi ý cha mẹ:</strong> {item.tip}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cột phải: Sanctuary Box (Mái Ấm & Checklist) */}
            <div className="kt-sanctuary-box">
              <div>
                <div className="kt-sanctuary-eyebrow">
                  <Sparkles size={14} aria-hidden="true" />
                  <span>{sanctuaryData.eyebrow}</span>
                </div>

                <div className="kt-sanctuary-quote-card">
                  <div className="kt-sanctuary-quote-header">
                    <Quote size={18} className="kt-sanctuary-quote-icon" aria-hidden="true" />
                    <span className="kt-sanctuary-quote-author">{sanctuaryData.author}</span>
                  </div>
                  <blockquote className="kt-sanctuary-quote-text">
                    {sanctuaryData.quote}
                  </blockquote>
                </div>

                <div className="kt-checklist-section-title">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>{sanctuaryData.checklistTitle}</span>
                </div>

                <ul className="kt-checklist-list">
                  {sanctuaryData.checklist.map((chk, cIdx) => (
                    <li key={cIdx} className="kt-checklist-item">
                      <span className="kt-check-icon">✓</span>
                      <span><strong>{chk.label}:</strong> {chk.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hộp liên hệ hỗ trợ */}
              <div className="kt-support-note-box">
                <div className="kt-support-note-text">
                  <strong>{sanctuaryData.supportTitle}</strong><br />
                  {sanctuaryData.supportDesc}
                </div>
                <Link to={sanctuaryData.supportBtnLink} className="kt-support-note-btn">
                  <span>{sanctuaryData.supportBtnText}</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          {/* FAQ Accordion Phụ Huynh */}
          <div className="kt-faq-wrapper">
            <div className="kt-faq-header">
              <h3 className="kt-faq-title">
                Giải Đáp Thắc Mắc Khối Kinh Thánh (FAQ)
              </h3>
              <p className="kt-faq-desc">
                Các thông tin cần thiết về chương trình đào tạo Lời Chúa, tâm sinh lý lứa tuổi 13–14 và sự đồng hành của phụ huynh.
              </p>
            </div>

            <div className="kt-faq-list">
              {faqs.map((item, idx) => {
                const isOpen = openFaq === idx;
                const faqAnsId = `kt-faq-ans-${idx}`;
                const padIdx = String(idx + 1).padStart(2, "0");
                return (
                  <div key={idx} className={`kt-faq-item ${isOpen ? "active" : ""}`}>
                    <button
                      type="button"
                      className="kt-faq-btn"
                      aria-expanded={isOpen}
                      aria-controls={faqAnsId}
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                    >
                      <div className="kt-faq-question-wrap">
                        <span className="kt-faq-q-badge">{padIdx}</span>
                        <span>{item.q}</span>
                      </div>
                      <ChevronDown
                        size={18}
                        aria-hidden="true"
                        className="kt-faq-chevron"
                      />
                    </button>
                    {isOpen && (
                      <div id={faqAnsId} className="kt-faq-answer">
                        <p>{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 7: CTA BANNER ĐĂNG KÝ TUYỂN SINH & LIÊN HỆ
      ══════════════════════════════════════════════════════════════ */}
      <div className="kt-shell">
        <div className="kt-cta-banner">
          <div className="kt-cta-glow" aria-hidden="true" />

          <div className="kt-cta-badge">
            <span className="kt-cta-badge-icon" aria-hidden="true">🔥</span>
            <span>NIÊN KHÓA {academicYear} · GIÁO XỨ AN NGÃI</span>
          </div>

          <h3 className="kt-cta-title">
            Cùng Con Mở Trang Kinh Thánh &amp; Vững Bước Vào Đời
          </h3>

          <p className="kt-cta-desc">
            Tuổi 13–14 là những năm tháng nền tảng định hình nhân cách và đức tin. Xứ đoàn Mẹ Mân Côi kính mời quý phụ huynh đồng hành để Lời Chúa trở thành ngọn đèn soi sáng từng bước đi tương lai của con.
          </p>

          <div className="kt-cta-actions">
            {/* Nút chính 52px chiếm vị trí nổi bật nhất */}
            <Link to="/tuyển-sinh#dang-ky" className="kt-cta-primary-btn">
              <Sparkles size={18} aria-hidden="true" />
              <span>Đăng Ký Khối Kinh Thánh</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>

            {/* 2 nút phụ hỗ trợ thanh lịch, đối xứng */}
            <div className="kt-cta-secondary-group">
              <Link to="/lịch-học" className="kt-cta-secondary-btn">
                <Clock size={15} aria-hidden="true" />
                <span>Xem Lịch Ca 1</span>
              </Link>
              <Link to="/liên-hệ" className="kt-cta-secondary-btn">
                <Church size={15} aria-hidden="true" />
                <span>Liên Hệ Ban Giáo Lý</span>
              </Link>
            </div>
          </div>

          <div className="kt-cta-note">
            <span>✦ Ghi danh trực tuyến thuận tiện · Ban Giáo lý sẽ liên hệ xác nhận và sắp xếp phòng học Ca 1.</span>
          </div>
        </div>
      </div>

      {/* Modal Tra Cứu & Đọc Kinh Thánh Trực Tuyến */}
      <BibleQuickNavigatorModal
        isOpen={isNavModalOpen}
        onClose={() => setIsNavModalOpen(false)}
        initialBookId={navModalBookId}
        initialTestament={navModalTestament}
      />
    </div>
  );
}