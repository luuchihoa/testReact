import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const ToastContext = createContext(null);

const VARIANTS = {
  success: { bg: "#F0FDF4", border: "#34C759", iconBg: "#34C759", text: "#166534", icon: "✓" },
  error:   { bg: "#FFF1F0", border: "#FF3B30", iconBg: "#FF3B30", text: "#7F1D1D", icon: "✕" },
  warning: { bg: "#FFFBEB", border: "#FF9500", iconBg: "#FF9500", text: "#78350F", icon: "!" },
  info:    { bg: "#FFF7F4", border: "#FF6B35", iconBg: "#FF6B35", text: "#7C2D12", icon: "i" },
};

const ANIM_MS = 260;

let _counter = 0;
const genId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `toast_${Date.now()}_${++_counter}`;

// Inject keyframes một lần duy nhất — idempotent
const injectKeyframes = (() => {
  let done = false;
  return () => {
    if (done) return;
    done = true;
    const s = document.createElement("style");
    s.textContent = `
      @keyframes _tin  { from { opacity:0; transform:translateY(10px) scale(.96) } to { opacity:1; transform:none } }
      @keyframes _tout { from { opacity:1; transform:none } to { opacity:0; transform:translateY(6px) scale(.97) } }
    `;
    document.head.appendChild(s);
  };
})();

function ToastItem({ toast, onRemove }) {
  const v = VARIANTS[toast.type] ?? VARIANTS.info;
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);

  // Fix #2 & #4: dismiss dùng chung — trigger exit animation, rồi mới xóa
  const dismiss = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    clearTimeout(timerRef.current);
    setTimeout(() => onRemove(toast.id), ANIM_MS);
  }, [exiting, onRemove, toast.id]);

  // Fix #5: cleanup timeout khi unmount
  useEffect(() => {
    injectKeyframes(); // Fix #1: inject keyframes thật thay vì class Tailwind
    timerRef.current = setTimeout(dismiss, toast.duration);
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display:       "flex",
        alignItems:    "flex-start",
        gap:           "10px",
        padding:       "11px 14px",
        borderRadius:  "14px",
        background:    v.bg,
        border:        `1.5px solid ${v.border}`,
        boxShadow:     "0 4px 16px rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.05)",
        minWidth:      "240px",
        maxWidth:      "320px",
        pointerEvents: "auto",
        // Fix #1 & #2: animation thật, có cả enter lẫn exit
        animation:     exiting
          ? `_tout ${ANIM_MS}ms cubic-bezier(.4,0,1,1) forwards`
          : `_tin  ${ANIM_MS}ms cubic-bezier(0,.9,.6,1) forwards`,
      }}
    >
      {/* Icon badge */}
      <span style={{
        flexShrink: 0, width: "20px", height: "20px",
        borderRadius: "50%", background: v.iconBg, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "11px", fontWeight: 700, marginTop: "1px",
      }}>
        {v.icon}
      </span>

      {/* Message */}
      <span style={{ flex: 1, fontSize: "14px", fontWeight: 500, color: v.text, lineHeight: 1.45 }}>
        {toast.message}
      </span>

      {/* Fix #4: nút đóng tay */}
      <button
        onClick={dismiss}
        aria-label="Đóng thông báo"
        style={{
          flexShrink: 0, background: "none", border: "none", cursor: "pointer",
          padding: "1px 3px", borderRadius: "5px", color: v.text,
          opacity: 0.4, fontSize: "15px", lineHeight: 1, marginTop: "1px",
          transition: "opacity .15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = ".85")}
        onMouseLeave={e => (e.currentTarget.style.opacity = ".4")}
      >
        ✕
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fix #3: genId() thay vì Date.now()
  const showToast = useCallback((message, type = "info", duration = 3500) => {
    setToasts(prev => [...prev, { id: genId(), message, type, duration }]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Container: bottom-right, click-through vùng trống, Fix #6 màu khớp design system */}
      <div
        aria-label="Thông báo"
        style={{
          position: "fixed", top: "24px", right: "20px", zIndex: 9999,
          display: "flex", flexDirection: "column", gap: "10px",
          alignItems: "flex-end", pointerEvents: "none",
        }}
      >
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}