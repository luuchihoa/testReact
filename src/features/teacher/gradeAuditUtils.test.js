import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  AUDIT_FIELD_CONFIG,
  AUDITABLE_FIELDS,
  formatAuditDateTime,
  formatFieldAuditEntry,
  mergeAuditWithAllFields,
  formatActorDisplay,
} from "./gradeAuditUtils.js";

describe("gradeAuditUtils - Per-Column Audit", () => {
  describe("AUDITABLE_FIELDS", () => {
    it("contains exactly the 6 auditable fields and excludes diem_tb", () => {
      assert.deepEqual(AUDITABLE_FIELDS, [
        "diem_mieng",
        "diem_15_phut",
        "diem_1_tiet",
        "diem_thi",
        "diem_vo",
        "ghi_chu",
      ]);
      assert.equal(AUDITABLE_FIELDS.includes("diem_tb"), false);
      assert.equal(AUDIT_FIELD_CONFIG.diem_tb, undefined);
    });
  });

  describe("formatFieldAuditEntry", () => {
    it("returns null for null log", () => {
      assert.equal(formatFieldAuditEntry(null), null);
    });

    it("formats new score insertion", () => {
      const log = {
        field_name: "diem_mieng",
        operation: "insert",
        old_value: null,
        new_value: "8.5",
        changed_by: "glv_a",
        changed_by_name: "Giuse Nguyễn Văn A",
        changed_by_role: "teacher",
        changed_at: "2026-09-18T10:00:00Z",
      };
      const formatted = formatFieldAuditEntry(log);
      assert.equal(formatted.field, "diem_mieng");
      assert.equal(formatted.label, "Miệng");
      assert.equal(formatted.oldValue, null);
      assert.equal(formatted.newValue, "8.5");
      assert.equal(formatted.diffText, "Nhập mới");
      assert.equal(formatted.diffNumber, null);
    });

    it("formats score update with positive diff", () => {
      const log = {
        field_name: "diem_mieng",
        operation: "update",
        old_value: "5",
        new_value: "6.5",
        changed_by: "glv_a",
      };
      const formatted = formatFieldAuditEntry(log);
      assert.equal(formatted.diffNumber, 1.5);
      assert.equal(formatted.diffText, "+1.5");
    });

    it("formats score update with negative diff", () => {
      const log = {
        field_name: "diem_1_tiet",
        operation: "update",
        old_value: "8",
        new_value: "7",
      };
      const formatted = formatFieldAuditEntry(log);
      assert.equal(formatted.diffNumber, -1);
      assert.equal(formatted.diffText, "-1");
    });

    it("formats note change", () => {
      const log = {
        field_name: "ghi_chu",
        operation: "update",
        old_value: "Ngoan",
        new_value: "Cần cố gắng",
      };
      const formatted = formatFieldAuditEntry(log);
      assert.equal(formatted.type, "text");
      assert.equal(formatted.diffText, "Sửa ghi chú");
    });
  });

  describe("mergeAuditWithAllFields", () => {
    it("returns all 6 columns even when some or all are unmodified", () => {
      const rawLogs = [
        {
          field_name: "diem_mieng",
          operation: "update",
          old_value: "5",
          new_value: "6",
          changed_by: "glv_a",
          changed_by_name: "Giuse Nguyễn Văn A",
          changed_by_role: "teacher",
        },
      ];

      const merged = mergeAuditWithAllFields(rawLogs);
      assert.equal(merged.length, 6);

      const mieng = merged.find((f) => f.field === "diem_mieng");
      assert.equal(mieng.isModified, true);
      assert.equal(mieng.newValue, "6");

      const vo = merged.find((f) => f.field === "diem_vo");
      assert.equal(vo.isModified, false);
      assert.equal(vo.diffText, "Chưa sửa");
    });
  });

  describe("formatActorDisplay", () => {
    it("formats GLV display", () => {
      const log = {
        changed_by_name: "Giuse Nguyễn Văn A",
        changed_by_role: "teacher",
      };
      assert.equal(formatActorDisplay(log, false), "GLV. Giuse Nguyễn Văn A");
    });

    it("formats Admin display with username for admin viewers", () => {
      const log = {
        changed_by_name: "Phêrô Lê Hoàng",
        changed_by: "admin_le",
        changed_by_role: "admin",
      };
      assert.equal(
        formatActorDisplay(log, true),
        "Ban Quản trị — Phêrô Lê Hoàng (@admin_le)"
      );
    });

    it("formats fallback when no name", () => {
      const log = { changed_by: "user_deleted" };
      assert.equal(
        formatActorDisplay(log, false),
        "Tài khoản đã ngừng hoạt động (user_deleted)"
      );
    });
  });

  describe("formatAuditDateTime", () => {
    it("formats valid ISO string", () => {
      const formatted = formatAuditDateTime("2026-09-18T10:30:00Z");
      assert.ok(formatted.includes("2026"));
      assert.ok(formatted.includes(":"));
    });

    it("returns empty string for null", () => {
      assert.equal(formatAuditDateTime(null), "");
    });
  });
});
