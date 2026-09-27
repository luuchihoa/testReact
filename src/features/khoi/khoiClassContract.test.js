import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../..");

// Helper to extract CSS class selectors from CSS file content
function extractCssClasses(cssContent) {
  const classes = new Set();
  // Match .class-name but ignore :pseudo, .dark, decimals like 0.5s, keyframes like 0%
  const classRegex = /\.([a-zA-Z][a-zA-Z0-9_-]*)/g;
  let match;
  while ((match = classRegex.exec(cssContent)) !== null) {
    classes.add(match[1]);
  }
  return classes;
}

// Helper to extract domain class tokens from JSX file content
function extractJsxDomainClasses(jsxContent) {
  const domainClasses = new Set();
  
  // Find all className="..." or className={`...`} chunks
  const classNameAttrRegex = /className=(?:\{`([^`]+)`\}|"([^"]+)"|\{([^}]+)\})/g;
  let match;

  // Domain prefixes that belong to our sector design system contract
  const domainPrefixes = ["khoi-", "cc-", "rl-", "ts-", "pv-", "kt-", "vd-", "card-", "stage-", "theme-"];

  while ((match = classNameAttrRegex.exec(jsxContent)) !== null) {
    const rawContent = match[1] || match[2] || match[3] || "";
    // Tokenize strings, stripping ternaries and template interpolations
    const tokens = rawContent
      .replace(/\$\{[^}]*\}/g, " ")
      .replace(/['"`?:()[\]]/g, " ")
      .split(/\s+/);

    for (const token of tokens) {
      const trimmed = token.trim();
      if (!trimmed || trimmed.endsWith("-")) continue;
      // Check if matches domain prefixes
      if (domainPrefixes.some((prefix) => trimmed.startsWith(prefix))) {
        domainClasses.add(trimmed);
      }
    }
  }

  // Also extract dynamic template literals like `stage-step-${step.step}` -> stage-step-01..06
  if (jsxContent.includes("stage-step-")) {
    for (let i = 1; i <= 6; i++) {
      domainClasses.add(`stage-step-0${i}`);
    }
  }

  return domainClasses;
}

// Helper to load and combine CSS for a specific sector entry point
function getSectorCssClasses(sectorCssFileName) {
  const khoiBasePath = path.resolve(rootDir, "src/features/khoi/khoiBase.css");
  const sectorCssPath = path.resolve(rootDir, `src/pages/${sectorCssFileName}`);

  const baseContent = fs.readFileSync(khoiBasePath, "utf-8");
  const sectorContent = fs.existsSync(sectorCssPath) ? fs.readFileSync(sectorCssPath, "utf-8") : "";

  const baseClasses = extractCssClasses(baseContent);
  const sectorClasses = extractCssClasses(sectorContent);

  return new Set([...baseClasses, ...sectorClasses]);
}

// Helper to collect all domain classes from multiple JSX files for a sector
function getSectorJsxClasses(jsxFilePaths) {
  const classes = new Set();
  for (const relPath of jsxFilePaths) {
    const absPath = path.resolve(rootDir, relPath);
    if (fs.existsSync(absPath)) {
      const content = fs.readFileSync(absPath, "utf-8");
      const extracted = extractJsxDomainClasses(content);
      extracted.forEach((c) => classes.add(c));
    }
  }
  return classes;
}

