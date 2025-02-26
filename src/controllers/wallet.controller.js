const Transaction = require("../models/transaction.model");
const { getIO } = require("../socket");
const mongoose = require("mongoose");
const User = require("../models/user.model");

// Get wallet balance
exports.getBalance = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return wallet balance from the user's document
        res.status(200).json({ balance: user.wallet });
    } catch (error) {
        console.error("Error fetching balance:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Deposit into wallet
exports.deposit = async (req, res) => {
    try {
        const { userId, amount } = req.body;

        if (amount <= 0) {
            return res.status(400).json({ message: "Invalid deposit amount" });
        }

        // Find and update user's wallet balance
        const user = await User.findByIdAndUpdate(
            userId,
            { $inc: { wallet: amount } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create transaction record
        await Transaction.create({ userId, type: "deposit", amount });

        // Emit wallet update event
        const io = getIO();
        io.emit(`walletUpdate:${userId}`, { balance: user.wallet });

        res.status(200).json({ message: "Deposit successful", balance: user.wallet });
    } catch (error) {
        console.error("Error depositing:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Withdraw from wallet
exports.withdraw = async (req, res) => {
    try {
        const { userId, amount } = req.body;

        if (amount <= 0) {
            return res.status(400).json({ message: "Invalid withdrawal amount" });
        }

        // Find the user and check wallet balance
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.wallet < amount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        // Update wallet balance
        user.wallet -= amount;
        await user.save();

        // Create transaction record
        await Transaction.create({ userId, type: "withdraw", amount });

        // Emit wallet update event
        const io = getIO();
        io.emit(`walletUpdate:${userId}`, { balance: user.wallet });

        res.status(200).json({ message: "Withdrawal successful", balance: user.wallet });
    } catch (error) {
        console.error("Error withdrawing:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get transaction history
exports.getTransactionHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find transactions for the user
        const transactions = await Transaction.find({ userId }).sort({ timestamp: -1 });

        res.status(200).json({ transactions });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
