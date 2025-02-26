import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const GameScoreboard = ({ players, gameId, onClose, timer }) => {
  const getResultText = (player) => {
    if (player.won) return "🏆";
    if (player.dropped) return "Dropped";
    if (player.invalidDeclaration) return "Lost";
    return "Lost";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Results | {gameId}</Text>
        <TouchableOpacity onPress={onClose}>
          <Icon name="close" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.columnHeader}>Username</Text>
        <Text style={styles.columnHeader}>Result</Text>
        <Text style={styles.columnHeader}>Cards</Text>
        <Text style={styles.columnHeader}>Points</Text>
        <Text style={styles.columnHeader}>Score</Text>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        {players.map((player) => (
          <View key={player.userId} style={styles.tableRow}>
            <Text style={styles.cell}>{player.username}</Text>
            <Text style={[styles.cell, styles.result]}>{getResultText(player)}</Text>
            <Text style={styles.cell}>{player.cards.join(", ")}</Text>
            <Text style={styles.cell}>{player.points} Pts</Text>
            <Text style={styles.cell}>{player.totalScore}</Text>
          </View>
        ))}
      </ScrollView>
      
      {/* Timer */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>Time Left: {timer}s</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#2D2D2D",
    borderRadius: 10,
    width: "90%",
    alignSelf: "center",
    color: "#FFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#666",
  },
  columnHeader: {
    fontWeight: "bold",
    color: "#BBB",
    flex: 1,
    textAlign: "center",
  },
  scrollContainer: {
    maxHeight: 200,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  cell: {
    color: "#FFF",
    flex: 1,
    textAlign: "center",
  },
  result: {
    fontWeight: "bold",
  },
  timerContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  timerText: {
    fontSize: 16,
    color: "#FFD700",
  },
});

export default GameScoreboard;