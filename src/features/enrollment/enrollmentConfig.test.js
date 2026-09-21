import test from "node:test";
import assert from "node:assert/strict";
import { getEnrollmentStatus, getSectorEnrollmentCTA } from "./enrollmentConfig.js";

test("getEnrollmentStatus: trả về 'upcoming' khi ngày hiện tại trước registrationStart", () => {
  const customConfig = {
    registrationStart: "2026-07-01T00:00:00+07:00",
    registrationEnd: "2026-08-31T23:59:59+07:00",
    statusOverride: null,
  };
  const beforeDate = new Date("2026-05-15T10:00:00+07:00");
  assert.equal(getEnrollmentStatus(beforeDate, customConfig), "upcoming");
});

test("getEnrollmentStatus: trả về 'open' khi ngày hiện tại nằm trong khoảng tuyển sinh", () => {
  const customConfig = {
    registrationStart: "2026-07-01T00:00:00+07:00",
    registrationEnd: "2026-08-31T23:59:59+07:00",
    statusOverride: null,
  };
  const duringDate = new Date("2026-07-20T14:30:00+07:00");
  assert.equal(getEnrollmentStatus(duringDate, customConfig), "open");
});

test("getEnrollmentStatus: trả về 'closed' khi ngày hiện tại sau registrationEnd", () => {
  const customConfig = {
    registrationStart: "2026-07-01T00:00:00+07:00",
    registrationEnd: "2026-08-31T23:59:59+07:00",
    statusOverride: null,
  };
  const afterDate = new Date("2026-09-17T21:00:00+07:00");
  assert.equal(getEnrollmentStatus(afterDate, customConfig), "closed");
});

test("getEnrollmentStatus: statusOverride được ưu tiên tuyệt đối khi được đặt", () => {
  const openOverrideConfig = {
    registrationStart: "2026-07-01T00:00:00+07:00",
    registrationEnd: "2026-08-31T23:59:59+07:00",
    statusOverride: "open",
  };
  const afterDate = new Date("2026-09-17T21:00:00+07:00");
  assert.equal(getEnrollmentStatus(afterDate, openOverrideConfig), "open");

  const closedOverrideConfig = {
    registrationStart: "2026-07-01T00:00:00+07:00",
    registrationEnd: "2026-08-31T23:59:59+07:00",
    statusOverride: "closed",
  };
  const duringDate = new Date("2026-07-20T14:30:00+07:00");
  assert.equal(getEnrollmentStatus(duringDate, closedOverrideConfig), "closed");
});

test("getSectorEnrollmentCTA: trả về link #dang-ky cho 4 khối hỗ trợ đăng ký online khi status là 'open'", () => {
  const onlineSectors = ["chien-con", "ruoc-le", "them-suc", "phung-vu"];
  for (const sectorId of onlineSectors) {
    const cta = getSectorEnrollmentCTA({ status: "open", sectorId });
    assert.equal(cta.heroLink, "/tuyển-sinh#dang-ky", `heroLink của ${sectorId} phải là #dang-ky`);
    assert.equal(cta.bannerLink, "/tuyển-sinh#dang-ky", `bannerLink của ${sectorId} phải là #dang-ky`);
    assert.equal(cta.heroText, "Đăng Ký Học Giáo Lý");
    assert.equal(cta.bannerText, "Đăng Ký Học Giáo Lý Cho Con");
  }
});

test("getSectorEnrollmentCTA: trả về link /tuyển-sinh cho 2 khối không hỗ trợ online khi status là 'open'", () => {
  const offlineSectors = ["kinh-thanh", "vao-doi"];
  for (const sectorId of offlineSectors) {
    const cta = getSectorEnrollmentCTA({ status: "open", sectorId });
    assert.equal(cta.heroLink, "/tuyển-sinh", `heroLink của ${sectorId} không được có #dang-ky`);
    assert.equal(cta.bannerLink, "/tuyển-sinh", `bannerLink của ${sectorId} không được có #dang-ky`);
    assert.equal(cta.heroText, "Xem Thông Tin Tuyển Sinh");
    assert.equal(cta.bannerText, "Xem Thông Tin Tuyển Sinh");
  }
});

test("getSectorEnrollmentCTA: trả về /tuyển-sinh cho tất cả các khối khi status là 'upcoming'", () => {
  const allSectors = ["chien-con", "ruoc-le", "them-suc", "phung-vu", "kinh-thanh", "vao-doi"];
  for (const sectorId of allSectors) {
    const cta = getSectorEnrollmentCTA({ status: "upcoming", sectorId });
    assert.equal(cta.heroLink, "/tuyển-sinh");
    assert.equal(cta.bannerLink, "/tuyển-sinh");
    assert.equal(cta.heroText, "Xem Thông Tin Tuyển Sinh");
  }
});

test("getSectorEnrollmentCTA: trả về /liên-hệ cho banner của tất cả các khối khi status là 'closed'", () => {
  const allSectors = ["chien-con", "ruoc-le", "them-suc", "phung-vu", "kinh-thanh", "vao-doi"];
  for (const sectorId of allSectors) {
    const cta = getSectorEnrollmentCTA({ status: "closed", sectorId });
    assert.equal(cta.heroLink, "/tuyển-sinh");
    assert.equal(cta.bannerLink, "/liên-hệ");
    assert.equal(cta.bannerText, "Liên Hệ Ban Giáo Lý");
  }
});

test("getSectorEnrollmentCTA: fallback an toàn khi sectorId không tồn tại hoặc status không hợp lệ", () => {
  const fallbackCTA1 = getSectorEnrollmentCTA({ status: "invalid_status", sectorId: "chien-con" });
  assert.equal(fallbackCTA1.heroLink, "/tuyển-sinh");
  assert.equal(fallbackCTA1.bannerLink, "/tuyển-sinh");

  const fallbackCTA2 = getSectorEnrollmentCTA({ status: "open", sectorId: "non_existent_sector" });
  assert.equal(fallbackCTA2.heroLink, "/tuyển-sinh");
  assert.equal(fallbackCTA2.bannerLink, "/tuyển-sinh");

  const fallbackCTA3 = getSectorEnrollmentCTA();
  assert.equal(fallbackCTA3.heroLink, "/tuyển-sinh");
  assert.equal(fallbackCTA3.bannerLink, "/tuyển-sinh");
});

