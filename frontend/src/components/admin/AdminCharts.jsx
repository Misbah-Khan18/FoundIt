import { PieChart, BarChart3, MapPin } from "lucide-react";
import { useAdmin } from "../../context/AdminContext.jsx";

export default function AdminCharts() {
  const { items, stats, timeFilter, setTimeFilter } = useAdmin();

  // Dynamic distribution calculations
  const total = items.length || 1;
  const lostCount = items.filter((i) => i.type === "lost").length;
  const foundCount = items.filter((i) => i.type === "found").length;

  const lostPercent = Math.round((lostCount / total) * 100);
  const foundPercent = Math.round((foundCount / total) * 100);

  // Location counts
  const locationMap = items.reduce((acc, curr) => {
    const loc = curr.location || "Campus";
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});

  const topLocations = Object.entries(locationMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Mock trend data based on filter
  const trendDays = [
    { label: "Mon", lost: 4, found: 6 },
    { label: "Tue", lost: 7, found: 5 },
    { label: "Wed", lost: 3, found: 8 },
    { label: "Thu", lost: 9, found: 4 },
    { label: "Fri", lost: 6, found: 7 },
    { label: "Sat", lost: 2, found: 3 },
    { label: "Sun", lost: 1, found: 2 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Chart Header & Filter Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "12px",
          paddingBottom: "10px",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <div>
          <h3 style={{ margin: "0 0 2px", fontSize: "1.05rem", fontWeight: 700, color: "var(--ink)" }}>
            Lost &amp; Found Intelligence
          </h3>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--slate-500)" }}>
            Real-time trends, efficiency, and hot-spots.
          </p>
        </div>

        {/* Time range filter buttons */}
        <div style={{ display: "flex", background: "var(--ivory-dim)", borderRadius: "8px", padding: "3px" }}>
          {[
            { id: "today", label: "Today" },
            { id: "7days", label: "7 Days" },
            { id: "30days", label: "30 Days" },
            { id: "year", label: "This Year" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setTimeFilter(f.id)}
              style={{
                border: "none",
                background: timeFilter === f.id ? "#ffffff" : "transparent",
                color: timeFilter === f.id ? "var(--navy-900)" : "var(--slate-600)",
                fontWeight: timeFilter === f.id ? 700 : 500,
                fontSize: "0.78rem",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                boxShadow: timeFilter === f.id ? "var(--shadow-sm)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Visual Analytics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", flex: 1, minHeight: 0 }}>
        {/* 1. Volume & Trend Chart */}
        <div style={{ padding: "12px", background: "var(--ivory)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--navy-900)", display: "flex", alignItems: "center", gap: "4px" }}>
              <BarChart3 size={14} /> Weekly Inflow
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--slate-500)" }}>
              <span style={{ color: "var(--red-500)", fontWeight: 700 }}>■</span> L &nbsp;
              <span style={{ color: "var(--blue-500)", fontWeight: 700 }}>■</span> F
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flex: 1, minHeight: "80px", padding: "4px 2px 0" }}>
            {trendDays.map((d, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "100%", flex: 1 }}>
                  {/* Lost bar */}
                  <div
                    title={`Lost: ${d.lost}`}
                    style={{
                      width: "8px",
                      height: `${(d.lost / 9) * 100}%`,
                      background: "var(--red-500)",
                      borderRadius: "3px 3px 0 0",
                      transition: "height 0.3s ease",
                    }}
                  />
                  {/* Found bar */}
                  <div
                    title={`Found: ${d.found}`}
                    style={{
                      width: "8px",
                      height: `${(d.found / 9) * 100}%`,
                      background: "var(--blue-500)",
                      borderRadius: "3px 3px 0 0",
                      transition: "height 0.3s ease",
                    }}
                  />
                </div>
                <span style={{ fontSize: "0.72rem", color: "var(--slate-600)", fontWeight: 600 }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Lost vs Found Ratio & Recovery Rate */}
        <div style={{ padding: "12px", background: "var(--ivory)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--navy-900)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
              <PieChart size={14} /> Recovery Ratio
            </div>

            {/* Segmented bar */}
            <div style={{ height: "12px", width: "100%", borderRadius: "999px", overflow: "hidden", display: "flex", marginBottom: "6px", background: "#e2e8f0" }}>
              <div style={{ width: `${lostPercent}%`, background: "var(--red-500)", transition: "width 0.4s ease" }} title={`Lost: ${lostPercent}%`} />
              <div style={{ width: `${foundPercent}%`, background: "var(--blue-500)", transition: "width 0.4s ease" }} title={`Found: ${foundPercent}%`} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--slate-600)", marginBottom: "10px" }}>
              <span>Lost: <strong>{lostCount} ({lostPercent}%)</strong></span>
              <span>Found: <strong>{foundCount} ({foundPercent}%)</strong></span>
            </div>
          </div>

          <div style={{ padding: "8px 10px", background: "#ffffff", borderRadius: "8px", border: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "0.65rem", color: "var(--slate-500)", textTransform: "uppercase", fontWeight: 600 }}>Recovery Rate</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--emerald-600)" }}>{stats.recoveryRate}%</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--slate-500)" }}>Reconciled:</span>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--ink)" }}>{stats.resolvedCount}</div>
            </div>
          </div>
        </div>

        {/* 3. High-Incidence Campus Hotspots */}
        <div style={{ padding: "12px", background: "var(--ivory)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--navy-900)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
            <MapPin size={14} /> Location Distribution
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
            {topLocations.map(([loc, count], idx) => {
              const locPct = Math.round((count / total) * 100);
              return (
                <div key={idx}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: "2px" }}>
                    <span style={{ color: "var(--ink)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "120px" }}>{loc}</span>
                    <span style={{ color: "var(--slate-500)", fontWeight: 500, flexShrink: 0 }}>{count} ({locPct}%)</span>
                  </div>
                  <div style={{ height: "4px", width: "100%", borderRadius: "999px", background: "#e2e8f0", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${locPct}%`, background: idx === 0 ? "var(--gold-500)" : "var(--navy-900)", borderRadius: "999px" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
