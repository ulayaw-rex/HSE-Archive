import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { FaSearch, FaChevronDown } from "react-icons/fa";
import Logo from "../../../assets/LOGO.png";
import ThemeToggle from "../../common/ThemeToggle";

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
      { id: "university", label: "University", href: "/category/university" },
      { id: "local", label: "Local", href: "/category/local" },
      { id: "national", label: "National", href: "/category/national" },
      {
        id: "entertainment",
        label: "Entertainment",
        href: "/category/entertainment",
      },
      { id: "sci-tech", label: "Sci-Tech", href: "/category/sci-tech" },
    ],
  },
  { id: "sports", label: "Sports", href: "/category/sports" },
  { id: "opinion", label: "Opinion", href: "/category/opinions" },
  { id: "literary", label: "Literary", href: "/category/literary" },
  { id: "print-media", label: "Print Media", href: "/print-media" },
  {
    id: "about",
    label: "About",
    href: "/about",
  },
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleMouseEnter = (linkId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setHoveredDropdown(linkId);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setHoveredDropdown(null);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="hidden lg:block bg-green-800 dark:bg-gray-900/90 dark:backdrop-blur-md border-b border-white/5 dark:border-gray-800 transition-colors duration-200">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center relative">
            <Link to="/" className="cursor-pointer">
              <img
                src={Logo}
                alt="The Hillside Echo Logo"
                className="h-[60px] w-auto m-2 transform transition-transform duration-200 hover:scale-105"
              />
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden lg:block sticky top-12 z-[100] bg-green-700 dark:bg-gray-900/80 dark:backdrop-blur-lg text-white shadow-xl border-b border-white/5 dark:border-gray-800 transition-colors duration-200">
        <div className="container mx-auto px-4 py-3 w-[90%]">
          <div className="flex items-center justify-between">
            <nav className="flex items-center flex-1">
              <div className="flex items-center justify-center space-x-13 w-full">
                {navLinks.map((link) => (
                  <div
                    key={link.id}
                    className="relative group h-full"
                    onMouseEnter={() =>
                      link.hasDropdown && handleMouseEnter(link.id)
                    }
                    onMouseLeave={handleMouseLeave}
                  >
                    <NavLink
                      to={link.href}
                      className={({ isActive }) => {
                        const isDropdownOpen = hoveredDropdown === link.id;

                        return `
                          text-white hover:text-green-200 transition-all duration-200 
                          font-semibold text-base uppercase tracking-wider 
                          px-4 py-2 rounded-md flex items-center gap-1 whitespace-nowrap
                          ${
                            isActive || isDropdownOpen
                              ? "bg-green-800 dark:bg-green-500/20 text-green-100 dark:text-green-400 shadow-inner"
                              : "hover:bg-green-600 dark:hover:bg-gray-800 dark:hover:text-green-400"
                          }
                        `;
                      }}
                    >
                      {link.label}
                      {link.hasDropdown && (
                        <FaChevronDown
                          className={`text-xs transition-transform duration-300 ${
                            hoveredDropdown === link.id ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </NavLink>

                    {link.hasDropdown && hoveredDropdown === link.id && (
                      <div className="absolute top-full left-0 pt-2 w-56 z-50">
                        <div className="w-full bg-white dark:bg-gray-900/95 dark:backdrop-blur-xl border border-green-600 dark:border-gray-700/50 rounded-lg shadow-xl overflow-hidden animate-fadeIn transition-colors duration-200">
                          <div className="py-1">
                            {link.dropdownItems?.map((item) => (
                              <NavLink
                                key={item.id}
                                to={item.href}
                                className={({ isActive }) =>
                                  `block px-4 py-3 text-sm transition-colors duration-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0 cursor-pointer
                                  ${
                                    isActive
                                      ? "!bg-green-100 dark:!bg-green-900/30 !text-green-900 dark:!text-green-400 font-bold"
                                      : "!text-gray-700 dark:!text-gray-300 hover:!bg-green-50 dark:hover:!bg-gray-800 hover:!text-green-800 dark:hover:!text-green-400"
                                  }`
                                }
                              >
                                {item.label}
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </nav>

            <div className="flex items-center ml-4 gap-4">
              <ThemeToggle />
              <form onSubmit={handleSearch} className="relative group">
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaSearch
                      className={`text-lg transition-colors duration-300 z-10 ${
                        isSearchFocused
                          ? "text-green-700"
                          : "text-green-200 group-hover:text-green-700"
                      }`}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className={`
                      w-8 group-hover:w-48 focus:w-48
                      pl-9 pr-3 py-1.5
                      rounded-md border border-transparent
                      transition-all duration-300 ease-in-out cursor-pointer
                      focus:outline-none focus:ring-2 focus:ring-green-400
                      bg-transparent
                      hover:bg-white/10 dark:hover:bg-gray-800/80
                      focus:bg-white/10 dark:focus:bg-gray-800/80
                      hover:border-white/20 dark:hover:border-gray-700
                      focus:border-white/20 dark:focus:border-green-500
                      placeholder-transparent
                      focus:placeholder-green-100/50 dark:focus:placeholder-gray-400
                      hover:placeholder-green-100/50 dark:hover:placeholder-gray-400
                      ${isSearchFocused ? "text-white" : "text-white"}
                    `}
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
