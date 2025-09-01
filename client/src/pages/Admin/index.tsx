import React, { useEffect, useState } from "react";
import DashboardStatsCards, {
  type DashboardStats,
} from "../../components/features/DashboardStats";
import AxiosInstance from "../../AxiosInstance";

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  console.log("Making API call to /dashboard/stats...");
  const response = await AxiosInstance.get("/dashboard/stats");
  console.log("API response:", response);
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
      setLoading(true);
      setError(null);
      console.log("Fetching dashboard stats...");
      const statsData = await fetchDashboardStats();
      console.log("Dashboard stats received:", statsData);
      setDashboardStats(statsData);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else if (typeof err === "object" && err !== null && "response" in err) {
        const axiosError = err as any;
        setError(
          `HTTP ${axiosError.response?.status}: ${
            axiosError.response?.statusText || "Unknown error"
          }`
        );
      } else {
        setError("Failed to fetch dashboard stats.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadDashboardStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin-container">
      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
        </div>

        {/* Dashboard Stats Cards */}
        {loading ? (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800">Loading dashboard stats...</p>
          </div>
        ) : error ? (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">Error: {error}</p>
            <p className="text-red-600 text-sm mt-2">
              Please check your backend server and API endpoints.
            </p>
            <p className="text-red-600 text-sm">
              Make sure your Laravel server is running on http://localhost:8000
            </p>
          </div>
        ) : dashboardStats ? (
          <DashboardStatsCards stats={dashboardStats} />
        ) : (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800">No dashboard stats available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
