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
    <div className="min-h-screen bg-[#faf8f5] px-6 py-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Bài viết của tôi</h1>
          <p className="text-sm text-stone-500 mt-1">Quản lý bản nháp, theo dõi trạng thái duyệt</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/bài-viết-của-tôi/soạn")}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-amber-800 text-white text-sm font-semibold md:hover:bg-amber-900 transition-colors"
        >
          <Plus className="w-4 h-4" /> Viết bài mới
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-stone-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Đang tải…
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-20 text-stone-300">
          <FileText className="w-8 h-8" />
          <p className="text-sm text-stone-400">Bạn chưa có bài viết nào</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {articles.map((a) => (
            <div key={a.id} className="bg-white border border-stone-200/80 rounded-xl p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <ArticleStatusBadge status={a.status} />
                    <span className="text-[11px] text-stone-400">Cập nhật {formatDateVi(a.updated_at)}</span>
                  </div>
                  <p className="text-[15px] font-bold text-stone-900 truncate">{a.title}</p>
                  {a.status === "rejected" && a.rejection_reason && (
                    <p className="text-[12px] text-red-600 mt-1">Lý do từ chối: {a.rejection_reason}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {a.status === "published" && (
                    <Link to={`/bài-viết/${a.slug}`} className="text-[12px] font-semibold text-amber-700 hover:underline px-2">
                      Xem bài
                    </Link>
                  )}
                  {(a.status === "draft" || a.status === "rejected") && (
                    <>
                      <button type="button" onClick={() => navigate(`/bài-viết-của-tôi/soạn/${a.id}`)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-500 md:hover:bg-stone-100" title="Sửa">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => handleSubmit(a.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-amber-700 md:hover:bg-amber-50" title="Gửi duyệt">
                        <Send className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {a.status === "draft" && (
                    <button type="button" onClick={() => handleDelete(a.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 md:hover:bg-red-50" title="Xoá">
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
  );
}