const { validateHand } = require("../utils/rummyLogic");
const redisClient = require("../config/redisClient");
const { startTurnTimer, clearTurnTimer } = require("../services/timerService"); // ✅ Correct Import
const turnService = require("../services/turnService");
const { 
    calculatePlayerScore, 
    updateScoresAfterDeclaration, 
    checkPoolEliminations 
} = require("../services/scoreService"); // Adjust path if necessary
module.exports = (io, socket, gameRooms) => {
    socket.on("drawCard", async ({ roomId, userId, deckType }) => {
        console.log(`📡 [DRAW] Player ${userId} drawing from ${deckType} deck.`);
    
        const roomData = await redisClient.get(`room:${roomId}`);
        if (!roomData) {
            console.error(`❌ [DRAW] Room ${roomId} not found in Redis.`);
            return;
        }
        
        let gameRoom = JSON.parse(roomData);
        
        // ✅ Debug deck size before drawing
        console.log(`🃏 [DRAW] Closed Deck Size Before Draw: ${gameRoom.deck.length}`);
        console.log(`🃏 [DRAW] Open Deck Size Before Draw: ${gameRoom.openDeck.length}`);
        
        if (!gameRoom.deck || gameRoom.deck.length === 0) {
            console.warn(`⚠️ [DRAW] Closed deck is EMPTY. Possible initialization issue.`);
        }
        // ✅ Fix: Reshuffle open deck into closed deck if closed deck is empty
        if (deckType === "closed" && gameRoom.deck.length === 0) {
            console.warn(`⚠️ [DRAW] Closed deck is empty. Attempting reshuffle.`);
            if (gameRoom.openDeck.length > 1) {
                const topCard = gameRoom.openDeck.pop();
                gameRoom.deck = shuffleArray([...gameRoom.openDeck]); // Shuffle remaining cards
                gameRoom.openDeck = [topCard]; // Keep top card in open deck
                console.log(`🔄 [DRAW] Reshuffled open deck into closed deck. New deck size: ${gameRoom.deck.length}`);
            } else {
                io.to(roomId).emit("gameDraw", { message: "No cards left. Game ends in a draw!" });
                console.error(`❌ [DRAW] No cards left in both decks. Game ended.`);
                return;
            }
        }
    
        // Handle card drawing logic
        const result = turnService.handleDrawCard(gameRoom, userId, deckType);
        if (!result) {
            console.error(`❌ [DRAW] Failed to draw card for ${userId}.`);
            return;
        }
    
        // Find the player and store the last drawn card
        let player = gameRoom.players.find(p => p.userId === userId);
        if (player) {
            player.lastDrawnCard = result.drawnCard;
            console.log(`✅ [DRAW] ${userId} drew ${result.drawnCard.rank} of ${result.drawnCard.suit} from ${deckType} deck.`);
        }
    
        // Save updated game state in Redis
        await redisClient.set(`room:${roomId}`, JSON.stringify(gameRoom));
    
        // Notify players about the drawn card
        io.to(roomId).emit("cardDrawn", { userId, drawnCard: result.drawnCard, deckType });
    });
       
    socket.on("discardCard", async ({ roomId, userId, discardedCard }) => {
        const roomData = await redisClient.get(`room:${roomId}`);
        if (!roomData) return console.log(`❌ [DISCARD] Room ${roomId} not found.`);
    
        let gameRoom = JSON.parse(roomData);
        const result = turnService.handleDiscardCard(gameRoom, userId, discardedCard);
        if (!result) return console.log(`⚠️ [DISCARD FAILED] Player ${userId} cannot discard.`);
    
        await redisClient.set(`room:${roomId}`, JSON.stringify(gameRoom));
        io.to(roomId).emit("cardDiscarded", { userId, discardedCard });
    
        await handleTurnChange(io, gameRoom, roomId);
    });
    
    socket.on("declareHand", async ({ roomId, userId }) => {
        const roomData = await redisClient.get(`room:${roomId}`);
        if (!roomData) return console.log(`❌ [DECLARE] Room ${roomId} not found.`);
    
        let gameRoom = JSON.parse(roomData);
        const result = turnService.handleDeclareHand(gameRoom, userId, validateHand, gameRoom.wildJoker);
    
        if (!result) return console.log(`⚠️ [DECLARE FAILED] Player ${userId} cannot declare.`);
    
        if (result.isValid) {
            console.log(`🏆 [DECLARATION] Player ${userId} declared successfully.`);
            io.to(roomId).emit("playerDeclared", { userId });
    
            // ✅ Update Player Status
            let declaringPlayer = gameRoom.players.find(p => p.userId === userId);
            declaringPlayer.status = "declared";
    
            // ✅ Calculate Scores for All Players
            const { winner, losingPlayers } = updateScoresAfterDeclaration(gameRoom);
    
            console.log(`🏆 [SCORES UPDATED] Winner: ${winner.userId}, Scores Updated.`);
    
            // ✅ Check for Pool Rummy Eliminations
            checkPoolEliminations(gameRoom);
    
            // ✅ Emit Final Scores
            io.to(roomId).emit("gameScoresUpdated", {
                players: gameRoom.players.map(p => ({
                    userId: p.userId,
                    score: p.score
                }))
            });
    
            // 🎯 If only one player remains, declare them as the winner
            if (gameRoom.players.length === 1) {
                await handleGameOver(io, gameRoom, roomId, gameRoom.players[0].userId);
                return;
            }
            
        } else {
            console.log(`⚠️ [INVALID DECLARATION] Player ${userId} penalized.`);
            let declaringPlayer = gameRoom.players.find(p => p.userId === userId);
            declaringPlayer.score += 80; // Apply max penalty
    
            io.to(roomId).emit("invalidDeclaration", {
                userId,
                message: "Invalid declaration! 80 points penalty applied."
            });
    
            // ✅ Change the turn so that the game continues
            await handleTurnChange(io, gameRoom, roomId);
        }
    
        await redisClient.set(`room:${roomId}`, JSON.stringify(gameRoom));
    });
    socket.on("playerLeft", async ({ roomId, userId }) => {
        const roomData = await redisClient.get(`room:${roomId}`);
        if (!roomData) return console.log(`❌ [LEAVE] Room ${roomId} not found.`);
    
        let gameRoom = JSON.parse(roomData);
        console.log(`🚪 [PLAYER LEFT] Player ${userId} is leaving...`);
    
        // Remove player from game
        gameRoom.players = gameRoom.players.filter(p => p.userId !== userId);
    
        if (gameRoom.players.length === 1) {
            await handleGameOver(io, gameRoom, roomId, gameRoom.players[0].userId);
            return;
        }
        
        await redisClient.set(`room:${roomId}`, JSON.stringify(gameRoom));
        io.to(roomId).emit("playerRemoved", { userId });
    });
    socket.on("dropGame", async ({ roomId, userId }) => {
        const roomData = await redisClient.get(`room:${roomId}`);
        if (!roomData) return;
    
        let gameRoom;
        try {
            gameRoom = JSON.parse(roomData);
        } catch (error) {
            return;
        }
    
        const player = gameRoom.players.find(p => p.userId === userId);
        if (!player || player.status === "dropped") return;
    
        const result = turnService.handleDropPlayer(gameRoom, userId);
        if (!result) return;
    
        if (result.winner) {
            await handleGameOver(io, gameRoom, roomId, result.winner);
            return;
        } else {
            io.to(roomId).emit("playerDropped", { userId });
            await handleTurnChange(io, gameRoom, roomId, result.nextTurn);
        }
    
        await redisClient.set(`room:${roomId}`, JSON.stringify(gameRoom));
    });
    async function handleTurnChange(io, gameRoom, roomId) {
        console.log(`🔄 [TURN] Handling turn change for room: ${roomId}`);
        gameRoom.players = gameRoom.players.filter(p => p.status !== "dropped");
        if (gameRoom.players.length < 2) {
            await handleGameOver(io, gameRoom, roomId, gameRoom.players[0]?.userId);
            return;
        }
        const result = turnService.changeTurn(gameRoom);
        if (result.nextTurn !== gameRoom.currentTurn) {
            clearTurnTimer(roomId); // ✅ Fix: Stop old timers before starting a new one
            gameRoom.currentTurn = result.nextTurn;
            io.to(roomId).emit("turnChanged", { currentTurn: result.nextTurn });
            await redisClient.set(`room:${roomId}`, JSON.stringify(gameRoom));
            startTurnTimer(io, roomId, result.nextTurn);
        }
    } 
};    
async function handleGameOver(io, gameRoom, roomId, winnerUserId = null) {
    console.log(`🏁 [GAME OVER] Room: ${roomId}`);
    // If a winner is provided, find the winner's details
    let winner = winnerUserId 
        ? gameRoom.players.find(p => p.userId === winnerUserId) 
        : null;
    const gameOverData = {
        roomId,
        userId: winner ? winner.userId : null,
        username: winner ? winner.username : null,
        scores: gameRoom.players.map(p => ({
            userId: p.userId,
            username: p.username,
            score: p.score
        })),
        playerHand: winner ? winner.hand : null
    };
    io.to(roomId).emit("gameOver", gameOverData);
    gameRoom.gameStatus = "completed";
    await redisClient.set(`room:${roomId}`, JSON.stringify(gameRoom));
    redisClient.expire(`room:${roomId}`, 3600);
}
