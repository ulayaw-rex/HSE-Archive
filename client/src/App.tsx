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

// --- NEW IMPORTS ---
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layouts
import SiteLayout from "./layouts/SiteLayout";
import AdminLayout from "./layouts/AdminLayout";

// Sidebar items for admin layout
import { adminSidebarItems } from "./pages/Admin/SidebarItems";

// Routes
import SiteRoutes from "./routes/SiteRoutes";
import AdminRoutes from "./routes/AdminRoutes";

import NotFoundPage from "./components/common/NotFound";

// --- REFACTORED SECURE ADMIN GUARD ---
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  // 1. Wait for the backend check to finish
  if (isLoading) {
    // You can replace this with a nice Spinner component later
    return (
      <div className="loading-screen">
        <div className="p-80 text-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // 2. Secure Check: If not logged in OR not an admin, kick them out
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // 3. Access Granted
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      {/* The Provider must be inside Router so components inside it 
         can use navigate(), but it must wrap all Routes.
      */}
      <AuthProvider>
        <Routes>
          {/* Public site routes */}
          <Route element={<SiteLayout />}>{SiteRoutes}</Route>

          {/* Admin routes - Protected by Secure Guard */}
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

        {/* Toast notifications */}
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </Router>
  );
}

export default App;
