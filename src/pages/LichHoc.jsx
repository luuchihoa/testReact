import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Clock, MapPin, Search, X,
  LayoutGrid, ListFilter, GraduationCap, Sparkles,
  ArrowUpRight, ChevronRight, Info, Church, DoorOpen,
  ChevronDown, ArrowRight, Calendar, ShieldCheck, MoveHorizontal,
  Star, ArrowUp
} from "lucide-react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  SCHEDULE_CLASSES,
  CA_HOC,
  CENTRAL_MASS,
  NGANH_LIST,
  ROOMS_DIRECTORY,
  ACADEMIC_YEAR,
  TOTAL_STUDENTS,
  TOTAL_TEACHERS,
  TOTAL_CLASSES
} from "../data/lichHocData.js";
import "./LichHoc.css";

// Helper thông tin Khối và Màu khăn HTDC
const NGANH_MAP = {
  "chinh-chien": { name: "Khối Vào Đời", short: "Vào Đời", scarf: "Khăn Đỏ Có Viền" },
  "nhiet-quang": { name: "Khối Kinh Thánh & Phụng Vụ", short: "KT & PV", scarf: "Khăn Có Viền" },
  "kim-hoan": { name: "Khối Thêm Sức", short: "Thêm Sức", scarf: "Khăn Vàng Có Viền" },
  "au-dung": { name: "Khối Khai Tâm & RLLĐ", short: "KT & RLLĐ", scarf: "Khăn Xanh Lá" },
};

function getScarfByClass(item) {
  if (item.id === "vuon-tre" || (item.name && item.name.includes("Khai Tâm"))) {
    return "Khăn Xanh Lá Trơn";
  }
  if (item.name && (item.name.includes("RLLĐ") || item.name.includes("Rước Lễ"))) {
    return "Khăn Xanh Có Viền";
  }
  if (item.name && item.name.includes("Thêm Sức")) {
    return "Khăn Vàng Có Viền";
  }
  if (item.name && item.name.includes("Phụng Vụ")) {
    return "Khăn Da Cam Có Viền";
  }
  if (item.name && item.name.includes("Kinh Thánh")) {
    return "Khăn Đỏ Có Viền";
  }
  if (item.name && item.name.includes("Vào Đời")) {
    return "Khăn Đỏ Có Viền";
  }
  return NGANH_MAP[item.nganhId]?.scarf || "Khăn HTDC";
}

const PINNED_STORAGE_KEY = "anNgai_pinnedClasses";

