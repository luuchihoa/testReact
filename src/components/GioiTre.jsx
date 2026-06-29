import React, { useRef } from "react";
import { Link } from "react-router-dom";
import {
  Users, Music, HandHeart, Globe, Mic2,
  Clock, CalendarDays, ArrowRight, ChevronLeft,
  Flame, BookOpen, MapPin,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLenis } from "lenis/react";
import { useMotionConfig } from "../hooks/useMotionConfig.js";

/* ── Design tokens ── */
const ACCENT   = "#0369a1";   // sky-700 — trẻ trung, mở rộng, hướng thiên
const ACCENT_L = "#f0f9ff";   // sky-50

/* ── Dữ liệu ── */
const OVERVIEW = [
  { icon: Users,        label: "Thành viên",  value: "Đã hoàn thành Vào Đời" },
  { icon: Clock,        label: "Sinh hoạt",   value: "2 lần / tháng" },
  { icon: CalendarDays, label: "Lịch nhóm",   value: "Thứ Bảy tối, 19:00–21:00" },
  { icon: MapPin,       label: "Địa điểm",    value: "Nhà giáo lý Giáo xứ An Ngãi" },
];

/* ── 4 trụ cột sinh hoạt ── */
const PILLARS = [
  {
    icon: Flame,
    title: "Linh đạo",
    color: "bg-orange-50 border-orange-100",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    items: [
      "Cầu nguyện chung — Giờ Kinh Phụng vụ",
      "Lectio Divina theo nhóm nhỏ",
      "Tĩnh tâm hàng quý (1 ngày)",
      "Đồng hành tâm linh cá nhân",
      "Chầu Thánh Thể định kỳ",
    ],
  },
  {
    icon: BookOpen,
    title: "Học hỏi",
    color: "bg-sky-50 border-sky-100",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-700",
    items: [
      "Đọc sách thần học — chia sẻ hàng tháng",
      "Thảo luận Học thuyết Xã hội CG",
      "Kỹ năng lãnh đạo Kitô giáo",
      "Tiếng Anh / Tin học phục vụ truyền giáo",
      "Seminar chuyên đề theo mùa Phụng vụ",
    ],
  },
  {
    icon: HandHeart,
    title: "Phục vụ",
    color: "bg-rose-50 border-rose-100",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    items: [
      "Phụ trách giáo lý các khối nhỏ hơn",
      "Tình nguyện xã hội — thăm bệnh nhân",
      "Hỗ trợ lễ hội và sự kiện giáo xứ",
      "Gây quỹ học bổng học sinh nghèo",
      "Nhóm ca đoàn Giới Trẻ",
    ],
  },
  {
    icon: Globe,
    title: "Hiện diện",
    color: "bg-emerald-50 border-emerald-100",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
    items: [
      "Fanpage & Instagram Giới Trẻ",
      "Blog chia sẻ đức tin hàng tuần",
      "Podcast Giới Trẻ — câu chuyện đức tin",
      "Kết nối với giới trẻ các giáo xứ bạn",
      "Tham dự Đại hội Giới Trẻ Giáo phận",
    ],
  },
];

/* ── Sự kiện thường niên ── */
const EVENTS = [
  { month: "Th.1",  name: "Gặp gỡ đầu năm & Dâng năm mới",          tag: "Cộng đoàn" },
  { month: "Th.2",  name: "Mùa Chay — Tĩnh tâm 24 giờ",             tag: "Linh đạo" },
  { month: "Th.4",  name: "Phục Sinh — Canh thức đêm Vượt Qua",      tag: "Phụng vụ" },
  { month: "Th.6",  name: "Trại hè Đức tin (2 ngày 1 đêm)",          tag: "Hội hè" },
  { month: "Th.8",  name: "Đại hội Giới Trẻ Giáo phận",              tag: "Giáo phận" },
  { month: "Th.9",  name: "Khai giảng năm học — nhận thành viên mới", tag: "Nhóm" },
  { month: "Th.11", name: "Tháng các Đẳng linh hồn — thắp nến",      tag: "Linh đạo" },
  { month: "Th.12", name: "Vọng Giáng Sinh & Gala cuối năm",          tag: "Cộng đoàn" },
];

