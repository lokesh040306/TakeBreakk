// src/middlewares/rateLimit.middleware.js
import rateLimit from "express-rate-limit";

/**
 * General API rate limiter
 * Applied to all /api/* routes
 */
export const apiRateLimiter = rateLimit({
  windowMs:       15 * 60 * 1000, // 15 minutes
  max:            100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: "Too many requests. Please try again later." },
});

/**
 * PHASE 2 — Strict limiter for room create/join
 *
 * Prevents brute-force password guessing and room spamming.
 * Allows 10 attempts per 15 minutes per IP.
 */
export const roomActionLimiter = rateLimit({
  windowMs:       15 * 60 * 1000, // 15 minutes
  max:            10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: "Too many room attempts. Please wait 15 minutes." },
});

// Keep default export for backward compat with app.js
export default apiRateLimiter;
