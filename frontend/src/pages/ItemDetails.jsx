import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Calendar, User, ArrowLeft, Search, Tag, HandCoins, X, ShieldAlert } from "lucide-react";
import Badge from "../components/Badge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoginModal from "../components/LoginModal.jsx";
import { useReports } from "../context/ReportsContext.jsx";
import { useAuth, API_BASE_URL } from "../context/AuthContext.jsx";
import "./ItemDetails.css";

export default function ItemDetails() {
  const { id } = useParams();
  const { items } = useReports();
  const [modalOpen, setModalOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [claimSuccessMsg, setClaimSuccessMsg] = useState("");
  const [claimText, setClaimText] = useState("");
  const { user, isAuthenticated } = useAuth();

  const item = items.find((i) => String(i.id) === String(id));

  if (!item) {
    return (
      <section className="section">
        <div className="section-inner">
          <EmptyState
            icon={<Search size={22} strokeWidth={2} />}
            title="Item not found"
            description={`No report matches ID "${id}".`}
          />
        </div>
      </section>
    );
  }

  const backTo = item.type === "lost" ? "/lost-items" : "/found-items";
  const backLabel = item.type === "lost" ? "Lost Items" : "Found Items";

  const isReporter = user && item.user_id && Number(user.id) === Number(item.user_id);
  const isClaimable = item.type === "found" && item.status !== "claimed" && item.status !== "resolved";

  const handleOpenClaimModal = () => {
    if (!isAuthenticated) {
      setModalOpen(true);
      return;
    }
    setClaimError("");
    setClaimModalOpen(true);
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!claimText.trim()) {
      setClaimError("Please provide verification details or proof of ownership.");
      return;
    }

    setClaimLoading(true);
    setClaimError("");

    try {
      const res = await fetch(`${API_BASE_URL}/claims/create.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ item_id: Number(id), message: claimText.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 401) {
          setClaimModalOpen(false);
          setModalOpen(true);
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(data.message || "Failed to submit ownership claim.");
      }

      setClaimed(true);
      setClaimSuccessMsg(data.message || "Ownership claim submitted successfully!");
      setClaimModalOpen(false);
      setClaimText("");
    } catch (err) {
      setClaimError(err.message || "Error submitting claim request.");
    } finally {
      setClaimLoading(false);
    }
  };

  return (
    <section className="section item-details">
      <div className="section-inner">
        <Link to={backTo} className="item-details__back">
          <ArrowLeft size={16} strokeWidth={2} /> Back to {backLabel}
        </Link>

        <div className="item-details__card card">
          {/* Display attached image if present */}
          {item.image && (
            <div className="item-details__image-wrap">
              <img
                src={item.image.startsWith("http") || item.image.startsWith("/") ? item.image : `${API_BASE_URL.replace(/\/api$/, "")}/${item.image}`}
                alt={item.title}
                className="item-details__image"
              />
            </div>
          )}

          <div className="item-details__top">
            <Badge status={item.type} />
            <span className="item-details__id">#{item.id}</span>
          </div>

          <h1 className="item-details__title">{item.title}</h1>
          <p className="item-details__desc">{item.description}</p>

          <div className="item-details__meta">
            <span><Tag size={16} strokeWidth={2} /> {item.category || "General"}</span>
            <span><MapPin size={16} strokeWidth={2} /> {item.location}</span>
            <span><Calendar size={16} strokeWidth={2} /> {item.date}</span>
            <span><User size={16} strokeWidth={2} /> Reported by {item.reporter || "Student"}</span>
          </div>

          {claimError && !claimModalOpen && (
            <div style={{ padding: "0.75rem 1rem", marginTop: "1rem", borderRadius: "0.5rem", background: "rgba(210, 31, 43, 0.08)", color: "var(--red-500)", border: "1px solid rgba(210, 31, 43, 0.2)", fontSize: "0.9rem" }}>
              ⚠️ {claimError}
            </div>
          )}

          {claimed ? (
            <div style={{ padding: "0.85rem 1.2rem", marginTop: "1.2rem", borderRadius: "0.5rem", background: "rgba(16, 185, 129, 0.12)", color: "var(--emerald-700)", border: "1px solid rgba(16, 185, 129, 0.3)", fontSize: "0.92rem", fontWeight: 600 }}>
              ✓ {claimSuccessMsg || "Claim submitted successfully! Waiting for administrator review."}
            </div>
          ) : isReporter ? (
            <div style={{ padding: "0.75rem 1rem", marginTop: "1rem", borderRadius: "0.5rem", background: "var(--ivory)", color: "var(--slate-600)", border: "1px solid var(--border-light)", fontSize: "0.85rem" }}>
              ℹ You reported this item.
            </div>
          ) : isClaimable ? (
            <button 
              className="btn btn--emerald" 
              onClick={handleOpenClaimModal}
              style={{ marginTop: "1.2rem", display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <HandCoins size={18} /> Claim This Item
            </button>
          ) : null}
        </div>
      </div>

      {/* Claim Submission Modal */}
      {claimModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setClaimModalOpen(false)}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "540px",
              padding: "24px",
              borderRadius: "var(--radius-lg, 16px)",
              backgroundColor: "#ffffff",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "var(--navy-900)", display: "flex", alignItems: "center", gap: "8px" }}>
                <HandCoins size={20} color="var(--gold-600)" /> File Ownership Claim
              </h3>
              <button onClick={() => setClaimModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--slate-500)" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "12px 14px", background: "var(--ivory)", borderRadius: "8px", border: "1px solid var(--border-light)", marginBottom: "16px", fontSize: "0.86rem", color: "var(--slate-700)" }}>
              <div style={{ fontWeight: 700, color: "var(--navy-900)", marginBottom: "4px" }}>Item: {item.title}</div>
              <div>📍 Location: {item.location} • 📅 Found Date: {item.date}</div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", background: "rgba(201, 165, 72, 0.1)", padding: "10px 12px", borderRadius: "6px", fontSize: "0.8rem", color: "var(--navy-900)", marginBottom: "16px" }}>
              <ShieldAlert size={16} style={{ minWidth: "16px", marginTop: "2px", color: "var(--gold-600)" }} />
              <span>This claim will be reviewed by an administrator. Please provide specific proof (e.g. serial numbers, wallpaper, unique scratches, receipts, or contents).</span>
            </div>

            {claimError && (
              <div style={{ padding: "10px 12px", marginBottom: "14px", borderRadius: "6px", background: "rgba(210, 31, 43, 0.08)", color: "var(--red-500)", border: "1px solid rgba(210, 31, 43, 0.2)", fontSize: "0.84rem" }}>
                ⚠️ {claimError}
              </div>
            )}

            <form onSubmit={handleClaimSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 700, color: "var(--navy-900)", marginBottom: "6px" }}>
                  Verification Details &amp; Proof of Ownership *
                </label>
                <textarea
                  className="input"
                  rows={4}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px" }}
                  placeholder="Describe unique marks, serial number, lock screen wallpaper, color of case, or exact contents inside..."
                  value={claimText}
                  onChange={(e) => setClaimText(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="btn btn--outline btn--sm" onClick={() => setClaimModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--emerald btn--sm" disabled={claimLoading}>
                  {claimLoading ? "Submitting..." : "Submit Claim for Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <LoginModal
        open={modalOpen}
        intendedAction={item.type}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
}
