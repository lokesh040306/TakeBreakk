/**
 * ReactionPicker.jsx
 *
 * Small emoji picker that floats above a message bubble on hover.
 * Clicking an emoji emits "reaction:add" via socket.
 * Appears on group-hover of the parent message row.
 */
import { REACTIONS } from "../../../../utils/constants";

function ReactionPicker({ msgId, isSelf, socket }) {
  const handleReact = (emoji) => {
    // Emit reaction event to backend — backend broadcasts to all room members
    socket.emit("reaction:add", { messageId: msgId, emoji });
  };

  return (
    <div
      /**
       * Position: floats just below the bubble, aligned to the correct side.
       * Uses group-hover opacity so it only shows when hovering the bubble row.
       */
      className={`
        absolute ${isSelf ? "right-1" : "left-1"} -bottom-6
        opacity-0 group-hover:opacity-100
        transition-all duration-150 pointer-events-none group-hover:pointer-events-auto
        flex gap-0.5 rounded-full px-2 py-1 z-20 shadow-2xl
      `}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-glass)",
      }}
    >
      {REACTIONS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleReact(emoji)}
          className="text-sm hover:scale-125 transition-transform leading-none"
          title={emoji}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

export default ReactionPicker;
