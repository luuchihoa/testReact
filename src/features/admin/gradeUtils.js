/* ============================================================
   HELPER CHO BẢNG ĐIỂM DẠNG SPREADSHEET (module D)
   Sao chép nguyên logic từ BulkGradeEntryView trong TeacherClassView.jsx
   (KHÔNG đổi công thức/thứ tự sắp xếp) để GradesTab.jsx phía admin dùng
   được mà không phải sửa file của giáo viên đang chạy.
   ============================================================ */

export const HK_INT_MAP = { HK1: 1, HK2: 2 };

export const GRADE_FIELDS = [
  { key: "diem_mieng",   label: "Miệng"  },
  { key: "diem_vo",      label: "Vở"     },
  { key: "diem_15_phut", label: "15'"    },
  { key: "diem_1_tiet",  label: "1 Tiết" },
  { key: "diem_thi",     label: "Thi"    },
  { key: "diem_tb",      label: "TB"     },
];

// Trọng số dùng để tự động tính điểm trung bình học kỳ.
// Có thể chỉnh lại nếu quy chế tính điểm của giáo xứ/trường thay đổi.
// Giữ đồng bộ với GRADE_WEIGHTS trong TeacherClassView.jsx.
export const GRADE_WEIGHTS = {
  diem_mieng:   1,
  diem_vo:      1,
  diem_15_phut: 1,
  diem_1_tiet:  2,
  diem_thi:     3,
};

// Tự tính điểm TB dựa trên các điểm thành phần đã có (bỏ qua ô còn trống).
// Trả về null nếu chưa có điểm thành phần nào để tránh hiện "0" gây hiểu lầm.
export function computeDiemTB(g) {
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
function getTenRieng(hoTen) {
  const parts = (hoTen || "").trim().split(/\s+/).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : (hoTen || "");
}

export function sortStudentsByTen(students) {
  return [...students].sort((a, b) => {
    const cmp = getTenRieng(a.hoTen).localeCompare(getTenRieng(b.hoTen), "vi");
    if (cmp !== 0) return cmp;
    return (a.hoTen || "").localeCompare(b.hoTen || "", "vi");
  });
}

// Màu chữ cho điểm TB, cùng ngôn ngữ màu với RANK_COLORS (Giỏi/Khá/TB/Yếu/Kém)
export function tbColorClass(tb) {
  if (tb === null || tb === undefined || tb === "") return "text-stone-400";
  const n = Number(tb);
  if (n >= 8)   return "text-[#34C759]";
  if (n >= 6.5) return "text-[#007AFF]";
  if (n >= 5)   return "text-[#FFD60A]";
  if (n >= 3.5) return "text-[#FF9500]";
  return "text-[#FF375F]";
}