import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  HandCoins,
  Bell,
  Users,
  ShieldAlert,
  Sparkles,
  ClipboardList,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  Search,
  Home,
  Package,
  PlusCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth, API_BASE_URL } from "../context/AuthContext.jsx";
import NotificationDropdown from "../components/NotificationDropdown.jsx";
import mitLogo from "../assets/logo.jpg";
import "./DashboardLayout.css";

const STUDENT_NAV = [
  {
    section: "STUDENT WORKSPACE",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: Home, end: true },
      { label: "My Reports", to: "/dashboard/reports", icon: Package },
      { label: "My Claims", to: "/dashboard/claims", icon: HandCoins },
      { label: "Notifications", to: "/notifications", icon: Bell, badge: true },
    ]
  },
  {
    section: "QUICK ACTIONS",
    items: [
      { label: "Report Lost Item", to: "/report-lost", icon: PlusCircle },
      { label: "Report Found Item", to: "/report-found", icon: PlusCircle },
    ]
  }
];

const ADMIN_NAV = [
  {
    section: "OVERVIEW",
    items: [
      { label: "Dashboard Overview", to: "/admin", icon: LayoutDashboard, end: true },
      { label: "Notifications", to: "/notifications", icon: Bell, badge: true },
    ]
  },
  {
    section: "MANAGEMENT",
    items: [
      { label: "Lost & Found Reports", to: "/admin/reports", icon: ClipboardList },
      { label: "User Directory", to: "/admin/users", icon: Users },
    ]
  },
  {
    section: "VERIFICATION",
    items: [
      { label: "Pending Approvals", to: "/admin/pending", icon: ShieldAlert },
      { label: "Claims Verification", to: "/admin/claims", icon: HandCoins },
      { label: "Smart Matches", to: "/admin/matches", icon: Sparkles },
    ]
  }
];

function NavItem({ to, label, icon: Icon, end, onClick, unreadCount, badge }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => `dash__link${isActive ? " dash__link--active" : ""}`}
    >
      <Icon size={18} strokeWidth={2} className="dash__link-icon" />
      <span className="dash__link-text">{label}</span>
      {badge && unreadCount > 0 && (
        <span className="dash__link-badge">
          {unreadCount}
        </span>
      )}
    </NavLink>
  );
}

