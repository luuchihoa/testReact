import React from "react";
import { Clock } from "lucide-react";
import { formatDateVi } from "./format.js";

/**
 * @param {{ article: import("./useArticleQueue.js").Article, isActive: boolean, onSelect: (id: string) => void }} props
 */
function ArticleListItemBase({ article, isActive, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(article.id)}
      aria-current={isActive || undefined}
      className={`text-left rounded-2xl pl-3.5 pr-4 py-3 border-l-[2px] border transition-all duration-200 ease-out active:scale-[0.985] ${
        isActive
          ? "bg-amber-50 dark:bg-amber-900/20 border-l-amber-600 dark:border-l-amber-400 border-y-amber-900/10 border-r-amber-900/10 dark:border-y-amber-100/10 dark:border-r-amber-100/10 shadow-sm"
          : "bg-white/60 dark:bg-stone-900/40 border-l-transparent border-black/[0.06] dark:border-white/[0.08] md:hover:bg-amber-50/50 dark:md:hover:bg-amber-900/10 md:hover:border-black/10 dark:md:hover:border-white/[0.12]"
      }`}
    >
      <p className={`text-[14px] font-bold truncate leading-snug ${isActive ? "text-amber-950 dark:text-amber-50" : "text-stone-800 dark:text-stone-200"}`}>
        {article.title}
      </p>
      <div className={`flex items-center gap-1.5 mt-1.5 text-[11.5px] font-medium ${isActive ? "text-amber-800/70 dark:text-amber-400/70" : "text-stone-500 dark:text-stone-400"}`}>
        <span className="truncate">{article.author_username}</span>
        <span className="opacity-50">·</span>
        <span className="inline-flex items-center gap-1 shrink-0">
          <Clock className="w-3 h-3" strokeWidth={2} />
          {formatDateVi(article.submitted_at)}
        </span>
      </div>
    </button>
  );
}

// Re-renders only when this specific article's identity or active state
// changes — approving one row no longer re-renders the whole list.
export const ArticleListItem = React.memo(ArticleListItemBase);