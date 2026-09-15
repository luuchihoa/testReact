/**
 * academicYear.js
 * Tiện ích tính toán niên khóa và năm sinh tự động theo thời gian thực.
 * Xứ đoàn Hùng Tâm Dũng Chí Mẹ Mân Côi · Giáo xứ An Ngãi
 *
 * Quy tắc tính niên khóa:
 * - Tháng 7 đến tháng 12: Đã bước vào năm học mới (Ví dụ T9/2026 -> Niên khóa 2026–2027)
 * - Tháng 1 đến tháng 6: Vẫn thuộc niên khóa đang diễn ra (Ví dụ T3/2027 -> Niên khóa 2026–2027)
 */

export function getAcademicYear(date = new Date()) {
  const month = date.getMonth() + 1; // 1-12
  const currentYear = date.getFullYear();

  // Từ tháng 7 (bắt đầu tuyển sinh đầu năm học) tính là năm bắt đầu niên khóa
  const startYear = month >= 7 ? currentYear : currentYear - 1;
  const endYear = startYear + 1;

  return {
    startYear,
    endYear,
    academicYear: `${startYear}–${endYear}`,
    academicYearSpaced: `${startYear} – ${endYear}`,
  };
}

/**
 * Tính năm sinh dựa theo độ tuổi và năm bắt đầu niên khóa
 */
export function getBirthYearByAge(age, academicStartYear = getAcademicYear().startYear) {
  return academicStartYear - age;
}

/**
 * Hồ sơ niên khóa của Khối Chiên Con (Vườn Trẻ & Khai Tâm)
 */
// Hồ sơ lớp hiện có thuộc niên khóa 2026–2027. Chỉ cập nhật mốc này
// cùng với danh sách giáo lý viên, sĩ số, lịch và trạng thái đã xác nhận.
export function getKhoiChienConData() {
  const startYear = 2026;
  const endYear = startYear + 1;
  const academicYear = `${startYear}–${endYear}`;
  const academicYearSpaced = `${startYear} – ${endYear}`;

  // Tính năm sinh chuẩn xác theo tuổi
  const vuonTreBirthYear = startYear - 5;    // 5 tuổi (Vườn Trẻ)
  const khaiTam1BirthYear = startYear - 6;   // 6 tuổi (Khai Tâm 1)
  const khaiTam2BirthYear = startYear - 7;   // 7 tuổi (Khai Tâm 2)

  return {
    academicYear,
    academicYearSpaced,
    startYear,
    endYear,
    vuonTreBirthYear,
    khaiTam1BirthYear,
    khaiTam2BirthYear,
    birthYearRange: `${khaiTam2BirthYear} – ${vuonTreBirthYear}`,
    khaiTamBirthYearRange: `${khaiTam2BirthYear} – ${khaiTam1BirthYear}`,
    ageRangeText: `5 – 7 tuổi (Sinh năm ${khaiTam2BirthYear} – ${vuonTreBirthYear})`,
    
    // Danh sách 5 lớp học thực tế niên khóa
    classes: [
      {
        id: "vuon-tre",
        name: "Lớp Vườn Trẻ",
        group: "Vườn Trẻ",
        levelBadge: "Mầm Non Đức Tin",
        badgeColor: "emerald",
        age: 5,
        ageText: "5 tuổi",
        birthYear: vuonTreBirthYear,
        teachers: ["C.Châu", "C.Viên"],
        room: "Nhà thờ bên nữ",
        roomNote: "Không gian thoáng mát, gần gũi và an toàn tuyệt đối cho bé",
        studentsCount: null,
        status: "Đang tuyển sinh",
        time: "09:15 – 10:00",
        ca: "Ca 2 (Sau Thánh Lễ 08h00)",
        focus: "Làm quen với Nhà Chúa qua khúc hát, cử điệu, tình yêu thương và sự ấm áp."
      },
      {
        id: "kt-1-1",
        name: "Lớp Khai Tâm 1/1",
        group: "Khai Tâm 1",
        levelBadge: "Lớp Nhập Môn",
        badgeColor: "sky",
        age: 6,
        ageText: "6 tuổi",
        birthYear: khaiTam1BirthYear,
        teachers: ["Sr.Tuyết", "C.Tâm"],
        room: "Phòng P1",
        roomNote: "Khu trệt, thuận tiện cho phụ huynh đưa đón",
        studentsCount: null,
        status: "Đang tuyển sinh",
        time: "09:15 – 10:00",
        ca: "Ca 2 (Sau Thánh Lễ 08h00)",
        focus: "Gieo mầm Lời Chúa, học những câu chuyện Kinh Thánh và tập làm dấu Thánh Giá sốt sắng."
      },
      {
        id: "kt-1-2",
        name: "Lớp Khai Tâm 1/2",
        group: "Khai Tâm 1",
        levelBadge: "Lớp Nhập Môn",
        badgeColor: "sky",
        age: 6,
        ageText: "6 tuổi",
        birthYear: khaiTam1BirthYear,
        teachers: ["C.Vân", "C.K.Liên"],
        room: "Nhà hầm",
        roomNote: "Không gian rộng rãi cho các hoạt động thủ công và múa hát",
        studentsCount: null,
        status: "Đang tuyển sinh",
        time: "09:15 – 10:00",
        ca: "Ca 2 (Sau Thánh Lễ 08h00)",
        focus: "Cầu nguyện đơn sơ cùng Chúa Giêsu, gắn kết tình bạn thân ái trong tình yêu thương."
      },
      {
        id: "kt-2-1",
        name: "Lớp Khai Tâm 2/1",
        group: "Khai Tâm 2",
        levelBadge: "Lớp Nền Tảng",
        badgeColor: "amber",
        age: 7,
        ageText: "7 tuổi",
        birthYear: khaiTam2BirthYear,
        teachers: ["C.Dung", "C.N.Hân"],
        room: "Phòng P2",
        roomNote: "Khu trệt, trang bị đầy đủ bàn ghế và bảng giảng dạy",
        studentsCount: 29,
        status: "Đã vào nề nếp",
        time: "09:15 – 10:00",
        ca: "Ca 2 (Sau Thánh Lễ 08h00)",
        focus: "Học thuộc 3 lời kinh căn bản (Lạy Cha, Kính Mừng, Sáng Danh) và ý thức tôn kính Chúa."
      },
      {
        id: "kt-2-2",
        name: "Lớp Khai Tâm 2/2",
        group: "Khai Tâm 2",
        levelBadge: "Lớp Nền Tảng",
        badgeColor: "amber",
        age: 7,
        ageText: "7 tuổi",
        birthYear: khaiTam2BirthYear,
        teachers: ["C.Ân", "B.Ngọc"],
        room: "Nhà hầm",
        roomNote: "Không gian sinh hoạt rộng, mát mẻ",
        studentsCount: 31,
        status: "Đã vào nề nếp",
        time: "09:15 – 10:00",
        ca: "Ca 2 (Sau Thánh Lễ 08h00)",
        focus: "Hiểu tình thương của Chúa qua Lịch Sử Cứu Độ, chuẩn bị tâm hồn lên Khối Rước Lễ Lần Đầu."
      }
    ]
  };
}

