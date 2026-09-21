import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";
import ArticleCard from "./ArticleCard.jsx";
import {
  Loader2,
  Newspaper,
  Search,
  X,
  SlidersHorizontal,
  AlertTriangle,
  RefreshCw,
  Layers,
} from "lucide-react";
import {
  sanitizeSearchTerm,
  parseSearchParams,
  serializeSearchParams,
  mergeArticles,
  getFeaturedAndRemaining,
} from "./articleListState.js";

const PAGE_SIZE = 12;
const CACHE_KEY = "articles_list_cache";

function ArticleListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6" aria-busy="true" aria-label="Đang tải danh sách bài viết">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div key={n} className="bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-2xl overflow-hidden shadow-2xs h-72 sm:h-80 flex flex-row sm:flex-col animate-pulse p-3.5 sm:p-0">
          <div className="w-[88px] h-[88px] min-[390px]:w-[104px] min-[390px]:h-[96px] sm:w-full sm:h-44 bg-[#dedfd4]/60 dark:bg-[#354237]/60 rounded-xl sm:rounded-none shrink-0" />
          <div className="p-0 sm:p-5 flex-1 flex flex-col justify-between pl-3.5 sm:pl-5 space-y-2.5">
            <div className="w-20 h-4 bg-[#dedfd4]/60 dark:bg-[#354237]/70 rounded" />
            <div className="w-4/5 h-5 bg-[#dedfd4]/60 dark:bg-[#354237]/70 rounded" />
            <div className="w-full h-3 bg-[#dedfd4]/40 dark:bg-[#354237]/50 rounded hidden sm:block" />
            <div className="w-1/2 h-3 bg-[#dedfd4]/40 dark:bg-[#354237]/50 rounded mt-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ArticleList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { query: urlQuery, category: urlCategory } = useMemo(
    () => parseSearchParams(searchParams),
    [searchParams]
  );

  const [searchInput, setSearchInput] = useState(urlQuery);
  const [categories, setCategories] = useState(["Tất cả"]);

  // Máy trạng thái dữ liệu (State Machine)
  const [status, setStatus] = useState("loading"); // "idle" | "loading" | "success" | "empty" | "error"
  const [loadMoreStatus, setLoadMoreStatus] = useState("idle"); // "idle" | "loading" | "error"
  const [articles, setArticles] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const generationRef = useRef(0);
  const isFetchingMoreRef = useRef(false);
  const observerTargetRef = useRef(null);

  // 1. Quản lý Browser Metadata
  useEffect(() => {
    const originalTitle = document.title;
    document.title = "Bài viết & Chia sẻ | Ban Giáo lý An Ngãi";

    let metaDesc = document.querySelector('meta[name="description"]');
    let originalDesc = metaDesc ? metaDesc.getAttribute("content") : null;
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", "Góc suy niệm, thông tin sự kiện và tài liệu học hỏi đức tin từ Ban Giáo lý Xứ đoàn An Ngãi.");

    return () => {
      document.title = originalTitle;
      if (originalDesc !== null && metaDesc) {
        metaDesc.setAttribute("content", originalDesc);
      }
    };
  }, []);

  // 2. Tải danh mục bài viết độc lập một lần trên mount
  useEffect(() => {
    let isCancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("articles")
          .select("category")
          .eq("status", "published")
          .not("category", "is", null);

        if (!error && data && !isCancelled) {
          const rawCats = data.map((d) => d.category?.trim()).filter(Boolean);
          const uniqueSorted = [...new Set(rawCats)].sort((a, b) => a.localeCompare(b, "vi"));
          setCategories(["Tất cả", ...uniqueSorted]);
        }
      } catch (err) {
        console.error("Lỗi lấy danh mục:", err);
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, []);

  // 3. Đồng bộ searchInput khi urlQuery thay đổi
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  if (prevUrlQuery !== urlQuery) {
    setPrevUrlQuery(urlQuery);
    setSearchInput(urlQuery);
  }

  // 4. Debounce cập nhật URL từ searchInput
  useEffect(() => {
    const timer = setTimeout(() => {
      const cleanInput = sanitizeSearchTerm(searchInput);
      if (cleanInput !== urlQuery) {
        setSearchParams(
          serializeSearchParams({ query: cleanInput, category: urlCategory }),
          { replace: true }
        );
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, urlQuery, urlCategory, setSearchParams]);

  // 5. Hàm tải dữ liệu danh sách cốt lõi với Snapshot & Race Condition Guard
  const fetchArticles = useCallback(
    async ({ isAppend = false } = {}) => {
      if (isAppend) {
        if (isFetchingMoreRef.current) return;
        isFetchingMoreRef.current = true;
        setLoadMoreStatus("loading");
      } else {
        setStatus("loading");
        setErrorMessage(null);
      }

      const currentGen = isAppend ? generationRef.current : ++generationRef.current;
      const cleanQuery = sanitizeSearchTerm(urlQuery);
      const activeCategory = urlCategory;

      try {
        let matchedUsernames = [];

        // Bước 1: Tìm kiếm tác giả trên bảng users nếu có query
        if (cleanQuery) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("username")
            .or(`ho_va_ten.ilike.%${cleanQuery}%,ten_thanh.ilike.%${cleanQuery}%,username.ilike.%${cleanQuery}%`)
            .limit(50);

          if (!userError && userData) {
            matchedUsernames = userData.map((u) => u.username).filter(Boolean);
          }
        }

        // Bước 2: Xây dựng truy vấn articles
        let req = supabase
          .from("articles")
          .select(
            "id, slug, title, summary, cover_image, category, author_username, published_at, updated_at, author:users!articles_author_username_fkey(username, ten_thanh, ho_va_ten)",
            { count: "exact" }
          )
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .order("id", { ascending: false });

        if (cleanQuery) {
          if (matchedUsernames.length > 0) {
            req = req.or(
              `title.ilike.%${cleanQuery}%,summary.ilike.%${cleanQuery}%,author_username.in.(${matchedUsernames.join(",")})`
            );
          } else {
            req = req.or(`title.ilike.%${cleanQuery}%,summary.ilike.%${cleanQuery}%`);
          }
        }

        if (activeCategory && activeCategory !== "Tất cả") {
          req = req.eq("category", activeCategory);
        }

        // Phân trang Keyset
        const from = isAppend ? articles.length : 0;
        const to = from + PAGE_SIZE - 1;
        req = req.range(from, to);

        const { data, count, error } = await req;

        // Bỏ qua nếu generation đã đổi (user vừa chuyển search/filter)
        if (currentGen !== generationRef.current) return;

        if (error) {
          console.error("ArticleList fetch error:", error);
          if (isAppend) {
            setLoadMoreStatus("error");
          } else {
            setStatus("error");
            setErrorMessage(error.message || "Không thể tải danh sách bài viết từ máy chủ");
          }
          return;
        }

        const incomingRows = data || [];
        const total = typeof count === "number" ? count : incomingRows.length;
        setTotalCount(total);

        if (isAppend) {
          setArticles((prev) => {
            const nextList = mergeArticles(prev, incomingRows);
            setHasMore(nextList.length < total);
            return nextList;
          });
          setLoadMoreStatus("idle");
        } else {
          const nextList = mergeArticles([], incomingRows);
          setArticles(nextList);
          setHasMore(nextList.length < total);
          setStatus(nextList.length === 0 ? "empty" : "success");
        }
      } catch (err) {
        if (currentGen !== generationRef.current) return;
        console.error("ArticleList unexpected error:", err);
        if (isAppend) {
          setLoadMoreStatus("error");
        } else {
          setStatus("error");
          setErrorMessage("Đã xảy ra lỗi kết nối khi tải bài viết");
        }
      } finally {
        if (currentGen === generationRef.current) {
          if (isAppend) isFetchingMoreRef.current = false;
        }
      }
    },
    [urlQuery, urlCategory, articles.length]
  );

  // 6. Kích hoạt fetch khi query / category đổi hoặc khôi phục từ cache
  useEffect(() => {
    let isSubscribed = true;
    const currentQueryKey = `${urlQuery}__${urlCategory}`;

    async function loadData() {
      // Kiểm tra cache sessionStorage khi vừa quay lại
      try {
        const cachedStr = sessionStorage.getItem(CACHE_KEY);
        if (cachedStr) {
          const cached = JSON.parse(cachedStr);
          if (
            cached &&
            cached.queryKey === currentQueryKey &&
            Array.isArray(cached.articles) &&
            cached.articles.length > 0
          ) {
            if (isSubscribed) {
              setArticles(cached.articles);
              setTotalCount(cached.totalCount || cached.articles.length);
              setHasMore(Boolean(cached.hasMore));
              setStatus("success");
            }

            // Khôi phục vị trí cuộn và focus
            requestAnimationFrame(() => {
              if (typeof cached.scrollY === "number") {
                window.scrollTo({ top: cached.scrollY, behavior: "instant" });
              }
              if (cached.focusedArticleId) {
                const el = document.querySelector(`[data-article-id="${cached.focusedArticleId}"]`);
                if (el && typeof el.focus === "function") {
                  el.focus({ preventScroll: true });
                }
              }
            });

            sessionStorage.removeItem(CACHE_KEY);
            return;
          }
        }
      } catch {
        // Bỏ qua lỗi cache
      }

      if (isSubscribed) {
        await fetchArticles({ isAppend: false });
      }
    }

    loadData();
    return () => {
      isSubscribed = false;
    };
  }, [urlQuery, urlCategory, fetchArticles]);

  // 7. Intersection Observer cho tính năng cuộn tải thêm
  const handleLoadMore = useCallback(() => {
    if (status !== "success" || !hasMore || loadMoreStatus === "loading") return;
    fetchArticles({ isAppend: true });
  }, [status, hasMore, loadMoreStatus, fetchArticles]);

  useEffect(() => {
    if (!hasMore || status !== "success") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "300px" }
    );

    const target = observerTargetRef.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
      observer.disconnect();
    };
  }, [hasMore, status, handleLoadMore]);

  // 8. Lưu cache trước khi mở trang chi tiết
  const handleArticleClick = useCallback(
    (articleId) => {
      try {
        const cacheData = {
          queryKey: `${urlQuery}__${urlCategory}`,
          articles,
          totalCount,
          hasMore,
          scrollY: window.scrollY,
          focusedArticleId: articleId,
        };
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      } catch {
        // Bỏ qua nếu quota storage đầy
      }
    },
    [urlQuery, urlCategory, articles, totalCount, hasMore]
  );

  // Đổi chuyên mục
  const handleCategorySelect = (cat) => {
    setSearchParams(
      serializeSearchParams({ query: urlQuery, category: cat }),
      { replace: true }
    );
  };

  // Phân cấp Featured / Remaining
  const isFiltered = Boolean(urlQuery.trim() || (urlCategory && urlCategory !== "Tất cả"));
  const { featured, remaining } = useMemo(
    () => getFeaturedAndRemaining(articles, isFiltered),
    [articles, isFiltered]
  );

  return (
    <div className="min-h-screen bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] transition-colors duration-300 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* ── HEADER GIỚI THIỆU ── */}
        <header className="text-center sm:text-left space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-[#7c5c2d] dark:text-[#d4b47d]">
            GÓC SUY NIỆM &amp; HỌC HỎI ĐỨC TIN
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#293d32] dark:text-[#ecece0] font-serif leading-tight">
            Bài viết &amp; Chia sẻ
          </h1>
          <p className="text-sm sm:text-base font-medium text-[#575e55] dark:text-[#b0b9ac] leading-relaxed max-w-2xl">
            Không gian chia sẻ các bài suy niệm phụng vụ, tài liệu giáo lý và thông tin sinh hoạt từ Ban Giáo lý Xứ đoàn An Ngãi.
          </p>
        </header>

        {/* ── BỘ ĐIỀU KHIỂN TÌM KIẾM & CHUYÊN MỤC ── */}
        <section aria-label="Bộ lọc bài viết" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Ô tìm kiếm */}
            <div className="relative flex-1">
              <Search
                className="w-5 h-5 text-[#575e55] dark:text-[#b0b9ac] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm bài viết, tóm tắt hoặc tác giả..."
                aria-label="Tìm kiếm bài viết"
                className="w-full rounded-2xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] pl-11 pr-11 py-2.5 min-h-[44px] text-base font-medium text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 focus:outline-none focus:ring-2 focus:ring-[#314e3e] dark:focus:ring-[#d6b883] focus:border-transparent transition-all shadow-2xs"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  aria-label="Xóa nội dung tìm kiếm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 min-h-[36px] min-w-[36px] flex items-center justify-center text-[#575e55] hover:text-[#293d32] dark:text-[#b0b9ac] dark:hover:text-[#ecece0] rounded-xl hover:bg-[#dedfd4]/50 dark:hover:bg-[#354237]/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Bộ lọc chuyên mục Mobile (<640px) */}
            <div className="sm:hidden">
              <label htmlFor="category-select-mobile" className="sr-only">
                Lọc theo chuyên mục
              </label>
              <div className="relative">
                <select
                  id="category-select-mobile"
                  value={urlCategory}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] px-4 py-2.5 min-h-[44px] text-base font-medium text-[#293d32] dark:text-[#ecece0] focus:outline-none focus:ring-2 focus:ring-[#314e3e] dark:focus:ring-[#d6b883] shadow-2xs"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "Tất cả" ? "Tất cả chuyên mục" : `Chuyên mục: ${cat}`}
                    </option>
                  ))}
                </select>
                <SlidersHorizontal className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Bộ lọc chuyên mục Tablet / Desktop (>=640px) */}
          {categories.length > 1 && (
            <div className="hidden sm:flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac] mr-1 inline-flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Chuyên mục:
              </span>
              {categories.map((cat) => {
                const active = urlCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d6b883] ${
                      active
                        ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-2xs"
                        : "bg-[#fffefa] dark:bg-[#1e2821] text-[#575e55] dark:text-[#b0b9ac] border border-[#dedfd4] dark:border-[#354237] hover:border-[#314e3e]/40 dark:hover:border-[#d6b883]/40 hover:text-[#293d32] dark:hover:text-[#ecece0]"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}

          {/* Dòng hiển thị kết quả */}
          {status === "success" && (
            <div className="text-xs font-medium text-[#575e55] dark:text-[#b0b9ac] pt-1">
              {isFiltered ? (
                <span>
                  Tìm thấy <strong className="text-[#293d32] dark:text-[#ecece0]">{totalCount}</strong> bài viết
                  {urlQuery && <span> cho từ khóa &ldquo;<strong className="text-[#293d32] dark:text-[#ecece0]">{urlQuery}</strong>&rdquo;</span>}
                  {urlCategory !== "Tất cả" && <span> trong chuyên mục &ldquo;<strong className="text-[#293d32] dark:text-[#ecece0]">{urlCategory}</strong>&rdquo;</span>}
                </span>
              ) : (
                <span>
                  Tổng số <strong className="text-[#293d32] dark:text-[#ecece0]">{totalCount}</strong> bài viết đã xuất bản
                </span>
              )}
            </div>
          )}
        </section>

        {/* ── TRẠNG THÁI LOADING BAN ĐẦU ── */}
        {status === "loading" && <ArticleListSkeleton />}

        {/* ── TRẠNG THÁI LỖI BAN ĐẦU ── */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center bg-[#fffefa] dark:bg-[#1e2821] rounded-3xl border border-[#dedfd4] dark:border-[#354237] shadow-xs">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-7 w-7" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#293d32] dark:text-[#ecece0]">
                Chưa thể tải danh sách bài viết
              </h2>
              <p className="text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac] mt-1 max-w-md">
                {errorMessage || "Đã xảy ra lỗi kết nối. Vui lòng kiểm tra lại mạng và thử lại."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => fetchArticles({ isAppend: false })}
              className="inline-flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] text-xs sm:text-sm font-bold active:scale-[0.98] transition-all shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Thử lại</span>
            </button>
          </div>
        )}

        {/* ── TRẠNG THÁI EMPTY (KHÔNG CÓ DỮ LIỆU) ── */}
        {status === "empty" && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-3xl p-8 shadow-2xs">
            <div className="w-16 h-16 rounded-2xl bg-[#dedfd4]/40 dark:bg-[#354237]/50 flex items-center justify-center mb-1 text-[#575e55] dark:text-[#b0b9ac]">
              <Newspaper className="w-8 h-8" aria-hidden="true" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#293d32] dark:text-[#ecece0] font-serif">
              Không tìm thấy bài viết phù hợp
            </h2>
            <p className="text-xs sm:text-sm font-medium text-[#575e55] dark:text-[#b0b9ac] max-w-sm">
              {isFiltered
                ? "Thử thay đổi từ khóa tìm kiếm hoặc chọn chuyên mục khác để xem thêm."
                : "Chưa có bài viết nào được xuất bản trong hệ thống."}
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSearchParams(new URLSearchParams(), { replace: true });
                }}
                className="mt-3 min-h-[44px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-2xs transition-transform active:scale-[0.98]"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}

        {/* ── TRẠNG THÁI SUCCESS (HIỂN THỊ DANH SÁCH BÀI VIẾT) ── */}
        {status === "success" && (
          <div className="space-y-8">
            {/* 1. Card "Bài mới nhất" Featured nếu không lọc */}
            {featured && (
              <section aria-label="Bài viết mới nhất">
                <div onClick={() => handleArticleClick(featured.id)}>
                  <ArticleCard
                    article={featured}
                    variant="featured"
                    linkTo={`/bài-viết/${featured.slug}`}
                  />
                </div>
              </section>
            )}

            {/* 2. Khối các bài viết còn lại */}
            {remaining.length > 0 && (
              <section aria-label="Danh sách bài viết" className="space-y-4">
                {featured && (
                  <h2 className="text-lg sm:text-xl font-bold font-serif text-[#293d32] dark:text-[#ecece0] tracking-tight">
                    Các bài viết khác
                  </h2>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {remaining.map((item, idx) => (
                    <div key={item.id} onClick={() => handleArticleClick(item.id)}>
                      <ArticleCard
                        article={item}
                        variant="standard"
                        index={idx}
                        linkTo={`/bài-viết/${item.slug}`}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 3. Nút Tải thêm bài viết & Sentinel */}
            {hasMore && (
              <div className="flex flex-col items-center justify-center pt-4 pb-8 gap-3">
                <div ref={observerTargetRef} className="h-2 w-full pointer-events-none" aria-hidden="true" />

                {loadMoreStatus === "error" ? (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row items-center gap-3 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                    <span>Không thể tải tiếp danh sách do sự cố mạng.</span>
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      className="px-4 py-2 min-h-[40px] rounded-xl bg-amber-700 text-white font-bold text-xs hover:bg-amber-800 active:scale-95 transition-all shadow-2xs"
                    >
                      Bấm để thử lại
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadMoreStatus === "loading"}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 min-h-[44px] rounded-2xl text-xs sm:text-sm font-bold text-[#314e3e] dark:text-[#d6b883] bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] hover:border-[#314e3e]/40 dark:hover:border-[#d6b883]/40 active:scale-[0.98] transition-all disabled:opacity-60 shadow-2xs"
                  >
                    {loadMoreStatus === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{loadMoreStatus === "loading" ? "Đang tải thêm..." : "Tải thêm bài viết"}</span>
                  </button>
                )}
              </div>
            )}

            {/* Thông báo đã hiển thị hết */}
            {!hasMore && articles.length > 0 && (
              <footer className="text-center pt-8 pb-4">
                <div className="inline-block w-12 h-1 bg-[#dedfd4] dark:bg-[#354237] rounded-full mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-[#575e55] dark:text-[#b0b9ac]">
                  Đã hiển thị tất cả {totalCount} bài viết
                </p>
              </footer>
            )}
          </div>
        )}
      </div>
    </div>
  );
}