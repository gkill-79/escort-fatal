import express from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

const router = express.Router();

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Veuillez renseigner vos identifiants" });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Ce compte est désactivé" });
    }

    // Return the user data needed by NextAuth
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Auth API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
