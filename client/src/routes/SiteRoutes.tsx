import React, { Suspense } from "react";
import type { ComponentType } from "react";
import { Route } from "react-router-dom";

// Page-level loading spinner
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
  </div>
);

/**
 * Creates a lazy-loaded route element with its own Suspense boundary.
 * Suspense is placed INSIDE the element prop, not around <Route> tags,
 * because React Router v6 only permits <Route> or <Fragment> as route children.
 */
const lazyRoute = (factory: () => Promise<{ default: ComponentType<any> }>) => {
  const Component = React.lazy(factory);
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
};

const SiteRoutes = (
  <>
    {/* Home */}
    <Route path="/" element={lazyRoute(() => import("../pages/HomePage/HomePage"))} />

    {/* Dynamic Categories */}
    <Route path="/category/:category" element={lazyRoute(() => import("../pages/News/DynamicCategoryPage"))} />

    {/* Single Article View (Public Read) */}
    <Route path="/news/:idOrSlug" element={lazyRoute(() => import("../pages/News/ArticleDetail"))} />

    {/* Main Sections */}
    <Route path="/news" element={lazyRoute(() => import("../pages/News"))} />
    <Route path="/print-media" element={lazyRoute(() => import("../pages/PrintMedia"))} />
    <Route path="/about" element={lazyRoute(() => import("../pages/About"))} />

    {/* Utilities */}
    <Route path="/search" element={lazyRoute(() => import("../pages/HomePage/SearchResults"))} />
    <Route path="/register" element={lazyRoute(() => import("../pages/Registration/RegistrationPage"))} />

    {/* Login Route */}
    <Route path="/login" element={lazyRoute(() => import("../pages/Maintenance/LoginPage"))} />

    {/* Public Author Profile */}
    <Route path="/profile/:userId" element={lazyRoute(() => import("../pages/Profiles/UserProfile"))} />
  </>
);

export default SiteRoutes;

