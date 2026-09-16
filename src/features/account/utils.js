export const SEMESTER_START_MONTH_DAY = { HK1: { month: 8, day: 14 }, HK2: { month: 0, day: 25 } };

export function getCurrentNamHoc(date = new Date()) {
  const year  = date.getFullYear();
  const month = date.getMonth();
  const startYear = month >= 8 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

export function getSemesterFallbackStart(semesterKey, date = new Date()) {
  const year  = date.getFullYear();
  const month = date.getMonth();
  const startYear = month >= 8 ? year : year - 1; 
  const { month: m, day } = SEMESTER_START_MONTH_DAY[semesterKey];
  const calendarYear = semesterKey === "HK1" ? startYear : startYear + 1;
  return new Date(calendarYear, m, day);
}

export const HK_INT_MAP = { HK1: 1, HK2: 2 };
export const VALID_SEMESTERS = ["HK1", "HK2", "NAM"];

export function normalizeSemester(param) {
  if (!param) return null;
  const str = String(param).trim().toUpperCase();
  if (str === "2" || str === "HK2" || str === "HOC_KY_2" || str === "II" || str === "KY_2") return "HK2";
  if (str === "1" || str === "HK1" || str === "HOC_KY_1" || str === "I" || str === "KY_1") return "HK1";
  if (str === "NAM" || str === "CA_NAM" || str === "ALL" || str === "YEAR" || str === "TONG_KET_NAM") return "NAM";
  return null;
}

export function normalizeNotificationLink(link, notif = null) {
  let target = typeof link === "string" ? link.trim() : "";

  // If no link provided or link is empty, infer from notif if available
  if (!target && notif) {
    if (notif.type === "diem" || notif.type === "tong_ket_ky") {
      const matchKy = notif.title?.match(/học kỳ\s*([12I]+)/i) || notif.message?.match(/học kỳ\s*([12I]+)/i);
      const kyParam = matchKy ? (matchKy[1].toUpperCase() === "2" || matchKy[1].toUpperCase() === "II" ? "HK2" : "HK1") : "HK1";
      return `/tài-khoản/thành-tích?ky=${kyParam}`;
    }
    if (notif.type === "tong_ket_nam") {
      return "/tài-khoản/thành-tích?ky=NAM";
    }
    if (notif.type === "bai_viet") {
      return "/bài-viết";
    }
    return null;
  }

  if (!target) return null;

  // Normalize legacy routes to /tài-khoản/thành-tích
  if (target.startsWith("/ket-qua-hoc-tap")) {
    target = target.replace("/ket-qua-hoc-tap", "/tài-khoản/thành-tích");
  } else if (target.startsWith("/thanh-tich")) {
    target = target.replace("/thanh-tich", "/tài-khoản/thành-tích");
  } else if (target.startsWith("/thành-tích")) {
    target = target.replace("/thành-tích", "/tài-khoản/thành-tích");
  } else if (target.startsWith("/tai-khoan/")) {
    target = target.replace("/tai-khoan/", "/tài-khoản/");
  }

  // If this points to /tài-khoản/thành-tích, ensure query parameters are normalized to ?ky=HK1 | HK2 | NAM
  if (target.startsWith("/tài-khoản/thành-tích")) {
    try {
      const [path, queryString] = target.split("?");
      if (queryString) {
        const params = new URLSearchParams(queryString);
        const rawKy = params.get("ky") || params.get("hoc_ky") || params.get("semester") || params.get("hk");
        const normalizedKy = normalizeSemester(rawKy);
        if (normalizedKy) {
          return `${path}?ky=${normalizedKy}`;
        }
      } else if (notif) {
        if (notif.type === "tong_ket_nam") return `${path}?ky=NAM`;
        const matchKy = notif.title?.match(/học kỳ\s*([12I]+)/i) || notif.message?.match(/học kỳ\s*([12I]+)/i);
        if (matchKy) {
          const kyParam = matchKy[1].toUpperCase() === "2" || matchKy[1].toUpperCase() === "II" ? "HK2" : "HK1";
          return `${path}?ky=${kyParam}`;
        }
      }
    } catch {
      // fallback to original target
    }
  }

  return target;
}

export const RANK_COLORS = {
  hoc_luc: {
    "Giỏi": "text-[#064e3b] dark:text-[#6ee7b7]",
    "Khá": "text-[#1e3a8a] dark:text-[#93c5fd]",
    "Trung Bình": "text-[#713f12] dark:text-[#fde047]",
    "TB": "text-[#713f12] dark:text-[#fde047]",
    "Yếu": "text-[#7f1d1d] dark:text-[#fca5a5]",
    "Kém": "text-[#7f1d1d] dark:text-[#fca5a5]",
  },
  hanh_kiem: {
    "Tốt": "text-[#064e3b] dark:text-[#6ee7b7]",
    "Khá": "text-[#1e3a8a] dark:text-[#93c5fd]",
    "Trung Bình": "text-[#713f12] dark:text-[#fde047]",
    "TB": "text-[#713f12] dark:text-[#fde047]",
    "Yếu": "text-[#7f1d1d] dark:text-[#fca5a5]",
  },
};

export const ATTENDANCE_STATUS = {
  co_mat: {
    color: "bg-emerald-600 dark:bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
    border: "border-emerald-700/40 dark:border-emerald-400/40",
    text: "text-[#064e3b] dark:text-[#6ee7b7]",
    label: "Có mặt",
    code: "✓",
  },
  nghi_phep: {
    color: "bg-amber-600 dark:bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/50",
    border: "border-amber-700/40 dark:border-amber-400/40",
    text: "text-[#713f12] dark:text-[#fde047]",
    label: "Nghỉ có phép",
    code: "P",
  },
  nghi_khong_phep: {
    color: "bg-red-600 dark:bg-red-500",
    bg: "bg-red-50 dark:bg-red-950/50",
    border: "border-red-700/40 dark:border-red-400/40",
    text: "text-[#7f1d1d] dark:text-[#fca5a5]",
    label: "Nghỉ không phép",
    code: "K",
  },
  nghi_le: {
    color: "bg-blue-600 dark:bg-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/50",
    border: "border-blue-700/40 dark:border-blue-400/40",
    text: "text-[#1e3a8a] dark:text-[#93c5fd]",
    label: "Ngày nghỉ lễ",
    code: "✝",
  },
  null: {
    color: "bg-stone-300 dark:bg-stone-600",
    bg: "bg-stone-100 dark:bg-stone-800",
    border: "border-stone-300 dark:border-stone-600 border-dashed",
    text: "text-[#575e55] dark:text-[#b0b9ac]",
    label: "Chưa cập nhật",
    code: "—",
  },
};

export const GL_HOCLUC_COMMENTS = {
  "Giỏi":       ["Em tiếp thu giáo lý rất tốt, hiểu bài nhanh và biết áp dụng giáo huấn vào đời sống.", "Em học giáo lý nghiêm túc, nắm vững nội dung và có tinh thần chia sẻ trong lớp."],
  "Khá":        ["Em nắm được nội dung giáo lý và tham gia học tập khá đều đặn.", "Em hiểu bài và có tinh thần hợp tác tốt trong các sinh hoạt lớp."],
  "Trung Bình": ["Em hiểu được những nội dung giáo lý cơ bản, cần cố gắng hơn trong việc ôn bài.", "Em nên dành thêm thời gian học bài để theo kịp chương trình."],
  "Yếu":        ["Em còn gặp khó khăn trong việc tiếp thu giáo lý, cần được quan tâm và nhắc nhở thêm.", "Em cần cố gắng hơn trong việc học và tham dự các buổi giáo lý."],
  "Kém":        ["Em chưa theo kịp chương trình giáo lý, cần sự đồng hành của gia đình và giáo lý viên."],
};

export const GL_HANHKIEM_COMMENTS = {
  "Tốt":        ["Em ngoan ngoãn, lễ phép và tham dự tích cực các buổi học giáo lý.", "Em sống chan hòa, biết tôn trọng bạn bè và giáo lý viên."],
  "Khá":        ["Em chấp hành nội quy lớp khá tốt, cần chủ động hơn trong sinh hoạt."],
  "Trung Bình": ["Em cần rèn luyện thêm tính tự giác và chú ý hơn trong giờ học."],
  "Yếu":        ["Em tham dự chưa nghiêm túc, cần được nhắc nhở và đồng hành thêm."],
};

export function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function getCurrentSemester(date = new Date()) {
  const hk2Start = getSemesterFallbackStart("HK2", date);
  const hk1Start = getSemesterFallbackStart("HK1", date);
  if (date >= hk2Start) return "HK2";
  if (date >= hk1Start) return "HK1";
  return "HK1";
}

export function transferDateForView(value) {
  if (!value) return "";
  const dateObj = new Date(value);
  const day   = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year  = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
}

export function safeStore(key, value) { try { localStorage.setItem(key, value); } catch { /* ignore */ } }
export function safeParse(key, fallback = null) { try { const raw = localStorage.getItem(key); if (!raw) return fallback; return JSON.parse(raw); } catch { return fallback; } }
export function isValidVNPhone(value) { if (!value) return true; const cleaned = value.replace(/[\s.-]/g, ""); return /^(0\d{9}|\+84\d{9})$/.test(cleaned); }
export function isPastOrToday(dateStr) { if (!dateStr) return true; const d = new Date(dateStr); if (Number.isNaN(d.getTime())) return true; const today = new Date(); today.setHours(23, 59, 59, 999); return d <= today; }

export const DEFAULT_AVATAR_BOY     = "/images/avatarBoy.avif";
export const DEFAULT_AVATAR_GIRL    = "/images/avatarGirl.avif";
export const DEFAULT_AVATAR_NEUTRAL = "/images/avatarDefault.avif";
export function getDefaultAvatarByGender(gioiTinh) { if (gioiTinh === "Nam") return DEFAULT_AVATAR_BOY; if (gioiTinh === "Nữ") return DEFAULT_AVATAR_GIRL; return DEFAULT_AVATAR_NEUTRAL; }
export function isDefaultAvatarUrl(url) { return url === DEFAULT_AVATAR_BOY || url === DEFAULT_AVATAR_GIRL || url === DEFAULT_AVATAR_NEUTRAL || !url; }

export function normalizeStudent(raw) {
  if (!raw) return {};
  const gioiTinh = raw.gioi_tinh ?? "";
  return {
    username:        raw.username ?? "",
    tenThanh:        raw.ten_thanh ?? "",
    hoTen:           raw.ho_va_ten ?? "",
    ngaySinh:        raw.ngay_sinh ?? "",
    ngayRuaToi:      raw.ngay_rua_toi ?? "",
    ngayRuocLe:      raw.ngay_ruoc_le ?? "",
    ngayThemSuc:     raw.ngay_them_suc ?? "",
    tenCha:          raw.ten_cha ?? "",
    tenMe:           raw.ten_me ?? "",
    sdt:             raw.sdt ?? "",
    giaoXom:         raw.giao_xom ?? "",
    gioiTinh,
    avatar:          raw.avatar || getDefaultAvatarByGender(gioiTinh),
    role:            raw.role ?? "user",
    trangThai:       raw.trang_thai ?? "Đang học",
    isProfileLocked: Boolean(raw.is_profile_locked),
    profileLockedBy: raw.profile_locked_by || null,
    profileLockedAt: raw.profile_locked_at || null,
  };
}

export function denormalizeStudent(ui) {
  const result = {
    ten_thanh:     ui.tenThanh    ?? null,
    ho_va_ten:     ui.hoTen       ?? null,
    ngay_sinh:     ui.ngaySinh    || null,
    ngay_rua_toi:  ui.ngayRuaToi  || null,
    ngay_ruoc_le:  ui.ngayRuocLe  || null,
    ngay_them_suc: ui.ngayThemSuc || null,
    ten_cha:       ui.tenCha      ?? null,
    ten_me:        ui.tenMe       ?? null,
    sdt:           ui.sdt         ?? null,
    giao_xom:      ui.giaoXom     ?? null,
    gioi_tinh:     ui.gioiTinh    || null,
  };

  if ("isProfileLocked" in ui) {
    result.is_profile_locked = Boolean(ui.isProfileLocked);
  }
  if ("profileLockedBy" in ui) {
    result.profile_locked_by = ui.profileLockedBy || null;
  }
  if ("profileLockedAt" in ui) {
    result.profile_locked_at = ui.profileLockedAt || null;
  }

  return result;
}

export const PROFILE_FIELD_CONFIG = {
  ten_thanh:     { label: "Tên Thánh", type: "text", camelKey: "tenThanh" },
  ho_va_ten:     { label: "Họ và tên", type: "text", camelKey: "hoTen" },
  ngay_sinh:     { label: "Ngày sinh", type: "date", camelKey: "ngaySinh" },
  gioi_tinh:     { label: "Giới tính", type: "text", camelKey: "gioiTinh" },
  ngay_rua_toi:  { label: "Ngày Rửa Tội", type: "date", camelKey: "ngayRuaToi" },
  ngay_ruoc_le:  { label: "Ngày Rước Lễ", type: "date", camelKey: "ngayRuocLe" },
  ngay_them_suc: { label: "Ngày Thêm Sức", type: "date", camelKey: "ngayThemSuc" },
  ten_cha:       { label: "Họ & Tên Cha", type: "text", camelKey: "tenCha" },
  ten_me:        { label: "Họ & Tên Mẹ", type: "text", camelKey: "tenMe" },
  sdt:           { label: "Số điện thoại", type: "text", camelKey: "sdt" },
  giao_xom:      { label: "Giáo Xóm", type: "text", camelKey: "giaoXom" },
  avatar:        { label: "Ảnh đại diện", type: "image", camelKey: "avatar" },
};

export function formatFieldValue(val, type = "text") {
  if (val === null || val === undefined || val === "") return "—";
  if (type === "date") return transferDateForView(val) || val;
  return String(val);
}

export function normalizeProfileObject(val) {
  if (!val) return {};
  let parsed = val;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
    } catch {
      return {};
    }
  }
  if (typeof parsed !== "object" || parsed === null) return {};

  // Unwrap common wrapper keys if any
  if (parsed.p_changes && typeof parsed.p_changes === "object") parsed = parsed.p_changes;
  else if (parsed.changes && typeof parsed.changes === "object") parsed = parsed.changes;
  else if (parsed.proposed_data && typeof parsed.proposed_data === "object") parsed = parsed.proposed_data;
  else if (parsed.data && typeof parsed.data === "object") parsed = parsed.data;

  return parsed;
}

