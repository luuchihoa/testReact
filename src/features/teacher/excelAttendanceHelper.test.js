import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as XLSX from "xlsx";
import {
  normalizeAttendanceStatus,
  parseAttendanceExcel,
} from "./utils/excelAttendanceHelper.js";

describe("excelAttendanceHelper - Chuẩn hóa ký hiệu điểm danh", () => {
  it("để trống (hoặc chuỗi rỗng / null / undefined) tự động nhận diện là 'co_mat'", () => {
    assert.equal(normalizeAttendanceStatus(""), "co_mat");
    assert.equal(normalizeAttendanceStatus(null), "co_mat");
    assert.equal(normalizeAttendanceStatus(undefined), "co_mat");
    assert.equal(normalizeAttendanceStatus("   "), "co_mat");
  });

  it("nhận diện các ký hiệu 'Có mặt' thông dụng", () => {
    assert.equal(normalizeAttendanceStatus("x"), "co_mat");
    assert.equal(normalizeAttendanceStatus("X"), "co_mat");
    assert.equal(normalizeAttendanceStatus("v"), "co_mat");
    assert.equal(normalizeAttendanceStatus("✓"), "co_mat");
    assert.equal(normalizeAttendanceStatus("1"), "co_mat");
    assert.equal(normalizeAttendanceStatus("cm"), "co_mat");
    assert.equal(normalizeAttendanceStatus("Có mặt"), "co_mat");
    assert.equal(normalizeAttendanceStatus("co mat"), "co_mat");
  });

  it("nhận diện ký hiệu 'Nghỉ có phép' (P, phép, cp)", () => {
    assert.equal(normalizeAttendanceStatus("p"), "nghi_phep");
    assert.equal(normalizeAttendanceStatus("P"), "nghi_phep");
    assert.equal(normalizeAttendanceStatus("phép"), "nghi_phep");
    assert.equal(normalizeAttendanceStatus("phep"), "nghi_phep");
    assert.equal(normalizeAttendanceStatus("CP"), "nghi_phep");
    assert.equal(normalizeAttendanceStatus("có phép"), "nghi_phep");
    assert.equal(normalizeAttendanceStatus("vang phep"), "nghi_phep");
  });

  it("nhận diện ký hiệu 'Nghỉ không phép' (K, kp, không phép)", () => {
    assert.equal(normalizeAttendanceStatus("k"), "nghi_khong_phep");
    assert.equal(normalizeAttendanceStatus("K"), "nghi_khong_phep");
    assert.equal(normalizeAttendanceStatus("kp"), "nghi_khong_phep");
    assert.equal(normalizeAttendanceStatus("KP"), "nghi_khong_phep");
    assert.equal(normalizeAttendanceStatus("không phép"), "nghi_khong_phep");
    assert.equal(normalizeAttendanceStatus("khong phep"), "nghi_khong_phep");
  });

  it("nhận diện ký hiệu 'Nghỉ lễ' (L, lễ, nghỉ lễ, ✝)", () => {
    assert.equal(normalizeAttendanceStatus("l"), "nghi_le");
    assert.equal(normalizeAttendanceStatus("L"), "nghi_le");
    assert.equal(normalizeAttendanceStatus("lễ"), "nghi_le");
    assert.equal(normalizeAttendanceStatus("nghỉ lễ"), "nghi_le");
    assert.equal(normalizeAttendanceStatus("✝"), "nghi_le");
  });

  it("ký hiệu '-' hoặc '—' trả về null (chưa có dữ liệu / chưa học)", () => {
    assert.equal(normalizeAttendanceStatus("-"), null);
    assert.equal(normalizeAttendanceStatus("—"), null);
    assert.equal(normalizeAttendanceStatus("null"), null);
    assert.equal(normalizeAttendanceStatus("chua co"), null);
  });

  it("ngày nghỉ lễ khi ô để trống tự động trả về 'nghi_le'", () => {
    assert.equal(normalizeAttendanceStatus("", true), "nghi_le");
    assert.equal(normalizeAttendanceStatus(null, true), "nghi_le");
    assert.equal(normalizeAttendanceStatus(undefined, true), "nghi_le");
  });
});

