import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../../components/ui/ToastContext.jsx";
import { ArrowLeft, Share2, Link2, AlertCircle, RefreshCw, X } from "lucide-react";
import { usePageMotion } from "../../hooks/usePageMotion.js";
import { ArticlePublicContent } from "./ArticlePublicContent.jsx";

// Định nghĩa các icon mạng xã hội SVG thống nhất
const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const MessengerIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.914 1.458 5.513 3.738 7.21v3.834a.75.75 0 001.166.628l4.135-2.756c.31.042.627.066.948.066 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.095 12.35l-2.457-2.62-4.793 2.62 5.27-5.6 2.457 2.62 4.793-2.62-5.27 5.6z" />
  </svg>
);

const ZaloIcon = ({ className }) => (
  <div className={`${className} flex items-center justify-center font-black select-none text-xs leading-none`} style={{ fontFamily: "sans-serif" }} aria-hidden="true">
    Z
  </div>
);

const SHARE_CHANNELS = [
  { key: "facebook", label: "Facebook", Icon: FacebookIcon, color: "#1877F2" },
  { key: "messenger", label: "Messenger", Icon: MessengerIcon, color: "#0084FF" },
  { key: "zalo", label: "Zalo", Icon: ZaloIcon, color: "#0068FF" },
  { key: "copy", label: "Sao chép liên kết", Icon: Link2, color: "#314e3e" },
];

function ArticleDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-pulse" aria-busy="true" aria-label="Đang tải bài viết...">
      {/* Back button skeleton */}
      <div className="h-10 w-36 bg-[#dedfd4]/60 dark:bg-[#354237]/60 rounded-xl mb-6"></div>

      {/* Category skeleton */}
      <div className="h-6 w-24 bg-[#dedfd4]/50 dark:bg-[#354237]/50 rounded-full mb-4"></div>

      {/* Title skeleton */}
      <div className="space-y-3 mb-6">
        <div className="h-8 sm:h-10 w-full bg-[#dedfd4]/70 dark:bg-[#354237]/70 rounded-xl"></div>
        <div className="h-8 sm:h-10 w-3/4 bg-[#dedfd4]/60 dark:bg-[#354237]/60 rounded-xl"></div>
      </div>

      {/* Meta info skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#dedfd4] dark:border-[#354237] pb-5 mb-8">
        <div className="flex items-center gap-4">
          <div className="h-5 w-28 bg-[#dedfd4]/50 dark:bg-[#354237]/50 rounded-lg"></div>
          <div className="h-5 w-24 bg-[#dedfd4]/50 dark:bg-[#354237]/50 rounded-lg"></div>
          <div className="h-5 w-20 bg-[#dedfd4]/50 dark:bg-[#354237]/50 rounded-lg"></div>
        </div>
        <div className="h-9 w-24 bg-[#dedfd4]/50 dark:bg-[#354237]/50 rounded-xl"></div>
      </div>

      {/* Cover skeleton */}
      <div className="w-full aspect-video md:aspect-[21/9] bg-[#dedfd4]/60 dark:bg-[#354237]/60 rounded-2xl sm:rounded-3xl mb-8"></div>

      {/* Content skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-full bg-[#dedfd4]/50 dark:bg-[#354237]/50 rounded"></div>
        <div className="h-4 w-11/12 bg-[#dedfd4]/50 dark:bg-[#354237]/50 rounded"></div>
        <div className="h-4 w-full bg-[#dedfd4]/50 dark:bg-[#354237]/50 rounded"></div>
        <div className="h-4 w-4/5 bg-[#dedfd4]/50 dark:bg-[#354237]/50 rounded"></div>
        <div className="h-4 w-full bg-[#dedfd4]/50 dark:bg-[#354237]/50 rounded"></div>
      </div>
    </div>
  );
}

export default function ArticleDetail() {
  const { fadeUp } = usePageMotion();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [article, setArticle] = useState(null);
  const [viewState, setViewState] = useState("loading"); // "loading" | "success" | "error" | "notFound"
  const [errorMessage, setErrorMessage] = useState(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const shareButtonRef = useRef(null);
  const sheetCloseButtonRef = useRef(null);

  // 1. Tải bài viết chỉ khi status = 'published'
  const loadArticle = useCallback(async () => {
    setViewState("loading");
    setErrorMessage(null);

    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*, author:users!articles_author_username_fkey(username, ho_va_ten, ten_thanh)")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error) {
        console.error("ArticleDetail fetch error:", error);
        setErrorMessage(error.message || "Không thể tải nội dung bài viết");
        setViewState("error");
        return;
      }

      if (!data) {
        setViewState("notFound");
        setArticle(null);
      } else {
        setArticle(data);
        setViewState("success");
      }
    } catch (err) {
      console.error("ArticleDetail unexpected error:", err);
      setErrorMessage("Đã xảy ra lỗi kết nối khi tải bài viết");
      setViewState("error");
    }
  }, [slug]);

  useEffect(() => {
    let isSubscribed = true;
    async function run() {
      if (isSubscribed) {
        await loadArticle();
      }
    }
    run();
    return () => {
      isSubscribed = false;
    };
  }, [loadArticle]);

  // 2. Browser Metadata (Title & Meta Description)
  useEffect(() => {
    if (viewState !== "success" || !article) return;

    const originalTitle = document.title;
    document.title = `${article.title} | Ban Giáo lý An Ngãi`;

    let metaDesc = document.querySelector('meta[name="description"]');
    let originalDesc = metaDesc ? metaDesc.getAttribute("content") : null;
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", article.summary || article.title);

    return () => {
      document.title = originalTitle;
      if (originalDesc !== null && metaDesc) {
        metaDesc.setAttribute("content", originalDesc);
      }
    };
  }, [viewState, article]);

  // 3. Quản lý Modal/Bottom Sheet Focus Trap, Escape, Body Scroll Lock
  useEffect(() => {
    if (!isShareOpen) return;

    const triggerEl = shareButtonRef.current;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus nút đóng khi mở
    const timer = setTimeout(() => {
      sheetCloseButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsShareOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      triggerEl?.focus();
    };
  }, [isShareOpen]);

  // 4. Xử lý nút quay lại danh sách bài viết
  const handleBackNavigation = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/bài-viết");
    }
  };

  // 5. Thao tác chia sẻ bài viết
  const shareTo = async (channel) => {
    setIsShareOpen(false);
    const url = window.location.href;

    const isLocal = url.includes("localhost") || url.includes("127.0.0.1");
    if ((channel === "facebook" || channel === "messenger" || channel === "zalo") && isLocal) {
      showToast("Lưu ý: Link localhost không hiển thị được nội dung xem trước trên mạng xã hội.", "info");
    }

    if (channel === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
    } else if (channel === "messenger") {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.open(`fb-messenger://share/?link=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
      } else {
        window.open(
          `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=2914944195427211&redirect_uri=${encodeURIComponent(url)}`,
          "_blank",
          "noopener,noreferrer"
        );
      }
    } else if (channel === "zalo") {
      window.open(`https://sp.zalo.me/share_to_zalo?url=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
    } else if (channel === "copy") {
      try {
        await navigator.clipboard.writeText(url);
        showToast("Đã sao chép liên kết bài viết vào bộ nhớ tạm", "success");
      } catch {
        showToast("Không thể sao chép liên kết", "error");
      }
    }
  };

  // ── TRẠNG THÁI 1: LOADING ──
  if (viewState === "loading") {
    return (
      <div className="min-h-screen bg-[#faf8f3] dark:bg-[#151c18]">
        <ArticleDetailSkeleton />
      </div>
    );
  }

  // ── TRẠNG THÁI 2: LỖI KẾT NỐI (ERROR) ──
  if (viewState === "error") {
    return (
      <div className="min-h-screen bg-[#faf8f3] dark:bg-[#151c18] flex flex-col items-center justify-center gap-4 text-center px-4 py-20">
        <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#293d32] dark:text-[#ecece0]">
            Chưa thể tải bài viết
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#575e55] dark:text-[#b0b9ac] mt-1 max-w-sm">
            {errorMessage || "Đã xảy ra lỗi kết nối. Vui lòng kiểm tra lại mạng và thử lại."}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={loadArticle}
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#314e3e] dark:bg-[#d6b883] text-[#fffefa] dark:text-[#151c18] hover:opacity-95 active:scale-[0.98] transition-all shadow-xs"
          >
            <RefreshCw className="w-4 h-4" /> Thử lại
          </button>
          <button
            type="button"
            onClick={handleBackNavigation}
            className="min-h-[44px] inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#fffefa] dark:bg-[#1e2821] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237]"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // ── TRẠNG THÁI 3: NOT FOUND / UNPUBLISHED ──
  if (viewState === "notFound" || !article) {
    return (
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-[#faf8f3] dark:bg-[#151c18] flex flex-col items-center justify-center gap-4 text-center px-4 py-20"
      >
        <div className="w-16 h-16 rounded-full bg-[#dedfd4]/40 dark:bg-[#354237]/40 flex items-center justify-center text-[#314e3e] dark:text-[#d6b883] mb-1">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#293d32] dark:text-[#ecece0]">
          Không tìm thấy bài viết
        </h1>
        <p className="text-xs sm:text-sm font-medium text-[#575e55] dark:text-[#b0b9ac] max-w-sm">
          Bài viết có thể đã bị gỡ, chưa được xuất bản hoặc liên kết không chính xác.
        </p>
        <Link
          to="/bài-viết"
          className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#314e3e] dark:bg-[#d6b883] text-[#fffefa] dark:text-[#151c18] hover:opacity-95 active:scale-[0.98] transition-all shadow-xs mt-2"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách bài viết
        </Link>
      </Motion.div>
    );
  }

  // ── TRẠNG THÁI 4: SUCCESS (HIỂN THỊ NỘI DUNG CHI TIẾT) ──
  const desktopShareDropdown = (
    <div className="relative">
      <button
        ref={shareButtonRef}
        type="button"
        onClick={() => setIsShareOpen(!isShareOpen)}
        aria-haspopup="dialog"
        aria-expanded={isShareOpen}
        aria-controls="share-popover-menu"
        aria-label="Chia sẻ bài viết này"
        className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] hover:bg-[#faf8f3] dark:hover:bg-[#25332a] active:scale-95 transition-all shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d6b883]"
      >
        <Share2 className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" />
        <span>Chia sẻ</span>
      </button>

      {/* Popover Dropdown Desktop */}
      <AnimatePresence>
        {isShareOpen && (
          <>
            <Motion.div
              id="share-popover-menu"
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              style={{ transformOrigin: "top right" }}
              className="md:block hidden absolute right-0 mt-2 w-56 bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-2xl shadow-xl py-2 z-50"
            >
              <div className="px-4 py-1.5 mb-1">
                <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">
                  Chia sẻ bài viết
                </span>
              </div>
              {SHARE_CHANNELS.slice(0, 3).map((channel) => (
                <button
                  key={channel.key}
                  type="button"
                  onClick={() => shareTo(channel.key)}
                  className="w-full text-left px-4 py-2.5 min-h-[44px] text-xs sm:text-sm font-semibold text-[#293d32] dark:text-[#ecece0] hover:bg-[#faf8f3] dark:hover:bg-[#25332a] flex items-center gap-3 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${channel.color}1A`, color: channel.color }}>
                    <channel.Icon className="w-4 h-4" />
                  </div>
                  <span>{channel.label}</span>
                </button>
              ))}
              <div className="border-t border-[#dedfd4] dark:border-[#354237] my-1.5" />
              <button
                type="button"
                onClick={() => shareTo("copy")}
                className="w-full text-left px-4 py-2.5 min-h-[44px] text-xs sm:text-sm font-semibold text-[#314e3e] dark:text-[#d6b883] hover:bg-[#faf8f3] dark:hover:bg-[#25332a] flex items-center gap-3 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-[#314e3e]/10 dark:bg-[#d6b883]/20 flex items-center justify-center text-[#314e3e] dark:text-[#d6b883] shrink-0">
                  <Link2 className="w-4 h-4" />
                </div>
                <span>Sao chép liên kết</span>
              </button>
            </Motion.div>
            <div className="md:block hidden fixed inset-0 z-40" onClick={() => setIsShareOpen(false)} aria-hidden="true" />
          </>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] transition-colors duration-300 pb-16">
      <Motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10"
      >
        {/* Nút quay lại (Khôi phục scroll danh sách) */}
        <Motion.div variants={fadeUp} className="mb-6">
          <button
            type="button"
            onClick={handleBackNavigation}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#fffefa] dark:bg-[#1e2821] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] transition-all duration-200 active:scale-[0.98] hover:border-[#314e3e]/50 dark:hover:border-[#d6b883]/50 shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d6b883]"
          >
            <ArrowLeft className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" />
            <span>Tất cả bài viết</span>
          </button>
        </Motion.div>

        {/* Nội dung bài viết công khai (Shared Component) */}
        <Motion.div variants={fadeUp}>
          <ArticlePublicContent
            article={article}
            titleAs="h1"
            headerExtra={desktopShareDropdown}
          />
        </Motion.div>
      </Motion.div>

      {/* ── MOBILE BOTTOM SHEET MENU CHIA SẺ ── */}
      <AnimatePresence>
        {isShareOpen && (
          <div
            className="md:hidden block fixed inset-0 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-sheet-title"
          >
            {/* Backdrop */}
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-10 bg-black/50 backdrop-blur-xs"
              onClick={() => setIsShareOpen(false)}
              aria-hidden="true"
            />

            {/* Sheet content */}
            <Motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed bottom-0 left-0 right-0 z-20 bg-[#fffefa] dark:bg-[#1e2821] border-t border-[#dedfd4] dark:border-[#354237] rounded-t-3xl px-5 pt-4 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
              data-lenis-prevent
            >
              <div className="w-12 h-1.5 bg-[#dedfd4] dark:bg-[#354237] rounded-full mx-auto mb-1" />

              <div className="flex items-center justify-between border-b border-[#dedfd4] dark:border-[#354237] pb-3">
                <div>
                  <h2 id="share-sheet-title" className="text-sm font-bold text-[#293d32] dark:text-[#ecece0] uppercase tracking-wider">
                    Chia sẻ bài viết
                  </h2>
                  <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] font-medium mt-0.5">
                    Chọn nền tảng bạn muốn chia sẻ
                  </p>
                </div>
                <button
                  ref={sheetCloseButtonRef}
                  type="button"
                  onClick={() => setIsShareOpen(false)}
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-xs font-bold text-[#293d32] dark:text-[#ecece0] bg-[#faf8f3] dark:bg-[#25332a] border border-[#dedfd4] dark:border-[#354237] px-3 py-2 rounded-xl active:scale-95 transition-all"
                  aria-label="Đóng bảng chia sẻ"
                >
                  <X className="w-4 h-4 mr-1" /> Đóng
                </button>
              </div>

              {/* Lưới 2x2 ở màn hình hẹp 320px, 4 cột ở >=400px */}
              <div className="grid grid-cols-2 min-[400px]:grid-cols-4 gap-3 py-2 text-center">
                {SHARE_CHANNELS.map((channel) => (
                  <button
                    key={channel.key}
                    type="button"
                    onClick={() => shareTo(channel.key)}
                    className="min-h-[44px] flex flex-col items-center gap-2 p-2.5 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] active:scale-95 transition-transform"
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-2xs" style={{ backgroundColor: `${channel.color}1A`, color: channel.color }}>
                      <channel.Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-[#293d32] dark:text-[#ecece0]">{channel.label}</span>
                  </button>
                ))}
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}