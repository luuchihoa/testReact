/**
 * khoiUtils.js
 * Các hàm tiện ích thuần túy cho nhóm trang Khối Giáo lý
 * Đọc dữ liệu vị trí phòng học từ nguồn chuẩn ROOMS_DIRECTORY trong lichHocData.js
 * Đồng bộ lịch sinh hoạt từ CENTRAL_MASS và CA_HOC tập trung.
 */

import { ROOMS_DIRECTORY, CENTRAL_MASS, CA_HOC } from "../../data/lichHocData.js";

/**
 * Helper chuyển đường dẫn asset tương thích cả root và subpath deploy
 */
export const asset = (path) => {
  const baseUrl = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : "/";
  return `${baseUrl}${path.replace(/^\//, "")}`;
};

/**
 * Helper chuẩn hóa danh xưng Giáo Lý Viên trang trọng
 */
export const formatTeacherName = (t) => {
  if (!t || typeof t !== "string") return "";
  const trimmed = t.trim();
  if (trimmed.startsWith("C.")) return `Chị ${trimmed.slice(2).trim()}`;
  if (trimmed.startsWith("A.")) return `Anh ${trimmed.slice(2).trim()}`;
  if (trimmed.startsWith("Sr.")) return `Sr. ${trimmed.slice(3).trim()}`;
  if (trimmed.startsWith("B.")) return `B. ${trimmed.slice(2).trim()}`;
  return trimmed;
};

/**
 * Helper chuẩn hóa nhãn Ca học (tránh lỗi split cắt mất số ca)
 */
export const formatShiftName = (caStr) => {
  if (!caStr || typeof caStr !== "string") return "Ca 2";
  const match = caStr.match(/\bCa\s*([12])\b/i);
  if (match) return `Ca ${match[1]}`;
  return caStr.split("(")[0].trim() || "Ca 2";
};

/**
 * Helper gắn khu vực / tầng phòng học dựa trên nguồn chuẩn ROOMS_DIRECTORY
 */
export const getRoomLocation = (room) => {
  if (!room || typeof room !== "string") return "";
  const trimmed = room.trim();
  const lower = trimmed.toLowerCase();

  // 1. Nhận diện các khu vực đặc biệt trong ROOMS_DIRECTORY
  if (lower.includes("nhà họp xứ")) {
    const entry = ROOMS_DIRECTORY.find((r) => r.id === "Nhà họp xứ");
    return entry ? `${entry.name} · ${entry.zone}` : "Nhà Họp Xứ · Khu Mục Vụ";
  }
  if (lower.includes("nhà hầm")) {
    const entry = ROOMS_DIRECTORY.find((r) => r.id === "Nhà hầm");
    return entry ? `${entry.name} · ${entry.zone}` : "Nhà Hầm · Khu Thánh Đường";
  }
  if (lower.includes("nhà thờ")) {
    const entry = ROOMS_DIRECTORY.find((r) => r.id === "Nhà thờ bên nữ");
    return entry ? `${entry.name} · ${entry.zone}` : "Nhà Thờ (Bên Nữ) · Thánh Đường";
  }

  // 2. Trích xuất mã phòng P (P1 - P13) qua regex phân định từ nguyên vẹn (\b)
  // Đặt (1[0-3]|[1-9]) để khớp số có 2 chữ số (10-13) trước số có 1 chữ số
  const pCodeMatch = trimmed.match(/\bP(1[0-3]|[1-9])\b/i);
  if (pCodeMatch) {
    const code = pCodeMatch[0].toUpperCase();
    const entry = ROOMS_DIRECTORY.find((r) => r.id.toUpperCase() === code);
    if (entry) {
      return `${trimmed} · ${entry.zone}`;
    }
  }

  // 3. Khớp chính xác ID hoặc Name trong ROOMS_DIRECTORY (không dùng substring)
  const exactEntry = ROOMS_DIRECTORY.find((r) =>
    r.id.toLowerCase() === lower || r.name.toLowerCase() === lower
  );
  if (exactEntry) {
    return `${trimmed} · ${exactEntry.zone}`;
  }

  return trimmed;
};

