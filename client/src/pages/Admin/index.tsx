import React, { useEffect, useState } from "react";
import DashboardStatsCards, {
  type DashboardStats,
} from "../../components/features/Admin/DashboardStats";
import AxiosInstance from "../../AxiosInstance";
import { DashboardCharts } from "../../components/features/Admin/DashboardCharts";
import { MostViewedChart } from "../../components/features/Admin/MostViewedCharts";
import { RecentActivity } from "../../components/features/Admin/RecentActivity";
import LoadingSpinner from "../../components/common/LoadingSpinner"; // Import your nice spinner

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await AxiosInstance.get("publications/dashboard/stats");
  return response.data;
};

const AdminPage: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardStats = async () => {
    try {
      // Note: We don't set loading(true) here on refresh intervals,
      // only on the very first load. This prevents the UI from flickering every 30s.
      if (!dashboardStats) setLoading(true);

      setError(null);
      const statsData = await fetchDashboardStats();
      setDashboardStats(statsData);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to fetch dashboard stats.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
    const interval = setInterval(loadDashboardStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin-container bg-gray-50 min-h-screen">
      <div className="admin-content p-6">
        <div className="admin-header mb-6">
          <h1 className="admin-title text-2xl font-bold text-gray-800">
            Admin Dashboard
          </h1>
        </div>

        {/* --- 1. SINGLE LOADING STATE --- */}
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <LoadingSpinner />
              <p className="text-green-800 mt-4 font-medium">
                Loading analytics...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
            Error: {error}
          </div>
        ) : dashboardStats ? (
          <>
            {/* 1. STATS CARDS */}
            <div className="mb-8">
              <DashboardStatsCards stats={dashboardStats} />
            </div>

            <div className="space-y-6">
              {/* 2. BIG CHARTS (Pass data via props) */}
              <DashboardCharts
                weeklyData={dashboardStats.weeklyEngagement}
                categoryData={dashboardStats.articlesByCategory}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 3. DONUT CHART (Pass data via props) */}
                <MostViewedChart data={dashboardStats.mostViewed} />

                {/* 4. ACTIVITY FEED (Pass data via props) */}
                <RecentActivity
                  uploads={dashboardStats.activityUploads}
                  comments={dashboardStats.activityComments}
                  users={dashboardStats.activityUsers}
                />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AdminPage;
