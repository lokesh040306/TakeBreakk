// src/pages/ChatRoom/components/messages/MessageBubble.jsx
import { avatarColor, formatTime, getMessageReactionId } from "../../../../utils/helpers";
import FileCard      from "../media/FileCard";
import ReactionPicker from "./ReactionPicker";
import ReactionBadges from "./ReactionBadges";

/**
 * Highlights a search keyword inside message text.
 * Matched text gets a yellow background; everything else is unstyled.
 */
function Highlighted({ text, query }) {
  if (!query || !text) return <span>{text}</span>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <span>
      {parts.map((p, i) =>
        p.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="bg-yellow-400/30 text-yellow-200 rounded px-0.5">{p}</mark>
          : p
      )}
    </span>
  );
}

/**
 * MessageBubble — renders a single message in the chat.
 *
 * Handles:
 * - Self / other bubble styles
 * - Avatar (first in group only)
 * - Text with search highlighting
 * - Image, video, file attachments
 * - Reaction picker on hover + reaction badge display
 * - Timestamp on last message in a group
 * - Owner kick button on hover
 */
function MessageBubble({
  msg,
  isSelf,
  isGrouped,
  isLastInGroup,
  isOwner,
  members,
  reactions,
  searchQuery,
  socket,
  onMediaClick,
}) {
  const color = avatarColor(msg.sender);
  const msgId = getMessageReactionId(msg);
  const msgReactions = msgId ? (reactions?.[msgId] || {}) : {};

  // Cloudinary URLs start with https; local/relative paths need the base URL prepended
  const mediaUrl = msg.content?.startsWith("http")
    ? msg.content
    : `${import.meta.env.VITE_API_URL}${msg.content}`;

  return (
    <div className={`msg-enter flex ${isSelf ? "justify-end" : "justify-start"} ${isGrouped ? "mt-0.5" : "mt-5"}`}>

      {/* Avatar — left side, other users only, first message in group */}
      {!isSelf && !isGrouped && (
        <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white mr-2 mt-0.5 shadow-md"
          style={{ background: color }}>
          {msg.sender[0]?.toUpperCase()}
        </div>
      )}
      {/* Spacer to keep messages aligned when avatar is hidden */}
      {!isSelf && isGrouped && <div className="w-7 mr-2 shrink-0" />}

      <div className="max-w-[75%] sm:max-w-[440px] group">

        {/* Sender name + kick button — first message in group only */}
        {!isGrouped && (
          <div className={`flex items-center gap-2 mb-1 ${isSelf ? "justify-end" : "justify-start"}`}>
            <span className="text-[11px] font-semibold" style={{ color }}>
              {msg.sender}
            </span>
            {/* Kick button visible only to room owner, only on hover */}
            {isOwner && !isSelf && (
              <button
                onClick={() => socket.emit("room:kick:user", {
                  targetSocketId: members.find((m) => m.username === msg.sender)?.socketId,
                })}
                className="text-[10px] text-red-400 opacity-0 group-hover:opacity-100 transition hover:underline"
              >
                Kick
              </button>
            )}
          </div>
        )}

        {/* Bubble + floating reaction picker */}
        <div className="relative">
          <div
            className={`px-4 py-2.5 text-sm leading-relaxed break-words ${isSelf ? "rounded-2xl rounded-br-sm" : "rounded-2xl rounded-bl-sm"}`}
            style={
              isSelf
                ? { background: "linear-gradient(135deg,rgba(99,102,241,0.4),rgba(139,92,246,0.35))", border: "1px solid rgba(99,102,241,0.3)", color: "var(--text)" }
                : { background: "var(--bg-glass)", border: "1px solid var(--border-glass)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", color: "var(--text)" }
            }
          >
            {/* Image — clickable to open lightbox */}
            {msg.type === "image" && (
              <button onClick={() => onMediaClick(mediaUrl, "image", msg.fileMeta?.name || "Image")}
                className="block w-full text-left" title="Click to view">
                <img src={mediaUrl} alt={msg.fileMeta?.name || "Image"}
                  className="rounded-xl max-w-full shadow-lg hover:opacity-90 transition cursor-zoom-in"
                  style={{ maxHeight: "280px", objectFit: "cover" }} />
                {msg.fileMeta?.name && <p className="text-[10px] mt-1 opacity-60">{msg.fileMeta.name}</p>}
              </button>
            )}

            {/* Video — inline player, click video element itself to expand */}
            {msg.type === "video" && (
              <div className="space-y-1">
                <video src={mediaUrl} controls className="rounded-xl max-w-full" style={{ maxHeight: "280px" }}
                  onClick={(e) => {
                    if (e.target.tagName === "VIDEO") {
                      e.preventDefault();
                      onMediaClick(mediaUrl, "video", msg.fileMeta?.name || "Video");
                    }
                  }} />
                {msg.fileMeta?.name && <p className="text-[10px] opacity-60">{msg.fileMeta.name}</p>}
              </div>
            )}

            {/* File — WhatsApp-style download card */}
            {msg.type === "file" && (
              <FileCard url={mediaUrl} name={msg.fileMeta?.name}
                size={msg.fileMeta?.size} mime={msg.fileMeta?.mime} isTemp={msg.isTemp} />
            )}

            {/* Plain text with optional search highlighting */}
            {(!msg.type || msg.type === "text") && (
              <Highlighted text={msg.content || ""} query={searchQuery} />
            )}
          </div>

          {/* Reaction picker floats just below bubble on group-hover */}
          {!msg.isTemp && msgId && (
            <ReactionPicker msgId={msgId} isSelf={isSelf} socket={socket} />
          )}
        </div>

        {/* Reaction count badges */}
        <ReactionBadges reactions={msgReactions} msgId={msgId} isSelf={isSelf} socket={socket} />

        {/* Timestamp — only on last message in a consecutive group */}
        {isLastInGroup && (
          <div className={`text-[10px] mt-1 ${isSelf ? "text-right" : "text-left"}`}
            style={{ color: "var(--text-muted)", opacity: 0.5 }}>
            {formatTime(msg.createdAt)}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
