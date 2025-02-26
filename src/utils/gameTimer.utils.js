const GameRoom = require("../models/gameRoom.model");
const mongoose = require("mongoose");

const playersTimers = new Map(); // Track timers for each player
const playersInactiveTurns = new Map(); // Track consecutive inactive turns for each player
const playersCardStatus = new Map(); // Track if the player has drawn a card

// Initialize timer for a player
function initializePlayerTimer(playerId) {
  playersTimers.set(playerId, {
    turnTimer: null,
    extraTimeLeft: 30, // Each player starts with 30 seconds of regular time
  });
  playersInactiveTurns.set(playerId, 0);
  playersCardStatus.set(playerId, false); // Initially, no card drawn
}

// Start the turn timer for a player (total 90 seconds: 30s regular + 60s extra time)
function startTurnTimer(playerId, onTimeOut, onAutoDiscard, cardDrawn) {
  const playerTimer = playersTimers.get(playerId);
  if (!playerTimer) return;

  clearTurnTimer(playerId); // Clear any existing timer for the player

  // Set the flag based on whether the player has drawn a card
  playersCardStatus.set(playerId, cardDrawn);

  // Start the initial 30s regular turn time
  playerTimer.turnTimer = setTimeout(() => {
    console.log(`Player ${playerId} used 30s regular turn time.`);

    if (playersCardStatus.get(playerId)) {
      console.log(`Player ${playerId} drew a card during the regular turn.`);
    } else {
      console.log(`Player ${playerId} did not draw a card, extra time will be deducted.`);
    }

    // Now start the 60s extra time immediately after 30s
    startExtraTimeCountdown(playerId, onTimeOut, onAutoDiscard, cardDrawn);
  }, 30000); // 30 seconds regular turn time
}

// Start the extra time countdown (after 30s turn timer expires)
function startExtraTimeCountdown(playerId, onTimeOut, onAutoDiscard, cardDrawn) {
  const playerTimer = playersTimers.get(playerId);
  if (!playerTimer) return;

  // Deduct 60 seconds as extra time
  playerTimer.extraTimeLeft = 60;

  const extraTimeInterval = setInterval(() => {
    if (playerTimer.extraTimeLeft > 0) {
      // Deduct 30 seconds at a time from extra time
      playerTimer.extraTimeLeft -= 30;
      console.log(`Player ${playerId} used 30s of extra time, ${playerTimer.extraTimeLeft}s extra time left.`);

      // Auto-discard only if the player drew a card during this turn
      if (playersCardStatus.get(playerId) && !cardDrawn) {
        console.log(`Player ${playerId} drew a card but hasn't discarded. Auto-discarding...`);
        onAutoDiscard(playerId, cardDrawn);
      }
    } else {
      console.log(`Player ${playerId} ran out of extra time!`);

      // If player has drawn a card, discard it
      if (playersCardStatus.get(playerId)) {
        console.log(`Player ${playerId} drew a card and ran out of extra time. Auto-discarding...`);
        onAutoDiscard(playerId, cardDrawn);
      } else {
        console.log(`Player ${playerId} did not draw a card, no auto-discard.`);
      }

      // Shift the turn to the next player
      shiftTurnToNextPlayer(playerId, onTimeOut, onAutoDiscard);

      // Stop the extra time interval once the player runs out of time
      clearInterval(extraTimeInterval);
    }
  }, 30000); // Deduct 30 seconds every 30 seconds (for a total of 60 seconds)
}

// Shift the turn to the next player
async function shiftTurnToNextPlayer(playerId, onTimeOut, onAutoDiscard) {
  console.log(`🔄 [shiftTurnToNextPlayer] Shifting turn from Player ${playerId}...`);

  try {
    // Find the room where the player is currently active
    const room = await GameRoom.findOne({ "players.userId": new mongoose.Types.ObjectId(playerId) });

    if (!room) {
      console.error(`🚫 [shiftTurnToNextPlayer] Room with player ID ${playerId} not found.`);
      return;
    }

    console.log(`✅ [shiftTurnToNextPlayer] Room found: ${room._id}`);

    // Get the next player ID
    const nextPlayerId = getNextPlayerId(room, playerId);

    if (!nextPlayerId) {
      console.error(`🚫 [shiftTurnToNextPlayer] Next player ID could not be determined.`);
      return;
    }

    console.log(`👉 [shiftTurnToNextPlayer] Next player ID: ${nextPlayerId}`);

    // Update the room object with the new current turn
    room.currentTurn = nextPlayerId;
    room.turnIndex = (room.turnIndex + 1) % room.players.length; // Assuming round-robin turn order

    // Save the updated room document
    await room.save();
    console.log(`✅ [shiftTurnToNextPlayer] Room updated with new current turn: ${nextPlayerId}`);

    // Emit the playerDiscarded event and notify about the turn shift
    if (global.io) {
      global.io.emit("playerDiscarded", { userId: playerId, discardedCard: null }); // No card discarded if time ran out without drawing
      console.log(`📣 [shiftTurnToNextPlayer] Emitted 'playerDiscarded' event for Player ${playerId}.`);
    }

    console.log(`🔄 [shiftTurnToNextPlayer] Turn shifted to Player ${nextPlayerId}. Starting their timer...`);

    // Start the timer for the next player (this is the critical step)
    startTurnTimer(nextPlayerId, onTimeOut, onAutoDiscard, false);
    console.log(`✅ [shiftTurnToNextPlayer] Timer started for Player ${nextPlayerId}.`);

  } catch (error) {
    console.error(`🔥 [shiftTurnToNextPlayer] Error shifting turn:`, error);
  }
}

