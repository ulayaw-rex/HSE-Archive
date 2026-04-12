import React, { Suspense } from "react";
import { Route } from "react-router-dom";

// Lazy-loaded page components — each becomes its own JS chunk
const HomePage           = React.lazy(() => import("../pages/HomePage/HomePage"));
const DynamicCategoryPage = React.lazy(() => import("../pages/News/DynamicCategoryPage"));
const NewsPage           = React.lazy(() => import("../pages/News"));
const PrintMediaPage     = React.lazy(() => import("../pages/PrintMedia"));
const AboutPage          = React.lazy(() => import("../pages/About"));
const ArticleDetail      = React.lazy(() => import("../pages/News/ArticleDetail"));
const SearchResults      = React.lazy(() => import("../pages/HomePage/SearchResults"));
const UserProfile        = React.lazy(() => import("../pages/Profiles/UserProfile"));
const RegistrationPage   = React.lazy(() => import("../pages/Registration/RegistrationPage"));
const Login              = React.lazy(() => import("../pages/Maintenance/LoginPage"));

// Minimal page-level loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
  </div>
);

const SiteRoutes = (
  <Suspense fallback={<PageLoader />}>
    {/* Home */}
    <Route path="/" element={<HomePage />} />

    {/* Dynamic Categories */}
    <Route path="/category/:category" element={<DynamicCategoryPage />} />

    {/* Single Article View (Public Read) */}
    <Route path="/news/:idOrSlug" element={<ArticleDetail />} />

    {/* Main Sections */}
    <Route path="/news" element={<NewsPage />} />
    <Route path="/print-media" element={<PrintMediaPage />} />
    <Route path="/about" element={<AboutPage />} />

    {/* Utilities */}
    <Route path="/search" element={<SearchResults />} />
    <Route path="/register" element={<RegistrationPage />} />

    {/* Login Route */}
    <Route path="/login" element={<Login />} />

    {/* Public Author Profile */}
    <Route path="/profile/:userId" element={<UserProfile />} />
  </Suspense>
);

export default SiteRoutes;
