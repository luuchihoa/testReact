import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as XLSX from "xlsx";
import {
  normalizeGradeScore,
  parseGradesExcel,
} from "./utils/excelGradesHelper.js";

describe("excelGradesHelper - Chuẩn hóa điểm số", () => {
  it("để trống (hoặc null / undefined / '-' / '—') trả về null", () => {
    assert.deepEqual(normalizeGradeScore(""), { value: null, error: null });
    assert.deepEqual(normalizeGradeScore(null), { value: null, error: null });
    assert.deepEqual(normalizeGradeScore(undefined), { value: null, error: null });
    assert.deepEqual(normalizeGradeScore("-"), { value: null, error: null });
    assert.deepEqual(normalizeGradeScore("—"), { value: null, error: null });
    assert.deepEqual(normalizeGradeScore("null"), { value: null, error: null });
  });

  it("chấp nhận số nguyên và số thập phân hợp lệ (dấu chấm hoặc phẩy)", () => {
    assert.deepEqual(normalizeGradeScore("8"), { value: 8, error: null });
    assert.deepEqual(normalizeGradeScore(8), { value: 8, error: null });
    assert.deepEqual(normalizeGradeScore("7.5"), { value: 7.5, error: null });
    assert.deepEqual(normalizeGradeScore("7,5"), { value: 7.5, error: null });
    assert.deepEqual(normalizeGradeScore("9.25"), { value: 9.3, error: null }); // làm tròn 1 chữ số
    assert.deepEqual(normalizeGradeScore(10), { value: 10, error: null });
    assert.deepEqual(normalizeGradeScore(0), { value: 0, error: null });
  });

  it("phát hiện lỗi khi điểm ngoài khoảng [0, 10] hoặc không phải số", () => {
    const r1 = normalizeGradeScore("-1");
    assert.equal(r1.value, null);
    assert.match(r1.error, /phải từ 0 đến 10/);

    const r2 = normalizeGradeScore("11");
    assert.equal(r2.value, null);
    assert.match(r2.error, /phải từ 0 đến 10/);

    const r3 = normalizeGradeScore("abc");
    assert.equal(r3.value, null);
    assert.match(r3.error, /không phải số hợp lệ/);
  });
});

describe("excelGradesHelper - Đọc và phân tích file mẫu (parseGradesExcel)", () => {
  const mockStudents = [
    { username: "2026_c1_01", tenThanh: "Maria", hoTen: "Nguyễn Thị Mai", gioiTinh: "Nữ" },
    { username: "2026_c1_02", tenThanh: "Giuse", hoTen: "Trần Văn An", gioiTinh: "Nam" },
    { username: "2026_c1_03", tenThanh: "Phêrô", hoTen: "Lê Minh Tuấn", gioiTinh: "Nam" },
  ];

  function createMockFileFromAOA(aoa) {
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const u8 = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return {
      name: "test.xlsx",
      arrayBuffer: async () => u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength),
    };
  }

  it("đọc chính xác file mẫu điểm học kỳ khi upload", async () => {
    const aoa = [
      ["GIÁO XỨ AN NGÃI - BAN GIÁO LÝ"],
      ["FILE MẪU NHẬP ĐIỂM LỚP CHIEN_1 - HỌC KỲ I"],
      ["Niên khóa: 2026-2027 · Sĩ số: 3 Giáo lý sinh"],
      ["HƯỚNG DẪN: Nhập điểm từ 0 đến 10. Để trống nếu chưa có điểm."],
      [],
      ["STT", "Mã Giáo lý sinh", "Tên Thánh", "Họ và Tên", "Giới tính", "Điểm Miệng", "Điểm Vở", "Điểm 15 Phút", "Điểm 1 Tiết", "Điểm Thi HK", "Ghi chú"],
      [1, "2026_c1_01", "Maria", "Nguyễn Thị Mai", "Nữ", 8, 9, 8.5, 9, 8.5, ""],
      [2, "2026_c1_02", "Giuse", "Trần Văn An", "Nam", "7,5", "8", "7", "6.5", "8", ""],
      [3, "2026_c1_03", "Phêrô", "Lê Minh Tuấn", "Nam", "", "", "", "", "", ""], // Chưa có điểm
    ];

    const file = createMockFileFromAOA(aoa);
    const result = await parseGradesExcel(file, mockStudents, {
      lop: "CHIEN_1",
      namHoc: "2026-2027",
      hocKyInt: 1,
    });

    assert.equal(result.matchedCount, 3);
    assert.equal(result.unmatchedRows.length, 0);
    assert.equal(result.totalScoreErrors, 0);
    assert.equal(result.previewRows.length, 3);
    assert.equal(result.parsedRecords[0].lop, "CHIEN_1");

    // Học sinh 1: có đủ 5 cột điểm -> có ĐTB tự động
    const r0 = result.previewRows[0];
    assert.equal(r0.scores.diem_mieng, 8);
    assert.equal(r0.scores.diem_vo, 9);
    assert.equal(r0.scores.diem_15_phut, 8.5);
    assert.equal(r0.scores.diem_1_tiet, 9);
    assert.equal(r0.scores.diem_thi, 8.5);
    // (8*1 + 9*1 + 8.5*1 + 9*2 + 8.5*3) / 8 = (8 + 9 + 8.5 + 18 + 25.5)/8 = 69/8 = 8.625 -> 8.6
    assert.equal(r0.scores.diem_tb, 8.6);

    // Học sinh 3: trống toàn bộ điểm -> ĐTB null
    const r2 = result.previewRows[2];
    assert.equal(r2.scores.diem_mieng, null);
    assert.equal(r2.scores.diem_tb, null);
  });
});