/**
 * Dữ liệu tự động tính toán thời gian thực cho Khối Rước Lễ (Ngành Ấu: Ấu Hùng – Ấu Dũng)
 * 5 Lớp học thực tế tại Giáo xứ An Ngãi
 */
export function getKhoiRuocLeData(date = new Date()) {
  const { startYear, endYear, academicYear, academicYearSpaced } = getAcademicYear(date);

  // Tính năm sinh chuẩn xác theo tuổi
  const ruocLe1BirthYear = startYear - 8;   // 8 tuổi (Rước Lễ 1)
  const ruocLe2BirthYear = startYear - 9;   // 9 tuổi (Rước Lễ 2)

  return {
    academicYear,
    academicYearSpaced,
    startYear,
    endYear,
    ruocLe1BirthYear,
    ruocLe2BirthYear,
    birthYearRange: `${ruocLe2BirthYear} – ${ruocLe1BirthYear}`,
    ageRangeText: `8 – 9 tuổi (Sinh năm ${ruocLe2BirthYear} – ${ruocLe1BirthYear})`,

    // Danh sách 5 lớp học thực tế niên khóa tại Giáo xứ An Ngãi
    classes: [
      {
        id: "rld-1-1",
        stt: 24,
        name: "Lớp RLLĐ 1/1",
        group: "Rước Lễ 1",
        levelBadge: "Nền Tảng Bí Tích",
        badgeColor: "lime",
        age: 8,
        ageText: "8 tuổi",
        birthYear: ruocLe1BirthYear,
        teachers: ["C.Vy", "C.N.Thảo"],
        room: "Phòng P4",
        roomNote: "Dãy tầng trệt, không gian thoáng đãng và nghiêm trang",
        studentsCount: 32,
        status: "Đang học tập",
        time: "09:15 – 10:00",
        ca: "Ca 2 (Sau Thánh Lễ 08h00)",
        focus: "Học hiểu Kinh Ăn Năn Tội, tập xét mình và nhận biết tình thương tha thứ của Chúa Giêsu."
      },
      {
        id: "rld-1-2",
        stt: 25,
        name: "Lớp RLLĐ 1/2",
        group: "Rước Lễ 1",
        levelBadge: "Nền Tảng Bí Tích",
        badgeColor: "lime",
        age: 8,
        ageText: "8 tuổi",
        birthYear: ruocLe1BirthYear,
        teachers: ["C.Na", "C.Yên", "C.Quyên"],
        room: "Phòng P3",
        roomNote: "Dãy tầng trệt, trang bị đầy đủ bảng viết và tranh ảnh Kinh Thánh",
        studentsCount: 34,
        status: "Đang học tập",
        time: "09:15 – 10:00",
        ca: "Ca 2 (Sau Thánh Lễ 08h00)",
        focus: "Yêu mến Lời Chúa qua các dụ ngôn Tin Mừng, rèn luyện thói quen cầu nguyện sớm tối và vâng phục cha mẹ."
      },
      {
        id: "rld-2-1",
        stt: 21,
        name: "Lớp RLLĐ 2/1",
        group: "Rước Lễ 2",
        levelBadge: "Chuẩn Bị Bí Tích",
        badgeColor: "emerald",
        age: 9,
        ageText: "9 tuổi",
        birthYear: ruocLe2BirthYear,
        teachers: ["Sr.Danh", "C.Nhi"],
        room: "Phòng P8",
        roomNote: "Phòng học lầu 1, trang nghiêm và yên tĩnh cho giờ huấn giáo",
        studentsCount: 31,
        status: "Chuẩn bị Bí tích",
        time: "09:15 – 10:00",
        ca: "Ca 2 (Sau Thánh Lễ 08h00)",
        focus: "Đi sâu vào mầu nhiệm Bí tích Thánh Thể, tập dượt nghi thức Xưng Tội Lần Đầu và Rước Lễ sốt sắng."
      },
      {
        id: "rld-2-2",
        stt: 22,
        name: "Lớp RLLĐ 2/2",
        group: "Rước Lễ 2",
        levelBadge: "Chuẩn Bị Bí Tích",
        badgeColor: "emerald",
        age: 9,
        ageText: "9 tuổi",
        birthYear: ruocLe2BirthYear,
        teachers: ["C.Trâm", "A.Minh"],
        room: "Phòng P7",
        roomNote: "Phòng học lầu 1, dãy phòng học kiên cố phía sau nhà thờ",
        studentsCount: 35,
        status: "Chuẩn bị Bí tích",
        time: "09:15 – 10:00",
        ca: "Ca 2 (Sau Thánh Lễ 08h00)",
        focus: "Học cách giữ tâm hồn trong sạch, sống kết hiệp với Chúa Giêsu Bánh Hằng Sống trong gia đình và trường lớp."
      },
      {
        id: "rld-2-3",
        stt: 23,
        name: "Lớp RLLĐ 2/3",
        group: "Rước Lễ 2",
        levelBadge: "Chuẩn Bị Bí Tích",
        badgeColor: "emerald",
        age: 9,
        ageText: "9 tuổi",
        birthYear: ruocLe2BirthYear,
        teachers: ["C.Linh", "C.B.Hân"],
        room: "Phòng P5",
        roomNote: "Phòng học lầu 1, trang bị đầy đủ bàn ghế chuẩn lứa tuổi",
        studentsCount: 31,
        status: "Chuẩn bị Bí tích",
        time: "09:15 – 10:00",
        ca: "Ca 2 (Sau Thánh Lễ 08h00)",
        focus: "Thực hành tinh thần Hùng Tâm Dũng Chí: ngoan ngoãn vâng phục, làm việc hy sinh nhỏ bé mỗi ngày."
      }
    ]
  };
}

