import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { HandCoins, Search, Info, Mail, Phone, Calendar, MapPin, Tag, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import EmptyState from "../../components/EmptyState.jsx";
import AdminSyncBadge from "../../components/admin/AdminSyncBadge.jsx";
import { useAdmin } from "../../context/AdminContext.jsx";
import { API_BASE_URL } from "../../context/AuthContext.jsx";

export default function AdminClaims() {
  const { claims, approveClaim, rejectClaim, requestClaimInfo, markAsReturned, refreshAdminData, loading } = useAdmin();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    refreshAdminData();
  }, [refreshAdminData]);

  const backendHost = API_BASE_URL.replace(/\/api$/, "");

  const getImageSrc = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith("http://") || imgPath.startsWith("https://") || imgPath.startsWith("data:")) {
      return imgPath;
    }
    const cleanPath = imgPath.startsWith("/") ? imgPath : "/" + imgPath;
    return `${backendHost}${cleanPath}`;
  };

  const filteredClaims = useMemo(() => {
    return claims
      .filter((c) => statusFilter === "all" || c.status === statusFilter)
      .filter(
        (c) =>
          (c.itemTitle && c.itemTitle.toLowerCase().includes(query.toLowerCase())) ||
          (c.claimantName && c.claimantName.toLowerCase().includes(query.toLowerCase())) ||
          (c.claimantEmail && c.claimantEmail.toLowerCase().includes(query.toLowerCase())) ||
          (c.message && c.message.toLowerCase().includes(query.toLowerCase()))
      );
  }, [claims, query, statusFilter]);

  if (loading) {
    return (
      <div className="dash-page">
        <div className="dash-page__header">
          <h1>Claims Verification</h1>
          <p>Loading pending claims from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <div className="dash-page__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#7c3aed", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
            <HandCoins size={15} /> Server-Side Ownership Verification
          </div>
          <h1>Claims Verification</h1>
          <p>Review student claim requests, evaluate proof of ownership statements, and authorize custody handovers.</p>
        </div>
        <AdminSyncBadge />
      </div>

      {/* Filters & Search */}
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
            placeholder="Search by claimant, email address, or item name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["all", "pending", "approved", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                border: statusFilter === s ? "1px solid rgba(124, 58, 237, 0.4)" : "1px solid #e2e8f0",
                background: statusFilter === s ? "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" : "#f1f5f9",
                color: statusFilter === s ? "#ffffff" : "#64748b",
                padding: "6px 14px",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "0.82rem",
                textTransform: "capitalize",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: statusFilter === s ? "0 2px 10px rgba(124, 58, 237, 0.25)" : "none",
              }}
            >
              {s === "all" ? "All Claims" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Claims List */}
      {filteredClaims.length === 0 ? (
        <EmptyState
          icon={<HandCoins size={32} strokeWidth={2} />}
          title="No Claims Found"
          description="There are no ownership claims matching your current search and status filters."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredClaims.map((claim) => {
            const imgSrc = getImageSrc(claim.itemImage);
            return (
              <div
                key={claim.id}
                className="card"
                style={{
                  padding: "22px 26px",
                  borderLeft: claim.status === "approved" ? "4px solid #10b981" : claim.status === "rejected" ? "4px solid #ef4444" : "4px solid #f59e0b",
                  margin: 0,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "12px" }}>
                  <div style={{ display: "flex", gap: "16px", flex: 1, minWidth: "280px" }}>
                    {imgSrc && (
                      <div style={{ width: "80px", height: "80px", borderRadius: "10px", overflow: "hidden", flexShrink: 0, background: "#f1f5f9", border: "1px solid rgba(139, 92, 246, 0.15)" }}>
                        <img src={imgSrc} alt={claim.itemTitle} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "#7c3aed", fontWeight: 700 }}>Claim #{claim.id}</span>
                        <span style={{ fontSize: "0.75rem", background: "#f5f3ff", color: "#7c3aed", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>
                          Item #{claim.itemId}
                        </span>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontWeight: 800,
                            background: claim.status === "approved" ? "#ecfdf5" : claim.status === "rejected" ? "#fff1f2" : "#fef3c7",
                            color: claim.status === "approved" ? "#059669" : claim.status === "rejected" ? "#e11d48" : "#d97706",
                            textTransform: "uppercase",
                          }}
                        >
                          {claim.verificationStatus || claim.status}
                        </span>
                      </div>
                      <h3 style={{ margin: "0 0 4px", fontSize: "1.15rem", fontWeight: 700, color: "#0f172a" }}>
                        {claim.itemTitle}
                      </h3>
                      <div style={{ display: "flex", gap: "12px", fontSize: "0.78rem", color: "#64748b" }}>
                        <span><Tag size={12} color="#7c3aed" /> {claim.category}</span>
                        <span><MapPin size={12} color="#ef4444" /> {claim.location}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Calendar size={13} color="#d97706" /> {claim.date}
                  </div>
                </div>

                {/* Claimant Information & Proof Description */}
                <div style={{ padding: "16px 18px", background: "#f8f9fe", borderRadius: "10px", border: "1px solid rgba(139, 92, 246, 0.14)", marginBottom: "16px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "18px", fontSize: "0.84rem", marginBottom: "12px", color: "#334155" }}>
                    <div><strong style={{ color: "#0f172a" }}>Claimant:</strong> {claim.claimantName}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><Mail size={13} color="#7c3aed" /> {claim.claimantEmail}</div>
                    {claim.claimantPhone && (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><Phone size={13} color="#7c3aed" /> {claim.claimantPhone}</div>
                    )}
                  </div>

                  <div style={{ fontSize: "0.88rem", color: "#1e293b", lineHeight: 1.5, background: "#ffffff", padding: "12px 14px", borderRadius: "8px", border: "1px solid rgba(139, 92, 246, 0.16)" }}>
                    <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: "4px" }}>
                      CLAIMANT PROOF STATEMENT &amp; DESCRIPTION:
                    </span>
                    "{claim.message}"
                  </div>
                </div>

                {/* Action Toolbar */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "flex-end" }}>
                  <Link
                    to={`/items/${claim.itemId}`}
                    className="btn btn--outline btn--sm"
                    style={{ fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
                    title="View item public card"
                  >
                    Public Card <ExternalLink size={12} />
                  </Link>
                  {claim.status === "pending" && (
                    <>
                      <button
                        className="btn btn--outline btn--sm"
                        onClick={() => requestClaimInfo(claim.id)}
                        style={{ fontSize: "0.78rem" }}
                      >
                        <Info size={13} /> Request More Proof
                      </button>
                      <button
                        className="btn btn--danger-outline btn--sm"
                        style={{ fontSize: "0.78rem" }}
                        onClick={() => rejectClaim(claim.id)}
                      >
                        <XCircle size={14} /> Reject Claim
                      </button>
                      <button
                        className="btn btn--primary btn--sm"
                        style={{ fontSize: "0.78rem" }}
                        onClick={() => approveClaim(claim.id)}
                      >
                        <CheckCircle2 size={14} /> Approve Ownership
                      </button>
                    </>
                  )}

                  {claim.status === "approved" && (
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={() => markAsReturned(claim.itemId, claim.claimantName)}
                    >
                      <CheckCircle2 size={14} /> Complete Handover &amp; Return
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

