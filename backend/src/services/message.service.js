// src/services/message.service.js
import Message from "../models/Message.model.js";

/**
 * Save a message to the database.
 *
 * IMPORTANT: `expiresAt` must be passed — it is the same timestamp as the
 * parent room's expiresAt. The Message TTL index uses this field to
 * auto-delete the document when the room expires.
 *
 * Failure is non-fatal: a DB error won't break real-time delivery since
 * the socket broadcast already happened before this is called.
 *
 * @param {object} data
 * @param {string} data.roomId
 * @param {string} data.sender
 * @param {string} data.content
 * @param {string} [data.type="text"]
 * @param {object} [data.fileMeta]
 * @param {Date}   data.expiresAt  — required for TTL auto-deletion
 */
export const saveMessage = async (data) => {
  try {
    return await Message.create({
      roomId:    data.roomId,
      sender:    data.sender,
      content:   data.content,
      type:      data.type || "text",
      fileMeta:  data.fileMeta || null,
      expiresAt: data.expiresAt, // TTL — message dies when room dies
    });
  } catch (error) {
    console.error("❌ Failed to save message:", error.message);
    return null;
  }
};

/**
 * Fetch the last N messages for a room, sorted oldest → newest.
 * Called when a user joins so they can read prior conversation.
 */
export const getMessageHistory = async (roomId, limit = 50) => {
  try {
    return await Message.find({ roomId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();
  } catch (error) {
    console.error("❌ Failed to fetch message history:", error.message);
    return [];
  }
};
