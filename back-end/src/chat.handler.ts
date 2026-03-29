import type { Socket, Server } from "socket.io";
import { prisma } from "@/lib/prisma";

// Dictionnaire pour stocker les chronomètres (facturation à la minute)
const activeBillingIntervals = new Map<string, NodeJS.Timeout>();
const PLATFORM_FEE_PERCENTAGE = 0.20; // 20% platform fee

// Types minimal pour le handler (à étendre dans types/socket.types.ts)
interface ClientToServerEvents {
  "room:join": (roomId: string) => void;
  "room:leave": (roomId: string) => void;
  "message:send": (payload: { roomId: string; content: string; type?: string }) => void;
  "message:read": (payload: { roomId: string; messageId: string }) => void;
  "typing:start": (roomId: string) => void;
  "typing:stop": (roomId: string) => void;
}

interface ServerToClientEvents {
  "message:new": (msg: unknown) => void;
  "message:read": (payload: { roomId: string; messageId: string }) => void;
  "typing:start": (payload: { roomId: string; userId: string; username: string; isTyping: boolean }) => void;
  "typing:stop": (payload: { roomId: string; userId: string; username: string; isTyping: boolean }) => void;
  "notification:new": (n: unknown) => void;
  "webrtc:signal": (payload: { targetId: string; senderId: string; data: any }) => void;
  "webrtc:call-init": (payload: { targetId: string; senderId: string; senderName: string }) => void;
}

export function chatHandler(
  socket: Socket<any, any>,
  io: Server<any, any>,
  userId?: string
) {
  // --- WebRTC Signaling Relay ---
  // Forward signaling data directly to the target user's session
  socket.on("webrtc:signal", ({ targetId, data }) => {
    if (!userId) return;
    socket.to(`user:${targetId}`).emit("webrtc:signal", { senderId: userId, data });
  });

  socket.on("webrtc:call-init", ({ targetId, senderName }) => {
    if (!userId) return;
    socket.to(`user:${targetId}`).emit("webrtc:call-init", { senderId: userId, senderName });
  });

  // --- STRICT WEBRTC SIGNALING (V2) ---
  socket.on("video-call-initiate", ({ targetUserId, roomId }) => {
    if (!userId) return;
    socket.to(`user:${targetUserId}`).emit("video-call-incoming", {
      fromUserId: userId,
      roomId
    });
  });

  socket.on("webrtc-offer", ({ targetUserId, offer }) => {
    if (!userId) return;
    socket.to(`user:${targetUserId}`).emit("webrtc-offer", {
      fromUserId: userId,
      offer
    });
  });

  socket.on("webrtc-answer", ({ targetUserId, answer }) => {
    if (!userId) return;
    socket.to(`user:${targetUserId}`).emit("webrtc-answer", {
      fromUserId: userId,
      answer
    });
  });

  socket.on("webrtc-ice-candidate", ({ targetUserId, candidate }) => {
    if (!userId) return;
    socket.to(`user:${targetUserId}`).emit("webrtc-ice-candidate", {
      fromUserId: userId,
      candidate
    });
  });

  socket.on("video-call-end", async ({ targetUserId, roomId }) => {
    if (!userId) return;
    
    if (roomId) {
      await terminateCall(roomId, io, "COMPLETED");
    }

    if (targetUserId) {
      socket.to(`user:${targetUserId}`).emit("video-call-ended");
    }
  });

  // --- FACTURATION TEMPS RÉEL (WebRTC V2) ---
  socket.on("video-call-accepted", async ({ targetUserId, roomId }) => {
    if (!userId) return;
    const escortId = userId; // L'escorte qui accepte
    const clientId = targetUserId; // Le client qui a appelé

    try {
      // A. Récupérer le prix de l'escorte
      const escortProfile = await prisma.profile.findUnique({ where: { userId: escortId } });
      const pricePerMin = escortProfile?.videoCallPricePerMin || 50;

      // B. Vérifier le solde du client
      const client = await prisma.user.findUnique({ where: { id: clientId } });
      if (!client || client.creditsBalance < pricePerMin) {
        io.to(roomId).emit("call-error", { message: "Fonds insuffisants pour démarrer l'appel." });
        return;
      }

      // C. Créer la session en BDD
      await prisma.callSession.create({
        data: { roomId, clientId, escortId, costPerMinute: pricePerMin }
      });

      // D. Prévenir les deux partis que l'appel commence officiellement
      io.to(roomId).emit("video-call-started");

      // E. LANCER LE CHRONOMÈTRE (Chaque 60 secondes)
      const interval = setInterval(async () => {
        await processBillingTick(roomId, clientId, escortId, pricePerMin, io);
      }, 60000);

      activeBillingIntervals.set(roomId, interval);
    } catch (err) {
      console.error("Erreur video-call-accepted:", err);
    }
  });

  socket.on("disconnect", async () => {
    // Si l'utilisateur quitte violemment, on pourrait chercher ses rooms 
    // et couper ses appels. Pour l'instant, ça se coupera quand 
    // l'autre côté émet 'video-call-end' ou quand le heartbeat P2P s'arrête.
  });

  socket.on("room:join", async (roomId: string) => {
    if (!userId) return;
    try {
      const room = await prisma.chatRoom.findFirst({
        where: {
          id: roomId,
          OR: [{ memberId: userId }, { profile: { userId } }],
        },
      });
      if (room) socket.join(`room:${roomId}`);
    } catch {
      // ignore
    }
  });

  socket.on("room:leave", (roomId: string) => {
    socket.leave(`room:${roomId}`);
  });

  socket.on("message:send", async ({ roomId, content, type = "TEXT" }) => {
    if (!userId || !content?.trim()) return;
    // TODO: encrypt, save message, broadcast (see files (2) or (3) for full impl)
    io.to(`room:${roomId}`).emit("message:new", { roomId, content, type, senderId: userId });
  });

  socket.on("message:read", async ({ roomId, messageId }) => {
    if (!userId) return;
    await prisma.message
      .updateMany({
        where: { id: messageId, roomId, senderId: { not: userId }, readAt: null },
        data: { readAt: new Date() },
      })
      .catch(() => null);
    socket.to(`room:${roomId}`).emit("message:read", { roomId, messageId });
  });

  socket.on("typing:start", (roomId: string) => {
    if (!userId) return;
    socket.to(`room:${roomId}`).emit("typing:start", {
      roomId,
      userId,
      username: (socket as unknown as { username?: string }).username ?? "",
      isTyping: true,
    });
  });

  socket.on("typing:stop", (roomId: string) => {
    if (!userId) return;
    socket.to(`room:${roomId}`).emit("typing:stop", {
      roomId,
      userId,
      username: (socket as unknown as { username?: string }).username ?? "",
      isTyping: false,
    });
  });
}

