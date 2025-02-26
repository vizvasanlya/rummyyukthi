import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import { useSelector,useDispatch } from "react-redux";
import { loadSession } from "../redux/slices/authSlice";
import SplashScreen from "../screens/SplashScreen";
import Orientation from "react-native-orientation-locker";
import { StatusBar } from "react-native"; 

// Screens
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import PointsRummyScreen from "../screens/PointsRummyScreen";
import PoolRummyScreen from "../screens/PoolRummyScreen";
import DealsRummyScreen from "../screens/DealsRummyScreen";
import GameRoomScreen from "../screens/GameRoomScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import TransactionsScreen from "../screens/TransactionsScreen";

const Stack = createStackNavigator();


// Helper function to set screen orientation
const useScreenOrientation = (orientation) => {
  useFocusEffect(
    React.useCallback(() => {
      if (orientation === "PORTRAIT") {
        Orientation.lockToPortrait();
      } else if (orientation === "LANDSCAPE") {
        Orientation.lockToLandscape();
      }

      return () => {};
    }, [orientation])
  );
};

// Wrapper components for Login and Register screens (Portrait Mode)
const LoginScreenWrapper = (props) => {
  useScreenOrientation("PORTRAIT");
  return <LoginScreen {...props} />;
};

const RegisterScreenWrapper = (props) => {
  useScreenOrientation("PORTRAIT");
  return <RegisterScreen {...props} />;
};

const ResetPasswordScreenWrapper = (props) => {
  useScreenOrientation("PORTRAIT");
  return <ResetPasswordScreen {...props} />;
};

// Wrapper components for other screens (Landscape Mode)
const HomeScreenWrapper = (props) => {
  useScreenOrientation("LANDSCAPE");
  return <HomeScreen {...props} />;
};

const PointsRummyScreenWrapper = (props) => {
  useScreenOrientation("LANDSCAPE");
  return <PointsRummyScreen {...props} />;
};

const PoolRummyScreenWrapper = (props) => {
  useScreenOrientation("LANDSCAPE");
  return <PoolRummyScreen {...props} />;
};

const DealsRummyScreenWrapper = (props) => {
  useScreenOrientation("LANDSCAPE");
  return <DealsRummyScreen {...props} />;
};

const GameRoomScreenWrapper = (props) => {
  useScreenOrientation("LANDSCAPE");
  return <GameRoomScreen {...props} />;
};

const TransactionsScreenWrapper = (props) => {
  useScreenOrientation("LANDSCAPE");
  return <TransactionsScreen {...props} />;
};



export default function AppNavigator() {
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const restoreSession = async () => {
      await dispatch(loadSession()); // Load user from AsyncStorage
    };
  
    const timer = setTimeout(() => {
      restoreSession();
      setIsLoading(false);
    }, 1000); // Simulated delay for smoother transition
  
    return () => clearTimeout(timer);
  }, [dispatch]);
  
  if (isLoading) {
    return <SplashScreen />; // Show SplashScreen while loading session
  }
  

return (
    <>
      <StatusBar hidden={true} /> {/* This will hide the status bar */}
      <NavigationContainer>
        <Stack.Navigator>
          {isLoading ? (
            <Stack.Screen
              name="Splash"
              component={SplashScreen}
              options={{ headerShown: false }}
            />
          ) : user ? (
            // Authenticated Screens (Landscape Mode)
            <>
              <Stack.Screen
                name="HomeScreen"
                component={HomeScreenWrapper}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="PointsRummy"
                component={PointsRummyScreenWrapper}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="PoolRummy"
                component={PoolRummyScreenWrapper}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="DealsRummy"
                component={DealsRummyScreenWrapper}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="GameRoom"
                component={GameRoomScreenWrapper}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Transactions"
                component={TransactionsScreenWrapper}
                options={{ headerShown: false }}
              />
            </>
          ) : (
            // Unauthenticated Screens (Portrait Mode)
            <>
              <Stack.Screen
                name="Login"
                component={LoginScreenWrapper}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Register"
                component={RegisterScreenWrapper}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ResetPassword"
                component={ResetPasswordScreenWrapper}
                options={{ headerShown: false }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

