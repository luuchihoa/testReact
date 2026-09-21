import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../../lib/supabase.js";
import { validateModerationReason, MIN_MODERATION_REASON_LENGTH } from "./format.js";

/**
 * @typedef {{
 *   id: string,
 *   title: string,
 *   slug: string,
 *   summary?: string,
 *   content?: string,
 *   author_username: string,
 *   submitted_at?: string,
 *   published_at?: string,
 *   reviewed_at?: string,
 *   reviewed_by?: string,
 *   unpublished_at?: string,
 *   unpublished_by?: string,
 *   unpublish_reason?: string,
 *   rejection_reason?: string,
 *   category?: string,
 *   cover_image?: string,
 *   status: 'pending' | 'published' | 'rejected' | 'unpublished',
 *   created_at?: string,
 *   updated_at?: string,
 *   author?: {
 *     username: string,
 *     ho_va_ten?: string,
 *     ten_thanh?: string
 *   }
 * }} Article
 */

const PAGE_SIZE = 20;

/**
 * Tìm ID bài viết kế tiếp khi bài viết hiện tại bị xóa hoặc chuyển trạng thái
 * @param {Article[]} list
 * @param {string} removedId
 * @returns {string | null}
 */
export function getNextArticleId(list, removedId) {
  const idx = list.findIndex((a) => a.id === removedId);
  if (idx === -1) return null;
  if (list[idx + 1]) return list[idx + 1].id;
  if (list[idx - 1]) return list[idx - 1].id;
  return null;
}

/**
 * Hook quản lý trung tâm điều phối bài viết Admin
 *
 * @param {{
 *   statusFilter?: 'pending' | 'published' | 'rejected' | 'unpublished',
 *   searchQuery?: string,
 *   sortOrder?: 'asc' | 'desc',
 *   selectedId?: string | null,
 *   onError?: (msg: string) => void
 * }} params
 */
