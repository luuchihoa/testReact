import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "../../lib/supabase.js";
import { Loader2, CalendarDays, User, ArrowLeft } from "lucide-react";

function formatDateVi(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setNotFound(false);

      // RLS chỉ cho đọc bài published (public) hoặc bài của chính tác giả/admin,
      // nên không cần lọc thêm status ở đây — nếu không có quyền, data sẽ rỗng.
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        console.error("ArticleDetail: fetch error:", error);
      }
      if (!data) {
        setNotFound(true);
      } else {
        setArticle(data);
      }
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-stone-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Đang tải…
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center px-6">
        <p className="text-lg font-bold text-stone-800">Không tìm thấy bài viết</p>
        <p className="text-sm text-stone-400">Bài viết có thể đã bị gỡ hoặc chưa được duyệt.</p>
        <Link to="/bài-viết" className="text-sm font-semibold text-amber-700 hover:underline">
          ← Quay lại danh sách bài viết
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link to="/bài-viết" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-stone-500 md:hover:text-stone-800 mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Tất cả bài viết
        </Link>

        {article.category && (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
            {article.category}
          </span>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mt-2 mb-3">
          {article.title}
        </h1>
        <div className="flex items-center gap-4 text-[13px] text-stone-400 mb-8">
          <span className="inline-flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {article.author_username}</span>
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {formatDateVi(article.published_at || article.updated_at)}</span>
        </div>

        {article.cover_image && (
          <img src={article.cover_image} alt={article.title} className="w-full rounded-2xl mb-8 object-cover max-h-[420px]" />
        )}

        {/*
          skipHtml=true: KHÔNG render thẻ HTML thô nhúng trong markdown -> chặn XSS
          (vd <script>, <img onerror=...>). Chỉ cú pháp markdown chuẩn được render.
        */}
        <div className="prose prose-stone prose-sm sm:prose-base max-w-none prose-headings:font-bold prose-a:text-amber-700">
          <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
            {article.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}