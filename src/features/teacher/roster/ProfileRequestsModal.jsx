import React, { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { 
  X, AlertCircle, Clock, UserCheck, 
  MessageSquare, ChevronRight, Inbox,
  Sparkles, User, Cross, Users, Calendar, Phone, MapPin, 
  Droplets, Feather, Church, FileText, CheckCircle2,
  CheckCheck, Image as ImageIcon
} from "lucide-react";
import { pressable } from "../../../components/ui/variant.jsx";
import { useToast } from "../../../components/ui/ToastContext.jsx";
import { ConfirmDialog } from "../../../components/ui/StudentShared.jsx";
import { getProfileChangesDiff, normalizeProfileObject, PROFILE_FIELD_CONFIG, formatFieldValue } from "../../account/utils.js";
import { approveProfileRequest, rejectProfileRequest } from "../api.js";

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

export default function ProfileRequestsModal({
  open,
  onClose,
  requests = [],
  onSuccess,
}) {
  const { showToast } = useToast();
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectNote, setRejectNote] = useState("");
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);

  const activeRequest = (requests || []).find((r) => r.id === (selectedRequestId || requests[0]?.id)) || requests[0] || null;

  // Lắng nghe phím Escape để đóng modal
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !actionLoading) {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, actionLoading, onClose]);

  const handleApprove = async (reqId) => {
    setActionLoading(true);
    try {
      await approveProfileRequest(reqId);
      showToast("Đã phê duyệt và cập nhật thông tin học sinh vào sổ bộ!", "success");
      onSuccess?.();
      if (requests.length <= 1) {
        onClose?.();
      }
    } catch (err) {
      console.error("Approve error:", err);
      showToast(err.message || "Không thể phê duyệt yêu cầu", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBatchApprove = async () => {
    setActionLoading(true);
    try {
      let count = 0;
      for (const req of requests) {
        await approveProfileRequest(req.id);
        count++;
      }
      showToast(`Đã phê duyệt thành công toàn bộ ${count} yêu cầu!`, "success");
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

  const handleReject = async (reqId) => {
    setActionLoading(true);
    try {
      await rejectProfileRequest(reqId, rejectNote);
      showToast("Đã từ chối yêu cầu thay đổi hồ sơ", "info");
      setRejectingId(null);
      setRejectNote("");
      onSuccess?.();
      if (requests.length <= 1) {
        onClose?.();
      }
    } catch (err) {
      console.error("Reject error:", err);
      showToast(err.message || "Không thể từ chối yêu cầu", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6">
      {/* Backdrop */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={() => !actionLoading && onClose?.()}
      />

      {/* Modal Card */}
      <Motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pcr-modal-title"
        className="relative w-full max-w-[96vw] lg:max-w-5xl max-h-[92vh] bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl sm:rounded-3xl border border-[#dedfd4] dark:border-[#354237] shadow-2xl flex flex-col z-10 overflow-hidden mx-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-7 py-3 sm:py-5 border-b border-[#dedfd4] dark:border-[#354237] shrink-0 bg-[#faf8f3]/90 dark:bg-[#151c18]/90">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#314e3e]/10 dark:bg-[#d4b47d]/15 text-[#314e3e] dark:text-[#d4b47d] flex items-center justify-center shrink-0 border border-[#dedfd4] dark:border-[#354237]">
              <UserCheck className="w-4.5 h-4.5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 id="pcr-modal-title" className="text-sm sm:text-lg lg:text-xl font-bold text-[#293d32] dark:text-[#ecece0] font-serif truncate">
                Duyệt thay đổi hồ sơ học sinh
              </h2>
              <p className="text-[11px] sm:text-xs text-[#454f46] dark:text-[#b8c2b4] font-medium truncate">
                Có <strong className="text-[#293d32] dark:text-[#ecece0]">{requests.length}</strong> yêu cầu đang chờ kiểm duyệt
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {requests.length > 1 && (
              <button
                type="button"
                onClick={() => setShowBatchConfirm(true)}
                disabled={actionLoading}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Duyệt tất cả ({requests.length})</span>
                <span className="sm:hidden">Duyệt hết</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              disabled={actionLoading}
              aria-label="Đóng cửa sổ"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-stone-500/10 hover:bg-stone-500/20 text-[#454f46] dark:text-[#b8c2b4] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>


        {/* Modal Body */}
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-stone-500/10 dark:bg-stone-400/10 flex items-center justify-center text-[#454f46] dark:text-[#b8c2b4] mb-3.5">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-[16px] font-bold text-[#293d32] dark:text-[#ecece0] mb-1">
              Không có yêu cầu nào chờ duyệt
            </h3>
            <p className="text-[13.5px] text-[#454f46] dark:text-[#b8c2b4] max-w-sm">
              Tất cả các yêu cầu thay đổi hồ sơ của học sinh đã được xử lý xong.
            </p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
            {/* Cột trái: Danh sách học sinh gửi yêu cầu (Nếu có từ 2 học sinh trở lên) */}
            {requests.length > 1 && (
              <div 
                data-lenis-prevent
                className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-[#dedfd4] dark:border-[#354237] p-3 overflow-y-auto overscroll-contain touch-pan-y shrink-0 space-y-2 max-h-44 lg:max-h-none bg-stone-50/50 dark:bg-[#151c18]/50"
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4] px-2 pt-1 pb-1">
                  Danh sách chờ duyệt ({requests.length})
                </p>
                {requests.map((req) => {
                  const isSelected = req.id === activeRequest?.id;
                  const reqDiffs = getProfileChangesDiff(req.current_data, req.proposed_data);
                  return (
                    <button
                      key={req.id}
                      type="button"
                      onClick={() => { setSelectedRequestId(req.id); setRejectingId(null); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#314e3e]/10 dark:bg-[#d4b47d]/20 text-[#314e3e] dark:text-[#d4b47d] border border-[#314e3e]/30 dark:border-[#d4b47d]/40 shadow-xs"
                          : "text-[#454f46] dark:text-[#b8c2b4] hover:bg-stone-500/10 dark:hover:bg-stone-400/10 border border-transparent"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-stone-200 dark:border-stone-700 shadow-2xs">
                        <img src={req.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13.5px] font-bold text-[#293d32] dark:text-[#ecece0] leading-snug break-words">
                          {req.ten_thanh && <span className="font-serif font-semibold text-[#927140] dark:text-[#d4b47d] mr-1">{req.ten_thanh}</span>}
                          {req.ho_va_ten || req.username}
                        </p>
                        <div className="flex items-center gap-2 text-[11.5px] text-[#454f46] dark:text-[#b8c2b4] mt-0.5">
                          <span className="font-semibold">Lớp {req.lop}</span>
                          <span>•</span>
                          <span className="text-amber-800 dark:text-amber-300 font-bold">{reqDiffs.length} mục đổi</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-40 shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Cột phải: Chi tiết Diff to, rõ ràng của yêu cầu đang chọn */}
            {activeRequest && (() => {
              const diffs = getProfileChangesDiff(activeRequest.current_data, activeRequest.proposed_data);
              const curObj = normalizeProfileObject(activeRequest.current_data);
              const propObj = normalizeProfileObject(activeRequest.proposed_data);
              const hasProps = Object.keys(propObj).length > 0;

              return (
                <div 
                  data-lenis-prevent
                  className="flex-1 p-5 sm:p-7 md:p-8 overflow-y-auto overscroll-contain touch-pan-y space-y-6"
                >
                  {/* Info Header của Học sinh */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237]">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border-2 border-[#314e3e]/30 dark:border-[#d4b47d]/40 shadow-sm">
                        <img src={activeRequest.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-[17px] sm:text-[19px] font-bold text-[#293d32] dark:text-[#ecece0]">
                            {activeRequest.ten_thanh ? `${activeRequest.ten_thanh} ` : ""}{activeRequest.ho_va_ten || activeRequest.username}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-lg bg-[#314e3e]/10 dark:bg-[#d4b47d]/20 text-[#314e3e] dark:text-[#d4b47d] text-[12px] font-bold">
                            Lớp {activeRequest.lop}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[12.5px] text-[#454f46] dark:text-[#b8c2b4] font-medium">
                          <span>Tài khoản: <code className="px-1.5 py-0.5 rounded bg-stone-200/60 dark:bg-stone-800 text-[12px] font-mono">{activeRequest.username}</code></span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            Gửi lúc {new Date(activeRequest.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ngày {new Date(activeRequest.created_at).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 self-start sm:self-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12.5px] font-bold shadow-2xs ${
                        diffs.length > 0 
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-900 dark:text-amber-200" 
                          : "bg-stone-500/10 border-stone-500/20 text-[#454f46] dark:text-[#b8c2b4]"
                      }`}>
                        <FileText className="w-3.5 h-3.5" />
                        {diffs.length > 0 ? `${diffs.length} thông tin đề xuất thay đổi` : "0 mục khác biệt"}
                      </span>
                    </div>
                  </div>

                  {/* Danh sách các thẻ Diff To & Rõ ràng */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[13px] font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4] flex items-center gap-2">
                        <span>Chi tiết đối chiếu Sổ bộ vs Đề xuất mới</span>
                      </h4>
                    </div>

                    {diffs.length === 0 ? (
                      <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 space-y-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <div className="text-left space-y-1">
                            <p className="text-[14px] font-bold text-amber-900 dark:text-amber-200">
                              Không phát hiện mục nào khác biệt so với sổ bộ hiện tại
                            </p>
                            <p className="text-[13px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                              Tất cả thông tin trong yêu cầu trùng khớp với hồ sơ đang lưu trong sổ bộ giáo xứ (có thể học sinh đã gửi yêu cầu khi chưa thay đổi mục nào, hoặc thông tin đã được cập nhật trước đó). Bạn có thể duyệt để hoàn tất đóng yêu cầu này hoặc từ chối.
                            </p>
                          </div>
                        </div>

                        {/* Bảng đối chiếu snapshot toàn bộ nếu có dữ liệu gửi lên */}
                        {hasProps && (
                          <div className="pt-2 border-t border-amber-500/20">
                            <p className="text-xs font-bold text-[#454f46] dark:text-[#b8c2b4] mb-2 uppercase tracking-wider">
                              Dữ liệu học sinh gửi lên:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {Object.entries(propObj).map(([k, val]) => {
                                const cfg = PROFILE_FIELD_CONFIG[k] || {};
                                const label = cfg.label || k;
                                const curVal = curObj[k] ?? curObj[cfg.camelKey];
                                return (
                                  <div key={k} className="p-2.5 rounded-lg bg-white dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] flex justify-between gap-2">
                                    <span className="font-medium text-[#454f46] dark:text-[#b8c2b4]">{label}:</span>
                                    <span className="font-bold text-[#293d32] dark:text-[#ecece0] text-right truncate">
                                      {formatFieldValue(val, cfg.type || "text")}
                                      {curVal === val && <span className="ml-1 text-[10px] text-emerald-600 font-normal">(Trùng khớp)</span>}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {diffs.map((diff) => {
                          const IconComp = FIELD_ICONS[diff.key] || User;
                          return (
                            <div 
                              key={diff.key} 
                              className="rounded-2xl border border-[#dedfd4] dark:border-[#354237] bg-white dark:bg-[#1e2821] p-4 sm:p-5 shadow-xs transition-all hover:border-[#314e3e]/30 dark:hover:border-[#d4b47d]/40"
                            >
                              {/* Tên trường */}
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-lg bg-[#314e3e]/10 dark:bg-[#d4b47d]/15 text-[#314e3e] dark:text-[#d4b47d] flex items-center justify-center shrink-0">
                                  <IconComp className="w-4 h-4" />
                                </div>
                                <span className="text-[14.5px] font-bold text-[#293d32] dark:text-[#ecece0]">
                                  {diff.label}
                                </span>
                              </div>

                              {/* Bố cục 2 cột so sánh */}
                              {diff.key === "avatar" || diff.type === "image" ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-stretch">
                                  {/* Cột Ảnh hiện tại */}
                                  <div className="p-3.5 sm:p-4 rounded-xl bg-stone-100/90 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-stone-300 dark:border-stone-600 shrink-0 bg-stone-200">
                                      <img src={diff.oldValue || "/images/avatarDefault.avif"} alt="Ảnh hiện tại" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                                        Ảnh sổ bộ hiện tại
                                      </span>
                                      <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                                        {diff.oldValue ? "Ảnh đã lưu" : "Ảnh mặc định"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Cột Ảnh mới đề xuất */}
                                  <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border-2 border-emerald-500/40 dark:border-emerald-500/60 flex items-center gap-4 shadow-2xs">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500 shrink-0 bg-stone-100 ring-2 ring-emerald-500/20">
                                      <img src={diff.newValue || "/images/avatarDefault.avif"} alt="Ảnh mới" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block mb-1">
                                        Ảnh học sinh tải lên mới
                                      </span>
                                      <span className="text-xs text-emerald-950 dark:text-emerald-100 font-bold">
                                        Ảnh mới sẵn sàng cập nhật
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-stretch">
                                  {/* Cột Dữ liệu hiện tại */}
                                  <div className="p-3.5 sm:p-4 rounded-xl bg-stone-100/90 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 flex flex-col justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5 flex items-center gap-1">
                                      <span>Sổ bộ hiện tại:</span>
                                    </span>
                                    <p className="text-[14.5px] text-stone-600 dark:text-stone-400 font-medium break-words leading-relaxed line-through decoration-stone-400 dark:decoration-stone-500">
                                      {diff.oldDisplay}
                                    </p>
                                  </div>

                                  {/* Cột Học sinh đề xuất */}
                                  <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border-2 border-emerald-500/40 dark:border-emerald-500/60 flex flex-col justify-between shadow-2xs">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-1.5 flex items-center gap-1.5">
                                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                      <span>Học sinh xin đổi thành:</span>
                                    </span>
                                    <p className="text-[15.5px] text-emerald-950 dark:text-emerald-100 font-extrabold break-words leading-relaxed">
                                      {diff.newDisplay}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Form Từ chối (Nếu bấm nút từ chối) */}
                  <AnimatePresence>
                    {rejectingId === activeRequest.id && (
                      <Motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 sm:p-5 rounded-2xl bg-red-500/10 border-2 border-red-500/30 space-y-3.5">
                          <div className="flex items-center justify-between">
                            <p className="text-[14px] font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Lý do từ chối yêu cầu (gửi thông báo đến học sinh)
                            </p>
                            <button
                              type="button"
                              onClick={() => setRejectingId(null)}
                              className="text-[12.5px] font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
                            >
                              Hủy bỏ
                            </button>
                          </div>

                          <textarea
                            rows={3}
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                            placeholder="Ví dụ: Ngày sinh chưa khớp với giấy khai sinh/sổ Rửa tội, phụ huynh vui lòng gửi lại hình chụp bản chính để xác minh..."
                            className="w-full text-[13.5px] rounded-xl border border-red-300 dark:border-red-900/50 bg-white dark:bg-[#151c18] p-3 text-[#293d32] dark:text-[#ecece0] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                          />

                          {/* Gợi ý lý do nhanh */}
                          <div className="flex flex-wrap gap-1.5 text-[11.5px]">
                            <span className="text-stone-500 self-center font-medium">Gợi ý nhanh:</span>
                            {[
                              "Cần bổ sung giấy chứng nhận Rửa tội bản photo",
                              "Thông tin ngày sinh chưa khớp giấy tờ",
                              "Số điện thoại phụ huynh chưa đúng",
                            ].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setRejectNote(preset)}
                                className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-red-200 dark:border-red-900/40 text-stone-700 dark:text-stone-300 hover:bg-red-50 dark:hover:bg-red-950/40 text-[11.5px] transition-colors cursor-pointer"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => handleReject(activeRequest.id)}
                              disabled={actionLoading}
                              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-[13.5px] shadow-xs active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                            >
                              {actionLoading ? "Đang xử lý..." : "Xác nhận gửi từ chối"}
                            </button>
                          </div>
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons (Footer bar) */}
                  {rejectingId !== activeRequest.id && (
                    <div className="pt-4 border-t border-[#dedfd4] dark:border-[#354237] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <p className="text-[12.5px] text-[#454f46] dark:text-[#b8c2b4] font-medium">
                        Khi phê duyệt, dữ liệu sẽ được cập nhật ngay vào cơ sở dữ liệu sổ bộ giáo xứ.
                      </p>

                      <div className="flex items-center justify-end gap-3 shrink-0">
                        <Motion.button
                          {...pressable()}
                          type="button"
                          onClick={() => { setRejectingId(activeRequest.id); setRejectNote(""); }}
                          disabled={actionLoading}
                          className="px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-[13.5px] font-bold hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <X className="w-4 h-4 inline-block mr-1.5" />
                          Từ chối
                        </Motion.button>

                        <Motion.button
                          {...pressable()}
                          type="button"
                          onClick={() => handleApprove(activeRequest.id)}
                          disabled={actionLoading}
                          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] text-[14px] font-bold shadow-md hover:opacity-95 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {actionLoading ? (
                            <span className="w-4 h-4 border-2 border-white dark:border-[#19251d] border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          <span>{diffs.length === 0 ? "Duyệt & Đóng yêu cầu" : "Phê duyệt & Cập nhật"}</span>
                        </Motion.button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </Motion.div>

      {/* Confirmation modal cho Duyệt tất cả */}
      <ConfirmDialog
        open={showBatchConfirm}
        title="Xác nhận duyệt tất cả yêu cầu?"
        message={`Bạn có chắc chắn muốn phê duyệt đồng loạt ${requests.length} yêu cầu thay đổi hồ sơ? Dữ liệu của tất cả học sinh sẽ được cập nhật ngay vào sổ bộ.`}
        confirmLabel="Phê duyệt tất cả"
        onConfirm={handleBatchApprove}
        onCancel={() => setShowBatchConfirm(false)}
      />
    </div>
  );
}

