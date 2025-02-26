import React from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import LottieView from "lottie-react-native";

const WinnerPopup = ({ visible, winnerName, onClose }) => {
  return (
    <Modal transparent={true} visible={visible} animationType="slide">
      <View style={styles.container}>
        <LottieView source={require("../assets/winner.json")} autoPlay loop={false} style={styles.animation} />
        <Text style={styles.winnerText}>🎉 {winnerName} Wins! 🎉</Text>
        <Text style={styles.button} onPress={onClose}>Close</Text>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.7)" },
  animation: { width: 200, height: 200 },
  winnerText: { fontSize: 22, color: "#FFF", fontWeight: "bold", marginTop: 10 },
  button: { marginTop: 20, padding: 10, backgroundColor: "#FFF", borderRadius: 5, fontWeight: "bold" },
});

export default WinnerPopup;
