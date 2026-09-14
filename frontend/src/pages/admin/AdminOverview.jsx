import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  ShieldCheck,
  Clock,
  HandCoins,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Activity,
  AlertTriangle,
  Eye,
  Sparkles,
  Users,
  Check,
  X as XIcon,
  ChevronRight,
  BarChart2,
} from "lucide-react";
import StatCard from "../../components/StatCard.jsx";
import Badge from "../../components/Badge.jsx";
import AdminCharts from "../../components/admin/AdminCharts.jsx";
import ItemDetailsModal from "../../components/admin/ItemDetailsModal.jsx";
import MarkFoundModal from "../../components/admin/MarkFoundModal.jsx";
import MatchCompareModal from "../../components/admin/MatchCompareModal.jsx";
import { useAdmin } from "../../context/AdminContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminOverview() {
  const {
    items,
    stats,
    activities,
    matches,
    claims,
    approveReport,
    rejectReport,
    markAsFound,
    markAsReturned,
    confirmMatch,
  } = useAdmin();

  const { user } = useAuth();

  const [selectedItem, setSelectedItem] = useState(null);
  const [markFoundTarget, setMarkFoundTarget] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [activityFilter, setActivityFilter] = useState("all");

  const pendingItems = items.filter(
    (i) => i.status === "under_review" || i.status === "pending"
  );
  const pendingClaims = claims.filter((c) => c.status === "pending");
  const unconfirmedMatches = matches.filter(
    (m) => m.status === "unconfirmed" || m.status === "pending"
  );

  const filteredActivities = activities.filter((act) => {
    if (activityFilter === "all") return true;
    return act.type === activityFilter;
  });

  const adminName = user?.name || "Administrator";

  return (
    <div className="dash-overview-container" style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* PAGE HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--ink)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
            Admin Overview
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--slate-500)", margin: 0 }}>
            Real-time management overview of campus lost &amp; found items, verification queues, and system activity.
          </p>
        </div>

        {/* Live system status pill */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#ffffff", padding: "6px 14px", borderRadius: "20px", border: "1px solid var(--border-light)", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.2)" }}></span>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--slate-600)" }}>System Operational</span>
          <span style={{ fontSize: "0.72rem", color: "var(--slate-400)" }}>•</span>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#2a81f3" }}>{adminName}</span>
        </div>
      </div>

      {/* TOP ROW: ONLY 3 MAIN KPI STAT COUNTERS (Lost | Found | Pending) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
        }}
      >
        {/* 1. LOST COUNTER */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--border-light)",
            borderRadius: "12px",
            padding: "20px 22px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--slate-500)" }}>
              Lost Items
            </span>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={18} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--ink)", lineHeight: 1, letterSpacing: "-0.03em" }}>
              {stats.totalLost ?? items.filter((i) => i.type === "lost").length}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--slate-400)", fontWeight: 500 }}>reported</span>
          </div>
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
            <span style={{ color: "var(--slate-500)" }}>Total Lost registry</span>
            <Link to="/admin/reports" style={{ color: "#2a81f3", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "2px" }}>
              View <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* 2. FOUND COUNTER */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--border-light)",
            borderRadius: "12px",
            padding: "20px 22px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--slate-500)" }}>
              Found Items
            </span>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(42, 129, 243, 0.1)", color: "#2a81f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--ink)", lineHeight: 1, letterSpacing: "-0.03em" }}>
              {stats.totalFound ?? items.filter((i) => i.type === "found").length}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--slate-400)", fontWeight: 500 }}>in custody</span>
          </div>
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
            <span style={{ color: "var(--slate-500)" }}>Resolved items: <strong style={{ color: "#10b981" }}>{stats.resolvedCount || 0}</strong></span>
            <Link to="/admin/reports" style={{ color: "#2a81f3", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "2px" }}>
              View <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* 3. PENDING COUNTER */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--border-light)",
            borderRadius: "12px",
            padding: "20px 22px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--slate-500)" }}>
              Pending Moderation
            </span>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(245, 158, 11, 0.12)", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--ink)", lineHeight: 1, letterSpacing: "-0.03em" }}>
              {pendingItems.length}
            </span>
            <span style={{ fontSize: "0.75rem", color: "#d97706", fontWeight: 600 }}>awaiting review</span>
          </div>
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
            <span style={{ color: "var(--slate-500)" }}>Approval queue</span>
            <Link to="/admin/pending" style={{ color: "#d97706", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "2px" }}>
              Moderate <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN BALANCED GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.65fr) minmax(0, 1fr)",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: Pending Moderation Queue + Intelligence Charts */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Pending Moderation Queue */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              border: "1px solid var(--border-light)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                paddingBottom: "12px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                  Pending Moderation Queue
                </h2>
                <span
                  style={{
                    background: pendingItems.length > 0 ? "#fef3c7" : "#f1f5f9",
                    color: pendingItems.length > 0 ? "#92400e" : "#64748b",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "12px",
                  }}
                >
                  {pendingItems.length}
                </span>
              </div>
              <Link
                to="/admin/pending"
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#2a81f3",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                View all <ArrowRight size={13} />
              </Link>
            </div>

            {/* List of Pending Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "310px", overflowY: "auto", paddingRight: "4px" }}>
              {pendingItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--slate-500)" }}>
                  <ShieldCheck size={36} color="#10b981" style={{ margin: "0 auto 8px", display: "block" }} />
                  <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: "0.9rem", color: "var(--ink)" }}>Queue Clear!</p>
                  <p style={{ margin: 0, fontSize: "0.78rem" }}>All submitted items have been reviewed.</p>
                </div>
              ) : (
                pendingItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      background: "#f8fafc",
                      border: "1px solid var(--border-light)",
                      borderRadius: "10px",
                      gap: "12px",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                      <Badge status={item.type} />
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            color: "var(--ink)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.title}
                        </div>
                        <div style={{ fontSize: "0.74rem", color: "var(--slate-500)", marginTop: "2px" }}>
                          By {item.reporter || "Student"} • {item.location || "Campus"}
                        </div>
                      </div>
                    </div>

                    {/* Quick action buttons */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        title="View Details"
                        style={{
                          background: "#ffffff",
                          border: "1px solid var(--border-light)",
                          borderRadius: "6px",
                          padding: "5px 8px",
                          color: "var(--slate-600)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => approveReport(item.id)}
                        title="Approve Report"
                        style={{
                          background: "#10b981",
                          border: "none",
                          borderRadius: "6px",
                          padding: "5px 10px",
                          color: "#ffffff",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                        }}
                      >
                        <Check size={13} strokeWidth={3} /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectReport(item.id)}
                        title="Reject Report"
                        style={{
                          background: "#ffffff",
                          border: "1px solid #fee2e2",
                          borderRadius: "6px",
                          padding: "5px 8px",
                          color: "#ef4444",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        <XIcon size={13} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Lost & Found Intelligence Charts */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              border: "1px solid var(--border-light)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              padding: "20px",
            }}
          >
            <AdminCharts />
          </div>
        </div>

        {/* RIGHT COLUMN: Attention & Verification Hub + Live System Activity */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Attention & Verification Hub */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              border: "1px solid var(--border-light)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
                paddingBottom: "10px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                Requires Attention
              </h2>
              <span style={{ fontSize: "0.72rem", color: "var(--slate-400)", fontWeight: 600 }}>Active items</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Claims notification item */}
              <Link
                to="/admin/claims"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  background: "#f8fafc",
                  borderRadius: "10px",
                  border: "1px solid var(--border-light)",
                  textDecoration: "none",
                  transition: "border-color 0.2s ease, background 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "rgba(42, 129, 243, 0.12)", color: "#2a81f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <HandCoins size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)" }}>
                      Claims Verification
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--slate-500)" }}>
                      Ownership proof submissions
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      background: pendingClaims.length > 0 ? "#eff6ff" : "#f1f5f9",
                      color: pendingClaims.length > 0 ? "#1d4ed8" : "#64748b",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "12px",
                      border: pendingClaims.length > 0 ? "1px solid #bfdbfe" : "none",
                    }}
                  >
                    {pendingClaims.length}
                  </span>
                  <ChevronRight size={14} color="var(--slate-400)" />
                </div>
              </Link>

              {/* Matches notification item */}
              <Link
                to="/admin/matches"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  background: "#f8fafc",
                  borderRadius: "10px",
                  border: "1px solid var(--border-light)",
                  textDecoration: "none",
                  transition: "border-color 0.2s ease, background 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.12)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)" }}>
                      Smart Matches
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--slate-500)" }}>
                      AI correlated Lost &amp; Found
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      background: unconfirmedMatches.length > 0 ? "#ecfdf5" : "#f1f5f9",
                      color: unconfirmedMatches.length > 0 ? "#047857" : "#64748b",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "12px",
                      border: unconfirmedMatches.length > 0 ? "1px solid #a7f3d0" : "none",
                    }}
                  >
                    {unconfirmedMatches.length}
                  </span>
                  <ChevronRight size={14} color="var(--slate-400)" />
                </div>
              </Link>

              {/* Resolved Items notification item */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  background: "#f8fafc",
                  borderRadius: "10px",
                  border: "1px solid var(--border-light)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.12)", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)" }}>
                      Reunited &amp; Resolved
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--slate-500)" }}>
                      Overall recovery rate: {stats.recoveryRate || 0}%
                    </div>
                  </div>
                </div>
                <div>
                  <span
                    style={{
                      background: "#fef3c7",
                      color: "#92400e",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "12px",
                      border: "1px solid #fde68a",
                    }}
                  >
                    {stats.resolvedCount || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* System Activity Feed */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              border: "1px solid var(--border-light)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
                paddingBottom: "10px",
                borderBottom: "1px solid #f1f5f9",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Activity size={16} color="#2a81f3" />
                <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                  System Activity
                </h2>
              </div>

              {/* Activity Filter Buttons */}
              <div style={{ display: "flex", background: "#f1f5f9", borderRadius: "6px", padding: "2px" }}>
                {["all", "report", "claim"].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setActivityFilter(f)}
                    style={{
                      background: activityFilter === f ? "#ffffff" : "transparent",
                      color: activityFilter === f ? "var(--ink)" : "var(--slate-500)",
                      border: "none",
                      borderRadius: "4px",
                      padding: "3px 8px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      textTransform: "capitalize",
                      cursor: "pointer",
                      boxShadow: activityFilter === f ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "310px", overflowY: "auto", paddingRight: "4px" }}>
              {filteredActivities.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 10px", color: "var(--slate-500)", fontSize: "0.8rem" }}>
                  No recent activity recorded.
                </div>
              ) : (
                filteredActivities.map((act) => (
                  <div
                    key={act.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      padding: "9px 11px",
                      background: "#f8fafc",
                      borderRadius: "8px",
                      border: "1px solid var(--border-light)",
                      fontSize: "0.78rem",
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "rgba(42, 129, 243, 0.12)",
                        color: "#2a81f3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: "1px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                      }}
                    >
                      {act.user ? act.user[0].toUpperCase() : "U"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "var(--ink)", lineHeight: 1.35 }}>
                        <strong>{act.user}</strong> {act.action}{" "}
                        {act.item && (
                          <span style={{ color: "#2a81f3", fontWeight: 600 }}>
                            "{act.item}"
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "0.68rem", color: "var(--slate-400)", display: "block", marginTop: "2px" }}>
                        {act.time}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <ItemDetailsModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        onApprove={approveReport}
        onReject={rejectReport}
        onMarkFound={(id) => {
          setSelectedItem(null);
          setMarkFoundTarget(items.find((i) => i.id === id));
        }}
        onMarkReturned={markAsReturned}
      />

      <MarkFoundModal
        item={markFoundTarget}
        isOpen={Boolean(markFoundTarget)}
        onClose={() => setMarkFoundTarget(null)}
        onConfirm={markAsFound}
      />

      <MatchCompareModal
        match={selectedMatch}
        isOpen={Boolean(selectedMatch)}
        onClose={() => setSelectedMatch(null)}
        onConfirmMatch={confirmMatch}
      />
    </div>
  );
}


