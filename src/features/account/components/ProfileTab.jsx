/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { 
  User, Cross, Calendar, Users, Droplets, Sparkles, Feather, 
  Phone, MapPin, Mail, KeyRound, LogOut, ShieldCheck, 
  ClipboardList, Church, HeartHandshake, Save, RotateCcw,
  Clock, AlertCircle, Send, X, ArrowRight, Trash2
} from "lucide-react";
import { pressable } from "../../../components/ui/variant.jsx";
import { useToast } from "../../../components/ui/ToastContext.jsx";
import { transferDateForView, isPastOrToday, isValidVNPhone, isDefaultAvatarUrl, getDefaultAvatarByGender, safeParse, safeStore, denormalizeStudent, getProfileChangesDiff } from "../utils.js";
import { supabase } from "../../../lib/supabase.js";
import { ChangePassword } from "./ChangePassword.jsx";
import { UpdateEmail } from "./UpdateEmail.jsx";
import { FieldRow, ProfileSkeleton } from "./ProfileFields.jsx";

const DATE_FIELDS = ["ngaySinh", "ngayRuaToi", "ngayRuocLe", "ngayThemSuc"];

export function ProfileTab({ handleLogout, user, setUser, setIsAnyChange, isAnyChange }) {
  const { showToast } = useToast();
  const [editingField, setEditingField] = useState(null);
  const [tempValue,    setTempValue]    = useState("");
  const [isSaving,     setIsSaving]     = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isOpenChangePass, setIsOpenChangePass] = useState(false);
  const [isOpenUpdateEmail, setIsOpenUpdateEmail] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [loadingPending, setLoadingPending] = useState(false);

  const isStaff = user.role === "admin" || user.role === "teacher";
  const isStudent = !isStaff;
  const isLocked = !isStaff && Boolean(user.is_profile_locked || user.isProfileLocked);

  const fetchPendingRequest = useCallback(async () => {
    if (!isStudent || !user.username) return;
    setLoadingPending(true);
    try {
      const { data, error } = await supabase.rpc("get_my_pending_profile_request");
      if (error) {
        console.error("fetchPendingRequest error:", error);
      } else {
        setPendingRequest(data ?? null);
      }
    } catch (err) {
      console.error("fetchPendingRequest exception:", err);
    } finally {
      setLoadingPending(false);
    }
  }, [isStudent, user.username]);

  useEffect(() => {
    if (isStudent && user.username) {
      fetchPendingRequest();
    }
  }, [fetchPendingRequest, isStudent, user.username]);

  const editField = (field) => (e) => { 
    if (isLocked) return;
    e.preventDefault(); 
    setEditingField(field); 
    setTempValue(user[field] ?? ""); 
  };
  const cancelEdit = () => { setEditingField(null); setTempValue(""); };

  const handleSave = async () => {
    if (!user.username) return;
    if (isLocked) {
      showToast("Hồ sơ học sinh đã bị khóa chỉnh sửa", "warning");
      return;
    }

    // Nếu là học sinh: mở modal xác nhận gửi yêu cầu phê duyệt
    if (isStudent) {
      const diffs = getProfileChangesDiff(safeParse("user", {}) || {}, user);
      if (diffs.length === 0) {
        showToast("Không có thông tin nào thay đổi", "info");
        setIsAnyChange(false);
        return;
      }
      setIsOpenConfirmModal(true);
      return;
    }

    // Nếu là staff (admin/teacher): lưu trực tiếp
    setIsSaving(true);
    try {
      const payload = denormalizeStudent(user);
      const { error } = await supabase.from("users").update(payload).eq("username", user.username);
      if (error) throw error;
      safeStore("user", JSON.stringify(user));
      setIsAnyChange(false);
      showToast("Đã lưu thông tin!", "success");
    } catch (err) {
      showToast(err.message || "Lỗi khi lưu thông tin", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmSubmitRequest = async () => {
    if (isLocked) {
      showToast("Hồ sơ học sinh đã bị khóa chỉnh sửa", "warning");
      return;
    }
    setIsSaving(true);
    try {
      const diffs = getProfileChangesDiff(safeParse("user", {}) || {}, user);
      if (diffs.length === 0) {
        setIsOpenConfirmModal(false);
        setIsAnyChange(false);
        return;
      }

      // Chỉ gửi các trường thực sự được thay đổi lên backend
      const changedPayload = {};
      diffs.forEach((d) => {
        changedPayload[d.key] = d.newValue;
      });

      const { data, error } = await supabase.rpc("create_profile_change_request", { p_changes: changedPayload });
      if (error) throw error;
      
      setIsAnyChange(false);
      setIsOpenConfirmModal(false);
      showToast(data?.message || "Đã gửi yêu cầu thay đổi hồ sơ!", "success");
      await fetchPendingRequest();
    } catch (err) {
      showToast(err.message || "Không thể gửi yêu cầu thay đổi", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!pendingRequest?.id) return;
    setIsCancelling(true);
    try {
      const { error } = await supabase.rpc("cancel_profile_change_request", { p_request_id: pendingRequest.id });
      if (error) throw error;
      showToast("Đã hủy yêu cầu thay đổi hồ sơ", "info");
      setPendingRequest(null);
    } catch (err) {
      showToast(err.message || "Không thể hủy yêu cầu", "error");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDiscard = () => {
    const savedData = safeParse("user", null);
    if (savedData) setUser(savedData);
    setIsAnyChange(false);
  };

  const handleBlur = (field) => {
    if (isLocked) return;
    if (field === "sdt" && !isValidVNPhone(tempValue)) { showToast("Số điện thoại chưa đúng định dạng", "warning"); cancelEdit(); return; }
    if (DATE_FIELDS.includes(field) && !isPastOrToday(tempValue)) { showToast("Ngày không được ở trong tương lai", "warning"); cancelEdit(); return; }
    if (tempValue !== user[field]) setIsAnyChange(true);
    setUser((prev) => {
      const next = { ...prev, [field]: tempValue };
      if (field === "gioiTinh" && isDefaultAvatarUrl(prev.avatar)) next.avatar = getDefaultAvatarByGender(tempValue);
      return next;
    });
    setEditingField(null); setTempValue("");
  };

  const basicFields = [
    { icon: User, label: "Họ và tên", field: "hoTen" },
    { icon: Cross, label: "Tên Thánh", field: "tenThanh" },
    { icon: Calendar, label: "Ngày sinh", field: "ngaySinh", type: "date", displayValue: transferDateForView(user.ngaySinh) },
    { icon: Users, label: "Giới tính", field: "gioiTinh", options: ["Nam", "Nữ"] },
  ];

  const sacrementFields = !isStaff ? [
    { icon: Droplets, label: "Ngày Rửa Tội", field: "ngayRuaToi", type: "date", displayValue: transferDateForView(user.ngayRuaToi) },
    { icon: Sparkles, label: "Ngày Rước Lễ", field: "ngayRuocLe", type: "date", displayValue: transferDateForView(user.ngayRuocLe) },
    { icon: Feather, label: "Ngày Thêm Sức", field: "ngayThemSuc", type: "date", displayValue: transferDateForView(user.ngayThemSuc) },
  ] : [];

  const contactFields = [
    { icon: Phone, label: "Số điện thoại", field: "sdt" },
    { icon: MapPin, label: "Giáo Xóm", field: "giaoXom" },
    ...(!isStaff ? [
      { icon: User, label: "Họ & Tên Cha", field: "tenCha" },
      { icon: User, label: "Họ & Tên Mẹ", field: "tenMe" },
    ] : []),
  ];

  const renderSection = (title, IconComponent, fields) => {
    if (!fields || fields.length === 0) return null;
    return (
      <div className="mb-7">
        <h3 className="text-[13px] font-bold text-[#293d32] dark:text-[#ecece0] uppercase tracking-wider mb-3 flex items-center gap-2">
          <IconComponent className="w-4 h-4 text-[#314e3e] dark:text-[#d4b47d]" strokeWidth={2.2} />
          <span>{title}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fields.map((r) => (
            <FieldRow 
              key={r.field} 
              icon={r.icon} 
              label={r.label} 
              field={r.field} 
              value={user[r.field]} 
              displayValue={r.displayValue} 
              type={r.type} 
              options={r.options} 
              editingField={editingField} 
              tempValue={tempValue} 
              setTempValue={setTempValue} 
              onEdit={isLocked ? undefined : editField(r.field)} 
              onBlur={isLocked ? undefined : () => handleBlur(r.field)} 
              onCancel={cancelEdit} 
            />
          ))}
        </div>
      </div>
    );
  };

  const pendingDiffs = pendingRequest ? getProfileChangesDiff(pendingRequest.current_data, pendingRequest.proposed_data) : [];
  const currentEditDiffs = isStudent && isOpenConfirmModal ? getProfileChangesDiff(safeParse("user", {}) || {}, denormalizeStudent(user)) : [];

  return (
    <div>
      {/* BANNER YÊU CẦU CHỜ DUYỆT (Dành cho Học sinh) */}
      <AnimatePresence>
        {!loadingPending && pendingRequest && isStudent && (
          <Motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-7 rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/30 p-4 md:p-5 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-900 dark:text-amber-200 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[14.5px] font-bold text-amber-950 dark:text-amber-100 flex items-center gap-2">
                    Yêu cầu thay đổi hồ sơ đang chờ xét duyệt
                  </h3>
                  <p className="text-[12px] text-amber-800/80 dark:text-amber-300/80 font-medium mt-0.5">
                    Gửi lúc {new Date(pendingRequest.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ngày {new Date(pendingRequest.created_at).toLocaleDateString("vi-VN")} • Giáo lý viên chủ nhiệm Lớp {pendingRequest.lop || "—"} đang kiểm duyệt
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Motion.button
                  {...pressable()}
                  type="button"
                  onClick={handleCancelRequest}
                  disabled={isCancelling}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-900/10 hover:bg-amber-900/15 dark:bg-amber-100/10 dark:hover:bg-amber-100/15 text-amber-950 dark:text-amber-200 text-[12px] font-bold transition-colors disabled:opacity-50"
                >
                  {isCancelling ? (
                    <span className="w-3.5 h-3.5 border-2 border-amber-800 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Hủy yêu cầu</span>
                </Motion.button>
              </div>
            </div>

            {/* Chi tiết các trường xin đổi */}
            {pendingDiffs.length > 0 && (
              <div className="mt-3.5 pt-3 border-t border-amber-500/20">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-900/80 dark:text-amber-300/80 mb-2">
                  Các thông tin đề xuất thay đổi ({pendingDiffs.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {pendingDiffs.map((diff) => (
                    <span
                      key={diff.key}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-[#1e2821] border border-amber-500/30 text-[12px] font-medium text-stone-800 dark:text-stone-200 shadow-2xs max-w-full flex-wrap"
                    >
                      <span className="font-bold text-amber-900 dark:text-amber-300 shrink-0">{diff.label}:</span>
                      <span className="line-through text-stone-400 dark:text-stone-500 text-[11px] truncate max-w-[120px] sm:max-w-[180px]">{diff.oldDisplay}</span>
                      <ArrowRight className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 truncate max-w-[120px] sm:max-w-[180px]">{diff.newDisplay}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Motion.div>
        )}
      </AnimatePresence>

      {/* 1. THÔNG TIN CƠ BẢN */}
      {renderSection("Thông tin cơ bản", ClipboardList, basicFields)}

      {/* 2. THÔNG TIN BÍ TÍCH */}
      {renderSection("Thông tin Bí tích", Church, sacrementFields)}

      {/* 3. GIA ĐÌNH & LIÊN HỆ */}
      {renderSection("Gia đình & Liên hệ", HeartHandshake, contactFields)}

      {/* 4. TÀI KHOẢN & BẢO MẬT */}
      <div className="mb-4">
        <h3 className="text-[13px] font-bold text-[#293d32] dark:text-[#ecece0] uppercase tracking-wider mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#314e3e] dark:text-[#d4b47d]" strokeWidth={2.2} />
          <span>Tài khoản & Bảo mật</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          {/* Email Khôi Phục */}
          <div className="flex items-center justify-between gap-2.5 bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-2xl px-3.5 sm:px-4 py-3.5 shadow-xs min-w-0">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
              <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-[#314e3e]/5 dark:bg-[#d4b47d]/10 flex items-center justify-center text-[#314e3e] dark:text-[#d4b47d] flex-shrink-0">
                <Mail className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">Email</span>
                  {user.email?.endsWith("@giaoly.local") && (
                    <span className="text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-1.5 py-0.5 rounded shadow-xs">Chưa cập nhật</span>
                  )}
                </div>
                <div className={`text-[13.5px] sm:text-[14px] font-bold truncate ${user.email?.endsWith("@giaoly.local") ? "text-[#575e55] dark:text-[#b0b9ac] italic" : "text-[#293d32] dark:text-[#ecece0]"}`}>
                  {user.email?.endsWith("@giaoly.local") ? "Chưa có email thực" : user.email}
                </div>
              </div>
            </div>
            <Motion.button {...pressable()} onClick={() => setIsOpenUpdateEmail(true)} className="flex-shrink-0 text-[11.5px] sm:text-[12px] font-bold px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-500/10 hover:bg-[#314e3e]/10 dark:bg-stone-400/10 dark:hover:bg-[#d4b47d]/20 text-[#314e3e] dark:text-[#d4b47d] transition-colors cursor-pointer">
              Cập nhật
            </Motion.button>
          </div>

          {/* Đổi mật khẩu */}
          <div className="flex items-center justify-between gap-2.5 bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-2xl px-3.5 sm:px-4 py-3.5 shadow-xs min-w-0">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
              <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-[#314e3e]/5 dark:bg-[#d4b47d]/10 flex items-center justify-center text-[#314e3e] dark:text-[#d4b47d] flex-shrink-0">
                <KeyRound className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac] mb-0.5">Mật khẩu</div>
                <div className="text-[13.5px] sm:text-[14px] font-bold text-[#293d32] dark:text-[#ecece0] tracking-widest">••••••••</div>
              </div>
            </div>
            <Motion.button {...pressable()} onClick={() => setIsOpenChangePass(true)} className="flex-shrink-0 text-[11.5px] sm:text-[12px] font-bold px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-500/10 hover:bg-[#314e3e]/10 dark:bg-stone-400/10 dark:hover:bg-[#d4b47d]/20 text-[#314e3e] dark:text-[#d4b47d] transition-colors cursor-pointer">
              Thay đổi
            </Motion.button>
          </div>

          {/* Đăng xuất */}
          <div className="md:col-span-2 pt-1">
            <Motion.button 
              {...pressable(0.98)} 
              onClick={handleLogout} 
              className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200/80 dark:border-red-500/20 rounded-2xl px-4 py-3.5 shadow-xs text-[14px] font-bold text-red-600 dark:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" strokeWidth={2} />
              Đăng xuất tài khoản
            </Motion.button>
          </div>

        </div>
      </div>

      {/* FLOAT SAVE BUTTON (PILL ACTION BAR) */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isAnyChange && !isLocked && (
            <div className="fixed bottom-[84px] md:bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none px-2.5 sm:px-4">
              <Motion.div
                initial={{ opacity: 0, y: 25, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 25, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                role="region"
                aria-live="polite"
                aria-label="Thao tác lưu thay đổi"
                className="pointer-events-auto w-auto max-w-[98%] sm:max-w-max bg-[#1e2821]/95 dark:bg-[#151c18]/95 backdrop-blur-xl rounded-full shadow-2xl border border-[#354237] dark:border-[#dedfd4]/20 flex items-center justify-between pl-3 sm:pl-4 pr-1.5 py-1.5 md:py-2 gap-2 sm:gap-4 md:gap-6 text-white"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 pr-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#d6b883] animate-pulse flex-shrink-0" />
                  <span className="text-[12px] sm:text-[13px] md:text-[14px] font-bold text-stone-100 whitespace-nowrap">
                    <span className="inline sm:hidden">Chưa lưu</span>
                    <span className="hidden sm:inline">Có thay đổi chưa lưu</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                  <Motion.button 
                    {...pressable()} 
                    onClick={handleDiscard}
                    className="px-2.5 sm:px-3.5 py-1.5 md:px-4 md:py-2 rounded-full bg-white/10 hover:bg-white/15 text-stone-300 text-[11.5px] sm:text-[12px] md:text-[13px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Hủy</span>
                  </Motion.button>
                  <Motion.button 
                    {...pressable()} 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="px-3 sm:px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-[#d6b883] hover:bg-[#e0c696] text-[#19251d] text-[11.5px] sm:text-[12px] md:text-[13px] font-extrabold transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isSaving ? (
                      <svg className="h-4 w-4 animate-spin text-[#19251d]" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                    ) : isStudent ? (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Gửi duyệt</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Lưu lại</span>
                      </>
                    )}
                  </Motion.button>
                </div>
              </Motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* MODAL XÁC NHẬN GỬI YÊU CẦU DUYỆT (Dành cho Học sinh) */}
      <AnimatePresence>
        {isOpenConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => !isSaving && setIsOpenConfirmModal(false)}
            />
            <Motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-modal-title"
              className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] shadow-2xl p-5 md:p-6 z-10 overscroll-contain"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#314e3e]/10 dark:bg-[#d4b47d]/15 text-[#314e3e] dark:text-[#d4b47d] flex items-center justify-center shrink-0 border border-[#dedfd4] dark:border-[#354237]">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 id="confirm-modal-title" className="text-[17px] font-bold text-[#293d32] dark:text-[#ecece0]">
                      Gửi yêu cầu thay đổi hồ sơ
                    </h3>
                    <p className="text-[12px] text-[#575e55] dark:text-[#b0b9ac] font-medium">
                      Đang đề xuất {currentEditDiffs.length} thông tin mới
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpenConfirmModal(false)}
                  disabled={isSaving}
                  aria-label="Đóng"
                  className="w-8 h-8 rounded-full bg-stone-500/10 hover:bg-stone-500/20 text-[#575e55] dark:text-[#b0b9ac] flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div
                data-lenis-prevent
                className="flex-1 overflow-y-auto overscroll-contain space-y-3.5 pr-1 touch-pan-y"
              >
                <p className="text-[13px] text-[#575e55] dark:text-[#b0b9ac] leading-relaxed">
                  Thông tin đề xuất sẽ được gửi đến <strong className="text-[#293d32] dark:text-[#ecece0]">Giáo lý viên chủ nhiệm</strong> để kiểm duyệt và cập nhật chính thức vào sổ bộ giáo xứ.
                </p>

                {currentEditDiffs.length > 0 && (
                  <div className="p-3 bg-[#faf8f3] dark:bg-[#151c18] rounded-2xl border border-[#dedfd4] dark:border-[#354237] space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">
                      Các thông tin thay đổi ({currentEditDiffs.length}):
                    </p>
                    <div className="space-y-2">
                      {currentEditDiffs.map((diff) => (
                        <div
                          key={diff.key}
                          className="p-2.5 rounded-xl bg-white dark:bg-[#1e2821] border border-[#dedfd4]/70 dark:border-[#354237]/70 text-[12.5px] space-y-1 shadow-2xs"
                        >
                          <div className="font-bold text-[#293d32] dark:text-[#ecece0] text-[12px]">
                            {diff.label}
                          </div>
                          <div className="flex items-center gap-2 text-[12.5px] flex-wrap">
                            <span className="line-through text-stone-400 dark:text-stone-500 text-[11.5px]">
                              {diff.oldDisplay}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d4b47d] shrink-0" />
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">
                              {diff.newDisplay}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-4 mt-2 border-t border-[#dedfd4] dark:border-[#354237] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsOpenConfirmModal(false)}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#575e55] dark:text-[#b0b9ac] hover:bg-stone-500/10 transition-colors"
                >
                  Kiểm tra lại
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmitRequest}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] text-[13.5px] font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <span className="w-4 h-4 border-2 border-white dark:border-[#19251d] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Xác nhận gửi</span>
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpenChangePass && <ChangePassword setIsOpenChangePass={setIsOpenChangePass} />}
        {isOpenUpdateEmail && <UpdateEmail setIsOpenUpdateEmail={setIsOpenUpdateEmail} />}
      </AnimatePresence>
    </div>
  );
}

export { ProfileSkeleton };
