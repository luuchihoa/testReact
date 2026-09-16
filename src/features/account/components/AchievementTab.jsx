import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  CalendarDays, Award, HeartHandshake, 
  Trophy, GraduationCap, CalendarCheck, Quote, CheckCircle2, AlertCircle, BookOpen, Sparkles 
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../lib/supabase.js";
import { AchievementSkeleton } from "../../../components/ui/Skeleton.jsx";
import { ScoreCell } from "./SharedComponents.jsx";
import { getCurrentNamHoc, getCurrentSemester, normalizeSemester, pickRandom, HK_INT_MAP, RANK_COLORS, ATTENDANCE_STATUS, GL_HOCLUC_COMMENTS, GL_HANHKIEM_COMMENTS } from "../utils.js";

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
  const [gradesRes, termRes, attendanceRes, enrollmentRes, yearRes] = await Promise.all([
    hocKyInt ? supabase.from("grades").select("diem_mieng, diem_vo, diem_15_phut, diem_1_tiet, diem_thi, diem_tb").eq("username", username).eq("nam_hoc", namHoc).eq("hoc_ky", hocKyInt).maybeSingle() : Promise.resolve({ data: null, error: null }),
    hocKyInt ? supabase.from("term_summary").select("hoc_luc, hanh_kiem, vi_thu, tong_buoi, ngay_bat_dau, lop, nam_hoc, ghi_chu").eq("username", username).eq("nam_hoc", namHoc).eq("hoc_ky", hocKyInt).maybeSingle() : Promise.resolve({ data: null, error: null }),
    hocKyInt ? supabase.from("attendance").select("ngay, trang_thai").eq("username", username).eq("nam_hoc", namHoc).eq("hoc_ky", hocKyInt).order("ngay", { ascending: true }) : Promise.resolve({ data: [], error: null }),
    supabase.from("enrollments").select("lop, nam_hoc").eq("username", username).eq("nam_hoc", namHoc).maybeSingle(),
    supabase.from("year_summary").select("diem_tb, hoc_luc, hanh_kiem, vi_thu, ghi_chu, lop, nam_hoc").eq("username", username).eq("nam_hoc", namHoc).maybeSingle()
  ]);
  
  [gradesRes, termRes, attendanceRes, enrollmentRes, yearRes].forEach((r, i) => { if (r?.error) console.error(`fetchAchievementData[${i}] error:`, r.error); });
  
  return { grades: gradesRes.data ?? null, term: termRes.data ?? null, attendance: attendanceRes.data ?? [], enrollment: enrollmentRes.data ?? null, yearSummary: yearRes.data ?? null };
}

