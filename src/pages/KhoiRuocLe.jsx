import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users, BookOpen, Clock, CalendarDays, MapPin,
  Sparkles, ChevronDown, HelpCircle,
  Heart, ShieldCheck, Smile, ArrowRight,
  Church, CheckCircle2, Award, Cross, Flame, Droplets, Quote,
  Calendar
} from "lucide-react";
import { getKhoiRuocLeData } from "../utils/academicYear.js";
import "./KhoiRuocLe.css";

// Helper định dạng chức danh Giáo Lý Viên trang trọng
const formatTeacherName = (t) => {
  if (t.startsWith("C.")) return `Chị ${t.slice(2)}`;
  if (t.startsWith("A.")) return `Anh ${t.slice(2)}`;
  if (t.startsWith("Sr.")) return `Sr. ${t.slice(3)}`;
  return t;
};

// Helper gắn tầng cho phòng học
const getRoomLocation = (room) => {
  if (room.includes("P3") || room.includes("P4") || room.includes("P5")) {
    return `${room} · Tầng Trệt`;
  }
  if (room.includes("P7") || room.includes("P8")) {
    return `${room} · Lầu 1`;
  }
  if (room.toLowerCase().includes("hầm")) {
    return "Nhà Hầm Sinh Hoạt";
  }
  return room;
};

