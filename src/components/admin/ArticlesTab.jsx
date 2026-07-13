import React, { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../ui/ToastContext.jsx";
import { useAdminContext } from "./AdminContext.jsx";
import { Loader2, Check, X, Inbox, Clock, ChevronLeft } from "lucide-react";
import { SidebarDetailSkeleton } from "../ui/Skeleton.jsx";

function formatDateVi(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function ArticlesTab() {
  const { showToast } = useToast();
  const { refreshPendingBaiViet } = useAdminContext();
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
    refreshPendingBaiViet();
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
    refreshPendingBaiViet();
  };

  if (loading) return <SidebarDetailSkeleton items={4} />;

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100/50 dark:bg-amber-900/20">
          <Inbox className="h-7 w-7 text-amber-600/70 dark:text-amber-500/70" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[16px] font-bold text-amber-950 dark:text-amber-50 font-serif">Không có bài viết chờ duyệt</p>
          <p className="text-[13px] text-stone-500 dark:text-stone-400 mt-0.5">Danh sách sẽ tự cập nhật khi có bài mới</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 w-full min-w-0">
      {/* ------- Danh sách bài chờ duyệt -------
          Chỉ giới hạn chiều cao + tự cuộn ở desktop (lg), nơi cột này đứng
          cạnh cột chi tiết cao hơn. Trên mobile để cuộn tự nhiên theo trang,
          tránh 1 vùng cuộn con lồng trong trang đang cuộn (khó thao tác tay). */}
      <div className={`${mobileView === "detail" ? "hidden lg:flex" : "flex"} flex-col gap-1.5`}>
        <div className="flex items-center justify-between px-1 pb-1">
          <h3 className="text-[12px] font-bold text-amber-800/70 dark:text-amber-400/70 uppercase tracking-widest">
            CHỜ DUYỆT
          </h3>
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-amber-900 dark:bg-amber-100 text-amber-50 dark:text-amber-950 text-[11px] font-bold tabular-nums">
            {articles.length}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 lg:max-h-[70vh] lg:overflow-y-auto" data-lenis-prevent>
          {articles.map((a) => {
            const isActive = selected?.id === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => openArticle(a)}
                className={`text-left rounded-2xl pl-3.5 pr-4 py-3 border-l-[2px] border transition-all duration-200 ease-out active:scale-[0.985] ${
                  isActive
                    ? "bg-amber-50 dark:bg-amber-900/20 border-l-amber-600 dark:border-l-amber-400 border-y-amber-900/10 border-r-amber-900/10 dark:border-y-amber-100/10 dark:border-r-amber-100/10 shadow-sm"
                    : "bg-white/60 dark:bg-stone-900/40 border-l-transparent border-black/[0.06] dark:border-white/[0.08] md:hover:bg-amber-50/50 dark:md:hover:bg-amber-900/10 md:hover:border-black/10 dark:md:hover:border-white/[0.12]"
                }`}
              >
                <p className={`text-[14px] font-bold truncate leading-snug ${isActive ? "text-amber-950 dark:text-amber-50" : "text-stone-800 dark:text-stone-200"}`}>
                  {a.title}
                </p>
                <div className={`flex items-center gap-1.5 mt-1.5 text-[11.5px] font-medium ${isActive ? "text-amber-800/70 dark:text-amber-400/70" : "text-stone-500 dark:text-stone-400"}`}>
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

      {/* ------- Chi tiết bài đang chọn -------
          Toàn bộ phần chi tiết chỉ còn ĐÚNG 1 khung ngoài cùng. Các khu vực
          bên trong (ảnh bìa, nội dung, nút hành động) dùng khoảng cách +
          đường kẻ phân cách thay vì mỗi khu vực 1 khung/bóng/viền riêng. */}
      {selected && (
        <div className={`${mobileView === "list" ? "hidden lg:block" : "block"} min-w-0 w-full`}>
          <div className="bg-white/90 dark:bg-[#1C1917]/90 border border-amber-900/10 dark:border-amber-100/10 rounded-[28px] p-4 sm:p-7 shadow-sm">

            {/* Mobile back control */}
            <button
              type="button"
              onClick={() => setMobileView("list")}
              className="lg:hidden inline-flex items-center gap-1 text-[13px] font-bold text-stone-500 dark:text-stone-400 mb-4 -ml-1 px-1 py-1 active:opacity-60"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
              Danh sách
            </button>

            <h2 className="text-[20px] sm:text-[22px] font-bold text-amber-950 dark:text-amber-50 font-serif leading-tight tracking-[-0.01em] break-words">
              {selected.title}
            </h2>
            <p className="text-[13px] text-stone-500 dark:text-stone-400 font-medium mt-1.5 mb-5 flex flex-wrap items-center gap-2">
              <span className="font-bold text-stone-700 dark:text-stone-300 truncate max-w-[160px]">{selected.author_username}</span>
              <span className="opacity-50">·</span>
              <span className="shrink-0">gửi lúc {formatDateVi(selected.submitted_at)}</span>
              {selected.category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100/50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider">
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

            {/* Nội dung markdown: chỉ tự cuộn ở desktop (lg); trên mobile
                để dài bao nhiêu hiện bấy nhiêu, cuộn chung theo trang. */}
            <div
              data-lenis-prevent
              className="prose prose-stone dark:prose-invert prose-sm max-w-none bg-stone-50/80 dark:bg-stone-900/50 rounded-2xl px-4 sm:px-6 py-5 overflow-x-hidden break-words [word-break:break-word] lg:max-h-[380px] lg:overflow-y-auto [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_code]:whitespace-pre-wrap [&_code]:break-all"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{selected.content}</ReactMarkdown>
            </div>

            {/* Hành động: nằm trong luồng nội dung bình thường, KHÔNG sticky
                — trang đã có tab bar riêng ở đáy, tránh chồng 2 thanh nổi. */}
            <div className="mt-6 pt-5 border-t border-amber-900/10 dark:border-amber-100/10">
              {!rejecting ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={processing}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-600 text-white text-[14px] font-bold transition-all duration-150 active:scale-[0.98] md:hover:bg-emerald-700 disabled:opacity-50 disabled:active:scale-100"
                  >
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" strokeWidth={2.5} />}
                    Duyệt & đăng
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejecting(true)}
                    disabled={processing}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[14px] font-bold transition-all duration-150 active:scale-[0.98] md:hover:bg-stone-200 dark:md:hover:bg-stone-700 disabled:opacity-50 disabled:active:scale-100"
                  >
                    <X className="w-4 h-4" strokeWidth={2.5} /> Từ chối
                  </button>
                </div>
              ) : (
                <div>
                  <label className="text-[12px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70">
                    Lý do từ chối (gửi cho tác giả)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder="VD: Cần bổ sung nguồn tham khảo, chỉnh lại văn phong…"
                    className="mt-2 w-full rounded-xl border border-amber-900/20 dark:border-amber-100/20 px-4 py-3 text-[14px] font-medium bg-white/80 dark:bg-stone-900/60 text-amber-950 dark:text-amber-50 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none transition-shadow"
                  />
                  <div className="flex gap-2.5 mt-4">
                    <button
                      type="button"
                      onClick={() => setRejecting(false)}
                      className="px-5 py-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-[14px] font-bold text-stone-600 dark:text-stone-300 transition-all active:scale-[0.97] md:hover:bg-stone-200 dark:md:hover:bg-stone-700"
                    >
                      Huỷ
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={processing}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white text-[14px] font-bold transition-all active:scale-[0.98] md:hover:bg-red-700 disabled:opacity-50 disabled:active:scale-100"
                    >
                      {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Xác nhận từ chối"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}