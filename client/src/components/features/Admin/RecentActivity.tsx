import React, { useState } from "react";
import {
  FaNewspaper,
  FaBookOpen,
  FaComments,
  FaUserPlus,
  FaClock,
} from "react-icons/fa";

// --- Types ---
export interface ActivityItem {
  id: string;
  type: "article" | "printmedia" | "comment" | "user";
  message: string;
  subtext?: string; // For comment body or user name
  time: string;
}

interface RecentActivityProps {
  uploads?: ActivityItem[];
  comments?: ActivityItem[];
  users?: ActivityItem[];
}

type TabType = "uploads" | "comments" | "users";

export const RecentActivity: React.FC<RecentActivityProps> = ({
  uploads = [],
  comments = [],
  users = [],
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("uploads");

  // Helper: Get the correct list based on the active tab
  const getCurrentList = () => {
    switch (activeTab) {
      case "uploads":
        return uploads;
      case "comments":
        return comments;
      case "users":
        return users;
      default:
        return [];
    }
  };

  // Helper: Get Icon and Color based on activity type
  const getIconConfig = (type: string) => {
    switch (type) {
      case "article":
        return { icon: <FaNewspaper />, color: "bg-blue-100 text-blue-600" };
      case "printmedia":
        return { icon: <FaBookOpen />, color: "bg-indigo-100 text-indigo-600" };
      case "comment":
        return { icon: <FaComments />, color: "bg-green-100 text-green-600" };
      case "user":
        return { icon: <FaUserPlus />, color: "bg-orange-100 text-orange-600" };
      default:
        return { icon: <FaClock />, color: "bg-gray-100 text-gray-500" };
    }
  };

  const currentList = getCurrentList();

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col min-h-[400px]">
      {/* --- HEADER & TABS --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>

        {/* Tab Buttons */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("uploads")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "uploads"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Uploads
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "comments"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Comments
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "users"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Users
          </button>
        </div>
      </div>

      {/* --- CONTENT LIST --- */}
      <div
        className="flex-1 overflow-y-auto pr-2 custom-scrollbar"
        style={{ maxHeight: "350px" }}
      >
        {currentList.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10">
            <span className="text-3xl mb-2 opacity-20">📭</span>
            <p className="text-sm">No recent {activeTab} found.</p>
          </div>
        ) : (
          <ul className="space-y-6">
            {currentList.map((item) => {
              const { icon, color } = getIconConfig(item.type);

              return (
                <li key={item.id} className="relative flex gap-4 group">
                  {/* Icon Bubble */}
                  <div
                    className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${color} ring-4 ring-white`}
                  >
                    {icon}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.message}
                    </p>
                    {item.subtext && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {item.subtext}
                      </p>
                    )}
                  </div>

                  {/* Time */}
                  <div className="text-xs text-gray-400 whitespace-nowrap pt-1.5">
                    {item.time}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
