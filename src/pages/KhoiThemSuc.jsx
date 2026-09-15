import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Flame, Clock,
  Sparkles, ChevronDown, HelpCircle,
  ShieldCheck, ArrowRight,
  Church, MapPin, CalendarDays, BookOpen, Heart,
  Wind, Compass, Droplets, CheckCircle2, Quote,
  Calendar, Users
} from "lucide-react";
import { getKhoiThemSucData } from "../utils/academicYear.js";
import "./KhoiThemSuc.css";

// Helper định dạng danh xưng Giáo Lý Viên
const formatTeacherName = (t) => {
  if (t.startsWith("C.")) return `Chị ${t.slice(2)}`;
  if (t.startsWith("A.")) return `Anh ${t.slice(2)}`;
  if (t.startsWith("Sr.")) return `Sr. ${t.slice(3)}`;
  return t;
};

// Helper vị trí phòng học
const getRoomLocation = (room) => {
  if (room.includes("P9") || room.includes("P10") || room.includes("P11")) return `${room} · Tầng 2`;
  if (room.includes("P6")) return `${room} · Lầu 1`;
  if (room.includes("P5")) return `${room} · Tầng Trệt`;
  if (room.toLowerCase().includes("hội trường")) return "Hội Trường Trung Tâm";
  return room;
};

