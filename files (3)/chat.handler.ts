import type { Socket, Server } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents } from "@/types";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";

export function chatHandler(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  userId?: string
) {
  // ─── Join a chat room ─────────────────────────────────────────
  socket.on("room:join", async (roomId: string) => {
    if (!userId) return;

    // Verify user is a member of this room
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        OR: [
          { memberId: userId },
          { profile: { userId } },
        ],
      },
    }).catch(() => null);

    if (!room) return;

    socket.join(`room:${roomId}`);
  });

  // ─── Leave a chat room ────────────────────────────────────────
  socket.on("room:leave", (roomId: string) => {
    socket.leave(`room:${roomId}`);
  });

  // ─── Send a message ───────────────────────────────────────────
  socket.on("message:send", async ({ roomId, content, type = "TEXT" }) => {
    if (!userId || !content.trim()) return;

    // Verify membership
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        isActive: true,
        OR: [
          { memberId: userId },
          { profile: { userId } },
        ],
      },
      include: {
        member:  { select: { id: true, username: true, avatarUrl: true } },
        profile: { select: { userId: true, name: true } },
      },
    }).catch(() => null);

    if (!room) return;

    // Check chat credits for members (not for the escort)
    if (room.memberId === userId) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { chatCredits: true } });
      if (!user || user.chatCredits <= 0) {
        socket.emit("notification:new", {
          id:        "no-credits",
          type:      "payment",
          title:     "Crédits insuffisants",
          body:      "Achetez des crédits pour continuer à chatter.",
          url:       "/dashboard/boost",
          isRead:    false,
          createdAt: new Date(),
        });
        return;
      }
      // Deduct 1 credit per message
      await prisma.user.update({ where: { id: userId }, data: { chatCredits: { decrement: 1 } } });
    }

    try {
      // Save encrypted message
      const encrypted = encrypt(content);
      const saved = await prisma.message.create({
        data: {
          roomId,
          senderId:        userId,
          contentEncrypted: encrypted,
          type:            type as any,
        },
        include: {
          sender: { select: { id: true, username: true, avatarUrl: true } },
        },
      });

      // Update room last message timestamp
      await prisma.chatRoom.update({
        where: { id: roomId },
        data:  { lastMessageAt: new Date() },
      });

      // Broadcast decrypted message to room
      const msg = {
        id:       saved.id,
        roomId:   saved.roomId,
        senderId: saved.senderId,
        content,                    // plaintext for broadcast
        type:     saved.type as any,
        sentAt:   saved.sentAt,
        readAt:   null,
        sender:   saved.sender,
      };

      io.to(`room:${roomId}`).emit("message:new", msg);

    } catch (err) {
      console.error("[chat.handler] message:send error:", err);
    }
  });

  // ─── Mark message as read ─────────────────────────────────────
  socket.on("message:read", async ({ roomId, messageId }) => {
    if (!userId) return;

    await prisma.message.updateMany({
      where: {
        id:     messageId,
        roomId,
        senderId: { not: userId },
        readAt:   null,
      },
      data: { readAt: new Date() },
    }).catch(() => null);

    socket.to(`room:${roomId}`).emit("message:read", { roomId, messageId });
  });

  // ─── Typing indicators ────────────────────────────────────────
  socket.on("typing:start", (roomId: string) => {
    if (!userId) return;
    socket.to(`room:${roomId}`).emit("typing:start", {
      roomId,
      userId,
      username: (socket as any).username ?? "",
      isTyping: true,
    });
  });

  socket.on("typing:stop", (roomId: string) => {
    if (!userId) return;
    socket.to(`room:${roomId}`).emit("typing:stop", {
      roomId,
      userId,
      username: (socket as any).username ?? "",
      isTyping: false,
    });
  });
}
