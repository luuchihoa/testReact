import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ChevronLeft, Users, GraduationCap, ClipboardList, X,
  CalendarCheck, Table, ArrowLeft, Check,
  LayoutDashboard, Printer, FileSpreadsheet,
} from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { useToast } from "./ui/ToastContext.jsx";
import {
  Spinner, FieldRow,
  ATTENDANCE_STATUS,
  transferDateForView,
  normalizeStudent, denormalizeStudent,
} from "./ui/StudentShared.jsx";

/* ============================================================
   CONSTANTS
   ============================================================ */
const ACCENT = "#FF6B35";
const HK_INT_MAP = { HK1: 1, HK2: 2 };
const HOC_LUC_OPTIONS   = ["Giỏi", "Khá", "Trung Bình", "Yếu", "Kém"];
const HANH_KIEM_OPTIONS = ["Tốt", "Khá", "Trung Bình", "Yếu"];
const STATUS_CYCLE = ["co_mat", "nghi_phep", "nghi_khong_phep", "nghi_le"];
const GRADE_FIELDS = [
  { key: "diem_mieng",   label: "Miệng"  },
  { key: "diem_vo",      label: "Vở"     },
  { key: "diem_15_phut", label: "15'"    },
  { key: "diem_1_tiet",  label: "1 Tiết" },
  { key: "diem_thi",     label: "Thi"    },
  { key: "diem_tb",      label: "TB"     },
];

// Trọng số dùng để tự động tính điểm trung bình học kỳ.
// Có thể chỉnh lại nếu quy chế tính điểm của giáo xứ/trường thay đổi.
const GRADE_WEIGHTS = {
  diem_mieng:   1,
  diem_vo:      1,
  diem_15_phut: 1,
  diem_1_tiet:  2,
  diem_thi:     3,
};

