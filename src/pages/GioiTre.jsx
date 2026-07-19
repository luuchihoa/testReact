import React from "react";
import {
  Users, Music, HandHeart, Globe, Mic2,
  Flame, BookOpen, MapPin, Clock, CalendarDays,
} from "lucide-react";
import { motion } from "framer-motion";
import { usePageMotion } from "../hooks/usePageMotion.js";
import HeroSection from "../features/khoi/HeroSection.jsx";
import OverviewCards from "../features/khoi/OverviewCards.jsx";
import CtaSection from "../features/khoi/CtaSection.jsx";

// Hằng số Easing chuẩn hệ thống
const APPLE_EASE = [0.16, 1, 0.3, 1];

/* ── Dữ liệu ── */
const OVERVIEW = [
  { icon: Users,        label: "Thành viên",  value: "Đã hoàn thành Khai Tâm" },
  { icon: Clock,        label: "Sinh hoạt",   value: "2 lần / tháng" },
  { icon: CalendarDays, label: "Lịch nhóm",   value: "Thứ Bảy tối, 19:00" },
  { icon: MapPin,       label: "Địa điểm",    value: "Nhà giáo lý An Ngãi" },
];

const PILLARS = [
  {
    icon: Flame,
    title: "Linh đạo",
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-orange-500/40 shadow-sm",
    iconBg: "bg-orange-100/80 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/30 shadow-sm",
    iconColor: "text-orange-600 dark:text-orange-400",
    dot: "bg-orange-500 shadow-sm",
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
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-sky-500/40 shadow-sm",
    iconBg: "bg-sky-100/80 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border border-sky-200/50 dark:border-sky-800/30 shadow-sm",
    iconColor: "text-sky-700 dark:text-sky-400",
    dot: "bg-sky-500 shadow-sm",
    items: [
      "Đọc sách thần học — chia sẻ hàng tháng",
      "Thảo luận Học thuyết Xã hội CG",
      "Kỹ năng lãnh đạo Kitô giáo",
      "Tiếng Anh / Tin học phục vụ",
      "Seminar chuyên đề Phụng vụ",
    ],
  },
  {
    icon: HandHeart,
    title: "Phục vụ",
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-rose-500/40 shadow-sm",
    iconBg: "bg-rose-100/80 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/30 shadow-sm",
    iconColor: "text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500 shadow-sm",
    items: [
      "Phụ trách giáo lý các khối nhỏ",
      "Tình nguyện xã hội — thăm bệnh nhân",
      "Hỗ trợ lễ hội và sự kiện giáo xứ",
      "Gây quỹ học bổng học sinh nghèo",
      "Nhóm ca đoàn Giới Trẻ",
    ],
  },
  {
    icon: Globe,
    title: "Hiện diện",
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-emerald-500/40 shadow-sm",
    iconBg: "bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30 shadow-sm",
    iconColor: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500 shadow-sm",
    items: [
      "Fanpage & Instagram Giới Trẻ",
      "Blog chia sẻ đức tin hàng tuần",
      "Podcast Giới Trẻ — câu chuyện",
      "Kết nối với giới trẻ giáo xứ bạn",
      "Tham dự Đại hội Giới Trẻ",
    ],
  },
];

const EVENTS = [
  { month: "Th.1",  name: "Gặp gỡ & Dâng năm mới",          tag: "Cộng đoàn", color: "bg-sky-100/80 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200/50 dark:border-sky-800/30" },
  { month: "Th.2",  name: "Mùa Chay — Tĩnh tâm 24 giờ",       tag: "Linh đạo", color: "bg-orange-100/80 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200/50 dark:border-orange-800/30" },
  { month: "Th.4",  name: "Đêm Vượt Qua",      tag: "Phụng vụ", color: "bg-violet-100/80 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200/50 dark:border-violet-800/30" },
  { month: "Th.6",  name: "Trại hè Đức tin",          tag: "Hội hè", color: "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/30" },
  { month: "Th.8",  name: "Đại hội Giới Trẻ Giáo phận",        tag: "Giáo phận", color: "bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/30" },
  { month: "Th.9",  name: "Khai giảng — Nhận thành viên",      tag: "Nhóm", color: "bg-rose-100/80 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/30" },
  { month: "Th.11", name: "Tháng các Đẳng linh hồn",        tag: "Linh đạo", color: "bg-orange-100/80 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200/50 dark:border-orange-800/30" },
  { month: "Th.12", name: "Gala cuối năm",          tag: "Cộng đoàn", color: "bg-sky-100/80 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200/50 dark:border-sky-800/30" },
];

