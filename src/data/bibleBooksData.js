// src/data/bibleBooksData.js
// Dữ liệu chuẩn hóa 73 cuốn Kinh Thánh Công giáo (Bản dịch CGKPV)
// Kết nối trực tiếp với Supabase Storage bucket bible và Lời Chúa Mỗi Ngày

export const BIBLE_BASE_URL = "https://loichuamoingay.org/bible";

// Supabase Storage Bucket URL cho 73 file PDF Kinh Thánh
export const BIBLE_STORAGE_BUCKET_URL = "https://avrnbefzxtznpodugacz.supabase.co/storage/v1/object/public/bible";

// 46 Sách Cựu Ước (Old Testament)
export const OLD_TESTAMENT_BOOKS = [
  {
    "id": "st",
    "name": "Sáng Thế",
    "short": "St",
    "category": "Ngũ Thư",
    "chapters": 50,
    "testament": "old",
    "fileName": "01_Sang_The.pdf"
  },
  {
    "id": "xh",
    "name": "Xuất Hành",
    "short": "Xh",
    "category": "Ngũ Thư",
    "chapters": 40,
    "testament": "old",
    "fileName": "02_Xuat_Hanh.pdf"
  },
  {
    "id": "lv",
    "name": "Lê-vi",
    "short": "Lv",
    "category": "Ngũ Thư",
    "chapters": 27,
    "testament": "old",
    "fileName": "03_Le_vi.pdf"
  },
  {
    "id": "ds",
    "name": "Dân Số",
    "short": "Ds",
    "category": "Ngũ Thư",
    "chapters": 36,
    "testament": "old",
    "fileName": "04_Dan_So.pdf"
  },
  {
    "id": "dnl",
    "name": "Đệ Nhị Luật",
    "short": "Đnl",
    "category": "Ngũ Thư",
    "chapters": 34,
    "testament": "old",
    "fileName": "05_De_Nhi_Luat.pdf"
  },
  {
    "id": "gs",
    "name": "Giô-suê",
    "short": "Gs",
    "category": "Lịch Sử",
    "chapters": 24,
    "testament": "old",
    "fileName": "06_Gio_sue.pdf"
  },
  {
    "id": "tl",
    "name": "Thủ Lãnh",
    "short": "Tl",
    "category": "Lịch Sử",
    "chapters": 21,
    "testament": "old",
    "fileName": "07_Thu_Lanh.pdf"
  },
  {
    "id": "r",
    "name": "Rút",
    "short": "R",
    "category": "Lịch Sử",
    "chapters": 4,
    "testament": "old",
    "fileName": "08_Rut.pdf"
  },
  {
    "id": "1sm",
    "name": "1 Sa-mu-en",
    "short": "1 Sm",
    "category": "Lịch Sử",
    "chapters": 31,
    "testament": "old",
    "fileName": "09_1_Sa_mu_en.pdf"
  },
  {
    "id": "2sm",
    "name": "2 Sa-mu-en",
    "short": "2 Sm",
    "category": "Lịch Sử",
    "chapters": 24,
    "testament": "old",
    "fileName": "10_2_Sa_mu_en.pdf"
  },
  {
    "id": "1v",
    "name": "1 Các Vua",
    "short": "1 V",
    "category": "Lịch Sử",
    "chapters": 22,
    "testament": "old",
    "fileName": "11_1_Cac_Vua.pdf"
  },
  {
    "id": "2v",
    "name": "2 Các Vua",
    "short": "2 V",
    "category": "Lịch Sử",
    "chapters": 25,
    "testament": "old",
    "fileName": "12_2_Cac_Vua.pdf"
  },
  {
    "id": "1sb",
    "name": "1 Sử Biên Niên",
    "short": "1 Sb",
    "category": "Lịch Sử",
    "chapters": 29,
    "testament": "old",
    "fileName": "13_1_Su_Bien_Nien.pdf"
  },
  {
    "id": "2sb",
    "name": "2 Sử Biên Niên",
    "short": "2 Sb",
    "category": "Lịch Sử",
    "chapters": 36,
    "testament": "old",
    "fileName": "14_2_Su_Bien_Nien.pdf"
  },
  {
    "id": "er",
    "name": "Ét-ra",
    "short": "Er",
    "category": "Lịch Sử",
    "chapters": 10,
    "testament": "old",
    "fileName": "15_Et_ra.pdf"
  },
  {
    "id": "nhm",
    "name": "Nê-he-mi-a",
    "short": "Nhm",
    "category": "Lịch Sử",
    "chapters": 13,
    "testament": "old",
    "fileName": "16_Ne_he_mi_a.pdf"
  },
  {
    "id": "tb",
    "name": "Tô-bi-a",
    "short": "Tb",
    "category": "Lịch Sử",
    "chapters": 14,
    "testament": "old",
    "fileName": "17_To_bi_a.pdf"
  },
  {
    "id": "gdt",
    "name": "Giu-đi-tha",
    "short": "Gđt",
    "category": "Lịch Sử",
    "chapters": 16,
    "testament": "old",
    "fileName": "18_Giu_di_tha.pdf"
  },
  {
    "id": "et",
    "name": "Ê-sơ-te",
    "short": "Et",
    "category": "Lịch Sử",
    "chapters": 10,
    "testament": "old",
    "fileName": "19_E_so_te.pdf"
  },
  {
    "id": "1mc",
    "name": "1 Ma-ca-bê",
    "short": "1 Mc",
    "category": "Lịch Sử",
    "chapters": 16,
    "testament": "old",
    "fileName": "20_1_Ma_ca_be.pdf"
  },
  {
    "id": "2mc",
    "name": "2 Ma-ca-bê",
    "short": "2 Mc",
    "category": "Lịch Sử",
    "chapters": 15,
    "testament": "old",
    "fileName": "21_2_Ma_ca_be.pdf"
  },
  {
    "id": "g",
    "name": "Gióp",
    "short": "G",
    "category": "Giáo Huấn",
    "chapters": 42,
    "testament": "old",
    "fileName": "22_Giop.pdf"
  },
  {
    "id": "tv",
    "name": "Thánh Vịnh",
    "short": "Tv",
    "category": "Giáo Huấn",
    "chapters": 150,
    "testament": "old",
    "fileName": "23_Thanh_Vinh.pdf"
  },
  {
    "id": "cn",
    "name": "Châm Ngôn",
    "short": "Cn",
    "category": "Giáo Huấn",
    "chapters": 31,
    "testament": "old",
    "fileName": "24_Cham_Ngon.pdf"
  },
  {
    "id": "gv",
    "name": "Giảng Viên",
    "short": "Gv",
    "category": "Giáo Huấn",
    "chapters": 12,
    "testament": "old",
    "fileName": "25_Giang_Vien.pdf"
  },
  {
    "id": "dc",
    "name": "Diễm Ca",
    "short": "Dc",
    "category": "Giáo Huấn",
    "chapters": 8,
    "testament": "old",
    "fileName": "26_Diem_Ca.pdf"
  },
  {
    "id": "kn",
    "name": "Khôn Ngoan",
    "short": "Kn",
    "category": "Giáo Huấn",
    "chapters": 19,
    "testament": "old",
    "fileName": "27_Khon_Ngoan.pdf"
  },
  {
    "id": "hc",
    "name": "Huấn Ca",
    "short": "Hc",
    "category": "Giáo Huấn",
    "chapters": 51,
    "testament": "old",
    "fileName": "28_Huan_Ca.pdf"
  },
  {
    "id": "is",
    "name": "I-sai-a",
    "short": "Is",
    "category": "Ngôn Sứ",
    "chapters": 66,
    "testament": "old",
    "fileName": "29_I_sai_a.pdf"
  },
  {
    "id": "gr",
    "name": "Giê-rê-mi-a",
    "short": "Gr",
    "category": "Ngôn Sứ",
    "chapters": 52,
    "testament": "old",
    "fileName": "30_Gie_re_mi_a.pdf"
  },
  {
    "id": "ac",
    "name": "Ai Ca",
    "short": "Ac",
    "category": "Ngôn Sứ",
    "chapters": 5,
    "testament": "old",
    "fileName": "31_Ai_Ca.pdf"
  },
  {
    "id": "br",
    "name": "Ba-rúc",
    "short": "Br",
    "category": "Ngôn Sứ",
    "chapters": 6,
    "testament": "old",
    "fileName": "32_Ba_ruc.pdf"
  },
  {
    "id": "ed",
    "name": "Ê-dê-ki-en",
    "short": "Ed",
    "category": "Ngôn Sứ",
    "chapters": 48,
    "testament": "old",
    "fileName": "33_E_de_ki_en.pdf"
  },
  {
    "id": "dn",
    "name": "Đa-ni-en",
    "short": "Đn",
    "category": "Ngôn Sứ",
    "chapters": 14,
    "testament": "old",
    "fileName": "34_Da_ni_en.pdf"
  },
  {
    "id": "hs",
    "name": "Hô-sê",
    "short": "Hs",
    "category": "Ngôn Sứ",
    "chapters": 14,
    "testament": "old",
    "fileName": "35_Ho_se.pdf"
  },
  {
    "id": "ge",
    "name": "Giô-en",
    "short": "Ge",
    "category": "Ngôn Sứ",
    "chapters": 4,
    "testament": "old",
    "fileName": "36_Gio_en.pdf"
  },
  {
    "id": "am",
    "name": "A-mốt",
    "short": "Am",
    "category": "Ngôn Sứ",
    "chapters": 9,
    "testament": "old",
    "fileName": "37_A_mot.pdf"
  },
  {
    "id": "ov",
    "name": "Ô-va-đi-a",
    "short": "Ôv",
    "category": "Ngôn Sứ",
    "chapters": 1,
    "testament": "old",
    "fileName": "38_O_va_di_a.pdf"
  },
  {
    "id": "gn",
    "name": "Giô-na",
    "short": "Gn",
    "category": "Ngôn Sứ",
    "chapters": 4,
    "testament": "old",
    "fileName": "39_Gio_na.pdf"
  },
  {
    "id": "mk",
    "name": "Mi-kha",
    "short": "Mk",
    "category": "Ngôn Sứ",
    "chapters": 7,
    "testament": "old",
    "fileName": "40_Mi_kha.pdf"
  },
  {
    "id": "nh",
    "name": "Na-hum",
    "short": "Nh",
    "category": "Ngôn Sứ",
    "chapters": 3,
    "testament": "old",
    "fileName": "41_Na_hum.pdf"
  },
  {
    "id": "hb",
    "name": "Ha-ba-cúc",
    "short": "Hb",
    "category": "Ngôn Sứ",
    "chapters": 3,
    "testament": "old",
    "fileName": "42_Ha_ba_cuc.pdf"
  },
  {
    "id": "xp",
    "name": "Xô-phô-ni-a",
    "short": "Xp",
    "category": "Ngôn Sứ",
    "chapters": 3,
    "testament": "old",
    "fileName": "43_Xo_pho_ni_a.pdf"
  },
  {
    "id": "kg",
    "name": "Khắc-gai",
    "short": "Kg",
    "category": "Ngôn Sứ",
    "chapters": 2,
    "testament": "old",
    "fileName": "44_Khac_gai.pdf"
  },
  {
    "id": "dcr",
    "name": "Da-ca-ri-a",
    "short": "Dcr",
    "category": "Ngôn Sứ",
    "chapters": 14,
    "testament": "old",
    "fileName": "45_Da_ca_ri_a.pdf"
  },
  {
    "id": "ml",
    "name": "Ma-la-khi",
    "short": "Ml",
    "category": "Ngôn Sứ",
    "chapters": 3,
    "testament": "old",
    "fileName": "46_Ma_la_khi.pdf"
  }
];

