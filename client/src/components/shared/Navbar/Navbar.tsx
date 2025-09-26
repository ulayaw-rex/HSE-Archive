import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaSearch, FaChevronDown } from "react-icons/fa";
import "./navbar.css";
import Logo from "../../../assets/LOGO.jpg";

// Define the NavigationLink type (renamed to avoid conflict with React Router's NavLink)
type NavigationLink = {
  id: string;
  label: string;
  href: string;
  hasDropdown?: boolean;
  dropdownItems?: DropdownItem[];
};

type DropdownItem = {
  id: string;
  label: string;
  href: string;
};

const navLinks: NavigationLink[] = [
  {
    id: "news",
    label: "News",
    href: "/news",
    hasDropdown: true,
    dropdownItems: [
      { id: "university", label: "University", href: "/news/university" },
      { id: "local", label: "Local", href: "/news/local" },
      { id: "national", label: "National", href: "/news/national" },
      {
        id: "international",
        label: "International",
        href: "/news/international",
      },
      { id: "sci-tech", label: "Sci-Tech", href: "/news/sci-tech" },
    ],
  },
  { id: "sports", label: "Sports", href: "/sports" },
  { id: "opinion", label: "opinion", href: "/opinion" },
  { id: "literary", label: "Literary", href: "/literary" },
  {
    id: "print-media",
    label: "Print Media",
    href: "/print-media",
  },
  {
    id: "about",
    label: "About",
    href: "/about",
    hasDropdown: true,
    dropdownItems: [
      {
        id: "editorial-board",
        label: "The Editorial Board",
        href: "/about/editorial-board",
      },
      { id: "faqs", label: "FAQs", href: "/about/faqs" },
      { id: "contact", label: "Contact Us", href: "/about/contact" },
    ],
  },
];

const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    // Handle search functionality here
    console.log("Searching for:", searchQuery);
  };

  const handleDropdownEnter = (linkId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setHoveredDropdown(linkId);
  };

  const handleDropdownMenuEnter = (linkId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setHoveredDropdown(linkId);
  };

  const handleDropdownMenuLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredDropdown(null);
    }, 100); // Shorter delay when leaving dropdown menu
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Main Header - Hidden on Mobile */}
      <div className="hidden lg:block bg-white border-b border-green-200 shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center relative">
            {/* Centered Logo and Title */}
            <div
              onClick={() => (window.location.href = "/")}
              className="flex items-center space-x-4 hover:opacity-80 transition-opacity duration-200 focus:outline-none cursor-pointer"
            >
              {/* Logo */}
              <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg items-center justify-center transform hover:scale-105 transition-transform duration-200">
                <img
                  src={Logo}
                  alt="The Hillside Echo Logo"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title */}
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-green-800 whitespace-nowrap">
                The Hillside Echo
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar - Sticky on Desktop Only */}
      <div className="hidden lg:block sticky top-0 z-50 bg-green-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Desktop Navigation - Centered */}
            <nav className="flex items-center flex-1">
              <div className="flex items-center justify-center space-x-13 w-full">
                {navLinks.map((link) => (
                  <div
                    key={link.id}
                    className="relative group"
                    onMouseEnter={() =>
                      link.hasDropdown && handleDropdownEnter(link.id)
                    }
                  >
                    <NavLink
                      to={link.href}
                      className={({ isActive }) =>
                        `text-white hover:text-green-200 transition-all duration-200 font-semibold text-base uppercase tracking-wider hover:transform hover:scale-105 px-2 py-2 rounded-md hover:bg-green-700 flex items-center gap-1 whitespace-nowrap ${
                          isActive ? "bg-green-600 text-green-100" : ""
                        }`
                      }
                    >
                      {link.label}
                      {link.hasDropdown && (
                        <FaChevronDown className="text-xs transition-transform duration-200 group-hover:rotate-180" />
                      )}
                    </NavLink>

                    {/* Professional Dropdown Menu */}
                    {link.hasDropdown && hoveredDropdown === link.id && (
                      <div
                        className="absolute top-full left-1/2 transform -translate-x-1/2 pt-1 w-56"
                        onMouseEnter={() => handleDropdownMenuEnter(link.id)}
                        onMouseLeave={() => handleDropdownMenuLeave()}
                        style={{ pointerEvents: "auto" }}
                      >
                        <div
                          className="w-full text-black bg-white border border-green-600 rounded-lg shadow-xl z-[60]"
                          style={{ minWidth: "200px" }}
                        >
                          <div className="py-2">
                            {link.dropdownItems &&
                            link.dropdownItems.length > 0 ? (
                              link.dropdownItems.map((item) => (
                                <NavLink
                                  key={item.id}
                                  to={item.href}
                                  className={({ isActive }) =>
                                    `block px-4 py-3 text-sm text-gray-700 hover:bg-green-700 hover:text-green-600 transition-colors duration-200 border-b border-gray-100 last:border-b-0 cursor-pointer ${
                                      isActive
                                        ? "bg-green-100 text-green-800 font-semibold"
                                        : ""
                                    }`
                                  }
                                >
                                  {item.label}
                                </NavLink>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-gray-500">
                                No items available
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </nav>

            {/* Search Bar - Right Side */}
            <div className="flex items-center ml-4">
              <form onSubmit={handleSearch} className="relative group">
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaSearch className="text-lg text-green-200 group-hover:text-white transition-all duration-300" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-8 group-hover:w-48 pl-9 pr-3 py-1.5 bg-transparent hover:bg-white hover:border-green-200 hover:border rounded-md text-white placeholder-transparent hover:placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:w-48 focus:placeholder-green-200 focus:bg-white focus:border-green-200 focus:text-green-800 transition-all duration-300 ease-in-out cursor-pointer"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
