import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays, Clock, MapPin, Users, ChevronRight,
  Heart, Star, BookOpen, Sparkles, Flame, Globe, GraduationCap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMotionConfig } from "../hooks/useMotionConfig";

const ACCENT   = "#92400e";
const ACCENT_L = "#fdf8f0";

/* ── Danh mục khối để filter ── */
const KHOI_LIST = [
  { id: "all",        label: "Tất cả" },
  { id: "chien-con",  label: "Chiên Con" },
  { id: "ruoc-le",    label: "Rước Lễ" },
  { id: "kinh-thanh", label: "Kinh Thánh" },
  { id: "phung-vu",   label: "Phụng Vụ" },
  { id: "them-suc",   label: "Thêm Sức" },
  { id: "vao-doi",    label: "Vào Đời" },
];

/* ── Màu + icon riêng cho từng khối (đồng bộ với các trang Khối) ── */
const KHOI_META = {
  "chien-con":  { icon: Heart,    color: "text-pink-600",   bg: "bg-pink-50",    border: "border-pink-100",   dot: "bg-pink-400" },
  "ruoc-le":    { icon: Star,     color: "text-lime-700",   bg: "bg-lime-50",    border: "border-lime-100",   dot: "bg-lime-500" },
  "kinh-thanh": { icon: BookOpen, color: "text-red-600",    bg: "bg-red-50",     border: "border-red-100",    dot: "bg-red-400" },
  "phung-vu":   { icon: Sparkles, color: "text-orange-600", bg: "bg-orange-50",  border: "border-orange-100", dot: "bg-orange-400" },
  "them-suc":   { icon: Flame,    color: "text-yellow-600", bg: "bg-yellow-50",  border: "border-yellow-100", dot: "bg-yellow-500" },
  "vao-doi":    { icon: Globe,    color: "text-amber-800",  bg: "bg-amber-50",   border: "border-amber-100",  dot: "bg-amber-700" },
};

/* ── Dữ liệu lịch học ── */
const SCHEDULE = [
  {
    khoi: "chien-con",
    name: "Khối Chiên Con",
    age: "Mầm non – Lớp 2",
    day: "Chủ Nhật",
    time: "07:00 – 08:00",
    room: "Phòng A1 – A2",
    teacher: "Cô Maria Nguyễn",
    path: "/khối-chiên-con",
  },
  {
    khoi: "ruoc-le",
    name: "Rước Lễ Lần Đầu",
    age: "Lớp 3 – 4",
    day: "Chủ Nhật",
    time: "08:15 – 09:30",
    room: "Phòng B1 – B2",
    teacher: "Anh Giuse Trần",
    path: "/khối-rước-lễ",
  },
  {
    khoi: "kinh-thanh",
    name: "Khối Kinh Thánh",
    age: "Lớp 3 – 5",
    day: "Chủ Nhật",
    time: "08:15 – 09:30",
    room: "Phòng C1 – C3",
    teacher: "Chị Anna Lê",
    path: "/khối-kinh-thánh",
  },
  {
    khoi: "phung-vu",
    name: "Khối Phụng Vụ",
    age: "Lớp 5 – 7",
    day: "Chủ Nhật",
    time: "08:15 – 09:30",
    room: "Phòng D1 – D2",
    teacher: "Thầy Phêrô Vũ",
    path: "/khối-phụng-vụ",
  },
  {
    khoi: "them-suc",
    name: "Khối Thêm Sức",
    age: "Lớp 8 – 10",
    day: "Chủ Nhật",
    time: "08:15 – 09:45",
    room: "Phòng E1 – E2",
    teacher: "Anh Phaolô Đặng",
    path: "/khối-thêm-sức",
  },
  {
    khoi: "vao-doi",
    name: "Khối Vào Đời",
    age: "Từ 18 tuổi",
    day: "Thứ Bảy",
    time: "19:00 – 20:30",
    room: "Hội trường Giáo xứ",
    teacher: "Anh Augustino Hồ",
    path: "/khối-vào-đời",
  },
];

/* ── Nhóm theo ngày để hiển thị dạng lịch tuần ── */
const DAYS = ["Thứ Bảy", "Chủ Nhật"];

