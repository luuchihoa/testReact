import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { supabase } from "../../../lib/supabase.js";
import { ATTENDANCE_STATUS, StatCard, RANK_COLORS } from "../../../components/ui/StudentShared.jsx";
import { Spinner } from "../../../components/ui/Skeleton.jsx";
import { useTeacherContext } from "../TeacherContext.jsx";
import { fetchStudentAcademic, fetchClassTermRanges, fetchTermLocks } from "../api.js";
import { HK_INT_MAP, STATUS_CYCLE, GRADE_FIELDS, HOC_LUC_OPTIONS, HANH_KIEM_OPTIONS } from "../constants.js";

const APPLE_EASE = [0.16, 1, 0.3, 1];
const SLIDE_VARIANTS = {
  initial: (direction) => ({ x: direction > 0 ? 30 : -30, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction < 0 ? 30 : -30, opacity: 0 }),
};

function EditableScoreCell({ label, value, onChange, disabled }) {
  return (
    <div className="relative group flex-1 min-w-[64px] bg-white/50 dark:bg-stone-900/40 rounded-[16px] px-3 py-3 text-center border border-amber-900/10 dark:border-amber-100/10 shadow-sm focus-within:ring-2 focus-within:ring-amber-500/50 focus-within:bg-white dark:focus-within:bg-stone-800 transition-all">
      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-1">{label}</p>
      <input
        type="number" min="0" max="10" step="0.1" disabled={disabled}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className="w-full text-center text-[15px] font-bold text-amber-950 dark:text-amber-50 bg-transparent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-stone-300 dark:placeholder:text-stone-600"
        placeholder="--"
      />
    </div>
  );
}

