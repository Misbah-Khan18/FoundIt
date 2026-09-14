/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "./AuthContext.jsx";


const ReportsContext = createContext(null);

export function ReportsProvider({ children }) {
  const [publicItems, setPublicItems] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch public reports
  const fetchPublicItems = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/items/list.php`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setPublicItems(data.items);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not fetch items from backend:", e);
      setPublicItems([]);
    }
  }, []);

  // Fetch logged-in user's own reports
  const fetchMyReports = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/items/my-reports.php`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setMyReports(data.items);
          return data.items;
        }
      } else if (res.status === 401) {
        setError("unauthenticated");
      } else {
        setError("Failed to fetch your reports.");
      }
    } catch (e) {
      console.warn("Could not fetch user reports from backend:", e);
      setError("Network error or server unavailable.");
    }
    return [];
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchPublicItems(), fetchMyReports()]);
      setLoading(false);
    };
    init();
  }, [fetchPublicItems, fetchMyReports]);

  // Create a new report via FormData
  const createReport = async (formData) => {
    const res = await fetch(`${API_BASE_URL}/items/create.php`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error("Unable to parse server response.");
    }

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to submit report.");
    }

    // Refresh user's reports and public listings
    await Promise.all([fetchMyReports(), fetchPublicItems()]);
    return data.item;
  };

  return (
    <ReportsContext.Provider
      value={{
        items: publicItems,
        myReports,
        loading,
        error,
        fetchPublicItems,
        fetchMyReports,
        createReport,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error("useReports must be used within a ReportsProvider");
  }
  return context;
}

