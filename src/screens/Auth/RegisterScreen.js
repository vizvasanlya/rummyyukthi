import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../redux/slices/authSlice";

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mounted, setMounted] = useState(true);

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    return () => {
      setMounted(false); // Cleanup function to set mounted to false
    };
  }, []);

  const handleRegister = () => {
    if (!username || !email || !password || !confirmPassword) {
      if (mounted) Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      if (mounted) Alert.alert("Error", "Passwords do not match");
      return;
    }

    dispatch(registerUser({ username, email, password }))
      .unwrap()
      .then(() => {
        if (mounted) {
          Alert.alert("Success", "Registered successfully!");
          navigation.navigate("Login");
        }
      })
      .catch((error) => {
        if (mounted) Alert.alert("Error", error || "Registration failed");
      });
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>

      <TextInput
        label="Username"
        mode="outlined"
        value={username}
        onChangeText={(text) => setUsername(text)}
        style={styles.input}
      />

      <TextInput
        label="Email"
        mode="outlined"
        value={email}
        onChangeText={(text) => setEmail(text)}
        style={styles.input}
        keyboardType="email-address"
      />

      <TextInput
        label="Password"
        mode="outlined"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
        style={styles.input}
      />

      <TextInput
        label="Confirm Password"
        mode="outlined"
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
        secureTextEntry
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleRegister}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Register
      </Button>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginLink}>
          Already have an account? <Text style={styles.loginText}>Login</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

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
  button: {
    marginBottom: 10,
    backgroundColor: "#007BFF",
  },
  loginLink: {
    textAlign: "center",
    marginTop: 10,
  },
  loginText: {
    color: "#007BFF",
    fontWeight: "bold",
  },
});