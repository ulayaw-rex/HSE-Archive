import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/shared/Navbar/Header";
import Navbar from "../components/shared/Navbar/Navbar";
import Footer from "../components/shared/Footer/Footer";

const SiteLayout: React.FC = () => {
  const location = useLocation();

  const isRegisterPage = location.pathname === "/register";

  return (
    <div className="App">
      {!isRegisterPage && <Header />}
      {!isRegisterPage && <Navbar />}

      <Outlet />

      {!isRegisterPage && <Footer />}
    </div>
  );
};

export default SiteLayout;
