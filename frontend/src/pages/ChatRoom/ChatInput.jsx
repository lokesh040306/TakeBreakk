// frontend/src/pages/ChatRoom/ChatInput.jsx
import { FiSmile, FiPaperclip, FiSend } from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

function ChatInput({
  message, setMessage, onSendMessage, onTyping,
  uploading, remainingTime, fileInputRef, handleFileUpload,
}) {
  const { isDark } = useTheme();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiRef = useRef(null);
  const isDisabled = remainingTime === 0;

  const handleEmojiClick = (data) => setMessage((p) => p + data.emoji);

  useEffect(() => {
    if (!showEmojiPicker) return;
    const h = (e) => { if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmojiPicker(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showEmojiPicker]);

  return (
    <div className="glass border-t shrink-0 relative z-20"
      style={{ borderColor: "var(--border-glass)" }}>

      {/* EMOJI PICKER */}
      {showEmojiPicker && (
        <div ref={emojiRef} className="absolute bottom-full left-4 mb-2 z-50 animate-fade-in">
          <EmojiPicker
            theme={isDark ? "dark" : "light"}
            onEmojiClick={handleEmojiClick}
            height={380}
            searchDisabled={false}
          />
        </div>
      )}

      <div className="flex items-center gap-2 px-4 py-3">
        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" hidden
          accept="image/*,video/*,.pdf,.zip,.doc,.docx"
          onChange={(e) => handleFileUpload(e.target.files[0])}
        />

        {/* ATTACH */}
        <button
          onClick={() => fileInputRef.current.click()}
          disabled={uploading || isDisabled}
          className="p-2 rounded-xl opacity-50 hover:opacity-100 hover:bg-white/10 disabled:opacity-25 transition"
          title="Attach file"
        >
          <FiPaperclip size={17} />
        </button>

        {/* EMOJI */}
        <button
          onClick={() => setShowEmojiPicker(p => !p)}
          disabled={isDisabled}
          className={`p-2 rounded-xl transition ${showEmojiPicker ? "text-indigo-400 bg-indigo-500/15 opacity-100" : "opacity-50 hover:opacity-100 hover:bg-white/10"}`}
          title="Emoji"
        >
          <FiSmile size={17} />
        </button>

        {/* TEXT INPUT */}
        <input
          type="text"
          value={message}
          onChange={onTyping}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onSendMessage(); } }}
          disabled={isDisabled}
          placeholder={isDisabled ? "Room has expired" : "Type a message…"}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 disabled:opacity-40"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--border-glass)",
            color: "var(--text)",
          }}
          onFocus={(e) => { e.target.style.borderColor = "rgba(99,102,241,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
          onBlur={(e) => { e.target.style.borderColor = "var(--border-glass)"; e.target.style.boxShadow = "none"; }}
        />

        {/* SEND */}
        <button
          onClick={onSendMessage}
          disabled={isDisabled || !message.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-30 transition-all duration-200 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
        >
          <FiSend size={15} />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
