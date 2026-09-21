/**
 * Helper utilities cho việc tính toán Diff lịch sử điểm theo từng cột,
 * định dạng thời gian và định dạng danh tính người sửa điểm.
 * Thuần JS (Pure Functions) - Dễ kiểm thử tự động.
 */

export const AUDIT_FIELD_CONFIG = {
  diem_mieng: { label: "Miệng", fullLabel: "Điểm Miệng", order: 1 },
  diem_15_phut: { label: "15 Phút", fullLabel: "Điểm 15 Phút", order: 2 },
  diem_1_tiet: { label: "1 Tiết", fullLabel: "Điểm 1 Tiết", order: 3 },
  diem_thi: { label: "Thi HK", fullLabel: "Điểm Thi Học Kỳ", order: 4 },
  diem_vo: { label: "Vở", fullLabel: "Điểm Vở", order: 5 },
  ghi_chu: { label: "Ghi chú", fullLabel: "Ghi Chú", order: 6 },
};

export const AUDITABLE_FIELDS = [
  "diem_mieng",
  "diem_15_phut",
  "diem_1_tiet",
  "diem_thi",
  "diem_vo",
  "ghi_chu",
];

/**
 * Định dạng thời gian theo múi giờ Việt Nam (Asia/Ho_Chi_Minh)
 * Chuẩn quốc tế Intl, không ghép chuỗi thứ/ngày thủ công.
 */
export function formatAuditDateTime(isoString) {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return String(isoString);

    const formatter = new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour12: false,
    });

    return formatter.format(date);
  } catch (err) {
    console.warn("formatAuditDateTime error:", err);
    return String(isoString);
  }
}

/**
 * Định dạng chi tiết thay đổi cho 1 bản ghi audit cột
 * @param {Object} log - Bản ghi từ bảng grades_audit
 * @returns {Object}
 */
export function formatFieldAuditEntry(log) {
  if (!log) return null;

  const field = log.field_name;
  const config = AUDIT_FIELD_CONFIG[field] || { label: field, fullLabel: field, order: 99 };
  const isTextField = field === "ghi_chu";
  const oldVal = log.old_value !== undefined && log.old_value !== null ? String(log.old_value) : null;
  const newVal = log.new_value !== undefined && log.new_value !== null ? String(log.new_value) : null;

  let diffNumber = null;
  let diffText = "";
  const isInsert = log.operation === "insert" || oldVal === null;

  if (isTextField) {
    if (isInsert) {
      diffText = "Thêm ghi chú";
    } else if (!newVal) {
      diffText = "Xóa ghi chú";
    } else {
      diffText = "Sửa ghi chú";
    }
  } else {
    const oldNum = oldVal !== null ? Number(oldVal) : null;
    const newNum = newVal !== null ? Number(newVal) : null;

    if (isInsert) {
      diffText = "Nhập mới";
    } else if (newVal === null) {
      diffText = "Đã xóa";
    } else if (oldNum !== null && newNum !== null && !isNaN(oldNum) && !isNaN(newNum)) {
      diffNumber = Math.round((newNum - oldNum) * 10) / 10;
      diffText = diffNumber > 0 ? `+${diffNumber}` : `${diffNumber}`;
    } else {
      diffText = "Đã sửa";
    }
  }

  return {
    field,
    label: config.label,
    fullLabel: config.fullLabel,
    order: config.order,
    operation: log.operation || (isInsert ? "insert" : "update"),
    oldValue: oldVal,
    newValue: newVal,
    diffNumber,
    diffText,
    type: isTextField ? "text" : "number",
    changedBy: log.changed_by,
    changedByName: log.changed_by_name,
    changedByRole: log.changed_by_role,
    changedAt: log.changed_at,
    isModified: true,
  };
}

/**
 * Tổng hợp toàn bộ 6 cột điểm, kết hợp dữ liệu log thực tế và các cột chưa sửa
 * @param {Array<Object>} rawLogs - Danh sách bản ghi từ bảng grades_audit
 * @returns {Array<Object>} Danh sách 6 cột đã được sắp xếp theo order chuẩn
 */
export function mergeAuditWithAllFields(rawLogs = []) {
  const logMap = new Map();

  if (Array.isArray(rawLogs)) {
    rawLogs.forEach((log) => {
      if (log?.field_name) {
        logMap.set(log.field_name, log);
      }
    });
  }

  return AUDITABLE_FIELDS.map((field) => {
    const raw = logMap.get(field);
    if (raw) {
      return formatFieldAuditEntry(raw);
    }

    const config = AUDIT_FIELD_CONFIG[field] || { label: field, fullLabel: field, order: 99 };
    return {
      field,
      label: config.label,
      fullLabel: config.fullLabel,
      order: config.order,
      isModified: false,
      oldValue: null,
      newValue: null,
      diffNumber: null,
      diffText: "Chưa sửa",
      type: field === "ghi_chu" ? "text" : "number",
      changedBy: null,
      changedByName: null,
      changedByRole: null,
      changedAt: null,
    };
  }).sort((a, b) => a.order - b.order);
}

/**
 * Định dạng danh xưng người sửa điểm trung thực, chuẩn Công giáo, an toàn
 * @param {Object} log - Bản ghi audit log
 * @param {boolean} isAdminViewer - Người đang xem có phải Admin không
 * @returns {string}
 */
export function formatActorDisplay(log, isAdminViewer = false) {
  if (!log) return "Chưa xác định";

  const rawName = (log.changed_by_name || log.changedByName || "").trim();
  const rawUsername = (log.changed_by || log.changedBy || "").trim();
  const role = log.changed_by_role || log.changedByRole;

  if (rawName) {
    let prefix = "";
    if (role === "teacher" && !rawName.startsWith("GLV")) {
      prefix = "GLV. ";
    } else if (role === "admin" && !rawName.startsWith("Admin") && !rawName.startsWith("Ban Quản trị")) {
      prefix = "Ban Quản trị — ";
    }

    const displayName = `${prefix}${rawName}`;
    if (isAdminViewer && rawUsername && rawUsername !== rawName) {
      return `${displayName} (@${rawUsername})`;
    }
    return displayName;
  }

  if (rawUsername) {
    return `Tài khoản đã ngừng hoạt động (${rawUsername})`;
  }

  return "Hệ thống";
}
