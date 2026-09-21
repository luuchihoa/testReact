import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('QuyDinh Page Design & Standards Compliance (AGENTS.md v1.1)', () => {
  const jsxPath = path.resolve(__dirname, 'QuyDinh.jsx');
  const cssPath = path.resolve(__dirname, 'QuyDinh.css');

  const jsxContent = fs.readFileSync(jsxPath, 'utf-8');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');

  it('1. Zero hardcoded inline fontSize in QuyDinh.jsx', () => {
    assert.doesNotMatch(
      jsxContent,
      /fontSize:\s*["'][0-9.]+px["']/,
      'QuyDinh.jsx không được chứa inline style fontSize dạng px cứng'
    );
  });

  it('2. 100% REM standard in QuyDinh.css (Zero font-size in px)', () => {
    const fontSizePxRegex = /font-size:\s*[0-9.]+px/gi;
    const matches = cssContent.match(fontSizePxRegex) || [];
    assert.deepEqual(
      matches,
      [],
      `QuyDinh.css chứa font-size dạng px cứng vi phạm chuẩn REM: ${matches.join(', ')}`
    );

    // Also check clamp with px inside font-size
    const clampPxRegex = /font-size:\s*clamp\([^)]*px[^)]*\)/gi;
    const clampMatches = cssContent.match(clampPxRegex) || [];
    assert.deepEqual(
      clampMatches,
      [],
      `QuyDinh.css chứa clamp(px) trong font-size: ${clampMatches.join(', ')}`
    );
  });

  it('3. Zero font-size < 0.75rem in QuyDinh.css (Tối thiểu 0.75rem text-xs)', () => {
    const subRemRegex = /font-size:\s*0\.(?:[0-6][0-9]*|7[0-4][0-9]*)rem/gi;
    const subRemMatches = cssContent.match(subRemRegex) || [];
    assert.deepEqual(
      subRemMatches,
      [],
      `QuyDinh.css chứa font-size < 0.75rem (12px) không đạt chuẩn: ${subRemMatches.join(', ')}`
    );
  });

  it('4. WCAG AAA Contrast Tokens for Light Mode and Dark Mode', () => {
    // Light mode tokens
    assert.match(cssContent, /--rule-muted:\s*#4d5b4e;/, 'Light mode --rule-muted phải là #4d5b4e (≥7.0:1 AAA)');
    assert.match(cssContent, /--rule-accent-text:\s*#5e4420;/, 'Light mode --rule-accent-text phải là #5e4420 (≥7.0:1 AAA)');

    // Dark mode tokens
    assert.match(cssContent, /--rule-muted:\s*#b0b9ac;/, 'Dark mode --rule-muted phải là #b0b9ac (≥7.0:1 AAA)');
    assert.match(cssContent, /--rule-accent-text:\s*#d4b47d;/, 'Dark mode --rule-accent-text phải là #d4b47d (≥7.0:1 AAA)');
  });

  it('5. Touch targets for TOC pills and buttons >= 44px', () => {
    assert.match(cssContent, /\.rule-toc-pill\s*\{[^}]*min-height:\s*44px/s, '.rule-toc-pill phải có min-height >= 44px');
    assert.match(cssContent, /\.rule-btn-primary\s*\{[^}]*min-height:\s*48px/s, '.rule-btn-primary phải có min-height >= 48px');
    assert.match(cssContent, /\.rule-btn-secondary\s*\{[^}]*min-height:\s*48px/s, '.rule-btn-secondary phải có min-height >= 48px');
  });

  it('6. Overview chips protection against text wrapping (chống ngắt dòng)', () => {
    assert.match(cssContent, /\.rule-overview-chips\s*\{[^}]*max-width:\s*380px/s, '.rule-overview-chips phải có max-width: 380px');
    assert.match(cssContent, /\.rule-chip-value\s*\{[^}]*white-space:\s*nowrap/s, '.rule-chip-value phải có white-space: nowrap');
  });

  it('7. iOS Safe Area and Reduced Motion Handling', () => {
    assert.match(cssContent, /safe-area-inset-bottom/, 'QuyDinh.css phải xử lý safe-area-inset-bottom');
    assert.match(cssContent, /@media\s*\(prefers-reduced-motion:\s*reduce\)/, 'QuyDinh.css phải có media query prefers-reduced-motion');
  });

  it('8. Uses Motion components and useReducedMotion in QuyDinh.jsx', () => {
    assert.match(jsxContent, /useReducedMotion/, 'QuyDinh.jsx phải tích hợp useReducedMotion');
    assert.match(jsxContent, /Motion\.header|Motion\.section|Motion\.article/, 'QuyDinh.jsx phải sử dụng Motion component cho animation dẫn dắt');
  });

  it('9. Uses Hùng Tâm Dũng Chí terminology (no TNTT or Thiếu Nhi Thánh Thể)', () => {
    assert.match(jsxContent, /Hùng Tâm Dũng Chí/, 'QuyDinh.jsx phải dùng phong trào Hùng Tâm Dũng Chí');
    assert.doesNotMatch(jsxContent, /\bTNTT\b/, 'QuyDinh.jsx không được dùng từ viết tắt TNTT');
    assert.doesNotMatch(jsxContent, /Thiếu [Nn]hi Thánh Thể/, 'QuyDinh.jsx không được dùng danh xưng Thiếu Nhi Thánh Thể');
  });
});
