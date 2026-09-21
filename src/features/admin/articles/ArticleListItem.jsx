import React, { forwardRef } from "react";
import { Clock } from "lucide-react";
import {
  getAuthorDisplayName,
  getArticleStatusMeta,
  getArticleTimestampMeta,
  isAging,
  formatAgingDays,
} from "./format.js";

const ArticleListItemBase = forwardRef(function ArticleListItemBase(
  { article, isActive, onSelect },
  ref
) {
  if (!article) return null;

  const authorName = getAuthorDisplayName(article.author, article.author_username);
  const statusMeta = getArticleStatusMeta(article.status);
  const timeMeta = getArticleTimestampMeta(article);

  const isPending = article.status === "pending";
  const aging = isPending && isAging(article.submitted_at, 3);
  const agingText = aging ? formatAgingDays(article.submitted_at) : "";

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onSelect(article.id)}
      aria-current={isActive ? "true" : undefined}
      aria-label={`Bài viết: ${article.title}, tác giả ${authorName}`}
      className={`w-full text-left rounded-2xl p-3.5 border-l-[3.5px] border transition-all duration-200 ease-out active:scale-[0.985] min-h-[44px] flex flex-col justify-between gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d6b883] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#151c18] ${
        isActive
          ? "bg-[#314e3e]/10 dark:bg-[#d6b883]/20 border-l-[#314e3e] dark:border-l-[#d6b883] border-y-[#dedfd4] border-r-[#dedfd4] dark:border-y-[#354237] dark:border-r-[#354237] shadow-xs"
          : "bg-[#fffefa] dark:bg-[#1e2821] border-l-transparent border-[#dedfd4] dark:border-[#354237] hover:border-l-[#314e3e]/50 dark:hover:border-l-[#d6b883]/50 hover:bg-[#faf8f3]/60 dark:hover:bg-[#25332a]/60"
      }`}
    >
      {/* Tiêu đề 2 dòng có wrap an toàn */}
      <div className="w-full">
        <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
          {article.category && (
            <span className="inline-block text-[0.6875rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#314e3e]/10 dark:bg-[#d6b883]/20 text-[#314e3e] dark:text-[#d6b883] border border-[#314e3e]/20 dark:border-[#d6b883]/30">
              {article.category}
            </span>
          )}

          {/* Badge trạng thái hoặc nhãn chờ */}
          {aging ? (
            <span
              className="inline-flex items-center gap-1 text-[0.6875rem] font-medium px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 shrink-0"
              title="Bài viết đã chờ duyệt"
            >
              {agingText}
            </span>
          ) : (
            !isPending && (
              <span
                className={`inline-block text-[0.6875rem] font-bold px-2 py-0.5 rounded-md border shrink-0 ${statusMeta.badgeClass}`}
              >
                {statusMeta.label}
              </span>
            )
          )}
        </div>

        <p
          className={`text-sm font-bold line-clamp-2 leading-snug break-words ${
            isActive ? "text-[#314e3e] dark:text-[#d6b883]" : "text-[#293d32] dark:text-[#ecece0]"
          }`}
        >
          {article.title}
        </p>
      </div>

      {/* Tác giả & Thời gian */}
      <div
        className={`flex items-center justify-between gap-2 text-xs font-medium pt-1 border-t border-black/5 dark:border-white/5 ${
          isActive ? "text-[#314e3e]/85 dark:text-[#d6b883]/90" : "text-[#575e55] dark:text-[#b0b9ac]"
        }`}
      >
        <span className="truncate max-w-[55%]" title={authorName}>
          {authorName}
        </span>

        <span
          className="inline-flex items-center gap-1 shrink-0 tabular-nums cursor-help"
          title={`${timeMeta.label}: ${timeMeta.fullStr}`}
        >
          <Clock className="w-3 h-3 opacity-70" />
          <span>{timeMeta.relativeStr}</span>
        </span>
      </div>
    </button>
  );
});

export const ArticleListItem = React.memo(ArticleListItemBase);