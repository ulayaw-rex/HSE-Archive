import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/shared/Navbar/Header";
import Navbar from "../components/shared/Navbar/Navbar";
import Footer from "../components/shared/Footer/Footer";

const SiteLayout: React.FC = () => {
  const location = useLocation();

  const isRegisterPage = location.pathname === "/register";

  return (
    <div className="App dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200 min-h-screen flex flex-col">
      {!isRegisterPage && <Header />}
      {!isRegisterPage && <Navbar />}

      <Outlet />

      {!isRegisterPage && <Footer />}
    </div>
  );
};

export default SiteLayout;
