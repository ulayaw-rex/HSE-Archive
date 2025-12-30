import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaFacebook,
  FaInstagram,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";
import Logo from "../../../assets/LOGO.png";
import AxiosInstance from "../../../AxiosInstance";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

type NavigationLink = {
  id: string;
  text: string;
  href: string;
};

const leftNavigationLinks: NavigationLink[] = [
  { id: "news", text: "NEWS", href: "/news" },
  { id: "sports", text: "SPORTS", href: "/sports" },
  { id: "opinions", text: "OPINIONS", href: "/opinion" },
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
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error("Please enter a message.");
      return;
    }

    setSending(true);

    try {
      await AxiosInstance.post("/contact-us", {
        email,
        message,
      });

      setShowSuccessModal(true);

      setEmail("");
      setMessage("");
    } catch (error) {
      console.error(error);
      const err = error as AxiosError;

      if (err.response && err.response.status === 422) {
        toast.warning("Invalid email address. Please check the domain.");
      } else if (err.response && err.response.status === 429) {
        toast.error("Too many requests. Please try again in a few minutes.");
      } else {
        toast.error("Failed to send message. Please try again later.");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowSuccessModal(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center transform transition-all scale-100">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes size={18} />
            </button>

            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <FaCheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Message Sent!
            </h3>

            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              Thank you for reaching out. We have received your message and will
              get back to you shortly.
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 px-4 bg-green-800 hover:bg-green-900 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Okay, Got it
            </button>
          </div>
        </div>
      )}

      <footer className="bg-gradient-to-b from-green-800 to-green-900 text-white shadow-2xl relative z-10">
        <div className="container mx-auto px-6 py-16 w-[90%]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="flex flex-col items-start space-y-6">
              <div
                onClick={() => (window.location.href = "/")}
                className="cursor-pointer"
              >
                <img
                  src={Logo}
                  alt="Logo"
                  className="h-12 w-auto hover:scale-105 transition-transform"
                />
              </div>
              <p className="text-sm text-gray-200 leading-relaxed max-w-sm">
                The Hillside Echo is student publication, bringing you the
                latest news, sports, and opinions.
              </p>
            </div>

            <div className="flex justify-center lg:justify-start">
              <div className="grid grid-cols-2 gap-x-16 gap-y-3">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
                    Main Sections
                  </h4>
                  {leftNavigationLinks.map((link) => (
                    <NavLink
                      key={link.id}
                      to={link.href}
                      className={({ isActive }) =>
                        `block text-sm font-medium uppercase tracking-wide hover:text-green-200 transition-all ${
                          isActive ? "text-green-200 font-semibold" : ""
                        }`
                      }
                    >
                      {link.text}
                    </NavLink>
                  ))}
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
                    Resources
                  </h4>
                  {rightNavigationLinks.map((link) => (
                    <NavLink
                      key={link.id}
                      to={link.href}
                      className={({ isActive }) =>
                        `block text-sm font-medium uppercase tracking-wide hover:text-green-200 transition-all ${
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

            <div className="flex flex-col space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-2">
                  Reach Out / Send a Tip
                </h4>
                <p className="text-sm text-gray-200 leading-relaxed">
                  Have a story idea? Drop us a message.
                </p>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 text-gray-700 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
                  required
                  disabled={sending}
                />
                <textarea
                  placeholder="Write your message..."
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 text-gray-700 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 resize-none disabled:opacity-50"
                  required
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full px-8 py-3 bg-white text-green-800 font-semibold rounded-lg hover:bg-gray-100 shadow-sm hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="border-t border-green-700/30 mx-6"></div>

        <div className="container mx-auto px-6 py-8 w-[90%]">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="text-sm text-gray-300 text-center md:text-left">
              <p className="font-medium">
                © 2025 The Hillside Echo All Rights Reserved
              </p>
            </div>
            <div className="flex space-x-6">
              <a
                href="https://www.facebook.com/thehillsidecho"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-green-700 transition-all hover:scale-110"
              >
                <FaFacebook />
              </a>
              <a
                href="https://www.instagram.com/thehillsideecho/"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-green-700 transition-all hover:scale-110"
              >
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
