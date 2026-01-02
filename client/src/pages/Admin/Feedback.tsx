import React, { useState, useEffect } from "react";
import AxiosInstance from "../../AxiosInstance";
import {
  FaTrash,
  FaEnvelopeOpen,
  FaEnvelope,
  FaReply,
  FaSearch,
  FaCheckCircle,
  FaSpinner,
  FaSync,
  FaExclamationTriangle,
  FaTimes,
  FaPaperPlane,
  FaArrowLeft,
} from "react-icons/fa";
import { toast } from "react-toastify";

interface FeedbackItem {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
  is_read: boolean;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail: string;
  recipientName: string;
  originalSubject: string | null;
  onSubmit: (subject: string, message: string) => void;
  isSending: boolean;
}

const DeleteConfirmationModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FaTimes />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-50 p-4 rounded-full mb-4">
            <FaExclamationTriangle className="text-red-600 text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Delete Message?
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            This action cannot be undone.
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 font-bold text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 text-white font-bold"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReplyModal: React.FC<ReplyModalProps> = ({
  isOpen,
  onClose,
  recipientEmail,
  recipientName,
  originalSubject,
  onSubmit,
  isSending,
}) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSubject(`Re: ${originalSubject || "Inquiry"}`);
      setMessage(`Hi ${recipientName || "there"},\n\n`);
    }
  }, [isOpen, originalSubject, recipientName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative flex flex-col h-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaReply className="text-blue-600" /> Reply to Message
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
            <span className="font-bold text-gray-500 uppercase text-xs mr-2">
              To:
            </span>
            <span className="text-gray-800 font-medium">
              {recipientName} &lt;{recipientEmail}&gt;
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Subject
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="flex-1 min-h-[150px]">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Message
            </label>
            <textarea
              className="w-full h-full min-h-[200px] border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSending}
            className="px-5 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(subject, message)}
            disabled={isSending || !message.trim()}
            className={`px-5 py-2 rounded-lg font-bold text-white flex items-center gap-2 shadow-sm ${
              isSending
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSending ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaPaperPlane />
            )}
            {isSending ? "Sending..." : "Send Reply"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Feedback: React.FC = () => {
  const [messages, setMessages] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<FeedbackItem | null>(
    null
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);

  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);

  const fetchMessages = async (isManualRefresh = false) => {
    if (isManualRefresh) setLoading(true);
    try {
      const res = await AxiosInstance.get("/admin/contact-submissions");
      setMessages(res.data);
      if (isManualRefresh) toast.success("Inbox updated");
    } catch (error) {
      toast.error("Failed to load messages", { toastId: "fetchError" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleView = async (msg: FeedbackItem) => {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      try {
        await AxiosInstance.put(`/admin/contact-submissions/${msg.id}/read`);
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m))
        );
      } catch (error) {
        console.error("Read status error");
      }
    }
  };

  const handleBackToList = () => {
    setSelectedMessage(null);
  };

  const initiateDelete = (id: number) => {
    setMessageToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (messageToDelete === null) return;
    try {
      await AxiosInstance.delete(
        `/admin/contact-submissions/${messageToDelete}`
      );
      setMessages((prev) => prev.filter((m) => m.id !== messageToDelete));
      if (selectedMessage?.id === messageToDelete) setSelectedMessage(null);
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete", { toastId: "deleteError" });
    } finally {
      setIsDeleteModalOpen(false);
      setMessageToDelete(null);
    }
  };

  const initiateReply = () => {
    setIsReplyModalOpen(true);
  };

  const handleSendReply = async (subject: string, message: string) => {
    if (!selectedMessage) return;
    setIsSendingReply(true);

    try {
      await AxiosInstance.post(
        `/admin/contact-submissions/${selectedMessage.id}/reply`,
        { subject, message }
      );
      toast.success("Reply sent successfully!");
      setIsReplyModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send reply. Check server logs.");
    } finally {
      setIsSendingReply(false);
    }
  };

  const filteredMessages = messages.filter((m) => {
    const term = search.toLowerCase();
    return (
      (m.name?.toLowerCase() || "").includes(term) ||
      (m.email?.toLowerCase() || "").includes(term) ||
      (m.subject?.toLowerCase() || "").includes(term)
    );
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen flex flex-col md:flex-row gap-6 h-[calc(100vh-64px)]">
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />

      <ReplyModal
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        recipientEmail={selectedMessage?.email || ""}
        recipientName={selectedMessage?.name || "Guest"}
        originalSubject={selectedMessage?.subject || ""}
        onSubmit={handleSendReply}
        isSending={isSendingReply}
      />

      <div
        className={`w-full md:w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 flex-col overflow-hidden ${
          selectedMessage ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaEnvelopeOpen className="text-green-600" /> Inbox
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h2>
            <button
              onClick={() => fetchMessages(true)}
              className="text-gray-400 hover:text-green-600"
            >
              <FaSync className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && messages.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <FaSpinner className="animate-spin mx-auto mb-2" /> Loading...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No messages found.
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleView(msg)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedMessage?.id === msg.id
                    ? "bg-green-50 border-l-4 border-l-green-600"
                    : "border-l-4 border-l-transparent"
                } ${!msg.is_read ? "bg-white" : "bg-gray-50/50"}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={`text-sm ${
                      !msg.is_read
                        ? "font-bold text-gray-900"
                        : "font-medium text-gray-600"
                    }`}
                  >
                    {msg.name || "Anonymous"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div
                  className={`text-sm mb-1 truncate ${
                    !msg.is_read ? "font-bold text-green-700" : "text-gray-700"
                  }`}
                >
                  {msg.subject || "(No Subject)"}
                </div>
                <div className="text-xs text-gray-500 truncate opacity-80">
                  {msg.message}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div
        className={`w-full md:flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 flex-col relative overflow-hidden ${
          selectedMessage ? "flex" : "hidden md:flex"
        }`}
      >
        {selectedMessage ? (
          <>
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackToList}
                  className="md:hidden p-2 text-gray-500 hover:text-green-600 bg-gray-100 rounded-lg"
                >
                  <FaArrowLeft />
                </button>

                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl shrink-0">
                  {(selectedMessage.name || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">
                    {selectedMessage.subject || "No Subject"}
                  </h1>
                  <div className="text-xs md:text-sm text-gray-500 mt-1 break-all">
                    From:{" "}
                    <span className="font-medium text-gray-900">
                      {selectedMessage.name || "Anonymous"}
                    </span>{" "}
                    &lt;{selectedMessage.email}&gt;
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0 ml-4">
                <button
                  onClick={initiateReply}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Reply"
                >
                  <FaReply size={20} />
                </button>
                <button
                  onClick={() => initiateDelete(selectedMessage.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <FaTrash size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto text-gray-700 leading-relaxed whitespace-pre-wrap font-sans text-sm md:text-base">
              {selectedMessage.message}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-2">
              <FaCheckCircle className="text-green-500" /> Received on{" "}
              {new Date(selectedMessage.created_at).toLocaleString()}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
            <div className="bg-gray-50 p-6 rounded-full mb-4">
              <FaEnvelope className="text-5xl opacity-20" />
            </div>
            <p className="text-lg font-medium text-gray-400 text-center">
              Select a message to read
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;
