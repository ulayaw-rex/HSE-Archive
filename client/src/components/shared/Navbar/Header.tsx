import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  FaUserCircle,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaUser,
  FaSignOutAlt,
  FaCog,
} from "react-icons/fa";
import { LoginModal } from "../../common/LoginModal/LoginModal";
import { useAuth } from "../../../context/AuthContext";

type SubLink = {
  label: string;
  href: string;
};

type NavigationLink = {
  id: string;
  label: string;
  href: string;
  subLinks?: SubLink[];
};

const navLinks: NavigationLink[] = [
  {
    id: "news",
    label: "News",
    href: "/",
    subLinks: [
      { label: "University", href: "/news/university" },
      { label: "Local", href: "/news/local" },
      { label: "National", href: "/news/national" },
      { label: "Entertainment", href: "/news/entertainment" },
      { label: "Sci-Tech", href: "/news/sci-tech" },
    ],
  },
  { id: "sports", label: "Sports", href: "/sports" },
  { id: "opinions", label: "Opinion", href: "/opinion" },
  { id: "literary", label: "Literary", href: "/literary" },
  { id: "print-media", label: "Print Media", href: "/print-media" },
  { id: "about", label: "About", href: "/about" },
];

const Header: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isNewsDropdownOpen, setIsNewsDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsProfileOpen(false);
    };
    if (isProfileOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isProfileOpen]);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen)
      window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [isProfileOpen]);

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isMobileMenuOpen) setIsNewsDropdownOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setIsMobileMenuOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header className="sticky lg:relative top-0 z-[100] bg-green-700 text-white shadow-lg font-sans">
        <div className="container mx-auto px-4 py-2 w-[90%]">
          <div className="flex items-center justify-between relative">
            <div className="flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden items-center justify-center focus:outline-none p-1 rounded-md hover:bg-green-600 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <FaTimes size={24} className="text-white drop-shadow-md" />
                ) : (
                  <FaBars size={24} className="text-white drop-shadow-md" />
                )}
              </button>
            </div>

            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
              <Link to="/" className="lg:hidden cursor-pointer">
                <span className="text-lg font-bold text-white tracking-wide">
                  The Hillside Echo
                </span>
              </Link>

              <div className="hidden lg:block">
                <span className="text-sm text-green-50 font-medium tracking-wide">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center relative pl-4">
              {isLoading ? (
                <div className="flex items-center space-x-2 animate-pulse">
                  <div className="hidden md:block h-4 w-24 bg-green-500/50 rounded"></div>
                  <div className="h-8 w-8 bg-green-500/50 rounded-full"></div>
                </div>
              ) : user ? (
                <div
                  className="relative flex items-center gap-3"
                  ref={profileRef}
                >
                  <span className="hidden md:block text-sm font-semibold text-white select-none">
                    {user.name}
                  </span>

                  <button
                    onClick={() => setIsProfileOpen((prev) => !prev)}
                    className={`flex items-center text-green-200 hover:text-white transition-colors duration-200 focus:outline-none ${
                      isProfileOpen ? "text-white" : ""
                    }`}
                  >
                    <FaUserCircle size={26} />
                    <FaChevronDown
                      size={12}
                      className={`ml-1 transition-transform duration-200 ${
                        isProfileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 z-[101] transform transition-all duration-200 ease-out origin-top-right">
                      <div className="absolute -top-2 right-2 w-4 h-4 bg-white transform rotate-45 border-l border-t border-gray-100"></div>

                      <div className="relative bg-white rounded-xl overflow-hidden py-1">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                            Signed in as
                          </p>
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {user.email}
                          </p>
                        </div>

                        <div className="py-1">
                          {user.role === "admin" && (
                            <NavLink
                              to="/admin"
                              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors group"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <FaCog className="mr-3 text-gray-400 group-hover:text-green-600" />
                              Admin Dashboard
                            </NavLink>
                          )}

                          <NavLink
                            to={`/profile/${user.id}`}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors group"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <FaUser className="mr-3 text-gray-400 group-hover:text-green-600" />
                            My Profile
                          </NavLink>
                        </div>

                        <div className="border-t border-gray-100 my-1"></div>

                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium group"
                        >
                          <FaSignOutAlt className="mr-3 text-red-400 group-hover:text-red-600" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center space-x-2 text-sm font-medium text-green-100 hover:text-white transition-colors duration-200 bg-green-800/30 hover:bg-green-800/50 px-3 py-1.5 rounded-full"
                >
                  <span>Log in</span>
                  <FaUserCircle size={16} />
                </button>
              )}
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-green-600/50 animate-fade-in-down">
              {user ? (
                <div className="pt-4 pb-2 px-2 border-b border-green-600/30 mb-2">
                  <div className="flex items-center space-x-3 mb-3 px-2">
                    <div className="bg-green-800 rounded-full p-2">
                      <FaUserCircle size={24} className="text-green-100" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-green-200 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-1">
                    <NavLink
                      to={`/profile/${user.id}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-3 py-2 text-sm text-green-100 hover:bg-green-800 rounded-md transition-colors"
                    >
                      <FaUser className="mr-2 text-green-300" /> My Profile
                    </NavLink>

                    {user.role === "admin" && (
                      <NavLink
                        to="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center px-3 py-2 text-sm text-green-100 hover:bg-green-800 rounded-md transition-colors"
                      >
                        <FaCog className="mr-2 text-green-300" /> Admin
                        Dashboard
                      </NavLink>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-3 py-2 text-sm text-red-300 hover:bg-red-900/20 rounded-md transition-colors"
                    >
                      <FaSignOutAlt className="mr-2" /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 pb-4 px-2 border-b border-green-600/30 mb-2">
                  <button
                    onClick={() => {
                      setIsLoginModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-white text-green-800 font-bold py-2 rounded-lg shadow-sm hover:bg-green-50 transition-colors"
                  >
                    Log In / Sign Up
                  </button>
                </div>
              )}

              <div className="pt-2 pb-2 px-2">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-green-800 text-white placeholder-green-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-300"
                  >
                    <FaSearch />
                  </button>
                </form>
              </div>

              <div className="flex flex-col space-y-1 pt-2">
                {navLinks.map((link) => (
                  <div key={link.id}>
                    {link.subLinks ? (
                      <div>
                        <button
                          onClick={() =>
                            setIsNewsDropdownOpen(!isNewsDropdownOpen)
                          }
                          className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm transition-all duration-200 
                            ${
                              isNewsDropdownOpen
                                ? "bg-green-800 text-white font-semibold"
                                : "text-green-100 hover:bg-green-800/50 hover:text-white"
                            }`}
                        >
                          <span>{link.label}</span>
                          {isNewsDropdownOpen ? (
                            <FaChevronUp size={12} />
                          ) : (
                            <FaChevronDown size={12} />
                          )}
                        </button>

                        {isNewsDropdownOpen && (
                          <div className="flex flex-col space-y-1 mt-1 bg-green-800/30 rounded-lg overflow-hidden">
                            {link.subLinks.map((subLink) => (
                              <NavLink
                                key={subLink.label}
                                to={subLink.href}
                                className={({ isActive }) =>
                                  `block px-8 py-2 text-sm border-l-4 transition-all duration-200 ${
                                    isActive
                                      ? "border-white bg-green-800/50 text-white"
                                      : "border-transparent text-green-200 hover:text-white hover:bg-green-800/30"
                                  }`
                                }
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {subLink.label}
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <NavLink
                        to={link.href}
                        className={({ isActive }) =>
                          `block px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isActive
                              ? "bg-green-800 text-white font-semibold"
                              : "text-green-100 hover:bg-green-800/50 hover:text-white"
                          }`
                        }
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                      </NavLink>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};

export default Header;
