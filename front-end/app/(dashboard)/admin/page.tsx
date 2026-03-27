import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, ShieldAlert, Euro, CheckCircle } from "lucide-react";
import { fetchApi } from "@/lib/api-client";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/"); 

  const stats = await fetchApi("/v2/profiles/admin/stats", {
    headers: { "x-is-admin": "true" }
  });

  const { totalUsers, totalEscorts, pendingProfiles, totalRevenues } = stats;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400">Revenus</p>
            <Euro className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-white">{totalRevenues} €</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-amber-500">À Modérer</p>
            <ShieldAlert className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-white">{pendingProfiles}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400">Escortes</p>
            <Users className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-bold text-white">{totalEscorts}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400">Membres</p>
            <CheckCircle className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-white">{totalUsers}</p>
        </div>
      </div>
    </div>
  );
}
