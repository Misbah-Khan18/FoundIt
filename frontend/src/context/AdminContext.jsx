/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API_BASE_URL, fetchWithCsrf, useAuth } from "./AuthContext.jsx";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const { user } = useAuth();
  const isAdmin = Boolean(user && (user.role === "admin" || user.is_admin));

  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [matches, setMatches] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(isAdmin);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
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

  // Broadcast helper to notify other tabs & window listeners of state changes
  const broadcastAdminChange = useCallback(() => {
    window.dispatchEvent(new Event("foundit-refresh-admin"));
    window.dispatchEvent(new Event("foundit-refresh-notifications"));
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const ch = new BroadcastChannel("foundit_sync_channel");
        ch.postMessage({ type: "refresh-admin", timestamp: Date.now() });
        ch.close();
      }
    } catch (_e) {
      void _e;
    }
  }, []);

  // Primary data synchronization function with backend
  const refreshAdminData = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    setIsRefreshing(true);
    try {
      const [repRes, userRes, claimRes, matchRes, actRes, notifRes, feedRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/admin/reports.php`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/admin/users.php`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/admin/claims.php`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/admin/matches.php`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/admin/activities.php`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/admin/notifications.php`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/admin/feedback.php`, { credentials: "include" }),
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

      if (feedRes.status === "fulfilled" && feedRes.value.ok) {
        const feedData = await feedRes.value.json();
        if (feedData.success && feedData.feedback) {
          setFeedback(feedData.feedback);
        }
      }

      setLastUpdated(new Date());
      window.dispatchEvent(new Event("foundit-refresh-notifications"));
    } catch (err) {
      console.warn("Backend sync notice:", err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, [isAdmin]);

  // Real-Time Polling, Focus Sync, and Cross-Tab Synchronization
  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    let isMounted = true;

    // 1. Initial immediate fetch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshAdminData();

    // 2. Real-time fast polling (every 4 seconds when tab is actively visible)
    let pollInterval = setInterval(() => {
      if (isMounted && typeof document !== "undefined" && !document.hidden) {
        refreshAdminData();
      }
    }, 4000);

    // 3. Tab visibility changes & window focus triggers instant refresh
    const handleVisibility = () => {
      if (typeof document !== "undefined" && !document.hidden && isMounted) {
        refreshAdminData();
      }
    };

    const handleFocus = () => {
      if (isMounted) {
        refreshAdminData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);

    // 4. Local window event listener (dispatched on any report/claim creation in current tab)
    const handleLocalRefresh = () => {
      if (isMounted) {
        refreshAdminData();
      }
    };
    window.addEventListener("foundit-refresh-admin", handleLocalRefresh);

    // 5. Cross-tab BroadcastChannel listener (dispatched when user reports/claims in another tab)
    let syncChannel = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        syncChannel = new BroadcastChannel("foundit_sync_channel");
        syncChannel.onmessage = (event) => {
          if (
            event.data?.type === "refresh-admin" ||
            event.data?.type === "SYNC_REPORT_CREATED" ||
            event.data?.type === "SYNC_CLAIM_CREATED" ||
            event.data?.type === "item-created" ||
            event.data?.type === "claim-created" ||
            event.data?.type?.startsWith("SYNC_")
          ) {
            if (isMounted) {
              refreshAdminData();
            }
          }
        };
      }
    } catch (e) {
      console.debug("BroadcastChannel not supported", e);
    }

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("foundit-refresh-admin", handleLocalRefresh);
      if (syncChannel) {
        syncChannel.close();
      }
    };
  }, [isAdmin, refreshAdminData]);

  // Action: Approve a report (from under_review / pending -> active)
  const approveReport = useCallback(
    async (id) => {
      try {
        const res = await fetchWithCsrf(`${API_BASE_URL}/admin/reports.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_id: id, status: "active" }),
        });

        if (res.ok) {
          addToast(`✓ Report #${id} approved and published to portal`, "success");
          broadcastAdminChange();
          await refreshAdminData();
        } else {
          addToast(`Failed to approve report #${id}`, "error");
        }
      } catch (err) {
        console.error("Approve error:", err);
        addToast("Network error while approving report", "error");
      }
    },
    [addToast, broadcastAdminChange, refreshAdminData]
  );

  // Action: Reject a report
  const rejectReport = useCallback(
    async (id, reason = "Incomplete or duplicate information") => {
      try {
        const res = await fetchWithCsrf(`${API_BASE_URL}/admin/reports.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_id: id, status: "rejected", reason }),
        });

        if (res.ok) {
          addToast(`✕ Report #${id} has been rejected`, "error");
          broadcastAdminChange();
          await refreshAdminData();
        } else {
          addToast(`Failed to reject report #${id}`, "error");
        }
      } catch (err) {
        console.error("Reject error:", err);
        addToast("Network error while rejecting report", "error");
      }
    },
    [addToast, broadcastAdminChange, refreshAdminData]
  );

  // Action: Delete a report completely
  const deleteReport = useCallback(
    async (id) => {
      try {
        const res = await fetchWithCsrf(`${API_BASE_URL}/admin/reports.php`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_id: id }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          addToast(`✓ Report #${id} deleted from database`, "info");
          broadcastAdminChange();
          await refreshAdminData();
        } else {
          addToast(data.message || `Failed to delete report #${id}`, "error");
        }
      } catch (err) {
        console.error("Delete report error:", err);
        addToast("Network error while deleting report", "error");
      }
    },
    [addToast, broadcastAdminChange, refreshAdminData]
  );

  // Action: Mark as Found
  const markAsFound = useCallback(
    async (id) => {
      try {
        const res = await fetchWithCsrf(`${API_BASE_URL}/admin/reports.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_id: id, status: "resolved" }),
        });

        if (res.ok) {
          addToast(`✓ Item #${id} marked as found & closed`, "success");
          broadcastAdminChange();
          await refreshAdminData();
        } else {
          addToast(`Failed to update item #${id}`, "error");
        }
      } catch (err) {
        console.error("Mark found error:", err);
        addToast("Network error while updating item", "error");
      }
    },
    [addToast, broadcastAdminChange, refreshAdminData]
  );

  // Action: Mark as Returned
  const markAsReturned = useCallback(
    async (id, ownerName = "Student") => {
      try {
        const res = await fetchWithCsrf(`${API_BASE_URL}/admin/reports.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_id: id, status: "resolved", owner: ownerName }),
        });

        if (res.ok) {
          addToast(`✓ Item #${id} marked as safely returned to ${ownerName}`, "success");
          broadcastAdminChange();
          await refreshAdminData();
        } else {
          addToast(`Failed to mark item #${id} returned`, "error");
        }
      } catch (err) {
        console.error("Mark returned error:", err);
        addToast("Network error while updating return status", "error");
      }
    },
    [addToast, broadcastAdminChange, refreshAdminData]
  );

  // Action: Approve Claim
  const approveClaim = useCallback(
    async (claimId) => {
      try {
        const res = await fetchWithCsrf(`${API_BASE_URL}/admin/claims.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ claim_id: claimId, status: "approved" }),
        });

        if (res.ok) {
          addToast(`✓ Claim #${claimId} approved! Ownership verified.`, "success");
          broadcastAdminChange();
          await refreshAdminData();
        } else {
          addToast(`Failed to approve claim #${claimId}`, "error");
        }
      } catch (err) {
        console.error("Approve claim error:", err);
        addToast("Network error while approving claim", "error");
      }
    },
    [addToast, broadcastAdminChange, refreshAdminData]
  );

  // Action: Reject Claim
  const rejectClaim = useCallback(
    async (claimId) => {
      try {
        const res = await fetchWithCsrf(`${API_BASE_URL}/admin/claims.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ claim_id: claimId, status: "rejected" }),
        });

        if (res.ok) {
          addToast(`✕ Claim #${claimId} rejected.`, "error");
          broadcastAdminChange();
          await refreshAdminData();
        } else {
          addToast(`Failed to reject claim #${claimId}`, "error");
        }
      } catch (err) {
        console.error("Reject claim error:", err);
        addToast("Network error while rejecting claim", "error");
      }
    },
    [addToast, broadcastAdminChange, refreshAdminData]
  );

  // Action: Request Information for Claim (real backend notification sent)
  const requestClaimInfo = useCallback(
    async (claimId) => {
      try {
        const res = await fetchWithCsrf(`${API_BASE_URL}/admin/claims.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ claim_id: claimId, status: "request_info" }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          addToast(`ℹ Additional proof requested from claimant for Claim #${claimId}`, "info");
          broadcastAdminChange();
          await refreshAdminData();
        } else {
          addToast(data.message || `Failed to request proof for Claim #${claimId}`, "error");
        }
      } catch (err) {
        console.error("Request proof error:", err);
        addToast("Network error while requesting proof", "error");
      }
    },
    [addToast, broadcastAdminChange, refreshAdminData]
  );

  // Action: Confirm Match
  const confirmMatch = useCallback(
    async (matchId) => {
      try {
        const res = await fetchWithCsrf(`${API_BASE_URL}/admin/matches.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ match_id: matchId, status: "confirmed" }),
        });

        if (res.ok) {
          addToast(`✓ Smart match confirmed and items updated.`, "success");
          broadcastAdminChange();
          await refreshAdminData();
        } else {
          addToast(`Failed to confirm match.`, "error");
        }
      } catch (e) {
        console.warn("Confirm match error:", e);
        addToast("Network error while confirming match.", "error");
      }
    },
    [addToast, broadcastAdminChange, refreshAdminData]
  );

  // Action: Reject Match
  const rejectMatch = useCallback(
    async (matchId) => {
      try {
        const res = await fetchWithCsrf(`${API_BASE_URL}/admin/matches.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ match_id: matchId, status: "rejected" }),
        });

        if (res.ok) {
          addToast(`✕ Smart match candidate marked as rejected.`, "info");
          broadcastAdminChange();
          await refreshAdminData();
        } else {
          addToast(`Failed to reject match.`, "error");
        }
      } catch (e) {
        console.warn("Reject match error:", e);
        addToast("Network error while rejecting match.", "error");
      }
    },
    [addToast, broadcastAdminChange, refreshAdminData]
  );

  // Action: Toggle User Role
  const toggleUserRole = useCallback(
    async (userId) => {
      const target = users.find((u) => u.id === userId);
      const newRole = target?.role === "admin" ? "student" : "admin";
      try {
        const res = await fetchWithCsrf(`${API_BASE_URL}/admin/users.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, role: newRole }),
        });

        if (res.ok) {
          addToast(`✓ ${target?.name || "User"} role updated to ${newRole.toUpperCase()}`, "info");
          broadcastAdminChange();
          await refreshAdminData();
        }
      } catch (e) {
        console.error("User role error:", e);
      }
    },
    [users, addToast, broadcastAdminChange, refreshAdminData]
  );

  // Action: Toggle User Status
  const toggleUserStatus = useCallback(
    async (userId) => {
      const u = users.find((usr) => usr.id === userId);
      if (!u) return;
      if (u.role === "admin") {
        addToast("Cannot suspend an administrator account.", "error");
        return;
      }
      const nextStatus = u.status === "suspended" ? "active" : "suspended";
      try {
        const res = await fetchWithCsrf(`${API_BASE_URL}/admin/users.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, status: nextStatus }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          addToast(
            `Account for ${u.name || "User"} set to ${nextStatus.toUpperCase()}`,
            nextStatus === "active" ? "success" : "error"
          );
          broadcastAdminChange();
          await refreshAdminData();
        } else {
          addToast(data.message || "Failed to update user status.", "error");
        }
      } catch (err) {
        console.error("Toggle user status error:", err);
        addToast("Network error while updating user status.", "error");
      }
    },
    [users, addToast, broadcastAdminChange, refreshAdminData]
  );

  // Action: Resolve Feedback
  const resolveFeedback = useCallback(
    async (feedbackId, status = "resolved") => {
      try {
        const res = await fetchWithCsrf(`${API_BASE_URL}/admin/feedback.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedback_id: feedbackId, status }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          addToast(`✓ Feedback marked as ${status}`, "success");
          broadcastAdminChange();
          await refreshAdminData();
        } else {
          addToast(data.message || "Failed to update feedback.", "error");
        }
      } catch (e) {
        console.error("Resolve feedback error:", e);
        addToast("Network error updating feedback.", "error");
      }
    },
    [addToast, broadcastAdminChange, refreshAdminData]
  );

  // Action: Delete Feedback
  const deleteFeedback = useCallback(
    async (feedbackId) => {
      try {
        const res = await fetchWithCsrf(`${API_BASE_URL}/admin/feedback.php`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedback_id: feedbackId }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          addToast("Feedback deleted.", "info");
          broadcastAdminChange();
          await refreshAdminData();
        } else {
          addToast(data.message || "Failed to delete feedback.", "error");
        }
      } catch (e) {
        console.error("Delete feedback error:", e);
      }
    },
    [addToast, broadcastAdminChange, refreshAdminData]
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
    pendingFeedbackCount: feedback.filter((f) => f.status === "pending").length,
  };

  const value = {
    items,
    users,
    claims,
    matches,
    activities,
    notifications,
    feedback,
    loading,
    isRefreshing,
    lastUpdated,
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
    deleteReport,
    markAsFound,
    markAsReturned,
    approveClaim,
    rejectClaim,
    requestClaimInfo,
    confirmMatch,
    rejectMatch,
    toggleUserRole,
    toggleUserStatus,
    resolveFeedback,
    deleteFeedback,
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
