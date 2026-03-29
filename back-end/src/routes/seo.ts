import { Router } from "express";
import { prisma } from "../lib/prisma";
const router = Router();

// /seo/active-cities
router.get("/active-cities", async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      where: {
        profiles: { some: { status: "APPROVED" } }
      },
      select: { slug: true }
    });
    res.json(cities.map(c => c.slug));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// /seo/active-categories
router.get("/active-categories", async (req, res) => {
  try {
    // In PostgreSQL, categories is an array of strings in Profile. 
    // We can extract unique or just return hardcoded available services for sitemap gen.
    // For now we'll return all enum values from ServiceType equivalent or just the most searched ones.
    const categories = ["bdsm", "gfe", "massage", "webcam"];
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// /seo/profiles-slugs
router.get("/profiles-slugs", async (req, res) => {
  try {
    const profiles = await prisma.profile.findMany({
      where: { status: "APPROVED" },
      select: { slug: true, updatedAt: true }
    });
    res.json(profiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// /seo/search?city=x&category=y
router.get("/search", async (req, res) => {
  try {
    const { city, category } = req.query;

    if (!city || !category) {
      return res.status(400).json({ error: "City and category required" });
    }

    const profiles = await prisma.profile.findMany({
      where: {
        status: "APPROVED",
        isActive: true,
        city: { slug: String(city).toLowerCase() },
        categories: { has: String(category).toUpperCase() } // matching enum or string arrays
      },
      include: {
        city: true,
        photos: {
          where: { isPrimary: true },
          take: 1
        }
      },
      take: 20
    });

    res.json(profiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
