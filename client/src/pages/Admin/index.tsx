import React, { useEffect, useState } from "react";
import DashboardStatsCards, {
  type DashboardStats,
} from "../../components/features/Admin/DashboardStats";
import AxiosInstance from "../../AxiosInstance";
import { DashboardCharts } from "../../components/features/Admin/DashboardCharts";
import { MostViewedChart } from "../../components/features/Admin/MostViewedCharts";
import { RecentActivity } from "../../components/features/Admin/RecentActivity";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PendingReviewsWidget from "../../components/features/Admin/PendingReviewsWidget";
import type { Publication } from "../../types/Publication";
import PendingUsersWidget from "../../components/features/Admin/PendingUsersWidget";

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await AxiosInstance.get("publications/dashboard/stats");
  return response.data;
};

const fetchPublicationsList = async (): Promise<Publication[]> => {
  const response = await AxiosInstance.get("/admin/all-publications");
  return response.data;
};

const AdminPage: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPublications = async () => {
    try {
      const pubs = await fetchPublicationsList();
      setPublications(pubs);
    } catch (err) {
      console.error("Failed to load publications for review widget", err);
    }
  };

  const loadAllData = async () => {
    try {
      if (!dashboardStats) setLoading(true);
      setError(null);

      const [statsData, pubsData] = await Promise.all([
        fetchDashboardStats(),
        fetchPublicationsList(),
      ]);

      setDashboardStats(statsData);
      setPublications(pubsData);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 30000);
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
            <div className="mb-8">
              <PendingUsersWidget />
            </div>

            <div className="mb-8">
              <PendingReviewsWidget
                publications={publications}
                onReviewComplete={loadPublications}
              />
            </div>

            <div className="mb-8">
              <DashboardStatsCards stats={dashboardStats} />
            </div>

            <div className="space-y-6">
              <DashboardCharts
                weeklyData={dashboardStats.weeklyEngagement}
                categoryData={dashboardStats.articlesByCategory}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MostViewedChart data={dashboardStats.mostViewed} />

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
