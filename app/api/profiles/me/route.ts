import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";

export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ESCORT") {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const data = await req.json();

    // Map numerical values and basic text
    const updateData: any = {};
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.height !== undefined) updateData.height = data.height ? parseInt(data.height, 10) : null;
    if (data.age !== undefined) updateData.age = data.age ? parseInt(data.age, 10) : null;
    if (data.priceFrom !== undefined) updateData.priceFrom = data.priceFrom ? parseInt(data.priceFrom, 10) : null;
    if (data.priceTo !== undefined) updateData.priceTo = data.priceTo ? parseInt(data.priceTo, 10) : null;
    
    if (data.hairColor !== undefined) updateData.hairColor = data.hairColor;
    if (data.nationality !== undefined) updateData.nationality = data.nationality;

    if (data.cityId !== undefined) updateData.cityId = data.cityId ? parseInt(data.cityId, 10) : null;
    if (data.departmentId !== undefined) updateData.departmentId = data.departmentId ? parseInt(data.departmentId, 10) : null;
    
    if (data.phone !== undefined) {
      updateData.phoneEncrypted = data.phone ? encrypt(data.phone) : null;
    }

    if (data.services !== undefined && Array.isArray(data.services)) {
      updateData.services = {
        deleteMany: {}, // Clear old services
        create: data.services.map((s: string) => ({ type: s }))
      };
    }

    // Update profile associated with the current user
    const updatedProfile = await prisma.profile.update({
      where: {
        userId: session.user.id,
      },
      data: updateData,
    });

    return NextResponse.json(updatedProfile);

  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour." },
      { status: 500 }
    );
  }
}
