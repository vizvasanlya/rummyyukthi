import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setNumberOfPlayers, setNumberOfDeals, setEntryFee } from "../redux/slices/gameSlice";
import { fetchWalletBalance } from "../redux/slices/authSlice";
import socket, { joinRoom } from "../socket";
const entryFeeOptions = [10, 20, 50, 100, 200, 500, 1000];

const DealsRummyScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const walletBalance = useAppSelector((state) => state.auth.balance || 0);
  const user = useAppSelector((state) => state.auth.user);

  const [players, setPlayers] = useState(2);
  const [deals, setDeals] = useState(2);
  const [entryFee, setEntryFee] = useState(10);
  const [roomId, setRoomId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gameType] = useState("Deals");

  // Fetch wallet balance every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchWalletBalance());
    }, 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Listen for "roomJoined" event
  useEffect(() => {
    socket.on("roomJoined", (room) => {
      if (room?.roomId) {
        setRoomId(room.roomId);
        navigation.navigate("GameRoom", { 
          roomId: room.roomId, 
          gameType: "deals", 
          playerLimit: players, 
          numberOfDeals: deals, 
          entryFee 
        });
      } else {
        console.error("⚠️ roomJoined event received but no roomId!");
      }
    });

    return () => {
      socket.off("roomJoined");
    };
  }, [navigation,gameType, players, deals, entryFee,roomId]);

  const handleJoinGame = () => {
    if (walletBalance < entryFee) {
      Alert.alert("🚨 Insufficient Balance", "You don't have enough balance to join this game. Please add cash.");
      return;
    }

    setLoading(true);

    const requestData = {
      gameType: "deals",
      playerLimit: players,
      numberOfDeals: deals,
      entryFee,
      userId: user.id,
      username
    };
    console.log("🆕 Sending joinRoom event with Config:", requestData);
    joinRoom(requestData, (response) => {
      setLoading(false);

      if (response?.roomId) {
        console.log("✅ Room Join Initiated. Waiting for roomJoined...");
        setRoomId(response.roomId); // Store roomId but don't navigate yet
      } else {
        Alert.alert("❌ Failed to join room");
      }
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deals Rummy</Text>
             {/* Wallet Balance and Add Cash Button */}
      <View style={styles.walletContainer}>
        <Text style={styles.balanceText}>₹{walletBalance}</Text>
        <TouchableOpacity style={styles.addCashButton}>
          <Text style={styles.addCashText}>Add Cash</Text>
        </TouchableOpacity>
      </View>
      </View>

      {/* Player Selection */}
      <Text style={styles.sectionTitle}>Players</Text>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, players === 2 && styles.selected]}
          onPress={() => setPlayers(2)}
        >
          <Text style={styles.toggleText}>2 Players</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, players === 6 && styles.selected]}
          onPress={() => setPlayers(6)}
        >
          <Text style={styles.toggleText}>6 Players</Text>
        </TouchableOpacity>
      </View>

      {/* Number of Deals Selection */}
      <Text style={styles.sectionTitle}>Deals</Text>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, deals === 2 && styles.selected]}
          onPress={() => setDeals(2)}
        >
          <Text style={styles.toggleText}>2 Deals</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, deals === 3 && styles.selected]}
          onPress={() => setDeals(3)}
        >
          <Text style={styles.toggleText}>3 Deals</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, deals === 6 && styles.selected]}
          onPress={() => setDeals(6)}
        >
          <Text style={styles.toggleText}>6 Deals</Text>
        </TouchableOpacity>
      </View>

      {/* Entry Fee Selection */}
      <Text style={styles.sectionTitle}>Entry Fee</Text>
      <View style={styles.entryFeeGrid}>
        {entryFeeOptions.map((fee) => (
          <TouchableOpacity
            key={fee}
            style={[styles.entryFeeButton, entryFee === fee && styles.selected]}
            onPress={() => setEntryFee(fee)}
          >
            <Text style={styles.entryFeeText}>₹{fee}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Join Game Button */}
      <TouchableOpacity style={styles.joinGameButton} onPress={handleJoinGame}>
        <Text style={styles.joinGameButtonText}>Join Game</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor:"#1E1E1E",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    fontSize: 24,
    color: "#333",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  walletSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceText: {
    fontSize: 24,
    fontWeight: "bold",
    marginRight: 10,
  },
  addCashButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#6200ee",
  },
  addCashText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  selected: {
    backgroundColor: "#007BFF",
    borderColor: "#007BFF",
  },
  toggleText: {
    fontSize: 16,
    color: "#333",
  },
  entryFeeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  entryFeeButton: {
    width: "10%",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    alignItems: "center",
  },
  entryFeeText: {
    fontSize: 16,
    color: "#333",
  },
  joinGameButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#007BFF",
  },
  joinGameButtonText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default DealsRummyScreen;