/**
 * Helper biên soạn 4 mốc timeline sinh hoạt Chúa Nhật từ dữ liệu tập trung (CENTRAL_MASS, CA_HOC)
 */
export const getSectorTimeline = (sectorConfig, classes = []) => {
  const isCa1 = classes.some((c) => c?.ca && /ca\s*1/i.test(c.ca));
  const shiftId = isCa1 ? 1 : 2;
  const caInfo = CA_HOC.find((c) => c.id === shiftId) || CA_HOC[1];
  const massTime = CENTRAL_MASS?.time || "08:00 – 09:00";
  const classTime = classes[0]?.time || caInfo.time;
  const shiftName = caInfo.name; // "Ca 1" | "Ca 2"
  const nganhName = sectorConfig?.nganh || "Ngành Ấu";

  // Tổng hợp danh sách phòng học từ classes
  const roomCodes = Array.from(
    new Set(classes.map((c) => c?.room ? c.room.replace(/^Phòng\s*/i, "") : "").filter(Boolean))
  );
  const roomSummary = roomCodes.length > 0 ? roomCodes.join(", ") : "Phòng Giáo lý";

  if (shiftId === 1) {
    // Ca 1: Học trước Lễ (07:00 – 07:45), sau đó hiệp dâng Thánh Lễ (08:00 – 09:00)
    return {
      shiftName,
      shiftLabel: caInfo.label,
      massTime,
      classTime,
      steps: [
        {
          time: "06:45",
          label: "Tập trung tại Tiền Sảnh",
          sub: `GLV đón tiếp & ổn định hàng ngũ ${nganhName}`,
          highlight: false,
          tag: null,
        },
        {
          time: classTime,
          label: "Học Giáo Lý & Nhân Bản",
          sub: `Huấn giáo theo ngành (${roomSummary})`,
          highlight: true,
          tag: "Huấn Giáo Đức Tin",
        },
        {
          time: massTime,
          label: CENTRAL_MASS.name,
          sub: `Hàng ghế ${nganhName} cùng GLV · Sốt sắng thưa kinh và hiệp dâng Thánh Lễ`,
          highlight: true,
          tag: "Tâm Điểm Phụng Vụ",
        },
        {
          time: massTime.split(" – ")[1] || "09:00",
          label: "Kết lễ & Ra về",
          sub: "Phụ huynh đón em trật tự tại khuôn viên Thánh đường",
          highlight: false,
          tag: null,
        },
      ],
    };
  }

  // Ca 2: Hiệp dâng Thánh Lễ trước (08:00 – 09:00), sau đó Học Giáo Lý (09:15 – 10:00)
  return {
    shiftName,
    shiftLabel: caInfo.label,
    massTime,
    classTime,
    steps: [
      {
        time: "07:45",
        label: "Tập trung tại Tiền Sảnh",
        sub: `GLV đón tiếp & ổn định hàng ngũ ${nganhName}`,
        highlight: false,
        tag: null,
      },
      {
        time: massTime,
        label: CENTRAL_MASS.name,
        sub: `Hàng ghế ${nganhName} cùng GLV · Sốt sắng thưa kinh và dọn lòng rước Chúa`,
        highlight: true,
        tag: "Tâm Điểm Phụng Vụ",
      },
      {
        time: classTime,
        label: "Học Giáo Lý & Nhân Bản",
        sub: `Huấn giáo Bí tích Hòa Giải & Thánh Thể, rèn luyện nhân bản (${roomSummary})`,
        highlight: true,
        tag: "Huấn Giáo Đức Tin",
      },
      {
        time: classTime.split(" – ")[1] || "10:00",
        label: "Phụ huynh đón em",
        sub: "Điểm danh trật tự và ra về an toàn tại cửa Phòng Giáo lý",
        highlight: false,
        tag: null,
      },
    ],
  };
};
