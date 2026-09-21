import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FileSpreadsheet, Upload, Download, AlertCircle,
  X, Check, CheckCircle2, Lightbulb, Calendar,
  Users, RefreshCw, ChevronRight, FileText,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Spinner } from "../../../components/ui/Skeleton.jsx";
import {
  exportAttendanceDateExcel,
  exportAttendanceSemesterMatrixExcel,
  downloadAttendanceSampleExcel,
  parseAttendanceExcel,
} from "../utils/excelAttendanceHelper.js";
import {
  fetchClassSemesterAttendance,
  saveBulkAttendanceMatrix,
} from "../api.js";
import { formatVNDate, toISODate, sortStudentsByTen } from "../utils.js";

const APPLE_EASE = [0.16, 1, 0.3, 1];

export default function AttendanceExcelModal({
  open,
  onClose,
  lop,
  namHoc,
  hocKy,
  hocKyInt,
  currentDate,
  students = [],
  statuses = {},
  sundays = [],
  holidaysMap = {},
  isLocked = false,
  onSuccess,
  showToast,
}) {
  const [activeTab, setActiveTab] = useState("import"); // 'import' | 'export'
  const [importStep, setImportStep] = useState("upload"); // 'upload' | 'preview' | 'success'
  const [importScope, setImportScope] = useState("auto"); // 'auto' | 'single_date' | 'matrix'

  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);
  const [downloadingSample, setDownloadingSample] = useState(false);
  const [exportingDate, setExportingDate] = useState(false);
  const [exportingMatrix, setExportingMatrix] = useState(false);

  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  const resetState = useCallback(() => {
    setImportStep("upload");
    setFile(null);
    setParsing(false);
    setParsedResult(null);
    setSaving(false);
    setDragOver(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleClose = useCallback(() => {
    if (saving) return;
    resetState();
    onClose();
  }, [saving, resetState, onClose]);

  // Khóa cuộn trang nền khi mở modal
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Handle ESC key and focus management
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape" && !saving) {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, saving, handleClose]);

  // Xử lý đọc file Excel
  const processFile = async (f) => {
    if (!f) return;
    const isExcel = f.name.endsWith(".xlsx") || f.name.endsWith(".xls");
    if (!isExcel) {
      showToast("Vui lòng chọn file định dạng Excel (.xlsx hoặc .xls)", "warning");
      return;
    }

    setFile(f);
    setParsing(true);
    try {
      const data = await parseAttendanceExcel(f, students, {
        namHoc,
        hocKy,
        hocKyInt,
        currentDate,
        sundays,
        holidaysMap,
      });

      if (data.matchedCount === 0) {
        throw new Error("Không tìm thấy Giáo lý sinh nào trong file khớp với danh sách lớp này.");
      }

      setParsedResult(data);
      setImportStep("preview");
    } catch (err) {
      console.error("Parse attendance Excel error:", err);
      showToast(err.message || "Không thể đọc file Excel. Vui lòng kiểm tra lại cấu trúc file.", "error");
      setFile(null);
    } finally {
      setParsing(false);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  // Tải file mẫu
  const handleDownloadSample = async (mode) => {
    if (downloadingSample) return;
    setDownloadingSample(true);
    try {
      const res = await downloadAttendanceSampleExcel({
        lop,
        namHoc,
        hocKy,
        date: currentDate,
        students,
        sundays,
        holidaysMap,
        mode,
      });
      if (res?.cancelled) {
        showToast("Đã hủy tải file mẫu", "info");
      } else {
        showToast("Đã tạo file mẫu Excel thành công!", "success");
      }
    } catch (err) {
      console.error("Download sample error:", err);
      showToast("Tải file mẫu thất bại", "error");
    } finally {
      setDownloadingSample(false);
    }
  };

  // Xuất file 1 ngày
  const handleExportSingleDate = async () => {
    if (exportingDate) return;
    setExportingDate(true);
    try {
      const holiday = holidaysMap[toISODate(currentDate)];
      const res = await exportAttendanceDateExcel({
        lop,
        namHoc,
        hocKy,
        date: currentDate,
        students,
        statuses,
        holiday,
      });
      if (!res?.cancelled) {
        showToast("Đã xuất phiếu điểm danh ngày thành công", "success");
      }
    } catch (err) {
      console.error("Export date error:", err);
      showToast("Xuất file thất bại", "error");
    } finally {
      setExportingDate(false);
    }
  };

  // Xuất Ma trận cả học kỳ
  const handleExportSemesterMatrix = async () => {
    if (exportingMatrix) return;
    setExportingMatrix(true);
    try {
      const usernames = students.map((s) => s.username);
      const records = await fetchClassSemesterAttendance(usernames, namHoc, hocKyInt);
      const res = await exportAttendanceSemesterMatrixExcel({
        lop,
        namHoc,
        hocKy,
        sundays,
        students,
        attendanceRecords: records,
        holidaysMap,
      });
      if (!res?.cancelled) {
        showToast("Đã xuất bảng ma trận chuyên cần cả học kỳ thành công", "success");
      }
    } catch (err) {
      console.error("Export matrix error:", err);
      showToast("Xuất bảng ma trận thất bại", "error");
    } finally {
      setExportingMatrix(false);
    }
  };

  // Xác nhận lưu điểm danh sau khi Preview
  const handleConfirmSave = async () => {
    if (!parsedResult || !parsedResult.parsedRecords.length || isLocked) return;
    setSaving(true);
    try {
      await saveBulkAttendanceMatrix(parsedResult.parsedRecords);
      setImportStep("success");
      if (onSuccess) onSuccess();
      showToast(
        `Đã lưu điểm danh thành công cho ${parsedResult.matchedCount} Giáo lý sinh (${parsedResult.parsedRecords.length} lượt điểm danh)!`,
        "success"
      );
    } catch (err) {
      console.error("Save bulk attendance error:", err);
      showToast("Lưu điểm danh thất bại. Vui lòng thử lại.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
      data-lenis-prevent
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="attendance-excel-modal-title"
    >
      <Motion.div
        ref={modalRef}
        data-lenis-prevent
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.25, ease: APPLE_EASE }}
        className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] shadow-2xl overflow-hidden my-auto"
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3]/80 dark:bg-[#151c18]/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#314e3e]/10 dark:bg-[#d6b883]/15 flex items-center justify-center text-[#314e3e] dark:text-[#d6b883] border border-[#dedfd4] dark:border-[#354237] shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 id="attendance-excel-modal-title" className="text-base sm:text-lg font-bold text-[#293d32] dark:text-[#ecece0] truncate">
                Quản lý File Excel Điểm Danh
              </h2>
              <p className="text-xs text-[#3c453e] dark:text-[#c2ccc0] truncate mt-0.5">
                Lớp <strong className="text-[#293d32] dark:text-[#ecece0]">{lop}</strong> · Niên khóa <strong className="font-mono">{namHoc}</strong> · {hocKy === "HK1" ? "Học kỳ I" : "Học kỳ II"}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={handleClose}
            aria-label="Đóng cửa sổ"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#3c453e] hover:text-[#293d32] dark:text-[#c2ccc0] dark:hover:text-[#ecece0] hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer shrink-0 disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS SELECTOR (Nhập file vs Xuất file) */}
        <div className="flex items-center border-b border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3]/40 dark:bg-[#151c18]/40 px-4 sm:px-6 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => { setActiveTab("import"); resetState(); }}
            className={`min-h-[44px] px-4 py-2 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "import"
                ? "border-[#314e3e] text-[#314e3e] dark:border-[#d6b883] dark:text-[#d6b883]"
                : "border-transparent text-[#3c453e] dark:text-[#c2ccc0] hover:text-[#293d32] dark:hover:text-[#ecece0]"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Nhập từ Excel (Import)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("export")}
            className={`min-h-[44px] px-4 py-2 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "export"
                ? "border-[#314e3e] text-[#314e3e] dark:border-[#d6b883] dark:text-[#d6b883]"
                : "border-transparent text-[#3c453e] dark:text-[#c2ccc0] hover:text-[#293d32] dark:hover:text-[#ecece0]"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Xuất file Excel (Export)</span>
          </button>
        </div>

        {/* MODAL BODY (Cuộn linh hoạt) */}
        <div
          className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5 overscroll-contain"
          data-lenis-prevent
        >
          {/* ============================================================
              TAB 1: NHẬP DỮ LIỆU TỪ EXCEL (IMPORT)
             ============================================================ */}
          {activeTab === "import" && (
            <div>
              {/* BƯỚC 1: TẢI LÊN FILE */}
              {importStep === "upload" && (
                <div className="space-y-4">
                  {/* Khung hướng dẫn quy ước nhập */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-600/30 text-amber-950 dark:text-amber-100 text-xs sm:text-sm space-y-2">
                    <div className="flex items-center gap-2 font-bold text-[#713f12] dark:text-[#fde047]">
                      <Lightbulb className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>Quy ước ký hiệu nhập điểm danh nhanh & tiện lợi:</span>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-6 list-disc text-xs text-[#3c453e] dark:text-[#c2ccc0]">
                      <li><strong className="text-[#293d32] dark:text-[#ecece0]">Để trống</strong> hoặc <code className="font-bold">x</code>: <span className="text-emerald-800 dark:text-emerald-300 font-bold">Có mặt</span></li>
                      <li><strong className="text-[#293d32] dark:text-[#ecece0]">P</strong>: <span className="text-amber-900 dark:text-amber-300 font-bold">Nghỉ có phép</span></li>
                      <li><strong className="text-[#293d32] dark:text-[#ecece0]">K</strong>: <span className="text-rose-900 dark:text-rose-300 font-bold">Nghỉ không phép</span></li>
                      <li><strong className="text-[#293d32] dark:text-[#ecece0]">L</strong>: <span className="text-sky-900 dark:text-sky-300 font-bold">Nghỉ lễ</span> (tự động điền nếu có lễ)</li>
                      <li className="sm:col-span-2"><strong className="text-[#293d32] dark:text-[#ecece0]">-</strong>: Chưa có dữ liệu / Chưa học</li>
                    </ul>
                  </div>

                  {/* Nút tải file mẫu */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237]">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" />
                      <span className="text-xs sm:text-sm font-semibold text-[#293d32] dark:text-[#ecece0]">
                        Chưa có file mẫu? Tải file mẫu lớp có sẵn danh sách:
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={downloadingSample}
                        onClick={() => handleDownloadSample("single_date")}
                        className="min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-[#293d32] dark:text-[#ecece0] hover:bg-[#faf8f3] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Mẫu ngày ({formatVNDate(currentDate).slice(0, 5)})</span>
                      </button>
                      <button
                        type="button"
                        disabled={downloadingSample}
                        onClick={() => handleDownloadSample("matrix")}
                        className="min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold bg-[#314e3e]/10 dark:bg-[#d6b883]/15 border border-[#314e3e]/30 dark:border-[#d6b883]/30 text-[#314e3e] dark:text-[#d6b883] hover:bg-[#314e3e]/20 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Mẫu ma trận cả kỳ</span>
                      </button>
                    </div>
                  </div>

                  {/* Vùng Kéo thả / Chọn file */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-8 sm:p-10 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 text-center cursor-pointer ${
                      dragOver
                        ? "border-[#314e3e] bg-[#314e3e]/5 dark:border-[#d6b883] dark:bg-[#d6b883]/5"
                        : "border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] hover:border-[#314e3e]/50 hover:bg-[#faf8f3]/60 dark:hover:bg-[#151c18]/60"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div className="w-14 h-14 rounded-2xl bg-[#314e3e]/10 dark:bg-[#d6b883]/15 flex items-center justify-center text-[#314e3e] dark:text-[#d6b883]">
                      {parsing ? <Spinner className="w-7 h-7" /> : <Upload className="w-7 h-7" />}
                    </div>

                    <div>
                      <p className="text-sm sm:text-base font-bold text-[#293d32] dark:text-[#ecece0]">
                        {parsing ? "Đang đọc dữ liệu file Excel..." : "Nhấn để chọn file hoặc kéo thả file Excel vào đây"}
                      </p>
                      <p className="text-xs text-[#3c453e] dark:text-[#c2ccc0] mt-1">
                        Hỗ trợ định dạng .xlsx hoặc .xls (Tự động nhận diện phiếu ngày hoặc bảng ma trận cả kỳ)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* BƯỚC 2: XEM TRƯỚC VÀ XÁC NHẬN (PREVIEW & VALIDATE) */}
              {importStep === "preview" && parsedResult && (
                <div className="space-y-4">
                  {/* Summary Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237]">
                      <span className="text-xs text-[#3c453e] dark:text-[#c2ccc0]">Khớp trong lớp:</span>
                      <p className="text-base sm:text-lg font-bold text-[#293d32] dark:text-[#ecece0] mt-0.5">
                        {parsedResult.matchedCount} / {students.length} <span className="text-xs font-normal text-[#3c453e] dark:text-[#c2ccc0]">em</span>
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237]">
                      <span className="text-xs text-[#3c453e] dark:text-[#c2ccc0]">Số ngày nhận diện:</span>
                      <p className="text-base sm:text-lg font-bold text-[#293d32] dark:text-[#ecece0] mt-0.5">
                        {parsedResult.datesDetected.length} <span className="text-xs font-normal text-[#3c453e] dark:text-[#c2ccc0]">buổi</span>
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-600/30">
                      <span className="text-xs text-emerald-950 dark:text-emerald-200">Lượt có mặt:</span>
                      <p className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-300 mt-0.5">
                        {parsedResult.summaryStats.co_mat}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-600/30">
                      <span className="text-xs text-amber-950 dark:text-amber-200">Lượt vắng (P/K):</span>
                      <p className="text-base sm:text-lg font-bold text-amber-950 dark:text-amber-300 mt-0.5">
                        {parsedResult.summaryStats.nghi_phep + parsedResult.summaryStats.nghi_khong_phep}
                      </p>
                    </div>
                  </div>

                  {/* Cảnh báo học sinh không khớp (nếu có) */}
                  {parsedResult.unmatchedRows.length > 0 && (
                    <div className="p-3 rounded-xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-600/30 text-rose-950 dark:text-rose-100 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-700 dark:text-rose-300 mt-0.5" />
                      <div>
                        <strong>Có {parsedResult.unmatchedRows.length} dòng không khớp với danh sách lớp:</strong>
                        <p className="mt-0.5 text-xs opacity-90">
                          {parsedResult.unmatchedRows.map((u) => u.rawName).join(", ")}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bảng xem trước danh sách học sinh */}
                  <div className="border border-[#dedfd4] dark:border-[#354237] rounded-xl overflow-hidden bg-[#fffefa] dark:bg-[#1e2821]">
                    <div className="p-3 bg-[#faf8f3] dark:bg-[#151c18] border-b border-[#dedfd4] dark:border-[#354237] flex items-center justify-between text-xs font-bold text-[#293d32] dark:text-[#ecece0]">
                      <span>Xem trước dữ liệu điểm danh ({parsedResult.previewRows.length} Giáo lý sinh)</span>
                      <span className="text-[#3c453e] dark:text-[#c2ccc0] font-normal">
                        Chế độ: {parsedResult.mode === "matrix" ? "Ma trận nhiều ngày" : "Điểm danh ngày"}
                      </span>
                    </div>

                    <div
                      className="max-h-60 overflow-y-auto overflow-x-auto divide-y divide-[#dedfd4]/60 dark:divide-[#354237]/60 overscroll-contain"
                      data-lenis-prevent
                    >
                      <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                        <thead className="bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] border-b border-[#dedfd4] dark:border-[#354237] sticky top-0 font-bold">
                          <tr>
                            <th className="p-2.5 pl-3 w-10">STT</th>
                            <th className="p-2.5">Họ và Tên</th>
                            {parsedResult.dateColumns.map((col) => (
                              <th key={col.isoDate} className="p-2.5 text-center whitespace-nowrap">
                                {col.headerText}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dedfd4]/40 dark:divide-[#354237]/40">
                          {parsedResult.previewRows.map((row, idx) => (
                            <tr key={row.student.username} className="hover:bg-[#faf8f3]/40 dark:hover:bg-[#151c18]/40">
                              <td className="p-2.5 pl-3 text-[#3c453e] dark:text-[#c2ccc0] font-mono">{idx + 1}</td>
                              <td className="p-2.5 font-medium text-[#293d32] dark:text-[#ecece0]">
                                {row.student.tenThanh && <span className="font-normal text-[#3c453e] dark:text-[#c2ccc0] mr-1">{row.student.tenThanh}</span>}
                                <strong>{row.student.hoTen || row.student.username}</strong>
                              </td>
                              {parsedResult.dateColumns.map((col) => {
                                const st = row.statusesByDate[col.isoDate];
                                return (
                                  <td key={col.isoDate} className="p-2.5 text-center whitespace-nowrap">
                                    {st === "co_mat" && (
                                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 border border-emerald-600/25">✓ Có mặt</span>
                                    )}
                                    {st === "nghi_phep" && (
                                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-500/15 text-amber-950 dark:text-amber-200 border border-amber-600/25">P (Phép)</span>
                                    )}
                                    {st === "nghi_khong_phep" && (
                                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-rose-500/15 text-rose-950 dark:text-rose-200 border border-rose-600/25">K (Không phép)</span>
                                    )}
                                    {st === "nghi_le" && (
                                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-sky-500/15 text-sky-950 dark:text-sky-200 border border-sky-600/25">✝ Nghỉ lễ</span>
                                    )}
                                    {st === null && (
                                      <span className="text-[#3c453e] dark:text-[#c2ccc0] font-bold">—</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* BƯỚC 3: THÀNH CÔNG (SUCCESS) */}
              {importStep === "success" && (
                <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h3 className="text-lg font-bold text-[#293d32] dark:text-[#ecece0]">
                    Nhập dữ liệu Điểm danh thành công!
                  </h3>
                  <p className="text-xs sm:text-sm text-[#3c453e] dark:text-[#c2ccc0] max-w-md">
                    Toàn bộ {parsedResult?.parsedRecords?.length || 0} lượt điểm danh đã được lưu an toàn vào cơ sở dữ liệu và tự động cập nhật thống kê chuyên cần.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ============================================================
              TAB 2: XUẤT FILE EXCEL (EXPORT)
             ============================================================ */}
          {activeTab === "export" && (
            <div className="space-y-4">
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-xs sm:text-sm text-[#3c453e] dark:text-[#c2ccc0]">
                Chọn định dạng file Excel bạn muốn xuất để in ấn phiếu điểm danh hoặc lưu trữ hồ sơ lớp:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Phiếu điểm danh ngày */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] shadow-xs flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-600/25 flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-[#293d32] dark:text-[#ecece0]">
                      Phiếu Điểm Danh Ngày ({formatVNDate(currentDate).slice(0, 5)})
                    </h3>
                    <p className="text-xs text-[#3c453e] dark:text-[#c2ccc0] leading-relaxed">
                      Xuất danh sách Giáo lý sinh của ngày đang chọn kèm trạng thái điểm danh hiện tại, thích hợp để in ra giấy A4 mang lên lớp.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={exportingDate}
                    onClick={handleExportSingleDate}
                    className="min-h-[44px] w-full px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#314e3e] hover:bg-[#263e32] text-white dark:bg-[#d6b883] dark:hover:bg-[#c9a76d] dark:text-[#19251d] shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {exportingDate ? <Spinner className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                    <span>Xuất Phiếu Điểm Danh Ngày</span>
                  </button>
                </div>

                {/* 2. Ma trận cả học kỳ */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] shadow-xs flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-600/25 flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-[#293d32] dark:text-[#ecece0]">
                      Bảng Ma Trận Cả Học Kỳ ({hocKy === "HK1" ? "Học kỳ I" : "Học kỳ II"})
                    </h3>
                    <p className="text-xs text-[#3c453e] dark:text-[#c2ccc0] leading-relaxed">
                      Bảng tổng hợp ma trận tất cả các ngày Chúa Nhật trong học kỳ, tích hợp ngày nghỉ lễ, tính sẵn tổng vắng và tỷ lệ %.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={exportingMatrix}
                    onClick={handleExportSemesterMatrix}
                    className="min-h-[44px] w-full px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#314e3e] hover:bg-[#263e32] text-white dark:bg-[#d6b883] dark:hover:bg-[#c9a76d] dark:text-[#19251d] shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {exportingMatrix ? <Spinner className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                    <span>Xuất Ma Trận Cả Học Kỳ</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3]/80 dark:bg-[#151c18]/80 flex items-center justify-between gap-3 shrink-0">
          <div>
            {activeTab === "import" && importStep === "preview" && (
              <button
                type="button"
                disabled={saving}
                onClick={() => { setImportStep("upload"); setFile(null); }}
                className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold text-[#3c453e] hover:text-[#293d32] dark:text-[#c2ccc0] dark:hover:text-[#ecece0] hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer disabled:opacity-40"
              >
                ← Chọn file khác
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={saving}
              onClick={handleClose}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-[#293d32] dark:text-[#ecece0] hover:bg-[#faf8f3] transition-colors cursor-pointer disabled:opacity-40"
            >
              {importStep === "success" ? "Đóng" : "Hủy"}
            </button>

            {activeTab === "import" && importStep === "preview" && (
              <button
                type="button"
                disabled={saving || isLocked || !parsedResult?.parsedRecords?.length}
                onClick={handleConfirmSave}
                className="min-h-[44px] px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#314e3e] hover:bg-[#263e32] text-white dark:bg-[#d6b883] dark:hover:bg-[#c9a76d] dark:text-[#19251d] shadow-xs active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
              >
                {saving ? <Spinner className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                <span>{saving ? "Đang lưu điểm danh..." : "Xác nhận & Lưu điểm danh"}</span>
              </button>
            )}
          </div>
        </div>
      </Motion.div>
    </div>,
    document.body
  );
}
