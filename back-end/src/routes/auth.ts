import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      process.env.AUTH_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    // Return the user data and token needed by NextAuth
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("Auth API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role, gender, cityId } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email ou pseudo déjà utilisé" });
    }

    let resolvedCityId = undefined;
    if (cityId) {
      if (typeof cityId === 'number') {
        resolvedCityId = cityId;
      } else if (!isNaN(parseInt(cityId, 10))) {
        resolvedCityId = parseInt(cityId, 10);
      } else {
        const cityMatch = await prisma.city.findFirst({
          where: { name: { equals: cityId, mode: 'insensitive' } }
        });
        if (cityMatch) {
          resolvedCityId = cityMatch.id;
        }
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: role || "USER",
        isActive: true,
        // Create profile if role is ESCORT
        profile: role === "ESCORT" ? {
          create: {
            name: username,
            slug: username.toLowerCase().replace(/ /g, "-"),
            gender: gender || "FEMALE",
            cityId: resolvedCityId,
            status: "PENDING",
            isApproved: false,
            isActive: true,
          }
        } : undefined
      }
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    console.error("Register API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
