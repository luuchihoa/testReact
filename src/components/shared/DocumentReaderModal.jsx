import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  X, Download, Printer, BookOpen, ChevronLeft, ChevronRight, 
  ZoomIn, ZoomOut, Check, Menu, Share2, Sparkles, Clock
} from "lucide-react";
import { useToast } from "../ui/ToastContext.jsx";

const THEMES = {
  light: {
    id: "light",
    label: "Sáng",
    bg: "bg-[#FDFBF7]",
    cardBg: "bg-white",
    text: "text-stone-800",
    textMuted: "text-stone-500",
    border: "border-amber-900/10",
    headerBg: "bg-[#FDFBF7]/95",
    accent: "text-amber-900",
    prose: "prose-stone prose-amber",
  },
  sepia: {
    id: "sepia",
    label: "Giấy Cũ",
    bg: "bg-[#F7F1E5]",
    cardBg: "bg-[#EFE7D5]",
    text: "text-[#433422]",
    textMuted: "text-[#7D6B56]",
    border: "border-[#7D6B56]/20",
    headerBg: "bg-[#F7F1E5]/95",
    accent: "text-[#8C531B]",
    prose: "prose-amber",
  },
  dark: {
    id: "dark",
    label: "Tối",
    bg: "bg-[#1C1917]",
    cardBg: "bg-[#292524]",
    text: "text-stone-200",
    textMuted: "text-stone-400",
    border: "border-amber-100/10",
    headerBg: "bg-[#1C1917]/95",
    accent: "text-amber-400",
    prose: "prose-invert",
  },
};

