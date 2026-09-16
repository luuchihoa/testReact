import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { 
  Save, Edit3, Eye, RotateCcw, Lock,
  User, Cross, Calendar, Users, Droplets, Sparkles, Feather, 
  Phone, MapPin, Church, HeartHandshake 
} from "lucide-react";
import { FieldRow } from "../../../components/ui/StudentShared.jsx";
import { transferDateForView, denormalizeStudent } from "../../../components/ui/studentSharedUtils.js";
import { Spinner } from "../../../components/ui/Skeleton.jsx";
import { isValidVNPhone, isPastOrToday } from "../../account/utils.js";
import { updateStudentProfile } from "../api.js";

const APPLE_EASE = [0.16, 1, 0.3, 1];

function ProfileTab({ student, onSaved, showToast }) {
  const [form, setForm] = useState(student);
  const [prevUsername, setPrevUsername] = useState(student?.username);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [isFullEditMode, setIsFullEditMode] = useState(false);

  const isLocked = Boolean(student?.isProfileLocked);

  if (student?.username !== prevUsername) {
    setPrevUsername(student?.username);
    setForm(student);
    setDirty(false);
    setEditingField(null);
    setIsFullEditMode(false);
  }

  const editField = (field) => (e) => {
    if (isLocked) return;
    e.preventDefault();
    setEditingField(field);
    setTempValue(form[field] ?? "");
  };

  const handleBlur = (field) => {
    if (isLocked) return;
    if (tempValue !== form[field]) setDirty(true);
    setForm((prev) => ({ ...prev, [field]: tempValue }));
    setEditingField(null);
    setTempValue("");
  };

  const handleFieldChange = (field, val) => {
    if (isLocked) return;
    setDirty(true);
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const resetChanges = () => {
    setForm(student);
    setDirty(false);
    setEditingField(null);
  };

  const save = async () => {
    if (isLocked) {
      showToast("Hồ sơ đã bị khóa chỉnh sửa", "warning");
      return;
    }
    if (!form.hoTen || form.hoTen.trim() === "") {
      showToast("Vui lòng nhập Họ và tên", "warning");
      return;
    }
    if (form.sdt && !isValidVNPhone(form.sdt)) {
      showToast("Số điện thoại không hợp lệ", "warning");
      return;
    }
    if (form.ngaySinh && !isPastOrToday(form.ngaySinh)) {
      showToast("Ngày sinh không được ở tương lai", "warning");
      return;
    }

    setSaving(true);
    try {
      const payload = denormalizeStudent(form);
      await updateStudentProfile(student.username, payload);

      showToast("Đã lưu thông tin hồ sơ học sinh!", "success");
      setDirty(false);
      onSaved({ ...form });
    } catch (err) {
      console.error("save profile error:", err);
      showToast("Lưu hồ sơ thất bại: " + (err.message || "Lỗi không xác định"), "error");
    } finally {
      setSaving(false);
    }
  };

  const basicFields = [
    { icon: Cross, label: "Tên Thánh", field: "tenThanh" },
    { icon: User, label: "Họ và tên", field: "hoTen" },
    { icon: Users, label: "Giới tính", field: "gioiTinh", options: ["Nam", "Nữ"] },
    { icon: Calendar, label: "Ngày sinh", field: "ngaySinh", type: "date", displayValue: transferDateForView(form?.ngaySinh) }
  ];

  const sacrementFields = [
    { icon: Droplets, label: "Ngày Rửa Tội", field: "ngayRuaToi", type: "date", displayValue: transferDateForView(form?.ngayRuaToi) },
    { icon: Sparkles, label: "Ngày Rước Lễ", field: "ngayRuocLe", type: "date", displayValue: transferDateForView(form?.ngayRuocLe) },
    { icon: Feather, label: "Ngày Thêm Sức", field: "ngayThemSuc", type: "date", displayValue: transferDateForView(form?.ngayThemSuc) }
  ];

  const contactFields = [
    { icon: Phone, label: "Số điện thoại", field: "sdt" },
    { icon: MapPin, label: "Giáo Xóm", field: "giaoXom" },
    { icon: User, label: "Họ & Tên Cha", field: "tenCha" },
    { icon: User, label: "Họ & Tên Mẹ", field: "tenMe" }
  ];

  const renderField = (r) => (
    <FieldRow
      key={r.field}
      icon={r.icon}
      label={r.label}
      field={r.field}
      value={form?.[r.field]}
      displayValue={r.displayValue}
      type={r.type}
      options={r.options}
      editingField={editingField}
      tempValue={tempValue}
      setTempValue={setTempValue}
      onEdit={isLocked ? undefined : editField(r.field)}
      onBlur={() => handleBlur(r.field)}
    />
  );

  const renderSection = (title, IconComp, fields) => {
    return (
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-[#454f46] dark:text-[#b8c2b4] uppercase tracking-wider flex items-center gap-2">
          <IconComp className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" strokeWidth={2} />
          <span>{title}</span>
        </h4>

        {isFullEditMode && !isLocked ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fields.map((f) => {
              const inputId = `teacher-edit-${f.field}`;
              const Icon = f.icon;
              return (
                <div key={f.field} className="flex flex-col gap-1.5 bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-2xl p-3.5 shadow-xs">
                  <label htmlFor={inputId} className="text-[11px] font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4] flex items-center gap-1.5">
                    {typeof Icon === "function" || (typeof Icon === "object" && Icon !== null) ? (
                      <Icon className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d6b883]" strokeWidth={2} />
                    ) : (
                      <span>{Icon}</span>
                    )}
                    <span>{f.label}</span>
                  </label>
                  {f.options ? (
                    <select
                      id={inputId}
                      value={form[f.field] || ""}
                      onChange={(e) => handleFieldChange(f.field, e.target.value)}
                      className="w-full rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] px-3 py-2 text-[13.5px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 transition-all cursor-pointer shadow-2xs"
                    >
                      <option value="">— Chưa chọn —</option>
                      {f.options.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={inputId}
                      type={f.type || "text"}
                      value={form[f.field] ?? ""}
                      max={f.type === "date" ? new Date().toISOString().slice(0, 10) : undefined}
                      onChange={(e) => handleFieldChange(f.field, e.target.value)}
                      placeholder={`Nhập ${f.label.toLowerCase()}…`}
                      className="w-full rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] px-3 py-2 text-[13.5px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 transition-all shadow-2xs placeholder:text-[#454f46]/40 dark:placeholder:text-[#b8c2b4]/40"
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fields.map(renderField)}
          </div>
        )}
      </div>
    );
  };

  return (
    <Motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.3, ease: APPLE_EASE }} 
      className="flex flex-col pb-6 space-y-6"
    >
      {/* Banner thông báo trạng thái khóa hồ sơ */}
      {isLocked && (
        <Motion.div 
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#927140]/30 dark:border-[#d4b47d]/30 shadow-2xs"
        >
          <div className="w-8 h-8 rounded-xl bg-[#927140]/15 dark:bg-[#d4b47d]/20 text-[#7c5c2d] dark:text-[#d4b47d] flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0]">
                Hồ sơ học sinh đã khóa chỉnh sửa
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#927140]/15 dark:bg-[#d4b47d]/20 text-[#7c5c2d] dark:text-[#d4b47d] border border-[#927140]/30 dark:border-[#d4b47d]/30">
                Chỉ xem
              </span>
            </div>
            <p className="text-[12px] text-[#454f46] dark:text-[#b8c2b4] mt-1 leading-relaxed">
              Dữ liệu hộ tịch và bí tích đã được chốt lưu trữ chính thức
              {student?.profileLockedBy ? ` bởi ${student.profileLockedBy}` : ""}
              {student?.profileLockedAt ? ` (${transferDateForView(student.profileLockedAt)})` : ""}. 
              Bấm nút mở khóa trên thanh công cụ nếu cần điều chỉnh.
            </p>
          </div>
        </Motion.div>
      )}

      {/* Action Header: Toggle Full Edit Mode hoặc Thông báo chỉ xem */}
      <div className="flex items-center justify-between gap-3 px-1 pb-2 border-b border-[#dedfd4]/60 dark:border-[#354237]/60">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2 h-2 rounded-full shrink-0 ${
            isLocked 
              ? 'bg-[#927140] dark:bg-[#d4b47d]' 
              : isFullEditMode 
              ? 'bg-[#927140] dark:bg-[#d4b47d] animate-pulse' 
              : 'bg-[#314e3e] dark:bg-[#d6b883]'
          }`} />
          <span className="text-xs font-bold text-[#454f46] dark:text-[#b8c2b4] truncate">
            {isLocked ? "Hồ sơ cá nhân (Chế độ chỉ đọc)" : isFullEditMode ? "Chế độ sửa toàn bộ form" : "Hồ sơ cá nhân"}
          </span>
        </div>

        {!isLocked && (
          <button
            type="button"
            onClick={() => setIsFullEditMode(!isFullEditMode)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-xs font-bold text-[#293d32] dark:text-[#ecece0] hover:bg-stone-500/10 transition-all shadow-2xs shrink-0 cursor-pointer"
          >
            {isFullEditMode ? (
              <>
                <Eye className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d6b883]" />
                <span>Xem gọn</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d6b883]" />
                <span>Sửa toàn bộ</span>
              </>
            )}
          </button>
        )}
      </div>

      {renderSection("Thông tin cơ bản", User, basicFields)}

      <div className="border-t border-[#dedfd4]/60 dark:border-[#354237]/60" />

      {renderSection("Thông tin Bí tích", Church, sacrementFields)}

      <div className="border-t border-[#dedfd4]/60 dark:border-[#354237]/60" />

      {renderSection("Gia đình & Liên hệ", HeartHandshake, contactFields)}

      {/* Floating Action Bar */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {dirty && !isLocked && (
            <Motion.div 
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-[100] flex justify-center pointer-events-none px-3 sm:px-4"
            >
              <div className="pointer-events-auto bg-[#fffefa]/95 dark:bg-[#1e2821]/95 backdrop-blur-md rounded-2xl sm:rounded-full shadow-xl border border-[#dedfd4] dark:border-[#354237] px-3.5 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between sm:justify-start gap-2 sm:gap-3 max-w-md w-auto">
                <span className="text-xs font-semibold text-[#454f46] dark:text-[#b8c2b4] flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-[#d6b883] animate-pulse shrink-0" />
                  <span className="hidden sm:inline">Có thay đổi chưa lưu</span>
                  <span className="sm:hidden text-[11px] font-bold">Chưa lưu</span>
                </span>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={resetChanges}
                    disabled={saving}
                    className="px-2.5 py-1.5 rounded-xl bg-stone-500/10 hover:bg-stone-500/15 text-xs font-bold text-[#454f46] dark:text-[#b8c2b4] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Hủy</span>
                  </button>

                  <button 
                    type="button" 
                    disabled={saving} 
                    onClick={save}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold bg-[#314e3e] hover:bg-[#263e32] text-white dark:bg-[#d6b883] dark:hover:bg-[#c9a76d] dark:text-[#19251d] shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? <Spinner className="h-3.5 w-3.5" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{saving ? "Đang lưu…" : "Lưu hồ sơ"}</span>
                  </button>
                </div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </Motion.div>
  );
}

export default ProfileTab;
