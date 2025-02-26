import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode"; 
import { loginUser } from "../redux/slices/authSlice";

const SplashScreen = ({ navigation }) => {  // Receive navigation as a prop
  const dispatch = useDispatch();

  useEffect(() => {
    const checkSession = async () => {
      const userData = await AsyncStorage.getItem("user");

      if (userData) {
        try {
          const { user, token } = JSON.parse(userData);
          const decodedToken = jwtDecode(token);

          // Check if the token is expired
          if (decodedToken.exp * 1000 > Date.now()) {
            dispatch(loginUser.fulfilled({ user, token }));
            navigation.replace("HomeScreen");
          } else {
            await AsyncStorage.removeItem("user");
            navigation.replace("Login");
          }
        } catch (error) {
          console.error("Invalid token", error);
          await AsyncStorage.removeItem("user");
          navigation.replace("Login");
        }
      } else {
        navigation.replace("Login"); // No user data, go to login
      }
    };

    checkSession();
  }, [dispatch, navigation]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
};

export default SplashScreen;
