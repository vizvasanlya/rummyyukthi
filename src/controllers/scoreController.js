const ScoreUtils = require("../utils/scoreUtils");
const WalletUtils = require("../utils/walletUtils");
const GameRoom = require("../models/gameRoom.model");
const { getIO } = require("../socket");

// 🏆 **Calculate Scores & Declare Winner**
exports.calculateScores = async (req, res) => {
    try {
        const io = getIO();
        const { gameRoomId } = req.params;
        const gameRoom = await GameRoom.findById(gameRoomId).populate("players.userId");

        if (!gameRoom) {
            return res.status(404).json({ message: "Game room not found" });
        }

        // **1️⃣ Calculate game results (Points, Pool, Deals)**
        const results = ScoreUtils.calculateGameResults(gameRoom);

        // **2️⃣ Update wallet balances based on game results**
        await WalletUtils.updateWalletBalances(results);

        // **3️⃣ Update game status & store results**
        gameRoom.gameStatus = "completed";
        gameRoom.results = results;
        await gameRoom.save();

        // **4️⃣ Emit real-time event to notify players**
        io.emit("gameOver", { gameRoomId, results });

        return res.status(200).json({ success: true, message: "Game completed!", results });

    } catch (error) {
        console.error("Error calculating scores:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// 🔄 **Fetch Game Results**
exports.getGameResults = async (req, res) => {
    try {
        const { gameRoomId } = req.params;
        const gameRoom = await GameRoom.findById(gameRoomId).populate("players.userId");

        if (!gameRoom) {
            return res.status(404).json({ message: "Game room not found" });
        }

        return res.status(200).json({ success: true, results: gameRoom.results });

    } catch (error) {
        console.error("Error fetching results:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
