import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await forgotPassword(email);
      setSubmitted(true);
      if (res.dev_reset_token) {
        setDevToken(res.dev_reset_token);
      }
    } catch (err) {
      setError(err.message || "Failed to process request. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "12px", background: "rgba(30, 54, 116, 0.08)", color: "var(--navy-900)", marginBottom: "16px" }}>
        <KeyRound size={24} strokeWidth={2.2} />
      </div>

      <h1 className="auth-card__title">Forgot Password</h1>
      <p className="auth-card__subtitle">
        Enter your registered MIT-WPU email to receive secure recovery instructions.
      </p>

      {error && (
        <div className="auth-error" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {submitted ? (
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", marginBottom: "12px" }}>
            <CheckCircle2 size={24} strokeWidth={2.2} />
          </div>

          <p style={{ fontSize: "0.92rem", color: "var(--ink)", lineHeight: 1.5, margin: "0 0 16px" }}>
            If an account is associated with <strong>{email}</strong>, a secure password reset link has been dispatched.
          </p>

          {devToken && (
            <div style={{ margin: "16px 0", padding: "12px", borderRadius: "8px", background: "rgba(52, 89, 163, 0.08)", border: "1px dashed var(--blue-500)", textAlign: "left" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--navy-900)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                Development Mode Quick Access
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--slate-500)", margin: "0 0 10px" }}>
                Mail server is simulated locally. Click below to continue directly to the reset screen:
              </p>
              <Link
                to={`/reset-password?token=${devToken}`}
                className="btn btn--emerald btn--sm btn--block"
              >
                Proceed to Reset Password
              </Link>
            </div>
          )}

          <Link
            to="/login"
            className="btn btn--outline btn--block"
            style={{ marginTop: "12px" }}
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      ) : (
        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field__label" htmlFor="email">
              Registered email
            </label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@mitwpu.edu.in"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            className="btn btn--emerald btn--block"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
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
