/**
 * liturgyCalendar.js
 *
 * Tính liturgy_key + displayName từ ngày dương lịch.
 * Đã được bản địa hoá cho Lịch Công giáo Việt Nam.
 *
 * ── Key format ──────────────────────────────────
 *  Ngày thường:  {season}_{week}_{dow}   → thuong_12_thu2
 *  Chúa Nhật:    {season}_cn_{week}      → thuong_cn_12
 *  Không tuần:   {season}_{dow}          → giang_sinh_thu3
 *  Lễ:           feast_{name}            → feast_giang_sinh
 *
 * ── Season values ───────────────────────────────
 *  vong | giang_sinh | thuong | chay | tuan_thanh | phucsinh | feast
 */
import { computeDateFromLunarDate } from 'amlich.js';

/* ─── Helpers ─────────────────────────────────── */
const addDays  = (date, n)  => { const d = new Date(date); d.setDate(d.getDate() + n); return d; };
const diffDays = (a, b)     => Math.round((a - b) / 86_400_000);
const sameDay  = (a, b)     => a.toDateString() === b.toDateString();

const DOW_VI  = ["Chúa Nhật","Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy"];
const DOW_KEY = ["cn","thu2","thu3","thu4","thu5","thu6","thu7"];
const ROMAN   = ["","I","II","III","IV","V","VI","VII","VIII","IX","X",
  "XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX",
  "XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX",
  "XXXI","XXXII","XXXIII","XXXIV"];

