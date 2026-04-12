import "./App.css";
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { ThemeProvider } from "./context/ThemeContext";
import AxiosInstance from "./AxiosInstance";
import ScrollToTop from "./components/common/ScrollToTop";
import Chatbot from "./components/common/Chatbot";
import NotFoundPage from "./components/common/NotFound";
import ErrorBoundary from "./components/common/ErrorBoundary";
import SiteLayout from "./layouts/SiteLayout";
import AdminLayout from "./layouts/AdminLayout";
import { adminSidebarItems } from "./pages/Admin/SidebarItems";
import SiteRoutes from "./routes/SiteRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import Maintenance from "./pages/Maintenance";
import LoginPage from "./pages/Maintenance/LoginPage";
import VerifyEmailPage from "./pages/Maintenance/VerifyEmailPage";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8 p-10">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-32 bg-gray-200 rounded-lg w-full"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const res = await AxiosInstance.get("/analytics/system-status");
        if (res.data.locked) {
          setIsLocked(true);
        }
      } catch (error) {
        console.error("Failed to check system status");
      }
    };
    checkSystemStatus();
  }, []);

  if (isLocked && user?.role !== "admin") {
    if (location.pathname !== "/login") {
      return <Maintenance />;
    }
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        <Route element={<SiteLayout />}>
          {SiteRoutes}

          <Route
            element={
              <RequireAuth>
                <Outlet />
              </RequireAuth>
            }
          ></Route>
        </Route>

        <Route
          path="/admin"
          element={<AdminLayout sidebarItems={adminSidebarItems} />}
        >
          <Route
            element={
              <RequireAdmin>
                <Outlet />
              </RequireAdmin>
            }
          >
            {AdminRoutes}
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {!location.pathname.startsWith("/admin") &&
        location.pathname !== "/login" &&
        location.pathname !== "/register" && <Chatbot />}

      {location.pathname.startsWith("/admin") && (
        <ToastContainer position="top-right" autoClose={3000} />
      )}
    </>
  );
};

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      // Server-side cache on homepage/news is 5 min (Cache::remember 300s).
      // Matching staleTime prevents redundant requests for unchanged data.
      staleTime: 5 * 60 * 1000, // 5 minutes
      // No global interval — admin queries that need live updates
      // set their own refetchInterval in their individual useQuery() calls.
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ErrorBoundary>
          <ThemeProvider>
            <ScrollToTop />
            <AuthProvider>
              <DataProvider>
                <AppContent />
              </DataProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
