/**
 * reportConfig.js
 *
 * Single source of truth cho cấu hình các loại báo cáo (Học Lực / Hạnh Kiểm).
 * Mọi phần của UI (header bảng, aggregation, render cell, export Excel) đều
 * đọc từ config này — thêm report type mới chỉ cần thêm 1 entry ở đây,
 * không phải sửa logic ở nhiều nơi.
 */

export const REPORT_TYPES = Object.freeze({
  HOC_LUC: "hoc_luc",
  HANH_KIEM: "hanh_kiem",
});

export const TERMS = Object.freeze({
  HK1: "HK1",
  HK2: "HK2",
  CN: "CN",
});

export const TERM_LABELS = Object.freeze({
  [TERMS.HK1]: "HK1",
  [TERMS.HK2]: "HK2",
  [TERMS.CN]: "Cả năm",
});

/**
 * columns: danh sách xếp loại cho mỗi report type.
 *  - key: field lưu trong object aggregate (r.gioi, r.tot, ...)
 *  - label: nhãn hiển thị / xuất Excel
 *  - match: giá trị string khớp với dữ liệu trả về từ DB (hoc_luc / hanh_kiem)
 */
export const REPORT_CONFIGS = Object.freeze({
  [REPORT_TYPES.HOC_LUC]: {
    label: "Học Lực",
    sourceField: "hoc_luc",
    columns: [
      { key: "gioi", label: "Giỏi", match: "Giỏi", color: "#059669", bgClass: "bg-emerald-600", textClass: "text-emerald-700 dark:text-emerald-400", badgeClass: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
      { key: "kha", label: "Khá", match: "Khá", color: "#2563eb", bgClass: "bg-blue-600", textClass: "text-blue-700 dark:text-blue-400", badgeClass: "bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
      { key: "tb", label: "Trung Bình", match: "Trung Bình", color: "#d97706", bgClass: "bg-amber-600", textClass: "text-amber-800 dark:text-amber-400", badgeClass: "bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
      { key: "yeu", label: "Yếu", match: "Yếu", color: "#e11d48", bgClass: "bg-rose-600", textClass: "text-rose-700 dark:text-rose-400", badgeClass: "bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800" },
      { key: "kem", label: "Kém", match: "Kém", color: "#57534e", bgClass: "bg-stone-600", textClass: "text-stone-700 dark:text-stone-400", badgeClass: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-300 dark:border-stone-700" },
    ],
  },
  [REPORT_TYPES.HANH_KIEM]: {
    label: "Hạnh Kiểm",
    sourceField: "hanh_kiem",
    columns: [
      { key: "tot", label: "Tốt", match: "Tốt", color: "#059669", bgClass: "bg-emerald-600", textClass: "text-emerald-700 dark:text-emerald-400", badgeClass: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
      { key: "kha", label: "Khá", match: "Khá", color: "#2563eb", bgClass: "bg-blue-600", textClass: "text-blue-700 dark:text-blue-400", badgeClass: "bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
      { key: "tb", label: "Trung Bình", match: "Trung Bình", color: "#d97706", bgClass: "bg-amber-600", textClass: "text-amber-800 dark:text-amber-400", badgeClass: "bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
      { key: "yeu", label: "Yếu", match: "Yếu", color: "#e11d48", bgClass: "bg-rose-600", textClass: "text-rose-700 dark:text-rose-400", badgeClass: "bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800" },
    ],
  },
});

/**
 * Ánh xạ học kỳ -> bảng dữ liệu + filter tương ứng trong Supabase.
 * Tránh việc if/else lặp lại logic build query ở component.
 */
export const TERM_TABLE_MAP = Object.freeze({
  [TERMS.CN]: { table: "year_summary", filters: {} },
  [TERMS.HK1]: { table: "term_summary", filters: { hoc_ky: 1 } },
  [TERMS.HK2]: { table: "term_summary", filters: { hoc_ky: 2 } },
});

export function getTermFileLabel(term) {
  return term === TERMS.CN ? "CaNam" : term;
}

export function getReportTypeFileLabel(reportType) {
  return reportType === REPORT_TYPES.HOC_LUC ? "HocLuc" : "HanhKiem";
}