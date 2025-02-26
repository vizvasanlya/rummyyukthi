// const GameRoom = require("../models/gameRoom.model");
// const User = require("../models/user.model");
// const { shuffleDeck, pickWildJoker, validateHand } = require("../utils/rummyLogic");
// const { getIO } = require("../socket");
// const ScoreUtils = require("../utils/scoreUtils");
// const WalletUtils = require("../utils/walletUtils");
// const EntryFeeUtils = require("../utils/entryFeeUtils");
// const { initializePlayerTimer, startTurnTimer, clearTurnTimer } = require('../utils/gameTimer.utils');
// const { initializePlayerDropStatus } = require('../utils/dropRules.utils');

// // Create or Join Room Logic
// exports.createOrJoinRoom = async (req, res) => {
//   try {
//     const io = getIO();
//     const { userId, gameType, playerLimit, perPointValue, poolType, numberOfDeals, entryFee } = req.body;

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (!["points", "pool", "deals"].includes(gameType)) {
//       return res.status(400).json({ message: "Invalid game type" });
//     }

//     if (![2, 6].includes(playerLimit)) {
//       return res.status(400).json({ message: "Invalid player limit" });
//     }

//     if (!EntryFeeUtils.hasSufficientBalance(user, gameType, perPointValue, entryFee)) {
//       return res.status(400).json({ message: "Insufficient balance. Please add cash." });
//     }

//     if (["pool", "deals"].includes(gameType) && (!entryFee || user.balance < entryFee)) {
//       return res.status(400).json({ message: "Insufficient balance for entry fee" });
//     }

//     if (gameType === "points" && !perPointValue) {
//       return res.status(400).json({ message: "Per-point value required for Points Rummy" });
//     }

//     if (gameType === "pool" && ![101, 201].includes(poolType)) {
//       return res.status(400).json({ message: "Invalid pool type" });
//     }

//     if (gameType === "deals" && !numberOfDeals) {
//       return res.status(400).json({ message: "Number of deals required for Deals Rummy" });
//     }

//     let room = await GameRoom.findOne({
//       gameType,
//       playerLimit,
//       perPointValue,
//       poolType,
//       numberOfDeals,
//       entryFee,
//       gameStatus: "waiting",
//     });

//     if (room) {
//       room.players.push({ userId, status: "joined" });
//       await room.save();

//       io.to(room._id.toString()).emit("updateRoom", room);

//       if (room.players.length === room.playerLimit) {
//         setTimeout(async () => {
//           await this.startGame(room._id, io);
//         }, 5000);
//       }
//     } else {
//       room = await GameRoom.create({
//         gameType,
//         playerLimit,
//         perPointValue,
//         poolType,
//         numberOfDeals,
//         entryFee,
//         players: [{ userId, status: "joined" }],
//       });

//       io.to(room._id.toString()).emit("newRoom", room);
//     }

//     initializePlayerTimer(userId);
//     initializePlayerDropStatus(userId);

//     // Handle disconnection properly
//     io.on("disconnect", () => {
//       room.players = room.players.filter(player => player.userId !== userId);
//       io.to(room._id.toString()).emit("updateRoom", room);
//     });

//     return res.status(200).json({ message: "Game room created/joined", room });

//   } catch (error) {
//     console.error("Error creating room:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // Start Game Logic
// exports.startGame = async (roomId, io) => {
//   try {
   
//     // const io = getIO();
//     // Emit "gameStarting" event before the 5-second delay
//     io.to(roomId).emit("gameStarting", { message: "Game will start in 5 seconds" });
//     console.log(`Game will start in 5 seconds for room -gameroomcontoller: ${roomId}`);
//     setTimeout(async () => {
//       console.log(`Starting game for room: ${roomId}`);

//       let room = await GameRoom.findById(roomId).populate("players.userId");

//       if (!room || room.players.length !== room.playerLimit) {
//         console.log("Not enough players to start the game.");
//         return;
//       }

//       if (room.gameStatus !== "waiting") {
//         console.log("Game is already in progress or completed.");
//         return;
//       }

//       // Shuffle the deck and prepare game data
//       let deck = shuffleDeck();
//       console.log("Deck shuffled successfully.");

//       let playerCards = {}; // Store one dealt card per player for dealer assignment

//       // Deal ONE card to each player for dealer assignment
//       for (const player of room.players) {
//         let randomCard = deck.pop();
//         playerCards[player.userId._id] = randomCard;

//         // Emit event to notify frontend about the card dealt to each player
//         io.to(roomId).emit("dealerAssignmentCard", {
//           playerId: player.userId._id,
//           card: randomCard,
//         });

//         console.log(`Player ${player.userId._id} received card: ${randomCard.rank} of ${randomCard.suit}`);
//       }

//       // Determine dealer and first-turn player by sorting based on card rank
//       let sortedPlayers = Object.entries(playerCards).sort((a, b) => {
//         return a[1].rank.localeCompare(b[1].rank); // Sorting by rank (ascending)
//       });

//       let assignedDealer = sortedPlayers[0][0]; // Player with the lowest card (dealer)
//       let firstTurnPlayer = sortedPlayers[sortedPlayers.length - 1][0]; // Highest card (first turn)

//       console.log(`Dealer assigned: Player ${assignedDealer}`);
//       console.log(`First turn player: Player ${firstTurnPlayer}`);

//       // Deal 13 cards to each player for gameplay
//       room.players.forEach((player) => {
//         player.hand = deck.splice(0, 13);
//         console.log(`Player ${player.userId._id} received 13 cards.`);
//       });

//       // Pick wild joker and open deck card
//       const wildJoker = pickWildJoker(deck);
//       const openDeck = [deck.pop()];

//       console.log(`Wild Joker selected: ${wildJoker.rank} of ${wildJoker.suit}`);
//       console.log(`Open deck starts with: ${openDeck[0].rank} of ${openDeck[0].suit}`);

//       // Update the game room state
//       room.dealer = assignedDealer;
//       room.wildJoker = wildJoker;
//       room.openDeck = openDeck;
//       room.deck = deck;
//       room.currentTurn = firstTurnPlayer;
//       room.gameStatus = "in-progress";

//       // Save the updated room state
//       await room.save();

//       // Initialize player timers and drop statuses
//       room.players.forEach((player) => {
//         initializePlayerTimer(player.userId._id);
//         initializePlayerDropStatus(player.userId._id);
//       });

//       // Emit dealer and first-turn player to frontend
//       io.to(roomId).emit("dealerAssigned", {
//         dealerId: assignedDealer,
//         firstTurnPlayerId: firstTurnPlayer,
//       });

//       console.log(`Dealer and first turn player announced to frontend.`);

//       // Start the turn timer for the first player
//       startTurnTimer(firstTurnPlayer);

//       // Emit game start event
//       io.to(roomId).emit("gameStarted", { room });

//       // Emit turn changed event
//       io.to(roomId).emit("turnChanged", { nextPlayerId: firstTurnPlayer });
//       console.log("turnChanged...", { nextPlayerId: firstTurnPlayer });

//       console.log(`Game started successfully for room: ${roomId}`);

//     }, 5000); // Delay game start by 5 seconds

//   } catch (error) {
//     console.error("Error starting game:", error);
//   }
// };

// // Draw Card Logic
// exports.drawCard = async (req, res) => {
//   try {
//     const { roomId, userId, fromDeck } = req.body;
//     const io = getIO();

//     let room = await GameRoom.findById(roomId);

//     if (!room) {
//       throw new Error("Room not found");
//     }

//     if (room.gameStatus !== "in-progress") {
//       throw new Error("Game is not in progress");
//     }

//     if (room.currentTurn.toString() !== userId) {
//       throw new Error("Not your turn");
//     }

//     let drawnCard;
//     if (fromDeck === "closed") {
//       drawnCard = room.deck.pop();
//     } else if (fromDeck === "open" && room.openDeck.length > 0) {
//       drawnCard = room.openDeck.pop();
//     } else {
//       throw new Error("Invalid draw source");
//     }

//     room.players.forEach((player) => {
//       if (player.userId.toString() === userId) {
//         player.hand.push(drawnCard);
//       }
//     });

//     clearTurnTimer(userId);
//     startTurnTimer(userId);

//     await room.save();
//     io.to(roomId).emit("cardDrawn", { userId, drawnCard, fromDeck });
//     console.log("cardDrawn", { userId, drawnCard, fromDeck });

//     return res.status(200).json({ message: "Card drawn", drawnCard });
//   } catch (error) {
//     console.error("Error drawing card:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // Discard Card Logic
// exports.discardCard = async (req, res) => {
//   try {
//     const { roomId, userId, card } = req.body;
//     const io = getIO();

//     const room = await GameRoom.findById(roomId);
//     if (!room) throw new Error("Room not found");

//     const player = room.players.find((p) => p.userId.toString() === userId);
//     if (!player) throw new Error("Player not found in room");

//     if (room.currentTurn.toString() !== userId) {
//       throw new Error("It's not your turn to discard");
//     }

//     // Remove the card from the player's hand
//     player.hand = player.hand.filter((c) => c !== card);

//     // Add the card to the open deck
//     room.openDeck.push(card);

//     // Shift the turn to the next player
//     const currentPlayerIndex = room.players.findIndex(
//       (p) => p.userId.toString() === userId
//     );
//     const nextPlayerIndex = (currentPlayerIndex + 1) % room.players.length;
//     room.currentTurn = room.players[nextPlayerIndex].userId;

//     // Clear the current timer and start a new one for the next player
//     clearTurnTimer(userId);
//     startTurnTimer(room.players[nextPlayerIndex].userId);

//     await room.save();

//     io.to(roomId).emit("cardDiscarded", { userId, card, nextTurn: room.currentTurn });

//     return res.status(200).json({ message: "Card discarded", nextTurn: room.currentTurn });
//   } catch (error) {
//     console.error("Error discarding card:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // Drop Logic
// exports.drop = async (req, res) => {
//   try {
//     const { roomId, userId, dropType } = req.body;
//     const io = getIO();

//     const room = await GameRoom.findById(roomId);
//     if (!room) throw new Error("Room not found");

//     const player = room.players.find((p) => p.userId.toString() === userId);
//     if (!player) throw new Error("Player not found in room");

//     if (player.status === "dropped") {
//       throw new Error("Player has already dropped");
//     }

//     // Apply drop penalty
//     let dropPoints = 0;
//     if (dropType === "firstDrop") {
//       dropPoints = 20;
//     } else if (dropType === "middleDrop") {
//       dropPoints = 40;
//     }

//     player.dropPoints = dropPoints;
//     player.status = "dropped";

//     // Shift the turn if the dropping player was the current turn player
//     if (room.currentTurn.toString() === userId) {
//       const currentPlayerIndex = room.players.findIndex(
//         (p) => p.userId.toString() === userId
//       );
//       const nextPlayerIndex = (currentPlayerIndex + 1) % room.players.length;
//       room.currentTurn = room.players[nextPlayerIndex].userId;

//       // Clear the current timer and start a new one for the next player
//       clearTurnTimer(userId);
//       startTurnTimer(room.players[nextPlayerIndex].userId);
//     }

//     // Check if only one player remains in the game
//     const remainingPlayers = room.players.filter((player) => player.status !== "dropped");

//     if (remainingPlayers.length === 1) {
//       // If only one player is left, set them as the winner
//       const winner = remainingPlayers[0];
//       const totalPoints = room.players.reduce((sum, p) => sum + (p.dropPoints || 0), 0);

//       // Emit event to show winner and scores
//       io.to(roomId).emit("gameOver", {
//         winnerId: winner.userId,
//         winnerName: winner.name,
//         winnerDropPoints: winner.dropPoints,
//         totalPoints,
//         message: `${winner.name} is the winner!`
//       });

//       // Update the room status to 'completed'
//       room.gameStatus = "completed";
//     }

//     await room.save();

//     io.to(roomId).emit("playerDropped", { userId, dropType, dropPoints, nextTurn: room.currentTurn });

//     return res.status(200).json({ message: "Player dropped successfully", dropType, dropPoints, nextTurn: room.currentTurn });
//   } catch (error) {
//     console.error("Error dropping player:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // Declare Hand Logic
// exports.declareHand = async (req, res) => {
//   try {
//     const { roomId, userId, declaredHand } = req.body;
//     const io = getIO();

//     const room = await GameRoom.findById(roomId);
//     if (!room) throw new Error("Room not found");

//     const player = room.players.find((p) => p.userId.toString() === userId);
//     if (!player) throw new Error("Player not found in room");

//     if (room.currentTurn.toString() !== userId) {
//       throw new Error("It's not your turn to declare");
//     }

//     const isValidDeclaration = validateHand(declaredHand);
//     if (!isValidDeclaration) {
//       // Invalid declaration: skip the player's next turn (for 3+ players) or declare the other player as the winner (for 2 players)
//       if (room.players.length > 2) {
//         const currentPlayerIndex = room.players.findIndex(
//           (p) => p.userId.toString() === userId
//         );
//         const nextPlayerIndex = (currentPlayerIndex + 1) % room.players.length;
//         room.currentTurn = room.players[nextPlayerIndex].userId;

//         await room.save();

//         io.to(roomId).emit("invalidDeclaration", { userId, nextTurn: room.currentTurn });

//         return res.status(200).json({ message: "Invalid declaration, skipping next turn", nextTurn: room.currentTurn });
//       } else {
//         const otherPlayer = room.players.find((p) => p.userId.toString() !== userId);
//         room.winner = otherPlayer.userId;
//         room.gameStatus = "completed";

//         await room.save();

//         io.to(roomId).emit("gameOver", { winner: otherPlayer.userId });

//         return res.status(200).json({ message: "Invalid declaration, game over", winner: otherPlayer.userId });
//       }
//     }

//     // Valid declaration: declare the player as the winner
//     room.winner = userId;
//     room.gameStatus = "completed";

//     await room.save();

//     io.to(roomId).emit("gameOver", { winner: userId });

//     return res.status(200).json({ message: "Valid declaration, game over", winner: userId });
//   } catch (error) {
//     console.error("Error declaring hand:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };