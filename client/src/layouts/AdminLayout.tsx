import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import AxiosInstance from "../AxiosInstance";
import NotificationDropdown from "../components/common/NotificationDropdown";
import ThemeToggle from "../components/common/ThemeToggle";
import "./AdminLayout.css";
import type { SidebarItemType } from "../pages/Admin/SidebarItems";

export type AdminOutletContext = {
  refreshUnreadCount: () => Promise<void>;
  decrementUnreadCount: () => void;
};

const SidebarItem: React.FC<{ item: SidebarItemType; badgeCount?: number; onItemClick?: () => void }> = ({
  item,
  badgeCount,
  onItemClick,
}) => {
  const { pathname } = useLocation();
  const hasChildren = item.children && item.children.length > 0;

  // A parent is active if its own path matches OR if any of its children's paths match
  const checkIsActive = () => {
    if (item.to && (item.end ? pathname === item.to : pathname.startsWith(item.to))) {
      return true;
    }
    if (hasChildren) {
      return item.children?.some(child => 
        child.to && pathname.startsWith(child.to)
      );
    }
    return false;
  };

  const isActive = checkIsActive();
  const [isOpen, setIsOpen] = useState(isActive);

  // Sync isOpen with isActive only when the route changes to a child of this parent
  useEffect(() => {
    if (isActive && hasChildren) {
      setIsOpen(true);
    }
  }, [isActive, hasChildren]);

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
            className={`parent-button ${isActive ? "active" : ""}`}
            aria-expanded={isOpen}
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

        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
          <div className="ml-4 space-y-1 border-l border-white/10 dark:border-gray-700 pl-2">
            {item.children?.map((child, index) => (
              <NavLink
                key={index}
                to={child.to || "#"}
                end={child.end}
                onClick={onItemClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md mb-1 transition-all 
                  ${
                    isActive
                      ? "bg-green-600 dark:bg-green-700 text-white shadow-sm ring-1 ring-white/10"
                      : "hover:bg-white/5 text-gray-300 hover:text-white"
                  }`
                }
              >
                <span className="opacity-90">{child.icon}</span>
                <span className="text-sm font-medium">{child.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <NavLink
      to={item.to || "#"}
      end={item.end}
      onClick={onItemClick}
      className={({ isActive }) =>
        `parent-button ${isActive ? "active" : "text-gray-300 hover:text-white"}`
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
    <div className="h-screen flex bg-green-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden transition-colors duration-200">
      {/* Mobile background overlay for clicking outside */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-green-700 dark:bg-gray-800 text-white border-r border-green-700 dark:border-gray-800 shadow-sm transition-transform duration-200 ease-out flex flex-col lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-4 py-4 border-b border-green-600 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="text-lg font-semibold">HSE Admin</div>
            <div className="text-xs opacity-80">Content Management</div>
          </div>
          <button
            className="lg:hidden p-2 rounded hover:bg-green-600/50 dark:hover:bg-gray-700 transition-colors"
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
              onItemClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        <div className="p-2 border-t border-green-600/50 dark:border-gray-700 flex-shrink-0 space-y-1">
          <a
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md transition-all hover:bg-green-600/60 dark:hover:bg-gray-700 text-white"
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
            className="flex items-center gap-3 px-3 py-2 rounded-md transition-all hover:bg-red-600/80 dark:hover:bg-red-900/80 text-white"
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
        <header className="sticky top-0 z-30 border-b dark:border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur flex-shrink-0 transition-colors duration-200">
          <div className="px-4 md:px-6 h-14 flex items-center justify-between">
            <button
              className="lg:hidden p-2 rounded hover:bg-green-50 dark:hover:bg-gray-800 transition-colors"
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
            <div className="text-sm font-semibold text-green-700 dark:text-green-500 ml-auto flex items-center gap-2">
              <ThemeToggle variant="light-bg" />
              <NotificationDropdown variant="light-bg" />
              <span className="hidden sm:inline pl-1">Admin Panel</span>
            </div>
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
