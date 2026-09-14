import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, PlusCircle, MapPin, Calendar, Filter, Loader2, AlertCircle, LogIn } from "lucide-react";
import Badge from "../components/Badge.jsx";
import StatusTimeline from "../components/StatusTimeline.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useReports } from "../context/ReportsContext.jsx";

export default function MyReports() {
  const { myReports, fetchMyReports, loading, error } = useReports();
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyReports();
  }, [fetchMyReports]);

  const filteredReports = myReports.filter((item) => {
    if (filterType !== "all" && item.type !== filterType) return false;
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="dash-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <Loader2 className="spin" size={48} color="var(--navy-900)" />
      </div>
    );
  }

  if (error === "unauthenticated") {
    return (
      <div className="dash-page">
        <EmptyState
          icon={<LogIn size={32} strokeWidth={2} />}
          title="Login Required"
          description="You must be logged in to view your submitted reports."
        />
        <div style={{ textAlign: "center", marginTop: "-10px" }}>
          <button className="btn btn--emerald" onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash-page">
        <EmptyState
          icon={<AlertCircle size={32} strokeWidth={2} color="var(--red-500)" />}
          title="Failed to Load Reports"
          description={error}
        />
      </div>
    );
  }

  return (
    <div className="dash-page">
      <div className="dash-page__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1>My Submitted Reports</h1>
          <p>Real-time verification and tracking for all items reported by your account.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link to="/report-lost" className="btn btn--emerald btn--sm">
            <PlusCircle size={15} />
            Report Lost
          </Link>
          <Link to="/report-found" className="btn btn--outline btn--sm">
            Found Something Else?
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card" style={{ padding: "14px 18px", marginBottom: "24px", display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.86rem", color: "var(--slate-500)", fontWeight: 600 }}>
          <Filter size={15} /> Filter:
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["all", "lost", "found"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: 600,
                border: filterType === t ? "1.5px solid var(--navy-900)" : "1px solid var(--border-light)",
                background: filterType === t ? "var(--navy-900)" : "#ffffff",
                color: filterType === t ? "#ffffff" : "var(--slate-600)",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {t === "all" ? "All Types" : `${t} Items`}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
          <select
            className="select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: "6px 12px", fontSize: "0.84rem", width: "auto" }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="under_review">Under Review</option>
            <option value="matched">Potential Match</option>
            <option value="claimed">Claimed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Interactive Report Cards */}
      {filteredReports.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {filteredReports.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: "22px 26px",
                transition: "all 0.2s ease",
                border: "1px solid var(--border-light)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "260px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <Badge status={item.type} />
                    <span style={{ fontSize: "0.78rem", color: "var(--slate-500)", fontFamily: "var(--font-mono)" }}>
                      #{item.id}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--slate-500)" }}>• {item.category || "General"}</span>
                  </div>

                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, margin: "6px 0", color: "var(--ink)" }}>
                    {item.title}
                  </h2>

                  <p style={{ fontSize: "0.9rem", color: "var(--slate-600)", margin: "0 0 12px", lineHeight: 1.5, maxWidth: "68ch" }}>
                    {item.description}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "0.84rem", color: "var(--slate-500)", flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={14} /> {item.location || "Campus Area"}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={14} /> {item.date || item.item_date || "Recent"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                  <Badge status={item.status || "active"} />
                  <Link to={`/items/${item.id}`} className="btn btn--outline btn--sm" style={{ marginTop: "4px" }}>
                    View Public Card
                  </Link>
                </div>
              </div>

              {/* Status Timeline */}
              <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border-light)" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--slate-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                  Verification &amp; Handover Progress
                </div>
                <StatusTimeline status={item.status || "active"} itemType={item.type} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FileText size={24} strokeWidth={2} />}
          title={myReports.length === 0 ? "No reports submitted yet" : "No matching reports for selected filters"}
          description={
            myReports.length === 0
              ? "All reports you log will be tracked here with verified status updates."
              : "Try switching filter types or statuses."
          }
        />
      )}
    </div>
  );
}

