import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Heart, Users, Calendar } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import { fetchApi } from "@/lib/api-client";

export const metadata = {
  title: "Ma Communauté — Escorte Fatal",
};

export default async function EscortFollowersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role !== "ESCORT") {
    redirect("/member/dashboard");
  }

  // Fetch data from backend API
  const followers = await fetchApi("/v2/profiles/me/followers", {
    headers: { "x-user-id": session.user.id }
  });

  // We also need the profile followerCount, but for simplicity I can use the length of followers or add a new endpoint
  const followerCount = followers.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-brand-500" />
          <h1 className="text-2xl font-bold text-white">Ma Communauté</h1>
        </div>
        <div className="bg-dark-800 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
           <Heart className="w-4 h-4 text-brand-400 fill-brand-400" />
           <span className="font-bold text-white">{followerCount}</span>
        </div>
      </div>

      <p className="text-dark-400 text-sm">
        Liste des membres qui suivent votre activité.
      </p>

      {followers.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-dark-900/50">
          <Users className="w-10 h-10 text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Aucun abonné</h3>
          <p className="text-dark-400">Votre communauté est encore vide. Soyez active pour attirer des abonnés !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {followers.map(({ follower, createdAt }: any) => (
            <div key={follower.username} className="bg-dark-800 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-dark-700 shrink-0 border border-white/10 flex items-center justify-center">
                 {follower.avatarUrl ? (
                   <img src={follower.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-dark-400 font-bold uppercase">{follower.username.slice(0, 2)}</span>
                 )}
              </div>
              <div>
                <h4 className="font-bold text-white leading-tight">{follower.username}</h4>
                <div className="flex items-center gap-1.5 text-xs text-dark-400 mt-1">
                  <Calendar className="w-3 h-3" />
                  Abonné(e) {formatTimeAgo(createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
