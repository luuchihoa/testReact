import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../../components/ui/ToastContext.jsx";
import { Loader2, CalendarDays, User, ArrowLeft, Clock, Share2, Link2 } from "lucide-react";

// Định nghĩa các icon mạng xã hội SVG thống nhất
const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const MessengerIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.914 1.458 5.513 3.738 7.21v3.834a.75.75 0 001.166.628l4.135-2.756c.31.042.627.066.948.066 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.095 12.35l-2.457-2.62-4.793 2.62 5.27-5.6 2.457 2.62 4.793-2.62-5.27 5.6z"/>
  </svg>
);

const ZaloIcon = ({ className }) => (
  <div className={`${className} flex items-center justify-center font-black select-none text-[13px]`} style={{ fontFamily: 'sans-serif' }}>
    Z
  </div>
);

function formatDateVi(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Danh sách kênh chia sẻ dùng chung cho cả popover desktop và bottom sheet
// mobile — tránh lặp lại markup 2 lần khi chỉ khác nhau về kích thước/bố cục.
const SHARE_CHANNELS = [
  { key: "facebook",  label: "Facebook",       Icon: FacebookIcon,  color: "#1877F2" },
  { key: "messenger", label: "Messenger",      Icon: MessengerIcon, color: "#0084FF" },
  { key: "zalo",      label: "Zalo",           Icon: ZaloIcon,      color: "#0068FF" },
  { key: "copy",      label: "Sao chép liên kết", Icon: Link2,      color: "#92400E" },
];

import { usePageMotion } from "../../hooks/usePageMotion.js";

export default function ArticleDetail() {
  const { fadeUp, vp } = usePageMotion();
  const { slug } = useParams();
  const { showToast } = useToast();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setNotFound(false);

      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        console.error("ArticleDetail: fetch error:", error);
      }
      if (!data) {
        setNotFound(true);
      } else {
        setArticle(data);
      }
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [slug]);

  const shareTo = async (channel) => {
    setIsShareOpen(false);
    const url = window.location.href;
    
    const isLocal = url.includes("localhost") || url.includes("127.0.0.1");
    if ((channel === "facebook" || channel === "messenger" || channel === "zalo") && isLocal) {
      showToast("Lưu ý: Link localhost không hiển thị được nội dung xem trước trên mạng xã hội.", "info");
    }

    if (channel === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
    } else if (channel === "messenger") {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.open(`fb-messenger://share/?link=${encodeURIComponent(url)}`, "_blank");
      } else {
        window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=2914944195427211&redirect_uri=${encodeURIComponent(url)}`, "_blank");
      }
    } else if (channel === "zalo") {
      window.open(`https://sp.zalo.me/share_to_zalo?url=${encodeURIComponent(url)}`, "_blank");
    } else if (channel === "copy") {
      try {
        await navigator.clipboard.writeText(url);
        showToast("Đã sao chép liên kết vào bộ nhớ tạm!", "success");
      } catch (err) {
        console.error("Copy error:", err);
        showToast("Không thể sao chép liên kết", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917] flex items-center justify-center gap-2.5 py-24 text-stone-500">
        <Loader2 className="w-6 h-6 animate-spin text-amber-900 dark:text-amber-500" />
        <span className="text-sm font-bold">Đang tải nội dung…</span>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917] flex flex-col items-center justify-center gap-4 text-center px-6 py-20"
      >
        <p className="text-xl font-bold font-serif text-amber-950 dark:text-amber-50">Không tìm thấy bài viết</p>
        <p className="text-sm font-medium text-stone-500 dark:text-stone-400 max-w-xs">Bài viết có thể đã bị gỡ hoặc chưa được duyệt bởi ban quản trị.</p>
        <Link to="/bài-viết" className="text-sm font-bold text-amber-900 dark:text-amber-500 md:hover:underline">
          ← Quay lại danh sách bài viết
        </Link>
      </motion.div>
    );
  }

  const wordCount = (article.content || "").trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917] text-stone-800 dark:text-stone-200 transition-colors duration-500 overflow-x-hidden">

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        className="max-w-3xl mx-auto px-5 sm:px-6 py-8 sm:py-12"
      >
        
        {/* Nút quay lại (Secondary Button) */}
        <motion.div variants={fadeUp} className="mb-8">
          <Link to="/bài-viết" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13.5px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-black/5 dark:border-white/5 transition-all duration-300 active:scale-[0.98] md:hover:bg-stone-200 dark:md:hover:bg-stone-700">
            <ArrowLeft className="w-4 h-4" /> Tất cả bài viết
          </Link>
        </motion.div>

        {/* Chuyên mục bài viết (Nhãn phụ) */}
        {article.category && (
          <motion.span
            variants={fadeUp}
            className="inline-block mb-4 px-3 py-1.5 rounded-lg bg-amber-50/80 dark:bg-amber-900/20 text-[11px] font-bold uppercase tracking-wider text-amber-800/80 dark:text-amber-400/80 border border-amber-200/50 dark:border-amber-800/30"
          >
            {article.category}
          </motion.span>
        )}

        {/* Tiêu đề bài viết */}
        <motion.h1
          variants={fadeUp}
          className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold font-serif text-amber-950 dark:text-amber-50 tracking-tight leading-tight mb-6"
        >
          {article.title}
        </motion.h1>

        {/* Meta thông tin chi tiết */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-900/10 dark:border-amber-100/10 pb-5 mb-8 text-[13px] text-stone-500 dark:text-stone-400 font-medium"
        >
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-1.5 text-amber-950 dark:text-amber-50 font-bold"><User className="w-4 h-4 text-stone-400" /> {article.author_username}</span>
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-stone-400" /> {formatDateVi(article.published_at || article.updated_at)}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4 text-stone-400" /> {readingTime} phút đọc</span>
          </div>

          <div className="relative">
            <motion.button
              type="button"
              onClick={() => setIsShareOpen(!isShareOpen)}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-stone-900/40 text-[13px] font-bold text-stone-700 dark:text-stone-200 md:hover:bg-amber-50/50 dark:md:hover:bg-amber-900/20 transition-colors shadow-sm backdrop-blur-sm"
              title="Chia sẻ bài viết này"
            >
              <Share2 className="w-4 h-4 text-amber-900 dark:text-amber-500" /> Chia sẻ
            </motion.button>

            {/* Popover Dropdown cho Desktop */}
            <AnimatePresence>
              {isShareOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    style={{ transformOrigin: "top right" }}
                    className="md:block hidden absolute right-0 mt-3 w-56 bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border border-amber-900/10 dark:border-amber-100/10 rounded-2xl shadow-lg py-3 z-50"
                  >
                    <div className="px-4 py-1.5 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70">Chia sẻ bài viết</span>
                    </div>
                    {SHARE_CHANNELS.slice(0, 3).map(({ key, label, Icon, color }) => (
                      <button key={key} type="button" onClick={() => shareTo(key)} className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-stone-700 dark:text-stone-300 md:hover:bg-amber-50/50 dark:md:hover:bg-amber-900/20 flex items-center gap-3 transition-colors">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}1A`, color }}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {label}
                      </button>
                    ))}
                    <div className="border-t border-amber-900/5 dark:border-amber-100/5 my-2"></div>
                    <button type="button" onClick={() => shareTo("copy")} className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-amber-900 dark:text-amber-500 md:hover:bg-amber-50/50 dark:md:hover:bg-amber-900/20 flex items-center gap-3 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-900 dark:text-amber-500 flex-shrink-0">
                        <Link2 className="w-4 h-4" />
                      </div>
                      Sao chép liên kết
                    </button>
                  </motion.div>
                  <div className="md:block hidden fixed inset-0 z-40" onClick={() => setIsShareOpen(false)}></div>
                </>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Ảnh bìa bài viết */}
        {article.cover_image && (
          <motion.div
            variants={fadeUp}
            className="w-full rounded-[28px] overflow-hidden shadow-sm mb-10 max-h-[460px] border border-amber-900/5 dark:border-amber-100/5 bg-white/50 dark:bg-stone-900/30"
          >
            <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover" />
          </motion.div>
        )}

        {/* Nội dung bài viết Markdown */}
        <motion.div variants={fadeUp} className="prose prose-stone dark:prose-invert prose-lg max-w-none 
          prose-headings:font-serif prose-headings:text-amber-950 dark:prose-headings:text-amber-50 prose-headings:tracking-tight
          prose-p:leading-relaxed prose-p:text-stone-700 dark:prose-p:text-stone-300
          prose-a:text-amber-800 dark:prose-a:text-amber-500 prose-a:font-semibold hover:prose-a:text-amber-600
          prose-img:rounded-[20px] prose-img:shadow-sm prose-img:mx-auto prose-img:border prose-img:border-amber-900/5 dark:prose-img:border-amber-100/5
          prose-li:marker:text-amber-900/50 dark:prose-li:marker:text-amber-500/50 prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:rounded-r-2xl w-full max-w-full overflow-x-hidden break-words prose-a:break-all prose-pre:max-w-full prose-pre:overflow-x-auto prose-table:max-w-full prose-table:overflow-x-auto"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            skipHtml
            components={{ a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" /> }}
          >
            {article.content}
          </ReactMarkdown>
        </motion.div>
      </motion.div>

      {/* Mobile Bottom Sheet Menu chia sẻ */}
      <AnimatePresence>
        {isShareOpen && (
          <div className="md:hidden block fixed inset-0 z-50">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-10 bg-stone-900/40 dark:bg-black/60 backdrop-blur-sm" 
              onClick={() => setIsShareOpen(false)}
            />
            
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 dark:bg-[#1C1917]/95 backdrop-blur-xl rounded-t-[32px] border-t border-amber-900/10 dark:border-amber-100/10 px-6 pt-4 pb-12 shadow-2xl flex flex-col gap-5"
            >
              <div className="w-12 h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full mx-auto mb-1"></div>
              
              <div className="flex items-center justify-between border-b border-amber-900/10 dark:border-amber-100/10 pb-4">
                <div>
                  <h3 className="text-[14px] font-bold text-amber-950 dark:text-amber-50 uppercase tracking-wider">Chia sẻ bài viết</h3>
                  <p className="text-[12px] text-stone-500 dark:text-stone-400 font-medium mt-1">Lựa chọn nền tảng bạn muốn chia sẻ</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsShareOpen(false)} 
                  className="text-[12px] font-bold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-4 py-2 rounded-xl active:scale-95 transition-all"
                >
                  Đóng
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-4 py-2 text-center">
                {SHARE_CHANNELS.map(({ key, label, Icon, color }) => (
                  <motion.button
                    key={key}
                    type="button"
                    onClick={() => shareTo(key)}
                    whileTap={{ scale: 0.9 }}
                    className="flex flex-col items-center gap-2.5"
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${color}1A`, color }}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11.5px] font-bold text-stone-700 dark:text-stone-300">{label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}