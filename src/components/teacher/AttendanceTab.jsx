import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, ArrowLeft, Check, AlertCircle, ChevronDown, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../ui/ToastContext.jsx";
import { ATTENDANCE_STATUS } from "../ui/StudentShared.jsx";
import { Spinner } from "../ui/Skeleton.jsx";
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

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const selectedDateRef = useRef(null);
  const dropdownContainerRef = useRef(null);

  useEffect(() => {
    if (isDateDropdownOpen && selectedDateRef.current && dropdownContainerRef.current) {
      setTimeout(() => {
        const container = dropdownContainerRef.current;
        const element = selectedDateRef.current;
        // Tính toán vị trí cuộn cho container bên trong, không ảnh hưởng cuộn trang ngoài
        container.scrollTop = element.offsetTop - container.offsetTop - container.clientHeight / 2 + element.clientHeight / 2;
      }, 50);
    }
  }, [isDateDropdownOpen]);

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

  const presentCount = useMemo(
    () => rosterStudents.filter((s) => statuses[s.username] === "co_mat").length,
    [rosterStudents, statuses]
  );
  const phepCount = useMemo(() => rosterStudents.filter((s) => statuses[s.username] === "nghi_phep").length, [rosterStudents, statuses]);
  const kPhepCount = useMemo(() => rosterStudents.filter((s) => statuses[s.username] === "nghi_khong_phep").length, [rosterStudents, statuses]);
  const leCount = useMemo(() => rosterStudents.filter((s) => statuses[s.username] === "nghi_le").length, [rosterStudents, statuses]);
  const totalCount = rosterStudents.length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  const save = () => {
    if (isLocked || changedCount === 0) return;
    setShowConfirmModal(true);
  };

  const confirmSave = async () => {
    setShowConfirmModal(false);
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
      className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl sm:rounded-[28px] sm:border border-amber-900/10 dark:border-amber-100/10 sm:shadow-sm overflow-hidden"
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 sm:px-8 py-5 sm:py-6 border-b border-amber-900/10 dark:border-amber-100/10 bg-gradient-to-br from-stone-50/50 to-amber-50/30 dark:from-stone-900/50 dark:to-stone-800/30">
        
        <div className="flex items-center gap-4">
            <button type="button" onClick={onBack}
            className="inline-flex items-center justify-center gap-2 p-2.5 rounded-full text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-800 border border-black/5 dark:border-white/5 transition-all duration-300 active:scale-[0.98] md:hover:bg-stone-100 dark:md:hover:bg-stone-700 flex-shrink-0 shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-amber-950 dark:text-amber-50 font-serif leading-tight">
                  Điểm danh nhanh
              </h2>
              <p className="text-[13px] font-medium text-stone-500 mt-0.5 hidden sm:block">Thao tác nhanh chóng, lưu trữ tức thời</p>
            </div>
        </div>

        <div className="flex items-center justify-between gap-4 w-full sm:w-auto mt-2 sm:mt-0">
          {/* Progress Ring */}
          {totalCount > 0 && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-stone-200 dark:stroke-stone-750" strokeWidth="3.5" />
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-amber-500" strokeWidth="3.5" strokeDasharray={`${attendanceRate} 100`} strokeLinecap="round" />
                </svg>
                <span className="absolute text-[11px] font-extrabold text-amber-950 dark:text-amber-50">{attendanceRate}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-stone-800 dark:text-stone-200">{presentCount}/{totalCount}</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Có mặt</span>
              </div>
            </div>
          )}
          
          {/* Nút Bấm Chính */}
          <button type="button" disabled={isLocked || saving || changedCount === 0} onClick={save}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-sm transition-all duration-300 active:scale-[0.98] md:hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
            {saving && <Spinner className="h-4 w-4" />}
            {saving ? "Đang lưu…" : changedCount > 0 ? `Lưu thay đổi (${changedCount})` : "Lưu điểm danh"}
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 sm:px-8 py-3 bg-stone-50 dark:bg-stone-900/50 border-b border-amber-900/5 dark:border-amber-100/5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <div className="hidden sm:block">
            <CalendarCheck className="w-5 h-5 flex-shrink-0 text-amber-800/70 dark:text-amber-400/70" />
          </div>
          {hasSchedule ? (
            <div className="relative w-full sm:w-auto">
              <button 
                type="button" 
                onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                className="flex items-center justify-between w-full sm:w-auto min-w-[200px] rounded-xl border border-stone-200/60 dark:border-stone-700/50 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 py-2.5 sm:py-2 px-4 text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50 hover:border-amber-900/30 dark:hover:border-amber-100/30 transition-all shadow-sm"
              >
                <span>
                  {currentRange.sundays.find((d) => toISODate(d) === date) 
                    ? `Buổi ${currentRange.sundays.findIndex((d) => toISODate(d) === date) + 1} · ${formatVNDate(currentRange.sundays.find((d) => toISODate(d) === date))}`
                    : "Chọn ngày điểm danh"}
                </span>
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-300 ${isDateDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isDateDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsDateDropdownOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 mt-2 w-full sm:min-w-[240px] bg-white dark:bg-stone-800 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 z-40 overflow-hidden"
                    >
                      <div ref={dropdownContainerRef} className="max-h-[300px] overflow-y-auto overscroll-contain flex flex-col p-1.5" data-lenis-prevent>
                        {currentRange.sundays.map((d, idx) => {
                          const iso = toISODate(d);
                          const isSelected = iso === date;
                          return (
                            <button 
                              key={iso}
                              ref={isSelected ? selectedDateRef : null}
                              type="button"
                              onClick={() => { setDate(iso); setIsDateDropdownOpen(false); }}
                              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-left text-[13px] transition-colors ${
                                isSelected 
                                  ? "bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-400 font-bold" 
                                  : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700/50 font-medium"
                              }`}
                            >
                              <span>Buổi {idx + 1} · {formatVNDate(d)}</span>
                              {isSelected && <Check className="w-4 h-4" />}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-stone-200/60 dark:border-stone-700/50 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 py-2.5 sm:py-2 px-4 text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer hover:border-amber-900/30 dark:hover:border-amber-100/30 transition-all shadow-sm" />
          )}
          
          <div className="w-px h-6 bg-stone-300 dark:bg-stone-700 mx-1 hidden sm:block" />
          
          <div className="relative flex gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl shadow-inner border border-amber-900/10 dark:border-amber-100/10 w-full sm:w-fit shrink-0">
            {["HK1", "HK2"].map((k) => (
              <button key={k} type="button" onClick={() => handleHocKyChange(k)}
                className={`flex-1 sm:flex-none relative px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors duration-300 z-10 ${
                  hocKy === k 
                    ? "text-amber-950 dark:text-amber-50" 
                    : "text-stone-500 dark:text-stone-400 hover:text-amber-950 dark:hover:text-amber-50"
                }`}>
                {hocKy === k && (
                  <motion.div
                    layoutId="active-attendance-hk-tab"
                    className="absolute inset-0 bg-white dark:bg-stone-900 rounded-lg shadow-sm border border-amber-900/10 dark:border-amber-100/10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-20">{k === "HK1" ? "Học kỳ I" : "Học kỳ II"}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Đặt tất cả nhanh */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-amber-900/5 dark:border-amber-100/5 w-full sm:w-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 whitespace-nowrap">
            Gán nhanh:
          </span>
          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
            {STATUS_CYCLE.map((k) => (
              <button key={k} type="button" disabled={isLocked} onClick={() => setAll(k)}
                className="flex items-center justify-start gap-1.5 px-3 py-2 sm:h-8 rounded-xl sm:rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-amber-900/30 dark:hover:border-amber-100/30 transition-all shadow-sm disabled:opacity-50"
                title={`Đặt tất cả: ${ATTENDANCE_STATUS[k].label}`}>
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${ATTENDANCE_STATUS[k].color}`} />
                <span className="text-[12px] sm:text-[11px] font-bold text-stone-600 dark:text-stone-300">{ATTENDANCE_STATUS[k].label}</span>
              </button>
            ))}
          </div>
        </div>
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

      {/* GRID DANH SÁCH HỌC SINH */}
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
          
          <div className={`p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 ${isLocked ? "opacity-60" : ""}`}>
            {rosterStudents.map((s, idx) => {
              const status  = statuses[s.username] ?? "co_mat";
              const isDirty = statuses[s.username] !== initial[s.username];
              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }} 
                  whileInView={{ opacity: 1, scale: 1, y: 0 }} 
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.4, delay: (idx % 10) * 0.05, ease: APPLE_EASE }}
                  key={s.username} 
                  className={`relative flex flex-col p-4 sm:p-5 rounded-[20px] border transition-all duration-300 ${
                    isDirty 
                      ? "bg-amber-50/80 dark:bg-amber-900/20 border-amber-500/30 shadow-md shadow-amber-900/5" 
                      : "bg-white dark:bg-stone-800/80 border-stone-200/60 dark:border-stone-700/60 shadow-sm hover:shadow-md"
                  }`}
                >
                  {/* Card Header (Avatar + Name) */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="relative">
                      <div className={`absolute inset-0 rounded-full blur-sm opacity-40 transition-colors duration-300 ${ATTENDANCE_STATUS[status].color}`} />
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-stone-800 flex-shrink-0 bg-stone-100 shadow-sm z-10">
                        <img src={s.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-stone-900 z-20 transition-colors duration-300 ${ATTENDANCE_STATUS[status].color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-extrabold text-stone-800 dark:text-stone-100 font-serif">
                        {s.tenThanh ? <span className="text-stone-500 font-medium mr-1">{s.tenThanh}</span> : ""}{s.hoTen}
                      </p>
                      <p className="text-[12px] font-medium text-stone-500 dark:text-stone-400 mt-0.5">
                        STT: {idx + 1}
                      </p>
                    </div>
                  </div>

                  {/* Buttons Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    {STATUS_CYCLE.map((k) => {
                      const active = status === k;
                      return (
                        <button key={k} type="button" disabled={isLocked} onClick={() => setOne(s.username, k)}
                          className={`relative overflow-hidden flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all duration-300 active:scale-[0.95] disabled:cursor-not-allowed ${
                            active 
                              ? `${ATTENDANCE_STATUS[k].color} shadow-sm border border-black/5` 
                              : "bg-stone-100/80 dark:bg-stone-900/80 border border-stone-200/50 dark:border-stone-700/50 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400"
                          }`}>
                          {active && <Check className="w-3.5 h-3.5 text-white drop-shadow-sm" strokeWidth={3} />}
                          <span className={`text-[12px] font-bold tracking-wide ${active ? "text-white" : ""}`}>
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
              <div className="col-span-full py-20 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mb-4">
                  <CalendarCheck className="w-8 h-8 text-stone-400" />
                </div>
                <p className="text-[15px] font-bold text-stone-500">Lớp chưa có học sinh nào.</p>
              </div>
            )}
          </div>
          
          {/* INFO FOOTER */}
          {rosterStudents.length > 0 && (
            <div className="mt-8 mx-4 sm:mx-6 mb-24 px-4 py-3 bg-stone-100/50 dark:bg-stone-800/50 border border-stone-200/50 dark:border-stone-700/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
              <div className="flex flex-wrap items-center gap-4 text-[13px] font-medium text-stone-500 dark:text-stone-400">
                <span className="font-bold text-stone-800 dark:text-stone-200 mr-2">Chú giải:</span>
                {["co_mat", "nghi_phep", "nghi_khong_phep", "nghi_le"].map((k) => (
                  <div key={k} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${ATTENDANCE_STATUS[k].color}`} />
                    <span>{ATTENDANCE_STATUS[k].label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 text-[13px] font-bold">
                <div className="px-3 py-1 bg-stone-200/50 dark:bg-stone-700/50 rounded-lg text-stone-600 dark:text-stone-300">Tổng: {totalCount}</div>
                {phepCount > 0 && <div className="px-3 py-1 bg-[#FFD60A]/10 text-[#FFD60A] rounded-lg">P: {phepCount}</div>}
                {kPhepCount > 0 && <div className="px-3 py-1 bg-[#FF375F]/10 text-[#FF375F] rounded-lg">K: {kPhepCount}</div>}
                {leCount > 0 && <div className="px-3 py-1 bg-[#007AFF]/10 text-[#007AFF] rounded-lg">L: {leCount}</div>}
              </div>
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>

      {/* CONFIRM MODAL */}
      {createPortal(
        <AnimatePresence>
          {showConfirmModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowConfirmModal(false)}
                className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-sm bg-white dark:bg-stone-800 rounded-3xl shadow-2xl overflow-hidden border border-stone-200/50 dark:border-stone-700/50"
              >
                <div className="p-6">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-extrabold text-stone-800 dark:text-stone-100 mb-2 font-serif">Xác nhận thay đổi?</h3>
                  <p className="text-[14px] text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
                    Bạn đang thay đổi trạng thái điểm danh của <strong>{changedCount}</strong> học sinh. Hành động này sẽ được ghi nhận vào hệ thống.
                  </p>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowConfirmModal(false)}
                      className="flex-1 px-4 py-3 rounded-xl font-bold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-700/50 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                      Hủy bỏ
                    </button>
                    <button type="button" onClick={confirmSave}
                      className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-colors">
                      Lưu
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
      </AnimatePresence>,
      document.body
    )}

    {/* FLOATING SAVE BUTTON */}
    {createPortal(
      <AnimatePresence>
        {changedCount > 0 && !isLocked && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-[90]"
          >
            <button type="button" onClick={save} disabled={saving}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-full shadow-2xl bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white font-bold text-[15px] hover:scale-105 active:scale-95 transition-all duration-300">
              {saving ? <Spinner className="w-5 h-5" /> : <Check className="w-5 h-5 drop-shadow-sm" />}
              {saving ? "Đang lưu…" : `Lưu thay đổi (${changedCount})`}
            </button>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
  </motion.div>
);
}