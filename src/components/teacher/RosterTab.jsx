import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ClipboardList, X, ArrowLeft, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../ui/ToastContext.jsx";
import {
  Spinner, FieldRow, ATTENDANCE_STATUS,
  transferDateForView, normalizeStudent, denormalizeStudent,
} from "../ui/StudentShared.jsx";
import { useTeacherContext } from "./TeacherContext.jsx";
import { fetchStudentAcademic, fetchClassTermRanges, fetchTermLocks } from "./api.js";
import { HK_INT_MAP, STATUS_CYCLE, GRADE_FIELDS, HOC_LUC_OPTIONS, HANH_KIEM_OPTIONS } from "./constants.js";

// Hằng số Easing chuẩn của Design System
const APPLE_EASE = [0.16, 1, 0.3, 1];

/* ============================================================
   STUDENT LIST PANEL
   ============================================================ */
function StudentListPanel({ students, loading, search, setSearch, selectedUsername, onSelect }) {
  return (
    <div className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm overflow-hidden flex flex-col max-h-[75vh] lg:max-h-[calc(100vh-180px)] min-h-0">
      <div className="p-5 border-b border-amber-900/10 dark:border-amber-100/10">
        <div className="relative">
          <Search className="w-5 h-5 text-amber-800/50 dark:text-amber-400/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên hoặc username…"
            className="w-full rounded-xl border border-amber-900/10 dark:border-amber-100/10 bg-white/50 dark:bg-stone-900/50 pl-11 pr-4 py-3 text-[14px] font-medium text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-600/50 dark:focus:ring-amber-500/50 transition-shadow"
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
          {!loading && students.map((s) => {
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

  const rows = [
    { icon: "👤",   label: "Họ và tên",     field: "hoTen" },
    { icon: "✝️",   label: "Tên Thánh",     field: "tenThanh" },
    { icon: "🎂",   label: "Ngày sinh",     field: "ngaySinh",    type: "date", displayValue: transferDateForView(form.ngaySinh) },
    { icon: "💦",   label: "Ngày Rửa Tội",  field: "ngayRuaToi",  type: "date", displayValue: transferDateForView(form.ngayRuaToi) },
    { icon: "🫓",   label: "Ngày Rước Lễ",  field: "ngayRuocLe",  type: "date", displayValue: transferDateForView(form.ngayRuocLe) },
    { icon: "🕊️",  label: "Ngày Thêm Sức", field: "ngayThemSuc", type: "date", displayValue: transferDateForView(form.ngayThemSuc) },
    { icon: "👨🏻", label: "Họ & Tên Cha",  field: "tenCha" },
    { icon: "👩🏻", label: "Họ & Tên Mẹ",   field: "tenMe" },
    { icon: "📞",   label: "Số điện thoại", field: "sdt" },
    { icon: "🏠",   label: "Giáo Xóm",      field: "giaoXom" },
    { icon: "⚧️",   label: "Giới tính",     field: "gioiTinh",    options: ["Nam", "Nữ"] },
  ];

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {rows.map((r) => (
        <FieldRow
          key={r.field}
          icon={r.icon}
          label={r.label}
          field={r.field}
          value={form[r.field]}
          displayValue={r.displayValue}
          type={r.type}
          options={r.options}
          editingField={editingField}
          tempValue={tempValue}
          setTempValue={setTempValue}
          onEdit={editField(r.field)}
          onBlur={() => handleBlur(r.field)}
        />
      ))}

      <div className="md:col-span-2 flex justify-end mt-4">
        {/* Nút Bấm Chính Snippet */}
        <button type="button" disabled={!dirty || saving} onClick={save}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-sm transition-all duration-300 active:scale-[0.98] md:hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed w-full md:w-auto">
          {saving && <Spinner className="h-4 w-4" />}
          {saving ? "Đang lưu…" : "💾 Lưu hồ sơ"}
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
    <div className="bg-white/60 dark:bg-stone-900/60 rounded-xl px-3 py-3 text-center flex-1 min-w-[80px] border border-amber-900/10 dark:border-amber-100/10 transition-colors focus-within:border-amber-600/50 dark:focus-within:border-amber-500/50">
      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 mb-1.5">{label}</p>
      <input
        type="number" min="0" max="10" step="0.1" disabled={disabled}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className="w-full text-center text-[15px] font-extrabold text-stone-900 dark:text-stone-100 bg-transparent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
      />
    </div>
  );
}

function AcademicTab({ student, namHoc, lop, showToast }) {
  const [hocKy, setHocKy] = useState("HK1");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-20 text-amber-900 dark:text-amber-500">
        <Spinner className="h-6 w-6" />
        <span className="text-[14px] font-medium font-sans">Đang tải dữ liệu học tập…</span>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: APPLE_EASE }} className="flex flex-col gap-6">
      
      <div className="flex gap-1 bg-stone-100/80 dark:bg-stone-800/80 rounded-xl p-1 w-fit backdrop-blur-sm">
        {["HK1", "HK2"].map((k) => (
          <button key={k} type="button" onClick={() => setHocKy(k)}
            className={`px-5 py-2 rounded-lg text-[13px] font-bold transition-all duration-300 ${
              hocKy === k ? "bg-white dark:bg-stone-700 text-amber-900 dark:text-amber-400 shadow-sm" : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
            }`}>
            {k === "HK1" ? "Học kỳ I" : "Học kỳ II"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {isLocked && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            transition={{ duration: 0.35, ease: APPLE_EASE }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-3 px-5 py-3.5 rounded-2xl bg-stone-100/80 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-750">
              <AlertCircle className="w-5 h-5 text-stone-500 flex-shrink-0" />
              <span className="text-[13px] font-medium text-stone-600 dark:text-stone-300 leading-relaxed">
                Học kỳ này đã được Admin khóa sổ. Điểm, điểm danh và tổng kết chỉ xem được, không sửa được cho đến khi mở khóa lại.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BẢNG ĐIỂM */}
      <div className={`bg-[#FDFBF7]/50 dark:bg-stone-850/40 rounded-[24px] border border-amber-900/10 dark:border-amber-100/10 p-5 ${isLocked ? "opacity-70" : ""}`}>
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 mb-4">Bảng điểm</h3>
        <div className="flex gap-2.5 overflow-x-auto pb-1" data-lenis-prevent>
          {GRADE_FIELDS.map((f) => (
            <EditableScoreCell key={f.key} label={f.label} value={grades[f.key]} disabled={isLocked}
              onChange={(v) => setGrades((prev) => ({ ...prev, [f.key]: v }))} />
          ))}
        </div>
      </div>

      {/* ĐIỂM DANH */}
      <div className={`bg-[#FDFBF7]/50 dark:bg-stone-850/40 rounded-[24px] border border-amber-900/10 dark:border-amber-100/10 p-5 ${isLocked ? "opacity-70" : ""}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70">
            Điểm danh <span className="text-stone-400 dark:text-stone-500 font-normal normal-case tracking-normal ml-1">({attendanceList.length} tuần)</span>
          </h3>
          <button type="button"
            disabled={isLocked || savingAttendance || Object.keys(attendanceOverrides).length === 0}
            onClick={saveAttendance}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-sm transition-all duration-300 active:scale-[0.98] md:hover:opacity-90 disabled:opacity-40 flex-shrink-0 w-full sm:w-auto">
            {savingAttendance && <Spinner className="h-4 w-4" />}
            {savingAttendance ? "Đang lưu…" : "Lưu điểm danh"}
          </button>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5 text-[13px] font-medium text-stone-600 dark:text-stone-300">
          {STATUS_CYCLE.map((k) => (
            <span key={k} className="flex items-center gap-2">
              <span className={`w-3.5 h-3.5 rounded-full shadow-sm ${ATTENDANCE_STATUS[k].color}`} />
              {ATTENDANCE_STATUS[k].label}
            </span>
          ))}
        </div>

        {attendanceList.length === 0 ? (
          <p className="text-[14px] text-stone-500 dark:text-stone-400 text-center py-8">
            Lớp chưa có lịch điểm danh cho học kỳ này — vào tab "Điểm danh nhanh" để thiết lập.
          </p>
        ) : (
          <>
            <div className="flex gap-3 overflow-x-auto pb-2 px-1" data-lenis-prevent>
              {attendanceList.map(({ date, isoDate, trangThai }) => {
                const status  = ATTENDANCE_STATUS[trangThai];
                const isDirty = isoDate in attendanceOverrides;
                return (
                  <button key={isoDate} type="button" disabled={isLocked} onClick={() => cycleStatus(isoDate, trangThai)}
                    className="flex flex-col items-center gap-2 flex-shrink-0 w-12 group disabled:cursor-not-allowed transition-transform active:scale-[0.9]">
                    <span
                      className={`w-10 h-10 rounded-full shadow-sm ${status.color} ring-2 ring-offset-2 dark:ring-offset-[#1C1917] ${isDirty ? "ring-amber-600 dark:ring-amber-500" : "ring-transparent"} transition-all duration-300 md:group-hover:scale-105`}
                      title={status.label}
                    />
                    <span className="text-[12px] font-medium text-stone-500 dark:text-stone-400 whitespace-nowrap">
                      {date.getDate()}/{date.getMonth() + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* TỔNG KẾT HỌC KỲ */}
      <div className={`bg-[#FDFBF7]/50 dark:bg-stone-850/40 rounded-[24px] border border-amber-900/10 dark:border-amber-100/10 p-5 ${isLocked ? "opacity-70" : ""}`}>
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 mb-4">Tổng kết học kỳ</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Học lực</span>
            <select value={term.hoc_luc || ""} disabled={isLocked} onChange={(e) => setTerm((p) => ({ ...p, hoc_luc: e.target.value }))}
              className="rounded-xl border border-amber-900/10 dark:border-amber-100/10 bg-white/60 dark:bg-stone-900/60 text-stone-900 dark:text-stone-100 px-4 py-3 text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-amber-600/50 dark:focus:ring-amber-500/50 disabled:opacity-60 transition-shadow">
              <option value="">— Chưa chọn —</option>
              {HOC_LUC_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-2">
             <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Hạnh kiểm</span>
            <select value={term.hanh_kiem || ""} disabled={isLocked} onChange={(e) => setTerm((p) => ({ ...p, hanh_kiem: e.target.value }))}
              className="rounded-xl border border-amber-900/10 dark:border-amber-100/10 bg-white/60 dark:bg-stone-900/60 text-stone-900 dark:text-stone-100 px-4 py-3 text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-amber-600/50 dark:focus:ring-amber-500/50 disabled:opacity-60 transition-shadow">
              <option value="">— Chưa chọn —</option>
              {HANH_KIEM_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-2">
             <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Vị thứ</span>
            <input type="number" min="1" value={term.vi_thu ?? ""} disabled={isLocked} onChange={(e) => setTerm((p) => ({ ...p, vi_thu: e.target.value }))}
              className="rounded-xl border border-amber-900/10 dark:border-amber-100/10 bg-white/60 dark:bg-stone-900/60 text-stone-900 dark:text-stone-100 px-4 py-3 text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-amber-600/50 dark:focus:ring-amber-500/50 disabled:opacity-60 transition-shadow" />
          </label>

          <label className="flex flex-col gap-2 sm:col-span-3">
             <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Ghi chú</span>
            <textarea rows={2} value={term.ghi_chu || ""} disabled={isLocked} onChange={(e) => setTerm((p) => ({ ...p, ghi_chu: e.target.value }))}
              className="rounded-xl border border-amber-900/10 dark:border-amber-100/10 bg-white/60 dark:bg-stone-900/60 text-stone-900 dark:text-stone-100 px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-amber-600/50 dark:focus:ring-amber-500/50 resize-none disabled:opacity-60 transition-shadow" />
          </label>
        </div>

        <div className="flex justify-end mt-5">
          <button type="button" disabled={isLocked || savingGrades} onClick={saveGradesAndTerm}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-sm transition-all duration-300 active:scale-[0.98] md:hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed w-full md:w-auto">
            {savingGrades && <Spinner className="h-4 w-4" />}
            {savingGrades ? "Đang lưu…" : "Lưu điểm & tổng kết"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   STUDENT EDIT PANEL
   ============================================================ */
function StudentEditPanel({ student, namHoc, lop, onClose, onSaved }) {
  const { showToast } = useToast();
  const [tab, setTab] = useState("profile"); // profile | academic

  return (
    <div className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm overflow-hidden min-w-0">
      <div className="flex items-center justify-between px-6 py-5 border-b border-amber-900/10 dark:border-amber-100/10">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white dark:border-stone-800 flex-shrink-0 bg-stone-100 shadow-sm">
            <img src={student.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-[20px] font-extrabold text-amber-950 dark:text-amber-50 font-serif leading-tight truncate">
              {student.hoTen || student.username}
            </p>
            <p className="text-[13px] font-medium text-stone-500 dark:text-stone-400 mt-1">
              {student.username} <span className="mx-1.5 opacity-50">•</span> Lớp {lop}
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Đóng"
          className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center flex-shrink-0 transition-colors">
          <X className="w-5 h-5 text-stone-500" />
        </button>
      </div>

      <div className="flex gap-2 px-6 pt-5">
        {[
          { id: "profile",  label: "Hồ sơ cá nhân" },
          { id: "academic", label: "Điểm & Điểm danh" },
        ].map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all duration-300 ${
              tab === t.id ? "bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-400 shadow-sm" : "text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/50 hover:text-stone-800 dark:hover:text-stone-200"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: APPLE_EASE }}
          >
            {tab === "profile"  && <ProfileTab  student={student} onSaved={onSaved} showToast={showToast} />}
            {tab === "academic" && <AcademicTab student={student} namHoc={namHoc} lop={lop} showToast={showToast} />}
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
    if (!q) return students;
    return students.filter((s) =>
      (s.hoTen || "").toLowerCase().includes(q) ||
      (s.username || "").toLowerCase().includes(q)
    );
  }, [students, search]);

  const selectedStudent = students.find((s) => s.username === selectedUsername) || null;

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