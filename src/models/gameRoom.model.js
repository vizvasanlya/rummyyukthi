const mongoose = require("mongoose");

// Define Card Schema
const CardSchema = new mongoose.Schema({
  rank: { type: String, required: true }, 
  suit: { type: String, required: true },
  isJoker: { type: Boolean, default: false },
});

// Define Player Schema
const PlayerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["waiting", "joined", "ready","dropped",], default: "waiting" },
  hand: { type: [CardSchema], default: [] },
  score: { type: Number, default: 0 }, 
});

const GameRoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  gameType: {
    type: String,
    enum: ["points", "pool", "deals"],
    required: true,
  },
  playerLimit: {
    type: Number,
    enum: [2, 6],
    required: true,
  },
  perPointValue: {
    type: Number,
    required: function () {
      return this.get("gameType") === "points";
    },
  },
  poolType: {
    type: Number,
    enum: [101, 201],
    required: function () {
      return this.get("gameType") === "pool";
    },
  },
  numberOfDeals: {
    type: Number,
    required: function () {
      return this.get("gameType") === "deals";
    },
  },
  entryFee: {
    type: Number,
    required: function () {
      return ["pool", "deals"].includes(this.get("gameType"));
    },
  },
  players: { type: [PlayerSchema], default: [] }, // Updated to use PlayerSchema
  gameStatus: {
    type: String,
    enum: ["waiting", "in-progress","started", "completed"],
    default: "waiting",
  },
  dealer: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Assigned dealer
  deck: { type: [CardSchema], default: [] }, // Updated to use CardSchema
  currentTurn: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  turnIndex: { type: Number, default: 0 }, // Index for tracking turn order
  wildJoker: { type: CardSchema }, // Now a structured object instead of a string
  openDeck: { type: [CardSchema], default: [] }, // Updated to use CardSchema
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Game winner
  scoreboard: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      points: { type: Number },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("GameRoom", GameRoomSchema);
