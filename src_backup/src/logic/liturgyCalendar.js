/**
 * liturgyCalendar.js
 *
 * Tính liturgy_key + displayName từ ngày dương lịch.
 * Không cần cột date trong Sheet — key phụng vụ là định danh vĩnh viễn.
 *
 * ── Key format ──────────────────────────────────
 *  Ngày thường:  {season}_{week}_{dow}   → thuong_12_thu2
 *  Chúa Nhật:    {season}_cn_{week}      → thuong_cn_12
 *  Không tuần:   {season}_{dow}          → giang_sinh_thu3
 *  Lễ:           feast_{name}            → feast_giang_sinh
 *
 * ── Season values ───────────────────────────────
 *  muvong | giang_sinh | thuong | chay | tuan_thanh | phucsinh | feast
 */

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
  "0101": { key: "feast_duc_me_dau_nam",  name: "Lễ Đức Mẹ - Mẹ Thiên Chúa" },
  "0325": { key: "feast_truyen_tin",      name: "Lễ Truyền Tin" },
  "0624": { key: "feast_sinh_nhat_gioan", name: "Lễ Sinh Nhật Thánh Gioan Tẩy Giả" },
  "0629": { key: "feast_phero_phaolo",    name: "Lễ Thánh Phêrô và Phaolô" },
  "0815": { key: "feast_duc_me_len_troi", name: "Lễ Đức Mẹ Lên Trời" },
  "1101": { key: "feast_cac_thanh",       name: "Lễ Các Thánh" },
  "1102": { key: "feast_cac_linh_hon",    name: "Lễ Các Đẳng Linh Hồn" },
  "1208": { key: "feast_duc_me_vo_nhiem", name: "Lễ Đức Mẹ Vô Nhiễm Nguyên Tội" },
  "1225": { key: "feast_giang_sinh",      name: "Lễ Giáng Sinh" },
  "1226": { key: "feast_thanh_stephanô",  name: "Lễ Thánh Stêphanô" },
  "1228": { key: "feast_cac_thanh_nhi",   name: "Lễ Các Thánh Anh Hài" },
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

/* ─── Lễ Chúa chịu phép rửa ──────────────────── */
// CN đầu tiên SAU 6/1 (nếu 6/1 là CN thì lấy 13/1)
function getBaptismOfLord(year) {
  const jan6 = new Date(year, 0, 6);
  const dow  = jan6.getDay();
  return addDays(jan6, dow === 0 ? 7 : 7 - dow);
}

/* ─── CN đầu Mùa Vọng ─────────────────────────── */
// CN gần nhất ≤ 30/11
function getFirstAdvent(year) {
  const nov30 = new Date(year, 10, 30);
  const dow   = nov30.getDay();
  return addDays(nov30, dow === 0 ? 0 : -dow);
}

/* ─── Lễ di động ─────────────────────────────── */
function getMovableFeast(d, ms) {
  const pairs = [
    [ms.ashWednesday,  "le_tro",            "Thứ Tư Lễ Tro"],
    [ms.palmSunday,    "cn_le_la",          "Chúa Nhật Lễ Lá"],
    [ms.holyThursday,  "thu5_tuan_thanh",   "Thứ Năm Tuần Thánh"],
    [ms.goodFriday,    "thu6_tuan_thanh",   "Thứ Sáu Tuần Thánh"],
    [ms.holySaturday,  "thu7_tuan_thanh",   "Thứ Bảy Tuần Thánh"],
    [ms.easterSunday,  "phuc_sinh",         "Chúa Nhật Phục Sinh"],
    [ms.ascension,     "chua_thang_thien",  "Lễ Chúa Thăng Thiên"],
    [ms.pentecost,     "hien_xuong",        "Lễ Chúa Thánh Thần Hiện Xuống"],
    [ms.trinityunday,  "ba_ngoi",           "Lễ Chúa Ba Ngôi"],
    [ms.corpuschristi, "minh_mau_chua",     "Lễ Mình Máu Thánh Chúa"],
  ];
  for (const [feast, key, name] of pairs) {
    if (feast && sameDay(d, feast)) return { key: `feast_${key}`, name };
  }
  return null;
}

/* ─── Tạo result object ───────────────────────── */
function buildResult(season, week, dow, seasonName) {
  const isSunday = dow === 0;
  const dowKey   = DOW_KEY[dow];
  const dowName  = DOW_VI[dow];
  const roman    = week ? ROMAN[week] : null;
  let key, displayName;

  if (week === null) {
    key         = `${season}_${dowKey}`;
    displayName = `${dowName} - ${seasonName}`;
  } else if (isSunday) {
    key         = `${season}_cn_${week}`;
    displayName = `Chúa Nhật Tuần ${roman} - ${seasonName}`;
  } else {
    key         = `${season}_${week}_${dowKey}`;
    displayName = `${dowName} Tuần ${roman} - ${seasonName}`;
  }

  return { key, displayName, season, week, isSunday, isFeast: false };
}

