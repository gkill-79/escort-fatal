import express from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

// GET /cities/popular
router.get("/popular", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 12;
    const list = await prisma.city.findMany({
      where: { isPopular: true },
      take: limit,
      orderBy: { profileCount: "desc" },
    });
    res.json(list);
  } catch (error) {
    console.error("Cities API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
