import React from "react";
import Header from "../components/shared/Navbar/Header";
import Navbar from "../components/shared/Navbar/Navbar";
import Footer from "../components/shared/Footer/Footer";
import { Outlet } from "react-router-dom";

const SiteLayout: React.FC = () => {
  return (
    <div className="App">
      <Header />
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default SiteLayout;


