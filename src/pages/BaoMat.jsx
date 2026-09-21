import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion as Motion, useReducedMotion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Database,
  Camera,
  UserCog,
  Mail,
  HeartHandshake,
  CheckCircle2,
  FileText,
  ArrowRight
} from "lucide-react";
import { ACADEMIC_YEAR } from "../data/lichHocData.js";
import "./BaoMat.css";

const SECURITY_PILLARS = [
  {
    id: "du-lieu",
    pillarNum: "01",
    title: "Dữ Liệu Thu Thập & Hồ Sơ Đức Tin",
    subtitle: "Các hạng mục thông tin được lưu trữ phục vụ tiến trình học Giáo lý",
    icon: Database,
    articles: [
      {
        num: "01",
        title: "Thông tin định danh & liên lạc gia đình",
        content: (
          <>
            <p>
              Khi phụ huynh ghi danh cho con em vào Xứ đoàn, hệ thống tiếp nhận các thông tin cơ bản nhằm mục đích quản lý lớp và liên lạc:
            </p>
            <ul>
              <li><strong>Họ và tên khai sinh & Tên Thánh:</strong> Định danh Giáo lý sinh theo sổ bộ Giáo hội và hành chính.</li>
              <li><strong>Ngày tháng năm sinh & Giới tính:</strong> Phân chia đúng khối lớp và độ tuổi sinh hoạt.</li>
              <li><strong>Họ tên Phụ huynh / Người giám hộ & Số điện thoại:</strong> Kênh thông báo tình hình học tập, chuyên cần và các trường hợp khẩn cấp.</li>
              <li><strong>Địa chỉ cư trú / Giáo họ trực thuộc:</strong> Phân bổ khu vực sinh hoạt trong Giáo xứ An Ngãi.</li>
            </ul>
          </>
        )
      },
      {
        num: "02",
        title: "Hồ sơ Bí tích & Tiến trình Đức tin",
        content: (
          <>
            <p>
              Nhằm bảo đảm tính liên tục của đời sống Kitô hữu, Ban Giáo Lý ghi nhận và quản lý hồ sơ các Bí tích Khai tâm của đoàn sinh:
            </p>
            <ul>
              <li><strong>Bí tích Rửa Tội:</strong> Ngày rửa tội, Giáo xứ cử hành, Cha rửa tội, Người đỡ đầu.</li>
              <li><strong>Bí tích Giao Hòa & Thánh Thể:</strong> Ngày Xưng tội & Rước lễ lần đầu.</li>
              <li><strong>Bí tích Thêm Sức & Nghi thức Bao Đồng:</strong> Ngày lãnh nhận và chứng chỉ hoàn tất chương trình.</li>
            </ul>
          </>
        )
      },
      {
        num: "03",
        title: "Sổ điểm danh & Kết quả học tập",
        content: (
          <p>
            Quá trình tham dự Thánh lễ Chúa Nhật, các buổi học giáo lý hằng tuần, điểm kiểm tra định kỳ và đánh giá hạnh kiểm cuối năm được lưu trữ trong sổ điện tử nội bộ để xét điều kiện lên lớp hoặc lãnh nhận Bí tích.
          </p>
        )
      }
    ]
  },
  {
    id: "phan-quyen",
    pillarNum: "02",
    title: "Mục Đích Sử Dụng & Phân Quyền Giáo Vụ",
    subtitle: "Nguyên tắc sử dụng đúng mục đích và giới hạn quyền truy cập",
    icon: Lock,
    articles: [
      {
        num: "04",
        title: "Mục đích sử dụng thuần túy giáo vụ",
        content: (
          <>
            <p>
              Toàn bộ dữ liệu thu thập chỉ phục vụ các mục tiêu sinh hoạt tôn giáo và giáo dục đức tin tại Giáo xứ An Ngãi:
            </p>
            <ul>
              <li>Sắp xếp danh sách lớp, phân công Giáo lý viên và Huynh trưởng phụ trách.</li>
              <li>Theo dõi mức độ chuyên cần tham dự Thánh lễ và các giờ kinh phụng vụ.</li>
              <li>Lập danh sách các em đủ điều kiện khảo hạch và lãnh nhận các Bí tích.</li>
              <li>Gửi thông báo lịch sinh hoạt, tĩnh tâm, cắm trại và lễ hội bổn mạng đến phụ huynh.</li>
            </ul>
          </>
        )
      },
      {
        num: "05",
        title: "Phân quyền truy cập theo vai trò (RBAC)",
        content: (
          <>
            <p>
              Hệ thống áp dụng cơ chế phân quyền nghiêm ngặt để đảm bảo an toàn thông tin nội bộ:
            </p>
            <ul>
              <li><strong>Giáo lý viên chủ nhiệm:</strong> Chỉ xem và chỉnh sửa danh sách, điểm số và chuyên cần của các lớp mình phụ trách.</li>
              <li><strong>Ban Quản Trị & Trưởng Khối:</strong> Tổng hợp dữ liệu toàn khối, duyệt danh sách bí tích và xử lý chuyển lớp.</li>
              <li><strong>Phụ huynh & Đoàn sinh:</strong> Chỉ tra cứu thông tin cá nhân và kết quả học tập của chính con em mình thông qua mã định danh.</li>
            </ul>
          </>
        )
      }
    ]
  },
  {
    id: "tre-em",
    pillarNum: "03",
    title: "An Toàn Trẻ Em & Quyền Riêng Tư Hình Ảnh",
    subtitle: "Cam kết bảo vệ đặc biệt đối với thiếu nhi và Giáo lý sinh",
    icon: HeartHandshake,
    articles: [
      {
        num: "06",
        title: "Nguyên tắc bảo vệ trẻ vị thành niên",
        content: (
          <>
            <p>
              Thiếu nhi là đối tượng ưu tiên bảo vệ cao nhất trong mọi chính sách vận hành của Xứ đoàn Mẹ Mân Côi:
            </p>
            <ul>
              <li>Tuyệt đối <strong>không công khai số điện thoại cá nhân, địa chỉ nhà riêng</strong> của thiếu nhi lên cổng thông tin công cộng.</li>
              <li>Không chia sẻ dữ liệu định danh của các em cho bất kỳ tổ chức thương mại hoặc cá nhân nào ngoài thẩm quyền.</li>
              <li>Mọi liên lạc từ Giáo lý viên đến Giáo lý sinh đều được khuyến khích thông qua nhóm phụ huynh hoặc có sự giám sát của gia đình.</li>
            </ul>
            <div className="sec-callout safeguarding">
              <ShieldCheck className="w-5 h-5 sec-callout-icon" aria-hidden="true" />
              <div className="sec-callout-content">
                <h4>Chính sách An toàn Trẻ em</h4>
                <p>
                  Mọi hành vi sử dụng dữ liệu hoặc hình ảnh của các em sai mục đích giáo dục đức tin đều bị nghiêm cấm và xử lý kỷ luật theo quy chế Xứ đoàn.
                </p>
              </div>
            </div>
          </>
        )
      },
      {
        num: "07",
        title: "Hình ảnh sinh hoạt & Quyền yêu cầu gỡ ảnh",
        content: (
          <>
            <p>
              Hình ảnh chụp trong các Thánh lễ, giờ học Giáo lý, hội thao hoặc cắm trại mang tính chất ghi lại kỷ niệm cộng đoàn chung:
            </p>
            <ul>
              <li>Ảnh đăng tải trên website và trang truyền thông Giáo xứ chỉ nhằm mục đích tông đồ và lưu niệm xứ đoàn.</li>
              <li>Không gắn tên đầy đủ kèm thông tin nhạy cảm vào các bức ảnh chân dung đơn lẻ.</li>
            </ul>
            <div className="sec-callout optout">
              <Camera className="w-5 h-5 sec-callout-icon" aria-hidden="true" />
              <div className="sec-callout-content">
                <h4>Quyền yêu cầu gỡ bỏ hình ảnh (Opt-out)</h4>
                <p>
                  Nếu phụ huynh không mong muốn hình ảnh rõ mặt của con em mình xuất hiện trên trang truyền thông công khai, vui lòng thông báo cho Ban Quản Trị để được hỗ trợ làm mờ hoặc gỡ bỏ trong vòng 24 giờ.
                </p>
              </div>
            </div>
          </>
        )
      }
    ]
  },
  {
    id: "quyen-loi",
    pillarNum: "04",
    title: "Quyền Của Phụ Huynh & Kênh Tiếp Nhận",
    subtitle: "Quy trình minh bạch giúp gia đình kiểm soát thông tin cá nhân",
    icon: UserCog,
    articles: [
      {
        num: "08",
        title: "Quyền tra cứu, đính chính & cập nhật thông tin",
        content: (
          <p>
            Phụ huynh có quyền yêu cầu xem lại toàn bộ hồ sơ lưu trữ của con em mình, đề nghị đính chính thông tin Tên Thánh, ngày sinh, ngày lãnh nhận Bí tích nếu có sai sót so với Sổ Rửa Tội gốc của Giáo họ/Giáo xứ.
          </p>
        )
      },
      {
        num: "09",
        title: "Quyền bảo lưu hoặc chuyển hồ sơ khi chuyển xứ",
        content: (
          <p>
            Khi gia đình chuyển nơi sinh sống hoặc đoàn sinh gia nhập xứ đoàn khác, Ban Giáo Lý sẽ cấp Giấy Chứng Nhận Học Giáo Lý kèm bảng điểm và trích lục Bí tích để hoàn tất thủ tục chuyển giao thuận lợi.
          </p>
        )
      },
      {
        num: "10",
        title: "Quy trình tiếp nhận & Giải quyết phản ánh",
        content: (
          <p>
            Mọi thắc mắc, phản ánh hoặc yêu cầu liên quan đến an toàn dữ liệu và bảo mật thông tin, phụ huynh có thể liên hệ trực tiếp với Cha Tuyên úy, Ban Quản Trị Xứ đoàn hoặc gửi thư qua kênh liên hệ chính thức.
          </p>
        )
      }
    ]
  }
];

