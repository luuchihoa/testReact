import React from "react";
import {
  Users, Music, HandHeart, Globe, Mic2,
  Flame, BookOpen, MapPin, Clock, CalendarDays,
} from "lucide-react";
import { motion } from "framer-motion";
import { useKhoiMotion } from "../hooks/useKhoiMotion.js";
import HeroSection from "./khoi/HeroSection.jsx";
import OverviewCards from "./khoi/OverviewCards.jsx";
import CtaSection from "./khoi/CtaSection.jsx";

/* ── Dữ liệu ── */
const OVERVIEW = [
  { icon: Users,        label: "Thành viên",  value: "Đã hoàn thành Vào Đời" },
  { icon: Clock,        label: "Sinh hoạt",   value: "2 lần / tháng" },
  { icon: CalendarDays, label: "Lịch nhóm",   value: "Thứ Bảy tối, 19:00–21:00" },
  { icon: MapPin,       label: "Địa điểm",    value: "Nhà giáo lý An Ngãi" },
];

// 4 trụ cột sinh hoạt — đặc thù khối này (mỗi trụ cột có danh sách hoạt động riêng),
// giữ nguyên inline vì phức tạp hơn HighlightsGrid dùng chung (chỉ nhận title + desc).
const PILLARS = [
  {
    icon: Flame,
    title: "Linh đạo",
    color: "bg-orange-50/50 dark:bg-orange-500/5 border-orange-200/50 dark:border-orange-500/20",
    iconBg: "bg-orange-100 dark:bg-orange-500/20",
    iconColor: "text-orange-600 dark:text-orange-400",
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
    color: "bg-sky-50/50 dark:bg-sky-500/5 border-sky-200/50 dark:border-sky-500/20",
    iconBg: "bg-sky-100 dark:bg-sky-500/20",
    iconColor: "text-sky-700 dark:text-sky-400",
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
    color: "bg-rose-50/50 dark:bg-rose-500/5 border-rose-200/50 dark:border-rose-500/20",
    iconBg: "bg-rose-100 dark:bg-rose-500/20",
    iconColor: "text-rose-600 dark:text-rose-400",
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
    color: "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200/50 dark:border-emerald-500/20",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
    iconColor: "text-emerald-700 dark:text-emerald-400",
    items: [
      "Fanpage & Instagram Giới Trẻ",
      "Blog chia sẻ đức tin hàng tuần",
      "Podcast Giới Trẻ — câu chuyện đức tin",
      "Kết nối với giới trẻ giáo xứ bạn",
      "Tham dự Đại hội Giới Trẻ",
    ],
  },
];

// Sự kiện thường niên — đặc thù khối này, giữ nguyên inline
const EVENTS = [
  { month: "Th.1",  name: "Gặp gỡ đầu năm & Dâng năm mới",          tag: "Cộng đoàn" },
  { month: "Th.2",  name: "Mùa Chay — Tĩnh tâm 24 giờ",             tag: "Linh đạo" },
  { month: "Th.4",  name: "Phục Sinh — Canh thức đêm Vượt Qua",      tag: "Phụng vụ" },
  { month: "Th.6",  name: "Trại hè Đức tin (2 ngày 1 đêm)",          tag: "Hội hè" },
  { month: "Th.8",  name: "Đại hội Giới Trẻ Giáo phận",              tag: "Giáo phận" },
  { month: "Th.9",  name: "Khai giảng năm học — nhận thành viên",    tag: "Nhóm" },
  { month: "Th.11", name: "Tháng các Đẳng linh hồn — thắp nến",      tag: "Linh đạo" },
  { month: "Th.12", name: "Vọng Giáng Sinh & Gala cuối năm",          tag: "Cộng đoàn" },
];

// Ban điều hành — đặc thù khối này, giữ nguyên inline
const ROLES = [
  { role: "Trưởng nhóm",         desc: "Điều phối chung, đại diện nhóm với giáo xứ." },
  { role: "Phó nhóm Linh đạo",   desc: "Tổ chức cầu nguyện, tĩnh tâm và sinh hoạt đức tin." },
  { role: "Phó nhóm Phục vụ",    desc: "Điều phối tình nguyện và các hoạt động bác ái." },
  { role: "Thư ký",              desc: "Ghi biên bản, quản lý danh sách thành viên." },
  { role: "Thủ quỹ",             desc: "Quản lý tài chính và quỹ nhóm minh bạch." },
  { role: "Truyền thông",         desc: "Fanpage, bản tin và kết nối cộng đoàn trực tuyến." },
];

