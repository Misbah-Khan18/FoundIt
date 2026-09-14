import { useState, useMemo } from "react";
import { Search, ShieldCheck, Eye } from "lucide-react";
import Badge from "../../components/Badge.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ItemDetailsModal from "../../components/admin/ItemDetailsModal.jsx";
import MarkFoundModal from "../../components/admin/MarkFoundModal.jsx";
import { CATEGORIES, CAMPUS_LOCATIONS } from "../../data/mockItems.js";
import { useAdmin } from "../../context/AdminContext.jsx";

export default function AdminFoundItems() {
  const { items, approveReport, rejectReport, markAsFound, markAsReturned } = useAdmin();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [markFoundTarget, setMarkFoundTarget] = useState(null);

  const foundItems = useMemo(() => {
    return items
      .filter((i) => i.type === "found")
      .filter((i) => category === "all" || i.category === category)
      .filter((i) => location === "all" || i.location === location)
      .filter((i) => statusFilter === "all" || i.status === statusFilter)
      .filter(
        (i) =>
          i.title.toLowerCase().includes(query.toLowerCase()) ||
          (i.description && i.description.toLowerCase().includes(query.toLowerCase())) ||
          (i.reporter && i.reporter.toLowerCase().includes(query.toLowerCase()))
      );
  }, [items, query, category, location, statusFilter]);

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--blue-500)", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
          <ShieldCheck size={15} /> Custody &amp; Recovery
        </div>
        <h1>Found Items Custody Directory</h1>
        <p>Recovered items currently held at campus security desks, student welfare offices, or logged by finders.</p>
      </div>

      {/* Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: "18px 20px",
          marginBottom: "24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--ivory)", padding: "2px 8px", borderRadius: "8px", border: "1px solid var(--border-light)" }}>
          <Search size={15} color="var(--slate-400)" />
          <input
            className="input"
            style={{ border: "none", background: "transparent", padding: "8px 0" }}
            placeholder="Search found items..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select className="select" value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="all">All Custody Locations</option>
          {CAMPUS_LOCATIONS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="active">Active In Custody</option>
          <option value="under_review">Under Review</option>
          <option value="matched">Potential Match Found</option>
          <option value="claimed">Claim Verification Pending</option>
          <option value="resolved">Returned to Owner</option>
        </select>
      </div>

      {/* Found Items Table */}
      {foundItems.length === 0 ? (
        <EmptyState
          icon={<Search size={32} strokeWidth={2} />}
          title="No Found Items"
          description="No recovered items match the chosen filters."
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Item &amp; Details</th>
                <th>Category</th>
                <th>Location Found</th>
                <th>Logged By</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {foundItems.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>#{item.id}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--ink)", marginBottom: "2px" }}>{item.title}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--slate-500)", maxWidth: "260px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.description || "—"}
                    </div>
                  </td>
                  <td>{item.category || "General"}</td>
                  <td>{item.location}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.reporter || "Finder"}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>{item.date || "Recent"}</div>
                  </td>
                  <td><Badge status={item.status || "active"} /></td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "6px" }}>
                      <button
                        className="btn btn--outline btn--sm"
                        style={{ padding: "4px 8px" }}
                        title="View Full Item Details"
                        onClick={() => setSelectedItem(item)}
                      >
                        <Eye size={13} />
                      </button>

                      {item.status !== "resolved" && (
                        <button
                          className="btn btn--emerald btn--sm"
                          style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                          onClick={() => markAsReturned(item.id, "Verified Owner")}
                        >
                          Mark Returned
                        </button>
                      )}
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
