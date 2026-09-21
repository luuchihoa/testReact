import {
  REPORT_CONFIGS,
  getReportTypeFileLabel,
  getTermFileLabel,
} from "./reportConfig.js";
import { getXLSX, triggerSafeExcelDownload } from "../utils/excelRosterHelper.js";

/**
 * exportReportsToExcel
 *
 * Xuất dữ liệu thống kê ra file Excel (.xlsx).
 * Tách biệt dòng tổng cộng hợp lệ và hỗ trợ xuất bản đối chiếu khi có bất thường.
 */
export async function exportReportsToExcel({
  stats = [],
  systemTotals = null,
  reportType,
  term,
  namHoc,
  isReconciliation = false,
}) {
  const XLSX = await getXLSX();
  const config = REPORT_CONFIGS[reportType] || REPORT_CONFIGS.HOC_LUC;

  const data = [];

  stats.forEach((r, idx) => {
    const rowObj = {
      STT: idx + 1,
      "Lớp": r.lop,
      "Sĩ số lớp": r.studentCount,
      "Đã xếp loại": r.totalGraded,
    };

    config.columns.forEach((col) => {
      const count = r[col.key] || 0;
      const pct = r.totalGraded > 0 ? ((count / r.totalGraded) * 100).toFixed(1) + "%" : "0%";
      rowObj[col.label] = `${count} (${pct})`;
    });

    if (isReconciliation) {
      rowObj["Trạng thái / Ghi chú bất thường"] = r.hasAnomaly
        ? r.anomalyReasons.join("; ")
        : "Hợp lệ";
    }

    data.push(rowObj);
  });

  // Dòng tổng cộng hợp lệ
  const totals = systemTotals?.trustedTotals;
  if (totals && systemTotals?.validClassCount > 0) {
    const summaryRow = {
      STT: "",
      "Lớp": "TỔNG CỘNG (LỚP HỢP LỆ)",
      "Sĩ số lớp": totals.studentCount,
      "Đã xếp loại": totals.totalGraded,
    };
    config.columns.forEach((col) => {
      const count = totals[col.key] || 0;
      const pct = totals.totalGraded > 0 ? ((count / totals.totalGraded) * 100).toFixed(1) + "%" : "0%";
      summaryRow[col.label] = `${count} (${pct})`;
    });
    if (isReconciliation) {
      summaryRow["Trạng thái / Ghi chú bất thường"] = `Tính trên ${systemTotals.validClassCount}/${systemTotals.totalClasses} lớp hợp lệ`;
    }
    data.push(summaryRow);
  }

  const ws = XLSX.utils.json_to_sheet(data);
  const colWidths = [
    { wch: 6 },
    { wch: 18 },
    { wch: 12 },
    { wch: 14 },
    ...config.columns.map(() => ({ wch: 16 })),
  ];
  if (isReconciliation) {
    colWidths.push({ wch: 40 });
  }
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  const sheetName = isReconciliation ? "DoiChieu_ThongKe" : "ThongKe";
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const prefix = isReconciliation ? "DoiChieu_ThongKe" : "ThongKe";
  const fileName = `${prefix}_${getReportTypeFileLabel(reportType)}_${getTermFileLabel(
    term
  )}_${namHoc}.xlsx`;
  return await triggerSafeExcelDownload(XLSX, wb, fileName);
}