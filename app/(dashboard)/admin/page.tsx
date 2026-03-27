import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MessageCircleWarning, ShieldAlert, Users, TrendingUp } from "lucide-react";

export default async function AdminDashboardPage() {
  const pendingCommentsCount = await prisma.comment.count({
    where: { isApproved: false }
  });

  const pendingReportsCount = await prisma.report.count({
    where: { status: "PENDING" }
  });

  const pendingProfilesCount = await prisma.profile.count({
    where: { isApproved: false }
  });

  const activeProfilesCount = await prisma.profile.count({
    where: { isActive: true }
  });

  const totalMembersCount = await prisma.user.count({
    where: { role: "MEMBER" }
  });

  return (
    <>
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Vue d&apos;ensemble Admin</h1>
        <p className="text-dark-400 mt-2">Monitorez l&apos;activité de la plateforme et modérez les actions de vos utilisateurs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Commentaires en Attente */}
        <div className="bg-dark-800/80 border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-dark-300 mb-1">Avis en attente</p>
              <p className="text-4xl font-black text-white">{pendingCommentsCount}</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <MessageCircleWarning className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <Link href="/admin/comments" className="text-yellow-500 text-sm font-medium mt-4 inline-block hover:underline">
            Modérer →
          </Link>
        </div>

        {/* Signalements */}
        <div className="bg-dark-800/80 border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-dark-300 mb-1">Signalements</p>
              <p className="text-4xl font-black text-white">{pendingReportsCount}</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-xl">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <Link href="/admin/reports" className="text-red-400 text-sm font-medium mt-4 inline-block hover:underline">
             Traiter →
          </Link>
        </div>

        {/* Validations KYC */}
        <div className="bg-dark-800/80 border border-brand-500/20 rounded-2xl p-6 shadow-[0_0_30px_rgba(233,69,96,0.05)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-brand-300 mb-1">C.A.S Profils</p>
              <p className="text-4xl font-black text-white">{pendingProfilesCount}</p>
            </div>
            <div className="p-3 bg-brand-500/20 rounded-xl border border-brand-500/30">
              <Users className="w-6 h-6 text-brand-400" />
            </div>
          </div>
          <Link href="/admin/profiles" className="text-brand-400 text-sm font-bold mt-4 inline-block hover:text-brand-300 transition-colors">
            C.A.S Sécurité →
          </Link>
        </div>

        {/* Escortes Progressives */}
        <div className="bg-dark-800/80 border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-dark-300 mb-1">Profils Actifs</p>
              <p className="text-4xl font-black text-white">{activeProfilesCount}</p>
            </div>
            <div className="p-3 bg-white/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Membres inscrits */}
        <div className="bg-dark-800/80 border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-dark-300 mb-1">Membres Clients</p>
              <p className="text-4xl font-black text-white">{totalMembersCount}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
