/**
 * articleListState.js
 * 
 * Pure helper functions for Public Articles List & Detail state management.
 * 100% pure functions — easily testable without DOM / Supabase mocking.
 */

/**
 * Sanitize search input to prevent PostgREST syntax injection or wildcard abuse.
 * Removes rogue commas, parentheses, quotes, %, and underscores.
 * Limits length to 100 characters.
 *
 * @param {string} term
 * @returns {string}
 */
export function sanitizeSearchTerm(term) {
  if (typeof term !== "string") return "";
  const trimmed = term.trim().slice(0, 100);
  // Loại bỏ các ký tự đặc biệt của PostgREST filter syntax
  return trimmed.replace(/[%,_'"()]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Parse URLSearchParams into normalized state.
 * Empty category or "Tất cả" is parsed to "Tất cả".
 *
 * @param {URLSearchParams | string} searchParams
 * @returns {{ query: string, category: string }}
 */
export function parseSearchParams(searchParams) {
  const params = typeof searchParams === "string" 
    ? new URLSearchParams(searchParams) 
    : searchParams || new URLSearchParams();

  const rawQuery = params.get("q") || "";
  const rawCat = params.get("category") || "";

  const query = sanitizeSearchTerm(rawQuery);
  const category = !rawCat || rawCat.trim() === "Tất cả" ? "Tất cả" : rawCat.trim();

  return { query, category };
}

/**
 * Serialize state into clean URLSearchParams (does not write "Tất cả" or empty values).
 *
 * @param {{ query?: string, category?: string }} state
 * @returns {URLSearchParams}
 */
export function serializeSearchParams({ query = "", category = "Tất cả" } = {}) {
  const params = new URLSearchParams();
  const cleanQ = sanitizeSearchTerm(query);
  if (cleanQ) {
    params.set("q", cleanQ);
  }
  if (category && category.trim() !== "Tất cả") {
    params.set("category", category.trim());
  }
  return params;
}

/**
 * Merge and deduplicate articles, keeping stable sort order by published_at DESC, then id DESC.
 *
 * @param {Array<{ id: string, published_at?: string }>} existing
 * @param {Array<{ id: string, published_at?: string }>} incoming
 * @returns {Array<{ id: string, published_at?: string }>}
 */
export function mergeArticles(existing = [], incoming = []) {
  const map = new Map();

  // Add existing
  (existing || []).forEach((item) => {
    if (item && item.id) {
      map.set(item.id, item);
    }
  });

  // Add incoming (overwriting if updated)
  (incoming || []).forEach((item) => {
    if (item && item.id) {
      map.set(item.id, item);
    }
  });

  const merged = Array.from(map.values());

  // Sắp xếp ổn định theo published_at DESC, sau đó id DESC
  return merged.sort((a, b) => {
    const timeA = a.published_at ? new Date(a.published_at).getTime() : 0;
    const timeB = b.published_at ? new Date(b.published_at).getTime() : 0;
    if (timeB !== timeA) {
      return timeB - timeA;
    }
    return (b.id || "").localeCompare(a.id || "");
  });
}

/**
 * Extracts featured lead article and remaining articles for editorial layout.
 * Featured lead card only appears when user is NOT searching and category is "Tất cả".
 *
 * @param {Array} articles
 * @param {boolean} isFiltered (true if search query or specific category is active)
 * @returns {{ featured: object | null, remaining: Array }}
 */
export function getFeaturedAndRemaining(articles = [], isFiltered = false) {
  if (!articles || articles.length === 0) {
    return { featured: null, remaining: [] };
  }

  if (isFiltered) {
    return { featured: null, remaining: articles };
  }

  return {
    featured: articles[0],
    remaining: articles.slice(1),
  };
}

/**
 * Format published date in Vietnamese locale.
 * Fallback to "Chưa rõ ngày đăng" if invalid.
 *
 * @param {string | null | undefined} dateStr
 * @returns {string}
 */
export function formatPublishedDate(dateStr) {
  if (!dateStr) return "Chưa rõ ngày đăng";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Chưa rõ ngày đăng";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Get next cursor for keyset pagination from the end of the current articles list.
 *
 * @param {Array<{ id: string, published_at?: string }>} articles
 * @returns {{ published_at: string, id: string } | null}
 */
export function getNextCursor(articles = []) {
  if (!articles || articles.length === 0) return null;
  const last = articles[articles.length - 1];
  if (!last || !last.id) return null;
  return {
    published_at: last.published_at || "",
    id: last.id,
  };
}
