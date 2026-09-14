import { CheckCircle2, X } from "lucide-react";

export default function MarkFoundModal({ item, isOpen, onClose, onConfirm }) {
  if (!isOpen || !item) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "28px",
          borderRadius: "var(--radius-lg, 16px)",
          boxShadow: "var(--shadow-lg)",
          backgroundColor: "#ffffff",
          textAlign: "center",
          position: "relative",
          animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--slate-400)",
          }}
        >
          <X size={18} />
        </button>

        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "rgba(16, 185, 129, 0.12)",
            color: "var(--emerald-600, #10b981)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <CheckCircle2 size={30} strokeWidth={2.2} />
        </div>

        <h3 style={{ fontSize: "1.24rem", fontWeight: 700, color: "var(--ink)", margin: "0 0 8px" }}>
          Mark this item as found?
        </h3>

        <p style={{ fontSize: "0.9rem", color: "var(--slate-500)", lineHeight: 1.5, margin: "0 0 20px" }}>
          This will update the item's status for <strong>"{item.title}"</strong> (#{item.id}) and remove it from the active lost-item list.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button className="btn btn--outline" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            className="btn btn--emerald"
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
    </div>
  );
}
