import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MediaGallery } from "@/components/features/dashboard/MediaGallery";

export default async function MediaDashboardPage() {
  const session = await auth();

  if (!session || session.user.role !== "ESCORT") {
    redirect("/login");
  }

  // Fetch escort's profile
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: {
      photos: {
        orderBy: { order: "asc" }
      }
    }
  });

  if (!profile) {
    return <div>Erreur : Profil introuvable.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Galerie Médias</h1>
        <p className="text-dark-400 mt-1">Gérez vos photos. La première photo d&apos;approuvée servira de couverture.</p>
      </div>

      <div className="bg-dark-800/80 border border-white/5 shadow-sm rounded-2xl p-6 md:p-8 backdrop-blur-sm">
        <MediaGallery initialPhotos={profile.photos} />
      </div>
    </div>
  );
}
