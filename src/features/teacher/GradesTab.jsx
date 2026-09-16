import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, RefreshCw, Save, Users, CalendarDays, Search, X, CheckCircle2, RotateCcw, Calculator } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../../components/ui/ToastContext.jsx";
import { Spinner } from "../../components/ui/Skeleton.jsx";
import { ConfirmDialog } from "../../components/ui/StudentShared.jsx";
import { useTeacherContext } from "./TeacherContext.jsx";
import { fetchClassTermRanges, fetchTermLocks } from "./api.js";
import { sortStudentsByTen, mostRecentSunday, resolveActiveHocKy, computeDiemTB } from "./utils.js";
import { HK_INT_MAP, GRADE_FIELDS } from "./constants.js";

const APPLE_EASE = [0.16, 1, 0.3, 1];

// Cấu hình nhãn cho từng loại điểm số
const FIELD_CONFIG = {
  diem_mieng: { label: "Miệng", fullLabel: "Điểm Miệng" },
  diem_vo: { label: "Vở", fullLabel: "Điểm Vở" },
  diem_15_phut: { label: "15'", fullLabel: "Điểm 15 Phút" },
  diem_1_tiet: { label: "1 Tiết", fullLabel: "Điểm 1 Tiết" },
  diem_thi: { label: "Thi HK", fullLabel: "Điểm Thi Học Kỳ" },
};

// Helper: Phân loại màu sắc điểm số đạt chuẩn WCAG AAA (≥ 7.0:1 cho chữ thường, ≥ 3.0:1 cho viền)
const getScoreTheme = (tb) => {
  if (tb === null || tb === undefined || tb === "") {
    return {
      bg: "bg-[#faf8f3] dark:bg-[#151c18]",
      text: "text-[#293d32] dark:text-[#ecece0]",
      border: "border-[#616e5f] dark:border-[#677765]",
      badgeBg: "bg-[#faf8f3] dark:bg-[#151c18]",
      label: "Chưa có",
    };
  }
  const n = Number(tb);
  if (n >= 8.0) {
    return {
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
      text: "text-[#064e3b] dark:text-[#6ee7b7] font-bold",
      border: "border-emerald-700/50 dark:border-emerald-400/50",
      badgeBg: "bg-emerald-100/90 dark:bg-emerald-900/80",
      label: "Giỏi",
    };
  }
  if (n >= 6.5) {
    return {
      bg: "bg-blue-50 dark:bg-blue-950/50",
      text: "text-[#1e3a8a] dark:text-[#93c5fd] font-bold",
      border: "border-blue-700/50 dark:border-blue-400/50",
      badgeBg: "bg-blue-100/90 dark:bg-blue-900/80",
      label: "Khá",
    };
  }
  if (n >= 5.0) {
    return {
      bg: "bg-amber-50 dark:bg-amber-950/50",
      text: "text-[#713f12] dark:text-[#fde047] font-bold",
      border: "border-amber-700/50 dark:border-amber-400/50",
      badgeBg: "bg-amber-100/90 dark:bg-amber-900/80",
      label: "TB",
    };
  }
  return {
    bg: "bg-red-50 dark:bg-red-950/50",
    text: "text-[#7f1d1d] dark:text-[#fca5a5] font-bold",
    border: "border-red-700/50 dark:border-red-400/50",
    badgeBg: "bg-red-100/90 dark:bg-red-900/80",
    label: "Yếu",
  };
};

