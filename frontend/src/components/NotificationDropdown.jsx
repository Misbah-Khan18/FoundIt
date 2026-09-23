import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck, Clock } from "lucide-react";
import { API_BASE_URL, fetchWithCsrf } from "../context/AuthContext.jsx";

export default function NotificationDropdown({ unreadCount, setUnreadCount }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/notifications/list.php`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && !ignore) {
            setNotifications(data.notifications || []);
            if (data.unread_count !== undefined && setUnreadCount) {
              setUnreadCount(data.unread_count);
            }
          }
        }
      } catch (err) {
        console.warn("Error fetching notifications:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [isOpen, setUnreadCount]);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
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
        if (setUnreadCount) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        window.dispatchEvent(new Event("foundit-refresh-notifications"));
      }
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetchWithCsrf(`${API_BASE_URL}/notifications/mark-read.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        if (setUnreadCount) {
          setUnreadCount(0);
        }
        window.dispatchEvent(new Event("foundit-refresh-notifications"));
      }
    } catch (err) {
      console.error("Mark all read error:", err);
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

  return (
    <div className="notif-dropdown-wrapper" ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          background: "#ffffff",
          border: "1px solid rgba(139, 92, 246, 0.2)",
          color: unreadCount > 0 ? "#7c3aed" : "#64748b",
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
        }}
        title="Notifications"
      >
        <Bell size={18} strokeWidth={2} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              background: "#ef4444",
              color: "#ffffff",
              fontSize: "0.65rem",
              fontWeight: 700,
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #ffffff",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: "-10px",
            width: "320px",
            background: "#ffffff",
            border: "1px solid rgba(139, 92, 246, 0.18)",
            borderRadius: "12px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            zIndex: 200,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            maxHeight: "400px",
          }}
        >
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(139, 92, 246, 0.12)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
            <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  background: "none",
                  border: "none",
                  color: "#7c3aed",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
                title="Mark all as read"
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>

          <div style={{ overflowY: "auto", flex: 1, padding: "8px 0" }}>
            {loading ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: "30px 20px", textAlign: "center", color: "#64748b" }}>
                <Bell size={24} style={{ margin: "0 auto 10px", opacity: 0.4, color: "#7c3aed" }} />
                <div style={{ fontSize: "0.85rem" }}>No notifications right now.</div>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: "12px 16px",
                    display: "flex",
                    gap: "12px",
                    background: n.is_read ? "#ffffff" : "#faf7ff",
                    borderBottom: "1px solid rgba(139, 92, 246, 0.1)",
                    cursor: "default",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: n.is_read ? 600 : 700, color: "#0f172a" }}>{n.title}</span>
                      {!n.is_read && (
                        <button
                          onClick={(e) => handleMarkAsRead(n.id, e)}
                          style={{ background: "none", border: "none", color: "#7c3aed", cursor: "pointer", padding: 0 }}
                          title="Mark as read"
                        >
                          <CheckCheck size={14} />
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "#475569", margin: "0 0 6px", lineHeight: 1.4 }}>{n.message || n.body}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                      <div style={{ fontSize: "0.7rem", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={10} /> {formatTime(n.created_at)}
                      </div>
                      {n.related_item_id ? (
                        <Link
                          to={`/items/${n.related_item_id}`}
                          onClick={() => setIsOpen(false)}
                          style={{ fontSize: "0.72rem", color: "#7c3aed", fontWeight: 700, textDecoration: "none" }}
                        >
                          View Details →
                        </Link>
                      ) : n.related_claim_id ? (
                        <Link
                          to="/dashboard/claims"
                          onClick={() => setIsOpen(false)}
                          style={{ fontSize: "0.72rem", color: "#7c3aed", fontWeight: 700, textDecoration: "none" }}
                        >
                          View Claim →
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setIsOpen(false)}
            style={{
              display: "block",
              textAlign: "center",
              padding: "10px 14px",
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "#7c3aed",
              borderTop: "1px solid rgba(139, 92, 246, 0.12)",
              textDecoration: "none",
              background: "#faf7ff",
              transition: "all 0.15s ease",
            }}
          >
            View all notifications &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
