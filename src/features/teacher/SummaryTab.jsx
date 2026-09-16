import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  XCircle,
  Users,
  TrendingUp,
  Search,
  X,
  ArrowUpDown,
  Filter,
  Download,
  Trophy,
  Award,
  CalendarDays,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { TableSkeleton, Spinner } from "../../components/ui/Skeleton.jsx";
import { useToast } from "../../components/ui/ToastContext.jsx";
import { useTeacherContext } from "./TeacherContext.jsx";
import { fetchClassSummary, fetchYearSummary } from "./api.js";
import { sortStudentsByTen, tbColorClass } from "./utils.js";
import { HK_INT_MAP } from "./constants.js";
import { preloadXLSX, getXLSX, triggerSafeExcelDownload } from "../admin/utils/excelRosterHelper.js";
import { preloadPDFLibs, exportSummaryReportPdf, triggerSafePdfDownload } from "../admin/utils/pdfExportHelper.js";

const APPLE_EASE = [0.16, 1, 0.3, 1];

export default function SummaryTab() {
  const { students, context, initialSummary } = useTeacherContext();
  const namHoc = context.namHoc;
  const lop = context.lop;
  const { showToast } = useToast();

  const [hocKy, setHocKy] = useState("HK1");
  const hocKyInt = HK_INT_MAP[hocKy];
  const isCaNam = hocKy === "CN";

  const hasUsableInitial = initialSummary && initialSummary.hocKyInt === hocKyInt;
  const [summary, setSummary] = useState(() => (hasUsableInitial ? initialSummary.data : {}));
  const [loading, setLoading] = useState(() => !hasUsableInitial);
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const isFirstRun = useRef(true);

  // Search, Filter & Sort states
  const [filterHocLuc, setFilterHocLuc] = useState("all"); // "all", "gioi", "kha", "tb", "yeuKem", "warning"
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default"); // "default", "name_asc", "dtb_desc", "dtb_asc", "vang_desc", "vithu_asc"

  // Preload export libs
  useEffect(() => {
    preloadXLSX();
    preloadPDFLibs();
  }, []);

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
  }, [rosterStudents, namHoc, hocKyInt, isCaNam, initialSummary]);

  const getKetQua = (hocLuc) => {
    if (!hocLuc) return null;
    if (hocLuc === "Kém") return { label: "Học lại", color: "text-red-700 dark:text-red-400", bg: "bg-red-500/10 dark:bg-red-500/15 border-red-500/20", Icon: XCircle };
    if (hocLuc === "Yếu") return { label: "Thi lại", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/20", Icon: RotateCcw };
    return { label: "Lên lớp", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/20", Icon: CheckCircle2 };
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
      gioi, kha, tb, yeuKem,
      warningCount: rows.filter(r => r.warning).length
    };
  }, [rows]);

  // Phân bổ tỷ lệ % học lực
  const distribution = useMemo(() => {
    const total = rows.length;
    if (total === 0) return null;
    const pGioi = Math.round((classStats.gioi / total) * 100);
    const pKha = Math.round((classStats.kha / total) * 100);
    const pTb = Math.round((classStats.tb / total) * 100);
    const pYeuKem = Math.round((classStats.yeuKem / total) * 100);
    return { pGioi, pKha, pTb, pYeuKem };
  }, [rows.length, classStats]);

  // Danh sách đã lọc và sắp xếp
  const filteredAndSortedRows = useMemo(() => {
    let result = rows;

    // 1. Lọc theo Học Lực / Warning
    if (filterHocLuc === "gioi") {
      result = result.filter(r => r.hocLuc === "Giỏi");
    } else if (filterHocLuc === "kha") {
      result = result.filter(r => r.hocLuc === "Khá");
    } else if (filterHocLuc === "tb") {
      result = result.filter(r => r.hocLuc === "Trung Bình");
    } else if (filterHocLuc === "yeuKem") {
      result = result.filter(r => r.hocLuc === "Yếu" || r.hocLuc === "Kém");
    } else if (filterHocLuc === "warning") {
      result = result.filter(r => r.warning);
    }

    // 2. Tìm kiếm theo tên, Tên Thánh, STT
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((r, idx) => {
        const stt = String(idx + 1);
        const name = (r.student.hoTen || r.student.ho_va_ten || "").toLowerCase();
        const holy = (r.student.tenThanh || "").toLowerCase();
        const user = (r.student.username || "").toLowerCase();
        return stt === q || name.includes(q) || holy.includes(q) || user.includes(q);
      });
    }

    // 3. Sắp xếp
    if (sortBy === "dtb_desc") {
      result = [...result].sort((a, b) => (Number(b.diemTB) || 0) - (Number(a.diemTB) || 0));
    } else if (sortBy === "dtb_asc") {
      result = [...result].sort((a, b) => (Number(a.diemTB) || 0) - (Number(b.diemTB) || 0));
    } else if (sortBy === "vang_desc") {
      result = [...result].sort((a, b) => (b.tongVang || 0) - (a.tongVang || 0));
    } else if (sortBy === "vithu_asc" && isCaNam) {
      result = [...result].sort((a, b) => (a.viThu ?? 999) - (b.viThu ?? 999));
    } else if (sortBy === "name_asc") {
      result = [...result].sort((a, b) => {
        const nameA = (a.student.hoTen || a.student.username || "").trim();
        const nameB = (b.student.hoTen || b.student.username || "").trim();
        return nameA.localeCompare(nameB, "vi");
      });
    }

    return result;
  }, [rows, filterHocLuc, searchQuery, sortBy, isCaNam]);

  const exportExcel = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const XLSX = await getXLSX();
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
      const safeLop = String(lop || "Lop").replace(/[^a-zA-Z0-9_-]/g, "_");
      const fileName = `TongKetLop_${safeLop}_${hocKy}_${namHoc}.xlsx`;

      const res = await triggerSafeExcelDownload(XLSX, wb, fileName);
      if (res?.cancelled) {
        showToast("Đã huỷ lưu file", "info");
        return;
      }
      if (res?.method === "picker") {
        showToast("Đã lưu bảng tổng kết thành công", "success");
      } else {
        showToast("Đang tải file về máy...", "info");
      }
    } catch (err) {
      console.error("Export summary excel error:", err);
      showToast("Xuất file thất bại", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (exportingPdf) return;
    if (rows.length === 0) {
      showToast("Lớp chưa có học sinh để xuất bảng tổng kết", "warning");
      return;
    }
    setExportingPdf(true);
    try {
      const safeLop = String(lop || "Lop").replace(/[^a-zA-Z0-9_-]/g, "_");
      const fileName = `TongKetLop_${safeLop}_${hocKy}_${namHoc}.pdf`;
      const blob = await exportSummaryReportPdf({
        lop,
        namHoc,
        hocKy,
        isCaNam,
        classStats,
        rows,
      });
      const res = await triggerSafePdfDownload(blob, fileName);
      if (res?.cancelled) {
        showToast("Đã huỷ lưu file", "info");
        return;
      }
      if (res?.method === "picker") {
        showToast("Đã lưu bảng tổng kết PDF thành công", "success");
      } else {
        showToast("Đang tải file về máy...", "info");
      }
    } catch (err) {
      console.error("Export summary PDF error:", err);
      showToast("Xuất PDF thất bại", "error");
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <Motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: APPLE_EASE }}
      className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl border-x-0 border-t-0 sm:border-t border-b sm:border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] shadow-none sm:shadow-xs overflow-hidden"
    >
      <style>{`
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

      {/* 1. HEADER SECTION (KHU VỰC 1: TỐI ƯU CẢ MOBILE & DESKTOP) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-6 border-b border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3]/60 dark:bg-[#151c18]/60 tk-no-print">
        
        {/* Mobile Row 1 / Desktop Left: Title & Meta + Mobile "Xuất file" Button */}
        <div className="flex items-center justify-between gap-3 w-full lg:w-auto">
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-[#293d32] dark:text-[#ecece0] tracking-tight truncate">
              Tổng quan {lop}
            </h1>
            
            {/* Meta row: Niên khóa + Sĩ số (Desktop: đầy đủ | Mobile: siêu gọn 1 hàng) */}
            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-[#575e55] dark:text-[#b0b9ac] font-medium whitespace-nowrap">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5 text-[#927140] dark:text-[#d4b47d] shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Niên khóa</span>
                <strong className="text-[#293d32] dark:text-[#ecece0] font-mono font-bold">{namHoc}</strong>
              </span>
              <span className="opacity-40">•</span>
              <span className="inline-flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d6b883] shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Sĩ số:</span>
                <strong className="text-[#293d32] dark:text-[#ecece0] font-mono font-bold">{rows.length}</strong>
                <span className="hidden sm:inline">học sinh</span>
                <span className="sm:hidden">HS</span>
              </span>
            </div>
          </div>

          {/* Mobile Right Controls: Single "Xuất file" button that opens Modal */}
          <div className="sm:hidden flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              disabled={loading || rows.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-bold bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-xs active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              title="Xuất bảng tổng kết lớp ra file Excel hoặc PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất file</span>
            </button>
          </div>
        </div>

        {/* Mobile Row 2: Full-Width 3-Column Segmented Term Switcher */}
        <div className="sm:hidden w-full">
          <div className="grid grid-cols-3 bg-[#faf8f3] dark:bg-[#151c18] rounded-xl p-1 border border-[#dedfd4] dark:border-[#354237]">
            {["HK1", "HK2", "CN"].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setHocKy(k)}
                className={`relative min-h-[36px] px-2 py-1.5 rounded-lg text-xs font-bold transition-colors z-10 cursor-pointer text-center flex items-center justify-center ${
                  hocKy === k 
                    ? "text-[#293d32] dark:text-[#ecece0]" 
                    : "text-[#454f46] dark:text-[#b8c2b4] hover:text-[#293d32]"
                }`}
                aria-pressed={hocKy === k}
              >
                {hocKy === k && (
                  <Motion.div
                    layoutId="summary-active-hk-pill-mobile"
                    className="absolute inset-0 bg-[#fffefa] dark:bg-[#1e2821] rounded-lg shadow-xs border border-[#dedfd4] dark:border-[#354237]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-20">
                  {k === "HK1" ? "Học kỳ I" : k === "HK2" ? "Học kỳ II" : "Cả năm"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Controls (Term selector + Full Action buttons) */}
        <div className="hidden sm:flex items-center justify-end gap-3 w-full lg:w-auto">
          {/* Term Selector on Desktop */}
          <div className="flex items-center bg-[#faf8f3] dark:bg-[#151c18] rounded-xl p-1 border border-[#dedfd4] dark:border-[#354237]">
            {["HK1", "HK2", "CN"].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setHocKy(k)}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-200 z-10 cursor-pointer ${
                  hocKy === k 
                    ? "text-[#293d32] dark:text-[#ecece0]" 
                    : "text-[#575e55] dark:text-[#b0b9ac] hover:text-[#293d32] dark:hover:text-[#ecece0]"
                }`}
                aria-pressed={hocKy === k}
              >
                {hocKy === k && (
                  <Motion.div
                    layoutId="summary-active-hk-pill"
                    className="absolute inset-0 bg-[#fffefa] dark:bg-[#1e2821] rounded-lg shadow-xs border border-[#dedfd4] dark:border-[#354237]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-20">
                  {k === "HK1" ? "Học kỳ I" : k === "HK2" ? "Học kỳ II" : "Cả năm"}
                </span>
              </button>
            ))}
          </div>

          <div className="hidden lg:block w-px h-6 bg-[#dedfd4] dark:border-[#354237]" />

          {/* Desktop Action button: Xuất file modal trigger */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              disabled={loading || rows.length === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[36px] rounded-xl text-xs sm:text-sm font-semibold bg-[#314e3e] hover:bg-[#263e32] text-white dark:bg-[#d6b883] dark:hover:bg-[#c9a76d] dark:text-[#19251d] shadow-xs active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Mở bảng chọn xuất file Excel hoặc PDF"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Xuất file</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI METRIC SECTION (KHU VỰC 2: MOBILE DẢI CHIP VUỐT NGANG / DESKTOP GRID 6 Ô) */}
      {!loading && rows.length > 0 && (
        <>
          {/* MOBILE: Dải Chip KPI cuộn ngang (Horizontal Scroll Strip) */}
          <div className="sm:hidden px-3.5 py-2.5 bg-[#faf8f3]/60 dark:bg-[#151c18]/60 border-b border-[#dedfd4] dark:border-[#354237] tk-no-print">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
              {/* Tất cả */}
              <button
                type="button"
                onClick={() => setFilterHocLuc("all")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border cursor-pointer ${
                  filterHocLuc === "all"
                    ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] border-[#314e3e] dark:border-[#d6b883] shadow-xs"
                    : "bg-[#fffefa] dark:bg-[#1e2821] text-[#293d32] dark:text-[#ecece0] border-[#dedfd4] dark:border-[#354237]"
                }`}
              >
                <span>👥 Tất cả</span>
                <span className={`px-1.5 py-0.2 rounded-md font-mono text-[11px] ${
                  filterHocLuc === "all" ? "bg-white/20 dark:bg-black/20" : "bg-stone-500/10"
                }`}>{rows.length}</span>
              </button>

              {/* ĐTB Lớp */}
              <button
                type="button"
                onClick={() => setSortBy(prev => prev === "dtb_desc" ? "default" : "dtb_desc")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border cursor-pointer ${
                  sortBy === "dtb_desc"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-[#fffefa] dark:bg-[#1e2821] text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                }`}
                title="Bấm để xếp theo ĐTB cao nhất"
              >
                <span>📈 ĐTB:</span>
                <strong className="font-mono">{classStats.average}</strong>
              </button>

              {/* Giỏi */}
              <button
                type="button"
                onClick={() => setFilterHocLuc(prev => prev === "gioi" ? "all" : "gioi")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border cursor-pointer ${
                  filterHocLuc === "gioi"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20"
                    : "bg-[#fffefa] dark:bg-[#1e2821] text-emerald-700 dark:text-emerald-400 border-[#dedfd4] dark:border-[#354237]"
                }`}
              >
                <span>🟢 Giỏi</span>
                <span className={`px-1.5 py-0.2 rounded-md font-mono text-[11px] font-bold ${filterHocLuc === "gioi" ? "bg-white text-emerald-800" : "bg-emerald-500/10"}`}>{classStats.gioi}</span>
              </button>

              {/* Khá */}
              <button
                type="button"
                onClick={() => setFilterHocLuc(prev => prev === "kha" ? "all" : "kha")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border cursor-pointer ${
                  filterHocLuc === "kha"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-500/20"
                    : "bg-[#fffefa] dark:bg-[#1e2821] text-blue-700 dark:text-blue-400 border-[#dedfd4] dark:border-[#354237]"
                }`}
              >
                <span>🔵 Khá</span>
                <span className={`px-1.5 py-0.2 rounded-md font-mono text-[11px] font-bold ${filterHocLuc === "kha" ? "bg-white text-blue-800" : "bg-blue-500/10"}`}>{classStats.kha}</span>
              </button>

              {/* Trung bình */}
              <button
                type="button"
                onClick={() => setFilterHocLuc(prev => prev === "tb" ? "all" : "tb")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border cursor-pointer ${
                  filterHocLuc === "tb"
                    ? "bg-amber-600 text-white border-amber-600 shadow-xs ring-2 ring-amber-500/20"
                    : "bg-[#fffefa] dark:bg-[#1e2821] text-amber-700 dark:text-amber-400 border-[#dedfd4] dark:border-[#354237]"
                }`}
              >
                <span>🟡 TB</span>
                <span className={`px-1.5 py-0.2 rounded-md font-mono text-[11px] font-bold ${filterHocLuc === "tb" ? "bg-white text-amber-800" : "bg-amber-500/10"}`}>{classStats.tb}</span>
              </button>

              {/* Cần lưu ý */}
              {classStats.warningCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterHocLuc(prev => prev === "warning" ? "all" : "warning")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border cursor-pointer ${
                    filterHocLuc === "warning"
                      ? "bg-red-600 text-white border-red-600 shadow-xs ring-2 ring-red-500/20"
                      : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30"
                  }`}
                >
                  <span>⚠️ Cần lưu ý</span>
                  <span className={`px-1.5 py-0.2 rounded-md font-mono text-[11px] font-bold ${filterHocLuc === "warning" ? "bg-white text-red-800" : "bg-red-500/20"}`}>{classStats.warningCount}</span>
                </button>
              )}
            </div>
          </div>

          {/* DESKTOP: Lưới 6 ô KPI đầy đủ */}
          <div className="hidden sm:grid grid-cols-3 lg:grid-cols-6 gap-3 p-5 sm:p-6 border-b border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3]/30 dark:bg-[#151c18]/30 tk-no-print">
            {/* All / Sĩ số */}
            <div 
              role="button"
              tabIndex={0}
              onClick={() => setFilterHocLuc("all")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFilterHocLuc("all"); }}
              aria-pressed={filterHocLuc === "all"}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-center gap-3 ${
                filterHocLuc === "all"
                  ? "bg-[#314e3e]/10 dark:bg-[#d6b883]/15 border-[#314e3e] dark:border-[#d6b883] ring-2 ring-[#314e3e]/20 dark:ring-[#d6b883]/20 shadow-xs"
                  : "bg-[#fffefa] dark:bg-[#1e2821] border-[#dedfd4] dark:border-[#354237] hover:border-[#314e3e]/40 dark:hover:border-[#d6b883]/40 shadow-xs hover:scale-[1.01]"
              }`}
              title="Xem tất cả học sinh trong lớp"
            >
              <div className="w-8 h-8 rounded-lg bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#575e55] dark:text-[#b0b9ac] truncate">Tất cả (Sĩ số)</p>
                <p className="text-base font-bold text-[#293d32] dark:text-[#ecece0] font-mono">{rows.length}</p>
              </div>
            </div>

            {/* Điểm TB Lớp */}
            <div 
              role="button"
              tabIndex={0}
              onClick={() => setSortBy(prev => prev === "dtb_desc" ? "default" : "dtb_desc")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSortBy(prev => prev === "dtb_desc" ? "default" : "dtb_desc"); }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-center gap-3 ${
                sortBy === "dtb_desc"
                  ? "bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                  : "bg-[#fffefa] dark:bg-[#1e2821] border-[#dedfd4] dark:border-[#354237] hover:border-emerald-500/40 shadow-xs hover:scale-[1.01]"
              }`}
              title="Bấm để sắp xếp theo Điểm TB cao nhất"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#575e55] dark:text-[#b0b9ac] truncate">ĐTB Lớp</p>
                <p className="text-base font-bold text-emerald-700 dark:text-emerald-400 font-mono">{classStats.average}</p>
              </div>
            </div>

            {/* Giỏi */}
            <div 
              role="button"
              tabIndex={0}
              onClick={() => setFilterHocLuc(prev => prev === "gioi" ? "all" : "gioi")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFilterHocLuc(prev => prev === "gioi" ? "all" : "gioi"); }}
              aria-pressed={filterHocLuc === "gioi"}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-center gap-3 ${
                filterHocLuc === "gioi"
                  ? "bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                  : "bg-[#fffefa] dark:bg-[#1e2821] border-[#dedfd4] dark:border-[#354237] hover:border-emerald-500/40 shadow-xs hover:scale-[1.01]"
              }`}
              title="Lọc danh sách học sinh Giỏi"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                G
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#575e55] dark:text-[#b0b9ac]">Giỏi</p>
                <p className="text-base font-bold text-emerald-700 dark:text-emerald-400 font-mono">{classStats.gioi}</p>
              </div>
            </div>

            {/* Khá */}
            <div 
              role="button"
              tabIndex={0}
              onClick={() => setFilterHocLuc(prev => prev === "kha" ? "all" : "kha")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFilterHocLuc(prev => prev === "kha" ? "all" : "kha"); }}
              aria-pressed={filterHocLuc === "kha"}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-center gap-3 ${
                filterHocLuc === "kha"
                  ? "bg-blue-500/15 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                  : "bg-[#fffefa] dark:bg-[#1e2821] border-[#dedfd4] dark:border-[#354237] hover:border-blue-500/40 shadow-xs hover:scale-[1.01]"
              }`}
              title="Lọc danh sách học sinh Khá"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs">
                K
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#575e55] dark:text-[#b0b9ac]">Khá</p>
                <p className="text-base font-bold text-blue-700 dark:text-blue-400 font-mono">{classStats.kha}</p>
              </div>
            </div>

            {/* Trung bình */}
            <div 
              role="button"
              tabIndex={0}
              onClick={() => setFilterHocLuc(prev => prev === "tb" ? "all" : "tb")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFilterHocLuc(prev => prev === "tb" ? "all" : "tb"); }}
              aria-pressed={filterHocLuc === "tb"}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-center gap-3 ${
                filterHocLuc === "tb"
                  ? "bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/20 shadow-xs"
                  : "bg-[#fffefa] dark:bg-[#1e2821] border-[#dedfd4] dark:border-[#354237] hover:border-amber-500/40 shadow-xs hover:scale-[1.01]"
              }`}
              title="Lọc danh sách học sinh Trung bình"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold text-xs">
                TB
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#575e55] dark:text-[#b0b9ac]">Trung bình</p>
                <p className="text-base font-bold text-amber-700 dark:text-amber-400 font-mono">{classStats.tb}</p>
              </div>
            </div>

            {/* Cần lưu ý */}
            <div 
              role="button"
              tabIndex={0}
              onClick={() => setFilterHocLuc(prev => prev === "warning" ? "all" : "warning")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFilterHocLuc(prev => prev === "warning" ? "all" : "warning"); }}
              aria-pressed={filterHocLuc === "warning"}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-center gap-3 ${
                filterHocLuc === "warning"
                  ? "bg-red-500/15 border-red-500 ring-2 ring-red-500/20 shadow-xs"
                  : "bg-[#fffefa] dark:bg-[#1e2821] border-[#dedfd4] dark:border-[#354237] hover:border-red-500/40 shadow-xs hover:scale-[1.01]"
              }`}
              title="Lọc học sinh cần lưu ý (ĐTB < 5 hoặc vắng > 3 buổi)"
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-700 dark:text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#575e55] dark:text-[#b0b9ac]">Cần lưu ý</p>
                <p className={`text-base font-bold font-mono ${classStats.warningCount > 0 ? "text-red-700 dark:text-red-400" : "text-[#293d32] dark:text-[#ecece0]"}`}>
                  {classStats.warningCount}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 3. VISUAL DISTRIBUTION BAR */}
      {!loading && rows.length > 0 && distribution && (
        <div className="px-3.5 sm:px-6 py-2 bg-[#faf8f3]/90 dark:bg-[#151c18]/90 border-b border-[#dedfd4] dark:border-[#354237] tk-no-print">
          <div className="flex items-center justify-between gap-1.5 mb-1 text-[11px] sm:text-xs">
            <div className="flex items-center gap-1.5 text-[#454f46] dark:text-[#b8c2b4] truncate">
              <span className="font-semibold">📊 Cơ cấu:</span>
              <span className="text-[#293d32] dark:text-[#ecece0] font-medium truncate">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">{classStats.gioi} Giỏi ({distribution.pGioi}%)</span> •{" "}
                <span className="text-blue-700 dark:text-blue-400 font-bold">{classStats.kha} Khá ({distribution.pKha}%)</span> •{" "}
                <span className="text-amber-700 dark:text-amber-400 font-bold">{classStats.tb} TB ({distribution.pTb}%)</span>
                {classStats.yeuKem > 0 && (
                  <span> • <span className="text-red-700 dark:text-red-400 font-bold">{classStats.yeuKem} Yếu ({distribution.pYeuKem}%)</span></span>
                )}
              </span>
            </div>
            {classStats.warningCount > 0 && (
              <span className="text-[10px] sm:text-[11px] font-bold text-red-700 dark:text-red-400 bg-red-500/10 px-1.5 sm:px-2 py-0.5 rounded-full border border-red-500/20 shrink-0">
                ⚠️ {classStats.warningCount} em
              </span>
            )}
          </div>

          {/* Thanh phân bổ trực quan */}
          <div className="w-full h-1.5 sm:h-2 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-700 flex shadow-inner">
            {distribution.pGioi > 0 && (
              <div 
                style={{ width: `${distribution.pGioi}%` }} 
                className="bg-emerald-500 h-full transition-all duration-300"
                title={`Giỏi: ${classStats.gioi} em (${distribution.pGioi}%)`}
              />
            )}
            {distribution.pKha > 0 && (
              <div 
                style={{ width: `${distribution.pKha}%` }} 
                className="bg-blue-500 h-full transition-all duration-300"
                title={`Khá: ${classStats.kha} em (${distribution.pKha}%)`}
              />
            )}
            {distribution.pTb > 0 && (
              <div 
                style={{ width: `${distribution.pTb}%` }} 
                className="bg-amber-500 h-full transition-all duration-300"
                title={`Trung bình: ${classStats.tb} em (${distribution.pTb}%)`}
              />
            )}
            {distribution.pYeuKem > 0 && (
              <div 
                style={{ width: `${distribution.pYeuKem}%` }} 
                className="bg-red-500 h-full transition-all duration-300"
                title={`Yếu/Kém: ${classStats.yeuKem} em (${distribution.pYeuKem}%)`}
              />
            )}
          </div>
        </div>
      )}

      {/* 4. SEARCH, SORT & FILTER CONTROLS BAR (KHU VỰC 3: 1 HÀNG DUY NHẤT TRÊN CẢ MOBILE & DESKTOP) */}
      {!loading && rows.length > 0 && (
        <div className="flex items-center justify-between gap-2 p-2.5 sm:px-6 sm:py-3 border-b border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3]/40 dark:bg-[#151c18]/40 tk-no-print">
          
          {/* Ô tìm kiếm nhanh */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#575e55] dark:text-[#b0b9ac] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, Tên Thánh, STT..."
              className="w-full pl-8 sm:pl-9 pr-7 sm:pr-8 py-1.5 sm:py-2 text-xs sm:text-sm rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] text-[#293d32] dark:text-[#ecece0] placeholder:text-[#575e55]/60 dark:placeholder:text-[#b0b9ac]/60 focus:outline-none focus:ring-2 focus:ring-[#314e3e]/20 dark:focus:ring-[#d6b883]/20 focus:border-[#314e3e] dark:focus:border-[#d6b883] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-stone-500/10 text-[#575e55] dark:text-[#b0b9ac] cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tùy chọn sắp xếp & Nút xóa bộ lọc */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1 text-xs text-[#575e55] dark:text-[#b0b9ac]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 sm:px-2.5 py-1.5 sm:py-2 text-xs sm:text-sm rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] text-[#293d32] dark:text-[#ecece0] focus:outline-none focus:ring-2 focus:ring-[#314e3e]/20 dark:focus:ring-[#d6b883]/20 font-medium cursor-pointer"
                aria-label="Sắp xếp danh sách"
              >
                <option value="default">⇅ Xếp: Mặc định</option>
                <option value="name_asc">Tên (A → Z)</option>
                <option value="dtb_desc">ĐTB (Cao → Thấp)</option>
                <option value="dtb_asc">ĐTB (Thấp → Cao)</option>
                <option value="vang_desc">Vắng nhiều nhất</option>
                {isCaNam && <option value="vithu_asc">Vị thứ top đầu</option>}
              </select>
            </div>

            {/* Nút Xóa lọc nếu đang có tìm kiếm hoặc filter */}
            {(filterHocLuc !== "all" || searchQuery || sortBy !== "default") && (
              <button
                type="button"
                onClick={() => {
                  setFilterHocLuc("all");
                  setSearchQuery("");
                  setSortBy("default");
                }}
                className="p-1.5 sm:px-2.5 sm:py-2 text-xs font-semibold rounded-xl bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 hover:bg-red-500/15 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                title="Bỏ tất cả bộ lọc và tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bỏ lọc</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Thông tin số lượng hiển thị khi lọc */}
      {(filterHocLuc !== "all" || searchQuery) && !loading && (
        <div className="px-3.5 sm:px-6 py-1.5 bg-stone-100/70 dark:bg-stone-800/40 text-[11px] sm:text-xs text-[#575e55] dark:text-[#b0b9ac] flex items-center justify-between border-b border-[#dedfd4] dark:border-[#354237] tk-no-print">
          <span className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-3 h-3 text-[#314e3e] dark:text-[#d6b883]" />
            <span>
              Hiển thị <strong>{filteredAndSortedRows.length}</strong> / {rows.length} HS
            </span>
            {filterHocLuc !== "all" && (
              <span className="font-semibold text-[#314e3e] dark:text-[#d6b883]">
                (Đang lọc: {filterHocLuc === "gioi" ? "Giỏi" : filterHocLuc === "kha" ? "Khá" : filterHocLuc === "tb" ? "Trung bình" : filterHocLuc === "warning" ? "Cần lưu ý" : filterHocLuc})
              </span>
            )}
          </span>
        </div>
      )}

      {/* 5. BODY CONTENT (KHU VỰC 4: THẺ HỌC SINH MOBILE THÔNG MINH & BẢNG DESKTOP) */}
      <AnimatePresence mode="wait">
        {loading ? (
          <Motion.div 
            key="loading"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="p-6"
          >
            <TableSkeleton rows={6} columns={6} />
          </Motion.div>
        ) : (
          <Motion.div 
            key="content" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.3, ease: APPLE_EASE }}
            id="tk-summary-print" 
          >
            <div className="hidden print:block mb-4 p-5 pt-5">
              <h2 className="text-xl font-bold text-stone-900">
                Bảng tổng kết lớp {lop} — {isCaNam ? "Cả năm" : (hocKy === "HK1" ? "Học kỳ I" : "Học kỳ II")} — {namHoc}
              </h2>
            </div>

            {/* MOBILE CARDS VIEW (KHU VỰC 4: THIẾT KẾ THẺ THÔNG MINH, GỌN GÀNG) */}
            <div className="md:hidden flex flex-col gap-2.5 p-3 sm:p-4 bg-[#faf8f3]/40 dark:bg-[#151c18]/40 print:hidden">
              {filteredAndSortedRows.map((r, idx) => {
                const kq = isCaNam ? getKetQua(r.hocLuc) : null;
                const dtbNum = Number(r.diemTB) || 0;
                const scorePercent = Math.min(Math.max((dtbNum / 10) * 100, 0), 100);
                
                // Vạch màu trạng thái bên trái thẻ
                const borderLeftColor = r.warning
                  ? "border-l-red-500"
                  : r.hocLuc === "Giỏi"
                    ? "border-l-emerald-500"
                    : r.hocLuc === "Khá"
                      ? "border-l-blue-500"
                      : "border-l-amber-500";

                return (
                  <div 
                    key={r.student.username} 
                    className={`p-3.5 rounded-xl border border-l-4 transition-all ${borderLeftColor} ${
                      r.warning 
                        ? "border-red-500/30 bg-red-500/[0.03] dark:bg-red-500/[0.06]" 
                        : "border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] shadow-xs"
                    }`}
                  >
                    {/* Header Thẻ: Avatar + Tên + Badge trạng thái + Vị thứ */}
                    <div className="flex items-center justify-between gap-2.5 mb-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <div className={`w-10 h-10 rounded-full overflow-hidden border-2 bg-stone-100 dark:bg-stone-800 ${
                            r.warning ? "border-red-500/50" : "border-[#314e3e]/40 dark:border-[#d6b883]/40"
                          }`}>
                            <img src={r.student.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                          </div>
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 flex items-center justify-center bg-[#293d32] dark:bg-[#ecece0] text-white dark:text-[#19251d] text-[9px] font-bold rounded-full font-mono">
                            {idx + 1}
                          </span>
                        </div>
                        
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-[#293d32] dark:text-[#ecece0] leading-snug break-words">
                            {r.student.tenThanh && <span className="font-semibold text-[#927140] dark:text-[#d4b47d] font-serif mr-1">{r.student.tenThanh}</span>}
                            {r.student.hoTen || r.student.username}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            {isCaNam && kq ? (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full border ${kq.bg} ${kq.color} text-[10px] font-bold uppercase tracking-wider`}>
                                <kq.Icon className="w-2.5 h-2.5" /> {kq.label}
                              </span>
                            ) : r.warning ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider">
                                <AlertTriangle className="w-2.5 h-2.5" /> Cần theo dõi
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Ổn định
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Vị thứ cho Cả năm */}
                      {isCaNam && r.viThu != null && (
                        <div className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold font-mono border ${
                          r.viThu === 1
                            ? "bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-500/40 shadow-2xs"
                            : r.viThu === 2
                              ? "bg-slate-200/90 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600"
                              : r.viThu === 3
                                ? "bg-amber-700/10 dark:bg-amber-600/20 text-amber-900 dark:text-amber-300 border-amber-700/30"
                                : "bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] border-[#dedfd4] dark:border-[#354237]"
                        }`}>
                          {r.viThu === 1 && <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />}
                          {r.viThu === 2 && <Award className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 shrink-0" />}
                          {r.viThu === 3 && <Award className="w-3.5 h-3.5 text-amber-700 dark:text-amber-500 shrink-0" />}
                          <span>Hạng {r.viThu}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Bảng Điểm & Thanh tiến độ Mini */}
                    <div className="bg-[#faf8f3] dark:bg-[#151c18] rounded-xl p-2 border border-[#dedfd4] dark:border-[#354237]">
                      <div className={`grid ${isCaNam ? "grid-cols-2" : "grid-cols-3"} gap-1.5 text-center`}>
                        {!isCaNam && (
                          <div>
                            <p className="text-[9.5px] font-semibold text-[#575e55] dark:text-[#b0b9ac]">ĐIỂM THI</p>
                            <p className="text-xs font-bold text-[#293d32] dark:text-[#ecece0] font-mono">{r.diemThi ?? "—"}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-[9.5px] font-semibold text-[#575e55] dark:text-[#b0b9ac]">ĐIỂM TB</p>
                          <p className={`text-xs font-bold font-mono ${tbColorClass(r.diemTB)}`}>{r.diemTB ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-[9.5px] font-semibold text-[#575e55] dark:text-[#b0b9ac]">HỌC LỰC</p>
                          <p className="text-xs font-semibold text-[#293d32] dark:text-[#ecece0]">{r.hocLuc || "—"}</p>
                        </div>
                      </div>

                      {/* Mini bar tiến độ điểm */}
                      {r.diemTB !== null && r.diemTB !== undefined && !isNaN(dtbNum) && (
                        <div className="mt-1.5 pt-1.5 border-t border-[#dedfd4]/60 dark:border-[#354237]/60">
                          <div className="w-full h-1.5 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-700">
                            <div 
                              style={{ width: `${scorePercent}%` }} 
                              className={`h-full rounded-full ${
                                dtbNum >= 8 ? "bg-emerald-500" : dtbNum >= 6.5 ? "bg-blue-500" : dtbNum >= 5 ? "bg-amber-500" : "bg-red-500"
                              }`} 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Hạnh kiểm & Chuyên cần */}
                    <div className="grid grid-cols-3 gap-2 text-center mt-2 text-xs text-[#575e55] dark:text-[#b0b9ac]">
                      <div>
                        <span className="block text-[9.5px] font-medium">Hạnh kiểm</span>
                        <span className="font-semibold text-[#293d32] dark:text-[#ecece0]">{r.hanhKiem || "—"}</span>
                      </div>
                      <div>
                        <span className="block text-[9.5px] font-medium">Vắng CP</span>
                        <span className="font-semibold text-[#293d32] dark:text-[#ecece0] font-mono">{r.vangCoPhep || 0}</span>
                      </div>
                      <div>
                        <span className="block text-[9.5px] font-medium">Vắng KP</span>
                        <span className={`font-semibold font-mono ${r.vangKhongPhep > 0 ? "text-red-600 dark:text-red-400 font-bold" : "text-[#293d32] dark:text-[#ecece0]"}`}>
                          {r.vangKhongPhep || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredAndSortedRows.length === 0 && (
                <div className="text-center py-12 px-4 bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237]">
                  <p className="text-sm font-semibold text-[#293d32] dark:text-[#ecece0]">Không tìm thấy học sinh phù hợp</p>
                  <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] mt-1">Thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc khác.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterHocLuc("all");
                      setSearchQuery("");
                      setSortBy("default");
                    }}
                    className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] cursor-pointer"
                  >
                    Xem tất cả học sinh
                  </button>
                </div>
              )}
            </div>

            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block print:block overflow-auto max-h-[72vh] print:max-h-none" data-lenis-prevent>
              <table className="w-full text-sm border-collapse min-w-[800px] bg-[#fffefa] dark:bg-[#1e2821]">
                <thead className="sticky top-0 z-30 bg-[#faf8f3] dark:bg-[#151c18] border-b border-[#dedfd4] dark:border-[#354237] text-[11px] font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">
                  <tr>
                    <th className="text-center px-3 py-3.5 sticky left-0 bg-[#faf8f3] dark:bg-[#151c18] z-40 w-12 border-r border-[#dedfd4] dark:border-[#354237]">STT</th>
                    <th className="text-left px-4 py-3.5 sticky left-12 bg-[#faf8f3] dark:bg-[#151c18] z-40 border-r border-[#dedfd4] dark:border-[#354237] normal-case tracking-normal shadow-xs">Họ &amp; Tên Học Sinh</th>
                    {!isCaNam && <th className="text-center px-3 py-3.5 border-r border-[#dedfd4] dark:border-[#354237]">Điểm Thi</th>}
                    <th 
                      onClick={() => setSortBy(prev => prev === "dtb_desc" ? "dtb_asc" : "dtb_desc")} 
                      className="text-center px-3 py-3.5 border-r border-[#dedfd4] dark:border-[#354237] cursor-pointer hover:bg-stone-500/5 transition-colors"
                      title="Bấm để đổi sắp xếp Điểm TB"
                    >
                      <div className="inline-flex items-center gap-1">
                        <span>Điểm TB</span>
                        {sortBy === "dtb_desc" ? <span>↓</span> : sortBy === "dtb_asc" ? <span>↑</span> : null}
                      </div>
                    </th>
                    <th className="text-center px-3 py-3.5 border-r border-[#dedfd4] dark:border-[#354237]">Học Lực</th>
                    <th className="text-center px-3 py-3.5 border-r border-[#dedfd4] dark:border-[#354237]">Hạnh Kiểm</th>
                    <th className="text-center px-3 py-3.5 border-r border-[#dedfd4] dark:border-[#354237]">Vắng CP</th>
                    <th 
                      onClick={() => setSortBy(prev => prev === "vang_desc" ? "default" : "vang_desc")} 
                      className="text-center px-3 py-3.5 border-r border-[#dedfd4] dark:border-[#354237] cursor-pointer hover:bg-stone-500/5 transition-colors"
                      title="Bấm để sắp xếp theo số buổi vắng"
                    >
                      <div className="inline-flex items-center gap-1">
                        <span>Vắng KP</span>
                        {sortBy === "vang_desc" ? <span>↓</span> : null}
                      </div>
                    </th>
                    {isCaNam && (
                      <th 
                        onClick={() => setSortBy(prev => prev === "vithu_asc" ? "default" : "vithu_asc")} 
                        className="text-center px-3 py-3.5 border-r border-[#dedfd4] dark:border-[#354237] cursor-pointer hover:bg-stone-500/5 transition-colors"
                        title="Bấm để sắp xếp theo vị thứ"
                      >
                        <div className="inline-flex items-center gap-1">
                          <span>Vị Thứ</span>
                          {sortBy === "vithu_asc" ? <span>↑</span> : null}
                        </div>
                      </th>
                    )}
                    <th className="text-center px-3 py-3.5 normal-case tracking-normal print:hidden">{isCaNam ? "Kết Quả" : "Trạng Thái"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dedfd4] dark:divide-[#354237]">
                  {filteredAndSortedRows.map((r, idx) => {
                    const isWarn = r.warning;
                    const kq = isCaNam ? getKetQua(r.hocLuc) : null;
                    return (
                      <tr 
                        key={r.student.username} 
                        className={`transition-colors bg-[#fffefa] dark:bg-[#1e2821] hover:bg-[#faf8f3] dark:hover:bg-[#25322a] group ${
                          isWarn ? "bg-red-500/[0.02] dark:bg-red-500/[0.04]" : ""
                        }`}
                      >
                        <td className={`px-3 py-3 text-center sticky left-0 z-20 text-xs text-[#575e55] dark:text-[#b0b9ac] font-mono w-12 bg-[#fffefa] dark:bg-[#1e2821] group-hover:bg-[#faf8f3] dark:group-hover:bg-[#25322a] border-r border-[#dedfd4] dark:border-[#354237] border-l-4 ${
                          isWarn ? "border-l-red-500" : "border-l-transparent"
                        }`}>
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 sticky left-12 z-20 bg-[#fffefa] dark:bg-[#1e2821] group-hover:bg-[#faf8f3] dark:group-hover:bg-[#25322a] border-r border-[#dedfd4] dark:border-[#354237] shadow-xs">
                          <div className="flex items-center gap-3 min-w-[200px]">
                            <div className={`w-8 h-8 rounded-full overflow-hidden border shrink-0 bg-stone-100 dark:bg-stone-800 print:hidden ${
                              isWarn ? "border-red-500/50" : "border-[#dedfd4] dark:border-[#354237]"
                            }`}>
                              <img src={r.student.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-sm font-bold text-[#293d32] dark:text-[#ecece0] truncate">
                              {r.student.tenThanh && <span className="font-normal text-[#575e55] dark:text-[#b0b9ac] mr-1">{r.student.tenThanh}</span>}
                              {r.student.hoTen || r.student.username}
                            </span>
                          </div>
                        </td>
                        {!isCaNam && (
                          <td className="px-3 py-3 text-center text-sm font-semibold text-[#293d32] dark:text-[#ecece0] font-mono border-r border-[#dedfd4] dark:border-[#354237]">
                            {r.diemThi ?? "—"}
                          </td>
                        )}
                        <td className={`px-3 py-3 text-center text-sm font-bold font-mono border-r border-[#dedfd4] dark:border-[#354237] ${tbColorClass(r.diemTB)}`}>
                          {r.diemTB !== null && r.diemTB !== undefined ? (
                            <div className="inline-flex items-center justify-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full print:hidden ${
                                r.diemTB >= 8 ? 'bg-emerald-500' : r.diemTB >= 5 ? 'bg-amber-500' : 'bg-red-500'
                              }`} />
                              {r.diemTB}
                            </div>
                          ) : "—"}
                        </td>
                        <td className="px-3 py-3 text-center text-xs font-semibold text-[#293d32] dark:text-[#ecece0] border-r border-[#dedfd4] dark:border-[#354237]">
                          {r.hocLuc || "—"}
                        </td>
                        <td className="px-3 py-3 text-center text-xs font-semibold text-[#293d32] dark:text-[#ecece0] border-r border-[#dedfd4] dark:border-[#354237]">
                          {r.hanhKiem || "—"}
                        </td>
                        <td className="px-3 py-3 text-center text-sm font-mono text-[#293d32] dark:text-[#ecece0] border-r border-[#dedfd4] dark:border-[#354237]">
                          {r.vangCoPhep || 0}
                        </td>
                        <td className={`px-3 py-3 text-center text-sm font-mono border-r border-[#dedfd4] dark:border-[#354237] ${
                          r.vangKhongPhep > 0 ? "text-red-600 dark:text-red-400 font-bold" : "text-[#293d32] dark:text-[#ecece0]"
                        }`}>
                          {r.vangKhongPhep || 0}
                        </td>
                        {isCaNam && (
                          <td className="px-3 py-3 text-center text-sm font-bold text-[#293d32] dark:text-[#ecece0] font-mono border-r border-[#dedfd4] dark:border-[#354237]">
                            {r.viThu != null ? (
                              <span className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                                r.viThu === 1
                                  ? "bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/40"
                                  : r.viThu === 2
                                    ? "bg-slate-200/90 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600"
                                    : r.viThu === 3
                                      ? "bg-amber-700/10 dark:bg-amber-600/20 text-amber-900 dark:text-amber-300 border border-amber-700/30"
                                      : "text-[#293d32] dark:text-[#ecece0]"
                              }`}>
                                {r.viThu === 1 && <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />}
                                {r.viThu === 2 && <Award className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 shrink-0" />}
                                {r.viThu === 3 && <Award className="w-3.5 h-3.5 text-amber-700 dark:text-amber-500 shrink-0" />}
                                <span>Hạng {r.viThu}</span>
                              </span>
                            ) : "—"}
                          </td>
                        )}
                        <td className="px-3 py-3 text-center print:hidden">
                          {isCaNam && kq ? (
                            <span className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full border ${kq.bg} ${kq.color} text-[11px] font-bold uppercase tracking-wider whitespace-nowrap`}>
                              <kq.Icon className="w-3 h-3" /> {kq.label}
                            </span>
                          ) : isWarn ? (
                            <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
                              <AlertTriangle className="w-3 h-3" /> Cần theo dõi
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
                              <CheckCircle2 className="w-3 h-3" /> Ổn định
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAndSortedRows.length === 0 && (
                    <tr>
                      <td colSpan={isCaNam ? 10 : 9} className="text-center text-sm text-[#575e55] dark:text-[#b0b9ac] py-12">
                        Không tìm thấy học sinh phù hợp với bộ lọc.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* 6. MODAL XUẤT BÁO CÁO TỔNG KẾT (EXCEL / PDF) */}
      <ExportSummaryModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        lop={lop}
        namHoc={namHoc}
        hocKy={hocKy}
        isCaNam={isCaNam}
        totalStudents={rows.length}
        exporting={exporting}
        exportingPdf={exportingPdf}
        onExportExcel={exportExcel}
        onExportPdf={handleExportPDF}
      />
    </Motion.div>
  );
}

/**
 * Modal hướng dẫn và chọn loại file xuất báo cáo (Excel / PDF)
 * Ngắn gọn, súc tích và trực quan cho Giáo lý viên.
 */
function ExportSummaryModal({
  open,
  onClose,
  lop,
  namHoc,
  hocKy,
  isCaNam,
  totalStudents,
  exporting,
  exportingPdf,
  onExportExcel,
  onExportPdf,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !exporting && !exportingPdf) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, exporting, exportingPdf, onClose]);

  const termLabel = isCaNam ? "Cả năm" : hocKy === "HK1" ? "Học kỳ I" : "Học kỳ II";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-3.5 sm:p-5">
          {/* Backdrop */}
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: APPLE_EASE }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => !exporting && !exportingPdf && onClose()}
          />

          {/* Dialog Card */}
          <Motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: APPLE_EASE }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-modal-title"
            className="relative w-full max-w-[92vw] sm:max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] shadow-2xl p-4 sm:p-5 flex flex-col gap-3.5 text-[#293d32] dark:text-[#ecece0]"
            data-lenis-prevent
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-[#dedfd4] dark:border-[#354237] pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] flex items-center justify-center shrink-0">
                  <Download className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h3 id="export-modal-title" className="text-[15px] sm:text-base font-bold text-[#293d32] dark:text-[#ecece0] leading-tight truncate">
                    Xuất bảng tổng kết
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#575e55] dark:text-[#b0b9ac] mt-0.5 truncate">
                    Lớp {lop} • {termLabel} • {namHoc}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={exporting || exportingPdf}
                className="p-1 rounded-lg hover:bg-stone-500/10 text-[#575e55] dark:text-[#b0b9ac] transition-colors cursor-pointer"
                title="Đóng"
                aria-label="Đóng"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Content: 2 Compact Options */}
            <div className="space-y-2.5">
              {/* Option 1: Excel */}
              <div
                role="button"
                tabIndex={0}
                onClick={onExportExcel}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onExportExcel(); }}
                className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 ${
                  exporting
                    ? "bg-emerald-500/10 border-emerald-500/40 ring-2 ring-emerald-500/20"
                    : "bg-[#faf8f3] dark:bg-[#151c18] border-[#dedfd4] dark:border-[#354237] hover:border-emerald-600/40 hover:bg-[#faf8f3]/80 shadow-xs hover:scale-[1.01]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[#293d32] dark:text-[#ecece0] truncate">
                      File Excel (.xlsx)
                    </h4>
                    <p className="text-[11px] text-[#575e55] dark:text-[#b0b9ac] truncate">
                      Bảng điểm chi tiết &amp; chuyên cần
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {exporting ? (
                    <Spinner className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-xs">
                      Tải về
                    </span>
                  )}
                </div>
              </div>

              {/* Option 2: PDF */}
              <div
                role="button"
                tabIndex={0}
                onClick={onExportPdf}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onExportPdf(); }}
                className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 ${
                  exportingPdf
                    ? "bg-red-500/10 border-red-500/40 ring-2 ring-red-500/20"
                    : "bg-[#faf8f3] dark:bg-[#151c18] border-[#dedfd4] dark:border-[#354237] hover:border-red-600/40 hover:bg-[#faf8f3]/80 shadow-xs hover:scale-[1.01]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[#293d32] dark:text-[#ecece0] truncate">
                      Bản in PDF (.pdf)
                    </h4>
                    <p className="text-[11px] text-[#575e55] dark:text-[#b0b9ac] truncate">
                      Trang in A4 kèm khung chữ ký
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {exportingPdf ? (
                    <Spinner className="w-4 h-4 text-red-600" />
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#fffefa] dark:bg-[#1e2821] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] shadow-xs">
                      Tải về
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 pt-1 border-t border-[#dedfd4] dark:border-[#354237]">
              <span className="text-[11px] text-[#575e55] dark:text-[#b0b9ac]">
                Sĩ số: <strong>{totalStudents}</strong> học sinh
              </span>
              <button
                type="button"
                onClick={onClose}
                disabled={exporting || exportingPdf}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-[#293d32] dark:text-[#ecece0] hover:bg-stone-500/10 active:scale-95 transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </Motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}