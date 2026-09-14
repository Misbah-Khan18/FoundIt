import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { useAdmin } from "../../context/AdminContext.jsx";

export default function ToastContainer() {
  const { toasts, removeToast } = useAdmin();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 1100,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "380px",
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => {
        const isError = toast.tone === "error";
        const isInfo = toast.tone === "info";
        const bg = isError ? "#fef2f2" : (isInfo ? "#eff6ff" : "#f0fdf4");
        const border = isError ? "#fca5a5" : (isInfo ? "#93c5fd" : "#86efac");
        const color = isError ? "var(--red-500, #d21f2b)" : (isInfo ? "var(--blue-500, #3459a3)" : "var(--emerald-600, #10b981)");

        return (
          <div
            key={toast.id}
            style={{
              pointerEvents: "auto",
              padding: "12px 16px",
              background: bg,
              border: `1px solid ${border}`,
              borderRadius: "var(--radius-md, 10px)",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              animation: "toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {isError ? (
              <AlertTriangle size={18} color={color} style={{ flexShrink: 0 }} />
            ) : isInfo ? (
              <Info size={18} color={color} style={{ flexShrink: 0 }} />
            ) : (
              <CheckCircle2 size={18} color={color} style={{ flexShrink: 0 }} />
            )}
            <span style={{ fontSize: "0.86rem", fontWeight: 600, color: "var(--ink)", flex: 1, lineHeight: 1.4 }}>
              {toast.message}
            </span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                color: "var(--slate-400)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
