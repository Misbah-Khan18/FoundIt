import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  ShieldCheck,
  Clock,
  HandCoins,
  CheckCircle2,
  ArrowRight,
  Activity,
  Eye,
  Sparkles,
  Check,
  X as XIcon,
  ChevronRight,
} from "lucide-react";
import Badge from "../../components/Badge.jsx";
import {
  ActivityWaveChart,
  StatusDonutChart,
  CampusHotspotsCard,
  CalendarWeekStrip,
} from "../../components/admin/AdminCharts.jsx";
import ItemDetailsModal from "../../components/admin/ItemDetailsModal.jsx";
import MarkFoundModal from "../../components/admin/MarkFoundModal.jsx";
import MatchCompareModal from "../../components/admin/MatchCompareModal.jsx";
import AdminSyncBadge from "../../components/admin/AdminSyncBadge.jsx";
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
    rejectMatch,
    deleteReport,
    refreshAdminData,
  } = useAdmin();

  const { user } = useAuth();

  useEffect(() => {
    refreshAdminData();
  }, [refreshAdminData]);

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
    <div
      className="admin-overview"
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "22px",
        animation: "dashPageFadeIn 0.75s cubic-bezier(0.16, 1, 0.3, 1) both",
      }}
    >
      {/* PAGE HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "#0f172a",
              margin: "0 0 4px",
              letterSpacing: "-0.02em",
            }}
          >
            Admin Overview
          </h1>
          <p style={{ fontSize: "0.86rem", color: "#64748b", margin: 0 }}>
            Real-time management overview of campus lost &amp; found items, verification queues, and system activity.
          </p>
        </div>

        {/* Live system status and sync controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <AdminSyncBadge />
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.9)",
              padding: "6px 14px",
              borderRadius: "999px",
              border: "1px solid rgba(139, 92, 246, 0.18)",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
            }}
          >
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#7c3aed" }}>
              {adminName}
            </span>
          </div>
        </div>
      </div>

      {/* TOP ROW: 3 MAIN KPI STAT COUNTERS (Lost | Found | Pending) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "18px",
        }}
      >
        {/* 1. LOST COUNTER */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.85)",
            border: "1px solid rgba(139, 92, 246, 0.14)",
            borderRadius: "16px",
            padding: "20px 22px",
            boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>
              Lost Items
            </span>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#fff1f2",
                color: "#e11d48",
                border: "1px solid #fecdd3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileText size={18} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span
              style={{
                fontSize: "2.1rem",
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              {stats.totalLost ?? items.filter((i) => i.type === "lost").length}
            </span>
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>
              reported
            </span>
          </div>
          <div
            style={{
              borderTop: "1px solid rgba(139, 92, 246, 0.1)",
              paddingTop: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
            }}
          >
            <span style={{ color: "#64748b" }}>Total Lost registry</span>
            <Link
              to="/admin/reports"
              style={{
                color: "#7c3aed",
                textDecoration: "none",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "2px",
              }}
            >
              View <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* 2. FOUND COUNTER */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.85)",
            border: "1px solid rgba(139, 92, 246, 0.14)",
            borderRadius: "16px",
            padding: "20px 22px",
            boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>
              Found Items
            </span>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#ecfdf5",
                color: "#059669",
                border: "1px solid #a7f3d0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck size={18} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span
              style={{
                fontSize: "2.1rem",
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              {stats.totalFound ?? items.filter((i) => i.type === "found").length}
            </span>
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>
              in custody
            </span>
          </div>
          <div
            style={{
              borderTop: "1px solid rgba(139, 92, 246, 0.1)",
              paddingTop: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
            }}
          >
            <span style={{ color: "#64748b" }}>
              Resolved items:{" "}
              <strong style={{ color: "#059669" }}>{stats.resolvedCount || 0}</strong>
            </span>
            <Link
              to="/admin/reports"
              style={{
                color: "#7c3aed",
                textDecoration: "none",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "2px",
              }}
            >
              View <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* 3. PENDING COUNTER */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.85)",
            border: "1px solid rgba(139, 92, 246, 0.14)",
            borderRadius: "16px",
            padding: "20px 22px",
            boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>
              Pending Moderation
            </span>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#fffbeb",
                color: "#d97706",
                border: "1px solid #fde68a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock size={18} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span
              style={{
                fontSize: "2.1rem",
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              {pendingItems.length}
            </span>
            <span style={{ fontSize: "0.75rem", color: "#d97706", fontWeight: 700 }}>
              awaiting review
            </span>
          </div>
          <div
            style={{
              borderTop: "1px solid rgba(139, 92, 246, 0.1)",
              paddingTop: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
            }}
          >
            <span style={{ color: "#64748b" }}>Approval queue</span>
            <Link
              to="/admin/pending"
              style={{
                color: "#d97706",
                textDecoration: "none",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "2px",
              }}
            >
              Moderate <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN BALANCED GRID (Matching Reference Image 1) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.62fr) minmax(0, 1fr)",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: Main Activity Wave Chart + Calendar & Moderation Hub */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* 1. Main Wave & Trend Chart Card */}
          <ActivityWaveChart />

          {/* 2. Calendar Week Strip + Moderation Queue Card */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: "18px",
              border: "1px solid rgba(139, 92, 246, 0.16)",
              boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* Calendar Weekday Strip (matching Reference Image bottom-left calendar) */}
            <CalendarWeekStrip />

            {/* Moderation Queue Section */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid rgba(139, 92, 246, 0.1)",
                paddingTop: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                  Pending Moderation Queue
                </h3>
                <span
                  style={{
                    background: pendingItems.length > 0 ? "#fef3c7" : "#ecfdf5",
                    color: pendingItems.length > 0 ? "#b45309" : "#059669",
                    border: pendingItems.length > 0 ? "1px solid #fde68a" : "1px solid #a7f3d0",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: "12px",
                  }}
                >
                  {pendingItems.length} awaiting
                </span>
              </div>
              <Link
                to="/admin/pending"
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#7c3aed",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                View all <ArrowRight size={13} />
              </Link>
            </div>

            {/* Moderation Items or Clean Queue Clear State */}
            {pendingItems.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  padding: "20px",
                  background: "#f8f9fe",
                  borderRadius: "12px",
                  border: "1px solid rgba(139, 92, 246, 0.1)",
                }}
              >
                <ShieldCheck size={28} color="#10b981" />
                <div>
                  <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#0f172a" }}>
                    Queue Clear!
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                    All student lost &amp; found submissions have been reviewed and approved.
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "260px", overflowY: "auto", paddingRight: "4px" }}>
                {pendingItems.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "#ffffff",
                      border: "1px solid rgba(139, 92, 246, 0.12)",
                      borderRadius: "12px",
                      gap: "12px",
                      boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                      <Badge status={item.type} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: "0.74rem", color: "#64748b" }}>
                          By {item.reporter || "Student"} • {item.location || "Campus"}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        title="View Details"
                        style={{
                          background: "#f8f9fe",
                          border: "1px solid rgba(139, 92, 246, 0.2)",
                          borderRadius: "8px",
                          padding: "6px 8px",
                          color: "#334155",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => approveReport(item.id)}
                        style={{
                          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          border: "none",
                          borderRadius: "8px",
                          padding: "6px 12px",
                          color: "#ffffff",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.74rem",
                          fontWeight: 700,
                        }}
                      >
                        <Check size={12} strokeWidth={3} /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectReport(item.id)}
                        style={{
                          background: "#fee2e2",
                          border: "1px solid #fca5a5",
                          borderRadius: "8px",
                          padding: "6px 8px",
                          color: "#dc2626",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        <XIcon size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Donut Distribution + Hotspots + Verification Hub + Activity */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* 1. Item Status Donut Distribution (Reference Image "Top Product Sale") */}
          <StatusDonutChart />

          {/* 2. Campus Hotspots (Reference Image "Traffic Source") */}
          <CampusHotspotsCard />

          {/* 3. Requires Attention & Verification Hub */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: "18px",
              border: "1px solid rgba(139, 92, 246, 0.16)",
              boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              padding: "20px 22px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
                paddingBottom: "10px",
                borderBottom: "1px solid rgba(139, 92, 246, 0.1)",
              }}
            >
              <h3 style={{ fontSize: "1.08rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Requires Attention
              </h3>
              <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                Active Queues
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Claims notification item */}
              <Link
                to="/admin/claims"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "11px 14px",
                  background: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid rgba(139, 92, 246, 0.12)",
                  textDecoration: "none",
                  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "10px",
                      background: "#f5f3ff",
                      color: "#7c3aed",
                      border: "1px solid rgba(124, 58, 237, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <HandCoins size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#0f172a" }}>
                      Claims Verification
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                      Ownership proof submissions
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      background: pendingClaims.length > 0 ? "#f5f3ff" : "#f1f5f9",
                      color: pendingClaims.length > 0 ? "#7c3aed" : "#64748b",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "12px",
                      border: pendingClaims.length > 0 ? "1px solid rgba(124, 58, 237, 0.25)" : "none",
                    }}
                  >
                    {pendingClaims.length}
                  </span>
                  <ChevronRight size={14} color="#94a3b8" />
                </div>
              </Link>

              {/* Matches notification item */}
              <Link
                to="/admin/matches"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "11px 14px",
                  background: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid rgba(139, 92, 246, 0.12)",
                  textDecoration: "none",
                  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "10px",
                      background: "#ecfdf5",
                      color: "#059669",
                      border: "1px solid rgba(5, 150, 105, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#0f172a" }}>
                      Smart Matches
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                      AI correlated Lost &amp; Found
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      background: unconfirmedMatches.length > 0 ? "#ecfdf5" : "#f1f5f9",
                      color: unconfirmedMatches.length > 0 ? "#059669" : "#64748b",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "12px",
                      border: unconfirmedMatches.length > 0 ? "1px solid rgba(5, 150, 105, 0.25)" : "none",
                    }}
                  >
                    {unconfirmedMatches.length}
                  </span>
                  <ChevronRight size={14} color="#94a3b8" />
                </div>
              </Link>

              {/* Resolved Items item */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "11px 14px",
                  background: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid rgba(139, 92, 246, 0.12)",
                  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "10px",
                      background: "#fffbeb",
                      color: "#d97706",
                      border: "1px solid rgba(217, 119, 6, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#0f172a" }}>
                      Reunited &amp; Resolved
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                      Overall recovery rate: {stats.recoveryRate || 0}%
                    </div>
                  </div>
                </div>
                <div>
                  <span
                    style={{
                      background: "#fffbeb",
                      color: "#d97706",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "12px",
                      border: "1px solid rgba(217, 119, 6, 0.25)",
                    }}
                  >
                    {stats.resolvedCount || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Live System Activity Feed */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: "18px",
              border: "1px solid rgba(139, 92, 246, 0.16)",
              boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              padding: "20px 22px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
                paddingBottom: "10px",
                borderBottom: "1px solid rgba(139, 92, 246, 0.1)",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Activity size={16} color="#7c3aed" />
                <h3 style={{ fontSize: "1.08rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  System Activity
                </h3>
              </div>

              {/* Activity Filter Buttons */}
              <div
                style={{
                  display: "flex",
                  background: "#f1f5f9",
                  borderRadius: "8px",
                  padding: "2px",
                  border: "1px solid #e2e8f0",
                }}
              >
                {["all", "report", "claim"].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setActivityFilter(f)}
                    style={{
                      background: activityFilter === f ? "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" : "transparent",
                      color: activityFilter === f ? "#ffffff" : "#64748b",
                      border: "none",
                      borderRadius: "6px",
                      padding: "3px 8px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      textTransform: "capitalize",
                      cursor: "pointer",
                      boxShadow: activityFilter === f ? "0 2px 6px rgba(124, 58, 237, 0.3)" : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity List */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxHeight: "220px",
                overflowY: "auto",
                paddingRight: "4px",
              }}
            >
              {filteredActivities.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 10px", color: "#64748b", fontSize: "0.82rem" }}>
                  No recent activity recorded.
                </div>
              ) : (
                filteredActivities.slice(0, 5).map((act) => (
                  <div
                    key={act.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      padding: "10px 12px",
                      background: "#ffffff",
                      borderRadius: "10px",
                      border: "1px solid rgba(139, 92, 246, 0.08)",
                      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.02)",
                      fontSize: "0.8rem",
                    }}
                  >
                    <div
                      style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        background: "#f5f3ff",
                        color: "#7c3aed",
                        border: "1px solid rgba(124, 58, 237, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: "1px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                      }}
                    >
                      {act.user ? act.user[0].toUpperCase() : "U"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "#1e293b", lineHeight: 1.35 }}>
                        <strong>{act.user}</strong> {act.action}{" "}
                        {act.item && (
                          <span style={{ color: "#7c3aed", fontWeight: 600 }}>
                            "{act.item}"
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "0.68rem", color: "#94a3b8", display: "block", marginTop: "2px" }}>
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
        onDeleteReport={deleteReport}
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
        onRejectMatch={rejectMatch}
      />
    </div>
  );
}