// 27 Sách Tân Ước (New Testament)
export const NEW_TESTAMENT_BOOKS = [
  {
    "id": "mt",
    "name": "Mát-thêu",
    "short": "Mt",
    "category": "Tin Mừng",
    "chapters": 28,
    "testament": "new",
    "fileName": "47_Tin_Mung_Theo_Thanh_Mat_theu.pdf"
  },
  {
    "id": "mc",
    "name": "Mác-cô",
    "short": "Mc",
    "category": "Tin Mừng",
    "chapters": 16,
    "testament": "new",
    "fileName": "48_Tin_Mung_Theo_Thanh_Mac_co.pdf"
  },
  {
    "id": "lc",
    "name": "Lu-ca",
    "short": "Lc",
    "category": "Tin Mừng",
    "chapters": 24,
    "testament": "new",
    "fileName": "49_Tin_Mung_Theo_Thanh_Lu_ca.pdf"
  },
  {
    "id": "ga",
    "name": "Gio-an",
    "short": "Ga",
    "category": "Tin Mừng",
    "chapters": 21,
    "testament": "new",
    "fileName": "50_Tin_Mung_Theo_Thanh_Gio_an.pdf"
  },
  {
    "id": "cv",
    "name": "Công Vụ Tông Đồ",
    "short": "Cv",
    "category": "Lịch Sử",
    "chapters": 28,
    "testament": "new",
    "fileName": "51_Cong_Vu_Tong_Do.pdf"
  },
  {
    "id": "rm",
    "name": "Rô-ma",
    "short": "Rm",
    "category": "Thư Tông Đồ",
    "chapters": 16,
    "testament": "new",
    "fileName": "52_Thu_Gui_Tin_Huu_Ro_ma.pdf"
  },
  {
    "id": "1cr",
    "name": "1 Cô-rin-tô",
    "short": "1 Cr",
    "category": "Thư Tông Đồ",
    "chapters": 16,
    "testament": "new",
    "fileName": "53_Thu_Thu_Nhat_Gui_Tin_Huu_Co_rin_to.pdf"
  },
  {
    "id": "2cr",
    "name": "2 Cô-rin-tô",
    "short": "2 Cr",
    "category": "Thư Tông Đồ",
    "chapters": 13,
    "testament": "new",
    "fileName": "54_Thu_Thu_Hai_Gui_Tin_Huu_Co_rin_to.pdf"
  },
  {
    "id": "gl",
    "name": "Ga-lát",
    "short": "Gl",
    "category": "Thư Tông Đồ",
    "chapters": 6,
    "testament": "new",
    "fileName": "55_Thu_Gui_Tin_Huu_Ga_la_ti.pdf"
  },
  {
    "id": "ep",
    "name": "Ê-phê-xô",
    "short": "Ep",
    "category": "Thư Tông Đồ",
    "chapters": 6,
    "testament": "new",
    "fileName": "56_Thu_Gui_Tin_Huu_E_phe_xo.pdf"
  },
  {
    "id": "pl",
    "name": "Phi-líp-phê",
    "short": "Pl",
    "category": "Thư Tông Đồ",
    "chapters": 4,
    "testament": "new",
    "fileName": "57_Thu_Gui_Tin_Huu_Phi_lip_phe.pdf"
  },
  {
    "id": "cl",
    "name": "Cô-lô-xê",
    "short": "Cl",
    "category": "Thư Tông Đồ",
    "chapters": 4,
    "testament": "new",
    "fileName": "58_Thu_Gui_Tin_Huu_Co_lo_xe.pdf"
  },
  {
    "id": "1tx",
    "name": "1 Thê-xa-lô-ni-ca",
    "short": "1 Tx",
    "category": "Thư Tông Đồ",
    "chapters": 5,
    "testament": "new",
    "fileName": "59_Thu_Thu_Nhat_Gui_Tin_Huu_The_xa_lo_ni_ca.pdf"
  },
  {
    "id": "2tx",
    "name": "2 Thê-xa-lô-ni-ca",
    "short": "2 Tx",
    "category": "Thư Tông Đồ",
    "chapters": 3,
    "testament": "new",
    "fileName": "60_Thu_Thu_Hai_Gui_Tin_Huu_The_xa_lo_ni_ca.pdf"
  },
  {
    "id": "1tm",
    "name": "1 Ti-mô-thê",
    "short": "1 Tm",
    "category": "Thư Tông Đồ",
    "chapters": 6,
    "testament": "new",
    "fileName": "61_Thu_Thu_Nhat_Gui_Ong_Ti_mo_the.pdf"
  },
  {
    "id": "2tm",
    "name": "2 Ti-mô-thê",
    "short": "2 Tm",
    "category": "Thư Tông Đồ",
    "chapters": 4,
    "testament": "new",
    "fileName": "62_Thu_Thu_Hai_Gui_Ong_Ti_mo_the.pdf"
  },
  {
    "id": "tt",
    "name": "Ti-tô",
    "short": "Tt",
    "category": "Thư Tông Đồ",
    "chapters": 3,
    "testament": "new",
    "fileName": "63_Thu_Gui_Ong_Ti_to.pdf"
  },
  {
    "id": "plm",
    "name": "Phi-lê-môn",
    "short": "Plm",
    "category": "Thư Tông Đồ",
    "chapters": 1,
    "testament": "new",
    "fileName": "64_Thu_Gui_Ong_Phi_le_mon.pdf"
  },
  {
    "id": "dt",
    "name": "Do Thái",
    "short": "Dt",
    "category": "Thư Tông Đồ",
    "chapters": 13,
    "testament": "new",
    "fileName": "65_Thu_Gui_Tin_Huu_Do_thai.pdf"
  },
  {
    "id": "gc",
    "name": "Gia-cô-bê",
    "short": "Gc",
    "category": "Thư Tông Đồ",
    "chapters": 5,
    "testament": "new",
    "fileName": "66_Thu_Cua_Thanh_Gia_co_be.pdf"
  },
  {
    "id": "1pr",
    "name": "1 Phê-rô",
    "short": "1 Pr",
    "category": "Thư Tông Đồ",
    "chapters": 5,
    "testament": "new",
    "fileName": "67_Thu_Thu_Nhat_Cua_Thanh_Phe_ro.pdf"
  },
  {
    "id": "2pr",
    "name": "2 Phê-rô",
    "short": "2 Pr",
    "category": "Thư Tông Đồ",
    "chapters": 3,
    "testament": "new",
    "fileName": "68_Thu_Thu_Hai_Cua_Thanh_Phe_ro.pdf"
  },
  {
    "id": "1ga",
    "name": "1 Gio-an",
    "short": "1 Ga",
    "category": "Thư Tông Đồ",
    "chapters": 5,
    "testament": "new",
    "fileName": "69_Thu_Thu_Nhat_Cua_Thanh_Gio_an.pdf"
  },
  {
    "id": "2ga",
    "name": "2 Gio-an",
    "short": "2 Ga",
    "category": "Thư Tông Đồ",
    "chapters": 1,
    "testament": "new",
    "fileName": "70_Thu_Thu_Hai_Cua_Thanh_Gio_an.pdf"
  },
  {
    "id": "3ga",
    "name": "3 Gio-an",
    "short": "3 Ga",
    "category": "Thư Tông Đồ",
    "chapters": 1,
    "testament": "new",
    "fileName": "71_Thu_Thu_Ba_Cua_Thanh_Gio_an.pdf"
  },
  {
    "id": "gd",
    "name": "Giu-đa",
    "short": "Gđ",
    "category": "Thư Tông Đồ",
    "chapters": 1,
    "testament": "new",
    "fileName": "72_Thu_Cua_Thanh_Giu_da.pdf"
  },
  {
    "id": "kh",
    "name": "Khải Huyền",
    "short": "Kh",
    "category": "Khải Huyền",
    "chapters": 22,
    "testament": "new",
    "fileName": "73_Sach_Khai_Huyen.pdf"
  }
];

