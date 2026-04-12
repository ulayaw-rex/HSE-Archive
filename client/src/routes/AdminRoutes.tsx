import React, { Suspense } from "react";
import type { ComponentType } from "react";
import { Route } from "react-router-dom";

// Admin loader spinner
const AdminLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500" />
  </div>
);

/**
 * Same Suspense-in-element-prop pattern as SiteRoutes.
 * React Router v6 cannot have <Suspense> as a direct route child.
 */
const lazyRoute = (factory: () => Promise<{ default: ComponentType<any> }>) => {
  const Component = React.lazy(factory);
  return (
    <Suspense fallback={<AdminLoader />}>
      <Component />
    </Suspense>
  );
};

export default (
  <>
    {/* Admin Dashboard (Dashboard Home) */}
    <Route index element={lazyRoute(() => import("../pages/Admin"))} />

    {/* Content Management */}
    <Route path="publications" element={lazyRoute(() => import("../pages/Admin/PublicationsPage"))} />
    <Route path="print-media" element={lazyRoute(() => import("../pages/Admin/PrintMediaPage"))} />
    <Route path="site-settings" element={lazyRoute(() => import("../pages/Admin/SiteSettings"))} />

    {/* User Management */}
    <Route path="users" element={lazyRoute(() => import("../pages/Admin/UserManagement"))} />

    {/* Feedback & Interaction */}
    <Route path="feedback" element={lazyRoute(() => import("../pages/Admin/Feedback"))} />

    {/* Analytics & Logs */}
    <Route path="analytics" element={lazyRoute(() => import("../pages/Admin/Analytics"))} />

    {/* System Settings */}
    <Route path="settings/modules" element={lazyRoute(() => import("../pages/Admin/Modules"))} />
    <Route path="settings/security" element={lazyRoute(() => import("../pages/Admin/Security"))} />

    {/* Support */}
    <Route path="help" element={lazyRoute(() => import("../pages/Admin/SupportDocs"))} />
  </>
);

