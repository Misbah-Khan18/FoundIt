import { useState, useMemo } from "react";
import { HandCoins, Search, Info, Mail, Phone, Calendar, MapPin, Tag, CheckCircle2, XCircle } from "lucide-react";
import EmptyState from "../../components/EmptyState.jsx";
import { useAdmin } from "../../context/AdminContext.jsx";
import { API_BASE_URL } from "../../context/AuthContext.jsx";

export default function AdminClaims() {
  const { claims, approveClaim, rejectClaim, requestClaimInfo, markAsReturned, loading } = useAdmin();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
      <div className="dash-page__header">
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--gold-600)", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
          <HandCoins size={15} /> Server-Side Ownership Verification
        </div>
        <h1>Claims Verification</h1>
        <p>Review student claim requests, evaluate proof of ownership statements, and authorize custody handovers.</p>
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

        <div style={{ display: "flex", gap: "8px" }}>
          {["all", "pending", "approved", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                border: "1px solid var(--border-light)",
                background: statusFilter === s ? "var(--navy-900)" : "#ffffff",
                color: statusFilter === s ? "#ffffff" : "var(--slate-600)",
                padding: "6px 14px",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "0.82rem",
                textTransform: "capitalize",
                cursor: "pointer",
                transition: "all 0.15s ease",
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
                  borderLeft: claim.status === "approved" ? "4px solid var(--emerald-600)" : claim.status === "rejected" ? "4px solid var(--red-500)" : "4px solid var(--gold-500)",
                  margin: 0,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "12px" }}>
                  <div style={{ display: "flex", gap: "16px", flex: 1, minWidth: "280px" }}>
                    {imgSrc && (
                      <div style={{ width: "80px", height: "80px", borderRadius: "10px", overflow: "hidden", flexShrink: 0, background: "#f1f5f9", border: "1px solid var(--border-light)" }}>
                        <img src={imgSrc} alt={claim.itemTitle} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--slate-500)", fontWeight: 700 }}>Claim #{claim.id}</span>
                        <span style={{ fontSize: "0.75rem", background: "rgba(30, 54, 116, 0.08)", color: "var(--navy-900)", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>
                          Item #{claim.itemId}
                        </span>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontWeight: 800,
                            background: claim.status === "approved" ? "rgba(16, 185, 129, 0.15)" : claim.status === "rejected" ? "rgba(210, 31, 43, 0.15)" : "rgba(201, 165, 72, 0.18)",
                            color: claim.status === "approved" ? "var(--emerald-600)" : claim.status === "rejected" ? "var(--red-500)" : "var(--gold-600)",
                            textTransform: "uppercase",
                          }}
                        >
                          {claim.verificationStatus || claim.status}
                        </span>
                      </div>
                      <h3 style={{ margin: "0 0 4px", fontSize: "1.15rem", fontWeight: 700, color: "var(--ink)" }}>
                        {claim.itemTitle}
                      </h3>
                      <div style={{ display: "flex", gap: "12px", fontSize: "0.78rem", color: "var(--slate-500)" }}>
                        <span><Tag size={12} /> {claim.category}</span>
                        <span><MapPin size={12} /> {claim.location}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: "0.8rem", color: "var(--slate-500)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Calendar size={13} /> {claim.date}
                  </div>
                </div>

                {/* Claimant Information & Proof Description */}
                <div style={{ padding: "14px 18px", background: "var(--ivory)", borderRadius: "10px", border: "1px solid var(--border-light)", marginBottom: "16px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "18px", fontSize: "0.84rem", marginBottom: "10px", color: "var(--slate-700)" }}>
                    <div><strong>Claimant:</strong> {claim.claimantName}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><Mail size={13} /> {claim.claimantEmail}</div>
                    {claim.claimantPhone && (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><Phone size={13} /> {claim.claimantPhone}</div>
                    )}
                  </div>

                  <div style={{ fontSize: "0.88rem", color: "var(--ink)", lineHeight: 1.5, background: "#ffffff", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--border-light)" }}>
                    <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--slate-500)", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: "4px" }}>
                      CLAIMANT PROOF STATEMENT &amp; DESCRIPTION:
                    </span>
                    "{claim.message}"
                  </div>
                </div>

                {/* Action Toolbar */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "flex-end" }}>
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
                        className="btn btn--outline btn--sm"
                        style={{ borderColor: "var(--red-500)", color: "var(--red-500)", fontSize: "0.78rem" }}
                        onClick={() => rejectClaim(claim.id)}
                      >
                        <XCircle size={14} /> Reject Claim
                      </button>
                      <button
                        className="btn btn--emerald btn--sm"
                        style={{ fontSize: "0.78rem" }}
                        onClick={() => approveClaim(claim.id)}
                      >
                        <CheckCircle2 size={14} /> Approve Ownership
                      </button>
                    </>
                  )}

                  {claim.status === "approved" && (
                    <button
                      className="btn btn--emerald btn--sm"
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

