// src/config/cloudinary.js

import { v2 as cloudinary } from "cloudinary";
import env from "./env.js";

/**
 * ====================================================
 * CLOUDINARY CONFIGURATION
 * ====================================================
 *
 * Purpose:
 * - Configure Cloudinary SDK with credentials
 * - Enable secure media uploads (image, video, files)
 *
 * IMPORTANT:
 * - Credentials are loaded from environment variables
 * - This file should be imported before using Cloudinary
 */

// Initialize Cloudinary configuration
cloudinary.config({
  // Cloudinary account name
  cloud_name: env.CLOUDINARY_CLOUD_NAME,

  // API key for authentication
  api_key: env.CLOUDINARY_API_KEY,

  // API secret for authentication
  api_secret: env.CLOUDINARY_API_SECRET,
});

// Export configured Cloudinary instance
export default cloudinary;
