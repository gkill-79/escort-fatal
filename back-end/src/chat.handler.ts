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

  socket.on("video-call-end", ({ targetUserId }) => {
    if (!userId) return;
    socket.to(`user:${targetUserId}`).emit("video-call-ended");
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
