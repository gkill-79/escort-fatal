import type { Socket, Server } from "socket.io";
import { prisma } from "@/lib/prisma";

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
}

export function chatHandler(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  userId?: string
) {
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
