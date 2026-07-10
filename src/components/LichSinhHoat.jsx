import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Calendar, Tent, BookOpen, Sparkles, Flame, Sun, Info } from "lucide-react";

/* ─── Hook phát hiện Mobile (reactive, SSR-safe) ─────────────── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    setIsMobile(mql.matches);
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

/* ─── Hook motion config ─────────────────────────────────────── */
function useMotionConfig() {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const reduced = prefersReducedMotion || isMobile;

  return {
    isMobile,
    reduced,
    yOffset:  reduced ? 8 : 24,
    duration: reduced ? 0.3 : 0.6,
    stagger:  reduced ? 0.04 : 0.08,
  };
}

/* ── Styles (Tích hợp Dark Mode) ── */
const KHOI_STYLE = {
  "Kinh Thánh": { 
    icon: BookOpen, 
    color: "text-amber-600 dark:text-amber-400", 
    bg: "bg-amber-50 dark:bg-amber-500/10", 
    border: "border-amber-200 dark:border-amber-500/20"  
  },
  "Vào Đời & Thêm Sức": { 
    icon: Flame, 
    color: "text-orange-600 dark:text-orange-400", 
    bg: "bg-orange-50 dark:bg-orange-500/10", 
    border: "border-orange-200 dark:border-orange-500/20" 
  },
  "Thêm Sức 1 & Rước Lễ Lần Đầu 1": { 
    icon: Sparkles, 
    color: "text-teal-600 dark:text-teal-400", 
    bg: "bg-teal-50 dark:bg-teal-500/10", 
    border: "border-teal-200 dark:border-teal-500/20" 
  },
};

const SESSION_TIME = "19h15 – 20h30";

const WEEKS = [
  {
    range: "07/06 – 13/06",
    days: [
      { date: "07/06", weekday: "Chúa Nhật", session: SESSION_TIME, khoi: "Thêm Sức 1 & Rước Lễ Lần Đầu 1" },
      { date: "09/06", weekday: "Thứ 3",     session: SESSION_TIME, khoi: "Vào Đời & Thêm Sức" },
      { date: "10/06", weekday: "Thứ 4",     session: SESSION_TIME, khoi: "Kinh Thánh" },
      { date: "11/06", weekday: "Thứ 5",     session: SESSION_TIME, khoi: "Vào Đời & Thêm Sức" },
      { date: "12/06", weekday: "Thứ 6",     session: SESSION_TIME, khoi: "Kinh Thánh" },
    ],
  },
  {
    range: "14/06 – 20/06",
    days: [
      { date: "14/06", weekday: "Chúa Nhật", session: SESSION_TIME, khoi: "Thêm Sức 1 & Rước Lễ Lần Đầu 1" },
      { date: "16/06", weekday: "Thứ 3",     session: SESSION_TIME, khoi: "Vào Đời & Thêm Sức" },
      { date: "17/06", weekday: "Thứ 4",     session: SESSION_TIME, khoi: "Kinh Thánh" },
      { date: "18/06", weekday: "Thứ 5",     session: SESSION_TIME, khoi: "Vào Đời & Thêm Sức" },
      { date: "19/06", weekday: "Thứ 6",     session: SESSION_TIME, khoi: "Kinh Thánh" },
    ],
  },
  {
    range: "21/06 – 27/06",
    days: [
      { date: "21/06", weekday: "Chúa Nhật", session: SESSION_TIME, khoi: "Thêm Sức 1 & Rước Lễ Lần Đầu 1" },
      { date: "23/06", weekday: "Thứ 3",     session: SESSION_TIME, khoi: "Vào Đời & Thêm Sức" },
      { date: "24/06", weekday: "Thứ 4",     session: SESSION_TIME, khoi: "Kinh Thánh" },
      { date: "25/06", weekday: "Thứ 5",     session: SESSION_TIME, khoi: "Vào Đời & Thêm Sức" },
      { date: "26/06", weekday: "Thứ 6",     session: SESSION_TIME, khoi: "Kinh Thánh" },
    ],
  },
  {
    range: "28/06 – 04/07",
    isLastBeforeCamp: true,
    days: [
      { date: "28/06", weekday: "Chúa Nhật", session: SESSION_TIME, khoi: "Thêm Sức 1 & Rước Lễ Lần Đầu 1" },
      { date: "30/06", weekday: "Thứ 3",     session: SESSION_TIME, khoi: "Vào Đời & Thêm Sức" },
      { date: "01/07", weekday: "Thứ 4",     session: SESSION_TIME, khoi: "Kinh Thánh" },
      { date: "02/07", weekday: "Thứ 5",     session: SESSION_TIME, khoi: "Vào Đời & Thêm Sức" },
      { date: "03/07", weekday: "Thứ 6",     session: SESSION_TIME, khoi: "Kinh Thánh" },
    ],
  },
];

