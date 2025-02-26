import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from "react-native";
import Svg, { Circle } from "react-native-svg";

const CIRCLE_RADIUS = 40;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
const SCREEN_WIDTH = Dimensions.get("window").width;

const PlayersContainer = ({ players, playerLimit, user, currentTurnPlayerId }) => {
  const [remainingTime, setRemainingTime] = useState(30);
  const [isExtraTime, setIsExtraTime] = useState(false);
  const [extraTimeUsed, setExtraTimeUsed] = useState(false);
  const animatedProgress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!currentTurnPlayerId || !players) return;

    setRemainingTime(30);
    setIsExtraTime(false);
    setExtraTimeUsed(false);
    animatedProgress.setValue(1);
    animatedProgress.stopAnimation();

    Animated.timing(animatedProgress, {
      toValue: 0,
      duration: 30000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    const timerInterval = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime === 1 && !extraTimeUsed) {
          setExtraTimeUsed(true);
          setIsExtraTime(true);
          animatedProgress.setValue(1);
          Animated.timing(animatedProgress, {
            toValue: 0,
            duration: 30000,
            easing: Easing.linear,
            useNativeDriver: false,
          }).start();
          return 30;
        } else if (prevTime === 1 && extraTimeUsed) {
          clearInterval(timerInterval);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerInterval);
      animatedProgress.stopAnimation();
    };
  }, [currentTurnPlayerId, players]);

  /** 🛠 Ensure logged-in user is **always** in slot 0 **/
  let myPlayerSlot = players.find((p) => String(p.userId) === String(user.id));
  let otherPlayers = players.filter((p) => String(p.userId) !== String(user.id));
  let filledPlayers = new Array(playerLimit).fill(null);
  filledPlayers[0] = myPlayerSlot || { username: user.username, userId: user.id };
  let index = 1;
  otherPlayers.forEach((player) => {
    if (!filledPlayers.includes(player) && index < playerLimit) {
      filledPlayers[index] = player;
      index++;
    }
  });

  /** Define player positions **/
  const positions =
    playerLimit === 2
      ? [
          { bottom: 20, left: "50%", marginLeft: -40 }, // My player (always at bottom)
          { top: 40, left: "50%", marginLeft: -40 }, // Opponent
        ]
      : [
          { bottom: 20, left: "50%", marginLeft: -40 }, 
          { top: 40, left: SCREEN_WIDTH * 0.5 - 10 },
          { top: 120, left: SCREEN_WIDTH * 0.1 +10 },
          { top: 120, right: SCREEN_WIDTH * 0.1+10 },
          { top: 45, right: SCREEN_WIDTH * 0.75 -60},
          { top: 45, left: SCREEN_WIDTH * 0.75-60 },
        ];

  return (
    <>
      {positions.map((position, index) => {
        const player = filledPlayers[index] || null;
        const isCurrentTurn = player?.userId === currentTurnPlayerId;
        const timerColor = isCurrentTurn ? (isExtraTime ? "red" : "green") : "grey";

        return (
          <View key={index} style={[styles.playerContainer, position]}>
            <View style={styles.playerInfo}>
              <View
                style={[
                  styles.playerSlot,
                  { backgroundColor: player ? "grey" : "rgba(255,255,255,0.2)" },
                ]}
              >
                <Text style={[styles.playerText, { color: player ? "white" : "grey" }]}>
                  {player ? player.username : "Waiting..."}
                </Text>
              </View>
              <Text style={[styles.timerText, { color: timerColor }]}>
                {isCurrentTurn ? `${remainingTime}s` : ""}
              </Text>
            </View>

            {/* Timer Ring */}
            <View style={styles.timerRing}>
              <Svg height="90" width="90" viewBox="0 0 100 100">
                <Circle cx="50" cy="50" r={CIRCLE_RADIUS} stroke="grey" strokeWidth="8" fill="none" />
                <AnimatedCircle
                  cx="50"
                  cy="50"
                  r={CIRCLE_RADIUS}
                  stroke={timerColor}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={CIRCLE_CIRCUMFERENCE}
                  strokeDashoffset={
                    isCurrentTurn
                      ? animatedProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [CIRCLE_CIRCUMFERENCE, 0],
                        })
                      : CIRCLE_CIRCUMFERENCE
                  }
                  strokeLinecap="round"
                />
              </Svg>
            </View>
          </View>
        );
      })}
    </>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Styles **/
const styles = StyleSheet.create({
  playerContainer: {
    position: "absolute",
    alignItems: "center",
  },
  playerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  playerSlot: {
    width: 70,
    height: 70,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2C2C2C",
  },
  playerText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FFFFFF",
  },
  timerRing: {
    position: "absolute",
    top: -10,
    left: -10,
  },
  timerText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default PlayersContainer;
