import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ArrowUpRight, Menu, X, User, LogOut } from "lucide-react";
import logo from "../assets/logo.jpg";
import { useAuth } from "../context/AuthContext.jsx";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Home", id: "home" },
  { label: "How It Works", id: "how-it-works" },
  { label: "About", id: "about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isAdmin = user && (user.role === "admin" || user.is_admin);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);

      // Section spy
      const sections = ["home", "how-it-works", "about"];
      const scrollPos = window.scrollY + 200;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (id) => {
    setMenuOpen(false);
    if (window.location.pathname !== "/") {
      navigate(`/#${id}`);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

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
          <span className="navbar__title" style={{ display: "inline-flex", alignItems: "center", fontWeight: 800, fontSize: "1.38rem", letterSpacing: "-0.03em", color: "#ffffff" }}>
            <span style={{ color: "#ffffff" }}>F</span>
            <span
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
              <svg width="22" height="22" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="lens-grad-logo" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.45)" />
                    <stop offset="100%" stopColor="rgba(255, 255, 255, 0.12)" />
                  </linearGradient>
                  <linearGradient id="handle-grad-logo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                  </linearGradient>
                </defs>
                <rect x="58" y="58" width="10" height="34" rx="5" transform="rotate(-45 58 58)" fill="url(#handle-grad-logo)" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="42" cy="42" r="26" fill="url(#lens-grad-logo)" stroke="#ffffff" strokeWidth="6" />
                <path d="M24 30 C30 20, 44 18, 54 24" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
                <circle cx="42" cy="42" r="21" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="8 12" opacity="0.5" />
              </svg>
            </span>
            <span style={{ color: "#ffffff" }}>undIt</span>
          </span>
        </NavLink>

        <div className="navbar__pill">
          <nav className="navbar__links" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => handleNavClick(link.id)}
                className={`navbar__link${activeSection === link.id ? " navbar__link--active" : ""}`}
              >
                {link.label}
              </button>
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
            <button
              key={link.label}
              type="button"
              className={`navbar__mobile-link${activeSection === link.id ? " active" : ""}`}
              onClick={() => handleNavClick(link.id)}
            >
              {link.label}
            </button>
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
