import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLenis } from "lenis/react";
import { Search, Users, Plus, Trash2, ChevronLeft, ChevronDown, Lock, LockOpen, School, Settings, X, UserPlus, Phone, User } from "lucide-react";
import { Spinner, ConfirmDialog } from "../ui/StudentShared.jsx";
import { useAdminContext } from "./AdminContext.jsx";
import { AVATAR_FALLBACK, handleAvatarError } from "./constants.js";
import { SplitListSkeleton, TableSkeleton } from "../ui/Skeleton.jsx";
import {
  fetchClassRoster, fetchStudents, assignStudentToClass, removeStudentFromClass,
  assignTeacherToClass, unassignTeacher, lockTerm, unlockTerm, fetchAllTeachers, fetchClassTeacherRows
} from "./dataLayer.js";

function ClassRosterPanel({ lop, namHoc, onBack, showToast }) {
  const [roster,       setRoster]       = useState([]);
  const [allStudents,  setAllStudents]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [busyUsername, setBusyUsername] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rosterList, students] = await Promise.all([
        fetchClassRoster(lop, namHoc),
        fetchStudents(),
      ]);
      setRoster(rosterList);
      setAllStudents(students);
    } catch (err) {
      console.error("load roster error:", err);
      showToast("Không tải được danh sách lớp", "error");
    } finally {
      setLoading(false);
    }
  }, [lop, namHoc, showToast]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const rosterUsernames = useMemo(() => new Set(roster.map((s) => s.username)), [roster]);

  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allStudents
      .filter((s) => !rosterUsernames.has(s.username))
      .filter((s) => !q || (s.hoTen || "").toLowerCase().includes(q) || s.username.toLowerCase().includes(q));
  }, [allStudents, rosterUsernames, search]);

  const handleAdd = async (username) => {
    setBusyUsername(username);
    try {
      await assignStudentToClass(username, lop, namHoc);
      showToast("Đã xếp vào lớp", "success");
      setRoster(await fetchClassRoster(lop, namHoc));
    } catch (err) {
      console.error("assign student error:", err);
      showToast("Thêm học sinh thất bại", "error");
    } finally {
      setBusyUsername(null);
    }
  };

  const handleRemove = async (username) => {
    setBusyUsername(username);
    try {
      await removeStudentFromClass(username, namHoc);
      showToast("Đã rút học sinh khỏi lớp", "success");
      setRoster(await fetchClassRoster(lop, namHoc));
    } catch (err) {
      console.error("remove student error:", err);
      showToast("Thao tác thất bại", "error");
    } finally {
      setBusyUsername(null);
    }
  };

  return (
    <div className="bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm overflow-hidden transition-colors">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-amber-900/10 dark:border-amber-100/10 bg-amber-900/5 dark:bg-amber-100/5 sticky top-0 z-10">
        <button type="button" onClick={onBack}
          className="inline-flex items-center gap-1 text-[13px] font-bold text-amber-800/70 dark:text-amber-400/70 hover:text-amber-950 dark:hover:text-amber-50 active:scale-95 transition-all flex-shrink-0 -ml-1.5 px-2 py-1.5 rounded-lg bg-white/50 dark:bg-stone-900/40 shadow-sm border border-black/5 dark:border-white/5">
          <ChevronLeft className="w-4 h-4" /> Trở lại
        </button>
        <div className="w-px h-5 bg-amber-900/20 dark:bg-amber-100/20 mx-1" />
        <h3 className="text-[16px] font-bold text-amber-950 dark:text-amber-50 truncate font-serif">Danh sách Lớp {lop}</h3>
        <span className="ml-auto text-[11px] font-bold text-stone-500 bg-white dark:bg-stone-800 border border-black/5 dark:border-white/5 px-2.5 py-1 rounded-full flex-shrink-0 shadow-sm uppercase tracking-wider">{roster.length} HS</span>
      </div>

      {loading ? (
        <SplitListSkeleton rows={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:divide-x divide-amber-900/5 dark:divide-amber-100/5">
          {/* CỘT TRÁI: DANH SÁCH LỚP */}
          <div className="p-4 sm:p-6 bg-white/50 dark:bg-transparent">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-amber-800/70 dark:text-amber-400/70 mb-4 flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Đã xếp lớp</h4>
            <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto" data-lenis-prevent>
              {roster.map((s) => (
                <div key={s.username} className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-stone-800/40 border border-black/5 dark:border-white/5 shadow-sm group">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-amber-100 dark:border-amber-900/50 flex-shrink-0 bg-stone-100 dark:bg-stone-800">
                    <img src={s.avatar || AVATAR_FALLBACK} alt="" className="w-full h-full object-cover" onError={handleAvatarError} />
                  </div>
                  <span className="text-[13.5px] font-bold text-amber-950 dark:text-amber-50 flex-1 truncate">
                    {s.tenThanh ? <span className="text-stone-400 font-medium mr-1">{s.tenThanh}</span> : ""}{s.hoTen || s.username}
                  </span>
                  <button type="button" disabled={busyUsername === s.username} onClick={() => handleRemove(s.username)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-stone-300 dark:text-stone-600 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 flex-shrink-0 transition-colors disabled:opacity-50 md:opacity-0 md:group-hover:opacity-100">
                    {busyUsername === s.username ? <Spinner className="h-4 w-4" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              ))}
              {roster.length === 0 && <p className="text-[13px] font-medium text-stone-400 text-center py-10 border border-dashed border-black/5 dark:border-white/5 rounded-2xl">Lớp chưa có học sinh nào.</p>}
            </div>
          </div>

          {/* CỘT PHẢI: TÌM KIẾM HỌC SINH VÀO LỚP */}
          <div className="p-4 sm:p-6 border-t md:border-t-0 border-amber-900/5 dark:border-amber-100/5 bg-amber-50/30 dark:bg-stone-900/30">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-amber-800/70 dark:text-amber-400/70 mb-4 flex items-center gap-2"><Plus className="w-3.5 h-3.5" /> Ghi danh thêm</h4>
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tên hoặc mã HS..."
                className="w-full rounded-2xl border border-amber-900/10 dark:border-amber-100/10 bg-white dark:bg-stone-800 pl-10 pr-4 py-3 text-[14px] font-medium text-amber-950 dark:text-amber-50 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-shadow shadow-sm" />
            </div>
            <div className="flex flex-col gap-2 max-h-[42vh] overflow-y-auto" data-lenis-prevent>
              {candidates.map((s) => (
                <div key={s.username} className="flex items-center gap-3 px-4 py-2.5 rounded-2xl hover:bg-white dark:hover:bg-stone-800/60 border border-transparent hover:border-black/5 dark:hover:border-white/5 transition-all group">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-stone-100 dark:border-stone-800 flex-shrink-0 bg-stone-100 dark:bg-stone-800">
                    <img src={s.avatar || AVATAR_FALLBACK} alt="" className="w-full h-full object-cover opacity-80" onError={handleAvatarError} />
                  </div>
                  <span className="text-[13.5px] font-semibold text-stone-600 dark:text-stone-300 flex-1 truncate">
                    {s.tenThanh ? <span className="text-stone-400 mr-1">{s.tenThanh}</span> : ""}{s.hoTen || s.username}
                  </span>
                  <button type="button" disabled={busyUsername === s.username} onClick={() => handleAdd(s.username)}
                    className="w-8 h-8 rounded-full bg-white dark:bg-stone-800 border border-black/5 dark:border-white/5 hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:text-amber-700 hover:border-amber-200 dark:hover:border-amber-800 flex items-center justify-center text-stone-400 flex-shrink-0 transition-colors disabled:opacity-50 shadow-sm">
                    {busyUsername === s.username ? <Spinner className="h-4 w-4" /> : <Plus className="w-4 h-4" strokeWidth={3} />}
                  </button>
                </div>
              ))}
              {candidates.length === 0 && <p className="text-[13px] font-medium text-stone-400 text-center py-10 border border-dashed border-black/5 dark:border-white/5 rounded-2xl bg-white/50 dark:bg-transparent">Không còn học sinh nào khả dụng.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function TermLockToggle({ lop, hocKy, isLocked, namHoc, onChanged, showToast }) {
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const doToggle = async () => {
    setConfirmOpen(false); setBusy(true);
    try {
      if (isLocked) { await unlockTerm(lop, namHoc, hocKy); showToast(`Đã mở khóa Học kỳ ${hocKy} — lớp ${lop}`, "success"); } 
      else { await lockTerm(lop, namHoc, hocKy); showToast(`Đã khóa sổ Học kỳ ${hocKy} — lớp ${lop}`, "success"); }
      onChanged();
    } catch (err) { showToast(err?.message || "Thao tác khóa sổ thất bại", "error"); } finally { setBusy(false); }
  };

  return (
    <>
      <button type="button" disabled={busy} onClick={() => setConfirmOpen(true)} title={isLocked ? `Mở khóa Học kỳ ${hocKy}` : `Khóa sổ Học kỳ ${hocKy}`}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 disabled:opacity-50 border ${
          isLocked ? "bg-amber-900 dark:bg-amber-600 border-amber-950 dark:border-amber-500 text-amber-50 shadow-sm" : "bg-white/50 dark:bg-stone-900/50 border-black/5 dark:border-white/5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
        }`}
      >
        {busy ? <Spinner className="h-3 w-3" /> : (isLocked ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />)} HK{hocKy}
      </button>

      <ConfirmDialog open={confirmOpen} title={isLocked ? `Mở khóa sổ điểm Học kỳ ${hocKy}?` : `Khóa sổ điểm Học kỳ ${hocKy}?`}
        message={isLocked ? `Khi mở khóa, giáo viên có thể sửa lại điểm số và điểm danh cho lớp "${lop}". Bạn chắc chắn chứ?` : `Khi đã khóa sổ, giáo viên sẽ KHÔNG thể thay đổi bất kỳ điểm số hay điểm danh nào của HK${hocKy} cho lớp "${lop}".`}
        confirmLabel={isLocked ? "Đồng ý mở khóa" : "Xác nhận khóa sổ"} danger={!isLocked} onConfirm={doToggle} onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

const MAX_TEACHERS_PER_CLASS = 2;

// Rút gọn tên GV: chỉ lấy 2 chữ cuối, vd "Nguyễn Văn Sáng" -> "Văn Sáng".
// Tên có 1-2 từ thì giữ nguyên (không có gì để cắt bớt).
function layTenNgan(hoTen) {
  if (!hoTen) return "";
  const parts = hoTen.trim().split(/\s+/);
  if (parts.length <= 2) return hoTen.trim();
  return parts.slice(-2).join(" ");
}

// LƯU Ý: tên field bên dưới (ten_thanh / so_dien_thoai) là giả định dựa theo
// quy ước snake_case của object `teachers`. Nếu API trả về tên field khác
// (vd: tenThanh, sdt, dienThoai...) thì chỉnh lại 2 hàm này cho khớp.
function layTenThanh(t) {
  return t?.ten_thanh || t?.tenThanh || "";
}
function laySoDienThoai(t) {
  return t?.so_dien_thoai || t?.sdt || t?.dien_thoai || t?.phone || "";
}

// Modal hiện đầy đủ thông tin GV — dùng chung cho cả hover-tooltip (desktop)
// và click-to-open (mobile, vì mobile không có hover).
function TeacherInfoModal({ teacher, onClose }) {
  const lenis = useLenis();
  useEffect(() => {
    // Khóa cuộn native
    document.body.style.overflow = "hidden";
    lenis?.stop();
    // Trả lại trạng thái ban đầu khi đóng modal
    return () => {
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, []);
  if (!teacher) return null;
  const tenThanh = layTenThanh(teacher);
  const soDienThoai = laySoDienThoai(teacher);

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[320px] rounded-[24px] bg-[#FDFBF7] dark:bg-[#1C1917] border border-amber-900/10 dark:border-amber-100/10 shadow-xl p-5 relative"
      >
        <button type="button" onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-600 dark:hover:text-stone-200 transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center gap-3 mt-1">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-100 dark:border-amber-900/50 bg-stone-100 dark:bg-stone-800 flex-shrink-0">
            <img src={teacher.avatar || AVATAR_FALLBACK} alt="" className="w-full h-full object-cover" onError={handleAvatarError} />
          </div>
          <div>
            {tenThanh && <p className="text-[12px] font-semibold text-stone-400 dark:text-stone-500">{tenThanh}</p>}
            <p className="text-[16px] font-bold text-amber-950 dark:text-amber-50 font-serif">{teacher.ho_va_ten || teacher.username}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-stone-800/40 border border-black/5 dark:border-white/5">
            <User className="w-4 h-4 text-stone-400 flex-shrink-0" />
            <span className="text-[13px] font-medium text-stone-600 dark:text-stone-300">Tài khoản: {teacher.username}</span>
          </div>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-stone-800/40 border border-black/5 dark:border-white/5">
            <Phone className="w-4 h-4 text-stone-400 flex-shrink-0" />
            {soDienThoai ? (
              <a href={`tel:${soDienThoai}`} className="text-[13px] font-medium text-amber-800 dark:text-amber-400 hover:underline">{soDienThoai}</a>
            ) : (
              <span className="text-[13px] font-medium text-stone-400 italic">Chưa cập nhật</span>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Chip hiển thị 1 GV đứng lớp trong bảng: chỉ hiện 2 chữ cuối của tên.
// - Hover (chuột, desktop) -> hiện tooltip nhanh gọn Tên Thánh / tên đầy đủ / SĐT.
// - Click/tap (đặc biệt trên mobile, nơi không có hover) -> mở modal đầy đủ thông tin.
function TeacherChip({ t, lop, rowBusy, busyKey, onRemove }) {
  const [tooltipCoords, setTooltipCoords] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const nameRef = useRef(null);

  const tenNgan = layTenNgan(t.ho_va_ten) || t.username;
  const tenThanh = layTenThanh(t);
  const soDienThoai = laySoDienThoai(t);

  const showTooltip = () => {
    const rect = nameRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltipCoords({ left: rect.left, top: rect.bottom + 6 });
  };
  const hideTooltip = () => setTooltipCoords(null);

  return (
    <span className="inline-flex items-center gap-1.5 pl-1 pr-1.5 py-1 rounded-full bg-white dark:bg-stone-800 border border-amber-900/10 dark:border-amber-100/10 shadow-sm text-[12px] font-bold text-amber-950 dark:text-amber-50 max-w-full">
      <span className="w-5 h-5 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-700 flex-shrink-0 border border-black/5">
        <img src={t.avatar || AVATAR_FALLBACK} alt="" className="w-full h-full object-cover" onError={handleAvatarError} />
      </span>
      <span
        ref={nameRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onClick={() => { hideTooltip(); setModalOpen(true); }}
        className="truncate max-w-[110px] cursor-pointer hover:underline decoration-dotted underline-offset-2"
        title=""
      >
        {tenNgan}
      </span>
      <button type="button" disabled={rowBusy} onClick={() => onRemove(lop, t.username)} title="Gỡ khỏi lớp"
        className="w-4 h-4 rounded-full flex items-center justify-center text-stone-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 flex-shrink-0 transition-colors disabled:opacity-50">
        {busyKey === `${lop}:${t.username}` ? <Spinner className="h-2.5 w-2.5" /> : <X className="w-3 h-3" strokeWidth={2.5} />}
      </button>

      {tooltipCoords && createPortal(
        <div style={{ position: "fixed", left: tooltipCoords.left, top: tooltipCoords.top }}
          className="z-[150] w-max max-w-[220px] rounded-xl bg-stone-900 dark:bg-stone-950 text-white shadow-xl px-3 py-2.5 pointer-events-none">
          {tenThanh && <p className="text-[11px] font-medium text-stone-400">{tenThanh}</p>}
          <p className="text-[12.5px] font-bold">{t.ho_va_ten || t.username}</p>
          <p className="text-[11.5px] font-medium text-stone-300 mt-0.5">
            {soDienThoai || "Chưa có SĐT"}
          </p>
        </div>,
        document.body
      )}

      {modalOpen && <TeacherInfoModal teacher={t} onClose={() => setModalOpen(false)} />}
    </span>
  );
}

// SỬA: 1 lớp giờ có thể có tối đa 2 GV đứng lớp (mảng usernames) thay vì 1 GVCN
// duy nhất — hiển thị dạng chip, mỗi chip có nút gỡ riêng; nút "+" mở dropdown
// để thêm người còn lại (chỉ hiện khi chưa đủ MAX_TEACHERS_PER_CLASS).
function TeacherMultiSelect({ lop, assignedUsernames, teachers, teacherLopMap, busyKey, onAdd, onRemove, compact }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const assignedTeachers = assignedUsernames
    .map((u) => teachers.find((t) => t.username === u) || { username: u, ho_va_ten: u })
    .filter(Boolean);

  const canAddMore = assignedUsernames.length < MAX_TEACHERS_PER_CLASS;
  const rowBusy = busyKey?.startsWith(`${lop}:`);

  const availableTeachers = teachers.filter((t) => !assignedUsernames.includes(t.username));

  const computeCoords = useCallback(() => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    const menuHeight = 260;
    const openUpward = window.innerHeight - rect.bottom < menuHeight && rect.top > menuHeight;
    setCoords({ left: rect.left, width: Math.max(rect.width, 220), top: openUpward ? undefined : rect.bottom + 6, bottom: openUpward ? window.innerHeight - rect.top + 6 : undefined });
  }, []);

  const toggleOpen = () => { if (!open) computeCoords(); setOpen((v) => !v); };

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => { if (btnRef.current?.contains(e.target)) return; if (menuRef.current?.contains(e.target)) return; setOpen(false); };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onScroll = () => setOpen(false);

    document.addEventListener("mousedown", onClickOutside); window.addEventListener("keydown", onKey); window.addEventListener("scroll", onScroll, true); window.addEventListener("resize", onScroll);
    return () => { document.removeEventListener("mousedown", onClickOutside); window.removeEventListener("keydown", onKey); window.removeEventListener("scroll", onScroll, true); window.removeEventListener("resize", onScroll); };
  }, [open]);

  const pick = (username) => { setOpen(false); onAdd(lop, username); };

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${compact ? "w-full" : "max-w-[260px]"}`}>
      {assignedTeachers.map((t) => (
        <TeacherChip key={t.username} t={t} lop={lop} rowBusy={rowBusy} busyKey={busyKey} onRemove={onRemove} />
      ))}

      {assignedTeachers.length === 0 && (
        <span className="text-[12px] font-semibold text-stone-400 italic mr-1">Chưa có GV đứng lớp</span>
      )}

      {canAddMore && (
        <button ref={btnRef} type="button" disabled={rowBusy} onClick={toggleOpen} title="Thêm giáo viên đứng lớp"
          className={`inline-flex items-center gap-1 rounded-full border border-dashed border-stone-300 dark:border-stone-700 text-stone-400 hover:text-amber-700 hover:border-amber-300 dark:hover:text-amber-400 dark:hover:border-amber-700 transition-colors disabled:opacity-50 ${
            assignedTeachers.length === 0 ? "px-2.5 py-1 text-[12px] font-bold" : "w-6 h-6 justify-center"
          }`}
        >
          {busyKey === `${lop}:__add` ? <Spinner className="w-3 h-3" /> : <UserPlus className="w-3.5 h-3.5" />}
          {assignedTeachers.length === 0 && <span>Thêm GV</span>}
        </button>
      )}

      {open && coords && createPortal(
        <div ref={menuRef} style={{ position: "fixed", left: coords.left, top: coords.top, bottom: coords.bottom, minWidth: coords.width }}
          className="z-[100] w-max max-w-[260px] rounded-2xl border border-amber-900/10 dark:border-amber-100/10 bg-[#FDFBF7] dark:bg-[#1C1917] shadow-xl py-1.5 max-h-64 overflow-auto backdrop-blur-xl"
        >
          {availableTeachers.length === 0 && (
            <p className="px-4 py-3 text-[12.5px] font-medium text-stone-400 text-center">Không còn giáo viên khả dụng.</p>
          )}
          {availableTeachers.map((t) => {
            const currentLop = teacherLopMap?.[t.username];
            return (
              <button key={t.username} type="button" onClick={() => pick(t.username)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-left transition-colors text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 font-medium">
                <div className="w-5 h-5 rounded-full overflow-hidden bg-stone-200 flex-shrink-0 border border-black/5"><img src={t.avatar || AVATAR_FALLBACK} alt="" className="w-full h-full object-cover" onError={handleAvatarError} /></div>
                <span className="truncate flex-1">{t.ho_va_ten || t.username}</span>
                {currentLop && currentLop !== lop && (
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-full flex-shrink-0" title={`Đang đứng lớp ${currentLop} — chọn sẽ tự chuyển sang lớp ${lop}`}>
                    từ {currentLop}
                  </span>
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}

export default function ClassesTab() {
  // Loại bỏ biến users ra khỏi Context
  const { classes, namHoc, loading, loadAll, showToast } = useAdminContext();

  // Thêm state lưu teachers
  const [teachers, setTeachers] = useState([]);

  // Fetch trực tiếp danh sách giáo viên khi Tab này được bật
  useEffect(() => {
    let cancelled = false;
    fetchAllTeachers().then(data => {
      if (!cancelled) setTeachers(data);
    }).catch(err => {
      console.error("fetch teachers error", err);
    });
    return () => { cancelled = true; };
  }, []);

  // SỬA: 1 lớp giờ có thể có nhiều GV đứng lớp — không dùng `classes[].teacherUsername`
  // (số ít) từ context nữa, mà tự fetch trực tiếp bảng class_teachers, gom theo `lop`
  // thành mảng usernames. Đồng bộ lý do với việc fetch `teachers` ở trên (component
  // tự chủ dữ liệu riêng, không đụng vào AdminContext).
  const [teacherRows, setTeacherRows] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  const loadTeacherAssignments = useCallback(async () => {
    setLoadingAssignments(true);
    try {
      const rows = await fetchClassTeacherRows(namHoc);
      setTeacherRows(rows);
    } catch (err) {
      console.error("fetch class_teachers error", err);
      showToast("Không tải được danh sách GV đứng lớp", "error");
    } finally {
      setLoadingAssignments(false);
    }
  }, [namHoc, showToast]);

  useEffect(() => { loadTeacherAssignments(); }, [loadTeacherAssignments]);

  const teachersByLop = useMemo(() => {
    const map = {};
    teacherRows.forEach((r) => {
      if (!map[r.lop]) map[r.lop] = [];
      map[r.lop].push(r.teacher_username);
    });
    return map;
  }, [teacherRows]);

  // username -> lop đang đứng, dùng để cảnh báo "chọn sẽ tự chuyển lớp" trong dropdown
  const teacherLopMap = useMemo(() => {
    const map = {};
    teacherRows.forEach((r) => { map[r.teacher_username] = r.lop; });
    return map;
  }, [teacherRows]);

  const [newLop, setNewLop] = useState("");
  const [rosterLop, setRosterLop] = useState(null);
  // key dạng "<lop>:<username>" hoặc "<lop>:__add" — chỉ khoá đúng thao tác đang chạy,
  // không khoá cả hàng, để thêm/gỡ nhiều GV liên tiếp mượt hơn.
  const [busyKey, setBusyKey] = useState(null);

  const handleAddTeacher = async (lop, teacherUsername) => {
    setBusyKey(`${lop}:__add`);
    try {
      await assignTeacherToClass(lop, teacherUsername, namHoc);
      showToast("Đã thêm giáo viên đứng lớp", "success");
      await loadTeacherAssignments();
      loadAll();
    } catch (err) {
      showToast(err?.message || "Thêm giáo viên thất bại", "error");
    } finally {
      setBusyKey(null);
    }
  };

  const handleRemoveTeacher = async (lop, teacherUsername) => {
    setBusyKey(`${lop}:${teacherUsername}`);
    try {
      await unassignTeacher(teacherUsername, namHoc);
      showToast("Đã gỡ giáo viên khỏi lớp", "success");
      await loadTeacherAssignments();
      loadAll();
    } catch (err) {
      showToast(err?.message || "Gỡ giáo viên thất bại", "error");
    } finally {
      setBusyKey(null);
    }
  };

  const handleAddClass = () => {
    const name = newLop.trim();
    if (!name) return;
    if (classes.some((c) => c.lop === name)) { showToast("Lớp này đã tồn tại", "warning"); return; }
    setNewLop("");
    showToast(`Lớp "${name}" sẽ chỉ hiện khi có học sinh/GVCN đầu tiên.`, "info");
    setRosterLop(name);
  };

  if (rosterLop) return <ClassRosterPanel lop={rosterLop} namHoc={namHoc} onBack={() => { setRosterLop(null); loadAll(); }} showToast={showToast} />;

  const TeacherSelect = ({ c, compact }) => (
    <TeacherMultiSelect
      lop={c.lop}
      assignedUsernames={teachersByLop[c.lop] || []}
      teachers={teachers}
      teacherLopMap={teacherLopMap}
      busyKey={busyKey}
      onAdd={handleAddTeacher}
      onRemove={handleRemoveTeacher}
      compact={compact}
    />
  );

  return (
    <div className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm overflow-hidden transition-colors">
      <div className="sticky top-0 z-20 flex flex-col sm:flex-row gap-3 px-4 sm:px-6 py-4 border-b border-amber-900/10 dark:border-amber-100/10 bg-[#FDFBF7]/95 dark:bg-[#1C1917]/95 backdrop-blur-md">
        <div className="relative flex-1">
          <input type="text" value={newLop} onChange={(e) => setNewLop(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddClass()}
            placeholder="Mở lớp mới, vd: Thêm Sức 2..."
            className="w-full rounded-xl border border-amber-900/10 dark:border-amber-100/10 bg-white dark:bg-stone-900/50 px-4 py-3 text-[14px] font-bold text-amber-950 dark:text-amber-50 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-shadow shadow-inner" />
        </div>
        <button type="button" onClick={handleAddClass}
          className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-amber-900 dark:bg-amber-600 text-amber-50 dark:text-white text-[14px] font-bold shadow-sm md:hover:opacity-90 active:scale-[0.98] transition-all flex-shrink-0">
          <Plus className="w-4 h-4 stroke-[2.5]" /> Khởi tạo lớp
        </button>
      </div>

      {loading || loadingAssignments ? (
        <TableSkeleton rows={6} columns={4} />
      ) : classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-100/50 dark:bg-amber-500/20 flex items-center justify-center border border-amber-200/50 dark:border-amber-800/30">
            <School className="w-6 h-6 text-amber-700 dark:text-amber-400" />
          </div>
          <p className="text-[14px] font-bold text-stone-500 dark:text-stone-400">Chưa có lớp học nào hoạt động trong khóa này.</p>
        </div>
      ) : (
        <>
          {/* Mobile view */}
          <div className="sm:hidden divide-y divide-amber-900/5 dark:divide-amber-100/5 max-h-[70vh] overflow-auto" data-lenis-prevent>
            {classes.map((c) => (
              <div key={c.lop} className="flex flex-col gap-3 px-5 py-4 bg-white/50 dark:bg-transparent">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[16px] font-bold text-amber-950 dark:text-amber-50 tracking-tight font-serif">{c.lop}</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 bg-amber-100/50 dark:bg-amber-900/30 px-2.5 py-1 rounded-full">{c.studentCount} học viên</span>
                </div>
                <TeacherSelect c={c} compact />
                <div className="flex items-center gap-2 justify-between mt-1">
                  <div className="flex items-center gap-1.5">
                    <TermLockToggle lop={c.lop} hocKy={1} isLocked={!!c.locks?.[1]} namHoc={namHoc} onChanged={loadAll} showToast={showToast} />
                    <TermLockToggle lop={c.lop} hocKy={2} isLocked={!!c.locks?.[2]} namHoc={namHoc} onChanged={loadAll} showToast={showToast} />
                  </div>
                  <button type="button" onClick={() => setRosterLop(c.lop)}
                    className="inline-flex items-center justify-center gap-1.5 w-10 h-10 rounded-xl bg-white dark:bg-stone-800 border border-black/5 dark:border-white/5 shadow-sm text-stone-600 dark:text-stone-300">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop view */}
          <div className="hidden sm:block overflow-auto max-h-[65vh]" data-lenis-prevent>
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="text-[11px] font-bold text-amber-800/70 dark:text-amber-400/70 uppercase tracking-widest">
                  <th className="px-6 py-4 sticky top-0 bg-amber-50/80 dark:bg-[#252220] backdrop-blur-md z-10 border-b border-amber-900/10 dark:border-amber-100/10">Tên Lớp học</th>
                  <th className="px-4 py-4 sticky top-0 bg-amber-50/80 dark:bg-[#252220] backdrop-blur-md z-10 border-b border-amber-900/10 dark:border-amber-100/10 w-[280px]">GV đứng lớp</th>
                  <th className="px-4 py-4 sticky top-0 bg-amber-50/80 dark:bg-[#252220] backdrop-blur-md z-10 border-b border-amber-900/10 dark:border-amber-100/10 text-center w-[100px]">Sĩ số</th>
                  <th className="px-4 py-4 sticky top-0 bg-amber-50/80 dark:bg-[#252220] backdrop-blur-md z-10 border-b border-amber-900/10 dark:border-amber-100/10 text-center">Bảo mật sổ điểm</th>
                  <th className="px-6 py-4 sticky top-0 bg-amber-50/80 dark:bg-[#252220] backdrop-blur-md z-10 border-b border-amber-900/10 dark:border-amber-100/10 text-right w-[140px] whitespace-nowrap">Tuỳ chỉnh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-900/5 dark:divide-amber-100/5">
                {classes.map((c) => (
                  <tr key={c.lop} className="bg-white/50 dark:bg-transparent hover:bg-amber-50/30 dark:hover:bg-stone-800/30 transition-colors">
                    <td className="px-6 py-3.5 text-[15px] font-bold text-amber-950 dark:text-amber-50 font-serif">{c.lop}</td>
                    <td className="px-4 py-3.5"><TeacherSelect c={c} /></td>
                    <td className="px-4 py-3.5 text-center text-[14px] font-bold text-stone-500">{c.studentCount}</td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-stone-50 dark:bg-stone-900/50 border border-black/5 dark:border-white/5">
                        <TermLockToggle lop={c.lop} hocKy={1} isLocked={!!c.locks?.[1]} namHoc={namHoc} onChanged={loadAll} showToast={showToast} />
                        <TermLockToggle lop={c.lop} hocKy={2} isLocked={!!c.locks?.[2]} namHoc={namHoc} onChanged={loadAll} showToast={showToast} />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button type="button" onClick={() => setRosterLop(c.lop)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-stone-800 border border-black/5 dark:border-white/5 shadow-sm text-[12.5px] font-bold text-stone-600 dark:text-stone-300 md:hover:bg-stone-50 dark:md:hover:bg-stone-700 transition-colors whitespace-nowrap">
                        <Settings className="w-3.5 h-3.5" /> Quản lý
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <div className="px-5 sm:px-6 py-4 bg-amber-50/50 dark:bg-[#1C1917] border-t border-amber-900/10 dark:border-amber-100/10">
        <p className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wide flex items-center gap-1.5"><Lock className="w-3 h-3" /> Chú ý an toàn dữ liệu</p>
        <p className="text-[12px] font-medium text-stone-500 dark:text-stone-400 mt-1">Khóa sổ HK1/HK2 sẽ tạm ngưng quyền chỉnh sửa điểm số và điểm danh của giáo viên lớp đó cho đến khi mở khóa lại.</p>
      </div>
    </div>
  );
}