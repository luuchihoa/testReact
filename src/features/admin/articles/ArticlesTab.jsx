import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Check,
  X,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  Copy,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Search,
  ArrowUpDown,
  User,
  Tag,
  Calendar,
  FileText,
  Quote,
  ImageOff,
  Inbox,
  AlertCircle,
} from "lucide-react";
import { useToast } from "../../../components/ui/ToastContext.jsx";
import { useAdminContext } from "../AdminContext.jsx";
import { SidebarDetailSkeleton } from "../../../components/ui/Skeleton.jsx";
import { useArticleQueue, getNextArticleId } from "./useArticleQueue.js";
import { ArticleListItem } from "./ArticleListItem.jsx";
import { RejectPanel } from "./RejectPanel.jsx";
import { ArticlePreviewModal } from "./ArticlePreviewModal.jsx";
import { PublishConfirmModal } from "./PublishConfirmModal.jsx";
import { UnpublishModal } from "./UnpublishModal.jsx";
import { DeleteConfirmModal } from "./DeleteConfirmModal.jsx";
import {
  getAuthorDisplayName,
  getArticleStatusMeta,
  getArticleTimestampMeta,
} from "./format.js";

const STATUS_TABS = [
  { key: "pending", label: "Chờ duyệt" },
  { key: "published", label: "Đã xuất bản" },
  { key: "rejected", label: "Bị từ chối" },
  { key: "unpublished", label: "Đã gỡ" },
];

/**
 * Khối Thông tin xuất bản & Kiểm duyệt bài viết
 */
