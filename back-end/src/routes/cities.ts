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

// GET /cities - Get all departments with active cities
router.get("/", async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      where: {
        cities: {
          some: { profileCount: { gt: 0 } }
        }
      },
      include: {
        cities: {
          where: { profileCount: { gt: 0 } },
          orderBy: { name: "asc" },
        }
      },
      orderBy: { name: "asc" }
    });
    res.json(departments);
  } catch (error) {
    console.error("Cities API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /cities/list - Simplified list for dropdowns
router.get("/list", async (req, res) => {
  try {
    const list = await prisma.city.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