const ROLES = [
  { role: "Trưởng nhóm",         desc: "Điều phối chung, đại diện nhóm với giáo xứ." },
  { role: "Phó nhóm Linh đạo",   desc: "Tổ chức cầu nguyện, tĩnh tâm và sinh hoạt đức tin." },
  { role: "Phó nhóm Phục vụ",    desc: "Điều phối tình nguyện và các hoạt động bác ái." },
  { role: "Thư ký",              desc: "Ghi biên bản, quản lý danh sách thành viên." },
  { role: "Thủ quỹ",             desc: "Quản lý tài chính và quỹ nhóm minh bạch." },
  { role: "Truyền thông",         desc: "Fanpage, bản tin và kết nối cộng đoàn trực tuyến." },
];

const CHANNELS = [
  {
    icon: "instagram",
    title: "Instagram",
    desc: "Ảnh sinh hoạt, câu chuyện đức tin và khoảnh khắc cộng đoàn.",
    link: "#",
    label: "@giantreanngai",
    bg: "bg-pink-100/80 dark:bg-pink-900/30",
    border: "border-pink-200/50 dark:border-pink-800/30",
    textHover: "text-pink-600 dark:text-pink-400",
  },
  {
    icon: Globe,
    title: "Website",
    desc: "Bản tin, bài chia sẻ và lịch sinh hoạt cập nhật hàng tháng.",
    link: "#",
    label: "giantreanngai.com",
    bg: "bg-sky-100/80 dark:bg-sky-900/30",
    border: "border-sky-200/50 dark:border-sky-800/30",
    textHover: "text-sky-600 dark:text-sky-400",
  },
  {
    icon: Music,
    title: "Podcast",
    desc: "Câu chuyện đức tin của các bạn trẻ — mỗi tuần 1 tập.",
    link: "#",
    label: "Spotify / Apple Podcasts",
    bg: "bg-emerald-100/80 dark:bg-emerald-900/30",
    border: "border-emerald-200/50 dark:border-emerald-800/30",
    textHover: "text-emerald-600 dark:text-emerald-400",
  },
];