/* ─── Lễ cố định  MMDD → { key, name } ──────── */
const FIXED_FEASTS = {
  "0101": { key: "feast_01_01",  name: "Lễ Đức Mẹ - Mẹ Thiên Chúa", rank: 5 },
  "0117": { key: "feast_01_17",  name: "Thánh An-tôn, viện phụ", rank: 14 },
  "0125": { key: "feast_01_25",  name: "Lễ Thánh Phaolô tông đồ trở lại", rank: 10 },
  "0126": { key: "feast_01_26",  name: "Thánh Timôthê và thánh Titô, giám mục", rank: 14 },
  "0202": { key: "feast_02_02",  name: "Lễ Dâng Chúa Giê-su trong đền thánh", rank: 8 },
  "0206": { key: "feast_02_06",  name: "Thánh Phaolô Miki và các bạn tử đạo", rank: 14 },
  "0211": { key: "feast_02_11",  name: "Lễ Đức Mẹ Lộ Đức", rank: 14 },
  "0222": { key: "feast_02_22",  name: "Lễ Lập Tông Tòa Thánh Phêrô", rank: 10 },
  "0425": { key: "feast_04_25",  name: "Lễ Thánh Máccô, tác giả sách Tin Mừng", rank: 10 },
  "0501": { key: "feast_05_01",  name: "Thánh Giu-se thợ", rank: 14 },
  "0503": { key: "feast_05_03",  name: "Lễ Thánh Philípphê và thánh Giacôbê, tông đồ", rank: 10 },
  "0514": { key: "feast_05_14",  name: "Lễ Thánh Matthia tông đồ", rank: 10 },
  "0531": { key: "feast_05_31",  name: "Lễ Đức Mẹ thăm viếng bà Êlisabét", rank: 10 },
  "0611": { key: "feast_06_11",  name: "Thánh Banaba tông đồ", rank: 14 },
  "0624": { key: "feast_06_24",  name: "Lễ Sinh Nhật Thánh Gioan Tẩy Giả", rank: 5 },
  "0628": { key: "feast_06_28",  name: "Thánh I-rê-nê, giám mục, tử đạo", rank: 14 },
  "0629": { key: "feast_06_29",  name: "Lễ Thánh Phêrô và Phaolô", rank: 5 },
  "0703": { key: "feast_07_03",  name: "Lễ Thánh Tôma tông đồ", rank: 10 },
  "0711": { key: "feast_07_11",  name: "Thánh Biển Đức, viện phụ", rank: 14 },
  "0722": { key: "feast_07_22",  name: "Lễ Thánh Maria Mađalêna", rank: 10 },
  "0725": { key: "feast_07_25",  name: "Lễ Thánh Giacôbê tông đồ", rank: 10 },
  "0726": { key: "feast_07_26",  name: "Thánh Gioan-kim và thánh An-na, song thân Đức Maria", rank: 14 },
  "0729": { key: "feast_07_29",  name: "Thánh Martha, Maria và Ladarô", rank: 14 },
  "0731": { key: "feast_07_31",  name: "Thánh Inhaxiô Lôyôla, linh mục", rank: 14 },
  "0804": { key: "feast_08_04",  name: "Thánh Gioan Maria Vianê, linh mục", rank: 14 },
  "0806": { key: "feast_08_06",  name: "Lễ Chúa Hiển Dung", rank: 8 },
  "0808": { key: "feast_08_08",  name: "Thánh Đa Minh, linh mục", rank: 14 },
  "0810": { key: "feast_08_10",  name: "Lễ Thánh Lôrensô, phó tế tử đạo", rank: 10 },
  "0815": { key: "feast_08_15",  name: "Lễ Đức Mẹ Lên Trời", rank: 5 },
  "0821": { key: "feast_08_21",  name: "Thánh Pi-ô X, giáo hoàng", rank: 14 },
  "0822": { key: "feast_08_22",  name: "Đức Maria Nữ Vương", rank: 14 },
  "0824": { key: "feast_08_24",  name: "Lễ Thánh Batôlômêô tông đồ", rank: 10 },
  "0827": { key: "feast_08_27",  name: "Thánh nữ Mô-ni-ca", rank: 14 },
  "0828": { key: "feast_08_28",  name: "Thánh Âu-tinh, giám mục, tiến sĩ Hội Thánh", rank: 14 },
  "0829": { key: "feast_08_29",  name: "Thánh Gioan Tẩy Giả bị trảm quyết", rank: 14 },
  "0908": { key: "feast_09_08",  name: "Lễ Sinh Nhật Đức Trinh Nữ Maria", rank: 10 },
  "0914": { key: "feast_09_14",  name: "Lễ Suy tôn Thánh Giá", rank: 8 },
  "0915": { key: "feast_09_15",  name: "Đức Mẹ Sầu Bi", rank: 14 },
  "0921": { key: "feast_09_21",  name: "Lễ Thánh Matthêu tông đồ, tác giả sách Tin Mừng", rank: 10 },
  "0927": { key: "feast_09_27",  name: "Thánh Vinh-sơn Phao-lô, linh mục", rank: 14 },
  "0929": { key: "feast_09_29",  name: "Lễ các Tổng Lãnh Thiên Thần", rank: 10 },
  "0930": { key: "feast_09_30",  name: "Thánh Giê-rô-ni-mô, linh mục, tiến sĩ Hội Thánh", rank: 14 },
  "1001": { key: "feast_10_01",  name: "Thánh Têrêsa Hài Đồng Giêsu, trinh nữ, tiến sĩ Hội Thánh", rank: 14 },
  "1002": { key: "feast_10_02",  name: "Các Thiên Thần Hộ Thủ", rank: 14 },
  "1004": { key: "feast_10_04",  name: "Thánh Phanxicô Assisi", rank: 14 },
  "1007": { key: "feast_10_07",  name: "Đức Mẹ Mân Côi", rank: 14 },
  "1015": { key: "feast_10_15",  name: "Thánh Têrêsa Avila, trinh nữ, tiến sĩ Hội Thánh", rank: 14 },
  "1017": { key: "feast_10_17",  name: "Thánh Inhaxiô Antiôkhia, giám mục, tử đạo", rank: 14 },
  "1018": { key: "feast_10_18",  name: "Lễ Thánh Luca, tác giả sách Tin Mừng", rank: 10 },
  "1028": { key: "feast_10_28",  name: "Lễ Thánh Simôn và thánh Giuđa, tông đồ", rank: 10 },
  "1101": { key: "feast_11_01",  name: "Lễ Các Thánh", rank: 5 },
  "1102": { key: "feast_11_02",  name: "Lễ Các Đẳng Linh Hồn", rank: 6 },
  "1109": { key: "feast_11_09",  name: "Lễ Cung hiến Đền thờ La-tê-ra-nô", rank: 10 },
  "1118": { key: "feast_11_18",  name: "Cung hiến thánh đường thánh Phêrô và thánh đường thánh Phaolô", rank: 14 },
  "1121": { key: "feast_11_21",  name: "Đức Mẹ dâng mình trong đền thờ", rank: 14 },
  "1124": { key: "feast_11_24",  name: "Các thánh tử đạo Việt Nam", rank: 14 },
  "1130": { key: "feast_11_30",  name: "Lễ Thánh Anrê tông đồ", rank: 10 },
  "1203": { key: "feast_12_03",  name: "Thánh Phanxicô Xaviê", rank: 14 },
  "1208": { key: "feast_12_08",  name: "Lễ Đức Mẹ Vô Nhiễm Nguyên Tội", rank: 5 },
  "1217": { key: "feast_12_17",  name: "Ngày 17 tháng 12", rank: 11 },
  "1218": { key: "feast_12_18",  name: "Ngày 18 tháng 12", rank: 11 },
  "1219": { key: "feast_12_19",  name: "Ngày 19 tháng 12", rank: 11 },
  "1220": { key: "feast_12_20",  name: "Ngày 20 tháng 12", rank: 11 },
  "1221": { key: "feast_12_21",  name: "Ngày 21 tháng 12", rank: 11 },
  "1222": { key: "feast_12_22",  name: "Ngày 22 tháng 12", rank: 11 },
  "1223": { key: "feast_12_23",  name: "Ngày 23 tháng 12", rank: 11 },
  "1224": { key: "feast_12_24",  name: "Lễ Giáng Sinh - Lễ Đêm", rank: 2 },
  "1225": { key: "feast_12_25",  name: "Lễ Giáng Sinh - Lễ Ngày", rank: 2 },
  "1226": { key: "feast_12_26",  name: "Lễ Thánh Stêphanô", rank: 10 },
  "1227": { key: "feast_12_27",  name: "Lễ Thánh Gioan Tông Đồ", rank: 10 },
  "1228": { key: "feast_12_28",  name: "Lễ Các Thánh Anh Hài", rank: 10 },
  "1229": { key: "feast_12_29",  name: "Ngày thứ năm trong tuần Bát Nhật Giáng Sinh", rank: 12 },
  "1230": { key: "feast_12_30",  name: "Ngày thứ sáu trong tuần Bát Nhật Giáng Sinh", rank: 12 },
  "1231": { key: "feast_12_31",  name: "Ngày thứ bảy trong tuần Bát Nhật Giáng Sinh", rank: 12 },
};

