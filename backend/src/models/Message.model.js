// src/models/Message.model.js
import mongoose from "mongoose";

/**
 * Message Schema
 *
 * AUTO-DELETION STRATEGY:
 * Messages are deleted automatically in two ways:
 *
 * 1. MongoDB TTL index on `expiresAt`:
 *    Every message stores the same expiresAt as its parent room.
 *    MongoDB's background thread deletes message documents automatically
 *    once that timestamp passes — no application code required.
 *    (TTL background thread runs approximately every 60 seconds.)
 *
 * 2. Explicit deleteMany in code (belt-and-suspenders):
 *    - timer.service.js calls Message.deleteMany() when the watcher
 *      fires, catching rooms that expire while members are present.
 *    - cleanupEmptyRoom() in room.socket.js calls Message.deleteMany()
 *      when all members disconnect before the timer expires.
 *
 * This dual approach means messages are always cleaned up regardless
 * of how the room ends (timer expiry vs. everyone leaves early).
 */
const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },

    sender: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["text", "image", "video", "file"],
      default: "text",
    },

    // Text content or Cloudinary URL for media messages
    content: {
      type: String,
      required: true,
      trim: true,
    },

    // Only set for image / video / file messages
    fileMeta: {
      name: String,
      size: Number,
      mime: String,
    },

    /**
     * TTL field — copied from the parent Room's expiresAt on save.
     * MongoDB will automatically delete this document when this
     * timestamp is reached (within ~60s precision).
     *
     * Set by saveMessage() in message.service.js.
     */
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL index
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
