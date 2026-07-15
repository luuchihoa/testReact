import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase.js";
import { REPORT_CONFIGS, TERM_TABLE_MAP } from "./reportConfig.js";

/**
 * Gộp dữ liệu thô từ DB theo từng lớp, dựa vào config của report type.
 * Đây là pure function — dễ unit test độc lập, không phụ thuộc React/Supabase.
 */
function aggregateStats(classes, rows, config) {
  const byClass = new Map();

  classes.forEach((c) => {
    const base = { lop: c.lop, studentCount: c.studentCount, totalGraded: 0 };
    config.columns.forEach((col) => {
      base[col.key] = 0;
    });
    byClass.set(c.lop, base);
  });

  rows.forEach((row) => {
    const entry = byClass.get(row.lop);
    if (!entry) return;

    const value = row[config.sourceField];
    if (!value) return;

    const col = config.columns.find((c) => c.match === value);
    if (!col) return; // giá trị lạ / chưa map -> bỏ qua thay vì crash

    entry.totalGraded += 1;
    entry[col.key] += 1;
  });

  return Array.from(byClass.values()).sort((a, b) =>
    a.lop.localeCompare(b.lop, "vi")
  );
}

/**
 * useReportStats
 *
 * - Tự huỷ (AbortController) request cũ khi tham số đổi hoặc component unmount,
 *   tránh race condition (response cũ ghi đè state mới) và setState-after-unmount.
 * - Không phụ thuộc trực tiếp vào showToast của UI -> nhận callback onError,
 *   giúp hook tái sử dụng/test được độc lập với AdminContext.
 */
export function useReportStats({ classes, namHoc, term, reportType, onError }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function run() {
      if (!classes || classes.length === 0) {
        setStats([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const config = REPORT_CONFIGS[reportType];
        const { table, filters } = TERM_TABLE_MAP[term];

        let query = supabase
          .from(table)
          .select("lop, hoc_luc, hanh_kiem")
          .eq("nam_hoc", namHoc);

        Object.entries(filters).forEach(([field, value]) => {
          query = query.eq(field, value);
        });

        const { data, error } = await query.abortSignal(controller.signal);
        if (error) throw error;
        if (cancelled) return; // request đã bị huỷ do params đổi -> bỏ kết quả

        setStats(aggregateStats(classes, data || [], config));
      } catch (err) {
        if (cancelled || err?.name === "AbortError") return;
        console.error("load reports error:", err);
        onError?.(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [namHoc, term, reportType, classes, onError, reloadToken]);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  return { stats, loading, reload };
}