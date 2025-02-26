const scoreService = require("./scoreService");

module.exports = {
  handleDrawCard,
  handleDiscardCard,
  handleDropPlayer,
  handleDeclareHand,
  changeTurn,
};

/**
 * Handles drawing a card from either the closed or open deck.
 */
function handleDrawCard(gameRoom, userId, fromDeck) {
  if (!gameRoom || gameRoom.currentTurn !== userId) {
      console.log(`❌ [DRAW] Invalid turn. Current turn: ${gameRoom?.currentTurn}, but user tried: ${userId}`);
      return null;
  }

  // Find the player's index
  const playerIndex = gameRoom.players.findIndex(p => p.userId === userId);
  if (playerIndex === -1) {
      console.log(`❌ [DRAW] Player ${userId} not found in room.`);
      return null;
  }

  console.log(`✅ [DRAW] Found player at index ${playerIndex}`);

  // Clone player object before modifying
  let player = { ...gameRoom.players[playerIndex] };

  // Ensure decks exist
  gameRoom.closedDeck = gameRoom.closedDeck || gameRoom.deck || [];
  gameRoom.openDeck = gameRoom.openDeck || [];

  console.log(`🃏 [DRAW] Closed Deck Before Draw:`, gameRoom.closedDeck.map(c => `${c.rank} of ${c.suit}`));

  let drawnCard = null;

  if (fromDeck === "closed") {
      // Handle reshuffle if closed deck is empty
      if (gameRoom.closedDeck.length === 0) {
          console.log(`🔄 [DRAW] Closed deck empty! Reshuffling from open deck...`);
          if (gameRoom.openDeck.length > 1) {
              const topCard = gameRoom.openDeck.pop();
              gameRoom.closedDeck = shuffleArray(gameRoom.openDeck);
              gameRoom.openDeck = [topCard]; // Keep only top card
              console.log(`♻️ [RESHUFFLE] New closed deck:`, gameRoom.closedDeck);
          } else {
              console.log(`❌ [DRAW] No cards left to reshuffle.`);
              return null;
          }
      }
      drawnCard = gameRoom.closedDeck.pop();
  } else {
      drawnCard = gameRoom.openDeck.pop();
  }

  if (!drawnCard) {
      console.log(`❌ [DRAW] No cards left in ${fromDeck} deck.`);
      return null;
  }

  player.hand = [...player.hand, drawnCard]; // Clone and modify hand separately
  player.lastDrawnCard = drawnCard;

  console.log(`🃏 [DRAW] Player ${userId} drew:`, drawnCard);
  console.log(`🃏 [DRAW] Closed Deck After Draw:`, gameRoom.closedDeck.map(c => `${c.rank} of ${c.suit}`));

  // ✅ Replace the modified player back in the players array
  gameRoom.players[playerIndex] = player;

  return { drawnCard };
}

/**
 * Handles discarding a card and adding it to the open deck.
 */
function handleDiscardCard(gameRoom, userId, discardedCard) {
  if (!gameRoom || gameRoom.currentTurn !== userId) return null;

  let player = gameRoom.players.find(p => p.userId === userId);
  if (!player) return null;

  let cardIndex = player.hand.findIndex(card => card.suit === discardedCard.suit && card.rank === discardedCard.rank);
  if (cardIndex === -1) return null; // Card not found

  player.hand.splice(cardIndex, 1); // Remove from hand
  gameRoom.openDeck.push(discardedCard); // Add to open deck

  return { discardedCard };
}

/**
 * Handles dropping a player from the game.
 */
function handleDropPlayer(gameRoom, userId) {
  if (!gameRoom) return null;

  let player = gameRoom.players.find(p => p.userId === userId);
  if (!player || gameRoom.currentTurn !== userId) return null;

  // Determine if it's a first drop or middle drop
  player.status = "dropped";
  player.dropType = player.hasPlayedTurn ? "middle" : "first";

  // Update player score based on drop type
  player.score += scoreService.calculatePlayerScore(player);

  // Check active players remaining
  let activePlayers = gameRoom.players.filter(p => p.status !== "dropped");

  if (activePlayers.length === 1) {
      // Only one player left => Declare as winner
      let winner = activePlayers[0];
      winner.status = "declared";

      return { userId, dropped: true, winner };
  } else {
      // More players left => Shift turn
      return { userId, dropped: true, nextTurn: getNextTurn(gameRoom) };
  }
}

// Helper function to get next turn
function getNextTurn(gameRoom) {
  let activePlayers = gameRoom.players.filter(p => p.status !== "dropped");
  let currentIndex = activePlayers.findIndex(p => p.userId === gameRoom.currentTurn);

  let nextIndex = (currentIndex + 1) % activePlayers.length;
  return activePlayers[nextIndex].userId;
}


/**
 * Handles a player declaring their hand.
 */
function handleDeclareHand(gameRoom, userId, validateHandFn, wildJoker) {
  if (!gameRoom) return null;

  let player = gameRoom.players.find(p => p.userId === userId);
  if (!player || gameRoom.currentTurn !== userId) return null;

  let isValid = validateHandFn(player.hand, wildJoker);
  return { isValid };
}

/**
 * Changes turn to the next active player.
 */
function changeTurn(gameRoom) {
  console.log(`🔄 [TURN] Changing turn for room with current turn: ${gameRoom.currentTurn}`);

  if (!gameRoom || !Array.isArray(gameRoom.players)) return null;

  let activePlayers = gameRoom.players.filter(p => p.status !== "dropped");

  if (activePlayers.length === 0) return { gameOver: true, winner: null }; // No active players
  if (activePlayers.length === 1) return { gameOver: true, winner: activePlayers[0]?.userId }; // One player left wins

  let currentIndex = activePlayers.findIndex(p => p.userId === gameRoom.currentTurn);
  if (currentIndex === -1) currentIndex = 0; // Reset to first active player if missing

  let nextIndex = (currentIndex + 1) % activePlayers.length;
  return { nextTurn: activePlayers[nextIndex].userId };
}
