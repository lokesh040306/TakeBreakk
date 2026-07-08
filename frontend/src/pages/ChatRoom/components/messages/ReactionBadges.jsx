/**
 * ReactionBadges.jsx
 *
 * Shows the current emoji reaction counts below a message bubble.
 * Clicking a badge toggles your own reaction via socket.
 * e.g. "👍 3", "❤️ 1"
 */
function ReactionBadges({ reactions, msgId, isSelf, socket }) {
  if (!reactions || Object.keys(reactions).length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1 mt-1.5 ${isSelf ? "justify-end" : "justify-start"}`}>
      {Object.entries(reactions).map(([emoji, count]) => (
        <button
          key={emoji}
          onClick={() => socket.emit("reaction:add", { messageId: msgId, emoji })}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition hover:-translate-y-0.5 active:scale-95"
          style={{
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.22)",
            color: "var(--text)",
          }}
          title={`${count} reaction${count !== 1 ? "s" : ""}`}
        >
          <span>{emoji}</span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontWeight: 600 }}>
            {count}
          </span>
        </button>
      ))}
    </div>
  );
}

export default ReactionBadges;
