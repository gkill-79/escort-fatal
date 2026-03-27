import express from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

// GET /media - Get public photos or videos
router.get("/", async (req, res) => {
  try {
    const { type, sort } = req.query;
    const isVideo = type === "videos";
    const isTop = sort === "top";

    if (isVideo) {
      const videos = await prisma.profileVideo.findMany({
        where: { 
          isApproved: true, 
          profile: { isActive: true, isApproved: true } 
        },
        orderBy: { createdAt: "desc" },
        take: 40,
        include: {
          profile: { select: { slug: true, name: true, isTopGirl: true } }
        }
      });
      return res.json(videos);
    } else {
      const photos = await prisma.profilePhoto.findMany({
        where: { 
          isApproved: true, 
          profile: { isActive: true, isApproved: true } 
        },
        orderBy: isTop ? { ratingAvg: "desc" } : { createdAt: "desc" },
        take: 60,
        include: {
          profile: { select: { slug: true, name: true, isTopGirl: true } }
        }
      });
      return res.json(photos);
    }
  } catch (error) {
    console.error("Media API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
