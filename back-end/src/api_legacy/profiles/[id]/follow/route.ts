import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    const profileId = params.id;

    if (!session?.user) {
      return NextResponse.json({ isFollowing: false }, { status: 200 });
    }

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_profileId: {
          followerId: session.user.id,
          profileId: profileId,
        },
      },
    });

    // Also send the current count to help UI sync
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: { followerCount: true },
    });

    return NextResponse.json({
      isFollowing: !!follow,
      followerCount: profile?.followerCount || 0,
    });
  } catch (error) {
    console.error("GET Follow Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    const profileId = params.id;

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if profile exists
    const profile = await prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    // Try to create the follow and increment counter atomically
    await prisma.$transaction(async (tx: any) => {
      const existing = await tx.follow.findUnique({
        where: { followerId_profileId: { followerId: userId, profileId } },
      });

      if (!existing) {
        await tx.follow.create({
          data: {
            followerId: userId,
            profileId: profileId,
          },
        });

        await tx.profile.update({
          where: { id: profileId },
          data: { followerCount: { increment: 1 } },
        });
      }
    });

    return NextResponse.json({ message: "Abonnement réussi" });
  } catch (error) {
    console.error("POST Follow Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    const profileId = params.id;

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;

    await prisma.$transaction(async (tx: any) => {
      const existing = await tx.follow.findUnique({
        where: { followerId_profileId: { followerId: userId, profileId } },
      });

      if (existing) {
        await tx.follow.delete({
          where: { followerId_profileId: { followerId: userId, profileId } },
        });

        // Ensure we don't go below 0
        const currentProfile = await tx.profile.findUnique({ where: { id: profileId }});
        if (currentProfile && currentProfile.followerCount > 0) {
          await tx.profile.update({
             where: { id: profileId },
             data: { followerCount: { decrement: 1 } },
          });
        }
      }
    });

    return NextResponse.json({ message: "Désabonnement réussi" });
  } catch (error) {
    console.error("DELETE Follow Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
