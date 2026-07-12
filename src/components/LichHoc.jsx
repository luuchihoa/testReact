import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays, MapPin, Users, ChevronRight,
  Heart, Church, BookOpen, Sparkles, Flame, Globe, GraduationCap, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMotionConfig } from "../hooks/useMotionConfig";

const KHOI_LIST = [
  { id: "all",        label: "Tất cả" },
  { id: "chien-con",  label: "Chiên Con" },
  { id: "ruoc-le",    label: "Rước Lễ" },
  { id: "them-suc",   label: "Thêm Sức" },
  { id: "phung-vu",   label: "Phụng Vụ" },
  { id: "kinh-thanh", label: "Kinh Thánh" },
  { id: "vao-doi",    label: "Vào Đời" },
];

const KHOI_META = {
  "chien-con":  { icon: Heart,    color: "text-rose-600 dark:text-rose-400",     bg: "bg-rose-50 dark:bg-rose-500/10",      border: "border-rose-100 dark:border-rose-500/20" },
  "ruoc-le":    { icon: Sparkles, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-500/10",  border: "border-yellow-100 dark:border-yellow-500/20" },
  "them-suc":   { icon: Flame,    color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-500/10",    border: "border-amber-100 dark:border-amber-500/20" },
  "phung-vu":   { icon: Church,   color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/10",  border: "border-orange-100 dark:border-orange-500/20" },
  "kinh-thanh": { icon: BookOpen, color: "text-stone-600 dark:text-stone-400",   bg: "bg-stone-100 dark:bg-stone-500/10",   border: "border-stone-200 dark:border-stone-500/20" },
  "vao-doi":    { icon: Globe,    color: "text-red-600 dark:text-red-400",       bg: "bg-red-50 dark:bg-red-500/10",        border: "border-red-100 dark:border-red-500/20" },
};

const SCHEDULE = [
  { khoi: "chien-con",  name: "Khối Chiên Con",    age: "Lớp 1 – 2",    day: "Chủ Nhật", time: "07:00 – 08:00", room: "Phòng A1 – A2",       teacher: "Cô Maria Nguyễn",    path: "/khối-chiên-con" },
  { khoi: "ruoc-le",    name: "Rước Lễ Lần Đầu",   age: "Lớp 3 – 4",    day: "Chủ Nhật", time: "08:15 – 09:30", room: "Phòng B1 – B2",       teacher: "Anh Giuse Trần",     path: "/khối-rước-lễ" },
  { khoi: "them-suc",   name: "Khối Thêm Sức",     age: "Lớp 5 – 6",    day: "Chủ Nhật", time: "08:15 – 09:45", room: "Phòng E1 – E2",       teacher: "Anh Phaolô Đặng",    path: "/khối-thêm-sức" },
  { khoi: "phung-vu",   name: "Khối Phụng Vụ",     age: "Lớp 7",        day: "Chủ Nhật", time: "08:15 – 09:30", room: "Phòng D1 – D2",       teacher: "Thầy Phêrô Vũ",      path: "/khối-phụng-vụ" },
  { khoi: "kinh-thanh", name: "Khối Kinh Thánh",   age: "Lớp 8 – 9",    day: "Chủ Nhật", time: "08:15 – 09:30", room: "Phòng C1 – C3",       teacher: "Chị Anna Lê",        path: "/khối-kinh-thánh" },
  { khoi: "vao-doi",    name: "Khối Vào Đời",      age: "Lớp 10 – 11",  day: "Thứ Bảy",  time: "19:00 – 20:30", room: "Hội trường Giáo xứ",  teacher: "Anh Augustino Hồ",   path: "/khối-vào-đời" },
];

const DAYS = ["Thứ Bảy", "Chủ Nhật"];

export default function LichHoc() {
  const [activeKhoi, setActiveKhoi] = useState("all");
  
  const mc = useMotionConfig() || {
    yOffset: 30, duration: (d) => d || 0.6, delay: (d) => d || 0,
    stagger: 0.08, isMobile: false, vp: () => ({ once: true, margin: "-12% 0px" })
  };
  const vp = mc.vp();

  const fadeUp = {
    hidden: { opacity: 0, y: mc.yOffset },
    visible: (d = 0) => ({
      opacity: 1, y: 0,
      transition: { duration: mc.duration(0.7), ease: [0.16, 1, 0.3, 1], delay: mc.delay(d) },
    }),
  };

  const filtered = SCHEDULE.filter((s) => activeKhoi === "all" || s.khoi === activeKhoi);

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917] text-stone-800 dark:text-stone-200 antialiased overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-950 dark:selection:text-amber-50 transition-colors duration-500 font-sans">

      {/* ══ HERO SECTION ══ */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-200/40 dark:bg-amber-900/20 blur-[100px] rounded-full -z-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: mc.stagger } } }}>
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-6 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50">
                <CalendarDays className="w-3.5 h-3.5" /> Lịch Học
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} custom={0.05}
              className="text-4xl md:text-6xl font-extrabold tracking-tight text-amber-950 dark:text-amber-50 leading-[1.08] mb-5 font-serif">
              Thời gian biểu<br />
              <span className="bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-600 bg-clip-text text-transparent italic font-serif">
                các lớp giáo lý
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={0.1}
              className="text-base md:text-lg text-stone-600 dark:text-stone-400 leading-relaxed max-w-xl font-medium">
              Lịch sinh hoạt hàng tuần của tất cả các khối — kiểm tra giờ học, phòng học và giáo lý viên phụ trách trước khi đến lớp.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ══ FILTER TABS ══ */}
      <div className="sticky top-0 z-40 bg-[#FDFBF7]/80 dark:bg-[#1C1917]/80 backdrop-blur-xl border-b border-amber-900/10 dark:border-amber-100/10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-none snap-x snap-mandatory" style={{ WebkitOverflowScrolling: "touch" }}>
            {KHOI_LIST.map((k) => (
              <button key={k.id} onClick={() => setActiveKhoi(k.id)}
                className={`snap-center flex-shrink-0 px-5 py-2 rounded-full text-[13px] font-bold transition-all duration-300 active:scale-95 ${
                  activeKhoi === k.id 
                  ? "bg-amber-900 text-amber-50 dark:bg-amber-100 dark:text-amber-950 shadow-sm border border-transparent" 
                  : "text-stone-600 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-stone-800/80 bg-white/50 dark:bg-stone-800/50 border border-amber-900/5 dark:border-amber-100/5"
                }`}>
                {k.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 md:py-16 space-y-20">

        {/* ══ LỊCH TUẦN ══ */}
        <section>
          <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }} viewport={vp} transition={{ duration: mc.duration(0.6) }} className="mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-amber-950 dark:text-amber-50 font-serif">Lịch theo tuần</h2>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mt-1">Tổng quan các lớp diễn ra trong tuần.</p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div key={activeKhoi} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid lg:grid-cols-2 gap-8">
              {DAYS.map((day) => {
                const classesOfDay = filtered.filter((s) => s.day === day);
                if (classesOfDay.length === 0) return null;
                return (
                  <div key={day} className="flex flex-col">
                    <h3 className="text-[13px] font-bold uppercase tracking-widest text-amber-800/70 dark:text-amber-400/70 mb-3 ml-2">
                      {day}
                    </h3>
                    <div className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-sm rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-amber-900/10 dark:border-amber-100/10 overflow-hidden flex flex-col">
                      <div className="divide-y divide-amber-900/5 dark:divide-amber-100/5">
                        {classesOfDay.map((s) => {
                            const meta = KHOI_META[s.khoi];
                            const Icon = meta.icon;
                            return (
                              <Link key={s.khoi} to={s.path} className="flex items-center gap-4 p-4 md:p-5 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors group active:bg-amber-100/50 dark:active:bg-amber-900/20">
                                <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                                  <Icon className={`w-5 h-5 ${meta.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-base font-bold text-stone-900 dark:text-stone-100 truncate">{s.name}</p>
                                  <p className="text-[13px] font-medium text-stone-500 dark:text-stone-400 mt-0.5">{s.time} · {s.room}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-stone-300 dark:text-stone-600 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex-shrink-0" />
                              </Link>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* ══ CHI TIẾT TỪNG KHỐI ══ */}
        <section>
          <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }} viewport={vp} transition={{ duration: mc.duration(0.6) }} className="mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-amber-950 dark:text-amber-50 font-serif">Chi tiết các lớp</h2>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mt-1">Thông tin đầy đủ về độ tuổi, giáo lý viên và phòng học.</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {filtered.length > 0 ? (
              <motion.div key={activeKhoi + "-detail"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((s, i) => {
                  const meta = KHOI_META[s.khoi];
                  const Icon = meta.icon;
                  return (
                    <motion.div key={s.khoi} initial={{ opacity: 0, y: mc.yOffset }} animate={{ opacity: 1, y: 0 }} transition={{ duration: mc.duration(0.4), delay: mc.delay(i * 0.06) }}>
                      <Link to={s.path} className={`group flex flex-col h-full bg-white/90 dark:bg-stone-800/50 backdrop-blur-sm rounded-[1.75rem] border border-amber-900/10 dark:border-amber-100/10 p-6 shadow-sm hover:shadow-md hover:border-amber-900/20 dark:hover:border-amber-100/20 transition-all duration-300 active:scale-[0.97]`}>
                        <div className="flex items-start justify-between mb-5">
                          <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center ${meta.bg}`}>
                            <Icon className={`w-6 h-6 ${meta.color}`} />
                          </div>
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide border ${meta.border} ${meta.bg} ${meta.color}`}>
                            {s.age}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-amber-950 dark:text-amber-50 mb-4">{s.name}</h3>
                        <div className="space-y-3 text-[13px] font-medium text-stone-600 dark:text-stone-400 mb-6">
                          <div className="flex items-center gap-3"><CalendarDays className="w-4 h-4 text-amber-900/40 dark:text-amber-100/40 flex-shrink-0" /><span>{s.day}, {s.time}</span></div>
                          <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-amber-900/40 dark:text-amber-100/40 flex-shrink-0" /><span>{s.room}</span></div>
                          <div className="flex items-center gap-3"><Users className="w-4 h-4 text-amber-900/40 dark:text-amber-100/40 flex-shrink-0" /><span>{s.teacher}</span></div>
                        </div>
                        <div className="mt-auto flex items-center gap-1.5 text-[13px] font-bold text-amber-700 dark:text-amber-400 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all">
                          Xem chi tiết <ChevronRight className="w-4 h-4" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium text-stone-400 py-12 text-center">Không có lớp nào trong mục này.</motion.p>
            )}
          </AnimatePresence>
        </section>

        {/* ══ LƯU Ý ══ */}
        <motion.section initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }} viewport={vp} transition={{ duration: mc.duration(0.6) }}
          className="bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/30 rounded-[2rem] p-6 sm:p-8 backdrop-blur-sm"
        >
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center flex-shrink-0 bg-amber-200/50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-950 dark:text-amber-50 mb-2 font-serif">Lưu ý khi đến lớp</h3>
              <ul className="text-[14px] font-medium text-stone-600 dark:text-stone-400 leading-relaxed space-y-2 list-disc list-inside">
                <li>Các em vui lòng có mặt trước giờ học <strong className="text-amber-900 dark:text-amber-200">10–15 phút</strong>.</li>
                <li>Lịch học có thể thay đổi vào các lễ trọng — vui lòng theo dõi thông báo trên Fanpage.</li>
                <li>Phụ huynh cần hoàn tất đăng ký ghi danh trước khi cho con tham gia lớp mới.</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* ══ CTA SECTION ══ */}
        <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }} viewport={vp} transition={{ duration: mc.duration(0.6) }} className="text-center py-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-white dark:bg-stone-800 shadow-sm border border-amber-900/10 dark:border-amber-100/10 mb-6">
            <GraduationCap className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-950 dark:text-amber-50 mb-3 font-serif">Chưa đăng ký lớp nào?</h3>
          <p className="text-base font-medium text-stone-600 dark:text-stone-400 mb-8 max-w-md mx-auto">
            Ghi danh ngay để các em được sắp xếp vào lớp phù hợp với độ tuổi và lộ trình Đức tin.
          </p>
          <Link to="/tuyển-sinh"
            className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-full text-[15px] font-bold text-amber-50 bg-amber-900 hover:bg-amber-950 dark:bg-amber-600 dark:hover:bg-amber-500 shadow-sm active:scale-[0.97] transition-all duration-300">
            Đăng ký ngay <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}