import express from "express";
import { prisma } from "../lib/prisma";
import { Queue } from 'bullmq';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// 1. Setup BullMQ Queue (Connection to same Redis)
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};
const mediaQueue = new Queue('media-processing-queue', { connection });

// 2. Multer storage config (/tmp for anonymization)
const uploadDir = path.join(__dirname, '../../tmp/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});

const upload = multer({ storage: storage });

// POST /media/upload - Asynchronous processing
router.post("/upload", upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { profileId } = req.body;

    if (!file || !profileId) {
      return res.status(400).json({ message: "Fichier ou profileId manquant." });
    }

    const fileType = file.mimetype.includes('video') ? 'VIDEO' : 'IMAGE';

    // 3. Create initial entry in DB (PROCESSING status)
    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        profileId,
        originalFilename: file.originalname,
        fileType,
        status: 'PROCESSING',
      }
    });

    // 4. Add job to the worker queue
    await mediaQueue.add('process-media', {
      mediaId: mediaAsset.id,
      inputFilePath: file.path,
      fileType: fileType
    });

    // 5. Respond immediately to the user
    res.status(202).json({ 
      message: "Fichier uploadé. Le traitement asynchrone est en cours.",
      mediaId: mediaAsset.id,
      status: "PROCESSING"
    });

  } catch (error) {
    console.error("Upload API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

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
