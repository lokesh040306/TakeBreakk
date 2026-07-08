// src/pages/ChatRoom/ChatMessages.jsx
import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import TypingIndicator from "./TypingIndicator";
import SystemMessage  from "./components/messages/SystemMessage";
import MessageBubble  from "./components/messages/MessageBubble";
import MediaLightbox  from "./components/media/MediaLightbox";

/**
 * ChatMessages — the scrollable message list.
 *
 * Delegates rendering to:
 *  - SystemMessage  for join/leave notifications
 *  - MessageBubble  for all chat messages
 *  - MediaLightbox  for full-screen image/video view
 *  - TypingIndicator at the bottom
 *
 * Also manages the scroll-to-bottom floating button (shown when scrolled up).
 */
function ChatMessages({
  messages, username, isOwner, members,
  typingUser, containerRef, endRef,
  isAtBottom, unreadCount, onScrollToBottom,
  socket, reactions, searchQuery,
}) {
  // null = closed; { url, type, name } = open
  const [lightbox, setLightbox] = useState(null);

  return (
    <div className="flex-1 relative overflow-hidden">

      <div ref={containerRef} className="h-full overflow-y-auto px-3 sm:px-5 py-4">
        {messages.map((msg, i) => {
          const isSelf   = msg.sender === username;
          const isSystem = msg.sender === "SYSTEM";

          // Search: dim messages that don't match
          const matchesSearch =
            !searchQuery ||
            msg.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.sender?.toLowerCase().includes(searchQuery.toLowerCase());
          const dimmed = searchQuery && !matchesSearch;

          // Group consecutive messages from same sender
          const prevMsg       = messages[i - 1];
          const nextMsg       = messages[i + 1];
          const isGrouped     = prevMsg && prevMsg.sender === msg.sender && prevMsg.sender !== "SYSTEM";
          const isLastInGroup = !nextMsg || nextMsg.sender !== msg.sender || nextMsg.sender === "SYSTEM";

          if (isSystem) {
            if (searchQuery && !matchesSearch) return null;
            return <SystemMessage key={msg._id || i} content={msg.content} />;
          }

          return (
            <div key={msg._id || i}
              className={`transition-opacity duration-200 ${dimmed ? "opacity-10 pointer-events-none" : "opacity-100"}`}>
              <MessageBubble
                msg={msg} isSelf={isSelf}
                isGrouped={isGrouped} isLastInGroup={isLastInGroup}
                isOwner={isOwner} members={members}
                reactions={reactions} searchQuery={searchQuery}
                socket={socket}
                onMediaClick={(url, type, name) => setLightbox({ url, type, name })}
              />
            </div>
          );
        })}

        <TypingIndicator username={typingUser} />
        <div ref={endRef} />
      </div>

      {/* Floating scroll-to-bottom button — shown when user scrolled up */}
      {!isAtBottom && (
        <button onClick={onScrollToBottom}
          className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 px-3 py-2 rounded-full text-white text-xs font-semibold shadow-2xl transition-all hover:-translate-y-0.5 active:scale-95"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}>
          <FiChevronDown size={13} />
          {unreadCount > 0 ? `${unreadCount} new` : "Latest"}
        </button>
      )}

      {/* Full-screen media viewer */}
      {lightbox && (
        <MediaLightbox url={lightbox.url} type={lightbox.type}
          name={lightbox.name} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}

export default ChatMessages;
