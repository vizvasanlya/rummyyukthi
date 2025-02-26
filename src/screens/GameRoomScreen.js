import React, { useEffect, useState } from "react";
import { View, Alert, StyleSheet,Modal,Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import socket from "../socket";
import { useAppSelector } from "../redux/hooks";
import TopBar from "../components/TopBar";
import PlayersContainer from "../components/PlayersContainer";
import PlayerHand from "../components/PlayerHand";
import ActionButtons from "../components/ActionButtons";
import DeckArea from "../components/DeckArea";
import GameScoreboard from "../components/GameScoreboard";

const GameRoomScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { gameType, playerLimit, entryFee, roomId } = route.params;
  
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [playerHand, setPlayerHand] = useState([]);
  const [wildJoker, setWildJoker] = useState(null);
  const [openDeck, setOpenDeck] = useState(null);
  const [closedDeck, setClosedDeckCards] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [exitCountdown, setExitCountdown] = useState(30);
  const [gameResults, setGameResults] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]);
  const [hasDrawn, setHasDrawn] = useState(false); 

  const user = useAppSelector((state) => state.auth.user);
  const walletBalance = useAppSelector((state) => state.auth.balance || 0);

  const isPlayerTurn = currentTurnPlayerId === user?.id;

  // Handle socket connection and reconnection
  useEffect(() => {
    if (!socket || !user) return;
  
    // 🛡️ Entry Fee Validation
    if (walletBalance < entryFee) {
      Alert.alert("Insufficient Balance", "You do not have enough balance to join this game.");
      navigation.navigate("HomeScreen");
      return;
    }
  
    if (isPlayerTurn) {
      setHasDrawn(false);
    }
  
    // 🔄 Handle Reconnection Logic
    const handleReconnect = () => {
      if (!socket || socket.connected) return; // ✅ Prevent duplicate reconnections
      console.log("🔄 Attempting to reconnect...");
      setReconnecting(true);
      socket.emit("rejoinGame", { roomId, userId: user.id });
    };
  
    const handleReconnectSuccess = (data) => {
      console.log("✅ Rejoined game successfully", data);
      setPlayers(data.players || []);
      setPlayerHand(data.hand || []);
      setCurrentTurnPlayerId(data.currentTurn);
      setOpenDeck(data.openDeck);
      setClosedDeckCards(data.closedDeck);
      setWildJoker(data.wildJoker);
      setCountdown(data.countdown);
      setReconnecting(false);
    };
  
    const handleReconnectFailed = () => {
      console.log("❌ Reconnection failed");
      Alert.alert("Reconnection Failed", "Could not rejoin the game. Returning to Home.");
      navigation.navigate("HomeScreen");
    };
  
    const handleDisconnect = () => {
      console.log("⚠️ Disconnected from server");
      Alert.alert("Connection Lost", "Trying to reconnect...");
      setReconnecting(true);
      setTimeout(() => {
        if (!socket.connected) {
          handleReconnect();
        }
      }, 3000);
    };
  
    // 🔄 Game Event Handlers
    const handlePlayersUpdate = (data) => setPlayers(data.players || []);
    const handleGameCountdown = (data) => setCountdown(data.countdown);
    const handleCardsDealt = ({ players }) => {
      const player = players.find((p) => p.userId === user.id);
      if (player) setPlayerHand(player.hand);
    };
    const handleDeckSetup = ({ wildJoker, openDeck, closedDeck }) => {
      console.log("🃏 Wild Joker:", wildJoker);
      console.log("📤 Open Deck:", openDeck);
      console.log("📦 Closed Deck:", closedDeck);
    
      setWildJoker(wildJoker);
      setOpenDeck(openDeck ? [openDeck] : []);
      setClosedDeckCards(closedDeck);
    };
    
    const handleTurnChanged = ({ currentTurn }) => setCurrentTurnPlayerId(currentTurn);
    const handleCardDrawn = ({ userId, drawnCard, deckType }) => {
      console.log("📡 [FRONTEND] Received cardDrawn event:", { userId, drawnCard, deckType });
    
      if (userId === user.id) {
        setPlayerHand((prev) => {
          console.log("🃏 [DEBUG] Previous Player Hand:", prev);
          const newHand = [...prev, drawnCard];
          console.log("🃏 [DEBUG] Updated Player Hand:", newHand);
          return newHand;
        });
        setHasDrawn(true);
      }
      if (deckType === "closed") {
        setClosedDeckCards((prev) => prev?.slice(1)); 
      }
      if (deckType === "open") {
        setOpenDeck(null); 
      }
    };
    
    const handleCardDiscarded = ({ discardedCard }) => {
      console.log("📤 Card Discarded by Another Player:", discardedCard);
  
      setOpenDeck((prev) => {
          const updatedDeck = Array.isArray(prev) ? [...prev, discardedCard] : [discardedCard];
          console.log("🔄 Updated Open Deck:", updatedDeck);
          return updatedDeck;
      });
  };
  
  const handlePlayerDropped = ({ userId }) => {
    console.log("🚨 Player Dropped:", userId);

    setPlayers((prev) => {
        const updatedPlayers = prev.map((p) => 
            p.userId === userId ? { ...p, hand: "FACEDOWN" } : p
        );
        console.log("🔄 Updated Players List:", updatedPlayers);
        return updatedPlayers;
    });
};
  
    const handleGameOver = ({ winner, results }) => {
      console.log("🏆 GAME OVER EVENT RECEIVED!");
  
      // ✅ Ensure event is for the correct room
      if (!gameRoom || gameRoom.roomId !== currentRoomId) {
          console.log(`⚠️ Ignoring gameOver event for room: ${gameRoom?.roomId}`);
          return;
      }
  
      console.log("Winner ID:", winner);
      console.log("Final Player Results:", results);
  
      setGameResults({ winner, results });
      setGameEnded(true);
  
      // ✅ Start countdown for exiting the game
      let timer = 30;
      console.log("⏳ Starting Exit Countdown:", timer);
  
      const countdownInterval = setInterval(() => {
          timer -= 1;
          setExitCountdown(timer);
          console.log(`⏳ Exiting in: ${timer} seconds`);
  
          if (timer === 0) {
              clearInterval(countdownInterval);
              console.log("🚪 Exit Countdown Over. Leaving Game...");
              handleExitGame();
          }
      }, 1000);
    };
  
    // 🟢 Register Socket Events
    socket.on("playersUpdate", handlePlayersUpdate);
    socket.on("gameCountdown", handleGameCountdown);
    socket.on("cardsDealt", handleCardsDealt);
    socket.on("deckSetup", handleDeckSetup);
    socket.on("turnChanged", handleTurnChanged);
    socket.on("cardDrawn", handleCardDrawn);
    socket.on("cardDiscarded", handleCardDiscarded);
    socket.on("playerDropped", handlePlayerDropped);
    socket.on("gameOver", handleGameOver);
    socket.on("disconnect", handleDisconnect);
    socket.on("reconnect", handleReconnect);
    socket.on("rejoinSuccess", handleReconnectSuccess);
    socket.on("rejoinFailed", handleReconnectFailed);
  
    return () => {
      if (!socket) return; // ✅ Ensure socket exists before calling `off()`
  
      socket.off("playersUpdate", handlePlayersUpdate);
      socket.off("gameCountdown", handleGameCountdown);
      socket.off("cardsDealt", handleCardsDealt);
      socket.off("deckSetup", handleDeckSetup);
      socket.off("turnChanged", handleTurnChanged);
      socket.off("cardDrawn", handleCardDrawn);
      socket.off("cardDiscarded", handleCardDiscarded);
      socket.off("playerDropped", handlePlayerDropped);
      socket.off("gameOver", handleGameOver);
      socket.off("disconnect", handleDisconnect);
      socket.off("reconnect", handleReconnect);
      socket.off("rejoinSuccess", handleReconnectSuccess);
      socket.off("rejoinFailed", handleReconnectFailed);
    };
  }, [user, roomId, walletBalance, isPlayerTurn]);
  

  // Game actions
  const handleDropGame = () => socket.emit("dropGame", { roomId, userId: user.id });
  const handleDiscardCard = () => {
    if (!selectedCard) {
        console.warn("⚠️ No card selected for discard.");
        return;
    }
    console.log("📤 Discarding Card:", selectedCard);
    
    socket.emit("discardCard", { roomId, userId: user.id, discardedCard: selectedCard });

    setPlayerHand((prev) => {
        console.log("🃏 Before Discard:", prev);

        const updatedHand = prev.filter((card) => {
            return card.suit !== selectedCard.suit || card.rank !== selectedCard.rank; // Use suit & rank instead of id
        });

        console.log("🃏 After Discard:", updatedHand);
        return updatedHand;
    });

    setSelectedCard(null);
};

  // 🃏 **Update selected cards when changed in PlayerHand**
  const handleSelectionChange = (newSelection) => {
    setSelectedCards(newSelection);
  };

  const handleDeclareHand = () => {
    if (playerHand.length === 0) {
      console.warn("No cards in hand to declare.");
      return;
    }
  
    console.log("Declaring hand:", playerHand);
    socket.emit("declareHand", { roomId, userId: user.id, hand: playerHand });
  };
  
  const handleLeaveRoom = () => {
    socket.emit("leaveRoom", { userId: user.id });
    navigation.navigate("HomeScreen");
  };
  const handleDeckSelection = (deckType) => socket.emit("drawCard", { userId: user.id, roomId, deckType: deckType });

  const handleExitGame = () => {
    socket.emit("leaveRoom", { userId: user.id });
    navigation.navigate("HomeScreen");
  };

  return (
    <View style={styles.container}>
      <TopBar 
        walletBalance={walletBalance} 
        gameType={gameType} 
        playerLimit={playerLimit} 
        entryFee={entryFee} 
        handleLeaveRoom={handleLeaveRoom} 
      />
  
      <PlayersContainer players={players} playerLimit={playerLimit} user={user} currentTurnPlayerId={currentTurnPlayerId} />
  
      <DeckArea 
        wildJoker={wildJoker} 
        openDeck={openDeck} 
        closedDeck={closedDeck} 
        onDeckSelection={handleDeckSelection} 
        countdown={countdown} 
        players={players} 
        playerLimit={playerLimit}
      />
  
      {/* Scoreboard Modal */}
    {gameEnded && gameResults && (
      <Modal visible={true} transparent={true} animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>🏆 Game Over!</Text>
            <GameScoreboard players={gameResults.players || []} gameType={gameType} />
            <Text style={styles.exitText}>Exiting in {exitCountdown} seconds...</Text>
          </View>
        </View>
      </Modal>
    )}
      {/* Show Player Hand and Action Buttons if the game is active */}
      {(countdown === null || countdown === 0) && playerHand.length > 0 && (
        <>
          <PlayerHand 
            playerHand={playerHand} 
            setPlayerHand={setPlayerHand} 
            onSelectionChange={handleSelectionChange} 
            onCardSelect={setSelectedCard} 
            selectedCard={selectedCard} 
          />
<ActionButtons 
  onDrop={handleDropGame} 
  onDiscard={handleDiscardCard} 
  onDeclare={handleDeclareHand} 
  isPlayerTurn={isPlayerTurn} 
  hasDrawn={hasDrawn} 
  selectedCards={selectedCards}
/>
        </>
      )}
    </View>
  );
};

export default GameRoomScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1E1E1E", justifyContent: "center", alignItems: "center" },
  modalBackground: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.6)" },
  modalContainer: { width: "90%", backgroundColor: "#FFF", padding: 20, borderRadius: 10, alignItems: "center" },
  exitText: { marginTop: 10, fontSize: 16, fontWeight: "bold", color: "red" },
});
