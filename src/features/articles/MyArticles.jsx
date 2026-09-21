import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../../components/ui/ToastContext.jsx";
import ArticleStatusBadge from "./ArticleStatusBadge.jsx";
import { Plus, FileText, Pencil, Trash2, Send, AlertCircle, EyeOff, Lock, Eye } from "lucide-react";

function formatDateVi(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Khung xương (Skeleton Loading) theo chuẩn AGENTS.md — chống giật layout (CLS)
function MyArticlesSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Đang tải danh sách bài viết">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-2xl p-5 sm:p-6 shadow-sm animate-pulse"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-20 h-6 bg-[#dedfd4]/60 dark:bg-[#354237]/70 rounded-full" />
                <div className="w-28 h-4 bg-[#dedfd4]/40 dark:bg-[#354237]/50 rounded-md" />
              </div>
              <div className="h-6 bg-[#dedfd4]/60 dark:bg-[#354237]/70 rounded-md w-4/5" />
              <div className="h-4 bg-[#dedfd4]/40 dark:bg-[#354237]/50 rounded-md w-2/5" />
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto pt-3 sm:pt-0">
              <div className="w-11 h-11 bg-[#dedfd4]/50 dark:bg-[#354237]/60 rounded-xl" />
              <div className="w-11 h-11 bg-[#dedfd4]/50 dark:bg-[#354237]/60 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MyArticles() {
  const navigate = useNavigate();
  const outletCtx = useOutletContext() || {};
  const toggleModal = outletCtx.toggleModal;
  const { showToast } = useToast();

  const [articles, setArticles] = useState([]);
  const username = localStorage.getItem("username") || "";
  const [loading, setLoading] = useState(() => Boolean(username));
  const [activeTab, setActiveTab] = useState("all");
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: null, article: null });

  const fetchMine = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("id, slug, title, status, rejection_reason, updated_at, published_at")
      .eq("author_username", username)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("MyArticles: fetch error:", error);
      showToast("Không thể tải danh sách bài viết", "error");
    } else {
      setArticles(data ?? []);
    }
    setLoading(false);
  }, [username, showToast]);

  useEffect(() => {
    if (!username) {
      return;
    }
    let isMounted = true;
    async function loadArticles() {
      const { data, error } = await supabase
        .from("articles")
        .select("id, slug, title, status, rejection_reason, updated_at, published_at")
        .eq("author_username", username)
        .order("updated_at", { ascending: false });

      if (!isMounted) return;
      if (error) {
        console.error("MyArticles: fetch error:", error);
        showToast("Không thể tải danh sách bài viết", "error");
      } else {
        setArticles(data ?? []);
      }
      setLoading(false);
    }
    loadArticles();
    return () => {
      isMounted = false;
    };
  }, [username, showToast]);

  // Bộ đếm theo từng trạng thái
  const counts = useMemo(() => {
    return {
      all: articles.length,
      published: articles.filter((a) => a.status === "published").length,
      pending: articles.filter((a) => a.status === "pending").length,
      draft: articles.filter((a) => a.status === "draft").length,
      rejected: articles.filter((a) => a.status === "rejected").length,
    };
  }, [articles]);

  // Danh sách đã lọc
  const filteredArticles = useMemo(() => {
    if (activeTab === "all") return articles;
    return articles.filter((a) => a.status === activeTab);
  }, [articles, activeTab]);

  const handleSubmit = async (id) => {
    const { error } = await supabase.rpc("submit_article", { p_id: id });
    if (error) {
      showToast(error.message || "Không gửi được bài viết", "error");
      return;
    }
    showToast("Đã gửi bài viết để chờ duyệt", "success");
    fetchMine();
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.article) return;
    const { type, article } = confirmDialog;

    if (type === "hide") {
      const { error } = await supabase.from("articles").update({ status: "draft" }).eq("id", article.id);
      if (error) {
        showToast(error.message || "Không ẩn được bài viết", "error");
      } else {
        showToast("Đã ẩn bài viết, chuyển về trạng thái Nháp", "success");
        fetchMine();
      }
    } else if (type === "delete") {
      const { error } = await supabase.from("articles").delete().eq("id", article.id);
      if (error) {
        showToast(error.message || "Không xoá được bài viết", "error");
      } else {
        showToast("Đã xoá bài viết vĩnh viễn", "success");
        fetchMine();
      }
    }
    setConfirmDialog({ isOpen: false, type: null, article: null });
  };

  return (
    <div className="min-h-screen bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] transition-colors duration-300 pb-[calc(3rem+env(safe-area-inset-bottom))]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        
        {/* Tiêu đề & Nút Tạo Bài Mới */}
        <Motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#7c5c2d] dark:text-[#d4b47d] mb-1">
              Quản lý tác giả
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#293d32] dark:text-[#ecece0] font-serif leading-tight">
              Bài viết của tôi
            </h1>
            <p className="text-sm font-medium text-[#575e55] dark:text-[#b0b9ac] mt-1.5">
              Soạn thảo bản nháp, gửi duyệt và theo dõi trạng thái bài viết của bạn.
            </p>
          </div>

          {username && (
            <Motion.button
              type="button"
              onClick={() => navigate("/bài-viết-của-tôi/soạn")}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              aria-label="Soạn thảo bài viết mới"
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-bold bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-sm active:scale-[0.98] transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" /> Viết bài mới
            </Motion.button>
          )}
        </Motion.div>

        {/* Trạng thái Chưa Đăng Nhập */}
        {!username ? (
          <Motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-3xl shadow-sm"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#dedfd4]/50 dark:bg-[#354237]/60 flex items-center justify-center text-[#314e3e] dark:text-[#d4b47d]">
              <Lock className="w-7 h-7" aria-hidden="true" />
            </div>
            <div className="max-w-md">
              <h2 className="text-lg sm:text-xl font-bold font-serif text-[#293d32] dark:text-[#ecece0]">
                Yêu cầu đăng nhập
              </h2>
              <p className="text-sm font-medium text-[#575e55] dark:text-[#b0b9ac] mt-2">
                Vui lòng đăng nhập bằng tài khoản Giáo lý viên hoặc Huynh trưởng để xem và quản lý các bài viết của bạn.
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleModal?.()}
              aria-label="Mở cửa sổ đăng nhập"
              className="mt-2 inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-xl text-sm font-bold bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-sm transition-transform active:scale-[0.98]"
            >
              Đăng nhập ngay
            </button>
          </Motion.div>
        ) : (
          <>
            {/* Bộ Lọc Trạng Thái (Segmented Pill Filter) */}
            <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 min-w-max pb-1" role="tablist" aria-label="Bộ lọc trạng thái bài viết">
                {[
                  { id: "all", label: "Tất cả", count: counts.all },
                  { id: "published", label: "Đã đăng", count: counts.published },
                  { id: "pending", label: "Chờ duyệt", count: counts.pending },
                  { id: "draft", label: "Bản nháp", count: counts.draft },
                  { id: "rejected", label: "Bị từ chối", count: counts.rejected },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveTab(tab.id)}
                      className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                        isActive
                          ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-sm"
                          : "bg-[#fffefa] dark:bg-[#1e2821] text-[#575e55] dark:text-[#b0b9ac] border border-[#dedfd4] dark:border-[#354237] hover:bg-[#faf8f3] dark:hover:bg-[#25332a]"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                          isActive
                            ? "bg-white/20 text-white dark:bg-[#19251d]/20 dark:text-[#19251d]"
                            : "bg-[#dedfd4]/60 dark:bg-[#354237]/60 text-[#575e55] dark:text-[#b0b9ac]"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trạng thái Tải hoặc Danh Sách Bài Viết */}
            {loading ? (
              <MyArticlesSkeleton />
            ) : filteredArticles.length === 0 ? (
              <Motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-3xl shadow-sm"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#dedfd4]/40 dark:bg-[#354237]/50 flex items-center justify-center text-[#575e55] dark:text-[#b0b9ac]">
                  <FileText className="w-7 h-7" aria-hidden="true" />
                </div>
                <h3 className="text-base sm:text-lg font-bold font-serif text-[#293d32] dark:text-[#ecece0]">
                  {activeTab === "all" ? "Bạn chưa có bài viết nào" : "Không có bài viết nào trong mục này"}
                </h3>
                <p className="text-xs sm:text-sm font-medium text-[#575e55] dark:text-[#b0b9ac] max-w-sm">
                  {activeTab === "all"
                    ? "Hãy bắt đầu chia sẻ tâm tình và câu chuyện của bạn bằng cách nhấn nút Viết bài mới."
                    : "Chọn mục khác hoặc tạo bài viết mới để tiếp tục."}
                </p>
                {activeTab === "all" && (
                  <button
                    type="button"
                    onClick={() => navigate("/bài-viết-của-tôi/soạn")}
                    aria-label="Bắt đầu viết bài đầu tiên"
                    className="mt-2 inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-bold bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-sm active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4 mr-1.5" strokeWidth={2.5} aria-hidden="true" /> Viết bài ngay
                  </button>
                )}
              </Motion.div>
            ) : (
              <div className="flex flex-col gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredArticles.map((a, i) => (
                    <Motion.div
                      key={a.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, scale: 0.98, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.3, delay: Math.min(i, 6) * 0.04, ease: [0.16, 1, 0.3, 1] }}
                      className="bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-2xl p-4 sm:p-6 shadow-sm hover:border-[#314e3e]/30 dark:hover:border-[#d6b883]/30 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        
                        {/* Thông tin bài viết bên trái */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <ArticleStatusBadge status={a.status} />
                            <span className="text-xs font-medium text-[#575e55] dark:text-[#b0b9ac]">
                              Cập nhật: {formatDateVi(a.updated_at)}
                            </span>
                          </div>

                          <h2 className="text-base sm:text-lg font-bold text-[#293d32] dark:text-[#ecece0] font-serif leading-snug line-clamp-2 pr-1">
                            {a.title}
                          </h2>

                          {/* Hộp hiển thị lý do từ chối nếu có */}
                          <AnimatePresence initial={false}>
                            {a.status === "rejected" && a.rejection_reason && (
                              <Motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: "auto", marginTop: 10 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                className="overflow-hidden"
                              >
                                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 p-3.5 rounded-xl flex items-start gap-2.5">
                                  <AlertCircle className="w-4 h-4 text-red-700 dark:text-red-400 mt-0.5 flex-shrink-0" strokeWidth={2.5} aria-hidden="true" />
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-wider text-red-800 dark:text-red-300 mb-0.5">
                                      Lý do từ chối
                                    </p>
                                    <p className="text-xs sm:text-sm font-medium text-red-950 dark:text-red-100 leading-relaxed">
                                      {a.rejection_reason}
                                    </p>
                                  </div>
                                </div>
                              </Motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Vùng điều khiển hành động (Touch target >= 44px) */}
                        <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-auto w-full sm:w-auto justify-end border-t sm:border-0 border-[#dedfd4] dark:border-[#354237] pt-3 sm:pt-0 mt-1 sm:mt-0">
                          
                          {/* Hành động cho bài ĐÃ ĐĂNG */}
                          {a.status === "published" && (
                            <>
                              <Link
                                to={`/bài-viết/${a.slug}`}
                                aria-label={`Xem bài viết: ${a.title}`}
                                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#314e3e]/10 dark:bg-[#314e3e]/30 text-[#314e3e] dark:text-[#8fd1a9] hover:bg-[#314e3e]/20 transition-all active:scale-[0.98]"
                              >
                                <Eye className="w-4 h-4" aria-hidden="true" />
                                <span>Xem bài</span>
                              </Link>
                              
                              <button
                                type="button"
                                onClick={() => setConfirmDialog({ isOpen: true, type: "hide", article: a })}
                                aria-label={`Ẩn bài viết: ${a.title}`}
                                title="Ẩn bài (chuyển về nháp)"
                                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-[#dedfd4]/40 dark:bg-[#354237]/50 text-[#575e55] dark:text-[#ecece0] hover:bg-[#dedfd4] dark:hover:bg-[#354237] active:scale-[0.94] transition-colors"
                              >
                                <EyeOff className="w-4 h-4" aria-hidden="true" />
                              </button>
                            </>
                          )}

                          {/* Hành động cho bài NHÁP hoặc BỊ TỪ CHỐI */}
                          {(a.status === "draft" || a.status === "rejected") && (
                            <>
                              <button
                                type="button"
                                onClick={() => navigate(`/bài-viết-của-tôi/soạn/${a.id}`)}
                                aria-label={`Chỉnh sửa bài viết: ${a.title}`}
                                title="Chỉnh sửa bài viết"
                                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-[#dedfd4]/40 dark:bg-[#354237]/50 text-[#575e55] dark:text-[#ecece0] hover:bg-[#dedfd4] dark:hover:bg-[#354237] active:scale-[0.94] transition-colors"
                              >
                                <Pencil className="w-4 h-4" aria-hidden="true" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSubmit(a.id)}
                                aria-label={`Gửi duyệt bài viết: ${a.title}`}
                                title="Gửi duyệt bài viết"
                                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-[#d4b47d]/25 dark:bg-[#927140]/30 text-[#7c5c2d] dark:text-[#d4b47d] hover:bg-[#d4b47d]/40 active:scale-[0.94] transition-colors"
                              >
                                <Send className="w-4 h-4" aria-hidden="true" />
                              </button>
                            </>
                          )}

                          {/* Xóa bài viết (áp dụng cho mọi trạng thái) */}
                          <button
                            type="button"
                            onClick={() => setConfirmDialog({ isOpen: true, type: "delete", article: a })}
                            aria-label={`Xoá bài viết: ${a.title}`}
                            title="Xoá bài viết"
                            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 active:scale-[0.94] transition-colors"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </Motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

      </div>

      {/* Modal Xác Nhận Thao Tác (Xoá / Ẩn bài viết) */}
      <AnimatePresence>
        {confirmDialog.isOpen && confirmDialog.article && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
          >
            <Motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-3xl p-6 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    confirmDialog.type === "delete"
                      ? "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400"
                      : "bg-[#dedfd4]/60 dark:bg-[#354237]/60 text-[#314e3e] dark:text-[#d4b47d]"
                  }`}
                >
                  {confirmDialog.type === "delete" ? (
                    <Trash2 className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <EyeOff className="w-5 h-5" aria-hidden="true" />
                  )}
                </div>
                <h3 id="dialog-title" className="text-lg font-bold font-serif text-[#293d32] dark:text-[#ecece0]">
                  {confirmDialog.type === "delete" ? "Xác nhận xoá bài viết" : "Ẩn bài viết"}
                </h3>
              </div>

              <p className="text-sm font-medium text-[#575e55] dark:text-[#b0b9ac] leading-relaxed mb-6">
                {confirmDialog.type === "delete"
                  ? `Bạn có chắc chắn muốn xoá vĩnh viễn bài viết "${confirmDialog.article.title}"? Hành động này không thể hoàn tác.`
                  : `Bài viết "${confirmDialog.article.title}" sẽ được chuyển về trạng thái Nháp và ẩn khỏi trang công khai. Bạn có thể chỉnh sửa và gửi duyệt lại sau.`}
              </p>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmDialog({ isOpen: false, type: null, article: null })}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#dedfd4]/50 dark:bg-[#354237]/60 text-[#575e55] dark:text-[#ecece0] hover:bg-[#dedfd4] dark:hover:bg-[#354237] transition-colors"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  className={`min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition-transform active:scale-[0.98] ${
                    confirmDialog.type === "delete"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-[#314e3e] hover:bg-[#253e31] dark:bg-[#d6b883] dark:text-[#19251d]"
                  }`}
                >
                  {confirmDialog.type === "delete" ? "Xoá bài viết" : "Xác nhận ẩn"}
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}