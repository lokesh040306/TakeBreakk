// src/controllers/room.controller.js
import {
  createRoom,
  findRoomById,
  validateRoomPassword,
} from "../services/room.service.js";

/**
 * POST /api/rooms/create
 *
 * PHASE 2: Added password min-length validation (4 chars).
 */
export const createRoomController = async (req, res, next) => {
  try {
    const { password, durationInMinutes } = req.body;

    if (!password || !durationInMinutes) {
      return res.status(400).json({
        success: false,
        message: "Password and duration are required",
      });
    }

    // Enforce minimum password length
    if (String(password).trim().length < 4) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 4 characters",
      });
    }

    const room = await createRoom(String(password).trim(), Number(durationInMinutes));

    return res.status(201).json({
      success: true,
      data: {
        roomId:            room.roomId,
        expiresAt:         room.expiresAt,
        durationInMinutes: room.durationInMinutes,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/rooms/join
 *
 * PHASE 2: validateRoomPassword is now async (bcrypt compare).
 * Generic error message avoids leaking whether room or password was wrong.
 */
export const joinRoomController = async (req, res, next) => {
  try {
    const { roomId, password } = req.body;

    if (!roomId || !password) {
      return res.status(400).json({
        success: false,
        message: "Room ID and password are required",
      });
    }

    const room = await findRoomById(String(roomId).trim().toUpperCase());

    // PHASE 2: now awaited — bcrypt.compare is async
    await validateRoomPassword(room, String(password));

    return res.status(200).json({
      success: true,
      data: {
        roomId:    room.roomId,
        expiresAt: room.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