/* ═══════════════════════════════════════════════
   HÀM CHÍNH: getLiturgyInfo(date?)
   
   Trả về:
   {
     key:         string   — khóa tra Sheet, VD: "thuong_12_thu2"
     displayName: string   — "Thứ Hai Tuần XII - Mùa Thường Niên"
     season:      string   — muvong|giang_sinh|thuong|chay|tuan_thanh|phucsinh|feast
     week:        number|null
     isSunday:    boolean
     isFeast:     boolean
   }
═══════════════════════════════════════════════ */
/* ─── Cập nhật lại cách tính cột mốc chính xác hơn ─── */
function getMilestones(year) {
  const easter = getEaster(year);
  const adventStart = getFirstAdvent(year);
  
  // Chúa Nhật 34 Thường Niên (Chúa Kitô Vua) = Chúa Nhật ngay trước Mùa Vọng
  const sun34Ordinary = addDays(adventStart, -7);

  return {
    adventStart,
    christmasStart:     new Date(year, 11, 25),
    baptismOfLord:      getBaptismOfLord(year), // Tính cho năm hiện tại thay vì ép + 1
    ordinaryTime1Start: addDays(getBaptismOfLord(year), 1),
    
    ashWednesday:       addDays(easter, -46),
    palmSunday:         addDays(easter, -7),
    holyThursday:       addDays(easter, -3),
    goodFriday:         addDays(easter, -2),
    holySaturday:       addDays(easter, -1),

    easterSunday:       easter,
    ascension:          addDays(easter, 39),
    pentecost:          addDays(easter, 49),
    trinityunday:       addDays(easter, 56),
    corpuschristi:      addDays(easter, 63),

    ordinaryTime2Start: addDays(easter, 50),
    sun34Ordinary       // Dùng mốc này để tính tiến/lùi TN2 chuẩn theo tuần Chúa Nhật
  };
}

export function getLiturgyInfo(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const year = d.getFullYear();
  const dow  = d.getDay();
  const mmdd = String(d.getMonth() + 1).padStart(2,"0") + String(d.getDate()).padStart(2,"0");
  
  // Lấy milestone của năm nay và năm kế tiếp để gối đầu các mùa cuối năm
  const ms     = getMilestones(year);
  const msNext = getMilestones(year + 1);

  // LÊN ĐẦU: 1. Lễ cố định (Phải ăn vào mọi ngày trong năm, kể cả mùa Giáng Sinh)
  if (FIXED_FEASTS[mmdd]) {
    const f = FIXED_FEASTS[mmdd];
    return { key: f.key, displayName: f.name, season: "feast", week: null, isSunday: dow===0, isFeast: true };
  }

  // 2. Lễ di động
  const movable = getMovableFeast(d, ms);
  if (movable) {
    return { key: movable.key, displayName: movable.name, season: "feast", week: null, isSunday: dow===0, isFeast: true };
  }

  // 3. Mùa Vọng (CN đầu MV → đêm trước GS)
  if (d >= ms.adventStart && d < ms.christmasStart) {
    const week = Math.floor(diffDays(d, ms.adventStart) / 7) + 1;
    return buildResult("muvong", Math.min(week, 4), dow, "Mùa Vọng");
  }

  // 4. Mùa Giáng Sinh (Tách rõ rệt 2 đoạn: cuối năm nay và đầu năm sau)
  if (d >= ms.christmasStart) {
    return buildResult("giang_sinh", null, dow, "Mùa Giáng Sinh");
  }
  if (d <= ms.baptismOfLord) {
    return buildResult("giang_sinh", null, dow, "Mùa Giáng Sinh");
  }

  // 5. Thường Niên GĐ1 (Từ sau lễ Phép Rửa đến trước Lễ Tro)
  if (d >= ms.ordinaryTime1Start && d < ms.ashWednesday) {
    const week = Math.floor(diffDays(d, ms.ordinaryTime1Start) / 7) + 2;
    return buildResult("thuong", week, dow, "Mùa Thường Niên");
  }

  // 6. Mùa Chay (Tính chính xác: các ngày sau Lễ Tro vs Tuần chính thức)
  if (d > ms.ashWednesday && d < ms.palmSunday) {
    const sun1Lent = addDays(ms.ashWednesday, 4); // Chúa Nhật I Mùa Chay
    if (d < sun1Lent) {
      // Thuộc về những ngày sau thứ tư lễ tro, chưa vào tuần I
      return { key: `chay_tro_${DOW_KEY[dow]}`, displayName: `${DOW_VI[dow]} sau Lễ Tro`, season: "chay", week: 0, isSunday: false, isFeast: false };
    }
    const week = Math.floor(diffDays(d, sun1Lent) / 7) + 1;
    return buildResult("chay", Math.min(week, 5), dow, "Mùa Chay");
  }

  // 7. Tuần Thánh
  if (d >= ms.palmSunday && d < ms.easterSunday) {
    return buildResult("tuan_thanh", null, dow, "Tuần Thánh");
  }

  // 8. Mùa Phục Sinh
  if (d >= ms.easterSunday && d < ms.ordinaryTime2Start) {
    const week = Math.floor(diffDays(d, ms.easterSunday) / 7) + 1;
    return buildResult("phucsinh", Math.min(week, 7), dow, "Mùa Phục Sinh");
  }

  // 9. Thường Niên GĐ2 (Tính lùi dựa trên ngày Chúa Nhật để tránh lệch Thứ)
  if (d >= ms.ordinaryTime2Start && d < ms.adventStart) {
    // Tìm ngày Chúa Nhật đầu tiên của tuần hiện tại (d)
    const currentSunday = addDays(d, -dow);
    const weeksToChuaKitovuong = Math.round(diffDays(ms.sun34Ordinary, currentSunday) / 7);
    const week = 34 - weeksToChuaKitovuong;
    return buildResult("thuong", Math.max(1, Math.min(week, 34)), dow, "Mùa Thường Niên");
  }

  return { key: "unknown", displayName: "Không xác định", season: "unknown", week: null, isSunday: dow===0, isFeast: false };
}

/* ─── Lấy info 7 ngày liên tiếp ─────────────── */
export function getWeekLiturgyInfo(startDate = new Date()) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(startDate, i);
    return { date: d.toISOString().slice(0, 10), ...getLiturgyInfo(d) };
  });
}

console.log(getWeekLiturgyInfo());