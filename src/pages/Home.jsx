import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  BookOpen,
  Sparkles,
  GraduationCap,
  ArrowRight,
  ArrowUpRight,
  Church,
  ChevronRight,
  Copy,
  Check,
  RotateCw,
  AlertCircle
} from "lucide-react";
import { useDailyLiturgy } from "../features/liturgy/useDailyLiturgy.js";
import {
  ACADEMIC_YEAR,
  TOTAL_STUDENTS,
  TOTAL_TEACHERS,
  TOTAL_CLASSES,
  CENTRAL_MASS
} from "../data/lichHocData.js";
import { getEnrollmentStatus } from "../features/enrollment/enrollmentConfig.js";
import "./Home.css";

/* ── Helper chuẩn hóa URL tĩnh tương thích Base URL (GitHub Pages / Subpath) ── */
const asset = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const cleanPath = path.replace(/^\/+/, "");
  const base = import.meta.env.BASE_URL || "/";
  return base.endsWith("/") ? `${base}${cleanPath}` : `${base}/${cleanPath}`;
};

/* ─────────────────────────────────────────────
   1. DỮ LIỆU 6 KHỐI GIÁO LÝ HÙNG TÂM DŨNG CHÍ
───────────────────────────────────────────── */
const NGANH_SECTIONS = [
  {
    id: "khai-tam",
    name: "Khối Khai Tâm (Vườn Trẻ & Khai Tâm)",
    ageText: "5 – 7 tuổi",
    motto: "Bay Cao",
    badge: "Khăn Xanh Lá Trơn",
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    accentColor: "emerald",
    img: asset("images/sectors/sector-khai-tam.svg"),
    desc: "Gieo mầm đức tin đơn sơ, trong trắng vào tâm hồn tuổi thơ qua lời kinh, khúc hát cử điệu và mẩu chuyện Kinh Thánh sinh động.",
    classesText: "5 lớp: Vườn Trẻ, Khai Tâm 1/1, 1/2, Khai Tâm 2/1, 2/2",
    path: "/khối-khai-tâm",
    khoiList: [
      { name: "Lớp Vườn Trẻ & Khai Tâm 1 – 2", detail: "5 – 7 tuổi · 5 lớp học (Ca 2)", path: "/khối-khai-tâm" }
    ]
  },
  {
    id: "ruoc-le",
    name: "Khối Rước Lễ Lần Đầu",
    ageText: "8 – 9 tuổi",
    motto: "Trong Sạch",
    badge: "Khăn Xanh Lá Có Viền",
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    accentColor: "emerald",
    img: asset("images/sectors/sector-ruoc-le.svg"),
    desc: "Chuẩn bị tâm hồn thánh thiện đón rước Mình Thánh Chúa Kitô Bánh Hằng Sống và lãnh nhận Bí tích Hòa Giải lần đầu tiên.",
    classesText: "5 lớp: RLLĐ 1/1, 1/2, RLLĐ 2/1, 2/2, 2/3",
    path: "/khối-rước-lễ",
    khoiList: [
      { name: "Khối Rước Lễ Lần Đầu (RLLĐ 1 & 2)", detail: "8 – 9 tuổi · 5 lớp học (Ca 2)", path: "/khối-rước-lễ" }
    ]
  },
  {
    id: "them-suc",
    name: "Khối Thêm Sức",
    ageText: "10 – 11 tuổi",
    motto: "Quảng Đại",
    badge: "Khăn Vàng Có Viền",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    accentColor: "amber",
    img: asset("images/sectors/sector-them-suc.svg"),
    desc: "Dẫn dắt các em lãnh nhận Bảy Ơn Chúa Thánh Thần qua Bí tích Thêm Sức để trở thành chứng nhân đức tin kiên cường, hăng say phục vụ.",
    classesText: "6 lớp: Thêm Sức 1/1, 1/2, 1/3, Thêm Sức 2/1, 2/2, 2/3",
    path: "/khối-thêm-sức",
    khoiList: [
      { name: "Khối Thêm Sức 1 & 2", detail: "10 – 11 tuổi · 6 lớp học (Ca 2)", path: "/khối-thêm-sức" }
    ]
  },
  {
    id: "phung-vu",
    name: "Khối Phụng Vụ",
    ageText: "12 tuổi",
    motto: "Tiến",
    badge: "Khăn Da Cam Có Viền",
    badgeColor: "bg-orange-100 text-orange-950 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800",
    accentColor: "orange",
    img: asset("images/sectors/sector-phung-vu.svg"),
    desc: "Khám phá chiều sâu các cử hành Phụng vụ, tập sự giúp lễ, thánh ca và sống tinh thần nhiệt tâm phụng sự Bàn Thờ Chúa.",
    classesText: "3 lớp: Phụng Vụ 1/1, 1/2, 1/3",
    path: "/khối-phụng-vụ",
    khoiList: [
      { name: "Khối Phụng Vụ (Lớp 7)", detail: "12 tuổi · 3 lớp học (Ca 1)", path: "/khối-phụng-vụ" }
    ]
  },
  {
    id: "kinh-thanh",
    name: "Khối Kinh Thánh",
    ageText: "13 – 14 tuổi",
    motto: "Thắng",
    badge: "Khăn Đỏ Có Viền",
    badgeColor: "bg-red-100 text-red-950 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800",
    accentColor: "red",
    img: asset("images/sectors/sector-kinh-thanh.svg"),
    desc: "Đào sâu 73 cuốn Sách Thánh Cựu Ước & Tân Ước, suy niệm Lectio Divina và xây dựng nền tảng đức tin vững vàng trên Lời Chúa.",
    classesText: "6 lớp: Kinh Thánh 1/1, 1/2, 1/3, Kinh Thánh 2/1, 2/2, 2/3",
    path: "/khối-kinh-thánh",
    khoiList: [
      { name: "Khối Kinh Thánh 1 & 2 (Lớp 8 & 9)", detail: "13 – 14 tuổi · 6 lớp học (Ca 1)", path: "/khối-kinh-thánh" }
    ]
  },
  {
    id: "vao-doi",
    name: "Khối Vào Đời",
    ageText: "15 – 16 tuổi",
    motto: "Thắng",
    badge: "Khăn Đỏ Có Viền",
    badgeColor: "bg-red-100 text-red-950 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800",
    accentColor: "red",
    img: asset("images/sectors/sector-vao-doi.svg"),
    desc: "Trang bị hành trang Docat & Youcat, định hướng tương lai, tôi luyện bản lĩnh Huynh Trưởng và dấn thân làm chứng nhân Tin Mừng giữa đời.",
    classesText: "5 lớp: Vào Đời 1/1, 1/2, 1/3, Vào Đời 2/1, 2/2",
    path: "/khối-vào-đời",
    khoiList: [
      { name: "Khối Vào Đời 1 & 2 (Lớp 10 & 11)", detail: "15 – 16 tuổi · 5 lớp học (Ca 1)", path: "/khối-vào-đời" }
    ]
  }
];

