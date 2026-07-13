import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../ui/ToastContext.jsx";
import { slugify } from "../../lib/slugify.js";
import { 
  Loader2, Eye, Pencil, Send, Bold, Italic, Heading, Quote, Link2, List, Code as CodeIcon, ArrowLeft, AlertCircle
} from "lucide-react";

const MAX_TITLE = 200;
const MAX_SUMMARY = 300;

export default function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const username = localStorage.getItem("username") || "";
  const textareaRef = useRef(null);

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("edit");

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
        showToast("Đã lưu bản thay đổi", "success");
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

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + replacement.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = content.length;

  const toolbarButtons = [
    { syntax: "bold",    title: "In đậm",       Icon: Bold },
    { syntax: "italic",  title: "In nghiêng",   Icon: Italic },
    { syntax: "heading", title: "Tiêu đề H3",   Icon: Heading },
    { syntax: "quote",   title: "Trích dẫn",    Icon: Quote },
    { syntax: "link",    title: "Chèn liên kết", Icon: Link2 },
    { syntax: "list",    title: "Danh sách buột", Icon: List },
    { syntax: "code",    title: "Mã nguồn",     Icon: CodeIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917] flex items-center justify-center gap-2.5 py-24 text-stone-500">
        <Loader2 className="w-6 h-6 animate-spin text-amber-900 dark:text-amber-500" />
        <span className="text-[14px] font-bold">Đang tải biểu mẫu…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917] text-stone-800 dark:text-stone-200 px-5 sm:px-6 py-8 sm:py-10 transition-colors duration-500">
      <div className="max-w-3xl mx-auto">
        
        {/* Nút quay lại */}
        <motion.button
          type="button"
          onClick={() => navigate("/bài-viết-của-tôi")}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13.5px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-black/5 dark:border-white/5 transition-colors duration-300 md:hover:bg-stone-200 dark:md:hover:bg-stone-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2.5} /> Bài viết của tôi
        </motion.button>

        {/* Tiêu đề trang */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-800/70 dark:text-amber-400/70 mb-2 ml-1">
            Editor
          </p>
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-amber-950 dark:text-amber-50 font-serif leading-tight">
            {id ? "Chỉnh sửa bài viết" : "Soạn thảo bài viết mới"}
          </h1>
          <p className="text-[13.5px] font-medium text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
            Hệ thống hỗ trợ định dạng Markdown chuẩn. Bạn có thể sử dụng giao diện trực quan hoặc tự gõ cú pháp.
          </p>
        </motion.div>

        {/* Khung cảnh báo (nếu bị từ chối) */}
        <AnimatePresence initial={false}>
          {status === "rejected" && rejectionReason && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl backdrop-blur-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                <div className="flex-1">
                  <p className="text-[12px] font-bold uppercase tracking-wider text-red-700/80 dark:text-red-400/80 mb-1 ml-0.5">
                    Đã bị từ chối duyệt
                  </p>
                  <div className="text-[13.5px] font-medium text-red-950 dark:text-red-50 leading-relaxed ml-0.5">
                    {rejectionReason}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-5 sm:gap-6 bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl border border-amber-900/10 dark:border-amber-100/10 rounded-[28px] p-6 sm:p-8 shadow-sm"
        >
          
          {/* Nhập tiêu đề */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1 mb-1.5 block">Tiêu đề bài viết</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
              placeholder="VD: Cảm nhận sau thánh lễ Giáng Sinh..."
              className="w-full rounded-xl border border-amber-900/20 dark:border-amber-100/10 bg-white/60 dark:bg-stone-900/40 px-4 py-3.5 text-[14.5px] font-bold text-amber-950 dark:text-amber-50 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-900/30 dark:focus:ring-amber-500/30 focus:border-amber-500 transition-all shadow-inner backdrop-blur-sm"
            />
          </div>

          {/* Chuyên mục & Ảnh bìa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1 mb-1.5 block">Chuyên mục</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="VD: Chia sẻ, Sự kiện..."
                className="w-full rounded-xl border border-amber-900/20 dark:border-amber-100/10 bg-white/60 dark:bg-stone-900/40 px-4 py-3 text-[14px] font-medium text-amber-950 dark:text-amber-50 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-900/30 dark:focus:ring-amber-500/30 focus:border-amber-500 transition-all shadow-inner backdrop-blur-sm"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1 mb-1.5 block">Ảnh bìa (Liên kết URL)</label>
              <input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://imgur.com/your-image.jpg"
                className="w-full rounded-xl border border-amber-900/20 dark:border-amber-100/10 bg-white/60 dark:bg-stone-900/40 px-4 py-3 text-[14px] font-medium text-amber-950 dark:text-amber-50 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-900/30 dark:focus:ring-amber-500/30 focus:border-amber-500 transition-all shadow-inner backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Tóm tắt bài viết */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1 mb-1.5 block">Tóm tắt ngắn</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value.slice(0, MAX_SUMMARY))}
              rows={2}
              placeholder="Hiển thị tại trang danh sách chính thay cho nội dung..."
              className="w-full rounded-xl border border-amber-900/20 dark:border-amber-100/10 bg-white/60 dark:bg-stone-900/40 px-4 py-3 text-[14px] font-medium text-amber-950 dark:text-amber-50 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-900/30 dark:focus:ring-amber-500/30 focus:border-amber-500 transition-all shadow-inner backdrop-blur-sm resize-none"
            />
            <div className="flex justify-end text-[11px] font-bold text-stone-400 dark:text-stone-500 mt-1.5 mr-1">
              {summary.length}/{MAX_SUMMARY} ký tự
            </div>
          </div>

          {/* Nội dung soạn thảo */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1 mb-1.5 block">Nội dung bài viết</label>
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-amber-900/10 dark:border-amber-100/10 pb-3 mb-4">
              {/* Tab điều hướng */}
              <div className="flex w-full items-center gap-1.5 bg-stone-100/80 dark:bg-stone-900/60 p-1 rounded-xl border border-black/5 dark:border-white/5">
                {/* Nút Soạn thảo */}
                <button 
                  type="button" 
                  onClick={() => setTab("edit")}
                  className={`relative flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-[12.5px] font-bold transition-colors duration-300 active:scale-[0.97] ${
                    tab === "edit" 
                      ? "text-amber-50 dark:text-white" 
                      : "text-stone-500 dark:text-stone-400 md:hover:text-stone-800 dark:md:hover:text-stone-200"
                  }`}
                >
                  {tab === "edit" && (
                    <motion.div
                      layoutId="active-tab-bg"
                      className="absolute inset-0 bg-amber-900 dark:bg-amber-600 rounded-lg shadow-sm -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Pencil className="w-3.5 h-3.5 relative z-10" /> 
                  <span className="relative z-10">Soạn thảo</span>
                </button>
                
                {/* Nút Xem trước */}
                <button 
                  type="button" 
                  onClick={() => setTab("preview")}
                  className={`relative flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-[12.5px] font-bold transition-colors duration-300 active:scale-[0.97] ${
                    tab === "preview" 
                      ? "text-white dark:text-stone-900" 
                      : "text-stone-500 dark:text-stone-400 md:hover:text-stone-800 dark:md:hover:text-stone-200"
                  }`}
                >
                  {tab === "preview" && (
                    <motion.div
                      layoutId="active-tab-bg"
                      className="absolute inset-0 bg-stone-900 dark:bg-white rounded-lg shadow-sm -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Eye className="w-3.5 h-3.5 relative z-10" /> 
                  <span className="relative z-10">Xem trước</span>
                </button>
              </div>

              {/* Helper Bar */}
              {tab === "edit" && (
                <div className="flex flex-wrap items-center gap-1 bg-stone-100/80 dark:bg-stone-900/60 p-1 rounded-xl border border-black/5 dark:border-white/5">
                  {toolbarButtons.map(({ syntax, title, Icon }) => (
                    <motion.button
                      key={syntax}
                      type="button"
                      onClick={() => insertMarkdown(syntax)}
                      whileTap={{ scale: 0.85 }}
                      className="p-2 rounded-lg text-stone-600 dark:text-stone-300 md:hover:bg-white dark:md:hover:bg-stone-700 hover:shadow-sm transition-colors"
                      title={title}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {tab === "edit" ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="relative"
                >
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={16}
                    placeholder="Bắt đầu soạn thảo ở đây... Hệ thống tự động nhận diện cú pháp Markdown."
                    className="w-full rounded-xl border border-amber-900/20 dark:border-amber-100/10 bg-white/60 dark:bg-stone-900/40 px-4 py-4 text-[14.5px] font-medium leading-relaxed text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-900/30 dark:focus:ring-amber-500/30 focus:border-amber-500 transition-all shadow-inner backdrop-blur-sm resize-y"
                    data-lenis-prevent
                  />
                  <div className="flex justify-end text-[11px] font-bold text-stone-400 dark:text-stone-500 mt-2 mr-1">
                    TỔNG CỘNG: {wordCount} TỪ · {charCount} KÝ TỰ
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="prose prose-stone prose-sm sm:prose-base max-w-none dark:prose-invert rounded-[20px] bg-white/60 dark:bg-stone-900/40 border border-amber-900/10 dark:border-amber-100/10 shadow-inner px-6 py-6 min-h-[380px] overflow-y-auto font-medium"
                >
                  {content.trim() ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{content}</ReactMarkdown>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-stone-400 py-24">
                      <Eye className="w-8 h-8 mb-3 opacity-50" />
                      <p className="text-[13px] font-bold">Trống! Chưa có nội dung nào.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-amber-900/10 dark:border-amber-100/10 mt-3">
            <motion.button 
              type="button" 
              onClick={handleSaveDraft} 
              disabled={saving}
              whileTap={{ scale: 0.98 }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-black/5 dark:border-white/5 transition-colors duration-300 md:hover:bg-stone-200 dark:md:hover:bg-stone-700 disabled:opacity-50"
            >
              {saving ? "Đang xử lý..." : "Lưu bản nháp"}
            </motion.button>
            <motion.button 
              type="button" 
              onClick={handleSubmitForReview} 
              disabled={saving}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-sm transition-shadow duration-300 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" strokeWidth={2.5} />}
              Gửi kiểm duyệt
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}