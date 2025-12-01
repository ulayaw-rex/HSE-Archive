import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
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

    if (isProfileOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileOpen]);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      window.addEventListener("pointerdown", handlePointerDown);
    }

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
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
      <header className="sticky lg:relative top-0 z-[100] bg-green-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-2 w-[90%]">
          <div className="flex items-center justify-between relative">
            <div className="flex items-center">
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

            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
              <div
                className="lg:hidden"
                onClick={() => (window.location.href = "/")}
              >
                <span className="text-lg font-bold text-white">
                  The Hillside Echo
                </span>
              </div>
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

            <div className="flex items-center relative">
              {isLoading ? (
                <div className="flex items-center space-x-2 animate-pulse">
                  <div className="h-4 w-24 bg-green-500/50 rounded"></div>
                  <div className="h-5 w-5 bg-green-500/50 rounded-full"></div>
                </div>
              ) : user ? (
                <div className="relative" ref={profileRef}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsProfileOpen((prev) => !prev);
                    }}
                    className="flex items-center space-x-2 text-sm text-green-200 hover:text-white transition-colors duration-200"
                  >
                    <span className="hidden md:inline">{user.name}</span>
                    <FaUserCircle size={18} />
                  </a>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-green-200 z-[101]">
                      <div className="px-4 py-3 text-sm border-b border-green-100 font-semibold !text-green-900">
                        {user.name || user.email}
                      </div>

                      {user.role === "admin" && (
                        <NavLink
                          to="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-4 py-2 text-sm !text-gray-700 hover:!bg-green-50 hover:!text-green-700 transition-colors"
                        >
                          Admin Dashboard
                        </NavLink>
                      )}

                      <div className="border-t border-green-100"></div>

                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleLogout();
                        }}
                        className="block px-4 py-2 text-sm !text-red-600 hover:!bg-red-50 font-medium transition-colors"
                      >
                        Logout
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLoginModalOpen(true);
                  }}
                  className="flex items-center space-x-2 text-sm text-green-200 hover:text-white transition-colors duration-200"
                >
                  <span>Log in</span>
                  <FaUserCircle size={16} />
                </a>
              )}
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-green-700">
              <div className="flex flex-col space-y-3 pt-4">
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
                <div className="border-t border-green-700 my-3"></div>
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

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};

export default Header;