// Trọn bộ 73 cuốn sách
export const ALL_BIBLE_BOOKS = [...OLD_TESTAMENT_BOOKS, ...NEW_TESTAMENT_BOOKS];

/**
 * Tạo link mở trực tiếp chương sách trên loichuamoingay.org
 * @param {string} bookId - Mã sách (ví dụ: st, mt, tv)
 * @param {number|string} chapter - Số chương (mặc định là 1)
 */
export function getBibleDeepLink(bookId, chapter = 1) {
  if (!bookId) return BIBLE_BASE_URL;
  return `${BIBLE_BASE_URL}/${bookId}/${chapter}`;
}

/**
 * Lấy link tải file PDF chính thức của từng quyển sách từ Supabase Storage bucket bible
 * @param {string} bookId - Mã sách
 */
export function getBibleBookPdfUrl(bookId) {
  const book = findBookById(bookId);
  if (!book || !book.fileName) return null;
  return `${BIBLE_STORAGE_BUCKET_URL}/${book.fileName}`;
}

/**
 * Tìm thông tin sách theo ID
 */
/**
 * Danh sách các nhóm phân loại Kinh Thánh chuẩn mực
 */
export const BIBLE_CATEGORIES = [
  { id: "all", label: "Tất cả 73 Sách", count: 73 },
  { id: "old", label: "Cựu Ước", count: 46 },
  { id: "new", label: "Tân Ước", count: 27 },
  { id: "Ngũ Thư", label: "Ngũ Thư (Torah)", count: 5, testament: "old" },
  { id: "Lịch Sử", label: "Lịch Sử", count: 17 },
  { id: "Giáo Huấn", label: "Khôn Ngoan & Thi Ca", count: 7, testament: "old" },
  { id: "Ngôn Sứ", label: "Các Ngôn Sứ", count: 18, testament: "old" },
  { id: "Tin Mừng", label: "Bốn Tin Mừng", count: 4, testament: "new" },
  { id: "Thư Tông Đồ", label: "Thư Phaolô & Tông Đồ", count: 21, testament: "new" },
  { id: "Khải Huyền", label: "Khải Huyền", count: 1, testament: "new" }
];

