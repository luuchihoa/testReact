import React, { useMemo, useState } from "react";
import { BarChart3, FileSpreadsheet, Printer, Filter } from "lucide-react";
import { useAdminContext } from "../AdminContext.jsx";
import { TableSkeleton } from "../../ui/Skeleton.jsx";
import { REPORT_TYPES, REPORT_CONFIGS, TERMS, TERM_LABELS } from "./reportConfig.js";
import { useReportStats } from "./useReportStats.js";
import { exportReportsToExcel } from "./exportReportsExcel.js";
import { StatCell } from "./StatCell.jsx";
import { ReportPrintStyles } from "./ReportPrintStyles.jsx";

const FIXED_COLUMN_COUNT = 3; // Lớp, Sĩ số, Đã xếp loại

export default function ReportsTab() {
  const { classes, namHoc, loading: contextLoading, showToast } = useAdminContext();

  const [reportType, setReportType] = useState(REPORT_TYPES.HOC_LUC);
  const [term, setTerm] = useState(TERMS.CN);
  const [exporting, setExporting] = useState(false);

  const config = REPORT_CONFIGS[reportType];
  const totalCols = FIXED_COLUMN_COUNT + config.columns.length;

  const handleFetchError = useMemo(
    () => () => showToast("Không tải được dữ liệu báo cáo", "error"),
    [showToast]
  );

  const { stats, loading: loadingStats } = useReportStats({
    classes,
    namHoc,
    term,
    reportType,
    onError: handleFetchError,
  });

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      await exportReportsToExcel({ stats, reportType, term, namHoc });
    } catch (err) {
      console.error("export excel error:", err);
      showToast("Xuất Excel thất bại", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = () => {
    requestAnimationFrame(() => window.print());
  };

  if (contextLoading) {
    return <TableSkeleton rows={6} columns={totalCols} />;
  }

  const exportDisabled = exporting || loadingStats || stats.length === 0;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 fade-in-up">
      <ReportPrintStyles />

      {/* ---------- Bộ Lọc (Filter Bar) ---------- */}
      <div className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm p-4 sm:p-5 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex flex-wrap gap-3">
          {/* Chọn Loại Báo Cáo */}
          <div
            role="group"
            aria-label="Chọn loại báo cáo"
            className="flex bg-white/60 dark:bg-stone-900/40 rounded-2xl p-1.5 border border-amber-900/10 dark:border-amber-100/10 shadow-sm backdrop-blur-sm w-full sm:w-auto"
          >
            {Object.entries(REPORT_CONFIGS).map(([key, cfg]) => (
              <button
                key={key}
                type="button"
                aria-pressed={reportType === key}
                onClick={() => setReportType(key)}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-[13.5px] font-bold transition-all duration-300 active:scale-[0.97] ${
                  reportType === key
                    ? "bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-sm"
                    : "text-stone-500 dark:text-stone-400 md:hover:text-stone-800 dark:md:hover:text-stone-200"
                }`}
              >
                {cfg.label}
              </button>
            ))}
          </div>

          {/* Chọn Học Kỳ */}
          <div
            role="group"
            aria-label="Chọn học kỳ"
            className="flex bg-white/60 dark:bg-stone-900/40 rounded-2xl p-1.5 border border-amber-900/10 dark:border-amber-100/10 shadow-sm backdrop-blur-sm w-full sm:w-auto"
          >
            {Object.values(TERMS).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={term === k}
                onClick={() => setTerm(k)}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-[13.5px] font-bold transition-all duration-300 active:scale-[0.97] ${
                  term === k
                    ? "bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-sm"
                    : "text-stone-500 dark:text-stone-400 md:hover:text-stone-800 dark:md:hover:text-stone-200"
                }`}
              >
                {TERM_LABELS[k]}
              </button>
            ))}
          </div>
        </div>

        {/* Nút Xuất File */}
        <div className="flex gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            disabled={exportDisabled}
            onClick={handleExportExcel}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[14px] font-bold bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-sm transition-all duration-300 active:scale-[0.98] md:hover:-translate-y-0.5 disabled:opacity-50 disabled:active:scale-100 disabled:md:hover:translate-y-0"
          >
            <FileSpreadsheet className="w-4 h-4" strokeWidth={2.5} /> Excel
          </button>
          <button
            type="button"
            disabled={exportDisabled}
            onClick={handleExportPDF}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[14px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-black/5 dark:border-white/5 transition-all duration-300 active:scale-[0.98] md:hover:-translate-y-0.5 md:hover:bg-stone-200 dark:md:hover:bg-stone-700 disabled:opacity-50 disabled:active:scale-100 disabled:md:hover:translate-y-0"
          >
            <Printer className="w-4 h-4" strokeWidth={2.5} /> In / PDF
          </button>
        </div>
      </div>

      {/* ---------- Bảng Số Liệu ---------- */}
      <div
        id="admin-reports-print"
        className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm overflow-hidden print:overflow-visible print:bg-white print:shadow-none print:border-0 print:rounded-none print:backdrop-blur-none"
      >
        {/* Header khi in */}
        <div className="hidden print:block px-5 pt-6 pb-4">
          <h2 className="text-[22px] font-extrabold text-amber-950 font-serif uppercase tracking-wide">
            Thống kê {config.label} — {TERM_LABELS[term]} — {namHoc}
          </h2>
        </div>

        <div
          className="overflow-auto max-h-[65vh] print:max-h-none print:overflow-visible px-0 print:px-5 print:pb-5"
          data-lenis-prevent
        >
          {!loadingStats && stats.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 px-6 text-center">
              <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-1">
                <BarChart3 className="w-6 h-6 text-amber-700 dark:text-amber-400" strokeWidth={2} />
              </div>
              <p className="text-[15px] font-bold text-amber-950 dark:text-amber-50">
                Chưa có dữ liệu thống kê
              </p>
              <p className="text-[13.5px] font-medium text-stone-500 dark:text-stone-400">
                Không có dữ liệu lớp được đánh giá cho năm học này.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm border-collapse table-fixed min-w-[700px] print:min-w-0">
              <colgroup>
                <col className="w-[20%]" />
                <col className="w-[12%]" />
                <col className="w-[14%]" />
                {config.columns.map((col) => (
                  <col key={col.key} style={{ width: `${54 / config.columns.length}%` }} />
                ))}
              </colgroup>
              <thead>
                <tr className="bg-amber-50/50 dark:bg-amber-900/20 text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 print:text-stone-600">
                  <th className="text-left px-5 py-4 sticky top-0 bg-amber-50/95 dark:bg-[#1c1c1e]/95 backdrop-blur z-10 print:static print:border print:bg-white truncate border-b border-amber-900/10 dark:border-amber-100/10">
                    Lớp
                  </th>
                  <th className="text-center px-3 py-4 sticky top-0 bg-amber-50/95 dark:bg-[#1c1c1e]/95 backdrop-blur z-10 print:static print:border print:bg-white truncate border-b border-amber-900/10 dark:border-amber-100/10">
                    Sĩ số
                  </th>
                  <th className="text-center px-3 py-4 sticky top-0 bg-amber-50/95 dark:bg-[#1c1c1e]/95 backdrop-blur z-10 print:static print:border print:bg-white truncate border-b border-amber-900/10 dark:border-amber-100/10">
                    Đã xếp loại
                  </th>
                  {config.columns.map((col) => (
                    <th
                      key={col.key}
                      className="text-center px-2 py-4 sticky top-0 bg-amber-50/95 dark:bg-[#1c1c1e]/95 backdrop-blur z-10 print:static print:border print:bg-white truncate border-b border-amber-900/10 dark:border-amber-100/10"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody aria-live="polite" aria-busy={loadingStats}>
                {loadingStats ? (
                  <tr>
                    <td colSpan={totalCols} className="py-20">
                      <div className="flex justify-center" role="status" aria-label="Đang tải dữ liệu">
                        <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-900 rounded-full animate-spin dark:border-amber-900/30 dark:border-t-amber-500" />
                      </div>
                    </td>
                  </tr>
                ) : (
                  stats.map((r) => (
                    <tr
                      key={r.lop}
                      className="border-b border-amber-900/5 dark:border-amber-100/5 transition-colors duration-300 md:hover:bg-amber-50/50 dark:md:hover:bg-amber-900/10"
                    >
                      <td className="px-5 py-3.5 text-[14.5px] font-bold text-amber-950 dark:text-amber-50 print:border truncate">
                        {r.lop}
                      </td>
                      <td className="px-3 py-3.5 text-center text-[13.5px] font-bold text-stone-500 dark:text-stone-400 print:border">
                        {r.studentCount}
                      </td>
                      <td className="px-3 py-3.5 text-center text-[14px] font-bold text-amber-900 dark:text-amber-400 print:border bg-amber-50/30 dark:bg-amber-900/10">
                        {r.totalGraded}
                      </td>
                      {config.columns.map((col) => (
                        <td key={col.key} className="px-2 py-3.5 text-center print:border">
                          <StatCell count={r[col.key]} total={r.totalGraded} />
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer info (Alert Box Style) */}
        {!loadingStats && stats.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-amber-900/10 dark:border-amber-100/10 ag-no-print">
            <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 p-4 rounded-2xl backdrop-blur-sm">
              <p className="text-[12px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 mb-1.5 ml-1 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> Ghi chú dữ liệu
              </p>
              <p className="text-[13.5px] font-medium text-amber-950 dark:text-amber-50 leading-relaxed ml-1">
                Số liệu phần trăm (%) được tính dựa trên cột <strong>Đã xếp loại</strong> (những
                học sinh đã có tổng kết, không tính những em chưa được nhập điểm đầy đủ).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}