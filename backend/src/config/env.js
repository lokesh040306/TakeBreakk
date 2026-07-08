// src/config/env.js
import dotenv from "dotenv";

dotenv.config();

/**
 * Safely retrieve an environment variable.
 * Throws on startup if a required variable is missing and has no default,
 * so the app fails fast rather than running with undefined config values.
 */
const getEnv = (key, defaultValue = undefined) => {
  const value = process.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value ?? defaultValue;
};

/**
 * All environment variables the backend needs.
 * Never call process.env directly outside of this file.
 */
const env = {
  PORT:     getEnv("PORT", 5000),
  NODE_ENV: getEnv("NODE_ENV", "development"),

  MONGO_URI:   getEnv("MONGO_URI"),
  CLIENT_URL:  getEnv("CLIENT_URL", "http://localhost:5173"),

  CLOUDINARY_CLOUD_NAME:  getEnv("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY:     getEnv("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET:  getEnv("CLOUDINARY_API_SECRET"),
};

export default env;
