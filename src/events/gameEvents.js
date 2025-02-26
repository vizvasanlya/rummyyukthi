const GameRoom = require("../models/gameRoom.model");
const { shuffleDeck, pickWildJoker } = require("../utils/rummyLogic");
const { assignDealerAndFirstPlayer } = require("../services/gameService");
const { deductEntryFee } = require("../services/walletService");
const { startTurnTimer } = require("../services/timerService");

const startGame = async (io, roomId, redis) => {
  try {
    let room = await GameRoom.findOne({ roomId });
    if (!room) return console.error(`❌ Room ${roomId} not found.`);
    if (room.gameStatus !== "in-progress") return console.log(`⏳ Room ${roomId} not ready to start.`);

    console.log(`💰 Deducting entry fee from players...`);
    try {
      await deductEntryFee(room.players, room.gameType, room.entryFee);
    } catch (error) {
      console.error(`❌ Failed to deduct entry fee: ${error.message}`);
      io.to(roomId).emit("error", { message: "Entry fee deduction failed" });
      return;
    }
    console.log(`✅ Entry fee deducted successfully.`);

    let countdown = 5;
    io.to(roomId).emit("gameCountdown", { countdown });

    let countdownInterval = setInterval(() => {
      countdown -= 1;
      io.to(roomId).emit("gameCountdown", { countdown });
      if (countdown === 0) clearInterval(countdownInterval);
    }, 1000);

    setTimeout(async () => {
      console.log(`🃏 Initializing deck with 52 cards...`);
      let deck = shuffleDeck();

      let singleCards = room.players.map((player, index) => ({
        userId: player.userId,
        card: { rank: deck[index].rank, suit: deck[index].suit },
      }));

      io.to(roomId).emit("singleCardDealt", { players: singleCards });

      setTimeout(async () => {
        console.log(`👑 Assigning dealer & first player...`);
        let { dealer, firstPlayer, sortedPlayers } = assignDealerAndFirstPlayer(room.players, singleCards);

        // ✅ Mark all players as "joined" before game starts
        sortedPlayers = sortedPlayers.map(player => ({ ...player, status: "joined" }));

        room.dealer = dealer;
        room.currentTurn = firstPlayer;
        room.players = sortedPlayers;
        room.gameStatus = "started";

        await room.save();

        await redis.set(`game:${roomId}`, JSON.stringify({ currentTurn: room.currentTurn }));
        console.log(`✅ First turn (${room.currentTurn}) saved to Redis`);

        io.to(roomId).emit("dealerAssigned", { 
          dealer, 
          firstPlayer, 
          players: sortedPlayers.map(({ userId }) => ({ userId })) 
        });

        setTimeout(async () => {
          console.log(`🃏 Dealing 13 cards to each player...`);
          deck.splice(0, room.players.length);

          sortedPlayers.forEach(player => {
            player.hand = deck.splice(0, 13);
          });

          io.to(roomId).emit("cardsDealt", { 
            players: sortedPlayers.map(({ userId, hand }) => ({ userId, hand })) 
          });

          setTimeout(async () => {
            console.log(`🔹 Selecting Wild Joker & Open Deck Card...`);
            const wildJoker = pickWildJoker(deck);
            const openDeck = deck.pop();

            if (!openDeck) {
              console.error("❌ Open deck card is missing!");
              io.to(roomId).emit("error", { message: "Game setup failed: No open deck card" });
              return;
            }

            room.wildJoker = wildJoker;
            room.closedDeck = deck;
            room.openDeck = [openDeck];
            room.deck = deck;
            room.players = sortedPlayers;
            await room.save();

            console.log(`✅ Wild Joker: ${wildJoker.rank} of ${wildJoker.suit}`);
            console.log(`✅ Open Deck: ${openDeck.rank} of ${openDeck.suit}`);
            console.log(`✅ Remaining Deck Size: ${deck.length}`);

            io.to(roomId).emit("deckSetup", {
              wildJoker,
              openDeck: { rank: openDeck.rank, suit: openDeck.suit },
              closedDeck: room.closedDeck.map(card => ({ rank: card.rank, suit: card.suit })),
            });

            setTimeout(async () => {
              console.log(`🚀 Starting game in room ${roomId}`);

              room.gameStatus = "started";
              await room.save();

              // ✅ Save updated game state in Redis
              const gameState = {
                roomId: room.roomId,
                gameType: room.gameType,
                entryFee: room.entryFee,
                players: room.players.map(p => ({
                    userId: p.userId,
                    hand: p.hand.map(card => ({ rank: card.rank, suit: card.suit })), 
                    status: p.status,
                })),
                deck: room.deck.map(card => ({ rank: card.rank, suit: card.suit })), 
                openDeck: room.openDeck.map(card => ({ rank: card.rank, suit: card.suit })), 
                wildJoker: room.wildJoker ? { rank: room.wildJoker.rank, suit: room.wildJoker.suit } : null, 
                currentTurn: room.currentTurn, 
                dealer: room.dealer,
                gameStatus: room.gameStatus,
              };
              
              await redis.set(`room:${roomId}`, JSON.stringify(gameState));

              io.to(roomId).emit("game-start", {
                roomId,
                gameType: room.gameType,
                players: sortedPlayers.map(({ userId }) => ({ userId })), 
                wildJoker,
                openDeck: gameState.openDeck.length ? gameState.openDeck[0] : null,
                closedDeckSize: gameState.deck.length,
              });

              io.to(roomId).emit("playersUpdated", { 
                players: sortedPlayers.map(({ userId }) => ({ userId })) 
              });

              setTimeout(async () => {
                let gameData = JSON.parse(await redis.get(`room:${roomId}`));
                gameData.currentTurn = room.currentTurn;
            
                await redis.set(`room:${roomId}`, JSON.stringify(gameData));
                
                console.log(`✅ [REDIS UPDATE] currentTurn updated to ${room.currentTurn} for room ${roomId}`);

                // ✅ Ensure first player is connected & has status "joined"
                const currentPlayer = room.players.find(p => p.userId === room.currentTurn);
                if (!currentPlayer || currentPlayer.status !== "joined") {
                  console.error(`⚠️ First player (${room.currentTurn}) is not available.`);
                  io.to(roomId).emit("error", { message: "First player is missing!" });
                  return;
                }

                io.to(roomId).emit("turnChanged", { currentTurn: room.currentTurn });
                console.log(`🚀 [TURN START] Emitting turnChanged event for ${room.currentTurn} in room ${roomId}`);
                
                startTurnTimer(io, roomId, room.currentTurn);
              }, 1000);
            
            }, 2000);

          }, 2000);

        }, 2000);

      }, 2000);

    }, 5000);
  } catch (error) {
    console.error(`❌ Error in startGame: ${error.message}`);
  }
};

module.exports = { startGame };
