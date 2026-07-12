import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../ui/ToastContext.jsx";
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

export default function ArticleDetail() {
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
    
    // Cảnh báo link localhost đối với các nền tảng mạng xã hội cần crawl metadata
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
      <div className="min-h-screen bg-[#faf8f5] dark:bg-stone-950 flex items-center justify-center gap-2.5 py-24 text-stone-400 dark:text-stone-500">
        <Loader2 className="w-5 h-5 animate-spin text-amber-700 dark:text-amber-500" />
        <span className="text-sm font-medium">Đang tải nội dung…</span>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen bg-[#faf8f5] dark:bg-stone-950 flex flex-col items-center justify-center gap-4 text-center px-6 py-20">
        <p className="text-xl font-bold text-stone-850 dark:text-stone-150">Không tìm thấy bài viết</p>
        <p className="text-sm text-stone-400 dark:text-stone-500 max-w-xs">Bài viết có thể đã bị gỡ hoặc chưa được duyệt bởi ban quản trị.</p>
        <Link to="/bài-viết" className="text-sm font-bold text-amber-800 dark:text-amber-500 hover:underline">
          ← Quay lại danh sách bài viết
        </Link>
      </div>
    );
  }

  // Tính toán thời gian đọc thực tế từ markdown content
  const wordCount = (article.content || "").trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-300 overflow-x-hidden">
      
      {/* Keyframe CSS inline cho menu chia sẻ mượt mà */}
      <style>{`
        @keyframes slideUpShare {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeInShare {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div className="max-w-3xl mx-auto px-6 py-10">
        
        {/* Nút quay lại thiết kế capsule cao cấp */}
        <div className="mb-8">
          <Link to="/bài-viết" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-[12px] font-bold text-stone-600 dark:text-stone-300 shadow-2xs hover:bg-stone-50 dark:hover:bg-stone-850 hover:text-amber-800 dark:hover:text-amber-500 hover:border-amber-700/30 dark:hover:border-amber-600/30 transition-all duration-200 group">
            <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform text-stone-400 group-hover:text-amber-700 dark:group-hover:text-amber-500" />
            Tất cả bài viết
          </Link>
        </div>

        {/* Chuyên mục bài viết */}
        {article.category && (
          <span className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-stone-900 text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-550 border border-amber-200/30 dark:border-stone-800">
            {article.category}
          </span>
        )}

        {/* Tiêu đề bài viết - Font Serif chuyên nghiệp */}
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-stone-900 dark:text-stone-100 tracking-tight leading-tight mt-4 mb-4">
          {article.title}
        </h1>

        {/* Meta thông tin chi tiết */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/60 dark:border-stone-800 pb-5 mb-8 text-[12px] sm:text-[13px] text-stone-400 dark:text-stone-500 font-medium">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5"><User className="w-4 h-4 text-stone-400 dark:text-stone-500" /> {article.author_username}</span>
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-stone-400 dark:text-stone-500" /> {formatDateVi(article.published_at || article.updated_at)}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4 text-stone-400 dark:text-stone-500" /> {readingTime} phút đọc</span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsShareOpen(!isShareOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-[12px] text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 active:scale-95 transition-all font-bold shadow-2xs"
              title="Chia sẻ bài viết này"
            >
              <Share2 className="w-3.5 h-3.5" /> Chia sẻ
            </button>

            {/* Popover Dropdown cho Desktop (md:block hidden) */}
            {isShareOpen && (
              <>
                <div className="md:block hidden absolute right-0 mt-2 w-52 bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-2xl shadow-xl py-2.5 z-50">
                  <div className="px-4 py-1 border-b border-stone-100 dark:border-stone-800/80 mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Chia sẻ bài viết</span>
                  </div>
                  <button type="button" onClick={() => shareTo("facebook")} className="w-full text-left px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60 flex items-center gap-3 transition-colors">
                    <div className="w-6 h-6 rounded-lg bg-[#1877F2]/10 dark:bg-[#1877F2]/20 flex items-center justify-center text-[#1877F2] flex-shrink-0">
                      <FacebookIcon className="w-3.5 h-3.5" />
                    </div>
                    Facebook
                  </button>
                  <button type="button" onClick={() => shareTo("messenger")} className="w-full text-left px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60 flex items-center gap-3 transition-colors">
                    <div className="w-6 h-6 rounded-lg bg-[#0084FF]/10 dark:bg-[#0084FF]/20 flex items-center justify-center text-[#0084FF] flex-shrink-0">
                      <MessengerIcon className="w-3.5 h-3.5" />
                    </div>
                    Messenger
                  </button>
                  <button type="button" onClick={() => shareTo("zalo")} className="w-full text-left px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60 flex items-center gap-3 transition-colors">
                    <div className="w-6 h-6 rounded-lg bg-[#0068FF]/10 dark:bg-[#0068FF]/20 flex items-center justify-center text-[#0068FF] flex-shrink-0">
                      <ZaloIcon className="w-3.5 h-3.5" />
                    </div>
                    Zalo
                  </button>
                  <div className="border-t border-stone-100 dark:border-stone-800/80 my-1.5"></div>
                  <button type="button" onClick={() => shareTo("copy")} className="w-full text-left px-4 py-2 text-xs font-semibold text-amber-850 dark:text-amber-500 hover:bg-stone-50 dark:hover:bg-stone-800/60 flex items-center gap-3 transition-colors">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-800 dark:text-amber-500 flex-shrink-0">
                      <Link2 className="w-3.5 h-3.5" />
                    </div>
                    Sao chép liên kết
                  </button>
                </div>
                {/* Backdrop để close dropdown khi click ra ngoài */}
                <div className="md:block hidden fixed inset-0 z-40" onClick={() => setIsShareOpen(false)}></div>
              </>
            )}
          </div>
        </div>

        {/* Ảnh bìa bài viết */}
        {article.cover_image && (
          <div className="w-full rounded-3xl overflow-hidden shadow-xs dark:shadow-stone-950/40 mb-8 max-h-[460px] border border-stone-200/30 dark:border-stone-900">
            <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Nội dung bài viết Markdown - Thêm w-full, overflow và word-break để chống tràn trên mobile */}
        <div className="prose prose-stone prose-sm sm:prose-base max-w-none dark:prose-invert prose-headings:font-bold prose-headings:font-serif prose-a:text-amber-700 dark:prose-a:text-amber-500 prose-img:rounded-2xl prose-blockquote:border-l-amber-700 dark:prose-blockquote:border-l-amber-600 prose-blockquote:bg-stone-50 dark:prose-blockquote:bg-stone-900/30 prose-blockquote:py-1 prose-blockquote:pr-4 w-full max-w-full overflow-x-hidden break-words prose-a:break-all prose-pre:max-w-full prose-pre:overflow-x-auto prose-table:max-w-full prose-table:overflow-x-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
            {article.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Mobile Bottom Sheet Menu chia sẻ - Định vị FIXED hoàn toàn theo khung nhìn di động để chống lệch khi cuộn */}
      {isShareOpen && (
        <div className="md:hidden block fixed inset-0 z-50">
          {/* Backdrop làm mờ có animation fadeInShare */}
          <div 
            className="fixed inset-0 z-10 bg-black/60 backdrop-blur-xs" 
            style={{ animation: "fadeInShare 0.25s ease-out forwards" }}
            onClick={() => setIsShareOpen(false)}
          ></div>
          
          {/* Khung trượt bottom sheet có animation slideUpShare và z-20 */}
          <div 
            className="fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-stone-900 rounded-t-[2.2rem] border-t border-stone-200/50 dark:border-stone-800/60 px-6 pt-4 pb-10 shadow-2xl flex flex-col gap-4"
            style={{ animation: "slideUpShare 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          >
            {/* Drag handle nhỏ nhắn */}
            <div className="w-12 h-1 bg-stone-200 dark:bg-stone-850 rounded-full mx-auto mb-1"></div>
            
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div>
                <h3 className="text-[13px] font-black text-stone-800 dark:text-stone-200 uppercase tracking-wider">Chia sẻ bài viết</h3>
                <p className="text-[10px] text-stone-400 dark:text-stone-500 font-medium mt-0.5">Lựa chọn nền tảng bạn muốn chia sẻ</p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsShareOpen(false)} 
                className="text-[11px] font-bold text-stone-500 dark:text-stone-450 bg-stone-105 dark:bg-stone-800 px-3.5 py-1.5 rounded-xl active:scale-95 transition-all"
              >
                Đóng
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4 py-2 text-center">
              {/* Nút Facebook */}
              <button type="button" onClick={() => shareTo("facebook")} className="flex flex-col items-center gap-2 active:scale-95 transition-transform group">
                <div className="w-14 h-14 rounded-2xl bg-[#1877F2]/10 dark:bg-[#1877F2]/20 flex items-center justify-center text-[#1877F2] shadow-2xs transition-transform group-hover:scale-105">
                  <FacebookIcon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-stone-600 dark:text-stone-400">Facebook</span>
              </button>
              
              {/* Nút Messenger */}
              <button type="button" onClick={() => shareTo("messenger")} className="flex flex-col items-center gap-2 active:scale-95 transition-transform group">
                <div className="w-14 h-14 rounded-2xl bg-[#0084FF]/10 dark:bg-[#0084FF]/20 flex items-center justify-center text-[#0084FF] shadow-2xs transition-transform group-hover:scale-105">
                  <MessengerIcon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-stone-600 dark:text-stone-400">Messenger</span>
              </button>
              
              {/* Nút Zalo */}
              <button type="button" onClick={() => shareTo("zalo")} className="flex flex-col items-center gap-2 active:scale-95 transition-transform group">
                <div className="w-14 h-14 rounded-2xl bg-[#0068FF]/10 dark:bg-[#0068FF]/20 flex items-center justify-center text-[#0068FF] shadow-2xs transition-transform group-hover:scale-105">
                  <div className="w-6 h-6 rounded-lg bg-[#0068FF] text-white flex items-center justify-center font-black text-xs">Z</div>
                </div>
                <span className="text-[10px] font-bold text-stone-600 dark:text-stone-400">Zalo</span>
              </button>
              
              {/* Nút Copy */}
              <button type="button" onClick={() => shareTo("copy")} className="flex flex-col items-center gap-2 active:scale-95 transition-transform group">
                <div className="w-14 h-14 rounded-2xl bg-amber-800/10 dark:bg-amber-600/20 flex items-center justify-center text-amber-800 dark:text-amber-500 shadow-2xs transition-transform group-hover:scale-105">
                  <Link2 className="w-6 h-6 stroke-[2.5px]" />
                </div>
                <span className="text-[10px] font-bold text-stone-600 dark:text-stone-400">Sao chép</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}