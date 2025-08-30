import React, { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";

const logoUrl = "/assets/logos/Black KAI2 Logo.jpg";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatLog, loading]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();

    // Send starting message once
    if (open && !started) {
      const startMsg = {
        sender: "bot",
        text: "Hello! I'm here to answer your questions about the KAI2 lab work!",
        time: dayjs().format("h:mm A"),
        provenance: [],
      };
      setChatLog((prev) => [...prev, startMsg]);
      setStarted(true);
    }
  }, [open, started]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    const userMsg = { sender: "user", text: message, time: dayjs().format("h:mm A") };
    setChatLog((prev) => [...prev, userMsg]);
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();

      const botMsg = {
        sender: "bot",
        text: data.reply,
        time: dayjs().format("h:mm A"),
        provenance: data.provenance || [],
      };
      setChatLog((prev) => [...prev, botMsg]);
    } catch (err) {
      const errMsg = {
        sender: "bot",
        text: "Oops! Something went wrong.",
        time: dayjs().format("h:mm A"),
        provenance: [],
      };
      setChatLog((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="fixed bottom-6 right-0 z-50">
      {/* Dock button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="bg-black h-16 w-16 hover:w-20 flex items-center justify-center rounded-l-full shadow-md cursor-pointer overflow-hidden relative transition-all duration-300 ease-out"
      >
        <img src={logoUrl} alt="Chatbot" className="w-10 h-10 object-contain" />
      </button>

      {/* Chat Popup */}
      <div
        className={`
          absolute bottom-20 right-0 w-80 bg-white rounded-xl shadow-2xl p-4 flex flex-col gap-2
          transform transition-all duration-300 ease-out
          ${open ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0 pointer-events-none"}
        `}
      >
        <div className="font-bold mb-2">Ask a Question!</div>

        {/* Chat area */}
        <div className="flex-1 min-h-[180px] max-h-96 overflow-y-auto border rounded-md p-2 space-y-2 bg-gray-50">
          {chatLog.map((msg, i) => (
            <div
              key={i}
              className={`
                p-2 rounded-md break-words max-w-[75%] relative
                ${msg.sender === "user"
                  ? "bg-gray-200 text-right ml-auto hover:bg-gray-300 transition-colors"
                  : "bg-blue-100 text-left mr-auto hover:bg-blue-200 transition-colors"}
                animate-fade-in
              `}
            >
              {msg.text}
              <span className="block text-xs text-gray-500 mt-1">{msg.time}</span>

              {/* Render provenance if available */}
              {msg.sender === "bot" && msg.provenance && msg.provenance.length > 0 && (
                <div className="text-xs text-gray-400 mt-1">
                  Sources: {msg.provenance.map((p, idx) => (
                    <span key={idx}>
                      {p.title || "unknown source"}
                      {idx < msg.provenance.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && <div className="text-gray-500 italic">typing...</div>}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          placeholder={loading ? "Waiting for bot..." : "Type your message..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="w-full px-3 py-2 rounded-md border border-gray-300 outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
        />
      </div>

      {/* Tailwind animation */}
      <style>{`
        @keyframes fadeIn { from {opacity:0; transform:translateY(5px);} to {opacity:1; transform:translateY(0);} }
        .animate-fade-in { animation: fadeIn 0.25s ease-out; }
      `}</style>
    </div>
  );
}
