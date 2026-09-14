import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing password reset token. Please request a new link.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(token, password);
      navigate("/login", {
        replace: true,
        state: { message: res.message || "Password reset successfully! Please log in." },
      });
    } catch (err) {
      setError(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "12px", background: "rgba(30, 54, 116, 0.08)", color: "var(--navy-900)", marginBottom: "16px" }}>
        <ShieldCheck size={24} strokeWidth={2.2} />
      </div>

      <h1 className="auth-card__title">Set New Password</h1>
      <p className="auth-card__subtitle">
        Enter your new secure password below to regain access.
      </p>

      {error && (
        <div className="auth-error" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {!token ? (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <p style={{ color: "var(--slate-500)", fontSize: "0.9rem", marginBottom: "16px" }}>
            No reset token detected in the link. Please request a new password reset.
          </p>
          <Link to="/forgot-password" className="btn btn--emerald btn--block">
            Request New Reset Link
          </Link>
        </div>
      ) : (
        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field__label" htmlFor="password">
              New Password
            </label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="•••••••• (min 6 characters)"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="confirm_password">
              Confirm New Password
            </label>
            <input
              id="confirm_password"
              type="password"
              className="input"
              placeholder="Re-enter new password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn--emerald btn--block"
            disabled={loading}
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>

          <Link
            to="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              fontSize: "0.88rem",
              color: "var(--slate-500)",
              textDecoration: "none",
              marginTop: "8px",
            }}
          >
            <ArrowLeft size={15} />
            Back to Login
          </Link>
        </form>
      )}
    </>
  );
}
