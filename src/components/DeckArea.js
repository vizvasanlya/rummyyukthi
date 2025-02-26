import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import Card from "../components/Card"; // Import Card Component

const DeckArea = ({ wildJoker, openDeck = [], closedDeck = [], declareDeck = [], onDeckSelection, players, playerLimit, countdown, handleDeckSelection }) => {
  const [openDeckVisible, setOpenDeckVisible] = useState(false);
  // If players are not enough, show waiting message
  if (players?.length < playerLimit) {
    return (
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>Waiting for players ({players.length}/{playerLimit})</Text>
      </View>
    );
  }

  // If countdown is active, show countdown timer
  if (countdown !== null && countdown > 0) {
    return (
      <View style={styles.statusContainer}>
        <Text style={styles.countdownText}>Game starts in: {countdown}s</Text>
      </View>
    );
  }

  // Show the deck area only when deckSetup is received
  if (!wildJoker || !openDeck || !closedDeck) {
    return (
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}></Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* 🃏 CLOSED DECK (Face-Down Stack) */}
      <View style={styles.closedDeckContainer}>
        <TouchableOpacity onPress={() => onDeckSelection("closed")} disabled={!closedDeck?.length}>
          <Text style={styles.label}>Closed</Text>
          <View style={styles.closedDeck}>
            {[...Array(Math.min(closedDeck?.length || 0, 4))].map((_, i) => (
              <View key={i} style={[styles.cardStack, { top: i * 3, left: i * 3 }]} />
            ))}
          </View>
        </TouchableOpacity>

        {/* 🃏 WILD JOKER (Partially Below Closed Deck) */}
        {wildJoker && (
          <View style={styles.jokerContainer}>
            <Card rank={wildJoker.rank || "?"} suit={wildJoker.suit || "Joker"} />
          </View>
        )}
      </View>

      {/* 🃏 OPEN DECK (Face-Up Cards) */}
      <View style={styles.openDeckContainer}>
        <TouchableOpacity onPress={() => onDeckSelection("openDeck")} disabled={!openDeck?.length}>
          <Text style={styles.label}>Open</Text>
          <View style={styles.openDeck}>
          {Array.isArray(openDeck) && openDeck.length > 0 ? (
  <Card rank={openDeck[openDeck.length - 1].rank} suit={openDeck[openDeck.length - 1].suit} />
) : (
  <Text style={styles.emptyText}>Empty</Text>
)}
          </View>
        </TouchableOpacity>

        {/* Expand Button for Open Deck */}
        <TouchableOpacity style={styles.expandButton} onPress={() => setOpenDeckVisible(true)}>
          <Text style={styles.expandText}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* 🃏 DECLARE AREA */}
      <View style={styles.declareContainer}>
        <Text style={styles.label}>Declare</Text>
        <View style={styles.declareDeck}>
          {declareDeck?.length ? (
            declareDeck.map((card, index) => <Card key={index} rank={card.rank} suit={card.suit} />)
          ) : (
            <Text style={styles.emptyText}>Empty</Text>
          )}
        </View>
      </View>

      {/* 📜 Open Deck Modal */}
      <Modal visible={openDeckVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Open Deck Cards</Text>
            {openDeck?.length > 0 ? (
              <ScrollView horizontal>
                <View style={styles.openDeckStack}>
                  {openDeck.map((card, index) => (
                    <View key={index} style={[styles.openDeckStackedCard, { top: index * 5, left: index * 5 }]}>
                      <Card rank={card.rank} suit={card.suit} />
                    </View>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <Text style={styles.emptyText}>No cards in open deck</Text>
            )}
            <TouchableOpacity onPress={() => setOpenDeckVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", justifyContent: "space-around", marginVertical: 20 },

  // WAITING & COUNTDOWN STYLES
  statusContainer: { justifyContent: "center", alignItems: "center", padding: 20 },
  statusText: { fontSize: 16, fontWeight: "bold", color: "#555" },
  countdownText: { fontSize: 18, fontWeight: "bold", color: "#d9534f" },

  // CLOSED DECK (Face-Down Stack)
  closedDeckContainer: { alignItems: "center", marginRight: 20,top:-30 },
  closedDeck: {
    width: 40,
    height: 60,
    backgroundColor: "#333",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cardStack: {
    width: 40,
    height: 60,
    backgroundColor: "#555",
    borderRadius: 6,
    position: "absolute",
    borderWidth: 1,
    borderColor: "#000",
  },

  // WILD JOKER (Half Below Closed Deck)
  jokerContainer: {
    position: "absolute",
    bottom: 20,
    left:-60,
    alignSelf: "center",
   rotate: "180deg",
  },

  // OPEN DECK (Face-Up Card)
  openDeckContainer: { alignItems: "center", marginLeft: 20, top:-30 },
  openDeck: {
    width: 40,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "grey",
    borderRadius: 6,
    backgroundColor: "#fff",
  },

  // DECLARE AREA (Center)
  declareContainer: { alignItems: "center", marginLeft: 60, top:-40, width: 40,
    height: 60, },
  declareDeck: {
    flexDirection: "row",
    width: 40,
    height: 60,
    gap: 5,
    borderWidth: 2,
    borderColor: "#009900",
    padding: 5,
    borderRadius: 8,
    backgroundColor: "#fff",
  },

  // Expand Button
  expandButton: { marginTop: 5, backgroundColor: "grey", borderRadius: 2, padding: 1,width:"60%",top:-70,right:-45 },
  expandText: { fontSize: 8, fontWeight: "bold", color: "#fff" },

  // Open Deck Modal
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center"},
  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 8, width: "50%", alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },

  // Stacked Open Deck View (Inside Modal)
  openDeckStack: { position: "relative", height: 90, justifyContent: "center" },
  openDeckStackedCard: { position: "absolute" },

  // Close Button
  closeButton: { marginTop: 10, backgroundColor: "#ff3333", padding: 8, borderRadius: 5 },
  closeButtonText: { fontSize: 14, fontWeight: "bold", color: "#fff" },

  // Common Styles
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 5 },
  emptyText: { fontSize: 12, color: "#888" },
});

export default DeckArea;