export function useArticleQueue({
  statusFilter = "pending",
  searchQuery = "",
  sortOrder = "asc",
  selectedId = null,
  onError,
} = {}) {
  const [articles, setArticles] = useState(/** @type {Article[]} */ ([]));
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    published: 0,
    rejected: 0,
    unpublished: 0,
  });

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [hasMore, setHasMore] = useState(false);

  // Trạng thái chi tiết bài viết đang chọn
  const [selectedDetail, setSelectedDetail] = useState(/** @type {Article | null} */ (null));
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorDetail, setErrorDetail] = useState(/** @type {string | null} */ (null));
  const [isDetailNotFound, setIsDetailNotFound] = useState(false);
  const [isConflict, setIsConflict] = useState(false);

  // Trạng thái mutation đang thực hiện
  const [actionState, setActionState] = useState(
    /** @type {{ id: string | null, type: 'approve' | 'reject' | 'unpublish' | 'delete' | null }} */ ({
      id: null,
      type: null,
    })
  );

  const requestIdRef = useRef(0);
  const articlesRef = useRef(articles);
  const selectedIdRef = useRef(selectedId);
  const statusFilterRef = useRef(statusFilter);

  useEffect(() => {
    articlesRef.current = articles;
  }, [articles]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    statusFilterRef.current = statusFilter;
  }, [statusFilter]);

  // 1. Tải tổng số lượng của từng trạng thái (Status Counts)
  const fetchStatusCounts = useCallback(async () => {
    try {
      const { data, error: countError } = await supabase.rpc("get_admin_article_status_counts");
      if (!countError && data && typeof data === "object") {
        setStatusCounts({
          pending: Number(data.pending) || 0,
          published: Number(data.published) || 0,
          rejected: Number(data.rejected) || 0,
          unpublished: Number(data.unpublished) || 0,
        });
        return;
      }

      // Fallback nếu RPC chưa được tạo trong PostgreSQL
      const { data: rows, error: selectError } = await supabase
        .from("articles")
        .select("status")
        .in("status", ["pending", "published", "rejected", "unpublished"]);

      if (!selectError && rows) {
        const counts = { pending: 0, published: 0, rejected: 0, unpublished: 0 };
        for (const row of rows) {
          if (counts[row.status] !== undefined) {
            counts[row.status] += 1;
          }
        }
        setStatusCounts(counts);
      }
    } catch (err) {
      console.warn("fetchStatusCounts warning:", err);
    }
  }, []);

  // 2. Tải danh sách bài viết theo statusFilter
  const fetchQueue = useCallback(
    async ({ append = false, query = searchQuery, sort = sortOrder, status = statusFilter } = {}) => {
      const requestId = ++requestIdRef.current;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      const from = append ? articlesRef.current.length : 0;
      const to = from + PAGE_SIZE - 1;

      try {
        let matchedUsernames = [];
        const trimmedQuery = (query || "").trim();

        // Tìm kiếm tác giả 2 bước nếu có query
        if (trimmedQuery) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("username")
            .or(
              `ho_va_ten.ilike.%${trimmedQuery}%,ten_thanh.ilike.%${trimmedQuery}%,username.ilike.%${trimmedQuery}%`
            )
            .limit(50);

          if (!userError && userData) {
            matchedUsernames = userData.map((u) => u.username).filter(Boolean);
          }
        }

        // Chọn trường sắp xếp theo từng trạng thái
        let sortColumn = "submitted_at";
        let isAscending = sort === "asc";

        if (status === "published") {
          sortColumn = "published_at";
          isAscending = sort === "asc";
        } else if (status === "rejected" || status === "unpublished") {
          sortColumn = "updated_at";
          isAscending = sort === "asc";
        }

        let req = supabase
          .from("articles")
          .select(
            "id, title, slug, summary, author_username, submitted_at, published_at, reviewed_at, reviewed_by, unpublished_at, unpublished_by, unpublish_reason, rejection_reason, category, cover_image, status, updated_at, created_at, author:users!articles_author_username_fkey(username, ho_va_ten, ten_thanh)",
            { count: "exact" }
          )
          .eq("status", status)
          .order(sortColumn, { ascending: isAscending })
          .range(from, to);

        if (trimmedQuery) {
          if (matchedUsernames.length > 0) {
            req = req.or(`title.ilike.%${trimmedQuery}%,author_username.in.(${matchedUsernames.join(",")})`);
          } else {
            req = req.ilike("title", `%${trimmedQuery}%`);
          }
        }

        const { data, count, error: fetchError } = await req;

        if (requestId !== requestIdRef.current) return;

        if (fetchError) {
          console.error("useArticleQueue: fetch queue error:", fetchError);
          const msg = fetchError.message || "Không tải được danh sách bài viết";
          setError(msg);
          onError?.(msg);
          if (append) setLoadingMore(false);
          else setLoading(false);
          return;
        }

        const rows = data || [];
        const newTotal = typeof count === "number" ? count : rows.length;
        setTotalCount(newTotal);

        setArticles((prev) => {
          const nextList = append ? [...prev, ...rows] : rows;
          setHasMore(nextList.length < newTotal);
          return nextList;
        });
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        console.error("useArticleQueue: unexpected error:", err);
        setError("Đã xảy ra lỗi không mong muốn khi tải danh sách");
      } finally {
        if (requestId === requestIdRef.current) {
          if (append) setLoadingMore(false);
          else setLoading(false);
        }
      }
    },
    [searchQuery, sortOrder, statusFilter, onError]
  );

  // Tải lại khi statusFilter, searchQuery hoặc sortOrder thay đổi
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (cancelled) return;
      await Promise.all([
        fetchStatusCounts(),
        fetchQueue({ append: false, query: searchQuery, sort: sortOrder, status: statusFilter }),
      ]);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchQueue, fetchStatusCounts, statusFilter, searchQuery, sortOrder]);

  // 3. Tải chi tiết bài viết khi selectedId thay đổi
  useEffect(() => {
    let isSubscribed = true;

    async function loadDetail() {
      if (!selectedId) {
        if (isSubscribed) {
          setSelectedDetail(null);
          setErrorDetail(null);
          setIsDetailNotFound(false);
          setIsConflict(false);
          setLoadingDetail(false);
        }
        return;
      }

      setLoadingDetail(true);
      setErrorDetail(null);
      setIsDetailNotFound(false);
      setIsConflict(false);

      try {
        const { data, error: detailError } = await supabase
          .from("articles")
          .select("*, author:users!articles_author_username_fkey(username, ho_va_ten, ten_thanh)")
          .eq("id", selectedId)
          .maybeSingle();

        if (!isSubscribed) return;

        if (detailError) {
          console.error("useArticleQueue: detail fetch error:", detailError);
          setErrorDetail("Không tải được chi tiết bài viết");
          setSelectedDetail(null);
        } else if (!data || data.status === "draft") {
          // Tuyệt đối không hiển thị bản nháp riêng tư của tác giả
          setIsDetailNotFound(true);
          setSelectedDetail(null);
        } else {
          setSelectedDetail(data);
        }
      } catch (err) {
        if (!isSubscribed) return;
        console.error("useArticleQueue: detail unexpected error:", err);
        setErrorDetail("Đã xảy ra lỗi khi tải bài viết");
      } finally {
        if (isSubscribed) setLoadingDetail(false);
      }
    }

    loadDetail();
    return () => {
      isSubscribed = false;
    };
  }, [selectedId]);

  // 4. Realtime Listener: Lắng nghe thay đổi đa Admin và cập nhật an toàn
  useEffect(() => {
    let debounceTimer = null;

    const channel = supabase
      .channel("articles-admin-moderation-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "articles" },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;
          const currentId = selectedIdRef.current;
          const currentStatus = statusFilterRef.current;

          // Xử lý xung đột nếu bài viết đang mở bị sửa/xóa bởi phiên khác
          if (eventType === "UPDATE") {
            if (newRow && newRow.id === currentId && newRow.status !== currentStatus) {
              setIsConflict(true);
            }
          }

          if (eventType === "DELETE") {
            if (oldRow && oldRow.id === currentId) {
              setIsConflict(true);
            }
          }

          // Debounce làm mới danh sách và status counts
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            fetchStatusCounts();
            fetchQueue({ append: false });
          }, 350);
        }
      )
      .subscribe();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [fetchQueue, fetchStatusCounts]);

  // 5. Các hàm Mutation thực thi kiểm duyệt

  // Duyệt & Đăng bài (Approve)
  const approve = useCallback(
    async (id) => {
      setActionState({ id, type: "approve" });
      try {
        const { error: rpcError } = await supabase.rpc("review_article", {
          p_id: id,
          p_approve: true,
          p_reason: null,
        });

        if (rpcError) {
          console.error("useArticleQueue: review_article approve error:", rpcError);
          return { ok: false, message: rpcError.message || "Không thể duyệt bài viết" };
        }

        // Cập nhật state nội bộ (idempotent remove)
        setArticles((prev) => prev.filter((a) => a.id !== id));
        setTotalCount((prev) => Math.max(0, prev - 1));
        setIsConflict(false);
        fetchStatusCounts();

        return { ok: true };
      } catch (err) {
        console.error("useArticleQueue: approve unexpected error:", err);
        return { ok: false, message: "Đã xảy ra lỗi kết nối khi duyệt bài" };
      } finally {
        setActionState({ id: null, type: null });
      }
    },
    [fetchStatusCounts]
  );

  // Từ chối bài viết trong hàng đợi Pending (Reject)
  const reject = useCallback(
    async (id, reason) => {
      const val = validateModerationReason(reason, MIN_MODERATION_REASON_LENGTH);
      if (!val.valid) {
        return { ok: false, message: val.error || "Lý do từ chối không hợp lệ" };
      }

      setActionState({ id, type: "reject" });
      try {
        const { error: rpcError } = await supabase.rpc("review_article", {
          p_id: id,
          p_approve: false,
          p_reason: val.trimmed,
        });

        if (rpcError) {
          console.error("useArticleQueue: review_article reject error:", rpcError);
          return { ok: false, message: rpcError.message || "Không thể từ chối bài viết" };
        }

        setArticles((prev) => prev.filter((a) => a.id !== id));
        setTotalCount((prev) => Math.max(0, prev - 1));
        setIsConflict(false);
        fetchStatusCounts();

        return { ok: true };
      } catch (err) {
        console.error("useArticleQueue: reject unexpected error:", err);
        return { ok: false, message: "Đã xảy ra lỗi kết nối khi từ chối bài viết" };
      } finally {
        setActionState({ id: null, type: null });
      }
    },
    [fetchStatusCounts]
  );

  // Gỡ bài viết đã xuất bản khỏi trang công khai (Unpublish)
  const unpublish = useCallback(
    async (id, reason) => {
      const val = validateModerationReason(reason, MIN_MODERATION_REASON_LENGTH);
      if (!val.valid) {
        return { ok: false, message: val.error || "Lý do gỡ bài không hợp lệ" };
      }

      setActionState({ id, type: "unpublish" });
      try {
        // Ưu tiên gọi RPC nguyên tử
        const { error: rpcError } = await supabase.rpc("admin_unpublish_article", {
          p_id: id,
          p_reason: val.trimmed,
        });

        if (rpcError) {
          console.warn("useArticleQueue: admin_unpublish_article RPC fallback:", rpcError);
          // Fallback an toàn nếu RPC chưa chạy migration
          const { error: updateError } = await supabase
            .from("articles")
            .update({
              status: "unpublished",
              unpublished_at: new Date().toISOString(),
              unpublish_reason: val.trimmed,
            })
            .eq("id", id);

          if (updateError) {
            return { ok: false, message: updateError.message || "Không thể gỡ bài viết" };
          }
        }

        setArticles((prev) => prev.filter((a) => a.id !== id));
        setTotalCount((prev) => Math.max(0, prev - 1));
        setIsConflict(false);
        fetchStatusCounts();

        return { ok: true };
      } catch (err) {
        console.error("useArticleQueue: unpublish unexpected error:", err);
        return { ok: false, message: "Đã xảy ra lỗi kết nối khi gỡ bài viết" };
      } finally {
        setActionState({ id: null, type: null });
      }
    },
    [fetchStatusCounts]
  );

  // Xóa vĩnh viễn bài viết (Delete)
  const deleteArticle = useCallback(
    async (id, reason) => {
      const val = validateModerationReason(reason, MIN_MODERATION_REASON_LENGTH);
      if (!val.valid) {
        return { ok: false, message: val.error || "Lý do xóa bài không hợp lệ" };
      }

      setActionState({ id, type: "delete" });
      try {
        const { error: rpcError } = await supabase.rpc("admin_delete_article", {
          p_id: id,
          p_reason: val.trimmed,
        });

        if (rpcError) {
          console.warn("useArticleQueue: admin_delete_article RPC fallback:", rpcError);
          const { error: delError } = await supabase.from("articles").delete().eq("id", id);
          if (delError) {
            return { ok: false, message: delError.message || "Không thể xóa bài viết" };
          }
        }

        setArticles((prev) => prev.filter((a) => a.id !== id));
        setTotalCount((prev) => Math.max(0, prev - 1));
        setIsConflict(false);
        fetchStatusCounts();

        return { ok: true };
      } catch (err) {
        console.error("useArticleQueue: deleteArticle unexpected error:", err);
        return { ok: false, message: "Đã xảy ra lỗi kết nối khi xóa bài viết" };
      } finally {
        setActionState({ id: null, type: null });
      }
    },
    [fetchStatusCounts]
  );

  const refetch = useCallback(() => {
    return Promise.all([fetchStatusCounts(), fetchQueue({ append: false })]);
  }, [fetchStatusCounts, fetchQueue]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    fetchQueue({ append: true });
  }, [fetchQueue, hasMore, loadingMore]);

  return {
    articles,
    totalCount,
    statusCounts,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    error,
    refetch,
    selectedDetail,
    loadingDetail,
    errorDetail,
    isDetailNotFound,
    isConflict,
    approve,
    reject,
    unpublish,
    deleteArticle,
    actionState,
  };
}