/* ─── Phục Sinh — Meeus/Jones/Butcher ─────────── */
function getEaster(year) {
  const a=year%19, b=Math.floor(year/100), c=year%100,
        d=Math.floor(b/4), e=b%4, f=Math.floor((b+8)/25),
        g=Math.floor((b-f+1)/3), h=(19*a+b-d-g+15)%30,
        i=Math.floor(c/4), k=c%4, l=(32+2*e+2*i-h-k)%7,
        m=Math.floor((a+11*h+22*l)/451),
        month=Math.floor((h+l-7*m+114)/31),
        day=((h+l-7*m+114)%31)+1;
  return new Date(year, month-1, day);
}

/* ─── Lễ Hiển Linh (Việt Nam) ────────────────── */
// Ở VN: Lễ Hiển Linh dời vào Chúa Nhật trong khoảng 2/1 - 8/1
function getEpiphany(year) {
  for (let day = 2; day <= 8; day++) {
    const d = new Date(year, 0, day);
    if (d.getDay() === 0) return d;
  }
}

/* ─── Lễ Chúa chịu phép rửa (Việt Nam) ────────── */
// Nếu Hiển Linh vào 7/1 hoặc 8/1 -> Lễ Phép Rửa vào Thứ Hai liền sau. Ngược lại vào Chúa Nhật liền sau.
function getBaptismOfLord(year) {
  const epiphany = getEpiphany(year);
  if (epiphany.getDate() === 7 || epiphany.getDate() === 8) {
    return addDays(epiphany, 1); // Thứ Hai
  }
  return addDays(epiphany, 7); // Chúa Nhật
}

