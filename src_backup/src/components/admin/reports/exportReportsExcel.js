import {
  REPORT_CONFIGS,
  getReportTypeFileLabel,
  getTermFileLabel,
} from "./reportConfig.js";

/**
 * exportReportsToExcel
 *
 * Thuần logic, không đụng tới React/DOM ngoài việc trigger download qua XLSX.
 * Tách khỏi component để: (1) test độc lập với input `stats` giả lập,
 * (2) tái dùng cho các tab báo cáo khác nếu cần xuất theo cùng format.
 *
 * `XLSX` được truyền vào thay vì import tĩnh ở đầu module để giữ nguyên
 * lợi ích code-splitting (dynamic import) như bản gốc — thư viện xlsx
 * khá nặng, chỉ nên tải khi người dùng thực sự bấm xuất file.
 */
export async function exportReportsToExcel({ stats, reportType, term, namHoc }) {
  const XLSX = await import("xlsx");
  const config = REPORT_CONFIGS[reportType];

  const data = stats.map((r, idx) => {
    const base = {
      STT: idx + 1,
      "Lớp": r.lop,
      "Sĩ số lớp": r.studentCount,
      "Đã đánh giá": r.totalGraded,
    };
    config.columns.forEach((col) => {
      base[col.label] = r[col.key];
    });
    return base;
  });

  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [
    { wch: 5 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    ...config.columns.map(() => ({ wch: 10 })),
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Thống kê");

  const fileName = `ThongKe_${getReportTypeFileLabel(reportType)}_${getTermFileLabel(
    term
  )}_${namHoc}.xlsx`;
  XLSX.writeFile(wb, fileName);
}