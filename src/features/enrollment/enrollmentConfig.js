import { SECTORS_DATA } from "../../data/sectorsData.js";

/**
 * Cấu hình nghiệp vụ đợt tuyển sinh
 * Mọi mốc thời gian sử dụng chuẩn ISO có múi giờ Asia/Ho_Chi_Minh
 */
export const ENROLLMENT_CONFIG = {
  academicYear: "2026–2027",
  academicYearSpaced: "2026 – 2027",
  timezone: "Asia/Ho_Chi_Minh",
  registrationStart: "2026-07-01T00:00:00+07:00",
  registrationEnd: "2026-08-31T23:59:59+07:00",
  startDateText: "Khai giảng: Chúa Nhật đầu tháng 9/2026",
  
  // Cờ ghi đè trạng thái tuyển sinh: "open" | "closed" | "upcoming" | null
  // Khi là null: tự động tính theo thời gian hiện tại dựa trên registrationStart và registrationEnd.
  // Khi cần mở đợt bổ sung hoặc đóng sớm, gán "open" hoặc "closed".
  statusOverride: "open",

  // Kênh liên hệ chính thức từ Ban Giáo lý Xứ đoàn An Ngãi
  hotline: "0905 143 643",
  email: "htdcanngai@gmail.com",
  address: "Thôn An Ngãi Tây 2, Phường Hoà Khánh, Tp Đà Nẵng",
  scheduleText: "Chúa Nhật hàng tuần: 07:00 – 09:30 (Thánh lễ & Giờ học Giáo lý)",
  feePolicyText: "Chương trình Giáo lý phục vụ cộng đoàn thiếu nhi Giáo xứ An Ngãi. Chi phí tài liệu học tập và sinh hoạt hàng năm theo thông báo chung của Xứ đoàn.",
  privacyPolicyText: "Thông tin đăng ký được sử dụng cho mục đích liên hệ và xếp lớp Giáo lý tại Giáo xứ An Ngãi. Xem thêm Chính sách bảo mật.",
};

/**
 * Xác định trạng thái tuyển sinh hiện tại
 */
export function getEnrollmentStatus(now = new Date(), config = ENROLLMENT_CONFIG) {
  if (config.statusOverride) {
    return config.statusOverride;
  }
  const currentTime = now.getTime();
  const startTime = new Date(config.registrationStart).getTime();
  const endTime = new Date(config.registrationEnd).getTime();

  if (currentTime < startTime) return "upcoming";
  if (currentTime > endTime) return "closed";
  return "open";
}

/**
 * 4 Khối được hỗ trợ đăng ký trực tuyến (khớp 100% với constraint cơ sở dữ liệu)
 */
export const ENROLLMENT_FORM_OPTIONS = [
  {
    value: "Chiên Con (Mầm non – Lớp 2)",
    label: "Chiên Con (Mầm non – Lớp 2)",
    shortName: "Chiên Con",
    grades: "Mầm non – Lớp 2",
    recommendedAge: "5 – 7 tuổi",
    minAge: 5,
    maxAge: 7,
  },
  {
    value: "Rước Lễ Lần Đầu (Lớp 3 – 4)",
    label: "Rước Lễ Lần Đầu (Lớp 3 – 4)",
    shortName: "Rước Lễ",
    grades: "Lớp 3 – Lớp 4",
    recommendedAge: "8 – 9 tuổi",
    minAge: 8,
    maxAge: 9,
  },
  {
    value: "Thêm Sức (Lớp 5 – 6)",
    label: "Thêm Sức (Lớp 5 – 6)",
    shortName: "Thêm Sức",
    grades: "Lớp 5 – Lớp 6",
    recommendedAge: "10 – 11 tuổi",
    minAge: 10,
    maxAge: 11,
  },
  {
    value: "Phụng Vụ (Lớp 7)",
    label: "Phụng Vụ (Lớp 7)",
    shortName: "Phụng Vụ",
    grades: "Lớp 7",
    recommendedAge: "12 tuổi",
    minAge: 12,
    maxAge: 12,
  },
];

