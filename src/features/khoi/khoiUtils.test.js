import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getRoomLocation, formatTeacherName, formatShiftName, getSectorTimeline } from "./khoiUtils.js";

describe("khoiUtils - getRoomLocation", () => {
  it("nhận diện đúng các phòng Tầng Trệt (P1 - P5) từ ROOMS_DIRECTORY và không khớp nhầm P10 - P13", () => {
    assert.strictEqual(getRoomLocation("P1"), "P1 · Dãy Tầng Trệt");
    assert.strictEqual(getRoomLocation("Phòng P1"), "Phòng P1 · Dãy Tầng Trệt");
    assert.strictEqual(getRoomLocation("P2"), "P2 · Dãy Tầng Trệt");
    assert.strictEqual(getRoomLocation("Phòng P3"), "Phòng P3 · Dãy Tầng Trệt");
    assert.strictEqual(getRoomLocation("P4"), "P4 · Dãy Tầng Trệt");
    assert.strictEqual(getRoomLocation("P5"), "P5 · Dãy Tầng Trệt");
  });

  it("nhận diện đúng các phòng Dãy Lầu (P7 - P13) từ ROOMS_DIRECTORY", () => {
    assert.strictEqual(getRoomLocation("P7"), "P7 · Dãy Lầu (Tầng 2)");
    assert.strictEqual(getRoomLocation("Phòng P8"), "Phòng P8 · Dãy Lầu (Tầng 2)");
    assert.strictEqual(getRoomLocation("P9"), "P9 · Dãy Lầu (Tầng 2)");
    assert.strictEqual(getRoomLocation("P10"), "P10 · Dãy Lầu (Tầng 2)");
    assert.strictEqual(getRoomLocation("Phòng P11"), "Phòng P11 · Dãy Lầu (Tầng 2)");
    assert.strictEqual(getRoomLocation("P12"), "P12 · Dãy Lầu (Tầng 2)");
    assert.strictEqual(getRoomLocation("Phòng P13"), "Phòng P13 · Dãy Lầu (Tầng 2)");
  });

  it("nhận diện đúng các phòng sinh hoạt đặc biệt từ ROOMS_DIRECTORY", () => {
    assert.strictEqual(getRoomLocation("Nhà họp xứ"), "Nhà Họp Xứ · Khu Mục Vụ");
    assert.strictEqual(getRoomLocation("Nhà hầm"), "Nhà Hầm · Khu Thánh Đường");
    assert.strictEqual(getRoomLocation("Nhà thờ bên nữ"), "Nhà Thờ (Bên Nữ) · Thánh Đường");
  });

  it("trả về chuỗi rỗng khi đầu vào không hợp lệ", () => {
    assert.strictEqual(getRoomLocation(""), "");
    assert.strictEqual(getRoomLocation(null), "");
    assert.strictEqual(getRoomLocation(undefined), "");
  });
});

describe("khoiUtils - formatTeacherName", () => {
  it("chuẩn hóa danh xưng Giáo Lý Viên", () => {
    assert.strictEqual(formatTeacherName("C.Vy"), "Chị Vy");
    assert.strictEqual(formatTeacherName("A.Minh"), "Anh Minh");
    assert.strictEqual(formatTeacherName("Sr.Danh"), "Sr. Danh");
    assert.strictEqual(formatTeacherName("B.Ngọc"), "B. Ngọc");
    assert.strictEqual(formatTeacherName("Thầy Giuse"), "Thầy Giuse");
  });
});

describe("khoiUtils - formatShiftName", () => {
  it("trích xuất chính xác nhãn Ca 1 và Ca 2 mà không bị cắt thành 'Ca'", () => {
    assert.strictEqual(formatShiftName("Ca 2 (Sau Thánh Lễ 08h00)"), "Ca 2");
    assert.strictEqual(formatShiftName("Ca 1 (Trước Thánh Lễ 08h00)"), "Ca 1");
    assert.strictEqual(formatShiftName("Ca 2"), "Ca 2");
    assert.strictEqual(formatShiftName("Ca 1"), "Ca 1");
    assert.strictEqual(formatShiftName(null), "Ca 2");
    assert.strictEqual(formatShiftName(""), "Ca 2");
  });
});

