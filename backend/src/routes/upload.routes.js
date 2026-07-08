// src/routes/upload.routes.js

import express from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { uploadFile } from "../controllers/upload.controller.js";

// Create a new Express router instance
const router = express.Router();

/**
 * =========================
 * FILE UPLOAD ROUTES
 * =========================
 *
 * This route handles:
 * - Uploading files (images, videos, documents)
 * - Parsing multipart/form-data via multer
 *
 * NOTE:
 * - Actual upload configuration is handled in middleware
 * - Business logic lives in the controller
 */

/**
 * Upload a single file
 * POST /api/uploads/file
 *
 * Expected form-data:
 * - file (multipart file field)
 *
 * Middleware flow:
 * 1. upload.single("file") → handles multipart parsing
 * 2. uploadFile controller → processes & responds
 */
router.post("/file", upload.single("file"), uploadFile);

export default router;
