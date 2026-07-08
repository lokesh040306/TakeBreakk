// src/services/api.js
import axios from "axios";

/**
 * Axios instance
 * Central place for all backend API calls
 */

// Backend base URL from .env
const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Create a new room
 * @param {string} password
 * @param {number} durationInMinutes
 */
export const createRoom = async (password, durationInMinutes) => {
  const response = await api.post("/api/rooms/create", {
    password,
    durationInMinutes,
  });

  return response.data;
};

/**
 * Join an existing room
 * @param {string} roomId
 * @param {string} password
 */
export const joinRoom = async (roomId, password) => {
  const response = await api.post("/api/rooms/join", {
    roomId,
    password,
  });

  return response.data;
};

export default api;
