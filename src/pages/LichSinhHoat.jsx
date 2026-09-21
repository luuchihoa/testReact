import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion as Motion, useReducedMotion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Sparkles,
  Info,
  CalendarDays,
  Mail,
  FileCheck,
  Compass
} from "lucide-react";
import {
  ACADEMIC_YEAR,
  ACTIVITY_CATEGORIES,
  WEEKLY_ROUTINE,
  ACADEMIC_EVENTS_2026_2027,
  SKILL_MODULES
} from "../data/lichSinhHoatData.js";
import "./LichSinhHoat.css";

const PERIOD_OPTIONS = [
  { id: "all", label: "Cả Niên Khóa" },
  { id: "q3_2026", label: "Quý 3/2026" },
  { id: "q4_2026", label: "Quý 4/2026" },
  { id: "q1_2027", label: "Quý 1/2027" },
  { id: "q2_2027", label: "Quý 2/2027" },
];

export default function LichSinhHoat() {
  const prefersReduced = useReducedMotion();
  const [activeTab, setActiveTab] = useState("timeline"); // "timeline" | "routine" | "skills"
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  // Cập nhật tiêu đề trang chuẩn mực
  useEffect(() => {
    const prevTitle = document.title;
    document.title = `Lịch Sinh Hoạt & Sự Kiện Giáo Lý ${ACADEMIC_YEAR} | Giáo xứ An Ngãi`;
    return () => {
      document.title = prevTitle;
    };
  }, []);

  // Lọc danh sách sự kiện dựa trên category và period
  const filteredEvents = useMemo(() => {
    return ACADEMIC_EVENTS_2026_2027.filter((evt) => {
      const matchCat = categoryFilter === "all" || evt.category === categoryFilter;
      const matchPeriod =
        periodFilter === "all" ||
        (periodFilter === "q3_2026" && evt.quarter === "Q3/2026") ||
        (periodFilter === "q4_2026" && evt.quarter === "Q4/2026") ||
        (periodFilter === "q1_2027" && evt.quarter === "Q1/2027") ||
        (periodFilter === "q2_2027" && evt.quarter === "Q2/2027");
      return matchCat && matchPeriod;
    });
  }, [categoryFilter, periodFilter]);

  // Motion variants chuẩn AGENTS.md §8:
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
    <div className="act-page antialiased">
      {/* ════ HERO SECTION ════ */}
      <Motion.header
        className="act-hero"
        variants={heroContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="act-shell">
          <div className="act-hero-grid">
            <div className="act-hero-left">
              <Motion.div variants={heroItem} className="act-hero-eyebrow">
                <span className="act-dot" aria-hidden="true" />
                <span className="act-eyebrow">
                  Xứ đoàn Mẹ Mân Côi · Niên khóa {ACADEMIC_YEAR}
                </span>
              </Motion.div>

              <Motion.h1 variants={heroItem} className="act-hero-title">
                Lịch Sinh Hoạt <em>&amp; Sự Kiện Giáo Lý</em>
              </Motion.h1>

              <Motion.p variants={heroItem} className="act-hero-desc">
                Kế hoạch sinh hoạt phụng vụ, đào tạo đức tin và các chương trình ngoại khóa, dã ngoại, hội trại truyền thống của Xứ đoàn Hùng Tâm Dũng Chí Giáo xứ An Ngãi.
              </Motion.p>
            </div>

            {/* 4 Overview Chips 2x2: Stagger cascade */}
            <Motion.div
              variants={chipsContainer}
              className="act-overview-chips"
              aria-label="Tóm tắt lịch sinh hoạt"
            >
              <Motion.div variants={chipItem} className="act-overview-chip">
                <span className="act-chip-cat">Niên Khóa</span>
                <span className="act-chip-value">{ACADEMIC_YEAR}</span>
                <span className="act-chip-label">Áp dụng toàn Xứ đoàn</span>
              </Motion.div>
              <Motion.div variants={chipItem} className="act-overview-chip">
                <span className="act-chip-cat">Sự Kiện Lớn</span>
                <span className="act-chip-value">21 Hoạt Động</span>
                <span className="act-chip-label">Trải dài 10 tháng</span>
              </Motion.div>
              <Motion.div variants={chipItem} className="act-overview-chip">
                <span className="act-chip-cat">Định Kỳ</span>
                <span className="act-chip-value">4 Khung Giờ</span>
                <span className="act-chip-label">Chúa Nhật &amp; trong tuần</span>
              </Motion.div>
              <Motion.div variants={chipItem} className="act-overview-chip">
                <span className="act-chip-cat">Kỹ Năng</span>
                <span className="act-chip-value">4 Chuyên Đề</span>
                <span className="act-chip-label">Huấn luyện hàng đội</span>
              </Motion.div>
            </Motion.div>
          </div>
        </div>
      </Motion.header>

      {/* ════ STICKY NAVIGATION & TAB SELECTOR ════ */}
      <nav className="act-nav-sticky" aria-label="Bộ chọn chế độ xem lịch sinh hoạt">
        <div className="act-shell">
          <div className="act-tab-group">
            <button
              type="button"
              onClick={() => setActiveTab("timeline")}
              className={`act-tab-btn ${activeTab === "timeline" ? "active" : ""}`}
              aria-current={activeTab === "timeline" ? "true" : undefined}
            >
              <Calendar size={16} aria-hidden="true" />
              <span>Dòng Thời Gian Sự Kiện ({ACADEMIC_EVENTS_2026_2027.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("routine")}
              className={`act-tab-btn ${activeTab === "routine" ? "active" : ""}`}
              aria-current={activeTab === "routine" ? "true" : undefined}
            >
              <Clock size={16} aria-hidden="true" />
              <span>Lịch Tuần Cố Định</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("skills")}
              className={`act-tab-btn ${activeTab === "skills" ? "active" : ""}`}
              aria-current={activeTab === "skills" ? "true" : undefined}
            >
              <Compass size={16} aria-hidden="true" />
              <span>Kỹ Năng Hàng Đội ({SKILL_MODULES.length})</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ════ MAIN CONTENT AREA ════ */}
      <main className="act-content-shell">
        {/* ── TAB 1: DÒNG THỜI GIAN SỰ KIỆN ── */}
        {activeTab === "timeline" && (
          <section aria-label="Dòng thời gian sự kiện niên khóa">
            {/* Filter Pills */}
            <div className="act-filters-wrap">
              <div className="w-full flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--act-accent-text)] mr-1">
                  Niên kỳ:
                </span>
                {PERIOD_OPTIONS.map((period) => (
                  <button
                    key={period.id}
                    type="button"
                    onClick={() => setPeriodFilter(period.id)}
                    className={`act-filter-pill ${periodFilter === period.id ? "active" : ""}`}
                    aria-pressed={periodFilter === period.id}
                  >
                    <span>{period.label}</span>
                  </button>
                ))}
              </div>

              <div className="w-full flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--act-accent-text)] mr-1">
                  Phân loại:
                </span>
                {ACTIVITY_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`act-filter-pill ${categoryFilter === cat.id ? "active" : ""}`}
                    aria-pressed={categoryFilter === cat.id}
                  >
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Event List */}
            <div className="act-event-list">
              {filteredEvents.map((evt) => (
                <Motion.article
                  key={evt.id}
                  className={`act-event-card ${evt.isFeatured ? "featured" : ""}`}
                  {...cardReveal}
                >
                  <div className="act-event-header">
                    <div className="act-event-date-wrap">
                      <span className="act-event-badge-cat">{evt.categoryLabel}</span>
                      <span className="act-event-date">
                        {evt.weekday}, {evt.date}
                      </span>
                    </div>
                    {evt.isFeatured && (
                      <span className="act-event-badge-cat" style={{ background: "var(--act-gold-bg)", color: "var(--act-accent-text)" }}>
                        <Sparkles size={12} className="inline mr-1" aria-hidden="true" /> Trọng tâm
                      </span>
                    )}
                  </div>

                  <h3 className="act-event-title">{evt.title}</h3>

                  <div className="act-event-meta">
                    <span className="act-meta-item">
                      <Clock size={14} aria-hidden="true" />
                      <span>{evt.time}</span>
                    </span>
                    <span className="act-meta-item">
                      <MapPin size={14} aria-hidden="true" />
                      <span>{evt.location}</span>
                    </span>
                    <span className="act-meta-item">
                      <Users size={14} aria-hidden="true" />
                      <span>{evt.audience}</span>
                    </span>
                  </div>

                  {evt.verse && (
                    <div className="act-event-verse">
                      {evt.verse}
                    </div>
                  )}

                  <p className="act-event-summary">{evt.summary}</p>

                  {evt.notes && (
                    <div className="act-event-notes">
                      <Info size={15} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{evt.notes}</span>
                    </div>
                  )}
                </Motion.article>
              ))}

              {filteredEvents.length === 0 && (
                <div className="act-event-card text-center py-10">
                  <p className="text-[var(--act-muted)]">
                    Không tìm thấy sự kiện nào trong danh mục đã chọn.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── TAB 2: LỊCH TUẦN CỐ ĐỊNH ── */}
        {activeTab === "routine" && (
          <section aria-label="Khung giờ sinh hoạt cố định trong tuần">
            <div className="act-routine-list">
              {WEEKLY_ROUTINE.map((dayGroup) => (
                <Motion.div
                  key={dayGroup.day}
                  className={`act-routine-day-card ${dayGroup.highlight ? "highlight" : ""}`}
                  {...cardReveal}
                >
                  <div className="act-routine-day-head">
                    <div className="act-routine-day-title-group">
                      <h2>{dayGroup.day}</h2>
                      <p>{dayGroup.subtitle}</p>
                    </div>
                    {dayGroup.badge && (
                      <span className="act-event-badge-cat">{dayGroup.badge}</span>
                    )}
                  </div>

                  <div className="act-routine-timeline">
                    {dayGroup.timeline.map((slot, sIdx) => (
                      <div key={sIdx} className="act-timeline-slot">
                        <div className="act-slot-time">
                          {slot.time}
                        </div>
                        <div className="act-slot-content">
                          <h4>{slot.title}</h4>
                          <div className="act-slot-meta">
                            <span className="act-meta-item">
                              <MapPin size={13} aria-hidden="true" />
                              <span>{slot.location}</span>
                            </span>
                            <span className="act-meta-item">
                              <Users size={13} aria-hidden="true" />
                              <span>{slot.audience}</span>
                            </span>
                          </div>
                          <p className="act-slot-desc">{slot.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ── TAB 3: KỸ NĂNG CHUYÊN MÔN HÀNG ĐỘI ── */}
        {activeTab === "skills" && (
          <section aria-label="Chương trình rèn luyện kỹ năng chuyên môn">
            <Motion.div className="act-skills-grid" {...sectionReveal}>
              {SKILL_MODULES.map((skill) => (
                <Motion.div key={skill.id} className="act-skill-card" {...cardReveal}>
                  <div className="act-skill-num">Mô-đun {skill.num}</div>
                  <h3>{skill.title}</h3>
                  <div className="act-skill-meta">
                    <span className="act-skill-badge">{skill.level}</span>
                    <span className="act-skill-badge">{skill.target}</span>
                  </div>
                  <p className="act-skill-desc">{skill.desc}</p>
                </Motion.div>
              ))}
            </Motion.div>
          </section>
        )}

        {/* ════ CALL TO ACTION & KÊNH LIÊN HỆ ════ */}
        <Motion.section className="act-cta-section" {...sectionReveal} aria-label="Tra cứu thông tin liên quan">
          <h3 className="act-cta-title">Tra Cứu Thông Tin Giảng Dạy &amp; Nội Quy</h3>
          <p className="act-cta-desc">
            Để nắm rõ danh sách phòng học, phân công giáo lý viên hoặc quy chế chuyên cần, quý phụ huynh và Giáo lý sinh có thể tra cứu nhanh:
          </p>
          <div className="act-cta-actions">
            <Link to="/lịch-học" className="act-btn-primary">
              <CalendarDays size={16} aria-hidden="true" />
              <span>Xem Thời Khóa Biểu 30 Lớp</span>
            </Link>
            <Link to="/quy-định" className="act-btn-secondary">
              <FileCheck size={16} aria-hidden="true" />
              <span>Xem Nội Quy Giáo Lý</span>
            </Link>
            <Link to="/liên-hệ" className="act-btn-secondary">
              <Mail size={16} aria-hidden="true" />
              <span>Liên Hệ Ban Giáo Lý</span>
            </Link>
          </div>
        </Motion.section>

        <p className="act-footnote">
          Văn bản Kế hoạch Sinh hoạt &amp; Sự kiện Giáo lý &middot; Xứ đoàn Mẹ Mân Côi &middot; Giáo xứ An Ngãi
          <br />
          Cập nhật lần cuối: Tháng 09/2026 &bull; Niên khóa {ACADEMIC_YEAR}
        </p>
      </main>
    </div>
  );
}