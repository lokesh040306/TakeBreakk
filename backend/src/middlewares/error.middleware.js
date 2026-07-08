// src/middlewares/error.middleware.js

/**
 * ====================================================
 * GLOBAL ERROR HANDLING MIDDLEWARE
 * ====================================================
 *
 * IMPORTANT:
 * - This middleware MUST be the last middleware
 *   registered in app.js
 * - It catches all errors passed via next(err)
 *
 * Responsibilities:
 * - Normalize error response
 * - Log error details for debugging
 * - Prevent server crashes
 */
const errorMiddleware = (err, req, res, next) => {
  /**
   * ------------------------------------------------
   * ERROR NORMALIZATION
   * ------------------------------------------------
   */

  // Use provided status code or fallback to 500
  const statusCode = err.statusCode || 500;

  // Use provided error message or fallback
  const message = err.message || "Internal Server Error";

  /**
   * ------------------------------------------------
   * LOGGING
   * ------------------------------------------------
   * Useful for debugging and monitoring
   * Stack trace is logged server-side only
   */

  console.error("❌ Error:", {
    path: req.originalUrl,
    message,
    stack: err.stack,
  });

  /**
   * ------------------------------------------------
   * RESPONSE
   * ------------------------------------------------
   * Client receives a clean, safe error payload
   */

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorMiddleware;