/**
 * Tóm tắt ý nghĩa và bối cảnh từng nhóm thể loại sách
 */
export const BIBLE_CATEGORY_INFO = {
  "Ngũ Thư": "Bộ năm sách Luật (Torah) nền tảng, công trình tạo dựng và giao ước nguyên khởi của Thiên Chúa.",
  "Lịch Sử": "Hành trình sống động của Dân Chúa từ thời các Thủ lãnh đến các Vua và thời lưu đày phục hưng.",
  "Giáo Huấn": "Kho tàng thánh vịnh cầu nguyện, thi ca tâm linh và lẽ khôn ngoan sâu sắc cho đời sống Kitô hữu.",
  "Ngôn Sứ": "Tiếng nói can đảm cảnh tỉnh dân tộc, loan báo ơn công chính và tiên tri Đấng Mêsia Cứu Độ.",
  "Tin Mừng": "Trung tâm của toàn bộ Kinh Thánh: Cuộc đời, lời giảng dạy và mầu nhiệm Vượt Qua của Chúa Giêsu Kitô.",
  "Thư Tông Đồ": "Những bức tâm thư đầy nhiệt huyết của các Tông đồ gửi các cộng đoàn Hội Thánh tiên khởi.",
  "Khải Huyền": "Bức tranh tiên tri tràn đầy niềm hy vọng Kitô giáo về sự vinh thắng cuối cùng của Thiên Chúa Tình Yêu."
};

