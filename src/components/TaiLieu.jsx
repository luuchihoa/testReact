import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  GraduationCap, FileText, Play, Search, ChevronRight, 
  Download, Clock, BookOpen, Sparkles, Flame, Heart, Star, Globe 
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

const QUIZZES = [
  {
    title: "Ôn Tập 15 Phút — HK1",
    khoi: "kinh-thanh", khoiLabel: "Kinh Thánh",
    icon: BookOpen, iconColor: "text-red-500 dark:text-red-400", iconBg: "bg-red-500/10 dark:bg-red-500/20",
    path: "/bài-kiểm-tra/ôn-tập-15-phút-học-kỳ-1",
    time: "15 phút", questions: "10 TN + 2 TL",
    badge: "HK1", badgeColor: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
  },
  {
    title: "Ôn Tập 1 Tiết — HK1",
    khoi: "kinh-thanh", khoiLabel: "Kinh Thánh",
    icon: BookOpen, iconColor: "text-red-500 dark:text-red-400", iconBg: "bg-red-500/10 dark:bg-red-500/20",
    path: "/bài-kiểm-tra/ôn-tập-1-tiết-học-kỳ-1",
    time: "45 phút", questions: "20 TN + 3 TL",
    badge: "HK1", badgeColor: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
  },
  {
    title: "Ôn Tập Cuối HK1",
    khoi: "kinh-thanh", khoiLabel: "Kinh Thánh",
    icon: BookOpen, iconColor: "text-red-500 dark:text-red-400", iconBg: "bg-red-500/10 dark:bg-red-500/20",
    path: "/bài-kiểm-tra/ôn-tập-cuối-học-kỳ-1",
    time: "45 phút", questions: "20 TN + 3 TL",
    badge: "HK1", badgeColor: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
  },
  {
    title: "Ôn Tập 15 Phút — HK2",
    khoi: "kinh-thanh", khoiLabel: "Kinh Thánh",
    icon: BookOpen, iconColor: "text-emerald-500 dark:text-emerald-400", iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    path: "/bài-kiểm-tra/ôn-tập-15-phút-học-kỳ-2",
    time: "15 phút", questions: "10 TN + 2 TL",
    badge: "HK2", badgeColor: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
  },
  {
    title: "Ôn Tập 1 Tiết — HK2",
    khoi: "kinh-thanh", khoiLabel: "Kinh Thánh",
    icon: BookOpen, iconColor: "text-emerald-500 dark:text-emerald-400", iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    path: "/bài-kiểm-tra/ôn-tập-1-tiết-học-kỳ-2",
    time: "45 phút", questions: "20 TN + 3 TL",
    badge: "HK2", badgeColor: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
  },
  {
    title: "Ôn Tập Cuối HK2",
    khoi: "kinh-thanh", khoiLabel: "Kinh Thánh",
    icon: BookOpen, iconColor: "text-emerald-500 dark:text-emerald-400", iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    path: "/bài-kiểm-tra/ôn-tập-cuối-học-kỳ-2",
    time: "45 phút", questions: "20 TN + 3 TL",
    badge: "HK2", badgeColor: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
  },
  {
    title: "Đố Vui Giáo Lý",
    khoi: "all", khoiLabel: "Tất cả",
    icon: Sparkles, iconColor: "text-amber-500 dark:text-amber-400", iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
    path: "/bài-kiểm-tra/đố-vui-giáo-lý",
    time: "Không giới hạn", questions: "Ngẫu nhiên",
    badge: "Vui", badgeColor: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
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
  "chien-con":  { icon: Heart,         color: "text-pink-500 dark:text-pink-400",     bg: "bg-pink-500/10 dark:bg-pink-500/20" },
  "ruoc-le":    { icon: Star,          color: "text-lime-600 dark:text-lime-400",     bg: "bg-lime-500/10 dark:bg-lime-500/20" },
  "them-suc":   { icon: Flame,         color: "text-amber-500 dark:text-amber-400",   bg: "bg-amber-500/10 dark:bg-amber-500/20" },
  "phung-vu":   { icon: Sparkles,      color: "text-orange-500 dark:text-orange-400", bg: "bg-orange-500/10 dark:bg-orange-500/20" },
  "kinh-thanh": { icon: BookOpen,      color: "text-red-500 dark:text-red-400",       bg: "bg-red-500/10 dark:bg-red-500/20" },
  "vao-doi":    { icon: Globe,         color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-500/10 dark:bg-yellow-500/20" },
  "all":        { icon: GraduationCap, color: "text-stone-700 dark:text-stone-300",   bg: "bg-stone-500/10 dark:bg-stone-500/20" },
};

export const KHOI_LINKS = [
  { path: "/khối-chiên-con",  label: "Chiên Con",  icon: Heart,    color: "text-pink-500",   bg: "bg-pink-500/5 dark:bg-pink-500/10",   border: "border-pink-500/20"   },
  { path: "/khối-rước-lễ",    label: "Rước Lễ",    icon: Star,     color: "text-lime-600",   bg: "bg-lime-500/5 dark:bg-lime-500/10",   border: "border-lime-500/20"   },
  { path: "/khối-thêm-sức",   label: "Thêm Sức",   icon: Flame,    color: "text-amber-500",  bg: "bg-amber-500/5 dark:bg-amber-500/10", border: "border-amber-500/20" },
  { path: "/khối-phụng-vụ",   label: "Phụng Vụ",   icon: Sparkles, color: "text-orange-500", bg: "bg-orange-500/5 dark:bg-orange-500/10", border: "border-orange-500/20" },
  { path: "/khối-kinh-thánh", label: "Kinh Thánh", icon: BookOpen, color: "text-red-500",    bg: "bg-red-500/5 dark:bg-red-500/10",    border: "border-red-500/20"    },
  { path: "/khối-vào-đời",    label: "Vào Đời",    icon: Globe,    color: "text-yellow-600", bg: "bg-yellow-500/5 dark:bg-yellow-500/10", border: "border-yellow-500/20" },
];

export default function TaiLieu() {
  const [activeKhoi, setActiveKhoi] = useState("all");
  const [search, setSearch] = useState("");
  const systemConfig = useMotionConfig();
  
  // Tránh lỗi runtime và đồng bộ hóa với Spring Curve của Apple
  const mc = systemConfig || {
    yOffset: 30,
    duration: (d) => d || 0.6,
    delay: (d) => d || 0,
    stagger: 0.06,
    isMobile: false,
    vp: () => ({ once: true, margin: "-10% 0px" })
  };

  const vp = mc.vp();

  const fadeUp = {
    hidden: { opacity: 0, y: mc.yOffset },
    visible: (d = 0) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 90, damping: 15, mass: 0.8, delay: mc.delay(d) } 
    }),
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
    <div className="min-h-screen bg-[#f5f5f7] text-stone-900 dark:bg-[#000000] dark:text-stone-50 antialiased overflow-x-hidden selection:bg-amber-500/20 dark:selection:bg-amber-500/30 transition-colors duration-500">
      {/* Lưới chuyển động trôi chậm bằng Framer Motion */}
<motion.div
  animate={{ 
    backgroundPosition: ["0px 0px", "0px 24px"] 
  }}
  transition={{ 
    repeat: Infinity, 
    duration: 1.5, 
    ease: "linear" 
  }}
  className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" 
/>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-14 md:pt-24 md:pb-20 bg-gradient-to-b from-white via-[#f5f5f7] to-transparent dark:from-stone-900 dark:via-[#000000] z-10">
        {/* Lưới chấm bi (Dot Matrix) */}
<div className="absolute inset-0 bg-[radial-gradient(#80808045_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" /> */}
        <div className="max-w-5xl mx-auto px-5 sm:px-6">

          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: mc.stagger } } }} className="space-y-6">
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                <GraduationCap className="w-3.5 h-3.5" /> Kho Tư Liệu Giáo Lý
              </span>
            </motion.div>
            
            <motion.h1 variants={fadeUp} custom={0.06}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-[1.1]">
              Tài liệu học tập &<br />
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent dark:from-amber-400 dark:via-orange-400 dark:to-amber-500">
                Hệ thống đề ôn luyện
              </span>
            </motion.h1>
            
            <motion.p variants={fadeUp} custom={0.12}
              className="text-sm sm:text-base text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl font-normal">
              Hỗ trợ học tập trực tuyến, kho đề kiểm tra tự động và các văn kiện chính thức dành cho Huynh Trưởng & Thiếu Nhi — hoàn toàn miễn phí.
            </motion.p>

            {/* Thanh Tìm Kiếm Chuẩn Apple Mượt Mà */}
            <motion.div variants={fadeUp} custom={0.18} className="relative max-w-md pt-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500 pointer-events-none z-10" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm đề thi, tài liệu giáo lý..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200/80 dark:border-stone-800/80 bg-white/80 dark:bg-stone-900/80 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:focus:ring-amber-500/20 focus:border-amber-500 shadow-sm dark:shadow-black/40 backdrop-blur-md transition-all"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* STICKY FILTER TABS (iOS Segmented Controls Style) */}
      <div className="sticky top-0 z-30 bg-[#f5f5f7]/80 dark:bg-[#000000]/80 backdrop-blur-xl border-b border-stone-200/40 dark:border-stone-800/40 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1.5 overflow-x-auto py-3 scrollbar-none snap-x snap-mandatory">
            {KHOI_LIST.map((k) => {
              const active = activeKhoi === k.id;
              return (
                <button 
                  key={k.id} 
                  onClick={() => setActiveKhoi(k.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold snap-center transition-all duration-200 active:scale-[0.96]
                    ${active 
                      ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 shadow-sm" 
                      : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 bg-white/50 dark:bg-stone-900/50 border border-stone-200/40 dark:border-stone-800/40"
                    }`}
                >
                  {k.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CORE CONTENT MAIN AREA */}
      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-10 md:py-16 space-y-16 md:space-y-20 relative z-10">

        {/* SECTION 1: ĐỀ ÔN LUYỆN */}
        <section>
          <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
            viewport={vp} transition={{ duration: 0.5 }} className="mb-8 text-left">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <Play className="w-3.5 h-3.5 fill-current" />
              </div>
              <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight">Đề ôn luyện trực tuyến</h2>
            </div>
            <p className="text-xs text-stone-400 dark:text-stone-500 font-medium pl-11">Chấm điểm tự động và hiển thị đáp án giải thích ngay sau khi hoàn thành bài thi.</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {filteredQuizzes.length > 0 ? (
              <motion.div key={activeKhoi + search}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredQuizzes.map((quiz, i) => {
                  const Icon = quiz.icon;
                  return (
                    <motion.div key={quiz.path} initial={{ opacity: 0, y: mc.yOffset }} animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 100, damping: 15, delay: i * 0.04 }}>
                      <Link to={quiz.path}
                        className="group flex flex-col justify-between h-full bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/60 dark:border-stone-800/80 p-5 shadow-sm hover:shadow-md active:scale-[0.99] transition-all duration-300 text-left"
                      >
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${quiz.iconBg}`}>
                              <Icon className={`w-4 h-4 ${quiz.iconColor}`} />
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${quiz.badgeColor}`}>
                              {quiz.badge}
                            </span>
                          </div>
                          <h3 className="text-[15px] font-extrabold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mb-1">{quiz.title}</h3>
                          <p className="text-xs text-stone-400 dark:text-stone-500 font-medium mb-5">{quiz.khoiLabel}</p>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="h-px bg-stone-100 dark:bg-stone-800/60 w-full" />
                          <div className="flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500 font-medium">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {quiz.time}
                            </div>
                            <span>{quiz.questions}</span>
                          </div>
                          <div className="pt-1 flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
                            Vào làm bài <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.p key="empty-q" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-stone-400 dark:text-stone-500 font-medium py-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800">
                Không tìm thấy đề thi phù hợp với bộ lọc hiện tại.
              </motion.p>
            )}
          </AnimatePresence>
        </section>

        {/* SECTION 2: TÀI LIỆU */}
        <section>
          <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
            viewport={vp} transition={{ duration: 0.5 }} className="mb-8 text-left">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-xl bg-stone-500/10 text-stone-600 dark:bg-stone-500/20 dark:text-stone-400 flex items-center justify-center flex-shrink-0">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight">Tài liệu tham khảo & Học tập</h2>
            </div>
            <p className="text-xs text-stone-400 dark:text-stone-500 font-medium pl-11">Sách giáo lý các khối, văn kiện chính thức của Giáo hội và tài liệu bồi dưỡng Huynh Trưởng.</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {filteredDocs.length > 0 ? (
              <motion.div key={activeKhoi + search + "d"}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid gap-3"
              >
                {filteredDocs.map((doc, i) => {
                  const Icon = doc.icon;
                  const khoiMeta = KHOI_ICON_MAP[doc.khoi] || KHOI_ICON_MAP["all"];
                  const KhoiIcon = khoiMeta.icon;
                  return (
                    <motion.div key={doc.title} initial={{ opacity: 0, y: mc.yOffset }} animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 100, damping: 16, delay: i * 0.03 }}>
                      <a href={doc.url}
                        className="group flex items-center gap-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/60 dark:border-stone-800/80 px-4 py-4 shadow-sm hover:shadow-md active:scale-[0.995] transition-all duration-200 text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200/40 dark:border-stone-700/40 flex items-center justify-center flex-shrink-0 text-stone-500 dark:text-stone-400 shadow-inner">
                          <Icon className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{doc.title}</h3>
                          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5 line-clamp-1 font-medium">{doc.desc}</p>
                        </div>
                        
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className={`hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${khoiMeta.bg} ${khoiMeta.color}`}>
                            <KhoiIcon className="w-2.5 h-2.5" />
                          </div>
                          <span className="text-[11px] text-stone-400 dark:text-stone-500 font-bold select-none">{doc.size}</span>
                          <div className="w-8 h-8 rounded-full bg-stone-50 dark:bg-stone-800 group-hover:bg-amber-500/10 dark:group-hover:bg-amber-500/20 border border-stone-200 dark:border-stone-700 flex items-center justify-center transition-colors">
                            <Download className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
                          </div>
                        </div>
                      </a>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.p key="empty-d" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-stone-400 dark:text-stone-500 font-medium py-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800">
                Không tìm thấy tài liệu phù hợp.
              </motion.p>
            )}
          </AnimatePresence>
        </section>

        {/* SECTION 3: CÁC KHỐI GIÁO LÝ (Bento Box Mobile Grid) */}
        <section>
          <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
            viewport={vp} transition={{ duration: 0.5 }} className="mb-8 text-left">
            <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight">Khám phá theo cấp lớp</h2>
            <p className="text-xs text-stone-400 dark:text-stone-500 font-medium mt-1">Xem chi tiết khung chương trình, thời lượng, độ tuổi và mục tiêu đào tạo của từng khối lớp học.</p>
          </motion.div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {KHOI_LINKS.map((k, i) => {
              const Icon = k.icon;
              return (
                <motion.div key={k.path} initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={vp} transition={{ type: "spring", stiffness: 100, damping: 15, delay: i * 0.04 }}>
                  <Link to={k.path}
                    className={`group flex flex-col items-center gap-2.5 p-4 rounded-2xl border ${k.bg} ${k.border} hover:shadow-md dark:hover:shadow-none transition-all duration-300 text-center relative overflow-hidden`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-stone-900 flex items-center justify-center shadow-sm group-hover:scale-105 active:scale-105 transition-transform duration-300">
                      <Icon className={`w-4 h-4 md:w-5 h-5 ${k.color}`} />
                    </div>
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200 tracking-tight leading-tight">{k.label}</span>
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