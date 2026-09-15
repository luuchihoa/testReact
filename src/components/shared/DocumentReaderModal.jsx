import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  X, Download, Printer, BookOpen, ChevronLeft, ChevronRight, 
  ZoomIn, ZoomOut, Check, Menu, Share2, Sparkles, Clock, ExternalLink
} from "lucide-react";
import { useToast } from "../ui/ToastContext.jsx";

const THEMES = {
  light: {
    id: "light",
    label: "Sáng",
    prose: "prose-stone prose-amber",
    style: {
      "--r-bg": "#FAF8F5",
      "--r-card": "#FFFFFF",
      "--r-header": "rgba(250, 248, 245, 0.97)",
      "--r-text": "#1C1917",          // 16.5:1 AAA vs #FAF8F5
      "--r-muted": "#524F4A",         // 7.7:1 AAA vs #FAF8F5
      "--r-border": "#D6D3CD",        // Viền ranh giới rõ ràng
      "--r-accent": "#78350F",        // 8.6:1 AAA vs #FAF8F5
      "--r-accent-bg": "#FEF3C7",
      "--r-accent-border": "#FDE68A",
      "--r-btn-bg": "#F5F3EF",
      "--r-btn-border": "#E6E2D9",
      "--r-btn-hover": "#EAE5DB",
      "--r-active-item": "#F3ECE0",
      "--r-prose-quote-bg": "#FEF3C7",
      "--r-prose-quote-border": "#B45309",
      "--r-prose-quote-text": "#451A03",
    },
  },
  sepia: {
    id: "sepia",
    label: "Giấy Cũ",
    prose: "prose-amber",
    style: {
      "--r-bg": "#F4EEDD",
      "--r-card": "#ECE4CF",
      "--r-header": "rgba(244, 238, 221, 0.97)",
      "--r-text": "#2C2013",          // 13.7:1 AAA vs #F4EEDD
      "--r-muted": "#5C4A35",         // 7.3:1 AAA vs #F4EEDD
      "--r-border": "#C9BC9F",
      "--r-accent": "#6B3A0E",        // 8.1:1 AAA vs #F4EEDD
      "--r-accent-bg": "#E6D7BA",
      "--r-accent-border": "#D5C3A1",
      "--r-btn-bg": "#ECE3CD",
      "--r-btn-border": "#DCD0B4",
      "--r-btn-hover": "#E0D4B7",
      "--r-active-item": "#DFD3B9",
      "--r-prose-quote-bg": "#E8DCC0",
      "--r-prose-quote-border": "#8C531B",
      "--r-prose-quote-text": "#38230D",
    },
  },
  dark: {
    id: "dark",
    label: "Tối",
    prose: "prose-invert",
    style: {
      "--r-bg": "#141211",
      "--r-card": "#1E1B18",
      "--r-header": "rgba(20, 18, 17, 0.97)",
      "--r-text": "#F5F3EF",          // 16.8:1 AAA vs #141211
      "--r-muted": "#B5B0A6",         // 8.6:1 AAA vs #141211
      "--r-border": "#3E3A35",
      "--r-accent": "#FBBF24",        // 11.2:1 AAA vs #141211
      "--r-accent-bg": "rgba(251, 191, 36, 0.15)",
      "--r-accent-border": "rgba(251, 191, 36, 0.35)",
      "--r-btn-bg": "#24211D",
      "--r-btn-border": "#3A352F",
      "--r-btn-hover": "#2E2A24",
      "--r-active-item": "#36312A",
      "--r-prose-quote-bg": "rgba(251, 191, 36, 0.1)",
      "--r-prose-quote-border": "#F59E0B",
      "--r-prose-quote-text": "#FEF3C7",
    },
  },
};

