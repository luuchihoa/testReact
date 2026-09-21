import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  Filter,
  AlertTriangle,
  RefreshCw,
  Search,
  ChevronDown,
  Info,
  Users,
  CheckCircle,
  Clock,
  Sparkles,
  Download,
} from "lucide-react";
import { useAdminContext } from "../AdminContext.jsx";
import { TableSkeleton, CardsGridSkeleton, Spinner } from "../../../components/ui/Skeleton.jsx";
import {
  REPORT_TYPES,
  REPORT_CONFIGS,
  TERMS,
  TERM_LABELS,
} from "./reportConfig.js";
import { useReportStats } from "./useReportStats.js";
import { exportReportsToExcel } from "./exportReportsExcel.js";
import { StatCell } from "./StatCell.jsx";
import { ReportPrintStyles } from "./ReportPrintStyles.jsx";
import {
  exportStatsReportPdf,
  triggerSafePdfDownload,
} from "../utils/pdfExportHelper.js";

const FIXED_COLUMN_COUNT = 3; // Lớp, Sĩ số, Đã xếp loại

export default function ReportsTab() {
  const { classes, namHoc, loading: contextLoading, showToast } = useAdminContext();
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc params từ URL nếu có, fallback về mặc định
  const initialType = searchParams.get("type");
  const initialTerm = searchParams.get("term");

  const [reportType, setReportType] = useState(
    initialType && REPORT_CONFIGS[initialType] ? initialType : REPORT_TYPES.HOC_LUC
  );
  const [term, setTerm] = useState(
    initialTerm && TERMS[initialTerm] ? initialTerm : TERMS.CN
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [filterAnomalyOnly, setFilterAnomalyOnly] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const exportMenuRef = useRef(null);
  const exportButtonRef = useRef(null);

  const config = REPORT_CONFIGS[reportType] || REPORT_CONFIGS.HOC_LUC;
  const totalCols = FIXED_COLUMN_COUNT + config.columns.length;

  // Cập nhật URL search params khi đổi filter
  const handleTypeChange = useCallback(
    (newType) => {
      setReportType(newType);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("type", newType);
        return next;
      });
    },
    [setSearchParams]
  );

  const handleTermChange = useCallback(
    (newTerm) => {
      setTerm(newTerm);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("term", newTerm);
        return next;
      });
    },
    [setSearchParams]
  );

  const handleFetchError = useMemo(
    () => () => showToast("Không tải được dữ liệu báo cáo", "error"),
    [showToast]
  );

  const {
    stats,
    systemTotals,
    loading: loadingStats,
    error,
    loadedAt,
    reload,
  } = useReportStats({
    classes,
    namHoc,
    term,
    reportType,
    onError: handleFetchError,
  });

  // Đóng Export Dropdown khi bấm ngoài hoặc nhấn Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && exportMenuOpen) {
        setExportMenuOpen(false);
        exportButtonRef.current?.focus();
      }
    }
    function handleClickOutside(e) {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(e.target) &&
        !exportButtonRef.current?.contains(e.target)
      ) {
        setExportMenuOpen(false);
      }
    }
    if (exportMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportMenuOpen]);

  // Lọc danh sách lớp theo tìm kiếm và bất thường
  const filteredStats = useMemo(() => {
    let result = stats;
    if (filterAnomalyOnly) {
      result = result.filter((s) => s.hasAnomaly);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((s) => s.lop.toLowerCase().includes(q));
    }
    return result;
  }, [stats, filterAnomalyOnly, searchQuery]);

  const hasAnomalies = systemTotals?.anomalyClassCount > 0;
  const hasValidData = systemTotals?.validClassCount > 0;

  // Xử lý Xuất Excel (Chỉ tải thư viện động khi người dùng bấm)
  const handleExportExcel = async (isReconciliation = false) => {
    setExporting(true);
    setExportMenuOpen(false);
    try {
      const res = await exportReportsToExcel({
        stats,
        systemTotals,
        reportType,
        term,
        namHoc,
        isReconciliation,
      });
      if (res?.cancelled) {
        showToast("Đã hủy lưu file", "info");
      } else if (res?.method === "picker") {
        showToast("Đã lưu báo cáo Excel thành công", "success");
      } else {
        showToast("Đang tải file Excel về máy...", "info");
      }
    } catch (err) {
      console.error("Export Excel error:", err);
      showToast("Xuất Excel thất bại", "error");
    } finally {
      setExporting(false);
    }
  };

  // Xử lý Xuất PDF (Chỉ tải thư viện động khi người dùng bấm)
  const handleExportPDF = async (isReconciliation = false) => {
    if (exportingPdf) return;
    if (!stats || stats.length === 0) {
      showToast("Chưa có dữ liệu thống kê để xuất", "warning");
      return;
    }
    setExportingPdf(true);
    setExportMenuOpen(false);
    try {
      const safeType = String(reportType || "BaoCao").replace(/[^a-zA-Z0-9_-]/g, "_");
      const prefix = isReconciliation ? "DoiChieu_ThongKe" : "BaoCao";
      const fileName = `${prefix}_${safeType}_${term}_${namHoc}.pdf`;
      const blob = await exportStatsReportPdf({
        namHoc,
        term,
        config,
        stats,
        systemTotals,
        isReconciliation,
      });
      const res = await triggerSafePdfDownload(blob, fileName);
      if (res?.cancelled) {
        showToast("Đã hủy lưu file", "info");
        return;
      }
      if (res?.method === "picker") {
        showToast("Đã lưu báo cáo PDF thành công", "success");
      } else {
        showToast("Đang tải file PDF về máy...", "info");
      }
    } catch (err) {
      console.error("Export report PDF error:", err);
      showToast("Xuất PDF thất bại", "error");
    } finally {
      setExportingPdf(false);
    }
  };

  if (contextLoading) {
    return (
      <div className="flex flex-col gap-4">
        <CardsGridSkeleton count={4} />
        <TableSkeleton rows={6} columns={totalCols} />
      </div>
    );
  }

  const exportDisabled =
    exporting || exportingPdf || loadingStats || stats.length === 0 || !!error;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 fade-in-up font-sans">
      <ReportPrintStyles />

      {/* ---------- Header Ngữ cảnh & Thời gian tải ---------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-[#dedfd4] dark:border-[#354237]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#293d32] dark:text-[#ecece0]">
            Báo cáo Thống kê
          </h1>
          <p className="text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac] mt-0.5">
            Tổng hợp kết quả học tập và hạnh kiểm niên khóa {namHoc}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {loadedAt && !loadingStats && !error && (
            <span className="text-xs text-[#575e55] dark:text-[#b0b9ac] bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] px-3 py-1.5 rounded-xl">
              Cập nhật:{" "}
              <strong className="font-bold text-[#293d32] dark:text-[#ecece0] tabular-nums">
                {new Date(loadedAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
            </span>
          )}
          <button
            type="button"
            onClick={reload}
            disabled={loadingStats}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150 disabled:opacity-50 cursor-pointer"
            title="Tải lại dữ liệu mới nhất"
            aria-label="Tải lại dữ liệu báo cáo"
          >
            <RefreshCw className={`w-4 h-4 ${loadingStats ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>
      </div>

      {/* ---------- Thanh Điều Khiển & Bộ Lọc ---------- */}
      <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] shadow-sm p-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Chọn Loại Báo Cáo */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
            <label
              htmlFor="report-type-select"
              className="text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac] whitespace-nowrap"
            >
              Loại báo cáo:
            </label>
            <div className="relative">
              <select
                id="report-type-select"
                value={reportType}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="appearance-none bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] rounded-xl px-3.5 py-2.5 pr-9 min-h-[44px] text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 cursor-pointer"
              >
                {Object.values(REPORT_TYPES).map((type) => (
                  <option key={type} value={type}>
                    {REPORT_CONFIGS[type].label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#575e55] dark:text-[#b0b9ac]">
                <Filter className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Chọn Học Kỳ / Cả Năm */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac] whitespace-nowrap">
              Kỳ đánh giá:
            </span>
            <div
              role="group"
              aria-label="Chọn kỳ đánh giá"
              className="flex bg-[#faf8f3] dark:bg-[#151c18] p-1 rounded-xl border border-[#dedfd4] dark:border-[#354237]"
            >
              {Object.values(TERMS).map((t) => {
                const isActive = term === t;
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => handleTermChange(t)}
                    className={`px-3.5 py-2 min-h-[40px] rounded-lg text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-sm"
                        : "text-[#575e55] dark:text-[#b0b9ac] hover:text-[#293d32] dark:hover:text-[#ecece0]"
                    }`}
                  >
                    {TERM_LABELS[t]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Menu Xuất Báo Cáo */}
        <div className="relative self-stretch sm:self-end lg:self-auto">
          <button
            ref={exportButtonRef}
            type="button"
            disabled={exportDisabled}
            aria-haspopup="menu"
            aria-expanded={exportMenuOpen}
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold bg-[#314e3e] text-white hover:bg-[#253d30] dark:bg-[#d6b883] dark:text-[#19251d] dark:hover:bg-[#c4a670] shadow-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {exporting || exportingPdf ? (
              <Spinner className="w-4 h-4 text-white dark:text-[#19251d]" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>
              {exporting
                ? "Đang xuất Excel..."
                : exportingPdf
                ? "Đang xuất PDF..."
                : hasAnomalies
                ? "Xuất bản đối chiếu..."
                : "Xuất báo cáo"}
            </span>
            <ChevronDown className="w-4 h-4 ml-0.5" />
          </button>

          {exportMenuOpen && (
            <div
              ref={exportMenuRef}
              role="menu"
              className="absolute right-0 top-full mt-2 w-72 bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-2xl shadow-xl p-2 z-30 flex flex-col gap-1.5"
            >
              <div className="px-3 py-1.5 border-b border-[#dedfd4]/60 dark:border-[#354237]/60">
                <p className="text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">
                  {hasAnomalies ? "Xuất Bản Đối Chiếu" : "Xuất Báo Cáo Chính Thức"}
                </p>
                {hasAnomalies && (
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5 leading-snug">
                    Dữ liệu có bất thường. File xuất sẽ đính kèm cột ghi chú chi tiết.
                  </p>
                )}
              </div>

              <button
                role="menuitem"
                type="button"
                onClick={() => handleExportExcel(hasAnomalies)}
                className="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] hover:bg-black/5 dark:hover:bg-white/5 text-left transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div>{hasAnomalies ? "Bản đối chiếu Excel (.xlsx)" : "Báo cáo Excel (.xlsx)"}</div>
                  <div className="text-xs font-normal text-[#575e55] dark:text-[#b0b9ac]">
                    Kèm dòng tổng cộng & tỷ lệ
                  </div>
                </div>
              </button>

              <button
                role="menuitem"
                type="button"
                onClick={() => handleExportPDF(hasAnomalies)}
                className="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] hover:bg-black/5 dark:hover:bg-white/5 text-left transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center text-red-700 dark:text-red-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div>{hasAnomalies ? "Bản đối chiếu PDF (.pdf)" : "Báo cáo PDF (.pdf)"}</div>
                  <div className="text-xs font-normal text-[#575e55] dark:text-[#b0b9ac]">
                    Khổ ngang A4 có chữ ký
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---------- Thông Báo Lỗi / Không Tải Được ---------- */}
      {error && !loadingStats && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-700/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-red-900 dark:text-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold">Không thể tải dữ liệu báo cáo</h2>
              <p className="text-xs text-red-800/90 dark:text-red-300/90 mt-1 leading-relaxed">
                Đã xảy ra sự cố trong quá trình kết nối hoặc truy vấn cơ sở dữ liệu. Để đảm bảo tính
                chính xác, hệ thống không hiển thị số liệu cũ chưa được xác minh.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={reload}
            className="px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 transition-colors shrink-0 cursor-pointer"
          >
            Thử lại ngay
          </button>
        </div>
      )}

      {/* ---------- Skeleton Khi Đang Tải Dữ Liệu Mới ---------- */}
      {loadingStats && (
        <div className="flex flex-col gap-4">
          <CardsGridSkeleton count={4} />
          <TableSkeleton rows={6} columns={totalCols} />
        </div>
      )}

      {/* ---------- Nội Dung Dữ Liệu Báo Cáo ---------- */}
      {!loadingStats && !error && (
        <>
          {/* Cảnh Báo Bất Thường Dữ Liệu (Nếu Có) */}
          {hasAnomalies && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold">
                    Cảnh báo: Phát hiện {systemTotals.anomalyClassCount} lớp có dữ liệu bất thường
                  </h3>
                  <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                    Có lớp chưa khớp sĩ số hoặc kết quả vượt số lượng. Số liệu tổng hợp hệ thống bên
                    dưới chỉ tính trên <strong>{systemTotals.validClassCount}/{systemTotals.totalClasses} lớp hợp lệ</strong>.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setFilterAnomalyOnly(!filterAnomalyOnly)}
                  className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-colors border cursor-pointer ${
                    filterAnomalyOnly
                      ? "bg-amber-700 text-white border-amber-800 dark:bg-amber-500 dark:text-stone-900"
                      : "bg-white dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-700 hover:bg-amber-100/60"
                  }`}
                >
                  {filterAnomalyOnly ? "Hiển thị tất cả lớp" : "Lọc lớp cần rà soát"}
                </button>
              </div>
            </div>
          )}

          {/* Khối KPI 4 Ô Tổng Quan */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* KPI 1: Tổng Giáo lý sinh */}
            <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">
                  Tổng Giáo lý sinh
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#314e3e]/10 dark:bg-[#d6b883]/20 flex items-center justify-center text-[#314e3e] dark:text-[#d6b883]">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold tabular-nums text-[#293d32] dark:text-[#ecece0]">
                  {hasValidData ? systemTotals.trustedTotalStudents : "Chưa xác định"}
                </div>
                <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] mt-1 truncate">
                  {hasAnomalies
                    ? `Tính trên ${systemTotals.validClassCount}/${systemTotals.totalClasses} lớp hợp lệ`
                    : `Toàn bộ ${systemTotals?.totalClasses || 0} lớp`}
                </p>
              </div>
            </div>

            {/* KPI 2: Đã xếp loại */}
            <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">
                  Đã xếp loại
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                  {hasValidData ? systemTotals.trustedTotalGraded : 0}
                </div>
                <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] mt-1 truncate">
                  Đã có kết quả đánh giá
                </p>
              </div>
            </div>

            {/* KPI 3: Chưa xếp loại */}
            <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">
                  Chưa xếp loại
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold tabular-nums text-amber-700 dark:text-amber-400">
                  {hasValidData ? systemTotals.trustedTotalUnfinished : 0}
                </div>
                <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] mt-1 truncate">
                  Cần hoàn tất hồ sơ
                </p>
              </div>
            </div>

            {/* KPI 4: Tỉ lệ hoàn thành */}
            <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">
                  Tỉ lệ hoàn thành
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-700 dark:text-blue-400">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold tabular-nums text-[#293d32] dark:text-[#ecece0]">
                  {hasValidData ? `${systemTotals.trustedCompletionRate}%` : "0%"}
                </div>
                <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] mt-1 truncate">
                  Tiến độ đánh giá toàn khối
                </p>
              </div>
            </div>
          </div>

          {/* Biểu đồ Thanh Ngang Xếp Chồng 100% & Chú giải */}
          {hasValidData && systemTotals.trustedTotalGraded > 0 && (
            <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] p-4 sm:p-5 flex flex-col gap-3 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac] flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" />
                  Cơ cấu phân bổ {config.label} hệ thống
                </h2>
                <span className="text-xs text-[#575e55] dark:text-[#b0b9ac]">
                  Tổng hợp từ{" "}
                  <strong className="text-[#293d32] dark:text-[#ecece0] tabular-nums">
                    {systemTotals.trustedTotalGraded}
                  </strong>{" "}
                  em đã xếp loại
                </span>
              </div>

              {/* Thanh Ngang Xếp Chồng (100% Stacked Bar) */}
              <div
                role="progressbar"
                aria-label={`Biểu đồ phân bổ ${config.label}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={100}
                className="w-full h-7 rounded-xl overflow-hidden flex bg-black/5 dark:bg-white/5 border border-[#dedfd4] dark:border-[#354237]"
              >
                {config.columns.map((col) => {
                  const pct = systemTotals.colPercentages[col.key] || 0;
                  if (pct <= 0) return null;
                  return (
                    <div
                      key={col.key}
                      style={{ width: `${pct}%`, backgroundColor: col.color }}
                      className="h-full transition-all duration-300 relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      title={`${col.label}: ${systemTotals.colTotals[col.key]} em (${pct}%)`}
                      tabIndex={0}
                      role="img"
                      aria-label={`${col.label}: ${systemTotals.colTotals[col.key]} em (${pct}%)`}
                    />
                  );
                })}
              </div>

              {/* Danh Sách Chú Giải Dưới Biểu Đồ */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-[#dedfd4]/60 dark:border-[#354237]/60">
                {config.columns.map((col) => {
                  const count = systemTotals.colTotals[col.key] || 0;
                  const pct = systemTotals.colPercentages[col.key] || 0;
                  return (
                    <div
                      key={col.key}
                      className="flex items-center gap-2 p-2 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4]/70 dark:border-[#354237]/70"
                      tabIndex={0}
                      aria-label={`${col.label}: ${count} em, chiếm ${pct}%`}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: col.color }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac] truncate">
                          {col.label}
                        </div>
                        <div className="text-xs font-bold text-[#293d32] dark:text-[#ecece0] tabular-nums">
                          {count}{" "}
                          <span className="font-normal text-[#575e55] dark:text-[#b0b9ac]">
                            ({pct}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ô Tìm Kiếm Lớp */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên lớp..."
                aria-label="Tìm kiếm theo tên lớp"
                className="w-full bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-xl pl-10 pr-4 py-2.5 min-h-[44px] text-xs sm:text-sm text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 dark:placeholder-[#b0b9ac]/60 focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30"
              />
            </div>
            <div className="text-xs text-[#575e55] dark:text-[#b0b9ac] self-center sm:self-auto">
              Hiển thị{" "}
              <strong className="text-[#293d32] dark:text-[#ecece0] tabular-nums">
                {filteredStats.length}
              </strong>{" "}
              / {stats.length} lớp
            </div>
          </div>

          {/* ---------- Hiển Thị Danh Sách Lớp (Card Mobile & Table Desktop) ---------- */}
          {filteredStats.length === 0 ? (
            <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#314e3e]/10 dark:bg-[#d6b883]/20 flex items-center justify-center text-[#314e3e] dark:text-[#d6b883]">
                <BarChart3 className="w-6 h-6" />
              </div>
              <p className="text-sm sm:text-base font-bold text-[#293d32] dark:text-[#ecece0]">
                Không tìm thấy dữ liệu phù hợp
              </p>
              <p className="text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac]">
                Vui lòng thử đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc học kỳ.
              </p>
            </div>
          ) : (
            <>
              {/* 1. Giao diện Card cho Mobile & Tablet (< 1024px) */}
              <div className="lg:hidden flex flex-col gap-3.5">
                {filteredStats.map((r) => (
                  <div
                    key={r.lop}
                    className={`bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border ${
                      r.hasAnomaly
                        ? "border-red-300 dark:border-red-700/60 bg-red-50/20 dark:bg-red-950/10"
                        : "border-[#dedfd4] dark:border-[#354237]"
                    } p-4 shadow-sm flex flex-col gap-3`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-[#293d32] dark:text-[#ecece0]">
                          {r.lop}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-[#575e55] dark:text-[#b0b9ac]">
                          <span>
                            Sĩ số:{" "}
                            <strong className="text-[#293d32] dark:text-[#ecece0] tabular-nums">
                              {r.studentCount}
                            </strong>
                          </span>
                          <span>•</span>
                          <span>
                            Đã xếp loại:{" "}
                            <strong className="text-[#314e3e] dark:text-[#d6b883] tabular-nums">
                              {r.totalGraded}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {r.hasAnomaly ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800">
                          <AlertTriangle className="w-3 h-3" /> Cần rà soát
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                          {r.studentCount > 0
                            ? `${Math.round((r.totalGraded / r.studentCount) * 100)}%`
                            : "0%"}
                        </span>
                      )}
                    </div>

                    {r.hasAnomaly && (
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-300">
                        <div className="font-bold flex items-center gap-1.5 mb-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Chi tiết bất thường:
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 ml-1">
                          {r.anomalyReasons.map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Chi tiết phân bổ các cột */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2 border-t border-[#dedfd4]/60 dark:border-[#354237]/60">
                      {config.columns.map((col) => {
                        const count = r[col.key] || 0;
                        const pct =
                          r.totalGraded > 0 ? Math.round((count / r.totalGraded) * 100) : 0;
                        return (
                          <div
                            key={col.key}
                            className="p-2 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4]/70 dark:border-[#354237]/70 text-center"
                          >
                            <div className="text-xs font-medium text-[#575e55] dark:text-[#b0b9ac] truncate">
                              {col.label}
                            </div>
                            <div className="text-sm font-bold text-[#293d32] dark:text-[#ecece0] tabular-nums mt-0.5">
                              {count}
                            </div>
                            <div className="text-xs text-[#575e55] dark:text-[#b0b9ac] tabular-nums">
                              {pct}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* 2. Giao diện Bảng Desktop (>= 1024px) */}
              <div
                id="admin-reports-print"
                className="hidden lg:block bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] shadow-sm overflow-hidden print:overflow-visible print:bg-white print:shadow-none print:border-0 print:rounded-none"
              >
                {/* Header in trang */}
                <div className="hidden print:block px-5 pt-6 pb-4">
                  <h2 className="text-xl font-extrabold text-stone-900 uppercase tracking-wide">
                    Thống kê {config.label} — {TERM_LABELS[term]} — Niên khóa {namHoc}
                  </h2>
                </div>

                <div className="overflow-auto max-h-[65vh] print:max-h-none print:overflow-visible" data-lenis-prevent>
                  <table className="w-full text-sm border-collapse table-fixed min-w-[760px] print:min-w-0">
                    <colgroup>
                      <col className="w-[20%]" />
                      <col className="w-[10%]" />
                      <col className="w-[12%]" />
                      {config.columns.map((col) => (
                        <col
                          key={col.key}
                          style={{ width: `${58 / config.columns.length}%` }}
                        />
                      ))}
                    </colgroup>
                    <thead>
                      <tr className="bg-[#faf8f3] dark:bg-[#151c18] text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac] print:text-stone-600">
                        <th className="text-left px-5 py-4 sticky top-0 left-0 bg-[#faf8f3] dark:bg-[#151c18] z-20 print:static print:border print:bg-white truncate border-b border-r border-[#dedfd4] dark:border-[#354237] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                          Lớp Giáo lý
                        </th>
                        <th className="text-center px-3 py-4 sticky top-0 bg-[#faf8f3]/95 dark:bg-[#151c18]/95 backdrop-blur z-10 print:static print:border print:bg-white truncate border-b border-[#dedfd4] dark:border-[#354237]">
                          Sĩ số
                        </th>
                        <th className="text-center px-3 py-4 sticky top-0 bg-[#faf8f3]/95 dark:bg-[#151c18]/95 backdrop-blur z-10 print:static print:border print:bg-white truncate border-b border-[#dedfd4] dark:border-[#354237]">
                          Đã xếp loại
                        </th>
                        {config.columns.map((col) => (
                          <th
                            key={col.key}
                            className="text-center px-2 py-4 sticky top-0 bg-[#faf8f3]/95 dark:bg-[#151c18]/95 backdrop-blur z-10 print:static print:border print:bg-white truncate border-b border-[#dedfd4] dark:border-[#354237]"
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStats.map((r) => (
                        <tr
                          key={r.lop}
                          className={`border-b border-[#dedfd4]/60 dark:border-[#354237]/60 transition-colors duration-150 ${
                            r.hasAnomaly
                              ? "bg-red-50/40 dark:bg-red-950/20 hover:bg-red-50/60 dark:hover:bg-red-950/30"
                              : "hover:bg-black/5 dark:hover:bg-white/5"
                          }`}
                        >
                          <td className="px-5 py-3.5 text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] print:border truncate sticky left-0 bg-[#fffefa] dark:bg-[#1e2821] border-r border-[#dedfd4]/70 dark:border-[#354237]/70 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center justify-between gap-2">
                              <span>{r.lop}</span>
                              {r.hasAnomaly && (
                                <span
                                  className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                                  title={r.anomalyReasons.join("; ")}
                                >
                                  <AlertTriangle className="w-3 h-3 shrink-0" />
                                  Rà soát
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3.5 text-center text-xs sm:text-sm font-bold tabular-nums text-[#575e55] dark:text-[#b0b9ac] print:border">
                            {r.studentCount}
                          </td>
                          <td className="px-3 py-3.5 text-center text-xs sm:text-sm font-bold tabular-nums text-[#314e3e] dark:text-[#d6b883] print:border bg-[#314e3e]/5 dark:bg-[#d6b883]/10">
                            {r.totalGraded}
                          </td>
                          {config.columns.map((col) => (
                            <td key={col.key} className="px-2 py-3.5 text-center print:border">
                              <StatCell count={r[col.key]} total={r.totalGraded} />
                            </td>
                          ))}
                        </tr>
                      ))}

                      {/* DÒNG TỔNG CỘNG HỆ THỐNG */}
                      {hasValidData && (
                        <tr className="bg-[#faf8f3] dark:bg-[#151c18] font-bold border-t-2 border-[#314e3e]/30 dark:border-[#d6b883]/30">
                          <td className="px-5 py-4 text-xs sm:text-sm font-extrabold text-[#293d32] dark:text-[#ecece0] sticky left-0 bg-[#faf8f3] dark:bg-[#151c18] border-r border-[#dedfd4] dark:border-[#354237] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                            <div>TỔNG CỘNG (LỚP HỢP LỆ)</div>
                            {hasAnomalies && (
                              <div className="text-xs font-normal text-[#575e55] dark:text-[#b0b9ac] mt-0.5">
                                Tính trên {systemTotals.validClassCount}/{systemTotals.totalClasses} lớp
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-4 text-center text-xs sm:text-sm font-extrabold tabular-nums text-[#293d32] dark:text-[#ecece0]">
                            {systemTotals.trustedTotals.studentCount}
                          </td>
                          <td className="px-3 py-4 text-center text-xs sm:text-sm font-extrabold tabular-nums text-[#314e3e] dark:text-[#d6b883] bg-[#314e3e]/10 dark:bg-[#d6b883]/20">
                            {systemTotals.trustedTotals.totalGraded}
                          </td>
                          {config.columns.map((col) => {
                            const count = systemTotals.trustedTotals[col.key] || 0;
                            return (
                              <td key={col.key} className="px-2 py-4 text-center">
                                <StatCell
                                  count={count}
                                  total={systemTotals.trustedTotals.totalGraded}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ---------- Disclosure Quy Định & Cách Tính ---------- */}
          <details className="group bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] rounded-2xl p-4 transition-all">
            <summary className="cursor-pointer text-xs sm:text-sm font-bold text-[#927140] dark:text-[#d4b47d] list-none flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 shrink-0" />
                Quy định & Công thức tính báo cáo thống kê
              </span>
              <ChevronDown className="w-4 h-4 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="mt-3 pt-3 border-t border-[#dedfd4]/60 dark:border-[#354237]/60 text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac] space-y-2 leading-relaxed">
              <p>
                • <strong>Tỷ lệ từng mức (%):</strong> Được tính dựa trên cột{" "}
                <strong>Đã xếp loại</strong> (những Giáo lý sinh đã có đầy đủ kết quả tổng kết môn
                học hoặc hạnh kiểm). Công thức:{" "}
                <code>(Số lượng em đạt mức / Tổng số em đã xếp loại trong lớp) × 100%</code>.
              </p>
              <p>
                • <strong>Tỷ lệ hoàn thành toàn khối (%):</strong> Được tính bằng tổng số Giáo lý
                sinh đã xếp loại chia cho tổng sĩ số của tất cả các lớp có dữ liệu hợp lệ.
              </p>
              <p>
                • <strong>Lớp có dữ liệu cần rà soát:</strong> Các lớp phát hiện dữ liệu bất thường
                (sĩ số = 0 nhưng có điểm, tổng điểm vượt sĩ số, hoặc mã xếp loại lạ) được hệ thống
                tách riêng để phục vụ đối chiếu, không cộng vào tổng hợp hợp lệ nhằm tránh làm sai
                lệch tỷ lệ toàn trường.
              </p>
            </div>
          </details>
        </>
      )}
    </div>
  );
}