/* ─── CN đầu Mùa Vọng ─────────────────────────── */
// Có đúng 4 Chúa Nhật Mùa Vọng trước 25/12
function getFirstAdvent(year) {
  const dec25 = new Date(year, 11, 25);
  const dow = dec25.getDay();
  // Tìm Chúa Nhật liền trước 25/12 (là CN IV MV)
  const daysToLastSunday = dow === 0 ? 7 : dow; 
  const fourthSunday = addDays(dec25, -daysToLastSunday);
  // Lùi 3 tuần sẽ ra CN I MV
  return addDays(fourthSunday, -21);
}

/* ─── Lễ Thánh Gia Thất ─────────────────────────── */
// Rơi vào Chúa Nhật trong tuần Bát Nhật Giáng Sinh. Nếu Giáng Sinh là Chúa Nhật thì dời sang 30/12.
function getHolyFamily(year) {
  const dec25 = new Date(year, 11, 25);
  const dow = dec25.getDay();
  if (dow === 0) { 
    return new Date(year, 11, 30);
  } else {
    const daysUntilSunday = 7 - dow;
    return addDays(dec25, daysUntilSunday);
  }
}

/* ─── Thuật toán Dời ngày Lễ Trọng (St Joseph & Annunciation) ─── */
function getStJoseph(year, easter) {
  const palmSunday = addDays(easter, -7);
  let d = new Date(year, 2, 19); // Mar 19
  // Va chạm Chúa Nhật Mùa Chay -> dời sang Thứ Hai
  if (d.getDay() === 0 && d < palmSunday) return addDays(d, 1);
  // Va chạm Tuần Thánh -> dời về Thứ Bảy trước Lễ Lá
  if (d >= palmSunday && d < easter) return addDays(palmSunday, -1);
  return d;
}

function getAnnunciation(year, easter) {
  const palmSunday = addDays(easter, -7);
  const divineMercy = addDays(easter, 7);
  let d = new Date(year, 2, 25); // Mar 25
  // Va chạm Chúa Nhật Mùa Chay -> dời sang Thứ Hai
  if (d.getDay() === 0 && d < palmSunday) return addDays(d, 1);
  // Va chạm Tuần Thánh hoặc Bát Nhật Phục Sinh -> dời sang Thứ Hai sau Lòng Chúa Thương Xót
  if (d >= palmSunday && d <= divineMercy) return addDays(divineMercy, 1);
  return d;
}

/* ─── Thuật toán Tết Nguyên Đán (Âm Lịch) ─── */
function getTet(year) {
  // Lấy Mùng 1 Tết Âm Lịch của năm đó (Tháng 1, Ngày 1)
  const tet = computeDateFromLunarDate(1, 1, year, 0, 7);
  // month trả về từ amlich.js là 0-indexed (0 = Tháng 1)
  return new Date(tet.year, tet.month, tet.day);
}

/* ─── Thuật toán Tết Trung Thu (Âm Lịch) ─── */
function getTrungThu(year) {
  // Lấy Ngày 15 Tháng 8 Âm Lịch của năm đó
  const date = computeDateFromLunarDate(15, 8, year, 0, 7);
  return new Date(date.year, date.month, date.day);
}

