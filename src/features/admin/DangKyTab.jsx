import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLenis } from "lenis/react";
import {
  UserPlus, Phone, MapPin, Calendar, Check, X, Inbox, Info,
  Clock, ChevronLeft, GraduationCap, PhoneCall, RotateCcw,
  Search, Download, Copy, CheckCheck, MessageSquare, ArrowRight,
  Filter, AlertTriangle, Sparkles, School, FileSpreadsheet,
  ChevronDown, ChevronUp, ArrowUpDown, Save, Ban, CheckCircle2,
  ExternalLink, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminContext } from "./AdminContext.jsx";
import { useMotionConfig } from "../../hooks/useMotionConfig.js";
import { DANG_KY_STATUS_TABS, DANG_KY_LABELS_VI, DANG_KY_BADGE } from "./constants.js";
import { fetchDangKyHoc, processDangKyHoc, updateDangKyNote } from "./dataLayer.js";
import { SidebarDetailSkeleton, Spinner } from "../../components/ui/Skeleton.jsx";
import { exportDangKyExcel } from "./utils/excelRosterHelper.js";
import { SECTORS_DATA, detectSectorId, getSectorById } from "../../data/sectorsData.js";

const APPLE_EASE = [0.16, 1, 0.3, 1];

function relativeTime(iso) {
  if (!iso) return "Không xác định";
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "Vừa xong";
  if (min < 60) return `${min} phút trước`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day} ngày trước`;
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatFullDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/* ============================================================
   HOOK QUẢN LÝ ACCESSIBILITY & FOCUS TRAP CHO MODAL (AGENTS.md)
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
        sheet?.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]') || []
      ).filter((node) => node.getClientRects().length);

    // Focus phần tử đầu tiên
    const timer = setTimeout(() => {
      (controls()[0] || sheet)?.focus();
    }, 50);

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
      clearTimeout(timer);
      sheet?.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (!wasStopped) lenis?.start();
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open, lenis]);

  return sheetRef;
}

/* ============================================================
   MODAL XÁC NHẬN TỪ CHỐI HỒ SƠ (TUÂN THỦ AGENTS.md & ACCESSIBILITY)
   ============================================================ */
const RejectConfirmModal = ({ open, studentName, onConfirm, onCancel, busy, errorMessage }) => {
  const lenis = useLenis();
  const sheetRef = useSheetAccessibility(open, () => { if (!busy) onCancel(); }, lenis);
  const [reason, setReason] = useState("");

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm"
      onClick={!busy ? onCancel : undefined}
      ref={sheetRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-dialog-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto bg-[#fffefa] dark:bg-[#1e2821] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#dedfd4] dark:border-[#354237] relative flex flex-col gap-4 text-[#293d32] dark:text-[#ecece0] pb-[calc(1.5rem+env(safe-area-inset-bottom))] transition-colors"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30">
            <Ban className="w-5 h-5" />
          </div>
          <div className="flex-1 mt-0.5 min-w-0">
            <h3 id="reject-dialog-title" className="text-lg font-bold font-sans text-[#293d32] dark:text-[#ecece0] leading-tight mb-1">
              Xác nhận Từ chối hồ sơ
            </h3>
            <p className="text-xs sm:text-sm font-medium text-[#575e55] dark:text-[#b0b9ac] leading-relaxed break-words">
              Bạn có chắc chắn muốn từ chối hồ sơ đăng ký của giáo lý sinh <strong className="text-[#293d32] dark:text-[#ecece0]">{studentName}</strong>?
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-xs font-medium text-red-700 dark:text-red-300">
            {errorMessage}
          </div>
        )}

        <div>
          <label htmlFor="reject-reason-input" className="block text-xs font-bold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-wider mb-1.5">
            Lý do từ chối (Ghi vào ghi chú nội bộ)
          </label>
          <input
            id="reject-reason-input"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="VD: Không thuộc địa bàn giáo xứ, phụ huynh xin rút..."
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] text-base text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 focus:outline-none focus:ring-2 focus:ring-red-500/30"
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2.5 mt-2 pt-2 border-t border-[#dedfd4]/60 dark:border-[#354237]/60">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="min-h-[44px] flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#575e55] dark:text-[#b0b9ac] bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            Hủy thao tác
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onConfirm(reason)}
            className="min-h-[44px] flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {busy && <Spinner className="w-4 h-4 text-white" />}
            <span>Xác nhận từ chối</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default function DangKyTab() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlId = searchParams.get("id");

  const { showToast, refreshPendingDangKy, classes = [], namHoc = "2026–2027" } = useAdminContext();
  const { reduced } = useMotionConfig();

  // Scope Niên khóa: "current" (mặc định theo namHoc của Context) hoặc "all" (tất cả niên khóa)
  const [scopeNamHoc, setScopeNamHoc] = useState("current");
  const [statusFilter, setStatusFilter] = useState("moi");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "oldest"
  const [showInfoBanner, setShowInfoBanner] = useState(false);

  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const [selected, setSelected] = useState(null);
  const [mobileView, setMobileView] = useState(urlId ? "detail" : "list");
  const [processing, setProcessing] = useState(null);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Quản lý bản nháp ghi chú theo recordId
  const [draftNotes, setDraftNotes] = useState({});
  const [savingNote, setSavingNote] = useState(false);

  // Modal từ chối hồ sơ
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectError, setRejectError] = useState(null);

  // Request counter chống out-of-order race condition khi đổi niên khóa
  const reqIdRef = useRef(0);

  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 1024 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Tải danh sách đăng ký học có gắn với Niên khóa và chống race condition
  const load = useCallback(async () => {
    const curReqId = ++reqIdRef.current;
    setLoading(true);
    setLoadError(null);
    try {
      const targetNamHoc = scopeNamHoc === "current" ? namHoc : "all";
      const data = await fetchDangKyHoc("all", targetNamHoc);
      if (curReqId === reqIdRef.current) {
        setAllRecords(data || []);
      }
    } catch (err) {
      console.error("load dang ky error:", err);
      if (curReqId === reqIdRef.current) {
        setLoadError("Không thể tải danh sách đăng ký học. Vui lòng thử lại.");
        showToast("Không tải được danh sách đăng ký", "error");
      }
    } finally {
      if (curReqId === reqIdRef.current) {
        setLoading(false);
      }
    }
  }, [scopeNamHoc, namHoc, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  // Thống kê số lượng hồ sơ theo trạng thái
  const statusCounts = useMemo(() => {
    const counts = { all: allRecords.length, moi: 0, da_lien_he: 0, da_xep_lop: 0, tu_choi: 0 };
    allRecords.forEach((r) => {
      if (counts[r.trang_thai] !== undefined) {
        counts[r.trang_thai] += 1;
      }
    });
    return counts;
  }, [allRecords]);

  // Lọc dữ liệu theo statusFilter, sectorFilter, searchTerm
  const filteredRows = useMemo(() => {
    return allRecords.filter((r) => {
      // 1. Lọc theo trạng thái
      if (statusFilter !== "all" && r.trang_thai !== statusFilter) {
        return false;
      }

      // 2. Lọc theo Khối
      if (sectorFilter !== "all") {
        const detectedId = detectSectorId(r.khoi_dang_ky);
        if (detectedId !== sectorFilter) return false;
      }

      // 3. Lọc theo ô tìm kiếm
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchName = r.ho_ten?.toLowerCase().includes(q);
        const matchPhone = r.sdt?.toLowerCase().includes(q);
        const matchXom = r.giao_xom?.toLowerCase().includes(q);
        const matchKhoi = r.khoi_dang_ky?.toLowerCase().includes(q);
        const matchYear = r.nam_hoc?.toLowerCase().includes(q);
        const matchNote = r.ghi_chu?.toLowerCase().includes(q) || r.ghi_chu_admin?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchXom && !matchKhoi && !matchYear && !matchNote) {
          return false;
        }
      }

      return true;
    });
  }, [allRecords, statusFilter, sectorFilter, searchTerm]);

  // Sắp xếp dữ liệu (Mới nhất trước hoặc Cũ nhất trước - FIFO)
  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      const tA = new Date(a.created_at || 0).getTime();
      const tB = new Date(b.created_at || 0).getTime();
      return sortBy === "oldest" ? tA - tB : tB - tA;
    });
  }, [filteredRows, sortBy]);

  // Đồng bộ URL `?id=...` với `selected` và `mobileView`
  useEffect(() => {
    if (allRecords.length === 0) return;

    if (urlId) {
      const match = allRecords.find((r) => String(r.id) === String(urlId));
      if (match) {
        setSelected(match);
        if (isMobile) setMobileView("detail");
        return;
      }
    }

    // Nếu không có urlId
    if (isMobile) {
      setMobileView("list");
    } else {
      // Desktop: chọn hồ sơ đầu tiên trong sortedRows nếu đang không chọn hoặc hồ sơ đã chọn không còn trong danh sách
      if (sortedRows.length > 0) {
        const stillExists = sortedRows.find((r) => selected && r.id === selected.id);
        setSelected(stillExists || sortedRows[0]);
      } else {
        setSelected(null);
      }
    }
  }, [urlId, allRecords, sortedRows, isMobile]);

  // Mở chi tiết hồ sơ
  const openRow = useCallback((r) => {
    setSelected(r);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("id", String(r.id));
      return next;
    });
    if (isMobile) {
      setMobileView("detail");
    }
  }, [isMobile, setSearchParams]);

  // Quay lại danh sách hồ sơ
  const handleBackToList = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("id");
      return next;
    });
    setMobileView("list");
  }, [setSearchParams]);

  // Giá trị ghi chú hiện tại của hồ sơ đang chọn
  const currentNote = useMemo(() => {
    if (!selected) return "";
    return draftNotes[selected.id] !== undefined ? draftNotes[selected.id] : (selected.ghi_chu_admin || "");
  }, [selected, draftNotes]);

  const isNoteDirty = useMemo(() => {
    if (!selected) return false;
    return currentNote !== (selected.ghi_chu_admin || "");
  }, [selected, currentNote]);

  // Mutex lock: đang có request ghi chú hoặc trạng thái
  const isSubmitting = Boolean(savingNote || processing);

  // Cập nhật bản nháp ghi chú
  const handleNoteChange = (val) => {
    if (!selected) return;
    setDraftNotes((prev) => ({ ...prev, [selected.id]: val }));
  };

  // Lưu ghi chú nội bộ độc lập (chạy qua RPC để gán xu_ly_boi & xu_ly_luc tự động)
  const handleSaveNote = async () => {
    if (!selected || isSubmitting) return;
    const targetId = selected.id;
    const noteToSave = currentNote;
    setSavingNote(true);
    try {
      await updateDangKyNote(targetId, selected.trang_thai, noteToSave);
      showToast("Đã lưu ghi chú nội bộ thành công", "success");
      
      const nowIso = new Date().toISOString();
      // Cập nhật state tại chỗ (In-place update)
      setAllRecords((prev) =>
        prev.map((r) => (r.id === targetId ? { ...r, ghi_chu_admin: noteToSave, xu_ly_luc: nowIso } : r))
      );
      setSelected((prev) => (prev && prev.id === targetId ? { ...prev, ghi_chu_admin: noteToSave, xu_ly_luc: nowIso } : prev));
      
      // Xóa bản nháp để đồng bộ hoàn toàn với server
      setDraftNotes((prev) => {
        const next = { ...prev };
        if (next[targetId] === noteToSave) {
          delete next[targetId];
        }
        return next;
      });

      refreshPendingDangKy();
    } catch (err) {
      console.error("Save note error:", err);
      showToast("Không thể lưu ghi chú", "error");
    } finally {
      setSavingNote(false);
    }
  };

  // Xử lý chuyển trạng thái hồ sơ (Chống race condition & đồng bộ draft an toàn)
  const handleProcess = useCallback(async (trangThaiMoi, extraNote = "") => {
    if (!selected || isSubmitting) return;
    const targetId = selected.id;
    const finalNote = extraNote ? (currentNote ? `${currentNote} - ${extraNote}` : extraNote) : currentNote;
    setProcessing(trangThaiMoi);
    setRejectError(null);
    try {
      await processDangKyHoc(targetId, trangThaiMoi, finalNote);
      showToast(`Đã chuyển sang "${DANG_KY_LABELS_VI[trangThaiMoi]}"`, "success");
      
      const nowIso = new Date().toISOString();
      // Cập nhật state tại chỗ
      setAllRecords((prev) =>
        prev.map((r) => (r.id === targetId ? { ...r, trang_thai: trangThaiMoi, ghi_chu_admin: finalNote, xu_ly_luc: nowIso } : r))
      );
      setSelected((prev) => (prev && prev.id === targetId ? { ...prev, trang_thai: trangThaiMoi, ghi_chu_admin: finalNote, xu_ly_luc: nowIso } : prev));

      // Xóa bản nháp đã lưu
      setDraftNotes((prev) => {
        const next = { ...prev };
        delete next[targetId];
        return next;
      });

      if (trangThaiMoi === "tu_choi") {
        setRejectModalOpen(false);
      }

      if (isMobile) {
        handleBackToList();
      }

      refreshPendingDangKy();
    } catch (err) {
      console.error("process dang ky error:", err);
      if (trangThaiMoi === "tu_choi") {
        setRejectError(err?.message || "Không thể từ chối hồ sơ. Vui lòng thử lại.");
      }
      showToast(err?.message || "Cập nhật thất bại", "error");
    } finally {
      setProcessing(null);
    }
  }, [selected, isSubmitting, currentNote, isMobile, handleBackToList, refreshPendingDangKy, showToast]);

  // Sao chép số điện thoại
  const handleCopyPhone = useCallback(async (phone) => {
    if (!phone) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(phone);
      } else {
        const input = document.createElement("input");
        input.value = phone;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopiedPhone(true);
      showToast(`Đã sao chép SĐT: ${phone}`, "success", 2000);
      setTimeout(() => setCopiedPhone(false), 2000);
    } catch (err) {
      console.error("Copy phone error:", err);
      showToast("Không thể sao chép SĐT", "error");
    }
  }, [showToast]);

  // Xóa toàn bộ bộ lọc
  const handleResetFilters = useCallback(() => {
    setStatusFilter("all");
    setSectorFilter("all");
    setSearchTerm("");
    setSortBy("newest");
  }, []);

  // Xuất file Excel danh sách tuyển sinh
  const handleExportExcel = async () => {
    if (sortedRows.length === 0) {
      showToast("Không có hồ sơ nào để xuất Excel", "info");
      return;
    }
    setExporting(true);
    try {
      const filterLabel = DANG_KY_LABELS_VI[statusFilter] || "TatCa";
      const yearLabel = scopeNamHoc === "current" ? namHoc : "TatCaNienKhoa";
      await exportDangKyExcel(sortedRows, filterLabel, yearLabel);
      showToast("Đã xuất danh sách đăng ký ra file Excel thành công", "success");
    } catch (err) {
      console.error("Export Excel error:", err);
      showToast("Không thể xuất file Excel", "error");
    } finally {
      setExporting(false);
    }
  };

  // Tính tuổi ước lượng
  const currentAge = useMemo(() => {
    if (!selected?.nam_sinh) return null;
    const thisYear = new Date().getFullYear();
    return thisYear - Number(selected.nam_sinh);
  }, [selected?.nam_sinh]);

  // Nhận diện khối và thông tin sector
  const selectedSector = useMemo(() => {
    if (!selected) return null;
    const sectorId = detectSectorId(selected.khoi_dang_ky);
    return getSectorById(sectorId) || {
      id: "other",
      label: selected.khoi_dang_ky || "Chưa phân khối",
      shortLabel: "Khác",
      Icon: School,
      badge: "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300",
    };
  }, [selected]);

  // Lớp học cùng khối trong niên khóa
  const matchingClasses = useMemo(() => {
    if (!selected || !classes.length) return [];
    const sectorId = detectSectorId(selected.khoi_dang_ky);
    return classes.filter((c) => detectSectorId(c.lop) === sectorId);
  }, [selected, classes]);

  const cleanPhone = useMemo(() => {
    return selected?.sdt ? selected.sdt.replace(/\D/g, "") : "";
  }, [selected]);

  const isFiltering = statusFilter !== "all" || sectorFilter !== "all" || searchTerm.trim() !== "";

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: APPLE_EASE }}
      className="flex flex-col gap-4 sm:gap-5 pb-16 lg:pb-0"
    >
      {/* ════════════════════════════════════════════════════════════
          KHỐI 1: HEADER & BANNER THÔNG TIN (Ẩn trên Mobile khi xem Detail)
         ════════════════════════════════════════════════════════════ */}
      <div className={`${mobileView === "detail" ? "hidden lg:flex" : "flex"} flex-col gap-3 sm:gap-4`}>
        
        {/* Header Title & Top Controls (Sans-serif theo AGENTS.md) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fffefa] dark:bg-[#1e2821] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#dedfd4] dark:border-[#354237] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#314e3e]/10 dark:bg-[#d6b883]/20 border border-[#314e3e]/20 dark:border-[#d6b883]/30 flex-shrink-0">
              <UserPlus className="w-5 h-5 text-[#314e3e] dark:text-[#d6b883]" strokeWidth={2.25} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold font-sans text-[#293d32] dark:text-[#ecece0] leading-tight">
                  Hồ Sơ Đăng Ký Tuyển Sinh
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#314e3e]/10 dark:bg-[#d6b883]/20 text-[#314e3e] dark:text-[#d6b883]">
                  {scopeNamHoc === "current" ? `Niên khóa ${namHoc}` : "Tất cả niên khóa"}
                </span>
              </div>
              <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] font-medium mt-0.5">
                Tiếp nhận, xét duyệt và xếp lớp cho các em giáo lý sinh mới
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {/* Bộ chọn phạm vi Niên khóa */}
            <button
              type="button"
              onClick={() => setScopeNamHoc((prev) => (prev === "current" ? "all" : "current"))}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-bold bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] border border-[#dedfd4] dark:border-[#354237] hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.97] transition-all"
              title="Chuyển đổi giữa Niên khóa hiện tại và Tất cả niên khóa"
            >
              <Calendar className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" strokeWidth={2.25} />
              <span>{scopeNamHoc === "current" ? `Xem tất cả năm` : `Chỉ xem ${namHoc}`}</span>
            </button>

            {/* Nút bật tắt thông tin quy chế */}
            <button
              type="button"
              onClick={() => setShowInfoBanner((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-bold bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] border border-[#dedfd4] dark:border-[#354237] hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.97] transition-all"
              aria-expanded={showInfoBanner}
              aria-label="Thông tin quy chế tuyển sinh"
            >
              <Info className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" strokeWidth={2.25} />
              <span>Hướng dẫn</span>
              {showInfoBanner ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Nút Xuất Excel */}
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={exporting || sortedRows.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.97] transition-all shadow-xs disabled:opacity-50"
            >
              {exporting ? <Spinner className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />}
              <span>Xuất Excel ({sortedRows.length})</span>
            </button>
          </div>
        </div>

        {/* Collapsible Info Banner */}
        <AnimatePresence>
          {showInfoBanner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: APPLE_EASE }}
              className="overflow-hidden"
            >
              <div className="bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] p-4 rounded-2xl flex items-start gap-3 text-xs leading-relaxed text-[#293d32] dark:text-[#ecece0]">
                <Info className="w-4 h-4 text-[#927140] dark:text-[#d4b47d] shrink-0 mt-0.5" strokeWidth={2.25} />
                <div className="flex-1 space-y-1">
                  <p className="font-bold text-[#927140] dark:text-[#d4b47d] uppercase tracking-wider">
                    Quy chế xét duyệt tuyển sinh & Xếp lớp
                  </p>
                  <p className="font-medium text-[#575e55] dark:text-[#b0b9ac]">
                    • <strong>Đã xếp lớp</strong>: Hồ sơ đã được BQT duyệt và chỉ định lớp dự kiến. Để ghi danh chính thức vào danh sách lớp và tạo mã Giáo lý sinh, vui lòng chuyển sang <button type="button" onClick={() => navigate("/quản-trị/lớp-học")} className="font-bold text-[#314e3e] dark:text-[#d6b883] underline">tab Lớp học</button>.
                  </p>
                  <p className="font-medium text-[#575e55] dark:text-[#b0b9ac]">
                    • Các hồ sơ ở trạng thái <em>Đã xếp lớp</em> hoặc <em>Từ chối</em> có thể được hệ thống dọn dẹp định kỳ sau 7 ngày để tối ưu dữ liệu.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════════════════════════════
            KHỐI 2: TÍCH HỢP BỘ LỌC TRẠNG THÁI & TOOLBAR ĐIỀU KHIỂN
           ════════════════════════════════════════════════════════════ */}
        <div className="bg-[#fffefa] dark:bg-[#1e2821] p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#dedfd4] dark:border-[#354237] shadow-xs flex flex-col gap-3">
          
          {/* Hàng 1: Filter Pills Trạng Thái Tích Hợp Số Lượng */}
          <div
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {DANG_KY_STATUS_TABS.map((s) => {
              const active = statusFilter === s;
              const count = statusCounts[s] ?? 0;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStatusFilter(s);
                    if (isMobile) handleBackToList();
                  }}
                  className={`flex-shrink-0 px-3.5 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 active:scale-[0.97] flex items-center gap-2 ${
                    active
                      ? "bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] shadow-xs"
                      : "bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] border border-[#dedfd4] dark:border-[#354237] hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {s === "moi" && count > 0 && !reduced && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  )}
                  <span>{DANG_KY_LABELS_VI[s]}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs font-extrabold tabular-nums ${
                      active
                        ? "bg-white/20 text-white dark:bg-black/20 dark:text-[#19251d]"
                        : "bg-[#dedfd4]/60 dark:bg-[#354237]/60 text-[#293d32] dark:text-[#ecece0]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Hàng 2: Ô tìm kiếm, Chọn Khối, và Sắp xếp */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t border-[#dedfd4] dark:border-[#354237]">
            
            {/* Ô Tìm kiếm với cỡ chữ chuẩn 1rem chống phóng to trên mobile */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên học sinh, SĐT, giáo xóm, khối..."
                className="w-full pl-10 pr-11 py-2.5 min-h-[44px] text-base font-medium rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Xóa từ khóa tìm kiếm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl text-[#575e55] dark:text-[#b0b9ac] hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown / Select Khối Giáo lý (text-base mobile) */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-48">
                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value)}
                  aria-label="Lọc theo khối giáo lý"
                  className="w-full appearance-none pl-3.5 pr-8 py-2.5 min-h-[44px] rounded-xl text-base sm:text-sm font-bold bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 transition-all"
                >
                  <option value="all">Tất cả khối</option>
                  {SECTORS_DATA.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Sắp xếp: Mới nhất / Cũ nhất trước (FIFO) */}
              <div className="relative flex-1 sm:w-44">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Thứ tự sắp xếp"
                  className="w-full appearance-none pl-3.5 pr-8 py-2.5 min-h-[44px] rounded-xl text-base sm:text-sm font-bold bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 transition-all"
                >
                  <option value="newest">Mới nhất trước</option>
                  <option value="oldest">Cũ nhất trước (FIFO)</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-[#575e55] dark:text-[#b0b9ac] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          KHỐI 3: NỘI DUNG CHÍNH (MASTER - DETAIL & MOBILE DEDICATED)
         ════════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SidebarDetailSkeleton items={5} />
          </motion.div>
        ) : loadError ? (
          /* TRẠNG THÁI LỖI TẢI */
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-3 p-8 bg-[#fffefa] dark:bg-[#1e2821] border border-red-200 dark:border-red-800/40 rounded-3xl text-center shadow-xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-base font-bold font-sans text-[#293d32] dark:text-[#ecece0]">
              {loadError}
            </p>
            <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] max-w-sm">
              Không thể tải dữ liệu tuyển sinh từ máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.
            </p>
            <button
              type="button"
              onClick={load}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] shadow-sm active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Thử lại</span>
            </button>
          </motion.div>
        ) : sortedRows.length === 0 ? (
          /* TRẠNG THÁI RỖNG (EMPTY STATE) */
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: APPLE_EASE }}
            className="flex flex-col items-center justify-center gap-4 py-16 text-center bg-[#fffefa] dark:bg-[#1e2821] rounded-3xl border border-[#dedfd4] dark:border-[#354237] shadow-xs p-6"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237]">
              <Inbox className="h-6 w-6 text-[#575e55] dark:text-[#b0b9ac]" strokeWidth={2} />
            </div>
            <div>
              <p className="text-base font-bold font-sans text-[#293d32] dark:text-[#ecece0]">
                {isFiltering ? "Không tìm thấy hồ sơ phù hợp" : "Chưa có hồ sơ đăng ký nào"}
              </p>
              <p className="text-xs sm:text-sm font-medium text-[#575e55] dark:text-[#b0b9ac] mt-1 max-w-sm mx-auto leading-relaxed">
                {isFiltering
                  ? "Thử xóa từ khóa tìm kiếm hoặc đổi sang khối giáo lý / trạng thái khác."
                  : `Hồ sơ đăng ký học trong niên khóa ${namHoc} từ trang Tuyển sinh sẽ xuất hiện tại đây.`}
              </p>
            </div>
            {isFiltering && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl text-xs font-bold bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d6b883]" />
                <span>Xóa bộ lọc</span>
              </button>
            )}
          </motion.div>
        ) : (
          /* BỐ CỤC MASTER-DETAIL (DESKTOP) & MÀN HÌNH ĐỌC RIÊNG (MOBILE) */
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: APPLE_EASE }}
            className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[340px_1fr] gap-4 sm:gap-5 items-start"
          >
            {/* ════════ CỘT TRÁI: DANH SÁCH HỒ SƠ (MASTER LIST) ════════ */}
            <div className={`${mobileView === "detail" ? "hidden lg:flex" : "flex"} flex-col gap-2.5`}>
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-[#927140] dark:text-[#d4b47d] tracking-wider uppercase flex items-center gap-1.5">
                  <span>{DANG_KY_LABELS_VI[statusFilter]}</span>
                  {sectorFilter !== "all" && (
                    <span className="text-[#575e55] dark:text-[#b0b9ac]">· {getSectorById(sectorFilter)?.shortLabel}</span>
                  )}
                </span>
                <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2.5 rounded-full bg-[#314e3e]/10 dark:bg-[#d6b883]/20 text-[#314e3e] dark:text-[#d6b883] text-xs font-bold tabular-nums">
                  {sortedRows.length} hồ sơ
                </span>
              </div>

              {/* Danh sách cuộn độc lập trên Desktop / cuộn tự nhiên trên Mobile */}
              <div
                className="flex flex-col gap-2.5 lg:max-h-[calc(100vh-210px)] lg:overflow-y-auto lg:pr-1"
                data-lenis-prevent
              >
                {sortedRows.map((r) => {
                  const isActive = selected?.id === r.id;
                  const sec = getSectorById(detectSectorId(r.khoi_dang_ky));
                  const isNew = r.trang_thai === "moi";
                  const approxAge = r.nam_sinh ? new Date().getFullYear() - Number(r.nam_sinh) : null;

                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => openRow(r)}
                      className={`text-left rounded-2xl p-3.5 sm:p-4 border-l-[4px] transition-all duration-200 ease-out active:scale-[0.98] border min-h-[44px] flex flex-col gap-2 shadow-xs ${
                        isActive
                          ? "bg-[#314e3e]/10 dark:bg-[#d6b883]/20 border-l-[#314e3e] dark:border-l-[#d6b883] border-y-[#dedfd4] border-r-[#dedfd4] dark:border-y-[#354237] dark:border-r-[#354237]"
                          : "bg-[#fffefa] dark:bg-[#1e2821] border-l-transparent border-[#dedfd4] dark:border-[#354237] hover:border-l-[#314e3e]/50 dark:hover:border-l-[#d6b883]/50"
                      }`}
                    >
                      {/* Dòng 1: Tên học sinh & Trạng thái */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {isNew && !reduced && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse" title="Hồ sơ mới" />
                          )}
                          <p className={`text-sm font-bold font-sans break-words leading-tight ${isActive ? "text-[#314e3e] dark:text-[#d6b883]" : "text-[#293d32] dark:text-[#ecece0]"}`}>
                            {r.ho_ten}
                          </p>
                        </div>
                        {statusFilter === "all" && (
                          <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider shrink-0 ${DANG_KY_BADGE[r.trang_thai]}`}>
                            {DANG_KY_LABELS_VI[r.trang_thai]}
                          </span>
                        )}
                      </div>

                      {/* Dòng 2: Khối đăng ký & Năm sinh */}
                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md font-bold shrink-0 ${sec?.badge || "bg-stone-100 text-stone-800"}`}>
                          {sec?.shortLabel || r.khoi_dang_ky}
                        </span>
                        <span className="text-[#575e55] dark:text-[#b0b9ac] font-medium">
                          Sinh năm {r.nam_sinh} {approxAge ? `(~${approxAge} tuổi)` : ""}
                        </span>
                      </div>

                      {/* Dòng 3 & 4: Giáo xóm & Thời gian */}
                      <div className="flex items-center justify-between gap-2 text-xs text-[#575e55] dark:text-[#b0b9ac] pt-0.5 border-t border-[#dedfd4]/40 dark:border-[#354237]/40">
                        <span className="truncate flex items-center gap-1 font-medium">
                          <MapPin className="w-3 h-3 text-[#314e3e] dark:text-[#d6b883] shrink-0" />
                          {r.giao_xom || "Xóm chưa rõ"}
                        </span>
                        <span className="shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {relativeTime(r.created_at)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ════════ CỘT PHẢI: CHI TIẾT HỒ SƠ & HÀNH ĐỘNG (DETAIL VIEW) ════════ */}
            {selected && (
              <div className={`${mobileView === "list" ? "hidden lg:block" : "block"} flex-1 min-w-0`}>
                <div className="bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col gap-5">
                  
                  {/* Top Bar trên Mobile: Nút Quay lại & Badge trạng thái */}
                  <div className="lg:hidden flex items-center justify-between pb-3 border-b border-[#dedfd4] dark:border-[#354237]">
                    <button
                      type="button"
                      onClick={handleBackToList}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#293d32] dark:text-[#ecece0] px-3.5 py-2.5 min-h-[44px] active:scale-95 transition-all bg-[#faf8f3] dark:bg-[#151c18] rounded-xl border border-[#dedfd4] dark:border-[#354237] shadow-xs"
                    >
                      <ChevronLeft className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" strokeWidth={2.5} />
                      <span>Quay lại danh sách</span>
                    </button>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${DANG_KY_BADGE[selected.trang_thai]}`}>
                      {DANG_KY_LABELS_VI[selected.trang_thai]}
                    </span>
                  </div>

                  {/* 1. Header Hồ sơ: Tên học sinh (sans-serif), Năm sinh, Khối, Niên khóa */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h2 className="text-xl sm:text-2xl font-bold font-sans text-[#293d32] dark:text-[#ecece0] leading-tight break-words">
                          {selected.ho_ten}
                        </h2>
                        {selected.nam_hoc && (
                          <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-[#314e3e]/10 dark:bg-[#d6b883]/20 text-[#314e3e] dark:text-[#d6b883]">
                            Niên khóa {selected.nam_hoc}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-medium text-[#575e55] dark:text-[#b0b9ac]">
                        <span className={`px-2.5 py-1 rounded-lg font-bold ${selectedSector?.badge || "bg-stone-100 text-stone-800"}`}>
                          {selectedSector?.label || selected.khoi_dang_ky}
                        </span>
                        <span>Sinh năm <strong className="text-[#293d32] dark:text-[#ecece0]">{selected.nam_sinh}</strong></span>
                        {currentAge && (
                          <>
                            <span className="opacity-40">•</span>
                            <span>Khoảng <strong className="text-[#314e3e] dark:text-[#d6b883]">{currentAge} tuổi</strong></span>
                          </>
                        )}
                        <span className="opacity-40">•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d6b883]" />
                          <span>{formatFullDate(selected.created_at)}</span>
                        </span>
                      </div>
                    </div>

                    <span className={`hidden lg:inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex-shrink-0 shadow-xs ${DANG_KY_BADGE[selected.trang_thai] || ""}`}>
                      {DANG_KY_LABELS_VI[selected.trang_thai]}
                    </span>
                  </div>

                  {/* 2. Thông tin liên hệ & Giáo xóm */}
                  <div className="rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] p-4 flex flex-col gap-3 shadow-xs">
                    <div className="grid sm:grid-cols-2 gap-3">
                      {/* SĐT Phụ huynh */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#314e3e]/10 dark:bg-[#d6b883]/20 flex items-center justify-center text-[#314e3e] dark:text-[#d6b883] shrink-0">
                          <Phone className="w-4 h-4" strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-wider">SĐT Phụ huynh</p>
                          <p className="text-base font-bold text-[#293d32] dark:text-[#ecece0] tabular-nums">{selected.sdt || "(Chưa có SĐT)"}</p>
                        </div>
                      </div>

                      {/* Giáo xóm */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#314e3e]/10 dark:bg-[#d6b883]/20 flex items-center justify-center text-[#314e3e] dark:text-[#d6b883] shrink-0">
                          <MapPin className="w-4 h-4" strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-wider">Giáo họ / Giáo xóm</p>
                          <p className="text-sm font-bold text-[#293d32] dark:text-[#ecece0] truncate">{selected.giao_xom || "Chưa ghi nhận"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Nút hành động liên hệ nhanh (min-h-[44px]) */}
                    {selected.sdt && (
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#dedfd4]/60 dark:border-[#354237]/60">
                        {/* Gọi ngay */}
                        <a
                          href={`tel:${selected.sdt}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] text-xs font-bold hover:bg-[#253d30] dark:hover:bg-[#c4a670] transition-all shadow-xs active:scale-[0.97]"
                        >
                          <PhoneCall className="w-4 h-4" strokeWidth={2.5} />
                          <span>Gọi ngay</span>
                        </a>

                        {/* Sao chép SĐT */}
                        <button
                          type="button"
                          onClick={() => handleCopyPhone(selected.sdt)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl bg-[#fffefa] dark:bg-[#1e2821] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-xs active:scale-[0.97]"
                        >
                          {copiedPhone ? <CheckCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac]" />}
                          <span>{copiedPhone ? "Đã chép" : "Chép SĐT"}</span>
                        </button>

                        {/* Zalo */}
                        {cleanPhone && (
                          <a
                            href={`https://zalo.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all shadow-xs active:scale-[0.97]"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Zalo</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 3. Ghi chú từ Phụ huynh */}
                  {selected.ghi_chu && (
                    <div className="rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] p-4 shadow-xs">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#927140] dark:text-[#d4b47d] mb-1.5 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Ghi chú từ Phụ huynh
                      </p>
                      <p className="text-sm font-medium text-[#293d32] dark:text-[#ecece0] leading-relaxed italic whitespace-pre-wrap break-words">
                        "{selected.ghi_chu}"
                      </p>
                    </div>
                  )}

                  {/* 4. Ghi chú nội bộ BQT (Có nút lưu độc lập & chỉ báo bản nháp) */}
                  <div className="rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] p-4 flex flex-col gap-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <label htmlFor="admin-note-input" className="text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac] flex items-center gap-1.5">
                        <Save className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d6b883]" />
                        <span>Ghi chú nội bộ Ban Quản trị</span>
                      </label>
                      <div className="flex items-center gap-2">
                        {isNoteDirty ? (
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                            Chưa lưu
                          </span>
                        ) : selected.ghi_chu_admin ? (
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                            Đã lưu
                          </span>
                        ) : null}

                        <button
                          type="button"
                          disabled={savingNote || !isNoteDirty || isSubmitting}
                          onClick={handleSaveNote}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-bold bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] hover:bg-[#253d30] dark:hover:bg-[#c4a670] active:scale-95 transition-all disabled:opacity-40"
                        >
                          {savingNote ? <Spinner className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                          <span>Lưu ghi chú</span>
                        </button>
                      </div>
                    </div>

                    <textarea
                      id="admin-note-input"
                      value={currentNote}
                      onChange={(e) => handleNoteChange(e.target.value)}
                      rows={2}
                      placeholder="VD: Đã gọi trao đổi, hẹn phụ huynh nộp giấy Rửa Tội và xếp lớp Khai Tâm 1..."
                      className="w-full rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-white dark:bg-[#1e2821] px-3.5 py-2.5 text-base font-medium text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 transition-shadow resize-none"
                    />

                    {selected.xu_ly_boi && (
                      <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] font-medium pt-0.5">
                        Cập nhật lần cuối bởi <strong className="text-[#293d32] dark:text-[#ecece0]">{selected.xu_ly_boi}</strong> · {relativeTime(selected.xu_ly_luc)}
                      </p>
                    )}
                  </div>

                  {/* 5. Các lớp cùng khối trong niên khóa (Gợi ý dự kiến & link ghi danh) */}
                  {matchingClasses.length > 0 && (
                    <div className="rounded-2xl bg-[#314e3e]/5 dark:bg-[#d6b883]/10 border border-[#314e3e]/20 dark:border-[#d6b883]/30 p-4 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#314e3e] dark:text-[#d6b883] flex items-center gap-1.5">
                          <School className="w-3.5 h-3.5" />
                          Các lớp cùng khối trong niên khóa {namHoc}
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate("/quản-trị/lớp-học")}
                          className="min-h-[44px] text-xs font-bold text-[#314e3e] dark:text-[#d6b883] hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
                        >
                          <span>Mở tab Lớp học để xếp lớp chính thức</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] mb-2 font-medium">
                        Chạm vào lớp để gắn nhãn dự kiến vào ghi chú:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {matchingClasses.map((c) => (
                          <button
                            key={c.id || c.lop}
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => {
                              const note = `Dự kiến vào ${c.lop}`;
                              const updated = currentNote ? `${currentNote} - ${note}` : note;
                              handleNoteChange(updated);
                              showToast(`Đã thêm ghi chú dự kiến: ${c.lop}`, "info");
                            }}
                            className="px-3.5 py-2 min-h-[44px] rounded-xl bg-white dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-xs font-bold text-[#293d32] dark:text-[#ecece0] hover:border-[#314e3e] dark:hover:border-[#d6b883] active:scale-95 transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <span>{c.lop}</span>
                            <span className="text-xs text-[#575e55] dark:text-[#b0b9ac]">({c.studentCount || 0} em)</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 6. HÀNH ĐỘNG DUYỆT TRẠNG THÁI (Phân cấp rõ ràng & Khóa Mutex) */}
                  <div className="flex flex-col gap-2.5 pt-3 border-t border-[#dedfd4] dark:border-[#354237]">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#927140] dark:text-[#d4b47d]">
                      Cập nhật trạng thái hồ sơ tuyển sinh
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                      {/* Nút hành động chính 1: Đã liên hệ (nếu đang ở Mới) */}
                      {selected.trang_thai === "moi" && (
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleProcess("da_lien_he")}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs active:scale-[0.98] disabled:opacity-50"
                        >
                          {processing === "da_lien_he" ? <Spinner className="w-4 h-4" /> : <PhoneCall className="w-4 h-4" />}
                          <span>Đánh dấu Đã liên hệ</span>
                        </button>
                      )}

                      {/* Nút hành động chính 2: Đã xếp lớp (nếu chưa xếp lớp) */}
                      {selected.trang_thai !== "da_xep_lop" && (
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleProcess("da_xep_lop")}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] hover:bg-[#253d30] dark:hover:bg-[#c4a670] transition-all shadow-xs active:scale-[0.98] disabled:opacity-50"
                        >
                          {processing === "da_xep_lop" ? <Spinner className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          <span>Đánh dấu Đã xếp lớp</span>
                        </button>
                      )}

                      {/* Khi đã xếp lớp */}
                      {selected.trang_thai === "da_xep_lop" && (
                        <div className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Hồ sơ đã được đánh dấu xếp lớp</span>
                        </div>
                      )}

                      {/* Hành động phụ: Chuyển về Mới */}
                      {selected.trang_thai !== "moi" && (
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleProcess("moi")}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-xs active:scale-[0.98] disabled:opacity-50"
                        >
                          {processing === "moi" ? <Spinner className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                          <span>Chuyển về Mới</span>
                        </button>
                      )}

                      {/* Hành động phụ: Từ chối hồ sơ (Có modal xác nhận) */}
                      {selected.trang_thai !== "tu_choi" && (
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => {
                            setRejectError(null);
                            setRejectModalOpen(true);
                          }}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all shadow-xs active:scale-[0.98] disabled:opacity-50"
                        >
                          <Ban className="w-4 h-4" />
                          <span>Từ chối</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] font-medium mt-1 leading-relaxed">
                      * Cập nhật trạng thái chỉ dùng cho quản trị nội bộ tuyển sinh, không gửi thông báo tự động cho phụ huynh.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL XÁC NHẬN TỪ CHỐI HỒ SƠ ── */}
      <RejectConfirmModal
        open={rejectModalOpen}
        studentName={selected?.ho_ten || ""}
        busy={processing === "tu_choi"}
        errorMessage={rejectError}
        onCancel={() => {
          if (processing !== "tu_choi") {
            setRejectModalOpen(false);
            setRejectError(null);
          }
        }}
        onConfirm={(reason) => handleProcess("tu_choi", reason ? `Từ chối: ${reason}` : "")}
      />
    </motion.div>
  );
}