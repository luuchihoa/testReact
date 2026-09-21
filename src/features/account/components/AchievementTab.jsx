import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  CalendarDays, Award, HeartHandshake, 
  Trophy, GraduationCap, CalendarCheck, Quote, CheckCircle2, AlertCircle, BookOpen, RotateCcw
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../lib/supabase.js";
import { AchievementSkeleton } from "../../../components/ui/Skeleton.jsx";
import { ScoreCell } from "./SharedComponents.jsx";
import { 
  getCurrentNamHoc, getCurrentSemester, normalizeSemester, pickRandom, 
  HK_INT_MAP, RANK_COLORS, ATTENDANCE_STATUS, GL_HOCLUC_COMMENTS, GL_HANHKIEM_COMMENTS,
  calculateAutoHocLuc, calculateAutoHanhKiem
} from "../utils.js";
import { fetchClassTermRanges, fetchAcademicHolidays } from "../../teacher/api.js";
import { buildSundayList, getDefaultTermRanges, parseISODate, toISODate } from "../../teacher/utils.js";

const getScoreTheme = (tb) => {
  if (tb === null || tb === undefined || tb === "" || tb === "—") {
    return {
      bg: "bg-[#faf8f3] dark:bg-[#151c18]",
      text: "text-[#293d32] dark:text-[#ecece0]",
      border: "border-[#616e5f]/40 dark:border-[#677765]/50",
      badgeBg: "bg-[#faf8f3] dark:bg-[#151c18]",
      label: "Chưa có",
    };
  }
  const n = Number(tb);
  if (n >= 8.0) {
    return {
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
      text: "text-[#064e3b] dark:text-[#6ee7b7]",
      border: "border-emerald-700/40 dark:border-emerald-400/40",
      badgeBg: "bg-emerald-100/90 dark:bg-emerald-900/80",
      label: "Giỏi",
    };
  }
  if (n >= 6.5) {
    return {
      bg: "bg-blue-50 dark:bg-blue-950/50",
      text: "text-[#1e3a8a] dark:text-[#93c5fd]",
      border: "border-blue-700/40 dark:border-blue-400/40",
      badgeBg: "bg-blue-100/90 dark:bg-blue-900/80",
      label: "Khá",
    };
  }
  if (n >= 5.0) {
    return {
      bg: "bg-amber-50 dark:bg-amber-950/50",
      text: "text-[#713f12] dark:text-[#fde047]",
      border: "border-amber-700/40 dark:border-amber-400/40",
      badgeBg: "bg-amber-100/90 dark:bg-amber-900/80",
      label: "TB",
    };
  }
  return {
    bg: "bg-red-50 dark:bg-red-950/50",
    text: "text-[#7f1d1d] dark:text-[#fca5a5]",
    border: "border-red-700/40 dark:border-red-400/40",
    badgeBg: "bg-red-100/90 dark:bg-red-900/80",
    label: "Yếu",
  };
};

