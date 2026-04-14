import React, { useState } from "react";
import {
  FaBook,
  FaChevronDown,
  FaChevronUp,
  FaEnvelope,
  FaLifeRing,
  FaPhone,
  FaSearch,
  FaCopy,
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
          item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen font-sans text-gray-800 dark:text-gray-200 transition-colors duration-200">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-2 flex items-center gap-3 transition-colors">
          <FaLifeRing className="text-green-700 shrink-0" />
          Support & Docs
        </h1>
        <p className="text-gray-500 text-sm md:text-lg">
          Guides, troubleshooting, and developer contact info.
        </p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto no-scrollbar transition-colors">
        <button
          onClick={() => setActiveTab("guides")}
          className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "guides"
              ? "border-green-600 text-green-700 dark:text-green-400"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          User Manual & Guides
        </button>
        <button
          onClick={() => setActiveTab("contact")}
          className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "contact"
              ? "border-green-600 text-green-700 dark:text-green-400"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
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
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm text-sm transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredDocs.length > 0 ? (
            filteredDocs.map((cat, catIndex) => (
              <div key={catIndex} className="mb-8">
                <h3 className="text-base md:text-lg font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider border-l-4 border-green-500 pl-3 transition-colors">
                  {cat.category}
                </h3>
                <div className="space-y-3">
                  {cat.items.map((item, itemIndex) => {
                    const key = `${catIndex}-${itemIndex}`;
                    const isOpen = openIndex === key;
                    return (
                      <div
                        key={itemIndex}
                        className={`bg-white dark:bg-gray-800 border rounded-lg transition-all ${
                          isOpen
                            ? "border-green-200 dark:border-green-800 shadow-md"
                            : "border-gray-200 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-700"
                        }`}
                      >
                        <button
                          onClick={() => toggleAccordion(key)}
                          className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
                        >
                          <span
                            className={`font-semibold text-sm md:text-base pr-4 ${
                              isOpen
                                ? "text-green-800 dark:text-green-400"
                                : "text-gray-700 dark:text-gray-300"
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
                          <div className="p-4 pt-0 text-gray-600 dark:text-gray-400 text-sm leading-relaxed border-t border-gray-100 dark:border-gray-700 mt-2 bg-green-50/30 dark:bg-green-900/10 rounded-b-lg transition-colors">
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
            <div className="bg-green-700 p-6 text-white text-center">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <FaEnvelope className="text-3xl text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold">Contact Support</h3>
              <p className="text-green-100 text-xs md:text-sm mt-1 opacity-90">
                Technical Issues • Bug Reports • System Failure
              </p>
            </div>

            <div className="p-6 md:p-8 bg-gray-50 dark:bg-gray-700 transition-colors">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-600 transition-colors hover:border-green-200 dark:hover:border-green-800 text-center md:text-left">
                  <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                    <FaEnvelope />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold transition-colors">
                      Email Address
                    </p>
                    <a
                      href={`mailto:${supportEmail}`}
                      className="text-gray-900 dark:text-gray-100 font-medium hover:text-green-700 dark:hover:text-green-400 transition-colors break-all md:break-normal block"
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

                <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-600 transition-colors hover:border-green-200 dark:hover:border-green-800 text-center md:text-left">
                  <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                    <FaPhone />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold transition-colors">
                      Phone
                    </p>
                    <a
                      href={`tel:${supportPhone}`}
                      className="text-gray-900 dark:text-gray-100 font-medium hover:text-green-700 dark:hover:text-green-400 transition-colors"
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
        </div>
      )}
    </div>
  );
};

export default SupportDocs;
