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
      { key: "gioi", label: "Giỏi", match: "Giỏi" },
      { key: "kha", label: "Khá", match: "Khá" },
      { key: "tb", label: "Trung Bình", match: "Trung Bình" },
      { key: "yeu", label: "Yếu", match: "Yếu" },
      { key: "kem", label: "Kém", match: "Kém" },
    ],
  },
  [REPORT_TYPES.HANH_KIEM]: {
    label: "Hạnh Kiểm",
    sourceField: "hanh_kiem",
    columns: [
      { key: "tot", label: "Tốt", match: "Tốt" },
      { key: "kha", label: "Khá", match: "Khá" },
      { key: "tb", label: "Trung Bình", match: "Trung Bình" },
      { key: "yeu", label: "Yếu", match: "Yếu" },
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