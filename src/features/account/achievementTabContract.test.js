import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const achievementTabPath = path.resolve(__dirname, './components/AchievementTab.jsx');

test('AchievementTab Contract Standards (AGENTS.md v1.1 & Year Selector Feature)', async (t) => {
  const content = fs.readFileSync(achievementTabPath, 'utf8');

  await t.test('1. exports fetchStudentEnrolledYears helper function', () => {
    assert.match(
      content,
      /export\s+async\s+function\s+fetchStudentEnrolledYears\s*\(/,
      'fetchStudentEnrolledYears must be exported as an async function'
    );
  });

  await t.test('2. fetchStudentEnrolledYears queries both enrollments and year_summary', () => {
    assert.match(content, /from\(\s*["']enrollments["']\s*\)/);
    assert.match(content, /from\(\s*["']year_summary["']\s*\)/);
  });

  await t.test('3. Mobile-First Bottom Sheet uses createPortal and safe area padding', () => {
    assert.match(content, /import\s+.*createPortal.*from\s+["']react-dom["']/);
    assert.match(content, /createPortal\(/);
    assert.match(content, /pb-\[max\(1\.25rem,env\(safe-area-inset-bottom\)\)\]/);
  });

  await t.test('4. Year trigger and sheet items adhere to touch target size >= 44px on mobile', () => {
    // Mobile bottom sheet items have min-h-[54px]
    assert.match(content, /min-h-\[54px\]/);
    // Close button has min-h-[44px] min-w-[44px]
    assert.match(content, /min-h-\[44px\]\s+min-w-\[44px\]/);
  });

  await t.test('5. Desktop popover is implemented with useDismissableDropdown and hidden on mobile', () => {
    assert.match(content, /function\s+useDismissableDropdown/);
    assert.match(content, /hidden\s+sm:block/);
  });

  await t.test('6. Synchronizes with URL query param nam_hoc', () => {
    assert.match(content, /searchParams\.get\(\s*["']nam_hoc["']\s*\)/);
    assert.match(content, /next\.set\(\s*["']nam_hoc["']/);
  });

  await t.test('7. Provides archive notice banner when viewing a past academic year with quick-return button', () => {
    assert.match(content, /namHoc\s*!==\s*defaultNamHoc/);
    assert.match(content, /Đang xem kết quả lưu trữ của/);
    assert.match(content, /Quay lại năm hiện tại/);
  });

  await t.test('8. 100% REM compliant - zero text-[...px] violations', () => {
    const hardcodedPxMatches = content.match(/text-\[\d+px\]/g);
    assert.equal(
      hardcodedPxMatches,
      null,
      `Found hardcoded pixel font sizes: ${hardcodedPxMatches?.join(', ')}`
    );
  });

  await t.test('9. Year trigger button achieves touch target min-h-[44px]', () => {
    assert.match(
      content,
      /aria-label=\{`Chọn niên khóa[\s\S]*?min-h-\[44px\]/,
      'Year trigger button must have min-h-[44px] for mobile accessibility'
    );
  });

  await t.test('10. Class name and subtitle are NEVER truncated', () => {
    // Assert h2 heading contains class name without truncate class
    assert.match(content, /<h2[^>]*font-bold[^>]*>\s*\{lop !== "—"/);
    assert.doesNotMatch(content, /<h2[^>]*truncate[^>]*>\s*\{lop !== "—"/, 'Class name h2 must not have truncate class');
  });

  await t.test('11. Balanced 2-Tier stacked structure with clean visual separation', () => {
    assert.match(content, /border-t\s+border-\[#dedfd4\]\/60/);
    assert.match(content, /role="tablist"/);
  });
});