export default function KhoiRuocLe() {
  // Lấy dữ liệu tự động tính toán niên khóa và năm sinh theo thời gian thực
  const data = getKhoiRuocLeData();
  const {
    academicYear,
    ruocLe1BirthYear,
    ruocLe2BirthYear,
    classes
  } = data;

  const [openFaq, setOpenFaq] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("all");

  useEffect(() => {
    const prevTitle = document.title;
    document.title = `Khối Rước Lễ (RLLĐ 1 & 2) · Ngành Ấu HTDC · Niên Khóa ${academicYear} | Giáo xứ An Ngãi`;
    return () => {
      document.title = prevTitle;
    };
  }, [academicYear]);

  // Phân nhóm lớp học
  const rld1Classes = classes.filter((c) => c.group === "Rước Lễ 1");
  const rld2Classes = classes.filter((c) => c.group === "Rước Lễ 2");



  // 6 Chặng sư phạm đức tin trực quan Ngành Ấu (Cân bằng độ dài chuẩn xác)
  const faithJourneySteps = [
    {
      step: "01",
      icon: Droplets,
      practiceIcon: Droplets,
      accentColor: "#16a34a",
      accentBg: "rgba(22, 163, 74, 0.1)",
      accentBorder: "rgba(22, 163, 74, 0.25)",
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
      accentColor: "#e11d48",
      accentBg: "rgba(225, 29, 72, 0.1)",
      accentBorder: "rgba(225, 29, 72, 0.25)",
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
      accentColor: "#7c3aed",
      accentBg: "rgba(124, 58, 237, 0.1)",
      accentBorder: "rgba(124, 58, 237, 0.25)",
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
      accentColor: "#d97706",
      accentBg: "rgba(217, 119, 6, 0.1)",
      accentBorder: "rgba(217, 119, 6, 0.25)",
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
      accentColor: "#b45309",
      accentBg: "rgba(180, 83, 9, 0.1)",
      accentBorder: "rgba(180, 83, 9, 0.25)",
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
      accentColor: "#15803d",
      accentBg: "rgba(21, 128, 61, 0.12)",
      accentBorder: "rgba(21, 128, 61, 0.35)",
      title: "Sống Tình Yêu Thánh Thể",
      sub: "Hùng Tâm – Dũng Chí Giữa Đời",
      badge: "Chứng Nhân Nhỏ",
      practiceLabel: "Châm ngôn Ngành Ấu",
      meaning: "Rước Lễ Lần Đầu là khởi đầu cho nếp sống mới. Đón nhận Chúa vào lòng, các em được mời gọi đem tình yêu, lòng vị tha và sự tử tế lan tỏa đến gia đình, trường học và bạn bè.",
      highlight: "Sống châm ngôn Ngành Ấu: Vâng lời cha mẹ, chăm học, trung thực và siêng năng dự lễ Chúa Nhật."
    }
  ];

  // 4 Mốc thời gian gọn gàng của Ca 2 Chúa Nhật
  const timelineSteps = [
    {
      time: "07:45",
      label: "Tập trung tại Tiền Sảnh",
      sub: "GLV đón tiếp & ổn định hàng ngũ Ngành Ấu",
      highlight: false,
      tag: null
    },
    {
      time: "08:00 – 09:00",
      label: "Thánh Lễ Thiếu Nhi Toàn Đoàn",
      sub: "Hàng ghế Ngành Ấu cùng GLV · Sốt sắng thưa kinh và dọn lòng rước Chúa",
      highlight: true,
      tag: "Tâm Điểm Phụng Vụ"
    },
    {
      time: "09:15 – 10:00",
      label: "Học Giáo Lý & Nhân Bản",
      sub: "Huấn giáo Bí tích Hòa Giải & Thánh Thể, rèn luyện vâng lời cha mẹ (P3 – P8)",
      highlight: true,
      tag: "Huấn Giáo Đức Tin"
    },
    {
      time: "10:00",
      label: "Phụ huynh đón em",
      sub: "Điểm danh trật tự và ra về an toàn tại cửa phòng học",
      highlight: false,
      tag: null
    }
  ];

  // 3 Trụ cột Hội Thánh Tại Gia (Bento Family Hub)
  const familyPillars = [
    {
      key: "green",
      title: "Tập Cho Con Thói Quen Cầu Nguyện",
      badge: "Mỗi Tối",
      desc: "Dạy con các kinh căn bản: Kinh Lạy Cha, Kính Mừng, Sáng Danh và Kinh Ăn Năn Tội. Cùng con dâng lời nguyện tự phát ngắn tạ ơn Chúa trước bữa ăn và trước khi ngủ.",
      tip: "Khen ngợi và ôm con sau mỗi giờ kinh tối để con cảm nhận việc cầu nguyện luôn tràn ngập niềm vui.",
      icon: Heart
    },
    {
      key: "purple",
      title: "Dạy Con Xét Mình Trong Yêu Thương",
      badge: "Bí Tích Hòa Giải",
      desc: "Giúp con hiểu Xưng Tội là trở về với vòng tay Cha nhân từ, không phải vì sợ phạt. Hướng dẫn con can đảm nhận lỗi khi làm cha mẹ buồn hoặc cãi nhau với anh chị em.",
      tip: "Cha mẹ cũng biết nói lời 'xin lỗi' và 'cảm ơn' con cái để làm gương sống đức khiêm nhường.",
      icon: Cross
    },
    {
      key: "amber",
      title: "Tôn Kính Chúa Giêsu Thánh Thể",
      badge: "Sáng Chúa Nhật",
      desc: "Giải thích cho con Bánh Thánh là Mình Thánh Chúa Kitô thật sự. Dạy con giữ chay 1 giờ trước khi rước lễ, chắp tay nghiêm trang và tạ ơn sau khi rước Chúa vào lòng.",
      tip: "Khi đưa con vào nhà thờ, cùng con cúi chào Chúa ngự nơi Nhà Tạm với tất cả lòng tôn kính.",
      icon: Church
    }
  ];

  // Khối Sanctuary Box (Lời Chúa & Checklist Chuẩn Bị Rước Lễ Lần Đầu)
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

  // Cẩm nang FAQ tinh gọn cho Phụ huynh Khối Rước Lễ
  const faqs = [
    {
      q: `Điều kiện để các em được theo học Khối Rước Lễ niên khóa ${academicYear} là gì?`,
      a: `Dành cho các em 8 – 9 tuổi: Lớp RLLĐ 1 (8 tuổi · Sinh năm ${ruocLe1BirthYear}) và Lớp RLLĐ 2 (9 tuổi · Sinh năm ${ruocLe2BirthYear}), đã lãnh nhận Bí tích Rửa Tội và hoàn thành chương trình Khối Chiên Con (hoặc có chứng nhận chuyển xứ tương đương).`
    },
    {
      q: "Lớp RLLĐ 1 và Lớp RLLĐ 2 khác nhau như thế nào trong chương trình đào tạo?",
      a: `Khối Rước Lễ gồm 2 năm đào tạo bài bản: Năm thứ nhất (RLLĐ 1) học về căn tính Kitô hữu, làm quen Lời Chúa, học các lời kinh căn bản và tập xét mình. Năm thứ hai (RLLĐ 2) đi sâu vào Bí tích Hòa Giải và Thánh Thể, tham dự kỳ thi giáo lý, tĩnh tâm và chuẩn bị trực tiếp để lãnh nhận Bí tích Rước Lễ Lần Đầu.`
    },
    {
      q: "Trang phục của các em trong Ngày Rước Lễ Lần Đầu quy định như thế nào?",
      a: "Theo truyền thống phụng vụ trang trọng của Giáo xứ An Ngãi: Toàn bộ các em mặc áo thụng trắng (albs) đồng phục có cổ yếm xanh chuối non của Ngành Ấu Hùng Tâm Dũng Chí. Bé gái đội vòng hoa trắng đơn sơ, bé trai mang giày sẫm màu sạch sẽ, đầu tóc gọn gàng."
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
    <div className="rl-page">
      {/* ══════════════════════════════════════════════════════════════
          HERO SECTION: 2 CỘT VISUAL-FIRST VỚI ẢNH THẬT 92 EM AN NGÃI
      ══════════════════════════════════════════════════════════════ */}
      <section className="rl-hero">
        <div className="rl-shell">
          <div className="rl-hero-grid">
            {/* Cột trái: Nhãn, Tiêu đề lớn, Mô tả & Nút CTA hành động nổi bật */}
            <div className="rl-hero-left">
              <div className="rl-hero-pill-badge">
                <span className="rl-hero-pill-icon" aria-hidden="true">🌿</span>
                <span>Ngành Ấu HTDC · Khối Rước Lễ</span>
              </div>

              <h1 className="rl-hero-title">
                Đón Chúa Vào Lòng<br />
                <em>Khắc Ghi Tình Cha</em>
              </h1>

              <p className="rl-hero-desc">
                Chuẩn bị tâm hồn thánh thiện qua Bí tích Hòa Giải và đón nhận Mình Thánh Chúa Kitô lần đầu tiên — dấu ấn đức tin sâu đậm của tuổi thơ Kitô hữu.
              </p>

              <div className="rl-hero-actions">
                <a href="#danh-sach-lop" className="rl-btn-primary">
                  <span>Xem 5 Lớp Học</span>
                  <ArrowRight size={18} aria-hidden="true" className="rl-btn-icon" />
                </a>
                <Link to="/tuyển-sinh#dang-ky" className="rl-btn-secondary">
                  <Sparkles size={17} aria-hidden="true" className="rl-btn-icon" />
                  <span>Đăng Ký Khóa Mới</span>
                </Link>
              </div>
            </div>

            {/* Cột phải: Khung ảnh 92 em RLLĐ Giáo xứ An Ngãi */}
            <div className="rl-hero-right">
              <div className="rl-hero-image-card">
                <img
                  src="/images/khoiruocle-anngai.jpg"
                  alt="92 em Rước Lễ Lần Đầu Giáo xứ An Ngãi"
                  className="rl-hero-img"
                  loading="eager"
                  fetchPriority="high"
                />
                <div className="rl-floating-badge">
                  <div className="rl-floating-badge-icon">
                    <Church size={20} />
                  </div>
                  <div>
                    <div className="rl-floating-badge-title">
                      92 Em Lần Đầu Đến Bàn Tiệc Thánh
                    </div>
                    <div className="rl-floating-badge-sub">
                      Xứ đoàn Mẹ Mân Côi · Giáo xứ An Ngãi
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dải tổng quan 4 chỉ số (Overview Bar) tối ưu hiển thị trên Desktop & Mobile */}
          <div className="rl-overview-bar">
            <div className="rl-overview-chip">
              <span className="rl-chip-cat">Độ tuổi</span>
              <span className="rl-chip-value">8 – 9 Tuổi</span>
              <span className="rl-chip-label">Sinh năm {ruocLe2BirthYear}–{ruocLe1BirthYear}</span>
            </div>
            <div className="rl-overview-chip">
              <span className="rl-chip-cat">Quy mô</span>
              <span className="rl-chip-value">5 Lớp Học</span>
              <span className="rl-chip-label">Khối RLLĐ 1 &amp; RLLĐ 2</span>
            </div>
            <div className="rl-overview-chip">
              <span className="rl-chip-cat">Lịch học</span>
              <span className="rl-chip-value">Chúa Nhật</span>
              <span className="rl-chip-label">Lễ 08:00 · Học 09:15</span>
            </div>
            <div className="rl-overview-chip">
              <span className="rl-chip-cat">Nhân sự</span>
              <span className="rl-chip-value">11 GLV</span>
              <span className="rl-chip-label">Quý Soeur &amp; Huynh Trưởng</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2: DANH SÁCH 5 LỚP HỌC THỰC TẾ
      ══════════════════════════════════════════════════════════════ */}
      <section id="danh-sach-lop" className="rl-roster-section">
        <div className="rl-shell">
          <div className="rl-section-header">
            <div className="rl-eyebrow">
              <span className="rl-dot" />
              <span>DANH SÁCH LỚP THỰC TẾ NIÊN KHÓA {academicYear}</span>
            </div>
            <h2 className="rl-section-title">
              Các Lớp Khối Rước Lễ <em>Giáo xứ An Ngãi</em>
            </h2>
            <p className="rl-section-desc">
              Phòng học, quý Soeur và Huynh trưởng phụ trách 5 lớp học thuộc Ngành Ấu.
            </p>
          </div>

          {/* Bộ lọc phân tầng khối học */}
          <div className="rl-stage-filter-bar">
            <button
              type="button"
              className={`rl-filter-pill ${selectedGroup === "all" ? "active" : ""}`}
              onClick={() => setSelectedGroup("all")}
            >
              Tất Cả<span className="hidden sm:inline"> 5 Lớp</span>
            </button>
            <button
              type="button"
              className={`rl-filter-pill ${selectedGroup === "rl1" ? "active" : ""}`}
              onClick={() => setSelectedGroup("rl1")}
            >
              <span className="hidden sm:inline">Khối </span>RLLĐ 1<span className="hidden sm:inline"> (8 Tuổi · 2 Lớp)</span>
            </button>
            <button
              type="button"
              className={`rl-filter-pill ${selectedGroup === "rl2" ? "active" : ""}`}
              onClick={() => setSelectedGroup("rl2")}
            >
              <span className="hidden sm:inline">Khối </span>RLLĐ 2<span className="hidden sm:inline"> (9 Tuổi · Năm Bí Tích)</span>
            </button>
          </div>

          {/* NHÓM 1: RƯỚC LỄ 1 (8 TUỔI) */}
          {(selectedGroup === "all" || selectedGroup === "rl1") && (
            <div className="rl-group-block">
              <div className="rl-stage-header">
                <div className="rl-stage-title-wrap">
                  <span className="rl-stage-num">01</span>
                  <div>
                    <h3 className="rl-stage-title">Khối RLLĐ 1</h3>
                    <p className="rl-stage-subtitle">
                      Năm thứ nhất · Khai tâm Lời Chúa &amp; Tập xét mình
                    </p>
                  </div>
                </div>
                <div className="rl-stage-pills">
                  <span className="rl-stage-pill">8 Tuổi</span>
                  <span className="rl-stage-pill">Sinh năm {ruocLe1BirthYear}</span>
                  <span className="rl-stage-pill">2 Lớp (P3 &amp; P4)</span>
                </div>
              </div>

              <div className="rl-class-grid">
                {rld1Classes.map((item) => (
                  <div key={item.id} className="rl-class-card card-rl1">
                    {/* TẦNG 1: Head - Badge mã lớp & Vị trí phòng */}
                    <div className="rl-bento-card-head">
                      <span className="rl-bento-class-code">
                        {item.name.replace("Lớp RLLĐ ", "RL ")}
                      </span>
                      <span className="rl-bento-room-badge">
                        <MapPin size={13} aria-hidden="true" />
                        <span>{getRoomLocation(item.room)}</span>
                      </span>
                    </div>

                    {/* TẦNG 2: Tiêu đề lớp & Dải chỉ số Sĩ số / Độ tuổi */}
                    <div>
                      <h4 className="rl-bento-class-title">{item.name}</h4>
                      <div className="rl-bento-stats-strip">
                        {item.studentsCount && (
                          <span className="rl-bento-stat-chip">
                            <Users size={13} aria-hidden="true" />
                            <span>Sĩ số: <strong>{item.studentsCount} em</strong></span>
                          </span>
                        )}
                        <span className="rl-bento-stat-chip">
                          <Calendar size={13} aria-hidden="true" />
                          <span>Độ tuổi: <strong>{item.ageText} ({item.birthYear})</strong></span>
                        </span>
                      </div>
                    </div>

                    {/* TẦNG 3: Đội ngũ GLV Phụ trách */}
                    <div className="rl-bento-teacher-box">
                      <div className="rl-bento-teacher-label">
                        <ShieldCheck size={13} aria-hidden="true" />
                        <span>GLV Phụ trách ({item.teachers.length})</span>
                      </div>
                      <div className="rl-bento-teacher-pills">
                        {item.teachers.map((t, idx) => (
                          <span key={idx} className="rl-bento-teacher-pill">
                            {formatTeacherName(t)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* TẦNG 4: Trọng tâm huấn giáo bí tích */}
                    <div className="rl-bento-focus-box">
                      <div className="rl-bento-focus-badge">{item.levelBadge}</div>
                      <p className="rl-bento-focus-desc">{item.focus}</p>
                    </div>

                    {/* TẦNG 5: Footer - Giờ học & Trạng thái nề nếp */}
                    <div className="rl-bento-card-foot">
                      <span className="rl-bento-time">
                        <Clock size={13} aria-hidden="true" />
                        <span>{item.time} (Ca 2)</span>
                      </span>
                      <span className="rl-bento-status">
                        ● {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NHÓM 2: RƯỚC LỄ 2 (9 TUỔI) */}
          {(selectedGroup === "all" || selectedGroup === "rl2") && (
            <div className="rl-group-block" style={{ marginBottom: "16px" }}>
              <div className="rl-stage-header rl-stage-highlight">
                <div className="rl-stage-title-wrap">
                  <span className="rl-stage-num">02</span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <h3 className="rl-stage-title">Khối RLLĐ 2</h3>
                      <span className="rl-stage-special-badge">⭐ Năm Lãnh Nhận Bí Tích</span>
                    </div>
                    <p className="rl-stage-subtitle">
                      Năm thứ hai · Chuẩn bị Bí tích Hòa Giải, tĩnh tâm &amp; Rước Lễ Lần Đầu
                    </p>
                  </div>
                </div>
                <div className="rl-stage-pills">
                  <span className="rl-stage-pill">9 Tuổi</span>
                  <span className="rl-stage-pill">Sinh năm {ruocLe2BirthYear}</span>
                  <span className="rl-stage-pill">3 Lớp (P5, P7, P8)</span>
                </div>
              </div>

              <div className="rl-class-grid">
                {rld2Classes.map((item) => (
                  <div key={item.id} className="rl-class-card card-rl2">
                    {/* TẦNG 1: Head - Badge mã lớp & Vị trí phòng */}
                    <div className="rl-bento-card-head">
                      <span className="rl-bento-class-code">
                        {item.name.replace("Lớp RLLĐ ", "RL ")}
                      </span>
                      <span className="rl-bento-room-badge">
                        <MapPin size={13} aria-hidden="true" />
                        <span>{getRoomLocation(item.room)}</span>
                      </span>
                    </div>

                    {/* TẦNG 2: Tiêu đề lớp & Dải chỉ số Sĩ số / Độ tuổi */}
                    <div>
                      <h4 className="rl-bento-class-title">{item.name}</h4>
                      <div className="rl-bento-stats-strip">
                        {item.studentsCount && (
                          <span className="rl-bento-stat-chip">
                            <Users size={13} aria-hidden="true" />
                            <span>Sĩ số: <strong>{item.studentsCount} em</strong></span>
                          </span>
                        )}
                        <span className="rl-bento-stat-chip">
                          <Calendar size={13} aria-hidden="true" />
                          <span>Độ tuổi: <strong>{item.ageText} ({item.birthYear})</strong></span>
                        </span>
                      </div>
                    </div>

                    {/* TẦNG 3: Đội ngũ GLV Phụ trách */}
                    <div className="rl-bento-teacher-box">
                      <div className="rl-bento-teacher-label">
                        <ShieldCheck size={13} aria-hidden="true" />
                        <span>GLV Phụ trách ({item.teachers.length})</span>
                      </div>
                      <div className="rl-bento-teacher-pills">
                        {item.teachers.map((t, idx) => (
                          <span key={idx} className="rl-bento-teacher-pill">
                            {formatTeacherName(t)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* TẦNG 4: Trọng tâm huấn giáo bí tích */}
                    <div className="rl-bento-focus-box">
                      <div className="rl-bento-focus-badge">{item.levelBadge}</div>
                      <p className="rl-bento-focus-desc">{item.focus}</p>
                    </div>

                    {/* TẦNG 5: Footer - Giờ học & Trạng thái nề nếp */}
                    <div className="rl-bento-card-foot">
                      <span className="rl-bento-time">
                        <Clock size={13} aria-hidden="true" />
                        <span>{item.time} (Ca 2)</span>
                      </span>
                      <span className="rl-bento-status">
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
          SECTION 3: LỘ TRÌNH 6 CHẶNG GIÁO LÝ ĐỨC TIN TRỰC QUAN
      ══════════════════════════════════════════════════════════════ */}
      <section className="rl-journey-section">
        <div className="rl-shell">
          <div className="rl-section-header">
            <div className="rl-eyebrow">
              <span className="rl-dot" />
              <span>SƯ PHẠM ĐỨC TIN NGÀNH ẤU</span>
            </div>
            <h2 className="rl-section-title">
              Hành Trình Khám Phá &amp; <em>Đón Chúa Vào Lòng</em>
            </h2>
            <p className="rl-section-desc">
              Chương trình đào tạo 6 chặng chuyển hóa từ nhận thức căn bản đến nuôi dưỡng tâm tình nội tâm và sống chứng nhân nhỏ bé.
            </p>
          </div>

          <div className="rl-journey-grid">
            {faithJourneySteps.map((card, idx) => {
              const StepIcon = card.icon;
              const PracticeIcon = card.practiceIcon;
              return (
                <div
                  key={idx}
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

                    <div className="rl-journey-card-body">
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
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4: TIMELINE COMPACT 4 BƯỚC NHỊP SỐNG CHÚA NHẬT
      ══════════════════════════════════════════════════════════════ */}
      <section className="rl-timeline-section">
        <div className="rl-shell">
          <div className="rl-section-header">
            <div className="rl-eyebrow">
              <span className="rl-dot" />
              <span>THỜI GIAN BIỂU CHÚA NHẬT (CA 2)</span>
            </div>
            <h2 className="rl-section-title">
              Nhịp Sống <em>Chúa Nhật</em>
            </h2>
            <p className="rl-section-desc">
              Lịch trình sinh hoạt sáng Chúa Nhật hàng tuần dành cho toàn bộ đoàn sinh Khối Rước Lễ Giáo xứ An Ngãi.
            </p>
          </div>

          {/* Thanh ray ngang tiến trình Stepper (Desktop >= 768px) */}
          <div className="rl-stepper-track" aria-hidden="true">
            <div className="rl-stepper-line" />
            <div className="rl-stepper-nodes">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className={`rl-stepper-col ${step.highlight ? "highlight" : ""}`}>
                  <div className="rl-stepper-node">{idx + 1}</div>
                  <span className="rl-stepper-time">{step.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lưới thẻ thời gian biểu (Mobile: Trục dọc, Desktop: 4 Cards) */}
          <div className="rl-compact-timeline">
            {timelineSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className={`rl-time-chip ${step.highlight ? "highlight" : ""}`}>
                  <span className="rl-time-node" aria-hidden="true">{idx + 1}</span>
                  <div className="rl-time-card">
                    <div className="rl-time-header">
                      <span className="rl-time-badge">{step.time}</span>
                      {step.tag && (
                        <span className="rl-time-tag">{step.tag}</span>
                      )}
                    </div>
                    <div className="rl-time-content">
                      <span className="rl-time-label">{step.label}</span>
                      <span className="rl-time-sub">{step.sub}</span>
                    </div>
                  </div>
                </div>
                {idx < timelineSteps.length - 1 && (
                  <span className="rl-time-arrow" aria-hidden="true">→</span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="rl-timeline-footer-note">
            <ShieldCheck size={18} style={{ color: "var(--rl-accent-badge)", flexShrink: 0 }} aria-hidden="true" />
            <span><strong>Lưu ý nề nếp:</strong> Phụ huynh vui lòng đưa đón con đúng giờ tại sảnh Nhà Thờ và cửa phòng học để bảo đảm an toàn.</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5: HỘI THÁNH TẠI GIA & FAQ CẨM NANG PHỤ HUYNH
      ══════════════════════════════════════════════════════════════ */}
      <section id="dong-hanh" className="rl-family-section">
        <div className="rl-shell">
          <div className="rl-section-header">
            <div className="rl-eyebrow">
              <span className="rl-dot" />
              <span>GÓC PHỤ HUYNH &amp; HỘI THÁNH TẠI GIA · NGÀNH ẤU</span>
            </div>
            <h2 className="rl-section-title">
              Đồng Hành Cùng Con <em>Đón Chúa Vào Lòng</em>
            </h2>
            <p className="rl-section-desc">
              Ngày Xưng Tội và Rước Lễ Lần Đầu là kỷ niệm thiêng liêng theo con suốt cuộc đời. Bằng tình yêu thương và sự kiên nhẫn, cha mẹ hãy gieo vào lòng con niềm vui hạnh phúc được làm bạn với Chúa Giêsu Thánh Thể.
            </p>
          </div>

          {/* Bento Family Hub (2 Cột: 3 Cột Trụ bên trái + Sanctuary Box bên phải) */}
          <div className="rl-family-bento-grid">
            {/* Cột trái: 3 Trụ cột hành động */}
            <div className="rl-pillars-stack">
              {familyPillars.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={idx}
                    className={`rl-pillar-card pillar-${item.key || (idx === 0 ? "green" : idx === 1 ? "purple" : "amber")}`}
                  >
                    <div className="rl-pillar-top">
                      <div className="rl-pillar-header-left">
                        <div className="rl-pillar-icon-wrap">
                          <IconComp size={22} />
                        </div>
                        <h4 className="rl-pillar-title">{item.title}</h4>
                      </div>
                      <span className="rl-pillar-badge">{item.badge}</span>
                    </div>
                    <p className="rl-pillar-desc">{item.desc}</p>
                    <div className="rl-pillar-action-tip">
                      <strong>Gợi ý cha mẹ:</strong> {item.tip}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cột phải: Sanctuary Box (Mái Ấm & Checklist) */}
            <div className="rl-sanctuary-box">
              <div>
                <div className="rl-sanctuary-eyebrow">
                  <Sparkles size={14} aria-hidden="true" />
                  <span>{sanctuaryData.eyebrow}</span>
                </div>

                <div className="rl-sanctuary-quote-card">
                  <div className="rl-sanctuary-quote-header">
                    <Quote size={18} className="rl-sanctuary-quote-icon" aria-hidden="true" />
                    <span className="rl-sanctuary-quote-author">{sanctuaryData.author}</span>
                  </div>
                  <blockquote className="rl-sanctuary-quote-text">
                    {sanctuaryData.quote}
                  </blockquote>
                </div>

                <div className="rl-checklist-section-title">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>{sanctuaryData.checklistTitle}</span>
                </div>

                <ul className="rl-checklist-list">
                  {sanctuaryData.checklist.map((chk, cIdx) => (
                    <li key={cIdx} className="rl-checklist-item">
                      <span className="rl-check-icon">✓</span>
                      <span><strong>{chk.label}:</strong> {chk.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rl-support-note-box">
                <div className="rl-support-note-text">
                  <strong>{sanctuaryData.supportTitle}</strong><br />
                  {sanctuaryData.supportDesc}
                </div>
                <Link to={sanctuaryData.supportBtnLink} className="rl-support-note-btn">
                  <span>{sanctuaryData.supportBtnText}</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          {/* FAQ Accordion Phụ Huynh */}
          <div className="rl-faq-wrapper">
            <div className="rl-faq-header">
              <h3 className="rl-faq-title">
                Giải Đáp Thắc Mắc Khối Rước Lễ (FAQ)
              </h3>
              <p className="rl-faq-desc">
                Các thông tin cần thiết về điều kiện ghi danh, học tập và nghi thức ngày Rước Lễ Lần Đầu.
              </p>
            </div>

            <div className="rl-faq-list">
              {faqs.map((item, idx) => {
                const isOpen = openFaq === idx;
                const faqAnsId = `rl-faq-ans-${idx}`;
                const padIdx = String(idx + 1).padStart(2, "0");
                return (
                  <div key={idx} className={`rl-faq-item ${isOpen ? "active" : ""}`}>
                    <button
                      type="button"
                      className="rl-faq-btn"
                      aria-expanded={isOpen}
                      aria-controls={faqAnsId}
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                    >
                      <div className="rl-faq-question-wrap">
                        <span className="rl-faq-q-badge">{padIdx}</span>
                        <span>{item.q}</span>
                      </div>
                      <ChevronDown
                        size={18}
                        aria-hidden="true"
                        className="rl-faq-chevron"
                      />
                    </button>
                    {isOpen && (
                      <div id={faqAnsId} className="rl-faq-answer">
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
          <div className="rl-cta-banner">
            <div className="rl-cta-glow" aria-hidden="true" />

            <div className="rl-cta-badge">
              <span className="rl-cta-badge-icon" aria-hidden="true">🌿</span>
              <span>NIÊN KHÓA {academicYear} · GIÁO XỨ AN NGÃI</span>
            </div>

            <h3 className="rl-cta-title">
              Trao Cho Con Dấu Ấn Đức Tin Đẹp Nhất Tuổi Thơ
            </h3>

            <p className="rl-cta-desc">
              Đón Chúa Giêsu vào lòng là hồng ân trọng đại chỉ có một lần trong đời thơ ấu. Xứ đoàn An Ngãi hân hoan chào đón và cùng gia đình chuẩn bị cho các em một tâm hồn thật thánh thiện.
            </p>

            <div className="rl-cta-actions">
              {/* Nút chính chiếm vị trí nổi bật nhất */}
              <Link to="/tuyển-sinh#dang-ky" className="rl-cta-primary-btn">
                <Sparkles size={18} aria-hidden="true" className="rl-cta-sparkle" />
                <span>Đăng Ký Ghi Danh Cho Con</span>
                <ArrowRight size={18} aria-hidden="true" className="rl-cta-arrow" />
              </Link>

              {/* 2 nút phụ hỗ trợ thanh lịch, đối xứng */}
              <div className="rl-cta-secondary-group">
                <Link to="/lịch-học" className="rl-cta-secondary-btn">
                  <CalendarDays size={15} aria-hidden="true" />
                  <span>Lịch Học Chúa Nhật</span>
                </Link>
                <Link to="/liên-hệ" className="rl-cta-secondary-btn">
                  <Church size={15} aria-hidden="true" />
                  <span>Tư Vấn &amp; Hỗ Trợ</span>
                </Link>
              </div>
            </div>

            <div className="rl-cta-note">
              <span>✦ Ghi danh trực tuyến thuận tiện · Ban Giáo lý sẽ liên hệ xác nhận và hướng dẫn chuẩn bị.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}