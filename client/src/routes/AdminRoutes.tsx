// routes/AdminRoutes.tsx
import { Route } from "react-router-dom";
import AdminPage from "../pages/Admin";
import PublicationsPage from "../pages/Admin/PublicationsPage";
import UserManagement from "../pages/Admin/UserManagement";
import PrintMediaPage from "../pages/Admin/PrintMediaPage";
import {
  ContentArchivesPage,
  FeedbackReviewPage,
  FeedbackModeratePage,
  AnalyticsViewsPage,
  AnalyticsActivityPage,
  AnalyticsReportsPage,
  SettingsModulesPage,
  SettingsBackupPage,
  SettingsSecurityPage,
  HelpManualsPage,
  HelpTrainingPage,
} from "./../pages/Admin/Placeholders";

export default (
  <>
    <Route index element={<AdminPage />} />
    {/* Content Management */}
    <Route path="publications" element={<PublicationsPage />} />
    <Route path="content/archives" element={<ContentArchivesPage />} />
    <Route path="print-media" element={<PrintMediaPage />} />
    {/* User Management */}
    <Route path="users" element={<UserManagement />} />
    {/* Feedback */}
    <Route path="feedback/review" element={<FeedbackReviewPage />} />
    <Route path="feedback/moderate" element={<FeedbackModeratePage />} />
    {/* Analytics */}
    <Route path="analytics/views" element={<AnalyticsViewsPage />} />
    <Route path="analytics/activity" element={<AnalyticsActivityPage />} />
    <Route path="analytics/reports" element={<AnalyticsReportsPage />} />
    {/* Settings */}
    <Route path="settings/modules" element={<SettingsModulesPage />} />
    <Route path="settings/backup" element={<SettingsBackupPage />} />
    <Route path="settings/security" element={<SettingsSecurityPage />} />
    {/* Help */}
    <Route path="help/manuals" element={<HelpManualsPage />} />
    <Route path="help/training" element={<HelpTrainingPage />} />
  </>
);
