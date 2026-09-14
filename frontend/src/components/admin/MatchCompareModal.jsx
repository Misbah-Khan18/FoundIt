import { X, Sparkles, MapPin, Calendar, Tag, User, CheckCircle2, XCircle } from "lucide-react";
import { API_BASE_URL } from "../../context/AuthContext.jsx";

export default function MatchCompareModal({ match, isOpen, onClose, onConfirmMatch, onRejectMatch }) {
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
        overflowY: "auto",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "840px",
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
            background: "linear-gradient(135deg, var(--navy-900) 0%, #1e3a8a 100%)",
            color: "#ffffff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "999px",
                background: "var(--gold-500)",
                color: "var(--navy-900)",
                fontWeight: 800,
                fontSize: "0.9rem",
              }}
            >
              <Sparkles size={16} /> {match.matchScore}% Match Confidence
            </span>
            <span
              style={{
                fontSize: "0.78rem",
                padding: "4px 10px",
                borderRadius: "999px",
                fontWeight: 800,
                letterSpacing: "0.05em",
                background: match.confidenceLevel === "HIGH" ? "rgba(16, 185, 129, 0.25)" : match.confidenceLevel === "MEDIUM" ? "rgba(245, 158, 11, 0.25)" : "rgba(239, 68, 68, 0.25)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              {match.confidenceLevel} CONFIDENCE
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#ffffff",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Comparison Grid */}
        <div style={{ padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
            {/* Lost Report Column */}
            <div style={{ border: "1px solid rgba(210, 31, 43, 0.25)", background: "rgba(210, 31, 43, 0.02)", borderRadius: "var(--radius-md)", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span className="eyebrow" style={{ color: "var(--red-500)", fontWeight: 800 }}>LOST REPORT</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--slate-500)" }}>#{match.lostItem.id}</span>
              </div>
              {lostImg ? (
                <div style={{ height: "150px", borderRadius: "8px", overflow: "hidden", marginBottom: "12px", background: "#f1f5f9" }}>
                  <img src={lostImg} alt={match.lostItem.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{ height: "100px", borderRadius: "8px", background: "rgba(210, 31, 43, 0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--slate-400)", fontSize: "0.82rem", marginBottom: "12px" }}>
                  No Image Uploaded
                </div>
              )}
              <h4 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 6px", color: "var(--ink)" }}>{match.lostItem.title}</h4>
              <p style={{ fontSize: "0.86rem", color: "var(--slate-600)", margin: "0 0 12px", lineHeight: 1.4 }}>{match.lostItem.description || "No description provided."}</p>
              <div style={{ fontSize: "0.82rem", color: "var(--slate-600)", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div><Tag size={13} /> Category: <strong>{match.lostItem.category}</strong></div>
                <div><MapPin size={13} /> Location: <strong>{match.lostItem.location}</strong></div>
                <div><Calendar size={13} /> Reported: <strong>{match.lostItem.date}</strong></div>
                <div><User size={13} /> Reporter: <strong>{match.lostItem.reporter}</strong></div>
              </div>
            </div>

            {/* Found Report Column */}
            <div style={{ border: "1px solid rgba(52, 89, 163, 0.25)", background: "rgba(52, 89, 163, 0.02)", borderRadius: "var(--radius-md)", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span className="eyebrow" style={{ color: "var(--blue-500)", fontWeight: 800 }}>FOUND REPORT</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--slate-500)" }}>#{match.foundItem.id}</span>
              </div>
              {foundImg ? (
                <div style={{ height: "150px", borderRadius: "8px", overflow: "hidden", marginBottom: "12px", background: "#f1f5f9" }}>
                  <img src={foundImg} alt={match.foundItem.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{ height: "100px", borderRadius: "8px", background: "rgba(52, 89, 163, 0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--slate-400)", fontSize: "0.82rem", marginBottom: "12px" }}>
                  No Image Uploaded
                </div>
              )}
              <h4 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 6px", color: "var(--ink)" }}>{match.foundItem.title}</h4>
              <p style={{ fontSize: "0.86rem", color: "var(--slate-600)", margin: "0 0 12px", lineHeight: 1.4 }}>{match.foundItem.description || "No description provided."}</p>
              <div style={{ fontSize: "0.82rem", color: "var(--slate-600)", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div><Tag size={13} /> Category: <strong>{match.foundItem.category}</strong></div>
                <div><MapPin size={13} /> Location: <strong>{match.foundItem.location}</strong></div>
                <div><Calendar size={13} /> Found On: <strong>{match.foundItem.date}</strong></div>
                <div><User size={13} /> Finder: <strong>{match.foundItem.reporter}</strong></div>
              </div>
            </div>
          </div>

          {/* Detailed Match Analysis Progress Bars */}
          <div style={{ padding: "18px 20px", background: "var(--ivory)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)", marginBottom: "22px" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--navy-900)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              MATCH ANALYSIS BREAKDOWN
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Description */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                  <span style={{ color: "var(--slate-700)", fontWeight: 600 }}>Description Similarity (Weight: 45%)</span>
                  <span style={{ fontWeight: 800, color: "var(--navy-900)" }}>{match.descriptionScore ?? 0}%</span>
                </div>
                <div style={{ height: "7px", borderRadius: "999px", background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
                  <div style={{ width: `${match.descriptionScore ?? 0}%`, height: "100%", background: "var(--blue-500)", borderRadius: "999px" }} />
                </div>
              </div>

              {/* Image */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                  <span style={{ color: "var(--slate-700)", fontWeight: 600 }}>Image Similarity (Weight: 35%)</span>
                  <span style={{ fontWeight: 800, color: "var(--navy-900)" }}>{match.imageScore ?? 0}%</span>
                </div>
                <div style={{ height: "7px", borderRadius: "999px", background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
                  <div style={{ width: `${match.imageScore ?? 0}%`, height: "100%", background: "var(--gold-500)", borderRadius: "999px" }} />
                </div>
              </div>

              {/* Location */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                  <span style={{ color: "var(--slate-700)", fontWeight: 600 }}>Location Proximity (Weight: 10%)</span>
                  <span style={{ fontWeight: 800, color: "var(--navy-900)" }}>{match.locationScore ?? 0}%</span>
                </div>
                <div style={{ height: "7px", borderRadius: "999px", background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
                  <div style={{ width: `${match.locationScore ?? 0}%`, height: "100%", background: "var(--emerald-500)", borderRadius: "999px" }} />
                </div>
              </div>

              {/* Date */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                  <span style={{ color: "var(--slate-700)", fontWeight: 600 }}>Date Proximity (Weight: 10%)</span>
                  <span style={{ fontWeight: 800, color: "var(--navy-900)" }}>{match.dateScore ?? 0}%</span>
                </div>
                <div style={{ height: "7px", borderRadius: "999px", background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
                  <div style={{ width: `${match.dateScore ?? 0}%`, height: "100%", background: "#8b5cf6", borderRadius: "999px" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button className="btn btn--outline btn--sm" onClick={onClose}>
              Close
            </button>
            {onRejectMatch && match.status !== "rejected" && (
              <button
                className="btn btn--outline btn--sm"
                style={{ borderColor: "rgba(239,68,68,0.4)", color: "var(--red-600)" }}
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
                className="btn btn--emerald btn--sm"
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
      </div>
    </div>
  );
}
