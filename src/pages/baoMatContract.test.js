import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('BaoMat Page Design & Standards Compliance (AGENTS.md v1.1)', () => {
  const jsxPath = path.resolve(__dirname, 'BaoMat.jsx');
  const cssPath = path.resolve(__dirname, 'BaoMat.css');

  const jsxContent = fs.readFileSync(jsxPath, 'utf-8');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');

  it('1. Zero hardcoded inline fontSize in BaoMat.jsx', () => {
    assert.doesNotMatch(
      jsxContent,
      /fontSize:\s*["'][0-9.]+px["']/,
      'BaoMat.jsx không được chứa inline style fontSize dạng px cứng'
    );
  });

  it('2. 100% REM standard in BaoMat.css (Zero font-size in px)', () => {
    const fontSizePxRegex = /font-size:\s*[0-9.]+px/gi;
    const matches = cssContent.match(fontSizePxRegex) || [];
    assert.deepEqual(
      matches,
      [],
      `BaoMat.css chứa font-size dạng px cứng vi phạm chuẩn REM: ${matches.join(', ')}`
    );

    // Also check clamp with px inside font-size
    const clampPxRegex = /font-size:\s*clamp\([^)]*px[^)]*\)/gi;
    const clampMatches = cssContent.match(clampPxRegex) || [];
    assert.deepEqual(
      clampMatches,
      [],
      `BaoMat.css chứa clamp(px) trong font-size: ${clampMatches.join(', ')}`
    );
  });

  it('3. Zero font-size < 0.75rem in BaoMat.css (Tối thiểu 0.75rem text-xs)', () => {
    const subRemRegex = /font-size:\s*0\.(?:[0-6][0-9]*|7[0-4][0-9]*)rem/gi;
    const subRemMatches = cssContent.match(subRemRegex) || [];
    assert.deepEqual(
      subRemMatches,
      [],
      `BaoMat.css chứa font-size < 0.75rem (12px) không đạt chuẩn: ${subRemMatches.join(', ')}`
    );
  });

  it('4. WCAG AAA Contrast Tokens for Light Mode and Dark Mode', () => {
    // Light mode tokens
    assert.match(cssContent, /--sec-muted:\s*#4d5b4e;/, 'Light mode --sec-muted phải là #4d5b4e (≥7.0:1 AAA)');
    assert.match(cssContent, /--sec-accent-text:\s*#5e4420;/, 'Light mode --sec-accent-text phải là #5e4420 (≥7.0:1 AAA)');

    // Dark mode tokens
    assert.match(cssContent, /--sec-muted:\s*#b0b9ac;/, 'Dark mode --sec-muted phải là #b0b9ac (≥7.0:1 AAA)');
    assert.match(cssContent, /--sec-accent-text:\s*#d4b47d;/, 'Dark mode --sec-accent-text phải là #d4b47d (≥7.0:1 AAA)');
  });

  it('5. Touch targets for TOC pills and buttons >= 44px', () => {
    assert.match(cssContent, /\.sec-toc-pill\s*\{[^}]*min-height:\s*44px/s, '.sec-toc-pill phải có min-height >= 44px');
    assert.match(cssContent, /\.sec-btn-primary\s*\{[^}]*min-height:\s*48px/s, '.sec-btn-primary phải có min-height >= 48px');
    assert.match(cssContent, /\.sec-btn-secondary\s*\{[^}]*min-height:\s*48px/s, '.sec-btn-secondary phải có min-height >= 48px');
  });

  it('6. iOS Safe Area and Reduced Motion Handling', () => {
    assert.match(cssContent, /safe-area-inset-bottom/, 'BaoMat.css phải xử lý safe-area-inset-bottom');
    assert.match(cssContent, /@media\s*\(prefers-reduced-motion:\s*reduce\)/, 'BaoMat.css phải có media query prefers-reduced-motion');
  });

  it('7. Uses motion and useReducedMotion in BaoMat.jsx', () => {
    assert.match(jsxContent, /useReducedMotion/, 'BaoMat.jsx phải tích hợp useReducedMotion');
    assert.match(jsxContent, /Motion\.header|Motion\.section|Motion\.div/, 'BaoMat.jsx phải sử dụng Motion component cho animation dẫn dắt');
  });
});
