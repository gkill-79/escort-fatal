import { Router } from "express";
import { prisma } from "../lib/prisma";
// import { verifyJwt } from "../middleware/auth.middleware";

const router = Router();

// POST /chat/rooms
// Create or get an existing chat room between current user and target escort/profile
router.post("/rooms", async (req: any, res) => {
  const { targetUserId } = req.body;
  const currentUserId = req.headers["x-user-id"] as string; // Temp solution until full JWT middleware is verified

  if (!currentUserId || !targetUserId) {
    return res.status(400).json({ error: "Utilisateurs manquants" });
  }

  try {
    // 1. Trouver le profil de la personne cible (escorte)
    const profile = await prisma.profile.findUnique({
      where: { userId: targetUserId }
    });

    if (!profile) {
      return res.status(404).json({ error: "Profil introuvable" });
    }

    // 2. Vérifier s'il existe déjà une room entre ces deux utilisateurs (Client et Escorte)
    let room = await prisma.chatRoom.findFirst({
      where: {
        AND: [
          { participants: { some: { id: currentUserId } } },
          { participants: { some: { id: targetUserId } } }
        ]
      }
    });

    // 3. Sinon, la créer
    if (!room) {
      room = await prisma.chatRoom.create({
        data: {
          participants: {
            connect: [
              { id: currentUserId },
              { id: targetUserId }
            ]
          }
        }
      });
    }

    res.json({ roomId: room.id });
  } catch (error) {
    console.error("Room creation error:", error);
    res.status(500).json({ error: "Erreur lors de la création de la discussion" });
  }
});

export default router;
