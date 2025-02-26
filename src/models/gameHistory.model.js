const mongoose = require("mongoose");

const GameHistorySchema = new mongoose.Schema({
    gameRoomId: { type: mongoose.Schema.Types.ObjectId, ref: "GameRoom", required: true },
    gameType: { type: String, enum: ["points", "pool", "deals"], required: true },
    players: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            score: { type: Number, required: true },
            winnings: { type: Number, required: true },
            rank: { type: Number },
        }
    ],
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
});

module.exports = mongoose.model("GameHistory", GameHistorySchema);
