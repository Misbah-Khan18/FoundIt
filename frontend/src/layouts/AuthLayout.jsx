import { Link, Outlet } from "react-router-dom";
import logo from "../assets/logo.jpg";
import "./AuthLayout.css";

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-layout__mesh" aria-hidden="true">
        <span className="auth-layout__blob auth-layout__blob--a" />
        <span className="auth-layout__blob auth-layout__blob--b" />
      </div>

      <Link to="/" className="auth-layout__brand">
        <span className="auth-layout__mark" aria-hidden="true">
          <img src={logo} alt="" className="auth-layout__mark-img" />
        </span>
        FoundIt
      </Link>

      <div className="auth-layout__card card">
        <Outlet />
      </div>

      <p className="auth-layout__footnote">MIT-WPU Lost &amp; Found Portal</p>
    </div>
  );
}