async function fetchAchievementData(username, namHoc, hocKyInt) {
  const [gradesRes, termRes, attendanceRes, enrollmentRes, yearRes, classRanges, holidays] = await Promise.all([
    hocKyInt ? supabase.from("grades").select("diem_mieng, diem_vo, diem_15_phut, diem_1_tiet, diem_thi, diem_tb").eq("username", username).eq("nam_hoc", namHoc).eq("hoc_ky", hocKyInt).maybeSingle() : Promise.resolve({ data: null, error: null }),
    hocKyInt ? supabase.from("term_summary").select("hoc_luc, hanh_kiem, vi_thu, lop, nam_hoc, ghi_chu").eq("username", username).eq("nam_hoc", namHoc).eq("hoc_ky", hocKyInt).maybeSingle() : Promise.resolve({ data: null, error: null }),
    hocKyInt ? supabase.from("attendance").select("ngay, trang_thai").eq("username", username).eq("nam_hoc", namHoc).eq("hoc_ky", hocKyInt).order("ngay", { ascending: true }) : Promise.resolve({ data: [], error: null }),
    supabase.from("enrollments").select("lop, nam_hoc").eq("username", username).eq("nam_hoc", namHoc).maybeSingle(),
    supabase.from("year_summary").select("diem_tb, hoc_luc, hanh_kiem, vi_thu, ghi_chu, lop, nam_hoc").eq("username", username).eq("nam_hoc", namHoc).maybeSingle(),
    fetchClassTermRanges(null, namHoc),
    fetchAcademicHolidays(namHoc),
  ]);
  
  [gradesRes, termRes, attendanceRes, enrollmentRes, yearRes].forEach((r, i) => { if (r?.error) console.error(`fetchAchievementData[${i}] error:`, r.error); });
  
  return { 
    grades: gradesRes.data ?? null, 
    term: termRes.data ?? null, 
    attendance: attendanceRes.data ?? [], 
    enrollment: enrollmentRes.data ?? null, 
    yearSummary: yearRes.data ?? null,
    classRanges,
    holidays: holidays ?? [],
  };
}

