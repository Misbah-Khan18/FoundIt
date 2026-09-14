import { useState } from "react";
import { Sparkles, ArrowRight, Filter, CheckCircle2, XCircle } from "lucide-react";
import EmptyState from "../../components/EmptyState.jsx";
import MatchCompareModal from "../../components/admin/MatchCompareModal.jsx";
import { useAdmin } from "../../context/AdminContext.jsx";

export default function AdminMatches() {
  const { matches, confirmMatch, rejectMatch, loading } = useAdmin();
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [confidenceFilter, setConfidenceFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("SCORE_DESC");

  const getConfidenceBadgeColor = (level) => {
    switch (level) {
      case "HIGH":
        return { bg: "rgba(16, 185, 129, 0.15)", color: "var(--emerald-600)", border: "1px solid rgba(16, 185, 129, 0.3)" };
      case "MEDIUM":
        return { bg: "rgba(201, 165, 72, 0.18)", color: "var(--gold-600)", border: "1px solid rgba(201, 165, 72, 0.3)" };
      case "LOW":
        return { bg: "rgba(239, 68, 68, 0.12)", color: "var(--red-600)", border: "1px solid rgba(239, 68, 68, 0.25)" };
      default:
        return { bg: "rgba(100, 116, 139, 0.12)", color: "var(--slate-600)", border: "1px solid rgba(100, 116, 139, 0.2)" };
    }
  };

  const filteredMatches = matches
    .filter((m) => {
      if (confidenceFilter === "ALL") return true;
      return m.confidenceLevel === confidenceFilter;
    })
    .sort((a, b) => {
      if (sortBy === "SCORE_DESC") return b.matchScore - a.matchScore;
      if (sortBy === "SCORE_ASC") return a.matchScore - b.matchScore;
      return 0;
    });

  if (loading) {
    return (
      <div className="dash-page">
        <div className="dash-page__header">
          <h1>Smart Matches</h1>
          <p>Analyzing potential matches across all active campus reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <div className="dash-page__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--gold-600)", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
            <Sparkles size={15} /> Server-Side Similarity Analysis Engine
          </div>
          <h1>Smart Matches</h1>
          <p>Server-side Lost ↔ Found similarity analysis using text, image, location, and temporal proximity scores.</p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#fff", padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--border-light)", fontSize: "0.84rem" }}>
            <Filter size={14} style={{ color: "var(--slate-500)" }} />
            <span style={{ fontWeight: 600, color: "var(--slate-600)" }}>Confidence:</span>
            <select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value)}
              style={{ border: "none", background: "transparent", fontWeight: 700, color: "var(--navy-900)", cursor: "pointer" }}
            >
              <option value="ALL">All Thresholds ({matches.length})</option>
              <option value="HIGH">High (80%+)</option>
              <option value="MEDIUM">Medium (60-79%)</option>
              <option value="LOW">Low (40-59%)</option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: "7px 12px", borderRadius: "8px", border: "1px solid var(--border-light)", background: "#fff", fontSize: "0.84rem", fontWeight: 600, color: "var(--navy-900)", cursor: "pointer" }}
          >
            <option value="SCORE_DESC">Sort: Highest Score</option>
            <option value="SCORE_ASC">Sort: Lowest Score</option>
          </select>
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={32} strokeWidth={2} />}
          title="No Smart Matches Awaiting Review"
          description="No potential matches are currently awaiting review."
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "22px" }}>
          {filteredMatches.map((match) => {
            const confBadge = getConfidenceBadgeColor(match.confidenceLevel);
            const isConfirmed = match.status === "confirmed";
            const isRejected = match.status === "rejected";

            return (
              <div
                key={match.id}
                className="card"
                style={{
                  padding: "24px",
                  borderTop: match.confidenceLevel === "HIGH" ? "4px solid var(--emerald-500)" : match.confidenceLevel === "MEDIUM" ? "4px solid var(--gold-500)" : "4px solid var(--slate-400)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "18px",
                  margin: 0,
                }}
              >
                <div>
                  {/* Score & Confidence Banner */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          background: "var(--navy-900)",
                          color: "#ffffff",
                          fontSize: "0.84rem",
                          fontWeight: 800,
                        }}
                      >
                        <Sparkles size={14} style={{ color: "var(--gold-400)" }} /> {match.matchScore}% Match Score
                      </span>

                      <span
                        style={{
                          fontSize: "0.74rem",
                          padding: "3px 8px",
                          borderRadius: "999px",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          background: confBadge.bg,
                          color: confBadge.color,
                          border: confBadge.border,
                        }}
                      >
                        {match.confidenceLevel} CONFIDENCE
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: "0.76rem",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        background: isConfirmed ? "rgba(16, 185, 129, 0.15)" : isRejected ? "rgba(239, 68, 68, 0.15)" : "rgba(30, 54, 116, 0.08)",
                        color: isConfirmed ? "var(--emerald-600)" : isRejected ? "var(--red-600)" : "var(--navy-900)",
                      }}
                    >
                      {isConfirmed ? "✓ Confirmed" : isRejected ? "✕ Rejected" : "Pending Review"}
                    </span>
                  </div>

                  {/* Pairing Details Side-by-Side Preview */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
                    {/* Lost Side */}
                    <div style={{ padding: "12px", background: "rgba(210, 31, 43, 0.04)", borderRadius: "8px", border: "1px solid rgba(210, 31, 43, 0.2)" }}>
                      <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--red-500)", textTransform: "uppercase", letterSpacing: "0.04em" }}>LOST REPORT #{match.lostItem.id}</span>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--ink)", margin: "4px 0" }}>{match.lostItem.title}</h4>
                      <span style={{ fontSize: "0.74rem", color: "var(--slate-500)", display: "block" }}>📍 {match.lostItem.location}</span>
                    </div>

                    <ArrowRight size={18} color="var(--slate-400)" />

                    {/* Found Side */}
                    <div style={{ padding: "12px", background: "rgba(52, 89, 163, 0.04)", borderRadius: "8px", border: "1px solid rgba(52, 89, 163, 0.2)" }}>
                      <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--blue-500)", textTransform: "uppercase", letterSpacing: "0.04em" }}>FOUND REPORT #{match.foundItem.id}</span>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--ink)", margin: "4px 0" }}>{match.foundItem.title}</h4>
                      <span style={{ fontSize: "0.74rem", color: "var(--slate-500)", display: "block" }}>📍 {match.foundItem.location}</span>
                    </div>
                  </div>

                  {/* Breakdown Sub-scores */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginBottom: "12px" }}>
                    <div style={{ background: "var(--ivory)", padding: "6px", borderRadius: "6px", textAlign: "center", border: "1px solid var(--border-light)" }}>
                      <div style={{ fontSize: "0.65rem", color: "var(--slate-500)", fontWeight: 700 }}>Description</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--navy-900)" }}>{match.descriptionScore ?? 0}%</div>
                    </div>
                    <div style={{ background: "var(--ivory)", padding: "6px", borderRadius: "6px", textAlign: "center", border: "1px solid var(--border-light)" }}>
                      <div style={{ fontSize: "0.65rem", color: "var(--slate-500)", fontWeight: 700 }}>Image</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--navy-900)" }}>{match.imageScore ?? 0}%</div>
                    </div>
                    <div style={{ background: "var(--ivory)", padding: "6px", borderRadius: "6px", textAlign: "center", border: "1px solid var(--border-light)" }}>
                      <div style={{ fontSize: "0.65rem", color: "var(--slate-500)", fontWeight: 700 }}>Location</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--navy-900)" }}>{match.locationScore ?? 0}%</div>
                    </div>
                    <div style={{ background: "var(--ivory)", padding: "6px", borderRadius: "6px", textAlign: "center", border: "1px solid var(--border-light)" }}>
                      <div style={{ fontSize: "0.65rem", color: "var(--slate-500)", fontWeight: 700 }}>Date</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--navy-900)" }}>{match.dateScore ?? 0}%</div>
                    </div>
                  </div>

                  {/* Factors checklist */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px", padding: "10px 14px", background: "var(--ivory)", borderRadius: "8px", border: "1px solid var(--border-light)", fontSize: "0.78rem", color: "var(--slate-600)" }}>
                    {match.matchFactors && match.matchFactors.map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ color: "var(--emerald-600)", fontWeight: 800 }}>✓</span> {f.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--border-light)", paddingTop: "14px" }}>
                  <button
                    className="btn btn--outline btn--sm"
                    style={{ flex: 1, justifyContent: "center" }}
                    onClick={() => setSelectedMatch(match)}
                  >
                    View Comparison
                  </button>
                  {!isConfirmed && (
                    <button
                      className="btn btn--emerald btn--sm"
                      style={{ padding: "0 14px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      onClick={() => confirmMatch(match.id)}
                      title="Confirm Match & Dispatch Notifications"
                    >
                      <CheckCircle2 size={14} /> Confirm
                    </button>
                  )}
                  {!isRejected && (
                    <button
                      className="btn btn--outline btn--sm"
                      style={{ padding: "0 12px", borderColor: "rgba(239,68,68,0.4)", color: "var(--red-600)" }}
                      onClick={() => rejectMatch(match.id)}
                      title="Reject Match"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Side by side comparison modal */}
      <MatchCompareModal
        match={selectedMatch}
        isOpen={Boolean(selectedMatch)}
        onClose={() => setSelectedMatch(null)}
        onConfirmMatch={confirmMatch}
        onRejectMatch={rejectMatch}
      />
    </div>
  );
}

