// src/server.js
import http from "http";
import app from "./app.js";
import env from "./config/env.js";
import connectDB from "./config/db.js";
import initSocket from "./config/socket.js";
import startRoomExpiryWatcher from "./services/timer.service.js";

/* -------------------- BOOTSTRAP SERVER -------------------- */

const PORT = env.PORT;

// Create HTTP server
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Initialize Socket.IO
initSocket(server);

// Start room expiry background watcher
startRoomExpiryWatcher();

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


