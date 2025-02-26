const Redis = require("ioredis");

// Create a Redis client
const redis = new Redis({
  host: "127.0.0.1",  // Change if Redis is on another server
  port: 6379,         // Default Redis port
});

// Event listeners for debugging
redis.on("connect", () => console.log("✅ Connected to Redis"));
redis.on("error", (err) => console.error("❌ Redis Error:", err));

module.exports = redis;