function DashboardContent() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = Boolean(user && (user.role === "admin" || user.is_admin));
  const navSections = isAdmin ? ADMIN_NAV : STUDENT_NAV;

  // Notification Polling (every 5 seconds + immediate event trigger)
  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/notifications/unread-count.php`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setUnreadCount(data.unread_count || 0);
          }
        }
      } catch (err) {
        console.warn("Unread count fetch error:", err);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    window.addEventListener("foundit-refresh-notifications", fetchUnread);

    return () => {
      clearInterval(interval);
      window.removeEventListener("foundit-refresh-notifications", fetchUnread);
    };
  }, [user, location.pathname]);

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    navigate("/login", { replace: true });
  };

  const getPageTitle = () => {
    const p = location.pathname;
    if (p === "/dashboard") return "Dashboard Overview";
    if (p === "/dashboard/reports") return "My Reports";
    if (p === "/dashboard/claims") return "My Claims";
    if (p === "/notifications") return "Notifications Center";
    if (p === "/admin") return "Dashboard Overview";
    if (p === "/admin/reports") return "Lost & Found Reports";
    if (p === "/admin/users") return "User Directory";
    if (p === "/admin/pending") return "Pending Approvals";
    if (p === "/admin/claims") return "Claims Verification";
    if (p === "/admin/matches") return "Smart Matches";
    return "Workspace";
  };

  const displayName = user?.name || (isAdmin ? "Campus Administrator" : "Student");
  const displayRole = isAdmin ? "Campus Administrator" : "Student Profile";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="dash">
      {/* Mobile Drawer Backdrop Overlay */}
      {open && (
        <div
          className="dash__backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Top Mobile Bar */}
      <div className="dash__mobile-bar">
        <div className="dash__mobile-brand">
          <div className="dash__brand-mark-mini">
            <img src={mitLogo} alt="MIT-WPU" className="dash__brand-img" />
          </div>
          <span className="dash__mobile-title">MIT-WPU FoundIt</span>
        </div>
        <div className="dash__mobile-actions">
          <NotificationDropdown unreadCount={unreadCount} setUnreadCount={setUnreadCount} />
          <button
            className="dash__mobile-btn"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Modern SaaS Dark Navy Sidebar */}
      <aside className={`dash__sidebar ${open ? "dash__sidebar--open" : ""}`}>
        {/* Brand Header using the official homepage MIT-WPU logo */}
        <div className="dash__brand-container">
          <Link to="/" className="dash__brand" title="MIT-WPU FoundIt Home">
            <div className="dash__brand-mark">
              <img src={mitLogo} alt="MIT-WPU" className="dash__brand-img" />
            </div>
            <div className="dash__brand-info">
              <span className="dash__brand-title">MIT-WPU</span>
              <span className="dash__brand-subtitle">
                {isAdmin ? "FOUNDIT MANAGEMENT" : "STUDENT PORTAL"}
              </span>
            </div>
          </Link>
          {open && (
            <button
              className="dash__close-drawer-btn"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* User Profile Card with glowing status */}
        {user && (
          <div className="dash__user-card">
            <div className={`dash__user-avatar ${isAdmin ? "dash__user-avatar--admin" : ""}`}>
              {userInitial}
            </div>
            <div className="dash__user-info">
              <div className="dash__user-name" title={displayName}>
                {displayName}
              </div>
              <div className="dash__user-role">
                {displayRole}
              </div>
              {user.roll_number && (
                <div style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", marginTop: "2px", letterSpacing: "0.02em" }}>
                  {user.roll_number}{user.stream ? ` • ${user.stream}` : ""}
                </div>
              )}
              <div className="dash__user-status">
                <span className="dash__status-dot"></span>
                <span>Online &bull; Verified</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="dash__nav">
          {navSections.map((sec, idx) => (
            <div key={sec.section || idx} className="dash__nav-group">
              <span className="dash__nav-label">{sec.section}</span>
              <div className="dash__nav-items">
                {sec.items.map((item) => (
                  <NavItem
                    key={item.to}
                    {...item}
                    unreadCount={unreadCount}
                    onClick={() => setOpen(false)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout Action */}
        <div className="dash__sidebar-actions">
          <button
            type="button"
            onClick={handleLogout}
            className="dash__logout"
          >
            <LogOut size={16} strokeWidth={2.4} />
            <span>LOGOUT</span>
          </button>
        </div>

        {/* MIT-WPU University Bottom Watermark */}
        <div className="dash__sidebar-footer">
          <div className="dash__footer-watermark">
            <svg viewBox="0 0 160 40" fill="none" className="dash__footer-svg" aria-hidden="true">
              {/* Architectural campus dome & arches silhouette */}
              <path d="M10 38 L10 24 L20 24 L20 38 Z" fill="currentColor" opacity="0.15" />
              <path d="M24 38 L24 20 L36 20 L36 38 Z" fill="currentColor" opacity="0.18" />
              <path d="M40 38 L40 16 L54 16 L54 38 Z" fill="currentColor" opacity="0.22" />
              <path d="M58 38 L58 12 C58 8, 70 8, 70 12 L70 38 Z" fill="currentColor" opacity="0.28" />
              {/* Grand Central Dome */}
              <path d="M72 38 L72 14 C72 4, 94 4, 94 14 L94 38 Z" fill="currentColor" opacity="0.38" />
              <path d="M78 4 C78 1, 88 1, 88 4 Z" fill="currentColor" opacity="0.48" />
              <circle cx="83" cy="2" r="1.5" fill="currentColor" opacity="0.55" />
              <path d="M96 38 L96 12 C96 8, 108 8, 108 12 L108 38 Z" fill="currentColor" opacity="0.28" />
              <path d="M112 38 L112 16 L126 16 L126 38 Z" fill="currentColor" opacity="0.22" />
              <path d="M130 38 L130 20 L142 20 L142 38 Z" fill="currentColor" opacity="0.18" />
              <path d="M146 38 L146 24 L156 24 L156 38 Z" fill="currentColor" opacity="0.15" />
              <line x1="0" y1="38" x2="160" y2="38" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            </svg>
            <div className="dash__footer-brand">MIT-WPU</div>
            <div className="dash__footer-motto">Education &bull; Innovation &bull; Impact</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dash__body">
        {/* Top Navbar */}
        <header className="dash__header">
          {/* Breadcrumb & Current Context */}
          <div className="dash__breadcrumb">
            <span className="dash__breadcrumb-prefix">
              {isAdmin ? "Admin Console" : "Student Workspace"}
            </span>
            <span className="dash__breadcrumb-divider">|</span>
            <h1 className="dash__breadcrumb-title">{getPageTitle()}</h1>
          </div>

          {/* Reference Image Style Search Bar */}
          <div className="dash__search-bar">
            <Search size={15} className="dash__search-icon" />
            <input
              type="text"
              placeholder="Search my reports &amp; claims..."
              className="dash__search-input"
              aria-label="Quick search"
            />
          </div>

          {/* Right Header Actions */}
          <div className="dash__header-actions">
            <NotificationDropdown unreadCount={unreadCount} setUnreadCount={setUnreadCount} />

            {/* Profile Avatar Pill */}
            <div className="dash__user-pill" title={displayName}>
              <div className={`dash__user-pill-avatar ${isAdmin ? "dash__user-pill-avatar--admin" : ""}`}>
                {userInitial}
              </div>
              <span className="dash__user-pill-name">{displayName}</span>
            </div>

            <Link
              to="/"
              className="dash__public-btn"
              title="Open Public Campus Portal"
            >
              <span>Public Portal</span>
              <ArrowUpRight size={14} strokeWidth={2.2} />
            </Link>
          </div>
        </header>

        {/* Dashboard Dynamic Page View */}
        <main className="dash__main-inner">
          <div key={location.pathname} className="dash__page-fade">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  return <DashboardContent />;
}
