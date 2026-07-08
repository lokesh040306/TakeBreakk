/**
 * SystemMessage.jsx
 *
 * Renders join/leave/system notifications as a centered pill.
 * e.g. "Lokii joined the room", "Room time has expired"
 */
function SystemMessage({ content }) {
  return (
    <div className="flex justify-center py-2.5">
      <div
        className="px-4 py-1 text-[10px] rounded-full font-medium"
        style={{
          background: "rgba(99,102,241,0.06)",
          border: "1px solid rgba(99,102,241,0.12)",
          color: "var(--text-muted)",
        }}
      >
        {content}
      </div>
    </div>
  );
}

export default SystemMessage;