/* ── Parse "DD/MM" → "MM/DD/YYYY" để so sánh với Date() ── */
function parseDayDate(dateStr) {
  const [d, m] = dateStr.split("/");
  const year = parseInt(m) >= 6 ? 2026 : 2027; // Giả định lịch năm 2026
  return new Date(year, parseInt(m) - 1, parseInt(d));
}

function isTodayDate(dateStr) {
  const today = new Date();
  const d = parseDayDate(dateStr);
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/* ── DayCard (Widget Style) ── */
function DayCard({ day }) {
  const style = KHOI_STYLE[day.khoi];
  const Icon = style.icon;
  const isToday = isTodayDate(day.date);

  return (
    <div
      className={`
        flex items-center gap-4 rounded-[1.5rem] border p-4 transition-all duration-300
        ${isToday
          ? "bg-stone-900 border-stone-800 text-white shadow-xl dark:bg-white dark:border-stone-200 dark:text-stone-900 scale-[1.02]"
          : `bg-white dark:bg-[#1c1c1e] border-stone-200/60 dark:border-stone-800/80 shadow-sm hover:shadow-md dark:shadow-none`
        }
      `}
    >
      <div className="flex-shrink-0 w-12 text-center">
        <p className={`text-[10px] font-bold uppercase tracking-wide mb-0.5 ${isToday ? "text-stone-400 dark:text-stone-500" : "text-stone-400 dark:text-stone-500"}`}>
          {day.weekday}
        </p>
        <p className={`text-xl font-extrabold tracking-tight ${isToday ? "text-white dark:text-stone-900" : "text-stone-800 dark:text-stone-100"}`}>
          {day.date}
        </p>
      </div>

      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isToday ? "bg-white/10 dark:bg-black/5" : style.bg} ${isToday ? "text-white dark:text-stone-900" : style.color}`}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={`text-[13px] font-bold leading-tight truncate ${isToday ? "text-white dark:text-stone-900" : "text-stone-900 dark:text-stone-100"}`}>
            {day.khoi}
          </p>
          {isToday && (
            <span className="flex-shrink-0 text-[10px] font-extrabold bg-blue-500 text-white dark:bg-blue-600 rounded-full px-2 py-0.5 leading-none uppercase tracking-wide">
              Hôm nay
            </span>
          )}
        </div>
        <p className={`text-[12px] font-medium ${isToday ? "text-stone-300 dark:text-stone-600" : "text-stone-500 dark:text-stone-400"}`}>
          {day.session}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ */
export default function LichSinhHoat() {
  const mc = useMotionConfig();

  /* Variants tính động theo mc */
  const fadeInUp = {
    hidden:  { opacity: 0, y: mc.yOffset },
    visible: { opacity: 1, y: 0, transition: { duration: mc.duration, ease: [0.16, 1, 0.3, 1] } },
  };

  const staggerContainer = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: mc.stagger } },
  };

  const vp = { once: true, margin: mc.isMobile ? "0px" : "-40px" };

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#09090b] text-stone-900 dark:text-stone-50 font-sans antialiased overflow-x-hidden selection:bg-amber-500/30 transition-colors duration-500">

      {/* ══ HERO ══ */}
      <header className="relative max-w-4xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-20 text-center overflow-hidden">
        {!mc.isMobile && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/10 dark:bg-amber-500/15 blur-[100px] rounded-full -z-10 pointer-events-none" />
        )}

        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 rounded-full mb-6 shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5" />
            Lịch sinh hoạt
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight text-stone-900 dark:text-stone-100 mb-5 leading-[1.08]"
          >
            Hành trình đến{" "}
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-500 bg-clip-text text-transparent">
              Ngày Hội Trại
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="max-w-lg mx-auto text-base text-stone-500 dark:text-stone-400 font-medium leading-relaxed">
            Bốn tuần sinh hoạt cùng nhau chuẩn bị tâm hồn và tinh thần, hướng tới ngày hội trại lớn.
          </motion.p>
        </motion.div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pb-24 space-y-16">

        {/* ══ HỘI TRẠI BANNER (Apple Widget Style) ══ */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          variants={fadeInUp}
        >
          <div className="relative bg-gradient-to-br from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700 rounded-[2rem] p-8 md:p-10 overflow-hidden text-center shadow-lg dark:shadow-none">
            {/* Abstract Background Elements */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-yellow-300/20 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-rose-500/20 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-[1.25rem] bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-6 shadow-sm border border-white/10">
                <Tent className="w-8 h-8 text-white" />
              </div>
              <p className="text-[12px] font-extrabold uppercase tracking-widest text-amber-100 mb-2">
                Hội Trại
              </p>
              <h2 className="font-extrabold tracking-tight text-3xl md:text-4xl text-white mb-4">
                Thứ Bảy, 04/07/2026
              </h2>
              <div className="inline-flex items-center gap-2 bg-black/15 backdrop-blur-sm border border-white/10 rounded-full px-5 py-2.5 mb-5">
                <Sun className="w-4 h-4 text-amber-200" />
                <p className="text-[13px] font-bold text-white tracking-wide">
                  Chủ đề: "Anh em là ánh sáng thế gian"
                </p>
              </div>
              <p className="text-[14px] text-amber-50 max-w-md mx-auto font-medium leading-relaxed opacity-90">
                Mt 5,14 — Ngày hội ngộ của tất cả các khối, cùng nhau sống tinh thần truyền giáo và lan tỏa ánh sáng Tin Mừng.
              </p>
            </div>
          </div>
        </motion.section>

        {/* ══ LEGEND ══ */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          variants={fadeInUp}
        >
          <div className="flex flex-wrap justify-center gap-2.5">
            {Object.entries(KHOI_STYLE).map(([name, style]) => {
              const Icon = style.icon;
              return (
                <span
                  key={name}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-bold border ${style.border} ${style.bg} ${style.color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {name}
                </span>
              );
            })}
          </div>
        </motion.section>

        {/* ══ TIMELINE 4 TUẦN ══ */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          variants={staggerContainer}
          className="space-y-12"
        >
          {WEEKS.map((week, idx) => (
            <motion.div key={week.range} variants={fadeInUp} className="relative">
              {/* Vertical Line for Desktop Timeline */}
              {!mc.isMobile && (
                <div className="absolute left-[1.15rem] top-12 bottom-0 w-0.5 bg-stone-200 dark:bg-stone-800/80 -z-10" />
              )}

              {/* Week header */}
              <div className="flex items-center gap-4 mb-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-[1rem] bg-stone-900 dark:bg-white text-white dark:text-stone-900 flex items-center justify-center text-sm font-extrabold shadow-sm">
                  {idx + 1}
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-0.5">Tuần {idx + 1}</p>
                  <h3 className="text-lg font-extrabold text-stone-900 dark:text-stone-100">{week.range}</h3>
                </div>
                {week.isLastBeforeCamp && (
                  <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-600 bg-orange-50 border border-orange-200 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/20 rounded-full px-3 py-1.5 uppercase tracking-wide">
                    <Tent className="w-3.5 h-3.5" />
                    Tuần hội trại
                  </span>
                )}
              </div>

              {/* Day cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:pl-[3.5rem]">
                {week.days.map((day) => (
                  <DayCard key={day.date} day={day} />
                ))}
              </div>
            </motion.div>
          ))}
        </motion.section>

        {/* ══ GHI CHÚ (Apple Info Box) ══ */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          variants={fadeInUp}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-[1.75rem] p-6 text-center sm:text-left">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Info className="w-5 h-5" />
            </div>
            <p className="text-[14px] text-stone-600 dark:text-stone-400 font-medium leading-relaxed pt-1">
              Lịch sinh hoạt có thể thay đổi tùy theo điều kiện thực tế. Vui lòng theo dõi thông báo cập nhật từ giáo lý viên phụ trách từng khối để nắm bắt thông tin nhanh nhất.
            </p>
          </div>
        </motion.section>
      </main>
    </div>
  );
}