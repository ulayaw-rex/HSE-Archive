import { Route } from "react-router-dom";
import AdminPage from "../pages/Admin";
import PublicationsPage from "../pages/Admin/PublicationsPage";
import UserManagement from "../pages/Admin/UserManagement";
import PrintMediaPage from "../pages/Admin/PrintMediaPage";
import SiteSettings from "../pages/Admin/SiteSettings";
import Analytics from "../pages/Admin/Analytics";
import { ContentArchivesPage } from "./../pages/Admin/Placeholders";
import Security from "../pages/Admin/Security";
import Modules from "../pages/Admin/Modules";
import SupportDocs from "../pages/Admin/SupportDocs";
import Feedback from "../pages/Admin/Feedback";

export default (
  <>
    <Route index element={<AdminPage />} />
    {/* Content Management */}
    <Route path="publications" element={<PublicationsPage />} />
    <Route path="content/archives" element={<ContentArchivesPage />} />
    <Route path="print-media" element={<PrintMediaPage />} />
    <Route path="site-settings" element={<SiteSettings />} />
    {/* User Management */}
    <Route path="users" element={<UserManagement />} />
    {/* Feedback */}
    <Route path="feedback" element={<Feedback />} />
    {/* Analytics */}
    <Route path="analytics" element={<Analytics />} />
    {/* Settings */}
    <Route path="settings/modules" element={<Modules />} />
    <Route path="settings/security" element={<Security />} />
    {/* Help */}
    <Route path="help" element={<SupportDocs />} />
  </>
);
