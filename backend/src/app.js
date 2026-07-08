// src/app.js
import express from "express";
import cors from "cors";
import env from "./config/env.js";

import roomRoutes   from "./routes/room.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

import errorMiddleware from "./middlewares/error.middleware.js";
import apiRateLimiter  from "./middlewares/rateLimit.middleware.js";

const app = express();

/* ── CORS ──────────────────────────────────────────────────────── */
const ALLOWED_ORIGINS = [
  env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
}));

/* ── MIDDLEWARES ───────────────────────────────────────────────── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiRateLimiter);

/* ── ROUTES ────────────────────────────────────────────────────── */
app.get("/", (_req, res) => res.json({ success: true, message: "TakeBreak API 🚀" }));

app.use("/api/rooms",   roomRoutes);
app.use("/api/uploads", uploadRoutes);

/* ── ERROR HANDLER ─────────────────────────────────────────────── */
app.use(errorMiddleware);

export default app;