/**
 * Dữ liệu tự động tính toán thời gian thực cho Khối Thêm Sức (Ngành Kim Hoan: Kim Hùng – Hoan Dũng)
 * 6 Lớp học thực tế tại Giáo xứ An Ngãi
 */
export function getKhoiThemSucData(date = new Date()) {
  const { startYear, endYear, academicYear, academicYearSpaced } = getAcademicYear(date);

  // Tính năm sinh chuẩn xác theo tuổi
  const themSuc1BirthYear = startYear - 10;  // 10 tuổi (Thêm Sức 1)
  const themSuc2BirthYear = startYear - 11;  // 11 tuổi (Thêm Sức 2)

  return {
    academicYear,
    academicYearSpaced,
    startYear,
    endYear,
    themSuc1BirthYear,
    themSuc2BirthYear,
    birthYearRange: `${themSuc2BirthYear} – ${themSuc1BirthYear}`,
    ageRangeText: `10 – 11 tuổi (Sinh năm ${themSuc2BirthYear} – ${themSuc1BirthYear})`,

    // Danh sách 6 lớp học thực tế niên khóa tại Giáo xứ An Ngãi
    classes: [
      {
        id: "ts-1-1",
        stt: 18,
        name: "Lớp Thêm Sức 1/1",
        group: "Thêm Sức 1",
        levelBadge: "Nền Tảng Căn Tính",
        badgeColor: "amber",
        age: 10,
        ageText: "10 tuổi",
        birthYear: themSuc1BirthYear,
        teachers: ["C.N.Quỳnh", "A.Lâm"],
        room: "Phòng P11",
        roomNote: "Dãy lầu (Tầng 2), trang nghiêm và yên tĩnh",
        studentsCount: 28,
        status: "Đang học tập",
        time: "09:15 – 10:00",
        ca: "Ca 2 (Sau Thánh Lễ 08h00)",
        focus: "Tìm hiểu Ngôi Ba Thiên Chúa, ý nghĩa 7 Ơn thiêng và tinh thần người chiến sĩ Kitô hữu."
      },
      {
        id: "ts-1-2",
        stt: 19,
        name: "Lớp Thêm Sức 1/2",
        group: "Thêm Sức 1",
        levelBadge: "Nền Tảng Căn Tính",
        badgeColor: "amber",
        age: 10,
        ageText: "10 tuổi",
        birthYear: themSuc1BirthYear,
        teachers: ["C.D.Trang", "A.Vạn"],
        room: "Phòng P10",
        roomNote: "Dãy lầu (Tầng 2), thoáng mát và đầy đủ trang thiết bị",
        studentsCount: 30,
        status: "Đang học tập",
        time: "09:15 – 10:00",
        ca: "Ca 2 (Sau Thánh Lễ 08h00)",
        focus: "Lắng nghe Lời Chúa, sống đức tin chân thật và can đảm làm chứng giữa môi trường học đường."
      },
      {
        id: "ts-1-3",
        stt: 20,
        name: "Lớp Thêm Sức 1/3",
        group: "Thêm Sức 1",
        levelBadge: "Nền Tảng Căn Tính",
        badgeColor: "amber",
        age: 10,
        ageText: "10 tuổi",
        birthYear: themSuc1BirthYear,
        teachers: ["C.Q.Thư", "C.Chiêu"],
        room: "Phòng P9",
        roomNote: "Dãy lầu (Tầng 2), không gian học tập sôi nổi",
        studentsCount: 30,
        status: "Đang học tập",
        time: "09:15 – 10:00",
        ca: "Ca 2 (Sau Thánh Lễ 08h00)",
        focus: "Rèn luyện tinh thần Kim Hoan: Quảng đại, vui tươi, hăng say phục vụ Chúa và tha nhân."
      },
      {
        id: "ts-2-1",
        stt: 15,
        name: "Lớp Thêm Sức 2/1",
        group: "Thêm Sức 2",
        levelBadge: "Chuẩn Bị Bí Tích",
        badgeColor: "orange",
        age: 11,
        ageText: "11 tuổi",
        birthYear: themSuc2BirthYear,
        teachers: ["Sr.Thuỳ", "C.Trân", "C.Phượng"],
        room: "Nhà họp xứ",
        roomNote: "Hội trường rộng, không gian sinh hoạt và huấn giáo trung tâm",
        studentsCount: 29,
        status: "Chuẩn bị Bí tích",
        time: "09:15 – 10:00",
        ca: "Ca 2 (Sau Thánh Lễ 08h00)",
        focus: "Đi sâu vào các Bí tích Khai Tâm, chuẩn bị tâm hồn sốt sắng đón nhận Hồng ân Thần Khí."
      },
      {
        id: "ts-2-2",
        stt: 16,
        name: "Lớp Thêm Sức 2/2",
        group: "Thêm Sức 2",
        levelBadge: "Chuẩn Bị Bí Tích",
        badgeColor: "orange",
        age: 11,
        ageText: "11 tuổi",
        birthYear: themSuc2BirthYear,
        teachers: ["C.P.Trang", "A.Điệp"],
        room: "Phòng P13",
        roomNote: "Dãy phòng học phía sau, nghiêm trang và kỷ luật",
        studentsCount: 27,
        status: "Chuẩn bị Bí tích",
        time: "09:15 – 10:00",
        ca: "Ca 2 (Sau Thánh Lễ 08h00)",
        focus: "Tĩnh tâm sa mạc, chọn Người Đỡ Đầu gương mẫu và tập dượt nghi thức Bí tích Thêm Sức."
      },
      {
        id: "ts-2-3",
        stt: 17,
        name: "Lớp Thêm Sức 2/3",
        group: "Thêm Sức 2",
        levelBadge: "Chuẩn Bị Bí Tích",
        badgeColor: "orange",
        age: 11,
        ageText: "11 tuổi",
        birthYear: themSuc2BirthYear,
        teachers: ["C.L.Thư", "C.My", "A.Bảo"],
        room: "Phòng P12",
        roomNote: "Dãy phòng học phía sau, trang bị đầy đủ tài liệu học tập",
        studentsCount: 29,
        status: "Chuẩn bị Bí tích",
        time: "09:15 – 10:00",
        ca: "Ca 2 (Sau Thánh Lễ 08h00)",
        focus: "Trưởng thành trong đức tin: Sống ba sứ mạng Ngôn Sứ, Tư Tế và Vương Đế giữa đời."
      }
    ]
  };
}

