export const ACCENT = "#FF6B35";

export const HK_INT_MAP = { HK1: 1, HK2: 2 };

export const HOC_LUC_OPTIONS   = ["Giỏi", "Khá", "Trung Bình", "Yếu", "Kém"];
export const HANH_KIEM_OPTIONS = ["Tốt", "Khá", "Trung Bình", "Yếu"];

export const STATUS_CYCLE = ["co_mat", "nghi_phep", "nghi_khong_phep", "nghi_le"];

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
export const GRADE_WEIGHTS = {
  diem_mieng:   1,
  diem_vo:      1,
  diem_15_phut: 1,
  diem_1_tiet:  2,
  diem_thi:     3,
};