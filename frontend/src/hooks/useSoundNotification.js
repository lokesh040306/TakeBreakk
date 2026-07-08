// src/hooks/useSoundNotification.js
import { useCallback, useRef, useState } from "react";

/**
 * useSoundNotification
 * - Plays a subtle ping when a new message arrives and tab is not focused
 * - Sound toggle persisted to localStorage
 * - Uses Web Audio API — no external audio file needed
 */
export const useSoundNotification = () => {
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem("sound_enabled") !== "false"
  );
  const audioCtxRef = useRef(null);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      localStorage.setItem("sound_enabled", String(!prev));
      return !prev;
    });
  }, []);

  const playPing = useCallback(() => {
    if (!soundEnabled) return;
    if (document.visibilityState === "visible") return; // only when tab is hidden

    try {
      // Lazy-init AudioContext (must be after user interaction)
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;

      // Create a short pleasant ping: 880Hz → fade out
      const oscillator = ctx.createOscillator();
      const gainNode   = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type      = "sine";
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } catch {
      // Silently fail — audio is non-critical
    }
  }, [soundEnabled]);

  return { soundEnabled, toggleSound, playPing };
};
