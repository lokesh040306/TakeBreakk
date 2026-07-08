// frontend/src/pages/ChatRoom/ChatHeader.jsx
import { useEffect, useRef, useState } from "react";
import {
  FiArrowLeft, FiCopy, FiMoreVertical, FiUsers,
  FiLogOut, FiClock, FiSearch, FiX, FiVolume2,
  FiVolumeX, FiLink, FiSun, FiMoon,
} from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";

function ChatHeader({
  roomId, isOwner, remainingTime, memberCount,
  soundEnabled, onToggleSound, onCopyRoomId, onCopyInviteLink,
  onRequestRoomPassword, onLeaveRoom, onToggleMembersSheet,
  searchQuery, onSearchChange,
}) {
  const { isDark, toggleTheme } = useTheme();
  const menuRef        = useRef(null);
  const searchInputRef = useRef(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const formatTime = (ms) => {
    if (!ms || ms <= 0) return "Expired";
    return `${Math.floor(ms/60000)}:${String(Math.floor((ms%60000)/1000)).padStart(2,"0")}`;
  };

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) menuRef.current.removeAttribute("open"); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
    else onSearchChange("");
  }, [searchOpen]); // eslint-disable-line

  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const isExpired = !remainingTime || remainingTime <= 0;

  return (
    <header className="glass border-b shrink-0 px-4 py-3 flex items-center gap-3 z-30"
      style={{ borderColor: "var(--border-glass)" }}>

      {/* BACK */}
      <button onClick={onLeaveRoom}
        className="p-2 rounded-xl hover:bg-white/10 transition text-indigo-400 hover:text-white shrink-0">
        <FiArrowLeft size={17} />
      </button>

      {/* ROOM ID */}
      {!searchOpen && (
        <div className="flex-1 min-w-0">
          <p className="text-[9px] uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>Room</p>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm tracking-widest" style={{ color: "var(--text)" }}>{roomId}</span>
            {isOwner && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-yellow-500/40 text-yellow-400 bg-yellow-500/10 font-medium">
                Owner
              </span>
            )}
            <button onClick={onCopyRoomId} className="opacity-50 hover:opacity-100 transition" title="Copy Room ID">
              <FiCopy size={12} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
        </div>
      )}

      {/* SEARCH BAR */}
      {searchOpen && (
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl border"
          style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(99,102,241,0.4)" }}>
          <FiSearch size={13} style={{ color: "var(--text-muted)" }} />
          <input ref={searchInputRef} value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search messages…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--text)" }}
          />
          <button onClick={() => setSearchOpen(false)} className="opacity-50 hover:opacity-100 transition">
            <FiX size={13} />
          </button>
        </div>
      )}

      {/* RIGHT CONTROLS */}
      <div className="flex items-center gap-1 shrink-0">

        {/* TIMER */}
        <div className={`hidden sm:flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border font-mono ${
          isExpired
            ? "border-red-500/40 text-red-400 bg-red-500/10"
            : "border-white/10 text-gray-400"
        }`}>
          <FiClock size={10} />
          {formatTime(remainingTime)}
        </div>

        {/* SEARCH */}
        <button onClick={() => setSearchOpen(p => !p)}
          className={`p-2 rounded-xl transition ${searchOpen ? "text-indigo-400 bg-indigo-500/15" : "hover:bg-white/10 opacity-60 hover:opacity-100"}`}>
          <FiSearch size={15} />
        </button>

        {/* SOUND */}
        <button onClick={onToggleSound}
          className="p-2 rounded-xl hover:bg-white/10 opacity-60 hover:opacity-100 transition"
          title={soundEnabled ? "Mute" : "Unmute"}>
          {soundEnabled ? <FiVolume2 size={15} /> : <FiVolumeX size={15} />}
        </button>

        {/* THEME TOGGLE */}
        <button onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-white/10 opacity-60 hover:opacity-100 transition">
          {isDark ? <FiSun size={15} className="text-yellow-300" /> : <FiMoon size={15} className="text-indigo-400" />}
        </button>

        {/* MEMBERS */}
        <button onClick={onToggleMembersSheet}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 opacity-70 hover:opacity-100 transition text-xs">
          <FiUsers size={13} />
          <span className="font-mono">{memberCount}</span>
        </button>

        {/* MORE MENU */}
        <details ref={menuRef} className="relative">
          <summary className="list-none cursor-pointer p-2 rounded-xl hover:bg-white/10 opacity-60 hover:opacity-100 transition">
            <FiMoreVertical size={15} />
          </summary>
          <div className="glass-card absolute right-0 mt-2 w-52 rounded-2xl shadow-2xl z-50 overflow-hidden py-1"
            style={{ border: "1px solid var(--border-glass)" }}>

            <MenuBtn icon={FiLink} label="Copy Invite Link"
              onClick={() => { menuRef.current?.removeAttribute("open"); onCopyInviteLink(); }} />

            {isOwner && <MenuBtn icon={FiCopy} label="View Room Password"
              onClick={() => { menuRef.current?.removeAttribute("open"); onRequestRoomPassword(); }} />}

            <div className="my-1 h-px mx-3" style={{ background: "var(--border-glass)" }} />

            <MenuBtn icon={FiLogOut} label="Leave Room" danger
              onClick={() => { menuRef.current?.removeAttribute("open"); onLeaveRoom(); }} />
          </div>
        </details>
      </div>
    </header>
  );
}

function MenuBtn({ icon: Icon, label, onClick, danger }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-white/5 transition ${danger ? "text-red-400" : ""}`}
      style={danger ? {} : { color: "var(--text)" }}>
      <Icon size={13} />
      {label}
    </button>
  );
}

export default ChatHeader;
