import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck, Trash2, Clock, Info } from "lucide-react";
import { API_BASE_URL } from "../context/AuthContext.jsx";

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
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/notifications/list.php`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
        }
      }
    } catch (err) {
      console.warn("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/mark-read.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Mark read error:", err);
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
          background: "var(--ivory)",
          border: "1px solid var(--border-light)",
          color: unreadCount > 0 ? "var(--navy-900)" : "var(--slate-500)",
          cursor: "pointer",
          transition: "all 0.2s ease",
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
            border: "1px solid var(--border-light)",
            borderRadius: "12px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            zIndex: 200,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            maxHeight: "400px",
          }}
        >
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
            <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--navy-900)" }}>Notifications</span>
          </div>

          <div style={{ overflowY: "auto", flex: 1, padding: "8px 0" }}>
            {loading ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--slate-500)", fontSize: "0.85rem" }}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: "30px 20px", textAlign: "center", color: "var(--slate-500)" }}>
                <Bell size={24} style={{ margin: "0 auto 10px", opacity: 0.3 }} />
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
                    background: n.is_read ? "#ffffff" : "#f0f9ff",
                    borderBottom: "1px solid var(--border-light)",
                    cursor: "default",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: n.is_read ? 600 : 700, color: "var(--ink)" }}>{n.title}</span>
                      {!n.is_read && (
                        <button
                          onClick={(e) => handleMarkAsRead(n.id, e)}
                          style={{ background: "none", border: "none", color: "var(--blue-500)", cursor: "pointer", padding: 0 }}
                          title="Mark as read"
                        >
                          <CheckCheck size={14} />
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--slate-600)", margin: "0 0 6px", lineHeight: 1.4 }}>{n.message || n.body}</p>
                    <div style={{ fontSize: "0.7rem", color: "var(--slate-400)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={10} /> {formatTime(n.created_at)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
