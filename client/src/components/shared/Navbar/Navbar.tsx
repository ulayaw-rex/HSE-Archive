import React, { useState, useRef } from "react";
import { FaSearch, FaChevronDown } from "react-icons/fa";
import "./navbar.css";

// Define the NavLink type
type NavLink = {
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

const navLinks: NavLink[] = [
  { 
    id: "news", 
    label: "News", 
    href: "/news",
    hasDropdown: true,
    dropdownItems: [
      { id: "university", label: "University", href: "/news/university" },
      { id: "local", label: "Local", href: "/news/local" },
      { id: "national", label: "National", href: "/news/national" },
      { id: "international", label: "International", href: "/news/international" },
      { id: "sci-tech", label: "Sci-Tech", href: "/news/sci-tech" }
    ]
  },
  { id: "sports", label: "Sports", href: "/sports" },
  { id: "opinions", label: "Opinions", href: "/opinions" },
  { id: "literary", label: "Literary", href: "/literary" },
  { 
    id: "print-media", 
    label: "Print Media", 
    href: "/print-media",
    hasDropdown: true,
    dropdownItems: [
      { id: "tabloids", label: "Tabloids", href: "/print-media/tabloids" },
      { id: "magazines", label: "Magazines", href: "/print-media/magazines" },
      { id: "folios", label: "Folios", href: "/print-media/folios" },
      { id: "other-issues", label: "Other Issues", href: "/print-media/other-issues" }
    ]
  },
  { 
    id: "about", 
    label: "About", 
    href: "/about",
    hasDropdown: true,
    dropdownItems: [
      { id: "editorial-board", label: "The Editorial Board", href: "/about/editorial-board" },
      { id: "faqs", label: "FAQs", href: "/about/faqs" },
      { id: "contact", label: "Contact Us", href: "/about/contact" }
    ]
  },
  { id: "archive", label: "Archive", href: "/archive" },
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

  const handleDropdownLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredDropdown(null);
    }, 150); // Small delay to prevent immediate closing
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
    }, 150);
  };

  return (
    <>
      {/* Main Header - Hidden on Mobile */}
      <div className="hidden lg:block bg-white border-b border-green-200 shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 items-center relative">
            {/* Desktop Search Bar - Hidden on Mobile */}
            <form onSubmit={handleSearch} className="relative group hidden lg:block">
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="text-lg text-green-800 group-hover:text-green-600 transition-all duration-300" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-9 group-hover:w-[160px] pl-9 pr-3 py-1.5 bg-transparent hover:bg-white hover:border-green-200 hover:border rounded-md text-green-800 placeholder-transparent hover:placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:w-[160px] focus:placeholder-green-400 focus:bg-white focus:border-green-200 focus:border transition-all duration-300 ease-in-out cursor-pointer"
                />
              </div>
            </form>

            <div className="hidden lg:block text-2xl sm:text-3xl md:text-4xl font-extrabold text-green-800 text-center whitespace-nowrap">
              The Hillside Echo
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar - Sticky on Desktop Only */}
      <div className="hidden lg:block sticky top-0 z-40 bg-green-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex lg:items-center justify-center flex-1">
              <div className="flex items-center justify-evenly w-full max-w-4xl">
                {navLinks.map((link) => (
                  <div
                    key={link.id}
                    className="relative group"
                    onMouseEnter={() => link.hasDropdown && handleDropdownEnter(link.id)}
                    onMouseLeave={() => link.hasDropdown && handleDropdownLeave()}
                  >
                    <a
                      href={link.href}
                      className="text-white hover:text-green-200 transition-all duration-200 font-semibold text-base uppercase tracking-wider hover:transform hover:scale-105 px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-1"
                    >
                      {link.label}
                      {link.hasDropdown && (
                        <FaChevronDown className="text-xs transition-transform duration-200 group-hover:rotate-180" />
                      )}
                    </a>
                    
                    {/* Professional Dropdown Menu */}
                    {link.hasDropdown && hoveredDropdown === link.id && (
                      <div 
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white border border-green-200 rounded-lg shadow-xl z-50"
                        style={{ minWidth: '200px' }}
                        onMouseEnter={() => handleDropdownMenuEnter(link.id)}
                        onMouseLeave={() => handleDropdownMenuLeave()}
                      >
                        <div className="py-2">
                          {link.dropdownItems && link.dropdownItems.length > 0 ? (
                            link.dropdownItems.map((item) => (
                              <a
                                key={item.id}
                                href={item.href}
                                className="block px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                              >
                                {item.label}
                              </a>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500">
                              No items available
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