function AcademicTab({ student, namHoc, lop, showToast, hocKy, hkDirection }) {
  const { isLocked: termLocked, checkLockAndWarn } = useTeacherContext();
  const hocKyInt = HK_INT_MAP[hocKy];

  const [loading, setLoading] = useState(true);
  const [grades,  setGrades]  = useState({});
  const [term,    setTerm]    = useState({});
  const [baseAttendance,      setBaseAttendance]      = useState({}); 
  const [attendanceOverrides, setAttendanceOverrides] = useState({}); 
  const [savingGrades,     setSavingGrades]     = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);

  const [classRanges, setClassRanges] = useState({ HK1: { start: null, sundays: [] }, HK2: { start: null, sundays: [] } });
  const [termLocks, setTermLocks] = useState({});
  
  const isLocked = !!termLocks[hocKyInt];

  const load = useCallback(async () => {
    setLoading(true);
    setAttendanceOverrides({});
    try {
      const [result, ranges, locks] = await Promise.all([
        fetchStudentAcademic(student.username, namHoc, hocKyInt),
        fetchClassTermRanges(lop, namHoc),
        fetchTermLocks(lop, namHoc),
      ]);
      setGrades(result.grades ?? {});
      setTerm(result.term ?? { username: student.username, nam_hoc: namHoc, lop, hoc_ky: hocKyInt });
      setClassRanges(ranges);
      setTermLocks(locks);

      const map = {};
      (result.attendanceExceptions ?? []).forEach(({ ngay, trang_thai }) => { map[ngay] = trang_thai; });
      setBaseAttendance(map);
    } catch (err) {
      console.error("load academic error:", err);
      showToast("Không tải được dữ liệu học tập", "error");
    } finally {
      setLoading(false);
    }
  }, [student.username, namHoc, hocKyInt, lop, showToast]);

  useEffect(() => { load(); }, [load]);

  const currentRange = classRanges[hocKy];

  const attendanceList = useMemo(() => {
    return (currentRange?.sundays ?? []).map((sunday) => {
      const isoDate   = sunday.toISOString().slice(0, 10);
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

  const saveGradesAndTerm = async () => {
    if (isLocked) return;
    setSavingGrades(true);
    try {
      if (hocKyInt === 0) {
        const yearPayload = {
          username: student.username, nam_hoc: namHoc, lop,
          diem_tb:      grades?.diem_tb   ?? null,
          hoc_luc:      term.hoc_luc      || null,
          hanh_kiem:    term.hanh_kiem    || null,
          vi_thu:       term.vi_thu ? Number(term.vi_thu) : null,
          ghi_chu:      term.ghi_chu      || "",
        };
        const { error: yearErr } = await supabase.from("year_summary")
          .upsert(yearPayload, { onConflict: "username,nam_hoc" });
        if (yearErr) throw yearErr;
      } else {
        const gradesPayload = {
          username: student.username, nam_hoc: namHoc, lop, hoc_ky: hocKyInt,
          diem_mieng:   grades.diem_mieng   ?? null,
          diem_vo:      grades.diem_vo      ?? null,
          diem_15_phut: grades.diem_15_phut ?? null,
          diem_1_tiet:  grades.diem_1_tiet  ?? null,
          diem_thi:     grades.diem_thi     ?? null,
          diem_tb:      grades.diem_tb      ?? null,
          ghi_chu:      grades.ghi_chu      ?? "",
          updated_at:   new Date().toISOString(),
        };
        const { error: gradesErr } = await supabase.from("grades")
          .upsert(gradesPayload, { onConflict: "username,nam_hoc,hoc_ky" });
        if (gradesErr) throw gradesErr;

        const termPayload = {
          username: student.username, nam_hoc: namHoc, lop, hoc_ky: hocKyInt,
          hoc_luc:      term.hoc_luc   || null,
          hanh_kiem:    term.hanh_kiem || null,
          vi_thu:       term.vi_thu ? Number(term.vi_thu) : null,
          ghi_chu:      term.ghi_chu || "",
        };
        const { error: termErr } = await supabase.from("term_summary")
          .upsert(termPayload, { onConflict: "username,nam_hoc,hoc_ky" });
        if (termErr) throw termErr;
      }

      showToast("Đã lưu điểm & tổng kết", "success");
    } catch (err) {
      console.error("saveGradesAndTerm error:", err);
      showToast("Lưu điểm thất bại", "error");
    } finally {
      setSavingGrades(false);
    }
  };

  const saveAttendance = async () => {
    if (isLocked) return;
    const changedDates = Object.keys(attendanceOverrides);
    if (changedDates.length === 0) { showToast("Không có thay đổi", "warning"); return; }

    setSavingAttendance(true);
    try {
      const rows = changedDates.map((isoDate) => ({
        username: student.username, nam_hoc: namHoc, hoc_ky: hocKyInt,
        ngay: isoDate, trang_thai: attendanceOverrides[isoDate],
      }));
      const { error } = await supabase.from("attendance")
        .upsert(rows, { onConflict: "username,nam_hoc,hoc_ky,ngay" });
      if (error) throw error;

      setBaseAttendance((prev) => ({ ...prev, ...attendanceOverrides }));
      setAttendanceOverrides({});
      showToast("Đã lưu điểm danh", "success");
    } catch (err) {
      console.error("saveAttendance error:", err);
      showToast("Lưu điểm danh thất bại", "error");
    } finally {
      setSavingAttendance(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: APPLE_EASE }} className="flex flex-col gap-6">
      
      <AnimatePresence mode="wait" custom={hkDirection}>
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3 py-20 text-amber-900 dark:text-amber-500"
          >
            <Spinner className="h-6 w-6" />
            <span className="text-[14px] font-medium font-sans">Đang tải dữ liệu học tập…</span>
          </motion.div>
        ) : (
          <motion.div
            key={hocKy}
            custom={hkDirection}
            variants={SLIDE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: APPLE_EASE }}
            className="flex flex-col gap-6"
          >
            {isLocked && (
            <div className="flex items-start gap-3 px-5 py-3.5 rounded-2xl bg-stone-100/80 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-750">
              <AlertCircle className="w-5 h-5 text-stone-500 flex-shrink-0" />
              <span className="text-[13px] font-medium text-stone-600 dark:text-stone-300 leading-relaxed">
                Học kỳ này đã được Admin khóa sổ. Điểm, điểm danh và tổng kết chỉ xem được, không sửa được cho đến khi mở khóa lại.
              </span>
            </div>
          )}

      {/* THỐNG KÊ TỔNG QUAN */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Điểm TB" value={grades?.diem_tb} colorClass="text-amber-900 dark:text-amber-400" />
        <StatCard label="Học lực" value={term?.hoc_luc} colorClass={RANK_COLORS.hoc_luc[term?.hoc_luc] || "text-amber-900 dark:text-amber-400"} />
        <StatCard label="Hạnh kiểm" value={term?.hanh_kiem} colorClass={RANK_COLORS.hanh_kiem[term?.hanh_kiem] || "text-amber-900 dark:text-amber-400"} />
        <StatCard label="Vị thứ" value={term?.vi_thu ? `${term.vi_thu}` : null} colorClass="text-amber-900 dark:text-amber-400" />
      </div>

      {hocKy !== "CN" && (
        <>
          {/* BẢNG ĐIỂM */}
          <div className={`bg-white/80 dark:bg-stone-800/40 backdrop-blur-sm rounded-[24px] border border-amber-900/10 dark:border-amber-100/10 p-5 shadow-sm ${isLocked ? "opacity-70" : ""}`}>
        <h3 className="text-[14px] font-bold uppercase tracking-wider text-amber-950 dark:text-amber-50 mb-4 flex items-center gap-2"><span>📊</span> Bảng điểm</h3>
        <div className="flex gap-2 sm:gap-3 overflow-x-auto p-1 pb-3 md:pb-1 scrollbar-hide" data-lenis-prevent>
          {GRADE_FIELDS.map((f) => (
            <EditableScoreCell key={f.key} label={f.label} value={grades[f.key]} disabled={isLocked}
              onChange={(v) => setGrades((prev) => ({ ...prev, [f.key]: v }))} />
          ))}
        </div>
      </div>

      {/* ĐIỂM DANH */}
      <div className={`bg-white/80 dark:bg-stone-800/40 backdrop-blur-sm rounded-[24px] border border-amber-900/10 dark:border-amber-100/10 p-5 shadow-sm ${isLocked ? "opacity-70" : ""}`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[14px] font-bold uppercase tracking-wider text-amber-950 dark:text-amber-50 flex items-center gap-2">
            <span>🗓️</span> Điểm danh <span className="text-stone-400 font-semibold tracking-normal normal-case ml-1">({totalCount} tuần)</span>
          </h3>
          <button type="button" disabled={isLocked || savingAttendance || Object.keys(attendanceOverrides).length === 0} onClick={saveAttendance}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-md transition-all duration-300 active:scale-[0.98] hover:opacity-90 disabled:opacity-40 whitespace-nowrap">
            {savingAttendance && <Spinner className="h-4 w-4" />}
            {savingAttendance ? "Đang lưu…" : "Lưu điểm danh"}
          </button>
        </div>

        {/* Thanh chuyên cần */}
        {totalCount > 0 && (
          <div className="mb-5">
            <div className="flex justify-between text-[11px] font-bold text-stone-500 dark:text-stone-400 mb-1.5">
              <span>Chuyên cần</span>
              <span>{attendanceRate}%</span>
            </div>
            <div className="h-2 w-full bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden shadow-inner flex">
              <motion.div 
                initial={{ width: 0 }} animate={{ width: `${attendanceRate}%` }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="h-full bg-emerald-500 dark:bg-emerald-400"
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-5 text-[12px] font-bold text-stone-500 dark:text-stone-400">
          {Object.entries(ATTENDANCE_STATUS).filter(([k]) => k !== "null").map(([k, v]) => (
            <span key={k} className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded-full shadow-inner ${v.color}`} />{v.label}</span>
          ))}
        </div>

        {totalCount === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-stone-300 dark:text-stone-600">
            <span className="text-4xl opacity-50">🗓️</span>
            <p className="text-[13px] font-semibold text-stone-400 dark:text-stone-500">Chưa có lịch điểm danh cho học kỳ này.</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-thin">
            {attendanceList.map(({ date, isoDate, trangThai }) => {
              const status  = ATTENDANCE_STATUS[trangThai];
              const isDirty = isoDate in attendanceOverrides;
              return (
                <button key={isoDate} type="button" disabled={isLocked} onClick={() => cycleStatus(isoDate, trangThai)}
                  className="flex flex-col items-center gap-2 flex-shrink-0 w-12 group disabled:cursor-not-allowed transition-transform active:scale-[0.9]">
                  <span className={`w-9 h-9 rounded-full shadow-inner ${status.color} ring-2 ring-white dark:ring-[#1C1917] ${isDirty ? "ring-amber-400 dark:ring-amber-500" : ""} flex items-center justify-center transition-all duration-300 md:group-hover:scale-110`}>
                    <span className={`text-[12px] font-extrabold ${trangThai === "co_mat" ? "text-emerald-950 dark:text-emerald-50" : "text-white"}`}>{date.getDate()}</span>
                  </span>
                  <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 whitespace-nowrap">{date.getDate()}/{date.getMonth() + 1}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-amber-900/10 dark:border-amber-100/10 flex justify-between text-[13px] font-bold text-stone-500 dark:text-stone-400">
          <span>Có mặt: <span className="text-emerald-600 dark:text-emerald-400">{presentCount}</span></span>
          <span>Tổng nghỉ: <span className="text-amber-950 dark:text-amber-50">{totalCount - presentCount}</span></span>
        </div>
      </div>
      </>
      )}

      {/* TỔNG KẾT HỌC KỲ */}
      <div className={`bg-white/80 dark:bg-stone-800/40 backdrop-blur-sm rounded-[24px] border border-amber-900/10 dark:border-amber-100/10 p-5 shadow-sm relative overflow-hidden ${isLocked ? "opacity-70" : ""}`}>
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between mb-5 sm:mb-7 gap-3 sm:gap-4">
          <h3 className="text-[14px] font-bold uppercase tracking-wider text-amber-950 dark:text-amber-50 flex items-center gap-2">
            <span>📝</span> {hocKy === "CN" ? "Tổng kết cả năm" : "Tổng kết học kỳ"}
          </h3>
          <button type="button" disabled={isLocked || savingGrades} onClick={saveGradesAndTerm}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl text-[13px] sm:text-[14px] font-bold bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-md transition-all duration-300 active:scale-[0.98] md:hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed w-full md:w-auto">
            {savingGrades && <Spinner className="h-4 w-4" />}
            {savingGrades ? "Đang lưu…" : "Lưu điểm & tổng kết"}
          </button>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
          <label className="flex flex-col gap-1 sm:gap-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Học lực</span>
            <div className="relative">
              <select value={term.hoc_luc || ""} disabled={isLocked} onChange={(e) => setTerm((p) => ({ ...p, hoc_luc: e.target.value }))}
                className="w-full appearance-none rounded-xl border border-stone-200/60 dark:border-stone-700/50 bg-white/80 dark:bg-stone-900/80 text-amber-950 dark:text-amber-50 px-3 py-2.5 sm:px-4 sm:py-3.5 text-[14px] sm:text-[15px] font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-60 transition-all shadow-sm">
                <option value="">— Chưa chọn —</option>
                {HOC_LUC_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 dark:text-stone-500 text-[10px]">▼</div>
            </div>
          </label>

          <label className="flex flex-col gap-1 sm:gap-2">
             <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Hạnh kiểm</span>
             <div className="relative">
              <select value={term.hanh_kiem || ""} disabled={isLocked} onChange={(e) => setTerm((p) => ({ ...p, hanh_kiem: e.target.value }))}
                className="w-full appearance-none rounded-xl border border-stone-200/60 dark:border-stone-700/50 bg-white/80 dark:bg-stone-900/80 text-amber-950 dark:text-amber-50 px-3 py-2.5 sm:px-4 sm:py-3.5 text-[14px] sm:text-[15px] font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-60 transition-all shadow-sm">
                <option value="">— Chưa chọn —</option>
                {HANH_KIEM_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 dark:text-stone-500 text-[10px]">▼</div>
            </div>
          </label>

          <label className="flex flex-col gap-1 sm:gap-2">
             <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Vị thứ</span>
            <input type="number" min="1" value={term.vi_thu ?? ""} disabled={isLocked} onChange={(e) => setTerm((p) => ({ ...p, vi_thu: e.target.value }))}
              placeholder="--"
              className="rounded-xl border border-stone-200/60 dark:border-stone-700/50 bg-white/80 dark:bg-stone-900/80 text-amber-950 dark:text-amber-50 px-3 py-2.5 sm:px-4 sm:py-3.5 text-[14px] sm:text-[15px] font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-60 transition-all shadow-sm placeholder:text-stone-300 dark:placeholder:text-stone-600" />
          </label>

          <label className="flex flex-col gap-1 sm:gap-2 sm:col-span-3">
             <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Ghi chú</span>
            <textarea rows={2} value={term.ghi_chu || ""} disabled={isLocked} onChange={(e) => setTerm((p) => ({ ...p, ghi_chu: e.target.value }))}
              placeholder="Nhập nhận xét hoặc ghi chú..."
              className="rounded-xl border border-stone-200/60 dark:border-stone-700/50 bg-white/80 dark:bg-stone-900/80 text-amber-950 dark:text-amber-50 px-3 py-2.5 sm:px-4 sm:py-3.5 text-[13px] sm:text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none disabled:opacity-60 transition-all shadow-sm placeholder:text-stone-300 dark:placeholder:text-stone-600" />
          </label>
        </div>
      </div>
        </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default AcademicTab;