/**
 * Danh sách đầy đủ 6 Khối Giáo lý tại Xứ đoàn An Ngãi
 * Tái sử dụng 100% màu ngành và icon từ SECTORS_DATA chuẩn
 */
const ONLINE_SECTOR_FORM_VALUES = {
  "chien-con": "Chiên Con (Mầm non – Lớp 2)",
  "ruoc-le": "Rước Lễ Lần Đầu (Lớp 3 – 4)",
  "them-suc": "Thêm Sức (Lớp 5 – 6)",
  "phung-vu": "Phụng Vụ (Lớp 7)",
};

export const ENROLLMENT_ALL_SECTORS = SECTORS_DATA.map((sector) => {
  const formValue = ONLINE_SECTOR_FORM_VALUES[sector.id] || null;
  const isOpenOnline = Boolean(formValue);

  return {
    ...sector,
    formValue,
    isOpenOnline,
    // Thông tin hiển thị bổ sung cho card tuyển sinh
    desc: sector.longDesc || sector.moTa,
  };
});

/**
 * 4 Khối thông tin thiết yếu trước khi nộp hồ sơ
 */
export const ESSENTIAL_INFO_ITEMS = [
  {
    id: "target",
    title: "Đối tượng tham gia",
    desc: "Thiếu nhi từ 5 đến 16 tuổi (tùy theo từng khối lớp Giáo lý tương ứng).",
  },
  {
    id: "schedule",
    title: "Thời gian sinh hoạt",
    desc: "Chúa Nhật hàng tuần: 07:00 – 09:30 (tham dự Thánh lễ và giờ học Giáo lý).",
  },
  {
    id: "location",
    title: "Địa điểm sinh hoạt",
    desc: "Khuôn viên và các phòng học Giáo lý tại Giáo xứ An Ngãi.",
  },
  {
    id: "fees",
    title: "Tài liệu & Học phẩm",
    desc: "Học tập miễn phí; phụ huynh đóng góp tài liệu và sinh hoạt theo thông báo Xứ đoàn.",
  },
];

/**
 * 3 Bước trong quy trình tiếp nhận hồ sơ
 */
export const ENROLLMENT_WORKFLOW_STEPS = [
  {
    step: "1",
    title: "Gửi thông tin đăng ký",
    desc: "Phụ huynh điền đầy đủ Tên Thánh, họ tên, năm sinh của thiếu nhi, SĐT và chọn khối học phù hợp.",
  },
  {
    step: "2",
    title: "Ban Giáo lý tiếp nhận & Đối chiếu",
    desc: "Ban Giáo lý kiểm tra hồ sơ, đối chiếu độ tuổi và liên hệ qua số điện thoại phụ huynh để xác nhận.",
  },
  {
    step: "3",
    title: "Xếp lớp & Khai giảng",
    desc: "Thiếu nhi được nhận danh sách lớp, nhận tài liệu học tập và bước vào ngày lễ Khai giảng niên khóa.",
  },
];

/**
 * Câu hỏi thường gặp (FAQ)
 */
