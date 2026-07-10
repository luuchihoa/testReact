import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Routes, Route, Navigate, NavLink, useNavigate, useMatch, useSearchParams, useOutletContext } from "react-router-dom";
import { modalVariant, pressable } from "./ui/variant.jsx";
import { useToast } from "./ui/ToastContext.jsx";
import { createPortal } from "react-dom";
import Backdrop from "./ui/Backdrop.jsx";
import { AchievementSkeleton } from "./ui/Skeleton.jsx";
import { supabase } from "../lib/supabase.js";

// ============================================================
//  CONSTANTS
// ============================================================

// Ngày trong năm mà HK1/HK2 thường bắt đầu — dùng làm fallback khi
// term_summary.ngay_bat_dau chưa có trong DB. Được TÍNH LẠI mỗi năm học dựa
// theo năm hiện tại (không hard-code năm cụ thể như bản cũ), để không bị
// sai học kỳ khi hệ thống bước sang năm học mới.
const SEMESTER_START_MONTH_DAY = {
  HK1: { month: 8, day: 14 }, // 14/09 (tháng 0-indexed)
  HK2: { month: 0, day: 25 }, // 25/01
};

function getCurrentNamHoc(date = new Date()) {
  // Năm học bắt đầu từ tháng 9
  const year  = date.getFullYear();
  const month = date.getMonth(); // 0-indexed, tháng 9 = 8
  const startYear = month >= 8 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

function getSemesterFallbackStart(semesterKey, date = new Date()) {
  const year  = date.getFullYear();
  const month = date.getMonth();
  const startYear = month >= 8 ? year : year - 1; // năm bắt đầu của năm học hiện tại
  const { month: m, day } = SEMESTER_START_MONTH_DAY[semesterKey];
  // HK1 rơi vào nửa đầu năm học (startYear), HK2 rơi vào nửa sau (startYear + 1)
  const calendarYear = semesterKey === "HK1" ? startYear : startYear + 1;
  return new Date(calendarYear, m, day);
}

// Map hoc_ky (INT) → key HK1/HK2
const HK_INT_MAP = { HK1: 1, HK2: 2 };
const VALID_SEMESTERS = ["HK1", "HK2", "NAM"];

const RANK_COLORS = {
  hoc_luc: {
    "Giỏi":       "text-[#34C759]",
    "Khá":        "text-[#007AFF]",
    "Trung Bình": "text-[#FFD60A]",
    "Yếu":        "text-[#FF9500]",
    "Kém":        "text-[#FF375F]",
  },
  hanh_kiem: {
    "Tốt":        "text-[#34C759]",
    "Khá":        "text-[#007AFF]",
    "Trung Bình": "text-[#FFD60A]",
    "Yếu":        "text-[#FF375F]",
  },
};

const ATTENDANCE_STATUS = {
  co_mat:           { color: "bg-[#34C759]",                                      label: "Có mặt"          },
  nghi_phep:        { color: "bg-[#FFD60A]",                                      label: "Nghỉ có phép"    },
  nghi_khong_phep:  { color: "bg-[#FF375F]",                                      label: "Nghỉ không phép" },
  nghi_le:          { color: "bg-[#93C5FD]",                                      label: "Ngày nghỉ lễ"   },
  null:             { color: "bg-[#E5E5EA] border border-dashed border-[#C7C7CC]", label: "Chưa cập nhật"  },
};

const GL_HOCLUC_COMMENTS = {
  "Giỏi":       ["Em tiếp thu giáo lý rất tốt, hiểu bài nhanh và biết áp dụng giáo huấn vào đời sống.", "Em học giáo lý nghiêm túc, nắm vững nội dung và có tinh thần chia sẻ trong lớp.", "Em có khả năng hiểu sâu giáo lý và thể hiện đức tin qua hành vi cụ thể."],
  "Khá":        ["Em nắm được nội dung giáo lý và tham gia học tập khá đều đặn.", "Em có ý thức học giáo lý, cần mạnh dạn hơn khi phát biểu và chia sẻ.", "Em hiểu bài và có tinh thần hợp tác tốt trong các sinh hoạt lớp."],
  "Trung Bình": ["Em hiểu được những nội dung giáo lý cơ bản, cần cố gắng hơn trong việc ôn bài.", "Em cần chú ý hơn trong giờ học để hiểu sâu và nhớ lâu giáo lý.", "Em nên dành thêm thời gian học bài để theo kịp chương trình."],
  "Yếu":        ["Em còn gặp khó khăn trong việc tiếp thu giáo lý, cần được quan tâm và nhắc nhở thêm.", "Em cần cố gắng hơn trong việc học và tham dự các buổi giáo lý.", "Em nên chủ động hơn trong việc học bài và hỏi khi chưa hiểu."],
  "Kém":        ["Em chưa theo kịp chương trình giáo lý, cần sự đồng hành của gia đình và giáo lý viên.", "Em cần được quan tâm nhiều hơn để cải thiện việc học giáo lý.", "Em cần sắp xếp thời gian học giáo lý nghiêm túc hơn."],
};

const GL_HANHKIEM_COMMENTS = {
  "Tốt":        ["Em ngoan ngoãn, lễ phép và tham dự tích cực các buổi học giáo lý.", "Em có tinh thần vâng lời và ý thức giữ kỷ luật tốt.", "Em sống chan hòa, biết tôn trọng bạn bè và giáo lý viên."],
  "Khá":        ["Em chấp hành nội quy lớp khá tốt, cần chủ động hơn trong sinh hoạt.", "Em có ý thức giữ kỷ luật, cần cố gắng duy trì sự đều đặn.", "Em cư xử đúng mực, cần phát huy tinh thần tự giác hơn."],
  "Trung Bình": ["Em cần rèn luyện thêm tính tự giác và chú ý hơn trong giờ học.", "Em tham dự chưa đều, cần cố gắng sắp xếp thời gian tốt hơn.", "Em cần nghiêm túc hơn trong các sinh hoạt của lớp."],
  "Yếu":        ["Em tham dự chưa nghiêm túc, cần được nhắc nhở và đồng hành thêm.", "Em cần cố gắng hơn trong việc giữ kỷ luật và tham dự học giáo lý.", "Em cần sự phối hợp của gia đình để giúp em tiến bộ."],
};

// ============================================================
//  HELPERS
// ============================================================

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getCurrentSemester(date = new Date()) {
  // Dùng fallback start (tính động theo năm) để xác định học kỳ hiện tại
  // khi chưa có DB data
  const hk2Start = getSemesterFallbackStart("HK2", date);
  const hk1Start = getSemesterFallbackStart("HK1", date);
  if (date >= hk2Start) return "HK2";
  if (date >= hk1Start) return "HK1";
  return "HK1";
}

function transferDateForView(value) {
  if (!value) return "";
  const dateObj = new Date(value);
  const day   = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year  = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
}

function safeStore(key, value) {
  try { localStorage.setItem(key, value); } catch { /* quota / private mode */ }
}

// Đọc + parse JSON an toàn từ localStorage — tránh crash trắng trang nếu
// dữ liệu lưu bị hỏng (ghi dở, chỉnh tay, encoding lạ...).
function safeParse(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

// Định dạng số điện thoại VN cơ bản: 0xxxxxxxxx (10 số, bắt đầu bằng 0)
// hoặc +84xxxxxxxxx. Không chặn cứng — chỉ dùng để cảnh báo nhẹ.
function isValidVNPhone(value) {
  if (!value) return true; // để trống vẫn cho qua, không ép buộc
  const cleaned = value.replace(/[\s.-]/g, "");
  return /^(0\d{9}|\+84\d{9})$/.test(cleaned);
}

// Không cho chọn ngày sinh ở tương lai
function isPastOrToday(dateStr) {
  if (!dateStr) return true;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return true;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return d <= today;
}

// Avatar mặc định khi user chưa upload ảnh — dựa theo giới tính
const DEFAULT_AVATAR_BOY     = "/images/avatarBoy.avif";
const DEFAULT_AVATAR_GIRL    = "/images/avatarGirl.avif";
const DEFAULT_AVATAR_NEUTRAL = "/images/avatarDefault.avif";

function getDefaultAvatarByGender(gioiTinh) {
  if (gioiTinh === "Nam") return DEFAULT_AVATAR_BOY;
  if (gioiTinh === "Nữ")  return DEFAULT_AVATAR_GIRL;
  return DEFAULT_AVATAR_NEUTRAL;
}

// Nhận diện avatar hiện tại có phải là một trong các avatar mặc định (chưa upload thật)
function isDefaultAvatarUrl(url) {
  return url === DEFAULT_AVATAR_BOY || url === DEFAULT_AVATAR_GIRL || url === DEFAULT_AVATAR_NEUTRAL || !url;
}

// Chuẩn hoá dữ liệu học sinh từ Supabase sang shape mà UI cần
function normalizeStudent(raw) {
  if (!raw) return {};
  const gioiTinh = raw.gioi_tinh ?? "";
  return {
    username:      raw.username ?? "",
    tenThanh:      raw.ten_thanh ?? "",
    hoTen:         raw.ho_va_ten ?? "",
    ngaySinh:      raw.ngay_sinh ?? "",
    ngayRuaToi:    raw.ngay_rua_toi ?? "",
    ngayRuocLe:    raw.ngay_ruoc_le ?? "",
    ngayThemSuc:   raw.ngay_them_suc ?? "",
    tenCha:        raw.ten_cha ?? "",
    tenMe:         raw.ten_me ?? "",
    sdt:           raw.sdt ?? "",
    giaoXom:       raw.giao_xom ?? "",
    gioiTinh,
    // Chưa có avatar trong DB → gán avatar mặc định theo giới tính
    avatar:        raw.avatar || getDefaultAvatarByGender(gioiTinh),
    role:          raw.role ?? "user",
    trangThai:     raw.trang_thai ?? "đang học",
  };
}

// Chuyển ngược shape UI → shape Supabase để UPDATE
function denormalizeStudent(ui) {
  return {
    ten_thanh:    ui.tenThanh    ?? null,
    ho_va_ten:    ui.hoTen       ?? null,
    ngay_sinh:    ui.ngaySinh    || null,
    ngay_rua_toi: ui.ngayRuaToi  || null,
    ngay_ruoc_le: ui.ngayRuocLe  || null,
    ngay_them_suc:ui.ngayThemSuc || null,
    ten_cha:      ui.tenCha      ?? null,
    ten_me:       ui.tenMe       ?? null,
    sdt:          ui.sdt         ?? null,
    giao_xom:     ui.giaoXom     ?? null,
    gioi_tinh:    ui.gioiTinh    || null,
  };
}

// ============================================================
//  SUB-COMPONENTS
// ============================================================

function Spinner({ className = "h-4 w-4" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path  className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function StatCard({ label, value, colorClass = "text-gray-900" }) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0F0F0] shadow-sm p-4">
      <p className={`text-[12px] text-gray-400 mb-1`}>{label}</p>
      <p className={`text-[20px] font-bold ${colorClass}`}>{value ?? "—"}</p>
    </div>
  );
}

function ScoreCell({ label, value }) {
  return (
    <div className="bg-[#F9F9F9] rounded-xl px-3 py-2.5 text-center flex-1 min-w-[64px]">
      <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
      <p className="text-[15px] font-semibold text-gray-900">{value ?? "—"}</p>
    </div>
  );
}

// ============================================================
//  ĐĂNG NHẬP ĐỂ XEM (gate khi chưa login mà bấm link trực tiếp)
// ============================================================

function LoginRequired({ toggleModal }) {
  return (
    <div className="min-h-[55vh] w-full flex flex-col items-center justify-center gap-4 text-center px-4 py-16">
      <div className="w-16 h-16 rounded-full bg-[#FFF0E8] flex items-center justify-center text-3xl">🔒</div>
      <h1 className="text-[20px] font-bold text-gray-900">Vui lòng đăng nhập để xem trang này</h1>
      <p className="text-[14px] text-gray-500 max-w-sm leading-relaxed">
        Bạn cần đăng nhập tài khoản học sinh để xem thông tin cá nhân và kết quả học tập.
      </p>
      <motion.button
        {...pressable()}
        onClick={toggleModal}
        className="px-6 py-3 rounded-2xl bg-[#FF6B35] text-white text-[15px] font-bold hover:bg-[#E85E28] transition-colors shadow-[0_4px_16px_rgba(255,107,53,0.30)]"
      >
        Đăng nhập ngay
      </motion.button>
    </div>
  );
}

// ============================================================
//  CHANGE PASSWORD
// ============================================================

export function ChangePassword({ setIsOpenChangePass }) {
  const { showToast }   = useToast();
  const [oldPassword,     setOldPassword]     = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saveLoading,     setSaveLoading]     = useState(false);
  const [showOld,    setShowOld]    = useState(false);
  const [showNew,    setShowNew]    = useState(false);
  const [showConfirm,setShowConfirm]= useState(false);

  const close = () => setIsOpenChangePass(false);

  const submit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword)
      return showToast("Vui lòng nhập đầy đủ thông tin", "warning");
    if (newPassword.length < 8)
      return showToast("Mật khẩu mới phải ≥ 8 ký tự", "warning");
    if (newPassword !== confirmPassword)
      return showToast("Mật khẩu mới không khớp", "warning");
    if (newPassword.includes(" "))
      return showToast("Mật khẩu không được chứa dấu cách", "warning");

    setSaveLoading(true);
    try {
      // Bước 1: Re-authenticate bằng mật khẩu hiện tại để xác minh
      const { data: { user } } = await supabase.auth.getUser();
      const fakeEmail = user?.email; // email giả lập đã lưu trong Auth

      const { error: reAuthError } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: oldPassword,
      });

      if (reAuthError) {
        showToast("Mật khẩu hiện tại không đúng", "error");
        return;
      }

      // Bước 2: Cập nhật mật khẩu mới
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        showToast(updateError.message || "Đổi mật khẩu thất bại", "error");
        return;
      }

      showToast("Đổi mật khẩu thành công", "success");
      close();
    } catch (err) {
      console.error(err);
      showToast("Lỗi kết nối server", "warning");
    } finally {
      setSaveLoading(false);
    }
  };

  const fields = [
    { id: "oldPassword",     label: "Mật khẩu hiện tại",    placeholder: "Nhập mật khẩu hiện tại", value: oldPassword,     set: setOldPassword,     show: showOld,     setShow: setShowOld,     autoFocus: true },
    { id: "newPassword",     label: "Mật khẩu mới",          placeholder: "Tối thiểu 8 ký tự",      value: newPassword,     set: setNewPassword,     show: showNew,     setShow: setShowNew },
    { id: "confirmPassword", label: "Nhập lại mật khẩu mới", placeholder: "Nhập lại mật khẩu",      value: confirmPassword, set: setConfirmPassword, show: showConfirm, setShow: setShowConfirm },
  ];

  return createPortal(
    <Backdrop handleClose={saveLoading ? undefined : close}>
      <motion.div
        {...modalVariant()}
        className="w-full max-w-md mx-4 rounded-3xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FFF0E8] flex items-center justify-center text-lg">🔒</div>
            <h2 className="text-[18px] font-bold text-gray-900">Đổi mật khẩu</h2>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={saveLoading}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] text-gray-500 text-[14px] font-bold flex items-center justify-center transition-colors active:scale-90 disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {fields.map((f) => (
            <div key={f.id}>
              <label htmlFor={f.id} className="text-[13px] font-medium text-gray-500">{f.label}</label>
              <div className="relative mt-1.5">
                <input
                  id={f.id}
                  type={f.show ? "text" : "password"}
                  placeholder={f.placeholder}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  autoFocus={f.autoFocus}
                  disabled={saveLoading}
                  className="w-full rounded-2xl border border-[#E5E5EA] bg-[#F9F9F9] px-4 py-3 pr-12 text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => f.setShow((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-[13px] font-medium"
                >
                  {f.show ? "Ẩn" : "Hiện"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-7 flex gap-3">
          <motion.button {...(saveLoading ? {} : pressable())} disabled={saveLoading} onClick={close}
            className="flex-1 py-3 rounded-2xl bg-[#F2F2F7] text-gray-700 text-[15px] font-semibold hover:bg-[#E5E5EA] transition-colors disabled:opacity-40">
            Hủy
          </motion.button>
          <motion.button {...(saveLoading ? {} : pressable())} disabled={saveLoading} onClick={submit}
            className="flex-1 py-3 rounded-2xl bg-[#FF6B35] text-white text-[15px] font-bold hover:bg-[#E85E28] transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
            {saveLoading && <Spinner />}
            {saveLoading ? "Đang lưu…" : "Lưu thay đổi"}
          </motion.button>
        </div>
      </motion.div>
    </Backdrop>,
    document.getElementById("tai-khoan-page")
  );
}

// ============================================================
//  SAVE CONFIRM
// ============================================================

export function SaveBox({ setIsSaveBoxOn, user, setIsAnyChange }) {
  const { showToast } = useToast();
  const [isSaveData, setIsSaveData] = useState(false);

  const close = () => setIsSaveBoxOn(false);

  const confirmSave = async () => {
    setIsSaveData(true);
    try {
      const username = user.username;
      if (!username) throw new Error("Không tìm thấy username");

      const payload = denormalizeStudent(user);

      const { error } = await supabase
        .from("users")
        .update(payload)
        .eq("username", username);

      if (error) {
        console.error("Supabase update error:", error);
        showToast("Lưu dữ liệu thất bại", "error");
        return;
      }

      // Đồng bộ localStorage
      safeStore("user", JSON.stringify(user));
      setIsAnyChange(false);
      showToast("Lưu dữ liệu thành công", "success");
      close();
    } catch (err) {
      console.error(err);
      showToast("Lỗi kết nối server", "error");
    } finally {
      setIsSaveData(false);
    }
  };

  return createPortal(
    <Backdrop handleClose={isSaveData ? undefined : close}>
      <motion.div
        {...modalVariant()}
        className="bg-white w-full max-w-sm mx-4 rounded-3xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-[#FFF0E8] flex items-center justify-center text-2xl">💾</div>
        </div>

        <h3 className="text-[18px] font-bold text-gray-900 mb-2 text-center">
          {isSaveData ? "Đang xử lý…" : "Lưu thông tin?"}
        </h3>

        {!isSaveData && (
          <p className="text-[14px] text-gray-500 mb-6 text-center leading-relaxed">
            Thông tin bạn vừa chỉnh sửa sẽ được cập nhật vào hệ thống.
          </p>
        )}
        {isSaveData && (
          <div className="flex items-center justify-center gap-2.5 text-[#FF6B35] mb-6">
            <Spinner className="h-5 w-5" />
            <span className="text-[14px] font-medium">Đang lưu dữ liệu...</span>
          </div>
        )}

        <div className="flex gap-3">
          <motion.button {...(isSaveData ? {} : pressable())} disabled={isSaveData} onClick={close}
            className="flex-1 py-3 rounded-2xl bg-[#F2F2F7] text-gray-700 text-[15px] font-semibold hover:bg-[#E5E5EA] transition-colors disabled:opacity-40">
            Hủy
          </motion.button>
          <motion.button {...(isSaveData ? {} : pressable())} disabled={isSaveData} onClick={confirmSave}
            className="flex-1 py-3 rounded-2xl bg-[#FF6B35] text-white text-[15px] font-bold hover:bg-[#E85E28] transition-colors disabled:opacity-70">
            Lưu
          </motion.button>
        </div>
      </motion.div>
    </Backdrop>,
    document.getElementById("tai-khoan-page")
  );
}

// ============================================================
//  PROFILE FIELD ROW
// ============================================================

const GENDER_ICON = { "": "👤", "Nam": "👦🏻", "Nữ": "👧🏻" };

function FieldRow({ icon, label, field, value, displayValue, type = "text", editingField, tempValue, setTempValue, onEdit, onBlur, onCancel, options }) {
  const isEditing = editingField === field;

  // Esc huỷ chỉnh sửa (không lưu), Enter xác nhận lưu ngay — UX quen thuộc
  // với form input, tránh người dùng bị "kẹt" giữa chừng không biết thoát sao.
  const handleKeyDown = (e) => {
    if (e.key === "Escape") { e.preventDefault(); onCancel?.(); }
    else if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); }
  };

  return (
    <div className="flex items-center justify-between bg-[#F9F9F9] rounded-2xl px-4 py-3.5">
      <div className="flex items-center gap-3.5 min-w-0">
        <span className="text-xl flex-shrink-0">{icon}</span>
        <div className="min-w-0">
          <div className="text-[12px] text-gray-400 mb-0.5">{label}</div>
          {!isEditing && (
            <div className="text-[15px] font-semibold text-gray-900 truncate">
              {displayValue ?? value ?? "—"}
            </div>
          )}
          {isEditing && options && (
            <select value={tempValue} onChange={(e) => setTempValue(e.target.value)} onBlur={onBlur} onKeyDown={handleKeyDown} autoFocus
              aria-label={label}
              className="mt-0.5 px-2.5 py-1.5 rounded-lg border border-[#E5E5EA] text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]">
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
          {isEditing && !options && (
            <input type={type} value={tempValue} onChange={(e) => setTempValue(e.target.value)} onBlur={onBlur} onKeyDown={handleKeyDown} autoFocus
              aria-label={label}
              max={type === "date" ? new Date().toISOString().slice(0, 10) : undefined}
              className="mt-0.5 px-2.5 py-1.5 rounded-lg border border-[#E5E5EA] text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35] w-full" />
          )}
        </div>
      </div>
      {!isEditing && (
        <motion.button {...pressable(1.15)} onClick={onEdit} aria-label={`Sửa ${label}`}
          className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-[#E5E5EA] flex items-center justify-center text-[15px]">
          ✏️
        </motion.button>
      )}
    </div>
  );
}

// Skeleton hiển thị khi hồ sơ chưa có dữ liệu (lần đầu vào trang, chưa có
// cache localStorage) — tránh nháy các field trống "—" trước khi Supabase
// trả dữ liệu về.
function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-pulse" aria-busy="true" aria-label="Đang tải hồ sơ">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3.5 bg-[#F9F9F9] rounded-2xl px-4 py-3.5">
          <div className="w-8 h-8 rounded-full bg-[#E5E5EA] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="h-2.5 w-16 rounded bg-[#E5E5EA] mb-2" />
            <div className="h-3.5 w-28 rounded bg-[#E5E5EA]" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
//  PROFILE TAB
// ============================================================

// Field cho phép kiểu ngày cần validate không ở tương lai
const DATE_FIELDS = ["ngaySinh", "ngayRuaToi", "ngayRuocLe", "ngayThemSuc"];

export function Profile({ handleLogout, user, setUser, setIsAnyChange }) {
  const { showToast } = useToast();
  const [editingField, setEditingField] = useState(null);
  const [tempValue,    setTempValue]    = useState("");
  const [isSaveBoxOn,  setIsSaveBoxOn]  = useState(false);
  const [isOpenChangePass, setIsOpenChangePass] = useState(false);

  const editField = (field) => (e) => {
    e.preventDefault();
    setEditingField(field);
    setTempValue(user[field] ?? "");
  };

  // Huỷ chỉnh sửa, không lưu — dùng cho phím Esc
  const cancelEdit = () => {
    setEditingField(null);
    setTempValue("");
  };

  const handleBlur = (field) => {
    // Validate nhẹ nhàng: cảnh báo và giữ nguyên giá trị cũ nếu không hợp lệ,
    // thay vì lưu im lặng dữ liệu sai định dạng.
    if (field === "sdt" && !isValidVNPhone(tempValue)) {
      showToast("Số điện thoại chưa đúng định dạng (VD: 0912345678)", "warning");
      cancelEdit();
      return;
    }
    if (DATE_FIELDS.includes(field) && !isPastOrToday(tempValue)) {
      showToast("Ngày không được ở trong tương lai", "warning");
      cancelEdit();
      return;
    }

    if (tempValue !== user[field]) setIsAnyChange(true);
    setUser((prev) => {
      const next = { ...prev, [field]: tempValue };
      // Nếu đổi giới tính mà avatar hiện tại vẫn là avatar mặc định (chưa upload ảnh thật)
      // thì đổi luôn avatar mặc định theo giới tính mới
      if (field === "gioiTinh" && isDefaultAvatarUrl(prev.avatar)) {
        next.avatar = getDefaultAvatarByGender(tempValue);
      }
      return next;
    });
    setEditingField(null);
    setTempValue("");
  };

  // Admin/Giáo viên không phải học sinh → ẩn các trường mang tính chất bí tích/gia đình
  const isStaff = user.role === "admin" || user.role === "teacher";

  const rows = [
    { icon: GENDER_ICON[user.gioiTinh] ?? "👤", label: "Họ và tên",       field: "hoTen" },
    { icon: "✝️",                                label: "Tên Thánh",        field: "tenThanh" },
    { icon: "🎂",  label: "Ngày sinh",           field: "ngaySinh",   type: "date", displayValue: transferDateForView(user.ngaySinh) },
    ...(!isStaff ? [
      { icon: "💦",  label: "Ngày Rửa Tội",        field: "ngayRuaToi", type: "date", displayValue: transferDateForView(user.ngayRuaToi) },
      { icon: "🫓",  label: "Ngày Rước Lễ",        field: "ngayRuocLe", type: "date", displayValue: transferDateForView(user.ngayRuocLe) },
      { icon: "🕊️", label: "Ngày Thêm Sức",       field: "ngayThemSuc",type: "date", displayValue: transferDateForView(user.ngayThemSuc) },
    ] : []),
    ...(!isStaff ? [
      { icon: "👨🏻", label: "Họ & Tên Cha",        field: "tenCha" },
      { icon: "👩🏻", label: "Họ & Tên Mẹ",        field: "tenMe" },
    ] : []),
    { icon: "📞",  label: "Số điện thoại",       field: "sdt" },
    { icon: "🏠",  label: "Giáo Xóm",            field: "giaoXom" },
    { icon: "⚧️", label: "Giới tính",            field: "gioiTinh",  options: ["Nam", "Nữ"] },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {rows.map((r) => (
        <FieldRow
          key={r.field}
          icon={r.icon}
          label={r.label}
          field={r.field}
          value={user[r.field]}
          displayValue={r.displayValue}
          type={r.type}
          options={r.options}
          editingField={editingField}
          tempValue={tempValue}
          setTempValue={setTempValue}
          onEdit={editField(r.field)}
          onBlur={() => handleBlur(r.field)}
          onCancel={cancelEdit}
        />
      ))}

      {/* Đổi mật khẩu */}
      <div className="flex items-center justify-between bg-[#F9F9F9] rounded-2xl px-4 py-3.5">
        <div className="flex items-center gap-3.5 min-w-0">
          <span className="text-xl flex-shrink-0">🔒</span>
          <div className="min-w-0">
            <div className="text-[12px] text-gray-400 mb-0.5">Mật khẩu</div>
            <div className="text-[15px] font-semibold text-gray-900">••••••••</div>
          </div>
        </div>
        <motion.button {...pressable()} onClick={() => setIsOpenChangePass(true)}
          className="flex-shrink-0 text-[13px] font-semibold px-3.5 py-2 rounded-xl bg-[#F2F2F7] text-gray-700 hover:bg-[#E5E5EA] transition-colors">
          Thay đổi
        </motion.button>
      </div>

      {/* Đăng xuất */}
      <div className="flex items-center justify-between bg-[#F9F9F9] rounded-2xl px-4 py-3.5">
        <div className="flex items-center gap-3.5 min-w-0">
          <span className="text-xl flex-shrink-0">🚪</span>
          <div className="min-w-0">
            <div className="text-[12px] text-gray-400 mb-0.5">Phiên đăng nhập</div>
            <div className="text-[15px] font-semibold text-gray-900">Đang đăng nhập</div>
          </div>
        </div>
        <motion.button {...pressable()} onClick={handleLogout}
          className="flex-shrink-0 text-[13px] font-semibold px-3.5 py-2 rounded-xl bg-[#FEECEC] text-[#FF375F] hover:bg-[#FDD9D9] transition-colors">
          Đăng xuất
        </motion.button>
      </div>

      <div className="md:col-span-2 flex justify-end mt-2">
        <motion.button {...pressable()} onClick={() => setIsSaveBoxOn(true)}
          className="px-6 py-3 rounded-2xl bg-[#FF6B35] text-white text-[15px] font-bold hover:bg-[#E85E28] transition-colors shadow-sm">
          💾 Lưu thông tin
        </motion.button>
      </div>

      <AnimatePresence>
        {isSaveBoxOn    && <SaveBox setIsSaveBoxOn={setIsSaveBoxOn} user={user} setIsAnyChange={setIsAnyChange} />}
        {isOpenChangePass && <ChangePassword setIsOpenChangePass={setIsOpenChangePass} />}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
//  ACHIEVEMENT TAB
// ============================================================

/**
 * Fetch dữ liệu thành tích cho một học sinh trong một học kỳ.
 * Join: grades + term_summary + attendance + enrollments (tất cả đều RLS-protected,
 * chỉ trả về dữ liệu của user đang đăng nhập).
 */
async function fetchAchievementData(username, namHoc, hocKyInt) {
  // hocKyInt === null → đang xem "Cả năm", không cần dữ liệu theo học kỳ
  const [gradesRes, termRes, attendanceRes, enrollmentRes, yearRes] = await Promise.all([
    hocKyInt
      ? supabase
          .from("grades")
          .select("diem_mieng, diem_vo, diem_15_phut, diem_1_tiet, diem_thi, diem_tb")
          .eq("username", username)
          .eq("nam_hoc", namHoc)
          .eq("hoc_ky", hocKyInt)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),

    hocKyInt
      ? supabase
          .from("term_summary")
          .select("hoc_luc, hanh_kiem, vi_thu, tong_buoi, ngay_bat_dau, lop, nam_hoc")
          .eq("username", username)
          .eq("nam_hoc", namHoc)
          .eq("hoc_ky", hocKyInt)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),

    hocKyInt
      ? supabase
          .from("attendance")
          .select("ngay, trang_thai")
          .eq("username", username)
          .eq("nam_hoc", namHoc)
          .eq("hoc_ky", hocKyInt)
          .order("ngay", { ascending: true })
      : Promise.resolve({ data: [], error: null }),

    supabase
      .from("enrollments")
      .select("lop, nam_hoc")
      .eq("username", username)
      .eq("nam_hoc", namHoc)
      .maybeSingle(),

    // Kết quả cả năm — luôn fetch, dùng cho cả tab "Cả năm" lẫn tham chiếu nhanh
    supabase
      .from("year_summary")
      .select("diem_tb, hoc_luc, hanh_kiem, vi_thu, ghi_chu, lop, nam_hoc")
      .eq("username", username)
      .eq("nam_hoc", namHoc)
      .maybeSingle(),
  ]);

  // Gộp lỗi vào log, không throw để UI vẫn render được dữ liệu partial
  [gradesRes, termRes, attendanceRes, enrollmentRes, yearRes].forEach((r, i) => {
    if (r.error) console.error(`fetchAchievementData[${i}] error:`, r.error);
  });

  return {
    grades:      gradesRes.data     ?? null,
    term:        termRes.data       ?? null,
    attendance:  attendanceRes.data ?? [],
    enrollment:  enrollmentRes.data ?? null,
    yearSummary: yearRes.data       ?? null,
  };
}

export function Achievement({ user, cache, setCache }) {
  // 💡 Đồng bộ học kỳ với query param ?hocky= để link thông báo điểm
  // (VD: /tài-khoản/thành-tích?hocky=HK1) mở thẳng đúng học kỳ có điểm mới.
  const [searchParams, setSearchParams] = useSearchParams();
  const hockyParam = searchParams.get("hocky");
  const initialSemester = VALID_SEMESTERS.includes(hockyParam) ? hockyParam : getCurrentSemester();

  const [semester, setSemesterState] = useState(initialSemester);
  const [namHoc]   = useState(getCurrentNamHoc);
  const [loading,  setLoading]  = useState(false);

  const setSemester = (value) => {
    setSemesterState(value);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("hocky", value);
      return next;
    }, { replace: true });
  };

  const isYearView = semester === "NAM";
  const hocKyInt   = HK_INT_MAP[semester] ?? null; // null khi xem "Cả năm"

  const cacheKey = `${user?.username}-${namHoc}-${semester}`;
  const data = cache[cacheKey] ?? null;

  useEffect(() => {
    const username = user?.username;
    if (!username) return;
    if (cache[cacheKey]) return;

    let cancelled = false;
    setLoading(true);

    fetchAchievementData(username, namHoc, hocKyInt)
      .then((result) => { 
        if (cancelled) return; 
        setCache((prev) => ({ ...prev, [cacheKey]: result }));
      })
      .catch((err)   => console.error("Achievement fetch error:", err))
      .finally(()    => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [user?.username, semester, namHoc, cacheKey, hocKyInt]);

  // ── Derived values ──────────────────────────────────────────────────
  const grades      = data?.grades      ?? {};
  const term        = data?.term        ?? {};
  const enrollment  = data?.enrollment  ?? {};
  const yearSummary = data?.yearSummary ?? null;

  const lop        = term.lop     || enrollment.lop     || yearSummary?.lop     || "—";
  const displayNamHoc = term.nam_hoc || enrollment.nam_hoc || yearSummary?.nam_hoc || namHoc;

  // Nguồn hoc_luc/hanh_kiem dùng để hiển thị: theo học kỳ hoặc theo cả năm
  const summarySource = isYearView ? (yearSummary ?? {}) : term;

  const isFinal =
    summarySource.hoc_luc   && summarySource.hoc_luc   !== "-" &&
    summarySource.hanh_kiem && summarySource.hanh_kiem !== "-";

  /**
   * Xây dựng danh sách điểm danh đầy đủ từ term_summary.
   *
   * Logic:
   *   - Lấy ngay_bat_dau và tong_buoi từ term_summary để sinh ra N chủ nhật
   *   - Supabase chỉ lưu các buổi NGOẠI LỆ (nghỉ phép / không phép / ngày lễ)
   *   - Buổi không có trong bảng attendance → mặc định là "co_mat"
   *
   * Format ngày trong DB: "YYYY-MM-DD" (DATE column)
   * So sánh bằng ISO string để tránh lỗi timezone khi dùng getTime().
   */
  const attendanceList = useMemo(() => {
    const startRaw  = term.ngay_bat_dau;
    const tongBuoi  = term.tong_buoi;

    // Chưa có dữ liệu từ DB
    if (!startRaw || !tongBuoi) return [];

    // Build exception map: "YYYY-MM-DD" → trang_thai
    const exceptionMap = new Map(
      (data?.attendance ?? []).map(({ ngay, trang_thai }) => [ngay, trang_thai])
    );

    const startDate = new Date(startRaw);
    const result = [];

    for (let i = 0; i < tongBuoi; i++) {
      const sunday = new Date(startDate);
      sunday.setDate(startDate.getDate() + i * 7);

      // Format về "YYYY-MM-DD" để tra map (tránh lệch timezone)
      const isoDate = sunday.toISOString().slice(0, 10);

      result.push({
        date:       sunday,
        isoDate,
        trang_thai: exceptionMap.get(isoDate) ?? "co_mat",
      });
    }

    return result;
  }, [term.ngay_bat_dau, term.tong_buoi, data?.attendance]);

  // Tổng hợp số liệu vắng từ danh sách đã generate
  const attendanceCounts = useMemo(() => {
    const counts = { nghi_khong_phep: 0, nghi_phep: 0 };
    attendanceList.forEach(({ trang_thai }) => {
      if (trang_thai === "nghi_khong_phep") counts.nghi_khong_phep++;
      if (trang_thai === "nghi_phep")       counts.nghi_phep++;
    });
    counts.tong_nghi = counts.nghi_khong_phep + counts.nghi_phep;
    return counts;
  }, [attendanceList]);

  const hocLucText   = useMemo(() => pickRandom(GL_HOCLUC_COMMENTS[summarySource.hoc_luc]   || [""]), [summarySource.hoc_luc]);
  const hanhKiemText = useMemo(() => pickRandom(GL_HANHKIEM_COMMENTS[summarySource.hanh_kiem] || [""]), [summarySource.hanh_kiem]);

  return (
    <div className="flex flex-col gap-5">
      {/* HEADER */}
      <div className="bg-white rounded-2xl border border-[#F0F0F0] shadow-sm p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[18px] font-bold text-gray-900 truncate">{user?.hoTen || "—"}</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {lop} · {displayNamHoc}
          </p>
        </div>
        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          className="flex-shrink-0 border border-[#E5E5EA] rounded-xl px-3 py-2 text-[13px] font-medium bg-[#F9F9F9] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
        >
          <option value="HK1">Học kỳ I</option>
          <option value="HK2">Học kỳ II</option>
          <option value="NAM">Cả năm</option>
        </select>
      </div>

      {/* LOADING STATE */}
      {loading && <AchievementSkeleton />}

      {!loading && (
        <>
          {/* SUMMARY */}
          <div className="grid grid-cols-2 gap-3">
            {isYearView ? (
              <>
                <StatCard label="Điểm TB năm"   value={yearSummary?.diem_tb}    colorClass="text-[#007AFF]" />
                <StatCard label="Học lực năm"   value={yearSummary?.hoc_luc}    colorClass={RANK_COLORS.hoc_luc[yearSummary?.hoc_luc]     || "text-gray-900"} />
                <StatCard label="Hạnh kiểm năm" value={yearSummary?.hanh_kiem}  colorClass={RANK_COLORS.hanh_kiem[yearSummary?.hanh_kiem] || "text-gray-900"} />
                <StatCard label="Vị thứ năm"    value={yearSummary?.vi_thu}     colorClass="text-[#007AFF]" />
              </>
            ) : (
              <>
                <StatCard label="Điểm TB"   value={grades.diem_tb}    colorClass="text-[#007AFF]" />
                <StatCard label="Học lực"   value={term.hoc_luc}      colorClass={RANK_COLORS.hoc_luc[term.hoc_luc]     || "text-gray-900"} />
                <StatCard label="Hạnh kiểm" value={term.hanh_kiem}    colorClass={RANK_COLORS.hanh_kiem[term.hanh_kiem] || "text-gray-900"} />
                <StatCard label="Vị thứ"    value={term.vi_thu}       colorClass="text-[#007AFF]" />
              </>
            )}
          </div>

          {/* STATUS BANNER */}
          <div className={`rounded-2xl px-4 py-3 text-[13px] font-medium ${isFinal ? "bg-[#EFF6FF] text-[#1D4ED8]" : "bg-[#FFF8E1] text-[#92700A]"}`}>
            {isFinal
              ? "ℹ️ Thông tin đã cập nhật đầy đủ!"
              : isYearView
                ? "⚠️ Kết quả tổng kết cả năm đang được cập nhật thêm"
                : "⚠️ Thông tin điểm thi và điểm danh đang được cập nhật thêm"}
          </div>

          {/* Ghi chú tổng kết năm (nếu có) */}
          {isYearView && yearSummary?.ghi_chu && (
            <div className="bg-white rounded-2xl border border-[#F0F0F0] shadow-sm p-4">
              <p className="text-[13px] font-bold text-gray-900 mb-1.5">Ghi chú</p>
              <p className="text-[13px] text-gray-600 leading-relaxed">{yearSummary.ghi_chu}</p>
            </div>
          )}

          {/* ATTENDANCE — chỉ áp dụng theo học kỳ, schema hiện chưa có điểm danh gộp cả năm */}
          {!isYearView && (
          <div className="bg-white rounded-2xl border border-[#F0F0F0] shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-gray-900">
                Điểm danh{" "}
                <span className="text-gray-400 font-normal">
                  ({term.tong_buoi ?? "—"} tuần)
                </span>
              </h2>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4 text-[12px] text-gray-500">
              {Object.entries(ATTENDANCE_STATUS).filter(([k]) => k !== "null").map(([k, v]) => (
                <span key={k} className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-full ${v.color}`} />
                  {v.label}
                </span>
              ))}
            </div>

            {/* Attendance strip */}
            {attendanceList.length > 0 ? (
              <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
                {attendanceList.map(({ date, isoDate, trang_thai }) => {
                  const status = ATTENDANCE_STATUS[trang_thai] ?? ATTENDANCE_STATUS["null"];
                  return (
                    <div key={isoDate} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-12">
                      <span className={`w-8 h-8 rounded-full ${status.color}`} title={status.label} />
                      <span className="text-[11px] text-gray-400 whitespace-nowrap">
                        {date.getDate()}/{date.getMonth() + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6 text-gray-300">
                <span className="text-3xl">🗓️</span>
                <p className="text-[13px] text-gray-400">Chưa có dữ liệu điểm danh cho học kỳ này</p>
              </div>
            )}

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-[#F0F0F0] flex flex-wrap gap-x-6 gap-y-1.5 text-[13px]">
              <span className="text-gray-500">
                Nghỉ không phép: <strong className="text-[#FF375F]">{attendanceCounts.nghi_khong_phep ?? "—"}</strong>
              </span>
              <span className="text-gray-500">
                Nghỉ có phép: <strong className="text-[#92700A]">{attendanceCounts.nghi_phep ?? "—"}</strong>
              </span>
              <span className="text-gray-500">
                Tổng nghỉ: <strong className="text-[#FF375F]">{attendanceCounts.tong_nghi ?? "—"}</strong>
              </span>
            </div>
          </div>
          )}

          {/* SCORE DETAIL — chỉ áp dụng theo học kỳ */}
          {!isYearView && (
          <div className="bg-white rounded-2xl border border-[#F0F0F0] shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-gray-900">Bảng điểm chi tiết</h2>
              <span className="bg-[#EFF6FF] text-[#007AFF] text-[12px] font-bold px-2.5 py-1 rounded-full">
                TBM {grades.diem_tb || "—"}
              </span>
            </div>
            <p className="text-[14px] font-semibold text-gray-700 mb-3">Môn học: Phụng Vụ</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <ScoreCell label="Miệng" value={grades.diem_mieng}   />
              <ScoreCell label="Vở"    value={grades.diem_vo}      />
              <ScoreCell label="15'"   value={grades.diem_15_phut} />
              <ScoreCell label="1 Tiết"value={grades.diem_1_tiet}  />
              <ScoreCell label="Thi"   value={grades.diem_thi}     />
            </div>
          </div>
          )}

          {/* COMMENT */}
          {isFinal && (
            <div className="bg-[#F9F9F9] rounded-2xl p-4 border border-[#F0F0F0]">
              <p className="text-[13px] font-bold text-gray-900 mb-1.5">Nhận xét Giáo lý viên</p>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                {hocLucText} {hanhKiemText} Xin Chúa chúc lành và đồng hành cùng em trên hành trình đức tin!
              </p>
            </div>
          )}

          {/* VERSE CARD */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#FCE7F3] p-6 text-center">
            <div className="text-4xl mb-3">🌸</div>
            <p className="text-[16px] font-semibold text-gray-700 leading-relaxed italic">
              "Mọi việc anh em làm,<br />hãy làm trong tình yêu thương."
            </p>
            <p className="mt-2 text-[12px] text-gray-400">(1 Cr 16,14)</p>
            <div className="mt-5 bg-[#FDF2F8] rounded-2xl p-4">
              <p className="text-[#DB2777] text-[13px] font-medium leading-relaxed">
                Chúc các bạn học giỏi, sống tốt và lan tỏa yêu thương qua từng việc làm mỗi ngày 💖
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
//  IMAGE HELPERS
// ============================================================

function resizeImage(file, maxSize = 100, targetBytes = 10 * 1024) {
  return new Promise((resolve, reject) => {
    const img    = new Image();
    const reader = new FileReader();

    reader.onload  = () => { img.src = reader.result; };
    reader.onerror = () => reject(new Error("Không đọc được file"));
    img.onerror    = () => reject(new Error("File ảnh không hợp lệ"));

    img.onload = () => {
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) { height = Math.round(height * (maxSize / width)); width = maxSize; }
        else                { width  = Math.round(width  * (maxSize / height)); height = maxSize; }
      }

      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);

      const qualities = [0.7, 0.5, 0.35, 0.2];
      const encodeWith = (mime, ext, idx = 0) => {
        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error("Trình duyệt không hỗ trợ nén ảnh này")); return; }
          if (blob.size <= targetBytes || idx >= qualities.length - 1) resolve({ blob, ext });
          else encodeWith(mime, ext, idx + 1);
        }, mime, qualities[idx]);
      };

      // 💡 Test webp 1 lần duy nhất: nếu trình duyệt trả đúng type webp thì dùng,
      //    không thì fallback jpeg — path lưu sẽ luôn nhất quán trong 1 lần upload
      canvas.toBlob((testBlob) => {
        if (testBlob && testBlob.type === "image/webp") encodeWith("image/webp", "webp");
        else                                             encodeWith("image/jpeg", "jpeg");
      }, "image/webp", 0.7);
    };

    reader.readAsDataURL(file);
  });
}

// ============================================================
//  TÀI KHOẢN PAGE (root) — thay thế ModalUser, dùng làm trang thật
//  route cha ("/tài-khoản/*") được khai báo trong App.jsx, còn 2 route con
//  ("hồ-sơ", "thành-tích") tự quản lý ngay trong file này để giữ toàn bộ
//  logic tài khoản gói gọn trong 1 lazy-chunk duy nhất.
//
//  💡 QUAN TRỌNG về chữ có dấu trong route: các hằng số dưới đây là nơi DUY
//  NHẤT gõ tay "hồ-sơ" / "thành-tích". Toàn bộ Route path, NavLink "to",
//  Navigate "to" và so sánh location.pathname phía dưới đều tham chiếu lại
//  đúng các biến này — KHÔNG gõ lại chữ có dấu ở chỗ khác. Lý do: cùng 1 chữ
//  tiếng Việt có thể được lưu ở 2 dạng Unicode khác nhau (NFC/NFD) tuỳ cách
//  gõ/copy — nhìn giống hệt nhau nhưng so sánh chuỗi (===, endsWith) sẽ ra
//  false, khiến route không khớp hoặc thanh trượt tab không hoạt động dù
//  URL đã đúng. Dùng chung 1 biến giúp loại bỏ hoàn toàn rủi ro này.
//
//  💡 QUAN TRỌNG về path TUYỆT ĐỐI vs TƯƠNG ĐỐI: <Routes> ở dưới được lồng
//  bên trong element của route cha "tài-khoản/*". Nếu NavLink/Navigate dùng
//  "to" TƯƠNG ĐỐI (không có "/" ở đầu, VD to="hồ-sơ"), React Router sẽ NỐI
//  THÊM vào path HIỆN TẠI thay vì thay thế hẳn — khi path hiện tại đã là
//  "/tài-khoản/thành-tích" thì bấm sang "hồ-sơ" sẽ ra
//  "/tài-khoản/thành-tích/hồ-sơ" (dài dần vô hạn nếu dính redirect loop).
//  → Mọi NavLink/Navigate trỏ tới hồ-sơ/thành-tích PHẢI dùng URL TUYỆT ĐỐI
//  (TAB_PROFILE_URL / TAB_ACHIEVEMENT_URL, có "/" ở đầu). Chỉ riêng "path"
//  của <Route> bên trong <Routes> mới dùng bản KHÔNG có "/" đầu
//  (TAB_PROFILE_PATH / TAB_ACHIEVEMENT_PATH), vì cú pháp Route path yêu cầu vậy.
const TAI_KHOAN_BASE       = "/tài-khoản";
const TAB_PROFILE_PATH     = "hồ-sơ";
const TAB_ACHIEVEMENT_PATH = "thành-tích";
const TAB_PROFILE_URL      = `${TAI_KHOAN_BASE}/${TAB_PROFILE_PATH}`;
const TAB_ACHIEVEMENT_URL  = `${TAI_KHOAN_BASE}/${TAB_ACHIEVEMENT_PATH}`;

export default function TaiKhoanLayout() {
  // isLogin/setIsLogin/toggleModal được AppLayout truyền xuống qua
  // <Outlet context={...} />. QUAN TRỌNG: phải lấy cả setIsLogin — nếu
  // thiếu, đăng xuất từ trang này sẽ không cập nhật trạng thái đăng nhập
  // toàn cục (Header vẫn hiện avatar/tên cũ cho tới khi F5 lại trang).
  const { isLogin, setIsLogin, toggleModal } = useOutletContext();
  const navigate = useNavigate();
  // Dùng đúng cơ chế khớp route mà NavLink đang dùng bên trong (tự xử lý
  // trailing slash, encoding...) thay vì tự so sánh location.pathname bằng
  // tay — tránh trường hợp NavLink báo "active" đúng nhưng thanh trượt lại
  // tính sai do 2 cách khớp khác nhau.
  const isAchievementActive = !!useMatch(TAB_ACHIEVEMENT_URL);
  const { showToast } = useToast();
  const fileRef        = useRef(null);
  const [loadingAva,   setLoadingAva]   = useState(false);
  const [avatarUrl,    setAvatarUrl]    = useState("");
  // Khởi tạo user NGAY từ localStorage (đọc an toàn qua safeParse) thay vì
  // {} rồi chờ useEffect — tránh 1 nhịp render đầu tiên isStaff = false sai
  // (nháy hiện tab Thành tích/Achievement cho admin-teacher trước khi kịp
  // redirect).
  const [user,         setUser]         = useState(() => safeParse("user", {}));
  const [isAnyChange,  setIsAnyChange]  = useState(false);
  const [achievementCache, setAchievementCache] = useState({});
  // Đã có cache local hay chưa — dùng để quyết định hiện skeleton hồ sơ khi
  // vào trang lần đầu và chưa có gì để hiển thị.
  const [profileLoaded, setProfileLoaded] = useState(() => Object.keys(safeParse("user", {}) || {}).length > 0);

  // Admin/Giáo viên không có dữ liệu học tập (điểm, điểm danh...) → ẩn tab Thành tích
  const isStaff = user.role === "admin" || user.role === "teacher";

  const selectAvatar = () => fileRef.current?.click();

  // ── Cảnh báo khi rời trang lúc còn thay đổi chưa lưu ────────────────
  useEffect(() => {
    if (!isAnyChange) return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isAnyChange]);

  const avatarUploadCancelRef = useRef(() => {});

  useEffect(() => {
    return () => { avatarUploadCancelRef.current(); }; // hủy update state nếu unmount khi đang upload
  }, []);

  // ── Avatar upload lên Supabase Storage ──────────────────────────────
  const uploadAvatar = async (resizedBlob, username, ext) => {
    const filePath = `avatars/${username}.${ext}`;

    // 💡 Xoá các phiên bản extension khác (nếu trình duyệt trước đó tạo ra ext khác)
    //    để tránh rác tồn trong bucket. Bỏ qua lỗi (file có thể không tồn tại).
    const staleExts = ["webp", "jpeg", "jpg", "avif"].filter((e) => e !== ext);
    await supabase.storage
      .from("user-assets")
      .remove(staleExts.map((e) => `avatars/${username}.${e}`))
      .catch(() => {});

    const { error: uploadError } = await supabase.storage
      .from("user-assets")
      .upload(filePath, resizedBlob, { upsert: true, contentType: resizedBlob.type });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from("user-assets").getPublicUrl(filePath);
    const publicUrl = urlData?.publicUrl;
    if (!publicUrl) throw new Error("Không lấy được public URL");

    // 💡 Cache-bust: path storage giữ nguyên, chỉ URL lưu DB có query param
    //    để trình duyệt/CDN không dùng cache cũ khi avatar đã đổi
    const bustedUrl = `${publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar: bustedUrl })
      .eq("username", username);

    if (updateError) throw updateError;

    return bustedUrl;
  };

  const MAX_AVATAR_FILE_SIZE = 8 * 1024 * 1024; // 8MB

  const handleAvatar = async (e) => {
    const inputEl = e.target;
    const file    = inputEl.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Chỉ chọn ảnh", "warning");
      inputEl.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_FILE_SIZE) {
      showToast("Ảnh quá lớn (tối đa 8MB)", "warning");
      inputEl.value = "";
      return;
    }

    let cancelled = false;
    avatarUploadCancelRef.current = () => { cancelled = true; };

    // 💡 Lưu lại trạng thái cũ để rollback nếu upload thất bại
    const previousAvatarUrl  = avatarUrl;
    const previousUserAvatar = user.avatar;

    setLoadingAva(true);
    try {
      const { blob: resizedBlob, ext } = await resizeImage(file);
      if (cancelled) return;

      const previewUrl = URL.createObjectURL(resizedBlob);
      setAvatarUrl(previewUrl); // preview lạc quan

      const username = user.username;
      if (!username) throw new Error("Không tìm thấy username");

      const publicUrl = await uploadAvatar(resizedBlob, username, ext);
      if (cancelled) return;

      setUser((prev) => ({ ...prev, avatar: publicUrl }));
      const savedUser = safeParse("user", {});
      safeStore("user",   JSON.stringify({ ...savedUser, avatar: publicUrl }));
      safeStore("avatar", publicUrl);
      safeStore("role", user.role);
      window.dispatchEvent(new Event("avatar-updated"));

      showToast("Cập nhật avatar thành công", "success");
    } catch (err) {
      console.error(err);
      if (!cancelled) {
        // 💡 Rollback preview + user.avatar về trạng thái trước khi thử upload
        setAvatarUrl(previousAvatarUrl);
        setUser((prev) => ({ ...prev, avatar: previousUserAvatar }));
        showToast(err.message || "Không thể upload avatar", "error");
      }
    } finally {
      if (!cancelled) setLoadingAva(false);
      inputEl.value = ""; // 💡 cho phép chọn lại đúng file cũ nếu muốn thử lại
    }
  };

  // ── Load profile từ Supabase ────────────────────────────────────────
  const loadUser = async () => {
    try {
      const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !authUser) {
        console.error("loadUser: không lấy được auth user:", authErr);
        return;
      }

      // Lọc tường minh theo auth_id thay vì chỉ dựa vào RLS + .single():
      // với role admin/teacher, RLS thường cho phép xem NHIỀU dòng (quản lý lớp/hệ thống),
      // nên .single() không kèm .eq() sẽ throw lỗi "multiple rows returned" và load thất bại.
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", authUser.id)
        .single();

      if (error) {
        console.error("loadUser error:", error);
        showToast("Không tải được thông tin tài khoản, thử lại sau", "error");
        return;
      }

      const normalized = normalizeStudent(data);
      setUser(normalized);
      safeStore("user",   JSON.stringify(normalized));
      safeStore("avatar", normalized.avatar);
      safeStore("role",   normalized.role);
    } catch (err) {
      console.error("loadUser exception:", err);
      showToast("Lỗi kết nối, không tải được tài khoản", "error");
    } finally {
      setProfileLoaded(true);
    }
  };

  // ── Init: load từ localStorage trước, sau đó fetch Supabase ────────
  useEffect(() => {
    if (!isLogin) return;
    const savedData = safeParse("user", null);
    if (savedData) setUser(savedData);
    loadUser();
  }, [isLogin]);

  // ── Cleanup blob URL ────────────────────────────────────────────────
  useEffect(() => {
    return () => { if (avatarUrl) URL.revokeObjectURL(avatarUrl); };
  }, [avatarUrl]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("handleLogout: signOut lỗi:", err);
      // Vẫn tiếp tục dọn dẹp local state kể cả khi signOut lỗi (VD mất mạng),
      // để người dùng không bị kẹt lại ở trạng thái "đăng nhập" trên UI.
    }
    ["username", "user", "avatar", "sessionKey", "role", "studentData"].forEach((k) => localStorage.removeItem(k));
    setUser({});
    setIsAnyChange(false);
    // ⚠️ Bắt buộc gọi setIsLogin(false) để đồng bộ trạng thái đăng nhập lên
    // App.jsx/Header — nếu thiếu, Header vẫn hiện avatar/tên cũ cho tới khi
    // người dùng F5 lại trang.
    setIsLogin(false);
    showToast("Đã đăng xuất", "success");
    navigate("/");
  };

  // ── Chưa đăng nhập: hiện màn hình yêu cầu đăng nhập, không load gì thêm ──
  if (!isLogin) {
    return <LoginRequired toggleModal={toggleModal} />;
  }

  return (
    <div id="tai-khoan-page" className="w-full max-w-4xl mx-auto px-4 md:px-6 py-8">
      {/* Header trang */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">Tài khoản của tôi</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">Thông tin cá nhân và kết quả học tập</p>
        </div>
        <NavLink to="/" className="text-[13px] font-semibold text-gray-500 hover:text-[#FF6B35] transition-colors">
          ← Về trang chủ
        </NavLink>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-[#F0F0F0] px-4 md:px-8 py-6">
        {/* Avatar + tab switcher */}
        <div className="flex flex-col items-center gap-5 mb-6">
          <div className="relative">
            <div className={`relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-[#F9F9F9] shadow-sm ${loadingAva ? "opacity-70" : ""}`}>
              <img
                src={avatarUrl || user.avatar}
                alt={user.hoTen || "Avatar"}
                className="w-full h-full object-cover bg-[#E5E5EA]"
                onError={(e) => {
                  // Ảnh lỗi (404/CDN miss) → rơi về avatar mặc định theo giới tính,
                  // tránh hiện icon vỡ ảnh xấu xí. Dùng dataset để chặn vòng lặp lỗi
                  // vô hạn nếu ảnh fallback cũng lỗi.
                  if (e.currentTarget.dataset.fallbackApplied) return;
                  e.currentTarget.dataset.fallbackApplied = "1";
                  e.currentTarget.src = getDefaultAvatarByGender(user.gioiTinh);
                }}
              />
              {loadingAva && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                  <div className="w-7 h-7 border-[3px] border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={selectAvatar}
              disabled={loadingAva}
              aria-label="Đổi ảnh đại diện"
              className={`absolute bottom-0 right-0 w-8 h-8 rounded-full shadow-sm flex items-center justify-center text-[14px] ${loadingAva ? "bg-[#E5E5EA] cursor-not-allowed" : "bg-[#FF6B35] hover:bg-[#E85E28] text-white"}`}
            >
              ✏️
            </button>
            <input type="file" ref={fileRef} accept="image/*" hidden onChange={handleAvatar} />
          </div>

          {/* Segmented control — chỉ hiện khi có tab Thành tích (học sinh) */}
          {!isStaff && (
            <div className="relative w-full max-w-xs h-11 rounded-2xl bg-[#E5E5EA] p-1 flex select-none">
              <TabIndicator activeTab={isAchievementActive ? "thanh-tich" : "ho-so"} />
              <div className="relative z-10 grid grid-cols-2 w-full text-[13px] font-semibold">
                <NavLink to={TAB_PROFILE_URL} end
                  className={({ isActive }) => `flex items-center justify-center rounded-xl transition-colors ${isActive ? "text-[#FF6B35]" : "text-gray-500"}`}>
                  Hồ sơ
                </NavLink>
                <NavLink to={TAB_ACHIEVEMENT_URL}
                  className={({ isActive }) => `flex items-center justify-center rounded-xl transition-colors ${isActive ? "text-[#FF6B35]" : "text-gray-500"}`}>
                  Thành tích
                </NavLink>
              </div>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          <Routes>
            <Route index element={<Navigate to={TAB_PROFILE_URL} replace />} />
            <Route
              path={TAB_PROFILE_PATH}
              element={
                <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  {profileLoaded
                    ? <Profile user={user} handleLogout={handleLogout} setUser={setUser} setIsAnyChange={setIsAnyChange} />
                    : <ProfileSkeleton />}
                </motion.div>
              }
            />
            <Route
              path={TAB_ACHIEVEMENT_PATH}
              element={
                isStaff ? (
                  <Navigate to={TAB_PROFILE_URL} replace />
                ) : (
                  <motion.div key="achievement" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    <Achievement user={user} cache={achievementCache} setCache={setAchievementCache} />
                  </motion.div>
                )
              }
            />
            <Route path="*" element={<Navigate to={TAB_PROFILE_URL} replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Thanh trượt segmented control — nhận tab đang active từ cha (tính qua useMatch,
// cùng cơ chế NavLink dùng) để luôn đồng bộ với màu chữ tab.
function TabIndicator({ activeTab }) {
  return (
    <motion.span
      className="absolute top-1 left-1 h-9 w-[calc(50%-4px)] rounded-xl bg-white shadow-sm"
      animate={{ x: activeTab === "thanh-tich" ? "100%" : "0%" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    />
  );
}