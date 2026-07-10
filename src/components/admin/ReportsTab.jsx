import React, { useState, useEffect, useCallback } from "react";
import { BarChart3, FileSpreadsheet, Printer, Filter } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { useAdminContext } from "./AdminContext.jsx";
import { TableSkeleton } from "../ui/Skeleton.jsx";

/* ============================================================
   TAB: BÁO CÁO & THỐNG KÊ (module F)
   ============================================================ */

export default function ReportsTab() {
  const { classes, namHoc, loading: contextLoading, showToast } = useAdminContext();

  const [reportType, setReportType] = useState("hoc_luc"); // 'hoc_luc' | 'hanh_kiem'
  const [term, setTerm] = useState("CN"); // 'HK1' | 'HK2' | 'CN'

  const [stats, setStats] = useState([]);
  // loadingStats: dùng cho spinner khi đổi filter/tab (KHÔNG dùng skeleton ở
  // đây — bảng vẫn giữ khung cũ, chỉ nội dung bên trong xoay spinner để
  // tránh giật layout do đổi qua lại giữa skeleton <-> bảng liên tục).
  const [loadingStats, setLoadingStats] = useState(true);
  const [exporting, setExporting] = useState(false);

  // isHocLuc/headerCount cần khai báo TRƯỚC early-return contextLoading bên
  // dưới, vì skeleton lúc load lần đầu cũng cần biết số cột để khớp đúng
  // bảng thật, tránh layout shift khi context load xong.
  const isHocLuc = reportType === "hoc_luc";
  const headerCount = isHocLuc ? 5 : 4; // Giỏi/Khá/TB/Yếu/Kém hoặc Tốt/Khá/TB/Yếu
  const totalCols = 3 + headerCount; // Lớp + Sĩ số + Đã xếp loại + các cột xếp loại

  // Lấy dữ liệu thống kê dựa trên type và term
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

      // Khởi tạo khung thống kê dựa trên danh sách lớp hiện có
      const aggregated = {};
      classes.forEach((c) => {
        aggregated[c.lop] = {
          lop: c.lop,
          studentCount: c.studentCount,
          totalGraded: 0,
          gioi: 0, kha: 0, tb: 0, yeu: 0, kem: 0, tot: 0,
        };
      });

      // Đổ dữ liệu vào khung — chỉ đếm những em đã được xếp loại
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

  // Hàm tính phần trăm.
  // LƯU Ý: chỉ coi là "không có dữ liệu" (—) khi total === 0 (chưa ai được
  // xếp loại). Không được gộp chung với count === 0 (đã xếp loại đầy đủ
  // nhưng đúng là không có học sinh nào rơi vào mức này) — hai trường hợp
  // này khác nhau về ý nghĩa thống kê, gộp lại sẽ khiến người đọc báo cáo
  // không phân biệt được "0 học sinh Yếu" với "chưa có dữ liệu". Để đỡ rối
  // mắt, số 0 được làm mờ màu thay vì thay hẳn bằng gạch ngang.
  const renderCell = (count, total) => {
    if (total === 0) return <span className="text-stone-300 dark:text-stone-600">—</span>;
    const percent = ((count / total) * 100).toFixed(1);
    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className={`text-[13px] font-semibold ${count === 0 ? "text-stone-300 dark:text-stone-600" : "text-stone-700 dark:text-stone-200"}`}>
          {count}
        </span>
        <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">{percent}%</span>
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

  // Chỉ dùng skeleton cho lần load NGỮ CẢNH đầu tiên (chưa có gì trên màn
  // hình để giữ chỗ). Từ lần đổi filter/tab về sau, loadingStats dùng
  // spinner bên trong khung bảng đã dựng sẵn (xem bên dưới) — không quay
  // lại skeleton nữa, tránh cảm giác "giật" giao diện khi thao tác nhanh.
  if (contextLoading) {
    return <TableSkeleton rows={6} columns={totalCols} />;
  }

  return (
    <div className="flex flex-col gap-4 fade-in-up">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #admin-reports-print, #admin-reports-print * { visibility: visible; }
          #admin-reports-print { 
            position: absolute; left: 0; top: 0; width: 100%; 
            background: white !important; /* Đảm bảo nền trắng */
          }
          .ag-no-print { display: none !important; }

          /* Ép border hiện rõ và loại bỏ hiệu ứng mờ */
          * { 
            backdrop-filter: none !important; 
            -webkit-backdrop-filter: none !important; 
            text-shadow: none !important;
            box-shadow: none !important;
          }

          /* Ép bảng in ra border đen rõ nét */
          table { 
            border-collapse: collapse !important; 
            width: 100% !important; 
            border: 1px solid #000 !important;
          }
          th, td { 
            border: 0.5pt solid #000 !important; /* Dùng đơn vị pt để in chuẩn hơn */
            padding: 8px !important;
          }
          thead tr { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; }
          
          /* Loại bỏ sticky để tránh bị cắt mất dòng khi in */
          .sticky { position: static !important; }
        }
      `}</style>

      {/* ---------- Filter Bar ---------- */}
      <div className="rounded-[20px] border border-black/5 dark:border-white/10
        bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl shadow-sm p-3 sm:p-5 
        flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">

        <div className="flex flex-wrap gap-2">
           {/* Nút bấm chuyển đổi gọn hơn cho mobile */}
           <div className="flex bg-stone-100 dark:bg-white/[0.06] rounded-xl p-1 w-full sm:w-auto">
             <button onClick={() => setReportType("hoc_luc")} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[12px] font-bold transition-all ${isHocLuc ? "bg-white dark:bg-stone-700 shadow-sm" : "text-stone-500"}`}>Học Lực</button>
             <button onClick={() => setReportType("hanh_kiem")} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[12px] font-bold transition-all ${!isHocLuc ? "bg-white dark:bg-stone-700 shadow-sm" : "text-stone-500"}`}>Hạnh Kiểm</button>
           </div>
           
           <div className="flex bg-stone-100 dark:bg-white/[0.06] rounded-xl p-1 w-full sm:w-auto">
             {["HK1", "HK2", "CN"].map((k) => (
               <button key={k} onClick={() => setTerm(k)} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[12px] font-bold ${term === k ? "bg-white dark:bg-stone-700 shadow-sm" : "text-stone-500"}`}>{k === "CN" ? "Cả năm" : k}</button>
             ))}
           </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button disabled={exporting || loadingStats || stats.length === 0} onClick={exportExcel} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-[12px] font-bold active:scale-95 transition-all"><FileSpreadsheet className="w-4 h-4" /> Excel</button>
          <button disabled={exporting || loadingStats || stats.length === 0} onClick={exportPDF} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[12px] font-bold active:scale-95 transition-all"><Printer className="w-4 h-4" /> PDF</button>
        </div>
      </div>

      {/* ---------- Bảng Số Liệu ---------- */}
      <div id="admin-reports-print" className="rounded-[26px] border border-black/5 dark:border-white/10
        bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl
        shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.10)]
        dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_12px_32px_-16px_rgba(0,0,0,0.5)]
        overflow-hidden print:overflow-visible print:bg-white print:shadow-none print:border-0 print:rounded-none print:backdrop-blur-none">

        {/* Header khi in */}
        <div className="hidden print:block px-5 pt-5 pb-3">
          <h2 className="text-lg font-bold text-stone-900 uppercase tracking-wide">
            Thống kê {isHocLuc ? "Học Lực" : "Hạnh Kiểm"} — {term === "CN" ? "Cả Năm" : (term === "HK1" ? "Học Kỳ I" : "Học Kỳ II")} — {namHoc}
          </h2>
        </div>

        {/* Khung bảng luôn được dựng sẵn (kể cả lúc loadingStats) để tránh
            chuyển đổi qua lại giữa skeleton <-> bảng thật mỗi khi đổi
            filter — chỉ phần <tbody> đổi giữa spinner và dữ liệu. */}
        <div className="overflow-auto max-h-[65vh] print:max-h-none print:overflow-visible px-0 print:px-5 print:pb-5" data-lenis-prevent>
          {!loadingStats && stats.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
              <BarChart3 className="w-8 h-8 text-stone-300 dark:text-stone-600" />
              <p className="text-[13px] text-stone-400 dark:text-stone-500">Chưa có dữ liệu lớp cho năm học này.</p>
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
                <tr className="bg-stone-50 dark:bg-white/[0.05] text-[11px] text-stone-400 dark:text-stone-500 uppercase tracking-wide print:text-stone-600">
                  <th className="text-left font-semibold px-5 py-3.5 sticky top-0 bg-stone-50 dark:bg-[#1c1c1e] z-10 print:static print:border print:bg-white truncate">Lớp</th>
                  <th className="text-center font-semibold px-3 py-3.5 sticky top-0 bg-stone-50 dark:bg-[#1c1c1e] z-10 print:static print:border print:bg-white truncate">Sĩ số</th>
                  <th className="text-center font-semibold px-3 py-3.5 sticky top-0 bg-stone-50 dark:bg-[#1c1c1e] z-10 print:static print:border print:bg-white truncate">Đã xếp loại</th>
                  {(isHocLuc
                    ? ["Giỏi", "Khá", "Trung Bình", "Yếu", "Kém"]
                    : ["Tốt", "Khá", "Trung Bình", "Yếu"]
                  ).map((h) => (
                    <th key={h} className="text-center font-semibold px-2 py-3.5 sticky top-0 bg-stone-50 dark:bg-[#1c1c1e] z-10 print:static print:border print:bg-white truncate">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingStats ? (
                  <tr>
                    <td colSpan={totalCols} className="py-14">
                      <div className="flex justify-center">
                        <div className="w-7 h-7 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin dark:border-white/10 dark:border-t-white" />
                      </div>
                    </td>
                  </tr>
                ) : (
                  stats.map((r) => (
                    <tr key={r.lop} className="border-b border-stone-50 dark:border-white/[0.05] hover:bg-stone-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 text-[13.5px] font-bold text-stone-800 dark:text-white print:border truncate">
                        {r.lop}
                      </td>
                      <td className="px-3 py-3 text-center text-[13px] font-medium text-stone-500 dark:text-stone-400 print:border">
                        {r.studentCount}
                      </td>
                      <td className="px-3 py-3 text-center text-[13px] font-medium text-stone-700 dark:text-stone-300 print:border bg-stone-50/50 dark:bg-white/[0.02]">
                        {r.totalGraded}
                      </td>
                      {isHocLuc ? (
                        <>
                          <td className="px-2 py-3 text-center print:border">{renderCell(r.gioi, r.totalGraded)}</td>
                          <td className="px-2 py-3 text-center print:border">{renderCell(r.kha, r.totalGraded)}</td>
                          <td className="px-2 py-3 text-center print:border">{renderCell(r.tb, r.totalGraded)}</td>
                          <td className="px-2 py-3 text-center print:border">{renderCell(r.yeu, r.totalGraded)}</td>
                          <td className="px-2 py-3 text-center print:border">{renderCell(r.kem, r.totalGraded)}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-2 py-3 text-center print:border">{renderCell(r.tot, r.totalGraded)}</td>
                          <td className="px-2 py-3 text-center print:border">{renderCell(r.kha, r.totalGraded)}</td>
                          <td className="px-2 py-3 text-center print:border">{renderCell(r.tb, r.totalGraded)}</td>
                          <td className="px-2 py-3 text-center print:border">{renderCell(r.yeu, r.totalGraded)}</td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer info */}
        {!loadingStats && stats.length > 0 && (
          <div className="px-5 py-3.5 border-t border-black/5 dark:border-white/10 bg-stone-50/80 dark:bg-white/[0.02] text-[11px] text-stone-500 dark:text-stone-400 ag-no-print flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" />
            Số liệu phần trăm (%) được tính dựa trên cột <strong>Đã xếp loại</strong> (những học sinh đã có tổng kết, không tính những em chưa được nhập điểm).
          </div>
        )}
      </div>
    </div>
  );
}