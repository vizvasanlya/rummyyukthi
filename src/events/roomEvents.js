const { v4: uuidv4 } = require("uuid");
const GameRoom = require("../models/gameRoom.model");
const { startGame } = require("./gameEvents");

module.exports = (io, socket, redis) => {
  socket.on("joinRoom", async ({ gameType, playerLimit, perPointValue, poolType, numberOfDeals, entryFee, userId, username }) => {
    if (!userId || !gameType || !playerLimit || (gameType !== "points" && !entryFee)) {
      return socket.emit("error", { message: "Missing required parameters" });
    }

    let roomId = null;
    let room = null;

    const rooms = await redis.keys("room:*");

    for (const key of rooms) {
      const roomData = await redis.get(key);
      if (!roomData) continue;
      const parsedRoom = JSON.parse(roomData);

      if (
        parsedRoom.gameType === gameType &&
        parsedRoom.playerLimit === playerLimit &&
        parsedRoom.gameStatus === "waiting" &&
        parsedRoom.players.length < playerLimit &&
        !parsedRoom.players.some((p) => p.userId === userId) &&
        (
          (gameType === "points" && Number(parsedRoom.perPointValue) === Number(perPointValue)) ||
          (gameType === "deals" && parsedRoom.numberOfDeals == numberOfDeals && Number(parsedRoom.entryFee) === Number(entryFee)) ||
          (gameType === "pool" && parsedRoom.poolType == poolType && Number(parsedRoom.entryFee) === Number(entryFee))
        )
      ) {
        room = parsedRoom;
        roomId = room.roomId;
        break;
      }
    }

    if (!room) {
      roomId = uuidv4();
      room = {
        roomId,
        gameType,
        playerLimit,
        perPointValue,
        poolType,
        numberOfDeals,
        entryFee,
        players: [],
        gameStatus: "waiting",
        turnIndex: 0,
        deck: [],
        openDeck: [],
        scoreboard: [],
      };

      await redis.set(`room:${roomId}`, JSON.stringify(room), "EX", 3600);
      await GameRoom.create({
        roomId,
        gameType,
        playerLimit,
        perPointValue,
        poolType,
        numberOfDeals,
        entryFee,
        gameStatus: "waiting",
      });
    }

    room.players.push({
      username,
      userId,
      socketId: socket.id,
      status: "joined",
      score: 0,
      hand: [],
    });

    await redis.set(`room:${roomId}`, JSON.stringify(room), "EX", 3600);
    await GameRoom.updateOne({ roomId }, { $set: { players: room.players } });

    socket.join(roomId);
io.to(socket.id).emit("roomJoined", { roomId, gameType, playerLimit, entryFee, poolType });
io.to(roomId).emit("playersUpdate", room);

    if (room.players.length === playerLimit) {
      room.gameStatus = "in-progress";
      await redis.set(`room:${roomId}`, JSON.stringify(room), "EX", 3600);
      await GameRoom.updateOne({ roomId }, { $set: { gameStatus: "in-progress" } });
      startGame(io, roomId, redis);
    }
  });

  socket.on("leaveRoom", async ({ userId }) => {
    try {
      let roomKeyToDelete = null;
      let roomIdToDelete = null;

      const rooms = await redis.keys("room:*");
      let room = null;

      for (const key of rooms) {
        const roomData = await redis.get(key);
        if (!roomData) continue;

        let parsedRoom;
        try {
          parsedRoom = JSON.parse(roomData);
        } catch {
          continue;
        }

        if (!parsedRoom || !Array.isArray(parsedRoom.players)) continue;

        if (parsedRoom.players.some((p) => p.userId === userId)) {
          room = parsedRoom;
          roomKeyToDelete = key;
          break;
        }
      }

      if (!room) return;

      const playerIndex = room.players.findIndex((p) => p.userId === userId);
      if (playerIndex === -1) return;

      if (room.gameStatus === "waiting") {
        room.players.splice(playerIndex, 1);
        socket.leave(room.roomId);
      } else {
        room.players[playerIndex].status = "disconnected";
      }

      if (room.players.length === 0) {
        roomIdToDelete = room.roomId;
      } else {
        await redis.set(`room:${room.roomId}`, JSON.stringify(room));
        await GameRoom.updateOne({ roomId: room.roomId }, { $set: { players: room.players } });
        io.to(room.roomId).emit("playersUpdate", room);
      }

      if (roomIdToDelete && roomKeyToDelete) {
        await redis.del(roomKeyToDelete);
        await GameRoom.deleteOne({ roomId: roomIdToDelete });
      }
    } catch (error) {
      console.error(`❌ Error handling leaveRoom event for user ${userId}:`, error);
    }
  });
};
