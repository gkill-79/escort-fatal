import express from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

// GET /profiles/stats
router.get("/stats", async (req, res) => {
  try {
    const [totalProfiles, onlineCount, totalCities] = await Promise.all([
      prisma.profile.count({ where: { isApproved: true, isActive: true } }),
      prisma.profile.count({ where: { isOnline: true, isApproved: true, isActive: true } }),
      prisma.city.count(),
    ]);
    res.json({ totalProfiles, onlineCount, totalCities });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /v2/profiles/latest - 20 most recent approved profiles
router.get("/latest", async (req, res) => {
  try {
    const profiles = await prisma.profile.findMany({
      where: { 
        status: "APPROVED",
        isActive: true
      },
      include: {
        city: true,
        photos: { where: { isPrimary: true, isApproved: true }, take: 1 }
      },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /profiles/top
router.get("/top", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;
    const list = await prisma.profile.findMany({
      where: { isApproved: true, isActive: true, isTopGirl: true },
      take: limit,
      orderBy: { boostScore: "desc" },
      include: {
        city: true,
        photos: { where: { isPrimary: true }, take: 1 },
      },
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /profiles/online
router.get("/online", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;
    const list = await prisma.profile.findMany({
      where: { isApproved: true, isActive: true, isOnline: true },
      take: limit,
      orderBy: { lastOnlineAt: "desc" },
      include: {
        city: true,
        photos: { where: { isPrimary: true }, take: 1 },
      },
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /profiles/new
router.get("/new", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;
    const list = await prisma.profile.findMany({
      where: { isApproved: true, isActive: true },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        city: true,
        photos: { where: { isPrimary: true }, take: 1 },
      },
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /profiles/slug/:slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const profile = await prisma.profile.findUnique({
      where: { slug },
      include: {
        city: true,
        department: true,
        photos: { orderBy: { order: "asc" } },
        videos: true,
        services: true,
        availability: true,
        comments: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
          include: {
            author: { select: { id: true, username: true, role: true, avatarUrl: true } }
          }
        }
      },
    });

    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /profiles/search
router.get("/search", async (req, res) => {
  // ... (keep existing implementation)
});

// GET /me/followers
router.get("/me/followers", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) return res.status(401).json({ message: "Non autorisé" });

    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!profile) return res.status(404).json({ message: "Profil non trouvé" });

    const followers = await prisma.follow.findMany({
      where: { profileId: profile.id },
      include: {
        follower: {
          select: { username: true, avatarUrl: true, createdAt: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(followers);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /admin/stats
router.get("/admin/stats", async (req, res) => {
  try {
    const isAdmin = req.headers["x-is-admin"] === "true";
    if (!isAdmin) return res.status(403).json({ message: "Forbidden" });

    const [totalUsers, totalEscorts, pendingProfiles, revenues] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({ where: { role: "ESCORT" } }),
      prisma.profile.count({ where: { status: "PENDING" } }),
      prisma.transaction.aggregate({ _sum: { amount: true } })
    ]);

    res.json({
      totalUsers,
      totalEscorts,
      pendingProfiles,
      totalRevenues: revenues._sum.amount || 0
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /is-following?profileId=...
router.get("/is-following", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const { profileId } = req.query;
    
    if (!userId || !profileId) return res.json({ isFollowing: false });

    const follow = await prisma.follow.findUnique({
      where: { 
        followerId_profileId: { 
          followerId: userId, 
          profileId: profileId as string 
        } 
      }
    });

    res.json({ isFollowing: !!follow });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /me/following
router.get("/me/following", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) return res.status(401).json({ message: "Non autorisé" });

    const follows = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        profile: {
          include: {
            city: true,
            photos: { where: { isPrimary: true, isApproved: true }, take: 1 },
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(follows);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /me/stats
router.get("/me/stats", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) return res.status(401).json({ message: "Non autorisé" });

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        _count: {
          select: { followers: true, comments: { where: { isApproved: true } } }
        }
      }
    });

    if (!profile) return res.status(404).json({ message: "Profil introuvable" });

    // Count chat rooms for the user
    const chatRoomsCount = await prisma.chatRoom.count({
      where: { participants: { some: { id: userId } } }
    });

    res.json({
      ...profile,
      _count: {
        ...profile._count,
        chatRooms: chatRoomsCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /me/photos
router.get("/me/photos", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) return res.status(401).json({ message: "Non autorisé" });

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        photos: { orderBy: { order: "asc" } }
      }
    });

    if (!profile) return res.status(404).json({ message: "Profil introuvable" });
    res.json(profile.photos);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /me/settings
router.get("/me/settings", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) return res.status(401).json({ message: "Non autorisé" });

    const [profile, cities, departments] = await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.city.findMany({ orderBy: { name: "asc" } }),
      prisma.department.findMany({ orderBy: { name: "asc" } })
    ]);

    if (!profile) return res.status(404).json({ message: "Profil introuvable" });

    res.json({ profile, cities, departments });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