describe("khoiUtils - getSectorTimeline", () => {
  it("biên soạn timeline Ca 2 chính xác từ CENTRAL_MASS và CA_HOC", () => {
    const mockClasses = [
      { time: "09:15 – 10:00", ca: "Ca 2 (Sau Thánh Lễ 08h00)", room: "Phòng P4" },
      { time: "09:15 – 10:00", ca: "Ca 2 (Sau Thánh Lễ 08h00)", room: "Phòng P3" },
      { time: "09:15 – 10:00", ca: "Ca 2 (Sau Thánh Lễ 08h00)", room: "Phòng P8" },
      { time: "09:15 – 10:00", ca: "Ca 2 (Sau Thánh Lễ 08h00)", room: "Phòng P7" },
      { time: "09:15 – 10:00", ca: "Ca 2 (Sau Thánh Lễ 08h00)", room: "Phòng P5" },
    ];
    const timeline = getSectorTimeline({ nganh: "Ngành Ấu" }, mockClasses);

    assert.strictEqual(timeline.shiftName, "Ca 2");
    assert.strictEqual(timeline.massTime, "08:00 – 09:00");
    assert.strictEqual(timeline.classTime, "09:15 – 10:00");
    assert.strictEqual(timeline.steps.length, 4);
    assert.strictEqual(timeline.steps[0].time, "07:45");
    assert.strictEqual(timeline.steps[1].time, "08:00 – 09:00");
    assert.strictEqual(timeline.steps[2].time, "09:15 – 10:00");
    assert.strictEqual(timeline.steps[3].time, "10:00");
    assert.match(timeline.steps[2].sub, /P4, P3, P8, P7, P5/);
  });

  it("biên soạn timeline Ca 1 chính xác cho các khối học trước lễ", () => {
    const mockClassesCa1 = [
      { time: "07:00 – 07:45", ca: "Ca 1 (Trước Thánh Lễ 08h00)", room: "Phòng P10" },
    ];
    const timeline = getSectorTimeline({ nganh: "Ngành Nhiệt Quang" }, mockClassesCa1);

    assert.strictEqual(timeline.shiftName, "Ca 1");
    assert.strictEqual(timeline.steps[0].time, "06:45");
    assert.strictEqual(timeline.steps[1].time, "07:00 – 07:45");
    assert.strictEqual(timeline.steps[2].time, "08:00 – 09:00");
    assert.strictEqual(timeline.steps[3].time, "09:00");
  });
});

describe("khoiDatasets - Cố định Niên khóa Dataset Lớp 2026–2027", () => {
  it("getKhoiThemSucData: cố định đúng niên khóa 2026–2027, 6 lớp học và độ tuổi 10–11", async () => {
    const { getKhoiThemSucData } = await import("../../utils/academicYear.js");
    const data = getKhoiThemSucData();
    assert.strictEqual(data.academicYear, "2026–2027");
    assert.strictEqual(data.startYear, 2026);
    assert.strictEqual(data.themSuc1BirthYear, 2016);
    assert.strictEqual(data.themSuc2BirthYear, 2015);
    assert.strictEqual(data.classes.length, 6);

    const ts1 = data.classes.filter(c => c.group === "Thêm Sức 1");
    const ts2 = data.classes.filter(c => c.group === "Thêm Sức 2");
    assert.strictEqual(ts1.length, 3);
    assert.strictEqual(ts2.length, 3);
  });

  it("getKhoiChienConData: cố định đúng niên khóa 2026–2027, 5 lớp học và độ tuổi 5–7", async () => {
    const { getKhoiChienConData } = await import("../../utils/academicYear.js");
    const data = getKhoiChienConData();
    assert.strictEqual(data.academicYear, "2026–2027");
    assert.strictEqual(data.startYear, 2026);
    assert.strictEqual(data.vuonTreBirthYear, 2021);
    assert.strictEqual(data.khaiTam1BirthYear, 2020);
    assert.strictEqual(data.khaiTam2BirthYear, 2019);
    assert.strictEqual(data.classes.length, 5);
  });

  it("getKhoiRuocLeData: cố định đúng niên khóa 2026–2027, 5 lớp học và độ tuổi 8–9", async () => {
    const { getKhoiRuocLeData } = await import("../../utils/academicYear.js");
    const data = getKhoiRuocLeData();
    assert.strictEqual(data.academicYear, "2026–2027");
    assert.strictEqual(data.startYear, 2026);
    assert.strictEqual(data.ruocLe1BirthYear, 2018);
    assert.strictEqual(data.ruocLe2BirthYear, 2017);
    assert.strictEqual(data.classes.length, 5);
  });

  it("getKhoiPhungVuData: cố định đúng niên khóa 2026–2027, 3 lớp học và 12 tuổi (2014)", async () => {
    const { getKhoiPhungVuData } = await import("../../utils/academicYear.js");
    const data = getKhoiPhungVuData();
    assert.strictEqual(data.academicYear, "2026–2027");
    assert.strictEqual(data.startYear, 2026);
    assert.strictEqual(data.phungVuBirthYear, 2014);
    assert.strictEqual(data.classes.length, 3);
    assert.strictEqual(data.classes.every(c => c.age === 12), true);
  });

  it("getKhoiKinhThanhData: cố định đúng niên khóa 2026–2027, 6 lớp học và độ tuổi 13–14 (2012–2013)", async () => {
    const { getKhoiKinhThanhData } = await import("../../utils/academicYear.js");
    const data = getKhoiKinhThanhData();
    assert.strictEqual(data.academicYear, "2026–2027");
    assert.strictEqual(data.startYear, 2026);
    assert.strictEqual(data.kinhThanh1BirthYear, 2013);
    assert.strictEqual(data.kinhThanh2BirthYear, 2012);
    assert.strictEqual(data.classes.length, 6);
    const kt1 = data.classes.filter(c => c.group === "Kinh Thánh 1");
    const kt2 = data.classes.filter(c => c.group === "Kinh Thánh 2");
    assert.strictEqual(kt1.length, 3);
    assert.strictEqual(kt2.length, 3);
  });

  it("getKhoiVaoDoiData: cố định đúng niên khóa 2026–2027, 5 lớp học và độ tuổi 15–16 (2010–2011)", async () => {
    const { getKhoiVaoDoiData } = await import("../../utils/academicYear.js");
    const data = getKhoiVaoDoiData();
    assert.strictEqual(data.academicYear, "2026–2027");
    assert.strictEqual(data.startYear, 2026);
    assert.strictEqual(data.vaoDoi1BirthYear, 2011);
    assert.strictEqual(data.vaoDoi2BirthYear, 2010);
    assert.strictEqual(data.classes.length, 5);
    const vd1 = data.classes.filter(c => c.group === "Vào Đời 1");
    const vd2 = data.classes.filter(c => c.group === "Vào Đời 2");
    assert.strictEqual(vd1.length, 3);
    assert.strictEqual(vd2.length, 2);
  });
});

