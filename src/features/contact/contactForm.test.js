import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePhone, validateContact, buildContactPayload } from './contactForm.js';
const valid = { hoTen: '  Người kiểm thử  ', sdt: '+84 905-123-456', chuDe: 'Tuyển sinh', noiDung: '  Xin hướng dẫn đăng ký học.  ' };
test('normalizes domestic and international formatting', () => {
  assert.equal(normalizePhone('+84 905-123-456'), '0905123456');
  assert.equal(normalizePhone('0905.123.456'), '0905123456');
  assert.deepEqual(validateContact(valid), {});
});
test('rejects invalid phone characters, length, and missing fields', () => {
  for (const sdt of ['0|12345678', '090512345', '09051234567', '+1 905123456', 'abcdefghij']) {
    assert.ok(validateContact({ ...valid, sdt }).sdt);
  }
  assert.deepEqual(Object.keys(validateContact({ hoTen: ' ', sdt: '', chuDe: '', noiDung: ' ' })), ['hoTen', 'sdt', 'chuDe', 'noiDung']);
});
test('rejects unsupported topics and oversized text', () => {
  assert.ok(validateContact({ ...valid, chuDe: 'Invalid' }).chuDe);
  assert.ok(validateContact({ ...valid, hoTen: 'a'.repeat(101) }).hoTen);
  assert.ok(validateContact({ ...valid, noiDung: 'a'.repeat(2001) }).noiDung);
});
test('keeps the existing RPC payload and includes topic for the admin inbox', () => {
  assert.deepEqual(buildContactPayload(valid), { hoTen: 'Người kiểm thử', sdt: '0905123456', noiDung: '[Chủ đề: Tuyển sinh]\nXin hướng dẫn đăng ký học.' });
});
