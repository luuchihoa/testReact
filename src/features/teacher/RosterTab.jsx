import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ClipboardList, X, ArrowLeft, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../../components/ui/ToastContext.jsx";
import { FieldRow, ATTENDANCE_STATUS, transferDateForView, denormalizeStudent, } from "../../components/ui/StudentShared.jsx";
import { Spinner } from "../../components/ui/Skeleton.jsx";
import { useTeacherContext } from "./TeacherContext.jsx";
import { fetchStudentAcademic, fetchClassTermRanges, fetchTermLocks } from "./api.js";
import { HK_INT_MAP, STATUS_CYCLE, GRADE_FIELDS, HOC_LUC_OPTIONS, HANH_KIEM_OPTIONS } from "./constants.js";

// Hằng số Easing chuẩn của Design System
const APPLE_EASE = [0.16, 1, 0.3, 1];

const SLIDE_VARIANTS = {
  initial: (direction) => ({ x: direction > 0 ? 30 : -30, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction < 0 ? 30 : -30, opacity: 0 }),
};

/* ============================================================
   STUDENT LIST PANEL
   ============================================================ */
function StudentListPanel({ students, loading, search, setSearch, selectedUsername, onSelect }) {
  return (
    <div className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm overflow-hidden flex flex-col max-h-[75vh] lg:max-h-[calc(100vh-180px)] min-h-0">
      <div className="p-5 border-b border-amber-900/10 dark:border-amber-100/10">
        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-amber-950 dark:text-amber-50 font-serif">Danh sách lớp</h2>
          <p className="text-[13px] text-stone-500 dark:text-stone-400 font-medium mt-0.5">{students?.length || 0} học sinh</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên hoặc username…"
            className="w-full rounded-2xl border border-amber-900/10 dark:border-amber-100/10 bg-stone-50/50 dark:bg-stone-900/50 pl-11 pr-4 py-2.5 text-[14px] font-medium text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-600/30 dark:focus:ring-amber-500/30 transition-shadow shadow-inner"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto" data-lenis-prevent>
        {loading && (
          <div className="flex items-center justify-center gap-3 py-16 text-amber-800 dark:text-amber-500 text-[14px] font-medium">
            <Spinner className="h-5 w-5" /> Đang tải danh sách…
          </div>
        )}

        {!loading && students.length === 0 && (
          <p className="text-center text-[14px] text-stone-500 dark:text-stone-400 py-16 px-4">Không tìm thấy học sinh nào.</p>
        )}

        <div className="divide-y divide-amber-900/5 dark:divide-amber-100/5">
          {!loading && students?.map((s) => {
            const active = s.username === selectedUsername;
            return (
              <button key={s.username} type="button" onClick={() => onSelect(s.username)}
                className={`flex w-full items-center gap-3.5 px-5 py-4 text-left transition-colors duration-300 ${
                  active ? "bg-amber-50/70 dark:bg-amber-900/20" : "hover:bg-stone-50 dark:hover:bg-stone-800/50"
                }`}
              >
                <div className={`w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0 transition-colors ${active ? "border-amber-600/30 dark:border-amber-400/30 shadow-sm" : "border-white dark:border-stone-800 bg-stone-100"}`}>
                  <img src={s.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-[14px] font-bold truncate transition-colors ${active ? "text-amber-950 dark:text-amber-400" : "text-stone-800 dark:text-stone-200"}`}>
                    {s.tenThanh ? <span className="font-medium text-stone-500 mr-1">{s.tenThanh}</span> : ""}{s.hoTen || s.username}
                  </p>
                  <p className="text-[12px] text-stone-400 dark:text-stone-500 truncate mt-0.5">{s.username}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PROFILE TAB
   ============================================================ */
function ProfileTab({ student, onSaved, showToast }) {
  const [form,         setForm]         = useState(student);
  const [editingField, setEditingField] = useState(null);
  const [tempValue,    setTempValue]    = useState("");
  const [saving,       setSaving]       = useState(false);
  const [dirty,        setDirty]        = useState(false);

  useEffect(() => { setForm(student); setDirty(false); setEditingField(null); }, [student.username]);

  const editField = (field) => (e) => {
    e.preventDefault();
    setEditingField(field);
    setTempValue(form[field] ?? "");
  };

  const handleBlur = (field) => {
    if (tempValue !== form[field]) setDirty(true);
    setForm((prev) => ({ ...prev, [field]: tempValue }));
    setEditingField(null);
    setTempValue("");
  };

  const renderField = (r) => (
    <FieldRow
      key={r.field}
      icon={r.icon}
      label={r.label}
      field={r.field}
      value={form?.[r.field]}
      displayValue={r.displayValue}
      type={r.type}
      options={r.options}
      editingField={editingField}
      tempValue={tempValue}
      setTempValue={setTempValue}
      onEdit={editField(r.field)}
      onBlur={() => handleBlur(r.field)}
    />
  );

  const save = async () => {
    setSaving(true);
    try {
      const payload = denormalizeStudent(form);
      const { error } = await supabase.from("users").update(payload).eq("username", student.username);
      if (error) throw error;

      showToast("Đã lưu hồ sơ học sinh", "success");
      setDirty(false);
      onSaved({ ...form });
    } catch (err) {
      console.error("save profile error:", err);
      showToast("Lưu hồ sơ thất bại", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thông tin cơ bản */}
        <div className="bg-[#FDFBF7]/50 dark:bg-stone-850/40 rounded-[24px] border border-amber-900/10 dark:border-amber-100/10 p-5 shadow-sm">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 mb-4">Thông tin cơ bản</h3>
          <div className="flex flex-col gap-3">
            {renderField({ icon: "✝️", label: "Tên Thánh", field: "tenThanh" })}
            {renderField({ icon: "👤", label: "Họ và tên", field: "hoTen" })}
            {renderField({ icon: "⚧️", label: "Giới tính", field: "gioiTinh", options: ["Nam", "Nữ"] })}
            {renderField({ icon: "🎂", label: "Ngày sinh", field: "ngaySinh", type: "date", displayValue: transferDateForView(form?.ngaySinh) })}
          </div>
        </div>

        {/* Bí tích */}
        <div className="bg-[#FDFBF7]/50 dark:bg-stone-850/40 rounded-[24px] border border-amber-900/10 dark:border-amber-100/10 p-5 shadow-sm">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 mb-4">Tiến trình Bí Tích</h3>
          <div className="flex flex-col gap-3">
            {renderField({ icon: "💦", label: "Ngày Rửa Tội", field: "ngayRuaToi", type: "date", displayValue: transferDateForView(form?.ngayRuaToi) })}
            {renderField({ icon: "🫓", label: "Ngày Rước Lễ", field: "ngayRuocLe", type: "date", displayValue: transferDateForView(form?.ngayRuocLe) })}
            {renderField({ icon: "🕊️", label: "Ngày Thêm Sức", field: "ngayThemSuc", type: "date", displayValue: transferDateForView(form?.ngayThemSuc) })}
          </div>
        </div>

        {/* Liên hệ gia đình */}
        <div className="lg:col-span-2 bg-[#FDFBF7]/50 dark:bg-stone-850/40 rounded-[24px] border border-amber-900/10 dark:border-amber-100/10 p-5 shadow-sm">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 mb-4">Thông tin liên hệ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {renderField({ icon: "👨🏻", label: "Họ & Tên Cha", field: "tenCha" })}
            {renderField({ icon: "👩🏻", label: "Họ & Tên Mẹ", field: "tenMe" })}
            {renderField({ icon: "📞", label: "Số điện thoại", field: "sdt" })}
            {renderField({ icon: "🏠", label: "Giáo Xóm", field: "giaoXom" })}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button type="button" disabled={!dirty || saving} onClick={save}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-sm transition-all duration-300 active:scale-[0.98] md:hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed w-full md:w-auto">
          {saving && <Spinner className="h-4 w-4" />}
          {saving ? "Đang lưu…" : "💾 Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   ACADEMIC TAB
   ============================================================ */
function EditableScoreCell({ label, value, onChange, disabled }) {
  return (
    <div className="relative group flex-1 min-w-[84px]">
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-white/40 dark:from-stone-800/80 dark:to-stone-900/40 rounded-[14px] shadow-sm pointer-events-none transition-opacity group-focus-within:opacity-0" />
      <div className="absolute inset-0 bg-white dark:bg-stone-800 rounded-[14px] shadow-md opacity-0 group-focus-within:opacity-100 transition-opacity ring-2 ring-amber-500/30 dark:ring-amber-400/30 pointer-events-none" />
      <div className="relative z-10 px-3 py-3.5 text-center rounded-[14px] border border-amber-900/5 dark:border-amber-100/5 group-focus-within:border-transparent transition-colors">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2 group-focus-within:text-amber-700 dark:group-focus-within:text-amber-400 transition-colors">{label}</p>
        <input
          type="number" min="0" max="10" step="0.1" disabled={disabled}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          className="w-full text-center text-[18px] font-extrabold text-amber-950 dark:text-amber-50 bg-transparent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-stone-300 dark:placeholder:text-stone-700"
          placeholder="--"
        />
      </div>
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

      {/* BẢNG ĐIỂM */}
      <div className={`bg-[#FDFBF7]/60 dark:bg-stone-850/60 rounded-[20px] sm:rounded-[28px] border border-stone-200/50 dark:border-stone-800 p-4 sm:p-6 shadow-sm ${isLocked ? "opacity-70" : ""}`}>
        <h3 className="text-[12px] font-bold uppercase tracking-widest text-amber-900 dark:text-amber-500 mb-4 sm:mb-5">Bảng điểm</h3>
        <div className="flex gap-2 sm:gap-3 overflow-x-auto p-1 pb-3 md:pb-1 scrollbar-hide" data-lenis-prevent>
          {GRADE_FIELDS.map((f) => (
            <EditableScoreCell key={f.key} label={f.label} value={grades[f.key]} disabled={isLocked}
              onChange={(v) => setGrades((prev) => ({ ...prev, [f.key]: v }))} />
          ))}
        </div>
      </div>

      {/* ĐIỂM DANH */}
      <div className={`bg-[#FDFBF7]/60 dark:bg-stone-850/60 rounded-[20px] sm:rounded-[28px] border border-stone-200/50 dark:border-stone-800 p-4 sm:p-6 shadow-sm ${isLocked ? "opacity-70" : ""}`}>
        <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-4 sm:mb-6 gap-4 sm:gap-6">
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-amber-900 dark:text-amber-500 mb-1">
              Điểm danh <span className="text-stone-400 dark:text-stone-500 font-medium normal-case tracking-normal ml-1">({totalCount} tuần)</span>
            </h3>
            {totalCount > 0 && (
              <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4">
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-stone-200 dark:stroke-stone-750" strokeWidth="3" />
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-amber-500" strokeWidth="3" strokeDasharray={`${attendanceRate} 100`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-[11px] sm:text-[12px] font-extrabold text-amber-950 dark:text-amber-50">{attendanceRate}%</span>
                </div>
                <div className="flex flex-col gap-0.5 sm:gap-1">
                  <span className="text-[13px] sm:text-[14px] font-bold text-stone-800 dark:text-stone-200">Tổng quan chuyên cần</span>
                  <span className="text-[12px] sm:text-[13px] font-medium text-stone-500 dark:text-stone-400">Có mặt {presentCount}/{totalCount} ngày</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 xl:w-auto w-full shrink-0">
            <div className="flex items-center gap-3 sm:gap-4 bg-white/60 dark:bg-stone-900/60 rounded-xl px-3 py-2 sm:px-5 sm:py-3 border border-stone-200/50 dark:border-stone-800 overflow-x-auto w-full sm:w-auto shadow-sm scrollbar-hide">
              {STATUS_CYCLE.map((k) => (
                <span key={k} className="flex items-center gap-1.5 sm:gap-2 shrink-0 text-[11px] sm:text-[12px] font-semibold text-stone-600 dark:text-stone-400">
                  <span className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-sm ${ATTENDANCE_STATUS[k].color}`} />
                  {ATTENDANCE_STATUS[k].label}
                </span>
              ))}
            </div>
            
            <button type="button" disabled={isLocked || savingAttendance || Object.keys(attendanceOverrides).length === 0} onClick={saveAttendance}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl text-[13px] sm:text-[14px] font-bold bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-md transition-all duration-300 active:scale-[0.98] md:hover:opacity-90 disabled:opacity-40 w-full sm:w-auto whitespace-nowrap">
              {savingAttendance && <Spinner className="h-4 w-4" />}
              {savingAttendance ? "Đang lưu…" : "Lưu điểm danh"}
            </button>
          </div>
        </div>

        {totalCount === 0 ? (
          <p className="text-[13px] sm:text-[14px] text-stone-500 dark:text-stone-400 text-center py-6 sm:py-8 bg-white/40 dark:bg-stone-900/40 rounded-2xl border border-stone-100 dark:border-stone-800/50">
            Lớp chưa có lịch điểm danh cho học kỳ này.
          </p>
        ) : (
          <div className="bg-white/40 dark:bg-stone-900/40 rounded-[16px] sm:rounded-[20px] p-3 sm:p-5 border border-stone-100 dark:border-stone-800/50">
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 px-1 scrollbar-hide" data-lenis-prevent>
              {attendanceList.map(({ date, isoDate, trangThai }) => {
                const status  = ATTENDANCE_STATUS[trangThai];
                const isDirty = isoDate in attendanceOverrides;
                return (
                  <button key={isoDate} type="button" disabled={isLocked} onClick={() => cycleStatus(isoDate, trangThai)}
                    className="flex flex-col items-center gap-2 flex-shrink-0 w-[46px] sm:w-[52px] group disabled:cursor-not-allowed transition-transform active:scale-[0.9]">
                    <span className="text-[10px] sm:text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                      T{date.getMonth() + 1}
                    </span>
                    <span className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-sm ${status.color} ring-2 sm:ring-4 ring-white dark:ring-[#1C1917] ${isDirty ? "ring-amber-200 dark:ring-amber-900/50" : ""} flex items-center justify-center transition-all duration-300 md:group-hover:scale-110`}>
                      <span className={`text-[13px] sm:text-[14px] font-extrabold ${trangThai === "co_mat" ? "text-emerald-950 dark:text-emerald-50" : "text-white"}`}>{date.getDate()}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* TỔNG KẾT HỌC KỲ */}
      <div className={`bg-gradient-to-br from-stone-50 to-amber-50/40 dark:from-stone-850 dark:to-stone-900/80 rounded-[20px] sm:rounded-[28px] border border-amber-900/10 dark:border-amber-100/5 p-4 sm:p-6 shadow-sm relative overflow-hidden ${isLocked ? "opacity-70" : ""}`}>
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between mb-5 sm:mb-7 gap-3 sm:gap-4">
          <h3 className="text-[12px] font-bold uppercase tracking-widest text-amber-900 dark:text-amber-500">Tổng kết học kỳ</h3>
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

/* ============================================================
   STUDENT EDIT PANEL
   ============================================================ */
function StudentEditPanel({ student, namHoc, lop, onClose, onSaved }) {
  const { showToast } = useToast();
  const [tab, setTab] = useState("profile"); // profile | academic
  const [[page, direction], setPage] = useState([0, 0]);

  const [hocKy, setHocKy] = useState("HK1");
  const [[hkPage, hkDirection], setHkPage] = useState([0, 0]);

  const TABS = ["profile", "academic"];
  const handleTabChange = (tId) => {
    if (tId === tab) return;
    const newIdx = TABS.indexOf(tId);
    const oldIdx = TABS.indexOf(tab);
    setTab(tId);
    setPage([newIdx, newIdx > oldIdx ? 1 : -1]);
  };

  const handleHocKyChange = (k) => {
    if (k === hocKy) return;
    const HK_LIST = ["HK1", "HK2"];
    const newIdx = HK_LIST.indexOf(k);
    const oldIdx = HK_LIST.indexOf(hocKy);
    setHocKy(k);
    setHkPage([newIdx, newIdx > oldIdx ? 1 : -1]);
  };

  return (
    <div className="sm:bg-white/80 sm:dark:bg-[#1C1917]/80 sm:backdrop-blur-xl sm:rounded-[28px] sm:border sm:border-amber-900/10 sm:dark:border-amber-100/10 sm:shadow-sm sm:overflow-hidden w-full min-w-0 flex flex-col">
      <div className="relative overflow-hidden px-4 py-5 sm:px-8 sm:py-10 rounded-[20px] sm:rounded-none border border-amber-900/5 sm:border-b sm:border-amber-900/10 dark:border-amber-100/5 sm:dark:border-amber-100/10 bg-gradient-to-br from-stone-100 to-amber-50 dark:from-stone-800 dark:to-stone-900 shadow-sm sm:shadow-none mb-4 sm:mb-0">
        {/* Nền trang trí */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/5 dark:bg-amber-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        

        {/* Desktop close button */}
        <button type="button" onClick={onClose} aria-label="Đóng"
          className="hidden sm:flex absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/50 dark:bg-stone-800/50 backdrop-blur border border-amber-900/10 dark:border-amber-100/10 hover:bg-white dark:hover:bg-stone-700 items-center justify-center transition-colors shadow-sm">
          <X className="w-5 h-5 text-stone-500" />
        </button>

        <div className="relative z-10 flex items-center gap-4 sm:gap-6 min-w-0 pr-0 sm:pr-12">
          <div className="w-16 h-16 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 sm:border-4 border-white dark:border-stone-800 flex-shrink-0 bg-stone-100 shadow-xl">
            <img src={student.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex flex-col justify-center flex-1">
            <p className="text-[20px] sm:text-[32px] font-extrabold text-amber-950 dark:text-amber-50 font-serif leading-tight drop-shadow-sm">
              {student.hoTen || student.username}
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 sm:mt-2">
              <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-stone-200/50 dark:bg-stone-700/50 text-[11px] sm:text-[13px] font-semibold text-stone-600 dark:text-stone-300 whitespace-nowrap">
                Lớp {lop}
              </span>
              <span className="text-[11px] sm:text-[13px] font-medium text-stone-500 dark:text-stone-400 whitespace-nowrap">
                ID: {student.username}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 sm:pt-5 mb-4 sm:mb-6 gap-3 sm:gap-4">
        
        {/* Main Tabs (Hồ sơ - Điểm) */}
        <div className="relative flex gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-[14px] shadow-inner border border-amber-900/10 dark:border-amber-100/10 w-full sm:w-fit shrink-0">
          {TABS.map((tId) => (
            <button key={tId} type="button" onClick={() => handleTabChange(tId)}
              className={`relative flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-[13px] sm:text-[14px] font-bold transition-colors duration-300 whitespace-nowrap z-10 ${
                tab === tId 
                  ? "text-amber-950 dark:text-amber-50" 
                  : "text-stone-500 dark:text-stone-400 hover:text-amber-950 dark:hover:text-amber-50"
              }`}>
              {tab === tId && (
                <motion.div
                  layoutId="active-main-tab"
                  className="absolute inset-0 bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-amber-900/10 dark:border-amber-100/10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-20">{tId === "profile" ? "Hồ sơ cá nhân" : "Điểm & Điểm danh"}</span>
            </button>
          ))}
        </div>

        {/* Semester Tabs (Học kỳ I - Học kỳ II) */}
        <AnimatePresence>
          {tab === "academic" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative flex gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-[14px] shadow-inner border border-amber-900/10 dark:border-amber-100/10 w-full sm:w-fit shrink-0"
            >
              {["HK1", "HK2"].map((k) => (
                <button key={k} type="button" onClick={() => handleHocKyChange(k)}
                  className={`relative flex-1 sm:flex-none px-5 py-2 sm:px-5 sm:py-2.5 rounded-xl text-[13px] sm:text-[14px] font-bold transition-colors duration-300 z-10 ${
                    hocKy === k 
                      ? "text-amber-950 dark:text-amber-50" 
                      : "text-stone-500 dark:text-stone-400 hover:text-amber-950 dark:hover:text-amber-50"
                  }`}>
                  {hocKy === k && (
                    <motion.div
                      layoutId="active-hk-tab"
                      className="absolute inset-0 bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-amber-900/10 dark:border-amber-100/10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-20">{k === "HK1" ? "Học kỳ I" : "Học kỳ II"}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-0 sm:px-2 pb-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={tab}
            custom={direction}
            variants={SLIDE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: APPLE_EASE }}
          >
            {tab === "profile"  && <ProfileTab  student={student} onSaved={onSaved} showToast={showToast} />}
            {tab === "academic" && <AcademicTab student={student} namHoc={namHoc} lop={lop} showToast={showToast} hocKy={hocKy} hkDirection={hkDirection} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ============================================================
   ROOT 
   ============================================================ */
export default function RosterTab() {
  const { students, context, loadingStudents, handleStudentSaved } = useTeacherContext();
  const [search, setSearch] = useState("");
  const [selectedUsername, setSelectedUsername] = useState(null);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students || [];
    return (students || []).filter((s) =>
      (s.hoTen || "").toLowerCase().includes(q) ||
      (s.username || "").toLowerCase().includes(q)
    );
  }, [students, search]);

  const selectedStudent = (students || []).find((s) => s.username === selectedUsername) || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-6">
      
      <div className={selectedStudent ? "hidden lg:block" : "block"}>
        <StudentListPanel
          students={filteredStudents}
          loading={loadingStudents}
          search={search}
          setSearch={setSearch}
          selectedUsername={selectedUsername}
          onSelect={setSelectedUsername}
        />
      </div>

      <div className={`min-h-[50vh] min-w-0 ${selectedStudent ? "block" : "hidden lg:block"}`}>
        <AnimatePresence mode="wait">
          {selectedStudent ? (
            <motion.div key={selectedStudent.username}
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: APPLE_EASE }} 
              className="min-w-0">
              <button type="button" onClick={() => setSelectedUsername(null)}
                className="lg:hidden inline-flex items-center gap-2 p-2 rounded-xl text-[14px] font-bold text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 bg-white/50 dark:bg-stone-800/50 backdrop-blur-md border border-amber-900/10 mb-4 transition-all active:scale-[0.98]">
                <ArrowLeft className="w-4 h-4" /> Danh sách học sinh
              </button>
              <StudentEditPanel
                student={selectedStudent}
                namHoc={context.namHoc}
                lop={context.lop}
                onClose={() => setSelectedUsername(null)}
                onSaved={handleStudentSaved}
              />
            </motion.div>
          ) : (
            <motion.div key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: APPLE_EASE }}
              className="h-full min-h-[50vh] flex flex-col items-center justify-center gap-4 bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm text-center px-6">
              <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-2">
                 <ClipboardList className="w-8 h-8 text-amber-800/50 dark:text-amber-500/50" />
              </div>
              <h3 className="text-[16px] font-bold text-stone-800 dark:text-stone-200">Bắt đầu quản lý</h3>
              <p className="text-[14px] text-stone-500 dark:text-stone-400 max-w-sm">
                Chọn một học sinh từ danh sách bên trái để xem và chỉnh sửa hồ sơ, điểm số cũng như điểm danh.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}