// scoreUtils.js
const calculateGameResults = (room) => {
    const { gameType, players, perPointValue, poolType, numberOfDeals } = room;

    switch (gameType) {
        case "points":
            return calculatePointsRummyScore(players, perPointValue);
        case "pool":
            return calculatePoolRummyScore(players, poolType);
        case "deals":
            return calculateDealsRummyScore(players, numberOfDeals);
        default:
            throw new Error("Invalid game type");
    }
};

const calculatePointsRummyScore = (players, perPointValue) => {
    // Find the winner (player with isWinner = true)
    let winner = players.find(player => player.isWinner);
    if (!winner) {
        return {
            winnerId: null,
            winnings: 0,
            updatedBalances: players.map(player => ({
                playerId: player.userId,
                balanceChange: 0
            })),
            scores: players.map(player => ({
                playerId: player.userId,
                score: player.score
            }))
        };
    }

    // Calculate total lost points from non-winning players
    let totalLostPoints = players
        .filter(player => !player.isWinner)
        .reduce((sum, player) => sum + player.score, 0);

    // Calculate winnings
    let winnings = totalLostPoints * perPointValue;

    return {
        winnerId: winner.userId,
        winnings: winnings,
        updatedBalances: players.map(player => ({
            playerId: player.userId,
            balanceChange: player.isWinner ? winnings : -player.score * perPointValue
        })),
        scores: players.map(player => ({
            playerId: player.userId,
            score: player.score
        }))
    };
};

const calculatePoolRummyScore = (players, poolType) => {
    const eliminationPoint = poolType === 101 ? 101 : 201;

    let eliminatedPlayers = players.filter(player => player.score >= eliminationPoint);
    let remainingPlayers = players.filter(player => player.score < eliminationPoint);

    if (remainingPlayers.length === 1) {
        return { 
            winnerId: remainingPlayers[0].userId, 
            isGameOver: true,
            updatedBalances: players.map(player => ({
                playerId: player.userId,
                balanceChange: player.userId === remainingPlayers[0].userId ? 100 : -100
            })),
            scores: players.map(player => ({
                playerId: player.userId,
                score: player.score
            }))
        };
    }

    return { 
        eliminatedPlayers, 
        isGameOver: false,
        updatedBalances: players.map(player => ({
            playerId: player.userId,
            balanceChange: 0
        })),
        scores: players.map(player => ({
            playerId: player.userId,
            score: player.score
        }))
    };
};

const calculateDealsRummyScore = (players, dealCount) => {
    let winner = players.reduce((topPlayer, player) => (player.score > topPlayer.score ? player : topPlayer), players[0]);

    if (players.every(player => player.dealsPlayed >= dealCount)) {
        return { 
            winnerId: winner.userId, 
            isGameOver: true,
            updatedBalances: players.map(player => ({
                playerId: player.userId,
                balanceChange: player.userId === winner.userId ? 100 : -100
            })),
            scores: players.map(player => ({
                playerId: player.userId,
                score: player.score
            }))
        };
    }

    return { 
        isGameOver: false,
        updatedBalances: players.map(player => ({
            playerId: player.userId,
            balanceChange: 0
        })),
        scores: players.map(player => ({
            playerId: player.userId,
            score: player.score
        }))
    };
};

module.exports = {
    calculateGameResults,
    calculatePointsRummyScore,
    calculatePoolRummyScore,
    calculateDealsRummyScore
};