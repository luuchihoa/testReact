/* ============================================================
   DATA LAYER cho khu vực /quan-tri
   Tách nguyên vẹn từ AdminView.jsx cũ — KHÔNG đổi logic, chỉ đổi vị trí
   (đường dẫn import lùi thêm 1 cấp vì file này nằm trong components/admin/).
   ============================================================ */
import { supabase } from "../../lib/supabase.js";
import { normalizeStudent } from "../../components/ui/studentSharedUtils.js";
import { sortStudentsByTen } from "./gradeUtils.js";

// Thay thế hàm fetchAllUsers() cũ bằng 2 hàm sau:

// 1. Chỉ lấy danh sách giáo viên/admin để map tên vào danh sách lớp
export async function fetchAllTeachers() {
  const { data, error } = await supabase
    .from("users")
    .select("username, ho_va_ten, ten_thanh, avatar, sdt")
    .in("role", ["teacher", "admin"]);

  if (error) throw error;
  return data ?? [];
}

// 2. Lấy người dùng theo trang và hỗ trợ tìm kiếm/lọc trực tiếp từ DB
export async function fetchUsersPaginated(page = 1, pageSize = 50, searchQuery = "", roleFilter = "all", namHoc = "") {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("users")
    .select("username, ho_va_ten, ten_thanh, avatar, role, trang_thai", { count: "exact" })
    .order("ho_va_ten", { ascending: true })
    .order("username", { ascending: true })
    .range(from, to);

  if (searchQuery) {
    query = query.or(`ho_va_ten.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,ten_thanh.ilike.%${searchQuery}%`);
  }

  if (roleFilter && roleFilter !== "all") {
    query = query.eq("role", roleFilter);
  }

  const { data, count, error } = await query;
  if (error) throw error;

  // Truy vấn lớp học của học sinh trong niên khóa hiện tại
  const usernames = (data ?? []).map((u) => u.username);
  let enrollMap = new Map();
  if (usernames.length > 0 && namHoc) {
    const { data: enrollData } = await supabase
      .from("enrollments")
      .select("username, lop")
      .eq("nam_hoc", namHoc)
      .in("username", usernames);
    if (enrollData) {
      enrollData.forEach((e) => enrollMap.set(e.username, e.lop));
    }
  }

  const users = (data ?? []).map((u) => ({
    username:  u.username,
    hoTen:     u.ho_va_ten || "",
    tenThanh:  u.ten_thanh || "",
    avatar:    u.avatar || "",
    role:      u.role || "user",
    trangThai: u.trang_thai || (u.role === "student" ? "Đang học" : "Hoạt động"),
    lopHoc:    enrollMap.get(u.username) || null,
  }));

  return { users, totalCount: count };
}