export const ENROLLMENT_FAQS = [
  {
    id: "chua-biet-doc",
    question: "Bé nhỏ tuổi chưa biết đọc viết có thể học Giáo lý được không?",
    answer: "Với các bé độ tuổi mầm non hoặc lớp 1 tại Khối Khai Tâm (Vườn Trẻ & Khai Tâm 1, 2), các Giáo lý viên sử dụng phương pháp trực quan sinh động qua tranh ảnh, kể chuyện Kinh Thánh và bài hát cử điệu. Các em không bắt buộc phải biết đọc viết thành thạo.",
  },
  {
    id: "gio-hoc-le",
    question: "Giờ học Giáo lý được bố trí như thế nào?",
    answer: "Giờ học Giáo lý được sắp xếp kết hợp cùng Thánh lễ Thiếu Nhi vào sáng Chúa Nhật hàng tuần (từ 07:00 đến 09:30), giúp các em vừa tham dự Thánh lễ sốt sắng vừa học hỏi Lời Chúa một cách trọn vẹn.",
  },
  {
    id: "ngoai-giao-xu",
    question: "Gia đình ngoài giáo xứ hoặc mới chuyển đến có đăng ký được không?",
    answer: "Ban Giáo lý luôn hân hoan chào đón các gia đình Công giáo có nguyện vọng cho con em học Giáo lý. Quý phụ huynh vui lòng liên hệ trực tiếp Văn phòng Giáo lý để được hướng dẫn thủ tục chuyển xứ hoặc tiếp nhận.",
  },
  {
    id: "lech-tuoi",
    question: "Nếu năm sinh của bé lệch so với độ tuổi khuyến nghị thì sao?",
    answer: "Quý phụ huynh vẫn có thể đăng ký khối học mong muốn và ghi chú rõ trong phần Ghi chú. Ban Giáo lý sẽ liên hệ trực tiếp để trao đổi và tư vấn xếp lớp phù hợp nhất với trình độ thực tế của em.",
  },
  {
    id: "hoc-phi",
    question: "Chi phí học Giáo lý như thế nào?",
    answer: "Chương trình Giáo lý phục vụ cộng đoàn thiếu nhi không thu học phí. Phụ huynh chỉ đóng góp một khoản nhỏ cho sách giáo lý, tập vở và tài liệu học tập theo quy định chung của Xứ đoàn.",
  },
];

/**
 * Trả về cấu hình CTA tuyển sinh chuẩn xác cho từng khối học
 * Dựa trên trạng thái tuyển sinh và khả năng đăng ký trực tuyến (isOpenOnline từ ENROLLMENT_ALL_SECTORS)
 */
export function getSectorEnrollmentCTA({ status, sectorId } = {}) {
  const targetSector = ENROLLMENT_ALL_SECTORS.find((s) => s.id === sectorId) || null;
  const isOpenOnline = Boolean(targetSector?.isOpenOnline);

  if (status === "open") {
    if (isOpenOnline) {
      return {
        heroText: "Đăng Ký Học Giáo Lý",
        heroLink: "/tuyển-sinh#dang-ky",
        bannerText: "Đăng Ký Học Giáo Lý Cho Con",
        bannerLink: "/tuyển-sinh#dang-ky",
        note: "✦ Đang mở đợt tuyển sinh · Quý phụ huynh có thể đăng ký trực tuyến thuận tiện.",
      };
    }
    return {
      heroText: "Xem Thông Tin Tuyển Sinh",
      heroLink: "/tuyển-sinh",
      bannerText: "Xem Thông Tin Tuyển Sinh",
      bannerLink: "/tuyển-sinh",
      note: "✦ Thông tin ghi danh & sinh hoạt niên khóa mới được cập nhật trên trang Tuyển sinh và Văn phòng Giáo xứ.",
    };
  }

  if (status === "upcoming") {
    return {
      heroText: "Xem Thông Tin Tuyển Sinh",
      heroLink: "/tuyển-sinh",
      bannerText: "Xem Thông Tin Tuyển Sinh",
      bannerLink: "/tuyển-sinh",
      note: "✦ Kế hoạch niên khóa mới và thông tin tuyển sinh được cập nhật trên trang Tuyển sinh.",
    };
  }

  if (status === "closed") {
    return {
      heroText: "Xem Thông Tin Tuyển Sinh",
      heroLink: "/tuyển-sinh",
      bannerText: "Liên Hệ Ban Giáo Lý",
      bannerLink: "/liên-hệ",
      note: "✦ Để biết thêm thông tin ghi danh hoặc chuyển xứ, xin vui lòng liên hệ Ban Giáo lý.",
    };
  }

  // Fallback an toàn cho status hoặc sectorId không hợp lệ / không xác định
  return {
    heroText: "Xem Thông Tin Tuyển Sinh",
    heroLink: "/tuyển-sinh",
    bannerText: "Xem Thông Tin Tuyển Sinh",
    bannerLink: "/tuyển-sinh",
    note: "✦ Thông tin tuyển sinh & niên khóa mới được cập nhật trên website Giáo xứ.",
  };
}

