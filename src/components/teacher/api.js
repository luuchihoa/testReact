import { supabase } from "../../lib/supabase.js";
import { normalizeStudent } from "../ui/StudentShared.jsx";
import { buildSundayList, getCurrentNamHoc } from "./utils.js";

// Xác định giáo viên đang đăng nhập đang chủ nhiệm lớp nào (năm học hiện tại)
export async function fetchTeacherContext(authId) {
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
export async function fetchClassStudents(lop, namHoc) {
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
export async function fetchStudentAcademic(username, namHoc, hocKyInt) {
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
export async function fetchClassTermRanges(lop, namHoc) {
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

// Trạng thái khóa sổ của lớp trong năm học hiện tại — trả về { 1: true, 2: true }.
// Giáo viên chỉ SELECT được lớp mình chủ nhiệm (RLS "term_locks: teacher select own class").
// Dùng để tự disable form nhập điểm/điểm danh ở UI, tránh bấm lưu xong mới biết bị RLS chặn.
export async function fetchTermLocks(lop, namHoc) {
  const { data, error } = await supabase
    .from("term_locks")
    .select("hoc_ky")
    .eq("lop", lop)
    .eq("nam_hoc", namHoc);
  if (error) { console.error("fetchTermLocks error:", error); return {}; }
  const locks = {};
  (data ?? []).forEach((r) => { locks[r.hoc_ky] = true; });
  return locks;
}

// Tổng hợp dữ liệu cho Bảng Tổng Kết Lớp: điểm thi/TB + học lực/hạnh kiểm +
// số buổi vắng (có phép / không phép) của từng học sinh trong 1 học kỳ.
export async function fetchClassSummary(usernames, namHoc, hocKyInt) {
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

// Tổng hợp dữ liệu cho Bảng Tổng Kết Cả Năm: điểm TB cả năm + học lực +
// hạnh kiểm + vị thứ + ghi chú từ bảng year_summary, cộng tổng vắng cả năm.
export async function fetchYearSummary(usernames, namHoc) {
  if (!usernames.length) return {};

  const [yearRes, attendanceRes] = await Promise.all([
    supabase.from("year_summary").select("username, diem_tb, hoc_luc, hanh_kiem, vi_thu, ghi_chu")
      .eq("nam_hoc", namHoc).in("username", usernames),
    // Tổng hợp điểm danh cả năm (không filter hoc_ky)
    supabase.from("attendance").select("username, trang_thai")
      .eq("nam_hoc", namHoc).in("username", usernames),
  ]);

  [yearRes, attendanceRes].forEach((r, i) => {
    if (r.error) console.error(`fetchYearSummary[${i}] error:`, r.error);
  });

  const byUser = {};
  usernames.forEach((u) => {
    byUser[u] = { diemTB: null, hocLuc: null, hanhKiem: null, viThu: null, ghiChu: "", vangCoPhep: 0, vangKhongPhep: 0 };
  });

  (yearRes.data ?? []).forEach((y) => {
    if (byUser[y.username]) {
      byUser[y.username].diemTB   = y.diem_tb;
      byUser[y.username].hocLuc   = y.hoc_luc;
      byUser[y.username].hanhKiem = y.hanh_kiem;
      byUser[y.username].viThu    = y.vi_thu;
      byUser[y.username].ghiChu   = y.ghi_chu || "";
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