import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  PackageSearch,
  Settings,
  LogOut,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.replace("/login");
    } catch (error) {
      alert("Unable to log out. Please try again.");
    }
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      path: "/products",
      icon: PackageSearch,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo-icon">
              <Package size={22} />
            </div>

            <span>StockFlow</span>
          </div>

          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={21} />
          </button>
        </div>

        <div className="sidebar-workspace">
          <span className="workspace-label">WORKSPACE</span>

          <div className="workspace-name">
            {user?.organization?.name || user?.organization || "My Organization"}
          </div>
        </div>

        <nav className="sidebar-navigation">
          <span className="sidebar-section-title">
            GENERAL
          </span>

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
                }
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="sidebar-user-info">
              <strong>Workspace Owner</strong>
              <span>{user?.email}</span>
            </div>
          </div>

          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}