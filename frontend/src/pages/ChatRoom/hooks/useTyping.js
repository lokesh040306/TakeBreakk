/**
 * useTyping.js
 *
 * Manages typing indicator events.
 * - Emits "typing:start" on every keystroke
 * - Emits "typing:stop" 800ms after the last keystroke (debounced)
 * - Also updates the message input state
 *
 * The backend broadcasts these events to all OTHER users in the room
 * (socket.to(roomId)), so the sender never sees their own indicator.
 */
const useTyping = (socket, setMessage, typingTimeoutRef) => {

  /**
   * Called on every input change event.
   * Updates the message state AND emits typing events.
   */
  const handleTyping = (e) => {
    // Update the controlled input value
    setMessage(e.target.value);

    // Emit typing start immediately
    socket.emit("typing:start");

    // Reset the debounce timer on each keystroke
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      // Emit typing stop after 800ms of inactivity
      socket.emit("typing:stop");
    }, 800);
  };

  /**
   * Called when message is sent or input is cleared.
   * Immediately stops the typing indicator.
   */
  const stopTyping = () => {
    clearTimeout(typingTimeoutRef.current);
    socket.emit("typing:stop");
  };

  return { handleTyping, stopTyping };
};

export default useTyping;