function PublicationInfoPanel({ article, onOpenPreview }) {
  const { showToast } = useToast();
  const [failedCoverUrl, setFailedCoverUrl] = useState(null);
  const coverError = Boolean(article?.cover_image && failedCoverUrl === article.cover_image);

  const authorName = getAuthorDisplayName(article.author, article.author_username);
  const statusMeta = getArticleStatusMeta(article.status);
  const timeMeta = getArticleTimestampMeta(article);

  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
  const publicArticlePath = `/bài-viết/${article.slug}`;
  const fullPublicUrl = `${window.location.origin}${baseUrl}${publicArticlePath}`;

  const copyPublicLink = async () => {
    try {
      await navigator.clipboard.writeText(fullPublicUrl);
      showToast("Đã sao chép liên kết bài viết công khai", "success");
    } catch {
      showToast("Không thể sao chép liên kết", "error");
    }
  };

  return (
    <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] shadow-2xs space-y-4 w-full min-w-0 max-w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#dedfd4] dark:border-[#354237]">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#927140] dark:text-[#d4b47d]">
          <FileText className="w-4 h-4 text-[#7c5c2d] dark:text-[#d4b47d]" />
          <span>Thông tin xuất bản &amp; Kiểm duyệt</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold border ${statusMeta.badgeClass}`}>
            {statusMeta.label}
          </span>
          <button
            type="button"
            onClick={onOpenPreview}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-bold bg-[#fffefa] dark:bg-[#1e2821] text-[#314e3e] dark:text-[#d6b883] border border-[#dedfd4] dark:border-[#354237] hover:border-[#314e3e]/40 dark:hover:border-[#d6b883]/40 active:scale-[0.98] transition-all shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem trước</span>
          </button>
        </div>
      </div>

      {/* Grid Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs sm:text-sm">
        {/* Tác giả */}
        <div className="flex items-start gap-2 min-w-0">
          <User className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac] shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-[0.6875rem] uppercase tracking-wider font-semibold text-[#575e55] dark:text-[#b0b9ac]">
              Tác giả
            </p>
            <p className="font-bold text-[#293d32] dark:text-[#ecece0] [overflow-wrap:anywhere] break-words">
              {authorName}
              {article.author_username && authorName !== article.author_username && (
                <span className="font-normal text-xs text-[#575e55] dark:text-[#b0b9ac] ml-1">
                  (@{article.author_username})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Chuyên mục */}
        <div className="flex items-start gap-2 min-w-0">
          <Tag className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac] shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-[0.6875rem] uppercase tracking-wider font-semibold text-[#575e55] dark:text-[#b0b9ac]">
              Chuyên mục
            </p>
            {article.category ? (
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-[#314e3e]/10 dark:bg-[#d6b883]/20 text-[#314e3e] dark:text-[#d6b883] font-bold text-xs uppercase">
                {article.category}
              </span>
            ) : (
              <span className="italic text-xs text-[#575e55] dark:text-[#b0b9ac]">Chưa phân loại</span>
            )}
          </div>
        </div>

        {/* Thời gian theo trạng thái */}
        <div className="flex items-start gap-2 min-w-0">
          <Calendar className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac] shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-[0.6875rem] uppercase tracking-wider font-semibold text-[#575e55] dark:text-[#b0b9ac]">
              {timeMeta.label}
            </p>
            <p
              className="font-medium text-[#293d32] dark:text-[#ecece0] tabular-nums cursor-help [overflow-wrap:anywhere] break-words"
              title={timeMeta.fullStr}
            >
              {timeMeta.relativeStr} ({timeMeta.fullStr || "Chưa rõ"})
            </p>
          </div>
        </div>
      </div>

      {/* Hiển thị lý do từ chối (nếu status === 'rejected') */}
      {article.status === "rejected" && article.rejection_reason && (
        <div className="p-3.5 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 space-y-1 min-w-0 max-w-full">
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Lý do từ chối duyệt:</span>
          </div>
          <p className="text-xs sm:text-sm text-red-900 dark:text-red-200 pl-5 [overflow-wrap:anywhere] break-words">
            {article.rejection_reason}
          </p>
          {article.reviewed_by && (
            <p className="text-[0.6875rem] text-[#575e55] dark:text-[#b0b9ac] pl-5 pt-1">
              Người từ chối: <span className="font-semibold">{article.reviewed_by}</span>
            </p>
          )}
        </div>
      )}

      {/* Hiển thị lý do gỡ bài (nếu status === 'unpublished') */}
      {article.status === "unpublished" && article.unpublish_reason && (
        <div className="p-3.5 rounded-xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/60 space-y-1 min-w-0 max-w-full">
          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-700 dark:text-orange-400">
            <EyeOff className="w-4 h-4 shrink-0" />
            <span>Lý do gỡ khỏi trang công khai:</span>
          </div>
          <p className="text-xs sm:text-sm text-orange-900 dark:text-orange-200 pl-5 [overflow-wrap:anywhere] break-words">
            {article.unpublish_reason}
          </p>
          {article.unpublished_by && (
            <p className="text-[0.6875rem] text-[#575e55] dark:text-[#b0b9ac] pl-5 pt-1">
              Người gỡ: <span className="font-semibold">{article.unpublished_by}</span>
            </p>
          )}
        </div>
      )}

      {/* Đường dẫn công khai */}
      <div className="pt-2 border-t border-[#dedfd4]/60 dark:border-[#354237]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0 max-w-full">
        <div className="min-w-0 flex-1">
          <p className="text-[0.6875rem] uppercase tracking-wider font-semibold text-[#575e55] dark:text-[#b0b9ac] mb-0.5">
            Đường dẫn bài viết
          </p>
          <p className="text-xs font-mono text-[#314e3e] dark:text-[#d6b883] truncate [overflow-wrap:anywhere]" title={fullPublicUrl}>
            {publicArticlePath}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={copyPublicLink}
            aria-label="Sao chép đường dẫn bài viết"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-bold bg-[#fffefa] dark:bg-[#1e2821] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] hover:bg-[#dedfd4]/30 active:scale-95 transition-all shadow-2xs"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Sao chép link</span>
          </button>
        </div>
      </div>

      {/* Đoạn tóm tắt (Summary) */}
      <div className="pt-2 border-t border-[#dedfd4]/60 dark:border-[#354237]/60 min-w-0 max-w-full">
        <p className="text-[0.6875rem] uppercase tracking-wider font-semibold text-[#575e55] dark:text-[#b0b9ac] mb-1">
          Đoạn tóm tắt bài viết
        </p>
        {article.summary ? (
          <div className="p-3 rounded-xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] flex items-start gap-2 min-w-0 max-w-full">
            <Quote className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d6b883] shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm italic text-[#293d32] dark:text-[#ecece0] [overflow-wrap:anywhere] break-words min-w-0 flex-1">
              {article.summary}
            </p>
          </div>
        ) : (
          <p className="text-xs italic text-[#575e55] dark:text-[#b0b9ac]">Chưa có đoạn tóm tắt</p>
        )}
      </div>

      {/* Ảnh bìa & Trạng thái ảnh */}
      {article.cover_image && (
        <div className="pt-2 border-t border-[#dedfd4]/60 dark:border-[#354237]/60 min-w-0 max-w-full">
          <p className="text-[0.6875rem] uppercase tracking-wider font-semibold text-[#575e55] dark:text-[#b0b9ac] mb-2">
            Ảnh bìa đính kèm
          </p>
          {!coverError ? (
            <div className="relative rounded-xl overflow-hidden border border-[#dedfd4] dark:border-[#354237] max-h-52 bg-[#fffefa] dark:bg-[#1e2821] min-w-0 max-w-full">
              <img
                src={article.cover_image}
                alt={article.title}
                onError={() => setFailedCoverUrl(article.cover_image)}
                className="w-full h-auto max-h-52 object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="p-3 sm:p-3.5 rounded-xl border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/70 dark:bg-amber-950/30 flex items-start gap-2.5 text-xs text-amber-950 dark:text-amber-100 min-w-0 max-w-full w-full">
              <ImageOff className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="font-bold text-amber-950 dark:text-amber-100 [overflow-wrap:anywhere] break-words">
                  Không tải được ảnh bìa từ URL
                </p>
                <p className="text-[0.6875rem] text-amber-800/90 dark:text-amber-300/90 [overflow-wrap:anywhere] break-words">
                  Liên kết này có thể không trỏ trực tiếp đến tệp hình ảnh (.jpg, .png, .webp) hoặc bị chặn truy cập từ xa.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg bg-[#fffefa] dark:bg-[#1e2821] border border-amber-200 dark:border-amber-800/60 min-w-0 max-w-full">
                  <span
                    className="text-[0.6875rem] font-mono text-[#575e55] dark:text-[#b0b9ac] [overflow-wrap:anywhere] break-all min-w-0 flex-1 select-all"
                    title={article.cover_image}
                  >
                    {article.cover_image}
                  </span>
                  <a
                    href={article.cover_image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 self-start sm:self-auto px-2 py-1 min-h-[30px] rounded-md text-[0.6875rem] font-bold text-[#314e3e] dark:text-[#d6b883] hover:underline shrink-0 bg-[#314e3e]/5 dark:bg-[#d6b883]/10"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Mở link</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ArticlesTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const { refreshPendingBaiViet } = useAdminContext();

  // Đọc params từ URL
  const rawTab = searchParams.get("tab") || "pending";
  const activeTab = STATUS_TABS.some((t) => t.key === rawTab) ? rawTab : "pending";
  const articleIdParam = searchParams.get("article") || null;
  const queryParam = searchParams.get("q") || "";
  const sortParam = searchParams.get("sort") === "desc" ? "desc" : "asc";

  const [searchInput, setSearchInput] = useState(queryParam);
  const [rejecting, setRejecting] = useState(false);
  const [rejectDraft, setRejectDraft] = useState("");

  // Quản lý các Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isConfirmPublishOpen, setIsConfirmPublishOpen] = useState(false);
  const [isUnpublishOpen, setIsUnpublishOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const listScrollPosRef = useRef(0);
  const lastActiveItemRef = useRef(null);
  const detailHeadingRef = useRef(null);

  const handleError = useCallback(
    (message) => {
      showToast(message, "error");
    },
    [showToast]
  );

  const {
    articles,
    totalCount,
    statusCounts,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    error,
    refetch,
    selectedDetail,
    loadingDetail,
    errorDetail,
    isDetailNotFound,
    isConflict,
    approve,
    reject,
    unpublish,
    deleteArticle,
    actionState,
  } = useArticleQueue({
    statusFilter: activeTab,
    searchQuery: queryParam,
    sortOrder: sortParam,
    selectedId: articleIdParam,
    onError: handleError,
  });

  // Tự động chọn bài đầu tiên trên Desktop nếu chưa có article param và danh sách đã tải
  useEffect(() => {
    if (!loading && articles.length > 0 && !articleIdParam) {
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop) {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.set("article", articles[0].id);
            return next;
          },
          { replace: true }
        );
      }
    }
  }, [loading, articles, articleIdParam, setSearchParams]);

  // Debounce cập nhật queryParam từ searchInput
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== queryParam) {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            if (searchInput.trim()) next.set("q", searchInput.trim());
            else next.delete("q");
            return next;
          },
          { replace: true }
        );
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, queryParam, setSearchParams]);

  // Đổi Tab trạng thái
  const handleTabChange = (newTab) => {
    setRejecting(false);
    setRejectDraft("");
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (newTab === "pending") next.delete("tab");
        else next.set("tab", newTab);
        next.delete("article");
        return next;
      },
      { replace: true }
    );
  };

  // Đổi thứ tự sắp xếp
  const toggleSort = () => {
    const nextSort = sortParam === "asc" ? "desc" : "asc";
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (nextSort === "desc") next.set("sort", "desc");
        else next.delete("sort");
        return next;
      },
      { replace: true }
    );
  };

  // Mở bài viết từ danh sách
  const handleSelectArticle = useCallback(
    (id) => {
      listScrollPosRef.current = window.scrollY;
      setRejecting(false);
      setRejectDraft("");

      const isMobile = window.innerWidth < 1024;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("article", id);
          return next;
        },
        { replace: !isMobile }
      );

      if (isMobile) {
        window.scrollTo({ top: 0, behavior: "instant" });
        setTimeout(() => {
          detailHeadingRef.current?.focus();
        }, 80);
      }
    },
    [setSearchParams]
  );

  // Quay lại hàng đợi từ màn hình chi tiết trên Mobile
  const handleBackToQueue = useCallback(() => {
    setRejecting(false);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("article");
        return next;
      },
      { replace: false }
    );

    setTimeout(() => {
      window.scrollTo({ top: listScrollPosRef.current, behavior: "instant" });
      lastActiveItemRef.current?.focus();
    }, 50);
  }, [setSearchParams]);

  // Điều hướng Bài trước / Bài kế tiếp
  const currentArticleIndex = useMemo(() => {
    if (!articleIdParam) return -1;
    return articles.findIndex((a) => a.id === articleIdParam);
  }, [articles, articleIdParam]);

  const prevArticleId = currentArticleIndex > 0 ? articles[currentArticleIndex - 1]?.id : null;
  const nextArticleId =
    currentArticleIndex >= 0 && currentArticleIndex < articles.length - 1
      ? articles[currentArticleIndex + 1]?.id
      : null;

  const navigateToArticle = useCallback(
    (targetId) => {
      if (!targetId) return;
      setRejecting(false);
      setRejectDraft("");
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("article", targetId);
          return next;
        },
        { replace: true }
      );
      window.scrollTo({ top: 0, behavior: "instant" });
      setTimeout(() => {
        detailHeadingRef.current?.focus();
      }, 50);
    },
    [setSearchParams]
  );

  // 1. Thao tác Duyệt & Đăng bài
  const handleConfirmPublish = async () => {
    if (!selectedDetail) return;
    const result = await approve(selectedDetail.id);
    setIsConfirmPublishOpen(false);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }

    showToast("Đã duyệt và xuất bản bài viết thành công", "success");
    refreshPendingBaiViet();

    const nextId = getNextArticleId(articles, selectedDetail.id);
    if (nextId) navigateToArticle(nextId);
    else handleBackToQueue();
  };

  // 2. Thao tác Từ chối bài trong hàng đợi Pending
  const handleConfirmReject = async (reason) => {
    if (!selectedDetail) return;
    const result = await reject(selectedDetail.id, reason);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }

    showToast("Đã từ chối bài viết và gửi thông báo cho tác giả", "success");
    setRejecting(false);
    setRejectDraft("");
    refreshPendingBaiViet();

    const nextId = getNextArticleId(articles, selectedDetail.id);
    if (nextId) navigateToArticle(nextId);
    else handleBackToQueue();
  };

  // 3. Thao tác Gỡ bài viết đã xuất bản
  const handleConfirmUnpublish = async (reason) => {
    if (!selectedDetail) return;
    const result = await unpublish(selectedDetail.id, reason);
    setIsUnpublishOpen(false);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }

    showToast("Đã gỡ bài viết khỏi trang công khai", "success");
    const nextId = getNextArticleId(articles, selectedDetail.id);
    if (nextId) navigateToArticle(nextId);
    else handleBackToQueue();
  };

  // 4. Thao tác Xóa vĩnh viễn bài viết
  const handleConfirmDelete = async (reason) => {
    if (!selectedDetail) return;
    const result = await deleteArticle(selectedDetail.id, reason);
    setIsDeleteOpen(false);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }

    showToast("Đã xóa bài viết và cập nhật vết kiểm duyệt", "success");
    const nextId = getNextArticleId(articles, selectedDetail.id);
    if (nextId) navigateToArticle(nextId);
    else handleBackToQueue();
  };

  // Loading ban đầu
  if (loading && articles.length === 0) {
    return <SidebarDetailSkeleton items={4} />;
  }

  // Lỗi tải toàn bộ danh sách
  if (error && articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center bg-[#fffefa] dark:bg-[#1e2821] rounded-3xl border border-[#dedfd4] dark:border-[#354237] shadow-xs">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400">
          <AlertTriangle className="h-7 w-7" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#293d32] dark:text-[#ecece0]">
            Không tải được danh sách bài viết
          </h2>
          <p className="text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac] mt-1 max-w-md">{error}</p>
        </div>
        <button
          type="button"
          onClick={refetch}
          className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] text-xs sm:text-sm font-bold active:scale-[0.98] transition-all shadow-xs"
        >
          <RefreshCw className="w-4 h-4" strokeWidth={2} /> Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 min-h-[600px] text-[#293d32] dark:text-[#ecece0]">
      {/* ── CỘT TRÁI: THANH TAB + TÌM KIẾM + DANH SÁCH BÀI VIẾT ── */}
      <aside
        className={`w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col gap-4 ${
          articleIdParam ? "hidden lg:flex" : "flex"
        }`}
        aria-label="Danh sách quản trị bài viết"
      >
        {/* Tiêu đề & Tổng số lượng */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#293d32] dark:text-[#ecece0]">
              Quản trị bài viết
            </h1>
            <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] mt-0.5">
              {totalCount > 0 ? `Hiển thị ${totalCount} bài viết` : "Không có bài viết"}
            </p>
          </div>
          <button
            type="button"
            onClick={refetch}
            title="Làm mới danh sách"
            aria-label="Làm mới danh sách bài viết"
            className="p-2 min-h-[44px] min-w-[44px] rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] text-[#293d32] dark:text-[#ecece0] hover:bg-[#dedfd4]/30 active:scale-95 transition-all flex items-center justify-center shadow-2xs"
          >
            <RefreshCw className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" />
          </button>
        </div>

        {/* ── THANH TAB TRẠNG THÁI (Responsive: Tabs ngang trên desktop, Select trên mobile) ── */}
        <div>
          {/* Mobile Select (Dưới 768px) */}
          <div className="md:hidden">
            <label htmlFor="article-status-select" className="sr-only">
              Chọn trạng thái bài viết
            </label>
            <div className="relative">
              <select
                id="article-status-select"
                value={activeTab}
                onChange={(e) => handleTabChange(e.target.value)}
                className="w-full px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm font-bold rounded-xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-[#293d32] dark:text-[#ecece0] focus:ring-2 focus:ring-[#314e3e] dark:focus:ring-[#d6b883] outline-none shadow-2xs"
              >
                {STATUS_TABS.map((tab) => {
                  const count = statusCounts[tab.key] || 0;
                  return (
                    <option key={tab.key} value={tab.key}>
                      {tab.label} — {count} bài
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Desktop Horizontal Tabs (Từ 768px trở lên) */}
          <div
            role="tablist"
            aria-label="Bộ lọc trạng thái bài viết"
            className="hidden md:grid grid-cols-4 gap-1 p-1 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237]"
          >
            {STATUS_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const count = statusCounts[tab.key] || 0;
              return (
                <button
                  key={tab.key}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => handleTabChange(tab.key)}
                  className={`px-2 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                    isActive
                      ? "bg-[#fffefa] dark:bg-[#1e2821] text-[#314e3e] dark:text-[#d6b883] shadow-xs border border-[#dedfd4] dark:border-[#354237]"
                      : "text-[#575e55] dark:text-[#b0b9ac] hover:text-[#293d32] dark:hover:text-[#ecece0] border border-transparent"
                  }`}
                >
                  <span className="truncate max-w-full">{tab.label}</span>
                  <span
                    className={`inline-block px-1.5 py-0.2 rounded-full text-[0.625rem] tabular-nums ${
                      isActive
                        ? "bg-[#314e3e]/10 dark:bg-[#d6b883]/20 text-[#314e3e] dark:text-[#d6b883]"
                        : "bg-black/5 dark:bg-white/5 text-[#575e55] dark:text-[#b0b9ac]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Thanh tìm kiếm & Sắp xếp */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#575e55] dark:text-[#b0b9ac]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tiêu đề, tác giả..."
              className="w-full pl-9 pr-8 py-2.5 min-h-[44px] text-xs sm:text-sm rounded-xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 dark:placeholder-[#b0b9ac]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d6b883] shadow-2xs transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                aria-label="Xóa từ khóa tìm kiếm"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#575e55] dark:text-[#b0b9ac] hover:text-red-500 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={toggleSort}
            aria-label={`Sắp xếp: ${sortParam === "asc" ? "Cũ nhất trước" : "Mới nhất trước"}`}
            title={`Sắp xếp: ${sortParam === "asc" ? "Cũ nhất trước" : "Mới nhất trước"}`}
            className="flex items-center gap-1 px-3 py-2.5 min-h-[44px] rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] text-xs font-bold text-[#293d32] dark:text-[#ecece0] hover:bg-[#dedfd4]/30 active:scale-95 transition-all shrink-0 shadow-2xs"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d6b883]" />
            <span className="hidden sm:inline">
              {sortParam === "asc" ? "Cũ nhất" : "Mới nhất"}
            </span>
          </button>
        </div>

        {/* Danh sách bài viết */}
        <div className="flex flex-col gap-2.5">
          {articles.length === 0 ? (
            <div className="p-8 text-center bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac] space-y-2 shadow-2xs">
              <Inbox className="w-8 h-8 mx-auto text-[#575e55]/50 dark:text-[#b0b9ac]/50" />
              <p className="font-semibold text-[#293d32] dark:text-[#ecece0]">
                {queryParam ? "Không tìm thấy bài viết phù hợp" : `Chưa có bài viết trong mục này`}
              </p>
              {queryParam && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="text-xs text-[#314e3e] dark:text-[#d6b883] underline font-bold"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              )}
            </div>
          ) : (
            articles.map((art) => (
              <ArticleListItem
                key={art.id}
                article={art}
                isActive={articleIdParam === art.id}
                onSelect={handleSelectArticle}
                ref={articleIdParam === art.id ? lastActiveItemRef : null}
              />
            ))
          )}

          {/* Nút Tải thêm */}
          {hasMore && (
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full py-2.5 min-h-[44px] rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] text-xs font-bold text-[#314e3e] dark:text-[#d6b883] hover:bg-[#dedfd4]/30 active:scale-[0.99] transition-all disabled:opacity-50 shadow-2xs"
            >
              {loadingMore ? "Đang tải thêm..." : "Tải thêm bài viết"}
            </button>
          )}
        </div>
      </aside>

      {/* ── CỘT PHẢI: CHI TIẾT BÀI VIẾT & KHỐI THAO TÁC ── */}
      <main
        className={`flex-1 min-w-0 max-w-full flex-col ${
          articleIdParam ? "flex" : "hidden lg:flex"
        }`}
        aria-label="Chi tiết kiểm duyệt bài viết"
      >
        {!articleIdParam ? (
          <div className="h-full min-h-[450px] flex flex-col items-center justify-center gap-3 p-8 text-center bg-[#fffefa] dark:bg-[#1e2821] rounded-3xl border border-[#dedfd4] dark:border-[#354237] shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#314e3e]/10 dark:bg-[#d6b883]/20 flex items-center justify-center text-[#314e3e] dark:text-[#d6b883]">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#293d32] dark:text-[#ecece0]">
              Chọn một bài viết để xem chi tiết
            </h2>
            <p className="text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac] max-w-sm">
              Chọn bài viết từ danh sách bên trái để đọc nội dung, kiểm tra thông tin và thực hiện các thao tác quản trị.
            </p>
          </div>
        ) : loadingDetail ? (
          <div className="p-8 bg-[#fffefa] dark:bg-[#1e2821] rounded-3xl border border-[#dedfd4] dark:border-[#354237] flex flex-col gap-4 animate-pulse">
            <div className="h-8 bg-black/5 dark:bg-white/5 rounded-xl w-3/4" />
            <div className="h-32 bg-black/5 dark:bg-white/5 rounded-2xl w-full" />
            <div className="h-64 bg-black/5 dark:bg-white/5 rounded-2xl w-full" />
          </div>
        ) : isDetailNotFound || (!selectedDetail && !loadingDetail) ? (
          <div className="p-8 text-center bg-[#fffefa] dark:bg-[#1e2821] rounded-3xl border border-[#dedfd4] dark:border-[#354237] flex flex-col items-center gap-4 shadow-xs">
            <AlertCircle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#293d32] dark:text-[#ecece0]">
                Bài viết không tồn tại hoặc không thuộc quyền quản trị
              </h2>
              <p className="text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac] mt-1">
                Bài viết có thể đã bị xóa hoặc là bản nháp riêng tư của tác giả.
              </p>
            </div>
            <button
              type="button"
              onClick={handleBackToQueue}
              className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] text-xs sm:text-sm font-bold active:scale-95 transition-all shadow-xs"
            >
              Quay lại danh sách
            </button>
          </div>
        ) : errorDetail ? (
          <div className="p-8 text-center bg-[#fffefa] dark:bg-[#1e2821] rounded-3xl border border-red-200 dark:border-red-900 flex flex-col items-center gap-4 shadow-xs">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-red-700 dark:text-red-400">
                Lỗi tải chi tiết bài viết
              </h2>
              <p className="text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac] mt-1">{errorDetail}</p>
            </div>
            <button
              type="button"
              onClick={() => handleSelectArticle(articleIdParam)}
              className="px-5 py-2.5 min-h-[44px] rounded-xl bg-red-700 text-white text-xs sm:text-sm font-bold active:scale-95 transition-all shadow-xs"
            >
              Thử tải lại
            </button>
          </div>
        ) : (
          <div className="bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-3xl shadow-xs p-5 sm:p-7 flex flex-col gap-6 w-full min-w-0 max-w-full">
            {/* Header chi tiết: Nút quay lại (Mobile) & Điều hướng bài trước/tiếp */}
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#dedfd4] dark:border-[#354237]">
              <button
                type="button"
                onClick={handleBackToQueue}
                className="lg:hidden inline-flex items-center gap-1 px-3 py-2 min-h-[44px] rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] active:scale-95 transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" />
                <span>Danh sách</span>
              </button>

              <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-[#575e55] dark:text-[#b0b9ac]">
                <span>Chi tiết bài viết</span>
              </div>

              {/* Điều hướng bài trước / bài tiếp */}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => navigateToArticle(prevArticleId)}
                  disabled={!prevArticleId}
                  aria-label="Xem bài trước trong danh sách"
                  title="Bài trước"
                  className="inline-flex items-center gap-1 px-3 py-2 min-h-[44px] rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-xs font-bold text-[#293d32] dark:text-[#ecece0] hover:bg-[#dedfd4]/30 disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Bài trước</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateToArticle(nextArticleId)}
                  disabled={!nextArticleId}
                  aria-label="Xem bài tiếp theo trong danh sách"
                  title="Bài tiếp theo"
                  className="inline-flex items-center gap-1 px-3 py-2 min-h-[44px] rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-xs font-bold text-[#293d32] dark:text-[#ecece0] hover:bg-[#dedfd4]/30 disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-all"
                >
                  <span className="hidden sm:inline">Bài tiếp</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Banner Cảnh báo Xung đột Realtime đa Admin */}
            {isConflict && (
              <div
                role="alert"
                tabIndex={-1}
                className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-red-900 dark:text-red-200 shadow-xs"
              >
                <div className="flex items-center gap-2.5 font-bold">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                  <span>
                    Bài viết này vừa được thay đổi hoặc xóa bởi một quản trị viên khác. Các thao tác có thể cần tải lại.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={refetch}
                  className="shrink-0 px-4 py-2 min-h-[40px] rounded-xl bg-red-700 text-white font-bold text-xs hover:bg-red-800 active:scale-95 transition-all shadow-xs"
                >
                  Làm mới dữ liệu
                </button>
              </div>
            )}

            {/* Tiêu đề bài viết */}
            <div>
              <h2
                ref={detailHeadingRef}
                tabIndex={-1}
                className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#293d32] dark:text-[#ecece0] leading-tight tracking-tight [overflow-wrap:anywhere] break-words focus:outline-none"
              >
                {selectedDetail.title}
              </h2>
            </div>

            {/* Khối Thông tin xuất bản & Kiểm duyệt */}
            <PublicationInfoPanel
              article={selectedDetail}
              onOpenPreview={() => setIsPreviewOpen(true)}
            />

            {/* Nội dung bài viết Markdown */}
            <div className="space-y-2 w-full min-w-0 max-w-full">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7c5c2d] dark:text-[#d4b47d]">
                Nội dung bài viết
              </h3>
              <div className="p-4 sm:p-6 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] w-full min-w-0 max-w-full overflow-hidden">
                <div className="prose prose-stone dark:prose-invert max-w-none text-base leading-relaxed text-[#293d32] dark:text-[#ecece0] w-full min-w-0 max-w-full [overflow-wrap:anywhere] break-words">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    skipHtml
                    components={{
                      pre: ({ children, ...props }) => (
                        <div
                          role="region"
                          aria-label="Khối mã nguồn trong bài viết"
                          tabIndex={0}
                          className="w-full min-w-0 max-w-full overflow-x-auto my-5 rounded-2xl bg-[#1e2821] dark:bg-[#151c18] text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] p-4 text-xs sm:text-sm font-mono shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d6b883]"
                        >
                          <pre className="overflow-x-auto max-w-full whitespace-pre font-mono leading-relaxed bg-transparent p-0 m-0 border-0" {...props}>
                            {children}
                          </pre>
                        </div>
                      ),
                      code: ({ inline, className, children, ...props }) => {
                        const isInline = inline || (!className && !String(children).includes("\n"));
                        if (isInline) {
                          return (
                            <code
                              className="px-1.5 py-0.5 rounded-md bg-[#314e3e]/10 dark:bg-[#d6b883]/20 text-[#314e3e] dark:text-[#d6b883] font-mono text-[0.875em] font-semibold [overflow-wrap:anywhere] break-all border border-[#314e3e]/20 dark:border-[#d6b883]/30 before:content-none after:content-none"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        }
                        return (
                          <code className="font-mono text-xs sm:text-sm [overflow-wrap:anywhere] text-[#ecece0]" {...props}>
                            {children}
                          </code>
                        );
                      },
                      table: ({ children, ...props }) => (
                        <div
                          role="region"
                          aria-label="Bảng dữ liệu trong bài viết"
                          tabIndex={0}
                          className="overflow-x-auto my-6 w-full min-w-0 max-w-full rounded-2xl border border-[#dedfd4] dark:border-[#354237] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d6b883]"
                        >
                          <table className="w-full text-left border-collapse" {...props}>
                            {children}
                          </table>
                        </div>
                      ),
                    }}
                  >
                    {selectedDetail.content || "*(Nội dung trống)*"}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {/* ── KHỐI THAO TÁC QUẢN TRỊ DỰA TRÊN TRẠNG THÁI ── */}
            <div className="mt-2 pt-6 border-t border-[#dedfd4] dark:border-[#354237]">
              {/* 1. Thao tác khi bài đang CHỜ DUYỆT (Pending) */}
              {selectedDetail.status === "pending" && (
                <>
                  {!rejecting ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => setIsConfirmPublishOpen(true)}
                        disabled={isConflict || actionState.id !== null}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[44px] rounded-xl bg-[#314e3e] hover:bg-[#263e32] dark:bg-[#d6b883] dark:text-[#19251d] text-white text-xs sm:text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d6b883] focus-visible:ring-offset-2"
                      >
                        <Check className="w-4 h-4" strokeWidth={2.5} />
                        <span>Duyệt &amp; đăng bài</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRejecting(true)}
                        disabled={isConflict || actionState.id !== null}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[44px] rounded-xl bg-[#faf8f3] dark:bg-[#25332a] border border-[#dedfd4] dark:border-[#354237] text-[#293d32] dark:text-[#ecece0] text-xs sm:text-sm font-bold transition-all active:scale-[0.98] hover:bg-[#dedfd4]/40 dark:hover:bg-[#354237]/40 disabled:opacity-40 disabled:pointer-events-none shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      >
                        <X className="w-4 h-4" strokeWidth={2.5} />
                        <span>Từ chối</span>
                      </button>
                    </div>
                  ) : (
                    <RejectPanel
                      busy={actionState.id === selectedDetail.id && actionState.type === "reject"}
                      initialDraft={rejectDraft}
                      onCancel={() => setRejecting(false)}
                      onConfirm={handleConfirmReject}
                    />
                  )}
                </>
              )}

              {/* 2. Thao tác khi bài ĐÃ XUẤT BẢN (Published) */}
              {selectedDetail.status === "published" && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={`/bài-viết/${selectedDetail.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[44px] rounded-xl bg-[#314e3e] hover:bg-[#263e32] dark:bg-[#d6b883] dark:text-[#19251d] text-white text-xs sm:text-sm font-bold transition-all active:scale-[0.98] shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e]"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Xem bài viết công khai</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsUnpublishOpen(true)}
                    disabled={isConflict || actionState.id !== null}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[44px] rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-200 border border-orange-300 dark:border-orange-800 hover:bg-orange-200/70 text-xs sm:text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-40 shadow-2xs"
                  >
                    <EyeOff className="w-4 h-4" />
                    <span>Gỡ bài viết</span>
                  </button>
                </div>
              )}

              {/* 3. Thao tác khi bài BỊ TỪ CHỐI (Rejected) hoặc ĐÃ GỠ (Unpublished) */}
              {(selectedDetail.status === "rejected" || selectedDetail.status === "unpublished") && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/40 border border-[#dedfd4] dark:border-[#354237]">
                  <p className="text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac] italic">
                    Bài viết đang ở trạng thái {selectedDetail.status === "rejected" ? "Bị từ chối" : "Đã gỡ"}. Tác giả có thể chỉnh sửa và nộp lại vào hàng đợi chờ duyệt.
                  </p>

                  <button
                    type="button"
                    onClick={() => setIsDeleteOpen(true)}
                    disabled={isConflict || actionState.id !== null}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 hover:bg-red-200/80 text-xs sm:text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-40 shrink-0 shadow-2xs"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa vĩnh viễn</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── MODAL XÁC NHẬN DUYỆT BÀI ── */}
      <PublishConfirmModal
        article={selectedDetail}
        isOpen={isConfirmPublishOpen}
        isPublishing={actionState.id === selectedDetail?.id && actionState.type === "approve"}
        onClose={() => setIsConfirmPublishOpen(false)}
        onConfirm={handleConfirmPublish}
      />

      {/* ── MODAL GỠ BÀI VIẾT ── */}
      <UnpublishModal
        article={selectedDetail}
        isOpen={isUnpublishOpen}
        busy={actionState.id === selectedDetail?.id && actionState.type === "unpublish"}
        onClose={() => setIsUnpublishOpen(false)}
        onConfirm={handleConfirmUnpublish}
      />

      {/* ── MODAL XÓA BÀI VIẾT ── */}
      <DeleteConfirmModal
        article={selectedDetail}
        isOpen={isDeleteOpen}
        busy={actionState.id === selectedDetail?.id && actionState.type === "delete"}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* ── MODAL XEM TRƯỚC GIAO DIỆN CÔNG KHAI ── */}
      <ArticlePreviewModal
        article={selectedDetail}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}