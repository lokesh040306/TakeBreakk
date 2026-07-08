// src/pages/ChatRoom/hooks/useChatSocket.js
import { useEffect } from "react";
import { connectSocket, disconnectSocket } from "../../../services/socket";

/**
 * useChatSocket — registers all socket event listeners for the chat room.
 *
 * Uses named handler functions so socket.off() removes only our listeners,
 * never breaking Socket.IO's internal events.
 *
 * The `verifiedRoomId` parameter is the password-check token stored in
 * sessionStorage by the Home page after a successful HTTP join/create.
 * It is passed to connectSocket() as socket.handshake.auth.verified,
 * which the server checks before allowing room:join events through.
 */
const useChatSocket = ({
  socket,
  roomId,
  verifiedRoomId,  // from sessionStorage — proves HTTP password was checked
  navigate,
  toast,
  setMessages,
  setExpiresAt,
  setIsOwner,
  setMembers,
  setMemberCount,
  setTypingUser,
  setReactions,
  playPing,
}) => {
  useEffect(() => {
    // Connect with the verified token in socket auth
    connectSocket(verifiedRoomId);

    // ── Room lifecycle ──────────────────────────────────────────
    const onRoomJoined  = ({ expiresAt }) => setExpiresAt(expiresAt);
    const onRoomHistory = (history)      => setMessages(history);
    const onRoomOwner   = ({ isOwner })  => {
      setIsOwner(isOwner);
      if (isOwner) toast.info("You are the room owner");
    };

    // ── Members ─────────────────────────────────────────────────
    const onMembersList   = (list)      => setMembers(list);
    const onMembersUpdate = ({ count }) => setMemberCount(count);

    const onUserJoined = ({ username, socketId }) => {
      setMembers((prev) => [...prev, { username, socketId }]);
      setMessages((prev) => [...prev, { sender: "SYSTEM", content: `${username} joined the room` }]);
    };

    const onUserLeft = ({ username, socketId }) => {
      setMembers((prev) => prev.filter((u) => u.socketId !== socketId));
      setMessages((prev) => [...prev, { sender: "SYSTEM", content: `${username} left the room` }]);
    };

    // ── Messages ─────────────────────────────────────────────────
    const onMessageReceive = (data) => {
      setMessages((prev) => {
        // Replace optimistic temp message (file upload preview) with real one
        const filtered = prev.filter(
          (m) => !(m.isTemp && m.sender === data.sender && m.fileMeta?.name === data.fileMeta?.name)
        );
        return [...filtered, data];
      });
      playPing(); // sound notification when tab is hidden
    };

    // ── Typing ───────────────────────────────────────────────────
    const onTypingStart = ({ username }) => setTypingUser(username);
    const onTypingStop  = ()             => setTypingUser("");

    // ── Admin ────────────────────────────────────────────────────
    const onPasswordResponse = ({ password }) => toast.info(`Room password: ${password}`);
    const onKicked      = ({ message }) => { toast.error(message || "You were kicked");   setTimeout(() => navigate("/"), 1500); };
    const onRoomExpired = ({ message }) => { toast.error(message || "Room has expired");  setTimeout(() => navigate("/"), 1500); };
    const onError       = ({ message }) => toast.error(message || "Something went wrong");

    // ── Reactions ─────────────────────────────────────────────────
    const onReactionUpdate = ({ messageId, reactions }) => {
      setReactions((prev) => ({ ...prev, [messageId]: reactions }));
    };

    // Register
    socket.on("room:joined",            onRoomJoined);
    socket.on("room:history",           onRoomHistory);
    socket.on("room:owner",             onRoomOwner);
    socket.on("room:members:list",      onMembersList);
    socket.on("room:members:update",    onMembersUpdate);
    socket.on("user:joined",            onUserJoined);
    socket.on("user:left",              onUserLeft);
    socket.on("message:receive",        onMessageReceive);
    socket.on("typing:start",           onTypingStart);
    socket.on("typing:stop",            onTypingStop);
    socket.on("room:password:response", onPasswordResponse);
    socket.on("room:kicked",            onKicked);
    socket.on("room:expired",           onRoomExpired);
    socket.on("error",                  onError);
    socket.on("reaction:update",        onReactionUpdate);

    // Cleanup on unmount
    return () => {
      socket.off("room:joined",            onRoomJoined);
      socket.off("room:history",           onRoomHistory);
      socket.off("room:owner",             onRoomOwner);
      socket.off("room:members:list",      onMembersList);
      socket.off("room:members:update",    onMembersUpdate);
      socket.off("user:joined",            onUserJoined);
      socket.off("user:left",              onUserLeft);
      socket.off("message:receive",        onMessageReceive);
      socket.off("typing:start",           onTypingStart);
      socket.off("typing:stop",            onTypingStop);
      socket.off("room:password:response", onPasswordResponse);
      socket.off("room:kicked",            onKicked);
      socket.off("room:expired",           onRoomExpired);
      socket.off("error",                  onError);
      socket.off("reaction:update",        onReactionUpdate);
      disconnectSocket();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useChatSocket;
