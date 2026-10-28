import { useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Package,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, user, loading } = useAuth();

  // Login form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Display message after successful signup
  const successMessage = location.state?.message;

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // Handle login submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Basic validation
    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // Call backend login API
      await login(
        formData.email.trim(),
        formData.password
      );

      // Redirect after successful login
      navigate("/dashboard", {
        replace: true,
        state: null,
      });
    } catch (err) {
      console.error("Login failed:", err);

      setError(
        err.response?.data?.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Wait for session verification
  if (loading) {
    return (
      <div className="loading-screen">
        <h2>Loading StockFlow...</h2>
      </div>
    );
  }

  // Redirect authenticated users
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-page">

      {/* LEFT BRAND PANEL */}
      <section className="auth-brand-panel">

        <Link to="/login" className="auth-logo">
          <span className="auth-logo-icon">
            <Package size={23} strokeWidth={2.3} />
          </span>

          <span>StockFlow</span>
        </Link>

        <div className="auth-brand-content">

          <span className="auth-eyebrow">
            INVENTORY MANAGEMENT, SIMPLIFIED
          </span>

          <h1>
            Your inventory.
            <br />
            <span>Under control.</span>
          </h1>

          <p>
            Keep track of every product, monitor stock levels,
            and make smarter inventory decisions from one
            beautifully simple workspace.
          </p>

          <div className="auth-feature-list">

            <div>
              <span className="auth-feature-dot" />
              Real-time inventory visibility
            </div>

            <div>
              <span className="auth-feature-dot" />
              Smart low-stock monitoring
            </div>

            <div>
              <span className="auth-feature-dot" />
              Secure organization workspaces
            </div>

          </div>
        </div>

        <p className="auth-brand-footer">
          Built for businesses that move forward.
        </p>

      </section>

      {/* RIGHT LOGIN PANEL */}
      <section className="auth-form-panel">

        <div className="auth-form-container">

          {/* MOBILE LOGO */}
          <div className="auth-mobile-logo">
            <Package size={25} />
            <span>StockFlow</span>
          </div>

          {/* HEADING */}
          <div className="auth-form-heading">

            <span className="auth-form-eyebrow">
              WELCOME BACK
            </span>

            <h2>Sign in to your account</h2>

            <p>
              Enter your credentials to access your workspace.
            </p>

          </div>

          {/* SIGNUP SUCCESS MESSAGE */}
          {successMessage && (
            <div
              className="auth-success"
              role="status"
            >
              {successMessage}
            </div>
          )}

          {/* LOGIN ERROR MESSAGE */}
          {error && (
            <div
              className="auth-alert"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit}>

            {/* EMAIL FIELD */}
            <div className="auth-field">

              <label htmlFor="email">
                Email address
              </label>

              <div className="auth-input-wrapper">

                <Mail size={19} />

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />

              </div>
            </div>

            {/* PASSWORD FIELD */}
            <div className="auth-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="auth-input-wrapper">

                <LockKeyhole size={19} />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                {/* SHOW / HIDE PASSWORD */}
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>

              </div>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="auth-submit-button"
              disabled={submitting}
            >
              {submitting ? (
                "Signing in..."
              ) : (
                <>
                  Sign in
                  <ArrowRight size={19} />
                </>
              )}
            </button>

          </form>

          {/* SIGNUP NAVIGATION */}
          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/signup">
              Create an account
            </Link>
          </p>

          {/* SECURITY NOTE */}
          <p className="auth-security-note">
            Your workspace is protected with secure authentication.
          </p>

        </div>
      </section>

    </div>
  );
}