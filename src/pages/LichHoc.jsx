import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays, Clock, MapPin, Users, Search, X,
  LayoutGrid, ListFilter, GraduationCap, Sparkles,
  ArrowUpRight, ChevronRight, Info, Church, DoorOpen
} from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
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

export default function LichHoc() {
  const [selectedCa, setSelectedCa] = useState("all");
  const [selectedNganh, setSelectedNganh] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'table'

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
          <div className="sched-hero-copy">
            <div className="sched-hero-eyebrow">
              <span className="dot" aria-hidden="true" />
              <span className="sched-eyebrow">NIÊN KHÓA {ACADEMIC_YEAR} · XỨ ĐOÀN MẸ MÂN CÔI</span>
            </div>
            <h1 id="sched-hero-title">
              Thời Gian Biểu &<br />
              <em>Phân Công Lớp Học</em>
            </h1>
            <p className="sched-hero-desc">
              Bảng phân bố thời gian, phòng học và danh sách các anh chị Giáo lý viên &amp; Huynh trưởng phụ trách {TOTAL_CLASSES} lớp giáo lý của Giáo xứ An Ngãi.
            </p>
          </div>

          {/* Metric Stats Ribbon */}
          <div className="sched-stats-grid">
            <div className="sched-stat-pill">
              <div className="sched-stat-icon">
                <GraduationCap size={22} />
              </div>
              <div>
                <div className="sched-stat-value">{TOTAL_CLASSES} Lớp</div>
                <div className="sched-stat-label">Các khối giáo lý</div>
              </div>
            </div>

            <div className="sched-stat-pill">
              <div className="sched-stat-icon">
                <Users size={22} />
              </div>
              <div>
                <div className="sched-stat-value">{TOTAL_TEACHERS} GLV</div>
                <div className="sched-stat-label">Giáo lý viên &amp; Huynh trưởng</div>
              </div>
            </div>

            <div className="sched-stat-pill">
              <div className="sched-stat-icon">
                <Sparkles size={22} />
              </div>
              <div>
                <div className="sched-stat-value">{TOTAL_STUDENTS}</div>
                <div className="sched-stat-label">Đoàn sinh thiếu nhi</div>
              </div>
            </div>

            <div className="sched-stat-pill">
              <div className="sched-stat-icon">
                <Clock size={22} />
              </div>
              <div>
                <div className="sched-stat-value">2 Ca Học</div>
                <div className="sched-stat-label">Sáng Chúa Nhật</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ LITURGICAL TIMELINE STRIP ════ */}
      <section className="sched-timeline-section" aria-label="Nhịp cầu phụng vụ sáng Chúa Nhật">
        <div className="sched-shell">
          <div className="sched-timeline-container">
            <div className="sched-timeline-header">
              <div>
                <span className="sched-eyebrow">NHỊP CẦU PHỤNG VỤ CHÚA NHẬT</span>
                <h2 style={{ fontSize: "22px", marginTop: "4px" }}>
                  Mô hình <em>Học – Lễ – Học</em>
                </h2>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                Sáng Chúa Nhật hàng tuần
              </span>
            </div>

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
                  14 Lớp · 34 GLV
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
                    Tâm điểm hiệp nhất tại <strong>{CENTRAL_MASS.location}</strong>. Toàn thể 29 lớp và 70 GLV quy tụ dâng Lễ.
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
                  16 Lớp · 36 GLV
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ TOOLBAR / CONTROLS (STICKY) ════ */}
      <div className="sched-toolbar-sticky">
        <div className="sched-shell">
          <div className="sched-toolbar-row">
            {/* Shift Tabs */}
            <div className="sched-shift-tabs" role="tablist" aria-label="Chọn ca học">
              <button
                type="button"
                role="tab"
                aria-selected={selectedCa === "all"}
                className={`sched-shift-btn ${selectedCa === "all" ? "active" : ""}`}
                onClick={() => setSelectedCa("all")}
              >
                Tất cả ({TOTAL_CLASSES})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={selectedCa === "1"}
                className={`sched-shift-btn ${selectedCa === "1" ? "active" : ""}`}
                onClick={() => setSelectedCa("1")}
              >
                Ca 1 (7h00) <span className="opacity-70">({countCa1})</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={selectedCa === "2"}
                className={`sched-shift-btn ${selectedCa === "2" ? "active" : ""}`}
                onClick={() => setSelectedCa("2")}
              >
                Ca 2 (9h15) <span className="opacity-70">({countCa2})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="sched-search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên lớp, GLV, phòng học..."
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

            {/* View Mode Toggle */}
            <div className="sched-view-toggles" aria-label="Chế độ hiển thị">
              <button
                type="button"
                className={`sched-view-btn ${viewMode === "cards" ? "active" : ""}`}
                onClick={() => setViewMode("cards")}
                title="Dạng Thẻ"
                aria-label="Dạng Thẻ"
              >
                <LayoutGrid size={17} />
              </button>
              <button
                type="button"
                className={`sched-view-btn ${viewMode === "table" ? "active" : ""}`}
                onClick={() => setViewMode("table")}
                title="Dạng Bảng"
                aria-label="Dạng Bảng"
              >
                <ListFilter size={17} />
              </button>
            </div>
          </div>

          {/* Secondary Filter: Ngành chips & Room active tag */}
          <div className="sched-chips-row" style={{ marginTop: "10px" }}>
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
          <div className="text-center py-20 bg-white/60 dark:bg-stone-900/40 rounded-3xl border border-stone-200 dark:border-stone-800 p-8">
            <GraduationCap size={44} className="mx-auto text-stone-400 mb-3" />
            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200 font-serif mb-1">
              Không tìm thấy lớp học nào
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-5 max-w-sm mx-auto">
              Không có kết quả phù hợp với từ khóa "{searchQuery}". Vui lòng thử tìm kiếm khác hoặc đặt lại bộ lọc.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-900 text-amber-50 dark:bg-amber-600 hover:opacity-90 transition"
            >
              Đặt lại tất cả bộ lọc
            </button>
          </div>
        ) : viewMode === "cards" ? (
          /* ── DẠNG THẺ (CARD VIEW) ── */
          <div className="sched-cards-grid">
            <AnimatePresence mode="popLayout">
              {filteredClasses.map((item) => (
                <motion.article
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="sched-card"
                >
                  <div>
                    <div className="sched-card-top">
                      <span className={`sched-card-ca-badge ${item.ca === 1 ? "ca-1" : "ca-2"}`}>
                        <Clock size={12} /> Ca {item.ca}
                      </span>
                      <button
                        type="button"
                        className="sched-card-room-badge"
                        onClick={() => setSelectedRoom(selectedRoom === item.room ? null : item.room)}
                        title={`Lọc các lớp học tại phòng ${item.room}`}
                      >
                        <MapPin size={13} className="text-amber-700 dark:text-amber-400" />
                        <span>{item.room}</span>
                      </button>
                    </div>

                    <h3 className="sched-card-title">{item.name}</h3>
                    <div className="sched-card-subtitle">
                      <span>{item.khoiName}</span>
                      <span>·</span>
                      <span>Sinh năm {item.birthYear}</span>
                    </div>

                    <div className="sched-card-meta-list">
                      <div className="sched-card-meta-item">
                        <span className="sched-card-meta-label">
                          <Users size={14} /> GLV Phụ trách
                        </span>
                        <div className="sched-teachers-wrap">
                          {item.teachers.map((t, idx) => (
                            <span key={idx} className="sched-teacher-tag">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="sched-card-meta-item">
                        <span className="sched-card-meta-label">
                          <GraduationCap size={14} /> Sĩ số &amp; Độ tuổi
                        </span>
                        <span className="sched-card-meta-value">
                          {item.studentsCount ? (
                            <span>{item.studentsCount} học sinh · {item.ageText}</span>
                          ) : (
                            <span className="text-amber-700 dark:text-amber-400 italic">Đang tuyển sinh</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="sched-card-footer">
                    <span className="sched-card-time">
                      <CalendarDays size={14} /> {item.time}
                    </span>
                    <Link to={item.path} className="sched-card-link">
                      Chi tiết khối <ChevronRight size={14} />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* ── DẠNG BẢNG (TABLE VIEW) ── */
          <div className="sched-table-wrapper">
            <div className="sched-table-scroll">
              <table className="sched-table">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: "50px", textAlign: "center" }}>STT</th>
                    <th scope="col">Lớp Học</th>
                    <th scope="col">Ca &amp; Giờ</th>
                    <th scope="col">Giáo Lý Viên Phụ Trách</th>
                    <th scope="col" style={{ textAlign: "center" }}>Sĩ Số</th>
                    <th scope="col" style={{ textAlign: "center" }}>Năm Sinh</th>
                    <th scope="col">Phòng Học</th>
                    <th scope="col" style={{ textAlign: "right" }}>Trang Khối</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClasses.map((item) => (
                    <tr key={item.id}>
                      <td style={{ textAlign: "center", fontWeight: "600", color: "var(--sched-muted)" }}>
                        {item.stt}
                      </td>
                      <td>
                        <strong style={{ display: "block", fontSize: "14px" }}>{item.name}</strong>
                        <span style={{ fontSize: "12px", color: "var(--sched-muted)" }}>{item.khoiName}</span>
                      </td>
                      <td>
                        <span
                          className={`sched-card-ca-badge ${item.ca === 1 ? "ca-1" : "ca-2"}`}
                          style={{ marginBottom: "3px", display: "inline-block" }}
                        >
                          Ca {item.ca}
                        </span>
                        <div style={{ fontSize: "12px", color: "var(--sched-muted)" }}>{item.time}</div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                          {item.teachers.map((t, idx) => (
                            <span key={idx} className="sched-teacher-tag">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ textAlign: "center", fontWeight: "700" }}>
                        {item.studentsCount ? (
                          item.studentsCount
                        ) : (
                          <span style={{ fontSize: "12px", color: "var(--sched-accent)", fontStyle: "italic" }}>
                            Tuyển sinh
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "center", color: "var(--sched-muted)" }}>
                        {item.birthYear}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="sched-card-room-badge"
                          onClick={() => setSelectedRoom(selectedRoom === item.room ? null : item.room)}
                          title="Bấm để lọc theo phòng này"
                        >
                          <MapPin size={12} className="text-amber-700 dark:text-amber-400" />
                          <span>{item.room}</span>
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Link to={item.path} className="sched-card-link">
                          Xem <ArrowUpRight size={13} />
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