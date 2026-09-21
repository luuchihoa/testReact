import { ENROLLMENT_FORM_OPTIONS } from "./enrollmentConfig.js";

export const ENROLLMENT_FIELD_LIMITS = {
  hoTenMin: 2,
  hoTenMax: 100,
  giaoXomMin: 1,
  giaoXomMax: 100,
  ghiChuMax: 500,
};

/**
 * Chuẩn hóa số điện thoại di động Việt Nam
 * Hỗ trợ định dạng đầu 0 hoặc +84, loại bỏ khoảng trắng, dấu ngoặc, dấu gạch nối, dấu chấm
 */
export function normalizeEnrollmentPhone(sdt) {
  if (!sdt) return "";
  return String(sdt)
    .trim()
    .replace(/[\s().-]/g, "")
    .replace(/^\+84/, "0");
}

/**
 * Đưa ra gợi ý và cảnh báo mềm khi độ tuổi của học viên lệch với khối được chọn
 * Thứ tự tham số: (khoiValue, birthYearStr, startYear)
 */
export function getAgeRecommendation(khoiValue, birthYearStr, startYear = 2026) {
  if (!khoiValue || !birthYearStr) return null;
  const birthYear = parseInt(birthYearStr, 10);
  if (isNaN(birthYear) || birthYear < 1990 || birthYear > startYear) return null;

  const option = ENROLLMENT_FORM_OPTIONS.find((opt) => opt.value === khoiValue);
  if (!option) return null;

  const actualAge = startYear - birthYear;
  const isUnusual = actualAge < option.minAge || actualAge > option.maxAge;

  if (isUnusual) {
    const minBirthYear = startYear - option.maxAge;
    const maxBirthYear = startYear - option.minAge;
    return {
      isUnusual: true,
      actualAge,
      recommendedAge: option.recommendedAge,
      message: `${option.shortName} thông thường dành cho các em ${option.recommendedAge} (sinh năm ${minBirthYear} – ${maxBirthYear}). Bạn vẫn có thể gửi hồ sơ, Ban Giáo lý sẽ liên hệ tư vấn xếp lớp cụ thể.`,
    };
  }

  return {
    isUnusual: false,
    actualAge,
    recommendedAge: option.recommendedAge,
  };
}

/**
 * Hàm thuần kiểm tra tính hợp lệ của toàn bộ form đăng ký
 * Trả về { isValid: boolean, errors: Record<string, string> }
 */
export function validateEnrollmentForm(form = {}, startYear = 2026) {
  const errors = {};
  const trimmedName = (form.hoTen || "").trim();
  const trimmedGiaoXom = (form.giaoXom || "").trim();
  const trimmedGhiChu = (form.ghiChu || "").trim();
  const normalizedPhone = normalizeEnrollmentPhone(form.sdt);
  const selectedKhoi = form.khoiDangKy || form.khoi || "";

  // 1. Kiểm tra Họ và Tên
  if (!trimmedName) {
    errors.hoTen = "Vui lòng nhập Tên Thánh và họ tên của thiếu nhi.";
  } else if (trimmedName.length < ENROLLMENT_FIELD_LIMITS.hoTenMin) {
    errors.hoTen = `Họ tên phải có ít nhất ${ENROLLMENT_FIELD_LIMITS.hoTenMin} ký tự.`;
  } else if (trimmedName.length > ENROLLMENT_FIELD_LIMITS.hoTenMax) {
    errors.hoTen = `Họ tên không được vượt quá ${ENROLLMENT_FIELD_LIMITS.hoTenMax} ký tự.`;
  }

  // 2. Kiểm tra Năm sinh
  const minBirthYear = startYear - 20; // 20 tuổi
  const maxBirthYear = startYear - 3;  // 3 tuổi
  const birthYearNum = parseInt(form.namSinh, 10);

  if (!form.namSinh || !String(form.namSinh).trim()) {
    errors.namSinh = "Vui lòng nhập năm sinh của thiếu nhi.";
  } else if (
    isNaN(birthYearNum) ||
    !/^\d{4}$/.test(String(form.namSinh).trim()) ||
    birthYearNum < minBirthYear ||
    birthYearNum > maxBirthYear
  ) {
    errors.namSinh = `Năm sinh không hợp lệ (nhập 4 chữ số từ ${minBirthYear} đến ${maxBirthYear}).`;
  }

  // 3. Kiểm tra Số điện thoại phụ huynh
  if (!normalizedPhone) {
    errors.sdt = "Vui lòng nhập số điện thoại của phụ huynh hoặc người giám hộ.";
  } else if (!/^0[35789]\d{8}$/.test(normalizedPhone)) {
    errors.sdt = "Số điện thoại không hợp lệ (nhập 10 chữ số di động, ví dụ: 0905123456 hoặc +84905123456).";
  }

  // 4. Kiểm tra Giáo họ / Giáo xóm
  if (!trimmedGiaoXom) {
    errors.giaoXom = "Vui lòng nhập giáo họ hoặc giáo xóm đang sinh hoạt.";
  } else if (trimmedGiaoXom.length > ENROLLMENT_FIELD_LIMITS.giaoXomMax) {
    errors.giaoXom = `Giáo xóm không được vượt quá ${ENROLLMENT_FIELD_LIMITS.giaoXomMax} ký tự.`;
  }

  // 5. Kiểm tra Khối đăng ký (khoiDangKy)
  const validKhoiValues = ENROLLMENT_FORM_OPTIONS.map((opt) => opt.value);
  if (!selectedKhoi) {
    errors.khoiDangKy = "Vui lòng chọn khối học muốn đăng ký cho em.";
  } else if (!validKhoiValues.includes(selectedKhoi)) {
    errors.khoiDangKy = "Khối học đã chọn không nằm trong danh sách hỗ trợ trực tuyến.";
  }

  // 6. Kiểm tra Ghi chú (tùy chọn)
  if (trimmedGhiChu && trimmedGhiChu.length > ENROLLMENT_FIELD_LIMITS.ghiChuMax) {
    errors.ghiChu = `Ghi chú tối đa ${ENROLLMENT_FIELD_LIMITS.ghiChuMax} ký tự.`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Xây dựng payload an toàn để gửi qua RPC Supabase submit_dang_ky_hoc
 */
export function buildEnrollmentPayload(form = {}) {
  const selectedKhoi = form.khoiDangKy || form.khoi || "";
  return {
    p_ho_ten: (form.hoTen || "").trim(),
    p_nam_sinh: parseInt(form.namSinh, 10),
    p_sdt: normalizeEnrollmentPhone(form.sdt),
    p_giao_xom: (form.giaoXom || "").trim(),
    p_khoi_dang_ky: selectedKhoi,
    p_ghi_chu: (form.ghiChu || "").trim() || null,
  };
}
