import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "../../../lib/supabase.js";
import { sortBySubmittedAt } from "./format.js";

/** @typedef {{ id: string, title: string, content: string, author_username: string, submitted_at: string, category?: string, cover_image?: string, status: string }} Article */

const PAGE_SIZE = 20;
const MIN_REJECT_REASON_LENGTH = 5;

/**
 * Picks which article should become selected after `removedId` leaves the
 * list — prefers the next item, falls back to the previous one, then null.
 * Keeps the reviewer's place in the queue instead of dumping them back to
 * an empty detail pane after every approve/reject.
 *
 * @param {Article[]} list
 * @param {string} removedId
 * @returns {string | null}
 */
function nextSelection(list, removedId) {
  const idx = list.findIndex((a) => a.id === removedId);
  if (idx === -1) return null;
  if (list[idx + 1]) return list[idx + 1].id;
  if (list[idx - 1]) return list[idx - 1].id;
  return null;
}

/**
 * Owns all state and Supabase I/O for the article review queue:
 * - paginated fetch (avoids loading thousands of pending rows at once)
 * - realtime awareness of other admins acting on the same queue
 * - optimistic approve/reject with automatic rollback on failure
 * - stale-response guarding so a slow fetch can never clobber a newer one
 */
export function useArticleQueue({ onError } = {}) {
  const [articles, setArticles] = useState(/** @type {Article[]} */ ([]));
  const [selectedId, setSelectedId] = useState(/** @type {string | null} */ (null));
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [hasMore, setHasMore] = useState(true);
  const [hasNewItems, setHasNewItems] = useState(false);
  /** @type {[{ id: string | null, type: 'approve' | 'reject' | null }, Function]} */
  const [actionState, setActionState] = useState({ id: null, type: null });

  // Guards against out-of-order network responses (e.g. a slow first fetch
  // resolving after a subsequent refetch already replaced the list).
  const requestIdRef = useRef(0);
  const articlesRef = useRef(articles);
  articlesRef.current = articles;

  const fetchPage = useCallback(async ({ append = false } = {}) => {
    const requestId = ++requestIdRef.current;
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);

    const from = append ? articlesRef.current.length : 0;
    const to = from + PAGE_SIZE - 1;

    const { data, error: fetchError } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "pending")
      .order("submitted_at", { ascending: true })
      .range(from, to);

    if (requestId !== requestIdRef.current) return; // a newer request already landed

    if (fetchError) {
      console.error("useArticleQueue: fetch error", fetchError);
      const message = fetchError.message || "Không tải được danh sách bài viết";
      setError(message);
      onError?.(message);
      if (append) setLoadingMore(false);
      else setLoading(false);
      return;
    }

    const page = data ?? [];
    setArticles((prev) => (append ? [...prev, ...page] : page));
    setHasMore(page.length === PAGE_SIZE);
    if (!append) {
      setHasNewItems(false);
      setSelectedId((prev) => (prev && page.some((a) => a.id === prev) ? prev : page[0]?.id ?? null));
    }
    if (append) setLoadingMore(false);
    else setLoading(false);
  }, [onError]);

  const refetch = useCallback(() => fetchPage({ append: false }), [fetchPage]);
  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    fetchPage({ append: true });
  }, [fetchPage, hasMore, loadingMore]);

  useEffect(() => { refetch(); }, [refetch]);

  // Realtime: keeps multiple concurrent admins from stepping on each other.
  // If someone else approves/rejects an item, drop it from our local list
  // instead of letting the reviewer act on an already-resolved article.
  useEffect(() => {
    const channel = supabase
      .channel("articles-review-queue")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "articles" },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;

          if (eventType === "INSERT" && newRow?.status === "pending") {
            setHasNewItems(true);
            return;
          }

          const wasPendingHere = oldRow?.status === "pending" && articlesRef.current.some((a) => a.id === oldRow.id);
          if (!wasPendingHere) return;

          if (eventType === "DELETE" || (eventType === "UPDATE" && newRow?.status !== "pending")) {
            setArticles((prev) => prev.filter((a) => a.id !== oldRow.id));
            setSelectedId((prev) => (prev === oldRow.id ? nextSelection(articlesRef.current, oldRow.id) : prev));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const selectArticle = useCallback((id) => setSelectedId(id), []);

  const selected = useMemo(
    () => articles.find((a) => a.id === selectedId) ?? null,
    [articles, selectedId]
  );

  const runReview = useCallback(async (id, { approve, reason }) => {
    const target = articlesRef.current.find((a) => a.id === id);
    if (!target) return { ok: false, message: "Bài viết không còn trong danh sách" };

    setActionState({ id, type: approve ? "approve" : "reject" });
    setArticles((prev) => prev.filter((a) => a.id !== id));
    setSelectedId((prev) => (prev === id ? nextSelection(articlesRef.current, id) : prev));

    const { error: rpcError } = await supabase.rpc("review_article", {
      p_id: id,
      p_approve: approve,
      p_reason: approve ? null : reason,
    });

    setActionState({ id: null, type: null });

    if (rpcError) {
      // Roll back the optimistic removal so the reviewer doesn't lose the item.
      setArticles((prev) => sortBySubmittedAt([...prev, target]));
      setSelectedId(id);
      const message = rpcError.message || (approve ? "Không duyệt được bài viết" : "Không từ chối được bài viết");
      return { ok: false, message };
    }

    return { ok: true };
  }, []);

  const approve = useCallback((id) => runReview(id, { approve: true }), [runReview]);

  const reject = useCallback((id, reason) => {
    if (reason.trim().length < MIN_REJECT_REASON_LENGTH) {
      return Promise.resolve({ ok: false, message: "Vui lòng nhập lý do từ chối rõ ràng hơn" });
    }
    return runReview(id, { approve: false, reason: reason.trim() });
  }, [runReview]);

  return {
    articles,
    selected,
    selectedId,
    selectArticle,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    error,
    refetch,
    hasNewItems,
    approve,
    reject,
    actionState,
  };
}