// src/utils/generateRoomId.js

import crypto from "crypto";

/**
 * Generate a random, human-readable room ID
 *
 * Format:
 * - Uppercase alphanumeric string
 * - Fixed length (6 characters)
 *
 * Example:
 * - A9F3KD
 *
 * Design goals:
 * - Hard to guess
 * - Easy to share manually
 * - Fast to generate
 */
const generateRoomId = () => {
  return crypto
    .randomBytes(4)          // Generate random bytes
    .toString("hex")         // Convert to hex string
    .substring(0, 6)         // Take first 6 characters
    .toUpperCase();          // Normalize to uppercase
};

export default generateRoomId;
