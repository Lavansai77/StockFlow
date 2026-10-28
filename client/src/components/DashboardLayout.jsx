import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Bell, Menu } from "lucide-react";

import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

import "../styles/Dashboard.css";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user } = useAuth();
  const location = useLocation();

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/products": "Products",
    "/settings": "Settings",
  };

  const pageTitle = pageTitles[location.pathname] || "StockFlow";

  return (
    <div className="dashboard-shell">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-left">
            <button
              className="mobile-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={23} />
            </button>

            <div>
              <h2>{pageTitle}</h2>
              <p>Manage your inventory workspace</p>
            </div>
          </div>

          <div className="dashboard-topbar-right">
            <div className="dashboard-organization">
              {user?.organization?.name ||
                user?.organization ||
                "My Organization"}
            </div>

            <div className="dashboard-topbar-avatar">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}