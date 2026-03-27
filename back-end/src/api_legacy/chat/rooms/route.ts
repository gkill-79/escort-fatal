import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    const userId = session.user.id;
    const profile = await prisma.profile.findUnique({ where: { userId } });

    // A user can be a Member or an Escort (having a profile)
    const rooms = await prisma.chatRoom.findMany({
      where: {
        OR: [
          { memberId: userId },
          ...(profile ? [{ profileId: profile.id }] : [])
        ]
      },
      include: {
        member: { select: { id: true, username: true, avatarUrl: true } },
        profile: { select: { id: true, name: true } },
        messages: {
          orderBy: { sentAt: "desc" },
          take: 1
        }
      },
      orderBy: {
        lastMessageAt: "desc"
      }
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error("GET ChatRooms error", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    const { targetUserId } = await req.json();

    if (!targetUserId || targetUserId === session.user.id) {
      return NextResponse.json({ message: "Destinataire invalide" }, { status: 400 });
    }

    // Determine who is the member and who is the profile
    // Usually, the member initiates chat with the escort profile
    // So targetUserId should be the escort's USER ID.
    const targetProfile = await prisma.profile.findUnique({ where: { userId: targetUserId }});
    const currentProfile = await prisma.profile.findUnique({ where: { userId: session.user.id }});

    let escortProfileId = "";
    let memberUserId = "";

    if (targetProfile) {
       escortProfileId = targetProfile.id;
       memberUserId = session.user.id;
       
       if (!targetProfile.acceptsChat) {
         return NextResponse.json({ message: "Cette escorte n'accepte pas les messages privés actuellement." }, { status: 403 });
       }
    } else if (currentProfile) {
       escortProfileId = currentProfile.id;
       memberUserId = targetUserId;
    } else {
       return NextResponse.json({ message: "Conversations réservées aux escortes" }, { status: 403 });
    }

    // Check if room exists
    let room = await prisma.chatRoom.findUnique({
      where: {
        profileId_memberId: {
          profileId: escortProfileId,
          memberId: memberUserId
        }
      }
    });

    if (!room) {
      room = await prisma.chatRoom.create({
        data: {
          profileId: escortProfileId,
          memberId: memberUserId
        }
      });
    }

    return NextResponse.json({ roomId: room.id });
  } catch (error) {
    console.error("POST ChatRooms error", error);
    return NextResponse.json({ message: "Erreur initialisation chat" }, { status: 500 });
  }
}
