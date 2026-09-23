import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { X, MapPin, Calendar, User, Phone, Mail, Tag, ExternalLink } from "lucide-react";
import Badge from "../Badge.jsx";
import { API_BASE_URL } from "../../context/AuthContext.jsx";

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

export default function ItemDetailsModal({
  item,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onMarkFound,
  onMarkReturned,
  onDeleteReport,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
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

  const currentStageIdx = getStageIndex(item.status);
  const backendHost = API_BASE_URL.replace(/\/api$/, "");

  const getImageSrc = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith("http://") || imgPath.startsWith("https://") || imgPath.startsWith("data:")) {
      return imgPath;
    }
    const cleanPath = imgPath.startsWith("/") ? imgPath : "/" + imgPath;
    return `${backendHost}${cleanPath}`;
  };

  const itemImgSrc = getImageSrc(item.image);

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
          maxWidth: "700px",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          backgroundColor: "#ffffff",
          border: "1px solid rgba(139, 92, 246, 0.2)",
          boxShadow: "0 25px 60px -15px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(139, 92, 246, 0.15)",
          overflow: "hidden",
          position: "relative",
          animation: "modalFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. FIXED HEADER */}
        <div
          style={{
            flexShrink: 0,
            padding: "16px 24px",
            borderBottom: "1px solid rgba(139, 92, 246, 0.12)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f8f9fe",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <Badge status={item.type} />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                color: "#7c3aed",
                fontWeight: 700,
                background: "rgba(124, 58, 237, 0.08)",
                padding: "2px 8px",
                borderRadius: "6px",
                border: "1px solid rgba(124, 58, 237, 0.15)",
              }}
            >
              #{item.id}
            </span>
            <Badge status={item.status || "active"} />
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(139, 92, 246, 0.18)",
              cursor: "pointer",
              color: "#64748b",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ede9fe";
              e.currentTarget.style.color = "#5b21b6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.color = "#64748b";
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. SCROLLABLE BODY */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
          }}
        >
          {/* Status Timeline */}
          <div
            style={{
              marginBottom: "24px",
              padding: "18px 20px 20px",
              background: "#f8f9fe",
              borderRadius: "14px",
              border: "1px solid rgba(139, 92, 246, 0.12)",
            }}
          >
            <div
              style={{
                fontSize: "0.76rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#7c3aed",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>Case Resolution Lifecycle</span>
              <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, textTransform: "none" }}>
                Stage {currentStageIdx + 1} of {TIMELINE_STAGES.length}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                position: "relative",
              }}
            >
              {TIMELINE_STAGES.map((stage, idx) => {
                const isCompleted = idx < currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                const isUpcoming = idx > currentStageIdx;

                let circleBg = "#f1f5f9";
                let circleColor = "#94a3b8";
                let circleBorder = "1.5px solid #cbd5e1";
                let circleShadow = "none";

                if (isCompleted) {
                  circleBg = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
                  circleColor = "#ffffff";
                  circleBorder = "none";
                  circleShadow = "0 2px 6px rgba(16, 185, 129, 0.25)";
                } else if (isCurrent) {
                  if (item.status === "rejected") {
                    circleBg = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
                    circleColor = "#ffffff";
                    circleBorder = "none";
                    circleShadow = "0 0 0 4px rgba(239, 68, 68, 0.2)";
                  } else {
                    circleBg = "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)";
                    circleColor = "#ffffff";
                    circleBorder = "none";
                    circleShadow = "0 0 0 4px rgba(124, 58, 237, 0.2)";
                  }
                }

                return (
                  <div
                    key={stage.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      flex: 1,
                      position: "relative",
                      zIndex: 2,
                    }}
                  >
                    <div
                      style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        background: circleBg,
                        color: circleColor,
                        border: circleBorder,
                        boxShadow: circleShadow,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        transition: "all 0.2s ease",
                      }}
                    >
                      {isCompleted ? "✓" : idx + 1}
                    </div>

                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: isCurrent ? 800 : isCompleted ? 600 : 500,
                        color: isCurrent ? "#0f172a" : isCompleted ? "#334155" : "#94a3b8",
                        marginTop: "8px",
                        textAlign: "center",
                        lineHeight: 1.25,
                      }}
                    >
                      {stage.label}
                    </span>

                    {isCurrent && (
                      <span
                        style={{
                          fontSize: "0.58rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          background: item.status === "rejected" ? "#fee2e2" : "rgba(124, 58, 237, 0.12)",
                          color: item.status === "rejected" ? "#dc2626" : "#7c3aed",
                          padding: "1px 5px",
                          borderRadius: "4px",
                          marginTop: "4px",
                        }}
                      >
                        {item.status === "rejected" ? "Rejected" : "Current"}
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Connecting line centered vertically on circle centers (top: 13px) */}
              <div
                style={{
                  position: "absolute",
                  top: "13px",
                  left: "7%",
                  right: "7%",
                  height: "2px",
                  background: "#e2e8f0",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg, #10b981, #7c3aed)",
                    width: `${(currentStageIdx / (TIMELINE_STAGES.length - 1)) * 100}%`,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Item details */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: itemImgSrc ? "140px 1fr" : "1fr",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            {itemImgSrc && (
              <div
                style={{
                  width: "100%",
                  height: "140px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid rgba(139, 92, 246, 0.15)",
                  background: "#f1f5f9",
                  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
                }}
              >
                <img
                  src={itemImgSrc}
                  alt={item.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}
            <div>
              <h2
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: "0 0 8px",
                  lineHeight: 1.3,
                }}
              >
                {item.title}
              </h2>
              <p
                style={{
                  fontSize: "0.92rem",
                  color: "#475569",
                  lineHeight: 1.55,
                  margin: "0 0 16px",
                }}
              >
                {item.description || "No specific detailed description provided."}
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  fontSize: "0.82rem",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "#f8f9fe",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    border: "1px solid rgba(139, 92, 246, 0.12)",
                    color: "#475569",
                  }}
                >
                  <Tag size={13} color="#7c3aed" />
                  <strong style={{ color: "#0f172a" }}>{item.category || "General"}</strong>
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "#f8f9fe",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    border: "1px solid rgba(139, 92, 246, 0.12)",
                    color: "#475569",
                  }}
                >
                  <MapPin size={13} color="#ef4444" />
                  <strong style={{ color: "#0f172a" }}>{item.location || "Campus"}</strong>
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "#f8f9fe",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    border: "1px solid rgba(139, 92, 246, 0.12)",
                    color: "#475569",
                  }}
                >
                  <Calendar size={13} color="#d97706" />
                  <strong style={{ color: "#0f172a" }}>{item.date || item.created_at || "Recent"}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Reporter / Contact information */}
          <div
            style={{
              padding: "16px 20px",
              background: "#f8f9fe",
              border: "1px solid rgba(139, 92, 246, 0.12)",
              borderRadius: "14px",
            }}
          >
            <div
              style={{
                fontSize: "0.76rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#7c3aed",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <User size={14} /> Reporter Information
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid rgba(139, 92, 246, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px",
                }}
              >
                <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                  Reporter Name
                </span>
                <strong style={{ fontSize: "0.88rem", color: "#0f172a" }}>
                  {item.reporter || "Not available"}
                </strong>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid rgba(139, 92, 246, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px",
                }}
              >
                <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                  Email Address
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Mail size={13} color="#7c3aed" />
                  {item.reporterEmail ? (
                    <a
                      href={`mailto:${item.reporterEmail}`}
                      style={{
                        fontSize: "0.85rem",
                        color: "#7c3aed",
                        textDecoration: "none",
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={item.reporterEmail}
                    >
                      {item.reporterEmail}
                    </a>
                  ) : (
                    <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Not available</span>
                  )}
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid rgba(139, 92, 246, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px",
                }}
              >
                <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                  Contact Phone
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Phone size={13} color="#7c3aed" />
                  {item.reporterPhone && item.reporterPhone !== "Not available" ? (
                    <a
                      href={`tel:${item.reporterPhone}`}
                      style={{ fontSize: "0.85rem", color: "#0f172a", textDecoration: "none", fontWeight: 600 }}
                    >
                      {item.reporterPhone}
                    </a>
                  ) : (
                    <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Not available</span>
                  )}
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid rgba(139, 92, 246, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px",
                }}
              >
                <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                  Student ID / Roll No
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.85rem",
                    color: item.studentId ? "#7c3aed" : "#94a3b8",
                    fontWeight: 600,
                  }}
                >
                  {item.studentId || "Not available"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. FIXED FOOTER */}
        <div
          style={{
            flexShrink: 0,
            padding: "14px 24px",
            borderTop: "1px solid rgba(139, 92, 246, 0.12)",
            background: "#ffffff",
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {onDeleteReport && (
              <button
                type="button"
                className="btn btn--danger-outline btn--sm"
                onClick={() => {
                  if (window.confirm(`Permanently delete report #${item.id} "${item.title}"?`)) {
                    onDeleteReport(item.id);
                    onClose();
                  }
                }}
                style={{ fontSize: "0.78rem" }}
              >
                🗑 Delete Report
              </button>
            )}

            <Link
              to={`/items/${item.id}`}
              className="btn btn--outline btn--sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.78rem" }}
              onClick={onClose}
              title="Inspect public card page"
            >
              View Public Card <ExternalLink size={12} />
            </Link>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn--outline btn--sm" onClick={onClose}>
              Close
            </button>

            {item.status === "under_review" || item.status === "pending" ? (
              <>
                <button
                  type="button"
                  className="btn btn--danger-outline btn--sm"
                  onClick={() => {
                    onReject(item.id);
                    onClose();
                  }}
                >
                  Reject Report
                </button>
                <button
                  type="button"
                  className="btn btn--sm"
                  style={{
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "#ffffff",
                    border: "1.5px solid #059669",
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    onApprove(item.id);
                    onClose();
                  }}
                >
                  ✓ Approve Report
                </button>
              </>
            ) : null}

            {item.type === "lost" && item.status !== "resolved" && item.status !== "under_review" && item.status !== "pending" && (
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => {
                  onMarkFound(item.id);
                  onClose();
                }}
              >
                Mark as Found
              </button>
            )}

            {item.type === "found" && item.status !== "resolved" && item.status !== "under_review" && item.status !== "pending" && (
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => {
                  onMarkReturned(item.id, item.reporter || "Claimant");
                  onClose();
                }}
              >
                Mark as Returned
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
