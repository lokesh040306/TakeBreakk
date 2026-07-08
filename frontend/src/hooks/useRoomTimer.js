// src/hooks/useRoomTimer.js
import { useEffect, useState } from "react";

/**
 * Calculates remaining time for a room
 */
const useRoomTimer = (expiresAt) => {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const diff = new Date(expiresAt) - new Date();
      setRemaining(diff > 0 ? diff : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return remaining;
};

export default useRoomTimer;
