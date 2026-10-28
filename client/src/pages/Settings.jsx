import { useEffect, useState } from "react";

import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Mail,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
} from "lucide-react";

import {
  getSettings,
  updateSettings,
} from "../api/settings";

import "../styles/Settings.css";

export default function Settings() {
  const [organization, setOrganization] = useState(null);
  const [user, setUser] = useState(null);

  const [threshold, setThreshold] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getSettings();

      setOrganization(response.organization);
      setUser(response.user);

      setThreshold(
        String(response.organization.defaultLowStockThreshold)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load organization settings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const parsedThreshold = Number(threshold);

    if (
      threshold.trim() === "" ||
      !Number.isInteger(parsedThreshold) ||
      parsedThreshold < 0 ||
      parsedThreshold > 1000000
    ) {
      setError(
        "Enter a valid whole number between 0 and 1,000,000."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await updateSettings({
        defaultLowStockThreshold: parsedThreshold,
      });

      setOrganization(response.organization);

      setThreshold(
        String(response.organization.defaultLowStockThreshold)
      );

      setSuccess("Organization settings saved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-placeholder">
        <h2>Loading organization settings...</h2>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="dashboard-placeholder">
        <h2>Unable to load settings</h2>
        <p>{error || "Please try again."}</p>

        <button
          type="button"
          className="product-primary-button"
          onClick={loadSettings}
        >
          Try Again
        </button>
      </div>
    );
  }

  const hasChanges =
    threshold !== String(organization.defaultLowStockThreshold);

  return (
    <div className="settings-page">

      {/* PAGE HEADING */}
      <div className="settings-heading">
        <span className="dashboard-eyebrow">
          WORKSPACE CONFIGURATION
        </span>

        <h1>Organization Settings</h1>

        <p>
          Manage your workspace information and inventory preferences.
        </p>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="product-error" role="alert">
          {error}
        </div>
      )}

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="settings-success" role="status">
          <CheckCircle2 size={19} />
          {success}
        </div>
      )}

      {/* ORGANIZATION DETAILS */}
      <section className="settings-card">

        <div className="settings-card-header">
          <div className="settings-card-icon">
            <Building2 size={22} />
          </div>

          <div>
            <h2>Workspace Information</h2>
            <p>Your organization's account details</p>
          </div>
        </div>

        <div className="settings-info-grid">

          <div className="settings-info-item">
            <span>Organization Name</span>

            <strong>
              <Building2 size={17} />
              {organization.name}
            </strong>
          </div>

          <div className="settings-info-item">
            <span>Account Email</span>

            <strong>
              <Mail size={17} />
              {user?.email || "Not available"}
            </strong>
          </div>

          <div className="settings-info-item">
            <span>Account Role</span>

            <strong>
              <ShieldCheck size={17} />
              Workspace Owner
            </strong>
          </div>

          <div className="settings-info-item">
            <span>Workspace Created</span>

            <strong>
              {organization.createdAt
                ? new Date(
                    organization.createdAt
                  ).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "Not available"}
            </strong>
          </div>

        </div>
      </section>

      {/* INVENTORY PREFERENCES */}
      <section className="settings-card">

        <div className="settings-card-header">
          <div className="settings-card-icon">
            <SettingsIcon size={22} />
          </div>

          <div>
            <h2>Inventory Preferences</h2>
            <p>
              Configure how StockFlow monitors inventory levels
            </p>
          </div>
        </div>

        <form onSubmit={handleSave}>

          <div className="settings-form-content">

            <label
              htmlFor="default-threshold"
              className="settings-field-label"
            >
              Default Low-Stock Threshold
            </label>

            <p className="settings-field-description">
              Products with quantities at or below this value
              will be flagged as low stock unless they have
              their own custom threshold.
            </p>

            <div className="settings-threshold-input">
              <input
                id="default-threshold"
                type="number"
                min="0"
                max="1000000"
                step="1"
                value={threshold}
                onChange={(event) => {
                  setThreshold(event.target.value);
                  setError("");
                  setSuccess("");
                }}
                required
              />

              <span>units</span>
            </div>

            <div className="settings-info-banner">
              <AlertTriangle size={19} />

              <p>
                A threshold of <strong>{threshold || "0"}</strong>{" "}
                means products with that many units or fewer
                will appear in your low-stock alerts.
                Products with zero units are considered out of stock.
              </p>
            </div>

          </div>

          <div className="settings-card-footer">
            <button
              type="submit"
              className="product-primary-button"
              disabled={saving || !hasChanges}
            >
              <Save size={17} />

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </form>
      </section>

    </div>
  );
}