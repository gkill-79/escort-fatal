import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { fetchApi } from "@/lib/api-client";
import { MediaGallery } from "@/components/features/dashboard/MediaGallery";

export default async function MediaDashboardPage() {
  const session = await auth();

  if (!session || session.user.role !== "ESCORT") {
    redirect("/login");
  }

  // Fetch photos from API
  let photos: any[] = [];
  try {
    photos = await fetchApi("/v2/profiles/me/photos", {
      headers: { "x-user-id": session.user.id }
    });
  } catch (error) {
    console.error("Error fetching dashboard photos:", error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Galerie Médias</h1>
        <p className="text-dark-400 mt-1">Gérez vos photos. La première photo d&apos;approuvée servira de couverture.</p>
      </div>

      <div className="bg-dark-800/80 border border-white/5 shadow-sm rounded-2xl p-6 md:p-8 backdrop-blur-sm">
        <MediaGallery initialPhotos={photos} />
      </div>
    </div>
  );
}