function InstagramIcon({ className }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function GioiTre() {
  const { heroRef, lenis, heroY, fadeUp, heroReveal, vp } = usePageMotion();

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 dark:bg-[#1C1917] dark:text-stone-50 antialiased overflow-x-hidden selection:bg-sky-500/20 dark:selection:bg-sky-500/30 transition-colors duration-500">

      <HeroSection
        heroRef={heroRef}
        heroY={heroY}
        fadeUp={heroReveal}
        lenis={lenis}
        sectionBgClass="bg-gradient-to-b from-white via-[#FDFBF7] to-[#FDFBF7] dark:from-[#1C1917] dark:via-[#191614] dark:to-[#191614]"
        glowClass="bg-sky-500/5 dark:bg-sky-500/10"
        eyebrowIcon={Users}
        eyebrowLabel="Giới Trẻ Công Giáo"
        eyebrowClass="bg-sky-100/80 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border border-sky-200/50 dark:border-sky-800/30 shadow-sm"
        titleLine1="Trẻ trung, dấn thân"
        titleLine2="sống đức tin"
        titleGradientClass="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 dark:from-sky-400 dark:via-blue-400 dark:to-indigo-400"
        description="Sau khi hoàn thành hành trình giáo lý, Giới Trẻ Công Giáo là nơi các bạn tiếp tục lớn lên — cùng nhau cầu nguyện, học hỏi, phục vụ và trở thành nhân chứng Tin Mừng sống động."
        primaryCtaLabel="Khám phá nhóm"
        primaryCtaTargetId="sinh-hoat"
        primaryCtaClass="bg-sky-600 hover:bg-sky-500 dark:bg-sky-600 dark:hover:bg-sky-500 text-white"
        secondaryCtaLabel="Tham gia ngay"
        secondaryCtaTo="/liên-hệ"
        image={{ src: "https://lh3.googleusercontent.com/d/1tnxBqhr_su9_FgK6zdSkLa4h-w7CAlKJ", alt: "Giới Trẻ Công Giáo" }}
        imageGlowClass="bg-gradient-to-tr from-sky-500/5 to-blue-500/5"
        floatBadge={{ label: "Sau Khối Vào Đời", sub: "Giai đoạn trưởng thành", dotClass: "bg-sky-500" }}
      />

      <OverviewCards items={OVERVIEW} accentBgClass="bg-sky-100/50 dark:bg-sky-900/20" accentTextClass="text-sky-900 dark:text-sky-400" accentBorderClass="border-sky-900/10 dark:border-sky-700/30" />

      {/* 4 TRỤ CỘT SINH HOẠT */}
      <section id="sinh-hoat" className="py-20 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-12 relative z-20">
        <div className="max-w-2xl text-left space-y-3 mb-12 sm:mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-sky-600 dark:text-sky-400 ml-1">Sinh hoạt</p>
          <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50 leading-tight">Bốn trụ cột của Giới Trẻ</h2>
          <p className="text-[14px] sm:text-[15.5px] font-medium text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl">
            Mỗi buổi sinh hoạt đan xen cả bốn chiều kích — không chỉ nghe giảng, mà còn chia sẻ, phục vụ và kết nối với cộng đoàn rộng lớn.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={vp}
                custom={i * 0.08}
                whileHover={{ y: -6, scale: 1.01 }}
                className={`rounded-[24px] sm:rounded-[32px] border p-6 sm:p-8 flex flex-col h-full transition-all duration-300 hover:shadow-xl ${p.color}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${p.iconBg}`}>
                  <Icon className={`w-6 h-6 ${p.iconColor}`} strokeWidth={2.5} />
                </div>
                <h3 className="text-[20px] sm:text-[22px] font-extrabold font-serif text-amber-950 dark:text-amber-50 mb-6">{p.title}</h3>
                <div className="space-y-3 mt-auto">
                  {p.items.map((item, j) => (
                    <div key={j} className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-white/40 dark:bg-[#1C1917]/40 border border-amber-900/5 dark:border-amber-100/5 shadow-sm group hover:bg-white/80 dark:hover:bg-[#1C1917]/80 transition-colors">
                      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${p.iconBg.replace('shadow-sm', '')}`}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                      </div>
                      <span className="text-[14px] text-stone-700 dark:text-stone-300 font-medium leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* SỰ KIỆN THƯỜNG NIÊN */}
      <section className="py-20 sm:py-24 border-y border-amber-900/5 dark:border-amber-100/5 bg-stone-50/50 dark:bg-[#1C1917]/50 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl text-left space-y-3 mb-12 sm:mb-16">
            <p className="text-[11px] font-bold tracking-widest uppercase text-sky-600 dark:text-sky-400 ml-1">Lịch trình năm</p>
            <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50 leading-tight">Sự kiện thường niên</h2>
            <p className="text-[14px] sm:text-[15.5px] font-medium text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl">
              Một năm trọn vẹn với những dấu ấn không thể quên — gắn với nhịp sống Phụng vụ và hành trình đức tin cộng đoàn.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {EVENTS.map((ev, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={vp}
                custom={i * 0.05}
                whileHover={{ y: -6, scale: 1.01 }}
                className="bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl rounded-[20px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
              >
                <div className="px-5 py-3 border-b border-dashed border-amber-900/20 dark:border-amber-100/20 bg-stone-100/50 dark:bg-stone-800/30 flex justify-between items-center">
                  <p className="text-[13px] font-black uppercase tracking-widest text-sky-700 dark:text-sky-500">
                    {ev.month}
                  </p>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest border shadow-sm ${ev.color}`}>
                    {ev.tag}
                  </span>
                </div>
                <div className="p-5 flex-1 flex items-center">
                  <p className="text-[15px] font-bold text-amber-950 dark:text-amber-50 leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{ev.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BAN ĐIỀU HÀNH */}
      <section className="py-20 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-2xl text-left space-y-3 mb-12 sm:mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-sky-600 dark:text-sky-400 ml-1">Cơ cấu tổ chức</p>
          <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50 leading-tight">Ban điều hành nhóm</h2>
          <p className="text-[14px] sm:text-[15.5px] font-medium text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl">
            Nhóm do chính các thành viên điều hành theo nhiệm kỳ 1 năm — cơ hội rèn luyện kỹ năng lãnh đạo trong tinh thần phục vụ.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {ROLES.map((r, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={vp}
              custom={i * 0.08}
              whileHover={{ y: -6, scale: 1.01 }}
              className="bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl rounded-[24px] border border-amber-900/10 dark:border-amber-100/10 p-6 shadow-sm hover:border-sky-500/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-5 bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-900/40 dark:to-sky-800/40 text-sky-700 dark:text-sky-400 border border-sky-200/50 dark:border-sky-700/30 shadow-sm font-black text-[14px] tracking-wider uppercase">
                {r.role.split(' ').map(word => word[0]).join('').substring(0, 2)}
              </div>
              <h3 className="text-[18px] font-extrabold font-serif text-amber-950 dark:text-amber-50 mb-2">{r.role}</h3>
              <p className="text-[14px] text-stone-500 dark:text-stone-400 leading-relaxed font-medium">{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* QUOTE BANNER */}
      <section className="py-24 relative overflow-hidden bg-stone-900 dark:bg-[#0a0a0a] z-10 border-y border-black/5 dark:border-white/5 shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/50 to-stone-900 dark:from-sky-900/30 dark:to-black z-0" />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            custom={0.2}
          >
            <Mic2 className="w-10 h-10 mx-auto mb-8 text-sky-400/60" strokeWidth={1.5} />
            <blockquote className="text-white text-[20px] md:text-[26px] font-medium font-serif leading-relaxed italic mb-8 drop-shadow-md">
              "Đừng để ai coi thường anh vì anh còn trẻ, nhưng hãy nêu gương cho các tín hữu về lời nói, về cách ăn ở, về đức ái, đức tin và lòng trong sạch."
            </blockquote>
            <cite className="text-sky-300/80 text-[12px] font-bold not-italic tracking-widest uppercase">
              — 1 Tm 4,12
            </cite>
          </motion.div>
        </div>
      </section>

      {/* KẾT NỐI */}
      <section className="py-20 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-2xl text-left space-y-3 mb-12 sm:mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-sky-600 dark:text-sky-400 ml-1">Cộng đồng</p>
          <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50 leading-tight">Theo dõi và kết nối</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {CHANNELS.map((ch, i) => {
            const Icon = ch.icon === "instagram" ? InstagramIcon : ch.icon;
            return (
              <motion.a
                key={i}
                href={ch.link}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={vp}
                custom={i * 0.1}
                whileHover={{ y: -6, scale: 1.01 }}
                className={`group rounded-[24px] border border-amber-900/10 dark:border-amber-100/10 p-6 sm:p-8 flex flex-col gap-5 hover:shadow-xl dark:hover:shadow-none transition-all active:scale-[0.98] bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl ${ch.border}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm ${ch.bg} ${ch.border}`}>
                  <Icon className={`w-6 h-6 text-stone-600 dark:text-stone-400 group-hover:${ch.textHover} transition-colors`} />
                </div>
                <div>
                  <h3 className="text-[18px] font-extrabold font-serif text-amber-950 dark:text-amber-50 mb-2">{ch.title}</h3>
                  <p className="text-[14px] text-stone-500 dark:text-stone-400 leading-relaxed font-medium">{ch.desc}</p>
                </div>
                <p className={`text-[12px] font-bold uppercase tracking-widest mt-auto transition-colors ${ch.textHover}`}>{ch.label} &rarr;</p>
              </motion.a>
            );
          })}
        </div>
      </section>

      <CtaSection
        icon={Users}
        iconClass="text-sky-500"
        title="Bạn không cần đi một mình"
        description="Giới Trẻ Công Giáo luôn rộng cửa đón chào — hành trình trưởng thành và sống đạo sẽ đẹp hơn rất nhiều khi có bạn bè đồng hành."
        primaryCtaLabel="Tham gia nhóm"
        primaryCtaTo="/liên-hệ"
        primaryCtaClass="bg-sky-600 text-white hover:bg-sky-500 shadow-sm"
        secondaryCtaLabel="Xem lại Khối Vào Đời"
        secondaryCtaTo="/khối-vào-đời"
      />
    </div>
  );
}