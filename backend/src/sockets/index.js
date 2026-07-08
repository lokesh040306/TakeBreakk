// src/sockets/index.js
import registerRoomSocket from "./room.socket.js";
import registerChatSocket from "./chat.socket.js";

/**
 * Registers all socket handlers
 * @param {import("socket.io").Server} io
 */
const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log(`🟢 User connected: ${socket.id}`);

    registerRoomSocket(io, socket);
    registerChatSocket(io, socket);

    socket.on("disconnect", () => {
      console.log(`🔴 User disconnected: ${socket.id}`);
    });
  });
};

export default registerSocketHandlers;
