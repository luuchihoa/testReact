import test from 'node:test';
import assert from 'node:assert/strict';
import { denormalizeStudent, normalizeStudent, formatHanhKiem, formatRank } from './studentSharedUtils.js';

test('denormalizeStudent accurately maps all camelCase fields to snake_case DB columns including ngay_them_suc', () => {
  const uiStudent = {
    tenThanh: 'Maria',
    hoTen: 'Nguyễn Thị Hoa',
    ngaySinh: '2012-05-15',
    ngayRuaToi: '2012-06-01',
    ngayRuocLe: '2020-05-20',
    ngayThemSuc: '2024-06-10',
    tenCha: 'Giuse Nguyễn Văn A',
    tenMe: 'Anna Lê Thị B',
    sdt: '0901234567',
    giaoXom: 'Xóm 3',
    gioiTinh: 'Nữ',
  };

  const dbPayload = denormalizeStudent(uiStudent);

  assert.deepEqual(dbPayload, {
    ten_thanh: 'Maria',
    ho_va_ten: 'Nguyễn Thị Hoa',
    ngay_sinh: '2012-05-15',
    ngay_rua_toi: '2012-06-01',
    ngay_ruoc_le: '2020-05-20',
    ngay_them_suc: '2024-06-10',
    ten_cha: 'Giuse Nguyễn Văn A',
    ten_me: 'Anna Lê Thị B',
    sdt: '0901234567',
    giao_xom: 'Xóm 3',
    gioi_tinh: 'Nữ',
  });

  // Ensure no camelCase properties remain in the DB payload
  assert.equal(dbPayload.ngayThemSuc, undefined);
  assert.equal(dbPayload.hoTen, undefined);
  assert.equal(dbPayload.tenThanh, undefined);
});

test('normalizeStudent correctly parses raw DB object to UI student shape', () => {
  const rawDB = {
    username: 'maria.hoa',
    ten_thanh: 'Maria',
    ho_va_ten: 'Nguyễn Thị Hoa',
    ngay_sinh: '2012-05-15',
    ngay_rua_toi: '2012-06-01',
    ngay_ruoc_le: '2020-05-20',
    ngay_them_suc: '2024-06-10',
    ten_cha: 'Giuse Nguyễn Văn A',
    ten_me: 'Anna Lê Thị B',
    sdt: '0901234567',
    giao_xom: 'Xóm 3',
    gioi_tinh: 'Nữ',
    avatar: 'https://example.com/avatar.jpg',
    role: 'student',
    trang_thai: 'Đang học',
  };

  const ui = normalizeStudent(rawDB);
  assert.equal(ui.username, 'maria.hoa');
  assert.equal(ui.tenThanh, 'Maria');
  assert.equal(ui.hoTen, 'Nguyễn Thị Hoa');
  assert.equal(ui.ngayThemSuc, '2024-06-10');
  assert.equal(ui.gioiTinh, 'Nữ');
});

test('formatHanhKiem and formatRank normalize Trung Bình <-> TB properly', () => {
  assert.equal(formatHanhKiem('TB'), 'TB');
  assert.equal(formatHanhKiem('Trung Bình'), 'TB');
  assert.equal(formatHanhKiem('Tốt'), 'Tốt');
  assert.equal(formatHanhKiem(''), '—');
  assert.equal(formatHanhKiem(null), '—');

  assert.equal(formatRank('TB'), 'TB');
  assert.equal(formatRank('Trung Bình'), 'TB');
  assert.equal(formatRank('Giỏi'), 'Giỏi');
});

test('normalizeStudent and denormalizeStudent handle isProfileLocked, profileLockedBy, profileLockedAt', () => {
  const rawDB = {
    username: 'maria.hoa',
    is_profile_locked: true,
    profile_locked_by: 'gv.nguyenvana',
    profile_locked_at: '2026-09-16T07:00:00.000Z',
  };

  const ui = normalizeStudent(rawDB);
  assert.equal(ui.isProfileLocked, true);
  assert.equal(ui.profileLockedBy, 'gv.nguyenvana');
  assert.equal(ui.profileLockedAt, '2026-09-16T07:00:00.000Z');

  const payload = denormalizeStudent({
    hoTen: 'Nguyễn Thị Hoa',
    isProfileLocked: true,
    profileLockedBy: 'gv.nguyenvana',
    profileLockedAt: '2026-09-16T07:00:00.000Z',
  });
  assert.equal(payload.is_profile_locked, true);
  assert.equal(payload.profile_locked_by, 'gv.nguyenvana');
  assert.equal(payload.profile_locked_at, '2026-09-16T07:00:00.000Z');
});

