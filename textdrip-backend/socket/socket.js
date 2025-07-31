const { Server } = require("socket.io");
const { seenSingleMessage } = require("../utils/utils");

// Store online users
let onlineUsers = {};
let seenMessages = {};

let io = null;

function connectSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", async (socket) => {
    console.log("Socket connected...");

    socket.on("joinApp", ({ userId }) => {
      if (!userId) return;
      if (!onlineUsers[userId]) {
        onlineUsers[userId] = new Set();
      }

      onlineUsers[userId].add(socket.id); // Store multiple socket IDs
      console.log(`User ${userId} connected with socket ${socket.id}`);
    });

    socket.on("joinConversation", async (req) => {
      const { id } = req;
      socket.join(`CONVERSATION__${id}`);
    });

    socket.on("disconnectConversation", (req) => {
      const { id } = req;
      socket.leave(`CONVERSATION__${id}`);
    });

    socket.on("messageSeen", ({ messageId, userId }) => {
      if(!userId) return;
      if (seenMessages[messageId]?.timeoutId) {
        clearTimeout(seenMessages[messageId]?.timeoutId);
      }

      if (!seenMessages[messageId]?.userIds) {
        seenMessages[messageId] = {
          userIds: new Set(),
          timeoutId: null,
        };
      }
      seenMessages[messageId].userIds.add(userId);

      seenMessages[messageId].timeoutId = setTimeout(async () => {
        await seenSingleMessage(
          messageId,
          [...seenMessages[messageId].userIds],
          io
        );
        delete seenMessages[messageId];
      }, 500);
    });

    socket.on("disconnect", () => {
      try {
        for (const userId in onlineUsers) {
          if (!onlineUsers[userId]) continue;
          onlineUsers[userId] = new Set([
            ...[...onlineUsers[userId]]?.filter?.((id) => id !== socket.id),
          ]);
          // If user has no more active sockets, remove them from onlineUsers
          if (onlineUsers?.[userId]?.length === 0) {
            delete onlineUsers[userId];
          }
        }
        console.log(`Socket ${socket.id} disconnected`);
      } catch (err) {
        console.log("Err disconnecting data", err);
      }
    });
  });
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized! Call connectSocket first.");
  }
  return io;
}

function emitRefreshEvent(userIds, type, id, message) {
  new Set(userIds).forEach((usrId) => {
    const userId = String(usrId);
    if (!onlineUsers[userId]) return;
    onlineUsers[userId].forEach((socketId) => {
      io.to(socketId).emit(`conversation-refresh`, {
        id,
        message,
        type: type.toLowerCase(),
      });
    });
  });
}

function emitRemoveCountEvent(userIds, type, id) {
  new Set(userIds).forEach((usrId) => {
    const userId = String(usrId);
    if (!onlineUsers[userId]) return;
    onlineUsers[userId].forEach((socketId) => {
      io.to(socketId).emit(`conversation-remove-count`, {
        id,
        type: type.toLowerCase(),
      });
    });
  });
}


function emitUpdateEvent(userIds, type, id, details) {
  new Set(userIds).forEach((usrId) => {
    const userId = String(usrId);
    if (!onlineUsers[userId]) return;
    onlineUsers[userId].forEach((socketId) => {
      io.to(socketId).emit(`conversation-updated`, {
        id,
        details,
        type: type.toLowerCase(),
      });
    });
  });
}

module.exports = {
  getIO,
  emitRefreshEvent,
  connectSocket,
  onlineUsers,
  emitUpdateEvent,
  emitRemoveCountEvent,
};
