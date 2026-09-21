import React, { useState, useEffect, useMemo } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { 
  X, AlertCircle, Clock, UserCheck, 
  ChevronRight, ChevronLeft, Inbox,
  Sparkles, User, Cross, Users, Calendar, Phone, MapPin, 
  Droplets, Feather, FileText, CheckCircle2,
  CheckCheck, Image as ImageIcon, ShieldAlert,
  CheckSquare, Square
} from "lucide-react";
import { useToast } from "../../../components/ui/ToastContext.jsx";
import { ConfirmDialog } from "../../../components/ui/StudentShared.jsx";
import { 
  getProfileChangesDiff, 
  normalizeProfileObject, 
  PROFILE_FIELD_CONFIG, 
  formatFieldValue 
} from "../../account/utils.js";
import { approveProfileRequest, rejectProfileRequest } from "../api.js";

const APPLE_EASE = [0.16, 1, 0.3, 1];

const FIELD_ICONS = {
  ho_va_ten:     User,
  ten_thanh:     Cross,
  ngay_sinh:     Calendar,
  gioi_tinh:     Users,
  ngay_rua_toi:  Droplets,
  ngay_ruoc_le:  Sparkles,
  ngay_them_suc: Feather,
  ten_cha:       User,
  ten_me:        User,
  sdt:           Phone,
  giao_xom:      MapPin,
  avatar:        ImageIcon,
};

const REJECT_PRESETS = [
  "Cần bổ sung Giấy chứng nhận Rửa Tội (bản photo/ảnh chụp)",
  "Ngày sinh chưa khớp với Giấy Khai sinh",
  "Số điện thoại liên lạc của phụ huynh chưa chính xác",
  "Tên Thánh hoặc Họ Tên chưa đúng theo Sổ Rửa Tội",
];

