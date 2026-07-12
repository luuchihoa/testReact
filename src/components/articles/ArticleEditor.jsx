import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../ui/ToastContext.jsx";
import { slugify } from "../../lib/slugify.js";
import { 
  Loader2, Eye, Pencil, Send, Bold, Italic, Heading, Quote, Link2, List, Code as CodeIcon, ArrowLeft 
} from "lucide-react";

const MAX_TITLE = 200;
const MAX_SUMMARY = 300;

export default function ArticleEditor() {
  const { id } = useParams(); // undefined = tạo mới
  const navigate = useNavigate();
  const { showToast } = useToast();
  const username = localStorage.getItem("username") || "";
  const textareaRef = useRef(null);

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
    if (content.trim().length < 10) { showToast("Nội dung bài viết quá ngắn", "error"); return false; }
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
        showToast("Đã lưu bản nháp thành công", "success");
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

      showToast("Đã gửi bài viết thành công, vui lòng chờ duyệt", "success");
      navigate("/bài-viết-của-tôi");
    } catch (err) {
      console.error("ArticleEditor: submit error:", err);
      showToast(err.message || "Không gửi được bài viết", "error");
    } finally {
      setSaving(false);
    }
  };

  // Helper chèn Markdown nhanh vào textarea
  const insertMarkdown = (syntax, placeholder = "văn bản") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selectedText = currentText.substring(start, end) || placeholder;

    let replacement = "";
    if (syntax === "bold") replacement = `**${selectedText}**`;
    else if (syntax === "italic") replacement = `*${selectedText}*`;
    else if (syntax === "heading") replacement = `\n### ${selectedText}\n`;
    else if (syntax === "quote") replacement = `\n> ${selectedText}\n`;
    else if (syntax === "link") replacement = `[${selectedText}](https://)`;
    else if (syntax === "list") replacement = `\n- ${selectedText}`;
    else if (syntax === "code") replacement = `\`${selectedText}\``;

    const newText = currentText.substring(0, start) + replacement + currentText.substring(end);
    setContent(newText);

    // Đưa con trỏ chuột về vị trí hợp lý sau khi chèn
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + replacement.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Bộ đếm từ và ký tự
  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = content.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] dark:bg-stone-950 flex items-center justify-center gap-2 py-24 text-stone-400 dark:text-stone-555">
        <Loader2 className="w-5 h-5 animate-spin text-amber-700 dark:text-amber-500" />
        <span className="text-sm font-medium">Đang tải biểu mẫu…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 px-6 py-10 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        
        {/* Nút quay lại */}
        <button
          type="button"
          onClick={() => navigate("/bài-viết-của-tôi")}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-stone-500 hover:text-stone-855 dark:hover:text-stone-200 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" /> Bài viết của tôi
        </button>

        <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight mb-1">
          {id ? "Chỉnh sửa bài viết" : "Soạn thảo bài viết mới"}
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
          Hệ thống hỗ trợ hoàn toàn định dạng văn bản Markdown chuẩn để trình bày bài viết phong phú.
        </p>

        {status === "rejected" && rejectionReason && (
          <div className="mb-6 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 px-4 py-3.5 text-[13px] text-red-700 dark:text-red-400">
            <span className="font-bold">Bài viết đã bị từ chối duyệt:</span> {rejectionReason}
          </div>
        )}

        <div className="flex flex-col gap-5 bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs">
          
          {/* Nhập tiêu đề */}
          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-450">Tiêu đề bài viết</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
              placeholder="Nhập tiêu đề ấn tượng..."
              className="mt-1.5 w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 px-3.5 py-2.5 text-[14px] text-stone-850 dark:text-stone-150 placeholder-stone-450 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600 transition-all"
            />
          </div>

          {/* Chuyên mục & Ảnh bìa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-450">Chuyên mục</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="VD: Chia sẻ, Sự kiện, Thông báo..."
                className="mt-1.5 w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 px-3.5 py-2.5 text-[14px] text-stone-850 dark:text-stone-150 placeholder-stone-450 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600 transition-all"
              />
            </div>
            <div>
              <label className="text-[12px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-450">Ảnh bìa (Liên kết URL)</label>
              <input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://image-url.com/path.jpg"
                className="mt-1.5 w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 px-3.5 py-2.5 text-[14px] text-stone-850 dark:text-stone-150 placeholder-stone-450 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600 transition-all"
              />
            </div>
          </div>

          {/* Tóm tắt bài viết */}
          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-450">Tóm tắt ngắn</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value.slice(0, MAX_SUMMARY))}
              rows={2}
              placeholder="Một vài câu mô tả ngắn gọn hiển thị ở danh mục bài viết chính..."
              className="mt-1.5 w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 px-3.5 py-2.5 text-[14px] text-stone-850 dark:text-stone-150 placeholder-stone-450 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600 transition-all resize-none"
            />
            <div className="flex justify-end text-[10px] text-stone-400 dark:text-stone-500 mt-1 font-medium">
              {summary.length}/{MAX_SUMMARY} ký tự
            </div>
          </div>

          {/* Nội dung soạn thảo */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-2.5 mb-3.5">
              {/* Tab điều hướng */}
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setTab("edit")}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${tab === "edit" ? "bg-stone-900 dark:bg-stone-800 text-white shadow-xs" : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-750"}`}>
                  <Pencil className="w-3.5 h-3.5" /> Soạn thảo
                </button>
                <button type="button" onClick={() => setTab("preview")}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${tab === "preview" ? "bg-stone-900 dark:bg-stone-800 text-white shadow-xs" : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-750"}`}>
                  <Eye className="w-3.5 h-3.5" /> Xem trước
                </button>
              </div>

              {/* Helper Bar chỉ hiện khi ở tab soạn thảo */}
              {tab === "edit" && (
                <div className="flex flex-wrap items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-xl p-1">
                  <button type="button" onClick={() => insertMarkdown("bold")} className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 hover:shadow-xs transition-all" title="In đậm"><Bold className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => insertMarkdown("italic")} className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 hover:shadow-xs transition-all" title="In nghiêng"><Italic className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => insertMarkdown("heading")} className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 hover:shadow-xs transition-all" title="Tiêu đề H3"><Heading className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => insertMarkdown("quote")} className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 hover:shadow-xs transition-all" title="Trích dẫn"><Quote className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => insertMarkdown("link")} className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 hover:shadow-xs transition-all" title="Chèn liên kết"><Link2 className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => insertMarkdown("list")} className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 hover:shadow-xs transition-all" title="Danh sách buột"><List className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => insertMarkdown("code")} className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 hover:shadow-xs transition-all" title="Mã nguồn"><CodeIcon className="w-3.5 h-3.5" /></button>
                </div>
              )}
            </div>

            {tab === "edit" ? (
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={16}
                  placeholder="Nội dung bài viết (hỗ trợ Markdown). Bạn có thể viết tiêu đề bằng dấu #, in đậm bằng **, chèn danh sách bằng dấu - ..."
                  className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 px-3.5 py-3 text-[14px] font-mono leading-relaxed text-stone-850 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600 transition-all resize-y"
                  data-lenis-prevent
                />
                <div className="flex justify-end text-[10px] text-stone-400 dark:text-stone-500 mt-1.5 font-semibold">
                  TỔNG CỘNG: {wordCount} từ · {charCount} ký tự
                </div>
              </div>
            ) : (
              <div className="prose prose-stone prose-sm sm:prose-base max-w-none dark:prose-invert border border-stone-200 dark:border-stone-800 rounded-xl px-5 py-4 min-h-[360px] bg-stone-50/30 dark:bg-stone-900/20 overflow-y-auto">
                {content.trim() ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{content}</ReactMarkdown>
                ) : (
                  <p className="text-stone-300 dark:text-stone-700 text-sm font-medium text-center py-20">Nội dung xem trước hiển thị tại đây khi bạn viết bài.</p>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-stone-100 dark:border-stone-800 mt-2">
            <button 
              type="button" 
              onClick={handleSaveDraft} 
              disabled={saving}
              className="flex-1 px-5 py-3 rounded-xl border border-stone-300 dark:border-stone-700 text-sm font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-850 active:scale-98 transition-all disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu bản nháp"}
            </button>
            <button 
              type="button" 
              onClick={handleSubmitForReview} 
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-600 text-white text-sm font-bold shadow-xs active:scale-98 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Gửi kiểm duyệt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}