/**
 * Dữ liệu tự động tính toán thời gian thực cho Khối Phụng Vụ (Ngành Nhiệt Quang: Nhiệt Hùng – Quang Dũng)
 * 3 Lớp học thực tế tại Giáo xứ An Ngãi
 */
export function getKhoiPhungVuData(date = new Date()) {
  const { startYear, endYear, academicYear, academicYearSpaced } = getAcademicYear(date);

  // Tính năm sinh chuẩn xác theo tuổi (Lớp 7 - 12 tuổi)
  const phungVuBirthYear = startYear - 12;

  return {
    academicYear,
    academicYearSpaced,
    startYear,
    endYear,
    phungVuBirthYear,
    ageRangeText: `12 tuổi (Sinh năm ${phungVuBirthYear})`,

    // Danh sách 3 lớp học thực tế niên khóa tại Giáo xứ An Ngãi
    classes: [
      {
        id: "pv-1-1",
        stt: 12,
        name: "Lớp Phụng Vụ 1/1",
        group: "Phụng Vụ",
        levelBadge: "Sống Đời Thờ Phượng",
        badgeColor: "orange",
        age: 12,
        ageText: "12 tuổi",
        birthYear: phungVuBirthYear,
        teachers: ["C.Hoà", "C.H.Trang"],
        room: "Phòng P2",
        roomNote: "Khu tầng trệt, trang nghiêm và thuận tiện di chuyển",
        studentsCount: 33,
        status: "Đang học tập",
        time: "07:00 – 07:45",
        ca: "Ca 1 (Trước Thánh Lễ 08h00)",
        focus: "Hiểu sâu cấu trúc Thánh Lễ, Phụng Vụ Lời Chúa và ý thức cùng dâng lễ sốt sắng với cộng đoàn."
      },
      {
        id: "pv-1-2",
        stt: 13,
        name: "Lớp Phụng Vụ 1/2",
        group: "Phụng Vụ",
        levelBadge: "Bí Tích & Cứu Độ",
        badgeColor: "orange",
        age: 12,
        ageText: "12 tuổi",
        birthYear: phungVuBirthYear,
        teachers: ["A.Liêu", "C.T.Thảo", "A.Vũ"],
        room: "Phòng P1",
        roomNote: "Khu tầng trệt, thoáng mát, đầy đủ trang thiết bị giáo lý",
        studentsCount: 35,
        status: "Đang học tập",
        time: "07:00 – 07:45",
        ca: "Ca 1 (Trước Thánh Lễ 08h00)",
        focus: "Khám phá 7 Bí tích qua các dấu chỉ hữu hình, tập dượt nghi thức và phụng sự bàn thờ thánh thiêng."
      },
      {
        id: "pv-1-3",
        stt: 14,
        name: "Lớp Phụng Vụ 1/3",
        group: "Phụng Vụ",
        levelBadge: "Nhiệt Quang Tông Đồ",
        badgeColor: "orange",
        age: 12,
        ageText: "12 tuổi",
        birthYear: phungVuBirthYear,
        teachers: ["A.Vương", "C.Thạnh", "A.Thiện"],
        room: "Nhà hầm",
        roomNote: "Không gian rộng rãi, phù hợp sinh hoạt linh hoạt và thực hành phụng vụ",
        studentsCount: 32,
        status: "Đang học tập",
        time: "07:00 – 07:45",
        ca: "Ca 1 (Trước Thánh Lễ 08h00)",
        focus: "Cầu nguyện qua Phụng Vụ Giờ Kinh, thánh ca phụng vụ và tinh thần nhiệt tâm phụng sự Chúa giữa đời."
      }
    ]
  };
}

