import express from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

/**
 * GET /v2/media/top-photos
 * Returns the top 100 photos based on the Algorithmic Hot Score (Time-Decay).
 * Fresh and engaging content is prioritized over old popular content.
 */
router.get("/top-photos", async (req, res) => {
  try {
    const topPhotos = await prisma.mediaAsset.findMany({
      where: { 
        fileType: 'IMAGE', 
        status: 'COMPLETED',
        profile: {
            isActive: true,
            isApproved: true
        }
      },
      orderBy: { 
        hotScore: 'desc' 
      },
      take: 100,
      include: {
        profile: {
          select: {
            id: true,
            slug: true,
            name: true,
            isTopGirl: true,
            boostScore: true,
            city: {
                select: { name: true }
            }
          }
        }
      }
    });

    res.json(topPhotos);
  } catch (error) {
    console.error("Top Photos API Error:", error);
    res.status(500).json({ message: "Erreur lors de la récupération du Top 100." });
  }
});

/**
 * POST /v2/media/:id/vote
 * Allows users to upvote/downvote media (affects Hot Score calculation in background).
 */
router.post("/:id/vote", async (req, res) => {
    try {
        const { id } = req.params;
        const { direction } = req.body; // 'up' or 'down'

        if (!['up', 'down'].includes(direction)) {
            return res.status(400).json({ message: "Direction de vote invalide." });
        }

        const updatedMedia = await prisma.mediaAsset.update({
            where: { id },
            data: {
                upvotes: direction === 'up' ? { increment: 1 } : undefined,
                downvotes: direction === 'down' ? { increment: 1 } : undefined,
            }
        });

        res.json({ message: "Vote enregistré.", upvotes: updatedMedia.upvotes });
    } catch (error) {
        console.error("Vote API Error:", error);
        res.status(500).json({ message: "Erreur lors du vote." });
    }
});

export default router;
