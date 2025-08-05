import React, { useState } from "react";
import { FaUserCircle, FaBars, FaTimes, FaSearch } from "react-icons/fa";

// Define the NavLink type
type NavLink = {
  id: string;
  label: string;
  href: string;
};

const navLinks: NavLink[] = [
  { id: "news", label: "News", href: "/" },
  { id: "sports", label: "Sports", href: "/sports" },
  { id: "opinions", label: "Opinions", href: "/opinions" },
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
  { id: "about", label: "About", href: "#" },
  { id: "ads", label: "Ads", href: "#" },
  { id: "tips", label: "Tips", href: "#" },
  { id: "alumni", label: "Alumni", href: "#" },
];

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    // Handle search functionality here
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="sticky lg:static top-0 z-50 bg-green-900 text-white shadow-lg">
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
          <div className="absolute left-1/2 transform -translate-x-1/2">
            {/* Mobile Title */}
            <div className="lg:hidden">
              <span className="text-lg font-bold text-white">
                The Hillside Echo
              </span>
            </div>
            {/* Desktop Date */}
            <div className="hidden lg:block">
              <span className="text-sm text-white">
                Thursday, July 31st, 2025
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
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative">
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaSearch className="text-lg text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  />
                </div>
              </form>

              {/* Separator */}
              <div className="border-t border-green-700 my-3"></div>

              {/* Navigation Links */}
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  className="text-sm text-white hover:text-green-200 transition-colors duration-200 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
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
