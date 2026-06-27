import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, FileText, Play, Search, ChevronRight, Download, Clock, BookOpen, Sparkles, Flame, Heart, Star, Globe, } from "lucide-react";
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

const QUIZZES = [
  {
    title: "Ôn Tập 15 Phút — HK1",
    khoi: "kinh-thanh", khoiLabel: "Kinh Thánh",
    icon: BookOpen, iconColor: "text-green-600", iconBg: "bg-green-50",
    path: "/bài-kiểm-tra/ôn-tập-15-phút-học-kỳ-1",
    time: "15 phút", questions: "10 TN + 2 TL",
    badge: "HK1", badgeColor: "bg-green-100 text-green-700",
  },
  {
    title: "Ôn Tập 1 Tiết — HK1",
    khoi: "kinh-thanh", khoiLabel: "Kinh Thánh",
    icon: BookOpen, iconColor: "text-green-600", iconBg: "bg-green-50",
    path: "/bài-kiểm-tra/ôn-tập-1-tiết-học-kỳ-1",
    time: "45 phút", questions: "20 TN + 3 TL",
    badge: "HK1", badgeColor: "bg-green-100 text-green-700",
  },
  {
    title: "Ôn Tập Cuối HK1",
    khoi: "kinh-thanh", khoiLabel: "Kinh Thánh",
    icon: BookOpen, iconColor: "text-green-600", iconBg: "bg-green-50",
    path: "/bài-kiểm-tra/ôn-tập-cuối-học-kỳ-1",
    time: "45 phút", questions: "20 TN + 3 TL",
    badge: "HK1", badgeColor: "bg-green-100 text-green-700",
  },
  {
    title: "Ôn Tập 15 Phút — HK2",
    khoi: "kinh-thanh", khoiLabel: "Kinh Thánh",
    icon: BookOpen, iconColor: "text-green-600", iconBg: "bg-green-50",
    path: "/bài-kiểm-tra/ôn-tập-15-phút-học-kỳ-2",
    time: "15 phút", questions: "10 TN + 2 TL",
    badge: "HK2", badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Ôn Tập 1 Tiết — HK2",
    khoi: "kinh-thanh", khoiLabel: "Kinh Thánh",
    icon: BookOpen, iconColor: "text-green-600", iconBg: "bg-green-50",
    path: "/bài-kiểm-tra/ôn-tập-1-tiết-học-kỳ-2",
    time: "45 phút", questions: "20 TN + 3 TL",
    badge: "HK2", badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Ôn Tập Cuối HK2",
    khoi: "kinh-thanh", khoiLabel: "Kinh Thánh",
    icon: BookOpen, iconColor: "text-green-600", iconBg: "bg-green-50",
    path: "/bài-kiểm-tra/ôn-tập-cuối-học-kỳ-2",
    time: "45 phút", questions: "20 TN + 3 TL",
    badge: "HK2", badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Đố Vui Giáo Lý",
    khoi: "all", khoiLabel: "Tất cả",
    icon: Sparkles, iconColor: "text-amber-600", iconBg: "bg-amber-50",
    path: "/bài-kiểm-tra/đố-vui-giáo-lý",
    time: "Không giới hạn", questions: "Ngẫu nhiên",
    badge: "Vui", badgeColor: "bg-amber-100 text-amber-700",
  },
];

const DOCS = [
  {
    title: "Toát yếu Giáo lý Hội Thánh Công giáo",
    khoi: "all", type: "PDF", icon: FileText,
    desc: "Tổng hợp toàn bộ giáo lý Công giáo dưới dạng hỏi-đáp ngắn gọn, súc tích.",
    url: "#", size: "2.4 MB",
  },
  {
    title: "Kinh Thánh — Bản dịch Nhóm CGKPV",
    khoi: "kinh-thanh", type: "PDF", icon: BookOpen,
    desc: "Toàn bộ Kinh Thánh 73 quyển, bản dịch Công giáo Việt Nam chính thức.",
    url: "#", size: "18 MB",
  },
  {
    title: "Hướng dẫn đọc Kinh Thánh mỗi ngày",
    khoi: "kinh-thanh", type: "PDF", icon: FileText,
    desc: "Phương pháp Lectio Divina đơn giản dành cho trẻ em và gia đình.",
    url: "#", size: "1.1 MB",
  },
  {
    title: "Sách lễ Rôma — Kinh Nguyện Thánh Thể",
    khoi: "phung-vu", type: "PDF", icon: FileText,
    desc: "Văn bản các Kinh nguyện Thánh Thể I–IV dùng trong Thánh Lễ.",
    url: "#", size: "850 KB",
  },
  {
    title: "Năm Phụng vụ — Lịch Công giáo 2025–2026",
    khoi: "phung-vu", type: "PDF", icon: FileText,
    desc: "Lịch toàn bộ năm Phụng vụ 2025–2026 với các lễ trọng, lễ kính.",
    url: "#", size: "560 KB",
  },
  {
    title: "7 ơn Chúa Thánh Thần — Tài liệu Thêm Sức",
    khoi: "them-suc", type: "PDF", icon: Flame,
    desc: "Tài liệu học và suy niệm 7 ơn Chúa Thánh Thần dành riêng cho Khối Thêm Sức.",
    url: "#", size: "1.3 MB",
  },
];