// Lấy thống kê số lượng người dùng theo từng vai trò cho Mini-KPIs
export async function fetchUserRoleCounts() {
  const [totalRes, adminRes, teacherRes, studentRes, userRes] = await Promise.all([
    supabase.from("users").select("username", { count: "exact", head: true }),
    supabase.from("users").select("username", { count: "exact", head: true }).eq("role", "admin"),
    supabase.from("users").select("username", { count: "exact", head: true }).eq("role", "teacher"),
    supabase.from("users").select("username", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("users").select("username", { count: "exact", head: true }).eq("role", "user"),
  ]);

  if (totalRes.error) throw totalRes.error;
  if (adminRes.error) throw adminRes.error;
  if (teacherRes.error) throw teacherRes.error;
  if (studentRes.error) throw studentRes.error;
  if (userRes.error) throw userRes.error;

  return {
    total: totalRes.count || 0,
    admin: adminRes.count || 0,
    teacher: teacherRes.count || 0,
    student: studentRes.count || 0,
    user: userRes.count || 0,
  };
}

// Lấy toàn bộ người dùng theo bộ lọc phục vụ Xuất file Excel
export async function fetchAllUsersForExport(searchQuery = "", roleFilter = "all", namHoc = "") {
  let query = supabase
    .from("users")
    .select("username, ho_va_ten, ten_thanh, avatar, role, trang_thai")
    .order("ho_va_ten", { ascending: true })
    .order("username", { ascending: true })
    .limit(5000);

  if (searchQuery) {
    query = query.or(`ho_va_ten.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,ten_thanh.ilike.%${searchQuery}%`);
  }

  if (roleFilter && roleFilter !== "all") {
    query = query.eq("role", roleFilter);
  }

  const { data, error } = await query;
  if (error) throw error;

  const usernames = (data ?? []).map((u) => u.username);
  let enrollMap = new Map();
  if (usernames.length > 0 && namHoc) {
    const { data: enrollData } = await supabase
      .from("enrollments")
      .select("username, lop")
      .eq("nam_hoc", namHoc)
      .in("username", usernames);
    if (enrollData) {
      enrollData.forEach((e) => enrollMap.set(e.username, e.lop));
    }
  }

  return (data ?? []).map((u) => ({
    username:  u.username,
    hoTen:     u.ho_va_ten || "",
    tenThanh:  u.ten_thanh || "",
    avatar:    u.avatar || "",
    role:      u.role || "user",
    trangThai: u.trang_thai || (u.role === "student" ? "Đang học" : "Hoạt động"),
    lopHoc:    enrollMap.get(u.username) || null,
  }));
}


// Chỉ lấy học sinh, filter ngay trong query thay vì kéo hết bảng users
// rồi lọc phía client (dùng cho panel xếp lớp — không cần role/trang_thai).
export async function fetchStudents() {
  const { data, error } = await supabase
    .from("users")
    .select("username, ho_va_ten, ten_thanh, avatar")
    .eq("role", "student")
    .order("ho_va_ten", { ascending: true });
  if (error) throw error;
  const list = (data ?? []).map((u) => ({
    username: u.username,
    hoTen:    u.ho_va_ten || "",
    tenThanh: u.ten_thanh || "",
    avatar:   u.avatar || "",
  }));
  return sortStudentsByTen(list);
}

// Cập nhật vai trò người dùng (gọi RPC admin_update_user_role bảo vệ admin cuối cùng và GLV đứng lớp)
export async function updateUserRole(username, role) {
  const { data, error } = await supabase.rpc("admin_update_user_role", {
    p_username: username,
    p_new_role: role,
  });

  if (error) {
    throw new Error(error.message || "Cập nhật vai trò người dùng thất bại qua hệ thống quản trị");
  }

  if (data && data.success === false) {
    throw new Error(data.error || data.message || "Cập nhật vai trò không thành công");
  }

  return data;
}

// Xoá người dùng (gọi RPC admin_delete_user để dọn sạch public.users và auth.users)
export async function deleteUser(username) {
  const { data, error } = await supabase.rpc("admin_delete_user", {
    p_username: username,
  });

  if (error) {
    throw new Error(error.message || "Xóa người dùng thất bại qua hệ thống quản trị");
  }

  if (data && data.success === false) {
    throw new Error(data.error || data.message || "Xóa người dùng không thành công");
  }

  return data;
}

// Danh sách TẤT CẢ năm học đã từng có dữ liệu (gộp từ enrollments +
// class_teachers, vì 1 năm học mới có thể mới chỉ có GVCN mà chưa có học
// sinh, hoặc ngược lại). Luôn đảm bảo năm học hiện tại có mặt trong danh
// sách dù DB chưa có dòng nào của năm đó — để admin luôn chọn được năm
// nay khi bắt đầu năm học mới, không cần đợi có dữ liệu trước.
export async function fetchAvailableNamHocList() {
  const [enrollRes, ctRes] = await Promise.all([
    supabase.from("enrollments").select("nam_hoc"),
    supabase.from("class_teachers").select("nam_hoc"),
  ]);
  if (enrollRes.error) throw enrollRes.error;
  if (ctRes.error) throw ctRes.error;

  const currentNH = getCurrentNamHocFallback();
  const startYear = parseInt(currentNH.split("-")[0], 10);
  const nextNH = !isNaN(startYear) ? `${startYear + 1}-${startYear + 2}` : null;

  const set = new Set([
    ...(enrollRes.data ?? []).map((r) => r.nam_hoc),
    ...(ctRes.data ?? []).map((r) => r.nam_hoc),
    currentNH,
    ...(nextNH ? [nextNH] : []),
  ]);
  // Sắp xếp giảm dần theo năm bắt đầu để năm mới nhất luôn nằm đầu danh sách trong <select>.
  return Array.from(set).sort((a, b) => b.localeCompare(a));
}

// Tránh phụ thuộc vòng vào constants.js chỉ vì 1 hàm nhỏ — inline lại logic
// giống hệt getCurrentNamHoc() trong constants.js.
function getCurrentNamHocFallback(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const startYear = month >= 8 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

// Danh sách giáo viên chủ nhiệm theo từng lớp trong 1 năm học
export async function fetchClassTeacherRows(namHoc) {
  const { data, error } = await supabase
    .from("class_teachers")
    .select("lop, teacher_username")
    .eq("nam_hoc", namHoc);
  if (error) throw error;
  return data ?? [];
}

// Sĩ số từng lớp trong 1 năm học (đếm ở client vì bảng enrollments không có cột count sẵn)
export async function fetchEnrollmentCounts(namHoc) {
  const { data, error } = await supabase
    .from("enrollments")
    .select("lop")
    .eq("nam_hoc", namHoc);
  if (error) throw error;
  const counts = {};
  (data ?? []).forEach((r) => { counts[r.lop] = (counts[r.lop] || 0) + 1; });
  return counts;
}

// Danh sách (lớp, học kỳ) đã bị khóa sổ trong 1 năm học — trả về dạng
// { [lop]: { 1: true, 2: true } } để tra cứu O(1) khi render bảng lớp.
export async function fetchTermLocks(namHoc) {
  const { data, error } = await supabase
    .from("term_locks")
    .select("lop, hoc_ky")
    .eq("nam_hoc", namHoc);
  if (error) throw error;
  const locks = {};
  (data ?? []).forEach((r) => {
    if (!locks[r.lop]) locks[r.lop] = {};
    locks[r.lop][r.hoc_ky] = true;
  });
  return locks;
}

// Khóa/mở khóa sổ điểm — chạy qua RPC (SECURITY DEFINER, tự kiểm tra
// is_admin() ở tầng DB). Cần chạy migration_term_lock_audit.sql trước khi dùng.
export async function lockTerm(lop, namHoc, hocKy) {
  const { error } = await supabase.rpc("lock_term", { p_nam_hoc: namHoc, p_lop: lop, p_hoc_ky: hocKy });
  if (error) throw error;
}

export async function unlockTerm(lop, namHoc, hocKy) {
  const { error } = await supabase.rpc("unlock_term", { p_nam_hoc: namHoc, p_lop: lop, p_hoc_ky: hocKy });
  if (error) throw error;
}

// Khóa/Mở khóa hồ sơ học sinh (Admin)
export async function toggleBatchProfileLockAdmin(usernames, isLocked, lockedBy = "Ban Quản Trị") {
  if (!usernames || !usernames.length) return true;
  const { error: rpcErr } = await supabase.rpc("toggle_student_profile_lock", {
    p_student_usernames: usernames,
    p_locked: isLocked,
    p_locked_by: lockedBy,
  });
  if (!rpcErr) return true;

  const { error } = await supabase
    .from("users")
    .update({
      is_profile_locked: isLocked,
      profile_locked_by: isLocked ? lockedBy : null,
      profile_locked_at: isLocked ? new Date().toISOString() : null,
    })
    .in("username", usernames);
  if (error) throw error;
  return true;
}

export async function toggleStudentProfileLockAdmin(username, isLocked, lockedBy = "Ban Quản Trị") {
  return toggleBatchProfileLockAdmin([username], isLocked, lockedBy);
}

// Gán/bỏ GVCN qua RPC "assign_class_teacher" (chạy transaction ở DB):
// tự dọn bản ghi cũ của giáo viên trước khi insert, tránh vi phạm PK
// (teacher_username, nam_hoc) khi đổi 1 giáo viên đang chủ nhiệm lớp khác
// sang lớp mới. Cần chạy migration admin_fixes.sql trước khi dùng.
export async function assignTeacherToClass(lop, teacherUsername, namHoc) {
  const { error } = await supabase.rpc("assign_class_teacher", {
    p_lop: lop,
    p_teacher_username: teacherUsername,
    p_nam_hoc: namHoc,
  });
  if (error) throw error;
}

// Gỡ GVCN dùng đúng hàm "unassign_class_teacher(teacher_username, nam_hoc)" —
// KHÔNG gọi lại "assign_class_teacher" với teacher_username = null nữa, vì
// hàm đó giờ ném exception khi thiếu teacher_username (schema đã đổi để
// hỗ trợ nhiều GVCN / 1 lớp). Cần biết đang gỡ đúng giáo viên nào của lớp.
export async function unassignTeacher(teacherUsername, namHoc) {
  if (!teacherUsername) return; // không có ai để gỡ, khỏi gọi RPC
  const { error } = await supabase.rpc("unassign_class_teacher", {
    p_teacher_username: teacherUsername,
    p_nam_hoc: namHoc,
  });
  if (error) throw error;
}

// Lấy danh sách học sinh thuộc lớp, kèm thông tin chi tiết để hiển thị & xuất file Excel
export async function fetchClassRoster(lop, namHoc) {
  const { data, error } = await supabase
    .from("enrollments")
    .select("username, users(username, ho_va_ten, ten_thanh, avatar, ngay_sinh, gioi_tinh, ngay_rua_toi, ngay_ruoc_le, ngay_them_suc, ten_cha, ten_me, sdt, giao_xom)")
    .eq("lop", lop).eq("nam_hoc", namHoc);
  if (error) throw error;
  const list = (data ?? [])
    .map((r) => normalizeStudent(r.users))
    .filter((s) => s.username);
  return sortStudentsByTen(list);
}

// Giả định enrollments có unique (username, nam_hoc) -> 1 học sinh chỉ thuộc 1 lớp / năm học.
// Gán lại lớp mới sẽ tự động "chuyển lớp" (ghi đè lop cũ) và đồng bộ sang các bảng tổng kết/sổ điểm.
export async function assignStudentToClass(username, lop, namHoc) {
  const { error } = await supabase.from("enrollments")
    .upsert({ username, lop, nam_hoc: namHoc }, { onConflict: "username,nam_hoc" });
  if (error) throw error;

  // Tự động đồng bộ lớp sang các bảng tổng kết và sổ điểm nếu đã có dữ liệu
  try {
    await Promise.all([
      supabase.from("term_summary").update({ lop }).eq("username", username).eq("nam_hoc", namHoc),
      supabase.from("year_summary").update({ lop }).eq("username", username).eq("nam_hoc", namHoc),
      supabase.from("grades").update({ lop }).eq("username", username).eq("nam_hoc", namHoc),
    ]);
  } catch (syncErr) {
    console.warn("sync student class changes warning:", syncErr);
  }
}

export async function removeStudentFromClass(username, namHoc) {
  const { error } = await supabase.from("enrollments").delete().eq("username", username).eq("nam_hoc", namHoc);
  if (error) throw error;

  // Tự động dọn dẹp các bản ghi mồ côi trong năm học đó khi học sinh bị gỡ khỏi lớp
  try {
    await Promise.all([
      supabase.from("term_summary").delete().eq("username", username).eq("nam_hoc", namHoc),
      supabase.from("year_summary").delete().eq("username", username).eq("nam_hoc", namHoc),
      supabase.from("grades").delete().eq("username", username).eq("nam_hoc", namHoc),
    ]);
  } catch (cleanErr) {
    console.warn("clean orphan records warning:", cleanErr);
  }
}

// Import danh sách học sinh vào lớp và tự động tạo tài khoản Auth qua RPC admin_import_class_roster
export async function importClassRoster(lop, namHoc, students) {
  const { data, error } = await supabase.rpc("admin_import_class_roster", {
    p_lop: lop,
    p_nam_hoc: namHoc,
    p_students: students,
  });
  if (error) throw error;
  return data;
}

// Import danh sách người dùng và tự động tạo/cập nhật tài khoản qua RPC admin_import_users
export async function importUsersList(users) {
  const { data, error } = await supabase.rpc("admin_import_users", {
    p_users: users,
  });
  if (error) throw error;
  return data;
}



/* ============================================================
   MODULE D — SỔ ĐIỂM & HỌC BẠ
   ============================================================ */

// Điểm của nhiều học sinh trong 1 lớp/học kỳ — trả về map username -> dòng
// điểm, để GradesTab dựng bảng spreadsheet (giống cách BulkGradeEntryView
// trong TeacherClassView.jsx tải điểm cho cả lớp cùng lúc).
export async function fetchGradesMap(usernames, namHoc, hocKyInt) {
  if (!usernames.length) return {};
  const { data, error } = await supabase
    .from("grades")
    .select("*")
    .eq("nam_hoc", namHoc).eq("hoc_ky", hocKyInt)
    .in("username", usernames);
  if (error) throw error;
  const map = {};
  (data ?? []).forEach((r) => { map[r.username] = r; });
  return map;
}

// Lưu điểm hàng loạt — mỗi dòng cần đủ (username, nam_hoc, hoc_ky) để khớp
// đúng unique key (username, nam_hoc, hoc_ky) của bảng grades.
// Việc UPDATE sẽ tự kích trigger trg_grades_audit (ghi log trước/sau).
export async function saveGradesBulk(rows) {
  const { error } = await supabase.from("grades").upsert(rows, { onConflict: "username,nam_hoc,hoc_ky" });
  if (error) throw error;
}

// Tổng hợp điểm thi/TB + học lực/hạnh kiểm + số buổi vắng của từng học sinh
// trong 1 học kỳ — dùng để xuất bảng điểm/học bạ. Cùng logic với
// fetchClassSummary trong TeacherClassView.jsx, tách bản riêng cho phía
// admin để không phải export thêm hàm từ file của giáo viên.
export async function fetchClassAcademicSummary(usernames, namHoc, hocKyInt) {
  if (!usernames.length) {
    return { data: {}, attendanceError: false, termError: false, gradesError: false };
  }

  const [gradesRes, termRes, attendanceRes] = await Promise.all([
    supabase.from("grades").select("username, diem_thi, diem_tb")
      .eq("nam_hoc", namHoc).eq("hoc_ky", hocKyInt).in("username", usernames),
    supabase.from("term_summary").select("username, hoc_luc, hanh_kiem")
      .eq("nam_hoc", namHoc).eq("hoc_ky", hocKyInt).in("username", usernames),
    supabase.from("attendance").select("username, trang_thai")
      .eq("nam_hoc", namHoc).eq("hoc_ky", hocKyInt).in("username", usernames),
  ]);

  if (gradesRes.error) console.error("fetchClassAcademicSummary grades error:", gradesRes.error);
  if (termRes.error) console.error("fetchClassAcademicSummary term error:", termRes.error);
  if (attendanceRes.error) console.error("fetchClassAcademicSummary attendance error:", attendanceRes.error);

  const hasAttendanceError = !!attendanceRes.error;
  const hasTermError = !!termRes.error;
  const hasGradesError = !!gradesRes.error;

  const byUser = {};
  usernames.forEach((u) => {
    byUser[u] = {
      diemThi: null,
      diemTB: null,
      hocLuc: null,
      hanhKiem: null,
      vangCoPhep: hasAttendanceError ? null : 0,
      vangKhongPhep: hasAttendanceError ? null : 0,
    };
  });

  if (!hasGradesError) {
    (gradesRes.data ?? []).forEach((g) => {
      if (byUser[g.username]) {
        byUser[g.username].diemThi = g.diem_thi;
        byUser[g.username].diemTB  = g.diem_tb;
      }
    });
  }

  if (!hasTermError) {
    (termRes.data ?? []).forEach((t) => {
      if (byUser[t.username]) {
        byUser[t.username].hocLuc   = t.hoc_luc;
        byUser[t.username].hanhKiem = t.hanh_kiem;
      }
    });
  }

  if (!hasAttendanceError) {
    (attendanceRes.data ?? []).forEach((a) => {
      const u = byUser[a.username];
      if (!u) return;
      if (a.trang_thai === "nghi_phep")       u.vangCoPhep    += 1;
      if (a.trang_thai === "nghi_khong_phep") u.vangKhongPhep += 1;
    });
  }

  return {
    data: byUser,
    attendanceError: hasAttendanceError,
    termError: hasTermError,
    gradesError: hasGradesError,
  };
}

/* ============================================================
   ĐĂNG KÝ HỌC (form TuyenSinh.jsx) — cần chạy migration_dang_ky_hoc.sql
   ============================================================ */

// Danh sách hồ sơ đăng ký, lọc theo trạng thái và niên khóa (truyền null/"all" để lấy tất cả).
// "moi" sắp xếp cũ -> mới (FIFO, xử lý hồ sơ chờ lâu nhất trước); các trạng
// thái đã xử lý thì mới -> cũ (xem lại việc vừa làm trước tiên).
export async function fetchDangKyHoc(trangThai, namHoc) {
  let query = supabase
    .from("dang_ky_hoc")
    .select("*")
    .order("created_at", { ascending: trangThai === "moi" });
  if (trangThai && trangThai !== "all") query = query.eq("trang_thai", trangThai);
  if (namHoc && namHoc !== "all") query = query.eq("nam_hoc", namHoc);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// Đổi trạng thái xử lý 1 hồ sơ — chạy qua RPC "process_dang_ky_hoc"
// (SECURITY DEFINER, tự kiểm tra is_admin() ở tầng DB, tự ghi xu_ly_boi/xu_ly_luc).
export async function processDangKyHoc(id, trangThai, ghiChuAdmin) {
  const { error } = await supabase.rpc("process_dang_ky_hoc", {
    p_id: id,
    p_trang_thai: trangThai,
    p_ghi_chu_admin: ghiChuAdmin?.trim() || null,
  });
  if (error) throw error;
}

// Cập nhật ghi chú nội bộ của BQT cho 1 hồ sơ độc lập (qua RPC để gán xu_ly_boi & xu_ly_luc tự động)
export async function updateDangKyNote(id, trangThai, ghiChuAdmin) {
  const { error } = await supabase.rpc("process_dang_ky_hoc", {
    p_id: id,
    p_trang_thai: trangThai,
    p_ghi_chu_admin: ghiChuAdmin?.trim() || null,
  });
  if (error) throw error;
}

// Số hồ sơ đang ở trạng thái "moi" — dùng cho badge trên tab nav.
export async function fetchPendingDangKyCount() {
  const { data, error } = await supabase.rpc("get_pending_dang_ky_count");
  if (error) throw error;
  return data ?? 0;
}

// Gửi thông báo chung (broadcast) — chạy qua RPC "broadcast_notification"
// Hỗ trợ gửi cho toàn bộ tài khoản (targetRole = null) hoặc phân quyền (targetRole = 'teacher')
export async function sendBroadcastNotification(title, message, link, targetRole = null) {
  const { error } = await supabase.rpc("broadcast_notification", {
    p_title: title,
    p_message: message,
    p_link: link || null,
    p_recipient_role: targetRole || null,
  });
  if (error) throw error;
}

// Gửi Email hàng loạt (Newsletter) bằng cách gọi Edge Function có theo dõi batch & idempotency
export async function sendNewsletter(title, message, link, idempotencyKey = null) {
  const { data, error } = await supabase.functions.invoke('send-newsletter', {
    body: { title, message, link, idempotencyKey }
  });

  if (error) {
    console.error("Lỗi mạng khi gọi Edge Function:", error);
    throw new Error(error.message || "Lỗi kết nối tới máy chủ gửi email");
  }

  if (!data || data.success === false || data.status === "failed") {
    console.error("Lỗi từ Edge Function:", data?.error || data?.message);
    throw new Error(data?.error || data?.message || "Gửi email thất bại hoàn toàn");
  }

  if (data.status === "empty" || data.requested === 0) {
    throw new Error(data.error || "Danh sách người đăng ký nhận email đang trống. Không thể phát bản tin.");
  }

  return data;
}

// Lịch sử các thông báo phát tin đã gửi — CHỈ lấy type IN ('broadcast', 'email')
// Bảo đảm không xóa hay đọc nhầm sang thông báo hệ thống, điểm số hoặc bài viết
export async function fetchRecentBroadcasts(limit = 40) {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, message, link, recipient_role, created_at, created_by")
    .in("type", ["broadcast", "email"])
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function deleteBroadcast(id) {
  const { error } = await supabase.rpc("delete_broadcast", { p_id: id });
  if (error) throw error;
}

export async function fetchSubscriberCount() {
  const { count, error } = await supabase
    .from("subscribers")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");
  if (error) throw error;
  return count ?? 0;
}

// Lấy số lượng người nhận dự kiến cho từng kênh phát tin và trạng thái lỗi chi tiết
export async function fetchBroadcastAudienceCounts() {
  const [subRes, teacherRes, userRes] = await Promise.allSettled([
    supabase.from("subscribers").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("users").select("*", { count: "exact", head: true }).in("role", ["teacher", "admin"]),
    supabase.from("users").select("*", { count: "exact", head: true })
  ]);

  const subError = subRes.status === "rejected" || Boolean(subRes.value?.error);
  const teacherError = teacherRes.status === "rejected" || Boolean(teacherRes.value?.error);
  const userError = userRes.status === "rejected" || Boolean(userRes.value?.error);
  const hasError = subError || teacherError || userError;

  const subscribers = !subError ? (subRes.value.count ?? 0) : null;
  const teachers = !teacherError ? (teacherRes.value.count ?? 0) : null;
  const allUsers = !userError ? (userRes.value.count ?? 0) : null;

  return {
    subscribers,
    teachers,
    allUsers,
    subscribersError: subError,
    teachersError: teacherError,
    allUsersError: userError,
    hasError: Boolean(hasError)
  };
}

export async function submitContactForm(hoTen, sdt, noiDung) {
  const { data, error } = await supabase.rpc("submit_lien_he", {
    p_ho_ten: hoTen,
    p_sdt: sdt,
    p_noi_dung: noiDung,
  });

  if (error) throw error;
  return data;
}
// Lấy danh sách liên hệ theo trạng thái
export async function fetchLienHe(trangThai) {
  let query = supabase
    .from("lien_he")
    .select("*")
    .order("created_at", { ascending: trangThai === "moi" }); // Mới thì xếp cũ lên trước (FIFO)

  if (trangThai && trangThai !== "all") query = query.eq("trang_thai", trangThai);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// Cập nhật trạng thái
export async function updateLienHeStatus(id, trangThai) {
  const { error } = await supabase
    .from("lien_he")
    .update({ trang_thai: trangThai })
    .eq("id", id);
  if (error) throw error;
}

// Đếm số lượng góp ý mới (dùng cho badge đỏ trên thanh Tab)
export async function fetchPendingLienHeCount() {
  const { count, error } = await supabase
    .from("lien_he")
    .select("*", { count: "exact", head: true })
    .eq("trang_thai", "moi");
  if (error) throw error;
  return count ?? 0;
}

// Đếm số lượng bài viết đang chờ duyệt (dùng cho badge đỏ trên thanh Tab)
export async function fetchPendingArticlesCount() {
  const { count, error } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  if (error) throw error;
  return count ?? 0;
}

// Đếm số lượng người dùng nhóm theo role, xử lý trực tiếp bằng rpc hoặc truy vấn
export async function fetchRoleCounts() {
  const { data, error } = await supabase
    .from("users")
    .select("role", { count: 'exact' }); // Mặc định Supabase limit 1000 dòng nếu ko pagination, nhưng count exact trả về tổng số thực

  if (error) {
    console.error("fetchRoleCounts error:", error);
    return { admin: 0, teacher: 0, student: 0, user: 0 };
  }

  // Tối ưu hóa: Thay vì select toàn bộ, nên gọi API đếm từng loại nếu dữ liệu cực lớn,
  // Hoặc với quy mô vừa, đếm bằng array.reduce:
  const counts = { admin: 0, teacher: 0, student: 0, user: 0 };
  (data ?? []).forEach(u => {
    counts[u.role] = (counts[u.role] || 0) + 1;
  });

  return counts;
}

// CÁCH TỐI ƯU NHẤT (Nếu > 1000 users): Tạo 1 file RPC trên DB hoặc query Count riêng biệt:
export async function fetchExactRoleCounts() {
  const roles = ['admin', 'teacher', 'student', 'user'];
  const counts = { admin: 0, teacher: 0, student: 0, user: 0 };

  await Promise.all(roles.map(async (role) => {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', role);

    if (!error) counts[role] = count || 0;
  }));

  return counts;
}

/* ============================================================
   MODULE E — QUẢN TRỊ LỊCH NIÊN KHÓA & NGÀY NGHỈ LỄ PHỤNG VỤ
   ============================================================ */

// Lấy cấu hình lịch niên khóa tập trung
export async function fetchAcademicCalendar(namHoc) {
  try {
    const { data, error } = await supabase
      .from("academic_calendars")
      .select("*")
      .eq("nam_hoc", namHoc)
      .maybeSingle();

    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.warn("fetchAcademicCalendar Supabase fallback to local:", err);
  }

  // Fallback sang localStorage
  try {
    const cached = localStorage.getItem(`academic_calendar_${namHoc}`);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.warn("read local calendar error:", e);
  }
  return null;
}

// Lưu/Cập nhật cấu hình lịch niên khóa
export async function saveAcademicCalendar(calendarData) {
  const { nam_hoc, hk1_start_date, hk1_total_weeks, hk2_start_date, hk2_total_weeks, ghi_chu } = calendarData;
  const payload = {
    nam_hoc,
    hk1_start_date,
    hk1_total_weeks: Number(hk1_total_weeks) || 16,
    hk2_start_date,
    hk2_total_weeks: Number(hk2_total_weeks) || 16,
    ghi_chu: ghi_chu || "",
    updated_at: new Date().toISOString()
  };

  // Luôn lưu bản sao vào localStorage làm cache/fallback
  try {
    localStorage.setItem(`academic_calendar_${nam_hoc}`, JSON.stringify(payload));
  } catch (e) {
    console.warn("localStorage save calendar error:", e);
  }

  try {
    const { data, error } = await supabase
      .from("academic_calendars")
      .upsert(payload, { onConflict: "nam_hoc" })
      .select()
      .maybeSingle();

    if (!error && data) return data;
  } catch (err) {
    console.warn("saveAcademicCalendar Supabase error, stored locally:", err);
  }
  return payload;
}

// Lấy danh sách các ngày nghỉ lễ phụng vụ / nghỉ Tết của niên khóa
export async function fetchAcademicHolidays(namHoc) {
  try {
    const { data, error } = await supabase
      .from("academic_holidays")
      .select("*")
      .eq("nam_hoc", namHoc)
      .order("ngay", { ascending: true });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("fetchAcademicHolidays Supabase fallback:", err);
  }

  // Fallback sang localStorage
  try {
    const cached = localStorage.getItem(`academic_holidays_${namHoc}`);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.warn("read local holidays error:", e);
  }
  return [];
}

// Thêm ngày nghỉ lễ mới
export async function addAcademicHoliday(holiday) {
  const { nam_hoc, hoc_ky, ngay, ten_ngay_le, loai_nghi, ghi_chu } = holiday;
  const item = {
    id: holiday.id || `hol_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    nam_hoc,
    hoc_ky: Number(hoc_ky) || 1,
    ngay,
    ten_ngay_le,
    loai_nghi: loai_nghi || "nghi_le",
    ghi_chu: ghi_chu || "",
  };

  // Cập nhật localStorage
  try {
    const raw = localStorage.getItem(`academic_holidays_${nam_hoc}`);
    let list = raw ? JSON.parse(raw) : [];
    list = [...list.filter(h => h.ngay !== ngay), item].sort((a, b) => a.ngay.localeCompare(b.ngay));
    localStorage.setItem(`academic_holidays_${nam_hoc}`, JSON.stringify(list));
  } catch (e) {
    console.warn("save local holiday error:", e);
  }

  try {
    const { data, error } = await supabase
      .from("academic_holidays")
      .upsert({
        nam_hoc,
        hoc_ky: Number(hoc_ky) || 1,
        ngay,
        ten_ngay_le,
        loai_nghi: loai_nghi || "nghi_le",
        ghi_chu: ghi_chu || "",
      }, { onConflict: "nam_hoc,ngay" })
      .select()
      .maybeSingle();

    if (!error && data) return data;
  } catch (err) {
    console.warn("addAcademicHoliday Supabase error, saved locally:", err);
  }

  return item;
}

// Xóa ngày nghỉ lễ
export async function deleteAcademicHoliday(holidayId, namHoc) {
  if (namHoc) {
    try {
      const raw = localStorage.getItem(`academic_holidays_${namHoc}`);
      if (raw) {
        const list = JSON.parse(raw).filter(h => String(h.id) !== String(holidayId));
        localStorage.setItem(`academic_holidays_${namHoc}`, JSON.stringify(list));
      }
    } catch (e) {
      console.warn("delete local holiday error:", e);
    }
  }

  try {
    await supabase
      .from("academic_holidays")
      .delete()
      .eq("id", holidayId);
  } catch (err) {
    console.warn("deleteAcademicHoliday Supabase error:", err);
  }
}

// Đồng bộ lịch niên khóa sang tất cả các lớp trong năm học
export async function syncCalendarToAllClasses(namHoc, hk1StartDate, hk1Weeks, hk2StartDate, hk2Weeks) {
  // 1. Thử gọi RPC sync_academic_calendar_to_classes
  try {
    const { data: rpcData, error: rpcErr } = await supabase.rpc("sync_academic_calendar_to_classes", {
      p_nam_hoc: namHoc,
      p_hk1_start: hk1StartDate,
      p_hk1_weeks: Number(hk1Weeks) || 16,
      p_hk2_start: hk2StartDate,
      p_hk2_weeks: Number(hk2Weeks) || 16,
    });

    if (!rpcErr) {
      return rpcData;
    }
  } catch (e) {
    console.warn("RPC sync_academic_calendar_to_classes fallback to client sync:", e);
  }

  // 2. Fallback: Lưu vào academic_calendars (hoặc localStorage) và cập nhật term_summary qua client
  await saveAcademicCalendar({
    nam_hoc: namHoc,
    hk1_start_date: hk1StartDate,
    hk1_total_weeks: hk1Weeks,
    hk2_start_date: hk2StartDate,
    hk2_total_weeks: hk2Weeks,
  });

  try {
    // Lấy danh sách enrollments trong năm học đó
    const { data: enrolls, error: enrollErr } = await supabase
      .from("enrollments")
      .select("username, lop")
      .eq("nam_hoc", namHoc);

    if (!enrollErr && enrolls?.length) {
      const hk1Rows = enrolls.map(e => ({
        username: e.username,
        nam_hoc: namHoc,
        lop: e.lop,
        hoc_ky: 1,
        ngay_bat_dau: hk1StartDate,
        tong_buoi: Number(hk1Weeks) || 16,
      }));

      const hk2Rows = enrolls.map(e => ({
        username: e.username,
        nam_hoc: namHoc,
        lop: e.lop,
        hoc_ky: 2,
        ngay_bat_dau: hk2StartDate,
        tong_buoi: Number(hk2Weeks) || 16,
      }));

      // Cập nhật từng mẻ (batch upsert)
      await Promise.allSettled([
        supabase.from("term_summary").upsert(hk1Rows, { onConflict: "username,nam_hoc,hoc_ky" }),
        supabase.from("term_summary").upsert(hk2Rows, { onConflict: "username,nam_hoc,hoc_ky" }),
      ]);
    }
    return { success: true, count: enrolls?.length || 0, fallback: true };
  } catch (clientSyncErr) {
    console.warn("Client sync enrollments warning:", clientSyncErr);
    return { success: true, fallback: true };
  }
}