// Loại bỏ các trường hợp lặp dấu ngoặc kép liên tiếp trong văn bản gốc ("" -> ", ““ -> “)
const sanitizeChapterContent = (raw) => {
  if (!raw) return "";
  return raw
    .replace(/(["“]){2,}/g, "$1")
    .replace(/(["”]){2,}/g, "$1");
};

export default function DocumentReaderModal({ doc, isOpen, onClose, onDownload }) {
  const { showToast } = useToast();
  const [themeKey, setThemeKey] = useState("light");
  const [fontSize, setFontSize] = useState(16); // 13px to 22px
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentContainerRef = useRef(null);

  const theme = THEMES[themeKey] || THEMES.light;
  const chapters = doc?.chapters || [];
  const currentChapter = chapters[activeChapterIndex] || chapters[0];

  // Khởi tạo lại chương và vị trí cuộn khi mở tài liệu mới
  useEffect(() => {
    if (isOpen) {
      setActiveChapterIndex(0);
      setScrollProgress(0);
      if (contentContainerRef.current) {
        contentContainerRef.current.scrollTop = 0;
      }
    }
  }, [isOpen, doc?.id]);

  // Khôi phục vị trí cuộn khi chuyển chương
  useEffect(() => {
    if (contentContainerRef.current) {
      contentContainerRef.current.scrollTop = 0;
    }
  }, [activeChapterIndex]);

  // Khóa scroll cho background page, dừng Lenis và bắt phím ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);

      // Lưu trạng thái cuộn ban đầu của body
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Tạm dừng Lenis smooth scrolling để không cuộn background page bên dưới
      if (window.lenis) {
        window.lenis.stop();
      }

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = originalOverflow;
        
        // Kích hoạt lại Lenis khi đóng modal
        if (window.lenis) {
          window.lenis.start();
        }
      };
    }
  }, [isOpen, onClose]);

  // Theo dõi % cuộn đọc
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight > clientHeight) {
      const pct = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
      setScrollProgress(pct);
    } else {
      setScrollProgress(100);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: doc.title,
          text: doc.desc || doc.description,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast?.("Đã sao chép liên kết tài liệu vào bộ nhớ tạm!", "success");
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && doc && (
        <div 
          data-lenis-prevent
          className="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden font-sans p-0 sm:p-4 md:p-6"
        >
          {/* Backdrop */}
          <motion.div
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            onWheel={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onTouchMove={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity touch-none"
          />

          {/* Modal Container */}
          <motion.div
            data-lenis-prevent
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            className={`relative z-50 w-full h-[100dvh] sm:h-[92vh] sm:max-w-4xl sm:rounded-[28px] shadow-2xl flex flex-col overflow-hidden border ${theme.border} ${theme.bg} ${theme.text} overscroll-contain transition-colors duration-300`}
          >
          {/* Thanh Tiến Trình Đọc */}
          <div className="h-1 w-full bg-amber-900/10 dark:bg-amber-100/10">
            <div 
              className="h-full bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-600 transition-all duration-150"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          {/* TOP BAR: HEADER ĐIỀU KHIỂN */}
          <header className={`px-4 sm:px-6 py-3.5 border-b ${theme.border} ${theme.headerBg} backdrop-blur-xl flex items-center justify-between gap-3 flex-shrink-0 z-20`}>
            {/* Tiêu đề & Thông tin tài liệu */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setShowToc(!showToc)}
                aria-label="Mục lục"
                className={`p-2 rounded-xl border ${theme.border} hover:bg-amber-900/5 active:scale-95 transition-all text-stone-600 dark:text-stone-300`}
                title="Mục lục các chương"
              >
                <Menu className="w-4 h-4" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20">
                    {doc.khoiLabel || doc.badge}
                  </span>
                  <span className="text-[11px] text-stone-400 font-medium hidden sm:inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {doc.readTime || "Tài liệu học"}
                  </span>
                </div>
                <h2 className="text-[14.5px] sm:text-[16px] font-bold truncate tracking-tight font-serif mt-0.5">
                  {doc.title}
                </h2>
              </div>
            </div>

            {/* Bộ công cụ đọc: Cỡ chữ, Màu nền, Tải về, In, Đóng */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Tùy chỉnh cỡ chữ */}
              <div className={`hidden sm:flex items-center rounded-xl border ${theme.border} p-0.5 bg-black/5 dark:bg-white/5`}>
                <button
                  onClick={() => setFontSize((s) => Math.max(13, s - 1))}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 transition-all text-xs font-bold"
                  title="Giảm cỡ chữ"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-bold px-1.5 select-none">{fontSize}px</span>
                <button
                  onClick={() => setFontSize((s) => Math.min(22, s + 1))}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 transition-all text-xs font-bold"
                  title="Tăng cỡ chữ"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tùy chỉnh nền (Light/Sepia/Dark) */}
              <div className={`hidden md:flex items-center rounded-xl border ${theme.border} p-0.5 bg-black/5 dark:bg-white/5`}>
                {Object.values(THEMES).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setThemeKey(t.id)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      themeKey === t.id ? "bg-white dark:bg-stone-800 shadow-xs" : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* In ấn */}
              <button
                onClick={handlePrint}
                className={`p-2 rounded-xl border ${theme.border} hover:bg-amber-900/5 active:scale-95 transition-all text-stone-600 dark:text-stone-300 hidden sm:flex`}
                title="In tài liệu"
              >
                <Printer className="w-4 h-4" />
              </button>

              {/* Tải về */}
              <button
                onClick={() => onDownload?.(doc)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white text-[12.5px] font-bold shadow-xs hover:opacity-90 active:scale-95 transition-all"
                title="Tải file về máy"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tải về</span>
              </button>

              {/* Nút Đóng Modal */}
              <button
                onClick={onClose}
                aria-label="Đóng"
                className={`p-2 rounded-xl border ${theme.border} hover:bg-red-500/10 hover:text-red-600 active:scale-95 transition-all ml-1`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

            {/* MAIN BODY: NỘI DUNG TÀI LIỆU & MỤC LỤC */}
            <div className="relative flex-1 flex overflow-hidden">
              {/* Sidebar Mục Lục (Table of Contents) */}
              <AnimatePresence>
                {showToc && chapters.length > 0 && (
                  <motion.aside
                    data-lenis-prevent
                    initial={{ x: -280, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -280, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute md:relative z-30 w-72 h-full border-r ${theme.border} ${theme.cardBg} flex flex-col shadow-lg md:shadow-none`}
                  >
                    <div className="p-4 border-b border-inherit flex items-center justify-between flex-shrink-0">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Mục lục tài liệu</span>
                      <button onClick={() => setShowToc(false)} className="p-1 rounded-md hover:bg-black/5 text-stone-400">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div 
                      data-lenis-prevent
                      onWheel={(e) => e.stopPropagation()}
                      className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-1.5"
                    >
                      {chapters.map((ch, idx) => {
                        const isActive = activeChapterIndex === idx;
                        return (
                          <button
                            key={ch.id || idx}
                            onClick={() => {
                              setActiveChapterIndex(idx);
                              setShowToc(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                              isActive
                                ? "bg-amber-900/10 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 font-bold"
                                : "hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100"
                            }`}
                          >
                            {ch.title}
                          </button>
                        );
                      })}
                    </div>
                  </motion.aside>
                )}
              </AnimatePresence>

              {/* Content Display: Vùng cuộn đọc nội dung tài liệu */}
              <div
                ref={contentContainerRef}
                onScroll={handleScroll}
                onWheel={(e) => e.stopPropagation()}
                data-lenis-prevent
                className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-12 md:px-16 py-8 md:py-12 scroll-smooth"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Header Chương */}
                  <div className="border-b border-inherit pb-4 mb-6">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                      Phần {activeChapterIndex + 1} / {chapters.length || 1}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif mt-1">
                      {currentChapter?.title || doc.title}
                    </h1>
                    {doc.author && (
                      <p className="text-[12px] text-stone-400 mt-1 font-medium italic">
                        Nguồn: {doc.author}
                      </p>
                    )}
                  </div>

                  {/* Văn bản Markdown */}
                  <div 
                    className={`prose ${theme.prose} max-w-none leading-relaxed transition-all prose-blockquote:before:content-none prose-blockquote:after:content-none prose-blockquote:not-italic`}
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        blockquote: ({ node, children, ...props }) => (
                          <blockquote
                            className="my-5 border-l-4 border-amber-600/70 dark:border-amber-400/80 bg-amber-500/10 dark:bg-amber-950/25 px-5 py-3.5 rounded-r-2xl font-serif text-stone-700 dark:text-stone-300 not-italic shadow-xs [&>p]:my-1.5 [&>p]:leading-relaxed before:content-none after:content-none"
                            {...props}
                          >
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {sanitizeChapterContent(currentChapter?.content) || "Đang tải nội dung văn bản..."}
                    </ReactMarkdown>
                  </div>

                  {/* Chân trang chương: Nút chuyển chương trước / sau */}
                  {chapters.length > 1 && (
                    <div className="pt-8 mt-12 border-t border-inherit flex items-center justify-between gap-3">
                      <button
                        disabled={activeChapterIndex === 0}
                        onClick={() => setActiveChapterIndex((i) => Math.max(0, i - 1))}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-inherit disabled:opacity-30 disabled:pointer-events-none hover:bg-amber-900/5 active:scale-95 transition-all text-[13px] font-bold"
                      >
                        <ChevronLeft className="w-4 h-4" /> Phần trước
                      </button>

                      <span className="text-xs text-stone-400 font-medium">
                        {activeChapterIndex + 1} / {chapters.length}
                      </span>

                      <button
                        disabled={activeChapterIndex === chapters.length - 1}
                        onClick={() => setActiveChapterIndex((i) => Math.min(chapters.length - 1, i + 1))}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-900 text-white dark:bg-amber-600 disabled:opacity-30 disabled:pointer-events-none hover:opacity-90 active:scale-95 transition-all text-[13px] font-bold"
                      >
                        Phần tiếp theo <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
