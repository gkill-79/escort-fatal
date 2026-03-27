/**
 * Custom server: Next.js + Socket.io
 * Run with: node --import tsx server/index.ts (or tsx server/index.ts)
 * For dev, you can use next dev and run Socket.io separately, or use this entry.
 */
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { PrismaClient } from "@prisma/client";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME ?? "localhost";
const port = parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const prisma = new PrismaClient();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request", err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  const io = new SocketIOServer(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    socket.on("join_room", (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    });

    socket.on("send_message", async (data: { roomId: string; senderId: string; content: string }) => {
      try {
        const { roomId, senderId, content } = data;
        // Verify credits if sender is a member
        const user = await prisma.user.findUnique({
          where: { id: senderId },
          select: { role: true, chatCredits: true }
        });

        if (user && user.role === "MEMBER") {
           if (user.chatCredits < 1) {
             socket.emit("chat_error", { code: "INSUFFICIENT_CREDITS", message: "Vous n'avez pas assez de crédits pour envoyer un message." });
             return;
           }
           // Deduct 1 credit
           await prisma.user.update({
             where: { id: senderId },
             data: { chatCredits: { decrement: 1 } }
           });
        }

        // Save to DB
        const message = await prisma.message.create({
          data: {
            roomId,
            senderId,
            contentEncrypted: content,
          },
          include: {
             sender: { select: { id: true, username: true, avatarUrl: true, role: true } }
          }
        });

        // Broadcast back to clients in the room
        io.to(roomId).emit("receive_message", message);

        // Update lastMessageAt on the room
        await prisma.chatRoom.update({
          where: { id: roomId },
          data: { lastMessageAt: new Date() }
        });
      } catch (err) {
        console.error("Error saving message", err);
        socket.emit("chat_error", { code: "SERVER_ERROR", message: "Erreur lors de l'envoi." });
      }
    });

    socket.on("typing_start", (data: { roomId: string; senderId: string }) => {
      // Use socket.to(roomId) to emit to everyone in the room EXCEPT the sender
      socket.to(data.roomId).emit("user_typing", { userId: data.senderId, isTyping: true });
    });

    socket.on("typing_stop", (data: { roomId: string; senderId: string }) => {
      socket.to(data.roomId).emit("user_typing", { userId: data.senderId, isTyping: false });
    });

    socket.on("mark_as_read", async (data: { roomId: string; messageIds: string[] }) => {
      try {
        if (!data.messageIds || data.messageIds.length === 0) return;
        
        const now = new Date();
        await prisma.message.updateMany({
          where: { id: { in: data.messageIds } },
          data: { readAt: now }
        });
        
        io.to(data.roomId).emit("messages_read", { messageIds: data.messageIds, readAt: now });
      } catch (err) {
        console.error("Error marking as read", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket Disconnected: ${socket.id}`);
    });
  });

  server
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