describe("khoiConfig - getKhoiConfig", () => {
  it("trả về đúng metadata ngành, độ tuổi và theme cho từng khối", async () => {
    const { getKhoiConfig } = await import("./khoiConfig.js");
    
    const tsConfig = getKhoiConfig("them-suc");
    assert.strictEqual(tsConfig.id, "them-suc");
    assert.strictEqual(tsConfig.nganh, "Khối Thêm Sức");
    assert.strictEqual(tsConfig.themeClass, "theme-them-suc");
    assert.strictEqual(tsConfig.ageText, "10 – 11 tuổi");

    const ccConfig = getKhoiConfig("chien-con");
    assert.strictEqual(ccConfig.id, "chien-con");
    assert.strictEqual(ccConfig.nganh, "Khối Khai Tâm");
    assert.strictEqual(ccConfig.themeClass, "theme-chien-con");
    assert.strictEqual(ccConfig.ageText, "5 – 7 tuổi");

    const rlConfig = getKhoiConfig("ruoc-le");
    assert.strictEqual(rlConfig.id, "ruoc-le");
    assert.strictEqual(rlConfig.nganh, "Khối Rước Lễ");
    assert.strictEqual(rlConfig.themeClass, "theme-ruoc-le");
    assert.strictEqual(rlConfig.ageText, "8 – 9 tuổi");

    const pvConfig = getKhoiConfig("phung-vu");
    assert.strictEqual(pvConfig.id, "phung-vu");
    assert.strictEqual(pvConfig.nganh, "Khối Phụng Vụ");
    assert.strictEqual(pvConfig.themeClass, "theme-phung-vu");
    assert.strictEqual(pvConfig.ageText, "12 tuổi");

    const ktConfig = getKhoiConfig("kinh-thanh");
    assert.strictEqual(ktConfig.id, "kinh-thanh");
    assert.strictEqual(ktConfig.nganh, "Khối Kinh Thánh");
    assert.strictEqual(ktConfig.themeClass, "theme-kinh-thanh");
    assert.strictEqual(ktConfig.ageText, "13 – 14 tuổi");

    const vdConfig = getKhoiConfig("vao-doi");
    assert.strictEqual(vdConfig.id, "vao-doi");
    assert.strictEqual(vdConfig.nganh, "Khối Vào Đời");
    assert.strictEqual(vdConfig.themeClass, "theme-vao-doi");
    assert.match(vdConfig.ageText, /15 – 16/);
  });
});

