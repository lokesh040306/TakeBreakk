/**
 * TypingIndicator.jsx
 *
 * Shows an animated "X is typing..." indicator at the bottom of the chat.
 * Uses CSS wave animation for the three dots (defined in index.css).
 * Returns null when no one is typing (no DOM node rendered).
 */
function TypingIndicator({ username }) {
  // Don't render anything if no one is typing
  if (!username) return null;

  return (
    <div className="flex items-center gap-2.5 px-1 py-2 fade-in mt-1">
      {/* Animated bubble with three bouncing dots */}
      <div
        className="flex items-center gap-1.5 px-3 py-2 rounded-2xl rounded-bl-sm"
        style={{
          background: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.15)",
        }}
      >
        <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "#6366f1" }} />
        <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "#6366f1" }} />
        <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "#6366f1" }} />
      </div>

      {/* Username label */}
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
        {username} is typing…
      </span>
    </div>
  );
}

export default TypingIndicator;
