import { useState, useEffect } from "react";
import { HandCoins, MapPin, Calendar, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../components/Badge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { API_BASE_URL } from "../context/AuthContext.jsx";

export default function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const backendHost = API_BASE_URL.replace(/\/api$/, "");

  const fetchClaims = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/claims/my-claims.php`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setClaims(data.claims || []);
        } else {
          setError(data.message || "Failed to load claims.");
        }
      } else if (res.status === 401) {
        setError("Please log in to view your claims.");
      } else {
        setError("Unable to load claims.");
      }
    } catch (err) {
      console.warn("Error fetching claims:", err);
      setError("Network error loading claims.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const getImageSrc = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith("http://") || imgPath.startsWith("https://") || imgPath.startsWith("data:")) {
      return imgPath;
    }
    const cleanPath = imgPath.startsWith("/") ? imgPath : "/" + imgPath;
    return `${backendHost}${cleanPath}`;
  };

  if (loading) {
    return (
      <div className="dash-page">
        <div className="dash-page__header">
          <h1>My Claims</h1>
          <p>Loading your ownership claims from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--gold-600)", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
          <HandCoins size={15} /> Student Claim History
        </div>
        <h1>My Claims</h1>
        <p>Track the verification and review status of ownership claims you have filed for Found items.</p>
      </div>

      {error ? (
        <EmptyState
          icon={<HandCoins size={32} strokeWidth={2} />}
          title="Notice"
          description={error}
        />
      ) : claims.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {claims.map((claim) => {
            const imgSrc = getImageSrc(claim.item_image);
            return (
              <div key={claim.id} className="card" style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: "16px", flex: 1, minWidth: "280px" }}>
                    {imgSrc && (
                      <div style={{ width: "90px", height: "90px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, background: "#f1f5f9" }}>
                        <img src={imgSrc} alt={claim.item_title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span className="eyebrow" style={{ color: "var(--navy-900)" }}>Claim #{claim.id}</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>• Ref Item #{claim.item_id}</span>
                      </div>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 6px", color: "var(--ink)" }}>
                        {claim.item_title || "Claimed Item"}
                      </h3>
                      {claim.message && (
                        <div style={{ fontSize: "0.86rem", color: "var(--slate-700)", margin: "0 0 10px", lineHeight: 1.45, background: "var(--ivory)", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border-light)" }}>
                          <strong>Your Ownership Statement:</strong> "{claim.message}"
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "0.82rem", color: "var(--slate-500)", flexWrap: "wrap" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Tag size={13} /> {claim.item_category || "General"}
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <MapPin size={13} /> {claim.item_location || "Campus"}
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={13} /> {claim.created_at ? new Date(claim.created_at).toLocaleDateString() : "Recent"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                    <Badge status={claim.status || "pending"} />
                    <Link to={`/items/${claim.item_id}`} className="btn btn--outline btn--sm">
                      View Item Details &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<HandCoins size={24} strokeWidth={2} />}
          title="No claims filed yet"
          description="When you identify an item belonging to you and file an ownership claim, it will appear here."
        />
      )}
    </div>
  );
}
