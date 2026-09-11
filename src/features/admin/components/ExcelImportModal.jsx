import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FileSpreadsheet, Upload, Download, Check, AlertCircle,
  X, Users, ArrowRight, CheckCircle2, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "../../../components/ui/Skeleton.jsx";
import { parseStudentRosterExcel, downloadSampleExcel, preloadXLSX } from "../utils/excelRosterHelper.js";
import { importClassRoster } from "../dataLayer.js";

export default function ExcelImportModal({
  open,
  onClose,
  currentLop,
  namHoc,
  availableClasses = [],
  onSuccess,
  showToast,
}) {
  const [step, setStep] = useState("upload"); // 'upload' | 'preview' | 'success'
  const [selectedLop, setSelectedLop] = useState(() => currentLop || (availableClasses[0]?.lop || ""));
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [downloadingSample, setDownloadingSample] = useState(false);

  useEffect(() => {
    if (open) preloadXLSX();
  }, [open]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Cập nhật selectedLop nếu currentLop thay đổi
  React.useEffect(() => {
    if (currentLop) setSelectedLop(currentLop);
  }, [currentLop]);

  const resetState = useCallback(() => {
    setStep("upload");
    setFile(null);
    setParsing(false);
    setParsedData(null);
    setImporting(false);
    setImportResult(null);
    setDragOver(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleClose = useCallback(() => {
    if (importing) return;
    resetState();
    onClose();
  }, [importing, resetState, onClose]);

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
      const data = await parseStudentRosterExcel(f);
      setParsedData(data);
      setStep("preview");
    } catch (err) {
      console.error("Parse Excel error:", err);
      showToast(err.message || "Không thể đọc file Excel này", "error");
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
  const handleDownloadSample = async () => {
    if (downloadingSample) return;
    setDownloadingSample(true);
    try {
      const res = await downloadSampleExcel(selectedLop || "LopMau", namHoc);
      if (res?.cancelled) {
        showToast("Đã huỷ lưu file", "info");
        return;
      }
      if (res?.method === "picker") {
        showToast("Đã lưu file mẫu thành công", "success");
      } else {
        showToast("Đang tải file về máy...", "info");
      }
    } catch (err) {
      console.error("Download sample error:", err);
      showToast("Không thể tạo file mẫu", "error");
    } finally {
      setDownloadingSample(false);
    }
  };

  // Tiến hành import vào Database
  const handleImport = async () => {
    if (!selectedLop) {
      showToast("Vui lòng chọn lớp học cần xếp", "warning");
      return;
    }
    if (!parsedData || parsedData.validCount === 0) {
      showToast("Không có học sinh hợp lệ để nhập", "warning");
      return;
    }

    const validStudents = parsedData.students
      .filter((s) => s.isValid)
      .map((s) => ({
        username: s.username,
        ho_va_ten: s.ho_va_ten,
        ten_thanh: s.ten_thanh || null,
        ngay_sinh: s.ngay_sinh || null,
        ngay_rua_toi: s.ngay_rua_toi || null,
        ngay_ruoc_le: s.ngay_ruoc_le || null,
        ngay_them_suc: s.ngay_them_suc || null,
        role: s.role || "student",
        gioi_tinh: s.gioi_tinh || null,
        ten_cha: s.ten_cha || null,
        ten_me: s.ten_me || null,
        sdt: s.sdt || null,
        giao_xom: s.giao_xom || null,
      }));

    setImporting(true);
    try {
      const result = await importClassRoster(selectedLop, namHoc, validStudents);
      setImportResult(result);
      setStep("success");
      showToast(`Đã nhập thành công ${result?.enrolled || validStudents.length} học sinh!`, "success");
      if (onSuccess) onSuccess(result);
    } catch (err) {
      console.error("Import error:", err);
      showToast(err.message || "Quá trình import thất bại. Kiểm tra quyền Admin.", "error");
    } finally {
      setImporting(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      data-lenis-prevent
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-5 bg-stone-900/50 dark:bg-black/70 backdrop-blur-sm transition-all"
      onClick={handleClose}
    >
      <motion.div
        data-lenis-prevent
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${
          step === "preview" ? "max-w-5xl xl:max-w-6xl" : "max-w-2xl"
        } max-h-[90vh] bg-white dark:bg-[#1C1917] rounded-[28px] sm:rounded-[32px] shadow-2xl border border-amber-900/10 dark:border-amber-100/10 flex flex-col overflow-hidden text-stone-800 dark:text-stone-200 transition-all duration-300`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-amber-900/10 dark:border-amber-100/10 bg-amber-50/50 dark:bg-stone-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center shadow-sm">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[16px] sm:text-[18px] font-extrabold text-amber-950 dark:text-amber-50 font-serif">
                Nhập danh sách học sinh (.xlsx)
              </h3>
              <p className="text-[12px] font-medium text-stone-500 dark:text-stone-400">
                Năm học: <span className="font-bold text-amber-800 dark:text-amber-400">{namHoc}</span>
                {selectedLop && (
                  <>
                    {" "}• Lớp: <span className="font-bold text-amber-800 dark:text-amber-400">{selectedLop}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={importing}
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 min-h-0" data-lenis-prevent>
          {/* Lựa chọn Lớp học (nếu mở từ ngoài toolbar) */}
          {!currentLop && step !== "success" && (
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-[13px] font-bold text-stone-700 dark:text-stone-300 whitespace-nowrap">
                Chọn lớp nhận học sinh:
              </label>
              <select
                value={selectedLop}
                onChange={(e) => setSelectedLop(e.target.value)}
                disabled={importing}
                className="flex-1 rounded-xl border border-amber-900/15 dark:border-amber-100/15 bg-stone-50 dark:bg-stone-800 px-3 py-2 text-[13.5px] font-bold text-amber-950 dark:text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                {availableClasses.map((c) => (
                  <option key={c.lop} value={c.lop}>
                    Lớp {c.lop} ({c.studentCount || 0} HS)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* BƯỚC 1: UPLOAD FILE */}
          {step === "upload" && (
            <div className="flex flex-col gap-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-[24px] p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  dragOver
                    ? "border-amber-600 bg-amber-500/10 scale-[0.99]"
                    : "border-amber-900/20 dark:border-amber-100/20 hover:border-amber-600/60 hover:bg-amber-50/40 dark:hover:bg-amber-950/20"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-3 shadow-inner">
                  {parsing ? (
                    <Spinner className="w-6 h-6" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <p className="text-[15px] font-bold text-amber-950 dark:text-amber-50 mb-1">
                  {parsing ? "Đang đọc dữ liệu Excel..." : "Kéo thả file .xlsx vào đây hoặc bấm để chọn file"}
                </p>
                <p className="text-[12.5px] text-stone-500 dark:text-stone-400 max-w-sm">
                  Hỗ trợ định dạng Microsoft Excel (.xlsx, .xls). Hệ thống tự động nhận diện các cột Tên Thánh, Họ và Tên, Ngày Sinh, SĐT...
                </p>
              </div>

              {/* Box Hướng Dẫn & Tải File Mẫu */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50/60 dark:bg-stone-800/40 border border-amber-900/10 dark:border-amber-100/10">
                <div className="flex items-center gap-2.5 text-stone-600 dark:text-stone-300 text-[13px]">
                  <span className="text-[16px]">💡</span>
                  <span>Chưa có file danh sách chuẩn?</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  disabled={downloadingSample}
                  title="Tải file Excel mẫu (.xlsx) chuẩn cấu trúc"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-400 border border-amber-900/15 dark:border-amber-100/15 text-[12.5px] font-bold shadow-sm hover:bg-amber-100/50 dark:hover:bg-amber-950/40 active:scale-95 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {downloadingSample ? (
                    <Spinner className="w-3.5 h-3.5" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  {downloadingSample ? "Đang tải mẫu..." : "Tải file Excel mẫu (.xlsx)"}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-stone-800/60 text-stone-500 dark:text-stone-400 text-[12px] leading-relaxed">
                <p className="font-semibold text-stone-700 dark:text-stone-300 mb-0.5">Quy ước phân quyền & bảo mật:</p>
                • Tài khoản được tự động gán vai trò <span className="font-mono text-amber-800 dark:text-amber-400 font-bold">student</span> (Học sinh) và trạng thái <span className="font-semibold text-stone-700 dark:text-stone-300">Đang học</span>.<br />
                • Mỗi học sinh được tạo tài khoản Supabase Auth với email <span className="font-mono text-amber-800 dark:text-amber-400 font-bold">[username]@giaoly.local</span> và mật khẩu mặc định là <span className="font-mono text-amber-800 dark:text-amber-400 font-bold">bangiaoly</span>.
              </div>
            </div>
          )}

          {/* BƯỚC 2: PREVIEW & KIỂM TRA DỮ LIỆU */}
          {step === "preview" && parsedData && (
            <div className="flex flex-col gap-4">
              {/* Thống kê nhanh */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                <div className="p-3 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-black/5 dark:border-white/5">
                  <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">Tổng cộng</span>
                  <span className="text-[18px] sm:text-[20px] font-black text-amber-950 dark:text-amber-50">{parsedData.total}</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20">
                  <span className="block text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Hợp lệ</span>
                  <span className="text-[18px] sm:text-[20px] font-black text-emerald-700 dark:text-emerald-400">{parsedData.validCount}</span>
                </div>
                <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20">
                  <span className="block text-[11px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Lỗi / Bỏ qua</span>
                  <span className="text-[18px] sm:text-[20px] font-black text-red-700 dark:text-red-400">{parsedData.invalidCount}</span>
                </div>
              </div>

              {/* Cảnh báo nếu có dòng lỗi */}
              {parsedData.invalidCount > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-[12px] text-amber-900 dark:text-amber-300">
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Có {parsedData.invalidCount} dòng dữ liệu không đạt yêu cầu:
                  </p>
                  <ul className="list-disc pl-5 space-y-0.5 max-h-20 overflow-y-auto">
                    {parsedData.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hướng dẫn cuộn */}
              <div className="flex items-center justify-between text-[12px] text-stone-500 dark:text-stone-400">
                <span className="font-bold text-stone-700 dark:text-stone-300">
                  Danh sách học sinh đọc được ({parsedData.validCount} hợp lệ):
                </span>
                <span className="text-[11.5px] font-medium text-amber-800 dark:text-amber-400">
                  ↔ Cuộn ngang & dọc để xem toàn bộ các cột
                </span>
              </div>

              {/* Bảng xem trước cuộn ngang & dọc */}
              <div
                data-lenis-prevent
                className="border border-amber-900/15 dark:border-amber-100/15 rounded-2xl max-h-[50vh] overflow-x-auto overflow-y-auto shadow-inner bg-white/70 dark:bg-stone-900/50 overscroll-contain"
              >
                <table className="w-full text-left text-[12.5px] border-collapse min-w-[1100px] whitespace-nowrap">
                  <thead className="bg-amber-100/95 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold sticky top-0 z-10 shadow-sm backdrop-blur-sm">
                    <tr>
                      <th className="px-3 py-2.5 w-12 text-center">STT</th>
                      <th className="px-3.5 py-2.5">Mã HS (Username)</th>
                      <th className="px-3.5 py-2.5">Tên Thánh</th>
                      <th className="px-3.5 py-2.5">Họ và tên</th>
                      <th className="px-3.5 py-2.5">Ngày sinh</th>
                      <th className="px-3.5 py-2.5 text-center">Phái</th>
                      <th className="px-3.5 py-2.5">Ngày Rửa Tội</th>
                      <th className="px-3.5 py-2.5">Ngày Rước Lễ</th>
                      <th className="px-3.5 py-2.5">Ngày Thêm Sức</th>
                      <th className="px-3.5 py-2.5">Tên Cha</th>
                      <th className="px-3.5 py-2.5">Tên Mẹ</th>
                      <th className="px-3.5 py-2.5">Số điện thoại</th>
                      <th className="px-3.5 py-2.5">Giáo xóm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {parsedData.students.map((s, idx) => (
                      <tr
                        key={idx}
                        className={
                          s.isValid
                            ? "hover:bg-amber-50/60 dark:hover:bg-stone-800/60 transition-colors"
                            : "bg-red-50/70 dark:bg-red-950/40 text-red-600"
                        }
                      >
                        <td className="px-3 py-2.5 text-center text-stone-400 font-medium">{idx + 1}</td>
                        <td className="px-3.5 py-2.5 font-mono font-bold text-stone-700 dark:text-stone-300">{s.username}</td>
                        <td className="px-3.5 py-2.5 text-stone-600 dark:text-stone-300">{s.ten_thanh || "—"}</td>
                        <td className="px-3.5 py-2.5 font-bold text-amber-950 dark:text-amber-50">{s.ho_va_ten}</td>
                        <td className="px-3.5 py-2.5 text-stone-600 dark:text-stone-300">{s.ngay_sinh || "—"}</td>
                        <td className="px-3.5 py-2.5 text-center font-medium">{s.gioi_tinh || "—"}</td>
                        <td className="px-3.5 py-2.5 text-stone-600 dark:text-stone-300">{s.ngay_rua_toi || "—"}</td>
                        <td className="px-3.5 py-2.5 text-stone-600 dark:text-stone-300">{s.ngay_ruoc_le || "—"}</td>
                        <td className="px-3.5 py-2.5 text-stone-600 dark:text-stone-300">{s.ngay_them_suc || "—"}</td>
                        <td className="px-3.5 py-2.5 text-stone-600 dark:text-stone-300">{s.ten_cha || "—"}</td>
                        <td className="px-3.5 py-2.5 text-stone-600 dark:text-stone-300">{s.ten_me || "—"}</td>
                        <td className="px-3.5 py-2.5 text-stone-600 dark:text-stone-300">{s.sdt || "—"}</td>
                        <td className="px-3.5 py-2.5 text-stone-600 dark:text-stone-300">{s.giao_xom || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BƯỚC 3: KẾT QUẢ THÀNH CÔNG */}
          {step === "success" && (
            <div className="py-6 flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-[20px] font-extrabold text-amber-950 dark:text-amber-50 font-serif">
                Nhập danh sách thành công!
              </h4>
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-stone-800/50 border border-amber-900/10 dark:border-amber-100/10 max-w-md text-[13.5px] leading-relaxed text-stone-600 dark:text-stone-300">
                <p>
                  Đã ghi danh <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{importResult?.enrolled || parsedData?.validCount} học sinh</strong> vào <strong className="text-amber-950 dark:text-amber-50">Lớp {selectedLop}</strong> (Niên khóa {namHoc}).
                </p>
                <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5 flex justify-center gap-4 text-[12px] text-stone-500">
                  <span>Tài khoản mới: <strong>{importResult?.newUsers ?? "—"}</strong></span>
                  <span>Cập nhật: <strong>{importResult?.updatedUsers ?? "—"}</strong></span>
                </div>
              </div>
              <p className="text-[12.5px] text-stone-400 max-w-sm">
                Mật khẩu mặc định của tất cả học sinh là <span className="font-mono font-bold text-amber-700 dark:text-amber-400">bangiaoly</span>.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 sm:px-7 py-4 border-t border-amber-900/10 dark:border-amber-100/10 bg-stone-50 dark:bg-stone-900/60 flex items-center justify-between gap-3">
          {step === "upload" && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl text-[13.5px] font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              >
                Đóng
              </button>
            </div>
          )}

          {step === "preview" && (
            <>
              <button
                type="button"
                disabled={importing}
                onClick={() => setStep("upload")}
                className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-stone-600 dark:text-stone-300 bg-stone-200/60 dark:bg-stone-800 hover:bg-stone-200 transition-colors disabled:opacity-50"
              >
                Chọn file khác
              </button>

              <button
                type="button"
                disabled={importing || !parsedData || parsedData.validCount === 0}
                onClick={handleImport}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-900 dark:bg-amber-600 text-white text-[13.5px] font-bold shadow-md hover:bg-amber-800 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {importing ? (
                  <>
                    <Spinner className="w-4 h-4" /> Đang tạo tài khoản & ghi danh...
                  </>
                ) : (
                  <>
                    Xác nhận nhập ({parsedData?.validCount} học sinh)
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}

          {step === "success" && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[13.5px] font-bold shadow-md transition-all active:scale-95"
              >
                Hoàn tất & Đóng
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
