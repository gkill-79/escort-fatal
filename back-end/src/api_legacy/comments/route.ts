import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ message: "Vous devez être connecté pour laisser un avis." }, { status: 401 });
    }

    const { profileId, content, rating } = await req.json();

    if (!profileId || !content || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ message: "Données invalides. Note entre 1 et 5 requise." }, { status: 400 });
    }

    const escortProfile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: { _count: { select: { comments: { where: { isApproved: true } } } } }
    });

    if (!escortProfile) {
      return NextResponse.json({ message: "Profil introuvable." }, { status: 404 });
    }

    // Create the comment pending admin approval
    const newComment = await prisma.comment.create({
      data: {
        authorId: session.user.id,
        profileId: profileId,
        content: content.trim(),
        rating: rating,
        isApproved: false, // Default pending state
      },
      include: {
        author: { select: { id: true, username: true, role: true, avatarUrl: true } }
      }
    });

    return NextResponse.json({ ...newComment, message: "Avis soumis, en attente de validation." });
  } catch (error: any) {
    console.error("Comment API Error:", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de la publication de l'avis." },
      { status: 500 }
    );
  }
}
