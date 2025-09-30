import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";

// Define the NavigationLink type
type NavigationLink = {
  id: string;
  label: string;
  href: string;
};

const navLinks: NavigationLink[] = [
  { id: "news", label: "News", href: "/" },
  { id: "sports", label: "Sports", href: "/sports" },
  { id: "opinions", label: "Opinion", href: "/opinion" },
  { id: "literary", label: "Literary", href: "/literary" },
  { id: "print-media", label: "Print Media", href: "/print-media" },
  { id: "about", label: "About", href: "/about" },
];

// Define the TopLink type
type TopLink = {
  id: string;
  label: string;
  href: string;
};

const topLinks: TopLink[] = [
  { id: "ads", label: "Ads", href: "#" },
  { id: "tips", label: "Tips", href: "#" },
  { id: "alumni", label: "Alumni", href: "#" },
];

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky lg:static top-0 z-50 bg-green-700 text-white shadow-lg">
      {/* Top Bar */}
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between relative">
          {/* Left Side - Desktop Links & Mobile Menu */}
          <div className="flex items-center">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden items-center justify-center"
              style={{ backgroundColor: "transparent", boxShadow: "none" }}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <FaTimes
                  size={24}
                  style={{
                    color: "#ffffff",
                    filter: "drop-shadow(0 0 2px rgba(255,255,255,0.5))",
                  }}
                />
              ) : (
                <FaBars
                  size={24}
                  style={{
                    color: "#ffffff",
                    filter: "drop-shadow(0 0 2px rgba(255,255,255,0.5))",
                  }}
                />
              )}
            </button>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center space-x-6">
              {topLinks.slice(0, 5).map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  className="text-sm text-green-200 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Center - Mobile Title & Desktop Date */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
            {/* Mobile Title */}
            <div
              className="lg:hidden"
              onClick={() => (window.location.href = "/")}
            >
              <span className="text-lg font-bold text-white">
                The Hillside Echo
              </span>
            </div>
            {/* Desktop Date */}
            <div className="hidden lg:block">
              <span className="text-sm text-white">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Right Side - Login */}
          <div className="flex items-center">
            <a
              href="#"
              className="flex items-center space-x-2 text-sm text-green-200 hover:text-white transition-colors duration-200"
            >
              <span>Log in</span>
              <FaUserCircle size={16} />
            </a>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-green-700">
            <div className="flex flex-col space-y-3 pt-4">
              {/* Navigation Links */}
              {navLinks.map((link) => (
                <NavLink
                  key={link.id}
                  to={link.href}
                  className={({ isActive }) =>
                    `text-sm text-white hover:text-green-200 transition-colors duration-200 font-medium ${
                      isActive ? "text-green-200 font-semibold" : ""
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}

              {/* Separator */}
              <div className="border-t border-green-700 my-3"></div>

              {/* Top Links */}
              {topLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  className="text-sm text-green-200 hover:text-white transition-colors duration-200 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
