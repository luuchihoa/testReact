import React, { useRef } from "react";
import { Link } from "react-router-dom";
import {
  Globe, Compass, Users, MessageSquare,
  Lightbulb, Heart, Clock, CalendarDays,
  ArrowRight, ChevronLeft, ShieldCheck,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLenis } from "lenis/react";

/* ── Design tokens ── */
const ACCENT   = "#2563a8";   // xanh dương trưởng thành — sứ mạng, chứng nhân
const ACCENT_L = "#eef4fb";

/* ── Framer Motion ── */
const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (d = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: d },
  }),
};
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ── Dữ liệu ── */
const OVERVIEW = [
  { icon: Users,        label: "Độ tuổi",    value: "Từ 18 tuổi trở lên" },
  { icon: Clock,        label: "Thời lượng", value: "90 phút / buổi" },
  { icon: CalendarDays, label: "Lịch học",   value: "Thứ Bảy tối / Chủ Nhật" },
  { icon: ShieldCheck,  label: "Yêu cầu",    value: "Đã lãnh các Bí tích khai tâm" },
];

const PILLARS = [
  {
    icon: Globe,
    title: "Đức tin & Văn hoá",
    color: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    topics: [
      "Giáo Hội trong thế giới hiện đại (Gaudium et Spes)",
      "Đức tin trước thách đố khoa học & công nghệ",
      "Giá trị Kitô giáo trong môi trường đại học & công sở",
      "Phân định ơn gọi — đời sống gia đình và tu trì",
    ],
  },
  {
    icon: Heart,
    title: "Xã hội & Công bằng",
    color: "bg-rose-50 border-rose-100",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    topics: [
      "Học thuyết xã hội Công giáo — nền tảng và ứng dụng",
      "Phẩm giá con người & nhân quyền",
      "Bảo vệ môi trường — tiếng gọi từ Laudato Si'",
      "Tình liên đới và phục vụ người nghèo",
    ],
  },
  {
    icon: Compass,
    title: "Sứ mạng & Chứng nhân",
    color: "bg-green-50 border-green-100",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    topics: [
      "Loan báo Tin Mừng trong bối cảnh Việt Nam",
      "Mạng xã hội — không gian truyền giáo mới",
      "Xây dựng cộng đoàn tươi trẻ và sống động",
      "Gương sáng — các Thánh tử đạo Việt Nam",
    ],
  },
];

const HIGHLIGHTS = [
  {
    icon: MessageSquare,
    title: "Thảo luận mở",
    desc: "Không có câu trả lời sẵn — các bạn trẻ cùng nhau đặt câu hỏi, tìm kiếm và đối thoại trong tinh thần đức tin.",
  },
  {
    icon: Lightbulb,
    title: "Diễn giả khách mời",
    desc: "Mỗi học kỳ có 2–3 buổi mời chuyên gia, linh mục, tu sĩ hoặc giáo dân gương mẫu chia sẻ hành trình sống đức tin.",
  },
  {
    icon: Heart,
    title: "Phục vụ thực tế",
    desc: "Tham gia các hoạt động bác ái, tình nguyện xã hội như một phần bắt buộc của chương trình — học đi đôi với hành.",
  },
  {
    icon: Globe,
    title: "Tài liệu chuyên sâu",
    desc: "Học từ các văn kiện Giáo Hội, các tác phẩm thần học và tài liệu giáo lý hiện đại được chọn lọc và Việt hoá.",
  },
];

const QUOTES = [
  {
    text: "Anh em hãy ra đi và làm cho muôn dân trở thành môn đệ.",
    src: "Mt 28,19",
  },
  {
    text: "Niềm vui Tin Mừng tràn ngập tâm hồn và cuộc sống của tất cả những ai gặp gỡ Chúa Giêsu.",
    src: "ĐGH Phanxicô — Evangelii Gaudium",
  },
];

