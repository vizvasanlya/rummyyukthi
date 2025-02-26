// src/utils/validateRummyHand.js

export const isValidRummyHand = (hand) => {
    // Sample logic for rummy validation
    if (!hand || hand.length !== 13) {
      return { isValid: false, error: "Invalid hand size!" };
    }
  
    // Example validation: Check for at least two sequences
    const sequences = hand.filter((group) => group.type === "sequence");
    const pureSequences = sequences.filter((seq) => !seq.includes("Joker"));
  
    if (sequences.length < 2 || pureSequences.length < 1) {
      return { isValid: false, error: "You need at least two sequences, one pure." };
    }
  
    // Check for valid sets
    const sets = hand.filter((group) => group.type === "set");
    if (sets.length + sequences.length < 3) {
      return { isValid: false, error: "Invalid sets or sequences." };
    }
  
    return { isValid: true };
  };
  