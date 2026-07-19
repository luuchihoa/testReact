import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  GraduationCap, FileText, Play, Search, ChevronRight, 
  Download, Clock, BookOpen, Sparkles, Flame, Heart, Church, Globe 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageMotion } from "../hooks/usePageMotion.js";
import { useDebounce } from "../hooks/useDebounce";

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
    icon: BookOpen, iconColor: "text-stone-600 dark:text-stone-400", iconBg: "bg-stone-100 dark:bg-stone-800",
    path: "/bài-kiểm-tra/ôn-tập-15-phút-học-kỳ-1",
    time: "15 phút", questions: "10 TN + 2 TL",
    badge: "HK1", badgeColor: "bg-amber-100/50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
  {
    title: "Ôn Tập 1 Tiết — HK1",
    khoi: "kinh-thanh", khoiLabel: "Kinh Thánh",
    icon: BookOpen, iconColor: "text-stone-600 dark:text-stone-400", iconBg: "bg-stone-100 dark:bg-stone-800",
    path: "/bài-kiểm-tra/ôn-tập-1-tiết-học-kỳ-1",
    time: "45 phút", questions: "20 TN + 3 TL",
    badge: "HK1", badgeColor: "bg-amber-100/50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
  {
    title: "Ôn Tập Cuối HK1",
    khoi: "kinh-thanh", khoiLabel: "Kinh Thánh",
    icon: BookOpen, iconColor: "text-stone-600 dark:text-stone-400", iconBg: "bg-stone-100 dark:bg-stone-800",
    path: "/bài-kiểm-tra/ôn-tập-cuối-học-kỳ-1",
    time: "45 phút", questions: "20 TN + 3 TL",
    badge: "HK1", badgeColor: "bg-amber-100/50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
  {
    title: "Ôn Tập 15 Phút — HK2",
    khoi: "kinh-thanh", khoiLabel: "Kinh Thánh",
    icon: BookOpen, iconColor: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    path: "/bài-kiểm-tra/ôn-tập-15-phút-học-kỳ-2",
    time: "15 phút", questions: "10 TN + 2 TL",
    badge: "HK2", badgeColor: "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  },
  {
    title: "Ôn Tập 1 Tiết — HK2",
    khoi: "kinh-thanh", khoiLabel: "Kinh Thánh",
    icon: BookOpen, iconColor: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    path: "/bài-kiểm-tra/ôn-tập-1-tiết-học-kỳ-2",
    time: "45 phút", questions: "20 TN + 3 TL",
    badge: "HK2", badgeColor: "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  },
  {
    title: "Ôn Tập Cuối HK2",
    khoi: "kinh-thanh", khoiLabel: "Kinh Thánh",
    icon: BookOpen, iconColor: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    path: "/bài-kiểm-tra/ôn-tập-cuối-học-kỳ-2",
    time: "45 phút", questions: "20 TN + 3 TL",
    badge: "HK2", badgeColor: "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  },
  {
    title: "Đố Vui Giáo Lý",
    khoi: "all", khoiLabel: "Tất cả",
    icon: Sparkles, iconColor: "text-orange-600 dark:text-orange-400", iconBg: "bg-orange-50 dark:bg-orange-500/10",
    path: "/bài-kiểm-tra/đố-vui-giáo-lý",
    time: "Không giới hạn", questions: "Ngẫu nhiên",
    badge: "Vui", badgeColor: "bg-orange-100/50 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
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
  "chien-con":  { icon: Heart,    color: "text-rose-600 dark:text-rose-400",     bg: "bg-rose-50 dark:bg-rose-500/10", border: "border-rose-100 dark:border-rose-500/20" },
  "ruoc-le":    { icon: Sparkles, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-500/10", border: "border-yellow-100 dark:border-yellow-500/20" },
  "them-suc":   { icon: Flame,    color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-100 dark:border-amber-500/20" },
  "phung-vu":   { icon: Church,   color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/10", border: "border-orange-100 dark:border-orange-500/20" },
  "kinh-thanh": { icon: BookOpen, color: "text-stone-600 dark:text-stone-400",   bg: "bg-stone-100 dark:bg-stone-500/10", border: "border-stone-200 dark:border-stone-500/20" },
  "vao-doi":    { icon: Globe,    color: "text-red-600 dark:text-red-400",       bg: "bg-red-50 dark:bg-red-500/10", border: "border-red-100 dark:border-red-500/20" },
  "all":        { icon: GraduationCap, color: "text-stone-700 dark:text-stone-300", bg: "bg-stone-100 dark:bg-stone-500/10", border: "border-stone-200 dark:border-stone-500/20" },
};

export const KHOI_LINKS = [
  { path: "/khối-chiên-con",  label: "Chiên Con",  icon: Heart,    color: "text-rose-600 dark:text-rose-400",   bg: "bg-rose-50 dark:bg-rose-500/10",   border: "border-rose-200/50 dark:border-rose-500/20"   },
  { path: "/khối-rước-lễ",    label: "Rước Lễ",    icon: Sparkles, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-500/10", border: "border-yellow-200/50 dark:border-yellow-500/20" },
  { path: "/khối-thêm-sức",   label: "Thêm Sức",   icon: Flame,    color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200/50 dark:border-amber-500/20" },
  { path: "/khối-phụng-vụ",   label: "Phụng Vụ",   icon: Church,   color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/10", border: "border-orange-200/50 dark:border-orange-500/20" },
  { path: "/khối-kinh-thánh", label: "Kinh Thánh", icon: BookOpen, color: "text-stone-600 dark:text-stone-400",  bg: "bg-stone-50 dark:bg-stone-500/10", border: "border-stone-200/50 dark:border-stone-500/20" },
  { path: "/khối-vào-đời",    label: "Vào Đời",    icon: Globe,    color: "text-red-600 dark:text-red-400",    bg: "bg-red-50 dark:bg-red-500/10",    border: "border-red-200/50 dark:border-red-500/20"    },
];

export default function TaiLieu() {
  const [activeKhoi, setActiveKhoi] = useState("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300); // 300ms delay
  const [isLoading, setIsLoading] = useState(false);
  const { mc, fadeUp, heroReveal, vp } = usePageMotion();
  
  // Simulate network request when filter changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 400); // simulate 400ms load
    return () => clearTimeout(timer);
  }, [activeKhoi, debouncedSearch]);

  const filteredQuizzes = useMemo(() => {
    return QUIZZES.filter(q =>
      (activeKhoi === "all" || q.khoi === activeKhoi || q.khoi === "all") &&
      q.title.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [activeKhoi, debouncedSearch]);

  const filteredDocs = useMemo(() => {
    return DOCS.filter(d =>
      (activeKhoi === "all" || d.khoi === activeKhoi || d.khoi === "all") &&
      d.title.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [activeKhoi, debouncedSearch]);

  const handleDownload = (e, title) => {
    e.preventDefault(); // Prevent standard # link navigation
    // TODO: Later implement Supabase Blob download here
    alert(`[Mô phỏng] Đang tải tài liệu: ${title}\n(Tính năng tải file thực từ server sẽ được cập nhật sau khi tích hợp Supabase)`);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 dark:bg-[#1C1917] dark:text-stone-200 antialiased overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-900 transition-colors duration-500 relative">
      
      {/* Background lưới mờ tinh tế (Apple Premium Grid) */}
      <div className="fixed inset-0 w-full h-screen bg-[linear-gradient(to_right,#92400E08_1px,transparent_1px),linear-gradient(to_bottom,#92400E08_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#FDE68A05_1px,transparent_1px),linear-gradient(to_bottom,#FDE68A05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-14 md:pt-24 md:pb-20 z-10">
        {!mc.isMobile && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-200/40 dark:bg-amber-900/20 blur-[100px] rounded-full -z-10 pointer-events-none" />
        )}
        <div className="max-w-5xl mx-auto px-5 sm:px-6 relative z-10">

          <div>
            <motion.div variants={heroReveal} initial="hidden" animate="visible" custom={0}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100/50 text-amber-800 border border-amber-200/50 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50 shadow-sm cursor-default">
                <GraduationCap className="w-3.5 h-3.5" /> Kho Tư Liệu Giáo Lý
              </span>
            </motion.div>
            
            <motion.h1 variants={heroReveal} initial="hidden" animate="visible" custom={0.05}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-amber-950 dark:text-amber-50 leading-[1.1] font-serif">
              Tài liệu học tập &<br />
              <span className="bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-600 bg-clip-text text-transparent italic font-serif">
                Hệ thống đề ôn luyện
              </span>
            </motion.h1>
            
            <motion.p variants={heroReveal} initial="hidden" animate="visible" custom={0.1}
              className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed max-w-xl font-medium">
              Hỗ trợ học tập trực tuyến, kho đề kiểm tra tự động và các văn kiện chính thức dành cho Huynh Trưởng & Thiếu Nhi — hoàn toàn miễn phí.
            </motion.p>


          </div>
        </div>
      </section>

      {/* STICKY FILTER TABS & SEARCH */}
      <div className="sticky top-0 z-30 bg-[#FDFBF7]/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-b border-amber-900/10 dark:border-amber-100/10 transition-colors shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col gap-3">
            
            {/* Hàng 1: Tiêu đề tĩnh & Ô Tìm kiếm */}
            <div className="flex items-center justify-between gap-4">
              <div className="hidden sm:flex items-center gap-2 text-amber-900 dark:text-amber-100 font-serif font-bold">
                <FileText className="w-5 h-5 opacity-80" />
                <span className="text-lg">Thư viện</span>
              </div>
              <div className="relative w-full sm:max-w-xs flex-shrink-0 ml-auto">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500 pointer-events-none z-10" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm đề thi, tài liệu..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-amber-900/20 dark:border-amber-100/10 bg-white/80 dark:bg-stone-900/60 text-[13px] font-medium text-amber-950 dark:text-amber-50 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-900/30 dark:focus:ring-amber-500/30 focus:bg-white dark:focus:bg-stone-900 shadow-sm backdrop-blur-md transition-all"
                />
              </div>
            </div>

            {/* Hàng 2: Tabs Khối học */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1">
              {KHOI_LIST.map((k) => {
                const active = activeKhoi === k.id;
                return (
                  <button 
                    key={k.id} 
                    onClick={() => setActiveKhoi(k.id)}
                    className={`flex-shrink-0 px-5 py-2 rounded-full text-[13px] font-bold snap-center transition-all duration-300 active:scale-[0.96]
                      ${active 
                        ? "bg-amber-900 text-amber-50 dark:bg-amber-100 dark:text-amber-950 shadow-sm border border-transparent" 
                        : "text-stone-600 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-stone-800/80 bg-white/50 dark:bg-stone-800/50 border border-amber-900/5 dark:border-amber-100/5"
                      }`}
                  >
                    {k.label}
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* CORE CONTENT MAIN AREA */}
      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-10 md:py-16 space-y-16 md:space-y-20 relative z-10">

        {/* SECTION 1: ĐỀ ÔN LUYỆN */}
        <section>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={vp} custom={0.2} className="mb-8 text-left">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-amber-100/50 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-900/5 dark:border-amber-100/5 flex items-center justify-center flex-shrink-0">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <h2 className="text-xl font-extrabold text-amber-950 dark:text-amber-50 tracking-tight font-serif">Đề ôn luyện trực tuyến</h2>
            </div>
            <p className="text-[13px] text-stone-500 dark:text-stone-400 font-medium pl-12">Chấm điểm tự động và hiển thị đáp án giải thích ngay sau khi hoàn thành bài thi.</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loading-q" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[180px] bg-white/40 dark:bg-stone-800/20 backdrop-blur-sm rounded-3xl border border-amber-900/5 dark:border-amber-100/5 p-6 animate-pulse">
                    <div className="flex justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-900/5 dark:bg-stone-700/30" />
                      <div className="w-12 h-5 rounded-full bg-amber-900/5 dark:bg-stone-700/30" />
                    </div>
                    <div className="w-3/4 h-5 bg-amber-900/5 dark:bg-stone-700/30 rounded mb-2" />
                    <div className="w-1/2 h-4 bg-amber-900/5 dark:bg-stone-700/30 rounded mb-6" />
                    <div className="h-px bg-amber-900/5 dark:bg-stone-700/30 w-full mb-3" />
                    <div className="flex justify-between">
                      <div className="w-16 h-4 bg-amber-900/5 dark:bg-stone-700/30 rounded" />
                      <div className="w-16 h-4 bg-amber-900/5 dark:bg-stone-700/30 rounded" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : filteredQuizzes.length > 0 ? (
              <motion.div key={activeKhoi + search}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredQuizzes.map((quiz, i) => {
                  const Icon = quiz.icon;
                  return (
                    <motion.div key={quiz.path} variants={fadeUp} initial="hidden" animate="visible" custom={i * 0.04}>
                      <Link to={quiz.path}
                        className="group flex flex-col justify-between h-full bg-white/80 dark:bg-stone-800/40 backdrop-blur-sm rounded-3xl border border-amber-900/10 dark:border-amber-100/10 p-6 shadow-sm hover:shadow-md hover:border-amber-900/20 dark:hover:border-amber-100/20 active:scale-[0.99] transition-all duration-300 text-left"
                      >
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-amber-900/5 dark:border-amber-100/5 ${quiz.iconBg}`}>
                              <Icon className={`w-5 h-5 ${quiz.iconColor}`} />
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-900/5 dark:border-amber-100/5 ${quiz.badgeColor}`}>
                              {quiz.badge}
                            </span>
                          </div>
                          <h3 className="text-[16px] font-bold text-amber-950 dark:text-amber-50 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors mb-1.5">{quiz.title}</h3>
                          <p className="text-[13px] text-stone-500 dark:text-stone-400 font-medium mb-6">{quiz.khoiLabel}</p>
                        </div>
                        
                        <div className="space-y-3.5">
                          <div className="h-px bg-amber-900/10 dark:bg-amber-100/10 w-full" />
                          <div className="flex items-center justify-between text-[12px] text-stone-500 dark:text-stone-400 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" /> {quiz.time}
                            </div>
                            <span>{quiz.questions}</span>
                          </div>
                          <div className="pt-1 flex items-center gap-1.5 text-[13px] font-bold text-amber-700 dark:text-amber-400 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
                            Vào làm bài <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.p key="empty-q" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-sm text-stone-500 dark:text-stone-400 font-medium py-12 text-center bg-white/60 dark:bg-stone-900/40 rounded-3xl border border-dashed border-amber-900/20 dark:border-amber-100/20">
                Không tìm thấy đề thi phù hợp với bộ lọc hiện tại.
              </motion.p>
            )}
          </AnimatePresence>
        </section>

        {/* SECTION 2: TÀI LIỆU */}
        <section>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={vp} custom={0.3} className="mb-8 text-left">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-amber-100/50 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-900/5 dark:border-amber-100/5 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-extrabold text-amber-950 dark:text-amber-50 tracking-tight font-serif">Tài liệu tham khảo & Học tập</h2>
            </div>
            <p className="text-[13px] text-stone-500 dark:text-stone-400 font-medium pl-12">Sách giáo lý các khối, văn kiện chính thức của Giáo hội và tài liệu bồi dưỡng Huynh Trưởng.</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loading-d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 bg-white/40 dark:bg-stone-800/20 backdrop-blur-sm rounded-2xl border border-amber-900/5 dark:border-amber-100/5 px-5 py-4 animate-pulse">
                     <div className="w-11 h-11 rounded-[14px] bg-amber-900/5 dark:bg-stone-700/30 flex-shrink-0" />
                     <div className="flex-1">
                        <div className="w-1/2 h-4 bg-amber-900/5 dark:bg-stone-700/30 rounded mb-2" />
                        <div className="w-3/4 h-3 bg-amber-900/5 dark:bg-stone-700/30 rounded" />
                     </div>
                     <div className="w-9 h-9 rounded-full bg-amber-900/5 dark:bg-stone-700/30 flex-shrink-0" />
                  </div>
                ))}
              </motion.div>
            ) : filteredDocs.length > 0 ? (
              <motion.div key={activeKhoi + search + "d"}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid gap-3"
              >
                {filteredDocs.map((doc, i) => {
                  const Icon = doc.icon;
                  const khoiMeta = KHOI_ICON_MAP[doc.khoi] || KHOI_ICON_MAP["all"];
                  const KhoiIcon = khoiMeta.icon;
                  return (
                    <motion.div key={doc.title} variants={fadeUp} initial="hidden" animate="visible" custom={i * 0.04}>
                      <a href={doc.url} onClick={(e) => handleDownload(e, doc.title)}
                        className="group flex items-center gap-4 bg-white/80 dark:bg-stone-800/40 backdrop-blur-sm rounded-2xl border border-amber-900/10 dark:border-amber-100/10 px-5 py-4 shadow-sm hover:shadow-md hover:border-amber-900/20 dark:hover:border-amber-100/20 active:scale-[0.995] transition-all duration-300 text-left"
                      >
                        <div className="w-11 h-11 rounded-[14px] bg-amber-50 dark:bg-stone-800 border border-amber-900/10 dark:border-amber-100/10 flex items-center justify-center flex-shrink-0 text-amber-700 dark:text-amber-400 shadow-sm">
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[14.5px] font-bold text-amber-950 dark:text-amber-50 truncate group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">{doc.title}</h3>
                          <p className="text-[12.5px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1 font-medium">{doc.desc}</p>
                        </div>
                        
                        <div className="flex items-center gap-3.5 flex-shrink-0">
                          <div className={`hidden sm:flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border border-amber-900/5 dark:border-amber-100/5 ${khoiMeta.bg} ${khoiMeta.color}`}>
                            <KhoiIcon className="w-3 h-3" />
                          </div>
                          <span className="text-[12px] text-stone-500 dark:text-stone-400 font-bold select-none">{doc.size}</span>
                          <div className="w-9 h-9 rounded-full bg-amber-100/50 dark:bg-stone-800 group-hover:bg-amber-200/50 dark:group-hover:bg-amber-500/20 border border-amber-900/10 dark:border-amber-100/10 flex items-center justify-center transition-colors">
                            <Download className="w-4 h-4 text-amber-800 dark:text-amber-400 transition-colors" />
                          </div>
                        </div>
                      </a>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.p key="empty-d" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-sm text-stone-500 dark:text-stone-400 font-medium py-12 text-center bg-white/60 dark:bg-stone-900/40 rounded-3xl border border-dashed border-amber-900/20 dark:border-amber-100/20">
                Không tìm thấy tài liệu phù hợp.
              </motion.p>
            )}
          </AnimatePresence>
        </section>

        {/* SECTION 3: CÁC KHỐI GIÁO LÝ */}
        <section>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={vp} custom={0.4} className="mb-8 text-left">
            <h2 className="text-xl font-extrabold text-amber-950 dark:text-amber-50 tracking-tight font-serif">Khám phá theo cấp lớp</h2>
            <p className="text-[13px] text-stone-500 dark:text-stone-400 font-medium mt-1">Xem chi tiết khung chương trình, thời lượng, độ tuổi và mục tiêu đào tạo của từng khối lớp học.</p>
          </motion.div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {KHOI_LINKS.map((k, i) => {
              const Icon = k.icon;
              return (
                <motion.div key={k.path} variants={fadeUp} initial="hidden" whileInView="visible"
                  viewport={vp} custom={i * 0.04}>
                  <Link to={k.path}
                    className={`group flex flex-col items-center gap-3 p-5 rounded-3xl border border-amber-900/10 dark:border-amber-100/10 bg-white/60 dark:bg-stone-800/40 backdrop-blur-sm hover:shadow-md hover:border-amber-900/20 dark:hover:border-amber-100/20 transition-all duration-300 text-center relative overflow-hidden`}
                  >
                    <div className={`w-11 h-11 rounded-xl bg-white dark:bg-stone-900 border border-amber-900/5 dark:border-amber-100/5 flex items-center justify-center shadow-sm group-hover:scale-105 active:scale-105 transition-transform duration-300 ${k.bg}`}>
                      <Icon className={`w-5 h-5 ${k.color}`} />
                    </div>
                    <span className="text-[13px] font-bold text-amber-950 dark:text-amber-50 tracking-tight leading-tight">{k.label}</span>
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