import { useState, useEffect, useCallback } from "react";
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
  Info,
  Clock
} from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import { API_BASE_URL } from "../context/AuthContext.jsx";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" | "unread"

  const fetchNotifs = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  const handleMarkAsRead = async (id) => {
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
      }
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/mark-read.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/delete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error("Delete notification error:", err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/delete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Clear all notifications error:", err);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case "match_confirmed":
      case "match":
        return <Sparkles size={18} className="text-purple-600" />;
      case "claim_approved":
        return <CheckCircle2 size={18} className="text-emerald-600" />;
      case "claim_rejected":
      case "competing_claim_rejected":
        return <XCircle size={18} className="text-rose-600" />;
      case "claim_submitted":
        return <HandCoins size={18} className="text-blue-600" />;
      default:
        return <Bell size={18} className="text-slate-600" />;
    }
  };

  const getNotifBadgeClass = (type) => {
    switch (type) {
      case "match_confirmed":
      case "match":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "claim_approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "claim_rejected":
      case "competing_claim_rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "claim_submitted":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
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
    <div className="dash-page max-w-4xl mx-auto">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications & Alerts</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time updates on report matches, status changes, and campus claim approvals.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="btn btn--outline btn--sm text-xs flex items-center gap-1.5 py-1.5 px-3 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-700 transition-all"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
            <button
              onClick={handleClearAll}
              className="btn btn--outline btn--sm text-xs flex items-center gap-1.5 py-1.5 px-3 rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 transition-all"
            >
              <Trash2 size={14} />
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 pb-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
            filter === "all"
              ? "bg-navy-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          All Notifications
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            filter === "all" ? "bg-navy-800 text-slate-200" : "bg-slate-200 text-slate-700"
          }`}>
            {notifications.length}
          </span>
        </button>

        <button
          onClick={() => setFilter("unread")}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
            filter === "unread"
              ? "bg-navy-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Unread
          {unreadCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* List / Loading / Empty State */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="animate-spin w-8 h-8 border-2 border-navy-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          Loading notifications...
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="notif-list space-y-3">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && handleMarkAsRead(n.id)}
              className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${
                !n.is_read
                  ? "bg-amber-50/40 border-amber-200/80 shadow-sm hover:border-amber-300"
                  : "bg-white border-slate-200/80 hover:border-slate-300"
              }`}
            >
              {/* Left Type Icon */}
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${getNotifBadgeClass(
                  n.type
                )}`}
              >
                {getNotifIcon(n.type)}
              </div>

              {/* Center Details */}
              <div className="flex-1 min-w-0 pr-8">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className={`text-sm font-semibold tracking-tight ${
                    !n.is_read ? "text-slate-900" : "text-slate-700"
                  }`}>
                    {n.title}
                  </h3>
                  {!n.is_read && (
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Unread"></span>
                  )}
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-2">
                  {n.message || n.body}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatTime(n.created_at)}
                  </span>

                  {/* Context Links */}
                  {n.related_claim_id ? (
                    <Link
                      to="/dashboard/claims"
                      className="text-blue-600 hover:text-blue-800 font-sans font-medium flex items-center gap-1 hover:underline"
                    >
                      View Claim <ExternalLink size={11} />
                    </Link>
                  ) : n.related_item_id ? (
                    <Link
                      to="/dashboard/reports"
                      className="text-blue-600 hover:text-blue-800 font-sans font-medium flex items-center gap-1 hover:underline"
                    >
                      View Item Details <ExternalLink size={11} />
                    </Link>
                  ) : null}
                </div>
              </div>

              {/* Right Action Icons (Hover visible or subtle) */}
              <div className="absolute top-3 right-3 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                {!n.is_read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(n.id);
                    }}
                    title="Mark as read"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    <CheckCheck size={15} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(n.id);
                  }}
                  title="Delete notification"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bell size={28} className="text-slate-400" />}
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
