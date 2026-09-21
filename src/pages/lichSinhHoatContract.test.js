import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('LichSinhHoat Page Design & Standards Compliance (AGENTS.md v1.1)', () => {
  const jsxPath = path.resolve(__dirname, 'LichSinhHoat.jsx');
  const cssPath = path.resolve(__dirname, 'LichSinhHoat.css');
  const dataPath = path.resolve(__dirname, '../data/lichSinhHoatData.js');

  const jsxContent = fs.readFileSync(jsxPath, 'utf-8');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');
  const dataContent = fs.readFileSync(dataPath, 'utf-8');

  it('1. Zero hardcoded inline fontSize in LichSinhHoat.jsx', () => {
    assert.doesNotMatch(
      jsxContent,
      /fontSize:\s*["'][0-9.]+px["']/,
      'LichSinhHoat.jsx không được chứa inline style fontSize dạng px cứng'
    );
  });

  it('2. 100% REM standard in LichSinhHoat.css (Zero font-size in px)', () => {
    const fontSizePxRegex = /font-size:\s*[0-9.]+px/gi;
    const matches = cssContent.match(fontSizePxRegex) || [];
    assert.deepEqual(
      matches,
      [],
      `LichSinhHoat.css chứa font-size dạng px cứng vi phạm chuẩn REM: ${matches.join(', ')}`
    );

    // Also check clamp with px inside font-size
    const clampPxRegex = /font-size:\s*clamp\([^)]*px[^)]*\)/gi;
    const clampMatches = cssContent.match(clampPxRegex) || [];
    assert.deepEqual(
      clampMatches,
      [],
      `LichSinhHoat.css chứa clamp(px) trong font-size: ${clampMatches.join(', ')}`
    );
  });

  it('3. Zero font-size < 0.75rem in LichSinhHoat.css (Tối thiểu 0.75rem text-xs)', () => {
    const subRemRegex = /font-size:\s*0\.(?:[0-6][0-9]*|7[0-4][0-9]*)rem/gi;
    const subRemMatches = cssContent.match(subRemRegex) || [];
    assert.deepEqual(
      subRemMatches,
      [],
      `LichSinhHoat.css chứa font-size < 0.75rem (12px) không đạt chuẩn: ${subRemMatches.join(', ')}`
    );
  });

  it('4. WCAG AAA Contrast Tokens for Light Mode and Dark Mode', () => {
    // Light mode tokens
    assert.match(cssContent, /--act-muted:\s*#4d5b4e;/, 'Light mode --act-muted phải là #4d5b4e (≥7.0:1 AAA)');
    assert.match(cssContent, /--act-accent-text:\s*#5e4420;/, 'Light mode --act-accent-text phải là #5e4420 (≥7.0:1 AAA)');

    // Dark mode tokens
    assert.match(cssContent, /--act-muted:\s*#b0b9ac;/, 'Dark mode --act-muted phải là #b0b9ac (≥7.0:1 AAA)');
    assert.match(cssContent, /--act-accent-text:\s*#d4b47d;/, 'Dark mode --act-accent-text phải là #d4b47d (≥7.0:1 AAA)');
  });

  it('5. Touch targets for tabs, pills, and buttons >= 44px', () => {
    assert.match(cssContent, /\.act-tab-btn\s*\{[^}]*min-height:\s*44px/s, '.act-tab-btn phải có min-height >= 44px');
    assert.match(cssContent, /\.act-filter-pill\s*\{[^}]*min-height:\s*44px/s, '.act-filter-pill phải có min-height >= 44px');
    assert.match(cssContent, /\.act-btn-primary\s*\{[^}]*min-height:\s*48px/s, '.act-btn-primary phải có min-height >= 48px');
    assert.match(cssContent, /\.act-btn-secondary\s*\{[^}]*min-height:\s*48px/s, '.act-btn-secondary phải có min-height >= 48px');
  });

  it('6. iOS Safe Area and Reduced Motion Handling', () => {
    assert.match(cssContent, /safe-area-inset-bottom/, 'LichSinhHoat.css phải xử lý safe-area-inset-bottom');
    assert.match(cssContent, /@media\s*\(prefers-reduced-motion:\s*reduce\)/, 'LichSinhHoat.css phải có media query prefers-reduced-motion');
  });

  it('7. Uses Motion components and useReducedMotion in LichSinhHoat.jsx', () => {
    assert.match(jsxContent, /useReducedMotion/, 'LichSinhHoat.jsx phải tích hợp useReducedMotion');
    assert.match(jsxContent, /Motion\.header|Motion\.section|Motion\.article/, 'LichSinhHoat.jsx phải sử dụng Motion component cho animation dẫn dắt');
  });

  it('8. Activity data has 2026–2027 academic year, 1-day camp, and correct HTDC terminology', () => {
    assert.match(dataContent, /ACADEMIC_YEAR\s*=\s*["']2026–2027["']/, 'lichSinhHoatData.js phải có niên khóa 2026–2027');
    assert.match(dataContent, /Giáo lý sinh|Huynh trưởng|Cha Tuyên úy/, 'lichSinhHoatData.js phải dùng đúng thuật ngữ Công giáo và HTDC');
    assert.match(dataContent, /Hùng Tâm Dũng Chí/, 'lichSinhHoatData.js phải dùng phong trào Hùng Tâm Dũng Chí');
    assert.match(dataContent, /Trọn 1 Ngày/, 'Hội trại hè hàng năm phải được tổ chức trọn 1 ngày');
    assert.doesNotMatch(dataContent, /\bTNTT\b/, 'lichSinhHoatData.js không được còn từ viết tắt TNTT');
    assert.doesNotMatch(dataContent, /Thiếu Nhi Thánh Thể/, 'lichSinhHoatData.js không được còn tên phong trào Thiếu Nhi Thánh Thể');
    assert.match(dataContent, /WEEKLY_ROUTINE/, 'lichSinhHoatData.js phải xuất WEEKLY_ROUTINE');
    assert.match(dataContent, /ACADEMIC_EVENTS_2026_2027/, 'lichSinhHoatData.js phải xuất ACADEMIC_EVENTS_2026_2027');
    assert.match(dataContent, /SKILL_MODULES/, 'lichSinhHoatData.js phải xuất SKILL_MODULES');
  });
});
