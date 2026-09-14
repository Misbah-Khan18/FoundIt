import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, API_BASE_URL } from "../context/AuthContext.jsx";
import { useReports } from "../context/ReportsContext.jsx";
import {
  FileText,
  HandCoins,
  Bell,
  PlusCircle,
  Search,
  MapPin,
  Calendar,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Info,
  Sparkles,
  Zap,
} from "lucide-react";
import Badge from "../components/Badge.jsx";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { myReports, fetchMyReports } = useReports();
  const [claims, setClaims] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Sync user reports
        await fetchMyReports();

        // Fetch user claims
        const claimRes = await fetch(`${API_BASE_URL}/claims/my-claims.php`, {
          credentials: "include",
        });
        if (claimRes.ok) {
          const claimData = await claimRes.json();
          if (claimData.success) {
            setClaims(claimData.claims || []);
          }
        }

        // Fetch user notifications
        const notifRes = await fetch(`${API_BASE_URL}/notifications/list.php`, {
          credentials: "include",
        });
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          if (notifData.success) {
            setNotifications(notifData.notifications || []);
          }
        }
      } catch (err) {
        console.warn("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [fetchMyReports]);

  const recentReports = myReports.slice(0, 3);
  const recentClaims = claims.slice(0, 3);
  const unreadNotifsCount = notifications.filter((n) => !n.is_read).length;

  const isAdmin = Boolean(user && (user.role === "admin" || user.is_admin));
  const greetingName = user?.name || (isAdmin ? "Campus Administrator" : "Student");

  // Workflow step counts based on real claim statuses
  const workflowStats = {
    claimFiled: claims.length,
    verification: claims.filter(
      (c) => c.status === "pending" || c.status === "under_review"
    ).length,
    handover: claims.filter(
      (c) =>
        c.status === "approved" ||
        c.status === "ready_for_pickup" ||
        c.status === "handover"
    ).length,
    completed: claims.filter(
      (c) => c.status === "resolved" || c.status === "completed"
    ).length,
  };

  return (
    <div className="dash-container">
      {/* ------------------------------------------------------------------
          1. HERO / WELCOME SECTION (FEATURING REAL MIT-WPU CAMPUS DOME)
          ------------------------------------------------------------------ */}
      <section className="dash-hero" aria-label="Dashboard Welcome">
        {/* Ambient Moving Glows & Tech Grid */}
        <div className="dash-hero__ambient" aria-hidden="true" />
        <div className="dash-hero__ambient-secondary" aria-hidden="true" />
        <div className="dash-hero__grid" aria-hidden="true" />

        {/* Left Typography & Welcome Greeting */}
        <div className="dash-hero__content">
          <div className="dash-hero__badge-row">
            <div className="dash-hero__badge">
              <span className="dash-hero__badge-dot" />
              <span>MIT-WPU DIGITAL PORTAL</span>
            </div>

            <div className="dash-hero__chip">
              <Sparkles size={13} />
              <span>AI Smart Matching Active</span>
            </div>
          </div>

          <h1 className="dash-hero__title">
            Welcome back, {greetingName} 👋
          </h1>
        </div>

        {/* Right Call To Actions */}
        <div className="dash-hero__actions">
          <Link
            to="/report-lost"
            className="dash-hero__btn-primary"
            id="hero-report-lost-btn"
          >
            <PlusCircle size={16} strokeWidth={2.2} />
            <span>Report Lost</span>
          </Link>

          <Link
            to="/report-found"
            className="dash-hero__btn-secondary"
            id="hero-report-found-btn"
          >
            <Search size={16} strokeWidth={2} />
            <span>Report Found</span>
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          2. STATISTICS SECTION (3 KPI CARDS WITH ENHANCED COLORS & GRAPHICS)
          ------------------------------------------------------------------ */}
      <section className="dash-stats-grid" aria-label="Key Performance Indicators">
        {/* Card 1: My Submitted Reports */}
        <Link
          to="/dashboard/reports"
          className="dash-stat-card dash-stat-card--reports"
          id="stat-submitted-reports"
        >
          <div className="dash-stat-card__top">
            <div className="dash-stat-card__icon-wrap">
              <FileText size={22} strokeWidth={2} />
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span className="dash-stat-card__tag dash-stat-card__tag--blue">
                Live Registry
              </span>
              <div className="dash-stat-card__arrow" aria-hidden="true">
                <ArrowRight size={14} strokeWidth={2.2} />
              </div>
            </div>
          </div>
          <div className="dash-stat-card__body">
            <span className="dash-stat-card__label">My Submitted Reports</span>
            <span className="dash-stat-card__value">{myReports.length}</span>
            <span className="dash-stat-card__subtext">
              {myReports.length === 0
                ? "No reports submitted yet"
                : `${myReports.length} ${
                    myReports.length === 1 ? "report" : "reports"
                  } tracked across campus`}
            </span>
          </div>
        </Link>

        {/* Card 2: Claims Filed */}
        <Link
          to="/dashboard/claims"
          className="dash-stat-card dash-stat-card--claims"
          id="stat-claims-filed"
        >
          <div className="dash-stat-card__top">
            <div className="dash-stat-card__icon-wrap">
              <ShieldCheck size={22} strokeWidth={2} />
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span className="dash-stat-card__tag dash-stat-card__tag--green">
                Verification Queue
              </span>
              <div className="dash-stat-card__arrow" aria-hidden="true">
                <ArrowRight size={14} strokeWidth={2.2} />
              </div>
            </div>
          </div>
          <div className="dash-stat-card__body">
            <span className="dash-stat-card__label">Claims Filed</span>
            <span className="dash-stat-card__value">{claims.length}</span>
            <span className="dash-stat-card__subtext">
              {claims.length === 0
                ? "No claims filed yet"
                : `${claims.length} ${
                    claims.length === 1 ? "claim" : "claims"
                  } in active workflow`}
            </span>
          </div>
        </Link>

        {/* Card 3: Unread Alerts */}
        <div
          className={`dash-stat-card dash-stat-card--alerts ${
            unreadNotifsCount > 0 ? "has-unread" : ""
          }`}
          id="stat-unread-alerts"
        >
          <div className="dash-stat-card__top">
            <div className="dash-stat-card__icon-wrap">
              <Bell size={22} strokeWidth={2} />
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                className={`dash-stat-card__tag ${
                  unreadNotifsCount > 0
                    ? "dash-stat-card__tag--red"
                    : "dash-stat-card__tag--purple"
                }`}
              >
                {unreadNotifsCount > 0 ? "Action Required" : "All Clear"}
              </span>
              <div className="dash-stat-card__arrow" aria-hidden="true">
                <ArrowRight size={14} strokeWidth={2.2} />
              </div>
            </div>
          </div>
          <div className="dash-stat-card__body">
            <span className="dash-stat-card__label">Unread Alerts</span>
            <span className="dash-stat-card__value">{unreadNotifsCount}</span>
            <span className="dash-stat-card__subtext">
              {unreadNotifsCount === 0
                ? "No new alerts"
                : `${unreadNotifsCount} ${
                    unreadNotifsCount === 1 ? "notice" : "notices"
                  } require attention`}
            </span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          3. ACTIVITY PANELS: RECENT SUBMISSIONS & CLAIMS PROGRESS
          ------------------------------------------------------------------ */}
      <section className="dash-panels-grid">
        {/* Left Column: Recent Submissions */}
        <div className="dash-panel" id="recent-submissions-panel">
          <div className="dash-panel__header">
            <div className="dash-panel__title-group">
              <FileText size={19} className="dash-panel__icon" />
              <h2 className="dash-panel__title">Recent Submissions</h2>
            </div>
            <Link
              to="/dashboard/reports"
              className="dash-panel__view-all"
              id="view-all-reports-link"
            >
              <span>View all</span>
              <ArrowRight size={13} strokeWidth={2.2} />
            </Link>
          </div>

          <div className="dash-panel__content">
            {recentReports.length > 0 ? (
              <div className="dash-items-list">
                {recentReports.map((item) => (
                  <div key={item.id} className="dash-item-row">
                    <div className="dash-item-row__left">
                      <div className="dash-item-row__top-tags">
                        <Badge status={item.type} />
                        <span className="dash-item-row__id">#{item.id}</span>
                      </div>
                      <h3 className="dash-item-row__title">{item.title}</h3>
                      <div className="dash-item-row__meta">
                        <span className="dash-item-row__meta-item">
                          <MapPin size={12} /> {item.location || "Campus"}
                        </span>
                        <span className="dash-item-row__meta-item">
                          <Calendar size={12} /> {item.date || "Recent"}
                        </span>
                      </div>
                    </div>
                    <Badge status={item.status || "active"} />
                  </div>
                ))}
              </div>
            ) : (
              /* Refined Empty State Matching Reference Mockup with Enhanced Ripple */
              <div className="dash-empty-state">
                <div className="dash-empty-state__icon-ring">
                  <FileText size={26} strokeWidth={1.8} />
                </div>
                <h3 className="dash-empty-state__title">No reports filed</h3>
                <p className="dash-empty-state__desc">
                  Log items you lose or find to search matches across campus.
                </p>
                <div className="dash-empty-state__actions">
                  <Link
                    to="/report-lost"
                    className="dash-empty-state__btn-primary"
                    id="empty-report-lost-btn"
                  >
                    <PlusCircle size={15} />
                    <span>Report Lost</span>
                  </Link>
                  <Link
                    to="/report-found"
                    className="dash-empty-state__btn-secondary"
                    id="empty-report-found-btn"
                  >
                    <span>Report Found</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Claims Handover Progress */}
        <div className="dash-panel" id="claims-handover-panel">
          <div className="dash-panel__header">
            <div className="dash-panel__title-group">
              <HandCoins size={19} className="dash-panel__icon" />
              <h2 className="dash-panel__title">Claims Handover Progress</h2>
            </div>
            <Link
              to="/dashboard/claims"
              className="dash-panel__view-all"
              id="view-all-claims-link"
            >
              <span>View all</span>
              <ArrowRight size={13} strokeWidth={2.2} />
            </Link>
          </div>

          <div className="dash-panel__content">
            {recentClaims.length > 0 ? (
              <div className="dash-items-list">
                {recentClaims.map((claim) => (
                  <div key={claim.id} className="dash-item-row">
                    <div className="dash-item-row__left">
                      <div className="dash-item-row__top-tags">
                        <span className="dash-item-row__id">
                          Claim #{claim.id}
                        </span>
                      </div>
                      <h3 className="dash-item-row__title">
                        {claim.item_title || "Claimed Item"}
                      </h3>
                      <div className="dash-item-row__meta">
                        <span className="dash-item-row__meta-item">
                          <Calendar size={12} /> Filed on{" "}
                          {claim.created_at
                            ? new Date(claim.created_at).toLocaleDateString()
                            : "Recent"}
                        </span>
                      </div>
                    </div>
                    <Badge status={claim.status || "pending"} />
                  </div>
                ))}
              </div>
            ) : (
              /* Visual Claims Workflow Representation with Colorful Nodes */
              <div className="dash-workflow">
                <div className="dash-workflow__icon-ring">
                  <FileCheck size={28} strokeWidth={1.8} />
                </div>

                {/* 4 Connected Stages with Individual Colors */}
                <div className="dash-workflow__steps">
                  <div className="dash-workflow__line" aria-hidden="true" />

                  <div className="dash-workflow__step dash-workflow__step--1">
                    <div className="dash-workflow__node">1</div>
                    <span className="dash-workflow__label">Claim Filed</span>
                    <span className="dash-workflow__count">
                      {workflowStats.claimFiled}
                    </span>
                  </div>

                  <div className="dash-workflow__step dash-workflow__step--2">
                    <div className="dash-workflow__node">2</div>
                    <span className="dash-workflow__label">Verification</span>
                    <span className="dash-workflow__count">
                      {workflowStats.verification}
                    </span>
                  </div>

                  <div className="dash-workflow__step dash-workflow__step--3">
                    <div className="dash-workflow__node">3</div>
                    <span className="dash-workflow__label">Handover</span>
                    <span className="dash-workflow__count">
                      {workflowStats.handover}
                    </span>
                  </div>

                  <div className="dash-workflow__step dash-workflow__step--4">
                    <div className="dash-workflow__node">4</div>
                    <span className="dash-workflow__label">Completed</span>
                    <span className="dash-workflow__count">
                      {workflowStats.completed}
                    </span>
                  </div>
                </div>

                {/* Info Callout Box with Gradient */}
                <div className="dash-workflow__info-banner">
                  <Info size={17} className="dash-workflow__info-icon" />
                  <span>
                    File claims on matching found items to recover them through campus security verification.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
