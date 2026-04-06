import React, { useState, useEffect, useRef } from "react";
import {
  FaBell,
  FaCheckCircle,
  FaRocket,
  FaClock,
  FaUndo,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AxiosInstance from "../../AxiosInstance";
import { formatDistanceToNow } from "date-fns";

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

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
        const res = await AxiosInstance.get("/notifications");
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n: Notification) => n.read_at === null).length);
    } catch (e) {
        console.error("Failed to fetch notifications", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); 
    return () => clearInterval(interval);
  }, []);

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await AxiosInstance.post(`/notifications/read/${id}`);
      fetchNotifications();
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await AxiosInstance.post(`/notifications/read-all`);
      fetchNotifications();
    } catch (e) {
      console.error("Failed to mark all as read", e);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    setIsOpen(false);
    navigate(`/publications/${notification.data.publication_id}`);
  };

  const getIcon = (action: string) => {
    switch (action) {
      case "submitted":
        return <FaClock className="text-blue-500" />;
      case "approved":
      case "reviewed":
        return <FaCheckCircle className="text-green-500" />;
      case "published":
        return <FaRocket className="text-purple-500" />;
      case "returned":
        return <FaUndo className="text-red-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center h-10 w-10 focus:outline-none"
      >
        <FaBell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-green-800">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-100 divide-y divide-gray-100 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 bg-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-green-600 hover:text-green-800 font-semibold transition-colors flex-shrink-0 ml-4"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 flex flex-col items-center">
                <FaBell className="text-gray-300 text-3xl mb-2" />
                <p className="text-sm">You have no notifications.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3 ${!notification.read_at ? "bg-green-50/50" : ""}`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.data.action)}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm text-gray-800 leading-snug break-words">
                        {notification.data.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1.5 flex items-center justify-between">
                        <span>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
                        {!notification.read_at && (
                          <span className="w-2 h-2 bg-red-500 rounded-full inline-block ml-2"></span>
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
