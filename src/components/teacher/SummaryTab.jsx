import React, { useEffect, useMemo, useRef, useState } from "react";
import { LayoutDashboard, Printer, FileSpreadsheet } from "lucide-react";
import { Spinner } from "../ui/StudentShared.jsx";
import { useTeacherContext } from "./TeacherContext.jsx";
import { fetchClassSummary } from "./api.js";
import { sortStudentsByTen, tbColorClass } from "./utils.js";
import { ACCENT, HK_INT_MAP } from "./constants.js";

/* ============================================================
   BẢNG TỔNG KẾT LỚP — chỉ xem (read-only), gộp điểm + học lực/hạnh
   kiểm + điểm danh thành 1 bảng "quét mắt" cho giáo viên, kèm cảnh
   báo tự động (đỏ) và xuất Excel / in-PDF.
   ============================================================ */
export default function SummaryTab() {
  const { students, context, initialSummary } = useTeacherContext();
  const namHoc = context.namHoc;
  const lop    = context.lop;

  const [hocKy, setHocKy] = useState("HK1");
  const hocKyInt = HK_INT_MAP[hocKy];
  // Nếu có sẵn tổng kết HK1 tải kèm roster từ TeacherProvider, dùng luôn cho
  // lần render đầu — tránh phải tự fetch + tự hiện spinner riêng ngay sau
  // khi vừa hết loading roster.
  const hasUsableInitial = initialSummary && initialSummary.hocKyInt === hocKyInt;
  const [summary, setSummary] = useState(() => (hasUsableInitial ? initialSummary.data : {}));
  const [loading, setLoading] = useState(() => !hasUsableInitial);
  const isFirstRun = useRef(true);

  const rosterStudents = useMemo(() => sortStudentsByTen(students), [students]);

  useEffect(() => {
    // Chỉ bỏ qua fetch ở ĐÚNG lần chạy đầu tiên và khi initialSummary khớp
    // học kỳ đang chọn — mọi thay đổi sau đó (đổi học kỳ, roster đổi) đều
    // fetch lại bình thường.
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
      // Cảnh báo: Điểm TB < 5 HOẶC tổng số buổi vắng (cả có phép + không phép) > 3.
      // Muốn chỉ tính vắng không phép: đổi "tongVang > 3" thành "(d.vangKhongPhep || 0) > 3".
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

  if (loading) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm flex items-center justify-center gap-2.5 py-14" style={{ color: ACCENT }}>
        <Spinner className="h-5 w-5" />
        <span className="text-sm text-stone-500 dark:text-stone-400">Đang tổng hợp dữ liệu lớp…</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm overflow-hidden">
      {/* Chỉ in phần bảng, ẩn toàn bộ phần còn lại của trang khi bấm "In / Xuất PDF" */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #tk-summary-print, #tk-summary-print * { visibility: visible; }
          #tk-summary-print { position: absolute; left: 0; top: 0; width: 100%; }
          .tk-no-print { display: none !important; }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-stone-100 dark:border-stone-800 tk-no-print">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <LayoutDashboard className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} />
          <div className="flex gap-1 bg-stone-100 dark:bg-stone-800 rounded-xl p-1">
            {["HK1", "HK2"].map((k) => (
              <button key={k} type="button" onClick={() => setHocKy(k)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                  hocKy === k ? "bg-white dark:bg-stone-700 text-[#FF6B35] dark:text-orange-400 shadow-sm" : "text-stone-500 dark:text-stone-400"
                }`}>
                {k === "HK1" ? "Học Kỳ I" : "Học Kỳ II"}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-stone-400 dark:text-stone-500 hidden md:inline">
            Chỉ xem — dòng đỏ: Điểm TB &lt; 5 hoặc vắng &gt; 3 buổi
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto flex-shrink-0">
          <button type="button" onClick={exportExcel}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-[13px] font-bold hover:bg-emerald-700 transition-colors">
            <FileSpreadsheet className="w-4 h-4" /> <span className="sm:inline">Xuất Excel</span>
          </button>
          <button type="button" onClick={handlePrint}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-800 text-white dark:text-stone-150 hover:bg-stone-800 dark:hover:bg-stone-700 transition-colors">
            <Printer className="w-4 h-4" /> <span className="sm:inline">In / PDF</span>
          </button>
        </div>
      </div>

      <div id="tk-summary-print" className="p-5">
        <div className="hidden print:block mb-3">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Bảng tổng kết lớp {lop} — {hocKy === "HK1" ? "Học kỳ I" : "Học kỳ II"} — {namHoc}
          </h2>
        </div>

        {/* MOBILE: mỗi học sinh 1 thẻ tổng hợp, dễ quét mắt hơn kéo ngang bảng */}
        <div className="md:hidden divide-y divide-stone-50 dark:divide-stone-850 print:hidden">
          {rows.map((r, idx) => (
            <div key={r.student.username} className={`px-4 py-3.5 ${r.warning ? "bg-red-50/60 dark:bg-red-950/20" : ""}`}>
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 w-4 flex-shrink-0 text-center">{idx + 1}</span>
                <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-200 dark:border-stone-850 flex-shrink-0 bg-stone-100 dark:bg-stone-800">
                  <img src={r.student.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-[13px] font-semibold text-stone-800 dark:text-stone-200 truncate min-w-0 flex-1">
                  {r.student.tenThanh ? `${r.student.tenThanh} ` : ""}{r.student.hoTen || r.student.username}
                </span>
                {r.warning ? (
                  <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-[10px] font-bold whitespace-nowrap">
                    ⚠️ Theo dõi
                  </span>
                ) : (
                  <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold whitespace-nowrap">
                    ✓ Ổn định
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 pl-[42px] text-center">
                <div className="bg-[#F9F9F9] dark:bg-stone-850/60 rounded-lg py-1.5">
                  <p className="text-[9px] text-stone-400 dark:text-stone-500 mb-0.5">Điểm Thi</p>
                  <p className="text-[13px] font-semibold text-stone-700 dark:text-stone-300">{r.diemThi ?? "—"}</p>
                </div>
                <div className="bg-[#F9F9F9] dark:bg-stone-850/60 rounded-lg py-1.5">
                  <p className="text-[9px] text-stone-400 dark:text-stone-500 mb-0.5">Điểm TB</p>
                  <p className={`text-[13px] font-bold ${tbColorClass(r.diemTB)}`}>{r.diemTB ?? "—"}</p>
                </div>
                <div className="bg-[#F9F9F9] dark:bg-stone-850/60 rounded-lg py-1.5">
                  <p className="text-[9px] text-stone-400 dark:text-stone-500 mb-0.5">Học Lực</p>
                  <p className="text-[12px] font-medium text-stone-600 dark:text-stone-400">{r.hocLuc || "—"}</p>
                </div>
                <div className="bg-[#F9F9F9] dark:bg-stone-850/60 rounded-lg py-1.5">
                  <p className="text-[9px] text-stone-400 dark:text-stone-500 mb-0.5">Hạnh Kiểm</p>
                  <p className="text-[12px] font-medium text-stone-600 dark:text-stone-400">{r.hanhKiem || "—"}</p>
                </div>
                <div className="bg-[#F9F9F9] dark:bg-stone-850/60 rounded-lg py-1.5">
                  <p className="text-[9px] text-stone-400 dark:text-stone-500 mb-0.5">Vắng CP</p>
                  <p className="text-[13px] font-medium text-stone-600 dark:text-stone-400">{r.vangCoPhep || 0}</p>
                </div>
                <div className="bg-[#F9F9F9] dark:bg-stone-850/60 rounded-lg py-1.5">
                  <p className="text-[9px] text-stone-400 dark:text-stone-500 mb-0.5">Vắng KP</p>
                  <p className="text-[13px] font-medium text-stone-600 dark:text-stone-400">{r.vangKhongPhep || 0}</p>
                </div>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="text-center text-sm text-stone-400 dark:text-stone-550 py-10 px-4">Lớp chưa có học sinh nào.</p>
          )}
        </div>

        {/* DESKTOP + IN/PDF: bảng đầy đủ */}
        <div className="hidden md:block print:block overflow-auto max-h-[65vh] print:max-h-none print:overflow-visible" data-lenis-prevent>
          <table className="w-full text-sm border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-[#F9F9F9] dark:bg-stone-850 text-[11px] text-stone-400 dark:text-stone-500 uppercase tracking-wide">
                <th className="text-center font-semibold px-3 py-3 sticky top-0 left-0 bg-[#F9F9F9] dark:bg-stone-850 z-20 w-12">STT</th>
                <th className="text-left font-semibold px-4 py-3 sticky top-0 left-[48px] bg-[#F9F9F9] dark:bg-stone-850 z-20">Họ & Tên</th>
                <th className="text-center font-semibold px-2 py-3 sticky top-0 bg-[#F9F9F9] dark:bg-stone-850 z-10">Điểm Thi</th>
                <th className="text-center font-semibold px-2 py-3 sticky top-0 bg-[#F9F9F9] dark:bg-stone-850 z-10">Điểm TB</th>
                <th className="text-center font-semibold px-2 py-3 sticky top-0 bg-[#F9F9F9] dark:bg-stone-850 z-10">Học Lực</th>
                <th className="text-center font-semibold px-2 py-3 sticky top-0 bg-[#F9F9F9] dark:bg-stone-850 z-10">Hạnh Kiểm</th>
                <th className="text-center font-semibold px-2 py-3 sticky top-0 bg-[#F9F9F9] dark:bg-stone-850 z-10">Vắng CP</th>
                <th className="text-center font-semibold px-2 py-3 sticky top-0 bg-[#F9F9F9] dark:bg-stone-850 z-10">Vắng KP</th>
                <th className="text-center font-semibold px-2 py-3 sticky top-0 bg-[#F9F9F9] dark:bg-stone-850 z-10">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => {
                const rowBg = r.warning ? "bg-red-50 dark:bg-red-950/20" : "bg-white dark:bg-stone-900";
                return (
                  <tr key={r.student.username} className="border-b border-stone-50 dark:border-stone-850">
                    <td className={`px-3 py-2.5 text-center sticky left-0 z-10 text-[12px] font-medium text-stone-400 dark:text-stone-500 w-12 ${rowBg}`}>
                      {idx + 1}
                    </td>
                    <td className={`px-4 py-2.5 sticky left-[48px] z-10 ${rowBg}`}>
                      <div className="flex items-center gap-2.5 min-w-[170px]">
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-stone-200 dark:border-stone-800 flex-shrink-0 bg-stone-100 dark:bg-stone-800 print:hidden">
                          <img src={r.student.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[13px] font-semibold text-stone-800 dark:text-stone-200">
                          {r.student.tenThanh ? `${r.student.tenThanh} ` : ""}{r.student.hoTen || r.student.username}
                        </span>
                      </div>
                    </td>
                    <td className={`px-2 py-2.5 text-center text-[13px] font-medium text-stone-700 dark:text-stone-300 ${rowBg}`}>{r.diemThi ?? "—"}</td>
                    <td className={`px-2 py-2.5 text-center text-[13px] font-bold ${tbColorClass(r.diemTB)} ${rowBg}`}>{r.diemTB ?? "—"}</td>
                    <td className={`px-2 py-2.5 text-center text-[12px] text-stone-600 dark:text-stone-400 ${rowBg}`}>{r.hocLuc || "—"}</td>
                    <td className={`px-2 py-2.5 text-center text-[12px] text-stone-600 dark:text-stone-400 ${rowBg}`}>{r.hanhKiem || "—"}</td>
                    <td className={`px-2 py-2.5 text-center text-[13px] text-stone-600 dark:text-stone-400 ${rowBg}`}>{r.vangCoPhep || 0}</td>
                    <td className={`px-2 py-2.5 text-center text-[13px] text-stone-600 dark:text-stone-400 ${rowBg}`}>{r.vangKhongPhep || 0}</td>
                    <td className={`px-2 py-2.5 text-center ${rowBg}`}>
                      {r.warning ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-[11px] font-bold">
                          ⚠️ Cần theo dõi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                          ✓ Ổn định
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-sm text-stone-400 dark:text-stone-500 py-10">Lớp chưa có học sinh nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}