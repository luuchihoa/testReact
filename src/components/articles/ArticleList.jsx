import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase.js";
import ArticleCard from "./ArticleCard.jsx";
import { Loader2, Newspaper } from "lucide-react";

const PAGE_SIZE = 12;

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

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

  return (
    <div className="min-h-screen bg-[#faf8f5] px-6 py-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Bài viết</h1>
        <p className="text-sm text-stone-500 mt-1">Chia sẻ từ cộng đoàn Ban Giáo Lý</p>
      </div>

      {loading && page === 0 ? (
        <div className="flex items-center justify-center gap-2 py-20 text-stone-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Đang tải…
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-20 text-stone-300">
          <Newspaper className="w-8 h-8" />
          <p className="text-sm text-stone-400">Chưa có bài viết nào được đăng</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} linkTo={`/bài-viết/${a.slug}`} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                className="px-6 py-2.5 rounded-full border border-stone-300 text-sm font-semibold text-stone-600 md:hover:bg-stone-100 transition-colors disabled:opacity-50"
              >
                {loading ? "Đang tải…" : "Xem thêm"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}