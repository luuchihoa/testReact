import test from 'node:test';
import assert from 'node:assert/strict';
import { getProfileChangesDiff, formatFieldValue } from './utils.js';

test('getProfileChangesDiff detects changed fields correctly', () => {
  const current = {
    ho_va_ten: 'Nguyễn Văn A',
    ten_thanh: 'Maria',
    ngay_sinh: '2014-04-12',
    gioi_tinh: 'Nam',
    sdt: '0905123456',
    giao_xom: 'Giáo họ 1',
  };

  const proposed = {
    ho_va_ten: 'Nguyễn Văn A',
    ten_thanh: 'Têrêsa', // changed
    ngay_sinh: '2014-04-15', // changed
    gioi_tinh: 'Nam',
    sdt: '0905123456',
    giao_xom: 'Giáo họ 2', // changed
  };

  const diffs = getProfileChangesDiff(current, proposed);
  assert.equal(diffs.length, 3);

  const tenThanhDiff = diffs.find((d) => d.key === 'ten_thanh');
  assert.ok(tenThanhDiff);
  assert.equal(tenThanhDiff.label, 'Tên Thánh');
  assert.equal(tenThanhDiff.oldDisplay, 'Maria');
  assert.equal(tenThanhDiff.newDisplay, 'Têrêsa');

  const ngaySinhDiff = diffs.find((d) => d.key === 'ngay_sinh');
  assert.ok(ngaySinhDiff);
  assert.equal(ngaySinhDiff.label, 'Ngày sinh');
  assert.equal(ngaySinhDiff.oldDisplay, '12/04/2014');
  assert.equal(ngaySinhDiff.newDisplay, '15/04/2014');

  const giaoXomDiff = diffs.find((d) => d.key === 'giao_xom');
  assert.ok(giaoXomDiff);
  assert.equal(giaoXomDiff.label, 'Giáo Xóm');
  assert.equal(giaoXomDiff.oldDisplay, 'Giáo họ 1');
  assert.equal(giaoXomDiff.newDisplay, 'Giáo họ 2');
});

test('getProfileChangesDiff ignores identical values and trims whitespace', () => {
  const current = {
    ho_va_ten: 'Nguyễn Văn A',
    sdt: '0905123456',
  };
  const proposed = {
    ho_va_ten: ' Nguyễn Văn A ',
    sdt: '0905123456',
  };

  const diffs = getProfileChangesDiff(current, proposed);
  assert.equal(diffs.length, 0);
});

test('formatFieldValue formats empty, text, and date values correctly', () => {
  assert.equal(formatFieldValue(null), '—');
  assert.equal(formatFieldValue(''), '—');
  assert.equal(formatFieldValue('Gia đình'), 'Gia đình');
  assert.equal(formatFieldValue('2015-08-20', 'date'), '20/08/2015');
});

test('getProfileChangesDiff accurately handles camelCase and single field name change', () => {
  const currentSaved = {
    username: 'em_an',
    hoTen: 'Nguyễn Văn A',
    tenThanh: 'Phêrô',
    ngaySinh: '2012-05-10',
    gioiTinh: 'Nam',
    sdt: '0901234567',
    giaoXom: 'Xóm 1',
  };

  // User only changed hoTen
  const proposedEdited = {
    ...currentSaved,
    hoTen: 'Nguyễn Văn B',
  };

  const diffs = getProfileChangesDiff(currentSaved, proposedEdited);
  assert.equal(diffs.length, 1);
  assert.equal(diffs[0].key, 'ho_va_ten');
  assert.equal(diffs[0].label, 'Họ và tên');
  assert.equal(diffs[0].oldDisplay, 'Nguyễn Văn A');
  assert.equal(diffs[0].newDisplay, 'Nguyễn Văn B');
});

test('getProfileChangesDiff handles partial proposed object (only 1 field provided)', () => {
  const currentInDB = {
    ho_va_ten: 'Nguyễn Văn A',
    ten_thanh: 'Phêrô',
    ngay_sinh: '2012-05-10',
    gioi_tinh: 'Nam',
  };

  const partialProposed = {
    ho_va_ten: 'Nguyễn Văn B',
  };

  const diffs = getProfileChangesDiff(currentInDB, partialProposed);
  assert.equal(diffs.length, 1);
  assert.equal(diffs[0].key, 'ho_va_ten');
  assert.equal(diffs[0].oldDisplay, 'Nguyễn Văn A');
  assert.equal(diffs[0].newDisplay, 'Nguyễn Văn B');
});

test('getProfileChangesDiff correctly parses stringified JSON and nested p_changes wrappers', () => {
  const current = JSON.stringify({
    ho_va_ten: 'Nguyễn Văn A',
    sdt: '0901234567',
  });

  const proposed = JSON.stringify({
    p_changes: {
      ho_va_ten: 'Nguyễn Văn C',
      sdt: '0901234567',
    },
  });

  const diffs = getProfileChangesDiff(current, proposed);
  assert.equal(diffs.length, 1);
  assert.equal(diffs[0].key, 'ho_va_ten');
  assert.equal(diffs[0].oldDisplay, 'Nguyễn Văn A');
  assert.equal(diffs[0].newDisplay, 'Nguyễn Văn C');
});

test('getProfileChangesDiff ignores date variations between ISO strings and YYYY-MM-DD', () => {
  const current = {
    ngay_sinh: '2014-04-12T00:00:00.000Z',
  };

  const proposed = {
    ngay_sinh: '2014-04-12',
  };

  const diffs = getProfileChangesDiff(current, proposed);
  assert.equal(diffs.length, 0); // They are identical dates
});

test('getProfileChangesDiff handles empty/null proposed_data gracefully', () => {
  const current = { ho_va_ten: 'Nguyễn Văn A' };
  assert.deepEqual(getProfileChangesDiff(current, null), []);
  assert.deepEqual(getProfileChangesDiff(current, {}), []);
  assert.deepEqual(getProfileChangesDiff(current, 'invalid json string'), []);
});