/**
 * Dữ liệu tự động tính toán thời gian thực cho Khối Kinh Thánh (Ngành Nhiệt Quang: Nhiệt Hùng – Quang Dũng)
 * 6 Lớp học thực tế tại Giáo xứ An Ngãi (Kinh Thánh 1: Lớp 8; Kinh Thánh 2: Lớp 9)
 */
export function getKhoiKinhThanhData(date = new Date()) {
  const { startYear, endYear, academicYear, academicYearSpaced } = getAcademicYear(date);

  // Tính năm sinh chuẩn xác theo tuổi (KT 1: 13 tuổi, KT 2: 14 tuổi)
  const kinhThanh1BirthYear = startYear - 13;
  const kinhThanh2BirthYear = startYear - 14;

  return {
    academicYear,
    academicYearSpaced,
    startYear,
    endYear,
    kinhThanh1BirthYear,
    kinhThanh2BirthYear,
    birthYearRange: `${kinhThanh2BirthYear} – ${kinhThanh1BirthYear}`,
    ageRangeText: `13 – 14 tuổi (Sinh năm ${kinhThanh2BirthYear} – ${kinhThanh1BirthYear})`,

    // Danh sách 6 lớp học thực tế niên khóa tại Giáo xứ An Ngãi
    classes: [
      {
        id: "kt-1-1",
        stt: 9,
        name: "Lớp Kinh Thánh 1/1",
        group: "Kinh Thánh 1",
        levelBadge: "Ngũ Thư & Giao Ước",
        badgeColor: "red",
        age: 13,
        ageText: "13 tuổi",
        birthYear: kinhThanh1BirthYear,
        teachers: ["C.Khuyên", "C.Thương"],
        room: "Phòng P5",
        roomNote: "Khu tầng trệt dãy giáo lý, gần gũi và trang bị đầy đủ tài liệu",
        studentsCount: 28,
        status: "Đang học tập",
        time: "07:00 – 07:45",
        ca: "Ca 1 (Trước Thánh Lễ 08h00)",
        focus: "Ngũ Thư & Lịch Sử Cứu Độ: Khám phá giao ước của Thiên Chúa qua các thời đại."
      },
      {
        id: "kt-1-2",
        stt: 10,
        name: "Lớp Kinh Thánh 1/2",
        group: "Kinh Thánh 1",
        levelBadge: "Huấn Ca & Khôn Ngoan",
        badgeColor: "red",
        age: 13,
        ageText: "13 tuổi",
        birthYear: kinhThanh1BirthYear,
        teachers: ["C.Tuyền", "A.Khôi", "A.Phúc"],
        room: "Phòng P4",
        roomNote: "Dãy phòng học trung tâm, thoáng mát, thích hợp thảo luận nhóm",
        studentsCount: 25,
        status: "Đang học tập",
        time: "07:00 – 07:45",
        ca: "Ca 1 (Trước Thánh Lễ 08h00)",
        focus: "Sách Huấn Ca & Ngôn Sứ: Học bài học khôn ngoan và lắng nghe tiếng Chúa mời gọi."
      },
      {
        id: "kt-1-3",
        stt: 11,
        name: "Lớp Kinh Thánh 1/3",
        group: "Kinh Thánh 1",
        levelBadge: "Hành Trình Dân Chúa",
        badgeColor: "red",
        age: 13,
        ageText: "13 tuổi",
        birthYear: kinhThanh1BirthYear,
        teachers: ["C.Thu", "C.Vi", "A.Nguyên"],
        room: "Phòng P3",
        roomNote: "Không gian trang bị bản đồ địa lý Thánh Kinh và tư liệu trực quan",
        studentsCount: 27,
        status: "Đang học tập",
        time: "07:00 – 07:45",
        ca: "Ca 1 (Trước Thánh Lễ 08h00)",
        focus: "Hành trình dân tộc Israel: Hiểu địa lý, bối cảnh và sứ điệp cứu độ qua dòng lịch sử."
      },
      {
        id: "kt-2-1",
        stt: 6,
        name: "Lớp Kinh Thánh 2/1",
        group: "Kinh Thánh 2",
        levelBadge: "Bốn Sách Tin Mừng",
        badgeColor: "red",
        age: 14,
        ageText: "14 tuổi",
        birthYear: kinhThanh2BirthYear,
        teachers: ["C.Trim", "A.Trường"],
        room: "Phòng P9",
        roomNote: "Khu phòng học lớn, trang bị máy chiếu phục vụ phân tích bản văn",
        studentsCount: 35,
        status: "Đang học tập",
        time: "07:00 – 07:45",
        ca: "Ca 1 (Trước Thánh Lễ 08h00)",
        focus: "Bốn Sách Tin Mừng: Chiêm ngắm chân dung, cuộc đời và giáo huấn của Chúa Giêsu Kitô."
      },
      {
        id: "kt-2-2",
        stt: 7,
        name: "Lớp Kinh Thánh 2/2",
        group: "Kinh Thánh 2",
        levelBadge: "Thư Thánh Phaolô",
        badgeColor: "red",
        age: 14,
        ageText: "14 tuổi",
        birthYear: kinhThanh2BirthYear,
        teachers: ["C.Q.Ngọc", "A.Cường"],
        room: "Phòng P8",
        roomNote: "Dãy phòng học lầu 1, yên tĩnh, tạo điều kiện đào sâu suy niệm",
        studentsCount: 32,
        status: "Đang học tập",
        time: "07:00 – 07:45",
        ca: "Ca 1 (Trước Thánh Lễ 08h00)",
        focus: "Thư Thánh Phaolô & Tông Đồ Công Vụ: Sống ơn gọi chứng nhân và xây dựng cộng đoàn Hội Thánh."
      },
      {
        id: "kt-2-3",
        stt: 8,
        name: "Lớp Kinh Thánh 2/3",
        group: "Kinh Thánh 2",
        levelBadge: "Lectio Divina & Sống Đạo",
        badgeColor: "red",
        age: 14,
        ageText: "14 tuổi",
        birthYear: kinhThanh2BirthYear,
        teachers: ["A.Dương", "C.M.Liên"],
        room: "Phòng P7",
        roomNote: "Không gian trang nghiêm, tổ chức các buổi cầu nguyện Lời Chúa chuyên sâu",
        studentsCount: 34,
        status: "Đang học tập",
        time: "07:00 – 07:45",
        ca: "Ca 1 (Trước Thánh Lễ 08h00)",
        focus: "Cầu nguyện Lectio Divina: Đọc, suy niệm, cầu nguyện và đưa Lời Chúa vào thực tiễn cuộc sống."
      }
    ]
  };
}

