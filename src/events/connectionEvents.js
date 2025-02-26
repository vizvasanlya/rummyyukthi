module.exports = (io, socket, activeUsers, socketToUser, playerRooms) => {
  // User goes online (or reconnects)
  socket.on("user-online", async ({ userId, username }) => {
      if (!userId || !username) return;

      // Remove any old instance of the user
      if (activeUsers.has(userId)) {
          const oldSocketId = activeUsers.get(userId).socketId;
          socketToUser.delete(oldSocketId);
      }

      // Store new socket connection
      activeUsers.set(userId, { socketId: socket.id, username });
      socketToUser.set(socket.id, userId);

      console.log(`✅ User Online: ${username} (ID: ${userId}, Socket: ${socket.id})`);

      // 🔄 Check if the user was in a game room before disconnecting
      const previousRoom = playerRooms.get(userId); // Retrieve the room ID

      if (previousRoom) {
          socket.join(previousRoom); // Rejoin the room
          console.log(`🔄 Rejoining ${username} to Room: ${previousRoom}`);

          // Send the latest game state to the reconnected player
          const roomData = await redis.get(`room:${previousRoom}`);
          if (roomData) {
              socket.emit("rejoin-game", JSON.parse(roomData));
          }
      }

      // Broadcast updated active users list
      io.emit("active-users", Array.from(activeUsers.values()));
  });

  // User disconnects
  socket.on("disconnect", () => {
      const userId = socketToUser.get(socket.id);
      if (userId && activeUsers.has(userId)) {
          activeUsers.delete(userId);
          socketToUser.delete(socket.id);

          console.log(`❌ User Offline: ${userId} (Socket: ${socket.id})`);

          // Broadcast updated active users list only if a user was removed
          io.emit("active-users", Array.from(activeUsers.values()));
      }
  });

  // Store the player's room when they join
  socket.on("joinRoom", ({ userId, roomId }) => {
      if (!userId || !roomId) return;
      playerRooms.set(userId, roomId); // Store the room ID for reconnections
  });

  // Remove player's room if they leave the game
  socket.on("leaveRoom", ({ userId }) => {
      if (!userId) return;
      playerRooms.delete(userId); // Remove from tracking
  });
};
