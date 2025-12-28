import { Route } from "react-router-dom";
import HomePage from "../pages/HomePage/HomePage";
import SportsPage from "../pages/Sports";
import NewsPage from "../pages/News";
import UniversityNewsPage from "../pages/News/University";
import LocalNewsPage from "../pages/News/Local";
import NationalNewsPage from "../pages/News/National";
import EntertainmentNewsPage from "../pages/News/Entertainment";
import SciTechNewsPage from "../pages/News/SciTech";
import OpinionsPage from "../pages/Opinions";
import LiteraryPage from "../pages/Literary";
import PrintMediaPage from "../pages/PrintMedia";
import AboutPage from "../pages/About";
import ArticleDetail from "../pages/News/ArticleDetail";
import SearchResults from "../pages/HomePage/SearchResults";
import UserProfile from "../pages/Profiles/UserProfile";
import RegistrationPage from "../pages/Registration/RegistrationPage";

export default (
  <>
    {/* Home */}
    <Route path="/" element={<HomePage />} />

    {/* News Categories */}
    <Route path="/news" element={<NewsPage />} />
    <Route path="/news/university" element={<UniversityNewsPage />} />
    <Route path="/news/local" element={<LocalNewsPage />} />
    <Route path="/news/national" element={<NationalNewsPage />} />
    <Route path="/news/entertainment" element={<EntertainmentNewsPage />} />
    <Route path="/news/sci-tech" element={<SciTechNewsPage />} />

    {/* Single Article View (Handles both ID and Slug) */}
    <Route path="/news/:idOrSlug" element={<ArticleDetail />} />

    {/* Main Sections */}
    <Route path="/sports" element={<SportsPage />} />
    <Route path="/opinion" element={<OpinionsPage />} />
    <Route path="/literary" element={<LiteraryPage />} />
    <Route path="/print-media" element={<PrintMediaPage />} />
    <Route path="/about" element={<AboutPage />} />

    {/* Utilities */}
    <Route path="/search" element={<SearchResults />} />
    <Route path="/register" element={<RegistrationPage />} />

    {/* Profile Routes (Handles "My Profile" and "Viewing Other Users") */}
    <Route path="/profile" element={<UserProfile />} />
    <Route path="/profile/:id" element={<UserProfile />} />
  </>
);
