// src/lib/queries.js
import { supabase } from './supabase'

// ─── 1. Thông tin cá nhân học sinh ───────────────────────────────────────────
export async function getStudent(username) {
  const { data, error } = await supabase
    .from('students')
    .select(`
      username,
      ten_thanh,
      ho_va_ten,
      ngay_sinh,
      ngay_rua_toi,
      ngay_ruoc_le,
      ngay_them_suc,
      ten_cha,
      ten_me,
      sdt,
      giao_xom,
      gioi_tinh,
      avatar,
      role,
      trang_thai
    `)
    // Không select password ra client
    .eq('username', username)
    .single()

  if (error) throw error
  return data
}

// ─── 2. Lịch sử enrollment (tất cả năm học) ──────────────────────────────────
export async function getEnrollments(username) {
  const { data, error } = await supabase
    .from('enrollments')
    .select('nam_hoc, lop')
    .eq('username', username)
    .order('nam_hoc', { ascending: false })

  if (error) throw error
  return data // [{ nam_hoc: '2025-2026', lop: 'Phụng Vụ 1' }, ...]
}

// ─── 3. Điểm theo học kỳ ─────────────────────────────────────────────────────
// grades dùng EAV nên cần pivot thủ công ở client
export async function getGrades(username, namHoc, hocKy) {
  const { data, error } = await supabase
    .from('grades')
    .select('mon_hoc, diem, ghi_chu')
    .eq('username', username)
    .eq('nam_hoc', namHoc)
    .eq('hoc_ky', hocKy)
    .order('mon_hoc')

  if (error) throw error

  // Pivot: [{ mon_hoc: 'diemTB', diem: 8.5 }, ...] → { diemTB: 8.5, ... }
  return Object.fromEntries(data.map(r => [r.mon_hoc, r.diem]))
}

// ─── 4. Điểm danh theo học kỳ ────────────────────────────────────────────────
export async function getAttendance(username, namHoc, hocKy) {
  const { data, error } = await supabase
    .from('attendance')
    .select('ngay, trang_thai')
    .eq('username', username)
    .eq('nam_hoc', namHoc)
    .eq('hoc_ky', hocKy)
    .order('ngay', { ascending: true })

  if (error) throw error
  return data // [{ ngay: '2025-09-14', trang_thai: 'co_mat' }, ...]
}

// ─── 5. Tổng kết năm ─────────────────────────────────────────────────────────
export async function getYearSummary(username, namHoc) {
  const { data, error } = await supabase
    .from('year_summary')
    .select('xep_loai, ghi_chu')
    .eq('username', username)
    .eq('nam_hoc', namHoc)
    .single()

  // .single() throw error nếu không tìm thấy row
  // PGRST116 = "no rows" — coi là bình thường, chưa có tổng kết
  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

// ─── 6. Fetch toàn bộ dữ liệu 1 học kỳ (dùng trong Achievement tab) ─────────
// Gộp grades + attendance + year_summary trong 1 lần gọi
export async function getTermData(username, namHoc, hocKy) {
  const [grades, attendance, yearSummary] = await Promise.all([
    getGrades(username, namHoc, hocKy),
    getAttendance(username, namHoc, hocKy),
    getYearSummary(username, namHoc),
  ])

  // Thống kê nghỉ từ attendance
  const stats = attendance.reduce(
    (acc, row) => {
      if (row.trang_thai === 'nghi_phep')        acc.nghiCoPhep++
      else if (row.trang_thai === 'nghi_khong_phep') acc.nghiKhongPhep++
      acc.tongBuoiVang = acc.nghiCoPhep + acc.nghiKhongPhep
      return acc
    },
    { nghiCoPhep: 0, nghiKhongPhep: 0, tongBuoiVang: 0 }
  )

  return {
    grades,       // { diemMieng: 8, diemVo: 9, ... }
    attendance,   // [{ ngay, trang_thai }, ...]
    stats,        // { nghiCoPhep, nghiKhongPhep, tongBuoiVang }
    yearSummary,  // { xep_loai, ghi_chu } | null
  }
}

// ─── 7. Danh sách năm học có dữ liệu (dùng cho dropdown lịch sử) ─────────────
export async function getAvailableYears(username) {
  const { data, error } = await supabase
    .from('enrollments')
    .select('nam_hoc')
    .eq('username', username)
    .order('nam_hoc', { ascending: false })

  if (error) throw error
  return data.map(r => r.nam_hoc) // ['2025-2026', '2024-2025', ...]
}