export default function LichHoc() {
  const [activeKhoi, setActiveKhoi] = useState("all");
  const mc = useMotionConfig();
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
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 antialiased overflow-x-hidden selection:bg-amber-200 selection:text-amber-900">

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden pt-16 pb-14 md:pt-24 md:pb-20"
        style={{ background: `linear-gradient(160deg, ${ACCENT_L} 0%, #faf8f5 60%)` }}>
        {!mc.isMobile && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber-200/15 blur-[120px] rounded-full -z-10" />
        )}

        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <motion.div initial="hidden" animate="visible"
            variants={{ visible: { transition: { staggerChildren: mc.stagger } } }}>
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-5 bg-amber-100 text-amber-800">
                <CalendarDays className="w-3.5 h-3.5" />Lịch Học
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} custom={0.05}
              className="text-4xl md:text-6xl font-serif font-black tracking-tight text-stone-900 leading-[1.1] mb-4">
              Thời gian biểu<br />
              <span className="bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">
                các lớp giáo lý
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={0.1}
              className="text-base md:text-lg text-stone-500 leading-relaxed max-w-xl">
              Lịch sinh hoạt hàng tuần của tất cả các khối — kiểm tra giờ học, phòng học
              và giáo lý viên phụ trách trước khi đến lớp.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ══ FILTER TABS — sticky ══ */}
      <div className="sticky top-0 z-30 bg-[#faf8f5]/90 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-3"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
            {KHOI_LIST.map((k) => (
              <button key={k.id} onClick={() => setActiveKhoi(k.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                  activeKhoi === k.id ? "bg-stone-900 text-white shadow-sm" : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                }`}>
                {k.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-12 space-y-16">

        {/* ══ LỊCH TUẦN — nhóm theo ngày ══ */}
        <section>
          <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
            viewport={vp} transition={{ duration: mc.duration(0.6) }} className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
                <CalendarDays className="w-4 h-4" style={{ color: ACCENT }} />
              </div>
              <h2 className="text-xl font-bold text-stone-900">Lịch theo tuần</h2>
            </div>
            <p className="text-sm text-stone-500 ml-11">Tổng quan các lớp diễn ra trong tuần.</p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div key={activeKhoi} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid sm:grid-cols-2 gap-5">
              {DAYS.map((day) => {
                const classesOfDay = filtered.filter((s) => s.day === day);
                if (classesOfDay.length === 0) return null;
                return (
                  <div key={day} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-stone-100 bg-stone-50/60">
                      <h3 className="text-sm font-bold text-stone-800">{day}</h3>
                    </div>
                    <div className="divide-y divide-stone-100">
                      {classesOfDay
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((s) => {
                          const meta = KHOI_META[s.khoi];
                          const Icon = meta.icon;
                          return (
                            <Link key={s.khoi} to={s.path}
                              className="flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50 transition-colors group">
                              <span className={`w-1.5 h-8 rounded-full flex-shrink-0 ${meta.dot}`} />
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                                <Icon className={`w-4 h-4 ${meta.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-stone-900 truncate">{s.name}</p>
                                <p className="text-xs text-stone-400">{s.time} · {s.room}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                            </Link>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* ══ CHI TIẾT TỪNG KHỐI ══ */}
        <section>
          <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
            viewport={vp} transition={{ duration: mc.duration(0.6) }} className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-stone-600" />
              </div>
              <h2 className="text-xl font-bold text-stone-900">Chi tiết các lớp</h2>
            </div>
            <p className="text-sm text-stone-500 ml-11">Thông tin đầy đủ về độ tuổi, giáo lý viên và phòng học.</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {filtered.length > 0 ? (
              <motion.div key={activeKhoi + "-detail"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid sm:grid-cols-2 gap-4">
                {filtered.map((s, i) => {
                  const meta = KHOI_META[s.khoi];
                  const Icon = meta.icon;
                  return (
                    <motion.div key={s.khoi} initial={{ opacity: 0, y: mc.yOffset }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: mc.duration(0.4), delay: mc.delay(i * 0.06) }}>
                      <Link to={s.path}
                        className={`group flex flex-col h-full bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all active:scale-[0.98] ${meta.border}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.bg}`}>
                            <Icon className={`w-5 h-5 ${meta.color}`} />
                          </div>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                            {s.age}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-stone-900 mb-3">{s.name}</h3>

                        <div className="space-y-2 text-xs text-stone-500 mb-4">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{s.day}, {s.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{s.room}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{s.teacher}</span>
                          </div>
                        </div>

                        <div className="mt-auto flex items-center gap-1 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: ACCENT }}>
                          Xem chi tiết khối<ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-sm text-stone-400 py-8 text-center">Không có lớp nào trong mục này.</motion.p>
            )}
          </AnimatePresence>
        </section>

        {/* ══ LƯU Ý ══ */}
        <motion.section
          initial={{ opacity: 0, y: mc.yOffset }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: mc.duration(0.6) }}
          className="rounded-2xl border p-6"
          style={{ background: `${ACCENT}08`, borderColor: `${ACCENT}25` }}
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${ACCENT}18` }}>
              <Clock className="w-4 h-4" style={{ color: ACCENT }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 mb-1.5">Lưu ý khi đến lớp</h3>
              <ul className="text-sm text-stone-600 leading-relaxed space-y-1 list-disc list-inside">
                <li>Các em vui lòng có mặt trước giờ học 10–15 phút.</li>
                <li>Lịch học có thể thay đổi vào các lễ trọng — theo dõi thông báo trên Fanpage.</li>
                <li>Phụ huynh cần đăng ký trước khi cho con tham gia lớp mới.</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* ══ CTA ══ */}
        <motion.div
          initial={{ opacity: 0, y: mc.yOffset }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: mc.duration(0.6) }}
          className="text-center py-6"
        >
          <GraduationCap className="w-9 h-9 mx-auto mb-3" style={{ color: ACCENT }} />
          <h3 className="text-xl font-serif font-black text-stone-900 mb-2">Chưa đăng ký lớp nào?</h3>
          <p className="text-sm text-stone-500 mb-6 max-w-md mx-auto">
            Đăng ký ngay để con em được sắp xếp vào lớp phù hợp với độ tuổi.
          </p>
          <Link to="/tuyển-sinh"
            className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            style={{ background: ACCENT, boxShadow: `0 4px 16px ${ACCENT}40` }}>
            Đăng ký ngay<ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}