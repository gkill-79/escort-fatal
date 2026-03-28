import express from "express";
import { redis } from "../lib/redis";

const router = express.Router();

/**
 * GET /v2/online/count
 * Returns the number of active users in the last 2 minutes based on Redis heartbeats.
 * This is extremely fast (O(1) with Redis Sorted Sets).
 */
router.get("/count", async (req, res) => {
  try {
    const now = Date.now();
    const threshold = now - 120000; // 2 minutes ago
    
    // ZCOUNT online_users <threshold> <infinity>
    const count = await redis.zcount("online_users", threshold, "+inf");
    
    return res.json({ 
      count,
      timestamp: now 
    });
  } catch (error) {
    console.error("Error fetching online count from Redis:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
