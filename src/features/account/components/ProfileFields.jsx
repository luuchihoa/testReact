import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pressable } from "../../../components/ui/variant.jsx";

export function FieldRow({ icon, label, field, value, displayValue, type = "text", editingField, tempValue, setTempValue, onEdit, onBlur, onCancel, options }) {
  const isEditing = editingField === field;

  const handleKeyDown = (e) => { 
    if (e.key === "Escape") { e.preventDefault(); onCancel?.(); } 
    else if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); } 
  };

  return (
    <div className="flex items-center justify-between bg-white/60 dark:bg-stone-800/40 backdrop-blur-sm border border-amber-900/10 dark:border-amber-100/10 rounded-2xl px-4 py-3.5 shadow-sm overflow-hidden relative">
      <div className="flex items-center gap-3.5 min-w-0 w-full z-10">
        <span className="text-xl flex-shrink-0 opacity-90">{icon}</span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-0.5">{label}</div>
          
          <div className="relative h-[24px]">
            <AnimatePresence mode="popLayout">
              {!isEditing ? (
                <motion.div
                  key="display"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 text-[15px] font-bold text-amber-950 dark:text-amber-50 truncate"
                >
                  {displayValue ?? value ?? "—"}
                </motion.div>
              ) : (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 -top-1"
                >
                  {options ? (
                    <select
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onBlur={onBlur}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      className="px-2.5 py-1 rounded-lg border border-amber-900/20 dark:border-amber-100/20 text-[14px] font-bold bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-900/30 dark:focus:ring-amber-500/30 text-amber-950 dark:text-amber-50 w-full"
                    >
                      {options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={type}
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onBlur={onBlur}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      max={type === "date" ? new Date().toISOString().slice(0, 10) : undefined}
                      className="px-2.5 py-1 rounded-lg border border-amber-900/20 dark:border-amber-100/20 text-[14px] font-bold bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-900/30 dark:focus:ring-amber-500/30 w-full text-amber-950 dark:text-amber-50"
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {!isEditing && (
          <motion.button
            key="edit-btn"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            {...pressable(1.15)}
            onClick={onEdit}
            className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-amber-900/5 hover:bg-amber-900/10 dark:bg-amber-100/5 dark:hover:bg-amber-100/10 flex items-center justify-center text-[13px] transition-colors text-amber-800 dark:text-amber-400 ml-2"
          >
            ✏️
          </motion.button>
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
          <div className="h-4 w-32 bg-stone-200/60 dark:bg-stone-700/60 rounded mb-3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3.5 bg-white/60 dark:bg-stone-800/40 rounded-2xl border border-amber-900/10 dark:border-amber-100/10 px-4 py-3.5 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-stone-200/60 dark:bg-stone-700/60 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-2 w-16 rounded bg-stone-200/60 dark:bg-stone-700/60 mb-2.5" />
                  <div className="h-3.5 w-28 rounded bg-stone-200/60 dark:bg-stone-700/60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
