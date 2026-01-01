import "./App.css";
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import AxiosInstance from "./AxiosInstance";

import LoadingSpinner from "./components/common/LoadingSpinner";
import ScrollToTop from "./components/common/ScrollToTop";
import Chatbot from "./components/common/Chatbot";
import NotFoundPage from "./components/common/NotFound";

import SiteLayout from "./layouts/SiteLayout";
import AdminLayout from "./layouts/AdminLayout";
import { adminSidebarItems } from "./pages/Admin/SidebarItems";
import SiteRoutes from "./routes/SiteRoutes";
import AdminRoutes from "./routes/AdminRoutes";

import Maintenance from "./pages/Maintenance";
import LoginPage from "../src/pages/Maintenance/LoginPage";

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const AppContent = () => {
  const { user, isLoading: authLoading } = useAuth();
  const location = useLocation();

  const [isLocked, setIsLocked] = useState(false);
  const [systemLoading, setSystemLoading] = useState(true);

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const res = await AxiosInstance.get("/analytics/system-status");
        setIsLocked(res.data.locked);
      } catch (error) {
        console.error("Failed to check system status");
      } finally {
        setSystemLoading(false);
      }
    };
    checkSystemStatus();
  }, []);

  if (authLoading || systemLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isLocked && user?.role !== "admin") {
    if (location.pathname !== "/login") {
      return <Maintenance />;
    }
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<SiteLayout />}>{SiteRoutes}</Route>

        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout sidebarItems={adminSidebarItems} />
            </RequireAdmin>
          }
        >
          {AdminRoutes}
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {!location.pathname.startsWith("/admin") &&
        location.pathname !== "/login" && <Chatbot />}

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
