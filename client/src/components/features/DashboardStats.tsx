import React from 'react';
import { type DashboardStats } from '../../utils/api';

interface DashboardStatsCardsProps {
  stats: DashboardStats;
}

const DashboardStatsCards: React.FC<DashboardStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Total Articles Card */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Articles</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalArticles}</p>
            <p className="text-sm text-gray-500">Published articles</p>
          </div>
        </div>
      </div>

      {/* Most Popular Article Card */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Most Popular</h3>
            {stats.mostPopularArticle ? (
              <>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {stats.mostPopularArticle.title}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.mostPopularArticle.views} views
                </p>
                <p className="text-xs text-gray-500">
                  {stats.mostPopularArticle.date}
                </p>
              </>
            ) : (
              <p className="text-gray-500">No articles yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStatsCards;
