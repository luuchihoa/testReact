import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../../components/ui/ToastContext.jsx";
import ArticleCard from "./ArticleCard.jsx";
import { Loader2, Newspaper, Search, X, SlidersHorizontal } from "lucide-react";

const PAGE_SIZE = 12;

export default function ArticleList() {
  const { showToast } = useToast();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  // Dùng lại role đã cache ở localStorage giống RequireAdminRoute — cho phép
  // admin xoá nhanh 1 bài ngay trên trang công khai, không cần vào khu quản trị.
  const isAdmin = localStorage.getItem("role") === "admin";

  const handleAdminDelete = async (id) => {
    if (!window.confirm("Xoá vĩnh viễn bài viết này? Hành động không thể hoàn tác.")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) { showToast(error.message || "Không xoá được bài viết", "error"); return; }
    showToast("Đã xoá bài viết", "success");
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from("articles")
        .select("id, slug, title, summary, cover_image, category, author_username, published_at, updated_at", { count: "exact" })
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .range(from, to);

      if (cancelled) return;
      if (error) {
        console.error("ArticleList: fetch error:", error);
        setLoading(false);
        return;
      }

      setArticles((prev) => (page === 0 ? data : [...prev, ...data]));
      setHasMore((count ?? 0) > to + 1);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [page]);

  const categories = useMemo(() => {
    const list = new Set(articles.map((a) => a.category).filter(Boolean));
    return ["Tất cả", ...Array.from(list)];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchesSearch = 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.summary && a.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
        a.author_username.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "Tất cả" || a.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917] text-stone-800 dark:text-stone-200 transition-colors duration-500 fade-in-up overflow-x-hidden">
      
      {/* Background Pattern trang trí */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#92400E08_1px,transparent_1px),linear-gradient(to_bottom,#92400E08_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#FDE68A05_1px,transparent_1px),linear-gradient(to_bottom,#FDE68A05_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />
      <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-200/30 dark:bg-amber-900/20 blur-[100px] rounded-full -z-10 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
        
        {/* Tiêu đề chính trang bài viết */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 text-center sm:text-left"
        >
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-800/70 dark:text-amber-400/70 mb-2">
            Không gian lưu trữ
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-amber-950 dark:text-amber-50 font-serif leading-tight">
            Bài viết & Chia sẻ
          </h1>
          <p className="text-[14px] font-medium text-stone-500 dark:text-stone-400 mt-2 sm:mt-3 leading-relaxed max-w-2xl">
            Góc suy niệm, sự kiện và tài liệu học tập từ Ban Giáo Lý xứ đoàn An Ngãi.
          </p>
        </motion.div>

        {/* Thanh tìm kiếm & bộ lọc (Glassmorphism) */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10 bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl border border-amber-900/10 dark:border-amber-100/10 p-4 sm:p-5 rounded-[28px] shadow-sm"
        >
          
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-amber-900/50 dark:text-amber-100/50 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tiêu đề, tóm tắt hoặc tác giả..."
              className="w-full rounded-xl border border-amber-900/20 dark:border-amber-100/10 bg-white/60 dark:bg-stone-900/40 pl-11 pr-11 py-3 text-[14px] font-medium text-amber-950 dark:text-amber-50 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-900/30 dark:focus:ring-amber-500/30 focus:border-amber-500 transition-all shadow-inner backdrop-blur-sm"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button 
                  type="button" 
                  onClick={() => setSearchQuery("")}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.15 }}
                  whileTap={{ scale: 0.85 }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full bg-stone-100 dark:bg-stone-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Bộ lọc chuyên mục */}
          {categories.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1 lg:pb-0" data-lenis-prevent>
              <SlidersHorizontal className="w-4 h-4 text-stone-400 flex-shrink-0 hidden sm:inline ml-2" />
              <div className="flex gap-1.5 whitespace-nowrap bg-white/60 dark:bg-stone-900/40 p-1.5 rounded-2xl border border-amber-900/10 dark:border-amber-100/10 shadow-sm">
                {categories.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`relative px-4 py-2.5 rounded-xl text-[13px] font-bold transition-colors duration-300 active:scale-[0.97] ${
                        active
                          ? "text-amber-50 dark:text-white"
                          : "text-stone-500 dark:text-stone-400 md:hover:text-stone-800 dark:md:hover:text-stone-200"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="category-pill"
                          className="absolute inset-0 bg-amber-900 dark:bg-amber-600 rounded-xl shadow-sm -z-10"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Danh sách kết quả */}
        {loading && page === 0 ? (
          <div className="flex items-center justify-center gap-3 py-24 text-stone-500">
            <Loader2 className="w-6 h-6 animate-spin text-amber-900 dark:text-amber-500" />
            <span className="text-[14px] font-bold">Đang tải các bài viết…</span>
          </div>
        ) : filteredArticles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center gap-4 py-24 text-center bg-white/60 dark:bg-stone-900/40 border border-amber-900/5 dark:border-amber-100/5 rounded-[28px] p-8 shadow-sm backdrop-blur-sm"
          >
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-2">
              <Newspaper className="w-7 h-7 text-amber-700 dark:text-amber-400" />
            </div>
            <h3 className="text-[16px] font-extrabold text-amber-950 dark:text-amber-50 font-serif">Không có bài viết phù hợp</h3>
            <p className="text-[14px] font-medium text-stone-500 dark:text-stone-400 max-w-sm">
              {searchQuery ? "Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc chuyên mục khác." : "Chưa có bài viết nào được xuất bản ở chuyên mục này."}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setSelectedCategory("Tất cả"); }}
                className="mt-3 text-[13px] font-bold text-amber-800 dark:text-amber-500 md:hover:underline"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </motion.div>
        ) : (
          <>
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              <AnimatePresence mode="popLayout">
                {filteredArticles.map((a, i) => (
                  <ArticleCard
                    key={a.id}
                    article={a}
                    linkTo={`/bài-viết/${a.slug}`}
                    index={i}
                    onDelete={isAdmin ? handleAdminDelete : undefined}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {hasMore && !searchQuery && selectedCategory === "Tất cả" && (
              <div className="flex justify-center mt-12 mb-4">
                <motion.button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-black/5 dark:border-white/5 transition-all duration-300 md:hover:bg-stone-200 dark:md:hover:bg-stone-700 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Đang tải thêm…" : "Xem thêm bài viết"}
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}