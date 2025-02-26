const GameHistory = require("../models/gameHistory.model");
const Leaderboard = require("../models/leaderboard.model");
const { getIO } = require("../socket");

exports.saveGameResult = async (req, res) => {
    try {
        const { gameRoomId, gameType, players } = req.body;

        const startTime = new Date(req.body.startTime);
        const endTime = new Date();

        const gameHistory = new GameHistory({
            gameRoomId,
            gameType,
            players,
            startTime,
            endTime,
        });

        await gameHistory.save();

        for (const player of players) {
            const { userId, winnings } = player;
            let leaderboardEntry = await Leaderboard.findOne({ userId });

            if (leaderboardEntry) {
                leaderboardEntry.totalWinnings += winnings;
            } else {
                leaderboardEntry = new Leaderboard({ userId, totalWinnings: winnings });
            }

            await leaderboardEntry.save();
        }

        const io = getIO();
        io.emit("leaderboardUpdate", { message: "Leaderboard updated" });

        res.status(200).json({ message: "Game history saved successfully" });
    } catch (error) {
        console.error("Error saving game history:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getGameHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const history = await GameHistory.find({ "players.userId": userId })
            .sort({ endTime: -1 })
            .populate("players.userId", "username");

        res.status(200).json({ history });
    } catch (error) {
        console.error("Error fetching game history:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await Leaderboard.find()
            .sort({ totalWinnings: -1 })
            .limit(10)
            .populate("userId", "username");

        res.status(200).json({ leaderboard });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