/* ─── Lễ di động ─────────────────────────────── */
function getMovableFeast(d, ms) {
  const pairs = [
    [ms.hienLinh,      "hien_linh",         "Lễ Chúa Hiển Linh", 2],
    [ms.baptismOfLord, "phep_rua",          "Lễ Chúa Chịu Phép Rửa", 8],
    [ms.stJoseph,      "03_19",             "Lễ Thánh Giu-se, Bạn Trăm Năm Đức Maria", 5],
    [ms.annunciation,  "03_25",             "Lễ Truyền Tin", 5],
    [ms.tet_1,         "tet_1",             "Mồng Một Tết Nguyên Đán: Thánh lễ Tân Niên", 7],
    [ms.tet_2,         "tet_2",             "Mồng Hai Tết Nguyên Đán: Kính nhớ Tổ tiên", 7],
    [ms.tet_3,         "tet_3",             "Mồng Ba Tết Nguyên Đán: Thánh hóa công ăn việc làm", 7],
    [ms.trung_thu,     "trung_thu",         "Tết Trung Thu: Lễ Cầu cho Thiếu Nhi", 14],
    [ms.ashWednesday,  "le_tro",            "Thứ Tư Lễ Tro", 4],
    [ms.palmSunday,    "cn_le_la",          "Chúa Nhật Lễ Lá", 1],
    [ms.holyThursday,  "thu5_tuan_thanh",   "Thứ Năm Tuần Thánh", 1],
    [ms.goodFriday,    "thu6_tuan_thanh",   "Thứ Sáu Tuần Thánh", 1],
    [ms.holySaturday,  "thu7_tuan_thanh",   "Thứ Bảy Tuần Thánh", 1],
    [ms.easterSunday,  "phuc_sinh",         "Chúa Nhật Phục Sinh", 1],
    [ms.ascension,     "chua_thang_thien",  "Lễ Chúa Thăng Thiên", 2],
    [ms.pentecost,     "hien_xuong",        "Lễ Chúa Thánh Thần Hiện Xuống", 2],
    [ms.trinityunday,  "ba_ngoi",           "Lễ Chúa Ba Ngôi", 5],
    [ms.corpuschristi, "minh_mau_chua",     "Lễ Mình Máu Thánh Chúa", 5],
    [ms.sacredHeart,   "thanh_tam",         "Lễ Thánh Tâm Chúa Giê-su", 5],
    [ms.immaculateHeart, "trai_tim_duc_me", "Lễ Trái Tim Vô Nhiễm Đức Mẹ", 14],
    [ms.holyFamily,    "gia_that",          "Lễ Thánh Gia Thất", 8],
  ];
  const matches = [];
  for (const [feast, key, name, rank] of pairs) {
    if (feast && sameDay(d, feast)) {
      matches.push({ key: `feast_${key}`, displayName: name, season: "feast", week: null, isSunday: d.getDay()===0, isFeast: true, rank });
    }
  }
  return matches;
}

/* ─── Tạo result object ───────────────────────── */
function buildResult(season, week, dow, seasonName, rankOverride = null) {
  const isSunday = dow === 0;
  const roman    = week ? ROMAN[week] : null;
  let key, displayName;

  if (week === null || week === 0) {
    displayName = `${DOW_VI[dow]} ${seasonName}`;
    key         = `${season}_${DOW_KEY[dow]}`;
  } else if (isSunday) {
    displayName = `Chúa Nhật Tuần ${roman} ${seasonName}`;
    key         = `${season}_cn_${week}`;
  } else {
    displayName = `${DOW_VI[dow]} Tuần ${roman} ${seasonName}`;
    key         = `${season}_${week}_${DOW_KEY[dow]}`;
  }

  let rank = rankOverride !== null ? rankOverride : 15;
  if (rankOverride === null) {
    if (isSunday) {
      rank = ["vong", "chay", "phucsinh"].includes(season) ? 3 : 9;
    } else if (season === "chay" || season === "tuan_thanh" || (season === "phucsinh" && week === 1)) {
      rank = (season === "tuan_thanh" || (season === "phucsinh" && week === 1)) ? 4 : 12;
    }
  }

  return { key, displayName, season, week, isSunday, isFeast: false, rank };
}

