// src/pages/Home/Home.jsx
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createRoom, joinRoom } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { useTheme } from "../../context/ThemeContext";
import { ToastContainer } from "../../components/ui/Toast";
import { FiLock, FiClock, FiTrash2, FiUser, FiLoader, FiZap, FiSun, FiMoon } from "react-icons/fi";

function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toasts, toast, removeToast } = useToast();
  const { isDark, toggleTheme } = useTheme();

  const [createPassword, setCreatePassword] = useState("");
  const [duration,       setDuration]       = useState(15);
  const [creating,       setCreating]       = useState(false);

  // Pre-fill roomId if user arrived via an invite link (/join/ROOMID)
  const [joinRoomId,   setJoinRoomId]   = useState(() => searchParams.get("join") || "");
  const [joinPassword, setJoinPassword] = useState("");
  const [joining,      setJoining]      = useState(false);

  const handleCreateRoom = async () => {
    if (!createPassword.trim()) { toast.error("Password is required"); return; }
    if (createPassword.trim().length < 4) { toast.error("Password must be at least 4 characters"); return; }
    try {
      setCreating(true);
      const res = await createRoom(createPassword.trim(), duration);
      const roomId = res.data.roomId;

      /**
       * Store a verified token so the socket server knows this client
       * completed a proper password check before joining.
       * Without this token, a direct URL visit will be rejected.
       */
      sessionStorage.setItem(`verified:${roomId}`, roomId);

      toast.success("Room created!");
      setTimeout(() => navigate(`/room/${roomId}`), 500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create room");
    } finally { setCreating(false); }
  };

  const handleJoinRoom = async () => {
    if (!joinRoomId.trim() || !joinPassword.trim()) { toast.error("Room ID and password are required"); return; }
    try {
      setJoining(true);
      const res = await joinRoom(joinRoomId.trim(), joinPassword);
      const roomId = res.data.roomId;

      // Same verified token — proves the password was checked via HTTP
      sessionStorage.setItem(`verified:${roomId}`, roomId);

      toast.success("Joining room...");
      setTimeout(() => navigate(`/room/${roomId}`), 500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid Room ID or password");
    } finally { setJoining(false); }
  };

  return (
    <div className="relative min-h-screen overflow-hidden transition-colors duration-300">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob w-[500px] h-[500px] -top-40 -left-32" style={{ background: isDark ? "#6366f1" : "#818cf8" }} />
        <div className="blob w-[400px] h-[400px] top-1/2 -right-32" style={{ background: isDark ? "#8b5cf6" : "#a78bfa", animationDelay: "2s" }} />
        <div className="blob w-[350px] h-[350px] -bottom-24 left-1/3" style={{ background: isDark ? "#3b82f6" : "#60a5fa", animationDelay: "4s" }} />
      </div>

      {/* Theme toggle */}
      <div className="absolute top-5 right-5 z-20">
        <button onClick={toggleTheme} className="glass p-2.5 rounded-xl hover:scale-105 transition-all">
          {isDark ? <FiSun size={18} className="text-yellow-300" /> : <FiMoon size={18} className="text-indigo-500" />}
        </button>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-16 sm:py-24">

        {/* Hero */}
        <header className="text-center mb-16 fade-in">
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{ color: "var(--primary)" }}>
            <FiZap size={11} /> Anonymous · Secure · Ephemeral
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4" style={{ color: "var(--text)" }}>
            Chat without a{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              trace
            </span>
          </h1>
          <p className="max-w-md mx-auto text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Temporary rooms that vanish when time runs out. No accounts, no history.
          </p>
        </header>

        {/* Create / Join forms */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">

          {/* Create */}
          <div className="glass-card rounded-2xl p-6 slide-up">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl" style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.2)" }}>
                <FiLock size={16} className="text-indigo-400" />
              </div>
              <div>
                <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Create a Room</h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Start a new private session</p>
              </div>
            </div>

            <input
              type="password"
              placeholder="Set a room password (min 4 chars)"
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
              className="input-glass mb-3"
            />

            <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="select-glass mb-5">
              <option value={15}>⏱ 15 minutes</option>
              <option value={30}>⏱ 30 minutes</option>
              <option value={45}>⏱ 45 minutes</option>
              <option value={60}>⏱ 60 minutes</option>
            </select>

            <button onClick={handleCreateRoom} disabled={creating} className="btn-primary w-full">
              {creating ? <><FiLoader className="animate-spin" size={15} /> Creating…</> : "Create Room →"}
            </button>
          </div>

          {/* Join */}
          <div className="glass-card rounded-2xl p-6 slide-up" style={{ animationDelay: "0.05s" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.2)" }}>
                <FiUser size={16} className="text-purple-400" />
              </div>
              <div>
                <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Join a Room</h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Enter an existing session</p>
              </div>
            </div>

            <input
              type="text"
              placeholder="Room ID (e.g. A9F3KD)"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
              className="input-glass mb-3 font-mono tracking-widest"
            />
            <input
              type="password"
              placeholder="Room password"
              value={joinPassword}
              onChange={(e) => setJoinPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
              className="input-glass mb-5"
            />

            <button onClick={handleJoinRoom} disabled={joining} className="btn-primary w-full">
              {joining ? <><FiLoader className="animate-spin" size={15} /> Joining…</> : "Join Room →"}
            </button>
          </div>
        </section>

        {/* Feature cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: FiLock,   title: "Private",    desc: "Password-protected rooms",          color: "indigo", delay: "0.1s"  },
            { icon: FiClock,  title: "Timed",      desc: "Rooms auto-expire on schedule",     color: "violet", delay: "0.15s" },
            { icon: FiTrash2, title: "No Trace",   desc: "Messages erased on expiry",         color: "blue",   delay: "0.2s"  },
            { icon: FiUser,   title: "Anonymous",  desc: "No account or identity needed",     color: "indigo", delay: "0.25s" },
          ].map(({ icon: Icon, title, desc, color, delay }) => (
            <div key={title} className="glass rounded-xl p-4 hover:shadow-glow-sm hover:-translate-y-0.5 transition-all duration-300 slide-up"
              style={{ animationDelay: delay }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                style={{ background: `rgba(99,102,241,0.12)`, border: `1px solid rgba(99,102,241,0.18)` }}>
                <Icon size={15} className="text-indigo-400" />
              </div>
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--text)" }}>{title}</p>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default Home;
