import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import GoogleButton from "../components/GoogleButton.jsx";
import FadeInSection from "../components/FadeInSection.jsx";

export default function Register() {
  const navigate = useNavigate();
  const { register, loginWithGoogle, isAuthenticated, user } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: "",
    roll_number: "",
    stream: "",
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin" || user.is_admin) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const validateField = (field, value, allValues = form) => {
    let error = "";
    switch (field) {
      case "name":
        if (!value.trim()) error = "Full name is required.";
        break;
      case "email":
        if (!value.trim()) {
          error = "Email address is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address.";
        }
        break;
      case "phone_number": {
        const cleanPhone = value.replace(/[^\d+]/g, "");
        if (!value.trim()) {
          error = "Phone number is required.";
        } else if (cleanPhone.length < 10) {
          error = "Please enter a valid phone number.";
        }
        break;
      }
      case "password":
        if (!value) {
          error = "Password is required.";
        } else if (value.length < 6) {
          error = "Password must be at least 6 characters long.";
        }
        break;
      case "confirm_password":
        if (!value) {
          error = "Please confirm your password.";
        } else if (value !== allValues.password) {
          error = "Passwords do not match.";
        }
        break;
      case "roll_number":
        if (!value.trim()) error = "Roll number is required.";
        break;
      case "stream":
        if (!value.trim()) error = "Stream (e.g. BCA, MCA) is required.";
        break;
      default:
        break;
    }
    return error;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, form[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const update = (key) => (e) => {
    const val = e.target.value;
    const nextForm = { ...form, [key]: val };
    setForm(nextForm);

    if (touched[key]) {
      const err = validateField(key, val, nextForm);
      setErrors((prev) => ({ ...prev, [key]: err }));
    }

    if (key === "password" && touched.confirm_password) {
      const matchErr = validateField("confirm_password", nextForm.confirm_password, nextForm);
      setErrors((prev) => ({ ...prev, confirm_password: matchErr }));
    }
  };

  const handleGoogleSignup = async () => {
    setGeneralError("");
    setGoogleLoading(true);

    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setGeneralError(err.message || "Failed to sign up with Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    // Validate all fields
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const err = validateField(key, form[key]);
      if (err) newErrors[key] = err;
    });

    setTouched({
      name: true,
      email: true,
      phone_number: true,
      password: true,
      confirm_password: true,
      roll_number: true,
      stream: true,
    });
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      await register(
        form.name,
        form.email,
        form.phone_number,
        form.password,
        form.roll_number,
        form.stream
      );
      navigate("/login", {
        replace: true,
        state: { message: "Account created successfully! Please log in." },
      });
    } catch (err) {
      setGeneralError(err.message || "Failed to register account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FadeInSection>
      <h1 className="auth-card__title">Create your account</h1>
      <p className="auth-card__subtitle">
        Register once to start reporting and tracking lost and found items.
      </p>

      {generalError && (
        <div className="auth-error" style={{ marginBottom: "1rem" }}>
          {generalError}
        </div>
      )}

      {/* Google Sign-In / Sign-Up Button */}
      <div style={{ marginBottom: "20px" }}>
        <GoogleButton onClick={handleGoogleSignup} loading={googleLoading} disabled={loading} text="Sign up with Google" />
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
        <span style={{ flex: 1, height: "1px", background: "rgba(168, 85, 247, 0.2)" }} />
        <span>or with credentials</span>
        <span style={{ flex: 1, height: "1px", background: "rgba(168, 85, 247, 0.2)" }} />
      </div>

      <form className="form" onSubmit={handleSubmit} noValidate>
        {/* Profile details */}
        <div className="form-row">
          <div className="field">
            <label className="field__label" htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              className="input"
              placeholder="e.g. Aarav Mehta"
              required
              value={form.name}
              onChange={update("name")}
              onBlur={() => handleBlur("name")}
            />
            {touched.name && errors.name && (
              <span style={{ fontSize: "0.78rem", color: "var(--red-500)", marginTop: "2px" }}>
                {errors.name}
              </span>
            )}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              required
              value={form.email}
              onChange={update("email")}
              onBlur={() => handleBlur("email")}
            />
            {touched.email && errors.email && (
              <span style={{ fontSize: "0.78rem", color: "var(--red-500)", marginTop: "2px" }}>
                {errors.email}
              </span>
            )}
          </div>
        </div>

        {/* Roll number + Stream */}
        <div className="form-row">
          <div className="field">
            <label className="field__label" htmlFor="roll_number">Roll Number</label>
            <input
              id="roll_number"
              type="text"
              className="input"
              placeholder="e.g. 2024-BCA-042"
              required
              value={form.roll_number}
              onChange={update("roll_number")}
              onBlur={() => handleBlur("roll_number")}
            />
            {touched.roll_number && errors.roll_number && (
              <span style={{ fontSize: "0.78rem", color: "var(--red-500)", marginTop: "2px" }}>
                {errors.roll_number}
              </span>
            )}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="stream">Stream / Class</label>
            <input
              id="stream"
              type="text"
              className="input"
              placeholder="e.g. BCA"
              required
              value={form.stream}
              onChange={update("stream")}
              onBlur={() => handleBlur("stream")}
            />
            {touched.stream && errors.stream && (
              <span style={{ fontSize: "0.78rem", color: "var(--red-500)", marginTop: "2px" }}>
                {errors.stream}
              </span>
            )}
          </div>
        </div>

        {/* Removed Vehicle Details */}

        {/* Phone Number */}
        <div className="field">
          <label className="field__label" htmlFor="phone_number">Phone number</label>
          <input
            id="phone_number"
            type="tel"
            className="input"
            placeholder="e.g. 9876543210"
            required
            value={form.phone_number}
            onChange={update("phone_number")}
            onBlur={() => handleBlur("phone_number")}
          />
          {touched.phone_number && errors.phone_number && (
            <span style={{ fontSize: "0.78rem", color: "var(--red-500)", marginTop: "2px" }}>
              {errors.phone_number}
            </span>
          )}
        </div>

        {/* Password + Confirm Password Row */}
        <div className="form-row">
          <div className="field">
            <label className="field__label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              required
              minLength={6}
              value={form.password}
              onChange={update("password")}
              onBlur={() => handleBlur("password")}
            />
            {touched.password && errors.password && (
              <span style={{ fontSize: "0.78rem", color: "var(--red-500)", marginTop: "2px" }}>
                {errors.password}
              </span>
            )}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="confirm_password">Confirm Password</label>
            <input
              id="confirm_password"
              type="password"
              className="input"
              placeholder="Re-enter password"
              required
              value={form.confirm_password}
              onChange={update("confirm_password")}
              onBlur={() => handleBlur("confirm_password")}
            />
            {touched.confirm_password && errors.confirm_password && (
              <span style={{ fontSize: "0.78rem", color: "var(--red-500)", marginTop: "2px" }}>
                {errors.confirm_password}
              </span>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn--emerald btn--block"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="auth-card__footnote">
        Already registered? <Link to="/login" className="auth-card__link">Log in</Link>
      </p>
    </FadeInSection>
  );
}
