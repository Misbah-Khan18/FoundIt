import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, API_BASE_URL } from "../context/AuthContext.jsx";
import { useReports } from "../context/ReportsContext.jsx";
import {
  Search,
  PlusCircle,
  MoreHorizontal,
  TrendingUp,
} from "lucide-react";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { myReports, fetchMyReports } = useReports();
  const [notifications, setNotifications] = useState([]);

  // If an administrator accesses student dashboard, navigate to admin console
  useEffect(() => {
    if (user && (user.role === "admin" || user.is_admin)) {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchMyReports();
    let ignore = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/notifications/list.php`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.notifications) && !ignore) {
            setNotifications(data.notifications);
          }
        }
      } catch (err) {
        console.warn("Failed to load notifications:", err);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [fetchMyReports]);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "S";

  // Real stats strictly calculated from authenticated user's records
  const statActive = myReports?.filter(
    (r) => r.status === "active" || r.status === "pending" || r.status === "under_review"
  ).length || 0;


  return (
    <div className="astra-dash">
      {/* ====================================================================
          1. TOP WELCOME & ACTION BAR
          ==================================================================== */}
      <section className="astra-header-card" aria-label="Student Welcome">
        <div className="astra-welcome">
          <div className="astra-welcome__avatar">
            {userInitial}
          </div>
          <div>
            <div className="astra-welcome__subtitle">Welcome,</div>
            <h1 className="astra-welcome__name">{user?.name || "Student"}</h1>
          </div>
        </div>

        <div className="astra-header-actions">
          <Link to="/report-lost" className="btn btn--primary btn--sm" id="astra-report-lost">
            <PlusCircle size={15} strokeWidth={2.2} />
            <span>Report Lost Item</span>
          </Link>
          <Link to="/report-found" className="btn btn--secondary btn--sm" id="astra-report-found">
            <Search size={14} strokeWidth={2.2} />
            <span>Report Found Item</span>
          </Link>
        </div>
      </section>

      {/* ====================================================================
          2. TOP ROW: 3 KPI METRIC CARDS (Active Reports | Task Progress | Team Performance)
          ==================================================================== */}
      <section className="astra-kpi-grid" aria-label="Key Performance Indicators">
        {/* Card 1: Active Reports (with Bar Chart visual) */}
        <div className="astra-card astra-kpi-card">
          <div className="astra-kpi-card__top">
            <span className="astra-kpi-card__title">Active Reports</span>
            <button className="astra-card__menu-btn" title="Options">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="astra-kpi-card__body">
            <div className="astra-kpi-card__value-row">
              <div className="astra-kpi-card__value">{statActive}</div>
              <span className="astra-kpi-card__growth">
                <TrendingUp size={12} /> +8%
              </span>
            </div>

            {/* Reference Style Mini Bar Chart Visual */}
            <div className="astra-mini-bars" aria-hidden="true">
              <div className="astra-mini-bar" style={{ height: "40%" }} />
              <div className="astra-mini-bar" style={{ height: "65%" }} />
              <div className="astra-mini-bar" style={{ height: "50%" }} />
              <div className="astra-mini-bar" style={{ height: "80%" }} />
              <div className="astra-mini-bar astra-mini-bar--active" style={{ height: "100%" }} />
              <div className="astra-mini-bar" style={{ height: "70%" }} />
              <div className="astra-mini-bar" style={{ height: "45%" }} />
            </div>
          </div>
        </div>

      </section>

      {/* ====================================================================
          3. MIDDLE SECTION: DUAL-CURVE WAVE CHART & ACTIVE CASES TRACKING
          ==================================================================== */}
      <section className="astra-main-grid" aria-label="Activity Analytics & Upcoming Deadlines">
        {/* Left Card: Project / Reports Overview with Smooth Gradient Curve Wave Chart */}
        <div className="astra-card astra-chart-card">
          <div className="astra-chart-card__header">
            <div>
              <h2 className="astra-card__title">Project Overview</h2>
              <p className="astra-card__subtitle">Real-time resolution velocity &amp; campus matching frequency</p>
            </div>

            <div className="astra-chart-card__kpis">
              <div className="astra-chart-kpi">
                <span className="astra-chart-kpi__label">Resolution</span>
                <span className="astra-chart-kpi__val">88%</span>
              </div>
              <div className="astra-chart-kpi">
                <span className="astra-chart-kpi__label">Turnaround</span>
                <span className="astra-chart-kpi__val">2.4 Days</span>
              </div>
            </div>
          </div>

          {/* Dual Smooth Gradient SVG Wave Chart */}
          <div className="astra-wave-container">
            <svg
              viewBox="0 0 540 210"
              className="astra-wave-svg"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Violet area gradient */}
                <linearGradient id="violetWaveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
                </linearGradient>
                {/* Cyan/Blue area gradient */}
                <linearGradient id="cyanWaveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="30" y1="30" x2="520" y2="30" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="70" x2="520" y2="70" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="110" x2="520" y2="110" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="150" x2="520" y2="150" stroke="#f1f5f9" strokeWidth="1" />

              {/* Y-Axis scale numbers */}
              <text x="8" y="34" className="astra-axis-text">400</text>
              <text x="8" y="74" className="astra-axis-text">300</text>
              <text x="8" y="114" className="astra-axis-text">200</text>
              <text x="8" y="154" className="astra-axis-text">100</text>

              {/* Wave 2: Cyan Area & Line (Secondary trend) */}
              <path
                d="M 40 135 C 100 120, 160 145, 220 95 C 280 45, 340 100, 400 80 C 460 60, 490 85, 520 70 L 520 180 L 40 180 Z"
                fill="url(#cyanWaveGrad)"
              />
              <path
                d="M 40 135 C 100 120, 160 145, 220 95 C 280 45, 340 100, 400 80 C 460 60, 490 85, 520 70"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Wave 1: Violet Area & Line (Primary trend matching reference) */}
              <path
                d="M 40 150 C 90 125, 140 80, 200 105 C 260 130, 310 65, 360 85 C 410 105, 460 55, 520 60 L 520 180 L 40 180 Z"
                fill="url(#violetWaveGrad)"
              />
              <path
                d="M 40 150 C 90 125, 140 80, 200 105 C 260 130, 310 65, 360 85 C 410 105, 460 55, 520 60"
                fill="none"
                stroke="#7c3aed"
                strokeWidth="2.8"
                strokeLinecap="round"
              />

              {/* Reference Style Indicator Dot on Wave */}
              <circle cx="270" cy="74" r="4.5" fill="#ffffff" stroke="#7c3aed" strokeWidth="2.5" />
              <circle cx="270" cy="74" r="8" fill="none" stroke="rgba(124, 58, 237, 0.25)" strokeWidth="1.5" />
              <line x1="270" y1="84" x2="270" y2="175" stroke="#7c3aed" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              <circle cx="270" cy="120" r="3.5" fill="#ffffff" stroke="#06b6d4" strokeWidth="2" />

              {/* X-Axis Month labels matching reference */}
              <text x="40" y="196" className="astra-axis-text">Jan</text>
              <text x="120" y="196" className="astra-axis-text">Feb</text>
              <text x="200" y="196" className="astra-axis-text">Mar</text>
              <text x="270" y="196" className="astra-axis-text astra-axis-text--active">Wed</text>
              <text x="350" y="196" className="astra-axis-text">Thu</text>
              <text x="430" y="196" className="astra-axis-text">Jul</text>
              <text x="510" y="196" className="astra-axis-text">Sep</text>
            </svg>

            {/* Reference Floating Tooltip Badge */}
            <div className="astra-chart-tooltip" style={{ left: "48%", top: "24%" }}>
              <span>Verified Match</span>
            </div>
          </div>
        </div>

        {/* Right Card: Active Case Tracking Pipeline */}
        <div className="astra-card astra-tracking-card">
          <div className="astra-card__header-row">
            <div>
              <h2 className="astra-card__title">Active Tracking</h2>
              <p className="astra-card__subtitle">Your live report progress</p>
            </div>
            <button className="astra-card__menu-btn" title="Options">
              <MoreHorizontal size={16} />
            </button>
          </div>

          {myReports && myReports.length > 0 ? (
            <div className="astra-tracking-list">
              {myReports.slice(0, 3).map((item, i) => (
                <div key={item.id} className={`astra-tracking-item astra-tracking-item--${i === 0 ? "blue" : i === 1 ? "gold" : "rose"}`}>
                  <div className="astra-tracking-item__content">
                    <h3 className="astra-tracking-item__title">{item.title}</h3>
                    <span className="astra-tracking-item__date">{item.date || item.item_date || "Recent"}</span>
                  </div>
                  <span className={`astra-priority-pill astra-priority-pill--${i === 0 ? "blue" : i === 1 ? "gold" : "rose"}`}>
                    {item.status?.toUpperCase() || "ACTIVE"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "#64748b", fontSize: "0.86rem" }}>
              <p style={{ margin: "0 0 12px" }}>No reports currently logged.</p>
              <Link to="/report-lost" className="btn btn--outline btn--sm" style={{ display: "inline-flex" }}>
                Report Lost Item
              </Link>
            </div>
          )}

          <div className="astra-tracking-card__footer">
            <Link to="/dashboard/reports" className="btn btn--primary btn--sm astra-btn-block">
              <span>View All Reports</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. BOTTOM SECTION: RECENT ACTIVITY & TEAM MEMBERS (CAMPUS DESKS)
          ==================================================================== */}
      <section className="astra-bottom-grid" aria-label="Recent Logs and Campus Contacts">
        {/* Bottom Left Card: Recent Activity */}
        <div className="astra-card astra-bottom-card">
          <div className="astra-card__header-row">
            <div>
              <h2 className="astra-card__title">Recent Activity</h2>
              <p className="astra-card__subtitle">Latest actions on your campus cases</p>
            </div>
            <button className="astra-card__menu-btn" title="Options">
              <MoreHorizontal size={16} />
            </button>
          </div>

          {notifications && notifications.length > 0 ? (
            <div className="astra-activity-list">
              {notifications.slice(0, 3).map((act) => (
                <div key={act.id} className="astra-activity-row">
                  <div
                    className="astra-activity-avatar"
                    style={{
                      background: act.type?.includes("approved") || act.type?.includes("confirmed") ? "#ecfdf5" : "#f5f3ff",
                      color: act.type?.includes("approved") || act.type?.includes("confirmed") ? "#059669" : "#7c3aed"
                    }}
                  >
                    {act.title ? act.title.charAt(0).toUpperCase() : "N"}
                  </div>
                  <div className="astra-activity-info">
                    <div className="astra-activity-title">{act.title}</div>
                    <div className="astra-activity-sub">{act.message}</div>
                  </div>
                  <span className="astra-activity-time">
                    {new Date(act.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "#64748b", fontSize: "0.86rem" }}>
              No recent notifications. Updates on your claims and reports will appear here.
            </div>
          )}
        </div>

      </section>
    </div>
  );
}
