import { prisma } from "@/lib/prisma";
import { approvePhoto, rejectAndDeletePhoto } from "../actions";
import { formatTimeAgo } from "@/lib/utils";
import { Check, Trash2, Images, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Modération des Médias — Escorte Fatal Admin",
};

export default async function AdminMediaPage() {
  const pendingPhotos = await prisma.profilePhoto.findMany({
    where: { isApproved: false },
    orderBy: { createdAt: "asc" },
    take: 50,
    include: {
      profile: {
        select: { name: true, slug: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Modération des Médias
        </h1>
        <p className="text-dark-400 mt-1">
          {pendingPhotos.length} photo{pendingPhotos.length !== 1 ? "s" : ""} en
          attente de validation.
        </p>
      </div>

      {pendingPhotos.length === 0 ? (
        <div className="bg-dark-800/50 border border-white/5 rounded-2xl p-12 text-center text-dark-300">
          <Images className="w-12 h-12 mx-auto text-dark-600 mb-4" />
          <p>Aucun média en attente. La file est vide !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingPhotos.map((photo: any) => (
            <div
              key={photo.id}
              className="bg-dark-800 border border-white/10 rounded-2xl overflow-hidden flex flex-col group"
            >
              {/* Photo Preview */}
              <div className="relative aspect-[4/3] bg-dark-900 overflow-hidden">
                <img
                  src={photo.url}
                  alt={`Photo de ${photo.profile.name}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                    EN ATTENTE
                  </span>
                </div>
              </div>

              {/* Info + Actions */}
              <div className="p-4 flex-1 flex flex-col gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/escorts/${photo.profile.slug}`}
                      target="_blank"
                      className="text-white font-semibold text-sm hover:text-brand-400 transition-colors flex items-center gap-1"
                    >
                      {photo.profile.name}
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </Link>
                    <span className="text-dark-500 text-xs">
                      {formatTimeAgo(new Date(photo.createdAt))}
                    </span>
                  </div>
                  {photo.sizeBytes && (
                    <p className="text-dark-500 text-xs mt-0.5">
                      {(photo.sizeBytes / 1024).toFixed(0)} Ko
                      {photo.width && photo.height
                        ? ` — ${photo.width}×${photo.height}`
                        : ""}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 mt-auto">
                  <form
                    action={approvePhoto.bind(null, photo.id)}
                    className="flex-1"
                  >
                    <Button
                      type="submit"
                      fullWidth
                      className="bg-green-600/90 hover:bg-green-600 text-white border-none text-sm shadow-[0_0_10px_rgba(22,163,74,0.2)]"
                    >
                      <Check className="w-4 h-4 mr-1.5" />
                      Approuver
                    </Button>
                  </form>
                  <form action={rejectAndDeletePhoto.bind(null, photo.id)}>
                    <Button
                      type="submit"
                      variant="outline"
                      className="text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300 px-3"
                      title="Rejeter et supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
