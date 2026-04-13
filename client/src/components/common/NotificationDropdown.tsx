import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AxiosInstance from "../../AxiosInstance";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";

export interface Notification {
  id: string;
  data: {
    publication_id: number;
    title: string;
    action: string;
    message: string;
  };
  read_at: string | null;
  created_at: string;
}

/* ─── Action Meta ─────────────────────────────────────────── */
const ACTION_META: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string }
> = {
  submitted: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
      </svg>
    ),
    color: "text-sky-500",
    bg: "bg-sky-100 dark:bg-sky-900/40",
  },
  approved: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
      </svg>
    ),
    color: "text-emerald-500",
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  reviewed: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z" clipRule="evenodd" />
      </svg>
    ),
    color: "text-violet-500",
    bg: "bg-violet-100 dark:bg-violet-900/40",
  },
  published: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
      </svg>
    ),
    color: "text-purple-500",
    bg: "bg-purple-100 dark:bg-purple-900/40",
  },
  returned: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.06.025z" clipRule="evenodd" />
      </svg>
    ),
    color: "text-rose-500",
    bg: "bg-rose-100 dark:bg-rose-900/40",
  },
};

const DEFAULT_META = {
  icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M4 8a6 6 0 1112 0v2.697l1.748 3.058A.75.75 0 0117.25 15h-4.5a2.75 2.75 0 01-5.5 0h-4.5a.75.75 0 01-.648-1.245L4 10.697V8zm6 8.5A1.25 1.25 0 018.75 15h2.5A1.25 1.25 0 0110 16.5z" clipRule="evenodd" />
    </svg>
  ),
  color: "text-gray-400",
  bg: "bg-gray-100 dark:bg-gray-800",
};

/* ─── Bell Icon (animated) ────────────────────────────────── */
const AnimatedBell: React.FC<{ ringing: boolean }> = ({ ringing }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
    style={{
      transformOrigin: "top center",
      animation: ringing ? "bell-ring 0.6s ease-in-out" : "none",
    }}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z"
      clipRule="evenodd"
    />
  </svg>
);

/* ─── Main Component ─────────────────────────────────────── */
interface NotificationDropdownProps {
  /** "dark-bg" = sits on green/dark navbar (default). "light-bg" = sits on white admin header. */
  variant?: "dark-bg" | "light-bg";
}

