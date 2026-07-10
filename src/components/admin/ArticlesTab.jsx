import React, { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../ui/ToastContext.jsx";
import { Loader2, Check, X, Inbox, Clock, ChevronLeft } from "lucide-react";
import { SidebarDetailSkeleton } from "../ui/Skeleton.jsx";

function formatDateVi(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function ArticlesTab() {
  const { showToast } = useToast();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);
  // Mobile: controls whether the list or the detail view is shown
  const [mobileView, setMobileView] = useState("list");

  const fetchPending = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "pending")
      .order("submitted_at", { ascending: true });

    if (error) { console.error("ArticlesTab: fetch error:", error); setLoading(false); return; }
    setArticles(data ?? []);
    setSelected((prev) => (prev ? data?.find((a) => a.id === prev.id) ?? null : data?.[0] ?? null));
    setLoading(false);
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const openArticle = (a) => {
    setSelected(a);
    setRejecting(false);
    setReason("");
    setMobileView("detail");
  };

  const handleApprove = async () => {
    if (!selected) return;
    setProcessing(true);
    const { error } = await supabase.rpc("review_article", { p_id: selected.id, p_approve: true, p_reason: null });
    setProcessing(false);
    if (error) { showToast(error.message || "Không duyệt được bài viết", "error"); return; }
    showToast("Đã duyệt và đăng bài viết", "success");
    setMobileView("list");
    fetchPending();
  };

  const handleReject = async () => {
    if (!selected) return;
    if (reason.trim().length < 5) { showToast("Vui lòng nhập lý do từ chối rõ ràng hơn", "error"); return; }
    setProcessing(true);
    const { error } = await supabase.rpc("review_article", { p_id: selected.id, p_approve: false, p_reason: reason.trim() });
    setProcessing(false);
    if (error) { showToast(error.message || "Không từ chối được bài viết", "error"); return; }
    showToast("Đã từ chối bài viết", "success");
    setRejecting(false);
    setReason("");
    setMobileView("list");
    fetchPending();
  };

  if (loading) {
    return <SidebarDetailSkeleton items={4} />;
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
          <Inbox className="h-6 w-6 text-stone-400 dark:text-stone-500" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-[15px] font-semibold text-stone-700 dark:text-stone-200">Không có bài viết chờ duyệt</p>
          <p className="text-[13px] text-stone-400 dark:text-stone-500 mt-0.5">Danh sách sẽ tự cập nhật khi có bài mới</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
      {/* ------- Danh sách bài chờ duyệt ------- */}
      <div className={`${mobileView === "detail" ? "hidden lg:flex" : "flex"} flex-col gap-1.5`}>
        <div className="flex items-center justify-between px-1 pb-1">
          <h3 className="text-[13px] font-semibold text-stone-400 dark:text-stone-500 tracking-wide">
            CHỜ DUYỆT
          </h3>
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[11px] font-semibold tabular-nums">
            {articles.length}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {articles.map((a) => {
            const isActive = selected?.id === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => openArticle(a)}
                className={`group text-left rounded-2xl px-3.5 py-3 transition-all duration-200 ease-out active:scale-[0.985] ${
                  isActive
                    ? "bg-stone-900 dark:bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                    : "bg-white dark:bg-stone-900 md:hover:bg-stone-50 dark:md:hover:bg-stone-800/70 border border-stone-100 dark:border-stone-800"
                }`}
              >
                <p className={`text-[14px] font-semibold truncate leading-snug ${isActive ? "text-white dark:text-stone-900" : "text-stone-900 dark:text-stone-100"}`}>
                  {a.title}
                </p>
                <div className={`flex items-center gap-1.5 mt-1 text-[12px] ${isActive ? "text-stone-300 dark:text-stone-500" : "text-stone-400 dark:text-stone-500"}`}>
                  <span className="truncate">{a.author_username}</span>
                  <span className="opacity-50">·</span>
                  <span className="inline-flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" strokeWidth={2} />
                    {formatDateVi(a.submitted_at)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------- Chi tiết bài đang chọn ------- */}
      {selected && (
        <div className={`${mobileView === "list" ? "hidden lg:block" : "block"}`}>
          <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-[28px] p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">

            {/* Mobile back control */}
            <button
              type="button"
              onClick={() => setMobileView("list")}
              className="lg:hidden inline-flex items-center gap-1 text-[13px] font-medium text-stone-500 dark:text-stone-400 mb-4 -ml-1 px-1 py-1 active:opacity-60"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2.25} />
              Danh sách
            </button>

            <div className="flex items-start justify-between gap-4 mb-1.5">
              <h2 className="text-[19px] sm:text-[21px] font-bold text-stone-900 dark:text-stone-100 leading-tight tracking-[-0.01em]">
                {selected.title}
              </h2>
            </div>
            <p className="text-[13px] text-stone-400 dark:text-stone-500 mb-5">
              {selected.author_username} · gửi lúc {formatDateVi(selected.submitted_at)}
              {selected.category && (
                <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-[11px] font-medium align-middle">
                  {selected.category}
                </span>
              )}
            </p>

            {selected.cover_image && (
              <img
                src={selected.cover_image}
                alt={selected.title}
                className="w-full max-h-72 object-cover rounded-2xl mb-5"
              />
            )}

            <div
              data-lenis-prevent
              className="prose prose-stone dark:prose-invert prose-sm max-w-none bg-stone-50/60 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 rounded-2xl px-4 sm:px-5 py-4 max-h-[420px] overflow-y-auto"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{selected.content}</ReactMarkdown>
            </div>

            {!rejecting ? (
              <div className="flex flex-col sm:flex-row gap-2.5 mt-6 sticky bottom-0 pb-[env(safe-area-inset-bottom)]">
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={processing}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 sm:py-2.5 rounded-full bg-emerald-500 text-white text-[14px] font-semibold transition-all duration-150 active:scale-[0.97] md:hover:bg-emerald-600 disabled:opacity-50 disabled:active:scale-100 shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" strokeWidth={2.5} />}
                  Duyệt & đăng
                </button>
                <button
                  type="button"
                  onClick={() => setRejecting(true)}
                  disabled={processing}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 sm:py-2.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[14px] font-semibold transition-all duration-150 active:scale-[0.97] md:hover:bg-stone-200 dark:md:hover:bg-stone-700 disabled:opacity-50 disabled:active:scale-100"
                >
                  <X className="w-4 h-4" strokeWidth={2.5} /> Từ chối
                </button>
              </div>
            ) : (
              <div className="mt-6">
                <label className="text-[12px] font-semibold text-stone-500 dark:text-stone-400">Lý do từ chối (gửi cho tác giả)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="VD: Cần bổ sung nguồn tham khảo, chỉnh lại văn phong…"
                  className="mt-1.5 w-full rounded-2xl border border-stone-200 dark:border-stone-700 px-3.5 py-3 text-[14px] bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-900/10 dark:focus:ring-white/10 focus:border-stone-300 dark:focus:border-stone-600 resize-none transition-colors"
                />
                <div className="flex gap-2.5 mt-3 pb-[env(safe-area-inset-bottom)]">
                  <button
                    type="button"
                    onClick={() => setRejecting(false)}
                    className="px-4 py-3 sm:py-2.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[14px] font-semibold text-stone-600 dark:text-stone-300 transition-all active:scale-[0.97] md:hover:bg-stone-200 dark:md:hover:bg-stone-700"
                  >
                    Huỷ
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={processing}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 sm:py-2.5 rounded-full bg-red-500 text-white text-[14px] font-semibold transition-all active:scale-[0.97] md:hover:bg-red-600 disabled:opacity-50 disabled:active:scale-100 shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                  >
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Xác nhận từ chối"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}