import express from "express";
import { prisma } from "../lib/prisma";
// import { authenticate } from "../middleware/auth"; // To be implemented

const router = express.Router();

// PATCH /profiles/me
router.patch("/me", async (req, res) => {
  try {
    const { userId, data } = req.body; // In a real app, userId comes from the auth middleware

    if (!userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const updateData: any = {};
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.height !== undefined) updateData.height = data.height ? parseInt(data.height, 10) : null;
    if (data.age !== undefined) updateData.age = data.age ? parseInt(data.age, 10) : null;
    if (data.priceFrom !== undefined) updateData.priceFrom = data.priceFrom ? parseInt(data.priceFrom, 10) : null;
    if (data.priceTo !== undefined) updateData.priceTo = data.priceTo ? parseInt(data.priceTo, 10) : null;
    
    if (data.hairColor !== undefined) updateData.hairColor = data.hairColor;
    if (data.nationality !== undefined) updateData.nationality = data.nationality;

    if (data.cityId !== undefined) updateData.cityId = data.cityId ? parseInt(data.cityId, 10) : null;
    if (data.departmentId !== undefined) updateData.departmentId = data.departmentId ? parseInt(data.departmentId, 10) : null;
    
    // Services update logic
    if (data.services !== undefined && Array.isArray(data.services)) {
        updateData.services = {
          deleteMany: {},
          create: data.services.map((s: string) => ({ type: s }))
        };
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: updateData,
    });

    res.json(updatedProfile);
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour." });
  }
});

export default router;
