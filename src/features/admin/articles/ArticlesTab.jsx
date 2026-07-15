import React, { useState, useMemo, useCallback } from "react";
import { useToast } from "../../../components/ui/ToastContext.jsx";
import { useAdminContext } from "../AdminContext.jsx";
import { Loader2, Check, X, Inbox, ChevronLeft, RefreshCw, AlertTriangle, Search } from "lucide-react";
import { SidebarDetailSkeleton } from "../../../components/ui/Skeleton.jsx";
import { useArticleQueue } from "./useArticleQueue.js";
import { ArticleListItem } from "./ArticleListItem.jsx";
import { RejectPanel } from "./RejectPanel.jsx";
import { formatDateVi } from "./format.js";

export default function ArticlesTab() {
  const { showToast } = useToast();
  const { refreshPendingBaiViet } = useAdminContext();

  const handleError = useCallback((message) => {
    showToast(message, "error");
  }, [showToast]);

  const {
    articles,
    selected,
    selectedId,
    selectArticle,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    error,
    refetch,
    hasNewItems,
    approve,
    reject,
    actionState,
  } = useArticleQueue({ onError: handleError });

  const [rejecting, setRejecting] = useState(false);
  const [query, setQuery] = useState("");
  // Mobile: controls whether the list or the detail view is shown
  const [mobileView, setMobileView] = useState("list");

  const openArticle = useCallback((id) => {
    selectArticle(id);
    setRejecting(false);
    setMobileView("detail");
  }, [selectArticle]);

  const filteredArticles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (a) => a.title.toLowerCase().includes(q) || a.author_username.toLowerCase().includes(q)
    );
  }, [articles, query]);

  const isBusy = actionState.id !== null;

  const handleApprove = useCallback(async () => {
    if (!selected) return;
    const result = await approve(selected.id);
    if (!result.ok) { showToast(result.message, "error"); return; }
    showToast("Đã duyệt và đăng bài viết", "success");
    setMobileView("list");
    refreshPendingBaiViet();
  }, [selected, approve, showToast, refreshPendingBaiViet]);

  const handleReject = useCallback(async (reason) => {
    if (!selected) return;
    const result = await reject(selected.id, reason);
    if (!result.ok) { showToast(result.message, "error"); return; }
    showToast("Đã từ chối bài viết", "success");
    setRejecting(false);
    setMobileView("list");
    refreshPendingBaiViet();
  }, [selected, reject, showToast, refreshPendingBaiViet]);

  if (loading) return <SidebarDetailSkeleton items={4} />;

  if (error && articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100/60 dark:bg-red-900/20">
          <AlertTriangle className="h-7 w-7 text-red-600/70 dark:text-red-500/70" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[16px] font-bold text-amber-950 dark:text-amber-50 font-serif">Không tải được danh sách</p>
          <p className="text-[13px] text-stone-500 dark:text-stone-400 mt-0.5">{error}</p>
        </div>
        <button
          type="button"
          onClick={refetch}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-900 dark:bg-amber-100 text-amber-50 dark:text-amber-950 text-[13px] font-bold active:scale-[0.97] transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" strokeWidth={2.5} /> Thử lại
        </button>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100/50 dark:bg-amber-900/20">
          <Inbox className="h-7 w-7 text-amber-600/70 dark:text-amber-500/70" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[16px] font-bold text-amber-950 dark:text-amber-50 font-serif">Không có bài viết chờ duyệt</p>
          <p className="text-[13px] text-stone-500 dark:text-stone-400 mt-0.5">Danh sách sẽ tự cập nhật khi có bài mới</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 w-full min-w-0">
      {/* ------- Danh sách bài chờ duyệt -------
          Chỉ giới hạn chiều cao + tự cuộn ở desktop (lg), nơi cột này đứng
          cạnh cột chi tiết cao hơn. Trên mobile để cuộn tự nhiên theo trang,
          tránh 1 vùng cuộn con lồng trong trang đang cuộn (khó thao tác tay). */}
      <div className={`${mobileView === "detail" ? "hidden lg:flex" : "flex"} flex-col gap-1.5`}>
        <div className="flex items-center justify-between px-1 pb-1">
          <h3 className="text-[12px] font-bold text-amber-800/70 dark:text-amber-400/70 uppercase tracking-widest">
            CHỜ DUYỆT
          </h3>
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-amber-900 dark:bg-amber-100 text-amber-50 dark:text-amber-950 text-[11px] font-bold tabular-nums">
            {articles.length}{hasMore ? "+" : ""}
          </span>
        </div>

        {hasNewItems && (
          <button
            type="button"
            onClick={refetch}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-100/70 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-[12px] font-bold py-2 mb-1 active:scale-[0.98] transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" strokeWidth={2.5} /> Có bài mới — Tải lại
          </button>
        )}

        <div className="relative px-0.5 mb-1">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" strokeWidth={2} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề, tác giả…"
            className="w-full pl-9 pr-3 py-2 rounded-xl text-[13px] font-medium bg-white/60 dark:bg-stone-900/40 border border-black/[0.06] dark:border-white/[0.08] text-stone-700 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-col gap-1.5 lg:max-h-[70vh] lg:overflow-y-auto" data-lenis-prevent>
          {filteredArticles.length === 0 ? (
            <p className="text-[13px] text-stone-400 dark:text-stone-500 text-center py-6">Không tìm thấy bài viết phù hợp</p>
          ) : (
            filteredArticles.map((a) => (
              <ArticleListItem key={a.id} article={a} isActive={selectedId === a.id} onSelect={openArticle} />
            ))
          )}

          {!query && hasMore && (
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12.5px] font-bold text-amber-800/80 dark:text-amber-400/80 bg-amber-50/50 dark:bg-amber-900/10 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loadingMore ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {loadingMore ? "Đang tải…" : "Tải thêm"}
            </button>
          )}
        </div>
      </div>

      {/* ------- Chi tiết bài đang chọn -------
          Toàn bộ phần chi tiết chỉ còn ĐÚNG 1 khung ngoài cùng. Các khu vực
          bên trong (ảnh bìa, nội dung, nút hành động) dùng khoảng cách +
          đường kẻ phân cách thay vì mỗi khu vực 1 khung/bóng/viền riêng. */}
      {selected && (
        <div className={`${mobileView === "list" ? "hidden lg:block" : "block"} min-w-0 w-full`}>
          <div className="bg-white/90 dark:bg-[#1C1917]/90 border border-amber-900/10 dark:border-amber-100/10 rounded-[28px] p-4 sm:p-7 shadow-sm">

            {/* Mobile back control */}
            <button
              type="button"
              onClick={() => setMobileView("list")}
              className="lg:hidden inline-flex items-center gap-1 text-[13px] font-bold text-stone-500 dark:text-stone-400 mb-4 -ml-1 px-1 py-1 active:opacity-60"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
              Danh sách
            </button>

            <h2 className="text-[20px] sm:text-[22px] font-bold text-amber-950 dark:text-amber-50 font-serif leading-tight tracking-[-0.01em] break-words">
              {selected.title}
            </h2>
            <p className="text-[13px] text-stone-500 dark:text-stone-400 font-medium mt-1.5 mb-5 flex flex-wrap items-center gap-2">
              <span className="font-bold text-stone-700 dark:text-stone-300 truncate max-w-[160px]">{selected.author_username}</span>
              <span className="opacity-50">·</span>
              <span className="shrink-0">gửi lúc {formatDateVi(selected.submitted_at)}</span>
              {selected.category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100/50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  {selected.category}
                </span>
              )}
            </p>

            {selected.cover_image && (
              <img
                src={selected.cover_image}
                alt={selected.title}
                loading="lazy"
                className="w-full max-h-72 object-cover rounded-2xl mb-5"
              />
            )}

            {/* Nội dung markdown: chỉ tự cuộn ở desktop (lg); trên mobile
                để dài bao nhiêu hiện bấy nhiêu, cuộn chung theo trang. */}
            <ArticleMarkdown content={selected.content} />

            {/* Hành động: nằm trong luồng nội dung bình thường, KHÔNG sticky
                — trang đã có tab bar riêng ở đáy, tránh chồng 2 thanh nổi. */}
            <div className="mt-6 pt-5 border-t border-amber-900/10 dark:border-amber-100/10">
              {!rejecting ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={isBusy}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-600 text-white text-[14px] font-bold transition-all duration-150 active:scale-[0.98] md:hover:bg-emerald-700 disabled:opacity-50 disabled:active:scale-100"
                  >
                    {actionState.id === selected.id && actionState.type === "approve"
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Check className="w-4 h-4" strokeWidth={2.5} />}
                    Duyệt & đăng
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejecting(true)}
                    disabled={isBusy}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[14px] font-bold transition-all duration-150 active:scale-[0.98] md:hover:bg-stone-200 dark:md:hover:bg-stone-700 disabled:opacity-50 disabled:active:scale-100"
                  >
                    <X className="w-4 h-4" strokeWidth={2.5} /> Từ chối
                  </button>
                </div>
              ) : (
                <RejectPanel
                  busy={actionState.id === selected.id && actionState.type === "reject"}
                  onCancel={() => setRejecting(false)}
                  onConfirm={handleReject}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Isolated so ReactMarkdown (a relatively heavy render) only re-renders
 * when the article content itself changes, not on every parent state tick
 * (search typing, hover state, etc.).
 */
const ArticleMarkdown = React.memo(function ArticleMarkdown({ content }) {
  const [Markdown, setMarkdown] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([import("react-markdown"), import("remark-gfm")]).then(([md, gfm]) => {
      if (!cancelled) setMarkdown({ Component: md.default, remarkGfm: gfm.default });
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div
      data-lenis-prevent
      className="prose prose-stone dark:prose-invert prose-sm max-w-none bg-stone-50/80 dark:bg-stone-900/50 rounded-2xl px-4 sm:px-6 py-5 overflow-x-hidden break-words [word-break:break-word] lg:max-h-[380px] lg:overflow-y-auto [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_code]:whitespace-pre-wrap [&_code]:break-all"
    >
      {Markdown
        ? <Markdown.Component remarkPlugins={[Markdown.remarkGfm]} skipHtml>{content}</Markdown.Component>
        : <p className="text-stone-400 text-[13px]">Đang tải nội dung…</p>}
    </div>
  );
});