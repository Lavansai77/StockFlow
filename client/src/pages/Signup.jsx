import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Package,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, user } = useAuth();

  const [formData, setFormData] = useState({
    organizationName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.organizationName.trim().length < 2) {
      setError("Organization name must have at least 2 characters.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await signup({
        organizationName: formData.organizationName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Account created successfully! Sign in to continue.",
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-brand-panel">
        <Link to="/login" className="auth-logo">
          <span className="auth-logo-icon">
            <Package size={23} strokeWidth={2.3} />
          </span>
          <span>StockFlow</span>
        </Link>

        <div className="auth-brand-content">
          <span className="auth-eyebrow">
            YOUR INVENTORY, YOUR WAY
          </span>

          <h1>
            Less tracking.
            <br />
            <span>More growing.</span>
          </h1>

          <p>
            Create your workspace in seconds and bring your
            inventory into focus. Everything you need to stay
            organized, without the complexity.
          </p>

          <div className="auth-feature-list">
            <div>
              <span className="auth-feature-dot" />
              Organize products in one place
            </div>

            <div>
              <span className="auth-feature-dot" />
              Track quantities with confidence
            </div>

            <div>
              <span className="auth-feature-dot" />
              Stay ahead of low stock
            </div>
          </div>
        </div>

        <p className="auth-brand-footer">
          A simpler way to manage what matters.
        </p>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-mobile-logo">
            <Package size={25} />
            <span>StockFlow</span>
          </div>

          <div className="auth-form-heading">
            <span className="auth-form-eyebrow">
              GET STARTED
            </span>

            <h2>Create your workspace</h2>

            <p>
              Start managing your inventory with StockFlow.
            </p>
          </div>

          {error && (
            <div className="auth-alert" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="organizationName">
                Organization name
              </label>

              <div className="auth-input-wrapper">
                <Building2 size={19} />

                <input
                  id="organizationName"
                  type="text"
                  name="organizationName"
                  placeholder="Your company name"
                  value={formData.organizationName}
                  onChange={handleChange}
                  autoComplete="organization"
                  maxLength={150}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email">Work email</label>

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

            <div className="auth-field">
              <label htmlFor="password">Password</label>

              <div className="auth-input-wrapper">
                <LockKeyhole size={19} />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  required
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
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

            <div className="auth-field">
              <label htmlFor="confirmPassword">
                Confirm password
              </label>

              <div className="auth-input-wrapper">
                <LockKeyhole size={19} />

                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword ? "text" : "password"
                  }
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-button"
              disabled={submitting}
            >
              {submitting ? (
                "Creating workspace..."
              ) : (
                <>
                  Create account
                  <ArrowRight size={19} />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>

          <p className="auth-security-note">
            Your organization's inventory stays private.
          </p>
        </div>
      </section>
    </div>
  );
}