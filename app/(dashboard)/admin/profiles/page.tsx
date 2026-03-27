import { prisma } from "@/lib/prisma";
import { approveProfile, rejectProfile } from "../actions";
import { formatTimeAgo } from "@/lib/utils";
import { Check, UserX, AlertTriangle, ExternalLink, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Vérification Identité — Escorte Fatal Admin",
};

export default async function AdminProfilesPage() {
  const pendingProfiles = await prisma.profile.findMany({
    where: { isApproved: false },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { email: true } },
      photos: {
        where: { isPrimary: true },
        take: 1
      }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">KYC - Approbation Profils</h1>
        <p className="text-dark-400 mt-1">
          {pendingProfiles.length} dossiers d'escortes en attente d'agrément (C.A.S).
        </p>
      </div>

      {pendingProfiles.length === 0 ? (
        <div className="bg-dark-800/50 border border-white/5 rounded-2xl p-12 text-center text-dark-300">
          <Check className="w-12 h-12 mx-auto text-green-500/80 mb-4" />
          <p>Tous les profils ont été traités ! L'entonnoir de sécurité est vide.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingProfiles.map((p: any) => (
            <div key={p.id} className="bg-dark-800 border border-white/10 rounded-2xl p-6 flex flex-col xl:flex-row justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-500" />
              
              <div className="flex gap-4 flex-1">
                 {/* ID / Photo */}
                 <div className="w-24 h-24 rounded-xl bg-dark-900 overflow-hidden flex items-center justify-center shrink-0 border border-white/5">
                   {p.photos[0]?.url ? (
                     <img src={p.photos[0].url} alt="Photo ID" className="w-full h-full object-cover" />
                   ) : (
                     <ImageIcon className="w-8 h-8 text-dark-500" />
                   )}
                 </div>

                 {/* Details */}
                 <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-white font-bold text-lg leading-none">{p.name}</span>
                      <span className="text-dark-500 text-xs">— Inscrite {formatTimeAgo(new Date(p.createdAt))}</span>
                    </div>

                    <p className="text-dark-400 text-sm mb-3">Email: <span className="text-white font-mono text-xs">{p.user.email}</span></p>

                    <div className="bg-dark-900 border border-white/5 p-3 rounded-lg text-xs text-dark-300 italic max-h-24 overflow-y-auto">
                      "{p.bio || "Pas de biographie renseignée..."}"
                    </div>
                 </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end justify-center gap-2 xl:min-w-[180px]">
                <form action={approveProfile.bind(null, p.id)} className="w-full">
                  <Button type="submit" fullWidth className="bg-green-600 hover:bg-green-700 text-white font-bold border-none shadow-[0_0_15px_rgba(22,163,74,0.3)]">
                    <Check className="w-4 h-4 mr-2" /> Approuver
                  </Button>
                </form>

                <form action={rejectProfile.bind(null, p.id)} className="w-full">
                  <Button type="submit" variant="outline" fullWidth className="text-red-400 border border-red-500/30 hover:bg-red-500/10">
                    <UserX className="w-4 h-4 mr-2" /> Rejeter
                  </Button>
                </form>

                <Link href={`/escorts/${p.slug}`} target="_blank" className="text-[10px] text-dark-500 hover:text-white flex items-center gap-1 mt-2 transition-colors">
                  <ExternalLink className="w-3 h-3" /> Voir le profil temporaire
                </Link>
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
