// src/config/db.js
import mongoose from "mongoose";
import env from "./env.js";

/**
 * Connect to MongoDB with hardened options.
 *
 * PHASE 2 additions:
 * - serverSelectionTimeoutMS: fail fast if Mongo is unreachable (5s)
 * - socketTimeoutMS: close idle sockets after 45s
 * - maxPoolSize: limit concurrent connections (default is 100, overkill for small apps)
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS:          45000,
      maxPoolSize:              10,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
