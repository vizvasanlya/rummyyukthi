const Wallet = require("../models/wallet.model");

// Minimum balance required for Points Rummy
const MIN_BALANCE_MULTIPLIER = 80;

/**
 * Checks if the player has enough balance before joining a game
 * @param {Object} player - Player object with userId & selected game mode
 * @param {Number} pointValue - Selected point value (for Points Rummy)
 * @param {Number} entryFee - Entry fee amount (for Pool & Deals Rummy)
 * @returns {Boolean} - Whether the player has enough balance
 */
const hasSufficientBalance = async (player, pointValue, entryFee) => {
    try {
        const wallet = await Wallet.findOne({ userId: player.userId });
        if (!wallet) return false;

        let requiredBalance = 0;
        if (player.gameMode === "Points Rummy") {
            requiredBalance = pointValue * MIN_BALANCE_MULTIPLIER;
        } else {
            requiredBalance = entryFee;
        }

        return wallet.balance >= requiredBalance;
    } catch (error) {
        console.error("Error checking balance:", error);
        return false;
    }
};

/**
 * Deducts the entry fee from the player's wallet (for Pool & Deals Rummy)
 * @param {Object} player - Player object with userId
 * @param {Number} entryFee - Entry fee amount
 * @returns {Boolean} - Whether deduction was successful
 */
const deductEntryFee = async (player, entryFee) => {
    try {
        const wallet = await Wallet.findOne({ userId: player.userId });
        if (!wallet || wallet.balance < entryFee) return false;

        wallet.balance -= entryFee;
        await wallet.save();
        return true;
    } catch (error) {
        console.error("Error deducting entry fee:", error);
        return false;
    }
};

/**
 * Refunds the entry fee to a player's wallet (if game is canceled)
 * @param {Object} player - Player object with userId
 * @param {Number} entryFee - Entry fee amount
 */
const refundEntryFee = async (player, entryFee) => {
    try {
        const wallet = await Wallet.findOne({ userId: player.userId });
        if (!wallet) return;

        wallet.balance += entryFee;
        await wallet.save();
    } catch (error) {
        console.error("Error refunding entry fee:", error);
    }
};

module.exports = {
    hasSufficientBalance,
    deductEntryFee,
    refundEntryFee
};
