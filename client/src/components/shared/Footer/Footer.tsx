import React from "react";
import { NavLink } from "react-router-dom";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import Logo from "../../../assets/LOGO.png";

// Types for footer data
type NavigationLink = {
  id: string;
  text: string;
  href: string;
};

// Footer data - matching navbar links
const leftNavigationLinks: NavigationLink[] = [
  { id: "news", text: "NEWS", href: "/news" },
  { id: "sports", text: "SPORTS", href: "/sports" },
  { id: "opinions", text: "OPINIONS", href: "/opinions" },
  { id: "literary", text: "LITERARY", href: "/literary" },
  { id: "print-media", text: "PRINT MEDIA", href: "/print-media" },
  { id: "about", text: "ABOUT", href: "/about" },
];

const rightNavigationLinks: NavigationLink[] = [
  { id: "ads", text: "ADS", href: "/ads" },
  { id: "tips", text: "TIPS", href: "/tips" },
  { id: "alumni", text: "ALUMNI", href: "/alumni" },
  { id: "contact", text: "CONTACT", href: "/contact" },
];

const Footer: React.FC = () => {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Newsletter subscription submitted");
  };

  return (
    <footer className="bg-gradient-to-b from-green-800 to-green-900 text-white shadow-2xl">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Branding */}
          <div className="flex flex-col items-start space-y-6">
            {/* 👇 LOGO SECTION UPDATED HERE */}
            <div
              onClick={() => (window.location.href = "/")}
              className="cursor-pointer"
            >
              <img
                src={Logo}
                alt="The Hillside Echo Logo"
                className="h-12 w-auto transform transition-transform duration-200 hover:scale-105"
              />
            </div>

            {/* Description */}
            <p className="text-sm text-gray-200 leading-relaxed max-w-sm">
              The Hillside Echo is student publication, bringing you the latest
              news, sports, and opinions from our community. Stay connected with
              the pulse of our school.
            </p>
          </div>

          {/* Middle Column - Navigation Links */}
          <div className="flex justify-center lg:justify-start">
            <div className="grid grid-cols-2 gap-x-16 gap-y-3">
              {/* Left Navigation Column */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
                  Main Sections
                </h4>
                {leftNavigationLinks.map((link) => (
                  <NavLink
                    key={link.id}
                    to={link.href}
                    className={({ isActive }) =>
                      `block text-sm font-medium uppercase tracking-wide hover:text-green-200 transition-all duration-200 hover:translate-x-1 ${
                        isActive ? "text-green-200 font-semibold" : ""
                      }`
                    }
                  >
                    {link.text}
                  </NavLink>
                ))}
              </div>

              {/* Right Navigation Column */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
                  Resources
                </h4>
                {rightNavigationLinks.map((link) => (
                  <NavLink
                    key={link.id}
                    to={link.href}
                    className={({ isActive }) =>
                      `block text-sm font-medium uppercase tracking-wide hover:text-green-200 transition-all duration-200 hover:translate-x-1 ${
                        isActive ? "text-green-200 font-semibold" : ""
                      }`
                    }
                  >
                    {link.text}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Newsletter Signup */}
          <div className="flex flex-col space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-2">Stay Connected</h4>
              <p className="text-sm text-gray-200 leading-relaxed">
                Stay updated with The Hillside Echo?
                <br />
                Subscribe for the latest updates.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 text-gray-700 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-green-800 shadow-sm transition-all duration-200"
                  required
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-white text-green-800 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Separator Line */}
      <div className="border-t border-green-700/30 mx-6"></div>

      {/* Bottom Section - Copyright & Social Media */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* Copyright */}
          <div className="text-sm text-gray-300 text-center md:text-left">
            <p className="font-medium">
              © 2025 The Hillside Echo All Rights Reserved
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Designed and developed for student journalism excellence
            </p>
          </div>

          {/* Social Media Icons */}
          <div className="flex space-x-6">
            <a
              href={"https://www.facebook.com/thehillsidecho"}
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-green-700 transition-all duration-200 transform hover:scale-110"
            >
              <FaFacebook />
            </a>
            <a
              href={"https://www.instagram.com/thehillsideecho/"}
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-green-700 transition-all duration-200 transform hover:scale-110"
            >
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
