import React, { useEffect, useMemo, useRef, useState } from "react";
import { LayoutDashboard, Printer, FileSpreadsheet, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "../ui/StudentShared.jsx";
import { useTeacherContext } from "./TeacherContext.jsx";
import { fetchClassSummary } from "./api.js";
import { sortStudentsByTen, tbColorClass } from "./utils.js";
import { HK_INT_MAP } from "./constants.js";

// Hằng số Easing chuẩn của Design System
const APPLE_EASE = [0.16, 1, 0.3, 1];

export default function SummaryTab() {
  const { students, context, initialSummary } = useTeacherContext();
  const namHoc = context.namHoc;
  const lop    = context.lop;

  const [hocKy, setHocKy] = useState("HK1");
  const hocKyInt = HK_INT_MAP[hocKy];
  
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
        const data = await fetchClassSummary(usernames, namHoc, hocKyInt);
        if (!cancelled) setSummary(data);
      } catch (err) {
        console.error("load class summary error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rosterStudents, namHoc, hocKyInt]);

  const rows = useMemo(() => {
    return rosterStudents.map((s) => {
      const d = summary[s.username] || {};
      const tongVang = (d.vangCoPhep || 0) + (d.vangKhongPhep || 0);
      const warning = (d.diemTB != null && Number(d.diemTB) < 5) || tongVang > 3;
      return { student: s, ...d, tongVang, warning };
    });
  }, [rosterStudents, summary]);

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const data = rows.map((r, idx) => ({
      "STT": idx + 1,
      "Họ & Tên": `${r.student.tenThanh ? r.student.tenThanh + " " : ""}${r.student.hoTen || r.student.username}`,
      "Điểm Thi": r.diemThi ?? "",
      "Điểm TB": r.diemTB ?? "",
      "Học Lực": r.hocLuc ?? "",
      "Hạnh Kiểm": r.hanhKiem ?? "",
      "Vắng Có Phép": r.vangCoPhep || 0,
      "Vắng Không Phép": r.vangKhongPhep || 0,
      "Trạng Thái Học Tập": r.warning ? "Cần theo dõi" : "Ổn định",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [{ wch: 5 }, { wch: 26 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 13 }, { wch: 15 }, { wch: 16 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, hocKy === "HK1" ? "Học kỳ I" : "Học kỳ II");
    XLSX.writeFile(wb, `TongKetLop_${lop}_${hocKy}_${namHoc}.xlsx`);
  };

  const handlePrint = () => window.print();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: APPLE_EASE }}
      className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm overflow-hidden"
    >
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #tk-summary-print, #tk-summary-print * { visibility: visible; }
          #tk-summary-print { position: absolute; left: 0; top: 0; width: 100%; }
          .tk-no-print { display: none !important; }
        }
      `}</style>

      {/* HEADER TỔNG KẾT */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-5 border-b border-amber-900/10 dark:border-amber-100/10 tk-no-print">
        
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
                <LayoutDashboard className="w-5 h-5 text-amber-900 dark:text-amber-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-amber-950 dark:text-amber-50 font-serif leading-tight">
                Tổng kết
            </h2>
        </div>
        
        <div className="hidden sm:block w-px h-6 bg-stone-200 dark:bg-stone-800 mx-1" />

        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="flex gap-1 bg-stone-100/80 dark:bg-stone-800/80 rounded-xl p-1 backdrop-blur-sm">
            {["HK1", "HK2"].map((k) => (
              <button key={k} type="button" onClick={() => setHocKy(k)}
                className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all duration-300 ${
                  hocKy === k 
                    ? "bg-white dark:bg-stone-700 text-amber-900 dark:text-amber-400 shadow-sm" 
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
                }`}>
                {k === "HK1" ? "Học Kỳ I" : "Học Kỳ II"}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border border-amber-900/5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
              <span className="text-[12px] font-medium text-amber-800/70 dark:text-amber-400/70">
                Dòng đỏ: ĐTB &lt; 5 hoặc vắng &gt; 3 buổi
              </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 w-full sm:flex sm:w-auto flex-shrink-0">
          <button type="button" onClick={exportExcel}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-[13px] font-bold hover:bg-emerald-700 active:scale-[0.98] transition-all duration-300 shadow-sm">
            <FileSpreadsheet className="w-4 h-4" /> <span>Xuất Excel</span>
          </button>
          {/* Nút Bấm Phụ Snippet */}
          <button type="button" onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-black/5 dark:border-white/5 transition-all duration-300 active:scale-[0.98] md:hover:bg-stone-200 dark:md:hover:bg-stone-700">
            <Printer className="w-4 h-4" /> <span>In / PDF</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-3 py-24 text-amber-900 dark:text-amber-500"
          >
            <Spinner className="h-6 w-6" />
            <span className="text-[14px] font-medium font-sans">Đang tổng hợp dữ liệu lớp…</span>
          </motion.div>
        ) : (
          <motion.div 
            key="content" 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: APPLE_EASE }}
            id="tk-summary-print" 
            className="pb-0"
          >
            <div className="hidden print:block mb-4 px-5 pt-5">
              <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 font-serif">
                Bảng tổng kết lớp {lop} — {hocKy === "HK1" ? "Học kỳ I" : "Học kỳ II"} — {namHoc}
              </h2>
            </div>

            {/* MOBILE LIST */}
            <div className="md:hidden divide-y divide-amber-900/5 dark:divide-amber-100/5 print:hidden">
              {rows.map((r, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: isMobile ? 16 : 0 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true, margin: isMobile ? "-20px" : "0px" }}
                  transition={{ duration: 0.5, delay: idx * 0.05, ease: APPLE_EASE }}
                  key={r.student.username} 
                  className={`px-5 py-4 transition-colors duration-500 ${r.warning ? "bg-red-50/60 dark:bg-red-950/20" : ""}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[12px] font-bold text-amber-800/50 dark:text-amber-400/50 w-5 text-center">{idx + 1}</span>
                    <div className={`w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0 bg-stone-100 shadow-sm ${r.warning ? "border-red-200 dark:border-red-900" : "border-white dark:border-stone-800"}`}>
                      <img src={r.student.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[15px] font-bold text-stone-800 dark:text-stone-200 truncate min-w-0 flex-1">
                      {r.student.tenThanh ? <span className="font-medium text-stone-500 mr-1">{r.student.tenThanh}</span> : ""}{r.student.hoTen || r.student.username}
                    </span>
                    {r.warning ? (
                      <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-[10px] font-bold tracking-wide uppercase">
                        ⚠️ Theo dõi
                      </span>
                    ) : (
                      <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold tracking-wide uppercase">
                        ✓ Ổn định
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 pl-[52px] text-center">
                    <div className="bg-white/50 dark:bg-stone-900/50 border border-amber-900/5 dark:border-amber-100/5 rounded-xl py-2">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1">Điểm Thi</p>
                      <p className="text-[14px] font-bold text-stone-700 dark:text-stone-300">{r.diemThi ?? "—"}</p>
                    </div>
                    <div className="bg-white/50 dark:bg-stone-900/50 border border-amber-900/5 dark:border-amber-100/5 rounded-xl py-2">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1">Điểm TB</p>
                      <p className={`text-[14px] font-extrabold ${tbColorClass(r.diemTB)}`}>{r.diemTB ?? "—"}</p>
                    </div>
                    <div className="bg-white/50 dark:bg-stone-900/50 border border-amber-900/5 dark:border-amber-100/5 rounded-xl py-2">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1">Học Lực</p>
                      <p className="text-[13px] font-semibold text-stone-600 dark:text-stone-400">{r.hocLuc || "—"}</p>
                    </div>
                    <div className="bg-white/50 dark:bg-stone-900/50 border border-amber-900/5 dark:border-amber-100/5 rounded-xl py-2">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1">Hạnh Kiểm</p>
                      <p className="text-[13px] font-semibold text-stone-600 dark:text-stone-400">{r.hanhKiem || "—"}</p>
                    </div>
                    <div className="bg-white/50 dark:bg-stone-900/50 border border-amber-900/5 dark:border-amber-100/5 rounded-xl py-2">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1">Vắng CP</p>
                      <p className="text-[14px] font-bold text-stone-600 dark:text-stone-400">{r.vangCoPhep || 0}</p>
                    </div>
                    <div className="bg-white/50 dark:bg-stone-900/50 border border-amber-900/5 dark:border-amber-100/5 rounded-xl py-2">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1">Vắng KP</p>
                      <p className={`text-[14px] font-bold ${r.vangKhongPhep > 0 ? "text-amber-600 dark:text-amber-500" : "text-stone-600 dark:text-stone-400"}`}>
                        {r.vangKhongPhep || 0}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {rows.length === 0 && (
                <p className="text-center text-[14px] text-stone-500 dark:text-stone-400 py-12 px-5">Lớp chưa có học sinh nào.</p>
              )}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block print:block overflow-auto max-h-[65vh] print:max-h-none print:overflow-visible" data-lenis-prevent>
              <table className="w-full text-sm border-collapse min-w-[760px]">
                <thead>
                  <tr className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70">
                    <th className="text-center px-3 py-4 sticky top-0 left-0 bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl z-20 w-14 border-b border-amber-900/10 dark:border-amber-100/10">STT</th>
                    <th className="text-left px-4 py-4 sticky top-0 left-[56px] bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl z-20 border-b border-amber-900/10 dark:border-amber-100/10">Họ & Tên</th>
                    <th className="text-center px-2 py-4 sticky top-0 bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl z-10 border-b border-amber-900/10 dark:border-amber-100/10">Điểm Thi</th>
                    <th className="text-center px-2 py-4 sticky top-0 bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl z-10 border-b border-amber-900/10 dark:border-amber-100/10">Điểm TB</th>
                    <th className="text-center px-2 py-4 sticky top-0 bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl z-10 border-b border-amber-900/10 dark:border-amber-100/10">Học Lực</th>
                    <th className="text-center px-2 py-4 sticky top-0 bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl z-10 border-b border-amber-900/10 dark:border-amber-100/10">Hạnh Kiểm</th>
                    <th className="text-center px-2 py-4 sticky top-0 bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl z-10 border-b border-amber-900/10 dark:border-amber-100/10">Vắng CP</th>
                    <th className="text-center px-2 py-4 sticky top-0 bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl z-10 border-b border-amber-900/10 dark:border-amber-100/10">Vắng KP</th>
                    <th className="text-center px-2 py-4 sticky top-0 bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl z-10 border-b border-amber-900/10 dark:border-amber-100/10">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-900/5 dark:divide-amber-100/5">
                  {rows.map((r, idx) => {
                    const isWarn = r.warning;
                    const rowBg = isWarn ? "bg-red-50/60 dark:bg-red-950/20" : "bg-transparent hover:bg-stone-50 dark:hover:bg-stone-800/50";
                    return (
                      <motion.tr 
                        initial={{ opacity: 0 }} 
                        whileInView={{ opacity: 1 }} 
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: idx * 0.02, ease: APPLE_EASE }}
                        key={r.student.username} 
                        className={`transition-colors duration-300 ${rowBg}`}
                      >
                        <td className={`px-3 py-3 text-center sticky left-0 z-10 text-[12px] font-bold text-amber-800/50 dark:text-amber-400/50 w-14 ${isWarn ? "bg-red-50 dark:bg-[#342020]" : "bg-white dark:bg-[#1C1917]"}`}>
                          {idx + 1}
                        </td>
                        <td className={`px-4 py-3 sticky left-[56px] z-10 ${isWarn ? "bg-red-50 dark:bg-[#342020]" : "bg-white dark:bg-[#1C1917]"}`}>
                          <div className="flex items-center gap-3 min-w-[180px]">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-200 dark:border-stone-700 flex-shrink-0 bg-stone-100 print:hidden">
                              <img src={r.student.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[14px] font-bold text-stone-800 dark:text-stone-100 truncate">
                              {r.student.tenThanh ? <span className="font-medium text-stone-500 mr-1">{r.student.tenThanh}</span> : ""}{r.student.hoTen || r.student.username}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-3 text-center text-[14px] font-bold text-stone-700 dark:text-stone-300">{r.diemThi ?? "—"}</td>
                        <td className={`px-2 py-3 text-center text-[14px] font-extrabold ${tbColorClass(r.diemTB)}`}>{r.diemTB ?? "—"}</td>
                        <td className="px-2 py-3 text-center text-[13px] font-semibold text-stone-600 dark:text-stone-400">{r.hocLuc || "—"}</td>
                        <td className="px-2 py-3 text-center text-[13px] font-semibold text-stone-600 dark:text-stone-400">{r.hanhKiem || "—"}</td>
                        <td className="px-2 py-3 text-center text-[14px] font-bold text-stone-600 dark:text-stone-400">{r.vangCoPhep || 0}</td>
                        <td className={`px-2 py-3 text-center text-[14px] font-bold ${r.vangKhongPhep > 0 ? "text-amber-600 dark:text-amber-500" : "text-stone-600 dark:text-stone-400"}`}>
                          {r.vangKhongPhep || 0}
                        </td>
                        <td className="px-2 py-3 text-center">
                          {isWarn ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-[10px] font-bold tracking-wide uppercase">
                              ⚠️ Theo dõi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold tracking-wide uppercase">
                              ✓ Ổn định
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center text-[14px] text-stone-500 py-12">Lớp chưa có học sinh nào.</td>
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