import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Eye } from "lucide-react";
import { ArticlePublicContent } from "../../articles/ArticlePublicContent.jsx";

/**
 * ArticlePreviewModal
 * Modal hiển thị xem trước bài viết với giao diện thật của người đọc.
 * Sử dụng trực tiếp ArticlePublicContent để đảm bảo 100% độ trung thực giao diện.
 */
export function ArticlePreviewModal({ article, isOpen, onClose }) {
  const closeButtonRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);

  // Focus trap & Body Scroll Lock
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElementRef.current = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus close button on open
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocusedElementRef.current && typeof previouslyFocusedElementRef.current.focus === "function") {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen || !article) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150"
        data-lenis-prevent
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#314e3e]/10 dark:bg-[#d6b883]/20 flex items-center justify-center text-[#314e3e] dark:text-[#d6b883]">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="preview-modal-title"
                className="text-sm sm:text-base font-bold text-[#293d32] dark:text-[#ecece0]"
              >
                Xem trước giao diện công khai
              </h2>
              <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] hidden sm:block">
                Mô phỏng chính xác giao diện hiển thị cho bạn đọc trên website
              </p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ xem trước"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-[#575e55] dark:text-[#b0b9ac] hover:text-[#293d32] dark:hover:text-[#ecece0] hover:bg-[#faf8f3] dark:hover:bg-[#25332a] border border-[#dedfd4] dark:border-[#354237] active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Render nội dung thật */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8 bg-[#faf8f3] dark:bg-[#151c18]">
          <div className="max-w-3xl mx-auto">
            <ArticlePublicContent
              article={article}
              isPreview={true}
              titleAs="h2"
              previewBanner="Bản xem trước — bài chưa được đăng công khai"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-5 sm:px-6 py-3 border-t border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#314e3e] dark:bg-[#d6b883] text-[#fffefa] dark:text-[#151c18] text-xs sm:text-sm font-bold shadow-xs hover:opacity-95 active:scale-[0.98] transition-all"
          >
            Đóng xem trước
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
