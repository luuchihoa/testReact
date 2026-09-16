/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { 
  AlertCircle, Save, Calendar, BarChart2, CheckCircle2, 
  Calculator, Sparkles, GraduationCap, RotateCcw 
} from "lucide-react";
import { createPortal } from "react-dom";
import { StatCard, ConfirmDialog } from "../../../components/ui/StudentShared.jsx";
import { ATTENDANCE_STATUS, RANK_COLORS, formatHocLuc, formatHanhKiem } from "../../../components/ui/studentSharedUtils.js";
import { Spinner } from "../../../components/ui/Skeleton.jsx";
import { 
  fetchStudentAcademic, fetchClassTermRanges, fetchTermLocks,
  saveStudentGrades, saveStudentTermSummary, saveStudentYearSummary, saveStudentAttendance 
} from "../api.js";
import { HK_INT_MAP, STATUS_CYCLE, GRADE_FIELDS, HOC_LUC_OPTIONS, HANH_KIEM_OPTIONS } from "../constants.js";

const APPLE_EASE = [0.16, 1, 0.3, 1];
const SLIDE_VARIANTS = {
  initial: (direction) => ({ x: direction > 0 ? 15 : -15, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction < 0 ? 15 : -15, opacity: 0 }),
};

const RANK_CHIP_COLORS = {
  "Giỏi": {
    active: "bg-emerald-700 text-white border-emerald-700 dark:bg-emerald-600 dark:border-emerald-600 dark:text-white shadow-xs font-bold",
    inactive: "bg-[#faf8f3] dark:bg-[#151c18] text-[#454f46] dark:text-[#b8c2b4] border-[#dedfd4] dark:border-[#354237] hover:border-emerald-600/50 hover:text-emerald-800 dark:hover:text-emerald-200"
  },
  "Tốt": {
    active: "bg-emerald-700 text-white border-emerald-700 dark:bg-emerald-600 dark:border-emerald-600 dark:text-white shadow-xs font-bold",
    inactive: "bg-[#faf8f3] dark:bg-[#151c18] text-[#454f46] dark:text-[#b8c2b4] border-[#dedfd4] dark:border-[#354237] hover:border-emerald-600/50 hover:text-emerald-800 dark:hover:text-emerald-200"
  },
  "Khá": {
    active: "bg-blue-700 text-white border-blue-700 dark:bg-blue-600 dark:border-blue-600 dark:text-white shadow-xs font-bold",
    inactive: "bg-[#faf8f3] dark:bg-[#151c18] text-[#454f46] dark:text-[#b8c2b4] border-[#dedfd4] dark:border-[#354237] hover:border-blue-600/50 hover:text-blue-800 dark:hover:text-blue-200"
  },
  "TB": {
    active: "bg-amber-600 text-white border-amber-600 dark:bg-amber-500 dark:border-amber-500 dark:text-stone-950 shadow-xs font-extrabold",
    inactive: "bg-[#faf8f3] dark:bg-[#151c18] text-[#454f46] dark:text-[#b8c2b4] border-[#dedfd4] dark:border-[#354237] hover:border-amber-600/50 hover:text-amber-800 dark:hover:text-amber-200"
  },
  "Trung Bình": {
    active: "bg-amber-600 text-white border-amber-600 dark:bg-amber-500 dark:border-amber-500 dark:text-stone-950 shadow-xs font-extrabold",
    inactive: "bg-[#faf8f3] dark:bg-[#151c18] text-[#454f46] dark:text-[#b8c2b4] border-[#dedfd4] dark:border-[#354237] hover:border-amber-600/50 hover:text-amber-800 dark:hover:text-amber-200"
  },
  "Yếu": {
    active: "bg-rose-600 text-white border-rose-600 dark:bg-rose-500 dark:border-rose-500 dark:text-white shadow-xs font-bold",
    inactive: "bg-[#faf8f3] dark:bg-[#151c18] text-[#454f46] dark:text-[#b8c2b4] border-[#dedfd4] dark:border-[#354237] hover:border-rose-600/50 hover:text-rose-800 dark:hover:text-rose-200"
  },
  "Kém": {
    active: "bg-red-700 text-white border-red-700 dark:bg-red-600 dark:border-red-600 dark:text-white shadow-xs font-bold",
    inactive: "bg-[#faf8f3] dark:bg-[#151c18] text-[#454f46] dark:text-[#b8c2b4] border-[#dedfd4] dark:border-[#354237] hover:border-red-600/50 hover:text-red-800 dark:hover:text-red-200"
  }
};

const HOC_LUC_CHIP_COLORS = RANK_CHIP_COLORS;
const HANH_KIEM_CHIP_COLORS = RANK_CHIP_COLORS;

function calculateAutoDTB(g) {
  if (!g) return null;
  const m = g.diem_mieng;
  const v = g.diem_vo;
  const p15 = g.diem_15_phut;
  const t1 = g.diem_1_tiet;
  const thi = g.diem_thi;

  let totalScore = 0;
  let totalWeight = 0;

  if (m !== null && m !== undefined && m !== "") { totalScore += Number(m); totalWeight += 1; }
  if (v !== null && v !== undefined && v !== "") { totalScore += Number(v); totalWeight += 1; }
  if (p15 !== null && p15 !== undefined && p15 !== "") { totalScore += Number(p15); totalWeight += 1; }
  if (t1 !== null && t1 !== undefined && t1 !== "") { totalScore += Number(t1) * 2; totalWeight += 2; }
  if (thi !== null && thi !== undefined && thi !== "") { totalScore += Number(thi) * 3; totalWeight += 3; }

  if (totalWeight === 0) return null;
  return Math.round((totalScore / totalWeight) * 10) / 10;
}

