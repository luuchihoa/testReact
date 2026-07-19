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

export const RANK_COLORS = {
  hoc_luc: { "Giỏi": "text-[#10B981]", "Khá": "text-[#3B82F6]", "Trung Bình": "text-[#F59E0B]", "Yếu": "text-[#F97316]", "Kém": "text-[#EF4444]" },
  hanh_kiem: { "Tốt": "text-[#10B981]", "Khá": "text-[#3B82F6]", "Trung Bình": "text-[#F59E0B]", "Yếu": "text-[#EF4444]" },
};

export const ATTENDANCE_STATUS = {
  co_mat:           { color: "bg-[#10B981]", label: "Có mặt" },
  nghi_phep:        { color: "bg-[#F59E0B]", label: "Nghỉ có phép" },
  nghi_khong_phep:  { color: "bg-[#EF4444]", label: "Nghỉ không phép" },
  nghi_le:          { color: "bg-[#60A5FA]", label: "Ngày nghỉ lễ" },
  null:             { color: "bg-[#E5E5EA] border border-dashed border-[#C7C7CC]", label: "Chưa cập nhật" },
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

export function safeStore(key, value) { try { localStorage.setItem(key, value); } catch { } }
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
    username: raw.username ?? "", tenThanh: raw.ten_thanh ?? "", hoTen: raw.ho_va_ten ?? "", ngaySinh: raw.ngay_sinh ?? "", ngayRuaToi: raw.ngay_rua_toi ?? "", ngayRuocLe: raw.ngay_ruoc_le ?? "", ngayThemSuc: raw.ngay_them_suc ?? "", tenCha: raw.ten_cha ?? "", tenMe: raw.ten_me ?? "", sdt: raw.sdt ?? "", giaoXom: raw.giao_xom ?? "", gioiTinh, avatar: raw.avatar || getDefaultAvatarByGender(gioiTinh), role: raw.role ?? "user", trangThai: raw.trang_thai ?? "đang học",
  };
}

export function denormalizeStudent(ui) {
  return {
    ten_thanh: ui.tenThanh ?? null, ho_va_ten: ui.hoTen ?? null, ngay_sinh: ui.ngaySinh || null, ngay_rua_toi: ui.ngayRuaToi || null, ngay_ruoc_le: ui.ngayRuocLe || null, ngay_them_suc: ui.ngayThemSuc || null, ten_cha: ui.tenCha ?? null, ten_me: ui.tenMe ?? null, sdt: ui.sdt ?? null, giao_xom: ui.giaoXom ?? null, gioi_tinh: ui.gioiTinh || null,
  };
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