describe("excelAttendanceHelper - Đọc và phân tích file mẫu (parseAttendanceExcel)", () => {
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

  it("đọc chính xác file mẫu điểm danh 1 ngày khi tải xuống và upload lại", async () => {
    const aoa = [
      ["GIÁO XỨ AN NGÃI - BAN GIÁO LÝ"],
      ["FILE MẪU NHẬP ĐIỂM DANH LỚP CHIEN_1 - NGÀY 06/09/2026"],
      ["Niên khóa: 2026-2027 · Học kỳ: Học kỳ I"],
      ["HƯỚNG DẪN NHẬP: Để trống hoặc 'x' = Có mặt; 'P' = Nghỉ phép; 'K' = Nghỉ không phép; 'L' = Nghỉ lễ; '-' = Chưa học."],
      [],
      ["STT", "Mã Giáo lý sinh", "Tên Thánh", "Họ và Tên", "Giới tính", "Điểm danh (06/09/2026)", "Ghi chú"],
      [1, "2026_c1_01", "Maria", "Nguyễn Thị Mai", "Nữ", "", ""], // Để trống -> có mặt
      [2, "2026_c1_02", "Giuse", "Trần Văn An", "Nam", "P", ""],  // P -> nghỉ phép
      [3, "2026_c1_03", "Phêrô", "Lê Minh Tuấn", "Nam", "K", ""], // K -> nghỉ không phép
    ];

    const file = createMockFileFromAOA(aoa);
    const result = await parseAttendanceExcel(file, mockStudents, {
      namHoc: "2026-2027",
      hocKy: "HK1",
      hocKyInt: 1,
      currentDate: "2026-09-06",
    });

    assert.equal(result.matchedCount, 3);
    assert.equal(result.unmatchedRows.length, 0);
    assert.equal(result.dateColumns.length, 1);
    assert.equal(result.dateColumns[0].isoDate, "2026-09-06");
    assert.equal(result.summaryStats.co_mat, 1);
    assert.equal(result.summaryStats.nghi_phep, 1);
    assert.equal(result.summaryStats.nghi_khong_phep, 1);
    assert.equal(result.parsedRecords.length, 3);
  });

  it("đọc chính xác file mẫu ma trận cả học kỳ (có ngày lễ, ngày tương lai)", async () => {
    const sundays = [
      new Date(2026, 8, 6),
      new Date(2026, 8, 13),
      new Date(2026, 10, 2), // 02/11 Nghỉ lễ Các Đẳng
    ];
    const holidaysMap = {
      "2026-11-02": { ten_ngay_le: "Lễ Các Đẳng", loai_nghi: "nghi_le" },
    };

    const aoa = [
      ["GIÁO XỨ AN NGÃI - BAN GIÁO LÝ"],
      ["FILE MẪU NHẬP MA TRẬN CHUYÊN CẦN LỚP CHIEN_1 - HỌC KỲ I"],
      ["Niên khóa: 2026-2027 · Sĩ số: 3 em · Tổng số: 3 buổi Chúa Nhật"],
      ["HƯỚNG DẪN: Để trống hoặc 'x' = Có mặt; 'P' = Nghỉ phép; 'K' = Nghỉ không phép; 'L' = Nghỉ lễ; '-' = Chưa học."],
      [],
      ["STT", "Mã Giáo lý sinh", "Tên Thánh", "Họ và Tên", "Giới tính", "B1 (06/09)", "B2 (13/09)", "B3 (02/11 - Lễ)", "Ghi chú"],
      [1, "2026_c1_01", "Maria", "Nguyễn Thị Mai", "Nữ", "", "P", "L", ""],
      [2, "2026_c1_02", "Giuse", "Trần Văn An", "Nam", "x", "", "L", ""],
      [3, "2026_c1_03", "Phêrô", "Lê Minh Tuấn", "Nam", "K", "-", "L", ""],
    ];

    const file = createMockFileFromAOA(aoa);
    const result = await parseAttendanceExcel(file, mockStudents, {
      namHoc: "2026-2027",
      hocKy: "HK1",
      hocKyInt: 1,
      sundays,
      holidaysMap,
    });

    assert.equal(result.matchedCount, 3);
    assert.equal(result.dateColumns.length, 3);
    assert.equal(result.summaryStats.co_mat, 3); // HS1 B1, HS2 B1, HS2 B2
    assert.equal(result.summaryStats.nghi_phep, 1); // HS1 B2
    assert.equal(result.summaryStats.nghi_khong_phep, 1); // HS3 B1
    assert.equal(result.summaryStats.nghi_le, 3); // 3 em B3
  });
});
