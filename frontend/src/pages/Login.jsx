import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import GoogleButton from "../components/GoogleButton.jsx";
import FadeInSection from "../components/FadeInSection.jsx";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, user, isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || "");

  // If already logged in, redirect accordingly
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const validate = (name, val) => {
    let err = "";
    if (name === "email") {
      if (!val.trim()) {
        err = "Email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        err = "Please enter a valid email address.";
      }
    } else if (name === "password") {
      if (!val) {
        err = "Password is required.";
      }
    }
    return err;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validate(field, form[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const update = (key) => (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
    if (touched[key]) {
      setErrors((prev) => ({ ...prev, [key]: validate(key, val) }));
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      await loginWithGoogle();

      // Check if user came from attempting slot booking
      const intendedSlot = location.state?.intendedSlot;
      if (intendedSlot) {
        navigate("/", { replace: true, state: { openSlot: intendedSlot } });
        return;
      }

      if (location.state?.from) {
        navigate(location.state.from, { replace: true });
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const emailErr = validate("email", form.email);
    const passErr = validate("password", form.password);
    setTouched({ email: true, password: true });
    setErrors({ email: emailErr, password: passErr });

    if (emailErr || passErr) {
      return;
    }

    setLoading(true);

    try {
      await login(form.email, form.password);

      // Check if user came from attempting slot booking
      const intendedSlot = location.state?.intendedSlot;
      if (intendedSlot) {
        navigate("/", { replace: true, state: { openSlot: intendedSlot } });
        return;
      }

      if (location.state?.from) {
        navigate(location.state.from, { replace: true });
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FadeInSection>
      <h1 className="auth-card__title">Welcome back</h1>
      <p className="auth-card__subtitle">
        Log in to report and track lost and found items.
      </p>

      {/* Success banner */}
      {successMessage && (
        <div style={{ padding: "0.75rem 1rem", marginBottom: "1rem", borderRadius: "0.5rem", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)", fontSize: "0.875rem" }}>
          {successMessage}
        </div>
      )}

      {/* Login error feedback */}
      {error && (
        <div className="auth-error" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {/* Google Sign-In Button */}
      <div style={{ marginBottom: "20px" }}>
        <GoogleButton onClick={handleGoogleLogin} loading={googleLoading} disabled={loading} text="Continue with Google" />
      </div>

      {/* Divider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          margin: "0 0 20px",
          gap: "12px",
          color: "var(--slate-400, #94a3b8)",
          fontSize: "0.8rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        <span style={{ flex: 1, height: "1px", background: "var(--border-light, #e2e8f0)" }} />
        <span>or with credentials</span>
        <span style={{ flex: 1, height: "1px", background: "var(--border-light, #e2e8f0)" }} />
      </div>

      <form className="form" onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div className="field">
          <label className="field__label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="name@mitwpu.edu.in"
            required
            value={form.email}
            onChange={update("email")}
            onBlur={() => handleBlur("email")}
            autoComplete="email"
          />
          {touched.email && errors.email && (
            <span style={{ fontSize: "0.78rem", color: "var(--red-500)", marginTop: "2px" }}>
              {errors.email}
            </span>
          )}
        </div>

        {/* Password */}
        <div className="field">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label className="field__label" htmlFor="password">
              Password
            </label>
          </div>
          <input
            id="password"
            type="password"
            className="input"
            placeholder="••••••••"
            required
            value={form.password}
            onChange={update("password")}
            onBlur={() => handleBlur("password")}
            autoComplete="current-password"
          />
          {touched.password && errors.password && (
            <span style={{ fontSize: "0.78rem", color: "var(--red-500)", marginTop: "2px" }}>
              {errors.password}
            </span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn--emerald btn--block"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>



      <p className="auth-card__footnote">
        New student?{" "}
        <Link to="/register" className="auth-card__link">
          Create an account
        </Link>
      </p>
    </FadeInSection>
  );
}