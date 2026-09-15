import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users, Flame, BookOpen, HandHeart,
  Sparkles, ChevronDown, CheckCircle2,
  Compass, ArrowRight, Church,
  Quote, Calendar, Clock, MapPin, HeartHandshake,
  Smile, UserCheck
} from "lucide-react";
import "./GioiTre.css";

export default function GioiTre() {
  const [openFaq, setOpenFaq] = useState(null);

  // Quản lý document.title đồng bộ theo chuẩn AGENTS.md
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Giới Trẻ Công Giáo · Ban Mục Vụ Giới Trẻ | Giáo xứ An Ngãi";
    return () => {
      document.title = prevTitle;
    };
  }, []);

  // 4 Chiều kích sinh hoạt sứ mạng cốt lõi của Giới Trẻ An Ngãi
  const corePillars = [
    {
      id: "taize",
      icon: Flame,
      badge: "Linh Đạo Chiêm Niệm",
      title: "1. Giờ Kinh Taizé & Phụng Vụ Sâu Lắng",
      sub: "Điểm tựa bình an nội tâm",
      desc: "Tạm gác lại những âu lo học tập và công việc bề bộn để tìm về sự thinh lặng bên Thánh Giá nến sáng, ngân vang những câu kinh Taizé và kín múc sức sống từ Lời Chúa.",
      tags: [
        "Giờ kinh Taizé tối Thứ Bảy",
        "Thinh lặng trước Thánh Thể",
        "Hiệp dâng Thánh Lễ Chúa Nhật",
        "Tĩnh tâm Mùa Chay & Mùa Vọng"
      ],
      linkText: "Xem lịch sinh hoạt",
      linkHref: "#lich"
    },
    {
      id: "caritas",
      icon: HandHeart,
      badge: "Dấn Thân Xã Hội",
      title: "2. Bác Ái Caritas & Dự Án Laudato Si'",
      sub: "Đức tin biến thành hành động",
      desc: "Biến đức tin thành nghĩa cử cụ thể: trực tiếp điều hành các chuyến viếng thăm mái ấm khuyết tật, nâng đỡ người già neo đơn và thực hiện các chiến dịch xanh bảo vệ môi sinh.",
      tags: [
        "Viếng thăm mái ấm tình thương",
        "Chiến dịch Giáng Sinh & Tết ấm",
        "Sống xanh Laudato Si'",
        "Học bổng nâng bước trẻ thơ"
      ],
      linkText: "Tham gia dự án",
      linkHref: "/liên-hệ"
    },
    {
      id: "community",
      icon: Users,
      badge: "Tình Bạn Thánh Thiện",
      title: "3. Trại Hè, Diễn Nguyện & Gắn Kết Huynh Đệ",
      sub: "Môi trường bạn bè cùng đức tin",
      desc: "Một sân chơi lành mạnh, văn minh, không bia rượu hay tệ nạn: nơi bạn tìm thấy những người bạn tri kỷ qua các kỳ trại kỹ năng dã ngoại, đêm nhạc acoustic và giải thể thao giáo xứ.",
      tags: [
        "Hội trại kỹ năng hè dã ngoại",
        "Đêm hoan ca & diễn nguyện",
        "Giải thể thao giao hữu liên xứ",
        "Gặp gỡ chuyên đề cuối tuần"
      ],
      linkText: "Khám phá hoạt động",
      linkHref: "#lich"
    },
    {
      id: "vocation",
      icon: Compass,
      badge: "Định Hướng Ơn Gọi",
      title: "4. Phân Định Nghề Nghiệp & Hôn Nhân Kitô",
      sub: "Vững bước tương lai",
      desc: "Đồng hành cùng bạn trẻ trước các quyết định lớn của cuộc đời: lựa chọn ngành nghề, giữ vững lương tâm liêm chính nơi công sở và chuẩn bị hành trang bước vào đời sống gia đình Kitô giáo.",
      tags: [
        "Tư vấn phân định nghề nghiệp",
        "Thần học thân xác & tình yêu",
        "Kỹ năng quản trị cuộc sống",
        "Dự nguồn Huynh Trưởng & GLV"
      ],
      linkText: "Gặp ban cố vấn",
      linkHref: "#dong-hanh"
    }
  ];

  // Lịch sinh hoạt tối Thứ Bảy định kỳ (Tuần 2 & Tuần 4 hàng tháng)
  const scheduleSteps = [
    {
      time: "19:15",
      label: "Đón Tiếp & Khởi Động Kết Nối",
      sub: "Tiền sảnh Nhà Mục Vụ · Chào hỏi, chia sẻ và kết nối bạn mới",
      icon: Smile
    },
    {
      time: "19:30 – 20:15",
      label: "Giờ Kinh Taizé & Lắng Nghe Lời Chúa",
      sub: "Phòng sinh hoạt Giới Trẻ · Lắng đọng tâm hồn bên Thánh Giá nến sáng",
      icon: Flame,
      highlight: true
    },
    {
      time: "20:15 – 21:00",
      label: "Chuyên Đề Sống Đạo & Thảo Luận",
      sub: "Học hỏi Docat, giải quyết tình huống thực tế và triển khai dự án bác ái",
      icon: BookOpen,
      highlight: true
    },
    {
      time: "21:00",
      label: "Phép Lành & Lời Chúc Bình An",
      sub: "Dâng lời tạ ơn cuối ngày, nhận phép lành và trao nhau lời chào thân tình",
      icon: CheckCircle2
    }
  ];

  // 4 Mùa sự kiện lớn trong năm của Giới Trẻ An Ngãi
  const seasonalEvents = [
    {
      season: "MÙA CHAY",
      name: "Tĩnh Tâm & Sa Mạc Thinh Lặng",
      desc: "1 ngày trọn vẹn thinh lặng chiêm niệm, xét mình, xưng tội và chuẩn bị tâm hồn đón mừng Chúa Phục Sinh.",
      badge: "Lắng Đọng Tâm Linh"
    },
    {
      season: "MÙA HÈ",
      name: "Hội Trại Kỹ Năng & Dã Ngoại",
      desc: "3 ngày 2 đêm rèn luyện kỹ năng sinh tồn, tinh thần đồng đội, lửa trại và gắn kết tình huynh đệ.",
      badge: "Sôi Động & Rèn Luyện"
    },
    {
      season: "MÙA VỌNG",
      name: "Chiến Dịch Bác Ái Giáng Sinh",
      desc: "Gây quỹ, làm hang đá và trực tiếp mang quà trao tận tay các mảnh đời bất hạnh, người già neo đơn.",
      badge: "Sứ Mạng Caritas"
    },
    {
      season: "TẾT NGUYÊN ĐÁN",
      name: "Đêm Hoan Ca Hội Ngộ Xa Quê",
      desc: "Đêm nhạc ấm áp họp mặt toàn thể anh chị em sinh viên, người đi làm xa quê trở về sum họp bên giáo xứ mẹ.",
      badge: "Hội Ngộ Huynh Đệ"
    }
  ];

  // 2 Câu chuyện người trong cuộc (Testimonials)
  const testimonials = [
    {
      quote: "Hồi mới bước chân vào đại học ở Đà Nẵng, em rất ngợp và cô đơn giữa môi trường mới. Nhờ các buổi sinh hoạt tối Thứ Bảy khi về quê, em tìm lại được sự bình an trong giờ Taizé và quen được những người bạn cùng chung chí hướng giúp em không bị cuốn vào lối sống sa đà.",
      author: "Maria Mai Hoa",
      role: "Sinh viên năm 3 · Trường ĐH Sư Phạm Đà Nẵng",
      avatarText: "MH"
    },
    {
      quote: "Đi làm công ty cả tuần rất nhiều áp lực và căng thẳng. Tham gia vào nhóm Caritas Giới Trẻ An Ngãi, tự tay trao những phần quà đến cho các cụ già neo đơn, mình mới cảm nhận trọn vẹn niềm vui trao ban. Ở đây không có sự so đo địa vị hay thu nhập, chỉ có tình huynh đệ chân thành.",
      author: "Tôma Tuấn Hưng",
      role: "Kỹ sư Phần mềm · Đi làm 2 năm tại Đà Nẵng",
      avatarText: "TH"
    }
  ];

  // 5 Câu hỏi thường gặp (FAQ)
  const faqs = [
    {
      q: "Em đi học đại học hoặc đi làm xa ở thành phố thì có tham gia được không?",
      a: "Hoàn toàn được! Lịch sinh hoạt định kỳ diễn ra vào tối Thứ Bảy (2 tuần/lần) được sắp xếp rất thuận tiện cho các bạn về thăm nhà dịp cuối tuần. Ngoài ra, Giới Trẻ An Ngãi duy trì nhóm kết nối trực tuyến và tổ chức các chương trình trọng điểm vào dịp hè, Lễ Giáng Sinh và Tết Nguyên Đán để mọi bạn trẻ xa quê đều có thể sum họp."
    },
    {
      q: "Em có bắt buộc phải tham gia đủ 100% tất cả các buổi không?",
      a: "Không hề áp đặt! Ban Điều Hành luôn thấu hiểu và tôn trọng lịch học tập, thi cử và công việc riêng của mỗi bạn. Nhóm khuyến khích sự hiện diện đều đặn để gắn kết tình huynh đệ, nhưng bạn luôn có thể báo trước nếu có lịch bận đột xuất mà không phải e ngại."
    },
    {
      q: "Em chưa quen ai trong nhóm thì đến có bị bỡ ngỡ không?",
      a: "Đừng lo lắng! Mỗi buổi sinh hoạt luôn có các anh chị ban tiếp tân đón tiếp bạn ngay từ cổng, giới thiệu bạn với một nhóm nhỏ để làm quen và có 'người bạn đồng hành' chia sẻ, hướng dẫn bạn hòa nhập một cách tự nhiên và ấm áp nhất."
    },
    {
      q: "Tham gia Giới Trẻ có cơ hội được đào tạo để trở thành Giáo Lý Viên / Huynh Trưởng không?",
      a: "Có! Giới Trẻ chính là vườn ươm thế hệ tông đồ tương lai của Giáo xứ An Ngãi. Hằng năm, Ban Giáo Lý đều mở các lớp Dự Trưởng và Sư phạm Giáo lý dành riêng cho các bạn trẻ có ước ao dấn thân đồng hành hướng dẫn các em thiếu nhi các khối nhỏ hơn."
    },
    {
      q: "Tham gia sinh hoạt Giới Trẻ có phải đóng học phí hay kinh phí gì không?",
      a: "Hoàn toàn không có học phí! Mọi hoạt động sinh hoạt định kỳ và tài liệu đều được Giáo xứ và Ban Mục Vụ tài trợ. Đối với các chuyến dã ngoại lớn hay hội trại hè, nhóm sẽ lên kế hoạch gây quỹ bác ái và công khai minh bạch mọi khoản đóng góp tự nguyện."
    }
  ];

  return (
    <div className="gt-page">
      {/* ══════════════════════════════════════════════════════════════
          SECTION 1: HERO SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section className="gt-hero">
        <div className="gt-shell">
          <div className="gt-hero-grid">
            {/* Cột trái: Văn bản & CTA */}
            <div className="gt-hero-left">
              <div className="gt-hero-pill-badge">
                <Users size={14} className="gt-hero-pill-icon" aria-hidden="true" />
                <span>Ban Mục Vụ Giới Trẻ · Giáo Xứ An Ngãi</span>
              </div>

              <h1 className="gt-hero-title">
                Người Trẻ Kitô Hữu — <em>Dấn Thân Sống Đạo</em> Giữa Dòng Đời
              </h1>

              <p className="gt-hero-desc">
                Không gian cộng đoàn rộng mở dành cho các bạn trẻ từ 17 tuổi trở lên (học sinh THPT, sinh viên và người đi làm): Nơi cùng nhau thắp sáng ngọn lửa đức tin, nuôi dưỡng tình bạn thánh thiện và can đảm dấn thân phụng sự tha nhân.
              </p>

              <div className="gt-hero-actions">
                <a href="#su-mang" className="gt-btn-primary">
                  <span>Khám Phá Sứ Mạng &amp; Hoạt Động</span>
                  <ArrowRight size={18} aria-hidden="true" className="gt-btn-icon" />
                </a>
                <Link to="/liên-hệ" className="gt-btn-secondary">
                  <Sparkles size={17} aria-hidden="true" className="gt-btn-icon" />
                  <span>Gia Nhập Cộng Đoàn</span>
                </Link>
              </div>
            </div>

            {/* Cột phải: Khung ảnh 4:3 & Floating Badge uy tín */}
            <div className="gt-hero-right">
              <div className="gt-hero-image-card">
                <img
                  src="/images/gioi-thieu/hoi-trai-1280.webp"
                  alt="Cộng đoàn Giới Trẻ Giáo xứ An Ngãi trong ngày hội trại truyền thống"
                  className="gt-hero-img"
                  loading="eager"
                  fetchPriority="high"
                />
                <div className="gt-floating-badge">
                  <div className="gt-floating-badge-icon">
                    <Users size={20} aria-hidden="true" />
                  </div>
                  <div className="gt-floating-badge-content">
                    <div className="gt-floating-badge-title">
                      Cộng Đoàn Giới Trẻ An Ngãi
                    </div>
                    <div className="gt-floating-badge-sub">
                      Mái ấm đức tin &amp; thanh xuân sau Khối Vào Đời
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dải tổng quan 4 chỉ số (Overview Bar) Bento Chips */}
          <div className="gt-overview-bar">
            <div className="gt-overview-chip">
              <span className="gt-chip-cat">Độ tuổi</span>
              <span className="gt-chip-value">17+ Tuổi</span>
              <span className="gt-chip-label">Sinh Viên &amp; Thanh Niên</span>
            </div>
            <div className="gt-overview-chip">
              <span className="gt-chip-cat">Quy mô</span>
              <span className="gt-chip-value">80+ Bạn Trẻ</span>
              <span className="gt-chip-label">Gắn kết thường xuyên</span>
            </div>
            <div className="gt-overview-chip">
              <span className="gt-chip-cat">Lịch sinh hoạt</span>
              <span className="gt-chip-value">Tối Thứ Bảy</span>
              <span className="gt-chip-label">Tuần 2 &amp; 4 · 19:30</span>
            </div>
            <div className="gt-overview-chip">
              <span className="gt-chip-cat">Linh đạo</span>
              <span className="gt-chip-value">Christus Vivit</span>
              <span className="gt-chip-label">Đức Kitô đang sống</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2: BỐN CHIỀU KÍCH SỨ MẠNG (CORE PILLARS)
      ══════════════════════════════════════════════════════════════ */}
      <section id="su-mang" className="gt-pillars-section">
        <div className="gt-shell">
          <div className="gt-section-header">
            <div className="gt-eyebrow">
              <span className="gt-dot" />
              <span>BỐN CHIỀU KÍCH SINH HOẠT CỐT LÕI</span>
            </div>
            <h2 className="gt-section-title">
              Hành Trang Thanh Xuân <em>Giới Trẻ An Ngãi</em>
            </h2>
            <p className="gt-section-desc">
              Thay vì các tiết học giáo lý tuần tự như thiếu nhi, Giới Trẻ vận hành theo 4 chiều kích trưởng thành toàn diện: Linh đạo chiêm niệm, Bác ái thực tế, Tình bạn huynh đệ và Kỹ năng phân định tương lai.
            </p>
          </div>

          <div className="gt-pillars-grid">
            {corePillars.map((p) => {
              const PIcon = p.icon;
              return (
                <div key={p.id} className={`gt-pillar-card theme-${p.id}`}>
                  <div className="gt-pillar-main">
                    <div className="gt-pillar-card-top">
                      <div className="gt-pillar-icon-box">
                        <PIcon size={22} aria-hidden="true" />
                      </div>
                      <span className="gt-pillar-badge">{p.badge}</span>
                    </div>

                    <h3 className="gt-pillar-title">{p.title}</h3>
                    <p className="gt-pillar-desc">{p.desc}</p>

                    <div className="gt-pillar-topics-grid">
                      {p.tags.map((tag, tIdx) => (
                        <div key={tIdx} className="gt-pillar-topic-chip">
                          <CheckCircle2 size={14} className="gt-pillar-topic-icon" aria-hidden="true" />
                          <span>{tag}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="gt-pillar-card-foot">
                    <span className="gt-pillar-foot-sub">{p.sub}</span>
                    {p.linkHref.startsWith("/") ? (
                      <Link
                        to={p.linkHref}
                        className="gt-pillar-foot-btn"
                        aria-label={`${p.linkText}: Di chuyển đến trang liên hệ`}
                      >
                        <span>{p.linkText}</span>
                        <ArrowRight size={13} aria-hidden="true" className="gt-pillar-foot-icon" />
                      </Link>
                    ) : (
                      <a
                        href={p.linkHref}
                        className="gt-pillar-foot-btn"
                        aria-label={`${p.linkText}: Cuộn đến phân đoạn nội dung`}
                      >
                        <span>{p.linkText}</span>
                        <ArrowRight size={13} aria-hidden="true" className="gt-pillar-foot-icon" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3: NHỊP SỐNG SINH HOẠT & SỰ KIỆN ĐIỂM NHẤN
      ══════════════════════════════════════════════════════════════ */}
      <section id="lich" className="gt-schedule-section">
        <div className="gt-shell">
          <div className="gt-section-header">
            <div className="gt-eyebrow">
              <span className="gt-dot" />
              <span>NHỊP SỐNG SINH HOẠT ĐỊNH KỲ</span>
            </div>
            <h2 className="gt-section-title">
              Nhịp Sống Giới Trẻ &amp; <em>Sự Kiện Điểm Nhấn</em>
            </h2>
            <p className="gt-section-desc">
              Khung thời gian sinh hoạt tối Thứ Bảy được tối ưu cho cả các bạn sinh viên và thanh niên đi làm xa cuối tuần về thăm gia đình.
            </p>
          </div>

          <div className="gt-schedule-container">
            {/* Cột 1: Khung giờ tối Thứ Bảy */}
            <div className="gt-schedule-panel">
              <div className="gt-panel-head">
                <Clock size={18} className="gt-panel-head-icon" aria-hidden="true" />
                <span>Khung Giờ Sinh Hoạt Tối Thứ Bảy (Tuần 2 &amp; 4)</span>
              </div>
              <div className="gt-schedule-list">
                {scheduleSteps.map((step, idx) => {
                  const SIcon = step.icon;
                  return (
                    <div key={idx} className={`gt-schedule-item ${step.highlight ? "highlight" : ""}`}>
                      <div className="gt-schedule-time-box">
                        <span className="gt-schedule-time">{step.time}</span>
                        <div className="gt-schedule-icon-circle">
                          <SIcon size={14} aria-hidden="true" />
                        </div>
                      </div>
                      <div className="gt-schedule-detail">
                        <strong className="gt-schedule-label">{step.label}</strong>
                        <span className="gt-schedule-sub">{step.sub}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="gt-schedule-note">
                <MapPin size={15} aria-hidden="true" style={{ flexShrink: 0, color: "var(--gt-accent)" }} />
                <span><strong>Địa điểm:</strong> Phòng Sinh Hoạt Giới Trẻ · Tầng 2 Nhà Mục Vụ Giáo xứ An Ngãi.</span>
              </div>
            </div>

            {/* Cột 2: 4 Sự kiện lớn trong năm */}
            <div className="gt-schedule-panel">
              <div className="gt-panel-head">
                <Calendar size={18} className="gt-panel-head-icon" aria-hidden="true" />
                <span>4 Mùa Điểm Nhấn Trong Năm Mục Vụ</span>
              </div>
              <div className="gt-events-grid">
                {seasonalEvents.map((ev, idx) => (
                  <div key={idx} className="gt-event-card">
                    <div className="gt-event-header">
                      <span className="gt-event-season">{ev.season}</span>
                      <span className="gt-event-badge">{ev.badge}</span>
                    </div>
                    <strong className="gt-event-name">{ev.name}</strong>
                    <p className="gt-event-desc">{ev.desc}</p>
                  </div>
                ))}
              </div>
              <div className="gt-schedule-note">
                <Sparkles size={15} aria-hidden="true" style={{ flexShrink: 0, color: "var(--gt-gold)" }} />
                <span>Ban Điều Hành luôn thông báo chi tiết từng sự kiện trước 2 tuần trên nhóm kết nối.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4: GÓC ĐỒNG HÀNH & SANCTUARY BENTO HUB
      ══════════════════════════════════════════════════════════════ */}
      <section id="dong-hanh" className="gt-sanctuary-section">
        <div className="gt-shell">
          <div className="gt-section-header">
            <div className="gt-eyebrow">
              <span className="gt-dot" />
              <span>ĐIỂM TỰA TINH THẦN BẠN TRẺ</span>
            </div>
            <h2 className="gt-section-title">
              Góc Đồng Hành &amp; <em>Lắng Nghe</em>
            </h2>
            <p className="gt-section-desc">
              Tuổi thanh xuân là quà tặng vô giá nhưng cũng đối diện nhiều ngã rẽ. Ban Mục Vụ Giới Trẻ An Ngãi luôn là điểm tựa ấm áp, đồng hành cùng các bạn trên từng bước đường trưởng thành.
            </p>
          </div>

          <div className="gt-sanctuary-bento">
            {/* Hộp Trái: Lời trích Christus Vivit */}
            <div className="gt-quote-box">
              <div className="gt-quote-eyebrow">
                <Sparkles size={14} aria-hidden="true" />
                <span>LỜI NHẮN TỪ ĐỨC THÁNH CHA PHANXICÔ</span>
              </div>
              <div className="gt-quote-content">
                <Quote size={28} className="gt-quote-icon" aria-hidden="true" />
                <blockquote className="gt-quote-text">
                  “Đức Kitô đang sống! Người là niềm hy vọng của chúng ta, và là sự trẻ trung đẹp nhất của thế giới này. Tất cả những gì Người chạm vào đều trở nên trẻ trung, tràn đầy sức sống và tươi mới. Hãy can đảm bước ra khỏi sự an phận để làm cho thế giới này tươi đẹp hơn!”
                </blockquote>
              </div>
              <div className="gt-quote-footer">
                <span className="gt-quote-author">— Tông huấn Christus Vivit, Số 1 &amp; 20</span>
                <span className="gt-quote-tag">Kim chỉ nam Giới Trẻ</span>
              </div>
            </div>

            {/* Hộp Phải: 4 Thói quen & Nút liên hệ */}
            <div className="gt-mentorship-card">
              <div>
                <div className="gt-mentorship-head">
                  <UserCheck size={18} className="gt-mentorship-icon" aria-hidden="true" />
                  <h3 className="gt-mentorship-title">
                    4 Thói Quen Của Người Trẻ Trưởng Thành
                  </h3>
                </div>
                <p className="gt-mentorship-sub">
                  Rèn luyện mỗi ngày để tâm hồn luôn vững chãi trước những biến động:
                </p>
                <ul className="gt-habits-list">
                  <li className="gt-habit-item">
                    <span className="gt-habit-check" aria-hidden="true">✓</span>
                    <span><strong>10 phút thinh lặng:</strong> Đọc Lời Chúa và xét mình tạ ơn cuối ngày.</span>
                  </li>
                  <li className="gt-habit-item">
                    <span className="gt-habit-check" aria-hidden="true">✓</span>
                    <span><strong>Bí tích Hòa Giải:</strong> Xưng tội định kỳ để tái tạo năng lượng đức tin.</span>
                  </li>
                  <li className="gt-habit-item">
                    <span className="gt-habit-check" aria-hidden="true">✓</span>
                    <span><strong>Liêm chính công sở:</strong> Trung thực trong học tập và công việc.</span>
                  </li>
                  <li className="gt-habit-item">
                    <span className="gt-habit-check" aria-hidden="true">✓</span>
                    <span><strong>Sống chạnh thương:</strong> Sẵn sàng nâng đỡ người yếu thế hơn mình.</span>
                  </li>
                </ul>
              </div>

              <div className="gt-mentorship-action-box">
                <p className="gt-mentorship-action-text">
                  Cần tâm sự riêng với Cha Linh Hướng hoặc Ban Cố Vấn về định hướng nghề nghiệp, tình cảm?
                </p>
                <Link to="/liên-hệ" className="gt-mentorship-btn">
                  <span>Gặp Gỡ Riêng Cha Linh Hướng</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5: TIẾNG NÓI NGƯỜI TRONG CUỘC (TESTIMONIALS)
      ══════════════════════════════════════════════════════════════ */}
      <section className="gt-testimonials-section">
        <div className="gt-shell">
          <div className="gt-section-header">
            <div className="gt-eyebrow">
              <span className="gt-dot" />
              <span>CHIA SẺ CHÂN THẬT TỪ CÁC BẠN TRẺ</span>
            </div>
            <h2 className="gt-section-title">
              Thanh Xuân <em>Có Chúa &amp; Có Nhau</em>
            </h2>
            <p className="gt-section-desc">
              Lắng nghe cảm nhận thực tế từ những người bạn đã và đang đồng hành cùng Giới Trẻ Giáo xứ An Ngãi.
            </p>
          </div>

          <div className="gt-testimonials-grid">
            {testimonials.map((item, idx) => (
              <div key={idx} className="gt-testi-card">
                <div className="gt-testi-quote-mark" aria-hidden="true">“</div>
                <p className="gt-testi-quote">{item.quote}</p>
                <div className="gt-testi-user">
                  <div className="gt-testi-avatar" aria-hidden="true">
                    {item.avatarText}
                  </div>
                  <div className="gt-testi-meta">
                    <strong className="gt-testi-name">{item.author}</strong>
                    <span className="gt-testi-role">{item.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 6: GIẢI ĐÁP THẮC MẮC (FAQ)
      ══════════════════════════════════════════════════════════════ */}
      <section className="gt-faq-section">
        <div className="gt-shell">
          <div className="gt-faq-wrapper">
            <div className="gt-faq-header">
              <div className="gt-eyebrow" style={{ justifyContent: "center" }}>
                <span className="gt-dot" />
                <span>THẮC MẮC THƯỜNG GẶP CỦA BẠN TRẺ</span>
              </div>
              <h2 className="gt-section-title">
                Giải Đáp <em>Thắc Mắc (FAQ)</em>
              </h2>
              <p className="gt-faq-desc">
                Các câu hỏi thiết thực về lịch sinh hoạt, học tập xa quê, chi phí và cơ hội kết nối bạn bè mới.
              </p>
            </div>

            <div className="gt-faq-list">
              {faqs.map((item, idx) => {
                const isOpen = openFaq === idx;
                const faqAnsId = `gt-faq-ans-${idx}`;
                const padIdx = String(idx + 1).padStart(2, "0");
                return (
                  <div key={idx} className={`gt-faq-item ${isOpen ? "active" : ""}`}>
                    <button
                      type="button"
                      className="gt-faq-btn"
                      aria-expanded={isOpen}
                      aria-controls={faqAnsId}
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                    >
                      <div className="gt-faq-question-wrap">
                        <span className="gt-faq-q-badge">{padIdx}</span>
                        <span>{item.q}</span>
                      </div>
                      <ChevronDown
                        size={18}
                        aria-hidden="true"
                        className="gt-faq-chevron"
                      />
                    </button>
                    {isOpen && (
                      <div id={faqAnsId} className="gt-faq-answer">
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
          SECTION 7: CTA BANNER GIA NHẬP RỘNG MỞ
      ══════════════════════════════════════════════════════════════ */}
      <div className="gt-shell" id="ket-noi" style={{ paddingBottom: "64px" }}>
        <div className="gt-cta-banner">
          <div className="gt-cta-glow" aria-hidden="true" />

          <div className="gt-cta-badge">
            <span className="gt-cta-badge-icon" aria-hidden="true">✦</span>
            <span>BAN MỤC VỤ GIỚI TRẺ · GIÁO XỨ AN NGÃI</span>
          </div>

          <h3 className="gt-cta-title">
            Sẵn Sàng Thắp Sáng Ngọn Lửa Tuổi Trẻ Cùng Đức Kitô?
          </h3>

          <p className="gt-cta-desc">
            Bạn không bước vào tương lai một mình. Hãy gia nhập gia đình Giới Trẻ Công Giáo An Ngãi để cùng nhau trải qua những năm tháng thanh xuân ý nghĩa, gắn kết tình huynh đệ và tràn đầy niềm vui đức tin!
          </p>

          <div className="gt-cta-actions">
            {/* Nút chính nổi bật */}
            <Link to="/liên-hệ" className="gt-cta-primary-btn">
              <Sparkles size={18} aria-hidden="true" className="gt-cta-sparkle" />
              <span>Đăng Ký Gia Nhập Giới Trẻ</span>
              <ArrowRight size={18} aria-hidden="true" className="gt-cta-arrow" />
            </Link>

            {/* Các nút phụ hỗ trợ điều hướng tinh tế */}
            <div className="gt-cta-secondary-group">
              <Link to="/khối-vào-đời" className="gt-cta-secondary-btn">
                <Users size={15} aria-hidden="true" />
                <span>Xem lại Khối Vào Đời</span>
              </Link>
              <Link to="/liên-hệ" className="gt-cta-secondary-btn">
                <Church size={15} aria-hidden="true" />
                <span>Liên Hệ Ban Giáo Lý</span>
              </Link>
            </div>
          </div>

          <div className="gt-cta-note">
            <HeartHandshake size={14} aria-hidden="true" style={{ color: "var(--gt-gold)" }} />
            <span>✦ Luôn rộng mở chào đón mọi người trẻ từ 17 tuổi trở lên. Không thu phí sinh hoạt.</span>
          </div>
        </div>
      </div>
    </div>
  );
}