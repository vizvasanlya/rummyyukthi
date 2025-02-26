import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { useAppSelector } from "../redux/hooks";
import { useDispatch } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { fetchWalletBalance, logout } from "../redux/slices/authSlice";

export default function HomeScreen({ navigation }) {
  const user = useAppSelector((state) => state.auth.user);
  const walletBalance = useAppSelector((state) => state.auth.balance || 0);
  const dispatch = useDispatch();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current; // Off-screen left

  // Fetch wallet balance every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchWalletBalance());
    }, 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Open Sidebar (Slide In)
  const openMenu = () => {
    setIsMenuOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0, // Fully visible
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Close Sidebar (Slide Out)
  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -300, // Off-screen left
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsMenuOpen(false));
  };

  // Logout Handler
  const handleLogout = () => {
    closeMenu(); // Close the menu
    dispatch(logout()); // Dispatch logout correctly
    navigation.replace("LoginScreen"); // Navigate to Login
  };

  return (
    <View style={styles.container}>
      {/* Wallet Balance */}
      <View style={styles.walletContainer}>
        <Text style={styles.balanceText}>₹{walletBalance}</Text>
        <TouchableOpacity style={styles.addCashButton}onPress={() => navigation.navigate("Deposit")}>
          <Text style={styles.addCashText}>Add Cash</Text>
        </TouchableOpacity>
      </View>

      {/* Notification Icon */}
      <TouchableOpacity
        style={styles.notificationIcon}
        onPress={() => navigation.navigate("Notifications")}
      >
        <Icon name="bell-outline" size={24} color="#000" />
      </TouchableOpacity>

      {/* Hamburger Menu */}
      <TouchableOpacity style={styles.menuIcon} onPress={openMenu}>
        <Icon name="menu" size={28} color="#000" />
      </TouchableOpacity>

      {/* Full-Screen Overlay when Menu is Open */}
      {isMenuOpen && (
        <View style={styles.overlay}>
          {/* Tapping outside closes the menu */}
          <TouchableOpacity style={styles.overlayTouchable} onPress={closeMenu} />

          {/* Animated Sidebar */}
          <Animated.View style={[styles.menu, { transform: [{ translateX: slideAnim }] }]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Account")}>
              <Text style={styles.menuItemText}>Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Withdraw")}>
              <Text style={styles.menuItemText}>Withdraw</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Transactions")}>
              <Text style={styles.menuItemText}>Transactions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Support")}>
              <Text style={styles.menuItemText}>Help & FAQ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Text style={[styles.menuItemText, { color: "red" }]}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* Game Mode Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.modeButton} onPress={() => navigation.navigate("PointsRummy")}>
          <Text style={styles.buttonText}>Points Rummy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modeButton} onPress={() => navigation.navigate("PoolRummy")}>
          <Text style={styles.buttonText}>Pool Rummy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modeButton} onPress={() => navigation.navigate("DealsRummy")}>
          <Text style={styles.buttonText}>Deals Rummy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modeButton} onPress={() => navigation.navigate("Tournament")}>
          <Text style={styles.buttonText}>Tournament</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modeButton} onPress={() => navigation.navigate("Practice")}>
          <Text style={styles.buttonText}>Practice</Text>
        </TouchableOpacity>
      </View>
      {/* My Matches Button */}
      <TouchableOpacity style={styles.myMatchesButton} onPress={() => navigation.navigate("MyMatchesScreen")}>
        <Text style={styles.myMatchesText}>My Matches</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E", // Primary dark grey background
    paddingHorizontal: 20,
  },
  walletContainer: {
    position: "absolute",
    top: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  balanceText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF", // White text for contrast
    marginRight: 10,
  },
  addCashButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)", // Semi-transparent
    backdropFilter: "blur(10px)", // Glass effect
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)", // Soft border
  },
  addCashText: {
    color: "#E0E0E0",// Gold text for visibility
    fontSize: 14,
    fontWeight: "bold",
  },
  
  notificationIcon: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  menuIcon: {
    position: "absolute",
    top: 20,
    left: 20,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Semi-transparent black for overlay
    flexDirection: "row",
  },
  overlayTouchable: {
    flex: 1, // Full-screen transparent area to close the menu
  },
  menu: {
    width: 300,
    height: "100%",
    backgroundColor: "#2C2C2C", // Secondary grey for side menu
    paddingTop: 50,
    paddingHorizontal: 20,
    position: "absolute",
    left: 0, 
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A3A", // Soft grey divider
  },
  menuItemText: {
    fontSize: 16,
    color: "#E0E0E0", // Muted white for text
  },
  buttonContainer: {
    left: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 180,
  },
  modeButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 20,
    borderRadius: 8,
    backgroundColor: "#3A3A3A", // Slightly lighter grey for buttons
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF", // White text for visibility
    fontSize: 16,
    fontWeight: "bold",
  },
  myMatchesButton: {
    marginTop: 120,
    right:-400,
    alignSelf: "center",
    backgroundColor: "#3A3A3A",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  myMatchesText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
