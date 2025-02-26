// walletUtils.js
const User = require("../models/user.model");

const updateWalletBalances = async (gameResults) => {
    try {
        console.log("Game Results:", JSON.stringify(gameResults, null, 2)); // Debug log

        // Validate gameResults
        if (!gameResults || !Array.isArray(gameResults.updatedBalances)) {
            throw new Error("Invalid game results format: updatedBalances is missing or not an array");
        }

        // Update wallet balances for each player
        for (const balanceUpdate of gameResults.updatedBalances) {
            const { playerId, balanceChange } = balanceUpdate;

            // Validate balanceUpdate
            if (!playerId || typeof balanceChange !== "number") {
                console.error("Invalid balance update:", balanceUpdate);
                continue;
            }

            // Find the user and update their balance
            const user = await User.findById(playerId);
            if (!user) {
                console.error(`User not found: ${playerId}`);
                continue;
            }

            user.balance += balanceChange;
            await user.save();
        }

        console.log("Wallet balances updated successfully");
    } catch (error) {
        console.error("Error updating wallet balances:", error);
        throw error;
    }
};

module.exports = {
    updateWalletBalances
};