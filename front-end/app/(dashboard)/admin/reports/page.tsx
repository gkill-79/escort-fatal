import { fetchApi } from "@/lib/api-client";
import { dismissReport, banProfile } from "../actions";
import { formatTimeAgo } from "@/lib/utils";
import { ShieldAlert, Ban, XCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminReportsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  let pendingReports: any[] = [];
  try {
    pendingReports = await fetchApi("/admin/reports", {
      headers: { 
        "x-user-id": session.user.id,
        "x-user-role": session.user.role
      }
    });
  } catch (error) {
    console.error("Error fetching admin reports:", error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Signalements</h1>
        <p className="text-dark-400 mt-1">
          {pendingReports.length} rapports nécessitant une action immédiate.
        </p>
      </div>

      {pendingReports.length === 0 ? (
        <div className="bg-dark-800/50 border border-white/5 rounded-2xl p-12 text-center text-dark-300">
          <ShieldAlert className="w-12 h-12 mx-auto text-dark-600 mb-4" />
          <p>La communauté est saine. Aucun signalement en attente !</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingReports.map((report: any) => (
            <div key={report.id} className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 flex flex-col xl:flex-row justify-between gap-6">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                    {report.reason.replace("_", " ")}
                  </span>
                  <span className="text-dark-400 text-sm">Signalé par {report.reporter?.username || "Inconnu"}</span>
                  <span className="text-dark-600 text-xs">— {formatTimeAgo(new Date(report.createdAt))}</span>
                </div>

                <p className="text-dark-200 text-sm italic mb-4">
                  Détail: {report.details || "Pas de précisions fournies."}
                </p>

                <div className="text-sm font-medium text-white flex items-center gap-1">
                  Cible : 
                  <Link href={`/escorts/${report.profile?.slug}`} target="_blank" className="text-brand-400 hover:underline flex items-center gap-1">
                    {report.profile?.name} <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <form action={banProfile.bind(null, report.id, report.profileId)}>
                  <Button type="submit" variant="outline" className="text-red-400 border-red-500/50 hover:bg-red-500 hover:text-white">
                    <Ban className="w-4 h-4 mr-2" /> Suspendre le Profil
                  </Button>
                </form>

                <form action={dismissReport.bind(null, report.id)}>
                  <Button type="submit" variant="outline" className="text-dark-300 border-white/10 hover:bg-white/5">
                    <XCircle className="w-4 h-4 mr-2" /> Ignorer
                  </Button>
                </form>
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
