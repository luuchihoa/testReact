/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion as Motion, useDragControls } from "framer-motion";
import { 
  X, History, Clock, User, AlertCircle, RefreshCw, 
  ArrowRight, FileEdit, PlusCircle, CheckCircle2, MessageSquare
} from "lucide-react";
import { fetchStudentGradeAuditLogs } from "../../features/teacher/api.js";
import { 
  formatAuditDateTime, 
  mergeAuditWithAllFields, 
  formatActorDisplay 
} from "../../features/teacher/gradeAuditUtils.js";

/**
 * Modal hiển thị đối soát lịch sử sửa điểm theo từng cột (Per-column Latest-Change Audit)
 * Dùng chung cho cả Giáo lý viên và Ban Quản trị.
 * Không lưu/hiển thị Điểm Trung Bình (vì ĐTB tự tính toán).
 * Tuân thủ WCAG AAA, 100% REM scale, Safe Area iOS và Accessible Focus Management.
 */
export default function GradeAuditModal({
  open,
  student,
  namHoc,
  hocKy,
  onClose,
  isAdminViewer = false,
}) {
  const [columnsList, setColumnsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const dragControls = useDragControls();

  const studentUsername = student?.username;
  const hocKyInt = Number(hocKy) || 1;

  // Tải dữ liệu lịch sử đối soát từng cột
  const loadAuditLogs = useCallback(async () => {
    if (!studentUsername || !namHoc) return;
    setLoading(true);
    setError(null);

    try {
      const data = await fetchStudentGradeAuditLogs(
        studentUsername,
        namHoc,
        hocKyInt
      );

      const fetchedLogs = Array.isArray(data) ? data : [];
      const merged = mergeAuditWithAllFields(fetchedLogs);
      setColumnsList(merged);
    } catch (err) {
      console.error("fetchStudentGradeAuditLogs error:", err);
      setError(err.message || "Không thể tải lịch sử sửa điểm");
    } finally {
      setLoading(false);
    }
  }, [studentUsername, namHoc, hocKyInt]);

  // Quản lý mở modal & tải dữ liệu ban đầu
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement;
      loadAuditLogs();
    } else {
      setColumnsList([]);
      setError(null);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
        previousFocusRef.current.focus();
      }
    }
  }, [open, loadAuditLogs]);

  // Xử lý phím Escape và Focus Trap
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements.length) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const modifiedCount = columnsList.filter((col) => col.isModified).length;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="grade-audit-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Motion.div
        ref={modalRef}
        drag="y"
        dragListener={false}
        dragControls={dragControls}
        dragDirectionLock
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_e, info) => {
          if (info.offset.y > 80 || info.velocity.y > 400) {
            onClose();
          }
        }}
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.98 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col bg-[#fffefa] dark:bg-[#1e2821] rounded-t-3xl sm:rounded-2xl border border-[#dedfd4] dark:border-[#354237] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- MOBILE PULL TAB BAR (Cử chỉ kéo vuốt đóng Sheet) --- */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="flex justify-center pt-3 pb-1 sm:hidden shrink-0 touch-none cursor-grab active:cursor-grabbing"
          aria-hidden="true"
        >
          <div className="w-12 h-1.5 rounded-full bg-[#dedfd4] dark:bg-[#354237]" />
        </div>

        {/* --- HEADER --- */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-full border border-[#dedfd4] dark:border-[#354237] bg-stone-100 dark:bg-stone-800 shrink-0 overflow-hidden shadow-2xs">
              <img
                src={student?.avatar || "/images/avatarDefault.avif"}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="grade-audit-modal-title"
                  className="text-sm sm:text-base font-bold text-[#19251d] dark:text-[#ffffff] truncate"
                >
                  {student?.tenThanh && (
                    <span className="text-[#7c5c2d] dark:text-[#d4b47d] font-serif font-bold mr-1.5">
                      {student.tenThanh}
                    </span>
                  )}
                  {student?.hoTen || student?.username}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border border-[#314e3e]/30 bg-[#314e3e]/10 text-[#19251d] dark:border-[#d6b883]/40 dark:bg-[#d6b883]/15 dark:text-[#ffffff] shrink-0">
                  HK{hocKyInt} • {namHoc}
                </span>
              </div>
              <p className="text-xs text-[#3c453e] dark:text-[#d6dcd3] flex items-center gap-1 mt-0.5 font-medium flex-wrap">
                <span className="inline-flex items-center gap-1 shrink-0">
                  <History className="w-3.5 h-3.5 text-[#7c5c2d] dark:text-[#d4b47d] shrink-0" aria-hidden="true" />
                  <span>Đối soát:</span>
                </span>
                {modifiedCount > 0 ? (
                  <span className="text-[#314e3e] dark:text-[#d6b883] font-bold">({modifiedCount}/6 cột đã sửa)</span>
                ) : (
                  <span className="text-[#3c453e] dark:text-[#d6dcd3]">(Chưa có chỉnh sửa)</span>
                )}
              </p>
            </div>
          </div>

          {/* Nút X chỉ hiển thị trên desktop (sm trở lên), mobile đóng bằng cử chỉ kéo vuốt hoặc nút Đóng ở chân modal */}
          <button
            type="button"
            onClick={onClose}
            className="hidden sm:flex w-11 h-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 text-[#3c453e] dark:text-[#d6dcd3] hover:text-[#19251d] dark:hover:text-[#ffffff] transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Đóng cửa sổ lịch sử sửa điểm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- SCROLLABLE COLUMNS LIST BODY --- */}
        <div
          className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-2.5 sm:space-y-3"
          data-lenis-prevent
          aria-live="polite"
        >
          {loading ? (
            /* SKELETON LOADING STATE */
            <div className="space-y-3 py-1" aria-busy="true" aria-label="Đang tải lịch sử...">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3]/50 dark:bg-[#151c18]/50 animate-pulse space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-1/4" />
                    <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-1/5" />
                  </div>
                  <div className="h-4 bg-stone-200/80 dark:bg-stone-700/80 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            /* ERROR STATE WITH RETRY */
            <div className="py-8 px-4 text-center space-y-3 bg-red-500/10 dark:bg-red-950/30 rounded-2xl border border-red-600/30">
              <AlertCircle className="w-8 h-8 text-red-700 dark:text-red-400 mx-auto" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-[#7f1d1d] dark:text-[#fca5a5]">
                  Không thể tải nhật ký sửa điểm
                </p>
                <p className="text-xs text-[#3c453e] dark:text-[#d6dcd3] mt-1">{error}</p>
              </div>
              <button
                type="button"
                onClick={loadAuditLogs}
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-xl bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] text-xs font-bold shadow-xs hover:opacity-90 transition-opacity cursor-pointer mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Thử lại</span>
              </button>
            </div>
          ) : (
            /* COLUMNS LIST (6 AUDITABLE FIELDS) */
            <div className="space-y-2.5 sm:space-y-3">
              {columnsList.map((col) => {
                const isTextField = col.field === "ghi_chu" || col.type === "text";

                if (!col.isModified) {
                  return (
                    <div
                      key={col.field}
                      className="p-3 sm:p-3.5 rounded-xl border border-dashed border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3]/40 dark:bg-[#151c18]/40 flex items-center justify-between gap-2"
                      aria-label={`${col.fullLabel}: Chưa có ghi nhận chỉnh sửa nào`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-stone-200/80 dark:bg-stone-800 flex items-center justify-center text-xs font-bold text-[#3c453e] dark:text-[#d6dcd3] shrink-0 border border-[#dedfd4] dark:border-[#354237]">
                          <CheckCircle2 className="w-4 h-4 opacity-50" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#19251d] dark:text-[#ffffff] truncate">
                            {col.fullLabel}
                          </h3>
                          <p className="text-xs text-[#3c453e] dark:text-[#d6dcd3]">
                            Chưa có ghi nhận chỉnh sửa nào
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#3c453e] dark:text-[#d6dcd3] bg-[#fffefa] dark:bg-[#1e2821] px-2.5 py-1 rounded-lg border border-[#dedfd4] dark:border-[#354237] shrink-0">
                        Chưa sửa
                      </span>
                    </div>
                  );
                }

                const isInsert = col.operation === "insert" || col.oldValue === null;
                const formattedTime = formatAuditDateTime(col.changedAt);
                const actorDisplay = formatActorDisplay(col, isAdminViewer);
                const isPositive = col.diffText && col.diffText.startsWith("+");
                const isNegative = col.diffText && col.diffText.startsWith("-");

                // Mô tả tiếp cận chi tiết cho Screen Reader
                const a11yDescription = isTextField
                  ? `${col.fullLabel}: ${col.diffText}. Do ${actorDisplay} thực hiện lúc ${formattedTime}. Nội dung mới: ${col.newValue || "Trống"}`
                  : `${col.fullLabel}: từ ${col.oldValue || "trống"} đổi thành ${col.newValue}, chênh lệch ${col.diffText}. Do ${actorDisplay} thực hiện lúc ${formattedTime}`;

                return (
                  <div
                    key={col.field}
                    className="p-3.5 sm:p-4 rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3]/70 dark:bg-[#151c18]/70 space-y-2.5 transition-colors hover:border-[#314e3e]/40 dark:hover:border-[#d6b883]/40 shadow-2xs"
                    aria-label={a11yDescription}
                  >
                    {/* Top Row: Column Name, Operation Tag, Old -> New Value, Diff Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#19251d] dark:text-[#ffffff]">
                          {col.fullLabel}
                        </span>
                        {isInsert ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-500/15 text-[#064e3b] dark:text-[#6ee7b7] border border-emerald-600/30">
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Nhập mới</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-amber-500/15 text-[#713f12] dark:text-[#fde047] border border-amber-600/30">
                            <FileEdit className="w-3.5 h-3.5" />
                            <span>Đã sửa</span>
                          </span>
                        )}
                      </div>

                      {/* Hiển thị giá trị đối soát cho CỘT ĐIỂM SỐ */}
                      {!isTextField && (
                        <div className="flex items-center gap-1.5 text-xs font-mono self-start sm:self-auto">
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-[#19251d] dark:text-[#ffffff] shadow-2xs">
                            <span className="text-[#3c453e] dark:text-[#d6dcd3]">
                              {col.oldValue !== null && col.oldValue !== undefined ? col.oldValue : "—"}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#3c453e] dark:text-[#d6dcd3] shrink-0" />
                            <span className="font-bold text-[#314e3e] dark:text-[#d6b883]">{col.newValue}</span>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                              isPositive
                                ? "bg-emerald-500/15 text-[#064e3b] dark:text-[#6ee7b7] border border-emerald-600/30"
                                : isNegative
                                ? "bg-red-500/15 text-[#7f1d1d] dark:text-[#fca5a5] border border-red-600/30"
                                : "bg-[#fffefa] dark:bg-[#1e2821] text-[#19251d] dark:text-[#ffffff] border border-[#dedfd4] dark:border-[#354237]"
                            }`}
                          >
                            {col.diffText}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Hiển thị riêng cho TRƯỜNG GHI CHÚ (Văn bản nhiều dòng Before / After) */}
                    {isTextField && (
                      <div className="space-y-1.5 pt-1">
                        {col.oldValue && (
                          <div className="p-2.5 rounded-lg bg-stone-100/90 dark:bg-stone-800/90 border border-[#dedfd4] dark:border-[#354237] text-xs">
                            <span className="text-[11px] font-bold text-[#3c453e] dark:text-[#d6dcd3] uppercase tracking-wider block mb-1">
                              Nội dung trước:
                            </span>
                            <p className="text-[#3c453e] dark:text-[#d6dcd3] line-through italic break-words">
                              {col.oldValue}
                            </p>
                          </div>
                        )}
                        <div className="p-2.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 border border-amber-600/30 text-xs">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#713f12] dark:text-[#fde047] mb-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{isInsert ? "Nội dung ghi chú:" : "Nội dung mới cập nhật:"}</span>
                          </div>
                          <p className="text-[#19251d] dark:text-[#ffffff] font-medium break-words">
                            {col.newValue || <span className="italic text-[#3c453e] dark:text-[#d6dcd3]">(Đã xóa ghi chú)</span>}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Bottom Row: Editor Actor + Timestamp */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 pt-2 border-t border-[#dedfd4]/80 dark:border-[#354237]/80 text-xs text-[#3c453e] dark:text-[#d6dcd3]">
                      <div className="flex items-center gap-1.5 font-medium text-[#19251d] dark:text-[#ffffff] min-w-0">
                        <User className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d6b883] shrink-0" />
                        <span className="truncate">{actorDisplay}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs shrink-0 text-[#7c5c2d] dark:text-[#d4b47d] font-medium">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{formattedTime}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* --- STICKY BOTTOM ACTION BAR (Thumb Zone trên Mobile & iOS Safe Area) --- */}
        <div className="p-3 sm:p-4 border-t border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] shrink-0 pb-[max(0.75rem,calc(env(safe-area-inset-bottom)+0.25rem))] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 min-h-[44px] rounded-xl bg-stone-200/90 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-[#19251d] dark:text-[#ffffff] text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
          >
            <span>Đóng đối soát</span>
          </button>
        </div>
      </Motion.div>
    </div>,
    document.body
  );
}

