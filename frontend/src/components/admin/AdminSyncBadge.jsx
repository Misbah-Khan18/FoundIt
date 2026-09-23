import { RefreshCw } from "lucide-react";
import { useAdmin } from "../../context/AdminContext.jsx";

export default function AdminSyncBadge({ style = {} }) {
  const { isRefreshing, lastUpdated, refreshAdminData } = useAdmin();

  const timeFormatted = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "Live";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        background: "rgba(255, 255, 255, 0.92)",
        padding: "6px 14px",
        borderRadius: "999px",
        border: "1px solid rgba(139, 92, 246, 0.18)",
        boxShadow: "0 1px 4px rgba(15, 23, 42, 0.04)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: isRefreshing ? "#f59e0b" : "#10b981",
            display: "inline-block",
            boxShadow: isRefreshing
              ? "0 0 0 3px rgba(245, 158, 11, 0.25)"
              : "0 0 0 3px rgba(16, 185, 129, 0.25)",
            transition: "all 0.3s ease",
          }}
        />
        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1e293b", letterSpacing: "0.01em" }}>
          {isRefreshing ? "Syncing..." : "Live Sync"}
        </span>
      </div>

      <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>•</span>

      <span
        style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "0.74rem",
          fontWeight: 600,
          color: "#64748b",
        }}
        title="Last real-time synchronization timestamp"
      >
        {timeFormatted}
      </span>

      <button
        type="button"
        onClick={() => refreshAdminData()}
        disabled={isRefreshing}
        title="Manually fetch latest data from server"
        style={{
          background: "none",
          border: "none",
          padding: "3px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: isRefreshing ? "wait" : "pointer",
          color: isRefreshing ? "#a855f7" : "#7c3aed",
          borderRadius: "6px",
          transition: "transform 0.15s ease, color 0.15s ease",
        }}
      >
        <RefreshCw
          size={13}
          style={{
            animation: isRefreshing ? "spin 0.9s linear infinite" : "none",
          }}
        />
      </button>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
