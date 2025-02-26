const express = require("express");
const router = express.Router();
const ScoreController = require("../controllers/scoreController");

// **🛣 Routes**
router.get("/calculate/:gameRoomId", ScoreController.calculateScores); // Calculate Scores & Declare Winner
router.get("/results/:gameRoomId", ScoreController.getGameResults); // Fetch Game Results

module.exports = router;