const NotificationDropdown = ({ variant = "dark-bg" }: NotificationDropdownProps) => {
  const isOnLight = variant === "light-bg";
  const [isOpen, setIsOpen] = useState(false);
  const [ringing, setRinging] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const prevUnreadRef = useRef(0);

  const { data: notificationsData, refetch: fetchNotifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await AxiosInstance.get("/notifications");
      return res.data;
    },
    refetchInterval: 15000,
    staleTime: 5000,
  });

  const notifications: Notification[] = notificationsData || [];
  const unreadCount = notifications.filter((n) => n.read_at === null).length;

  /* Ring bell when new notifications arrive */
  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      setRinging(true);
      const t = setTimeout(() => setRinging(false), 700);
      return () => clearTimeout(t);
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await AxiosInstance.post(`/notifications/read/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await AxiosInstance.post(`/notifications/read-all`);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    setIsOpen(false);
    
    if (notification.data.action === "published") {
      navigate(`/news/${notification.data.publication_id}`);
    } else {
      navigate(`/profile/${user?.id}`);
    }
  };

  const getActionMeta = (action: string) =>
    ACTION_META[action] ?? DEFAULT_META;

  return (
    <>
      {/* Bell-ring keyframes injected once */}
      <style>{`
        @keyframes bell-ring {
          0%   { transform: rotate(0deg); }
          15%  { transform: rotate(15deg); }
          30%  { transform: rotate(-14deg); }
          45%  { transform: rotate(12deg); }
          60%  { transform: rotate(-10deg); }
          75%  { transform: rotate(6deg); }
          90%  { transform: rotate(-4deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes notif-in {
          from { opacity: 0; transform: scale(0.95) translateY(-6px); }
          to   { opacity: 1; transform: scale(1)   translateY(0); }
        }
        @keyframes badge-pop {
          0%   { transform: scale(0.6); }
          70%  { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .notif-panel   { animation: notif-in 0.2s cubic-bezier(.16,1,.3,1) forwards; }
        .badge-animate { animation: badge-pop 0.35s cubic-bezier(.16,1,.3,1); }
      `}</style>

      <div className="relative" ref={dropdownRef}>
        {/* ─── Trigger Button ─── */}
        <button
          onClick={() => setIsOpen((v) => !v)}
          aria-label="Open notifications"
          aria-expanded={isOpen}
          className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 focus:outline-none group"
          style={{
            color: isOnLight ? (isOpen ? "#15803d" : "#16a34a") : "rgba(255,255,255,0.9)",
            background: isOpen
              ? isOnLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.15)"
              : "transparent",
          }}
        >
          {/* Hover bg */}
          <span
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: isOnLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.12)" }}
            aria-hidden="true"
          />

          {/* Pulse ring when unread */}
          {unreadCount > 0 && (
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-25"
              style={{ background: "rgba(239,68,68,0.5)", animationDuration: "2.5s" }}
              aria-hidden="true"
            />
          )}

          <AnimatedBell ringing={ringing} />

          {/* Badge */}
          {unreadCount > 0 && (
            <span
              key={unreadCount}
              className="badge-animate absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full px-1 leading-none select-none"
              style={{
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                boxShadow: isOnLight
                  ? "0 0 0 2px #f0fdf4, 0 2px 6px rgba(239,68,68,0.4)"
                  : "0 0 0 2px #166534, 0 2px 6px rgba(239,68,68,0.5)",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* ─── Dropdown Panel ─── */}
        {isOpen && (
          <div
            className="notif-panel absolute right-0 mt-2.5 w-[340px] rounded-2xl z-50 overflow-hidden"
            style={{
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.06)",
            }}
          >
            {/* Glass header */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{
                background:
                  "linear-gradient(135deg, rgba(22,101,52,0.95) 0%, rgba(15,83,43,0.95) 100%)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="flex items-center justify-center w-7 h-7 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-4 h-4" aria-hidden="true">
                    <path fillRule="evenodd" d="M4 8a6 6 0 1112 0v2.697l1.748 3.058A.75.75 0 0117.25 15h-4.5a2.75 2.75 0 01-5.5 0h-4.5a.75.75 0 01-.648-1.245L4 10.697V8zm6 8.5A1.25 1.25 0 018.75 15h2.5A1.25 1.25 0 0110 16.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">Notifications</h3>
                  {unreadCount > 0 && (
                    <p className="text-[10px] text-green-200/80 leading-tight">
                      {unreadCount} unread
                    </p>
                  )}
                </div>
              </div>

              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all duration-150 flex-shrink-0 ${
                    unreadCount > 0
                      ? "text-green-200 hover:text-white hover:bg-white/10"
                      : "text-green-200/50 cursor-not-allowed"
                  }`}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div
              className="max-h-[60vh] overflow-y-auto"
              style={{ background: "var(--notif-bg, white)" }}
            >
              <style>{`
                :root { --notif-bg: #ffffff; }
                .dark { --notif-bg: #111827; }
                .notif-scroll::-webkit-scrollbar { width: 4px; }
                .notif-scroll::-webkit-scrollbar-track { background: transparent; }
                .notif-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }
              `}</style>

              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 bg-white dark:bg-gray-900">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                    style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" aria-hidden="true">
                      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    All caught up!
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                    You have no notifications right now.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100/80 dark:divide-gray-800/60 bg-white dark:bg-gray-900">
                  {notifications.map((n) => {
                    const meta = getActionMeta(n.data.action);
                    return (
                      <li
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`group relative flex gap-3 px-4 py-3.5 cursor-pointer transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800/60 ${
                          !n.read_at ? "bg-green-50/60 dark:bg-green-900/10" : ""
                        }`}
                      >
                        {/* Unread left accent */}
                        {!n.read_at && (
                          <span
                            className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
                            style={{
                              background: "linear-gradient(180deg, #16a34a 0%, #4ade80 100%)",
                            }}
                            aria-hidden="true"
                          />
                        )}

                        {/* Icon */}
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 ${meta.bg} ${meta.color}`}
                        >
                          {meta.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-grow min-w-0">
                          <p className="text-[13px] leading-snug text-gray-800 dark:text-gray-100 break-words">
                            {n.data.message}
                          </p>
                          <div className="flex items-center justify-between mt-1.5 gap-2">
                            <span className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3" aria-hidden="true">
                                <path fillRule="evenodd" d="M1 8a7 7 0 1114 0A7 7 0 011 8zm7.75-4.25a.75.75 0 00-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 000-1.5h-2.5v-3.5z" clipRule="evenodd" />
                              </svg>
                              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                            </span>
                            {!n.read_at && (
                              <button
                                onClick={(e) => handleMarkAsRead(n.id, e)}
                                className="text-[11px] text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0"
                                aria-label="Mark as read"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700/50 flex justify-center">
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  Showing {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationDropdown;
