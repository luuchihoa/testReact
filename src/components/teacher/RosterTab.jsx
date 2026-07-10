import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ClipboardList, X, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../ui/ToastContext.jsx";
import {
  Spinner, FieldRow, ATTENDANCE_STATUS,
  transferDateForView, normalizeStudent, denormalizeStudent,
} from "../ui/StudentShared.jsx";
import { useTeacherContext } from "./TeacherContext.jsx";
import { fetchStudentAcademic, fetchClassTermRanges, fetchTermLocks } from "./api.js";
import { ACCENT, HK_INT_MAP, STATUS_CYCLE, GRADE_FIELDS, HOC_LUC_OPTIONS, HANH_KIEM_OPTIONS } from "./constants.js";

/* ============================================================
   STUDENT LIST PANEL
   ============================================================ */
function StudentListPanel({ students, loading, search, setSearch, selectedUsername, onSelect }) {
  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden flex flex-col max-h-[75vh] lg:max-h-[calc(100vh-180px)] min-h-0">
      <div className="p-4 border-b border-stone-100">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc username…"
            className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto" data-lenis-prevent>
        {loading && (
          <div className="flex items-center justify-center gap-2 py-10 text-stone-400 text-sm">
            <Spinner className="h-4 w-4" /> Đang tải…
          </div>
        )}

        {!loading && students.length === 0 && (
          <p className="text-center text-sm text-stone-400 py-10 px-4">Không tìm thấy học sinh nào.</p>
        )}

        {!loading && students.map((s) => {
          const active = s.username === selectedUsername;
          return (
            <button key={s.username} type="button" onClick={() => onSelect(s.username)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left border-b border-stone-50 transition-colors ${
                active ? "bg-orange-50/70" : "hover:bg-stone-50"
              }`}
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border border-stone-200 flex-shrink-0 bg-stone-100">
                <img src={s.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-[14px] font-semibold truncate ${active ? "text-[#FF6B35]" : "text-stone-800"}`}>
                  {s.hoTen || s.username}
                </p>
                <p className="text-[11px] text-stone-400 truncate">{s.username}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   PROFILE TAB — tái dùng FieldRow từ StudentShared.jsx
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

      <div className="md:col-span-2 flex justify-end mt-2">
        <button type="button" disabled={!dirty || saving} onClick={save}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#FF6B35] text-white text-[15px] font-bold hover:bg-[#E85E28] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {saving && <Spinner className="h-4 w-4" />}
          {saving ? "Đang lưu…" : "💾 Lưu hồ sơ"}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   ACADEMIC TAB — điểm số + tổng kết học kỳ + điểm danh của 1 học sinh
   ============================================================ */
function EditableScoreCell({ label, value, onChange }) {
  return (
    <div className="bg-white rounded-xl px-3 py-2.5 text-center flex-1 min-w-[76px] border border-stone-100">
      <p className="text-[11px] text-gray-400 mb-1">{label}</p>
      <input
        type="number" min="0" max="10" step="0.1"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className="w-full text-center text-[15px] font-semibold text-gray-900 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#FF6B35] rounded-lg"
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
  const [baseAttendance,      setBaseAttendance]      = useState({}); // isoDate -> trang_thai (đã lưu trong DB)
  const [attendanceOverrides, setAttendanceOverrides] = useState({}); // isoDate -> trang_thai (đang sửa, chưa lưu)
  const [savingGrades,     setSavingGrades]     = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Lịch điểm danh (ngày bắt đầu + tổng số buổi) dùng CHUNG cho cả lớp —
  // quản lý tập trung ở tab "Điểm danh nhanh", tab này chỉ đọc để hiển thị,
  // không cho sửa ở đây để tránh 2 nơi lệch nhau.
  const [classRanges, setClassRanges] = useState({ HK1: { start: null, sundays: [] }, HK2: { start: null, sundays: [] } });

  // Trạng thái khóa sổ theo học kỳ — tải cùng lúc với dữ liệu học tập.
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

      // Không gửi ngay_bat_dau / tong_buoi ở đây — lịch điểm danh được quản lý
      // tập trung ở tab "Điểm danh nhanh", tránh ghi đè lệch dữ liệu.
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

      showToast("Đã lưu điểm & tổng kết học kỳ", "success");
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
    if (changedDates.length === 0) { showToast("Không có thay đổi điểm danh", "warning"); return; }

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
      <div className="flex items-center justify-center gap-2.5 py-14" style={{ color: ACCENT }}>
        <Spinner className="h-5 w-5" />
        <span className="text-sm text-stone-500">Đang tải dữ liệu học kỳ…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1.5 bg-stone-100 rounded-xl p-1 w-fit">
        {["HK1", "HK2"].map((k) => (
          <button key={k} type="button" onClick={() => setHocKy(k)}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${
              hocKy === k ? "bg-white text-[#FF6B35] shadow-sm" : "text-stone-500"
            }`}>
            {k === "HK1" ? "Học kỳ I" : "Học kỳ II"}
          </button>
        ))}
      </div>

      {isLocked && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-stone-100 border border-stone-200">
          <span className="text-[13px] text-stone-600">
            🔒 Học kỳ này đã được admin khóa sổ. Điểm, điểm danh và tổng kết chỉ xem được, không sửa được cho đến khi được mở khóa lại.
          </span>
        </div>
      )}

      {/* BẢNG ĐIỂM */}
      <div className={`bg-[#F9F9F9] rounded-2xl border border-stone-100 p-4 ${isLocked ? "opacity-70" : ""}`}>
        <h3 className="text-[14px] font-bold text-stone-800 mb-3">Bảng điểm</h3>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {GRADE_FIELDS.map((f) => (
            <EditableScoreCell key={f.key} label={f.label} value={grades[f.key]} disabled={isLocked}
              onChange={(v) => setGrades((prev) => ({ ...prev, [f.key]: v }))} />
          ))}
        </div>
      </div>

      {/* ĐIỂM DANH */}
      <div className={`bg-[#F9F9F9] rounded-2xl border border-stone-100 p-4 ${isLocked ? "opacity-70" : ""}`}>
        <div className="flex items-center justify-between mb-3 gap-3">
          <h3 className="text-[14px] font-bold text-stone-800">
            Điểm danh <span className="text-stone-400 font-normal">({attendanceList.length} tuần)</span>
          </h3>
          <button type="button"
            disabled={isLocked || savingAttendance || Object.keys(attendanceOverrides).length === 0}
            onClick={saveAttendance}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-white text-[12px] font-bold hover:bg-stone-800 transition-colors disabled:opacity-40 flex-shrink-0">
            {savingAttendance && <Spinner className="h-3.5 w-3.5" />}
            {savingAttendance ? "Đang lưu…" : "Lưu điểm danh"}
          </button>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4 text-[12px] text-stone-500">
          {STATUS_CYCLE.map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-full ${ATTENDANCE_STATUS[k].color}`} />
              {ATTENDANCE_STATUS[k].label}
            </span>
          ))}
        </div>

        {attendanceList.length === 0 ? (
          <p className="text-[13px] text-stone-400 text-center py-6">
            Lớp chưa có lịch điểm danh cho học kỳ này — vào tab "Điểm danh nhanh" để nhập ngày bắt đầu &amp; tổng số buổi.
          </p>
        ) : (
          <>
            <p className="text-[11px] text-stone-400 mb-2">Bấm vào từng buổi để chuyển trạng thái.</p>
            <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1" data-lenis-prevent>
              {attendanceList.map(({ date, isoDate, trangThai }) => {
                const status  = ATTENDANCE_STATUS[trangThai];
                const isDirty = isoDate in attendanceOverrides;
                return (
                  <button key={isoDate} type="button" disabled={isLocked} onClick={() => cycleStatus(isoDate, trangThai)}
                    className="flex flex-col items-center gap-1.5 flex-shrink-0 w-12 group disabled:cursor-not-allowed">
                    <span
                      className={`w-8 h-8 rounded-full ${status.color} ring-2 ${isDirty ? "ring-[#FF6B35]" : "ring-transparent"} transition-all group-hover:scale-110`}
                      title={status.label}
                    />
                    <span className="text-[11px] text-stone-400 whitespace-nowrap">
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
      <div className={`bg-[#F9F9F9] rounded-2xl border border-stone-100 p-4 ${isLocked ? "opacity-70" : ""}`}>
        <h3 className="text-[14px] font-bold text-stone-800 mb-3">Tổng kết học kỳ</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex flex-col gap-1 text-[12px] text-stone-500 font-medium">
            Học lực
            <select value={term.hoc_luc || ""} disabled={isLocked} onChange={(e) => setTerm((p) => ({ ...p, hoc_luc: e.target.value }))}
              className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] disabled:bg-stone-100 disabled:cursor-not-allowed">
              <option value="">— Chưa chọn —</option>
              {HOC_LUC_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-[12px] text-stone-500 font-medium">
            Hạnh kiểm
            <select value={term.hanh_kiem || ""} disabled={isLocked} onChange={(e) => setTerm((p) => ({ ...p, hanh_kiem: e.target.value }))}
              className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] disabled:bg-stone-100 disabled:cursor-not-allowed">
              <option value="">— Chưa chọn —</option>
              {HANH_KIEM_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-[12px] text-stone-500 font-medium">
            Vị thứ
            <input type="number" min="1" value={term.vi_thu ?? ""} disabled={isLocked} onChange={(e) => setTerm((p) => ({ ...p, vi_thu: e.target.value }))}
              className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] disabled:bg-stone-100 disabled:cursor-not-allowed" />
          </label>

          <label className="flex flex-col gap-1 text-[12px] text-stone-500 font-medium sm:col-span-3">
            Ghi chú
            <textarea rows={2} value={term.ghi_chu || ""} disabled={isLocked} onChange={(e) => setTerm((p) => ({ ...p, ghi_chu: e.target.value }))}
              className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] resize-none disabled:bg-stone-100 disabled:cursor-not-allowed" />
          </label>
        </div>

        <div className="flex justify-end mt-3">
          <button type="button" disabled={isLocked || savingGrades} onClick={saveGradesAndTerm}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B35] text-white text-[13px] font-bold hover:bg-[#E85E28] transition-colors disabled:opacity-60">
            {savingGrades && <Spinner className="h-4 w-4" />}
            {savingGrades ? "Đang lưu…" : "Lưu điểm & tổng kết"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STUDENT EDIT PANEL
   ============================================================ */
function StudentEditPanel({ student, namHoc, lop, onClose, onSaved }) {
  const { showToast } = useToast();
  const [tab, setTab] = useState("profile"); // profile | academic

  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden min-w-0">
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full overflow-hidden border border-stone-200 flex-shrink-0 bg-stone-100">
            <img src={student.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-stone-900 truncate">{student.hoTen || student.username}</p>
            <p className="text-[12px] text-stone-400">{student.username} · Lớp {lop}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Đóng"
          className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center flex-shrink-0">
          <X className="w-4 h-4 text-stone-500" />
        </button>
      </div>

      <div className="flex gap-1 px-5 pt-4">
        {[
          { id: "profile",  label: "Hồ sơ" },
          { id: "academic", label: "Điểm & điểm danh" },
        ].map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors ${
              tab === t.id ? "bg-[#FFF0E8] text-[#FF6B35]" : "text-stone-500 hover:bg-stone-50"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === "profile"  && <ProfileTab  student={student} onSaved={onSaved} showToast={showToast} />}
        {tab === "academic" && <AcademicTab student={student} namHoc={namHoc} lop={lop} showToast={showToast} />}
      </div>
    </div>
  );
}

/* ============================================================
   ROOT — danh sách học sinh + panel xem/sửa hồ sơ, điểm, điểm danh
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
    <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-5">
      {/* Trên mobile: chỉ hiện danh sách HOẶC hồ sơ đang chọn, không hiện cùng lúc để tránh cuộn dài */}
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
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }} className="min-w-0">
              <button type="button" onClick={() => setSelectedUsername(null)}
                className="lg:hidden inline-flex items-center gap-1.5 text-[13px] font-semibold text-stone-500 hover:text-stone-800 mb-3">
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
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="h-full min-h-[50vh] flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-stone-100 shadow-sm text-center px-6">
              <ClipboardList className="w-9 h-9 text-stone-300" />
              <p className="text-sm text-stone-400 max-w-xs">
                Chọn một học sinh để xem và chỉnh sửa hồ sơ, điểm số, điểm danh.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}