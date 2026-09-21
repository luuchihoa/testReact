/* ============================================================
   HELPER CHO BẢNG ĐIỂM DẠNG SPREADSHEET & QUẢN TRỊ SỔ ĐIỂM
   Đồng bộ logic tính toán và chuẩn hóa màu sắc WCAG AAA
   ============================================================ */

export const HK_INT_MAP = { HK1: 1, HK2: 2 };

export const GRADE_FIELDS = [
  { key: "diem_mieng",   label: "Miệng",  short: "M"  },
  { key: "diem_vo",      label: "Vở",     short: "V"  },
  { key: "diem_15_phut", label: "15'",    short: "15'" },
  { key: "diem_1_tiet",  label: "1 Tiết", short: "1T" },
  { key: "diem_thi",     label: "Thi",    short: "Thi" },
  { key: "diem_tb",      label: "TB",     short: "TB" },
];

// Trọng số dùng để tự động tính điểm trung bình học kỳ:
// Miệng (1), Vở (1), 15 Phút (1), 1 Tiết (2), Thi (3)
export const GRADE_WEIGHTS = {
  diem_mieng:   1,
  diem_vo:      1,
  diem_15_phut: 1,
  diem_1_tiet:  2,
  diem_thi:     3,
};

// Tự tính điểm TB: CHỈ tính khi có ĐỦ CẢ 5 CỘT ĐIỂM (Miệng x1, Vở x1, 15' x1, 1 Tiết x2, Thi x3).
// Nếu thiếu bất kỳ cột nào, trả về null (giao diện hiển thị "—").
export function computeDiemTB(g) {
  if (!g) return null;
  const parts = [
    { v: g.diem_mieng,   w: GRADE_WEIGHTS.diem_mieng },
    { v: g.diem_vo,      w: GRADE_WEIGHTS.diem_vo },
    { v: g.diem_15_phut, w: GRADE_WEIGHTS.diem_15_phut },
    { v: g.diem_1_tiet,  w: GRADE_WEIGHTS.diem_1_tiet },
    { v: g.diem_thi,     w: GRADE_WEIGHTS.diem_thi },
  ];
  const hasAll = parts.every((p) => p.v !== null && p.v !== undefined && p.v !== "" && !isNaN(Number(p.v)));
  if (!hasAll) return null;
  const totalW = parts.reduce((s, p) => s + p.w, 0); // 8
  const sum    = parts.reduce((s, p) => s + Number(p.v) * p.w, 0);
  return Math.round((sum / totalW) * 10) / 10;
}

// Lấy "Tên" riêng (từ cuối cùng) trong Họ và Tên đầy đủ
export function getTenRieng(hoTen) {
  const parts = (hoTen || "").trim().split(/\s+/).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : (hoTen || "");
}

// Sắp xếp học sinh theo Tên (A-Z)
export function sortStudentsByTen(students) {
  return [...students].sort((a, b) => {
    const nameA = a.hoTen || a.ho_va_ten || a.username || "";
    const nameB = b.hoTen || b.ho_va_ten || b.username || "";
    const cmp = getTenRieng(nameA).localeCompare(getTenRieng(nameB), "vi");
    if (cmp !== 0) return cmp;
    return nameA.localeCompare(nameB, "vi");
  });
}

// Phân loại màu sắc điểm số đạt chuẩn WCAG AAA (≥ 7.0:1 cho chữ thường, ≥ 3.0:1 cho viền)
export function getGradeTheme(tb) {
  if (tb === null || tb === undefined || tb === "" || isNaN(Number(tb))) {
    return {
      bg: "bg-stone-100 dark:bg-stone-850",
      text: "text-stone-600 dark:text-stone-400",
      border: "border-stone-300 dark:border-stone-700",
      badge: "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700",
      pill: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
      label: "Chưa có",
    };
  }
  const n = Number(tb);
  if (n >= 8.0) {
    return {
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-800 dark:text-emerald-300 font-bold",
      border: "border-emerald-300 dark:border-emerald-800/60",
      badge: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60",
      pill: "bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white",
      label: "Giỏi",
    };
  }
  if (n >= 6.5) {
    return {
      bg: "bg-blue-50 dark:bg-blue-950/40",
      text: "text-blue-800 dark:text-blue-300 font-bold",
      border: "border-blue-300 dark:border-blue-800/60",
      badge: "bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800/60",
      pill: "bg-blue-700 text-white dark:bg-blue-600 dark:text-white",
      label: "Khá",
    };
  }
  if (n >= 5.0) {
    return {
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-900 dark:text-amber-300 font-bold",
      border: "border-amber-300 dark:border-amber-800/60",
      badge: "bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60",
      pill: "bg-amber-700 text-white dark:bg-amber-600 dark:text-white",
      label: "Trung Bình",
    };
  }
  return {
    bg: "bg-red-50 dark:bg-red-950/40",
    text: "text-red-800 dark:text-red-300 font-bold",
    border: "border-red-300 dark:border-red-800/60",
    badge: "bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800/60",
    pill: "bg-red-700 text-white dark:bg-red-600 dark:text-white",
    label: "Yếu",
  };
}

