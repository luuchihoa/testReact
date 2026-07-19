import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageMotion } from "../../hooks/usePageMotion.js";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../../components/ui/ToastContext.jsx";
import ArticleCard from "./ArticleCard.jsx";
import { Loader2, Newspaper, Search, X, SlidersHorizontal } from "lucide-react";

const PAGE_SIZE = 12;

export default function ArticleList() {
  const { heroReveal } = usePageMotion();
  const { showToast } = useToast();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [categories, setCategories] = useState(["Tất cả"]);

  const observerTarget = useRef(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Admin quyền xoá nhanh
  const isAdmin = localStorage.getItem("role") === "admin";

  const handleAdminDelete = async (id) => {
    if (!window.confirm("Xoá vĩnh viễn bài viết này? Hành động không thể hoàn tác.")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) { showToast(error.message || "Không xoá được bài viết", "error"); return; }
    showToast("Đã xoá bài viết", "success");
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  // Fetch unique categories once on mount
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("articles")
          .select("category")
          .eq("status", "published")
          .not("category", "is", null);
        
        if (!error && data) {
          const uniqueCats = [...new Set(data.map((d) => d.category))];
          setCategories(["Tất cả", ...uniqueCats.sort()]);
        }
      } catch (err) {
        console.error("Lỗi lấy danh mục:", err);
      }
    })();
  }, []);

  // Fetch articles (resets on search or category change)
  const fetchArticles = useCallback(async (currentPage, isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);
    else setLoadingMore(true);

    const from = currentPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("articles")
      .select("id, slug, title, summary, cover_image, category, author_username, published_at, updated_at", { count: "exact" })
      .eq("status", "published")
      .order("published_at", { ascending: false });

    // Server-side filtering
    if (debouncedSearch.trim()) {
      query = query.or(`title.ilike.%${debouncedSearch}%,summary.ilike.%${debouncedSearch}%,author_username.ilike.%${debouncedSearch}%`);
    }
    if (selectedCategory !== "Tất cả") {
      query = query.eq("category", selectedCategory);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error("ArticleList: fetch error:", error);
      showToast("Lỗi tải bài viết", "error");
    } else {
      setArticles((prev) => (isLoadMore ? [...prev, ...data] : data));
      setHasMore((count ?? 0) > to + 1);
    }

    setLoading(false);
    setLoadingMore(false);
  }, [debouncedSearch, selectedCategory, showToast]);

  // Handle filter changes (Reset page to 0)
  useEffect(() => {
    setPage(0);
    fetchArticles(0, false);
  }, [debouncedSearch, selectedCategory, fetchArticles]);

  // Handle page increment for infinite scroll
  useEffect(() => {
    if (page > 0) {
      fetchArticles(page, true);
    }
  }, [page, fetchArticles]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917] text-stone-800 dark:text-stone-200 transition-colors duration-500 fade-in-up overflow-x-hidden pb-16">
      
      {/* Background Pattern */}
      <div className="fixed inset-0 w-full h-screen bg-[linear-gradient(to_right,#92400E08_1px,transparent_1px),linear-gradient(to_bottom,#92400E08_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#FDE68A05_1px,transparent_1px),linear-gradient(to_bottom,#FDE68A05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />
      <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-200/30 dark:bg-amber-900/20 blur-[100px] rounded-full -z-10 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
        
        <motion.div
          variants={heroReveal}
          initial="hidden"
          animate="visible"
          custom={0}
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

        {/* Thanh tìm kiếm & bộ lọc */}
        <motion.div
          variants={heroReveal}
          initial="hidden"
          animate="visible"
          custom={0.1}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10 bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl border border-amber-900/10 dark:border-amber-100/10 p-4 sm:p-5 rounded-[28px] shadow-sm relative z-20"
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
            <div className="flex items-center gap-3 overflow-x-auto pb-1 lg:pb-0 hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
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

        {/* Loading Spinner cho lần tải đầu tiên */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-24 text-stone-500">
            <Loader2 className="w-6 h-6 animate-spin text-amber-900 dark:text-amber-500" />
            <span className="text-[14px] font-bold">Đang tải các bài viết…</span>
          </div>
        )}

        {/* Hiển thị khi không có dữ liệu */}
        {!loading && articles.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center gap-4 py-24 text-center bg-white/60 dark:bg-stone-900/40 border border-amber-900/5 dark:border-amber-100/5 rounded-[28px] p-8 shadow-sm backdrop-blur-sm"
          >
            <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-2 shadow-inner">
              <Newspaper className="w-9 h-9 text-amber-700 dark:text-amber-400 opacity-80" />
            </div>
            <h3 className="text-[18px] font-extrabold text-amber-950 dark:text-amber-50 font-serif">
              Không có bài viết phù hợp
            </h3>
            <p className="text-[14px] font-medium text-stone-500 dark:text-stone-400 max-w-sm">
              {debouncedSearch 
                ? "Thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc chuyên mục khác xem sao!" 
                : "Chưa có bài viết nào được xuất bản ở chuyên mục này."}
            </p>
            {(debouncedSearch || selectedCategory !== "Tất cả") && (
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setDebouncedSearch(""); setSelectedCategory("Tất cả"); }}
                className="mt-4 px-6 py-2.5 rounded-full text-[13px] font-bold bg-amber-900 text-white shadow-sm hover:bg-amber-800 transition-colors dark:bg-amber-600 dark:hover:bg-amber-500"
              >
                Xóa bộ lọc
              </button>
            )}
          </motion.div>
        )}

        {/* Danh sách kết quả */}
        {!loading && articles.length > 0 && (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {articles.map((a, i) => (
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
        )}

        {/* Intersection Observer Target cho Infinite Scroll */}
        {hasMore && (
          <div ref={observerTarget} className="flex justify-center mt-12 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-amber-900 dark:text-amber-500" />
          </div>
        )}
        
        {/* Hết bài viết */}
        {!hasMore && articles.length > 0 && (
           <div className="text-center mt-16 mb-8">
             <div className="inline-block w-12 h-1 bg-amber-900/10 dark:bg-amber-100/10 rounded-full mb-4" />
             <p className="text-[13px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
               Bạn đã xem hết bài viết
             </p>
           </div>
        )}
      </div>
    </div>
  );
}