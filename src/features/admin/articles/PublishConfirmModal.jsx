import React from "react";
import { Check, Loader2 } from "lucide-react";
import { ArticleAdminDialog } from "./ArticleAdminDialog.jsx";
import { getAuthorDisplayName } from "./format.js";

/**
 * Modal xác nhận trước khi duyệt & xuất bản bài viết
 *
 * @param {{
 *   article: import("./useArticleQueue.js").Article | null,
 *   isOpen: boolean,
 *   isPublishing?: boolean,
 *   onClose: () => void,
 *   onConfirm: () => Promise<void> | void
 * }} props
 */
export function PublishConfirmModal({
  article,
  isOpen,
  isPublishing = false,
  onClose,
  onConfirm,
}) {
  if (!article) return null;

  const authorName = getAuthorDisplayName(article.author, article.author_username);

  return (
    <ArticleAdminDialog
      isOpen={isOpen}
      onClose={onClose}
      busy={isPublishing}
      titleId="publish-confirm-title"
      descriptionId="publish-confirm-desc"
      maxWidthClass="max-w-lg"
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#314e3e]/10 dark:bg-[#d6b883]/20 flex items-center justify-center text-[#314e3e] dark:text-[#d6b883] shrink-0">
            <Check className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div>
            <h3
              id="publish-confirm-title"
              className="text-lg sm:text-xl font-bold text-[#293d32] dark:text-[#ecece0] leading-snug"
            >
              Duyệt &amp; Xuất bản bài viết này?
            </h3>
            <p
              id="publish-confirm-desc"
              className="text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac] mt-1"
            >
              Bài viết sẽ lập tức xuất hiện công khai trong mục Bài viết và tác giả sẽ nhận được thông báo chúc mừng.
            </p>
          </div>
        </div>

        {/* Thông tin tóm tắt bài viết */}
        <div className="p-4 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-xs sm:text-sm space-y-2">
          <div>
            <span className="text-[#575e55] dark:text-[#b0b9ac] font-medium">Tiêu đề: </span>
            <span className="font-bold text-[#293d32] dark:text-[#ecece0] break-words">{article.title}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <div>
              <span className="text-[#575e55] dark:text-[#b0b9ac] font-medium">Tác giả: </span>
              <span className="font-semibold text-[#293d32] dark:text-[#ecece0]">{authorName}</span>
            </div>
            {article.category && (
              <div>
                <span className="text-[#575e55] dark:text-[#b0b9ac] font-medium">Chuyên mục: </span>
                <span className="inline-block px-2 py-0.5 rounded-md bg-[#314e3e]/10 dark:bg-[#d6b883]/20 text-[#314e3e] dark:text-[#d6b883] font-bold text-xs uppercase">
                  {article.category}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Hành động */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPublishing}
            className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] rounded-xl bg-[#faf8f3] dark:bg-[#25332a] border border-[#dedfd4] dark:border-[#354237] text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] hover:bg-[#dedfd4]/40 dark:hover:bg-[#354237]/40 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            Tiếp tục kiểm tra
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPublishing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl bg-[#314e3e] dark:bg-[#d6b883] text-[#fffefa] dark:text-[#151c18] text-xs sm:text-sm font-bold shadow-xs hover:opacity-95 active:scale-[0.98] disabled:opacity-50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d6b883] focus-visible:ring-offset-2"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xuất bản...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" strokeWidth={2.5} />
                <span>Đăng bài viết</span>
              </>
            )}
          </button>
        </div>
      </div>
    </ArticleAdminDialog>
  );
}