export default function BaoMat() {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState("du-lieu");

  // Thiết lập Title chuẩn trang công khai
  useEffect(() => {
    document.title = `Chính Sách Bảo Mật & Dữ Liệu | Ban Giáo Lý An Ngãi (Niên khóa ${ACADEMIC_YEAR})`;
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

    SECURITY_PILLARS.forEach((p) => {
      const el = document.getElementById(p.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToPillar = (id) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -130; // Offset cho Sticky Header + TOC
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({
        top: y,
        behavior: shouldReduceMotion ? "instant" : "smooth"
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
        staggerChildren: shouldReduceMotion ? 0 : 0.06,
        delayChildren: shouldReduceMotion ? 0 : 0.04,
      },
    },
  };

  const heroItem = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.15 : 0.38, ease: "easeOut" },
    },
  };

  const chipsContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
        delayChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const chipItem = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.15 : 0.32, ease: "easeOut" },
    },
  };

  const sectionReveal = {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px 0px" },
    transition: { duration: shouldReduceMotion ? 0.15 : 0.4, ease: "easeOut" },
  };

  const cardReveal = {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-30px 0px" },
    transition: { duration: shouldReduceMotion ? 0.15 : 0.35, ease: "easeOut" },
  };

  return (
    <div className="sec-page antialiased">
      {/* ════ HERO SECTION ════ */}
      <Motion.header
        className="sec-hero"
        variants={heroContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="sec-shell">
          <div className="sec-hero-grid">
            <div className="sec-hero-left">
              <Motion.div variants={heroItem} className="sec-hero-eyebrow">
                <span className="sec-dot" />
                <span className="sec-eyebrow">Quy Chuẩn Bảo Mật & Quyền Riêng Tư</span>
              </Motion.div>
              <Motion.h1 variants={heroItem} className="sec-hero-title">
                Chính sách bảo mật <em>& an toàn dữ liệu</em>
              </Motion.h1>
              <Motion.p variants={heroItem} className="sec-hero-desc">
                Cam kết bảo vệ toàn vẹn thông tin cá nhân, hồ sơ đức tin và hình ảnh sinh hoạt của thiếu nhi và phụ huynh Xứ đoàn Mẹ Mân Côi — Giáo xứ An Ngãi.
              </Motion.p>
            </div>

            {/* Overview Chips 2x2: Stagger cascade nhẹ nhàng */}
            <Motion.div
              variants={chipsContainer}
              className="sec-overview-chips"
              aria-label="Tóm tắt chính sách bảo mật"
            >
              <Motion.div variants={chipItem} className="sec-overview-chip">
                <span className="sec-chip-cat">Cấu trúc</span>
                <span className="sec-chip-value">4 Trụ Cột</span>
                <span className="sec-chip-label">Phân định dữ liệu</span>
              </Motion.div>
              <Motion.div variants={chipItem} className="sec-overview-chip">
                <span className="sec-chip-cat">Quy chuẩn</span>
                <span className="sec-chip-value">10 Điều Khoản</span>
                <span className="sec-chip-label">Thực hành giáo vụ</span>
              </Motion.div>
              <Motion.div variants={chipItem} className="sec-overview-chip">
                <span className="sec-chip-cat">Trọng tâm</span>
                <span className="sec-chip-value">Thiếu Nhi</span>
                <span className="sec-chip-label">Ưu tiên bảo vệ</span>
              </Motion.div>
              <Motion.div variants={chipItem} className="sec-overview-chip">
                <span className="sec-chip-cat">Hiệu lực</span>
                <span className="sec-chip-value">{ACADEMIC_YEAR}</span>
                <span className="sec-chip-label">Toàn Xứ đoàn</span>
              </Motion.div>
            </Motion.div>
          </div>
        </div>
      </Motion.header>

      {/* ════ STICKY TABLE OF CONTENTS (TOC) ════ */}
      <nav className="sec-toc-sticky" aria-label="Mục lục chính sách bảo mật">
        <div className="sec-shell">
          <div className="sec-toc-wrapper">
            <div className="sec-toc-pills">
              {SECURITY_PILLARS.map((p) => {
                const isActive = activeTab === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => scrollToPillar(p.id)}
                    className={`sec-toc-pill ${isActive ? "active" : ""}`}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <span>{p.pillarNum}.</span>
                    <span>{p.title.split("&")[0].trim()}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* ════ MAIN CONTENT AREA ════ */}
      <main className="sec-content-shell">
        {/* BANNER CAM KẾT "3 KHÔNG" */}
        <Motion.section className="sec-pledge-banner" aria-label="Cam kết 3 không của Xứ đoàn" {...sectionReveal}>
          <div className="sec-pledge-header">
            <ShieldCheck className="w-5 h-5 text-[var(--sec-primary)] dark:text-[var(--sec-accent)] flex-shrink-0" aria-hidden="true" />
            <h2 className="sec-pledge-title">Cam kết "3 KHÔNG" về dữ liệu giáo lý</h2>
          </div>
          <p className="sec-pledge-desc">
            Ban Giáo Lý Giáo Xứ An Ngãi cam kết quản trị dữ liệu Giáo lý sinh bằng tinh thần trách nhiệm mục vụ cao nhất:
          </p>
          <div className="sec-pledge-grid">
            <Motion.div className="sec-pledge-item" {...cardReveal}>
              <div className="sec-pledge-icon-wrap">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="sec-pledge-text">
                <strong>Không thương mại hóa</strong>
                <span>Dữ liệu tuyệt đối không bị bán hay trao đổi cho mục đích tiếp thị hoặc bên thứ ba.</span>
              </div>
            </Motion.div>
            <Motion.div className="sec-pledge-item" {...cardReveal}>
              <div className="sec-pledge-icon-wrap">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="sec-pledge-text">
                <strong>Không tiết lộ tùy tiện</strong>
                <span>Thông tin cá nhân chỉ được xem bởi Giáo lý viên phụ trách trực tiếp.</span>
              </div>
            </Motion.div>
            <Motion.div className="sec-pledge-item" {...cardReveal}>
              <div className="sec-pledge-icon-wrap">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="sec-pledge-text">
                <strong>Không thu thập dư thừa</strong>
                <span>Chỉ lưu trữ các trường dữ liệu cần thiết cho việc học Giáo lý và cử hành Bí tích.</span>
              </div>
            </Motion.div>
          </div>
        </Motion.section>

        {/* 4 TRỤ CỘT BẢO MẬT */}
        {SECURITY_PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <Motion.section
              key={pillar.id}
              id={pillar.id}
              className="sec-pillar-section"
              aria-labelledby={`heading-${pillar.id}`}
              {...sectionReveal}
            >
              <div className="sec-pillar-header">
                <div className="sec-pillar-icon" aria-hidden="true">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="sec-pillar-title-group">
                  <h2 id={`heading-${pillar.id}`}>
                    {pillar.pillarNum}. {pillar.title}
                  </h2>
                  <p>{pillar.subtitle}</p>
                </div>
              </div>

              <div className="sec-articles-list">
                {pillar.articles.map((art) => (
                  <Motion.article key={art.num} className="sec-article-card" {...cardReveal}>
                    <div className="sec-article-head">
                      <span className="sec-article-badge">Điều {art.num}</span>
                      <h3 className="sec-article-title">{art.title}</h3>
                    </div>
                    <div className="sec-article-body">
                      {art.content}
                    </div>
                  </Motion.article>
                ))}
              </div>
            </Motion.section>
          );
        })}

        {/* ════ CALL TO ACTION / HỖ TRỢ ════ */}
        <Motion.section className="sec-cta-section" aria-label="Liên hệ hỗ trợ dữ liệu" {...sectionReveal}>
          <h2 className="sec-cta-title">Cần hỗ trợ hoặc đính chính thông tin?</h2>
          <p className="sec-cta-desc">
            Nếu quý phụ huynh cần tra cứu sổ bộ, cập nhật số điện thoại gia đình hoặc gửi yêu cầu bảo mật, vui lòng liên hệ Ban Quản Trị Giáo Lý.
          </p>
          <div className="sec-cta-actions">
            <Link to="/liên-hệ" className="sec-btn-primary">
              <Mail className="w-4 h-4" aria-hidden="true" />
              <span>Gửi yêu cầu qua trang Liên hệ</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link to="/quy-định" className="sec-btn-secondary">
              <FileText className="w-4 h-4" aria-hidden="true" />
              <span>Xem Quy định Xứ đoàn</span>
            </Link>
          </div>
        </Motion.section>

        {/* FOOTNOTE */}
        <footer className="sec-footnote">
          <p>
            Chính sách được Ban Quản Trị Xứ Đoàn Mẹ Mân Côi — Giáo xứ An Ngãi ban hành và có hiệu lực từ đầu Niên khóa {ACADEMIC_YEAR}.
          </p>
        </footer>
      </main>
    </div>
  );
}