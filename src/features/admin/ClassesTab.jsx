import "./ClassesTab.css";
import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { useLenis } from "lenis/react";
import {
  Search, Users, Plus, Trash2, ChevronLeft, Lock, LockOpen,
  School, Settings, X, UserPlus, Phone, User, AlertTriangle, FileSpreadsheet,
  Download, Calendar, ShieldCheck, CheckCircle2, UserCheck, ArrowRightLeft,
  GraduationCap, Sparkles, HelpCircle, RefreshCw, CheckSquare, Square, MapPin, Clock
} from "lucide-react";
import { useAdminContext } from "./AdminContext.jsx";
import { AVATAR_FALLBACK, handleAvatarError } from "./constants.js";
import { SplitListSkeleton, TableSkeleton, Spinner } from "../../components/ui/Skeleton.jsx";
import {
  fetchClassRoster, fetchStudents, assignStudentToClass, removeStudentFromClass,
  assignTeacherToClass, unassignTeacher, lockTerm, unlockTerm, fetchAllTeachers, fetchClassTeacherRows
} from "./dataLayer.js";
import ExcelImportModal from "./components/ExcelImportModal.jsx";
import AcademicCalendarModal from "./components/AcademicCalendarModal.jsx";
import { exportClassRosterExcel, exportAllClassesSummaryExcel, preloadXLSX } from "./utils/excelRosterHelper.js";
import { SECTORS_DATA } from "../../data/sectorsData.js";
import { SCHEDULE_CLASSES } from "../../data/lichHocData.js";

// Focus and scroll ownership for the class management sheets.
function useClassSheet(open, onClose, lenis) {
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
    const controls = () => Array.from(sheet?.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]') || []).filter((node) => node.getClientRects().length);
    (controls()[0] || sheet)?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") { event.preventDefault(); closeRef.current(); }
      if (event.key !== "Tab") return;
      const items = controls();
      const first = items[0];
      const last = items.at(-1);
      if (!first) { event.preventDefault(); sheet?.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
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

const MAX_TEACHERS_PER_CLASS = 3;
const EMPTY_ARRAY = [];

// Danh mục Lọc Khối Giáo lý chuẩn tại Ban Giáo lý An Ngãi (đồng bộ từ SECTORS_DATA)
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

// Định dạng viền màu và badge nhận diện chuẩn từng Khối Giáo lý
export const SECTOR_ACCENT_STYLES = {
  "chien-con": {
    stripe: "border-l-4 border-l-emerald-500",
    badge: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40",
    name: "Khối Khai Tâm",
  },
  "ruoc-le": {
    stripe: "border-l-4 border-l-amber-500",
    badge: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40",
    name: "Khối Rước Lễ",
  },
  "them-suc": {
    stripe: "border-l-4 border-l-red-500",
    badge: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200/60 dark:border-red-800/40",
    name: "Khối Thêm Sức",
  },
  "phung-vu": {
    stripe: "border-l-4 border-l-sky-500",
    badge: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/40",
    name: "Khối Phụng Vụ",
  },
  "kinh-thanh": {
    stripe: "border-l-4 border-l-[#927140]",
    badge: "bg-[#d4b47d]/15 text-[#7c5c2d] dark:text-[#d4b47d] border border-[#d4b47d]/30",
    name: "Khối Kinh Thánh",
  },
  "vao-doi": {
    stripe: "border-l-4 border-l-orange-500",
    badge: "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/40",
    name: "Khối Vào Đời",
  },
  "other": {
    stripe: "border-l-4 border-l-[#314e3e] dark:border-l-[#d6b883]",
    badge: "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700",
    name: "Lớp Giáo lý",
  }
};

export function getKhoiStyle(khoiId) {
  return SECTOR_ACCENT_STYLES[khoiId] || SECTOR_ACCENT_STYLES["other"];
}

// Đối chiếu phòng học và ca học thực tế từ /lịch-học
export function getScheduleInfoForClass(lopName) {
  if (!lopName) return null;
  const clean = lopName.trim().toLowerCase();
  const match = SCHEDULE_CLASSES.find((s) => s.name.toLowerCase() === clean);
  if (match) {
    return {
      room: match.room,
      ca: match.ca,
      time: match.time,
    };
  }
  return null;
}

export function detectKhoiByLop(lopName) {
  if (!lopName) return "other";
  const lower = lopName.toLowerCase();
  if (lower.includes("chiên con") || lower.includes("khai tâm") || lower.includes("vườn trẻ") || lower.includes("cc")) return "chien-con";
  if (lower.includes("rước lễ") || lower.includes("rl") || lower.includes("rllđ")) return "ruoc-le";
  if (lower.includes("thêm sức") || lower.includes("ts")) return "them-suc";
  if (lower.includes("phụng vụ") || lower.includes("pv") || lower.includes("bao đồng")) return "phung-vu";
  if (lower.includes("kinh thánh") || lower.includes("kt")) return "kinh-thanh";
  if (lower.includes("vào đời") || lower.includes("vd")) return "vao-doi";
  return "other";
}

export function getKhoiLabel(khoiId) {
  const match = KHOI_FILTERS.find((k) => k.id === khoiId);
  return match ? match.label : "Lớp Giáo lý";
}

export function getKhoiShortLabel(khoiId) {
  const match = KHOI_FILTERS.find((k) => k.id === khoiId);
  return match ? match.shortLabel : "Lớp Giáo lý";
}

function layTenThanh(t) { return t?.ten_thanh || t?.tenThanh || ""; }
function laySoDienThoai(t) { return t?.so_dien_thoai || t?.sdt || t?.dien_thoai || t?.phone || ""; }

/* ============================================================
   MODAL XÁC NHẬN CHUẨN PORTAL (HỖ TRỢ BOTTOM SHEET TRÊN MOBILE)
   ============================================================ */
const PortalConfirmDialog = React.memo(({ open, title, message, confirmLabel, danger, onConfirm, onCancel, busy }) => {
  const lenis = useLenis();

  const sheetRef = useClassSheet(open, () => { if (!busy) onCancel(); }, lenis);

  if (!open) return null;

  return createPortal(
    <div
      className="class-sheet fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm"
      onClick={!busy ? onCancel : undefined}
      ref={sheetRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-[#fffefa] dark:bg-[#1e2821] rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#dedfd4] dark:border-[#354237] relative flex flex-col gap-4 text-[#293d32] dark:text-[#ecece0] pb-[calc(1.5rem+env(safe-area-inset-bottom))] transition-colors"
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              danger
                ? "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30"
                : "bg-[#d4b47d]/20 dark:bg-[#d4b47d]/10 text-[#7c5c2d] dark:text-[#d4b47d] border border-[#d4b47d]/30"
            }`}
          >
            <AlertTriangle className="w-6 h-6" strokeWidth={2.2} />
          </div>
          <div className="flex-1 mt-0.5">
            <h3 id="confirm-modal-title" className="text-lg sm:text-xl font-bold font-serif text-[#293d32] dark:text-[#ecece0] leading-tight mb-1.5">
              {title}
            </h3>
            <p className="text-sm font-medium text-[#575e55] dark:text-[#b0b9ac] leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-3 pt-2 border-t border-[#dedfd4]/60 dark:border-[#354237]/60">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="min-h-[44px] flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-[#575e55] dark:text-[#b0b9ac] bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`min-h-[44px] flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 cursor-pointer ${
              danger
                ? "bg-red-600 hover:bg-red-700 shadow-red-600/20"
                : "bg-[#314e3e] hover:bg-[#263e32] dark:bg-[#d6b883] dark:hover:bg-[#c9a76d] dark:text-[#19251d] shadow-[#314e3e]/20"
            }`}
          >
            {busy && <Spinner className="w-4 h-4" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
});

/* ============================================================
   MODAL CHUYỂN LỚP NHANH CHO GIÁO LÝ SINH (BOTTOM SHEET MOBILE)
   ============================================================ */
const TransferStudentModal = React.memo(({ open, student, currentLop, availableClasses, namHoc, onClose, onSuccess, showToast }) => {
  const [targetLop, setTargetLop] = useState("");
  const [busy, setBusy] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      lenis?.stop();
      // Chọn mặc định lớp đầu tiên khác currentLop
      const firstOther = availableClasses.find((c) => c.lop !== currentLop);
      if (firstOther) setTargetLop(firstOther.lop);
    } else {
      document.body.style.overflow = "";
      lenis?.start();
      setTargetLop("");
    }
    return () => {
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [open, currentLop, availableClasses, lenis]);

  if (!open || !student) return null;

  const handleTransfer = async () => {
    if (!targetLop || targetLop === currentLop) {
      showToast("Vui lòng chọn lớp học đích khác lớp hiện tại", "warning");
      return;
    }
    setBusy(true);
    try {
      await assignStudentToClass(student.username, targetLop, namHoc);
      const studentName = student.hoTen || student.username;
      const holyName = student.tenThanh ? `${student.tenThanh} ` : "";
      showToast(`Đã chuyển Giáo lý sinh "${holyName}${studentName}" sang Lớp ${targetLop}`, "success");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Transfer student error:", err);
      showToast("Chuyển lớp thất bại. Vui lòng thử lại.", "error");
    } finally {
      setBusy(false);
    }
  };

  const otherClasses = availableClasses.filter((c) => c.lop !== currentLop);
  const studentDisplayName = student.hoTen || student.username;
  const studentHoly = student.tenThanh ? `${student.tenThanh} ` : "";

  return createPortal(
    <div
      className="class-sheet fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm"
      onClick={!busy ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="transfer-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-[#fffefa] dark:bg-[#1e2821] rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#dedfd4] dark:border-[#354237] relative flex flex-col gap-4 text-[#293d32] dark:text-[#ecece0] pb-[calc(1.5rem+env(safe-area-inset-bottom))] transition-colors"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#dedfd4]/60 dark:border-[#354237]/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] flex items-center justify-center flex-shrink-0">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 id="transfer-modal-title" className="text-base sm:text-lg font-bold font-serif text-[#293d32] dark:text-[#ecece0]">
                Chuyển lớp cho Giáo lý sinh
              </h3>
              <p className="text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac]">
                Niên khóa {namHoc}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thông tin học sinh */}
        <div className="p-3.5 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden border border-[#dedfd4] dark:border-[#354237] bg-stone-100 dark:bg-stone-800 flex-shrink-0">
            <img src={student.avatar || AVATAR_FALLBACK} alt="" className="w-full h-full object-cover" onError={handleAvatarError} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#293d32] dark:text-[#ecece0] truncate">
              {studentHoly}<span className="text-[#314e3e] dark:text-[#d6b883]">{studentDisplayName}</span>
            </p>
            <p className="text-xs font-mono text-[#575e55] dark:text-[#b0b9ac] truncate">
              @{student.username} · Lớp hiện tại: <strong className="text-[#7c5c2d] dark:text-[#d4b47d] font-bold">{currentLop}</strong>
            </p>
          </div>
        </div>

        {/* Chọn lớp đích */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="target-class-select" className="text-xs font-bold uppercase tracking-wider text-[#314e3e] dark:text-[#d6b883]">
            Chuyển sang Lớp đích
          </label>
          {otherClasses.length === 0 ? (
            <p className="text-xs text-amber-600 dark:text-amber-400 italic p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
              Không có lớp học nào khác trong niên khóa này để chuyển. Hãy khởi tạo thêm lớp mới trước.
            </p>
          ) : (
            <select
              id="target-class-select"
              value={targetLop}
              onChange={(e) => setTargetLop(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] px-3.5 py-2 text-sm font-bold text-[#293d32] dark:text-[#ecece0] focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 cursor-pointer shadow-inner"
            >
              {otherClasses.map((c) => (
                <option key={c.lop} value={c.lop}>
                  Lớp {c.lop} ({getKhoiShortLabel(detectKhoiByLop(c.lop))} · {c.studentCount || 0} em)
                </option>
              ))}
            </select>
          )}
          <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] mt-1 leading-relaxed">
            Học sinh sẽ được ghi danh ngay sang Lớp mới trong niên khóa {namHoc}.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-2 pt-3 border-t border-[#dedfd4]/60 dark:border-[#354237]/60">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="min-h-[44px] flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-[#575e55] dark:text-[#b0b9ac] bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={busy || !targetLop || otherClasses.length === 0}
            onClick={handleTransfer}
            className="min-h-[44px] flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#314e3e] hover:bg-[#263e32] dark:bg-[#d6b883] dark:hover:bg-[#c9a76d] dark:text-[#19251d] shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            {busy && <Spinner className="w-4 h-4" />}
            Xác nhận chuyển
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
});

/* ============================================================
   BOTTOM ACTION SHEET: CHI TIẾT & TÁC VỤ GIÁO LÝ SINH (MOBILE)
   ============================================================ */
const StudentActionSheet = React.memo(({
  open,
  student,
  lop,
  namHoc,
  onClose,
  onOpenTransfer,
  onOpenRemove,
}) => {
  const lenis = useLenis();

  const sheetRef = useClassSheet(open, onClose, lenis);

  if (!open || !student) return null;

  const holyName = student.tenThanh ? `${student.tenThanh} ` : "";
  const studentName = student.hoTen || student.username;
  const sdt = student.soDienThoai || student.sdt || student.phone || "";
  const gioiTinh = student.gioiTinh || student.gioi_tinh || student.phai || "";
  const isNam = gioiTinh.toLowerCase() === "nam";

  return createPortal(
    <div
      className="class-sheet fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm"
      onClick={onClose}
      ref={sheetRef}
      tabIndex={-1}
      aria-label="Thao tác giáo lý sinh"
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-action-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-[#fffefa] dark:bg-[#1e2821] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#dedfd4] dark:border-[#354237] max-h-[90dvh] overflow-y-auto flex flex-col gap-4 text-[#293d32] dark:text-[#ecece0] pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
        data-lenis-prevent
      >
        {/* Header với nút đóng */}
        <div className="flex items-center justify-between border-b border-[#dedfd4]/60 dark:border-[#354237]/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 id="student-action-title" className="text-base font-bold font-serif text-[#293d32] dark:text-[#ecece0]">
                Tác vụ Giáo lý sinh
              </h3>
              <p className="text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac]">
                Lớp {lop} · Niên khóa {namHoc}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-stone-600 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="p-4 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#314e3e]/20 dark:border-[#d6b883]/30 bg-stone-100 dark:bg-stone-800 flex-shrink-0">
            <img src={student.avatar || AVATAR_FALLBACK} alt="" className="w-full h-full object-cover" onError={handleAvatarError} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-base font-bold text-[#293d32] dark:text-[#ecece0] truncate">
                {holyName && <span className="text-[#7c5c2d] dark:text-[#d4b47d] mr-1">{holyName}</span>}
                {studentName}
              </p>
              {gioiTinh && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isNam
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40"
                    : "bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400 border border-pink-200/60 dark:border-pink-800/40"
                }`}>
                  {gioiTinh}
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-[#575e55] dark:text-[#b0b9ac] truncate mt-0.5">
              Mã GLS: @{student.username}
            </p>
          </div>
        </div>

        {/* Phone / Contact details if present */}
        {sdt ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237]">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac]" />
              <span className="text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac]">Liên hệ phụ huynh:</span>
            </div>
            <a
              href={`tel:${sdt}`}
              className="text-xs font-bold text-[#314e3e] dark:text-[#d6b883] hover:underline flex items-center gap-1"
            >
              {sdt}
            </a>
          </div>
        ) : null}

        {/* Danh sách hành động (Thumb-Zone) */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenTransfer(student);
            }}
            className="min-h-[46px] w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] hover:border-[#314e3e] dark:hover:border-[#d6b883] text-sm font-bold text-[#293d32] dark:text-[#ecece0] active:scale-[0.98] transition-all cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] flex items-center justify-center">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block leading-tight">Chuyển sang Lớp học khác</span>
                <span className="text-xs font-medium text-[#575e55] dark:text-[#b0b9ac]">Chuyển danh sách sang lớp song song hoặc lớp mới</span>
              </div>
            </div>
            <span className="text-xs text-stone-400 font-mono">→</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenRemove(student);
            }}
            className="min-h-[46px] w-full flex items-center justify-between px-4 py-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 hover:bg-red-100/60 dark:hover:bg-red-950/40 text-sm font-bold text-red-700 dark:text-red-400 active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block leading-tight">Rút Giáo lý sinh khỏi Lớp {lop}</span>
                <span className="text-xs font-medium text-red-600/80 dark:text-red-400/80">Rút tên để chuyển về danh sách chờ xếp lớp</span>
              </div>
            </div>
            <span className="text-xs text-red-400 font-mono">→</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
});

