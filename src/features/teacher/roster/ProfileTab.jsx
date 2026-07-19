import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../lib/supabase.js";
import { FieldRow, transferDateForView, denormalizeStudent } from "../../../components/ui/StudentShared.jsx";
import { Spinner } from "../../../components/ui/Skeleton.jsx";

const APPLE_EASE = [0.16, 1, 0.3, 1];

function ProfileTab({ student, onSaved, showToast }) {
  const [form,         setForm]         = useState(student);
  const [editingField, setEditingField] = useState(null);
  const [tempValue,    setTempValue]    = useState("");
  const [saving,       setSaving]       = useState(false);
  const [dirty,        setDirty]        = useState(false);

  useEffect(() => { setForm(student); setDirty(false); setEditingField(null); }, [student.username]);

  const editField = (field) => (e) => {
    e.preventDefault();
    setEditingField(field);
    setTempValue(form[field] ?? "");
  };

  const handleBlur = (field) => {
    if (tempValue !== form[field]) setDirty(true);
    setForm((prev) => ({ ...prev, [field]: tempValue }));
    setEditingField(null);
    setTempValue("");
  };

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
      onEdit={editField(r.field)}
      onBlur={() => handleBlur(r.field)}
    />
  );

  const save = async () => {
    // Validation
    if (!form.hoTen || form.hoTen.trim() === "") {
      showToast("Vui lòng nhập Họ và tên", "warning");
      return;
    }
    if (form.sdt && !/^[0-9+\s]+$/.test(form.sdt)) {
      showToast("Số điện thoại không hợp lệ", "warning");
      return;
    }

    setSaving(true);
    try {
      const payload = denormalizeStudent(form);
      const { error } = await supabase.from("users").update(payload).eq("username", student.username);
      if (error) throw error;

      showToast("Đã lưu hồ sơ học sinh", "success");
      setDirty(false);
      onSaved({ ...form });
    } catch (err) {
      console.error("save profile error:", err);
      showToast("Lưu hồ sơ thất bại", "error");
    } finally {
      setSaving(false);
    }
  };

  const renderSection = (title, icon, fields) => {
    return (
      <div className="mb-6 bg-white/80 dark:bg-stone-800/40 backdrop-blur-sm rounded-[24px] border border-amber-900/10 dark:border-amber-100/10 p-5 shadow-sm">
        <h3 className="text-[14px] font-bold text-amber-950 dark:text-amber-50 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>{icon}</span> {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(renderField)}
        </div>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: APPLE_EASE }} className="flex flex-col">
      {renderSection("Thông tin cơ bản", "📋", [
        { icon: "✝️", label: "Tên Thánh", field: "tenThanh" },
        { icon: "👤", label: "Họ và tên", field: "hoTen" },
        { icon: "⚧️", label: "Giới tính", field: "gioiTinh", options: ["Nam", "Nữ"] },
        { icon: "🎂", label: "Ngày sinh", field: "ngaySinh", type: "date", displayValue: transferDateForView(form?.ngaySinh) }
      ])}

      {renderSection("Thông tin Bí tích", "⛪", [
        { icon: "💦", label: "Ngày Rửa Tội", field: "ngayRuaToi", type: "date", displayValue: transferDateForView(form?.ngayRuaToi) },
        { icon: "🫓", label: "Ngày Rước Lễ", field: "ngayRuocLe", type: "date", displayValue: transferDateForView(form?.ngayRuocLe) },
        { icon: "🕊️", label: "Ngày Thêm Sức", field: "ngayThemSuc", type: "date", displayValue: transferDateForView(form?.ngayThemSuc) }
      ])}

      {renderSection("Gia đình & Liên hệ", "👨‍👩‍👧‍👦", [
        { icon: "📞", label: "Số điện thoại", field: "sdt" },
        { icon: "🏠", label: "Giáo Xóm", field: "giaoXom" },
        { icon: "👨🏻", label: "Họ & Tên Cha", field: "tenCha" },
        { icon: "👩🏻", label: "Họ & Tên Mẹ", field: "tenMe" }
      ])}

      {/* Floating Action Bar */}
      {createPortal(
        <AnimatePresence>
          {dirty && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed bottom-6 left-0 right-0 z-[100] flex justify-center pointer-events-none px-4"
            >
              <div className="pointer-events-auto bg-white/90 dark:bg-stone-800/90 backdrop-blur-xl rounded-full shadow-2xl border border-amber-900/10 dark:border-amber-100/10 px-4 py-3 flex items-center gap-4">
                <span className="text-[13px] font-bold text-stone-600 dark:text-stone-300 ml-2">Bạn có thay đổi chưa lưu</span>
                <button type="button" disabled={saving} onClick={save}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-[14px] font-bold bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-md transition-all duration-300 active:scale-[0.98] hover:opacity-90 disabled:opacity-40">
                  {saving && <Spinner className="h-4 w-4" />}
                  {saving ? "Đang lưu…" : "💾 Lưu thay đổi"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
}

export default ProfileTab;
