import React, { Suspense } from "react";
import type { ComponentType } from "react";
import { Route } from "react-router-dom";

// No spinner — each page has its own skeleton loading state
const lazyRoute = (factory: () => Promise<{ default: ComponentType<any> }>) => {
  const Component = React.lazy(factory);
  return (
    <Suspense fallback={null}>
      <Component />
    </Suspense>
  );
};

const SiteRoutes = (
  <>
    {/* Home */}
    <Route
      path="/"
      element={lazyRoute(() => import("../pages/HomePage/HomePage"))}
    />

    {/* Dynamic Categories */}
    <Route
      path="/category/:category"
      element={lazyRoute(() => import("../pages/News/DynamicCategoryPage"))}
    />

    {/* Single Article View (Public Read) */}
    <Route
      path="/news/:idOrSlug"
      element={lazyRoute(() => import("../pages/News/ArticleDetail"))}
    />

    {/* Main Sections */}
    <Route path="/news" element={lazyRoute(() => import("../pages/News"))} />
    <Route
      path="/print-media"
      element={lazyRoute(() => import("../pages/PrintMedia"))}
    />
    <Route path="/about" element={lazyRoute(() => import("../pages/About"))} />

    {/* Utilities */}
    <Route
      path="/search"
      element={lazyRoute(() => import("../pages/HomePage/SearchResults"))}
    />
    <Route
      path="/register"
      element={lazyRoute(
        () => import("../pages/Registration/RegistrationPage"),
      )}
    />

    {/* Public Author Profile */}
    <Route
      path="/profile/:userId"
      element={lazyRoute(() => import("../pages/Profiles/UserProfile"))}
    />
  </>
);

export default SiteRoutes;