// Tương thích ngược: Class màu chữ điểm TB đạt WCAG AAA
export function tbColorClass(tb) {
  const theme = getGradeTheme(tb);
  return theme.text;
}

// Xác định trạng thái nghiệp vụ trung thực cho từng dòng học sinh
export function getStudentRowStatus(row, partialErrors = {}) {
  if (row.warning) {
    return {
      label: "Cần theo dõi",
      type: "warning",
      badgeClass: "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60 font-bold",
    };
  }
  if (partialErrors?.attendanceError || (row.vangCoPhep === null && row.vangKhongPhep === null)) {
    return {
      label: "Thiếu chuyên cần",
      type: "error",
      badgeClass: "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 font-medium",
    };
  }
  if (partialErrors?.termError || (!row.hocLuc && !row.hanhKiem)) {
    return {
      label: "Thiếu đánh giá",
      type: "muted",
      badgeClass: "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-300 dark:border-stone-700 font-medium",
    };
  }
  if (row.diem_tb === null || row.diem_tb === undefined || row.diem_tb === "" || isNaN(Number(row.diem_tb))) {
    return {
      label: "Chưa có điểm",
      type: "neutral",
      badgeClass: "bg-stone-100 dark:bg-stone-850 text-stone-600 dark:text-stone-400 border border-stone-300 dark:border-stone-700 font-medium",
    };
  }
  return {
    label: "Đủ dữ liệu",
    type: "complete",
    badgeClass: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 font-bold",
  };
}

// Phân tích thống kê toàn diện cho 1 lớp
export function computeClassStats(rowsWithWarning = [], partialErrors = {}) {
  const total = rowsWithWarning.length;
  if (total === 0) {
    return {
      total: 0,
      maleCount: 0,
      femaleCount: 0,
      avgScore: null,
      scoreCount: 0,
      gioiCount: 0,
      khaCount: 0,
      tbCount: 0,
      yeuCount: 0,
      chuaCoDiemCount: 0,
      warningCount: 0,
      totalVang: 0,
      avgVang: null,
      validVangCount: 0,
      hasAttendanceError: !!partialErrors?.attendanceError,
      hasGradesError: !!partialErrors?.gradesError,
      hasTermError: !!partialErrors?.termError,
      statusLabel: "Chưa có danh sách",
      statusType: "empty",
    };
  }

  let sumScore = 0;
  let scoreCount = 0;
  let gioi = 0, kha = 0, tb = 0, yeu = 0, chuaCoDiem = 0;
  let male = 0, female = 0;
  let warning = 0;
  let totalVang = 0;
  let validVangCount = 0;

  rowsWithWarning.forEach((r) => {
    const gender = (r.student?.gioiTinh || r.student?.gioi_tinh || r.student?.phai || "").toLowerCase();
    if (gender === "nam") male++;
    else if (gender === "nu" || gender === "nữ") female++;

    if (r.warning) warning++;

    if (r.vangCoPhep !== null && r.vangKhongPhep !== null) {
      const v = (r.vangCoPhep || 0) + (r.vangKhongPhep || 0);
      totalVang += v;
      validVangCount++;
    }

    if (r.diem_tb !== null && r.diem_tb !== undefined && r.diem_tb !== "" && !isNaN(Number(r.diem_tb))) {
      const num = Number(r.diem_tb);
      sumScore += num;
      scoreCount++;
      if (num >= 8.0) gioi++;
      else if (num >= 6.5) kha++;
      else if (num >= 5.0) tb++;
      else yeu++;
    } else {
      chuaCoDiem++;
    }
  });

  const avgScore = scoreCount > 0 ? Math.round((sumScore / scoreCount) * 100) / 100 : null;
  const avgVang = validVangCount > 0 ? Math.round((totalVang / validVangCount) * 10) / 10 : null;

  let statusLabel = "";
  let statusType = "complete";

  if (partialErrors?.attendanceError) {
    statusLabel = "Chưa tải được chuyên cần";
    statusType = "error";
  } else if (partialErrors?.gradesError) {
    statusLabel = "Chưa tải được điểm số";
    statusType = "error";
  } else if (partialErrors?.termError) {
    statusLabel = "Chưa tải được đánh giá";
    statusType = "error";
  } else if (scoreCount === 0) {
    statusLabel = "Chưa nhập điểm";
    statusType = "no_grades";
  } else if (scoreCount < total) {
    if (warning > 0) {
      statusLabel = `Chưa hoàn tất · ${warning} em cần theo dõi`;
      statusType = "warning";
    } else {
      statusLabel = "Chưa hoàn tất";
      statusType = "in_progress";
    }
  } else if (warning > 0) {
    statusLabel = `${warning} em cần theo dõi`;
    statusType = "warning";
  } else {
    statusLabel = "Đã hoàn tất";
    statusType = "complete";
  }

  return {
    total,
    maleCount: male,
    femaleCount: female,
    avgScore,
    scoreCount,
    gioiCount: gioi,
    khaCount: kha,
    tbCount: tb,
    yeuCount: yeu,
    chuaCoDiemCount: chuaCoDiem,
    warningCount: warning,
    totalVang,
    avgVang,
    validVangCount,
    hasAttendanceError: !!partialErrors?.attendanceError,
    hasGradesError: !!partialErrors?.gradesError,
    hasTermError: !!partialErrors?.termError,
    statusLabel,
    statusType,
  };
}

