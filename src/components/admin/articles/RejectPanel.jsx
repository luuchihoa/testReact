import React, { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";

export const MIN_REASON_LENGTH = 5;

/**
 * @param {{ busy: boolean, onCancel: () => void, onConfirm: (reason: string) => void }} props
 */
export function RejectPanel({ busy, onCancel, onConfirm }) {
  const [reason, setReason] = useState("");
  const trimmedLength = reason.trim().length;
  const isValid = trimmedLength >= MIN_REASON_LENGTH;

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") onCancel();
  }, [onCancel]);

  const handleConfirm = useCallback(() => {
    if (isValid) onConfirm(reason.trim());
  }, [isValid, onConfirm, reason]);

  return (
    <div onKeyDown={handleKeyDown}>
      <label htmlFor="reject-reason" className="text-[12px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70">
        Lý do từ chối (gửi cho tác giả)
      </label>
      <textarea
        id="reject-reason"
        autoFocus
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        placeholder="VD: Cần bổ sung nguồn tham khảo, chỉnh lại văn phong…"
        className="mt-2 w-full rounded-xl border border-amber-900/20 dark:border-amber-100/20 px-4 py-3 text-[14px] font-medium bg-white/80 dark:bg-stone-900/60 text-amber-950 dark:text-amber-50 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none transition-shadow"
      />
      <p className={`mt-1.5 text-[11.5px] font-medium ${isValid ? "text-stone-400 dark:text-stone-500" : "text-amber-700/80 dark:text-amber-400/80"}`}>
        {trimmedLength}/{MIN_REASON_LENGTH} ký tự tối thiểu
      </p>
      <div className="flex gap-2.5 mt-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-[14px] font-bold text-stone-600 dark:text-stone-300 transition-all active:scale-[0.97] md:hover:bg-stone-200 dark:md:hover:bg-stone-700"
        >
          Huỷ
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!isValid || busy}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white text-[14px] font-bold transition-all active:scale-[0.98] md:hover:bg-red-700 disabled:opacity-50 disabled:active:scale-100"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Xác nhận từ chối"}
        </button>
      </div>
    </div>
  );
}