describe("Scoped CSS Contract and Required Class Presence Tests across 6 Sectors", () => {
  const sectorConfigs = [
    {
      id: "chien-con",
      name: "Khối Chiên Con",
      jsxFiles: ["src/pages/KhoiChienCon.jsx"],
      cssFile: "KhoiChienCon.css"
    },
    {
      id: "ruoc-le",
      name: "Khối Rước Lễ",
      jsxFiles: ["src/pages/KhoiRuocLe.jsx"],
      cssFile: "KhoiRuocLe.css"
    },
    {
      id: "them-suc",
      name: "Khối Thêm Sức",
      jsxFiles: ["src/pages/KhoiThemSuc.jsx"],
      cssFile: "KhoiThemSuc.css"
    },
    {
      id: "phung-vu",
      name: "Khối Phụng Vụ",
      jsxFiles: [
        "src/pages/KhoiPhungVu.jsx",
        "src/features/khoi/KhoiPhungVuLiturgical.jsx",
        "src/features/khoi/KhoiPhungVuSacraments.jsx"
      ],
      cssFile: "KhoiPhungVu.css"
    },
    {
      id: "kinh-thanh",
      name: "Khối Kinh Thánh",
      jsxFiles: [
        "src/pages/KhoiKinhThanh.jsx",
        "src/features/khoi/KhoiKinhThanhTestament.jsx"
      ],
      cssFile: "KhoiKinhThanh.css"
    },
    {
      id: "vao-doi",
      name: "Khối Vào Đời",
      jsxFiles: [
        "src/pages/KhoiVaoDoi.jsx",
        "src/features/khoi/KhoiVaoDoiPillars.jsx"
      ],
      cssFile: "KhoiVaoDoi.css"
    }
  ];

  for (const sector of sectorConfigs) {
    it(`${sector.name} (${sector.id}): 100% domain classes in JSX must exist in imported CSS contract`, () => {
      const definedCssClasses = getSectorCssClasses(sector.cssFile);
      const usedJsxClasses = getSectorJsxClasses([
        ...sector.jsxFiles,
        "src/features/khoi/KhoiOverviewBar.jsx"
      ]);

      const missingClasses = [];
      for (const cls of usedJsxClasses) {
        if (!definedCssClasses.has(cls)) {
          missingClasses.push(cls);
        }
      }

      assert.strictEqual(
        missingClasses.length,
        0,
        `[${sector.name}] Các class sau được dùng trong JSX nhưng KHÔNG có trong CSS (${sector.cssFile} + khoiBase.css): ${missingClasses.join(", ")}`
      );
    });
  }

  it("Các class phân tầng chuẩn (khoi-group-block, khoi-stage-header, khoi-stage-num, v.v.) hiện diện trong các trang khối", () => {
    const requiredCanonicalClasses = [
      "khoi-group-block",
      "khoi-stage-header",
      "khoi-stage-title-wrap",
      "khoi-stage-num",
      "khoi-stage-title",
      "khoi-stage-subtitle",
      "khoi-stage-pills",
      "khoi-stage-pill",
      "khoi-class-grid"
    ];

    const targetSectorJsx = [
      "src/pages/KhoiRuocLe.jsx",
      "src/pages/KhoiThemSuc.jsx",
      "src/pages/KhoiPhungVu.jsx",
      "src/pages/KhoiKinhThanh.jsx",
      "src/pages/KhoiVaoDoi.jsx"
    ];

    for (const file of targetSectorJsx) {
      const usedClasses = getSectorJsxClasses([file]);
      for (const reqClass of requiredCanonicalClasses) {
        assert.ok(
          usedClasses.has(reqClass),
          `[${file}] Bắt buộc phải có class chuẩn '${reqClass}' trong cấu trúc phân tầng lớp học`
        );
      }
    }
  });

  it("khoiBase.css định nghĩa đầy đủ modifier .khoi-class-grid--two", () => {
    const baseCssPath = path.resolve(rootDir, "src/features/khoi/khoiBase.css");
    const baseContent = fs.readFileSync(baseCssPath, "utf-8");
    assert.ok(
      baseContent.includes(".khoi-class-grid--two"),
      "khoiBase.css phải chứa modifier .khoi-class-grid--two"
    );
  });

  it("Không có class ngoài contract (khoi-stats-grid, khoi-hero-card, khoi-family-section, v.v.) trong 6 trang", () => {
    const legacyClasses = [
      "khoi-hero-card",
      "khoi-hero-image",
      "khoi-hero-visual-col",
      "khoi-hero-right",
      "khoi-stats-grid",
      "khoi-stat-card",
      "khoi-stat-icon-wrap",
      "khoi-classes-grid",
      "khoi-class-header",
      "khoi-family-section",
      "khoi-cta-primary-btn"
    ];

    const allSectorJsx = [
      "src/pages/KhoiChienCon.jsx",
      "src/pages/KhoiRuocLe.jsx",
      "src/pages/KhoiThemSuc.jsx",
      "src/pages/KhoiPhungVu.jsx",
      "src/pages/KhoiKinhThanh.jsx",
      "src/pages/KhoiVaoDoi.jsx"
    ];

    const foundLegacy = [];
    for (const file of allSectorJsx) {
      const content = fs.readFileSync(path.resolve(rootDir, file), "utf-8");
      const classTokens = new Set();
      const classNameAttrRegex = /className=(?:\{`([^`]+)`\}|"([^"]+)"|\{([^}]+)\})/g;
      let match;
      while ((match = classNameAttrRegex.exec(content)) !== null) {
        const rawContent = match[1] || match[2] || match[3] || "";
        const tokens = rawContent
          .replace(/\$\{[^}]*\}/g, " ")
          .replace(/['"`?:()[\]]/g, " ")
          .split(/\s+/);
        for (const token of tokens) {
          const trimmed = token.trim();
          if (trimmed) classTokens.add(trimmed);
        }
      }

      for (const legacy of legacyClasses) {
        if (classTokens.has(legacy)) {
          foundLegacy.push(`${file} -> ${legacy}`);
        }
      }
    }

    assert.strictEqual(
      foundLegacy.length,
      0,
      `Phát hiện class legacy còn sót lại trong JSX:\n${foundLegacy.join("\n")}`
    );
  });

  it("Danh sách lớp đứng trước phần Sư phạm Đức tin và eyebrow chỉ gọi tên Khối", () => {
    const pedagogyLabels = new Map([
      ["src/pages/KhoiRuocLe.jsx", "SƯ PHẠM ĐỨC TIN KHỐI RƯỚC LỄ"],
      ["src/pages/KhoiThemSuc.jsx", "SƯ PHẠM ĐỨC TIN KHỐI THÊM SỨC"],
      ["src/pages/KhoiPhungVu.jsx", "SƯ PHẠM ĐỨC TIN KHỐI PHỤNG VỤ"],
      ["src/pages/KhoiKinhThanh.jsx", "SƯ PHẠM ĐỨC TIN KHỐI KINH THÁNH"],
      ["src/pages/KhoiVaoDoi.jsx", "SƯ PHẠM ĐỨC TIN KHỐI VÀO ĐỜI"]
    ]);

    for (const [file, expectedLabel] of pedagogyLabels) {
      const content = fs.readFileSync(path.resolve(rootDir, file), "utf-8");
      const classListIndex = content.indexOf('id="danh-sach-lop"');
      const pedagogyIndex = content.indexOf(expectedLabel);

      assert.ok(classListIndex >= 0, `[${file}] Thiếu section danh sách lớp`);
      assert.ok(pedagogyIndex >= 0, `[${file}] Thiếu eyebrow '${expectedLabel}'`);
      assert.ok(
        classListIndex < pedagogyIndex,
        `[${file}] Danh sách lớp phải đứng trước phần Sư phạm Đức tin`
      );
      assert.ok(
        !content.includes("SƯ PHẠM ĐỨC TIN NGÀNH"),
        `[${file}] Eyebrow Sư phạm Đức tin không được dùng tên Ngành`
      );
    }
  });
});
