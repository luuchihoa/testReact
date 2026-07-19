import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Calendar, Tent, BookOpen, Sparkles, Flame, Sun, Info } from "lucide-react";

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

function useMotionConfig() {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const reduced = prefersReducedMotion || isMobile;
  return { isMobile, reduced, yOffset: reduced ? 8 : 24, duration: reduced ? 0.3 : 0.6, stagger: reduced ? 0.04 : 0.08 };
}

const KHOI_STYLE = {
  "Kinh Thánh":                    { icon: BookOpen, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200/60 dark:border-amber-500/20" },
  "Vào Đời & Thêm Sức":           { icon: Flame,    color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/10", border: "border-orange-200/60 dark:border-orange-500/20" },
  "Thêm Sức 1 & Rước Lễ Lần Đầu 1": { icon: Sparkles, color: "text-stone-700 dark:text-stone-400", bg: "bg-stone-100 dark:bg-stone-500/10", border: "border-stone-200/60 dark:border-stone-500/20" },
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

function parseDayDate(dateStr) {
  const [d, m] = dateStr.split("/");
  const year = parseInt(m) >= 6 ? 2026 : 2027; 
  return new Date(year, parseInt(m) - 1, parseInt(d));
}

function isTodayDate(dateStr) {
  const today = new Date();
  const d = parseDayDate(dateStr);
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
}

function DayCard({ day }) {
  const style = KHOI_STYLE[day.khoi];
  const Icon = style.icon;
  const isToday = isTodayDate(day.date);

  return (
    <div
      className={`
        flex items-center gap-4 rounded-[1.5rem] border p-4 transition-all duration-300 backdrop-blur-sm
        ${isToday
          ? "bg-amber-900 border-amber-950 text-amber-50 shadow-xl dark:bg-amber-100 dark:border-amber-200 dark:text-amber-950 scale-[1.02]"
          : `bg-white/90 dark:bg-stone-800/50 border-amber-900/10 dark:border-amber-100/10 shadow-sm hover:shadow-md dark:shadow-none`
        }
      `}
    >
      <div className="flex-shrink-0 w-12 text-center">
        <p className={`text-[10px] font-bold uppercase tracking-wide mb-0.5 ${isToday ? "text-amber-300 dark:text-amber-700" : "text-stone-400 dark:text-stone-500"}`}>
          {day.weekday}
        </p>
        <p className={`text-xl font-extrabold tracking-tight ${isToday ? "text-amber-50 dark:text-amber-950" : "text-stone-800 dark:text-stone-100"}`}>
          {day.date}
        </p>
      </div>

      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isToday ? "bg-white/20 dark:bg-black/10 text-white dark:text-stone-900" : `${style.bg} ${style.color}`}`}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={`text-[13px] font-bold leading-tight truncate ${isToday ? "text-amber-50 dark:text-amber-950" : "text-stone-900 dark:text-stone-100"}`}>
            {day.khoi}
          </p>
          {isToday && (
            <span className="flex-shrink-0 text-[10px] font-extrabold bg-amber-500 text-stone-950 dark:bg-amber-600 dark:text-white rounded-full px-2 py-0.5 leading-none uppercase tracking-wide">
              Hôm nay
            </span>
          )}
        </div>
        <p className={`text-[12px] font-medium ${isToday ? "text-amber-200 dark:text-amber-800" : "text-stone-500 dark:text-stone-400"}`}>
          {day.session}
        </p>
      </div>
    </div>
  );
}

export default function LichSinhHoat() {
  const mc = useMotionConfig();

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
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917] text-stone-800 dark:text-stone-200 font-sans antialiased overflow-x-hidden selection:bg-amber-500/30 transition-colors duration-500">

      {/* ══ HERO ══ */}
      <header className="relative max-w-4xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-20 text-center overflow-hidden">
        {!mc.isMobile && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-200/40 dark:bg-amber-900/20 blur-[100px] rounded-full -z-10 pointer-events-none" />
        )}

        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50 rounded-full mb-6 shadow-sm">
            <Calendar className="w-3.5 h-3.5" /> Lịch sinh hoạt
          </motion.div>

          <motion.h1 variants={fadeInUp} className="font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight text-amber-950 dark:text-amber-50 mb-5 leading-[1.08] font-serif">
            Hành trình đến{" "}
            <span className="bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-600 bg-clip-text text-transparent italic font-serif">
              Ngày Hội Trại
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="max-w-lg mx-auto text-base text-stone-600 dark:text-stone-400 font-medium leading-relaxed">
            Bốn tuần sinh hoạt cùng nhau chuẩn bị tâm hồn và tinh thần, hướng tới ngày hội trại lớn.
          </motion.p>
        </motion.div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pb-24 space-y-16">

        {/* ══ HỘI TRẠI BANNER ══ */}
        <motion.section initial="hidden" whileInView="visible" viewport={vp} variants={fadeInUp}>
          <div className="relative bg-gradient-to-br from-amber-800 to-amber-950 dark:from-amber-700 dark:to-amber-900 rounded-[2rem] p-8 md:p-10 overflow-hidden text-center shadow-lg">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-amber-400/20 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-500/20 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-[1.25rem] bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-6 shadow-sm border border-white/10">
                <Tent className="w-8 h-8 text-amber-100" />
              </div>
              <p className="text-[12px] font-extrabold uppercase tracking-widest text-amber-200/80 mb-2">Hội Trại</p>
              <h2 className="font-extrabold tracking-tight text-3xl md:text-4xl text-amber-50 mb-4 font-serif">Thứ Bảy, 04/07/2026</h2>
              <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-sm border border-white/10 rounded-full px-5 py-2.5 mb-5">
                <Sun className="w-4 h-4 text-amber-300" />
                <p className="text-[13px] font-bold text-amber-50 tracking-wide">Chủ đề: "Anh em là ánh sáng thế gian"</p>
              </div>
              <p className="text-[14px] text-amber-100/90 max-w-md mx-auto font-medium leading-relaxed">
                Mt 5,14 — Ngày hội ngộ của tất cả các khối, cùng nhau sống tinh thần truyền giáo và lan tỏa ánh sáng Tin Mừng.
              </p>
            </div>
          </div>
        </motion.section>

        {/* ══ LEGEND ══ */}
        <motion.section initial="hidden" whileInView="visible" viewport={vp} variants={fadeInUp}>
          <div className="flex flex-wrap justify-center gap-2.5">
            {Object.entries(KHOI_STYLE).map(([name, style]) => {
              const Icon = style.icon;
              return (
                <span key={name} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-bold border bg-white/80 dark:bg-stone-800/40 backdrop-blur-sm ${style.border} ${style.color}`}>
                  <Icon className="w-3.5 h-3.5" /> {name}
                </span>
              );
            })}
          </div>
        </motion.section>

        {/* ══ TIMELINE 4 TUẦN ══ */}
        <motion.section initial="hidden" whileInView="visible" viewport={vp} variants={staggerContainer} className="space-y-12">
          {WEEKS.map((week, idx) => (
            <motion.div key={week.range} variants={fadeInUp} className="relative">
              {!mc.isMobile && <div className="absolute left-[1.15rem] top-12 bottom-0 w-px bg-amber-900/10 dark:bg-amber-100/10 -z-10" />}

              <div className="flex items-center gap-4 mb-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-[1rem] bg-amber-900 dark:bg-amber-100 text-amber-50 dark:text-amber-950 flex items-center justify-center text-sm font-extrabold shadow-sm">
                  {idx + 1}
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-amber-800/70 dark:text-amber-400/70 mb-0.5">Tuần {idx + 1}</p>
                  <h3 className="text-lg font-extrabold text-amber-950 dark:text-amber-50 font-serif">{week.range}</h3>
                </div>
                {week.isLastBeforeCamp && (
                  <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-100/50 border border-amber-500/30 dark:text-amber-300 dark:bg-amber-900/30 dark:border-amber-500/30 rounded-full px-3 py-1.5 uppercase tracking-wide">
                    <Tent className="w-3.5 h-3.5" /> Tuần hội trại
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:pl-[3.5rem]">
                {week.days.map((day) => <DayCard key={day.date} day={day} />)}
              </div>
            </motion.div>
          ))}
        </motion.section>

        {/* ══ GHI CHÚ ══ */}
        <motion.section initial="hidden" whileInView="visible" viewport={vp} variants={fadeInUp}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/30 rounded-[1.75rem] p-6 text-center sm:text-left backdrop-blur-sm">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-200/50 dark:bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400">
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