/**
 * helpers.js — Shared utility functions used across the app
 */

/**
 * Generate a consistent avatar color from a username string.
 * Uses a simple hash so the same username always gets the same color.
 *
 * @param {string} name - Username to hash
 * @returns {string} CSS hex color
 */
export const avatarColor = (name = "") => {
  const PALETTE = [
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#14b8a6", // teal
    "#f59e0b", // amber
    "#3b82f6", // blue
    "#10b981", // emerald
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

/**
 * Format a timestamp into a short time string like "2:34 PM".
 *
 * @param {string|Date} ts - Timestamp to format
 * @returns {string} Formatted time or empty string if no timestamp
 */
export const formatTime = (ts) => {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format a file size in bytes to a human-readable string.
 * e.g. 1024 → "1.0 KB", 1048576 → "1.0 MB"
 *
 * @param {number} bytes - File size in bytes
 * @returns {string} Human-readable size
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Get a stable reaction message ID.
 *
 * IMPORTANT: This must be consistent across all clients.
 * We use _id (MongoDB ObjectId from DB) when available.
 * For optimistic/streaming messages we fall back to createdAt timestamp.
 * We NEVER use array index because it differs between clients.
 *
 * @param {object} msg - Message object
 * @returns {string} Stable ID for reaction tracking
 */
export const getMessageReactionId = (msg) => {
  // MongoDB _id is the most reliable — use it when available
  if (msg._id && typeof msg._id === "string" && !msg._id.startsWith("temp-")) {
    return msg._id;
  }
  // Fall back to createdAt ISO string — same across all clients
  if (msg.createdAt) return new Date(msg.createdAt).toISOString();
  // Streaming AI messages use the aiMessageId we set
  if (msg.streaming && msg._id) return msg._id;
  // Last resort — null means reactions are disabled for this message
  return null;
};

/**
 * Get the file type icon emoji for a given MIME type or filename.
 * Used in the file attachment preview card.
 *
 * @param {string} mime - MIME type string
 * @param {string} name - Filename (fallback)
 * @returns {string} Emoji icon
 */
export const fileTypeIcon = (mime = "", name = "") => {
  if (mime.startsWith("image/")) return "🖼️";
  if (mime.startsWith("video/")) return "🎬";
  if (mime.startsWith("audio/")) return "🎵";
  if (mime.includes("pdf")) return "📄";
  if (mime.includes("zip") || mime.includes("rar")) return "🗜️";
  if (mime.includes("word") || name.endsWith(".doc") || name.endsWith(".docx")) return "📝";
  if (mime.includes("spreadsheet") || name.endsWith(".xlsx")) return "📊";
  return "📎";
};
