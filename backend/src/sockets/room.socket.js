// src/sockets/room.socket.js
import Room from "../models/Room.model.js";
import Message from "../models/Message.model.js";
import { findRoomById } from "../services/room.service.js";
import { getMessageHistory } from "../services/message.service.js";
import { SOCKET_EVENTS } from "../utils/constants.js";

/**
 * In-memory map: roomId → ownerSocketId
 * Tracks who the current owner is (for kick).
 * Resets on server restart — acceptable since rooms are short-lived.
 */
const roomOwners = new Map();

const registerRoomSocket = (io, socket) => {

  /** Emit current member count to everyone in the room */
  const emitMemberCount = (roomId) => {
    const room  = io.sockets.adapter.rooms.get(roomId);
    const count = room ? room.size : 0;
    io.to(roomId).emit("room:members:update", { count });
  };

  /** Build the current member list from live socket connections */
  const getMembers = (roomId) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room) return [];
    return [...room]
      .map((socketId) => {
        const s = io.sockets.sockets.get(socketId);
        return s ? { socketId, username: s.data.username } : null;
      })
      .filter(Boolean);
  };

  /**
   * Cleanup an empty room immediately.
   *
   * Called when the last member disconnects or is kicked — regardless of
   * whether the timer has expired. This ensures:
   *  - The room is immediately inaccessible (isActive: false)
   *  - Messages are deleted right away (don't wait for TTL)
   *  - In-memory owner state is cleared
   */
  const cleanupEmptyRoom = async (roomId) => {
    const socketRoom = io.sockets.adapter.rooms.get(roomId);
    const isEmpty = !socketRoom || socketRoom.size === 0;
    if (!isEmpty) return;

    try {
      await Room.findOneAndUpdate({ roomId }, { isActive: false });
      await Message.deleteMany({ roomId });
      roomOwners.delete(roomId);
      console.log(`🧹 Room ${roomId} empty — cleaned up immediately`);
    } catch (err) {
      console.error(`❌ Failed to cleanup room ${roomId}:`, err.message);
    }
  };

  /* ── JOIN ────────────────────────────────────────────────────── */
  socket.on(SOCKET_EVENTS.ROOM_JOIN, async ({ roomId, username }) => {
    try {
      if (!roomId || !username?.trim()) return;

      // Security: verify the client went through the HTTP password check.
      // The `verified` token is stored in socket.handshake.auth by the
      // frontend after a successful POST /api/rooms/join.
      const { verified } = socket.handshake.auth;
      if (!verified || verified !== roomId) {
        socket.emit("error", { message: "Unauthorized: please join via the home page" });
        return;
      }

      const room = await findRoomById(roomId);

      socket.join(roomId);
      socket.data.roomId    = roomId;
      socket.data.username  = username.trim();
      // Store expiresAt on socket.data so chat.socket.js can use it
      // when saving messages — avoids a DB lookup on every message send
      socket.data.expiresAt = room.expiresAt;

      // First socket in = owner
      if (!roomOwners.has(roomId)) {
        roomOwners.set(roomId, socket.id);
        socket.emit("room:owner", { isOwner: true });
      } else {
        socket.emit("room:owner", { isOwner: false });
      }

      socket.emit("room:joined",       { expiresAt: room.expiresAt });
      socket.emit("room:members:list", getMembers(roomId));

      // Send message history so joiner can read prior conversation
      const history = await getMessageHistory(roomId, 50);
      if (history.length > 0) socket.emit("room:history", history);

      socket.to(roomId).emit(SOCKET_EVENTS.USER_JOINED, {
        username: socket.data.username,
        socketId: socket.id,
      });

      emitMemberCount(roomId);
    } catch (err) {
      socket.emit("error", { message: err.message });
    }
  });

  /* ── KICK (owner only) ───────────────────────────────────────── */
  socket.on("room:kick:user", ({ targetSocketId }) => {
    const { roomId } = socket.data;
    if (roomOwners.get(roomId) !== socket.id) return;

    const target = io.sockets.sockets.get(targetSocketId);
    if (!target || target.data.roomId !== roomId) return;

    target.leave(roomId);
    target.emit("room:kicked", { message: "You were kicked by the room owner" });

    socket.to(roomId).emit(SOCKET_EVENTS.USER_LEFT, {
      username: target.data.username,
      socketId: target.id,
    });

    emitMemberCount(roomId);
    cleanupEmptyRoom(roomId);
  });

  /* ── DISCONNECT ──────────────────────────────────────────────── */
  socket.on("disconnect", () => {
    const { roomId, username } = socket.data;
    if (!roomId) return;

    socket.to(roomId).emit(SOCKET_EVENTS.USER_LEFT, { username, socketId: socket.id });

    // Transfer ownership if the owner disconnected
    if (roomOwners.get(roomId) === socket.id) {
      const remaining = getMembers(roomId);
      if (remaining.length > 0) {
        roomOwners.set(roomId, remaining[0].socketId);
        io.to(remaining[0].socketId).emit("room:owner", { isOwner: true });
      }
    }

    emitMemberCount(roomId);
    cleanupEmptyRoom(roomId); // no-op if other members still present
  });
};

export default registerRoomSocket;
