import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, X } from "lucide-react";

export default function MarkFoundModal({ item, isOpen, onClose, onConfirm }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 25px 60px -15px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(139, 92, 246, 0.15)",
          backgroundColor: "#ffffff",
          border: "1px solid rgba(139, 92, 246, 0.2)",
          textAlign: "center",
          position: "relative",
          animation: "modalFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "#f8f9fe",
            border: "1px solid rgba(139, 92, 246, 0.18)",
            borderRadius: "8px",
            padding: "6px",
            cursor: "pointer",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#ede9fe";
            e.currentTarget.style.color = "#5b21b6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#f8f9fe";
            e.currentTarget.style.color = "#64748b";
          }}
        >
          <X size={18} />
        </button>

        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "#ecfdf5",
            border: "1.5px solid #a7f3d0",
            color: "#059669",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px",
            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.2)",
          }}
        >
          <CheckCircle2 size={32} strokeWidth={2.2} />
        </div>

        <h3 style={{ fontSize: "1.32rem", fontWeight: 800, color: "#0f172a", margin: "0 0 10px" }}>
          Mark this item as found?
        </h3>

        <p style={{ fontSize: "0.92rem", color: "#475569", lineHeight: 1.55, margin: "0 0 24px" }}>
          This will update the item's status for{" "}
          <strong style={{ color: "#0f172a" }}>"{item.title}"</strong> (#{item.id}) and remove it from the active lost-item list.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button className="btn btn--outline" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            className="btn btn--primary"
            style={{ flex: 1 }}
            onClick={() => {
              onConfirm(item.id);
              onClose();
            }}
          >
            Confirm &amp; Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
