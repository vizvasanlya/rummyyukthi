import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Card = ({ rank, suit }) => {
  // Normalize suit names
  const formattedSuit = suit.charAt(0).toUpperCase() + suit.slice(1);

  // Define suit symbols and colors
  const suitSymbols = {
    Hearts: { symbol: "♥", color: "red" },
    Diamonds: { symbol: "♦", color: "red" },
    Clubs: { symbol: "♣", color: "black" },
    Spades: { symbol: "♠", color: "black" },
    Joker: { symbol: "🃏", color: "black" },
  };

  const suitData = suitSymbols[formattedSuit] || { symbol: "?", color: "black" };

  return (
    <View style={styles.card}>
      {/* 🎭 JOKER Card (Large Full Symbol & Name) */}
      {formattedSuit === "Joker" ? (
        <View style={styles.jokerContainer}>
          <Text style={styles.jokerText}>JOKER</Text>
          <Text style={styles.jokerSymbol}>{suitData.symbol}</Text>
          <Text style={styles.jokerText}>JOKER</Text>
        </View>
      ) : (
        <>
          {/* Top Left - Rank & Suit */}
          <View style={styles.topLeft}>
            <Text style={[styles.rank, { color: suitData.color }]}>{rank}</Text>
            <Text style={[styles.suit, { color: suitData.color }]}>{suitData.symbol}</Text>
          </View>

          {/* Bottom Right - Mirrored Rank & Suit */}
          <View style={styles.bottomRight}>
            <Text style={[styles.rank, { color: suitData.color }]}>{rank}</Text>
            <Text style={[styles.suit, { color: suitData.color }]}>{suitData.symbol}</Text>
          </View>
        </>
      )}
    </View>
  );
};

// 🎨 **Final Styles (Accurate Joker & Card Layout)**
const styles = StyleSheet.create({
  card: {
    width: 55,
    height: 80,
    backgroundColor: "white", // ✅ Card is white, no extra background
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#000",
    padding: 0,  // ✅ Remove any extra space inside
    margin: 0,   // ✅ No extra margins causing overflow
    position: "relative",
    overflow: "hidden",  // ✅ Prevent extra background from appearing
  },
  
  
  topLeft: {
    position: "absolute",
    top: 1, 
    left: -1,
    alignItems: "center",
  },
  bottomRight: {
    position: "absolute",
    bottom: 1, // Minimal spacing
    right: -1,
    alignItems: "center",
    transform: [{ rotate: "180deg" }], // Mirrored
  },
  rank: {
    fontSize: 14, 
    fontWeight: "bold",
    lineHeight: 16,
  },
  suit: {
    fontSize: 14,
  },
  // jokerContainer: {
  //   flex: 1,
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  jokerSymbol: {
    fontSize: 68, 
    color: "black",
    textAlign: "center",
    top:-30
    
  },
  jokerText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
});

export default Card;
