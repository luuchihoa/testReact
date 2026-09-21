import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search, ChevronDown, Users as UsersIcon, ArrowLeft, ArrowRight, Trash2,
  AlertTriangle, FileSpreadsheet, School, Shield, Upload,
  X, Check, Info, ShieldAlert, RefreshCw
} from "lucide-react";
import { useLenis } from "lenis/react";
import { useAdminContext } from "./AdminContext.jsx";
import { TableSkeleton, Spinner } from "../../components/ui/Skeleton.jsx";
import {
  ROLE_OPTIONS, ROLE_LABELS_VI, ROLE_BADGE, AVATAR_FALLBACK,
  handleAvatarError,
} from "./constants.js";
import {
  updateUserRole, fetchUsersPaginated, deleteUser,
  fetchUserRoleCounts, fetchAllUsersForExport
} from "./dataLayer.js";
import { exportUsersExcel } from "./utils/excelRosterHelper.js";
import ExcelImportUsersModal from "./components/ExcelImportUsersModal.jsx";


// Hook quản lý khả năng tiếp cận chuẩn cho Modal/Sheet theo tiêu chuẩn AGENTS.md
function useSheetAccessibility(isOpen, onClose, lenis) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);
  const onCloseRef = useRef(onClose);
  const originalOverflowRef = useRef(null);
  const didLockRef = useRef(false);
  const wasLenisStoppedRef = useRef(false);

  // Đồng bộ onClose callback vào ref mà không vi phạm quy tắc render
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    // Ghi nhớ phần tử đang focus trước khi mở modal
    previousActiveElement.current = document.activeElement;

    // Khóa cuộn trang nền và ghi nhớ overflow ban đầu
    if (!didLockRef.current) {
      originalOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      didLockRef.current = true;
    }

    // Ghi nhớ và bảo toàn trạng thái Lenis trước khi modal can thiệp
    if (lenis) {
      wasLenisStoppedRef.current = Boolean(lenis.isStopped);
      if (!wasLenisStoppedRef.current) {
        lenis.stop();
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current?.();
        return;
      }

      if (e.key === "Tab") {
        const modal = modalRef.current;
        if (!modal) return;

        const focusable = modal.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Initial focus: ưu tiên input/button đầu tiên
    const timer = setTimeout(() => {
      const modal = modalRef.current;
      const firstFocusable = modal?.querySelector(
        'input:not([disabled]):not([type="hidden"]), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (firstFocusable) {
        firstFocusable.focus();
      } else if (modal) {
        modal.focus();
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);

      // Chỉ khôi phục trạng thái cuộn mà modal đã thay đổi
      if (didLockRef.current) {
        document.body.style.overflow = originalOverflowRef.current ?? "";
        didLockRef.current = false;
      }

      // Chỉ khởi động lại Lenis nếu chính modal này đã dừng nó
      if (lenis && !wasLenisStoppedRef.current) {
        lenis.start();
      }

      if (previousActiveElement.current && typeof previousActiveElement.current.focus === "function") {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, lenis]);

  return modalRef;
}

/* ============================================================
   1. MODAL XÁC NHẬN ĐỔI VAI TRÒ (ACCESSIBLE ROLE CHANGE MODAL)
   ============================================================ */
const RoleChangeModal = React.memo(({ 
  pendingChange, 
  totalAdmins = 1,
  namHoc = "",
  isOpen, 
  isSaving, 
  errorMessage, 
  onConfirm, 
  onCancel 
}) => {
  const lenis = useLenis();
  const handleClose = useCallback(() => {
    if (!isSaving && onCancel) onCancel();
  }, [isSaving, onCancel]);
  const modalRef = useSheetAccessibility(isOpen, handleClose, lenis);

  if (!isOpen || !pendingChange) return null;

  const { user, currentRole, newRole, isSelfDemote, assignedClasses = [] } = pendingChange;
  const username = user?.username;
  const hoTen = user?.hoTen || username;

  const isGrantingAdmin = newRole === "admin";
  const isRevokingAdmin = currentRole === "admin" && newRole !== "admin";
  const isLastAdmin = isRevokingAdmin && totalAdmins <= 1;
  const isGrantingTeacher = newRole === "teacher";
  const isRevokingTeacher = currentRole === "teacher" && newRole !== "teacher";
  const isTeacherWithClasses = isRevokingTeacher && assignedClasses.length > 0;

  const isBlocked = isLastAdmin || isTeacherWithClasses;

  return createPortal(
    <div
      data-lenis-prevent
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-all"
      onClick={!isSaving ? onCancel : undefined}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-change-modal-title"
        aria-describedby="role-change-modal-desc"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:w-[500px] max-h-[90dvh] overflow-y-auto bg-[#fffefa] dark:bg-[#1e2821] rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#dedfd4] dark:border-[#354237] flex flex-col gap-4 text-[#293d32] dark:text-[#ecece0] pb-[calc(env(safe-area-inset-bottom)+20px)] sm:pb-6 focus:outline-none"
      >
        <div className="sm:hidden mx-auto mb-1 h-1.5 w-12 rounded-full bg-stone-300 dark:bg-stone-700" />

        <div className="flex items-start gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs ${
              isGrantingAdmin || isRevokingAdmin || isSelfDemote || isBlocked
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                : "bg-[#314e3e]/10 text-[#314e3e] dark:bg-[#d6b883]/20 dark:text-[#d6b883]"
            }`}
          >
            {isGrantingAdmin || isRevokingAdmin || isSelfDemote || isBlocked ? (
              <ShieldAlert className="w-6 h-6" strokeWidth={2.25} aria-hidden="true" />
            ) : (
              <Shield className="w-6 h-6" strokeWidth={2.25} aria-hidden="true" />
            )}
          </div>
          <div className="flex-1 min-w-0 mt-0.5">
            <h3 id="role-change-modal-title" className="text-base sm:text-lg font-bold text-[#293d32] dark:text-[#ecece0] font-sans leading-snug">
              {isLastAdmin
                ? "Không thể hạ quyền Quản trị viên"
                : isTeacherWithClasses
                ? "Giáo lý viên đang phụ trách lớp"
                : isSelfDemote
                ? "Xác nhận tự hạ quyền Quản trị?"
                : isGrantingAdmin
                ? "Cấp toàn quyền Quản trị viên?"
                : isRevokingAdmin
                ? "Thu hồi quyền Quản trị viên?"
                : "Xác nhận đổi vai trò tài khoản?"}
            </h3>
            <p id="role-change-modal-desc" className="text-xs sm:text-sm font-medium text-[#575e55] dark:text-[#b0b9ac] mt-1 leading-relaxed break-words">
              {isLastAdmin
                ? "Hệ thống phát hiện đây là tài khoản Quản trị viên duy nhất. Không thể hạ quyền vì hệ thống sẽ mất quyền điều hành."
                : isTeacherWithClasses
                ? `Giáo lý viên này đang có phân công đứng lớp trong niên khóa ${namHoc || "hiện tại"}. Vui lòng bàn giao lớp trước khi đổi vai trò.`
                : isSelfDemote
                ? "Bạn sắp từ bỏ quyền Quản trị viên của chính mình. Sau khi cập nhật, bạn sẽ bị đưa ra khỏi trang Quản trị ngay lập tức."
                : `Bạn đang thay đổi vai trò tài khoản của người dùng "${hoTen}".`}
            </p>
          </div>
        </div>

        {/* Thông tin tài khoản */}
        <div className="p-3.5 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-black/10 dark:border-white/10 flex-shrink-0 bg-stone-100">
            <img
              src={user?.avatar || AVATAR_FALLBACK}
              alt=""
              className="w-full h-full object-cover"
              onError={handleAvatarError}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] break-words">
              {user?.tenThanh && <span className="text-[#575e55] dark:text-[#b0b9ac] font-medium mr-1">{user.tenThanh}</span>}
              {hoTen}
            </p>
            <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] font-mono break-all mt-0.5">
              @{username}
            </p>
          </div>
        </div>

        {/* Khung chuyển đổi vai trò */}
        <div className="p-4 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] flex items-center justify-between gap-3">
          <div className="flex flex-col items-start gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">Vai trò cũ</span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${ROLE_BADGE[currentRole]}`}>
              {ROLE_LABELS_VI[currentRole] || currentRole}
            </span>
          </div>

          <div className="flex items-center text-[#927140] dark:text-[#d4b47d]">
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">Vai trò mới</span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${ROLE_BADGE[newRole]}`}>
              {ROLE_LABELS_VI[newRole] || newRole}
            </span>
          </div>
        </div>

        {/* Khóa thao tác nếu vi phạm điều kiện bất biến */}
        {isLastAdmin ? (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong className="font-bold">Không thể hạ quyền:</strong> Đây là Quản trị viên duy nhất còn lại trong hệ thống ({totalAdmins} tài khoản). Hệ thống bắt buộc phải duy trì ít nhất một Quản trị viên để quản lý.
            </span>
          </div>
        ) : isTeacherWithClasses ? (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong className="font-bold">Đang phụ trách lớp ({namHoc || "niên khóa"}):</strong> Giáo lý viên này đang được phân công dạy <strong>{assignedClasses.length} lớp ({assignedClasses.join(", ")})</strong>. Để bảo vệ dữ liệu sổ điểm và điểm danh, vui lòng chuyển sang tab Lớp học để gỡ phân công trước khi đổi vai trò.
            </span>
          </div>
        ) : (
          <>
            {/* Cảnh báo hệ quả chi tiết khi không bị khóa */}
            {isGrantingAdmin && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-500/20 text-xs text-red-800 dark:text-red-300 leading-relaxed flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span><strong className="font-bold">Lưu ý bảo mật:</strong> Tài khoản sẽ nhận toàn bộ quyền Quản trị viên cao nhất hệ thống: quản lý nhân sự, xóa dữ liệu, phân công lớp học và cấu hình niên khóa.</span>
              </div>
            )}

            {isRevokingAdmin && !isSelfDemote && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>Tài khoản sẽ bị thu hồi toàn bộ quyền quản trị viên và không còn truy cập được trang Quản trị này.</span>
              </div>
            )}

            {isRevokingTeacher && (
              <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800 border border-[#dedfd4] dark:border-[#354237] text-xs text-[#575e55] dark:text-[#b0b9ac] leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883] flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>Tài khoản sẽ không còn quyền Giáo lý viên phụ trách lớp và chấm điểm trong hệ thống.</span>
              </div>
            )}

            {isGrantingTeacher && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>Tài khoản sẽ được phân quyền Giáo lý viên và có thể phân công phụ trách các lớp học.</span>
              </div>
            )}
          </>
        )}

        {/* Báo lỗi trực tiếp trong modal nếu có */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-800 text-xs text-red-800 dark:text-red-300 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Nút hành động */}
        <div className="flex items-center gap-3 mt-1">
          <button
            type="button"
            disabled={isSaving}
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold text-[#575e55] dark:text-[#b0b9ac] bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors disabled:opacity-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
          >
            {isBlocked ? "Đóng" : "Hủy bỏ"}
          </button>
          {!isBlocked && (
            <button
              type="button"
              disabled={isSaving}
              onClick={onConfirm}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-xs disabled:opacity-50 motion-safe:active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] ${
                isGrantingAdmin || isRevokingAdmin || isSelfDemote 
                  ? "bg-amber-700 hover:bg-amber-800 text-white" 
                  : "bg-[#314e3e] hover:bg-[#253d30] dark:bg-[#d6b883] dark:text-[#19251d]"
              }`}
            >
              {isSaving && <Spinner className="w-4 h-4 text-white dark:text-[#19251d]" />}
              <span>{isSaving ? "Đang lưu…" : "Xác nhận đổi"}</span>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
});

/* ============================================================
   2. MODAL XÁC NHẬN XOÁ TÀI KHOẢN (ACCESSIBLE DELETE MODAL)
   ============================================================ */
const DeleteUserModal = React.memo(({ 
  user, 
  assignedClasses = [],
  isSelf,
  isOpen, 
  isDeleting, 
  errorMessage,
  onConfirm, 
  onCancel 
}) => {
  const lenis = useLenis();
  const handleClose = useCallback(() => {
    if (!isDeleting && onCancel) onCancel();
  }, [isDeleting, onCancel]);
  const modalRef = useSheetAccessibility(isOpen, handleClose, lenis);

  const [confirmInput, setConfirmInput] = useState("");

  if (!isOpen || !user) return null;

  const hoTen = user.hoTen || user.username;
  const isBlocked = isSelf || assignedClasses.length > 0;
  const isUsernameMatch = confirmInput.trim() === user.username;

  return createPortal(
    <div
      data-lenis-prevent
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-all"
      onClick={!isDeleting ? onCancel : undefined}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-user-modal-title"
        aria-describedby="delete-user-modal-desc"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:w-[500px] max-h-[90dvh] overflow-y-auto bg-[#fffefa] dark:bg-[#1e2821] rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-red-500/20 flex flex-col gap-4 text-[#293d32] dark:text-[#ecece0] pb-[calc(env(safe-area-inset-bottom)+20px)] sm:pb-6 focus:outline-none"
      >
        <div className="sm:hidden mx-auto mb-1 h-1.5 w-12 rounded-full bg-stone-300 dark:bg-stone-700" />

        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 flex items-center justify-center flex-shrink-0 shadow-xs">
            <Trash2 className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0 mt-0.5">
            <h3 id="delete-user-modal-title" className="text-base sm:text-lg font-bold text-red-700 dark:text-red-400 font-sans leading-snug">
              Xác nhận xóa tài khoản?
            </h3>
            <p id="delete-user-modal-desc" className="text-xs sm:text-sm font-medium text-[#575e55] dark:text-[#b0b9ac] mt-1 leading-relaxed break-words">
              Thao tác này sẽ xóa vĩnh viễn tài khoản của người dùng khỏi hệ thống dữ liệu Giáo lý An Ngãi.
            </p>
          </div>
        </div>

        {/* Thông tin người dùng sẽ xoá */}
        <div className="p-3.5 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden border border-black/10 dark:border-white/10 flex-shrink-0 bg-stone-100 shadow-xs">
            <img
              src={user.avatar || AVATAR_FALLBACK}
              alt=""
              className="w-full h-full object-cover"
              onError={handleAvatarError}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] break-words">
              {user.tenThanh && <span className="text-[#575e55] dark:text-[#b0b9ac] font-medium mr-1">{user.tenThanh}</span>}
              {hoTen}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac] font-mono">
                @{user.username}
              </span>
              <span className={`inline-block text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${ROLE_BADGE[user.role] || ROLE_BADGE.user}`}>
                {ROLE_LABELS_VI[user.role] || user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Khóa thao tác nếu vi phạm điều kiện */}
        {isSelf ? (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span><strong className="font-bold">Không thể xóa:</strong> Đây là tài khoản Quản trị viên đang đăng nhập. Bạn không thể tự xóa tài khoản của chính mình.</span>
          </div>
        ) : assignedClasses.length > 0 ? (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong className="font-bold">Đang phụ trách lớp:</strong> Tài khoản này đang được phân công dạy <strong>{assignedClasses.length} lớp ({assignedClasses.join(", ")})</strong>. Để bảo vệ dữ liệu lớp học, vui lòng chuyển sang tab Lớp học để gỡ phân công trước khi xóa.
            </span>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-500/20 text-xs text-red-800 dark:text-red-300 leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong className="font-bold">Cảnh báo vĩnh viễn:</strong> Toàn bộ dữ liệu tài khoản xác thực, điểm số, điểm danh và thông báo liên quan sẽ bị xóa sạch khỏi cơ sở dữ liệu và không thể khôi phục.
            </span>
          </div>
        )}

        {/* Ô nhập xác nhận tên tài khoản nếu không bị khóa */}
        {!isBlocked && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm-delete-username" className="text-xs font-semibold text-[#293d32] dark:text-[#ecece0]">
              Nhập tên người dùng <code className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/60 font-mono text-red-700 dark:text-red-300 font-bold select-all">{user.username}</code> để xác nhận xóa:
            </label>
            <input
              id="confirm-delete-username"
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              disabled={isDeleting}
              placeholder={user.username}
              autoComplete="off"
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-white dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
            />
          </div>
        )}

        {/* Lỗi phát sinh trong modal */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-800 text-xs text-red-800 dark:text-red-300 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Nút thao tác */}
        <div className="flex items-center gap-3 mt-1">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold text-[#575e55] dark:text-[#b0b9ac] bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors disabled:opacity-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
          >
            {isBlocked ? "Đóng" : "Hủy bỏ"}
          </button>
          {!isBlocked && (
            <button
              type="button"
              disabled={isDeleting || !isUsernameMatch}
              onClick={onConfirm}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 motion-safe:active:scale-[0.98] transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              {isDeleting && <Spinner className="w-4 h-4 text-white" />}
              <span>{isDeleting ? "Đang xóa…" : "Xác nhận xóa"}</span>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
});

/* ============================================================
   TIỆN ÍCH TRẠNG THÁI THỰC TẾ & GIAO DIỆN CHUẨN ACCESSIBILITY
   ============================================================ */
function getUserDisplayStatus(u, assignedClasses = []) {
  const role = u?.role || "user";
  const rawStatus = (u?.trangThai || u?.trang_thai || "").trim();

  // Các trạng thái đặc biệt được quản trị viên chủ động thiết lập
  if (rawStatus === "Nghỉ dạy" || rawStatus === "Tạm nghỉ") return "Nghỉ dạy";
  if (rawStatus === "Nghỉ học") return "Nghỉ học";
  if (rawStatus === "Hoàn thành") return "Hoàn thành";

  if (role === "teacher") {
    return assignedClasses.length > 0 ? "Đang dạy" : "Chưa phân công";
  }

  if (role === "student") {
    return u?.lopHoc ? "Đang học" : (rawStatus || "Chưa xếp lớp");
  }

  if (role === "admin" || role === "user") {
    return "Hoạt động";
  }

  return rawStatus || "Hoạt động";
}

function getStatusBadgeClass(status) {
  switch (status) {
    case "Đang dạy":
    case "Đang học":
    case "Hoạt động":
      return "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60";
    case "Chưa phân công":
    case "Chưa xếp lớp":
      return "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/60";
    case "Hoàn thành":
      return "bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-300/60 dark:border-sky-800/60";
    case "Nghỉ dạy":
    case "Nghỉ học":
      return "bg-stone-100 text-stone-600 dark:bg-stone-800/60 dark:text-stone-400 border border-stone-200 dark:border-stone-700";
    default:
      return "bg-stone-50 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700";
  }
}

/* ============================================================
   MAIN COMPONENT: USERSTAB
   ============================================================ */
export default function UsersTab() {
  const { classes, namHoc, showToast, handleRoleChanged, loadAll } = useAdminContext();

  const navigate = useNavigate();
  const currentUsername = useMemo(() => localStorage.getItem("username") || "", []);

  const [searchParams, setSearchParams] = useSearchParams();
  const paramRole = searchParams.get("role");
  const VALID_ROLE_FILTERS = useMemo(() => new Set(["all", ...ROLE_OPTIONS]), []);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [exportingExcel, setExportingExcel] = useState(false);

  // roleFilter được dẫn xuất trực tiếp từ URL parameter (không lưu state trùng lặp)
  const roleFilter = useMemo(() => {
    return paramRole && VALID_ROLE_FILTERS.has(paramRole) ? paramRole : "all";
  }, [paramRole, VALID_ROLE_FILTERS]);

  // Phân trang & dữ liệu
  const [localUsers, setLocalUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Thống kê vai trò
  const [roleStats, setRoleStats] = useState({
    total: 0,
    admin: 0,
    teacher: 0,
    student: 0,
    user: 0,
  });
  const [roleStatsLoading, setRoleStatsLoading] = useState(true);
  const [roleStatsError, setRoleStatsError] = useState(false);

  // Modal State
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [pendingRoleChange, setPendingRoleChange] = useState(null);
  const [isRoleSaving, setIsRoleSaving] = useState(false);
  const [roleError, setRoleError] = useState(null);

  const [showImportModal, setShowImportModal] = useState(false);


  // Cập nhật URL khi đổi roleFilter
  const handleSelectRoleFilter = useCallback((roleId) => {
    const nextRole = VALID_ROLE_FILTERS.has(roleId) ? roleId : "all";
    setPage(1);
    setIsFetching(true);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextRole === "all") {
        next.delete("role");
      } else {
        next.set("role", nextRole);
      }
      return next;
    }, { replace: true });
  }, [setSearchParams, VALID_ROLE_FILTERS]);

  // Debounce search input (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Nạp danh sách người dùng phân trang từ Server qua Promise trong effect
  useEffect(() => {
    let ignore = false;

    fetchUsersPaginated(page, pageSize, debouncedSearch, roleFilter, namHoc)
      .then(({ users, totalCount: count }) => {
        if (ignore) return;
        setLocalUsers(users);
        setTotalCount(count ?? 0);
        setIsFetching(false);
      })
      .catch((err) => {
        if (ignore) return;
        console.error("fetch users error:", err);
        setFetchError(err?.message || "Không thể tải danh sách người dùng.");
        setIsFetching(false);
      });

    return () => {
      ignore = true;
    };
  }, [page, pageSize, debouncedSearch, roleFilter, namHoc]);

  // Tải thống kê các vai trò khi mount
  useEffect(() => {
    let ignore = false;

    fetchUserRoleCounts()
      .then((stats) => {
        if (ignore) return;
        setRoleStats(stats);
        setRoleStatsLoading(false);
      })
      .catch((err) => {
        if (ignore) return;
        console.error("fetch role counts error:", err);
        setRoleStatsError(true);
        setRoleStatsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Hàm reload thủ công cho danh sách sau khi thao tác
  const reloadUsers = useCallback(async () => {
    setIsFetching(true);
    setFetchError(null);
    try {
      const { users, totalCount: count } = await fetchUsersPaginated(
        page, pageSize, debouncedSearch, roleFilter, namHoc
      );
      setLocalUsers(users);
      setTotalCount(count ?? 0);
    } catch (err) {
      console.error("reload users error:", err);
      setFetchError(err?.message || "Không thể tải danh sách người dùng.");
      if (showToast) showToast("Không tải được danh sách người dùng", "error");
    } finally {
      setIsFetching(false);
    }
  }, [page, pageSize, debouncedSearch, roleFilter, namHoc, showToast]);

  // Hàm reload thủ công cho thống kê vai trò
  const reloadRoleStats = useCallback(async () => {
    setRoleStatsLoading(true);
    setRoleStatsError(false);
    try {
      const stats = await fetchUserRoleCounts();
      setRoleStats(stats);
    } catch (err) {
      console.error("reload role counts error:", err);
      setRoleStatsError(true);
    } finally {
      setRoleStatsLoading(false);
    }
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Tra cứu TẤT CẢ các lớp phụ trách của Giáo lý viên trong niên khóa
  const homeroomLopsOf = useCallback(
    (username) => {
      if (!username || !classes?.length) return [];
      return classes
        .filter((c) => c.teacherUsernames?.includes(username) || c.teacherUsername === username)
        .map((c) => c.lop);
    },
    [classes]
  );

  const handleSelfDemoted = useCallback(() => {
    localStorage.removeItem("role");
    navigate("/", { replace: true });
  }, [navigate]);

  // Mở modal xác nhận đổi vai trò
  const initiateRoleChange = useCallback((user, newRole) => {
    const currentRole = user.role;
    if (newRole === currentRole) return;

    setRoleError(null);
    setPendingRoleChange({
      user,
      currentRole,
      newRole,
      isSelfDemote: user.username === currentUsername && newRole !== "admin",
      assignedClasses: homeroomLopsOf(user.username),
    });
  }, [currentUsername, homeroomLopsOf]);

  // Thực thi cập nhật vai trò lên Database
  const executeRoleUpdate = async () => {
    if (!pendingRoleChange) return;
    const { user, newRole } = pendingChangeUser();
    const username = user.username;
    const isSelfDemote = pendingRoleChange.isSelfDemote;

    setIsRoleSaving(true);
    setRoleError(null);
    try {
      await updateUserRole(username, newRole);

      // Đồng bộ dữ liệu tại chỗ:
      if (roleFilter !== "all" && newRole !== roleFilter) {
        // Nếu không còn thỏa mãn bộ lọc hiện tại, gỡ khỏi danh sách và giảm đếm
        const remainingCount = localUsers.length - 1;
        setTotalCount((c) => Math.max(0, c - 1));

        if (remainingCount === 0 && page > 1) {
          // Lùi về trang trước nếu bản ghi cuối cùng trên trang bị loại
          setPage((p) => Math.max(1, p - 1));
        } else {
          // Tải lại trang hiện tại để lấp đầy bản ghi kế tiếp từ server
          reloadUsers();
        }
      } else {
        setLocalUsers((prev) => prev.map((u) => u.username === username ? { ...u, role: newRole } : u));
      }

      reloadRoleStats();
      if (handleRoleChanged) handleRoleChanged(username, newRole);
      if (loadAll) loadAll();

      if (showToast) showToast(`Đã đổi vai trò @${username} thành "${ROLE_LABELS_VI[newRole]}"`, "success");
      setPendingRoleChange(null);

      if (isSelfDemote) {
        handleSelfDemoted();
      }
    } catch (err) {
      console.error("update role error:", err);
      setRoleError(err?.message || "Cập nhật vai trò thất bại. Vui lòng thử lại.");
    } finally {
      setIsRoleSaving(false);
    }
  };

  const pendingChangeUser = () => pendingRoleChange;

  // Mở modal xác nhận xóa người dùng
  const initiateDeleteUser = useCallback((user) => {
    setDeleteError(null);
    setUserToDelete(user);
  }, []);

  // Thực thi xóa người dùng qua RPC
  const executeDeleteUser = async () => {
    if (!userToDelete) return;
    const username = userToDelete.username;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteUser(username);

      // Gỡ khỏi danh sách hiển thị
      const remainingCount = localUsers.length - 1;
      setTotalCount((c) => Math.max(0, c - 1));

      // Nếu trang hiện tại không còn bản ghi nào và page > 1, lùi về trang trước
      if (remainingCount === 0 && page > 1) {
        setPage((p) => Math.max(1, p - 1));
      } else {
        // Tải lại trang hiện tại để bù đắp bản ghi kế tiếp từ DB
        reloadUsers();
      }

      reloadRoleStats();
      if (handleRoleChanged) handleRoleChanged(username, null);
      if (loadAll) loadAll();

      if (showToast) showToast(`Đã xóa tài khoản @${username} thành công`, "success");
      setUserToDelete(null);
    } catch (err) {
      console.error("delete user error:", err);
      setDeleteError(err?.message || "Xóa người dùng thất bại qua hệ thống quản trị.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Xuất file Excel danh sách người dùng theo bộ lọc
  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const allUsers = await fetchAllUsersForExport(debouncedSearch, roleFilter, namHoc);
      if (allUsers.length === 0) {
        if (showToast) showToast("Không có dữ liệu người dùng để xuất Excel", "warning");
        return;
      }
      const filterLabel = roleFilter === "all" ? "Tất cả" : (ROLE_LABELS_VI[roleFilter] || roleFilter);
      
      // Ghép nối danh sách tất cả các lớp phụ trách / lớp học vào Excel
      const getLopsFormatted = (uName, u) => {
        if (u?.role === "student") {
          return u?.lopHoc || "—";
        }
        if (u?.role === "teacher") {
          const lops = homeroomLopsOf(uName);
          return lops.length > 0 ? lops.join(", ") : "—";
        }
        return "—";
      };

      await exportUsersExcel(allUsers, filterLabel, getLopsFormatted);
      if (showToast) showToast(`Đã xuất file Excel ${allUsers.length} tài khoản thành công`, "success");
    } catch (err) {
      console.error("export users excel error:", err);
      if (showToast) showToast("Lỗi khi xuất file Excel", "error");
    } finally {
      setExportingExcel(false);
    }
  };

  // Hàm tính số lượng hiển thị trên Filter Pills an toàn
  const getPillCount = (key) => {
    if (roleStatsLoading) return "…";
    if (roleStatsError) return "–";
    const val = roleStats[key];
    return typeof val === "number" ? val : 0;
  };

  // Danh mục Filter Pills
  const filterPills = [
    { id: "all", label: "Tất cả", count: getPillCount("total") },
    { id: "teacher", label: "Giáo lý viên", count: getPillCount("teacher") },
    { id: "student", label: "Giáo lý sinh", count: getPillCount("student") },
    { id: "admin", label: "Quản trị viên", count: getPillCount("admin") },
    { id: "user", label: "Thành viên", count: getPillCount("user") },
  ];

  // Tính toán khoảng bản ghi hiển thị (from - to)
  const recordFrom = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const recordTo = Math.min(page * pageSize, totalCount);
  const isFiltered = Boolean(debouncedSearch || roleFilter !== "all");

  return (
    <div className="flex flex-col gap-5 sm:gap-6 pb-16 sm:pb-0">
      {/* ── HEADER GIỚI THIỆU & NÚT XUẤT EXCEL ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 bg-[#314e3e]/10 dark:bg-[#d6b883]/20 border border-[#314e3e]/20 dark:border-[#d6b883]/30 shadow-xs">
            <UsersIcon className="w-5 h-5 text-[#314e3e] dark:text-[#d6b883]" strokeWidth={2.25} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#293d32] dark:text-[#ecece0] font-sans leading-tight">
              Quản Lý Người Dùng & Phân Quyền
            </h2>
            <p className="text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac] mt-0.5 leading-snug">
              {roleStatsLoading ? (
                "Đang tải số liệu tài khoản…"
              ) : roleStatsError ? (
                <span>Chưa thể tải số liệu tổng hợp.</span>
              ) : (
                <>Toàn hệ thống có <strong>{roleStats.total} tài khoản</strong> đã đăng ký.</>
              )}
            </p>
          </div>
        </div>

        {/* Nhóm nút Thao tác Excel */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {/* Nút Nhập Excel */}
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            disabled={isFetching}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold bg-[#fffefa] dark:bg-[#1e2821] text-[#314e3e] dark:text-[#d6b883] border border-[#dedfd4] dark:border-[#354237] shadow-xs hover:bg-[#314e3e]/5 dark:hover:bg-[#d6b883]/10 motion-safe:active:scale-95 transition-all cursor-pointer disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e]"
            title="Nhập danh sách người dùng từ file Excel (.xlsx)"
          >
            <Upload className="w-4 h-4" aria-hidden="true" />
            <span>Nhập Excel</span>
          </button>

          {/* Nút Xuất Excel */}
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={exportingExcel || isFetching}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold bg-[#fffefa] dark:bg-[#1e2821] text-[#314e3e] dark:text-[#d6b883] border border-[#dedfd4] dark:border-[#354237] shadow-xs hover:bg-[#314e3e]/5 dark:hover:bg-[#d6b883]/10 motion-safe:active:scale-95 transition-all cursor-pointer disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e]"
            title="Xuất danh sách tài khoản theo bộ lọc ra Excel"
          >
            {exportingExcel ? (
              <Spinner className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
            )}
            <span>{exportingExcel ? "Đang xuất…" : "Xuất Excel"}</span>
          </button>
        </div>
      </div>


      {/* ── THANH CÔNG CỤ TÌM KIẾM & BỘ LỌC VAI TRÒ (MOBILE-FIRST) ── */}
      <div className="bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
        {/* Hàng tìm kiếm */}
        <div className="relative w-full">
          <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#575e55] dark:text-[#b0b9ac] pointer-events-none" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo họ tên, tên thánh hoặc @username…"
            className="w-full pl-10 pr-10 py-2.5 min-h-[44px] rounded-2xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] text-base text-[#293d32] dark:text-[#ecece0] placeholder:text-[#575e55]/60 placeholder:text-xs sm:placeholder:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#314e3e] dark:focus:ring-[#d6b883]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="w-10 h-10 min-h-[44px] min-w-[44px] absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#575e55] dark:text-[#b0b9ac] hover:text-[#293d32] dark:hover:text-[#ecece0] cursor-pointer"
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Hàng bộ lọc vai trò (Pills cuộn ngang mượt mà) */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full no-scrollbar">
            {filterPills.map((pill) => {
              const isActive = roleFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => handleSelectRoleFilter(pill.id)}
                  className={`px-3.5 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] ${
                    isActive
                      ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-xs"
                      : "bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] border border-[#dedfd4] dark:border-[#354237] hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <span>{pill.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-mono font-bold tabular-nums ${
                    isActive
                      ? "bg-white/20 text-white dark:bg-black/20 dark:text-[#19251d]"
                      : "bg-black/5 dark:bg-white/5 text-[#575e55] dark:text-[#b0b9ac]"
                  }`}>
                    {pill.count}
                  </span>
                </button>
              );
            })}

            {roleStatsError && (
              <button
                type="button"
                onClick={reloadRoleStats}
                disabled={roleStatsLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 hover:bg-amber-200/80 transition-colors cursor-pointer flex-shrink-0"
                title="Thử lại việc tải số lượng các vai trò"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${roleStatsLoading ? "animate-spin" : ""}`} />
                <span>Thử lại số liệu</span>
              </button>
            )}
          </div>

          {(search || roleFilter !== "all") && (
            <button
              type="button"
              onClick={() => { setSearch(""); handleSelectRoleFilter("all"); }}
              className="text-xs font-bold text-[#927140] dark:text-[#d4b47d] hover:underline px-2.5 py-2 min-h-[44px] inline-flex items-center flex-shrink-0 cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Dòng phạm vi kết quả */}
        <div className="pt-2 border-t border-[#dedfd4]/60 dark:border-[#354237]/60 flex items-center justify-between text-xs text-[#575e55] dark:text-[#b0b9ac]">
          <span>
            Tìm thấy <strong>{totalCount}</strong> tài khoản phù hợp
          </span>
          <span className="hidden sm:inline">
            Lớp phụ trách tính trong niên khóa <strong>{namHoc}</strong>
          </span>
        </div>
      </div>

      {/* ── NỘI DUNG DANH SÁCH NGƯỜI DÙNG ── */}
      {fetchError ? (
        <div className="bg-[#fffefa] dark:bg-[#1e2821] border border-red-200 dark:border-red-900/50 rounded-3xl p-8 shadow-xs flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#293d32] dark:text-[#ecece0]">
            Không thể tải danh sách người dùng
          </h3>
          <p className="text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac] max-w-sm">
            {fetchError}
          </p>
          <button
            type="button"
            onClick={reloadUsers}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold bg-[#314e3e] text-white hover:bg-[#253d30] dark:bg-[#d6b883] dark:text-[#19251d] transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Thử lại
          </button>
        </div>
      ) : isFetching ? (
        <TableSkeleton rows={8} />
      ) : localUsers.length === 0 ? (
        <div className="bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-3xl p-10 shadow-xs flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#314e3e]/10 dark:bg-[#d6b883]/20 text-[#314e3e] dark:text-[#d6b883] flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#293d32] dark:text-[#ecece0]">
            Không tìm thấy người dùng phù hợp
          </h3>
          <p className="text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac] max-w-xs">
            Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc vai trò hiện tại.
          </p>
          {(search || roleFilter !== "all") && (
            <button
              type="button"
              onClick={() => { setSearch(""); handleSelectRoleFilter("all"); }}
              className="mt-1 px-4 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-[#293d32] dark:text-[#ecece0] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* ============================================================
              A. BẢNG DESKTOP (HIỂN THỊ TRÊN MÀN HÌNH >= 768px)
              ============================================================ */}
          <div className="hidden md:block bg-[#fffefa] dark:bg-[#1e2821] rounded-3xl border border-[#dedfd4] dark:border-[#354237] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3]/80 dark:bg-[#151c18]/80 text-xs font-bold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-wider">
                    <th scope="col" className="py-3.5 px-4 sm:px-6">Người dùng</th>
                    <th scope="col" className="py-3.5 px-4 text-center">Vai trò</th>
                    <th scope="col" className="py-3.5 px-4">Lớp học / Phụ trách</th>
                    <th scope="col" className="py-3.5 px-4 text-center">Trạng thái</th>
                    <th scope="col" className="py-3.5 px-4 sm:px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dedfd4]/60 dark:divide-[#354237]/60 text-xs sm:text-sm">
                  {localUsers.map((u) => {
                    const isSelf = u.username === currentUsername;
                    const assignedClasses = homeroomLopsOf(u.username);
                    const hoTen = u.hoTen || u.username;
                    const displayStatus = getUserDisplayStatus(u, assignedClasses);

                    return (
                      <tr 
                        key={u.username}
                        className="hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors"
                      >
                        {/* Cột 1: Người dùng */}
                        <td className="py-3 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full overflow-hidden border border-black/10 dark:border-white/10 flex-shrink-0 bg-stone-100">
                              <img
                                src={u.avatar || AVATAR_FALLBACK}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={handleAvatarError}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#293d32] dark:text-[#ecece0] break-words">
                                {u.tenThanh && <span className="text-[#575e55] dark:text-[#b0b9ac] font-medium mr-1">{u.tenThanh}</span>}
                                {hoTen}
                                {isSelf && (
                                  <span className="ml-1.5 px-1.5 py-0.5 rounded text-xs font-bold bg-[#314e3e]/10 text-[#314e3e] dark:bg-[#d6b883]/20 dark:text-[#d6b883]">
                                    Bạn
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] font-mono break-all mt-0.5">
                                @{u.username}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Cột 2: Vai trò */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className={`inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${ROLE_BADGE[u.role] || ROLE_BADGE.user}`}>
                            {ROLE_LABELS_VI[u.role] || u.role}
                          </span>
                        </td>

                        {/* Cột 3: Lớp học / Phụ trách */}
                        <td className="py-3 px-4">
                          {u.role === "teacher" ? (
                            assignedClasses.length > 0 ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {assignedClasses.map((lop) => (
                                  <span 
                                    key={lop}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-[#314e3e]/10 text-[#314e3e] dark:bg-[#d6b883]/20 dark:text-[#d6b883]"
                                  >
                                    <School className="w-3 h-3 flex-shrink-0" />
                                    {lop}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-[#575e55]/60 dark:text-[#b0b9ac]/60 font-medium">—</span>
                            )
                          ) : u.role === "student" ? (
                            u.lopHoc ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-300/60 dark:border-sky-800/60">
                                <School className="w-3 h-3 flex-shrink-0" />
                                {u.lopHoc}
                              </span>
                            ) : (
                              <span className="text-xs text-[#575e55]/60 dark:text-[#b0b9ac]/60 font-medium">—</span>
                            )
                          ) : (
                            <span className="text-xs text-[#575e55]/60 dark:text-[#b0b9ac]/60 font-medium">—</span>
                          )}
                        </td>

                        {/* Cột 4: Trạng thái */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadgeClass(displayStatus)}`}>
                            {displayStatus}
                          </span>
                        </td>

                        {/* Cột 5: Thao tác */}
                        <td className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2 justify-end">
                            {/* Chọn đổi vai trò (Mở xác nhận) */}
                            <div className="relative">
                              <select
                                value={u.role}
                                onChange={(e) => initiateRoleChange(u, e.target.value)}
                                className="appearance-none rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] pl-3 pr-8 py-2 min-h-[44px] text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] hover:border-[#314e3e]/40 dark:hover:border-[#d6b883]/40 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#314e3e]"
                                aria-label={`Đổi vai trò của ${hoTen}`}
                              >
                                {ROLE_OPTIONS.map((r) => (
                                  <option key={r} value={r}>
                                    {ROLE_LABELS_VI[r]}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#575e55] dark:text-[#b0b9ac]" aria-hidden="true" />
                            </div>

                            {/* Nút Xóa */}
                            <button
                              type="button"
                              onClick={() => initiateDeleteUser(u)}
                              disabled={isSelf}
                              title={isSelf ? "Không thể tự xóa chính mình" : "Xóa tài khoản"}
                              className="p-2.5 min-h-[44px] min-w-[44px] rounded-xl text-[#575e55] dark:text-[#b0b9ac] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                              aria-label={`Xóa người dùng ${hoTen}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ============================================================
              B. DANH SÁCH CARD MOBILE (HIỂN THỊ TRÊN MÀN HÌNH < 768px)
              ============================================================ */}
          <div className="block md:hidden flex flex-col gap-3">
            {localUsers.map((u) => {
              const isSelf = u.username === currentUsername;
              const assignedClasses = homeroomLopsOf(u.username);
              const hoTen = u.hoTen || u.username;
              const displayStatus = getUserDisplayStatus(u, assignedClasses);

              return (
                <div 
                  key={u.username}
                  className="bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-2xl p-4 shadow-xs flex flex-col gap-3"
                >
                  {/* TẦNG 1: Avatar + Tên Thánh / Họ tên + Username (100% không gian) */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-black/10 dark:border-white/10 flex-shrink-0 bg-stone-100">
                      <img
                        src={u.avatar || AVATAR_FALLBACK}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={handleAvatarError}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-[#293d32] dark:text-[#ecece0] break-words">
                        {u.tenThanh && <span className="text-[#575e55] dark:text-[#b0b9ac] font-medium mr-1">{u.tenThanh}</span>}
                        {hoTen}
                      </p>
                      <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] font-mono break-all mt-0.5">
                        @{u.username}
                      </p>
                    </div>
                  </div>

                  {/* TẦNG 2: Hàng thẻ nhãn metadata riêng biệt ([Vai trò] [Trạng thái] [Lớp học] [Bạn]) */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#dedfd4]/60 dark:border-[#354237]/60">
                    <span className={`inline-block text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${ROLE_BADGE[u.role] || ROLE_BADGE.user}`}>
                      {ROLE_LABELS_VI[u.role] || u.role}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 ${getStatusBadgeClass(displayStatus)}`}>
                      {displayStatus}
                    </span>
                    {u.role === "teacher" && assignedClasses.length > 0 && (
                      assignedClasses.map((lop) => (
                        <span key={lop} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-[#314e3e]/10 text-[#314e3e] dark:bg-[#d6b883]/20 dark:text-[#d6b883] whitespace-nowrap shrink-0">
                          <School className="w-3 h-3 flex-shrink-0" />
                          {lop}
                        </span>
                      ))
                    )}
                    {u.role === "student" && u.lopHoc && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-300/60 dark:border-sky-800/60 whitespace-nowrap shrink-0">
                        <School className="w-3 h-3 flex-shrink-0" />
                        {u.lopHoc}
                      </span>
                    )}
                    {isSelf && (
                      <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-[#314e3e]/10 text-[#314e3e] dark:bg-[#d6b883]/20 dark:text-[#d6b883] whitespace-nowrap shrink-0">
                        Bạn
                      </span>
                    )}
                  </div>

                  {/* TẦNG 3: Thanh nút thao tác mobile (đảm bảo >= 44px) */}
                  <div className="pt-2 border-t border-[#dedfd4]/60 dark:border-[#354237]/60 flex items-center justify-between gap-2.5">
                    {/* Dropdown đổi quyền */}
                    <div className="relative flex-1">
                      <select
                        value={u.role}
                        onChange={(e) => initiateRoleChange(u, e.target.value)}
                        className="w-full appearance-none rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] pl-3 pr-8 py-2 min-h-[44px] text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#314e3e]"
                        aria-label={`Đổi vai trò của ${hoTen}`}
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            Đổi: {ROLE_LABELS_VI[r]}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#575e55] dark:text-[#b0b9ac]" aria-hidden="true" />
                    </div>

                    {/* Nút Xóa mobile */}
                    <button
                      type="button"
                      onClick={() => initiateDeleteUser(u)}
                      disabled={isSelf}
                      className="px-3 py-2 min-h-[44px] rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 hover:bg-red-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ============================================================
              C. THANH PHÂN TRANG (PAGINATION BAR)
              ============================================================ */}
          <div className="bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
            {/* Dòng tóm tắt số lượng bản ghi thông minh */}
            <p className="text-[#575e55] dark:text-[#b0b9ac] font-medium text-center sm:text-left">
              {totalPages <= 1 ? (
                <span>
                  {isFiltered ? "Tìm thấy" : "Tổng cộng"}{" "}
                  <strong className="text-[#293d32] dark:text-[#ecece0] tabular-nums font-bold">
                    {totalCount}
                  </strong>{" "}
                  tài khoản
                </span>
              ) : (
                <>
                  <span className="hidden sm:inline">
                    Hiển thị <strong className="text-[#293d32] dark:text-[#ecece0] tabular-nums font-bold">{recordFrom}–{recordTo}</strong> trong số <strong className="text-[#293d32] dark:text-[#ecece0] tabular-nums font-bold">{totalCount}</strong> tài khoản
                  </span>
                  <span className="inline sm:hidden">
                    Hiển thị <strong className="text-[#293d32] dark:text-[#ecece0] tabular-nums font-bold">{recordFrom}–{recordTo}</strong> / <strong className="text-[#293d32] dark:text-[#ecece0] tabular-nums font-bold">{totalCount}</strong> tài khoản
                  </span>
                </>
              )}
            </p>

            {/* Cụm điều hướng trang (Chỉ hiển thị khi có từ 2 trang trở lên) */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-[#dedfd4]/60 dark:border-[#354237]/60">
                <button
                  type="button"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex-1 sm:flex-initial px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-bold bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-[#293d32] dark:text-[#ecece0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e]"
                  aria-label="Chuyển về trang trước"
                >
                  <ArrowLeft className="w-4 h-4 flex-shrink-0" />
                  <span className="sm:inline">Trước</span>
                </button>

                <div className="px-3 py-1.5 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4]/60 dark:border-[#354237]/60 text-xs font-bold text-[#293d32] dark:text-[#ecece0] tabular-nums shrink-0 whitespace-nowrap text-center">
                  <span className="text-[#575e55] dark:text-[#b0b9ac] font-medium mr-1">Trang</span>
                  {page} / {totalPages}
                </div>

                <button
                  type="button"
                  disabled={page >= totalPages || isFetching}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="flex-1 sm:flex-initial px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-bold bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-[#293d32] dark:text-[#ecece0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e]"
                  aria-label="Chuyển sang trang sau"
                >
                  <span className="sm:inline">Sau</span>
                  <ArrowRight className="w-4 h-4 flex-shrink-0" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL ĐỔI VAI TRÒ (ACCESSIBLE) */}
      <RoleChangeModal
        isOpen={Boolean(pendingRoleChange)}
        pendingChange={pendingRoleChange}
        totalAdmins={roleStats.admin}
        namHoc={namHoc}
        isSaving={isRoleSaving}
        errorMessage={roleError}
        onConfirm={executeRoleUpdate}
        onCancel={() => { if (!isRoleSaving) setPendingRoleChange(null); }}
      />

      {/* MODAL XOÁ TÀI KHOẢN (ACCESSIBLE) */}
      <DeleteUserModal
        key={userToDelete ? userToDelete.username : "none"}
        isOpen={Boolean(userToDelete)}
        user={userToDelete}
        assignedClasses={userToDelete ? homeroomLopsOf(userToDelete.username) : []}
        isSelf={userToDelete?.username === currentUsername}
        isDeleting={isDeleting}
        errorMessage={deleteError}
        onConfirm={executeDeleteUser}
        onCancel={() => { if (!isDeleting) setUserToDelete(null); }}
      />

      {/* MODAL NHẬP DANH SÁCH NGƯỜI DÙNG TỪ EXCEL (.XLSX) */}
      <ExcelImportUsersModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          reloadUsers();
          reloadRoleStats();
          if (loadAll) loadAll();
        }}
        showToast={showToast}
      />
    </div>

  );
}