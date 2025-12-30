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
import CreditRequestsWidget from "../../components/features/Admin/CreditRequestsWidget";

interface PendingUser {
  id: number;
  name: string;
  email: string;
  role: string;
  course: string;
  position: string;
  created_at: string;
}

interface CreditRequest {
  id: number;
  user: { id: number; name: string; email: string };
  requestable_type: string;
  requestable: { id: number; title: string } | null;
  created_at: string;
}

const AdminPage: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [publications, setPublications] = useState<Publication[]>([]);
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublications = async () => {
    const res = await AxiosInstance.get("/admin/all-publications");
    setPublications(res.data);
  };

  const fetchUsers = async () => {
    const res = await AxiosInstance.get("/users");
    const pending = res.data.filter((u: any) => u.status === "pending");
    setUsers(pending);
  };

  const fetchCreditRequests = async () => {
    const res = await AxiosInstance.get("/admin/credit-requests");
    setCreditRequests(res.data);
  };

  const loadAllData = async () => {
    try {
      if (!dashboardStats) setLoading(true);
      setError(null);

      const [statsRes, pubsRes, usersRes, creditsRes] = await Promise.all([
        AxiosInstance.get("publications/dashboard/stats"),
        AxiosInstance.get("/admin/all-publications"),
        AxiosInstance.get("/users"),
        AxiosInstance.get("/admin/credit-requests"),
      ]);

      setDashboardStats(statsRes.data);
      setPublications(pubsRes.data);

      const pendingUsers = usersRes.data.filter(
        (u: any) => u.status === "pending"
      );
      setUsers(pendingUsers);

      setCreditRequests(creditsRes.data);
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
      <div className="admin-content p-6 max-w-7xl mx-auto">
        <div className="admin-header mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Overview of system performance and pending tasks.
          </p>
        </div>

        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <LoadingSpinner />
              <p className="text-green-800 mt-4 font-medium animate-pulse">
                Loading analytics...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 font-medium">
            Error: {error}
          </div>
        ) : dashboardStats ? (
          <div className="space-y-10">
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-yellow-500 rounded-full"></span>
                Action Items
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-96">
                  <PendingUsersWidget
                    users={users}
                    onActionComplete={fetchUsers}
                  />
                </div>

                <div className="h-96">
                  <PendingReviewsWidget
                    publications={publications}
                    onReviewComplete={fetchPublications}
                  />
                </div>

                <div className="h-96">
                  <CreditRequestsWidget
                    requests={creditRequests}
                    onActionComplete={fetchCreditRequests}
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-green-600 rounded-full"></span>
                Performance Overview
              </h2>

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
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AdminPage;
