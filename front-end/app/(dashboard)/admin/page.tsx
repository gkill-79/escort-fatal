import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, ShieldAlert, Euro, CheckCircle, TrendingUp } from "lucide-react";
import { fetchApi } from "@/lib/api-client";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login"); 

  let stats = { totalUsers: 0, totalEscorts: 0, pendingProfiles: 0, totalRevenues: 0 };
  try {
    stats = await fetchApi("/admin/stats", {
      headers: { 
        "x-user-id": session.user.id,
        "x-user-role": session.user.role
      }
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
  }

  const { totalUsers, totalEscorts, pendingProfiles, totalRevenues } = stats;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Tableau de Bord</h1>
        <p className="text-dark-400">Vue d'ensemble de l'activité de la plateforme.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-dark-800 border border-white/5 p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Euro className="w-16 h-16 text-emerald-500" />
          </div>
          <p className="text-dark-400 font-bold mb-1 uppercase tracking-wider text-xs">Revenus</p>
          <p className="text-3xl font-black text-white">{totalRevenues ?? 0} €</p>
          <div className="mt-4 flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
            <TrendingUp className="w-3 h-3" />
            <span>+12% vs mois dernier</span>
          </div>
        </div>

        <div className="bg-dark-800 border border-white/5 p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <ShieldAlert className="w-16 h-16 text-amber-500" />
          </div>
          <p className="text-dark-400 font-bold mb-1 uppercase tracking-wider text-xs">À Modérer</p>
          <p className="text-3xl font-black text-white">{pendingProfiles}</p>
          <div className="mt-4">
             <span className="bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ring-1 ring-amber-500/30">
               Urgent
             </span>
          </div>
        </div>

        <div className="bg-dark-800 border border-white/5 p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Users className="w-16 h-16 text-brand-500" />
          </div>
          <p className="text-dark-400 font-bold mb-1 uppercase tracking-wider text-xs">Escortes</p>
          <p className="text-3xl font-black text-white">{totalEscorts}</p>
          <div className="mt-4 flex items-center gap-1.5 text-brand-500 text-xs font-bold">
            <TrendingUp className="w-3 h-3" />
            <span>+5 cette semaine</span>
          </div>
        </div>

        <div className="bg-dark-800 border border-white/5 p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <CheckCircle className="w-16 h-16 text-blue-500" />
          </div>
          <p className="text-dark-400 font-bold mb-1 uppercase tracking-wider text-xs">Membres</p>
          <p className="text-3xl font-black text-white">{totalUsers}</p>
          <div className="mt-4 flex items-center gap-1.5 text-blue-500 text-xs font-bold">
            <TrendingUp className="w-3 h-3" />
            <span>Stable</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-dark-800 border border-white/5 rounded-3xl p-8">
           <h3 className="text-xl font-bold text-white mb-6">Actions Rapides</h3>
           <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-left border border-white/5 transition-colors group">
                 <p className="text-white font-bold group-hover:text-brand-500 transition-colors">Vider le cache</p>
                 <p className="text-dark-500 text-xs mt-1">Nettoyer les données temporaires</p>
              </button>
              <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-left border border-white/5 transition-colors group">
                 <p className="text-white font-bold group-hover:text-brand-500 transition-colors">Maintenance</p>
                 <p className="text-dark-500 text-xs mt-1">Activer le mode hors-ligne</p>
              </button>
           </div>
        </div>
        <div className="bg-dark-800 border border-white/5 rounded-3xl p-8">
           <h3 className="text-xl font-bold text-white mb-6">Journal d'Audit</h3>
           <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 text-sm">
                   <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                   <p className="text-dark-300 flex-1">Nouvel utilisateur enregistré : <span className="text-white font-medium">JeanDupont</span></p>
                   <span className="text-dark-500 text-xs">Il y a 5 min</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
