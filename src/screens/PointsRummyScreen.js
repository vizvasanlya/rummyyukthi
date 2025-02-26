import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchWalletBalance } from "../redux/slices/authSlice";
import socket, { joinRoom } from "../socket";

export default function PointsRummyScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const walletBalance = useAppSelector((state) => state.auth.balance || 0);
  const user = useAppSelector((state) => state.auth.user);
  const [players, setPlayers] = useState(2);
  const [pointValue, setPointValue] = useState(0.05);
  const [roomId, setRoomId] = useState(null);
  const [loading, setLoading] = useState(false);
  const minBalanceRequired = pointValue * 80;

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchWalletBalance());
    }, 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    socket.on("roomJoined", (room) => {
      if (room?.roomId) {
        setRoomId(room.roomId);
        navigation.navigate("GameRoom", {
          roomId: room.roomId,
          gameType: "points",
          playerLimit: players,
          perPointValue: pointValue,
        });
      } else {
        console.error("⚠️ roomJoined event received but no roomId!");
      }
    });

    return () => {
      socket.off("roomJoined");
    };
  }, [navigation, players, pointValue]);

  const handleJoinGame = () => {
    if (walletBalance < minBalanceRequired) {
      Alert.alert("🚨 Insufficient Balance", `You need at least ₹${minBalanceRequired.toFixed(2)} to join this game.`);
      return;
    }

    setLoading(true);

    const requestData = {
      gameType: "points",
      playerLimit: players,
      perPointValue: pointValue,
      userId: user.id,
    };

    console.log("🆕 Sending joinRoom event with Config:", requestData);
    joinRoom(requestData, (response) => {
      setLoading(false);
      if (response?.roomId) {
        console.log("✅ Room Join Initiated. Waiting for roomJoined...");
        setRoomId(response.roomId);
      } else {
        Alert.alert("❌ Failed to join room");
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Points Rummy</Text>

        {/* Wallet Balance and Add Cash Button */}
        <View style={styles.walletContainer}>
          <Text style={styles.balanceText}>₹{walletBalance}</Text>
          <TouchableOpacity style={styles.addCashButton}>
            <Text style={styles.addCashText}>Add Cash</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.mainContent}>
        {/* Players Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Players</Text>
          <View style={styles.selectionContainer}>
            {[2, 6].map((value) => (
              <TouchableOpacity
                key={value}
                style={[styles.minimalButton, players === value && styles.selectedButton]}
                onPress={() => setPlayers(value)}
              >
                <Text style={styles.selectionText}>{value}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Per Point Value Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Point Value</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.inlineList}>
            {[0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10, 20, 50].map((value) => (
              <TouchableOpacity
                key={value}
                style={[styles.inlineButton, pointValue === value && styles.selectedButton]}
                onPress={() => setPointValue(value)}
              >
                <Text style={styles.selectionText}>₹{value}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Join Game Button */}
        <TouchableOpacity style={styles.joinButton} onPress={handleJoinGame} disabled={!(players && pointValue)}>
          {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.joinButtonText}>Join Game</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#1E1E1E",
  },
  backButton: {
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 26,
    color: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
  walletContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 10,
  },
  addCashButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFD700",
  },
  addCashText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E1E1E",
  },
  mainContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    right:-340,
  },
  selectionContainer: {
    flexDirection: "row",
    right:-340,
  
  },
  minimalButton: {
    width: 50,
    height: 50,
    borderRadius: 0,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2979FF",
    backgroundColor: "#3A3A3A",
  },
  inlineList: {
    flexDirection: "row",
  },
  inlineButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#2979FF",
    backgroundColor: "#3A3A3A",
  },
  selectedButton: {
    backgroundColor: "#2979FF",
  },
  selectionText: {
    fontSize: 16,
    color: "#E0E0E0",
  },
  joinButton: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal:10,
    borderRadius: 8,
    backgroundColor: "#00C853",
    alignItems: "center",
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