// Sắp xếp linh hoạt theo trường dữ liệu
export function sortGradeRows(rows, sortField, sortOrder = "asc") {
  const sorted = rows.map((r, originalIndex) => ({ ...r, _originalIndex: originalIndex }));
  const orderMultiplier = sortOrder === "desc" ? -1 : 1;

  sorted.sort((a, b) => {
    if (sortField === "stt") {
      return (a._originalIndex - b._originalIndex) * orderMultiplier;
    }

    if (sortField === "name") {
      const nameA = a.student?.hoTen || a.student?.username || "";
      const nameB = b.student?.hoTen || b.student?.username || "";
      const cmp = getTenRieng(nameA).localeCompare(getTenRieng(nameB), "vi");
      if (cmp !== 0) return cmp * orderMultiplier;
      return nameA.localeCompare(nameB, "vi") * orderMultiplier;
    }

    if (sortField === "diem_tb") {
      const hasA = a.diem_tb !== null && a.diem_tb !== undefined && a.diem_tb !== "" && !isNaN(Number(a.diem_tb));
      const hasB = b.diem_tb !== null && b.diem_tb !== undefined && b.diem_tb !== "" && !isNaN(Number(b.diem_tb));

      // Luôn đưa các em chưa có điểm xuống cuối danh sách bất kể sort asc hay desc
      if (!hasA && !hasB) return a._originalIndex - b._originalIndex;
      if (!hasA) return 1;
      if (!hasB) return -1;

      const diff = Number(a.diem_tb) - Number(b.diem_tb);
      if (diff !== 0) return diff * orderMultiplier;
      return a._originalIndex - b._originalIndex;
    }

    if (sortField === "vang") {
      const hasA = a.vangKhongPhep !== null || a.vangCoPhep !== null;
      const hasB = b.vangKhongPhep !== null || b.vangCoPhep !== null;

      if (!hasA && !hasB) return a._originalIndex - b._originalIndex;
      if (!hasA) return 1;
      if (!hasB) return -1;

      const vA = (a.vangKhongPhep || 0) * 2 + (a.vangCoPhep || 0);
      const vB = (b.vangKhongPhep || 0) * 2 + (b.vangCoPhep || 0);
      if (vA !== vB) return (vA - vB) * orderMultiplier;
      return a._originalIndex - b._originalIndex;
    }

    if (sortField === "warning") {
      const wA = a.warning ? 1 : 0;
      const wB = b.warning ? 1 : 0;
      if (wA !== wB) return (wA - wB) * orderMultiplier;
      return a._originalIndex - b._originalIndex;
    }

    // Default: giữ nguyên thứ tự ban đầu
    return (a._originalIndex - b._originalIndex) * orderMultiplier;
  });

  return sorted.map((item) => {
    const copy = { ...item };
    delete copy._originalIndex;
    return copy;
  });
}