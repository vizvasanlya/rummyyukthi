const { io } = require("socket.io-client");

const socket = io("http://localhost:5000", {
    transports: ["websocket"], // Explicitly use WebSocket transport
});

socket.on("connect", () => {
    console.log("✅ Connected to server!");

    // socket.emit("discardCard", {
    //     roomId: "2d26e11b-ad61-4774-b77e-c91d264e050e",
    //     userId: "67b18f47f63c07d9c355d5c1",
    //     deckType:"openDeck",
    //   });

    socket.emit("joinRoom", {
        gameType: "pool",
        playerLimit: 2,
        perPointValue: null,
        poolType:101,
        numberOfDeals: null,
        entryFee: 10,
        userId: "67b18f47f63c07d9c355d5c1",
        username: "king"
    });
    console.log("📤 Sent joinRoom event");
});

socket.on("disconnect", (reason) => {
    console.log("🔴 Disconnected. Reason:", reason);
});

socket.onAny((event, data) => {
    console.log(`📩 Received event: ${event}`, data);
});
