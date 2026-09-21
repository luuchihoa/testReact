import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Contact Page Design & Standards Compliance (AGENTS.md v1.1)', () => {
  const jsxPath = path.resolve(__dirname, 'Contact.jsx');
  const cssPath = path.resolve(__dirname, 'Contact.css');

  const jsxContent = fs.readFileSync(jsxPath, 'utf-8');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');

  it('1. Zero hardcoded inline fontSize in Contact.jsx', () => {
    assert.doesNotMatch(
      jsxContent,
      /fontSize:\s*["'][0-9.]+px["']/,
      'Contact.jsx không được chứa inline style fontSize dạng px cứng'
    );
  });

  it('2. 100% REM standard in Contact.css (Zero font-size in px)', () => {
    const fontSizePxRegex = /font-size:\s*[0-9.]+px/gi;
    const matches = cssContent.match(fontSizePxRegex) || [];
    assert.deepEqual(
      matches,
      [],
      `Contact.css chứa font-size dạng px cứng vi phạm chuẩn REM: ${matches.join(', ')}`
    );

    // Also check clamp with px inside font-size
    const clampPxRegex = /font-size:\s*clamp\([^)]*px[^)]*\)/gi;
    const clampMatches = cssContent.match(clampPxRegex) || [];
    assert.deepEqual(
      clampMatches,
      [],
      `Contact.css chứa clamp(px) trong font-size: ${clampMatches.join(', ')}`
    );
  });

  it('3. Zero font-size < 0.75rem in Contact.css (Tối thiểu 0.75rem text-xs)', () => {
    const subRemRegex = /font-size:\s*0\.(?:[0-6][0-9]*|7[0-4][0-9]*)rem/gi;
    const subRemMatches = cssContent.match(subRemRegex) || [];
    assert.deepEqual(
      subRemMatches,
      [],
      `Contact.css chứa font-size < 0.75rem (12px) không đạt chuẩn: ${subRemMatches.join(', ')}`
    );
  });

  it('4. WCAG AAA Contrast Tokens for Light Mode and Dark Mode', () => {
    // Light mode tokens
    assert.match(cssContent, /--c-muted:\s*#4d5b4e;/, 'Light mode --c-muted phải là #4d5b4e (≥7.0:1 AAA)');
    assert.match(cssContent, /--c-accent-text:\s*#5e4420;/, 'Light mode --c-accent-text phải là #5e4420 (≥7.0:1 AAA)');

    // Dark mode tokens
    assert.match(cssContent, /--c-muted:\s*#b0b9ac;/, 'Dark mode --c-muted phải là #b0b9ac (≥7.0:1 AAA)');
    assert.match(cssContent, /--c-accent-text:\s*#d4b47d;/, 'Dark mode --c-accent-text phải là #d4b47d (≥7.0:1 AAA)');
  });

  it('5. Touch targets for interactive controls >= 44px', () => {
    assert.match(cssContent, /\.contact-copy\s*\{[^}]*min-width:\s*44px/s, '.contact-copy phải có min-width >= 44px');
    assert.match(cssContent, /\.contact-copy\s*\{[^}]*min-height:\s*44px/s, '.contact-copy phải có min-height >= 44px');
    assert.match(cssContent, /\.contact-link\s*\{[^}]*min-height:\s*44px/s, '.contact-link phải có min-height >= 44px');
    assert.match(cssContent, /\.contact-button\s*\{[^}]*min-height:\s*48px/s, '.contact-button phải có min-height >= 48px');
  });

  it('6. Form inputs formatted for mobile-first with font-size >= 1rem', () => {
    assert.match(
      cssContent,
      /\.contact-form-panel\s*:is\(input,\s*textarea,\s*select\)\s*\{[^}]*font-size:\s*1rem/s,
      'Ô nhập form phải có font-size 1rem để chống auto-zoom trên iOS'
    );
  });

  it('7. iOS Safe Area and Reduced Motion Handling', () => {
    assert.match(cssContent, /safe-area-inset-bottom/, 'Contact.css phải xử lý safe-area-inset-bottom');
    assert.match(cssContent, /@media\s*\(prefers-reduced-motion:\s*reduce\)/, 'Contact.css phải có media query prefers-reduced-motion');
  });

  it('8. Dark mode aria-invalid input border achieves >= 3.0:1 contrast', () => {
    assert.match(
      cssContent,
      /\.dark\s+\.contact-form-panel\s+\[aria-invalid=["']true["']\]\s*\{[^}]*border-color:\s*#f87171/s,
      'Dark mode [aria-invalid="true"] phải có viền nổi bật #f87171 (>= 3.0:1)'
    );
  });

  it('9. Draft autosave & restore via localStorage is fully implemented', () => {
    assert.match(jsxContent, /gl_anngai_contact_draft/, 'Phải định nghĩa key lưu nháp gl_anngai_contact_draft');
    assert.match(jsxContent, /localStorage\.getItem/, 'Phải có logic đọc bản nháp từ localStorage');
    assert.match(jsxContent, /localStorage\.setItem/, 'Phải có logic tự động ghi bản nháp vào localStorage');
    assert.match(jsxContent, /contact-draft-banner/, 'Phải có banner thông báo đã khôi phục bản nháp');
    assert.match(jsxContent, /contact-draft-clear/, 'Phải có nút xóa nháp để người dùng bắt đầu lại');
  });

  it('10. Catholic liturgical and organization terminology compliance', () => {
    assert.doesNotMatch(jsxContent, /Trưởng Trang/, 'Tuyệt đối không dùng danh xưng không chuẩn "Trưởng Trang"');
    assert.match(jsxContent, /Trưởng ban Giáo lý/, 'Dùng đúng danh xưng phụng vụ: Trưởng ban Giáo lý');
    assert.match(jsxContent, /HTDC Xứ đoàn Mẹ Mân Côi/, 'Dùng đúng danh xưng phong trào: HTDC Xứ đoàn Mẹ Mân Côi');
  });

  it('11. Liturgical hours synchronization with parochial data', () => {
    assert.match(jsxContent, /Thánh lễ & Giờ học Giáo lý/, 'Chúa Nhật phải ghi "Thánh lễ & Giờ học Giáo lý"');
    assert.match(jsxContent, /17:30 – 20:30/, 'Thứ Bảy phải đồng bộ thời gian chiều tối 17:30 – 20:30');
    assert.doesNotMatch(jsxContent, /08:00 – 11:30.*Sinh hoạt nhóm/, 'Không giữ lịch Thứ Bảy cũ 08:00 – 11:30 mâu thuẫn');
  });

  it('12. Mobile typography & layout resilience for phone cards and hours', () => {
    assert.match(
      cssContent,
      /\.contact-phone-number\s*\{[^}]*font-size:\s*clamp\(/s,
      'Số điện thoại phải dùng clamp() để không bị tràn trên màn hình 320px'
    );
    assert.match(
      cssContent,
      /\.contact-hours-row\s*\{[^}]*flex-wrap:\s*wrap/s,
      '.contact-hours-row phải có flex-wrap: wrap chống đè chữ khi tăng cỡ chữ'
    );
  });

  it('13. Grid container blowout prevention with minmax(0, 1fr)', () => {
    assert.match(
      cssContent,
      /\.contact-form-row\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s,
      '.contact-form-row phải dùng minmax(0, 1fr) để chống tràn layout'
    );
    assert.match(
      cssContent,
      /\.contact-main\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s,
      '.contact-main phải dùng minmax(0, 1fr) để chống tràn layout trên mobile'
    );
    assert.match(
      cssContent,
      /\.contact-shell\s*\{[^}]*min-width:\s*0/s,
      '.contact-shell phải có min-width: 0 để chống tràn container'
    );
    assert.match(
      cssContent,
      /\.contact-form-panel\s*\{[^}]*min-width:\s*0/s,
      '.contact-form-panel phải có min-width: 0'
    );
  });

  it('14. URL SearchParams chuDe support and inline retry button', () => {
    assert.match(jsxContent, /useSearchParams/, 'Contact.jsx phải dùng useSearchParams để đọc query');
    assert.match(jsxContent, /searchParams\.get\(["']chuDe["']\)/, 'Form phải nhận tham số chuDe');
    assert.match(jsxContent, /contact-retry-btn/, 'Phải có nút Thử lại ngay khi gặp lỗi mạng');
  });

  it('15. Hero Quick Action Bar with touch targets >= 44px', () => {
    assert.match(jsxContent, /contact-hero-actions/, 'Contact.jsx phải có cụm contact-hero-actions');
    assert.match(cssContent, /\.contact-hero-pill\s*\{[^}]*min-height:\s*44px/s, 'Pill actions phải có min-height >= 44px');
  });

  it('16. Form Suggestion Chips for frictionless mobile input', () => {
    assert.match(jsxContent, /contact-suggestions-wrap/, 'Contact.jsx phải có container contact-suggestions-wrap');
    assert.match(jsxContent, /SUGGESTIONS\.map/, 'Form phải render danh sách gợi ý SUGGESTIONS');
    assert.match(cssContent, /\.contact-suggestion-chip\s*\{[^}]*min-height:\s*44px/s, 'Suggestion chip phải có min-height >= 44px');
  });

  it('17. Desktop sticky sidebar for balanced bento layout', () => {
    assert.match(
      cssContent,
      /\.contact-channels\s*\{[^}]*position:\s*sticky;[^}]*top:\s*96px/s,
      '.contact-channels phải có position: sticky và top: 96px trên desktop'
    );
  });

  it('18. Live Liturgical status card and FAQ category badges with rotating chevron', () => {
    assert.match(jsxContent, /contact-liturgy-banner/, 'Phải có banner trạng thái phụng vụ hôm nay');
    assert.match(jsxContent, /contact-faq-cat/, 'FAQ phải có nhãn danh mục contact-faq-cat');
    assert.match(cssContent, /\.contact-faq-chevron-open\s*\{[^}]*transform:\s*rotate\(180deg\)/s, 'Chevron FAQ phải xoay 180deg khi mở');
  });

  it('19. Desktop button hover micro-interactions: zero tacky underline on buttons, cards, or pills', () => {
    assert.doesNotMatch(
      cssContent,
      /\.contact-page\s+a:hover\s*\{[^}]*text-decoration:\s*underline/s,
      'Tuyệt đối không dùng bộ chọn toàn trang .contact-page a:hover gây gạch chân nút bấm'
    );
    assert.match(
      cssContent,
      /\.contact-hero-pill:hover\s*\{[^}]*text-decoration:\s*none;[^}]*transform:\s*translateY\(-2px\)/s,
      'Hero pill hover phải có text-decoration: none và nâng nhẹ translateY(-2px)'
    );
    assert.match(
      cssContent,
      /\.contact-button:hover\s*\{[^}]*text-decoration:\s*none;[^}]*transform:\s*translateY\(-2px\)/s,
      'Nút bấm chính hover phải có text-decoration: none và nâng nhẹ translateY(-2px)'
    );
    assert.match(
      cssContent,
      /\.contact-enrollment:hover\s*\{[^}]*text-decoration:\s*none;[^}]*transform:\s*translateY\(-2px\)/s,
      'Thẻ tuyển sinh hover phải có text-decoration: none và nâng nhẹ translateY(-2px)'
    );
  });

  it('20. Mobile UI optimization: 2x2 grid hero actions, horizontal swipe suggestions, and column FAQ wrap', () => {
    assert.match(
      cssContent,
      /\.contact-hero-actions\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*1fr\)/s,
      'Hero actions phải là grid 2 cột cân đối trên mobile'
    );
    assert.match(
      cssContent,
      /\.contact-suggestions-list\s*\{[^}]*overflow-x:\s*auto;[^}]*scroll-snap-type:\s*x mandatory/s,
      'Gợi ý câu hỏi phải là dải vuốt ngang 1 hàng scroll-snap trên mobile'
    );
    assert.match(
      cssContent,
      /@media\s*\(max-width:\s*520px\)\s*\{[^}]*\.contact-faq-question-wrap\s*\{[^}]*flex-direction:\s*column/s,
      'FAQ question wrap phải chuyển thành flex-direction: column trên mobile <= 520px'
    );
  });
});
