import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, FileText, Activity, CheckCircle2, ShieldAlert, ArrowRight, UserCheck, Sparkles } from "lucide-react";
import StatCard from "../components/StatCard.jsx";
import Badge from "../components/Badge.jsx";
import { API_BASE_URL } from "../context/AuthContext.jsx";
import { ITEMS as fallbackItems, USERS as fallbackUsers } from "../data/mockItems.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_users: fallbackUsers.length,
    total_reports: fallbackItems.length,
    active_cases: fallbackItems.filter((i) => i.status === "open" || i.status === "active").length,
    resolved_cases: fallbackItems.filter((i) => i.status === "resolved").length,
  });
  const [recentReports, setRecentReports] = useState(fallbackItems);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/stats.php`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setStats(data.stats);
            if (data.recent_reports && data.recent_reports.length > 0) {
              setRecentReports(data.recent_reports);
            }
          }
        }
      } catch (err) {
        console.warn("Could not load real admin stats:", err);
      }
    };
    fetchAdminStats();
  }, []);

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--gold-600)", fontWeight: 600, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
          <ShieldAlert size={16} /> Campus Administrator Console
        </div>
        <h1>Portal-Wide Analytics &amp; Moderation</h1>
        <p>Comprehensive system metrics, account controls, and case management for MIT-WPU.</p>
      </div>

      <div className="dash-page__stats">
        <StatCard tone="active" icon={<Users size={20} strokeWidth={2} />} value={stats.total_users} label="Registered Users" />
        <StatCard tone="lost" icon={<FileText size={20} strokeWidth={2} />} value={stats.total_reports} label="Total Reports" />
        <StatCard tone="found" icon={<Activity size={20} strokeWidth={2} />} value={stats.active_cases} label="Active Cases" />
        <StatCard tone="reunited" icon={<CheckCircle2 size={20} strokeWidth={2} />} value={stats.resolved_cases} label="Resolved Cases" />
      </div>

      {/* Quick Action Control Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px", margin: "24px 0" }}>
        <div className="card" style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "12px", borderLeft: "4px solid var(--gold-500)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(201, 165, 72, 0.12)", color: "var(--gold-600)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserCheck size={18} />
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.02rem", fontWeight: 700, color: "var(--ink)" }}>User &amp; Role Management</h3>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--slate-500)" }}>Manage permissions and review student accounts.</p>
            </div>
          </div>
          <Link to="/admin/users" className="btn btn--outline btn--sm" style={{ alignSelf: "flex-start", marginTop: "auto", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            Open User Directory <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card" style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "12px", borderLeft: "4px solid var(--blue-500)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(52, 89, 163, 0.12)", color: "var(--blue-500)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={18} />
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.02rem", fontWeight: 700, color: "var(--ink)" }}>Moderation &amp; Case Verification</h3>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--slate-500)" }}>Update item statuses, verify claims, and resolve tickets.</p>
            </div>
          </div>
          <Link to="/admin/reports" className="btn btn--outline btn--sm" style={{ alignSelf: "flex-start", marginTop: "auto", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            Moderate Reports <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="dash-page__section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h2 style={{ margin: 0 }}>Recent Campus Submissions</h2>
          <Link to="/admin/reports" style={{ fontSize: "0.86rem", color: "var(--blue-500)", fontWeight: 600, textDecoration: "none" }}>
            View all reports &rarr;
          </Link>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Reporter</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>#{item.id}</td>
                  <td style={{ fontWeight: 600 }}>{item.title}</td>
                  <td><Badge status={item.type} /></td>
                  <td><Badge status={item.status || "active"} /></td>
                  <td>{item.reporter || "Student"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


