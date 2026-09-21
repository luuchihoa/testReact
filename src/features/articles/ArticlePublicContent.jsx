import React, { useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, CalendarDays, Clock, ImageOff, Eye } from "lucide-react";
import { getAuthorDisplayName } from "../admin/articles/format.js";
import { formatPublishedDate } from "./articleListState.js";

/**
 * ArticlePublicContent
 *
 * Component dùng chung hiển thị nội dung bài viết công khai.
 * Tái sử dụng đồng nhất giữa:
 * 1. Trang chi tiết bài viết công khai (ArticleDetail.jsx)
 * 2. Modal xem trước của Admin (ArticlePreviewModal.jsx)
 */
export function ArticlePublicContent({
  article,
  isPreview = false,
  previewBanner = null,
  titleAs = "h1",
  className = "",
  headerExtra = null,
}) {
  const [failedCoverUrl, setFailedCoverUrl] = useState(null);
  const imageError = Boolean(article?.cover_image && failedCoverUrl === article.cover_image);

  if (!article) return null;

  const wordCount = (article.content || "").trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const authorName = getAuthorDisplayName(article.author, article.author_username);
  const displayDate = formatPublishedDate(article.published_at || (isPreview ? article.submitted_at || article.updated_at : null));

  const TitleTag = titleAs === "h2" ? "h2" : "h1";

  return (
    <article className={`w-full text-[#293d32] dark:text-[#ecece0] ${className}`}>
      {/* Banner dành riêng cho bản xem trước */}
      {isPreview && (
        <div
          role="status"
          className="mb-6 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/60 flex items-center gap-2.5 text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 shadow-xs"
        >
          <Eye className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
          <span>{previewBanner || "Bản xem trước — bài chưa được đăng công khai"}</span>
        </div>
      )}

      {/* Chuyên mục bài viết */}
      {article.category && (
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#314e3e]/10 dark:bg-[#d6b883]/20 text-xs font-bold uppercase tracking-wider text-[#314e3e] dark:text-[#d6b883] border border-[#314e3e]/20 dark:border-[#d6b883]/30">
            {article.category}
          </span>
        </div>
      )}

      {/* Tiêu đề bài viết (H1 trên trang đọc / H2 trên modal preview quản trị) */}
      <TitleTag className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-serif text-[#293d32] dark:text-[#ecece0] tracking-tight leading-tight mb-6 break-words">
        {article.title}
      </TitleTag>

      {/* Thông tin metadata (Tác giả, Ngày, Thời gian đọc, Nút Share nếu có) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#dedfd4] dark:border-[#354237] pb-5 mb-8 text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac] font-medium">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="inline-flex items-center gap-1.5 text-[#293d32] dark:text-[#ecece0] font-bold">
            <User className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" />
            <span>{authorName}</span>
            {article.author_username && authorName !== article.author_username && (
              <span className="text-xs font-normal text-[#575e55] dark:text-[#b0b9ac]">
                (@{article.author_username})
              </span>
            )}
          </span>

          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac]" />
            <span>{displayDate}</span>
          </span>

          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac]" />
            <span>{readingTime} phút đọc</span>
          </span>
        </div>

        {headerExtra}
      </div>

      {/* Ảnh bìa bài viết */}
      {article.cover_image && !imageError && (
        <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs mb-8 border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821]">
          <img
            src={article.cover_image}
            alt=""
            onError={() => setFailedCoverUrl(article.cover_image)}
            className="w-full h-auto max-h-[480px] object-cover"
            loading="eager"
            decoding="async"
          />
        </div>
      )}

      {/* Fallback khi link ảnh bìa bị lỗi */}
      {article.cover_image && imageError && (
        <div className="w-full min-w-0 max-w-full mb-8 p-6 rounded-2xl border border-dashed border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] flex items-center justify-center gap-2.5 text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac]">
          <ImageOff className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="[overflow-wrap:anywhere] break-words">Không tải được ảnh bìa từ đường dẫn đã cung cấp</span>
        </div>
      )}

      {/* Đoạn tóm tắt / Dẫn nhập lớn (Lead Paragraph) */}
      {article.summary ? (
        <p className="text-base sm:text-lg font-medium text-[#575e55] dark:text-[#b0b9ac] leading-relaxed mb-8 [overflow-wrap:anywhere]">
          {article.summary}
        </p>
      ) : isPreview ? (
        <div className="mb-8 p-3.5 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-dashed border-[#dedfd4] dark:border-[#354237] text-xs sm:text-sm italic text-[#575e55] dark:text-[#b0b9ac]">
          Chưa có đoạn tóm tắt bài viết
        </div>
      ) : null}

      {/* Toàn bộ nội dung bài viết Markdown */}
      <div
        className="prose prose-stone dark:prose-invert max-w-none text-base leading-relaxed
        text-[#293d32] dark:text-[#ecece0]
        prose-headings:font-serif prose-headings:text-[#293d32] dark:prose-headings:text-[#ecece0] prose-headings:font-bold prose-headings:tracking-tight
        prose-headings:[overflow-wrap:anywhere] prose-headings:break-words
        prose-p:leading-relaxed prose-p:text-[#293d32] dark:prose-p:text-[#ecece0] prose-p:[overflow-wrap:anywhere] prose-p:break-words
        prose-a:text-[#314e3e] dark:prose-a:text-[#d6b883] prose-a:font-bold prose-a:underline hover:prose-a:opacity-80
        prose-img:rounded-2xl prose-img:shadow-xs prose-img:mx-auto prose-img:border prose-img:border-[#dedfd4] dark:prose-img:border-[#354237]
        prose-li:marker:text-[#314e3e] dark:prose-li:marker:text-[#d6b883] prose-li:[overflow-wrap:anywhere] prose-li:break-words
        prose-blockquote:border-l-4 prose-blockquote:border-[#314e3e] dark:prose-blockquote:border-[#d6b883]
        prose-blockquote:bg-[#314e3e]/5 dark:prose-blockquote:bg-[#d6b883]/10
        prose-blockquote:text-[#293d32] dark:prose-blockquote:text-[#ecece0]
        prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
        prose-blockquote:[overflow-wrap:anywhere] prose-blockquote:break-words
        w-full min-w-0 max-w-full [overflow-wrap:anywhere] break-words"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          skipHtml
          components={{
            // Link an toàn: Link nội bộ dùng React Router, Link ngoài mở tab mới
            a: ({ href, children, ...props }) => {
              if (!href) return <span>{children}</span>;

              // Chặn protocol nguy hiểm
              const lowerHref = href.toLowerCase().trim();
              if (lowerHref.startsWith("javascript:") || lowerHref.startsWith("data:")) {
                return <span>{children}</span>;
              }

              const isInternal = href.startsWith("/") || href.startsWith("#");
              if (isInternal) {
                return (
                  <Link to={href} {...props}>
                    {children}
                  </Link>
                );
              }

              return (
                <a href={href} {...props} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              );
            },
            // Khối Code Block cuộn ngang độc lập, cho phép cuộn bằng bàn phím
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
            // Inline Code tự ngắt dòng an toàn
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
            // Bảng Markdown cuộn ngang có focusable region cho bàn phím
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
            // Ảnh Markdown lazy load & giữ nguyên alt của tác giả
            img: ({ src, alt, ...props }) => (
              <img
                src={src}
                alt={alt || ""}
                loading="lazy"
                decoding="async"
                className="rounded-2xl shadow-xs mx-auto border border-[#dedfd4] dark:border-[#354237] my-6 max-h-[520px] object-cover"
                {...props}
              />
            ),
          }}
        >
          {article.content || "*(Nội dung trống)*"}
        </ReactMarkdown>
      </div>
    </article>
  );
}