const TAG_COLORS = {
  "Cộng đoàn": "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  "Linh đạo":  "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  "Phụng vụ":  "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  "Hội hè":    "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  "Giáo phận": "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  "Nhóm":      "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

// Kênh kết nối — đặc thù khối này, giữ nguyên inline
const CHANNELS = [
  {
    icon: "instagram",
    title: "Instagram",
    desc: "Ảnh sinh hoạt, câu chuyện đức tin và khoảnh khắc cộng đoàn.",
    link: "#",
    label: "@giantreanngai",
    bg: "bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-500/10 dark:to-purple-500/10",
    border: "border-pink-200/50 dark:border-pink-500/20",
    textHover: "text-pink-600 dark:text-pink-400",
  },
  {
    icon: Globe,
    title: "Website",
    desc: "Bản tin, bài chia sẻ và lịch sinh hoạt cập nhật hàng tháng.",
    link: "#",
    label: "giantreanngai.com",
    bg: "bg-sky-50 dark:bg-sky-500/10",
    border: "border-sky-200/50 dark:border-sky-500/20",
    textHover: "text-sky-600 dark:text-sky-400",
  },
  {
    icon: Music,
    title: "Podcast",
    desc: "Câu chuyện đức tin của các bạn trẻ — mỗi tuần 1 tập.",
    link: "#",
    label: "Spotify / Apple Podcasts",
    bg: "bg-green-50 dark:bg-green-500/10",
    border: "border-green-200/50 dark:border-green-500/20",
    textHover: "text-green-600 dark:text-green-400",
  },
];

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function GioiTre() {
  const { heroRef, lenis, mc, heroY, fadeUp, vp } = useKhoiMotion();

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-stone-900 dark:bg-[#000000] dark:text-stone-50 antialiased overflow-x-hidden selection:bg-sky-200 selection:text-sky-900 transition-colors duration-500">

      <HeroSection
        heroRef={heroRef}
        heroY={heroY}
        fadeUp={fadeUp}
        lenis={lenis}
        sectionBgClass="bg-gradient-to-b from-white via-[#f5f5f7] to-transparent dark:from-stone-950 dark:via-[#000000]"
        glowClass="bg-sky-500/10 dark:bg-sky-500/10"
        eyebrowIcon={Users}
        eyebrowLabel="Giới Trẻ Công Giáo"
        eyebrowClass="bg-sky-500/10 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300"
        titleLine1="Trẻ trung, dấn thân"
        titleLine2="sống đức tin"
        titleGradientClass="bg-gradient-to-r from-sky-600 to-blue-800 dark:from-sky-400 dark:to-blue-500"
        description="Sau khi hoàn thành hành trình giáo lý, Giới Trẻ Công Giáo là nơi các bạn tiếp tục lớn lên — cùng nhau cầu nguyện, học hỏi, phục vụ và trở thành nhân chứng Tin Mừng sống động."
        primaryCtaLabel="Khám phá nhóm"
        primaryCtaTargetId="sinh-hoat"
        secondaryCtaLabel="Tham gia ngay"
        secondaryCtaTo="/liên-hệ"
        image={{ src: "https://lh3.googleusercontent.com/d/1tnxBqhr_su9_FgK6zdSkLa4h-w7CAlKJ", alt: "Giới Trẻ Công Giáo" }}
        imageGlowClass="bg-gradient-to-tr from-sky-500/10 to-blue-500/10"
        floatBadge={{ label: "Sau Khối Vào Đời", sub: "Giai đoạn trưởng thành", dotClass: "bg-sky-500" }}
      />

      <OverviewCards items={OVERVIEW} />

      {/* 4 TRỤ CỘT SINH HOẠT — đặc thù khối này, giữ nguyên vì phức tạp hơn HighlightsGrid dùng chung */}
      <section id="sinh-hoat" className="py-24 max-w-6xl mx-auto px-6 scroll-mt-12 relative z-20">
        <div className="max-w-2xl text-left space-y-3 mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-sky-600 dark:text-sky-400">Sinh hoạt</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight inline-block px-1 -mx-1">Bốn trụ cột của Giới Trẻ Công Giáo</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed inline-block px-1 -mx-1">
            Mỗi buổi sinh hoạt đan xen cả bốn chiều kích — không chỉ nghe giảng, mà còn chia sẻ, phục vụ và kết nối với cộng đoàn rộng lớn.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
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
                className={`rounded-3xl border p-6 flex flex-col h-full bg-white dark:bg-stone-900 shadow-sm dark:shadow-none ${p.color}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${p.iconBg}`}>
                  <Icon className={`w-6 h-6 ${p.iconColor}`} />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white mb-4">{p.title}</h3>
                <ul className="space-y-3 mt-auto">
                  {p.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium leading-tight">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600 flex-shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* SỰ KIỆN THƯỜNG NIÊN — đặc thù khối này */}
      <section className="py-24 border-y border-stone-200/50 dark:border-stone-800/50 bg-stone-50 dark:bg-stone-950/50 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl text-left space-y-3 mb-16">
            <p className="text-[11px] font-bold tracking-widest uppercase text-sky-600 dark:text-sky-400">Lịch trình năm</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight inline-block px-1 -mx-1">Sự kiện thường niên</h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed inline-block px-1 -mx-1">
              Một năm trọn vẹn với những dấu ấn không thể quên — gắn với nhịp sống Phụng vụ và hành trình đức tin cộng đoàn.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {EVENTS.map((ev, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: mc.yOffset }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={vp}
                transition={{ duration: mc.duration(0.5), delay: mc.delay(i * 0.05) }}
                whileHover={mc.isMobile ? undefined : { scale: 1.02, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/60 dark:border-stone-800 p-5 shadow-sm dark:shadow-none flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
                    {ev.month}
                  </p>
                  <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full ${TAG_COLORS[ev.tag] || "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300"}`}>
                    {ev.tag}
                  </span>
                </div>
                <p className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug mt-auto">{ev.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BAN ĐIỀU HÀNH — đặc thù khối này */}
      <section className="py-24 max-w-6xl mx-auto px-6 relative z-10">
        <div className="max-w-2xl text-left space-y-3 mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-sky-600 dark:text-sky-400">Cơ cấu tổ chức</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight inline-block px-1 -mx-1">Ban điều hành nhóm</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed inline-block px-1 -mx-1">
            Nhóm do chính các thành viên điều hành theo nhiệm kỳ 1 năm — cơ hội rèn luyện kỹ năng lãnh đạo trong tinh thần phục vụ.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ROLES.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: mc.yOffset }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={vp}
              transition={{ duration: mc.duration(0.5), delay: mc.delay(i * 0.08) }}
              className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/60 dark:border-stone-800 p-6 shadow-sm dark:shadow-none hover:border-sky-300 dark:hover:border-sky-700/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-black text-sm">
                {(i + 1).toString().padStart(2, "0")}
              </div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white mb-2">{r.role}</h3>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-medium">{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* QUOTE BANNER — đặc thù khối này, giữ dark glassmorphism riêng vì đối lập chủ ý với phần còn lại của trang */}
      <section className="py-20 relative overflow-hidden bg-stone-900 dark:bg-[#0a0a0a] z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/40 to-stone-900 dark:from-sky-900/20 dark:to-black z-0" />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: mc.yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: mc.duration(0.7) }}
          >
            <Mic2 className="w-8 h-8 mx-auto mb-6 text-sky-400/50" />
            <blockquote className="text-white text-lg sm:text-xl md:text-2xl font-medium leading-relaxed italic mb-6 drop-shadow-md">
              "Đừng để ai coi thường anh vì anh còn trẻ, nhưng hãy nêu gương cho các tín hữu về lời nói, về cách ăn ở, về đức ái, đức tin và lòng trong sạch."
            </blockquote>
            <cite className="text-sky-200/70 text-xs sm:text-sm font-bold not-italic tracking-widest uppercase">
              — 1 Tm 4,12
            </cite>
          </motion.div>
        </div>
      </section>

      {/* KẾT NỐI — đặc thù khối này */}
      <section className="py-24 max-w-6xl mx-auto px-6 relative z-10">
        <div className="max-w-2xl text-left space-y-3 mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-sky-600 dark:text-sky-400">Cộng đồng</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight inline-block px-1 -mx-1">Theo dõi và kết nối</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
          {CHANNELS.map((ch, i) => {
            const Icon = ch.icon === "instagram" ? InstagramIcon : ch.icon;
            return (
              <motion.a
                key={i}
                href={ch.link}
                initial={{ opacity: 0, y: mc.yOffset }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={vp}
                transition={{ duration: mc.duration(0.5), delay: mc.delay(i * 0.1) }}
                whileHover={mc.isMobile ? undefined : { y: -4, transition: { duration: 0.2 } }}
                className={`group rounded-3xl border p-6 flex flex-col gap-4 hover:shadow-lg dark:hover:shadow-none transition-all active:scale-[0.98] bg-white dark:bg-stone-900 ${ch.border}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${ch.bg} border ${ch.border}`}>
                  <Icon className={`w-6 h-6 text-stone-700 dark:text-stone-300 group-hover:${ch.textHover} transition-colors`} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white mb-1.5">{ch.title}</h3>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-medium">{ch.desc}</p>
                </div>
                <p className={`text-xs font-bold mt-auto ${ch.textHover} transition-colors`}>{ch.label} &rarr;</p>
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
        primaryCtaClass="bg-sky-600 hover:bg-sky-500 shadow-sky-600/10"
        secondaryCtaLabel="Xem lại Khối Vào Đời"
        secondaryCtaTo="/khối-vào-đời"
        mc={mc}
        vp={vp}
        sectionClassName="py-28 max-w-3xl mx-auto px-6 text-center relative z-10 border-t border-stone-200/50 dark:border-stone-800/50"
      />
    </div>
  );
}