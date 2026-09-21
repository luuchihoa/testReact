import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatDateVi,
  formatRelativeTimeVi,
  isAging,
  formatAgingDays,
  getAuthorDisplayName,
  getArticleStatusMeta,
  getArticleTimestampMeta,
  validateModerationReason,
  sortBySubmittedAt,
} from "./format.js";

test("formatDateVi: định dạng ngày giờ chuẩn tiếng Việt và xử lý ngày không hợp lệ", () => {
  assert.equal(formatDateVi(null), "");
  assert.equal(formatDateVi("invalid-date-string"), "");

  const dateStr = "2026-09-17T08:30:00Z";
  const formatted = formatDateVi(dateStr);
  assert.ok(formatted.includes("2026"));
  assert.ok(formatted.includes("09") || formatted.includes("9"));
});

test("formatRelativeTimeVi: tính chính xác các mốc thời gian tương đối", () => {
  const baseTime = new Date("2026-09-17T12:00:00Z");

  // Vừa xong (< 1 phút)
  const justNow = new Date("2026-09-17T11:59:30Z").toISOString();
  assert.equal(formatRelativeTimeVi(justNow, baseTime), "Vừa xong");

  // Phút trước
  const tenMinsAgo = new Date("2026-09-17T11:50:00Z").toISOString();
  assert.equal(formatRelativeTimeVi(tenMinsAgo, baseTime), "10 phút trước");

  // Giờ trước
  const twoHoursAgo = new Date("2026-09-17T10:00:00Z").toISOString();
  assert.equal(formatRelativeTimeVi(twoHoursAgo, baseTime), "2 giờ trước");

  // Hôm qua (1 ngày trước)
  const yesterday = new Date("2026-09-16T10:00:00Z").toISOString();
  assert.equal(formatRelativeTimeVi(yesterday, baseTime), "Hôm qua");

  // Nhiều ngày trước (< 7 ngày)
  const threeDaysAgo = new Date("2026-09-14T10:00:00Z").toISOString();
  assert.equal(formatRelativeTimeVi(threeDaysAgo, baseTime), "3 ngày trước");

  // Trên 7 ngày -> fallback sang formatDateVi
  const eightDaysAgo = new Date("2026-09-09T10:00:00Z").toISOString();
  assert.ok(formatRelativeTimeVi(eightDaysAgo, baseTime).includes("2026"));
});

test("isAging và formatAgingDays: phát hiện và hiển thị nhãn chờ trung tính", () => {
  const baseTime = new Date("2026-09-17T12:00:00Z");

  // 2 ngày trước -> chưa aging
  const twoDaysAgo = new Date("2026-09-15T12:00:00Z").toISOString();
  assert.equal(isAging(twoDaysAgo, 3, baseTime), false);
  assert.equal(formatAgingDays(twoDaysAgo, baseTime), "Đã chờ 2 ngày");

  // Đúng 3 ngày trước (72h) -> aging = true
  const exactThreeDays = new Date("2026-09-14T12:00:00Z").toISOString();
  assert.equal(isAging(exactThreeDays, 3, baseTime), true);
  assert.equal(formatAgingDays(exactThreeDays, baseTime), "Đã chờ 3 ngày");

  // Cùng ngày -> "Hôm nay"
  const today = new Date("2026-09-17T06:00:00Z").toISOString();
  assert.equal(formatAgingDays(today, baseTime), "Hôm nay");
});

test("getAuthorDisplayName: xử lý các trường hợp tên tác giả", () => {
  assert.equal(
    getAuthorDisplayName({ ten_thanh: "Giuse", ho_va_ten: "Nguyễn Văn A", username: "nva" }),
    "Giuse Nguyễn Văn A"
  );
  assert.equal(
    getAuthorDisplayName({ ten_thanh: "", ho_va_ten: "Trần Thị B", username: "ttb" }),
    "Trần Thị B"
  );
  assert.equal(
    getAuthorDisplayName({ ten_thanh: "Maria", ho_va_ten: "", username: "maria" }),
    "Maria"
  );
  assert.equal(
    getAuthorDisplayName({ ten_thanh: null, ho_va_ten: null, username: "user123" }),
    "user123"
  );
  assert.equal(getAuthorDisplayName(null, "tac_gia_fallback"), "tac_gia_fallback");
});