// Get the next player ID (used for turn shifting)
function getNextPlayerId(room, currentPlayerId) {
  // Convert currentPlayerId to ObjectId for comparison
  const currentPlayerObjectId = new mongoose.Types.ObjectId(currentPlayerId);

  // Find the index of the current player
  const playerIndex = room.players.findIndex(player => player.userId.equals(currentPlayerObjectId));

  if (playerIndex === -1) {
    console.error(`Player with ID ${currentPlayerId} not found in room.`);
    return null;
  }

  // Calculate the next player in the turn order
  const nextPlayerIndex = (playerIndex + 1) % room.players.length; // Assuming round-robin turn order
  return room.players[nextPlayerIndex].userId;
}

// Increment inactive turns and check for auto-drop
function incrementInactiveTurns(playerId, onTimeOut) {
  let inactiveTurns = playersInactiveTurns.get(playerId) || 0;
  inactiveTurns++;

  if (inactiveTurns >= 3) {
    console.log(`Player ${playerId} has been inactive for 3 consecutive turns — auto-drop triggered.`);
    onTimeOut(playerId); // Auto-drop after 3 consecutive inactive turns
  }

  playersInactiveTurns.set(playerId, inactiveTurns);
}

// Clear the turn timer for a player
function clearTurnTimer(playerId) {
  const playerTimer = playersTimers.get(playerId);
  if (playerTimer && playerTimer.turnTimer) {
    clearTimeout(playerTimer.turnTimer);
    playerTimer.turnTimer = null;
  }
}

// Reset timers for a new round (Pool/Deals Rummy scenario)
function resetPlayerTimersForNewRound(playerId) {
  if (playersTimers.has(playerId)) {
    playersTimers.set(playerId, {
      turnTimer: null,
      extraTimeLeft: 60, // Reset to 60s extra time for each new round
    });
    playersInactiveTurns.set(playerId, 0);
    playersCardStatus.set(playerId, false); // Reset card drawn flag
  }
}

// Clean up player data (e.g., when leaving the room)
function removePlayerTimer(playerId) {
  clearTurnTimer(playerId);
  playersTimers.delete(playerId);
  playersInactiveTurns.delete(playerId);
  playersCardStatus.delete(playerId);
}

// Handle timeout logic (e.g., skip the player's turn)
const handleTimeOut = async (playerId) => {
  try {
    console.log(`⏰ [handleTimeOut] Player ${playerId} timed out. Skipping turn...`);

    // Find the room where the player is active
    const room = await GameRoom.findOne({ "players.userId": new mongoose.Types.ObjectId(playerId) });

    if (!room) {
      console.error(`🚫 [handleTimeOut] Room with player ID ${playerId} not found.`);
      return;
    }

    // Shift the turn to the next player
    const nextPlayerId = getNextPlayerId(room, playerId);

    if (!nextPlayerId) {
      console.error(`🚫 [handleTimeOut] Next player ID could not be determined.`);
      return;
    }

    // Update the room with the new current turn
    room.currentTurn = nextPlayerId;
    await room.save();

    console.log(`✅ [handleTimeOut] Turn shifted to Player ${nextPlayerId}.`);

    // Emit an event to notify clients about the turn shift
    if (global.io) {
      global.io.to(room._id).emit("turnSkipped", {
        skippedPlayer: playerId,
        nextTurn: nextPlayerId,
      });
    }

    // Start the timer for the next player
    startTurnTimer(nextPlayerId, handleTimeOut, handleAutoDiscard, false);
  } catch (error) {
    console.error(`🔥 [handleTimeOut] Error handling timeout:`, error);
  }
};

// Handle auto-discard logic (e.g., discard a random card if the player doesn't act)
const handleAutoDiscard = async (playerId, cardDrawn) => {
  try {
    console.log(`🃏 [handleAutoDiscard] Auto-discarding for Player ${playerId}...`);

    // Find the room where the player is active
    const room = await GameRoom.findOne({ "players.userId": new mongoose.Types.ObjectId(playerId) });

    if (!room) {
      console.error(`🚫 [handleAutoDiscard] Room with player ID ${playerId} not found.`);
      return;
    }

    // Find the player in the room
    const player = room.players.find((p) => p.userId.equals(new mongoose.Types.ObjectId(playerId)));

    if (!player || !player.hand || player.hand.length === 0) {
      console.error(`🚫 [handleAutoDiscard] Player ${playerId} has no cards to discard.`);
      return;
    }

    // Discard a random card from the player's hand
    const randomCardIndex = Math.floor(Math.random() * player.hand.length);
    const discardedCard = player.hand.splice(randomCardIndex, 1)[0];

    // Add the discarded card to the open deck
    room.openDeck.push(discardedCard);

    // Save the updated room
    await room.save();

    console.log(`✅ [handleAutoDiscard] Player ${playerId} auto-discarded card:`, discardedCard);

    // Emit an event to notify clients about the auto-discard
    if (global.io) {
      global.io.to(room._id).emit("playerDiscarded", {
        userId: playerId,
        card: discardedCard,
        nextTurn: room.currentTurn,
      });
    }
  } catch (error) {
    console.error(`🔥 [handleAutoDiscard] Error handling auto-discard:`, error);
  }
};

module.exports = {
  initializePlayerTimer,
  startTurnTimer,
  clearTurnTimer,
  resetPlayerTimersForNewRound,
  removePlayerTimer,
  handleTimeOut,
  handleAutoDiscard,
};