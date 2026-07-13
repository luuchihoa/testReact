import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, User, Clock } from "lucide-react";
import ArticleStatusBadge from "./ArticleStatusBadge.jsx";

function formatDateVi(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Thứ tự xuất hiện trong danh sách (index) quyết định độ trễ vào — tạo hiệu
// ứng lần lượt thay vì tất cả bật lên cùng lúc. Giới hạn ở 8 phần tử đầu để
// những trang có nhiều bài viết không phải chờ quá lâu mới thấy hết.
export default function ArticleCard({ article, linkTo, showStatus = false, index = 0 }) {
  // Ước tính thời gian đọc
  const wordCount = article.content
    ? article.content.trim().split(/\s+/).filter(Boolean).length
    : (article.summary || "").trim().split(/\s+/).filter(Boolean).length * 4;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <Link to={linkTo} className="group block h-full">
      <motion.article
        layout="position"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
        transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.045, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="h-full flex flex-col bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl border border-amber-900/10 dark:border-amber-100/10 rounded-[28px] overflow-hidden shadow-sm md:hover:shadow-md transition-shadow duration-300"
      >
        
        {/* Ảnh Thumbnail */}
        <div className="relative w-full h-44 bg-amber-50/50 dark:bg-stone-900/50 overflow-hidden flex-shrink-0 border-b border-amber-900/5 dark:border-amber-100/5">
          {article.cover_image ? (
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-amber-900/20 dark:text-stone-800 bg-amber-50/30 dark:bg-stone-900/20 text-5xl font-serif font-black">
              {article.title?.[0]?.toUpperCase() || "B"}
            </div>
          )}
          {showStatus && (
            <div className="absolute top-3 right-3">
              <ArticleStatusBadge status={article.status} />
            </div>
          )}
        </div>

        {/* Nội dung */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col">
          {article.category && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 mb-2">
              {article.category}
            </span>
          )}
          <h3 className="text-[16px] sm:text-[17px] font-extrabold text-amber-950 dark:text-amber-50 font-serif leading-snug mb-2.5 line-clamp-2 transition-colors duration-200 md:group-hover:text-amber-800 dark:md:group-hover:text-amber-300">
            {article.title}
          </h3>
          {article.summary && (
            <p className="text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2 flex-1 font-medium">
              {article.summary}
            </p>
          )}
          
          {/* Footer thông tin Meta */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-4 pt-4 border-t border-amber-900/10 dark:border-amber-100/10 text-[11px] text-stone-500 dark:text-stone-400 font-semibold">
            <span className="inline-flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> {article.author_username}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              {formatDateVi(article.published_at || article.updated_at)}
            </span>
            <span className="inline-flex items-center gap-1.5 ml-auto text-amber-700 dark:text-amber-400">
              <Clock className="w-3.5 h-3.5" /> {readingTime} phút đọc
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}