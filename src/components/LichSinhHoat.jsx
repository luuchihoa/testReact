import React from "react";
import { motion } from "framer-motion";
import { Calendar, Tent, BookOpen, Sparkles, Flame, Sun } from "lucide-react";

// Tách biệt cấu hình thiết bị để tối ưu hóa quỹ đạo chuyển động
const isMobileDevice = typeof window !== "undefined" && /Mobi|Android|iPhone/i.test(navigator.userAgent);

const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: isMobileDevice ? 8 : 20 // Giảm biên độ di chuyển trên mobile để giảm tải tính toán pixel cho CPU
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: isMobileDevice ? 0.35 : 0.5, // Rút ngắn thời gian trên mobile để tạo cảm giác mượt và phản hồi nhanh hơn
      ease: "easeOut" 
    } 
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: isMobileDevice ? 0.05 : 0.08 } }, // Giảm độ trễ so le trên mobile để dựng UI nhanh hơn
};

const KHOI_STYLE = {
  "Kinh Thánh": { icon: BookOpen, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  "Vào Đời & Thêm Sức": { icon: Flame, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
  "Thêm Sức 1 & Rước Lễ Lần Đầu 1": { icon: Sparkles, color: "text-teal-700", bg: "bg-teal-50", border: "border-teal-200" },
};

const SESSION_TIME = "19h15 – 20h30";

const WEEKS = [
  {
    range: "07/06 – 13/06",
    days: [
      { date: "07/06", weekday: "Chúa Nhật", session: SESSION_TIME, khoi: "Thêm Sức 1 & Rước Lễ Lần Đầu 1" },
      { date: "09/06", weekday: "Thứ 3", session: SESSION_TIME, khoi: "Vào Đời & Thêm Sức" },
      { date: "10/06", weekday: "Thứ 4", session: SESSION_TIME, khoi: "Kinh Thánh" },
      { date: "11/06", weekday: "Thứ 5", session: SESSION_TIME, khoi: "Vào Đời & Thêm Sức" },
      { date: "12/06", weekday: "Thứ 6", session: SESSION_TIME, khoi: "Kinh Thánh" },
    ],
  },
  {
    range: "14/06 – 20/06",
    days: [
      { date: "14/06", weekday: "Chúa Nhật", session: SESSION_TIME, khoi: "Thêm Sức 1 & Rước Lễ Lần Đầu 1" },
      { date: "16/06", weekday: "Thứ 3", session: SESSION_TIME, khoi: "Vào Đời & Thêm Sức" },
      { date: "17/06", weekday: "Thứ 4", session: SESSION_TIME, khoi: "Kinh Thánh" },
      { date: "18/06", weekday: "Thứ 5", session: SESSION_TIME, khoi: "Vào Đời & Thêm Sức" },
      { date: "19/06", weekday: "Thứ 6", session: SESSION_TIME, khoi: "Kinh Thánh" },
    ],
  },
  {
    range: "21/06 – 27/06",
    days: [
      { date: "21/06", weekday: "Chúa Nhật", session: SESSION_TIME, khoi: "Thêm Sức 1 & Rước Lễ Lần Đầu 1" },
      { date: "23/06", weekday: "Thứ 3", session: SESSION_TIME, khoi: "Vào Đời & Thêm Sức" },
      { date: "24/06", weekday: "Thứ 4", session: SESSION_TIME, khoi: "Kinh Thánh" },
      { date: "25/06", weekday: "Thứ 5", session: SESSION_TIME, khoi: "Vào Đời & Thêm Sức" },
      { date: "26/06", weekday: "Thứ 6", session: SESSION_TIME, khoi: "Kinh Thánh" },
    ],
  },
  {
    range: "28/06 – 04/07",
    days: [
      { date: "28/06", weekday: "Chúa Nhật", session: SESSION_TIME, khoi: "Thêm Sức 1 & Rước Lễ Lần Đầu 1" },
      { date: "30/06", weekday: "Thứ 3", session: SESSION_TIME, khoi: "Vào Đời & Thêm Sức" },
      { date: "01/07", weekday: "Thứ 4", session: SESSION_TIME, khoi: "Kinh Thánh" },
      { date: "02/07", weekday: "Thứ 5", session: SESSION_TIME, khoi: "Vào Đời & Thêm Sức" },
      { date: "03/07", weekday: "Thứ 6", session: SESSION_TIME, khoi: "Kinh Thánh" },
    ],
    isLastBeforeCamp: true,
  },
];

function DayCard({ day }) {
  const style = KHOI_STYLE[day.khoi];
  const Icon = style.icon;
  return (
    // ⚡ TỐI ƯU GPU: Ép từng thẻ Card tạo compositing layer riêng trên GPU bằng transform-gpu và will-change
    <div className={`flex items-center gap-3.5 rounded-2xl border ${style.border} ${style.bg} px-4 py-3 transform-gpu will-change-transform`}>
      <div className="flex-shrink-0 w-12 text-center">
        <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">{day.weekday}</p>
        <p className="text-base font-bold text-stone-800">{day.date}</p>
      </div>
      <div className={`flex-shrink-0 w-9 h-9 rounded-full bg-white flex items-center justify-center ${style.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className={`text-sm font-bold ${style.color} leading-snug truncate`}>{day.khoi}</p>
        <p className="text-[11px] font-semibold text-stone-400">{day.session}</p>
      </div>
    </div>
  );
}

export default function LichSinhHoat() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 antialiased overflow-x-hidden">
      {/* ================= HERO ================= */}
      <header className="relative max-w-4xl mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-16 text-center overflow-hidden">
        {/* Đơn giản hóa background để giảm tải overdraw của GPU */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-[480px] bg-amber-100/30 blur-[120px] rounded-full -z-10 pointer-events-none" />

        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-amber-50 border border-amber-200/60 text-amber-800 rounded-full mb-6 shadow-sm transform-gpu"
          >
            <Calendar className="w-3.5 h-3.5" />
            Lịch sinh hoạt
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="font-serif font-black text-3xl md:text-5xl tracking-tight text-stone-900 mb-4 leading-[1.15] transform-gpu"
          >
            Hành trình đến{" "}
            <span className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
              Ngày Hội Trại
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="max-w-xl mx-auto text-sm md:text-base text-stone-500 leading-relaxed transform-gpu">
            Bốn tuần sinh hoạt cùng nhau chuẩn bị tâm hồn và tinh thần, hướng tới ngày hội trại lớn.
          </motion.p>
        </motion.div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-20 space-y-12">
        {/* ================= HỘI TRẠI BANNER ================= */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          // amount: 0.15 giúp kích hoạt ngay khi chạm nhẹ vào viewport, không bắt CPU tính toán căn lề quá sâu
          viewport={{ once: true, margin: "-40px", amount: 0.15 }}
          variants={fadeInUp}
        >
          {/* ⚡ TỐI ƯU ĐỒ HỌA: Loại bỏ hoàn toàn bọc mờ 'backdrop-blur-sm' - nguyên nhân chính gây sụt khung hình trên iOS Safari */}
          <div className="relative bg-gradient-to-br from-orange-700 via-amber-700 to-orange-800 rounded-3xl p-8 md:p-10 overflow-hidden text-center transform-gpu will-change-transform shadow-md">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-yellow-300/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-rose-400/10 blur-3xl rounded-full pointer-events-none" />

            <div className="relative">
              {/* Thay thế bg-white/15 + backdrop-blur bằng màu nền đặc đục cao để cứu GPU */}
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-5 shadow-md">
                <Tent className="w-7 h-7 text-white" />
              </div>

              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-100 mb-2">
                Hội Trại
              </p>
              <h2 className="font-serif font-black text-2xl md:text-3xl text-white mb-3">
                Thứ Bảy, 04/07/2026
              </h2>
              {/* Thay thế bg-white/10 + backdrop-blur */}
              <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-2 mb-4">
                <Sun className="w-4 h-4 text-amber-200" />
                <p className="text-sm font-semibold text-white">
                  Chủ đề: "Anh em là ánh sáng cho thế gian"
                </p>
              </div>
              <p className="text-xs md:text-sm text-amber-100/90 max-w-md mx-auto leading-relaxed">
                Mt 5,14 — Ngày hội ngộ của tất cả các khối, cùng nhau sống tinh thần truyền giáo
                và lan tỏa ánh sáng Tin Mừng.
              </p>
            </div>
          </div>
        </motion.section>

        {/* ================= LEGEND ================= */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px", amount: 0.15 }}
          variants={fadeInUp}
        >
          <div className="flex flex-wrap justify-center gap-3">
            {Object.entries(KHOI_STYLE).map(([name, style]) => {
              const Icon = style.icon;
              return (
                <span
                  key={name}
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold border ${style.border} ${style.bg} ${style.color} transform-gpu`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {name}
                </span>
              );
            })}
          </div>
        </motion.section>

        {/* ================= TIMELINE 4 TUẦN ================= */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px", amount: 0.1 }}
          variants={staggerContainer}
          className="space-y-8"
        >
          {WEEKS.map((week, idx) => (
            <motion.div key={week.range} variants={fadeInUp} className="relative transform-gpu will-change-transform">
              {/* Week header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-stone-400">Tuần {idx + 1}</p>
                  <h3 className="text-base font-bold text-stone-800">{week.range}</h3>
                </div>
                {week.isLastBeforeCamp && (
                  <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded-full px-3 py-1">
                    <Tent className="w-3 h-3" />
                    Tuần hội trại
                  </span>
                )}
              </div>

              {/* Day cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-12">
                {week.days.map((day) => (
                  <DayCard key={day.date} day={day} />
                ))}
              </div>
            </motion.div>
          ))}
        </motion.section>

        {/* ================= GHI CHÚ ================= */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px", amount: 0.15 }}
          variants={fadeInUp}
        >
          <div className="bg-white rounded-2xl border border-stone-200/70 shadow-sm p-6 text-center transform-gpu">
            <p className="text-sm text-stone-500 leading-relaxed">
              Lịch sinh hoạt có thể thay đổi tùy theo điều kiện thực tế. Vui lòng theo dõi thông báo
              cập nhật từ giáo lý viên phụ trách từng khối.
            </p>
          </div>
        </motion.section>
      </main>
    </div>
  );
}