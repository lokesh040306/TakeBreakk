/**
 * useScrollToBottom.js
 *
 * Manages auto-scroll behavior for the chat message container.
 *
 * Behavior:
 * - If user is already at the bottom → auto-scroll on new messages
 * - If user has scrolled up → show "N new" badge button instead
 * - Clicking the scroll button returns to bottom and clears unread count
 *
 * Returns refs for the container and scroll anchor, plus state/actions.
 */
import { useCallback, useEffect, useRef, useState } from "react";

export const useScrollToBottom = (messages) => {
  const containerRef  = useRef(null); // ref for the scrollable div
  const endRef        = useRef(null); // ref for the invisible anchor at the bottom
  const prevLengthRef = useRef(messages.length);

  const [isAtBottom,  setIsAtBottom]  = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Detect scroll position changes
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      // Consider "at bottom" if within 60px of the bottom
      const atBottom = scrollHeight - scrollTop - clientHeight < 60;
      setIsAtBottom(atBottom);
      if (atBottom) setUnreadCount(0);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // When new messages arrive, auto-scroll or increment unread count
  useEffect(() => {
    const newCount = messages.length - prevLengthRef.current;
    prevLengthRef.current = messages.length;

    if (newCount <= 0) return;

    if (isAtBottom) {
      // User is at bottom — scroll to show new message
      endRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnreadCount(0);
    } else {
      // User scrolled up — increment the unread badge
      setUnreadCount((prev) => prev + newCount);
    }
  }, [messages, isAtBottom]);

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
    setUnreadCount(0);
    setIsAtBottom(true);
  }, []);

  return { containerRef, endRef, isAtBottom, unreadCount, scrollToBottom };
};

export default useScrollToBottom;
