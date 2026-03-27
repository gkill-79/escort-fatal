import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { fetchApi } from "@/lib/api-client";
import { ProfileCard } from "@/components/features/profiles/ProfileCard";
import { Heart } from "lucide-react";

export const metadata = {
  title: "Mes Abonnements — Escorte Fatal",
};

export default async function MemberFollowingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Only allow members to access member dashboard
  if (session.user.role !== "MEMBER" && session.user.role !== "ADMIN") {
    redirect("/escort/dashboard");
  }

  let follows: any[] = [];
  try {
    follows = await fetchApi("/v2/profiles/me/following", {
      headers: { "x-user-id": session.user.id }
    });
  } catch (error) {
    console.error("Error fetching following:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <Heart className="w-6 h-6 text-brand-500 fill-brand-500/20" />
        <h1 className="text-2xl font-bold text-white">Mes Abonnements</h1>
      </div>

      <p className="text-dark-400 text-sm">
        Retrouvez ici toutes vos escortes favorites pour un accès rapide.
      </p>

      {follows.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-dark-900/50">
          <Heart className="w-10 h-10 text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Aucun abonnement</h3>
          <p className="text-dark-400">Vous ne suivez encore aucune escorte.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {follows.map(({ profile }: any) => (
            <ProfileCard key={profile.id} profile={profile as any} />
          ))}
        </div>
      )}
    </div>
  );
}
