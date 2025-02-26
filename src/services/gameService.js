const { shuffleDeck, pickWildJoker } = require("../utils/rummyLogic");

module.exports = {
  initializeGame,
  dealCards,
  assignDealerAndFirstPlayer,
  getNextDealer,
};

function initializeGame(players, gameType) {
  let deck = shuffleDeck();
  let wildJoker = pickWildJoker(deck);

  // Assign dealer and first player
  let { dealer, firstPlayer, sortedPlayers, usedCards } = assignDealerAndFirstPlayer(players, deck);

  // Return dealer selection cards to the deck and shuffle again
  deck.push(...usedCards);
  deck = shuffleDeck();

  // Deal 13 cards per player
  let { playerHands, openDeck, closedDeck } = dealCards(sortedPlayers, deck);

  return {
    gameType,
    players: sortedPlayers,
    dealer,
    firstPlayer,
    wildJoker,
    openDeck,
    closedDeck,
  };
}

function assignDealerAndFirstPlayer(players, deck) {
  let drawnCards = players.map((player, index) => ({
    userId: player.userId,
    card: deck[index], // Assign a single card for dealer selection
  }));

  // Sort players based on card value (Ace is highest)
  drawnCards.sort((a, b) => getCardValue(b.card) - getCardValue(a.card));

  let dealer = drawnCards[0].userId; // Highest card is the dealer
  let firstPlayer = drawnCards[drawnCards.length - 1].userId; // Lowest card starts first

  let sortedPlayers = drawnCards.map(({ userId }) => ({
    userId,
    hand: [], // Hands will be assigned after dealing
  }));

  let usedCards = drawnCards.map(({ card }) => card); // These will be returned to the deck

  return { dealer, firstPlayer, sortedPlayers, usedCards };
}

function dealCards(players, deck) {
  let openDeck = deck.pop(); // 1 card for open deck
  let closedDeck = deck.slice(); // Remaining cards

  players.forEach(player => {
    player.hand = closedDeck.splice(0, 13); // Assign 13 cards
  });

  return { playerHands: players, openDeck, closedDeck };
}

function getNextDealer(currentDealer, players) {
  let currentIndex = players.findIndex(p => p.userId === currentDealer);
  return players[(currentIndex + 1) % players.length].userId;
}

function getCardValue(card) {
  const rankValues = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, J: 11, Q: 12, K: 13, A: 14 };
  return rankValues[card.rank] || 0;
}
