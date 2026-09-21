import React, { forwardRef, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, User, ImageOff, ArrowUpRight } from "lucide-react";
import { getAuthorDisplayName } from "../admin/articles/format.js";
import { formatPublishedDate } from "./articleListState.js";

/**
 * ArticleCard
 *
 * Component hiển thị Card bài viết trên trang công khai (/bài-viết).
 * Hỗ trợ 2 biến thể:
 * - "featured": Card lớn "Bài mới nhất" ở đầu trang danh sách.
 * - "standard": Card chuẩn (ngang gọn trên mobile <640px, dọc trong grid trên tablet/desktop >=640px).
 */
const ArticleCard = forwardRef(function ArticleCard(
  {
    article,
    linkTo,
    variant = "standard",
    className = "",
  },
  ref
) {
  const [imageError, setImageError] = useState(false);

  if (!article) return null;

  const authorName = getAuthorDisplayName(article.author, article.author_username);
  const displayDate = formatPublishedDate(article.published_at);
  const isFeatured = variant === "featured";

  // ── 1. BIẾN THỂ FEATURED ("Bài mới nhất" khổ lớn ở đầu trang) ──
  if (isFeatured) {
    return (
      <Link
        ref={ref}
        to={linkTo}
        data-article-id={article.id}
        className={`group block w-full rounded-3xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] overflow-hidden shadow-xs hover:border-[#314e3e]/40 dark:hover:border-[#d6b883]/40 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d6b883] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#151c18] ${className}`}
      >
        <article className="grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Ảnh bìa Featured */}
          <div className="lg:col-span-7 relative w-full aspect-video lg:aspect-auto lg:min-h-[340px] bg-[#faf8f3] dark:bg-[#151c18] overflow-hidden border-b lg:border-b-0 lg:border-r border-[#dedfd4] dark:border-[#354237]">
            {article.cover_image && !imageError ? (
              <img
                src={article.cover_image}
                alt=""
                onError={() => setImageError(true)}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
              />
            ) : (
              <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center text-[#314e3e]/30 dark:text-[#d6b883]/30 bg-[#314e3e]/5 dark:bg-[#314e3e]/10">
                {imageError ? (
                  <ImageOff className="w-8 h-8 mb-2" />
                ) : (
                  <span className="text-6xl font-serif font-black">{article.title?.[0]?.toUpperCase() || "B"}</span>
                )}
              </div>
            )}

            {article.category && (
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#fffefa]/90 dark:bg-[#1e2821]/90 backdrop-blur-xs text-xs font-bold uppercase tracking-wider text-[#314e3e] dark:text-[#d6b883] border border-[#dedfd4]/80 dark:border-[#354237]/80 shadow-2xs">
                  {article.category}
                </span>
              </div>
            )}
          </div>

          {/* Nội dung Featured */}
          <div className="lg:col-span-5 p-5 sm:p-7 lg:p-8 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-block text-[0.6875rem] font-bold uppercase tracking-widest text-[#7c5c2d] dark:text-[#d4b47d]">
                  BÀI MỚI NHẤT
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-serif text-[#293d32] dark:text-[#ecece0] leading-tight tracking-tight line-clamp-3 group-hover:text-[#314e3e] dark:group-hover:text-[#d6b883] transition-colors">
                {article.title}
              </h2>

              {article.summary && (
                <p className="text-sm sm:text-base font-medium text-[#575e55] dark:text-[#b0b9ac] leading-relaxed line-clamp-3">
                  {article.summary}
                </p>
              )}
            </div>

            {/* Metadata Tác giả + Ngày đăng */}
            <div className="pt-4 border-t border-[#dedfd4] dark:border-[#354237] flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-[#575e55] dark:text-[#b0b9ac]">
              <span className="inline-flex items-center gap-1.5 font-bold text-[#293d32] dark:text-[#ecece0] truncate max-w-[60%]">
                <User className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d6b883] shrink-0" />
                <span className="truncate">{authorName}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 shrink-0 tabular-nums">
                <CalendarDays className="w-3.5 h-3.5 opacity-80 shrink-0" />
                <span>{displayDate}</span>
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // ── 2. BIẾN THỂ STANDARD (Ngang trên Mobile <640px, Dọc trong Grid >=640px) ──
  return (
    <Link
      ref={ref}
      to={linkTo}
      data-article-id={article.id}
      className={`group block h-full rounded-2xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] overflow-hidden shadow-2xs hover:border-[#314e3e]/40 dark:hover:border-[#d6b883]/40 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d6b883] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#151c18] ${className}`}
    >
      <article className="h-full flex flex-row sm:flex-col p-3.5 sm:p-0">
        {/* Ảnh Thumbnail: 88px ở 320-389px, 104px ở 390-639px, full-width h-44 ở >=640px */}
        <div className="relative shrink-0 w-[88px] h-[88px] min-[390px]:w-[104px] min-[390px]:h-[96px] sm:w-full sm:h-44 bg-[#faf8f3] dark:bg-[#151c18] overflow-hidden rounded-xl sm:rounded-none sm:rounded-t-2xl border sm:border-0 sm:border-b border-[#dedfd4] dark:border-[#354237]">
          {article.cover_image && !imageError ? (
            <img
              src={article.cover_image}
              alt=""
              onError={() => setImageError(true)}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-300 sm:group-hover:scale-104"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#314e3e]/30 dark:text-[#d6b883]/30 bg-[#314e3e]/5 dark:bg-[#314e3e]/10">
              {imageError ? (
                <ImageOff className="w-5 h-5 opacity-60" />
              ) : (
                <span className="text-2xl sm:text-4xl font-serif font-black">{article.title?.[0]?.toUpperCase() || "B"}</span>
              )}
            </div>
          )}

          {article.category && (
            <span className="hidden sm:inline-flex absolute top-3 left-3 items-center px-2.5 py-0.5 rounded-full bg-[#fffefa]/90 dark:bg-[#1e2821]/90 backdrop-blur-xs text-[0.6875rem] font-bold uppercase tracking-wider text-[#314e3e] dark:text-[#d6b883] border border-[#dedfd4]/80 dark:border-[#354237]/80 shadow-2xs">
              {article.category}
            </span>
          )}
        </div>

        {/* Nội dung Card */}
        <div className="flex-1 flex flex-col justify-between pl-3.5 sm:p-5 min-w-0">
          <div>
            {/* Category tag trên mobile */}
            {article.category && (
              <span className="sm:hidden inline-block text-[0.6875rem] font-bold uppercase tracking-wider text-[#7c5c2d] dark:text-[#d4b47d] mb-1">
                {article.category}
              </span>
            )}

            <h3 className="text-sm sm:text-base font-bold font-serif text-[#293d32] dark:text-[#ecece0] leading-snug line-clamp-3 sm:line-clamp-2 group-hover:text-[#314e3e] dark:group-hover:text-[#d6b883] transition-colors break-words">
              {article.title}
            </h3>

            {article.summary && (
              <p className="hidden sm:block text-xs sm:text-sm font-medium text-[#575e55] dark:text-[#b0b9ac] leading-relaxed line-clamp-2 mt-2">
                {article.summary}
              </p>
            )}
          </div>

          {/* Footer Metadata */}
          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-[#dedfd4]/60 dark:border-[#354237]/60 flex items-center justify-between gap-2 text-xs font-medium text-[#575e55] dark:text-[#b0b9ac]">
            <span className="truncate max-w-[60%] font-semibold text-[#293d32] dark:text-[#ecece0]">
              {authorName}
            </span>

            <span className="inline-flex items-center gap-1 shrink-0 tabular-nums text-[0.6875rem] sm:text-xs">
              <CalendarDays className="w-3 h-3 opacity-70" />
              <span>{displayDate}</span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
});

export default ArticleCard;