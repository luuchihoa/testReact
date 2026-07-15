import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Routes, Route, Navigate, NavLink, useNavigate, useMatch, useSearchParams, useOutletContext } from "react-router-dom";
import { modalVariant, pressable } from "../ui/variant.jsx";
import { useToast } from "../ui/ToastContext.jsx";
import { createPortal } from "react-dom";
import Backdrop from "../ui/Backdrop.jsx";
import { AchievementSkeleton } from "../ui/Skeleton.jsx";
import { supabase } from "../../lib/supabase.js";

// ============================================================
//  CONSTANTS & HELPERS
// ============================================================

const SEMESTER_START_MONTH_DAY = { HK1: { month: 8, day: 14 }, HK2: { month: 0, day: 25 } };

function getCurrentNamHoc(date = new Date()) {
  const year  = date.getFullYear();
  const month = date.getMonth();
  const startYear = month >= 8 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

function getSemesterFallbackStart(semesterKey, date = new Date()) {
  const year  = date.getFullYear();
  const month = date.getMonth();
  const startYear = month >= 8 ? year : year - 1; 
  const { month: m, day } = SEMESTER_START_MONTH_DAY[semesterKey];
  const calendarYear = semesterKey === "HK1" ? startYear : startYear + 1;
  return new Date(calendarYear, m, day);
}

const HK_INT_MAP = { HK1: 1, HK2: 2 };
const VALID_SEMESTERS = ["HK1", "HK2", "NAM"];

const RANK_COLORS = {
  hoc_luc: { "Giỏi": "text-[#10B981]", "Khá": "text-[#3B82F6]", "Trung Bình": "text-[#F59E0B]", "Yếu": "text-[#F97316]", "Kém": "text-[#EF4444]" },
  hanh_kiem: { "Tốt": "text-[#10B981]", "Khá": "text-[#3B82F6]", "Trung Bình": "text-[#F59E0B]", "Yếu": "text-[#EF4444]" },
};

const ATTENDANCE_STATUS = {
  co_mat:           { color: "bg-[#10B981]", label: "Có mặt" },
  nghi_phep:        { color: "bg-[#F59E0B]", label: "Nghỉ có phép" },
  nghi_khong_phep:  { color: "bg-[#EF4444]", label: "Nghỉ không phép" },
  nghi_le:          { color: "bg-[#60A5FA]", label: "Ngày nghỉ lễ" },
  null:             { color: "bg-[#E5E5EA] border border-dashed border-[#C7C7CC]", label: "Chưa cập nhật" },
};

const GL_HOCLUC_COMMENTS = {
  "Giỏi":       ["Em tiếp thu giáo lý rất tốt, hiểu bài nhanh và biết áp dụng giáo huấn vào đời sống.", "Em học giáo lý nghiêm túc, nắm vững nội dung và có tinh thần chia sẻ trong lớp."],
  "Khá":        ["Em nắm được nội dung giáo lý và tham gia học tập khá đều đặn.", "Em hiểu bài và có tinh thần hợp tác tốt trong các sinh hoạt lớp."],
  "Trung Bình": ["Em hiểu được những nội dung giáo lý cơ bản, cần cố gắng hơn trong việc ôn bài.", "Em nên dành thêm thời gian học bài để theo kịp chương trình."],
  "Yếu":        ["Em còn gặp khó khăn trong việc tiếp thu giáo lý, cần được quan tâm và nhắc nhở thêm.", "Em cần cố gắng hơn trong việc học và tham dự các buổi giáo lý."],
  "Kém":        ["Em chưa theo kịp chương trình giáo lý, cần sự đồng hành của gia đình và giáo lý viên."],
};

const GL_HANHKIEM_COMMENTS = {
  "Tốt":        ["Em ngoan ngoãn, lễ phép và tham dự tích cực các buổi học giáo lý.", "Em sống chan hòa, biết tôn trọng bạn bè và giáo lý viên."],
  "Khá":        ["Em chấp hành nội quy lớp khá tốt, cần chủ động hơn trong sinh hoạt."],
  "Trung Bình": ["Em cần rèn luyện thêm tính tự giác và chú ý hơn trong giờ học."],
  "Yếu":        ["Em tham dự chưa nghiêm túc, cần được nhắc nhở và đồng hành thêm."],
};

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function getCurrentSemester(date = new Date()) {
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

function safeStore(key, value) { try { localStorage.setItem(key, value); } catch { } }
function safeParse(key, fallback = null) { try { const raw = localStorage.getItem(key); if (!raw) return fallback; return JSON.parse(raw); } catch { return fallback; } }
function isValidVNPhone(value) { if (!value) return true; const cleaned = value.replace(/[\s.-]/g, ""); return /^(0\d{9}|\+84\d{9})$/.test(cleaned); }
function isPastOrToday(dateStr) { if (!dateStr) return true; const d = new Date(dateStr); if (Number.isNaN(d.getTime())) return true; const today = new Date(); today.setHours(23, 59, 59, 999); return d <= today; }

const DEFAULT_AVATAR_BOY     = "/images/avatarBoy.avif";
const DEFAULT_AVATAR_GIRL    = "/images/avatarGirl.avif";
const DEFAULT_AVATAR_NEUTRAL = "/images/avatarDefault.avif";
function getDefaultAvatarByGender(gioiTinh) { if (gioiTinh === "Nam") return DEFAULT_AVATAR_BOY; if (gioiTinh === "Nữ") return DEFAULT_AVATAR_GIRL; return DEFAULT_AVATAR_NEUTRAL; }
function isDefaultAvatarUrl(url) { return url === DEFAULT_AVATAR_BOY || url === DEFAULT_AVATAR_GIRL || url === DEFAULT_AVATAR_NEUTRAL || !url; }

function normalizeStudent(raw) {
  if (!raw) return {};
  const gioiTinh = raw.gioi_tinh ?? "";
  return {
    username: raw.username ?? "", tenThanh: raw.ten_thanh ?? "", hoTen: raw.ho_va_ten ?? "", ngaySinh: raw.ngay_sinh ?? "", ngayRuaToi: raw.ngay_rua_toi ?? "", ngayRuocLe: raw.ngay_ruoc_le ?? "", ngayThemSuc: raw.ngay_them_suc ?? "", tenCha: raw.ten_cha ?? "", tenMe: raw.ten_me ?? "", sdt: raw.sdt ?? "", giaoXom: raw.giao_xom ?? "", gioiTinh, avatar: raw.avatar || getDefaultAvatarByGender(gioiTinh), role: raw.role ?? "user", trangThai: raw.trang_thai ?? "đang học",
  };
}

function denormalizeStudent(ui) {
  return {
    ten_thanh: ui.tenThanh ?? null, ho_va_ten: ui.hoTen ?? null, ngay_sinh: ui.ngaySinh || null, ngay_rua_toi: ui.ngayRuaToi || null, ngay_ruoc_le: ui.ngayRuocLe || null, ngay_them_suc: ui.ngayThemSuc || null, ten_cha: ui.tenCha ?? null, ten_me: ui.tenMe ?? null, sdt: ui.sdt ?? null, giao_xom: ui.giaoXom ?? null, gioi_tinh: ui.gioiTinh || null,
  };
}

// ============================================================
//  SUB-COMPONENTS
// ============================================================

function Spinner({ className = "h-4 w-4" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function StatCard({ label, value, colorClass = "text-amber-950 dark:text-white" }) {
  return (
    <div className="bg-white/80 dark:bg-stone-800/40 backdrop-blur-sm rounded-2xl border border-amber-900/10 dark:border-amber-100/10 shadow-sm p-4">
      <p className="text-[12px] font-semibold text-stone-500 dark:text-stone-400 mb-1">{label}</p>
      <p className={`text-[20px] font-bold ${colorClass}`}>{value ?? "—"}</p>
    </div>
  );
}

function ScoreCell({ label, value }) {
  return (
    <div className="bg-amber-900/5 dark:bg-amber-100/5 rounded-xl px-3 py-2.5 text-center flex-1 min-w-[64px] border border-amber-900/10 dark:border-amber-100/10">
      <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-0.5">{label}</p>
      <p className="text-[15px] font-bold text-amber-950 dark:text-amber-50">{value ?? "—"}</p>
    </div>
  );
}

function LoginRequired({ toggleModal }) {
  return (
    <div className="min-h-[55vh] w-full flex flex-col items-center justify-center gap-4 text-center px-4 py-16">
      <div className="w-16 h-16 rounded-full bg-amber-100/50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 flex items-center justify-center text-3xl shadow-inner border border-amber-900/5 dark:border-amber-100/5">🔒</div>
      <h1 className="text-[20px] font-bold text-amber-950 dark:text-amber-50 font-serif">Vui lòng đăng nhập để xem</h1>
      <p className="text-[14px] text-stone-500 dark:text-stone-400 max-w-sm leading-relaxed">
        Bạn cần đăng nhập tài khoản để xem thông tin cá nhân và kết quả học tập.
      </p>
      <motion.button
        {...pressable()}
        onClick={toggleModal}
        className="px-6 py-3 mt-2 rounded-full bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white text-[14px] font-bold md:hover:opacity-90 transition-colors shadow-sm"
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
    if (!oldPassword || !newPassword || !confirmPassword) return showToast("Vui lòng nhập đầy đủ thông tin", "warning");
    if (newPassword.length < 8) return showToast("Mật khẩu mới phải ≥ 8 ký tự", "warning");
    if (newPassword !== confirmPassword) return showToast("Mật khẩu mới không khớp", "warning");
    if (newPassword.includes(" ")) return showToast("Mật khẩu không được chứa dấu cách", "warning");

    setSaveLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: reAuthError } = await supabase.auth.signInWithPassword({ email: user?.email, password: oldPassword });
      if (reAuthError) { showToast("Mật khẩu hiện tại không đúng", "error"); return; }
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) { showToast(updateError.message || "Đổi mật khẩu thất bại", "error"); return; }
      showToast("Đổi mật khẩu thành công", "success");
      close();
    } catch (err) {
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

  const inputCls = "w-full rounded-xl border border-amber-900/10 dark:border-amber-100/10 bg-white dark:bg-stone-800/50 px-4 py-3 pr-12 text-[14px] font-medium text-amber-950 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-900/20 dark:focus:ring-amber-500/30 transition disabled:opacity-60";

  return createPortal(
    <Backdrop handleClose={saveLoading ? undefined : close}>
      <motion.div {...modalVariant()} className="w-full max-w-md mx-4 rounded-3xl bg-[#FDFBF7] dark:bg-[#1C1917] p-6 shadow-2xl border border-amber-900/10 dark:border-amber-100/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100/50 dark:bg-amber-500/20 flex items-center justify-center text-amber-800 dark:text-amber-400 border border-amber-900/5 dark:border-amber-100/5">🔒</div>
            <h2 className="text-[18px] font-bold text-amber-950 dark:text-amber-50 font-serif">Đổi mật khẩu</h2>
          </div>
          <button type="button" onClick={close} disabled={saveLoading} aria-label="Đóng" className="w-8 h-8 rounded-full bg-amber-900/5 hover:bg-amber-900/10 dark:bg-amber-100/5 dark:hover:bg-amber-100/10 text-stone-500 flex items-center justify-center transition-colors active:scale-90 disabled:opacity-40">✕</button>
        </div>

        <div className="flex flex-col gap-4">
          {fields.map((f) => (
            <div key={f.id}>
              <label htmlFor={f.id} className="text-[12px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1 mb-1.5 inline-block">{f.label}</label>
              <div className="relative">
                <input id={f.id} type={f.show ? "text" : "password"} placeholder={f.placeholder} value={f.value} onChange={(e) => f.set(e.target.value)} autoFocus={f.autoFocus} disabled={saveLoading} className={inputCls} />
                <button type="button" onClick={() => f.setShow((v) => !v)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-800 dark:hover:text-amber-400 text-[12px] font-bold">
                  {f.show ? "Ẩn" : "Hiện"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-7 flex gap-3">
          <motion.button {...(saveLoading ? {} : pressable())} disabled={saveLoading} onClick={close} className="flex-1 py-3 rounded-xl bg-amber-900/5 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[14px] font-bold hover:bg-amber-900/10 dark:hover:bg-stone-700 transition-colors disabled:opacity-40">Hủy</motion.button>
          <motion.button {...(saveLoading ? {} : pressable())} disabled={saveLoading} onClick={submit} className="flex-1 py-3 rounded-xl bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white text-[14px] font-bold md:hover:opacity-90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm">
            {saveLoading && <Spinner />} {saveLoading ? "Đang lưu…" : "Lưu thay đổi"}
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
      const { error } = await supabase.from("users").update(payload).eq("username", username);
      if (error) { showToast("Lưu dữ liệu thất bại", "error"); return; }
      safeStore("user", JSON.stringify(user));
      setIsAnyChange(false);
      showToast("Lưu dữ liệu thành công", "success");
      close();
    } catch (err) {
      showToast("Lỗi kết nối server", "error");
    } finally {
      setIsSaveData(false);
    }
  };

  return createPortal(
    <Backdrop handleClose={isSaveData ? undefined : close}>
      <motion.div {...modalVariant()} className="bg-[#FDFBF7] dark:bg-[#1C1917] w-full max-w-sm mx-4 rounded-3xl p-6 shadow-2xl border border-amber-900/10 dark:border-amber-100/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-amber-100/50 dark:bg-amber-500/20 flex items-center justify-center text-2xl border border-amber-900/5 dark:border-amber-100/5">💾</div>
        </div>
        <h3 className="text-[18px] font-bold text-amber-950 dark:text-amber-50 mb-2 text-center font-serif">{isSaveData ? "Đang xử lý…" : "Lưu thông tin?"}</h3>
        {!isSaveData && <p className="text-[14px] text-stone-500 dark:text-stone-400 mb-6 text-center leading-relaxed">Thông tin bạn vừa chỉnh sửa sẽ được cập nhật vào hệ thống.</p>}
        {isSaveData && <div className="flex items-center justify-center gap-2.5 text-amber-700 dark:text-amber-400 mb-6"><Spinner className="h-5 w-5" /><span className="text-[14px] font-bold">Đang lưu dữ liệu...</span></div>}
        <div className="flex gap-3">
          <motion.button {...(isSaveData ? {} : pressable())} disabled={isSaveData} onClick={close} className="flex-1 py-3 rounded-xl bg-amber-900/5 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[14px] font-bold hover:bg-amber-900/10 dark:hover:bg-stone-700 transition-colors disabled:opacity-40">Hủy</motion.button>
          <motion.button {...(isSaveData ? {} : pressable())} disabled={isSaveData} onClick={confirmSave} className="flex-1 py-3 rounded-xl bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white text-[14px] font-bold md:hover:opacity-90 transition-colors disabled:opacity-70 shadow-sm">Lưu</motion.button>
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
  const handleKeyDown = (e) => { if (e.key === "Escape") { e.preventDefault(); onCancel?.(); } else if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); } };

  return (
    <div className="flex items-center justify-between bg-white/60 dark:bg-stone-800/40 backdrop-blur-sm border border-amber-900/10 dark:border-amber-100/10 rounded-2xl px-4 py-3.5 shadow-sm">
      <div className="flex items-center gap-3.5 min-w-0">
        <span className="text-xl flex-shrink-0 opacity-90">{icon}</span>
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-0.5">{label}</div>
          {!isEditing && <div className="text-[15px] font-bold text-amber-950 dark:text-amber-50 truncate">{displayValue ?? value ?? "—"}</div>}
          {isEditing && options && (
            <select value={tempValue} onChange={(e) => setTempValue(e.target.value)} onBlur={onBlur} onKeyDown={handleKeyDown} autoFocus className="mt-0.5 px-2.5 py-1.5 rounded-lg border border-amber-900/20 dark:border-amber-100/20 text-[14px] font-bold bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-900/30 dark:focus:ring-amber-500/30 text-amber-950 dark:text-amber-50">
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
          {isEditing && !options && (
            <input type={type} value={tempValue} onChange={(e) => setTempValue(e.target.value)} onBlur={onBlur} onKeyDown={handleKeyDown} autoFocus max={type === "date" ? new Date().toISOString().slice(0, 10) : undefined} className="mt-0.5 px-2.5 py-1.5 rounded-lg border border-amber-900/20 dark:border-amber-100/20 text-[14px] font-bold bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-900/30 dark:focus:ring-amber-500/30 w-full text-amber-950 dark:text-amber-50" />
          )}
        </div>
      </div>
      {!isEditing && (
        <motion.button {...pressable(1.15)} onClick={onEdit} className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-900/5 hover:bg-amber-900/10 dark:bg-amber-100/5 dark:hover:bg-amber-100/10 flex items-center justify-center text-[13px] transition-colors text-amber-800 dark:text-amber-400">✏️</motion.button>
      )}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-pulse" aria-busy="true" aria-label="Đang tải hồ sơ">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3.5 bg-white/60 dark:bg-stone-800/40 rounded-2xl border border-amber-900/10 dark:border-amber-100/10 px-4 py-3.5 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-stone-200/60 dark:bg-stone-700/60 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="h-2 w-16 rounded bg-stone-200/60 dark:bg-stone-700/60 mb-2.5" />
            <div className="h-3.5 w-28 rounded bg-stone-200/60 dark:bg-stone-700/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
//  PROFILE TAB
// ============================================================

const DATE_FIELDS = ["ngaySinh", "ngayRuaToi", "ngayRuocLe", "ngayThemSuc"];

export function Profile({ handleLogout, user, setUser, setIsAnyChange }) {
  const { showToast } = useToast();
  const [editingField, setEditingField] = useState(null);
  const [tempValue,    setTempValue]    = useState("");
  const [isSaveBoxOn,  setIsSaveBoxOn]  = useState(false);
  const [isOpenChangePass, setIsOpenChangePass] = useState(false);

  const editField = (field) => (e) => { e.preventDefault(); setEditingField(field); setTempValue(user[field] ?? ""); };
  const cancelEdit = () => { setEditingField(null); setTempValue(""); };

  const handleBlur = (field) => {
    if (field === "sdt" && !isValidVNPhone(tempValue)) { showToast("Số điện thoại chưa đúng định dạng", "warning"); cancelEdit(); return; }
    if (DATE_FIELDS.includes(field) && !isPastOrToday(tempValue)) { showToast("Ngày không được ở trong tương lai", "warning"); cancelEdit(); return; }
    if (tempValue !== user[field]) setIsAnyChange(true);
    setUser((prev) => {
      const next = { ...prev, [field]: tempValue };
      if (field === "gioiTinh" && isDefaultAvatarUrl(prev.avatar)) next.avatar = getDefaultAvatarByGender(tempValue);
      return next;
    });
    setEditingField(null); setTempValue("");
  };

  const isStaff = user.role === "admin" || user.role === "teacher";

  const rows = [
    { icon: GENDER_ICON[user.gioiTinh] ?? "👤", label: "Họ và tên", field: "hoTen" },
    { icon: "✝️", label: "Tên Thánh", field: "tenThanh" },
    { icon: "🎂", label: "Ngày sinh", field: "ngaySinh", type: "date", displayValue: transferDateForView(user.ngaySinh) },
    ...(!isStaff ? [
      { icon: "💦", label: "Ngày Rửa Tội", field: "ngayRuaToi", type: "date", displayValue: transferDateForView(user.ngayRuaToi) },
      { icon: "🫓", label: "Ngày Rước Lễ", field: "ngayRuocLe", type: "date", displayValue: transferDateForView(user.ngayRuocLe) },
      { icon: "🕊️", label: "Ngày Thêm Sức", field: "ngayThemSuc",type: "date", displayValue: transferDateForView(user.ngayThemSuc) },
      { icon: "👨🏻", label: "Họ & Tên Cha", field: "tenCha" },
      { icon: "👩🏻", label: "Họ & Tên Mẹ", field: "tenMe" },
    ] : []),
    { icon: "📞", label: "Số điện thoại", field: "sdt" },
    { icon: "🏠", label: "Giáo Xóm", field: "giaoXom" },
    { icon: "⚧️", label: "Giới tính", field: "gioiTinh", options: ["Nam", "Nữ"] },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {rows.map((r) => (
        <FieldRow key={r.field} icon={r.icon} label={r.label} field={r.field} value={user[r.field]} displayValue={r.displayValue} type={r.type} options={r.options} editingField={editingField} tempValue={tempValue} setTempValue={setTempValue} onEdit={editField(r.field)} onBlur={() => handleBlur(r.field)} onCancel={cancelEdit} />
      ))}

      {/* Đổi mật khẩu */}
      <div className="flex items-center justify-between bg-white/60 dark:bg-stone-800/40 backdrop-blur-sm border border-amber-900/10 dark:border-amber-100/10 rounded-2xl px-4 py-3.5 shadow-sm">
        <div className="flex items-center gap-3.5 min-w-0">
          <span className="text-xl flex-shrink-0 opacity-90">🔒</span>
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-0.5">Mật khẩu</div>
            <div className="text-[15px] font-bold text-amber-950 dark:text-amber-50 truncate">••••••••</div>
          </div>
        </div>
        <motion.button {...pressable()} onClick={() => setIsOpenChangePass(true)} className="flex-shrink-0 text-[12px] font-bold px-3.5 py-2 rounded-xl bg-amber-900/5 hover:bg-amber-900/10 dark:bg-amber-100/5 dark:hover:bg-amber-100/10 text-amber-800 dark:text-amber-400 transition-colors">
          Thay đổi
        </motion.button>
      </div>

      {/* Đăng xuất */}
      <div className="flex items-center justify-between bg-white/60 dark:bg-stone-800/40 backdrop-blur-sm border border-red-200/50 dark:border-red-900/30 rounded-2xl px-4 py-3.5 shadow-sm">
        <div className="flex items-center gap-3.5 min-w-0">
          <span className="text-xl flex-shrink-0 opacity-90">🚪</span>
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-0.5">Phiên đăng nhập</div>
            <div className="text-[15px] font-bold text-red-600 dark:text-red-400 truncate">Đang hoạt động</div>
          </div>
        </div>
        <motion.button {...pressable()} onClick={handleLogout} className="flex-shrink-0 text-[12px] font-bold px-3.5 py-2 rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
          Đăng xuất
        </motion.button>
      </div>

      <div className="md:col-span-2 flex justify-end mt-4">
        <motion.button {...pressable()} onClick={() => setIsSaveBoxOn(true)} className="px-8 py-3.5 rounded-full bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white text-[14px] font-bold md:hover:opacity-90 transition-colors shadow-sm flex items-center gap-2">
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

async function fetchAchievementData(username, namHoc, hocKyInt) {
  const [gradesRes, termRes, attendanceRes, enrollmentRes, yearRes] = await Promise.all([
    hocKyInt ? supabase.from("grades").select("diem_mieng, diem_vo, diem_15_phut, diem_1_tiet, diem_thi, diem_tb").eq("username", username).eq("nam_hoc", namHoc).eq("hoc_ky", hocKyInt).maybeSingle() : Promise.resolve({ data: null, error: null }),
    hocKyInt ? supabase.from("term_summary").select("hoc_luc, hanh_kiem, vi_thu, tong_buoi, ngay_bat_dau, lop, nam_hoc").eq("username", username).eq("nam_hoc", namHoc).eq("hoc_ky", hocKyInt).maybeSingle() : Promise.resolve({ data: null, error: null }),
    hocKyInt ? supabase.from("attendance").select("ngay, trang_thai").eq("username", username).eq("nam_hoc", namHoc).eq("hoc_ky", hocKyInt).order("ngay", { ascending: true }) : Promise.resolve({ data: [], error: null }),
    supabase.from("enrollments").select("lop, nam_hoc").eq("username", username).eq("nam_hoc", namHoc).maybeSingle(),
    supabase.from("year_summary").select("diem_tb, hoc_luc, hanh_kiem, vi_thu, ghi_chu, lop, nam_hoc").eq("username", username).eq("nam_hoc", namHoc).maybeSingle(),
  ]);
  [gradesRes, termRes, attendanceRes, enrollmentRes, yearRes].forEach((r, i) => { if (r.error) console.error(`fetchAchievementData[${i}] error:`, r.error); });
  return { grades: gradesRes.data ?? null, term: termRes.data ?? null, attendance: attendanceRes.data ?? [], enrollment: enrollmentRes.data ?? null, yearSummary: yearRes.data ?? null };
}

export function Achievement({ user, cache, setCache }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const hockyParam = searchParams.get("hocky");
  const initialSemester = VALID_SEMESTERS.includes(hockyParam) ? hockyParam : getCurrentSemester();

  const [semester, setSemesterState] = useState(initialSemester);
  const [namHoc]   = useState(getCurrentNamHoc);
  const [loading,  setLoading]  = useState(false);

  const setSemester = (value) => {
    setSemesterState(value);
    setSearchParams((prev) => { const next = new URLSearchParams(prev); next.set("hocky", value); return next; }, { replace: true });
  };

  const isYearView = semester === "NAM";
  const hocKyInt   = HK_INT_MAP[semester] ?? null;
  const cacheKey = `${user?.username}-${namHoc}-${semester}`;
  const data = cache[cacheKey] ?? null;

  useEffect(() => {
    const username = user?.username;
    if (!username) return;
    if (cache[cacheKey]) return;
    let cancelled = false; setLoading(true);
    fetchAchievementData(username, namHoc, hocKyInt)
      .then((result) => { if (cancelled) return; setCache((prev) => ({ ...prev, [cacheKey]: result })); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.username, semester, namHoc, cacheKey, hocKyInt]);

  const grades      = data?.grades      ?? {};
  const term        = data?.term        ?? {};
  const enrollment  = data?.enrollment  ?? {};
  const yearSummary = data?.yearSummary ?? null;

  const lop        = term.lop || enrollment.lop || yearSummary?.lop || "—";
  const displayNamHoc = term.nam_hoc || enrollment.nam_hoc || yearSummary?.nam_hoc || namHoc;
  const summarySource = isYearView ? (yearSummary ?? {}) : term;
  const isFinal = summarySource.hoc_luc && summarySource.hoc_luc !== "-" && summarySource.hanh_kiem && summarySource.hanh_kiem !== "-";

  const attendanceList = useMemo(() => {
    const startRaw  = term.ngay_bat_dau;
    const tongBuoi  = term.tong_buoi;
    if (!startRaw || !tongBuoi) return [];
    const exceptionMap = new Map((data?.attendance ?? []).map(({ ngay, trang_thai }) => [ngay, trang_thai]));
    const startDate = new Date(startRaw);
    const result = [];
    for (let i = 0; i < tongBuoi; i++) {
      const sunday = new Date(startDate); sunday.setDate(startDate.getDate() + i * 7);
      const isoDate = sunday.toISOString().slice(0, 10);
      result.push({ date: sunday, isoDate, trang_thai: exceptionMap.get(isoDate) ?? "co_mat" });
    }
    return result;
  }, [term.ngay_bat_dau, term.tong_buoi, data?.attendance]);

  const attendanceCounts = useMemo(() => {
    const counts = { nghi_khong_phep: 0, nghi_phep: 0 };
    attendanceList.forEach(({ trang_thai }) => { if (trang_thai === "nghi_khong_phep") counts.nghi_khong_phep++; if (trang_thai === "nghi_phep") counts.nghi_phep++; });
    counts.tong_nghi = counts.nghi_khong_phep + counts.nghi_phep;
    return counts;
  }, [attendanceList]);

  const hocLucText   = useMemo(() => pickRandom(GL_HOCLUC_COMMENTS[summarySource.hoc_luc]   || [""]), [summarySource.hoc_luc]);
  const hanhKiemText = useMemo(() => pickRandom(GL_HANHKIEM_COMMENTS[summarySource.hanh_kiem] || [""]), [summarySource.hanh_kiem]);

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white/80 dark:bg-stone-800/40 backdrop-blur-sm rounded-2xl border border-amber-900/10 dark:border-amber-100/10 shadow-sm p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[18px] font-bold text-amber-950 dark:text-amber-50 truncate">{user?.tenThanh} {user?.hoTen || "—"}</h1>
          <p className="text-[13px] font-bold text-amber-800/70 dark:text-amber-400/70 mt-0.5 tracking-wider">
            {lop} · {displayNamHoc}
          </p>
        </div>
        <select value={semester} onChange={(e) => setSemester(e.target.value)} className="flex-shrink-0 border border-amber-900/20 dark:border-amber-100/20 rounded-xl px-3 py-2 text-[13px] font-bold bg-white dark:bg-stone-900 text-amber-950 dark:text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-900/30">
          <option value="HK1">Học kỳ I</option>
          <option value="HK2">Học kỳ II</option>
          <option value="NAM">Cả năm</option>
        </select>
      </div>

      {loading && <AchievementSkeleton />}

      {!loading && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {isYearView ? (
              <>
                <StatCard label="Điểm TB năm"   value={yearSummary?.diem_tb}    colorClass="text-amber-600 dark:text-amber-400" />
                <StatCard label="Học lực năm"   value={yearSummary?.hoc_luc}    colorClass={RANK_COLORS.hoc_luc[yearSummary?.hoc_luc]     || "text-stone-800 dark:text-stone-200"} />
                <StatCard label="Hạnh kiểm năm" value={yearSummary?.hanh_kiem}  colorClass={RANK_COLORS.hanh_kiem[yearSummary?.hanh_kiem] || "text-stone-800 dark:text-stone-200"} />
                <StatCard label="Vị thứ năm"    value={yearSummary?.vi_thu}     colorClass="text-amber-600 dark:text-amber-400" />
              </>
            ) : (
              <>
                <StatCard label="Điểm TB"   value={grades.diem_tb}    colorClass="text-amber-600 dark:text-amber-400" />
                <StatCard label="Học lực"   value={term.hoc_luc}      colorClass={RANK_COLORS.hoc_luc[term.hoc_luc]     || "text-stone-800 dark:text-stone-200"} />
                <StatCard label="Hạnh kiểm" value={term.hanh_kiem}    colorClass={RANK_COLORS.hanh_kiem[term.hanh_kiem] || "text-stone-800 dark:text-stone-200"} />
                <StatCard label="Vị thứ"    value={term.vi_thu}       colorClass="text-amber-600 dark:text-amber-400" />
              </>
            )}
          </div>

          <div className={`rounded-2xl px-5 py-4 text-[13px] font-bold border shadow-sm backdrop-blur-sm ${isFinal ? "bg-emerald-50/80 text-emerald-700 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" : "bg-amber-50/80 text-amber-700 border-amber-200/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"}`}>
            {isFinal ? "ℹ️ Thông tin đã cập nhật đầy đủ!" : isYearView ? "⚠️ Kết quả tổng kết cả năm đang được cập nhật thêm" : "⚠️ Thông tin điểm thi và điểm danh đang được cập nhật thêm"}
          </div>

          {isYearView && yearSummary?.ghi_chu && (
            <div className="bg-white/80 dark:bg-stone-800/40 backdrop-blur-sm rounded-2xl border border-amber-900/10 dark:border-amber-100/10 shadow-sm p-5">
              <p className="text-[13px] font-bold text-amber-950 dark:text-amber-50 mb-1.5 uppercase tracking-wider">Ghi chú</p>
              <p className="text-[14px] font-medium text-stone-600 dark:text-stone-400 leading-relaxed">{yearSummary.ghi_chu}</p>
            </div>
          )}

          {!isYearView && (
          <div className="bg-white/80 dark:bg-stone-800/40 backdrop-blur-sm rounded-2xl border border-amber-900/10 dark:border-amber-100/10 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-bold text-amber-950 dark:text-amber-50 uppercase tracking-wider">Điểm danh <span className="text-stone-400 font-semibold tracking-normal normal-case ml-1">({term.tong_buoi ?? "—"} tuần)</span></h2>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mb-5 text-[12px] font-bold text-stone-500 dark:text-stone-400">
              {Object.entries(ATTENDANCE_STATUS).filter(([k]) => k !== "null").map(([k, v]) => (
                <span key={k} className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded-full shadow-inner ${v.color}`} />{v.label}</span>
              ))}
            </div>
            {attendanceList.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-thin">
                {attendanceList.map(({ date, isoDate, trang_thai }) => {
                  const status = ATTENDANCE_STATUS[trang_thai] ?? ATTENDANCE_STATUS["null"];
                  return (
                    <div key={isoDate} className="flex flex-col items-center gap-2 flex-shrink-0 w-12">
                      <span className={`w-9 h-9 rounded-full shadow-inner ${status.color}`} title={status.label} />
                      <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 whitespace-nowrap">{date.getDate()}/{date.getMonth() + 1}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-stone-300 dark:text-stone-600">
                <span className="text-4xl opacity-50">🗓️</span>
                <p className="text-[13px] font-semibold text-stone-400 dark:text-stone-500">Chưa có dữ liệu điểm danh</p>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-amber-900/10 dark:border-amber-100/10 flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-bold">
              <span className="text-stone-500">K/phép: <strong className="text-red-500">{attendanceCounts.nghi_khong_phep ?? "—"}</strong></span>
              <span className="text-stone-500">Có phép: <strong className="text-amber-500">{attendanceCounts.nghi_phep ?? "—"}</strong></span>
              <span className="text-stone-500">Tổng nghỉ: <strong className="text-red-500">{attendanceCounts.tong_nghi ?? "—"}</strong></span>
            </div>
          </div>
          )}

          {!isYearView && (
          <div className="bg-white/80 dark:bg-stone-800/40 backdrop-blur-sm rounded-2xl border border-amber-900/10 dark:border-amber-100/10 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-bold text-amber-950 dark:text-amber-50 uppercase tracking-wider">Bảng điểm</h2>
              <span className="bg-amber-100/50 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 text-[12px] font-bold px-3 py-1 rounded-full shadow-sm">TBM {grades.diem_tb || "—"}</span>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              <ScoreCell label="Miệng" value={grades.diem_mieng}   />
              <ScoreCell label="Vở"    value={grades.diem_vo}      />
              <ScoreCell label="15'"   value={grades.diem_15_phut} />
              <ScoreCell label="1 Tiết"value={grades.diem_1_tiet}  />
              <ScoreCell label="Thi"   value={grades.diem_thi}     />
            </div>
          </div>
          )}

          {isFinal && (
            <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl p-5 border border-amber-200/50 dark:border-amber-800/30 backdrop-blur-sm">
              <p className="text-[12px] font-bold text-amber-800/70 dark:text-amber-400/70 mb-2 uppercase tracking-wider">Nhận xét của Giáo lý viên</p>
              <p className="text-[14px] font-medium text-stone-700 dark:text-stone-300 leading-relaxed italic border-l-4 border-amber-400/50 pl-3">
                {hocLucText} {hanhKiemText} Xin Chúa chúc lành và đồng hành cùng em trên hành trình đức tin!
              </p>
            </div>
          )}

          <div className="bg-white/80 dark:bg-stone-800/40 rounded-[2rem] shadow-sm border border-amber-900/10 dark:border-amber-100/10 p-8 text-center backdrop-blur-sm">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-100/50 dark:bg-amber-500/20 flex items-center justify-center text-xl mb-4 shadow-sm border border-amber-900/5 dark:border-amber-100/5">🌸</div>
            <p className="text-[17px] font-bold text-amber-950 dark:text-amber-50 leading-relaxed italic font-serif">"Mọi việc anh em làm,<br />hãy làm trong tình yêu thương."</p>
            <p className="mt-2.5 text-[12px] font-bold text-amber-800/60 dark:text-amber-400/60 uppercase tracking-widest">(1 Cr 16,14)</p>
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
      canvas.toBlob((testBlob) => {
        if (testBlob && testBlob.type === "image/webp") encodeWith("image/webp", "webp");
        else                                             encodeWith("image/jpeg", "jpeg");
      }, "image/webp", 0.7);
    };
    reader.readAsDataURL(file);
  });
}

// ============================================================
//  TÀI KHOẢN PAGE (root)
// ============================================================

const TAI_KHOAN_BASE       = "/tài-khoản";
const TAB_PROFILE_PATH     = "hồ-sơ";
const TAB_ACHIEVEMENT_PATH = "thành-tích";
const TAB_PROFILE_URL      = `${TAI_KHOAN_BASE}/${TAB_PROFILE_PATH}`;
const TAB_ACHIEVEMENT_URL  = `${TAI_KHOAN_BASE}/${TAB_ACHIEVEMENT_PATH}`;

export default function TaiKhoanLayout() {
  const { isLogin, setIsLogin, toggleModal } = useOutletContext();
  const navigate = useNavigate();
  const isAchievementActive = !!useMatch(TAB_ACHIEVEMENT_URL);
  const { showToast } = useToast();
  const fileRef        = useRef(null);
  const [loadingAva,   setLoadingAva]   = useState(false);
  const [avatarUrl,    setAvatarUrl]    = useState("");
  const [user,         setUser]         = useState(() => safeParse("user", {}));
  const [isAnyChange,  setIsAnyChange]  = useState(false);
  const [achievementCache, setAchievementCache] = useState({});
  const [profileLoaded, setProfileLoaded] = useState(() => Object.keys(safeParse("user", {}) || {}).length > 0);

  const isStaff = user.role === "admin" || user.role === "teacher";
  const selectAvatar = () => fileRef.current?.click();

  useEffect(() => {
    if (!isAnyChange) return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isAnyChange]);

  const avatarUploadCancelRef = useRef(() => {});
  useEffect(() => { return () => { avatarUploadCancelRef.current(); }; }, []);

  const uploadAvatar = async (resizedBlob, username, ext) => {
    const filePath = `avatars/${username}.${ext}`;
    const staleExts = ["webp", "jpeg", "jpg", "avif"].filter((e) => e !== ext);
    await supabase.storage.from("user-assets").remove(staleExts.map((e) => `avatars/${username}.${e}`)).catch(() => {});
    const { error: uploadError } = await supabase.storage.from("user-assets").upload(filePath, resizedBlob, { upsert: true, contentType: resizedBlob.type });
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage.from("user-assets").getPublicUrl(filePath);
    const publicUrl = urlData?.publicUrl;
    if (!publicUrl) throw new Error("Không lấy được public URL");
    const bustedUrl = `${publicUrl}?v=${Date.now()}`;
    const { error: updateError } = await supabase.from("users").update({ avatar: bustedUrl }).eq("username", username);
    if (updateError) throw updateError;
    return bustedUrl;
  };

  const MAX_AVATAR_FILE_SIZE = 8 * 1024 * 1024;
  const handleAvatar = async (e) => {
    const inputEl = e.target;
    const file    = inputEl.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("Chỉ chọn ảnh", "warning"); inputEl.value = ""; return; }
    if (file.size > MAX_AVATAR_FILE_SIZE) { showToast("Ảnh quá lớn (tối đa 8MB)", "warning"); inputEl.value = ""; return; }

    let cancelled = false;
    avatarUploadCancelRef.current = () => { cancelled = true; };
    const previousAvatarUrl  = avatarUrl;
    const previousUserAvatar = user.avatar;

    setLoadingAva(true);
    try {
      const { blob: resizedBlob, ext } = await resizeImage(file);
      if (cancelled) return;
      const previewUrl = URL.createObjectURL(resizedBlob);
      setAvatarUrl(previewUrl); 
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
      if (!cancelled) { setAvatarUrl(previousAvatarUrl); setUser((prev) => ({ ...prev, avatar: previousUserAvatar })); showToast(err.message || "Không thể upload avatar", "error"); }
    } finally {
      if (!cancelled) setLoadingAva(false);
      inputEl.value = ""; 
    }
  };

  const loadUser = async () => {
    try {
      const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !authUser) return;
      const { data, error } = await supabase.from("users").select("*").eq("auth_id", authUser.id).single();
      if (error) { showToast("Không tải được thông tin tài khoản, thử lại sau", "error"); return; }
      const normalized = normalizeStudent(data);
      setUser(normalized);
      safeStore("user",   JSON.stringify(normalized));
      safeStore("avatar", normalized.avatar);
      safeStore("role",   normalized.role);
    } catch (err) {
      showToast("Lỗi kết nối, không tải được tài khoản", "error");
    } finally {
      setProfileLoaded(true);
    }
  };

  useEffect(() => {
    if (!isLogin) return;
    const savedData = safeParse("user", null);
    if (savedData) setUser(savedData);
    loadUser();
  }, [isLogin]);

  useEffect(() => { return () => { if (avatarUrl) URL.revokeObjectURL(avatarUrl); }; }, [avatarUrl]);

  const handleLogout = async () => {
    try { await supabase.auth.signOut(); } catch (err) {}
    ["username", "user", "avatar", "sessionKey", "role", "studentData"].forEach((k) => localStorage.removeItem(k));
    setUser({}); setIsAnyChange(false); setIsLogin(false);
    showToast("Đã đăng xuất", "success");
    navigate("/");
  };

  if (!isLogin) return <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917]"><LoginRequired toggleModal={toggleModal} /></div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917] text-stone-800 dark:text-stone-200 transition-colors duration-500">
      <div id="tai-khoan-page" className="w-full max-w-4xl mx-auto px-4 md:px-6 py-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[26px] font-extrabold text-amber-950 dark:text-amber-50 font-serif tracking-tight">Tài khoản của tôi</h1>
          </div>
          <NavLink to="/" className="text-[13px] font-bold text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 transition-colors bg-amber-100/50 dark:bg-amber-900/30 px-4 py-2 rounded-full shadow-sm">
            Về trang chủ
          </NavLink>
        </div>

        <div className="bg-white/60 dark:bg-stone-900/40 backdrop-blur-xl rounded-[2rem] shadow-sm border border-amber-900/10 dark:border-amber-100/10 px-4 md:px-8 py-8">
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="relative">
              <div className={`relative w-28 h-28 rounded-full overflow-hidden ring-[6px] ring-[#FDFBF7] dark:ring-[#1C1917] shadow-md border border-amber-900/10 dark:border-amber-100/10 ${loadingAva ? "opacity-70" : ""}`}>
                <img src={avatarUrl || user.avatar} alt={user.hoTen || "Avatar"} className="w-full h-full object-cover bg-amber-50 dark:bg-stone-800" onError={(e) => { if (e.currentTarget.dataset.fallbackApplied) return; e.currentTarget.dataset.fallbackApplied = "1"; e.currentTarget.src = getDefaultAvatarByGender(user.gioiTinh); }} />
                {loadingAva && <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40"><div className="w-8 h-8 border-[3px] border-amber-400 border-t-transparent rounded-full animate-spin" /></div>}
              </div>
              <button type="button" onClick={selectAvatar} disabled={loadingAva} aria-label="Đổi ảnh đại diện" className={`absolute bottom-1 right-1 w-9 h-9 rounded-full shadow-lg flex items-center justify-center text-[15px] border-2 border-[#FDFBF7] dark:border-[#1C1917] transition-all ${loadingAva ? "bg-stone-300 cursor-not-allowed" : "bg-amber-900 hover:bg-amber-950 dark:bg-amber-600 dark:hover:bg-amber-500 text-white"}`}>✏️</button>
              <input type="file" ref={fileRef} accept="image/*" hidden onChange={handleAvatar} />
            </div>

            {!isStaff && (
              <div className="relative w-full max-w-sm h-12 rounded-[1rem] bg-stone-200/60 dark:bg-stone-800/80 p-1 flex select-none shadow-inner border border-black/5 dark:border-white/5">
                <TabIndicator activeTab={isAchievementActive ? "thanh-tich" : "ho-so"} />
                <div className="relative z-10 grid grid-cols-2 w-full text-[14px] font-bold">
                  <NavLink to={TAB_PROFILE_URL} end className={({ isActive }) => `flex items-center justify-center rounded-[14px] transition-colors ${isActive ? "text-amber-950 dark:text-amber-950" : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"}`}>Hồ sơ</NavLink>
                  <NavLink to={TAB_ACHIEVEMENT_URL} className={({ isActive }) => `flex items-center justify-center rounded-[14px] transition-colors ${isActive ? "text-amber-950 dark:text-amber-950" : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"}`}>Thành tích</NavLink>
                </div>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            <Routes>
              <Route index element={<Navigate to={TAB_PROFILE_URL} replace />} />
              <Route path={TAB_PROFILE_PATH} element={<motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>{profileLoaded ? <Profile user={user} handleLogout={handleLogout} setUser={setUser} setIsAnyChange={setIsAnyChange} /> : <ProfileSkeleton />}</motion.div>} />
              <Route path={TAB_ACHIEVEMENT_PATH} element={isStaff ? (<Navigate to={TAB_PROFILE_URL} replace />) : (<motion.div key="achievement" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}><Achievement user={user} cache={achievementCache} setCache={setAchievementCache} /></motion.div>)} />
              <Route path="*" element={<Navigate to={TAB_PROFILE_URL} replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function TabIndicator({ activeTab }) {
  return (
    <motion.span
      className="absolute top-1 left-1 h-10 w-[calc(50%-4px)] rounded-[14px] bg-white dark:bg-amber-400 shadow-sm border border-black/5 dark:border-white/10"
      animate={{ x: activeTab === "thanh-tich" ? "100%" : "0%" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    />
  );
}