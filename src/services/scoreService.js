module.exports = {
    calculatePlayerScore,
    updateScoresAfterDeclaration,
    checkPoolEliminations,
  };
  
  function calculatePlayerScore(player) {
    if (player.status === "declared") {
      return 0; // Winner gets 0 points
    }
    
    if (player.status === "dropped") {
      return player.dropType === "first" ? 20 : 40; // First Drop = 20, Middle Drop = 40
    }
  
    let unmatchedPoints = player.hand.reduce((sum, card) => sum + card.value, 0);
    return Math.min(unmatchedPoints, 80); // Max limit = 80 points
  }
  
  function updateScoresAfterDeclaration(room) {
    let winner = null;
    let losingPlayers = [];
  
    room.players.forEach((player) => {
      player.score += calculatePlayerScore(player);
      if (player.status === "declared") {
        winner = player;
      } else {
        losingPlayers.push(player);
      }
    });
  
    return { winner, losingPlayers };
  }
  
  function checkPoolEliminations(room) {
    if (room.gameType !== "pool") return;
    
    room.players = room.players.filter(player => player.score < room.poolType);
  }
  