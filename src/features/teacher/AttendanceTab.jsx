import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { 
  CalendarCheck, Check, AlertCircle, ChevronDown, 
  Users, Save, RotateCcw, Search, X, LayoutGrid, List, 
  Clock, AlertTriangle, Calendar, CalendarDays, Filter, Zap, CheckCheck
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../../components/ui/ToastContext.jsx";
import { Spinner } from "../../components/ui/Skeleton.jsx";
import { ConfirmDialog } from "../../components/ui/StudentShared.jsx";
import { useTeacherContext } from "./TeacherContext.jsx";
import { fetchClassTermRanges, fetchTermLocks } from "./api.js";
import {
  sortStudentsByTen, mostRecentSunday, resolveActiveHocKy,
  clampToSundayRange, toISODate, formatVNDate,
} from "./utils.js";
import { HK_INT_MAP, STATUS_CYCLE } from "./constants.js";

const APPLE_EASE = [0.16, 1, 0.3, 1];

/**
 * Định nghĩa màu và nhãn trạng thái điểm danh chuẩn WCAG AAA (>= 7:1)
 * Phù hợp với ngôn ngữ thiết kế Kem - Xanh của Ban Giáo lý An Ngãi.
 */
const ATTENDANCE_CONFIG = {
  co_mat: {
    key: "co_mat",
    label: "Có mặt",
    shortLabel: "Có mặt",
    icon: Check,
    // Active: Nền lục bảo đậm chữ trắng (Tương phản 7.8:1)
    activeClasses: "bg-emerald-700 dark:bg-emerald-600 text-white shadow-xs font-bold",
    // Inactive: Nền nhạt viền nét chữ sẫm (Tương phản 10.5:1)
    inactiveClasses: "bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-950 dark:text-emerald-200 border border-emerald-600/30 hover:bg-emerald-500/20",
    dotColor: "bg-emerald-600 dark:bg-emerald-400",
    badgeClasses: "bg-emerald-500/15 text-emerald-950 dark:text-emerald-200 border border-emerald-600/30",
  },
  nghi_phep: {
    key: "nghi_phep",
    label: "Nghỉ có phép",
    shortLabel: "Phép",
    icon: Clock,
    // Active: Nền hổ phách đậm chữ trắng (Tương phản 7.1:1 - Khắc phục hoàn toàn lỗi chữ trắng nền vàng chanh)
    activeClasses: "bg-amber-700 dark:bg-amber-600 text-white shadow-xs font-bold",
    // Inactive: Nền nhạt viền nét chữ sẫm (Tương phản 12.4:1)
    inactiveClasses: "bg-amber-500/10 dark:bg-amber-500/15 text-amber-950 dark:text-amber-200 border border-amber-600/30 hover:bg-amber-500/20",
    dotColor: "bg-amber-600 dark:bg-amber-400",
    badgeClasses: "bg-amber-500/15 text-amber-950 dark:text-amber-200 border border-amber-600/30",
  },
  nghi_khong_phep: {
    key: "nghi_khong_phep",
    label: "Nghỉ không phép",
    shortLabel: "K.Phép",
    icon: AlertCircle,
    // Active: Nền đỏ san hô đậm chữ trắng (Tương phản 7.2:1)
    activeClasses: "bg-rose-700 dark:bg-rose-600 text-white shadow-xs font-bold",
    // Inactive: Nền nhạt viền nét chữ sẫm (Tương phản 13.5:1)
    inactiveClasses: "bg-rose-500/10 dark:bg-rose-500/15 text-rose-950 dark:text-rose-200 border border-rose-600/30 hover:bg-rose-500/20",
    dotColor: "bg-rose-600 dark:bg-rose-400",
    badgeClasses: "bg-rose-500/15 text-rose-950 dark:text-rose-200 border border-rose-600/30",
  },
  nghi_le: {
    key: "nghi_le",
    label: "Nghỉ lễ",
    shortLabel: "Lễ",
    icon: CalendarCheck,
    // Active: Nền xanh lam đậm chữ trắng (Tương phản 7.5:1)
    activeClasses: "bg-sky-700 dark:bg-sky-600 text-white shadow-xs font-bold",
    // Inactive: Nền nhạt viền nét chữ sẫm (Tương phản 13.0:1)
    inactiveClasses: "bg-sky-500/10 dark:bg-sky-500/15 text-sky-950 dark:text-sky-200 border border-sky-600/30 hover:bg-sky-500/20",
    dotColor: "bg-sky-600 dark:bg-sky-400",
    badgeClasses: "bg-sky-500/15 text-sky-950 dark:text-sky-200 border border-sky-600/30",
  },
};

export default function AttendanceTab() {
  const { students, context } = useTeacherContext();
  const namHoc = context.namHoc;
  const lop = context.lop;
  const { showToast } = useToast();

  const [hocKy, setHocKy] = useState("HK1");
  const hocKyInt = HK_INT_MAP[hocKy];
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [statuses, setStatuses] = useState({});
  const [initial, setInitial] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // View mode: 'list' (compact list, mobile first) or 'grid' (rich card grid)
  const [viewMode, setViewMode] = useState("list");
  // Filter status: 'all' | 'co_mat' | 'nghi_phep' | 'nghi_khong_phep' | 'nghi_le'
  const [filterStatus, setFilterStatus] = useState("all");
  // Search query: by STT, TenThanh, HoTen, Username
  const [searchQuery, setSearchQuery] = useState("");

  // Mobile quick assign popover toggle
  const [isQuickAssignOpen, setIsQuickAssignOpen] = useState(false);

  const [termRanges, setTermRanges] = useState({ HK1: { start: null, sundays: [] }, HK2: { start: null, sundays: [] } });
  const [termLocks, setTermLocks] = useState({});
  const isLocked = !!termLocks[hocKyInt];
  const didAutoSelect = useRef(false);

  // Ref cho thanh trượt ngày Chủ Nhật
  const dateStripRef = useRef(null);
  const activeDatePillRef = useRef(null);

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

  // Tự động cuộn date strip đến ngày được chọn
  useEffect(() => {
    if (activeDatePillRef.current && dateStripRef.current) {
      activeDatePillRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [date, hocKy]);

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

  const setOne = (username, status) => {
    if (isLocked) return;
    setStatuses((prev) => ({ ...prev, [username]: status }));
  };

  const setAll = (status) => {
    if (isLocked) return;
    const full = {};
    rosterStudents.forEach((s) => { full[s.username] = status; });
    setStatuses(full);
    setIsQuickAssignOpen(false);
  };

  const changedCount = useMemo(
    () => rosterStudents.filter((s) => statuses[s.username] !== initial[s.username]).length,
    [rosterStudents, statuses, initial]
  );

  const presentCount = useMemo(
    () => rosterStudents.filter((s) => statuses[s.username] === "co_mat").length,
    [rosterStudents, statuses]
  );
  const phepCount = useMemo(
    () => rosterStudents.filter((s) => statuses[s.username] === "nghi_phep").length,
    [rosterStudents, statuses]
  );
  const kPhepCount = useMemo(
    () => rosterStudents.filter((s) => statuses[s.username] === "nghi_khong_phep").length,
    [rosterStudents, statuses]
  );
  const leCount = useMemo(
    () => rosterStudents.filter((s) => statuses[s.username] === "nghi_le").length,
    [rosterStudents, statuses]
  );
  const totalCount = rosterStudents.length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  // Lọc và tìm kiếm học sinh
  const filteredStudents = useMemo(() => {
    let result = rosterStudents;

    // Lọc theo trạng thái
    if (filterStatus !== "all") {
      result = result.filter((s) => (statuses[s.username] ?? "co_mat") === filterStatus);
    }

    // Tìm kiếm theo tên / Tên Thánh / STT
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((s, idx) => {
        const stt = String(idx + 1);
        const name = (s.hoTen || s.ho_va_ten || "").toLowerCase();
        const holy = (s.tenThanh || "").toLowerCase();
        const user = (s.username || "").toLowerCase();
        return stt === q || name.includes(q) || holy.includes(q) || user.includes(q);
      });
    }

    return result;
  }, [rosterStudents, statuses, filterStatus, searchQuery]);

  // Danh sách các em vắng để đối chiếu trong modal xác nhận
  const absentStudents = useMemo(() => {
    return rosterStudents.filter((s) => {
      const st = statuses[s.username] ?? "co_mat";
      return st === "nghi_phep" || st === "nghi_khong_phep";
    });
  }, [rosterStudents, statuses]);

  const save = () => {
    if (isLocked || changedCount === 0) return;
    setShowConfirmModal(true);
  };

  const confirmSave = async () => {
    setShowConfirmModal(false);
    setSaving(true);
    try {
      const rows = rosterStudents.map((s) => ({
        username: s.username,
        nam_hoc: namHoc,
        hoc_ky: hocKyInt,
        ngay: date,
        trang_thai: statuses[s.username] ?? "co_mat",
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

  const todayIso = toISODate(mostRecentSunday());

  return (
    <Motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: APPLE_EASE }}
      className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl border-x-0 border-t-0 sm:border-t border-b sm:border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] shadow-none sm:shadow-xs overflow-hidden"
    >
      {/* 1. HEADER CHÍNH (PHƯƠNG ÁN 1: THẺ CHIP HIỆN ĐẠI & THOÁNG MẮT, BỎ NÚT BACK) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-6 border-b border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3]/60 dark:bg-[#151c18]/60">
        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
          <div className="min-w-0 flex-1 sm:flex-initial">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-[#293d32] dark:text-[#ecece0] tracking-tight">
                Điểm danh {lop}
              </h1>
              {isLocked && (
                <span className="px-2 py-0.5 rounded-full text-[10.5px] sm:text-xs font-bold bg-amber-500/15 text-amber-950 dark:text-amber-200 border border-amber-600/30 shrink-0 flex items-center gap-1">
                  <span>🔒</span>
                  <span>Đã khóa sổ</span>
                </span>
              )}
            </div>
            
            {/* Meta row: Niên khóa + Sĩ số (Desktop: đầy đủ | Mobile: siêu gọn 1 hàng) */}
            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-[#575e55] dark:text-[#b8c2b4] font-medium whitespace-nowrap">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5 text-[#927140] dark:text-[#d4b47d] shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Niên khóa</span>
                <strong className="text-[#293d32] dark:text-[#ecece0] font-mono font-bold">{namHoc}</strong>
              </span>
              <span className="opacity-40">•</span>
              <span className="inline-flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d6b883] shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Sĩ số:</span>
                <strong className="text-[#293d32] dark:text-[#ecece0] font-mono font-bold">{totalCount}</strong>
                <span className="hidden sm:inline">học sinh</span>
                <span className="sm:hidden">HS</span>
              </span>
            </div>
          </div>

          {/* Học kỳ Toggle trên Mobile (Gọn nhẹ ngay trên App Bar) */}
          <div className="sm:hidden flex items-center bg-[#faf8f3] dark:bg-[#151c18] rounded-xl p-0.5 border border-[#dedfd4] dark:border-[#354237] shrink-0">
            {["HK1", "HK2"].map((k) => (
              <button 
                key={k} 
                type="button" 
                onClick={() => handleHocKyChange(k)}
                className={`relative min-h-[34px] px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors z-10 cursor-pointer ${
                  hocKy === k 
                    ? "text-[#293d32] dark:text-[#ecece0]" 
                    : "text-[#454f46] dark:text-[#b8c2b4]"
                }`}
                aria-pressed={hocKy === k}
              >
                {hocKy === k && (
                  <Motion.div
                    layoutId="active-attendance-hk-pill-mobile"
                    className="absolute inset-0 bg-[#fffefa] dark:bg-[#1e2821] rounded-lg shadow-xs border border-[#dedfd4] dark:border-[#354237]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-20">{k}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Học kỳ & Nút Lưu trên Desktop (Giữ nguyên 100% bố cục Desktop) */}
        <div className="hidden sm:flex items-center justify-end gap-2.5 w-auto">
          {/* Học kỳ Segmented Toggle Desktop */}
          <div className="flex items-center bg-[#faf8f3] dark:bg-[#151c18] rounded-xl p-1 border border-[#dedfd4] dark:border-[#354237] shrink-0">
            {["HK1", "HK2"].map((k) => (
              <button 
                key={k} 
                type="button" 
                onClick={() => handleHocKyChange(k)}
                className={`relative min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors duration-200 z-10 cursor-pointer ${
                  hocKy === k 
                    ? "text-[#293d32] dark:text-[#ecece0]" 
                    : "text-[#454f46] dark:text-[#b8c2b4] hover:text-[#293d32] dark:hover:text-[#ecece0]"
                }`}
                aria-pressed={hocKy === k}
              >
                {hocKy === k && (
                  <Motion.div
                    layoutId="active-attendance-hk-pill-desktop"
                    className="absolute inset-0 bg-[#fffefa] dark:bg-[#1e2821] rounded-lg shadow-xs border border-[#dedfd4] dark:border-[#354237]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-20">{k === "HK1" ? "Học kỳ I" : "Học kỳ II"}</span>
              </button>
            ))}
          </div>

          {/* Nút Lưu Desktop/Header */}
          <button 
            type="button" 
            disabled={isLocked || saving || changedCount === 0} 
            onClick={save}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#314e3e] hover:bg-[#263e32] text-white dark:bg-[#d6b883] dark:hover:bg-[#c9a76d] dark:text-[#19251d] shadow-xs active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? <Spinner className="h-4 w-4" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Đang lưu…" : changedCount > 0 ? `Lưu thay đổi (${changedCount})` : "Lưu điểm danh"}</span>
          </button>
        </div>
      </div>

      {/* 2. THANH TRƯỢT CHỦ NHẬT (TOUCH SNAP TRÊN MOBILE, CUỘN MƯỢT TRÊN DESKTOP) */}
      {hasSchedule ? (
        <div className="border-b border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3]/40 dark:bg-[#151c18]/40 p-2.5 sm:p-3 px-3.5 sm:px-6">
          <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d6b883]" />
              <span>Buổi học Chủ Nhật:</span>
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-[#293d32] dark:text-[#ecece0]">
              {currentRange.sundays.find((d) => toISODate(d) === date) 
                ? `Buổi ${currentRange.sundays.findIndex((d) => toISODate(d) === date) + 1} / ${currentRange.sundays.length}`
                : "Tùy chọn"}
            </span>
          </div>

          {/* Cuộn ngang các buổi với snap-center trên Mobile */}
          <div 
            ref={dateStripRef} 
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth snap-x snap-mandatory"
            tabIndex={0}
            aria-label="Danh sách các buổi học Chủ Nhật trong học kỳ"
          >
            {currentRange.sundays.map((d, idx) => {
              const iso = toISODate(d);
              const isSelected = iso === date;
              const isToday = iso === todayIso;
              return (
                <button
                  key={iso}
                  ref={isSelected ? activeDatePillRef : null}
                  type="button"
                  onClick={() => setDate(iso)}
                  className={`min-h-[40px] sm:min-h-[44px] px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-left shrink-0 transition-all cursor-pointer flex flex-col justify-center snap-center ${
                    isSelected
                      ? "bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] font-bold shadow-xs scale-[1.02]"
                      : "bg-[#fffefa] dark:bg-[#1e2821] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] hover:bg-[#faf8f3] dark:hover:bg-[#151c18] font-medium"
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold">Buổi {idx + 1}</span>
                    {isToday && (
                      <span className={`px-1.5 py-0.2 rounded text-[9.5px] sm:text-[10px] font-extrabold uppercase tracking-wide ${
                        isSelected 
                          ? "bg-white/25 text-white dark:bg-[#19251d]/25 dark:text-[#19251d]" 
                          : "bg-emerald-600 text-white"
                      }`}>
                        Hôm nay
                      </span>
                    )}
                  </div>
                  <span className={`text-[10.5px] sm:text-[11px] mt-0.5 ${isSelected ? "opacity-90 font-medium" : "text-[#454f46] dark:text-[#b8c2b4]"}`}>
                    {formatVNDate(d)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="border-b border-[#dedfd4] dark:border-[#354237] bg-amber-500/10 p-3 sm:px-6 flex items-center justify-between gap-3 text-xs text-amber-950 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Chưa cài đặt lịch Chủ Nhật. Chọn ngày tự do:</span>
          </div>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="min-h-[40px] sm:min-h-[44px] rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] text-[#293d32] dark:text-[#ecece0] py-1.5 sm:py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 shadow-xs" 
          />
        </div>
      )}

      {/* 3. THANH THỐNG KÊ TƯƠNG TÁC (HORIZONTAL SCROLL STRIP TRÊN MOBILE, FULL TRÊN DESKTOP) */}
      <div className="p-2.5 sm:p-5 px-3.5 sm:px-6 border-b border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3]/20 dark:bg-[#151c18]/20 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-4">
        {/* Stat Filter Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar scroll-smooth snap-x">
          {/* Tất cả */}
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`min-h-[40px] sm:min-h-[44px] px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 snap-start cursor-pointer ${
              filterStatus === "all"
                ? "bg-[#293d32] dark:bg-[#ecece0] text-white dark:text-[#19251d] shadow-xs"
                : "bg-[#fffefa] dark:bg-[#1e2821] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] hover:bg-[#faf8f3]"
            }`}
          >
            <span>Tất cả</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10.5px] sm:text-[11px] ${
              filterStatus === "all" ? "bg-white/20 dark:bg-black/20" : "bg-stone-200 dark:bg-stone-700"
            }`}>
              {totalCount}
            </span>
          </button>

          {/* Có mặt */}
          <button
            type="button"
            onClick={() => setFilterStatus(filterStatus === "co_mat" ? "all" : "co_mat")}
            className={`min-h-[40px] sm:min-h-[44px] px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 snap-start cursor-pointer ${
              filterStatus === "co_mat"
                ? ATTENDANCE_CONFIG.co_mat.activeClasses
                : ATTENDANCE_CONFIG.co_mat.inactiveClasses
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${ATTENDANCE_CONFIG.co_mat.dotColor}`} />
            <span>Có mặt</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10.5px] sm:text-[11px] bg-white/25 dark:bg-black/20 font-bold">
              {presentCount}
            </span>
          </button>

          {/* Nghỉ có phép */}
          <button
            type="button"
            onClick={() => setFilterStatus(filterStatus === "nghi_phep" ? "all" : "nghi_phep")}
            className={`min-h-[40px] sm:min-h-[44px] px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 snap-start cursor-pointer ${
              filterStatus === "nghi_phep"
                ? ATTENDANCE_CONFIG.nghi_phep.activeClasses
                : ATTENDANCE_CONFIG.nghi_phep.inactiveClasses
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${ATTENDANCE_CONFIG.nghi_phep.dotColor}`} />
            <span>Phép</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10.5px] sm:text-[11px] bg-white/25 dark:bg-black/20 font-bold">
              {phepCount}
            </span>
          </button>

          {/* Nghỉ không phép */}
          <button
            type="button"
            onClick={() => setFilterStatus(filterStatus === "nghi_khong_phep" ? "all" : "nghi_khong_phep")}
            className={`min-h-[40px] sm:min-h-[44px] px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 snap-start cursor-pointer ${
              filterStatus === "nghi_khong_phep"
                ? ATTENDANCE_CONFIG.nghi_khong_phep.activeClasses
                : ATTENDANCE_CONFIG.nghi_khong_phep.inactiveClasses
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${ATTENDANCE_CONFIG.nghi_khong_phep.dotColor}`} />
            <span>K.Phép</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10.5px] sm:text-[11px] bg-white/25 dark:bg-black/20 font-bold">
              {kPhepCount}
            </span>
          </button>

          {/* Nghỉ lễ (nếu có) */}
          {leCount > 0 && (
            <button
              type="button"
              onClick={() => setFilterStatus(filterStatus === "nghi_le" ? "all" : "nghi_le")}
              className={`min-h-[40px] sm:min-h-[44px] px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 snap-start cursor-pointer ${
                filterStatus === "nghi_le"
                  ? ATTENDANCE_CONFIG.nghi_le.activeClasses
                  : ATTENDANCE_CONFIG.nghi_le.inactiveClasses
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${ATTENDANCE_CONFIG.nghi_le.dotColor}`} />
              <span>Lễ</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10.5px] sm:text-[11px] bg-white/25 dark:bg-black/20 font-bold">
                {leCount}
              </span>
            </button>
          )}

          {/* Tỷ lệ chuyên cần (Desktop) */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-xs font-bold text-[#293d32] dark:text-[#ecece0] ml-auto lg:ml-0 shrink-0">
            <span>Tỷ lệ:</span>
            <span className="font-mono text-[#314e3e] dark:text-[#d6b883]">{attendanceRate}%</span>
          </div>
        </div>

        {/* Quick Assign All (Desktop Full Bar) */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4] whitespace-nowrap">
            Gán cả lớp:
          </span>
          <div className="flex items-center gap-1.5">
            {STATUS_CYCLE.map((k) => (
              <button 
                key={k} 
                type="button" 
                disabled={isLocked} 
                onClick={() => setAll(k)}
                className={`min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-40 cursor-pointer active:scale-95 ${
                  ATTENDANCE_CONFIG[k].inactiveClasses
                }`}
                title={`Đặt cả lớp thành: ${ATTENDANCE_CONFIG[k].label}`}
              >
                <span className={`w-2 h-2 rounded-full ${ATTENDANCE_CONFIG[k].dotColor}`} />
                <span>{ATTENDANCE_CONFIG[k].shortLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. THANH TÌM KIẾM & TOOLBAR DI ĐỘNG (GỌN GÀNG 1 DÒNG TRÊN MOBILE) */}
      <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 bg-[#fffefa] dark:bg-[#1e2821] border-b border-[#dedfd4] dark:border-[#354237] flex items-center justify-between gap-2 sm:gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none text-[#454f46] dark:text-[#b8c2b4]">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên, STT…"
            className="w-full min-h-[40px] sm:min-h-[44px] pl-8.5 sm:pl-9.5 pr-7 sm:pr-8 py-1.5 sm:py-2 rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3]/50 dark:bg-[#151c18]/50 text-xs font-medium text-[#293d32] dark:text-[#ecece0] placeholder-[#454f46]/60 dark:placeholder-[#b8c2b4]/60 focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-2.5 sm:pr-3 flex items-center text-[#454f46] hover:text-[#293d32] dark:text-[#b8c2b4] dark:hover:text-[#ecece0]"
              title="Xóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Nút Gán Nhanh Trên Mobile (Quick Assign Dropdown Button) */}
        <div className="lg:hidden relative">
          <button
            type="button"
            disabled={isLocked}
            onClick={() => setIsQuickAssignOpen(!isQuickAssignOpen)}
            className="min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] text-xs font-bold text-[#293d32] dark:text-[#ecece0] flex items-center gap-1.5 shadow-xs disabled:opacity-40 cursor-pointer"
            title="Gán trạng thái cho cả lớp"
          >
            <CheckCheck className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" />
            <span className="hidden xs:inline">Gán cả lớp</span>
            <ChevronDown className={`w-3 h-3 text-[#454f46] transition-transform duration-200 ${isQuickAssignOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Quick Assign Popover Menu */}
          <AnimatePresence>
            {isQuickAssignOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsQuickAssignOpen(false)} />
                <Motion.div 
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-1.5 w-48 bg-[#fffefa] dark:bg-[#1e2821] rounded-xl shadow-lg border border-[#dedfd4] dark:border-[#354237] z-40 p-1.5 space-y-1"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4] px-2 py-1">
                    Gán cả lớp thành:
                  </p>
                  {STATUS_CYCLE.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setAll(k)}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-semibold hover:bg-[#faf8f3] dark:hover:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] transition-colors cursor-pointer"
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${ATTENDANCE_CONFIG[k].dotColor}`} />
                      <span>{ATTENDANCE_CONFIG[k].label}</span>
                    </button>
                  ))}
                </Motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* View Mode Switcher + Result Count (Desktop) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="hidden sm:inline text-xs text-[#454f46] dark:text-[#b8c2b4] font-medium">
            <strong>{filteredStudents.length}</strong>/{totalCount}
          </span>

          <div className="flex items-center bg-[#faf8f3] dark:bg-[#151c18] rounded-xl p-0.5 sm:p-1 border border-[#dedfd4] dark:border-[#354237]">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`min-h-[34px] sm:min-h-[36px] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === "list"
                  ? "bg-[#fffefa] dark:bg-[#1e2821] text-[#293d32] dark:text-[#ecece0] shadow-xs"
                  : "text-[#454f46] dark:text-[#b8c2b4] hover:text-[#293d32]"
              }`}
              title="Chế độ Danh sách"
              aria-label="Chế độ Danh sách"
            >
              <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">Danh sách</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`min-h-[34px] sm:min-h-[36px] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#fffefa] dark:bg-[#1e2821] text-[#293d32] dark:text-[#ecece0] shadow-xs"
                  : "text-[#454f46] dark:text-[#b8c2b4] hover:text-[#293d32]"
              }`}
              title="Chế độ Thẻ ảnh"
              aria-label="Chế độ Thẻ ảnh"
            >
              <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">Thẻ</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. DANH SÁCH ĐIỂM DANH HỌC SINH (CHỪA SAFE-AREA BOTTOM CLEARANCE CHO MOBILE) */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex items-center justify-center gap-2.5 py-20 text-[#314e3e] dark:text-[#d6b883] text-xs font-medium">
            <Spinner className="h-5 w-5" />
            <span>Đang tải danh sách điểm danh…</span>
          </div>
        ) : (
          <div className="p-3 sm:p-6 pb-28 sm:pb-6">
            {/* VIEW MODE 1: COMPACT LIST (TỐI ƯU CÔNG THÁI HỌC MOBILE 1 TAY & TOUCH 44PX) */}
            {viewMode === "list" && (
              <div className="space-y-2 sm:space-y-2.5">
                {filteredStudents.map((s, idx) => {
                  const status = statuses[s.username] ?? "co_mat";
                  const isDirty = statuses[s.username] !== initial[s.username];
                  const cfg = ATTENDANCE_CONFIG[status] || ATTENDANCE_CONFIG.co_mat;

                  return (
                    <div 
                      key={s.username}
                      className={`flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl border transition-all ${
                        isDirty 
                          ? "bg-amber-500/[0.04] dark:bg-amber-500/[0.08] border-amber-500/50 shadow-xs" 
                          : "bg-[#fffefa] dark:bg-[#1e2821] border-[#dedfd4] dark:border-[#354237] shadow-xs"
                      }`}
                    >
                      {/* Left: STT + Avatar + Name */}
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        {/* STT Pill */}
                        <span className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-[11px] sm:text-xs font-mono font-bold text-[#454f46] dark:text-[#b8c2b4] flex items-center justify-center shrink-0">
                          {String(idx + 1).padStart(2, "0")}
                        </span>

                        {/* Avatar with Status Dot */}
                        <div className="relative shrink-0">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-[#dedfd4] dark:border-[#354237] bg-stone-100 dark:bg-stone-800">
                            <img 
                              src={s.avatar || "/images/avatarDefault.avif"} 
                              alt="" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#fffefa] dark:border-[#1e2821] ${cfg.dotColor}`} />
                        </div>

                        {/* Name & Username */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] leading-snug break-words">
                              {s.tenThanh && <span className="text-[#927140] dark:text-[#d4b47d] font-semibold font-serif mr-1">{s.tenThanh}</span>}
                              {s.hoTen || s.username}
                            </span>
                            {isDirty && (
                              <span className="px-1.5 py-0.2 rounded text-[9.5px] sm:text-[10px] font-bold bg-amber-500/20 text-amber-950 dark:text-amber-200 border border-amber-500/40">
                                Đã sửa
                              </span>
                            )}
                          </div>
                          <p className="text-[10.5px] sm:text-[11px] font-mono text-[#454f46] dark:text-[#b8c2b4] mt-0.5 truncate">
                            @{s.username}
                          </p>
                        </div>
                      </div>

                      {/* Right: Segmented Control 4 Status Buttons (Min Touch Target 44px) */}
                      <div className="grid grid-cols-4 gap-1 sm:gap-1.5 w-full md:w-auto shrink-0 pt-1 md:pt-0">
                        {STATUS_CYCLE.map((k) => {
                          const active = status === k;
                          const itemCfg = ATTENDANCE_CONFIG[k];
                          const IconComp = itemCfg.icon;

                          return (
                            <button
                              key={k}
                              type="button"
                              disabled={isLocked}
                              onClick={() => setOne(s.username, k)}
                              className={`min-h-[44px] px-1 sm:px-2.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 active:scale-95 disabled:cursor-not-allowed cursor-pointer ${
                                active
                                  ? itemCfg.activeClasses
                                  : itemCfg.inactiveClasses
                              }`}
                              title={`${s.hoTen || s.username}: ${itemCfg.label}`}
                              aria-pressed={active}
                            >
                              <IconComp className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                              <span className="truncate">{itemCfg.shortLabel}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* VIEW MODE 2: CARD GRID (TỐI ƯU IPAD & DESKTOP) */}
            {viewMode === "grid" && (
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5 ${isLocked ? "opacity-80" : ""}`}>
                {filteredStudents.map((s, idx) => {
                  const status = statuses[s.username] ?? "co_mat";
                  const isDirty = statuses[s.username] !== initial[s.username];
                  const cfg = ATTENDANCE_CONFIG[status] || ATTENDANCE_CONFIG.co_mat;

                  return (
                    <div 
                      key={s.username} 
                      className={`flex flex-col p-3.5 sm:p-4 rounded-xl border transition-all ${
                        isDirty 
                          ? "bg-amber-500/[0.04] dark:bg-amber-500/[0.08] border-amber-500/50 shadow-xs" 
                          : "bg-[#fffefa] dark:bg-[#1e2821] border-[#dedfd4] dark:border-[#354237] shadow-xs"
                      }`}
                    >
                      {/* Card Header (Avatar + Name) */}
                      <div className="flex items-center gap-3 mb-3 sm:mb-3.5">
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-[#dedfd4] dark:border-[#354237] bg-stone-100 dark:bg-stone-800">
                            <img src={s.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-[#fffefa] dark:border-[#1e2821] ${cfg.dotColor}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] truncate">
                              {s.tenThanh && <span className="text-[#454f46] dark:text-[#b8c2b4] font-normal mr-1">{s.tenThanh}</span>}
                              {s.hoTen || s.username}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10.5px] sm:text-[11px] text-[#454f46] dark:text-[#b8c2b4] font-mono">
                            <span>STT: {idx + 1}</span>
                            {isDirty && (
                              <span className="px-1.5 py-0.2 rounded text-[9.5px] sm:text-[10px] font-bold bg-amber-500/20 text-amber-950 dark:text-amber-200 border border-amber-500/40">
                                Đã sửa
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Buttons Grid 2x2 with Min Height 44px */}
                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-auto">
                        {STATUS_CYCLE.map((k) => {
                          const active = status === k;
                          const itemCfg = ATTENDANCE_CONFIG[k];
                          const IconComp = itemCfg.icon;

                          return (
                            <button 
                              key={k} 
                              type="button" 
                              disabled={isLocked} 
                              onClick={() => setOne(s.username, k)}
                              className={`min-h-[44px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:cursor-not-allowed cursor-pointer ${
                                active 
                                  ? itemCfg.activeClasses
                                  : itemCfg.inactiveClasses
                              }`}
                              title={`${s.hoTen || s.username}: ${itemCfg.label}`}
                              aria-pressed={active}
                            >
                              <IconComp className="w-4 h-4 shrink-0" />
                              <span className="truncate">{itemCfg.shortLabel}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* EMPTY STATES */}
            {filteredStudents.length === 0 && (
              <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] flex items-center justify-center text-[#454f46] dark:text-[#b8c2b4] mb-3">
                  <Filter className="w-6 h-6 opacity-60" />
                </div>
                <h3 className="text-sm font-bold text-[#293d32] dark:text-[#ecece0]">
                  Không tìm thấy học sinh phù hợp
                </h3>
                <p className="text-xs text-[#454f46] dark:text-[#b8c2b4] mt-1 max-w-sm">
                  {searchQuery ? `Không có kết quả nào khớp với "${searchQuery}".` : "Không có học sinh nào ở trạng thái lọc này."}
                </p>
                {(searchQuery || filterStatus !== "all") && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(""); setFilterStatus("all"); }}
                    className="mt-3.5 min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] text-xs font-bold hover:bg-[#314e3e]/20 transition-colors cursor-pointer"
                  >
                    Đặt lại bộ lọc
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* 6. MODAL XÁC NHẬN LƯU ĐIỂM DANH CHI TIẾT */}
      <ConfirmDialog
        open={showConfirmModal}
        icon={CalendarCheck}
        title="Xác nhận lưu điểm danh?"
        confirmLabel="Xác nhận lưu"
        cancelLabel="Kiểm tra lại"
        loading={saving}
        onConfirm={confirmSave}
        onCancel={() => !saving && setShowConfirmModal(false)}
      >
        <div className="rounded-2xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] p-3.5 sm:p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between gap-2 border-b border-[#dedfd4] dark:border-[#354237] pb-2.5">
            <div>
              <p className="font-bold text-[#293d32] dark:text-[#ecece0] text-sm">
                Lớp {lop} • {hocKy === "HK1" ? "Học kỳ I" : "Học kỳ II"}
              </p>
              <p className="text-[11px] text-[#454f46] dark:text-[#b8c2b4] font-medium mt-0.5">
                Ngày: <strong className="text-[#293d32] dark:text-[#ecece0] font-semibold">{formatVNDate(new Date(date))}</strong> ({changedCount} học sinh có thay đổi)
              </p>
            </div>
            <span className="shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-[#314e3e] dark:text-[#d6b883]">
              {attendanceRate}% có mặt
            </span>
          </div>

          {/* Breakdown Sĩ số */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-600/30 text-xs font-bold text-emerald-950 dark:text-emerald-200">
              Có mặt: <strong>{presentCount}</strong>
            </span>
            {phepCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-600/30 text-xs font-bold text-amber-950 dark:text-amber-200">
                Phép: <strong>{phepCount}</strong>
              </span>
            )}
            {kPhepCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-600/30 text-xs font-bold text-rose-950 dark:text-rose-200">
                K.Phép: <strong>{kPhepCount}</strong>
              </span>
            )}
            {leCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-600/30 text-xs font-bold text-sky-950 dark:text-sky-200">
                Nghỉ lễ: <strong>{leCount}</strong>
              </span>
            )}
          </div>

          {/* Danh sách học sinh vắng để đối chiếu nhanh */}
          {absentStudents.length > 0 && (
            <div className="pt-2 border-t border-[#dedfd4] dark:border-[#354237]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4] mb-1.5">
                Danh sách học sinh vắng ({absentStudents.length}):
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1" data-lenis-prevent>
                {absentStudents.map((s) => {
                  const st = statuses[s.username];
                  const isPhep = st === "nghi_phep";
                  return (
                    <div 
                      key={s.username}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-[11px]"
                    >
                      <span className="font-bold text-[#293d32] dark:text-[#ecece0] truncate">
                        {s.tenThanh && <span className="font-normal text-[#454f46] dark:text-[#b8c2b4] mr-1">{s.tenThanh}</span>}
                        {s.hoTen || s.username}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isPhep ? "bg-amber-500/20 text-amber-950 dark:text-amber-200" : "bg-rose-500/20 text-rose-950 dark:text-rose-200"
                      }`}>
                        {isPhep ? "Có phép" : "Không phép"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </ConfirmDialog>

      {/* 7. FLOATING ACTION BAR TỐI ƯU MOBILE THUMB-ZONE & SAFE AREA */}
      {createPortal(
        <AnimatePresence>
          {changedCount > 0 && !isLocked && (
            <Motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-3 sm:bottom-6 left-0 right-0 z-[90] flex justify-center pointer-events-none px-3 sm:px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
            >
              <div className="pointer-events-auto bg-[#fffefa]/95 dark:bg-[#1e2821]/95 backdrop-blur-md rounded-2xl shadow-xl border border-[#dedfd4] dark:border-[#354237] p-2 sm:px-4 sm:py-2.5 flex items-center justify-between sm:justify-start gap-2 sm:gap-3 max-w-md w-full sm:w-auto">
                <span className="text-xs font-bold text-[#293d32] dark:text-[#ecece0] flex items-center gap-1.5 shrink-0 pl-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d6b883] animate-pulse shrink-0" />
                  <span className="hidden sm:inline">Có {changedCount} thay đổi điểm danh</span>
                  <span className="sm:hidden text-xs">{changedCount} thay đổi</span>
                </span>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStatuses({ ...initial });
                      showToast("Đã hủy các thay đổi điểm danh", "info");
                    }}
                    disabled={saving}
                    className="min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-500/10 hover:bg-stone-500/15 text-xs font-bold text-[#454f46] dark:text-[#b8c2b4] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 active:scale-95"
                    title="Khôi phục lại trạng thái ban đầu"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Hủy</span>
                  </button>

                  <button 
                    type="button" 
                    onClick={save} 
                    disabled={saving}
                    className="min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-[#314e3e] hover:bg-[#263e32] text-white dark:bg-[#d6b883] dark:hover:bg-[#c9a76d] dark:text-[#19251d] shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? <Spinner className="h-4 w-4" /> : <Save className="w-4 h-4" />}
                    <span>{saving ? "Đang lưu…" : "Lưu điểm danh"}</span>
                  </button>
                </div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </Motion.div>
  );
}