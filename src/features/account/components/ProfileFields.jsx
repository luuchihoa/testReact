import React from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Pencil } from "lucide-react";
import { pressable } from "../../../components/ui/variant.jsx";

export function FieldRow({ icon: Icon, label, field, value, displayValue, type = "text", editingField, tempValue, setTempValue, onEdit, onBlur, onCancel, options }) {
  const isEditing = editingField === field;

  const handleKeyDown = (e) => { 
    if (e.key === "Escape") { e.preventDefault(); onCancel?.(); } 
    else if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); } 
  };

  const inputId = `field-${field}`;

  return (
    <div className="flex items-center justify-between bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-2xl px-3.5 sm:px-4 py-3 shadow-xs hover:border-[#314e3e]/30 dark:hover:border-[#d4b47d]/30 transition-colors relative min-w-0">
      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1 z-10">
        <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-[#314e3e]/5 dark:bg-[#d4b47d]/10 flex items-center justify-center text-[#314e3e] dark:text-[#d4b47d] flex-shrink-0">
          {typeof Icon === "function" || (typeof Icon === "object" && Icon !== null) ? (
            <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2} />
          ) : (
            <span className="text-base">{Icon}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <label htmlFor={inputId} className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac] block mb-0.5">
            {label}
          </label>
          
          <div className="relative min-h-[24px] flex items-center min-w-0">
            <AnimatePresence mode="popLayout">
              {!isEditing ? (
                <Motion.div
                  key="display"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="text-[13.5px] sm:text-[14px] md:text-[15px] font-bold text-[#293d32] dark:text-[#ecece0] truncate w-full"
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
                  className="w-full min-w-0"
                >
                  {options ? (
                    <select
                      id={inputId}
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onBlur={onBlur}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      className="px-2.5 py-1 rounded-lg border border-[#314e3e] dark:border-[#d4b47d] text-[13.5px] sm:text-[14px] font-bold bg-[#faf8f3] dark:bg-[#151c18] focus:outline-none focus:ring-2 focus:ring-[#314e3e]/20 dark:focus:ring-[#d4b47d]/20 text-[#293d32] dark:text-[#ecece0] w-full min-w-0 max-w-full"
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
                      className="px-2.5 py-1 rounded-lg border border-[#314e3e] dark:border-[#d4b47d] text-[13.5px] sm:text-[14px] font-bold bg-[#faf8f3] dark:bg-[#151c18] focus:outline-none focus:ring-2 focus:ring-[#314e3e]/20 dark:focus:ring-[#d4b47d]/20 w-full min-w-0 max-w-full text-[#293d32] dark:text-[#ecece0]"
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
            className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-stone-500/10 hover:bg-[#314e3e]/10 dark:bg-stone-400/10 dark:hover:bg-[#d4b47d]/20 flex items-center justify-center transition-colors text-[#575e55] hover:text-[#314e3e] dark:text-[#b0b9ac] dark:hover:text-[#d4b47d] ml-1.5 sm:ml-2 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
          </Motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      {[1, 2].map((section) => (
        <div key={section}>
          <div className="h-4 w-32 bg-[#dedfd4]/60 dark:bg-[#354237]/60 rounded mb-3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3.5 bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] px-4 py-3.5 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-[#dedfd4]/60 dark:bg-[#354237]/60 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-2.5 w-16 rounded bg-[#dedfd4]/60 dark:bg-[#354237]/60 mb-2" />
                  <div className="h-4 w-28 rounded bg-[#dedfd4]/60 dark:bg-[#354237]/60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
