import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Eye, ClipboardList, Trash2, ExternalLink } from "lucide-react";
import Badge from "../components/Badge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ItemDetailsModal from "../components/admin/ItemDetailsModal.jsx";
import MarkFoundModal from "../components/admin/MarkFoundModal.jsx";
import AdminSyncBadge from "../components/admin/AdminSyncBadge.jsx";
import { useAdmin } from "../context/AdminContext.jsx";

export default function ManageReports() {
  const { items, approveReport, rejectReport, markAsFound, markAsReturned, deleteReport, refreshAdminData } = useAdmin();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [markFoundTarget, setMarkFoundTarget] = useState(null);

  useEffect(() => {
    refreshAdminData();
  }, [refreshAdminData]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set();
    items.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items
      .filter((i) => typeFilter === "all" || i.type === typeFilter)
      .filter((i) => statusFilter === "all" || i.status === statusFilter)
      .filter((i) => categoryFilter === "all" || i.category === categoryFilter)
      .filter(
        (i) =>
          i.title.toLowerCase().includes(query.toLowerCase()) ||
          (i.location && i.location.toLowerCase().includes(query.toLowerCase())) ||
          (i.reporter && i.reporter.toLowerCase().includes(query.toLowerCase())) ||
          (i.category && i.category.toLowerCase().includes(query.toLowerCase()))
      );
  }, [items, query, typeFilter, statusFilter, categoryFilter]);

  return (
    <div className="dash-page">
      <div className="dash-page__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#7c3aed", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
            <ClipboardList size={15} /> Management Registry
          </div>
          <h1>Lost &amp; Found Reports</h1>
          <p>Centralized institutional directory of all campus items, submission statuses, and moderation histories.</p>
        </div>
        <AdminSyncBadge />
      </div>

      {/* Filter toolbar */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "0 0 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}>
          <Search size={16} color="var(--slate-400)" />
          <input
            className="input"
            style={{ width: "100%" }}
            placeholder="Search by title, location, category, or reporter..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <select className="select" style={{ width: "auto", minWidth: "120px" }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="lost">Lost Reports</option>
            <option value="found">Found Reports</option>
          </select>

          {categories.length > 0 && (
            <select className="select" style={{ width: "auto", minWidth: "140px" }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          <select className="select" style={{ width: "auto", minWidth: "140px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="matched">Matched</option>
            <option value="claimed">Claimed</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table view */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<Search size={32} strokeWidth={2} />}
          title="No Reports Found"
          description="No lost or found records match your current search and filter criteria."
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>ID</th>
                <th>Item &amp; Category</th>
                <th>Report Type</th>
                <th>Campus Location</th>
                <th>Reporter</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "#7c3aed", fontWeight: 700 }}>#{item.id}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.92rem" }}>{item.title}</div>
                    <div style={{ fontSize: "0.76rem", color: "#64748b", marginTop: "2px" }}>{item.category || "General"}</div>
                  </td>
                  <td><Badge status={item.type} /></td>
                  <td style={{ fontSize: "0.86rem", color: "#475569" }}>{item.location || "Campus"}</td>
                  <td style={{ fontSize: "0.86rem", color: "#1e293b", fontWeight: 500 }}>{item.reporter || "Student"}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "#64748b" }}>{item.date || "Recent"}</td>
                  <td><Badge status={item.status || "active"} /></td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "6px" }}>
                      <Link
                        to={`/items/${item.id}`}
                        className="btn btn--outline btn--sm"
                        style={{ padding: "4px 8px", fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: "3px" }}
                        title="View Public Card"
                      >
                        Public Card <ExternalLink size={12} />
                      </Link>
                      <button
                        className="btn btn--outline btn--sm"
                        style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                        title="Inspect Report Details"
                        onClick={() => setSelectedItem(item)}
                      >
                        <Eye size={13} /> View
                      </button>
                      <button
                        className="btn btn--danger-outline btn--sm"
                        style={{ padding: "4px 8px" }}
                        title="Delete Report"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to permanently delete report #${item.id} "${item.title}"?`)) {
                            deleteReport(item.id);
                          }
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

