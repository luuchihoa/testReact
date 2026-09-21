import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion as Motion, useReducedMotion } from "framer-motion";
import {
  Clock,
  BookOpen,
  HeartHandshake,
  Lock,
  CalendarDays,
  Mail,
  Sparkles,
  Compass
} from "lucide-react";
import { ACADEMIC_YEAR } from "../data/lichHocData.js";
import "./QuyDinh.css";

// Dữ liệu 4 Trụ Cột Quy Định Giáo Lý — Xứ Đoàn Mẹ Mân Côi Gx. An Ngãi
const RULE_PILLARS = [
  {
    id: "ne-nep",
    num: "01",
    title: "Nề Nếp & Tác Phong Sinh Hoạt",
    subtitle: "Giờ giấc, đồng phục và cung cách ứng xử trong khuôn viên Thánh đường",
    icon: Clock,
    articles: [
      {
        code: "Điều 1",
        title: "Giờ giấc & Tập họp Chúa Nhật",
        body: (
          <>
            <p>
              Đoàn sinh cần hiện diện đúng giờ tại khuôn viên Giáo xứ để ổn định hàng ngũ, điểm danh và dâng lời nguyện đầu giờ:
            </p>
            <ul>
              <li>
                <strong>Ca 1 (Khối Vào Đời, Kinh Thánh, Phụng Vụ):</strong> Có mặt lúc <strong>06h50</strong>. Giờ học từ <strong>07h00 – 07h45</strong>, sau đó di chuyển trang nghiêm vào Thánh đường dâng Lễ lúc <strong>08h00</strong>.
              </li>
              <li>
                <strong>Ca 2 (Khối Thêm Sức, Rước Lễ, Chiên Con, Vườn Trẻ):</strong> Dâng Thánh Lễ lúc <strong>08h00</strong>, sau đó vào lớp học từ <strong>09h15 – 10h00</strong>.
              </li>
              <li>
                Khi đến muộn quá 15 phút mà không có lý do chính đáng, đoàn sinh sẽ được Huynh trưởng ghi nhận để nhắc nhở và tính vào điểm chuyên cần.
              </li>
            </ul>
          </>
        )
      },
      {
        code: "Điều 2",
        title: "Đồng phục & Khăn Quàng",
        body: (
          <>
            <p>
              Đoàn sinh và Huynh trưởng mặc đồng phục chỉnh tề khi tham gia các buổi học giáo lý và Thánh Lễ Chúa Nhật:
            </p>
            <ul>
              <li>
                <strong>Áo & Quần:</strong> Áo sơ mi trắng (có gắn phù hiệu phong trào Hùng Tâm Dũng Chí trên tay áo), quần tây hoặc váy sẫm màu (dài qua gối), mang giày hoặc dép có quai hậu lịch sự.
              </li>
              <li>
                <strong>Khăn Quàng:</strong> Đeo khăn quàng đúng khối học theo quy chuẩn Phong trào Hùng Tâm Dũng Chí:
                <ul className="mt-2 space-y-1 pl-4 list-disc text-sm">
                  <li><em>Vườn Trẻ & Khai Tâm:</em> Khăn Xanh Lá Trơn (xanh chuối non không viền).</li>
                  <li><em>Khối Rước Lễ Lần Đầu:</em> Khăn Xanh Lá Có Viền.</li>
                  <li><em>Khối Thêm Sức:</em> Khăn Vàng Có Viền (Cơ Kim Hoan).</li>
                  <li><em>Khối Phụng Vụ:</em> Khăn Da Cam Có Viền (Cơ Nhiệt Quang).</li>
                  <li><em>Khối Kinh Thánh & Vào Đời:</em> Khăn Đỏ Có Viền (Cơ Chiến Chinh).</li>
                  <li><em>Huynh Trưởng / Giáo Lý Viên:</em> Khăn Hạt Dẻ (Nâu).</li>
                </ul>
                <p className="mt-2 text-xs text-stone-600 dark:text-stone-400">
                  Khăn in logo phong trào màu trắng phía sau lưng, mang dưới cổ áo và thắt nút ngay ngắn.
                </p>
              </li>
            </ul>
          </>
        )
      },
      {
        code: "Điều 3",
        title: "Giữ gìn Tác phong & Bảo quản Tài sản chung",
        body: (
          <>
            <p>
              Khuôn viên Thánh đường và các dãy phòng học là nơi linh thánh dành cho việc đào tạo đức tin:
            </p>
            <ul>
              <li>Giữ trật tự, trang nghiêm; không nô đùa, la hét trong nhà thờ và hành lang lớp học.</li>
              <li>Tự giác giữ gìn vệ sinh chung, bỏ rác đúng nơi quy định, không mang đồ ăn vặt vào lớp học.</li>
              <li>Bảo vệ bàn ghế, quạt, đèn và các thiết bị giảng dạy; tắt điện nước trước khi rời khỏi phòng học.</li>
            </ul>
          </>
        )
      }
    ]
  },
  {
    id: "hoc-tap",
    num: "02",
    title: "Học Tập, Chuyên Cần & Bí Tích",
    subtitle: "Tiêu chuẩn chuyên cần, khảo hạch giáo lý và điều kiện lãnh nhận các Bí tích",
    icon: BookOpen,
    articles: [
      {
        code: "Điều 4",
        title: "Tỷ lệ Chuyên cần & Điểm danh",
        body: (
          <>
            <p>
              Việc tham dự Thánh Lễ và học giáo lý là bổn phận cốt lõi của mỗi đoàn sinh:
            </p>
            <ul>
              <li>
                Đoàn sinh phải đạt tỷ lệ chuyên cần tối thiểu <strong>80% tổng số buổi học và Thánh Lễ</strong> trong niên khóa để đủ điều kiện xét lên lớp hoặc lãnh nhận Bí tích.
              </li>
              <li>
                <strong>Nghỉ học có phép:</strong> Phụ huynh cần thông báo cho GLV chủ nhiệm trước giờ học (qua sổ liên lạc hoặc tin nhắn). Nghỉ quá 3 buổi không phép trong một học kỳ sẽ được Ban Giáo Lý mời phụ huynh trao đổi.
              </li>
            </ul>
          </>
        )
      },
      {
        code: "Điều 5",
        title: "Quy chế Kiểm tra & Khảo hạch Giáo lý",
        body: (
          <>
            <p>
              Đánh giá học lực giáo lý gồm bài kiểm tra miệng (Kinh nguyện), bài kiểm tra 15 phút, 1 tiết và bài thi cuối học kỳ:
            </p>
            <ul>
              <li>Đoàn sinh cam kết làm bài trung thực, không tra cứu tài liệu hay sao chép đáp án trong giờ khảo hạch (kể cả bài trắc nghiệm trực tuyến trên cổng học tập).</li>
              <li>Điểm trung bình năm học từ 5.0 trở lên và đạt hạnh kiểm khá mới đủ điều kiện hoàn thành chương trình khối lớp.</li>
            </ul>
          </>
        )
      },
      {
        code: "Điều 6",
        title: "Điều kiện Lãnh nhận các Bí tích Khai Tâm",
        body: (
          <>
            <p>
              Để lãnh nhận các Bí tích trọng đại, đoàn sinh cần đáp ứng đầy đủ các tiêu chuẩn giáo luật và quy định của Giáo xứ:
            </p>
            <div className="rule-callout sacrament">
              <Sparkles className="rule-callout-icon" size={20} aria-hidden="true" />
              <div className="rule-callout-content">
                <h4>Quy định Lãnh nhận Bí tích theo Khối</h4>
                <p>
                  <strong>• Xưng Tội &amp; Rước Lễ Lần Đầu:</strong> Hoàn tất chương trình Khối Rước Lễ 2 (khoảng 8–9 tuổi), thuộc các kinh căn bản và vượt qua kỳ khảo hạch của Cha Quản xứ.
                  <br />
                  <strong>• Bí tích Thêm Sức:</strong> Hoàn tất chương trình Khối Thêm Sức 2 (khoảng 12–13 tuổi), tham dự đầy đủ tuần tĩnh tâm và có giấy chứng nhận học giáo lý liên tục.
                  <br />
                  <strong>• Nghi thức Bao Đồng / Vào Đời:</strong> Hoàn tất 3 năm Phụng Vụ &amp; Kinh Thánh, có tinh thần dấn thân phục vụ cộng đoàn.
                </p>
              </div>
            </div>
          </>
        )
      }
    ]
  },
  {
    id: "dong-hanh",
    num: "03",
    title: "Đồng Hành & Trách Nhiệm Phối Hợp",
    subtitle: "Vai trò gắn kết giữa Gia đình, Giáo lý viên và Xứ đoàn",
    icon: HeartHandshake,
    articles: [
      {
        code: "Điều 7",
        title: "Trách nhiệm Đồng hành của Phụ huynh",
        body: (
          <>
            <p>
              Gia đình là trường dạy đức tin đầu tiên và quan trọng nhất đối với thiếu nhi:
            </p>
            <ul>
              <li>Nhắc nhở, tạo điều kiện cho con em đi lễ, đi học giáo lý đúng giờ và ôn bài tại nhà.</li>
              <li>Tham dự đầy đủ các buổi họp phụ huynh đầu năm và cuối năm do Ban Giáo Lý tổ chức.</li>
              <li>Chủ động phối hợp với GLV chủ nhiệm khi con em gặp khó khăn về học tập, tâm lý hoặc nề nếp.</li>
            </ul>
          </>
        )
      },
      {
        code: "Điều 8",
        title: "Cung cách Ứng xử của Giáo lý viên & Huynh trưởng",
        body: (
          <>
            <p>
              Giáo lý viên là người thay mặt Hội Thánh hướng dẫn Lời Chúa cho thiếu nhi:
            </p>
            <ul>
              <li>Nêu gương sáng qua đời sống cầu nguyện, ngôn từ hòa nhã, trang phục chuẩn mực và lòng yêu thương các em.</li>
              <li>Chuẩn bị giáo án chu đáo trước mỗi buổi dạy; tận tâm giảng giải và lắng nghe tâm tư của Giáo lý sinh.</li>
              <li>Tuyệt đối tôn trọng nhân phẩm, bảo đảm an toàn thân thể và tinh thần cho tất cả đoàn sinh trong mọi sinh hoạt.</li>
            </ul>
          </>
        )
      },
      {
        code: "Điều 9",
        title: "Kênh Liên lạc & Giải quyết Phản ánh",
        body: (
          <>
            <p>
              Mọi thắc mắc, đóng góp ý kiến về chương trình học và sinh hoạt xin vui lòng gửi về:
            </p>
            <ul>
              <li>Gặp trực tiếp Ban Điều Hành Giáo Lý tại Văn phòng Giáo lý sau Thánh Lễ Chúa Nhật.</li>
              <li>Trao đổi trực tiếp với GLV chủ nhiệm lớp hoặc gửi thư phản hồi qua trang <strong>Liên hệ</strong> trên website.</li>
            </ul>
          </>
        )
      }
    ]
  },
  {
    id: "bao-mat",
    num: "04",
    title: "Kỹ Thuật Số, Bản Quyền & Bảo Vệ Trẻ Em",
    subtitle: "Nguyên tắc sử dụng cổng thông tin điện tử và bảo mật dữ liệu Giáo lý sinh",
    icon: Lock,
    articles: [
      {
        code: "Điều 10",
        title: "Sử dụng Cổng Thông tin & Tài khoản Học tập",
        body: (
          <>
            <p>
              Hệ thống website được xây dựng nhằm hỗ trợ việc tra cứu thời khóa biểu, tài liệu và ôn luyện giáo lý:
            </p>
            <ul>
              <li>Mỗi tài khoản được cấp cho cá nhân Giáo lý sinh / GLV; người dùng có trách nhiệm bảo mật mật khẩu của mình.</li>
              <li>Không sử dụng nền tảng cho bất kỳ mục đích nào ngoài việc học hỏi và sinh hoạt tôn giáo.</li>
            </ul>
          </>
        )
      },
      {
        code: "Điều 11",
        title: "Bảo vệ Hình ảnh & Quyền riêng tư của Thiếu nhi",
        body: (
          <>
            <p>
              Hình ảnh các buổi sinh hoạt, Thánh Lễ và dã ngoại được đăng tải nhằm mục đích truyền thông nội bộ và lưu niệm cộng đoàn:
            </p>
            <ul>
              <li>Ban Truyền thông &amp; Giáo lý cam kết chọn lọc hình ảnh trang nghiêm, tôn trọng sự an toàn và danh dự của thiếu nhi.</li>
              <li>Phụ huynh có quyền yêu cầu gỡ bỏ hình ảnh của con em mình bằng cách liên hệ với Ban Quản trị.</li>
            </ul>
          </>
        )
      },
      {
        code: "Điều 12",
        title: "Bản quyền Học liệu & Hiệu lực Quy định",
        body: (
          <>
            <p>
              Toàn bộ bài giảng, tài liệu hỏi thưa, đề thi trắc nghiệm và hình ảnh thiết kế trên website thuộc quyền sở hữu của Ban Giáo Lý Gx. An Ngãi:
            </p>
            <ul>
              <li>Không sao chép, phát tán vì mục đích thương mại khi chưa có sự đồng ý của Ban Giáo Lý.</li>
              <li>Nội quy này có hiệu lực kể từ ngày công bố và được áp dụng cho toàn thể đoàn sinh, phụ huynh và GLV trong niên khóa <strong>{ACADEMIC_YEAR}</strong>.</li>
            </ul>
          </>
        )
      }
    ]
  }
];

