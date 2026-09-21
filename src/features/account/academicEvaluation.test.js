import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { computeDiemTB, getDefaultTermRanges, buildSundayList } from "../teacher/utils.js";
import { calculateAutoHocLuc, calculateAutoHanhKiem } from "./utils.js";

describe("Tự động tính Điểm Trung Bình (ĐTB) chuẩn 5 cột điểm", () => {
  it("trả về null khi thiếu bất kỳ cột điểm nào trong 5 cột", () => {
    // Thiếu hoàn toàn
    assert.equal(computeDiemTB({}), null);
    assert.equal(computeDiemTB(null), null);

    // Chỉ có điểm quá trình, thiếu điểm thi
    assert.equal(computeDiemTB({
      diem_mieng: 8,
      diem_vo: 9,
      diem_15_phut: 7,
      diem_1_tiet: 8,
      diem_thi: null,
    }), null);

    // Có điểm thi nhưng thiếu điểm miệng
    assert.equal(computeDiemTB({
      diem_mieng: null,
      diem_vo: 9,
      diem_15_phut: 7,
      diem_1_tiet: 8,
      diem_thi: 9,
    }), null);

    // Ô điểm rỗng chuỗi ""
    assert.equal(computeDiemTB({
      diem_mieng: 8,
      diem_vo: "",
      diem_15_phut: 7,
      diem_1_tiet: 8,
      diem_thi: 9,
    }), null);
  });

  it("tính chính xác ĐTB theo trọng số khi CÓ ĐỦ CẢ 5 CỘT ĐIỂM", () => {
    // Miệng: 8 (x1), Vở: 9 (x1), 15': 7 (x1), 1T: 8 (x2), Thi: 9 (x3)
    // Tổng = 8 + 9 + 7 + 16 + 27 = 67. 67 / 8 = 8.375 -> 8.4
    const tb1 = computeDiemTB({
      diem_mieng: 8,
      diem_vo: 9,
      diem_15_phut: 7,
      diem_1_tiet: 8,
      diem_thi: 9,
    });
    assert.equal(tb1, 8.4);

    // Tất cả điểm 10 -> 10.0
    const tb2 = computeDiemTB({
      diem_mieng: 10,
      diem_vo: 10,
      diem_15_phut: 10,
      diem_1_tiet: 10,
      diem_thi: 10,
    });
    assert.equal(tb2, 10);

    // Miệng: 5, Vở: 5, 15': 5, 1T: 5, Thi: 5 -> 5.0
    const tb3 = computeDiemTB({
      diem_mieng: "5",
      diem_vo: 5,
      diem_15_phut: 5,
      diem_1_tiet: 5,
      diem_thi: 5,
    });
    assert.equal(tb3, 5);
  });
});

describe("Tự động xét Học lực theo Điểm Trung Bình", () => {
  it("trả về rỗng khi chưa có ĐTB", () => {
    assert.equal(calculateAutoHocLuc(null), "");
    assert.equal(calculateAutoHocLuc(undefined), "");
    assert.equal(calculateAutoHocLuc(""), "");
    assert.equal(calculateAutoHocLuc("—"), "");
  });

  it("xét đúng các phân loại Giỏi, Khá, Trung Bình, Yếu, Kém", () => {
    assert.equal(calculateAutoHocLuc(8.0), "Giỏi");
    assert.equal(calculateAutoHocLuc(9.5), "Giỏi");
    assert.equal(calculateAutoHocLuc(6.5), "Khá");
    assert.equal(calculateAutoHocLuc(7.9), "Khá");
    assert.equal(calculateAutoHocLuc(5.0), "Trung Bình");
    assert.equal(calculateAutoHocLuc(6.4), "Trung Bình");
    assert.equal(calculateAutoHocLuc(3.5), "Yếu");
    assert.equal(calculateAutoHocLuc(4.9), "Yếu");
    assert.equal(calculateAutoHocLuc(3.4), "Kém");
    assert.equal(calculateAutoHocLuc(1.0), "Kém");
  });
});

