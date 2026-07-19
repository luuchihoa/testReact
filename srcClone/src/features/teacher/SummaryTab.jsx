import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutDashboard,
  Printer,
  FileSpreadsheet,
  Info,
  AlertTriangle,
  CheckCircle2,
  Award,
  RotateCcw,
  XCircle,
  Trophy,
  Medal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TableSkeleton } from "../../components/ui/Skeleton.jsx";
import { useTeacherContext } from "./TeacherContext.jsx";
import { fetchClassSummary, fetchYearSummary } from "./api.js";
import { sortStudentsByTen, tbColorClass } from "./utils.js";
import { HK_INT_MAP } from "./constants.js";

// Hằng số Easing chuẩn của Design System
const APPLE_EASE = [0.16, 1, 0.3, 1];

// ---------------------------------------------------------------------------
// Design tokens — cùng hệ "Sổ chủ nhiệm" đã dùng ở TeacherLayout.jsx
// (paper/ink/accent/flag/hairline). Xem ghi chú promote-to-config ở đó.
// ---------------------------------------------------------------------------
const TK_FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600&family=IBM+Plex+Mono:wght@500&display=swap');";

export default function SummaryTab() {
  const { students, context, initialSummary } = useTeacherContext();
  const namHoc = context.namHoc;
  const lop    = context.lop;

  const [hocKy, setHocKy] = useState("HK1");
  const hocKyInt = HK_INT_MAP[hocKy];
  const isCaNam = hocKy === "CN";
  
  const hasUsableInitial = initialSummary && initialSummary.hocKyInt === hocKyInt;
  const [summary, setSummary] = useState(() => (hasUsableInitial ? initialSummary.data : {}));
  const [loading, setLoading] = useState(() => !hasUsableInitial);
  const isFirstRun = useRef(true);

  // Hook giả lập kiểm tra Mobile 
  const isMobile = window.innerWidth < 768;

  const rosterStudents = useMemo(() => sortStudentsByTen(students), [students]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      if (initialSummary && initialSummary.hocKyInt === hocKyInt) return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const usernames = rosterStudents.map((s) => s.username);
        const data = isCaNam
          ? await fetchYearSummary(usernames, namHoc)
          : await fetchClassSummary(usernames, namHoc, hocKyInt);
        if (!cancelled) setSummary(data);
      } catch (err) {
        console.error("load class summary error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rosterStudents, namHoc, hocKyInt, isCaNam]);

  // Helper: xác định kết quả cả năm dựa trên học lực
  const getKetQua = (hocLuc) => {
    if (!hocLuc) return null;
    if (hocLuc === "Kém") return { label: "Học lại", color: "text-red-600 dark:text-red-500", bg: "bg-red-500/10 dark:bg-red-500/15", Icon: XCircle };
    if (hocLuc === "Yếu") return { label: "Thi lại", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 dark:bg-amber-500/15", Icon: RotateCcw };
    return { label: "Lên lớp", color: "text-emerald-700 dark:text-emerald-500", bg: "bg-emerald-500/10 dark:bg-emerald-500/15", Icon: CheckCircle2 };
  };

  const rows = useMemo(() => {
    return rosterStudents.map((s) => {
      const d = summary[s.username] || {};
      const tongVang = (d.vangCoPhep || 0) + (d.vangKhongPhep || 0);
      const warning = isCaNam
        ? (d.hocLuc === "Yếu" || d.hocLuc === "Kém")
        : (d.diemTB != null && Number(d.diemTB) < 5) || tongVang > 3;
      return { student: s, ...d, tongVang, warning };
    });
  }, [rosterStudents, summary, isCaNam]);

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const data = rows.map((r, idx) => {
      const base = {
        "STT": idx + 1,
        "Họ & Tên": `${r.student.tenThanh ? r.student.tenThanh + " " : ""}${r.student.hoTen || r.student.username}`,
      };
      if (isCaNam) {
        const kq = getKetQua(r.hocLuc);
        return {
          ...base,
          "Điểm TB": r.diemTB ?? "",
          "Học Lực": r.hocLuc ?? "",
          "Hạnh Kiểm": r.hanhKiem ?? "",
          "Vắng Có Phép": r.vangCoPhep || 0,
          "Vắng Không Phép": r.vangKhongPhep || 0,
          "Vị Thứ": r.viThu ?? "",
          "Kết Quả": kq?.label ?? "",
        };
      }
      return {
        ...base,
        "Điểm Thi": r.diemThi ?? "",
        "Điểm TB": r.diemTB ?? "",
        "Học Lực": r.hocLuc ?? "",
        "Hạnh Kiểm": r.hanhKiem ?? "",
        "Vắng Có Phép": r.vangCoPhep || 0,
        "Vắng Không Phép": r.vangKhongPhep || 0,
        "Trạng Thái Học Tập": r.warning ? "Cần theo dõi" : "Ổn định",
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const sheetName = isCaNam ? "Cả năm" : (hocKy === "HK1" ? "Học kỳ I" : "Học kỳ II");
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `TongKetLop_${lop}_${hocKy}_${namHoc}.xlsx`);
  };

  const handlePrint = () => window.print();

  const classStats = useMemo(() => {
    let sum = 0, count = 0;
    let gioi = 0, kha = 0, tb = 0, yeuKem = 0;
    rows.forEach(r => {
      if (r.diemTB !== null && r.diemTB !== undefined && !isNaN(parseFloat(r.diemTB))) {
        sum += parseFloat(r.diemTB);
        count++;
      }
      if (r.hocLuc === "Giỏi") gioi++;
      else if (r.hocLuc === "Khá") kha++;
      else if (r.hocLuc === "Trung Bình") tb++;
      else if (r.hocLuc === "Yếu" || r.hocLuc === "Kém") yeuKem++;
    });
    return {
      average: count > 0 ? (sum / count).toFixed(1) : "-",
      gioi, kha, tb, yeuKem
    };
  }, [rows]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: APPLE_EASE }}
      // NOTE: no `overflow-hidden` here anymore. Per the CSS Position spec,
      // ANY overflow value other than `visible` — including `hidden`, not
      // just `auto`/`scroll` — makes an element a "scroll container" and
      // becomes the reference box for any `position: sticky` descendant.
      // This card doesn't actually scroll (it's sized to its content), so
      // once it became the sticky reference, the thead/first-two-columns
      // row stopped tracking real page scroll and just rendered at a fixed
      // offset from the top of the card — i.e. "floating" partway down the
      // list instead of sticking to the viewport. Dropping `overflow-hidden`
      // lets the sticky context bubble up to the actual page scroller.
      // Trade-off: the `rounded-2xl` border itself still clips visually,
      // but a child whose own background reaches exactly to a corner could
      // in theory bleed past the radius by a pixel. Not an issue here since
      // no child sits flush against a corner (header has padding, and the
      // table only starts below the header's border-b).
      className="bg-white dark:bg-stone-900 sm:rounded-2xl border-y sm:border border-amber-900/10 dark:border-amber-100/10 -mx-4 sm:mx-0"
    >
      <style>{`
        ${TK_FONT_IMPORT}
        @media print {
          body * { visibility: hidden; }
          #tk-summary-print, #tk-summary-print * { 
            visibility: visible; 
            color: black !important;
            opacity: 1 !important;
            transform: none !important;
            box-shadow: none !important;
          }
          #tk-summary-print { position: absolute; left: 0; top: 0; width: 100%; }
          .tk-no-print { display: none !important; }
          #tk-summary-print table { border-collapse: collapse !important; }
          #tk-summary-print th, #tk-summary-print td { 
            border: 1px solid black !important; 
            background: transparent !important; 
          }
        }
      `}</style>

      {/* HEADER TỔNG KẾT */}
      <div className="relative z-50 flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-5 border-b border-amber-900/10 dark:border-amber-100/10 tk-no-print bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm sm:rounded-t-2xl">
        
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 shadow-sm flex items-center justify-center flex-shrink-0 border border-amber-900/10 dark:border-amber-100/10">
                <LayoutDashboard className="w-5 h-5 text-amber-950 dark:text-amber-50" />
            </div>
            <h2
              className="text-xl sm:text-2xl font-semibold text-amber-950 dark:text-amber-50 leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
                Tổng kết
            </h2>
        </div>
        
        <div className="hidden sm:block w-px h-6 bg-amber-900/10 dark:bg-amber-100/10 mx-1" />

        <div className="flex flex-wrap items-center justify-between gap-3 flex-1">
          <div className="relative flex gap-1 bg-stone-100 dark:bg-stone-800 rounded-xl p-1 shadow-inner border border-amber-900/10 dark:border-amber-100/10">
            {["HK1", "HK2", "CN"].map((k) => (
              <button key={k} type="button" onClick={() => setHocKy(k)}
                className={`relative px-5 py-2 rounded-lg text-[13px] font-semibold transition-colors duration-300 z-10 ${
                  hocKy === k 
                    ? "text-amber-950 dark:text-amber-50" 
                    : "text-stone-500 dark:text-stone-400 hover:text-amber-950 dark:hover:text-amber-50"
                }`}>
                {hocKy === k && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 bg-white dark:bg-stone-900 rounded-lg shadow-sm border border-amber-900/10 dark:border-amber-100/10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-20">{k === "HK1" ? "Học Kỳ I" : k === "HK2" ? "Học Kỳ II" : "Cả năm"}</span>
              </button>
            ))}
          </div>
          
          <div className="group relative hidden md:flex items-center justify-center w-8 h-8 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-help border border-transparent hover:border-amber-900/10 dark:hover:border-amber-100/10 z-[100]">
              <Info className="w-4 h-4 text-stone-500 dark:text-stone-400" />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max max-w-[200px] bg-gray-900/90 backdrop-blur text-white text-[11px] font-medium px-3 py-2 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                Vạch đỏ bên trái: ĐTB &lt; 5 hoặc vắng &gt; 3 buổi
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900/90 rotate-45" />
              </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full sm:flex sm:w-auto flex-shrink-0">
          <button type="button" onClick={exportExcel}
            className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-b from-amber-800 to-amber-900 dark:from-amber-500 dark:to-amber-600 text-white dark:text-white text-[13px] font-semibold shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 overflow-hidden">
            <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-500 ease-in-out" />
            <FileSpreadsheet className="w-4 h-4 relative z-10" /> <span className="relative z-10">Xuất Excel</span>
          </button>
          <button type="button" onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-white dark:bg-stone-900 text-amber-950 dark:text-amber-50 border border-amber-900/10 dark:border-amber-100/10 shadow-sm hover:border-amber-900/20 dark:hover:border-amber-100/20 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-200 active:scale-[0.98]">
            <Printer className="w-4 h-4" /> <span>In / PDF</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="px-5 py-5"
          >
            <TableSkeleton rows={6} columns={6} />
          </motion.div>
        ) : (
          <motion.div 
            key="content" 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: APPLE_EASE }}
            id="tk-summary-print" 
            className="pb-0"
          >
            <div className="hidden print:block mb-4 px-5 pt-5">
              <h2
                className="text-xl font-semibold text-amber-950"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Bảng tổng kết lớp {lop} — {isCaNam ? "Cả năm" : (hocKy === "HK1" ? "Học kỳ I" : "Học kỳ II")} — {namHoc}
              </h2>
            </div>

            {/* MOBILE LIST */}
            <div className="md:hidden flex flex-col gap-4 p-4 print:hidden bg-stone-100/30 dark:bg-stone-800/30">
              {rows.map((r, idx) => {
                const kq = isCaNam ? getKetQua(r.hocLuc) : null;
                return (
                <motion.div 
                  initial={{ opacity: 0, y: isMobile ? 16 : 0 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true, margin: isMobile ? "-20px" : "0px" }}
                  transition={{ duration: 0.5, delay: idx * 0.05, ease: APPLE_EASE }}
                  key={r.student.username} 
                  className={`relative p-5 rounded-2xl shadow-sm border ${r.warning ? "border-red-600/40 bg-red-600/[0.02] dark:bg-red-500/[0.05] ring-2 ring-red-600/20" : "border-amber-900/10 dark:border-amber-100/10 bg-white dark:bg-stone-900"}`}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full overflow-hidden border-2 flex-shrink-0 bg-stone-100 dark:bg-stone-800 ${r.warning ? "border-red-600/50 dark:border-red-500/50" : "border-emerald-600/50 dark:border-emerald-500/50"}`}>
                        <img src={r.student.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 flex items-center justify-center bg-amber-950 dark:bg-amber-50 text-white dark:text-amber-950 text-[9px] font-bold rounded-full border-2 border-white dark:border-stone-900">
                        {idx + 1}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-bold text-amber-950 dark:text-amber-50 leading-snug">
                        {r.student.tenThanh ? <span className="font-normal text-stone-500 dark:text-stone-400 mr-1">{r.student.tenThanh}</span> : ""}{r.student.hoTen || r.student.username}
                      </div>
                      <div className="mt-1.5">
                        {isCaNam && kq ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${kq.bg} ${kq.color} text-[10px] font-bold uppercase tracking-wide`}>
                            <kq.Icon className="w-3 h-3" /> {kq.label}
                          </span>
                        ) : r.warning ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 dark:bg-red-500/15 text-red-600 dark:text-red-500 text-[10px] font-bold uppercase tracking-wide">
                            <AlertTriangle className="w-3 h-3" /> Cần theo dõi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-500 text-[10px] font-bold uppercase tracking-wide">
                            <CheckCircle2 className="w-3 h-3" /> Ổn định
                          </span>
                        )}
                      </div>
                    </div>

                    {isCaNam && r.viThu != null && (
                      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 border border-amber-900/10 dark:border-amber-100/10">
                        {r.viThu <= 3 ? (
                          <span className="text-[16px]">{r.viThu === 1 ? "🥇" : r.viThu === 2 ? "🥈" : "🥉"}</span>
                        ) : (
                          <span className="text-[13px] font-bold text-amber-950 dark:text-amber-50" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>#{r.viThu}</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className={`grid ${isCaNam ? "grid-cols-2" : "grid-cols-3"} gap-2 text-center bg-stone-100/50 dark:bg-stone-800/50 rounded-xl p-2 border border-amber-900/10 dark:border-amber-100/10`}>
                    {!isCaNam && (
                      <div className="py-2">
                        <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 mb-1">ĐIỂM THI</p>
                        <p className="text-[15px] font-bold text-amber-950 dark:text-amber-50" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{r.diemThi ?? "—"}</p>
                      </div>
                    )}
                    <div className={`py-2 ${!isCaNam ? "relative" : ""}`}>
                      {!isCaNam && <div className="absolute inset-y-0 left-0 w-px bg-amber-900/10 dark:bg-amber-100/10" />}
                      {!isCaNam && <div className="absolute inset-y-0 right-0 w-px bg-amber-900/10 dark:bg-amber-100/10" />}
                      <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 mb-1">ĐIỂM TB</p>
                      <p className={`text-[15px] font-bold ${tbColorClass(r.diemTB)}`} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{r.diemTB ?? "—"}</p>
                    </div>
                    <div className="py-2">
                      <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 mb-1">HỌC LỰC</p>
                      <p className="text-[13px] font-semibold text-amber-950 dark:text-amber-50 mt-0.5">{r.hocLuc || "—"}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center mt-3">
                    <div className="py-1.5">
                      <p className="text-[10px] font-medium text-stone-500 dark:text-stone-400 mb-0.5">HẠNH KIỂM</p>
                      <p className="text-[12px] font-medium text-amber-950 dark:text-amber-50">{r.hanhKiem || "—"}</p>
                    </div>
                    <div className="py-1.5">
                      <p className="text-[10px] font-medium text-stone-500 dark:text-stone-400 mb-0.5">VẮNG CP</p>
                      <p className="text-[13px] font-semibold text-amber-950 dark:text-amber-50" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{r.vangCoPhep || 0}</p>
                    </div>
                    <div className="py-1.5">
                      <p className="text-[10px] font-medium text-stone-500 dark:text-stone-400 mb-0.5">VẮNG KP</p>
                      <p className={`text-[13px] font-bold ${r.vangKhongPhep > 0 ? "text-red-600 dark:text-red-500" : "text-amber-950 dark:text-amber-50"}`} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                        {r.vangKhongPhep || 0}
                      </p>
                    </div>
                  </div>


                </motion.div>
              );
              })}
              {rows.length === 0 && (
                <p className="text-center text-[14px] text-stone-500 dark:text-stone-400 py-12 px-5">Lớp chưa có học sinh nào.</p>
              )}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block print:block overflow-auto max-h-[75vh] print:max-h-none print:overflow-visible" data-lenis-prevent>
              <table className="w-full text-sm border-collapse min-w-[760px] bg-white dark:bg-stone-900">
                <thead className="sticky top-0 z-30 bg-white dark:bg-stone-900 shadow-[0_1px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_rgba(255,255,255,0.05)] text-[11px] font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  <tr>
                    <th className="text-center px-3 py-4 sticky left-0 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm z-40 w-14 border-b border-r border-amber-900/10 dark:border-amber-100/10 print:border-r print:border-stone-300">STT</th>
                    <th className="text-left px-4 py-4 sticky left-14 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm z-40 border-b border-r border-amber-900/10 dark:border-amber-100/10 font-sans normal-case tracking-normal shadow-[2px_0_5px_rgba(0,0,0,0.02)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.2)] print:shadow-none print:border-r print:border-stone-300">Tên Thánh, Họ &amp; Tên</th>
                    {!isCaNam && <th className="text-center px-2 py-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm z-10 border-b border-amber-900/10 dark:border-amber-100/10 print:border-r print:border-stone-300">Điểm Thi</th>}
                    <th className="text-center px-2 py-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm z-10 border-b border-amber-900/10 dark:border-amber-100/10 print:border-r print:border-stone-300">{isCaNam ? "Điểm TB" : "Điểm TB"}</th>
                    <th className="text-center px-2 py-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm z-10 border-b border-amber-900/10 dark:border-amber-100/10 print:border-r print:border-stone-300">Học Lực</th>
                    <th className="text-center px-2 py-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm z-10 border-b border-amber-900/10 dark:border-amber-100/10 print:border-r print:border-stone-300">Hạnh Kiểm</th>
                    <th className="text-center px-2 py-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm z-10 border-b border-amber-900/10 dark:border-amber-100/10 print:border-r print:border-stone-300">Vắng CP</th>
                    <th className="text-center px-2 py-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm z-10 border-b border-amber-900/10 dark:border-amber-100/10 print:border-r print:border-stone-300">Vắng KP</th>
                    {isCaNam && <th className="text-center px-2 py-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm z-10 border-b border-amber-900/10 dark:border-amber-100/10 print:border-r print:border-stone-300">Vị Thứ</th>}
                    <th className="text-center px-2 py-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm z-10 border-b border-amber-900/10 dark:border-amber-100/10 font-sans normal-case tracking-normal print:hidden">{isCaNam ? "Kết Quả" : "Trạng Thái"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-900/10 dark:divide-amber-100/10">
                  {rows.map((r, idx) => {
                    const isWarn = r.warning;
                    const kq = isCaNam ? getKetQua(r.hocLuc) : null;
                    return (
                      <motion.tr 
                        initial={{ opacity: 0 }} 
                        whileInView={{ opacity: 1 }} 
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: idx * 0.02, ease: APPLE_EASE }}
                        key={r.student.username} 
                        className="transition-colors duration-300 bg-transparent hover:bg-stone-100/60 dark:hover:bg-stone-800/40 group"
                      >
                        <td className={`px-3 py-4 text-center sticky left-0 z-20 text-[12px] text-stone-500 dark:text-stone-400 w-14 bg-white dark:bg-stone-900 transition-colors group-hover:bg-stone-100/60 dark:group-hover:bg-stone-800 border-r border-amber-900/10 dark:border-amber-100/10 border-l-[3px] ${isWarn ? "border-l-red-600 dark:border-l-red-500" : "border-l-transparent"} print:border-r print:border-stone-300`} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                          {idx + 1}
                        </td>
                        <td className="px-4 py-4 sticky left-14 z-20 bg-white dark:bg-stone-900 transition-colors group-hover:bg-stone-100/60 dark:group-hover:bg-stone-800 border-r border-amber-900/10 dark:border-amber-100/10 shadow-[2px_0_5px_rgba(0,0,0,0.02)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.2)] print:shadow-none print:border-r print:border-stone-300">
                          <div className="flex items-center gap-3 min-w-[180px]">
                            <div className={`relative w-8 h-8 rounded-full overflow-hidden border-2 flex-shrink-0 bg-stone-100 dark:bg-stone-800 print:hidden ${isWarn ? "border-red-600/50 dark:border-red-500/50" : "border-emerald-600/50 dark:border-emerald-500/50"}`}>
                              <img src={r.student.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[14px] font-bold text-amber-950 dark:text-amber-50 truncate">
                              {r.student.tenThanh ? <span className="font-normal text-stone-500 dark:text-stone-400 mr-1">{r.student.tenThanh}</span> : ""}{r.student.hoTen || r.student.username}
                            </span>
                          </div>
                        </td>
                        {!isCaNam && <td className="px-2 py-4 text-center text-[14px] text-amber-950 dark:text-amber-50 print:border-r print:border-stone-300" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{r.diemThi ?? "—"}</td>}
                        <td className={`px-2 py-4 text-center text-[14px] font-bold ${tbColorClass(r.diemTB)} print:border-r print:border-stone-300`} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                          {r.diemTB !== null && r.diemTB !== undefined ? (
                            <div className="inline-flex items-center justify-center gap-1.5">
                              {/* Keep exact semantic dots for grade ranks */}
                              <span className={`w-1.5 h-1.5 rounded-full print:hidden ${r.diemTB >= 8 ? 'bg-[#34C759]' : r.diemTB >= 5 ? 'bg-[#FFD60A]' : 'bg-[#FF375F]'}`} />
                              {r.diemTB}
                            </div>
                          ) : "—"}
                        </td>
                        <td className="px-2 py-4 text-center text-[13px] font-semibold text-amber-950 dark:text-amber-50 print:border-r print:border-stone-300">{r.hocLuc || "—"}</td>
                        <td className="px-2 py-4 text-center text-[13px] font-semibold text-amber-950 dark:text-amber-50 print:border-r print:border-stone-300">{r.hanhKiem || "—"}</td>
                        <td className="px-2 py-4 text-center text-[14px] text-amber-950 dark:text-amber-50 print:border-r print:border-stone-300" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{r.vangCoPhep || 0}</td>
                        <td className={`px-2 py-4 text-center text-[14px] ${r.vangKhongPhep > 0 ? "text-red-600 dark:text-red-500 font-bold" : "text-amber-950 dark:text-amber-50"} print:border-r print:border-stone-300`} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                          {r.vangKhongPhep || 0}
                        </td>
                        {isCaNam && (
                          <td className="px-2 py-4 text-center text-[14px] font-bold text-amber-950 dark:text-amber-50 print:border-r print:border-stone-300" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                            {r.viThu != null ? (
                              <span className="inline-flex items-center gap-1">
                                {r.viThu <= 3 && <span>{r.viThu === 1 ? "🥇" : r.viThu === 2 ? "🥈" : "🥉"}</span>}
                                {r.viThu}
                              </span>
                            ) : "—"}
                          </td>
                        )}
                        <td className="px-2 py-4 text-center print:hidden">
                          {isCaNam && kq ? (
                            <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full ${kq.bg} ${kq.color} text-[11px] font-bold uppercase tracking-wide whitespace-nowrap`}>
                              <kq.Icon className="w-3 h-3" /> {kq.label}
                            </span>
                          ) : isWarn ? (
                            <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 dark:bg-red-500/15 text-red-600 dark:text-red-500 text-[11px] font-bold uppercase tracking-wide whitespace-nowrap">
                              <AlertTriangle className="w-3 h-3" /> Cần theo dõi
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-500 text-[11px] font-bold uppercase tracking-wide whitespace-nowrap">
                              <CheckCircle2 className="w-3 h-3" /> Ổn định
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={isCaNam ? 10 : 9} className="text-center text-[14px] text-stone-500 dark:text-stone-400 py-12">Lớp chưa có học sinh nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* INFO FOOTER */}
            {rows.length > 0 && (
              <div className="mt-8 mx-4 sm:mx-6 mb-2 px-4 py-3 bg-stone-100/50 dark:bg-stone-800/50 border border-stone-200/50 dark:border-stone-700/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md print:hidden">
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 sm:gap-4 text-[13px] font-medium text-stone-500 dark:text-stone-400">
                  <span className="font-bold text-stone-800 dark:text-stone-200">Học lực:</span>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#34C759]"></span><span>Giỏi ({classStats.gioi})</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#007AFF]"></span><span>Khá ({classStats.kha})</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FFD60A]"></span><span>TB ({classStats.tb})</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF375F]"></span><span>Yếu/Kém ({classStats.yeuKem})</span></div>
                </div>
                <div className="flex flex-wrap justify-center sm:justify-end items-center gap-3 sm:gap-4 text-[14px] font-bold w-full sm:w-auto mt-2 sm:mt-0">
                  <div className="px-4 py-1.5 bg-stone-200/50 dark:bg-stone-700/50 rounded-xl text-stone-600 dark:text-stone-300">Sĩ số: {rows.length}</div>
                  <div className="px-4 py-1.5 bg-amber-900 text-amber-50 dark:bg-amber-100 dark:text-amber-900 rounded-xl">Trung bình lớp: {classStats.average}</div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}