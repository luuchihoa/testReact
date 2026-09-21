import { test } from "node:test";
import assert from "node:assert/strict";
import {
  sanitizeSearchTerm,
  parseSearchParams,
  serializeSearchParams,
  mergeArticles,
  getFeaturedAndRemaining,
  formatPublishedDate,
  getNextCursor,
} from "./articleListState.js";

test("sanitizeSearchTerm: xử lý an toàn từ khóa tìm kiếm", () => {
  // 1. Chuỗi thông thường
  assert.equal(sanitizeSearchTerm("Thánh lễ Chúa Nhật"), "Thánh lễ Chúa Nhật");
  assert.equal(sanitizeSearchTerm("  Giáo lý 2026   "), "Giáo lý 2026");

  // 2. Ký tự đặc biệt PostgREST
  assert.equal(sanitizeSearchTerm("title,ilike.%admin%"), "title ilike. admin");
  assert.equal(sanitizeSearchTerm("test_user' OR (1=1)"), "test user OR 1=1");

  // 3. Giới hạn độ dài 100 ký tự
  const longText = "a".repeat(150);
  assert.equal(sanitizeSearchTerm(longText).length, 100);

  // 4. Input không hợp lệ
  assert.equal(sanitizeSearchTerm(null), "");
  assert.equal(sanitizeSearchTerm(undefined), "");
  assert.equal(sanitizeSearchTerm(123), "");
});

test("parseSearchParams: phân tích search params và chuẩn hóa", () => {
  // 1. Đầy đủ query và category
  const p1 = new URLSearchParams("q=suy%20ni%E1%BB%87m&category=Ph%E1%BB%A5ng%20v%E1%BB%A5");
  assert.deepEqual(parseSearchParams(p1), {
    query: "suy niệm",
    category: "Phụng vụ",
  });

  // 2. Không có params
  assert.deepEqual(parseSearchParams(new URLSearchParams("")), {
    query: "",
    category: "Tất cả",
  });

  // 3. Category là Tất cả
  const p3 = new URLSearchParams("category=T%E1%BA%A5t%20c%E1%BA%A3");
  assert.deepEqual(parseSearchParams(p3), {
    query: "",
    category: "Tất cả",
  });

  // 4. Nhận chuỗi URL trực tiếp
  assert.deepEqual(parseSearchParams("?q=thanh-the&category=H%E1%BB%8Dc-h%E1%BB%8Fi"), {
    query: "thanh-the",
    category: "Học-hỏi",
  });
});

test("serializeSearchParams: tạo URL params sạch", () => {
  // 1. Có query và category cụ thể
  const s1 = serializeSearchParams({ query: "Thánh ca", category: "Phụng vụ" });
  assert.equal(s1.get("q"), "Thánh ca");
  assert.equal(s1.get("category"), "Phụng vụ");

  // 2. Query rỗng và category 'Tất cả' -> URL không chứa param thừa
  const s2 = serializeSearchParams({ query: "", category: "Tất cả" });
  assert.equal(s2.toString(), "");

  // 3. Chỉ có query
  const s3 = serializeSearchParams({ query: "Giáo phận", category: "Tất cả" });
  assert.equal(s3.toString(), "q=Gi%C3%A1o+ph%E1%BA%ADn");

  // 4. Chỉ có category
  const s4 = serializeSearchParams({ query: "", category: "Tin tức" });
  assert.equal(s4.toString(), "category=Tin+t%E1%BB%A9c");
});

test("mergeArticles: khử trùng lặp và sắp xếp ổn định", () => {
  const existing = [
    { id: "art-1", published_at: "2026-09-10T10:00:00Z", title: "Bài 1" },
    { id: "art-2", published_at: "2026-09-08T10:00:00Z", title: "Bài 2" },
  ];

  const incoming = [
    { id: "art-3", published_at: "2026-09-12T10:00:00Z", title: "Bài 3 mới nhất" },
    { id: "art-2", published_at: "2026-09-08T10:00:00Z", title: "Bài 2 đã update" }, // Trùng ID
  ];

  const merged = mergeArticles(existing, incoming);

  assert.equal(merged.length, 3);
  assert.equal(merged[0].id, "art-3"); // 12/09 mới nhất
  assert.equal(merged[1].id, "art-1"); // 10/09
  assert.equal(merged[2].id, "art-2"); // 08/09
  assert.equal(merged[2].title, "Bài 2 đã update"); // Cập nhật nội dung mới

  // Trường hợp published_at trùng nhau -> sắp xếp theo id DESC
  const sameDate = [
    { id: "aaa", published_at: "2026-09-01T00:00:00Z" },
    { id: "zzz", published_at: "2026-09-01T00:00:00Z" },
  ];
  const mergedSame = mergeArticles([], sameDate);
  assert.equal(mergedSame[0].id, "zzz");
  assert.equal(mergedSame[1].id, "aaa");
});

test("getFeaturedAndRemaining: phân cấp Bài mới nhất và Các bài viết khác", () => {
  const articles = [
    { id: "lead", title: "Bài đầu tiên" },
    { id: "item-1", title: "Bài 1" },
    { id: "item-2", title: "Bài 2" },
  ];

  // 1. Không lọc (mặc định) -> Lead card tách biệt, còn lại 2 bài
  const resDefault = getFeaturedAndRemaining(articles, false);
  assert.equal(resDefault.featured.id, "lead");
  assert.equal(resDefault.remaining.length, 2);
  assert.equal(resDefault.remaining[0].id, "item-1");
  assert.equal(resDefault.remaining[1].id, "item-2");

  // 2. Đang lọc (Search hoặc Category) -> Không có Lead card, toàn bộ hiển thị trong grid
  const resFiltered = getFeaturedAndRemaining(articles, true);
  assert.equal(resFiltered.featured, null);
  assert.equal(resFiltered.remaining.length, 3);

  // 3. Danh sách rỗng
  const resEmpty = getFeaturedAndRemaining([], false);
  assert.equal(resEmpty.featured, null);
  assert.deepEqual(resEmpty.remaining, []);

  // 4. Chỉ có 1 bài và không lọc
  const resSingle = getFeaturedAndRemaining([{ id: "single" }], false);
  assert.equal(resSingle.featured.id, "single");
  assert.deepEqual(resSingle.remaining, []);
});

test("formatPublishedDate: định dạng ngày đăng chuẩn tiếng Việt", () => {
  assert.equal(formatPublishedDate("2026-09-17T08:30:00Z"), "17/09/2026");
  assert.equal(formatPublishedDate(null), "Chưa rõ ngày đăng");
  assert.equal(formatPublishedDate("invalid-date-string"), "Chưa rõ ngày đăng");
});

test("getNextCursor: lấy cursor chính xác từ phần tử cuối danh sách", () => {
  assert.equal(getNextCursor([]), null);
  assert.equal(getNextCursor(null), null);

  const list = [
    { id: "1", published_at: "2026-09-15T00:00:00Z" },
    { id: "2", published_at: "2026-09-10T00:00:00Z" },
  ];
  assert.deepEqual(getNextCursor(list), {
    published_at: "2026-09-10T00:00:00Z",
    id: "2",
  });
});
