import { BarChart3, ShieldCheck, CheckCircle2, Users, FileText } from "lucide-react";
import AdminCharts from "../../components/admin/AdminCharts.jsx";
import StatCard from "../../components/StatCard.jsx";
import { useAdmin } from "../../context/AdminContext.jsx";

export default function AdminAnalytics() {
  const { stats } = useAdmin();

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--navy-900)", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
          <BarChart3 size={15} /> Operational Intelligence
        </div>
        <h1>Portal-Wide Analytics &amp; Reports</h1>
        <p>Comprehensive incident metrics, resolution speeds, and campus recovery trends for MIT-WPU.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        <StatCard tone="reunited" icon={<CheckCircle2 size={20} />} value={`${stats.recoveryRate}%`} label="Overall Recovery Rate" />
        <StatCard tone="lost" icon={<FileText size={20} />} value={stats.totalLost} label="Lost Item Reports" />
        <StatCard tone="found" icon={<ShieldCheck size={20} />} value={stats.totalFound} label="Found Items Recovered" />
        <StatCard tone="active" icon={<Users size={20} />} value={stats.totalUsers} label="Verified Portal Users" />
      </div>

      <AdminCharts />
    </div>
  );
}
