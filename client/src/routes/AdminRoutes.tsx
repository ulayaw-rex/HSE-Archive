import React, { Suspense } from "react";
import type { ComponentType } from "react";
import { Route } from "react-router-dom";

// No spinner — each admin page has its own skeleton loading state
const lazyRoute = (factory: () => Promise<{ default: ComponentType<any> }>) => {
  const Component = React.lazy(factory);
  return (
    <Suspense fallback={null}>
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