export default function LichHoc() {
  const prefersReduced = useReducedMotion();
  const heroSentinelRef = useRef(null);
  const [selectedCa, setSelectedCa] = useState("all");
  const [selectedNganh, setSelectedNganh] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'table'
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [showThumbBar, setShowThumbBar] = useState(false);

  // State tiện ích: Ghim lớp của con em (lưu vào localStorage an toàn)
  const [pinnedClassIds, setPinnedClassIds] = useState(() => {
    try {
      const saved = localStorage.getItem(PINNED_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const togglePinClass = useCallback((id) => {
    setPinnedClassIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Safe fallback cho Safari private mode
      }
      return next;
    });
  }, []);

  const clearAllPinned = useCallback(() => {
    setPinnedClassIds([]);
    try {
      localStorage.removeItem(PINNED_STORAGE_KEY);
    } catch {
      // Safe fallback cho Safari private mode
    }
  }, []);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = `Thời Gian Biểu & Phân Công Lớp Học ${ACADEMIC_YEAR} | Giáo xứ An Ngãi`;
    return () => {
      document.title = prevTitle;
    };
  }, []);

  // Lắng nghe vị trí quan sát Sentinel ngay trước danh sách lớp bằng IntersectionObserver
  useEffect(() => {
    const target = heroSentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Chỉ kích hoạt Thumb bar khi Sentinel đã thực sự trượt lên trên đỉnh màn hình
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setShowThumbBar(true);
        } else {
          setShowThumbBar(false);
        }
      },
      { threshold: 0 }
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Lọc danh sách lớp theo Ca, Ngành, Phòng và Tìm kiếm
  const filteredClasses = useMemo(() => {
    return SCHEDULE_CLASSES.filter((item) => {
      // Lọc theo ca
      if (selectedCa !== "all" && item.ca !== Number(selectedCa)) {
        return false;
      }
      // Lọc theo ngành
      if (selectedNganh !== "all" && item.nganhId !== selectedNganh) {
        return false;
      }
      // Lọc theo phòng nếu được chọn
      if (selectedRoom && item.room !== selectedRoom) {
        return false;
      }
      // Lọc theo từ khóa tìm kiếm
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchKhoi = item.khoiName.toLowerCase().includes(q);
        const matchRoom = item.room.toLowerCase().includes(q);
        const matchYear = String(item.birthYear).includes(q);
        const matchTeacher = item.teachers.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchKhoi && !matchRoom && !matchYear && !matchTeacher) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCa, selectedNganh, selectedRoom, searchQuery]);

  // Danh sách các lớp đã được ghim
  const pinnedClasses = useMemo(() => {
    return SCHEDULE_CLASSES.filter((c) => pinnedClassIds.includes(c.id));
  }, [pinnedClassIds]);

  // Đếm số lớp theo từng ca
  const countCa1 = useMemo(() => SCHEDULE_CLASSES.filter((c) => c.ca === 1).length, []);
  const countCa2 = useMemo(() => SCHEDULE_CLASSES.filter((c) => c.ca === 2).length, []);

  const resetFilters = () => {
    setSelectedCa("all");
    setSelectedNganh("all");
    setSelectedRoom(null);
    setSearchQuery("");
  };

  const hasActiveFilters = selectedCa !== "all" || selectedNganh !== "all" || selectedRoom !== null || searchQuery !== "";

  // Cấu hình chuyển động Phụng vụ trang nghiêm (Liturgical Motion)
  const heroContainerVariants = {
    hidden: { opacity: prefersReduced ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReduced ? 0 : 0.05,
        delayChildren: prefersReduced ? 0 : 0.05
      }
    }
  };

  const heroItemVariants = {
    hidden: { opacity: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReduced ? 0 : 0.38, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="sched-page">
      {/* ════ HERO SECTION (LITURGICAL MOTION REVEAL) ════ */}
      <section className="sched-hero" aria-labelledby="sched-hero-title">
        <div className="sched-shell">
          <Motion.div
            className="sched-hero-grid"
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Cột trái: Copy + CTA */}
            <div className="sched-hero-left">
              <Motion.div className="sched-hero-eyebrow" variants={heroItemVariants}>
                <span className="sched-dot" aria-hidden="true" />
                <span className="sched-eyebrow">NIÊN KHÓA {ACADEMIC_YEAR} · XỨ ĐOÀN MẸ MÂN CÔI</span>
              </Motion.div>

              <Motion.h1 id="sched-hero-title" className="sched-hero-title" variants={heroItemVariants}>
                Thời Gian Biểu <em>Phân Công Lớp Học</em>
              </Motion.h1>

              <Motion.p className="sched-hero-desc" variants={heroItemVariants}>
                Bảng phân bố thời gian, phòng học và danh sách Ban Giáo lý &amp; Huynh trưởng phụ trách {TOTAL_CLASSES} lớp giáo lý Giáo xứ An Ngãi niên khóa {ACADEMIC_YEAR}.
              </Motion.p>

              <Motion.div className="sched-hero-actions" variants={heroItemVariants}>
                <a href="#danh-sach-lop" className="sched-btn-primary">
                  <span>Xem {TOTAL_CLASSES} Lớp Học</span>
                  <ArrowRight size={17} aria-hidden="true" className="sched-btn-icon" />
                </a>
                <Link to="/tuyển-sinh#dang-ky" className="sched-btn-secondary">
                  <Sparkles size={16} aria-hidden="true" />
                  <span>Đăng Ký Niên Khóa Mới</span>
                </Link>
              </Motion.div>
            </div>

            {/* Cột phải: Overview chips 2×2 */}
            <div className="sched-hero-right">
              <div className="sched-overview-chips">
                <Motion.div className="sched-overview-chip" variants={heroItemVariants}>
                  <span className="sched-chip-cat">Quy mô</span>
                  <span className="sched-chip-value">{TOTAL_CLASSES} Lớp</span>
                  <span className="sched-chip-label">Các khối giáo lý</span>
                </Motion.div>
                <Motion.div className="sched-overview-chip" variants={heroItemVariants}>
                  <span className="sched-chip-cat">Giáo lý viên</span>
                  <span className="sched-chip-value">{TOTAL_TEACHERS} GLV</span>
                  <span className="sched-chip-label">GLV &amp; Huynh trưởng</span>
                </Motion.div>
                <Motion.div className="sched-overview-chip" variants={heroItemVariants}>
                  <span className="sched-chip-cat">Thiếu nhi</span>
                  <span className="sched-chip-value">{TOTAL_STUDENTS}</span>
                  <span className="sched-chip-label">Thiếu nhi theo học</span>
                </Motion.div>
                <Motion.div className="sched-overview-chip" variants={heroItemVariants}>
                  <span className="sched-chip-cat">Lịch học</span>
                  <span className="sched-chip-value">2 Ca học</span>
                  <span className="sched-chip-label">Sáng Chúa Nhật</span>
                </Motion.div>
              </div>
            </div>
          </Motion.div>
        </div>
      </section>

      {/* ════ LITURGICAL TIMELINE STRIP — Collapsible ════ */}
      <section className="sched-timeline-section" aria-label="Nhịp cầu phụng vụ sáng Chúa Nhật">
        <div className="sched-shell">
          <button
            type="button"
            className="sched-timeline-toggle"
            aria-expanded={timelineOpen}
            aria-controls="sched-timeline-body"
            onClick={() => setTimelineOpen((v) => !v)}
          >
            <div className="sched-timeline-toggle-left">
              <span className="sched-dot" aria-hidden="true" />
              <span className="sched-eyebrow">NHỊP CẦU PHỤNG VỤ CHÚA NHẬT</span>
              <span className="sched-timeline-toggle-sub">
                Mô hình <em>Học – Lễ – Học</em> · Sáng Chúa Nhật hàng tuần
              </span>
            </div>
            <ChevronDown
              size={18}
              aria-hidden="true"
              className="sched-timeline-chevron"
              style={{ transform: timelineOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          <AnimatePresence>
            {timelineOpen && (
              <Motion.div
                id="sched-timeline-body"
                className="sched-timeline-body"
                initial={prefersReduced ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={prefersReduced ? false : { opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="sched-timeline-container">
                  <div className="sched-timeline-grid">
                    {/* Ca 1 */}
                    <div className="sched-timeline-card">
                      <div>
                        <div className="time-tag">
                          <Clock size={16} aria-hidden="true" /> 07:00 – 07:45
                        </div>
                        <h3 className="card-title">Ca 1: Khối Lớn</h3>
                        <p className="card-desc">
                          Học trước Thánh Lễ gồm các lớp <strong>Vào Đời</strong>, <strong>Kinh Thánh</strong> và <strong>Phụng Vụ</strong>.
                        </p>
                      </div>
                      <span className="card-badge sched-timeline-badge--ca1">
                        {CA_HOC[0].classesCount} Lớp · Học trước Lễ
                      </span>
                    </div>

                    {/* Thánh Lễ Trung Tâm */}
                    <div className="sched-timeline-card central-mass">
                      <div>
                        <div className="time-tag">
                          <Church size={17} aria-hidden="true" /> 08:00 – 09:00
                        </div>
                        <h3 className="card-title">{CENTRAL_MASS.name}</h3>
                        <p className="card-desc">
                          Tâm điểm hiệp nhất tại <strong>{CENTRAL_MASS.location}</strong>. Quy tụ <strong>{CENTRAL_MASS.classesCount || 29} lớp chính quy</strong> và {TOTAL_TEACHERS} GLV dâng Lễ chung (Khối Vườn Trẻ sinh hoạt theo giờ riêng).
                        </p>
                      </div>
                      <span className="card-badge sched-timeline-badge--mass">
                        Trọng tâm đời sống Đức tin
                      </span>
                    </div>

                    {/* Ca 2 */}
                    <div className="sched-timeline-card">
                      <div>
                        <div className="time-tag">
                          <Clock size={16} aria-hidden="true" /> 09:15 – 10:00
                        </div>
                        <h3 className="card-title">Ca 2: Khối Nhỏ</h3>
                        <p className="card-desc">
                          Học sau Thánh Lễ gồm các lớp <strong>Thêm Sức</strong>, <strong>Rước Lễ</strong>, <strong>Khai Tâm</strong> và <strong>Vườn Trẻ</strong>.
                        </p>
                      </div>
                      <span className="card-badge sched-timeline-badge--ca2">
                        {CA_HOC[1].classesCount} Lớp · Học sau Lễ
                      </span>
                    </div>
                  </div>
                </div>
              </Motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ════ TOOLBAR & CONTROLS ════ */}
      <div className="sched-toolbar-section">
        <div className="sched-shell">
          {/* Hàng 1: Tabs chọn Ca học */}
          <div className="sched-shift-tabs" role="tablist" aria-label="Chọn ca học">
            <button
              type="button"
              role="tab"
              aria-selected={selectedCa === "all"}
              className={`sched-shift-btn ${selectedCa === "all" ? "active" : ""}`}
              onClick={() => setSelectedCa("all")}
            >
              <span className="sched-shift-name">Tất cả</span>
              <span className="sched-shift-count">({TOTAL_CLASSES})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={selectedCa === "1"}
              className={`sched-shift-btn ${selectedCa === "1" ? "active" : ""}`}
              onClick={() => setSelectedCa("1")}
            >
              <span className="sched-shift-name">Ca 1</span>
              <span className="sched-shift-time">(7h00)</span>
              <span className="sched-shift-count">({countCa1})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={selectedCa === "2"}
              className={`sched-shift-btn ${selectedCa === "2" ? "active" : ""}`}
              onClick={() => setSelectedCa("2")}
            >
              <span className="sched-shift-name">Ca 2</span>
              <span className="sched-shift-time">(9h15)</span>
              <span className="sched-shift-count">({countCa2})</span>
            </button>
          </div>
        </div>

        {/* Hàng 2: GHIM Ô TÌM TÊN LỚP (STICKY SEARCH BAR) */}
        <div className="sched-search-sticky-bar">
          <div className="sched-shell">
            <div className="sched-search-sticky-inner">
              <div className="sched-search-box">
                <Search size={16} className="search-icon" aria-hidden="true" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm tên lớp, GLV, phòng..."
                  aria-label="Tìm kiếm lớp học"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={() => setSearchQuery("")}
                    aria-label="Xoá tìm kiếm"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <div className="sched-view-toggles" role="group" aria-label="Chế độ hiển thị">
                <button
                  type="button"
                  className={`sched-view-btn ${viewMode === "cards" ? "active" : ""}`}
                  onClick={() => setViewMode("cards")}
                  title="Dạng Thẻ"
                  aria-label="Dạng Thẻ"
                  aria-pressed={viewMode === "cards"}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  type="button"
                  className={`sched-view-btn ${viewMode === "table" ? "active" : ""}`}
                  onClick={() => setViewMode("table")}
                  title="Dạng Bảng"
                  aria-label="Dạng Bảng"
                  aria-pressed={viewMode === "table"}
                >
                  <ListFilter size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hàng 3: Chips lọc Ngành & Phòng */}
        <div className="sched-shell">
          <div className="sched-chips-wrapper">
            <div className="sched-chips-row">
              {NGANH_LIST.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  aria-pressed={selectedNganh === n.id}
                  className={`sched-chip ${selectedNganh === n.id ? "active" : ""}`}
                  onClick={() => setSelectedNganh(n.id)}
                >
                  {n.dotClass && (
                    <span
                      className={`w-2 h-2 rounded-full ${n.dotClass}`}
                      aria-hidden="true"
                    />
                  )}
                  {n.shortName}
                </button>
              ))}

              {selectedRoom && (
                <button
                  type="button"
                  className="sched-chip active sched-chip-room-active"
                  onClick={() => setSelectedRoom(null)}
                  title="Bấm để huỷ lọc theo phòng"
                >
                  Phòng: {selectedRoom} <X size={13} />
                </button>
              )}

              {hasActiveFilters && (
                <button
                  type="button"
                  className="sched-chip sched-chip-reset"
                  onClick={resetFilters}
                >
                  Đặt lại
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ════ MAIN CONTENT: CARDS OR TABLE VIEW ════ */}
      {/* Sentinel: thumb bar activates only after class list scrolls past viewport top */}
      <div ref={heroSentinelRef} className="sched-hero-sentinel" aria-hidden="true" />
      <div id="danh-sach-lop" className="sched-shell">
        {/* ── TIỆN ÍCH GIA ĐÌNH: LỚP HỌC CỦA GIA ĐÌNH BẠN (PINNED CLASSES) ── */}
        <AnimatePresence>
          {pinnedClasses.length > 0 && (
            <Motion.section
              key="sched-pinned-section"
              initial={prefersReduced ? false : { opacity: 0, height: 0, overflow: "hidden" }}
              animate={{ opacity: 1, height: "auto", transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } }}
              exit={prefersReduced ? false : { opacity: 0, height: 0, overflow: "hidden", transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } }}
              className="sched-pinned-section"
              aria-labelledby="sched-pinned-title"
            >
              <div className="sched-pinned-header">
                <h2 id="sched-pinned-title" className="sched-pinned-title">
                  <Star size={18} fill="currentColor" className="sched-pinned-star-icon" aria-hidden="true" />
                  <span>Lớp Học Của Gia Đình Bạn</span>
                  <em>({pinnedClasses.length} lớp đã ghim)</em>
                </h2>
                <div className="sched-pinned-actions">
                  <span className="sched-pinned-badge">
                    Tra cứu nhanh
                  </span>
                  <button
                    type="button"
                    className="sched-pinned-clear-btn"
                    onClick={clearAllPinned}
                    title="Bỏ ghim tất cả các lớp"
                    aria-label="Bỏ ghim tất cả các lớp đã chọn"
                  >
                    Bỏ ghim tất cả
                  </button>
                </div>
              </div>

              <div className="sched-pinned-grid">
                {pinnedClasses.map((item) => (
                  <article key={item.id} className="sched-pinned-card">
                    <div className="sched-pinned-card-head">
                      <span className="sched-pinned-card-name">
                        {item.name.startsWith("Lớp ") ? item.name : `Lớp ${item.name}`}
                      </span>
                      <button
                        type="button"
                        className="sched-pin-btn pinned"
                        onClick={() => togglePinClass(item.id)}
                        title={`Bỏ ghim lớp ${item.name}`}
                        aria-label={`Bỏ ghim lớp ${item.name}`}
                        aria-pressed="true"
                      >
                        <Star size={18} fill="currentColor" />
                      </button>
                    </div>
                    <div className="sched-pinned-card-meta">
                      <span className="sched-pinned-card-time">
                        <Clock size={12} aria-hidden="true" /> {item.time} (Ca {item.ca})
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <MapPin size={12} aria-hidden="true" /> {item.room}
                      </span>
                    </div>
                    <div className="sched-pinned-card-teachers">
                      GLV: {item.teachers.join(", ")}
                    </div>
                  </article>
                ))}
              </div>
            </Motion.section>
          )}
        </AnimatePresence>

        <div className="sched-results-header">
          <p className="sched-results-count">
            Hiển thị <strong>{filteredClasses.length}</strong> / {TOTAL_CLASSES} lớp học
            {selectedCa !== "all" && ` · Ca ${selectedCa}`}
            {selectedRoom && ` · Phòng ${selectedRoom}`}
          </p>
        </div>

        {filteredClasses.length === 0 ? (
          /* ── EMPTY STATE ── */
          <div className="sched-empty">
            <GraduationCap size={44} aria-hidden="true" />
            <h3>Không tìm thấy lớp học nào</h3>
            <p>
              {searchQuery
                ? `Không có lớp nào khớp với từ khóa "${searchQuery}".`
                : "Không có lớp nào khớp với bộ lọc hiện tại."}
              {" "}Thử thay đổi hoặc đặt lại bộ lọc.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="sched-empty-reset"
            >
              Đặt lại tất cả bộ lọc
            </button>
          </div>
        ) : viewMode === "cards" ? (
          /* ── DẠNG THẺ (CARD VIEW) — Bento 5 tầng chuẩn màu Ngành HTDC ── */
          <div className="sched-cards-grid">
            <AnimatePresence>
              {filteredClasses.map((item) => {
                const isPinned = pinnedClassIds.includes(item.id);
                return (
                  <Motion.article
                    key={item.id}
                    layout="position"
                    initial={prefersReduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReduced ? false : { opacity: 0, y: -4 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className={`sched-card card-nganh-${item.nganhId}`}
                  >
                    {/* Tầng 1: Head - Nhãn Khối & Phòng học & Nút Ghim */}
                    <div className="sched-bento-head">
                      <span className="sched-bento-code">
                        <span className="sched-nganh-dot" aria-hidden="true" />
                        {item.khoiName}
                      </span>
                      <div className="sched-bento-head-right">
                        <button
                          type="button"
                          className="sched-bento-room"
                          onClick={() => setSelectedRoom(selectedRoom === item.room ? null : item.room)}
                          title={`Lọc lớp tại phòng ${item.room}`}
                          aria-pressed={selectedRoom === item.room}
                        >
                          <MapPin size={12} aria-hidden="true" />
                          <span>{item.room}</span>
                        </button>
                        <button
                          type="button"
                          className={`sched-pin-btn ${isPinned ? "pinned" : ""}`}
                          onClick={() => togglePinClass(item.id)}
                          title={isPinned ? `Bỏ ghim lớp ${item.name}` : `Ghim lớp ${item.name} cho gia đình`}
                          aria-label={isPinned ? `Bỏ ghim lớp ${item.name}` : `Ghim lớp ${item.name}`}
                          aria-pressed={isPinned}
                        >
                          <Star size={16} fill={isPinned ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </div>

                    {/* Tầng 2: Tên Lớp & Dải Chỉ Số */}
                    <div>
                      <h3 className="sched-bento-title">
                        {item.name.startsWith("Lớp ") ? item.name : `Lớp ${item.name}`}
                      </h3>
                      <div className="sched-bento-stats">
                        <span className="sched-bento-stat">
                          <GraduationCap size={12} aria-hidden="true" />
                          {item.studentsCount
                            ? <>Sĩ số: <strong>{item.studentsCount} em</strong></>
                            : <em>Đang tuyển sinh</em>}
                        </span>
                        <span className="sched-bento-stat">
                          <Calendar size={12} aria-hidden="true" />
                          <span>Độ tuổi: <strong>{item.ageText}</strong> ({item.birthYear})</span>
                        </span>
                      </div>
                    </div>

                    {/* Tầng 3: Đội ngũ GLV / Huynh Trưởng */}
                    <div className="sched-bento-teachers">
                      <div className="sched-bento-teacher-label">
                        <ShieldCheck size={12} aria-hidden="true" />
                        <span>GLV / Huynh Trưởng ({item.teachers.length})</span>
                      </div>
                      <div className="sched-bento-teacher-pills">
                        {item.teachers.slice(0, 3).map((t, idx) => (
                          <span key={idx} className="sched-bento-teacher-pill">{t}</span>
                        ))}
                        {item.teachers.length > 3 && (
                          <span className="sched-bento-teacher-pill more">
                            +{item.teachers.length - 3} khác
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tầng 4: Trọng tâm & Phân ban Khối */}
                    <div className="sched-bento-focus">
                      <span className="sched-bento-focus-badge">
                        {item.khoiName} · {getScarfByClass(item)}
                      </span>
                      <Link to={item.path} className="sched-bento-focus-link">
                        Chi tiết khối <ChevronRight size={13} aria-hidden="true" />
                      </Link>
                    </div>

                    {/* Tầng 5: Footer — Giờ + Ca */}
                    <div className="sched-bento-foot">
                      <span className="sched-bento-time">
                        <Clock size={13} aria-hidden="true" />
                        {item.time}
                      </span>
                      <span className="sched-ca-pill">
                        Ca {item.ca}
                      </span>
                    </div>
                  </Motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* ── DẠNG BẢNG (TABLE VIEW) ── */
          <div className="sched-table-wrapper">
            {/* Scroll hint banner on mobile */}
            <div className="sched-table-mobile-hint md:hidden">
              <MoveHorizontal size={13} aria-hidden="true" />
              <span>Bảng chi tiết — Vuốt sang ngang để xem đủ các cột</span>
            </div>

            <div className="sched-table-scroll">
              <table className="sched-table">
                <thead>
                  <tr>
                    <th scope="col" className="sched-table-col-num">#</th>
                    <th scope="col">Lớp Học &amp; Khối</th>
                    <th scope="col">Ca &amp; Giờ</th>
                    <th scope="col">Giáo Lý Viên Phụ Trách</th>
                    <th scope="col">Độ tuổi &amp; Sĩ số</th>
                    <th scope="col">Phòng Học</th>
                    <th scope="col" className="sched-table-col-action">Ghim / Xem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClasses.map((item, idx) => {
                    const isPinned = pinnedClassIds.includes(item.id);
                    return (
                      <tr key={item.id} className={`card-nganh-${item.nganhId}`}>
                        <td className="sched-table-col-num">
                          {idx + 1}
                        </td>
                        <td>
                          <strong className="sched-table-class-name">{item.name}</strong>
                          <span className="sched-table-nganh-tag">
                            <span className="sched-table-nganh-dot" aria-hidden="true" />
                            {item.khoiName}
                          </span>
                        </td>
                        <td>
                          <span className="sched-ca-pill">
                            Ca {item.ca}
                          </span>
                          <div className="sched-table-time-info">{item.time}</div>
                        </td>
                        <td>
                          <div className="sched-table-teachers-wrapper">
                            {item.teachers.map((t, i) => (
                              <span key={i} className="sched-bento-teacher-pill">{t}</span>
                            ))}
                          </div>
                        </td>
                        <td className="sched-table-col-target">
                          <strong className="sched-table-age-highlight">{item.ageText}</strong>
                          <div className="sched-table-age-info">
                            {item.studentsCount ? `${item.studentsCount} em (${item.birthYear})` : <em className="sched-table-recruiting">Tuyển sinh ({item.birthYear})</em>}
                          </div>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="sched-bento-room"
                            onClick={() => setSelectedRoom(selectedRoom === item.room ? null : item.room)}
                            title="Bấm để lọc theo phòng này"
                            aria-pressed={selectedRoom === item.room}
                          >
                            <MapPin size={11} aria-hidden="true" />
                            <span>{item.room}</span>
                          </button>
                        </td>
                        <td className="sched-table-col-action">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              type="button"
                              className={`sched-pin-btn ${isPinned ? "pinned" : ""}`}
                              onClick={() => togglePinClass(item.id)}
                              title={isPinned ? `Bỏ ghim lớp ${item.name}` : `Ghim lớp ${item.name}`}
                              aria-label={isPinned ? `Bỏ ghim lớp ${item.name}` : `Ghim lớp ${item.name}`}
                              aria-pressed={isPinned}
                            >
                              <Star size={15} fill={isPinned ? "currentColor" : "none"} />
                            </button>
                            <Link to={item.path} className="sched-card-link">
                              Xem <ArrowUpRight size={13} aria-hidden="true" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ CAMPUS ROOM DIRECTORY ════ */}
        <section className="sched-rooms-section" aria-labelledby="sched-rooms-title">
          <div className="sched-rooms-header">
            <span className="sched-eyebrow">CHỈ DẪN KHUÔN VIÊN GIÁO XỨ</span>
            <h2 id="sched-rooms-title" className="sched-rooms-title">
              Danh Mục &amp; Sơ Đồ <em>Phòng Học</em>
            </h2>
            <p className="sched-rooms-desc">
              Bấm vào từng phòng dưới đây để lọc nhanh các lớp học diễn ra tại phòng đó trong 2 ca sáng Chúa Nhật.
            </p>
          </div>

          <div className="sched-rooms-grid">
            {ROOMS_DIRECTORY.map((room) => {
              const isActive = selectedRoom === room.id;
              const classesInRoom = SCHEDULE_CLASSES.filter((c) => c.room === room.id);
              return (
                <button
                  key={room.id}
                  type="button"
                  aria-pressed={isActive}
                  className={`sched-room-button ${isActive ? "active" : ""}`}
                  onClick={() => setSelectedRoom(isActive ? null : room.id)}
                >
                  <strong>
                    <DoorOpen size={16} className="sched-room-icon" aria-hidden="true" />
                    {room.name}
                  </strong>
                  <span>{room.zone} · {classesInRoom.length} lớp học</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ════ GUIDELINES FOR STUDENTS & PARENTS ════ */}
        <div className="sched-guidelines">
          <div className="sched-guidelines-icon">
            <Info size={22} aria-hidden="true" />
          </div>
          <div>
            <h3 className="sched-guidelines-title">
              Lưu Ý Khi Đến Lớp Giáo Lý
            </h3>
            <ul className="sched-guidelines-list">
              <li>
                Các em vui lòng có mặt trước giờ học <strong>10–15 phút</strong> để ổn định hàng ngũ, điểm danh và chuẩn bị tâm hồn.
              </li>
              <li>
                Mặc đồng phục Hùng Tâm Dũng Chí chỉnh tề, đeo khăn quàng đúng khối học (Khăn xanh lá trơn cho Vườn Trẻ & Khai Tâm, khăn xanh có viền cho Rước Lễ, khăn vàng cho Thêm Sức, khăn cam cho Phụng Vụ, khăn đỏ cho Kinh Thánh & Vào Đời), mang đầy đủ Kinh Thánh, sách giáo lý và tập vở.
              </li>
              <li>
                Lịch học có thể điều chỉnh vào các dịp Lễ Trọng hoặc kỳ thi giáo lý. Phụ huynh vui lòng theo dõi thông báo trực tiếp từ Ban Giáo Lý.
              </li>
            </ul>
          </div>
        </div>

        {/* ════ CALL TO ACTION ════ */}
        <section className="sched-cta" aria-labelledby="sched-cta-title">
          <span className="sched-eyebrow">ĐỒNG HÀNH ĐỨC TIN</span>
          <h2 id="sched-cta-title" className="sched-cta-title">
            Chào Đón <em>Giáo Lý Sinh Mới</em>
          </h2>
          <p className="sched-cta-desc">
            Ban Giáo Lý luôn sẵn lòng đón nhận và đồng hành cùng các em thiếu nhi mới đến độ tuổi đến lớp hoặc vừa chuyển về giáo xứ.
          </p>
          <div className="sched-cta-actions">
            <Link to="/tuyển-sinh" className="sched-cta-btn">
              Hướng dẫn ghi danh <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <Link
              to="/liên-hệ"
              className="sched-cta-btn sched-cta-btn--outline"
            >
              Liên hệ Ban Giáo Lý
            </Link>
          </div>
        </section>
      </div>

      {/* ════ FLOATING THUMB ZONE QUICK SWITCHER (MOBILE ONLY) ════ */}
      <div
        className={`sched-thumb-bar ${showThumbBar ? "visible" : ""}`}
        role="navigation"
        aria-label="Điều khiển ca học nhanh"
      >
        <div className="sched-thumb-tabs">
          <button
            type="button"
            className={`sched-thumb-tab-btn ${selectedCa === "all" ? "active" : ""}`}
            onClick={() => setSelectedCa("all")}
          >
            <span>Tất cả</span>
            <span className="opacity-70">({TOTAL_CLASSES})</span>
          </button>
          <button
            type="button"
            className={`sched-thumb-tab-btn ${selectedCa === "1" ? "active" : ""}`}
            onClick={() => setSelectedCa("1")}
          >
            <span>Ca 1</span>
            <span className="opacity-70">({countCa1})</span>
          </button>
          <button
            type="button"
            className={`sched-thumb-tab-btn ${selectedCa === "2" ? "active" : ""}`}
            onClick={() => setSelectedCa("2")}
          >
            <span>Ca 2</span>
            <span className="opacity-70">({countCa2})</span>
          </button>
        </div>

        <button
          type="button"
          className="sched-thumb-action-btn"
          onClick={() => {
            const target = document.querySelector("#danh-sach-lop");
            if (target) target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
          }}
          title="Cuộn lên đầu danh sách"
          aria-label="Cuộn lên đầu danh sách lớp"
        >
          <ArrowUp size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}