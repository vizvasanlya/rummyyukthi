const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["deposit", "withdraw","entry_fee", "winning", "refund"],
    required: true,
  },
  amount: { type: Number, required: true },
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", transactionSchema);
