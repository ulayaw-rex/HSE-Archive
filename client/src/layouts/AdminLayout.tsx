import React, { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import AxiosInstance from "../AxiosInstance";
import "./AdminLayout.css";
import type { SidebarItemType } from "../pages/Admin/SidebarItems";

export type AdminOutletContext = {
  refreshUnreadCount: () => Promise<void>;
  decrementUnreadCount: () => void;
};

const SidebarItem: React.FC<{ item: SidebarItemType; badgeCount?: number }> = ({
  item,
  badgeCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const isActive = item.to
    ? window.location.pathname.startsWith(item.to)
    : false;

  const Badge = () =>
    badgeCount && badgeCount > 0 ? (
      <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
        {badgeCount > 99 ? "99+" : badgeCount}
      </span>
    ) : null;

  if (hasChildren) {
    return (
      <div>
        <div className="sidebar">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`parent-button ${isActive || isOpen ? "active" : ""}`}
          >
            <span className="opacity-90">{item.icon}</span>
            <span className="text-sm font-medium flex-1 text-left">
              {item.label}
            </span>
            {!isOpen && <Badge />}
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              } ${!isOpen && badgeCount ? "ml-2" : "ml-auto"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="ml-4 mt-1 space-y-1 border-l border-green-600/40 pl-2">
            {item.children?.map((child, index) => (
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
      <Badge />
    </NavLink>
  );
};

const AdminLayout: React.FC<{ sidebarItems: SidebarItemType[] }> = ({
  sidebarItems,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await AxiosInstance.get("/admin/inquiries/unread-count");
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Failed to fetch notification count");
    }
  };

  const decrementUnreadCount = () => {
    setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await AxiosInstance.post("/logout", {}, { withCredentials: true });
    } catch {}
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="h-screen flex bg-green-50 text-gray-900 overflow-hidden">
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-green-700 text-white border-r border-green-700 shadow-sm transition-transform duration-200 ease-out flex flex-col md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-4 py-4 border-b border-green-600 flex items-center justify-between flex-shrink-0">
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

        <nav className="p-2 flex-1 overflow-y-auto">
          {sidebarItems.map((item, index) => (
            <SidebarItem
              key={index}
              item={item}
              badgeCount={item.badgeId === "feedback" ? unreadCount : undefined}
            />
          ))}
        </nav>

        <div className="p-2 border-t border-green-600/50 flex-shrink-0 space-y-1">
          <a
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-green-600/60 text-white"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 opacity-90"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-sm font-medium">View Homepage</span>
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-red-600/80 text-white"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 opacity-90"
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
      </div>

      <div className="flex-1 flex flex-col min-w-0 md:ml-0 overflow-hidden">
        <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur flex-shrink-0">
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

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="mx-auto max-w-6xl">
            <Outlet
              context={
                {
                  refreshUnreadCount: fetchUnreadCount,
                  decrementUnreadCount,
                } satisfies AdminOutletContext
              }
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
