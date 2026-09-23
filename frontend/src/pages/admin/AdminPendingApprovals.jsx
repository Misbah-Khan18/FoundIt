import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Search, CheckCircle2, Eye, Tag, MapPin, Calendar, User, ExternalLink } from "lucide-react";
import Badge from "../../components/Badge.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ItemDetailsModal from "../../components/admin/ItemDetailsModal.jsx";
import MarkFoundModal from "../../components/admin/MarkFoundModal.jsx";
import AdminSyncBadge from "../../components/admin/AdminSyncBadge.jsx";
import { useAdmin } from "../../context/AdminContext.jsx";

export default function AdminPendingApprovals() {
  const { items, approveReport, rejectReport, markAsFound, markAsReturned, deleteReport, refreshAdminData } = useAdmin();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [markFoundTarget, setMarkFoundTarget] = useState(null);

  useEffect(() => {
    refreshAdminData();
  }, [refreshAdminData]);

  const pendingItems = useMemo(() => {
    return items
      .filter((i) => i.status === "under_review" || i.status === "pending")
      .filter((i) => typeFilter === "all" || i.type === typeFilter)
      .filter(
        (i) =>
          i.title.toLowerCase().includes(query.toLowerCase()) ||
          (i.location && i.location.toLowerCase().includes(query.toLowerCase())) ||
          (i.reporter && i.reporter.toLowerCase().includes(query.toLowerCase()))
      );
  }, [items, query, typeFilter]);

  return (
    <div className="dash-page">
      <div className="dash-page__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#7c3aed", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
            <ShieldAlert size={15} /> Moderation Queue
          </div>
          <h1>Pending Approvals</h1>
          <p>Review newly filed lost &amp; found submissions from students before public directory publication.</p>
        </div>
        <AdminSyncBadge />
      </div>

      {/* Filter and search bar */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          flexWrap: "wrap",
          gap: "14px",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "0 0 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}>
          <Search size={16} color="var(--slate-400)" />
          <input
            className="input"
            style={{ width: "100%" }}
            placeholder="Search by title, location, or reporter name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {["all", "lost", "found"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                border: typeFilter === t ? "1px solid rgba(124, 58, 237, 0.4)" : "1px solid #e2e8f0",
                background: typeFilter === t ? "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" : "#f1f5f9",
                color: typeFilter === t ? "#ffffff" : "#64748b",
                padding: "6px 14px",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "0.82rem",
                textTransform: "capitalize",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: typeFilter === t ? "0 2px 10px rgba(124, 58, 237, 0.25)" : "none",
              }}
            >
              {t === "all" ? "All Queue" : `${t} Reports`}
            </button>
          ))}
        </div>
      </div>

      {/* Pending Items List */}
      {pendingItems.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 size={32} strokeWidth={2} />}
          title="Moderation Queue Clear!"
          description={query ? "No pending submissions match your search query." : "There are currently zero pending report submissions requiring moderation."}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {pendingItems.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: "22px 26px",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: "20px",
                alignItems: "center",
                borderLeft: item.type === "lost" ? "4px solid #ef4444" : "4px solid #3b82f6",
                margin: 0,
              }}
            >
              {item.image ? (
                <div style={{ width: "84px", height: "84px", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(139, 92, 246, 0.15)", flexShrink: 0, background: "#f1f5f9" }}>
                  <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <div
                  style={{
                    width: "84px",
                    height: "84px",
                    borderRadius: "10px",
                    background: "#f8f9fe",
                    border: "1px solid rgba(139, 92, 246, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94a3b8",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  No Photo
                </div>
              )}

              {/* Information */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <Badge status={item.type} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "#7c3aed", fontWeight: 700 }}>#{item.id}</span>
                  <span style={{ fontSize: "0.75rem", background: "#fef3c7", color: "#d97706", padding: "2px 8px", borderRadius: "4px", fontWeight: 800 }}>
                    Awaiting Review
                  </span>
                </div>
                <h3 style={{ margin: "0 0 6px", fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>{item.title}</h3>
                <p style={{ margin: "0 0 10px", fontSize: "0.86rem", color: "#475569", lineHeight: 1.4 }}>
                  {item.description || "No description logged."}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", fontSize: "0.8rem", color: "#64748b" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Tag size={13} color="#7c3aed" /> {item.category || "General"}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <MapPin size={13} color="#ef4444" /> {item.location}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Calendar size={13} color="#d97706" /> {item.date || "Recent"}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <User size={13} /> {item.reporter || "Student"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "130px" }}>
                <button
                  className="btn btn--primary btn--sm"
                  style={{ width: "100%", justifyContent: "center", fontSize: "0.8rem" }}
                  onClick={() => approveReport(item.id)}
                >
                  ✓ Approve
                </button>
                <button
                  className="btn btn--danger-outline btn--sm"
                  style={{ width: "100%", justifyContent: "center", fontSize: "0.8rem" }}
                  onClick={() => rejectReport(item.id)}
                >
                  ✕ Reject
                </button>
                <button
                  className="btn btn--outline btn--sm"
                  style={{ width: "100%", justifyContent: "center", fontSize: "0.78rem" }}
                  onClick={() => setSelectedItem(item)}
                >
                  <Eye size={13} /> View Details
                </button>
                <Link
                  to={`/items/${item.id}`}
                  className="btn btn--outline btn--sm"
                  style={{ width: "100%", justifyContent: "center", fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  title="View Public Card"
                >
                  Public Card <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
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
    </div>
  );
}

