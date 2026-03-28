import express from "express";
import { prisma } from "../lib/prisma";
import { Role } from "@prisma/client";

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const role = req.headers["x-user-role"] as string;
  if (role !== "ADMIN") {
    return res.status(403).json({ message: "Accès refusé" });
  }
  next();
};

router.use(isAdmin);

// GET /admin/stats - Summary for dashboard
router.get("/stats", async (req, res) => {
  try {
    const [totalUsers, totalEscorts, pendingProfiles] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ESCORT" } }),
      prisma.profile.count({ where: { status: "PENDING" } })
    ]);

    res.json({ totalUsers, totalEscorts, pendingProfiles });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /admin/users - List users with filters and pagination
router.get("/users", async (req, res) => {
  try {
    const { q, role, status, page = "1", limit = "25" } = req.query;
    
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (q) {
      where.OR = [
        { username: { contains: q as string, mode: "insensitive" } },
        { email: { contains: q as string, mode: "insensitive" } },
      ];
    }

    if (role && role !== "ALL") {
      where.role = role as Role;
    }

    if (status === "ACTIVE") {
      where.isActive = true;
    } else if (status === "BANNED") {
      where.isActive = false;
    }

    const [users, totalUsers, activeCount, bannedCount, escortCount] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.user.count({ where }),
      prisma.user.count({ where: { ...where, isActive: true } }),
      prisma.user.count({ where: { ...where, isActive: false } }),
      prisma.user.count({ where: { ...where, role: "ESCORT" } }),
    ]);

    res.json({
      items: users,
      total: totalUsers,
      activeCount,
      bannedCount,
      escortCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalUsers / limitNum)
    });
  } catch (error) {
    console.error("Admin Users API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /admin/profiles/pending - Profiles waiting for moderation
router.get("/profiles/pending", async (req, res) => {
  try {
    const profiles = await prisma.profile.findMany({ 
      where: { status: "PENDING" }, 
      include: { 
        media: true,
        user: true
      }
    });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /admin/profiles/:id/status - Approve or reject profile
router.post("/profiles/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const profile = await prisma.profile.update({
      where: { id },
      data: { 
        status: status,
        isApproved: status === "APPROVED"
      }
    });

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /admin/reports - Pending reports
router.get("/reports", async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: {
        reporter: { select: { username: true } },
        profile: { select: { id: true, name: true, slug: true } },
      }
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /admin/reports/:id/dismiss - Dismiss report
router.post("/reports/:id/dismiss", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.report.update({
      where: { id },
      data: { status: "DISMISSED" }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /admin/reports/:id/ban - Ban profile (from report)
router.post("/reports/:id/ban", async (req, res) => {
  try {
    const { id } = req.params;
    const { profileId } = req.body;

    await prisma.$transaction([
      prisma.report.update({
        where: { id },
        data: { status: "RESOLVED" }
      }),
      prisma.profile.update({
        where: { id: profileId },
        data: { 
          status: "SUSPENDED",
          isActive: false 
        }
      })
    ]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /admin/comments/pending
router.get("/comments/pending", async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { username: true } },
        profile: { select: { slug: true, name: true } },
      }
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /admin/comments/:id/approve
router.post("/comments/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.comment.update({
      where: { id },
      data: { isApproved: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE /admin/comments/:id
router.delete("/comments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.comment.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /admin/photos/pending
router.get("/photos/pending", async (req, res) => {
  try {
    const photos = await prisma.profilePhoto.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: "asc" },
      take: 50,
      include: {
        profile: { select: { name: true, slug: true } },
      },
    });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /admin/photos/:id/approve
router.post("/photos/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.profilePhoto.update({
      where: { id },
      data: { isApproved: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE /admin/photos/:id
router.delete("/photos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.profilePhoto.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /admin/users/:id/toggle-ban
router.post("/users/:id/toggle-ban", async (req, res) => {
  try {
    const { id } = req.params;
    const { currentStatus } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: !currentStatus }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /admin/users/:id/credits
router.post("/users/:id/credits", async (req, res) => {
  try {
    const { id } = req.params;
    const { credits } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { chatCredits: credits }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /admin/users/:id/role
router.post("/users/:id/role", async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { role: role as Role }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE /admin/users/:id
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
