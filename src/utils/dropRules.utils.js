// utils/dropRules.utils.js

const playerDropStatus = new Map(); // Track drop status for each player

// Initialize drop status for a player
function initializePlayerDropStatus(playerId) {
  playerDropStatus.set(playerId, {
    hasPlayedFirstTurn: false,
    isDropped: false,
  });
}

// Handle the drop action
function handleDrop(playerId) {
  const dropStatus = playerDropStatus.get(playerId);

  if (!dropStatus || dropStatus.isDropped) return null;

  let penaltyPoints = 0;

  if (!dropStatus.hasPlayedFirstTurn) {
    // First-turn drop
    console.log(`Player ${playerId} dropped on their first turn. Penalty: 20 points.`);
    penaltyPoints = 20;
    dropStatus.isDropped = true;
  } else {
    // Drop after the first turn
    console.log(`Player ${playerId} dropped after their first turn. Penalty: 40 points.`);
    penaltyPoints = 40;
    dropStatus.isDropped = true;
  }

  // Update drop status
  playerDropStatus.set(playerId, dropStatus);

  return penaltyPoints;
}

// Mark that a player has played their first turn
function markPlayerFirstTurnPlayed(playerId) {
  const dropStatus = playerDropStatus.get(playerId);
  if (dropStatus) {
    dropStatus.hasPlayedFirstTurn = true;
    playerDropStatus.set(playerId, dropStatus);
  }
}

// Reset drop status for a new round (Pool/Deals Rummy scenario)
function resetPlayerDropStatusForNewRound(playerId) {
  if (playerDropStatus.has(playerId)) {
    playerDropStatus.set(playerId, {
      hasPlayedFirstTurn: false,
      isDropped: false,
    });
  }
}

// Clean up player drop status (e.g., when leaving the room)
function removePlayerDropStatus(playerId) {
  playerDropStatus.delete(playerId);
}

module.exports = {
  initializePlayerDropStatus,
  handleDrop,
  markPlayerFirstTurnPlayed,
  resetPlayerDropStatusForNewRound,
  removePlayerDropStatus,
};
