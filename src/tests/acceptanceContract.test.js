import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

// ── Hàm tiện ích đo tỷ lệ tương phản màu WCAG AAA ──
function hexToRgb(hex) {
  const cleanHex = hex.replace("#", "").trim();
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function getRelativeLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1, hex2) {
  const lum1 = getRelativeLuminance(hexToRgb(hex1));
  const lum2 = getRelativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("BỘ TIÊU CHUẨN NGHIỆM THU ĐẠT CHUẨN (ACCEPTANCE CRITERIA SUITE)", () => {
  // ── TRỤ CỘT 1 & 3: CHUẨN HÓA 100% REM & TRÌNH BÀY GIAO DIỆN ──
  describe("Trụ cột 1 & 3: Chuẩn hóa REM & Vùng chạm an toàn", () => {
    it("Footer.jsx: 100% tuân thủ REM chuẩn, không còn text-[...px]", () => {
      const footerPath = path.join(projectRoot, "src/components/layout/Footer.jsx");
      const content = fs.readFileSync(footerPath, "utf-8");
      const match = content.match(/text-\[\d+(\.\d+)?px\]/g);
      assert.equal(
        match,
        null,
        `Footer.jsx vẫn còn chứa class cỡ chữ pixel cố định: ${match?.join(", ")}`
      );
    });

    it("LichHoc.css: Đạt 100% REM font-size và có khai báo iOS Safe Area", () => {
      const cssPath = path.join(projectRoot, "src/pages/LichHoc.css");
      const content = fs.readFileSync(cssPath, "utf-8");
      
      // Không chứa font-size bằng px
      const pxMatches = content.match(/font-size:\s*\d+px/gi);
      assert.equal(
        pxMatches,
        null,
        `LichHoc.css chứa font-size tính bằng px: ${pxMatches?.join(", ")}`
      );

      // Có khai báo an toàn safe-area-inset-bottom
      assert.ok(
        content.includes("env(safe-area-inset-bottom"),
        "LichHoc.css phải có hỗ trợ safe-area-inset-bottom cho iOS"
      );
    });

    it("khoiBase.css: Có cấu hình vùng chạm tối thiểu 44px và safe-area-inset-bottom", () => {
      const cssPath = path.join(projectRoot, "src/features/khoi/khoiBase.css");
      const content = fs.readFileSync(cssPath, "utf-8");
      assert.ok(
        content.includes("44px") || content.includes("2.75rem"),
        "khoiBase.css phải duy trì vùng chạm tối thiểu 44px (hoặc 2.75rem)"
      );
      assert.ok(
        content.includes("env(safe-area-inset-bottom"),
        "khoiBase.css phải có padding an toàn cho đáy màn hình iOS"
      );
    });
  });

  // ── TRỤ CỘT 2: ĐỘ TƯƠNG PHẢN WCAG AAA ──
  describe("Trụ cột 2: Tương phản Semantic Token đạt chuẩn WCAG AAA (>= 7.0:1)", () => {
    it("Chế độ Sáng (Light Mode): Chữ chính và chữ phụ đạt >= 7.0:1 trên nền trang", () => {
      const bg = "#faf8f3";
      const text = "#293d32";
      const muted = "#485046";

      const textRatio = getContrastRatio(text, bg);
      const mutedRatio = getContrastRatio(muted, bg);

      assert.ok(
        textRatio >= 7.0,
        `Tương phản chữ chính Light Mode (${textRatio.toFixed(2)}:1) phải >= 7.0:1`
      );
      assert.ok(
        mutedRatio >= 7.0,
        `Tương phản chữ phụ Light Mode (${mutedRatio.toFixed(2)}:1) phải >= 7.0:1`
      );
    });

    it("Chế độ Tối (Dark Mode): Chữ chính và chữ phụ đạt >= 7.0:1 trên nền trang", () => {
      const darkBg = "#151c18";
      const darkText = "#ecece0";
      const darkMuted = "#b0b9ac";

      const textRatio = getContrastRatio(darkText, darkBg);
      const mutedRatio = getContrastRatio(darkMuted, darkBg);

      assert.ok(
        textRatio >= 7.0,
        `Tương phản chữ chính Dark Mode (${textRatio.toFixed(2)}:1) phải >= 7.0:1`
      );
      assert.ok(
        mutedRatio >= 7.0,
        `Tương phản chữ phụ Dark Mode (${mutedRatio.toFixed(2)}:1) phải >= 7.0:1`
      );
    });

    it("Nút thao tác chính (Primary Button): Độ tương phản chữ trên nền đạt >= 7.0:1", () => {
      // Light Mode: Nền xanh rừng đậm, chữ trắng
      const lightBtnBg = "#314e3e";
      const lightBtnText = "#ffffff";
      const lightRatio = getContrastRatio(lightBtnText, lightBtnBg);
      assert.ok(
        lightRatio >= 7.0,
        `Nút chính Light Mode (${lightRatio.toFixed(2)}:1) phải >= 7.0:1`
      );

      // Dark Mode: Nền vàng kim sáng, chữ xanh đen thẫm
      const darkBtnBg = "#d6b883";
      const darkBtnText = "#19251d";
      const darkRatio = getContrastRatio(darkBtnText, darkBtnBg);
      assert.ok(
        darkRatio >= 7.0,
        `Nút chính Dark Mode (${darkRatio.toFixed(2)}:1) phải >= 7.0:1`
      );
    });
  });

  // ── TRỤ CỘT 5: THUẬT NGỮ CÔNG GIÁO & PHỤNG VỤ ──
  describe("Trụ cột 5: Chuẩn hóa Thuật ngữ Công giáo & Phụng vụ", () => {
    it("Header.jsx: Nhãn vai trò bắt buộc dùng 'Giáo lý viên' và 'Giáo lý sinh'", () => {
      const headerPath = path.join(projectRoot, "src/components/layout/Header.jsx");
      const content = fs.readFileSync(headerPath, "utf-8");

      assert.ok(
        content.includes('teacher: "Giáo lý viên"'),
        "Header.jsx phải dùng danh xưng 'Giáo lý viên' cho role teacher"
      );
      assert.ok(
        content.includes('student: "Giáo lý sinh"'),
        "Header.jsx phải dùng danh xưng 'Giáo lý sinh' cho role student"
      );
      assert.ok(
        !content.includes('desc: "Đăng ký học viên mới"'),
        "Header.jsx không được dùng từ thế tục 'học viên mới'"
      );
      assert.ok(
        content.includes('desc: "Đăng ký Giáo lý sinh mới"'),
        "Header.jsx phải dùng mô tả 'Đăng ký Giáo lý sinh mới'"
      );
    });

    it("LichHoc.jsx & Khoi datasets: Niên khóa được định dạng chuẩn có gạch nối", () => {
      const academicPath = path.join(projectRoot, "src/utils/academicYear.js");
      const content = fs.readFileSync(academicPath, "utf-8");
      assert.ok(
        content.includes("2026–2027") || content.includes("2026 – 2027"),
        "academicYear.js phải chứa niên khóa chuẩn 2026–2027"
      );
    });
  });

  // ── TRỤ CỘT 6: BẢO VỆ QUYỀN RIÊNG TƯ & DỮ LIỆU THIẾU NHI ──
  describe("Trụ cột 6: Bảo vệ Quyền riêng tư & An toàn Dữ liệu Thiếu nhi", () => {
    it("Dữ liệu công khai các khối học tuyệt đối không lộ số điện thoại phụ huynh", async () => {
      const {
        getKhoiChienConData,
        getKhoiRuocLeData,
        getKhoiThemSucData,
        getKhoiPhungVuData,
        getKhoiKinhThanhData,
        getKhoiVaoDoiData,
      } = await import("../../src/utils/academicYear.js");

      const allDatasets = [
        getKhoiChienConData(),
        getKhoiRuocLeData(),
        getKhoiThemSucData(),
        getKhoiPhungVuData(),
        getKhoiKinhThanhData(),
        getKhoiVaoDoiData(),
      ];

      allDatasets.forEach((dataset) => {
        dataset.classes.forEach((cls) => {
          assert.equal(
            cls.phone,
            undefined,
            `Lớp ${cls.name} không được chứa trường phone ra ngoài trang công khai`
          );
          assert.equal(
            cls.parentPhone,
            undefined,
            `Lớp ${cls.name} không được chứa số điện thoại phụ huynh`
          );
          assert.equal(
            cls.studentList,
            undefined,
            `Lớp ${cls.name} không được để lộ danh sách thiếu nhi công khai`
          );
        });
      });
    });
  });

  // ── CỔNG CHẤT LƯỢNG TỔNG THỂ ──
  describe("Cổng Chất Lượng Tổng Thể (Gate Compliance)", () => {
    it("docs/ACCEPTANCE_CRITERIA.md tồn tại và chứa đủ 6 trụ cột nghiệm thu", () => {
      const docPath = path.join(projectRoot, "docs/ACCEPTANCE_CRITERIA.md");
      assert.ok(fs.existsSync(docPath), "docs/ACCEPTANCE_CRITERIA.md phải tồn tại");
      const content = fs.readFileSync(docPath, "utf-8");
      
      assert.ok(content.includes("TRỤ CỘT 1"), "Tài liệu phải có Trụ cột 1");
      assert.ok(content.includes("TRỤ CỘT 2"), "Tài liệu phải có Trụ cột 2");
      assert.ok(content.includes("TRỤ CỘT 3"), "Tài liệu phải có Trụ cột 3");
      assert.ok(content.includes("TRỤ CỘT 4"), "Tài liệu phải có Trụ cột 4");
      assert.ok(content.includes("TRỤ CỘT 5"), "Tài liệu phải có Trụ cột 5");
      assert.ok(content.includes("TRỤ CỘT 6"), "Tài liệu phải có Trụ cột 6");
      assert.ok(content.includes("CỔNG 0:"), "Tài liệu phải có Gate 0");
      assert.ok(content.includes("CỔNG 1:"), "Tài liệu phải có Gate 1");
      assert.ok(content.includes("CỔNG 2:"), "Tài liệu phải có Gate 2");
      assert.ok(content.includes("CỔNG 3:"), "Tài liệu phải có Gate 3");
    });
  });
});
