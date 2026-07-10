import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays, User } from "lucide-react";
import ArticleStatusBadge from "./ArticleStatusBadge.jsx";

function formatDateVi(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// linkPrefix cho phép tái sử dụng card này ở trang public (/bài-viết/:slug)
// lẫn trang "bài viết của tôi" (/bài-viết-của-tôi/soạn/:id) mà không đổi trạng thái.
export default function ArticleCard({ article, linkTo, showStatus = false }) {
  return (
    <Link to={linkTo} className="group block h-full">
      <article className="h-full flex flex-col bg-white border border-stone-200/80 rounded-2xl overflow-hidden transition-all duration-300 md:hover:shadow-lg md:hover:border-amber-300">
        <div className="relative w-full h-40 bg-gradient-to-br from-amber-50 to-orange-50/50 overflow-hidden flex-shrink-0">
          {article.cover_image ? (
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-amber-200 text-4xl font-serif font-black">
              {article.title?.[0]?.toUpperCase() || "B"}
            </div>
          )}
          {showStatus && (
            <div className="absolute top-2.5 right-2.5">
              <ArticleStatusBadge status={article.status} />
            </div>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col">
          {article.category && (
            <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 mb-1.5">
              {article.category}
            </span>
          )}
          <h3 className="text-[15px] font-bold text-stone-900 leading-snug mb-1.5 line-clamp-2">
            {article.title}
          </h3>
          {article.summary && (
            <p className="text-[13px] text-stone-500 leading-relaxed line-clamp-2 flex-1">
              {article.summary}
            </p>
          )}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-stone-100 text-[11px] text-stone-400">
            <span className="inline-flex items-center gap-1">
              <User className="w-3 h-3" /> {article.author_username}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {formatDateVi(article.published_at || article.updated_at)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}