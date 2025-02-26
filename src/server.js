const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const socketSetup = require("./socket");
const redis = require("./config/redisClient");  // Import Redis client

const authRoutes = require("./routes/authRoutes");
const scoreRoutes = require("./routes/scoreRoutes");
const walletRoutes = require("./routes/wallet.routes");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/score", scoreRoutes);
app.use("/api/wallet", walletRoutes);

app.get("/", (req, res) => {
  res.send("Server is running!");
});


// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Test Redis connection
redis.set("testKey", "Hello Redis!");
redis.get("testKey").then((value) => {
  console.log("🔍 Redis Test Value:", value);  // Should print: Hello Redis!
});

// Initialize Socket.IO
const io = socketSetup(server, redis);  // Pass Redis to socket setup

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT,"0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
