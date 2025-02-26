const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:5000/socket.io/?EIO=4&transport=websocket");

ws.on("open", () => {
    console.log("✅ Connected!");
    ws.send("42[\"joinRoom\", { \"gameType\": \"pool\", \"playerLimit\": 2, \"entryFee\": 1000, \"userId\": \"67b18efcf63c07d9c355d5be\" }]");
});

ws.on("message", (data) => {
    console.log("📩 Message from server:", data.toString());
});

ws.on("close", (code, reason) => {
    console.log(`🔴 Disconnected (code: ${code}, reason: ${reason})`);
});

ws.on("error", (err) => {
    console.error("❌ WebSocket error:", err);
});
