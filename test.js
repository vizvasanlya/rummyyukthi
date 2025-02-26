const redisClient = require("./src/config/redisClient");

(async () => {
  try {
    await redisClient.set("testKey", "Hello, Redis!");
    const value = await redisClient.get("testKey");
    console.log("✅ Redis test successful. Value:", value); // Should log: Hello, Redis!
  } catch (err) {
    console.error("❌ Redis Test Failed:", err);
  }
})();
