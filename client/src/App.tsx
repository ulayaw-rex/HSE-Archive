import "./App.css";
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import SiteLayout from "./layouts/SiteLayout";
import AdminLayout from "./layouts/AdminLayout";
import { adminSidebarItems } from "./pages/Admin/SidebarItems";
import SiteRoutes from "./routes/SiteRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import NotFoundPage from "./components/common/NotFound";
import ScrollToTop from "./components/common/ScrollToTop";

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="p-80 text-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
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

        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </Router>
  );
}

export default App;