/* ═══════════════════════════════════════════════
   HÀM CHÍNH: getLiturgyInfo(date?)
═══════════════════════════════════════════════ */
function getMilestones(year) {
  const easter = getEaster(year);
  const adventStart = getFirstAdvent(year);
  const sun34Ordinary = addDays(adventStart, -7);

  return {
    adventStart,
    christmasStart:     new Date(year, 11, 25),
    hienLinh:           getEpiphany(year),
    baptismOfLord:      getBaptismOfLord(year),
    ordinaryTime1Start: addDays(getBaptismOfLord(year), 1),
    
    // Thuật toán Tết Nguyên Đán
    tet_1:              getTet(year),
    tet_2:              addDays(getTet(year), 1),
    tet_3:              addDays(getTet(year), 2),
    tet_4:              addDays(getTet(year), 3),
    trung_thu:          getTrungThu(year),

    // Lễ Tro (Dời sang Mùng 4 nếu trùng 3 ngày Tết)
    ashWednesday:       (() => {
                          let ash = addDays(easter, -46);
                          const t1 = getTet(year);
                          const t2 = addDays(t1, 1);
                          const t3 = addDays(t1, 2);
                          if (sameDay(ash, t1) || sameDay(ash, t2) || sameDay(ash, t3)) {
                            return addDays(t1, 3); // Dời sang Mùng 4
                          }
                          return ash;
                        })(),

    palmSunday:         addDays(easter, -7),
    holyThursday:       addDays(easter, -3),
    goodFriday:         addDays(easter, -2),
    holySaturday:       addDays(easter, -1),

    easterSunday:       easter,
    ascension:          addDays(easter, 42),
    pentecost:          addDays(easter, 49),
    trinityunday:       addDays(easter, 56),
    corpuschristi:      addDays(easter, 63),
    sacredHeart:        addDays(easter, 68),
    immaculateHeart:    addDays(easter, 69),
    holyFamily:         getHolyFamily(year),
    stJoseph:           getStJoseph(year, easter),
    annunciation:       getAnnunciation(year, easter),

    ordinaryTime2Start: addDays(easter, 50),
    sun34Ordinary
  };
}

export function getLiturgyInfo(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const year = d.getFullYear();
  const dow  = d.getDay();
  const mmdd = String(d.getMonth() + 1).padStart(2,"0") + String(d.getDate()).padStart(2,"0");
  
  const ms = getMilestones(year);
  let candidates = [];

  // 1. Thu thập Lễ di động
  const movables = getMovableFeast(d, ms);
  candidates.push(...movables);

  // 2. Thu thập Lễ cố định
  if (FIXED_FEASTS[mmdd]) {
    const f = FIXED_FEASTS[mmdd];
    candidates.push({ key: f.key, displayName: f.name, season: "feast", week: null, isSunday: dow===0, isFeast: true, rank: f.rank });
  }

  // 3. Thu thập Mùa Phụng Vụ
  let seasonEvent = null;
  
  if (d >= ms.adventStart && d < ms.christmasStart) {
    const week = Math.floor(diffDays(d, ms.adventStart) / 7) + 1;
    // Từ 17-24/12 có rank ưu tiên hơn (12)
    const isLateAdvent = (d.getMonth() === 11 && d.getDate() >= 17 && d.getDate() <= 24);
    const rankOverride = isLateAdvent && dow !== 0 ? 12 : null;
    seasonEvent = buildResult("vong", Math.min(week, 4), dow, "Mùa Vọng", rankOverride);
  }
  else if (d >= ms.christmasStart || d < ms.baptismOfLord) {
    if (d > ms.hienLinh && d < ms.baptismOfLord) {
      seasonEvent = { key: `hien_linh_${DOW_KEY[dow]}`, displayName: `${DOW_VI[dow]} sau Lễ Hiển Linh`, season: "giang_sinh", week: null, isSunday: false, isFeast: false, rank: 12 };
    } else {
      seasonEvent = buildResult("giang_sinh", null, dow, "Mùa Giáng Sinh", 12);
    }
  }
  else if (d >= ms.ordinaryTime1Start && d < ms.ashWednesday) {
    const currentSunday = addDays(d, -dow);
    const sun1OT = addDays(ms.ordinaryTime1Start, -ms.ordinaryTime1Start.getDay());
    const week = Math.round(diffDays(currentSunday, sun1OT) / 7) + 1;
    seasonEvent = buildResult("thuong", week, dow, "Mùa Thường Niên");
  }
  else if (d > ms.ashWednesday && d < ms.palmSunday) {
    const sun1Lent = addDays(ms.ashWednesday, 7 - ms.ashWednesday.getDay());
    if (d < sun1Lent) {
      seasonEvent = { key: `chay_tro_${DOW_KEY[dow]}`, displayName: `${DOW_VI[dow]} sau Lễ Tro`, season: "chay", week: 0, isSunday: false, isFeast: false, rank: 12 };
    } else {
      const week = Math.floor(diffDays(d, sun1Lent) / 7) + 1;
      seasonEvent = buildResult("chay", Math.min(week, 5), dow, "Mùa Chay");
    }
  }
  else if (d >= ms.palmSunday && d < ms.easterSunday) {
    seasonEvent = buildResult("tuan_thanh", null, dow, "Tuần Thánh", 4);
  }
  else if (d > ms.easterSunday && d < ms.ordinaryTime2Start) {
    const week = Math.floor(diffDays(d, ms.easterSunday) / 7) + 1;
    seasonEvent = buildResult("phucsinh", Math.min(week, 7), dow, "Mùa Phục Sinh");
  }
  else if (d >= ms.ordinaryTime2Start && d < ms.adventStart) {
    const currentSunday = addDays(d, -dow);
    const weeksToChuaKitovuong = Math.round(diffDays(ms.sun34Ordinary, currentSunday) / 7);
    const week = 34 - weeksToChuaKitovuong;
    seasonEvent = buildResult("thuong", Math.max(1, Math.min(week, 34)), dow, "Mùa Thường Niên");
  }

  if (seasonEvent) candidates.push(seasonEvent);

  if (candidates.length === 0) {
    return { key: "unknown", displayName: "Không xác định", season: "unknown", week: null, isSunday: dow===0, isFeast: false, rank: 99 };
  }

  // 4. So sánh Rank: Lấy sự kiện có Rank Nhỏ Nhất (Ưu tiên cao nhất)
  candidates.sort((a, b) => a.rank - b.rank);
  return candidates[0];
}

