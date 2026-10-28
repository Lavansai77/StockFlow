import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Package,
  Plus,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getDashboardStats } from "../api/dashboard";

export default function Dashboard() {
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getDashboardStats();

      setData(response);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load inventory statistics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = data?.stats || {
    totalProducts: 0,
    totalStockUnits: 0,
    lowStockItems: 0,
  };

  const organizationName =
    data?.organization?.name ||
    user?.organization?.name ||
    user?.organization ||
    "your organization";

  const recentProducts = data?.recentProducts || [];

  const getStockStatus = (product) => {
    if (product.quantityOnHand === 0) {
      return {
        label: "Out of Stock",
        className: "stock-out",
      };
    }

    const threshold =
      product.lowStockThreshold ??
      data?.organization?.defaultLowStockThreshold ??
      5;

    if (product.quantityOnHand <= threshold) {
      return {
        label: "Low Stock",
        className: "stock-low",
      };
    }

    return {
      label: "In Stock",
      className: "stock-in",
    };
  };

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      className: "stat-blue",
      description: "Products in your inventory",
    },
    {
      title: "Total Stock Units",
      value: stats.totalStockUnits,
      icon: Boxes,
      className: "stat-green",
      description: "Units currently available",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockItems,
      icon: AlertTriangle,
      className: "stat-orange",
      description: "Products needing attention",
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-placeholder">
        <h2>Loading your inventory dashboard...</h2>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="dashboard-placeholder">
        <h2>Unable to load dashboard</h2>
        <p>{error}</p>

        <button
          className="dashboard-primary-button"
          onClick={() => loadDashboard()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <div>
          <span className="dashboard-eyebrow">
            INVENTORY OVERVIEW
          </span>

          <h1>Welcome back!</h1>

          <p>
            Here's what's happening with{" "}
            <strong>{organizationName}</strong>.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <button
            type="button"
            className="dashboard-refresh-button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
          >
            <RefreshCw size={17} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <Link
            to="/products"
            className="dashboard-primary-button"
          >
            <Plus size={18} />
            Add Product
          </Link>
        </div>
      </div>

      {error && (
        <div className="product-error" role="alert">
          {error}
        </div>
      )}

      <div className="dashboard-stats">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              className="dashboard-stat-card"
              key={card.title}
            >
              <div className="stat-card-top">
                <span>{card.title}</span>

                <div
                  className={`stat-icon ${card.className}`}
                >
                  <Icon size={21} />
                </div>
              </div>

              <h2>{card.value.toLocaleString("en-IN")}</h2>

              <p>{card.description}</p>
            </div>
          );
        })}
      </div>

      <section className="dashboard-inventory-section">
        <div className="dashboard-section-header">
          <div>
            <h2>Recent Products</h2>
            <p>Your latest inventory additions</p>
          </div>

          <Link
            to="/products"
            className="dashboard-text-link"
          >
            View all products
            <ArrowRight size={17} />
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="dashboard-empty-state">
            <div className="dashboard-empty-icon">
              <Package size={34} />
            </div>

            <h3>Your inventory starts here</h3>

            <p>
              You haven't added any products yet.
              Add your first product to start tracking inventory.
            </p>

            <Link
              to="/products"
              className="dashboard-primary-button"
            >
              <Plus size={18} />
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="dashboard-recent-table-wrapper">
            <table className="dashboard-recent-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>SKU</th>
                  <th>QUANTITY</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {recentProducts.map((product) => {
                  const status = getStockStatus(product);

                  return (
                    <tr key={product.id}>
                      <td>
                        <strong>{product.name}</strong>
                      </td>

                      <td>{product.sku}</td>

                      <td>{product.quantityOnHand}</td>

                      <td>
                        <span
                          className={`stock-badge ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {data?.lowStockProducts?.length > 0 && (
        <section className="dashboard-low-stock-section">
          <div className="dashboard-section-header">
            <div>
              <h2>
                <AlertTriangle size={19} />
                Low Stock Alerts
              </h2>

              <p>
                Products that need your attention
              </p>
            </div>
          </div>

          <div className="dashboard-low-stock-list">
            {data.lowStockProducts.slice(0, 5).map((product) => (
              <div
                className="dashboard-low-stock-item"
                key={product.id}
              >
                <div>
                  <strong>{product.name}</strong>
                  <span>SKU: {product.sku}</span>
                </div>

                <span className="dashboard-low-stock-quantity">
                  {product.quantityOnHand} remaining
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}