function getCurrentNamHoc(date = new Date()) {
  const year  = date.getFullYear();
  const month = date.getMonth(); // 0-indexed, tháng 9 = 8
  const startYear = month >= 8 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

// Tự tính điểm TB dựa trên các điểm thành phần đã có (bỏ qua ô còn trống).
// Trả về null nếu chưa có điểm thành phần nào để tránh hiện "0" gây hiểu lầm.
function computeDiemTB(g) {
  const parts = [
    { v: g.diem_mieng,   w: GRADE_WEIGHTS.diem_mieng },
    { v: g.diem_vo,      w: GRADE_WEIGHTS.diem_vo },
    { v: g.diem_15_phut, w: GRADE_WEIGHTS.diem_15_phut },
    { v: g.diem_1_tiet,  w: GRADE_WEIGHTS.diem_1_tiet },
    { v: g.diem_thi,     w: GRADE_WEIGHTS.diem_thi },
  ];
  const valid = parts.filter((p) => p.v !== null && p.v !== undefined && p.v !== "");
  if (valid.length === 0) return null;
  const totalW = valid.reduce((s, p) => s + p.w, 0);
  const sum    = valid.reduce((s, p) => s + Number(p.v) * p.w, 0);
  return Math.round((sum / totalW) * 100) / 100;
}

// Lấy "Tên" riêng (từ cuối cùng) trong Họ và Tên đầy đủ — dùng để xếp danh
// sách lớp theo thói quen VN: xếp theo Tên trước, không theo Họ.
// Vd: "Nguyễn Văn Anh" và "Trần Thị Châu" -> xếp theo "Anh" trước "Châu".
function getTenRieng(hoTen) {
  const parts = (hoTen || "").trim().split(/\s+/).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : (hoTen || "");
}

function sortStudentsByTen(students) {
  return [...students].sort((a, b) => {
    const cmp = getTenRieng(a.hoTen).localeCompare(getTenRieng(b.hoTen), "vi");
    if (cmp !== 0) return cmp;
    return (a.hoTen || "").localeCompare(b.hoTen || "", "vi");
  });
}

// Trả về Chủ Nhật gần nhất KHÔNG ở tương lai: nếu hôm nay đã là Chủ Nhật thì trả
// về chính hôm nay; nếu chưa tới Chủ Nhật của tuần này thì lùi về Chủ Nhật tuần trước.
function mostRecentSunday(base = new Date()) {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

// Sinh danh sách các ngày điểm danh (mỗi buổi cách nhau 7 ngày), bắt đầu từ ngay_bat_dau.
function buildSundayList(startRaw, tongBuoi) {
  const total = Number(tongBuoi) || 0;
  if (!startRaw || !total) return [];
  const startDate = new Date(startRaw);
  const list = [];
  for (let i = 0; i < total; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i * 7);
    list.push(d);
  }
  return list;
}

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

function formatVNDate(d) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// Giới hạn 1 ngày vào trong khoảng lịch điểm danh đã định sẵn (không vượt quá buổi đầu/cuối)
function clampToSundayRange(target, sundays) {
  if (!sundays.length) return target;
  if (target < sundays[0]) return sundays[0];
  if (target > sundays[sundays.length - 1]) return sundays[sundays.length - 1];
  return target;
}

// Xác định đang ở học kỳ nào dựa trên ngày hiện tại: nếu đã bước vào lịch của
// học kỳ II thì ưu tiên học kỳ II, ngược lại mặc định học kỳ I.
function resolveActiveHocKy(ranges, todaySunday) {
  const hk2 = ranges.HK2;
  if (hk2 && hk2.sundays.length && todaySunday >= hk2.sundays[0]) return "HK2";
  return "HK1";
}

// Màu chữ cho điểm TB, cùng ngôn ngữ màu với RANK_COLORS (Giỏi/Khá/TB/Yếu/Kém)
function tbColorClass(tb) {
  if (tb === null || tb === undefined || tb === "") return "text-stone-400";
  const n = Number(tb);
  if (n >= 8)   return "text-[#34C759]";
  if (n >= 6.5) return "text-[#007AFF]";
  if (n >= 5)   return "text-[#FFD60A]";
  if (n >= 3.5) return "text-[#FF9500]";
  return "text-[#FF375F]";
}

/* ============================================================
   DATA LAYER
   ============================================================ */

// Xác định giáo viên đang đăng nhập đang chủ nhiệm lớp nào (năm học hiện tại)
async function fetchTeacherContext(authId) {
  const { data: teacherRow, error: teacherErr } = await supabase
    .from("users")
    .select("username, role")
    .eq("auth_id", authId)
    .maybeSingle();

  if (teacherErr) throw teacherErr;
  if (!teacherRow) throw new Error("Không tìm thấy tài khoản giáo viên");
  if (teacherRow.role !== "teacher") throw new Error("Tài khoản không có quyền giáo viên");

  const namHoc = getCurrentNamHoc();

  const { data: classRow, error: classErr } = await supabase
    .from("class_teachers")
    .select("lop, nam_hoc")
    .eq("teacher_username", teacherRow.username)
    .eq("nam_hoc", namHoc)
    .maybeSingle();

  if (classErr) throw classErr;

  return {
    teacherUsername: teacherRow.username,
    namHoc,
    lop: classRow?.lop ?? null,
  };
}

// Danh sách học sinh thuộc lớp/năm học, join qua enrollments
async function fetchClassStudents(lop, namHoc) {
  const { data, error } = await supabase
    .from("enrollments")
    .select("username, users(*)")
    .eq("lop", lop)
    .eq("nam_hoc", namHoc);

  if (error) throw error;

  return (data ?? [])
    .map((row) => normalizeStudent(row.users))
    .filter((s) => s.username)
    .sort((a, b) => (a.hoTen || "").localeCompare(b.hoTen || "", "vi"));
}

// Điểm + tổng kết học kỳ + các buổi điểm danh ngoại lệ của 1 học sinh
async function fetchStudentAcademic(username, namHoc, hocKyInt) {
  const [gradesRes, termRes, attendanceRes] = await Promise.all([
    supabase.from("grades").select("*")
      .eq("username", username).eq("nam_hoc", namHoc).eq("hoc_ky", hocKyInt).maybeSingle(),
    supabase.from("term_summary").select("*")
      .eq("username", username).eq("nam_hoc", namHoc).eq("hoc_ky", hocKyInt).maybeSingle(),
    supabase.from("attendance").select("ngay, trang_thai")
      .eq("username", username).eq("nam_hoc", namHoc).eq("hoc_ky", hocKyInt)
      .order("ngay", { ascending: true }),
  ]);

  [gradesRes, termRes, attendanceRes].forEach((r, i) => {
    if (r.error) console.error(`fetchStudentAcademic[${i}] error:`, r.error);
  });

  return {
    grades:               gradesRes.data ?? null,
    term:                 termRes.data   ?? null,
    attendanceExceptions: attendanceRes.data ?? [],
  };
}

// Lịch điểm danh (ngày bắt đầu + tổng số buổi) của cả lớp, cho cả HK1 và HK2.
// term_summary lưu theo từng học sinh nên lấy đại diện 1 dòng có dữ liệu cho mỗi học kỳ.
async function fetchClassTermRanges(lop, namHoc) {
  const { data, error } = await supabase
    .from("term_summary")
    .select("hoc_ky, ngay_bat_dau, tong_buoi")
    .eq("lop", lop)
    .eq("nam_hoc", namHoc)
    .not("ngay_bat_dau", "is", null)
    .order("hoc_ky", { ascending: true });

  if (error) throw error;

  const ranges = { HK1: { start: null, sundays: [] }, HK2: { start: null, sundays: [] } };
  (data ?? []).forEach((row) => {
    const key = row.hoc_ky === 2 ? "HK2" : "HK1";
    if (ranges[key].start) return; // đã có dữ liệu đại diện cho học kỳ này rồi
    ranges[key] = { start: row.ngay_bat_dau, sundays: buildSundayList(row.ngay_bat_dau, row.tong_buoi) };
  });
  return ranges;
}

// Tổng hợp dữ liệu cho Bảng Tổng Kết Lớp: điểm thi/TB + học lực/hạnh kiểm +
// số buổi vắng (có phép / không phép) của từng học sinh trong 1 học kỳ.
async function fetchClassSummary(usernames, namHoc, hocKyInt) {
  if (!usernames.length) return {};

  const [gradesRes, termRes, attendanceRes] = await Promise.all([
    supabase.from("grades").select("username, diem_thi, diem_tb")
      .eq("nam_hoc", namHoc).eq("hoc_ky", hocKyInt).in("username", usernames),
    supabase.from("term_summary").select("username, hoc_luc, hanh_kiem")
      .eq("nam_hoc", namHoc).eq("hoc_ky", hocKyInt).in("username", usernames),
    supabase.from("attendance").select("username, trang_thai")
      .eq("nam_hoc", namHoc).eq("hoc_ky", hocKyInt).in("username", usernames),
  ]);

  [gradesRes, termRes, attendanceRes].forEach((r, i) => {
    if (r.error) console.error(`fetchClassSummary[${i}] error:`, r.error);
  });

  const byUser = {};
  usernames.forEach((u) => {
    byUser[u] = { diemThi: null, diemTB: null, hocLuc: null, hanhKiem: null, vangCoPhep: 0, vangKhongPhep: 0 };
  });

  (gradesRes.data ?? []).forEach((g) => {
    if (byUser[g.username]) {
      byUser[g.username].diemThi = g.diem_thi;
      byUser[g.username].diemTB  = g.diem_tb;
    }
  });

  (termRes.data ?? []).forEach((t) => {
    if (byUser[t.username]) {
      byUser[t.username].hocLuc   = t.hoc_luc;
      byUser[t.username].hanhKiem = t.hanh_kiem;
    }
  });

  (attendanceRes.data ?? []).forEach((a) => {
    const u = byUser[a.username];
    if (!u) return;
    if (a.trang_thai === "nghi_phep")       u.vangCoPhep    += 1;
    if (a.trang_thai === "nghi_khong_phep") u.vangKhongPhep += 1;
  });

  return byUser;
}

/* ============================================================
   ROUTE GUARD — bọc quanh <TeacherClassView /> trong App.jsx
   ============================================================
   Cách dùng trong App.jsx:

   const TeacherClassView = lazyWithRetry(() => import("./components/TeacherClassView.jsx"));
   ...
   <Route
     path="giáo-viên/lớp-học"
     element={
       <RequireTeacherRoute>
         <TeacherClassView />
       </RequireTeacherRoute>
     }
   />
   ============================================================ */
export function RequireTeacherRoute({ children }) {
  const [status, setStatus] = useState("checking"); // checking | ok | denied

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Kiểm tra nhanh bằng cache local trước để tránh nháy màn hình,
      // nhưng luôn xác minh lại với DB vì localStorage có thể bị sửa tay.
      const cachedRole = localStorage.getItem("role");
      if (cachedRole && cachedRole !== "teacher") {
        if (!cancelled) setStatus("denied");
        return;
      }

      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) { if (!cancelled) setStatus("denied"); return; }

        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("auth_id", authUser.id)
          .maybeSingle();

        if (cancelled) return;

        if (error || !data || data.role !== "teacher") {
          setStatus("denied");
        } else {
          localStorage.setItem("role", "teacher");
          setStatus("ok");
        }
      } catch (err) {
        console.error("RequireTeacherRoute check error:", err);
        if (!cancelled) setStatus("denied");
      }
    })();

    return () => { cancelled = true; };
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-[60vh] w-full flex items-center justify-center">
        <div className="flex items-center gap-2.5" style={{ color: ACCENT }}>
          <Spinner className="h-6 w-6" />
          <span className="text-sm font-medium text-stone-500">Đang xác thực quyền truy cập…</span>
        </div>
      </div>
    );
  }
  if (status === "denied") return <Navigate to="/" replace />;
  return children;
}

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
   ACADEMIC TAB — điểm số + tổng kết học kỳ + điểm danh
   (giữ nguyên logic hiện có — chưa đụng tới đồng bộ term_summary)
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

  const load = useCallback(async () => {
    setLoading(true);
    setAttendanceOverrides({});
    try {
      const [result, ranges] = await Promise.all([
        fetchStudentAcademic(student.username, namHoc, hocKyInt),
        fetchClassTermRanges(lop, namHoc),
      ]);
      setGrades(result.grades ?? {});
      setTerm(result.term ?? { username: student.username, nam_hoc: namHoc, lop, hoc_ky: hocKyInt });
      setClassRanges(ranges);

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
    const idx = STATUS_CYCLE.indexOf(current);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    setAttendanceOverrides((prev) => ({ ...prev, [isoDate]: next }));
  };

  const saveGradesAndTerm = async () => {
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

      {/* BẢNG ĐIỂM */}
      <div className="bg-[#F9F9F9] rounded-2xl border border-stone-100 p-4">
        <h3 className="text-[14px] font-bold text-stone-800 mb-3">Bảng điểm</h3>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {GRADE_FIELDS.map((f) => (
            <EditableScoreCell key={f.key} label={f.label} value={grades[f.key]}
              onChange={(v) => setGrades((prev) => ({ ...prev, [f.key]: v }))} />
          ))}
        </div>
      </div>

      {/* ĐIỂM DANH */}
      <div className="bg-[#F9F9F9] rounded-2xl border border-stone-100 p-4">
        <div className="flex items-center justify-between mb-3 gap-3">
          <h3 className="text-[14px] font-bold text-stone-800">
            Điểm danh <span className="text-stone-400 font-normal">({attendanceList.length} tuần)</span>
          </h3>
          <button type="button"
            disabled={savingAttendance || Object.keys(attendanceOverrides).length === 0}
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
                  <button key={isoDate} type="button" onClick={() => cycleStatus(isoDate, trangThai)}
                    className="flex flex-col items-center gap-1.5 flex-shrink-0 w-12 group">
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
      <div className="bg-[#F9F9F9] rounded-2xl border border-stone-100 p-4">
        <h3 className="text-[14px] font-bold text-stone-800 mb-3">Tổng kết học kỳ</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex flex-col gap-1 text-[12px] text-stone-500 font-medium">
            Học lực
            <select value={term.hoc_luc || ""} onChange={(e) => setTerm((p) => ({ ...p, hoc_luc: e.target.value }))}
              className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]">
              <option value="">— Chưa chọn —</option>
              {HOC_LUC_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-[12px] text-stone-500 font-medium">
            Hạnh kiểm
            <select value={term.hanh_kiem || ""} onChange={(e) => setTerm((p) => ({ ...p, hanh_kiem: e.target.value }))}
              className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]">
              <option value="">— Chưa chọn —</option>
              {HANH_KIEM_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-[12px] text-stone-500 font-medium">
            Vị thứ
            <input type="number" min="1" value={term.vi_thu ?? ""} onChange={(e) => setTerm((p) => ({ ...p, vi_thu: e.target.value }))}
              className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]" />
          </label>

          <label className="flex flex-col gap-1 text-[12px] text-stone-500 font-medium sm:col-span-3">
            Ghi chú
            <textarea rows={2} value={term.ghi_chu || ""} onChange={(e) => setTerm((p) => ({ ...p, ghi_chu: e.target.value }))}
              className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] resize-none" />
          </label>
        </div>

        <div className="flex justify-end mt-3">
          <button type="button" disabled={savingGrades} onClick={saveGradesAndTerm}
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
   ĐIỂM DANH NHANH — cả lớp trong 1 ngày, tick rẹt rẹt, lưu 1 lần duy nhất.
   Khác với điểm danh trong AcademicTab (theo lịch cố định của từng học
   sinh), view này cho phép chọn BẤT KỲ ngày nào và áp dụng cho toàn lớp,
   phù hợp với thao tác điểm danh thực tế mỗi buổi học.
   ============================================================ */
function BulkAttendanceView({ students, namHoc, lop, onBack, showToast }) {
  const [hocKy, setHocKy] = useState("HK1");
  const hocKyInt          = HK_INT_MAP[hocKy];
  const [date, setDate]   = useState(() => new Date().toISOString().slice(0, 10));
  const [statuses, setStatuses] = useState({}); // username -> trang_thai (đang sửa)
  const [initial,  setInitial]  = useState({}); // snapshot lúc vừa tải, để biết ai đã đổi
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  // Lịch điểm danh (ngày bắt đầu + tổng số buổi) của cả lớp, theo từng học kỳ —
  // dùng để tự chọn học kỳ/Chủ Nhật hiện tại và giới hạn không cho chọn quá phạm vi buổi học.
  const [termRanges, setTermRanges] = useState({ HK1: { start: null, sundays: [] }, HK2: { start: null, sundays: [] } });
  const didAutoSelect = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const ranges = await fetchClassTermRanges(lop, namHoc);
        if (cancelled) return;
        setTermRanges(ranges);

        // Chỉ tự động chọn học kỳ + Chủ Nhật một lần khi vừa vào màn hình.
        if (!didAutoSelect.current) {
          didAutoSelect.current = true;
          const todaySunday  = mostRecentSunday();
          const activeHocKy  = resolveActiveHocKy(ranges, todaySunday);
          const activeRange  = ranges[activeHocKy];
          const defaultDate  = activeRange.sundays.length
            ? clampToSundayRange(todaySunday, activeRange.sundays)
            : todaySunday;
          setHocKy(activeHocKy);
          setDate(toISODate(defaultDate));
        }
      } catch (err) {
        console.error("load class term ranges error:", err);
      }
    })();
    return () => { cancelled = true; };
  }, [lop, namHoc]);

  // Khi giáo viên đổi tab học kỳ, đưa ngày đang chọn về đúng phạm vi buổi học của học kỳ đó.
  const handleHocKyChange = (k) => {
    setHocKy(k);
    const range = termRanges[k];
    if (range?.sundays.length) {
      setDate(toISODate(clampToSundayRange(mostRecentSunday(), range.sundays)));
    }
  };

  const currentRange = termRanges[hocKy];
  const hasSchedule  = !!currentRange?.sundays.length;

  // Danh sách cố định, xếp theo Tên (không theo Họ) — không có ô tìm kiếm/lọc
  const rosterStudents = useMemo(() => sortStudentsByTen(students), [students]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("attendance")
          .select("username, trang_thai")
          .eq("nam_hoc", namHoc)
          .eq("hoc_ky", hocKyInt)
          .eq("ngay", date);
        if (error) throw error;

        const saved = {};
        (data ?? []).forEach((r) => { saved[r.username] = r.trang_thai; });

        const full = {};
        rosterStudents.forEach((s) => { full[s.username] = saved[s.username] ?? "co_mat"; });

        if (!cancelled) { setStatuses(full); setInitial(full); }
      } catch (err) {
        console.error("load bulk attendance error:", err);
        if (!cancelled) showToast("Không tải được điểm danh ngày này", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [date, namHoc, hocKyInt, rosterStudents, showToast]);

  const setOne = (username, status) => setStatuses((prev) => ({ ...prev, [username]: status }));
  const setAll = (status) => {
    const full = {};
    rosterStudents.forEach((s) => { full[s.username] = status; });
    setStatuses(full);
  };

  const changedCount = useMemo(
    () => rosterStudents.filter((s) => statuses[s.username] !== initial[s.username]).length,
    [rosterStudents, statuses, initial]
  );

  const save = async () => {
    setSaving(true);
    try {
      const rows = rosterStudents.map((s) => ({
        username: s.username, nam_hoc: namHoc, hoc_ky: hocKyInt,
        ngay: date, trang_thai: statuses[s.username] ?? "co_mat",
      }));
      const { error } = await supabase.from("attendance")
        .upsert(rows, { onConflict: "username,nam_hoc,hoc_ky,ngay" });
      if (error) throw error;

      setInitial(statuses);
      showToast(`Đã lưu điểm danh cho ${rows.length} học sinh`, "success");
    } catch (err) {
      console.error("save bulk attendance error:", err);
      showToast("Lưu điểm danh thất bại", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-stone-100">
        <button type="button" onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-stone-500 hover:text-stone-800 flex-shrink-0">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        <div className="hidden sm:block w-px h-5 bg-stone-200" />
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <CalendarCheck className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} />
          {hasSchedule ? (
            <select value={date} onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B35]">
              {currentRange.sundays.map((d, idx) => (
                <option key={toISODate(d)} value={toISODate(d)}>
                  Buổi {idx + 1} · {formatVNDate(d)}
                </option>
              ))}
            </select>
          ) : (
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B35]" />
          )}
          <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
            {["HK1", "HK2"].map((k) => (
              <button key={k} type="button" onClick={() => handleHocKyChange(k)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                  hocKy === k ? "bg-white text-[#FF6B35] shadow-sm" : "text-stone-500"
                }`}>
                {k === "HK1" ? "Học Kỳ I" : "Học Kỳ II"}
              </button>
            ))}
          </div>
        </div>
        <button type="button" disabled={saving || changedCount === 0} onClick={save}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B35] text-white text-[13px] font-bold hover:bg-[#E85E28] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 w-full sm:w-auto">
          {saving && <Spinner className="h-4 w-4" />}
          {saving ? "Đang lưu…" : changedCount > 0 ? `Lưu (${changedCount} thay đổi)` : "Lưu điểm danh"}
        </button>
      </div>

      {!hasSchedule && (
        <div className="px-5 py-2.5 border-b border-stone-100 bg-amber-50/60 text-[12px] text-amber-700">
          Chưa có lịch điểm danh cho học kỳ này — vào tab "Điểm & điểm danh" của một học sinh để nhập "Ngày bắt đầu học kỳ" &amp; "Tổng số buổi".
        </div>
      )}

      {/* QUICK ACTIONS */}
      <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-stone-100 bg-[#F9F9F9]">
        <span className="text-[12px] text-stone-400 font-medium mr-1">Đặt tất cả:</span>
        {STATUS_CYCLE.map((k) => (
          <button key={k} type="button" onClick={() => setAll(k)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-[12px] font-semibold text-stone-600 hover:border-stone-300 transition-colors">
            <span className={`w-2.5 h-2.5 rounded-full ${ATTENDANCE_STATUS[k].color}`} />
            {ATTENDANCE_STATUS[k].label}
          </button>
        ))}
      </div>

      {/* BẢNG ĐIỂM DANH — cột Học sinh cố định (sticky), không giới hạn chiều cao,
          cuộn theo trang chứ không cuộn riêng bên trong bảng. */}
      {loading ? (
        <div className="flex items-center justify-center gap-2.5 py-14" style={{ color: ACCENT }}>
          <Spinner className="h-5 w-5" />
          <span className="text-sm text-stone-500">Đang tải điểm danh…</span>
        </div>
      ) : (
        <>
          {/* MOBILE: danh sách dạng thẻ, mỗi học sinh 1 hàng nút to dễ bấm bằng ngón tay */}
          <div className="md:hidden divide-y divide-stone-50" data-lenis-prevent>
            {rosterStudents.map((s, idx) => {
              const status  = statuses[s.username] ?? "co_mat";
              const isDirty = statuses[s.username] !== initial[s.username];
              return (
                <div key={s.username} className={`px-4 py-3 ${isDirty ? "bg-orange-50/40" : ""}`}>
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span className="text-[11px] font-medium text-stone-400 w-4 flex-shrink-0 text-center">{idx + 1}</span>
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-200 flex-shrink-0 bg-stone-100">
                      <img src={s.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[13px] font-semibold text-stone-800 truncate min-w-0 flex-1">
                      {s.tenThanh ? `${s.tenThanh} ` : ""}{s.hoTen}
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 pl-[42px]">
                    {STATUS_CYCLE.map((k) => {
                      const active = status === k;
                      return (
                        <button key={k} type="button" onClick={() => setOne(s.username, k)} title={ATTENDANCE_STATUS[k].label}
                          className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all ${
                            active ? `${ATTENDANCE_STATUS[k].color} ring-2 ring-offset-1 ring-stone-300` : "bg-stone-100"
                          }`}>
                          {active ? (
                            <Check className="w-3.5 h-3.5 text-white drop-shadow" strokeWidth={3} />
                          ) : (
                            <span className="w-3.5 h-3.5" />
                          )}
                          <span className={`text-[9px] font-semibold leading-tight text-center ${active ? "text-white" : "text-stone-500"}`}>
                            {ATTENDANCE_STATUS[k].label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {rosterStudents.length === 0 && (
              <p className="text-center text-sm text-stone-400 py-10 px-4">Lớp chưa có học sinh nào.</p>
            )}
          </div>

          {/* DESKTOP: bảng đầy đủ, cột Học sinh cố định (sticky) */}
          <div className="hidden md:block overflow-auto max-h-[65vh]" data-lenis-prevent>
            <table className="w-full text-sm border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-[#F9F9F9] text-[11px] text-stone-400 uppercase tracking-wide">
                  <th className="text-center font-semibold px-3 py-3 sticky top-0 left-0 bg-[#F9F9F9] z-20 w-12">STT</th>
                  <th className="text-left font-semibold px-4 py-3 sticky top-0 left-[48px] bg-[#F9F9F9] z-20">Họ & Tên</th>
                  {STATUS_CYCLE.map((k) => (
                    <th key={k} className="font-semibold px-2 py-3 text-center min-w-[112px] sticky top-0 bg-[#F9F9F9] z-10">
                      <span className="inline-flex items-center gap-1.5 justify-center whitespace-nowrap">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${ATTENDANCE_STATUS[k].color}`} />
                        {ATTENDANCE_STATUS[k].label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rosterStudents.map((s, idx) => {
                  const status  = statuses[s.username] ?? "co_mat";
                  const isDirty = statuses[s.username] !== initial[s.username];
                  const rowBg   = isDirty ? "bg-orange-50/40" : "bg-white";
                  return (
                    <tr key={s.username} className="border-b border-stone-50">
                      <td className={`px-3 py-2 text-center sticky left-0 z-10 text-[12px] font-medium text-stone-400 w-12 ${rowBg}`}>
                        {idx + 1}
                      </td>
                      <td className={`px-4 py-2 sticky left-[48px] z-10 ${rowBg}`}>
                        <div className="flex items-center gap-2.5 min-w-[170px]">
                          <div className="w-7 h-7 rounded-full overflow-hidden border border-stone-200 flex-shrink-0 bg-stone-100">
                            <img src={s.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-stone-800 truncate">
                              {s.tenThanh ? `${s.tenThanh} ` : ""}{s.hoTen}
                            </p>
                          </div>
                        </div>
                      </td>
                      {STATUS_CYCLE.map((k) => {
                        const active = status === k;
                        return (
                          <td key={k} className="px-2 py-2 text-center">
                            <button type="button" onClick={() => setOne(s.username, k)} title={ATTENDANCE_STATUS[k].label}
                              className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-all ${
                                active ? `${ATTENDANCE_STATUS[k].color} ring-2 ring-offset-1 ring-stone-300 scale-105` : "bg-stone-100 hover:bg-stone-200"
                              }`}>
                              {active && <Check className="w-4 h-4 text-white drop-shadow" strokeWidth={3} />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {rosterStudents.length === 0 && (
                  <tr>
                    <td colSpan={2 + STATUS_CYCLE.length} className="text-center text-sm text-stone-400 py-10">
                      Lớp chưa có học sinh nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   NHẬP ĐIỂM NHANH — dạng bảng tính, Enter/↓ nhảy xuống học sinh kế
   tiếp trong cùng cột, tự động tính điểm TB theo công thức nhưng vẫn
   cho phép sửa tay (ô sẽ viền cam khi đã override).
   ============================================================ */
function BulkGradeEntryView({ students, namHoc, lop, showToast, onBack }) {
  const [hocKy, setHocKy] = useState("HK1");
  const hocKyInt           = HK_INT_MAP[hocKy];
  const [rows,    setRows]    = useState({}); // username -> { diem_mieng, ..., diem_tb }
  const [initial, setInitial] = useState({});
  const [manualTB, setManualTB] = useState({}); // username -> true nếu điểm TB đã bị sửa tay
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const cellRefs = useRef({});
  const didAutoSelectHocKy = useRef(false);

  // Danh sách cố định, xếp theo Tên (không theo Họ) — cùng thứ tự với bảng điểm danh nhanh
  const rosterStudents = useMemo(() => sortStudentsByTen(students), [students]);

  // Tự chọn học kỳ hiện tại dựa trên ngày bắt đầu HK2 của lớp (giống Điểm danh nhanh)
  useEffect(() => {
    if (didAutoSelectHocKy.current) return;
    let cancelled = false;
    (async () => {
      try {
        const ranges = await fetchClassTermRanges(lop, namHoc);
        if (cancelled || didAutoSelectHocKy.current) return;
        didAutoSelectHocKy.current = true;
        setHocKy(resolveActiveHocKy(ranges, mostRecentSunday()));
      } catch (err) {
        console.error("load class term ranges error:", err);
      }
    })();
    return () => { cancelled = true; };
  }, [lop, namHoc]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const usernames = rosterStudents.map((s) => s.username);
        const { data, error } = await supabase.from("grades").select("*")
          .eq("nam_hoc", namHoc).eq("hoc_ky", hocKyInt).in("username", usernames);
        if (error) throw error;

        const byUser = {};
        (data ?? []).forEach((r) => { byUser[r.username] = r; });

        const full = {};
        const manual = {};
        rosterStudents.forEach((s) => {
          const g = byUser[s.username] ?? {};
          full[s.username] = {
            diem_mieng:   g.diem_mieng   ?? null,
            diem_vo:      g.diem_vo      ?? null,
            diem_15_phut: g.diem_15_phut ?? null,
            diem_1_tiet:  g.diem_1_tiet  ?? null,
            diem_thi:     g.diem_thi     ?? null,
            diem_tb:      g.diem_tb      ?? null,
          };
          // Nếu điểm TB đã lưu khác với công thức tự tính -> coi như giáo viên
          // từng sửa tay, giữ nguyên khi vừa tải để không âm thầm ghi đè.
          const auto = computeDiemTB(full[s.username]);
          if (g.diem_tb != null && auto != null && Number(g.diem_tb) !== auto) manual[s.username] = true;
        });

        if (!cancelled) { setRows(full); setInitial(full); setManualTB(manual); }
      } catch (err) {
        console.error("load bulk grades error:", err);
        if (!cancelled) showToast("Không tải được bảng điểm", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [rosterStudents, namHoc, hocKyInt, showToast]);

  const updateCell = (username, field, raw) => {
    const value = raw === "" ? null : Number(raw);
    setRows((prev) => {
      const g = { ...prev[username], [field]: value };
      if (!manualTB[username]) g.diem_tb = computeDiemTB(g);
      return { ...prev, [username]: g };
    });
  };

  const updateTBManual = (username, raw) => {
    setManualTB((prev) => ({ ...prev, [username]: true }));
    setRows((prev) => ({ ...prev, [username]: { ...prev[username], diem_tb: raw === "" ? null : Number(raw) } }));
  };

  const resetTBAuto = (username) => {
    setManualTB((prev) => ({ ...prev, [username]: false }));
    setRows((prev) => ({ ...prev, [username]: { ...prev[username], diem_tb: computeDiemTB(prev[username]) } }));
  };

  const changedCount = useMemo(
    () => rosterStudents.filter((s) => JSON.stringify(rows[s.username]) !== JSON.stringify(initial[s.username])).length,
    [rosterStudents, rows, initial]
  );

  const focusCell = (rowIdx, field) => {
    const target = rosterStudents[rowIdx];
    if (!target) return;
    const el = cellRefs.current[`${target.username}-${field}`];
    if (el) { el.focus(); el.select?.(); }
  };

  const handleKeyDown = (e, rowIdx, field) => {
    if (e.key === "Enter" || e.key === "ArrowDown") { e.preventDefault(); focusCell(rowIdx + 1, field); }
    else if (e.key === "ArrowUp")                    { e.preventDefault(); focusCell(rowIdx - 1, field); }
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = rosterStudents.map((s) => {
        const g = rows[s.username] ?? {};
        return {
          username: s.username, nam_hoc: namHoc, hoc_ky: hocKyInt,
          diem_mieng: g.diem_mieng ?? null, diem_vo: g.diem_vo ?? null,
          diem_15_phut: g.diem_15_phut ?? null, diem_1_tiet: g.diem_1_tiet ?? null,
          diem_thi: g.diem_thi ?? null, diem_tb: g.diem_tb ?? null,
          updated_at: new Date().toISOString(),
        };
      });
      const { error } = await supabase.from("grades")
        .upsert(payload, { onConflict: "username,nam_hoc,hoc_ky" });
      if (error) throw error;

      setInitial(rows);
      showToast(`Đã lưu điểm cho ${payload.length} học sinh`, "success");
    } catch (err) {
      console.error("save bulk grades error:", err);
      showToast("Lưu điểm thất bại", "error");
    } finally {
      setSaving(false);
    }
  };

  const scoreFields = GRADE_FIELDS.filter((f) => f.key !== "diem_tb");

  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-stone-100">
        <button type="button" onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-stone-500 hover:text-stone-800 flex-shrink-0">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        <div className="hidden sm:block w-px h-5 bg-stone-200" />
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <Table className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} />
          <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
            {["HK1", "HK2"].map((k) => (
              <button key={k} type="button" onClick={() => setHocKy(k)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                  hocKy === k ? "bg-white text-[#FF6B35] shadow-sm" : "text-stone-500"
                }`}>
                {k === "HK1" ? "Học Kỳ I" : "Học Kỳ II"}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-stone-400 hidden md:inline">
            Enter hoặc ↓ để nhảy xuống học sinh tiếp theo
          </span>
        </div>
        <button type="button" disabled={saving || changedCount === 0} onClick={save}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B35] text-white text-[13px] font-bold hover:bg-[#E85E28] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 w-full sm:w-auto">
          {saving && <Spinner className="h-4 w-4" />}
          {saving ? "Đang lưu…" : changedCount > 0 ? `Lưu (${changedCount} thay đổi)` : "Lưu bảng điểm"}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2.5 py-14" style={{ color: ACCENT }}>
          <Spinner className="h-5 w-5" />
          <span className="text-sm text-stone-500">Đang tải bảng điểm…</span>
        </div>
      ) : (
        <>
          {/* MOBILE: mỗi học sinh 1 thẻ, các ô điểm xếp lưới để chạm dễ hơn bảng ngang */}
          <div className="md:hidden divide-y divide-stone-50" data-lenis-prevent>
            {rosterStudents.map((s, rowIdx) => {
              const g = rows[s.username] ?? {};
              const isDirty = JSON.stringify(g) !== JSON.stringify(initial[s.username]);
              return (
                <div key={s.username} className={`px-4 py-3.5 ${isDirty ? "bg-orange-50/30" : ""}`}>
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="text-[11px] font-medium text-stone-400 w-4 flex-shrink-0 text-center">{rowIdx + 1}</span>
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-200 flex-shrink-0 bg-stone-100">
                      <img src={s.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[13px] font-semibold text-stone-800 truncate min-w-0 flex-1">
                      {s.tenThanh ? `${s.tenThanh} ` : ""}{s.hoTen}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pl-[42px]">
                    {scoreFields.map((f) => (
                      <label key={f.key} className="flex flex-col gap-1">
                        <span className="text-[10px] text-stone-400 font-medium">{f.label}</span>
                        <input
                          type="number" min="0" max="10" step="0.1" inputMode="decimal"
                          value={g[f.key] ?? ""}
                          onChange={(e) => updateCell(s.username, f.key, e.target.value)}
                          className="w-full text-center rounded-lg border border-stone-200 py-2 text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                        />
                      </label>
                    ))}
                    <label className="flex flex-col gap-1">
                      <span className="text-[10px] text-stone-400 font-medium">TB</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number" min="0" max="10" step="0.01" inputMode="decimal"
                          value={g.diem_tb ?? ""}
                          onChange={(e) => updateTBManual(s.username, e.target.value)}
                          className={`w-full text-center rounded-lg border py-2 text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent ${tbColorClass(g.diem_tb)} ${
                            manualTB[s.username] ? "border-[#FF6B35] bg-orange-50/40" : "border-stone-200"
                          }`}
                        />
                        {manualTB[s.username] && (
                          <button type="button" title="Tính lại tự động" onClick={() => resetTBAuto(s.username)}
                            className="text-[13px] text-stone-400 hover:text-[#FF6B35] flex-shrink-0">↺</button>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              );
            })}
            {rosterStudents.length === 0 && (
              <p className="text-center text-sm text-stone-400 py-10 px-4">Lớp chưa có học sinh nào.</p>
            )}
          </div>

          {/* DESKTOP: bảng tính, Enter/↓ nhảy dòng */}
          <div className="hidden md:block overflow-auto max-h-[65vh]" data-lenis-prevent>
            <table className="w-full text-sm border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-[#F9F9F9] text-[11px] text-stone-400 uppercase tracking-wide">
                  <th className="text-center font-semibold px-3 py-3 sticky top-0 left-0 bg-[#F9F9F9] z-20 w-12">STT</th>
                  <th className="text-left font-semibold px-4 py-3 sticky top-0 left-[48px] bg-[#F9F9F9] z-20">Họ & Tên</th>
                  {scoreFields.map((f) => (
                    <th key={f.key} className="font-semibold px-2 py-3 text-center min-w-[84px] sticky top-0 bg-[#F9F9F9] z-10">{f.label}</th>
                  ))}
                  <th className="font-semibold px-2 py-3 text-center min-w-[90px] sticky top-0 bg-[#F9F9F9] z-10">TB</th>
                </tr>
              </thead>
              <tbody>
                {rosterStudents.map((s, rowIdx) => {
                  const g = rows[s.username] ?? {};
                  const isDirty = JSON.stringify(g) !== JSON.stringify(initial[s.username]);
                  const rowBg   = isDirty ? "bg-orange-50/30" : "bg-white";
                  return (
                    <tr key={s.username} className="border-b border-stone-50">
                      <td className={`px-3 py-2 text-center sticky left-0 z-10 text-[12px] font-medium text-stone-400 w-12 ${rowBg}`}>
                        {rowIdx + 1}
                      </td>
                      <td className={`px-4 py-2 sticky left-[48px] z-10 ${rowBg}`}>
                        <div className="flex items-center gap-2.5 min-w-[160px]">
                          <div className="w-7 h-7 rounded-full overflow-hidden border border-stone-200 flex-shrink-0 bg-stone-100">
                            <img src={s.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[13px] font-semibold text-stone-800 truncate">{s.tenThanh ? `${s.tenThanh} ` : ""}{s.hoTen}</span>
                        </div>
                      </td>
                      {scoreFields.map((f) => (
                        <td key={f.key} className="px-2 py-2 text-center">
                          <input
                            ref={(el) => { cellRefs.current[`${s.username}-${f.key}`] = el; }}
                            type="number" min="0" max="10" step="0.1"
                            value={g[f.key] ?? ""}
                            onChange={(e) => updateCell(s.username, f.key, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, rowIdx, f.key)}
                            className="w-16 text-center rounded-lg border border-stone-200 py-1.5 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                          />
                        </td>
                      ))}
                      <td className="px-2 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            ref={(el) => { cellRefs.current[`${s.username}-diem_tb`] = el; }}
                            type="number" min="0" max="10" step="0.01"
                            value={g.diem_tb ?? ""}
                            onChange={(e) => updateTBManual(s.username, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, rowIdx, "diem_tb")}
                            className={`w-16 text-center rounded-lg border py-1.5 text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent ${tbColorClass(g.diem_tb)} ${
                              manualTB[s.username] ? "border-[#FF6B35] bg-orange-50/40" : "border-stone-200"
                            }`}
                          />
                          {manualTB[s.username] && (
                            <button type="button" title="Tính lại tự động" onClick={() => resetTBAuto(s.username)}
                              className="text-[11px] text-stone-400 hover:text-[#FF6B35] flex-shrink-0">↺</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="px-5 py-3 border-t border-stone-100 bg-[#F9F9F9] text-[11px] text-stone-400">
        Điểm TB tự tính theo công thức: Miệng×1, Vở×1, 15'×1, 1 Tiết×2, Thi×3 — có thể sửa tay (ô sẽ viền cam), bấm ↺ để tính lại tự động.
      </div>
    </div>
  );
}

/* ============================================================
   BẢNG TỔNG KẾT LỚP — chỉ xem (read-only), gộp điểm + học lực/hạnh
   kiểm + điểm danh thành 1 bảng "quét mắt" cho giáo viên, kèm cảnh
   báo tự động (đỏ) và xuất Excel / in-PDF.
   ============================================================ */
function ClassSummaryView({ students, namHoc, lop }) {
  const [hocKy, setHocKy] = useState("HK1");
  const hocKyInt = HK_INT_MAP[hocKy];
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  const rosterStudents = useMemo(() => sortStudentsByTen(students), [students]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const usernames = rosterStudents.map((s) => s.username);
        const data = await fetchClassSummary(usernames, namHoc, hocKyInt);
        if (!cancelled) setSummary(data);
      } catch (err) {
        console.error("load class summary error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [rosterStudents, namHoc, hocKyInt]);

  const rows = useMemo(() => {
    return rosterStudents.map((s) => {
      const d = summary[s.username] || {};
      const tongVang = (d.vangCoPhep || 0) + (d.vangKhongPhep || 0);
      // Cảnh báo: Điểm TB < 5 HOẶC tổng số buổi vắng (cả có phép + không phép) > 3.
      // Muốn chỉ tính vắng không phép: đổi "tongVang > 3" thành "(d.vangKhongPhep || 0) > 3".
      const warning = (d.diemTB != null && Number(d.diemTB) < 5) || tongVang > 3;
      return { student: s, ...d, tongVang, warning };
    });
  }, [rosterStudents, summary]);

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const data = rows.map((r, idx) => ({
      "STT": idx + 1,
      "Họ & Tên": `${r.student.tenThanh ? r.student.tenThanh + " " : ""}${r.student.hoTen || r.student.username}`,
      "Điểm Thi": r.diemThi ?? "",
      "Điểm TB": r.diemTB ?? "",
      "Học Lực": r.hocLuc ?? "",
      "Hạnh Kiểm": r.hanhKiem ?? "",
      "Vắng Có Phép": r.vangCoPhep || 0,
      "Vắng Không Phép": r.vangKhongPhep || 0,
      "Trạng Thái Học Tập": r.warning ? "Cần theo dõi" : "Ổn định",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [{ wch: 5 }, { wch: 26 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 13 }, { wch: 15 }, { wch: 16 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, hocKy === "HK1" ? "Học kỳ I" : "Học kỳ II");
    XLSX.writeFile(wb, `TongKetLop_${lop}_${hocKy}_${namHoc}.xlsx`);
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm flex items-center justify-center gap-2.5 py-14" style={{ color: ACCENT }}>
        <Spinner className="h-5 w-5" />
        <span className="text-sm text-stone-500">Đang tổng hợp dữ liệu lớp…</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
      {/* Chỉ in phần bảng, ẩn toàn bộ phần còn lại của trang khi bấm "In / Xuất PDF" */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #tk-summary-print, #tk-summary-print * { visibility: visible; }
          #tk-summary-print { position: absolute; left: 0; top: 0; width: 100%; }
          .tk-no-print { display: none !important; }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-stone-100 tk-no-print">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <LayoutDashboard className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} />
          <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
            {["HK1", "HK2"].map((k) => (
              <button key={k} type="button" onClick={() => setHocKy(k)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                  hocKy === k ? "bg-white text-[#FF6B35] shadow-sm" : "text-stone-500"
                }`}>
                {k === "HK1" ? "Học Kỳ I" : "Học Kỳ II"}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-stone-400 hidden md:inline">
            Chỉ xem — dòng đỏ: Điểm TB &lt; 5 hoặc vắng &gt; 3 buổi
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto flex-shrink-0">
          <button type="button" onClick={exportExcel}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-[13px] font-bold hover:bg-emerald-700 transition-colors">
            <FileSpreadsheet className="w-4 h-4" /> <span className="sm:inline">Xuất Excel</span>
          </button>
          <button type="button" onClick={handlePrint}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-[13px] font-bold hover:bg-stone-800 transition-colors">
            <Printer className="w-4 h-4" /> <span className="sm:inline">In / PDF</span>
          </button>
        </div>
      </div>

      <div id="tk-summary-print" className="p-5">
        <div className="hidden print:block mb-3">
          <h2 className="text-base font-bold text-stone-900">
            Bảng tổng kết lớp {lop} — {hocKy === "HK1" ? "Học kỳ I" : "Học kỳ II"} — {namHoc}
          </h2>
        </div>

        {/* MOBILE: mỗi học sinh 1 thẻ tổng hợp, dễ quét mắt hơn kéo ngang bảng */}
        <div className="md:hidden divide-y divide-stone-50 print:hidden">
          {rows.map((r, idx) => (
            <div key={r.student.username} className={`px-4 py-3.5 ${r.warning ? "bg-red-50/60" : ""}`}>
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="text-[11px] font-medium text-stone-400 w-4 flex-shrink-0 text-center">{idx + 1}</span>
                <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-200 flex-shrink-0 bg-stone-100">
                  <img src={r.student.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-[13px] font-semibold text-stone-800 truncate min-w-0 flex-1">
                  {r.student.tenThanh ? `${r.student.tenThanh} ` : ""}{r.student.hoTen || r.student.username}
                </span>
                {r.warning ? (
                  <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold whitespace-nowrap">
                    ⚠️ Theo dõi
                  </span>
                ) : (
                  <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold whitespace-nowrap">
                    ✓ Ổn định
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 pl-[42px] text-center">
                <div className="bg-[#F9F9F9] rounded-lg py-1.5">
                  <p className="text-[9px] text-stone-400 mb-0.5">Điểm Thi</p>
                  <p className="text-[13px] font-semibold text-stone-700">{r.diemThi ?? "—"}</p>
                </div>
                <div className="bg-[#F9F9F9] rounded-lg py-1.5">
                  <p className="text-[9px] text-stone-400 mb-0.5">Điểm TB</p>
                  <p className={`text-[13px] font-bold ${tbColorClass(r.diemTB)}`}>{r.diemTB ?? "—"}</p>
                </div>
                <div className="bg-[#F9F9F9] rounded-lg py-1.5">
                  <p className="text-[9px] text-stone-400 mb-0.5">Học Lực</p>
                  <p className="text-[12px] font-medium text-stone-600">{r.hocLuc || "—"}</p>
                </div>
                <div className="bg-[#F9F9F9] rounded-lg py-1.5">
                  <p className="text-[9px] text-stone-400 mb-0.5">Hạnh Kiểm</p>
                  <p className="text-[12px] font-medium text-stone-600">{r.hanhKiem || "—"}</p>
                </div>
                <div className="bg-[#F9F9F9] rounded-lg py-1.5">
                  <p className="text-[9px] text-stone-400 mb-0.5">Vắng CP</p>
                  <p className="text-[13px] font-medium text-stone-600">{r.vangCoPhep || 0}</p>
                </div>
                <div className="bg-[#F9F9F9] rounded-lg py-1.5">
                  <p className="text-[9px] text-stone-400 mb-0.5">Vắng KP</p>
                  <p className="text-[13px] font-medium text-stone-600">{r.vangKhongPhep || 0}</p>
                </div>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="text-center text-sm text-stone-400 py-10 px-4">Lớp chưa có học sinh nào.</p>
          )}
        </div>

        {/* DESKTOP + IN/PDF: bảng đầy đủ */}
        <div className="hidden md:block print:block overflow-auto max-h-[65vh] print:max-h-none print:overflow-visible" data-lenis-prevent>
          <table className="w-full text-sm border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-[#F9F9F9] text-[11px] text-stone-400 uppercase tracking-wide">
                <th className="text-center font-semibold px-3 py-3 sticky top-0 left-0 bg-[#F9F9F9] z-20 w-12">STT</th>
                <th className="text-left font-semibold px-4 py-3 sticky top-0 left-[48px] bg-[#F9F9F9] z-20">Họ & Tên</th>
                <th className="text-center font-semibold px-2 py-3 sticky top-0 bg-[#F9F9F9] z-10">Điểm Thi</th>
                <th className="text-center font-semibold px-2 py-3 sticky top-0 bg-[#F9F9F9] z-10">Điểm TB</th>
                <th className="text-center font-semibold px-2 py-3 sticky top-0 bg-[#F9F9F9] z-10">Học Lực</th>
                <th className="text-center font-semibold px-2 py-3 sticky top-0 bg-[#F9F9F9] z-10">Hạnh Kiểm</th>
                <th className="text-center font-semibold px-2 py-3 sticky top-0 bg-[#F9F9F9] z-10">Vắng CP</th>
                <th className="text-center font-semibold px-2 py-3 sticky top-0 bg-[#F9F9F9] z-10">Vắng KP</th>
                <th className="text-center font-semibold px-2 py-3 sticky top-0 bg-[#F9F9F9] z-10">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => {
                const rowBg = r.warning ? "bg-red-50" : "bg-white";
                return (
                  <tr key={r.student.username} className="border-b border-stone-50">
                    <td className={`px-3 py-2.5 text-center sticky left-0 z-10 text-[12px] font-medium text-stone-400 w-12 ${rowBg}`}>
                      {idx + 1}
                    </td>
                    <td className={`px-4 py-2.5 sticky left-[48px] z-10 ${rowBg}`}>
                      <div className="flex items-center gap-2.5 min-w-[170px]">
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-stone-200 flex-shrink-0 bg-stone-100 print:hidden">
                          <img src={r.student.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[13px] font-semibold text-stone-800">
                          {r.student.tenThanh ? `${r.student.tenThanh} ` : ""}{r.student.hoTen || r.student.username}
                        </span>
                      </div>
                    </td>
                    <td className={`px-2 py-2.5 text-center text-[13px] font-medium text-stone-700 ${rowBg}`}>{r.diemThi ?? "—"}</td>
                    <td className={`px-2 py-2.5 text-center text-[13px] font-bold ${tbColorClass(r.diemTB)} ${rowBg}`}>{r.diemTB ?? "—"}</td>
                    <td className={`px-2 py-2.5 text-center text-[12px] text-stone-600 ${rowBg}`}>{r.hocLuc || "—"}</td>
                    <td className={`px-2 py-2.5 text-center text-[12px] text-stone-600 ${rowBg}`}>{r.hanhKiem || "—"}</td>
                    <td className={`px-2 py-2.5 text-center text-[13px] text-stone-600 ${rowBg}`}>{r.vangCoPhep || 0}</td>
                    <td className={`px-2 py-2.5 text-center text-[13px] text-stone-600 ${rowBg}`}>{r.vangKhongPhep || 0}</td>
                    <td className={`px-2 py-2.5 text-center ${rowBg}`}>
                      {r.warning ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[11px] font-bold">
                          ⚠️ Cần theo dõi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                          ✓ Ổn định
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-sm text-stone-400 py-10">Lớp chưa có học sinh nào.</td>
                </tr>
              )}
            </tbody>
          </table>
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
   ROOT COMPONENT
   ============================================================ */
export default function TeacherClassView() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loadingContext, setLoadingContext] = useState(true);
  const [context,        setContext]        = useState(null); // { teacherUsername, namHoc, lop }
  const [students,       setStudents]       = useState([]);
  const [loadingStudents,setLoadingStudents]= useState(false);
  const [search,         setSearch]         = useState("");
  const [selectedUsername, setSelectedUsername] = useState(null);

  // "roster" = xem/sửa từng học sinh (mặc định) | "attendance" = điểm danh nhanh | "grades" = nhập điểm nhanh
  const [view, setView] = useState("summary");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingContext(true);
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) throw new Error("Chưa đăng nhập");
        const ctx = await fetchTeacherContext(authUser.id);
        if (!cancelled) setContext(ctx);
      } catch (err) {
        console.error("fetchTeacherContext error:", err);
        if (!cancelled) showToast("Không tải được thông tin lớp phụ trách", "error");
      } finally {
        if (!cancelled) setLoadingContext(false);
      }
    })();
    return () => { cancelled = true; };
  }, [showToast]);

  const reloadStudents = useCallback(async () => {
    if (!context?.lop) return;
    setLoadingStudents(true);
    try {
      const list = await fetchClassStudents(context.lop, context.namHoc);
      setStudents(list);
    } catch (err) {
      console.error("fetchClassStudents error:", err);
      showToast("Không tải được danh sách học sinh", "error");
    } finally {
      setLoadingStudents(false);
    }
  }, [context, showToast]);

  useEffect(() => { reloadStudents(); }, [reloadStudents]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      (s.hoTen || "").toLowerCase().includes(q) ||
      (s.username || "").toLowerCase().includes(q)
    );
  }, [students, search]);

  const selectedStudent = students.find((s) => s.username === selectedUsername) || null;

  const handleStudentSaved = (updated) => {
    setStudents((prev) => prev.map((s) => (s.username === updated.username ? { ...s, ...updated } : s)));
  };

  if (loadingContext) {
    return (
      <div className="min-h-[60vh] w-full flex items-center justify-center">
        <div className="flex items-center gap-2.5" style={{ color: ACCENT }}>
          <Spinner className="h-6 w-6" />
          <span className="text-sm font-medium text-stone-500">Đang tải lớp phụ trách…</span>
        </div>
      </div>
    );
  }

  if (!context?.lop) {
    return (
      <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-3 px-4 text-center">
        <GraduationCap className="w-10 h-10 text-stone-300" />
        <p className="text-stone-500 text-sm max-w-xs">
          Bạn chưa được phân công chủ nhiệm lớp nào trong năm học {getCurrentNamHoc()}.
        </p>
        <button type="button" onClick={() => navigate("/")}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline" style={{ color: ACCENT }}>
          <ChevronLeft className="w-4 h-4" /> Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <style>{`
        .tk-tabbar::-webkit-scrollbar { display: none; }
        .tk-tabbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="sticky top-16 z-30 bg-[#faf8f5]/95 backdrop-blur-sm border-b border-stone-200/60 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-6xl mx-auto flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Giáo viên chủ nhiệm</p>
              <h1 className="text-base sm:text-xl font-bold text-stone-900 truncate">Lớp {context.lop} · {context.namHoc}</h1>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-400 flex-shrink-0">
              <Users className="w-3.5 h-3.5" /> {students.length}
              <span className="hidden sm:inline">học sinh</span>
            </span>
          </div>

          {/* Chuyển nhanh giữa 4 chế độ làm việc — cuộn ngang trên mobile để không bị vỡ layout */}
          <div className="tk-tabbar flex gap-1.5 bg-stone-100 rounded-xl p-1 overflow-x-auto w-full sm:w-fit">
            <button type="button" onClick={() => setView("summary")}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg text-[12px] font-semibold transition-colors whitespace-nowrap ${
                view === "summary" ? "bg-white text-[#FF6B35] shadow-sm" : "text-stone-500"
              }`}>
              <LayoutDashboard className="w-3.5 h-3.5" /> Tổng kết lớp
            </button>
            <button type="button" onClick={() => setView("roster")}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg text-[12px] font-semibold transition-colors whitespace-nowrap ${
                view === "roster" ? "bg-white text-[#FF6B35] shadow-sm" : "text-stone-500"
              }`}>
              <ClipboardList className="w-3.5 h-3.5" /> Học sinh
            </button>
            <button type="button" onClick={() => setView("attendance")}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg text-[12px] font-semibold transition-colors whitespace-nowrap ${
                view === "attendance" ? "bg-white text-[#FF6B35] shadow-sm" : "text-stone-500"
              }`}>
              <CalendarCheck className="w-3.5 h-3.5" /> Điểm danh nhanh
            </button>
            <button type="button" onClick={() => setView("grades")}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg text-[12px] font-semibold transition-colors whitespace-nowrap ${
                view === "grades" ? "bg-white text-[#FF6B35] shadow-sm" : "text-stone-500"
              }`}>
              <Table className="w-3.5 h-3.5" /> Nhập điểm nhanh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {view === "attendance" && (
          <BulkAttendanceView
            students={students}
            namHoc={context.namHoc}
            lop={context.lop}
            showToast={showToast}
            onBack={() => setView("summary")}
          />
        )}

        {view === "summary" && (
          <ClassSummaryView
            students={students}
            namHoc={context.namHoc}
            lop={context.lop}
          />
        )}

        {view === "grades" && (
          <BulkGradeEntryView
            students={students}
            namHoc={context.namHoc}
            lop={context.lop}
            showToast={showToast}
            onBack={() => setView("summary")}
          />
        )}

        {view === "roster" && (
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
                onBack={() => setView("summary")}
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
        )}
      </div>
    </div>
  );
}