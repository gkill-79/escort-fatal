"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

/** Checks if the current session is explicitly ADMIN */
async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Action non autorisée. Rôle ADMIN requis.");
  }
}

// ============================================
// == COMMENTS ACTIONS
// ============================================

export async function approveComment(commentId: string) {
  await requireAdmin();

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error("Commentaire introuvable.");

  // Run in transaction: Approve the comment AND update the Profile's average
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.comment.update({
      where: { id: commentId },
      data: { isApproved: true }
    });

    // Recalculate Average
    const aggregations = await tx.comment.aggregate({
      where: { profileId: comment.profileId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true }
    });

    await tx.profile.update({
      where: { id: comment.profileId },
      data: {
        ratingAvg: aggregations._avg.rating || 0,
        ratingCount: aggregations._count.rating || 0
      }
    });
  });

  revalidatePath("/admin/comments");
  revalidatePath(`/escorts`);
}

export async function deleteComment(commentId: string) {
  await requireAdmin();

  // If we delete a comment, we do not need to recalculate the average IF it was not approved yet.
  // But just in case, it's safer to always aggregate. Since we only list pending ones in admin, it shouldn't affect avg.
  await prisma.comment.delete({
    where: { id: commentId }
  });

  revalidatePath("/admin/comments");
}

// ============================================
// == REPORTS ACTIONS
// ============================================

export async function dismissReport(reportId: string) {
  await requireAdmin();

  await prisma.report.update({
    where: { id: reportId },
    data: { status: "DISMISSED" }
  });

  revalidatePath("/admin/reports");
}

export async function banProfile(reportId: string, profileId: string) {
  await requireAdmin();

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1. Unpublish and deactivate the Profile
    await tx.profile.update({
      where: { id: profileId },
      data: { isActive: false, isApproved: false }
    });
    
    // 2. Mark report as RESOLVED
    await tx.report.update({
      where: { id: reportId },
      data: { status: "RESOLVED" }
    });
  });

  revalidatePath("/admin/reports");
}

// ============================================
// == VALIDATION KYC / PROFILES
// ============================================

export async function approveProfile(profileId: string) {
  await requireAdmin();

  await prisma.profile.update({
    where: { id: profileId },
    data: { isApproved: true }
  });

  revalidatePath("/admin/profiles");
  revalidatePath("/admin");
}

export async function rejectProfile(profileId: string) {
  await requireAdmin();

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const profile = await tx.profile.findUnique({ where: { id: profileId } });
    if (!profile) return;
    
    // Optionally delete the user entirely, or just the profile.
    // For safety, let's just delete the profile. The user becomes a MEMBER.
    await tx.user.update({
      where: { id: profile.userId },
      data: { role: "MEMBER" }
    });

    await tx.profile.delete({ where: { id: profileId } });
  });

  revalidatePath("/admin/profiles");
  revalidatePath("/admin");
}

// ============================================
// == USERS MANAGEMENT
// ============================================

export async function toggleUserBan(userId: string, banStatus: boolean) {
  await requireAdmin();

  // Protect against banning self
  const session = await auth();
  if (session?.user?.id === userId) {
    throw new Error("Vous ne pouvez pas vous bannir vous-même.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !banStatus }
  });

  revalidatePath("/admin/users");
}

export async function updateChatCredits(userId: string, credits: number) {
  await requireAdmin();

  await prisma.user.update({
    where: { id: userId },
    data: { chatCredits: credits }
  });

  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  await requireAdmin();

  const session = await auth();
  if (session?.user?.id === userId) {
    throw new Error("Vous ne pouvez pas supprimer votre propre compte.");
  }

  // Cascade delete is active in schema
  await prisma.user.delete({
    where: { id: userId }
  });

  revalidatePath("/admin/users");
}

// ============================================
// == MEDIA MODERATION
// ============================================

export async function approvePhoto(photoId: string) {
  await requireAdmin();

  await prisma.profilePhoto.update({
    where: { id: photoId },
    data: { isApproved: true }
  });

  revalidatePath("/admin/media");
}

export async function rejectAndDeletePhoto(photoId: string) {
  await requireAdmin();

  // In reality, you'd also delete the file from your Storage (S3 / Local)
  // For the DB, we just delete the record
  await prisma.profilePhoto.delete({
    where: { id: photoId }
  });

  revalidatePath("/admin/media");
}