describe("Tự động xét Hạnh kiểm theo Chuyên cần (buổi vắng)", () => {
  it("trả về rỗng khi chưa có buổi điểm danh nào", () => {
    assert.equal(calculateAutoHanhKiem(null), "");
    assert.equal(calculateAutoHanhKiem({ tong_da_diem_danh: 0 }), "");
  });

  it("xét Hạnh kiểm 'Tốt' khi không nghỉ hoặc chỉ nghỉ 1 buổi có phép", () => {
    assert.equal(calculateAutoHanhKiem({
      tong_da_diem_danh: 10,
      nghi_khong_phep: 0,
      nghi_phep: 0,
      tong_nghi: 0,
    }), "Tốt");

    assert.equal(calculateAutoHanhKiem({
      tong_da_diem_danh: 10,
      nghi_khong_phep: 0,
      nghi_phep: 1,
      tong_nghi: 1,
    }), "Tốt");
  });

  it("xét Hạnh kiểm 'Khá' khi nghỉ tối đa 1 không phép hoặc 2 có phép", () => {
    assert.equal(calculateAutoHanhKiem({
      tong_da_diem_danh: 10,
      nghi_khong_phep: 1,
      nghi_phep: 1,
      tong_nghi: 2,
    }), "Khá");

    assert.equal(calculateAutoHanhKiem({
      tong_da_diem_danh: 10,
      nghi_khong_phep: 0,
      nghi_phep: 2,
      tong_nghi: 2,
    }), "Khá");
  });

  it("xét Hạnh kiểm 'Trung Bình' khi nghỉ 3-4 buổi hoặc 2 không phép", () => {
    assert.equal(calculateAutoHanhKiem({
      tong_da_diem_danh: 10,
      nghi_khong_phep: 2,
      nghi_phep: 1,
      tong_nghi: 3,
    }), "Trung Bình");

    assert.equal(calculateAutoHanhKiem({
      tong_da_diem_danh: 10,
      nghi_khong_phep: 0,
      nghi_phep: 4,
      tong_nghi: 4,
    }), "Trung Bình");
  });

  it("xét Hạnh kiểm 'Yếu' khi vắng nhiều (>= 3 không phép hoặc tổng nghỉ > 4)", () => {
    assert.equal(calculateAutoHanhKiem({
      tong_da_diem_danh: 10,
      nghi_khong_phep: 3,
      nghi_phep: 0,
      tong_nghi: 3,
    }), "Yếu");

    assert.equal(calculateAutoHanhKiem({
      tong_da_diem_danh: 10,
      nghi_khong_phep: 1,
      nghi_phep: 5,
      tong_nghi: 6,
    }), "Yếu");
  });
});

describe("Khung lịch Niên khóa & Sinh danh sách ngày Chúa Nhật", () => {
  it("sinh đúng 16 buổi cho HK1 và HK2 trong năm học", () => {
    const ranges = getDefaultTermRanges("2026-2027");
    assert.ok(ranges.HK1.start);
    assert.ok(ranges.HK2.start);
    assert.equal(ranges.HK1.sundays.length, 16);
    assert.equal(ranges.HK2.sundays.length, 16);
  });

  it("buildSundayList sinh danh sách ngày đúng khoảng cách 7 ngày", () => {
    const list = buildSundayList("2026-09-06", 4);
    assert.equal(list.length, 4);
    assert.equal(list[0].toISOString().slice(0, 10), "2026-09-06");
    assert.equal(list[1].toISOString().slice(0, 10), "2026-09-13");
    assert.equal(list[2].toISOString().slice(0, 10), "2026-09-20");
    assert.equal(list[3].toISOString().slice(0, 10), "2026-09-27");
  });
});

