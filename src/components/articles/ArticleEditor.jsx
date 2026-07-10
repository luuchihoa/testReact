import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../ui/ToastContext.jsx";
import { slugify } from "../../lib/slugify.js";
import { Loader2, Eye, Pencil, Send } from "lucide-react";

const MAX_TITLE = 200;
const MAX_SUMMARY = 300;

export default function ArticleEditor() {
  const { id } = useParams(); // undefined = tạo mới
  const navigate = useNavigate();
  const { showToast } = useToast();
  const username = localStorage.getItem("username") || "";

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("edit"); // 'edit' | 'preview'

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");
  const [rejectionReason, setRejectionReason] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase.from("articles").select("*").eq("id", id).maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        showToast("Không tải được bài viết", "error");
        navigate("/bài-viết-của-tôi");
        return;
      }
      if (!["draft", "rejected"].includes(data.status)) {
        showToast("Bài viết đang chờ duyệt hoặc đã đăng, không thể chỉnh sửa", "info");
        navigate("/bài-viết-của-tôi");
        return;
      }
      setTitle(data.title);
      setSummary(data.summary || "");
      setCategory(data.category || "");
      setCoverImage(data.cover_image || "");
      setContent(data.content);
      setStatus(data.status);
      setRejectionReason(data.rejection_reason);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [id, navigate, showToast]);

  const validate = () => {
    if (title.trim().length < 3) { showToast("Tiêu đề cần ít nhất 3 ký tự", "error"); return false; }
    if (content.trim().length < 10) { showToast("Nội dung quá ngắn", "error"); return false; }
    return true;
  };

  const buildPayload = () => ({
    title: title.trim(),
    summary: summary.trim() || null,
    category: category.trim() || null,
    cover_image: coverImage.trim() || null,
    content,
  });

  const handleSaveDraft = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (id) {
        const { error } = await supabase.from("articles").update(buildPayload()).eq("id", id);
        if (error) throw error;
        showToast("Đã lưu thay đổi", "success");
      } else {
        const { data, error } = await supabase
          .from("articles")
          .insert({ ...buildPayload(), author_username: username, slug: slugify(title), status: "draft" })
          .select("id")
          .single();
        if (error) throw error;
        showToast("Đã lưu bản nháp", "success");
        navigate(`/bài-viết-của-tôi/soạn/${data.id}`, { replace: true });
        return;
      }
    } catch (err) {
      console.error("ArticleEditor: save error:", err);
      showToast(err.message || "Không lưu được bài viết", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      let articleId = id;
      // Đảm bảo nội dung mới nhất được lưu trước khi gửi duyệt
      if (id) {
        const { error } = await supabase.from("articles").update(buildPayload()).eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("articles")
          .insert({ ...buildPayload(), author_username: username, slug: slugify(title), status: "draft" })
          .select("id")
          .single();
        if (error) throw error;
        articleId = data.id;
      }

      const { error: submitError } = await supabase.rpc("submit_article", { p_id: articleId });
      if (submitError) throw submitError;

      showToast("Đã gửi bài viết, vui lòng chờ admin duyệt", "success");
      navigate("/bài-viết-của-tôi");
    } catch (err) {
      console.error("ArticleEditor: submit error:", err);
      showToast(err.message || "Không gửi được bài viết", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-stone-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Đang tải…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] px-6 py-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-900 tracking-tight mb-1">
        {id ? "Chỉnh sửa bài viết" : "Viết bài mới"}
      </h1>
      <p className="text-sm text-stone-500 mb-6">Nội dung hỗ trợ định dạng Markdown (tiêu đề, in đậm, danh sách, liên kết…)</p>

      {status === "rejected" && rejectionReason && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          <span className="font-semibold">Bài viết đã bị từ chối:</span> {rejectionReason}
        </div>
      )}

      <div className="flex flex-col gap-4 bg-white border border-stone-200/80 rounded-2xl p-5 sm:p-6">
        <div>
          <label className="text-[12px] font-semibold text-stone-600">Tiêu đề</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
            placeholder="Tiêu đề bài viết"
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[12px] font-semibold text-stone-600">Chuyên mục</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="VD: Chia sẻ, Sự kiện…"
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-stone-600">Ảnh bìa (URL)</label>
            <input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://…"
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
        </div>

        <div>
          <label className="text-[12px] font-semibold text-stone-600">Tóm tắt ngắn</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value.slice(0, MAX_SUMMARY))}
            rows={2}
            placeholder="Một câu tóm tắt hiển thị ở danh sách bài viết"
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
          />
          <p className="text-[11px] text-stone-400 mt-1">{summary.length}/{MAX_SUMMARY}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <button type="button" onClick={() => setTab("edit")}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${tab === "edit" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500"}`}>
              <Pencil className="w-3 h-3" /> Soạn
            </button>
            <button type="button" onClick={() => setTab("preview")}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${tab === "preview" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500"}`}>
              <Eye className="w-3 h-3" /> Xem trước
            </button>
          </div>

          {tab === "edit" ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              placeholder="Nội dung bài viết (hỗ trợ Markdown)…"
              className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-[14px] font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-300 resize-y"
              data-lenis-prevent
            />
          ) : (
            <div className="prose prose-stone prose-sm max-w-none border border-stone-200 rounded-lg px-4 py-3 min-h-[300px]">
              {content.trim() ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{content}</ReactMarkdown>
              ) : (
                <p className="text-stone-300 text-sm">Chưa có nội dung để xem trước</p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button type="button" onClick={handleSaveDraft} disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-full border border-stone-300 text-sm font-semibold text-stone-700 md:hover:bg-stone-100 transition-colors disabled:opacity-50">
            Lưu nháp
          </button>
          <button type="button" onClick={handleSubmitForReview} disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-amber-800 text-white text-sm font-semibold md:hover:bg-amber-900 transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Gửi duyệt
          </button>
        </div>
      </div>
    </div>
  );
}