export default function QuyDinh() {
  const prefersReduced = useReducedMotion();
  const [activeTab, setActiveTab] = useState("ne-nep");

  useEffect(() => {
    const prevTitle = document.title;
    document.title = `Nội Quy & Quy Định Sinh Hoạt Giáo Lý ${ACADEMIC_YEAR} | Giáo xứ An Ngãi`;
    return () => {
      document.title = prevTitle;
    };
  }, []);

  // Theo dõi vị trí cuộn bằng IntersectionObserver mượt mà
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: 0,
      }
    );

    RULE_PILLARS.forEach((p) => {
      const el = document.getElementById(p.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToPillar = (pillarId) => {
    setActiveTab(pillarId);
    const element = document.getElementById(pillarId);
    if (element) {
      const yOffset = -130; // Offset cho Sticky Header (64px) + Sticky TOC (54px) + đệm
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({
        top: y,
        behavior: prefersReduced ? "instant" : "smooth"
      });
    }
  };

  // Motion variants chuẩn AGENTS.md §8:
  // Hero: Fade và dịch dọc 12–16px, 350–450ms, stagger 60ms
  const heroContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReduced ? 0 : 0.06,
        delayChildren: prefersReduced ? 0 : 0.04,
      },
    },
  };

  const heroItem = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReduced ? 0.15 : 0.38, ease: "easeOut" },
    },
  };

  const chipsContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReduced ? 0 : 0.05,
        delayChildren: prefersReduced ? 0 : 0.1,
      },
    },
  };

  const chipItem = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReduced ? 0.15 : 0.32, ease: "easeOut" },
    },
  };

  const sectionReveal = {
    initial: { opacity: 0, y: prefersReduced ? 0 : 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px 0px" },
    transition: { duration: prefersReduced ? 0.15 : 0.4, ease: "easeOut" },
  };

  const cardReveal = {
    initial: { opacity: 0, y: prefersReduced ? 0 : 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-30px 0px" },
    transition: { duration: prefersReduced ? 0.15 : 0.35, ease: "easeOut" },
  };

  return (
    <div className="rule-page antialiased">
      {/* ════ HERO SECTION ════ */}
      <Motion.header
        className="rule-hero"
        variants={heroContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="rule-shell">
          <div className="rule-hero-grid">
            <div className="rule-hero-left">
              <Motion.div variants={heroItem} className="rule-hero-eyebrow">
                <span className="rule-dot" aria-hidden="true" />
                <span className="rule-eyebrow">
                  Xứ đoàn Mẹ Mân Côi · Niên khóa {ACADEMIC_YEAR}
                </span>
              </Motion.div>

              <Motion.h1 variants={heroItem} className="rule-hero-title">
                Nội Quy &amp; Quy Định <em>Sinh Hoạt Giáo Lý</em>
              </Motion.h1>

              <Motion.p variants={heroItem} className="rule-hero-desc">
                Văn bản quy định nề nếp sinh hoạt, học tập đức tin và quy chế chuyên cần, nhằm xây dựng một cộng đoàn Hùng Tâm Dũng Chí sốt sắng, kỷ luật và tràn đầy tình bác ái Kitô giáo.
              </Motion.p>
            </div>

            {/* 4 Overview Chips 2x2: Stagger cascade nhẹ nhàng */}
            <Motion.div
              variants={chipsContainer}
              className="rule-overview-chips"
              aria-label="Tóm tắt quy định giáo lý"
            >
              <Motion.div variants={chipItem} className="rule-overview-chip">
                <span className="rule-chip-cat">Cơ Cấu</span>
                <span className="rule-chip-value">4 Trụ Cột</span>
                <span className="rule-chip-label">Toàn diện sinh hoạt</span>
              </Motion.div>
              <Motion.div variants={chipItem} className="rule-overview-chip">
                <span className="rule-chip-cat">Quy Chuẩn</span>
                <span className="rule-chip-value">12 Điều Khoản</span>
                <span className="rule-chip-label">Nội quy &amp; Tác phong</span>
              </Motion.div>
              <Motion.div variants={chipItem} className="rule-overview-chip">
                <span className="rule-chip-cat">Chuyên Cần</span>
                <span className="rule-chip-value">&ge; 80%</span>
                <span className="rule-chip-label">Điều kiện lên lớp</span>
              </Motion.div>
              <Motion.div variants={chipItem} className="rule-overview-chip">
                <span className="rule-chip-cat">Áp Dụng</span>
                <span className="rule-chip-value">{ACADEMIC_YEAR}</span>
                <span className="rule-chip-label">Toàn thể Xứ đoàn</span>
              </Motion.div>
            </Motion.div>
          </div>
        </div>
      </Motion.header>

      {/* ════ STICKY TABLE OF CONTENTS (TOC BAR) ════ */}
      <nav className="rule-toc-sticky" aria-label="Mục lục quy định">
        <div className="rule-shell">
          <div className="rule-toc-wrapper">
            <div className="rule-toc-pills">
              {RULE_PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                const isActive = activeTab === pillar.id;
                return (
                  <button
                    key={pillar.id}
                    type="button"
                    onClick={() => scrollToPillar(pillar.id)}
                    className={`rule-toc-pill ${isActive ? "active" : ""}`}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <Icon size={14} aria-hidden="true" />
                    <span>{pillar.num}. {pillar.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* ════ MAIN CONTENT ════ */}
      <main className="rule-content-shell">
        {/* Banner 4 Tâm Niệm Phong Trào */}
        <Motion.section className="rule-values-banner" aria-label="Bốn Tinh Thần Cốt Lõi" {...sectionReveal}>
          <div className="rule-values-header">
            <Compass size={18} className="rule-values-icon" aria-hidden="true" />
            <h2 className="rule-values-title">Bốn Tinh Thần Cốt Lõi Của Hùng Tâm Dũng Chí</h2>
          </div>
          <p className="rule-values-desc">
            Mọi quy định đều hướng tới việc giúp các em sống trọn vẹn 4 khẩu hiệu nền tảng của phong trào:
          </p>

          <div className="rule-values-grid">
            <Motion.div className="rule-value-item" {...cardReveal}>
              <span className="rule-value-num">I</span>
              <div className="rule-value-text">
                <strong>Cầu Nguyện</strong>
                <span>Khởi đầu mọi việc</span>
              </div>
            </Motion.div>
            <Motion.div className="rule-value-item" {...cardReveal}>
              <span className="rule-value-num">II</span>
              <div className="rule-value-text">
                <strong>Rước Lễ</strong>
                <span>Hiệp thông sốt sắng</span>
              </div>
            </Motion.div>
            <Motion.div className="rule-value-item" {...cardReveal}>
              <span className="rule-value-num">III</span>
              <div className="rule-value-text">
                <strong>Hy Sinh</strong>
                <span>Vui tươi vâng phục</span>
              </div>
            </Motion.div>
            <Motion.div className="rule-value-item" {...cardReveal}>
              <span className="rule-value-num">IV</span>
              <div className="rule-value-text">
                <strong>Tông Đồ</strong>
                <span>Làm chứng đức tin</span>
              </div>
            </Motion.div>
          </div>
        </Motion.section>

        {/* 4 Pillar Sections */}
        {RULE_PILLARS.map((pillar) => {
          const PillarIcon = pillar.icon;
          return (
            <Motion.section
              key={pillar.id}
              id={pillar.id}
              className="rule-pillar-section"
              aria-labelledby={`heading-${pillar.id}`}
              {...sectionReveal}
            >
              {/* Header của Trụ Cột */}
              <div className="rule-pillar-header">
                <div className="rule-pillar-icon" aria-hidden="true">
                  <PillarIcon size={22} />
                </div>
                <div className="rule-pillar-title-group">
                  <h2 id={`heading-${pillar.id}`}>{pillar.num}. {pillar.title}</h2>
                  <p>{pillar.subtitle}</p>
                </div>
              </div>

              {/* Danh sách các Điều Khoản */}
              <div className="rule-articles-list">
                {pillar.articles.map((art) => (
                  <Motion.article key={art.code} className="rule-article-card" {...cardReveal}>
                    <div className="rule-article-head">
                      <span className="rule-article-badge">{art.code}</span>
                      <h3 className="rule-article-title">{art.title}</h3>
                    </div>
                    <div className="rule-article-body">
                      {art.body}
                    </div>
                  </Motion.article>
                ))}
              </div>
            </Motion.section>
          );
        })}

        {/* ════ CALL TO ACTION & KÊNH LIÊN HỆ ════ */}
        <Motion.div className="rule-cta-section" {...sectionReveal}>
          <h3 className="rule-cta-title">Bạn Cần Tra Cứu Thêm Thông Tin?</h3>
          <p className="rule-cta-desc">
            Xem lịch học chi tiết 30 lớp học hoặc gửi câu hỏi trực tiếp đến Ban Quản trị và Ban Giáo Lý Giáo xứ An Ngãi.
          </p>
          <div className="rule-cta-actions">
            <Link to="/lịch-học" className="rule-btn-primary">
              <CalendarDays size={16} aria-hidden="true" />
              <span>Xem Thời Khóa Biểu</span>
            </Link>
            <Link to="/liên-hệ" className="rule-btn-secondary">
              <Mail size={16} aria-hidden="true" />
              <span>Liên Hệ Ban Giáo Lý</span>
            </Link>
          </div>
        </Motion.div>

        <p className="rule-footnote">
          Văn bản Nội quy Ban Giáo Lý &middot; Xứ đoàn Mẹ Mân Côi &middot; Giáo xứ An Ngãi
          <br />
          Cập nhật lần cuối: Tháng 09/2026 &bull; Niên khóa {ACADEMIC_YEAR}
        </p>
      </main>
    </div>
  );
}