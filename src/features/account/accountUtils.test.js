import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  normalizeSemester, 
  normalizeNotificationLink, 
  getCurrentSemester 
} from './utils.js';

test('normalizeSemester correctly parses various semester inputs', () => {
  // Semester 1
  assert.equal(normalizeSemester('1'), 'HK1');
  assert.equal(normalizeSemester('HK1'), 'HK1');
  assert.equal(normalizeSemester('hk1'), 'HK1');
  assert.equal(normalizeSemester('I'), 'HK1');
  assert.equal(normalizeSemester('hoc_ky_1'), 'HK1');
  assert.equal(normalizeSemester('ky_1'), 'HK1');

  // Semester 2
  assert.equal(normalizeSemester('2'), 'HK2');
  assert.equal(normalizeSemester('HK2'), 'HK2');
  assert.equal(normalizeSemester('hk2'), 'HK2');
  assert.equal(normalizeSemester('II'), 'HK2');
  assert.equal(normalizeSemester('hoc_ky_2'), 'HK2');
  assert.equal(normalizeSemester('ky_2'), 'HK2');

  // Full Year
  assert.equal(normalizeSemester('NAM'), 'NAM');
  assert.equal(normalizeSemester('nam'), 'NAM');
  assert.equal(normalizeSemester('ca_nam'), 'NAM');
  assert.equal(normalizeSemester('all'), 'NAM');
  assert.equal(normalizeSemester('year'), 'NAM');

  // Invalid / Null
  assert.equal(normalizeSemester(null), null);
  assert.equal(normalizeSemester(''), null);
  assert.equal(normalizeSemester('abc'), null);
});

test('normalizeNotificationLink rewrites legacy and query params to standard account routes', () => {
  // Legacy paths
  assert.equal(
    normalizeNotificationLink('/ket-qua-hoc-tap?hoc_ky=2'),
    '/tài-khoản/thành-tích?ky=HK2'
  );
  assert.equal(
    normalizeNotificationLink('/thanh-tich?ky=2'),
    '/tài-khoản/thành-tích?ky=HK2'
  );
  assert.equal(
    normalizeNotificationLink('/thành-tích?semester=1'),
    '/tài-khoản/thành-tích?ky=HK1'
  );
  assert.equal(
    normalizeNotificationLink('/tài-khoản/thành-tích?ky=HK2'),
    '/tài-khoản/thành-tích?ky=HK2'
  );
  assert.equal(
    normalizeNotificationLink('/tài-khoản/thành-tích?ky=2'),
    '/tài-khoản/thành-tích?ky=HK2'
  );
  assert.equal(
    normalizeNotificationLink('/tài-khoản/thành-tích?hoc_ky=1'),
    '/tài-khoản/thành-tích?ky=HK1'
  );
  assert.equal(
    normalizeNotificationLink('/tài-khoản/thành-tích?ky=nam'),
    '/tài-khoản/thành-tích?ky=NAM'
  );

  // Other account routes
  assert.equal(
    normalizeNotificationLink('/tai-khoan/hồ-sơ'),
    '/tài-khoản/hồ-sơ'
  );
});

test('normalizeNotificationLink infers target from notification object when link is empty', () => {
  const notifDiemHk2 = {
    type: 'diem',
    title: 'Điểm học kỳ 2 đã cập nhật',
    message: 'Điểm thi: 9.5 · Điểm trung bình: 9.0'
  };
  assert.equal(
    normalizeNotificationLink('', notifDiemHk2),
    '/tài-khoản/thành-tích?ky=HK2'
  );

  const notifTongKetNam = {
    type: 'tong_ket_nam',
    title: 'Tổng kết cả năm đã cập nhật',
    message: 'Học lực cả năm: Giỏi'
  };
  assert.equal(
    normalizeNotificationLink(null, notifTongKetNam),
    '/tài-khoản/thành-tích?ky=NAM'
  );
});

test('getCurrentSemester evaluates correctly based on academic calendar dates', () => {
  // October 15, 2026 -> HK1
  assert.equal(getCurrentSemester(new Date(2026, 9, 15)), 'HK1');

  // February 15, 2027 -> HK2
  assert.equal(getCurrentSemester(new Date(2027, 1, 15)), 'HK2');

  // May 20, 2027 -> HK2
  assert.equal(getCurrentSemester(new Date(2027, 4, 20)), 'HK2');
});
