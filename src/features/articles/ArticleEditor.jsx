import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import { Placeholder } from "@tiptap/extensions";
import TiptapImage from "@tiptap/extension-image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../../components/ui/ToastContext.jsx";
import { slugify } from "../../lib/slugify.js";
import { 
  Loader2, Eye, Pencil, Send, Bold, Italic, Heading, Quote, Link2, List, Code as CodeIcon, ArrowLeft, AlertCircle, Image as ImageIcon, CheckCircle2, Save
} from "lucide-react";

const MAX_TITLE = 200;
const MAX_SUMMARY = 300;
const LOCAL_DRAFT_KEY = "article_editor_draft_v1";

const EDITOR_PLACEHOLDER_CSS = `
  .article-editor-content p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
    color: rgb(87 94 85 / 0.6);
  }
  .dark .article-editor-content p.is-editor-empty:first-child::before {
    color: rgb(176 185 172 / 0.5);
  }
`;

function ArticleEditorSkeleton() {
  return (
    <div className="min-h-screen bg-[#faf8f3] dark:bg-[#151c18] px-4 sm:px-6 py-6 sm:py-10 animate-pulse">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="w-36 h-11 bg-[#dedfd4]/60 dark:bg-[#354237]/60 rounded-xl" />
        <div className="space-y-2">
          <div className="w-24 h-4 bg-[#dedfd4]/50 dark:bg-[#354237]/50 rounded" />
          <div className="w-3/4 h-8 bg-[#dedfd4]/60 dark:bg-[#354237]/60 rounded-lg" />
          <div className="w-1/2 h-4 bg-[#dedfd4]/40 dark:bg-[#354237]/40 rounded" />
        </div>
        <div className="bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="h-12 bg-[#dedfd4]/40 dark:bg-[#354237]/40 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-12 bg-[#dedfd4]/40 dark:bg-[#354237]/40 rounded-xl" />
            <div className="h-12 bg-[#dedfd4]/40 dark:bg-[#354237]/40 rounded-xl" />
          </div>
          <div className="h-24 bg-[#dedfd4]/40 dark:bg-[#354237]/40 rounded-xl" />
          <div className="h-64 bg-[#dedfd4]/40 dark:bg-[#354237]/40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function getInitialDraft() {
  try {
    const savedDraft = localStorage.getItem(LOCAL_DRAFT_KEY);
    if (savedDraft) {
      const parsed = JSON.parse(savedDraft);
      if (parsed && (parsed.title || parsed.content || parsed.summary)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to read draft from localStorage:", e);
  }
  return null;
}

export default function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const username = localStorage.getItem("username") || "";

  const [initialDraft] = useState(() => (!id ? getInitialDraft() : null) || {});
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("edit");

  const [title, setTitle] = useState(() => initialDraft.title || "");
  const [summary, setSummary] = useState(() => initialDraft.summary || "");
  const [category, setCategory] = useState(() => initialDraft.category || "");
  const [coverImage, setCoverImage] = useState(() => initialDraft.coverImage || "");
  const [content, setContent] = useState(() => initialDraft.content || "");
  const [status, setStatus] = useState("draft");
  const [rejectionReason, setRejectionReason] = useState(null);
  const [lastAutoSaved, setLastAutoSaved] = useState(() => initialDraft.savedAt ? new Date(initialDraft.savedAt) : null);

  const autoSaveTimerRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } },
      }),
      Markdown,
      TiptapImage.configure({
        HTMLAttributes: { class: "rounded-2xl max-w-full my-4 shadow-sm" },
      }),
      Placeholder.configure({
        placeholder: "Bắt đầu soạn thảo bài viết ở đây… gõ tự nhiên như Word, không cần nhớ cú pháp.",
      }),
    ],
    content: initialDraft.content || "",
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        class: "article-editor-content prose prose-stone prose-sm sm:prose-base max-w-none dark:prose-invert prose-img:rounded-2xl focus:outline-none min-h-[320px] text-[#293d32] dark:text-[#ecece0] leading-relaxed",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const md = ed.getMarkdown();
      setContent(md);
    },
  });

  // Tải dữ liệu bài viết từ Supabase nếu có id
  useEffect(() => {
    if (!id || !editor) return;
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
      setTitle(data.title || "");
      setSummary(data.summary || "");
      setCategory(data.category || "");
      setCoverImage(data.cover_image || "");
      setContent(data.content || "");
      editor.commands.setContent(data.content || "", { contentType: "markdown" });
      setStatus(data.status);
      setRejectionReason(data.rejection_reason);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [id, editor, navigate, showToast]);

  // Tự động lưu nháp cục bộ (Local Auto-save) khi người dùng đang nhập
  useEffect(() => {
    if (id || loading) return; // Chỉ tự lưu nháp cục bộ cho bài mới tạo
    if (!title && !content && !summary) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          LOCAL_DRAFT_KEY,
          JSON.stringify({
            title,
            summary,
            category,
            coverImage,
            content,
            savedAt: Date.now(),
          })
        );
        setLastAutoSaved(new Date());
      } catch (err) {
        console.warn("Auto-save draft warning:", err);
      }
    }, 1500);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [id, loading, title, summary, category, coverImage, content]);

  const validate = useCallback(() => {
    if (title.trim().length < 3) {
      showToast("Tiêu đề bài viết cần ít nhất 3 ký tự", "error");
      return false;
    }
    if (content.trim().length < 10) {
      showToast("Nội dung bài viết quá ngắn (tối thiểu 10 ký tự)", "error");
      return false;
    }
    return true;
  }, [title, content, showToast]);

  const buildPayload = useCallback(() => ({
    title: title.trim(),
    summary: summary.trim() || null,
    category: category.trim() || null,
    cover_image: coverImage.trim() || null,
    content,
  }), [title, summary, category, coverImage, content]);

  const handleSaveDraft = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (id) {
        const { error } = await supabase.from("articles").update(buildPayload()).eq("id", id);
        if (error) throw error;
        showToast("Đã lưu bản thay đổi thành công", "success");
      } else {
        const { data, error } = await supabase
          .from("articles")
          .insert({ ...buildPayload(), author_username: username, slug: slugify(title), status: "draft" })
          .select("id")
          .single();
        if (error) throw error;
        localStorage.removeItem(LOCAL_DRAFT_KEY);
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

      localStorage.removeItem(LOCAL_DRAFT_KEY);
      showToast("Đã gửi bài viết thành công, vui lòng chờ duyệt", "success");
      navigate("/bài-viết-của-tôi");
    } catch (err) {
      console.error("ArticleEditor: submit error:", err);
      showToast(err.message || "Không gửi được bài viết", "error");
    } finally {
      setSaving(false);
    }
  };

  const insertLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Nhập liên kết URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertImage = () => {
    if (!editor) return;
    const url = window.prompt("Nhập liên kết ảnh (URL)");
    if (!url) return;
    const alt = window.prompt("Mô tả ngắn cho hình ảnh", "") || "";
    editor.chain().focus().setImage({ src: url, alt }).run();
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = content.length;

  const toolbarButtons = editor ? [
    { key: "bold",    title: "In đậm",        Icon: Bold,     isActive: editor.isActive("bold"),               action: () => editor.chain().focus().toggleBold().run() },
    { key: "italic",  title: "In nghiêng",    Icon: Italic,   isActive: editor.isActive("italic"),             action: () => editor.chain().focus().toggleItalic().run() },
    { key: "heading", title: "Tiêu đề phụ",   Icon: Heading,  isActive: editor.isActive("heading", { level: 3 }), action: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { key: "quote",   title: "Trích dẫn",     Icon: Quote,    isActive: editor.isActive("blockquote"),         action: () => editor.chain().focus().toggleBlockquote().run() },
    { key: "link",    title: "Chèn liên kết", Icon: Link2,    isActive: editor.isActive("link"),               action: insertLink },
    { key: "list",    title: "Danh sách",     Icon: List,     isActive: editor.isActive("bulletList"),         action: () => editor.chain().focus().toggleBulletList().run() },
    { key: "code",    title: "Khối mã",       Icon: CodeIcon, isActive: editor.isActive("code"),               action: () => editor.chain().focus().toggleCode().run() },
    { key: "image",   title: "Chèn ảnh",      Icon: ImageIcon, isActive: false,                                action: insertImage },
  ] : [];

  if (loading) {
    return <ArticleEditorSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] px-4 sm:px-6 py-6 sm:py-10 transition-colors duration-300 pb-[calc(4rem+env(safe-area-inset-bottom))]">
      <style>{EDITOR_PLACEHOLDER_CSS}</style>
      <div className="max-w-3xl mx-auto">
        
        {/* Nút quay lại */}
        <Motion.button
          type="button"
          onClick={() => navigate("/bài-viết-của-tôi")}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          whileTap={{ scale: 0.97 }}
          aria-label="Quay lại trang Bài viết của tôi"
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#dedfd4]/50 dark:bg-[#354237]/60 text-[#575e55] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] transition-all hover:bg-[#dedfd4] dark:hover:bg-[#354237] mb-6"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
          <span>Bài viết của tôi</span>
        </Motion.button>

        {/* Tiêu đề trang & Chỉ báo Auto-save */}
        <Motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#7c5c2d] dark:text-[#d4b47d] mb-1">
              Trình soạn thảo
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#293d32] dark:text-[#ecece0] font-serif leading-tight">
              {id ? "Chỉnh sửa bài viết" : "Soạn thảo bài viết mới"}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#575e55] dark:text-[#b0b9ac] mt-1.5 leading-relaxed">
              Soạn trực quan như Word — hệ thống tự động lưu nháp và định dạng chuẩn phụng vụ.
            </p>
          </div>

          {lastAutoSaved && !id && (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#314e3e] dark:text-[#8fd1a9] bg-[#314e3e]/10 dark:bg-[#314e3e]/30 px-3 py-1.5 rounded-full self-start sm:self-auto">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Đã lưu nháp {lastAutoSaved.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          )}
        </Motion.div>

        {/* Khung cảnh báo (nếu bị từ chối) */}
        <AnimatePresence initial={false}>
          {status === "rejected" && rejectionReason && (
            <Motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 p-4 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-700 dark:text-red-400 mt-0.5 flex-shrink-0" strokeWidth={2.5} aria-hidden="true" />
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-800 dark:text-red-300 mb-1">
                    Lý do bài viết bị từ chối duyệt
                  </p>
                  <div className="text-xs sm:text-sm font-medium text-red-950 dark:text-red-100 leading-relaxed">
                    {rejectionReason}
                  </div>
                </div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Form Soạn Thảo */}
        <Motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-5 sm:gap-6 bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-3xl p-5 sm:p-8 shadow-sm"
        >
          
          {/* Nhập tiêu đề */}
          <div>
            <label htmlFor="article-title" className="text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac] mb-1.5 block">
              Tiêu đề bài viết <span className="text-red-600">*</span>
            </label>
            <input
              id="article-title"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
              placeholder="VD: Cảm nhận sau thánh lễ Bổn mạng Xứ đoàn..."
              className="w-full rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] px-4 py-3 min-h-[44px] text-sm sm:text-base font-bold text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 focus:border-[#314e3e] dark:focus:border-[#d6b883] transition-all"
            />
          </div>

          {/* Chuyên mục & Ảnh bìa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label htmlFor="article-category" className="text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac] mb-1.5 block">
                Chuyên mục
              </label>
              <input
                id="article-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="VD: Chia sẻ, Sự kiện, Sinh hoạt..."
                className="w-full rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] px-4 py-3 min-h-[44px] text-xs sm:text-sm font-medium text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 focus:border-[#314e3e] dark:focus:border-[#d6b883] transition-all"
              />
            </div>
            <div>
              <label htmlFor="article-cover" className="text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac] mb-1.5 block">
                Ảnh bìa (Liên kết URL)
              </label>
              <input
                id="article-cover"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://imgur.com/anh-bia.jpg"
                className="w-full rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] px-4 py-3 min-h-[44px] text-xs sm:text-sm font-medium text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 focus:border-[#314e3e] dark:focus:border-[#d6b883] transition-all"
              />
            </div>
          </div>

          {/* Tóm tắt bài viết */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="article-summary" className="text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac] block">
                Tóm tắt ngắn (Xem trước tại danh sách)
              </label>
              <span className="text-xs font-medium text-[#575e55] dark:text-[#b0b9ac]">
                {summary.length}/{MAX_SUMMARY} ký tự
              </span>
            </div>
            <textarea
              id="article-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value.slice(0, MAX_SUMMARY))}
              rows={2}
              placeholder="Đoạn văn ngắn giới thiệu nội dung bài viết..."
              className="w-full rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] px-4 py-3 text-xs sm:text-sm font-medium text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 focus:border-[#314e3e] dark:focus:border-[#d6b883] transition-all resize-none"
            />
          </div>

          {/* Nội dung soạn thảo & Toolbar */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac] mb-2 block">
              Nội dung bài viết <span className="text-red-600">*</span>
            </label>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#dedfd4] dark:border-[#354237] pb-3 mb-4">
              {/* Tab Soạn thảo / Xem trước */}
              <div className="flex items-center gap-1.5 bg-[#faf8f3] dark:bg-[#151c18] p-1 rounded-xl border border-[#dedfd4] dark:border-[#354237]">
                <button 
                  type="button" 
                  onClick={() => setTab("edit")}
                  aria-label="Chuyển sang chế độ soạn thảo"
                  className={`min-h-[44px] flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    tab === "edit" 
                      ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-sm" 
                      : "text-[#575e55] dark:text-[#b0b9ac] hover:text-[#293d32] dark:hover:text-[#ecece0]"
                  }`}
                >
                  <Pencil className="w-4 h-4" aria-hidden="true" /> 
                  <span>Soạn thảo</span>
                </button>
                
                <button 
                  type="button" 
                  onClick={() => setTab("preview")}
                  aria-label="Chuyển sang chế độ xem trước"
                  className={`min-h-[44px] flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    tab === "preview" 
                      ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-sm" 
                      : "text-[#575e55] dark:text-[#b0b9ac] hover:text-[#293d32] dark:hover:text-[#ecece0]"
                  }`}
                >
                  <Eye className="w-4 h-4" aria-hidden="true" /> 
                  <span>Xem trước</span>
                </button>
              </div>

              {/* Thanh định dạng trực quan (Touch target >= 44px, cuộn ngang) */}
              {tab === "edit" && editor && (
                <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
                  <div className="flex items-center gap-1 bg-[#faf8f3] dark:bg-[#151c18] p-1 rounded-xl border border-[#dedfd4] dark:border-[#354237] min-w-max">
                    {toolbarButtons.map((btn) => {
                      const IconComponent = btn.Icon;
                      return (
                        <button
                          key={btn.key}
                          type="button"
                          onClick={btn.action}
                          aria-label={btn.title}
                          title={btn.title}
                          className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-all active:scale-[0.92] ${
                            btn.isActive
                              ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-sm"
                              : "text-[#575e55] dark:text-[#b0b9ac] hover:bg-[#dedfd4]/60 dark:hover:bg-[#354237]/60 hover:text-[#293d32] dark:hover:text-[#ecece0]"
                          }`}
                        >
                          <IconComponent className="w-4 h-4" aria-hidden="true" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {tab === "edit" ? (
                <Motion.div
                  key="edit"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    onClick={() => editor?.chain().focus().run()}
                    className="w-full rounded-2xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] px-4 sm:px-6 py-4 shadow-inner cursor-text focus-within:ring-2 focus-within:ring-[#314e3e]/30 dark:focus-within:ring-[#d6b883]/30 focus-within:border-[#314e3e] dark:focus-within:border-[#d6b883] transition-all min-h-[340px]"
                  >
                    <EditorContent editor={editor} />
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac] mt-2 px-1">
                    <span>Hỗ trợ định dạng Lời Chúa, đoạn văn, trích dẫn</span>
                    <span>{wordCount} từ · {charCount} ký tự</span>
                  </div>
                </Motion.div>
              ) : (
                <Motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="prose prose-stone prose-sm sm:prose-base max-w-none dark:prose-invert rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] shadow-inner px-5 sm:px-6 py-6 min-h-[340px] overflow-y-auto leading-relaxed text-[#293d32] dark:text-[#ecece0] w-full min-w-0 max-w-full [overflow-wrap:anywhere] break-words"
                >
                  {content.trim() ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      skipHtml
                      components={{
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        ),
                        pre: ({ children, ...props }) => (
                          <div
                            role="region"
                            aria-label="Khối mã nguồn trong bài viết"
                            tabIndex={0}
                            className="w-full min-w-0 max-w-full overflow-x-auto my-4 rounded-2xl bg-[#1e2821] dark:bg-[#151c18] text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] p-4 text-xs sm:text-sm font-mono shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d6b883]"
                          >
                            <pre className="overflow-x-auto max-w-full whitespace-pre font-mono leading-relaxed bg-transparent p-0 m-0 border-0" {...props}>
                              {children}
                            </pre>
                          </div>
                        ),
                        code: ({ inline, className, children, ...props }) => {
                          const isInline = inline || (!className && !String(children).includes("\n"));
                          if (isInline) {
                            return (
                              <code
                                className="px-1.5 py-0.5 rounded-md bg-[#314e3e]/10 dark:bg-[#d6b883]/20 text-[#314e3e] dark:text-[#d6b883] font-mono text-[0.875em] font-semibold [overflow-wrap:anywhere] break-all border border-[#314e3e]/20 dark:border-[#d6b883]/30 before:content-none after:content-none"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          }
                          return (
                            <code className="font-mono text-xs sm:text-sm [overflow-wrap:anywhere] text-[#ecece0]" {...props}>
                              {children}
                            </code>
                          );
                        },
                        table: ({ children, ...props }) => (
                          <div
                            role="region"
                            aria-label="Bảng dữ liệu trong bài viết"
                            tabIndex={0}
                            className="overflow-x-auto my-6 w-full min-w-0 max-w-full rounded-2xl border border-[#dedfd4] dark:border-[#354237] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d6b883]"
                          >
                            <table className="w-full text-left border-collapse" {...props}>
                              {children}
                            </table>
                          </div>
                        ),
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-[#575e55] dark:text-[#b0b9ac] py-20">
                      <Eye className="w-8 h-8 mb-2 opacity-50" aria-hidden="true" />
                      <p className="text-sm font-semibold">Chưa có nội dung để xem trước.</p>
                    </div>
                  )}
                </Motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action buttons (Lưu nháp / Gửi kiểm duyệt) */}
          <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-[#dedfd4] dark:border-[#354237] mt-2">
            <button 
              type="button" 
              onClick={handleSaveDraft} 
              disabled={saving}
              aria-label="Lưu bản nháp bài viết"
              className="flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-xl text-sm font-bold bg-[#dedfd4]/60 dark:bg-[#354237]/60 text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] transition-all hover:bg-[#dedfd4] dark:hover:bg-[#354237] active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Save className="w-4 h-4" aria-hidden="true" />}
              <span>{saving ? "Đang lưu..." : "Lưu bản nháp"}</span>
            </button>
            <button 
              type="button" 
              onClick={handleSubmitForReview} 
              disabled={saving}
              aria-label="Gửi bài viết để ban quản trị kiểm duyệt"
              className="flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-xl text-sm font-bold bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-sm hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Send className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />}
              <span>{saving ? "Đang gửi..." : "Gửi kiểm duyệt"}</span>
            </button>
          </div>
        </Motion.div>
      </div>
    </div>
  );
}