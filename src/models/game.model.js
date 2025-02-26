const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "GameRoom", required: true },
  players: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      cards: [{ type: String }], // Stores player’s cards
      isTurn: { type: Boolean, default: false },
      isDealer: { type: Boolean, default: false },
    },
  ],
  dealer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  wildJoker: { type: String },
  openDeck: [{ type: String }],
  turnIndex: { type: Number, default: 0 }, // Track whose turn it is
  status: {
    type: String,
    enum: ["in-progress", "completed"],
    default: "in-progress",
  },
  createdAt: { type: Date, default: Date.now },
});

// Real-time Updates
gameSchema.methods.updateGame = function (io) {
  io.to(this.roomId.toString()).emit("updateGame", this);
};

module.exports = mongoose.model("Game", gameSchema);
