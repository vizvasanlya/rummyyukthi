const User = require("../models/user.model"); // Mongoose User model

module.exports = {
  deductEntryFee,
  distributePrize,
};

async function deductEntryFee(players, gameType, entryFee) {
  if (gameType === "points") return; 

  for (const player of players) {
    await User.findByIdAndUpdate(player.userId, { $inc: { wallet: -entryFee } });
  }
}

async function distributePrize(room) {
  const { gameType, entryFee, perPointValue, players } = room;
  let winner = players.find((p) => p.status === "declared");
  if (!winner) return;

  let totalPrize = 0;

  if (gameType === "points") {
    let totalPoints = players.reduce((sum, p) => sum + p.score, 0);
    totalPrize = totalPoints * perPointValue;
  } else {
    totalPrize = entryFee * players.length;
  }

  let platformFee = totalPrize * 0.10;
  let winnerAmount = totalPrize - platformFee;

  await User.findByIdAndUpdate(winner.userId, { $inc: { wallet: winnerAmount } });
}
