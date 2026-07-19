/* ============================================================
   DATA LAYER cho khu vực /quan-tri
   Tách nguyên vẹn từ AdminView.jsx cũ — KHÔNG đổi logic, chỉ đổi vị trí
   (đường dẫn import lùi thêm 1 cấp vì file này nằm trong components/admin/).
   ============================================================ */
import { supabase } from "../../lib/supabase.js";
import { normalizeStudent } from "../../components/ui/StudentShared.jsx";

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
export async function fetchUsersPaginated(page = 1, pageSize = 50, searchQuery = "", roleFilter = "all") {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("users")
    .select("username, ho_va_ten, ten_thanh, avatar, role, trang_thai", { count: "exact" })
    .order("ho_va_ten", { ascending: true })
    .range(from, to);

  if (searchQuery) {
    query = query.or(`ho_va_ten.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`);
  }
  
  if (roleFilter && roleFilter !== "all") {
    query = query.eq("role", roleFilter);
  }

  const { data, count, error } = await query;
  if (error) throw error;

  const users = (data ?? []).map((u) => ({
    username:  u.username,
    hoTen:     u.ho_va_ten || "",
    tenThanh:  u.ten_thanh || "",
    avatar:    u.avatar || "",
    role:      u.role || "user",
    trangThai: u.trang_thai || "Đang học",
  }));

  return { users, totalCount: count };
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
  return (data ?? []).map((u) => ({
    username: u.username,
    hoTen:    u.ho_va_ten || "",
    tenThanh: u.ten_thanh || "",
    avatar:   u.avatar || "",
  }));
}

export async function updateUserRole(username, role) {
  const { error } = await supabase.from("users").update({ role }).eq("username", username);
  if (error) throw error;
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

  const set = new Set([
    ...(enrollRes.data ?? []).map((r) => r.nam_hoc),
    ...(ctRes.data ?? []).map((r) => r.nam_hoc),
    getCurrentNamHocFallback(),
  ]);
  // Sắp xếp giảm dần theo năm bắt đầu ("2025-2026" -> so theo "2025") để năm
  // mới nhất luôn nằm đầu danh sách trong <select>.
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

// Chỉ định rõ cột của users thay vì "users(*)" — tránh kéo về các trường
// nhạy cảm không dùng đến ở UI (ngay_sinh, sdt, ten_cha, ten_me, gioi_tinh...).
export async function fetchClassRoster(lop, namHoc) {
  const { data, error } = await supabase
    .from("enrollments")
    .select("username, users(username, ho_va_ten, ten_thanh, avatar)")
    .eq("lop", lop).eq("nam_hoc", namHoc);
  if (error) throw error;
  return (data ?? [])
    .map((r) => normalizeStudent(r.users))
    .filter((s) => s.username)
    .sort((a, b) => (a.hoTen || "").localeCompare(b.hoTen || "", "vi"));
}

// Giả định enrollments có unique (username, nam_hoc) -> 1 học sinh chỉ thuộc 1 lớp / năm học.
// Gán lại lớp mới sẽ tự động "chuyển lớp" (ghi đè lop cũ).
export async function assignStudentToClass(username, lop, namHoc) {
  const { error } = await supabase.from("enrollments")
    .upsert({ username, lop, nam_hoc: namHoc }, { onConflict: "username,nam_hoc" });
  if (error) throw error;
}

export async function removeStudentFromClass(username, namHoc) {
  const { error } = await supabase.from("enrollments").delete().eq("username", username).eq("nam_hoc", namHoc);
  if (error) throw error;
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
    if (r.error) console.error(`fetchClassAcademicSummary[${i}] error:`, r.error);
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
   ĐĂNG KÝ HỌC (form TuyenSinh.jsx) — cần chạy migration_dang_ky_hoc.sql
   ============================================================ */

// Danh sách hồ sơ đăng ký, lọc theo trạng thái (truyền null để lấy tất cả).
// "moi" sắp xếp cũ -> mới (FIFO, xử lý hồ sơ chờ lâu nhất trước); các trạng
// thái đã xử lý thì mới -> cũ (xem lại việc vừa làm trước tiên).
export async function fetchDangKyHoc(trangThai) {
  let query = supabase
    .from("dang_ky_hoc")
    .select("*")
    .order("created_at", { ascending: trangThai === "moi" });
  if (trangThai) query = query.eq("trang_thai", trangThai);
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

// Số hồ sơ đang ở trạng thái "moi" — dùng cho badge trên tab nav.
export async function fetchPendingDangKyCount() {
  const { data, error } = await supabase.rpc("get_pending_dang_ky_count");
  if (error) throw error;
  return data ?? 0;
}

// Gửi thông báo chung (broadcast) — chạy qua RPC "broadcast_notification"
// (SECURITY DEFINER, tự kiểm tra is_admin() ở tầng DB). recipient_username
// sẽ là NULL trong bảng notifications -> mọi tài khoản đều nhìn thấy.
export async function sendBroadcastNotification(title, message, link) {
  const { error } = await supabase.rpc("broadcast_notification", {
    p_title: title,
    p_message: message,
    p_link: link || null,
  });
  if (error) throw error;
}

// Gửi Email hàng loạt (Newsletter) bằng cách gọi Edge Function
export async function sendNewsletter(title, message, link) {
  const { data, error } = await supabase.functions.invoke('send-newsletter', {
    body: { title, message, link }
  });
  
  if (error) {
    console.error("Lỗi mạng khi gọi Edge Function:", error);
    throw new Error(error.message || "Lỗi gọi Edge Function");
  }
  
  if (data && data.success === false) {
    console.error("Lỗi logic từ Edge Function:", data.error);
    throw new Error(data.error);
  }
  
  // Lưu lịch sử gửi email vào database
  await supabase.rpc("log_email_broadcast", {
    p_title: title,
    p_message: message,
    p_link: link || null,
  });
  
  return data;
}

// Lịch sử các thông báo chung đã gửi — dùng để hiển thị lại trong tab,
// tránh gửi trùng và để admin xem lại đã thông báo gì.
export async function fetchRecentBroadcasts(limit = 20) {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, message, link, created_at, created_by")
    .is("recipient_username", null)
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
    
  if (trangThai) query = query.eq("trang_thai", trangThai);
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