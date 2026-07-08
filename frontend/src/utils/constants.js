// src/utils/constants.js

export const ROOM_DURATIONS = [15, 30, 45, 60];

export const SOCKET_EVENTS = {
  ROOM_JOIN:    "room:join",
  ROOM_EXPIRED: "room:expired",

  MESSAGE_SEND:    "message:send",
  MESSAGE_RECEIVE: "message:receive",

  USER_JOINED: "user:joined",
  USER_LEFT:   "user:left",

  TYPING_START: "typing:start",
  TYPING_STOP:  "typing:stop",

  REACTION_ADD:    "reaction:add",
  REACTION_UPDATE: "reaction:update",
};

// Available reaction emojis
export const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];
