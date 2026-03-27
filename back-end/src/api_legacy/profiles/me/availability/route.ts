import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ESCORT") {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { availabilities } = await req.json();

    // The user's profile ID
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    });

    if (!profile) {
       return NextResponse.json({ message: "Profil introuvable" }, { status: 404 });
    }

    // Wrap in transaction: clear old availabilities, insert new ones
    await prisma.$transaction([
      prisma.availability.deleteMany({
        where: { profileId: profile.id }
      }),
      prisma.availability.createMany({
        data: availabilities.map((a: any) => ({
          profileId: profile.id,
          dayOfWeek: a.dayOfWeek,
          startHour: a.startHour,
          endHour: a.endHour,
        }))
      })
    ]);

    return NextResponse.json({ message: "Horaires mis à jour" });

  } catch (error: any) {
    console.error("Availability API Error:", error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour." },
      { status: 500 }
    );
  }
}
