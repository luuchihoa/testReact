import React, { useState } from "react";
import { AlertCircle, Loader2, EyeOff } from "lucide-react";
import { ArticleAdminDialog } from "./ArticleAdminDialog.jsx";
import { getAuthorDisplayName, formatDateVi, validateModerationReason, MIN_MODERATION_REASON_LENGTH } from "./format.js";

function UnpublishModalContent({ article, busy = false, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [validationError, setValidationError] = useState(/** @type {string | null} */ (null));

  const authorName = getAuthorDisplayName(article.author, article.author_username);
  const fullPublishedDate = formatDateVi(article.published_at);

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = validateModerationReason(reason, MIN_MODERATION_REASON_LENGTH);
    if (!result.valid) {
      setValidationError(result.error);
      return;
    }
    setValidationError(null);
    onConfirm(result.trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Header Dialog */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-orange-700 dark:text-orange-400 shrink-0">
          <EyeOff className="w-6 h-6" strokeWidth={2.2} />
        </div>
        <div>
          <h3
            id="unpublish-modal-title"
            className="text-lg sm:text-xl font-bold text-[#293d32] dark:text-[#ecece0] leading-snug"
          >
            Gỡ bài viết khỏi trang công khai?
          </h3>
          <p
            id="unpublish-modal-desc"
            className="text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac] mt-1"
          >
            Bài viết sẽ lập tức ẩn khỏi trang đọc công khai. Tác giả sẽ nhận được thông báo kèm lý do gỡ bài để chỉnh sửa lại.
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
          {fullPublishedDate && (
            <div>
              <span className="text-[#575e55] dark:text-[#b0b9ac] font-medium">Đã đăng lúc: </span>
              <span className="font-medium text-[#293d32] dark:text-[#ecece0] tabular-nums">{fullPublishedDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Nhập lý do gỡ bài */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="unpublish-reason-input"
            className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0]"
          >
            Lý do gỡ bài <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <span
            className={`text-[0.6875rem] tabular-nums ${
              reason.trim().length >= MIN_MODERATION_REASON_LENGTH
                ? "text-emerald-700 dark:text-emerald-400 font-semibold"
                : "text-[#575e55] dark:text-[#b0b9ac]"
            }`}
          >
            {reason.trim().length}/{MIN_MODERATION_REASON_LENGTH} ký tự tối thiểu
          </span>
        </div>

        <textarea
          id="unpublish-reason-input"
          rows={3}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (validationError) setValidationError(null);
          }}
          disabled={busy}
          placeholder="Ví dụ: Cần điều chỉnh lại thông tin ngày tổ chức hoặc hình ảnh chưa có bản quyền..."
          className={`w-full p-3 text-xs sm:text-sm rounded-xl bg-[#fffefa] dark:bg-[#1e2821] border transition-colors outline-none focus:ring-2 focus:ring-orange-500 text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 dark:placeholder-[#b0b9ac]/60 resize-none ${
            validationError
              ? "border-red-500 dark:border-red-500"
              : "border-[#dedfd4] dark:border-[#354237]"
          }`}
        />

        {validationError && (
          <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </div>

      {/* Nút thao tác */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] rounded-xl bg-[#faf8f3] dark:bg-[#25332a] border border-[#dedfd4] dark:border-[#354237] text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] hover:bg-[#dedfd4]/40 dark:hover:bg-[#354237]/40 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={busy || reason.trim().length < MIN_MODERATION_REASON_LENGTH}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl bg-orange-700 hover:bg-orange-800 text-white text-xs sm:text-sm font-bold shadow-xs active:scale-[0.98] disabled:opacity-50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2"
        >
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang xử lý gỡ bài...</span>
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4" />
              <span>Xác nhận gỡ bài</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/**
 * Modal gỡ bài viết đã xuất bản khỏi trang công khai
 *
 * @param {{
 *   article: import("./useArticleQueue.js").Article | null,
 *   isOpen: boolean,
 *   busy?: boolean,
 *   onClose: () => void,
 *   onConfirm: (reason: string) => Promise<void> | void
 * }} props
 */
export function UnpublishModal({ article, isOpen, busy = false, onClose, onConfirm }) {
  if (!isOpen || !article) return null;

  return (
    <ArticleAdminDialog
      isOpen={isOpen}
      onClose={onClose}
      busy={busy}
      titleId="unpublish-modal-title"
      descriptionId="unpublish-modal-desc"
      maxWidthClass="max-w-lg"
    >
      <UnpublishModalContent
        article={article}
        busy={busy}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </ArticleAdminDialog>
  );
}
