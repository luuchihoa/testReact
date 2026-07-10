import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, ArrowLeft, Check } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../ui/ToastContext.jsx";
import { Spinner, ATTENDANCE_STATUS } from "../ui/StudentShared.jsx";
import { useTeacherContext } from "./TeacherContext.jsx";
import { fetchClassTermRanges, fetchTermLocks } from "./api.js";
import {
  sortStudentsByTen, mostRecentSunday, resolveActiveHocKy,
  clampToSundayRange, toISODate, formatVNDate,
} from "./utils.js";
import { ACCENT, HK_INT_MAP, STATUS_CYCLE } from "./constants.js";

/* ============================================================
   ĐIỂM DANH NHANH — cả lớp trong 1 ngày, tick rẹt rẹt, lưu 1 lần duy nhất.
   Khác với điểm danh trong tab "Học sinh" (theo lịch cố định của từng học
   sinh), view này cho phép chọn BẤT KỲ ngày nào và áp dụng cho toàn lớp,
   phù hợp với thao tác điểm danh thực tế mỗi buổi học.
   ============================================================ */
export default function AttendanceTab() {
  const { students, context } = useTeacherContext();
  const namHoc = context.namHoc;
  const lop    = context.lop;
  const { showToast } = useToast();
  const navigate = useNavigate();
  const onBack = () => navigate("../tổng-quan");

  const [hocKy, setHocKy] = useState("HK1");
  const hocKyInt          = HK_INT_MAP[hocKy];
  const [date, setDate]   = useState(() => new Date().toISOString().slice(0, 10));
  const [statuses, setStatuses] = useState({}); // username -> trang_thai (đang sửa)
  const [initial,  setInitial]  = useState({}); // snapshot lúc vừa tải, để biết ai đã đổi
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  // Lịch điểm danh (ngày bắt đầu + tổng số buổi) của cả lớp, theo từng học kỳ —
  // dùng để tự chọn học kỳ/Chủ Nhật hiện tại và giới hạn không cho chọn quá phạm vi buổi học.
  const [termRanges, setTermRanges] = useState({ HK1: { start: null, sundays: [] }, HK2: { start: null, sundays: [] } });
  // Trạng thái khóa sổ theo học kỳ, tải cùng lịch điểm danh của lớp.
  const [termLocks, setTermLocks] = useState({});
  const isLocked = !!termLocks[hocKyInt];
  const didAutoSelect = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [ranges, locks] = await Promise.all([
          fetchClassTermRanges(lop, namHoc),
          fetchTermLocks(lop, namHoc),
        ]);
        if (cancelled) return;
        setTermRanges(ranges);
        setTermLocks(locks);

        // Chỉ tự động chọn học kỳ + Chủ Nhật một lần khi vừa vào màn hình.
        if (!didAutoSelect.current) {
          didAutoSelect.current = true;
          const todaySunday  = mostRecentSunday();
          const activeHocKy  = resolveActiveHocKy(ranges, todaySunday);
          const activeRange  = ranges[activeHocKy];
          const defaultDate  = activeRange.sundays.length
            ? clampToSundayRange(todaySunday, activeRange.sundays)
            : todaySunday;
          setHocKy(activeHocKy);
          setDate(toISODate(defaultDate));
        }
      } catch (err) {
        console.error("load class term ranges error:", err);
      }
    })();
    return () => { cancelled = true; };
  }, [lop, namHoc]);

  // Khi giáo viên đổi tab học kỳ, đưa ngày đang chọn về đúng phạm vi buổi học của học kỳ đó.
  const handleHocKyChange = (k) => {
    setHocKy(k);
    const range = termRanges[k];
    if (range?.sundays.length) {
      setDate(toISODate(clampToSundayRange(mostRecentSunday(), range.sundays)));
    }
  };

  const currentRange = termRanges[hocKy];
  const hasSchedule  = !!currentRange?.sundays.length;

  // Danh sách cố định, xếp theo Tên (không theo Họ) — không có ô tìm kiếm/lọc
  const rosterStudents = useMemo(() => sortStudentsByTen(students), [students]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("attendance")
          .select("username, trang_thai")
          .eq("nam_hoc", namHoc)
          .eq("hoc_ky", hocKyInt)
          .eq("ngay", date);
        if (error) throw error;

        const saved = {};
        (data ?? []).forEach((r) => { saved[r.username] = r.trang_thai; });

        const full = {};
        rosterStudents.forEach((s) => { full[s.username] = saved[s.username] ?? "co_mat"; });

        if (!cancelled) { setStatuses(full); setInitial(full); }
      } catch (err) {
        console.error("load bulk attendance error:", err);
        if (!cancelled) showToast("Không tải được điểm danh ngày này", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [date, namHoc, hocKyInt, rosterStudents, showToast]);

  const setOne = (username, status) => {
    if (isLocked) return;
    setStatuses((prev) => ({ ...prev, [username]: status }));
  };
  const setAll = (status) => {
    if (isLocked) return;
    const full = {};
    rosterStudents.forEach((s) => { full[s.username] = status; });
    setStatuses(full);
  };

  const changedCount = useMemo(
    () => rosterStudents.filter((s) => statuses[s.username] !== initial[s.username]).length,
    [rosterStudents, statuses, initial]
  );

  const save = async () => {
    if (isLocked) return;
    setSaving(true);
    try {
      const rows = rosterStudents.map((s) => ({
        username: s.username, nam_hoc: namHoc, hoc_ky: hocKyInt,
        ngay: date, trang_thai: statuses[s.username] ?? "co_mat",
      }));
      const { error } = await supabase.from("attendance")
        .upsert(rows, { onConflict: "username,nam_hoc,hoc_ky,ngay" });
      if (error) throw error;

      setInitial(statuses);
      showToast(`Đã lưu điểm danh cho ${rows.length} học sinh`, "success");
    } catch (err) {
      console.error("save bulk attendance error:", err);
      showToast("Lưu điểm danh thất bại", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-stone-100">
        <button type="button" onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-stone-500 hover:text-stone-800 flex-shrink-0">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        <div className="hidden sm:block w-px h-5 bg-stone-200" />
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <CalendarCheck className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} />
          {hasSchedule ? (
            <select value={date} onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B35]">
              {currentRange.sundays.map((d, idx) => (
                <option key={toISODate(d)} value={toISODate(d)}>
                  Buổi {idx + 1} · {formatVNDate(d)}
                </option>
              ))}
            </select>
          ) : (
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B35]" />
          )}
          <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
            {["HK1", "HK2"].map((k) => (
              <button key={k} type="button" onClick={() => handleHocKyChange(k)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                  hocKy === k ? "bg-white text-[#FF6B35] shadow-sm" : "text-stone-500"
                }`}>
                {k === "HK1" ? "Học Kỳ I" : "Học Kỳ II"}
              </button>
            ))}
          </div>
        </div>
        <button type="button" disabled={isLocked || saving || changedCount === 0} onClick={save}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B35] text-white text-[13px] font-bold hover:bg-[#E85E28] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 w-full sm:w-auto">
          {saving && <Spinner className="h-4 w-4" />}
          {saving ? "Đang lưu…" : changedCount > 0 ? `Lưu (${changedCount} thay đổi)` : "Lưu điểm danh"}
        </button>
      </div>

      {isLocked && (
        <div className="px-5 py-2.5 border-b border-stone-100 bg-stone-100 text-[12px] text-stone-600">
          🔒 Học kỳ này đã bị khóa sổ — chỉ xem được, không điểm danh được cho đến khi admin mở khóa lại.
        </div>
      )}

      {!hasSchedule && !isLocked && (
        <div className="px-5 py-2.5 border-b border-stone-100 bg-amber-50/60 text-[12px] text-amber-700">
          Chưa có lịch điểm danh cho học kỳ này — vào tab "Điểm & điểm danh" của một học sinh để nhập "Ngày bắt đầu học kỳ" &amp; "Tổng số buổi".
        </div>
      )}

      {/* QUICK ACTIONS */}
      <div className={`flex flex-wrap items-center gap-2 px-5 py-3 border-b border-stone-100 bg-[#F9F9F9] ${isLocked ? "opacity-60" : ""}`}>
        <span className="text-[12px] text-stone-400 font-medium mr-1">Đặt tất cả:</span>
        {STATUS_CYCLE.map((k) => (
          <button key={k} type="button" disabled={isLocked} onClick={() => setAll(k)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-[12px] font-semibold text-stone-600 hover:border-stone-300 transition-colors disabled:cursor-not-allowed">
            <span className={`w-2.5 h-2.5 rounded-full ${ATTENDANCE_STATUS[k].color}`} />
            {ATTENDANCE_STATUS[k].label}
          </button>
        ))}
      </div>

      {/* BẢNG ĐIỂM DANH — cột Học sinh cố định (sticky), không giới hạn chiều cao,
          cuộn theo trang chứ không cuộn riêng bên trong bảng. */}
      {loading ? (
        <div className="flex items-center justify-center gap-2.5 py-14" style={{ color: ACCENT }}>
          <Spinner className="h-5 w-5" />
          <span className="text-sm text-stone-500">Đang tải điểm danh…</span>
        </div>
      ) : (
        <>
          {/* MOBILE: danh sách dạng thẻ, mỗi học sinh 1 hàng nút to dễ bấm bằng ngón tay */}
          <div className={`md:hidden divide-y divide-stone-50 ${isLocked ? "opacity-60 pointer-events-none" : ""}`} data-lenis-prevent>
            {rosterStudents.map((s, idx) => {
              const status  = statuses[s.username] ?? "co_mat";
              const isDirty = statuses[s.username] !== initial[s.username];
              return (
                <div key={s.username} className={`px-4 py-3 ${isDirty ? "bg-orange-50/40" : ""}`}>
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span className="text-[11px] font-medium text-stone-400 w-4 flex-shrink-0 text-center">{idx + 1}</span>
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-200 flex-shrink-0 bg-stone-100">
                      <img src={s.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[13px] font-semibold text-stone-800 truncate min-w-0 flex-1">
                      {s.tenThanh ? `${s.tenThanh} ` : ""}{s.hoTen}
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 pl-[42px]">
                    {STATUS_CYCLE.map((k) => {
                      const active = status === k;
                      return (
                        <button key={k} type="button" onClick={() => setOne(s.username, k)} title={ATTENDANCE_STATUS[k].label}
                          className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all ${
                            active ? `${ATTENDANCE_STATUS[k].color} ring-2 ring-offset-1 ring-stone-300` : "bg-stone-100"
                          }`}>
                          {active ? (
                            <Check className="w-3.5 h-3.5 text-white drop-shadow" strokeWidth={3} />
                          ) : (
                            <span className="w-3.5 h-3.5" />
                          )}
                          <span className={`text-[9px] font-semibold leading-tight text-center ${active ? "text-white" : "text-stone-500"}`}>
                            {ATTENDANCE_STATUS[k].label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {rosterStudents.length === 0 && (
              <p className="text-center text-sm text-stone-400 py-10 px-4">Lớp chưa có học sinh nào.</p>
            )}
          </div>

          {/* DESKTOP: bảng đầy đủ, cột Học sinh cố định (sticky) */}
          <div className={`hidden md:block overflow-auto max-h-[65vh] ${isLocked ? "opacity-60 pointer-events-none" : ""}`} data-lenis-prevent>
            <table className="w-full text-sm border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-[#F9F9F9] text-[11px] text-stone-400 uppercase tracking-wide">
                  <th className="text-center font-semibold px-3 py-3 sticky top-0 left-0 bg-[#F9F9F9] z-20 w-12">STT</th>
                  <th className="text-left font-semibold px-4 py-3 sticky top-0 left-[48px] bg-[#F9F9F9] z-20">Họ & Tên</th>
                  {STATUS_CYCLE.map((k) => (
                    <th key={k} className="font-semibold px-2 py-3 text-center min-w-[112px] sticky top-0 bg-[#F9F9F9] z-10">
                      <span className="inline-flex items-center gap-1.5 justify-center whitespace-nowrap">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${ATTENDANCE_STATUS[k].color}`} />
                        {ATTENDANCE_STATUS[k].label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rosterStudents.map((s, idx) => {
                  const status  = statuses[s.username] ?? "co_mat";
                  const isDirty = statuses[s.username] !== initial[s.username];
                  const rowBg   = isDirty ? "bg-orange-50/40" : "bg-white";
                  return (
                    <tr key={s.username} className="border-b border-stone-50">
                      <td className={`px-3 py-2 text-center sticky left-0 z-10 text-[12px] font-medium text-stone-400 w-12 ${rowBg}`}>
                        {idx + 1}
                      </td>
                      <td className={`px-4 py-2 sticky left-[48px] z-10 ${rowBg}`}>
                        <div className="flex items-center gap-2.5 min-w-[170px]">
                          <div className="w-7 h-7 rounded-full overflow-hidden border border-stone-200 flex-shrink-0 bg-stone-100">
                            <img src={s.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-stone-800 truncate">
                              {s.tenThanh ? `${s.tenThanh} ` : ""}{s.hoTen}
                            </p>
                          </div>
                        </div>
                      </td>
                      {STATUS_CYCLE.map((k) => {
                        const active = status === k;
                        return (
                          <td key={k} className="px-2 py-2 text-center">
                            <button type="button" onClick={() => setOne(s.username, k)} title={ATTENDANCE_STATUS[k].label}
                              className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-all ${
                                active ? `${ATTENDANCE_STATUS[k].color} ring-2 ring-offset-1 ring-stone-300 scale-105` : "bg-stone-100 hover:bg-stone-200"
                              }`}>
                              {active && <Check className="w-4 h-4 text-white drop-shadow" strokeWidth={3} />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {rosterStudents.length === 0 && (
                  <tr>
                    <td colSpan={2 + STATUS_CYCLE.length} className="text-center text-sm text-stone-400 py-10">
                      Lớp chưa có học sinh nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}