export function AchievementTab({ user, cache, setCache }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultNamHoc = getCurrentNamHoc();
  const rawKy = searchParams.get("ky") || searchParams.get("hoc_ky") || searchParams.get("semester") || searchParams.get("hk");
  const semester = normalizeSemester(rawKy) || getCurrentSemester();
  const [namHoc] = useState(defaultNamHoc);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const setSemester = (value) => {
    setSearchParams((prev) => { 
      const next = new URLSearchParams(prev); 
      next.set("ky", value); 
      next.delete("hoc_ky");
      next.delete("semester");
      next.delete("hk");
      return next; 
    }, { replace: true });
  };

  const isYearView = semester === "NAM";
  const hocKyInt   = HK_INT_MAP[semester] ?? null;
  const cacheKey = `v3-${user?.username}-${namHoc}-${semester}`;
  const data = cache[cacheKey] ?? null;
  const loading = !data;

  const loadData = useCallback(async (force = false) => {
    const username = user?.username;
    if (!username) return;
    if (!force && cache[cacheKey]) return;

    if (force) setIsRefreshing(true);
    try {
      const result = await fetchAchievementData(username, namHoc, hocKyInt);
      setCache((prev) => ({ ...prev, [cacheKey]: result }));
    } catch (err) {
      console.error("load achievement data error:", err);
    } finally {
      if (force) setIsRefreshing(false);
    }
  }, [user?.username, namHoc, hocKyInt, cacheKey, cache, setCache]);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  const handleManualRefresh = () => {
    loadData(true);
  };

  const grades      = data?.grades      ?? {};
  const term        = data?.term        ?? {};
  const enrollment  = data?.enrollment  ?? {};
  const yearSummary = data?.yearSummary ?? null;
  const classRanges = data?.classRanges ?? null;

  const lop        = term.lop || enrollment.lop || yearSummary?.lop || "—";
  const displayNamHoc = term.nam_hoc || enrollment.nam_hoc || yearSummary?.nam_hoc || namHoc;
  const summarySource = isYearView ? (yearSummary ?? {}) : term;
  const currentTB = isYearView ? yearSummary?.diem_tb : grades?.diem_tb;
  const dtbTheme = getScoreTheme(currentTB);

  // Danh sách các buổi điểm danh (Ưu tiên Lịch Trung Tâm academic_calendars & Ngày nghỉ academic_holidays)
  const currentSemesterKey = hocKyInt === 2 ? "HK2" : "HK1";

  const attendanceList = useMemo(() => {
    if (isYearView) return [];

    let sundays = [];
    if (classRanges?.[currentSemesterKey]?.sundays?.length) {
      sundays = classRanges[currentSemesterKey].sundays;
    } else {
      const fallback = getDefaultTermRanges(namHoc)[currentSemesterKey];
      sundays = fallback.sundays;
    }

    const exceptionMap = new Map(
      (data?.attendance ?? []).map(({ ngay, trang_thai }) => [toISODate(ngay), trang_thai])
    );

    const holidayMap = new Map(
      (data?.holidays ?? [])
        .filter((h) => !h.hoc_ky || Number(h.hoc_ky) === Number(hocKyInt))
        .map((h) => [toISODate(h.ngay), h])
    );

    const todayIso = toISODate(new Date());

    // 1. Ánh xạ danh sách các ngày Chúa Nhật chuẩn từ khung lịch trung tâm
    const list = sundays.map((sDate) => {
      const dateObj = typeof sDate === "string" ? parseISODate(sDate) : (sDate instanceof Date ? sDate : new Date(sDate));
      const isoDate = toISODate(dateObj);
      const holiday = holidayMap.get(isoDate);
      const isPastOrToday = isoDate <= todayIso;

      // Ưu tiên:
      // 1. Bản ghi điểm danh cá nhân trong DB nếu có
      // 2. Nếu ngày này là ngày nghỉ trong academic_holidays:
      //    - ĐÃ QUA / HÔM NAY (isPastOrToday): ghi nhận "nghi_le"
      //    - CHƯA ĐẾN (tương lai): để "null" (không tính vào số buổi đã điểm danh, nhưng vẫn giữ holidayName để hiển thị trên timeline)
      // 3. Mặc định "null" (chưa điểm danh)
      let trang_thai = "null";
      if (exceptionMap.has(isoDate)) {
        trang_thai = exceptionMap.get(isoDate);
      } else if (holiday && isPastOrToday) {
        trang_thai = "nghi_le";
      }

      return {
        date: dateObj,
        isoDate,
        trang_thai,
        isPastOrToday,
        holidayName: holiday?.ten_ngay_le || "",
      };
    });

    // 2. Bổ sung các ngày nghỉ từ academic_holidays nếu không trùng với các ngày Chúa Nhật đã tạo
    const existingIsoDates = new Set(list.map((item) => item.isoDate));
    (data?.holidays ?? []).forEach((h) => {
      if (h.ngay && (!h.hoc_ky || Number(h.hoc_ky) === Number(hocKyInt))) {
        const iso = toISODate(h.ngay);
        if (iso && !existingIsoDates.has(iso)) {
          const d = parseISODate(h.ngay);
          if (!isNaN(d.getTime())) {
            const isPastOrToday = iso <= todayIso;
            let trang_thai = "null";
            if (exceptionMap.has(iso)) {
              trang_thai = exceptionMap.get(iso);
            } else if (isPastOrToday) {
              trang_thai = "nghi_le";
            }
            list.push({
              date: d,
              isoDate: iso,
              trang_thai,
              isPastOrToday,
              holidayName: h.ten_ngay_le || "Ngày nghỉ lễ",
            });
            existingIsoDates.add(iso);
          }
        }
      }
    });

    // 3. Bổ sung các ngày điểm danh bất thường khác (nếu có bản ghi trong DB ngoài danh sách)
    (data?.attendance ?? []).forEach(({ ngay, trang_thai }) => {
      if (ngay) {
        const iso = toISODate(ngay);
        if (iso && !existingIsoDates.has(iso)) {
          const d = parseISODate(ngay);
          if (!isNaN(d.getTime())) {
            const holiday = holidayMap.get(iso);
            const isPastOrToday = iso <= todayIso;
            list.push({
              date: d,
              isoDate: iso,
              trang_thai: trang_thai || (holiday && isPastOrToday ? "nghi_le" : "null"),
              isPastOrToday,
              holidayName: holiday?.ten_ngay_le || "",
            });
            existingIsoDates.add(iso);
          }
        }
      }
    });

    // Sắp xếp thứ tự thời gian tăng dần tuyệt đối theo chuỗi ngày ISO (YYYY-MM-DD)
    list.sort((a, b) => a.isoDate.localeCompare(b.isoDate));
    return list;
  }, [classRanges, currentSemesterKey, hocKyInt, namHoc, data?.attendance, data?.holidays, isYearView]);

  // Thống kê chuyên cần
  const attendanceCounts = useMemo(() => {
    const counts = { co_mat: 0, nghi_khong_phep: 0, nghi_phep: 0, nghi_le: 0, chua_cap_nhat: 0 };
    attendanceList.forEach(({ trang_thai }) => { 
      if (trang_thai === "co_mat") counts.co_mat++;
      else if (trang_thai === "nghi_khong_phep") counts.nghi_khong_phep++; 
      else if (trang_thai === "nghi_phep") counts.nghi_phep++; 
      else if (trang_thai === "nghi_le" || trang_thai === "le_trong") counts.nghi_le++;
      else counts.chua_cap_nhat++;
    });
    counts.tong_nghi = counts.nghi_khong_phep + counts.nghi_phep;
    counts.tong_da_diem_danh = counts.co_mat + counts.nghi_phep + counts.nghi_khong_phep + counts.nghi_le;
    return counts;
  }, [attendanceList]);

  const totalWeeks = attendanceList.length;
  const recordedCount = attendanceCounts.tong_da_diem_danh;
  const validPresentCount = attendanceCounts.co_mat + attendanceCounts.nghi_le;
  const attendanceRate = recordedCount > 0 
    ? Math.max(0, Math.min(100, Math.round((validPresentCount / recordedCount) * 100))) 
    : 0;
  const rateDisplay = recordedCount > 0 ? `${attendanceRate}%` : "—";

  // Tự động xét Học lực, Hạnh kiểm, Vị thứ (Ưu tiên dữ liệu chính thức từ DB, fallback tự động tính)
  const officialHocLuc = summarySource.hoc_luc && summarySource.hoc_luc !== "-" ? summarySource.hoc_luc : "";
  const autoHocLuc = calculateAutoHocLuc(currentTB);
  const displayHocLuc = officialHocLuc || autoHocLuc || "—";

  const officialHanhKiem = summarySource.hanh_kiem && summarySource.hanh_kiem !== "-" ? summarySource.hanh_kiem : "";
  const autoHanhKiem = calculateAutoHanhKiem(attendanceCounts);
  const displayHanhKiem = officialHanhKiem || autoHanhKiem || "—";

  const displayViThu = summarySource.vi_thu ? `#${summarySource.vi_thu}` : "—";

  const isFinal = Boolean(officialHocLuc && officialHanhKiem);
  const isAutoEvaluated = !isFinal && Boolean(autoHocLuc || autoHanhKiem);

  const hocLucText   = useMemo(() => pickRandom(GL_HOCLUC_COMMENTS[displayHocLuc]   || [""]), [displayHocLuc]);
  const hanhKiemText = useMemo(() => pickRandom(GL_HANHKIEM_COMMENTS[displayHanhKiem] || [""]), [displayHanhKiem]);

  const SEMESTER_OPTIONS = [
    { value: "HK1", label: "Học kỳ I" },
    { value: "HK2", label: "Học kỳ II" },
    { value: "NAM", label: "Cả năm" },
  ];

  return (
    <div className="flex flex-col gap-5 w-full min-w-0">
      {/* HEADER: Lớp, Niên khóa + 1-Tap Segmented Control & Nút Làm Mới */}
      <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] shadow-xs p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#314e3e]/10 dark:bg-[#d4b47d]/15 flex items-center justify-center text-[#314e3e] dark:text-[#d4b47d] border border-[#dedfd4] dark:border-[#354237] shrink-0">
            <GraduationCap className="w-5 h-5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-sm sm:text-base font-bold text-[#293d32] dark:text-[#ecece0] truncate leading-snug">
              {lop !== "—" ? `Lớp ${lop}` : "Chưa xếp lớp"}
            </p>
            <p className="text-xs font-medium text-[#575e55] dark:text-[#b0b9ac] truncate">
              {displayNamHoc ? `Niên khóa ${displayNamHoc}` : ""}
            </p>
          </div>
        </div>

        {/* 1-Tap Thumb-Friendly Segmented Pill Switcher & Refresh Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div 
            role="tablist" 
            aria-label="Chọn học kỳ"
            className="inline-flex p-1 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] flex-1 sm:flex-initial justify-between sm:justify-start"
          >
            {SEMESTER_OPTIONS.map((opt) => {
              const active = opt.value === semester;
              return (
                <button
                  key={opt.value}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => setSemester(opt.value)}
                  className={`flex-1 sm:flex-initial min-h-[44px] min-w-[72px] sm:min-w-[84px] px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-150 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d4b47d] ${
                    active
                      ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-xs"
                      : "text-[#575e55] dark:text-[#b0b9ac] hover:text-[#293d32] dark:hover:text-[#ecece0] hover:bg-stone-500/5 dark:hover:bg-stone-400/5"
                  }`}
                >
                  <span className="whitespace-nowrap">{opt.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Làm mới dữ liệu"
            aria-label="Làm mới dữ liệu"
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-[#575e55] dark:text-[#b0b9ac] hover:text-[#293d32] dark:hover:text-[#ecece0] flex items-center justify-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d4b47d] shrink-0"
          >
            <RotateCcw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#314e3e] dark:text-[#d4b47d]" : ""}`} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <Motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AchievementSkeleton />
          </Motion.div>
        ) : (
          <Motion.div key={`content-${semester}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-5">
            
            {/* HERO ACHIEVEMENT REPORT CARD */}
            <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center gap-4 sm:gap-6">
                
                {/* Score Section */}
                <div className="flex items-center gap-3.5 sm:gap-4 border-b md:border-b-0 md:border-r border-[#dedfd4] dark:border-[#354237] pb-3.5 md:pb-0 md:pr-6 shrink-0">
                  <div className={`w-16 h-16 min-[360px]:w-18 min-[360px]:h-18 sm:w-20 sm:h-20 rounded-2xl ${dtbTheme.bg} border-2 ${dtbTheme.border} flex flex-col items-center justify-center p-1 shrink-0 shadow-xs`}>
                    <span className={`text-xl sm:text-2xl md:text-3xl font-black ${dtbTheme.text} tracking-tight leading-none`}>
                      {currentTB !== null && currentTB !== undefined && currentTB !== "" ? Number(currentTB).toFixed(1) : "—"}
                    </span>
                    <span className="text-xs font-bold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-wider mt-1">
                      {dtbTheme.label}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-wider">
                      Điểm Trung Bình
                    </p>
                    <p className="text-sm sm:text-base font-extrabold text-[#293d32] dark:text-[#ecece0] leading-snug">
                      {isYearView ? "Tổng kết cả năm" : semester === "HK1" ? "Học kỳ I" : "Học kỳ II"}
                    </p>
                    <p className="text-xs font-medium text-[#575e55] dark:text-[#b0b9ac]">
                      {isFinal ? "Kết quả chính thức" : isAutoEvaluated ? "Tự động xét tạm tính" : "Đang cập nhật"}
                    </p>
                  </div>
                </div>

                {/* Metrics: Học lực, Hạnh kiểm, Vị thứ */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-3 flex-1 min-w-0">
                  {/* Học lực */}
                  <div className="bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] rounded-xl px-1 py-2 min-[360px]:px-2 sm:px-2.5 sm:py-3 flex flex-col items-center justify-center text-center min-w-0">
                    <div className="flex items-center justify-center gap-1 text-xs font-bold text-[#575e55] dark:text-[#b0b9ac] mb-1 w-full truncate">
                      <Award className="w-3 h-3 text-[#927140] dark:text-[#d4b47d] shrink-0" />
                      <span className="truncate">Học lực</span>
                    </div>
                    <span className={`text-xs sm:text-sm font-black whitespace-nowrap tracking-tight ${RANK_COLORS.hoc_luc[displayHocLuc] || "text-[#293d32] dark:text-[#ecece0]"}`}>
                      {displayHocLuc}
                    </span>
                  </div>

                  {/* Hạnh kiểm */}
                  <div className="bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] rounded-xl px-1 py-2 min-[360px]:px-2 sm:px-2.5 sm:py-3 flex flex-col items-center justify-center text-center min-w-0">
                    <div className="flex items-center justify-center gap-1 text-xs font-bold text-[#575e55] dark:text-[#b0b9ac] mb-1 w-full truncate">
                      <HeartHandshake className="w-3 h-3 text-[#314e3e] dark:text-[#d4b47d] shrink-0" />
                      <span className="truncate">Hạnh kiểm</span>
                    </div>
                    <span className={`text-xs sm:text-sm font-black whitespace-nowrap tracking-tight ${RANK_COLORS.hanh_kiem[displayHanhKiem] || "text-[#293d32] dark:text-[#ecece0]"}`}>
                      {displayHanhKiem}
                    </span>
                  </div>

                  {/* Vị thứ */}
                  <div className="bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] rounded-xl px-1 py-2 min-[360px]:px-2 sm:px-2.5 sm:py-3 flex flex-col items-center justify-center text-center min-w-0">
                    <div className="flex items-center justify-center gap-1 text-xs font-bold text-[#575e55] dark:text-[#b0b9ac] mb-1 w-full truncate">
                      <Trophy className="w-3 h-3 text-[#927140] dark:text-[#d4b47d] shrink-0" />
                      <span className="truncate">Vị thứ</span>
                    </div>
                    <span className="text-xs sm:text-sm font-black whitespace-nowrap tracking-tight text-[#927140] dark:text-[#d4b47d]">
                      {displayViThu}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Banner inside the card */}
              <div className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-t flex items-center gap-2 ${
                isFinal
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-[#064e3b] dark:text-[#6ee7b7] border-emerald-600/20"
                  : isAutoEvaluated
                  ? "bg-sky-50 dark:bg-sky-950/40 text-[#0c4a6e] dark:text-[#7dd3fc] border-sky-600/20"
                  : "bg-amber-50 dark:bg-amber-950/40 text-[#713f12] dark:text-[#fde047] border-amber-600/20"
              }`}>
                {isFinal ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#064e3b] dark:text-[#6ee7b7] shrink-0" />
                    <span>Kết quả học tập đã được Ban Giáo lý xác nhận chính thức</span>
                  </>
                ) : isAutoEvaluated ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#0c4a6e] dark:text-[#7dd3fc] shrink-0" />
                    <span>Kết quả tự động cập nhật theo tiến độ điểm và chuyên cần thực tế</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-[#713f12] dark:text-[#fde047] shrink-0" />
                    <span>{isYearView ? "Kết quả tổng kết cả năm đang được cập nhật thêm" : "Thông tin điểm thi và chuyên cần đang được hoàn thiện"}</span>
                  </>
                )}
              </div>
            </div>

            {/* BẢNG ĐIỂM CHI TIẾT 2 TIER (Khi xem Học kỳ I hoặc II) */}
            {!isYearView && (
              <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] shadow-xs p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3.5">
                  <h2 className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#314e3e] dark:text-[#d4b47d]" />
                    Bảng điểm chi tiết
                  </h2>
                </div>

                <div className="flex flex-col gap-2.5">
                  {/* Tier 1: Điểm quá trình (Miệng, Vở, 15 Phút) */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                    <ScoreCell label="Miệng" value={grades?.diem_mieng} />
                    <ScoreCell label="Vở" value={grades?.diem_vo} />
                    <ScoreCell label="15 Phút" value={grades?.diem_15_phut} />
                  </div>

                  {/* Tier 2: Điểm định kỳ & Cuối kỳ (1 Tiết, Điểm Thi) */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                    <ScoreCell label="1 Tiết" value={grades?.diem_1_tiet} />
                    <ScoreCell label="Điểm Thi" value={grades?.diem_thi} isExam={true} />
                  </div>
                </div>
              </div>
            )}

            {/* THEO DÕI CHUYÊN CẦN */}
            {!isYearView && (
              <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] shadow-xs p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3.5">
                  <h2 className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] uppercase tracking-wider flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-[#314e3e] dark:text-[#d4b47d]" />
                    Theo dõi chuyên cần <span className="text-[#575e55] dark:text-[#b0b9ac] font-medium tracking-normal normal-case ml-1">({totalWeeks} tuần)</span>
                  </h2>
                </div>

                {/* Thanh chuyên cần */}
                {totalWeeks > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-bold text-[#575e55] dark:text-[#b0b9ac] mb-1.5">
                      <span>Tỷ lệ chuyên cần {recordedCount > 0 ? `(${recordedCount}/${totalWeeks} buổi đã điểm danh)` : `(Chưa có buổi điểm danh)`}</span>
                      <span className="text-[#314e3e] dark:text-[#d4b47d] font-extrabold">{rateDisplay}</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#dedfd4] dark:bg-[#354237] rounded-full overflow-hidden flex">
                      <Motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${attendanceRate}%` }} 
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>
                )}

                {/* Attendance Status Legend */}
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 mb-4 text-xs font-medium text-[#575e55] dark:text-[#b0b9ac]">
                  {Object.entries(ATTENDANCE_STATUS).filter(([k]) => k !== "null").map(([k, v]) => (
                    <span key={k} className="inline-flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${v.color}`} />
                      <span>{v.label}</span>
                    </span>
                  ))}
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-300 dark:bg-stone-600 border border-dashed border-stone-400" />
                    <span>Chưa điểm danh</span>
                  </span>
                </div>

                {/* Attendance Timeline / Grid */}
                {attendanceList.length > 0 ? (
                  <div className="w-full min-w-0 overflow-hidden">
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
                      {attendanceList.map(({ date, isoDate, trang_thai, holidayName, isPastOrToday }) => {
                        const isRecorded = trang_thai && trang_thai !== "null";
                        const status = ATTENDANCE_STATUS[trang_thai] ?? ATTENDANCE_STATUS["null"];
                        const isHoliday = trang_thai === "nghi_le" || trang_thai === "le_trong" || Boolean(holidayName);
                        const statusSymbol = 
                          trang_thai === "co_mat" ? "✓" :
                          trang_thai === "nghi_phep" ? "P" :
                          trang_thai === "nghi_khong_phep" ? "K" :
                          isHoliday ? "✝" : "—";

                        const badgeClass = isRecorded
                          ? `${status.color} text-white font-black`
                          : isHoliday
                            ? "bg-blue-50/70 dark:bg-blue-950/40 border border-blue-400/80 dark:border-blue-500/80 text-blue-700 dark:text-blue-300 font-bold"
                            : "bg-stone-100 dark:bg-stone-800/80 border border-dashed border-stone-300 dark:border-stone-600 text-[#575e55] dark:text-[#b0b9ac] font-bold";

                        const tooltipTitle = holidayName
                          ? (isRecorded
                              ? `${holidayName} (${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}) - Đã nghỉ lễ`
                              : `${holidayName} (${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}) - Sắp nghỉ lễ`)
                          : `${status.label} - ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

                        return (
                          <div key={isoDate} className="flex flex-col items-center gap-1 shrink-0 w-10 sm:w-11">
                            <span 
                              className={`w-8 h-8 rounded-full shadow-2xs ${badgeClass} flex items-center justify-center text-xs leading-none transition-transform hover:scale-105`} 
                              title={tooltipTitle}
                            >
                              {statusSymbol}
                            </span>
                            <span className="text-xs font-bold text-[#575e55] dark:text-[#b0b9ac] whitespace-nowrap">
                              {date.getDate()}/{date.getMonth() + 1}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-6 text-[#575e55] dark:text-[#b0b9ac]">
                    <CalendarDays className="w-7 h-7 opacity-30" />
                    <p className="text-sm font-semibold">Chưa có dữ liệu điểm danh</p>
                  </div>
                )}

                {/* Attendance Summary Counts */}
                <div className="mt-3.5 pt-3 border-t border-[#dedfd4] dark:border-[#354237] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm font-bold text-[#575e55] dark:text-[#b0b9ac]">
                  <div>Có mặt: <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{attendanceCounts.co_mat}</span></div>
                  <div>Nghỉ phép: <span className="text-[#713f12] dark:text-[#fde047] font-extrabold">{attendanceCounts.nghi_phep}</span></div>
                  <div>Không phép: <span className="text-[#7f1d1d] dark:text-[#fca5a5] font-extrabold">{attendanceCounts.nghi_khong_phep}</span></div>
                  <div>Đã điểm danh: <span className="text-[#293d32] dark:text-[#ecece0] font-extrabold">{recordedCount}/{totalWeeks}</span></div>
                </div>
              </div>
            )}

            {/* NHẬN XÉT CỦA GIÁO LÝ VIÊN */}
            {!isYearView && (isFinal || isAutoEvaluated) && (
              <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] shadow-xs p-4 sm:p-5 space-y-3.5">
                <h2 className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] uppercase tracking-wider flex items-center gap-2">
                  <Quote className="w-4 h-4 text-[#927140] dark:text-[#d4b47d]" />
                  Nhận xét của Giáo lý viên
                </h2>
                {term?.ghi_chu ? (
                  <p className="text-sm font-medium text-[#293d32] dark:text-[#ecece0] leading-relaxed whitespace-pre-wrap">{term.ghi_chu}</p>
                ) : (
                  <div className="space-y-3 border-l-2 border-[#927140]/60 dark:border-[#d4b47d]/60 pl-3.5">
                    {displayHocLuc && displayHocLuc !== "—" && (
                      <div>
                        <h3 className="text-xs font-bold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-wider mb-0.5">Về Học lực</h3>
                        <p className="text-sm font-medium text-[#293d32] dark:text-[#ecece0] leading-relaxed italic">"{hocLucText}"</p>
                      </div>
                    )}
                    {displayHanhKiem && displayHanhKiem !== "—" && (
                      <div>
                        <h3 className="text-xs font-bold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-wider mb-0.5">Về Hạnh kiểm & Chuyên cần</h3>
                        <p className="text-sm font-medium text-[#293d32] dark:text-[#ecece0] leading-relaxed italic">"{hanhKiemText}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {isYearView && (() => {
              const dbComment = yearSummary?.ghi_chu;
              const autoComment = [hocLucText, hanhKiemText].filter(Boolean).join(" ");
              const displayComment = dbComment || autoComment;
              
              if (!displayComment) return null;
              
              return (
                <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] shadow-xs p-4 sm:p-5">
                  <p className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] mb-2 uppercase tracking-wider flex items-center gap-2">
                    <Quote className="w-4 h-4 text-[#927140] dark:text-[#d4b47d]" />
                    Nhận xét của Giáo lý viên
                  </p>
                  <p className="text-sm font-medium text-[#293d32] dark:text-[#ecece0] leading-relaxed whitespace-pre-wrap border-l-2 border-[#927140]/60 dark:border-[#d4b47d]/60 pl-3.5 italic">{displayComment}</p>
                </div>
              );
            })()}

          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