function normalizeDateVal(val) {
  if (val === null || val === undefined) return "";
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }
  return str;
}

function extractFieldValue(obj, snakeKey, camelKey) {
  if (!obj || typeof obj !== "object") return undefined;
  if (Object.prototype.hasOwnProperty.call(obj, snakeKey)) return obj[snakeKey];
  if (camelKey && Object.prototype.hasOwnProperty.call(obj, camelKey)) return obj[camelKey];
  return undefined;
}

function hasFieldProp(obj, snakeKey, camelKey) {
  if (!obj || typeof obj !== "object") return false;
  return Object.prototype.hasOwnProperty.call(obj, snakeKey) || (Boolean(camelKey) && Object.prototype.hasOwnProperty.call(obj, camelKey));
}

export function getProfileChangesDiff(currentData = {}, proposedData = {}) {
  const diffs = [];
  const cur = normalizeProfileObject(currentData);
  const prop = normalizeProfileObject(proposedData);

  if (!prop || Object.keys(prop).length === 0) return diffs;

  const allKeys = Object.keys(PROFILE_FIELD_CONFIG);
  const matchedKeys = new Set();

  for (const key of allKeys) {
    const config = PROFILE_FIELD_CONFIG[key];
    const camelKey = config.camelKey;

    // Chỉ xét nếu prop có chứa trường này
    if (!hasFieldProp(prop, key, camelKey)) {
      continue;
    }

    matchedKeys.add(key);
    if (camelKey) matchedKeys.add(camelKey);

    const rawOld = extractFieldValue(cur, key, camelKey);
    const rawNew = extractFieldValue(prop, key, camelKey);

    const oldVal = (rawOld === undefined || rawOld === null) ? null : rawOld;
    const newVal = (rawNew === undefined || rawNew === null) ? null : rawNew;

    let oldStr = oldVal === null ? "" : String(oldVal).trim();
    let newStr = newVal === null ? "" : String(newVal).trim();

    if (config.type === "date") {
      oldStr = normalizeDateVal(oldVal);
      newStr = normalizeDateVal(newVal);
    }

    if (oldStr !== newStr) {
      diffs.push({
        key,
        camelKey,
        label: config.label,
        type: config.type,
        oldValue: oldVal,
        newValue: newVal,
        oldDisplay: formatFieldValue(oldVal, config.type),
        newDisplay: formatFieldValue(newVal, config.type),
      });
    }
  }

  // Quét thêm các trường tuỳ biến khác ngoài cấu hình mặc định (nếu có)
  const propKeys = Object.keys(prop);
  for (const rawKey of propKeys) {
    if (matchedKeys.has(rawKey)) continue;
    const snakeCandidate = rawKey.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
    const camelCandidate = rawKey.replace(/_([a-z])/g, (_, g) => g.toUpperCase());
    if (matchedKeys.has(snakeCandidate) || matchedKeys.has(camelCandidate)) continue;

    const rawOld = cur[rawKey] ?? cur[snakeCandidate] ?? cur[camelCandidate];
    const rawNew = prop[rawKey];

    const oldVal = (rawOld === undefined || rawOld === null) ? null : rawOld;
    const newVal = (rawNew === undefined || rawNew === null) ? null : rawNew;

    const oldStr = oldVal === null ? "" : String(oldVal).trim();
    const newStr = newVal === null ? "" : String(newVal).trim();

    if (oldStr !== newStr) {
      const label = rawKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      diffs.push({
        key: rawKey,
        camelKey: camelCandidate,
        label,
        type: "text",
        oldValue: oldVal,
        newValue: newVal,
        oldDisplay: formatFieldValue(oldVal, "text"),
        newDisplay: formatFieldValue(newVal, "text"),
      });
    }
  }

  return diffs;
}

export const resizeImage = (file, maxWidth = 400, maxHeight = 400) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        
        // Canvas approach to maintain standard sizes
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        // Target a square crop centered for avatars
        const size = Math.min(width, height, maxWidth);
        canvas.width = size;
        canvas.height = size;
        
        const offsetX = (width - size) / 2;
        const offsetY = (height - size) / 2;

        ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas to Blob failed"));
              return;
            }
            resolve({ blob, ext: "webp" });
          },
          "image/webp",
          0.85 // quality
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
