// src/services/timer.service.js
import Room from "../models/Room.model.js";
import Message from "../models/Message.model.js";
import initSocket from "../config/socket.js";
import { SOCKET_EVENTS } from "../utils/constants.js";

/**
 * Background room expiry watcher — runs every 30 seconds.
 *
 * WHAT IT DOES:
 * 1. Finds rooms whose expiresAt has passed but are still marked isActive
 * 2. Marks them isActive: false (so join attempts are rejected immediately)
 * 3. Deletes all messages for expired rooms from the DB right now
 *    (the Message TTL index also does this, but up to 60s later — doing
 *    it here means data is gone within 30s of expiry, not 90s)
 * 4. Emits room:expired to any connected clients so their UI navigates away
 *
 * RELATIONSHIP WITH MongoDB TTL:
 * - Room documents:    TTL index auto-deletes them from the DB ~60s after expiresAt
 * - Message documents: TTL index auto-deletes them from the DB ~60s after expiresAt
 * - This watcher:     does explicit deleteMany within 30s for faster cleanup
 *                     and emits the socket event (TTL can't do that)
 *
 * So even if this watcher crashes or the server restarts, MongoDB's own
 * TTL thread will still clean up both collections automatically.
 */
const startRoomExpiryWatcher = () => {
  setInterval(async () => {
    try {
      const expiredRooms = await Room.find({
        isActive: true,
        expiresAt: { $lte: new Date() },
      }).select("roomId expiresAt");

      if (expiredRooms.length === 0) return;

      const io         = initSocket.getIO();
      const expiredIds = expiredRooms.map((r) => r.roomId);

      // Mark all expired rooms inactive in one query
      await Room.updateMany(
        { roomId: { $in: expiredIds } },
        { isActive: false }
      );

      // Delete all messages for expired rooms immediately
      // (don't wait for TTL — data should be gone within one watcher cycle)
      const msgResult = await Message.deleteMany({ roomId: { $in: expiredIds } });

      console.log(`⏱  Expired ${expiredRooms.length} room(s), deleted ${msgResult.deletedCount} message(s)`);

      // Notify any connected clients in each expired room
      for (const room of expiredRooms) {
        io.to(room.roomId).emit(SOCKET_EVENTS.ROOM_EXPIRED, {
          roomId:  room.roomId,
          message: "Room time has expired",
        });
      }
    } catch (error) {
      console.error("❌ Room expiry watcher error:", error.message);
    }
  }, 30 * 1000);
};

export default startRoomExpiryWatcher;