/* ============================================================
   BOTTOM SHEET / MODAL THAO TÁC LỚP HỌC CHO MOBILE
   ============================================================ */
const MobileActionsSheet = React.memo(({
  open,
  onClose,
  newLop,
  setNewLop,
  onAddClass,
  activePresets,
  classes,
  onExportSummary,
  exportingSummary,
  onOpenCalendar,
  onOpenExcelModal
}) => {
  const lenis = useLenis();

  const sheetRef = useClassSheet(open, onClose, lenis);

  if (!open) return null;

  return createPortal(
    <div
      className="class-sheet fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm"
      onClick={onClose}
      ref={sheetRef}
      tabIndex={-1}
      aria-label="Mở lớp và công cụ"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#fffefa] dark:bg-[#1e2821] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#dedfd4] dark:border-[#354237] max-h-[90dvh] overflow-y-auto flex flex-col gap-4 text-[#293d32] dark:text-[#ecece0] pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
        data-lenis-prevent
      >
        <div className="flex items-center justify-between border-b border-[#dedfd4]/60 dark:border-[#354237]/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-[#293d32] dark:text-[#ecece0]">
                Thao tác Lớp học & Niên khóa
              </h3>
              <p className="text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac]">
                Công cụ mở lớp & tác vụ quản trị
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-stone-600 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Khởi tạo lớp mới */}
        <div className="flex flex-col gap-2">
          <label htmlFor="mobile-new-lop-input" className="text-xs font-bold uppercase tracking-wider text-[#314e3e] dark:text-[#d6b883]">
            Mở Lớp Học Mới
          </label>
          <div className="flex gap-2">
            <input
              id="mobile-new-lop-input"
              type="text"
              value={newLop}
              onChange={(e) => setNewLop(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onAddClass();
                  onClose();
                }
              }}
              placeholder="Nhập tên lớp, vd: Thêm Sức 2/1..."
              className="flex-1 min-h-[44px] rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] px-3.5 py-2 text-base font-bold text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 dark:placeholder-[#b0b9ac]/60 focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 shadow-inner"
            />
            <button
              type="button"
              onClick={() => {
                onAddClass();
                onClose();
              }}
              className="min-h-[44px] px-4 rounded-xl bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer flex-shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /> Khởi tạo
            </button>
          </div>
        </div>

        {/* Dải gợi ý lớp học từ /lịch-học */}
        <div className="flex flex-col gap-2 pt-1 border-t border-[#dedfd4]/60 dark:border-[#354237]/60">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7c5c2d] dark:text-[#d4b47d] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Gợi ý tạo nhanh từ Lịch học ({activePresets.length} lớp):
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
            {activePresets.map((item) => {
              const className = item.name;
              const isCreated = classes.some((c) => c.lop.toLowerCase() === className.toLowerCase());
              return (
                <button
                  key={item.id || className}
                  type="button"
                  onClick={() => {
                    if (!isCreated) {
                      onAddClass(className);
                      onClose();
                    }
                  }}
                  disabled={isCreated}
                  className={`min-h-[34px] px-2.5 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                    isCreated
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 opacity-75 cursor-default"
                      : "bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] hover:border-[#314e3e] dark:hover:border-[#d6b883] active:scale-95 cursor-pointer"
                  }`}
                  title={isCreated ? `Lớp ${className} đã có trong danh sách` : `Nhấp để khởi tạo nhanh Lớp ${className}`}
                >
                  {isCreated ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span className="line-through">{className}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                      <span>{className}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Các tác vụ hệ thống */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#dedfd4]/60 dark:border-[#354237]/60">
          <span className="text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">
            Tác vụ quản trị niên khóa
          </span>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onExportSummary();
              }}
              disabled={exportingSummary || classes.length === 0}
              className="min-h-[44px] w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-xs font-bold text-[#293d32] dark:text-[#ecece0] hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-[#7c5c2d] dark:text-[#d4b47d]" />
                <span>Xuất Báo Cáo Tổng Hợp Niên Khóa (.xlsx)</span>
              </div>
              <span className="text-xs text-stone-400 font-mono">→</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenExcelModal();
              }}
              className="min-h-[44px] w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-xs font-bold text-[#293d32] dark:text-[#ecece0] hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Nhập danh sách học sinh từ file Excel</span>
              </div>
              <span className="text-xs text-stone-400 font-mono">→</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCalendar();
              }}
              className="min-h-[44px] w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-xs font-bold text-[#293d32] dark:text-[#ecece0] hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#7c5c2d] dark:text-[#d4b47d]" />
                <span>Lịch Niên Khóa & Ngày Nghỉ Lễ Phụng Vụ</span>
              </div>
              <span className="text-xs text-stone-400 font-mono">→</span>
            </button>
          </div>
        </div>
        <button type="button" onClick={onClose} className="min-h-[44px] rounded-xl border border-[#667267] dark:border-[#a8b6aa] px-4 py-3 text-base font-semibold">Đóng công cụ</button>
      </div>
    </div>,
    document.body
  );
});

/* ============================================================
   PANEL: QUẢN LÝ DANH SÁCH LỚP (ROSTER)
   HỖ TRỢ LỌC GIỚI TÍNH, BATCH ENROLLMENT & MOBILE ACTION SHEET
   ============================================================ */
