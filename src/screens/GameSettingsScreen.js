import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Switch,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useAppSelector, useDispatch } from "../redux/hooks";
import { fetchGameDetails } from "../redux/slices/gameSlice"; // Assume Redux slice for API calls

const SettingsScreen = ({ onRefresh, onShowScoreboard, onShowLastDeal }) => {
  const dispatch = useDispatch();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  // Fetch game details from Redux state
  const gameDetails = useAppSelector((state) => state.game.details);
  const loading = useAppSelector((state) => state.game.loading);

  // Fetch game details on mount and keep updating every 5 seconds
  useEffect(() => {
    dispatch(fetchGameDetails());
    const interval = setInterval(() => {
      dispatch(fetchGameDetails());
    }, 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => setSettingsVisible(true)}>
        <Text style={styles.buttonText}>Settings</Text>
      </TouchableOpacity>

      {/* Settings Modal */}
      <Modal visible={settingsVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Settings</Text>

            <TouchableOpacity style={styles.option} onPress={() => setInfoVisible(true)}>
              <Text style={styles.optionText}>Game Information</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={onRefresh}>
              <Text style={styles.optionText}>Refresh</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={onShowScoreboard}>
              <Text style={styles.optionText}>Scoreboard</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={onShowLastDeal}>
              <Text style={styles.optionText}>Last Deal</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option}>
              <Text style={styles.optionText}>Help</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={() => setSettingsVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Game Information Modal */}
      <Modal visible={infoVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Game Information</Text>

            {loading ? (
              <ActivityIndicator size="large" color="#FFF" />
            ) : (
              <>
                <Text style={styles.infoText}>Time: 30 sec + Extra Time: 30 sec</Text>

                <View style={styles.table}>
                  <View style={styles.row}>
                    <Text style={styles.cell}>Game ID</Text>
                    <Text style={styles.cell}>{gameDetails.gameId}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.cell}>Game Type</Text>
                    <Text style={styles.cell}>{gameDetails.gameType}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.cell}>Number of Decks</Text>
                    <Text style={styles.cell}>{gameDetails.numDecks}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.cell}>Printed Jokers</Text>
                    <Text style={styles.cell}>{gameDetails.printedJokers}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.cell}>Entry Fee</Text>
                    <Text style={styles.cell}>{gameDetails.entryFee}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.cell}>Drop</Text>
                    <Text style={styles.cell}>{gameDetails.dropDetails}</Text>
                  </View>
                </View>
              </>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={() => setInfoVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Game Settings Popup */}
      <Modal visible={settingsVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Game Settings</Text>

            <View style={styles.settingRow}>
              <Text style={styles.settingText}>Sound</Text>
              <Switch value={soundEnabled} onValueChange={() => setSoundEnabled(!soundEnabled)} />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingText}>Vibration</Text>
              <Switch value={vibrationEnabled} onValueChange={() => setVibrationEnabled(!vibrationEnabled)} />
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={() => setSettingsVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles (Grey Theme)
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#333",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#555",
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#444",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 10,
  },
  option: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#666",
  },
  optionText: {
    fontSize: 16,
    color: "#FFF",
  },
  closeButton: {
    backgroundColor: "#777",
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  closeText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  settingText: {
    fontSize: 16,
    color: "#FFF",
  },
  table: {
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  cell: {
    color: "#FFF",
    fontSize: 14,
  },
});

export default SettingsScreen;