export default function KhoiThemSuc() {
  // Lấy dữ liệu tự động tính toán niên khóa và năm sinh theo thời gian thực
  const data = getKhoiThemSucData();
  const {
    academicYear,
    themSuc1BirthYear,
    themSuc2BirthYear,
    classes
  } = data;

  const [openFaq, setOpenFaq] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("all");

  useEffect(() => {
    const prevTitle = document.title;
    document.title = `Khối Thêm Sức (TS 1 & 2) · Ngành Kim Hoan HTDC · Niên Khóa ${academicYear} | Giáo xứ An Ngãi`;
    return () => {
      document.title = prevTitle;
    };
  }, [academicYear]);

  // Phân nhóm lớp học
  const ts1Classes = classes.filter((c) => c.group === "Thêm Sức 1");
  const ts2Classes = classes.filter((c) => c.group === "Thêm Sức 2");



  // 6 Chặng sư phạm đức tin trực quan Ngành Kim Hoan (Cân bằng độ dài chuẩn xác)
  const faithJourneySteps = [
    {
      step: "01",
      icon: Wind,
      practiceIcon: Flame,
      accentColor: "#dc2626",
      accentBg: "rgba(220, 38, 38, 0.1)",
      accentBorder: "rgba(220, 38, 38, 0.25)",
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
      accentColor: "#d97706",
      accentBg: "rgba(217, 119, 6, 0.1)",
      accentBorder: "rgba(217, 119, 6, 0.25)",
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
      accentColor: "#9333ea",
      accentBg: "rgba(147, 51, 234, 0.1)",
      accentBorder: "rgba(147, 51, 234, 0.25)",
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
      accentColor: "#b45309",
      accentBg: "rgba(180, 83, 9, 0.1)",
      accentBorder: "rgba(180, 83, 9, 0.25)",
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
      accentColor: "#0284c7",
      accentBg: "rgba(2, 132, 199, 0.1)",
      accentBorder: "rgba(2, 132, 199, 0.25)",
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
      accentColor: "#ca8a04",
      accentBg: "rgba(202, 138, 4, 0.12)",
      accentBorder: "rgba(202, 138, 4, 0.35)",
      title: "Sống Tinh Thần Kim Hoan",
      sub: "Kim Tâm Quảng Đại – Hoan Dũng Hy Sinh",
      badge: "Chứng Nhân Giữa Đời",
      practiceLabel: "Châm ngôn hành động",
      meaning: "Khăn vàng Ngành Kim Hoan nhắc nhở ngọn lửa nhiệt huyết. Các em hăng say tham gia sinh hoạt Xứ đoàn, phụng sự bàn thờ và tích cực làm việc bác ái.",
      highlight: "Sống châm ngôn Hùng Tâm Dũng Chí: Vui vẻ, dũng cảm, nhiệt thành phụng sự bàn thờ Chúa và hăng say việc bác ái."
    }
  ];

  // 4 Mốc thời gian gọn gàng của Ca 2 Chúa Nhật (Đồng bộ 100% KhoiRuocLe)
  const timelineSteps = [
    {
      time: "07:45",
      label: "Tập trung tại Tiền Sảnh",
      sub: "GLV đón tiếp & kiểm diện đoàn sinh khăn vàng",
      highlight: false,
      tag: null
    },
    {
      time: "08:00 – 09:00",
      label: "Thánh Lễ Thiếu Nhi Toàn Đoàn",
      sub: "Đoàn sinh Ngành Kim Hoan · Tham gia đoàn rước lễ vật & hiệp thông Thánh Thể",
      highlight: true,
      tag: "Tâm Điểm Phụng Vụ"
    },
    {
      time: "09:15 – 10:00",
      label: "Học Giáo Lý & Tông Đồ",
      sub: "Tìm hiểu 7 Ơn Chúa Thánh Thần & thực hành nhân bản đời sống (P9 – P13)",
      highlight: true,
      tag: "Huấn Giáo Đức Tin"
    },
    {
      time: "10:00",
      label: "Đúc kết & Ra về",
      sub: "Gặp gỡ GLV trao đổi nề nếp và đón em tại cửa phòng học",
      highlight: false,
      tag: null
    }
  ];

  // 3 Trụ cột Hội Thánh Tại Gia (Bento Family Hub)
  const familyPillars = [
    {
      key: "red",
      title: "Cầu Nguyện Xin Ơn Thánh Thần",
      badge: "Mỗi Tối",
      desc: "Cùng con cầu xin 7 ơn Chúa Thánh Thần soi sáng trí lòng, giúp con biết phân định điều đúng sai và can đảm chọn sự thật trước các cám dỗ học đường.",
      tip: "Dành 3 phút trước giờ ngủ đọc Kinh Cầu Xin Chúa Thánh Thần hoặc Lời kinh tự phát ngắn gọn cùng con.",
      icon: Wind
    },
    {
      key: "purple",
      title: "Lắng Nghe & Thấu Cảm Tuổi Mới Lớn",
      badge: "Tâm Lý Tuổi 11",
      desc: "Tuổi 11 các em bắt đầu hình thành cái tôi và dễ xao lãng. Cha mẹ hãy là người bạn lớn kiên nhẫn lắng nghe, uốn nắn bằng tình thương thay vì chỉ dùng mệnh lệnh.",
      tip: "Trò chuyện về trường lớp, tôn trọng suy nghĩ của con và hướng con tìm đến Chúa mỗi khi gặp áp lực.",
      icon: Heart
    },
    {
      key: "gold",
      title: "Đồng Hành Cùng Người Đỡ Đầu",
      badge: "Gương Sống Đức Tin",
      desc: "Cùng gia đình Người Đỡ Đầu gắn kết, nhắc nhở con noi gương đời sống đạo hạnh và tham dự trọn vẹn tuần tĩnh tâm sa mạc trước đại lễ Thêm Sức.",
      tip: "Mời Người Đỡ Đầu cùng dự lễ và động viên tinh thần con trong suốt năm học Thêm Sức 2.",
      icon: ShieldCheck
    }
  ];

  // Khối Sanctuary Box (Lời Huấn Quyền & Checklist Chuẩn Bị Đại Lễ)
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

  // Cẩm nang FAQ tinh gọn cho Phụ huynh Khối Thêm Sức
  const faqs = [
    {
      q: `Điều kiện để các em được theo học Khối Thêm Sức niên khóa ${academicYear} là gì?`,
      a: `Dành cho các em 10 – 11 tuổi: Lớp Thêm Sức 1 (10 tuổi · Sinh năm ${themSuc1BirthYear}) và Lớp Thêm Sức 2 (11 tuổi · Sinh năm ${themSuc2BirthYear}), đã lãnh nhận Bí tích Rửa Tội, đã Rước Lễ Lần Đầu và có tinh thần chuyên cần tham dự Thánh Lễ Chúa Nhật.`
    },
    {
      q: "Lớp Thêm Sức 1 và Lớp Thêm Sức 2 khác nhau như thế nào trong chương trình đào tạo?",
      a: `Khối Thêm Sức gồm 2 năm đào tạo bài bản: Năm thứ nhất (Thêm Sức 1) tập trung khám phá Ngôi Ba Thiên Chúa, ý nghĩa 7 Ơn Chúa Thánh Thần và rèn luyện căn tính người chiến sĩ Kitô hữu. Năm thứ hai (Thêm Sức 2) đi sâu vào các Bí tích Khai Tâm, tĩnh tâm sa mạc, chọn Người Đỡ Đầu và chuẩn bị trực tiếp để lãnh nhận Bí tích Thêm Sức.`
    },
    {
      q: "Tiêu chuẩn chọn Người Đỡ Đầu (Sponsor) cho em lãnh nhận Bí tích Thêm Sức quy định ra sao?",
      a: "Theo Giáo luật và quy định của Giáo phận: Người Đỡ Đầu phải là người Công giáo đã lãnh nhận trọn vẹn 3 Bí tích Khai Tâm (Rửa Tội, Thánh Thể, Thêm Sức), từ 16 tuổi trở lên, có đời sống đức tin gương mẫu, không mắc ngăn trở theo Giáo luật và sẵn sàng đồng hành, nâng đỡ đời sống đạo của em."
    },
    {
      q: "Trang phục của các em trong Ngày Đại Lễ Thêm Sức quy định như thế nào?",
      a: "Theo truyền thống trang nghiêm của Giáo xứ An Ngãi: Các em mặc lễ phục thụng trắng (albs) có viền quàng cổ màu Vàng đặc trưng của Ngành Kim Hoan Hùng Tâm Dũng Chí. Bé gái kẹp tóc gọn gàng, bé trai mang giày sẫm màu lịch sự, tác phong trang nghiêm, sốt sắng."
    },
    {
      q: "Phụ huynh và Người Đỡ Đầu có cần tham gia tĩnh tâm và xưng tội trước Ngày Lễ không?",
      a: "Có. Ban Giáo lý và Quý Cha luôn tổ chức buổi tĩnh tâm và giải tội đặc biệt dành riêng cho phụ huynh và người đỡ đầu trước ngày đại lễ. Sự hiệp thông sốt sắng của gia đình là điểm tựa thiêng liêng vững chắc nhất cho ngày con trưởng thành trong đức tin."
    }
  ];

  return (
    <div className="ts-page">
      {/* ══════════════════════════════════════════════════════════════
          HERO SECTION: 2 CỘT VISUAL-FIRST VỚI ẢNH THẬT AN NGÃI
      ══════════════════════════════════════════════════════════════ */}
      <section className="ts-hero">
        <div className="ts-shell">
          <div className="ts-hero-grid">
            {/* Cột trái: Nhãn, Tiêu đề lớn, Mô tả & Nút CTA hành động nổi bật */}
            <div className="ts-hero-left">
              <div className="ts-hero-pill-badge">
                <span className="ts-hero-pill-icon" aria-hidden="true">🕊️</span>
                <span>Ngành Kim Hoan HTDC · Khối Thêm Sức</span>
              </div>

              <h1 className="ts-hero-title">
                Nhận Lãnh Ngọn Lửa<br />
                <em>Chúa Thánh Thần</em>
              </h1>

              <p className="ts-hero-desc">
                Bí tích Thêm Sức là dấu ấn trưởng thành trong đức tin — khi Chúa Thánh Thần đổ đầy 7 ơn thiêng liêng để các em trở thành những chứng nhân can đảm và nhiệt thành của Tin Mừng.
              </p>

              <div className="ts-hero-actions">
                <a href="#danh-sach-lop" className="ts-btn-primary">
                  <span>Xem 6 Lớp Học</span>
                  <ArrowRight size={18} aria-hidden="true" className="ts-btn-icon" />
                </a>
                <Link to="/tuyển-sinh#dang-ky" className="ts-btn-secondary">
                  <Sparkles size={17} aria-hidden="true" className="ts-btn-icon" />
                  <span>Đăng Ký Khóa Mới</span>
                </Link>
              </div>
            </div>

            {/* Cột phải: Khung ảnh Khối Thêm Sức Giáo xứ An Ngãi */}
            <div className="ts-hero-right">
              <div className="ts-hero-image-card">
                <img
                  src="/images/khoithemsuc-anngai.jpg"
                  alt="101 em nhận lãnh Bí tích Thêm Sức Giáo xứ An Ngãi"
                  className="ts-hero-img"
                  loading="eager"
                  fetchPriority="high"
                />
                <div className="ts-floating-badge">
                  <div className="ts-floating-badge-icon">
                    <Flame size={20} />
                  </div>
                  <div>
                    <div className="ts-floating-badge-title">
                      101 Em Nhận Lãnh Bí Tích Thêm Sức
                    </div>
                    <div className="ts-floating-badge-sub">
                      Xứ đoàn Mẹ Mân Côi · Giáo xứ An Ngãi
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dải tổng quan 4 chỉ số (Overview Bar) tối ưu hiển thị trên Desktop & Mobile */}
          <div className="ts-overview-bar">
            <div className="ts-overview-chip">
              <span className="ts-chip-cat">Độ tuổi</span>
              <span className="ts-chip-value">10 – 11 Tuổi</span>
              <span className="ts-chip-label">Sinh năm {themSuc2BirthYear}–{themSuc1BirthYear}</span>
            </div>
            <div className="ts-overview-chip">
              <span className="ts-chip-cat">Quy mô</span>
              <span className="ts-chip-value">6 Lớp Học</span>
              <span className="ts-chip-label">Khối TS 1 &amp; TS 2 (173 em)</span>
            </div>
            <div className="ts-overview-chip">
              <span className="ts-chip-cat">Lịch học</span>
              <span className="ts-chip-value">Chúa Nhật</span>
              <span className="ts-chip-label">Lễ 08:00 · Học 09:15</span>
            </div>
            <div className="ts-overview-chip">
              <span className="ts-chip-cat">Nhân sự</span>
              <span className="ts-chip-value">14 GLV</span>
              <span className="ts-chip-label">Quý Soeur &amp; Huynh Trưởng</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2: DANH SÁCH 6 LỚP HỌC THỰC TẾ
      ══════════════════════════════════════════════════════════════ */}
      <section id="danh-sach-lop" className="ts-roster-section">
        <div className="ts-shell">
          <div className="ts-section-header">
            <div className="ts-eyebrow">
              <span className="ts-dot" />
              <span>DANH SÁCH LỚP THỰC TẾ NIÊN KHÓA {academicYear}</span>
            </div>
            <h2 className="ts-section-title">
              Các Lớp Khối Thêm Sức <em>Giáo xứ An Ngãi</em>
            </h2>
            <p className="ts-section-desc">
              Phòng học, quý Soeur và Huynh trưởng phụ trách 6 lớp học thuộc Ngành Kim Hoan.
            </p>
          </div>

          {/* Bộ lọc phân tầng khối học */}
          <div className="ts-stage-filter-bar">
            <button
              type="button"
              className={`ts-filter-pill ${selectedGroup === "all" ? "active" : ""}`}
              onClick={() => setSelectedGroup("all")}
            >
              Tất Cả<span className="hidden sm:inline"> 6 Lớp</span>
            </button>
            <button
              type="button"
              className={`ts-filter-pill ${selectedGroup === "ts1" ? "active" : ""}`}
              onClick={() => setSelectedGroup("ts1")}
            >
              <span className="hidden sm:inline">Khối </span>Thêm Sức 1<span className="hidden sm:inline"> (10 Tuổi · 3 Lớp)</span>
            </button>
            <button
              type="button"
              className={`ts-filter-pill ${selectedGroup === "ts2" ? "active" : ""}`}
              onClick={() => setSelectedGroup("ts2")}
            >
              <span className="hidden sm:inline">Khối </span>Thêm Sức 2<span className="hidden sm:inline"> (11 Tuổi · Năm Bí Tích)</span>
            </button>
          </div>

          {/* NHÓM 1: THÊM SỨC 1 (10 TUỔI) */}
          {(selectedGroup === "all" || selectedGroup === "ts1") && (
            <div className="ts-group-block">
              <div className="ts-stage-header">
                <div className="ts-stage-title-wrap">
                  <span className="ts-stage-num">01</span>
                  <div>
                    <h3 className="ts-stage-title">Khối Thêm Sức 1</h3>
                    <p className="ts-stage-subtitle">
                      Năm thứ nhất · Nền tảng căn tính &amp; Ơn Thần Khí
                    </p>
                  </div>
                </div>
                <div className="ts-stage-pills">
                  <span className="ts-stage-pill">10 Tuổi</span>
                  <span className="ts-stage-pill">Sinh năm {themSuc1BirthYear}</span>
                  <span className="ts-stage-pill">3 Lớp (P9, P10, P11)</span>
                </div>
              </div>

              <div className="ts-class-grid">
                {ts1Classes.map((item) => (
                  <div key={item.id} className="ts-class-card card-ts1">
                    {/* TẦNG 1: Head - Badge mã lớp & Vị trí phòng */}
                    <div className="ts-bento-card-head">
                      <span className="ts-bento-class-code">
                        {item.name.replace("Lớp Thêm Sức ", "TS ")}
                      </span>
                      <span className="ts-bento-room-badge">
                        <MapPin size={13} aria-hidden="true" />
                        <span>{getRoomLocation(item.room)}</span>
                      </span>
                    </div>

                    {/* TẦNG 2: Tiêu đề lớp & Dải chỉ số Sĩ số / Độ tuổi */}
                    <div>
                      <h4 className="ts-bento-class-title">{item.name}</h4>
                      <div className="ts-bento-stats-strip">
                        {item.studentsCount && (
                          <span className="ts-bento-stat-chip">
                            <Users size={13} aria-hidden="true" />
                            <span>Sĩ số: <strong>{item.studentsCount} em</strong></span>
                          </span>
                        )}
                        <span className="ts-bento-stat-chip">
                          <Calendar size={13} aria-hidden="true" />
                          <span>Độ tuổi: <strong>{item.ageText} ({item.birthYear})</strong></span>
                        </span>
                      </div>
                    </div>

                    {/* TẦNG 3: Đội ngũ GLV Phụ trách */}
                    <div className="ts-bento-teacher-box">
                      <div className="ts-bento-teacher-label">
                        <ShieldCheck size={13} aria-hidden="true" />
                        <span>GLV Phụ trách ({item.teachers.length})</span>
                      </div>
                      <div className="ts-bento-teacher-pills">
                        {item.teachers.map((t, idx) => (
                          <span key={idx} className="ts-bento-teacher-pill">
                            {formatTeacherName(t)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* TẦNG 4: Trọng tâm huấn giáo bí tích */}
                    <div className="ts-bento-focus-box">
                      <div className="ts-bento-focus-badge">{item.levelBadge}</div>
                      <p className="ts-bento-focus-desc">{item.focus}</p>
                    </div>

                    {/* TẦNG 5: Footer - Giờ học & Trạng thái nề nếp */}
                    <div className="ts-bento-card-foot">
                      <span className="ts-bento-time">
                        <Clock size={13} aria-hidden="true" />
                        <span>{item.time} (Ca 2)</span>
                      </span>
                      <span className="ts-bento-status">
                        ● {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NHÓM 2: THÊM SỨC 2 (11 TUỔI) */}
          {(selectedGroup === "all" || selectedGroup === "ts2") && (
            <div className="ts-group-block" style={{ marginBottom: "16px" }}>
              <div className="ts-stage-header ts-stage-highlight">
                <div className="ts-stage-title-wrap">
                  <span className="ts-stage-num">02</span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <h3 className="ts-stage-title">Khối Thêm Sức 2</h3>
                      <span className="ts-stage-special-badge">⭐ Năm Lãnh Nhận Bí Tích</span>
                    </div>
                    <p className="ts-stage-subtitle">
                      Năm thứ hai · Tĩnh tâm sa mạc, chọn Người Đỡ Đầu &amp; Lãnh Bí tích Thêm Sức
                    </p>
                  </div>
                </div>
                <div className="ts-stage-pills">
                  <span className="ts-stage-pill">11 Tuổi</span>
                  <span className="ts-stage-pill">Sinh năm {themSuc2BirthYear}</span>
                  <span className="ts-stage-pill">3 Lớp (P5, P6, Hội trường)</span>
                </div>
              </div>

              <div className="ts-class-grid">
                {ts2Classes.map((item) => (
                  <div key={item.id} className="ts-class-card card-ts2">
                    {/* TẦNG 1: Head - Badge mã lớp & Vị trí phòng */}
                    <div className="ts-bento-card-head">
                      <span className="ts-bento-class-code">
                        {item.name.replace("Lớp Thêm Sức ", "TS ")}
                      </span>
                      <span className="ts-bento-room-badge">
                        <MapPin size={13} aria-hidden="true" />
                        <span>{getRoomLocation(item.room)}</span>
                      </span>
                    </div>

                    {/* TẦNG 2: Tiêu đề lớp & Dải chỉ số Sĩ số / Độ tuổi */}
                    <div>
                      <h4 className="ts-bento-class-title">{item.name}</h4>
                      <div className="ts-bento-stats-strip">
                        {item.studentsCount && (
                          <span className="ts-bento-stat-chip">
                            <Users size={13} aria-hidden="true" />
                            <span>Sĩ số: <strong>{item.studentsCount} em</strong></span>
                          </span>
                        )}
                        <span className="ts-bento-stat-chip">
                          <Calendar size={13} aria-hidden="true" />
                          <span>Độ tuổi: <strong>{item.ageText} ({item.birthYear})</strong></span>
                        </span>
                      </div>
                    </div>

                    {/* TẦNG 3: Đội ngũ GLV Phụ trách */}
                    <div className="ts-bento-teacher-box">
                      <div className="ts-bento-teacher-label">
                        <ShieldCheck size={13} aria-hidden="true" />
                        <span>GLV Phụ trách ({item.teachers.length})</span>
                      </div>
                      <div className="ts-bento-teacher-pills">
                        {item.teachers.map((t, idx) => (
                          <span key={idx} className="ts-bento-teacher-pill">
                            {formatTeacherName(t)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* TẦNG 4: Trọng tâm huấn giáo bí tích */}
                    <div className="ts-bento-focus-box">
                      <div className="ts-bento-focus-badge">{item.levelBadge}</div>
                      <p className="ts-bento-focus-desc">{item.focus}</p>
                    </div>

                    {/* TẦNG 5: Footer - Giờ học & Trạng thái nề nếp */}
                    <div className="ts-bento-card-foot">
                      <span className="ts-bento-time">
                        <Clock size={13} aria-hidden="true" />
                        <span>{item.time} (Ca 2)</span>
                      </span>
                      <span className="ts-bento-status">
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
      <section className="ts-journey-section">
        <div className="ts-shell">
          <div className="ts-section-header">
            <div className="ts-eyebrow">
              <span className="ts-dot" />
              <span>SƯ PHẠM ĐỨC TIN NGÀNH KIM HOAN</span>
            </div>
            <h2 className="ts-section-title">
              Hành Trình Khám Phá &amp; <em>Lãnh Nhận Thần Khí</em>
            </h2>
            <p className="ts-section-desc">
              Chương trình đào tạo 6 chặng chuyển hóa từ nhận thức căn bản đến đón nhận 7 ơn thiêng và dấn thân sống ba sứ mạng Kitô hữu.
            </p>
          </div>

          <div className="ts-journey-grid">
            {faithJourneySteps.map((card, idx) => {
              const StepIcon = card.icon;
              const PracticeIcon = card.practiceIcon;
              return (
                <div
                  key={idx}
                  className={`ts-journey-card stage-step-${card.step}`}
                >
                  <div>
                    <div className="ts-journey-card-top">
                      <div className="ts-journey-left-header">
                        <div className="ts-journey-icon-wrap">
                          <StepIcon size={22} aria-hidden="true" />
                        </div>
                        <div>
                          <span className="ts-journey-step-badge">CHẶNG {card.step}</span>
                        </div>
                      </div>
                      <span className="ts-journey-category-pill">{card.badge}</span>
                    </div>

                    <div className="ts-journey-card-body">
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
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4: TIMELINE COMPACT 4 BƯỚC NHỊP SỐNG CHÚA NHẬT
      ══════════════════════════════════════════════════════════════ */}
      <section className="ts-timeline-section">
        <div className="ts-shell">
          <div className="ts-section-header">
            <div className="ts-eyebrow">
              <span className="ts-dot" />
              <span>THỜI GIAN BIỂU CHÚA NHẬT (CA 2)</span>
            </div>
            <h2 className="ts-section-title">
              Nhịp Sống <em>Chúa Nhật</em>
            </h2>
            <p className="ts-section-desc">
              Lịch trình sinh hoạt sáng Chúa Nhật hàng tuần dành cho toàn bộ đoàn sinh Khối Thêm Sức Giáo xứ An Ngãi.
            </p>
          </div>

          {/* Thanh ray ngang tiến trình Stepper (Desktop >= 768px) */}
          <div className="ts-stepper-track" aria-hidden="true">
            <div className="ts-stepper-line" />
            <div className="ts-stepper-nodes">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className={`ts-stepper-col ${step.highlight ? "highlight" : ""}`}>
                  <div className="ts-stepper-node">{idx + 1}</div>
                  <span className="ts-stepper-time">{step.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lưới thẻ thời gian biểu (Mobile: Trục dọc, Desktop: 4 Cards) */}
          <div className="ts-compact-timeline">
            {timelineSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className={`ts-time-chip ${step.highlight ? "highlight" : ""}`}>
                  <span className="ts-time-node" aria-hidden="true">{idx + 1}</span>
                  <div className="ts-time-card">
                    <div className="ts-time-header">
                      <span className="ts-time-badge">{step.time}</span>
                      {step.tag && (
                        <span className="ts-time-tag">{step.tag}</span>
                      )}
                    </div>
                    <div className="ts-time-content">
                      <span className="ts-time-label">{step.label}</span>
                      <span className="ts-time-sub">{step.sub}</span>
                    </div>
                  </div>
                </div>
                {idx < timelineSteps.length - 1 && (
                  <span className="ts-time-arrow" aria-hidden="true">→</span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="ts-timeline-footer-note">
            <ShieldCheck size={18} style={{ color: "var(--ts-accent-badge)", flexShrink: 0 }} aria-hidden="true" />
            <span><strong>Lưu ý nề nếp:</strong> Phụ huynh vui lòng đưa đón con đúng giờ tại sảnh Nhà Thờ và cửa phòng học để bảo đảm an toàn.</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5: HỘI THÁNH TẠI GIA & FAQ CẨM NANG PHỤ HUYNH
      ══════════════════════════════════════════════════════════════ */}
      <section id="dong-hanh" className="ts-family-section">
        <div className="ts-shell">
          <div className="ts-section-header">
            <div className="ts-eyebrow">
              <span className="ts-dot" />
              <span>GÓC PHỤ HUYNH &amp; HỘI THÁNH TẠI GIA · NGÀNH KIM HOAN</span>
            </div>
            <h2 className="ts-section-title">
              Đồng Hành Cùng Con <em>Lãnh Nhận Thần Khí</em>
            </h2>
            <p className="ts-section-desc">
              Giai đoạn chuẩn bị lãnh nhận Bí tích Thêm Sức gắn liền với tuổi dậy thì nhiều biến chuyển. Cha mẹ và Người Đỡ Đầu chính là điểm tựa vững chắc nhất để con bước vào tuổi trưởng thành đức tin.
            </p>
          </div>

          {/* Bento Family Hub (2 Cột: 3 Cột Trụ bên trái + Sanctuary Box bên phải) */}
          <div className="ts-family-bento-grid">
            {/* Cột trái: 3 Trụ cột hành động */}
            <div className="ts-pillars-stack">
              {familyPillars.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={idx}
                    className={`ts-pillar-card pillar-${item.key || (idx === 0 ? "red" : idx === 1 ? "purple" : "gold")}`}
                  >
                    <div className="ts-pillar-top">
                      <div className="ts-pillar-header-left">
                        <div className="ts-pillar-icon-wrap">
                          <IconComp size={22} />
                        </div>
                        <h4 className="ts-pillar-title">{item.title}</h4>
                      </div>
                      <span className="ts-pillar-badge">{item.badge}</span>
                    </div>
                    <p className="ts-pillar-desc">{item.desc}</p>
                    <div className="ts-pillar-action-tip">
                      <strong>Gợi ý cha mẹ:</strong> {item.tip}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cột phải: Sanctuary Box (Mái Ấm & Checklist) */}
            <div className="ts-sanctuary-box">
              <div>
                <div className="ts-sanctuary-eyebrow">
                  <Sparkles size={14} aria-hidden="true" />
                  <span>{sanctuaryData.eyebrow}</span>
                </div>

                <div className="ts-sanctuary-quote-card">
                  <div className="ts-sanctuary-quote-header">
                    <Quote size={18} className="ts-sanctuary-quote-icon" aria-hidden="true" />
                    <span className="ts-sanctuary-quote-author">{sanctuaryData.author}</span>
                  </div>
                  <blockquote className="ts-sanctuary-quote-text">
                    {sanctuaryData.quote}
                  </blockquote>
                </div>

                <div className="ts-checklist-section-title">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>{sanctuaryData.checklistTitle}</span>
                </div>

                <ul className="ts-checklist-list">
                  {sanctuaryData.checklist.map((chk, cIdx) => (
                    <li key={cIdx} className="ts-checklist-item">
                      <span className="ts-check-icon">✓</span>
                      <span><strong>{chk.label}:</strong> {chk.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="ts-support-note-box">
                <div className="ts-support-note-text">
                  <strong>{sanctuaryData.supportTitle}</strong><br />
                  {sanctuaryData.supportDesc}
                </div>
                <Link to={sanctuaryData.supportBtnLink} className="ts-support-note-btn">
                  <span>{sanctuaryData.supportBtnText}</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          {/* FAQ Accordion Phụ Huynh */}
          <div className="ts-faq-wrapper">
            <div className="ts-faq-header">
              <h3 className="ts-faq-title">
                Giải Đáp Thắc Mắc Khối Thêm Sức (FAQ)
              </h3>
              <p className="ts-faq-desc">
                Các thông tin quan trọng về tiêu chuẩn Người Đỡ Đầu, tuổi lãnh nhận Bí tích và học tập Ca 2.
              </p>
            </div>

            <div className="ts-faq-list">
              {faqs.map((item, idx) => {
                const isOpen = openFaq === idx;
                const faqAnsId = `ts-faq-ans-${idx}`;
                const padIdx = String(idx + 1).padStart(2, "0");
                return (
                  <div key={idx} className={`ts-faq-item ${isOpen ? "active" : ""}`}>
                    <button
                      type="button"
                      className="ts-faq-btn"
                      aria-expanded={isOpen}
                      aria-controls={faqAnsId}
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                    >
                      <div className="ts-faq-question-wrap">
                        <span className="ts-faq-q-badge">{padIdx}</span>
                        <span>{item.q}</span>
                      </div>
                      <ChevronDown
                        size={18}
                        aria-hidden="true"
                        className="ts-faq-chevron"
                      />
                    </button>
                    {isOpen && (
                      <div id={faqAnsId} className="ts-faq-answer">
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
          <div className="ts-cta-banner">
            <div className="ts-cta-glow" aria-hidden="true" />

            <div className="ts-cta-badge">
              <span className="ts-cta-badge-icon" aria-hidden="true">🕊️</span>
              <span>NIÊN KHÓA {academicYear} · GIÁO XỨ AN NGÃI</span>
            </div>

            <h3 className="ts-cta-title">
              Trao Cho Con Ngọn Lửa Đức Tin Trưởng Thành
            </h3>

            <p className="ts-cta-desc">
              Bí tích Thêm Sức là dấu ấn thiêng liêng trao ban sức mạnh để con vững vàng làm chứng nhân giữa đời. Xứ đoàn An Ngãi hân hoan chào đón và cùng gia đình chuẩn bị cho các em một tâm hồn thật thánh thiện.
            </p>

            <div className="ts-cta-actions">
              {/* Nút chính 52px chiếm vị trí nổi bật nhất */}
              <Link to="/tuyển-sinh#dang-ky" className="ts-cta-primary-btn">
                <Sparkles size={18} aria-hidden="true" className="ts-cta-sparkle" />
                <span>Đăng Ký Ghi Danh Cho Con</span>
                <ArrowRight size={18} aria-hidden="true" className="ts-cta-arrow" />
              </Link>

              {/* 2 nút phụ hỗ trợ thanh lịch, đối xứng */}
              <div className="ts-cta-secondary-group">
                <Link to="/lịch-học" className="ts-cta-secondary-btn">
                  <CalendarDays size={15} aria-hidden="true" />
                  <span>Lịch Học Chúa Nhật</span>
                </Link>
                <Link to="/liên-hệ" className="ts-cta-secondary-btn">
                  <Church size={15} aria-hidden="true" />
                  <span>Tư Vấn &amp; Hỗ Trợ</span>
                </Link>
              </div>
            </div>

            <div className="ts-cta-note">
              <span>✦ Ghi danh trực tuyến thuận tiện · Ban Giáo lý sẽ liên hệ xác nhận và hướng dẫn chuẩn bị.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}