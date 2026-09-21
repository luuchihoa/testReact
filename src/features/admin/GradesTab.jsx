import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { useLenis } from "lenis/react";
import {
  School, Search, ChevronLeft, ChevronRight, FileSpreadsheet, FileText, Users, Lock, LockOpen,
  AlertCircle, RefreshCw, AlertTriangle, GraduationCap,
  MapPin, Phone, ArrowUpDown, ArrowUp, ArrowDown, X, Eye, Download,
  ChevronDown, SlidersHorizontal, Check, History
} from "lucide-react";
import GradeAuditModal from "../../components/shared/GradeAuditModal.jsx";
import { useAdminContext } from "./AdminContext.jsx";
import { AVATAR_FALLBACK, handleAvatarError } from "./constants.js";
import {
  fetchClassRoster, fetchGradesMap, fetchClassAcademicSummary,
  lockTerm, unlockTerm, fetchTermLocks
} from "./dataLayer.js";
import { CardsGridSkeleton, TableSkeleton, Spinner } from "../../components/ui/Skeleton.jsx";
import {
  HK_INT_MAP, GRADE_FIELDS, sortStudentsByTen,
  getGradeTheme, computeClassStats, sortGradeRows, getStudentRowStatus
} from "./gradeUtils.js";
import { preloadXLSX, getXLSX, triggerSafeExcelDownload } from "./utils/excelRosterHelper.js";
import { preloadPDFLibs, exportGradesReportPdf, triggerSafePdfDownload } from "./utils/pdfExportHelper.js";
import { SECTORS_DATA } from "../../data/sectorsData.js";
import { getKhoiStyle, detectKhoiByLop, getKhoiLabel, getScheduleInfoForClass } from "./ClassesTab.jsx";

const HOC_KY_LABELS = { HK1: "Học Kỳ I", HK2: "Học Kỳ II" };

// Danh mục Lọc 6 Khối Giáo lý chuẩn tại Ban Giáo lý An Ngãi
const KHOI_FILTERS = [
  { id: "all", label: "Tất cả lớp", shortLabel: "Tất cả", icon: GraduationCap },
  ...SECTORS_DATA.map((s) => ({
    id: s.id,
    label: s.label,
    shortLabel: s.shortLabel,
    icon: s.icon,
    color: s.color,
  })),
];

/* ============================================================
   SKELETON CHO DANH SÁCH THẺ HỌC SINH (MOBILE CARD SKELETON)
   ============================================================ */
function StudentCardSkeleton({ count = 4 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-2xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] shadow-2xs flex flex-col gap-2.5 animate-pulse"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-5 h-4 bg-stone-200 dark:bg-stone-700 rounded" />
              <div className="w-36 h-4 bg-stone-200 dark:bg-stone-700 rounded" />
            </div>
            <div className="w-16 h-6 bg-stone-200 dark:bg-stone-700 rounded-lg" />
          </div>
          <div className="pt-2 border-t border-[#dedfd4]/60 dark:border-[#354237]/60 flex items-center justify-between">
            <div className="w-32 h-3.5 bg-stone-100 dark:bg-stone-800 rounded" />
            <div className="w-28 h-3.5 bg-stone-100 dark:bg-stone-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   HOOK QUẢN LÝ MODAL & KHOÁ CUỘN TRANG (LENIS / ACCESSIBILITY)
   ============================================================ */
function useSheetAccessibility(open, onClose, lenis) {
  const sheetRef = useRef(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const wasStopped = lenis?.isStopped;
    document.body.style.overflow = "hidden";
    if (!wasStopped) lenis?.stop();

    const sheet = sheetRef.current;
    const controls = () =>
      Array.from(
        sheet?.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]') || []
      ).filter((node) => node.getClientRects().length);

    (controls()[0] || sheet)?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key !== "Tab") return;
      const items = controls();
      const first = items[0];
      const last = items.at(-1);
      if (!first) {
        event.preventDefault();
        sheet?.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    sheet?.addEventListener("keydown", onKeyDown);
    return () => {
      sheet?.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (!wasStopped) lenis?.start();
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open, lenis]);

  return sheetRef;
}

/* ============================================================
   MODAL XÁC NHẬN KHÓA / MỞ KHÓA SỔ ĐIỂM (PortalConfirmDialog)
   ============================================================ */
