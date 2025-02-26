const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/admin.controller");

// 🔹 Player Management
router.get("/players", AdminController.getAllPlayers);
router.post("/player/status", AdminController.updatePlayerStatus);

// 🔹 Game Room Monitoring
router.get("/game-rooms", AdminController.getActiveGameRooms);

// 🔹 Transaction Monitoring
router.get("/transactions", AdminController.getAllTransactions);

// 🔹 Game Settings Modification
router.post("/update-game-settings", AdminController.updateGameSettings);

module.exports = router;
