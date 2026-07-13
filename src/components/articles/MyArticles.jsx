import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../ui/ToastContext.jsx";
import ArticleStatusBadge from "./ArticleStatusBadge.jsx";
import { Plus, Loader2, FileText, Pencil, Trash2, Send, AlertCircle } from "lucide-react";

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
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917] text-stone-800 dark:text-stone-200 transition-colors duration-500 fade-in-up">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-8 sm:py-12">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-800/70 dark:text-amber-400/70 mb-2 ml-1">
              Quản lý
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-amber-950 dark:text-amber-50 font-serif leading-tight">
              Bài viết của tôi
            </h1>
            <p className="text-[14px] font-medium text-stone-500 dark:text-stone-400 mt-2">
              Soạn thảo bản nháp và theo dõi trạng thái duyệt bài.
            </p>
          </div>
          <motion.button
            type="button"
            onClick={() => navigate("/bài-viết-của-tôi/soạn")}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-sm transition-shadow duration-300"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} /> Viết bài mới
          </motion.button>
        </motion.div>

        {/* Trạng thái Loading hoặc Trống */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-24 text-stone-500">
            <Loader2 className="w-6 h-6 animate-spin text-amber-900 dark:text-amber-500" />
            <span className="text-[14px] font-bold">Đang tải danh sách…</span>
          </div>
        ) : articles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center gap-4 py-24 text-center bg-white/60 dark:bg-stone-900/40 border border-amber-900/5 dark:border-amber-100/5 rounded-[28px] p-8 shadow-sm backdrop-blur-sm"
          >
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-2">
              <FileText className="w-7 h-7 text-amber-700 dark:text-amber-400" />
            </div>
            <h3 className="text-[16px] font-extrabold text-amber-950 dark:text-amber-50 font-serif">Bạn chưa có bài viết nào</h3>
            <p className="text-[14px] font-medium text-stone-500 dark:text-stone-400 max-w-sm mb-1">
              Hãy bắt đầu sáng tạo bằng cách nhấn vào nút Viết bài mới.
            </p>
          </motion.div>
        ) : (
          <motion.div layout className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {articles.map((a, i) => (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -24, scale: 0.97, transition: { duration: 0.22 } }}
                  transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -3 }}
                  className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl border border-amber-900/10 dark:border-amber-100/10 rounded-2xl p-5 sm:p-6 shadow-sm transition-shadow duration-300 md:hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Nội dung bên trái */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <ArticleStatusBadge status={a.status} />
                        <span className="text-[11.5px] font-medium text-stone-400 dark:text-stone-500 ml-1">
                          Cập nhật: {formatDateVi(a.updated_at)}
                        </span>
                      </div>
                      <p className="text-[16px] sm:text-[17px] font-extrabold text-amber-950 dark:text-amber-50 font-serif leading-snug line-clamp-2 pr-2">
                        {a.title}
                      </p>
                      
                      {/* Hộp lý do từ chối */}
                      <AnimatePresence initial={false}>
                        {a.status === "rejected" && a.rejection_reason && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30 p-3 rounded-xl flex items-start gap-2.5 backdrop-blur-sm">
                              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                              <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-red-700/80 dark:text-red-400/80 mb-0.5">Lý do từ chối</p>
                                <p className="text-[13px] font-medium text-red-950 dark:text-red-50 leading-relaxed">
                                  {a.rejection_reason}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Nhóm Nút Hành Động */}
                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto w-full sm:w-auto justify-end border-t sm:border-0 border-amber-900/10 dark:border-amber-100/10 pt-3 sm:pt-0 mt-2 sm:mt-0">
                      
                      {a.status === "published" && (
                        <Link to={`/bài-viết/${a.slug}`} className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-[12px] font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 transition-all active:scale-[0.97] md:hover:bg-amber-100 dark:md:hover:bg-amber-900/40">
                          Xem bài viết
                        </Link>
                      )}
                      
                      {(a.status === "draft" || a.status === "rejected") && (
                        <>
                          <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={() => navigate(`/bài-viết-của-tôi/soạn/${a.id}`)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 md:hover:bg-stone-200 dark:md:hover:bg-stone-700 transition-colors" title="Chỉnh sửa">
                            <Pencil className="w-4 h-4" />
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={() => handleSubmit(a.id)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-100/80 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 md:hover:bg-amber-200/80 dark:md:hover:bg-amber-900/60 transition-colors" title="Gửi duyệt bài">
                            <Send className="w-4 h-4" />
                          </motion.button>
                        </>
                      )}
                      
                      {a.status === "draft" && (
                        <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={() => handleDelete(a.id)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 md:hover:bg-red-100 dark:md:hover:bg-red-900/40 transition-colors ml-1" title="Xoá nháp">
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}