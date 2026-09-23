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
  const [mailSent, setMailSent] = useState(false);

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
      setMailSent(Boolean(res?.mail_sent));
      if (res?.dev_reset_token) {
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
      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "12px", background: "rgba(168, 85, 247, 0.15)", color: "#c084fc", border: "1px solid rgba(168, 85, 247, 0.3)", marginBottom: "16px", boxShadow: "0 0 15px rgba(168, 85, 247, 0.25)" }}>
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

          <p style={{ fontSize: "0.92rem", color: "#ffffff", lineHeight: 1.5, margin: "0 0 16px" }}>
            {mailSent ? (
              <>A password reset link has been dispatched to <strong>{email}</strong>! Please check your inbox and spam folder.</>
            ) : (
              <>A password reset request has been processed for <strong>{email}</strong>.</>
            )}
          </p>

          {devToken && (
            <div style={{ margin: "16px 0", padding: "14px", borderRadius: "8px", background: "rgba(168, 85, 247, 0.1)", border: "1px dashed rgba(168, 85, 247, 0.4)", textAlign: "left" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                Development Notice: SMTP Not Configured
              </div>
              <p style={{ fontSize: "0.82rem", color: "#cbd5e1", margin: "0 0 10px", lineHeight: 1.4 }}>
                To send real emails to your inbox, enter your SMTP server credentials in the <code>.env</code> file. For local testing, click below to open the reset password screen:
              </p>
              <Link
                to={`/reset-password?token=${devToken}`}
                className="btn btn--emerald btn--sm btn--block"
              >
                Proceed to Reset Password Screen
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
              color: "#c084fc",
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
