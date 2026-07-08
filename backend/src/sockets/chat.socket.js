// src/sockets/chat.socket.js
import { SOCKET_EVENTS } from "../utils/constants.js";
import { saveMessage } from "../services/message.service.js";

/**
 * In-memory reaction store.
 * Map<roomId, Map<messageId, Map<emoji, Set<username>>>>
 *
 * Reactions are ephemeral — in-memory only, not persisted.
 * Fast, simple, and appropriate for a temporary chat app.
 */
const reactionStore = new Map();

const registerChatSocket = (io, socket) => {

  /* ── SEND MESSAGE ────────────────────────────────────────────── */
  socket.on(SOCKET_EVENTS.MESSAGE_SEND, async ({ content, type = "text" }) => {
    const { roomId, username, expiresAt } = socket.data;
    if (!roomId || !username || !content) return;
    if (type !== "text") return; // file/media go through the upload HTTP route

    const message = { roomId, sender: username, content, type: "text" };

    // Broadcast first — real-time delivery is not gated on DB write
    io.to(roomId).emit(SOCKET_EVENTS.MESSAGE_RECEIVE, message);

    // Persist with expiresAt so the MongoDB TTL index auto-deletes
    // this message when the room expires (even if no code explicitly deletes it)
    try {
      await saveMessage({ ...message, expiresAt });
    } 
    catch (err) {
      console.error("Failed to save message:", err);
    }
  });

  /* ── TYPING INDICATOR ────────────────────────────────────────── */
  socket.on(SOCKET_EVENTS.TYPING_START, () => {
    const { roomId, username } = socket.data;
    if (!roomId || !username) return;
    socket.to(roomId).emit(SOCKET_EVENTS.TYPING_START, { username });
  });

  socket.on(SOCKET_EVENTS.TYPING_STOP, () => {
    const { roomId } = socket.data;
    if (!roomId) return;
    socket.to(roomId).emit(SOCKET_EVENTS.TYPING_STOP);
  });

  /* ── EMOJI REACTIONS ─────────────────────────────────────────── */
  socket.on(SOCKET_EVENTS.REACTION_ADD, ({ messageId, emoji }) => {
    const { roomId, username } = socket.data;
    if (!roomId || !username || !messageId || !emoji) return;

    if (!reactionStore.has(roomId))    reactionStore.set(roomId, new Map());
    const roomReactions = reactionStore.get(roomId);

    if (!roomReactions.has(messageId)) roomReactions.set(messageId, new Map());
    const msgReactions = roomReactions.get(messageId);

    if (!msgReactions.has(emoji))      msgReactions.set(emoji, new Set());
    const users = msgReactions.get(emoji);

    // Toggle reaction: remove if already added, add if not
    if (users.has(username)) {
      users.delete(username);
      if (users.size === 0) msgReactions.delete(emoji);
    } else {
      users.add(username);
    }

    // Broadcast updated counts (not who reacted — just emoji → count)
    const serialized = {};
    for (const [e, s] of msgReactions.entries()) serialized[e] = s.size;

    io.to(roomId).emit(SOCKET_EVENTS.REACTION_UPDATE, { messageId, reactions: serialized });
  });
};

export default registerChatSocket;
