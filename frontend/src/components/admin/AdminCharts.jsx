import { useState, useId, useMemo } from "react";
import {
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext.jsx";

/* --------------------------------------------------------------------------
   1. MAIN ACTIVITY WAVE CHART (Reference Image Left-Top Area Chart)
   -------------------------------------------------------------------------- */
export function ActivityWaveChart() {
  const { items, timeFilter, setTimeFilter } = useAdmin();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const gradId = useId();

  // Dynamically calculate 7-day trend data from actual items in database
  const trendDays = useMemo(() => {
    const days = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = dayNames[d.getDay()];

      const dayItems = items.filter((item) => {
        const itemCreated = item.created_at ? item.created_at.split(" ")[0] : (item.date || "");
        return itemCreated === dateStr;
      });

      const lostCount = dayItems.filter((item) => item.type === "lost").length;
      const foundCount = dayItems.filter((item) => item.type === "found").length;

      days.push({
        label: dayLabel,
        date: dateStr,
        lost: lostCount,
        found: foundCount,
        total: dayItems.length,
      });
    }
    return days;
  }, [items]);

  const totalReportsInWeek = trendDays.reduce((sum, d) => sum + d.total, 0);
  const dailyAverage = (totalReportsInWeek / 7).toFixed(1);
  const peakDay = trendDays.reduce(
    (max, d) => (d.total > max.total ? d : max),
    trendDays[0] || { label: "N/A", total: 0 }
  );

  const activeRate = items.length > 0
    ? Math.round((items.filter((i) => i.status === "active").length / items.length) * 100)
    : 0;

  const maxVal = Math.max(...trendDays.map((d) => d.total), 4);

  // SVG coordinate calculations for smooth cubic bezier wave
  const svgWidth = 620;
  const svgHeight = 200;
  const paddingX = 40;
  const paddingY = 24;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  const points = trendDays.map((d, i) => {
    const x = paddingX + (i / (trendDays.length - 1)) * chartW;
    const y = svgHeight - paddingY - (d.total / maxVal) * chartH;
    return { x, y, ...d };
  });

  // Construct SVG Bezier smooth curve
  const buildSmoothPath = (pts) => {
    if (pts.length === 0) return "";
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        borderRadius: "18px",
        border: "1px solid rgba(139, 92, 246, 0.16)",
        boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      {/* Header with Title, Trend Tag, and Time Filter Pills */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div>
            <h3 style={{ margin: "0 0 2px", fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>
              Lost &amp; Found Activity Trends
            </h3>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>
              Inflow volume and incident resolution frequency
            </p>
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              background: "#ecfdf5",
              color: "#059669",
              border: "1px solid #a7f3d0",
              fontSize: "0.72rem",
              fontWeight: 800,
              padding: "3px 8px",
              borderRadius: "999px",
            }}
          >
            <TrendingUp size={12} strokeWidth={2.5} /> {activeRate}% Active
          </span>
        </div>

        {/* Filter Pills matching Reference Image */}
        <div
          style={{
            display: "inline-flex",
            background: "#f1f5f9",
            borderRadius: "999px",
            padding: "3px",
            border: "1px solid #e2e8f0",
          }}
        >
          {[
            { id: "today", label: "Today" },
            { id: "7days", label: "7 Days" },
            { id: "30days", label: "30 Days" },
            { id: "year", label: "This Year" },
          ].map((f) => {
            const active = timeFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setTimeFilter(f.id)}
                style={{
                  border: "none",
                  background: active ? "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)" : "transparent",
                  color: active ? "#ffffff" : "#64748b",
                  fontWeight: active ? 700 : 500,
                  fontSize: "0.74rem",
                  padding: "5px 12px",
                  borderRadius: "999px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: active ? "0 2px 8px rgba(124, 58, 237, 0.3)" : "none",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Wave Chart Container */}
      <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <defs>
            <linearGradient id={`wave-grad-${gradId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#9333ea" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id={`line-grad-${gradId}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="50%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          {/* Horizontal Reference Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingY + ratio * chartH;
            const val = Math.round(maxVal * (1 - ratio));
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="rgba(148, 163, 184, 0.18)"
                  strokeDasharray={ratio === 1 ? "none" : "4 4"}
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="var(--font-mono, monospace)"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Gradient Fill */}
          <path d={areaPath} fill={`url(#wave-grad-${gradId})`} />

          {/* Main Wave Curve Stroke */}
          <path
            d={linePath}
            fill="none"
            stroke={`url(#line-grad-${gradId})`}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points and Interactivity */}
          {points.map((pt, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6.5 : 4}
                  fill="#ffffff"
                  stroke="#7c3aed"
                  strokeWidth={isHovered ? "3.5" : "2.5"}
                  style={{ transition: "all 0.15s ease" }}
                />

                {/* X-Axis Day Label */}
                <text
                  x={pt.x}
                  y={svgHeight - 6}
                  fill={isHovered ? "#7c3aed" : "#64748b"}
                  fontWeight={isHovered ? 700 : 500}
                  fontSize="11"
                  textAnchor="middle"
                >
                  {pt.label}
                </text>

                {/* Tooltip on Hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={pt.x - 45}
                      y={pt.y - 42}
                      width="90"
                      height="30"
                      rx="8"
                      fill="#0f172a"
                      boxShadow="0 4px 10px rgba(0,0,0,0.3)"
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 23}
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {pt.total} Reports
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom KPI Sub-Row inside Chart Card */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "12px",
          borderTop: "1px solid rgba(139, 92, 246, 0.1)",
          fontSize: "0.78rem",
          color: "#64748b",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span>
            Daily Average: <strong style={{ color: "#0f172a" }}>{dailyAverage} reports/day</strong>
          </span>
          <span>
            Peak Flow: <strong style={{ color: "#7c3aed" }}>{peakDay.label} ({peakDay.total} {peakDay.total === 1 ? "item" : "items"})</strong>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} /> Lost
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#7c3aed" }} /> Found
          </span>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   2. DONUT DISTRIBUTION CHART (Reference Image Top-Right "Top Product Sale")
   -------------------------------------------------------------------------- */
export function StatusDonutChart() {
  const { items, stats } = useAdmin();

  const total = items.length || 1;
  const lostCount = items.filter((i) => i.type === "lost").length;
  const foundCount = items.filter((i) => i.type === "found").length;

  const lostPct = Math.round((lostCount / total) * 100);
  const foundPct = Math.round((foundCount / total) * 100);
  const resolvedPct = Math.max(0, 100 - lostPct - foundPct);

  // Donut SVG circumference calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius; // ~339.29
  const lostStroke = (lostPct / 100) * circumference;
  const foundStroke = (foundPct / 100) * circumference;
  const resolvedStroke = (resolvedPct / 100) * circumference;

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        borderRadius: "18px",
        border: "1px solid rgba(139, 92, 246, 0.16)",
        boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "1.08rem", fontWeight: 800, color: "#0f172a" }}>
          Item Status Distribution
        </h3>
        <span style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: 600 }}>
          Live Registry
        </span>
      </div>

      {/* Donut and Legend Flex Layout matching Reference Image */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", gap: "16px", padding: "4px 0" }}>
        {/* Circular Donut SVG */}
        <div style={{ position: "relative", width: "135px", height: "135px", flexShrink: 0 }}>
          <svg viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
            {/* Background track circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="16"
            />
            {/* Lost items arc */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#ef4444"
              strokeWidth="16"
              strokeDasharray={`${lostStroke} ${circumference}`}
              strokeDashoffset="0"
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.5s ease" }}
            />
            {/* Found items arc */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#7c3aed"
              strokeWidth="16"
              strokeDasharray={`${foundStroke} ${circumference}`}
              strokeDashoffset={`-${lostStroke}`}
              strokeLinecap="round"
              style={{ transition: "all 0.5s ease" }}
            />
            {/* Resolved items arc */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#10b981"
              strokeWidth="16"
              strokeDasharray={`${resolvedStroke} ${circumference}`}
              strokeDashoffset={`-${lostStroke + foundStroke}`}
              strokeLinecap="round"
              style={{ transition: "all 0.5s ease" }}
            />
          </svg>

          {/* Center Metric Text */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Total
            </span>
            <span style={{ fontSize: "1.45rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>
              {total}
            </span>
            <span style={{ fontSize: "0.65rem", color: "#10b981", fontWeight: 700 }}>
              {stats.recoveryRate || 0}% Ret.
            </span>
          </div>
        </div>

        {/* Legend on the right side */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#ef4444", flexShrink: 0 }} />
              <span style={{ fontSize: "0.8rem", color: "#334155", fontWeight: 600 }}>Lost Items</span>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", fontWeight: 700, color: "#0f172a" }}>
              {lostPct}%
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#7c3aed", flexShrink: 0 }} />
              <span style={{ fontSize: "0.8rem", color: "#334155", fontWeight: 600 }}>In Custody</span>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", fontWeight: 700, color: "#0f172a" }}>
              {foundPct}%
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#10b981", flexShrink: 0 }} />
              <span style={{ fontSize: "0.8rem", color: "#334155", fontWeight: 600 }}>Resolved</span>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", fontWeight: 700, color: "#0f172a" }}>
              {resolvedPct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   3. CAMPUS HOTSPOTS (Reference Image Mid-Right "Traffic Source" Progress Bars)
   -------------------------------------------------------------------------- */
export function CampusHotspotsCard() {
  const { items } = useAdmin();

  const total = items.length || 1;
  const locationMap = useMemo(() => {
    return items.reduce((acc, curr) => {
      const loc = curr.location?.trim() || "Campus Ground";
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {});
  }, [items]);

  const sourceLocations = useMemo(() => {
    return Object.entries(locationMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [locationMap]);

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        borderRadius: "18px",
        border: "1px solid rgba(139, 92, 246, 0.16)",
        boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "1.08rem", fontWeight: 800, color: "#0f172a" }}>
          Campus Hotspots
        </h3>
        <span style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: 600 }}>
          Live Location Density
        </span>
      </div>

      {sourceLocations.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 12px", color: "#64748b", fontSize: "0.82rem" }}>
          No campus incident locations logged yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {sourceLocations.map(([loc, count], idx) => {
            const pct = Math.min(100, Math.max(10, Math.round((count / total) * 100)));
            return (
              <div key={idx}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "5px" }}>
                  <span style={{ color: "#1e293b", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px" }}>
                    {loc}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "#64748b", fontWeight: 700 }}>
                    {count} ({pct}%)
                  </span>
                </div>
                <div style={{ height: "6px", width: "100%", borderRadius: "999px", background: "#f1f5f9", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: idx === 0
                        ? "linear-gradient(90deg, #7c3aed, #a855f7)"
                        : idx === 1
                        ? "#334155"
                        : "#94a3b8",
                      borderRadius: "999px",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------
   4. CALENDAR WEEK STRIP & SCHEDULE (Reference Image Bottom-Left Strip)
   -------------------------------------------------------------------------- */
export function CalendarWeekStrip({ onSelectDay }) {
  const weekDays = useMemo(() => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 is Sunday
    // Monday as start of week: distance from Monday (1)
    const distanceToMonday = (currentDayOfWeek + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return dayNames.map((name, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isToday = d.toDateString() === today.toDateString();
      return {
        dayName: name,
        dateNum: String(d.getDate()).padStart(2, "0"),
        fullDate: d.toISOString().split("T")[0],
        isToday,
      };
    });
  }, []);

  const [selectedDay, setSelectedDay] = useState(() => {
    const todayIdx = weekDays.findIndex((d) => d.isToday);
    return todayIdx >= 0 ? todayIdx : 0;
  });

  const monthYearStr = useMemo(() => {
    return new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        padding: "12px 14px",
        background: "rgba(255, 255, 255, 0.88)",
        borderRadius: "16px",
        border: "1px solid rgba(139, 92, 246, 0.16)",
        boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          type="button"
          style={{
            background: "#f1f5f9",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "5px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: "#64748b",
          }}
          aria-label="Previous week"
        >
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap" }}>
          {monthYearStr}
        </span>
      </div>

      {/* Week Day Pills */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, justifyContent: "center" }}>
        {weekDays.map((d, idx) => {
          const isSelected = selectedDay === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSelectedDay(idx);
                if (onSelectDay) onSelectDay(d);
              }}
              style={{
                border: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                padding: isSelected ? "8px 14px" : "6px 10px",
                borderRadius: isSelected ? "999px" : "12px",
                background: isSelected
                  ? "linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #a855f7 100%)"
                  : "transparent",
                color: isSelected ? "#ffffff" : "#64748b",
                boxShadow: isSelected ? "0 4px 14px rgba(124, 58, 237, 0.35)" : "none",
                transform: isSelected ? "scale(1.05)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ fontSize: "0.68rem", fontWeight: isSelected ? 700 : 500 }}>
                {d.dayName}
              </span>
              <span style={{ fontSize: "0.95rem", fontWeight: 800 }}>
                {d.dateNum}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        style={{
          background: "#f1f5f9",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "5px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          color: "#64748b",
        }}
        aria-label="Next week"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// Default export backward compatibility
export default function AdminCharts() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <ActivityWaveChart />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <StatusDonutChart />
        <CampusHotspotsCard />
      </div>
    </div>
  );
}
