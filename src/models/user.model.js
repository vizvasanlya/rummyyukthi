const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, enum: ["online", "offline"], default: "offline" },
    wallet: { type: Number, default: 1000 }, // Default balance for new users
    gamesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Hash password before saving to DB
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Wallet update function
UserSchema.methods.updateWallet = async function (amount) {
  this.wallet += amount;
  await this.save();
};

module.exports = mongoose.model("User", UserSchema);
