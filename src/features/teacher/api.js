import { supabase } from "../../lib/supabase.js";
import { normalizeStudent } from "../../components/ui/studentSharedUtils.js";
import { buildSundayList, getCurrentNamHoc, sortStudentsByTen, getDefaultTermRanges, computeDiemTB, compareStudentRank } from "./utils.js";
import { calculateAutoHocLuc } from "../account/utils.js";

export async function fetchTeacherContext(authId, requestedNamHoc, requestedLop) {
  const { data: teacherRow, error: teacherErr } = await supabase
    .from("users")
    .select("username, role")
    .eq("auth_id", authId)
    .maybeSingle();

  if (teacherErr) throw teacherErr;
  if (!teacherRow) throw new Error("Không tìm thấy tài khoản giáo viên");
  if (teacherRow.role !== "teacher") throw new Error("Tài khoản không có quyền giáo viên");

  const [classRes, calRes] = await Promise.all([
    supabase
      .from("class_teachers")
      .select("lop, nam_hoc")
      .eq("teacher_username", teacherRow.username)
      .order("nam_hoc", { ascending: false }),
    supabase
      .from("academic_calendars")
      .select("nam_hoc")
      .order("nam_hoc", { ascending: false }),
  ]);

  if (classRes.error) throw classRes.error;
  const classRows = classRes.data || [];
  const calYears = (calRes.data || []).map((r) => r.nam_hoc).filter(Boolean);

  const current = getCurrentNamHoc();
  const taughtYears = [...new Set(classRows.map((r) => r.nam_hoc).filter(Boolean))];

  // Tổng hợp tất cả niên khóa khả dụng trong hệ thống
  const allYearSet = new Set([current, ...taughtYears, ...calYears]);
  const availableYears = Array.from(allYearSet).sort((a, b) => b.localeCompare(a));

  let activeNamHoc = requestedNamHoc;
  let isFallbackToPast = false;

  if (!activeNamHoc) {
    // 1. Nếu GLV có lớp trong năm học hiện tại -> Chọn năm hiện tại
    if (taughtYears.includes(current)) {
      activeNamHoc = current;
    }
    // 2. Nếu năm hiện tại chưa có lớp, nhưng GLV từng có lớp ở các năm trước -> Tự động chọn năm gần nhất có lớp
    else if (taughtYears.length > 0) {
      activeNamHoc = taughtYears[0];
      isFallbackToPast = true;
    }
    // 3. GLV hoàn toàn mới, chưa từng có lớp ở bất kỳ năm nào -> Chọn năm hiện tại
    else {
      activeNamHoc = current;
    }
  }

  // Danh sách các lớp của GLV trong activeNamHoc
  const classesInYear = classRows.filter((r) => r.nam_hoc === activeNamHoc);

  // Xác định activeLop
  let activeLop = null;
  if (requestedLop && classesInYear.some((r) => r.lop === requestedLop)) {
    activeLop = requestedLop;
  } else if (classesInYear.length > 0) {
    activeLop = classesInYear[0].lop;
  }

  // Lịch sử giảng dạy của GLV theo từng năm (dành cho Quick-Switch Chips)
  const teachingHistory = taughtYears.map((nh) => ({
    namHoc: nh,
    classes: classRows.filter((r) => r.nam_hoc === nh).map((r) => r.lop),
  }));

  return {
    teacherUsername: teacherRow.username,
    namHoc: activeNamHoc,
    lop: activeLop,
    classesInYear: classesInYear.map((r) => r.lop),
    teachingHistory,
    availableYears,
    isFallbackToPast,
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

  const list = (data ?? [])
    .map((row) => {
      const userProfile = row.users || {};
      return normalizeStudent({
        username: row.username, // Đảm bảo luôn giữ được mã định danh của học sinh từ enrollments
        ...userProfile,
      });
    })
    .filter((s) => s.username);

  return sortStudentsByTen(list);
}

// Điểm + tổng kết học kỳ + các buổi điểm danh ngoại lệ của 1 học sinh
export async function fetchStudentAcademic(username, namHoc, hocKyInt) {
  if (hocKyInt === 0) {
    const { data: yearRes, error: yearErr } = await supabase
      .from("year_summary")
      .select("*")
      .eq("username", username).eq("nam_hoc", namHoc).maybeSingle();
      
    if (yearErr) console.error("fetch year_summary error:", yearErr);
    
    return {
      grades: { diem_tb: yearRes?.diem_tb ?? null },
      term: { 
        hoc_luc: yearRes?.hoc_luc ?? null, 
        hanh_kiem: yearRes?.hanh_kiem ?? null, 
        vi_thu: yearRes?.vi_thu ?? null, 
        ghi_chu: yearRes?.ghi_chu ?? "" 
      },
      attendanceExceptions: [],
    };
  }

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

// Lịch điểm danh (ngày bắt đầu + tổng số buổi) của Niên khóa (HK1 và HK2).
// Ưu tiên 1: academic_calendars của Niên khóa (Lịch trung tâm toàn xứ đoàn do Admin cấu hình)
// Ưu tiên 2: getDefaultTermRanges (Tự động tính toán theo quy chuẩn CN đầu tháng 9 & tháng 1)
export async function fetchClassTermRanges(_lop, namHoc) {
  const fallback = getDefaultTermRanges(namHoc);
  const ranges = { 
    HK1: { start: null, sundays: [], isDefault: false, source: "central" }, 
    HK2: { start: null, sundays: [], isDefault: false, source: "central" } 
  };

  try {
    // 1. Đọc trực tiếp từ bảng academic_calendars (Lịch trung tâm toàn xứ đoàn)
    const { data: calData, error: calErr } = await supabase
      .from("academic_calendars")
      .select("nam_hoc, hk1_start_date, hk1_total_weeks, hk2_start_date, hk2_total_weeks")
      .eq("nam_hoc", namHoc)
      .maybeSingle();

    if (!calErr && calData) {
      if (calData.hk1_start_date) {
        ranges.HK1 = {
          start: calData.hk1_start_date,
          sundays: buildSundayList(calData.hk1_start_date, calData.hk1_total_weeks || 16),
          isDefault: false,
          source: "central"
        };
      }
      if (calData.hk2_start_date) {
        ranges.HK2 = {
          start: calData.hk2_start_date,
          sundays: buildSundayList(calData.hk2_start_date, calData.hk2_total_weeks || 16),
          isDefault: false,
          source: "central"
        };
      }
    }
  } catch (err) {
    console.warn("fetchClassTermRanges warning, fallback to default smart schedule:", err);
  }

  // 2. Nếu thiếu thì áp dụng Smart Default
  if (!ranges.HK1.start || !ranges.HK1.sundays.length) {
    ranges.HK1 = { ...fallback.HK1, source: "default" };
  }
  if (!ranges.HK2.start || !ranges.HK2.sundays.length) {
    ranges.HK2 = { ...fallback.HK2, source: "default" };
  }

  return ranges;
}

// Danh sách các ngày nghỉ lễ Phụng vụ & nghỉ Tết trong năm học
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
    console.warn("fetchAcademicHolidays catch error:", err);
  }

  // Fallback sang localStorage nếu bảng chưa được tạo trên Supabase
  try {
    const cached = localStorage.getItem(`academic_holidays_${namHoc}`);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.warn("read local holidays error:", e);
  }
  return [];
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
    supabase.from("term_summary").select("username, hoc_luc, hanh_kiem, vi_thu, ghi_chu")
      .eq("nam_hoc", namHoc).eq("hoc_ky", hocKyInt).in("username", usernames),
    supabase.from("attendance").select("username, trang_thai")
      .eq("nam_hoc", namHoc).eq("hoc_ky", hocKyInt).in("username", usernames),
  ]);

  [gradesRes, termRes, attendanceRes].forEach((r, i) => {
    if (r.error) console.error(`fetchClassSummary[${i}] error:`, r.error);
  });

  const byUser = {};
  usernames.forEach((u) => {
    byUser[u] = { diemThi: null, diemTB: null, hocLuc: null, hanhKiem: null, viThu: null, ghiChu: "", vangCoPhep: 0, vangKhongPhep: 0 };
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
      byUser[t.username].viThu    = t.vi_thu;
      byUser[t.username].ghiChu   = t.ghi_chu || "";
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
// TỰ ĐỘNG TÍNH TOÁN ON-THE-FLY VÀ ĐỒNG BỘ NỀN NẾU DATABASE CHƯA CÓ BẢN GHI TỔNG KẾT
export async function fetchYearSummary(usernames, namHoc) {
  if (!usernames.length) return {};

  const [yearRes, attendanceRes, gradesRes, termRes] = await Promise.all([
    supabase.from("year_summary").select("username, diem_tb, hoc_luc, hanh_kiem, vi_thu, ghi_chu, lop")
      .eq("nam_hoc", namHoc).in("username", usernames),
    // Tổng hợp điểm danh cả năm (không filter hoc_ky)
    supabase.from("attendance").select("username, trang_thai")
      .eq("nam_hoc", namHoc).in("username", usernames),
    // Lấy điểm HK1 và HK2 để tự động tính nếu year_summary chưa có
    supabase.from("grades").select("username, hoc_ky, diem_tb, diem_mieng, diem_vo, diem_15_phut, diem_1_tiet, diem_thi, lop")
      .eq("nam_hoc", namHoc).in("username", usernames),
    // Lấy kết quả đánh giá HK1 & HK2 để dự phòng hạnh kiểm
    supabase.from("term_summary").select("username, hoc_ky, hoc_luc, hanh_kiem, lop")
      .eq("nam_hoc", namHoc).in("username", usernames),
  ]);

  [yearRes, attendanceRes, gradesRes, termRes].forEach((r, i) => {
    if (r.error) console.error(`fetchYearSummary[${i}] error:`, r.error);
  });

  const byUser = {};
  usernames.forEach((u) => {
    byUser[u] = { diemTB: null, hocLuc: null, hanhKiem: null, viThu: null, ghiChu: "", vangCoPhep: 0, vangKhongPhep: 0, lop: null };
  });

  (yearRes.data ?? []).forEach((y) => {
    if (byUser[y.username]) {
      byUser[y.username].diemTB   = y.diem_tb;
      byUser[y.username].hocLuc   = y.hoc_luc;
      byUser[y.username].hanhKiem = y.hanh_kiem;
      byUser[y.username].viThu    = y.vi_thu;
      byUser[y.username].ghiChu   = y.ghi_chu || "";
      byUser[y.username].lop      = y.lop || null;
    }
  });

  (attendanceRes.data ?? []).forEach((a) => {
    const u = byUser[a.username];
    if (!u) return;
    if (a.trang_thai === "nghi_phep")       u.vangCoPhep    += 1;
    if (a.trang_thai === "nghi_khong_phep") u.vangKhongPhep += 1;
  });

  // Bản đồ điểm HK1 & HK2
  const gradesByUser = {};
  (gradesRes.data ?? []).forEach((g) => {
    if (!gradesByUser[g.username]) gradesByUser[g.username] = {};
    gradesByUser[g.username][g.hoc_ky] = g;
    if (g.lop && !byUser[g.username]?.lop) {
      if (byUser[g.username]) byUser[g.username].lop = g.lop;
    }
  });

  const termsByUser = {};
  (termRes.data ?? []).forEach((t) => {
    if (!termsByUser[t.username]) termsByUser[t.username] = {};
    termsByUser[t.username][t.hoc_ky] = t;
  });

  // TỰ ĐỘNG TÍNH TOÁN CẢ NĂM CHO NHỮNG EM CHƯA CÓ HOẶC BỊ NULL
  const needsUpsert = [];
  usernames.forEach((u) => {
    const userSummary = byUser[u];
    const g1 = gradesByUser[u]?.[1];
    const g2 = gradesByUser[u]?.[2];
    const tb1 = g1?.diem_tb ?? (g1 ? computeDiemTB(g1) : null);
    const tb2 = g2?.diem_tb ?? (g2 ? computeDiemTB(g2) : null);

    let recalculated = false;

    // 1. Tự động tính ĐTB Cả năm nếu cả 2 HK đều có điểm (ĐTB Cả năm = (HK1 + HK2*2) / 3)
    if ((userSummary.diemTB === null || userSummary.diemTB === undefined) && tb1 !== null && tb2 !== null) {
      const autoDTB = Math.round(((Number(tb1) + Number(tb2) * 2) / 3) * 10) / 10;
      userSummary.diemTB = autoDTB;
      if (!userSummary.hocLuc) {
        userSummary.hocLuc = calculateAutoHocLuc(autoDTB);
      }
      recalculated = true;
    }

    // 2. Tự động tính Hạnh kiểm Cả năm từ chuyên cần cả năm
    if (!userSummary.hanhKiem) {
      const kPhep = userSummary.vangKhongPhep || 0;
      const phep = userSummary.vangCoPhep || 0;
      const tong = kPhep + phep;
      const hk2Hk = termsByUser[u]?.[2]?.hanh_kiem;
      const hk1Hk = termsByUser[u]?.[1]?.hanh_kiem;

      if (tong > 0) {
        if ((kPhep === 0 && phep <= 4) || (kPhep <= 1 && tong <= 2)) userSummary.hanhKiem = "Tốt";
        else if (kPhep <= 3 && tong <= 6) userSummary.hanhKiem = "Khá";
        else if (kPhep <= 5 && tong <= 10) userSummary.hanhKiem = "Trung Bình";
        else userSummary.hanhKiem = "Yếu";
      } else {
        userSummary.hanhKiem = hk2Hk || hk1Hk || null;
      }
      if (userSummary.hanhKiem) recalculated = true;
    }

    if (recalculated && userSummary.diemTB !== null) {
      needsUpsert.push({
        username: u,
        nam_hoc: namHoc,
        lop: userSummary.lop,
        diem_tb: userSummary.diemTB,
        hoc_luc: userSummary.hocLuc,
        hanh_kiem: userSummary.hanhKiem,
      });
    }
  });

  // 3. Tự động xếp hạng Vị Thứ chuẩn Học đường (RANK: 1-2-2-4) kèm Tiêu chí phụ (Hạnh kiểm & Chuyên cần)
  const validUsers = usernames
    .map((u) => ({ username: u, ...byUser[u] }))
    .filter((s) => s.diemTB !== null && s.diemTB !== undefined && !isNaN(Number(s.diemTB)));

  usernames.forEach((u) => {
    const student = { username: u, ...byUser[u] };
    if (student.diemTB !== null && student.diemTB !== undefined && !isNaN(Number(student.diemTB))) {
      byUser[u].viThu = validUsers.filter((other) => compareStudentRank(other, student) > 0).length + 1;
    } else {
      byUser[u].viThu = null;
    }
  });

  // 4. Đồng bộ nền xuống database (Background Sync) để lưu bền vững
  if (needsUpsert.length > 0) {
    const payload = needsUpsert.map((item) => ({
      ...item,
      vi_thu: byUser[item.username]?.viThu ?? null,
    }));
    supabase
      .from("year_summary")
      .upsert(payload, { onConflict: "username,nam_hoc" })
      .then(({ error }) => {
        if (error) console.warn("Auto-sync year_summary background notice:", error);
      })
      .catch((e) => console.warn("Auto-sync year_summary catch:", e));
  }

  return byUser;
}

// ── Yêu cầu thay đổi hồ sơ học sinh ──
export async function fetchPendingProfileRequests(namHoc) {
  const { data, error } = await supabase.rpc("get_pending_profile_requests_for_teacher", {
    p_nam_hoc: namHoc || null,
  });
  if (error) throw error;
  return data || [];
}

export async function approveProfileRequest(requestId, selectedProposedData = null) {
  if (selectedProposedData && Object.keys(selectedProposedData).length > 0) {
    const { error: updateErr } = await supabase
      .from("profile_change_requests")
      .update({ proposed_data: selectedProposedData })
      .eq("id", requestId);
    if (updateErr) {
      console.warn("Update proposed_data prior to approval error:", updateErr);
    }
  }

  const { data, error } = await supabase.rpc("approve_profile_change_request", {
    p_request_id: requestId,
  });
  if (error) throw error;
  return data;
}

export async function rejectProfileRequest(requestId, note) {
  const { data, error } = await supabase.rpc("reject_profile_change_request", {
    p_request_id: requestId,
    p_note: note || null,
  });
  if (error) throw error;
  return data;
}

// ── Khóa / Mở khóa hồ sơ học sinh ──
export async function toggleBatchProfileLock(usernames, isLocked, lockedBy = null) {
  if (!usernames || !usernames.length) return true;
  
  const { error: rpcErr } = await supabase.rpc("toggle_student_profile_lock", {
    p_student_usernames: usernames,
    p_locked: isLocked,
    p_locked_by: lockedBy || null,
  });

  if (!rpcErr) return true;

  const { error } = await supabase
    .from("users")
    .update({
      is_profile_locked: isLocked,
      profile_locked_by: isLocked ? (lockedBy || null) : null,
      profile_locked_at: isLocked ? new Date().toISOString() : null,
    })
    .in("username", usernames);

  if (error) throw error;
  return true;
}

export async function toggleStudentProfileLock(username, isLocked, lockedBy = null) {
  return toggleBatchProfileLock([username], isLocked, lockedBy);
}

// ── Cập nhật hồ sơ học sinh (Giáo lý viên) ──
export async function updateStudentProfile(username, payload) {
  const { error } = await supabase
    .from("users")
    .update(payload)
    .eq("username", username);
  if (error) throw error;
  return true;
}

// ── Lưu điểm học kỳ của 1 học sinh (loại bỏ updated_at từ client để server trigger quản lý) ──
export async function saveStudentGrades(payload) {
  // eslint-disable-next-line no-unused-vars
  const { updated_at, updated_by, ...cleanPayload } = payload;
  const { error } = await supabase
    .from("grades")
    .upsert(cleanPayload, { onConflict: "username,nam_hoc,hoc_ky" });
  if (error) throw error;
  return true;
}

// ── Đồng bộ term_summary từ điểm số (Học lực, Vị thứ dense rank) ──
export async function syncTermSummariesFromGrades({ allClassRows, rosterUsernames, namHoc, hocKy, lop }) {
  if (!allClassRows || !rosterUsernames || !rosterUsernames.length) return;

  const scoresByUser = {};
  const validScores = [];

  rosterUsernames.forEach((u) => {
    const row = allClassRows[u] || {};
    const diemTB = computeDiemTB(row);
    scoresByUser[u] = diemTB;
    if (diemTB !== null && typeof diemTB === "number" && !isNaN(diemTB)) {
      validScores.push(diemTB);
    }
  });

  // Lấy thông tin Hạnh kiểm đã có từ term_summary để phục vụ Tiêu chí phụ khi xếp hạng
  const { data: existingTerms } = await supabase
    .from("term_summary")
    .select("username, hanh_kiem")
    .in("username", rosterUsernames)
    .eq("nam_hoc", namHoc)
    .eq("hoc_ky", Number(hocKy) || 1);

  const hanhKiemByUser = {};
  (existingTerms || []).forEach((t) => {
    hanhKiemByUser[t.username] = t.hanh_kiem;
  });

  const validStudents = rosterUsernames
    .map((u) => ({ username: u, diemTB: scoresByUser[u], hanhKiem: hanhKiemByUser[u] }))
    .filter((s) => s.diemTB !== null && s.diemTB !== undefined && !isNaN(Number(s.diemTB)));

  const termSummaryUpserts = rosterUsernames.map((u) => {
    const student = { username: u, diemTB: scoresByUser[u], hanhKiem: hanhKiemByUser[u] };
    const viThu = (student.diemTB !== null && student.diemTB !== undefined && !isNaN(Number(student.diemTB)))
      ? validStudents.filter((other) => compareStudentRank(other, student) > 0).length + 1
      : null;
    const hocLuc = calculateAutoHocLuc(student.diemTB);

    return {
      username: u,
      nam_hoc: namHoc,
      hoc_ky: Number(hocKy) || 1,
      lop: lop || null,
      hoc_luc: hocLuc || null,
      vi_thu: viThu,
    };
  });

  const { error } = await supabase
    .from("term_summary")
    .upsert(termSummaryUpserts, { onConflict: "username,nam_hoc,hoc_ky" });

  if (error) {
    console.error("syncTermSummariesFromGrades error:", error);
  }
}

// ── Lưu điểm hàng loạt cho các học sinh ĐÃ THAY ĐỔI trong lớp ──
export async function saveClassGradesBatch(changedRows, classContext = null) {
  if (!changedRows || !changedRows.length) return true;
  const cleanRows = changedRows.map((r) => {
    // eslint-disable-next-line no-unused-vars
    const { updated_at, updated_by, ...clean } = r;
    if (!clean.lop && classContext?.lop) {
      clean.lop = classContext.lop;
    }
    return clean;
  });

  const { error } = await supabase
    .from("grades")
    .upsert(cleanRows, { onConflict: "username,nam_hoc,hoc_ky" });
  if (error) throw error;

  // Dual-layer sync: Tự động tính vị thứ & học lực cả lớp và lưu vào term_summary
  if (classContext && classContext.allClassRows && classContext.rosterUsernames) {
    try {
      await syncTermSummariesFromGrades(classContext);
    } catch (syncErr) {
      console.warn("syncTermSummariesFromGrades non-fatal warning:", syncErr);
    }
  }

  // Dual-layer sync cả năm: Tự động tính toán và lưu year_summary cho các em đã đủ điểm HK1 & HK2
  if (classContext?.rosterUsernames?.length && classContext?.namHoc) {
    try {
      await fetchYearSummary(classContext.rosterUsernames, classContext.namHoc);
    } catch (yearErr) {
      console.warn("syncYearSummariesFromGrades non-fatal notice:", yearErr);
    }
  }

  return true;
}

// ── Truy vấn lịch sử chỉnh sửa điểm (Audit Logs) qua RPC bảo mật ──
export async function fetchStudentGradeAuditLogs(studentUsername, namHoc, hocKy) {
  const { data, error } = await supabase.rpc("get_student_grade_audit_logs", {
    p_student_username: studentUsername,
    p_nam_hoc: namHoc,
    p_hoc_ky: Number(hocKy) || 1,
  });

  if (error) throw error;
  return data || [];
}

// ── Lưu tổng kết học kỳ của 1 học sinh ──
export async function saveStudentTermSummary(payload) {
  const { error } = await supabase
    .from("term_summary")
    .upsert(payload, { onConflict: "username,nam_hoc,hoc_ky" });
  if (error) throw error;
  return true;
}

// ── Lưu tổng kết cả năm của 1 học sinh ──
export async function saveStudentYearSummary(payload) {
  const { error } = await supabase
    .from("year_summary")
    .upsert(payload, { onConflict: "username,nam_hoc" });
  if (error) throw error;
  return true;
}

// ── Lưu điểm danh của 1 học sinh ──
export async function saveStudentAttendance(rows) {
  const { error } = await supabase
    .from("attendance")
    .upsert(rows, { onConflict: "username,nam_hoc,hoc_ky,ngay" });
  if (error) throw error;
  return true;
}

// ── Lấy toàn bộ điểm danh trong học kỳ của danh sách học sinh (phục vụ xuất Excel ma trận) ──
export async function fetchClassSemesterAttendance(usernames, namHoc, hocKyInt) {
  if (!usernames || !usernames.length) return [];
  const { data, error } = await supabase
    .from("attendance")
    .select("username, ngay, trang_thai")
    .eq("nam_hoc", namHoc)
    .eq("hoc_ky", hocKyInt)
    .in("username", usernames);

  if (error) throw error;
  return data || [];
}

// ── Lưu điểm danh hàng loạt (Hỗ trợ nhập Excel 1 ngày hoặc cả học kỳ) ──
export async function saveBulkAttendanceMatrix(attendanceRows) {
  if (!attendanceRows || !attendanceRows.length) return true;

  const CHUNK_SIZE = 100;
  for (let i = 0; i < attendanceRows.length; i += CHUNK_SIZE) {
    const chunk = attendanceRows.slice(i, i + CHUNK_SIZE);
    const { error } = await supabase
      .from("attendance")
      .upsert(chunk, { onConflict: "username,nam_hoc,hoc_ky,ngay" });
    if (error) throw error;
  }
  return true;
}

// ── Tải lên và cập nhật ảnh đại diện học sinh ──
export async function uploadStudentAvatarForTeacher(username, resizedBlob, ext) {
  const filePath = `avatars/${username}.${ext}`;
  const staleExts = ["webp", "jpeg", "jpg", "avif"].filter((e) => e !== ext);
  await supabase.storage.from("user-assets").remove(staleExts.map((e) => `avatars/${username}.${e}`)).catch(() => {});
  const { error: uploadError } = await supabase.storage.from("user-assets").upload(filePath, resizedBlob, { upsert: true, contentType: resizedBlob.type });
  if (uploadError) throw uploadError;
  const { data: urlData } = supabase.storage.from("user-assets").getPublicUrl(filePath);
  const publicUrl = urlData?.publicUrl;
  if (!publicUrl) throw new Error("Không lấy được public URL");
  const bustedUrl = `${publicUrl}?v=${Date.now()}`;
  const { error: updateError } = await supabase.from("users").update({ avatar: bustedUrl }).eq("username", username);
  if (updateError) throw updateError;
  return bustedUrl;
}