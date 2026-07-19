import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarDays, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../lib/supabase.js";
import { AchievementSkeleton } from "../../../components/ui/Skeleton.jsx";
import { StatCard, ScoreCell } from "./SharedComponents.jsx";
import { getCurrentNamHoc, getCurrentSemester, pickRandom, HK_INT_MAP, VALID_SEMESTERS, RANK_COLORS, ATTENDANCE_STATUS, GL_HOCLUC_COMMENTS, GL_HANHKIEM_COMMENTS } from "../utils.js";

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
  const [semester, setSemesterState] = useState(searchParams.get("ky") || getCurrentSemester());
  const [openSemester, setOpenSemester] = useState(false);
  const [hasAutoSwitched, setHasAutoSwitched] = useState(false);
  const dropdownRef = useRef(null);
  const [namHoc] = useState(defaultNamHoc);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenSemester(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const setSemester = (value) => {
    setSemesterState(value);
    setSearchParams((prev) => { const next = new URLSearchParams(prev); next.set("ky", value); return next; }, { replace: true });
  };

  useEffect(() => {
    const ky = searchParams.get("ky");
    if (ky && ky !== semester) {
      setSemesterState(ky);
    }
  }, [searchParams, semester]);

  const isYearView = semester === "NAM";
  const hocKyInt   = HK_INT_MAP[semester] ?? null;
  const cacheKey = `v2-${user?.username}-${namHoc}-${semester}`;
  const data = cache[cacheKey] ?? null;

  useEffect(() => {
    const username = user?.username;
    if (!username) return;
    
    if (cache[cacheKey]) {
      // Logic ưu tiên hiển thị Cả năm nếu đã có sẵn trong cache
      const result = cache[cacheKey];
      if (!searchParams.get("ky") && !hasAutoSwitched && result.yearSummary?.diem_tb != null && semester !== "NAM") {
        setHasAutoSwitched(true);
        setSemesterState("NAM");
        setSearchParams((prev) => { const next = new URLSearchParams(prev); next.set("ky", "NAM"); return next; }, { replace: true });
      }
      return;
    }
    
    let cancelled = false; 
    setLoading(true);
    
    fetchAchievementData(username, namHoc, hocKyInt)
      .then((result) => { 
        if (cancelled) return;
        
        if (!searchParams.get("ky") && !hasAutoSwitched && result.yearSummary?.diem_tb != null && semester !== "NAM") {
          setHasAutoSwitched(true);
          setSemesterState("NAM");
          setSearchParams((prev) => { const next = new URLSearchParams(prev); next.set("ky", "NAM"); return next; }, { replace: true });
        }
        
        setCache((prev) => ({ ...prev, [cacheKey]: result })); 
      })
      .finally(() => { if (!cancelled) setLoading(false); });
      
    return () => { cancelled = true; };
  }, [user?.username, semester, namHoc, cacheKey, hocKyInt, cache, setCache, searchParams, hasAutoSwitched, setSearchParams]);

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
    <div className="flex flex-col gap-6">
      <div className="relative z-20 bg-white/80 dark:bg-stone-800/40 backdrop-blur-sm rounded-2xl border border-amber-900/10 dark:border-amber-100/10 shadow-sm p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[18px] font-bold text-amber-950 dark:text-amber-50 truncate">{user?.tenThanh} {user?.hoTen || "—"}</h1>
          <p className="text-[13px] font-bold text-amber-800/70 dark:text-amber-400/70 mt-0.5 tracking-wider">
            {lop} · {displayNamHoc}
          </p>
        </div>
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpenSemester((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full border font-bold transition-all duration-150 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-amber-500/50 h-8 sm:h-9 pl-3 pr-2 text-[13px] sm:text-[14px] ${
              openSemester
                ? "border-transparent bg-amber-900 dark:bg-amber-100 text-amber-50 dark:text-amber-950 shadow-[0_2px_8px_rgba(146,64,14,0.2)]"
                : "border-amber-900/10 dark:border-amber-100/10 bg-white/80 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 shadow-sm backdrop-blur-sm hover:bg-amber-50 dark:hover:bg-stone-800/80"
            }`}
          >
            <CalendarDays className={`w-4 h-4 ${openSemester ? "text-amber-50 dark:text-amber-950" : "text-stone-400 dark:text-stone-500"}`} strokeWidth={2.25} />
            <span className="whitespace-nowrap leading-none mt-[1px]">
              {semester === "HK1" ? "Học kỳ I" : semester === "HK2" ? "Học kỳ II" : "Cả năm"}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openSemester ? "rotate-180 text-amber-50 dark:text-amber-950" : "text-stone-400 dark:text-stone-500"}`} />
          </button>

          <AnimatePresence>
            {openSemester && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 z-[100] mt-2 min-w-[160px] rounded-2xl border border-amber-900/10 dark:border-amber-100/10 bg-[#FDFBF7]/95 dark:bg-[#1C1917]/95 backdrop-blur-xl p-1.5 shadow-xl"
              >
                {[
                  { value: "HK1", label: "Học kỳ I" },
                  { value: "HK2", label: "Học kỳ II" },
                  { value: "NAM", label: "Cả năm" }
                ].map((opt) => {
                  const active = opt.value === semester;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setSemester(opt.value); setOpenSemester(false); }}
                      className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-bold text-left transition-colors ${
                        active ? "bg-amber-100/50 dark:bg-amber-500/20 text-amber-950 dark:text-amber-50" : "text-stone-600 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-amber-900/10"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {active && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AchievementSkeleton />
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {isYearView ? (
                <>
                  <StatCard icon="🎯" label="Điểm TB năm"   value={yearSummary?.diem_tb}    colorClass="text-amber-600 dark:text-amber-400" delay={0.05} />
                  <StatCard icon="🌟" label="Học lực năm"   value={yearSummary?.hoc_luc}    colorClass={RANK_COLORS.hoc_luc[yearSummary?.hoc_luc]     || "text-stone-800 dark:text-stone-200"} delay={0.1} />
                  <StatCard icon="💖" label="Hạnh kiểm năm" value={yearSummary?.hanh_kiem}  colorClass={RANK_COLORS.hanh_kiem[yearSummary?.hanh_kiem] || "text-stone-800 dark:text-stone-200"} delay={0.15} />
                  <StatCard icon="🏆" label="Vị thứ năm"    value={yearSummary?.vi_thu}     colorClass="text-amber-600 dark:text-amber-400" delay={0.2} />
                </>
              ) : (
                <>
                  <StatCard icon="🎯" label="Điểm TB"   value={grades.diem_tb}    colorClass="text-amber-600 dark:text-amber-400" delay={0.05} />
                  <StatCard icon="🌟" label="Học lực"   value={term.hoc_luc}      colorClass={RANK_COLORS.hoc_luc[term.hoc_luc]     || "text-stone-800 dark:text-stone-200"} delay={0.1} />
                  <StatCard icon="💖" label="Hạnh kiểm" value={term.hanh_kiem}    colorClass={RANK_COLORS.hanh_kiem[term.hanh_kiem] || "text-stone-800 dark:text-stone-200"} delay={0.15} />
                  <StatCard icon="🏆" label="Vị thứ"    value={term.vi_thu}       colorClass="text-amber-600 dark:text-amber-400" delay={0.2} />
                </>
              )}
            </div>

            {/* BẢNG ĐIỂM CHI TIẾT */}
            {!isYearView && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}
                className="bg-white/80 dark:bg-stone-800/40 backdrop-blur-sm rounded-2xl border border-amber-900/10 dark:border-amber-100/10 shadow-sm p-5 mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[15px] font-bold text-amber-950 dark:text-amber-50 uppercase tracking-wider flex items-center gap-2">
                    <span>📊</span> Chi tiết Điểm số
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ScoreCell label="Miệng" value={grades?.diem_mieng} />
                  <ScoreCell label="Vở" value={grades?.diem_vo} />
                  <ScoreCell label="15 Phút" value={grades?.diem_15_phut} />
                  <ScoreCell label="1 Tiết" value={grades?.diem_1_tiet} />
                  <ScoreCell label="Điểm Thi" value={grades?.diem_thi} />
                </div>
              </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
              className={`rounded-2xl px-5 py-4 text-[13px] font-bold border shadow-sm backdrop-blur-sm mb-6 ${isFinal ? "bg-emerald-50/80 text-emerald-700 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" : "bg-amber-50/80 text-amber-700 border-amber-200/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"}`}
            >
              {isFinal ? "ℹ️ Thông tin đã cập nhật đầy đủ!" : isYearView ? "⚠️ Kết quả tổng kết cả năm đang được cập nhật thêm" : "⚠️ Thông tin điểm thi và điểm danh đang được cập nhật thêm"}
            </motion.div>

            {isYearView && (() => {
              const dbComment = yearSummary?.ghi_chu;
              const autoComment = [hocLucText, hanhKiemText].filter(Boolean).join(" ");
              const displayComment = dbComment || autoComment;
              
              if (!displayComment) return null;
              
              return (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }} className="bg-white/80 dark:bg-stone-800/40 backdrop-blur-sm rounded-2xl border border-amber-900/10 dark:border-amber-100/10 shadow-sm p-5 mb-6">
                  <p className="text-[13px] font-bold text-amber-950 dark:text-amber-50 mb-1.5 uppercase tracking-wider flex items-center gap-2"><span>📝</span> Nhận xét của Giáo lý viên</p>
                  <p className="text-[14px] font-medium text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-wrap">{displayComment}</p>
                </motion.div>
              );
            })()}

            {!isYearView && (
              <>
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}
                  className="bg-white/80 dark:bg-stone-800/40 backdrop-blur-sm rounded-2xl border border-amber-900/10 dark:border-amber-100/10 shadow-sm p-5 mb-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[15px] font-bold text-amber-950 dark:text-amber-50 uppercase tracking-wider flex items-center gap-2">
                      <span>🗓️</span> Điểm danh <span className="text-stone-400 font-semibold tracking-normal normal-case ml-1">({term.tong_buoi ?? "—"} tuần)</span>
                    </h2>
                  </div>

                  {/* Thanh chuyên cần */}
                  {term.tong_buoi > 0 && (
                    <div className="mb-5">
                      <div className="flex justify-between text-[11px] font-bold text-stone-500 dark:text-stone-400 mb-1.5">
                        <span>Chuyên cần</span>
                        <span>{Math.max(0, Math.round(((term.tong_buoi - attendanceCounts.tong_nghi) / term.tong_buoi) * 100))}%</span>
                      </div>
                      <div className="h-2 w-full bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden shadow-inner flex">
                        <motion.div 
                          initial={{ width: 0 }} animate={{ width: `${Math.max(0, ((term.tong_buoi - attendanceCounts.tong_nghi) / term.tong_buoi) * 100)}%` }} transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                          className="h-full bg-emerald-500 dark:bg-emerald-400"
                        />
                      </div>
                    </div>
                  )}

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
                  <div className="mt-4 pt-4 border-t border-amber-900/10 dark:border-amber-100/10 flex justify-between text-[13px] font-bold text-stone-500 dark:text-stone-400">
                    <span>Nghỉ phép: <span className="text-amber-600 dark:text-amber-400">{attendanceCounts.nghi_phep}</span></span>
                    <span>Không phép: <span className="text-red-600 dark:text-red-400">{attendanceCounts.nghi_khong_phep}</span></span>
                    <span>Tổng nghỉ: <span className="text-amber-950 dark:text-amber-50">{attendanceCounts.tong_nghi}</span></span>
                  </div>
                </motion.div>

                {isFinal && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}
                    className="bg-white/80 dark:bg-stone-800/40 backdrop-blur-sm rounded-2xl border border-amber-900/10 dark:border-amber-100/10 shadow-sm p-5 space-y-4"
                  >
                    <h2 className="text-[15px] font-bold text-amber-950 dark:text-amber-50 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span>💡</span> Nhận xét của Giáo lý viên
                    </h2>
                    {term?.ghi_chu ? (
                      <p className="text-[14px] font-medium text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">{term.ghi_chu}</p>
                    ) : (
                      <>
                        <div>
                          <h3 className="text-[12px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Về Học lực</h3>
                          <p className="text-[14px] font-medium text-stone-600 dark:text-stone-300 leading-relaxed italic border-l-2 border-amber-500/50 pl-3">"{hocLucText}"</p>
                        </div>
                        <div>
                          <h3 className="text-[12px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Về Hạnh kiểm</h3>
                          <p className="text-[14px] font-medium text-stone-600 dark:text-stone-300 leading-relaxed italic border-l-2 border-amber-500/50 pl-3">"{hanhKiemText}"</p>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
