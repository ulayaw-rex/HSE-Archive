import React from "react";
import type { ActivityItem } from "./RecentActivity";
export interface WeeklyData {
  name: string;
  views: number;
}
export interface CategoryData {
  name: string;
  articles: number;
}
export interface MostViewedData {
  name: string;
  value: number;
}
export interface DashboardStats {
  totalArticles: number;
  mostPopularArticle?: {
    title: string;
    views: number;
    date: string;
  } | null;
  activityUploads: ActivityItem[];
  activityComments: ActivityItem[];
  activityUsers: ActivityItem[];
  weeklyEngagement: WeeklyData[];
  articlesByCategory: CategoryData[];
  mostViewed: MostViewedData[];
}

interface DashboardStatsCardsProps {
  stats: DashboardStats;
}

const DashboardStatsCards: React.FC<DashboardStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center hover:shadow-md transition-shadow duration-200">
        <div className="p-4 rounded-full bg-blue-50 text-blue-600 mr-4">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Total Articles
          </p>
          <h3 className="text-3xl font-extrabold text-gray-900 mt-1">
            {stats.totalArticles}
          </h3>
          <p className="text-xs text-blue-600 font-medium mt-1">
            Published Content
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center hover:shadow-md transition-shadow duration-200">
        <div className="p-4 rounded-full bg-green-50 text-green-600 mr-4">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Most Popular (All Time)
          </p>

          {stats.mostPopularArticle ? (
            <>
              <h3
                className="text-lg font-bold text-gray-900 mt-1 truncate"
                title={stats.mostPopularArticle.title}
              >
                {stats.mostPopularArticle.title}
              </h3>
              <div className="flex items-center mt-1 space-x-3">
                <span className="text-2xl font-extrabold text-green-600">
                  {stats.mostPopularArticle.views.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400">
                  views since {stats.mostPopularArticle.date}
                </span>
              </div>
            </>
          ) : (
            <p className="text-gray-400 italic mt-2">No data available yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardStatsCards;
