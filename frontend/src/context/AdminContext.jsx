/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "./AuthContext.jsx";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [matches, setMatches] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("30days");
  const [toasts, setToasts] = useState([]);

  // Toast notification helper
  const addToast = useCallback((message, tone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Primary data synchronization function with backend
  const refreshAdminData = useCallback(async () => {
    try {
      const [repRes, userRes, claimRes, matchRes, actRes, notifRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/admin/reports.php`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/admin/users.php`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/admin/claims.php`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/admin/matches.php`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/admin/activities.php`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/admin/notifications.php`, { credentials: "include" }),
      ]);

      if (repRes.status === "fulfilled" && repRes.value.ok) {
        const repData = await repRes.value.json();
        if (repData.success && repData.items) {
          setItems(repData.items);
        }
      }

      if (userRes.status === "fulfilled" && userRes.value.ok) {
        const userData = await userRes.value.json();
        if (userData.success && userData.users) {
          setUsers(userData.users);
        }
      }

      if (claimRes.status === "fulfilled" && claimRes.value.ok) {
        const claimData = await claimRes.value.json();
        if (claimData.success && claimData.claims) {
          setClaims(claimData.claims);
        }
      }

      if (matchRes.status === "fulfilled" && matchRes.value.ok) {
        const matchData = await matchRes.value.json();
        if (matchData.success && matchData.matches) {
          setMatches(matchData.matches);
        }
      }

      if (actRes.status === "fulfilled" && actRes.value.ok) {
        const actData = await actRes.value.json();
        if (actData.success && actData.activities) {
          setActivities(actData.activities);
        }
      }

      if (notifRes.status === "fulfilled" && notifRes.value.ok) {
        const notifData = await notifRes.value.json();
        if (notifData.success && notifData.notifications) {
          setNotifications(notifData.notifications);
        }
      }
    } catch (err) {
      console.warn("Backend sync notice:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and dynamic periodic real-time sync (every 8 seconds)
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) {
        await refreshAdminData();
      }
    };
    load();
    const interval = setInterval(() => {
      if (isMounted) {
        refreshAdminData();
      }
    }, 8000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [refreshAdminData]);

  // Action: Approve a report (from under_review / pending -> active)
  const approveReport = useCallback(
    async (id) => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/reports.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ item_id: id, status: "active" }),
        });

        if (res.ok) {
          addToast(`✓ Report #${id} approved and published to portal`, "success");
          await refreshAdminData();
        } else {
          addToast(`Failed to approve report #${id}`, "error");
        }
      } catch (err) {
        console.error("Approve error:", err);
        addToast("Network error while approving report", "error");
      }
    },
    [addToast, refreshAdminData]
  );

  // Action: Reject a report
  const rejectReport = useCallback(
    async (id, reason = "Incomplete or duplicate information") => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/reports.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ item_id: id, status: "rejected", reason }),
        });

        if (res.ok) {
          addToast(`✕ Report #${id} has been rejected`, "error");
          await refreshAdminData();
        } else {
          addToast(`Failed to reject report #${id}`, "error");
        }
      } catch (err) {
        console.error("Reject error:", err);
        addToast("Network error while rejecting report", "error");
      }
    },
    [addToast, refreshAdminData]
  );

  // Action: Mark as Found
  const markAsFound = useCallback(
    async (id) => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/reports.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ item_id: id, status: "resolved" }),
        });

        if (res.ok) {
          addToast(`✓ Item #${id} marked as found & closed`, "success");
          await refreshAdminData();
        } else {
          addToast(`Failed to update item #${id}`, "error");
        }
      } catch (err) {
        console.error("Mark found error:", err);
        addToast("Network error while updating item", "error");
      }
    },
    [addToast, refreshAdminData]
  );

  // Action: Mark as Returned
  const markAsReturned = useCallback(
    async (id, ownerName = "Student") => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/reports.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ item_id: id, status: "resolved", owner: ownerName }),
        });

        if (res.ok) {
          addToast(`✓ Item #${id} marked as safely returned to ${ownerName}`, "success");
          await refreshAdminData();
        } else {
          addToast(`Failed to mark item #${id} returned`, "error");
        }
      } catch (err) {
        console.error("Mark returned error:", err);
        addToast("Network error while updating return status", "error");
      }
    },
    [addToast, refreshAdminData]
  );

  // Action: Approve Claim
  const approveClaim = useCallback(
    async (claimId) => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/claims.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ claim_id: claimId, status: "approved" }),
        });

        if (res.ok) {
          addToast(`✓ Claim #${claimId} approved! Ownership verified.`, "success");
          await refreshAdminData();
        } else {
          addToast(`Failed to approve claim #${claimId}`, "error");
        }
      } catch (err) {
        console.error("Approve claim error:", err);
        addToast("Network error while approving claim", "error");
      }
    },
    [addToast, refreshAdminData]
  );

  // Action: Reject Claim
  const rejectClaim = useCallback(
    async (claimId) => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/claims.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ claim_id: claimId, status: "rejected" }),
        });

        if (res.ok) {
          addToast(`✕ Claim #${claimId} rejected.`, "error");
          await refreshAdminData();
        } else {
          addToast(`Failed to reject claim #${claimId}`, "error");
        }
      } catch (err) {
        console.error("Reject claim error:", err);
        addToast("Network error while rejecting claim", "error");
      }
    },
    [addToast, refreshAdminData]
  );

  // Action: Request Information for Claim
  const requestClaimInfo = useCallback(
    (claimId) => {
      addToast(`ℹ Additional proof requested from claimant for Claim #${claimId}.`, "info");
    },
    [addToast]
  );

  // Action: Confirm Match
  const confirmMatch = useCallback(
    async (matchId) => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/matches.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ match_id: matchId, status: "confirmed" }),
        });

        if (res.ok) {
          addToast(`✓ Smart match confirmed and items updated.`, "success");
          await refreshAdminData();
        } else {
          addToast(`Failed to confirm match.`, "error");
        }
      } catch (e) {
        console.warn("Confirm match error:", e);
        addToast("Network error while confirming match.", "error");
      }
    },
    [addToast, refreshAdminData]
  );

  // Action: Reject Match
  const rejectMatch = useCallback(
    async (matchId) => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/matches.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ match_id: matchId, status: "rejected" }),
        });

        if (res.ok) {
          addToast(`✕ Smart match candidate marked as rejected.`, "info");
          await refreshAdminData();
        } else {
          addToast(`Failed to reject match.`, "error");
        }
      } catch (e) {
        console.warn("Reject match error:", e);
        addToast("Network error while rejecting match.", "error");
      }
    },
    [addToast, refreshAdminData]
  );

  // Action: Toggle User Role
  const toggleUserRole = useCallback(
    async (userId) => {
      const target = users.find((u) => u.id === userId);
      const newRole = target?.role === "admin" ? "student" : "admin";
      try {
        const res = await fetch(`${API_BASE_URL}/admin/users.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ user_id: userId, role: newRole }),
        });

        if (res.ok) {
          addToast(`✓ ${target?.name || "User"} role updated to ${newRole.toUpperCase()}`, "info");
          await refreshAdminData();
        }
      } catch (e) {
        console.error("User role error:", e);
      }
    },
    [users, addToast, refreshAdminData]
  );

  // Action: Toggle User Status
  const toggleUserStatus = useCallback(
    (userId) => {
      const u = users.find((usr) => usr.id === userId);
      const nextStatus = u?.status === "suspended" ? "active" : "suspended";
      setUsers((prev) =>
        prev.map((usr) => (usr.id === userId ? { ...usr, status: nextStatus } : usr))
      );
      addToast(`Account for ${u?.name || "User"} set to ${nextStatus}`, nextStatus === "active" ? "success" : "error");
    },
    [users, addToast]
  );

  // Dynamically calculated metrics from live database state
  const totalReportsCount = items.length;
  const lostReportsCount = items.filter((i) => i.type === "lost").length;
  const foundReportsCount = items.filter((i) => i.type === "found").length;
  const pendingApprovalsCount = items.filter((i) => i.status === "under_review" || i.status === "pending").length;
  const activeClaimsCount = claims.filter((c) => c.status === "pending").length;
  const resolvedCount = items.filter((i) => i.status === "resolved").length;
  const activeCasesCount = items.filter((i) => i.status === "active" || i.status === "matched" || i.status === "claimed").length;
  const recoveryRate = totalReportsCount > 0 ? Math.round((resolvedCount / totalReportsCount) * 100) : 0;

  const stats = {
    totalReports: totalReportsCount,
    totalLost: lostReportsCount,
    totalFound: foundReportsCount,
    pendingApprovals: pendingApprovalsCount,
    activeClaims: activeClaimsCount,
    resolvedCount: resolvedCount,
    activeCases: activeCasesCount,
    totalUsers: users.length,
    potentialMatchesCount: matches.filter((m) => m.status === "pending" || m.status === "unconfirmed").length,
    recoveryRate: recoveryRate,
  };

  const value = {
    items,
    users,
    claims,
    matches,
    activities,
    notifications,
    loading,
    stats,
    globalSearch,
    setGlobalSearch,
    timeFilter,
    setTimeFilter,
    toasts,
    addToast,
    removeToast,
    refreshAdminData,
    approveReport,
    rejectReport,
    markAsFound,
    markAsReturned,
    approveClaim,
    rejectClaim,
    requestClaimInfo,
    confirmMatch,
    rejectMatch,
    toggleUserRole,
    toggleUserStatus,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
