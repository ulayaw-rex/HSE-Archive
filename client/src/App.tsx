// src/App.tsx
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layouts
import SiteLayout from "./layouts/SiteLayout";
import AdminLayout from "./layouts/AdminLayout";

// Sidebar items for admin layout
import { adminSidebarItems } from "./pages/Admin/SidebarItems";

// Routes
import SiteRoutes from "./routes/SiteRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import { Navigate } from "react-router-dom";

import NotFoundPage from "./components/common/NotFound";

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const saved = localStorage.getItem("user");
  const user = saved ? JSON.parse(saved) : null;
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public site routes */}
        <Route element={<SiteLayout />}>{SiteRoutes}</Route>

        {/* Admin routes */}
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
    </Router>
  );
}

export default App;