export default function GradesTab() {
  const { students, context } = useTeacherContext();
  const namHoc = context.namHoc;
  const lop = context.lop;
  const { showToast } = useToast();

  const [hocKy, setHocKy] = useState("HK1");
  const hocKyInt = HK_INT_MAP[hocKy];
  const [rows, setRows] = useState({}); 
  const [initial, setInitial] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shakeField, setShakeField] = useState(null);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all"); // "all" | "incomplete" | "attention" | "excellent"
  
  const [termLocks, setTermLocks] = useState({});
  const isLocked = !!termLocks[hocKyInt];
  const didAutoSelect = useRef(false);

  const rosterStudents = useMemo(() => sortStudentsByTen(students), [students]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const ranges = await fetchClassTermRanges(lop, namHoc);
        if (cancelled || didAutoSelect.current) return;
        didAutoSelect.current = true;
        setHocKy(resolveActiveHocKy(ranges, mostRecentSunday()));
      } catch {
        // Ignore auto-select error
      }
    })();
    return () => { cancelled = true; };
  }, [lop, namHoc]);

  useEffect(() => {
    let cancelled = false;
    fetchTermLocks(lop, namHoc).then(locks => { if (!cancelled) setTermLocks(locks); });
    return () => { cancelled = true; };
  }, [lop, namHoc]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const usernames = rosterStudents.map((s) => s.username);
        const { data, error } = await supabase
          .from("grades")
          .select("*")
          .eq("nam_hoc", namHoc)
          .eq("hoc_ky", hocKyInt)
          .in("username", usernames);
        if (error) throw error;

        const byUser = {}; 
        (data ?? []).forEach((r) => { byUser[r.username] = r; });
        const full = {}; 
        
        rosterStudents.forEach((s) => {
          const g = byUser[s.username] ?? {};
          const studentScores = { 
            diem_mieng: g.diem_mieng, 
            diem_vo: g.diem_vo, 
            diem_15_phut: g.diem_15_phut, 
            diem_1_tiet: g.diem_1_tiet, 
            diem_thi: g.diem_thi, 
            diem_tb: g.diem_tb 
          };
          // Luôn tự động chuẩn hóa ĐTB theo công thức chuẩn
          studentScores.diem_tb = computeDiemTB(studentScores);
          full[s.username] = studentScores;
        });

        if (!cancelled) {
          setRows(full);
          setInitial(full);
        }
      } catch (err) {
        console.error("load grades error:", err);
        if (!cancelled) showToast("Không tải được bảng điểm", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [rosterStudents, namHoc, hocKyInt, showToast]);

  // Xử lý khi sửa điểm thành phần -> ĐTB luôn tự động tính 100% thời gian thực
  const handleScoreChange = useCallback((username, field, raw) => {
    if (isLocked) return;
    
    if (raw !== "" && (Number(raw) > 10 || Number(raw) < 0 || isNaN(Number(raw)))) {
      setShakeField(`${username}-${field}`);
      setTimeout(() => setShakeField(null), 400);
      return; 
    }

    const value = raw === "" ? null : Number(raw);
    
    setRows((prev) => {
      const g = { ...prev[username], [field]: value };
      g.diem_tb = computeDiemTB(g); // Tự động tính toán ĐTB
      return { ...prev, [username]: g };
    });
  }, [isLocked]);

  // Tính lại / đồng bộ ĐTB toàn lớp
  const handleRecalculateAllTB = () => {
    if (isLocked) return;
    let count = 0;
    setRows((prev) => {
      const next = { ...prev };
      rosterStudents.forEach((s) => {
        const g = next[s.username];
        if (g) {
          const autoTB = computeDiemTB(g);
          if (g.diem_tb !== autoTB) {
            next[s.username] = { ...g, diem_tb: autoTB };
            count++;
          }
        }
      });
      return next;
    });
    showToast(
      count > 0 
        ? `Đã tính lại ĐTB chuẩn công thức cho ${count} học sinh!` 
        : "Tất cả điểm trung bình đã khớp đúng công thức!",
      "success"
    );
  };

  const changedCount = useMemo(
    () => rosterStudents.filter((s) => JSON.stringify(rows[s.username]) !== JSON.stringify(initial[s.username])).length, 
    [rosterStudents, rows, initial]
  );

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const triggerSave = () => {
    if (isLocked || changedCount === 0) return;
    setShowConfirmModal(true);
  };

  const confirmSave = async () => {
    setShowConfirmModal(false);
    if (isLocked || changedCount === 0) return;
    setSaving(true);
    try {
      const payload = rosterStudents.map((s) => ({
        username: s.username, nam_hoc: namHoc, hoc_ky: hocKyInt, lop: lop, ...rows[s.username], updated_at: new Date().toISOString()
      }));
      const { error } = await supabase.from("grades").upsert(payload, { onConflict: "username,nam_hoc,hoc_ky" });
      if (error) throw error;
      setInitial(rows);
      showToast(`Đã lưu bảng điểm thành công!`, "success");
    } catch (err) {
      console.error("save grades error:", err);
      showToast("Lưu điểm thất bại", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    if (changedCount === 0) return;
    setShowDiscardConfirm(true);
  };

  const confirmDiscard = () => {
    setRows(initial);
    setShowDiscardConfirm(false);
    showToast("Đã hủy bỏ tất cả thay đổi chưa lưu", "info");
  };

  const scoreFields = useMemo(() => GRADE_FIELDS.filter((f) => f.key !== "diem_tb"), []);

  const totalCount = rosterStudents.length * scoreFields.length;
  const filledCount = useMemo(() => {
    let count = 0;
    rosterStudents.forEach(s => {
      const g = rows[s.username] || {};
      scoreFields.forEach(f => {
        if (g[f.key] !== undefined && g[f.key] !== null && g[f.key] !== "") count++;
      });
    });
    return count;
  }, [rosterStudents, rows, scoreFields]);
  const progressRate = totalCount === 0 ? 0 : Math.round((filledCount / totalCount) * 100);

  const completedStudentsCount = useMemo(() => {
    return rosterStudents.filter((s) => {
      const g = rows[s.username] || {};
      return scoreFields.every((f) => g[f.key] !== undefined && g[f.key] !== null && g[f.key] !== "");
    }).length;
  }, [rosterStudents, rows, scoreFields]);

  const classAverage = useMemo(() => {
    let sum = 0;
    let count = 0;
    rosterStudents.forEach(s => {
      const g = rows[s.username];
      if (g && g.diem_tb && !isNaN(parseFloat(g.diem_tb))) {
        sum += parseFloat(g.diem_tb);
        count++;
      }
    });
    return count > 0 ? (sum / count).toFixed(1) : "-";
  }, [rosterStudents, rows]);

  // Bộ đếm cho filter chips
  const filterCounts = useMemo(() => {
    let incomplete = 0;
    let attention = 0;
    let excellent = 0;
    rosterStudents.forEach((s) => {
      const g = rows[s.username] || {};
      const isIncomplete = scoreFields.some(
        (f) => g[f.key] === undefined || g[f.key] === null || g[f.key] === ""
      );
      if (isIncomplete) incomplete++;
      if (g.diem_tb !== null && g.diem_tb !== undefined && g.diem_tb !== "") {
        const tb = Number(g.diem_tb);
        if (tb < 5.0) attention++;
        if (tb >= 8.0) excellent++;
      }
    });
    return { all: rosterStudents.length, incomplete, attention, excellent };
  }, [rosterStudents, rows, scoreFields]);

  // Danh sách học sinh sau khi tìm kiếm và lọc
  const processedStudents = useMemo(() => {
    let list = rosterStudents;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((s) => {
        const name = (s.hoTen || "").toLowerCase();
        const tenThanh = (s.tenThanh || "").toLowerCase();
        const username = (s.username || "").toLowerCase();
        return name.includes(q) || tenThanh.includes(q) || username.includes(q);
      });
    }
    if (filterType === "incomplete") {
      list = list.filter((s) => {
        const g = rows[s.username] || {};
        return scoreFields.some((f) => g[f.key] === undefined || g[f.key] === null || g[f.key] === "");
      });
    } else if (filterType === "attention") {
      list = list.filter((s) => {
        const g = rows[s.username] || {};
        return g.diem_tb !== null && g.diem_tb !== undefined && g.diem_tb !== "" && Number(g.diem_tb) < 5.0;
      });
    } else if (filterType === "excellent") {
      list = list.filter((s) => {
        const g = rows[s.username] || {};
        return g.diem_tb !== null && g.diem_tb !== undefined && g.diem_tb !== "" && Number(g.diem_tb) >= 8.0;
      });
    }
    return list;
  }, [rosterStudents, search, filterType, rows, scoreFields]);

  // Điều hướng bàn phím mượt mà giữa 5 cột điểm thành phần
  const handleKeyDown = (e, rowIdx, colIdx) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"].includes(e.key)) {
      e.preventDefault();
      let nextRow = rowIdx;
      let nextCol = colIdx;
      
      const ALL_FIELDS = scoreFields.map(f => f.key);
      
      if (e.key === "ArrowUp") nextRow = Math.max(0, rowIdx - 1);
      if (e.key === "ArrowDown" || e.key === "Enter") nextRow = Math.min(processedStudents.length - 1, rowIdx + 1);
      if (e.key === "ArrowLeft") nextCol = Math.max(0, colIdx - 1);
      if (e.key === "ArrowRight") nextCol = Math.min(ALL_FIELDS.length - 1, colIdx + 1);

      const nextField = ALL_FIELDS[nextCol];
      const nextUsername = processedStudents[nextRow]?.username;
      
      if (!nextUsername) return;

      const targetId = `input-${nextUsername}-${nextField}`;
      const el = document.getElementById(targetId);
      if (el) {
        el.focus();
        setTimeout(() => {
          if (el.value) {
            el.setSelectionRange(el.value.length, el.value.length);
          } else {
            el.select();
          }
        }, 10);
      }
    }
  };

  return (
    <Motion.div 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4, ease: APPLE_EASE }}
      className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl border-x-0 border-t-0 sm:border-t border-b sm:border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] shadow-none sm:shadow-xs overflow-hidden"
    >
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-6 border-b border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3]/60 dark:bg-[#151c18]/60">
        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
          <div className="min-w-0 flex-1 sm:flex-initial">
            <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-[#19251d] dark:text-[#ffffff] tracking-tight truncate">
              Nhập điểm {lop}
            </h1>
            {/* Meta row: Niên khóa + Sĩ số (Desktop: đầy đủ | Mobile: siêu gọn 1 hàng) */}
            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 text-xs text-[#293d32] dark:text-[#ecece0] font-medium whitespace-nowrap">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5 text-[#5e4117] dark:text-[#e0c38c] shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Niên khóa</span>
                <strong className="text-[#19251d] dark:text-[#ffffff] font-mono font-bold">{namHoc}</strong>
              </span>
              <span className="opacity-40">•</span>
              <span className="inline-flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#1e3d2f] dark:text-[#d6b883] shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Sĩ số:</span>
                <strong className="text-[#19251d] dark:text-[#ffffff] font-mono font-bold">{rosterStudents.length}</strong>
                <span className="hidden sm:inline">học sinh</span>
                <span className="sm:hidden">HS</span>
              </span>
            </div>
          </div>

          {/* Mobile Term Selector */}
          <div className="sm:hidden flex items-center bg-[#faf8f3] dark:bg-[#151c18] rounded-xl p-0.5 border border-[#dedfd4] dark:border-[#354237] shrink-0">
            {["HK1", "HK2"].map((k) => (
              <button 
                key={k} 
                type="button" 
                onClick={() => setHocKy(k)}
                className={`relative min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold transition-colors z-10 cursor-pointer ${
                  hocKy === k 
                    ? "text-[#19251d] dark:text-[#ffffff]" 
                    : "text-[#293d32] dark:text-[#ecece0]"
                }`}
                aria-pressed={hocKy === k}
              >
                {hocKy === k && (
                  <Motion.div
                    layoutId="active-grades-hk-pill-mobile"
                    className="absolute inset-0 bg-[#fffefa] dark:bg-[#1e2821] rounded-lg shadow-xs border border-[#dedfd4] dark:border-[#354237]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-20">{k === "HK1" ? "HK1" : "HK2"}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Controls (Progress + Term + Discard + Save) */}
        <div className="hidden sm:flex items-center justify-end gap-2.5 w-full sm:w-auto">
          {/* Elegant Desktop Progress Badge */}
          {totalCount > 0 && (
            progressRate === 100 ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-700/40 text-[#064e3b] dark:text-[#6ee7b7] text-xs font-bold shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>Đã nhập đủ điểm</span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] shadow-2xs">
                <div className="flex flex-col min-w-[130px]">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-[#293d32] dark:text-[#ecece0]">Tiến độ</span>
                    <span className="font-mono text-[#19251d] dark:text-[#ffffff]">{progressRate}% ({completedStudentsCount}/{rosterStudents.length} HS)</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-[#314e3e] dark:bg-[#d6b883] rounded-full transition-all duration-300"
                      style={{ width: `${progressRate}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          )}

          {/* Term Selector */}
          <div className="flex items-center bg-[#faf8f3] dark:bg-[#151c18] rounded-xl p-1 border border-[#dedfd4] dark:border-[#354237]">
            {["HK1", "HK2"].map((k) => (
              <button 
                key={k} 
                type="button" 
                onClick={() => setHocKy(k)}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 z-10 cursor-pointer ${
                  hocKy === k 
                    ? "text-[#19251d] dark:text-[#ffffff]" 
                    : "text-[#293d32] dark:text-[#ecece0] hover:text-[#19251d] dark:hover:text-[#ffffff]"
                }`}
              >
                {hocKy === k && (
                  <Motion.div
                    layoutId="active-grades-hk-pill-desktop"
                    className="absolute inset-0 bg-[#fffefa] dark:bg-[#1e2821] rounded-lg shadow-xs border border-[#dedfd4] dark:border-[#354237]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-20">{k === "HK1" ? "Học kỳ I" : "Học kỳ II"}</span>
              </button>
            ))}
          </div>

          {/* Desktop Discard Button (Only when dirty) */}
          {changedCount > 0 && !isLocked && (
            <button
              type="button"
              onClick={handleDiscardChanges}
              disabled={saving}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl text-xs font-bold text-[#7f1d1d] dark:text-[#fca5a5] hover:bg-red-500/10 border border-red-600/30 transition-all cursor-pointer disabled:opacity-40"
              title="Hủy tất cả các thay đổi chưa lưu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Hủy thay đổi</span>
            </button>
          )}

          {/* Desktop Save Button */}
          <button 
            type="button" 
            disabled={isLocked || saving || changedCount === 0} 
            onClick={triggerSave}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[38px] rounded-xl text-xs sm:text-sm font-bold bg-[#314e3e] hover:bg-[#263e32] text-white dark:bg-[#d6b883] dark:hover:bg-[#c9a76d] dark:text-[#19251d] shadow-xs active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? <Spinner className="h-4 w-4" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Đang lưu…" : changedCount > 0 ? `Lưu điểm (${changedCount})` : "Lưu điểm"}</span>
          </button>
        </div>
      </div>

      {isLocked && (
        <div className="px-5 py-3 bg-amber-500/15 dark:bg-amber-500/20 text-xs font-bold text-[#713f12] dark:text-[#fde047] flex items-center gap-2 border-b border-amber-600/30">
          <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
          Học kỳ này đã bị khóa sổ — dữ liệu chỉ có thể xem, không thể nhập hoặc chỉnh sửa điểm.
        </div>
      )}

      {/* --- TOOLBAR: SEARCH & FILTER CHIPS & RECALCULATE ACTION --- */}
      <div className="p-3 sm:p-4 border-b border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3]/40 dark:bg-[#151c18]/40 space-y-3">
        {/* Mobile Progress Bar */}
        {totalCount > 0 && (
          <div className="sm:hidden space-y-1.5 pb-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#293d32] dark:text-[#ecece0]">
              <span>Tiến độ nhập điểm</span>
              <span className="font-mono text-[#19251d] dark:text-[#ffffff]">{progressRate}% ({completedStudentsCount}/{rosterStudents.length} HS)</span>
            </div>
            <div className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#314e3e] dark:bg-[#d6b883] transition-all duration-300 rounded-full"
                style={{ width: `${progressRate}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-[#4a554b] dark:text-[#b8c5b5] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm học sinh theo tên, tên thánh…"
              className="w-full rounded-xl border border-[#616e5f]/50 dark:border-[#677765]/50 bg-[#fffefa] dark:bg-[#1e2821] pl-9.5 pr-8 py-2 min-h-[40px] text-xs font-medium text-[#19251d] dark:text-[#ffffff] placeholder:text-[#4a554b] dark:placeholder:text-[#b8c5b5] focus:outline-none focus:ring-2 focus:ring-[#1e3d2f]/30 dark:focus:ring-[#e5c992]/30 transition-shadow"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4a554b] hover:text-[#19251d] dark:text-[#b8c5b5] dark:hover:text-[#ffffff] p-1 cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none" data-lenis-prevent>
            {/* Dải bộ lọc nhanh */}
            <div className="flex items-center gap-1.5 shrink-0">
              {[
                { id: "all", label: "Tất cả", count: filterCounts.all },
                { id: "incomplete", label: "Chưa đủ điểm", count: filterCounts.incomplete, highlight: filterCounts.incomplete > 0 },
                { id: "attention", label: "Cần chú ý (<5)", count: filterCounts.attention, danger: filterCounts.attention > 0 },
                { id: "excellent", label: "Giỏi (≥8)", count: filterCounts.excellent },
              ].map((tab) => {
                const isActive = filterType === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterType(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[38px] cursor-pointer ${
                      isActive
                        ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-xs"
                        : "bg-[#fffefa] dark:bg-[#1e2821] text-[#293d32] dark:text-[#ecece0] hover:bg-[#faf8f3] dark:hover:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                        isActive
                          ? "bg-white/20 text-white dark:bg-black/20 dark:text-[#19251d]"
                          : tab.danger
                          ? "bg-red-100 text-[#7f1d1d] dark:bg-red-950 dark:text-[#fca5a5]"
                          : tab.highlight
                          ? "bg-amber-100 text-[#713f12] dark:bg-amber-950 dark:text-[#fde047]"
                          : "bg-stone-200/90 text-[#19251d] dark:bg-stone-700 dark:text-[#ffffff]"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Nút Đồng bộ ĐTB toàn lớp */}
            <button
              type="button"
              onClick={handleRecalculateAllTB}
              disabled={isLocked}
              title="Tính toán và đồng bộ lại ĐTB toàn lớp theo công thức chuẩn"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-xl bg-[#fffefa] dark:bg-[#1e2821] hover:bg-[#faf8f3] dark:hover:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-xs font-bold text-[#293d32] dark:text-[#ecece0] hover:text-[#19251d] dark:hover:text-[#ffffff] transition-all shrink-0 cursor-pointer disabled:opacity-40"
            >
              <Calculator className="w-3.5 h-3.5 text-[#5e4117] dark:text-[#e0c38c]" />
              <span className="hidden sm:inline">Chuẩn hóa ĐTB</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#314e3e] dark:text-[#d6b883] text-xs font-medium">
          <Spinner className="w-5 h-5 mb-2" />
          <span>Đang tải bảng điểm…</span>
        </div>
      ) : (
        <>
          {/* --- MOBILE CARDS VIEW --- */}
          <div className="md:hidden divide-y divide-[#dedfd4] dark:divide-[#354237] pb-32">
            {processedStudents.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <p className="text-sm font-semibold text-[#19251d] dark:text-[#ffffff]">
                  Không tìm thấy học sinh phù hợp
                </p>
                <p className="text-xs text-[#293d32] dark:text-[#ecece0] mt-1">
                  Thử đổi từ khóa tìm kiếm hoặc chọn bộ lọc khác
                </p>
                {(search || filterType !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setFilterType("all");
                    }}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#616e5f]/50 text-xs font-bold text-[#19251d] dark:text-[#ffffff] cursor-pointer"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            ) : (
              processedStudents.map((s, idx) => {
                const g = rows[s.username] ?? {};
                const isDirty = JSON.stringify(g) !== JSON.stringify(initial[s.username]);
                const theme = getScoreTheme(g.diem_tb);

                return (
                  <div 
                    key={s.username} 
                    className={`p-4 transition-colors ${
                      isDirty ? "bg-amber-500/[0.06] dark:bg-amber-500/[0.10]" : "bg-[#fffefa] dark:bg-[#1e2821]"
                    }`}
                  >
                    {/* Card Header: Avatar, Name, STT, and Real-time ĐTB Badge */}
                    <div className="flex items-center justify-between gap-3 mb-3.5">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full border border-[#616e5f]/40 dark:border-[#677765]/50 bg-stone-100 dark:bg-stone-800 shrink-0 overflow-hidden">
                          <img 
                            src={s.avatar || "/images/avatarDefault.avif"} 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-[#19251d] dark:text-[#ffffff] leading-snug break-words">
                            {s.tenThanh && (
                              <span className="text-[#5e4117] dark:text-[#e0c38c] font-serif font-semibold mr-1.5">
                                {s.tenThanh}
                              </span>
                            )}
                            {s.hoTen || s.username}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-[#293d32] dark:text-[#ecece0] font-medium">
                            <span className="font-mono font-bold bg-[#faf8f3] dark:bg-[#151c18] px-1.5 py-0.5 rounded border border-[#dedfd4] dark:border-[#354237]">
                              STT #{idx + 1}
                            </span>
                            {isDirty && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#713f12] dark:text-[#fde047]">
                                ● Đã sửa
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Real-time ĐTB Badge (48x48px) with AAA Contrast */}
                      <div 
                        className={`flex flex-col items-center justify-center shrink-0 w-12 h-12 rounded-xl border ${theme.bg} ${theme.border} shadow-2xs`}
                        aria-label={`Điểm trung bình tự động: ${g.diem_tb ?? "Chưa có"}`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#293d32] dark:text-[#ecece0]">
                          ĐTB
                        </span>
                        <span className={`text-base font-mono font-bold ${theme.text}`}>
                          {g.diem_tb ?? "-"}
                        </span>
                      </div>
                    </div>

                    {/* 2-Tier Grade Inputs Grid */}
                    <div className="space-y-2">
                      {/* Tier 1: Miệng, Vở, 15' -> 3 Columns */}
                      <div className="grid grid-cols-3 gap-2">
                        {[scoreFields[0], scoreFields[1], scoreFields[2]].map((f) => {
                          const fieldId = `m-input-${s.username}-${f.key}`;
                          const isShaking = shakeField === `${s.username}-${f.key}`;
                          return (
                            <div 
                              key={f.key} 
                              className={`relative bg-[#faf8f3] dark:bg-[#151c18] rounded-xl border ${
                                isShaking 
                                  ? "border-red-700 ring-2 ring-red-700/30 dark:border-red-400 dark:ring-red-400/30" 
                                  : "border-[#616e5f] dark:border-[#677765]"
                              } focus-within:border-[#1e3d2f] dark:focus-within:border-[#e5c992] focus-within:ring-2 focus-within:ring-[#1e3d2f]/25 dark:focus-within:ring-[#e5c992]/25 transition-all p-1.5 flex flex-col items-center justify-center min-h-[52px]`}
                            >
                              <label 
                                htmlFor={fieldId}
                                className="text-[11px] font-bold text-[#293d32] dark:text-[#ecece0] block leading-none mb-1 text-center select-none"
                              >
                                {f.label}
                              </label>
                              <Motion.input
                                id={fieldId}
                                variants={{ shake: { x: [-3, 3, -3, 3, 0], transition: { duration: 0.3 } } }}
                                animate={isShaking ? "shake" : ""}
                                type="text" 
                                inputMode="decimal" 
                                placeholder="-"
                                value={g[f.key] ?? ""}
                                onChange={(e) => handleScoreChange(s.username, f.key, e.target.value)}
                                disabled={isLocked}
                                aria-label={`${FIELD_CONFIG[f.key]?.fullLabel || f.label} của ${s.tenThanh || ""} ${s.hoTen || s.username}`}
                                className={`w-full text-center bg-transparent text-base font-bold font-mono placeholder:text-[#4a554b] dark:placeholder:text-[#b8c5b5] focus:outline-none ${
                                  isShaking ? "text-red-800 dark:text-red-200" : "text-[#19251d] dark:text-[#ffffff]"
                                } disabled:opacity-50`}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Tier 2: 1 Tiết, Thi HK -> 2 Columns */}
                      <div className="grid grid-cols-2 gap-2">
                        {[scoreFields[3], scoreFields[4]].map((f) => {
                          const fieldId = `m-input-${s.username}-${f.key}`;
                          const isShaking = shakeField === `${s.username}-${f.key}`;
                          const isExam = f.key === "diem_thi";
                          return (
                            <div 
                              key={f.key} 
                              className={`relative ${
                                isExam 
                                  ? "bg-[#5e4117]/10 dark:bg-[#e0c38c]/10 border-[#5e4117]/50 dark:border-[#e0c38c]/50" 
                                  : "bg-[#faf8f3] dark:bg-[#151c18] border-[#616e5f] dark:border-[#677765]"
                              } rounded-xl border ${
                                isShaking ? "border-red-700 ring-2 ring-red-700/30 dark:border-red-400 dark:ring-red-400/30" : ""
                              } focus-within:border-[#1e3d2f] dark:focus-within:border-[#e5c992] focus-within:ring-2 focus-within:ring-[#1e3d2f]/25 dark:focus-within:ring-[#e5c992]/25 transition-all p-1.5 flex flex-col items-center justify-center min-h-[52px]`}
                            >
                              <label 
                                htmlFor={fieldId}
                                className="text-[11px] font-bold text-[#293d32] dark:text-[#ecece0] block leading-none mb-1 text-center select-none"
                              >
                                {f.label}
                              </label>
                              <Motion.input
                                id={fieldId}
                                variants={{ shake: { x: [-3, 3, -3, 3, 0], transition: { duration: 0.3 } } }}
                                animate={isShaking ? "shake" : ""}
                                type="text" 
                                inputMode="decimal" 
                                placeholder="-"
                                value={g[f.key] ?? ""}
                                onChange={(e) => handleScoreChange(s.username, f.key, e.target.value)}
                                disabled={isLocked}
                                aria-label={`${FIELD_CONFIG[f.key]?.fullLabel || f.label} của ${s.tenThanh || ""} ${s.hoTen || s.username}`}
                                className={`w-full text-center bg-transparent text-base font-bold font-mono placeholder:text-[#4a554b] dark:placeholder:text-[#b8c5b5] focus:outline-none ${
                                  isShaking ? "text-red-800 dark:text-red-200" : "text-[#19251d] dark:text-[#ffffff]"
                                } disabled:opacity-50`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* --- DESKTOP TABLE VIEW --- */}
          <div className="hidden md:block overflow-auto max-h-[72vh]" data-lenis-prevent>
            <table className="w-full text-sm border-collapse min-w-[880px] bg-[#fffefa] dark:bg-[#1e2821]">
              <thead className="sticky top-0 z-30 bg-[#faf8f3] dark:bg-[#151c18] border-b border-[#dedfd4] dark:border-[#354237] text-xs font-bold uppercase tracking-wider text-[#293d32] dark:text-[#ecece0]">
                <tr>
                  <th className="sticky left-0 z-40 bg-[#faf8f3] dark:bg-[#151c18] px-3 py-3.5 text-center w-12 border-r border-[#dedfd4] dark:border-[#354237]">STT</th>
                  <th className="sticky left-12 z-40 bg-[#faf8f3] dark:bg-[#151c18] px-4 py-3.5 text-left min-w-[210px] border-r border-[#dedfd4] dark:border-[#354237] shadow-xs normal-case tracking-normal">Họ &amp; Tên Học Sinh</th>
                  {scoreFields.map(f => (
                    <th key={f.key} className="px-2 py-3.5 text-center w-28 border-r border-[#dedfd4] dark:border-[#354237]">
                      <span className="font-bold">{f.label}</span>
                    </th>
                  ))}
                  <th className="px-3 py-3.5 text-center w-28 bg-[#faf8f3]/90 dark:bg-[#151c18]/90 text-[#19251d] dark:text-[#ffffff]">
                    <span className="font-bold">ĐTB</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dedfd4] dark:divide-[#354237]">
                {processedStudents.map((s, rowIdx) => {
                  const g = rows[s.username] ?? {};
                  const isDirty = JSON.stringify(g) !== JSON.stringify(initial[s.username]);
                  const theme = getScoreTheme(g.diem_tb);

                  return (
                    <tr 
                      key={s.username} 
                      className={`transition-colors bg-[#fffefa] dark:bg-[#1e2821] hover:bg-[#faf8f3] dark:hover:bg-[#25322a] group ${
                        isDirty ? "bg-amber-500/[0.04] dark:bg-amber-500/[0.08]" : ""
                      }`}
                    >
                      <td className="sticky left-0 z-20 bg-[#fffefa] dark:bg-[#1e2821] px-3 py-2 text-center text-xs font-mono font-bold text-[#293d32] dark:text-[#ecece0] border-r border-[#dedfd4] dark:border-[#354237] group-hover:bg-[#faf8f3] dark:group-hover:bg-[#25322a] transition-colors">
                        {rowIdx + 1}
                      </td>
                      <td className="sticky left-12 z-20 bg-[#fffefa] dark:bg-[#1e2821] px-4 py-2 border-r border-[#dedfd4] dark:border-[#354237] shadow-xs group-hover:bg-[#faf8f3] dark:group-hover:bg-[#25322a] transition-colors">
                        <div className="flex items-center gap-3 min-w-[190px]">
                          <img src={s.avatar || "/images/avatarDefault.avif"} alt="" className="w-8 h-8 rounded-full border border-[#616e5f]/40 dark:border-[#677765]/50 object-cover shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-[#19251d] dark:text-[#ffffff] whitespace-nowrap">
                              {s.tenThanh && <span className="font-serif font-semibold text-[#5e4117] dark:text-[#e0c38c] mr-1">{s.tenThanh}</span>}
                              {s.hoTen || s.username}
                            </p>
                            {isDirty && (
                              <span className="text-[10px] font-bold text-[#713f12] dark:text-[#fde047]">● Chưa lưu</span>
                            )}
                          </div>
                        </div>
                      </td>
                      {scoreFields.map((f, colIdx) => (
                        <td key={f.key} className="px-1.5 py-1.5 border-r border-[#dedfd4] dark:border-[#354237] relative">
                          <Motion.input
                            id={`input-${s.username}-${f.key}`}
                            variants={{ shake: { x: [-3, 3, -3, 3, 0], transition: { duration: 0.3 } } }}
                            animate={shakeField === `${s.username}-${f.key}` ? "shake" : ""}
                            type="text" 
                            inputMode="decimal" 
                            value={g[f.key] ?? ""}
                            onChange={(e) => handleScoreChange(s.username, f.key, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                            disabled={isLocked}
                            aria-label={`${FIELD_CONFIG[f.key]?.fullLabel || f.label} của ${s.tenThanh || ""} ${s.hoTen || s.username}`}
                            className={`w-full text-center py-2 text-sm font-mono font-bold bg-transparent border border-transparent focus:outline-none focus:border-[#1e3d2f] dark:focus:border-[#e5c992] focus:bg-[#faf8f3] dark:focus:bg-[#151c18] rounded-lg transition-all ${
                              shakeField === `${s.username}-${f.key}` ? "border-red-700 bg-red-50 text-red-800 dark:border-red-400 dark:bg-red-950 dark:text-red-200" : "text-[#19251d] dark:text-[#ffffff]"
                            } disabled:opacity-50`}
                          />
                        </td>
                      ))}
                      {/* Cột ĐTB (Tự động tính 100% theo thời gian thực) */}
                      <td className={`px-2 py-2 text-center relative ${theme.bg} transition-colors border-l border-[#dedfd4] dark:border-[#354237]`}>
                        <span 
                          className={`inline-block py-1 px-2.5 rounded-lg text-sm font-mono font-bold ${theme.text}`}
                          aria-label={`Điểm trung bình tự động: ${g.diem_tb ?? "Chưa có"}`}
                        >
                          {g.diem_tb ?? "-"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* INFO FOOTER */}
          {rosterStudents.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3]/40 dark:bg-[#151c18]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#293d32] dark:text-[#ecece0]">
                <span className="font-bold text-[#19251d] dark:text-[#ffffff]">Phân loại ĐTB:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 dark:bg-emerald-400" />
                  <span className="font-semibold text-[#064e3b] dark:text-[#6ee7b7]">Giỏi (≥8.0)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-700 dark:bg-blue-400" />
                  <span className="font-semibold text-[#1e3a8a] dark:text-[#93c5fd]">Khá (6.5-7.9)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-700 dark:bg-amber-400" />
                  <span className="font-semibold text-[#713f12] dark:text-[#fde047]">TB (5.0-6.4)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-700 dark:bg-red-400" />
                  <span className="font-semibold text-[#7f1d1d] dark:text-[#fca5a5]">Yếu (&lt;5.0)</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-2.5 py-1 bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-lg text-[#19251d] dark:text-[#ffffff]">
                  Sĩ số: {rosterStudents.length}
                </span>
                <span className="px-2.5 py-1 bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] rounded-lg font-mono">
                  ĐTB lớp: {classAverage}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* MOBILE BOTTOM ACTION BAR (Premium Floating Card above BottomTabBar) */}
      {createPortal(
        <AnimatePresence>
          {changedCount > 0 && !isLocked && (
            <Motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
              className="md:hidden fixed bottom-[calc(env(safe-area-inset-bottom)+70px)] left-3 right-3 z-[80] pointer-events-auto max-w-[440px] mx-auto"
            >
              <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] shadow-xl p-2.5 sm:p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-[#713f12] dark:text-[#fde047] border border-amber-600/30 flex items-center justify-center shrink-0">
                    <span className="text-xs font-mono font-bold">{changedCount}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#19251d] dark:text-[#ffffff] truncate">
                      Đã sửa {changedCount} học sinh
                    </p>
                    <p className="text-[11px] text-[#293d32] dark:text-[#ecece0] truncate">
                      Chưa lưu vào sổ điểm
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Nút HỦY THAY ĐỔI */}
                  <button
                    type="button"
                    onClick={handleDiscardChanges}
                    disabled={saving}
                    className="px-3 py-1.5 min-h-[38px] rounded-xl text-xs font-bold text-[#7f1d1d] dark:text-[#fca5a5] hover:bg-red-500/10 border border-red-600/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    Hủy
                  </button>

                  {/* Nút LƯU ĐIỂM */}
                  <button
                    type="button"
                    onClick={triggerSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-1.5 min-h-[38px] rounded-xl bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <Spinner className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{saving ? "Đang lưu…" : "Lưu ngay"}</span>
                  </button>
                </div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* CONFIRM SAVE DIALOG */}
      <ConfirmDialog
        open={showConfirmModal}
        icon={Save}
        title="Xác nhận lưu bảng điểm?"
        message={`Bạn đang cập nhật điểm số cho ${changedCount} học sinh trong học kỳ này.`}
        confirmLabel="Lưu ngay"
        cancelLabel="Quay lại"
        loading={saving}
        onConfirm={confirmSave}
        onCancel={() => !saving && setShowConfirmModal(false)}
      />

      {/* CONFIRM DISCARD DIALOG */}
      <ConfirmDialog
        open={showDiscardConfirm}
        icon={RotateCcw}
        title="Hủy bỏ các thay đổi?"
        message={`Tất cả điểm số chưa lưu của ${changedCount} học sinh sẽ được khôi phục về trạng thái ban đầu.`}
        confirmLabel="Hủy thay đổi"
        cancelLabel="Giữ lại"
        onConfirm={confirmDiscard}
        onCancel={() => setShowDiscardConfirm(false)}
      />
    </Motion.div>
  );
}