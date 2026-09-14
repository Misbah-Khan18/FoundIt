import { X, MapPin, Calendar, User, Phone, Mail, Tag } from "lucide-react";
import Badge from "../Badge.jsx";

const TIMELINE_STAGES = [
  { id: "reported", label: "Reported" },
  { id: "pending", label: "Pending Review" },
  { id: "active", label: "Approved" },
  { id: "matched", label: "Potential Match" },
  { id: "claimed", label: "Claimed" },
  { id: "resolved", label: "Returned" },
];

function getStageIndex(status) {
  switch (status) {
    case "pending":
    case "under_review":
      return 1;
    case "active":
    case "approved":
      return 2;
    case "matched":
      return 3;
    case "claimed":
      return 4;
    case "resolved":
    case "returned":
      return 5;
    default:
      return 0;
  }
}

export default function ItemDetailsModal({ item, isOpen, onClose, onApprove, onReject, onMarkFound, onMarkReturned }) {
  if (!isOpen || !item) return null;

  const currentStageIdx = getStageIndex(item.status);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        overflowY: "auto",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "680px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "0",
          borderRadius: "var(--radius-lg, 16px)",
          boxShadow: "var(--shadow-lg)",
          backgroundColor: "#ffffff",
          position: "relative",
          animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-light)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--ivory)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Badge status={item.type} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--slate-500)", fontWeight: 600 }}>
              #{item.id}
            </span>
            <Badge status={item.status || "active"} />
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--slate-500)",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "24px" }}>
          {/* Status Timeline */}
          <div style={{ marginBottom: "26px", padding: "16px", background: "var(--ivory-dim)", borderRadius: "var(--radius-md)" }}>
            <div style={{ fontSize: "0.76rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--navy-900)", marginBottom: "14px" }}>
              Case Resolution Lifecycle
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
              {TIMELINE_STAGES.map((stage, idx) => {
                const isPassed = idx <= currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                return (
                  <div key={stage.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative", zIndex: 2 }}>
                    <div
                      style={{
                        width: isCurrent ? "24px" : "18px",
                        height: isCurrent ? "24px" : "18px",
                        borderRadius: "50%",
                        background: isPassed ? "var(--emerald-600, #10b981)" : "#e2e8f0",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        boxShadow: isCurrent ? "0 0 0 4px rgba(16, 185, 129, 0.25)" : "none",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {isPassed ? "✓" : idx + 1}
                    </div>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: isCurrent ? 700 : 500,
                        color: isCurrent ? "var(--navy-900)" : (isPassed ? "var(--slate-700)" : "var(--slate-400)"),
                        marginTop: "6px",
                        textAlign: "center",
                        lineHeight: 1.2,
                      }}
                    >
                      {stage.label}
                    </span>
                  </div>
                );
              })}
              {/* Connecting line */}
              <div
                style={{
                  position: "absolute",
                  top: "9px",
                  left: "8%",
                  right: "8%",
                  height: "2px",
                  background: "#e2e8f0",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "var(--emerald-600, #10b981)",
                    width: `${(currentStageIdx / (TIMELINE_STAGES.length - 1)) * 100}%`,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Item details */}
          <div style={{ display: "grid", gridTemplateColumns: item.image ? "140px 1fr" : "1fr", gap: "20px", marginBottom: "22px" }}>
            {item.image && (
              <div style={{ width: "100%", height: "140px", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--border-light)" }}>
                <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
            <div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--ink)", margin: "0 0 8px" }}>
                {item.title}
              </h2>
              <p style={{ fontSize: "0.9rem", color: "var(--slate-600)", lineHeight: 1.5, margin: "0 0 14px" }}>
                {item.description || "No specific detailed description provided."}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "0.82rem", color: "var(--slate-500)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Tag size={14} color="var(--blue-500)" /> {item.category || "General"}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <MapPin size={14} color="var(--red-500)" /> {item.location || "Campus"}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Calendar size={14} color="var(--gold-600)" /> {item.date || item.created_at || "Recent"}
                </span>
              </div>
            </div>
          </div>

          {/* Reporter / Contact information */}
          <div style={{ padding: "14px 18px", background: "var(--ivory)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", marginBottom: "24px" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--navy-900)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <User size={14} /> Reporter Information
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", fontSize: "0.85rem" }}>
              <div>
                <span style={{ color: "var(--slate-500)" }}>Name: </span>
                <strong>{item.reporter || "Not available"}</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Mail size={13} color="var(--slate-400)" />
                <span>{item.reporterEmail || "Not available"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Phone size={13} color="var(--slate-400)" />
                <span>{item.reporterPhone || "Not available"}</span>
              </div>
              <div>
                <span style={{ color: "var(--slate-500)" }}>ID: </span>
                <span style={{ fontFamily: "var(--font-mono)" }}>{item.studentId || "Not available"}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "flex-end", borderTop: "1px solid var(--border-light)", paddingTop: "18px" }}>
            {item.status === "under_review" || item.status === "pending" ? (
              <>
                <button className="btn btn--outline btn--sm" onClick={() => { onReject(item.id); onClose(); }} style={{ borderColor: "var(--red-500)", color: "var(--red-500)" }}>
                  Reject Report
                </button>
                <button className="btn btn--emerald btn--sm" onClick={() => { onApprove(item.id); onClose(); }}>
                  ✓ Approve Report
                </button>
              </>
            ) : null}

            {item.type === "lost" && item.status !== "resolved" && (
              <button
                className="btn btn--emerald btn--sm"
                onClick={() => {
                  onMarkFound(item.id);
                  onClose();
                }}
              >
                Mark as Found
              </button>
            )}

            {item.type === "found" && item.status !== "resolved" && (
              <button
                className="btn btn--emerald btn--sm"
                onClick={() => {
                  onMarkReturned(item.id, item.reporter || "Claimant");
                  onClose();
                }}
              >
                Mark as Returned
              </button>
            )}

            <button className="btn btn--outline btn--sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
