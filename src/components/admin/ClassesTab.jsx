import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, Users, Plus, Trash2, ChevronLeft, ChevronDown, Lock, LockOpen, School } from "lucide-react";
import { Spinner, ConfirmDialog } from "../ui/StudentShared.jsx";
import { useAdminContext } from "./AdminContext.jsx";
import { AVATAR_FALLBACK, handleAvatarError } from "./constants.js";
import { SplitListSkeleton, TableSkeleton } from "../ui/Skeleton.jsx";
import {
  fetchClassRoster, fetchStudents, assignStudentToClass, removeStudentFromClass,
  assignTeacherToClass, unassignTeacher, lockTerm, unlockTerm,
} from "./dataLayer.js";

function ClassRosterPanel({ lop, namHoc, onBack, showToast }) {
  const [roster,       setRoster]       = useState([]);
  const [allStudents,  setAllStudents]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [busyUsername, setBusyUsername] = useState(null);

  // Load lần đầu (hoặc khi đổi lớp/năm học): cần cả roster của lớp lẫn toàn
  // bộ danh sách học sinh để tính candidates.
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
      showToast("Đã thêm học sinh vào lớp", "success");
      // Chỉ refetch roster của lớp — allStudents không đổi sau thao tác này,
      // tránh gọi lại toàn bộ danh sách học sinh không cần thiết.
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
      showToast("Đã bỏ học sinh khỏi lớp", "success");
      setRoster(await fetchClassRoster(lop, namHoc));
    } catch (err) {
      console.error("remove student error:", err);
      showToast("Thao tác thất bại", "error");
    } finally {
      setBusyUsername(null);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-stone-100 dark:border-white/10 shadow-sm dark:shadow-none overflow-hidden transition-colors">
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-stone-100 dark:border-white/10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl sticky top-0 z-10">
        <button type="button" onClick={onBack}
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-stone-500 dark:text-neutral-400 hover:text-stone-800 dark:hover:text-neutral-100 active:scale-95 transition-all flex-shrink-0 -ml-1 px-1.5 py-1 rounded-lg">
          <ChevronLeft className="w-4 h-4" /> Quay lại
        </button>
        <div className="w-px h-5 bg-stone-200 dark:bg-white/10" />
        <h3 className="text-[14px] font-bold text-stone-800 dark:text-neutral-100 truncate tracking-tight">Lớp {lop} · {namHoc}</h3>
        <span className="ml-auto text-[12px] text-stone-400 dark:text-neutral-500 flex-shrink-0">{roster.length} học sinh</span>
      </div>

      {loading ? (
        <SplitListSkeleton rows={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:divide-x divide-stone-100 dark:divide-white/10">
          <div className="p-4 sm:p-5">
            <h4 className="text-[11px] font-bold uppercase tracking-wide text-stone-400 dark:text-neutral-500 mb-3">Đã xếp lớp</h4>
            <div className="flex flex-col gap-1.5 max-h-[50vh] overflow-y-auto" data-lenis-prevent>
              {roster.map((s) => (
                <div key={s.username} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-stone-50 dark:bg-white/[0.05]">
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-stone-200 dark:border-white/10 flex-shrink-0 bg-stone-100 dark:bg-white/[0.06]">
                    <img
                      src={s.avatar || AVATAR_FALLBACK}
                      alt="" className="w-full h-full object-cover"
                      onError={handleAvatarError}
                    />
                  </div>
                  <span className="text-[13px] font-medium text-stone-800 dark:text-neutral-100 flex-1 truncate">
                    {s.tenThanh ? `${s.tenThanh} ` : ""}{s.hoTen || s.username}
                  </span>
                  <button type="button" disabled={busyUsername === s.username} onClick={() => handleRemove(s.username)}
                    className="w-7 h-7 rounded-full hover:bg-red-50 dark:hover:bg-red-500/15 flex items-center justify-center text-stone-400 dark:text-neutral-500 hover:text-red-600 dark:hover:text-red-400 flex-shrink-0 transition-colors disabled:opacity-50">
                    {busyUsername === s.username ? <Spinner className="h-3.5 w-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
              {roster.length === 0 && <p className="text-[13px] text-stone-400 dark:text-neutral-500 text-center py-6">Lớp chưa có học sinh nào.</p>}
            </div>
          </div>

          <div className="p-4 sm:p-5 border-t md:border-t-0 border-stone-100 dark:border-white/10">
            <h4 className="text-[11px] font-bold uppercase tracking-wide text-stone-400 dark:text-neutral-500 mb-3">Thêm học sinh</h4>
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-stone-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm học sinh…"
                className="w-full rounded-full border-none bg-stone-100/80 dark:bg-white/[0.06] pl-9 pr-3.5 py-2.5 text-[15px] text-stone-800 dark:text-neutral-100 placeholder-stone-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-shadow" />
            </div>
            <div className="flex flex-col gap-1.5 max-h-[42vh] overflow-y-auto" data-lenis-prevent>
              {candidates.map((s) => (
                <div key={s.username} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-stone-50 dark:hover:bg-white/[0.05] transition-colors">
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-stone-200 dark:border-white/10 flex-shrink-0 bg-stone-100 dark:bg-white/[0.06]">
                    <img
                      src={s.avatar || AVATAR_FALLBACK}
                      alt="" className="w-full h-full object-cover"
                      onError={handleAvatarError}
                    />
                  </div>
                  <span className="text-[13px] font-medium text-stone-700 dark:text-neutral-200 flex-1 truncate">
                    {s.tenThanh ? `${s.tenThanh} ` : ""}{s.hoTen || s.username}
                  </span>
                  <button type="button" disabled={busyUsername === s.username} onClick={() => handleAdd(s.username)}
                    className="w-7 h-7 rounded-full bg-red-50 dark:bg-red-500/15 hover:bg-red-100 dark:hover:bg-red-500/25 flex items-center justify-center text-red-600 dark:text-red-400 flex-shrink-0 transition-colors disabled:opacity-50">
                    {busyUsername === s.username ? <Spinner className="h-3.5 w-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
              {candidates.length === 0 && <p className="text-[13px] text-stone-400 dark:text-neutral-500 text-center py-6">Không còn học sinh nào để thêm.</p>}
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
    setConfirmOpen(false);
    setBusy(true);
    try {
      if (isLocked) {
        await unlockTerm(lop, namHoc, hocKy);
        showToast(`Đã mở khóa Học kỳ ${hocKy} — lớp ${lop}`, "success");
      } else {
        await lockTerm(lop, namHoc, hocKy);
        showToast(`Đã khóa sổ Học kỳ ${hocKy} — lớp ${lop}`, "success");
      }
      onChanged();
    } catch (err) {
      console.error("toggle term lock error:", err);
      showToast(err?.message || "Thao tác khóa sổ thất bại", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => setConfirmOpen(true)}
        title={isLocked ? `Mở khóa Học kỳ ${hocKy}` : `Khóa sổ Học kỳ ${hocKy}`}
        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold
          transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${
          isLocked
            ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-sm"
            : "text-stone-400 dark:text-neutral-500 hover:text-stone-600 dark:hover:text-neutral-300"
        }`}
      >
        {busy ? <Spinner className="h-3 w-3" /> : (isLocked ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />)}
        HK{hocKy}
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title={isLocked ? `Mở khóa Học kỳ ${hocKy}?` : `Khóa sổ Học kỳ ${hocKy}?`}
        message={
          isLocked
            ? `Giáo viên sẽ có thể sửa điểm/điểm danh trở lại cho lớp "${lop}".`
            : `Giáo viên sẽ KHÔNG thể sửa điểm/điểm danh của học kỳ này cho lớp "${lop}" cho đến khi được mở khóa lại.`
        }
        confirmLabel={isLocked ? "Mở khóa" : "Khóa sổ"}
        danger={!isLocked}
        onConfirm={doToggle}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

function TeacherDropdown({ c, teachers, savingLop, onAssign, compact }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null); // { top, left, width }
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const hasTeacher = !!c.teacherUsername;
  const currentLabel = teachers.find((t) => t.username === c.teacherUsername)?.hoTen
    || c.teacherUsername || "— Chưa có GVCN —";

  const computeCoords = useCallback(() => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Nếu nút quá gần đáy màn hình, mở dropdown lên trên thay vì xuống dưới
    const menuHeight = 260; // ước lượng max-h của menu, đủ để quyết định hướng mở
    const openUpward = window.innerHeight - rect.bottom < menuHeight && rect.top > menuHeight;
    setCoords({
      left: rect.left,
      width: rect.width,
      top: openUpward ? undefined : rect.bottom + 6,
      bottom: openUpward ? window.innerHeight - rect.top + 6 : undefined,
    });
  }, []);

  const toggleOpen = () => {
    if (!open) computeCoords();
    setOpen((v) => !v);
  };

  // Đóng khi click ra ngoài (tính cả bên trong menu đã portal ra body)
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (btnRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    // Đóng khi cuộn — đơn giản và an toàn hơn việc phải reposition liên tục
    // theo mọi ancestor có thể scroll (table wrapper, page, v.v.)
    const onScroll = () => setOpen(false);

    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true); // capture: bắt cả scroll trong container con
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  const pick = (username) => {
    setOpen(false);
    onAssign(c.lop, username);
  };

  return (
    <div className={compact ? "w-full" : "inline-block"}>
      <button
        ref={btnRef}
        type="button"
        disabled={savingLop === c.lop}
        onClick={toggleOpen}
        className={`flex items-center gap-2 rounded-full border pl-3 pr-2.5 py-1.5 text-[12px] font-medium
          transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-red-500/60 dark:focus:ring-red-400/60
          ${compact ? "w-full" : ""} ${
          hasTeacher
            ? "border-stone-200 dark:border-white/10 bg-white dark:bg-white/[0.06] text-stone-800 dark:text-neutral-100"
            : "border-dashed border-stone-300 dark:border-white/15 bg-stone-50 dark:bg-white/[0.03] text-stone-400 dark:text-neutral-500"
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${hasTeacher ? "bg-emerald-500" : "bg-stone-300 dark:bg-white/20"}`} />
        <span className="flex-1 min-w-0 truncate text-left">{currentLabel}</span>
        {savingLop === c.lop ? (
          <Spinner className="w-3.5 h-3.5 flex-shrink-0" />
        ) : (
          <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
        )}
      </button>

      {open && coords && createPortal(
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            left: coords.left,
            top: coords.top,
            bottom: coords.bottom,
            minWidth: coords.width,
          }}
          className="z-[100] w-max max-w-[240px] rounded-2xl border border-black/5 dark:border-white/10
            bg-white dark:bg-[#1c1c1e] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.25)]
            py-1.5 max-h-64 overflow-auto"
        >
          <button type="button" onClick={() => pick("")}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-[12.5px] text-left
              text-stone-400 dark:text-stone-500 hover:bg-stone-50 dark:hover:bg-white/[0.06] transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-white/20 flex-shrink-0" />
            — Chưa có GVCN —
          </button>
          {teachers.map((t) => (
            <button key={t.username} type="button" onClick={() => pick(t.username)}
              className={`w-full flex items-center gap-2 px-3.5 py-2 text-[12.5px] text-left transition-colors ${
                t.username === c.teacherUsername
                  ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-semibold"
                  : "text-stone-700 dark:text-neutral-200 hover:bg-stone-50 dark:hover:bg-white/[0.06]"
              }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              {t.hoTen || t.username}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

export default function ClassesTab() {
  const { classes, users, namHoc, loading, loadAll, showToast } = useAdminContext();
  const teachers = useMemo(() => users.filter((u) => u.role === "teacher"), [users]);

  const [newLop, setNewLop] = useState("");
  const [rosterLop, setRosterLop] = useState(null);
  const [savingLop, setSavingLop] = useState(null);

  const handleAssign = async (lop, newTeacherUsername) => {
    setSavingLop(lop);
    try {
      if (newTeacherUsername) {
        await assignTeacherToClass(lop, newTeacherUsername, namHoc);
      } else {
        const current = classes.find((c) => c.lop === lop)?.teacherUsername;
        await unassignTeacher(current, namHoc);
      }
      showToast("Đã cập nhật giáo viên chủ nhiệm", "success");
      loadAll();
    } catch (err) {
      console.error("assign teacher error:", err);
      showToast(err?.message || "Cập nhật thất bại", "error");
    } finally {
      setSavingLop(null);
    }
  };

  const handleAddClass = () => {
    const name = newLop.trim();
    if (!name) return;
    if (classes.some((c) => c.lop === name)) { showToast("Lớp này đã tồn tại", "warning"); return; }
    setNewLop("");
    showToast(`Lớp "${name}" sẽ chỉ xuất hiện sau khi có học sinh hoặc GVCN đầu tiên.`, "info");
    setRosterLop(name);
  };

  if (rosterLop) {
    return (
      <ClassRosterPanel
        lop={rosterLop}
        namHoc={namHoc}
        onBack={() => { setRosterLop(null); loadAll(); }}
        showToast={showToast}
      />
    );
  }

  // Select GVCN dùng chung cho cả 2 layout (card mobile + table desktop).
  const TeacherSelect = ({ c, compact }) => (
    <TeacherDropdown c={c} teachers={teachers} savingLop={savingLop} onAssign={handleAssign} compact={compact} />
  );

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-stone-100 dark:border-white/10 shadow-sm dark:shadow-none overflow-hidden transition-colors">
      <div className="sticky top-0 z-20 flex flex-col sm:flex-row gap-2.5 px-4 sm:px-5 py-3.5 border-b border-stone-100 dark:border-white/10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl">
        <div className="relative flex-1">
          <input type="text" value={newLop} onChange={(e) => setNewLop(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddClass()}
            placeholder="Tên lớp mới, vd: Rước Lễ 1…"
            className="w-full rounded-full border-none bg-stone-100/80 dark:bg-white/[0.06] px-3.5 py-2.5 text-[15px] text-stone-800 dark:text-neutral-100 placeholder-stone-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-shadow" />
        </div>
        <button type="button" onClick={handleAddClass}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-red-600 dark:bg-red-500 text-white text-[13px] font-bold hover:bg-red-700 dark:hover:bg-red-600 active:scale-[0.97] transition-all flex-shrink-0">
          <Plus className="w-4 h-4" /> Thêm lớp
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={6} columns={4} />
      ) : classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 px-6 text-center">
          <div className="w-11 h-11 rounded-full bg-stone-100 dark:bg-white/[0.06] flex items-center justify-center">
            <School className="w-5 h-5 text-stone-400 dark:text-neutral-500" />
          </div>
          <p className="text-[13px] font-medium text-stone-400 dark:text-neutral-500">Chưa có lớp nào trong năm học {namHoc}.</p>
        </div>
      ) : (
        <>
          {/* ---- Mobile: danh sách thẻ ---- */}
          <div className="sm:hidden divide-y divide-stone-100 dark:divide-white/[0.06] max-h-[70vh] overflow-auto" data-lenis-prevent>
            {classes.map((c) => (
              <div key={c.lop} className="flex flex-col gap-2.5 px-4 py-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[14px] font-semibold text-stone-800 dark:text-neutral-100 tracking-tight truncate">{c.lop}</span>
                  <span className="text-[12px] text-stone-400 dark:text-neutral-500 flex-shrink-0">{c.studentCount} học sinh</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <TeacherSelect c={c} />
                  <div className="inline-flex items-center gap-0.5 rounded-full bg-stone-100 dark:bg-white/[0.06] p-1">
                    <TermLockToggle lop={c.lop} hocKy={1} isLocked={!!c.locks?.[1]} namHoc={namHoc} onChanged={loadAll} showToast={showToast} />
                    <TermLockToggle lop={c.lop} hocKy={2} isLocked={!!c.locks?.[2]} namHoc={namHoc} onChanged={loadAll} showToast={showToast} />
                  </div>
                </div>
                <button type="button" onClick={() => setRosterLop(c.lop)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-stone-100 dark:bg-white/[0.08] active:bg-stone-200 dark:active:bg-white/[0.14] text-[12.5px] font-semibold text-stone-600 dark:text-neutral-300 transition-colors">
                  <Users className="w-3.5 h-3.5" /> Quản lý học sinh
                </button>
              </div>
            ))}
          </div>

          {/* ---- Desktop / tablet: bảng ---- */}
          <div className="hidden sm:block overflow-auto max-h-[65vh]" data-lenis-prevent>
            <table className="w-full text-sm border-collapse min-w-[680px]">
              <thead>
                <tr className="text-[11px] text-stone-400 dark:text-neutral-500 uppercase tracking-wide">
                  <th className="text-left font-semibold px-5 py-3 sticky top-0 bg-[#F9F9F9] dark:bg-neutral-900 z-10 border-b border-stone-100 dark:border-white/10">Lớp</th>
                  <th className="text-center font-semibold px-3 py-3 sticky top-0 bg-[#F9F9F9] dark:bg-neutral-900 z-10 border-b border-stone-100 dark:border-white/10">Giáo viên chủ nhiệm</th>
                  <th className="text-center font-semibold px-3 py-3 sticky top-0 bg-[#F9F9F9] dark:bg-neutral-900 z-10 border-b border-stone-100 dark:border-white/10">Sĩ số</th>
                  <th className="text-center font-semibold px-3 py-3 sticky top-0 bg-[#F9F9F9] dark:bg-neutral-900 z-10 border-b border-stone-100 dark:border-white/10">Khóa sổ điểm</th>
                  <th className="text-center font-semibold px-3 py-3 sticky top-0 bg-[#F9F9F9] dark:bg-neutral-900 z-10 border-b border-stone-100 dark:border-white/10">Xếp học sinh</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c) => (
                  <tr key={c.lop} className="border-b border-stone-50 dark:border-white/[0.06] hover:bg-stone-50/70 dark:hover:bg-white/[0.03] transition-colors">
                    <td className="px-5 py-2.5 text-[13px] font-semibold text-stone-800 dark:text-neutral-100 tracking-tight">{c.lop}</td>
                    <td className="px-3 py-2.5 text-center">
                      <TeacherSelect c={c} />
                    </td>
                    <td className="px-3 py-2.5 text-center text-[13px] text-stone-600 dark:text-neutral-300">{c.studentCount}</td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="inline-flex items-center gap-0.5 rounded-full bg-stone-100 dark:bg-white/[0.06] p-1">
                          <TermLockToggle lop={c.lop} hocKy={1} isLocked={!!c.locks?.[1]} namHoc={namHoc} onChanged={loadAll} showToast={showToast} />
                          <TermLockToggle lop={c.lop} hocKy={2} isLocked={!!c.locks?.[2]} namHoc={namHoc} onChanged={loadAll} showToast={showToast} />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button type="button" onClick={() => setRosterLop(c.lop)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-white/[0.08] hover:bg-stone-200 dark:hover:bg-white/[0.14] text-[12px] font-semibold text-stone-600 dark:text-neutral-300 transition-colors">
                        <Users className="w-3.5 h-3.5" /> Quản lý
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p className="px-4 sm:px-5 py-3 text-[11px] text-stone-400 dark:text-neutral-500 border-t border-stone-100 dark:border-white/10">
        Khóa sổ HK1/HK2 sẽ chặn giáo viên sửa điểm, điểm danh và tổng kết học kỳ của lớp đó cho đến khi mở khóa lại.
      </p>
    </div>
  );
}