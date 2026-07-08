// src/services/room.service.js
import bcrypt from "bcryptjs";
import Room from "../models/Room.model.js";
import generateRoomId from "../utils/generateRoomId.js";
import { ROOM_DURATIONS } from "../utils/constants.js";
import { calculateExpiryTime, isRoomExpired } from "../utils/timeUtils.js";

const BCRYPT_ROUNDS = 10;

/**
 * Create a new anonymous chat room.
 * Password is bcrypt-hashed before storage — plain text is never saved.
 */
export const createRoom = async (password, durationInMinutes) => {
  if (!ROOM_DURATIONS.includes(durationInMinutes)) {
    throw new Error("Invalid room duration selected");
  }

  const roomId = generateRoomId();
  const expiresAt = calculateExpiryTime(durationInMinutes);
  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  return Room.create({
    roomId,
    password: hashedPassword,
    durationInMinutes,
    expiresAt,
    isActive: true,
  });
};

/**
 * Find an active room by roomId.
 * Auto-deactivates the room on lookup if it has expired.
 */
export const findRoomById = async (roomId) => {
  const room = await Room.findOne({ roomId });

  if (!room) throw new Error("Room not found");

  if (!room.isActive || isRoomExpired(room.expiresAt)) {
    room.isActive = false;
    await room.save();
    throw new Error("Room has expired");
  }

  return room;
};

/**
 * Validate room password using bcrypt comparison.
 * Uses a generic error message so it never reveals whether the
 * room ID or the password was the part that was wrong.
 */
export const validateRoomPassword = async (room, password) => {
  const isMatch = await bcrypt.compare(password, room.password);
  if (!isMatch) throw new Error("Invalid room ID or password");
  return true;
};