const PortalConfirmDialog = React.memo(({ open, title, message, confirmLabel, danger, onConfirm, onCancel, busy }) => {
  const lenis = useLenis();
  const sheetRef = useSheetAccessibility(open, () => { if (!busy) onCancel(); }, lenis);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-xs"
      onClick={!busy ? onCancel : undefined}
      ref={sheetRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-lock-dialog-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-[#fffefa] dark:bg-[#1e2821] rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 shadow-xl border border-[#dedfd4] dark:border-[#354237] relative flex flex-col gap-4 text-[#293d32] dark:text-[#ecece0] pb-[calc(1.25rem+env(safe-area-inset-bottom))] transition-colors"
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
              danger
                ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30"
                : "bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] border border-[#314e3e]/20 dark:border-[#d6b883]/30"
            }`}
          >
            {danger ? <Lock className="w-5 h-5" /> : <LockOpen className="w-5 h-5" />}
          </div>
          <div className="flex-1 mt-0.5">
            <h3 id="confirm-lock-dialog-title" className="text-base sm:text-lg font-bold font-sans text-[#293d32] dark:text-[#ecece0] leading-tight mb-1">
              {title}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-[#575e55] dark:text-[#b0b9ac] leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2.5 mt-2 pt-2 border-t border-[#dedfd4]/60 dark:border-[#354237]/60">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="min-h-[44px] flex-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#575e55] dark:text-[#b0b9ac] bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            Hủy thao tác
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`min-h-[44px] flex-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white active:scale-[0.98] transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${
              danger
                ? "bg-amber-700 hover:bg-amber-800 text-white"
                : "bg-[#314e3e] hover:bg-[#263e32] dark:bg-[#d6b883] dark:hover:bg-[#c9a76d] dark:text-[#19251d]"
            }`}
          >
            {busy && <Spinner className="w-4 h-4 text-white dark:text-[#19251d]" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
});

/* ============================================================
   MODAL / PROFILE SHEET CHI TIẾT ĐIỂM & CHUYÊN CẦN CỦA 1 GLS
   Dạng Danh Sách Dọc (3 Cột Chuẩn Mực Hệ Số) + Fast Student Switcher
   ============================================================ */
const StudentDetailModal = React.memo(({
  open,
  row,
  lop,
  hocKy,
  namHoc,
  onClose,
  onOpenAudit,
  currentIndex = -1,
  totalCount = 0,
  onPrev,
  onNext,
}) => {
  const lenis = useLenis();
  const sheetRef = useSheetAccessibility(open, onClose, lenis);

  // Điều hướng bằng phím mũi tên Trái / Phải khi modal đang mở
  useEffect(() => {
    if (!open) return;
    const handleKeyNav = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) return;
      if (e.key === "ArrowLeft" && onPrev && currentIndex > 0) {
        e.preventDefault();
        onPrev();
      } else if (e.key === "ArrowRight" && onNext && currentIndex < totalCount - 1) {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", handleKeyNav);
    return () => window.removeEventListener("keydown", handleKeyNav);
  }, [open, onPrev, onNext, currentIndex, totalCount]);

  if (!open || !row) return null;

  const s = row.student || {};
  const hasAttendance = row.vangCoPhep !== null && row.vangKhongPhep !== null;
  const totalAbsences = hasAttendance ? (row.vangCoPhep || 0) + (row.vangKhongPhep || 0) : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-xs"
      onClick={onClose}
      ref={sheetRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-detail-title"
      aria-describedby="student-detail-meta"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg bg-[#fffefa] dark:bg-[#1e2821] rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 shadow-xl border border-[#dedfd4] dark:border-[#354237] max-h-[100dvh] sm:max-h-[calc(100dvh-2rem)] flex flex-col gap-4 text-[#293d32] dark:text-[#ecece0] pb-[calc(1.25rem+env(safe-area-inset-bottom))] transition-colors"
      >
        {/* Header Modal (Sticky Top) */}
        <div className="flex items-center justify-between gap-3 border-b border-[#dedfd4]/60 dark:border-[#354237]/60 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full overflow-hidden border border-[#dedfd4] dark:border-[#354237] shadow-2xs flex-shrink-0 bg-stone-100 dark:bg-stone-800">
              <img src={s.avatar || AVATAR_FALLBACK} alt="" className="w-full h-full object-cover" onError={handleAvatarError} />
            </div>
            <div className="min-w-0">
              <h3 id="student-detail-title" className="text-base sm:text-lg font-bold font-sans text-[#293d32] dark:text-[#ecece0] leading-tight break-words">
                {s.tenThanh && <span className="text-[#7c5c2d] dark:text-[#d4b47d] mr-1.5">{s.tenThanh}</span>}
                {s.hoTen || s.username}
              </h3>
              <p id="student-detail-meta" className="text-xs text-[#575e55] dark:text-[#b0b9ac] mt-0.5 truncate">
                @{s.username} · Lớp {lop} · {HOC_KY_LABELS[hocKy]}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-xl text-[#575e55] dark:text-[#b0b9ac] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer flex-shrink-0"
            aria-label="Đóng chi tiết"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung cuộn ở giữa (Scrollable Content) */}
        <div className="overflow-y-auto flex flex-col gap-4 pr-1" data-lenis-prevent>
          {/* Hộp Tổng Quan: Điểm TB, Học Lực, Hạnh Kiểm & Vắng */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237]">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac]">Điểm TB</span>
              <span className="text-lg font-bold font-sans tabular-nums text-[#314e3e] dark:text-[#d6b883] mt-0.5">
                {row.diem_tb ?? "—"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac]">Học lực</span>
              <span className="text-sm font-bold text-[#293d32] dark:text-[#ecece0] mt-1">
                {row.hocLuc || "—"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac]">Hạnh kiểm</span>
              <span className="text-sm font-bold text-[#7c5c2d] dark:text-[#d4b47d] mt-1">
                {row.hanhKiem || "—"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac]">Tổng vắng</span>
              <span className="text-sm font-bold text-[#293d32] dark:text-[#ecece0] mt-1">
                {hasAttendance ? `${totalAbsences} buổi` : "—"}
              </span>
            </div>
          </div>

          {/* Bảng Chi Tiết 5 Cột Điểm Dọc (3 Cột Chuẩn Mực: Loại điểm, Hệ số, Kết quả) */}
          <div className="rounded-xl border border-[#dedfd4] dark:border-[#354237] overflow-hidden bg-[#fffefa] dark:bg-[#1e2821]">
            <table className="w-full text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-[#faf8f3] dark:bg-[#151c18] border-b border-[#dedfd4] dark:border-[#354237] text-[#575e55] dark:text-[#b0b9ac] font-bold">
                  <th scope="col" className="px-3.5 py-2.5 text-left font-sans font-bold">Loại điểm</th>
                  <th scope="col" className="px-3 py-2.5 text-center w-20 font-sans font-bold">Hệ số</th>
                  <th scope="col" className="px-3.5 py-2.5 text-right w-24 font-sans font-bold">Kết quả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dedfd4]/60 dark:divide-[#354237]/60">
                <tr>
                  <td className="px-3.5 py-2.5 font-medium text-[#293d32] dark:text-[#ecece0]">Điểm Miệng</td>
                  <td className="px-3 py-2.5 text-center text-[#575e55] dark:text-[#b0b9ac]">×1</td>
                  <td className="px-3.5 py-2.5 text-right font-bold tabular-nums text-[#293d32] dark:text-[#ecece0]">
                    {row.diem_mieng ?? "—"}
                  </td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2.5 font-medium text-[#293d32] dark:text-[#ecece0]">Điểm Vở</td>
                  <td className="px-3 py-2.5 text-center text-[#575e55] dark:text-[#b0b9ac]">×1</td>
                  <td className="px-3.5 py-2.5 text-right font-bold tabular-nums text-[#293d32] dark:text-[#ecece0]">
                    {row.diem_vo ?? "—"}
                  </td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2.5 font-medium text-[#293d32] dark:text-[#ecece0]">Điểm 15 Phút</td>
                  <td className="px-3 py-2.5 text-center text-[#575e55] dark:text-[#b0b9ac]">×1</td>
                  <td className="px-3.5 py-2.5 text-right font-bold tabular-nums text-[#293d32] dark:text-[#ecece0]">
                    {row.diem_15_phut ?? "—"}
                  </td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2.5 font-medium text-[#293d32] dark:text-[#ecece0]">Điểm Một Tiết</td>
                  <td className="px-3 py-2.5 text-center text-[#575e55] dark:text-[#b0b9ac]">×2</td>
                  <td className="px-3.5 py-2.5 text-right font-bold tabular-nums text-[#293d32] dark:text-[#ecece0]">
                    {row.diem_1_tiet ?? "—"}
                  </td>
                </tr>
                <tr className="bg-[#faf8f3]/60 dark:bg-[#151c18]/60">
                  <td className="px-3.5 py-2.5 font-bold text-[#314e3e] dark:text-[#d6b883]">Thi Học Kỳ</td>
                  <td className="px-3 py-2.5 text-center font-bold text-[#314e3e] dark:text-[#d6b883]">×3</td>
                  <td className="px-3.5 py-2.5 text-right font-bold tabular-nums text-[#7c5c2d] dark:text-[#d4b47d]">
                    {row.diem_thi ?? "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Chi Tiết Chuyên Cần */}
          <div className="p-3 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] flex items-center justify-between text-xs">
            <span className="font-semibold text-[#575e55] dark:text-[#b0b9ac]">Chuyên cần & Sống đạo:</span>
            {hasAttendance ? (
              <span className="font-bold text-[#293d32] dark:text-[#ecece0]">
                {row.vangCoPhep || 0} có phép · <strong className={row.vangKhongPhep > 0 ? "text-amber-700 dark:text-amber-400" : ""}>{row.vangKhongPhep || 0} không phép</strong>
              </span>
            ) : (
              <span className="text-[#575e55] dark:text-[#b0b9ac]">Chưa có dữ liệu</span>
            )}
          </div>

          {/* Cảnh Báo Cụ Thể Nếu Cần Theo Dõi */}
          {row.warning && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs font-medium text-amber-900 dark:text-amber-300 leading-relaxed">
                <strong className="block mb-0.5 font-bold">Cần quan tâm theo dõi:</strong>
                {row.warningReasons && row.warningReasons.length > 0 ? (
                  <p>{row.warningReasons.join(" · ")}</p>
                ) : (
                  <p>Giáo lý sinh có Điểm TB dưới 5.0 hoặc vắng từ 3 buổi học trở lên.</p>
                )}
              </div>
            </div>
          )}

          {/* Nút Xem Lịch Sử Sửa Điểm (Admin Audit Action) */}
          {onOpenAudit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAudit(s);
              }}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] hover:bg-stone-200/70 dark:hover:bg-stone-800 text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] font-bold text-xs sm:text-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              <History className="w-4 h-4 text-[#5e4117] dark:text-[#e0c38c]" />
              <span>Xem nhật ký sửa điểm của Giáo lý sinh</span>
            </button>
          )}

          {/* Nút Liên Hệ Phụ Huynh (Secondary Action) */}
          {s.soDienThoai && (
            <a
              href={`tel:${s.soDienThoai}`}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] font-bold text-xs sm:text-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" />
              <span>Liên hệ Phụ huynh ({s.soDienThoai})</span>
            </a>
          )}
        </div>

        {/* Thanh Điều Hướng Nhanh & Nút Đóng ở chân Modal (Thumb Zone) */}
        <div className="pt-2.5 border-t border-[#dedfd4]/60 dark:border-[#354237]/60 flex flex-col gap-2 flex-shrink-0">
          {totalCount > 1 && (
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onPrev}
                disabled={!onPrev || currentIndex <= 0}
                className="min-h-[44px] flex-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] hover:bg-stone-200/70 dark:hover:bg-stone-800 disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center gap-1 active:scale-[0.98] transition-all cursor-pointer"
                aria-label="Xem Giáo lý sinh trước"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Em trước</span>
              </button>

              <div className="px-3 py-2 text-center text-xs font-bold font-mono text-[#575e55] dark:text-[#b0b9ac] whitespace-nowrap">
                {currentIndex >= 0 ? `${currentIndex + 1} / ${totalCount}` : ""}
              </div>

              <button
                type="button"
                onClick={onNext}
                disabled={!onNext || currentIndex >= totalCount - 1}
                className="min-h-[44px] flex-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] hover:bg-stone-200/70 dark:hover:bg-stone-800 disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center gap-1 active:scale-[0.98] transition-all cursor-pointer"
                aria-label="Xem Giáo lý sinh kế tiếp"
              >
                <span>Em kế tiếp</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#575e55] dark:text-[#b0b9ac] bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-[0.98] transition-all cursor-pointer"
          >
            Đóng chi tiết
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
});

/* ============================================================
   BỘ LỌC NÂNG CAO CHO MOBILE (< 768px: BOTTOM SHEET, >= 768px: POPOVER)
   ============================================================ */
function AdvancedFilterModal({ open, activeFilter, counts, onSelectFilter, onClose }) {
  const lenis = useLenis();
  const sheetRef = useSheetAccessibility(open, onClose, lenis);

  if (!open) return null;

  const filterOptions = [
    {
      group: "Học lực",
      items: [
        { id: "gioi", label: "Giỏi (≥ 8.0)", count: counts.gioi },
        { id: "kha", label: "Khá (6.5 – 7.9)", count: counts.kha },
        { id: "tb", label: "Trung bình (5.0 – 6.4)", count: counts.tb },
        { id: "yeu", label: "Yếu (< 5.0)", count: counts.yeu },
      ],
    },
    {
      group: "Chuyên cần",
      items: [
        { id: "co_vang_kp", label: "Có vắng không phép", count: counts.co_vang_kp },
      ],
    },
    {
      group: "Tình trạng điểm",
      items: [
        { id: "chua_co_diem", label: "Chưa có điểm", count: counts.chua_co_diem },
      ],
    },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[9997] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-xs"
      onClick={onClose}
      ref={sheetRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-dialog-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-[#fffefa] dark:bg-[#1e2821] rounded-t-2xl sm:rounded-2xl p-5 shadow-xl border border-[#dedfd4] dark:border-[#354237] max-h-[85vh] flex flex-col gap-4 text-[#293d32] dark:text-[#ecece0] pb-[calc(1.25rem+env(safe-area-inset-bottom))] transition-colors"
      >
        <div className="flex items-center justify-between border-b border-[#dedfd4]/60 dark:border-[#354237]/60 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" />
            <h3 id="filter-dialog-title" className="text-base font-bold font-sans text-[#293d32] dark:text-[#ecece0]">
              Bộ lọc nâng cao
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-[#575e55] dark:text-[#b0b9ac] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Đóng bộ lọc"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex flex-col gap-4 pr-1" data-lenis-prevent>
          {filterOptions.map((g) => (
            <div key={g.group} className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">
                {g.group}
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {g.items.map((item) => {
                  const isSelected = activeFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectFilter(item.id);
                        onClose();
                      }}
                      className={`min-h-[44px] w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] font-bold"
                          : "bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] hover:bg-stone-100 dark:hover:bg-stone-800 border border-[#dedfd4] dark:border-[#354237]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
                        <span>{item.label}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                        isSelected
                          ? "bg-white/20 text-white dark:bg-black/20 dark:text-[#19251d]"
                          : "bg-stone-200/80 dark:bg-stone-700/80 text-[#575e55] dark:text-[#b0b9ac]"
                      }`}>
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-[#dedfd4]/60 dark:border-[#354237]/60 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              onSelectFilter("all");
              onClose();
            }}
            className="min-h-[44px] flex-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#575e55] dark:text-[#b0b9ac] bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-[0.98] transition-all cursor-pointer"
          >
            Đặt lại (Tất cả)
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] flex-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#314e3e] hover:bg-[#263e32] dark:bg-[#d6b883] dark:hover:bg-[#c9a76d] dark:text-[#19251d] active:scale-[0.98] transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ============================================================
   CARD CHỌN LỚP HỌC (ClassPicker) — TOP SEARCH & CLASS GRID
   ============================================================ */
function ClassPicker({ classes, namHoc, loading, onPick }) {
  const [search, setSearch] = useState("");
  const [selectedKhoi, setSelectedKhoi] = useState("all");

  const countsByKhoi = useMemo(() => {
    const counts = { all: classes.length };
    KHOI_FILTERS.forEach((k) => {
      if (k.id !== "all") counts[k.id] = 0;
    });
    classes.forEach((c) => {
      const kId = detectKhoiByLop(c.lop);
      if (counts[kId] !== undefined) counts[kId]++;
    });
    return counts;
  }, [classes]);

  const filtered = useMemo(() => {
    let list = classes;
    if (selectedKhoi !== "all") {
      list = list.filter((c) => detectKhoiByLop(c.lop) === selectedKhoi);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((c) => {
        const matchName = c.lop.toLowerCase().includes(q);
        const matchTeacher = (c.displayTeacherName || "").toLowerCase().includes(q);
        return matchName || matchTeacher;
      });
    }
    return list;
  }, [classes, selectedKhoi, search]);

  const totalFilteredStudents = useMemo(() => filtered.reduce((sum, c) => sum + (c.studentCount || 0), 0), [filtered]);
  const emptyClassCount = useMemo(() => filtered.filter((c) => (c.studentCount || 0) === 0).length, [filtered]);

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* ── CARD BỘ LỌC 6 KHỐI & TÌM KIẾM (TOP SEARCH FIRST) ── */}
      <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] p-4 sm:p-5 shadow-2xs flex flex-col gap-3.5">
        {/* Hàng 1: Ô Tìm Kiếm Lớp / GLV Toàn Diện */}
        <div className="relative w-full">
          <Search className="w-5 h-5 text-[#575e55] dark:text-[#b0b9ac] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên lớp Giáo lý hoặc tên Giáo lý viên phụ trách..."
            aria-label="Tìm kiếm lớp Giáo lý hoặc GLV"
            className="w-full min-h-[44px] rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] pl-11 pr-11 py-2 text-base sm:text-sm font-medium text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 dark:placeholder-[#b0b9ac]/60 focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 transition-all shadow-inner"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="w-11 h-11 flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 cursor-pointer"
              aria-label="Xóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Hàng 2: 6 Khối Giáo lý Pills */}
        <div className="flex items-center gap-2 overflow-x-auto sm:flex-wrap pb-1 sm:pb-0 scrollbar-none" data-lenis-prevent>
          {KHOI_FILTERS.map((k) => {
            const IconComp = k.icon;
            const count = countsByKhoi[k.id] || 0;
            const isActive = selectedKhoi === k.id;
            return (
              <button
                key={k.id}
                type="button"
                onClick={() => setSelectedKhoi(k.id)}
                className={`min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-2xs"
                    : "bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] border border-[#dedfd4] dark:border-[#354237] hover:border-[#314e3e]/30 dark:hover:border-[#d6b883]/30"
                }`}
              >
                <IconComp className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{k.shortLabel}</span>
                <span className={`text-xs px-1.5 py-0.2 rounded-full font-mono ${
                  isActive
                    ? "bg-white/20 text-white dark:bg-black/20 dark:text-[#19251d]"
                    : "bg-stone-200/80 dark:bg-stone-700/80 text-[#575e55] dark:text-[#b0b9ac]"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dòng Tóm Tắt Kết Quả Tìm Kiếm / Lọc */}
        <div className="text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac] pt-1.5 border-t border-[#dedfd4]/40 dark:border-[#354237]/40 flex items-center justify-between">
          <span>Hiển thị <strong>{filtered.length}</strong> lớp · <strong>{totalFilteredStudents}</strong> Giáo lý sinh {emptyClassCount > 0 ? `· ${emptyClassCount} lớp chưa có danh sách` : ""}</span>
          <span className="font-mono hidden sm:inline">{namHoc}</span>
        </div>
      </div>

      {/* ── DANH SÁCH CÁC THẺ LỚP ĐỘC LẬP ── */}
      {loading ? (
        <CardsGridSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] flex items-center justify-center mx-auto mb-3">
            <School className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-[#293d32] dark:text-[#ecece0] font-sans">
            {search || selectedKhoi !== "all" ? "Không tìm thấy lớp Giáo lý phù hợp" : "Chưa có lớp Giáo lý nào"}
          </h4>
          <p className="text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac] mt-1">
            Vui lòng thử tìm kiếm bằng từ khóa khác hoặc chọn khối học khác.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filtered.map((c) => {
            const khoiKey = detectKhoiByLop(c.lop);
            const khoiStyle = getKhoiStyle(khoiKey);
            const khoiName = getKhoiLabel(khoiKey);
            const schedInfo = getScheduleInfoForClass(c.lop);
            const lockHK1 = !!c.locks?.[1];
            const lockHK2 = !!c.locks?.[2];

            return (
              <button
                key={c.lop}
                type="button"
                onClick={() => onPick(c.lop)}
                className={`w-full text-left flex flex-col justify-between gap-3.5 p-4 sm:p-5 rounded-2xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] shadow-2xs hover:border-[#314e3e]/50 dark:hover:border-[#d6b883]/50 focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d6b883] focus-visible:outline-none transition-all duration-200 cursor-pointer active:scale-[0.99] group ${khoiStyle.stripe}`}
              >
                <div>
                  {/* Tầng 1: Tên Lớp, Khối & Trạng thái khóa */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <h4 className="text-base sm:text-lg font-bold text-[#293d32] dark:text-[#ecece0] font-sans group-hover:text-[#314e3e] dark:group-hover:text-[#d6b883] transition-colors leading-tight">
                        {c.lop}
                      </h4>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${khoiStyle.badge}`}>
                        {khoiName}
                      </span>
                    </div>

                    {/* Trạng thái khóa trung tính */}
                    {lockHK1 && lockHK2 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac] bg-stone-100 dark:bg-stone-800 rounded-full px-2 py-0.5 flex-shrink-0">
                        <Lock className="w-3 h-3 text-[#7c5c2d] dark:text-[#d4b47d]" /> Khóa 2 HK
                      </span>
                    ) : lockHK1 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac] bg-stone-100 dark:bg-stone-800 rounded-full px-2 py-0.5 flex-shrink-0">
                        <Lock className="w-3 h-3 text-[#7c5c2d] dark:text-[#d4b47d]" /> Khóa HK1
                      </span>
                    ) : lockHK2 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac] bg-stone-100 dark:bg-stone-800 rounded-full px-2 py-0.5 flex-shrink-0">
                        <Lock className="w-3 h-3 text-[#7c5c2d] dark:text-[#d4b47d]" /> Khóa HK2
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 rounded-full px-2 py-0.5 flex-shrink-0">
                        <LockOpen className="w-3 h-3 text-emerald-600" /> Mở sổ
                      </span>
                    )}
                  </div>

                  {/* Tầng 2: Phòng Học, Ca Học & GLV */}
                  <div className="flex flex-col gap-1.5 text-xs text-[#575e55] dark:text-[#b0b9ac]">
                    {schedInfo?.room && (
                      <div className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#7c5c2d] dark:text-[#d4b47d] flex-shrink-0" />
                        <span>Phòng {schedInfo.room}{schedInfo.ca ? ` · Ca ${schedInfo.ca}` : ""}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-1.5 font-medium">
                      <Users className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d6b883] flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <span>GLV: </span>
                        <strong className="text-[#293d32] dark:text-[#ecece0] font-semibold leading-relaxed">
                          {formatTeachersDisplay(c.displayTeacherName)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tầng 3: Sĩ số & Nút Mở */}
                <div className="pt-2.5 border-t border-[#dedfd4]/60 dark:border-[#354237]/60 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#314e3e] dark:text-[#d6b883] bg-[#314e3e]/10 dark:bg-[#d6b883]/15 px-2.5 py-1 rounded-full">
                    {c.studentCount || 0} Giáo lý sinh
                  </span>
                  <span className="text-xs font-bold text-[#314e3e] dark:text-[#d6b883] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Mở sổ</span> →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   CARD HỌC SINH TRÊN MOBILE & TABLET (< 1024px)
   Dải Mini Score Strip (5 Cột Điểm Thành Phần) + Chạm mở chi tiết
   ============================================================ */
const StudentMobileCard = React.memo(({ row: r, index, onOpenDetail }) => {
  const s = r.student || {};
  const theme = getGradeTheme(r.diem_tb);
  const hasAttendance = r.vangCoPhep !== null && r.vangKhongPhep !== null;
  const tongVang = hasAttendance ? (r.vangCoPhep || 0) + (r.vangKhongPhep || 0) : null;

  const scoreItems = [
    { label: "M", val: r.diem_mieng, title: "Điểm Miệng (×1)" },
    { label: "V", val: r.diem_vo, title: "Điểm Vở (×1)" },
    { label: "15'", val: r.diem_15_phut, title: "Điểm 15 Phút (×1)" },
    { label: "1T", val: r.diem_1_tiet, title: "Điểm Một Tiết (×2)" },
    { label: "Thi", val: r.diem_thi, title: "Thi Học Kỳ (×3)" },
  ];

  return (
    <button
      type="button"
      onClick={() => onOpenDetail(r)}
      className={`w-full text-left p-3.5 sm:p-4 rounded-2xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] shadow-2xs flex flex-col gap-2.5 transition-all cursor-pointer active:scale-[0.99] hover:border-[#314e3e]/40 dark:hover:border-[#d6b883]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d6b883] ${
        r.warning ? "border-l-4 border-l-amber-500" : ""
      }`}
      aria-label={`Xem chi tiết điểm và chuyên cần của ${s.tenThanh ? s.tenThanh + " " : ""}${s.hoTen || s.username}`}
    >
      {/* Dòng 1: STT, Tên học sinh, Điểm TB & Xếp loại */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-xs font-bold font-mono text-[#575e55] dark:text-[#b0b9ac] w-5 text-center flex-shrink-0">
            {index + 1}
          </span>
          <p className="text-sm sm:text-base font-bold font-sans text-[#293d32] dark:text-[#ecece0] truncate leading-tight">
            {s.tenThanh && <span className="text-[#7c5c2d] dark:text-[#d4b47d] font-semibold mr-1">{s.tenThanh}</span>}
            {s.hoTen || s.username}
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-sans font-bold tabular-nums ${theme.badge}`}>
            TB: {r.diem_tb ?? "—"}{r.hocLuc ? ` · ${r.hocLuc}` : ""}
          </span>
          <span className="text-stone-400 dark:text-stone-500 text-sm font-bold">›</span>
        </div>
      </div>

      {/* Dòng 2: Dải Mini Score Strip (5 Cột Điểm Thành Phần) */}
      <div className="grid grid-cols-5 gap-1.5 p-2 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4]/60 dark:border-[#354237]/60">
        {scoreItems.map((item) => {
          const hasVal = item.val !== null && item.val !== undefined && item.val !== "" && !isNaN(Number(item.val));
          const numVal = hasVal ? Number(item.val) : null;

          let scoreStyle = "text-stone-400 dark:text-stone-500 bg-white/40 dark:bg-black/20 border-stone-200 dark:border-stone-800";
          if (hasVal) {
            if (numVal >= 8.0) {
              scoreStyle = "text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300/80 dark:border-emerald-800/60 font-bold";
            } else if (numVal >= 5.0) {
              scoreStyle = "text-[#293d32] dark:text-[#ecece0] bg-white dark:bg-[#1e2821] border-[#dedfd4] dark:border-[#354237] font-semibold";
            } else {
              scoreStyle = "text-red-800 dark:text-red-300 bg-red-50 dark:bg-red-950/50 border-red-300/80 dark:border-red-800/60 font-bold";
            }
          }

          return (
            <div
              key={item.label}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg border text-center transition-colors ${scoreStyle}`}
              title={item.title}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac] leading-none mb-0.5">
                {item.label}
              </span>
              <span className="text-xs sm:text-sm font-sans tabular-nums leading-tight">
                {hasVal ? item.val : "—"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Dòng 3: Tóm tắt Chuyên cần & Hạnh kiểm */}
      <div className="pt-1.5 border-t border-[#dedfd4]/60 dark:border-[#354237]/60 flex items-center justify-between text-xs text-[#575e55] dark:text-[#b0b9ac] flex-wrap gap-2">
        <span>
          HK: <strong className="text-[#293d32] dark:text-[#ecece0] font-semibold">{r.hanhKiem || "—"}</strong>
        </span>
        <span>
          {hasAttendance ? (
            <>
              Vắng: <strong className={tongVang > 3 ? "text-red-700 dark:text-red-400 font-bold" : "text-[#293d32] dark:text-[#ecece0] font-semibold"}>
                {tongVang} buổi ({r.vangCoPhep || 0} CP, {r.vangKhongPhep || 0} KP)
              </strong>
            </>
          ) : (
            <span className="text-[#575e55] dark:text-[#b0b9ac]">Chưa có dữ liệu vắng</span>
          )}
        </span>
      </div>

      {/* Dòng 4: Cảnh báo cụ thể (nếu có, không truncate, xuống dòng an toàn) */}
      {r.warning && r.warningReasons && r.warningReasons.length > 0 && (
        <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 flex items-start gap-2 text-xs font-medium text-amber-800 dark:text-amber-300 leading-relaxed">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 break-words">
            <strong className="mr-1 text-amber-900 dark:text-amber-200 font-bold">Cần theo dõi:</strong>
            <span>{r.warningReasons.join(" · ")}</span>
          </div>
        </div>
      )}
    </button>
  );
});

// Định dạng danh sách Giáo lý viên phụ trách gọn gàng và rõ ràng
function formatTeachersDisplay(raw) {
  if (!raw || raw === "— Chưa có —" || raw === "Chưa phân công") return "Chưa phân công";
  return raw.replace(/\s*&\s*/g, " · ");
}

/* ============================================================
   DÒNG BẢNG ĐIỂM TRÊN DESKTOP (StudentDesktopRow)
   Sticky Tên bên trái (nhấp mở chi tiết), Tabular numbers
   ============================================================ */
const StudentDesktopRow = React.memo(({ row: r, index, scoreFields, partialErrors, onOpenDetail, onOpenAudit }) => {
  const s = r.student || {};
  const theme = getGradeTheme(r.diem_tb);
  const statusInfo = getStudentRowStatus(r, partialErrors);
  const hasAttendance = r.vangCoPhep !== null && r.vangKhongPhep !== null;

  return (
    <tr className="group hover:bg-[#314e3e]/5 dark:hover:bg-[#d6b883]/10 transition-colors">
      <td className="px-3 py-3 text-xs font-mono font-bold text-[#575e55] dark:text-[#b0b9ac] text-center w-12">
        {index + 1}
      </td>
      {/* Cột Tên Giáo lý sinh Sticky bên trái với nền đặc 100% (Nhấp để mở chi tiết) */}
      <td
        onClick={() => onOpenDetail(r)}
        className="px-4 py-3 left-0 sticky z-10 bg-[#fffefa] dark:bg-[#1e2821] group-hover:bg-[#faf8f3] dark:group-hover:bg-[#253229] border-r border-[#dedfd4]/60 dark:border-[#354237]/60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer"
        title="Nhấp để xem chi tiết điểm & chuyên cần"
      >
        <div className="flex items-center gap-2.5 min-w-[170px]">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold font-sans text-[#293d32] dark:text-[#ecece0] group-hover:text-[#314e3e] dark:group-hover:text-[#d6b883] truncate leading-tight transition-colors">
              {s.tenThanh && <span className="text-[#7c5c2d] dark:text-[#d4b47d] font-semibold mr-1">{s.tenThanh}</span>}
              {s.hoTen || s.username}
            </p>
            <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] truncate mt-0.5">
              @{s.username}
            </p>
          </div>
        </div>
      </td>
      {/* 5 Cột Điểm Thành Phần */}
      {scoreFields.map((f) => (
        <td key={f.key} className="px-2.5 py-3 text-center text-xs sm:text-sm font-bold font-sans tabular-nums text-[#293d32] dark:text-[#ecece0]">
          {r[f.key] ?? "—"}
        </td>
      ))}
      {/* Cột Điểm TB */}
      <td className="px-3 py-3 text-center">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-sans font-bold tabular-nums ${theme.badge}`}>
          {r.diem_tb ?? "—"}
        </span>
      </td>
      {/* Cột Đánh Giá Gộp: Học lực + Hạnh kiểm */}
      <td className="px-3 py-3 text-center text-xs leading-tight">
        {r.hocLuc || r.hanhKiem ? (
          <>
            {r.hocLuc && (
              <div className="font-bold font-sans text-[#293d32] dark:text-[#ecece0]">
                {r.hocLuc}
              </div>
            )}
            {r.hanhKiem && (
              <div className="text-[#7c5c2d] dark:text-[#d4b47d] font-semibold text-xs mt-0.5">
                HK: {r.hanhKiem}
              </div>
            )}
          </>
        ) : (
          <span className="text-[#575e55] dark:text-[#b0b9ac]">—</span>
        )}
      </td>
      {/* Cột Chuyên Cần Gộp: 1 Dòng CP · KP Liền Mạch */}
      <td className="px-3 py-3 text-center text-xs font-semibold font-sans leading-tight">
        {hasAttendance ? (
          <span className="inline-flex items-center gap-1.5 tabular-nums text-[#575e55] dark:text-[#b0b9ac] whitespace-nowrap">
            <span>{r.vangCoPhep || 0} CP</span>
            <span className="text-stone-300 dark:text-stone-700">·</span>
            <span className={r.vangKhongPhep > 0 ? "text-amber-700 dark:text-amber-400 font-bold" : ""}>
              {r.vangKhongPhep || 0} KP
            </span>
          </span>
        ) : (
          <span className="text-[#575e55] dark:text-[#b0b9ac]">—</span>
        )}
      </td>
      {/* Cột Trạng Thái Trung Thực */}
      <td className="px-3 py-3 text-center">
        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full whitespace-nowrap ${statusInfo.badgeClass}`} title={r.warningReasons?.join(" · ")}>
          {statusInfo.type === "warning" && <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
          {statusInfo.label}
        </span>
      </td>
      {/* Cột Thao Tác (Nhật Ký Sửa Điểm - Sticky từ xl: >= 1280px) */}
      <td className="px-3 py-3 text-center xl:sticky xl:right-0 xl:z-10 bg-[#fffefa] dark:bg-[#1e2821] group-hover:bg-[#faf8f3] dark:group-hover:bg-[#253229] border-l border-[#dedfd4]/60 dark:border-[#354237]/60 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors">
        <div className="flex items-center justify-center mx-auto">
          {onOpenAudit ? (
            <button
              type="button"
              onClick={() => onOpenAudit(s)}
              className="min-h-[38px] min-w-[38px] p-2 rounded-xl text-[#5e4117] dark:text-[#e0c38c] bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] hover:bg-stone-200/70 dark:hover:bg-stone-800 transition-all flex items-center justify-center cursor-pointer"
              aria-label={`Xem nhật ký sửa điểm của ${s.tenThanh ? s.tenThanh + " " : ""}${s.hoTen || s.username}`}
              title="Xem nhật ký sửa điểm"
            >
              <History className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-xs text-stone-400">—</span>
          )}
        </div>
      </td>
    </tr>
  );
});

/* ============================================================
   MÀN HÌNH SỔ ĐIỂM CHI TIẾT CỦA LỚP (ClassGradeBook)
   ============================================================ */
function ClassGradeBook({ lop, namHoc, classInfo, hocKy, onHocKyChange, showToast, onBack, onLockChange }) {
  const hocKyInt = HK_INT_MAP[hocKy];

  const [students, setStudents] = useState([]);
  const [gradeRows, setGradeRows] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [partialErrors, setPartialErrors] = useState({ attendanceError: false, termError: false, gradesError: false });

  // In-class Search, Filter & Sort state
  const [searchStudent, setSearchStudent] = useState("");
  const [studentFilter, setStudentFilter] = useState("all");
  const [sortField, setSortField] = useState("stt");
  const [sortOrder, setSortOrder] = useState("asc");

  // Selected student for detail sheet
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [auditStudent, setAuditStudent] = useState(null);

  // Lock status state & Modal confirmation
  const [termLocks, setTermLocks] = useState(classInfo?.locks || {});
  const [confirmLockDialog, setConfirmLockDialog] = useState(null);
  const [lockBusy, setLockBusy] = useState(false);

  // Export menu dropdown & Advanced filter modal
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [showPolicyCollapse, setShowPolicyCollapse] = useState(false);

  const exportMenuRef = useRef(null);

  const [refreshCount, setRefreshCount] = useState(0);
  const reload = useCallback(() => setRefreshCount((c) => c + 1), []);

  const requestIdRef = useRef(0);

  const rosterStudents = useMemo(() => sortStudentsByTen(students), [students]);

  const khoiKey = detectKhoiByLop(lop);
  const khoiStyle = getKhoiStyle(khoiKey);
  const khoiName = getKhoiLabel(khoiKey);
  const schedInfo = getScheduleInfoForClass(lop);

  const isLocked = !!termLocks?.[hocKyInt];
  const scoreFields = useMemo(() => GRADE_FIELDS.filter((f) => f.key !== "diem_tb"), []);

  // Đóng dropdown khi click outside hoặc bấm Escape
  useEffect(() => {
    function handleClickOutside(e) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setShowExportMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Tải dữ liệu điểm & chuyên cần của lớp
  useEffect(() => {
    let cancelled = false;
    const requestId = ++requestIdRef.current;

    async function loadData() {
      setLoading(true);
      setLoadError(null);
      try {
        const [roster, locksMap] = await Promise.all([
          fetchClassRoster(lop, namHoc),
          fetchTermLocks(namHoc),
        ]);

        const classLocks = locksMap[lop] || {};
        if (cancelled || requestId !== requestIdRef.current) return;
        setTermLocks(classLocks);

        const usernames = roster.map((s) => s.username);
        const [gradesByUser, summaryResult] = await Promise.all([
          fetchGradesMap(usernames, namHoc, hocKyInt),
          fetchClassAcademicSummary(usernames, namHoc, hocKyInt),
        ]);

        if (cancelled || requestId !== requestIdRef.current) return;

        const summaryByUser = summaryResult.data || {};
        setPartialErrors({
          attendanceError: summaryResult.attendanceError,
          termError: summaryResult.termError,
          gradesError: summaryResult.gradesError,
        });

        const merged = {};
        roster.forEach((s) => {
          const g = gradesByUser[s.username] ?? {};
          const d = summaryByUser[s.username] ?? {};
          merged[s.username] = {
            diem_mieng: g.diem_mieng ?? null,
            diem_vo: g.diem_vo ?? null,
            diem_15_phut: g.diem_15_phut ?? null,
            diem_1_tiet: g.diem_1_tiet ?? null,
            diem_thi: g.diem_thi ?? null,
            diem_tb: g.diem_tb ?? null,
            hocLuc: d.hocLuc ?? null,
            hanhKiem: d.hanhKiem ?? null,
            vangCoPhep: d.vangCoPhep,
            vangKhongPhep: d.vangKhongPhep,
          };
        });

        setStudents(roster);
        setGradeRows(merged);
      } catch (err) {
        if (cancelled || requestId !== requestIdRef.current) return;
        console.error("load admin grade book error:", err);
        setLoadError(err);
        showToast("Không tải được sổ điểm", "error");
      } finally {
        if (!cancelled && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [lop, namHoc, hocKyInt, showToast, refreshCount]);

  // Tính toán warning & cấu trúc đầy đủ
  const rowsWithWarning = useMemo(() => {
    return rosterStudents.map((s) => {
      const g = gradeRows[s.username] || {};
      const hasAttendance = g.vangCoPhep !== null && g.vangKhongPhep !== null;
      const tongVang = hasAttendance ? (g.vangCoPhep || 0) + (g.vangKhongPhep || 0) : null;
      const hasDiemTB = g.diem_tb !== null && g.diem_tb !== undefined && g.diem_tb !== "" && !isNaN(Number(g.diem_tb));

      const reasons = [];
      if (hasDiemTB && Number(g.diem_tb) < 5.0) {
        reasons.push(`Điểm TB (${g.diem_tb}) dưới 5.0`);
      }
      if (hasAttendance && (g.vangKhongPhep || 0) >= 3) {
        reasons.push(`Vắng KP ${g.vangKhongPhep} buổi`);
      } else if (hasAttendance && tongVang >= 4) {
        reasons.push(`Tổng vắng ${tongVang} buổi`);
      }

      const warning = reasons.length > 0;
      return { student: s, ...g, tongVang, warning, warningReasons: reasons };
    });
  }, [rosterStudents, gradeRows]);

  // Thống kê phân tích toàn diện cho lớp (Class Analytics)
  const classStats = useMemo(() => computeClassStats(rowsWithWarning, partialErrors), [rowsWithWarning, partialErrors]);

  // Đếm số lượng học sinh theo từng bộ lọc
  const filterCounts = useMemo(() => {
    let coVangKp = 0;
    rowsWithWarning.forEach((r) => {
      if ((r.vangKhongPhep || 0) > 0) coVangKp++;
    });
    return {
      all: rowsWithWarning.length,
      warning: classStats.warningCount,
      gioi: classStats.gioiCount,
      kha: classStats.khaCount,
      tb: classStats.tbCount,
      yeu: classStats.yeuCount,
      chua_co_diem: classStats.chuaCoDiemCount,
      co_vang_kp: coVangKp,
    };
  }, [rowsWithWarning, classStats]);

  // Lọc & Sắp xếp dữ liệu danh sách học sinh
  const filteredRows = useMemo(() => {
    let list = rowsWithWarning;

    if (studentFilter === "warning") {
      list = list.filter((r) => r.warning);
    } else if (studentFilter === "gioi") {
      list = list.filter((r) => r.diem_tb != null && Number(r.diem_tb) >= 8.0);
    } else if (studentFilter === "kha") {
      list = list.filter((r) => r.diem_tb != null && Number(r.diem_tb) >= 6.5 && Number(r.diem_tb) < 8.0);
    } else if (studentFilter === "tb") {
      list = list.filter((r) => r.diem_tb != null && Number(r.diem_tb) >= 5.0 && Number(r.diem_tb) < 6.5);
    } else if (studentFilter === "yeu") {
      list = list.filter((r) => r.diem_tb != null && Number(r.diem_tb) < 5.0);
    } else if (studentFilter === "chua_co_diem") {
      list = list.filter((r) => r.diem_tb === null || r.diem_tb === undefined || r.diem_tb === "");
    } else if (studentFilter === "co_vang_kp") {
      list = list.filter((r) => (r.vangKhongPhep || 0) > 0);
    }

    const q = searchStudent.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        const s = r.student || {};
        const matchName = (s.hoTen || "").toLowerCase().includes(q);
        const matchHoly = (s.tenThanh || "").toLowerCase().includes(q);
        const matchUser = (s.username || "").toLowerCase().includes(q);
        return matchName || matchHoly || matchUser;
      });
    }

    return sortGradeRows(list, sortField, sortOrder);
  }, [rowsWithWarning, studentFilter, searchStudent, sortField, sortOrder]);

  const activeFilterLabel = useMemo(() => {
    switch (studentFilter) {
      case "warning": return "Cần theo dõi";
      case "gioi": return "Học lực Giỏi";
      case "kha": return "Học lực Khá";
      case "tb": return "Học lực Trung Bình";
      case "yeu": return "Học lực Yếu";
      case "chua_co_diem": return "Chưa có điểm";
      case "co_vang_kp": return "Có vắng không phép";
      default: return null;
    }
  }, [studentFilter]);

  const handleSortColumn = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Vị trí học sinh hiện tại và điều hướng nhanh (Fast Student Switcher)
  const selectedIndex = useMemo(() => {
    if (!selectedStudentDetail) return -1;
    return filteredRows.findIndex((r) => r.student?.username === selectedStudentDetail.student?.username);
  }, [filteredRows, selectedStudentDetail]);

  const handlePrevStudent = useCallback(() => {
    if (selectedIndex > 0) {
      setSelectedStudentDetail(filteredRows[selectedIndex - 1]);
    }
  }, [selectedIndex, filteredRows]);

  const handleNextStudent = useCallback(() => {
    if (selectedIndex >= 0 && selectedIndex < filteredRows.length - 1) {
      setSelectedStudentDetail(filteredRows[selectedIndex + 1]);
    }
  }, [selectedIndex, filteredRows]);

  // Thao tác Khóa / Mở khóa sổ điểm
  const handleToggleLock = () => {
    if (isLocked) {
      setConfirmLockDialog({
        action: "unlock",
        title: "Mở khóa sổ điểm?",
        message: `Bạn có muốn mở khóa sổ điểm ${HOC_KY_LABELS[hocKy]} cho Lớp ${lop}? Giáo lý viên phụ trách sẽ được cấp quyền nhập và chỉnh sửa điểm trở lại.`,
        confirmLabel: "Xác nhận mở khóa",
        danger: false,
      });
    } else {
      setConfirmLockDialog({
        action: "lock",
        title: "Khóa sổ điểm học kỳ?",
        message: `Xác nhận khóa sổ điểm ${HOC_KY_LABELS[hocKy]} cho Lớp ${lop} (Niên khóa ${namHoc})? Giáo lý viên sẽ tạm ngưng quyền chỉnh sửa điểm cho đến khi Ban Quản Trị mở khóa lại.`,
        confirmLabel: "Khóa sổ điểm",
        danger: true,
      });
    }
  };

  const executeLockAction = async () => {
    if (!confirmLockDialog) return;
    setLockBusy(true);
    try {
      if (confirmLockDialog.action === "lock") {
        await lockTerm(lop, namHoc, hocKyInt);
        setTermLocks((prev) => ({ ...prev, [hocKyInt]: true }));
        showToast(`Đã khóa sổ điểm ${HOC_KY_LABELS[hocKy]} cho Lớp ${lop}`, "success");
      } else {
        await unlockTerm(lop, namHoc, hocKyInt);
        setTermLocks((prev) => ({ ...prev, [hocKyInt]: false }));
        showToast(`Đã mở khóa sổ điểm ${HOC_KY_LABELS[hocKy]} cho Lớp ${lop}`, "success");
      }
      if (onLockChange) onLockChange();
    } catch (err) {
      console.error("lock/unlock error:", err);
      showToast("Thao tác thất bại. Vui lòng thử lại", "error");
    } finally {
      setLockBusy(false);
      setConfirmLockDialog(null);
    }
  };

  // Preload Excel & PDF
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    preloadXLSX();
    preloadPDFLibs();
  }, []);

  const exportExcel = useCallback(async () => {
    setExporting(true);
    setShowExportMenu(false);
    try {
      const XLSX = await getXLSX();
      const data = rowsWithWarning.map((r, idx) => {
        const rowStatus = getStudentRowStatus(r, partialErrors);
        return {
          "STT": idx + 1,
          "Họ & Tên": `${r.student.tenThanh ? r.student.tenThanh + " " : ""}${r.student.hoTen || r.student.username}`,
          "Miệng": r.diem_mieng ?? "",
          "Vở": r.diem_vo ?? "",
          "15'": r.diem_15_phut ?? "",
          "1 Tiết": r.diem_1_tiet ?? "",
          "Thi": r.diem_thi ?? "",
          "Điểm TB": r.diem_tb ?? "",
          "Học Lực": r.hocLuc ?? "",
          "Hạnh Kiểm": r.hanhKiem ?? "",
          "Vắng Có Phép": r.vangCoPhep !== null ? r.vangCoPhep : "",
          "Vắng Không Phép": r.vangKhongPhep !== null ? r.vangKhongPhep : "",
          "Trạng Thái": rowStatus.label,
        };
      });
      const ws = XLSX.utils.json_to_sheet(data);
      ws["!cols"] = [
        { wch: 5 }, { wch: 26 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
        { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
        { wch: 13 }, { wch: 15 }, { wch: 16 }
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, HOC_KY_LABELS[hocKy]);
      const fileName = `SoDiem_${lop}_${hocKy}_${namHoc}.xlsx`;
      const res = await triggerSafeExcelDownload(XLSX, wb, fileName);
      if (res?.cancelled) {
        showToast("Đã hủy lưu file", "info");
      } else if (res?.method === "picker") {
        showToast("Đã lưu sổ điểm thành công", "success");
      } else {
        showToast("Đang tải file về máy...", "info");
      }
    } catch (err) {
      console.error("export excel error:", err);
      showToast("Xuất Excel thất bại", "error");
    } finally {
      setExporting(false);
    }
  }, [rowsWithWarning, partialErrors, hocKy, lop, namHoc, showToast]);

  const exportPDF = useCallback(async () => {
    if (exportingPdf) return;
    setShowExportMenu(false);
    if (rowsWithWarning.length === 0) {
      showToast("Lớp chưa có Giáo lý sinh để xuất sổ điểm", "warning");
      return;
    }
    setExportingPdf(true);
    try {
      const safeLop = String(lop || "Lop").replace(/[^a-zA-Z0-9_-]/g, "_");
      const fileName = `SoDiem_${safeLop}_${hocKy}_${namHoc}.pdf`;
      const blob = await exportGradesReportPdf({
        lop,
        namHoc,
        hocKy,
        teacherName: classInfo?.displayTeacherName || "",
        scoreFields,
        rows: rowsWithWarning,
      });
      const res = await triggerSafePdfDownload(blob, fileName);
      if (res?.cancelled) {
        showToast("Đã hủy lưu file", "info");
        return;
      }
      if (res?.method === "picker") {
        showToast("Đã lưu sổ điểm PDF thành công", "success");
      } else {
        showToast("Đang tải file về máy...", "info");
      }
    } catch (err) {
      console.error("Export grades PDF error:", err);
      showToast("Xuất PDF thất bại", "error");
    } finally {
      setExportingPdf(false);
    }
  }, [exportingPdf, lop, hocKy, namHoc, classInfo, scoreFields, rowsWithWarning, showToast]);

  return (
    <div className="flex flex-col gap-4 sm:gap-5 pb-16 sm:pb-0">
      {/* ── HEADER & TOOLBAR SỔ ĐIỂM (BỐ CỤC PHẲNG, YÊN TĨNH, TỐI ƯU MOBILE) ── */}
      <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] shadow-2xs p-3.5 sm:p-5 flex flex-col gap-3 sm:gap-4">
        {/* ================= GIAO DIỆN DESKTOP (>= 1024px) ================= */}
        <div className="hidden lg:flex flex-col gap-4">
          {/* Hàng 1 Desktop: Nút Quay lại & Khối */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#314e3e] dark:text-[#d6b883] bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] shadow-2xs hover:bg-[#314e3e]/5 active:scale-[0.98] transition-all flex-shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> <span>Danh sách lớp</span>
            </button>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${khoiStyle.badge}`}>
              {khoiName}
            </span>
          </div>

          {/* Hàng 2 Desktop: Tiêu Đề & Điều Khiển */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#293d32] dark:text-[#ecece0] font-sans leading-tight">
                Sổ điểm Lớp {lop}
              </h2>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#575e55] dark:text-[#b0b9ac] mt-1 flex-wrap">
                {schedInfo?.room && (
                  <span className="inline-flex items-center gap-1 text-[#293d32] dark:text-[#ecece0] font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-[#7c5c2d] dark:text-[#d4b47d]" />
                    Phòng {schedInfo.room}{schedInfo.ca ? ` · Ca ${schedInfo.ca}` : ""}
                  </span>
                )}
                {classInfo?.displayTeacherName && (
                  <>
                    {schedInfo?.room && <span className="text-[#dedfd4] dark:text-[#354237]">·</span>}
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d6b883]" />
                      <span>GLV:</span>
                      <strong className="text-[#293d32] dark:text-[#ecece0] font-semibold">
                        {formatTeachersDisplay(classInfo.displayTeacherName)}
                      </strong>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Desktop Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Switcher Học Kỳ */}
              <div className="flex items-center p-1 bg-[#faf8f3] dark:bg-[#151c18] rounded-xl border border-[#dedfd4] dark:border-[#354237] shadow-inner min-h-[44px]">
                {Object.entries(HOC_KY_LABELS).map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => onHocKyChange(k)}
                    className={`px-4 py-1.5 min-h-[36px] rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      hocKy === k
                        ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-2xs"
                        : "text-[#575e55] dark:text-[#b0b9ac] hover:text-[#293d32] dark:hover:text-[#ecece0]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Nút Khóa / Mở Khóa */}
              <button
                type="button"
                onClick={handleToggleLock}
                className={`min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex-shrink-0 cursor-pointer ${
                  isLocked
                    ? "bg-stone-100 dark:bg-stone-800 text-[#293d32] dark:text-[#ecece0] border-[#dedfd4] dark:border-[#354237] hover:bg-stone-200"
                    : "bg-stone-100 dark:bg-stone-800 text-[#293d32] dark:text-[#ecece0] border-[#dedfd4] dark:border-[#354237] hover:bg-stone-200"
                }`}
              >
                {isLocked ? <LockOpen className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-[#7c5c2d] dark:text-[#d4b47d]" />}
                <span>{isLocked ? `Mở lại sổ ${hocKy}` : `Khóa sổ ${hocKy}`}</span>
              </button>

              {/* Nút Xuất Dữ Liệu Dropdown (Desktop) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowExportMenu((prev) => !prev)}
                  disabled={loading || rowsWithWarning.length === 0}
                  aria-expanded={showExportMenu}
                  aria-haspopup="menu"
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] hover:bg-stone-100 dark:hover:bg-stone-800 text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] text-xs font-bold shadow-2xs active:scale-[0.98] transition-all flex-shrink-0 disabled:opacity-40 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" />
                  <span>Xuất dữ liệu</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>

                {showExportMenu && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-52 bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-xl shadow-xl z-20 p-1.5 flex flex-col gap-1"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={exportExcel}
                      disabled={exporting}
                      className="min-h-[44px] w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-[#293d32] dark:text-[#ecece0] hover:bg-stone-100 dark:hover:bg-stone-800 text-left cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" />
                      <span>Xuất bảng Excel (.xlsx)</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={exportPDF}
                      disabled={exportingPdf}
                      className="min-h-[44px] w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-[#293d32] dark:text-[#ecece0] hover:bg-stone-100 dark:hover:bg-stone-800 text-left cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span>Xuất sổ điểm PDF (.pdf)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= GIAO DIỆN MOBILE & TABLET (< 1024px) ================= */}
        <div className="flex flex-col gap-2.5 lg:hidden">
          {/* Hàng 1 Mobile: Nút Quay lại + Tiêu Đề + Badge Khối */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button
                type="button"
                onClick={onBack}
                className="min-h-[40px] px-2.5 py-1.5 inline-flex items-center gap-1 rounded-xl text-xs font-bold text-[#314e3e] dark:text-[#d6b883] bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] shadow-2xs hover:bg-[#314e3e]/5 active:scale-[0.98] transition-all flex-shrink-0 cursor-pointer"
                aria-label="Quay lại danh sách lớp"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Lớp</span>
              </button>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-[#293d32] dark:text-[#ecece0] font-sans truncate leading-tight">
                  Lớp {lop}
                </h2>
                <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] truncate mt-0.5">
                  {schedInfo?.room ? `Phòng ${schedInfo.room}` : ""}
                  {classInfo?.displayTeacherName ? `${schedInfo?.room ? " · " : ""}GLV: ${formatTeachersDisplay(classInfo.displayTeacherName)}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${khoiStyle.badge}`}>
                {khoiName}
              </span>
            </div>
          </div>

          {/* Hàng 2 Mobile: Switcher Học Kỳ + Nút Khóa Sổ + Nút Xuất */}
          <div className="pt-2 border-t border-[#dedfd4]/60 dark:border-[#354237]/60 flex items-center justify-between gap-2">
            {/* Switcher HK1/HK2 nhỏ gọn */}
            <div className="flex items-center p-0.5 bg-[#faf8f3] dark:bg-[#151c18] rounded-xl border border-[#dedfd4] dark:border-[#354237] shadow-inner min-h-[40px]">
              {Object.entries(HOC_KY_LABELS).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => onHocKyChange(k)}
                  className={`px-3 py-1 min-h-[34px] rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    hocKy === k
                      ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-2xs"
                      : "text-[#575e55] dark:text-[#b0b9ac]"
                  }`}
                >
                  {k === "HK1" ? "HK I" : "HK II"}
                </button>
              ))}
            </div>

            {/* Cụm Action Buttons: Khóa Sổ & Xuất */}
            <div className="flex items-center gap-1.5 justify-end">
              <button
                type="button"
                onClick={handleToggleLock}
                title={isLocked ? "Mở lại sổ điểm học kỳ" : "Khóa sổ điểm học kỳ"}
                className="min-h-[40px] inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] shadow-2xs active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                {isLocked ? <LockOpen className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-[#7c5c2d] dark:text-[#d4b47d]" />}
                <span>{isLocked ? "Mở sổ" : "Khóa"}</span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowExportMenu((prev) => !prev)}
                  disabled={loading || rowsWithWarning.length === 0}
                  aria-expanded={showExportMenu}
                  aria-haspopup="menu"
                  className="min-h-[40px] inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] hover:bg-stone-100 dark:hover:bg-stone-800 text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] text-xs font-bold shadow-2xs active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d6b883]" />
                  <span>Xuất</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {showExportMenu && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-52 bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-xl shadow-xl z-20 p-1.5 flex flex-col gap-1"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={exportExcel}
                      disabled={exporting}
                      className="min-h-[44px] w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-[#293d32] dark:text-[#ecece0] hover:bg-stone-100 dark:hover:bg-stone-800 text-left cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" />
                      <span>Xuất bảng Excel (.xlsx)</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={exportPDF}
                      disabled={exportingPdf}
                      className="min-h-[44px] w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-[#293d32] dark:text-[#ecece0] hover:bg-stone-100 dark:hover:bg-stone-800 text-left cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span>Xuất sổ điểm PDF (.pdf)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BANNER CẢNH BÁO LỖI DỮ LIỆU TỪNG PHẦN ── */}
      {partialErrors.attendanceError && (
        <div className="px-4 py-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-2xl flex items-center justify-between gap-3 flex-wrap text-xs font-medium text-amber-900 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span>Chưa thể tải dữ liệu chuyên cần. Điểm số các môn vẫn hiển thị bình thường.</span>
          </div>
          <button
            type="button"
            onClick={reload}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-amber-200/80 dark:bg-amber-900/60 font-bold hover:bg-amber-300 transition-colors cursor-pointer"
          >
            Tải lại chuyên cần
          </button>
        </div>
      )}

      {partialErrors.termError && (
        <div className="px-4 py-3 bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-700 rounded-2xl flex items-center justify-between gap-3 flex-wrap text-xs font-medium text-stone-800 dark:text-stone-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-stone-500 flex-shrink-0" />
            <span>Chưa thể tải dữ liệu xếp loại học lực & hạnh kiểm tổng hợp.</span>
          </div>
          <button
            type="button"
            onClick={reload}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-stone-200 dark:bg-stone-700 font-bold hover:bg-stone-300 transition-colors cursor-pointer"
          >
            Tải lại đánh giá
          </button>
        </div>
      )}

      {partialErrors.gradesError && (
        <div className="px-4 py-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-2xl flex items-center justify-between gap-3 flex-wrap text-xs font-medium text-rose-900 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>Chưa thể tải dữ liệu bảng điểm học kỳ.</span>
          </div>
          <button
            type="button"
            onClick={reload}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-rose-200/80 dark:bg-rose-900/60 font-bold hover:bg-rose-300 transition-colors cursor-pointer"
          >
            Tải lại điểm
          </button>
        </div>
      )}

      {/* ── 3 KHỐI KPI TINH GỌN (REPLACING 4 COMPLEX ROWS) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* KPI 1: Đã Có Điểm */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] shadow-2xs flex flex-col justify-between gap-1">
          <span className="text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-wider">
            Đã có điểm
          </span>
          <div className="text-lg sm:text-xl font-bold font-sans text-[#293d32] dark:text-[#ecece0]">
            {classStats.scoreCount} / {classStats.total} <span className="text-xs font-normal text-[#575e55] dark:text-[#b0b9ac]">em</span>
          </div>
          <span className="text-xs text-[#575e55] dark:text-[#b0b9ac]">
            {classStats.total - classStats.scoreCount > 0 ? `${classStats.total - classStats.scoreCount} em chưa nhập` : "Đã hoàn tất"}
          </span>
        </div>

        {/* KPI 2: Cần Theo Dõi (Bấm để kích hoạt lọc nhanh) */}
        <button
          type="button"
          onClick={() => {
            if (classStats.warningCount > 0) {
              setStudentFilter((prev) => (prev === "warning" ? "all" : "warning"));
            }
          }}
          className={`p-3.5 sm:p-4 rounded-2xl border shadow-2xs flex flex-col justify-between gap-1 text-left transition-all ${
            classStats.warningCount > 0
              ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900/50 cursor-pointer hover:border-amber-400"
              : "bg-[#fffefa] dark:bg-[#1e2821] border-[#dedfd4] dark:border-[#354237] cursor-default"
          }`}
        >
          <span className={`text-xs font-semibold uppercase tracking-wider ${
            classStats.warningCount > 0 ? "text-amber-800 dark:text-amber-300" : "text-[#575e55] dark:text-[#b0b9ac]"
          }`}>
            Cần theo dõi
          </span>
          <div className={`text-lg sm:text-xl font-bold font-sans ${
            classStats.warningCount > 0 ? "text-amber-900 dark:text-amber-200" : "text-[#293d32] dark:text-[#ecece0]"
          }`}>
            {classStats.warningCount} <span className="text-xs font-normal text-[#575e55] dark:text-[#b0b9ac]">em</span>
          </div>
          <span className={`text-xs ${
            classStats.warningCount > 0 ? "text-amber-800 dark:text-amber-300 font-medium" : "text-[#575e55] dark:text-[#b0b9ac]"
          }`}>
            {classStats.warningCount > 0 ? "Nhấp để lọc danh sách" : "Không có em cần theo dõi"}
          </span>
        </button>

        {/* KPI 3: Điểm TB Lớp (Full hàng trên mobile nhỏ) */}
        <div className="col-span-2 sm:col-span-1 p-3.5 sm:p-4 rounded-2xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] shadow-2xs flex flex-col justify-between gap-1">
          <span className="text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-wider">
            Điểm TB lớp
          </span>
          <div className="text-lg sm:text-xl font-bold font-sans tabular-nums text-[#314e3e] dark:text-[#d6b883]">
            {classStats.avgScore !== null ? `${classStats.avgScore} / 10` : "—"}
          </div>
          <span className="text-xs text-[#575e55] dark:text-[#b0b9ac]">
            {classStats.scoreCount > 0 ? `Tính trên ${classStats.scoreCount}/${classStats.total} em` : "Chưa có điểm"}
          </span>
        </div>
      </div>

      {/* ── BỘ LỌC & TÌM KIẾM HỌC SINH ── */}
      <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] p-4 shadow-2xs flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Mobile Filter 3-Button Bar (< 1024px) */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              aria-pressed={studentFilter === "all"}
              onClick={() => setStudentFilter("all")}
              className={`min-h-[44px] flex-1 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                studentFilter === "all"
                  ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-2xs"
                  : "bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] border border-[#dedfd4] dark:border-[#354237]"
              }`}
            >
              Tất cả ({filterCounts.all})
            </button>

            {filterCounts.warning > 0 && (
              <button
                type="button"
                aria-pressed={studentFilter === "warning"}
                onClick={() => setStudentFilter((prev) => (prev === "warning" ? "all" : "warning"))}
                className={`min-h-[44px] flex-1 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  studentFilter === "warning"
                    ? "bg-amber-700 text-white dark:bg-amber-600 dark:text-white shadow-2xs"
                    : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Theo dõi ({filterCounts.warning})
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowAdvancedFilter(true)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeFilterLabel && studentFilter !== "all" && studentFilter !== "warning"
                  ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d]"
                  : "bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] border border-[#dedfd4] dark:border-[#354237]"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Lọc ▾</span>
            </button>
          </div>

          {/* Desktop Filter Inline Pills (>= 1024px) */}
          <div className="hidden lg:flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              aria-pressed={studentFilter === "all"}
              onClick={() => setStudentFilter("all")}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                studentFilter === "all"
                  ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-2xs"
                  : "bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] border border-[#dedfd4] dark:border-[#354237]"
              }`}
            >
              Tất cả ({filterCounts.all})
            </button>
            {filterCounts.warning > 0 && (
              <button
                type="button"
                aria-pressed={studentFilter === "warning"}
                onClick={() => setStudentFilter((prev) => (prev === "warning" ? "all" : "warning"))}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                  studentFilter === "warning"
                    ? "bg-amber-700 text-white dark:bg-amber-600 dark:text-white shadow-2xs"
                    : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Cần theo dõi ({filterCounts.warning})
              </button>
            )}
            <button
              type="button"
              aria-pressed={studentFilter === "gioi"}
              onClick={() => setStudentFilter("gioi")}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                studentFilter === "gioi"
                  ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-2xs"
                  : "bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] border border-[#dedfd4] dark:border-[#354237]"
              }`}
            >
              Giỏi ({filterCounts.gioi})
            </button>
            <button
              type="button"
              aria-pressed={studentFilter === "kha"}
              onClick={() => setStudentFilter("kha")}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                studentFilter === "kha"
                  ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-2xs"
                  : "bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] border border-[#dedfd4] dark:border-[#354237]"
              }`}
            >
              Khá ({filterCounts.kha})
            </button>
            <button
              type="button"
              aria-pressed={studentFilter === "tb"}
              onClick={() => setStudentFilter("tb")}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                studentFilter === "tb"
                  ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-2xs"
                  : "bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] border border-[#dedfd4] dark:border-[#354237]"
              }`}
            >
              TB ({filterCounts.tb})
            </button>
            {filterCounts.yeu > 0 && (
              <button
                type="button"
                aria-pressed={studentFilter === "yeu"}
                onClick={() => setStudentFilter("yeu")}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  studentFilter === "yeu"
                    ? "bg-red-700 text-white dark:bg-red-600 dark:text-white shadow-2xs"
                    : "bg-[#faf8f3] dark:bg-[#151c18] text-red-800 dark:text-red-300 border border-[#dedfd4] dark:border-[#354237]"
                }`}
              >
                Yếu ({filterCounts.yeu})
              </button>
            )}
            {filterCounts.chua_co_diem > 0 && (
              <button
                type="button"
                aria-pressed={studentFilter === "chua_co_diem"}
                onClick={() => setStudentFilter("chua_co_diem")}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  studentFilter === "chua_co_diem"
                    ? "bg-stone-700 text-white dark:bg-stone-600 dark:text-white shadow-2xs"
                    : "bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] border border-[#dedfd4] dark:border-[#354237]"
                }`}
              >
                Chưa có điểm ({filterCounts.chua_co_diem})
              </button>
            )}
          </div>

          {/* Ô Tìm kiếm học sinh */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              placeholder="Tìm tên hoặc mã GLS..."
              aria-label="Tìm tên hoặc mã Giáo lý sinh"
              className="w-full min-h-[44px] rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] pl-10 pr-10 py-2 text-base sm:text-sm font-medium text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 dark:placeholder-[#b0b9ac]/60 focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 transition-all shadow-inner"
            />
            {searchStudent && (
              <button
                type="button"
                onClick={() => setSearchStudent("")}
                className="w-11 h-11 flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 cursor-pointer"
                aria-label="Xóa tìm kiếm học sinh"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Dòng Tóm Tắt Kết Quả Sau Lọc */}
        <div className="pt-2 border-t border-[#dedfd4]/60 dark:border-[#354237]/60 flex items-center justify-between text-xs text-[#575e55] dark:text-[#b0b9ac] flex-wrap gap-2">
          <span>
            Hiển thị <strong>{filteredRows.length}</strong> / <strong>{rowsWithWarning.length}</strong> Giáo lý sinh
            {activeFilterLabel && studentFilter !== "all" && (
              <span className="ml-2 inline-flex items-center gap-1 font-bold text-[#314e3e] dark:text-[#d6b883]">
                · Đang lọc: {activeFilterLabel}
                <button
                  type="button"
                  onClick={() => setStudentFilter("all")}
                  className="hover:text-red-600 dark:hover:text-red-400 p-0.5 cursor-pointer"
                  aria-label="Hủy lọc"
                >
                  ×
                </button>
              </span>
            )}
          </span>
          <span className="font-mono">{HOC_KY_LABELS[hocKy]}</span>
        </div>
      </div>

      {/* ── DANH SÁCH & BẢNG ĐIỂM CHI TIẾT (RESPONSIVE: CARD < 1024px, TABLE >= 1024px) ── */}
      {loading ? (
        <>
          <div className="lg:hidden">
            <StudentCardSkeleton count={5} />
          </div>
          <div className="hidden lg:block bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] shadow-2xs overflow-hidden">
            <TableSkeleton rows={8} columns={7} />
          </div>
        </>
      ) : loadError ? (
        <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] p-12 text-center shadow-2xs flex flex-col items-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-500" strokeWidth={1.75} />
          <h4 className="font-bold text-base font-sans text-[#293d32] dark:text-[#ecece0]">Không tải được sổ điểm</h4>
          <p className="text-sm text-[#575e55] dark:text-[#b0b9ac] max-w-sm">
            Đã có lỗi xảy ra khi tải dữ liệu sổ điểm. Vui lòng kiểm tra kết nối mạng và thử lại.
          </p>
          <button
            type="button"
            onClick={reload}
            className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] text-sm font-bold min-h-[44px] px-5 py-2.5 active:scale-[0.97] transition-transform cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Thử lại
          </button>
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold font-sans text-[#293d32] dark:text-[#ecece0]">
            {searchStudent || studentFilter !== "all"
              ? "Không có Giáo lý sinh nào khớp với bộ lọc"
              : "Lớp chưa có Giáo lý sinh nào"}
          </h4>
          <p className="text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac] mt-1">
            Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc chọn bộ lọc khác.
          </p>
        </div>
      ) : (
        <>
          {/* ----- GIAO DIỆN MOBILE & TABLET (< 1024px): CÁC CARD HỌC SINH ĐỘC LẬP ----- */}
          <div className="lg:hidden flex flex-col gap-3">
            {filteredRows.map((r, idx) => (
              <StudentMobileCard
                key={r.student.username}
                row={r}
                index={idx}
                onOpenDetail={(row) => setSelectedStudentDetail(row)}
              />
            ))}
          </div>

          {/* ----- GIAO DIỆN DESKTOP (>= 1024px): BẢNG SẮP XẾP ĐA CỘT THOÁNG ĐÃNG ----- */}
          <div className="hidden lg:block bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto max-h-[68vh]" data-lenis-prevent>
              <table className="w-full text-left border-collapse min-w-[920px]">
                <thead>
                  <tr className="text-xs font-bold text-[#314e3e] dark:text-[#d6b883] bg-[#faf8f3] dark:bg-[#151c18] border-b border-[#dedfd4] dark:border-[#354237] sticky top-0 z-20">
                    <th scope="col" className="px-3 py-3.5 text-center w-12 font-sans font-bold">
                      STT
                    </th>
                    <th scope="col" aria-sort={sortField === "name" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"} className="px-4 py-3.5 left-0 sticky z-20 bg-[#faf8f3] dark:bg-[#151c18] border-r border-[#dedfd4]/60 dark:border-[#354237]/60">
                      <button
                        type="button"
                        onClick={() => handleSortColumn("name")}
                        className="w-full flex items-center gap-1.5 cursor-pointer text-left font-bold text-xs text-[#314e3e] dark:text-[#d6b883] hover:opacity-80 transition-opacity"
                      >
                        <span>Giáo lý sinh</span>
                        {sortField === "name" ? (
                          sortOrder === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                        )}
                      </button>
                    </th>
                    {scoreFields.map((f) => (
                      <th key={f.key} scope="col" className="px-2.5 py-3.5 text-center font-sans font-bold">
                        {f.label}
                      </th>
                    ))}
                    <th scope="col" aria-sort={sortField === "diem_tb" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"} className="px-3 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleSortColumn("diem_tb")}
                        className="w-full flex items-center justify-center gap-1 cursor-pointer font-bold text-xs text-[#314e3e] dark:text-[#d6b883] hover:opacity-80 transition-opacity"
                      >
                        <span>Điểm TB</span>
                        {sortField === "diem_tb" ? (
                          sortOrder === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-center font-sans font-bold">Đánh giá</th>
                    <th scope="col" aria-sort={sortField === "vang" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"} className="px-3 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleSortColumn("vang")}
                        className="w-full flex items-center justify-center gap-1 cursor-pointer font-bold text-xs text-[#314e3e] dark:text-[#d6b883] hover:opacity-80 transition-opacity"
                      >
                        <span>Chuyên cần</span>
                        {sortField === "vang" ? (
                          sortOrder === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-center font-sans font-bold">Trạng thái</th>
                    <th scope="col" className="px-3 py-3.5 text-center xl:sticky xl:right-0 xl:z-20 bg-[#faf8f3] dark:bg-[#151c18] border-l border-[#dedfd4]/60 dark:border-[#354237]/60 font-sans font-bold">Nhật ký</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dedfd4] dark:divide-[#354237]">
                  {filteredRows.map((r, idx) => (
                    <StudentDesktopRow
                      key={r.student.username}
                      row={r}
                      index={idx}
                      scoreFields={scoreFields}
                      partialErrors={partialErrors}
                      onOpenDetail={(row) => setSelectedStudentDetail(row)}
                      onOpenAudit={(s) => setAuditStudent(s)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── CARD QUY ĐỊNH THEO DÕI & KHÓA SỔ ĐIỂM (COLLAPSIBLE RÚT GỌN) ── */}
      <div className="p-4 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] shadow-2xs">
        <button
          type="button"
          onClick={() => setShowPolicyCollapse((prev) => !prev)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#927140] dark:text-[#d4b47d] flex-shrink-0" />
            <span className="text-xs font-bold text-[#927140] dark:text-[#d4b47d]">
              Quy định theo dõi học lực & Khóa sổ điểm học kỳ
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-[#927140] dark:text-[#d4b47d] transition-transform ${showPolicyCollapse ? "rotate-180" : ""}`} />
        </button>

        {showPolicyCollapse && (
          <div className="mt-3 pt-3 border-t border-[#dedfd4]/60 dark:border-[#354237]/60 text-xs sm:text-sm font-medium text-[#575e55] dark:text-[#b0b9ac] leading-relaxed flex flex-col gap-2">
            <p>
              • <strong>Học sinh cần theo dõi:</strong> Bao gồm Giáo lý sinh có Điểm TB dưới 5.0, hoặc vắng không phép từ 3 buổi học trở lên, hoặc tổng số buổi vắng từ 4 buổi học.
            </p>
            <p>
              • <strong>Quyền hạn khóa sổ:</strong> Ban Quản Trị sử dụng nút <em>Khóa sổ</em> để tạm ngưng quyền cập nhật điểm của Giáo lý viên phụ trách trước các kỳ tổng kết hoặc xét duyệt bí tích.
            </p>
          </div>
        )}
      </div>

      {/* Modal Chi Tiết Giáo Lý Sinh Dạng Profile Sheet + Fast Switcher */}
      <StudentDetailModal
        open={!!selectedStudentDetail}
        row={selectedStudentDetail}
        lop={lop}
        hocKy={hocKy}
        namHoc={namHoc}
        onClose={() => setSelectedStudentDetail(null)}
        onOpenAudit={(s) => setAuditStudent(s)}
        currentIndex={selectedIndex}
        totalCount={filteredRows.length}
        onPrev={selectedIndex > 0 ? handlePrevStudent : undefined}
        onNext={selectedIndex < filteredRows.length - 1 ? handleNextStudent : undefined}
      />

      {/* Modal Lịch Sử Sửa Điểm (Admin View) */}
      <GradeAuditModal
        open={!!auditStudent}
        student={auditStudent}
        namHoc={namHoc}
        hocKy={hocKyInt}
        onClose={() => setAuditStudent(null)}
        isAdminViewer={true}
      />

      {/* Modal / Bottom Sheet Bộ Lọc Nâng Cao */}
      <AdvancedFilterModal
        open={showAdvancedFilter}
        activeFilter={studentFilter}
        counts={filterCounts}
        onSelectFilter={(f) => setStudentFilter(f)}
        onClose={() => setShowAdvancedFilter(false)}
      />

      {/* Modal Xác Nhận Khóa / Mở Khóa Sổ Điểm */}
      <PortalConfirmDialog
        open={!!confirmLockDialog}
        title={confirmLockDialog?.title}
        message={confirmLockDialog?.message}
        confirmLabel={confirmLockDialog?.confirmLabel}
        danger={confirmLockDialog?.danger}
        onConfirm={executeLockAction}
        onCancel={() => setConfirmLockDialog(null)}
        busy={lockBusy}
      />
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT: QUẢN TRỊ SỔ ĐIỂM (/quản-trị/sổ-điểm)
   Đồng bộ URL Search Params: ?lop=...&hk=...
   ============================================================ */
export default function GradesTab() {
  const { classes, namHoc, loading, showToast, loadAll } = useAdminContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedLop = searchParams.get("lop") || null;
  const rawHk = searchParams.get("hk");
  const hocKy = rawHk === "HK2" || rawHk === "2" ? "HK2" : "HK1";

  const selectedClass = useMemo(
    () => classes.find((c) => c.lop === selectedLop) || null,
    [classes, selectedLop]
  );

  // Xử lý khi lớp trong URL không tồn tại trong niên khóa
  useEffect(() => {
    if (selectedLop && !loading && !classes.some((c) => c.lop === selectedLop)) {
      setSearchParams({}, { replace: true });
    }
  }, [namHoc, classes, loading, selectedLop, setSearchParams]);

  const handlePickClass = useCallback((lopName) => {
    setSearchParams({ lop: lopName, hk: "HK1" }, { replace: true });
  }, [setSearchParams]);

  const handleBack = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const handleHocKyChange = useCallback((newHk) => {
    if (selectedLop) {
      setSearchParams({ lop: selectedLop, hk: newHk }, { replace: true });
    }
  }, [selectedLop, setSearchParams]);

  if (!selectedLop) {
    return (
      <div className="flex flex-col gap-4 sm:gap-5 pb-16 sm:pb-0">
        <ClassPicker
          classes={classes}
          namHoc={namHoc}
          loading={loading}
          onPick={handlePickClass}
        />
      </div>
    );
  }

  return (
    <ClassGradeBook
      lop={selectedLop}
      namHoc={namHoc}
      classInfo={selectedClass}
      hocKy={hocKy}
      onHocKyChange={handleHocKyChange}
      showToast={showToast}
      onBack={handleBack}
      onLockChange={loadAll}
    />
  );
}