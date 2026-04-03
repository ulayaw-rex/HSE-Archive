import { Route } from "react-router-dom";
import HomePage from "../pages/HomePage/HomePage";
import DynamicCategoryPage from "../pages/News/DynamicCategoryPage";
import NewsPage from "../pages/News";
import PrintMediaPage from "../pages/PrintMedia";
import AboutPage from "../pages/About";
import ArticleDetail from "../pages/News/ArticleDetail";
import SearchResults from "../pages/HomePage/SearchResults";
import UserProfile from "../pages/Profiles/UserProfile";
import RegistrationPage from "../pages/Registration/RegistrationPage";
import Login from "../pages/Maintenance/LoginPage";

const SiteRoutes = (
  <>
    {/* Home */}
    <Route path="/" element={<HomePage />} />

    {/* Dynamic Categories */}
    <Route path="/category/:category" element={<DynamicCategoryPage />} />

    {/* Single Article View (Public Read) */}
    <Route path="/news/:idOrSlug" element={<ArticleDetail />} />

    {/* Main Sections (Still migrating to React Query) */}
    <Route path="/news" element={<NewsPage />} />
    <Route path="/print-media" element={<PrintMediaPage />} />
    <Route path="/about" element={<AboutPage />} />

    {/* Utilities */}
    <Route path="/search" element={<SearchResults />} />
    <Route path="/register" element={<RegistrationPage />} />

    {/*  Login Route */}
    <Route path="/login" element={<Login />} />

    {/* Public Author Profile */}
    <Route path="/profile/:userId" element={<UserProfile />} />
  </>
);

export default SiteRoutes;
