import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays, Clock, MapPin, Users, Search, X,
  LayoutGrid, ListFilter, GraduationCap, Sparkles,
  ArrowUpRight, ChevronRight, Info, Church, DoorOpen,
  ChevronDown, ArrowRight, Calendar, ShieldCheck, MoveHorizontal
} from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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

// Helper thông tin Ngành và Màu khăn HTDC
const NGANH_MAP = {
  "chinh-chien": { name: "Ngành Chinh Chiến", short: "Chinh Chiến", scarf: "Khăn Đỏ" },
  "nhiet-quang": { name: "Ngành Nhiệt Quang", short: "Nhiệt Quang", scarf: "Khăn Da Cam" },
  "kim-hoan": { name: "Ngành Kim Hoan", short: "Kim Hoan", scarf: "Khăn Vàng" },
  "au-dung": { name: "Ngành Ấu", short: "Ngành Ấu", scarf: "Khăn Xanh Lá" },
};

export default function LichHoc() {
  const prefersReduced = useReducedMotion();
  const [selectedCa, setSelectedCa] = useState("all");
  const [selectedNganh, setSelectedNganh] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'table'
  const [timelineOpen, setTimelineOpen] = useState(false);


  useEffect(() => {
    const prevTitle = document.title;
    document.title = `Thời Gian Biểu & Phân Công Lớp Học ${ACADEMIC_YEAR} | Giáo xứ An Ngãi`;
    return () => {
      document.title = prevTitle;
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

  return (
    <div className="sched-page">
      {/* ════ HERO SECTION ════ */}
      <section className="sched-hero" aria-labelledby="sched-hero-title">
        <div className="sched-shell">
          <div className="sched-hero-grid">
            {/* Cột trái: Copy + CTA */}
            <div className="sched-hero-left">
              <div className="sched-hero-eyebrow">
                <span className="sched-dot" aria-hidden="true" />
                <span className="sched-eyebrow">NIÊN KHÓA {ACADEMIC_YEAR} · XỨ ĐOÀN MẸ MÂN CÔI</span>
              </div>

              <h1 id="sched-hero-title" className="sched-hero-title">
                Thời Gian Biểu <em>Phân Công Lớp Học</em>
              </h1>

              <p className="sched-hero-desc">
                Bảng phân bố thời gian, phòng học và danh sách Giáo lý viên &amp; Huynh trưởng phụ trách {TOTAL_CLASSES} lớp giáo lý Giáo xứ An Ngãi niên khóa {ACADEMIC_YEAR}.
              </p>

              <div className="sched-hero-actions">
                <a href="#danh-sach-lop" className="sched-btn-primary">
                  <span>Xem {TOTAL_CLASSES} Lớp Học</span>
                  <ArrowRight size={17} aria-hidden="true" className="sched-btn-icon" />
                </a>
                <Link to="/tuyển-sinh#dang-ky" className="sched-btn-secondary">
                  <Sparkles size={16} aria-hidden="true" />
                  <span>Đăng Ký Niên Khóa Mới</span>
                </Link>
              </div>
            </div>

            {/* Cột phải: Overview chips 2×2 */}
            <div className="sched-hero-right">
              <div className="sched-overview-chips">
                <div className="sched-overview-chip">
                  <span className="sched-chip-cat">Quy mô</span>
                  <span className="sched-chip-value">{TOTAL_CLASSES} Lớp</span>
                  <span className="sched-chip-label">Các khối giáo lý</span>
                </div>
                <div className="sched-overview-chip">
                  <span className="sched-chip-cat">Nhân sự</span>
                  <span className="sched-chip-value">{TOTAL_TEACHERS} GLV</span>
                  <span className="sched-chip-label">Giáo lý viên &amp; Huynh trưởng</span>
                </div>
                <div className="sched-overview-chip">
                  <span className="sched-chip-cat">Đoàn sinh</span>
                  <span className="sched-chip-value">{TOTAL_STUDENTS}</span>
                  <span className="sched-chip-label">Thiếu nhi theo học</span>
                </div>
                <div className="sched-overview-chip">
                  <span className="sched-chip-cat">Lịch học</span>
                  <span className="sched-chip-value">2 Ca học</span>
                  <span className="sched-chip-label">Sáng Chúa Nhật</span>
                </div>
              </div>
            </div>
          </div>
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

          {timelineOpen && (
            <div id="sched-timeline-body" className="sched-timeline-body">
              <div className="sched-timeline-container">
                <div className="sched-timeline-grid">
                  {/* Ca 1 */}
                  <div className="sched-timeline-card">
                    <div>
                      <div className="time-tag">
                        <Clock size={16} /> 07:00 – 07:45
                      </div>
                      <h3 className="card-title">Ca 1: Khối Lớn</h3>
                      <p className="card-desc">
                        Học trước Thánh Lễ gồm các lớp <strong>Vào Đời</strong>, <strong>Kinh Thánh</strong> và <strong>Phụng Vụ</strong>.
                      </p>
                    </div>
                    <span className="card-badge bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                      {CA_HOC[0].classesCount} Lớp · Học trước Lễ
                    </span>
                  </div>

                  {/* Thánh Lễ Trung Tâm */}
                  <div className="sched-timeline-card central-mass">
                    <div>
                      <div className="time-tag">
                        <Church size={17} /> 08:00 – 09:00
                      </div>
                      <h3 className="card-title">{CENTRAL_MASS.name}</h3>
                      <p className="card-desc">
                        Tâm điểm hiệp nhất tại <strong>{CENTRAL_MASS.location}</strong>. Toàn thể {TOTAL_CLASSES - 1} lớp và {TOTAL_TEACHERS} GLV quy tụ dâng Lễ.
                      </p>
                    </div>
                    <span className="card-badge bg-amber-100/80 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                      Trọng tâm đời sống Đức tin
                    </span>
                  </div>

                  {/* Ca 2 */}
                  <div className="sched-timeline-card">
                    <div>
                      <div className="time-tag">
                        <Clock size={16} /> 09:15 – 10:00
                      </div>
                      <h3 className="card-title">Ca 2: Khối Nhỏ</h3>
                      <p className="card-desc">
                        Học sau Thánh Lễ gồm các lớp <strong>Thêm Sức</strong>, <strong>Rước Lễ</strong>, <strong>Khai Tâm</strong> và <strong>Vườn Trẻ</strong>.
                      </p>
                    </div>
                    <span className="card-badge bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                      {CA_HOC[1].classesCount} Lớp · Học sau Lễ
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                  className="sched-chip active"
                  style={{ background: "var(--sched-accent)", color: "#fff" }}
                  onClick={() => setSelectedRoom(null)}
                  title="Bấm để huỷ lọc theo phòng"
                >
                  Phòng: {selectedRoom} <X size={13} />
                </button>
              )}

              {hasActiveFilters && (
                <button
                  type="button"
                  className="sched-chip text-stone-500 hover:text-red-600"
                  onClick={resetFilters}
                  style={{ marginLeft: "auto", borderStyle: "dashed" }}
                >
                  Đặt lại
                </button>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* ════ MAIN CONTENT: CARDS OR TABLE VIEW ════ */}
      <main className="sched-shell">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "18px" }}>
          <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">
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
            <AnimatePresence mode="popLayout">
              {filteredClasses.map((item) => (
                <motion.article
                  key={item.id}
                  initial={prefersReduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReduced ? false : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className={`sched-card card-nganh-${item.nganhId}`}
                >
                  {/* Tầng 1: Head - Nhãn Khối & Phòng học */}
                  <div className="sched-bento-head">
                    <span className="sched-bento-code">
                      <span className="sched-nganh-dot" aria-hidden="true" />
                      {item.khoiName}
                    </span>
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

                  {/* Tầng 4: Trọng tâm & Phân ban Ngành */}
                  <div className="sched-bento-focus">
                    <span className="sched-bento-focus-badge">
                      {NGANH_MAP[item.nganhId]?.name || item.khoiName} · {NGANH_MAP[item.nganhId]?.scarf || "HTDC"}
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
                </motion.article>
              ))}
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
                    <th scope="col">Đối Tượng</th>
                    <th scope="col">Phòng Học</th>
                    <th scope="col" style={{ textAlign: "right" }}>Trang Khối</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClasses.map((item, idx) => (
                    <tr key={item.id} className={`card-nganh-${item.nganhId}`}>
                      <td className="sched-table-col-num" style={{ color: "var(--sched-muted)", fontWeight: 600 }}>
                        {idx + 1}
                      </td>
                      <td>
                        <strong style={{ display: "block", fontSize: "13.5px" }}>{item.name}</strong>
                        <span className="sched-table-nganh-tag">
                          <span className="sched-nganh-dot" style={{ margin: 0, width: 5, height: 5 }} aria-hidden="true" />
                          {item.khoiName}
                        </span>
                      </td>
                      <td>
                        <span className="sched-ca-pill" style={{ display: "inline-flex", marginBottom: "3px" }}>
                          Ca {item.ca}
                        </span>
                        <div style={{ fontSize: "11.5px", color: "var(--sched-muted)", whiteSpace: "nowrap" }}>{item.time}</div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxWidth: "220px" }}>
                          {item.teachers.map((t, i) => (
                            <span key={i} className="sched-bento-teacher-pill">{t}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <span style={{ fontWeight: 700 }}>{item.ageText}</span>
                        <div style={{ fontSize: "11.5px", color: "var(--sched-muted)" }}>
                          {item.studentsCount ? `${item.studentsCount} em (${item.birthYear})` : <em style={{ color: "var(--sched-accent-text)" }}>Tuyển sinh ({item.birthYear})</em>}
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
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <Link to={item.path} className="sched-card-link">
                          Xem <ArrowUpRight size={13} aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* ════ CAMPUS ROOM DIRECTORY ════ */}
        <section className="sched-rooms-section" aria-labelledby="sched-rooms-title">
          <div className="sched-rooms-header">
            <span className="sched-eyebrow">CHỈ DẪN KHUÔN VIÊN GIÁO XỨ</span>
            <h2 id="sched-rooms-title" style={{ fontSize: "24px", marginTop: "4px" }}>
              Danh Mục &amp; Sơ Đồ <em>Phòng Học</em>
            </h2>
            <p style={{ fontSize: "13.5px", color: "var(--sched-muted)", marginTop: "4px" }}>
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
                    <DoorOpen size={16} className="text-amber-700 dark:text-amber-400" />
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
            <Info size={22} />
          </div>
          <div>
            <h3 style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>
              Lưu Ý Khi Đến Lớp Giáo Lý
            </h3>
            <ul style={{ fontSize: "13.5px", lineHeight: "1.7", color: "var(--sched-muted)", paddingLeft: "18px", margin: 0 }}>
              <li>
                Các em vui lòng có mặt trước giờ học <strong>10–15 phút</strong> để ổn định hàng ngũ, điểm danh và chuẩn bị tâm hồn.
              </li>
              <li>
                Mặc đồng phục Hùng Tâm Dũng Chí chỉnh tề, đeo khăn quàng đúng ngành (Khăn xanh chuối non cho Ngành Ấu, khăn vàng cho Kim Hoan...), mang đầy đủ Kinh Thánh, sách giáo lý và tập vở.
              </li>
              <li>
                Lịch học có thể điều chỉnh vào các dịp Lễ Trọng hoặc kỳ thi giáo lý. Phụ huynh vui lòng theo dõi thông báo trực tiếp từ Ban Giáo Lý.
              </li>
            </ul>
          </div>
        </div>

        {/* ════ CALL TO ACTION ════ */}
        <section className="sched-cta" aria-labelledby="sched-cta-title">
          <span className="sched-eyebrow">HÀNH TRÌNH ĐỨC TIN</span>
          <h2 id="sched-cta-title" style={{ fontSize: "28px", marginTop: "8px", marginBottom: "8px" }}>
            Chưa Tìm Thấy Lớp Hoặc Cần <em>Ghi Danh Mới?</em>
          </h2>
          <p style={{ fontSize: "15px", color: "var(--sched-muted)", maxWidth: "560px", margin: "0 auto" }}>
            Ban Tuyển Sinh Giáo Lý Giáo xứ An Ngãi luôn chào đón các em thiếu nhi mới đến độ tuổi đến lớp hoặc mới chuyển về giáo xứ.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap", marginTop: "20px" }}>
            <Link to="/tuyển-sinh" className="sched-cta-btn">
              Tìm hiểu tuyển sinh <ArrowUpRight size={17} />
            </Link>
            <Link
              to="/liên-hệ"
              className="sched-cta-btn"
              style={{ background: "transparent", border: "1px solid var(--sched-line)", color: "var(--sched-ink)" }}
            >
              Liên hệ Ban Giáo Lý
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}