/* ═══════════════════════════════════════════ */
export default function KhoiVaoDoi() {
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -80]);
  const lenis = useLenis();

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 antialiased overflow-x-hidden selection:bg-blue-200 selection:text-blue-900">

      {/* ══ HERO ══ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden pt-16 pb-20 md:pt-28 md:pb-32"
        style={{ background: `linear-gradient(160deg, ${ACCENT_L} 0%, #faf8f5 60%)` }}
      >
        <div className="absolute top-0 left-0 w-[600px] h-[500px] bg-blue-200/20 blur-[120px] rounded-full -z-10 -translate-x-1/4" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-sky-100/30 blur-[100px] rounded-full -z-10" />

        <motion.div style={{ y: heroY }} className="max-w-5xl mx-auto px-5 sm:px-6">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-8 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Trang chủ
            </Link>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col md:flex-row md:items-end gap-8 md:gap-16"
          >
            {/* Left — text */}
            <div className="flex-1">
              <motion.div variants={fadeUp} custom={0}>
                <span
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
                  style={{ background: `${ACCENT}15`, color: ACCENT }}
                >
                  <Globe className="w-3.5 h-3.5" />
                  Khối Vào Đời
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={0.05}
                className="text-4xl md:text-6xl font-serif font-black tracking-tight text-stone-900 leading-[1.1] mb-5"
              >
                Sống đức tin
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: `linear-gradient(135deg, ${ACCENT}, #1a4080)` }}
                >
                  giữa lòng đời
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={0.1}
                className="text-base md:text-lg text-stone-500 leading-relaxed max-w-lg mb-8"
              >
                Khối Vào Đời đồng hành cùng các bạn trẻ trưởng thành bước vào đại học, công
                sở và xã hội — trang bị hành trang đức tin để trở thành những chứng nhân
                Tin Mừng trong thế giới hiện đại.
              </motion.p>

              <motion.div
                variants={fadeUp}
                custom={0.15}
                className="flex flex-col sm:flex-row gap-3"
              >
                <button
                  onClick={() => lenis?.scrollTo("#noi-dung", { duration: 1.2 })}
                  className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5"
                  style={{ background: ACCENT, boxShadow: `0 4px 16px ${ACCENT}40` }}
                >
                  Xem nội dung
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  to="/tuyển-sinh"
                  className="inline-flex items-center justify-center h-11 px-5 rounded-xl text-sm font-semibold border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 shadow-sm transition-all duration-300 hover:-translate-y-0.5"
                >
                  Tham gia nhóm
                </Link>
              </motion.div>
            </div>

            {/* Right — image */}
            <motion.div variants={fadeUp} custom={0.2} className="flex-shrink-0 w-full md:w-[280px]">
              <div
                className="relative rounded-3xl overflow-hidden aspect-square w-full max-w-[260px] md:max-w-full mx-auto shadow-xl"
                style={{ background: `linear-gradient(135deg, ${ACCENT_L}, #d6e8f8)` }}
              >
                <img
                  src="https://lh3.googleusercontent.com/d/1tnxBqhr_su9_FgK6zdSkLa4h-w7CAlKJ"
                  alt="Khối Vào Đời"
                  className="w-full h-full object-contain p-8 mix-blend-multiply"
                />
                <div className="absolute bottom-3 left-3 right-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm">
                  <Compass className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} />
                  <div>
                    <p className="text-[11px] font-bold text-stone-900">Từ 18 tuổi</p>
                    <p className="text-[10px] text-stone-500">Thanh niên trưởng thành</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ══ TỔNG QUAN ══ */}
      <section className="py-14 border-y border-stone-100 bg-white/60">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {OVERVIEW.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex flex-col gap-2"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
                  <Icon className="w-4 h-4" style={{ color: ACCENT }} />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">{item.label}</p>
                <p className="text-sm font-semibold text-stone-800 leading-snug">{item.value}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ══ 3 TRỤ CỘT NỘI DUNG ══ */}
      <section id="noi-dung" className="py-20 md:py-28 max-w-5xl mx-auto px-5 sm:px-6 scroll-mt-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ACCENT }}>
            Nội dung
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-900 leading-tight">
            Ba trụ cột của người<br />Kitô hữu trưởng thành
          </h2>
          <p className="mt-3 text-stone-500 max-w-lg text-sm leading-relaxed">
            Mỗi học kỳ đi sâu vào một trụ cột, xoay vòng qua các năm để đảm bảo sự
            toàn diện trong hành trình đức tin trưởng thành.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`rounded-2xl border p-6 ${pillar.color}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${pillar.iconBg}`}>
                  <Icon className={`w-5 h-5 ${pillar.iconColor}`} />
                </div>
                <h3 className="text-base font-bold text-stone-900 mb-4">{pillar.title}</h3>
                <ul className="space-y-2.5">
                  {pillar.topics.map((topic, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-stone-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 flex-shrink-0 mt-2" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ══ QUOTE BANNER ══ */}
      <section
        className="py-16"
        style={{ background: `linear-gradient(135deg, #0f172a 0%, ${ACCENT} 100%)` }}
      >
        <div className="max-w-4xl mx-auto px-5 sm:px-6">
          <div className="grid sm:grid-cols-2 gap-6">
            {QUOTES.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15 p-6"
              >
                <p className="text-white/90 text-sm font-medium leading-relaxed italic mb-3">
                  "{q.text}"
                </p>
                <p className="text-white/50 text-xs font-bold tracking-wide">— {q.src}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ĐIỂM NỔI BẬT ══ */}
      <section className="py-20 md:py-28 max-w-5xl mx-auto px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ACCENT }}>
            Phương pháp
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-900">
            Học để sống,<br />không chỉ để biết
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          {HIGHLIGHTS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${ACCENT}12` }}>
                  <Icon className="w-5 h-5" style={{ color: ACCENT }} />
                </div>
                <h3 className="text-sm font-bold text-stone-900 mb-1.5">{item.title}</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section
        className="py-20"
        style={{ background: `linear-gradient(160deg, ${ACCENT_L} 0%, #faf8f5 100%)` }}
      >
        <div className="max-w-2xl mx-auto px-5 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Globe className="w-10 h-10 mx-auto mb-4" style={{ color: ACCENT }} />
            <h2 className="text-2xl md:text-3xl font-serif font-black text-stone-900 mb-3">
              Sẵn sàng bước ra?
            </h2>
            <p className="text-stone-500 text-sm leading-relaxed mb-8 max-w-md mx-auto">
              Gia nhập cộng đoàn thanh niên đức tin — nơi bạn không bước vào đời một mình,
              mà có Chúa và cả một cộng đoàn đồng hành.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/tuyển-sinh"
                className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5"
                style={{ background: ACCENT, boxShadow: `0 4px 16px ${ACCENT}40` }}
              >
                Tham gia ngay
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/liên-hệ"
                className="inline-flex items-center justify-center h-11 px-6 rounded-xl text-sm font-semibold border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 shadow-sm transition-all duration-300 hover:-translate-y-0.5"
              >
                Liên hệ hỏi thêm
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}