import { useState, useMemo } from "react";
import { CheckCircle2, Search, Eye } from "lucide-react";
import EmptyState from "../../components/EmptyState.jsx";
import ItemDetailsModal from "../../components/admin/ItemDetailsModal.jsx";
import { useAdmin } from "../../context/AdminContext.jsx";

export default function AdminReturnedItems() {
  const { items } = useAdmin();
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const returnedItems = useMemo(() => {
    return items
      .filter((i) => i.status === "resolved" || i.status === "returned")
      .filter(
        (i) =>
          i.title.toLowerCase().includes(query.toLowerCase()) ||
          (i.location && i.location.toLowerCase().includes(query.toLowerCase())) ||
          (i.reporter && i.reporter.toLowerCase().includes(query.toLowerCase()))
      );
  }, [items, query]);

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--emerald-600)", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
          <CheckCircle2 size={15} /> Resolution Archive
        </div>
        <h1>Successfully Returned &amp; Closed Items</h1>
        <p>Audit trail of all verified campus belongings handed over to rightful owners.</p>
      </div>

      {/* Search toolbar */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Search size={16} color="var(--slate-400)" />
        <input
          className="input"
          style={{ width: "100%" }}
          placeholder="Search resolved records by item name, location, or student..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Table view */}
      {returnedItems.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 size={32} strokeWidth={2} />}
          title="No Returned Items Yet"
          description="Resolved lost and found cases will appear here once finalized."
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Item &amp; Category</th>
                <th>Original Location</th>
                <th>Owner / Resolved To</th>
                <th>Resolution Status</th>
                <th style={{ textAlign: "right" }}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {returnedItems.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>#{item.id}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--ink)" }}>{item.title}</div>
                    <div style={{ fontSize: "0.76rem", color: "var(--slate-500)" }}>{item.category || "General"}</div>
                  </td>
                  <td>{item.location}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.resolvedTo || item.reporter || "Verified Owner"}</div>
                    <div style={{ fontSize: "0.74rem", color: "var(--slate-500)" }}>Handover Verified</div>
                  </td>
                  <td>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        background: "rgba(16, 185, 129, 0.15)",
                        color: "var(--emerald-600)",
                        textTransform: "uppercase",
                      }}
                    >
                      <CheckCircle2 size={12} /> Closed &amp; Returned
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn btn--outline btn--sm"
                      style={{ padding: "4px 8px" }}
                      onClick={() => setSelectedItem(item)}
                    >
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <ItemDetailsModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
