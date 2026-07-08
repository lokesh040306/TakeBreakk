// src/utils/timeUtils.js

/**
 * Calculate the exact expiry timestamp for a room.
 *
 * @param {number} durationInMinutes - Room lifetime in minutes
 * @returns {Date} The timestamp when the room should expire
 */
export const calculateExpiryTime = (durationInMinutes) => {
  const now = new Date();
  return new Date(now.getTime() + durationInMinutes * 60 * 1000);
};

/**
 * Check whether a room has already expired.
 *
 * @param {Date} expiresAt - Room expiry timestamp
 * @returns {boolean} true if the room is expired (or has no expiry set)
 */
export const isRoomExpired = (expiresAt) => {
  if (!expiresAt) return true;
  return new Date() > new Date(expiresAt);
};
