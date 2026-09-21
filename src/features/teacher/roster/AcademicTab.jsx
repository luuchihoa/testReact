/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { 
  AlertCircle, Save, Calendar, BarChart2,
  Sparkles, GraduationCap, RotateCcw 
} from "lucide-react";
import { createPortal } from "react-dom";
import { StatCard, ConfirmDialog } from "../../../components/ui/StudentShared.jsx";
import { ATTENDANCE_STATUS, RANK_COLORS, formatHocLuc, formatHanhKiem } from "../../../components/ui/studentSharedUtils.js";
import { Spinner } from "../../../components/ui/Skeleton.jsx";
import { 
  fetchStudentAcademic, fetchClassTermRanges, fetchTermLocks, fetchAcademicHolidays,
  saveStudentGrades, saveStudentTermSummary, saveStudentYearSummary 
} from "../api.js";
import { buildSundayList, getDefaultTermRanges, parseISODate, toISODate } from "../utils.js";
import { HK_INT_MAP, GRADE_FIELDS, HOC_LUC_OPTIONS, HANH_KIEM_OPTIONS } from "../constants.js";

const SCORE_INPUT_FIELDS = GRADE_FIELDS.filter((f) => f.key !== "diem_tb");

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
  const parts = [
    { v: g.diem_mieng,   w: 1 },
    { v: g.diem_vo,      w: 1 },
    { v: g.diem_15_phut, w: 1 },
    { v: g.diem_1_tiet,  w: 2 },
    { v: g.diem_thi,     w: 3 },
  ];
  const hasAll = parts.every((p) => p.v !== null && p.v !== undefined && p.v !== "" && !isNaN(Number(p.v)));
  if (!hasAll) return null;
  const totalWeight = parts.reduce((s, p) => s + p.w, 0); // 8
  const totalScore  = parts.reduce((s, p) => s + Number(p.v) * p.w, 0);
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
      <p className="text-xs font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4] mb-1 truncate">{label}</p>
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
  const [attendanceData, setAttendanceData] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [savingGrades, setSavingGrades] = useState(false);
  const [dirtyGrades, setDirtyGrades] = useState(false);
  const [confirmGradesOpen, setConfirmGradesOpen] = useState(false);

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

  const handleDiscardChanges = () => {
    const cached = cache[cacheKey];
    if (cached) {
      setGrades(cached.grades ? { ...cached.grades } : {});
      setTerm(cached.term ? { ...cached.term } : { username: student.username, nam_hoc: namHoc, lop, hoc_ky: hocKyInt });
    } else {
      setGrades({});
      setTerm({ username: student.username, nam_hoc: namHoc, lop, hoc_ky: hocKyInt });
    }
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
      setAttendanceData(cached.attendanceData ?? []);
      setHolidays(cached.holidays ?? []);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setDirtyGrades(false);
      try {
        const promises = [
          fetchStudentAcademic(student.username, namHoc, hocKyInt),
          fetchClassTermRanges(lop, namHoc),
          fetchTermLocks(lop, namHoc),
          fetchAcademicHolidays(namHoc),
        ];

        if (hocKy === "CN") {
          promises.push(fetchStudentAcademic(student.username, namHoc, 1));
          promises.push(fetchStudentAcademic(student.username, namHoc, 2));
        }

        const [result, ranges, locks, holidaysData, hk1Res, hk2Res] = await Promise.all(promises);
        if (cancelled) return;

        const resGrades = result.grades ?? {};
        const resTerm = result.term ?? { username: student.username, nam_hoc: namHoc, lop, hoc_ky: hocKyInt };
        const resAttendance = result.attendanceExceptions ?? [];

        setGrades(resGrades);
        setTerm(resTerm);
        setClassRanges(ranges);
        setTermLocks(locks);
        setHolidays(holidaysData ?? []);
        if (hk1Res) setHk1Academic(hk1Res);
        if (hk2Res) setHk2Academic(hk2Res);
        setAttendanceData(resAttendance);

        // Store into cache
        setCache((prev) => ({
          ...prev,
          [cacheKey]: {
            grades: resGrades,
            term: resTerm,
            classRanges: ranges,
            termLocks: locks,
            holidays: holidaysData ?? [],
            hk1Academic: hk1Res ?? null,
            hk2Academic: hk2Res ?? null,
            attendanceData: resAttendance
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

  const currentSemesterKey = hocKyInt === 2 ? "HK2" : "HK1";

  const attendanceList = useMemo(() => {
    if (hocKy === "CN") return [];

    let sundays = [];
    if (classRanges?.[currentSemesterKey]?.sundays?.length) {
      sundays = classRanges[currentSemesterKey].sundays;
    } else {
      const fallback = getDefaultTermRanges(namHoc)[currentSemesterKey];
      sundays = fallback?.sundays ?? [];
    }

    const exceptionMap = new Map(
      (attendanceData ?? []).map(({ ngay, trang_thai }) => [toISODate(ngay), trang_thai])
    );

    const holidayMap = new Map(
      (holidays ?? [])
        .filter((h) => !h.hoc_ky || Number(h.hoc_ky) === Number(hocKyInt))
        .map((h) => [toISODate(h.ngay), h])
    );

    const todayIso = toISODate(new Date());

    // 1. Ánh xạ danh sách các ngày Chúa Nhật chuẩn từ khung lịch trung tâm
    const list = sundays.map((sDate) => {
      const dateObj = typeof sDate === "string" ? parseISODate(sDate) : (sDate instanceof Date ? sDate : new Date(sDate));
      const isoDate = toISODate(dateObj);
      const holiday = holidayMap.get(isoDate);
      const isPastOrToday = isoDate <= todayIso;

      let trang_thai = "null";
      if (exceptionMap.has(isoDate)) {
        trang_thai = exceptionMap.get(isoDate);
      } else if (holiday && isPastOrToday) {
        trang_thai = "nghi_le";
      }

      return {
        date: dateObj,
        isoDate,
        trang_thai,
        isPastOrToday,
        holidayName: holiday?.ten_ngay_le || "",
      };
    });

    // 2. Bổ sung các ngày nghỉ từ academic_holidays nếu không trùng với các ngày Chúa Nhật đã tạo
    const existingIsoDates = new Set(list.map((item) => item.isoDate));
    (holidays ?? []).forEach((h) => {
      if (h.ngay && (!h.hoc_ky || Number(h.hoc_ky) === Number(hocKyInt))) {
        const iso = toISODate(h.ngay);
        if (iso && !existingIsoDates.has(iso)) {
          const d = parseISODate(h.ngay);
          if (!isNaN(d.getTime())) {
            const isPastOrToday = iso <= todayIso;
            let trang_thai = "null";
            if (exceptionMap.has(iso)) {
              trang_thai = exceptionMap.get(iso);
            } else if (isPastOrToday) {
              trang_thai = "nghi_le";
            }
            list.push({
              date: d,
              isoDate: iso,
              trang_thai,
              isPastOrToday,
              holidayName: h.ten_ngay_le || "Ngày nghỉ lễ",
            });
            existingIsoDates.add(iso);
          }
        }
      }
    });

    // 3. Bổ sung các ngày điểm danh bất thường khác (nếu có bản ghi trong DB ngoài danh sách)
    (attendanceData ?? []).forEach(({ ngay, trang_thai }) => {
      if (ngay) {
        const iso = toISODate(ngay);
        if (iso && !existingIsoDates.has(iso)) {
          const d = parseISODate(ngay);
          if (!isNaN(d.getTime())) {
            const holiday = holidayMap.get(iso);
            const isPastOrToday = iso <= todayIso;
            list.push({
              date: d,
              isoDate: iso,
              trang_thai: trang_thai || (holiday && isPastOrToday ? "nghi_le" : "null"),
              isPastOrToday,
              holidayName: holiday?.ten_ngay_le || "",
            });
            existingIsoDates.add(iso);
          }
        }
      }
    });

    // Sắp xếp thứ tự thời gian tăng dần tuyệt đối theo chuỗi ngày ISO (YYYY-MM-DD)
    list.sort((a, b) => a.isoDate.localeCompare(b.isoDate));
    return list;
  }, [classRanges, currentSemesterKey, hocKyInt, namHoc, attendanceData, holidays, hocKy]);

  // Thống kê chuyên cần
  const attendanceCounts = useMemo(() => {
    const counts = { co_mat: 0, nghi_khong_phep: 0, nghi_phep: 0, nghi_le: 0, chua_cap_nhat: 0 };
    attendanceList.forEach(({ trang_thai }) => { 
      if (trang_thai === "co_mat") counts.co_mat++;
      else if (trang_thai === "nghi_khong_phep") counts.nghi_khong_phep++; 
      else if (trang_thai === "nghi_phep") counts.nghi_phep++; 
      else if (trang_thai === "nghi_le" || trang_thai === "le_trong") counts.nghi_le++;
      else counts.chua_cap_nhat++;
    });
    counts.tong_nghi = counts.nghi_khong_phep + counts.nghi_phep;
    counts.tong_da_diem_danh = counts.co_mat + counts.nghi_phep + counts.nghi_khong_phep + counts.nghi_le;
    return counts;
  }, [attendanceList]);

  const totalWeeks = attendanceList.length;
  const recordedCount = attendanceCounts.tong_da_diem_danh;
  const validPresentCount = attendanceCounts.co_mat + attendanceCounts.nghi_le;
  const attendanceRate = recordedCount > 0 
    ? Math.max(0, Math.min(100, Math.round((validPresentCount / recordedCount) * 100))) 
    : 0;
  const rateDisplay = recordedCount > 0 ? `${attendanceRate}%` : "—";

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

  const calculatedAutoDTB = useMemo(() => calculateAutoDTB(grades), [grades]);

  return (
    <Motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.3, ease: APPLE_EASE }} 
      className="flex flex-col gap-6"
    >
      {/* ACADEMIC HEADER: Title & Semester Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#dedfd4]/60 dark:border-[#354237]/60">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#314e3e]/10 dark:bg-[#d6b883]/15 flex items-center justify-center text-[#314e3e] dark:text-[#d6b883] border border-[#dedfd4] dark:border-[#354237] shrink-0">
            <GraduationCap className="w-5 h-5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-[#293d32] dark:text-[#ecece0] truncate leading-tight">
              Sổ điểm & Điểm danh chuyên cần
            </h3>
            <p className="text-xs font-medium text-[#454f46] dark:text-[#b8c2b4] mt-0.5">
              Lớp {lop} • Niên khóa {namHoc}
            </p>
          </div>
        </div>

        {/* Segmented Selector Học kỳ */}
        <div className="w-full sm:w-auto shrink-0">
          <div className="grid grid-cols-3 gap-1 bg-[#dedfd4]/40 dark:bg-[#354237]/50 p-1 rounded-2xl border border-[#dedfd4] dark:border-[#354237] select-none text-xs sm:text-sm font-bold">
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
                      <tr className="border-b border-[#dedfd4] dark:border-[#354237] text-[#454f46] dark:text-[#b8c2b4] uppercase font-bold text-xs">
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
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4] flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" strokeWidth={2} /> 
                      <span>Bảng điểm kiểm tra</span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {SCORE_INPUT_FIELDS.map((f) => (
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

                {/* 4. THEO DÕI CHUYÊN CẦN */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4] flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" strokeWidth={2} />
                      <span>Theo dõi chuyên cần</span>
                    </h4>
                    <span className="text-xs text-[#575e55] dark:text-[#b0b9ac] font-medium">
                      {recordedCount > 0 ? `${recordedCount}/${totalWeeks} buổi đã điểm danh` : "Chưa có buổi điểm danh"}
                    </span>
                  </div>

                  {/* Thanh tỉ lệ chuyên cần */}
                  {totalWeeks > 0 && (
                    <div>
                      <div className="flex justify-between text-xs font-bold text-[#575e55] dark:text-[#b0b9ac] mb-1.5">
                        <span>Tỷ lệ chuyên cần</span>
                        <span className="text-[#314e3e] dark:text-[#d6b883] font-black">{rateDisplay}</span>
                      </div>
                      <div className="h-2.5 w-full bg-[#dedfd4] dark:bg-[#354237] rounded-full overflow-hidden flex">
                        <Motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${attendanceRate}%` }} 
                          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                          className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Chú thích trạng thái */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs font-medium text-[#575e55] dark:text-[#b0b9ac]">
                    {Object.entries(ATTENDANCE_STATUS).filter(([k]) => k !== "null").map(([k, v]) => (
                      <span key={k} className="inline-flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${v.color}`} />
                        <span>{v.label}</span>
                      </span>
                    ))}
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-stone-300 dark:bg-stone-600 border border-dashed border-stone-400" />
                      <span>Chưa điểm danh</span>
                    </span>
                  </div>

                  {/* Timeline danh sách các buổi học */}
                  {attendanceList.length > 0 ? (
                    <div className="w-full min-w-0 overflow-hidden">
                      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin" data-lenis-prevent>
                        {attendanceList.map(({ date, isoDate, trang_thai, holidayName }) => {
                          const isRecorded = trang_thai && trang_thai !== "null";
                          const status = ATTENDANCE_STATUS[trang_thai] ?? ATTENDANCE_STATUS["null"];
                          const isHoliday = trang_thai === "nghi_le" || trang_thai === "le_trong" || Boolean(holidayName);
                          const statusSymbol = 
                            trang_thai === "co_mat" ? "✓" :
                            trang_thai === "nghi_phep" ? "P" :
                            trang_thai === "nghi_khong_phep" ? "K" :
                            isHoliday ? "✝" : "—";

                          const badgeClass = isRecorded
                            ? `${status.color} text-white font-black`
                            : isHoliday
                              ? "bg-blue-50/70 dark:bg-blue-950/40 border border-blue-400/80 dark:border-blue-500/80 text-blue-700 dark:text-blue-300 font-bold"
                              : "bg-stone-100 dark:bg-stone-800/80 border border-dashed border-stone-300 dark:border-stone-600 text-[#575e55] dark:text-[#b0b9ac] font-bold";

                          const tooltipTitle = holidayName
                            ? (isRecorded
                                ? `${holidayName} (${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}) - Đã nghỉ lễ`
                                : `${holidayName} (${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}) - Sắp nghỉ lễ`)
                            : `${status.label} - ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

                          return (
                            <div key={isoDate} className="flex flex-col items-center gap-1 shrink-0 w-10 sm:w-11">
                              <span 
                                className={`w-8 h-8 rounded-full shadow-2xs ${badgeClass} flex items-center justify-center text-xs leading-none transition-transform hover:scale-105`} 
                                title={tooltipTitle}
                              >
                                {statusSymbol}
                              </span>
                              <span className="text-xs font-bold text-[#575e55] dark:text-[#b0b9ac] whitespace-nowrap">
                                {date.getDate()}/{date.getMonth() + 1}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 py-6 text-[#575e55] dark:text-[#b0b9ac]">
                      <Calendar className="w-8 h-8 opacity-40" />
                      <p className="text-xs font-semibold">Chưa có lịch điểm danh cho học kỳ này.</p>
                    </div>
                  )}

                  {/* Thống kê chi tiết chuyên cần */}
                  <div className="pt-2.5 border-t border-[#dedfd4] dark:border-[#354237] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold text-[#575e55] dark:text-[#b0b9ac]">
                    <div>Có mặt: <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{attendanceCounts.co_mat}</span></div>
                    <div>Nghỉ phép: <span className="text-[#713f12] dark:text-[#fde047] font-extrabold">{attendanceCounts.nghi_phep}</span></div>
                    <div>Không phép: <span className="text-[#7f1d1d] dark:text-[#fca5a5] font-extrabold">{attendanceCounts.nghi_khong_phep}</span></div>
                    <div>Đã điểm danh: <span className="text-[#293d32] dark:text-[#ecece0] font-extrabold">{recordedCount}/{totalWeeks}</span></div>
                  </div>
                </div>
              </>
            )}

            <div className="border-t border-[#dedfd4]/60 dark:border-[#354237]/60" />

            {/* 5. TỔNG KẾT HỌC KỲ / CẢ NĂM */}
            <div className={`space-y-3 ${isLocked ? "opacity-75" : ""}`}>
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4] flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" strokeWidth={2} />
                  <span>{hocKy === "CN" ? "Tổng kết cả năm" : "Đánh giá & Tổng kết học kỳ"}</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 bg-[#fffefa] dark:bg-[#1e2821] p-4 sm:p-5 rounded-2xl border border-[#dedfd4] dark:border-[#354237] shadow-xs">
                
                {/* 1. Học lực (Chip Selector) */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4]">
                      Học lực
                    </span>
                    {term.hoc_luc && (
                      <span className="text-xs font-bold text-[#314e3e] dark:text-[#d6b883]">
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
                    <span className="text-xs font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4]">
                      Hạnh kiểm
                    </span>
                    {term.hanh_kiem && (
                      <span className="text-xs font-bold text-[#314e3e] dark:text-[#d6b883]">
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
                  <span className="text-xs font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4]">
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
                  <span className="text-xs font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4]">
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
                    placeholder="Nhận xét sự chuyên cần, thái độ học tập và rèn luyện của giáo lý sinh..."
                    className="w-full rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 resize-none disabled:opacity-60 transition-all shadow-2xs placeholder:text-[#454f46]/40 dark:placeholder:text-[#b8c2b4]/40" 
                  />
                </div>
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Bar when unsaved grades */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {dirtyGrades && (
            <Motion.div 
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-3 sm:bottom-6 pb-[max(0.5rem,env(safe-area-inset-bottom))] left-0 right-0 z-[100] flex justify-center pointer-events-none px-3 sm:px-4"
            >
              <div className="pointer-events-auto bg-[#fffefa]/95 dark:bg-[#1e2821]/95 backdrop-blur-md rounded-2xl sm:rounded-full shadow-xl border border-[#dedfd4] dark:border-[#354237] px-3.5 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between sm:justify-start gap-2 sm:gap-3 max-w-lg w-auto">
                <span className="text-xs font-semibold text-[#454f46] dark:text-[#b8c2b4] flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-[#d6b883] animate-pulse shrink-0" />
                  <span className="hidden sm:inline">Có thay đổi chưa lưu</span>
                  <span className="sm:hidden text-xs font-bold">Chưa lưu</span>
                </span>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={handleDiscardChanges}
                    disabled={savingGrades}
                    className="px-2.5 py-1.5 rounded-xl bg-stone-500/10 hover:bg-stone-500/15 text-xs font-bold text-[#454f46] dark:text-[#b8c2b4] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 active:scale-95"
                    title="Hủy bỏ các thay đổi chưa lưu"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Hủy</span>
                  </button>

                  <button 
                    type="button" 
                    disabled={savingGrades} 
                    onClick={requestSaveGrades}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold bg-[#314e3e] hover:bg-[#263e32] text-white dark:bg-[#d6b883] dark:hover:bg-[#c9a76d] dark:text-[#19251d] shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    {savingGrades ? <Spinner className="h-3.5 w-3.5" /> : <Save className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">Lưu thay đổi</span>
                    <span className="sm:hidden">Lưu</span>
                  </button>
                </div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Dialog xác nhận lưu thay đổi */}
      <ConfirmDialog
        open={confirmGradesOpen}
        icon={GraduationCap}
        title="Xác nhận lưu thay đổi?"
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
              <p className="font-bold text-[#293d32] dark:text-[#ecece0] text-sm sm:text-base truncate">
                {student.tenThanh ? `${student.tenThanh} ` : ""}{student.hoTen}
              </p>
              <p className="text-xs text-[#454f46] dark:text-[#b8c2b4] font-medium">
                Lớp {lop} • {hocKy === "CN" ? "Tổng kết cả năm" : `Học kỳ ${hocKy === "HK1" ? "1" : "2"}`}
              </p>
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded-lg font-mono text-xs font-bold bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-[#454f46] dark:text-[#b8c2b4]">
              @{student.username}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-xs font-semibold text-[#454f46] dark:text-[#b8c2b4]">
              ĐTB: <strong className="text-[#314e3e] dark:text-[#d6b883] font-black">{calculatedAutoDTB !== null && calculatedAutoDTB !== undefined ? calculatedAutoDTB : "--"}</strong>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-xs font-semibold text-[#454f46] dark:text-[#b8c2b4]">
              Học lực: <strong className="text-[#293d32] dark:text-[#ecece0]">{term.hoc_luc ? formatHocLuc(term.hoc_luc) : "Chưa xếp"}</strong>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-xs font-semibold text-[#454f46] dark:text-[#b8c2b4]">
              Hạnh kiểm: <strong className="text-[#293d32] dark:text-[#ecece0]">{term.hanh_kiem ? formatHanhKiem(term.hanh_kiem) : "Chưa xếp"}</strong>
            </span>
            {term.vi_thu && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-xs font-semibold text-[#454f46] dark:text-[#b8c2b4]">
                Hạng: <strong className="text-[#293d32] dark:text-[#ecece0]">{term.vi_thu}</strong>
              </span>
            )}
          </div>

          {term.ghi_chu && (
            <p className="text-xs text-[#454f46] dark:text-[#b8c2b4] italic line-clamp-1 border-t border-[#dedfd4]/40 dark:border-[#354237]/40 pt-1.5">
              "{term.ghi_chu}"
            </p>
          )}
        </div>
      </ConfirmDialog>
    </Motion.div>
  );
}

export default AcademicTab;
