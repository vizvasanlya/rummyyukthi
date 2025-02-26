import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2F2F2F", // Dark background for a gaming feel
  },

  // Top Bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "transparent",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  walletBalance: {
    fontSize: 16,
    color: "#fff",
  },
  gameDetails: {
    fontSize: 14,
    color: "#fff",
  },
  addCashButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#007BFF",
    borderRadius: 5,
  },
  addCashText: {
    color: "#fff",
    fontWeight: "bold",
  },
  leaveRoomButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FF3B30",
    borderRadius: 5,
  },
  leaveRoomText: {
    color: "#fff",
    fontWeight: "bold",
  },

  // Game Table
  gameTable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
  playerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  playerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#fff",
  },
  playerName: {
    marginTop: 8,
    fontSize: 14,
    color: "#fff",
  },
  waitingCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  waitingText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
  },

  // Waiting Text
  waitingTextContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  waitingForPlayersText: {
    fontSize: 16,
    color: "#fff",
  },
});
