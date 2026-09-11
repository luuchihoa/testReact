import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  BookOpen,
  Sparkles,
  Flame,
  GraduationCap,
  ArrowRight,
  ArrowUpRight,
  Heart,
  Star,
  Compass,
  Church,
  Users,
  Shield,
  Sprout,
  Cross,
  ChevronRight,
  Sun
} from "lucide-react";
import { motion } from "framer-motion";
import DailyReadingCard from "../features/liturgy/DailyReadingCard.jsx";
import { getLiturgyInfo } from "../utils/liturgyCalendar.js";
import "./Home.css";

/* ─────────────────────────────────────────────
   1. DỮ LIỆU 4 NGÀNH THIẾU NHI THÁNH THỂ
───────────────────────────────────────────── */
const NGANH_SECTIONS = [
  {
    id: "au-nhi",
    name: "Ngành Ấu Nhi",
    ageText: "6 – 9 tuổi",
    motto: "Vâng Lời",
    badge: "Ươm Mầm & Bí Tích",
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    accentColor: "emerald",
    img: "/images/khoiruoclelandau.avif",
    desc: "Gieo mầm đức tin đơn sơ, trong trắng vào tâm hồn tuổi thơ; chuẩn bị tâm hồn các em lãnh nhận Bí tích Hòa Giải và đón rước Chúa Giêsu Thánh Thể lần đầu tiên.",
    khoiList: [
      { name: "Khối Chiên Con & Vườn Trẻ", detail: "6 – 7 tuổi · 3 lớp", path: "/khối-chiên-con" },
      { name: "Khối Rước Lễ Lần Đầu", detail: "8 – 9 tuổi · 4 lớp (RLLĐ 1 & 2)", path: "/khối-rước-lễ" }
    ]
  },
  {
    id: "thieu-nhi",
    name: "Ngành Thiếu Nhi",
    ageText: "10 – 11 tuổi",
    motto: "Hy Sinh",
    badge: "Ơn Chúa Thánh Thần",
    badgeColor: "bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800",
    accentColor: "sky",
    img: "/images/khoithemsuc.avif",
    desc: "Nuôi dưỡng tinh thần hy sinh và phục vụ tha nhân; dẫn dắt các em lãnh nhận Bảy Ơn Chúa Thánh Thần qua Bí tích Thêm Sức để trở thành chứng nhân can đảm.",
    khoiList: [
      { name: "Khối Thêm Sức 1 & 2", detail: "10 – 11 tuổi · 6 lớp học", path: "/khối-thêm-sức" }
    ]
  },
  {
    id: "nghia-si",
    name: "Ngành Nghĩa Sĩ",
    ageText: "12 – 14 tuổi",
    motto: "Chinh Phục",
    badge: "Lời Chúa & Phụng Vụ",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    accentColor: "amber",
    img: "/images/khoikinhthanh.avif",
    desc: "Đào sâu Lịch Sử Cứu Độ qua Kinh Thánh, gắn bó mật thiết với Bàn Thờ Chúa qua việc Giúp Lễ và tham gia tích cực vào các cử hành Phụng Vụ Thánh Thể.",
    khoiList: [
      { name: "Khối Phụng Vụ 1 & 2", detail: "12 tuổi · 6 lớp học", path: "/khối-phụng-vụ" },
      { name: "Khối Kinh Thánh 1 & 2", detail: "13 – 14 tuổi · 6 lớp học", path: "/khối-kinh-thánh" }
    ]
  },
  {
    id: "hiep-si",
    name: "Ngành Hiệp Sĩ",
    ageText: "15 – 18 tuổi",
    motto: "Dấn Thân",
    badge: "Trưởng Thành & Sứ Vụ",
    badgeColor: "bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800",
    accentColor: "orange",
    img: "/images/khoivaodoi.avif",
    desc: "Rèn luyện bản lĩnh người tông đồ trẻ, trang bị tri thức và nền tảng luân lý Kitô giáo vững vàng để sống chứng nhân giữa lòng học đường và xã hội.",
    khoiList: [
      { name: "Khối Vào Đời 1 & 2", detail: "15 – 18 tuổi · 5 lớp học", path: "/khối-vào-đời" }
    ]
  }
];

