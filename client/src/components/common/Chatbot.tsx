import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaPaperPlane, FaTimes, FaCommentDots } from "react-icons/fa";
import AxiosInstance from "../../AxiosInstance";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm the Hillside Echo AI. Ask me anything about the organization, submitting articles, or our office!",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput("");

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: userText, sender: "user" },
    ]);

    setIsTyping(true);

    try {
      const historyPayload = messages.map((msg) => ({
        role: msg.sender === "bot" ? "model" : "user",
        text: msg.text,
      }));

      const response = await AxiosInstance.post("/chat", {
        message: userText,
        history: historyPayload,
      });

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: response.data.reply, sender: "bot" },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
        {isOpen && (
          <div
            className="
              fixed inset-0 w-full h-full bg-white z-[10000] flex flex-col
              md:absolute md:bottom-[calc(100%+1rem)] md:right-0 md:inset-auto
              md:w-96 md:h-[500px] md:rounded-2xl md:shadow-2xl md:border md:border-gray-200 
              animate-fadeIn overflow-hidden
            "
          >
            <div className="bg-green-800 text-white p-4 flex justify-between items-center shadow-md flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                  <FaRobot className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm md:text-base">Echo AI</h3>
                  <span className="text-xs text-green-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                    Online
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
                aria-label="Close chat"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 custom-scrollbar space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-sm md:text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-green-700 text-white rounded-tr-none"
                        : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="p-3 bg-white border-t border-gray-100 flex gap-2 flex-shrink-0 safe-area-bottom"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-shadow"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="bg-green-700 text-white p-3 rounded-full hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95 flex items-center justify-center w-11 h-11"
              >
                <FaPaperPlane size={15} className="-ml-0.5" />
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            shadow-lg hover:shadow-green-900/30 transition-all duration-300 transform hover:scale-110 items-center justify-center
            ${
              isOpen
                ? "hidden md:flex bg-red-500 rotate-90"
                : "flex bg-green-700 rotate-0"
            }
            text-white p-4 rounded-full
          `}
          title={isOpen ? "Close Chat" : "Open Chat Support"}
        >
          {isOpen ? <FaTimes size={24} /> : <FaCommentDots size={24} />}
        </button>
      </div>
    </>
  );
};

export default Chatbot;