export function getWeekLiturgyInfo(startDate = new Date()) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(startDate, i);
    return { date: d.toISOString().slice(0, 10), ...getLiturgyInfo(d) };
  });
}

export function getLiturgicalYear(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const year = d.getFullYear();
  const adventStart = getFirstAdvent(year);
  adventStart.setHours(0, 0, 0, 0);
  if (d >= adventStart) {
    return year + 1;
  }
  return year;
}

export function getLiturgicalColor(liturgyInfo) {
  if (!liturgyInfo) return 'amber';
  const { season, key, displayName } = liturgyInfo;
  const nameLower = (displayName || '').toLowerCase();
  const keyLower = (key || '').toLowerCase();

  // Đỏ: Lễ Tử Đạo, Lễ Lễ Lá, Thứ Sáu Tuần Thánh, Chúa Thánh Thần, Tông Đồ (trừ Gioan)
  if (
    keyLower.includes('tu_dao') || 
    keyLower.includes('thanh_than') || 
    keyLower.includes('pentecost') ||
    keyLower.includes('good_friday') ||
    keyLower.includes('palm_sunday') ||
    nameLower.includes('tử đạo') || 
    nameLower.includes('thánh thần') ||
    nameLower.includes('lễ lá') ||
    nameLower.includes('thứ sáu tuần thánh')
  ) {
    return 'rose';
  }

  // Tím: Mùa Vọng, Mùa Chay, Tuần Thánh
  if (season === 'vong' || season === 'chay' || season === 'tuan_thanh') {
    return 'purple';
  }

  // Trắng/Vàng: Giáng Sinh, Phục Sinh, Các Lễ Trọng/Kính (Đức Mẹ, Chúa, Các Thánh)
  if (season === 'giang_sinh' || season === 'phucsinh' || season === 'feast' || liturgyInfo.isFeast) {
    return 'amber';
  }

  // Xanh lá: Mùa Thường Niên
  if (season === 'thuong') {
    return 'emerald';
  }

  return 'amber';
}