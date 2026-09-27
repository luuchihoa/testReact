import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FileSpreadsheet, Upload, Download, AlertCircle,
  X, ArrowRight, CheckCircle2, Lightbulb, Users, Shield, School
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Spinner } from "../../../components/ui/Skeleton.jsx";
import { parseUsersExcel, downloadSampleUsersExcel, preloadXLSX } from "../utils/excelRosterHelper.js";
import { importUsersList } from "../dataLayer.js";
import { ROLE_LABELS_VI, ROLE_BADGE } from "../constants.js";

export default function ExcelImportUsersModal({
  open,
  onClose,
  onSuccess,
  showToast,
}) {
  const prefersReducedMotion = useReducedMotion();
  const [step, setStep] = useState("upload"); // 'upload' | 'preview' | 'success'
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [downloadingSample, setDownloadingSample] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

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

  useEffect(() => {
    if (!open) return;
    preloadXLSX();

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !importing) {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, importing, handleClose]);

  // Xử lý đọc file Excel / Numbers
  const processFile = async (f) => {
    if (!f) return;
    const lowerName = (f.name || "").toLowerCase();
    const isExcel = lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls");
    const isNumbers = lowerName.endsWith(".numbers");
    if (!isExcel && !isNumbers) {
      showToast("Vui lòng chọn file định dạng Excel (.xlsx, .xls) hoặc Apple Numbers (.numbers)", "warning");
      return;
    }

    setFile(f);
    setParsing(true);
    try {
      const data = await parseUsersExcel(f);
      setParsedData(data);
      setStep("preview");
    } catch (err) {
      console.error("Parse spreadsheet error:", err);
      showToast(err.message || "Không thể đọc file bảng tính này. Vui lòng kiểm tra lại cấu trúc.", "error");
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
      const res = await downloadSampleUsersExcel();
      if (res?.cancelled) {
        showToast("Đã hủy lưu file", "info");
        return;
      }
      if (res?.method === "picker") {
        showToast("Đã lưu file mẫu thành công", "success");
      } else {
        showToast("Đang tải file mẫu về thiết bị...", "info");
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
    if (!parsedData || parsedData.validCount === 0) {
      showToast("Không có người dùng hợp lệ để nhập", "warning");
      return;
    }

    const validUsers = parsedData.users
      .filter((u) => u.isValid)
      .map((u) => ({
        username: u.username,
        ho_va_ten: u.ho_va_ten,
        ten_thanh: u.ten_thanh || null,
        ngay_sinh: u.ngay_sinh || null,
        ngay_rua_toi: u.ngay_rua_toi || null,
        ngay_ruoc_le: u.ngay_ruoc_le || null,
        ngay_them_suc: u.ngay_them_suc || null,
        role: u.role || "teacher",
        trang_thai: u.trang_thai || "Đang học",
        gioi_tinh: u.gioi_tinh || null,
        ten_cha: u.ten_cha || null,
        ten_me: u.ten_me || null,
        sdt: u.sdt || null,
        giao_xom: u.giao_xom || null,
      }));

    setImporting(true);
    try {
      const result = await importUsersList(validUsers);
      setImportResult(result);
      setStep("success");
      showToast(`Đã nhập thành công ${result?.total || validUsers.length} tài khoản người dùng!`, "success");
      if (onSuccess) onSuccess(result);
    } catch (err) {
      console.error("Import error:", err);
      showToast(err.message || "Quá trình nhập danh sách thất bại. Kiểm tra quyền Quản trị.", "error");
    } finally {
      setImporting(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      data-lenis-prevent
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-5 bg-stone-900/60 dark:bg-black/75 backdrop-blur-xs transition-all"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="excel-users-modal-title"
    >
      <motion.div
        data-lenis-prevent
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${
          step === "preview" ? "max-w-5xl xl:max-w-6xl" : "max-w-2xl"
        } max-h-[90vh] bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#dedfd4] dark:border-[#354237] flex flex-col overflow-hidden text-[#293d32] dark:text-[#ecece0] transition-all duration-300`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 id="excel-users-modal-title" className="text-base sm:text-lg font-bold text-[#293d32] dark:text-[#ecece0] font-sans leading-tight">
                Nhập danh sách Người dùng (.xlsx, .numbers)
              </h3>
              <p className="text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac] mt-0.5">
                Quản trị nhân sự · Giáo lý viên, Thành viên & Giáo lý sinh
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={importing}
            onClick={handleClose}
            aria-label="Đóng"
            className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-[#575e55] hover:text-[#293d32] dark:text-[#b0b9ac] dark:hover:text-[#ecece0] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 min-h-0" data-lenis-prevent>
          {/* BƯỚC 1: UPLOAD FILE */}
          {step === "upload" && (
            <div className="flex flex-col gap-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl sm:rounded-3xl p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  dragOver
                    ? "border-[#314e3e] dark:border-[#d6b883] bg-[#314e3e]/10 dark:bg-[#d6b883]/10 scale-[0.99]"
                    : "border-[#dedfd4] dark:border-[#354237] hover:border-[#314e3e]/50 dark:hover:border-[#d6b883]/50 hover:bg-[#faf8f3] dark:hover:bg-[#151c18]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .numbers, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/vnd.apple.numbers"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="w-14 h-14 rounded-2xl bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] flex items-center justify-center mb-3 shadow-inner">
                  {parsing ? (
                    <Spinner className="w-6 h-6" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <p className="text-sm sm:text-base font-bold text-[#293d32] dark:text-[#ecece0] mb-1">
                  {parsing ? "Đang đọc dữ liệu bảng tính..." : "Kéo thả file .xlsx hoặc .numbers vào đây hoặc bấm để chọn"}
                </p>
                <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] max-w-sm leading-relaxed">
                  Hỗ trợ định dạng Microsoft Excel (.xlsx, .xls) và Apple Numbers (.numbers). Hệ thống tự động so khớp Họ tên tiếng Việt có dấu, cập nhật vai trò hoặc tự sinh mã tài khoản mới.
                </p>
              </div>

              {/* Box Hướng Dẫn & Tải File Mẫu */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237]">
                <div className="flex items-center gap-2 text-[#575e55] dark:text-[#b0b9ac] text-xs sm:text-sm">
                  <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span>Chưa có file danh sách người dùng chuẩn cấu trúc?</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  disabled={downloadingSample}
                  title="Tải file Excel mẫu (.xlsx) danh sách người dùng chuẩn hóa"
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#fffefa] dark:bg-[#1e2821] text-[#314e3e] dark:text-[#d6b883] border border-[#dedfd4] dark:border-[#354237] text-xs font-bold shadow-xs hover:bg-[#314e3e]/5 dark:hover:bg-[#d6b883]/10 active:scale-95 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {downloadingSample ? (
                    <Spinner className="w-3.5 h-3.5" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{downloadingSample ? "Đang tải mẫu..." : "Tải file Excel mẫu (.xlsx)"}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] text-xs leading-relaxed border border-[#dedfd4] dark:border-[#354237]">
                <p className="font-bold text-[#293d32] dark:text-[#ecece0] mb-1">Quy ước phân quyền & định danh tự động:</p>
                • <strong>Vai trò hỗ trợ:</strong> Giáo lý viên (<span className="font-mono text-xs">teacher</span>), Giáo lý sinh (<span className="font-mono text-xs">student</span>), Thành viên (<span className="font-mono text-xs">user</span>), Quản trị viên (<span className="font-mono text-xs">admin</span>).<br />
                • Hệ thống tự động so khớp Họ tên tiếng Việt + Ngày sinh / SĐT để nhận diện người dùng cũ trong cơ sở dữ liệu.<br />
                • Người dùng mới được tự động sinh mã dạng <span className="font-mono text-[#314e3e] dark:text-[#d6b883] font-bold">[tên][họ][năm sinh]</span> (ví dụ: <span className="font-mono font-bold">duongnguyen92</span>, <span className="font-mono font-bold">annguyen15_2</span>...) với mật khẩu mặc định là <span className="font-mono text-[#314e3e] dark:text-[#d6b883] font-bold">bangiaoly</span>.
              </div>
            </div>
          )}

          {/* BƯỚC 2: PREVIEW & KIỂM TRA DỮ LIỆU */}
          {step === "preview" && parsedData && (
            <div className="flex flex-col gap-4">
              {/* Thống kê nhanh */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                <div className="p-3 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237]">
                  <span className="block text-xs font-bold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-wider">Tổng cộng</span>
                  <span className="text-lg sm:text-xl font-bold font-sans text-[#293d32] dark:text-[#ecece0]">{parsedData.total}</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/60 dark:border-emerald-800/60">
                  <span className="block text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Hợp lệ</span>
                  <span className="text-lg sm:text-xl font-bold font-sans text-emerald-800 dark:text-emerald-300">{parsedData.validCount}</span>
                </div>
                <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300/60 dark:border-red-800/60">
                  <span className="block text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-wider">Lỗi / Bỏ qua</span>
                  <span className="text-lg sm:text-xl font-bold font-sans text-red-800 dark:text-red-300">{parsedData.invalidCount}</span>
                </div>
              </div>

              {/* Cảnh báo nếu có dòng lỗi */}
              {parsedData.invalidCount > 0 && (
                <div role="alert" className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold flex items-center gap-1.5 mb-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    Có {parsedData.invalidCount} dòng dữ liệu không đạt yêu cầu:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 max-h-28 overflow-y-auto">
                    {parsedData.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hướng dẫn cuộn */}
              <div className="flex items-center justify-between text-xs text-[#575e55] dark:text-[#b0b9ac] gap-2 flex-wrap">
                <span className="font-bold text-[#293d32] dark:text-[#ecece0]">
                  Danh sách người dùng ({parsedData.validCount} hợp lệ):
                </span>
                <span className="text-xs font-medium text-[#7c5c2d] dark:text-[#d4b47d]">
                  ↔ Cuộn ngang & dọc để xem toàn bộ các cột
                </span>
              </div>

              {/* Bảng xem trước cuộn ngang & dọc */}
              <div
                data-lenis-prevent
                className="border border-[#dedfd4] dark:border-[#354237] rounded-2xl max-h-[50vh] overflow-x-auto overflow-y-auto shadow-inner bg-[#fffefa] dark:bg-[#1e2821] overscroll-contain"
              >
                <table className="w-full text-left text-xs border-collapse min-w-[760px] whitespace-nowrap">
                  <thead className="bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] font-bold sticky top-0 z-10 shadow-xs border-b border-[#dedfd4] dark:border-[#354237]">
                    <tr>
                      <th className="px-3 py-2.5 w-12 text-center">STT</th>
                      <th className="px-3.5 py-2.5">Mã dự kiến (Username)</th>
                      <th className="px-3.5 py-2.5">Tên Thánh</th>
                      <th className="px-3.5 py-2.5">Họ và tên</th>
                      <th className="px-3.5 py-2.5">Ngày sinh</th>
                      <th className="px-3.5 py-2.5 text-center">Phái</th>
                      <th className="px-3.5 py-2.5 text-center">Vai trò</th>
                      <th className="px-3.5 py-2.5">Số điện thoại</th>
                      <th className="px-3.5 py-2.5">Giáo xóm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dedfd4] dark:divide-[#354237]">
                    {parsedData.users.map((u, idx) => (
                      <tr
                        key={idx}
                        className={
                          u.isValid
                            ? "hover:bg-[#314e3e]/5 dark:hover:bg-[#d6b883]/5 transition-colors"
                            : "bg-red-50/70 dark:bg-red-950/40 text-red-700 dark:text-red-300"
                        }
                      >
                        <td className="px-3 py-2.5 text-center text-[#575e55] dark:text-[#b0b9ac] font-medium">{idx + 1}</td>
                        <td className="px-3.5 py-2.5 font-mono font-bold text-[#293d32] dark:text-[#ecece0]">{u.username}</td>
                        <td className="px-3.5 py-2.5 text-[#7c5c2d] dark:text-[#d4b47d] font-semibold">{u.ten_thanh || "—"}</td>
                        <td className="px-3.5 py-2.5 font-bold text-[#293d32] dark:text-[#ecece0]">{u.ho_va_ten}</td>
                        <td className="px-3.5 py-2.5 text-[#575e55] dark:text-[#b0b9ac]">{u.ngay_sinh || "—"}</td>
                        <td className="px-3.5 py-2.5 text-center font-medium">{u.gioi_tinh || "—"}</td>
                        <td className="px-3.5 py-2.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${ROLE_BADGE[u.role] || ROLE_BADGE.user}`}>
                            {ROLE_LABELS_VI[u.role] || u.role}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-[#575e55] dark:text-[#b0b9ac]">{u.sdt || "—"}</td>
                        <td className="px-3.5 py-2.5 text-[#575e55] dark:text-[#b0b9ac]">{u.giao_xom || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* BƯỚC 3: KẾT QUẢ THÀNH CÔNG */}
          {step === "success" && (
            <div role="status" aria-live="polite" className="py-6 flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-xl font-bold font-sans text-[#293d32] dark:text-[#ecece0]">
                Nhập danh sách thành công!
              </h4>
              <div className="p-4 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] max-w-md text-sm leading-relaxed text-[#575e55] dark:text-[#b0b9ac]">
                <p>
                  Đã xử lý <strong className="text-emerald-700 dark:text-emerald-300 font-bold">{importResult?.total || parsedData?.validCount} tài khoản người dùng</strong> trong hệ thống.
                </p>
                <div className="mt-2 pt-2 border-t border-[#dedfd4] dark:border-[#354237] flex justify-center gap-4 text-xs text-[#575e55] dark:text-[#b0b9ac]">
                  <span>Tạo mới: <strong className="text-[#293d32] dark:text-[#ecece0]">{importResult?.newUsers ?? "—"}</strong></span>
                  <span>Cập nhật: <strong className="text-[#293d32] dark:text-[#ecece0]">{importResult?.updatedUsers ?? "—"}</strong></span>
                </div>
              </div>
              <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] max-w-sm">
                Mật khẩu mặc định của tất cả tài khoản tạo mới là <span className="font-mono font-bold text-[#314e3e] dark:text-[#d6b883]">bangiaoly</span>.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 sm:px-7 py-4 border-t border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] flex items-center justify-between gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {step === "upload" && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#575e55] dark:text-[#b0b9ac] hover:text-[#293d32] dark:hover:text-[#ecece0] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e]"
              >
                Đóng
              </button>
            </div>
          )}

          {step === "preview" && (
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full">
              <button
                type="button"
                disabled={importing}
                onClick={() => setStep("upload")}
                className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#575e55] dark:text-[#b0b9ac] bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors disabled:opacity-50 cursor-pointer text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e]"
              >
                Chọn file khác
              </button>

              <button
                type="button"
                disabled={importing || !parsedData || parsedData.validCount === 0}
                onClick={handleImport}
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#314e3e] hover:bg-[#263e32] dark:bg-[#d6b883] dark:hover:bg-[#c9a76d] text-white dark:text-[#19251d] text-xs sm:text-sm font-bold shadow-xs active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e]"
              >
                {importing ? (
                  <>
                    <Spinner className="w-4 h-4 text-white dark:text-[#19251d]" /> Đang lưu tài khoản...
                  </>
                ) : (
                  <>
                    <span>Xác nhận nhập ({parsedData?.validCount} tài khoản)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === "success" && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="min-h-[44px] w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
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
