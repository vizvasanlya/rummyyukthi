import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";


const TopBar = ({ walletBalance, gameType, playerLimit, entryFee, handleLeaveRoom }) => {
  const navigation = useNavigation();
  return (
    <View style={styles.topBar}>
      <View style={styles.walletContainer}>
        <Text style={styles.walletText}>₹{walletBalance}</Text>
        <TouchableOpacity 
        style={styles.addCashButton} onPress={() => navigation.navigate("Deposit")}>
  <Text style={styles.addCashText}>Add Cash</Text>
</TouchableOpacity>
      </View>

      <Text style={styles.configText}>
        {`${gameType} | ${playerLimit} Players | ${
          gameType === "Points" ? `₹${entryFee} per point` : `Entry: ₹${entryFee}`
        }`}
      </Text>

      <TouchableOpacity onPress={handleLeaveRoom} style={styles.exitButton}>
        <Text style={styles.exitText}>Exit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    position: "absolute",
    top: 2,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  walletText: { fontSize: 16, fontWeight: "bold", color: "#333" },
  addCashButton: {
    top:-20,
    left:50,
    borderRadius: 30,
    backgroundColor: "grey",
  },
  addCashText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  configText: { flex: 1,left:180, fontSize: 10, fontWeight: "bold", textAlign: "center",top:-20 },
  exitButton: { flex: 1, alignItems: "flex-end" },
  exitText: { fontSize: 16, color: "#FF3B30" },
});

export default TopBar;
