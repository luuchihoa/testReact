import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabase.js";
import ArticleCard from "./ArticleCard.jsx";
import { Loader2, Newspaper, Search, X, SlidersHorizontal } from "lucide-react";

const PAGE_SIZE = 12;

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

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

  // Lấy danh sách chuyên mục duy nhất từ các bài viết đã tải về
  const categories = useMemo(() => {
    const list = new Set(articles.map((a) => a.category).filter(Boolean));
    return ["Tất cả", ...Array.from(list)];
  }, [articles]);

  // Lọc bài viết theo ô tìm kiếm và chuyên mục được chọn
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
    <div className="min-h-screen bg-[#faf8f5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 py-10">
        
        {/* Tiêu đề chính trang bài viết */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 dark:from-amber-400 dark:to-orange-500">
            Bài viết & Chia sẻ
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">
            Góc suy niệm, sự kiện và tài liệu học tập từ Ban Giáo Lý xứ đoàn
          </p>
        </div>

        {/* Thanh tìm kiếm & bộ lọc */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white dark:bg-stone-900 p-4 border border-stone-200/60 dark:border-stone-800 rounded-2xl shadow-xs">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 dark:text-stone-550 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tiêu đề, tóm tắt hoặc tác giả..."
              className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 pl-9 pr-9 py-2.5 text-sm text-stone-850 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Bộ lọc chuyên mục */}
          {categories.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0" data-lenis-prevent>
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 hidden sm:inline" />
              <div className="flex gap-1.5 whitespace-nowrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      selectedCategory === cat
                        ? "bg-amber-800 dark:bg-amber-600 text-white shadow-xs"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-750"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Danh sách kết quả */}
        {loading && page === 0 ? (
          <div className="flex items-center justify-center gap-2.5 py-24 text-stone-400 dark:text-stone-500">
            <Loader2 className="w-5 h-5 animate-spin text-amber-700 dark:text-amber-500" />
            <span className="text-sm font-medium">Đang tải các bài viết…</span>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-3xl p-8">
            <Newspaper className="w-10 h-10 text-stone-300 dark:text-stone-700" />
            <h3 className="text-base font-bold text-stone-700 dark:text-stone-350">Không có bài viết phù hợp</h3>
            <p className="text-xs text-stone-400 max-w-xs">
              {searchQuery ? "Thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc chuyên mục khác." : "Chưa có bài viết nào được đăng ở chuyên mục này."}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setSelectedCategory("Tất cả"); }}
                className="mt-2 text-xs font-semibold text-amber-800 dark:text-amber-500 hover:underline"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredArticles.map((a) => (
                <div key={a.id} className="transform transition-transform duration-200 hover:scale-[1.01]">
                  <ArticleCard article={a} linkTo={`/bài-viết/${a.slug}`} />
                </div>
              ))}
            </div>

            {hasMore && !searchQuery && selectedCategory === "Tất cả" && (
              <div className="flex justify-center mt-10">
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-sm font-semibold text-stone-600 dark:text-stone-300 md:hover:bg-stone-100 dark:md:hover:bg-stone-800 hover:border-stone-400 dark:hover:border-stone-500 transition-all disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Đang tải…" : "Xem thêm bài viết"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}