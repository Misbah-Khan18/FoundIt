import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Filter, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import EmptyState from "../../components/EmptyState.jsx";
import MatchCompareModal from "../../components/admin/MatchCompareModal.jsx";
import AdminSyncBadge from "../../components/admin/AdminSyncBadge.jsx";
import { useAdmin } from "../../context/AdminContext.jsx";

export default function AdminMatches() {
  const { matches, confirmMatch, rejectMatch, refreshAdminData, loading } = useAdmin();
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [confidenceFilter, setConfidenceFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("SCORE_DESC");
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    refreshAdminData();
  }, [refreshAdminData]);

  const getConfidenceBadgeColor = (level) => {
    switch (level) {
      case "HIGH":
        return { bg: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0" };
      case "MEDIUM":
        return { bg: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" };
      case "LOW":
        return { bg: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" };
      default:
        return { bg: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" };
    }
  };

  const handleRunScan = async () => {
    setScanning(true);
    try {
      await refreshAdminData();
    } catch (e) {
      console.warn("Scan error:", e);
    } finally {
      setTimeout(() => setScanning(false), 500);
    }
  };

  const pendingCount = matches.filter((m) => m.status === "pending" || !m.status).length;
  const confirmedCount = matches.filter((m) => m.status === "confirmed").length;
  const rejectedCount = matches.filter((m) => m.status === "rejected").length;

  const filteredMatches = matches
    .filter((m) => {
      if (statusFilter === "pending") {
        if (m.status !== "pending" && m.status) return false;
      } else if (statusFilter !== "ALL") {
        if (m.status !== statusFilter) return false;
      }

      if (confidenceFilter !== "ALL") {
        if (m.confidenceLevel !== confidenceFilter) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "SCORE_DESC") return b.matchScore - a.matchScore;
      if (sortBy === "SCORE_ASC") return a.matchScore - b.matchScore;
      return 0;
    });

  if (loading && matches.length === 0) {
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
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#7c3aed", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
            <Sparkles size={15} /> Server-Side Similarity Analysis Engine
          </div>
          <h1>Smart Matches</h1>
          <p>Server-side Lost ↔ Found similarity analysis using text, image, location, and temporal proximity scores.</p>
        </div>

        {/* Filter Controls & Sync Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <AdminSyncBadge />

          <button
            type="button"
            onClick={handleRunScan}
            disabled={scanning}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              borderRadius: "10px",
              background: "#ffffff",
              border: "1px solid rgba(139, 92, 246, 0.25)",
              color: "#7c3aed",
              fontSize: "0.84rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
              transition: "all 0.15s ease",
            }}
            title="Trigger instant similarity re-scan across all reports"
          >
            <RefreshCw size={14} className={scanning ? "spin-icon" : ""} />
            {scanning ? "Scanning..." : "Run Match Scan"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#ffffff", padding: "7px 14px", borderRadius: "10px", border: "1px solid rgba(139, 92, 246, 0.2)", fontSize: "0.84rem", boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)" }}>
            <Filter size={14} style={{ color: "#7c3aed" }} />
            <span style={{ fontWeight: 600, color: "#475569" }}>Confidence:</span>
            <select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value)}
              style={{ border: "none", background: "transparent", fontWeight: 700, color: "#0f172a", cursor: "pointer", outline: "none" }}
            >
              <option value="ALL">All Thresholds</option>
              <option value="HIGH">High (75%+)</option>
              <option value="MEDIUM">Medium (55-74%)</option>
              <option value="LOW">Low (35-54%)</option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: "8px 14px", borderRadius: "10px", border: "1px solid rgba(139, 92, 246, 0.2)", background: "#ffffff", fontSize: "0.84rem", fontWeight: 600, color: "#0f172a", cursor: "pointer", outline: "none", boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)" }}
          >
            <option value="SCORE_DESC">Sort: Highest Score</option>
            <option value="SCORE_ASC">Sort: Lowest Score</option>
          </select>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid rgba(139, 92, 246, 0.12)", paddingBottom: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          style={{
            padding: "6px 14px",
            fontSize: "0.82rem",
            fontWeight: 700,
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            background: statusFilter === "ALL" ? "#7c3aed" : "#f1f5f9",
            color: statusFilter === "ALL" ? "#ffffff" : "#475569",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          All Candidates
          <span style={{ fontSize: "0.72rem", padding: "1px 6px", borderRadius: "999px", background: statusFilter === "ALL" ? "rgba(255, 255, 255, 0.25)" : "#e2e8f0" }}>
            {matches.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("pending")}
          style={{
            padding: "6px 14px",
            fontSize: "0.82rem",
            fontWeight: 700,
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            background: statusFilter === "pending" ? "#7c3aed" : "#f1f5f9",
            color: statusFilter === "pending" ? "#ffffff" : "#475569",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          Pending Review
          <span style={{ fontSize: "0.72rem", padding: "1px 6px", borderRadius: "999px", background: statusFilter === "pending" ? "rgba(255, 255, 255, 0.25)" : "#e2e8f0" }}>
            {pendingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("confirmed")}
          style={{
            padding: "6px 14px",
            fontSize: "0.82rem",
            fontWeight: 700,
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            background: statusFilter === "confirmed" ? "#7c3aed" : "#f1f5f9",
            color: statusFilter === "confirmed" ? "#ffffff" : "#475569",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          Confirmed
          <span style={{ fontSize: "0.72rem", padding: "1px 6px", borderRadius: "999px", background: statusFilter === "confirmed" ? "rgba(255, 255, 255, 0.25)" : "#e2e8f0" }}>
            {confirmedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("rejected")}
          style={{
            padding: "6px 14px",
            fontSize: "0.82rem",
            fontWeight: 700,
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            background: statusFilter === "rejected" ? "#7c3aed" : "#f1f5f9",
            color: statusFilter === "rejected" ? "#ffffff" : "#475569",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          Rejected
          <span style={{ fontSize: "0.72rem", padding: "1px 6px", borderRadius: "999px", background: statusFilter === "rejected" ? "rgba(255, 255, 255, 0.25)" : "#e2e8f0" }}>
            {rejectedCount}
          </span>
        </button>
      </div>

      {filteredMatches.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={32} strokeWidth={2} />}
          title="No Smart Matches in this View"
          description="Click 'Run Match Scan' or adjust filters to review candidate pairings."
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
                  borderTop: match.confidenceLevel === "HIGH" ? "4px solid #10b981" : match.confidenceLevel === "MEDIUM" ? "4px solid #f59e0b" : "4px solid #94a3b8",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "18px",
                  margin: 0,
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(139, 92, 246, 0.16)",
                  boxShadow: "0 4px 18px rgba(15, 23, 42, 0.04)",
                  borderRadius: "16px",
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
                          background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                          color: "#ffffff",
                          fontSize: "0.84rem",
                          fontWeight: 800,
                          boxShadow: "0 2px 8px rgba(124, 58, 237, 0.2)",
                        }}
                      >
                        <Sparkles size={14} style={{ color: "#fef08a" }} /> {match.matchScore}% Match Score
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
                        background: isConfirmed ? "#ecfdf5" : isRejected ? "#fff1f2" : "#f5f3ff",
                        color: isConfirmed ? "#059669" : isRejected ? "#e11d48" : "#7c3aed",
                        border: isConfirmed ? "1px solid #a7f3d0" : isRejected ? "1px solid #fecdd3" : "1px solid rgba(124, 58, 237, 0.2)",
                      }}
                    >
                      {isConfirmed ? "✓ Confirmed" : isRejected ? "✕ Rejected" : "Pending Review"}
                    </span>
                  </div>

                  {/* Pairing Details Side-by-Side Preview */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
                    {/* Lost Side */}
                    <div style={{ padding: "12px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fecdd3" }}>
                      <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#e11d48", textTransform: "uppercase", letterSpacing: "0.04em" }}>LOST REPORT #{match.lostItem.id}</span>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", margin: "4px 0" }}>{match.lostItem.title}</h4>
                      <span style={{ fontSize: "0.74rem", color: "#64748b", display: "block" }}>📍 {match.lostItem.location}</span>
                    </div>

                    <ArrowRight size={18} color="#7c3aed" />

                    {/* Found Side */}
                    <div style={{ padding: "12px", background: "#eef2ff", borderRadius: "8px", border: "1px solid #c7d2fe" }}>
                      <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#4f46e5", textTransform: "uppercase", letterSpacing: "0.04em" }}>FOUND REPORT #{match.foundItem.id}</span>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", margin: "4px 0" }}>{match.foundItem.title}</h4>
                      <span style={{ fontSize: "0.74rem", color: "#64748b", display: "block" }}>📍 {match.foundItem.location}</span>
                    </div>
                  </div>

                  {/* Breakdown Sub-scores */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginBottom: "12px" }}>
                    <div style={{ background: "#f8f9fe", padding: "8px 6px", borderRadius: "6px", textAlign: "center", border: "1px solid rgba(139, 92, 246, 0.12)" }}>
                      <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700 }}>Description</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>{match.descriptionScore ?? 0}%</div>
                    </div>
                    <div style={{ background: "#f8f9fe", padding: "8px 6px", borderRadius: "6px", textAlign: "center", border: "1px solid rgba(139, 92, 246, 0.12)" }}>
                      <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700 }}>Image</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>{match.imageScore ?? 0}%</div>
                    </div>
                    <div style={{ background: "#f8f9fe", padding: "8px 6px", borderRadius: "6px", textAlign: "center", border: "1px solid rgba(139, 92, 246, 0.12)" }}>
                      <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700 }}>Location</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>{match.locationScore ?? 0}%</div>
                    </div>
                    <div style={{ background: "#f8f9fe", padding: "8px 6px", borderRadius: "6px", textAlign: "center", border: "1px solid rgba(139, 92, 246, 0.12)" }}>
                      <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700 }}>Date</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>{match.dateScore ?? 0}%</div>
                    </div>
                  </div>

                  {/* Factors checklist */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px", padding: "10px 14px", background: "#f8f9fe", borderRadius: "8px", border: "1px solid rgba(139, 92, 246, 0.12)", fontSize: "0.78rem", color: "#334155" }}>
                    {match.matchFactors && match.matchFactors.map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ color: "#059669", fontWeight: 800 }}>✓</span> {f.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "8px", borderTop: "1px solid rgba(139, 92, 246, 0.12)", paddingTop: "14px" }}>
                  <button
                    className="btn btn--outline btn--sm"
                    style={{ flex: 1, justifyContent: "center" }}
                    onClick={() => setSelectedMatch(match)}
                  >
                    View Comparison
                  </button>
                  {!isConfirmed && (
                    <button
                      className="btn btn--primary btn--sm"
                      style={{ padding: "0 14px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      onClick={() => confirmMatch(match.id)}
                      title="Confirm Match & Dispatch Notifications"
                    >
                      <CheckCircle2 size={14} /> Confirm
                    </button>
                  )}
                  {!isRejected && (
                    <button
                      className="btn btn--danger-outline btn--sm"
                      style={{ padding: "0 12px" }}
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
