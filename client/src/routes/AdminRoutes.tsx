import React, { Suspense } from "react";
import { Route } from "react-router-dom";

// Lazy-loaded admin pages — heaviest files deferred until navigated to
const AdminPage        = React.lazy(() => import("../pages/Admin"));
const PublicationsPage = React.lazy(() => import("../pages/Admin/PublicationsPage"));
const UserManagement   = React.lazy(() => import("../pages/Admin/UserManagement"));
const PrintMediaPage   = React.lazy(() => import("../pages/Admin/PrintMediaPage"));
const SiteSettings     = React.lazy(() => import("../pages/Admin/SiteSettings"));
const Analytics        = React.lazy(() => import("../pages/Admin/Analytics"));
const Security         = React.lazy(() => import("../pages/Admin/Security"));
const Modules          = React.lazy(() => import("../pages/Admin/Modules"));
const SupportDocs      = React.lazy(() => import("../pages/Admin/SupportDocs"));
const Feedback         = React.lazy(() => import("../pages/Admin/Feedback"));

// Admin-specific loader to match the dashboard's dark aesthetic
const AdminLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500" />
  </div>
);

export default (
  <Suspense fallback={<AdminLoader />}>
    {/* Admin Dashboard (Dashboard Home) */}
    <Route index element={<AdminPage />} />

    {/* Content Management */}
    <Route path="publications" element={<PublicationsPage />} />
    <Route path="print-media" element={<PrintMediaPage />} />
    <Route path="site-settings" element={<SiteSettings />} />

    {/* User Management */}
    <Route path="users" element={<UserManagement />} />

    {/* Feedback & Interaction */}
    <Route path="feedback" element={<Feedback />} />

    {/* Analytics & Logs */}
    <Route path="analytics" element={<Analytics />} />

    {/* System Settings */}
    <Route path="settings/modules" element={<Modules />} />
    <Route path="settings/security" element={<Security />} />

    {/* Support */}
    <Route path="help" element={<SupportDocs />} />
  </Suspense>
);