describe("Sắp xếp Lịch chuyên cần & Ngày nghỉ lễ theo đúng thứ tự thời gian", () => {
  it("luôn hiển thị ngày 06/09 (học kỳ bắt đầu) trước ngày 02/11 (nghỉ lễ Các Đẳng)", () => {
    const dates = [
      { isoDate: "2026-11-02", label: "Nghỉ lễ Các Đẳng" },
      { isoDate: "2026-09-06", label: "Khai giảng / Buổi 1" },
      { isoDate: "2026-09-13", label: "Buổi 2" },
      { isoDate: "2026-10-18", label: "Buổi 7" },
    ];

    // Sắp xếp bằng localeCompare trên chuỗi ISO YYYY-MM-DD
    dates.sort((a, b) => a.isoDate.localeCompare(b.isoDate));

    assert.equal(dates[0].isoDate, "2026-09-06");
    assert.equal(dates[1].isoDate, "2026-09-13");
    assert.equal(dates[2].isoDate, "2026-10-18");
    assert.equal(dates[3].isoDate, "2026-11-02");
  });

  it("sắp xếp chính xác các ngày nghỉ lễ HK2 (10/01 khai giảng, 15/02 nghỉ Tết, 05/04 lễ Phục Sinh)", () => {
    const hk2Sundays = buildSundayList("2027-01-10", 16);
    const holidays = [
      { ngay: "2027-02-15", ten_ngay_le: "Nghỉ Tết Nguyên Đán" },
      { ngay: "2027-04-05", ten_ngay_le: "Lễ Phục Sinh" },
    ];

    const list = hk2Sundays.map(d => ({
      isoDate: d.toISOString().slice(0, 10),
      label: "Chúa Nhật",
    }));

    // Bổ sung ngày nghỉ
    const existing = new Set(list.map(i => i.isoDate));
    holidays.forEach(h => {
      if (!existing.has(h.ngay)) {
        list.push({ isoDate: h.ngay, label: h.ten_ngay_le });
        existing.add(h.ngay);
      }
    });

    list.sort((a, b) => a.isoDate.localeCompare(b.isoDate));

    // Ngày đầu tiên luôn là khai giảng 10/01
    assert.equal(list[0].isoDate, "2027-01-10");

    // Tìm vị trí của 15/02 và 05/04
    const idxTet = list.findIndex(i => i.isoDate === "2027-02-15");
    const idxPhucSinh = list.findIndex(i => i.isoDate === "2027-04-05");

    assert.ok(idxTet > 0, "15/02 phải nằm sau 10/01");
    assert.ok(idxPhucSinh > idxTet, "05/04 phải nằm sau 15/02");
  });
});

describe("Tính toán Vị thứ (Dense Rank) cho cả lớp", () => {
  it("xếp hạng chính xác theo điểm TB từ cao xuống thấp và gán đồng hạng đúng chuẩn", () => {
    const classRows = {
      userA: { diem_mieng: 9, diem_vo: 9, diem_15_phut: 9, diem_1_tiet: 9, diem_thi: 9 }, // 9.0
      userB: { diem_mieng: 8, diem_vo: 8, diem_15_phut: 8, diem_1_tiet: 8, diem_thi: 8 }, // 8.0
      userC: { diem_mieng: 8, diem_vo: 8, diem_15_phut: 8, diem_1_tiet: 8, diem_thi: 8 }, // 8.0
      userD: { diem_mieng: 7, diem_vo: 7, diem_15_phut: 7, diem_1_tiet: 7, diem_thi: 7 }, // 7.0
      userE: { diem_mieng: 7, diem_vo: null, diem_15_phut: 7, diem_1_tiet: 7, diem_thi: 7 }, // null (thiếu điểm)
    };
    const roster = ["userA", "userB", "userC", "userD", "userE"];

    const scoresByUser = {};
    const validScores = [];
    roster.forEach(u => {
      const tb = computeDiemTB(classRows[u]);
      scoresByUser[u] = tb;
      if (tb !== null && typeof tb === "number" && !isNaN(tb)) {
        validScores.push(tb);
      }
    });

    const uniqueScores = Array.from(new Set(validScores)).sort((a, b) => b - a);

    const ranks = {};
    roster.forEach(u => {
      const tb = scoresByUser[u];
      ranks[u] = tb !== null ? uniqueScores.indexOf(tb) + 1 : null;
    });

    assert.equal(ranks.userA, 1);
    assert.equal(ranks.userB, 2);
    assert.equal(ranks.userC, 2); // Đồng hạng 2
    assert.equal(ranks.userD, 3); // Dense rank: 3
    assert.equal(ranks.userE, null); // Chưa đủ điểm -> null
  });
});

