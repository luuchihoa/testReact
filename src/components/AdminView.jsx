import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Search, Users, LayoutDashboard, UserCog, School,
  Plus, Trash2, ChevronLeft, AlertTriangle,
} from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { useToast } from "./ui/ToastContext.jsx";
import { Spinner, StatCard, normalizeStudent } from "./ui/StudentShared.jsx";

/* ============================================================
   CONSTANTS
   ============================================================ */
const ACCENT = "#dc2626"; // đỏ — trùng ROLE_ACCENTS.admin trong Header.jsx
const ROLE_OPTIONS = ["admin", "teacher", "student", "user"];
const ROLE_LABELS_VI = { admin: "Quản trị viên", teacher: "Giáo viên", student: "Học sinh", user: "Thành viên" };
const ROLE_BADGE = {
  admin:   "bg-red-50 text-red-600",
  teacher: "bg-blue-50 text-blue-600",
  student: "bg-emerald-50 text-emerald-600",
  user:    "bg-stone-100 text-stone-500",
};

function getCurrentNamHoc(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed, tháng 9 = 8
  const startYear = month >= 8 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

/* ============================================================
   DATA LAYER
   ============================================================ */
async function fetchAllUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("username, ho_va_ten, ten_thanh, avatar, role, trang_thai")
    .order("ho_va_ten", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((u) => ({
    username:  u.username,
    hoTen:     u.ho_va_ten || "",
    tenThanh:  u.ten_thanh || "",
    avatar:    u.avatar || "",
    role:      u.role || "user",
    trangThai: u.trang_thai || "Đang học",
  }));
}

async function updateUserRole(username, role) {
  const { error } = await supabase.from("users").update({ role }).eq("username", username);
  if (error) throw error;
}

// Danh sách giáo viên chủ nhiệm theo từng lớp trong 1 năm học
async function fetchClassTeacherRows(namHoc) {
  const { data, error } = await supabase
    .from("class_teachers")
    .select("lop, teacher_username")
    .eq("nam_hoc", namHoc);
  if (error) throw error;
  return data ?? [];
}

// Sĩ số từng lớp trong 1 năm học (đếm ở client vì bảng enrollments không có cột count sẵn)
async function fetchEnrollmentCounts(namHoc) {
  const { data, error } = await supabase
    .from("enrollments")
    .select("lop")
    .eq("nam_hoc", namHoc);
  if (error) throw error;
  const counts = {};
  (data ?? []).forEach((r) => { counts[r.lop] = (counts[r.lop] || 0) + 1; });
  return counts;
}

// Giả định mỗi (lop, nam_hoc) chỉ có 1 giáo viên chủ nhiệm -> upsert theo key này.
// Nếu bảng class_teachers chưa có unique constraint (lop, nam_hoc), cần thêm ở DB.
async function assignTeacherToClass(lop, teacherUsername, namHoc) {
  const { error } = await supabase.from("class_teachers")
    .upsert({ lop, teacher_username: teacherUsername, nam_hoc: namHoc }, { onConflict: "lop,nam_hoc" });
  if (error) throw error;
}

async function unassignTeacher(lop, namHoc) {
  const { error } = await supabase.from("class_teachers").delete().eq("lop", lop).eq("nam_hoc", namHoc);
  if (error) throw error;
}

async function fetchClassRoster(lop, namHoc) {
  const { data, error } = await supabase
    .from("enrollments")
    .select("username, users(*)")
    .eq("lop", lop).eq("nam_hoc", namHoc);
  if (error) throw error;
  return (data ?? [])
    .map((r) => normalizeStudent(r.users))
    .filter((s) => s.username)
    .sort((a, b) => (a.hoTen || "").localeCompare(b.hoTen || "", "vi"));
}

// Giả định enrollments có unique (username, nam_hoc) -> 1 học sinh chỉ thuộc 1 lớp / năm học.
// Gán lại lớp mới sẽ tự động "chuyển lớp" (ghi đè lop cũ).
async function assignStudentToClass(username, lop, namHoc) {
  const { error } = await supabase.from("enrollments")
    .upsert({ username, lop, nam_hoc: namHoc }, { onConflict: "username,nam_hoc" });
  if (error) throw error;
}

async function removeStudentFromClass(username, namHoc) {
  const { error } = await supabase.from("enrollments").delete().eq("username", username).eq("nam_hoc", namHoc);
  if (error) throw error;
}

/* ============================================================
   ROUTE GUARD — bọc quanh <AdminView /> trong App.jsx
   ============================================================
   const AdminView = lazyWithRetry(() => import("./components/AdminView.jsx"));
   ...
   <Route
     path="quan-tri"
     element={
       <RequireAdminRoute>
         <AdminView />
       </RequireAdminRoute>
     }
   />
   ============================================================ */
export function RequireAdminRoute({ children }) {
  const [status, setStatus] = useState("checking"); // checking | ok | denied

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const cachedRole = localStorage.getItem("role");
      if (cachedRole && cachedRole !== "admin") {
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

        if (error || !data || data.role !== "admin") {
          setStatus("denied");
        } else {
          localStorage.setItem("role", "admin");
          setStatus("ok");
        }
      } catch (err) {
        console.error("RequireAdminRoute check error:", err);
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
   TAB: TỔNG QUAN
   ============================================================ */
function OverviewTab({ users, classes, namHoc }) {
  const counts = useMemo(() => {
    const c = { admin: 0, teacher: 0, student: 0, user: 0 };
    users.forEach((u) => { c[u.role] = (c[u.role] || 0) + 1; });
    return c;
  }, [users]);

  const classesNoTeacher = classes.filter((c) => !c.teacherUsername);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Học sinh"       value={counts.student} colorClass="text-emerald-600" />
        <StatCard label="Giáo viên"      value={counts.teacher} colorClass="text-blue-600" />
        <StatCard label="Quản trị viên"  value={counts.admin}   colorClass="text-red-600" />
        <StatCard label="Tổng số lớp"    value={classes.length} colorClass="text-stone-800" />
      </div>

      {classesNoTeacher.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-amber-700">
            {classesNoTeacher.length} lớp chưa có giáo viên chủ nhiệm năm học {namHoc}:{" "}
            <span className="font-semibold">{classesNoTeacher.map((c) => c.lop).join(", ")}</span>
          </p>
        </div>
      )}

      {classesNoTeacher.length === 0 && classes.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3.5 flex items-center gap-3">
          <span className="text-[13px] text-emerald-700 font-medium">
            ✓ Tất cả các lớp đều đã có giáo viên chủ nhiệm.
          </span>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   TAB: NGƯỜI DÙNG — tìm kiếm, lọc theo vai trò, đổi vai trò tại chỗ
   ============================================================ */
function UsersTab({ users, loading, onRoleChanged, showToast }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [savingUser, setSavingUser] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!q) return true;
      return (u.hoTen || "").toLowerCase().includes(q) || (u.username || "").toLowerCase().includes(q);
    });
  }, [users, search, roleFilter]);

  const handleRoleChange = async (username, newRole) => {
    setSavingUser(username);
    try {
      await updateUserRole(username, newRole);
      onRoleChanged(username, newRole);
      showToast("Đã cập nhật vai trò", "success");
    } catch (err) {
      console.error("update role error:", err);
      showToast("Cập nhật vai trò thất bại", "error");
    } finally {
      setSavingUser(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-3 px-5 py-4 border-b border-stone-100">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc username…"
            className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500">
          <option value="all">Tất cả vai trò</option>
          {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{ROLE_LABELS_VI[r]}</option>)}
        </select>
      </div>

      <div className="overflow-auto max-h-[65vh]" data-lenis-prevent>
        <table className="w-full text-sm border-collapse min-w-[520px]">
          <thead>
            <tr className="bg-[#F9F9F9] text-[11px] text-stone-400 uppercase tracking-wide">
              <th className="text-left font-semibold px-4 py-3 sticky top-0 bg-[#F9F9F9] z-10">Người dùng</th>
              <th className="text-center font-semibold px-3 py-3 sticky top-0 bg-[#F9F9F9] z-10">Vai trò</th>
              <th className="text-center font-semibold px-3 py-3 sticky top-0 bg-[#F9F9F9] z-10">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={3} className="text-center py-10"><Spinner className="h-5 w-5 mx-auto text-red-500" /></td></tr>
            )}
            {!loading && filtered.map((u) => (
              <tr key={u.username} className="border-b border-stone-50">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-200 flex-shrink-0 bg-stone-100">
                      <img src={u.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-stone-800 truncate">
                        {u.tenThanh ? `${u.tenThanh} ` : ""}{u.hoTen || u.username}
                      </p>
                      <p className="text-[11px] text-stone-400 truncate">{u.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <select value={u.role} disabled={savingUser === u.username}
                    onChange={(e) => handleRoleChange(u.username, e.target.value)}
                    className={`rounded-lg border-none px-2.5 py-1.5 text-[12px] font-bold focus:outline-none focus:ring-2 focus:ring-red-500 ${ROLE_BADGE[u.role] || ROLE_BADGE.user}`}>
                    {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{ROLE_LABELS_VI[r]}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2.5 text-center text-[12px] text-stone-500">{u.trangThai}</td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={3} className="text-center text-sm text-stone-400 py-10">Không tìm thấy người dùng nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   BẢNG XẾP HỌC SINH VÀO 1 LỚP
   ============================================================ */
function ClassRosterPanel({ lop, namHoc, onBack, showToast }) {
  const [roster,       setRoster]       = useState([]);
  const [allStudents,  setAllStudents]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [busyUsername, setBusyUsername] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rosterList, users] = await Promise.all([
        fetchClassRoster(lop, namHoc),
        fetchAllUsers(),
      ]);
      setRoster(rosterList);
      setAllStudents(users.filter((u) => u.role === "student"));
    } catch (err) {
      console.error("load roster error:", err);
      showToast("Không tải được danh sách lớp", "error");
    } finally {
      setLoading(false);
    }
  }, [lop, namHoc, showToast]);

  useEffect(() => { load(); }, [load]);

  const rosterUsernames = useMemo(() => new Set(roster.map((s) => s.username)), [roster]);

  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allStudents
      .filter((s) => !rosterUsernames.has(s.username))
      .filter((s) => !q || (s.hoTen || "").toLowerCase().includes(q) || s.username.toLowerCase().includes(q));
  }, [allStudents, rosterUsernames, search]);

  const handleAdd = async (username) => {
    setBusyUsername(username);
    try {
      await assignStudentToClass(username, lop, namHoc);
      showToast("Đã thêm học sinh vào lớp", "success");
      await load();
    } catch (err) {
      console.error("assign student error:", err);
      showToast("Thêm học sinh thất bại", "error");
    } finally {
      setBusyUsername(null);
    }
  };

  const handleRemove = async (username) => {
    setBusyUsername(username);
    try {
      await removeStudentFromClass(username, namHoc);
      showToast("Đã bỏ học sinh khỏi lớp", "success");
      await load();
    } catch (err) {
      console.error("remove student error:", err);
      showToast("Thao tác thất bại", "error");
    } finally {
      setBusyUsername(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-100">
        <button type="button" onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-stone-500 hover:text-stone-800 flex-shrink-0">
          <ChevronLeft className="w-4 h-4" /> Quay lại
        </button>
        <div className="w-px h-5 bg-stone-200" />
        <h3 className="text-[14px] font-bold text-stone-800">Lớp {lop} · {namHoc}</h3>
        <span className="ml-auto text-[12px] text-stone-400">{roster.length} học sinh</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2.5 py-14" style={{ color: ACCENT }}>
          <Spinner className="h-5 w-5" /> <span className="text-sm text-stone-500">Đang tải…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:divide-x divide-stone-100">
          <div className="p-5">
            <h4 className="text-[12px] font-bold uppercase tracking-wide text-stone-400 mb-3">Đã xếp lớp</h4>
            <div className="flex flex-col gap-1.5 max-h-[50vh] overflow-y-auto" data-lenis-prevent>
              {roster.map((s) => (
                <div key={s.username} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-stone-50">
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-stone-200 flex-shrink-0 bg-stone-100">
                    <img src={s.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[13px] font-medium text-stone-800 flex-1 truncate">
                    {s.tenThanh ? `${s.tenThanh} ` : ""}{s.hoTen || s.username}
                  </span>
                  <button type="button" disabled={busyUsername === s.username} onClick={() => handleRemove(s.username)}
                    className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center text-stone-400 hover:text-red-600 flex-shrink-0 transition-colors">
                    {busyUsername === s.username ? <Spinner className="h-3.5 w-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
              {roster.length === 0 && <p className="text-[13px] text-stone-400 text-center py-6">Lớp chưa có học sinh nào.</p>}
            </div>
          </div>

          <div className="p-5">
            <h4 className="text-[12px] font-bold uppercase tracking-wide text-stone-400 mb-3">Thêm học sinh</h4>
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm học sinh…"
                className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            </div>
            <div className="flex flex-col gap-1.5 max-h-[42vh] overflow-y-auto" data-lenis-prevent>
              {candidates.map((s) => (
                <div key={s.username} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-stone-50">
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-stone-200 flex-shrink-0 bg-stone-100">
                    <img src={s.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[13px] font-medium text-stone-700 flex-1 truncate">
                    {s.tenThanh ? `${s.tenThanh} ` : ""}{s.hoTen || s.username}
                  </span>
                  <button type="button" disabled={busyUsername === s.username} onClick={() => handleAdd(s.username)}
                    className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0 transition-colors">
                    {busyUsername === s.username ? <Spinner className="h-3.5 w-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
              {candidates.length === 0 && <p className="text-[13px] text-stone-400 text-center py-6">Không còn học sinh nào để thêm.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   TAB: LỚP HỌC — gán giáo viên chủ nhiệm + mở bảng xếp học sinh
   ============================================================ */
function ClassesTab({ classes, teachers, namHoc, loading, onRefresh, showToast }) {
  const [newLop, setNewLop] = useState("");
  const [rosterLop, setRosterLop] = useState(null);
  const [savingLop, setSavingLop] = useState(null);

  const handleAssign = async (lop, teacherUsername) => {
    setSavingLop(lop);
    try {
      if (teacherUsername) {
        await assignTeacherToClass(lop, teacherUsername, namHoc);
      } else {
        await unassignTeacher(lop, namHoc);
      }
      showToast("Đã cập nhật giáo viên chủ nhiệm", "success");
      onRefresh();
    } catch (err) {
      console.error("assign teacher error:", err);
      showToast("Cập nhật thất bại", "error");
    } finally {
      setSavingLop(null);
    }
  };

  const handleAddClass = () => {
    const name = newLop.trim();
    if (!name) return;
    if (classes.some((c) => c.lop === name)) { showToast("Lớp này đã tồn tại", "warning"); return; }
    setNewLop("");
    // Lớp chỉ thật sự "tồn tại" trong DB khi có giáo viên hoặc học sinh đầu tiên,
    // nên mở luôn bảng xếp học sinh để admin thêm ngay.
    setRosterLop(name);
  };

  if (rosterLop) {
    return (
      <ClassRosterPanel
        lop={rosterLop}
        namHoc={namHoc}
        onBack={() => { setRosterLop(null); onRefresh(); }}
        showToast={showToast}
      />
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-3 px-5 py-4 border-b border-stone-100">
        <div className="relative flex-1">
          <input type="text" value={newLop} onChange={(e) => setNewLop(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddClass()}
            placeholder="Tên lớp mới, vd: Rước Lễ 1…"
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
        </div>
        <button type="button" onClick={handleAddClass}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 text-white text-[13px] font-bold hover:bg-red-700 transition-colors flex-shrink-0">
          <Plus className="w-4 h-4" /> Thêm lớp
        </button>
      </div>

      <div className="overflow-auto max-h-[65vh]" data-lenis-prevent>
        <table className="w-full text-sm border-collapse min-w-[560px]">
          <thead>
            <tr className="bg-[#F9F9F9] text-[11px] text-stone-400 uppercase tracking-wide">
              <th className="text-left font-semibold px-4 py-3 sticky top-0 bg-[#F9F9F9] z-10">Lớp</th>
              <th className="text-center font-semibold px-3 py-3 sticky top-0 bg-[#F9F9F9] z-10">Giáo viên chủ nhiệm</th>
              <th className="text-center font-semibold px-3 py-3 sticky top-0 bg-[#F9F9F9] z-10">Sĩ số</th>
              <th className="text-center font-semibold px-3 py-3 sticky top-0 bg-[#F9F9F9] z-10">Xếp học sinh</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={4} className="text-center py-10"><Spinner className="h-5 w-5 mx-auto text-red-500" /></td></tr>
            )}
            {!loading && classes.map((c) => (
              <tr key={c.lop} className="border-b border-stone-50">
                <td className="px-4 py-2.5 text-[13px] font-semibold text-stone-800">{c.lop}</td>
                <td className="px-3 py-2.5 text-center">
                  <select value={c.teacherUsername || ""} disabled={savingLop === c.lop}
                    onChange={(e) => handleAssign(c.lop, e.target.value)}
                    className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-red-500">
                    <option value="">— Chưa có —</option>
                    {teachers.map((t) => <option key={t.username} value={t.username}>{t.hoTen || t.username}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2.5 text-center text-[13px] text-stone-600">{c.studentCount}</td>
                <td className="px-3 py-2.5 text-center">
                  <button type="button" onClick={() => setRosterLop(c.lop)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-[12px] font-semibold text-stone-600 transition-colors">
                    <Users className="w-3.5 h-3.5" /> Quản lý
                  </button>
                </td>
              </tr>
            ))}
            {!loading && classes.length === 0 && (
              <tr><td colSpan={4} className="text-center text-sm text-stone-400 py-10">Chưa có lớp nào trong năm học {namHoc}.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   ROOT COMPONENT
   ============================================================ */
export default function AdminView() {
  const { showToast } = useToast();
  useNavigate(); // giữ lại để dùng sau này nếu cần điều hướng
  const namHoc = useMemo(() => getCurrentNamHoc(), []);

  const [tab, setTab] = useState("overview"); // overview | users | classes
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [userList, ctRows, enrollCounts] = await Promise.all([
        fetchAllUsers(),
        fetchClassTeacherRows(namHoc),
        fetchEnrollmentCounts(namHoc),
      ]);
      setUsers(userList);

      const teacherByLop = {};
      ctRows.forEach((r) => { teacherByLop[r.lop] = r.teacher_username; });

      const lopSet = new Set([...Object.keys(teacherByLop), ...Object.keys(enrollCounts)]);
      const teacherName = (username) => userList.find((u) => u.username === username)?.hoTen || username;

      const classList = Array.from(lopSet)
        .sort((a, b) => a.localeCompare(b, "vi"))
        .map((lop) => ({
          lop,
          teacherUsername: teacherByLop[lop] || null,
          teacherName:     teacherByLop[lop] ? teacherName(teacherByLop[lop]) : null,
          studentCount:    enrollCounts[lop] || 0,
        }));
      setClasses(classList);
    } catch (err) {
      console.error("load admin data error:", err);
      showToast("Không tải được dữ liệu quản trị", "error");
    } finally {
      setLoading(false);
    }
  }, [namHoc, showToast]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const teachers = useMemo(() => users.filter((u) => u.role === "teacher"), [users]);

  const handleRoleChanged = (username, role) => {
    setUsers((prev) => prev.map((u) => (u.username === username ? { ...u, role } : u)));
  };

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <div className="sticky top-16 z-30 bg-[#faf8f5]/95 backdrop-blur-sm border-b border-stone-200/60 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Quản trị hệ thống</p>
            <h1 className="text-lg sm:text-xl font-bold text-stone-900">Bảng điều khiển · {namHoc}</h1>
          </div>

          <div className="flex gap-1.5 bg-stone-100 rounded-xl p-1 w-fit">
            <button type="button" onClick={() => setTab("overview")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                tab === "overview" ? "bg-white text-red-600 shadow-sm" : "text-stone-500"
              }`}>
              <LayoutDashboard className="w-3.5 h-3.5" /> Tổng quan
            </button>
            <button type="button" onClick={() => setTab("users")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                tab === "users" ? "bg-white text-red-600 shadow-sm" : "text-stone-500"
              }`}>
              <UserCog className="w-3.5 h-3.5" /> Người dùng
            </button>
            <button type="button" onClick={() => setTab("classes")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                tab === "classes" ? "bg-white text-red-600 shadow-sm" : "text-stone-500"
              }`}>
              <School className="w-3.5 h-3.5" /> Lớp học
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {tab === "overview" && <OverviewTab users={users} classes={classes} namHoc={namHoc} />}

        {tab === "users" && (
          <UsersTab users={users} loading={loading} onRoleChanged={handleRoleChanged} showToast={showToast} />
        )}

        {tab === "classes" && (
          <ClassesTab
            classes={classes}
            teachers={teachers}
            namHoc={namHoc}
            loading={loading}
            onRefresh={loadAll}
            showToast={showToast}
          />
        )}
      </div>
    </div>
  );
}