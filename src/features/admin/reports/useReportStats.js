import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase.js";
import { REPORT_CONFIGS, TERM_TABLE_MAP } from "./reportConfig.js";

/**
 * Gộp dữ liệu thô từ DB theo từng lớp và kiểm tra tính nhất quán dữ liệu.
 * Pure function độc lập — dễ unit test.
 */
export function aggregateStats(classes = [], rows = [], config) {
  const byClass = new Map();

  // 1. Khởi tạo map từ danh sách lớp của niên khóa
  (classes || []).forEach((c) => {
    const lopName = c.lop || c.ten_lop || "";
    if (!lopName) return;
    const count = Number(c.studentCount ?? c.si_so ?? c.siSo ?? 0) || 0;
    const base = {
      lop: lopName,
      studentCount: count,
      totalGraded: 0,
      unknownCount: 0,
      unknownValues: [],
      hasAnomaly: false,
      anomalyReasons: [],
    };
    config.columns.forEach((col) => {
      base[col.key] = 0;
    });
    byClass.set(lopName, base);
  });

  // 2. Gom dữ liệu tổng kết từ rows
  (rows || []).forEach((row) => {
    if (!row || !row.lop) return;

    let entry = byClass.get(row.lop);
    if (!entry) {
      // Lớp xuất hiện trong dữ liệu tổng kết nhưng không có trong danh sách lớp niên khóa
      entry = {
        lop: row.lop,
        studentCount: 0,
        totalGraded: 0,
        unknownCount: 0,
        unknownValues: [],
        hasAnomaly: true,
        anomalyReasons: ["Lớp chỉ có trong dữ liệu tổng kết, chưa tìm thấy trong danh sách ghi danh niên khóa"],
      };
      config.columns.forEach((col) => {
        entry[col.key] = 0;
      });
      byClass.set(row.lop, entry);
    }

    const value = row[config.sourceField];
    if (!value || typeof value !== "string" || !value.trim()) return;

    const trimmed = value.trim();
    const col = config.columns.find((c) => {
      if (c.match && c.match.toLowerCase() === trimmed.toLowerCase()) return true;
      if (c.key && c.key.toLowerCase() === trimmed.toLowerCase()) return true;
      if (c.key === "gioi" && (trimmed === "Giỏi" || trimmed === "Gioi" || trimmed === "GIOI" || trimmed === "XUAT_SAC" || trimmed === "Xuất Sắc" || trimmed === "Xuất sắc")) return true;
      if (c.key === "kha" && (trimmed === "Khá" || trimmed === "Kha" || trimmed === "KHA")) return true;
      if (c.key === "tb" && (trimmed === "TB" || trimmed === "Trung Bình" || trimmed === "Trung bình" || trimmed === "TRUNG_BINH" || trimmed === "Trung Binh")) return true;
      if (c.key === "yeu" && (trimmed === "Yếu" || trimmed === "Yeu" || trimmed === "YEU" || trimmed === "CHUA_DAT" || trimmed === "Chưa Đạt" || trimmed === "Chưa đạt")) return true;
      if (c.key === "kem" && (trimmed === "Kém" || trimmed === "Kem" || trimmed === "KEM")) return true;
      if (c.key === "tot" && (trimmed === "Tốt" || trimmed === "Tot" || trimmed === "TOT" || trimmed === "DAT" || trimmed === "Đạt" || trimmed === "Dat")) return true;
      return false;
    });

    if (col) {
      entry.totalGraded += 1;
      entry[col.key] += 1;
    } else {
      // Giá trị lạ / chưa nhận diện
      entry.totalGraded += 1;
      entry.unknownCount += 1;
      if (!entry.unknownValues.includes(trimmed)) {
        entry.unknownValues.push(trimmed);
      }
    }
  });

  // 3. Kiểm tra các điều kiện bất thường cho từng lớp
  const statsList = Array.from(byClass.values()).map((entry) => {
    const reasons = [...entry.anomalyReasons];

    if (entry.studentCount === 0 && entry.totalGraded > 0) {
      const alreadyHasNoEnrollment = reasons.some((r) => r.includes("danh sách ghi danh"));
      if (!alreadyHasNoEnrollment) {
        reasons.push(`Sĩ số ghi danh là 0 nhưng đã có ${entry.totalGraded} kết quả xếp loại`);
      }
    } else if (entry.totalGraded > entry.studentCount && entry.studentCount > 0) {
      reasons.push(`Đã xếp loại (${entry.totalGraded}) vượt quá sĩ số ghi danh (${entry.studentCount})`);
    }

    if (entry.unknownCount > 0) {
      reasons.push(`Có ${entry.unknownCount} hồ sơ mang giá trị xếp loại chưa được nhận diện: ${entry.unknownValues.join(", ")}`);
    }

    const hasAnomaly = reasons.length > 0;
    return {
      ...entry,
      hasAnomaly,
      anomalyReasons: reasons,
    };
  }).sort((a, b) => a.lop.localeCompare(b.lop, "vi"));

  // 4. Tính toán rawTotals và trustedTotals
  let rawTotalStudents = 0;
  let rawTotalGraded = 0;
  let rawTotalUnknown = 0;
  const rawColTotals = {};
  config.columns.forEach((c) => { rawColTotals[c.key] = 0; });

  statsList.forEach((s) => {
    rawTotalStudents += s.studentCount;
    rawTotalGraded += s.totalGraded;
    rawTotalUnknown += (s.unknownCount || 0);
    config.columns.forEach((c) => {
      rawColTotals[c.key] += s[c.key];
    });
  });

  const trustedStats = statsList.filter((s) => !s.hasAnomaly);
  const anomalyStats = statsList.filter((s) => s.hasAnomaly);

  let trustedTotalStudents = 0;
  let trustedTotalGraded = 0;
  const trustedColTotals = {};
  config.columns.forEach((c) => { trustedColTotals[c.key] = 0; });

  trustedStats.forEach((t) => {
    trustedTotalStudents += t.studentCount;
    trustedTotalGraded += t.totalGraded;
    config.columns.forEach((c) => {
      trustedColTotals[c.key] += t[c.key];
    });
  });

  const trustedTotalUnfinished = trustedTotalStudents - trustedTotalGraded;
  const trustedCompletionRate = trustedTotalStudents > 0
    ? Math.round((trustedTotalGraded / trustedTotalStudents) * 1000) / 10
    : 0;

  const trustedColPercentages = {};
  config.columns.forEach((c) => {
    trustedColPercentages[c.key] = trustedTotalGraded > 0
      ? Math.round((trustedColTotals[c.key] / trustedTotalGraded) * 1000) / 10
      : 0;
  });

  const systemTotals = {
    totalClasses: statsList.length,
    validClassCount: trustedStats.length,
    trustedClassCount: trustedStats.length,
    anomalyClassCount: anomalyStats.length,
    totalStudents: trustedTotalStudents,
    trustedTotalStudents,
    totalGraded: trustedTotalGraded,
    trustedTotalGraded,
    totalUnfinished: trustedTotalUnfinished,
    trustedTotalUnfinished,
    completionRate: trustedCompletionRate,
    trustedCompletionRate,
    colTotals: trustedColTotals,
    colPercentages: trustedColPercentages,
    trustedTotals: {
      studentCount: trustedTotalStudents,
      totalGraded: trustedTotalGraded,
      ...trustedColTotals,
    },
    rawTotals: {
      totalClasses: statsList.length,
      totalStudents: rawTotalStudents,
      totalGraded: rawTotalGraded,
      totalUnknown: rawTotalUnknown,
      colTotals: rawColTotals,
    },
  };

  return {
    stats: statsList,
    trustedStats,
    anomalyStats,
    systemTotals,
  };
}

