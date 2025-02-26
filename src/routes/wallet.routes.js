const express = require("express");
const router = express.Router();
const WalletController = require("../controllers/wallet.controller");

router.get("/balance/:userId", WalletController.getBalance);
router.post("/deposit", WalletController.deposit);
router.post("/withdraw", WalletController.withdraw);
router.get("/transactions/:userId", WalletController.getTransactionHistory);

module.exports = router;
