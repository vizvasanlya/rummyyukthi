import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

const ActionButtons = ({ onDrop, onDiscard, onDeclare, isPlayerTurn, hasDrawn, selectedCards = [] }) => {
  const [showDrop, setShowDrop] = useState(true);

  // Reset Drop button visibility at the start of every turn
  useEffect(() => {
    if (isPlayerTurn) {
      setShowDrop(true); // ✅ Reset Drop button at the beginning of turn
    }
  }, [isPlayerTurn]); // ✅ Runs every time `isPlayerTurn` updates

  // Hide Drop button when player draws a card
  useEffect(() => {
    if (hasDrawn) {
      setShowDrop(false); // ✅ Hide Drop button once a card is drawn
    }
  }, [hasDrawn]); // ✅ Runs every time `hasDrawn` updates

  // Show Discard and Declare only when exactly 1 card is selected
  const showDiscardAndDeclare = isPlayerTurn && selectedCards.length === 1;

  // Hide buttons if it's not the player's turn
  if (!isPlayerTurn) return null;

  return (
    <View style={styles.actionButtons}>
      {/* Drop button - resets every turn but disappears after drawing */}
      {showDrop && (
        <TouchableOpacity onPress={onDrop} style={styles.actionButton}>
          <Text style={styles.actionText}>Drop</Text>
        </TouchableOpacity>
      )}

      {/* Show Discard and Declare only when exactly 1 card is selected */}
      {showDiscardAndDeclare && (
        <>
          <TouchableOpacity onPress={onDiscard} style={styles.actionButton}>
            <Text style={styles.actionText}>Discard</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onDeclare} style={styles.actionButton}>
            <Text style={styles.actionText}>Declare</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionButtons: {
    position: "absolute",
    bottom: 170,
    right: 120,
    flexDirection: "row",
    justifyContent: "space-around",
    width: "25%",
  },
  actionButton: {
    padding: 8,
    backgroundColor: "grey",
    borderRadius: 8,
    minWidth: 20,
    alignItems: "center",
  },
  actionText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default ActionButtons;
