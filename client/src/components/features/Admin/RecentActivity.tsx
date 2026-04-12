import React, { useState } from "react";
import {
  FaNewspaper,
  FaBookOpen,
  FaComments,
  FaUserPlus,
  FaClock,
} from "react-icons/fa";

export interface ActivityItem {
  id: string;
  type: "article" | "printmedia" | "comment" | "user";
  message: string;
  subtext?: string;
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

  const getIconConfig = (type: string) => {
    switch (type) {
      case "article":
        return {
          icon: <FaNewspaper />,
          color:
            "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
        };
      case "printmedia":
        return {
          icon: <FaBookOpen />,
          color:
            "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
        };
      case "comment":
        return {
          icon: <FaComments />,
          color:
            "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
        };
      case "user":
        return {
          icon: <FaUserPlus />,
          color:
            "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
        };
      default:
        return {
          icon: <FaClock />,
          color:
            "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400",
        };
    }
  };

  const currentList = getCurrentList();

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 h-full flex flex-col min-h-[400px] transition-colors duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
          Recent Activity
        </h3>

        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("uploads")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "uploads"
                ? "bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            Uploads
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "comments"
                ? "bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            Comments
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "users"
                ? "bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            Users
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto pr-2 custom-scrollbar"
        style={{ maxHeight: "350px" }}
      >
        {currentList.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 py-10">
            <span className="text-3xl mb-2 opacity-20">📭</span>
            <p className="text-sm">No recent {activeTab} found.</p>
          </div>
        ) : (
          <ul className="space-y-6">
            {currentList.map((item) => {
              const { icon, color } = getIconConfig(item.type);

              return (
                <li key={item.id} className="relative flex gap-4 group">
                  <div
                    className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${color} ring-4 ring-white dark:ring-gray-900`}
                  >
                    {icon}
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                      {item.message}
                    </p>
                    {item.subtext && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {item.subtext}
                      </p>
                    )}
                  </div>

                  <div className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap pt-1.5">
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
