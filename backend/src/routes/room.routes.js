// src/routes/room.routes.js
import express from "express";
import { createRoomController, joinRoomController } from "../controllers/room.controller.js";
import { roomActionLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

// PHASE 2: roomActionLimiter applied — max 10 attempts per 15 min per IP
router.post("/create", roomActionLimiter, createRoomController);
router.post("/join",   roomActionLimiter, joinRoomController);

export default router;
