// src/models/Room.model.js
import mongoose from "mongoose";

/**
 * Room Schema
 *
 * PHASE 2 CHANGES:
 * - Password field now stores bcrypt hash (not plain text)
 * - TTL index on expiresAt: MongoDB auto-deletes expired room docs
 *   after a grace period — eliminates the need for polling watcher
 *   to delete documents (watcher still emits socket events, but
 *   MongoDB handles actual deletion natively)
 */
const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },

    // Stores bcrypt hash — never plain text
    password: {
      type: String,
      required: true,
    },

    durationInMinutes: {
      type: Number,
      required: true,
    },

    // TTL index: MongoDB auto-expires documents 0 seconds after expiresAt
    // This is more efficient than a polling setInterval
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index — removes doc when expiresAt is reached
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);
export default Room;
