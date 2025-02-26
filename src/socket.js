import io from "socket.io-client";

const SOCKET_URL = "http://13.50.16.71:5000"; // Change if needed
const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true,
  reconnection: true,
});

console.log("🔌 Connecting to Socket.IO server...");

// -------------------- 💡 CONNECTION EVENTS --------------------
socket.on("connect", () => {
  console.log("✅ Socket connected! ID:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Socket disconnected! Reason:", reason);
});

// -------------------- 🎮 ROOM & GAME EVENTS --------------------

// ➤ **Join Room (Emit)**
export const joinRoom = (gameConfig, callback) => {
  console.log("🚀 Sending Socket Event: joinRoom", gameConfig);
  socket.emit("joinRoom", gameConfig, (response) => {
    if (response.error) {
      console.error("❌ Room Join Error:", response.error);
      alert(response.error.message || "Failed to join the game room.");
    } else {
      console.log("✅ Room Joined:", response);
      callback(response); // Pass data back to UI
    }
  });
};

// -------------------- ⏳ TIMER EVENTS --------------------

// ➤ **Auto Discard on Timeout**
socket.on("autoDiscard", (data) => {
  console.log(`⏳ Auto Discard Triggered in Room ${data.roomId}:`, data);
  dispatch(updateGameState(data));
});



// -------------------- 🔄 NEXT ROUND --------------------

// ➤ **Receive Next Round Event**
socket.on("nextRound", (data) => {
  console.log(`🔄 Next Round Starting in Room ${data.roomId}!`, data);
  dispatch(updateGameState(data));
});

// -------------------- 📤 EXPORT SOCKET INSTANCE --------------------
export default socket;
