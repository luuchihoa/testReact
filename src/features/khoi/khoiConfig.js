/**
 * khoiConfig.js
 * Cấu hình trình bày giao diện (Hero, Themes, Floating Badges) cho 6 Khối Giáo lý
 * Dữ liệu nghiệp vụ (ngành, độ tuổi, cấp lớp, icon) được lấy từ nguồn chuẩn SECTORS_DATA.
 */

import { SECTORS_DATA, getSectorById } from "../../data/sectorsData.js";
import { asset, formatTeacherName, getRoomLocation, formatShiftName, getSectorTimeline } from "./khoiUtils.js";

// Re-export các helper thuần
export { asset, formatTeacherName, getRoomLocation, formatShiftName, getSectorTimeline };

/**
 * Cấu hình trình bày giao diện riêng biệt cho từng Khối
 */
export const KHOI_PRESENTATION_MAP = {
  "chien-con": {
    id: "chien-con",
    themeClass: "theme-chien-con",
    hero: {
      pillIcon: "🌱",
      pillText: "Phong trào HTDC · Khối Khai Tâm (Vườn Trẻ & Khai Tâm)",
      titleLine1: "Gieo Mầm Đức Tin",
      titleLine2: "Tuổi Thơ Trong Tay Chúa",
      desc: "Bước đầu làm quen với Nhà Chúa qua những khúc hát, cử điệu sinh động và bài học đức tin đơn sơ đầy ắp tình yêu thương.",
      image: asset("/images/khoichiencon.avif"),
      imageAlt: "Thiếu nhi Khối Khai Tâm Giáo xứ An Ngãi",
      floatingBadge: {
        title: "Khăn Xanh Lá Trơn · Mầm Non Đức Tin",
        sub: "Xứ đoàn Mẹ Mân Côi · Giáo xứ An Ngãi",
      },
    },
  },

  "ruoc-le": {
    id: "ruoc-le",
    themeClass: "theme-ruoc-le",
    hero: {
      pillIcon: "🌿",
      pillText: "Phong trào HTDC · Khối Rước Lễ Lần Đầu",
      titleLine1: "Đón Chúa Vào Lòng",
      titleLine2: "Khắc Ghi Tình Cha",
      desc: "Chuẩn bị tâm hồn thánh thiện qua Bí tích Hòa Giải và đón nhận Mình Thánh Chúa Kitô lần đầu tiên — dấu ấn đức tin sâu đậm của tuổi thơ Kitô hữu.",
      image: asset("/images/khoiruocle-anngai.jpg"),
      imageAlt: "Thánh Lễ Rước Lễ Lần Đầu tại Giáo xứ An Ngãi",
      floatingBadge: {
        title: "Khăn Xanh Có Viền · Rước Lễ Lần Đầu",
        sub: "Xứ đoàn Mẹ Mân Côi · Giáo xứ An Ngãi",
      },
    },
  },

  "them-suc": {
    id: "them-suc",
    themeClass: "theme-them-suc",
    hero: {
      pillIcon: "🔥",
      pillText: "Phong trào HTDC · Khối Thêm Sức",
      titleLine1: "Thần Khí Ban Ơn",
      titleLine2: "Vững Bước Dấn Thân",
      desc: "Lãnh nhận ấn tín ơn Chúa Thánh Thần, can đảm tuyên xưng đức tin và trở nên người Kitô hữu trưởng thành, sẵn sàng phục vụ Giáo xứ và tha nhân.",
      image: asset("/images/khoithemsuc-anngai.jpg"),
      imageAlt: "Các em Khối Thêm Sức Giáo xứ An Ngãi",
      floatingBadge: {
        title: "Khăn Vàng Có Viền · Hồng Ân 7 Ơn Thánh Thần",
        sub: "Xứ đoàn Mẹ Mân Côi · Giáo xứ An Ngãi",
      },
    },
  },

  "phung-vu": {
    id: "phung-vu",
    themeClass: "theme-phung-vu",
    hero: {
      pillIcon: "⛪",
      pillText: "Phong trào HTDC · Khối Phụng Vụ",
      titleLine1: "Sống Đời Phụng Vụ",
      titleLine2: "Hiệp Dâng Thánh Lễ",
      desc: "Tìm hiểu ý nghĩa các Bí tích, năm Phụng vụ và rèn luyện tâm hồn phụng sự bàn thờ Chúa qua lời ca, tiếng hát và việc giúp lễ sốt sắng.",
      image: asset("/images/khoiphungvu-anngai.jpg"),
      imageAlt: "Đoàn sinh Khối Phụng Vụ Giáo xứ An Ngãi",
      floatingBadge: {
        title: "Khăn Da Cam Có Viền · Phụng Sự Bàn Thờ",
        sub: "Xứ đoàn Mẹ Mân Côi · Giáo xứ An Ngãi",
      },
    },
  },

  "kinh-thanh": {
    id: "kinh-thanh",
    themeClass: "theme-kinh-thanh",
    hero: {
      pillIcon: "📖",
      pillText: "Phong trào HTDC · Khối Kinh Thánh",
      titleLine1: "Đào Sâu Lời Chúa",
      titleLine2: "Lịch Sử Cứu Độ",
      desc: "Khám phá 73 cuốn Sách Thánh Cựu Ước & Tân Ước, suy niệm Lectio Divina và xây dựng nền tảng đức tin vững chắc trên Lời Chúa hằng sống.",
      image: asset("/images/khoikinhthanh-anngai.jpg"),
      imageAlt: "Đoàn sinh Khối Kinh Thánh Giáo xứ An Ngãi",
      floatingBadge: {
        title: "Khăn Đỏ Có Viền · 73 Thư Quy Lời Chúa",
        sub: "Xứ đoàn Mẹ Mân Côi · Giáo xứ An Ngãi",
      },
    },
  },

  "vao-doi": {
    id: "vao-doi",
    themeClass: "theme-vao-doi",
    hero: {
      pillIcon: "🧭",
      pillText: "Phong trào HTDC · Khối Vào Đời",
      titleLine1: "Dấn Thân Vào Đời",
      titleLine2: "Chinh Phục Tương Lai",
      desc: "Trang bị hành trang đức tin, học thuyết xã hội Công giáo (Docat) và kỹ năng Huynh Trưởng, sẵn sàng trở thành muối men giữa dòng đời hôm nay.",
      image: asset("/images/khoivaodoi-anngai.jpg"),
      imageAlt: "Đoàn sinh Khối Vào Đời Giáo xứ An Ngãi",
      floatingBadge: {
        title: "Khăn Đỏ Có Viền · Người Trẻ Tông Đồ",
        sub: "Xứ đoàn Mẹ Mân Côi · Giáo xứ An Ngãi",
      },
    },
  },
};

/**
 * Lấy cấu hình hợp nhất (nghiệp vụ + trình bày) cho một khối
 */
export function getKhoiConfig(sectorId) {
  const sector = getSectorById(sectorId);
  const presentation = KHOI_PRESENTATION_MAP[sectorId];
  if (!sector || !presentation) return null;

  return {
    ...sector,
    ...presentation,
    hero: {
      ...presentation.hero,
      floatingBadge: {
        ...presentation.hero.floatingBadge,
        icon: sector.icon,
      },
    },
  };
}
