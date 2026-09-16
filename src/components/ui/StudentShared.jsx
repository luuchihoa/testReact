import React, { useEffect } from "react";
import { AlertTriangle, Pencil } from "lucide-react";
import { pressable } from "./variant.jsx";
import { motion as Motion, AnimatePresence } from "framer-motion";

// Hằng số Easing chuyển động chuẩn hệ thống Apple HIG
const APPLE_EASE = [0.16, 1, 0.3, 1];

// ============================================================
//  SUB-COMPONENTS
// ============================================================

export function StatCard({ label, value, colorClass = "text-[#293d32] dark:text-[#ecece0]" }) {
  return (
    <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] shadow-xs p-4 sm:p-5 transition-all">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4] mb-1.5">{label}</p>
      <p className={`text-[22px] sm:text-[24px] font-extrabold font-mono ${colorClass}`}>{value ?? "—"}</p>
    </div>
  );
}

export function ScoreCell({ label, value }) {
  return (
    <div className="bg-[#faf8f3] dark:bg-[#151c18] rounded-xl px-3 py-3 text-center flex-1 min-w-[64px] border border-[#dedfd4] dark:border-[#354237] shadow-xs">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4] mb-1">{label}</p>
      <p className="text-[15px] font-bold font-mono text-[#293d32] dark:text-[#ecece0]">{value ?? "—"}</p>
    </div>
  );
}

export function FieldRow({ icon: Icon, label, field, value, displayValue, type = "text", editingField, tempValue, setTempValue, onEdit, onBlur, onCancel, options }) {
  const isEditing = editingField === field;

  const handleKeyDown = (e) => { 
    if (e.key === "Escape") { e.preventDefault(); onCancel?.(); } 
    else if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); } 
  };

  const inputId = `teacher-field-${field}`;

  return (
    <div className="flex items-center justify-between bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-2xl px-3.5 sm:px-4 py-3 shadow-xs hover:border-[#314e3e]/30 dark:hover:border-[#d6b883]/30 transition-colors relative min-w-0">
      <div className="flex items-center gap-3.5 min-w-0 w-full z-10">
        <div className="w-9 h-9 rounded-xl bg-[#314e3e]/5 dark:bg-[#d6b883]/10 flex items-center justify-center text-[#314e3e] dark:text-[#d6b883] flex-shrink-0">
          {typeof Icon === "function" || (typeof Icon === "object" && Icon !== null) ? (
            <Icon className="w-4.5 h-4.5" strokeWidth={2} />
          ) : (
            <span className="text-base">{Icon}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <label htmlFor={inputId} className="text-[11px] font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4] block mb-0.5">
            {label}
          </label>
          
          <div className="relative min-h-[24px] flex items-center">
            <AnimatePresence mode="popLayout">
              {!isEditing ? (
                <Motion.div
                  key="display"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="text-[14px] md:text-[15px] font-bold text-[#293d32] dark:text-[#ecece0] truncate w-full"
                >
                  {displayValue ?? value ?? "—"}
                </Motion.div>
              ) : (
                <Motion.div
                  key="edit"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="w-full"
                >
                  {options ? (
                    <select
                      id={inputId}
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onBlur={onBlur}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      className="px-2.5 py-1 rounded-lg border border-[#314e3e] dark:border-[#d6b883] text-[14px] font-bold bg-[#fffefa] dark:bg-[#1e2821] focus:outline-none focus:ring-2 focus:ring-[#314e3e]/20 dark:focus:ring-[#d6b883]/20 text-[#293d32] dark:text-[#ecece0] w-full"
                    >
                      {options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      id={inputId}
                      type={type}
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onBlur={onBlur}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      max={type === "date" ? new Date().toISOString().slice(0, 10) : undefined}
                      className="px-2.5 py-1 rounded-lg border border-[#314e3e] dark:border-[#d6b883] text-[14px] font-bold bg-[#fffefa] dark:bg-[#1e2821] focus:outline-none focus:ring-2 focus:ring-[#314e3e]/20 dark:focus:ring-[#d6b883]/20 w-full text-[#293d32] dark:text-[#ecece0]"
                    />
                  )}
                </Motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {!isEditing && onEdit && (
          <Motion.button
            key="edit-btn"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            {...pressable(1.1)}
            onClick={onEdit}
            aria-label={`Chỉnh sửa ${label}`}
            className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-stone-500/10 hover:bg-[#314e3e]/10 dark:bg-stone-400/10 dark:hover:bg-[#d6b883]/20 flex items-center justify-center transition-colors text-[#454f46] hover:text-[#314e3e] dark:text-[#b8c2b4] dark:hover:text-[#d6b883] ml-2 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
          </Motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
//  CONFIRM DIALOG (Đồng bộ Kem–Xanh & WCAG AAA)
// ============================================================
export function ConfirmDialog({ 
  open, 
  title, 
  message, 
  children,
  icon: IconComponent = AlertTriangle,
  confirmLabel = "Xác nhận", 
  cancelLabel = "Hủy",
  danger = false, 
  loading = false,
  onConfirm, 
  onCancel 
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && !loading && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-5">
          <Motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: APPLE_EASE }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs" 
            onClick={() => !loading && onCancel()} 
          />
          
          <Motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: APPLE_EASE }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[94vw] sm:max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] shadow-2xl p-4 sm:p-5 flex flex-col gap-3.5"
            data-lenis-prevent
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-xs border shrink-0 ${
                danger ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20"
                       : IconComponent === AlertTriangle
                       ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                       : "bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] border-[#314e3e]/20 dark:border-[#d6b883]/30"
              }`}>
                <IconComponent className="w-4.5 h-4.5 sm:w-5 sm:h-5" strokeWidth={2.2} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-[15px] sm:text-[16px] font-bold text-[#293d32] dark:text-[#ecece0] leading-tight truncate">
                  {title}
                </h4>
                {message && (
                  <p className="text-[12px] sm:text-[12.5px] font-medium text-[#454f46] dark:text-[#b8c2b4] mt-0.5 leading-snug truncate sm:whitespace-normal">
                    {message}
                  </p>
                )}
              </div>
            </div>

            {children && (
              <div className="w-full">
                {children}
              </div>
            )}

            <div className="flex flex-row gap-2 mt-0.5 pt-1">
              <button 
                type="button" 
                disabled={loading}
                onClick={onCancel}
                className="flex-1 px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-[13px] font-bold text-[#454f46] dark:text-[#b8c2b4] bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] hover:bg-stone-500/10 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button 
                type="button" 
                disabled={loading}
                onClick={onConfirm}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-[13px] font-bold text-white transition-all shadow-xs active:scale-98 cursor-pointer disabled:opacity-50 ${
                  danger ? "bg-red-600 hover:bg-red-700" 
                         : "bg-[#314e3e] hover:bg-[#263e32] dark:bg-[#d6b883] dark:hover:bg-[#c9a76d] dark:text-[#19251d]"
                }`}
              >
                {loading ? (
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : null}
                <span>{confirmLabel}</span>
              </button>
            </div>
          </Motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}