export const KHOI_ICON_MAP = {
  "chien-con":  { icon: Heart,         color: "text-pink-500",   bg: "bg-pink-50"    },
  "ruoc-le":    { icon: Star,          color: "text-lime-600",   bg: "bg-lime-50"    },
  "them-suc":   { icon: Flame,         color: "text-yellow-600", bg: "bg-yellow-50"  },
  "phung-vu":   { icon: Sparkles,      color: "text-orange-600", bg: "bg-orange-50"  },
  "kinh-thanh": { icon: BookOpen,      color: "text-red-600",    bg: "bg-red-50"     },
  "vao-doi":    { icon: Globe,         color: "text-amber-800",  bg: "bg-amber-50"   },
  "all":        { icon: GraduationCap, color: "text-amber-700",  bg: "bg-amber-50"   },
};

export const KHOI_LINKS = [
  { path: "/khối-chiên-con",  label: "Chiên Con",  icon: Heart,    color: "text-pink-500",   bg: "bg-pink-50",   border: "border-pink-100"   },
  { path: "/khối-rước-lễ",    label: "Rước Lễ",    icon: Star,     color: "text-lime-600",   bg: "bg-lime-50",   border: "border-lime-200"   },
  { path: "/khối-thêm-sức",   label: "Thêm Sức",   icon: Flame,    color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
  { path: "/khối-phụng-vụ",   label: "Phụng Vụ",   icon: Sparkles, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
  { path: "/khối-kinh-thánh", label: "Kinh Thánh", icon: BookOpen, color: "text-red-600",    bg: "bg-red-50",    border: "border-red-100"    },
  { path: "/khối-vào-đời",    label: "Vào Đời",    icon: Globe,    color: "text-amber-800",  bg: "bg-amber-50",  border: "border-amber-200"  },
];

export default function TaiLieu() {
  const [activeKhoi, setActiveKhoi] = useState("all");
  const [search, setSearch] = useState("");
  const mc = useMotionConfig();
  const vp = mc.vp();

  const fadeUp = {
    hidden: { opacity: 0, y: mc.yOffset },
    visible: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: mc.duration(0.6), ease: [0.16, 1, 0.3, 1], delay: mc.delay(d) } }),
  };

  const filteredQuizzes = QUIZZES.filter(q =>
    (activeKhoi === "all" || q.khoi === activeKhoi || q.khoi === "all") &&
    q.title.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDocs = DOCS.filter(d =>
    (activeKhoi === "all" || d.khoi === activeKhoi || d.khoi === "all") &&
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 antialiased overflow-x-hidden selection:bg-amber-200 selection:text-amber-900">

      {/* HERO */}
      <section className="relative overflow-hidden pt-16 pb-16 md:pt-24 md:pb-20"
        style={{ background: "linear-gradient(160deg, #fdf8ec 0%, #faf8f5 60%)" }}>
        {!mc.isMobile && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber-200/20 blur-[120px] rounded-full -z-10" />
        )}
        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <motion.div initial={{ opacity: 0, x: mc.isMobile ? -8 : -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: mc.duration(0.5) }}>
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-8 transition-colors">
              <ChevronRight className="w-4 h-4 rotate-180" />Trang chủ
            </Link>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: mc.stagger } } }}>
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-5 bg-amber-100 text-amber-800">
                <GraduationCap className="w-3.5 h-3.5" />Kho Tư Liệu
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={0.05}
              className="text-3xl sm:text-4xl md:text-6xl font-serif font-black tracking-tight text-stone-900 leading-[1.1] mb-4">
              Tài liệu &<br />
              <span className="bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">
                Đề ôn luyện
              </span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={0.1}
              className="text-base md:text-lg text-stone-500 leading-relaxed max-w-xl mb-8">
              Toàn bộ tài liệu học tập, bộ đề kiểm tra và kho ôn luyện trực tuyến
              cho tất cả các khối giáo lý — miễn phí, không cần đăng nhập.
            </motion.p>

            {/* Search */}
            <motion.div variants={fadeUp} custom={0.15} className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm đề thi, tài liệu…"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 shadow-sm transition"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FILTER TABS — sticky */}
      <div className="sticky top-0 z-30 bg-[#faf8f5]/90 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-3" style={{ scrollbarWidth: "none" }}>
            {KHOI_LIST.map((k) => (
              <button key={k.id} onClick={() => setActiveKhoi(k.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95
                  ${activeKhoi === k.id ? "bg-stone-900 text-white shadow-sm" : "text-stone-500 active:bg-stone-100 md:hover:text-stone-800 md:hover:bg-stone-100"}`}>
                {k.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-10 md:py-12 space-y-14 md:space-y-16">

        {/* ĐỀ ÔN LUYỆN */}
        <section>
          <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
            viewport={vp} transition={{ duration: mc.duration(0.6) }} className="mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Play className="w-4 h-4 text-amber-700" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-stone-900">Đề ôn luyện trực tuyến</h2>
            </div>
            <p className="text-sm text-stone-500 ml-11">Làm bài trực tiếp trên web, có chấm điểm tự động.</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {filteredQuizzes.length > 0 ? (
              <motion.div key={activeKhoi + search}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {filteredQuizzes.map((quiz, i) => {
                  const Icon = quiz.icon;
                  return (
                    <motion.div key={quiz.path} initial={{ opacity: 0, y: mc.yOffset }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: mc.duration(0.4), delay: mc.delay(i * 0.06) }}>
                      <Link to={quiz.path}
                        className="group flex flex-col h-full bg-white rounded-2xl border border-stone-100 p-4 md:p-5 shadow-sm active:shadow-md active:border-amber-300 md:hover:shadow-md md:hover:border-amber-300 transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${quiz.iconBg}`}>
                            <Icon className={`w-4 h-4 ${quiz.iconColor}`} />
                          </div>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${quiz.badgeColor}`}>
                            {quiz.badge}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-stone-900 mb-1 flex-1">{quiz.title}</h3>
                        <p className="text-[11px] text-stone-400 mb-4">{quiz.khoiLabel}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                          <div className="flex items-center gap-1 text-[11px] text-stone-400">
                            <Clock className="w-3 h-3" />{quiz.time}
                          </div>
                          <span className="text-[11px] text-stone-400">{quiz.questions}</span>
                        </div>
                        {!mc.isMobile && (
                          <div className="mt-3 flex items-center gap-1 text-xs font-bold text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity">
                            Làm bài ngay<ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.p key="empty-q" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-sm text-stone-400 py-8 text-center">
                Không tìm thấy đề phù hợp.
              </motion.p>
            )}
          </AnimatePresence>
        </section>

        {/* TÀI LIỆU */}
        <section>
          <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
            viewport={vp} transition={{ duration: mc.duration(0.6) }} className="mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-stone-600" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-stone-900">Tài liệu tham khảo</h2>
            </div>
            <p className="text-sm text-stone-500 ml-11">Văn kiện Giáo Hội, sách giáo lý và tài liệu học tập.</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {filteredDocs.length > 0 ? (
              <motion.div key={activeKhoi + search + "d"}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col gap-3">
                {filteredDocs.map((doc, i) => {
                  const Icon = doc.icon;
                  const khoiMeta = KHOI_ICON_MAP[doc.khoi] || KHOI_ICON_MAP["all"];
                  const KhoiIcon = khoiMeta.icon;
                  return (
                    <motion.div key={doc.title} initial={{ opacity: 0, y: mc.yOffset }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: mc.duration(0.4), delay: mc.delay(i * 0.06) }}>
                      <a href={doc.url}
                        className="group flex items-center gap-3 md:gap-4 bg-white rounded-2xl border border-stone-100 px-4 md:px-5 py-4 shadow-sm active:shadow-md active:border-stone-300 md:hover:shadow-md md:hover:border-stone-300 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-stone-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-stone-900 truncate">{doc.title}</h3>
                          <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{doc.desc}</p>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                          <div className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${khoiMeta.bg} ${khoiMeta.color}`}>
                            <KhoiIcon className="w-2.5 h-2.5" />
                          </div>
                          <span className="text-[11px] text-stone-400">{doc.size}</span>
                          <div className="w-8 h-8 rounded-full bg-stone-50 active:bg-amber-50 md:group-hover:bg-amber-50 border border-stone-200 active:border-amber-200 md:group-hover:border-amber-200 flex items-center justify-center transition-colors">
                            <Download className="w-3.5 h-3.5 text-stone-400 group-active:text-amber-600 md:group-hover:text-amber-600 transition-colors" />
                          </div>
                        </div>
                      </a>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.p key="empty-d" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-sm text-stone-400 py-8 text-center">
                Không tìm thấy tài liệu phù hợp.
              </motion.p>
            )}
          </AnimatePresence>
        </section>

        {/* LINK ĐẾN CÁC KHỐI */}
        <section>
          <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
            viewport={vp} transition={{ duration: mc.duration(0.6) }} className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-bold text-stone-900">Khám phá theo khối</h2>
            <p className="text-sm text-stone-500 mt-1">Tìm hiểu chi tiết chương trình của từng khối giáo lý.</p>
          </motion.div>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
            {KHOI_LINKS.map((k, i) => {
              const Icon = k.icon;
              return (
                <motion.div key={k.path} initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={vp} transition={{ duration: mc.duration(0.4), delay: mc.delay(i * 0.07) }}>
                  <Link to={k.path}
                    className={`group flex flex-col items-center gap-2 p-3 md:p-4 rounded-2xl border ${k.bg} ${k.border} active:shadow-md md:hover:shadow-md transition-all text-center`}>
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white flex items-center justify-center shadow-sm md:group-hover:scale-110 active:scale-110 transition-transform">
                      <Icon className={`w-4 h-4 md:w-5 md:h-5 ${k.color}`} />
                    </div>
                    <span className="text-[11px] md:text-xs font-bold text-stone-800 leading-tight">{k.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}