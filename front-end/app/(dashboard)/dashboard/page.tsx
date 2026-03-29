import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { fetchApi } from "@/lib/api-client";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, Users, MessageSquare, Star, ArrowRight, TrendingUp } from "lucide-react";
import { RankingScore } from "@/components/features/dashboard/RankingScore";

export default async function DashboardOverviewPage() {
  const session = await auth();

  if (!session || session.user.role !== "ESCORT") {
    redirect("/login");
  }

  // Fetch escort's profile from the API
  let profile: any = null;
  try {
    profile = await fetchApi("/v2/profiles/me/stats", {
      headers: { "x-user-id": session.user.id }
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
  }

  if (!profile) {
    return (
      <div className="py-20 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Erreur : Profil introuvable</h3>
        <p className="text-dark-400">Assurez-vous d'avoir complété votre profil escorte.</p>
        <Link href="/register/escort" className="text-brand-400 hover:underline mt-4 inline-block">
          S'inscrire comme escorte
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* ─── Header & Status ──────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Bonjour, {profile.name}</h1>
          <p className="text-dark-400 mt-1">Gérez votre activité et vos performances sur la plateforme.</p>
        </div>
        
        <div className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold border ${profile.isApproved ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>
          {profile.isApproved ? (
            <><ShieldCheck className="w-5 h-5" /> En Ligne (Approuvé)</>
          ) : (
            <><ShieldAlert className="w-5 h-5" /> En attente de Validation Admin</>
          )}
        </div>
      </div>

      {/* ─── Metrics Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-dark-800/80 border border-white/5 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-brand-500/10 rounded-xl text-brand-400">
               <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{profile.viewCount}</p>
          <p className="text-sm font-medium text-dark-400">Vues du profil</p>
        </div>

        <div className="bg-dark-800/80 border border-white/5 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
               <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{profile._count.followers}</p>
          <p className="text-sm font-medium text-dark-400">Abonnés</p>
        </div>

        <div className="bg-dark-800/80 border border-white/5 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
               <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{profile._count.chatRooms}</p>
          <p className="text-sm font-medium text-dark-400">Conversations</p>
        </div>

        <div className="bg-dark-800/80 border border-white/5 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400">
               <Star className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{profile.ratingAvg > 0 ? profile.ratingAvg.toFixed(1) : "-"}</p>
          <p className="text-sm font-medium text-dark-400">{profile._count.comments} Avis validés</p>
        </div>

      </div>

      {/* ─── Ranking & Visibility ─────────────────────────────────── */}
      <RankingScore 
        score={profile.activityScore}
        lastActivityAt={profile.lastActivityAt}
        calendarUpdatedAt={profile.calendarUpdatedAt}
        averageResponseTime={profile.averageResponseTime}
      />

      {/* ─── Actions Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
         
         {/* Identity Prompt */}
         <div className="bg-gradient-to-br from-dark-800 to-dark-900 border border-white/10 rounded-3xl p-6">
           <h3 className="text-xl font-bold text-white mb-2">Compléter mon identité</h3>
           <p className="text-dark-300 text-sm mb-6">Ajoutez vos services, vos tarifs, et renseignez votre ville pour apparaître dans l'annuaire géographique local.</p>
           <Link href="/dashboard/settings" className="flex items-center gap-2 text-sm font-bold text-brand-400 hover:text-brand-300 transition-colors">
              Mettre à jour <ArrowRight className="w-4 h-4" />
           </Link>
         </div>

         {/* Visibility Upgrade Prompt */}
         <div className="bg-gradient-to-br from-brand-900/30 to-brand-800/10 border border-brand-500/20 rounded-3xl p-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-10">
              <Star className="w-24 h-24" />
           </div>
           <h3 className="text-xl font-bold text-white mb-2 relative">Boost de Visibilité</h3>
           <p className="text-dark-300 text-sm mb-6 relative">Souscrivez au Badge Top Girl ou injectez un Boost sur votre compte pour dominer la page d'accueil de votre ville.</p>
           <Link href="/dashboard/billing" className="flex items-center gap-2 text-sm font-bold text-brand-400 hover:text-brand-300 transition-colors relative">
              Voir les offres <ArrowRight className="w-4 h-4" />
           </Link>
         </div>

      </div>

    </div>
  );
}