/**
 * Dữ liệu tự động tính toán thời gian thực cho Khối Vào Đời (Ngành Chinh Chiến HTDC: Chiến Tâm – Chinh Dũng)
 * 5 Lớp học thực tế tại Giáo xứ An Ngãi (Vào Đời 1: 15 tuổi · Lớp 10; Vào Đời 2: 16 tuổi · Lớp 11)
 */
export function getKhoiVaoDoiData(date = new Date()) {
  const { startYear, endYear, academicYear, academicYearSpaced } = getAcademicYear(date);

  // Tính năm sinh chuẩn xác theo tuổi (Vào Đời 1: 15 tuổi, Vào Đời 2: 16 tuổi)
  const vaoDoi1BirthYear = startYear - 15;
  const vaoDoi2BirthYear = startYear - 16;

  return {
    academicYear,
    academicYearSpaced,
    startYear,
    endYear,
    vaoDoi1BirthYear,
    vaoDoi2BirthYear,
    birthYearRange: `${vaoDoi2BirthYear} – ${vaoDoi1BirthYear}`,
    ageRangeText: `15 – 16 tuổi (Sinh năm ${vaoDoi2BirthYear} – ${vaoDoi1BirthYear})`,

    // Danh sách 5 lớp học thực tế niên khóa tại Giáo xứ An Ngãi
    classes: [
      {
        id: "vd-2-1",
        stt: 1,
        name: "Lớp Vào Đời 2/1",
        group: "Vào Đời 2",
        levelBadge: "Docat & Học Thuyết Xã Hội",
        badgeColor: "red",
        age: 16,
        ageText: "16 tuổi",
        birthYear: vaoDoi2BirthYear,
        teachers: ["A.Thanh", "A.Trin"],
        room: "Nhà họp xứ",
        roomNote: "Khu mục vụ giáo xứ, không gian thảo luận mở và giao lưu chuyên đề",
        studentsCount: 30,
        status: "Đang học tập",
        time: "07:00 – 07:45",
        ca: "Ca 1 (Trước Thánh Lễ 08h00)",
        focus: "Học thuyết Xã hội Công giáo, nhân phẩm con người, đối thoại văn hóa và sứ mạng dấn thân làm chứng giữa đời."
      },
      {
        id: "vd-2-2",
        stt: 2,
        name: "Lớp Vào Đời 2/2",
        group: "Vào Đời 2",
        levelBadge: "Phân Định Ơn Gọi & Tương Lai",
        badgeColor: "red",
        age: 16,
        ageText: "16 tuổi",
        birthYear: vaoDoi2BirthYear,
        teachers: ["C.B.Trang", "A.Khanh"],
        room: "Phòng P13",
        roomNote: "Dãy phòng lầu 1 yên tĩnh, thích hợp đào sâu định hướng tương lai và cầu nguyện",
        studentsCount: 33,
        status: "Đang học tập",
        time: "07:00 – 07:45",
        ca: "Ca 1 (Trước Thánh Lễ 08h00)",
        focus: "Hôn nhân Kitô giáo, định hướng ơn gọi, nghề nghiệp theo lương tâm Kitô hữu và chuẩn bị bước vào giảng đường đại học."
      },
      {
        id: "vd-1-1",
        stt: 3,
        name: "Lớp Vào Đời 1/1",
        group: "Vào Đời 1",
        levelBadge: "Căn Tính & Youcat Đức Tin",
        badgeColor: "red",
        age: 15,
        ageText: "15 tuổi",
        birthYear: vaoDoi1BirthYear,
        teachers: ["A.Chuẩn", "C.Nguyên"],
        room: "Phòng P12",
        roomNote: "Dãy phòng lầu 1, trang bị bảng tương tác và không gian làm việc nhóm",
        studentsCount: 25,
        status: "Đang học tập",
        time: "07:00 – 07:45",
        ca: "Ca 1 (Trước Thánh Lễ 08h00)",
        focus: "Khám phá căn tính bản thân, xác tín đức tin cá vị, phân định thiện ác và vượt thắng áp lực đồng trang lứa."
      },
      {
        id: "vd-1-2",
        stt: 4,
        name: "Lớp Vào Đời 1/2",
        group: "Vào Đời 1",
        levelBadge: "Đức Tin & Văn Hóa Số",
        badgeColor: "red",
        age: 15,
        ageText: "15 tuổi",
        birthYear: vaoDoi1BirthYear,
        teachers: ["A.Hảo", "C.Thi"],
        room: "Phòng P11",
        roomNote: "Phòng học thoáng mát lầu 1, tổ chức các buổi tọa đàm và nghiên cứu tình huống",
        studentsCount: 34,
        status: "Đang học tập",
        time: "07:00 – 07:45",
        ca: "Ca 1 (Trước Thánh Lễ 08h00)",
        focus: "Làm chủ công nghệ và mạng xã hội, giữ gìn tâm hồn trong sạch, sống bác ái và chân thật trong kỷ nguyên số."
      },
      {
        id: "vd-1-3",
        stt: 5,
        name: "Lớp Vào Đời 1/3",
        group: "Vào Đời 1",
        levelBadge: "Kỹ Năng Lãnh Đạo & Đồng Đội",
        badgeColor: "red",
        age: 15,
        ageText: "15 tuổi",
        birthYear: vaoDoi1BirthYear,
        teachers: ["C.Phấn", "A.Hoàng"],
        room: "Phòng P10",
        roomNote: "Phòng học đa năng lầu 1, rèn luyện kỹ năng mềm và sinh hoạt đội nhóm",
        studentsCount: 28,
        status: "Đang học tập",
        time: "07:00 – 07:45",
        ca: "Ca 1 (Trước Thánh Lễ 08h00)",
        focus: "Rèn luyện kỹ năng làm việc nhóm, tinh thần trách nhiệm, sinh hoạt thanh niên và tích cực dấn thân phục vụ cộng đoàn."
      }
    ]
  };
}
