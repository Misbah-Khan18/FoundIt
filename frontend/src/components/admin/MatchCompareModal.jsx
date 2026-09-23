import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles, MapPin, Calendar, Tag, User, CheckCircle2, XCircle } from "lucide-react";
import { API_BASE_URL } from "../../context/AuthContext.jsx";

export default function MatchCompareModal({ match, isOpen, onClose, onConfirmMatch, onRejectMatch }) {
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

  if (!isOpen || !match) return null;

  const backendHost = API_BASE_URL.replace(/\/api$/, "");

  const getImageSrc = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith("http://") || imgPath.startsWith("https://") || imgPath.startsWith("data:")) {
      return imgPath;
    }
    const cleanPath = imgPath.startsWith("/") ? imgPath : "/" + imgPath;
    return `${backendHost}${cleanPath}`;
  };

  const lostImg = getImageSrc(match.lostItem.image);
  const foundImg = getImageSrc(match.foundItem.image);

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
          maxWidth: "860px",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          boxShadow: "0 25px 60px -15px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(139, 92, 246, 0.15)",
          backgroundColor: "#ffffff",
          border: "1px solid rgba(139, 92, 246, 0.2)",
          position: "relative",
          overflow: "hidden",
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 14px",
                borderRadius: "999px",
                background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "0.88rem",
                boxShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
              }}
            >
              <Sparkles size={15} style={{ color: "#fef08a" }} /> {match.matchScore}% Match Confidence
            </span>
            <span
              style={{
                fontSize: "0.76rem",
                padding: "4px 10px",
                borderRadius: "999px",
                fontWeight: 800,
                letterSpacing: "0.04em",
                background:
                  match.confidenceLevel === "HIGH"
                    ? "#ecfdf5"
                    : match.confidenceLevel === "MEDIUM"
                    ? "#fef3c7"
                    : "#fff1f2",
                color:
                  match.confidenceLevel === "HIGH"
                    ? "#059669"
                    : match.confidenceLevel === "MEDIUM"
                    ? "#d97706"
                    : "#e11d48",
                border:
                  match.confidenceLevel === "HIGH"
                    ? "1px solid #a7f3d0"
                    : match.confidenceLevel === "MEDIUM"
                    ? "1px solid #fde68a"
                    : "1px solid #fecdd3",
              }}
            >
              {match.confidenceLevel} CONFIDENCE
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(139, 92, 246, 0.18)",
              borderRadius: "8px",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#64748b",
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
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {/* Comparison Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
            {/* Lost Report Column */}
            <div style={{ border: "1px solid #fecdd3", background: "#fef2f2", borderRadius: "12px", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span className="eyebrow" style={{ color: "#e11d48", fontWeight: 800 }}>LOST REPORT</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "#7c3aed" }}>#{match.lostItem.id}</span>
              </div>
              {lostImg ? (
                <div style={{ height: "150px", borderRadius: "8px", overflow: "hidden", marginBottom: "12px", background: "#ffffff", border: "1px solid #fecdd3" }}>
                  <img src={lostImg} alt={match.lostItem.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{ height: "100px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "0.82rem", marginBottom: "12px" }}>
                  No Image Uploaded
                </div>
              )}
              <h4 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 6px", color: "#0f172a" }}>{match.lostItem.title}</h4>
              <p style={{ fontSize: "0.86rem", color: "#475569", margin: "0 0 12px", lineHeight: 1.4 }}>{match.lostItem.description || "No description provided."}</p>
              <div style={{ fontSize: "0.82rem", color: "#64748b", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div><Tag size={13} color="#7c3aed" /> Category: <strong style={{ color: "#0f172a" }}>{match.lostItem.category}</strong></div>
                <div><MapPin size={13} color="#ef4444" /> Location: <strong style={{ color: "#0f172a" }}>{match.lostItem.location}</strong></div>
                <div><Calendar size={13} color="#d97706" /> Reported: <strong style={{ color: "#0f172a" }}>{match.lostItem.date}</strong></div>
                <div><User size={13} /> Reporter: <strong style={{ color: "#0f172a" }}>{match.lostItem.reporter}</strong></div>
              </div>
            </div>

            {/* Found Report Column */}
            <div style={{ border: "1px solid #c7d2fe", background: "#eef2ff", borderRadius: "12px", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span className="eyebrow" style={{ color: "#4f46e5", fontWeight: 800 }}>FOUND REPORT</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "#7c3aed" }}>#{match.foundItem.id}</span>
              </div>
              {foundImg ? (
                <div style={{ height: "150px", borderRadius: "8px", overflow: "hidden", marginBottom: "12px", background: "#ffffff", border: "1px solid #c7d2fe" }}>
                  <img src={foundImg} alt={match.foundItem.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{ height: "100px", borderRadius: "8px", background: "rgba(99, 102, 241, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "0.82rem", marginBottom: "12px" }}>
                  No Image Uploaded
                </div>
              )}
              <h4 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 6px", color: "#0f172a" }}>{match.foundItem.title}</h4>
              <p style={{ fontSize: "0.86rem", color: "#475569", margin: "0 0 12px", lineHeight: 1.4 }}>{match.foundItem.description || "No description provided."}</p>
              <div style={{ fontSize: "0.82rem", color: "#64748b", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div><Tag size={13} color="#7c3aed" /> Category: <strong style={{ color: "#0f172a" }}>{match.foundItem.category}</strong></div>
                <div><MapPin size={13} color="#ef4444" /> Location: <strong style={{ color: "#0f172a" }}>{match.foundItem.location}</strong></div>
                <div><Calendar size={13} color="#d97706" /> Found On: <strong style={{ color: "#0f172a" }}>{match.foundItem.date}</strong></div>
                <div><User size={13} /> Finder: <strong style={{ color: "#0f172a" }}>{match.foundItem.reporter}</strong></div>
              </div>
            </div>
          </div>

          {/* Detailed Match Analysis Progress Bars */}
          <div style={{ padding: "18px 20px", background: "#f8f9fe", borderRadius: "12px", border: "1px solid rgba(139, 92, 246, 0.12)" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#7c3aed", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              MATCH ANALYSIS BREAKDOWN
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Description */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                  <span style={{ color: "#475569", fontWeight: 600 }}>Description Similarity (Weight: 45%)</span>
                  <span style={{ fontWeight: 800, color: "#0f172a" }}>{match.descriptionScore ?? 0}%</span>
                </div>
                <div style={{ height: "7px", borderRadius: "999px", background: "#e2e8f0", overflow: "hidden" }}>
                  <div style={{ width: `${match.descriptionScore ?? 0}%`, height: "100%", background: "linear-gradient(90deg, #6366f1, #a855f7)", borderRadius: "999px" }} />
                </div>
              </div>

              {/* Image */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                  <span style={{ color: "#475569", fontWeight: 600 }}>Image Similarity (Weight: 35%)</span>
                  <span style={{ fontWeight: 800, color: "#0f172a" }}>{match.imageScore ?? 0}%</span>
                </div>
                <div style={{ height: "7px", borderRadius: "999px", background: "#e2e8f0", overflow: "hidden" }}>
                  <div style={{ width: `${match.imageScore ?? 0}%`, height: "100%", background: "#f59e0b", borderRadius: "999px" }} />
                </div>
              </div>

              {/* Location */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                  <span style={{ color: "#475569", fontWeight: 600 }}>Location Proximity (Weight: 10%)</span>
                  <span style={{ fontWeight: 800, color: "#0f172a" }}>{match.locationScore ?? 0}%</span>
                </div>
                <div style={{ height: "7px", borderRadius: "999px", background: "#e2e8f0", overflow: "hidden" }}>
                  <div style={{ width: `${match.locationScore ?? 0}%`, height: "100%", background: "#10b981", borderRadius: "999px" }} />
                </div>
              </div>

              {/* Date */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                  <span style={{ color: "#475569", fontWeight: 600 }}>Date Proximity (Weight: 10%)</span>
                  <span style={{ fontWeight: 800, color: "#0f172a" }}>{match.dateScore ?? 0}%</span>
                </div>
                <div style={{ height: "7px", borderRadius: "999px", background: "#e2e8f0", overflow: "hidden" }}>
                  <div style={{ width: `${match.dateScore ?? 0}%`, height: "100%", background: "#7c3aed", borderRadius: "999px" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. FIXED FOOTER */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "10px",
            borderTop: "1px solid rgba(139, 92, 246, 0.12)",
            padding: "14px 24px",
            background: "#ffffff",
          }}
        >
          <button className="btn btn--outline btn--sm" onClick={onClose}>
            Close
          </button>
          {onRejectMatch && match.status !== "rejected" && (
            <button
              className="btn btn--danger-outline btn--sm"
              onClick={() => {
                onRejectMatch(match.id);
                onClose();
              }}
            >
              <XCircle size={15} /> Reject Match
            </button>
          )}
          {match.status !== "confirmed" && (
            <button
              className="btn btn--primary btn--sm"
              onClick={() => {
                onConfirmMatch(match.id);
                onClose();
              }}
            >
              <CheckCircle2 size={15} /> Confirm Match &amp; Update Items
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
