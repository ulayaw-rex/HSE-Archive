// routes/SiteRoutes.tsx
import { Route } from "react-router-dom";
import HomePage from "../pages/HomePage/HomePage";
import SportsPage from "../pages/Sports";
import NewsPage from "../pages/News";
import UniversityNewsPage from "../pages/News/University";
import LocalNewsPage from "../pages/News/Local";
import NationalNewsPage from "../pages/News/National";
import EntertainmentNewsPage from "../pages/News/International";
import SciTechNewsPage from "../pages/News/SciTech";
import OpinionsPage from "../pages/Opinions";
import LiteraryPage from "../pages/Literary";
import PrintMediaPage from "../pages/PrintMedia";
import TabloidsPage from "../pages/PrintMedia/Tabloids";
import MagazinesPage from "../pages/PrintMedia/Magazines";
import FoliosPage from "../pages/PrintMedia/Folios";
import OtherIssuesPage from "../pages/PrintMedia/OtherIssues";
import AboutPage from "../pages/About";
import EditorialBoardPage from "../pages/About/EditorialBoard";
import FAQsPage from "../pages/About/FAQs";
import ContactPage from "../pages/About/Contact";
import ArticleDetail from "../pages/News/ArticleDetail";
import SearchResults from "../pages/HomePage/SearchResults";

export default (
  <>
    <Route path="/" element={<HomePage />} />
    <Route path="/news" element={<NewsPage />} />
    <Route path="/news/university" element={<UniversityNewsPage />} />
    <Route path="/news/local" element={<LocalNewsPage />} />
    <Route path="/news/national" element={<NationalNewsPage />} />
    <Route path="/news/entertainment" element={<EntertainmentNewsPage />} />
    <Route path="/news/sci-tech" element={<SciTechNewsPage />} />
    <Route path="/news/:idOrSlug" element={<ArticleDetail />} />
    <Route path="/sports" element={<SportsPage />} />
    <Route path="/opinion" element={<OpinionsPage />} />
    <Route path="/literary" element={<LiteraryPage />} />
    <Route path="/print-media" element={<PrintMediaPage />} />
    <Route path="/print-media/tabloids" element={<TabloidsPage />} />
    <Route path="/print-media/magazines" element={<MagazinesPage />} />
    <Route path="/print-media/folios" element={<FoliosPage />} />
    <Route path="/print-media/other-issues" element={<OtherIssuesPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/about/editorial-board" element={<EditorialBoardPage />} />
    <Route path="/about/faqs" element={<FAQsPage />} />
    <Route path="/about/contact" element={<ContactPage />} />
    <Route path="/search" element={<SearchResults />} />
  </>
);
