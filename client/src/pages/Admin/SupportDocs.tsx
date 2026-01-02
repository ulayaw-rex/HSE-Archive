import React, { useState } from "react";
import {
  FaBook,
  FaChevronDown,
  FaChevronUp,
  FaCode,
  FaEnvelope,
  FaLifeRing,
  FaPhone,
  FaSearch,
  FaCopy,
  FaCheckCircle,
  FaServer,
  FaDatabase,
  FaDesktop,
} from "react-icons/fa";
import { toast } from "react-toastify";

const documentationData = [
  {
    category: "System Control & Access",
    items: [
      {
        question: "How do I use Maintenance Mode?",
        answer:
          "Go to 'Enable/Disable Modules'. Toggle the switch to 'Maintenance Mode'. This blocks all public access to the site immediately. Use this for updates or bug fixes. Remember to toggle it back to 'System Online' when finished.",
      },
      {
        question: "I locked the system. How do I log back in?",
        answer:
          "If you are logged out while the system is locked, visiting the home page will show the Maintenance Screen. Look for the yellow box that says 'Admin Access' and click the 'Login Portal' link to sign in.",
      },
      {
        question: "Why can't I see the Chatbot?",
        answer:
          "The AI Chatbot is designed for visitors. It is automatically hidden when you are logged into the Admin Dashboard to keep your workspace clean.",
      },
    ],
  },
  {
    category: "Content & Publications",
    items: [
      {
        question: "How do I upload Print Media (PDFs)?",
        answer:
          "Navigate to Content Management > Print Media. Click 'Add New', enter the Edition Title (e.g., 'August 2025 Issue'), and upload your PDF. The system will automatically generate a thumbnail preview.",
      },
      {
        question: "How do I publish a new Article?",
        answer:
          "Go to Content Management > Publications. Click 'Create New'. You can add a title, category (News, Sports, etc.), and the full body text. Once saved, it appears on the public site immediately.",
      },
      {
        question: "How does the 'Credit Request' system work?",
        answer:
          "If a user wrote an article but wasn't logged in, they can click 'Request Credit' on the public page. You will see these requests in the Admin Dashboard. Clicking 'Approve' links their profile to that article.",
      },
    ],
  },
  {
    category: "User Management",
    items: [
      {
        question: "How do I approve new staff accounts?",
        answer:
          "New registrations start with a 'Pending' status. Go to 'User Management', find the user, and click the 'Approve' button. They cannot log in until you do this.",
      },
      {
        question: "What is the difference between Admin and Staff?",
        answer:
          "Admins have full access to Settings, Security, and User Management. Staff can only manage Content (Articles/Print Media) and view their own profile stats.",
      },
    ],
  },
  {
    category: "Site Customization",
    items: [
      {
        question: "How do I update the 'Meet the Team' section?",
        answer:
          "Go to Settings > Site Settings. Here you can upload a new group photo and update the introductory text that appears on the public 'About Us' page.",
      },
    ],
  },
  {
    category: "Security & Analytics",
    items: [
      {
        question: "What do the colors mean in the Audit Log?",
        answer:
          "Red entries indicate critical actions (like Locking the System). Green entries indicate restoration (Unlocking). Blue/Black entries are standard logs.",
      },
      {
        question: "Can I download the logs?",
        answer:
          "No, currently the logs are view-only within the dashboard to ensure data integrity. You can filter them by date using the date pickers.",
      },
    ],
  },
];

