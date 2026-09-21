import React, { useState, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";

export const MIN_REASON_LENGTH = 5;

export function RejectPanel({ busy, onCancel, onConfirm, initialDraft = "" }) {
  const [reason, setReason] = useState(initialDraft);
  const trimmedLength = reason.trim().length;
  const isValid = trimmedLength >= MIN_REASON_LENGTH;

  const handleConfirm = useCallback(() => {
    if (isValid && !busy) {
      onConfirm(reason.trim());
    }
  }, [isValid, busy, onConfirm, reason]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleConfirm();
      }
    },
    [onCancel, handleConfirm]
  );

  return (
    <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50">
      <div className="flex items-center justify-between">
        <label
          htmlFor="reject-reason"
          className="text-xs font-bold uppercase tracking-wider text-red-900 dark:text-red-300"
        >
          Lý do từ chối bài viết (gửi thông báo cho tác giả)
        </label>
        <span className="text-[0.6875rem] font-medium text-[#575e55] dark:text-[#b0b9ac]">
          Nhấn <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[0.625rem]">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[0.625rem]">Enter</kbd> để gửi
        </span>
      </div>

      <textarea
        id="reject-reason"
        autoFocus
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        aria-invalid={!isValid && trimmedLength > 0 ? "true" : "false"}
        aria-describedby="reject-reason-desc"
        placeholder="VD: Cần bổ sung nguồn tham khảo phụng vụ, chuẩn hóa danh xưng Giáo lý viên…"
        className="w-full rounded-xl border border-red-300 dark:border-red-800/80 px-3.5 py-2.5 text-sm font-medium bg-[#fffefa] dark:bg-[#1e2821] text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all"
      />

      <div id="reject-reason-desc" className="flex items-center justify-between text-xs font-medium">
        <span
          className={
            isValid
              ? "text-[#575e55] dark:text-[#b0b9ac]"
              : "text-amber-800 dark:text-amber-300 inline-flex items-center gap-1"
          }
        >
          {!isValid && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
          {trimmedLength}/{MIN_REASON_LENGTH} ký tự tối thiểu
        </span>

        <span className="text-[0.6875rem] text-[#575e55] dark:text-[#b0b9ac]">
          Phím Escape để hủy
        </span>
      </div>

      <div className="flex items-center gap-2.5 mt-1 pt-2 border-t border-red-200/60 dark:border-red-900/40">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="px-4 py-2.5 min-h-[44px] rounded-xl bg-[#faf8f3] dark:bg-[#25332a] border border-[#dedfd4] dark:border-[#354237] text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] hover:bg-[#dedfd4]/40 dark:hover:bg-[#354237]/40 active:scale-[0.98] transition-all"
        >
          Hủy bỏ
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!isValid || busy}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-red-700 text-white text-xs sm:text-sm font-bold shadow-xs hover:bg-red-800 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
        >
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang gửi từ chối...</span>
            </>
          ) : (
            <span>Xác nhận từ chối</span>
          )}
        </button>
      </div>
    </div>
  );
}