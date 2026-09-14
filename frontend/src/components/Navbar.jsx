import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ArrowUpRight, Menu, X, User, LogOut } from "lucide-react";
import logo from "../assets/logo.jpg";
import { useAuth } from "../context/AuthContext.jsx";
import { useAnimation } from "../context/AnimationContext.jsx";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Home", to: "/", end: true },
  { label: "How It Works", to: "/how-it-works" },
  { label: "About", to: "/about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { stage, setLogoRef } = useAnimation();

  const isAdmin = user && (user.role === "admin" || user.is_admin);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goLogin = () => {
    setMenuOpen(false);
    navigate("/login");
  };

  const goDashboard = () => {
    setMenuOpen(false);
    if (isAdmin) {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__brand" aria-label="Home">
          <span className="navbar__mark" aria-hidden="true">
            <img src={logo} alt="" className="navbar__mark-img" />
          </span>
          <span className="navbar__title" style={{ display: "inline-flex", alignItems: "center", fontWeight: 800, fontSize: "1.38rem", letterSpacing: "-0.03em" }}>
            <span>F</span>
            <span
              ref={setLogoRef}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "22px",
                height: "22px",
                margin: "0 2px",
                position: "relative",
                verticalAlign: "middle"
              }}
            >
              {stage === "settled" && (
                <svg width="22" height="22" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transformOrigin: "center center", animation: "scale-pop 250ms cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards" }}>
                  <defs>
                    <linearGradient id="lens-grad-logo" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="rgba(255, 255, 255, 0.5)" />
                      <stop offset="100%" stopColor="rgba(52, 89, 163, 0.15)" />
                    </linearGradient>
                    <linearGradient id="handle-grad-logo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C9A548" />
                      <stop offset="100%" stopColor="#A8863A" />
                    </linearGradient>
                  </defs>
                  <rect x="58" y="58" width="10" height="34" rx="5" transform="rotate(-45 58 58)" fill="url(#handle-grad-logo)" stroke="#1E3674" strokeWidth="3.5" />
                  <circle cx="42" cy="42" r="26" fill="url(#lens-grad-logo)" stroke="#1E3674" strokeWidth="6.5" />
                  <path d="M24 30 C30 20, 44 18, 54 24" stroke="white" strokeWidth="3.5" strokeLinecap="round" opacity="0.65" />
                  <circle cx="42" cy="42" r="21" stroke="white" strokeWidth="1.2" strokeDasharray="8 12" opacity="0.4" />
                </svg>
              )}
            </span>
            <span style={{ color: "var(--navy-900)" }}>undIt</span>
          </span>
        </NavLink>

        <div className="navbar__pill">
          <nav className="navbar__links" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `navbar__link${isActive ? " navbar__link--active" : ""}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {isAuthenticated && user ? (
            <div className="navbar__auth-actions" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button className="btn btn--solid" onClick={goDashboard} style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", background: "#111", color: "#fff", border: "none", borderRadius: "8px" }}>
                <User size={15} style={{ marginRight: "6px" }} />
                {isAdmin ? "Admin Console" : "Dashboard"}
              </button>
              <button
                className="btn btn--outline"
                onClick={handleLogout}
                title="Log out"
                style={{ padding: "0.5rem", borderRadius: "8px" }}
                aria-label="Log out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button className="btn btn--solid navbar__login" onClick={goLogin} style={{ padding: "0.6rem 1.2rem", fontSize: "0.85rem", background: "#111", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", letterSpacing: "0.05em" }}>
              GET STARTED
            </button>
          )}

          <button
            className="navbar__burger"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="navbar__mobile">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              end={link.end}
              className="navbar__mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}

          {isAuthenticated && user ? (
            <>
              <button className="btn btn--emerald btn--block" onClick={goDashboard}>
                <User size={15} />
                {isAdmin ? "Admin Console" : `Dashboard (${user.name})`}
              </button>
              <button className="btn btn--outline btn--block" onClick={handleLogout}>
                <LogOut size={15} />
                Log out
              </button>
            </>
          ) : (
            <button className="btn btn--outline btn--block" onClick={goLogin}>
              Login
              <ArrowUpRight size={15} strokeWidth={2.3} />
            </button>
          )}
        </div>
      )}
    </header>
  );
}