const SupportDocs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"guides" | "contact">("guides");
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const supportEmail = "jtabanas@filamer.edu.ph";
  const supportPhone = "+63 994 807 0403";

  const toggleAccordion = (index: string) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const filteredDocs = documentationData
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans text-gray-800">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-2 flex items-center gap-3">
          <FaLifeRing className="text-green-700 shrink-0" />
          Support & Docs
        </h1>
        <p className="text-gray-500 text-sm md:text-lg">
          Guides, troubleshooting, and developer contact info.
        </p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("guides")}
          className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "guides"
              ? "border-green-600 text-green-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          User Manual & Guides
        </button>
        <button
          onClick={() => setActiveTab("contact")}
          className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "contact"
              ? "border-green-600 text-green-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Contact Developer
        </button>
      </div>

      {activeTab === "guides" && (
        <div className="max-w-4xl mx-auto md:mx-0">
          <div className="relative mb-8">
            <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search help..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredDocs.length > 0 ? (
            filteredDocs.map((cat, catIndex) => (
              <div key={catIndex} className="mb-8">
                <h3 className="text-base md:text-lg font-bold text-gray-700 mb-3 uppercase tracking-wider border-l-4 border-green-500 pl-3">
                  {cat.category}
                </h3>
                <div className="space-y-3">
                  {cat.items.map((item, itemIndex) => {
                    const key = `${catIndex}-${itemIndex}`;
                    const isOpen = openIndex === key;
                    return (
                      <div
                        key={itemIndex}
                        className={`bg-white border rounded-lg transition-all ${
                          isOpen
                            ? "border-green-200 shadow-md"
                            : "border-gray-200 hover:border-green-200"
                        }`}
                      >
                        <button
                          onClick={() => toggleAccordion(key)}
                          className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
                        >
                          <span
                            className={`font-semibold text-sm md:text-base pr-4 ${
                              isOpen ? "text-green-800" : "text-gray-700"
                            }`}
                          >
                            {item.question}
                          </span>
                          {isOpen ? (
                            <FaChevronUp className="text-green-600 shrink-0" />
                          ) : (
                            <FaChevronDown className="text-gray-400 shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="p-4 pt-0 text-gray-600 text-sm leading-relaxed border-t border-gray-100 mt-2 bg-green-50/30 rounded-b-lg">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-400">
              <FaBook className="mx-auto text-4xl mb-2 opacity-20" />
              <p>No documentation found for "{searchQuery}".</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "contact" && (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto mt-4 md:mt-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-green-700 p-6 text-white text-center">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <FaEnvelope className="text-3xl text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold">Contact Support</h3>
              <p className="text-green-100 text-xs md:text-sm mt-1 opacity-90">
                Technical Issues • Bug Reports • System Failure
              </p>
            </div>

            <div className="p-6 md:p-8">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 transition-colors hover:border-green-200 text-center md:text-left">
                  <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                    <FaEnvelope />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase font-bold">
                      Email Address
                    </p>
                    <a
                      href={`mailto:${supportEmail}`}
                      className="text-gray-900 font-medium hover:text-green-700 transition-colors break-all md:break-normal block"
                    >
                      {supportEmail}
                    </a>
                  </div>
                  <button
                    onClick={() => copyToClipboard(supportEmail)}
                    className="text-gray-400 hover:text-gray-600 p-2"
                    title="Copy Email"
                  >
                    <FaCopy />
                  </button>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 transition-colors hover:border-green-200 text-center md:text-left">
                  <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                    <FaPhone />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase font-bold">
                      Phone / Mobile
                    </p>
                    <a
                      href={`tel:${supportPhone}`}
                      className="text-gray-900 font-medium hover:text-green-700 transition-colors block"
                    >
                      {supportPhone}
                    </a>
                  </div>
                  <button
                    onClick={() => copyToClipboard(supportPhone)}
                    className="text-gray-400 hover:text-gray-600 p-2"
                    title="Copy Number"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  Response Time: Within 24 Hours
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 text-gray-300 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>

            <div className="flex flex-col md:flex-row items-center justify-between mb-6 relative z-10 gap-4 text-center md:text-left">
              <div className="flex items-center gap-3">
                <FaCode className="text-2xl text-green-400" />
                <h3 className="text-xl font-bold text-white">
                  System Information
                </h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
                <FaCheckCircle className="text-green-500 text-sm" />
                <span className="text-xs font-bold text-white">
                  System Healthy
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 relative z-10">
              <div className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-lg md:bg-transparent md:p-0">
                <FaDesktop className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase">Version</p>
                  <p className="text-white font-medium">v1.0.2 (Beta)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-lg md:bg-transparent md:p-0">
                <FaServer className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase">Backend</p>
                  <p className="text-white font-medium">Laravel 10 (PHP)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-lg md:bg-transparent md:p-0">
                <FaCode className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase">Frontend</p>
                  <p className="text-white font-medium">React + TypeScript</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-lg md:bg-transparent md:p-0">
                <FaDatabase className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase">Database</p>
                  <p className="text-white font-medium">MySQL</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-800 text-xs text-gray-500 text-center relative z-10">
              Last System Update: January 2026
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportDocs;