/* ── Ban điều hành ── */
const ROLES = [
  { role: "Trưởng nhóm",         desc: "Điều phối chung, đại diện nhóm với giáo xứ." },
  { role: "Phó nhóm Linh đạo",   desc: "Tổ chức cầu nguyện, tĩnh tâm và sinh hoạt đức tin." },
  { role: "Phó nhóm Phục vụ",    desc: "Điều phối tình nguyện và các hoạt động bác ái." },
  { role: "Thư ký",              desc: "Ghi biên bản, quản lý danh sách thành viên." },
  { role: "Thủ quỹ",             desc: "Quản lý tài chính và quỹ nhóm minh bạch." },
  { role: "Truyền thông",         desc: "Fanpage, bản tin và kết nối cộng đoàn trực tuyến." },
];

const TAG_COLORS = {
  "Cộng đoàn": "bg-sky-100 text-sky-700",
  "Linh đạo":  "bg-orange-100 text-orange-700",
  "Phụng vụ":  "bg-violet-100 text-violet-700",
  "Hội hè":    "bg-green-100 text-green-700",
  "Giáo phận": "bg-blue-100 text-blue-700",
  "Nhóm":      "bg-rose-100 text-rose-700",
};

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

/* ═══════════════════════════════════════════ */
export default function GioiTre() {
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const mc = useMotionConfig();
  const heroY = useTransform(scrollY, [0, 500], mc.heroParallax);
  const lenis = useLenis();

  const fadeUp = {
    hidden: { opacity: 0, y: mc.yOffset },
    visible: (d = 0) => ({
      opacity: 1, y: 0,
      transition: { duration: mc.duration(0.8), ease: [0.16, 1, 0.3, 1], delay: mc.delay(d) },
    }),
  };
  const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: mc.stagger } } };
  const vp = mc.vp();

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 antialiased overflow-x-hidden selection:bg-sky-200 selection:text-sky-900">

      {/* ══ HERO ══ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden pt-16 pb-20 md:pt-28 md:pb-32"
        style={{ background: `linear-gradient(160deg, ${ACCENT_L} 0%, #faf8f5 60%)` }}
      >
        {!mc.isMobile && (
          <>
            <div className="absolute top-0 left-0 w-[600px] h-[500px] bg-sky-200/20 blur-[120px] rounded-full -z-10 -translate-x-1/4" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-blue-100/20 blur-[100px] rounded-full -z-10" />
          </>
        )}

        <motion.div style={{ y: heroY }} className="max-w-5xl mx-auto px-5 sm:px-6">
          <motion.div
            initial={{ opacity: 0, x: mc.isMobile ? -8 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: mc.duration(0.5) }}
          >
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-8 transition-colors">
              <ChevronLeft className="w-4 h-4" />Trang chủ
            </Link>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col md:flex-row md:items-end gap-8 md:gap-16"
          >
            {/* Left */}
            <div className="flex-1">
              <motion.div variants={fadeUp} custom={0}>
                <span
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
                  style={{ background: `${ACCENT}18`, color: ACCENT }}
                >
                  <Users className="w-3.5 h-3.5" />Giới Trẻ Công Giáo
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={0.05}
                className="text-4xl md:text-6xl font-serif font-black tracking-tight text-stone-900 leading-[1.1] mb-5"
              >
                Trẻ trung, dấn thân
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: `linear-gradient(135deg, ${ACCENT}, #0c4a6e)` }}
                >
                  sống đức tin
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={0.1}
                className="text-base md:text-lg text-stone-500 leading-relaxed max-w-lg mb-8"
              >
                Sau khi hoàn thành hành trình giáo lý, Giới Trẻ Công Giáo là nơi các bạn
                tiếp tục lớn lên — cùng nhau cầu nguyện, học hỏi, phục vụ và trở thành
                những nhân chứng Tin Mừng sống động trong xã hội hôm nay.
              </motion.p>

              <motion.div variants={fadeUp} custom={0.15} className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    const t = document.getElementById("sinh-hoat");
                    if (!t) return;
                    lenis
                      ? lenis.scrollTo(t, { duration: mc.isMobile ? 0.8 : 1.2 })
                      : t.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                  style={{ background: ACCENT, boxShadow: `0 4px 16px ${ACCENT}40` }}
                >
                  Khám phá nhóm<ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  to="/liên-hệ"
                  className="inline-flex items-center justify-center h-11 px-5 rounded-xl text-sm font-semibold border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                >
                  Tham gia ngay
                </Link>
              </motion.div>
            </div>

            {/* Right — image card */}
            <motion.div variants={fadeUp} custom={0.2} className="flex-shrink-0 w-full md:w-[280px]">
              <div
                className="relative rounded-3xl overflow-hidden aspect-square w-full max-w-[260px] md:max-w-full mx-auto shadow-xl"
                style={{ background: `linear-gradient(135deg, ${ACCENT_L}, #bae6fd)` }}
              >
                <img
                  src="https://lh3.googleusercontent.com/d/1tnxBqhr_su9_FgK6zdSkLa4h-w7CAlKJ"
                  alt="Giới Trẻ Công Giáo"
                  className="w-full h-full object-contain p-8 mix-blend-multiply"
                  loading={mc.isMobile ? "lazy" : "eager"}
                />
                {/* Floating stats */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm">
                  <Users className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} />
                  <div>
                    <p className="text-[11px] font-bold text-stone-900">Sau Khối Vào Đời</p>
                    <p className="text-[10px] text-stone-500">Trẻ Công Giáo trưởng thành</p>
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
                initial={{ opacity: 0, y: mc.yOffset }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={vp}
                transition={{ duration: mc.duration(0.5), delay: mc.delay(i * 0.08) }}
                className="flex flex-col gap-2"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}18` }}>
                  <Icon className="w-4 h-4" style={{ color: ACCENT }} />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">{item.label}</p>
                <p className="text-sm font-semibold text-stone-800 leading-snug">{item.value}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ══ 4 TRỤ CỘT SINH HOẠT ══ */}
      <section id="sinh-hoat" className="py-20 md:py-28 max-w-5xl mx-auto px-5 sm:px-6 scroll-mt-16">
        <motion.div
          initial={{ opacity: 0, y: mc.yOffset }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: mc.duration(0.7) }}
          className="mb-12"
        >
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ACCENT }}>Sinh hoạt</p>
          <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-900 leading-tight">
            Bốn trụ cột của<br />Giới Trẻ Công Giáo
          </h2>
          <p className="mt-3 text-stone-500 max-w-lg text-sm leading-relaxed">
            Mỗi buổi sinh hoạt đan xen cả bốn chiều kích — không chỉ nghe giảng,
            mà còn chia sẻ, phục vụ và kết nối với cộng đoàn rộng lớn hơn.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: mc.yOffset }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={vp}
                transition={{ duration: mc.duration(0.6), delay: mc.delay(i * 0.1) }}
                whileHover={mc.isMobile ? undefined : { y: -4, transition: { duration: 0.2 } }}
                className={`rounded-2xl border p-5 ${p.color}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${p.iconBg}`}>
                  <Icon className={`w-5 h-5 ${p.iconColor}`} />
                </div>
                <h3 className="text-sm font-bold text-stone-900 mb-3">{p.title}</h3>
                <ul className="space-y-2">
                  {p.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-stone-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 flex-shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ══ SỰ KIỆN THƯỜNG NIÊN ══ */}
      <section
        className="py-20 md:py-28"
        style={{ background: `linear-gradient(160deg, ${ACCENT_L} 0%, #faf8f5 100%)` }}
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: mc.yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: mc.duration(0.7) }}
            className="mb-12"
          >
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ACCENT }}>
              Lịch năm
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-900">
              Sự kiện thường niên
            </h2>
            <p className="mt-3 text-stone-500 max-w-lg text-sm leading-relaxed">
              Một năm trọn vẹn với những dấu ấn không thể quên — gắn với nhịp sống
              Phụng vụ và hành trình đức tin của cộng đoàn.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {EVENTS.map((ev, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: mc.yOffset }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={vp}
                transition={{ duration: mc.duration(0.5), delay: mc.delay(i * 0.07) }}
                whileHover={mc.isMobile ? undefined : { y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <p
                  className="text-xs font-black uppercase tracking-widest mb-2"
                  style={{ color: ACCENT }}
                >
                  {ev.month}
                </p>
                <p className="text-sm font-semibold text-stone-900 leading-snug mb-3">{ev.name}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[ev.tag] || "bg-stone-100 text-stone-600"}`}>
                  {ev.tag}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BAN ĐIỀU HÀNH ══ */}
      <section className="py-20 md:py-28 max-w-5xl mx-auto px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: mc.yOffset }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: mc.duration(0.7) }}
          className="mb-12"
        >
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ACCENT }}>
            Cơ cấu
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-900">
            Ban điều hành nhóm
          </h2>
          <p className="mt-3 text-stone-500 max-w-lg text-sm leading-relaxed">
            Nhóm do chính các thành viên điều hành theo nhiệm kỳ 1 năm — mọi vị trí
            đều là cơ hội tập lãnh đạo trong tinh thần phục vụ.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ROLES.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: mc.yOffset }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={vp}
              transition={{ duration: mc.duration(0.5), delay: mc.delay(i * 0.08) }}
              className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm hover:shadow-md hover:border-sky-200 transition-all"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${ACCENT}18` }}
              >
                <span className="text-xs font-black" style={{ color: ACCENT }}>
                  {(i + 1).toString().padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-sm font-bold text-stone-900 mb-1">{r.role}</h3>
              <p className="text-xs text-stone-500 leading-relaxed">{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ QUOTE BANNER ══ */}
      <section
        className="py-16"
        style={{ background: `linear-gradient(135deg, #0c1a2e 0%, ${ACCENT} 100%)` }}
      >
        <div className="max-w-3xl mx-auto px-5 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: mc.yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: mc.duration(0.7) }}
          >
            <Mic2 className="w-8 h-8 mx-auto mb-5 text-white/40" />
            <blockquote className="text-white text-lg md:text-xl font-serif font-medium leading-relaxed italic mb-4">
              "Đừng để ai coi thường anh vì anh còn trẻ, nhưng hãy nêu gương
              cho các tín hữu về lời nói, về cách ăn ở, về đức ái, đức tin và lòng trong sạch."
            </blockquote>
            <cite className="text-white/50 text-sm font-bold not-italic tracking-wide">
              — 1 Tm 4,12
            </cite>
          </motion.div>
        </div>
      </section>

      {/* ══ KẾT NỐI ══ */}
      <section className="py-20 md:py-28 max-w-5xl mx-auto px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: mc.yOffset }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: mc.duration(0.7) }}
          className="mb-12"
        >
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ACCENT }}>
            Cộng đồng
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-900">
            Theo dõi và kết nối
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              icon: InstagramIcon,
              title: "Instagram",
              desc: "Ảnh sinh hoạt, câu chuyện đức tin và các khoảnh khắc cộng đoàn.",
              link: "#",
              label: "@giantreanngai",
              bg: "bg-gradient-to-br from-pink-50 to-purple-50",
              border: "border-pink-100",
            },
            {
              icon: Globe,
              title: "Website",
              desc: "Bản tin, bài chia sẻ và lịch sinh hoạt cập nhật hàng tháng.",
              link: "#",
              label: "giantreanngai.com",
              bg: "bg-sky-50",
              border: "border-sky-100",
            },
            {
              icon: Music,
              title: "Podcast",
              desc: "Câu chuyện đức tin của các bạn trẻ — mỗi tuần 1 tập, 20–30 phút.",
              link: "#",
              label: "Spotify / Apple Podcasts",
              bg: "bg-green-50",
              border: "border-green-100",
            },
          ].map((ch, i) => {
            const Icon = ch.icon;
            return (
              <motion.a
                key={i}
                href={ch.link}
                initial={{ opacity: 0, y: mc.yOffset }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={vp}
                transition={{ duration: mc.duration(0.5), delay: mc.delay(i * 0.1) }}
                whileHover={mc.isMobile ? undefined : { y: -4, transition: { duration: 0.2 } }}
                className={`rounded-2xl border p-5 flex flex-col gap-3 hover:shadow-md transition-all active:scale-[0.98] ${ch.bg} ${ch.border}`}
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <Icon className="w-5 h-5" style={{ color: ACCENT }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">{ch.title}</h3>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{ch.desc}</p>
                </div>
                <p className="text-xs font-bold mt-auto" style={{ color: ACCENT }}>{ch.label} →</p>
              </motion.a>
            );
          })}
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="py-20 max-w-2xl mx-auto px-5 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: mc.yOffset }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: mc.duration(0.7) }}
        >
          <motion.div
            animate={mc.reduced ? {} : {
              scale: [1, 1.1, 1],
              transition: { repeat: Infinity, duration: 2.6, ease: "easeInOut" },
            }}
          >
            <Users className="w-10 h-10 mx-auto mb-4" style={{ color: ACCENT }} />
          </motion.div>

          <h2 className="text-2xl md:text-3xl font-serif font-black text-stone-900 mb-3">
            Bạn không cần đi một mình
          </h2>
          <p className="text-stone-500 text-sm leading-relaxed mb-8 max-w-md mx-auto">
            Giới Trẻ Công Giáo luôn rộng cửa đón chào — dù bạn vừa hoàn thành
            Khối Vào Đời hay đã trưởng thành một thời gian, hành trình đức tin
            đẹp hơn khi có bạn đồng hành.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/liên-hệ"
              className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
              style={{ background: ACCENT, boxShadow: `0 4px 16px ${ACCENT}40` }}
            >
              Tham gia nhóm<ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/khối-vào-đời"
              className="inline-flex items-center justify-center h-11 px-6 rounded-xl text-sm font-semibold border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            >
              Xem lại Khối Vào Đời
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}