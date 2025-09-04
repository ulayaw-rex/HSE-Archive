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

function App() {
  return (
    <Router>
      <Routes>
        {/* Public site routes */}
        <Route element={<SiteLayout />}>{SiteRoutes}</Route>

        {/* Admin routes */}
        <Route
          path="/admin"
          element={<AdminLayout sidebarItems={adminSidebarItems} />}
        >
          {AdminRoutes}
        </Route>
      </Routes>

      {/* Toast notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
