import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../ui/ToastContext.jsx";
import ArticleStatusBadge from "./ArticleStatusBadge.jsx";
import { Plus, Loader2, FileText, Pencil, Trash2, Send } from "lucide-react";

function formatDateVi(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function MyArticles() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem("username") || "";

  const fetchMine = useCallback(async () => {
    setLoading(true);
    // RLS "author select own" đã tự giới hạn theo auth.uid(), filter theo
    // username ở đây chỉ để tránh việc query kéo về cả bài published của
    // người khác (policy "public select published" áp dụng song song).
    const { data, error } = await supabase
      .from("articles")
      .select("id, slug, title, status, rejection_reason, updated_at, published_at")
      .eq("author_username", username)
      .order("updated_at", { ascending: false });

    if (error) { console.error("MyArticles: fetch error:", error); setLoading(false); return; }
    setArticles(data ?? []);
    setLoading(false);
  }, [username]);

  useEffect(() => { fetchMine(); }, [fetchMine]);

  const handleSubmit = async (id) => {
    const { error } = await supabase.rpc("submit_article", { p_id: id });
    if (error) { showToast(error.message || "Không gửi được bài viết", "error"); return; }
    showToast("Đã gửi bài viết để chờ duyệt", "success");
    fetchMine();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xoá bài viết nháp này? Hành động không thể hoàn tác.")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) { showToast(error.message || "Không xoá được bài viết", "error"); return; }
    showToast("Đã xoá bài viết", "success");
    fetchMine();
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 px-6 py-10 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">Bài viết của tôi</h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Quản lý bản nháp, theo dõi trạng thái duyệt bài viết</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/bài-viết-của-tôi/soạn")}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-600 text-white text-sm font-bold shadow-xs active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4" /> Viết bài mới
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-stone-400 dark:text-stone-550">
            <Loader2 className="w-5 h-5 animate-spin text-amber-700 dark:text-amber-500" /> Đang tải…
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-stone-300 dark:text-stone-700 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-3xl p-8 text-center">
            <FileText className="w-10 h-10 text-stone-300 dark:text-stone-700" />
            <p className="text-sm font-bold text-stone-500 dark:text-stone-400">Bạn chưa soạn thảo bài viết nào</p>
            <button
              type="button"
              onClick={() => navigate("/bài-viết-của-tôi/soạn")}
              className="text-xs font-semibold text-amber-800 dark:text-amber-550 hover:underline"
            >
              Bắt đầu bài viết đầu tiên của bạn
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {articles.map((a) => (
              <div key={a.id} className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/80 rounded-2xl p-4 sm:p-5 shadow-xs transition-shadow hover:shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <ArticleStatusBadge status={a.status} />
                      <span className="text-[11px] text-stone-400 dark:text-stone-500">Cập nhật {formatDateVi(a.updated_at)}</span>
                    </div>
                    <p className="text-[14px] sm:text-[15px] font-bold text-stone-850 dark:text-stone-100 truncate">{a.title}</p>
                    {a.status === "rejected" && a.rejection_reason && (
                      <div className="text-[12px] text-red-600 dark:text-red-400 mt-1.5 bg-red-50/50 dark:bg-red-950/20 px-2.5 py-1.5 rounded-lg border border-red-150/40 dark:border-red-900/40">
                        <span className="font-semibold">Lý do từ chối:</span> {a.rejection_reason}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {a.status === "published" && (
                      <Link to={`/bài-viết/${a.slug}`} className="text-[12px] font-bold text-amber-850 dark:text-amber-500 hover:underline px-2.5 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all">
                        Xem bài
                      </Link>
                    )}
                    {(a.status === "draft" || a.status === "rejected") && (
                      <>
                        <button type="button" onClick={() => navigate(`/bài-viết-của-tôi/soạn/${a.id}`)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-150 dark:hover:bg-stone-800 transition-colors" title="Chỉnh sửa">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => handleSubmit(a.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-amber-700 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors" title="Gửi duyệt bài">
                          <Send className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {a.status === "draft" && (
                      <button type="button" onClick={() => handleDelete(a.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-red-650 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="Xoá nháp">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}