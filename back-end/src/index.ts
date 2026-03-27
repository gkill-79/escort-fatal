import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import profilesRouter from "./routes/profiles";
import profilesV2Router from "./routes/profiles_v2";
import citiesRouter from "./routes/cities";
import authRouter from "./routes/auth";
import mediaRouter from "./routes/media";
import adminRouter from "./routes/admin";

const app = express();
const server = createServer(app);
const prisma = new PrismaClient();

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// --- Routes ---
app.get("/health", (req, res) => {
  res.send("Backend is healthy");
});

app.use("/profiles", profilesRouter);
app.use("/v2/profiles", profilesV2Router);
app.use("/cities", citiesRouter);
app.use("/auth", authRouter);
app.use("/media", mediaRouter);
app.use("/admin", adminRouter);

// --- Socket.io Logic (Moved from server/index.ts) ---
io.on("connection", (socket) => {
  console.log(`Socket Connected: ${socket.id}`);

  socket.on("join_room", (roomId: string) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
  });

  socket.on("send_message", async (data: { roomId: string; senderId: string; content: string }) => {
    try {
      const { roomId, senderId, content } = data;
      const user = await prisma.user.findUnique({
        where: { id: senderId },
        select: { role: true, chatCredits: true }
      });

      if (user && user.role === "USER") { // Updated to new Role enum (USER instead of MEMBER if applicable)
         if (user.chatCredits < 1) {
           socket.emit("chat_error", { code: "INSUFFICIENT_CREDITS", message: "Vous n'avez pas assez de crédits pour envoyer un message." });
           return;
         }
         await prisma.user.update({
           where: { id: senderId },
           data: { chatCredits: { decrement: 1 } }
         });
      }

      const message = await prisma.message.create({
        data: {
          roomId,
          senderId,
          content, // Now content instead of contentEncrypted in new schema if applicable
        },
        include: {
           sender: { select: { id: true, username: true, avatarUrl: true, role: true } }
        }
      });

      io.to(roomId).emit("receive_message", message);

      await prisma.chatRoom.update({
        where: { id: roomId },
        data: { updatedAt: new Date() } // Updated field name in new schema
      });
    } catch (err) {
      console.error("Error saving message", err);
      socket.emit("chat_error", { code: "SERVER_ERROR", message: "Erreur lors de l'envoi." });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`> Backend server listening on http://localhost:${PORT}`);
});