function suggestHocLuc(score) {
  if (score === null || score === undefined || score === "") return "";
  const s = Number(score);
  if (s >= 8.0) return "Giỏi";
  if (s >= 6.5) return "Khá";
  if (s >= 5.0) return "TB";
  if (s >= 3.5) return "Yếu";
  return "Kém";
}

function EditableScoreCell({ label, value, onChange, disabled }) {
  return (
    <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-xl p-2.5 sm:p-3 text-center border border-[#dedfd4] dark:border-[#354237] shadow-xs focus-within:ring-2 focus-within:ring-[#314e3e]/30 dark:focus-within:ring-[#d6b883]/30 transition-all">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4] mb-1 truncate">{label}</p>
      <input
        type="number" 
        min="0" 
        max="10" 
        step="0.1" 
        disabled={disabled}
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") {
            onChange(null);
          } else {
            const num = Number(raw);
            onChange(Number.isNaN(num) ? null : Math.min(10, Math.max(0, num)));
          }
        }}
        className="w-full text-center text-sm sm:text-base font-bold font-mono text-[#293d32] dark:text-[#ecece0] bg-transparent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-[#454f46]/40 dark:placeholder:text-[#b8c2b4]/40"
        placeholder="--"
      />
    </div>
  );
}

function AcademicSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-[#faf8f3] dark:bg-[#151c18] rounded-2xl border border-[#dedfd4] dark:border-[#354237]" />
        ))}
      </div>
      <div className="h-28 bg-[#faf8f3] dark:bg-[#151c18] rounded-2xl border border-[#dedfd4] dark:border-[#354237]" />
      <div className="h-36 bg-[#faf8f3] dark:bg-[#151c18] rounded-2xl border border-[#dedfd4] dark:border-[#354237]" />
    </div>
  );
}

