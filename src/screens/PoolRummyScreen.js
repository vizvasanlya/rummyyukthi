import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchWalletBalance } from "../redux/slices/authSlice";
import socket, { joinRoom } from "../socket";


const entryFeeOptions = [10, 20, 50, 100, 200, 500, 1000,2000,5000];

const PoolRummyScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const walletBalance = useAppSelector((state) => state.auth.balance || 0);
  const user = useAppSelector((state) => state.auth.user);

  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState(2);
  const [poolType, setPoolType] = useState(101);
  const [entryFee, setEntryFee] = useState(10);
  const [loading, setLoading] = useState(false);
  const [gameType] = useState("pool");

  // Fetch wallet balance every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchWalletBalance());
    }, 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Navigate to GameRoom once roomId is set
  useEffect(() => {
    socket.on("roomJoined", (room) => {
      console.log("📢 Received roomJoined event:", room);
      
      if (room?.roomId) {
        console.log("✅ Setting Room ID:", room.roomId);
        setRoomId(room.roomId);
  
        console.log("🚀 Navigating to GameRoom with roomId:", room.roomId);
        navigation.navigate("GameRoom", { 
          roomId: room.roomId,
          gameType, 
          playerLimit: players, 
          entryFee,
          poolType,
        });
      } else {
        console.error("⚠️ roomJoined event received but no roomId!");
      }
    });
  
    return () => {
      console.log("🧹 Cleaning up roomJoined listener");
      socket.off("roomJoined");
    };
  }, [navigation, gameType, players, entryFee, poolType, roomId]);
  

  const handleJoinGame = () => {
    if (walletBalance < entryFee) {
      Alert.alert("🚨 Insufficient Balance", "You don't have enough balance to join this game. Please add cash.");
      return;
    }

    setLoading(true);
    const requestData = {
      gameType,
      playerLimit: players,
      poolType,
      entryFee,
      userId: user.id,
      username: user.username,
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
        <Text style={styles.headerTitle}>Pool Rummy</Text>
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

      {/* Pool Type Selection */}
      <Text style={styles.sectionTitle}>Pool Type</Text>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, poolType === 101 && styles.selected]}
          onPress={() => setPoolType(101)}
        >
          <Text style={styles.toggleText}>101 Pool</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, poolType === 201 && styles.selected]}
          onPress={() => setPoolType(201)}
        >
          <Text style={styles.toggleText}>201 Pool</Text>
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
    backgroundColor: "#1E1E1E",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    fontSize: 40,
    color: "#333",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  walletContainer: {
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
    marginHorizontal: 2,
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

export default PoolRummyScreen;
