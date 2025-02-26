const express = require("express");
const router = express.Router();
const HistoryController = require("../controllers/history.controller");

router.post("/save-game", HistoryController.saveGameResult);
router.get("/history/:userId", HistoryController.getGameHistory);
router.get("/leaderboard", HistoryController.getLeaderboard);

module.exports = router;