function AcademicTab({ student, namHoc, lop, showToast }) {
  const [hocKy, setHocKy] = useState("HK1");
  const [[_hkPage, hkDirection], setHkPage] = useState([0, 0]);

  const hocKyInt = HK_INT_MAP[hocKy];

  // In-memory cache to prevent layout shift and unnecessary refetches
  const [cache, setCache] = useState({});
  const cacheKey = `${student.username}-${namHoc}-${hocKy}`;

  const [loading, setLoading] = useState(!cache[cacheKey]);
  const [grades, setGrades] = useState({});
  const [term, setTerm] = useState({});
  const [baseAttendance, setBaseAttendance] = useState({}); 
  const [attendanceOverrides, setAttendanceOverrides] = useState({}); 
  const [savingGrades, setSavingGrades] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [dirtyGrades, setDirtyGrades] = useState(false);
  const [confirmGradesOpen, setConfirmGradesOpen] = useState(false);
  const [confirmAttendanceOpen, setConfirmAttendanceOpen] = useState(false);

  // Data for Year View comparison
  const [hk1Academic, setHk1Academic] = useState(null);
  const [hk2Academic, setHk2Academic] = useState(null);

  const [classRanges, setClassRanges] = useState({ HK1: { start: null, sundays: [] }, HK2: { start: null, sundays: [] } });
  const [termLocks, setTermLocks] = useState({});
  
  const isLocked = !!termLocks[hocKyInt];

  const requestSaveGrades = () => {
    if (isLocked) return;
    setConfirmGradesOpen(true);
  };

  const requestSaveAttendance = () => {
    if (isLocked) return;
    const changedDates = Object.keys(attendanceOverrides);
    if (changedDates.length === 0) { 
      showToast("Không có thay đổi điểm danh", "warning"); 
      return; 
    }
    setConfirmAttendanceOpen(true);
  };

  const handleDiscardChanges = () => {
    const cached = cache[cacheKey];
    if (cached) {
      setGrades(cached.grades ? { ...cached.grades } : {});
      setTerm(cached.term ? { ...cached.term } : { username: student.username, nam_hoc: namHoc, lop, hoc_ky: hocKyInt });
    } else {
      setGrades({});
      setTerm({ username: student.username, nam_hoc: namHoc, lop, hoc_ky: hocKyInt });
    }
    setAttendanceOverrides({});
    setDirtyGrades(false);
    showToast("Đã hủy các thay đổi chưa lưu", "info");
  };

  const handleHocKyChange = (k) => {
    if (k === hocKy) return;
    const HK_LIST = ["HK1", "HK2", "CN"];
    const newIdx = HK_LIST.indexOf(k);
    const oldIdx = HK_LIST.indexOf(hocKy);
    setHocKy(k);
    setHkPage([newIdx, newIdx > oldIdx ? 1 : -1]);
    setAttendanceOverrides({});
    setDirtyGrades(false);
  };

  useEffect(() => {
    let cancelled = false;
    
    // If cached, hydrate immediately without flashing spinner
    if (cache[cacheKey]) {
      const cached = cache[cacheKey];
      setGrades(cached.grades ?? {});
      setTerm(cached.term ?? { username: student.username, nam_hoc: namHoc, lop, hoc_ky: hocKyInt });
      setClassRanges(cached.classRanges);
      setTermLocks(cached.termLocks);
      setHk1Academic(cached.hk1Academic);
      setHk2Academic(cached.hk2Academic);
      setBaseAttendance(cached.baseAttendance);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setAttendanceOverrides({});
      setDirtyGrades(false);
      try {
        const promises = [
          fetchStudentAcademic(student.username, namHoc, hocKyInt),
          fetchClassTermRanges(lop, namHoc),
          fetchTermLocks(lop, namHoc),
        ];

        if (hocKy === "CN") {
          promises.push(fetchStudentAcademic(student.username, namHoc, 1));
          promises.push(fetchStudentAcademic(student.username, namHoc, 2));
        }

        const [result, ranges, locks, hk1Res, hk2Res] = await Promise.all(promises);
        if (cancelled) return;

        const resGrades = result.grades ?? {};
        const resTerm = result.term ?? { username: student.username, nam_hoc: namHoc, lop, hoc_ky: hocKyInt };
        const attMap = {};
        (result.attendanceExceptions ?? []).forEach(({ ngay, trang_thai }) => { attMap[ngay] = trang_thai; });

        setGrades(resGrades);
        setTerm(resTerm);
        setClassRanges(ranges);
        setTermLocks(locks);
        if (hk1Res) setHk1Academic(hk1Res);
        if (hk2Res) setHk2Academic(hk2Res);
        setBaseAttendance(attMap);

        // Store into cache
        setCache((prev) => ({
          ...prev,
          [cacheKey]: {
            grades: resGrades,
            term: resTerm,
            classRanges: ranges,
            termLocks: locks,
            hk1Academic: hk1Res ?? null,
            hk2Academic: hk2Res ?? null,
            baseAttendance: attMap
          }
        }));
      } catch (err) {
        console.error("load academic error:", err);
        if (!cancelled) showToast("Không tải được dữ liệu học tập", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [student.username, namHoc, hocKyInt, hocKy, lop, showToast, cacheKey, cache]);

  const currentRange = classRanges[hocKy];

  const attendanceList = useMemo(() => {
    return (currentRange?.sundays ?? []).map((sunday) => {
      const isoDate = sunday.toISOString().slice(0, 10);
      const trangThai = attendanceOverrides[isoDate] ?? baseAttendance[isoDate] ?? "co_mat";
      return { date: sunday, isoDate, trangThai };
    });
  }, [currentRange, baseAttendance, attendanceOverrides]);

  const presentCount = attendanceList.filter(a => a.trangThai === "co_mat").length;
  const totalCount = attendanceList.length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  const cycleStatus = (isoDate, current) => {
    if (isLocked) return;
    const idx = STATUS_CYCLE.indexOf(current);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    setAttendanceOverrides((prev) => ({ ...prev, [isoDate]: next }));
  };

  const handleMarkAllPresent = () => {
    if (isLocked) return;
    const newOverrides = {};
    attendanceList.forEach(({ isoDate }) => {
      newOverrides[isoDate] = "co_mat";
    });
    setAttendanceOverrides(newOverrides);
  };

  const handleScoreChange = useCallback((fieldKey, val) => {
    setDirtyGrades(true);
    setGrades((prev) => {
      const nextGrades = { ...prev, [fieldKey]: val };
      const autoDTB = calculateAutoDTB(nextGrades);
      if (autoDTB !== null) {
        nextGrades.diem_tb = autoDTB;
        setTerm((prevTerm) => {
          const suggested = suggestHocLuc(autoDTB);
          if (suggested && (!prevTerm.hoc_luc || prevTerm.hoc_luc === suggestHocLuc(prev.diem_tb))) {
            return { ...prevTerm, hoc_luc: suggested };
          }
          return prevTerm;
        });
      }
      return nextGrades;
    });
  }, []);

  const handleApplyAutoDTB = () => {
    const autoDTB = calculateAutoDTB(grades);
    if (autoDTB !== null) {
      setDirtyGrades(true);
      setGrades((p) => ({ ...p, diem_tb: autoDTB }));
      const suggested = suggestHocLuc(autoDTB);
      if (suggested) {
        setTerm((p) => ({ ...p, hoc_luc: suggested }));
      }
      showToast(`Đã áp dụng ĐTB tự động: ${autoDTB} (${suggested})`, "info");
    } else {
      showToast("Chưa có điểm kiểm tra để tính ĐTB", "warning");
    }
  };

  const saveGradesAndTerm = async () => {
    if (isLocked) return;
    setSavingGrades(true);
    try {
      if (hocKyInt === 0) {
        const yearPayload = {
          username: student.username, nam_hoc: namHoc, lop,
          diem_tb: grades?.diem_tb ?? null,
          hoc_luc: term.hoc_luc || null,
          hanh_kiem: term.hanh_kiem || null,
          vi_thu: term.vi_thu ? Number(term.vi_thu) : null,
          ghi_chu: term.ghi_chu || "",
        };
        await saveStudentYearSummary(yearPayload);
      } else {
        const gradesPayload = {
          username: student.username, nam_hoc: namHoc, lop, hoc_ky: hocKyInt,
          diem_mieng: grades.diem_mieng ?? null,
          diem_vo: grades.diem_vo ?? null,
          diem_15_phut: grades.diem_15_phut ?? null,
          diem_1_tiet: grades.diem_1_tiet ?? null,
          diem_thi: grades.diem_thi ?? null,
          diem_tb: grades.diem_tb ?? null,
          ghi_chu: grades.ghi_chu ?? "",
          updated_at: new Date().toISOString(),
        };
        await saveStudentGrades(gradesPayload);

        const termPayload = {
          username: student.username, nam_hoc: namHoc, lop, hoc_ky: hocKyInt,
          hoc_luc: term.hoc_luc || null,
          hanh_kiem: term.hanh_kiem || null,
          vi_thu: term.vi_thu ? Number(term.vi_thu) : null,
          ghi_chu: term.ghi_chu || "",
        };
        await saveStudentTermSummary(termPayload);
      }

      setDirtyGrades(false);
      // Update cache
      setCache((prev) => ({
        ...prev,
        [cacheKey]: {
          ...prev[cacheKey],
          grades,
          term
        }
      }));

      showToast("Đã lưu điểm & tổng kết thành công!", "success");
    } catch (err) {
      console.error("saveGradesAndTerm error:", err);
      showToast("Lưu điểm thất bại: " + (err.message || ""), "error");
    } finally {
      setSavingGrades(false);
    }
  };

  const saveAttendance = async () => {
    if (isLocked) return;
    const changedDates = Object.keys(attendanceOverrides);
    if (changedDates.length === 0) { showToast("Không có thay đổi điểm danh", "warning"); return; }

    setSavingAttendance(true);
    try {
      const rows = changedDates.map((isoDate) => ({
        username: student.username, nam_hoc: namHoc, hoc_ky: hocKyInt,
        ngay: isoDate, trang_thai: attendanceOverrides[isoDate],
      }));
      await saveStudentAttendance(rows);

      const updatedBase = { ...baseAttendance, ...attendanceOverrides };
      setBaseAttendance(updatedBase);
      setAttendanceOverrides({});

      // Update cache
      setCache((prev) => ({
        ...prev,
        [cacheKey]: {
          ...prev[cacheKey],
          baseAttendance: updatedBase
        }
      }));

      showToast("Đã lưu điểm danh học sinh!", "success");
    } catch (err) {
      console.error("saveAttendance error:", err);
      showToast("Lưu điểm danh thất bại: " + (err.message || ""), "error");
    } finally {
      setSavingAttendance(false);
    }
  };

  const calculatedAutoDTB = useMemo(() => calculateAutoDTB(grades), [grades]);
  const hasAttendanceChanges = Object.keys(attendanceOverrides).length > 0;

  return (
    <Motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.3, ease: APPLE_EASE }} 
      className="flex flex-col gap-6"
    >
      {/* ACADEMIC HEADER: Title & Semester Selector (Đồng bộ /tài-khoản/thành-tích) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#dedfd4]/60 dark:border-[#354237]/60">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#314e3e]/10 dark:bg-[#d6b883]/15 flex items-center justify-center text-[#314e3e] dark:text-[#d6b883] border border-[#dedfd4] dark:border-[#354237] shrink-0">
            <GraduationCap className="w-5 h-5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold text-[#293d32] dark:text-[#ecece0] truncate leading-tight">
              Sổ điểm & Điểm danh chuyên cần
            </h3>
            <p className="text-xs font-medium text-[#454f46] dark:text-[#b8c2b4] mt-0.5">
              Lớp {lop} • Niên khóa {namHoc}
            </p>
          </div>
        </div>

        {/* Segmented Selector Học kỳ (Đồng bộ Pill Switcher cả Mobile & Desktop) */}
        <div className="w-full sm:w-auto shrink-0">
          <div className="grid grid-cols-3 gap-1 bg-[#dedfd4]/40 dark:bg-[#354237]/50 p-1 rounded-2xl border border-[#dedfd4] dark:border-[#354237] select-none text-xs sm:text-[13px] font-bold">
            {[
              { id: "HK1", label: "Học kỳ I", shortLabel: "HK I" },
              { id: "HK2", label: "Học kỳ II", shortLabel: "HK II" },
              { id: "CN",  label: "Cả năm",   shortLabel: "Cả năm" },
            ].map((item) => {
              const isActive = hocKy === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleHocKyChange(item.id)}
                  className={`relative flex items-center justify-center py-2 px-2.5 sm:px-3.5 rounded-xl transition-colors duration-200 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "text-[#314e3e] dark:text-[#d4b47d]"
                      : "text-[#454f46] dark:text-[#b8c2b4] hover:text-[#293d32] dark:hover:text-[#ecece0]"
                  }`}
                >
                  {isActive && (
                    <Motion.div
                      layoutId="academic-tab-active-pill"
                      className="absolute inset-0 bg-[#fffefa] dark:bg-[#1e2821] rounded-xl shadow-xs border border-[#dedfd4] dark:border-[#354237]"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 hidden min-[360px]:inline">{item.label}</span>
                  <span className="relative z-10 min-[360px]:hidden">{item.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait" custom={hkDirection}>
        {loading ? (
          <Motion.div 
            key="loading"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
          >
            <AcademicSkeleton />
          </Motion.div>
        ) : (
          <Motion.div
            key={hocKy}
            custom={hkDirection}
            variants={SLIDE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: APPLE_EASE }}
            className="flex flex-col gap-6"
          >
            {isLocked && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Học kỳ này đã được Ban Giáo lý khóa sổ. Bảng điểm và điểm danh chỉ xem, không thể chỉnh sửa.
                </span>
              </div>
            )}

            {/* 1. THỐNG KÊ TỔNG QUAN */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label={hocKy === "CN" ? "ĐTB Cả năm" : "Điểm TB"} value={grades?.diem_tb} colorClass="text-[#314e3e] dark:text-[#d6b883]" />
              <StatCard label="Học lực" value={formatHocLuc(term?.hoc_luc)} colorClass={RANK_COLORS.hoc_luc[term?.hoc_luc] || "text-[#314e3e] dark:text-[#d6b883]"} />
              <StatCard label="Hạnh kiểm" value={formatHanhKiem(term?.hanh_kiem)} colorClass={RANK_COLORS.hanh_kiem[term?.hanh_kiem] || "text-[#314e3e] dark:text-[#d6b883]"} />
              <StatCard label="Vị thứ" value={term?.vi_thu ? `#${term.vi_thu}` : null} colorClass="text-[#314e3e] dark:text-[#d6b883]" />
            </div>

            {/* 2. BẢNG SO SÁNH ĐỐI CHIẾU 2 HỌC KỲ (Khi ở Tab Cả năm) */}
            {hocKy === "CN" && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" />
                  <span>Đối chiếu kết quả 2 Học kỳ & Cả năm</span>
                </h4>

                <div className="overflow-x-auto rounded-2xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] shadow-xs">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[#dedfd4] dark:border-[#354237] text-[#454f46] dark:text-[#b8c2b4] uppercase font-bold text-[10.5px]">
                        <th className="py-3 px-4">Tiêu chí</th>
                        <th className="py-3 px-4 text-center">Học kỳ I</th>
                        <th className="py-3 px-4 text-center">Học kỳ II</th>
                        <th className="py-3 px-4 text-center bg-[#314e3e]/5 dark:bg-[#d6b883]/10 font-black text-[#314e3e] dark:text-[#d6b883]">
                          Tổng kết Cả năm
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dedfd4]/60 dark:divide-[#354237]/60">
                      <tr>
                        <td className="py-3 px-4 font-medium text-[#454f46] dark:text-[#b8c2b4]">Điểm trung bình</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-[#293d32] dark:text-[#ecece0]">{hk1Academic?.grades?.diem_tb ?? "—"}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-[#293d32] dark:text-[#ecece0]">{hk2Academic?.grades?.diem_tb ?? "—"}</td>
                        <td className="py-3 px-4 text-center font-mono font-black text-[#314e3e] dark:text-[#d6b883] bg-[#314e3e]/5 dark:bg-[#d6b883]/10 text-sm">
                          {grades?.diem_tb ?? "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium text-[#454f46] dark:text-[#b8c2b4]">Học lực</td>
                        <td className="py-3 px-4 text-center font-bold text-[#293d32] dark:text-[#ecece0]">{formatHocLuc(hk1Academic?.term?.hoc_luc)}</td>
                        <td className="py-3 px-4 text-center font-bold text-[#293d32] dark:text-[#ecece0]">{formatHocLuc(hk2Academic?.term?.hoc_luc)}</td>
                        <td className="py-3 px-4 text-center font-bold text-[#314e3e] dark:text-[#d6b883] bg-[#314e3e]/5 dark:bg-[#d6b883]/10">
                          {formatHocLuc(term?.hoc_luc)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium text-[#454f46] dark:text-[#b8c2b4]">Hạnh kiểm</td>
                        <td className="py-3 px-4 text-center font-bold text-[#293d32] dark:text-[#ecece0]">{formatHanhKiem(hk1Academic?.term?.hanh_kiem)}</td>
                        <td className="py-3 px-4 text-center font-bold text-[#293d32] dark:text-[#ecece0]">{formatHanhKiem(hk2Academic?.term?.hanh_kiem)}</td>
                        <td className="py-3 px-4 text-center font-bold text-[#314e3e] dark:text-[#d6b883] bg-[#314e3e]/5 dark:bg-[#d6b883]/10">
                          {formatHanhKiem(term?.hanh_kiem)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium text-[#454f46] dark:text-[#b8c2b4]">Vị thứ xếp hạng</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-[#293d32] dark:text-[#ecece0]">{hk1Academic?.term?.vi_thu ? `#${hk1Academic.term.vi_thu}` : "—"}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-[#293d32] dark:text-[#ecece0]">{hk2Academic?.term?.vi_thu ? `#${hk2Academic.term.vi_thu}` : "—"}</td>
                        <td className="py-3 px-4 text-center font-mono font-black text-[#314e3e] dark:text-[#d6b883] bg-[#314e3e]/5 dark:bg-[#d6b883]/10">
                          {term?.vi_thu ? `#${term.vi_thu}` : "—"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {hocKy !== "CN" && (
              <>
                {/* 3. BẢNG ĐIỂM KIỂM TRA */}
                <div className={`space-y-3 ${isLocked ? "opacity-75" : ""}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4] flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" strokeWidth={2} /> 
                      <span>Bảng điểm kiểm tra</span>
                    </h4>

                    {calculatedAutoDTB !== null && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#454f46] dark:text-[#b8c2b4]">
                          ĐTB hệ số: <strong className="font-mono text-[#314e3e] dark:text-[#d6b883] text-sm">{calculatedAutoDTB}</strong>
                        </span>
                        {!isLocked && (
                          <button
                            type="button"
                            onClick={handleApplyAutoDTB}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] text-xs font-bold hover:bg-[#314e3e]/20 transition-all cursor-pointer"
                          >
                            <Calculator className="w-3.5 h-3.5" /> 
                            <span>Tự động tính</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {GRADE_FIELDS.map((f) => (
                      <EditableScoreCell 
                        key={f.key} 
                        label={f.label} 
                        value={grades[f.key]} 
                        disabled={isLocked}
                        onChange={(v) => handleScoreChange(f.key, v)} 
                      />
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#dedfd4]/60 dark:border-[#354237]/60" />

                {/* 4. ĐIỂM DANH CHUYÊN CẦN */}
                <div className={`space-y-3 ${isLocked ? "opacity-75" : ""}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4] flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" strokeWidth={2} />
                        <span>Điểm danh chuyên cần <span className="normal-case font-normal">({totalCount} tuần)</span></span>
                      </h4>
                      {!isLocked && totalCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllPresent}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer"
                          title="Đánh dấu có mặt cho tất cả các buổi trong kỳ"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Có mặt tất cả</span>
                        </button>
                      )}
                    </div>

                    {hasAttendanceChanges && (
                      <button 
                        type="button" 
                        disabled={isLocked || savingAttendance} 
                        onClick={requestSaveAttendance}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#314e3e] hover:bg-[#263e32] text-white dark:bg-[#d6b883] dark:hover:bg-[#c9a76d] dark:text-[#19251d] shadow-xs active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
                      >
                        {savingAttendance ? <Spinner className="h-3.5 w-3.5" /> : <Save className="w-3.5 h-3.5" />}
                        <span>{savingAttendance ? "Đang lưu…" : "Lưu điểm danh"}</span>
                      </button>
                    )}
                  </div>

                  {/* Thanh tỉ lệ chuyên cần */}
                  {totalCount > 0 && (
                    <div className="bg-[#fffefa] dark:bg-[#1e2821] p-3.5 rounded-2xl border border-[#dedfd4] dark:border-[#354237] shadow-xs">
                      <div className="flex justify-between text-xs font-semibold text-[#454f46] dark:text-[#b8c2b4] mb-1.5">
                        <span>Tỉ lệ chuyên cần</span>
                        <span className="font-mono font-bold text-[#293d32] dark:text-[#ecece0]">{attendanceRate}%</span>
                      </div>
                      <div className="h-2 w-full bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                        <Motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${attendanceRate}%` }} 
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Chú thích trạng thái */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-[#454f46] dark:text-[#b8c2b4]">
                    {Object.entries(ATTENDANCE_STATUS).filter(([k]) => k !== "null").map(([k, v]) => (
                      <span key={k} className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${v.color}`} />
                        {v.label}
                      </span>
                    ))}
                  </div>

                  {totalCount === 0 ? (
                    <div className="flex flex-col items-center gap-1.5 py-6 text-[#454f46] dark:text-[#b8c2b4]">
                      <Calendar className="w-8 h-8 opacity-40" />
                      <p className="text-xs">Chưa có lịch điểm danh cho học kỳ này.</p>
                    </div>
                  ) : (
                    <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin" data-lenis-prevent>
                      {attendanceList.map(({ date, isoDate, trangThai }) => {
                        const status = ATTENDANCE_STATUS[trangThai];
                        const isDirty = isoDate in attendanceOverrides;
                        return (
                          <button 
                            key={isoDate} 
                            type="button" 
                            disabled={isLocked} 
                            onClick={() => cycleStatus(isoDate, trangThai)}
                            className="flex flex-col items-center gap-1.5 shrink-0 w-10 group disabled:cursor-not-allowed cursor-pointer"
                            title={`Nhấp để đổi trạng thái ngày ${isoDate}`}
                          >
                            <span className={`w-8 h-8 rounded-full ${status.color} border-2 ${
                              isDirty ? "border-[#314e3e] dark:border-[#d6b883] scale-105 ring-2 ring-[#314e3e]/30" : "border-white dark:border-[#1e2821]"
                            } shadow-xs flex items-center justify-center transition-all`}>
                              <span className={`text-[11px] font-bold font-mono ${trangThai === "co_mat" ? "text-emerald-950 dark:text-emerald-50" : "text-white"}`}>
                                {date.getDate()}
                              </span>
                            </span>
                            <span className="text-[10px] font-medium text-[#454f46] dark:text-[#b8c2b4]">
                              {date.getDate()}/{date.getMonth() + 1}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="pt-2 flex justify-between text-xs font-semibold text-[#454f46] dark:text-[#b8c2b4]">
                    <span>Có mặt: <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{presentCount}</strong> buổi</span>
                    <span>Vắng: <strong className="text-red-700 dark:text-red-400 font-mono">{totalCount - presentCount}</strong> buổi</span>
                  </div>
                </div>
              </>
            )}

            <div className="border-t border-[#dedfd4]/60 dark:border-[#354237]/60" />

            {/* 5. TỔNG KẾT HỌC KỲ / CẢ NĂM */}
            <div className={`space-y-3 ${isLocked ? "opacity-75" : ""}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4] flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" strokeWidth={2} />
                  <span>{hocKy === "CN" ? "Tổng kết cả năm" : "Đánh giá & Tổng kết học kỳ"}</span>
                </h4>
                
                <button 
                  type="button" 
                  disabled={isLocked || savingGrades} 
                  onClick={requestSaveGrades}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#314e3e] hover:bg-[#263e32] text-white dark:bg-[#d6b883] dark:hover:bg-[#c9a76d] dark:text-[#19251d] shadow-xs active:scale-95 transition-all disabled:opacity-40 cursor-pointer self-start sm:self-auto"
                >
                  {savingGrades ? <Spinner className="h-3.5 w-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{savingGrades ? "Đang lưu…" : "Lưu điểm & Đánh giá"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 bg-[#fffefa] dark:bg-[#1e2821] p-4 sm:p-5 rounded-2xl border border-[#dedfd4] dark:border-[#354237] shadow-xs">
                
                {/* 1. Học lực (Chip Selector) */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4]">
                      Học lực
                    </span>
                    {term.hoc_luc && (
                      <span className="text-[11px] font-bold text-[#314e3e] dark:text-[#d6b883]">
                        {formatHocLuc(term.hoc_luc)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {HOC_LUC_OPTIONS.map((opt) => {
                      const currentVal = term.hoc_luc === "Trung Bình" ? "TB" : term.hoc_luc;
                      const isSelected = currentVal === opt;
                      const colorStyle = HOC_LUC_CHIP_COLORS[opt] || {
                        active: "bg-[#314e3e] text-white border-[#314e3e]",
                        inactive: "bg-[#faf8f3] dark:bg-[#151c18] text-[#454f46] dark:text-[#b8c2b4] border-[#dedfd4] dark:border-[#354237]"
                      };
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={isLocked}
                          onClick={() => {
                            setDirtyGrades(true);
                            setTerm((p) => ({ ...p, hoc_luc: isSelected ? "" : opt }));
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                            isSelected ? colorStyle.active : colorStyle.inactive
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Hạnh kiểm (Chip Selector) */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4]">
                      Hạnh kiểm
                    </span>
                    {term.hanh_kiem && (
                      <span className="text-[11px] font-bold text-[#314e3e] dark:text-[#d6b883]">
                        {formatHanhKiem(term.hanh_kiem)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {HANH_KIEM_OPTIONS.map((opt) => {
                      const currentHk = term.hanh_kiem === "Trung Bình" ? "TB" : term.hanh_kiem;
                      const isSelected = currentHk === opt;
                      const colorStyle = HANH_KIEM_CHIP_COLORS[opt] || {
                        active: "bg-[#314e3e] text-white border-[#314e3e]",
                        inactive: "bg-[#faf8f3] dark:bg-[#151c18] text-[#454f46] dark:text-[#b8c2b4] border-[#dedfd4] dark:border-[#354237]"
                      };
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={isLocked}
                          onClick={() => {
                            setDirtyGrades(true);
                            setTerm((p) => ({ ...p, hanh_kiem: isSelected ? "" : opt }));
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                            isSelected ? colorStyle.active : colorStyle.inactive
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Vị thứ */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4]">
                    Vị thứ
                  </span>
                  <input 
                    type="number" 
                    min="1" 
                    value={term.vi_thu ?? ""} 
                    disabled={isLocked} 
                    onChange={(e) => {
                      setDirtyGrades(true);
                      setTerm((p) => ({ ...p, vi_thu: e.target.value }));
                    }}
                    placeholder="--"
                    className="w-full rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] px-3.5 py-1.5 sm:py-2 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 disabled:opacity-60 transition-all shadow-2xs" 
                  />
                </div>

                {/* 4. Ghi chú nhận xét của GLV */}
                <div className="flex flex-col gap-2 col-span-full">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4]">
                    Ghi chú nhận xét của GLV
                  </span>
                  <textarea 
                    rows={2} 
                    value={term.ghi_chu || ""} 
                    disabled={isLocked} 
                    onChange={(e) => {
                      setDirtyGrades(true);
                      setTerm((p) => ({ ...p, ghi_chu: e.target.value }));
                    }}
                    placeholder="Nhận xét sự chuyên cần, thái độ học tập và rèn luyện của học sinh..."
                    className="w-full rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 resize-none disabled:opacity-60 transition-all shadow-2xs placeholder:text-[#454f46]/40 dark:placeholder:text-[#b8c2b4]/40" 
                  />
                </div>
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Bar when unsaved grades or attendance */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {(dirtyGrades || hasAttendanceChanges) && (
            <Motion.div 
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-[100] flex justify-center pointer-events-none px-3 sm:px-4"
            >
              <div className="pointer-events-auto bg-[#fffefa]/95 dark:bg-[#1e2821]/95 backdrop-blur-md rounded-2xl sm:rounded-full shadow-xl border border-[#dedfd4] dark:border-[#354237] px-3.5 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between sm:justify-start gap-2 sm:gap-3 max-w-lg w-auto">
                <span className="text-xs font-semibold text-[#454f46] dark:text-[#b8c2b4] flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-[#d6b883] animate-pulse shrink-0" />
                  <span className="hidden sm:inline">
                    {dirtyGrades && hasAttendanceChanges 
                      ? "Có thay đổi điểm & điểm danh chưa lưu" 
                      : dirtyGrades 
                      ? "Có thay đổi điểm số chưa lưu" 
                      : "Có thay đổi điểm danh chưa lưu"}
                  </span>
                  <span className="sm:hidden text-[11px] font-bold">Chưa lưu</span>
                </span>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={handleDiscardChanges}
                    disabled={savingGrades || savingAttendance}
                    className="px-2.5 py-1.5 rounded-xl bg-stone-500/10 hover:bg-stone-500/15 text-xs font-bold text-[#454f46] dark:text-[#b8c2b4] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 active:scale-95"
                    title="Hủy bỏ các thay đổi chưa lưu"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Hủy</span>
                  </button>

                  {hasAttendanceChanges && (
                    <button 
                      type="button" 
                      disabled={savingAttendance} 
                      onClick={requestSaveAttendance}
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 sm:px-3 rounded-xl text-xs font-bold bg-stone-500/10 hover:bg-stone-500/20 text-[#293d32] dark:text-[#ecece0] transition-colors cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                      {savingAttendance ? <Spinner className="h-3.5 w-3.5" /> : <Save className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">Lưu điểm danh</span>
                      <span className="sm:hidden">Điểm danh</span>
                    </button>
                  )}

                  {dirtyGrades && (
                    <button 
                      type="button" 
                      disabled={savingGrades} 
                      onClick={requestSaveGrades}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold bg-[#314e3e] hover:bg-[#263e32] text-white dark:bg-[#d6b883] dark:hover:bg-[#c9a76d] dark:text-[#19251d] shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      {savingGrades ? <Spinner className="h-3.5 w-3.5" /> : <Save className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">Lưu điểm & Đánh giá</span>
                      <span className="sm:hidden">Lưu điểm</span>
                    </button>
                  )}
                </div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Dialog xác nhận lưu điểm & đánh giá */}
      <ConfirmDialog
        open={confirmGradesOpen}
        icon={GraduationCap}
        title="Xác nhận lưu điểm & đánh giá?"
        confirmLabel="Xác nhận lưu"
        cancelLabel="Kiểm tra lại"
        loading={savingGrades}
        onConfirm={async () => {
          await saveGradesAndTerm();
          setConfirmGradesOpen(false);
        }}
        onCancel={() => !savingGrades && setConfirmGradesOpen(false)}
      >
        <div className="rounded-2xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="font-bold text-[#293d32] dark:text-[#ecece0] text-[13.5px] truncate">
                {student.tenThanh ? `${student.tenThanh} ` : ""}{student.hoTen}
              </p>
              <p className="text-[11px] text-[#454f46] dark:text-[#b8c2b4] font-medium">
                Lớp {lop} • {hocKy === "CN" ? "Tổng kết cả năm" : `Học kỳ ${hocKy === "HK1" ? "1" : "2"}`}
              </p>
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded-lg font-mono text-[11px] font-bold bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-[#454f46] dark:text-[#b8c2b4]">
              @{student.username}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-[11px] font-semibold text-[#454f46] dark:text-[#b8c2b4]">
              ĐTB: <strong className="text-[#314e3e] dark:text-[#d6b883] font-black">{calculatedAutoDTB !== null && calculatedAutoDTB !== undefined ? calculatedAutoDTB : "--"}</strong>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-[11px] font-semibold text-[#454f46] dark:text-[#b8c2b4]">
              Học lực: <strong className="text-[#293d32] dark:text-[#ecece0]">{term.hoc_luc ? formatHocLuc(term.hoc_luc) : "Chưa xếp"}</strong>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-[11px] font-semibold text-[#454f46] dark:text-[#b8c2b4]">
              Hạnh kiểm: <strong className="text-[#293d32] dark:text-[#ecece0]">{term.hanh_kiem ? formatHanhKiem(term.hanh_kiem) : "Chưa xếp"}</strong>
            </span>
            {term.vi_thu && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-[11px] font-semibold text-[#454f46] dark:text-[#b8c2b4]">
                Hạng: <strong className="text-[#293d32] dark:text-[#ecece0]">{term.vi_thu}</strong>
              </span>
            )}
          </div>

          {term.ghi_chu && (
            <p className="text-[11px] text-[#454f46] dark:text-[#b8c2b4] italic line-clamp-1 border-t border-[#dedfd4]/40 dark:border-[#354237]/40 pt-1.5">
              "{term.ghi_chu}"
            </p>
          )}
        </div>
      </ConfirmDialog>

      {/* Dialog xác nhận lưu điểm danh */}
      <ConfirmDialog
        open={confirmAttendanceOpen}
        icon={Calendar}
        title="Xác nhận lưu điểm danh?"
        confirmLabel="Xác nhận lưu"
        cancelLabel="Kiểm tra lại"
        loading={savingAttendance}
        onConfirm={async () => {
          await saveAttendance();
          setConfirmAttendanceOpen(false);
        }}
        onCancel={() => !savingAttendance && setConfirmAttendanceOpen(false)}
      >
        <div className="rounded-2xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="font-bold text-[#293d32] dark:text-[#ecece0] text-[13.5px] truncate">
                {student.tenThanh ? `${student.tenThanh} ` : ""}{student.hoTen}
              </p>
              <p className="text-[11px] text-[#454f46] dark:text-[#b8c2b4] font-medium">
                Lớp {lop} • {hocKy === "HK1" ? "Học kỳ 1" : "Học kỳ 2"}
              </p>
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-[#314e3e] dark:text-[#d6b883]">
              {Object.keys(attendanceOverrides).length} ngày điều chỉnh
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-0.5 max-h-[110px] overflow-y-auto" data-lenis-prevent>
            {Object.entries(attendanceOverrides).map(([isoDate, statusKey]) => {
              const status = ATTENDANCE_STATUS[statusKey] || { label: statusKey, color: "bg-stone-500" };
              const dateObj = new Date(isoDate);
              return (
                <span key={isoDate} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-[11px] font-medium">
                  <span className={`w-2 h-2 rounded-full ${status.color}`} />
                  <span className="font-mono text-[#293d32] dark:text-[#ecece0] font-semibold">{dateObj.getDate()}/{dateObj.getMonth() + 1}</span>
                  <span className="text-[#454f46] dark:text-[#b8c2b4]">({status.label})</span>
                </span>
              );
            })}
          </div>
        </div>
      </ConfirmDialog>
    </Motion.div>
  );
}

export default AcademicTab;
