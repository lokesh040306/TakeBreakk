// backend/src/config/socket.js

import { Server } from "socket.io";
import env from "./env.js";
import registerSocketHandlers from "../sockets/index.js";

let io;

const ALLOWED_ORIGINS = [
  env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

/**
 * Initialize Socket.IO
 * Called exactly once from server.js.
 */
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: socket origin '${origin}' not allowed`));
      },
      credentials: true,
    },
  });

  registerSocketHandlers(io);
  return io;
};

/**
 * Safely access the Socket.IO instance from anywhere in the app.
 */
initSocket.getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};

export default initSocket;
