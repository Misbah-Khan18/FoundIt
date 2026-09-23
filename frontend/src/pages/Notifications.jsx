import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  XCircle,
  Sparkles,
  HandCoins,
  CheckCheck,
  Trash2,
  ExternalLink,
  Clock,
} from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import { API_BASE_URL, fetchWithCsrf } from "../context/AuthContext.jsx";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" | "unread"

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/notifications/list.php`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && !ignore) {
            setNotifications(data.notifications || []);
          }
        }
      } catch (err) {
        console.warn("Error fetching notifications:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await fetchWithCsrf(`${API_BASE_URL}/notifications/mark-read.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        window.dispatchEvent(new Event("foundit-refresh-notifications"));
      }
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetchWithCsrf(`${API_BASE_URL}/notifications/mark-read.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        window.dispatchEvent(new Event("foundit-refresh-notifications"));
      }
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetchWithCsrf(`${API_BASE_URL}/notifications/delete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        window.dispatchEvent(new Event("foundit-refresh-notifications"));
      }
    } catch (err) {
      console.error("Delete notification error:", err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;
    try {
      const res = await fetchWithCsrf(`${API_BASE_URL}/notifications/delete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        setNotifications([]);
        window.dispatchEvent(new Event("foundit-refresh-notifications"));
      }
    } catch (err) {
      console.error("Clear all notifications error:", err);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case "match_confirmed":
      case "match":
        return <Sparkles size={17} color="#7c3aed" />;
      case "claim_approved":
        return <CheckCircle2 size={17} color="#059669" />;
      case "claim_rejected":
      case "competing_claim_rejected":
        return <XCircle size={17} color="#e11d48" />;
      case "claim_submitted":
        return <HandCoins size={17} color="#2563eb" />;
      default:
        return <Bell size={17} color="#7c3aed" />;
    }
  };

  const getNotifIconBg = (type) => {
    switch (type) {
      case "match_confirmed":
      case "match":
        return { background: "#f5f3ff", border: "1px solid rgba(124, 58, 237, 0.2)" };
      case "claim_approved":
        return { background: "#ecfdf5", border: "1px solid rgba(5, 150, 105, 0.2)" };
      case "claim_rejected":
      case "competing_claim_rejected":
        return { background: "#fff1f2", border: "1px solid #fecdd3" };
      case "claim_submitted":
        return { background: "#eff6ff", border: "1px solid #bfdbfe" };
      default:
        return { background: "#f5f3ff", border: "1px solid rgba(124, 58, 237, 0.2)" };
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "Recent";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const filteredNotifications = notifications.filter((n) =>
    filter === "unread" ? !n.is_read : true
  );

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header & Quick Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
            Notifications &amp; Alerts
          </h1>
          <p style={{ fontSize: "0.86rem", color: "#64748b", margin: 0 }}>
            Real-time updates on report matches, status changes, and campus claim approvals.
          </p>
        </div>

        {notifications.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 14px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  borderRadius: "8px",
                  background: "#f5f3ff",
                  color: "#7c3aed",
                  border: "1px solid rgba(124, 58, 237, 0.25)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={handleClearAll}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 14px",
                fontSize: "0.8rem",
                fontWeight: 600,
                borderRadius: "8px",
                background: "#fff1f2",
                color: "#e11d48",
                border: "1px solid #fecdd3",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <Trash2 size={14} />
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid rgba(139, 92, 246, 0.12)", paddingBottom: "10px" }}>
        <button
          type="button"
          onClick={() => setFilter("all")}
          style={{
            padding: "7px 16px",
            fontSize: "0.84rem",
            fontWeight: 700,
            borderRadius: "10px",
            border: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: filter === "all" ? "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" : "transparent",
            color: filter === "all" ? "#ffffff" : "#64748b",
            boxShadow: filter === "all" ? "0 4px 14px rgba(124, 58, 237, 0.3)" : "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          All Notifications
          <span
            style={{
              fontSize: "0.72rem",
              padding: "2px 7px",
              borderRadius: "999px",
              background: filter === "all" ? "rgba(255, 255, 255, 0.25)" : "#f1f5f9",
              color: filter === "all" ? "#ffffff" : "#64748b",
            }}
          >
            {notifications.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilter("unread")}
          style={{
            padding: "7px 16px",
            fontSize: "0.84rem",
            fontWeight: 700,
            borderRadius: "10px",
            border: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: filter === "unread" ? "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" : "transparent",
            color: filter === "unread" ? "#ffffff" : "#64748b",
            boxShadow: filter === "unread" ? "0 4px 14px rgba(124, 58, 237, 0.3)" : "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          Unread
          {unreadCount > 0 && (
            <span
              style={{
                fontSize: "0.72rem",
                padding: "2px 7px",
                borderRadius: "999px",
                background: "#ef4444",
                color: "#ffffff",
                fontWeight: 700,
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* List / Loading / Empty State */}
      {loading ? (
        <div style={{ padding: "48px", textAlign: "center", color: "#64748b" }}>
          Loading notifications...
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && handleMarkAsRead(n.id)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
                padding: "16px 18px",
                borderRadius: "14px",
                background: !n.is_read ? "#ffffff" : "rgba(255, 255, 255, 0.82)",
                border: !n.is_read ? "1px solid rgba(139, 92, 246, 0.3)" : "1px solid rgba(139, 92, 246, 0.12)",
                borderLeft: !n.is_read ? "4px solid #7c3aed" : "1px solid rgba(139, 92, 246, 0.12)",
                boxShadow: !n.is_read
                  ? "0 4px 18px -2px rgba(124, 58, 237, 0.08), 0 1px 3px rgba(15, 23, 42, 0.03)"
                  : "0 1px 3px rgba(15, 23, 42, 0.03)",
                backdropFilter: "blur(20px)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                position: "relative",
              }}
            >
              {/* Left Type Icon */}
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  ...getNotifIconBg(n.type),
                }}
              >
                {getNotifIcon(n.type)}
              </div>

              {/* Center Details */}
              <div style={{ flex: 1, minWidth: 0, paddingRight: "40px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <h3
                    style={{
                      fontSize: "0.92rem",
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    {n.title}
                  </h3>
                  {!n.is_read && (
                    <span
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: "#7c3aed",
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                      title="Unread"
                    />
                  )}
                </div>

                <p style={{ fontSize: "0.85rem", color: "#334155", margin: "0 0 8px", lineHeight: 1.45 }}>
                  {n.message || n.body}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "0.75rem", color: "#64748b" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={12} /> {formatTime(n.created_at)}
                  </span>

                  {n.related_claim_id ? (
                    <Link
                      to="/dashboard/claims"
                      style={{ color: "#7c3aed", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px" }}
                    >
                      View Claim <ExternalLink size={11} />
                    </Link>
                  ) : n.related_item_id ? (
                    <Link
                      to={`/items/${n.related_item_id}`}
                      style={{ color: "#7c3aed", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px" }}
                    >
                      View Public Card <ExternalLink size={11} />
                    </Link>
                  ) : null}
                </div>
              </div>

              {/* Right Action Icons */}
              <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                {!n.is_read && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(n.id);
                    }}
                    title="Mark as read"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#64748b",
                      cursor: "pointer",
                      padding: "4px",
                      borderRadius: "6px",
                    }}
                  >
                    <CheckCheck size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(n.id);
                  }}
                  title="Delete notification"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "6px",
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bell size={28} color="#7c3aed" />}
          title={filter === "unread" ? "No unread alerts" : "No alerts right now"}
          description={
            filter === "unread"
              ? "You've read all your notifications! Check back later for system updates."
              : "When an item matches your report or a finder verifies claim details, you'll receive real-time notifications here."
          }
        />
      )}
    </div>
  );
}