export function AchievementTab({ user, cache, setCache }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultNamHoc = getCurrentNamHoc();
  const rawKy = searchParams.get("ky") || searchParams.get("hoc_ky") || searchParams.get("semester") || searchParams.get("hk");
  const semester = normalizeSemester(rawKy) || getCurrentSemester();
  const [namHoc] = useState(defaultNamHoc);

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
  const cacheKey = `v2-${user?.username}-${namHoc}-${semester}`;
  const data = cache[cacheKey] ?? null;
  const loading = !data;

  useEffect(() => {
    const username = user?.username;
    if (!username) return;
    
    if (cache[cacheKey]) {
      return;
    }
    
    let cancelled = false; 
    
    fetchAchievementData(username, namHoc, hocKyInt)
      .then((result) => { 
        if (cancelled) return;
        setCache((prev) => ({ ...prev, [cacheKey]: result })); 
      });
      
    return () => { cancelled = true; };
  }, [user?.username, semester, namHoc, cacheKey, hocKyInt, cache, setCache]);

  const grades      = data?.grades      ?? {};
  const term        = data?.term        ?? {};
  const enrollment  = data?.enrollment  ?? {};
  const yearSummary = data?.yearSummary ?? null;

  const lop        = term.lop || enrollment.lop || yearSummary?.lop || "—";
  const displayNamHoc = term.nam_hoc || enrollment.nam_hoc || yearSummary?.nam_hoc || namHoc;
  const summarySource = isYearView ? (yearSummary ?? {}) : term;
  const currentTB = isYearView ? yearSummary?.diem_tb : grades?.diem_tb;
  const dtbTheme = getScoreTheme(currentTB);
  const isFinal = Boolean(summarySource.hoc_luc && summarySource.hoc_luc !== "-" && summarySource.hanh_kiem && summarySource.hanh_kiem !== "-");

  const attendanceList = useMemo(() => {
    const startRaw  = term.ngay_bat_dau;
    const tongBuoi  = term.tong_buoi;
    if (!startRaw || !tongBuoi) return [];
    const exceptionMap = new Map((data?.attendance ?? []).map(({ ngay, trang_thai }) => [ngay, trang_thai]));
    const startDate = new Date(startRaw);
    const result = [];
    for (let i = 0; i < tongBuoi; i++) {
      const sunday = new Date(startDate); 
      sunday.setDate(startDate.getDate() + i * 7);
      const isoDate = sunday.toISOString().slice(0, 10);
      result.push({ date: sunday, isoDate, trang_thai: exceptionMap.get(isoDate) ?? "co_mat" });
    }
    return result;
  }, [term.ngay_bat_dau, term.tong_buoi, data?.attendance]);

  const attendanceCounts = useMemo(() => {
    const counts = { nghi_khong_phep: 0, nghi_phep: 0 };
    attendanceList.forEach(({ trang_thai }) => { 
      if (trang_thai === "nghi_khong_phep") counts.nghi_khong_phep++; 
      if (trang_thai === "nghi_phep") counts.nghi_phep++; 
    });
    counts.tong_nghi = counts.nghi_khong_phep + counts.nghi_phep;
    return counts;
  }, [attendanceList]);

  const hocLucText   = useMemo(() => pickRandom(GL_HOCLUC_COMMENTS[summarySource.hoc_luc]   || [""]), [summarySource.hoc_luc]);
  const hanhKiemText = useMemo(() => pickRandom(GL_HANHKIEM_COMMENTS[summarySource.hanh_kiem] || [""]), [summarySource.hanh_kiem]);

  const SEMESTER_OPTIONS = [
    { value: "HK1", label: "Học kỳ I" },
    { value: "HK2", label: "Học kỳ II" },
    { value: "NAM", label: "Cả năm" },
  ];

  return (
    <div className="flex flex-col gap-5 w-full min-w-0">
      {/* HEADER: Lớp, Niên khóa + 1-Tap Segmented Control */}
      <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] shadow-xs p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#314e3e]/10 dark:bg-[#d4b47d]/15 flex items-center justify-center text-[#314e3e] dark:text-[#d4b47d] border border-[#dedfd4] dark:border-[#354237] shrink-0">
            <GraduationCap className="w-5 h-5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-[#293d32] dark:text-[#ecece0] truncate leading-snug">
              {lop !== "—" ? `Lớp ${lop}` : "Chưa xếp lớp"}
            </p>
            <p className="text-[12px] font-medium text-[#575e55] dark:text-[#b0b9ac] truncate">
              {displayNamHoc ? `Niên khóa ${displayNamHoc}` : ""}
            </p>
          </div>
        </div>

        {/* 1-Tap Thumb-Friendly Segmented Pill Switcher */}
        <div 
          role="tablist" 
          aria-label="Chọn học kỳ"
          className="inline-flex p-1 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] w-full sm:w-auto shrink-0 justify-between sm:justify-start"
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
                className={`flex-1 sm:flex-initial min-h-[44px] min-w-[76px] sm:min-w-[88px] px-3 py-2 rounded-lg text-[13px] font-bold transition-all duration-150 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d4b47d] ${
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
                    <span className={`text-xl min-[360px]:text-2xl sm:text-3xl font-black ${dtbTheme.text} tracking-tight leading-none`}>
                      {currentTB ?? "—"}
                    </span>
                    <span className="text-[9.5px] min-[360px]:text-[10px] font-bold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-wider mt-1">
                      {dtbTheme.label}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] min-[360px]:text-[11px] font-bold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-wider">
                      Điểm Trung Bình
                    </p>
                    <p className="text-[15px] min-[360px]:text-[16px] sm:text-[17px] font-extrabold text-[#293d32] dark:text-[#ecece0] leading-snug">
                      {isYearView ? "Tổng kết cả năm" : semester === "HK1" ? "Học kỳ I" : "Học kỳ II"}
                    </p>
                    <p className="text-[11.5px] min-[360px]:text-[12px] font-medium text-[#575e55] dark:text-[#b0b9ac]">
                      {isFinal ? "Kết quả chính thức" : "Đang hoàn thiện"}
                    </p>
                  </div>
                </div>

                {/* Metrics: Học lực, Hạnh kiểm, Vị thứ */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-3 flex-1 min-w-0">
                  {/* Học lực */}
                  <div className="bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] rounded-xl px-1 py-2 min-[360px]:px-2 sm:px-2.5 sm:py-3 flex flex-col items-center justify-center text-center min-w-0">
                    <div className="flex items-center justify-center gap-1 text-[9px] min-[360px]:text-[10px] sm:text-[11px] font-bold text-[#575e55] dark:text-[#b0b9ac] mb-1 w-full truncate">
                      <Award className="w-3 h-3 text-[#927140] dark:text-[#d4b47d] shrink-0" />
                      <span className="truncate">Học lực</span>
                    </div>
                    <span className={`text-[11px] min-[340px]:text-[12px] min-[380px]:text-[13.5px] sm:text-[14px] md:text-[15px] font-black whitespace-nowrap tracking-tight ${RANK_COLORS.hoc_luc[summarySource.hoc_luc] || "text-[#293d32] dark:text-[#ecece0]"}`}>
                      {summarySource.hoc_luc || "—"}
                    </span>
                  </div>

                  {/* Hạnh kiểm */}
                  <div className="bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] rounded-xl px-1 py-2 min-[360px]:px-2 sm:px-2.5 sm:py-3 flex flex-col items-center justify-center text-center min-w-0">
                    <div className="flex items-center justify-center gap-1 text-[9px] min-[360px]:text-[10px] sm:text-[11px] font-bold text-[#575e55] dark:text-[#b0b9ac] mb-1 w-full truncate">
                      <HeartHandshake className="w-3 h-3 text-[#314e3e] dark:text-[#d4b47d] shrink-0" />
                      <span className="truncate">Hạnh kiểm</span>
                    </div>
                    <span className={`text-[11px] min-[340px]:text-[12px] min-[380px]:text-[13.5px] sm:text-[14px] md:text-[15px] font-black whitespace-nowrap tracking-tight ${RANK_COLORS.hanh_kiem[summarySource.hanh_kiem] || "text-[#293d32] dark:text-[#ecece0]"}`}>
                      {summarySource.hanh_kiem || "—"}
                    </span>
                  </div>

                  {/* Vị thứ */}
                  <div className="bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] rounded-xl px-1 py-2 min-[360px]:px-2 sm:px-2.5 sm:py-3 flex flex-col items-center justify-center text-center min-w-0">
                    <div className="flex items-center justify-center gap-1 text-[9px] min-[360px]:text-[10px] sm:text-[11px] font-bold text-[#575e55] dark:text-[#b0b9ac] mb-1 w-full truncate">
                      <Trophy className="w-3 h-3 text-[#927140] dark:text-[#d4b47d] shrink-0" />
                      <span className="truncate">Vị thứ</span>
                    </div>
                    <span className="text-[11px] min-[340px]:text-[12px] min-[380px]:text-[13.5px] sm:text-[14px] md:text-[15px] font-black whitespace-nowrap tracking-tight text-[#927140] dark:text-[#d4b47d]">
                      {summarySource.vi_thu ? `#${summarySource.vi_thu}` : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Banner inside the card */}
              <div className={`px-4 py-2.5 text-[12px] sm:text-[13px] font-bold border-t flex items-center gap-2 ${
                isFinal
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-[#064e3b] dark:text-[#6ee7b7] border-emerald-600/20"
                  : "bg-amber-50 dark:bg-amber-950/40 text-[#713f12] dark:text-[#fde047] border-amber-600/20"
              }`}>
                {isFinal ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#064e3b] dark:text-[#6ee7b7] shrink-0" />
                    <span>Kết quả học tập đã được cập nhật đầy đủ</span>
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
                  <h2 className="text-[13px] font-bold text-[#293d32] dark:text-[#ecece0] uppercase tracking-wider flex items-center gap-2">
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
                  <h2 className="text-[13px] font-bold text-[#293d32] dark:text-[#ecece0] uppercase tracking-wider flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-[#314e3e] dark:text-[#d4b47d]" />
                    Theo dõi chuyên cần <span className="text-[#575e55] dark:text-[#b0b9ac] font-medium tracking-normal normal-case ml-1">({term.tong_buoi ?? "—"} tuần)</span>
                  </h2>
                </div>

                {/* Thanh chuyên cần */}
                {term.tong_buoi > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-[12px] font-bold text-[#575e55] dark:text-[#b0b9ac] mb-1.5">
                      <span>Tỷ lệ chuyên cần</span>
                      <span className="text-[#314e3e] dark:text-[#d4b47d] font-extrabold">{Math.max(0, Math.round(((term.tong_buoi - attendanceCounts.tong_nghi) / term.tong_buoi) * 100))}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#dedfd4] dark:bg-[#354237] rounded-full overflow-hidden flex">
                      <Motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${Math.max(0, ((term.tong_buoi - attendanceCounts.tong_nghi) / term.tong_buoi) * 100)}%` }} 
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>
                )}

                {/* Attendance Status Legend */}
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 mb-4 text-[11px] sm:text-[12px] font-medium text-[#575e55] dark:text-[#b0b9ac]">
                  {Object.entries(ATTENDANCE_STATUS).filter(([k]) => k !== "null").map(([k, v]) => (
                    <span key={k} className="inline-flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${v.color}`} />
                      <span>{v.label}</span>
                    </span>
                  ))}
                </div>

                {/* Attendance Timeline / Grid */}
                {attendanceList.length > 0 ? (
                  <div className="w-full min-w-0 overflow-hidden">
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
                      {attendanceList.map(({ date, isoDate, trang_thai }) => {
                        const status = ATTENDANCE_STATUS[trang_thai] ?? ATTENDANCE_STATUS["null"];
                        const statusSymbol = 
                          trang_thai === "co_mat" ? "✓" :
                          trang_thai === "nghi_phep" ? "P" :
                          trang_thai === "nghi_khong_phep" ? "K" :
                          trang_thai === "le_trong" ? "✝" : "—";

                        return (
                          <div key={isoDate} className="flex flex-col items-center gap-1 shrink-0 w-10 sm:w-11">
                            <span 
                              className={`w-8 h-8 rounded-full shadow-2xs ${status.color} flex items-center justify-center text-[12px] font-black leading-none`} 
                              title={`${status.label} - ${date.getDate()}/${date.getMonth() + 1}`}
                            >
                              {statusSymbol}
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-bold text-[#575e55] dark:text-[#b0b9ac] whitespace-nowrap">
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
                    <p className="text-[13px] font-semibold">Chưa có dữ liệu điểm danh</p>
                  </div>
                )}

                {/* Attendance Summary Counts */}
                <div className="mt-3.5 pt-3 border-t border-[#dedfd4] dark:border-[#354237] flex justify-between text-[12px] font-bold text-[#575e55] dark:text-[#b0b9ac]">
                  <span>Nghỉ phép: <span className="text-[#713f12] dark:text-[#fde047] font-extrabold">{attendanceCounts.nghi_phep}</span></span>
                  <span>Không phép: <span className="text-[#7f1d1d] dark:text-[#fca5a5] font-extrabold">{attendanceCounts.nghi_khong_phep}</span></span>
                  <span>Tổng nghỉ: <span className="text-[#293d32] dark:text-[#ecece0] font-extrabold">{attendanceCounts.tong_nghi}</span></span>
                </div>
              </div>
            )}

            {/* NHẬN XÉT CỦA GIÁO LÝ VIÊN */}
            {!isYearView && isFinal && (
              <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] shadow-xs p-4 sm:p-5 space-y-3.5">
                <h2 className="text-[13px] font-bold text-[#293d32] dark:text-[#ecece0] uppercase tracking-wider flex items-center gap-2">
                  <Quote className="w-4 h-4 text-[#927140] dark:text-[#d4b47d]" />
                  Nhận xét của Giáo lý viên
                </h2>
                {term?.ghi_chu ? (
                  <p className="text-[14px] font-medium text-[#293d32] dark:text-[#ecece0] leading-relaxed whitespace-pre-wrap">{term.ghi_chu}</p>
                ) : (
                  <div className="space-y-3 border-l-2 border-[#927140]/60 dark:border-[#d4b47d]/60 pl-3.5">
                    <div>
                      <h3 className="text-[11px] font-bold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-wider mb-0.5">Về Học lực</h3>
                      <p className="text-[14px] font-medium text-[#293d32] dark:text-[#ecece0] leading-relaxed italic">"{hocLucText}"</p>
                    </div>
                    <div>
                      <h3 className="text-[11px] font-bold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-wider mb-0.5">Về Hạnh kiểm</h3>
                      <p className="text-[14px] font-medium text-[#293d32] dark:text-[#ecece0] leading-relaxed italic">"{hanhKiemText}"</p>
                    </div>
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
                  <p className="text-[13px] font-bold text-[#293d32] dark:text-[#ecece0] mb-2 uppercase tracking-wider flex items-center gap-2">
                    <Quote className="w-4 h-4 text-[#927140] dark:text-[#d4b47d]" />
                    Nhận xét của Giáo lý viên
                  </p>
                  <p className="text-[14px] font-medium text-[#293d32] dark:text-[#ecece0] leading-relaxed whitespace-pre-wrap border-l-2 border-[#927140]/60 dark:border-[#d4b47d]/60 pl-3.5 italic">{displayComment}</p>
                </div>
              );
            })()}

          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
