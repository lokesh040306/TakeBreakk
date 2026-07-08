// src/utils/constants.js

export const ROOM_DURATIONS = Object.freeze([15, 30, 45, 60]);

export const SOCKET_EVENTS = Object.freeze({
  ROOM_JOIN:    "room:join",
  ROOM_EXPIRED: "room:expired",

  MESSAGE_SEND:    "message:send",
  MESSAGE_RECEIVE: "message:receive",

  TYPING_START: "typing:start",
  TYPING_STOP:  "typing:stop",

  USER_JOINED: "user:joined",
  USER_LEFT:   "user:left",

  REACTION_ADD:    "reaction:add",
  REACTION_UPDATE: "reaction:update",
});
