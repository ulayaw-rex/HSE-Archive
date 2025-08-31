import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import SportsPage from "./pages/Sports";
import NewsPage from "./pages/News";
import UniversityNewsPage from "./pages/News/University";
import LocalNewsPage from "./pages/News/Local";
import NationalNewsPage from "./pages/News/National";
import InternationalNewsPage from "./pages/News/International";
import SciTechNewsPage from "./pages/News/SciTech";
import OpinionsPage from "./pages/Opinions";
import LiteraryPage from "./pages/Literary";
import PrintMediaPage from "./pages/PrintMedia";
import TabloidsPage from "./pages/PrintMedia/Tabloids";
import MagazinesPage from "./pages/PrintMedia/Magazines";
import FoliosPage from "./pages/PrintMedia/Folios";
import OtherIssuesPage from "./pages/PrintMedia/OtherIssues";
import AboutPage from "./pages/About";
import EditorialBoardPage from "./pages/About/EditorialBoard";
import FAQsPage from "./pages/About/FAQs";
import ContactPage from "./pages/About/Contact";
import AdminPage from "./pages/Admin";
import SiteLayout from "./layouts/SiteLayout";
import AdminLayout from "./layouts/AdminLayout";

// Admin Pages (placeholder components for now)
const ContentPublicationsPage = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Manage Publications</h1><p>Upload, edit, delete, and tag publications.</p></div>;
const ContentArchivesPage = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Archives</h1><p>Organize content by year, section, and contributor.</p></div>;
const ContentCategoriesPage = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Categories & Sections</h1><p>Manage News, Features, Opinion, Literary, and other sections.</p></div>;
const UserManagementPage = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">User Management</h1><p>Approve/Reject registrations, manage roles, and handle accounts.</p></div>;
const FeedbackReviewPage = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Review Feedback</h1><p>Review and manage user feedback.</p></div>;
const FeedbackModeratePage = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Moderate Entries</h1><p>Moderate or remove inappropriate feedback entries.</p></div>;
const AnalyticsViewsPage = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Article Views</h1><p>Track article views and popular content.</p></div>;
const AnalyticsActivityPage = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">User Activity</h1><p>Track user activity and engagement.</p></div>;
const AnalyticsReportsPage = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Export Reports</h1><p>Generate and export various reports.</p></div>;
const SettingsModulesPage = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Enable/Disable Modules</h1><p>Configure system modules like Feedback, Alumni, etc.</p></div>;
const SettingsBackupPage = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Backup and Restore</h1><p>Manage data backup and restoration.</p></div>;
const SettingsSecurityPage = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Security & Access Control</h1><p>Configure security settings and access controls.</p></div>;
const HelpManualsPage = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">User Manuals</h1><p>Access user manuals and guides.</p></div>;
const HelpTrainingPage = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Training Support</h1><p>Onboarding and training support resources.</p></div>;

// Admin sidebar configuration
const adminSidebarItems = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
      </svg>
    ),
    end: true
  },
  {
    label: "Content Management",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    children: [
      {
        to: "/admin/content/publications",
        label: "Publications",
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      },
      {
        to: "/admin/content/archives",
        label: "Archives",
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-14 0h14" />
          </svg>
        )
      },
      {
        to: "/admin/content/categories",
        label: "Categories",
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        )
      }
    ]
  },
  {
    to: "/admin/users",
    label: "User Management",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    )
  },
  {
    label: "Feedback",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    children: [
      {
        to: "/admin/feedback/review",
        label: "Review Feedback",
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )
      },
      {
        to: "/admin/feedback/moderate",
        label: "Moderate Entries",
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      }
    ]
  },
  {
    label: "Analytics",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    children: [
      {
        to: "/admin/analytics/views",
        label: "Article Views",
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )
      },
      {
        to: "/admin/analytics/activity",
        label: "User Activity",
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )
      },
      {
        to: "/admin/analytics/reports",
        label: "Export Reports",
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      }
    ]
  },
  {
    label: "Settings",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    children: [
      {
        to: "/admin/settings/modules",
        label: "Enable/Disable Modules",
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        )
      },
      {
        to: "/admin/settings/backup",
        label: "Backup and Restore",
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        )
      },
      {
        to: "/admin/settings/security",
        label: "Security & Access Control",
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )
      }
    ]
  },
  {
    label: "Help",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    children: [
      {
        to: "/admin/help/manuals",
        label: "User Manuals",
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )
      },
      {
        to: "/admin/help/training",
        label: "Training Support",
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
          </svg>
        )
      }
    ]
  }
];

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/university" element={<UniversityNewsPage />} />
          <Route path="/news/local" element={<LocalNewsPage />} />
          <Route path="/news/national" element={<NationalNewsPage />} />
          <Route path="/news/international" element={<InternationalNewsPage />} />
          <Route path="/news/sci-tech" element={<SciTechNewsPage />} />
          <Route path="/sports" element={<SportsPage />} />
          <Route path="/opinions" element={<OpinionsPage />} />
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
        </Route>

        <Route path="/admin" element={<AdminLayout sidebarItems={adminSidebarItems} />}>
          <Route index element={<AdminPage />} />
          
          {/* Content Management Routes */}
          <Route path="content/publications" element={<ContentPublicationsPage />} />
          <Route path="content/archives" element={<ContentArchivesPage />} />
          <Route path="content/categories" element={<ContentCategoriesPage />} />
          
          {/* User Management Routes */}
          <Route path="users" element={<UserManagementPage />} />
          
          {/* Feedback Routes */}
          <Route path="feedback/review" element={<FeedbackReviewPage />} />
          <Route path="feedback/moderate" element={<FeedbackModeratePage />} />
          
          {/* Analytics Routes */}
          <Route path="analytics/views" element={<AnalyticsViewsPage />} />
          <Route path="analytics/activity" element={<AnalyticsActivityPage />} />
          <Route path="analytics/reports" element={<AnalyticsReportsPage />} />
          
          {/* Settings Routes */}
          <Route path="settings/modules" element={<SettingsModulesPage />} />
          <Route path="settings/backup" element={<SettingsBackupPage />} />
          <Route path="settings/security" element={<SettingsSecurityPage />} />
          
          {/* Help Routes */}
          <Route path="help/manuals" element={<HelpManualsPage />} />
          <Route path="help/training" element={<HelpTrainingPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
