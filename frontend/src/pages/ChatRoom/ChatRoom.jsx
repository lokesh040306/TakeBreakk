// src/pages/ChatRoom/ChatRoom.jsx
import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiSun, FiMoon, FiZap, FiLock } from "react-icons/fi";

import socket from "../../services/socket";
import useRoomTimer            from "../../hooks/useRoomTimer";
import { useSoundNotification } from "../../hooks/useSoundNotification";
import { useScrollToBottom }    from "./hooks/useScrollToBottom";
import useChatSocket            from "./hooks/useChatSocket";
import useTyping                from "./hooks/useTyping";
import useFileUpload            from "./hooks/useFileUpload";

import { useToast }        from "../../hooks/useToast";
import { useTheme }        from "../../context/ThemeContext";
import { ToastContainer }  from "../../components/ui/Toast";

import ChatHeader    from "./ChatHeader";
import ChatMessages  from "./ChatMessages";
import ChatInput     from "./ChatInput";
import MembersSidebar from "./components/sidebar/MembersSidebar";

function ChatRoom() {
  const { roomId } = useParams();
  const navigate   = useNavigate();
  const { toasts, toast, removeToast } = useToast();
  const { isDark, toggleTheme } = useTheme();

  /**
   * Password bypass fix.
   *
   * Read the verified token from sessionStorage. This was written by the
   * Home page after a successful HTTP password check (POST /api/rooms/join).
   *
   * If the token is missing (user navigated directly to /room/:id without
   * going through the Home page password form), we show a "not authorized"
   * screen instead of the username entry form, and the socket server will
   * also reject any join attempt without this token.
   */
  const verifiedRoomId = sessionStorage.getItem(`verified:${roomId}`);
  const isAuthorized   = verifiedRoomId === roomId;

  // ── State ─────────────────────────────────────────────────────
  const [username,    setUsername]    = useState(() => sessionStorage.getItem(`username:${roomId}`) || "");
  const [isJoined,    setIsJoined]    = useState(false);
  const [messages,    setMessages]    = useState([]);
  const [message,     setMessage]     = useState("");
  const [typingUser,  setTypingUser]  = useState("");
  const [expiresAt,   setExpiresAt]   = useState(null);
  const [memberCount, setMemberCount] = useState(0);
  const [members,     setMembers]     = useState([]);
  const [isOwner,     setIsOwner]     = useState(false);
  const [reactions,   setReactions]   = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMembersOpen, setMobileMembersOpen] = useState(false);

  // ── Refs ──────────────────────────────────────────────────────
  const typingTimeoutRef = useRef(null);
  const fileInputRef     = useRef(null);

  // ── Hooks ─────────────────────────────────────────────────────
  const remainingTime = useRoomTimer(expiresAt);
  const { soundEnabled, toggleSound, playPing } = useSoundNotification();
  const { containerRef, endRef, isAtBottom, unreadCount, scrollToBottom } = useScrollToBottom(messages);

  useChatSocket({
    socket, roomId,
    verifiedRoomId,  // passed to connectSocket as socket.handshake.auth.verified
    navigate, toast,
    setMessages, setExpiresAt, setIsOwner,
    setMembers, setMemberCount, setTypingUser,
    setReactions, playPing,
  });

  const { handleTyping, stopTyping } = useTyping(socket, setMessage, typingTimeoutRef);
  const { uploading, handleFileUpload } = useFileUpload({ socket, roomId, username, setMessages, fileInputRef });

  // ── Actions ───────────────────────────────────────────────────
  const handleJoinRoom = () => {
    const trimmed = username.trim();
    if (!trimmed) return;
    sessionStorage.setItem(`username:${roomId}`, trimmed);
    socket.emit("room:join", { roomId, username: trimmed });
    setIsJoined(true);
  };

  const handleSendMessage = () => {
    if (!message.trim() || remainingTime === 0) return;
    socket.emit("message:send", { content: message });
    setMessage("");
    stopTyping();
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.info("Room ID copied");
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${roomId}`);
    toast.success("Invite link copied!");
  };

  // ── NOT AUTHORIZED (direct URL visit without password) ─────────
  if (!isAuthorized) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="blob w-96 h-96 -top-24 -left-24" style={{ background: "#6366f1" }} />
          <div className="blob w-80 h-80 -bottom-16 -right-16" style={{ background: "#ef4444", animationDelay: "3s" }} />
        </div>

        <div className="glass-card relative z-10 rounded-3xl p-8 w-full max-w-sm text-center slide-up">
          <div className="flex justify-center mb-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)", boxShadow: "0 0 24px rgba(239,68,68,0.3)" }}>
              <FiLock size={22} className="text-white" />
            </div>
          </div>

          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>
            Password Required
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            You need to enter the room password before you can access this room.
          </p>

          <button
            onClick={() => navigate(`/?join=${roomId}`)}
            className="btn-primary w-full"
          >
            Enter Password →
          </button>
        </div>
      </div>
    );
  }

  // ── PRE-JOIN: USERNAME ENTRY ───────────────────────────────────
  if (!isJoined) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <ToastContainer toasts={toasts} onRemove={removeToast} />

        <div className="absolute inset-0 pointer-events-none">
          <div className="blob w-96 h-96 -top-24 -left-24" style={{ background: "#6366f1" }} />
          <div className="blob w-80 h-80 -bottom-16 -right-16" style={{ background: "#8b5cf6", animationDelay: "3s" }} />
        </div>

        <button onClick={toggleTheme}
          className="absolute top-5 right-5 glass p-2.5 rounded-xl hover:scale-105 transition-all">
          {isDark ? <FiSun size={17} className="text-yellow-300" /> : <FiMoon size={17} className="text-indigo-500" />}
        </button>

        <form
          onSubmit={(e) => { e.preventDefault(); handleJoinRoom(); }}
          className="glass-card relative z-10 rounded-3xl p-8 w-full max-w-sm slide-up"
        >
          <div className="flex justify-center mb-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 0 24px rgba(99,102,241,0.4)" }}>
              <FiZap size={22} className="text-white" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-center mb-1" style={{ color: "var(--text)" }}>Enter Username</h2>
          <p className="text-xs text-center mb-6" style={{ color: "var(--text-muted)" }}>
            Joining room{" "}
            <span className="font-mono font-bold px-2 py-0.5 rounded-lg text-indigo-400"
              style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
              {roomId}
            </span>
          </p>

          <input
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose an anonymous name…"
            className="input-glass w-full mb-4"
          />
          <button type="submit" disabled={!username.trim()} className="btn-primary w-full">
            Enter Room →
          </button>
        </form>
      </div>
    );
  }

  // ── MAIN CHAT LAYOUT ──────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <ChatHeader
        roomId={roomId} isOwner={isOwner}
        remainingTime={remainingTime} memberCount={memberCount}
        soundEnabled={soundEnabled} onToggleSound={toggleSound}
        onCopyRoomId={handleCopyRoomId} onCopyInviteLink={handleCopyInviteLink}
        onRequestRoomPassword={() => socket.emit("room:password:request")}
        onLeaveRoom={() => navigate("/")}
        onToggleMembersSheet={() => setMobileMembersOpen((p) => !p)}
        searchQuery={searchQuery} onSearchChange={setSearchQuery}
      />

      <div className="flex flex-1 overflow-hidden">
        <ChatMessages
          messages={messages} username={username}
          isOwner={isOwner} members={members}
          typingUser={typingUser} containerRef={containerRef}
          endRef={endRef} isAtBottom={isAtBottom}
          unreadCount={unreadCount} onScrollToBottom={scrollToBottom}
          socket={socket} reactions={reactions} searchQuery={searchQuery}
        />

        <MembersSidebar
          members={members} isOwner={isOwner}
          currentUser={username}
          onKick={(id) => socket.emit("room:kick:user", { targetSocketId: id })}
          isOpen={mobileMembersOpen}
          onClose={() => setMobileMembersOpen(false)}
        />
      </div>

      <ChatInput
        message={message} setMessage={setMessage}
        onSendMessage={handleSendMessage} onTyping={handleTyping}
        uploading={uploading} remainingTime={remainingTime}
        fileInputRef={fileInputRef} handleFileUpload={handleFileUpload}
      />
    </div>
  );
}

export default ChatRoom;
