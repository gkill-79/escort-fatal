"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function updateProfileStatus(profileId: string, newStatus: 'APPROVED' | 'REJECTED' | 'SUSPENDED') {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      throw new Error("Accès refusé");
    }

    await prisma.profile.update({
      where: { id: profileId },
      data: { status: newStatus }
    });

    revalidatePath('/admin/profiles');
    revalidatePath('/admin/reports');
    return { success: true };
  } catch (error) {
    console.error("[UPDATE_PROFILE_STATUS]", error);
    throw error;
  }
}
