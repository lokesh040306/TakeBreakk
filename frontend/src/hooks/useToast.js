// src/hooks/useToast.js
import { useCallback, useState } from "react";

/**
 * useToast
 * Returns { toasts, toast, removeToast }
 *
 * Usage:
 *   const { toasts, toast, removeToast } = useToast();
 *   toast.success("Room created!");
 *   toast.error("Something went wrong");
 *   toast.info("Copied to clipboard");
 */
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, "success"),
    error:   (msg) => addToast(msg, "error"),
    info:    (msg) => addToast(msg, "info"),
  };

  return { toasts, toast, removeToast };
};