/**
 * Fonction cœur : S'exécute chaque minute pour débiter le client
 */
async function processBillingTick(roomId: string, clientId: string, escortId: string, pricePerMin: number, io: Server) {
  try {
    await prisma.$transaction(async (tx) => {
      const client = await tx.user.findUnique({ where: { id: clientId } });
      
      if (!client || client.creditsBalance < pricePerMin) {
        throw new Error('INSUFFICIENT_FUNDS');
      }

      const escortCut = Math.floor(pricePerMin * (1 - PLATFORM_FEE_PERCENTAGE));

      // 1. Débiter le client
      await tx.user.update({
        where: { id: clientId },
        data: { creditsBalance: { decrement: pricePerMin } }
      });

      // 2. Créditer l'escorte
      await tx.user.update({
        where: { id: escortId },
        data: { creditsBalance: { increment: escortCut } } 
      });

      // 3. Mettre à jour les stats de l'appel
      await tx.callSession.update({
        where: { roomId },
        data: { 
          totalBilled: { increment: pricePerMin },
          escortEarnings: { increment: escortCut }
        }
      });

      // (Optionnel) Avertissement solde faible (< 3 min)
      const remainingBalance = client.creditsBalance - pricePerMin;
      if (remainingBalance < pricePerMin * 3) {
        // Envoie l'alerte au client spécifiquement
        io.to(`user:${clientId}`).emit('call-warning-funds', { 
          remainingMinutes: Math.floor(remainingBalance / pricePerMin) 
        });
      }
    });

  } catch (error: any) {
    if (error.message === 'INSUFFICIENT_FUNDS') {
      await terminateCall(roomId, io, 'INSUFFICIENT_FUNDS');
    } else {
      console.error("Erreur critique facturation:", error);
    }
  }
}

/**
 * Arrête le chronomètre et ferme l'appel proprement
 */
async function terminateCall(roomId: string, io: Server, status: 'COMPLETED' | 'INSUFFICIENT_FUNDS') {
  const interval = activeBillingIntervals.get(roomId);
  if (interval) {
    clearInterval(interval);
    activeBillingIntervals.delete(roomId);
  }

  try {
    await prisma.callSession.updateMany({
      where: { roomId, status: 'ONGOING' },
      data: { status, endTime: new Date() }
    });
  } catch(e) { /* ignore si déjà clos */ }

  io.to(roomId).emit('call-force-ended', { reason: status });
}