/* ─────────────────────────────────────────────
   2. CỤM 4 LỐI TẮT NHANH (QUICK ACTIONS)
───────────────────────────────────────────── */
const QUICK_ACTIONS = [
  {
    title: "Lịch Học 30 Lớp",
    badge: "Niên khóa 2026–2027",
    desc: "Tra cứu thời gian biểu Ca 1 & Ca 2, danh sách 70 GLV phụ trách và phòng học P1–P13.",
    path: "/lịch-học",
    icon: CalendarDays,
    cta: "Tra cứu lịch học"
  },
  {
    title: "Thánh Lễ Chúa Nhật",
    badge: "Tâm điểm Phụng vụ",
    desc: "Thánh lễ toàn xứ đoàn lúc 08h00 Chúa Nhật hàng tuần và các thánh lễ phụng vụ tại Giáo xứ.",
    path: "/giới-thiệu#gio-le-section",
    icon: Church,
    cta: "Xem giờ lễ"
  },
  {
    title: "Tài Liệu & Đề Thi",
    badge: "Kho tư liệu ôn tập",
    desc: "Ngân hàng đề thi trực quan, câu hỏi trắc nghiệm và tài liệu học hỏi chuẩn hóa theo từng khối.",
    path: "/tài-liệu",
    icon: BookOpen,
    cta: "Vào kho tài liệu"
  },
  {
    title: "Ghi Danh Tuyển Sinh",
    badge: "Đang mở đơn",
    desc: "Tiếp nhận học viên mới khối Khai Tâm, Vườn Trẻ và các em chuyển xứ gia nhập Xứ đoàn.",
    path: "/tuyển-sinh",
    icon: Sparkles,
    cta: "Đăng ký ngay"
  }
];

/* ─────────────────────────────────────────────
   3. HÌNH ẢNH KỶ NIỆM XỨ ĐOÀN
───────────────────────────────────────────── */
const GALLERY_ITEMS = [
  {
    name: "thanh-duong",
    tag: "GIÁO XỨ AN NGÃI",
    title: "Thánh đường An Ngãi thân thương",
    desc: "Ngôi nhà chung rực rỡ cờ hoa, trung tâm đời sống đức tin và phụng vụ của Xứ đoàn.",
    featured: true
  },
  {
    name: "nu-cuoi",
    tag: "NỤ CƯỜI TUỔI THƠ",
    title: "Niềm vui được ở bên nhau",
    desc: "Nụ cười hồn nhiên của các em thiếu nhi trong những ngày hội lớn.",
    featured: false
  },
  {
    name: "cong-doan",
    tag: "HIỆP NHẤT YÊU THƯƠNG",
    title: "Một cộng đoàn, một niềm tin",
    desc: "Khoảnh khắc gắn bó giữa các anh chị Huynh trưởng và phụ huynh.",
    featured: false
  },
  {
    name: "doi-trong",
    tag: "ĐỘI TRỐNG XỨ ĐOÀN",
    title: "Nhịp trống trước thánh đường",
    desc: "Đội trống thiếu nhi hào hùng chào đón những ngày đại lễ trọng thể.",
    featured: false
  }
];

