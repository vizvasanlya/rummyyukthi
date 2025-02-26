const socketIO = require("socket.io");
const redis = require("./config/redisClient"); // Import Redis client

// Import event handlers
const connectionEvents = require("./events/connectionEvents");
const roomEvents = require("./events/roomEvents");
// const gameEvents = require("./events/gameEvents");
const turnEvents = require("./events/turnEvents");
const resultEvents = require("./events/resultEvents");

// Store active users in memory (only for tracking connections)
const activeUsers = new Map(); 
const gameRooms = new Map();

module.exports = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "*", // Allow all origins (adjust for production)
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Handle new connections
  io.on("connection", (socket) => {
    console.log(`🔵 New connection: ${socket.id}`);

    // Send a welcome message back to the client
    socket.emit("welcome", { message: "Connected to WebSocket server!" });

    // Register event handlers and pass Redis instead of gameRooms
    connectionEvents(io, socket, activeUsers, redis,gameRooms);
    roomEvents(io, socket, redis, gameRooms);
    // gameEvents(io, socket, redis, gameRooms);
    turnEvents(io, socket, redis, gameRooms);
    resultEvents(io, socket, redis, gameRooms);

    // ✅ Add listener for starting a game
    socket.on("startGame", async ({ roomId }) => {
      console.log(`🟢 Received startGame event for room ${roomId}`);
      await startGame(io, roomId, redis, gameRooms);
    });

    socket.onAny((event, data) => {
      console.log(`📡 Received event: ${event}`, data);
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log(`🔴 Disconnected: ${socket.id} Reason: ${reason}`);

      // Remove user from active users
      for (const [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          activeUsers.delete(userId);
          console.log(`❌ Removed ${userId} from active users.`);
          break;
        }
      }
    });
  });

  return io;
};