describe("Thống kê Chuyên cần: Ngày nghỉ lễ trong tương lai không tính vào 'Đã điểm danh'", () => {
  it("chỉ tính ngày nghỉ lễ đã qua vào tổng đã điểm danh, ngày nghỉ lễ tương lai để trạng thái chưa diễn ra", () => {
    const todayIso = "2026-09-18"; // Giả sử hôm nay là ngày 18/09/2026

    const timeline = [
      { isoDate: "2026-09-06", isHoliday: false, userStatus: "co_mat" }, // Đã học
      { isoDate: "2026-09-13", isHoliday: false, userStatus: "co_mat" }, // Đã học
      { isoDate: "2026-11-02", isHoliday: true, holidayName: "Lễ Các Đẳng" }, // Tương lai: Nghỉ lễ
      { isoDate: "2026-11-08", isHoliday: false }, // Tương lai: Chưa học
    ];

    const counts = { co_mat: 0, nghi_khong_phep: 0, nghi_phep: 0, nghi_le: 0, chua_cap_nhat: 0 };

    timeline.forEach(item => {
      const isPastOrToday = item.isoDate <= todayIso;
      let trang_thai = "null";
      if (item.userStatus) {
        trang_thai = item.userStatus;
      } else if (item.isHoliday && isPastOrToday) {
        trang_thai = "nghi_le";
      }

      if (trang_thai === "co_mat") counts.co_mat++;
      else if (trang_thai === "nghi_phep") counts.nghi_phep++;
      else if (trang_thai === "nghi_khong_phep") counts.nghi_khong_phep++;
      else if (trang_thai === "nghi_le") counts.nghi_le++;
      else counts.chua_cap_nhat++;
    });

    counts.tong_da_diem_danh = counts.co_mat + counts.nghi_phep + counts.nghi_khong_phep + counts.nghi_le;

    // Tổng số buổi đã điểm danh PHẢI LÀ 2 (không tính ngày 02/11 trong tương lai)
    assert.equal(counts.co_mat, 2);
    assert.equal(counts.nghi_le, 0); // Chưa qua ngày 02/11 nên nghi_le = 0
    assert.equal(counts.chua_cap_nhat, 2); // Gồm 1 buổi tương lai + 1 ngày lễ tương lai
    assert.equal(counts.tong_da_diem_danh, 2);
  });

  it("tự động ghi nhận 'nghi_le' và cộng vào 'Đã điểm danh' khi ngày nghỉ lễ ĐÃ QUA", () => {
    const todayIso = "2026-11-05"; // Giả sử hôm nay là ngày 05/11/2026 (đã qua 02/11)

    const timeline = [
      { isoDate: "2026-09-06", isHoliday: false, userStatus: "co_mat" },
      { isoDate: "2026-09-13", isHoliday: false, userStatus: "co_mat" },
      { isoDate: "2026-11-02", isHoliday: true, holidayName: "Lễ Các Đẳng" }, // ĐÃ QUA
      { isoDate: "2026-11-08", isHoliday: false }, // Tương lai
    ];

    const counts = { co_mat: 0, nghi_khong_phep: 0, nghi_phep: 0, nghi_le: 0, chua_cap_nhat: 0 };

    timeline.forEach(item => {
      const isPastOrToday = item.isoDate <= todayIso;
      let trang_thai = "null";
      if (item.userStatus) {
        trang_thai = item.userStatus;
      } else if (item.isHoliday && isPastOrToday) {
        trang_thai = "nghi_le";
      }

      if (trang_thai === "co_mat") counts.co_mat++;
      else if (trang_thai === "nghi_phep") counts.nghi_phep++;
      else if (trang_thai === "nghi_khong_phep") counts.nghi_khong_phep++;
      else if (trang_thai === "nghi_le") counts.nghi_le++;
      else counts.chua_cap_nhat++;
    });

    counts.tong_da_diem_danh = counts.co_mat + counts.nghi_phep + counts.nghi_khong_phep + counts.nghi_le;

    // Lúc này ngày 02/11 đã qua nên tong_da_diem_danh = 3 (2 có mặt + 1 nghỉ lễ)
    assert.equal(counts.co_mat, 2);
    assert.equal(counts.nghi_le, 1);
    assert.equal(counts.tong_da_diem_danh, 3);
  });
});


