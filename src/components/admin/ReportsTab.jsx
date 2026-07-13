import React, { useState, useEffect, useCallback } from "react";
import { BarChart3, FileSpreadsheet, Printer, Filter } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { useAdminContext } from "./AdminContext.jsx";
import { TableSkeleton } from "../ui/Skeleton.jsx";

/* ============================================================
   TAB: BÁO CÁO & THỐNG KÊ (module F)
   UI nâng cấp: Apple-style Glassmorphism, tone màu uy nghi (Amber)
   ============================================================ */

export default function ReportsTab() {
  const { classes, namHoc, loading: contextLoading, showToast } = useAdminContext();

  const [reportType, setReportType] = useState("hoc_luc"); // 'hoc_luc' | 'hanh_kiem'
  const [term, setTerm] = useState("CN"); // 'HK1' | 'HK2' | 'CN'

  const [stats, setStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [exporting, setExporting] = useState(false);

  const isHocLuc = reportType === "hoc_luc";
  const headerCount = isHocLuc ? 5 : 4; 
  const totalCols = 3 + headerCount; 

  const loadReports = useCallback(async () => {
    if (!classes || classes.length === 0) {
      setStats([]);
      setLoadingStats(false);
      return;
    }

    setLoadingStats(true);
    try {
      let data = [];
      if (term === "CN") {
        const { data: res, error } = await supabase
          .from("year_summary")
          .select("lop, hoc_luc, hanh_kiem")
          .eq("nam_hoc", namHoc);
        if (error) throw error;
        data = res || [];
      } else {
        const hocKyInt = term === "HK1" ? 1 : 2;
        const { data: res, error } = await supabase
          .from("term_summary")
          .select("lop, hoc_luc, hanh_kiem")
          .eq("nam_hoc", namHoc)
          .eq("hoc_ky", hocKyInt);
        if (error) throw error;
        data = res || [];
      }

      const aggregated = {};
      classes.forEach((c) => {
        aggregated[c.lop] = {
          lop: c.lop,
          studentCount: c.studentCount,
          totalGraded: 0,
          gioi: 0, kha: 0, tb: 0, yeu: 0, kem: 0, tot: 0,
        };
      });

      data.forEach((row) => {
        if (!row.lop || !aggregated[row.lop]) return;

        if (reportType === "hoc_luc" && row.hoc_luc) {
          aggregated[row.lop].totalGraded += 1;
          if (row.hoc_luc === "Giỏi") aggregated[row.lop].gioi += 1;
          else if (row.hoc_luc === "Khá") aggregated[row.lop].kha += 1;
          else if (row.hoc_luc === "Trung Bình") aggregated[row.lop].tb += 1;
          else if (row.hoc_luc === "Yếu") aggregated[row.lop].yeu += 1;
          else if (row.hoc_luc === "Kém") aggregated[row.lop].kem += 1;
        } else if (reportType === "hanh_kiem" && row.hanh_kiem) {
          aggregated[row.lop].totalGraded += 1;
          if (row.hanh_kiem === "Tốt") aggregated[row.lop].tot += 1;
          else if (row.hanh_kiem === "Khá") aggregated[row.lop].kha += 1;
          else if (row.hanh_kiem === "Trung Bình") aggregated[row.lop].tb += 1;
          else if (row.hanh_kiem === "Yếu") aggregated[row.lop].yeu += 1;
        }
      });

      setStats(Object.values(aggregated).sort((a, b) => a.lop.localeCompare(b.lop, "vi")));
    } catch (err) {
      console.error("load reports error:", err);
      showToast("Không tải được dữ liệu báo cáo", "error");
    } finally {
      setLoadingStats(false);
    }
  }, [namHoc, term, reportType, classes, showToast]);

  useEffect(() => {
    if (!contextLoading) {
      loadReports();
    }
  }, [loadReports, contextLoading]);

  const renderCell = (count, total) => {
    if (total === 0) return <span className="text-stone-300 dark:text-stone-600">—</span>;
    const percent = ((count / total) * 100).toFixed(1);
    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className={`text-[13.5px] font-bold ${count === 0 ? "text-stone-300 dark:text-stone-600" : "text-amber-950 dark:text-amber-50"}`}>
          {count}
        </span>
        <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium tracking-wide">
          {percent}%
        </span>
      </div>
    );
  };

  const exportExcel = async () => {
    setExporting(true);
    try {
      const XLSX = await import("xlsx");
      const data = stats.map((r, idx) => {
        const base = {
          "STT": idx + 1,
          "Lớp": r.lop,
          "Sĩ số lớp": r.studentCount,
          "Đã đánh giá": r.totalGraded,
        };
        if (reportType === "hoc_luc") {
          return {
            ...base,
            "Giỏi": r.gioi, "Khá": r.kha, "Trung Bình": r.tb, "Yếu": r.yeu, "Kém": r.kem,
          };
        }
        return {
          ...base,
          "Tốt": r.tot, "Khá": r.kha, "Trung Bình": r.tb, "Yếu": r.yeu,
        };
      });
      const ws = XLSX.utils.json_to_sheet(data);
      ws["!cols"] = [
        { wch: 5 }, { wch: 14 }, { wch: 12 }, { wch: 12 },
        ...Array(headerCount).fill({ wch: 10 }),
      ];
      const wb = XLSX.utils.book_new();

      const termLabel = term === "CN" ? "CaNam" : term;
      const typeLabel = reportType === "hoc_luc" ? "HocLuc" : "HanhKiem";

      XLSX.utils.book_append_sheet(wb, ws, "Thống kê");
      XLSX.writeFile(wb, `ThongKe_${typeLabel}_${termLabel}_${namHoc}.xlsx`);
    } catch (err) {
      console.error("export excel error:", err);
      showToast("Xuất Excel thất bại", "error");
    } finally {
      setExporting(false);
    }
  };

  const exportPDF = () => {
    requestAnimationFrame(() => window.print());
  };

  if (contextLoading) {
    return <TableSkeleton rows={6} columns={totalCols} />;
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 fade-in-up">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #admin-reports-print, #admin-reports-print * { visibility: visible; }
          #admin-reports-print { 
            position: absolute; left: 0; top: 0; width: 100%; 
            background: white !important; 
          }
          .ag-no-print { display: none !important; }

          * { 
            backdrop-filter: none !important; 
            -webkit-backdrop-filter: none !important; 
            text-shadow: none !important;
            box-shadow: none !important;
          }

          table { 
            border-collapse: collapse !important; 
            width: 100% !important; 
            border: 1px solid #000 !important;
          }
          th, td { 
            border: 0.5pt solid #000 !important; 
            padding: 8px !important;
          }
          thead tr { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; }
          
          .sticky { position: static !important; }
        }
      `}</style>

      {/* ---------- Bộ Lọc (Filter Bar) ---------- */}
      <div className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm p-4 sm:p-5 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">

        <div className="flex flex-wrap gap-3">
           {/* Chọn Loại Báo Cáo */}
           <div className="flex bg-white/60 dark:bg-stone-900/40 rounded-2xl p-1.5 border border-amber-900/10 dark:border-amber-100/10 shadow-sm backdrop-blur-sm w-full sm:w-auto">
             <button 
               type="button"
               onClick={() => setReportType("hoc_luc")} 
               className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-[13.5px] font-bold transition-all duration-300 active:scale-[0.97] ${
                 isHocLuc 
                   ? "bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-sm" 
                   : "text-stone-500 dark:text-stone-400 md:hover:text-stone-800 dark:md:hover:text-stone-200"
               }`}
             >
               Học Lực
             </button>
             <button 
               type="button"
               onClick={() => setReportType("hanh_kiem")} 
               className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-[13.5px] font-bold transition-all duration-300 active:scale-[0.97] ${
                 !isHocLuc 
                   ? "bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-sm" 
                   : "text-stone-500 dark:text-stone-400 md:hover:text-stone-800 dark:md:hover:text-stone-200"
               }`}
             >
               Hạnh Kiểm
             </button>
           </div>
           
           {/* Chọn Học Kỳ */}
           <div className="flex bg-white/60 dark:bg-stone-900/40 rounded-2xl p-1.5 border border-amber-900/10 dark:border-amber-100/10 shadow-sm backdrop-blur-sm w-full sm:w-auto">
             {["HK1", "HK2", "CN"].map((k) => (
               <button 
                 key={k} 
                 type="button"
                 onClick={() => setTerm(k)} 
                 className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-[13.5px] font-bold transition-all duration-300 active:scale-[0.97] ${
                   term === k 
                     ? "bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-sm" 
                     : "text-stone-500 dark:text-stone-400 md:hover:text-stone-800 dark:md:hover:text-stone-200"
                 }`}
               >
                 {k === "CN" ? "Cả năm" : k}
               </button>
             ))}
           </div>
        </div>

        {/* Nút Xuất File */}
        <div className="flex gap-2.5 w-full sm:w-auto">
          <button 
            type="button"
            disabled={exporting || loadingStats || stats.length === 0} 
            onClick={exportExcel} 
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[14px] font-bold bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-sm transition-all duration-300 active:scale-[0.98] md:hover:-translate-y-0.5 disabled:opacity-50 disabled:active:scale-100 disabled:md:hover:translate-y-0"
          >
            <FileSpreadsheet className="w-4 h-4" strokeWidth={2.5} /> Excel
          </button>
          <button 
            type="button"
            disabled={exporting || loadingStats || stats.length === 0} 
            onClick={exportPDF} 
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[14px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-black/5 dark:border-white/5 transition-all duration-300 active:scale-[0.98] md:hover:-translate-y-0.5 md:hover:bg-stone-200 dark:md:hover:bg-stone-700 disabled:opacity-50 disabled:active:scale-100 disabled:md:hover:translate-y-0"
          >
            <Printer className="w-4 h-4" strokeWidth={2.5} /> In / PDF
          </button>
        </div>
      </div>

      {/* ---------- Bảng Số Liệu ---------- */}
      <div id="admin-reports-print" className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm overflow-hidden print:overflow-visible print:bg-white print:shadow-none print:border-0 print:rounded-none print:backdrop-blur-none">

        {/* Header khi in */}
        <div className="hidden print:block px-5 pt-6 pb-4">
          <h2 className="text-[22px] font-extrabold text-amber-950 font-serif uppercase tracking-wide">
            Thống kê {isHocLuc ? "Học Lực" : "Hạnh Kiểm"} — {term === "CN" ? "Cả Năm" : (term === "HK1" ? "Học Kỳ I" : "Học Kỳ II")} — {namHoc}
          </h2>
        </div>

        <div className="overflow-auto max-h-[65vh] print:max-h-none print:overflow-visible px-0 print:px-5 print:pb-5" data-lenis-prevent>
          {!loadingStats && stats.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 px-6 text-center">
              <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-1">
                <BarChart3 className="w-6 h-6 text-amber-700 dark:text-amber-400" strokeWidth={2} />
              </div>
              <p className="text-[15px] font-bold text-amber-950 dark:text-amber-50">Chưa có dữ liệu thống kê</p>
              <p className="text-[13.5px] font-medium text-stone-500 dark:text-stone-400">Không có dữ liệu lớp được đánh giá cho năm học này.</p>
            </div>
          ) : (
            <table className="w-full text-sm border-collapse table-fixed min-w-[700px] print:min-w-0">
              <colgroup>
                <col className="w-[20%]" />
                <col className="w-[12%]" />
                <col className="w-[14%]" />
                {Array.from({ length: headerCount }).map((_, i) => (
                  <col key={i} style={{ width: `${54 / headerCount}%` }} />
                ))}
              </colgroup>
              <thead>
                <tr className="bg-amber-50/50 dark:bg-amber-900/20 text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 print:text-stone-600">
                  <th className="text-left px-5 py-4 sticky top-0 bg-amber-50/95 dark:bg-[#1c1c1e]/95 backdrop-blur z-10 print:static print:border print:bg-white truncate border-b border-amber-900/10 dark:border-amber-100/10">Lớp</th>
                  <th className="text-center px-3 py-4 sticky top-0 bg-amber-50/95 dark:bg-[#1c1c1e]/95 backdrop-blur z-10 print:static print:border print:bg-white truncate border-b border-amber-900/10 dark:border-amber-100/10">Sĩ số</th>
                  <th className="text-center px-3 py-4 sticky top-0 bg-amber-50/95 dark:bg-[#1c1c1e]/95 backdrop-blur z-10 print:static print:border print:bg-white truncate border-b border-amber-900/10 dark:border-amber-100/10">Đã xếp loại</th>
                  {(isHocLuc
                    ? ["Giỏi", "Khá", "Trung Bình", "Yếu", "Kém"]
                    : ["Tốt", "Khá", "Trung Bình", "Yếu"]
                  ).map((h) => (
                    <th key={h} className="text-center px-2 py-4 sticky top-0 bg-amber-50/95 dark:bg-[#1c1c1e]/95 backdrop-blur z-10 print:static print:border print:bg-white truncate border-b border-amber-900/10 dark:border-amber-100/10">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingStats ? (
                  <tr>
                    <td colSpan={totalCols} className="py-20">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-900 rounded-full animate-spin dark:border-amber-900/30 dark:border-t-amber-500" />
                      </div>
                    </td>
                  </tr>
                ) : (
                  stats.map((r) => (
                    <tr key={r.lop} className="border-b border-amber-900/5 dark:border-amber-100/5 transition-colors duration-300 md:hover:bg-amber-50/50 dark:md:hover:bg-amber-900/10">
                      <td className="px-5 py-3.5 text-[14.5px] font-bold text-amber-950 dark:text-amber-50 print:border truncate">
                        {r.lop}
                      </td>
                      <td className="px-3 py-3.5 text-center text-[13.5px] font-bold text-stone-500 dark:text-stone-400 print:border">
                        {r.studentCount}
                      </td>
                      <td className="px-3 py-3.5 text-center text-[14px] font-bold text-amber-900 dark:text-amber-400 print:border bg-amber-50/30 dark:bg-amber-900/10">
                        {r.totalGraded}
                      </td>
                      {isHocLuc ? (
                        <>
                          <td className="px-2 py-3.5 text-center print:border">{renderCell(r.gioi, r.totalGraded)}</td>
                          <td className="px-2 py-3.5 text-center print:border">{renderCell(r.kha, r.totalGraded)}</td>
                          <td className="px-2 py-3.5 text-center print:border">{renderCell(r.tb, r.totalGraded)}</td>
                          <td className="px-2 py-3.5 text-center print:border">{renderCell(r.yeu, r.totalGraded)}</td>
                          <td className="px-2 py-3.5 text-center print:border">{renderCell(r.kem, r.totalGraded)}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-2 py-3.5 text-center print:border">{renderCell(r.tot, r.totalGraded)}</td>
                          <td className="px-2 py-3.5 text-center print:border">{renderCell(r.kha, r.totalGraded)}</td>
                          <td className="px-2 py-3.5 text-center print:border">{renderCell(r.tb, r.totalGraded)}</td>
                          <td className="px-2 py-3.5 text-center print:border">{renderCell(r.yeu, r.totalGraded)}</td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer info (Alert Box Style) */}
        {!loadingStats && stats.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-amber-900/10 dark:border-amber-100/10 ag-no-print">
            <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 p-4 rounded-2xl backdrop-blur-sm">
              <p className="text-[12px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 mb-1.5 ml-1 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> Ghi chú dữ liệu
              </p>
              <p className="text-[13.5px] font-medium text-amber-950 dark:text-amber-50 leading-relaxed ml-1">
                Số liệu phần trăm (%) được tính dựa trên cột <strong>Đã xếp loại</strong> (những học sinh đã có tổng kết, không tính những em chưa được nhập điểm đầy đủ).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}