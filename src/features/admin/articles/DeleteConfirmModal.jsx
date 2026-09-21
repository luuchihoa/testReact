import React, { useState } from "react";
import { AlertTriangle, Loader2, Trash2, AlertCircle } from "lucide-react";
import { ArticleAdminDialog } from "./ArticleAdminDialog.jsx";
import { getAuthorDisplayName, getArticleStatusMeta, validateModerationReason, MIN_MODERATION_REASON_LENGTH } from "./format.js";

const REQUIRED_CONFIRM_KEYWORD = "XÓA";

function DeleteConfirmModalContent({ article, busy = false, onClose, onConfirm }) {
  const [confirmInput, setConfirmInput] = useState("");
  const [reason, setReason] = useState("");
  const [validationError, setValidationError] = useState(/** @type {string | null} */ (null));

  const authorName = getAuthorDisplayName(article.author, article.author_username);
  const statusMeta = getArticleStatusMeta(article.status);
  const isKeywordMatched = confirmInput.trim().toUpperCase() === REQUIRED_CONFIRM_KEYWORD;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isKeywordMatched) {
      setValidationError(`Vui lòng nhập chính xác chữ "${REQUIRED_CONFIRM_KEYWORD}" để xác nhận xóa.`);
      return;
    }

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
      {/* Header Cảnh báo Đỏ */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
          <AlertTriangle className="w-6 h-6" strokeWidth={2.2} />
        </div>
        <div>
          <h3
            id="delete-modal-title"
            className="text-lg sm:text-xl font-bold text-red-700 dark:text-red-400 leading-snug"
          >
            Xóa vĩnh viễn bài viết này?
          </h3>
          <p
            id="delete-modal-desc"
            className="text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac] mt-1"
          >
            Hành động này <strong className="text-red-700 dark:text-red-400">không thể hoàn tác</strong>. Dữ liệu bài viết sẽ bị xóa khỏi hệ thống và lưu vết kiểm duyệt.
          </p>
        </div>
      </div>

      {/* Thông tin bài viết */}
      <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-xs sm:text-sm space-y-2">
        <div>
          <span className="text-[#575e55] dark:text-[#b0b9ac] font-medium">Tiêu đề: </span>
          <span className="font-bold text-[#293d32] dark:text-[#ecece0] break-words">{article.title}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div>
            <span className="text-[#575e55] dark:text-[#b0b9ac] font-medium">Tác giả: </span>
            <span className="font-semibold text-[#293d32] dark:text-[#ecece0]">{authorName}</span>
          </div>
          <div>
            <span className="text-[#575e55] dark:text-[#b0b9ac] font-medium">Trạng thái: </span>
            <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold border ${statusMeta.badgeClass}`}>
              {statusMeta.label}
            </span>
          </div>
        </div>
      </div>

      {/* Nhập từ khóa xác nhận */}
      <div className="space-y-1.5">
        <label
          htmlFor="delete-confirm-keyword"
          className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0]"
        >
          Nhập chữ <span className="font-mono text-red-700 dark:text-red-400 font-extrabold">{REQUIRED_CONFIRM_KEYWORD}</span> để xác nhận:
        </label>
        <input
          id="delete-confirm-keyword"
          type="text"
          value={confirmInput}
          onChange={(e) => {
            setConfirmInput(e.target.value);
            if (validationError) setValidationError(null);
          }}
          disabled={busy}
          placeholder={`Gõ "${REQUIRED_CONFIRM_KEYWORD}"`}
          autoComplete="off"
          className="w-full px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm rounded-xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-[#293d32] dark:text-[#ecece0] outline-none focus:ring-2 focus:ring-red-500 font-mono"
        />
      </div>

      {/* Nhập lý do xóa bài */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="delete-reason-input"
            className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0]"
          >
            Lý do xóa bài (ghi vết kiểm duyệt) <span className="text-red-600 dark:text-red-400">*</span>
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
          id="delete-reason-input"
          rows={2}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (validationError) setValidationError(null);
          }}
          disabled={busy}
          placeholder="Ghi rõ lý do xóa bài để phục vụ kiểm tra và tra soát lịch sử..."
          className={`w-full p-3 text-xs sm:text-sm rounded-xl bg-[#fffefa] dark:bg-[#1e2821] border transition-colors outline-none focus:ring-2 focus:ring-red-500 text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 dark:placeholder-[#b0b9ac]/60 resize-none ${
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
          disabled={busy || !isKeywordMatched || reason.trim().length < MIN_MODERATION_REASON_LENGTH}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs sm:text-sm font-bold shadow-xs active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
        >
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang xóa bài viết...</span>
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              <span>Xác nhận xóa vĩnh viễn</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/**
 * Modal xác nhận xóa vĩnh viễn bài viết (2-Step Destructive Deletion)
 * Chỉ áp dụng cho bài viết ở trạng thái `rejected` hoặc `unpublished`.
 *
 * @param {{
 *   article: import("./useArticleQueue.js").Article | null,
 *   isOpen: boolean,
 *   busy?: boolean,
 *   onClose: () => void,
 *   onConfirm: (reason: string) => Promise<void> | void
 * }} props
 */
export function DeleteConfirmModal({ article, isOpen, busy = false, onClose, onConfirm }) {
  if (!isOpen || !article) return null;

  return (
    <ArticleAdminDialog
      isOpen={isOpen}
      onClose={onClose}
      busy={busy}
      titleId="delete-modal-title"
      descriptionId="delete-modal-desc"
      maxWidthClass="max-w-lg"
    >
      <DeleteConfirmModalContent
        article={article}
        busy={busy}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </ArticleAdminDialog>
  );
}
