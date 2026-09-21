import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../..");
const headerPath = path.join(projectRoot, "src/components/layout/Header.jsx");
const content = fs.readFileSync(headerPath, "utf-8");

describe("Header.jsx Design Contract Tests (AGENTS.md v1.1 & Layout Safeguards)", () => {
  // ── TRỤ CỘT 1: CHUẨN HÓA 100% REM ──
  describe("Trụ cột 1: Chuẩn hóa 100% REM & Không dùng font pixel cứng", () => {
    it("Header.jsx không được chứa bất kỳ class font cứng text-[...px] nào", () => {
      const fixedFontMatches = content.match(/text-\[\d+(\.\d+)?px\]/g) || [];
      assert.deepEqual(
        fixedFontMatches,
        [],
        `Header.jsx vẫn còn chứa các class pixel cố định: ${fixedFontMatches.join(", ")}`
      );
    });

    it("Header.jsx không được chứa cỡ chữ siêu nhỏ < 0.75rem (text-[10px], text-[11px])", () => {
      assert.ok(
        !content.includes("text-[10px]"),
        "Header.jsx không được dùng text-[10px] vi phạm chuẩn chữ tối thiểu 0.75rem"
      );
      assert.ok(
        !content.includes("text-[11px]"),
        "Header.jsx không được dùng text-[11px] vi phạm chuẩn chữ tối thiểu 0.75rem"
      );
    });
  });

  // ── TRỤ CỘT 2: TÔN NGHIÊM BIỂU TƯỢNG TÔN GIÁO (AGENTS.md §8) ──
  describe("Trụ cột 2: Tôn nghiêm biểu tượng tôn giáo & Phụng vụ", () => {
    it("Logo HTDC (chứa Thánh Giá & Mình Thánh Chúa) không được có animation xoay", () => {
      assert.ok(
        !content.includes("group-hover:rotate-6"),
        "Logo HTDC không được gắn hiệu ứng group-hover:rotate-6 vi phạm AGENTS.md §8"
      );
      assert.ok(
        !/logo_htdc\.png[^>]+rotate-/.test(content),
        "Thẻ ảnh logo HTDC không được chứa bất kỳ hiệu ứng rotate nào"
      );
    });
  });

  // ── TRỤ CỘT 3: TOUCH TARGET & CHỐNG ĐÈ CHỮ MOBILE ──
  describe("Trụ cột 3: Vùng chạm tối thiểu 44px & Safe-zone chống đè chữ", () => {
    it("Nút đóng KhoiSheet và MoreMenuSheet phải đạt chuẩn 44px (w-11 h-11)", () => {
      assert.ok(
        content.includes('aria-label="Đóng bảng khối học"'),
        "Phải có aria-label cho nút đóng bảng khối học"
      );
      assert.ok(
        content.includes('aria-label="Đóng bảng tiện ích"'),
        "Phải có aria-label cho nút đóng bảng tiện ích"
      );
      // Kiểm tra có w-11 h-11 hoặc min-w-[44px]
      const closeButtons = content.match(/className="[^"]*min-w-\[44px\][^"]*"/g) || [];
      assert.ok(
        closeButtons.length >= 2,
        "Cả 2 nút đóng sheet phải có min-w-[44px] min-h-[44px]"
      );
    });

    it("Container tiêu đề KhoiSheet và nút profile phải có pr-14 để không bị nút đóng 44px đè", () => {
      assert.ok(
        content.includes("px-5 pr-14 pt-2 pb-2"),
        "KhoiSheet tiêu đề phải có pr-14 tạo khoảng an toàn cho nút đóng 44px"
      );
      assert.ok(
        content.includes("px-5 pr-14 py-4"),
        "MoreMenuSheet hàng profile/login phải có pr-14 tạo khoảng an toàn cho nút đóng 44px"
      );
    });
  });

  // ── TRỤ CỘT 4: CHỐNG TRÀN VÀ VỠ BỐ CỤC (RESPONSIVE RESILIENCE) ──
  describe("Trụ cột 4: Chống tràn & Vỡ bố cục đa màn hình", () => {
    it("Nút cài ứng dụng PWA Desktop ẩn ở breakpoint lg và chỉ hiện từ xl (hidden xl:inline-flex)", () => {
      assert.ok(
        content.includes("hidden xl:inline-flex"),
        "Nút cài ứng dụng PWA phải dùng hidden xl:inline-flex để chống tràn Navbar ở 1024px"
      );
      assert.ok(
        !content.includes("hidden lg:inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-bold text-emerald-800"),
        "Nút cài ứng dụng PWA không được dùng hidden lg:inline-flex gây chèn ép Navbar 1024px"
      );
    });

    it("BottomTabBar các nhãn tab phải có truncate max-w-full chống tràn khi tăng cỡ chữ", () => {
      const truncateMatches = content.match(/truncate max-w-full/g) || [];
      assert.ok(
        truncateMatches.length >= 3,
        "Các nhãn tab trong BottomTabBar phải có truncate max-w-full để chống rớt dòng khi zoom"
      );
    });

    it("Cụm đăng nhập MoreMenuSheet tối ưu cho màn hình 320px (line-clamp-1, truncate)", () => {
      assert.ok(
        content.includes('line-clamp-1">Đăng nhập để truy cập tài khoản</p>'),
        "Mô tả đăng nhập phải có line-clamp-1 chống bẻ vụn text trên 320px"
      );
    });
  });

  // ── TRỤ CỘT 5: BẢO TOÀN THUẬT NGỮ CÔNG GIÁO & HTDC ──
  describe("Trụ cột 5: Bảo toàn chuẩn mực phụng vụ & Phong trào HTDC", () => {
    it("Dùng đúng danh xưng Giáo lý viên và Giáo lý sinh", () => {
      assert.ok(content.includes('teacher: "Giáo lý viên"'));
      assert.ok(content.includes('student: "Giáo lý sinh"'));
      assert.ok(content.includes('desc: "Đăng ký Giáo lý sinh mới"'));
      assert.ok(!content.includes('desc: "Đăng ký học viên mới"'));
    });

    it("Dùng đúng danh xưng phong trào Hùng Tâm Dũng Chí (HTDC)", () => {
      assert.ok(content.includes("XỨ ĐOÀN MẸ MÂN CÔI"));
      assert.ok(!content.includes("TNTT"));
    });
  });
});