/* ─────────────────────────────────────────────
   2. HÌNH ẢNH KỶ NIỆM XỨ ĐOÀN
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
  const shouldReduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const copyTimerRef = useRef(null);

  const {
    loading: liturgyLoading,
    featured: dailyGospel,
    displayTitle: liturgyTitle,
    isFallback,
    error: liturgyError,
    refetch: refetchLiturgy
  } = useDailyLiturgy();

  const enrollmentStatus = getEnrollmentStatus();
  const enrollmentMeta = {
    open: {
      badge: "Đang mở",
      cta: "Đăng ký",
      bannerBtnText: `Đăng ký tuyển sinh ${ACADEMIC_YEAR}`
    },
    upcoming: {
      badge: "Sắp mở",
      cta: "Xem thông tin",
      bannerBtnText: `Thông tin tuyển sinh ${ACADEMIC_YEAR}`
    },
    closed: {
      badge: "Đã đóng",
      cta: "Xem thông tin",
      bannerBtnText: `Thông báo tuyển sinh ${ACADEMIC_YEAR}`
    }
  }[enrollmentStatus] || {
    badge: "Tuyển sinh",
    cta: "Chi tiết",
    bannerBtnText: `Tuyển sinh ${ACADEMIC_YEAR}`
  };

  const centralMassStartTime = CENTRAL_MASS?.time ? CENTRAL_MASS.time.split(" ")[0] : "08:00";

  const QUICK_ACTIONS = [
    {
      title: `Lịch Học ${TOTAL_CLASSES} Lớp`,
      badge: ACADEMIC_YEAR,
      desc: `Tra cứu thời gian biểu Ca 1 & Ca 2, danh sách ${TOTAL_TEACHERS} GLV và phòng học.`,
      path: "/lịch-học",
      icon: CalendarDays,
      cta: "Tra cứu"
    },
    {
      title: "Thánh Lễ Chúa Nhật",
      badge: `Lễ ${centralMassStartTime}`,
      desc: `Thánh lễ toàn xứ đoàn ${centralMassStartTime} Chúa Nhật và các thánh lễ phụng vụ tuần.`,
      path: "/giới-thiệu#gio-le-section",
      icon: Church,
      cta: "Xem giờ lễ"
    },
    {
      title: "Tài Liệu & Đề Thi",
      badge: "Kho ôn tập",
      desc: "Ngân hàng đề thi trực quan, trắc nghiệm chuẩn hóa 6 khối giáo lý.",
      path: "/tài-liệu",
      icon: BookOpen,
      cta: "Vào kho"
    },
    {
      title: "Ghi Danh Tuyển Sinh",
      badge: enrollmentMeta.badge,
      desc: "Tiếp nhận Giáo lý sinh mới khối Khai Tâm, Vườn Trẻ và chuyển xứ.",
      path: "/tuyển-sinh",
      icon: Sparkles,
      cta: enrollmentMeta.cta
    }
  ];

  /* ── Motion Variants tuân thủ AGENTS.md (Trang nghiêm, điềm đạm, 100% disabled on reduced motion) ── */
  const variants = shouldReduceMotion
    ? {
        heroContainer: { hidden: { opacity: 1 }, visible: { opacity: 1 } },
        heroItem: { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } },
        sectionReveal: { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } },
        gridContainer: { hidden: { opacity: 1 }, visible: { opacity: 1 } },
        cardItem: { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } },
        stateCrossfade: {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 },
          transition: { duration: 0 }
        }
      }
    : {
        heroContainer: {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.06,
              delayChildren: 0.04
            }
          }
        },
        heroItem: {
          hidden: { opacity: 0, y: 14 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.42, ease: [0.25, 1, 0.5, 1] }
          }
        },
        sectionReveal: {
          hidden: { opacity: 0, y: 16 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] }
          }
        },
        gridContainer: {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
              delayChildren: 0.02
            }
          }
        },
        cardItem: {
          hidden: { opacity: 0, y: 12 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] }
          }
        },
        stateCrossfade: {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.2, ease: "easeInOut" }
        }
      };

  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Trang Chủ | Xứ Đoàn Hùng Tâm Dũng Chí Mẹ Mân Côi - Giáo Xứ An Ngãi";

    return () => {
      document.title = prevTitle;
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const handleCopyQuote = async () => {
    if (!dailyGospel?.quote) return;
    const textToCopy = `« ${dailyGospel.quote} » (${dailyGospel.ref || ""})\n- ${liturgyTitle}`;
    
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setCopyError(false);
      } else {
        throw new Error("Clipboard API unavailable");
      }
    } catch (err) {
      console.warn("Sao chép Lời Chúa không thành công:", err);
      setCopyError(true);
      setCopied(false);
    }

    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => {
      setCopied(false);
      setCopyError(false);
    }, 2500);
  };

  const scrollToCurriculum = () => {
    const target = document.getElementById("hanh-trinh-giao-ly");
    if (target) {
      const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      const heading = document.getElementById("home-curriculum-heading");
      if (heading) {
        heading.focus({ preventScroll: true });
      }
    }
  };

  return (
    <div className="home-page">
      {/* ════ 1. HERO SECTION ════ */}
      <section className="home-hero" aria-labelledby="home-hero-heading">
        <Motion.div
          className="home-shell"
          initial="hidden"
          animate="visible"
          variants={variants.heroContainer}
        >
          {/* Eyebrow trang trọng */}
          <Motion.div className="home-eyebrow" variants={variants.heroItem}>
            <span className="home-dot" aria-hidden="true" />
            <span>GIÁO XỨ AN NGÃI · XỨ ĐOÀN MẸ MÂN CÔI</span>
          </Motion.div>

          {/* Heading lớn Editorial */}
          <Motion.h1 id="home-hero-heading" className="home-hero-title" variants={variants.heroItem}>
            Ươm Mầm Đức Tin <br />
            <em>& Dấn Thân Phục Vụ</em>
          </Motion.h1>

          {/* Lời Chúa chủ đề */}
          <Motion.div className="home-hero-verse" variants={variants.heroItem}>
            <p className="home-hero-verse-quote">
              « Thầy là ánh sáng đến thế gian, để ai tin vào Thầy, thì không còn ở lại trong bóng tối. »
            </p>
            <cite className="home-hero-verse-cite">Ga 12, 46</cite>
          </Motion.div>

          {/* Cụm nút hành động chính */}
          <Motion.div className="home-hero-actions" variants={variants.heroItem}>
            <button
              type="button"
              onClick={scrollToCurriculum}
              className="home-btn-primary"
            >
              <span>Khám phá các Lớp học</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <Link to="/lịch-học" className="home-btn-secondary">
              <CalendarDays className="w-4 h-4 text-amber-700 dark:text-amber-400" aria-hidden="true" />
              <span>Thời Gian Biểu {ACADEMIC_YEAR}</span>
              <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 dark:bg-amber-900/60 dark:text-amber-200">
                Mới
              </span>
            </Link>

            <Link
              to="/giới-thiệu"
              className="home-btn-secondary"
            >
              <span>Tìm hiểu Xứ đoàn</span>
              <ArrowUpRight className="w-4 h-4 opacity-75" aria-hidden="true" />
            </Link>
          </Motion.div>

          {/* Thanh số liệu cộng đoàn (Metrics Bar) */}
          <Motion.div
            className="home-metrics-bar"
            role="region"
            aria-label="Số liệu hoạt động xứ đoàn"
            variants={variants.heroItem}
          >
            <div className="home-metric-item">
              <span className="home-metric-value">{TOTAL_STUDENTS}</span>
              <span className="home-metric-label">Thiếu Nhi</span>
            </div>
            <div className="home-metric-item">
              <span className="home-metric-value">{TOTAL_TEACHERS}+</span>
              <span className="home-metric-label">Giáo Lý Viên</span>
            </div>
            <div className="home-metric-item">
              <span className="home-metric-value">{TOTAL_CLASSES}</span>
              <span className="home-metric-label">Lớp Học</span>
            </div>
            <div className="home-metric-item">
              <span className="home-metric-value">2 Ca</span>
              <span className="home-metric-label">Chúa Nhật</span>
            </div>
          </Motion.div>
        </Motion.div>
      </section>

      {/* ════ 2. CỤM 4 LỐI TẮT NHANH (QUICK ACTIONS HUB) ════ */}
      <section className="home-quick-hub" aria-label="Lối tắt tra cứu và hoạt động nhanh">
        <div className="home-shell">
          <Motion.div
            className="home-hub-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={variants.gridContainer}
          >
            {QUICK_ACTIONS.map((item) => {
              const Icon = item.icon;
              return (
                <Motion.div key={item.path} variants={variants.cardItem} className="h-full flex">
                  <Link
                    to={item.path}
                    className="home-hub-card group w-full"
                  >
                    <div className="home-hub-card-top">
                      <div className="home-hub-icon-wrap">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <span className="home-hub-badge">{item.badge}</span>
                    </div>
                    <div className="home-hub-card-body">
                      <h3 className="home-hub-title">{item.title}</h3>
                      <p className="home-hub-desc">{item.desc}</p>
                    </div>
                    <div className="home-hub-card-footer">
                      <span className="home-hub-link">
                        {item.cta} <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </Motion.div>
              );
            })}
          </Motion.div>
        </div>
      </section>

      {/* ════ 3. TÂM ĐIỂM LỜI CHÚA HÀNG NGÀY ════ */}
      <section className="home-gospel-section" aria-labelledby="home-gospel-title">
        <div className="home-shell">
          <Motion.div
            className="home-gospel-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={variants.sectionReveal}
          >
            <div className="home-gospel-accent-glow" aria-hidden="true" />

            <div>
              <div className="home-eyebrow mb-2">
                <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400" aria-hidden="true" />
                <span>{isFallback ? "LỜI CHÚA SUY NIỆM" : "TÂM ĐIỂM LỜI CHÚA HÔM NAY"}</span>
              </div>

              <h2 id="home-gospel-title" className="text-xl sm:text-2xl font-semibold text-[#293d32] dark:text-[#ecece0]">
                {liturgyTitle}
              </h2>

              <AnimatePresence mode="wait">
                {liturgyLoading ? (
                  <Motion.div
                    key="skeleton"
                    className="home-gospel-skeleton"
                    aria-busy="true"
                    aria-label="Đang tải Lời Chúa hôm nay"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={variants.stateCrossfade}
                  >
                    <div className="home-gospel-skeleton-line w-3/4" />
                    <div className="home-gospel-skeleton-line w-full" />
                    <div className="home-gospel-skeleton-line w-1/3" />
                  </Motion.div>
                ) : (
                  <Motion.div
                    key="content"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={variants.stateCrossfade}
                  >
                    <blockquote className="home-gospel-quote">
                      « {dailyGospel.quote} »
                    </blockquote>

                    <div className="flex items-center justify-between flex-wrap gap-2.5 mt-2">
                      {dailyGospel.ref && (
                        <cite className="home-gospel-cite">
                          {dailyGospel.ref.includes("Phúc Âm") || dailyGospel.ref.includes("Tin Mừng") || dailyGospel.ref.includes("Bài đọc") || dailyGospel.ref.includes("Tv")
                            ? dailyGospel.ref
                            : `Tin Mừng · ${dailyGospel.ref}`}
                        </cite>
                      )}

                      <div className="flex items-center gap-2">
                        {isFallback && liturgyError && (
                          <button
                            type="button"
                            onClick={refetchLiturgy}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-[#464d43] dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-[#b0b9ac] border border-stone-300 dark:border-stone-700 transition-colors cursor-pointer"
                            aria-label="Thử tải lại bài đọc Lời Chúa hôm nay"
                          >
                            <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Tải lại</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={handleCopyQuote}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-[#61461c] dark:text-[#d4b47d] border border-amber-600/20 transition-all active:scale-95 cursor-pointer"
                          title="Sao chép câu Lời Chúa này"
                          aria-label="Sao chép câu Lời Chúa này vào bộ nhớ tạm"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                              <span className="text-emerald-800 dark:text-emerald-300 font-bold" role="status" aria-live="polite">
                                Đã sao chép
                              </span>
                            </>
                          ) : copyError ? (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" aria-hidden="true" />
                              <span className="text-red-700 dark:text-red-300 font-bold" role="status" aria-live="polite">
                                Chưa thể sao chép
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 opacity-80" aria-hidden="true" />
                              <span>Sao chép câu này</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-6 md:mt-0 flex flex-col sm:flex-row md:flex-col gap-3 flex-shrink-0">
              <a
                href="https://loichuamoingay.org"
                target="_blank"
                rel="noopener noreferrer"
                className="home-btn-primary text-center"
                aria-label="Đọc Trọn Vẹn Tin Mừng trên Lời Chúa Mỗi Ngày (mở trang mới)"
              >
                <span>Đọc Trọn Vẹn Tin Mừng</span>
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>

              <Link
                to="/tài-liệu"
                className="home-btn-secondary text-center"
              >
                <span>Ôn tập Lời Chúa</span>
              </Link>
            </div>
          </Motion.div>
        </div>
      </section>

      {/* ════ 4. HÀNH TRÌNH 6 KHỐI GIÁO LÝ ĐỨC TIN ════ */}
      <section id="hanh-trinh-giao-ly" className="home-curriculum-section" aria-labelledby="home-curriculum-heading">
        <div className="home-shell">
          {/* Section Header */}
          <Motion.div
            className="home-section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={variants.sectionReveal}
          >
            <div className="home-eyebrow">
              <span className="home-dot" aria-hidden="true" />
              <span>CHƯƠNG TRÌNH ĐÀO TẠO ĐỨC TIN</span>
            </div>
            <h2 id="home-curriculum-heading" tabIndex={-1} className="home-section-title outline-none">
              Hành Trình 6 Khối <br />
              <em>Giáo Lý Đức Tin</em>
            </h2>
            <p className="home-section-desc">
              Ban Giáo lý Xứ đoàn Mẹ Mân Côi Giáo xứ An Ngãi đồng hành cùng các em qua 6 Khối học theo đường hướng Phong trào Hùng Tâm Dũng Chí,
              từng bước từ thuở ấu thơ đến khi trưởng thành vững bước vào đời.
            </p>
          </Motion.div>

          {/* Lưới 4 Ngành */}
          <Motion.div
            className="home-nganh-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={variants.gridContainer}
          >
            {NGANH_SECTIONS.map((nganh) => (
              <Motion.div key={nganh.id} variants={variants.cardItem} className="home-nganh-card">
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
                      alt={`Biểu trưng ${nganh.name}`}
                      loading="lazy"
                      width="52"
                      height="52"
                    />
                  </div>
                </div>

                <p className="home-nganh-desc">{nganh.desc}</p>

                {/* Danh sách các khối trực thuộc */}
                <div className="home-nganh-khoi-list">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#61461c] dark:text-[#d4b47d]">
                    Các khối lớp trực thuộc:
                  </span>
                  {nganh.khoiList.map((khoi) => (
                    <Link
                      key={khoi.path}
                      to={khoi.path}
                      className="home-nganh-khoi-item group"
                    >
                      <div>
                        <div className="font-semibold">{khoi.name}</div>
                        <div className="text-xs text-[#464d43] dark:text-[#b0b9ac]">
                          {khoi.detail}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#927140] dark:text-[#d4b47d] group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </Motion.div>
            ))}
          </Motion.div>

          {/* Banner phụ: Thư viện & Ngân hàng Đề thi */}
          <Motion.div
            className="mt-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={variants.sectionReveal}
          >
            <Link
              to="/tài-liệu"
              className="home-hub-card flex-row items-center gap-6 p-6 sm:p-8 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-900/15 dark:border-amber-100/15"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-900 text-amber-50 dark:bg-amber-500 dark:text-stone-950 flex items-center justify-center flex-shrink-0 shadow-md">
                <GraduationCap className="w-7 h-7" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="home-hub-badge">TƯ LIỆU ĐÀO TẠO</span>
                <h3 className="text-xl font-bold text-[#293d32] dark:text-[#ecece0] mb-1">
                  Kho Đề Thi & Tài Liệu Ôn Tập Toàn Xứ Đoàn
                </h3>
                <p className="text-sm text-[#464d43] dark:text-[#b0b9ac]">
                  Đầy đủ câu hỏi trắc nghiệm, đề kiểm tra 15 phút, 1 tiết và học kỳ cho cả 6 khối giáo lý.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 font-bold text-sm text-[#61461c] dark:text-[#d4b47d] flex-shrink-0">
                Truy cập ngay <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </div>
            </Link>
          </Motion.div>
        </div>
      </section>

      {/* ════ 5. KÝ ỨC XỨ ĐOÀN & ĐỜI SỐNG CỘNG ĐOÀN ════ */}
      <section className="home-gallery-section" aria-labelledby="home-gallery-heading">
        <div className="home-shell">
          <Motion.div
            className="home-section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={variants.sectionReveal}
          >
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
              đến nhịp trống hào hùng và Thánh lễ Chúa Nhật linh thiêng — tất cả tạo nên mái nhà chung ấm áp cho hơn {TOTAL_STUDENTS} em thiếu nhi.
            </p>
          </Motion.div>

          {/* Mosaic Grid 4 hình ảnh thực tế chất lượng cao */}
          <Motion.div
            className="home-gallery-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={variants.gridContainer}
          >
            {GALLERY_ITEMS.map((item) => (
              <Motion.div
                key={item.name}
                variants={variants.cardItem}
                className={`home-gallery-card ${item.featured ? "featured" : ""}`}
              >
                <img
                  src={asset(`images/gioi-thieu/${item.name}-1280.webp`)}
                  srcSet={`${asset(`images/gioi-thieu/${item.name}-640.webp`)} 640w, ${asset(`images/gioi-thieu/${item.name}-1280.webp`)} 1280w`}
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
                  <p className="text-xs text-stone-200 mt-1 line-clamp-2">{item.desc}</p>
                </div>
              </Motion.div>
            ))}
          </Motion.div>

          {/* Banner Kêu Gọi Đồng Hành & Tuyển Sinh */}
          <Motion.div
            className="home-cta-banner"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={variants.sectionReveal}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-200 border border-amber-300/30 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
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
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>{enrollmentMeta.bannerBtnText}</span>
              </Link>

              <Link to="/lịch-học" className="home-btn-ghost">
                <CalendarDays className="w-4 h-4" aria-hidden="true" />
                <span>Xem lịch học {TOTAL_CLASSES} lớp</span>
              </Link>

              <Link to="/giới-thiệu" className="home-btn-ghost">
                <span>Về Xứ đoàn An Ngãi</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </Motion.div>
        </div>
      </section>
    </div>
  );
}