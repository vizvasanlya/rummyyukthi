import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { TextInput, Button, Text, ActivityIndicator } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, fetchWalletBalance } from "../../redux/slices/authSlice";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const { loading, user, error, balance, balanceLoading } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (user) {
      console.log("LoginScreen - user:", user);
      dispatch(fetchWalletBalance()); 

      navigation.reset({
        index: 0,
        routes: [{ name: "HomeScreen" }], // Reset navigation stack
      });
    }
  }, [user, navigation, dispatch]);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in both email and password");
      return;
    }

    dispatch(loginUser({ email, password }))
      .unwrap()
      .then(() => {
        dispatch(fetchWalletBalance());
        Alert.alert("Success", "Logged in successfully!");
      })
      .catch((errorMessage) => {
        Alert.alert("Error", errorMessage || "Invalid login credentials");
      });
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <Text style={styles.title}>RummyYuktiX</Text>

      <TextInput
        label="Email"
        mode="outlined"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />

      <TextInput
        label="Password"
        mode="outlined"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity onPress={() => navigation.navigate("ResetPassword")}>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Login
      </Button>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerLink}>
          Not registered? <Text style={styles.registerText}>Register Now</Text>
        </Text>
      </TouchableOpacity>

      {/* Display the wallet balance or a loading spinner */}
      {user && (
        <View style={styles.balanceContainer}>
          {balanceLoading ? (
            <ActivityIndicator size="small" color="#007BFF" />
          ) : (
            <Text style={styles.balanceText}>Wallet Balance: ₹{balance}</Text>
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#1E1E1E",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  input: {
    marginBottom: 15,
  },
  forgotPassword: {
    color: "#007BFF",
    textAlign: "right",
    marginBottom: 20,
  },
  button: {
    marginBottom: 10,
    backgroundColor: "#007BFF",
  },
  registerLink: {
    textAlign: "center",
    marginTop: 10,
  },
  registerText: {
    color: "#007BFF",
    fontWeight: "bold",
  },
  balanceContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  balanceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#28a745",
  },
});
