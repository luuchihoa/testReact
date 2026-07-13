import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, ArrowLeft, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../ui/ToastContext.jsx";
import { Spinner, ATTENDANCE_STATUS } from "../ui/StudentShared.jsx";
import { useTeacherContext } from "./TeacherContext.jsx";
import { fetchClassTermRanges, fetchTermLocks } from "./api.js";
import {
  sortStudentsByTen, mostRecentSunday, resolveActiveHocKy,
  clampToSundayRange, toISODate, formatVNDate,
} from "./utils.js";
import { HK_INT_MAP, STATUS_CYCLE } from "./constants.js";

// Hằng số Easing chuẩn của Design System
const APPLE_EASE = [0.16, 1, 0.3, 1];

export default function AttendanceTab() {
  const { students, context } = useTeacherContext();
  const namHoc = context.namHoc;
  const lop = context.lop;
  const { showToast } = useToast();
  const navigate = useNavigate();
  const onBack = () => navigate("../tổng-quan");

  const [hocKy, setHocKy] = useState("HK1");
  const hocKyInt = HK_INT_MAP[hocKy];
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [statuses, setStatuses] = useState({});
  const [initial, setInitial] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [termRanges, setTermRanges] = useState({ HK1: { start: null, sundays: [] }, HK2: { start: null, sundays: [] } });
  const [termLocks, setTermLocks] = useState({});
  const isLocked = !!termLocks[hocKyInt];
  const didAutoSelect = useRef(false);

  // Hook giả lập kiểm tra Mobile (Có thể thay thế bằng hook thực tế của dự án)
  const isMobile = window.innerWidth < 768;

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

        if (!didAutoSelect.current) {
          didAutoSelect.current = true;
          const todaySunday = mostRecentSunday();
          const activeHocKy = resolveActiveHocKy(ranges, todaySunday);
          const activeRange = ranges[activeHocKy];
          const defaultDate = activeRange.sundays.length
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

  const handleHocKyChange = (k) => {
    setHocKy(k);
    const range = termRanges[k];
    if (range?.sundays.length) {
      setDate(toISODate(clampToSundayRange(mostRecentSunday(), range.sundays)));
    }
  };

  const currentRange = termRanges[hocKy];
  const hasSchedule = !!currentRange?.sundays.length;
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
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: APPLE_EASE }}
      className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm overflow-hidden"
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-5 border-b border-amber-900/10 dark:border-amber-100/10">
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
            <button type="button" onClick={onBack}
            className="inline-flex items-center justify-center gap-2 p-2 rounded-xl text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 border border-black/5 dark:border-white/5 transition-all duration-300 active:scale-[0.98] md:hover:bg-stone-200 dark:md:hover:bg-stone-700 flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-xl sm:text-2xl font-extrabold text-amber-950 dark:text-amber-50 font-serif leading-tight">
                Điểm danh lớp
            </h2>
        </div>

        <div className="hidden sm:block w-px h-6 bg-stone-200 dark:bg-stone-800 mx-2" />
        
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <CalendarCheck className="w-5 h-5 flex-shrink-0 text-amber-800 dark:text-amber-400" />
          {hasSchedule ? (
            <select value={date} onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-amber-900/10 dark:border-amber-100/10 bg-white/50 dark:bg-stone-800/50 px-4 py-2.5 text-[14px] font-medium text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-600/50 dark:focus:ring-amber-500/50 transition-shadow">
              {currentRange.sundays.map((d, idx) => (
                <option key={toISODate(d)} value={toISODate(d)}>
                  Buổi {idx + 1} · {formatVNDate(d)}
                </option>
              ))}
            </select>
          ) : (
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-amber-900/10 dark:border-amber-100/10 bg-white/50 dark:bg-stone-800/50 px-4 py-2.5 text-[14px] font-medium text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-600/50 transition-shadow" />
          )}
          
          <div className="flex gap-1 bg-stone-100/80 dark:bg-stone-800/80 rounded-xl p-1 backdrop-blur-sm">
            {["HK1", "HK2"].map((k) => (
              <button key={k} type="button" onClick={() => handleHocKyChange(k)}
                className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all duration-300 ${
                  hocKy === k 
                    ? "bg-white dark:bg-stone-700 text-amber-900 dark:text-amber-400 shadow-sm" 
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
                }`}>
                {k === "HK1" ? "Học Kỳ I" : "Học Kỳ II"}
              </button>
            ))}
          </div>
        </div>

        {/* Nút Bấm Chính (Primary Button Snippet) */}
        <button type="button" disabled={isLocked || saving || changedCount === 0} onClick={save}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-sm transition-all duration-300 active:scale-[0.98] md:hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 w-full sm:w-auto">
          {saving && <Spinner className="h-4 w-4" />}
          {saving ? "Đang lưu…" : changedCount > 0 ? `Lưu (${changedCount})` : "Lưu điểm danh"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isLocked && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            transition={{ duration: 0.35, ease: APPLE_EASE }}
            className="overflow-hidden"
          >
            <div className="px-5 py-3 border-b border-amber-900/10 dark:border-amber-100/10 bg-stone-100/50 dark:bg-stone-800/50 text-[13px] font-medium text-stone-600 dark:text-stone-300 flex items-center gap-2">
              <span className="text-lg">🔒</span> Học kỳ này đã bị khóa sổ — chỉ xem được, không điểm danh được cho đến khi Admin mở khóa lại.
            </div>
          </motion.div>
        )}

        {!hasSchedule && !isLocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            transition={{ duration: 0.35, ease: APPLE_EASE }}
            className="overflow-hidden"
          >
            <div className="px-5 py-3 border-b border-amber-900/10 dark:border-amber-100/10 bg-amber-50/80 dark:bg-amber-900/20 text-[13px] font-medium text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              Chưa có lịch điểm danh cho học kỳ này — vào tab "Điểm & điểm danh" của một học sinh để nhập "Ngày bắt đầu học kỳ" &amp; "Tổng số buổi".
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUICK ACTIONS */}
      <div className={`flex flex-wrap items-center gap-3 px-5 py-4 border-b border-amber-900/10 dark:border-amber-100/10 bg-[#FDFBF7]/50 dark:bg-stone-900/50 ${isLocked ? "opacity-60" : ""}`}>
        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 mr-1">
            Đặt tất cả:
        </span>
        {STATUS_CYCLE.map((k) => (
          <button key={k} type="button" disabled={isLocked} onClick={() => setAll(k)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[13px] font-bold text-stone-600 dark:text-stone-300 hover:border-amber-900/30 dark:hover:border-amber-100/30 transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed shadow-sm">
            <span className={`w-2.5 h-2.5 rounded-full ${ATTENDANCE_STATUS[k].color}`} />
            {ATTENDANCE_STATUS[k].label}
          </button>
        ))}
      </div>

      {/* BẢNG ĐIỂM DANH */}
      <AnimatePresence mode="wait">
      {loading ? (
        <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3 py-20 text-amber-900 dark:text-amber-500"
        >
          <Spinner className="h-6 w-6" />
          <span className="text-[14px] font-medium font-sans">Đang tải điểm danh…</span>
        </motion.div>
      ) : (
        <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: APPLE_EASE }}>
          
          {/* MOBILE LIST */}
          <div className={`md:hidden divide-y divide-amber-900/5 dark:divide-amber-100/5 ${isLocked ? "opacity-60 pointer-events-none" : ""}`} data-lenis-prevent>
            {rosterStudents.map((s, idx) => {
              const status  = statuses[s.username] ?? "co_mat";
              const isDirty = statuses[s.username] !== initial[s.username];
              return (
                <motion.div 
                  initial={{ opacity: 0, y: isMobile ? 16 : 0 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true, margin: isMobile ? "-20px" : "0px" }}
                  transition={{ duration: 0.5, delay: idx * 0.05, ease: APPLE_EASE }}
                  key={s.username} 
                  className={`px-5 py-4 transition-colors duration-500 ${isDirty ? "bg-amber-50/60 dark:bg-amber-900/20" : ""}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[12px] font-bold text-amber-800/50 dark:text-amber-400/50 w-5 text-center">{idx + 1}</span>
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-stone-800 flex-shrink-0 bg-stone-100 shadow-sm">
                      <img src={s.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[15px] font-bold text-stone-800 dark:text-stone-200 truncate flex-1">
                      {s.tenThanh ? <span className="text-stone-500 font-medium mr-1">{s.tenThanh}</span> : ""}{s.hoTen}
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-2 pl-[52px]">
                    {STATUS_CYCLE.map((k) => {
                      const active = status === k;
                      return (
                        <button key={k} type="button" onClick={() => setOne(s.username, k)}
                          className={`flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all duration-300 active:scale-[0.95] ${
                            active ? `${ATTENDANCE_STATUS[k].color} shadow-md` : "bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200"
                          }`}>
                          {active ? (
                            <Check className="w-4 h-4 text-white drop-shadow-sm" strokeWidth={3} />
                          ) : (
                            <span className="w-4 h-4" />
                          )}
                          <span className={`text-[10px] font-bold leading-none tracking-wide text-center uppercase ${active ? "text-white" : "text-stone-500 dark:text-stone-400"}`}>
                            {ATTENDANCE_STATUS[k].label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
            {rosterStudents.length === 0 && (
              <p className="text-center text-[14px] text-stone-500 dark:text-stone-400 py-12 px-5">Lớp chưa có học sinh nào.</p>
            )}
          </div>

          {/* DESKTOP TABLE */}
          <div className={`hidden md:block overflow-auto max-h-[65vh] ${isLocked ? "opacity-60" : ""}`} data-lenis-prevent>
            <table className={`w-full text-sm border-collapse min-w-[640px] ${isLocked ? "pointer-events-none" : ""}`}>
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70">
                  <th className="text-center px-3 py-4 sticky top-0 left-0 bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl z-20 w-14 border-b border-amber-900/10 dark:border-amber-100/10">STT</th>
                  <th className="text-left px-4 py-4 sticky top-0 left-[56px] bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl z-20 border-b border-amber-900/10 dark:border-amber-100/10">Họ & Tên</th>
                  {STATUS_CYCLE.map((k) => (
                    <th key={k} className="px-2 py-4 text-center min-w-[120px] sticky top-0 bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl z-10 border-b border-amber-900/10 dark:border-amber-100/10">
                      <span className="inline-flex items-center gap-1.5 justify-center whitespace-nowrap">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${ATTENDANCE_STATUS[k].color}`} />
                        {ATTENDANCE_STATUS[k].label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-900/5 dark:divide-amber-100/5">
                {rosterStudents.map((s, idx) => {
                  const status  = statuses[s.username] ?? "co_mat";
                  const isDirty = statuses[s.username] !== initial[s.username];
                  const rowBg   = isDirty ? "bg-amber-50/60 dark:bg-amber-900/20" : "bg-transparent hover:bg-stone-50 dark:hover:bg-stone-800/50";
                  
                  return (
                    // Lưu ý: Không dùng transform Y cho thẻ TR có chứa ô sticky (tránh bị lỗi position CSS)
                    <motion.tr 
                      initial={{ opacity: 0 }} 
                      whileInView={{ opacity: 1 }} 
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.02, ease: APPLE_EASE }}
                      key={s.username} 
                      className={`transition-colors duration-300 ${rowBg}`}
                    >
                      <td className={`px-3 py-3 text-center sticky left-0 z-10 text-[12px] font-bold text-amber-800/50 dark:text-amber-400/50 w-14 ${isDirty ? "bg-amber-50 dark:bg-[#2A2318]" : "bg-white dark:bg-[#1C1917]"}`}>
                        {idx + 1}
                      </td>
                      <td className={`px-4 py-3 sticky left-[56px] z-10 ${isDirty ? "bg-amber-50 dark:bg-[#2A2318]" : "bg-white dark:bg-[#1C1917]"}`}>
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-200 dark:border-stone-700 flex-shrink-0 bg-stone-100">
                            <img src={s.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[14px] font-bold text-stone-800 dark:text-stone-100 truncate">
                              {s.tenThanh ? <span className="text-stone-500 font-medium mr-1">{s.tenThanh}</span> : ""}{s.hoTen}
                            </p>
                          </div>
                        </div>
                      </td>
                      {STATUS_CYCLE.map((k) => {
                        const active = status === k;
                        return (
                          <td key={k} className="px-2 py-3 text-center">
                            <button type="button" onClick={() => setOne(s.username, k)}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto transition-all duration-300 active:scale-[0.9] ${
                                active ? `${ATTENDANCE_STATUS[k].color} shadow-sm scale-110` : "bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700"
                              }`}>
                              {active && <Check className="w-4 h-4 text-white drop-shadow-sm" strokeWidth={3} />}
                            </button>
                          </td>
                        );
                      })}
                    </motion.tr>
                  );
                })}
                {rosterStudents.length === 0 && (
                  <tr>
                    <td colSpan={2 + STATUS_CYCLE.length} className="text-center text-[14px] text-stone-500 py-12">
                      Lớp chưa có học sinh nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}