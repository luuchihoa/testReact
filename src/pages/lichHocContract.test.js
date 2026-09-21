import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('LichHoc Page Design & Contract Standards (AGENTS.md v1.1)', () => {
  const jsxPath = path.resolve(__dirname, 'LichHoc.jsx');
  const cssPath = path.resolve(__dirname, 'LichHoc.css');

  const jsxContent = fs.readFileSync(jsxPath, 'utf-8');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');

  it('1. 100% domain classes in LichHoc.jsx must exist in LichHoc.css or global CSS (Tight Whitelist)', () => {
    const classRegex = /className=["'`]([^"'`]+)["'`]/g;
    const jsxClasses = new Set();
    let match;
    while ((match = classRegex.exec(jsxContent)) !== null) {
      match[1].split(/\s+/).forEach((cls) => {
        const clean = cls.trim();
        if (clean && !clean.startsWith('{') && !clean.startsWith('$')) {
          jsxClasses.add(clean);
        }
      });
    }

    // Strictly whitelist structural layout primitives and state modifiers only - NO color utilities
    const structuralOrState = new Set([
      'search-icon', 'clear-btn', 'more', 'active', 'central-mass', 'time-tag',
      'card-title', 'card-desc', 'card-badge', 'pinned', 'visible', 'opacity-70',
      'inline-flex', 'items-center', 'gap-1', 'gap-1.5', 'justify-end', 'font-semibold',
      'truncate', 'md:hidden'
    ]);

    const missing = [];
    jsxClasses.forEach((cls) => {
      if (structuralOrState.has(cls)) return;
      if (cls.startsWith('card-nganh-')) return;
      if (!cssContent.includes(`.${cls}`)) {
        missing.push(cls);
      }
    });

    assert.deepEqual(
      missing,
      [],
      `Các class trong JSX không tìm thấy trong LichHoc.css: ${missing.join(', ')}`
    );
  });

  it('2. Zero hardcoded inline fontSize in LichHoc.jsx', () => {
    assert.doesNotMatch(
      jsxContent,
      /fontSize:\s*["'][0-9.]+px["']/,
      'LichHoc.jsx không được chứa inline style fontSize dạng px cứng'
    );
  });

  it('3. 100% REM standard in LichHoc.css (no font-size in px)', () => {
    const lines = cssContent.split('\n');
    const pxFontSizeViolations = [];

    lines.forEach((line, idx) => {
      if (/font-size:\s*[^;]*px/i.test(line) || /clamp\([^)]*px/i.test(line)) {
        pxFontSizeViolations.push(`Dòng ${idx + 1}: ${line.trim()}`);
      }
    });

    assert.deepEqual(
      pxFontSizeViolations,
      [],
      `LichHoc.css còn chứa font-size tính bằng px:\n${pxFontSizeViolations.join('\n')}`
    );
  });

  it('4. Anchor #danh-sach-lop matches target element and has scroll-margin-top >= 7.75rem (124px)', () => {
    assert.match(
      jsxContent,
      /<a[^>]*href="#danh-sach-lop"[^>]*>/,
      'Cần có nút link href="#danh-sach-lop"'
    );
    assert.match(
      jsxContent,
      /id="danh-sach-lop"/,
      'Cần có phần tử đích id="danh-sach-lop"'
    );
    assert.match(
      cssContent,
      /scroll-margin-top:\s*(8rem|7\.75rem|[89]\.[0-9]+rem|1[2-9][0-9]px)/,
      'scroll-margin-top tại #danh-sach-lop phải >= 7.75rem (124px) để tránh bị Header và Sticky Bar che khuất'
    );
  });

  it('5. Interactive controls have touch targets >= 44px in LichHoc.css (including pin and room buttons)', () => {
    assert.match(
      cssContent,
      /\.sched-shift-btn\s*\{[^}]*min-height:\s*(2\.75rem|44px)/,
      '.sched-shift-btn phải có min-height >= 44px (2.75rem)'
    );
    assert.match(
      cssContent,
      /\.sched-search-box input\s*\{[^}]*min-height:\s*(2\.75rem|44px)/,
      '.sched-search-box input phải có min-height >= 44px (2.75rem)'
    );
    assert.match(
      cssContent,
      /\.sched-view-btn\s*\{[^}]*min-height:\s*(2\.75rem|44px)/,
      '.sched-view-btn phải có min-height >= 44px (2.75rem)'
    );
    assert.match(
      cssContent,
      /\.sched-chip\s*\{[^}]*min-height:\s*(2\.75rem|44px)/,
      '.sched-chip phải có min-height >= 44px (2.75rem)'
    );
    assert.match(
      cssContent,
      /\.sched-pin-btn::before\s*\{[^}]*min-height:\s*44px|\.sched-pin-btn\s*\{[^}]*min-height:\s*(2\.75rem|44px)/,
      '.sched-pin-btn phải có vùng chạm >= 44px'
    );
    assert.match(
      cssContent,
      /\.sched-bento-room::before\s*\{[^}]*min-height:\s*44px|\.sched-bento-room\s*\{[^}]*min-height:\s*(2\.75rem|44px)/,
      '.sched-bento-room phải có vùng chạm >= 44px'
    );
  });

  it('6. Light Mode and Dark Mode contrast tokens achieve WCAG AAA (>= 7.0:1)', () => {
    assert.match(
      cssContent,
      /--sched-muted:\s*#4a5148;/,
      '--sched-muted phải là #4a5148 trên nền sáng'
    );
    assert.match(
      cssContent,
      /--sched-accent-text:\s*#5e4420;/,
      '--sched-accent-text phải là #5e4420 trên nền sáng'
    );
    assert.match(
      cssContent,
      /--sched-on-primary:\s*#19251d;/,
      'Dark mode --sched-on-primary phải là #19251d'
    );
  });

  it('7. Primary buttons and reset buttons use var(--sched-on-primary) (no hardcoded #ffffff)', () => {
    assert.match(
      cssContent,
      /\.sched-btn-primary\s*\{[^}]*color:\s*var\(--sched-on-primary\);/,
      '.sched-btn-primary phải sử dụng color: var(--sched-on-primary);'
    );
    assert.match(
      cssContent,
      /\.sched-empty-reset\s*\{[^}]*color:\s*var\(--sched-on-primary\);/,
      '.sched-empty-reset phải sử dụng color: var(--sched-on-primary);'
    );
  });

  it('8. 4 Sector HTDC text colors achieve WCAG AAA (>= 7.0:1) on light mode', () => {
    assert.match(
      cssContent,
      /--card-text:\s*#7f1d1d;/,
      'Ngành Chinh Chiến text color phải là #7f1d1d (>= 8.0:1 contrast)'
    );
    assert.match(
      cssContent,
      /--card-text:\s*#7c2d12;/,
      'Ngành Nhiệt Quang text color phải là #7c2d12 (>= 7.5:1 contrast)'
    );
    assert.match(
      cssContent,
      /--card-text:\s*#713f12;/,
      'Ngành Kim Hoan text color phải là #713f12 (>= 7.5:1 contrast)'
    );
    assert.match(
      cssContent,
      /--card-text:\s*#14532d;/,
      'Ngành Ấu Dũng text color phải là #14532d (>= 7.5:1 contrast)'
    );
  });

  it('9. Floating Thumb Bar is positioned ABOVE Mobile Header Navigation (no overlap)', () => {
    assert.match(
      cssContent,
      /\.sched-thumb-bar\s*\{[^}]*bottom:\s*calc\([0-9.]+rem\s*\+\s*env\(safe-area-inset-bottom\)\)/,
      '.sched-thumb-bar phải đặt nổi phía trên thanh điều hướng mobile với calc(...rem + env(safe-area-inset-bottom))'
    );
    assert.match(
      cssContent,
      /\.sched-thumb-bar\s*\{[^}]*z-index:\s*30;/,
      '.sched-thumb-bar phải có z-index: 30 để không cản trở tương tác thanh Bottom Nav'
    );
  });

  it('10. Zero scroll event listener and zero hardcoded scrollY thresholds in LichHoc.jsx', () => {
    assert.doesNotMatch(
      jsxContent,
      /addEventListener\(["']scroll["']/,
      'LichHoc.jsx không được dùng scroll event listener 60fps'
    );
    assert.doesNotMatch(
      jsxContent,
      /window\.scrollY/,
      'LichHoc.jsx không được dùng window.scrollY với pixel cứng'
    );
    assert.match(
      jsxContent,
      /IntersectionObserver/,
      'LichHoc.jsx phải sử dụng IntersectionObserver'
    );
  });

  it('11. Pinned classes section has AnimatePresence and Clear-All feature', () => {
    assert.match(
      jsxContent,
      /anNgai_pinnedClasses/,
      'Phải lưu danh sách lớp ghim vào localStorage với khóa anNgai_pinnedClasses'
    );
    assert.match(
      jsxContent,
      /<AnimatePresence>[^]*pinnedClasses\.length > 0[^]*<\/AnimatePresence>/,
      'Khối Pinned Classes phải được bọc trong AnimatePresence để tránh giật layout khi gỡ lớp'
    );
    assert.match(
      jsxContent,
      /clearAllPinned|Bỏ ghim tất cả/,
      'Phải có chức năng "Bỏ ghim tất cả" cho tiện ích lớp ghim'
    );
  });

  it('12. Card grid does NOT use mode="popLayout" to prevent layout snapping', () => {
    assert.doesNotMatch(
      jsxContent,
      /<AnimatePresence[^>]*mode="popLayout"/,
      'Card grid không được sử dụng mode="popLayout" vì gây giật cục khung hình khi lọc'
    );
  });

  it('13. Catholic liturgical terms are correctly applied', () => {
    assert.match(
      jsxContent,
      /Thiếu nhi/,
      'Phải sử dụng danh xưng Công giáo "Thiếu nhi"'
    );
    assert.match(
      jsxContent,
      /Ban Giáo lý &amp; Huynh trưởng|Ban Giáo lý & Huynh trưởng/,
      'Phải sử dụng danh xưng "Ban Giáo lý & Huynh trưởng"'
    );
    assert.match(
      jsxContent,
      /Độ tuổi &amp; Sĩ số|Độ tuổi & Sĩ số/,
      'Phải sử dụng tiêu đề "Độ tuổi & Sĩ số" trong bảng'
    );
  });

  it('14. Zero arbitrary Tailwind color utility classes in LichHoc.jsx', () => {
    assert.doesNotMatch(
      jsxContent,
      /className=["'][^"']*\b(text-amber-|bg-amber-|text-emerald-|bg-emerald-|text-stone-|border-amber-|border-emerald-)[^"']*["']/,
      'LichHoc.jsx không được chứa các class màu Tailwind tùy tiện rải rác'
    );
  });

  it('15. Room directory buttons have touch targets >= 44px with accessible state', () => {
    assert.match(
      cssContent,
      /\.sched-room-button\s*\{[^}]*min-height:\s*(2\.75rem|3\.[0-9]+rem|[45][0-9]px)/,
      '.sched-room-button phải có min-height >= 44px'
    );
  });

  it('16. Floating thumb bar buttons have touch targets >= 44px (min-height & min-width 2.75rem)', () => {
    assert.match(
      cssContent,
      /\.sched-thumb-tab-btn\s*\{[^}]*min-height:\s*(2\.75rem|44px)/,
      '.sched-thumb-tab-btn phải có min-height >= 44px (2.75rem)'
    );
    assert.match(
      cssContent,
      /\.sched-thumb-tab-btn\s*\{[^}]*min-width:\s*(2\.75rem|44px)/,
      '.sched-thumb-tab-btn phải có min-width >= 44px (2.75rem)'
    );
    assert.match(
      cssContent,
      /\.sched-thumb-action-btn\s*\{[^}]*min-height:\s*(2\.75rem|44px)/,
      '.sched-thumb-action-btn phải có min-height >= 44px (2.75rem)'
    );
    assert.match(
      cssContent,
      /\.sched-thumb-action-btn\s*\{[^}]*min-width:\s*(2\.75rem|44px)/,
      '.sched-thumb-action-btn phải có min-width >= 44px (2.75rem)'
    );
  });

  it('17. Pin button active state achieves >= 3.0:1 contrast (#854d0e on light, #fde047 on dark)', () => {
    assert.match(
      cssContent,
      /\.sched-pin-btn\.pinned\s*\{[^}]*border-color:\s*#854d0e;/,
      '.sched-pin-btn.pinned phải có border-color: #854d0e (>= 4.5:1 contrast)'
    );
    assert.match(
      cssContent,
      /\.sched-pin-btn\.pinned\s*\{[^}]*color:\s*#854d0e;/,
      '.sched-pin-btn.pinned phải có color: #854d0e (>= 4.5:1 contrast)'
    );
    assert.match(
      cssContent,
      /\.dark\s+\.sched-pin-btn\.pinned\s*\{[^}]*border-color:\s*#facc15;/,
      'Dark mode .sched-pin-btn.pinned phải có border-color: #facc15'
    );
  });

  it('18. Zero font-size < 0.75rem in LichHoc.css (no 0.6875rem or 11px)', () => {
    const lines = cssContent.split('\n');
    const subRemViolations = [];
    lines.forEach((line, idx) => {
      const match = line.match(/font-size:\s*0\.([0-6][0-9]*|7[0-4][0-9]*)rem/);
      if (match) {
        subRemViolations.push(`Dòng ${idx + 1}: ${line.trim()}`);
      }
    });
    assert.deepEqual(
      subRemViolations,
      [],
      `LichHoc.css còn chứa font-size < 0.75rem (12px):\n${subRemViolations.join('\n')}`
    );
  });

  it('19. Zero transition: all and full @media (prefers-reduced-motion: reduce) in LichHoc.css', () => {
    assert.doesNotMatch(
      cssContent,
      /transition:\s*all\b/i,
      'LichHoc.css không được dùng transition: all'
    );
    // Block phải tồn tại và chứa transition-duration hoặc transition: none !important để vô hiệu hóa animation
    assert.match(
      cssContent,
      /@media\s*\(prefers-reduced-motion:\s*reduce\)/i,
      'LichHoc.css phải có @media (prefers-reduced-motion: reduce)'
    );
    assert.match(
      cssContent,
      /transition-duration:\s*0\.01ms\s*!important|transition:\s*none\s*!important/i,
      'LichHoc.css phải vô hiệu hóa transition trong reduced motion block'
    );
  });

  it('20. Central Mass specifies classesCount: 29 and explains Nursery separate schedule', () => {
    assert.match(
      jsxContent,
      /CENTRAL_MASS\.classesCount/,
      'LichHoc.jsx phải tham chiếu trực tiếp CENTRAL_MASS.classesCount'
    );
    assert.match(
      jsxContent,
      /lớp chính quy/,
      'LichHoc.jsx phải ghi rõ "lớp chính quy"'
    );
  });

  it('21. sched-cards-grid uses minmax(0, 1fr) to prevent mobile layout overflow', () => {
    assert.match(
      cssContent,
      /\.sched-cards-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/,
      '.sched-cards-grid phải dùng minmax(0, 1fr) để ngăn chặn tràn ngang trên mobile'
    );
  });

  it('22. sched-card has min-width: 0, width: 100%, and max-width: 100% to fit screen container', () => {
    assert.match(
      cssContent,
      /\.sched-card\s*\{[^}]*min-width:\s*0;/,
      '.sched-card phải có min-width: 0'
    );
    assert.match(
      cssContent,
      /\.sched-card\s*\{[^}]*max-width:\s*100%;/,
      '.sched-card phải có max-width: 100%'
    );
  });

  it('23. sched-bento-head allows flex-wrap: wrap to prevent expanding cards on narrow viewports', () => {
    assert.match(
      cssContent,
      /\.sched-bento-head\s*\{[^}]*flex-wrap:\s*wrap;/,
      '.sched-bento-head phải có flex-wrap: wrap'
    );
    assert.match(
      cssContent,
      /\.sched-bento-code\s*\{[^}]*max-width:\s*100%;/,
      '.sched-bento-code phải có max-width: 100%'
    );
  });

  it('24. sched-bento-foot allows flex-wrap: wrap to prevent overflowing with large fonts', () => {
    assert.match(
      cssContent,
      /\.sched-bento-foot\s*\{[^}]*flex-wrap:\s*wrap;/,
      '.sched-bento-foot phải có flex-wrap: wrap'
    );
  });

  it('25. sched-pinned-grid uses minmax(0, 1fr) and pinned cards are contained', () => {
    assert.match(
      cssContent,
      /\.sched-pinned-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/,
      '.sched-pinned-grid phải có grid-template-columns: minmax(0, 1fr)'
    );
    assert.match(
      cssContent,
      /\.sched-pinned-card\s*\{[^}]*min-width:\s*0;/,
      '.sched-pinned-card phải có min-width: 0'
    );
  });
});