/**
 * Lấy sách trước và sách kế tiếp để điều hướng liền mạch
 */
export function getAdjacentBooks(bookId) {
  if (!bookId) return { prev: null, next: null };
  const cleanId = String(bookId).toLowerCase().trim();
  const idx = ALL_BIBLE_BOOKS.findIndex((b) => b.id === cleanId);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? ALL_BIBLE_BOOKS[idx - 1] : null,
    next: idx < ALL_BIBLE_BOOKS.length - 1 ? ALL_BIBLE_BOOKS[idx + 1] : null
  };
}

/**
 * Tìm thông tin sách theo ID
 */
export function findBookById(id) {
  if (!id) return null;
  const cleanId = String(id).toLowerCase().trim();
  return ALL_BIBLE_BOOKS.find((b) => b.id === cleanId) || null;
}

/**
 * Tìm kiếm sách theo từ khóa (tên đầy đủ, tên viết tắt, nhóm) và lọc theo phân loại
 */
export function searchBibleBooks(query, filter = "all") {
  let list = ALL_BIBLE_BOOKS;
  if (filter === "old") {
    list = OLD_TESTAMENT_BOOKS;
  } else if (filter === "new") {
    list = NEW_TESTAMENT_BOOKS;
  } else if (filter && filter !== "all") {
    list = ALL_BIBLE_BOOKS.filter((b) => b.category === filter);
  }

  if (!query || !query.trim()) return list;

  const normalized = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  return list.filter((b) => {
    const nameNorm = b.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const shortNorm = b.short.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const catNorm = (b.category || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return nameNorm.includes(normalized) || shortNorm.includes(normalized) || catNorm.includes(normalized);
  });
}
