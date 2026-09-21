import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanAndTruncateMainContent } from './useDailyLiturgy.js';
import { getLiturgicalCycles, mergeLiturgyRowsForKey } from '../../utils/liturgyContentResolver.js';

test('cleanAndTruncateMainContent: loại bỏ thẻ HTML, số câu Kinh Thánh và cắt độ dài hợp lý', () => {
  assert.equal(cleanAndTruncateMainContent(''), '');
  assert.equal(cleanAndTruncateMainContent(null), '');

  const rawHtml = '<p>« 1 Chúa Giêsu nói với họ: 2 "Thầy là sự sống lại và là sự sống." »</p>';
  const cleaned = cleanAndTruncateMainContent(rawHtml, 100);
  assert.equal(cleaned.includes('<p>'), false);
  assert.equal(cleaned.includes('«'), false);
  assert.equal(cleaned.includes('»'), false);
  assert.ok(cleaned.includes('Thầy là sự sống lại và là sự sống'));

  const longText = 'Đây là một đoạn văn bản rất dài được dùng để kiểm tra tính năng cắt gọn trích dẫn Kinh Thánh trên trang chủ sao cho không làm vỡ layout của thẻ Lời Chúa hàng ngày.';
  const truncated = cleanAndTruncateMainContent(longText, 50);
  assert.ok(truncated.length <= 55);
  assert.ok(truncated.endsWith('...'));
});

test('getLiturgicalCycles: trả về chu kỳ năm phụng vụ chính xác', () => {
  const cycle2024 = getLiturgicalCycles(2024);
  assert.equal(cycle2024.weekdayCycle, 'II');
  
  const cycle2025 = getLiturgicalCycles(2025);
  assert.equal(cycle2025.weekdayCycle, 'I');
});

test('mergeLiturgyRowsForKey: hợp nhất dữ liệu phụng vụ đúng ưu tiên chu kỳ', () => {
  const rows = [
    { liturgy_key: 'ot_week_1_sun', cycle: 'C', title: 'Chúa Nhật I Thường Niên C', quote: 'Đây là Con Ta yêu dấu' },
    { liturgy_key: 'ot_week_1_sun', cycle: 'all', title: 'Chúa Nhật I Thường Niên', gospel_ref: 'Mt 3, 13-17' }
  ];

  const merged = mergeLiturgyRowsForKey(rows, 'ot_week_1_sun', { sundayCycle: 'C', weekdayCycle: 'II' });
  assert.equal(merged.title, 'Chúa Nhật I Thường Niên C');
  assert.equal(merged.quote, 'Đây là Con Ta yêu dấu');
  assert.equal(merged.gospel_ref, 'Mt 3, 13-17');
});
