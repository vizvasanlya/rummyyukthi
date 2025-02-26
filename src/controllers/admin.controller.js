const User = require("../models/user.model");
const GameRoom = require("../models/gameRoom.model");
const Transaction = require("../models/transaction.model");

// ✅ 1. Get all active/inactive players
exports.getAllPlayers = async (req, res) => {
    try {
        const players = await User.find({}, "username balance isActive");
        res.status(200).json({ players });
    } catch (error) {
        console.error("Error fetching players:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ 2. Change player status (Active/Inactive)
exports.updatePlayerStatus = async (req, res) => {
    try {
        const { userId, isActive } = req.body;
        await User.findByIdAndUpdate(userId, { isActive });
        res.status(200).json({ message: `Player status updated to ${isActive ? "Active" : "Inactive"}` });
    } catch (error) {
        console.error("Error updating player status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ 3. View all active game rooms
exports.getActiveGameRooms = async (req, res) => {
    try {
        const activeRooms = await GameRoom.find({ gameStatus: "in-progress" }).populate("players.userId", "username");
        res.status(200).json({ activeRooms });
    } catch (error) {
        console.error("Error fetching game rooms:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ 4. View all transactions
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().populate("userId", "username");
        res.status(200).json({ transactions });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ 5. Modify game settings (Entry fee, point value)
exports.updateGameSettings = async (req, res) => {
    try {
        const { roomId, entryFee, perPointValue } = req.body;

        let room = await GameRoom.findById(roomId);
        if (!room) return res.status(404).json({ message: "Game room not found" });

        if (entryFee) room.entryFee = entryFee;
        if (perPointValue) room.perPointValue = perPointValue;

        await room.save();
        res.status(200).json({ message: "Game settings updated successfully", room });
    } catch (error) {
        console.error("Error updating game settings:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
