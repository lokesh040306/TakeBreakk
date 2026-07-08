// src/controllers/upload.controller.js
import cloudinary from "../config/cloudinary.js";
import { saveMessage } from "../services/message.service.js";
import { findRoomById } from "../services/room.service.js";
import socketManager from "../config/socket.js";

/**
 * POST /api/uploads/file
 *
 * Handles file uploads (image, video, generic file):
 * 1. Validates the room is still active
 * 2. Uploads the file buffer to Cloudinary
 * 3. Saves the message to DB with expiresAt (for TTL auto-deletion)
 * 4. Emits the saved message to all room members via socket
 */
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { roomId, username } = req.body;
    if (!roomId || !username) {
      return res.status(400).json({ message: "roomId and username are required" });
    }

    // Verify room exists and is active — also gives us expiresAt for the TTL field
    const room = await findRoomById(roomId);

    // Determine Cloudinary resource type from MIME
    let resourceType = "raw";
    if (req.file.mimetype.startsWith("image/")) resourceType = "image";
    else if (req.file.mimetype.startsWith("video/")) resourceType = "video";

    // Upload file buffer to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: `chat/${roomId}`, resource_type: resourceType },
          (error, result) => (error ? reject(error) : resolve(result))
        )
        .end(req.file.buffer);
    });

    // Map Cloudinary resource_type back to our message type
    let type = "file";
    if (uploadResult.resource_type === "image") type = "image";
    else if (uploadResult.resource_type === "video") type = "video";

    // Persist message — include expiresAt so MongoDB TTL auto-deletes it
    const savedMessage = await saveMessage({
      roomId,
      sender:   username,
      content:  uploadResult.secure_url,
      type,
      fileMeta: {
        name: req.file.originalname,
        size: req.file.size,
        mime: req.file.mimetype,
      },
      expiresAt: room.expiresAt, // copied from parent room for TTL
    });

    // Broadcast to all room members
    const io = socketManager.getIO();
    io.to(roomId).emit("message:receive", savedMessage);

    return res.status(201).json(savedMessage);
  } catch (err) {
    console.error("❌ Upload error:", err.message);
    next(err);
  }
};