function ClassRosterPanel({ lop, namHoc, availableClasses = [], onBack, onRosterChange, showToast }) {
  const [roster, setRoster] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchRoster, setSearchRoster] = useState("");
  const [searchCandidates, setSearchCandidates] = useState("");
  const [genderFilter, setGenderFilter] = useState("all"); // 'all' | 'nam' | 'nu'
  const [busyUsername, setBusyUsername] = useState(null);
  const [batchBusy, setBatchBusy] = useState(false);
  const [selectedCandidateUsernames, setSelectedCandidateUsernames] = useState(new Set());
  const [confirmState, setConfirmState] = useState(null);
  const [transferStudent, setTransferStudent] = useState(null);
  const [selectedStudentSheet, setSelectedStudentSheet] = useState(null);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [mobileTab, setMobileTab] = useState("roster"); // 'roster' | 'candidates'

  const khoiKey = detectKhoiByLop(lop);
  const khoiStyle = getKhoiStyle(khoiKey);
  const khoiName = getKhoiLabel(khoiKey);
  const schedInfo = getScheduleInfoForClass(lop);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rosterList, students] = await Promise.all([
        fetchClassRoster(lop, namHoc),
        fetchStudents(),
      ]);
      setRoster(rosterList);
      setAllStudents(students);
    } catch {
      showToast("Không tải được danh sách lớp", "error");
    } finally {
      setLoading(false);
    }
  }, [lop, namHoc, showToast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [rosterList, students] = await Promise.all([
          fetchClassRoster(lop, namHoc),
          fetchStudents(),
        ]);
        if (!cancelled) {
          setRoster(rosterList);
          setAllStudents(students);
        }
      } catch {
        if (!cancelled) showToast("Không tải được danh sách lớp", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [lop, namHoc, showToast]);

  useEffect(() => { preloadXLSX(); }, []);

  const rosterUsernames = useMemo(() => new Set(roster.map((s) => s.username)), [roster]);

  // Thống kê Giới tính trong lớp
  const maleCount = useMemo(() => roster.filter((s) => (s.gioiTinh || s.gioi_tinh || s.phai || "").toLowerCase() === "nam").length, [roster]);
  const femaleCount = useMemo(() => roster.filter((s) => {
    const g = (s.gioiTinh || s.gioi_tinh || s.phai || "").toLowerCase();
    return g === "nữ" || g === "nu";
  }).length, [roster]);

  // Lọc danh sách học sinh đã có trong lớp (kết hợp Gender Filter & Search)
  const filteredRoster = useMemo(() => {
    let list = roster;
    if (genderFilter === "nam") {
      list = list.filter((s) => (s.gioiTinh || s.gioi_tinh || s.phai || "").toLowerCase() === "nam");
    } else if (genderFilter === "nu") {
      list = list.filter((s) => {
        const g = (s.gioiTinh || s.gioi_tinh || s.phai || "").toLowerCase();
        return g === "nữ" || g === "nu";
      });
    }
    const q = searchRoster.trim().toLowerCase();
    if (!q) return list;
    return list.filter((s) =>
      (s.hoTen || "").toLowerCase().includes(q) ||
      (s.username || "").toLowerCase().includes(q) ||
      (s.tenThanh || "").toLowerCase().includes(q)
    );
  }, [roster, genderFilter, searchRoster]);

  // Lọc ứng viên chưa được xếp vào lớp nào
  const candidates = useMemo(() => {
    const q = searchCandidates.trim().toLowerCase();
    return allStudents
      .filter((s) => !rosterUsernames.has(s.username))
      .filter((s) => !q || (s.hoTen || "").toLowerCase().includes(q) || (s.username || "").toLowerCase().includes(q) || (s.tenThanh || "").toLowerCase().includes(q));
  }, [allStudents, rosterUsernames, searchCandidates]);

  // Thao tác chọn / bỏ chọn ứng viên ghi danh hàng loạt
  const toggleSelectCandidate = useCallback((username) => {
    setSelectedCandidateUsernames((prev) => {
      const next = new Set(prev);
      if (next.has(username)) {
        next.delete(username);
      } else {
        next.add(username);
      }
      return next;
    });
  }, []);

  const toggleSelectAllCandidates = useCallback(() => {
    if (selectedCandidateUsernames.size === candidates.length) {
      setSelectedCandidateUsernames(new Set());
    } else {
      setSelectedCandidateUsernames(new Set(candidates.map((c) => c.username)));
    }
  }, [selectedCandidateUsernames, candidates]);

  // Ghi danh hàng loạt
  const handleBatchEnroll = async () => {
    if (selectedCandidateUsernames.size === 0) return;
    setBatchBusy(true);
    try {
      const usernames = Array.from(selectedCandidateUsernames);
      await Promise.all(usernames.map((u) => assignStudentToClass(u, lop, namHoc)));
      showToast(`Đã ghi danh ${usernames.length} Giáo lý sinh vào Lớp ${lop}`, "success");
      setSelectedCandidateUsernames(new Set());
      const updatedRoster = await fetchClassRoster(lop, namHoc);
      setRoster(updatedRoster);
      if (onRosterChange) onRosterChange();
    } catch (err) {
      console.error("Batch enroll error:", err);
      showToast("Ghi danh hàng loạt thất bại. Vui lòng thử lại.", "error");
    } finally {
      setBatchBusy(false);
    }
  };

  const executeAction = async () => {
    if (!confirmState) return;
    const { action, student } = confirmState;
    setBusyUsername(student.username);
    try {
      if (action === "add") {
        await assignStudentToClass(student.username, lop, namHoc);
        showToast(`Đã ghi danh ${student.hoTen || student.username} vào Lớp ${lop}`, "success");
      } else {
        await removeStudentFromClass(student.username, namHoc);
        showToast(`Đã rút ${student.hoTen || student.username} khỏi Lớp ${lop}`, "success");
      }
      setRoster(await fetchClassRoster(lop, namHoc));
      if (onRosterChange) onRosterChange();
    } catch {
      showToast("Thao tác thất bại. Vui lòng thử lại.", "error");
    } finally {
      setBusyUsername(null);
      setConfirmState(null);
    }
  };

  const handleExportRoster = async () => {
    if (!roster || roster.length === 0) {
      showToast("Lớp chưa có Giáo lý sinh để tải danh sách", "warning");
      return;
    }
    setExporting(true);
    try {
      const res = await exportClassRosterExcel(lop, namHoc, roster);
      if (res?.cancelled) {
        showToast("Đã hủy lưu file", "info");
      } else if (res?.method === "picker") {
        showToast("Đã lưu file Excel thành công", "success");
      } else {
        showToast("Đang tải file về thiết bị...", "info");
      }
    } catch (err) {
      console.error("Export roster error:", err);
      showToast("Xuất file thất bại", "error");
    } finally {
      setExporting(false);
    }
  };

  const targetStudentName = confirmState?.student?.hoTen || confirmState?.student?.username || "";
  const targetStudentHoly = confirmState?.student?.tenThanh || "";

  return (
    <div className="classes-page flex flex-col gap-4 sm:gap-5">
      {/* ── CARD HEADER & TỔNG QUAN LỚP ── */}
      <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl sm:rounded-3xl border border-[#dedfd4] dark:border-[#354237] shadow-xs overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] flex-wrap">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onBack}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#314e3e] dark:text-[#d6b883] bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] shadow-sm hover:bg-[#314e3e]/5 active:scale-[0.98] transition-all flex-shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> <span className="hidden xs:inline">Trở lại</span>
            </button>
            <div>
              <h3 className="text-lg font-bold text-[#293d32] dark:text-[#ecece0] break-words flex items-center gap-2 leading-tight">
                Lớp {lop}
              </h3>
              <p className="text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac] leading-tight">
                Niên khóa {namHoc}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleExportRoster}
              disabled={exporting || roster.length === 0}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fffefa] dark:bg-[#1e2821] hover:bg-stone-100 dark:hover:bg-stone-800 text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] text-xs font-bold shadow-sm active:scale-[0.98] transition-all flex-shrink-0 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              title={roster.length === 0 ? "Lớp chưa có Giáo lý sinh" : `Tải file Excel danh sách Giáo lý sinh Lớp ${lop}`}
            >
              {exporting ? <Spinner className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5 text-[#575e55] dark:text-[#b0b9ac]" />}
              <span className="hidden sm:inline">Tải danh sách</span>
            </button>

            <button
              type="button"
              onClick={() => setExcelModalOpen(true)}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm active:scale-[0.98] transition-all flex-shrink-0 cursor-pointer"
              title="Nhập danh sách Giáo lý sinh từ file Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Nhập Excel</span>
            </button>

            <span className="min-h-[40px] inline-flex items-center text-xs font-bold text-[#314e3e] dark:text-[#d6b883] bg-[#314e3e]/10 dark:bg-[#d6b883]/15 border border-[#314e3e]/20 dark:border-[#d6b883]/30 px-2.5 py-1 rounded-xl flex-shrink-0">
              {roster.length} em
            </span>
          </div>
        </div>

        {/* ── SUMMARY BANNER: THÔNG TIN KHỐI, PHÒNG HỌC & SĨ SỐ NAM/NỮ ── */}
        <div className={`px-4 sm:px-6 py-2.5 bg-[#faf8f3]/90 dark:bg-[#151c18]/90 flex flex-wrap items-center justify-between gap-2.5 ${khoiStyle.stripe}`}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${khoiStyle.badge}`}>
              {khoiName}
            </span>
            {schedInfo?.room && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#575e55] dark:text-[#b0b9ac] bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] px-2.5 py-0.5 rounded-full">
                <MapPin className="w-3 h-3 text-[#7c5c2d] dark:text-[#d4b47d]" />
                {schedInfo.room} {schedInfo.ca ? `· Ca ${schedInfo.ca}` : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac]">
            <span>Tổng số: <strong className="text-[#293d32] dark:text-[#ecece0] font-bold">{roster.length} em</strong></span>
            <span>·</span>
            <span className="text-blue-700 dark:text-blue-400 font-bold">{maleCount} Nam</span>
            <span>·</span>
            <span className="text-pink-700 dark:text-pink-400 font-bold">{femaleCount} Nữ</span>
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher (< 768px) */}
      <div className="md:hidden flex p-1 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] shadow-xs">
        <button
          type="button"
          onClick={() => setMobileTab("roster")}
          className={`flex-1 min-h-[44px] py-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 rounded-xl transition-all ${
            mobileTab === "roster"
              ? "bg-[#fffefa] dark:bg-[#1e2821] text-[#314e3e] dark:text-[#d6b883] shadow-xs"
              : "text-[#575e55] dark:text-[#b0b9ac]"
          }`}
        >
          <Users className="w-4 h-4" /> Đã xếp lớp ({roster.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("candidates")}
          className={`flex-1 min-h-[44px] py-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 rounded-xl transition-all ${
            mobileTab === "candidates"
              ? "bg-[#fffefa] dark:bg-[#1e2821] text-[#314e3e] dark:text-[#d6b883] shadow-xs"
              : "text-[#575e55] dark:text-[#b0b9ac]"
          }`}
        >
          <Plus className="w-4 h-4" /> Ghi danh thêm ({candidates.length})
        </button>
      </div>

      {loading ? (
        <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl sm:rounded-3xl border border-[#dedfd4] dark:border-[#354237] shadow-xs overflow-hidden">
          <SplitListSkeleton rows={6} />
        </div>
      ) : (
        <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl sm:rounded-3xl border border-[#dedfd4] dark:border-[#354237] shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-0 md:divide-x divide-[#dedfd4] dark:divide-[#354237]">
          {/* CỘT 1: DANH SÁCH ĐÃ XẾP LỚP */}
          <div className={`p-4 sm:p-6 bg-[#fffefa] dark:bg-[#1e2821] ${mobileTab === "candidates" ? "hidden md:block" : "block"}`}>
            <div className="flex flex-col gap-2.5 mb-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#314e3e] dark:text-[#d6b883] flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Giáo lý sinh trong lớp ({filteredRoster.length}/{roster.length})
                </h4>
              </div>

              {/* 3 Pills Lọc Giới Tính Nhanh (1-Tap Filters) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none" data-lenis-prevent>
                <button
                  type="button"
                  onClick={() => setGenderFilter("all")}
                  className={`min-h-[44px] px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    genderFilter === "all"
                      ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-sm"
                      : "bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] border border-[#dedfd4] dark:border-[#354237]"
                  }`}
                >
                  Tất cả ({roster.length})
                </button>
                <button
                  type="button"
                  onClick={() => setGenderFilter("nam")}
                  className={`min-h-[44px] px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    genderFilter === "nam"
                      ? "bg-blue-600 text-white dark:bg-blue-500 dark:text-white shadow-sm"
                      : "bg-[#faf8f3] dark:bg-[#151c18] text-blue-700 dark:text-blue-400 border border-[#dedfd4] dark:border-[#354237]"
                  }`}
                >
                  Nam ({maleCount})
                </button>
                <button
                  type="button"
                  onClick={() => setGenderFilter("nu")}
                  className={`min-h-[44px] px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    genderFilter === "nu"
                      ? "bg-pink-600 text-white dark:bg-pink-500 dark:text-white shadow-sm"
                      : "bg-[#faf8f3] dark:bg-[#151c18] text-pink-700 dark:text-pink-400 border border-[#dedfd4] dark:border-[#354237]"
                  }`}
                >
                  Nữ ({femaleCount})
                </button>
              </div>
            </div>

            {/* Ô tìm kiếm trong lớp */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchRoster}
                onChange={(e) => setSearchRoster(e.target.value)}
                placeholder="Tìm tên hoặc mã Giáo lý sinh..."
                className="w-full min-h-[44px] rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] pl-10 pr-4 py-2 text-base font-medium text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 dark:placeholder-[#b0b9ac]/60 focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 transition-all shadow-inner"
              />
              {searchRoster && (
                <button
                  type="button"
                  onClick={() => setSearchRoster("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Danh sách cuộn */}
            <div className="flex flex-col gap-2 md:max-h-[55vh] md:overflow-y-auto pr-1" data-lenis-prevent>
              {filteredRoster.map((s) => {
                const gioiTinh = s.gioiTinh || s.gioi_tinh || s.phai || "";
                const isNam = gioiTinh.toLowerCase() === "nam";
                return (
                  <div
                    key={s.username}
                    className="flex items-center gap-2.5 sm:gap-3 px-3 py-2.5 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] shadow-sm hover:border-[#314e3e]/40 dark:hover:border-[#d6b883]/40 transition-all group cursor-pointer active:scale-[0.99]"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-[#dedfd4] dark:border-[#354237] flex-shrink-0 bg-stone-100 dark:bg-stone-800">
                      <img src={s.avatar || AVATAR_FALLBACK} alt="" className="w-full h-full object-cover" onError={handleAvatarError} />
                    </div>
                    <button type="button" onClick={() => setSelectedStudentSheet(s)} className="flex-1 min-w-0 min-h-[44px] text-left">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-base font-bold text-[#293d32] dark:text-[#ecece0] break-words leading-relaxed">
                          {s.tenThanh && <span className="text-[#7c5c2d] dark:text-[#d4b47d] font-semibold mr-1.5">{s.tenThanh}</span>}
                          {s.hoTen || s.username}
                        </p>
                        {gioiTinh && (
                          <span className={`text-xs px-1.5 py-0.2 rounded-md font-bold flex-shrink-0 ${
                            isNam
                              ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40"
                              : "bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400 border border-pink-200/60 dark:border-pink-800/40"
                          }`}>
                            {gioiTinh}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono font-medium text-[#575e55] dark:text-[#b0b9ac] truncate">
                        @{s.username}
                      </p>
                    </button>

                    {/* Nhóm nút hành động trên desktop / tablet */}
                    <div className="hidden md:flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setTransferStudent(s)}
                        title="Chuyển sang lớp học khác"
                        aria-label={`Chuyển ${s.hoTen || s.username} sang lớp khác`}
                        className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-stone-400 hover:text-[#314e3e] dark:hover:text-[#d6b883] hover:bg-[#314e3e]/10 dark:hover:bg-[#d6b883]/15 active:scale-95 transition-colors cursor-pointer"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        disabled={busyUsername === s.username}
                        onClick={() => setConfirmState({ action: "remove", student: s })}
                        title="Rút Giáo lý sinh khỏi lớp"
                        aria-label={`Rút ${s.hoTen || s.username} khỏi lớp`}
                        className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 active:scale-95 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {busyUsername === s.username ? <Spinner className="h-4 w-4" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredRoster.length === 0 && (
                <div className="text-center py-12 px-4 border border-dashed border-[#dedfd4] dark:border-[#354237] rounded-2xl bg-[#faf8f3]/50 dark:bg-[#151c18]/50">
                  <p className="text-sm font-medium text-[#575e55] dark:text-[#b0b9ac]">
                    {searchRoster ? "Không tìm thấy Giáo lý sinh khớp với từ khóa." : "Lớp chưa có Giáo lý sinh nào."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* CỘT 2: GHI DANH THÊM TỪ DANH SÁCH KHẢ DỤNG (HỖ TRỢ CHỌN HÀNG LOẠT) */}
          <div className={`p-4 sm:p-6 bg-[#faf8f3]/40 dark:bg-[#151c18]/40 ${mobileTab === "roster" ? "hidden md:block" : "block"} flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7c5c2d] dark:text-[#d4b47d] flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Ghi danh thêm ({candidates.length} khả dụng)
                </h4>
                {candidates.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleSelectAllCandidates}
                    className="text-xs font-bold text-[#314e3e] dark:text-[#d6b883] hover:underline cursor-pointer"
                  >
                    {selectedCandidateUsernames.size === candidates.length ? "Bỏ chọn tất cả" : `Chọn tất cả (${candidates.length})`}
                  </button>
                )}
              </div>

              {/* Ô tìm kiếm ứng viên */}
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchCandidates}
                  onChange={(e) => setSearchCandidates(e.target.value)}
                  placeholder="Tìm tên hoặc mã Giáo lý sinh..."
                  className="w-full min-h-[44px] rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] pl-10 pr-4 py-2 text-base font-medium text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 dark:placeholder-[#b0b9ac]/60 focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 transition-all shadow-sm"
                />
                {searchCandidates && (
                  <button
                    type="button"
                    onClick={() => setSearchCandidates("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Danh sách ứng viên */}
              <div className="flex flex-col gap-2 max-h-[45vh] sm:max-h-[50vh] overflow-y-auto pr-1" data-lenis-prevent>
                {candidates.map((s) => {
                  const isSelected = selectedCandidateUsernames.has(s.username);
                  return (
                    <div
                      key={s.username}
                      onClick={() => toggleSelectCandidate(s.username)}
                      className={`flex items-center gap-2.5 sm:gap-3 px-3 py-2.5 rounded-xl border shadow-sm transition-all cursor-pointer active:scale-[0.99] ${
                        isSelected
                          ? "bg-[#314e3e]/5 dark:bg-[#d6b883]/10 border-[#314e3e] dark:border-[#d6b883]"
                          : "bg-[#fffefa] dark:bg-[#1e2821] border-[#dedfd4] dark:border-[#354237] hover:border-[#314e3e]/30 dark:hover:border-[#d6b883]/30"
                      }`}
                    >
                      {/* Checkbox chọn hàng loạt */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectCandidate(s.username);
                        }}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-[#314e3e] dark:text-[#d6b883] flex-shrink-0 cursor-pointer"
                        aria-label={isSelected ? "Bỏ chọn" : "Chọn"}
                      >
                        {isSelected ? <CheckSquare className="w-5 h-5 text-[#314e3e] dark:text-[#d6b883]" /> : <Square className="w-5 h-5 text-stone-300 dark:text-stone-600" />}
                      </button>

                      <div className="w-8 h-8 rounded-full overflow-hidden border border-[#dedfd4] dark:border-[#354237] flex-shrink-0 bg-stone-100 dark:bg-stone-800">
                        <img src={s.avatar || AVATAR_FALLBACK} alt="" className="w-full h-full object-cover opacity-85" onError={handleAvatarError} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#293d32] dark:text-[#ecece0] truncate leading-tight">
                          {s.tenThanh && <span className="text-[#7c5c2d] dark:text-[#d4b47d] font-semibold mr-1.5">{s.tenThanh}</span>}
                          {s.hoTen || s.username}
                        </p>
                        <p className="text-xs font-mono font-medium text-[#575e55] dark:text-[#b0b9ac] truncate">
                          @{s.username}
                        </p>
                      </div>

                      {/* Nút ghi danh 1-chạm trực tiếp */}
                      <button
                        type="button"
                        disabled={busyUsername === s.username}
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmState({ action: "add", student: s });
                        }}
                        title={`Ghi danh ${s.hoTen || s.username} vào Lớp ${lop}`}
                        aria-label={`Ghi danh ${s.hoTen || s.username} vào Lớp ${lop}`}
                        className="min-h-[44px] min-w-[38px] rounded-xl bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] border border-[#314e3e]/20 dark:border-[#d6b883]/30 hover:bg-[#314e3e] hover:text-white dark:hover:bg-[#d6b883] dark:hover:text-[#19251d] active:scale-95 flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        {busyUsername === s.username ? <Spinner className="h-4 w-4" /> : <Plus className="w-4 h-4 stroke-[3]" />}
                      </button>
                    </div>
                  );
                })}
                {candidates.length === 0 && (
                  <div className="text-center py-12 px-4 border border-dashed border-[#dedfd4] dark:border-[#354237] rounded-2xl bg-[#fffefa]/50 dark:bg-[#1e2821]/50">
                    <p className="text-sm font-medium text-[#575e55] dark:text-[#b0b9ac]">
                      {searchCandidates ? "Không tìm thấy Giáo lý sinh khả dụng." : "Tất cả Giáo lý sinh đã được xếp lớp."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Thanh tác vụ Ghi danh hàng loạt (Batch Enrollment Bar) */}
            {selectedCandidateUsernames.size > 0 && (
              <div className="mt-3 pt-3 border-t border-[#dedfd4] dark:border-[#354237] flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-[#314e3e] dark:text-[#d6b883]">
                  Đã chọn {selectedCandidateUsernames.size} em
                </span>
                <button
                  type="button"
                  disabled={batchBusy}
                  onClick={handleBatchEnroll}
                  className="min-h-[44px] flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] font-bold text-xs sm:text-sm shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  {batchBusy ? <Spinner className="w-4 h-4" /> : <Sparkles className="w-4 h-4 stroke-[2.5]" />}
                  <span>Ghi danh ({selectedCandidateUsernames.size}) em vào Lớp</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Xác nhận Thêm/Rút Giáo lý sinh */}
      <PortalConfirmDialog
        open={!!confirmState}
        title={confirmState?.action === "add" ? "Xác nhận ghi danh Giáo lý sinh?" : "Rút tên khỏi lớp học?"}
        message={
          confirmState?.action === "add"
            ? `Bạn có chắc chắn muốn ghi danh Giáo lý sinh "${targetStudentHoly ? targetStudentHoly + " " : ""}${targetStudentName}" vào Lớp ${lop}?`
            : `Giáo lý sinh "${targetStudentHoly ? targetStudentHoly + " " : ""}${targetStudentName}" sẽ bị rút khỏi Lớp ${lop}. Dữ liệu điểm số và điểm danh trong niên khóa ${namHoc} có thể bị ảnh hưởng.`
        }
        confirmLabel={confirmState?.action === "add" ? "Ghi danh vào lớp" : "Rút khỏi lớp"}
        danger={confirmState?.action === "remove"}
        onConfirm={executeAction}
        onCancel={() => setConfirmState(null)}
        busy={!!busyUsername}
      />

      {/* Bottom Sheet Tác vụ Giáo lý sinh trên Mobile */}
      <StudentActionSheet
        open={!!selectedStudentSheet}
        student={selectedStudentSheet}
        lop={lop}
        namHoc={namHoc}
        onClose={() => setSelectedStudentSheet(null)}
        onOpenTransfer={(s) => setTransferStudent(s)}
        onOpenRemove={(s) => setConfirmState({ action: "remove", student: s })}
      />

      {/* Modal Chuyển Lớp Nhanh */}
      <TransferStudentModal
        open={!!transferStudent}
        student={transferStudent}
        currentLop={lop}
        availableClasses={availableClasses}
        namHoc={namHoc}
        onClose={() => setTransferStudent(null)}
        onSuccess={() => {
          loadAll();
          if (onRosterChange) onRosterChange();
        }}
        showToast={showToast}
      />

      {/* Modal Nhập Excel nội bộ */}
      <ExcelImportModal
        open={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        currentLop={lop}
        namHoc={namHoc}
        onSuccess={() => {
          loadAll();
          if (onRosterChange) onRosterChange();
        }}
        showToast={showToast}
      />
    </div>
  );
}

/* ============================================================
   NÚT KHÓA SỔ HỌC KỲ (TERM LOCK TOGGLE)
   ============================================================ */
const TermLockToggle = React.memo(({ lop, hocKy, isLocked, namHoc, onChanged, showToast, compact }) => {
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const doToggle = async () => {
    setConfirmOpen(false);
    setBusy(true);
    try {
      if (isLocked) {
        await unlockTerm(lop, namHoc, hocKy);
        showToast(`Đã mở khóa Học kỳ ${hocKy} Lớp ${lop}`, "success");
      } else {
        await lockTerm(lop, namHoc, hocKy);
        showToast(`Đã khóa sổ Học kỳ ${hocKy} Lớp ${lop}`, "success");
      }
      onChanged();
    } catch {
      showToast("Thao tác khóa sổ thất bại. Vui lòng thử lại.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => setConfirmOpen(true)}
        className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 disabled:opacity-50 border cursor-pointer ${
          isLocked
            ? "bg-[#314e3e] dark:bg-[#d6b883] border-[#314e3e] dark:border-[#d6b883] text-white dark:text-[#19251d] shadow-xs"
            : "bg-[#fffefa] dark:bg-[#1e2821] border-[#dedfd4] dark:border-[#354237] text-[#575e55] dark:text-[#b0b9ac] hover:text-[#293d32] dark:hover:text-[#ecece0] hover:border-[#314e3e]/40 dark:hover:border-[#d6b883]/40"
        }`}
        title={isLocked ? `Học kỳ ${hocKy} đang khóa (Bấm để mở khóa)` : `Học kỳ ${hocKy} đang mở (Bấm để khóa sổ)`}
        aria-label={`${isLocked ? "Mở khóa" : "Khóa sổ"} Học kỳ ${hocKy} Lớp ${lop}`}
      >
        {busy ? (
          <Spinner className="h-3.5 w-3.5" />
        ) : isLocked ? (
          <Lock className="w-3.5 h-3.5" />
        ) : (
          <LockOpen className="w-3.5 h-3.5" />
        )}
        <span>{compact ? `HK${hocKy}` : `${isLocked ? "Mở khóa" : "Khóa sổ"} HK${hocKy}`}</span>
      </button>

      <PortalConfirmDialog
        open={confirmOpen}
        title={isLocked ? `Mở khóa HK${hocKy} Lớp ${lop}?` : `Khóa sổ HK${hocKy} Lớp ${lop}?`}
        message={
          isLocked
            ? `Khi mở khóa, Giáo lý viên sẽ có quyền chỉnh sửa điểm số và điểm danh của HK${hocKy}. Bạn chắc chắn muốn mở?`
            : `Khi đã khóa sổ, Giáo lý viên KHÔNG THỂ thay đổi bất kỳ điểm số hay điểm danh nào của HK${hocKy} nữa.`
        }
        confirmLabel={isLocked ? "Đồng ý mở khóa" : "Xác nhận khóa sổ"}
        danger={!isLocked}
        onConfirm={doToggle}
        onCancel={() => setConfirmOpen(false)}
        busy={busy}
      />
    </>
  );
});

/* ============================================================
   MODAL CHI TIẾT GIÁO LÝ VIÊN
   ============================================================ */
const TeacherInfoModal = React.memo(({ teacher, onClose }) => {
  const lenis = useLenis();
  useEffect(() => {
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [lenis]);

  if (!teacher) return null;
  const tenThanh = layTenThanh(teacher);
  const soDienThoai = laySoDienThoai(teacher);

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs rounded-3xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] shadow-2xl p-6 relative text-[#293d32] dark:text-[#ecece0]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="min-h-[44px] min-w-[44px] absolute top-3 right-3 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center gap-3 mt-1">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#314e3e]/30 dark:border-[#d6b883]/30 bg-stone-100 dark:bg-stone-800 flex-shrink-0 shadow-md">
            <img src={teacher.avatar || AVATAR_FALLBACK} alt="" className="w-full h-full object-cover" onError={handleAvatarError} />
          </div>
          <div>
            {tenThanh && <p className="text-xs font-bold text-[#7c5c2d] dark:text-[#d4b47d] uppercase tracking-wide">{tenThanh}</p>}
            <p className="text-lg font-bold font-serif text-[#293d32] dark:text-[#ecece0]">{teacher.ho_va_ten || teacher.username}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2.5">
          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237]">
            <User className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac] flex-shrink-0" />
            <span className="text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac] truncate">
              Tài khoản: <strong className="font-mono text-[#293d32] dark:text-[#ecece0]">@{teacher.username}</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237]">
            <Phone className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac] flex-shrink-0" />
            {soDienThoai ? (
              <a
                href={`tel:${soDienThoai}`}
                className="text-xs font-bold text-[#314e3e] dark:text-[#d6b883] hover:underline"
              >
                {soDienThoai}
              </a>
            ) : (
              <span className="text-xs text-stone-400 italic">Chưa cập nhật SĐT</span>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
});

/* ============================================================
   TEACHER CHIP (CHIP GIÁO LÝ VIÊN VỚI TOUCH TARGET CHUẨN)
   ============================================================ */
const TeacherChip = React.memo(({ t, lop, rowBusy, busyKey, onRemove }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const tenNgan = t.ho_va_ten || t.username;
  const tenThanh = layTenThanh(t);

  return (
    <span className="inline-flex items-center gap-1.5 pl-1.5 pr-1 py-1 rounded-full bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] shadow-sm text-xs font-bold text-[#293d32] dark:text-[#ecece0] max-w-full">
      <span className="w-5 h-5 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-700 flex-shrink-0 border border-black/5">
        <img src={t.avatar || AVATAR_FALLBACK} alt="" className="w-full h-full object-cover" onError={handleAvatarError} />
      </span>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="min-h-[44px] min-w-0 break-words cursor-pointer hover:text-[#314e3e] dark:hover:text-[#d6b883] text-left"
        title={`${tenThanh ? tenThanh + " " : ""}${t.ho_va_ten || t.username}`}
      >
        {tenNgan}
      </button>
      <button
        type="button"
        disabled={rowBusy}
        onClick={() => onRemove(lop, t.username)}
        title="Gỡ Giáo lý viên khỏi lớp"
        aria-label={`Gỡ ${t.ho_va_ten || t.username} khỏi Lớp ${lop}`}
        className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-stone-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 flex-shrink-0 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {busyKey === `${lop}:${t.username}` ? <Spinner className="h-2.5 w-2.5" /> : <X className="w-3.5 h-3.5 stroke-[2.5]" />}
      </button>

      {modalOpen && <TeacherInfoModal teacher={t} onClose={() => setModalOpen(false)} />}
    </span>
  );
});

/* ============================================================
   TEACHER MULTI SELECT (PHÂN CÔNG GIÁO LÝ VIÊN ĐỨNG LỚP)
   HỖ TRỢ AVATAR STACK TRÊN DESKTOP & BOTTOM ACTION SHEET TRÊN MOBILE
   ============================================================ */
const TeacherMultiSelect = React.memo(({ lop, assignedUsernames, teachers, teacherLopMap, busyKey, onAdd, onRemove, compact }) => {
  const [open, setOpen] = useState(false);
  const [searchGlv, setSearchGlv] = useState("");
  const btnRef = useRef(null);
  const lenis = useLenis();

  const assignedTeachers = useMemo(
    () =>
      assignedUsernames
        .map((u) => teachers.find((t) => t.username === u) || { username: u, ho_va_ten: u })
        .filter(Boolean),
    [assignedUsernames, teachers]
  );

  const canAddMore = assignedUsernames.length < MAX_TEACHERS_PER_CLASS;
  const rowBusy = busyKey?.startsWith(`${lop}:`);

  const availableTeachers = useMemo(() => {
    const list = teachers.filter((t) => !assignedUsernames.includes(t.username));
    if (!searchGlv.trim()) return list;
    const q = searchGlv.trim().toLowerCase();
    return list.filter(
      (t) =>
        (t.ho_va_ten || "").toLowerCase().includes(q) ||
        (t.username || "").toLowerCase().includes(q) ||
        (t.ten_thanh || t.tenThanh || "").toLowerCase().includes(q)
    );
  }, [teachers, assignedUsernames, searchGlv]);

  const toggleOpen = useCallback(() => {
    setSearchGlv("");
    setOpen((v) => !v);
  }, []);

  const sheetRef = useClassSheet(open, () => setOpen(false), lenis);

  const pick = useCallback(
    (username) => {
      setOpen(false);
      onAdd(lop, username);
    },
    [lop, onAdd]
  );

  const handleRemove = useCallback(
    (username) => {
      setOpen(false);
      onRemove(lop, username);
    },
    [lop, onRemove]
  );

  const fullTeacherNames = useMemo(
    () => assignedTeachers.map((t) => `${layTenThanh(t) ? layTenThanh(t) + " " : ""}${t.ho_va_ten || t.username}`).join(", "),
    [assignedTeachers]
  );

  return (
    <div className={`flex items-center ${compact ? "w-full" : "gap-2 max-w-full"}`}>
      {compact ? (
        /* Mobile Bento GLV Bar (1 chạm tương tác trực tiếp) */
        assignedTeachers.length === 0 ? (
          <button
            ref={btnRef}
            type="button"
            disabled={rowBusy}
            onClick={toggleOpen}
            className="min-h-[44px] w-full flex items-center justify-between px-3 py-2 rounded-xl border border-dashed border-amber-300/80 dark:border-amber-700/80 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 hover:bg-amber-100/60 dark:hover:bg-amber-950/40 transition-colors text-xs font-semibold cursor-pointer active:scale-[0.99]"
            title={`Phân công Giáo lý viên cho Lớp ${lop}`}
            aria-label={`Phân công Giáo lý viên cho Lớp ${lop}`}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-200/60 dark:bg-amber-800/50 flex items-center justify-center text-amber-800 dark:text-amber-200 shrink-0">
                <UserPlus className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-xs text-amber-900 dark:text-amber-200">Chưa phân công GLV</span>
            </div>
            <span className="text-xs font-bold text-[#314e3e] dark:text-[#d6b883] bg-[#314e3e]/10 dark:bg-[#d6b883]/20 px-2 py-1 rounded-lg">
              + Phân công
            </span>
          </button>
        ) : (
          <button
            ref={btnRef}
            type="button"
            disabled={rowBusy}
            onClick={toggleOpen}
            className="min-h-[44px] w-full flex items-center justify-between gap-2 p-2 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] hover:border-[#314e3e]/50 dark:hover:border-[#d6b883]/50 transition-all cursor-pointer text-left active:scale-[0.99] group/glv"
            title={`Quản lý ${assignedTeachers.length} Giáo lý viên Lớp ${lop}: ${fullTeacherNames}`}
            aria-label={`Quản lý ${assignedTeachers.length} Giáo lý viên Lớp ${lop}`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {/* Avatar Stack */}
              <div className="flex items-center -space-x-2 shrink-0">
                {assignedTeachers.map((t) => (
                  <img
                    key={t.username}
                    src={t.avatar || AVATAR_FALLBACK}
                    alt=""
                    className="w-7 h-7 rounded-full border-2 border-[#fffefa] dark:border-[#1e2821] object-cover bg-stone-200 dark:bg-stone-700 shadow-xs"
                    onError={handleAvatarError}
                  />
                ))}
              </div>

              {/* Teachers Text */}
              <div className="truncate text-xs text-[#293d32] dark:text-[#ecece0]">
                {assignedTeachers.length === 1 && (
                  <span className="truncate block font-bold">
                    {layTenThanh(assignedTeachers[0]) ? <span className="text-[#7c5c2d] dark:text-[#d4b47d] mr-1">{layTenThanh(assignedTeachers[0])}</span> : null}
                    {assignedTeachers[0].ho_va_ten || assignedTeachers[0].username}
                  </span>
                )}
                {assignedTeachers.length === 2 && (
                  <span className="truncate block font-bold">
                    {assignedTeachers[0].ho_va_ten || assignedTeachers[0].username}, {assignedTeachers[1].ho_va_ten || assignedTeachers[1].username}
                  </span>
                )}
                {assignedTeachers.length >= 3 && (
                  <span className="truncate block font-bold">
                    {assignedTeachers[0].ho_va_ten || assignedTeachers[0].username}{" "}
                    <span className="text-xs font-bold text-[#314e3e] dark:text-[#d6b883] bg-[#314e3e]/10 dark:bg-[#d6b883]/15 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      +{assignedTeachers.length - 1} GLV
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Right Action Cue */}
            <div className="flex items-center gap-1 text-xs font-bold text-[#575e55] dark:text-[#b0b9ac] group-hover/glv:text-[#314e3e] dark:group-hover/glv:text-[#d6b883] shrink-0 px-2 py-1 rounded-lg bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4]/60 dark:border-[#354237]/60">
              <UserCheck className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d6b883]" />
              <span>{canAddMore ? "Đổi / Thêm" : "Đổi GLV"}</span>
            </div>
          </button>
        )
      ) : (
        /* Avatar Stack trên Desktop — Không bao giờ rớt dòng */
        <>
          {assignedTeachers.length === 0 ? (
            <button
              ref={btnRef}
              type="button"
              disabled={rowBusy}
              onClick={toggleOpen}
              title="Phân công Giáo lý viên đứng lớp"
              aria-label={`Phân công Giáo lý viên cho Lớp ${lop}`}
              className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-[#dedfd4] dark:border-[#354237] text-[#575e55] dark:text-[#b0b9ac] hover:text-[#314e3e] dark:hover:text-[#d6b883] hover:border-[#314e3e]/40 dark:hover:border-[#d6b883]/40 transition-colors disabled:opacity-50 cursor-pointer text-xs font-semibold whitespace-nowrap"
            >
              {busyKey === `${lop}:__add` ? <Spinner className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5 text-stone-400" />}
              <span>+ Phân công GLV</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 min-w-0 max-w-full">
              {/* Cụm Avatar xếp đè */}
              <button
                type="button"
                onClick={toggleOpen}
                className="flex items-center -space-x-2 shrink-0 cursor-pointer group/stack focus:outline-none focus:ring-2 focus:ring-[#314e3e]/40 rounded-full"
                title={`Quản lý Giáo lý viên Lớp ${lop}: ${fullTeacherNames}`}
                aria-label={`Quản lý ${assignedTeachers.length} Giáo lý viên Lớp ${lop}`}
              >
                {assignedTeachers.map((t) => (
                  <img
                    key={t.username}
                    src={t.avatar || AVATAR_FALLBACK}
                    alt=""
                    className="w-7 h-7 rounded-full border-2 border-[#fffefa] dark:border-[#1e2821] object-cover bg-stone-200 dark:bg-stone-700 shadow-xs transition-transform group-hover/stack:scale-105"
                    onError={handleAvatarError}
                  />
                ))}
              </button>

              {/* Tên GLV / Tóm tắt */}
              <button
                type="button"
                onClick={toggleOpen}
                className="text-left truncate text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] hover:text-[#314e3e] dark:hover:text-[#d6b883] transition-colors cursor-pointer min-w-0"
                title={fullTeacherNames}
              >
                {assignedTeachers.length === 1 && (
                  <span className="truncate block">
                    {layTenThanh(assignedTeachers[0]) ? `${layTenThanh(assignedTeachers[0])} ` : ""}
                    {assignedTeachers[0].ho_va_ten || assignedTeachers[0].username}
                  </span>
                )}
                {assignedTeachers.length === 2 && (
                  <span className="truncate block">
                    {assignedTeachers[0].ho_va_ten || assignedTeachers[0].username}, {assignedTeachers[1].ho_va_ten || assignedTeachers[1].username}
                  </span>
                )}
                {assignedTeachers.length >= 3 && (
                  <span className="truncate block">
                    {assignedTeachers[0].ho_va_ten || assignedTeachers[0].username}{" "}
                    <span className="text-xs font-semibold text-[#314e3e] dark:text-[#d6b883] bg-[#314e3e]/10 dark:bg-[#d6b883]/15 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      +{assignedTeachers.length - 1} GLV
                    </span>
                  </span>
                )}
              </button>

              {/* Nút thêm nhanh nếu chưa đủ 3 GLV */}
              {canAddMore && (
                <button
                  ref={btnRef}
                  type="button"
                  disabled={rowBusy}
                  onClick={toggleOpen}
                  title="Thêm Giáo lý viên"
                  aria-label={`Thêm Giáo lý viên cho Lớp ${lop}`}
                  className="w-6 h-6 rounded-full border border-dashed border-[#dedfd4] dark:border-[#354237] hover:border-[#314e3e] dark:hover:border-[#d6b883] text-[#575e55] dark:text-[#b0b9ac] hover:text-[#314e3e] dark:hover:text-[#d6b883] flex items-center justify-center text-xs transition-colors disabled:opacity-50 cursor-pointer shrink-0 ml-0.5"
                >
                  {busyKey === `${lop}:__add` ? <Spinner className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal Phân công GLV chuẩn WCAG & Safe Area Bottom Sheet */}
      {open && createPortal(
        <div
          className="class-sheet fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          ref={sheetRef}
          tabIndex={-1}
          aria-label={`Phân công Giáo lý viên Lớp ${lop}`}
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] shadow-2xl p-5 sm:p-6 flex flex-col gap-3.5 text-[#293d32] dark:text-[#ecece0] max-h-[90dvh] overflow-hidden pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
            data-lenis-prevent
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-3 border-b border-[#dedfd4]/60 dark:border-[#354237]/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] flex items-center justify-center shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-serif text-[#293d32] dark:text-[#ecece0] leading-tight">
                    Phân công GLV Lớp {lop}
                  </h3>
                  <p className="text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac] mt-0.5">
                    Đang phân công {assignedTeachers.length}/{MAX_TEACHERS_PER_CLASS} Giáo lý viên
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng"
                className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Danh sách GLV hiện tại đang phụ trách */}
            {assignedTeachers.length > 0 && (
              <div className="flex flex-col gap-2 p-3 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#314e3e] dark:text-[#d6b883]">
                  GLV đang đứng lớp ({assignedTeachers.length}/{MAX_TEACHERS_PER_CLASS})
                </p>
                <div className="flex flex-col gap-1.5">
                  {assignedTeachers.map((t) => {
                    const tenThanh = layTenThanh(t);
                    return (
                      <div
                        key={t.username}
                        className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4]/60 dark:border-[#354237]/60"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-800 shrink-0 border border-black/5">
                            <img src={t.avatar || AVATAR_FALLBACK} alt="" className="w-full h-full object-cover" onError={handleAvatarError} />
                          </div>
                          <div className="truncate">
                            {tenThanh && <span className="text-[#7c5c2d] dark:text-[#d4b47d] text-xs block font-semibold leading-none mb-0.5">{tenThanh}</span>}
                            <span className="font-bold text-xs sm:text-sm text-[#293d32] dark:text-[#ecece0]">{t.ho_va_ten || t.username}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={rowBusy}
                          onClick={() => handleRemove(t.username)}
                          title="Gỡ Giáo lý viên khỏi lớp"
                          aria-label={`Gỡ ${t.ho_va_ten || t.username} khỏi Lớp ${lop}`}
                          className="min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/40 inline-flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {busyKey === `${lop}:${t.username}` ? <Spinner className="w-3 h-3" /> : <Trash2 className="w-3.5 h-3.5" />}
                          <span>Gỡ</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tìm kiếm & Thêm GLV mới (nếu chưa đạt giới hạn) */}
            {canAddMore ? (
              <div className="flex flex-col gap-2 flex-1 min-h-0">
                <p className="text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">
                  Thêm Giáo lý viên vào lớp
                </p>
                <div className="relative">
                  <Search className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchGlv}
                    onChange={(e) => setSearchGlv(e.target.value)}
                    placeholder="Tìm tên hoặc Tên Thánh GLV..."
                    className="w-full min-h-[44px] rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] pl-9 pr-3 py-2 text-base font-medium text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 dark:placeholder-[#b0b9ac]/60 focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 transition-all shadow-inner"
                    autoFocus
                  />
                </div>

                <div className="overflow-y-auto flex-1 flex flex-col gap-1.5 max-h-[36vh] pr-1" data-lenis-prevent>
                  {availableTeachers.length === 0 && (
                    <div className="text-center py-6 px-4 border border-dashed border-[#dedfd4] dark:border-[#354237] rounded-2xl bg-[#faf8f3]/50 dark:bg-[#151c18]/50">
                      <p className="text-xs font-medium text-[#575e55] dark:text-[#b0b9ac]">
                        {searchGlv ? "Không tìm thấy Giáo lý viên phù hợp." : "Không còn Giáo lý viên khả dụng."}
                      </p>
                    </div>
                  )}
                  {availableTeachers.map((t) => {
                    const currentAssignedLop = teacherLopMap?.[t.username];
                    const tenThanh = layTenThanh(t);
                    return (
                      <button
                        key={t.username}
                        type="button"
                        onClick={() => pick(t.username)}
                        className="min-h-[46px] w-full flex items-center gap-3 px-3 py-2 rounded-xl text-base text-left transition-colors text-[#293d32] dark:text-[#ecece0] hover:bg-[#314e3e]/10 dark:hover:bg-[#d6b883]/15 font-medium border border-[#dedfd4]/60 dark:border-[#354237]/60 cursor-pointer active:scale-[0.98]"
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-800 shrink-0 border border-black/5">
                          <img src={t.avatar || AVATAR_FALLBACK} alt="" className="w-full h-full object-cover" onError={handleAvatarError} />
                        </div>
                        <div className="truncate flex-1">
                          {tenThanh && <span className="text-[#7c5c2d] dark:text-[#d4b47d] text-xs block font-semibold leading-none mb-0.5">{tenThanh}</span>}
                          <span className="font-bold text-xs sm:text-sm">{t.ho_va_ten || t.username}</span>
                        </div>
                        {currentAssignedLop && currentAssignedLop !== lop && (
                          <span className="text-xs font-bold text-[#7c5c2d] dark:text-[#d4b47d] bg-[#d4b47d]/20 px-2 py-0.5 rounded-full shrink-0">
                            từ {currentAssignedLop}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 text-xs font-medium text-amber-800 dark:text-amber-300 text-center">
                Lớp đã đủ tối đa {MAX_TEACHERS_PER_CLASS} Giáo lý viên. Hãy gỡ bớt nếu muốn thay đổi.
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});

/* ============================================================
   CARD LỚP HỌC TRÊN MOBILE (VIEWPORT < 1024PX) — BENTO COMPACT CARD
   THIẾT KẾ 3 TẦNG: HEADER -> GLV 1 CHẠM -> FOOTER ĐA NHIỆM 1 HÀNG
   ============================================================ */
const ClassMobileCard = React.memo(({ c, namHoc, assignedUsernames, teachers, teacherLopMap, busyKey, onAddTeacher, onRemoveTeacher, loadAll, showToast, openSettings }) => {
  const khoiKey = detectKhoiByLop(c.lop);
  const khoiStyle = getKhoiStyle(khoiKey);
  const khoiName = getKhoiLabel(khoiKey);
  const schedInfo = getScheduleInfoForClass(c.lop);
  const hasNoGlv = assignedUsernames.length === 0;

  return (
    <div className={`class-mobile-card flex flex-col gap-3 p-4 bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] shadow-xs ${khoiStyle.stripe}`}>
      {/* Tầng 1: Tên Lớp, Khối, Phòng & Ca, Sĩ Số */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base sm:text-lg font-bold text-[#293d32] dark:text-[#ecece0] font-serif break-words leading-tight">
              {c.lop}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${khoiStyle.badge}`}>
              {khoiName}
            </span>
          </div>

          {schedInfo?.room && (
            <div className="flex items-center gap-1.5 text-xs text-[#575e55] dark:text-[#b0b9ac] font-medium">
              <MapPin className="w-3 h-3 text-[#7c5c2d] dark:text-[#d4b47d] shrink-0" />
              <span>{schedInfo.room} {schedInfo.ca ? `· Ca ${schedInfo.ca}` : ""}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-bold text-[#314e3e] dark:text-[#d6b883] bg-[#314e3e]/10 dark:bg-[#d6b883]/15 border border-[#314e3e]/20 dark:border-[#d6b883]/30 px-2.5 py-1 rounded-full whitespace-nowrap">
            {c.studentCount || 0} GLS
          </span>
          {hasNoGlv && (
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Cần GLV
            </span>
          )}
        </div>
      </div>

      {/* Tầng 2: Dải Giáo lý viên 1 chạm (Interactive GLV Bar) */}
      <TeacherMultiSelect
        lop={c.lop}
        assignedUsernames={assignedUsernames}
        teachers={teachers}
        teacherLopMap={teacherLopMap}
        busyKey={busyKey}
        onAdd={onAddTeacher}
        onRemove={onRemoveTeacher}
        compact
      />

      {/* Tầng 3: Footer đa nhiệm 1 hàng (Khóa sổ HK1/HK2 + Nút Quản lý Lớp & GLS) */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#dedfd4]/60 dark:border-[#354237]/60">
        <div className="flex items-center gap-1.5 shrink-0">
          <TermLockToggle lop={c.lop} hocKy={1} isLocked={!!c.locks?.[1]} namHoc={namHoc} onChanged={loadAll} showToast={showToast} compact />
          <TermLockToggle lop={c.lop} hocKy={2} isLocked={!!c.locks?.[2]} namHoc={namHoc} onChanged={loadAll} showToast={showToast} compact />
        </div>

        <button
          type="button"
          onClick={() => openSettings(c.lop)}
          className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] font-bold text-xs sm:text-sm shadow-xs hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
        >
          <Users className="w-4 h-4" />
          <span>Quản lý lớp</span>
        </button>
      </div>
    </div>
  );
});

/* ============================================================
   ROW LỚP HỌC TRÊN DESKTOP (VIEWPORT >= 1024PX)
   ============================================================ */
const ClassDesktopRow = React.memo(({ c, namHoc, assignedUsernames, teachers, teacherLopMap, busyKey, onAddTeacher, onRemoveTeacher, loadAll, showToast, openSettings }) => {
  const khoiKey = detectKhoiByLop(c.lop);
  const khoiName = getKhoiLabel(khoiKey);

  return (
    <tr className="hover:bg-[#314e3e]/5 dark:hover:bg-[#d6b883]/5 transition-colors border-b border-[#dedfd4] dark:border-[#354237] last:border-b-0">
      <td className="px-6 py-3.5 whitespace-nowrap min-w-[170px]">
        <div className="flex flex-col">
          <span className="text-sm sm:text-base font-bold text-[#293d32] dark:text-[#ecece0] font-serif whitespace-nowrap leading-tight">{c.lop}</span>
          <span className="text-xs text-[#575e55] dark:text-[#b0b9ac] whitespace-nowrap mt-0.5">{khoiName}</span>
        </div>
      </td>
      <td className="px-4 py-3.5 min-w-[240px]">
        <TeacherMultiSelect
          lop={c.lop}
          assignedUsernames={assignedUsernames}
          teachers={teachers}
          teacherLopMap={teacherLopMap}
          busyKey={busyKey}
          onAdd={onAddTeacher}
          onRemove={onRemoveTeacher}
        />
      </td>
      <td className="px-4 py-3.5 text-center whitespace-nowrap w-[90px]">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883]">
          {c.studentCount || 0}
        </span>
      </td>
      <td className="px-4 py-3.5 text-center whitespace-nowrap w-[170px]">
        <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237]">
          <TermLockToggle lop={c.lop} hocKy={1} isLocked={!!c.locks?.[1]} namHoc={namHoc} onChanged={loadAll} showToast={showToast} />
          <TermLockToggle lop={c.lop} hocKy={2} isLocked={!!c.locks?.[2]} namHoc={namHoc} onChanged={loadAll} showToast={showToast} />
        </div>
      </td>
      <td className="px-6 py-3.5 text-right whitespace-nowrap w-[150px]">
        <button
          type="button"
          onClick={() => openSettings(c.lop)}
          className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] shadow-sm text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] hover:bg-[#314e3e] hover:text-white dark:hover:bg-[#d6b883] dark:hover:text-[#19251d] transition-all whitespace-nowrap cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" /> Quản lý lớp
        </button>
      </td>
    </tr>
  );
});

/* ============================================================
   VIEW CHÍNH: CLASSES TAB
   ============================================================ */
export default function ClassesTab() {
  const { classes, namHoc, loading, loadAll, showToast } = useAdminContext();
  const [teachers, setTeachers] = useState([]);
  const [teacherRows, setTeacherRows] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [exportingSummary, setExportingSummary] = useState(false);

  // Modal Thao tác Lớp học trên Mobile
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);

  // Đọc tham số URL ngữ cảnh (?khoi=... hoặc ?status=...)
  const [searchParams] = useSearchParams();
  const paramKhoi = searchParams.get("khoi");
  const paramStatus = searchParams.get("status");

  // Bộ lọc Khối & Tìm kiếm Lớp
  const [selectedKhoi, setSelectedKhoi] = useState(() => paramKhoi || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(() => paramStatus || "all");
  const [assignmentError, setAssignmentError] = useState(false);

  useEffect(() => {
    if (paramKhoi && paramKhoi !== selectedKhoi) {
      setSelectedKhoi(paramKhoi);
    }
    if (paramStatus && paramStatus !== statusFilter) {
      setStatusFilter(paramStatus);
    }
  }, [paramKhoi, paramStatus]);

  useEffect(() => {
    let cancelled = false;
    fetchAllTeachers()
      .then((data) => {
        if (!cancelled) setTeachers(data);
      })
      .catch((err) => console.error("fetch teachers error", err));
    return () => { cancelled = true; };
  }, []);

  const loadTeacherAssignments = useCallback(async () => {
    setLoadingAssignments(true);
    setAssignmentError(false);
    try {
      const rows = await fetchClassTeacherRows(namHoc);
      setTeacherRows(rows);
    } catch {
      setAssignmentError(true);
    } finally {
      setLoadingAssignments(false);
    }
  }, [namHoc]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingAssignments(true);
      setAssignmentError(false);
      try {
        const rows = await fetchClassTeacherRows(namHoc);
        if (!cancelled) setTeacherRows(rows);
      } catch {
        if (!cancelled) setAssignmentError(true);
      } finally {
        if (!cancelled) setLoadingAssignments(false);
      }
    })();
    return () => { cancelled = true; };
  }, [namHoc]);

  // Luôn làm mới dữ liệu lớp học và sĩ số 1 lần mỗi khi chuyển sang tab Lớp học
  const hasRefreshedRef = useRef(false);
  useEffect(() => {
    if (!hasRefreshedRef.current) {
      hasRefreshedRef.current = true;
      loadAll();
    }
  }, [loadAll]);

  const teachersByLop = useMemo(() => {
    const map = {};
    teacherRows.forEach((r) => {
      if (!map[r.lop]) map[r.lop] = [];
      map[r.lop].push(r.teacher_username);
    });
    return map;
  }, [teacherRows]);

  const teacherLopMap = useMemo(() => {
    const map = {};
    teacherRows.forEach((r) => { map[r.teacher_username] = r.lop; });
    return map;
  }, [teacherRows]);

  const [newLop, setNewLop] = useState("");
  const [rosterLop, setRosterLop] = useState(null);
  const [busyKey, setBusyKey] = useState(null);
  const [mainExcelModalOpen, setMainExcelModalOpen] = useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

  // Modal Xác Nhận Phân công GLV
  const [confirmTeacherState, setConfirmTeacherState] = useState(null);

  const requestAddTeacher = useCallback((lop, teacherUsername) => {
    setConfirmTeacherState({ action: "add", lop, teacherUsername });
  }, []);

  const requestRemoveTeacher = useCallback((lop, teacherUsername) => {
    setConfirmTeacherState({ action: "remove", lop, teacherUsername });
  }, []);

  const executeTeacherAction = useCallback(async () => {
    if (!confirmTeacherState) return;
    const { action, lop, teacherUsername } = confirmTeacherState;

    if (action === "add") {
      setBusyKey(`${lop}:__add`);
      try {
        await assignTeacherToClass(lop, teacherUsername, namHoc);
        showToast("Đã phân công Giáo lý viên đứng lớp thành công", "success");
        await loadTeacherAssignments();
        loadAll();
      } catch {
        showToast("Phân công thất bại. Vui lòng thử lại.", "error");
      } finally {
        setBusyKey(null);
        setConfirmTeacherState(null);
      }
    } else {
      setBusyKey(`${lop}:${teacherUsername}`);
      try {
        await unassignTeacher(teacherUsername, namHoc);
        showToast("Đã gỡ Giáo lý viên khỏi lớp thành công", "success");
        await loadTeacherAssignments();
        loadAll();
      } catch {
        showToast("Gỡ Giáo lý viên thất bại. Vui lòng thử lại.", "error");
      } finally {
        setBusyKey(null);
        setConfirmTeacherState(null);
      }
    }
  }, [confirmTeacherState, namHoc, loadTeacherAssignments, loadAll, showToast]);

  const handleAddClass = useCallback((className) => {
    const name = (typeof className === "string" ? className : newLop).trim();
    if (!name) return;
    if (classes.some((c) => c.lop.toLowerCase() === name.toLowerCase())) {
      showToast(`Lớp "${name}" đã tồn tại trong danh sách`, "warning");
      return;
    }
    setNewLop("");
    showToast(`Đã mở Lớp "${name}". Hãy ghi danh Giáo lý sinh hoặc phân công GLV.`, "info");
    setRosterLop(name);
  }, [newLop, classes, showToast]);

  const openSettings = useCallback((lop) => {
    setRosterLop(lop);
  }, []);

  // Xuất Báo Cáo Tổng Hợp Toàn Bộ Lớp Học Trong Niên Khóa
  const handleExportSummary = async () => {
    if (!classes || classes.length === 0) {
      showToast("Chưa có lớp học nào trong niên khóa này để xuất báo cáo", "warning");
      return;
    }
    setExportingSummary(true);
    try {
      const res = await exportAllClassesSummaryExcel(classes, namHoc, teachersByLop, teachers);
      if (res?.cancelled) {
        showToast("Đã hủy xuất báo cáo", "info");
      } else if (res?.method === "picker") {
        showToast("Đã lưu Báo cáo Tổng hợp Niên khóa thành công", "success");
      } else {
        showToast("Đang tải file Báo cáo về thiết bị...", "info");
      }
    } catch (err) {
      console.error("Export summary error:", err);
      showToast("Xuất báo cáo thất bại", "error");
    } finally {
      setExportingSummary(false);
    }
  };

  // Lọc danh sách lớp học theo Khối & Từ khóa tìm kiếm
  const filteredClasses = useMemo(() => {
    let list = classes;
    if (selectedKhoi !== "all") {
      list = list.filter((c) => detectKhoiByLop(c.lop) === selectedKhoi);
    }
    if (statusFilter === "unassigned") list = list.filter((c) => !teachersByLop[c.lop]?.length);
    if (statusFilter === "locked") list = list.filter((c) => c.locks?.[1] || c.locks?.[2]);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((c) => {
        const matchLop = c.lop.toLowerCase().includes(q);
        const assignedTeachers = teachersByLop[c.lop] || [];
        const matchGlv = assignedTeachers.some((u) => {
          const t = teachers.find((tch) => tch.username === u);
          return (
            (t?.ho_va_ten || "").toLowerCase().includes(q) ||
            (t?.username || "").toLowerCase().includes(q) ||
            (t?.ten_thanh || t?.tenThanh || "").toLowerCase().includes(q)
          );
        });
        return matchLop || matchGlv;
      });
    }
    return list;
  }, [classes, selectedKhoi, searchQuery, statusFilter, teachersByLop, teachers]);

  // Thống kê nhanh Mini-KPIs
  const totalStudents = useMemo(() => classes.reduce((acc, c) => acc + (c.studentCount || 0), 0), [classes]);
  const classesWithoutGlv = useMemo(() => classes.filter((c) => !(teachersByLop[c.lop] && teachersByLop[c.lop].length > 0)).length, [classes, teachersByLop]);
  const lockedCount = useMemo(() => classes.filter((c) => c.locks?.[1] || c.locks?.[2]).length, [classes]);

  // Đếm số lớp theo từng khối để hiển thị badge trên Filter Pills
  const countsByKhoi = useMemo(() => {
    const map = { all: classes.length };
    KHOI_FILTERS.forEach((k) => {
      if (k.id !== "all") {
        map[k.id] = classes.filter((c) => detectKhoiByLop(c.lop) === k.id).length;
      }
    });
    return map;
  }, [classes]);

  // Danh sách gợi ý tạo nhanh lấy trực tiếp từ Lịch học (/lịch-học)
  const activePresets = useMemo(() => {
    if (selectedKhoi === "all") {
      return SCHEDULE_CLASSES;
    }
    return SCHEDULE_CLASSES.filter((c) => detectKhoiByLop(c.name) === selectedKhoi);
  }, [selectedKhoi]);

  if (rosterLop) {
    return (
      <ClassRosterPanel
        lop={rosterLop}
        namHoc={namHoc}
        availableClasses={classes}
        onBack={() => { setRosterLop(null); loadAll(); }}
        onRosterChange={loadAll}
        showToast={showToast}
      />
    );
  }

  const targetTeacher = teachers.find((t) => t.username === confirmTeacherState?.teacherUsername);
  const targetTeacherName = targetTeacher?.ho_va_ten || confirmTeacherState?.teacherUsername || "";
  const targetTeacherHoly = layTenThanh(targetTeacher);

  return (
    <div className="classes-page flex flex-col gap-4 sm:gap-5">
      {/* ── 4 MINI-KPIS DASHBOARD: DESKTOP (2x2/4x1 GRID) ── */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] flex items-center justify-center flex-shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-wider">Tổng số lớp</span>
            <span className="text-lg sm:text-xl font-bold font-serif text-[#293d32] dark:text-[#ecece0]">{classes.length} Lớp</span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d4b47d]/20 text-[#7c5c2d] dark:text-[#d4b47d] flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-wider">Giáo lý sinh</span>
            <span className="text-lg sm:text-xl font-bold font-serif text-[#293d32] dark:text-[#ecece0]">{totalStudents} Em</span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] shadow-xs flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            classesWithoutGlv > 0
              ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30"
              : "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30"
          }`}>
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-wider">Chưa có GLV</span>
            <span className={`text-lg sm:text-xl font-bold font-serif ${
              classesWithoutGlv > 0 ? "text-amber-700 dark:text-amber-400" : "text-[#293d32] dark:text-[#ecece0]"
            }`}>
              {classesWithoutGlv} Lớp
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-wider">Khóa sổ HK</span>
            <span className="text-lg sm:text-xl font-bold font-serif text-[#293d32] dark:text-[#ecece0]">{lockedCount} Lớp</span>
          </div>
        </div>
      </div>

      {/* ── CARD ĐIỀU KHIỂN & BỘ LỌC ── */}
      <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl sm:rounded-3xl border border-[#dedfd4] dark:border-[#354237] shadow-xs overflow-hidden flex flex-col">
        {/* Desktop Toolbar */}
        <div className="hidden lg:flex flex-col gap-2.5 px-4 sm:px-6 py-4 border-b border-[#dedfd4] dark:border-[#354237] bg-[#fffefa]/95 dark:bg-[#1e2821]/95">
          <div className="flex flex-row flex-wrap gap-2.5 sm:gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <input
                type="text"
                value={newLop}
                onChange={(e) => setNewLop(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddClass()}
                placeholder="Mở lớp mới, vd: Thêm Sức 2/1..."
                className="w-full min-h-[44px] rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] px-4 py-2.5 text-sm font-bold text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 dark:placeholder-[#b0b9ac]/60 focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 transition-all shadow-inner"
              />
            </div>
            <button
              type="button"
              onClick={() => handleAddClass()}
              className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#314e3e] hover:bg-[#263e32] dark:bg-[#d6b883] dark:hover:bg-[#c9a76d] text-white dark:text-[#19251d] text-sm font-bold shadow-sm active:scale-[0.98] transition-all flex-shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /> Khởi tạo lớp
            </button>
            <button
              type="button"
              onClick={handleExportSummary}
              disabled={exportingSummary || classes.length === 0}
              className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#fffefa] dark:bg-[#1e2821] hover:bg-stone-100 dark:hover:bg-stone-800 text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] text-sm font-bold shadow-sm active:scale-[0.98] transition-all flex-shrink-0 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              title="Xuất Báo cáo Tổng hợp Danh sách Lớp & GLV phụ trách ra file Excel (.xlsx)"
            >
              {exportingSummary ? <Spinner className="w-4 h-4" /> : <Download className="w-4 h-4 text-[#7c5c2d] dark:text-[#d4b47d] stroke-[2.5]" />}
              <span>Xuất Báo Cáo</span>
            </button>
            <button
              type="button"
              onClick={() => setCalendarModalOpen(true)}
              className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#fffefa] dark:bg-[#1e2821] hover:bg-stone-100 dark:hover:bg-stone-800 text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] text-sm font-bold shadow-sm active:scale-[0.98] transition-all flex-shrink-0 cursor-pointer"
              title="Quản trị Lịch Niên Khóa & Ngày Nghỉ Lễ Phụng Vụ / Nghỉ Tết"
            >
              <Calendar className="w-4 h-4 text-[#7c5c2d] dark:text-[#d4b47d] stroke-[2.5]" /> Lịch & Nghỉ Lễ
            </button>
            <button
              type="button"
              onClick={() => setMainExcelModalOpen(true)}
              className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-sm active:scale-[0.98] transition-all flex-shrink-0 cursor-pointer"
              title="Nhập danh sách Giáo lý sinh từ file Excel"
            >
              <FileSpreadsheet className="w-4 h-4 stroke-[2.5]" /> Nhập Excel
            </button>
          </div>

          {/* Quick Presets Chips đồng bộ từ /lịch-học (SCHEDULE_CLASSES) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none" data-lenis-prevent>
            <span className="text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac] whitespace-nowrap flex items-center gap-1 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-[#7c5c2d] dark:text-[#d4b47d]" /> Tạo nhanh từ Lịch học:
            </span>
            {activePresets.map((item) => {
              const className = item.name;
              const isCreated = classes.some((c) => c.lop.toLowerCase() === className.toLowerCase());
              return (
                <button
                  key={item.id || className}
                  type="button"
                  onClick={() => {
                    if (!isCreated) handleAddClass(className);
                  }}
                  disabled={isCreated}
                  className={`min-h-[30px] px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                    isCreated
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 opacity-75 cursor-default"
                      : "bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] hover:border-[#314e3e] dark:hover:border-[#d6b883] hover:text-[#314e3e] dark:hover:text-[#d6b883] active:scale-95"
                  }`}
                  title={isCreated ? `Lớp ${className} (${item.room || ""}) đã có trong danh sách` : `Nhấp để khởi tạo nhanh Lớp ${className} (${item.room || ""})`}
                >
                  {isCreated ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span className="line-through">{className}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                      <span>{className}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="class-filters">
          <label htmlFor="class-search" className="text-sm font-semibold">Tìm lớp hoặc giáo lý viên</label>
          <div className="class-search">
            <Search size={18} aria-hidden="true" />
            <input id="class-search" type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Nhập tên lớp hoặc giáo lý viên" />
          </div>
          <div className="class-filter-grid">
            <label>Khối học
              <select value={selectedKhoi} onChange={(event) => setSelectedKhoi(event.target.value)}>
                {KHOI_FILTERS.map((item) => <option key={item.id} value={item.id}>{item.label} ({countsByKhoi[item.id] || 0})</option>)}
              </select>
            </label>
            <label>Trạng thái
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="unassigned">Chưa có GLV</option>
                <option value="locked">Có học kỳ đã khóa</option>
              </select>
            </label>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm" role="status">{loading || loadingAssignments ? "Đang tải danh sách…" : assignmentError ? "Chưa tải đủ dữ liệu" : `${filteredClasses.length} lớp hiển thị`}</p>
            {(searchQuery || selectedKhoi !== "all" || statusFilter !== "all") && <button type="button" className="class-secondary" onClick={() => { setSearchQuery(""); setSelectedKhoi("all"); setStatusFilter("all"); }}>Xóa bộ lọc</button>}
            <button type="button" className="class-primary lg:hidden" onClick={() => setMobileActionsOpen(true)}><Plus size={18} aria-hidden="true" /> Mở lớp / Công cụ</button>
          </div>
        </div>
      </div>

      {loading || loadingAssignments ? (
        <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl sm:rounded-3xl border border-[#dedfd4] dark:border-[#354237] shadow-xs overflow-hidden">
          <div className="lg:hidden p-4 space-y-4" role="status" aria-label="Đang tải lớp học">{[1, 2, 3].map((key) => <div key={key} className="class-skeleton" aria-hidden="true"><div /><div /><div /></div>)}</div>
          <div className="hidden lg:block"><TableSkeleton rows={6} columns={4} /></div>
        </div>
      ) : assignmentError ? (
        <div className="class-filters" role="alert"><p>Chưa tải được phân công giáo lý viên. Vui lòng thử lại để xem thông tin lớp đầy đủ.</p><button type="button" className="class-secondary" onClick={loadTeacherAssignments}>Thử lại</button></div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl sm:rounded-3xl border border-[#dedfd4] dark:border-[#354237] shadow-xs flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] flex items-center justify-center border border-[#314e3e]/20 dark:border-[#d6b883]/30">
            <School className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-[#293d32] dark:text-[#ecece0] font-serif">
            {searchQuery || selectedKhoi !== "all" || statusFilter !== "all"
              ? "Không có lớp học nào khớp với bộ lọc hiện tại"
              : "Chưa có lớp học nào trong niên khóa này"}
          </h4>
          <p className="text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac] max-w-sm leading-relaxed">
            {searchQuery || selectedKhoi !== "all" || statusFilter !== "all"
              ? "Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc chọn khối học khác."
              : "Hãy bấm 'Mở lớp / Công cụ' để khởi tạo lớp học mới."}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile view (< 1024px) — Danh sách các Card độc lập thông thoáng */}
          <div className="lg:hidden flex flex-col gap-3">
            {filteredClasses.map((c) => (
              <ClassMobileCard
                key={c.lop}
                c={c}
                namHoc={namHoc}
                assignedUsernames={teachersByLop[c.lop] || EMPTY_ARRAY}
                teachers={teachers}
                teacherLopMap={teacherLopMap}
                busyKey={busyKey}
                onAddTeacher={requestAddTeacher}
                onRemoveTeacher={requestRemoveTeacher}
                loadAll={loadAll}
                showToast={showToast}
                openSettings={openSettings}
              />
            ))}
          </div>

          {/* Desktop view (>= 1024px) — Bảng trong card độc lập */}
          <div className="hidden lg:block bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl sm:rounded-3xl border border-[#dedfd4] dark:border-[#354237] shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[65vh]" data-lenis-prevent>
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="text-xs font-bold text-[#314e3e] dark:text-[#d6b883] uppercase tracking-wider">
                    <th className="px-6 py-4 sticky top-0 bg-[#faf8f3] dark:bg-[#151c18] backdrop-blur-md z-10 border-b border-[#dedfd4] dark:border-[#354237] whitespace-nowrap min-w-[170px]">
                      Tên Lớp học
                    </th>
                    <th className="px-4 py-4 sticky top-0 bg-[#faf8f3] dark:bg-[#151c18] backdrop-blur-md z-10 border-b border-[#dedfd4] dark:border-[#354237] min-w-[240px]">
                      Giáo lý viên đứng lớp
                    </th>
                    <th className="px-4 py-4 sticky top-0 bg-[#faf8f3] dark:bg-[#151c18] backdrop-blur-md z-10 border-b border-[#dedfd4] dark:border-[#354237] text-center w-[90px] whitespace-nowrap">
                      Sĩ số
                    </th>
                    <th className="px-4 py-4 sticky top-0 bg-[#faf8f3] dark:bg-[#151c18] backdrop-blur-md z-10 border-b border-[#dedfd4] dark:border-[#354237] text-center w-[170px] whitespace-nowrap">
                      Bảo mật sổ điểm
                    </th>
                    <th className="px-6 py-4 sticky top-0 bg-[#faf8f3] dark:bg-[#151c18] backdrop-blur-md z-10 border-b border-[#dedfd4] dark:border-[#354237] text-right w-[150px] whitespace-nowrap">
                      Tùy chỉnh
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dedfd4] dark:divide-[#354237]">
                  {filteredClasses.map((c) => (
                    <ClassDesktopRow
                      key={c.lop}
                      c={c}
                      namHoc={namHoc}
                      assignedUsernames={teachersByLop[c.lop] || EMPTY_ARRAY}
                      teachers={teachers}
                      teacherLopMap={teacherLopMap}
                      busyKey={busyKey}
                      onAddTeacher={requestAddTeacher}
                      onRemoveTeacher={requestRemoveTeacher}
                      loadAll={loadAll}
                      showToast={showToast}
                      openSettings={openSettings}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── SECURITY NOTICE CARD ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] shadow-xs">
        <p className="text-xs font-bold text-[#7c5c2d] dark:text-[#d4b47d] uppercase tracking-wide flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" /> Chú ý an toàn dữ liệu & Sổ điểm điện tử
        </p>
        <p className="text-xs font-medium text-[#575e55] dark:text-[#b0b9ac] mt-1 leading-relaxed">
          Khóa sổ HK1/HK2 sẽ tạm ngưng quyền chỉnh sửa điểm số và điểm danh của Giáo lý viên lớp đó cho đến khi Ban Quản Trị mở khóa lại.
        </p>
      </div>

      {/* Modal Xác Nhận Phân công/Gỡ GLV (Render ở Root) */}
      <PortalConfirmDialog
        open={!!confirmTeacherState}
        title={confirmTeacherState?.action === "add" ? "Phân công Giáo lý viên?" : "Gỡ Giáo lý viên khỏi lớp?"}
        message={
          confirmTeacherState?.action === "add"
            ? `Bạn muốn phân công ${targetTeacherHoly ? targetTeacherHoly + " " : ""}"${targetTeacherName}" phụ trách Lớp ${confirmTeacherState?.lop}?`
            : `${targetTeacherHoly ? targetTeacherHoly + " " : ""}"${targetTeacherName}" sẽ không còn quyền nhập điểm và điểm danh ở Lớp ${confirmTeacherState?.lop} nữa. Xác nhận thao tác này?`
        }
        confirmLabel={confirmTeacherState?.action === "add" ? "Xác nhận phân công" : "Đồng ý gỡ"}
        danger={confirmTeacherState?.action === "remove"}
        onConfirm={executeTeacherAction}
        onCancel={() => setConfirmTeacherState(null)}
        busy={!!busyKey}
      />

      {/* Bottom Sheet / Modal Thao Tác Cho Mobile */}
      <MobileActionsSheet
        open={mobileActionsOpen}
        onClose={() => setMobileActionsOpen(false)}
        newLop={newLop}
        setNewLop={setNewLop}
        onAddClass={handleAddClass}
        activePresets={activePresets}
        classes={classes}
        onExportSummary={handleExportSummary}
        exportingSummary={exportingSummary}
        onOpenCalendar={() => setCalendarModalOpen(true)}
        onOpenExcelModal={() => setMainExcelModalOpen(true)}
      />

      {/* Modal Nhập Giáo lý sinh từ Excel (Toolbar) */}
      <ExcelImportModal
        open={mainExcelModalOpen}
        onClose={() => setMainExcelModalOpen(false)}
        currentLop={null}
        namHoc={namHoc}
        availableClasses={classes}
        onSuccess={() => loadAll()}
        showToast={showToast}
      />

      {/* Modal Quản trị Lịch Niên Khóa & Ngày Nghỉ Lễ */}
      <AcademicCalendarModal
        open={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        namHoc={namHoc}
        availableClasses={classes}
        showToast={showToast}
        onSynced={() => loadAll()}
      />
    </div>
  );
}