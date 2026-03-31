import express from "express";
import { redis } from "../lib/redis";
import { prisma } from "../lib/prisma";
import { verifyJwt } from "../middleware/auth.middleware";

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

/**
 * POST /v2/online/toggle
 * Toggles the 'isOnline' field for the profile associated with the authenticated user.
 */
router.post("/toggle", verifyJwt, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { isOnline } = req.body;

    if (typeof isOnline !== "boolean") {
      return res.status(400).json({ message: "Le statut isOnline est requis (booléen)." });
    }

    const profile = await prisma.profile.update({
      where: { userId },
      data: { 
        isOnline,
        lastOnlineAt: isOnline ? new Date() : undefined
      },
    });

    res.json({ 
      success: true, 
      isOnline: profile.isOnline 
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut en ligne:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
