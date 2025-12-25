import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
import { LoginModal } from "../../common/LoginModal/LoginModal";
import { useAuth } from "../../../context/AuthContext";

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

const Header: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsProfileOpen(false);
      }
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
    navigate("/");
  };

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="sticky lg:relative top-0 z-[100] bg-green-700 text-white shadow-lg font-sans">
        <div className="container mx-auto px-4 py-2 w-[90%]">
          <div className="flex items-center justify-between relative">
            {/* --- Left Side (Mobile Toggle & Top Links) --- */}
            <div className="flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden items-center justify-center focus:outline-none"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <FaTimes size={24} className="text-white drop-shadow-md" />
                ) : (
                  <FaBars size={24} className="text-white drop-shadow-md" />
                )}
              </button>
            </div>

            {/* --- Center (Logo/Date) --- */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
              <div
                className="lg:hidden cursor-pointer"
                onClick={() => (window.location.href = "/")}
              >
                <span className="text-lg font-bold text-white tracking-wide">
                  The Hillside Echo
                </span>
              </div>
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

            {/* --- Right Side (Auth) --- */}
            <div className="flex items-center relative pl-4">
              {isLoading ? (
                <div className="flex items-center space-x-2 animate-pulse">
                  <div className="h-4 w-24 bg-green-500/50 rounded"></div>
                  <div className="h-8 w-8 bg-green-500/50 rounded-full"></div>
                </div>
              ) : user ? (
                // LOGGED IN VIEW
                <div
                  className="relative flex items-center gap-3"
                  ref={profileRef}
                >
                  <NavLink
                    to={`/profile/${user.id}`}
                    className="hidden md:block text-sm font-semibold text-white hover:text-green-200 transition-colors"
                    title="Go to Profile"
                  >
                    {user.name}
                  </NavLink>

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
                              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              Admin Dashboard
                            </NavLink>
                          )}

                          <NavLink
                            to="/profile"
                            className="md:hidden flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            My Profile
                          </NavLink>
                        </div>

                        <div className="border-t border-gray-100 my-1"></div>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleLogout();
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // GUEST VIEW
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

          {/* --- Mobile Menu --- */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-green-600/50 animate-fade-in-down">
              <div className="flex flex-col space-y-2 pt-4">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.id}
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
