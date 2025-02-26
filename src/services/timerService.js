const timers = new Map(); // Stores timers per room
const turnService = require("./turnService");
const redisClient = require("../config/redisClient");

async function startTurnTimer(io, roomId, userId) {
    console.log(`🚀 [TIMER] Starting turn timer for room: ${roomId}, user: ${userId}`);

    if (timers.has(roomId)) {
        clearTimeout(timers.get(roomId));
        timers.delete(roomId);
    }

    let roomData;
    try {
        roomData = await redisClient.get(`room:${roomId}`);
        if (!roomData) throw new Error(`No room data found for ${roomId}`);
    } catch (error) {
        console.error(`❌ [REDIS ERROR] Failed to fetch room data:`, error);
        return;
    }

    let room = JSON.parse(roomData);
    if (!room || typeof room !== "object" || !Array.isArray(room.players)) return;

    let player = room.players.find(p => String(p.userId).trim() === String(userId).trim());
    if (!player) return console.log(`⚠️ [TIMER] Player ${userId} not found in room ${roomId}`);

    if (player.status === "dropped") {
        console.log(`⚠️ [TIMER] Player ${userId} already dropped. Moving to next turn.`);
        await handleTurnChange(io, room, roomId);
        return;
    }

    let warnings = 0;

    async function forceDiscard() {
        console.log(`🔥 [DISCARD] Checking for auto-discard...`);

        if (!player.lastDrawnCard || player.lastDrawnTurn !== room.currentTurn) {
            return console.log(`⚠️ [DISCARD] No valid last drawn card for ${userId}, skipping discard.`);
        }

        console.log(`🃏 [DISCARD] Auto-discarding card:`, player.lastDrawnCard);

        const discardedCard = player.lastDrawnCard;
        player.hand = player.hand.filter(
            card => card.rank !== discardedCard.rank || card.suit !== discardedCard.suit
        );

        room.openDeck.push(discardedCard);
        player.lastDrawnCard = null;
        player.lastDrawnTurn = null;

        io.to(roomId).emit("cardDiscarded", { userId, discardedCard });

        await redisClient.set(`room:${roomId}`, JSON.stringify(room));

        await handleTurnChange(io, room, roomId);
    }

    async function handleTimeout() {
        console.log(`⏳ [TIMER] Timeout triggered for ${userId}, warnings: ${warnings}`);

        if (warnings === 0) {
            warnings += 1;
            console.log(`⚠️ [TIMER] Warning issued: Extra 30s granted to ${userId}`);
            io.to(roomId).emit("turnWarning", { userId, message: "Extra 30s granted" });
            timers.set(roomId, setTimeout(handleTimeout, 30000));
        } else {
            console.log(`❌ [TIMER] Player ${userId} missed turn, processing auto-discard...`);
            player.missedTurns = (player.missedTurns || 0) + 1;

            if (player.missedTurns >= 3) {
                console.log(`🚨 [TIMER] Player ${userId} dropped from game.`);
                player.status = "dropped";
                io.to(roomId).emit("playerDropped", { userId });

                room.players = room.players.filter(p => p.status !== "dropped");

                if (room.players.length === 1) {  // Check if only one player is left
                    await emitGameOver(io, roomId, room);
                    return;
                }

                await redisClient.set(`room:${roomId}`, JSON.stringify(room));
            }

            if (player.lastDrawnCard && player.lastDrawnTurn === room.currentTurn) {
                await forceDiscard();
            } else {
                await handleTurnChange(io, room, roomId);
            }
        }
    }

    const timer = setTimeout(handleTimeout, 30000);
    timers.set(roomId, timer);
}

function clearTurnTimer(roomId) {
    if (timers.has(roomId)) {
        clearTimeout(timers.get(roomId));
        timers.delete(roomId);
    }
}

async function handleTurnChange(io, gameRoom, roomId) {
    console.log(`🔄 [TURN] Handling turn change for room: ${roomId}`);

    gameRoom.players = gameRoom.players.filter(p => p.status !== "dropped");

    if (gameRoom.players.length < 2) {
        await emitGameOver(io, roomId, gameRoom);
        return;
    }

    const result = turnService.changeTurn(gameRoom);

    if (result.nextTurn !== gameRoom.currentTurn) {
        gameRoom.currentTurn = result.nextTurn;
        io.to(roomId).emit("turnChanged", { currentTurn: result.nextTurn });

        await redisClient.set(`room:${roomId}`, JSON.stringify(gameRoom));
        startTurnTimer(io, roomId, result.nextTurn);
    }
}
async function emitGameOver(io, roomId, gameRoom) {
    console.log(`🏆 [GAME OVER] Declaring winner and sending final results.`);

    const finalResults = gameRoom.players.map(player => ({
        userId: player.userId,
        username: player.username,
        hand: player.hand,  
        score: player.score
    }));

    io.to(roomId).emit("gameOver", {
        winner: gameRoom.players[0]?.userId,
        results: finalResults,
        roomId
    });

    gameRoom.gameStatus = "completed";
    await redisClient.set(`room:${roomId}`, JSON.stringify(gameRoom));
    clearTurnTimer(roomId);
}

module.exports = { startTurnTimer, clearTurnTimer };
