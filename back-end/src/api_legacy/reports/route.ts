import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return new NextResponse("Non autorisé", { status: 401 });

    const { profileId, reason, details } = await req.json();
    if (!profileId || !reason) return new NextResponse("Données manquantes", { status: 400 });

    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        profileId,
        reason,
        details,
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error("[REPORTS_POST]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
