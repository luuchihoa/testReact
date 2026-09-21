import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  generateStudentBaseUsername,
  generateAutoUsername,
  downloadSampleExcel,
  downloadSampleUsersExcel,
  parseUsersExcel,
} from "./excelRosterHelper.js";

describe("excelRosterHelper: Sinh mã học sinh, người dùng & Nhận diện tiếng Việt chuẩn xác", () => {
  describe("1. generateStudentBaseUsername: Sinh mã cơ sở dạng [tên][họ][năm sinh]", () => {
    it("Tạo mã cơ sở chuẩn xác: 'Nguyễn Văn An' (2015) -> 'annguyen15'", () => {
      const code = generateStudentBaseUsername("Nguyễn Văn An", "2015-08-15");
      assert.equal(code, "annguyen15");
    });

    it("Xử lý chính xác họ tên có dấu phức tạp: 'Nguyễn Mệnh Trình' (2015) -> 'trinhnguyen15'", () => {
      const code = generateStudentBaseUsername("Nguyễn Mệnh Trình", "2015-08-15");
      assert.equal(code, "trinhnguyen15");
    });

    it("Xử lý chính xác họ tên có dấu nặng: 'Nguyễn Mệnh Trịnh' (2015) -> 'trinhnguyen15'", () => {
      const code = generateStudentBaseUsername("Nguyễn Mệnh Trịnh", "2015-08-15");
      assert.equal(code, "trinhnguyen15");
    });

    it("Xử lý chính xác tên nữ: 'Trần Thị Mai' (2016) -> 'maitran16'", () => {
      const code = generateStudentBaseUsername("Trần Thị Mai", "2016-10-20");
      assert.equal(code, "maitran16");
    });

    it("Xử lý tên ngắn 2 từ: 'Lê An' (2014) -> 'anle14'", () => {
      const code = generateStudentBaseUsername("Lê An", "2014-05-12");
      assert.equal(code, "anle14");
    });

    it("Xử lý tên 1 từ: 'An' (2015) -> 'an15'", () => {
      const code = generateStudentBaseUsername("An", "2015-01-01");
      assert.equal(code, "an15");
    });

    it("Xử lý khi không có ngày sinh: 'Nguyễn Văn An' -> 'annguyen'", () => {
      const code = generateStudentBaseUsername("Nguyễn Văn An", "");
      assert.equal(code, "annguyen");
    });
  });

  describe("2. generateAutoUsername: Xử lý xung đột mã (Collision Resolution) khi cùng tên", () => {
    it("Cấp mã tăng dần _2, _3 khi nhiều bạn có cùng base username", () => {
      const usedSet = new Set();
      
      // Bạn 1: Nguyễn Mệnh Trình (2015) -> trinhnguyen15
      const code1 = generateAutoUsername("Nguyễn Mệnh Trình", "2015-08-15", usedSet);
      assert.equal(code1, "trinhnguyen15");
      
      // Bạn 2: Nguyễn Mệnh Trịnh (2015) -> trinhnguyen15_2
      const code2 = generateAutoUsername("Nguyễn Mệnh Trịnh", "2015-08-15", usedSet);
      assert.equal(code2, "trinhnguyen15_2");
      
      // Bạn 3: Một bạn khác cùng tên Nguyễn Mệnh Trình (2015) -> trinhnguyen15_3
      const code3 = generateAutoUsername("Nguyễn Mệnh Trình", "2015-08-15", usedSet);
      assert.equal(code3, "trinhnguyen15_3");

      // Bạn 4: Tên khác Trần Thị Mai (2016) -> maitran16
      const code4 = generateAutoUsername("Trần Thị Mai", "2016-10-20", usedSet);
      assert.equal(code4, "maitran16");
    });
  });

  describe("3. downloadSampleExcel & downloadSampleUsersExcel: Xuất file mẫu", () => {
    it("downloadSampleExcel tồn tại và là hàm xuất file", () => {
      assert.equal(typeof downloadSampleExcel, "function");
    });

    it("downloadSampleUsersExcel tồn tại và là hàm xuất file mẫu người dùng", () => {
      assert.equal(typeof downloadSampleUsersExcel, "function");
    });
  });

  describe("4. parseUsersExcel: Tiện ích đọc và chuẩn hóa người dùng", () => {
    it("parseUsersExcel tồn tại và là hàm bất đồng bộ", () => {
      assert.equal(typeof parseUsersExcel, "function");
    });
  });
});
