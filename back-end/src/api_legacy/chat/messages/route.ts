import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json({ message: "Room ID missing" }, { status: 400 });
    }

    // Verify if the user is a participant
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: { profile: true }
    });

    if (!room) {
      return NextResponse.json({ message: "Discussion introuvable" }, { status: 404 });
    }

    // The user must be the exact member OR the user behind the escort profile
    const isMember = room.memberId === session.user.id;
    const isProfileOwner = room.profile?.userId === session.user.id;

    if (!isMember && !isProfileOwner) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { roomId: roomId },
      orderBy: { sentAt: "asc" }, // Use actual schema Date fields
      include: {
        sender: { select: { id: true, username: true, role: true, avatarUrl: true } }
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET Messages error", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
