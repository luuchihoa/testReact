import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays, User, Clock } from "lucide-react";
import ArticleStatusBadge from "./ArticleStatusBadge.jsx";

function formatDateVi(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function ArticleCard({ article, linkTo, showStatus = false }) {
  // Ước tính thời gian đọc: nếu có content thì tính theo từ, không thì ước lượng từ summary
  const wordCount = article.content
    ? article.content.trim().split(/\s+/).filter(Boolean).length
    : (article.summary || "").trim().split(/\s+/).filter(Boolean).length * 4; // quy đổi tương đương
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <Link to={linkTo} className="group block h-full">
      <article className="h-full flex flex-col bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 rounded-2xl overflow-hidden transition-all duration-300 shadow-xs md:hover:-translate-y-1 md:hover:shadow-md md:hover:border-amber-500/50">
        <div className="relative w-full h-40 bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-stone-800 dark:to-stone-850/50 overflow-hidden flex-shrink-0">
          {article.cover_image ? (
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-amber-250/70 dark:text-stone-700 bg-amber-50/10 dark:bg-stone-850/20 text-4xl font-serif font-black">
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-550 mb-1.5">
              {article.category}
            </span>
          )}
          <h3 className="text-[14px] sm:text-[15px] font-bold text-stone-900 dark:text-stone-100 leading-snug mb-1.5 line-clamp-2">
            {article.title}
          </h3>
          {article.summary && (
            <p className="text-[12px] sm:text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2 flex-1">
              {article.summary}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-400 dark:text-stone-500 font-medium">
            <span className="inline-flex items-center gap-1">
              <User className="w-3 h-3" /> {article.author_username}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {formatDateVi(article.published_at || article.updated_at)}
            </span>
            <span className="inline-flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" /> {readingTime} phút đọc
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}