import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ESCORT") {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "Aucun fichier fourni" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get the escort's profile
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    });

    if (!profile) {
      return NextResponse.json({ message: "Profil introuvable" }, { status: 404 });
    }

    // Set up upload directories
    const uploadDir = join(process.cwd(), "public", "uploads", "photos", profile.id);
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // Ignore if dir exists
    }

    // File naming
    const uniqueId = randomUUID();
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${uniqueId}.${ext}`;
    const filePath = join(uploadDir, filename);

    // Write file to public/uploads/photos/{profileId}/{filename}
    await writeFile(filePath, buffer);

    const relativeUrl = `/uploads/photos/${profile.id}/${filename}`;

    // Get current max order to append the new photo at the end
    const lastPhoto = await prisma.profilePhoto.findFirst({
      where: { profileId: profile.id },
      orderBy: { order: "desc" },
    });
    
    const nextOrder = lastPhoto ? lastPhoto.order + 1 : 0;
    const isPrimary = nextOrder === 0;

    // Prisma entry
    const profilePhoto = await prisma.profilePhoto.create({
      data: {
        profileId: profile.id,
        url: relativeUrl,
        sizeBytes: buffer.length,
        order: nextOrder,
        isPrimary: isPrimary,
        isApproved: true, // Assuming auto-approve for now
      }
    });

    return NextResponse.json(profilePhoto);
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { message: "Erreur lors de l'upload du fichier." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ESCORT") {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const photoId = searchParams.get("id");

    if (!photoId) {
      return NextResponse.json({ message: "ID de la photo manquant" }, { status: 400 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    });

    if (!profile) return NextResponse.json({ message: "Profil introuvable" }, { status: 404 });

    // Validate ownership
    const photo = await prisma.profilePhoto.findFirst({
      where: {
        id: photoId,
        profileId: profile.id,
      }
    });

    if (!photo) {
      return NextResponse.json({ message: "Photo introuvable ou vous n'êtes pas autorisé" }, { status: 404 });
    }

    await prisma.profilePhoto.delete({
      where: { id: photoId }
    });

    // Optionnel: Delete the physical file using fs.unlink
    // await unlink(join(process.cwd(), "public", ...photo.url.split("/").filter(Boolean)));
    // Keeping it simple for now, skipping actual unlink error handling

    return NextResponse.json({ success: true, message: "Photo supprimée" });

  } catch (error: any) {
    console.error("Delete API Error:", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression de la photo." },
      { status: 500 }
    );
  }
}
