// src/services/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

/**
 * Socket.IO singleton.
 * autoConnect: false — we connect manually after setting auth,
 * so the server can verify the join is password-authenticated.
 */
const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
});

/**
 * Connect with a verified room token.
 *
 * The `verified` value is the roomId stored in sessionStorage after a
 * successful HTTP password check (POST /api/rooms/join or /create).
 * The server reads socket.handshake.auth.verified and rejects the
 * room:join event if it doesn't match the requested roomId.
 *
 * This prevents the password bypass: visiting /room/:id directly
 * will fail because no verified token exists in sessionStorage.
 *
 * @param {string} verifiedRoomId - roomId from sessionStorage
 */
export const connectSocket = (verifiedRoomId) => {
  if (!socket.connected) {
    // Attach auth token before connecting
    socket.auth = { verified: verifiedRoomId || null };
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;
