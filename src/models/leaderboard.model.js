const mongoose = require("mongoose");

const LeaderboardSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    totalWinnings: { type: Number, default: 0 },
});

module.exports = mongoose.model("Leaderboard", LeaderboardSchema);