/* ─────────────────────────────────────────────
   COMPONENT CHÍNH: HOME
───────────────────────────────────────────── */
export default function Home() {
  const [liturgyToday, setLiturgyToday] = useState(null);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Trang Chủ | Xứ Đoàn Thiếu Nhi Thánh Thể Mẹ Mân Côi - Giáo Xứ An Ngãi";

    try {
      const today = new Date();
      const info = getLiturgyInfo(today);
      setLiturgyToday(info);
    } catch (err) {
      console.warn("Could not load liturgy info:", err);
    }

    return () => {
      document.title = prevTitle;
    };
  }, []);

  const scrollToCurriculum = () => {
    const target = document.getElementById("hanh-trinh-giao-ly");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="home-page">
      {/* ════ 1. HERO SECTION ════ */}
      <section className="home-hero" aria-labelledby="home-hero-heading">
        <div className="home-shell">
          {/* Eyebrow trang trọng */}
          <div className="home-eyebrow">
            <span className="home-dot" aria-hidden="true" />
            <span>GIÁO XỨ AN NGÃI · XỨ ĐOÀN MẸ MÂN CÔI</span>
          </div>

          {/* Heading lớn Editorial */}
          <h1 id="home-hero-heading" className="home-hero-title">
            Ươm Mầm Đức Tin <br />
            <em>& Dấn Thân Phục Vụ</em>
          </h1>

          {/* Lời Chúa chủ đề */}
          <div className="home-hero-verse">
            <p className="home-hero-verse-quote">
              « Thầy là ánh sáng đến thế gian, để ai tin vào Thầy, thì không còn ở lại trong bóng tối. »
            </p>
            <cite className="home-hero-verse-cite">Ga 12, 46</cite>
          </div>

          {/* Cụm nút hành động chính */}
          <div className="home-hero-actions">
            <button
              type="button"
              onClick={scrollToCurriculum}
              className="home-btn-primary"
            >
              <span>Khám phá các Lớp học</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link to="/lịch-học" className="home-btn-secondary">
              <CalendarDays className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Thời Gian Biểu 2026–2027</span>
              <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                Mới
              </span>
            </Link>

            <Link
              to="/giới-thiệu"
              className="home-btn-secondary"
            >
              <span>Tìm hiểu Xứ đoàn</span>
              <ArrowUpRight className="w-4 h-4 opacity-70" />
            </Link>
          </div>

          {/* Thanh số liệu cộng đoàn (Metrics Bar) */}
          <div className="home-metrics-bar" role="region" aria-label="Số liệu hoạt động xứ đoàn">
            <div className="home-metric-item">
              <span className="home-metric-value">900+</span>
              <span className="home-metric-label">Thiếu Nhi Giáo Lý</span>
            </div>
            <div className="home-metric-item">
              <span className="home-metric-value">70+</span>
              <span className="home-metric-label">Giáo Lý Viên & Huynh Trưởng</span>
            </div>
            <div className="home-metric-item">
              <span className="home-metric-value">30</span>
              <span className="home-metric-label">Lớp Học Niên Khóa 2026–2027</span>
            </div>
            <div className="home-metric-item">
              <span className="home-metric-value">2 Ca</span>
              <span className="home-metric-label">Chúa Nhật (07h00 & 09h15)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════ 2. CỤM 4 LỐI TẮT NHANH (QUICK ACTIONS HUB) ════ */}
      <section className="home-quick-hub" aria-labelledby="home-hub-heading">
        <div className="home-shell">
          <div className="home-hub-grid">
            {QUICK_ACTIONS.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={index}
                  to={item.path}
                  className="home-hub-card group"
                >
                  <div className="home-hub-icon-wrap">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="home-hub-badge">{item.badge}</span>
                  <h3 className="home-hub-title">{item.title}</h3>
                  <p className="home-hub-desc">{item.desc}</p>
                  <span className="home-hub-link">
                    {item.cta} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════ 3. TÂM ĐIỂM LỜI CHÚA HÀNG NGÀY ════ */}
      <section className="home-gospel-section" aria-labelledby="home-gospel-title">
        <div className="home-shell">
          <div className="home-gospel-card">
            <div className="home-gospel-accent-glow" aria-hidden="true" />

            <div>
              <div className="home-eyebrow mb-2">
                <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>TÂM ĐIỂM LỜI CHÚA HÔM NAY</span>
              </div>

              <h2 id="home-gospel-title" className="text-2xl sm:text-3xl font-semibold text-[#293d32] dark:text-[#ecece0]">
                {liturgyToday?.displayName || "Lắng Nghe Lời Chúa & Sống Đạo Mỗi Ngày"}
              </h2>

              <blockquote className="home-gospel-quote">
                « Cứ để trẻ nhỏ đến với Thầy, đừng ngăn cấm chúng, vì Nước Trời là của những ai giống như chúng. »
              </blockquote>

              <cite className="home-gospel-cite">Phúc Âm theo Thánh Mát-thêu · Mt 19, 14</cite>
            </div>

            <div className="mt-6 md:mt-0 flex flex-col sm:flex-row md:flex-col gap-3 flex-shrink-0">
              <a
                href="https://loichuamoingay.org"
                target="_blank"
                rel="noopener noreferrer"
                className="home-btn-primary text-center"
              >
                <span>Đọc Trọn Vẹn Tin Mừng</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              <Link
                to="/tài-liệu"
                className="home-btn-secondary text-center"
              >
                <span>Ôn tập Lời Chúa</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════ 4. HÀNH TRÌNH GIÁO LÝ (4 NGÀNH & 6 KHỐI) ════ */}
      <main id="hanh-trinh-giao-ly" className="home-curriculum-section">
        <div className="home-shell">
          {/* Section Header */}
          <div className="home-section-header">
            <div className="home-eyebrow">
              <span className="home-dot" aria-hidden="true" />
              <span>CHƯƠNG TRÌNH ĐÀO TẠO ĐỨC TIN</span>
            </div>
            <h2 className="home-section-title">
              Hành Trình 4 Ngành & <br />
              <em>6 Khối Giáo Lý</em>
            </h2>
            <p className="home-section-desc">
              Xứ đoàn Mẹ Mân Côi áp dụng đường hướng giáo dục của Phong trào Thiếu Nhi Thánh Thể,
              từng bước đồng hành cùng các em từ thuở ấu thơ đến khi trưởng thành vững bước vào đời.
            </p>
          </div>

          {/* Lưới 4 Ngành */}
          <div className="home-nganh-grid">
            {NGANH_SECTIONS.map((nganh) => (
              <div key={nganh.id} className="home-nganh-card">
                <div className="home-nganh-top">
                  <div className="home-nganh-header-info">
                    <span className={`home-nganh-badge border ${nganh.badgeColor}`}>
                      {nganh.badge}
                    </span>
                    <h3 className="home-nganh-name">{nganh.name}</h3>
                    <p className="home-nganh-motto">
                      Khẩu hiệu: <strong>« {nganh.motto} »</strong> · Độ tuổi: {nganh.ageText}
                    </p>
                  </div>

                  <div className="home-nganh-avatar">
                    <img
                      src={nganh.img}
                      alt={nganh.name}
                      loading="lazy"
                      width="52"
                      height="52"
                    />
                  </div>
                </div>

                <p className="home-nganh-desc">{nganh.desc}</p>

                {/* Danh sách các khối trực thuộc */}
                <div className="home-nganh-khoi-list">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#7c5c2d] dark:text-[#d4b47d]">
                    Các khối lớp trực thuộc:
                  </span>
                  {nganh.khoiList.map((khoi, i) => (
                    <Link
                      key={i}
                      to={khoi.path}
                      className="home-nganh-khoi-item group"
                    >
                      <div>
                        <div className="font-semibold">{khoi.name}</div>
                        <div className="text-[11px] text-[#575e55] dark:text-[#b0b9ac]">
                          {khoi.detail}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#927140] dark:text-[#d4b47d] group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Banner phụ: Thư viện & Ngân hàng Đề thi */}
          <div className="mt-8">
            <Link
              to="/tài-liệu"
              className="home-hub-card flex-row items-center gap-6 p-6 sm:p-8 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-900/15 dark:border-amber-100/15"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-900 text-amber-50 dark:bg-amber-500 dark:text-stone-950 flex items-center justify-center flex-shrink-0 shadow-md">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="home-hub-badge">TƯ LIỆU ĐÀO TẠO</span>
                <h3 className="text-xl font-bold text-[#293d32] dark:text-[#ecece0] mb-1">
                  Kho Đề Thi & Tài Liệu Ôn Tập Toàn Xứ Đoàn
                </h3>
                <p className="text-sm text-[#575e55] dark:text-[#b0b9ac]">
                  Đầy đủ câu hỏi trắc nghiệm, đề kiểm tra 15 phút, 1 tiết và học kỳ cho cả 6 khối giáo lý.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 font-bold text-sm text-[#7c5c2d] dark:text-[#d4b47d] flex-shrink-0">
                Truy cập ngay <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* ════ 5. KÝ ỨC XỨ ĐOÀN & ĐỜI SỐNG CỘNG ĐOÀN ════ */}
      <section className="home-gallery-section" aria-labelledby="home-gallery-heading">
        <div className="home-shell">
          <div className="home-section-header">
            <div className="home-eyebrow">
              <span className="home-dot" aria-hidden="true" />
              <span>CỘNG ĐOÀN & KỶ NIỆM</span>
            </div>
            <h2 id="home-gallery-heading" className="home-section-title">
              Nơi Tình Yêu & Hồng Ân <br />
              <em>Hội Tụ Giữa Lòng Giáo Xứ</em>
            </h2>
            <p className="home-section-desc">
              Từ tiếng chuông ngân sớm trên tháp nhà thờ An Ngãi, những giờ học giáo lý rộn vang tiếng cười,
              đến nhịp trống hào hùng và Thánh lễ Chúa Nhật linh thiêng — tất cả tạo nên mái nhà chung ấm áp cho hơn 900 em thiếu nhi.
            </p>
          </div>

          {/* Mosaic Grid 4 hình ảnh thực tế chất lượng cao */}
          <div className="home-gallery-grid">
            {GALLERY_ITEMS.map((item, index) => (
              <div
                key={index}
                className={`home-gallery-card ${item.featured ? "featured" : ""}`}
              >
                <img
                  src={`/images/gioi-thieu/${item.name}-1280.webp`}
                  srcSet={`/images/gioi-thieu/${item.name}-640.webp 640w, /images/gioi-thieu/${item.name}-1280.webp 1280w`}
                  sizes="(max-width: 640px) 100vw, 50vw"
                  alt={item.title}
                  loading="lazy"
                  className="home-gallery-img"
                  width="1280"
                  height="853"
                />
                <div className="home-gallery-overlay">
                  <span className="home-gallery-tag">{item.tag}</span>
                  <h3 className="home-gallery-caption">{item.title}</h3>
                  <p className="text-xs text-stone-300 mt-1 line-clamp-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Banner Kêu Gọi Đồng Hành & Tuyển Sinh */}
          <div className="home-cta-banner">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-200 border border-amber-300/30 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Đồng Hành Cùng Con Trẻ</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-semibold mb-4">
              Ươm Mầm Đức Tin Trong Lòng Gia Đình & Giáo Xứ
            </h3>

            <p>
              Gia đình là chủng viện đầu tiên. Cùng với Xứ đoàn, quý phụ huynh chính là những người thầy
              đức tin tuyệt vời nhất của con trẻ. Hãy cùng chúng tôi vun đắp cho tương lai thiêng liêng của các em.
            </p>

            <div className="home-cta-buttons">
              <Link to="/tuyển-sinh" className="home-btn-gold">
                <Sparkles className="w-4 h-4" />
                <span>Đăng ký tuyển sinh 2026–2027</span>
              </Link>

              <Link to="/lịch-học" className="home-btn-ghost">
                <CalendarDays className="w-4 h-4" />
                <span>Xem lịch học 30 lớp</span>
              </Link>

              <Link to="/giới-thiệu" className="home-btn-ghost">
                <span>Về Xứ đoàn An Ngãi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Widget Lời Chúa nổi góc màn hình */}
      <DailyReadingCard />
    </div>
  );
}