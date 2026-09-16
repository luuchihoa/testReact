import React, { useState, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { X, User, BookOpen, Camera, Printer, ArrowLeft, Lock, Unlock } from "lucide-react";
import { useToast } from "../../../components/ui/ToastContext.jsx";
import { ConfirmDialog } from "../../../components/ui/StudentShared.jsx";
import { resizeImage } from "../../account/utils.js";
import { uploadStudentAvatarForTeacher, toggleStudentProfileLock } from "../api.js";
import { useTeacherContext } from "../TeacherContext.jsx";
import ProfileTab from "./ProfileTab.jsx";
import AcademicTab from "./AcademicTab.jsx";

const APPLE_EASE = [0.16, 1, 0.3, 1];
const SLIDE_VARIANTS = {
  initial: (direction) => ({ x: direction > 0 ? 20 : -20, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction < 0 ? 20 : -20, opacity: 0 }),
};

function StudentEditPanel({ student, namHoc, lop, onClose, onSaved }) {
  const { showToast } = useToast();
  const { teacherUsername } = useTeacherContext();
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [locking, setLocking] = useState(false);
  const [tab, setTab] = useState("profile"); // profile | academic
  const [[_page, direction], setPage] = useState([0, 0]);

  const TABS = ["profile", "academic"];
  const handleTabChange = (tId) => {
    if (tId === tab) return;
    const newIdx = TABS.indexOf(tId);
    const oldIdx = TABS.indexOf(tab);
    setTab(tId);
    setPage([newIdx, newIdx > oldIdx ? 1 : -1]);
  };

  const handleToggleLock = async () => {
    setLocking(true);
    const nextLocked = !student?.isProfileLocked;
    try {
      await toggleStudentProfileLock(student.username, nextLocked, teacherUsername);
      const updated = {
        ...student,
        isProfileLocked: nextLocked,
        profileLockedBy: nextLocked ? (teacherUsername || "Giáo lý viên") : null,
        profileLockedAt: nextLocked ? new Date().toISOString() : null,
      };
      showToast(nextLocked ? "Đã khóa chỉnh sửa hồ sơ học sinh" : "Đã mở khóa chỉnh sửa hồ sơ học sinh", "success");
      onSaved?.(updated);
      setShowLockConfirm(false);
    } catch (err) {
      console.error("Toggle profile lock error:", err);
      showToast("Không thể thay đổi trạng thái khóa: " + (err.message || ""), "error");
    } finally {
      setLocking(false);
    }
  };

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Chỉ hỗ trợ file hình ảnh", "warning");
      e.target.value = "";
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast("Dung lượng ảnh tối đa 8MB", "warning");
      e.target.value = "";
      return;
    }

    setUploadingAvatar(true);
    try {
      const { blob: resizedBlob, ext } = await resizeImage(file);
      const newAvatarUrl = await uploadStudentAvatarForTeacher(student.username, resizedBlob, ext);
      showToast("Đã cập nhật ảnh đại diện học sinh!", "success");
      onSaved?.({ ...student, avatar: newAvatarUrl });
    } catch (err) {
      console.error("Upload student avatar error:", err);
      showToast("Không thể tải lên ảnh đại diện: " + (err.message || ""), "error");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-3xl border-x-0 border-t-0 sm:border-t border-b sm:border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] shadow-none sm:shadow-xs p-4 sm:p-6 lg:p-8 relative min-w-0">
      
      {/* Top Actions Bar */}
      <div className="flex items-center justify-between gap-2 mb-4 md:mb-6">
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#454f46] dark:text-[#b8c2b4] hover:text-[#293d32] dark:hover:text-[#ecece0] bg-stone-500/10 hover:bg-stone-500/15 transition-colors active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Danh sách</span>
        </button>
        <div className="hidden lg:block" />

        <div className="flex items-center gap-1.5">
          {/* Nút Khóa / Mở khóa hồ sơ */}
          <button
            type="button"
            onClick={() => setShowLockConfirm(true)}
            disabled={locking}
            aria-label={student?.isProfileLocked ? "Mở khóa chỉnh sửa hồ sơ" : "Khóa chỉnh sửa hồ sơ"}
            title={student?.isProfileLocked ? "Hồ sơ đang khóa. Bấm để mở khóa" : "Khóa chỉnh sửa hồ sơ học sinh"}
            className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center transition-colors cursor-pointer active:scale-95 ${
              student?.isProfileLocked 
                ? "bg-[#927140]/15 dark:bg-[#d4b47d]/20 text-[#7c5c2d] dark:text-[#d4b47d] border border-[#927140]/30 dark:border-[#d4b47d]/30"
                : "bg-stone-500/10 hover:bg-[#314e3e]/10 dark:bg-stone-400/10 dark:hover:bg-[#d6b883]/20 text-[#454f46] hover:text-[#314e3e] dark:text-[#b8c2b4] dark:hover:text-[#d6b883]"
            }`}
          >
            {student?.isProfileLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            aria-label="In phiếu học sinh"
            title="In phiếu học sinh"
            className="w-8.5 h-8.5 rounded-xl bg-stone-500/10 hover:bg-[#314e3e]/10 dark:bg-stone-400/10 dark:hover:bg-[#d6b883]/20 text-[#454f46] hover:text-[#314e3e] dark:text-[#b8c2b4] dark:hover:text-[#d6b883] flex items-center justify-center transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng chi tiết học sinh"
            title="Đóng chi tiết học sinh"
            className="w-8.5 h-8.5 rounded-xl bg-stone-500/10 hover:bg-stone-500/15 dark:bg-stone-400/10 dark:hover:bg-stone-400/20 text-[#454f46] dark:text-[#b8c2b4] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Profile: Avatar & Tên hiển thị đầy đủ, rõ ràng */}
      <div className="flex flex-col items-center gap-3.5 mb-6 text-center">
        <div className="relative">
          <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-[#faf8f3] dark:ring-[#151c18] shadow-sm border border-[#dedfd4] dark:border-[#354237] bg-stone-100 dark:bg-stone-800 ${
            uploadingAvatar ? "opacity-70" : ""
          }`}>
            <img
              src={student.avatar || "/images/avatarDefault.avif"}
              alt={student.hoTen || "Ảnh đại diện học sinh"}
              className="w-full h-full object-cover"
            />
            {uploadingAvatar && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                <div className="w-8 h-8 border-[3px] border-[#d6b883] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            aria-label="Đổi ảnh đại diện học sinh"
            title="Đổi ảnh đại diện học sinh"
            className="absolute bottom-0 right-0 w-8.5 h-8.5 rounded-full shadow-md flex items-center justify-center border-2 border-[#faf8f3] dark:border-[#151c18] bg-[#314e3e] hover:bg-[#253d30] dark:bg-[#d6b883] dark:hover:bg-[#c4a671] text-white dark:text-[#19251d] active:scale-90 transition-all cursor-pointer disabled:opacity-50"
          >
            <Camera className="w-4 h-4" strokeWidth={2.2} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            hidden
            onChange={handleAvatarFile}
          />
        </div>

        <div className="min-w-0 max-w-full px-2">
          <h3 className="text-[20px] sm:text-[22px] font-bold text-[#293d32] dark:text-[#ecece0] leading-tight">
            {student.tenThanh ? `${student.tenThanh} ` : ""}{student.hoTen || student.username}
          </h3>
        </div>

        {/* Tab Switcher - Pill style giống /tài-khoản */}
        <div className="relative w-full max-w-xs sm:max-w-sm rounded-2xl bg-[#dedfd4]/40 dark:bg-[#354237]/50 p-1 select-none border border-[#dedfd4] dark:border-[#354237] mt-1">
          <div className="grid grid-cols-2 gap-1 w-full text-xs sm:text-[13px] font-bold">
            {[
              { id: "profile", label: "Hồ sơ cá nhân", mobileLabel: "Hồ sơ", Icon: User },
              { id: "academic", label: "Kết quả học tập", mobileLabel: "Học tập", Icon: BookOpen }
            ].map((t) => {
              const isActive = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTabChange(t.id)}
                  className={`relative flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-xl transition-colors duration-200 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "text-[#314e3e] dark:text-[#d4b47d]"
                      : "text-[#454f46] dark:text-[#b8c2b4] hover:text-[#293d32] dark:hover:text-[#ecece0]"
                  }`}
                >
                  {isActive && (
                    <Motion.span
                      layoutId="studentDetailActiveTabIndicator"
                      className="absolute inset-0 rounded-xl bg-white dark:bg-[#1e2821] shadow-xs border border-[#dedfd4] dark:border-[#354237]"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  <t.Icon className="relative z-10 w-3.5 h-3.5 shrink-0" />
                  <span className="relative z-10 truncate hidden sm:inline">{t.label}</span>
                  <span className="relative z-10 truncate sm:hidden">{t.mobileLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="w-full min-w-0 pt-2">
        <AnimatePresence mode="wait" custom={direction}>
          <Motion.div
            key={tab}
            custom={direction}
            variants={SLIDE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: APPLE_EASE }}
          >
            {tab === "profile" && <ProfileTab student={student} onSaved={onSaved} showToast={showToast} />}
            {tab === "academic" && <AcademicTab student={student} namHoc={namHoc} lop={lop} showToast={showToast} />}
          </Motion.div>
        </AnimatePresence>
      </div>

      {/* Modal xác nhận Khóa / Mở khóa hồ sơ */}
      <ConfirmDialog
        open={showLockConfirm}
        onCancel={() => setShowLockConfirm(false)}
        onConfirm={handleToggleLock}
        busy={locking}
        title={student?.isProfileLocked ? "Mở khóa chỉnh sửa hồ sơ?" : "Khóa chỉnh sửa hồ sơ?"}
        message={
          student?.isProfileLocked
            ? `Bạn có chắc chắn muốn mở khóa chỉnh sửa hồ sơ cho học sinh "${student.hoTen || student.username}"?`
            : `Bạn có chắc chắn muốn khóa chỉnh sửa hồ sơ cho học sinh "${student.hoTen || student.username}"? Sau khi khóa, thông tin hộ tịch và bí tích sẽ được bảo vệ và không thể tự ý sửa đổi.`
        }
        confirmLabel={student?.isProfileLocked ? "Mở khóa" : "Khóa hồ sơ"}
        icon={student?.isProfileLocked ? Unlock : Lock}
        iconBg={student?.isProfileLocked ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300" : "bg-amber-500/15 text-amber-800 dark:text-amber-300"}
      />
    </div>
  );
}

export default StudentEditPanel;
