import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import AxiosInstance from "../AxiosInstance";
import "./AdminLayout.css";
import type { SidebarItemType } from "../pages/Admin/SidebarItems"; // ✅ shared type

// Sidebar item component
const SidebarItem: React.FC<{ item: SidebarItemType }> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.to ? window.location.pathname === item.to : false;

  if (hasChildren) {
    return (
      <div>
        {/* Parent menu button */}
        <div className="sidebar">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`parent-button ${isActive ? "active" : ""}`}
          >
            <span className="opacity-90">{item.icon}</span>
            <span className="text-sm font-medium flex-1">{item.label}</span>
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Dropdown children */}
        {isOpen && (
          <div className="ml-4 mt-1 space-y-1 border-l border-green-600/40 pl-2">
            {item.children!.map((child, index) => (
              <NavLink
                key={index}
                to={child.to || "#"}
                end={child.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md mb-1 transition-colors 
                  ${
                    isActive
                      ? "bg-green-600 text-white shadow-sm"
                      : "hover:bg-green-600/60 text-white"
                  }`
                }
              >
                <span className="opacity-90">{child.icon}</span>
                <span className="text-sm font-medium">{child.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Single item (no children)
  return (
    <NavLink
      to={item.to || "#"}
      end={item.end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md mb-1 transition-colors ${
          isActive
            ? "bg-green-600 text-white"
            : "hover:bg-green-600/60 text-white"
        }`
      }
    >
      <span className="opacity-90">{item.icon}</span>
      <span className="text-sm font-medium">{item.label}</span>
    </NavLink>
  );
};

// Admin layout wrapper
const AdminLayout: React.FC<{ sidebarItems: SidebarItemType[] }> = ({
  sidebarItems,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleLogout = async () => {
    try {
      await AxiosInstance.post("/logout", {}, { withCredentials: true });
    } catch {}
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex bg-green-50 text-gray-900">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-green-700 text-white border-r border-green-700 shadow-sm transition-transform duration-200 ease-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="px-4 py-4 border-b border-green-600 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">HSE Admin</div>
            <div className="text-xs opacity-80">Content Management</div>
          </div>
          <button
            className="md:hidden p-2 rounded hover:bg-green-600/50"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu items */}
        <nav className="p-2 overflow-y-auto h-[calc(100vh-80px)]">
          {sidebarItems.map((item, index) => (
            <SidebarItem key={index} item={item} />
          ))}

          {/* Sidebar footer actions */}
          <div className="mt-4 pt-4 border-t border-green-600/50">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-md mb-1 transition-colors hover:bg-green-600/60 text-white"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M15 12H3" />
                <path d="M12 15l-3-3 3-3" />
                <path d="M21 4v16a2 2 0 01-2 2H9" />
              </svg>
              <span className="text-sm font-medium">Logout</span>
            </a>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-0">
        <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
          <div className="px-4 md:px-6 h-14 flex items-center justify-between">
            <button
              className="md:hidden p-2 rounded hover:bg-green-50"
              aria-label="Open sidebar"
              onClick={() => setSidebarOpen(true)}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="text-sm text-green-700">Admin Panel</div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
