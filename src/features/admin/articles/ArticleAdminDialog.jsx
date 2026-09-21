import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * ArticleAdminDialog
 *
 * Component Dialog nền tảng dùng chung cho toàn bộ các modal quản trị bài viết.
 * Đảm bảo 100% khả năng tiếp cận (Accessibility), bẫy focus bàn phím, xử lý phím Escape,
 * khóa cuộn trang nền, khôi phục focus khi đóng và khóa tương tác khi đang xử lý (busy).
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   busy?: boolean,
 *   titleId: string,
 *   descriptionId?: string,
 *   maxWidthClass?: string,
 *   children: React.ReactNode
 * }} props
 */
export function ArticleAdminDialog({
  isOpen,
  onClose,
  busy = false,
  titleId,
  descriptionId,
  maxWidthClass = "max-w-lg",
  children,
}) {
  const dialogRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Lưu lại phần tử đang focus trước khi mở modal để khôi phục khi đóng
    previouslyFocusedRef.current = document.activeElement;

    // Khóa cuộn trang nền
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus tự động vào phần tử đầu tiên hợp lệ trong dialog
    const timer = setTimeout(() => {
      if (!dialogRef.current) return;
      const focusableElements = dialogRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        // Ưu tiên focus vào input/textarea hoặc nút đầu tiên
        const primaryTarget =
          dialogRef.current.querySelector("textarea, input:not([type=hidden])") ||
          focusableElements[0];
        primaryTarget?.focus();
      }
    }, 50);

    // Xử lý phím tắt: Escape và Focus Trap bàn phím
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (!busy) {
          e.preventDefault();
          onClose();
        }
        return;
      }

      if (e.key === "Tab") {
        if (!dialogRef.current) return;
        const focusables = Array.from(
          dialogRef.current.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null);

        if (focusables.length === 0) return;

        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocusedRef.current?.focus) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [isOpen, busy, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      {/* Backdrop mờ nền */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => !busy && onClose()}
        aria-hidden="true"
      />

      {/* Nội dung Dialog */}
      <div
        ref={dialogRef}
        data-lenis-prevent
        className={`relative w-full ${maxWidthClass} max-h-[90dvh] overflow-y-auto bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-3xl shadow-2xl p-5 sm:p-7 flex flex-col gap-5 z-10 animate-in fade-in zoom-in-95 duration-150`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
