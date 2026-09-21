import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeEnrollmentPhone,
  getAgeRecommendation,
  validateEnrollmentForm,
  buildEnrollmentPayload,
} from "./enrollmentForm.js";

test("normalizeEnrollmentPhone: chuẩn hóa các định dạng số điện thoại Việt Nam", () => {
  assert.equal(normalizeEnrollmentPhone("0905 143 643"), "0905143643");
  assert.equal(normalizeEnrollmentPhone("+84905143643"), "0905143643");
  assert.equal(normalizeEnrollmentPhone("+84 905-143.643"), "0905143643");
  assert.equal(normalizeEnrollmentPhone("(0905) 143 643"), "0905143643");
  assert.equal(normalizeEnrollmentPhone(""), "");
  assert.equal(normalizeEnrollmentPhone(null), "");
});

test("getAgeRecommendation: đưa ra gợi ý khi năm sinh lệch khối (đúng thứ tự: khoiValue, birthYearStr)", () => {
  // Khối Chiên Con (5–7 tuổi) -> sinh năm 2019-2021 với niên khóa 2026
  const match = getAgeRecommendation("Chiên Con (Mầm non – Lớp 2)", "2020", 2026);
  assert.equal(match.isUnusual, false);
  assert.equal(match.actualAge, 6);

  // Sinh năm 2014 (12 tuổi) nộp Chiên Con -> cảnh báo lệch tuổi
  const mismatch = getAgeRecommendation("Chiên Con (Mầm non – Lớp 2)", "2014", 2026);
  assert.equal(mismatch.isUnusual, true);
  assert.equal(mismatch.actualAge, 12);
  assert.match(mismatch.message, /Chiên Con thông thường dành cho/);
});

test("validateEnrollmentForm: phát hiện thiếu trường bắt buộc", () => {
  const emptyForm = { hoTen: "", namSinh: "", sdt: "", giaoXom: "", khoiDangKy: "", ghiChu: "" };
  const res = validateEnrollmentForm(emptyForm, 2026);

  assert.equal(res.isValid, false);
  assert.ok(res.errors.hoTen);
  assert.ok(res.errors.namSinh);
  assert.ok(res.errors.sdt);
  assert.ok(res.errors.giaoXom);
  assert.ok(res.errors.khoiDangKy);
});

test("validateEnrollmentForm: chấp nhận form đầy đủ và hợp lệ", () => {
  const validForm = {
    hoTen: "Maria Têrêsa Nguyễn Thị Thu",
    namSinh: "2018",
    sdt: "0905 143 643",
    giaoXom: "Xóm 2",
    khoiDangKy: "Rước Lễ Lần Đầu (Lớp 3 – 4)",
    ghiChu: "Bé đã học xong Khai Tâm",
  };

  const res = validateEnrollmentForm(validForm, 2026);
  assert.equal(res.isValid, true);
  assert.deepEqual(res.errors, {});
});

test("validateEnrollmentForm: từ chối số điện thoại hoặc năm sinh không hợp lệ", () => {
  const invalidForm = {
    hoTen: "A", // Quá ngắn
    namSinh: "1980", // Quá tuổi
    sdt: "0123456789", // Đầu số 01 cũ
    giaoXom: "Xóm 1",
    khoiDangKy: "Khối Lạ Không Có",
    ghiChu: "a".repeat(501), // Quá dài
  };

  const res = validateEnrollmentForm(invalidForm, 2026);
  assert.equal(res.isValid, false);
  assert.ok(res.errors.hoTen);
  assert.ok(res.errors.namSinh);
  assert.ok(res.errors.sdt);
  assert.ok(res.errors.khoiDangKy);
  assert.ok(res.errors.ghiChu);
});

test("buildEnrollmentPayload: chuẩn bị payload chính xác cho RPC", () => {
  const form = {
    hoTen: "  Giuse Trần Văn Minh  ",
    namSinh: "2016",
    sdt: "+84 905 888 999",
    giaoXom: "  Giáo họ Phêrô  ",
    khoiDangKy: "Thêm Sức (Lớp 5 – 6)",
    ghiChu: "  Cần hỗ trợ đưa đón  ",
  };

  const payload = buildEnrollmentPayload(form);
  assert.deepEqual(payload, {
    p_ho_ten: "Giuse Trần Văn Minh",
    p_nam_sinh: 2016,
    p_sdt: "0905888999",
    p_giao_xom: "Giáo họ Phêrô",
    p_khoi_dang_ky: "Thêm Sức (Lớp 5 – 6)",
    p_ghi_chu: "Cần hỗ trợ đưa đón",
  });
});
