import multer from "multer";

/**
 * Multer memory storage
 * - No files saved to disk
 * - Perfect for cloud uploads
 */
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 250 * 1024 * 1024, // 250MB
  },
});