test("getArticleStatusMeta: trả về đúng label và class cho 4 trạng thái", () => {
  assert.equal(getArticleStatusMeta("pending").label, "Chờ duyệt");
  assert.equal(getArticleStatusMeta("published").label, "Đã xuất bản");
  assert.equal(getArticleStatusMeta("rejected").label, "Bị từ chối");
  assert.equal(getArticleStatusMeta("unpublished").label, "Đã gỡ");
  assert.equal(getArticleStatusMeta("other").label, "Không xác định");
});

test("getArticleTimestampMeta: lấy đúng trường ngày và nhãn cho từng trạng thái", () => {
  const pendingArticle = {
    status: "pending",
    submitted_at: "2026-09-15T10:00:00Z",
  };
  const pendingMeta = getArticleTimestampMeta(pendingArticle);
  assert.equal(pendingMeta.label, "Gửi lúc");
  assert.equal(pendingMeta.dateStr, "2026-09-15T10:00:00Z");

  const publishedArticle = {
    status: "published",
    published_at: "2026-09-16T08:00:00Z",
  };
  const publishedMeta = getArticleTimestampMeta(publishedArticle);
  assert.equal(publishedMeta.label, "Đăng lúc");
  assert.equal(publishedMeta.dateStr, "2026-09-16T08:00:00Z");

  const rejectedArticle = {
    status: "rejected",
    reviewed_at: "2026-09-16T09:00:00Z",
  };
  const rejectedMeta = getArticleTimestampMeta(rejectedArticle);
  assert.equal(rejectedMeta.label, "Từ chối lúc");
  assert.equal(rejectedMeta.dateStr, "2026-09-16T09:00:00Z");

  const unpublishedArticle = {
    status: "unpublished",
    unpublished_at: "2026-09-17T02:00:00Z",
  };
  const unpublishedMeta = getArticleTimestampMeta(unpublishedArticle);
  assert.equal(unpublishedMeta.label, "Gỡ lúc");
  assert.equal(unpublishedMeta.dateStr, "2026-09-17T02:00:00Z");
});

test("validateModerationReason: kiểm tra lý do kiểm duyệt hợp lệ", () => {
  // Rỗng hoặc chỉ khoảng trắng
  const emptyRes = validateModerationReason("   ");
  assert.equal(emptyRes.valid, false);
  assert.ok(emptyRes.error);

  // Quá ngắn (< 5 ký tự)
  const shortRes = validateModerationReason("abc");
  assert.equal(shortRes.valid, false);
  assert.ok(shortRes.error.includes("5 ký tự"));

  // Hợp lệ
  const validRes = validateModerationReason("Nội dung chưa phù hợp quy định");
  assert.equal(validRes.valid, true);
  assert.equal(validRes.error, null);
  assert.equal(validRes.trimmed, "Nội dung chưa phù hợp quy định");
});

test("sortBySubmittedAt: sắp xếp đúng theo thứ tự asc và desc", () => {
  const list = [
    { id: "2", submitted_at: "2026-09-15T10:00:00Z" },
    { id: "1", submitted_at: "2026-09-14T10:00:00Z" },
    { id: "3", submitted_at: "2026-09-16T10:00:00Z" },
  ];

  const asc = sortBySubmittedAt(list, "asc");
  assert.deepEqual(
    asc.map((a) => a.id),
    ["1", "2", "3"]
  );

  const desc = sortBySubmittedAt(list, "desc");
  assert.deepEqual(
    desc.map((a) => a.id),
    ["3", "2", "1"]
  );
});
