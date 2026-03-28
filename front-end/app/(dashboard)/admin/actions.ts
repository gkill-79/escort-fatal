import { fetchApi } from "@/lib/api-client";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfileStatus(profileId: string, newStatus: 'APPROVED' | 'REJECTED' | 'SUSPENDED'): Promise<void> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") throw new Error("Accès refusé");

    await fetchApi(`/admin/profiles/${profileId}/status`, {
      method: "POST",
      body: JSON.stringify({ status: newStatus }),
      headers: { 
        "x-user-id": session.user.id,
        "x-user-role": session.user.role
      }
    });

    revalidatePath('/admin/profiles');
    revalidatePath('/admin/reports');
  } catch (error) {
    console.error("[UPDATE_PROFILE_STATUS]", error);
    throw error;
  }
}

export async function dismissReport(reportId: string): Promise<void> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") throw new Error("Accès refusé");

    await fetchApi(`/admin/reports/${reportId}/dismiss`, {
      method: "POST",
      headers: { 
        "x-user-id": session.user.id,
        "x-user-role": session.user.role
      }
    });

    revalidatePath('/admin/reports');
  } catch (error) {
    console.error("[DISMISS_REPORT]", error);
    throw error;
  }
}

export async function banProfile(reportId: string, profileId: string): Promise<void> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") throw new Error("Accès refusé");

    await fetchApi(`/admin/reports/${reportId}/ban`, {
      method: "POST",
      body: JSON.stringify({ profileId }),
      headers: { 
        "x-user-id": session.user.id,
        "x-user-role": session.user.role
      }
    });

    revalidatePath('/admin/reports');
    revalidatePath('/admin/profiles');
  } catch (error) {
    console.error("[BAN_PROFILE]", error);
    throw error;
  }
}

export async function approveComment(commentId: string): Promise<void> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") throw new Error("Accès refusé");

    await fetchApi(`/admin/comments/${commentId}/approve`, {
      method: "POST",
      headers: { 
        "x-user-id": session.user.id,
        "x-user-role": session.user.role
      }
    });

    revalidatePath('/admin/comments');
  } catch (error) {
    console.error("[APPROVE_COMMENT]", error);
    throw error;
  }
}

export async function deleteComment(commentId: string): Promise<void> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") throw new Error("Accès refusé");

    await fetchApi(`/admin/comments/${commentId}`, {
      method: "DELETE",
      headers: { 
        "x-user-id": session.user.id,
        "x-user-role": session.user.role
      }
    });

    revalidatePath('/admin/comments');
  } catch (error) {
    console.error("[DELETE_COMMENT]", error);
    throw error;
  }
}

export async function approvePhoto(photoId: string): Promise<void> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") throw new Error("Accès refusé");

    await fetchApi(`/admin/photos/${photoId}/approve`, {
      method: "POST",
      headers: { 
        "x-user-id": session.user.id,
        "x-user-role": session.user.role
      }
    });

    revalidatePath('/admin/media');
  } catch (error) {
    console.error("[APPROVE_PHOTO]", error);
    throw error;
  }
}

export async function rejectAndDeletePhoto(photoId: string): Promise<void> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") throw new Error("Accès refusé");

    await fetchApi(`/admin/photos/${photoId}`, {
      method: "DELETE",
      headers: { 
        "x-user-id": session.user.id,
        "x-user-role": session.user.role
      }
    });

    revalidatePath('/admin/media');
  } catch (error) {
    console.error("[DELETE_PHOTO]", error);
    throw error;
  }
}

export async function toggleUserBan(userId: string, currentStatus: boolean): Promise<void> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") throw new Error("Accès refusé");

    await fetchApi(`/admin/users/${userId}/toggle-ban`, {
      method: "POST",
      body: JSON.stringify({ currentStatus }),
      headers: { 
        "x-user-id": session.user.id,
        "x-user-role": session.user.role
      }
    });

    revalidatePath('/admin/users');
  } catch (error) {
    console.error("[TOGGLE_USER_BAN]", error);
    throw error;
  }
}

export async function updateChatCredits(userId: string, credits: number): Promise<void> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") throw new Error("Accès refusé");

    await fetchApi(`/admin/users/${userId}/credits`, {
      method: "POST",
      body: JSON.stringify({ credits }),
      headers: { 
        "x-user-id": session.user.id,
        "x-user-role": session.user.role
      }
    });

    revalidatePath('/admin/users');
  } catch (error) {
    console.error("[UPDATE_CHAT_CREDITS]", error);
    throw error;
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") throw new Error("Accès refusé");

    await fetchApi(`/admin/users/${userId}`, {
      method: "DELETE",
      headers: { 
        "x-user-id": session.user.id,
        "x-user-role": session.user.role
      }
    });

    revalidatePath('/admin/users');
  } catch (error) {
    console.error("[DELETE_USER]", error);
    throw error;
  }
}

export async function updateUserRole(userId: string, newRole: string): Promise<void> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") throw new Error("Accès refusé");

    await fetchApi(`/admin/users/${userId}/role`, {
      method: "POST",
      body: JSON.stringify({ role: newRole }),
      headers: { 
        "x-user-id": session.user.id,
        "x-user-role": session.user.role
      }
    });

    revalidatePath('/admin/users');
  } catch (error) {
    console.error("[UPDATE_USER_ROLE]", error);
    throw error;
  }
}