/**
 * useReportStats
 *
 * - Quản lý đầy đủ trạng thái dữ liệu: loading, error, stats, systemTotals, isStale, loadedAt.
 * - Tự huỷ request cũ khi tham số đổi bằng AbortController.
 * - Khi request lỗi, xóa dữ liệu hiển thị hiện tại để không lưu dữ liệu cũ dưới nhãn mới.
 */
export function useReportStats({ classes, namHoc, term, reportType, onError }) {
  const [statsData, setStatsData] = useState({
    stats: [],
    systemTotals: null,
    loadedAt: null,
    lastSuccessfulQuery: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function run() {
      setLoading(true);
      setError(null);

      if (!classes || classes.length === 0) {
        if (!cancelled) {
          const config = REPORT_CONFIGS[reportType];
          const aggregated = aggregateStats([], [], config);
          setStatsData({
            stats: [],
            systemTotals: aggregated.systemTotals,
            loadedAt: new Date(),
            lastSuccessfulQuery: { term, reportType, namHoc },
          });
          setLoading(false);
        }
        return;
      }

      try {
        const config = REPORT_CONFIGS[reportType];
        const { table, filters } = TERM_TABLE_MAP[term];

        let query = supabase
          .from(table)
          .select("username, lop, hoc_luc, hanh_kiem")
          .eq("nam_hoc", namHoc);

        Object.entries(filters).forEach(([field, value]) => {
          query = query.eq(field, value);
        });

        const [summaryRes, enrollRes] = await Promise.all([
          query.abortSignal(controller.signal),
          supabase
            .from("enrollments")
            .select("username, lop")
            .eq("nam_hoc", namHoc)
            .abortSignal(controller.signal),
        ]);

        if (summaryRes.error) throw summaryRes.error;
        if (cancelled) return;

        const enrollMap = new Map();
        (enrollRes.data || []).forEach((e) => {
          if (e.username && e.lop) enrollMap.set(e.username, e.lop);
        });

        // Ánh xạ dữ liệu tổng kết theo lớp ghi danh thực tế của học sinh (Single Source of Truth)
        // 1. Nếu học sinh chuyển lớp -> điểm tự động đi theo lớp mới
        // 2. Nếu học sinh đã bị xóa khỏi lớp -> loại bỏ bản ghi mồ côi
        const rows = (summaryRes.data || [])
          .map((row) => {
            if (row.username && enrollMap.has(row.username)) {
              return {
                ...row,
                lop: enrollMap.get(row.username),
              };
            }
            return row;
          })
          .filter((row) => {
            if (enrollMap.size > 0 && row.username) {
              return enrollMap.has(row.username);
            }
            return true;
          });

        const aggregated = aggregateStats(classes, rows, config);
        setStatsData({
          stats: aggregated.stats,
          systemTotals: aggregated.systemTotals,
          loadedAt: new Date(),
          lastSuccessfulQuery: { term, reportType, namHoc },
        });
        setError(null);
      } catch (err) {
        if (cancelled || err?.name === "AbortError") return;
        console.error("load reports error:", err);
        setError(err);
        setStatsData((prev) => ({
          ...prev,
          stats: [],
          systemTotals: null,
        }));
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

  const isStale = statsData.lastSuccessfulQuery && (
    statsData.lastSuccessfulQuery.term !== term ||
    statsData.lastSuccessfulQuery.reportType !== reportType ||
    statsData.lastSuccessfulQuery.namHoc !== namHoc
  );

  return {
    stats: statsData.stats,
    systemTotals: statsData.systemTotals,
    loadedAt: statsData.loadedAt,
    lastSuccessfulQuery: statsData.lastSuccessfulQuery,
    isStale: !!isStale,
    loading,
    error,
    reload,
  };
}