export default function ProfileRequestsModal({
  open,
  onClose,
  requests = [],
  onSuccess,
}) {
  const { showToast } = useToast();
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);
  const [selectedKeysByReq, setSelectedKeysByReq] = useState({});

  // Chọn request đang duyệt (mặc định là request đầu tiên)
  const activeRequest = useMemo(() => {
    if (!requests || requests.length === 0) return null;
    return requests.find((r) => r.id === selectedRequestId) || requests[0];
  }, [requests, selectedRequestId]);

  const currentIndex = useMemo(() => {
    if (!activeRequest || !requests) return 0;
    const idx = requests.findIndex((r) => r.id === activeRequest.id);
    return idx >= 0 ? idx : 0;
  }, [requests, activeRequest]);

  // Danh sách các trường khác biệt của activeRequest
  const currentDiffs = useMemo(() => {
    if (!activeRequest) return [];
    return getProfileChangesDiff(activeRequest.current_data, activeRequest.proposed_data);
  }, [activeRequest]);

  // Bộ key các trường được chọn duyệt cho activeRequest (mặc định chọn tất cả)
  const selectedFieldKeys = useMemo(() => {
    if (!activeRequest) return new Set();
    const reqId = activeRequest.id;
    if (selectedKeysByReq[reqId] !== undefined) {
      return selectedKeysByReq[reqId];
    }
    return new Set(currentDiffs.map((d) => d.key));
  }, [activeRequest, selectedKeysByReq, currentDiffs]);

  // Toggle chọn/bỏ chọn từng trường
  const toggleFieldSelection = (fieldKey) => {
    if (!activeRequest) return;
    const reqId = activeRequest.id;
    const nextSet = new Set(selectedFieldKeys);
    if (nextSet.has(fieldKey)) {
      nextSet.delete(fieldKey);
    } else {
      nextSet.add(fieldKey);
    }
    setSelectedKeysByReq((prev) => ({
      ...prev,
      [reqId]: nextSet,
    }));
  };

  // Chọn tất cả các mục
  const handleSelectAllFields = () => {
    if (!activeRequest) return;
    setSelectedKeysByReq((prev) => ({
      ...prev,
      [activeRequest.id]: new Set(currentDiffs.map((d) => d.key)),
    }));
  };

  // Bỏ chọn tất cả các mục
  const handleDeselectAllFields = () => {
    if (!activeRequest) return;
    setSelectedKeysByReq((prev) => ({
      ...prev,
      [activeRequest.id]: new Set(),
    }));
  };

  // Lắng nghe phím Escape để đóng modal
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !actionLoading && !showRejectDialog && !showBatchConfirm) {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, actionLoading, showRejectDialog, showBatchConfirm, onClose]);

  const handleApprove = async (reqId) => {
    if (actionLoading || !activeRequest) return;
    const diffs = currentDiffs;
    const isAllSelected = diffs.length === 0 || selectedFieldKeys.size === diffs.length;

    if (diffs.length > 0 && selectedFieldKeys.size === 0) {
      showToast("Vui lòng chọn ít nhất 1 mục để duyệt hoặc bấm 'Từ chối'", "warning");
      return;
    }

    setActionLoading(true);
    try {
      let selectedProposedData = null;
      if (!isAllSelected && diffs.length > 0) {
        const propNorm = normalizeProfileObject(activeRequest.proposed_data);
        selectedProposedData = {};
        selectedFieldKeys.forEach((k) => {
          if (propNorm[k] !== undefined) {
            selectedProposedData[k] = propNorm[k];
          }
        });
      }

      await approveProfileRequest(reqId, selectedProposedData);

      if (!isAllSelected && diffs.length > 0) {
        showToast(`Đã phê duyệt ${selectedFieldKeys.size}/${diffs.length} mục thay đổi vào Sổ bộ Giáo xứ!`, "success");
      } else {
        showToast("Đã phê duyệt và cập nhật thông tin Giáo lý sinh vào Sổ bộ Giáo xứ!", "success");
      }

      onSuccess?.();
      if (requests.length <= 1) {
        onClose?.();
      } else {
        const remaining = requests.filter((r) => r.id !== reqId);
        if (remaining.length > 0) {
          setSelectedRequestId(remaining[0].id);
        }
      }
    } catch (err) {
      console.error("Approve error:", err);
      showToast(err.message || "Không thể phê duyệt yêu cầu", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBatchApprove = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      let count = 0;
      for (const req of requests) {
        await approveProfileRequest(req.id);
        count++;
      }
      showToast(`Đã phê duyệt thành công toàn bộ ${count} yêu cầu thay đổi hồ sơ!`, "success");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error("Batch approve error:", err);
      showToast("Lỗi khi duyệt hàng loạt: " + (err.message || ""), "error");
      onSuccess?.();
    } finally {
      setActionLoading(false);
      setShowBatchConfirm(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!activeRequest || actionLoading) return;
    setActionLoading(true);
    try {
      await rejectProfileRequest(activeRequest.id, rejectNote);
      showToast("Đã từ chối yêu cầu thay đổi hồ sơ", "info");
      setShowRejectDialog(false);
      setRejectNote("");
      onSuccess?.();
      if (requests.length <= 1) {
        onClose?.();
      } else {
        const remaining = requests.filter((r) => r.id !== activeRequest.id);
        if (remaining.length > 0) {
          setSelectedRequestId(remaining[0].id);
        }
      }
    } catch (err) {
      console.error("Reject error:", err);
      showToast(err.message || "Không thể từ chối yêu cầu", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectPrev = () => {
    if (currentIndex > 0) {
      setSelectedRequestId(requests[currentIndex - 1].id);
    }
  };

  const handleSelectNext = () => {
    if (currentIndex < requests.length - 1) {
      setSelectedRequestId(requests[currentIndex + 1].id);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6">
      {/* Backdrop */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: APPLE_EASE }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={() => !actionLoading && onClose?.()}
      />

      {/* Modal Container: Bottom-sheet on Mobile (dính sát đáy & 2 bên), Centered Dialog on Tablet/Desktop */}
      <Motion.div
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 20 }}
        transition={{ duration: 0.25, ease: APPLE_EASE }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pcr-modal-title"
        className="relative w-full sm:max-w-5xl h-[94vh] sm:h-[90vh] max-h-[94vh] sm:max-h-[90vh] bg-[#fffefa] dark:bg-[#1e2821] rounded-t-3xl sm:rounded-3xl rounded-b-none sm:rounded-b-3xl border-t sm:border border-[#dedfd4] dark:border-[#354237] shadow-2xl flex flex-col z-10 overflow-hidden mx-auto text-[#293d32] dark:text-[#ecece0]"
      >
        {/* Mobile Grab Handle Bar */}
        <div className="w-10 h-1 rounded-full bg-[#dedfd4] dark:bg-[#354237] mx-auto mt-2 sm:hidden shrink-0" aria-hidden="true" />

        {/* 1. MODAL HEADER */}
        <div className="flex items-center justify-between gap-2.5 sm:gap-3 px-3.5 sm:px-6 py-2.5 sm:py-4 border-b border-[#dedfd4] dark:border-[#354237] shrink-0 bg-[#faf8f3]/90 dark:bg-[#151c18]/90">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] flex items-center justify-center shrink-0 border border-[#dedfd4] dark:border-[#354237]">
              <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="pcr-modal-title" className="text-sm sm:text-base lg:text-xl font-bold text-[#293d32] dark:text-[#ecece0] tracking-tight leading-snug break-words">
                Duyệt thay đổi hồ sơ Giáo lý sinh
              </h2>
              <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] font-medium truncate mt-0.5">
                Có <strong className="text-[#293d32] dark:text-[#ecece0] font-mono font-bold">{requests.length}</strong> yêu cầu đang chờ kiểm duyệt
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {requests.length > 1 && (
              <button
                type="button"
                onClick={() => setShowBatchConfirm(true)}
                disabled={actionLoading}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[36px] rounded-xl bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                title="Phê duyệt toàn bộ các yêu cầu thay đổi hồ sơ"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Duyệt tất cả ({requests.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              disabled={actionLoading}
              aria-label="Đóng cửa sổ"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-stone-500/10 hover:bg-stone-500/20 text-[#575e55] dark:text-[#b0b9ac] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* 2. MOBILE TOP REQUEST SWITCHER BAR (Khi có từ 2 yêu cầu trở lên trên Mobile) */}
        {requests.length > 1 && activeRequest && (
          <div className="lg:hidden px-3.5 py-2 bg-[#faf8f3] dark:bg-[#151c18] border-b border-[#dedfd4] dark:border-[#354237] flex items-center justify-between gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSelectPrev}
              disabled={currentIndex === 0 || actionLoading}
              className="p-1.5 rounded-lg bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-[#293d32] dark:text-[#ecece0] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
              title="Yêu cầu trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="min-w-0 text-center flex-1">
              <span className="text-xs font-bold text-[#314e3e] dark:text-[#d6b883] font-mono mr-1">
                [{currentIndex + 1}/{requests.length}]
              </span>
              <span className="text-xs font-bold text-[#293d32] dark:text-[#ecece0] truncate">
                {activeRequest.ten_thanh ? `${activeRequest.ten_thanh} ` : ""}{activeRequest.ho_va_ten || activeRequest.username}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSelectNext}
              disabled={currentIndex === requests.length - 1 || actionLoading}
              className="p-1.5 rounded-lg bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-[#293d32] dark:text-[#ecece0] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
              title="Yêu cầu kế tiếp"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 3. MODAL BODY */}
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-stone-500/10 dark:bg-stone-400/10 flex items-center justify-center text-[#575e55] dark:text-[#b0b9ac] mb-3.5">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[#293d32] dark:text-[#ecece0] mb-1">
              Không có yêu cầu nào chờ duyệt
            </h3>
            <p className="text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac] max-w-sm">
              Tất cả các yêu cầu thay đổi hồ sơ của Giáo lý sinh đã được xử lý xong.
            </p>
          </div>
        ) : (
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* DESKTOP SIDEBAR LIST (Cột trái: Chỉ hiển thị trên Desktop >= 1024px khi có từ 2 yêu cầu trở lên) */}
            {requests.length > 1 && (
              <div 
                data-lenis-prevent
                className="hidden lg:flex flex-col w-72 xl:w-80 border-r border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3]/60 dark:bg-[#151c18]/60 overflow-y-auto overscroll-contain shrink-0 p-3 space-y-1.5"
              >
                <div className="px-2 py-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">
                  <span>Hồ sơ chờ duyệt</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] font-mono">
                    {requests.length}
                  </span>
                </div>

                {requests.map((req, idx) => {
                  const isSelected = req.id === activeRequest?.id;
                  const reqDiffs = getProfileChangesDiff(req.current_data, req.proposed_data);
                  return (
                    <button
                      key={req.id}
                      type="button"
                      onClick={() => setSelectedRequestId(req.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-[#fffefa] dark:bg-[#1e2821] text-[#314e3e] dark:text-[#d6b883] border-[#314e3e] dark:border-[#d6b883] shadow-xs ring-1 ring-[#314e3e]/20 dark:ring-[#d6b883]/20"
                          : "text-[#575e55] dark:text-[#b0b9ac] hover:bg-stone-500/5 border-transparent hover:border-[#dedfd4] dark:border-[#354237]"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-[#dedfd4] dark:border-[#354237] bg-stone-100 dark:bg-stone-800">
                          <img src={req.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="absolute -bottom-1 -right-1 min-w-[16px] min-h-[16px] px-1 flex items-center justify-center bg-[#293d32] dark:bg-[#ecece0] text-white dark:text-[#19251d] text-[10px] font-bold rounded-full font-mono">
                          {idx + 1}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] leading-tight truncate">
                          {req.ten_thanh && <span className="font-semibold text-[#927140] dark:text-[#d4b47d] mr-1">{req.ten_thanh}</span>}
                          {req.ho_va_ten || req.username}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-[#575e55] dark:text-[#b0b9ac] mt-1">
                          <span className="font-medium">Lớp {req.lop}</span>
                          <span>•</span>
                          <span className="text-amber-700 dark:text-amber-400 font-bold font-mono">
                            {reqDiffs.length} mục đổi
                          </span>
                        </div>
                      </div>

                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? "text-[#314e3e] dark:text-[#d6b883] translate-x-0.5" : "opacity-30"}`} />
                    </button>
                  );
                })}
              </div>
            )}

            {/* MAIN REVIEW BOARD (Chi tiết đối chiếu Sổ bộ vs Đề xuất mới) */}
            {activeRequest && (() => {
              const diffs = currentDiffs;
              const curObj = normalizeProfileObject(activeRequest.current_data);
              const propObj = normalizeProfileObject(activeRequest.proposed_data);
              const hasProps = Object.keys(propObj).length > 0;

              return (
                <div className="flex-1 flex flex-col min-h-0 bg-[#fffefa] dark:bg-[#1e2821]">
                  {/* Vùng nội dung cuộn bên trong */}
                  <div 
                    data-lenis-prevent
                    className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-7 space-y-4 sm:space-y-6"
                  >
                    {/* A. THẺ THÔNG TIN GIÁO LÝ SINH (Giao diện phẳng, thoáng đãng, không lồng khung thừa) */}
                    <div className="pb-4 sm:pb-5 border-b border-[#dedfd4]/80 dark:border-[#354237]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full overflow-hidden shrink-0 border border-[#dedfd4] dark:border-[#354237] shadow-2xs bg-stone-100 dark:bg-stone-800">
                          <img src={activeRequest.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base sm:text-lg font-bold text-[#293d32] dark:text-[#ecece0] leading-snug break-words">
                              {activeRequest.ten_thanh && <span className="font-semibold text-[#927140] dark:text-[#d4b47d] mr-1">{activeRequest.ten_thanh}</span>}
                              {activeRequest.ho_va_ten || activeRequest.username}
                            </h3>
                            <span className="px-2 py-0.5 rounded-md bg-[#314e3e]/10 dark:bg-[#d6b883]/20 text-[#314e3e] dark:text-[#d6b883] text-xs font-bold">
                              Lớp {activeRequest.lop}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#575e55] dark:text-[#b0b9ac]">
                            <span>Mã: <code className="font-mono font-bold text-[#293d32] dark:text-[#ecece0]">{activeRequest.username}</code></span>
                            <span className="opacity-40">•</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#927140] dark:text-[#d4b47d]" />
                              <span>{new Date(activeRequest.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ngày {new Date(activeRequest.created_at).toLocaleDateString("vi-VN")}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 self-start sm:self-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          diffs.length > 0 
                            ? "bg-amber-500/15 text-amber-900 dark:text-amber-200" 
                            : "bg-stone-500/10 text-[#575e55] dark:text-[#b0b9ac]"
                        }`}>
                          <FileText className="w-3.5 h-3.5" />
                          <span>{diffs.length > 0 ? `${diffs.length} mục đề xuất` : "0 mục khác biệt"}</span>
                        </span>
                      </div>
                    </div>

                    {/* B. BẢNG SO SÁNH DIFF (Thiết kế phẳng, rõ ràng, không lồng sub-card bên trong) */}
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 pb-0.5">
                        <div className="flex items-center justify-between sm:justify-start gap-2 min-w-0 w-full sm:w-auto">
                          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac] truncate">
                            Nội dung đề xuất thay đổi
                          </h4>
                          {diffs.length > 0 && (
                            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-[#314e3e]/10 dark:bg-[#d6b883]/20 text-[#314e3e] dark:text-[#d6b883] shrink-0 whitespace-nowrap">
                              {selectedFieldKeys.size}/{diffs.length} mục
                            </span>
                          )}
                        </div>

                        {/* Nút thao tác nhanh chọn tất cả / bỏ chọn (Khi có từ 2 mục đề xuất trở lên) */}
                        {diffs.length > 1 && (
                          <div className="flex items-center gap-2 text-xs shrink-0 self-start sm:self-auto">
                            <button
                              type="button"
                              onClick={handleSelectAllFields}
                              disabled={selectedFieldKeys.size === diffs.length}
                              className="px-2.5 py-1 rounded-lg border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] font-bold text-[#314e3e] dark:text-[#d6b883] hover:bg-stone-500/10 disabled:opacity-40 transition-colors cursor-pointer whitespace-nowrap"
                            >
                              Chọn tất cả
                            </button>
                            <button
                              type="button"
                              onClick={handleDeselectAllFields}
                              disabled={selectedFieldKeys.size === 0}
                              className="px-2.5 py-1 rounded-lg border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] font-bold text-[#575e55] dark:text-[#b0b9ac] hover:bg-stone-500/10 disabled:opacity-40 transition-colors cursor-pointer whitespace-nowrap"
                            >
                              Bỏ chọn
                            </button>
                          </div>
                        )}
                      </div>

                      {diffs.length === 0 ? (
                        /* Trường hợp 0 mục khác biệt: Thông báo phẳng, trang nhã */
                        <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 space-y-3">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-left space-y-1">
                              <p className="text-sm sm:text-base font-bold text-amber-900 dark:text-amber-200">
                                Không phát hiện mục nào khác biệt so với Sổ bộ hiện tại
                              </p>
                              <p className="text-xs sm:text-sm text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                                Dữ liệu trong yêu cầu đã trùng khớp hoàn toàn với thông tin đang lưu. Bạn có thể nhấn <strong>"Phê duyệt"</strong> để hoàn tất đóng yêu cầu.
                              </p>
                            </div>
                          </div>

                          {hasProps && (
                            <div className="pt-3 border-t border-amber-500/20">
                              <p className="text-xs font-bold text-[#575e55] dark:text-[#b0b9ac] mb-2 uppercase tracking-wider">
                                Snapshot thông tin Giáo lý sinh gửi lên:
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {Object.entries(propObj).map(([k, val]) => {
                                  const cfg = PROFILE_FIELD_CONFIG[k] || {};
                                  const label = cfg.label || k;
                                  const curVal = curObj[k] ?? curObj[cfg.camelKey];
                                  return (
                                    <div key={k} className="py-1.5 px-2.5 rounded-lg bg-stone-500/5 flex items-center justify-between gap-2">
                                      <span className="font-medium text-[#575e55] dark:text-[#b0b9ac] truncate">{label}:</span>
                                      <span className="font-bold text-[#293d32] dark:text-[#ecece0] text-right truncate">
                                        {formatFieldValue(val, cfg.type || "text")}
                                        {curVal === val && <span className="ml-1 text-xs text-emerald-700 dark:text-emerald-400 font-normal">(Trùng khớp)</span>}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Danh sách các thẻ Diff Phẳng, trực quan (Không lồng khung card con bên trong) */
                        <div className="space-y-3">
                          {diffs.map((diff) => {
                            const IconComp = FIELD_ICONS[diff.key] || User;
                            const isAvatar = diff.key === "avatar" || diff.type === "image";
                            const isFieldSelected = selectedFieldKeys.has(diff.key);

                            return (
                              <div 
                                key={diff.key} 
                                className={`rounded-2xl border bg-[#fffefa] dark:bg-[#1e2821] p-3.5 sm:p-4.5 shadow-2xs transition-all ${
                                  isFieldSelected
                                    ? "border-[#314e3e]/30 dark:border-[#d6b883]/30 ring-1 ring-[#314e3e]/5 dark:ring-[#d6b883]/5"
                                    : "border-[#dedfd4] dark:border-[#354237] opacity-60 hover:opacity-100 bg-[#faf8f3]/50 dark:bg-[#151c18]/50"
                                }`}
                              >
                                {/* Header Mục: Icon + Tên trường + Nút Checkbox Duyệt */}
                                <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#dedfd4]/60 dark:border-[#354237]/60">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-6 h-6 rounded-lg bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] flex items-center justify-center shrink-0">
                                      <IconComp className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] truncate">
                                      {diff.label}
                                    </span>
                                  </div>

                                  {/* Toggle Chip */}
                                  <button
                                    type="button"
                                    onClick={() => toggleFieldSelection(diff.key)}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border shrink-0 ${
                                      isFieldSelected
                                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/25"
                                        : "bg-stone-500/10 border-stone-300 dark:border-stone-700 text-[#575e55] dark:text-[#b0b9ac] hover:bg-stone-500/20"
                                    }`}
                                    title={isFieldSelected ? "Nhấn để bỏ chọn (không duyệt mục này)" : "Nhấn để chọn duyệt mục này"}
                                  >
                                    {isFieldSelected ? (
                                      <>
                                        <CheckSquare className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                                        <span>Duyệt mục này</span>
                                      </>
                                    ) : (
                                      <>
                                        <Square className="w-3.5 h-3.5 text-stone-400" />
                                        <span>Giữ nguyên cũ</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                {/* Thông báo nếu mục này đang bị bỏ chọn */}
                                {!isFieldSelected && (
                                  <div className="mb-2.5 px-2.5 py-1 rounded-md bg-stone-500/10 text-xs font-medium text-[#575e55] dark:text-[#b0b9ac] flex items-center gap-1.5">
                                    <span>⚠️ Giữ nguyên thông tin trong Sổ bộ hiện tại (bỏ qua mục này).</span>
                                  </div>
                                )}

                                {/* Thân so sánh Phẳng (Không lồng khung card con) */}
                                {isAvatar ? (
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 py-1">
                                    {/* Ảnh sổ bộ hiện tại */}
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-12 h-12 rounded-full overflow-hidden border border-[#dedfd4] dark:border-[#354237] shrink-0 bg-stone-100 dark:bg-stone-800">
                                        <img src={diff.oldValue || "/images/avatarDefault.avif"} alt="Ảnh hiện tại" className="w-full h-full object-cover" />
                                      </div>
                                      <div className="min-w-0">
                                        <span className="text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac] block">
                                          Sổ bộ hiện tại
                                        </span>
                                        <span className="text-xs text-[#575e55] dark:text-[#b0b9ac]">
                                          {diff.oldValue ? "Ảnh đang lưu" : "Ảnh mặc định"}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Mũi tên chuyển đổi */}
                                    <div className="hidden sm:flex items-center justify-center text-[#927140] dark:text-[#d4b47d]">
                                      <ChevronRight className="w-5 h-5 opacity-60" />
                                    </div>

                                    {/* Ảnh mới đề xuất */}
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className={`w-12 h-12 rounded-full overflow-hidden shrink-0 bg-stone-100 ${
                                        isFieldSelected
                                          ? "border-2 border-[#314e3e] dark:border-[#d6b883] ring-2 ring-[#314e3e]/20 dark:ring-[#d6b883]/20"
                                          : "border border-stone-300 dark:border-stone-700 opacity-60"
                                      }`}>
                                        <img src={diff.newValue || "/images/avatarDefault.avif"} alt="Ảnh mới" className="w-full h-full object-cover" />
                                      </div>
                                      <div className="min-w-0">
                                        <span className="text-xs font-bold uppercase tracking-wider text-[#314e3e] dark:text-[#d6b883] inline-flex items-center gap-1">
                                          <Sparkles className="w-3 h-3" />
                                          <span>Ảnh mới đề xuất</span>
                                        </span>
                                        <span className="text-xs font-bold text-[#293d32] dark:text-[#ecece0] block">
                                          {isFieldSelected ? "Sẵn sàng cập nhật" : "Bỏ qua thay đổi ảnh"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 py-0.5">
                                    {/* Cột 1: Sổ bộ hiện tại (Phẳng, không lồng card) */}
                                    <div className="min-w-0">
                                      <span className="text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac] block mb-1">
                                        Sổ bộ hiện tại:
                                      </span>
                                      <div className="text-xs sm:text-sm font-medium text-[#575e55] dark:text-[#b0b9ac] break-words">
                                        {diff.oldDisplay || "—"}
                                      </div>
                                    </div>

                                    {/* Cột 2: Đề xuất đổi thành (Phẳng, phân cách bằng border-l nhẹ) */}
                                    <div className="min-w-0 sm:border-l sm:border-[#dedfd4]/60 sm:dark:border-[#354237]/60 sm:pl-6">
                                      <span className="text-xs font-bold uppercase tracking-wider text-[#314e3e] dark:text-[#d6b883] flex items-center gap-1 mb-1">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>Đề xuất đổi thành:</span>
                                      </span>
                                      <div className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] break-words">
                                        {diff.newDisplay || "—"}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* C. STICKY FOOTER ACTION BAR (Ghim cố định ở đáy, nằm trọn trong Thumb Zone, layout chống tràn hoàn hảo) */}
                  <div className="sticky bottom-0 z-20 px-4 sm:px-6 py-3 bg-[#faf8f3] dark:bg-[#151c18] border-t border-[#dedfd4] dark:border-[#354237] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                    {/* Đoạn text mô tả trên desktop: Tự co giãn (min-w-0 flex-1 truncate), không đẩy hay che nút */}
                    <div className="min-w-0 flex-1 truncate text-xs text-[#575e55] dark:text-[#b0b9ac] hidden md:flex items-center gap-1.5 pr-2">
                      <CheckCircle2 className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883] shrink-0" />
                      <span className="truncate">
                        {diffs.length === 0
                          ? "Dữ liệu trùng khớp, nhấn Phê duyệt để hoàn tất."
                          : selectedFieldKeys.size === diffs.length
                          ? "Dữ liệu sẽ được cập nhật ngay vào Sổ bộ Giáo xứ sau khi phê duyệt."
                          : selectedFieldKeys.size > 0
                          ? `Đang chọn phê duyệt ${selectedFieldKeys.size}/${diffs.length} mục đề xuất thay đổi.`
                          : "Chưa chọn mục nào. Hãy chọn ít nhất 1 mục hoặc bấm Từ chối."}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
                      {/* Nút Từ chối */}
                      <button
                        type="button"
                        onClick={() => {
                          setRejectNote("");
                          setShowRejectDialog(true);
                        }}
                        disabled={actionLoading}
                        className="flex-1 sm:flex-none px-4 py-2.5 min-h-[44px] rounded-xl border border-red-300 dark:border-red-900/60 text-red-700 dark:text-red-400 bg-red-500/10 hover:bg-red-500/15 active:scale-95 text-xs sm:text-sm font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        <span>Từ chối</span>
                      </button>

                      {/* Nút Phê duyệt */}
                      <button
                        type="button"
                        onClick={() => handleApprove(activeRequest.id)}
                        disabled={actionLoading || (diffs.length > 0 && selectedFieldKeys.size === 0)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl bg-[#314e3e] hover:bg-[#263e32] dark:bg-[#d6b883] dark:hover:bg-[#c9a76d] text-white dark:text-[#19251d] text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {actionLoading ? (
                          <span className="w-4 h-4 border-2 border-white dark:border-[#19251d] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span>
                          {diffs.length > 0 && selectedFieldKeys.size === 0
                            ? "Chưa chọn mục nào"
                            : "Phê duyệt"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </Motion.div>

      {/* 4. MODAL RIÊNG BIỆT: NHẬP LÝ DO TỪ CHỐI (Dedicated Rejection Dialog) */}
      <AnimatePresence>
        {showRejectDialog && activeRequest && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-3.5 sm:p-5">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => !actionLoading && setShowRejectDialog(false)}
            />

            <Motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: APPLE_EASE }}
              role="dialog"
              aria-modal="true"
              className="relative w-full max-w-lg rounded-3xl border border-red-500/30 bg-[#fffefa] dark:bg-[#1e2821] shadow-2xl p-5 sm:p-6 space-y-4 text-[#293d32] dark:text-[#ecece0] z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#dedfd4] dark:border-[#354237]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-700 dark:text-red-400 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#293d32] dark:text-[#ecece0]">
                      Từ chối yêu cầu thay đổi hồ sơ
                    </h3>
                    <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] mt-0.5">
                      Giáo lý sinh: <strong>{activeRequest.ten_thanh ? `${activeRequest.ten_thanh} ` : ""}{activeRequest.ho_va_ten || activeRequest.username}</strong>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRejectDialog(false)}
                  disabled={actionLoading}
                  className="p-1 rounded-lg hover:bg-stone-500/10 text-[#575e55] dark:text-[#b0b9ac] cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Textarea nhập lý do */}
              <div className="space-y-2">
                <label htmlFor="reject-note-input" className="block text-xs font-bold text-[#575e55] dark:text-[#b0b9ac]">
                  Lý do từ chối (gửi phản hồi cho Giáo lý sinh &amp; Phụ huynh):
                </label>
                <textarea
                  id="reject-note-input"
                  rows={3}
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Ví dụ: Ngày sinh chưa khớp với Giấy Khai sinh/Sổ Rửa Tội, phụ huynh vui lòng chụp gửi bản chính để xác minh..."
                  className="w-full text-xs sm:text-sm rounded-xl border border-red-300 dark:border-red-900/50 bg-[#faf8f3] dark:bg-[#151c18] p-3 text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/50 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
                />
              </div>

              {/* Gợi ý lý do nhanh 1 chạm */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac]">Gợi ý lý do mẫu:</span>
                <div className="flex flex-wrap gap-1.5">
                  {REJECT_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectNote(preset)}
                      className="px-2.5 py-1 rounded-lg bg-[#faf8f3] dark:bg-[#151c18] border border-red-200 dark:border-red-900/40 text-stone-700 dark:text-stone-300 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs transition-colors cursor-pointer text-left"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#dedfd4] dark:border-[#354237]">
                <button
                  type="button"
                  onClick={() => setShowRejectDialog(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 min-h-[40px] rounded-xl text-xs sm:text-sm font-bold bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-[#293d32] dark:text-[#ecece0] hover:bg-stone-500/10 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleRejectConfirm}
                  disabled={actionLoading}
                  className="px-5 py-2 min-h-[40px] rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {actionLoading ? "Đang gửi..." : "Xác nhận gửi từ chối"}
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. MODAL XÁC NHẬN DUYỆT TẤT CẢ */}
      <ConfirmDialog
        open={showBatchConfirm}
        title="Xác nhận duyệt tất cả yêu cầu?"
        message={`Bạn có chắc chắn muốn phê duyệt đồng loạt toàn bộ ${requests.length} yêu cầu thay đổi hồ sơ? Dữ liệu của tất cả Giáo lý sinh sẽ được cập nhật trực tiếp vào Sổ bộ Giáo xứ.`}
        confirmLabel="Phê duyệt tất cả"
        onConfirm={handleBatchApprove}
        onCancel={() => setShowBatchConfirm(false)}
      />
    </div>
  );
}


