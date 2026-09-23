import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  Calendar,
  User,
  ArrowLeft,
  Search,
  Tag,
  HandCoins,
  X,
  ShieldAlert,
  Share2,
  Check,
  Building2,
  Sparkles,
  Maximize2,
  ChevronRight,
  ShieldCheck,
  Info,
} from "lucide-react";
import Badge from "../components/Badge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoginModal from "../components/LoginModal.jsx";
import StatusTimeline from "../components/StatusTimeline.jsx";
import { useReports } from "../context/ReportsContext.jsx";
import { useAuth, API_BASE_URL, fetchWithCsrf } from "../context/AuthContext.jsx";
import "./ItemDetails.css";

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items } = useReports();
  const { user, isAuthenticated } = useAuth();

  const [item, setItem] = useState(() => items.find((i) => String(i.id) === String(id)) || null);
  const [loading, setLoading] = useState(() => !items.find((i) => String(i.id) === String(id)));
  const [copied, setCopied] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // Claim modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [claimSuccessMsg, setClaimSuccessMsg] = useState("");
  const [claimText, setClaimText] = useState("");

  // 1. Fetch item from Backend detail API
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/items/detail.php?id=${id}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.item && !ignore) {
            setItem(data.item);
          }
        }
      } catch (err) {
        console.warn("Could not fetch remote item details:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [id]);

  const isAdmin = Boolean(user && (user.role === "admin" || user.is_admin));

  // Handle Smart "Go Back" Navigation
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(isAdmin ? "/admin/reports" : "/dashboard/reports");
    }
  };

  // Handle Share / Copy Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const isReporter =
    user && item && (Number(user.id) === Number(item.user_id) || item.is_reporter);

  const isClaimable =
    item &&
    item.type === "found" &&
    item.status !== "claimed" &&
    item.status !== "resolved";

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
      const res = await fetchWithCsrf(`${API_BASE_URL}/claims/create.php`, {
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
      window.dispatchEvent(new Event("foundit-refresh-notifications"));

      try {
        const channel = new BroadcastChannel("foundit_sync_channel");
        channel.postMessage({ type: "SYNC_CLAIM_CREATED", itemId: id });
        channel.close();
      } catch {
        // ignore
      }
      window.dispatchEvent(new CustomEvent("foundit-refresh-admin"));
    } catch (err) {
      setClaimError(err.message || "Error submitting claim request.");
    } finally {
      setClaimLoading(false);
    }
  };

  if (loading && !item) {
    return (
      <section className="section item-details-page">
        <div className="section-inner" style={{ maxWidth: "860px", padding: "40px 20px", textAlign: "center" }}>
          <div style={{ color: "#7c3aed", fontWeight: 700, fontSize: "1rem" }}>
            Loading public report details...
          </div>
        </div>
      </section>
    );
  }

  if (!item) {
    return (
      <section className="section item-details-page">
        <div className="section-inner" style={{ maxWidth: "860px", padding: "40px 20px" }}>
          <button onClick={handleGoBack} className="item-details__back-btn">
            <ArrowLeft size={16} strokeWidth={2.5} /> Go Back
          </button>
          <EmptyState
            icon={<Search size={24} strokeWidth={2} />}
            title="Report Not Found"
            description={`No lost or found report matches tracking ID #${id}.`}
          />
        </div>
      </section>
    );
  }

  const backendHost = API_BASE_URL.replace(/\/api$/, "");
  const imageSrc = item.image
    ? item.image.startsWith("http") || item.image.startsWith("/")
      ? item.image
      : `${backendHost}/${item.image}`
    : null;

  return (
    <section className="section item-details-page">
      <div className="section-inner" style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
        {/* TOP NAVIGATION / BREADCRUMBS & GO BACK */}
        <div className="item-details__nav-bar">
          <button onClick={handleGoBack} className="item-details__back-btn" title="Return to previous screen">
            <ArrowLeft size={16} strokeWidth={2.5} /> Go Back
          </button>

          <div className="item-details__breadcrumbs">
            {isAdmin ? (
              <>
                <Link to="/admin" className="breadcrumb-item">Admin</Link>
                <ChevronRight size={13} className="breadcrumb-sep" />
                <Link to="/admin/reports" className="breadcrumb-item">Reports</Link>
                <ChevronRight size={13} className="breadcrumb-sep" />
                <span className="breadcrumb-current">Report #{item.id}</span>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="breadcrumb-item">Dashboard</Link>
                <ChevronRight size={13} className="breadcrumb-sep" />
                <Link to="/dashboard/reports" className="breadcrumb-item">My Reports</Link>
                <ChevronRight size={13} className="breadcrumb-sep" />
                <span className="breadcrumb-current">Report #{item.id}</span>
              </>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* ONLY visible when authenticated user is an ADMIN */}
            {isAdmin && (
              <Link
                to="/admin/pending"
                className="btn btn--primary btn--sm"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#7c3aed",
                  color: "#ffffff",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 2px 8px rgba(124, 58, 237, 0.3)",
                }}
                title="Review in Approvals queue"
              >
                <ShieldAlert size={14} color="#ffffff" />
                <span style={{ color: "#ffffff" }}>Go to Approvals</span>
              </Link>
            )}

            <button onClick={handleCopyLink} className="item-details__share-btn" title="Copy public link to clipboard">
              {copied ? (
                <>
                  <Check size={14} color="#059669" />
                  <span style={{ color: "#059669", fontWeight: 700 }}>Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span>Share Card</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* MAIN PUBLIC CARD */}
        <div className="item-details__card">
          {/* Admin Mode Top Action Strip (Admin only) */}
          {isAdmin && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 18px",
                background: "#f5f3ff",
                borderBottom: "1px solid rgba(139, 92, 246, 0.2)",
                fontSize: "0.82rem",
                color: "#6d28d9",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 700 }}>
                <ShieldAlert size={15} /> Administrator View Mode
              </span>
              <Link
                to="/admin/pending"
                style={{
                  color: "#7c3aed",
                  fontWeight: 700,
                  textDecoration: "underline",
                  fontSize: "0.82rem",
                }}
              >
                Review in Approvals →
              </Link>
            </div>
          )}

          {/* Card Header */}
          <div className="item-details__header">
            <div className="item-details__badges">
              <Badge status={item.type} />
              <Badge status={item.status || "active"} />
              <span className="item-details__ref-pill">Ref #{item.id}</span>
            </div>

            <div className="item-details__date-pill">
              <Calendar size={13} /> {item.date || "Recent"}
            </div>
          </div>

          {/* Title */}
          <h1 className="item-details__title">{item.title}</h1>

          {/* Verification Timeline */}
          <div className="item-details__timeline-box">
            <div className="item-details__timeline-label">
              <ShieldCheck size={14} color="#7c3aed" /> Verification &amp; Handover Status
            </div>
            <StatusTimeline status={item.status || "active"} itemType={item.type} />
          </div>

          {/* TWO-COLUMN DETAILS GRID */}
          <div className="item-details__grid">
            {/* LEFT: Image & Storage Custody */}
            <div className="item-details__media-col">
              {imageSrc ? (
                <div
                  className="item-details__image-container"
                  onClick={() => setImageModalOpen(true)}
                  title="Click to view full photo"
                >
                  <img src={imageSrc} alt={item.title} className="item-details__img" />
                  <div className="item-details__image-overlay">
                    <Maximize2 size={16} /> Click to Enlarge
                  </div>
                </div>
              ) : (
                <div className="item-details__no-image">
                  <div className="no-image-icon-box">
                    <Tag size={28} color="#94a3b8" />
                  </div>
                  <span className="no-image-text">No photograph attached</span>
                  <span className="no-image-sub">Detailed description verified by campus portal</span>
                </div>
              )}

              {/* Custody Info for Found Items */}
              {item.type === "found" && item.custody_desk && (
                <div className="item-details__custody-card">
                  <div className="custody-header">
                    <Building2 size={16} color="#7c3aed" />
                    <span>Campus Custody Desk</span>
                  </div>
                  <div className="custody-body">
                    {item.custody_desk}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Metadata & Description */}
            <div className="item-details__info-col">
              {/* Key Attributes Grid */}
              <div className="item-details__meta-grid">
                <div className="meta-tile">
                  <span className="meta-tile__label"><Tag size={13} color="#7c3aed" /> Category</span>
                  <span className="meta-tile__value">{item.category || "General"}</span>
                </div>

                <div className="meta-tile">
                  <span className="meta-tile__label"><MapPin size={13} color="#ef4444" /> Location</span>
                  <span className="meta-tile__value">{item.location || "Campus Area"}</span>
                </div>

                <div className="meta-tile">
                  <span className="meta-tile__label"><Calendar size={13} color="#d97706" /> Date Reported</span>
                  <span className="meta-tile__value">{item.date || "Recent"}</span>
                </div>

                <div className="meta-tile">
                  <span className="meta-tile__label"><User size={13} color="#6366f1" /> Reporter</span>
                  <span className="meta-tile__value">{item.reporter || "Campus Student"}</span>
                </div>
              </div>

              {/* Description Box */}
              <div className="item-details__desc-section">
                <h3 className="section-title">Item Description</h3>
                <p className="item-details__desc-text">
                  {item.description || "No additional description provided by reporter."}
                </p>
              </div>

              {/* Smart Match Alert Banner if linked */}
              {item.matched_item && (
                <div className="item-details__smart-match-alert">
                  <Sparkles size={18} color="#7c3aed" />
                  <div>
                    <strong style={{ color: "#0f172a" }}>Smart Match Candidate Identified!</strong>
                    <div style={{ fontSize: "0.82rem", color: "#475569", marginTop: "2px" }}>
                      Paired with Report #{item.matched_item.id} ("{item.matched_item.title}") at {item.matched_item.location} ({item.matched_item.score}% Confidence).
                    </div>
                  </div>
                </div>
              )}

              {/* Action Banner / Buttons */}
              <div className="item-details__action-row">
                {claimed ? (
                  <div className="item-details__claimed-banner">
                    ✓ {claimSuccessMsg || "Claim submitted successfully! Waiting for administrator review."}
                  </div>
                ) : isReporter ? (
                  <div className="item-details__reporter-banner">
                    <Info size={16} color="#7c3aed" />
                    <div>
                      <span>You submitted this report. Status is currently <strong>{item.status?.toUpperCase() || "ACTIVE"}</strong>.</span>
                      <div style={{ marginTop: "4px" }}>
                        <Link to="/dashboard/reports" className="btn btn--outline btn--sm" style={{ display: "inline-flex", marginTop: "6px" }}>
                          View in My Reports
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : isClaimable ? (
                  <button
                    className="btn btn--emerald"
                    onClick={handleOpenClaimModal}
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", width: "100%", justifyContent: "center", padding: "12px 20px" }}
                  >
                    <HandCoins size={18} /> File Ownership Claim
                  </button>
                ) : item.status === "resolved" ? (
                  <div className="item-details__resolved-banner">
                    <ShieldCheck size={18} color="#059669" />
                    <span>This case has been successfully resolved and returned to its verified owner.</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Full Image */}
      {imageModalOpen && imageSrc && (
        <div className="item-details__lightbox" onClick={() => setImageModalOpen(false)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setImageModalOpen(false)}>
              <X size={20} />
            </button>
            <img src={imageSrc} alt={item.title} className="lightbox-img" />
            <div className="lightbox-caption">{item.title} — Public Report #{item.id}</div>
          </div>
        </div>
      )}

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
              padding: "26px",
              borderRadius: "16px",
              backgroundColor: "#ffffff",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              boxShadow: "0 20px 50px rgba(15, 23, 42, 0.18)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                <HandCoins size={20} color="#7c3aed" /> File Ownership Claim
              </h3>
              <button
                onClick={() => setClaimModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "12px 14px", background: "#f8f9fe", borderRadius: "10px", border: "1px solid rgba(139, 92, 246, 0.14)", marginBottom: "16px", fontSize: "0.86rem", color: "#334155" }}>
              <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>Item: {item.title}</div>
              <div>📍 Location: {item.location} • 📅 Found Date: {item.date}</div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", background: "#fef3c7", padding: "10px 12px", borderRadius: "8px", fontSize: "0.82rem", color: "#92400e", marginBottom: "16px", border: "1px solid #fde68a" }}>
              <ShieldAlert size={16} style={{ minWidth: "16px", marginTop: "2px", color: "#d97706" }} />
              <span>This claim will be reviewed by campus administrators. Please describe unique characteristics (e.g. wallpapers, serial numbers, case scratches, or specific contents).</span>
            </div>

            {claimError && (
              <div style={{ padding: "10px 12px", marginBottom: "14px", borderRadius: "8px", background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", fontSize: "0.84rem" }}>
                ⚠️ {claimError}
              </div>
            )}

            <form onSubmit={handleClaimSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>
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
