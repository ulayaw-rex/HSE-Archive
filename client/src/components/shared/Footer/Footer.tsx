import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaFacebook,
  FaInstagram,
  FaCheckCircle,
  FaTimes,
  FaExclamationTriangle,
  FaPaperPlane,
} from "react-icons/fa";
import Logo from "../../../assets/LOGO.png";
import AxiosInstance from "../../../AxiosInstance";
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

type FeedbackState = {
  isOpen: boolean;
  type: "success" | "error";
  title: string;
  message: string;
};

const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [feedback, setFeedback] = useState<FeedbackState>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const closeFeedback = () => {
    setFeedback((prev) => ({ ...prev, isOpen: false }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setFeedback({
        isOpen: true,
        type: "error",
        title: "Missing Message",
        message: "Please enter a message before sending.",
      });
      return;
    }

    setSending(true);

    try {
      await AxiosInstance.post("/contact-us", {
        email,
        message,
      });

      setFeedback({
        isOpen: true,
        type: "success",
        title: "Message Sent!",
        message:
          "Thank you for reaching out. We have received your message and will get back to you shortly.",
      });

      setEmail("");
      setMessage("");
    } catch (error) {
      console.error(error);
      const err = error as AxiosError;
      let errorMsg = "Failed to send message. Please try again later.";
      let errorTitle = "Transmission Failed";

      if (err.response && err.response.status === 422) {
        errorTitle = "Invalid Input";
        errorMsg = "Invalid email address. Please check the domain.";
      } else if (err.response && err.response.status === 429) {
        errorTitle = "Too Many Requests";
        errorMsg = "Please wait a few minutes before sending another message.";
      }

      setFeedback({
        isOpen: true,
        type: "error",
        title: errorTitle,
        message: errorMsg,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {feedback.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={closeFeedback}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center transform transition-all scale-100 border border-gray-100">
            <button
              onClick={closeFeedback}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes size={18} />
            </button>

            <div
              className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6 ${
                feedback.type === "success" ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {feedback.type === "success" ? (
                <FaCheckCircle className="h-9 w-9 text-green-600" />
              ) : (
                <FaExclamationTriangle className="h-8 w-8 text-red-600" />
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {feedback.title}
            </h3>

            <p className="text-gray-500 mb-8 text-sm leading-relaxed px-2">
              {feedback.message}
            </p>

            <button
              onClick={closeFeedback}
              className={`w-full py-3 px-4 font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-white ${
                feedback.type === "success"
                  ? "bg-green-800 hover:bg-green-900"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {feedback.type === "success" ? "Okay, Got it" : "Try Again"}
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
                The Hillside Echo is the student publication, bringing you the
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
                  className="w-full px-4 py-3 text-gray-700 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-60 transition-all"
                  required
                  disabled={sending}
                />
                <textarea
                  placeholder="Write your message..."
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 text-gray-700 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 resize-none disabled:opacity-60 transition-all"
                  required
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full px-8 py-3 bg-white text-green-800 font-bold rounded-lg hover:bg-green-50 shadow-sm hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <span className="animate-pulse">Sending...</span>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <FaPaperPlane size={12} />
                    </>
                  )}
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
