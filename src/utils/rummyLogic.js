// Generate a shuffled deck
exports.shuffleDeck = () => {
    const suits = ["hearts", "diamonds", "clubs", "spades"];
    const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let deck = [];

    // Generate cards
    suits.forEach(suit => {
        ranks.forEach(rank => {
            deck.push({ suit, rank });
        });
    });

    // Add two jokers
    deck.push({ suit: "joker", rank: "joker" });
    deck.push({ suit: "joker", rank: "joker" });

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
};

// Pick a random NON-JOKER card as the wild joker
exports.pickWildJoker = (deck) => {
    const nonJokerCards = deck.filter(card => card.rank !== "joker");
    if (nonJokerCards.length === 0) return null;
    return nonJokerCards[Math.floor(Math.random() * nonJokerCards.length)];
};

exports.validateHand = (hand, wildJoker) => {
    const sequences = extractSequences(hand);
    const hasPureSequence = sequences.some(seq => isPureSequence(seq, wildJoker));

    return hasPureSequence && sequences.length >= 2; // Must have at least one pure sequence and two sequences in total
};

const extractSequences = (hand) => {
    // Placeholder for sequence extraction logic (Sort & check consecutive numbers)
    return [];
};

const isPureSequence = (sequence, wildJoker) => {
    return sequence.every(card => card.rank !== wildJoker.rank || card.suit !== wildJoker.suit);
};

  
