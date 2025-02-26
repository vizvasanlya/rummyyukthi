module.exports = (io, gameRooms, walletService) => {

  function calculateScores(roomId) {
    const room = gameRooms.get(roomId);
    if (!room) return console.log(`❌ [RESULT] Room ${roomId} not found.`);

    let winner = room.players.find(p => p.status === "declared");
    if (!winner) return console.log(`⚠️ [NO WINNER] No player declared.`);

    let totalLoserScore = 0;
    let losingPlayers = [];

    room.players.forEach((player) => {
      if (player.userId !== winner.userId) {
        let unmatchedPoints = player.hand.reduce((sum, card) => sum + card.value, 0);
        player.score = Math.min(unmatchedPoints, 80);
        totalLoserScore += player.score;
        losingPlayers.push({ userId: player.userId, score: player.score });
      }
    });

    let winnerAmount = room.gameType === "points"
      ? totalLoserScore * room.perPointValue // Points Rummy: (Total Score * Per Point Value)
      : room.entryFee * room.players.length; // Pool/Deals Rummy: (Entry Fee * Total Players)

    const platformFee = winnerAmount * 0.1;
    const finalWinnings = winnerAmount - platformFee;

    // Update Winner's Wallet
    walletService.updateBalance(winner.userId, finalWinnings);

    io.to(roomId).emit("gameOver", {
      winner: { userId: winner.userId, score: 0, winnings: finalWinnings },
      losers: losingPlayers,
    });

    console.log(`🏆 [GAME OVER] Winner: ${winner.userId}, Winnings: ${finalWinnings}`);

    // Handle Next Round or Game Completion
    if (room.gameType === "pool" || room.gameType === "deals") {
      if (shouldContinueNextRound(room)) {
        room.round++;
        rotateDealer(room);
        io.to(roomId).emit("nextRound", { round: room.round, dealer: room.dealerId });
        console.log(`🔄 [NEXT ROUND] Round ${room.round}, New Dealer: ${room.dealerId}`);
      } else {
        console.log(`🚪 [GAME ENDED] Room ${roomId} completed.`);
        gameRooms.delete(roomId);
      }
    } else {
      gameRooms.delete(roomId);
    }
  }

  function shouldContinueNextRound(room) {
    if (room.gameType === "pool") {
      return room.players.some((p) => p.score < room.poolType);
    } else if (room.gameType === "deals") {
      return room.round < room.numberOfDeals;
    }
    return false;
  }

  function rotateDealer(room) {
    const nextDealerIndex = (room.players.findIndex(p => p.userId === room.dealerId) + 1) % room.players.length;
    room.dealerId = room.players[nextDealerIndex].userId;
    console.log(`👑 [DEALER ROTATED] New Dealer: ${room.dealerId}`);
  }

  return { calculateScores };
};