// Chuẩn hóa văn bản: triệt tiêu emoji ❓, 🌱 và loại bỏ các trường hợp lặp dấu ngoặc kép ("" -> ", ““ -> “)
const sanitizeChapterContent = (raw) => {
  if (!raw) return "";
  return raw
    .replace(/[❓🌱]/gu, "")
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
      const timer = setTimeout(() => {
        setActiveChapterIndex(0);
        setScrollProgress(0);
        if (contentContainerRef.current) {
          contentContainerRef.current.scrollTop = 0;
        }
      }, 0);
      return () => clearTimeout(timer);
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

      // Tạm dừng smooth scroll Lenis nếu có
      if (typeof window !== "undefined" && window.lenis) {
        window.lenis.stop();
      }

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = originalOverflow;
        if (typeof window !== "undefined" && window.lenis) {
          window.lenis.start();
        }
      };
    }
  }, [isOpen, onClose]);

  // Theo dõi % cuộn đọc
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const max = scrollHeight - clientHeight;
    setScrollProgress(max > 0 ? (scrollTop / max) * 100 : 0);
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
      } catch (err) {
        // Người dùng hủy chia sẻ
        void err;
      }
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
            style={theme.style}
            className={`relative z-50 w-full h-[100dvh] sm:h-[92vh] sm:max-w-4xl sm:rounded-[28px] shadow-2xl flex flex-col overflow-hidden border border-[var(--r-border)] bg-[var(--r-bg)] text-[var(--r-text)] overscroll-contain transition-colors duration-300 ${themeKey === "dark" ? "dark" : ""}`}
          >
            {/* Thanh Tiến Trình Đọc */}
            <div className="h-1 w-full bg-[var(--r-border)]/40">
              <div 
                className="h-full bg-[var(--r-accent)] transition-all duration-150"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>

            {/* TOP BAR: HEADER ĐIỀU KHIỂN */}
            <header className="px-4 sm:px-6 py-3.5 border-b border-[var(--r-border)] bg-[var(--r-header)] backdrop-blur-xl flex items-center justify-between gap-3 flex-shrink-0 z-20">
              {/* Tiêu đề & Thông tin tài liệu */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setShowToc(!showToc)}
                  aria-label="Mục lục"
                  className="p-2 rounded-xl border border-[var(--r-border)] bg-[var(--r-btn-bg)] hover:bg-[var(--r-btn-hover)] active:scale-95 transition-all text-[var(--r-text)]"
                  title="Mục lục các chương"
                >
                  <Menu className="w-4 h-4" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-[var(--r-accent-bg)] text-[var(--r-accent)] border border-[var(--r-accent-border)]">
                      {doc.khoiLabel || doc.badge}
                    </span>
                    <span className="text-[11px] text-[var(--r-muted)] font-medium hidden sm:inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[var(--r-accent)]" /> {doc.readTime || "Tài liệu học"}
                    </span>
                  </div>
                  <h2 className="text-[14.5px] sm:text-[16px] font-bold truncate tracking-tight font-serif mt-0.5 text-[var(--r-text)]">
                    {doc.title}
                  </h2>
                </div>
              </div>

              {/* Bộ công cụ đọc: Cỡ chữ, Màu nền, Tải về, In, Đóng */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {/* Tùy chỉnh cỡ chữ */}
                <div className="hidden sm:flex items-center rounded-xl border border-[var(--r-border)] p-0.5 bg-[var(--r-btn-bg)]">
                  <button
                    onClick={() => setFontSize((s) => Math.max(13, s - 1))}
                    className="p-1.5 rounded-lg hover:bg-[var(--r-btn-hover)] active:scale-90 transition-all text-xs font-bold text-[var(--r-text)]"
                    title="Giảm cỡ chữ"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-bold px-1.5 select-none text-[var(--r-text)]">{fontSize}px</span>
                  <button
                    onClick={() => setFontSize((s) => Math.min(22, s + 1))}
                    className="p-1.5 rounded-lg hover:bg-[var(--r-btn-hover)] active:scale-90 transition-all text-xs font-bold text-[var(--r-text)]"
                    title="Tăng cỡ chữ"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Tùy chỉnh nền (Light/Sepia/Dark) */}
                <div className="hidden md:flex items-center rounded-xl border border-[var(--r-border)] p-0.5 bg-[var(--r-btn-bg)]">
                  {Object.values(THEMES).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setThemeKey(t.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        themeKey === t.id 
                          ? "bg-[var(--r-card)] text-[var(--r-text)] shadow-xs border border-[var(--r-border)]" 
                          : "text-[var(--r-muted)] hover:text-[var(--r-text)] hover:bg-[var(--r-btn-hover)]"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Chia sẻ */}
                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl border border-[var(--r-border)] bg-[var(--r-btn-bg)] hover:bg-[var(--r-btn-hover)] active:scale-95 transition-all text-[var(--r-text)] hidden sm:flex"
                  title="Chia sẻ tài liệu"
                  aria-label="Chia sẻ tài liệu"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {/* In ấn */}
                <button
                  onClick={handlePrint}
                  className="p-2 rounded-xl border border-[var(--r-border)] bg-[var(--r-btn-bg)] hover:bg-[var(--r-btn-hover)] active:scale-95 transition-all text-[var(--r-text)] hidden sm:flex"
                  title="In tài liệu"
                >
                  <Printer className="w-4 h-4" />
                </button>

                {/* Tải về */}
                <button
                  onClick={() => onDownload?.(doc)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--r-accent)] text-white text-[12.5px] font-bold shadow-xs hover:opacity-90 active:scale-95 transition-all"
                  title="Tải file về máy"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tải về</span>
                </button>

                {/* Nút Đóng Modal */}
                <button
                  onClick={onClose}
                  aria-label="Đóng"
                  className="p-2 rounded-xl border border-[var(--r-border)] bg-[var(--r-btn-bg)] hover:bg-red-500/15 hover:text-red-700 hover:border-red-300 dark:hover:text-red-400 active:scale-95 transition-all ml-1 text-[var(--r-text)]"
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
                    className="absolute md:relative z-30 w-72 h-full border-r border-[var(--r-border)] bg-[var(--r-card)] flex flex-col shadow-lg md:shadow-none"
                  >
                    <div className="p-4 border-b border-[var(--r-border)] flex items-center justify-between flex-shrink-0">
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--r-muted)]">Mục lục các chương</span>
                      <button 
                        onClick={() => setShowToc(false)} 
                        className="p-1 rounded-md hover:bg-[var(--r-btn-hover)] text-[var(--r-text)]"
                        aria-label="Đóng mục lục"
                      >
                        <X className="w-4 h-4" />
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
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] transition-all flex items-start gap-2.5 ${
                              isActive
                                ? "bg-[var(--r-active-item)] text-[var(--r-accent)] font-bold border border-[var(--r-accent-border)] shadow-xs"
                                : "text-[var(--r-text)] hover:bg-[var(--r-btn-hover)] font-medium"
                            }`}
                          >
                            <span className={`text-[11px] font-mono mt-0.5 ${isActive ? "text-[var(--r-accent)] font-bold" : "text-[var(--r-muted)]"}`}>
                              {String(idx + 1).padStart(2, "0")}.
                            </span>
                            <span className="flex-1 leading-snug">{ch.title.replace(/^\d+\.\s*/, "")}</span>
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
                  <div className="border-b border-[var(--r-border)] pb-4 mb-6">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--r-accent)]">
                      Chương {activeChapterIndex + 1} / {chapters.length || 1}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif mt-1 text-[var(--r-text)]">
                      {currentChapter?.title || doc.title}
                    </h1>
                    {doc.author && (
                      <p className="text-[12.5px] text-[var(--r-muted)] mt-1.5 font-medium italic">
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
                        // eslint-disable-next-line no-unused-vars
                        blockquote: ({ node, children, ...props }) => (
                          <blockquote
                            className="my-5 border-l-4 border-[var(--r-prose-quote-border)] bg-[var(--r-prose-quote-bg)] text-[var(--r-prose-quote-text)] px-5 py-3.5 rounded-r-2xl font-serif not-italic shadow-xs [&>p]:my-1.5 [&>p]:leading-relaxed before:content-none after:content-none"
                            {...props}
                          >
                            {children}
                          </blockquote>
                        ),
                        // eslint-disable-next-line no-unused-vars
                        h4: ({ node, children, ...props }) => {
                          const childArray = React.Children.toArray(children);
                          const firstChild = childArray[0];
                          if (typeof firstChild === "string") {
                            const match = firstChild.match(/^\[\s*CÂU\s+([^\]]+)\]\s*(.*)$/i);
                            if (match) {
                              const cauNum = match[1].trim();
                              const remainingFirst = match[2];
                              const remainingChildren = [remainingFirst, ...childArray.slice(1)];
                              return (
                                <h4 
                                  className="mt-8 mb-3 flex flex-col sm:flex-row sm:items-baseline gap-2.5 font-serif text-[17px] sm:text-[18px] font-bold text-[var(--r-text)] tracking-tight leading-snug border-b border-[var(--r-border)]/60 pb-2.5 not-prose" 
                                  {...props}
                                >
                                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md font-mono text-[11px] font-extrabold uppercase tracking-wider bg-[var(--r-accent-bg)] text-[var(--r-accent)] border border-[var(--r-accent-border)] flex-shrink-0 select-none shadow-xs">
                                    CÂU {cauNum}
                                  </span>
                                  <span className="flex-1 text-[var(--r-text)]">
                                    {remainingChildren}
                                  </span>
                                </h4>
                              );
                            }
                          }
                          return (
                            <h4 className="mt-6 mb-2 font-serif text-[16.5px] font-bold text-[var(--r-text)]" {...props}>
                              {children}
                            </h4>
                          );
                        },
                      }}
                    >
                      {sanitizeChapterContent(currentChapter?.content) || "Đang tải nội dung văn bản..."}
                    </ReactMarkdown>
                  </div>

                  {/* Chân trang chương: Nút chuyển chương trước / sau */}
                  {chapters.length > 1 && (
                    <div className="pt-8 mt-12 border-t border-[var(--r-border)] flex items-center justify-between gap-3">
                      <button
                        disabled={activeChapterIndex === 0}
                        onClick={() => setActiveChapterIndex((i) => Math.max(0, i - 1))}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--r-border)] bg-[var(--r-btn-bg)] disabled:opacity-30 disabled:pointer-events-none hover:bg-[var(--r-btn-hover)] active:scale-95 transition-all text-[13px] font-bold text-[var(--r-text)]"
                      >
                        <ChevronLeft className="w-4 h-4" /> Phần trước
                      </button>

                      <span className="text-xs text-[var(--r-muted)] font-bold">
                        {activeChapterIndex + 1} / {chapters.length}
                      </span>

                      <button
                        disabled={activeChapterIndex === chapters.length - 1}
                        onClick={() => setActiveChapterIndex((i) => Math.min(chapters.length - 1, i + 1))}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--r-accent)] text-white disabled:opacity-30 disabled:pointer-events-none hover:opacity-90 active:scale-95 transition-all text-[13px] font-bold shadow-xs"
                      >
                        Phần tiếp theo <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Liên kết nguồn chính thức của Giáo Hội / HĐGMVN */}
                  {doc?.officialSourceUrl && (
                    <div className="pt-6 mt-8 border-t border-[var(--r-border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--r-muted)]">
                      <span className="flex items-center gap-1.5 font-semibold text-[var(--r-text)]">
                        <Sparkles className="w-3.5 h-3.5 text-[var(--r-accent)] flex-shrink-0" />
                        Ấn bản chính thức của Hội Thánh Công Giáo
                      </span>
                      <a
                        href={doc.officialSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--r-accent-bg)] text-[var(--r-accent)] border border-[var(--r-accent-border)] hover:opacity-90 font-bold transition-all shadow-xs"
                      >
                        <span>Đọc toàn văn ấn bản số (Nguồn HĐGMVN)</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
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
